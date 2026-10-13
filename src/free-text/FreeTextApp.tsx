import { Page } from "../components/Page";
import { QuestionForm } from "../components/QuestionForm";
import { MatchOutcome } from "../components/MatchOutcome";
import { useMatch } from "../useMatch";

export default function FreeTextApp() {
  const { loading, error, data, sent, submit } = useMatch();
  return (
    <Page current="free-text" title="Find a course">
      <QuestionForm loading={loading} onSubmit={(text) => submit(text, { source: "free-text" })} />
      <MatchOutcome error={error} data={data} source="free-text" debug={{ sent }} />
    </Page>
  );
}
