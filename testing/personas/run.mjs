// Runs the synthetic personas (personas.ts) through the real Multiple choice question flow and rules, and records
// what each one is offered. No AI and no network: the rules run locally, as in the browser.
//
//   node testing/personas/run.mjs
//
// Writes results.json and results.csv next to this file. Loads the TypeScript source through Vite's SSR loader so
// the same code the app uses is tested.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const server = await createServer({
  root: join(here, "../.."),
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

try {
  const { PERSONAS } = await server.ssrLoadModule("/testing/personas/personas.ts");
  const { MULTIPLE_CHOICE_QUESTIONS: SET } = await server.ssrLoadModule("/src/multiple-choice/questions.ts");
  const { matchByRules } = await server.ssrLoadModule("/src/multiple-choice/rules.ts");
  const engine = await server.ssrLoadModule("/src/step-flow/engine.ts");
  const { AOD_COURSE_IDS } = await server.ssrLoadModule("/lib/aodRule.ts");
  const { COURSES } = await server.ssrLoadModule("/src/data/courses.ts");
  const name = (id) => COURSES.find((c) => c.id === id)?.name ?? id;

  const results = PERSONAS.map((persona) => {
    const problems = [];
    const answers = {};
    const asked = [];
    // Walk the flow as the app does: the first unanswered visible question, until none are left.
    for (let guard = 0; guard < 50; guard++) {
      const next = engine.visibleQuestions(answers, SET).find((q) => !(q.id in answers));
      if (!next) break;
      asked.push(next.id);
      let a;
      if (next.id === "risk_harm") a = persona.risk[0];
      else if (next.id === "risk_life") a = persona.risk[1] ?? "no";
      else a = persona.answers[next.id];
      if (a === undefined) {
        problems.push(`no scripted answer for ${next.id}`);
        a = next.kind === "multi" ? ["not_sure"] : (next.options?.[0]?.id ?? "");
      }
      const valid = new Set(engine.optionsOf(next, answers).map((o) => o.id));
      for (const id of [a].flat()) if (!valid.has(id)) problems.push(`"${id}" isn't an option on ${next.id}`);
      answers[next.id] = a;
    }
    for (const id of Object.keys(persona.answers)) {
      if (!asked.includes(id)) problems.push(`scripted answer for ${id} was never asked`);
    }

    const visible = engine.visibleAnswers(answers, SET);
    const match = matchByRules(visible);
    const courses = match.results.map((c) => c.id);
    const risk = engine.riskLevel(visible);
    const riskAsked = asked.includes("risk_harm");
    const wouldFlag = persona.risk.some((r) => r !== "no");
    // As the results page shows them (MatchOutcome, Page).
    const crisisPanel = risk ? (risk === "unsure" ? "It's okay not to be sure" : "You don't have to go through this alone") : "";
    const support = {
      yellowBanner: !(visible.risk_harm === "no" && visible.risk_life === "no"),
      crisisPanel,
      tealReminder: !risk,
      aodBox: courses.some((id) => AOD_COURSE_IDS.includes(id)),
      nzslLinks: match.results.filter((c) => c.nzslVersion).map((c) => c.name),
    };
    const rank = courses.indexOf(persona.course);
    return {
      id: persona.id,
      course: persona.course,
      courseName: name(persona.course),
      age: persona.age,
      profile: persona.profile,
      steps: asked.length,
      questions: asked,
      answers: visible,
      courses,
      courseNames: courses.map(name),
      matched: rank >= 0,
      rank: rank >= 0 ? rank + 1 : null,
      count: courses.length,
      riskAnswersIfAsked: persona.risk,
      riskAsked,
      riskMissed: wouldFlag && !riskAsked,
      support,
      problems,
    };
  });

  writeFileSync(join(here, "results.json"), JSON.stringify(results, null, 2) + "\n");
  const csvCell = (v) => `"${String(v).replaceAll('"', '""')}"`;
  const header = ["id", "course", "age", "profile", "steps", "matched", "rank", "count", "courses offered",
    "risk if asked", "risk asked", "risk missed", "yellow banner", "crisis panel", "teal reminder", "AOD box",
    "NZSL links", "script problems"];
  const rows = results.map((r) => [r.id, r.courseName, r.age, r.profile, r.steps, r.matched, r.rank ?? "", r.count,
    r.courseNames.join("; "), r.riskAnswersIfAsked.join("/"), r.riskAsked, r.riskMissed, r.support.yellowBanner,
    r.support.crisisPanel, r.support.tealReminder, r.support.aodBox, r.support.nzslLinks.join("; "),
    r.problems.join("; ")]);
  writeFileSync(join(here, "results.csv"), [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n");

  const matched = results.filter((r) => r.matched).length;
  console.log(`${results.length} personas, ${matched} offered their course, ${results.length - matched} not.`);
  const withProblems = results.filter((r) => r.problems.length);
  if (withProblems.length) console.log("Script problems:", withProblems.map((r) => `${r.id}: ${r.problems.join("; ")}`));
} finally {
  await server.close();
}
