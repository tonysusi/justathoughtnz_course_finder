import type { MatchResponse, MatchSource, ScoredCourse } from "../types";
import { COURSES } from "../data/courses";
import { withMoodCourse } from "../../lib/moodRule";

const ALL_COURSES_URL = "https://www.justathought.co.nz/courses";
const NZSL_COURSES = COURSES.filter((c) => c.nzslVersionOf);
/** Closest courses offered for later when the crisis panel shows but none clear the match threshold. */
const CRISIS_FALLBACK_COUNT = 3;

/** Hybrid and Multiple choice users can't "describe more", so they get Start again instead. */
function NextSteps({ source, onStartAgain }: { source: MatchSource; onStartAgain?: () => void }) {
  return (
    <>
      {source !== "free-text" && onStartAgain && (
        <>
          You can{" "}
          <button type="button" className="link-button" onClick={onStartAgain}>
            start again
          </button>{" "}
          or{" "}
        </>
      )}
      {source === "free-text" && "Try describing it in a different way, or "}
      <a href={ALL_COURSES_URL} target="_blank" rel="noopener noreferrer">
        browse all courses
      </a>
      .
    </>
  );
}

export function Results({
  data,
  source,
  onStartAgain,
  crisisShown = false,
  forSomeoneElse = false,
  variant = "default",
  heading,
}: {
  data: MatchResponse;
  source: MatchSource;
  onStartAgain?: () => void;
  /** When the crisis panel is showing, courses are offered as "for later". */
  crisisShown?: boolean;
  /** When the "supporting someone else" panel is showing, courses are offered to share or to do themselves. */
  forSomeoneElse?: boolean;
  /** "share": courses matched for the person they're supporting, to pass on to them. */
  variant?: "default" | "share";
  heading?: string;
}) {
  if (variant === "share") {
    if (data.results.length === 0) {
      return (
        <p className="alert">
          We couldn't find a course that clearly fits what they're dealing with. The services above can help.
        </p>
      );
    }
    return (
      <CourseList
        data={data}
        heading="Courses to share with them"
        note="You could send them a link to any of these. They're online courses."
      />
    );
  }

  // Someone shown the crisis panel always gets courses for later: the matches, or failing that the closest few,
  // plus a low-mood course. Checked before off-topic, so a message only about self-harm still offers courses.
  if (crisisShown) {
    const matched = data.results.length > 0;
    return (
      <CourseList
        data={data}
        courses={withMoodCourse(matched ? data.results : data.all.slice(0, CRISIS_FALLBACK_COUNT), data.all)}
        heading={heading ?? "Courses for later"}
        note={
          forSomeoneElse
            ? "You could share these with the person you're supporting, or do them yourself. They're online courses."
            : matched
              ? undefined
              : "When you feel ready, these online courses might help."
        }
        browseAll={!matched}
      />
    );
  }

  // Off-topic only applies to free text; a Hybrid or Multiple choice "Something else" gets the not-covered message below.
  if (source === "free-text" && data.flags.offTopic >= data.thresholds.offTopic) {
    return (
      <p className="alert">
        That doesn't look like something our courses cover. Our courses help with things like stress, sleep, worry, low
        mood and alcohol use. <NextSteps source={source} onStartAgain={onStartAgain} />
      </p>
    );
  }

  if (data.results.length === 0) {
    if (forSomeoneElse) return null;
    return (
      <p className="alert">
        We couldn't find a course that clearly fits. You could talk to your GP, or free call or text{" "}
        <a href="tel:1737">1737</a> to talk with a trained counsellor.{" "}
        <NextSteps source={source} onStartAgain={onStartAgain} />
      </p>
    );
  }

  return (
    <CourseList
      data={data}
      heading={heading ?? "Courses that might help"}
      note={
        forSomeoneElse
          ? "You could share these with the person you're supporting, or do them yourself. They're online courses."
          : undefined
      }
    />
  );
}

function CourseList({
  data,
  courses = data.results,
  heading,
  note,
  browseAll = false,
}: {
  data: MatchResponse;
  courses?: ScoredCourse[];
  heading: string;
  note?: string;
  /** Adds a "browse all courses" link under the list. */
  browseAll?: boolean;
}) {
  return (
    <section>
      <h2>{heading}</h2>
      {note && <p className="hint">{note}</p>}
      <ol className="results">
        {courses.map((c) => (
          <li key={c.id} className="card course">
            <h3>
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.name}
              </a>
            </h3>
            {c.prerequisite && <p className="note">Follow-on course to {c.prerequisite}.</p>}
            <p>{c.description}</p>
            {c.nzslVersion && (
              <p className="alt">
                <span className="badge">NZSL</span>{" "}
                <a href={c.nzslVersion.url} target="_blank" rel="noopener noreferrer">
                  Also available in NZ Sign Language
                </a>
              </p>
            )}
          </li>
        ))}
      </ol>
      {browseAll && (
        <p className="hint">
          <a href={ALL_COURSES_URL} target="_blank" rel="noopener noreferrer">
            Browse all courses
          </a>
        </p>
      )}
      <p className="hint nzsl-line">
        <span className="badge">NZSL</span> NZ Sign Language versions:{" "}
        {NZSL_COURSES.map((c, i) => (
          <span key={c.id}>
            {i > 0 && " · "}
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              {c.name.replace(" (NZ Sign Language)", "")}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}
