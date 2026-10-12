import type { FilterSeverity, ScoringProvider, TokenUsage } from "../../src/types.js";

export type Provider = ScoringProvider;
export type { FilterSeverity };

/** One yes/no question about the person's text, scored as P(yes). The same shape JEV's `noul()` takes. */
export interface YesNoQuestion {
  question: string;
  true: string;
  false: string;
}

export type ScoringQuestions = Record<string, YesNoQuestion>;

export interface ScoreResult {
  provider: Provider;
  /** P(yes) for every question key. Empty when the request was blocked. */
  probs: Record<string, number>;
  model: string;
  usage: TokenUsage;
  /** Azure only. */
  filterSelfHarm?: FilterSeverity;
  /** The exact request and response, for the debug log only. */
  request: unknown;
  response: unknown;
}

export interface Scorer {
  provider: Provider;
  score(state: string, questions: ScoringQuestions): Promise<ScoreResult>;
}

/** A scoring service is misconfigured or returned something unusable. `log` is safe to log: never user text. */
export class ScoringError extends Error {
  constructor(readonly log: string) {
    super(log);
  }
}
