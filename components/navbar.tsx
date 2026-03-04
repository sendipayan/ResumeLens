"use client";
import Link from "next/link";
import GlassSurface from "./GlassSurface";
import ThemeToggle from "./theme-toggle";

export default function Navbar() {
  const navLinkClass =
    "rounded-md px-3 py-1.5 text-sm font-medium !text-gray-700 transition-colors hover:bg-black/5 hover:!text-gray-900 dark:!text-gray-300 dark:hover:bg-white/10 dark:hover:!text-gray-100";

  return (
    <GlassSurface
      className="fixed inset-x-0 top-4 z-50 mx-auto h-[7vh] w-[90%] max-w-6xl rounded-full"
      displace={0.5}
      width={1300}
      height={55}
      borderRadius={50}
      distortionScale={-180}
      redOffset={0}
      greenOffset={10}
      blueOffset={20}
      brightness={50}
      opacity={0.93}
      mixBlendMode="screen"
    >
      <div className="flex w-[90%] items-center justify-between px-6 py-2 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-wide text-gray-900 dark:text-gray-100"
        >
          Resumelens
        </Link>

        <nav className="flex items-center w-[30%] justify-between gap-2 sm:gap-3">
          <Link href="#a1" className={navLinkClass}>
            Analyze
          </Link>
          <Link href="#a2" className={navLinkClass}>
            JD matching
          </Link>
          <Link href="#a3" className={navLinkClass}>
            Jobs
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </GlassSurface>
  );
}
