"use server";

import { getDashboardTreeviewState, upsertDashboardTreeviewState } from "@/app/lib/db";
import { getSession } from "@/app/lib/session";

import { DEFAULT_EXPLORER_STATE, normalizeExplorerState, type ExplorerState } from "./explorer-state";

function parseSessionUserId(userId: string | undefined): number | null {
  const parsed = Number(userId);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

export async function loadDashboardExplorerState(): Promise<ExplorerState> {
  const session = await getSession();
  const userId = parseSessionUserId(session?.userId);

  if (!userId) {
    return DEFAULT_EXPLORER_STATE;
  }

  const state = getDashboardTreeviewState(userId);

  if (!state) {
    upsertDashboardTreeviewState(userId, DEFAULT_EXPLORER_STATE);
    return DEFAULT_EXPLORER_STATE;
  }

  return normalizeExplorerState(state);
}

export async function saveDashboardExplorerState(state: ExplorerState): Promise<void> {
  const session = await getSession();
  const userId = parseSessionUserId(session?.userId);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  upsertDashboardTreeviewState(userId, normalizeExplorerState(state));
}
