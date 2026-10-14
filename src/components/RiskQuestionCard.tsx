import { useEffect, useRef, useState, type FormEvent } from "react";
import { riskQuestion, theirRiskQuestion, type Question } from "../step-flow/engine";

// The step flows' risk questions, worded the same, for Free text: asked before the results when what they wrote is
// flagged for self-harm or mentions low mood, alcohol and drugs or a new baby (clinical lead, Oct 2026), for the
// writer or for someone they're supporting.
export const RISK_QUESTION = riskQuestion(() => true);
export const THEIR_RISK_QUESTION = theirRiskQuestion(() => true);

/** Give it a `key` per question, so the choice resets between them. */
export function RiskQuestionCard({
  question: QUESTION,
  onAnswer,
}: {
  question: Question;
  onAnswer: (answer: string) => void;
}) {
  const [value, setValue] = useState<string | null>(null);
  const legendRef = useRef<HTMLLegendElement>(null);

  // Move focus to the question so screen reader and keyboard users land on it.
  useEffect(() => legendRef.current?.focus(), []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value) onAnswer(value);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <fieldset className="step">
        <legend ref={legendRef} tabIndex={-1} className="question">
          {QUESTION.prompt}
        </legend>
        {QUESTION.hint && <p className="hint">{QUESTION.hint}</p>}
        <div className="choices">
          {(QUESTION.options ?? []).map((o) => (
            <div key={o.id} className="choice-group">
              <label className="choice">
                <input
                  type="radio"
                  name={QUESTION.id}
                  value={o.id}
                  checked={value === o.id}
                  onChange={() => setValue(o.id)}
                />
                <span>{o.label}</span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="form-row">
        <span />
        <button type="submit" disabled={!value}>
          Continue
        </button>
      </div>
    </form>
  );
}
