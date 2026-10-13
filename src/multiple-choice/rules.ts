// Multiple choice matches courses with fixed rules in the browser: no AI, nothing sent to a server.
// DRAFT mapping, alongside the questions: needs clinical review before use beyond the internal team.

import { COURSES } from "../data/courses";
import { aodCourse } from "../step-flow/engine";
import type { MatchResponse, ScoredCourse, StepAnswers } from "../types";
import { MULTIPLE_CHOICE_QUESTIONS } from "./questions";

/** Follow-up answer → course, per topic. "not_sure" offers every course in that topic. */
const DETAIL_COURSES: Record<string, Record<string, string>> = {
  worry: {
    worry: "generalised_anxiety",
    panic: "panic",
    social: "social_anxiety",
    health: "health_anxiety",
    stress: "stress",
    ocd: "ocd",
  },
  low_mood: { down: "depression", mixed: "mixed" },
  coping: { coping: "staying_on_track", mindfulness: "mindfulness" },
};

/** Step-one topics, in the order they're listed. */
const TOPIC_ORDER = (MULTIPLE_CHOICE_QUESTIONS[0].options ?? []).map((o) => o.id);

const MATCHABLE = COURSES.filter((c) => !c.nzslVersionOf);
const nzslVersionFor = (id: string) => {
  const v = COURSES.find((c) => c.nzslVersionOf === id);
  return v && { name: v.name, url: v.url };
};

/** Course ids for the answers, in step-one topic order, with the answer that led to each (for the debug panel). */
function pick(answers: StepAnswers): { id: string; reason: string }[] {
  const out: { id: string; reason: string }[] = [];
  const add = (id: string | undefined, reason: string) => {
    if (id && !out.some((o) => o.id === id)) out.push({ id, reason });
  };
  const concerns = Array.isArray(answers.concerns) ? answers.concerns : [];
  // Step-one order, not the order they were ticked in.
  for (const topic of TOPIC_ORDER.filter((t) => concerns.includes(t))) {
    const map = DETAIL_COURSES[topic];
    if (map) {
      const details = answers[`${topic}_detail`];
      const chosen = Array.isArray(details) ? details : [];
      const ids = chosen.includes("not_sure") ? Object.keys(map) : chosen;
      for (const d of ids) {
        // Finished Overcoming Panic: offer the follow-on course instead.
        const id = d === "panic" && answers.panic_done === "yes" ? "panic_next_steps" : map[d];
        add(id, chosen.includes("not_sure") ? `${topic}: not sure` : `${topic}: ${d}`);
      }
    } else if (topic === "sleep") {
      add("insomnia", "sleep");
    } else if (topic === "perinatal") {
      if (answers.life_stage === "pregnant") add("pregnancy", "perinatal: pregnant");
      if (answers.life_stage === "baby") add("postnatal", "perinatal: baby");
    } else if (topic === "aod") {
      add(aodCourse(answers), `aod: ${answers.aod_stage}`);
    }
  }
  return out;
}

/** The answers as a MatchResponse, so the results, crisis panel and mood rule work as they do for the AI options. */
export function matchByRules(answers: StepAnswers): MatchResponse {
  const picks = pick(answers);
  const scored = (c: (typeof MATCHABLE)[number]): ScoredCourse => ({
    ...c,
    probability: picks.some((p) => p.id === c.id) ? 1 : 0,
    nzslVersion: nzslVersionFor(c.id),
  });
  const results = picks.map((p) => scored(MATCHABLE.find((c) => c.id === p.id)!));
  const all = [...results, ...MATCHABLE.filter((c) => !picks.some((p) => p.id === c.id)).map(scored)];
  return {
    results,
    all,
    // No AI scores. Thresholds of 1 mean no flag is ever hit; the risk question decides the crisis panel.
    flags: { selfHarm: 0, offTopic: 0, someoneElse: 0 },
    thresholds: { match: 1, selfHarm: 1, offTopic: 1, someoneElse: 1, maxResults: results.length },
    excluded: [],
    model: "rules (no AI)",
    ruleReasons: Object.fromEntries(picks.map((p) => [p.id, p.reason])),
  };
}
