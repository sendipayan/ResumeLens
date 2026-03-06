import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">

      <h1 className="text-6xl font-bold mb-4">404</h1>

      <p className="text-gray-500 mb-6">
        This page does not exist.
      </p>

      <Link
        href="/"
        className="border px-4 py-2 rounded-full rounded hover:bg-foreground hover:text-background transition"
      >
        Go Home
      </Link>

    </div>
  )
}