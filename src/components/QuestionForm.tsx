import { useState, type FormEvent } from "react";
import { PrivacyNotice } from "./PrivacyNotice";

const MAX_CHARS = 1000;

export function QuestionForm({ loading, onSubmit }: { loading: boolean; onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (text.trim() && !loading) onSubmit(text);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label htmlFor="question" className="question">
        What would you like help with?
      </label>
      <textarea
        id="question"
        rows={4}
        maxLength={MAX_CHARS}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="For example: I've been feeling stressed and can't sleep"
        aria-describedby="question-hint privacy-notice"
      />
      <p id="question-hint" className="hint">
        You can mention anything that's going on, like a new baby, work or relationships.
      </p>
      <PrivacyNotice id="privacy-notice" />
      <div className="form-row">
        <span className="hint">
          {text.length}/{MAX_CHARS}
        </span>
        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? "Finding courses…" : "Find courses"}
        </button>
      </div>
    </form>
  );
}
