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

// Local dev server only (`npm run dev`); Vercel serves the api/ functions when deployed.
// - POST /api/match and /api/risk: same behaviour as the api/ functions, but always logged, to logs/queries.jsonl.
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
        if (path === "/api/debug/fx") {
          const { fetchFx } = await server.ssrLoadModule("/lib/debugLog/fx.ts");
          const fx = await fetchFx();
          return sendJson(res, fx.status, fx.body);
        }
        if (path !== "/api/match" && path !== "/api/risk" && path !== "/api/debug/log") return next();

        const { runMatch, runRiskCheck } = await server.ssrLoadModule("/lib/match.ts");
        const log = await server.ssrLoadModule("/lib/debugLog/fileStore.ts");
        const { buildEntry } = await server.ssrLoadModule("/lib/debugLog/entry.ts");

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
          await log.append(buildEntry({ ...payload, kind: "risk-check" }, run));
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
          await log.append(buildEntry(payload, run));
          return sendJson(res, run.status, run.body);
        }

        if (req.method === "GET") return sendJson(res, 200, await log.read());
        if (req.method === "DELETE") {
          await log.clear();
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
  // VITE_DEBUG=true (set in Vercel) builds the debug panels and /debug.html into the deployed site.
  const debug = loadEnv(mode, process.cwd(), "VITE_").VITE_DEBUG === "true";
  return {
    plugins: [react(), localApi()],
    // debug.html is only built when VITE_DEBUG is on.
    build: {
      rolldownOptions: {
        input: {
          home: resolve(import.meta.dirname, "index.html"),
          freeText: resolve(import.meta.dirname, "free-text.html"),
          hybrid: resolve(import.meta.dirname, "hybrid.html"),
          multipleChoice: resolve(import.meta.dirname, "multiple-choice.html"),
          ...(debug && { debug: resolve(import.meta.dirname, "debug.html") }),
        },
      },
    },
  };
});
