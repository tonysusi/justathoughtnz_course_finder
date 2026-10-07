// Gate and helpers for the debug log in the Vercel Functions (api/match.ts, api/risk.ts, api/debug/*).
// The local dev server (vite.config.ts) uses fileStore directly and doesn't need any of this.
import { createHash, timingSafeEqual } from "node:crypto";
import type { MatchRun } from "../match.js";
import type { MatchResponse, RiskCheckResponse } from "../../src/types.js";
import { buildEntry, type LogPayload } from "./entry.js";
import * as blobStore from "./blobStore.js";

/** On only when DEBUG_LOG is "true" for this deployment's environment. Missing or anything else means off. */
export function debugEnabled(): boolean {
  return process.env.DEBUG_LOG === "true";
}

/** Saves the run when debug is on. Never throws: a logging failure mustn't break the person's request. */
export async function logRun(payload: LogPayload, run: MatchRun<MatchResponse | RiskCheckResponse>): Promise<void> {
  if (!debugEnabled()) return;
  try {
    await blobStore.append(buildEntry(payload, run));
  } catch (err) {
    // The error name only; never the entry, which holds what the person typed.
    console.error(`[debug-log] append failed: ${err instanceof Error ? err.name : "unknown"}`);
  }
}

const digest = (s: string) => createHash("sha256").update(s).digest();

/** True when the x-debug-token header matches DEBUG_TOKEN. Fails closed when DEBUG_TOKEN isn't set. */
export function hasDebugToken(request: Request): boolean {
  const expected = process.env.DEBUG_TOKEN;
  const given = request.headers.get("x-debug-token");
  if (!expected || !given) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

export const noStore = { "Cache-Control": "no-store" };
export const notFound = () => Response.json({ error: "Not found." }, { status: 404, headers: noStore });
