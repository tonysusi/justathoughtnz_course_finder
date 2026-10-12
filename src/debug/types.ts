import type { MatchAbout, MatchError, MatchResponse, MatchSource, RiskCheckResponse } from "../types";

/** One query in the debug log: logs/queries.jsonl locally, or a Vercel Blob when deployed. */
export interface QueryLogEntry {
  id: string;
  time: string;
  /** "risk-check": the Hybrid and Multiple choice self-harm check on typed text. Older entries have none (a match). */
  kind?: "match" | "risk-check";
  /** Older entries (before the step-by-step options) have no source; treat them as free text. */
  source?: MatchSource;
  text: unknown;
  /** Hybrid or Multiple choice answers by question id. */
  answers?: unknown;
  /** Course ids Hybrid or Multiple choice ruled out before matching. */
  exclude?: unknown;
  /** Who the query was about. Older entries have none (the user). */
  about?: MatchAbout;
  status: number;
  durationMs: number;
  body: MatchResponse | RiskCheckResponse | MatchError;
  errorLog?: string;
  /** Which service scored it. Missing on entries logged before Azure was added (JEV). */
  provider?: "jev" | "azure";
  /** The scoring service's request and response; named before Azure was added, so they hold Azure's too. */
  jevRequest?: unknown;
  jevResponse?: unknown;
  /** AI_PROVIDER=compare only: the second provider's request and response, or its error. */
  compare?: { provider: "jev" | "azure"; request?: unknown; response?: unknown; error?: string };
}
