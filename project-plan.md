# Project plan: JEV Course Finder

**Goal:** an internal prototype React app on Vercel. It asks "What type of mental health support would you like to learn about?" and uses TypeSafe JEV to return a ranked list of Just a Thought courses.

## Decisions
- Free-text input, with results linking to justathought.co.nz.
- Shows the top 5 matches, ranked, at a match probability of 0.65 or higher, with a debug panel showing every score.
- An always-visible 1737/111 banner, plus a crisis panel when JEV's self-harm probability is 0.35 or higher.
- Answers are never stored or logged, and a privacy notice sits on the form.
- Stack: Vite + React + TypeScript, and a Vercel Function at `api/match.ts` using `@typesafe-ai/sdk`.

## Status
- [x] Build the app (form, matching API, results, crisis handling, debug panel)
- [x] Add the API key to `.env.local` and confirm JEV responds
- [x] Test with sample inputs
- [x] Debug query log page (local only)
- [x] Hybrid option (formerly Questionnaire) alongside free text (draft questions)
- [x] AI-assisted review of questions; non-clinical fixes applied
- [x] Draft direct risk question added (support screen on Yes/Not sure)
- [ ] Clinical review: risk question wording and responses, crisis wording/threshold, courses under crisis panel, age eligibility, pregnancy loss, "recently had a baby" timeframe
- [x] "Supporting someone else" route with other services (draft list)
- [x] Questions about the person being supported, with "Courses to share with them"
- [x] Step one regrouped into six groups (site course menu) with a grouped "Tell us a bit more" step; "Supporting someone else" greyed out
- [x] Third option: Multiple choice (flat topic list, only free text is the last box)
- [ ] Service team review of the supporting-others service list and wording
- [ ] Clinical review: the risk question is only asked when triggered (decision 6 Oct 2026). Triggers: low mood or alcohol/drug use on the user's own path, or JEV self-harm ≥ 0.35 on any typed text (either path). The clinical review recommended asking everyone.
- [ ] Cultural advisor review
- [ ] Tune the thresholds
- [ ] Create a repo and deploy a Vercel preview
- [ ] Clinical/safety sign-off on the crisis wording
- [ ] Privacy review before any use beyond the team
