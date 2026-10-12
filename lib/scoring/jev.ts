import { TypeSafeClient, noul, type Questions } from "@typesafe-ai/sdk";
import type { Scorer, ScoringQuestions } from "./types.js";

const MODEL = "jev-latest";

let client: TypeSafeClient | undefined;

function getClient(): TypeSafeClient {
  // logLevel is pinned so "debug" (which logs request bodies) can't be switched on by env.
  client ??= new TypeSafeClient({ logLevel: "error", timeout: 15000 });
  return client;
}

/** JEV (TypeSafe): scores every question in one systemOne call. Reads TYPESAFE_API_KEY. */
export const jevScorer: Scorer = {
  provider: "jev",
  async score(state: string, questions: ScoringQuestions) {
    const jevQuestions: Questions = Object.fromEntries(
      Object.entries(questions).map(([key, q]) => [key, noul(q.question, { true: q.true, false: q.false })]),
    );
    const request = { state, model: MODEL, questions: jevQuestions };
    const response = await getClient().systemOne(request);
    const probs: Record<string, number> = {};
    for (const [key, a] of Object.entries(response.answers)) {
      if (a && a.type === "noul") probs[key] = a.noul;
    }
    return {
      provider: "jev",
      probs,
      model: response.model,
      usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
      request,
      response,
    };
  },
};
