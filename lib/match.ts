import {
  TypeSafeClient,
  TypeSafeError,
  APIError,
  noul,
  type Questions,
  type SystemOneRequestPayload,
} from "@typesafe-ai/sdk";
import { COURSES, type Course } from "../src/data/courses.js";
import type { MatchError, MatchResponse, RiskCheckResponse, ScoredCourse } from "../src/types.js";

export const CONFIG = {
  model: "jev-latest",
  maxInputChars: 1000,
  thresholds: {
    // 0.65 trims general courses (Coping with Stress, Mindfulness) that scored 0.5–0.6 on unrelated concerns.
    match: 0.65,
    maxResults: 5,
    // TypeSafe guardrails cookbook default review threshold.
    selfHarm: 0.35,
    offTopic: 0.7,
    // Shows the "supporting someone else" services panel.
    someoneElse: 0.5,
  },
};

const coursePrefix = "course_";

// NZSL versions aren't matched separately; they're offered as a link on their main course.
const MATCHABLE = COURSES.filter((c) => !c.nzslVersionOf);
const nzslVersionFor = (id: string) => {
  const v = COURSES.find((c) => c.nzslVersionOf === id);
  return v && { name: v.name, url: v.url };
};

/** Shared by the full match and the Hybrid and Multiple choice risk check, so both score self-harm the same way. */
const SELF_HARM_QUESTION = noul(
  "Does this message suggest the person sending it may be considering harming themselves?",
  {
    true: "It hints at suicidal thoughts or an intent to self-harm.",
    false: "It shows no sign the sender intends to harm themselves.",
  },
);

/** Risk check only: whether someone the writer is supporting may be at risk (not the writer themselves). */
const OTHER_AT_RISK_QUESTION = noul(
  "Does this message suggest that someone the writer is worried about or supporting, such as a family member or friend, may be considering suicide or harming themselves?",
  {
    true: "It describes another person talking about suicide, self-harm, or wanting to end their life.",
    false: "It doesn't suggest another person is at risk of suicide or self-harm.",
  },
);

function buildQuestions(courses: Course[]): Questions {
  const questions: Questions = {
    self_harm: SELF_HARM_QUESTION,
    off_topic: noul(
      "Is this message unrelated to mental health, emotional wellbeing, sleep, stress or alcohol and drug use?",
      {
        true: "The message is about something else entirely, or is empty of meaning.",
        false: "The message describes a mental health, wellbeing, sleep, stress or substance-use concern or interest.",
      },
    ),
    someone_else: noul(
      "Is this message mainly about someone else's wellbeing or alcohol or drug use, not the writer's own?",
      {
        true: "The writer is mainly worried about, or supporting, another person such as a family member, partner or friend.",
        false: "The writer is mainly describing their own concerns.",
      },
    ),
  };
  // Asks about the person's *main* concern; "would benefit" scored general wellbeing courses high for everything.
  for (const course of courses) {
    questions[coursePrefix + course.id] = noul(
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

let client: TypeSafeClient | undefined;

function getClient(): TypeSafeClient {
  // logLevel is pinned so "debug" (which logs request bodies) can't be switched on by env.
  client ??= new TypeSafeClient({ logLevel: "error", timeout: 15000 });
  return client;
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

/** The exact request sent to JEV and the response it returned. Only kept by the debug log. */
export interface JevExchange {
  request?: SystemOneRequestPayload;
  response?: unknown;
}

/**
 * @param exclude Course ids ruled out for certain by the caller (the Hybrid and Multiple choice life-stage and
 *   prerequisite rules). They aren't sent to JEV and can't be returned.
 */
export async function matchCourses(
  text: string,
  exchange: JevExchange = {},
  exclude: string[] = [],
): Promise<MatchResponse> {
  const state = text.trim();
  if (!state) throw new InputError("Please describe what you'd like support with.");
  if (state.length > CONFIG.maxInputChars) {
    throw new InputError(`Please keep your answer under ${CONFIG.maxInputChars} characters.`);
  }

  const courses = MATCHABLE.filter((c) => !exclude.includes(c.id));
  exchange.request = { state, model: CONFIG.model, questions: buildQuestions(courses) };
  const jevResponse = await getClient().systemOne(exchange.request);
  exchange.response = jevResponse;
  const { answers, model, usage } = jevResponse;

  const prob = (key: string): number => {
    const a = answers[key];
    return a && a.type === "noul" ? a.noul : 0;
  };

  const all: ScoredCourse[] = courses
    .map((c) => ({
      ...c,
      probability: prob(coursePrefix + c.id),
      nzslVersion: nzslVersionFor(c.id),
    }))
    .sort((a, b) => b.probability - a.probability);
  const results = followOnsFirst(all.filter((c) => c.probability >= CONFIG.thresholds.match)).slice(
    0,
    CONFIG.thresholds.maxResults,
  );

  return {
    results,
    all,
    flags: { selfHarm: prob("self_harm"), offTopic: prob("off_topic"), someoneElse: prob("someone_else") },
    thresholds: CONFIG.thresholds,
    excluded: MATCHABLE.filter((c) => exclude.includes(c.id)).map((c) => c.name),
    model,
    usage: { input_tokens: usage.input_tokens, output_tokens: usage.output_tokens },
  };
}

export interface MatchRun<T = MatchResponse> {
  status: number;
  body: T | MatchError;
  /** Safe server log line for errors (never contains user text). */
  errorLog?: string;
  exchange: JevExchange;
  durationMs: number;
}

/** Shared by api/match.ts (Vercel) and the local dev server, which also logs the run. */
export async function runMatch(text: unknown, exclude?: unknown): Promise<MatchRun> {
  const exchange: JevExchange = {};
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
    const body = await matchCourses(text, exchange, excludeIds);
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
  const exchange: JevExchange = {};
  const started = Date.now();
  const state = typeof text === "string" ? text.trim() : "";
  if (!state || state.length > CONFIG.maxInputChars) {
    return { status: 400, body: { error: "Invalid request." }, errorLog: "input_error", exchange, durationMs: 0 };
  }
  try {
    exchange.request = {
      state,
      model: CONFIG.model,
      questions: { self_harm: SELF_HARM_QUESTION, other_at_risk: OTHER_AT_RISK_QUESTION },
    };
    const jevResponse = await getClient().systemOne(exchange.request);
    exchange.response = jevResponse;
    const prob = (key: string) => {
      const a = jevResponse.answers[key];
      return a && a.type === "noul" ? a.noul : 0;
    };
    return {
      status: 200,
      body: {
        selfHarm: prob("self_harm"),
        otherAtRisk: prob("other_at_risk"),
        threshold: CONFIG.thresholds.selfHarm,
        model: jevResponse.model,
        usage: { input_tokens: jevResponse.usage.input_tokens, output_tokens: jevResponse.usage.output_tokens },
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
