// JEV pricing, from https://docs.typesafe.ai/models (checked 6 Oct 2026):
// Jev 1.13 is "$42 / $0.042" per billion / per million tokens, "Charged per input token. Output tokens are free."
// The docs don't state a currency; USD is assumed. Update this table if TypeSafe changes its prices or models.

export const PRICING_SOURCE = "docs.typesafe.ai/models, checked 6 Oct 2026";

const USD_PER_MILLION_INPUT: Record<string, number> = {
  "jev-1.13.0": 0.042,
};

export interface Usage {
  input_tokens: number;
  output_tokens: number;
}

/** Reads `usage` and `model` from a logged JEV response, if present. */
export function usageOf(jevResponse: unknown): { usage: Usage; model: string } | undefined {
  const r = jevResponse as { usage?: Partial<Usage>; model?: unknown } | undefined;
  if (typeof r?.usage?.input_tokens !== "number" || typeof r.model !== "string") return undefined;
  return { usage: { input_tokens: r.usage.input_tokens, output_tokens: r.usage.output_tokens ?? 0 }, model: r.model };
}

/** Cost in USD, or undefined when the model's price isn't known. Output tokens are free. */
export function costUsd(usage: Usage, model: string): number | undefined {
  const rate = USD_PER_MILLION_INPUT[model];
  return rate === undefined ? undefined : (usage.input_tokens / 1_000_000) * rate;
}

/** Costs here are fractions of a cent, so show enough significant figures to be useful. */
function formatMoney(amount: number, prefix: string): string {
  if (amount === 0) return `${prefix}0`;
  if (amount >= 0.01) return `${prefix}${amount.toFixed(2)}`;
  return `${prefix}${amount.toPrecision(2)}`;
}

export const formatUsd = (usd: number) => formatMoney(usd, "US$");

export interface FxRate {
  nzdPerUsd: number;
  /** Date the rate applies to (YYYY-MM-DD). */
  date: string;
  /** True when fetched just now; false when using the saved fallback below. */
  live: boolean;
}

// ECB reference rate via frankfurter.dev, used when the live rate can't be fetched.
export const FALLBACK_FX: FxRate = { nzdPerUsd: 1.7885, date: "2026-10-05", live: false };

export const formatNzd = (usd: number, fx: FxRate) => formatMoney(usd * fx.nzdPerUsd, "NZ$");
