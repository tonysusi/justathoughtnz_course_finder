import type { MatchResponse, MatchSource } from "../types";
import { CrisisPanel } from "./Crisis";
import { SupportingOthers } from "./SupportingOthers";
import type { RiskLevel } from "../step-flow/engine";
import { Results } from "./Results";
import { DebugColumn } from "./DebugColumn";
import type { RiskCheckResponse } from "../types";

/**
 * Error, crisis panel, "supporting someone else" panel, results and score panels; shared by both options.
 * Order: crisis → supporting someone else → courses to share with them → courses for you.
 */
export function MatchOutcome({
  error,
  data,
  shareData = null,
  source,
  onStartAgain,
  risk,
  supportingOthers = false,
  debug,
}: {
  error: string | null;
  /** Courses for the user. */
  data: MatchResponse | null;
  /** Hybrid's supporting path only: courses for the person they're supporting, to share with them. */
  shareData?: MatchResponse | null;
  source: MatchSource;
  onStartAgain?: () => void;
  /** The Hybrid or Multiple choice risk answer. Shows support whatever JEV scored. */
  risk?: RiskLevel;
  /** Hybrid's "Supporting someone else" answer. */
  supportingOthers?: boolean;
  /** Extra details for the local debug column. */
  debug?: {
    sent?: string | null;
    shareSent?: string | null;
    answers?: { prompt: string; answer: string }[];
    riskCheck?: RiskCheckResponse;
  };
}) {
  const hasOutcome = !!data || !!shareData;
  const jevRisk = !!data && data.flags.selfHarm >= data.thresholds.selfHarm;
  const showCrisis = hasOutcome && (!!risk || jevRisk);
  // The gentler "not sure" panel only when JEV doesn't also flag risk.
  const variant = risk === "unsure" && !jevRisk ? "unsure" : "risk";
  const showOthers =
    hasOutcome && (supportingOthers || (!!data && data.flags.someoneElse >= data.thresholds.someoneElse));
  // Free text has one list, which may be for them or for the user; Hybrid's supporting path keeps them apart.
  const shareable = shareData ? shareData.results.length > 0 : !!data && showOthers && data.results.length > 0;
  // Two columns (courses | debug) only on the local dev server; deployed pages show the courses alone.
  const showDebug = import.meta.env.DEV && hasOutcome;

  return (
    <>
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      <div className={showDebug ? "results-layout" : undefined}>
        <div className="results-main" aria-live="polite">
          {showCrisis && <CrisisPanel variant={variant} />}
          {showOthers && <SupportingOthers withCourses={shareable} />}
          {shareData && <Results data={shareData} source={source} variant="share" />}
          {data && (
            <Results
              data={data}
              source={source}
              onStartAgain={onStartAgain}
              crisisShown={showCrisis}
              forSomeoneElse={showOthers && !shareData}
              heading={shareData && !showCrisis ? "Courses for you" : undefined}
            />
          )}
        </div>

        {showDebug && (
          <DebugColumn
            matches={[
              ...(shareData ? [{ label: "the person they support", data: shareData, sent: debug?.shareSent }] : []),
              ...(data ? [{ label: shareData ? "you" : undefined, data, sent: debug?.sent }] : []),
            ]}
            answers={debug?.answers}
            riskCheck={debug?.riskCheck}
          />
        )}
      </div>
    </>
  );
}
