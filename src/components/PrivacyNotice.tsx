export function PrivacyNotice({ id }: { id: string }) {
  return (
    <p id={id} className="hint">
      {/* Only the local dev server logs queries (see dev/queryLog.ts); the deployed site never saves them. */}
      {import.meta.env.DEV
        ? "Test version: your answer and the results are saved to improve matching. Please don't include names or identifying details."
        : "Please don't include names or identifying details. Your answer is sent to an AI service to find courses and isn't saved."}
    </p>
  );
}
