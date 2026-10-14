import type { MatchResponse, MatchSource } from "../types";
import { CrisisPanel } from "./Crisis";
import { PregnancyLossSupport, YouthSupport } from "./SupportNotes";
import { AOD_COURSE_IDS } from "../../lib/aodRule";
import { SupportingOthers } from "./SupportingOthers";
import type { RiskLevel } from "../step-flow/engine";
import { Results } from "./Results";
import { DebugColumn } from "./DebugColumn";
import { DEBUG_ENABLED } from "../debugFlag";
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
  othersUrgent = false,
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
  /** Their text suggests the person they're supporting may be at risk: highlight that part of the services panel. */
  othersUrgent?: boolean;
  /** Extra details for the debug column. */
  debug?: {
    sent?: string | null;
    shareSent?: string | null;
    answers?: { prompt: string; answer: string }[];
    riskCheck?: RiskCheckResponse;
  };
}) {
  const hasOutcome = !!data || !!shareData;
  const jevRisk = !!data && data.flags.selfHarm >= data.thresholds.selfHarm;
  // Only after a "Yes" or "not sure" risk answer, even if JEV flagged the text (clinical lead, Oct 2026).
  const showCrisis = hasOutcome && !!risk;
  const topic = (n?: number) => !!data && n !== undefined && n >= (data.thresholds.topic ?? 1);
  const loss = topic(data?.flags.pregnancyLoss);
  const youth = topic(data?.flags.under16);
  // The gentler "not sure" panel only when JEV doesn't also flag risk.
  const variant = risk === "unsure" && !jevRisk ? "unsure" : "risk";
  const showOthers =
    hasOutcome && (supportingOthers || (!!data && data.flags.someoneElse >= data.thresholds.someoneElse));
  // Free text has one list, which may be for them or for the user; Hybrid's supporting path keeps them apart.
  const shareable = shareData ? shareData.results.length > 0 : !!data && showOthers && data.results.length > 0;
  // The collapsed test details panel, below the courses, only when debug is on.
  const showDebug = DEBUG_ENABLED && hasOutcome;

  return (
    <>
      {/* The text couldn't be checked for risk, so the error always carries the banner's support line. */}
      {error && (
        <p className="alert alert-error" role="alert">
          {error} Need to talk? Free call or text <a href="tel:1737">1737</a> any time. In an emergency call{" "}
          <a href="tel:111">111</a>.
        </p>
      )}

      <div className="results-main" aria-live="polite">
          {showCrisis && <CrisisPanel variant={variant} />}
          {loss && <PregnancyLossSupport />}
          {youth && <YouthSupport />}
          {showOthers && <SupportingOthers withCourses={shareable} urgent={othersUrgent} />}
          {shareData && (
            <Results data={shareData} source={source} variant="share" support={{ general: !showCrisis && !loss }} />
          )}
          {data && (
            <Results
              data={data}
              source={source}
              onStartAgain={onStartAgain}
              crisisShown={showCrisis}
              forLater={loss}
              forSomeoneElse={showOthers && !shareData}
              heading={shareData && !showCrisis ? "Courses for you" : undefined}
              support={{
                // Not when the crisis or pregnancy loss box already gives these numbers.
                general: !showCrisis && !loss,
                aod: !showOthers && data.results.some((c) => AOD_COURSE_IDS.includes(c.id)),
              }}
            />
          )}
      </div>

      {/* Below the courses, collapsed: the courses are what stakeholders should see first. */}
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
    </>
  );
}
