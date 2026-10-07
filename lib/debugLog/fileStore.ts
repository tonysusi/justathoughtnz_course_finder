// Local dev server debug log: logs/queries.jsonl on this computer. logs/ is git-ignored; kept until cleared.
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { QueryLogEntry } from "../../src/debug/types.js";
import { parseEntry } from "./entry.js";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "queries.jsonl");

export async function append(entry: QueryLogEntry): Promise<void> {
  mkdirSync(LOG_DIR, { recursive: true });
  appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
}

/** Newest first. Skips any line that fails to parse (e.g. partially written) rather than failing the whole page. */
export async function read(): Promise<QueryLogEntry[]> {
  if (!existsSync(LOG_FILE)) return [];
  const entries: QueryLogEntry[] = [];
  for (const line of readFileSync(LOG_FILE, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const entry = parseEntry(line);
    if (entry) entries.push(entry);
  }
  return entries.reverse();
}

export async function clear(): Promise<void> {
  rmSync(LOG_FILE, { force: true });
}
