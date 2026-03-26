import Image from "next/image";
import Link from "next/link";
import CardSwap, { Card } from "@/components/CardSwap";
import { sendEmail } from "@/lib/email";

const faqItems = [
  {
    question: "What is a resume analyzer?",
    answer:
      "A resume analyzer evaluates structure, skills, keywords, and clarity to highlight gaps that can hurt ATS and recruiter performance.",
  },
  {
    question: "How do I improve my ATS score?",
    answer:
      "Use a clean, single-column layout, mirror exact job-description keywords in your experience, and avoid graphics or tables that ATS tools cannot parse.",
  },
  {
    question: "What does an AI Resume Checker look for?",
    answer:
      "It checks structural integrity, role relevance, keyword coverage, and action-verb usage to surface missing skills recruiters expect.",
  },
  {
    question: "What is an ATS checker?",
    answer:
      "An ATS checker simulates how applicant tracking systems scan a resume, scoring keyword alignment, formatting, and role relevance.",
  },
  {
    question: "Is the resume analysis free to use?",
    answer:
      "Yes, the basic ATS score check and semantic resume analysis features are free, so you can see gaps before applying.",
  },
  {
    question: "How accurate is the job matching algorithm?",
    answer:
      "Our matching algorithm reports a 94% match accuracy by comparing your resume against role requirements and ATS-style scoring signals.",
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

async function sendContactEmail(formData: FormData) {
  "use server";

  const to = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!to || !subject || !message) {
    throw new Error("Missing required contact fields");
  }

  const text = [
    `Name: ${name || "N/A"}`,
    `Email: ${to}`,
    "",
    message,
  ].join("\n");

  await sendEmail({ to, subject, text });
}

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      <section className="relative z-10 mx-auto flex lg:flex-row flex-col min-h-0 lg:min-h-screen w-[86%] items-start lg:items-center pt-24 pb-8 lg:pt-28 lg:pb-16 gap-6 lg:gap-0 justify-start lg:justify-between">
        <div className="lg:w-[50%] w-full mb-4 lg:mb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Resume Analyzer & ATS Checker
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            ResumeLens is a resume analyzer and ATS checker for faster, smarter decisions.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
            Score resume quality, check ATS fit, match candidates against job
            descriptions, and surface the strongest profiles with structured
            insights.
          </p>
          <p className="mt-3 text-sm text-foreground/70 sm:text-base">
            Prefer a fast scan? Use our{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href="/ats">
              ATS checker
            </Link>{" "}
            or run the full{" "}
            <Link className="font-semibold text-foreground underline-offset-4 hover:underline" href="/analyze">
              resume analyzer
            </Link>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:opacity-90"
              href="/analyze"
            >
              Start Analysis
            </Link>
            <Link className="rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-background/90"
              href="/jobs"
            >
              View Jobs
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="border border-border bg-background/65 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">94%</p>
              <p className="text-xs text-foreground/70">Match accuracy</p>
            </div>
            <div className="border border-border bg-background/65 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">3x</p>
              <p className="text-xs text-foreground/70">Faster shortlisting</p>
            </div>
            <div className="border border-border bg-background/65 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">24/7</p>
              <p className="text-xs text-foreground/70">Instant insights</p>
            </div>
          </div>
        </div>
        <div className="lg:w-[50%] w-full h-[42vh] sm:h-[52vh] lg:h-[75vh] flex items-center justify-center">
            <Image
              src="/hero-image-new.png"
              alt="Resume analyzer and ATS checker dashboard preview"
              width={720}
              height={720}
              priority
              className="h-full w-full  object-contain block dark:hidden"
            />
            <Image
              src="/hero-image-dark-new.png"
              alt="Resume analyzer and ATS checker dashboard preview"
              width={720}
              height={720}
              priority
              className="h-full w-full  object-contain hidden dark:block"
            />
        </div>
      </section>
      <section className="relative z-10 mx-auto w-[86%] h-auto lg:h-screen min-h-0 lg:min-h-screen flex lg:flex-row flex-col items-start justify-start lg:justify-between gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 lg:py-0">
        <div className="lg:w-[42%] w-full h-auto lg:h-full">
          <div className="h-auto lg:h-full w-full bg-transparent p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">Core Features</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              From resume upload to ATS-optimized decisions.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
              ResumeLens helps you evaluate profiles faster with a resume analyzer, validate ATS checker results, and
              map candidates to the right opportunities with structured AI insights.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-foreground sm:text-base">
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">Resume Analyzer:</span> skills, experience level, and ATS fit.
              </li>
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">Smart Job Matching:</span> discover roles where your profile has high
                success potential.
              </li>
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">ATS Checker vs Job Description:</span> verify role alignment before applying.
              </li>
            </ul>
          </div>
        </div>
        <div className="relative lg:w-[56%] w-full h-[400px] sm:h-[540px] lg:h-full flex items-center justify-center ">
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={2500}
            pauseOnHover={true}
          >
            <Card className=" flex flex-col items-center justify-center text-foreground px-5 pt-3">
              <div className="w-full h-[10%] flex items-center justify-self-start border-b-2 border-foreground">
                <h3 className="text-xl font-bold">Resume Analyzer</h3>
              </div>
              <div className="relative w-full h-[90%] overflow-hidden pt-4 pb-2">
                <Image
                  src="/card1.png"
                  alt="Resume analyzer score preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card1_dark.png"
                  alt="Resume analyzer score preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit hidden dark:block"
                />
              </div>
            </Card>
            <Card className=" flex flex-col items-center justify-center text-foreground px-5 pt-3">
              <div className="w-full h-[10%] flex items-center justify-self-start border-b-2 border-foreground">
                <h3 className="text-xl font-bold">Smart Job Matching</h3>
              </div>
              <div className="relative w-full h-[90%] overflow-hidden pt-4 pb-2">
                <Image
                  src="/card2.png"
                  alt="ATS checker job matching preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card2_dark.png"
                  alt="ATS checker job matching preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit hidden dark:block"
                />
              </div>
            </Card>
            <Card className=" flex flex-col items-center justify-center text-foreground px-5 pt-3">
              <div className="w-full h-[10%] flex items-center justify-self-start border-b-2 border-foreground">
                <h3 className="text-xl font-bold">Resume vs Job Description</h3>
              </div>
              <div className="relative w-full h-[90%] overflow-hidden pt-4 pb-2">
                <Image
                  src="/card3.png"
                  alt="Resume versus job description match preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card3_dark.png"
                  alt="Resume versus job description match preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit hidden dark:block"
                />
              </div>
            </Card>
          </CardSwap>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 mx-auto w-[86%] py-12 lg:py-16">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Common questions about ResumeLens</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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

      <section className="relative z-10 mx-auto w-[86%] pb-12 pt-8 sm:pb-14 sm:pt-10 lg:pb-16">
        <div className="border border-border bg-background/65 p-6 backdrop-blur-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Get In Touch
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            Have questions or want a custom demo?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
            Reach out and we will help you set up ResumeLens for your
            job-search or hiring workflow.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="border border-border bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-foreground/60">
                Name
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Resumelens
              </p>
              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-foreground/60">
                Response Time
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                Within 24 Hours
              </p>
            </div>

            <form
              action={sendContactEmail}
              className="border border-border bg-background/70 p-4"
            >
              <p className="text-sm font-semibold text-foreground">Contact Us</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="text-xs uppercase tracking-[0.15em] text-foreground/60"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-xs uppercase tracking-[0.15em] text-foreground/60"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label
                  htmlFor="contact-subject"
                  className="text-xs uppercase tracking-[0.15em] text-foreground/60"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  className="mt-1 w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div className="mt-3">
                <label
                  htmlFor="contact-message"
                  className="text-xs uppercase tracking-[0.15em] text-foreground/60"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  className="mt-1 min-h-[110px] w-full border border-border bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-4 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:opacity-90"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
