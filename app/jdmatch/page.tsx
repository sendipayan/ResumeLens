"use client";

import { ChangeEvent, Dispatch, DragEvent, SetStateAction, useRef, useState } from "react";
import { uploadResumeWithCloudinary } from "@/app/actions/upload-resume";
import { type UploadedResume } from "@/lib/resume-upload";

type SkillCoverage = {
  inputSkills: string[];
  matched: string[];
  missing: string[];
  coverageScore: number;
};

type JDMatchResult = {
  analyzedAt: string;
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  primarySkillCoverage: SkillCoverage;
  secondarySkillCoverage: SkillCoverage;
  strengths: string[];
  recommendations: string[];
};

const isPdf = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<JDMatchResult | null>(null);
  const activeUploadIdRef = useRef(0);

  const handleNewFile = async (file: File | null) => {
    if (!file) return;

    if (!isPdf(file)) {
      setErrorMessage(
        "Only PDF resumes are supported. Please upload a .pdf file.",
      );
      return;
    }

    setErrorMessage(null);
    setResult(null);
    setUploadedResume(null);
    setSelectedFile(file);

    const uploadId = activeUploadIdRef.current + 1;
    activeUploadIdRef.current = uploadId;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source", "jdmatch");

      const uploadResponse = await uploadResumeWithCloudinary(formData);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error);
      }

      if (activeUploadIdRef.current !== uploadId) return;
      setUploadedResume(uploadResponse.upload);
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
    setResult(null);
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
      prevSkills.filter((skill) => normalizeToken(skill) !== normalizedToRemove),
    );
  };

  const runJDMatch = () => {
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

    if (!jobTitle.trim() || primarySkills.length === 0 || !jobDescription.trim()) {
      setErrorMessage(
        "Please fill job title, primary skills, and job description.",
      );
      return;
    }

    setErrorMessage(null);
    setIsMatching(true);

    window.setTimeout(() => {
      const dummyPrimarySkills = primarySkills.length
        ? primarySkills
        : ["React", "TypeScript", "Node.js"];
      const dummySecondarySkills = secondarySkills.length
        ? secondarySkills
        : ["Git", "Communication", "Problem Solving"];

      setResult({
        analyzedAt: new Date().toLocaleTimeString(),
        overallScore: 95.8,
        titleScore: 94.2,
        descriptionScore: 93.9,
        primarySkillCoverage: {
          inputSkills: dummyPrimarySkills,
          matched: dummyPrimarySkills,
          missing: [],
          coverageScore: 96,
        },
        secondarySkillCoverage: {
          inputSkills: dummySecondarySkills,
          matched: dummySecondarySkills,
          missing: [],
          coverageScore: 92,
        },
        strengths: [
          "Strong overall profile fit for this role.",
          "Primary and secondary skill sets align well with job needs.",
          "Resume appears highly relevant for shortlisting.",
        ],
        recommendations: [
          "Keep current resume version for this role.",
          "Add one quantified project impact line to improve recruiter confidence.",
        ],
      });
      setIsMatching(false);
    }, 650);
  };

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
                  accept="application/pdf,.pdf"
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
                      onChange={(event) => setPrimarySkillDraft(event.target.value)}
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
              disabled={!selectedFile || !uploadedResume || isUploading || isMatching || primarySkills.length === 0 || jobDescription.trim()==="" || jobTitle.trim()===""}
              className="mt-5 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? "Uploading Resume..."
                : isMatching
                  ? "Matching Resume..."
                  : "Generate JD Match"}
            </button>

            {errorMessage && (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="self-start border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              JD Match Result
            </h2>

            {!result ? (
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
                    Overall Match
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                      {jobTitle}
                    </h3>
                    <p
                      className={`text-3xl font-bold ${getScoreStatusClass(result.overallScore)}`}
                    >
                      {formatScore(result.overallScore)}%
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-foreground/60">
                    Analyzed at {result.analyzedAt}
                  </p>
                </div>

                <div className="border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Score Breakdown
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      { label: "Overall JD Match", value: result.overallScore },
                      {
                        label: "Primary Skill Coverage",
                        value: result.primarySkillCoverage.coverageScore,
                      },
                      {
                        label: "Secondary Skill Coverage",
                        value: result.secondarySkillCoverage.coverageScore,
                      },
                      { label: "Job Title Relevance", value: result.titleScore },
                      {
                        label: "Job Description Relevance",
                        value: result.descriptionScore,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="border border-border bg-background/55 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-foreground">{item.label}</p>
                          <p
                            className={`text-sm font-bold ${getScoreStatusClass(item.value)}`}
                          >
                            {formatScore(item.value)}%
                          </p>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className="h-full bg-foreground"
                            style={{ width: `${Math.min(item.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
                        data: result.primarySkillCoverage,
                      },
                      {
                        label: "Secondary Skills",
                        data: result.secondarySkillCoverage,
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
                            {formatScore(skillBlock.data.coverageScore)}%
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-foreground/70">
                          Matched {skillBlock.data.matched.length}/
                          {skillBlock.data.inputSkills.length || 0} provided
                          skills
                        </p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                          <div
                            className="h-full bg-foreground"
                            style={{
                              width: `${Math.min(skillBlock.data.coverageScore, 100)}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Matched
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {skillBlock.data.matched.length > 0 ? (
                            skillBlock.data.matched.map((skill) => (
                              <span
                                key={`${skillBlock.label}-matched-${skill}`}
                                className="border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-foreground/70">
                              No matched skills yet.
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Missing
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {skillBlock.data.missing.length > 0 ? (
                            skillBlock.data.missing.map((skill) => (
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
                    Summary Output
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="border border-border bg-background/55 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">
                        Strengths
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-foreground/80">
                        {result.strengths.map((item) => (
                          <li key={item} className="border-l-2 border-foreground/30 pl-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-border bg-background/55 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">
                        Recommendations
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-foreground/80">
                        {result.recommendations.map((item) => (
                          <li key={item} className="border-l-2 border-foreground/30 pl-3">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
