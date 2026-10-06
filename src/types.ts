import type { Course } from "./data/courses.js";

export interface ScoredCourse extends Course {
  probability: number;
  /** The NZSL version of this course, if one exists. */
  nzslVersion?: { name: string; url: string };
}

/** JEV token counts for one request (no personal data), used for the local debug cost figures. */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface MatchResponse {
  results: ScoredCourse[];
  all: ScoredCourse[];
  flags: { selfHarm: number; offTopic: number; someoneElse: number };
  thresholds: { match: number; selfHarm: number; offTopic: number; someoneElse: number; maxResults: number };
  /** Names of courses ruled out before matching (Hybrid and Multiple choice rules). */
  excluded: string[];
  /** Missing on entries logged before it was added. */
  usage?: TokenUsage;
  model: string;
}

/** Result of the Hybrid and Multiple choice self-harm check on typed text. */
export interface RiskCheckResponse {
  /** Risk to the person filling it in. */
  selfHarm: number;
  /** Risk to someone they're supporting. */
  otherAtRisk: number;
  usage?: TokenUsage;
  threshold: number;
  model: string;
}

export interface MatchError {
  error: string;
}

/** Who a query is about: the user, or the person they're supporting. Only used by the local debug log. */
export type MatchAbout = "self" | "them";

/** Which option produced a query; only used by the local debug log. */
export type MatchSource = "free-text" | "hybrid" | "multiple-choice";

/** Hybrid and Multiple choice answers by question id: an option id, option ids, or free text. */
export type StepAnswers = Record<string, string | string[]>;
