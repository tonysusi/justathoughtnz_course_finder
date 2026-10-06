// Shared step-by-step flow engine, used by the Hybrid and Multiple choice options. Each option supplies its own
// question set; these helpers decide which questions show, check answers, and build the summary sent to JEV.
//
// Answers are turned into a short third-person summary (buildSummary) and sent to JEV like free text.
// Life-stage and prerequisite rules are applied in code (excludedCourses) rather than left to JEV.

import type { StepAnswers } from "../types";

export interface Option {
  id: string;
  label: string;
  /** How this answer reads in the summary sent to JEV; omit to leave it out of the summary. */
  summary?: string;
  /** Choosing this clears the other options, and choosing another clears this one. */
  exclusive?: boolean;
  /** Shown greyed out and can't be chosen; the text is shown after the label, e.g. "coming soon". */
  disabled?: string;
  /** Heading this option is listed under, in a step that groups its options. */
  group?: string;
  /** A text box shown under this option when it's chosen, stored as its own answer. */
  text?: {
    answerId: string;
    label: string;
    maxLength: number;
    /** Required when this is the only option chosen, since there's nothing else to match on. */
    requiredIfOnly?: boolean;
  };
}

export interface Question {
  id: string;
  prompt: string;
  hint?: string;
  kind: "single" | "multi" | "text";
  options?: Option[];
  /** Options that depend on earlier answers; used instead of `options`. */
  optionsFor?: (answers: StepAnswers) => Option[];
  /** Follow-up questions: only shown when this returns true. */
  showIf?: (answers: StepAnswers) => boolean;
  /** Summary sentence for a single-choice answer, given the chosen option. Defaults to the option's summary. */
  summarise?: (option: Option) => string;
  optional?: boolean;
  maxLength?: number;
  /** Extra rule for whether the step is complete, on top of the default "something is chosen". */
  validate?: (answers: StepAnswers) => boolean;
  /** Start of a multi-choice summary sentence. Defaults to "They would like help with". */
  summaryPrefix?: string;
  /** Questions about the person they're supporting, matched separately (buildSummary(answers, "them")). */
  about?: "them";
}

/** Shown with every free-text box. */
export const TEXT_HINT =
  "Optional. For example, how long this has been going on. This isn't read by a person, so if you need to talk to someone now, free call or text 1737.";

export const chose = (answers: StepAnswers, questionId: string, optionId: string) => {
  const a = answers[questionId];
  return Array.isArray(a) ? a.includes(optionId) : a === optionId;
};

/** True when they chose "Supporting someone else". */
export function supportingSomeoneElse(answers: StepAnswers): boolean {
  return chose(answers, "concerns", "someone_else");
}

/** True when there's anything about the person themselves to match courses on. */
export function hasOwnConcerns(answers: StepAnswers): boolean {
  const a = answers.concerns;
  return Array.isArray(a) && a.some((id) => id !== "someone_else");
}

/** True when there's anything about the person they're supporting to match courses on. */
export function hasTheirConcerns(answers: StepAnswers): boolean {
  const a = answers.their_concerns;
  return supportingSomeoneElse(answers) && Array.isArray(a) && a.length > 0;
}

/**
 * DRAFT risk question: wording and the response to each answer need clinical sign-off.
 * Handled in the browser (riskLevel) so support shows even if JEV fails. The options have no `summary`,
 * so the answer is never sent to JEV.
 * Only asked when earlier answers highlight a possible risk (decision 6 Oct 2026; flagged for clinical review):
 * - `triggeredBy`: the question set's own rule, e.g. choosing low mood or alcohol or drug use;
 * - typed text JEV scores at or above the self-harm threshold, or a check that failed (checked by StepFlowApp,
 *   stored as the internal `text_risk` answer). It must be last in a set so all typed text comes before it.
 */
export function riskQuestion(triggeredBy: (answers: StepAnswers) => boolean): Question {
  return {
    id: "risk",
    prompt: "Lately, have you had thoughts of ending your life or harming yourself?",
    hint: "We ask this so we can point you to the right support.",
    kind: "single",
    showIf: (a) => triggeredBy(a) || a.text_risk === "flagged" || a.text_risk === "unknown",
    options: [
      { id: "no", label: "No" },
      { id: "yes", label: "Yes" },
      { id: "unsure", label: "I'm not sure, or I'd rather not say" },
    ],
  };
}

export function optionsOf(q: Question, answers: StepAnswers): Option[] {
  return q.optionsFor ? q.optionsFor(answers) : (q.options ?? []);
}

/** Text boxes belonging to the options currently chosen for this question. */
function chosenTexts(q: Question, answers: StepAnswers): NonNullable<Option["text"]>[] {
  const a = answers[q.id];
  const ids = Array.isArray(a) ? a : a ? [a] : [];
  return optionsOf(q, answers).flatMap((o) => (o.text && ids.includes(o.id) ? [o.text] : []));
}

/** Ends free text with a full stop if it has no closing punctuation, so the next summary sentence doesn't run on. */
const asSentence = (text: string) => (/[.!?]["')]?$/.test(text) ? text : `${text}.`);

const textOf = (answers: StepAnswers, answerId: string) => {
  const t = answers[answerId];
  return typeof t === "string" ? t.trim() : "";
};

/** The questions to show for the current answers, in order. */
export function visibleQuestions(answers: StepAnswers, set: Question[]): Question[] {
  return set.filter((q) => !q.showIf || q.showIf(answers));
}

/**
 * Answers to visible questions only, so a follow-up hidden by a later change isn't sent or logged.
 * Also drops a single-choice answer that's no longer one of the options (e.g. a main concern that was unticked).
 */
export function visibleAnswers(answers: StepAnswers, set: Question[]): StepAnswers {
  const out: StepAnswers = {};
  for (const q of visibleQuestions(answers, set)) {
    const a = answers[q.id];
    if (a === undefined || a.length === 0) continue;
    if (q.kind === "single" && !optionsOf(q, answers).some((o) => o.id === a)) continue;
    if (Array.isArray(a)) {
      // Drop choices that are no longer options, e.g. details for a group that was unticked in step one.
      const valid = a.filter((id) => optionsOf(q, answers).some((o) => o.id === id));
      if (valid.length === 0) continue;
      out[q.id] = valid;
    } else {
      out[q.id] = a;
    }
    // An option's text box is only kept while that option is chosen.
    for (const t of chosenTexts(q, answers)) {
      if (textOf(answers, t.answerId)) out[t.answerId] = textOf(answers, t.answerId);
    }
  }
  return out;
}

export function isAnswered(q: Question, answers: StepAnswers): boolean {
  if (q.optional) return true;
  if (q.validate && !q.validate(answers)) return false;
  const a = answers[q.id];
  if (Array.isArray(a)) {
    if (a.length === 0) return false;
    // e.g. "Something else" on its own needs some words to match on.
    return chosenTexts(q, answers).every((t) => !(t.requiredIfOnly && a.length === 1) || !!textOf(answers, t.answerId));
  }
  return !!a && (q.kind === "text" ? !!a.trim() : optionsOf(q, answers).some((o) => o.id === a));
}

/** All text typed in visible questions, for the self-harm check. Empty when nothing was typed. */
export function typedText(answers: StepAnswers, set: Question[]): string {
  const visible = visibleAnswers(answers, set);
  return ["other_text", "extra", "their_other_text", "their_extra"]
    .map((id) => visible[id])
    .filter((t): t is string => typeof t === "string" && t.trim() !== "")
    .join("\n");
}

/** Visible questions and the labels of what was chosen, for the local debug column. */
export function describeAnswers(answers: StepAnswers, set: Question[]): { prompt: string; answer: string }[] {
  const visible = visibleAnswers(answers, set);
  return visibleQuestions(answers, set).flatMap((q) => {
    const a = visible[q.id];
    if (a === undefined) return [];
    if (q.kind === "text") return [{ prompt: q.prompt, answer: String(a) }];
    const labels = (Array.isArray(a) ? a : [a]).map((id) => optionsOf(q, answers).find((o) => o.id === id)?.label ?? id);
    // Text typed under an option (e.g. "Something else") is shown with it.
    const typed = chosenTexts(q, answers)
      .map((t) => textOf(answers, t.answerId))
      .filter(Boolean)
      .map((t) => `“${t}”`);
    return [{ prompt: q.prompt, answer: [...labels, ...typed].join(", ") }];
  });
}

export type RiskLevel = "yes" | "unsure";

/** The risk answer if it calls for support to be shown; undefined for "No" or not yet answered. */
export function riskLevel(answers: StepAnswers): RiskLevel | undefined {
  return answers.risk === "yes" || answers.risk === "unsure" ? answers.risk : undefined;
}

/** Course ids to leave out, based on rules the answers settle for certain. */
export function excludedCourses(answers: StepAnswers, about: "self" | "them" = "self"): string[] {
  if (about === "them") {
    // Pregnancy isn't asked about the person they're supporting, so those courses aren't suggested for them.
    const out = ["pregnancy", "postnatal"];
    if (answers.their_panic_done !== "yes") out.push("panic_next_steps");
    return out;
  }
  const out: string[] = [];
  // "details" in Hybrid, "life_stage" in Multiple choice.
  if (!chose(answers, "details", "pregnant") && answers.life_stage !== "pregnant") out.push("pregnancy");
  if (!chose(answers, "details", "baby") && answers.life_stage !== "baby") out.push("postnatal");
  if (answers.panic_done !== "yes") out.push("panic_next_steps");
  return out;
}

/**
 * Third-person summary of the answers, sent to JEV as the state: about the user ("self"),
 * or about the person they're supporting ("them").
 */
export function buildSummary(answers: StepAnswers, about: "self" | "them" = "self", set: Question[]): string {
  const parts: string[] = [];
  const ownWords = about === "them" ? "Described by someone supporting them" : "In their own words";
  for (const q of visibleQuestions(answers, set).filter((q) => (q.about ?? "self") === about)) {
    const a = answers[q.id];
    if (!a || a.length === 0) continue;
    if (q.kind === "text") {
      if (typeof a === "string" && a.trim()) parts.push(`${ownWords}: ${asSentence(a.trim())}`);
      continue;
    }
    const chosen = (Array.isArray(a) ? a : [a])
      .map((id) => optionsOf(q, answers).find((o) => o.id === id))
      .filter((o): o is Option => !!o && !!o.summary);
    if (chosen.length === 0) continue;
    if (q.kind === "multi") {
      // Full-sentence summaries (e.g. "They are pregnant.") stand alone; the rest are listed as topics.
      const sentences = chosen.filter((o) => o.summary!.endsWith("."));
      const topics = chosen.filter((o) => !o.summary!.endsWith("."));
      if (topics.length) {
        parts.push(`${q.summaryPrefix ?? "They would like help with"}: ${topics.map((o) => o.summary).join("; ")}.`);
      }
      parts.push(...sentences.map((o) => o.summary!));
      for (const t of chosenTexts(q, answers)) {
        if (textOf(answers, t.answerId)) {
          parts.push(`${ownWords}, what they would like help with: ${asSentence(textOf(answers, t.answerId))}`);
        }
      }
    } else {
      parts.push(...chosen.map((o) => (q.summarise ? q.summarise(o) : o.summary!)));
    }
  }
  return parts.join(" ");
}
