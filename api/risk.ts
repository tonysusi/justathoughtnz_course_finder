import { runRiskCheck } from "../lib/match.js";

// Vercel Function: the Hybrid and Multiple choice self-harm check on typed text. Nothing is logged or stored here.
export async function POST(request: Request): Promise<Response> {
  let text: unknown;
  try {
    ({ text } = (await request.json()) as { text?: unknown });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const run = await runRiskCheck(text);
  if (run.errorLog) console.error(`[api/risk] ${run.errorLog}`);
  return Response.json(run.body, { status: run.status, headers: { "Cache-Control": "no-store" } });
}
