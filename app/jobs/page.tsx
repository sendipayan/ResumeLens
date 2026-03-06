type JobLinks = {
  optimized_query: string;
  google_jobs: string;
  linkedin: string;
  unstop: string;
  wellfound: string;
};

type JobRecommendation = {
  title: string;
  links: JobLinks;
};

const JOBS: JobRecommendation[] = [
  {
    title: "Software Developer - Entry Level",
    links: {
      optimized_query: "\"Junior Software Developer - Entry Level\" Python C++ Javascript India",
      google_jobs:
        "https://www.google.com/search?q=%22Junior+Software+Developer+-+Entry+Level%22+Python+C%2B%2B+Javascript+India+jobs&ibp=htl;jobs",
      linkedin:
        "https://www.linkedin.com/jobs/search/?keywords=%22Junior+Software+Developer+-+Entry+Level%22+Python+C%2B%2B+Javascript+India&location=India",
      unstop:
        "https://unstop.com/jobs?search=%22Junior+Software+Developer+-+Entry+Level%22+Python+C%2B%2B+Javascript+India",
      wellfound:
        "https://wellfound.com/jobs?query=%22Junior+Software+Developer+-+Entry+Level%22+Python+C%2B%2B+Javascript+India",
    },
  },
  {
    title: "Full Stack Developer - Entry Level",
    links: {
      optimized_query: "\"Junior Full Stack Developer - Entry Level\" Javascript ReactJs MySql India",
      google_jobs:
        "https://www.google.com/search?q=%22Junior+Full+Stack+Developer+-+Entry+Level%22+Javascript+ReactJs+MySql+India+jobs&ibp=htl;jobs",
      linkedin:
        "https://www.linkedin.com/jobs/search/?keywords=%22Junior+Full+Stack+Developer+-+Entry+Level%22+Javascript+ReactJs+MySql+India&location=India",
      unstop:
        "https://unstop.com/jobs?search=%22Junior+Full+Stack+Developer+-+Entry+Level%22+Javascript+ReactJs+MySql+India",
      wellfound:
        "https://wellfound.com/jobs?query=%22Junior+Full+Stack+Developer+-+Entry+Level%22+Javascript+ReactJs+MySql+India",
    },
  },
  {
    title: "Web Developer",
    links: {
      optimized_query: "\"Junior Web Developer\" Javascript MongoDB Atlas ReactJs India",
      google_jobs:
        "https://www.google.com/search?q=%22Junior+Web+Developer%22+Javascript+MongoDB+Atlas+ReactJs+India+jobs&ibp=htl;jobs",
      linkedin:
        "https://www.linkedin.com/jobs/search/?keywords=%22Junior+Web+Developer%22+Javascript+MongoDB+Atlas+ReactJs+India&location=India",
      unstop:
        "https://unstop.com/jobs?search=%22Junior+Web+Developer%22+Javascript+MongoDB+Atlas+ReactJs+India",
      wellfound:
        "https://wellfound.com/jobs?query=%22Junior+Web+Developer%22+Javascript+MongoDB+Atlas+ReactJs+India",
    },
  },
  {
    title: "Frontend Developer - Entry Level",
    links: {
      optimized_query: "\"Junior Frontend Developer - Entry Level\" Javascript ReactJs India",
      google_jobs:
        "https://www.google.com/search?q=%22Junior+Frontend+Developer+-+Entry+Level%22+Javascript+ReactJs+India+jobs&ibp=htl;jobs",
      linkedin:
        "https://www.linkedin.com/jobs/search/?keywords=%22Junior+Frontend+Developer+-+Entry+Level%22+Javascript+ReactJs+India&location=India",
      unstop:
        "https://unstop.com/jobs?search=%22Junior+Frontend+Developer+-+Entry+Level%22+Javascript+ReactJs+India",
      wellfound:
        "https://wellfound.com/jobs?query=%22Junior+Frontend+Developer+-+Entry+Level%22+Javascript+ReactJs+India",
    },
  },
  {
    title: "Backend Developer - Entry Level",
    links: {
      optimized_query: "\"Junior Backend Developer - Entry Level\" Python MongoDB Atlas PostgreSQL India",
      google_jobs:
        "https://www.google.com/search?q=%22Junior+Backend+Developer+-+Entry+Level%22+Python+MongoDB+Atlas+PostgreSQL+India+jobs&ibp=htl;jobs",
      linkedin:
        "https://www.linkedin.com/jobs/search/?keywords=%22Junior+Backend+Developer+-+Entry+Level%22+Python+MongoDB+Atlas+PostgreSQL+India&location=India",
      unstop:
        "https://unstop.com/jobs?search=%22Junior+Backend+Developer+-+Entry+Level%22+Python+MongoDB+Atlas+PostgreSQL+India",
      wellfound:
        "https://wellfound.com/jobs?query=%22Junior+Backend+Developer+-+Entry+Level%22+Python+MongoDB+Atlas+PostgreSQL+India",
    },
  },
];

const PLATFORM_LINKS: Array<{ key: keyof Omit<JobLinks, "optimized_query">; label: string }> = [
  { key: "google_jobs", label: "Google Jobs" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "unstop", label: "Unstop" },
  { key: "wellfound", label: "Wellfound" },
];

export default function JobsPage() {
  return (
    <main className="relative z-10 min-h-screen w-full">
      <section className="mx-auto w-[86%] pb-10 pt-24 lg:pb-16 lg:pt-28">
        <div className=" p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Jobs</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Recommended job searches from your resume profile.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Open jobs directly on your preferred platforms using optimized search queries per role.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {JOBS.map((job) => (
            <article
              key={job.title}
              className="border border-border bg-background/65 p-5 backdrop-blur-sm sm:p-6"
            >
              <h2 className="text-xl font-semibold text-foreground">{job.title}</h2>

              <div className="mt-4 border border-border bg-background/55 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/60">
                  Optimized Query
                </p>
                <p className="mt-2 break-words text-sm text-foreground/80">{job.links.optimized_query}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLATFORM_LINKS.map((platform) => (
                  <a
                    key={`${job.title}-${platform.key}`}
                    href={job.links[platform.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-center hover:bg-foreground hover:text-background transition-all-200_ms text-sm font-semibold text-foreground transition-colors hover:bg-background/90"
                  >
                    {platform.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
