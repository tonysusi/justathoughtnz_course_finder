import { runMatch } from "../lib/match.js";

// Vercel Function (Node runtime, Web Request/Response signature).
// User text is never logged or stored here; only the local dev server keeps a debug log.
export async function POST(request: Request): Promise<Response> {
  let text: unknown;
  let exclude: unknown;
  try {
    ({ text, exclude } = (await request.json()) as { text?: unknown; exclude?: unknown });
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const run = await runMatch(text, exclude);
  if (run.errorLog) console.error(`[api/match] ${run.errorLog}`);
  return Response.json(run.body, { status: run.status, headers: { "Cache-Control": "no-store" } });
}
