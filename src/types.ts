import type { Course } from "./data/courses.js";

export interface ScoredCourse extends Course {
  probability: number;
  /** The NZSL version of this course, if one exists. */
  nzslVersion?: { name: string; url: string };
  /** Set when a rule added the course rather than JEV's score: lib/aodRule.ts, or lib/moodRule.ts with the crisis panel. */
  addedByRule?: "aod" | "mood";
}

/** Which AI service scored a request. Missing on entries logged before Azure was added (JEV). */
export type ScoringProvider = "jev" | "azure";

/** Azure content filter self-harm severity for the text; "blocked": the filter rejected it. */
export type FilterSeverity = "safe" | "low" | "medium" | "high" | "blocked";

/** Token counts for one request (no personal data), used for the debug cost figures. */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface MatchResponse {
  results: ScoredCourse[];
  all: ScoredCourse[];
  /**
   * `aod` is missing on entries logged before it was added. `selfHarm` is what the app acts on: 1 when the Azure
   * content filter flagged self-harm, otherwise the model's score (`selfHarmModel`).
   */
  flags: {
    selfHarm: number;
    offTopic: number;
    someoneElse: number;
    aod?: number;
    selfHarmModel?: number;
    filterSelfHarm?: FilterSeverity;
  };
  thresholds: {
    match: number;
    selfHarm: number;
    offTopic: number;
    someoneElse: number;
    maxResults: number;
    aod?: number;
  };
  /** Names of courses ruled out before matching (Hybrid and Multiple choice rules). */
  excluded: string[];
  /** Missing on entries logged before it was added. */
  usage?: TokenUsage;
  model: string;
  provider?: ScoringProvider;
  /** AI_PROVIDER=compare only: the second provider's scores for the same text, for the debug view. */
  compare?: CompareScores;
}

/** The second provider's scores in compare mode. `error` is a safe log line when it failed. */
export interface CompareScores {
  provider: ScoringProvider;
  model?: string;
  flags?: MatchResponse["flags"];
  /** Course id → P(yes). */
  courses?: Record<string, number>;
  otherAtRisk?: number;
  error?: string;
}

/** Result of the Hybrid and Multiple choice self-harm check on typed text. */
export interface RiskCheckResponse {
  /** Risk to the person filling it in: 1 when the Azure content filter flagged self-harm, else the model's score. */
  selfHarm: number;
  /** Risk to someone they're supporting. */
  otherAtRisk: number;
  usage?: TokenUsage;
  threshold: number;
  model: string;
  provider?: ScoringProvider;
  selfHarmModel?: number;
  filterSelfHarm?: FilterSeverity;
  compare?: CompareScores;
}

export interface MatchError {
  error: string;
}

/** Who a query is about: the user, or the person they're supporting. Only used by the debug log. */
export type MatchAbout = "self" | "them";

/** Which option produced a query; only used by the debug log. */
export type MatchSource = "free-text" | "hybrid" | "multiple-choice";

/** Hybrid and Multiple choice answers by question id: an option id, option ids, or free text. */
export type StepAnswers = Record<string, string | string[]>;
