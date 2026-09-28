"use client";

import { createContext, useContext, useState } from "react";
import type { StatusView } from "@/components/calc/result-status";
import {
  readRoutePlan,
  type RouteFieldKey,
  type RouteRead,
} from "@/components/retirement-plan-read";
import { useCalcFields, type FieldBinding } from "@/components/calc/use-calc-fields";
import {
  fundedAtBoundary,
  resolveLongTermPlan,
  type LongTermPlan,
} from "@/lib/calc/long-term-plan";
import { retirementStatus, type RetirementStatus } from "@/lib/calc/retirement-status";
import type { ChangeEcho } from "@/components/retirement-granary-echo";
import { retirementStatusView } from "@/components/retirement-plan-status-view";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

/** See `percent-calculator.tsx` for why these are literals, not `useId`. */
export const RETIREMENT_FORM_ID = "ke-hoach-huu-tri-nhap";
export const RETIREMENT_RESULT_ID = "ke-hoach-huu-tri-ket-qua";

export type RetirementPlanValue = {
  fields: {
    values: Record<RouteFieldKey, string>;
    bind: (key: RouteFieldKey) => FieldBinding;
    reset: () => void;
  };
  read: RouteRead;
  plan: LongTermPlan | null;
  /** `fundedAtBoundary` once, with the residue it forgave. */
  boundary: { funded: boolean; residue: number | null } | null;
  status: RetirementStatus;
  /** The card's view, label included — built once for both subtrees. */
  statusView: StatusView;
  /** The keys still holding the shipped example. */
  untouchedDefaults: readonly RouteFieldKey[];
  /** False while any field is unusable or the engine refuses the plan. */
  computable: boolean;
  /**
   * The last lever press and what it did — the hero's echo and the head of
   * the ONE live sentence. Cleared by any typed edit, so it can never
   * describe values the reader has since changed.
   */
  lastPress: ChangeEcho | null;
  /** A lever press: write `next` into `key`, and record what it did. */
  press: (key: RouteFieldKey, next: string, echo: ChangeEcho | null) => void;
};

const RetirementPlanContext = createContext<RetirementPlanValue | null>(null);

/**
 * The one plan behind /cong-cu/ke-hoach-huu-tri/'s two islands.
 *
 * The tool-first hero renders under the page's `h1`, in `CalculatorHeading`;
 * the form and the result render in `CalculatorPage`'s children. This
 * provider is their smallest shared ancestor: it wraps the whole page shell,
 * passes the server-rendered children through, and adds no DOM. The field
 * state lives HERE, so a lever press and a keystroke write the same state
 * through the same `bind(key).onValueChange`.
 *
 * It owns no arithmetic: the plan is `resolveLongTermPlan`, the verdict is
 * `fundedAtBoundary` via `retirementStatus`, and the words are
 * `retirement-plan-status-view.ts`.
 */
export function RetirementPlanState({ children }: { children: React.ReactNode }) {
  // This route's own scenario — the 2026 Vietnamese assumptions (content).
  const calc = useCalcFields(C.defaults);
  const [lastPress, setLastPress] = useState<ChangeEcho | null>(null);
  // Typing goes through the same binding as ever; it also retires the echo.
  const fields = {
    ...calc,
    bind: (key: RouteFieldKey) => {
      const binding = calc.bind(key);
      return {
        ...binding,
        onValueChange: (next: string) => {
          setLastPress(null);
          binding.onValueChange(next);
        },
      };
    },
  };
  const read = readRoutePlan(fields.values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  const boundary =
    plan === null ? null : fundedAtBoundary(plan.asEntered, plan.input.endAge);
  const status = retirementStatus(plan);
  const untouchedDefaults = (Object.keys(C.defaults) as RouteFieldKey[]).filter(
    (key) => fields.values[key] === C.defaults[key],
  );

  return (
    <RetirementPlanContext.Provider
      value={{
        fields,
        read,
        plan,
        boundary,
        status,
        statusView: retirementStatusView(plan, status),
        untouchedDefaults,
        computable: plan !== null,
        lastPress,
        press: (key, next, echo) => {
          setLastPress(echo);
          calc.bind(key).onValueChange(next);
        },
      }}
    >
      {children}
    </RetirementPlanContext.Provider>
  );
}

/** The plan, from inside `RetirementPlanState`. Outside it, a loud failure. */
export function useRetirementPlan(): RetirementPlanValue {
  const value = useContext(RetirementPlanContext);
  if (value === null) {
    throw new Error(
      "components/retirement-plan-state.tsx: useRetirementPlan() needs a " +
        "<RetirementPlanState> ancestor — app/cong-cu/ke-hoach-huu-tri/page.tsx wraps the page in one.",
    );
  }
  return value;
}
