import { redirect } from "next/navigation";

import { logout } from "@/app/actions/auth";
import { findUserById } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const userId = Number(session.userId);
  const user = Number.isNaN(userId) ? null : findUserById(userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:grid-cols-[260px_1fr]">
        <aside className="border-b border-zinc-200 bg-zinc-50 p-4 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-600">Explorer</h1>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Logout
              </button>
            </form>
          </div>

          <nav aria-label="Dashboard tree view">
            <ul className="space-y-1 text-sm text-zinc-700">
              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <circle cx="12" cy="18" r="3" />
                  <path d="M12 8c1.5-1.2 3.3-1.8 5.4-1.8" />
                </svg>
                <span>Music</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <circle cx="9" cy="12" r="1.2" />
                  <circle cx="15" cy="12" r="1.2" />
                </svg>
                <span>Game</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="4" width="14" height="16" rx="2" />
                  <path d="M8 8h8" />
                  <path d="M8 12h8" />
                </svg>
                <span>Comic</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 5h14v14H5z" />
                  <path d="M5 10h14" />
                  <path d="M12 10v9" />
                </svg>
                <span>Drama</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 5v14" />
                  <path d="M17 5v14" />
                </svg>
                <span>Movie</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2" />
                  <path d="M6 4v16" />
                  <path d="M10 8h6" />
                </svg>
                <span>Book</span>
              </li>

              <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100">
                <span className="text-zinc-500">▸</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16v12H4z" />
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <path d="M8 16c1.5-1 2.8-1.5 4-1.5s2.5.5 4 1.5" />
                </svg>
                <span>Anime</span>
              </li>
            </ul>
          </nav>
        </aside>

        <section className="min-h-[420px] bg-white" aria-label="Dashboard content area" />
      </div>
    </main>
  );
}