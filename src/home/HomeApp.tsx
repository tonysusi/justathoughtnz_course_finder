import { Page } from "../components/Page";

// Free text and Hybrid are hidden from the UI (Nov 2026), along with the pros and cons comparison; both are in git
// history (before this change) and the pages are still built, so they can be brought back.
export default function HomeApp() {
  return (
    <Page current="home" title="Find a course that could help">
      <p>Answer a few short questions to find Just a Thought courses that could help. No AI is used.</p>
      <div className="option-cards">
        <a className="card option-card" href="/multiple-choice.html">
          <h2>Find a course</h2>
          <p>Pick what you'd like help with, answer any quick follow-ups, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
      </div>
    </Page>
  );
}
