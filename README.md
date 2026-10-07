# JEV Course Finder (internal prototype)

This app asks *"What type of mental health support would you like to learn about?"* and uses TypeSafe's **JEV** model to suggest Just a Thought courses.

## Three options
- **Free text** (`/free-text.html`): people describe what they'd like help with in their own words.
- **Hybrid** (`/hybrid.html`, formerly Questionnaire; the old address redirects): step one has six groups matching the Just a Thought site's course menu (Anxiety, Low mood, Wellbeing, Pregnancy & postnatal, Alcohol and drug support, Something else). A "Tell us a bit more" step lists details under a heading for each chosen group, followed by follow-ups only where needed (which matters most, the panic course, alcohol stage), an optional text box, and the risk question when triggered. The answers are turned into a short summary (`buildSummary` in `src/step-flow/engine.ts`; Hybrid's questions are in `src/hybrid/questions.ts`) and sent to JEV **the same way as free text**, so the two can be compared in the Debug log. "Supporting someone else" is shown greyed out (coming soon); its path is kept in the code.

> The Hybrid and Multiple choice questions are a **draft for clinical review**. They're plain-language triage, not a clinical screening tool.

- **Multiple choice** (`/multiple-choice.html`): a simpler flow for comparison. Step one has seven merged topics (Worry or feeling anxious, Low mood, Trouble sleeping, Coping and wellbeing, Pregnancy or a recent baby, Alcohol or drug use, Something else). Worry, Low mood and Coping each get their own short follow-up step for more detail; the others go straight to their existing follow-ups (pregnancy or recent baby, the panic course, alcohol stage). Then an optional "Anything else" box (the only free text) and the risk question when triggered. It uses the same step-by-step engine as Hybrid (`src/step-flow/`) with its own question set (`src/multiple-choice/questions.ts`).

`/` (Home) introduces the options and links to each.

## How it works
- `src/data/courses.ts` lists the 19 courses, taken from the justathought.co.nz section of `course-catalogue.md`.
- `api/match.ts` is a Vercel Function. It sends the answer to JEV in **one request**: one yes/no question (a "noul") per course, plus `self_harm` and `off_topic` questions. That is the "speculative fan-out" pattern from the TypeSafe docs.
- `lib/match.ts` ranks the courses and applies the thresholds (the `CONFIG` object). It returns the top matches and every score, so the debug panel can show them.
- The API key stays server-side. The answer the person types is only stored when the debug log is on (see below), and the SDK log level is pinned to `error` because `debug` would log request bodies.

## Run locally
```bash
npm install
cp .env.example .env.local   # then add your TYPESAFE_API_KEY
npm run dev                  # http://localhost:5173
```
The Vite dev server serves `/api/match` itself, so you don't need the Vercel CLI for local runs.

## Debug panels and query log
Each entry has the typed text, step answers, results, all scores, and the raw JEV request and response. Open `/debug.html`, or use the "Debug" link in the nav, to:
- browse entries, newest first, and expand one to see every course score and the raw JSON
- **Re-run** a query, which is handy after changing wording or thresholds
- **Clear log**, which deletes every entry

Whenever debug is on, the results pages show the debug column and the form's notice tells testers their answers are saved.

**Locally** (`npm run dev`) debug is always on. Entries go to `logs/queries.jsonl` (git-ignored) and are kept until cleared.

**Deployed**, debug is off unless these are set in Vercel (Project → Settings → Environment Variables), for each environment you want it on:

| Variable | Effect |
|---|---|
| `VITE_DEBUG=true` | Builds the debug column, the Debug link, the saved-answers notice and `/debug.html` into the site. Read at build time, so redeploy after changing it. |
| `DEBUG_LOG=true` | The `api/` functions save each query to Vercel Blob, and `/api/debug/*` respond. Without it they return 404. |
| `DEBUG_TOKEN` | A long random value. `/debug.html` asks for it before showing or clearing the log (kept for that browser tab only). If it isn't set, nobody can read the log. |
| `DEBUG_RETENTION_DAYS` | Optional. Entries older than this are deleted (default 14). |
| `BLOB_READ_WRITE_TOKEN` | Added by Vercel when the Blob store is linked to the project. The store must allow private blobs. |

Entries are stored as private blobs under `debug-log/`, one JSON file each. Code: `lib/debugLog/` (`blobStore.ts` deployed, `fileStore.ts` locally) and `src/debugFlag.ts`. To turn logging off, remove `DEBUG_LOG` (or set it to anything else) and redeploy; remove `VITE_DEBUG` too to hide the panels.

## Tuning
Change the thresholds in `CONFIG` in `lib/match.ts`: `match`, `maxResults`, `selfHarm` and `offTopic`. The debug panel shows every probability for the last query.

## Deploy to Vercel
1. Push the code to a Git repo and import it in Vercel, or run `npx vercel` from this folder. Vercel detects Vite automatically.
2. In Project → Settings → Environment Variables, add `TYPESAFE_API_KEY`.
3. For the debug panels and log, link a private Blob store to the project and add the variables in [Debug panels and query log](#debug-panels-and-query-log).
4. Redeploy.

## Before anyone outside the team uses this
- A clinical or safety lead needs to sign off the crisis wording in `src/components/Crisis.tsx` and the self-harm threshold.
- A privacy review is needed: answers go to TypeSafe, a third party. Check the Privacy Act 2020 and HIPC, data residency and retention.
- Consider access protection for the deployment, such as Vercel password or SSO protection. With debug on, anything typed into the site is saved for the retention period, so turn debug off before real users can reach it.
- The debug log's Blob store sits in the region chosen when it was created; include that in the data residency check.
