// USD→NZD for the debug cost figures. Fetched server-side because frankfurter.dev doesn't send CORS headers.
// European Central Bank reference rates, updated once each working day, so it's cached for an hour.
export interface FxResult {
  status: number;
  body: { nzdPerUsd: number; date: string; live: true } | { error: string };
}

let fxCache: { result: FxResult; at: number } | undefined;

export async function fetchFx(): Promise<FxResult> {
  if (fxCache && Date.now() - fxCache.at < 3_600_000) return fxCache.result;
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=NZD", {
      signal: AbortSignal.timeout(5000),
    });
    const d = (await r.json()) as { date?: string; rates?: { NZD?: number } };
    if (!r.ok || typeof d.rates?.NZD !== "number" || typeof d.date !== "string") throw new Error();
    const result: FxResult = { status: 200, body: { nzdPerUsd: d.rates.NZD, date: d.date, live: true } };
    fxCache = { result, at: Date.now() };
    return result;
  } catch {
    return { status: 502, body: { error: "Exchange rate unavailable." } };
  }
}
