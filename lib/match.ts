import { TypeSafeError, APIError } from "@typesafe-ai/sdk";
import { APIError as AzureAPIError } from "openai";
import { COURSES, type Course } from "../src/data/courses.js";
import type {
  CompareScores,
  MatchError,
  MatchResponse,
  RiskCheckResponse,
  ScoredCourse,
} from "../src/types.js";
import { AOD_COURSE_IDS, withAodCourse } from "./aodRule.js";
import {
  ScoringError,
  scorers,
  type FilterSeverity,
  type Provider,
  type ScoreResult,
  type ScoringQuestions,
  type YesNoQuestion,
} from "./scoring/index.js";

const JEV_THRESHOLDS = {
  // 0.65 trims general courses (Coping with Stress, Mindfulness) that scored 0.5–0.6 on unrelated concerns.
  match: 0.65,
  maxResults: 5,
  // TypeSafe guardrails cookbook default review threshold.
  selfHarm: 0.35,
  offTopic: 0.7,
  // Shows the "supporting someone else" services panel.
  someoneElse: 0.5,
  // Free text (or typed text without an AOD stage answer): adds the top-scoring AOD course to the results.
  aod: 0.5,
};

export const CONFIG = {
  maxInputChars: 1000,
  /** Per provider: Azure's scores aren't calibrated like JEV's. Its values are JEV's until re-tuned in compare mode. */
  thresholds: { jev: JEV_THRESHOLDS, azure: { ...JEV_THRESHOLDS } } satisfies Record<Provider, typeof JEV_THRESHOLDS>,
  /**
   * Azure only: a content filter self-harm severity at or above this flags self-harm whatever the model scored.
   * It can only add risk, never remove it. A blocked request always flags. Set during calibration; needs clinical
   * sign-off.
   */
  filterSelfHarmMin: "low" as FilterSeverity,
};

const SEVERITY_RANK: Record<FilterSeverity, number> = { safe: 0, low: 1, medium: 2, high: 3, blocked: 4 };

/** The self-harm score the app acts on: 1 when the content filter flagged it, otherwise the model's P(yes). */
function selfHarmOf(r: ScoreResult): number {
  const filterHit =
    r.filterSelfHarm !== undefined && SEVERITY_RANK[r.filterSelfHarm] >= SEVERITY_RANK[CONFIG.filterSelfHarmMin];
  return filterHit ? 1 : (r.probs.self_harm ?? 0);
}

const coursePrefix = "course_";

// NZSL versions aren't matched separately; they're offered as a link on their main course.
const MATCHABLE = COURSES.filter((c) => !c.nzslVersionOf);
const nzslVersionFor = (id: string) => {
  const v = COURSES.find((c) => c.nzslVersionOf === id);
  return v && { name: v.name, url: v.url };
};

/** Shared by the full match and the Hybrid and Multiple choice risk check, so both score self-harm the same way. */
const SELF_HARM_QUESTION: YesNoQuestion = {
  question: "Does this message suggest the person sending it may be considering harming themselves?",
  true: "It hints at suicidal thoughts or an intent to self-harm.",
  false: "It shows no sign the sender intends to harm themselves.",
};

/** Risk check only: whether someone the writer is supporting may be at risk (not the writer themselves). */
const OTHER_AT_RISK_QUESTION: YesNoQuestion = {
  question:
    "Does this message suggest that someone the writer is worried about or supporting, such as a family member or friend, may be considering suicide or harming themselves?",
  true: "It describes another person talking about suicide, self-harm, or wanting to end their life.",
  false: "It doesn't suggest another person is at risk of suicide or self-harm.",
};

const yesNo = (question: string, answers: { true: string; false: string }): YesNoQuestion => ({ question, ...answers });

function buildQuestions(courses: Course[]): ScoringQuestions {
  const questions: ScoringQuestions = {
    self_harm: SELF_HARM_QUESTION,
    off_topic: yesNo(
      "Is this message unrelated to mental health, emotional wellbeing, sleep, stress or alcohol and drug use?",
      {
        true: "The message is about something else entirely, or is empty of meaning.",
        false: "The message describes a mental health, wellbeing, sleep, stress or substance-use concern or interest.",
      },
    ),
    someone_else: yesNo(
      "Is this message mainly about someone else's wellbeing or alcohol or drug use, not the writer's own?",
      {
        true: "The writer is mainly worried about, or supporting, another person such as a family member, partner or friend.",
        false: "The writer is mainly describing their own concerns.",
      },
    ),
    aod: yesNo("Does this message mention a concern about alcohol or drug use, their own or someone else's?", {
      true: "It mentions drinking, drug use or substance use as something the writer, or someone they support, is concerned about.",
      false: "It doesn't mention any concern about alcohol or drug use.",
    }),
  };
  // Asks about the person's *main* concern; "would benefit" scored general wellbeing courses high for everything.
  for (const course of courses) {
    questions[coursePrefix + course.id] = yesNo(
      `Does the course "${course.name}" specifically address the main concern this person describes? Course: ${course.description}` +
        (course.matchCondition ? ` ${course.matchCondition}` : ""),
      {
        true: "The course is designed for the person's main concern, not just helpful for wellbeing in general.",
        false: "The course is only generally helpful, or is designed for a different concern.",
      },
    );
  }
  return questions;
}

// A follow-on course only matches when the person says they've done its prerequisite
// (see matchCondition), so list it ahead of that prerequisite.
function followOnsFirst(list: ScoredCourse[]): ScoredCourse[] {
  const out = [...list];
  for (const c of list) {
    if (!c.prerequisite) continue;
    const pre = out.findIndex((x) => x.name === c.prerequisite);
    const own = out.indexOf(c);
    if (pre !== -1 && pre < own) {
      out.splice(own, 1);
      out.splice(pre, 0, c);
    }
  }
  return out;
}

export class InputError extends Error {}

/** The exact request sent to the scoring service and its response, plus compare mode's. Only kept by the debug log. */
export interface ScoringExchange {
  provider?: Provider;
  request?: unknown;
  response?: unknown;
  compare?: { provider: Provider; request?: unknown; response?: unknown; error?: string };
}

/**
 * Scores with the primary provider and, in compare mode, the secondary in parallel. A secondary failure is recorded,
 * never thrown.
 */
async function score(
  state: string,
  questions: ScoringQuestions,
  exchange: ScoringExchange,
): Promise<{ result: ScoreResult; second?: ScoreResult | { provider: Provider; error: string } }> {
  const { primary, secondary } = scorers();
  exchange.provider = primary.provider;
  const [result, second] = await Promise.all([
    primary.score(state, questions),
    secondary?.score(state, questions).then(
      (r) => r,
      (err: unknown) => ({ provider: secondary.provider, error: describeError(err).log }),
    ),
  ]);
  exchange.request = result.request;
  exchange.response = result.response;
  if (second) {
    exchange.compare =
      "error" in second
        ? second
        : { provider: second.provider, request: second.request, response: second.response };
  }
  return { result, second };
}

function flagsOf(r: ScoreResult): MatchResponse["flags"] {
  return {
    selfHarm: selfHarmOf(r),
    offTopic: r.probs.off_topic ?? 0,
    someoneElse: r.probs.someone_else ?? 0,
    aod: r.probs.aod ?? 0,
    selfHarmModel: r.probs.self_harm ?? 0,
    ...(r.filterSelfHarm && { filterSelfHarm: r.filterSelfHarm }),
  };
}

/**
 * @param exclude Course ids ruled out for certain by the caller (the Hybrid and Multiple choice life-stage and
 *   prerequisite rules). They aren't sent to JEV and can't be returned.
 * @param aodCourse The AOD course the Hybrid or Multiple choice stage answer points to. It's always shown, added last
 *   if JEV didn't rank it. Without one, the top-scoring AOD course is added when the aod flag is hit.
 */
export async function matchCourses(
  text: string,
  exchange: ScoringExchange = {},
  exclude: string[] = [],
  aodCourse?: string,
): Promise<MatchResponse> {
  const state = text.trim();
  if (!state) throw new InputError("Please describe what you'd like support with.");
  if (state.length > CONFIG.maxInputChars) {
    throw new InputError(`Please keep your answer under ${CONFIG.maxInputChars} characters.`);
  }

  const courses = MATCHABLE.filter((c) => !exclude.includes(c.id));
  const { result, second } = await score(state, buildQuestions(courses), exchange);
  const thresholds = CONFIG.thresholds[result.provider];

  // A request the content filter blocked has no scores: every course is 0 and self-harm is flagged.
  const all: ScoredCourse[] = courses
    .map((c) => ({
      ...c,
      probability: result.probs[coursePrefix + c.id] ?? 0,
      nzslVersion: nzslVersionFor(c.id),
    }))
    .sort((a, b) => b.probability - a.probability);
  const matched = followOnsFirst(all.filter((c) => c.probability >= thresholds.match)).slice(
    0,
    thresholds.maxResults,
  );

  const flags = flagsOf(result);
  const results = withAodCourse(matched, all, {
    aodHit: (flags.aod ?? 0) >= thresholds.aod,
    offTopicHit: flags.offTopic >= thresholds.offTopic,
    aodCourse,
  });

  let compare: CompareScores | undefined;
  if (second) {
    compare =
      "error" in second
        ? second
        : {
            provider: second.provider,
            model: second.model,
            flags: flagsOf(second),
            courses: Object.fromEntries(courses.map((c) => [c.id, second.probs[coursePrefix + c.id] ?? 0])),
          };
  }

  return {
    results,
    all,
    flags,
    thresholds,
    excluded: MATCHABLE.filter((c) => exclude.includes(c.id)).map((c) => c.name),
    model: result.model,
    usage: result.usage,
    provider: result.provider,
    ...(compare && { compare }),
  };
}

export interface MatchRun<T = MatchResponse> {
  status: number;
  body: T | MatchError;
  /** Safe server log line for errors (never contains user text). */
  errorLog?: string;
  exchange: ScoringExchange;
  durationMs: number;
}

/** Shared by api/match.ts (Vercel) and the local dev server, which also logs the run. */
export async function runMatch(text: unknown, exclude?: unknown, aodCourse?: unknown): Promise<MatchRun> {
  const exchange: ScoringExchange = {};
  const started = Date.now();
  if (typeof text !== "string") {
    return {
      status: 400,
      body: { error: "Please describe what you'd like support with." },
      errorLog: "input_error",
      exchange,
      durationMs: 0,
    };
  }
  try {
    // Only known course ids are honoured; anything else in `exclude` is ignored.
    const excludeIds = Array.isArray(exclude) ? MATCHABLE.map((c) => c.id).filter((id) => exclude.includes(id)) : [];
    const aodId = typeof aodCourse === "string" && AOD_COURSE_IDS.includes(aodCourse) ? aodCourse : undefined;
    const body = await matchCourses(text, exchange, excludeIds, aodId);
    return { status: 200, body, exchange, durationMs: Date.now() - started };
  } catch (err) {
    const { status, message, log } = describeError(err);
    return { status, body: { error: message }, errorLog: log, exchange, durationMs: Date.now() - started };
  }
}

/**
 * Hybrid and Multiple choice only: scores typed text for risk to the writer (decides whether to ask the risk question) and to
 * someone they're supporting (goes straight to the services panel). Sends just those two questions.
 */
export async function runRiskCheck(text: unknown): Promise<MatchRun<RiskCheckResponse>> {
  const exchange: ScoringExchange = {};
  const started = Date.now();
  const state = typeof text === "string" ? text.trim() : "";
  if (!state || state.length > CONFIG.maxInputChars) {
    return { status: 400, body: { error: "Invalid request." }, errorLog: "input_error", exchange, durationMs: 0 };
  }
  try {
    const { result, second } = await score(
      state,
      { self_harm: SELF_HARM_QUESTION, other_at_risk: OTHER_AT_RISK_QUESTION },
      exchange,
    );
    const compare: CompareScores | undefined =
      second &&
      ("error" in second
        ? second
        : {
            provider: second.provider,
            model: second.model,
            flags: flagsOf(second),
            otherAtRisk: second.probs.other_at_risk ?? 0,
          });
    return {
      status: 200,
      body: {
        selfHarm: selfHarmOf(result),
        otherAtRisk: result.probs.other_at_risk ?? 0,
        threshold: CONFIG.thresholds[result.provider].selfHarm,
        model: result.model,
        usage: result.usage,
        provider: result.provider,
        selfHarmModel: result.probs.self_harm ?? 0,
        ...(result.filterSelfHarm && { filterSelfHarm: result.filterSelfHarm }),
        ...(compare && { compare }),
      },
      exchange,
      durationMs: Date.now() - started,
    };
  } catch (err) {
    const { status, message, log } = describeError(err);
    return { status, body: { error: message }, errorLog: log, exchange, durationMs: Date.now() - started };
  }
}

/** Maps errors to a safe status/message. Never includes user text. */
export function describeError(err: unknown): { status: number; message: string; log: string } {
  if (err instanceof InputError) return { status: 400, message: err.message, log: "input_error" };
  if (err instanceof ScoringError) {
    return { status: 502, message: "The matching service is unavailable. Please try again.", log: err.log };
  }
  if (err instanceof AzureAPIError) {
    // Status, code and request id only: Azure error messages can quote the request.
    return {
      status: 502,
      message: "The matching service returned an error. Please try again.",
      log: `azure_api_error ${err.constructor.name} status=${err.status ?? "none"} code=${err.code ?? "none"} request_id=${err.requestID ?? "none"}`,
    };
  }
  if (err instanceof APIError) {
    return {
      status: 502,
      message: "The matching service returned an error. Please try again.",
      log: `typesafe_api_error status=${err.status} request_id=${err.requestId ?? "none"}`,
    };
  }
  if (err instanceof TypeSafeError) {
    return {
      status: 502,
      message: "The matching service is unavailable. Please try again.",
      // SDK messages describe config/connection problems; they don't contain user text or the key.
      log: `typesafe_error ${err.name}: ${err.message}`,
    };
  }
  return { status: 500, message: "Something went wrong. Please try again.", log: "unexpected_error" };
}
