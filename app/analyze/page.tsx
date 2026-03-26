"use client";

import axios from "axios";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type UploadResumeActionResult, type UploadedResume } from "@/lib/resume-upload";
import {
  type JobRecommendation,
  type StoredAchievement,
  type StoredProjectFeedback,
  type StoredRecommendation,
  type StoredSkillCoverage,
  useRecommendationJobsStore,
} from "@/lib/stores/recommendation-jobs-store";

const faqItems = [
  {
    question: "What does the resume analyzer check?",
    answer:
      "It evaluates your resume structure, skills, keywords, and role relevance to surface gaps that can reduce ATS performance.",
  },
  {
    question: "How is the ATS checker score calculated?",
    answer:
      "The score reflects keyword alignment, formatting compatibility, and role-specific relevance based on ATS-style scoring signals.",
  },
  {
    question: "Can I use the resume analyzer for different roles?",
    answer:
      "Yes. Upload once and review recommendations across roles to compare fit scores and missing skill coverage.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

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

type RecommendationResponse = {
  recommendations: StoredRecommendation[];
  jobs?: unknown;
  job_recommendations?: unknown;
  jobRecommendations?: unknown;
  missing_sections?: unknown;
};

type AnalysisResult = {
  recommendations: StoredRecommendation[];
  analyzedAt: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const SCORE_API_URL = BACKEND_URL ? `${BACKEND_URL}/score` : "";
type ScoreErrorPayload = {
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

const normalizeJobRecommendations = (
  payload: RecommendationResponse,
): JobRecommendation[] => {
  const rawJobs =
    payload.job_recommendations ?? payload.jobRecommendations ?? payload.jobs;
  if (!Array.isArray(rawJobs)) return [];

  return rawJobs
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const raw = item as {
        title?: unknown;
        Title?: unknown;
        tittle?: unknown;
        link?: unknown;
        url?: unknown;
        links?: unknown;
      };
      const titleSource = raw.title ?? raw.Title ?? raw.tittle;
      const title = typeof titleSource === "string" ? titleSource.trim() : "";
      if (!title) return null;

      const normalizedLinks = {
        optimized_query: "",
        google_jobs: "",
        linkedin: "",
        unstop: "",
        wellfound: "",
      };

      if (raw.links && typeof raw.links === "object") {
        const links = raw.links as Record<string, unknown>;
        normalizedLinks.optimized_query =
          typeof links.optimized_query === "string"
            ? links.optimized_query
            : "";
        normalizedLinks.google_jobs =
          typeof links.google_jobs === "string" ? links.google_jobs : "";
        normalizedLinks.linkedin =
          typeof links.linkedin === "string" ? links.linkedin : "";
        normalizedLinks.unstop =
          typeof links.unstop === "string" ? links.unstop : "";
        normalizedLinks.wellfound =
          typeof links.wellfound === "string" ? links.wellfound : "";
      }

      const fallbackSingleLink =
        typeof raw.link === "string"
          ? raw.link
          : typeof raw.url === "string"
            ? raw.url
            : "";
      if (!normalizedLinks.google_jobs && fallbackSingleLink) {
        normalizedLinks.google_jobs = fallbackSingleLink;
      }

      const hasAnyLink = Object.values(normalizedLinks).some(
        (value) => value.trim().length > 0,
      );
      if (!hasAnyLink) return null;

      return {
        title,
        links: normalizedLinks,
      } satisfies JobRecommendation;
    })
    .filter((job): job is JobRecommendation => job !== null);
};

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
  if (bytes < 5 * 1024) return `${bytes} B`;
  if (bytes < 5 * 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (5 * 1024 * 1024)).toFixed(2)} MB`;
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
  let safeFile: File;
  try {
    const buf = await file.arrayBuffer(); // forces provider to deliver bytes
    safeFile = new File([buf], file.name, {
      type: file.type || "application/pdf",
    });
  } catch {
    throw new Error(
      "This file provider blocked access. Please download the PDF locally first.",
    );
  }

  const formData = new FormData();
  formData.append("file", safeFile);
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
export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(
    null,
  );
  const [selectedRecommendationTitle, setSelectedRecommendationTitle] =
    useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWakeUpNotice, setShowWakeUpNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeUploadIdRef = useRef(0);
  const wakeUpTimeoutRef = useRef<number | null>(null);
  const storedRecommendations = useRecommendationJobsStore(
    (state) => state.recommendations,
  );
  const storedMissingSections = useRecommendationJobsStore(
    (state) => state.analyzeMissingSections,
  );
  const setRecommendationJobs = useRecommendationJobsStore(
    (state) => state.setRecommendationJobs,
  );
  const clearRecommendationJobs = useRecommendationJobsStore(
    (state) => state.clearRecommendationJobs,
  );
  const hasStoredRecommendations = storedRecommendations.length > 0;

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

  const showPreviousRecommendations = () => {
    if (!hasStoredRecommendations) return;

    setErrorMessage(null);
    setAnalysis({
      recommendations: storedRecommendations,
      analyzedAt: "Previously generated",
    });
    setSelectedRecommendationTitle(storedRecommendations[0]?.Title ?? "");
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
    setAnalysis(null);
    setUploadedResume(null);
    setSelectedRecommendationTitle("");
    clearRecommendationJobs();
    setSelectedFile(file);

    const uploadId = activeUploadIdRef.current + 1;
    activeUploadIdRef.current = uploadId;
    setIsUploading(true);
    try {
      const upload = await uploadResume(file, "analyze");
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
    setAnalysis(null);
    setUploadedResume(null);
    setSelectedRecommendationTitle("");
    clearRecommendationJobs();
    setErrorMessage(null);
    setIsUploading(false);
    setIsDragging(false);
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage("Upload a resume PDF first to generate recommendations.");
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
    if (!SCORE_API_URL) {
      setErrorMessage(
        "Missing NEXT_PUBLIC_BACKEND_URL. Add it to .env and restart the dev server.",
      );
      return;
    }

    setErrorMessage(null);
    setAnalysis(null);
    setSelectedRecommendationTitle("");
    clearRecommendationJobs();
    setIsAnalyzing(true);
    scheduleWakeUpNotice();

    try {
      const response = await axios.post<RecommendationResponse>(SCORE_API_URL, {
        resume_url: uploadedResume.secureUrl,
      });
      console.log(response);
      const rankedRecommendations = [...(response.data.recommendations ?? [])]
        .filter((item) => item?.Title)
        .sort((a, b) => toNumber(b.score) - toNumber(a.score));
      const missingSections = toStringArray(response.data.missing_sections);

      if (rankedRecommendations.length === 0) {
        throw new Error(
          "Scoring API returned no recommendations for this resume.",
        );
      }

      setAnalysis({
        recommendations: rankedRecommendations,
        analyzedAt: new Date().toLocaleTimeString(),
      });
      setRecommendationJobs({
        recommendations: rankedRecommendations,
        jobs: normalizeJobRecommendations(response.data),
        missingSections,
      });
      setSelectedRecommendationTitle(rankedRecommendations[0]?.Title ?? "");
    } catch (error) {
      setAnalysis(null);
      clearRecommendationJobs();

      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as
          | string
          | ScoreErrorPayload
          | undefined;
        const message =
          typeof apiError === "string"
            ? apiError
            : (apiError?.detail ?? apiError?.error ?? apiError?.message);
        setErrorMessage(
          message?.trim() || "Failed to fetch recommendations from /score.",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch recommendations from /score.",
        );
      }
    } finally {
      clearWakeUpNotice();
      setIsAnalyzing(false);
    }
  };

  const topRecommendation = analysis?.recommendations[0] ?? null;
  const activeRecommendation =
    analysis?.recommendations.find(
      (item) => item.Title === selectedRecommendationTitle,
    ) ??
    analysis?.recommendations[0] ??
    null;
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
  const activeResponsibilities = toStringArray(
    activeRecommendation?.Responsibilities ??
      activeRecommendation?.["responsibilities"],
  );
  const activeMissingSections =
    storedMissingSections.length > 0
      ? storedMissingSections
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
        { label: "Overall Recommendation", value: activeRecommendationScore },
        {
          label: "Primary Skill Coverage",
          value: activePrimarySkill.coverage_score,
        },
        {
          label: "Secondary Skill Coverage",
          value: activeSecondarySkill.coverage_score,
        },
        { label: "Projects", value: activeProject.match_score },
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
        <div className=" p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Resume Analyzer & ATS Checker
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Upload your resume and run our resume analyzer and ATS checker.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Select any recommended role to inspect responsibilities, skill
            coverage, and section-level score feedback powered by ATS insights.
          </p>
          <p className="mt-2 text-sm text-foreground/70 sm:text-base">
            Need a fast scan? Try the{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href="/ats">
              ATS checker
            </Link>{" "}
            or compare against a role in{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href="/jdmatch">
              JD Match
            </Link>
            .
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 ">
          <div className="self-start border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6 lg:overflow-y-auto">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Resume Input
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Upload via drag and drop or browse from your device.
            </p>

            {!selectedFile ? (
              <label
                htmlFor="resume-upload"
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
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
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

            <button
              type="button"
              onClick={() => void runAnalysis()}
              disabled={
                !selectedFile || !uploadedResume || isUploading || isAnalyzing
              }
              className="mt-5 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? "Uploading Resume..."
                : isAnalyzing
                  ? "Analyzing Resume..."
                  : "Generate Insights"}
            </button>
            {showWakeUpNotice && isAnalyzing && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Waking up the model... this can take a 30 sec or more on first
                request.
              </p>
            )}

            <button
              type="button"
              onClick={showPreviousRecommendations}
              disabled={!hasStoredRecommendations || isUploading || isAnalyzing}
              className="mt-3 w-full rounded-full border border-foreground bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              Show Previous Recommendation
            </button>

            {analysis && (
              <Link
                href="/jobs"
                className="mt-5 block w-full rounded-full border border-foreground bg-background px-5 py-2.5 text-center text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
              >
                View Related Jobs
              </Link>
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

            {!analysis ? (
              <div className="mt-4 border border-border bg-background/55 p-6 text-center">
                <p className="text-sm text-foreground/75">
                  Upload a resume and click{" "}
                  <span className="font-semibold">Generate Insights</span> to
                  view role recommendation scores and detailed feedback.
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
                      {topRecommendation?.Title}
                    </h3>
                    <p className="text-3xl font-bold text-foreground">
                      {topRecommendation
                        ? `${formatScore(toNumber(topRecommendation.score))}%`
                        : "-"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-foreground/75">
                    Choose any role below to see individual role summary and
                    feedback sections.
                  </p>
                  <p className="mt-2 text-xs text-foreground/60">
                    Analyzed at {analysis.analyzedAt}
                  </p>
                </div>

                <div className="border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Role Recommendation Scores
                  </p>
                  <label
                    htmlFor="recommended-role"
                    className="mt-3 block text-xs uppercase tracking-[0.15em] text-foreground/60"
                  >
                    Select Recommended Role
                  </label>
                  <select
                    id="recommended-role"
                    value={activeRecommendation?.Title ?? ""}
                    onChange={(event) =>
                      setSelectedRecommendationTitle(event.target.value)
                    }
                    className="mt-2 w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    {analysis.recommendations.map((item) => (
                      <option key={item.Title} value={item.Title}>
                        {item.Title} ({formatScore(toNumber(item.score))}%)
                      </option>
                    ))}
                  </select>

                  {activeRecommendation && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-sm text-foreground">
                        <p>{activeRecommendation.Title}</p>
                        <p className="font-semibold">
                          {formatScore(activeRecommendationScore)}%
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                        <div
                          className="h-full bg-foreground transition-[width]"
                          style={{
                            width: `${Math.min(activeRecommendationScore, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
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
                        Responsibilities
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
                        {activeResponsibilities.length > 0 ? (
                          activeResponsibilities.map((item) => (
                            <li
                              key={item}
                              className="border-l-2 border-foreground/30 pl-3"
                            >
                              {item}
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-foreground/70">
                            No responsibilities provided.
                          </li>
                        )}
                      </ul>
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
                          {activeProject.missing.map((skill, index) => (
                            <span
                              key={`project-missing-${skill}-${index}`}
                              className="border border-border bg-background/40 px-2 py-1 text-xs text-foreground/70"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="w-full border border-border p-3 ">
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
      <section className="relative z-10 mx-auto w-[86%] pb-12 lg:pb-16">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Resume analyzer and ATS checker questions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {faqItems.map((item) => (
            <div key={item.question} className="border border-border bg-background/65 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-foreground">{item.question}</h3>
              <p className="mt-2 text-sm text-foreground/80">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
