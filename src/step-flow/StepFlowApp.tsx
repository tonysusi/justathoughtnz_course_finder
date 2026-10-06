import { useEffect, useRef, useState, type FormEvent } from "react";
import type { StepAnswers } from "../types";
import { Page } from "../components/Page";
import { PrivacyNotice } from "../components/PrivacyNotice";
import { MatchOutcome } from "../components/MatchOutcome";
import { CrisisPanel } from "../components/Crisis";
import { SupportingOthers } from "../components/SupportingOthers";
import { useMatch } from "../useMatch";
import { checkTextRisk } from "./riskCheck";
import {
  buildSummary,
  describeAnswers,
  excludedCourses,
  hasOwnConcerns,
  hasTheirConcerns,
  isAnswered,
  typedText,
  supportingSomeoneElse,
  optionsOf,
  riskLevel,
  TEXT_HINT,
  visibleAnswers,
  visibleQuestions,
  type Option,
  type Question,
} from "./engine";
import type { MatchSource, RiskCheckResponse } from "../types";
import type { NavId } from "../components/Nav";

/**
 * The step-by-step flow shared by the Hybrid and Multiple choice options; each passes its own question set.
 */
export default function StepFlowApp({ set, source, navId }: { set: Question[]; source: MatchSource; navId: NavId }) {
  const [answers, setAnswers] = useState<StepAnswers>({});
  const [step, setStep] = useState(0);
  /** Shown after a "Yes" or "not sure" risk answer, before anything else. */
  const [support, setSupport] = useState(false);
  /** Set once "Find courses" is pressed; results show when the matches come back. */
  const [done, setDone] = useState(false);
  /** Their text says the person they're supporting may be at risk: show the services, skip course matching. */
  const [servicesOnly, setServicesOnly] = useState(false);
  // Separate matches: courses for the user, and courses to share with the person they're supporting.
  const own = useMatch();
  const theirs = useMatch();
  const loading = own.loading || theirs.loading;
  const error = own.error ?? theirs.error;
  const legendRef = useRef<HTMLLegendElement>(null);
  const firstRender = useRef(true);

  // Follow-ups only ever come after the question that triggers them, so `step` stays valid as this list changes.
  const questions = visibleQuestions(answers, set);
  const question = questions[step];
  const isLast = step === questions.length - 1;

  // Move focus to the new question so screen reader and keyboard users land on it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    legendRef.current?.focus();
  }, [step, done]);

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  // From visible answers only, so a risk answer given before switching to "Supporting someone else" is ignored.
  const risk = riskLevel(visibleAnswers(answers, set));
  const supporting = supportingSomeoneElse(answers);

  // Typed text JEV flagged for self-harm risk. Shows the crisis panel with the results even if they answer "No".
  const text = typedText(answers, set);
  const textFlagged = !!text && answers.text_risk === "flagged" && answers.text_risk_for === text;
  const [checking, setChecking] = useState(false);
  /** The last text risk check's JEV response, for the local debug column. */
  const [riskCheck, setRiskCheck] = useState<RiskCheckResponse | undefined>();
  const theirRiskFlagged = supporting && answers.their_risk === "flagged" && answers.text_risk_for === text;

  function findCourses(current: StepAnswers = answers) {
    const sent = visibleAnswers(current, set);
    if (
      supportingSomeoneElse(sent) &&
      current.their_risk === "flagged" &&
      current.text_risk_for === typedText(current, set)
    ) {
      setServicesOnly(true);
      return;
    }
    setDone(true);
    if (hasOwnConcerns(sent)) {
      own.submit(buildSummary(sent, "self", set), { source, answers: sent, exclude: excludedCourses(sent) });
    }
    if (hasTheirConcerns(sent)) {
      theirs.submit(buildSummary(sent, "them", set), {
        source,
        answers: sent,
        exclude: excludedCourses(sent, "them"),
        about: "them",
      });
    }
  }

  /** The last step before the risk question's place, where typed text is checked. */
  const beforeRisk = question?.id !== "risk" && questions.slice(step + 1).every((q) => q.id === "risk");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAnswered(question, answers) || loading || checking) return;
    // Support comes first: handled here in the browser, not by JEV.
    if (question.id === "risk" && risk) {
      setSupport(true);
      return;
    }
    if (beforeRisk) {
      // Decide whether to ask the risk question: check typed text with JEV (once per version of the text).
      let current = answers;
      if (text && answers.text_risk_for !== text) {
        setChecking(true);
        const result = await checkTextRisk(text, source);
        setRiskCheck(result.response);
        setChecking(false);
        current = { ...answers, text_risk: result.self, their_risk: result.other, text_risk_for: text };
        setAnswers(current);
      }
      if (visibleQuestions(current, set).some((q) => q.id === "risk")) {
        setStep(step + 1);
      } else {
        findCourses(current);
      }
      return;
    }
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    findCourses();
  }

  function startAgain() {
    setAnswers({});
    setStep(0);
    setSupport(false);
    setDone(false);
    setServicesOnly(false);
    setRiskCheck(undefined);
    own.reset();
    theirs.reset();
  }

  if (servicesOnly) {
    return (
      <Page current={navId} title="Support for them">
        <div className="card form-row">
          <span className="hint">Based on what you've told us.</span>
          <button type="button" className="secondary" onClick={startAgain}>
            Start again
          </button>
        </div>
        {risk && <CrisisPanel variant={risk === "unsure" ? "unsure" : "risk"} />}
        <SupportingOthers urgent />
      </Page>
    );
  }

  if (done && !loading && (own.data || theirs.data)) {
    return (
      <Page current={navId} title={supporting ? "Support for them" : "Courses for you"} wide={import.meta.env.DEV}>
        <div className="card form-row">
          <span className="hint">Based on your answers.</span>
          <button type="button" className="secondary" onClick={startAgain}>
            Start again
          </button>
        </div>
        <MatchOutcome
          error={error}
          data={own.data}
          shareData={theirs.data}
          source={source}
          onStartAgain={startAgain}
          risk={risk ?? (textFlagged ? "yes" : undefined)}
          supportingOthers={supporting}
          debug={{ sent: own.sent, shareSent: theirs.sent, answers: describeAnswers(answers, set), riskCheck }}
        />
        {!own.data && (
          <p className="hint nzsl-line">
            If you'd also like support for yourself, you can{" "}
            <button type="button" className="link-button" onClick={startAgain}>
              start again
            </button>{" "}
            and choose what you'd like help with, or{" "}
            <a href="https://www.justathought.co.nz/courses" target="_blank" rel="noopener noreferrer">
              browse all courses
            </a>
            .
          </p>
        )}
      </Page>
    );
  }

  if (support && risk) {
    return (
      <Page current={navId} title="Support is available">
        <CrisisPanel variant={risk === "unsure" ? "unsure" : "risk"} />
        <div className="card form support-next">
          <p>
            Our courses can help alongside talking to someone. You can look at some now, or come back to them later.
          </p>
          <div className="form-row">
            <button type="button" className="secondary" onClick={() => setSupport(false)} disabled={loading}>
              Back
            </button>
            <button type="button" onClick={() => findCourses()} disabled={loading}>
              {loading ? "Finding courses…" : theirRiskFlagged ? "Continue" : "See courses for later"}
            </button>
          </div>
        </div>
        <MatchOutcome error={error} data={null} source={source} />
      </Page>
    );
  }

  return (
    <Page current={navId} title="Find a course">
      <form className="card form" onSubmit={handleSubmit}>
        {/* Follow-ups depend on the first answer, so the total isn't known until it's given. */}
        <p className="hint" aria-live="polite">
          Step {step + 1}
          {step > 0 && ` of ${questions.length}`}
        </p>
        <div
          className="progress"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={step + 1}
        >
          <span style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>

        <fieldset className="step">
          <legend ref={legendRef} tabIndex={-1} className="question">
            {question.prompt}
          </legend>
          {question.hint && <p className="hint">{question.hint}</p>}
          <QuestionInput
            question={question}
            options={optionsOf(question, answers)}
            answers={answers}
            onChange={setAnswer}
          />
        </fieldset>

        <div className="form-row">
          <button
            type="button"
            className="secondary"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || loading}
          >
            Back
          </button>
          <button type="submit" disabled={!isAnswered(question, answers) || loading || checking}>
            {checking
              ? "Checking…"
              : // Unchecked typed text may still add the risk question, so it's "Next" until checked.
                isLast && (!text || answers.text_risk_for === text)
                ? loading
                  ? "Finding courses…"
                  : "Find courses"
                : "Next"}
          </button>
        </div>
      </form>
      <MatchOutcome error={error} data={null} source={source} />
    </Page>
  );
}

function TextBox({
  id,
  label,
  maxLength,
  value,
  onChange,
  hint,
  autoFocus,
}: {
  id: string;
  label: string;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <>
      <textarea
        id={id}
        aria-label={label}
        rows={4}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-privacy`}
        autoFocus={autoFocus}
      />
      {hint && <p className="hint">{hint}</p>}
      <PrivacyNotice id={`${id}-privacy`} />
      {maxLength && (
        <span className="hint">
          {value.length}/{maxLength}
        </span>
      )}
    </>
  );
}

function QuestionInput({
  question: q,
  options,
  answers,
  onChange,
}: {
  question: Question;
  options: Question["options"] & {};
  answers: StepAnswers;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const value = answers[q.id];
  const textOf = (id: string) => (typeof answers[id] === "string" ? (answers[id] as string) : "");

  if (q.kind === "text") {
    return (
      <TextBox
        id={q.id}
        label={q.prompt}
        maxLength={q.maxLength}
        value={textOf(q.id)}
        onChange={(v) => onChange(q.id, v)}
      />
    );
  }

  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div className="choices">
      {options.map((o, i) => (
        <div key={o.id} className="choice-group">
          {/* Heading for each group of options, e.g. in the "Tell us a bit more" step. */}
          {o.group && o.group !== options[i - 1]?.group && <h3 className="choice-heading">{o.group}</h3>}
          <label className={o.disabled ? "choice disabled" : "choice"}>
            <input
              type={q.kind === "multi" ? "checkbox" : "radio"}
              name={q.id}
              value={o.id}
              disabled={!!o.disabled}
              checked={selected.includes(o.id)}
              onChange={(e) =>
                onChange(q.id, q.kind === "multi" ? toggle(options, selected, o, e.target.checked) : o.id)
              }
            />
            <span>
              {o.label}
              {o.disabled && <span className="hint"> ({o.disabled})</span>}
            </span>
          </label>
          {o.text && selected.includes(o.id) && (
            <div className="choice-text">
              <label htmlFor={o.text.answerId} className="hint">
                {o.text.label}
                {o.text.requiredIfOnly && selected.length === 1 ? " (needed so we can find a course)" : " (optional)"}
              </label>
              <TextBox
                id={o.text.answerId}
                label={o.text.label}
                maxLength={o.text.maxLength}
                value={textOf(o.text.answerId)}
                onChange={(v) => onChange(o.text!.answerId, v)}
                hint={TEXT_HINT.replace(/^Optional\. /, "")}
                autoFocus
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Multi-select change, keeping exclusive options (e.g. "Supporting someone else") on their own. */
function toggle(options: Option[], selected: string[], option: Option, checked: boolean): string[] {
  if (!checked) return selected.filter((id) => id !== option.id);
  if (option.exclusive) return [option.id];
  const exclusive = new Set(options.filter((o) => o.exclusive).map((o) => o.id));
  return [...selected.filter((id) => !exclusive.has(id)), option.id];
}
