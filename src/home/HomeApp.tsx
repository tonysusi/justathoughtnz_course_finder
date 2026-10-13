import { Page } from "../components/Page";

type Option = "free" | "hybrid" | "mc";
type Points = { pros: string[]; cons: string[] };

const OPTIONS: { id: Option; name: string }[] = [
  { id: "free", name: "Free text" },
  { id: "mc", name: "Multiple choice" },
  { id: "hybrid", name: "Hybrid" },
];

// For stakeholders: plain language. Based on the project team's internal review and synthetic tests (Oct 2026),
// not user testing. Costs use the current AI service's price (src/debug/pricing.ts) and token counts from test runs.
const COMPARISON: { angle: string; points: Record<Option, Points> }[] = [
  {
    angle: "Ease of use",
    points: {
      free: {
        pros: ["People describe their situation in their own words, including things that don't fit a list."],
        cons: [
          "A blank box is harder for people who are distressed, find reading or writing hard, or use NZ Sign Language.",
          "Results depend on how people word things.",
        ],
      },
      hybrid: {
        pros: ["Guided tick boxes, with room to add their own words."],
        cons: ["The longest flow. The 'Tell us a bit more' step can be a long list on a phone."],
      },
      mc: {
        pros: ["The least reading on each screen: one short question at a time."],
        cons: ["Nowhere to add their own words, so people whose situation doesn't fit a box can't say so."],
      },
    },
  },
  {
    angle: "Safety",
    points: {
      free: {
        pros: ["The AI checks what people write for signs of self-harm and shows crisis support."],
        cons: [
          "Never asks directly about risk.",
          "If the AI service is down, only the 1737 and 111 support line is shown.",
        ],
      },
      hybrid: {
        pros: [
          "Asks a direct risk question when answers or typed text suggest risk.",
          "Still asks if the AI check fails.",
        ],
        cons: ["People who tick other topics and type nothing are never asked."],
      },
      mc: {
        pros: ["Asks the risk question for low mood or alcohol and drug use, without relying on AI."],
        cons: ["People who choose only other topics are never asked, and there's no typed text to check."],
      },
    },
  },
  {
    angle: "Privacy and AI",
    points: {
      free: {
        pros: [],
        cons: ["Everything typed goes to an external AI service: the most health information of the three."],
      },
      hybrid: {
        pros: ["Less is typed than Free text."],
        cons: ["A summary of the answers, plus anything typed, goes to the AI service."],
      },
      mc: {
        pros: ["Nothing leaves the person's browser. No AI service is used, and answers aren't saved."],
        cons: [],
      },
    },
  },
  {
    angle: "Matching quality",
    points: {
      free: {
        pros: [
          "Picks up details from what people write, such as a pregnancy or a new baby. These all matched in our tests.",
        ],
        cons: ["Some messages get no courses at all, for example someone worried about a family member."],
      },
      hybrid: {
        pros: [
          "Uses both the tick boxes and typed text.",
          "Fixed rules make sure the right pregnancy, baby, panic and alcohol and drug courses are offered.",
        ],
        cons: ["Still relies on the AI to rank courses. General courses are sometimes listed above the specific one."],
      },
      mc: {
        pros: ["Predictable: the same answers always give the same courses, so it's easy to check."],
        cons: [
          "Can't pick up anything the boxes don't cover.",
          "'I'm not sure' can list up to six courses.",
        ],
      },
    },
  },
  {
    angle: "Price",
    points: {
      free: {
        pros: ["About NZ$0.0002 per search on the current AI service (JEV): one AI request."],
        cons: ["Ongoing AI service costs and approvals."],
      },
      hybrid: {
        pros: ["About NZ$0.0002 per search on the current AI service (JEV): one or two AI requests."],
        cons: ["The same ongoing AI costs and approvals as Free text."],
      },
      mc: {
        pros: ["No AI cost, and no AI approval needed."],
        cons: ["When courses change, someone has to update the matching rules by hand."],
      },
    },
  },
];

function Cell({ points }: { points: Points }) {
  return (
    <>
      {points.pros.length > 0 && (
        <ul className="pros">
          {points.pros.map((p) => (
            <li key={p}>
              <span className="visually-hidden">Pro: </span>
              {p}
            </li>
          ))}
        </ul>
      )}
      {points.cons.length > 0 && (
        <ul className="cons">
          {points.cons.map((c) => (
            <li key={c}>
              <span className="visually-hidden">Con: </span>
              {c}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function HomeApp() {
  return (
    <Page current="home" title="Find a course that could help">
      <p>
        Three ways to find a Just a Thought course, so we can compare them. Free text uses AI to match courses,
        Multiple choice uses fixed rules with no AI, and Hybrid combines tick boxes with AI.
      </p>
      <div className="option-cards">
        <a className="card option-card" href="/free-text.html">
          <h2>Free text</h2>
          <p>Describe in your own words what you'd like support with, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
        <a className="card option-card" href="/multiple-choice.html">
          <h2>Multiple choice</h2>
          <p>Pick from one list of topics, answer any quick follow-ups, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
        <a className="card option-card" href="/hybrid.html">
          <h2>Hybrid</h2>
          <p>Tick a few short questions, one at a time, add your own words if you like, and get matching courses.</p>
          <span className="option-cta">Start →</span>
        </a>
      </div>

      <section className="comparison" aria-labelledby="comparison-heading">
        <div className="comparison-head">
          <h2 id="comparison-heading">Pros and cons</h2>
          <p className="hint comparison-key">
            <span className="key-pro">✓ pro</span> <span className="key-con">✗ con</span>
          </p>
        </div>
        <p className="hint">
          From the project team's internal review and test messages, not testing with users. Draft for discussion; the
          safety points need clinical review.
        </p>
        <table className="comparison-table">
          <thead>
            <tr>
              {OPTIONS.map((o) => (
                <th key={o.id} scope="col">
                  {o.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.angle}>
                {OPTIONS.map((o) => (
                  <td key={o.id} data-label={o.name}>
                    {/* The area sits in each cell, under the option heading, rather than in its own column. */}
                    <p className="comparison-area">{row.angle}</p>
                    <Cell points={row.points[o.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Page>
  );
}
