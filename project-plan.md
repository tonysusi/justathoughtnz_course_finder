# Project plan: JEV Course Finder

**Goal:** an internal prototype React app on Vercel. It asks "What type of mental health support would you like to learn about?" and uses TypeSafe JEV to return a ranked list of Just a Thought courses.

## Decisions
- Free-text input, with results linking to justathought.co.nz.
- Shows the top 5 matches, ranked, at a match probability of 0.65 or higher, with a debug panel showing every score.
- An always-visible 1737/111 banner, plus a crisis panel when JEV's self-harm probability is 0.35 or higher.
- Answers are stored only while the debug log is on: always locally (`logs/queries.jsonl`), and when deployed only if `DEBUG_LOG=true`, kept for `DEBUG_RETENTION_DAYS` (default 14). Turn it off before real users can reach the site (see README). A notice on the form says whether answers are saved, based on `VITE_DEBUG`.
- Stack: Vite + React + TypeScript, and a Vercel Function at `api/match.ts` using `@typesafe-ai/sdk`.

## Status
- [x] Build the app (form, matching API, results, crisis handling, debug panel)
- [x] Add the API key to `.env.local` and confirm JEV responds
- [x] Test with sample inputs
- [x] Debug query log page (local only)
- [x] Hybrid option (formerly Questionnaire) alongside free text (draft questions)
- [x] AI-assisted review of questions; non-clinical fixes applied
- [x] Draft direct risk question added (support screen on Yes/Not sure)
- [x] Clinical review answered (14 Oct 2026): 31 questions on the risk question, crisis wording and threshold (35% kept), courses under the crisis panel, age (16+, youth box), pregnancy loss, the baby timeframe (18 months), alcohol and drugs and course matching. Applied in code.
- [ ] Clinical lead to confirm: crisis wording ("don't have to go through this alone"; their draft said "have to"), and services for pregnancy loss (currently 1737 and their GP or midwife) and alcohol and drugs (1737, local CADS, GP)
- [ ] Clinical lead to confirm the risk question about someone they're supporting (asked in Free text and Hybrid's supporting path when the text or answers mention their low mood, alcohol and drugs or a young baby): "Has the person you're supporting talked about ending their life or harming themselves?" Yes or Not sure highlights the at-risk services, not the crisis panel. The writer's own question is still asked after it when their own text brings it up.
- [x] "Supporting someone else" route with other services (draft list)
- [x] Questions about the person being supported, with "Courses to share with them"
- [x] Step one regrouped into six groups (site course menu) with a grouped "Tell us a bit more" step; "Supporting someone else" greyed out
- [x] Third option: Multiple choice (flat topic list, only free text is the last box)
- [ ] Service team review of the supporting-others service list and wording
- [x] Risk question triggers (clinical lead, 14 Oct 2026): low mood, alcohol and drugs or a baby under 18 months ticked, or typed text that JEV flags for self-harm (≥ 0.35) or a mention of those topics. Free text now asks it too. The crisis panel follows the answer only.
- [ ] Cultural advisor review
- [ ] Tune the thresholds
- [ ] Create a repo and deploy a Vercel preview
- [ ] Clinical/safety sign-off on the crisis wording
- [ ] Privacy review before any use beyond the team
