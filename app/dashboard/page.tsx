import { redirect } from "next/navigation";

import { findUserById } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";
import { loadDashboardExplorerState } from "./actions";
import DashboardExplorer from "./DashboardExplorer";

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

  const initialState = await loadDashboardExplorerState();

  return <DashboardExplorer initialState={initialState} />;
}