import Link from "next/link";
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
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">You are signed in</h2>
        <p className="text-sm text-zinc-600">Email: {user.email}</p>
        <p className="text-sm text-zinc-600">User ID: {user.id}</p>
      </section>

      <Link href="/" className="mt-6 text-sm font-medium text-blue-700 hover:text-blue-800">
        Back to home
      </Link>
    </main>
  );
}