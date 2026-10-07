import type { MatchSource, RiskCheckResponse } from "../types";
import { DEBUG_ENABLED } from "../debugFlag";

/** "unknown" when the check fails; the risk question is then asked anyway, as the safer default. */
export type TextRisk = "flagged" | "clear" | "unknown";

export interface TextRiskResult {
  /** Risk to the person filling it in. */
  self: TextRisk;
  /** Risk to someone they're supporting. "unknown" falls back to the normal flow. */
  other: TextRisk;
  /** The JEV response, for the debug column. Missing if the check failed. */
  response?: RiskCheckResponse;
}

/** Asks JEV whether typed text suggests the writer, or someone they're supporting, may be at risk of self-harm. */
export async function checkTextRisk(text: string, source: MatchSource): Promise<TextRiskResult> {
  try {
    const res = await fetch("/api/risk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, ...(DEBUG_ENABLED && { source }) }),
    });
    if (!res.ok) return { self: "unknown", other: "unknown" };
    const d = (await res.json()) as RiskCheckResponse;
    const level = (p: number): TextRisk => (p >= d.threshold ? "flagged" : "clear");
    return { self: level(d.selfHarm), other: level(d.otherAtRisk), response: d };
  } catch {
    return { self: "unknown", other: "unknown" };
  }
}
