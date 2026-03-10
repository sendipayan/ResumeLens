"use client";

import Link from "next/link";
import { useRecommendationJobsStore } from "@/lib/stores/recommendation-jobs-store";

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
            Jobs
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Recommended job searches from your resume profile.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Open jobs directly on your preferred platforms using optimized search
            queries per role.
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
    </main>
  );
}
