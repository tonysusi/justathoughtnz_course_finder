import type { MatchSource, RiskCheckResponse } from "../types";
import { DEBUG_ENABLED } from "../debugFlag";

/** "unknown" when the check fails; the risk question is then asked anyway, as the safer default. */
export type TextRisk = "flagged" | "clear" | "unknown";

export interface TextRiskResult {
  /** Risk to the person filling it in. */
  self: TextRisk;
  /** Risk to someone they're supporting. "unknown" asks the risk question about them (supporting path only). */
  other: TextRisk;
  /** Low mood, alcohol or drugs or a young baby for someone they're supporting: asks the risk question about them. */
  otherTopic: TextRisk;
  /** The JEV response, for the debug column. Missing if the check failed. */
  response?: RiskCheckResponse;
}

/**
 * Asks JEV whether typed text means the risk question should be asked: self-harm, or a mention of low mood, alcohol
 * and drugs or their own new baby (clinical lead, Oct 2026). Also whether someone they're supporting may be at risk,
 * or has one of those topics. When `supporting`, alcohol and drugs counts for them only, since the text is about them.
 */
export async function checkTextRisk(text: string, source: MatchSource, supporting = false): Promise<TextRiskResult> {
  try {
    const res = await fetch("/api/risk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, ...(DEBUG_ENABLED && { source }) }),
    });
    if (!res.ok) return { self: "unknown", other: "unknown", otherTopic: "unknown" };
    const d = (await res.json()) as RiskCheckResponse;
    const level = (p: number): TextRisk => (p >= d.threshold ? "flagged" : "clear");
    const topic = (p?: number) => p !== undefined && p >= (d.topicThreshold ?? 1);
    const topics = [d.lowMood, supporting ? undefined : d.aod, d.newBaby].some(topic);
    const otherTopic: TextRisk = topic(d.theirTopic) || (supporting && topic(d.aod)) ? "flagged" : "clear";
    return { self: topics ? "flagged" : level(d.selfHarm), other: level(d.otherAtRisk), otherTopic, response: d };
  } catch {
    return { self: "unknown", other: "unknown", otherTopic: "unknown" };
  }
}
