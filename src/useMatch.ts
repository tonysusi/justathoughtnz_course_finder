import { useState } from "react";
import type { MatchAbout, MatchError, MatchResponse, MatchSource, StepAnswers } from "./types";

interface SubmitOptions {
  source: MatchSource;
  answers?: StepAnswers;
  /** Course ids ruled out by the Hybrid or Multiple choice rules. */
  exclude?: string[];
  /** Who the text describes: the user, or the person they're supporting. */
  about?: MatchAbout;
}

/** Sends text to /api/match. `source`, `answers` and `about` are only kept by the local debug log. */
export function useMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchResponse | null>(null);
  /** The text last sent to JEV, for the local debug column. */
  const [sent, setSent] = useState<string | null>(null);

  async function submit(text: string, { source, answers, exclude, about }: SubmitOptions) {
    setLoading(true);
    setError(null);
    setData(null);
    setSent(text);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Answers are only for the local debug log, so they aren't sent from the deployed site.
        body: JSON.stringify({ text, exclude, ...(import.meta.env.DEV && { source, answers, about }) }),
      });
      const body = (await res.json()) as MatchResponse | MatchError;
      if (!res.ok || "error" in body) {
        setError("error" in body ? body.error : "Something went wrong. Please try again.");
      } else {
        setData(body);
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setError(null);
    setData(null);
    setSent(null);
  }

  return { loading, error, data, sent, submit, reset };
}
