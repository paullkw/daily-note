import Link from "next/link";

import { getSession } from "@/app/lib/session";
import { logout } from "@/app/actions/auth";

export default async function Home() {
  const session = await getSession();
  const isSignedIn = Boolean(session?.userId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-4xl font-semibold tracking-tight text-zinc-900">Daily Note</h1>
      <p className="mb-8 text-zinc-600">Simple app shell with cookie-based login.</p>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">
          {isSignedIn ? "You are signed in" : "You are not signed in"}
        </h2>
        <p className="mb-6 text-sm text-zinc-600">
          {isSignedIn
            ? "Continue to your dashboard or sign out."
            : "Sign in or create an account to access protected pages."}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Open dashboard
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Go to login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
