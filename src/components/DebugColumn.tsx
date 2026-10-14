// The test details panel below the courses on results pages. Only shown when debug is on (src/debugFlag.ts).
// Collapsed each time results appear, so stakeholders don't mistake it for part of the design.
import type { MatchResponse, RiskCheckResponse, TokenUsage } from "../types";
import { DebugPanel } from "./DebugPanel";
import { PRICING_SOURCE, costUsd, formatNzd } from "../debug/pricing";
import { useFx } from "../debug/useFx";

export interface DebugMatch {
  /** e.g. "you" or "the person they support" when there are two matches. */
  label?: string;
  data: MatchResponse;
  /** The text JEV received. */
  sent?: string | null;
}

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const fmt = (n: number) => n.toLocaleString("en-NZ");

export function DebugColumn({
  matches,
  answers,
  riskCheck,
}: {
  matches: DebugMatch[];
  /** Hybrid and Multiple choice: what was chosen at each step. */
  answers?: { prompt: string; answer: string }[];
  /** The self-harm check on typed text, if one ran. */
  riskCheck?: RiskCheckResponse;
}) {
  const fx = useFx();
  // Multiple choice: matched by rules, so there's no AI request, cost or score to show for it.
  const ruled = matches.filter((m) => m.data.ruleReasons);
  const scored = matches.filter((m) => !m.data.ruleReasons);
  const rows: { label: string; usage?: TokenUsage; model: string }[] = [
    ...scored.map((m) => ({
      label: `Match${m.label ? ` (${m.label})` : ""}`,
      usage: m.data.usage,
      model: m.data.model,
    })),
    ...(riskCheck ? [{ label: "Risk check", usage: riskCheck.usage, model: riskCheck.model }] : []),
  ];
  const costs = rows.map((r) => (r.usage ? costUsd(r.usage, r.model) : undefined));
  const total = costs.reduce<number>((sum, c) => sum + (c ?? 0), 0);

  return (
    <details className="card results-debug">
      <summary>
        Show test details <span className="hint">For the project team, not part of the design.</span>
      </summary>

      {answers && answers.length > 0 && (
        <section className="debug-section">
          <h2>Answers chosen</h2>
          <dl className="debug-answers">
            {answers.map((a) => (
              <div key={a.prompt}>
                <dt>{a.prompt}</dt>
                <dd>{a.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {ruled.map((m) => (
        <section key={`rules-${m.label ?? "match"}`} className="debug-section">
          <h2>Matched by rules (no AI)</h2>
          <p className="hint">Courses come from the answers by fixed rules (src/multiple-choice/rules.ts).</p>
          <dl className="debug-answers">
            {m.data.results.map((c) => (
              <div key={c.id}>
                <dt>{c.addedByRule ? `Added by the ${c.addedByRule} rule` : m.data.ruleReasons?.[c.id]}</dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {scored.map((m) => (
        <section key={m.label ?? "match"} className="debug-section">
          <h2>Sent to JEV{m.label && ` (${m.label})`}</h2>
          <blockquote className="debug-text">{m.sent ?? "—"}</blockquote>
        </section>
      ))}

      {rows.length > 0 && (
        <section className="debug-section">
          <h2>Tokens and cost</h2>
          <table className="debug-cost">
            <thead>
              <tr>
                <th>Request</th>
                <th className="num">In</th>
                <th className="num">Out</th>
                <th className="num">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td className="num">{r.usage ? fmt(r.usage.input_tokens) : "–"}</td>
                  <td className="num">{r.usage ? fmt(r.usage.output_tokens) : "–"}</td>
                  <td className="num">{costs[i] === undefined ? "–" : formatNzd(costs[i]!, fx)}</td>
                </tr>
              ))}
              {rows.length > 1 && (
                <tr className="total">
                  <td>Total</td>
                  <td className="num">{fmt(rows.reduce((s, r) => s + (r.usage?.input_tokens ?? 0), 0))}</td>
                  <td className="num">{fmt(rows.reduce((s, r) => s + (r.usage?.output_tokens ?? 0), 0))}</td>
                  <td className="num">{formatNzd(total, fx)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="hint">
            US$0.042 per million input tokens, output free ({PRICING_SOURCE}). 1 USD = {fx.nzdPerUsd} NZD (
            {fx.live ? `ECB rate for ${fx.date}` : "saved rate"}).
          </p>
          {riskCheck && (
            <p className="hint">
              Risk check: writer {pct(riskCheck.selfHarm)} · person they support {pct(riskCheck.otherAtRisk)} (threshold{" "}
              {pct(riskCheck.threshold)})
              {riskCheck.theirTopic !== undefined && ` · their topics ${pct(riskCheck.theirTopic)}`}
            </p>
          )}
        </section>
      )}

      {scored.map((m) => (
        <DebugPanel key={`scores-${m.label ?? "match"}`} data={m.data} label={m.label} />
      ))}
    </details>
  );
}
