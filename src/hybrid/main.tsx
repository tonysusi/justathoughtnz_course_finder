import { mount } from "../mount";
import StepFlowApp from "../step-flow/StepFlowApp";
import { HYBRID_QUESTIONS } from "./questions";

mount(<StepFlowApp set={HYBRID_QUESTIONS} source="hybrid" navId="hybrid" />);
