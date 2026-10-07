import type { ScoredCourse } from "../src/types.js";

/** The alcohol and drug courses. One is always shown when AOD is chosen or the text is about alcohol or drug use. */
export const AOD_COURSE_IDS = ["thinking_about_change", "taking_action", "getting_back_on_track"];

/**
 * Makes sure an AOD course is shown: the one the stage answer points to (`aodCourse`), or else the top-scoring AOD
 * course when the aod flag is hit. If JEV didn't already include it, it's added last, which can take the list one
 * past maxResults. Not applied to off-topic text.
 *
 * @param all Every scored course, highest probability first.
 */
export function withAodCourse(
  results: ScoredCourse[],
  all: ScoredCourse[],
  { aodHit, offTopicHit, aodCourse }: { aodHit: boolean; offTopicHit: boolean; aodCourse?: string },
): ScoredCourse[] {
  if (offTopicHit) return results;
  const id = aodCourse ?? (aodHit ? all.find((c) => AOD_COURSE_IDS.includes(c.id))?.id : undefined);
  const pick = all.find((c) => c.id === id);
  if (!pick || results.some((c) => c.id === pick.id)) return results;
  return [...results, { ...pick, addedByRule: "aod" }];
}
