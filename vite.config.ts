import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

// USD→NZD for the debug page's cost figures. Fetched server-side because frankfurter.dev doesn't send CORS headers.
// European Central Bank reference rates, updated once each working day, so it's cached for an hour.
let fxCache: { body: unknown; at: number } | undefined;
async function sendFx(res: ServerResponse) {
  if (fxCache && Date.now() - fxCache.at < 3_600_000) return sendJson(res, 200, fxCache.body);
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=NZD", {
      signal: AbortSignal.timeout(5000),
    });
    const d = (await r.json()) as { date?: string; rates?: { NZD?: number } };
    if (!r.ok || typeof d.rates?.NZD !== "number" || typeof d.date !== "string") throw new Error();
    const body = { nzdPerUsd: d.rates.NZD, date: d.date, live: true };
    fxCache = { body, at: Date.now() };
    return sendJson(res, 200, body);
  } catch {
    return sendJson(res, 502, { error: "Exchange rate unavailable." });
  }
}

// Local dev server only (`npm run dev`); Vercel serves api/match.ts in production.
// - POST /api/match: same behaviour as api/match.ts, plus every query is written to logs/queries.jsonl.
// - GET/DELETE /api/debug/log: read or clear that log for /debug.html.
function localApi(): Plugin {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        // Hybrid was called Questionnaire; vercel.json does the same redirect when deployed.
        if (path === "/questionnaire.html") {
          res.statusCode = 301;
          res.setHeader("location", "/hybrid.html");
          return res.end();
        }
        if (path === "/api/debug/fx") return sendFx(res);
        if (path !== "/api/match" && path !== "/api/risk" && path !== "/api/debug/log") return next();

        const { runMatch, runRiskCheck } = await server.ssrLoadModule("/lib/match.ts");
        const log = await server.ssrLoadModule("/dev/queryLog.ts");

        if (path === "/api/risk") {
          if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
          let payload: { text?: unknown; source?: unknown };
          try {
            payload = (await readJson(req)) as typeof payload;
          } catch {
            return sendJson(res, 400, { error: "Invalid request." });
          }
          const run = await runRiskCheck(payload.text);
          if (run.errorLog) console.error(`[api/risk] ${run.errorLog}`);
          log.appendEntry({ ...payload, kind: "risk-check" }, run);
          return sendJson(res, run.status, run.body);
        }

        if (path === "/api/match") {
          if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed." });
          let payload: { text?: unknown; source?: unknown; answers?: unknown; exclude?: unknown; about?: unknown };
          try {
            payload = (await readJson(req)) as typeof payload;
          } catch {
            return sendJson(res, 400, { error: "Invalid request." });
          }
          const run = await runMatch(payload.text, payload.exclude);
          if (run.errorLog) console.error(`[api/match] ${run.errorLog}`);
          log.appendEntry(payload, run);
          return sendJson(res, run.status, run.body);
        }

        if (req.method === "GET") return sendJson(res, 200, log.readEntries());
        if (req.method === "DELETE") {
          log.clearEntries();
          return sendJson(res, 200, { cleared: true });
        }
        return sendJson(res, 405, { error: "Method not allowed." });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make .env.local values (e.g. TYPESAFE_API_KEY) available to the server-side handler only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), "TYPESAFE_"));
  return {
    plugins: [react(), localApi()],
    // debug.html is deliberately left out so the debug page is never deployed.
    build: {
      rolldownOptions: {
        input: {
          home: resolve(import.meta.dirname, "index.html"),
          freeText: resolve(import.meta.dirname, "free-text.html"),
          hybrid: resolve(import.meta.dirname, "hybrid.html"),
          multipleChoice: resolve(import.meta.dirname, "multiple-choice.html"),
        },
      },
    },
  };
});
