"use client";
import Link from "next/link";
import { useState } from "react";
import GlassSurface from "./GlassSurface";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinkClass =
    "rounded-md px-3 py-1.5 text-sm font-medium !text-gray-700 transition-colors hover:bg-black/5 hover:!text-gray-900 dark:!text-gray-300 dark:hover:bg-white/10 dark:hover:!text-gray-100";
  const mobileNavLinkClass =
    "rounded-md px-3 py-2 text-sm font-medium !text-gray-700 transition-colors hover:bg-black/5 hover:!text-gray-900 dark:!text-gray-300 dark:hover:bg-white/10 dark:hover:!text-gray-100";

  return (
    <GlassSurface
      className="fixed inset-x-0 top-4 z-50 mx-auto h-[8vh] w-[90%]  rounded-full overflow-visible"
      displace={0.5}
      distortionScale={-180}
      redOffset={0}
      greenOffset={10}
      blueOffset={20}
      brightness={50}
      opacity={0.93}
      mixBlendMode="screen"
    >
      <div className="flex w-full items-center justify-between px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100"
          >
            ResumeLens
          </Link>

        <div className="hidden md:flex  items-center gap-3">
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/ats" className={navLinkClass}>
              ATS Checker
            </Link>
            <Link href="/analyze" className={navLinkClass}>
              Resume Analyzer
            </Link>
            <Link href="/jdmatch" className={navLinkClass}>
              JD Match
            </Link>
            <Link href="/jobs" className={navLinkClass}>
              Job Matches
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex  items-center justify-center">
          <ThemeToggle />
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden inline-flex h-9 w-9 flex-col items-center justify-center rounded-md border border-none text-gray-900 dark:border-white/20 dark:text-gray-100"
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isMenuOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`mt-1 block h-0.5 w-5 bg-current transition-opacity duration-400 ${
              isMenuOpen ? "translate-x-100" : "translate-x-0"
            }`}
          />
          <span
            className={`mt-1 block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-[calc(100%+0.6rem)] left-1/2 w-[90%] -translate-x-1/2 md:hidden">
          <div className="animate-[navbar-menu-drop_400ms_linear] rounded-2xl border border-black/10 bg-white p-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/ats"
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                ATS Checker
              </Link>
              <Link
                href="/analyze"
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Resume Analyzer
              </Link>
              <Link
                href="/jdmatch"
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                JD Match
              </Link>
              <Link
                href="/jobs"
                className={mobileNavLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                Job Matches
              </Link>
            </nav>
            <div className="mt-3 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </GlassSurface>
  );
}
