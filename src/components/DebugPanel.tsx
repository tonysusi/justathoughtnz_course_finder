import type { MatchResponse } from "../types";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const PROVIDER_LABEL = { jev: "JEV", azure: "Azure" } as const;

export function DebugPanel({ data, label }: { data: MatchResponse; label?: string }) {
  const { thresholds: t, flags, compare } = data;
  const provider = PROVIDER_LABEL[data.provider ?? "jev"];
  const other = compare && PROVIDER_LABEL[compare.provider];
  const cf = compare?.flags;
  return (
    <details className="card debug" open>
      <summary>
        Debug: {provider} scores{other && ` (vs ${other})`}
        {label && ` (${label})`}
      </summary>
      <p className="hint">
        Model <code>{data.model}</code>
        {compare?.model && (
          <>
            {" "}
            vs <code>{compare.model}</code>
          </>
        )}{" "}
        · match ≥ {pct(t.match)} (max {t.maxResults}) · self-harm ≥ {pct(t.selfHarm)} · off-topic ≥ {pct(t.offTopic)}
        {t.aod !== undefined && ` · aod ≥ ${pct(t.aod)}`}
      </p>
      {compare?.error && (
        <p className="hint">
          {other} failed: <code>{compare.error}</code>
        </p>
      )}
      {flags.filterSelfHarm && (
        <p className="hint">
          Azure content filter self-harm: <strong>{flags.filterSelfHarm}</strong>
          {flags.selfHarm === 1 && flags.selfHarmModel !== 1 && " (flagged self-harm by itself)"}
        </p>
      )}
      {cf?.filterSelfHarm && (
        <p className="hint">
          {other} content filter self-harm: <strong>{cf.filterSelfHarm}</strong>
        </p>
      )}
      {data.excluded.length > 0 && <p className="hint">Excluded by answers: {data.excluded.join(", ")}</p>}
      <table>
        {cf && <Head first="Flag" provider={provider} other={other} />}
        <tbody>
          <Row label="self_harm" value={flags.selfHarm} other={cf?.selfHarm} hit={flags.selfHarm >= t.selfHarm} />
          {flags.selfHarmModel !== undefined && flags.selfHarmModel !== flags.selfHarm && (
            <Row label="self_harm (model)" value={flags.selfHarmModel} other={cf?.selfHarmModel} hit={false} />
          )}
          <Row label="off_topic" value={flags.offTopic} other={cf?.offTopic} hit={flags.offTopic >= t.offTopic} />
          <Row
            label="someone_else"
            value={flags.someoneElse ?? 0}
            other={cf?.someoneElse}
            hit={flags.someoneElse >= t.someoneElse}
          />
          {flags.aod !== undefined && (
            <Row label="aod" value={flags.aod} other={cf?.aod} hit={flags.aod >= (t.aod ?? 1)} />
          )}
        </tbody>
      </table>
      <table>
        <Head
          first="Course"
          provider={compare?.courses ? provider : "P(yes)"}
          other={compare?.courses ? other : undefined}
        />
        <tbody>
          {data.all.map((c) => (
            <Row
              key={c.id}
              label={data.results.some((r) => r.id === c.id && r.addedByRule) ? `${c.name} (added by AOD rule)` : c.name}
              value={c.probability}
              other={compare?.courses?.[c.id]}
              hit={data.results.some((r) => r.id === c.id)}
            />
          ))}
        </tbody>
      </table>
    </details>
  );
}

function Head({ first, provider, other }: { first: string; provider: string; other?: string }) {
  return (
    <thead>
      <tr>
        <th>{first}</th>
        <th>{provider}</th>
        {other && <th>{other}</th>}
      </tr>
    </thead>
  );
}

function Row({ label, value, other, hit }: { label: string; value: number; other?: number; hit: boolean }) {
  return (
    <tr className={hit ? "hit" : undefined}>
      <td>{label}</td>
      <td className="num">
        <span className="bar" style={{ width: `${value * 100}%` }} aria-hidden="true" />
        {pct(value)}
      </td>
      {other !== undefined && <td className="num">{pct(other)}</td>}
    </tr>
  );
}
