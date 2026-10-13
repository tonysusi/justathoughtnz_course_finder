import { mount } from "../mount";
import StepFlowApp from "../step-flow/StepFlowApp";
import { MULTIPLE_CHOICE_QUESTIONS } from "./questions";
import { matchByRules } from "./rules";

mount(<StepFlowApp
    set={MULTIPLE_CHOICE_QUESTIONS}
    source="multiple-choice"
    navId="multiple-choice"
    matchLocally={matchByRules}
  />);
