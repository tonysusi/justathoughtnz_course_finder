import type { Course } from "./data/courses.js";

export interface ScoredCourse extends Course {
  probability: number;
  /** The NZSL version of this course, if one exists. */
  nzslVersion?: { name: string; url: string };
  /**
   * Set when a rule added the course rather than JEV's score: lib/aodRule.ts, lib/lifeStageRule.ts,
   * lib/clinicalRules.ts, or lib/moodRule.ts with the crisis panel.
   */
  addedByRule?: "aod" | "mood" | "life_stage" | "clinical";
}

/** JEV token counts for one request (no personal data), used for the debug cost figures. */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface MatchResponse {
  results: ScoredCourse[];
  all: ScoredCourse[];
  /** The optional flags are missing on entries logged before they were added (and Multiple choice has none). */
  flags: {
    selfHarm: number;
    offTopic: number;
    someoneElse: number;
    /** Someone they're supporting may be considering suicide or self-harm (uses the self-harm threshold). */
    otherAtRisk?: number;
    /** Someone they're supporting has low mood, alcohol or drug concerns or a young baby: asks the risk question about them. */
    theirTopic?: number;
    aod?: number;
    /** The writer's own low mood: one of the topics that brings up the risk question. */
    lowMood?: number;
    /** The writer has their own baby under 18 months: brings up the risk question. */
    newBaby?: number;
    pregnancyLoss?: number;
    tryingToConceive?: number;
    /** The writer says they're under 16: shows the youth support box. */
    under16?: number;
  };
  thresholds: {
    match: number;
    selfHarm: number;
    offTopic: number;
    someoneElse: number;
    maxResults: number;
    aod?: number;
    /** For lowMood, newBaby, theirTopic, pregnancyLoss, tryingToConceive and under16. */
    topic?: number;
  };
  /** Names of courses ruled out before matching (Hybrid and Multiple choice rules). */
  excluded: string[];
  /** Missing on entries logged before it was added. */
  usage?: TokenUsage;
  model: string;
  /** Multiple choice only (matched by rules, no AI): the answer that led to each course id, for the debug panel. */
  ruleReasons?: Record<string, string>;
}

/** Result of the Hybrid check on typed text that decides whether to ask the risk question. */
export interface RiskCheckResponse {
  /** Risk to the person filling it in. */
  selfHarm: number;
  /** Risk to someone they're supporting. */
  otherAtRisk: number;
  /** Low mood, alcohol or drugs or a young baby for someone they're supporting. Missing on older entries. */
  theirTopic?: number;
  /** Topics that also bring up the risk question. Missing on entries logged before they were added. */
  lowMood?: number;
  aod?: number;
  newBaby?: number;
  usage?: TokenUsage;
  threshold: number;
  /** For lowMood, aod, newBaby and theirTopic. */
  topicThreshold?: number;
  model: string;
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
