// Deployed debug log: one private Vercel Blob per entry under debug-log/.
// Functions can't keep a file (each instance has its own /tmp, wiped on recycle), so entries go to Blob instead.
// Auth comes from the linked store's env vars (BLOB_READ_WRITE_TOKEN, or OIDC with BLOB_STORE_ID).
import { del, get, list, put } from "@vercel/blob";
import type { QueryLogEntry } from "../../src/debug/types.js";
import { parseEntry } from "./entry.js";

const PREFIX = "debug-log/";
/** The /debug.html page shows at most this many entries. */
const READ_LIMIT = 200;
const DAY_MS = 86_400_000;

function retentionMs(): number {
  const days = Number(process.env.DEBUG_RETENTION_DAYS);
  return (Number.isFinite(days) && days > 0 ? days : 14) * DAY_MS;
}

// Blob lists pathnames in ascending order, so a reverse timestamp puts the newest entries first.
const MAX_TIME = 9_999_999_999_999;
const pathFor = (entry: QueryLogEntry) =>
  `${PREFIX}${String(MAX_TIME - Date.parse(entry.time)).padStart(13, "0")}-${entry.id}.json`;

// When this function instance last purged, so writes don't each list the whole store.
let lastPurge = 0;

export async function append(entry: QueryLogEntry): Promise<void> {
  await put(pathFor(entry), JSON.stringify(entry), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  // Old entries go even if nobody opens /debug.html.
  if (Date.now() - lastPurge > 3_600_000) {
    lastPurge = Date.now();
    await purgeExpired();
  }
}

/** Newest first, up to READ_LIMIT. Deletes anything past the retention period on the way. */
export async function read(): Promise<QueryLogEntry[]> {
  await purgeExpired();
  const { blobs: current } = await list({ prefix: PREFIX, limit: READ_LIMIT });

  const entries: (QueryLogEntry | undefined)[] = [];
  // A few at a time so a full page doesn't open 200 requests at once.
  for (let i = 0; i < current.length; i += 10) {
    entries.push(
      ...(await Promise.all(
        current.slice(i, i + 10).map(async (b) => {
          const res = await get(b.pathname, { access: "private", useCache: false });
          if (!res || res.statusCode !== 200) return undefined;
          return parseEntry(await new Response(res.stream).text());
        }),
      )),
    );
  }
  return entries.filter((e): e is QueryLogEntry => !!e);
}

/** Deletes every entry older than the retention period. Oldest entries are at the end of the listing. */
export async function purgeExpired(): Promise<void> {
  const cutoff = Date.now() - retentionMs();
  await deleteWhere((uploadedAt) => uploadedAt.getTime() < cutoff);
}

export async function clear(): Promise<void> {
  await deleteWhere(() => true);
}

async function deleteWhere(match: (uploadedAt: Date) => boolean): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    const urls = page.blobs.filter((b) => match(b.uploadedAt)).map((b) => b.url);
    if (urls.length) await del(urls);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}
