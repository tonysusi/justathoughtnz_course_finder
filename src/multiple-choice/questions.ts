// DRAFT questions for the Multiple choice option — a simpler flow than Hybrid, for comparison.
// Needs clinical review before use beyond the internal team.
//
// Merged topics, then a short follow-up step for each topic chosen (one per topic, unlike Hybrid's single
// grouped details step), then only the other follow-ups that apply. No free text: courses come from fixed rules
// (rules.ts), with no AI. Option wording is shared with Hybrid (DETAILS).

import { chose, riskQuestion, type Option, type Question } from "../step-flow/engine";
import { DETAILS } from "../hybrid/questions";

/** Detail options by id, from Hybrid's DETAILS so wording and summaries match. */
const detail = (id: string): Option => {
  const o = Object.values(DETAILS)
    .flat()
    .find((d) => d.id === id);
  if (!o) throw new Error(`Unknown detail option: ${id}`);
  return o;
};

const NOT_SURE: Option = { id: "not_sure", label: "I'm not sure" };

// Step one: merged topics. Those with details get their own follow-up step below.
const TOPICS: Option[] = [
  { id: "worry", label: "Worry or feeling anxious", summary: "worry or feeling anxious" },
  { id: "low_mood", label: "Low mood", summary: "low mood" },
  { id: "sleep", label: "Trouble sleeping", summary: "trouble getting to sleep or staying asleep" },
  { id: "coping", label: "Coping and wellbeing", summary: "coping skills and wellbeing" },
  {
    id: "perinatal",
    label: "Pregnancy or a baby under one",
    summary: "their mental wellbeing during pregnancy or after having a baby",
  },
  { id: "aod", label: "Alcohol or drug use", summary: "their alcohol or drug use" },
];

/** Topics that lead to the risk question: low mood or alcohol or drug use. */
const RISK_TRIGGER_TOPICS = ["low_mood", "aod"];

/** A follow-up asking for more detail about one topic from step one. */
const followUp = (topic: string, prompt: string, optionIds: string[], summaryPrefix: string): Question => ({
  id: `${topic}_detail`,
  prompt,
  hint: "Choose any that apply.",
  kind: "multi",
  showIf: (a) => chose(a, "concerns", topic),
  options: [...optionIds.map(detail), NOT_SURE],
  summaryPrefix,
});

export const MULTIPLE_CHOICE_QUESTIONS: Question[] = [
  {
    id: "concerns",
    prompt: "What would you like help with?",
    hint: "Choose any that apply.",
    kind: "multi",
    options: TOPICS,
  },
  followUp(
    "worry",
    "What kind of worry or anxiety?",
    ["worry", "panic", "social", "health", "stress", "ocd"],
    "Their worry or anxiety involves",
  ),
  followUp("low_mood", "What's your low mood like?", ["down", "mixed"], "Their low mood involves"),
  followUp(
    "coping",
    "What would you like help with for coping and wellbeing?",
    ["coping", "mindfulness"],
    "For coping and wellbeing, they would like",
  ),
  {
    id: "life_stage",
    prompt: "Which of these is true for you?",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "perinatal"),
    options: [
      { id: "pregnant", label: "I'm pregnant", summary: "They are pregnant." },
      { id: "baby", label: "I've had a baby in the last year", summary: "They have had a baby in the last year." },
    ],
  },
  {
    id: "panic_done",
    prompt: "Have you finished the Overcoming Panic course?",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "worry") && chose(a, "worry_detail", "panic"),
    options: [
      { id: "yes", label: "Yes", summary: "They have finished the Overcoming Panic course." },
      {
        id: "started",
        label: "I started it but didn't finish",
        summary: "They started the Overcoming Panic course but did not finish it.",
      },
      { id: "no", label: "No", summary: "They have not done the Overcoming Panic course." },
    ],
  },
  {
    id: "aod_stage",
    prompt: "Which best describes where you are with alcohol or drug use?",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "aod"),
    options: [
      {
        id: "unsure",
        label: "I'm not sure I want or need to change",
        summary: "They are not sure whether they want or need to change their alcohol or drug use.",
      },
      {
        id: "ready",
        label: "I'm curious about making changes, or already making them",
        summary: "They are curious about changing their alcohol or drug use, or are already making changes.",
      },
      {
        id: "relapse",
        label: "I made changes but I'm finding it hard to keep them up",
        summary: "They made changes to their alcohol or drug use but are finding it hard to keep them up.",
      },
    ],
  },
  riskQuestion((a) => RISK_TRIGGER_TOPICS.some((id) => chose(a, "concerns", id))),
];
