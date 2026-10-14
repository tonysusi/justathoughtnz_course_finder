// Support shown alongside the courses, from the clinical lead's answers (Oct 2026). The service lists are as the
// clinical lead gave them; the pregnancy loss services are still to be named by them.

/** The writer describes their own pregnancy loss: support first, then general courses for later. */
export function PregnancyLossSupport() {
  return (
    <section className="card loss-support">
      <h2>Support after losing a pregnancy</h2>
      <p>
        We're sorry for your loss. You don't have to go through this alone. You can free call or text{" "}
        <a href="tel:1737">
          <strong>1737</strong>
        </a>{" "}
        any time to talk with a trained counsellor, or talk to your GP or midwife.
      </p>
    </section>
  );
}

/** The writer says they're under 16: the courses are still offered, with this alongside. */
export function YouthSupport() {
  return (
    <section className="card youth-support">
      <h2>If you're under 16</h2>
      <p>
        Just a Thought is recommended for ages 16 and over. Please feel free to use it, but also reach out to your
        family or whānau, a friend, or your primary health care provider (school nurse or GP), or free call or text{" "}
        <a href="tel:1737">1737</a>.
      </p>
    </section>
  );
}

/** Under every course list, unless the crisis or pregnancy loss box already gives these numbers. */
export function GeneralSupport() {
  return (
    <p className="card general-support">
      A gentle reminder to contact your primary care clinician (GP, nurse) or free call / text{" "}
      <a href="tel:1737">1737</a> any time for more support. In an emergency, call <a href="tel:111">111</a>.
    </p>
  );
}

/** An alcohol and drug course is offered for the person themselves. */
export function AodSupport() {
  return (
    <p className="card aod-support">
      For alcohol and drug support, you can also free call or text <a href="tel:1737">1737</a>, contact your local
      CADS, or talk to your GP.
    </p>
  );
}
