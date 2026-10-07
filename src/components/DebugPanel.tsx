import type { MatchResponse } from "../types";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function DebugPanel({ data, label }: { data: MatchResponse; label?: string }) {
  const { thresholds: t, flags } = data;
  return (
    <details className="card debug" open>
      <summary>Debug: JEV scores{label && ` (${label})`}</summary>
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
          {flags.aod !== undefined && <Row label="aod" value={flags.aod} hit={flags.aod >= (t.aod ?? 1)} />}
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
              label={data.results.some((r) => r.id === c.id && r.addedByRule) ? `${c.name} (added by AOD rule)` : c.name}
              value={c.probability}
              hit={data.results.some((r) => r.id === c.id)}
            />
          ))}
        </tbody>
      </table>
    </details>
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
