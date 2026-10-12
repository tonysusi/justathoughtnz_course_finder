import type { ScoredCourse } from "../src/types.js";

/** The low-mood courses. One is always offered for later when the crisis panel shows. */
export const MOOD_COURSE_IDS = ["depression", "mixed"];

/**
 * Makes sure a low-mood course is shown with the crisis panel: the top-scoring one, added last if it isn't already
 * in the list. Applied in the browser (Results), since the crisis panel can come from the risk answer as well as JEV.
 *
 * @param all Every scored course, highest probability first.
 */
export function withMoodCourse(courses: ScoredCourse[], all: ScoredCourse[]): ScoredCourse[] {
  if (courses.some((c) => MOOD_COURSE_IDS.includes(c.id))) return courses;
  const pick = all.find((c) => MOOD_COURSE_IDS.includes(c.id));
  return pick ? [...courses, { ...pick, addedByRule: "mood" }] : courses;
}
