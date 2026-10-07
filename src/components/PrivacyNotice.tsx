import { DEBUG_ENABLED } from "../debugFlag";
export function PrivacyNotice({ id }: { id: string }) {
  return (
    <p id={id} className="hint">
      {/* Queries are saved when debug is on: locally, and on deployments built with VITE_DEBUG (see lib/debugLog). */}
      {DEBUG_ENABLED
        ? "Test version: your answer and the results are saved to improve matching. Please don't include names or identifying details."
        : "Please don't include names or identifying details. Your answer is sent to an AI service to find courses and isn't saved."}
    </p>
  );
}
