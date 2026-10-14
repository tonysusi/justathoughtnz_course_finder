import type { MatchResponse } from "../types";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const RULE_LABEL = { aod: "AOD rule", mood: "mood rule", life_stage: "life-stage rule", clinical: "clinical rule" } as const;
const ruleLabel = (name: string, rule?: keyof typeof RULE_LABEL) => (rule ? `${name} (added by ${RULE_LABEL[rule]})` : name);

const TOPIC_FLAGS = [
  ["lowMood", "low_mood"],
  ["newBaby", "new_baby"],
  ["theirTopic", "their_topic"],
  ["pregnancyLoss", "pregnancy_loss"],
  ["tryingToConceive", "trying_to_conceive"],
  ["under16", "under_16"],
] as const;

export function DebugPanel({ data, label }: { data: MatchResponse; label?: string }) {
  const { thresholds: t, flags } = data;
  return (
    <section className="debug debug-section">
      <h2>JEV scores{label && ` (${label})`}</h2>
      <p className="hint">
        Model <code>{data.model}</code> · match ≥ {pct(t.match)} (max {t.maxResults}) · self-harm ≥ {pct(t.selfHarm)} ·
        off-topic ≥ {pct(t.offTopic)}
        {t.aod !== undefined && ` · aod ≥ ${pct(t.aod)}`}
      </p>
      {data.excluded.length > 0 && <p className="hint">Excluded by answers: {data.excluded.join(", ")}</p>}
      <table>
        <tbody>
          <Row label="self_harm" value={flags.selfHarm} hit={flags.selfHarm >= t.selfHarm} />
          <Row label="off_topic" value={flags.offTopic} hit={flags.offTopic >= t.offTopic} />
          <Row label="someone_else" value={flags.someoneElse ?? 0} hit={flags.someoneElse >= t.someoneElse} />
          {flags.otherAtRisk !== undefined && (
            <Row label="other_at_risk" value={flags.otherAtRisk} hit={flags.otherAtRisk >= t.selfHarm} />
          )}
          {flags.aod !== undefined && <Row label="aod" value={flags.aod} hit={flags.aod >= (t.aod ?? 1)} />}
          {TOPIC_FLAGS.map(
            ([key, label]) =>
              flags[key] !== undefined && (
                <Row key={key} label={label} value={flags[key]!} hit={flags[key]! >= (t.topic ?? 1)} />
              ),
          )}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>P(yes)</th>
          </tr>
        </thead>
        <tbody>
          {data.all.map((c) => (
            <Row
              key={c.id}
              label={ruleLabel(c.name, data.results.find((r) => r.id === c.id)?.addedByRule)}
              value={c.probability}
              hit={data.results.some((r) => r.id === c.id)}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Row({ label, value, hit }: { label: string; value: number; hit: boolean }) {
  return (
    <tr className={hit ? "hit" : undefined}>
      <td>{label}</td>
      <td className="num">
        <span className="bar" style={{ width: `${value * 100}%` }} aria-hidden="true" />
        {pct(value)}
      </td>
    </tr>
  );
}
