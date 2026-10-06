// Local-only debug log of queries and JEV exchanges. Used by the Vite dev server, never deployed.
// Contains whatever testers type, so logs/ is git-ignored and kept until cleared from /debug.html.
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import type { MatchRun } from "../lib/match";
import type { MatchResponse, MatchSource, RiskCheckResponse } from "../src/types";
import type { QueryLogEntry } from "../src/debug/types";

/** Logged option name. "questionnaire" is Hybrid's old name, so older entries are read as Hybrid. */
function sourceOf(source: unknown): MatchSource {
  if (source === "hybrid" || source === "questionnaire") return "hybrid";
  if (source === "multiple-choice") return "multiple-choice";
  return "free-text";
}

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "queries.jsonl");

export function appendEntry(
  payload: { text?: unknown; source?: unknown; answers?: unknown; exclude?: unknown; about?: unknown; kind?: unknown },
  run: MatchRun<MatchResponse | RiskCheckResponse>,
): void {
  const entry: QueryLogEntry = {
    id: randomUUID(),
    time: new Date().toISOString(),
    kind: payload.kind === "risk-check" ? "risk-check" : "match",
    source: sourceOf(payload.source),
    text: payload.text,
    answers: payload.answers,
    exclude: payload.exclude,
    about: payload.about === "them" ? "them" : "self",
    status: run.status,
    durationMs: run.durationMs,
    body: run.body,
    errorLog: run.errorLog,
    jevRequest: run.exchange.request,
    jevResponse: run.exchange.response,
  };
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
}

/** Newest first. Skips any line that fails to parse rather than failing the whole page. */
export function readEntries(): QueryLogEntry[] {
  if (!existsSync(LOG_FILE)) return [];
  const entries: QueryLogEntry[] = [];
  for (const line of readFileSync(LOG_FILE, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as QueryLogEntry;
      if (entry.source) entry.source = sourceOf(entry.source);
      entries.push(entry);
    } catch {
      // ignore a partially written line
    }
  }
  return entries.reverse();
}

export function clearEntries(): void {
  rmSync(LOG_FILE, { force: true });
}
