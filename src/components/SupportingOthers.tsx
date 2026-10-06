// Services for people supporting someone else, matched to Just a Thought's "Get help now" page
// (https://www.justathought.co.nz/get-help-now, checked 6 Oct 2026). Keep in sync with that page if it changes.

const GET_HELP_URL = "https://www.justathought.co.nz/get-help-now";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * @param withCourses Courses are listed below, so mention sharing them.
 * @param urgent What they typed suggests the person they're supporting may be at risk: highlight that section.
 */
export function SupportingOthers({ withCourses = false, urgent = false }: { withCourses?: boolean; urgent?: boolean }) {
  return (
    <section className="card supporting-others">
      <h2>Supporting someone else</h2>
      <p>
        If you're worried about or supporting someone else, these services can help you and them.
        {withCourses && " You could also share any of our courses below with the person you're supporting."}
      </p>

      <div className={urgent ? "at-risk urgent" : "at-risk"} role={urgent ? "alert" : undefined}>
        <h3>If they're at risk right now</h3>
        <ul>
          <li>
            If someone you know is talking about suicide, is unsafe or in an emergency, call <a href="tel:111">111</a>{" "}
            now.
          </li>
          <li>
            <a href="https://www.leva.co.nz/our-work/suicide-prevention/in-a-crisis/" {...ext}>
              Supporting someone at immediate risk of suicide
            </a>
          </li>
          <li>
            <a href="https://www.leva.co.nz/resources/help-give-hope/" {...ext}>
              Help give hope
            </a>
            : warning signs of suicide and how to help someone at risk
          </li>
        </ul>
      </div>

      <h3>Talk to someone</h3>
      <ul>
        <li>
          <strong>1737</strong>: free call or text <a href="tel:1737">1737</a> to talk to a trained counsellor, any
          time.
        </li>
        <li>
          <strong>Youthline</strong>: <a href="tel:0800376633">0800 376 633</a> or free text 234.
        </li>
      </ul>

      <h3>If it's about alcohol or drugs</h3>
      <ul>
        <li>
          <strong>Alcohol Drug Helpline</strong>: <a href="tel:0800787797">0800 787 797</a> or text 8681.
        </li>
        <li>
          Whānau support for people living with or close to someone struggling with substance use:{" "}
          <a href="https://al-anon.org.nz/" {...ext}>
            Al-Anon
          </a>
          ,{" "}
          <a href="https://al-anon.org.nz/alateen/" {...ext}>
            Alateen
          </a>{" "}
          and{" "}
          <a href="https://www.kina.org.nz/" {...ext}>
            Kina Families and Addictions Trust
          </a>
          .
        </li>
      </ul>

      <p className="hint">
        See all helplines and services on Just a Thought's{" "}
        <a href={GET_HELP_URL} {...ext}>
          Get help now
        </a>{" "}
        page. Just a Thought isn't a monitored service and can't provide crisis intervention.
      </p>
    </section>
  );
}
