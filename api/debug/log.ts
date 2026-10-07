import * as blobStore from "../../lib/debugLog/blobStore.js";
import { debugEnabled, hasDebugToken, noStore, notFound } from "../../lib/debugLog/server.js";

// Vercel Function for /debug.html: list (GET) or clear (DELETE) the debug log.
// 404 unless DEBUG_LOG is on; 401 without an x-debug-token header matching DEBUG_TOKEN.
function denied(request: Request): Response | undefined {
  if (!debugEnabled()) return notFound();
  if (!hasDebugToken(request)) return Response.json({ error: "Debug token required." }, { status: 401, headers: noStore });
  return undefined;
}

export async function GET(request: Request): Promise<Response> {
  const no = denied(request);
  if (no) return no;
  try {
    return Response.json(await blobStore.read(), { headers: noStore });
  } catch (err) {
    console.error(`[api/debug/log] read failed: ${err instanceof Error ? err.name : "unknown"}`);
    return Response.json({ error: "Couldn't read the log." }, { status: 502, headers: noStore });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const no = denied(request);
  if (no) return no;
  try {
    await blobStore.clear();
    return Response.json({ cleared: true }, { headers: noStore });
  } catch (err) {
    console.error(`[api/debug/log] clear failed: ${err instanceof Error ? err.name : "unknown"}`);
    return Response.json({ error: "Couldn't clear the log." }, { status: 502, headers: noStore });
  }
}
