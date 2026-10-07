import { Page } from "../components/Page";
import { QuestionForm } from "../components/QuestionForm";
import { MatchOutcome } from "../components/MatchOutcome";
import { useMatch } from "../useMatch";
import { DEBUG_ENABLED } from "../debugFlag";

export default function FreeTextApp() {
  const { loading, error, data, sent, submit } = useMatch();
  return (
    // Wider when the debug column shows beside the results.
    <Page current="free-text" title="Find a course" wide={DEBUG_ENABLED && !!data}>
      <QuestionForm loading={loading} onSubmit={(text) => submit(text, { source: "free-text" })} />
      <MatchOutcome error={error} data={data} source="free-text" debug={{ sent }} />
    </Page>
  );
}
