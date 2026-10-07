import { runRiskCheck } from "../lib/match.js";
import { logRun } from "../lib/debugLog/server.js";

// Vercel Function: the Hybrid and Multiple choice self-harm check on typed text.
// Saved to the debug log (Vercel Blob) only when DEBUG_LOG is "true" for this environment.
export async function POST(request: Request): Promise<Response> {
  let payload: { text?: unknown; source?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const run = await runRiskCheck(payload.text);
  if (run.errorLog) console.error(`[api/risk] ${run.errorLog}`);
  await logRun({ ...payload, kind: "risk-check" }, run);
  return Response.json(run.body, { status: run.status, headers: { "Cache-Control": "no-store" } });
}
