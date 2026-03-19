import Image from "next/image";
import Link from "next/link";
import CardSwap, { Card } from "@/components/CardSwap";
import { sendEmail } from "@/lib/email";

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
          <h1 className="text-4xl font-bold  leading-tight text-foreground sm:text-5xl lg:text-6xl">
            ResumeLens helps you turn resumes into interview-ready decisions.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-foreground/80 sm:text-lg">
            Analyze resume quality, match candidates against job descriptions,
            and surface the strongest profiles faster with structured scoring.
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
            alt="ResumeLens hero visual"
            width={720}
            height={720}
            priority
            className="h-full w-full  object-contain block dark:hidden"
          />
          <Image
            src="/hero-image-dark-new.png"
            alt="ResumeLens hero visual"
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
              From resume upload to better job decisions.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
              ResumeLens helps you evaluate profiles faster, map candidates to the right opportunities, and improve
              match confidence with structured AI insights.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-foreground sm:text-base">
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">AI Resume Analysis:</span> skills, experience level, and ATS fit.
              </li>
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">Smart Job Matching:</span> discover roles where your profile has high
                success potential.
              </li>
              <li className="border-l-2 border-foreground/40 pl-3">
                <span className="font-semibold">Resume vs Job Description:</span> check role alignment before applying.
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
                <h3 className="text-xl font-bold">AI Resume Analysis</h3>
              </div>
              <div className="relative w-full h-[90%] overflow-hidden pt-4 pb-2">
                <Image
                  src="/card1.png"
                  alt="Resume analysis preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card1_dark.png"
                  alt="Resume analysis preview"
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
                  alt="Resume analysis preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card2_dark.png"
                  alt="Resume analysis preview"
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
                  alt="Resume analysis preview"
                  height={1200}
                  width={700}
                  className="h-full w-full object-fit block dark:hidden"
                />
                <Image
                  src="/card3_dark.png"
                  alt="Resume analysis preview"
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
          <div className="border border-border bg-background/65 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-foreground">How do I improve my ATS score?</h3>
            <p className="mt-2 text-sm text-foreground/80">To improve your Applicant Tracking System (ATS) score, make sure you use a simple, single-column resume format. Incorporate exact keywords from the job description naturally into your experience, and avoid complex graphics or tables that parsing bots can&apos;t read.</p>
          </div>
          <div className="border border-border bg-background/65 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-foreground">What does an AI Resume Checker look for?</h3>
            <p className="mt-2 text-sm text-foreground/80">An AI Resume Checker evaluates your resume&apos;s structural integrity, semantic relevance to a target role, keyword density, and action-verb usage. It highlights missing skills that recruiters are actively searching for.</p>
          </div>
          <div className="border border-border bg-background/65 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-foreground">Is the resume analysis free to use?</h3>
            <p className="mt-2 text-sm text-foreground/80">Yes, the basic ATS score check and semantic resume analysis features are completely free to use. You can instantly see where your profile falls short before submitting an application.</p>
          </div>
          <div className="border border-border bg-background/65 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-foreground">How accurate is the job matching algorithm?</h3>
            <p className="mt-2 text-sm text-foreground/80">Our proprietary matching algorithm has a 94% match accuracy. It simulates how top-tier enterprise ATS systems score your resume against a specific JD, giving you a realistic indication of your interview chances.</p>
          </div>
        </div>
      </section>

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
