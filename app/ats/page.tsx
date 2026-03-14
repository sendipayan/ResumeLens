"use client";

import axios from "axios";
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  type UploadResumeActionResult,
  type UploadedResume,
} from "@/lib/resume-upload";
import { type AtsResult, useAtsStore } from "@/lib/stores/ats-store";

type AtsResponse = {
  ATS_score?: number;
  section_score?: number;
  contact_score?: number;
  formating_score?: number;
  issues?: string[];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const ATS_API_URL = BACKEND_URL ? `${BACKEND_URL}/ats` : "";
type AtsErrorPayload = {
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

const normalizeAtsResponse = (payload: AtsResponse): AtsResult => ({
  ATS_score: toNumber(payload.ATS_score),
  section_score: toNumber(payload.section_score),
  contact_score: toNumber(payload.contact_score),
  formating_score: toNumber(
    payload.formating_score ??
      (payload as { formatting_score?: number }).formatting_score,
  ),
  issues: toStringArray(payload.issues),
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

export default function AtsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWakeUpNotice, setShowWakeUpNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeUploadIdRef = useRef(0);
  const wakeUpTimeoutRef = useRef<number | null>(null);
  const atsResult = useAtsStore((state) => state.atsResult);
  const analyzedAt = useAtsStore((state) => state.analyzedAt);
  const setAtsResult = useAtsStore((state) => state.setAtsResult);
  const clearAtsResult = useAtsStore((state) => state.clearAtsResult);
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
    if (!file) {
      setErrorMessage("no file selected");
      return;
    }

    if (!isPdf(file)) {
      setErrorMessage(
        `Only PDF resumes are supported. Please upload a .pdf file. ${file}`,
      );
      return;
    }

    setErrorMessage(null);
    clearAtsResult();
    setUploadedResume(null);
    setSelectedFile(file);

    const uploadId = activeUploadIdRef.current + 1;
    activeUploadIdRef.current = uploadId;
    setIsUploading(true);
    try {
      const upload = await uploadResume(file, "ats");
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
    clearAtsResult();
    setErrorMessage(null);
    setIsUploading(false);
    setIsDragging(false);
  };

  const runAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage("Upload a resume PDF first to run the ATS check.");
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
    if (!ATS_API_URL) {
      setErrorMessage(
        "Missing NEXT_PUBLIC_BACKEND_URL. Add it to .env and restart the dev server.",
      );
      return;
    }

    setErrorMessage(null);
    clearAtsResult();
    setIsAnalyzing(true);
    scheduleWakeUpNotice();

    try {
      const response = await axios.post<AtsResponse>(ATS_API_URL, {
        resume_url: uploadedResume.secureUrl,
      });
      const normalized = normalizeAtsResponse(response.data);

      setAtsResult({
        result: normalized,
        analyzedAt: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      clearAtsResult();

      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as
          | string
          | AtsErrorPayload
          | undefined;
        const message =
          typeof apiError === "string"
            ? apiError
            : (apiError?.detail ?? apiError?.error ?? apiError?.message);
        setErrorMessage(
          message?.trim() || "Failed to fetch ATS score from /ats.",
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch ATS score from /ats.",
        );
      }
    } finally {
      clearWakeUpNotice();
      setIsAnalyzing(false);
    }
  };

  const scoreCards = atsResult
    ? [
        { label: "ATS Score", value: atsResult.ATS_score },
        { label: "Section Score", value: atsResult.section_score },
        { label: "Contact Score", value: atsResult.contact_score },
        { label: "Formatting Score", value: atsResult.formating_score },
      ]
    : [];

  return (
    <main className="relative z-10 min-h-screen w-full">
      <section className="mx-auto w-[86%] pb-10 pt-24 lg:pb-16 lg:pt-28">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            ATS Resume Check
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Upload your resume to get an ATS compatibility score.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            See section-level scores, contact completeness, and formatting
            issues that could impact automated parsing.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-6">
          <div className="self-start border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6 lg:overflow-y-auto">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Resume Input
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Upload via drag and drop or browse from your device.
            </p>

            {!selectedFile ? (
              <label
                htmlFor="ats-resume-upload"
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
                  id="ats-resume-upload"
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
                  ? "Running ATS Check..."
                  : "Generate ATS Report"}
            </button>
            {showWakeUpNotice && isAnalyzing && (
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
              ATS Result
            </h2>

            {!atsResult ? (
              <div className="mt-4 border border-border bg-background/55 p-6 text-center">
                <p className="text-sm text-foreground/75">
                  Upload a resume and click{" "}
                  <span className="font-semibold">Generate ATS Report</span> to
                  view ATS compatibility scores and issues.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="border border-border bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-foreground/60">
                    Overall ATS Score
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                      ATS Compatibility
                    </h3>
                    <p className="text-3xl font-bold text-foreground">
                      {formatScore(atsResult.ATS_score)}%
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-foreground/75">
                    Focus on the sections and formatting below to improve
                    parsing accuracy.
                  </p>
                  {analyzedAt && (
                    <p className="mt-2 text-xs text-foreground/60">
                      Analyzed at {analyzedAt}
                    </p>
                  )}
                </div>

                <div className="border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Score Breakdown
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {scoreCards.map((item) => (
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
                            style={{ width: `${Math.min(item.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Detected Issues
                  </p>
                  <p className="mt-2 text-xs text-foreground/70">
                    These items can lower ATS parsing accuracy.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
                    {atsResult.issues.length > 0 ? (
                      atsResult.issues.map((issue, index) => (
                        <li
                          key={`${issue}-${index}`}
                          className="border-l-2 border-foreground/30 pl-3"
                        >
                          {issue}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-foreground/70">
                        No critical issues detected.
                      </li>
                    )}
                  </ul>
                </div>
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
