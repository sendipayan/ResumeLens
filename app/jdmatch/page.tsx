"use client";

import axios from "axios";
import {
  ChangeEvent,
  Dispatch,
  DragEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { type UploadResumeActionResult, type UploadedResume } from "@/lib/resume-upload";
import {
  type StoredAchievement,
  type StoredProjectFeedback,
  type StoredRecommendation,
  type StoredSkillCoverage,
  useRecommendationJobsStore,
} from "@/lib/stores/recommendation-jobs-store";

type NormalizedSkillCoverage = {
  coverage_score: number;
  matched_count: number;
  total_role_skills: number;
  matched: string[];
  missing_skills: string[];
};

type NormalizedProjectFeedback = {
  semantic_score: number;
  skills: string[];
  missing: string[];
  match_score: number;
  final_score: number;
};

type NormalizedAchievement = {
  final_score: number;
  semantic_impact: number;
  relevance: number;
  leadership: number;
  prestige: number;
  comp_bonus: number;
  quant_bonus: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const JDMATCH_API_URL = BACKEND_URL ? `${BACKEND_URL}/jdmatch` : "";
type JDMatchErrorPayload = {
  detail?: string;
  error?: string;
  message?: string;
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];

const normalizeSkillCoverage = (
  coverage?: StoredSkillCoverage,
): NormalizedSkillCoverage => ({
  coverage_score: toNumber(coverage?.coverage_score),
  matched_count: toNumber(coverage?.matched_count),
  total_role_skills: toNumber(coverage?.total_role_skills),
  matched: toStringArray(coverage?.matched),
  missing_skills: toStringArray(coverage?.missing_skills),
});

const normalizeProjectFeedback = (
  project?: StoredProjectFeedback,
): NormalizedProjectFeedback => ({
  semantic_score: toNumber(project?.semantic_score),
  skills: toStringArray(project?.skills),
  missing: toStringArray(project?.missing),
  match_score: toNumber(project?.match_score),
  final_score: toNumber(project?.final_score),
});

const normalizeAchievement = (
  achievement?: StoredAchievement,
): NormalizedAchievement => ({
  final_score: toNumber(achievement?.final_score),
  semantic_impact: toNumber(achievement?.semantic_impact),
  relevance: toNumber(achievement?.relevance),
  leadership: toNumber(achievement?.leadership),
  prestige: toNumber(achievement?.prestige),
  comp_bonus: toNumber(achievement?.comp_bonus),
  quant_bonus: toNumber(achievement?.quant_bonus),
});

const resumeDesignTips = [
  {
    title: "Keep a clear hierarchy",
    description:
      "Use consistent headings, spacing, and bolding so recruiters can scan in seconds.",
  },
  {
    title: "Quantify impact",
    description:
      "Add metrics like percentages, revenue, time saved, or scale to each major bullet.",
  },
  {
    title: "Tailor for the role",
    description:
      "Mirror keywords from the job description in your skills and experience.",
  },
  {
    title: "Stay ATS-friendly",
    description: "Avoid tables, text boxes, and images that can break parsing.",
  },
  {
    title: "Lead with recent work",
    description:
      "Put the most recent, relevant experience first; keep older roles shorter.",
  },
  {
    title: "Keep bullets crisp",
    description:
      "Aim for 1-2 lines per bullet with action verbs and clear outcomes.",
  },
];

const isPdf = (file: File) => {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return true;

  const type = file.type.toLowerCase();
  if (!type || type === "application/octet-stream") return true;

  const allowedTypes = new Set([
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
  ]);

  return allowedTypes.has(type);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatScore = (score: number) => score.toFixed(2);

const getScoreStatusClass = (score: number) => {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 45) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const uploadResume = async (
  file: File,
  source: "analyze" | "ats" | "jdmatch",
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source", source);

  const response = await axios.postForm<UploadResumeActionResult>(
    "/api/upload-resume",
    formData,
  );
  if (!response.data.success) {
    throw new Error(
      response.data.error ?? "Failed to upload resume to Cloudinary.",
    );
  }

  return response.data.upload;
};
const normalizeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function JDPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(
    null,
  );
  const [jobTitle, setJobTitle] = useState("");
  const [primarySkills, setPrimarySkills] = useState<string[]>([]);
  const [secondarySkills, setSecondarySkills] = useState<string[]>([]);
  const [showPrimarySkillInput, setShowPrimarySkillInput] = useState(false);
  const [showSecondarySkillInput, setShowSecondarySkillInput] = useState(false);
  const [primarySkillDraft, setPrimarySkillDraft] = useState("");
  const [secondarySkillDraft, setSecondarySkillDraft] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [showWakeUpNotice, setShowWakeUpNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const activeUploadIdRef = useRef(0);
  const wakeUpTimeoutRef = useRef<number | null>(null);
  const storedRecommendation = useRecommendationJobsStore(
    (state) => state.jdMatchRecommendation,
  );
  const jdMatchMissingSections = useRecommendationJobsStore(
    (state) => state.jdMatchMissingSections,
  );
  const setJDMatchRecommendation = useRecommendationJobsStore(
    (state) => state.setJDMatchRecommendation,
  );
  const setJDMatchMissingSections = useRecommendationJobsStore(
    (state) => state.setJDMatchMissingSections,
  );

  useEffect(() => {
    return () => {
      if (wakeUpTimeoutRef.current) {
        clearTimeout(wakeUpTimeoutRef.current);
      }
    };
  }, []);

  const scheduleWakeUpNotice = () => {
    if (wakeUpTimeoutRef.current) {
      clearTimeout(wakeUpTimeoutRef.current);
    }
    setShowWakeUpNotice(false);
    wakeUpTimeoutRef.current = window.setTimeout(() => {
      setShowWakeUpNotice(true);
    }, 5000);
  };

  const clearWakeUpNotice = () => {
    if (wakeUpTimeoutRef.current) {
      clearTimeout(wakeUpTimeoutRef.current);
      wakeUpTimeoutRef.current = null;
    }
    setShowWakeUpNotice(false);
  };

  const handleNewFile = async (file: File | null) => {
    if (!file) return;

    if (!isPdf(file)) {
      setErrorMessage(
        "Only PDF resumes are supported. Please upload a .pdf file.",
      );
      return;
    }

    setErrorMessage(null);
    setAnalyzedAt(null);
    setJDMatchRecommendation(null);
    setJDMatchMissingSections([]);
    setUploadedResume(null);
    setSelectedFile(file);

    const uploadId = activeUploadIdRef.current + 1;
    activeUploadIdRef.current = uploadId;
    setIsUploading(true);
    try {
      const upload = await uploadResume(file, "jdmatch");
      if (activeUploadIdRef.current !== uploadId) return;
      setUploadedResume(upload);
    } catch (error) {
      if (activeUploadIdRef.current !== uploadId) return;
      setSelectedFile(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload resume to Cloudinary.",
      );
    } finally {
      if (activeUploadIdRef.current !== uploadId) return;
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleNewFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleNewFile(event.dataTransfer.files?.[0] ?? null);
  };

  const clearSelectedFile = () => {
    activeUploadIdRef.current += 1;
    setSelectedFile(null);
    setUploadedResume(null);
    setErrorMessage(null);
    setAnalyzedAt(null);
    setJDMatchRecommendation(null);
    setJDMatchMissingSections([]);
    setIsUploading(false);
    setIsDragging(false);
  };

  const addSkill = (
    draftValue: string,
    existingSkills: string[],
    setSkills: Dispatch<SetStateAction<string[]>>,
    setDraft: Dispatch<SetStateAction<string>>,
  ) => {
    const cleanedSkill = draftValue.trim();
    const normalized = normalizeToken(cleanedSkill);

    if (!normalized) return;

    const alreadyExists = existingSkills.some(
      (skill) => normalizeToken(skill) === normalized,
    );

    if (!alreadyExists) {
      setSkills((prevSkills) => [...prevSkills, cleanedSkill]);
    }
    setDraft("");
  };

  const removeSkill = (
    skillToRemove: string,
    setSkills: Dispatch<SetStateAction<string[]>>,
  ) => {
    const normalizedToRemove = normalizeToken(skillToRemove);
    setSkills((prevSkills) =>
      prevSkills.filter(
        (skill) => normalizeToken(skill) !== normalizedToRemove,
      ),
    );
  };

  const runJDMatch = async () => {
    if (!selectedFile) {
      setErrorMessage("Upload a resume PDF first before running JD Match.");
      return;
    }

    if (isUploading) {
      setErrorMessage("Your resume is still uploading to Cloudinary.");
      return;
    }

    if (!uploadedResume) {
      setErrorMessage("Resume upload failed. Please upload the PDF again.");
      return;
    }

    if (
      !jobTitle.trim() ||
      primarySkills.length === 0 ||
      !jobDescription.trim()
    ) {
      setErrorMessage(
        "Please fill job title, primary skills, and job description.",
      );
      return;
    }

    if (!JDMATCH_API_URL) {
      setErrorMessage(
        "Missing NEXT_PUBLIC_BACKEND_URL. Add it to .env and restart the dev server.",
      );
      return;
    }

    setErrorMessage(null);
    setIsMatching(true);
    setAnalyzedAt(null);
    setJDMatchRecommendation(null);
    setJDMatchMissingSections([]);
    scheduleWakeUpNotice();

    try {
      const response = await axios.post<{
        recommendations?: StoredRecommendation[];
        missing_sections?: unknown;
      }>(JDMATCH_API_URL, {
        j_title: jobTitle.trim(),
        prim_skills: primarySkills,
        secon_skills: secondarySkills,
        j_resp: jobDescription.trim(),
        resume_url: uploadedResume.secureUrl,
      });
      const recommendation = response.data.recommendations?.[0];
      const missingSections = toStringArray(response.data.missing_sections);

      if (!recommendation || typeof recommendation !== "object") {
        throw new Error("JD Match API returned an invalid response.");
      }

      setJDMatchRecommendation(recommendation);
      setJDMatchMissingSections(missingSections);
      setAnalyzedAt(new Date().toLocaleTimeString());
    } catch (error) {
      setJDMatchRecommendation(null);
      setJDMatchMissingSections([]);

      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as
          | string
          | JDMatchErrorPayload
          | undefined;
        const message =
          typeof apiError === "string"
            ? apiError
            : (apiError?.detail ?? apiError?.error ?? apiError?.message);
        setErrorMessage(
          message?.trim() || "Failed to fetch data from /jdmatch.",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch data from /jdmatch.",
        );
      }
    } finally {
      clearWakeUpNotice();
      setIsMatching(false);
    }
  };

  const activeRecommendation = storedRecommendation;
  const activeRecommendationTitle =
    activeRecommendation?.Title?.trim() || jobTitle.trim();
  const activeRecommendationScore = toNumber(activeRecommendation?.score);
  const activePrimarySkill = normalizeSkillCoverage(
    (activeRecommendation?.primary_skill ??
      activeRecommendation?.["primary_skills"]) as StoredSkillCoverage,
  );
  const activeSecondarySkill = normalizeSkillCoverage(
    (activeRecommendation?.secondry_skill ??
      activeRecommendation?.["secondary_skill"] ??
      activeRecommendation?.["secondary_skills"]) as StoredSkillCoverage,
  );
  const activeProject = normalizeProjectFeedback(
    (activeRecommendation?.project ??
      activeRecommendation?.projects) as StoredProjectFeedback,
  );
  const activeAchievement = normalizeAchievement(
    (activeRecommendation?.achievment ??
      activeRecommendation?.["achievement"]) as StoredAchievement,
  );
  const activeMissingSections =
    jdMatchMissingSections.length > 0
      ? jdMatchMissingSections
      : toStringArray(
          activeRecommendation?.missing_sections ??
            activeRecommendation?.["missingSections"],
        );
  const activeExperienceScore = toNumber(
    activeRecommendation?.experience?.score,
  );
  const activeCertificatesScore = toNumber(
    activeRecommendation?.certificates?.final_score ??
      (activeRecommendation?.["certificate"] as { final_score?: number | null })
        ?.final_score,
  );

  const roleSectionScores = activeRecommendation
    ? [
        { label: "Overall JD Match", value: activeRecommendationScore },
        {
          label: "Primary Skill Coverage",
          value: activePrimarySkill.coverage_score,
        },
        {
          label: "Secondary Skill Coverage",
          value: activeSecondarySkill.coverage_score,
        },
        { label: "Projects", value: activeProject.final_score },
        { label: "Experience", value: activeExperienceScore },
        {
          label: "Achievement",
          value: activeAchievement.final_score,
        },
        {
          label: "Certificates",
          value: activeCertificatesScore,
        },
      ]
    : [];

  return (
    <main className="relative z-10 min-h-screen w-full">
      <section className="mx-auto w-[86%] pb-10 pt-24 lg:pb-16 lg:pt-28">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            JD Match
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Match your resume against a custom job description.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Upload your resume, add job details, and get an instant fit score
            with skill gap feedback.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="self-start border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Resume + Job Details
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Use the same PDF upload flow as Analyze page and provide job
              requirements below.
            </p>

            {!selectedFile ? (
              <label
                htmlFor="jd-resume-upload"
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`mt-4 block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  isDragging
                    ? "border-foreground bg-foreground/10"
                    : "border-border bg-background/50 hover:border-foreground/60"
                }`}
              >
                <input
                  id="jd-resume-upload"
                  type="file"
                  accept="application/pdf,application/x-pdf,application/acrobat,application/octet-stream,.pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <p className="text-sm font-semibold text-foreground sm:text-base">
                  Drag and drop your PDF resume here
                </p>
                <p className="mt-1 text-xs text-foreground/70 sm:text-sm">
                  or click to browse files
                </p>
              </label>
            ) : (
              <div className="relative mt-4 border border-border bg-background/55 p-4 pr-10">
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  aria-label="Remove selected PDF"
                  className="absolute right-2 top-2 h-7 w-7 rounded-full border border-border text-sm font-semibold leading-none text-foreground transition-colors hover:bg-foreground/10"
                >
                  X
                </button>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                  Selected File
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-foreground">
                  <p className="truncate font-medium">{selectedFile.name}</p>
                  <p className="shrink-0 text-foreground/70">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {isUploading ? (
                  <p className="mt-2 text-xs text-foreground/70">
                    Uploading resume to Cloudinary...
                  </p>
                ) : uploadedResume ? (
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    Stored in Cloudinary.
                  </p>
                ) : null}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="job-title"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60"
                >
                  Job Title
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="mt-2 w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="primary-skills"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60"
                >
                  Primary Skills
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {primarySkills.map((skill) => (
                    <span
                      key={`primary-${normalizeToken(skill)}`}
                      className="relative border border-border bg-background/70 px-3 py-1 text-md text-foreground"
                    >
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, setPrimarySkills)}
                        aria-label={`Remove ${skill}`}
                        className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border border-border bg-background text-[10px] leading-none text-foreground hover:bg-foreground/10"
                      >
                        x
                      </button>
                      {skill}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowPrimarySkillInput((prev) => !prev)}
                    aria-label="Add primary skill"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-sm font-semibold text-foreground hover:bg-foreground/10"
                  >
                    +
                  </button>
                </div>
                {showPrimarySkillInput && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      id="primary-skills"
                      type="text"
                      value={primarySkillDraft}
                      onChange={(event) =>
                        setPrimarySkillDraft(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill(
                            primarySkillDraft,
                            primarySkills,
                            setPrimarySkills,
                            setPrimarySkillDraft,
                          );
                        }
                      }}
                      placeholder="Type a primary skill"
                      className="w-full max-w-[300px] border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        addSkill(
                          primarySkillDraft,
                          primarySkills,
                          setPrimarySkills,
                          setPrimarySkillDraft,
                        )
                      }
                      className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-50"
                      disabled={!primarySkillDraft.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrimarySkillDraft("");
                        setShowPrimarySkillInput(false);
                      }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="secondary-skills"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60"
                >
                  Secondary Skills
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {secondarySkills.map((skill) => (
                    <span
                      key={`secondary-${normalizeToken(skill)}`}
                      className="relative border border-border bg-background/70 px-3 py-1 text-md text-foreground"
                    >
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, setSecondarySkills)}
                        aria-label={`Remove ${skill}`}
                        className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full border border-border bg-background text-[10px] leading-none text-foreground hover:bg-foreground/10"
                      >
                        x
                      </button>
                      {skill}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowSecondarySkillInput((prev) => !prev)}
                    aria-label="Add secondary skill"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/60 text-sm font-semibold text-foreground hover:bg-foreground/10"
                  >
                    +
                  </button>
                </div>
                {showSecondarySkillInput && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      id="secondary-skills"
                      type="text"
                      value={secondarySkillDraft}
                      onChange={(event) =>
                        setSecondarySkillDraft(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill(
                            secondarySkillDraft,
                            secondarySkills,
                            setSecondarySkills,
                            setSecondarySkillDraft,
                          );
                        }
                      }}
                      placeholder="Type a secondary skill"
                      className="w-full max-w-[300px] border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        addSkill(
                          secondarySkillDraft,
                          secondarySkills,
                          setSecondarySkills,
                          setSecondarySkillDraft,
                        )
                      }
                      className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-50"
                      disabled={!secondarySkillDraft.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSecondarySkillDraft("");
                        setShowSecondarySkillInput(false);
                      }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="job-description"
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60"
                >
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste full job description here..."
                  className="mt-2 min-h-[140px] w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={runJDMatch}
              disabled={
                !selectedFile ||
                !uploadedResume ||
                isUploading ||
                isMatching ||
                primarySkills.length === 0 ||
                jobDescription.trim() === "" ||
                jobTitle.trim() === ""
              }
              className="mt-5 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? "Uploading Resume..."
                : isMatching
                  ? "Matching Resume..."
                  : "Generate JD Match"}
            </button>
            {showWakeUpNotice && isMatching && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Waking up the model... this can take a 30 sec or more on first
                request.
              </p>
            )}

            {errorMessage && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="self-start border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Recommendation Result
            </h2>

            {!activeRecommendation ? (
              <div className="mt-4 border border-border bg-background/55 p-6 text-center">
                <p className="text-sm text-foreground/75">
                  Add your resume and JD details, then click{" "}
                  <span className="font-semibold">Generate JD Match</span> to
                  see score breakdown and skill feedback.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="border border-border bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                    Top Recommendation
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                      {activeRecommendationTitle || "JD Match"}
                    </h3>
                    <p className="text-3xl font-bold text-foreground">
                      {formatScore(activeRecommendationScore)}%
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-foreground/75">
                    Choose any role below to see individual role summary and
                    feedback sections.
                  </p>
                  <p className="mt-2 text-xs text-foreground/60">
                    Analyzed at {analyzedAt ?? "Recently generated"}
                  </p>
                </div>

                {activeRecommendation && (
                  <>
                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Role Summary
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                        <span className="font-semibold">
                          {activeRecommendation.Title}
                        </span>{" "}
                        has an overall recommendation score of{" "}
                        <span
                          className={`font-semibold ${getScoreStatusClass(activeRecommendationScore)}`}
                        >
                          {formatScore(activeRecommendationScore)}%
                        </span>
                        . Primary skill coverage is{" "}
                        <span className="font-semibold">
                          {formatScore(activePrimarySkill.coverage_score)}%
                        </span>{" "}
                        and secondary skill coverage is{" "}
                        <span className="font-semibold">
                          {formatScore(activeSecondarySkill.coverage_score)}%
                        </span>
                        .
                      </p>
                    </div>

                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Missing Sections
                      </p>
                      <p className="mt-2 text-xs text-foreground/70">
                        Sections expected for this role but not found in the
                        resume.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeMissingSections.length > 0 ? (
                          activeMissingSections.map((section) => (
                            <span
                              key={section}
                              className="border border-border bg-background/55 px-2 py-1 text-xs text-foreground/80"
                            >
                              {section}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-foreground/70">
                            No missing sections detected.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Skill Match Feedback
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          {
                            label: "Primary Skills",
                            data: activePrimarySkill,
                          },
                          {
                            label: "Secondary Skills",
                            data: activeSecondarySkill,
                          },
                        ].map((skillBlock) => (
                          <div
                            key={skillBlock.label}
                            className="border border-border bg-background/55 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {skillBlock.label}
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {formatScore(skillBlock.data.coverage_score)}%
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-foreground/70">
                              Matched {skillBlock.data.matched_count}/
                              {skillBlock.data.total_role_skills} role skills
                            </p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                              <div
                                className="h-full bg-foreground"
                                style={{
                                  width: `${Math.min(skillBlock.data.coverage_score, 100)}%`,
                                }}
                              />
                            </div>

                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                              Matched
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {skillBlock.data.matched.map((skill) => (
                                <span
                                  key={`${skillBlock.label}-matched-${skill}`}
                                  className="border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                              Missing
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {skillBlock.data.missing_skills.length > 0 ? (
                                skillBlock.data.missing_skills.map((skill) => (
                                  <span
                                    key={`${skillBlock.label}-missing-${skill}`}
                                    className="border border-border bg-background/40 px-2 py-1 text-xs text-foreground/70"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-foreground/70">
                                  No missing skills.
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Section Score Feedback
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {roleSectionScores.map((item) => (
                          <div
                            key={item.label}
                            className="border border-border bg-background/55 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-foreground">
                                {item.label}
                              </p>
                              <p
                                className={`text-sm font-bold ${getScoreStatusClass(item.value)}`}
                              >
                                {formatScore(item.value)}%
                              </p>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                              <div
                                className="h-full bg-foreground"
                                style={{
                                  width: `${Math.min(item.value, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border border-border bg-background/55 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">
                          Achievement Breakdown
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-foreground/80 sm:grid-cols-4">
                          <p>
                            Semantic:{" "}
                            {formatScore(activeAchievement.semantic_impact)}%
                          </p>
                          <p>
                            Relevance:{" "}
                            {formatScore(activeAchievement.relevance)}%
                          </p>
                          <p>
                            Leadership:{" "}
                            {formatScore(activeAchievement.leadership)}%
                          </p>
                          <p>
                            Prestige: {formatScore(activeAchievement.prestige)}%
                          </p>
                          <p>
                            Comp Bonus:{" "}
                            {formatScore(activeAchievement.comp_bonus)}%
                          </p>
                          <p>
                            Quant Bonus:{" "}
                            {formatScore(activeAchievement.quant_bonus)}%
                          </p>
                        </div>
                      </div>

                      <div className="w-full border border-border p-3 ">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/60">
                          Project Feedback
                        </p>
                        <div className="w-full lg:pr-10 flex flex-col md:flex-row items-start md:items-center justify-between">
                          <p className="mt-1 text-xs text-foreground/80">
                            Final Score:{" "}
                            {formatScore(activeProject.final_score)}%
                          </p>
                          <p className="mt-2 text-xs text-foreground/80">
                            Semantic Score:{" "}
                            {formatScore(activeProject.semantic_score)}%
                          </p>

                          <p className="mt-1 text-xs text-foreground/80">
                            Match Score:{" "}
                            {formatScore(activeProject.match_score)}%
                          </p>
                        </div>

                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/60">
                          Project Skills
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {activeProject.skills.map((skill) => (
                            <span
                              key={`project-skill-${skill}`}
                              className="border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/60">
                          Missing In Projects
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {activeProject.missing.length > 0 ? (
                            activeProject.missing.map((skill, index) => (
                              <span
                                key={`project-missing-${skill}-${index}`}
                                className="border border-border bg-background/40 px-2 py-1 text-xs text-foreground/70"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-foreground/70">
                              No missing sections detected.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full border border-border p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/60">
                          Experience Feedback
                        </p>
                        <p className="mt-2 text-xs text-foreground/80">
                          Experience Score: {formatScore(activeExperienceScore)}
                          %
                        </p>
                        <p className="mt-2 text-xs text-foreground/70">
                          Add quantified impact and role-specific work examples
                          to improve this section.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Resume Design Tips
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Quick wins to improve clarity, ATS parsing, and recruiter scanning.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumeDesignTips.map((tip) => (
              <div
                key={tip.title}
                className="border border-border bg-background/55 p-3"
              >
                <p className="text-sm font-semibold text-foreground">
                  {tip.title}
                </p>
                <p className="mt-2 text-xs text-foreground/70">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
