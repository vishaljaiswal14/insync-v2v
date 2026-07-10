"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import { evaluateProfile, getSchemes } from "@/lib/api";
import { CRITERION_ACTIONS } from "@/lib/roadmapActions";
import type { Profile, RoadmapStep, SchemeResult } from "@/lib/types";

type Status = "idle" | "loading" | "error";

type State = {
  hydrated: boolean;
  profile: Profile | null;
  result: SchemeResult | null;
  resultFetchedAt: string | null;
  simulatedMetIds: string[];
  verifiedDocuments: string[];
  // Discovered from the backend, not hardcoded — /schemes is the single
  // source of truth for which scheme(s) exist. Empty until the fetch below
  // resolves; submitProfile/markStepDone fall back to FALLBACK_SCHEME_ID if
  // it's still empty when they're called, so the app never breaks waiting
  // on this request.
  schemeIds: string[];
  status: Status;
  error: string | null;
  ledgerOpen: boolean;
  ledgerFocusIds: string[] | null;
};

type Action =
  | {
      type: "HYDRATE";
      profile: Profile | null;
      result: SchemeResult | null;
      resultFetchedAt: string | null;
      simulatedMetIds: string[];
      verifiedDocuments: string[];
    }
  | { type: "SCHEMES_LOADED"; schemeIds: string[] }
  | { type: "EVALUATE_START" }
  | { type: "EVALUATE_SUCCESS"; profile: Profile; result: SchemeResult }
  | { type: "EVALUATE_ERROR"; error: string }
  | { type: "SIMULATE_TOGGLE"; id: string }
  | { type: "SIMULATE_RESET" }
  | { type: "VERIFY_DOCUMENT"; documentId: string }
  | { type: "LEDGER_OPEN"; focusIds: string[] | null }
  | { type: "LEDGER_CLOSE" }
  | { type: "RESET" };

const initialState: State = {
  hydrated: false,
  profile: null,
  result: null,
  resultFetchedAt: null,
  simulatedMetIds: [],
  verifiedDocuments: [],
  schemeIds: [],
  status: "idle",
  error: null,
  ledgerOpen: false,
  ledgerFocusIds: null,
};

// Session-scoped only — cleared when the tab closes, never sent anywhere.
// This is what lets a refresh on Results/Roadmap/Proposal survive without
// bouncing back to the intake form; it doesn't change the "nothing is saved
// to a server" claim the product makes elsewhere.
const STORAGE_KEY = "shaktiscale.assessment.v1";

// Defensive fallback only — used if the /schemes fetch hasn't resolved yet
// (or fails) at the moment a profile is submitted. Not a design assumption
// that only one scheme will ever exist; see the `schemeIds` fetch below.
const FALLBACK_SCHEME_ID = "mission_shakti_grant";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        hydrated: true,
        profile: action.profile,
        result: action.result,
        resultFetchedAt: action.resultFetchedAt,
        simulatedMetIds: action.simulatedMetIds,
        verifiedDocuments: action.verifiedDocuments,
      };
    case "SCHEMES_LOADED":
      return { ...state, schemeIds: action.schemeIds };
    case "EVALUATE_START":
      return { ...state, status: "loading", error: null };
    case "EVALUATE_SUCCESS":
      // A fresh, real evaluation is always the new ground truth — any prior
      // what-if hypothesis is cleared rather than carried forward stale.
      return {
        ...state,
        profile: action.profile,
        result: action.result,
        resultFetchedAt: new Date().toISOString(),
        simulatedMetIds: [],
        status: "idle",
        error: null,
      };
    case "EVALUATE_ERROR":
      return { ...state, status: "error", error: action.error };
    case "SIMULATE_TOGGLE":
      return {
        ...state,
        simulatedMetIds: state.simulatedMetIds.includes(action.id)
          ? state.simulatedMetIds.filter((id) => id !== action.id)
          : [...state.simulatedMetIds, action.id],
      };
    case "SIMULATE_RESET":
      return { ...state, simulatedMetIds: [] };
    case "VERIFY_DOCUMENT":
      return {
        ...state,
        verifiedDocuments: state.verifiedDocuments.includes(action.documentId)
          ? state.verifiedDocuments
          : [...state.verifiedDocuments, action.documentId],
      };
    case "LEDGER_OPEN":
      return { ...state, ledgerOpen: true, ledgerFocusIds: action.focusIds };
    case "LEDGER_CLOSE":
      return { ...state, ledgerOpen: false, ledgerFocusIds: null };
    case "RESET":
      // schemeIds is a discovered backend fact, not session data — no
      // reason to lose it on reset (and the discovery effect only runs
      // once, on mount, so it wouldn't be re-fetched otherwise).
      return { ...initialState, hydrated: true, schemeIds: state.schemeIds };
    default:
      return state;
  }
}

type AssessmentContextValue = {
  state: State;
  submitProfile: (profile: Profile) => Promise<void>;
  markStepDone: (step: RoadmapStep) => Promise<void>;
  toggleSimulate: (id: string) => void;
  resetSimulate: () => void;
  verifyDocument: (documentId: string) => void;
  openLedger: (focusIds?: string[] | null) => void;
  closeLedger: () => void;
  reset: () => void;
};

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once on mount, client-side only. Deliberately a useEffect (not a
  // lazy reducer initializer) so the server-rendered and first client render
  // match — pages gate their redirect-on-missing-result guard on
  // `state.hydrated` so they never bounce to /assess before this resolves.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({
          type: "HYDRATE",
          profile: parsed.profile ?? null,
          result: parsed.result ?? null,
          resultFetchedAt: parsed.resultFetchedAt ?? null,
          simulatedMetIds: Array.isArray(parsed.simulatedMetIds) ? parsed.simulatedMetIds : [],
          verifiedDocuments: Array.isArray(parsed.verifiedDocuments) ? parsed.verifiedDocuments : [],
        });
        return;
      }
    } catch {
      // Corrupted or unavailable storage — start clean rather than throwing.
    }
    dispatch({
      type: "HYDRATE",
      profile: null,
      result: null,
      resultFetchedAt: null,
      simulatedMetIds: [],
      verifiedDocuments: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Discover available schemes from the backend once, on mount — the
  // frontend no longer hardcodes which scheme id(s) exist. If this fails or
  // hasn't resolved yet, submitProfile/markStepDone fall back to
  // FALLBACK_SCHEME_ID so the app still works.
  useEffect(() => {
    getSchemes()
      .then((schemes) => dispatch({ type: "SCHEMES_LOADED", schemeIds: schemes.map((s) => s.scheme_id) }))
      .catch(() => {
        // Leave schemeIds empty — callers fall back to FALLBACK_SCHEME_ID.
      });
  }, []);

  useEffect(() => {
    if (!state.hydrated || typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile: state.profile,
          result: state.result,
          resultFetchedAt: state.resultFetchedAt,
          simulatedMetIds: state.simulatedMetIds,
          verifiedDocuments: state.verifiedDocuments,
        }),
      );
    } catch {
      // Storage full or unavailable — persistence degrades silently;
      // evaluation itself is unaffected.
    }
  }, [
    state.hydrated,
    state.profile,
    state.result,
    state.resultFetchedAt,
    state.simulatedMetIds,
    state.verifiedDocuments,
  ]);

  // Resolves which scheme id(s) to evaluate against: the backend-discovered
  // list if it's arrived, otherwise the defensive fallback. Still only ever
  // displays `results[0]` — supporting multiple *simultaneous* scheme
  // results in the UI (a scheme selector across Results/Roadmap/Proposal)
  // is a larger feature than removing this hardcoded assumption, and isn't
  // implemented here.
  const resolveSchemeIds = useCallback(
    (currentSchemeIds: string[]) => (currentSchemeIds.length > 0 ? currentSchemeIds : [FALLBACK_SCHEME_ID]),
    [],
  );

  const submitProfile = useCallback(
    async (profile: Profile) => {
      dispatch({ type: "EVALUATE_START" });
      try {
        const response = await evaluateProfile(profile, resolveSchemeIds(state.schemeIds));
        dispatch({ type: "EVALUATE_SUCCESS", profile, result: response.results[0] });
      } catch (err) {
        dispatch({ type: "EVALUATE_ERROR", error: err instanceof Error ? err.message : "Evaluation failed" });
      }
    },
    [state.schemeIds, resolveSchemeIds],
  );

  const markStepDone = useCallback(
    async (step: RoadmapStep) => {
      if (!state.profile || !state.result) return;

      const criterion = state.result.criteria.find((c) => c.rule_text === step.reason);
      const applyAction = criterion && CRITERION_ACTIONS[criterion.id];
      if (!applyAction) return; // time-gated or unmapped steps have no honest "done" action

      const updatedProfile: Profile = { ...state.profile, ...applyAction(state.profile) };
      dispatch({ type: "EVALUATE_START" });
      try {
        const response = await evaluateProfile(updatedProfile, resolveSchemeIds(state.schemeIds));
        dispatch({ type: "EVALUATE_SUCCESS", profile: updatedProfile, result: response.results[0] });
      } catch (err) {
        dispatch({ type: "EVALUATE_ERROR", error: err instanceof Error ? err.message : "Evaluation failed" });
      }
    },
    [state.profile, state.result, state.schemeIds, resolveSchemeIds],
  );

  const toggleSimulate = useCallback((id: string) => dispatch({ type: "SIMULATE_TOGGLE", id }), []);
  const resetSimulate = useCallback(() => dispatch({ type: "SIMULATE_RESET" }), []);
  const verifyDocument = useCallback((documentId: string) => dispatch({ type: "VERIFY_DOCUMENT", documentId }), []);
  const openLedger = useCallback(
    (focusIds: string[] | null = null) => dispatch({ type: "LEDGER_OPEN", focusIds }),
    [],
  );
  const closeLedger = useCallback(() => dispatch({ type: "LEDGER_CLOSE" }), []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to do if storage is unavailable.
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      state,
      submitProfile,
      markStepDone,
      toggleSimulate,
      resetSimulate,
      verifyDocument,
      openLedger,
      closeLedger,
      reset,
    }),
    [
      state,
      submitProfile,
      markStepDone,
      toggleSimulate,
      resetSimulate,
      verifyDocument,
      openLedger,
      closeLedger,
      reset,
    ],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment(): AssessmentContextValue {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
}
