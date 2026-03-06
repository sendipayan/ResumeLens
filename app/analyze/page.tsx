"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import Link from "next/link";

type SkillCoverage = {
  coverage_score: number;
  matched_count: number;
  total_role_skills: number;
  matched: string[];
  missing_skills: string[];
};

type Recommendation = {
  Title: string;
  score: number;
  Responsibilities: string[];
  primary_skill: SkillCoverage;
  secondry_skill: SkillCoverage;
  project: { score: number };
  experience: { score: number };
  achievment: {
    final_score: number;
    semantic_impact: number;
    relevance: number;
    leadership: number;
    prestige: number;
    comp_bonus: number;
    quant_bonus: number;
  };
  certificates: { final_score: number };
};

type RecommendationResponse = {
  recommendations: Recommendation[];
};

type AnalysisResult = {
  recommendations: Recommendation[];
  analyzedAt: string;
};

const TARGET_ROLE_OPTIONS = [
  "Software Developer",
  "Full Stack Developer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
];

const SAMPLE_RECOMMENDATION_RESPONSE: RecommendationResponse = {
  recommendations: [
    {
      Title: "Software Developer - Entry Level",
      score: 89,
      Responsibilities: [
        "Contribute to software development projects",
        "Write clean code in Java, Python, or C++",
        "Assist in developing web interfaces with HTML, CSS, JavaScript",
        "Participate in debugging and testing",
        "Collaborate in Agile sprints",
        "Learn from senior engineers and adapt to new technologies",
      ],
      primary_skill: {
        coverage_score: 80.0,
        matched_count: 4,
        total_role_skills: 5,
        matched: ["Python", "C++", "Javascript", "MySql"],
        missing_skills: ["java"],
      },
      secondry_skill: {
        coverage_score: 60.0,
        matched_count: 3,
        total_role_skills: 5,
        matched: ["HTML", "CSS", "Git"],
        missing_skills: ["problemsolving", "collaboration"],
      },
      project: { score: 90 },
      experience: { score: 85 },
      achievment: {
        final_score: 49.59000015258789,
        semantic_impact: 50.84000015258789,
        relevance: 40.5,
        leadership: 57.650001525878906,
        prestige: 26.489999771118164,
        comp_bonus: 0,
        quant_bonus: 25,
      },
      certificates: { final_score: 75 },
    },
    {
      Title: "Full Stack Developer - Entry Level",
      score: 48.710227966308594,
      Responsibilities: [
        "Develop end-to-end web applications",
        "Write clean code in JavaScript and Python",
        "Work with frontend frameworks like React or Angular",
        "Assist in building backend services using Node.js or Django",
        "Participate in testing, debugging, and Agile sprints",
        "Learn modern deployment and cloud practices",
      ],
      primary_skill: {
        coverage_score: 44.0,
        matched_count: 4,
        total_role_skills: 9,
        matched: ["Javascript", "ReactJs", "MySql", "NodeJs"],
        missing_skills: ["flask", "pythondjango", "nosql", "angular", "vuejs"],
      },
      secondry_skill: {
        coverage_score: 100.0,
        matched_count: 3,
        total_role_skills: 3,
        matched: ["HTML", "CSS", "Git"],
        missing_skills: [],
      },
      project: { score: 50.75090026855469 },
      experience: { score: 0 },
      achievment: {
        final_score: 52.150001525878906,
        semantic_impact: 50.84000015258789,
        relevance: 47.83000183105469,
        leadership: 57.650001525878906,
        prestige: 26.489999771118164,
        comp_bonus: 0,
        quant_bonus: 25,
      },
      certificates: { final_score: 0 },
    },
    {
      Title: "Web Developer",
      score: 45.2536506652832,
      Responsibilities: [
        "Assist in front-end development tasks",
        "Write basic HTML, CSS, and JavaScript code",
        "Develop small components using React or Angular",
        "Support backend API integration",
        "Participate in version control with Git/GitHub",
        "Learn responsive design principles",
        "Assist in testing and debugging",
      ],
      primary_skill: {
        coverage_score: 62.0,
        matched_count: 5,
        total_role_skills: 8,
        matched: ["Javascript", "MongoDB Atlas", "ReactJs", "MySql", "NodeJs"],
        missing_skills: ["restfulapis", "angular", "ajax"],
      },
      secondry_skill: {
        coverage_score: 50.0,
        matched_count: 4,
        total_role_skills: 8,
        matched: ["HTML", "CSS", "Git", "Github"],
        missing_skills: ["ux", "php", "responsivedesign", "ui"],
      },
      project: { score: 46.170597076416016 },
      experience: { score: 0 },
      achievment: {
        final_score: 50.7400016784668,
        semantic_impact: 50.84000015258789,
        relevance: 43.790000915527344,
        leadership: 57.650001525878906,
        prestige: 26.489999771118164,
        comp_bonus: 0,
        quant_bonus: 25,
      },
      certificates: { final_score: 0 },
    },
    {
      Title: "Frontend Developer - Entry Level",
      score: 41.54189682006836,
      Responsibilities: [
        "Build responsive and interactive web pages",
        "Implement UI designs",
        "Assist in basic testing and debugging",
        "Integrate frontend with backend APIs",
        "Participate in code reviews",
        "Collaborate with team members",
      ],
      primary_skill: {
        coverage_score: 40.0,
        matched_count: 2,
        total_role_skills: 5,
        matched: ["Javascript", "ReactJs"],
        missing_skills: ["vuejs", "angular", "tailwindcss"],
      },
      secondry_skill: {
        coverage_score: 60.0,
        matched_count: 3,
        total_role_skills: 5,
        matched: ["HTML", "CSS", "Git"],
        missing_skills: ["bootstrap", "browserdevelopertools"],
      },
      project: { score: 50.54759216308594 },
      experience: { score: 0 },
      achievment: {
        final_score: 52.70000076293945,
        semantic_impact: 50.84000015258789,
        relevance: 49.400001525878906,
        leadership: 57.650001525878906,
        prestige: 26.489999771118164,
        comp_bonus: 0,
        quant_bonus: 25,
      },
      certificates: { final_score: 0 },
    },
    {
      Title: "Backend Developer - Entry Level",
      score: 41.530433654785156,
      Responsibilities: [
        "Assist in building server-side applications",
        "Develop RESTful APIs",
        "Work with SQL/NoSQL databases",
        "Participate in testing and debugging",
        "Learn cloud deployment and security fundamentals",
      ],
      primary_skill: {
        coverage_score: 50.0,
        matched_count: 5,
        total_role_skills: 10,
        matched: ["Python", "MongoDB Atlas", "PostgreSQL", "MySql", "NodeJs"],
        missing_skills: ["expressjs", "restfulapi", "django", "java", "flask"],
      },
      secondry_skill: {
        coverage_score: 33.0,
        matched_count: 1,
        total_role_skills: 3,
        matched: ["Git"],
        missing_skills: ["redis", "graphql"],
      },
      project: { score: 54.14373779296875 },
      experience: { score: 0 },
      achievment: {
        final_score: 53.630001068115234,
        semantic_impact: 50.84000015258789,
        relevance: 52.040000915527344,
        leadership: 57.650001525878906,
        prestige: 26.489999771118164,
        comp_bonus: 0,
        quant_bonus: 25,
      },
      certificates: { final_score: 0 },
    },
  ],
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

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole] = useState<string>(TARGET_ROLE_OPTIONS[0]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedRecommendationTitle, setSelectedRecommendationTitle] =
    useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNewFile = (file: File | null) => {
    if (!file) return;

    if (!isPdf(file)) {
      setErrorMessage(
        "Only PDF resumes are supported. Please upload a .pdf file.",
      );
      return;
    }

    setErrorMessage(null);
    setAnalysis(null);
    setSelectedRecommendationTitle("");
    setSelectedFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleNewFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleNewFile(event.dataTransfer.files?.[0] ?? null);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setSelectedRecommendationTitle("");
    setErrorMessage(null);
    setIsDragging(false);
  };

  const runAnalysis = () => {
    if (!selectedFile) {
      setErrorMessage("Upload a resume PDF first to generate recommendations.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    window.setTimeout(() => {
      const normalizedTarget = targetRole.toLowerCase();
      const rankedRecommendations = [
        ...SAMPLE_RECOMMENDATION_RESPONSE.recommendations,
      ].sort((a, b) => {
        const aTarget = a.Title.toLowerCase().includes(normalizedTarget)
          ? 1
          : 0;
        const bTarget = b.Title.toLowerCase().includes(normalizedTarget)
          ? 1
          : 0;
        if (aTarget !== bTarget) return bTarget - aTarget;
        return b.score - a.score;
      });

      setAnalysis({
        recommendations: rankedRecommendations,
        analyzedAt: new Date().toLocaleTimeString(),
      });
      setSelectedRecommendationTitle(rankedRecommendations[0]?.Title ?? "");
      setIsAnalyzing(false);
    }, 700);
  };

  const topRecommendation = analysis?.recommendations[0] ?? null;
  const activeRecommendation =
    analysis?.recommendations.find(
      (item) => item.Title === selectedRecommendationTitle,
    ) ??
    analysis?.recommendations[0] ??
    null;

  const roleSectionScores = activeRecommendation
    ? [
        { label: "Overall Recommendation", value: activeRecommendation.score },
        {
          label: "Primary Skill Coverage",
          value: activeRecommendation.primary_skill.coverage_score,
        },
        {
          label: "Secondary Skill Coverage",
          value: activeRecommendation.secondry_skill.coverage_score,
        },
        { label: "Projects", value: activeRecommendation.project.score },
        { label: "Experience", value: activeRecommendation.experience.score },
        {
          label: "Achievement",
          value: activeRecommendation.achievment.final_score,
        },
        {
          label: "Certificates",
          value: activeRecommendation.certificates.final_score,
        },
      ]
    : [];

  return (
    <main className="relative z-10 min-h-screen w-full">
      <section className="mx-auto w-[86%] pb-10 pt-24 lg:pb-16 lg:pt-28">
        <div className=" p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Analyze Resume
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Upload your resume and get role recommendation scores.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Select any recommended role to inspect responsibilities, skill
            coverage, and section-level score feedback.
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
              </div>
            )}

            <button
              type="button"
              onClick={runAnalysis}
              disabled={!selectedFile || isAnalyzing}
              className="mt-5 w-full rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? "Analyzing Resume..." : "Generate Insights"}
            </button>

            {analysis && (
              <button
                type="button"
                className="mt-5 w-full rounded-full cursor-pointer border border-foreground bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            
              >
                <Link href="/jobs">
                View Related Jobs
                </Link>
                
              </button>
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
                        ? `${formatScore(topRecommendation.score)}%`
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
                        {item.Title} ({formatScore(item.score)}%)
                      </option>
                    ))}
                  </select>

                  {activeRecommendation && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-sm text-foreground">
                        <p>{activeRecommendation.Title}</p>
                        <p className="font-semibold">
                          {formatScore(activeRecommendation.score)}%
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                        <div
                          className="h-full bg-foreground transition-[width]"
                          style={{
                            width: `${Math.min(activeRecommendation.score, 100)}%`,
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
                          className={`font-semibold ${getScoreStatusClass(activeRecommendation.score)}`}
                        >
                          {formatScore(activeRecommendation.score)}%
                        </span>
                        . Primary skill coverage is{" "}
                        <span className="font-semibold">
                          {formatScore(
                            activeRecommendation.primary_skill.coverage_score,
                          )}
                          %
                        </span>{" "}
                        and secondary skill coverage is{" "}
                        <span className="font-semibold">
                          {formatScore(
                            activeRecommendation.secondry_skill.coverage_score,
                          )}
                          %
                        </span>
                        .
                      </p>
                    </div>

                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Responsibilities
                      </p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
                        {activeRecommendation.Responsibilities.map((item) => (
                          <li
                            key={item}
                            className="border-l-2 border-foreground/30 pl-3"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-border bg-background/70 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        Skill Match Feedback
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          {
                            label: "Primary Skills",
                            data: activeRecommendation.primary_skill,
                          },
                          {
                            label: "Secondary Skills",
                            data: activeRecommendation.secondry_skill,
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
                            {formatScore(
                              activeRecommendation.achievment.semantic_impact,
                            )}
                            %
                          </p>
                          <p>
                            Relevance:{" "}
                            {formatScore(
                              activeRecommendation.achievment.relevance,
                            )}
                            %
                          </p>
                          <p>
                            Leadership:{" "}
                            {formatScore(
                              activeRecommendation.achievment.leadership,
                            )}
                            %
                          </p>
                          <p>
                            Prestige:{" "}
                            {formatScore(
                              activeRecommendation.achievment.prestige,
                            )}
                            %
                          </p>
                          <p>
                            Comp Bonus:{" "}
                            {formatScore(
                              activeRecommendation.achievment.comp_bonus,
                            )}
                            %
                          </p>
                          <p>
                            Quant Bonus:{" "}
                            {formatScore(
                              activeRecommendation.achievment.quant_bonus,
                            )}
                            %
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 bg-background/55 flex lg:flex-row flex-col items-center justify-between">
                        <div className="h-full lg:w-[50%] w-full flex flex-col items-start p-3 border border-border">
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/60">
                            Project Feedback
                          </p>
                          <p className="text-xs mt-2 font-light  tracking-[0.15em] text-foreground/60">
                            Write the project that better alligns with the Resposibilities
                          </p>
                        </div>
                        <div className="h-full lg:w-[50%] w-full flex flex-col items-start p-3 border border-border">
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/60">
                            Experience feedback 
                          </p>
                          <p className="text-xs mt-2 font-light  tracking-[0.15em] text-foreground/60">
                            Write the Work Experience that better alligns with the Resposibilities
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
