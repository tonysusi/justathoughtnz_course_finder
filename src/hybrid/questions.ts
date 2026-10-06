// DRAFT questions for the Hybrid option — plain-language triage, not a clinical screening tool.
// Needs clinical review before use beyond the internal team.
//
// Step one has six broad groups matching the Just a Thought site's course menu (Anxiety, Low mood, Wellbeing,
// Pregnancy & postnatal, Alcohol and drug support) plus "Something else". A "Tell us a bit more" step then asks
// for details within each chosen group.

import type { StepAnswers } from "../types";
import { TEXT_HINT, chose, riskQuestion, supportingSomeoneElse, type Option, type Question } from "../step-flow/engine";

// Step one: six broad groups. "Supporting someone else" is shown greyed out (coming soon); the supporting path
// below is kept so it can be switched back on by removing `disabled`.
const GROUPS: Option[] = [
  { id: "anxiety", label: "Anxiety, worry or panic", summary: "anxiety, worry or panic" },
  { id: "low_mood", label: "Low mood", summary: "low mood" },
  {
    id: "wellbeing",
    label: "Wellbeing, like stress, sleep or coping",
    summary: "their wellbeing, such as stress, sleep or coping",
  },
  {
    id: "perinatal",
    label: "Pregnancy & postnatal",
    summary: "their mental wellbeing during pregnancy or after having a baby",
  },
  { id: "aod", label: "Alcohol and drug support", summary: "their alcohol or drug use" },
  {
    id: "other",
    label: "Something else, or I'm not sure",
    summary: "something else, or they are not sure",
    text: { answerId: "other_text", label: "Tell us in your own words", maxLength: 500, requiredIfOnly: true },
  },
  // No summary: courses are for the person doing them, so this isn't sent to JEV. It shows other services instead.
  // Exclusive: choosing it makes the rest of the flow about the other person, not the user.
  {
    id: "someone_else",
    label: "Supporting someone else, like a whānau member or friend",
    exclusive: true,
    disabled: "coming soon",
  },
];

/** Details for each group, shown together under group headings in the "Tell us a bit more" step. */
export const DETAILS: Record<string, Option[]> = {
  anxiety: [
    { id: "worry", label: "Worry or anxiety most of the time", summary: "worry or anxiety most of the time" },
    { id: "panic", label: "Panic attacks", summary: "panic attacks" },
    { id: "social", label: "Feeling anxious in social situations", summary: "feeling anxious in social situations" },
    {
      id: "health",
      label: "Worrying a lot that I'm ill, or checking my body or symptoms",
      summary: "worrying a lot that they are ill, or checking their body or symptoms",
    },
    {
      id: "ocd",
      label: "Unwanted thoughts, or repeated checking or rituals",
      summary: "unwanted intrusive thoughts, or repeated checking or rituals",
    },
    { id: "anxiety_unsure", label: "I'm not sure" },
  ],
  low_mood: [
    {
      id: "down",
      label: "Feeling down, flat or losing interest in things",
      summary: "feeling down, flat or losing interest in things",
    },
    {
      id: "mixed",
      label: "Low mood together with worry or anxiety",
      summary: "low mood together with worry or anxiety",
    },
    { id: "mood_unsure", label: "I'm not sure" },
  ],
  wellbeing: [
    { id: "stress", label: "Stress or feeling overwhelmed", summary: "stress or feeling overwhelmed" },
    {
      id: "sleep",
      label: "Trouble getting to sleep or staying asleep",
      summary: "trouble getting to sleep or staying asleep",
    },
    { id: "coping", label: "Coping skills for tough times", summary: "general coping skills for tough times" },
    {
      id: "mindfulness",
      label: "Feeling calmer and more present (mindfulness)",
      summary: "learning mindfulness to feel calmer and more present",
    },
    { id: "wellbeing_unsure", label: "I'm not sure" },
  ],
  // Full-sentence summaries: these state their life stage rather than a topic.
  perinatal: [
    { id: "pregnant", label: "I'm pregnant", summary: "They are pregnant." },
    { id: "baby", label: "I've recently had a baby", summary: "They have recently had a baby." },
  ],
};

const GROUP_LABEL = Object.fromEntries(GROUPS.map((g) => [g.id, g.label]));

const chosenGroups = (answers: StepAnswers): string[] => {
  const a = answers.concerns;
  return Array.isArray(a) ? a : [];
};

/** Detail options for the groups chosen in step one, each tagged with its group's heading. */
const detailOptions = (answers: StepAnswers): Option[] =>
  chosenGroups(answers).flatMap((g) => (DETAILS[g] ?? []).map((o) => ({ ...o, group: GROUP_LABEL[g] })));

/** Specific topics chosen in the details step (not "I'm not sure" or life stage), for "which matters most". */
const chosenConcerns = (answers: StepAnswers): Option[] => {
  const a = answers.details;
  const ids = Array.isArray(a) ? a : [];
  return detailOptions(answers).filter(
    (o) => ids.includes(o.id) && !o.id.endsWith("_unsure") && o.id !== "pregnant" && o.id !== "baby",
  );
};

/**
 * Flat topic list for the (currently disabled) supporting path, worded about the other person.
 * Summaries match DETAILS so matching behaves the same.
 */
const THEIR_CONCERNS: Option[] = [
  { id: "worry", label: "Worry or anxiety", summary: "worry or anxiety" },
  { id: "low_mood", label: "Low mood or feeling down", summary: "low mood or feeling down" },
  { id: "panic", label: "Panic attacks", summary: "panic attacks" },
  { id: "social", label: "Feeling anxious in social situations", summary: "feeling anxious in social situations" },
  {
    id: "ocd",
    label: "Unwanted thoughts, or repeated checking or rituals",
    summary: "unwanted intrusive thoughts, or repeated checking or rituals",
  },
  {
    id: "health",
    label: "Worrying a lot that they're ill, or checking their body or symptoms",
    summary: "worrying a lot that they are ill, or checking their body or symptoms",
  },
  { id: "stress", label: "Stress or feeling overwhelmed", summary: "stress or feeling overwhelmed" },
  {
    id: "sleep",
    label: "Trouble getting to sleep or staying asleep",
    summary: "trouble getting to sleep or staying asleep",
  },
  { id: "aod", label: "Alcohol or drug use", summary: "their alcohol or drug use" },
  { id: "wellbeing", label: "General coping and wellbeing", summary: "general coping skills and wellbeing" },
  {
    id: "other",
    label: "Something else, or I'm not sure",
    summary: "something else, or they are not sure",
    text: { answerId: "their_other_text", label: "Tell us in your own words", maxLength: 500, requiredIfOnly: true },
  },
];

/** Own-path topics that lead to the risk question being asked. */
const RISK_TRIGGER_CONCERNS = ["low_mood", "aod"];

export const HYBRID_QUESTIONS: Question[] = [
  {
    id: "concerns",
    prompt: "What would you like help with?",
    hint: "Choose any that apply.",
    kind: "multi",
    options: GROUPS,
  },
  {
    id: "details",
    prompt: "Tell us a bit more",
    hint: "Choose any that apply under each heading.",
    kind: "multi",
    // Only for groups with details (not alcohol and drug, which has its own follow-up, or "Something else").
    showIf: (a) => detailOptions(a).length > 0,
    optionsFor: detailOptions,
    // At least one detail for each chosen group, e.g. pregnant or recently had a baby, so the rules apply correctly.
    validate: (a) => {
      const ids = Array.isArray(a.details) ? a.details : [];
      return chosenGroups(a)
        .filter((g) => DETAILS[g])
        .every((g) => DETAILS[g].some((o) => ids.includes(o.id)));
    },
    summaryPrefix: "More specifically",
  },
  // Questions about the person they're supporting. The user's own risk question is still asked later.
  {
    id: "their_concerns",
    about: "them",
    prompt: "What is the person you're supporting dealing with?",
    hint: "Choose any that apply. We'll suggest courses you could share with them.",
    kind: "multi",
    showIf: supportingSomeoneElse,
    options: THEIR_CONCERNS,
  },
  {
    id: "their_panic_done",
    about: "them",
    prompt: "Have they finished the Overcoming Panic course?",
    kind: "single",
    showIf: (a) => supportingSomeoneElse(a) && chose(a, "their_concerns", "panic"),
    options: [
      { id: "yes", label: "Yes", summary: "They have finished the Overcoming Panic course." },
      {
        id: "started",
        label: "They started it but didn't finish",
        summary: "They started the Overcoming Panic course but did not finish it.",
      },
      { id: "no", label: "No, or I don't know", summary: "They have not done the Overcoming Panic course." },
    ],
  },
  {
    id: "their_aod_stage",
    about: "them",
    prompt: "Which best describes where they are with alcohol or drug use?",
    kind: "single",
    showIf: (a) => supportingSomeoneElse(a) && chose(a, "their_concerns", "aod"),
    options: [
      {
        id: "unsure",
        label: "They're not sure they want or need to change",
        summary: "They are not sure whether they want or need to change their alcohol or drug use.",
      },
      {
        id: "ready",
        label: "They're ready to make changes, or already making them",
        summary: "They are ready to change their alcohol or drug use, or are already making changes.",
      },
      {
        id: "relapse",
        label: "They made changes but are finding it hard to keep them up",
        summary: "They made changes to their alcohol or drug use but are finding it hard to keep them up.",
      },
      { id: "dont_know", label: "I don't know" },
    ],
  },
  {
    id: "main_concern",
    prompt: "Which one matters most to you right now?",
    kind: "single",
    // Only when two or more specific concerns are chosen; JEV is asked about the person's *main* concern.
    showIf: (a) => chosenConcerns(a).length > 1,
    optionsFor: chosenConcerns,
    summarise: (o) => `What matters most to them right now is ${o.summary}.`,
  },
  {
    id: "panic_done",
    prompt: "Have you finished the Overcoming Panic course?",
    kind: "single",
    showIf: (a) => chose(a, "details", "panic"),
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
        label: "I'm ready to make changes, or already making them",
        summary: "They are ready to change their alcohol or drug use, or are already making changes.",
      },
      {
        id: "relapse",
        label: "I made changes but I'm finding it hard to keep them up",
        summary: "They made changes to their alcohol or drug use but are finding it hard to keep them up.",
      },
    ],
  },
  {
    id: "extra",
    prompt: "Anything else you'd like to add?",
    hint: TEXT_HINT,
    kind: "text",
    // Skipped when they've already written in the "Something else" box, so free text isn't asked for twice.
    showIf: (a) =>
      !supportingSomeoneElse(a) &&
      !(chose(a, "concerns", "other") && typeof a.other_text === "string" && a.other_text.trim() !== ""),
    optional: true,
    maxLength: 500,
  },
  {
    id: "their_extra",
    about: "them",
    prompt: "Anything else you'd like to tell us about them?",
    hint: TEXT_HINT,
    kind: "text",
    showIf: (a) =>
      supportingSomeoneElse(a) &&
      !(
        chose(a, "their_concerns", "other") &&
        typeof a.their_other_text === "string" &&
        a.their_other_text.trim() !== ""
      ),
    optional: true,
    maxLength: 500,
  },
  // Only asked on their own path when low mood or alcohol or drug use is chosen, or typed text is flagged.
  riskQuestion((a) => !supportingSomeoneElse(a) && RISK_TRIGGER_CONCERNS.some((id) => chose(a, "concerns", id))),
];
