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
        What type of mental health support would you like to learn about?
      </label>
      <textarea
        id="question"
        rows={4}
        maxLength={MAX_CHARS}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="For example: I've been feeling stressed and can't sleep"
        aria-describedby="privacy-notice"
      />
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
