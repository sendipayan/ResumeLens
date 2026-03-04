"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center w-14 h-7 rounded-full dark:bg-gray-200 bg-gray-800 transition cursor-pointer"
    >
      <span
        className={`absolute left-1 flex items-center justify-center w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          isDark ? "translate-x-7" : ""
        }`}
      >
        {isDark ? (
          <Moon size={14} className="text-gray-700" />
        ) : (
          <Sun size={14} className="text-gray-700" />
        )}
      </span>
    </button>
  )
}