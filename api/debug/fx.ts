import { fetchFx } from "../../lib/debugLog/fx.js";
import { debugEnabled, noStore, notFound } from "../../lib/debugLog/server.js";

// Vercel Function: USD→NZD rate for the debug cost figures. Only when DEBUG_LOG is on.
export async function GET(): Promise<Response> {
  if (!debugEnabled()) return notFound();
  const { status, body } = await fetchFx();
  return Response.json(body, { status, headers: noStore });
}
