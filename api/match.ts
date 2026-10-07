import { runMatch } from "../lib/match.js";
import { logRun } from "../lib/debugLog/server.js";

// Vercel Function (Node runtime, Web Request/Response signature).
// The text and answers are saved to the debug log (Vercel Blob) only when DEBUG_LOG is "true" for this environment.
export async function POST(request: Request): Promise<Response> {
  let payload: {
    text?: unknown;
    exclude?: unknown;
    aodCourse?: unknown;
    source?: unknown;
    answers?: unknown;
    about?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const run = await runMatch(payload.text, payload.exclude, payload.aodCourse);
  if (run.errorLog) console.error(`[api/match] ${run.errorLog}`);
  await logRun(payload, run);
  return Response.json(run.body, { status: run.status, headers: { "Cache-Control": "no-store" } });
}
