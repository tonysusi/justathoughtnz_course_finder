import { useState } from "react";
import { Page } from "../components/Page";
import { QuestionForm } from "../components/QuestionForm";
import { MatchOutcome } from "../components/MatchOutcome";
import { RISK_QUESTIONS, RiskQuestionCard, THEIR_RISK_QUESTION } from "../components/RiskQuestionCard";
import { riskLevel } from "../step-flow/engine";
import { useMatch } from "../useMatch";
import type { MatchResponse } from "../types";

const at = (p: number | undefined, threshold = 1) => p !== undefined && p >= threshold;
const aboutSomeoneElse = (d: MatchResponse) => d.flags.someoneElse >= d.thresholds.someoneElse;

/** The text says someone they're supporting may be at risk: the services panel is highlighted without asking. */
function theirRiskFlagged(d: MatchResponse): boolean {
  return aboutSomeoneElse(d) && at(d.flags.otherAtRisk, d.thresholds.selfHarm);
}

/** About someone else, with low mood, alcohol and drugs or a young baby for them: ask the risk question about them. */
function asksTheirRiskQuestion(d: MatchResponse): boolean {
  return aboutSomeoneElse(d) && !theirRiskFlagged(d) && at(d.flags.theirTopic, d.thresholds.topic);
}

/**
 * What they wrote is flagged for self-harm, or mentions their own low mood or new baby, or alcohol and drugs (unless
 * the text is about someone else, as that question doesn't say whose use it is).
 */
function asksRiskQuestion(d: MatchResponse): boolean {
  const { flags: f, thresholds: t } = d;
  return (
    f.selfHarm >= t.selfHarm ||
    (!aboutSomeoneElse(d) && at(f.aod, t.aod)) ||
    at(f.lowMood, t.topic) ||
    at(f.newBaby, t.topic)
  );
}

const isRisk = (answer: string | null) => answer === "yes" || answer === "unsure";

export default function FreeTextApp() {
  const { loading, error, data, sent, submit } = useMatch();
  /** The risk questions' answers for the current results; null until answered (or if they aren't asked). */
  const [theirAnswer, setTheirAnswer] = useState<string | null>(null);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, string>>({});
  // Both can be asked: about the person they're supporting first, then the writer's own two questions.
  const askTheirs = !!data && asksTheirRiskQuestion(data) && theirAnswer === null;
  // The second is asked once the first is answered (its showIf).
  const nextRisk = RISK_QUESTIONS.find((q) => !(q.id in riskAnswers) && (q.showIf?.(riskAnswers) ?? true));
  const askRisk = !askTheirs && !!data && asksRiskQuestion(data) ? nextRisk : undefined;

  return (
    <Page current="free-text" title="Find a course">
      <QuestionForm
        loading={loading}
        onSubmit={(text) => {
          setTheirAnswer(null);
          setRiskAnswers({});
          submit(text, { source: "free-text" });
        }}
      />
      {askTheirs ? (
        <RiskQuestionCard key="them" question={THEIR_RISK_QUESTION} onAnswer={setTheirAnswer} />
      ) : askRisk ? (
        <RiskQuestionCard
          key={askRisk.id}
          question={askRisk}
          onAnswer={(answer) => setRiskAnswers((prev) => ({ ...prev, [askRisk.id]: answer }))}
        />
      ) : (
        <MatchOutcome
          error={error}
          data={data}
          source="free-text"
          risk={riskLevel(riskAnswers)}
          othersUrgent={!!data && (theirRiskFlagged(data) || isRisk(theirAnswer))}
          debug={{ sent }}
        />
      )}
    </Page>
  );
}
