// Builds one debug log entry. Shared by the local file log and the Vercel Blob log.
import { randomUUID } from "node:crypto";
import type { MatchRun } from "../match.js";
import type { MatchResponse, MatchSource, RiskCheckResponse } from "../../src/types.js";
import type { QueryLogEntry } from "../../src/debug/types.js";

/** What the client sends alongside a query when debug is on. */
export interface LogPayload {
  text?: unknown;
  source?: unknown;
  answers?: unknown;
  exclude?: unknown;
  about?: unknown;
  kind?: unknown;
}

/** Logged option name. "questionnaire" is Hybrid's old name, so older entries are read as Hybrid. */
export function sourceOf(source: unknown): MatchSource {
  if (source === "hybrid" || source === "questionnaire") return "hybrid";
  if (source === "multiple-choice") return "multiple-choice";
  return "free-text";
}

export function buildEntry(payload: LogPayload, run: MatchRun<MatchResponse | RiskCheckResponse>): QueryLogEntry {
  return {
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
}

/** Reads a stored entry, mapping old source names. Returns undefined if it isn't valid JSON. */
export function parseEntry(json: string): QueryLogEntry | undefined {
  try {
    const entry = JSON.parse(json) as QueryLogEntry;
    if (entry.source) entry.source = sourceOf(entry.source);
    return entry;
  } catch {
    return undefined;
  }
}
