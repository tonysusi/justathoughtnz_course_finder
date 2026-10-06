import { Page } from "../components/Page";

export default function HomeApp() {
  return (
    <Page current="home" title="Find a course that could help">
      <p>Three ways to find a Just a Thought course. All use the same AI matching, so we can compare them.</p>
      <div className="option-cards">
        <a className="card option-card" href="/free-text.html">
          <h2>Free text</h2>
          <p>Describe in your own words what you'd like support with, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
        <a className="card option-card" href="/hybrid.html">
          <h2>Hybrid</h2>
          <p>Answer a few short multiple-choice questions, one at a time, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
        <a className="card option-card" href="/multiple-choice.html">
          <h2>Multiple choice</h2>
          <p>Pick from one list of topics, answer any quick follow-ups, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
      </div>
    </Page>
  );
}
