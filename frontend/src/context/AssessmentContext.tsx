"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

import { evaluateProfile } from "@/lib/api";
import { CRITERION_ACTIONS } from "@/lib/roadmapActions";
import type { Profile, RoadmapStep, SchemeResult } from "@/lib/types";

type Status = "idle" | "loading" | "error";

type State = {
  profile: Profile | null;
  result: SchemeResult | null;
  status: Status;
  error: string | null;
};

type Action =
  | { type: "EVALUATE_START" }
  | { type: "EVALUATE_SUCCESS"; profile: Profile; result: SchemeResult }
  | { type: "EVALUATE_ERROR"; error: string }
  | { type: "RESET" };

const initialState: State = { profile: null, result: null, status: "idle", error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "EVALUATE_START":
      return { ...state, status: "loading", error: null };
    case "EVALUATE_SUCCESS":
      return { profile: action.profile, result: action.result, status: "idle", error: null };
    case "EVALUATE_ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

type AssessmentContextValue = {
  state: State;
  submitProfile: (profile: Profile) => Promise<void>;
  markStepDone: (step: RoadmapStep) => Promise<void>;
  reset: () => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const SCHEME_ID = "mission_shakti_grant"; // only scheme verified and loaded so far

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const submitProfile = useCallback(async (profile: Profile) => {
    dispatch({ type: "EVALUATE_START" });
    try {
      const response = await evaluateProfile(profile, [SCHEME_ID]);
      dispatch({ type: "EVALUATE_SUCCESS", profile, result: response.results[0] });
    } catch (err) {
      dispatch({ type: "EVALUATE_ERROR", error: err instanceof Error ? err.message : "Evaluation failed" });
    }
  }, []);

  const markStepDone = useCallback(
    async (step: RoadmapStep) => {
      if (!state.profile || !state.result) return;

      const criterion = state.result.criteria.find((c) => c.rule_text === step.reason);
      const applyAction = criterion && CRITERION_ACTIONS[criterion.id];
      if (!applyAction) return; // time-gated or unmapped steps have no honest "done" action

      const updatedProfile: Profile = { ...state.profile, ...applyAction(state.profile) };
      dispatch({ type: "EVALUATE_START" });
      try {
        const response = await evaluateProfile(updatedProfile, [SCHEME_ID]);
        dispatch({ type: "EVALUATE_SUCCESS", profile: updatedProfile, result: response.results[0] });
      } catch (err) {
        dispatch({ type: "EVALUATE_ERROR", error: err instanceof Error ? err.message : "Evaluation failed" });
      }
    },
    [state.profile, state.result],
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({ state, submitProfile, markStepDone, reset }),
    [state, submitProfile, markStepDone, reset],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
}
