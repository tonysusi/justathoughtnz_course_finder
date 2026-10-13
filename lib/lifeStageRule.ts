import type { ScoredCourse } from "../src/types.js";

/** Courses a Hybrid or Multiple choice life-stage answer can require. Pregnancy Wellbeing could be added here too. */
export const LIFE_STAGE_COURSE_IDS = ["postnatal"];

/**
 * Makes sure the course a life-stage answer points to is shown: "I've had a baby in the last year" always shows
 * Postnatal Wellbeing. If JEV didn't already include it, it's added last, which can take the list one past
 * maxResults.
 *
 * @param all Every scored course, highest probability first.
 */
export function withLifeStageCourse(
  results: ScoredCourse[],
  all: ScoredCourse[],
  lifeStageCourse?: string,
): ScoredCourse[] {
  const pick = all.find((c) => c.id === lifeStageCourse);
  if (!pick || results.some((c) => c.id === pick.id)) return results;
  return [...results, { ...pick, addedByRule: "life_stage" }];
}
