import { useCallback, useEffect, useState } from "react";
import type { MatchResponse, MatchSource, RiskCheckResponse } from "../types";
import type { QueryLogEntry } from "./types";
import { Nav } from "../components/Nav";
import { useFx } from "./useFx";
import { PRICING_SOURCE, costUsd, formatNzd, formatUsd, usageOf, type FxRate } from "./pricing";

const SOURCE_LABEL: Record<MatchSource, string> = {
  "free-text": "Free text",
  hybrid: "Hybrid",
  "multiple-choice": "Multiple choice",
};

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const isMatch = (body: QueryLogEntry["body"]): body is MatchResponse => "results" in body;
const isRiskCheck = (body: QueryLogEntry["body"]): body is RiskCheckResponse => "selfHarm" in body;

// Deployed, the log API needs the DEBUG_TOKEN set in Vercel. It's kept for this browser tab only, never in the bundle.
// The local dev server doesn't check it.
const TOKEN_KEY = "debug-token";
function readToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}
function saveToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Private window or blocked storage: the token still works until the page reloads.
  }
}

export default function DebugApp() {
  const [entries, setEntries] = useState<QueryLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [token, setToken] = useState(readToken);
  const [needsToken, setNeedsToken] = useState(false);
  const fx = useFx();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/debug/log", { headers: { "x-debug-token": token } });
      if (res.status === 401) {
        setNeedsToken(true);
        setEntries(null);
        setError(token ? "That debug token wasn't accepted." : null);
        return;
      }
      if (!res.ok) throw new Error();
      setEntries((await res.json()) as QueryLogEntry[]);
      setNeedsToken(false);
      setError(null);
    } catch {
      setError("Couldn't load the log. Debug logging may be turned off for this deployment.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function rerun(entry: QueryLogEntry) {
    if (typeof entry.text !== "string") return;
    setBusy(entry.id);
    try {
      await fetch(entry.kind === "risk-check" ? "/api/risk" : "/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: entry.text,
          source: entry.source ?? "free-text",
          answers: entry.answers,
          exclude: entry.exclude,
          about: entry.about,
        }),
      });
    } finally {
      setBusy(null);
      await load();
    }
  }

  async function clear() {
    if (!window.confirm("Delete every entry in the query log? This can't be undone.")) return;
    await fetch("/api/debug/log", { method: "DELETE", headers: { "x-debug-token": token } });
    await load();
  }

  return (
    <>
      <Nav current="debug" />
      <main className="container debug-page">
        <header>
          <p className="eyebrow">Debug · test version only</p>
          <h1>JEV query log</h1>
          <p className="hint">
            Every query sent while debug is on, newest first. Locally it's stored in <code>logs/queries.jsonl</code> until
            cleared; on the deployed site it's in Vercel Blob and deleted after 14 days.
          </p>
          {needsToken && (
            <form
              className="toolbar"
              onSubmit={(ev) => {
                ev.preventDefault();
                const value = new FormData(ev.currentTarget).get("token");
                const next = typeof value === "string" ? value.trim() : "";
                saveToken(next);
                setToken(next);
              }}
            >
              <label htmlFor="debug-token">Debug token</label>
              <input id="debug-token" name="token" type="password" autoComplete="off" defaultValue={token} />
              <button type="submit">Open log</button>
            </form>
          )}
          <div className="toolbar">
            <button type="button" className="secondary" onClick={load}>
              Refresh
            </button>
            <button type="button" className="danger" onClick={clear} disabled={!entries?.length}>
              Clear log
            </button>
            {entries && <span className="hint">{entries.length} entries</span>}
          </div>
          {!!entries?.length && <CostSummary entries={entries} fx={fx} />}
        </header>

        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        {entries?.length === 0 && <p className="alert">No queries logged yet.</p>}

        <ol className="log">
          {entries?.map((e) => (
            <LogRow key={e.id} entry={e} fx={fx} busy={busy === e.id} onRerun={() => rerun(e)} />
          ))}
        </ol>
      </main>
    </>
  );
}

function LogRow({
  entry: e,
  fx,
  busy,
  onRerun,
}: {
  entry: QueryLogEntry;
  fx: FxRate;
  busy: boolean;
  onRerun: () => void;
}) {
  const body = e.body;
  const ok = isMatch(body);
  const riskCheck = isRiskCheck(body) ? body : undefined;
  const crisis = ok && body.flags.selfHarm >= body.thresholds.selfHarm;
  const offTopic = ok && body.flags.offTopic >= body.thresholds.offTopic;
  const someoneElse =
    (ok && body.flags.someoneElse >= body.thresholds.someoneElse) ||
    (Array.isArray((e.answers as { concerns?: unknown })?.concerns) &&
      (e.answers as { concerns: unknown[] }).concerns.includes("someone_else"));
  const source = e.source ?? "free-text";
  const risk = (e.answers as { risk?: unknown } | undefined)?.risk;
  const riskAnswer = risk === "yes" || risk === "unsure" ? risk : undefined;
  const u = usageOf(e.jevResponse);
  const usd = u && costUsd(u.usage, u.model);
  const cost = u && (
    <>
      {" "}
      · {u.usage.input_tokens.toLocaleString("en-NZ")} in / {u.usage.output_tokens.toLocaleString("en-NZ")} out tokens ·{" "}
      <strong title={usd === undefined ? undefined : formatUsd(usd)}>
        {usd === undefined ? "price unknown" : formatNzd(usd, fx)}
      </strong>
    </>
  );

  return (
    <li className="card log-entry">
      <div className="log-head">
        <time dateTime={e.time}>{new Date(e.time).toLocaleString("en-NZ")}</time>
        <span className="hint">
          {e.status} · {e.durationMs} ms{ok || riskCheck ? ` · ${(ok ? body : riskCheck!).model}` : ""}
          {cost}
        </span>
        <span className={`tag tag-source-${source}`}>{SOURCE_LABEL[source]}</span>
        {e.kind === "risk-check" && <span className="tag tag-crisis">Risk check</span>}
        {e.about === "them" && <span className="tag">About the person they support</span>}
        {riskAnswer && <span className="tag tag-crisis">Risk answer: {riskAnswer === "yes" ? "Yes" : "Not sure"}</span>}
        {crisis && <span className="tag tag-crisis">Crisis panel</span>}
        {someoneElse && <span className="tag">Supporting someone</span>}
        {offTopic && <span className="tag">Off-topic</span>}
        {!ok && <span className="tag tag-error">Error</span>}
        <button
          type="button"
          className="secondary small"
          onClick={onRerun}
          disabled={busy || typeof e.text !== "string"}
        >
          {busy ? "Running…" : "Re-run"}
        </button>
      </div>

      <blockquote className="log-text">{typeof e.text === "string" ? e.text : JSON.stringify(e.text)}</blockquote>

      {ok ? (
        <p className="log-results">
          <strong>Results:</strong>{" "}
          {body.results.length ? body.results.map((c) => `${c.name} ${pct(c.probability)}`).join(" · ") : "none"}
          <br />
          <span className="hint">
            self-harm {pct(body.flags.selfHarm)} · off-topic {pct(body.flags.offTopic)}
          </span>
        </p>
      ) : riskCheck ? (
        <p className="log-results">
          <strong>Risk check:</strong> writer {pct(riskCheck.selfHarm)} (
          {riskCheck.selfHarm >= riskCheck.threshold ? "flagged" : "not flagged"}) · person they support{" "}
          {pct(riskCheck.otherAtRisk ?? 0)} (
          {(riskCheck.otherAtRisk ?? 0) >= riskCheck.threshold ? "flagged" : "not flagged"})
        </p>
      ) : (
        <p className="log-results">
          <strong>Error:</strong> {"error" in body ? body.error : "Unknown"}
          {e.errorLog && <span className="hint"> ({e.errorLog})</span>}
        </p>
      )}

      <details>
        <summary>Details</summary>
        {source !== "free-text" && e.answers !== undefined && (
          <>
            <h3>Answers</h3>
            <pre>{JSON.stringify(e.answers, null, 2)}</pre>
            <p className="hint">The text above is the summary built from these answers and sent to JEV.</p>
            {ok && body.excluded?.length > 0 && <p className="hint">Excluded by answers: {body.excluded.join(", ")}</p>}
          </>
        )}
        {ok && (
          <table className="scores">
            <thead>
              <tr>
                <th>Course</th>
                <th>P(yes)</th>
              </tr>
            </thead>
            <tbody>
              {body.all.map((c) => (
                <tr key={c.id} className={body.results.some((r) => r.id === c.id) ? "hit" : undefined}>
                  <td>{c.name}</td>
                  <td className="num">{pct(c.probability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <h3>JEV request</h3>
        <pre>
          {e.jevRequest ? JSON.stringify(e.jevRequest, null, 2) : "Not sent (request failed before reaching JEV)."}
        </pre>
        <h3>JEV response</h3>
        <pre>{e.jevResponse ? JSON.stringify(e.jevResponse, null, 2) : "No response."}</pre>
      </details>
    </li>
  );
}

const fmtInt = (n: number) => Math.round(n).toLocaleString("en-NZ");

/** Token and cost totals for the whole log, split by option so the two can be compared. */
function CostSummary({ entries, fx }: { entries: QueryLogEntry[]; fx: FxRate }) {
  const groups: { label: string; filter: (e: QueryLogEntry) => boolean }[] = [
    { label: "Free text", filter: (e) => (e.source ?? "free-text") === "free-text" },
    { label: "Hybrid", filter: (e) => e.source === "hybrid" },
    { label: "Multiple choice", filter: (e) => e.source === "multiple-choice" },
    { label: "All", filter: () => true },
  ];
  let unpriced = 0;
  const rows = groups.map(({ label, filter }) => {
    let queries = 0;
    let input = 0;
    let output = 0;
    let usd = 0;
    for (const e of entries.filter(filter)) {
      const u = usageOf(e.jevResponse);
      if (!u) continue; // failed before reaching JEV: no tokens used
      const c = costUsd(u.usage, u.model);
      if (c === undefined) {
        if (label === "All") unpriced++;
        continue;
      }
      queries++;
      input += u.usage.input_tokens;
      output += u.usage.output_tokens;
      usd += c;
    }
    return { label, queries, input, output, usd };
  });
  const all = rows[rows.length - 1];

  return (
    <div className="card cost-summary">
      <table className="scores">
        <thead>
          <tr>
            <th>JEV cost</th>
            <th className="num">Queries</th>
            <th className="num">Avg input tokens</th>
            <th className="num">Avg cost</th>
            <th className="num">Total cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className={r.label === "All" ? "total" : undefined}>
              <td>{r.label}</td>
              <td className="num">{r.queries}</td>
              <td className="num">{r.queries ? fmtInt(r.input / r.queries) : "–"}</td>
              <td className="num">{r.queries ? formatNzd(r.usd / r.queries, fx) : "–"}</td>
              <td className="num">{formatNzd(r.usd, fx)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        {all.queries > 0 && (
          <>
            At the current average, 1,000 queries would cost about{" "}
            <strong>{formatNzd((all.usd / all.queries) * 1000, fx)}</strong> (
            {formatUsd((all.usd / all.queries) * 1000)}).{" "}
          </>
        )}
        Totals: {fmtInt(all.input)} input and {fmtInt(all.output)} output tokens. Priced at US$0.042 per million input
        tokens; output tokens are free ({PRICING_SOURCE}; currency assumed USD). Converted at 1 USD = {fx.nzdPerUsd}{" "}
        NZD, the European Central Bank reference rate for{" "}
        {new Date(fx.date).toLocaleDateString("en-NZ", { dateStyle: "medium" })}
        {fx.live ? " (via frankfurter.dev)" : " (saved rate; live rate unavailable)"}.
        {unpriced > 0 && ` ${unpriced} queries used a model with no known price and aren't counted.`}
      </p>
    </div>
  );
}
