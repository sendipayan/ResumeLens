"use client";

import Link from "next/link";
import { useRecommendationJobsStore } from "@/lib/stores/recommendation-jobs-store";

const faqItems = [
  {
    question: "How are job matches generated?",
    answer:
      "Matches come from your resume analyzer results and highlight roles with strong keyword alignment.",
  },
  {
    question: "Do I need to run the ATS checker first?",
    answer:
      "You can, but running the full resume analyzer provides richer role recommendations for this page.",
  },
  {
    question: "Are the job links updated automatically?",
    answer:
      "Links are based on optimized search queries so you can open the latest jobs on each platform.",
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

const formatPlatformLabel = (key: string) =>
  key
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

export default function JobsPage() {
  const storedRecommendations = useRecommendationJobsStore(
    (state) => state.recommendations,
  );
  const storedJobs = useRecommendationJobsStore((state) => state.jobs);
  const hasJobs = storedJobs.length > 0;

  return (
    <main className="relative z-10 min-h-screen w-full">
      <section className="mx-auto w-[86%] pb-10 pt-24 lg:pb-16 lg:pt-28">
        <div className=" p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            ATS Checker Job Matches
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Job searches powered by your resume analyzer results.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Open jobs directly on your preferred platforms using ATS checker
            insights and optimized search queries per role.
          </p>
          <p className="mt-2 text-sm text-foreground/70 sm:text-base">
            Generate matches by running the{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href="/analyze">
              resume analyzer
            </Link>
            .
          </p>
          {hasJobs && storedRecommendations.length > 0 && (
            <p className="mt-2 text-xs text-foreground/65">
              Ordered using recommendations generated on the Analyze page.
            </p>
          )}
        </div>

        {!hasJobs ? (
          <div className="mt-6 border border-border bg-background/65 p-6 text-center sm:p-8">
            <p className="text-sm text-foreground/80">
              No job recommendations found.
            </p>
            <p className="mt-2 text-sm text-foreground/70">
              Upload your resume and generate insights on Analyze to populate
              this page.
            </p>
            <Link
              href="/analyze"
              className="mt-5 inline-block rounded-full border border-foreground bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
            >
              Upload Resume In Analyze
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {storedJobs.map((job) => (
              <article
                key={job.title}
                className="border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6"
              >
                <h2 className="text-xl font-semibold text-foreground">
                  {job.title}
                </h2>

                {job.links.optimized_query.trim().length > 0 && (
                  <div className="mt-4 border border-border bg-background/55 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">
                      Optimized Query
                    </p>
                    <p className="mt-2 break-words text-sm text-foreground/80">
                      {job.links.optimized_query}
                    </p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(job.links)
                    .filter(
                      ([platformKey, platformUrl]) =>
                        platformKey !== "optimized_query" &&
                        typeof platformUrl === "string" &&
                        platformUrl.trim().length > 0,
                    )
                    .map(([platformKey, platformUrl]) => (
                      <a
                        key={`${job.title}-${platformKey}`}
                        href={platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-border bg-background/70 px-4 py-2 text-center hover:bg-foreground hover:text-background transition-all-200_ms text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
                      >
                        {formatPlatformLabel(platformKey)}
                      </a>
                    ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="relative z-10 mx-auto w-[86%] pb-12 lg:pb-16">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Job matches from resume analyzer insights
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
