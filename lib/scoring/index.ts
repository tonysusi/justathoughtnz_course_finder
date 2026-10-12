import { azureScorer } from "./azure.js";
import { jevScorer } from "./jev.js";
import type { Scorer } from "./types.js";

export * from "./types.js";

/**
 * Which scorer drives the results, from AI_PROVIDER:
 * - "jev" (default, also when unset or unknown): JEV only.
 * - "azure": Azure AI Foundry only.
 * - "compare": JEV drives the results and Azure also runs, for the debug view. Doubles the cost: dev and preview only.
 */
export function scorers(): { primary: Scorer; secondary?: Scorer } {
  switch (process.env.AI_PROVIDER) {
    case "azure":
      return { primary: azureScorer };
    case "compare":
      return { primary: jevScorer, secondary: azureScorer };
    default:
      return { primary: jevScorer };
  }
}
