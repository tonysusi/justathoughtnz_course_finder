// DRAFT questions for the Multiple choice option — a simpler flow than Hybrid, for comparison.
// Needs clinical review before use beyond the internal team.
//
// Merged topics, then a short follow-up step for each topic chosen (one per topic, unlike Hybrid's single
// grouped details step), then only the other follow-ups that apply. No free text: courses come from fixed rules
// (rules.ts), with no AI. Option wording is shared with Hybrid (DETAILS).
//
// Follow-up prompts are first-person sentence starters that the options complete, e.g. "I'm experiencing… Feeling
// down" (Nov 2026). Step one and the risk questions are asked as questions (engine.ts has the risk wording).

import { chose, riskQuestions, type Option, type Question } from "../step-flow/engine";
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

// Step one: merged topics, as first-person statements (Nov 2026; draft wording to review). Those with details get their own follow-up step below.
const TOPICS: Option[] = [
  { id: "worry", label: "I worry or feel anxious", summary: "worry or feeling anxious" },
  { id: "low_mood", label: "I feel low or down", summary: "low mood" },
  { id: "sleep", label: "I have trouble sleeping", summary: "trouble getting to sleep or staying asleep" },
  { id: "coping", label: "I'd like to cope better and improve my wellbeing", summary: "coping skills and wellbeing" },
  {
    id: "perinatal",
    label: "I'm pregnant or have a baby under 18 months",
    summary: "their mental wellbeing during pregnancy or after having a baby",
  },
  { id: "aod", label: "I'm thinking about my alcohol or drug use", summary: "their alcohol or drug use" },
];

/** Topics that lead to the risk question: low mood or alcohol or drug use (and a baby under 18 months, below). */
const RISK_TRIGGER_TOPICS = ["low_mood", "aod"];

/** A follow-up asking for more detail about one topic from step one: DETAILS options by id, with new labels. */
const followUp = (
  topic: string,
  prompt: string,
  options: [id: string, label: string][],
  summaryPrefix: string,
): Question => ({
  id: `${topic}_detail`,
  prompt,
  hint: "Choose any that apply.",
  kind: "multi",
  showIf: (a) => chose(a, "concerns", topic),
  options: [...options.map(([id, label]) => ({ ...detail(id), label })), NOT_SURE],
  summaryPrefix,
});

export const MULTIPLE_CHOICE_QUESTIONS: Question[] = [
  {
    id: "concerns",
    prompt: "What would you like some help with?",
    hint: "Choose any that apply.",
    kind: "multi",
    options: TOPICS,
  },
  followUp(
    "worry",
    "What kind of worry or anxiety?",
    [
      // Multiple choice's own labels (Nov 2026); summaries and ids stay from Hybrid's DETAILS.
      ["worry", "I worry a lot"],
      ["panic", "I experience sudden feelings of panic"],
      ["social", "I feel anxious around other people"],
      ["health", "I worry a lot about my health"],
      ["stress", "I sometimes feel overwhelmed or stressed"],
      ["ocd", "I have unwanted thoughts that are hard to stop"],
    ],
    "Their worry or anxiety involves",
  ),
  // Multiple choice's own low mood options (Nov 2026), not Hybrid's DETAILS. Courses: rules.ts.
  {
    id: "low_mood_detail",
    prompt: "What best describes how you are feeling?",
    hint: "Choose any that apply.",
    kind: "multi",
    showIf: (a) => chose(a, "concerns", "low_mood"),
    options: [
      { id: "sad", label: "I have been feeling sad, down or flat", summary: "feeling sad, down or flat" },
      { id: "interest", label: "I've lost interest in things I usually enjoy", summary: "losing interest in things" },
      { id: "mixed", label: "I feel low as well as worried or anxious", summary: "low mood together with worry or anxiety" },
      {
        id: "drained",
        label: "I feel emotionally drained or just not myself",
        summary: "feeling emotionally drained or not themselves",
      },
      NOT_SURE,
    ],
    summaryPrefix: "Their low mood involves",
  },
  // Multiple choice's own wellbeing options (Nov 2026), not Hybrid's DETAILS. Courses: rules.ts.
  {
    id: "coping_detail",
    prompt: "What would help you feel better in yourself?",
    hint: "Choose any that apply.",
    kind: "multi",
    showIf: (a) => chose(a, "concerns", "coping"),
    options: [
      {
        id: "cope",
        label: "I want to find better ways to cope when things get tough",
        summary: "better ways to cope when things get tough",
      },
      { id: "calmer", label: "I want to feel calmer and less overwhelmed", summary: "feeling calmer and less overwhelmed" },
      {
        id: "present",
        label: "I want to be more present and enjoy the moment",
        summary: "being more present and enjoying the moment (mindfulness)",
      },
      {
        id: "skills",
        label: "I want to build everyday skills to support my wellbeing",
        summary: "everyday skills to support their wellbeing",
      },
      NOT_SURE,
    ],
    summaryPrefix: "For coping and wellbeing, they would like",
  },
  {
    id: "life_stage",
    prompt: "Right now…",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "perinatal"),
    options: [
      { id: "pregnant", label: "I'm pregnant", summary: "They are pregnant." },
      { id: "baby", label: "I have a baby under 18 months", summary: "They have a baby under 18 months old." },
    ],
  },
  {
    id: "panic_done",
    prompt: "With the Overcoming Panic course, I…",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "worry") && chose(a, "worry_detail", "panic"),
    options: [
      { id: "yes", label: "Finished it", summary: "They have finished the Overcoming Panic course." },
      {
        id: "started",
        label: "Started it but didn't finish",
        summary: "They started the Overcoming Panic course but did not finish it.",
      },
      { id: "no", label: "Haven't done it", summary: "They have not done the Overcoming Panic course." },
    ],
  },
  // Wording and stages from the user (Nov 2026), Multiple choice only. Courses: rules.ts.
  {
    id: "aod_stage",
    prompt: "Where are you at with your alcohol or drug use?",
    kind: "single",
    showIf: (a) => chose(a, "concerns", "aod"),
    options: [
      {
        id: "unsure",
        label: "I'm not sure I want or need to make a change",
        summary: "They are not sure whether they want or need to change their alcohol or drug use.",
      },
      {
        id: "thinking",
        label: "I'm thinking about making a change",
        summary: "They are thinking about changing their alcohol or drug use.",
      },
      {
        id: "ready",
        label: "I'm ready to make a change or already taking steps",
        summary: "They are ready to change their alcohol or drug use, or are already taking steps.",
      },
      {
        id: "relapse",
        label: "I've made some changes, but I'm finding it hard to keep going",
        summary: "They have made changes to their alcohol or drug use but are finding it hard to keep going.",
      },
      {
        id: "building",
        label: "I've made changes and want to keep building on them",
        summary: "They have made changes to their alcohol or drug use and want to keep building on them.",
      },
    ],
  },
  ...riskQuestions((a) => RISK_TRIGGER_TOPICS.some((id) => chose(a, "concerns", id)) || a.life_stage === "baby"),
];
