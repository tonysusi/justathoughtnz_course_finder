// Wording to be confirmed by a clinical/safety lead before use beyond the internal team.

export function CrisisBanner() {
  return (
    <div className="crisis-banner" role="note">
      Need to talk? Free call or text <a href="tel:1737">1737</a> any time. In an emergency call{" "}
      <a href="tel:111">111</a>.
    </div>
  );
}

export function CrisisPanel({ variant = "risk" }: { variant?: "risk" | "unsure" }) {
  if (variant === "unsure") {
    return (
      <section className="card crisis-panel" role="alert">
        <h2>It's okay not to be sure</h2>
        <p>
          If things feel hard right now, talking to someone can help. You can free call or text{" "}
          <a href="tel:1737">
            <strong>1737</strong>
          </a>{" "}
          any time to talk with a trained counsellor.
        </p>
        <p>
          If you or someone else is in immediate danger, call{" "}
          <a href="tel:111">
            <strong>111</strong>
          </a>
          .
        </p>
      </section>
    );
  }
  return (
    <section className="card crisis-panel" role="alert">
      <h2>You don't have to go through this alone</h2>
      <p>
        If you're thinking about harming yourself, please talk to someone now. You can free call or text{" "}
        <a href="tel:1737">
          <strong>1737</strong>
        </a>{" "}
        any time to talk with a trained counsellor.
      </p>
      <p>
        If you or someone else is in immediate danger, call{" "}
        <a href="tel:111">
          <strong>111</strong>
        </a>
        .
      </p>
    </section>
  );
}
