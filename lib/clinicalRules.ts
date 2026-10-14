import type { ScoredCourse } from "../src/types.js";

// Course rules from the clinical lead's answers (Oct 2026), applied after matching by every option: JEV's ranked
// list in Free text and Hybrid (lib/match.ts), and Multiple choice's rules (src/multiple-choice/rules.ts).

/** Courses that also suit a wider range of concerns, shown beside a more specific course. */
const GENERAL = ["mindfulness", "stress", "staying_on_track"];

export interface ClinicalRuleOptions {
  /** Courses the person's answers asked for (stage or life-stage answers, Multiple choice picks): never removed. */
  required?: string[];
  /** The text says they're trying to get pregnant, including fertility treatment (JEV flag). */
  tryingToConceive?: boolean;
  /** The text describes their own pregnancy loss (JEV flag). */
  pregnancyLoss?: boolean;
}

/**
 * - Pregnancy loss: no pregnancy or baby course (support services are shown instead, in MatchOutcome).
 * - Trying to conceive: offer Just a Pause (mindfulness) and Coping with Stress; Pregnancy Wellbeing isn't a match.
 * - Managing Insomnia always comes with Depression.
 * - Getting Back on Track (relapse) replaces Taking Action when it scores higher, unless their stage answer asked for
 *   Taking Action. JEV also lists it for people keeping a change going, where Taking Action scores higher.
 * - OCD or Overcoming Panic: Coping with Stress is the only general course beside it.
 * - Postnatal Wellbeing: no mindfulness beside it.
 * Courses added here are put last and marked addedByRule "clinical".
 *
 * @param all Every scored course, highest probability first.
 */
export function applyClinicalRules(
  results: ScoredCourse[],
  all: ScoredCourse[],
  { required = [], tryingToConceive = false, pregnancyLoss = false }: ClinicalRuleOptions = {},
): ScoredCourse[] {
  let out = [...results];
  const has = (id: string) => out.some((c) => c.id === id);
  const add = (id: string) => {
    const c = all.find((x) => x.id === id);
    if (c && !has(id)) out.push({ ...c, addedByRule: "clinical" });
  };
  const remove = (ids: string[]) => {
    out = out.filter((c) => !ids.includes(c.id) || required.includes(c.id));
  };

  if (pregnancyLoss) out = out.filter((c) => c.id !== "pregnancy" && c.id !== "postnatal");
  if (tryingToConceive) {
    add("mindfulness");
    add("stress");
  }
  if (has("insomnia")) add("depression");
  const score = (id: string) => out.find((c) => c.id === id)?.probability ?? 0;
  if (has("getting_back_on_track") && score("getting_back_on_track") > score("taking_action")) remove(["taking_action"]);
  if (has("ocd") || has("panic") || has("panic_next_steps")) {
    remove(GENERAL.filter((id) => id !== "stress"));
    add("stress");
  }
  if (has("postnatal")) remove(["mindfulness"]);
  return out;
}
