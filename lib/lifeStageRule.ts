import type { ScoredCourse } from "../src/types.js";

/** Courses a Hybrid or Multiple choice life-stage answer can require. */
export const LIFE_STAGE_COURSE_IDS = ["pregnancy", "postnatal"];

/**
 * Makes sure the courses the life-stage answers point to are shown: "I'm pregnant" always shows Pregnancy Wellbeing
 * and "I've had a baby in the last year" always shows Postnatal Wellbeing. Any JEV didn't already include are added
 * last, which can take the list past maxResults.
 *
 * @param all Every scored course, highest probability first.
 */
export function withLifeStageCourses(
  results: ScoredCourse[],
  all: ScoredCourse[],
  lifeStageCourses: string[] = [],
): ScoredCourse[] {
  const added = lifeStageCourses
    .map((id) => all.find((c) => c.id === id))
    .filter((c): c is ScoredCourse => !!c && !results.some((r) => r.id === c.id));
  return [...results, ...added.map((c) => ({ ...c, addedByRule: "life_stage" as const }))];
}
