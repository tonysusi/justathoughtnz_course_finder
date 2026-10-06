import { mount } from "../mount";
import StepFlowApp from "../step-flow/StepFlowApp";
import { MULTIPLE_CHOICE_QUESTIONS } from "./questions";

mount(<StepFlowApp set={MULTIPLE_CHOICE_QUESTIONS} source="multiple-choice" navId="multiple-choice" />);
