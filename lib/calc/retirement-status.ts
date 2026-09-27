/**
 * The semantic state of /cong-cu/ke-hoach-huu-tri/'s answer.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese. Unit-tested in
 * `retirement-status.test.ts`.
 *
 * THE VERDICT IS `fundedAtBoundary`, as it is everywhere else on this route —
 * never a bare `depletionAge`, and never a rounded final balance. That policy
 * forgives float residue in the final year only; this module inherits it
 * rather than restating it.
 *
 * WHAT `caution` MEANS HERE, AND WHAT IT DOES NOT. It is a DEFINED condition:
 * the plan is funded by exactly nothing to spare — the engine forgave a
 * residue at the boundary, or the portfolio ends the horizon at zero đồng.
 * That is "mức chi vừa chạm khả năng duy trì". There is deliberately NO "gần
 * thiếu" state from a share of the spend or of the capital: the plan forbids
 * an arbitrary ratio, and a reader should change an assumption to test
 * resilience, which the page already suggests.
 *
 * FUNDED BY OTHER INCOME is its own kind, because a plan whose pension covers
 * the spend has not been funded by the portfolio and must not be described as
 * if it had.
 */

import { fundedAtBoundary, type LongTermPlan } from "@/lib/calc/long-term-plan";
import { atLedgerZero, type ResultTone } from "@/lib/calc/result-status";

export type RetirementStatusKind =
  | "unknown"
  | "depleted"
  | "exactBoundary"
  | "fundedByOtherIncome"
  | "funded";

export type RetirementStatus = {
  tone: ResultTone;
  kind: RetirementStatusKind;
  /** The engine's depletion age; null unless the plan is short. */
  depletionAge: number | null;
  /** Years of the horizon not covered; 0 unless short. */
  yearsShort: number;
  /** The horizon the reader typed. Null with no plan. */
  endAge: number | null;
  /** What `fundedAtBoundary` forgave, when it forgave anything. */
  residue: number | null;
};

export function retirementStatus(plan: LongTermPlan | null): RetirementStatus {
  if (plan === null) {
    return {
      tone: "unknown",
      kind: "unknown",
      depletionAge: null,
      yearsShort: 0,
      endAge: null,
      residue: null,
    };
  }
  const result = plan.asEntered;
  const endAge = plan.input.endAge;
  const boundary = fundedAtBoundary(result, endAge);

  if (!boundary.funded) {
    return {
      tone: "shortfall",
      kind: "depleted",
      depletionAge: result.depletionAge,
      yearsShort: result.yearsShort,
      endAge,
      residue: null,
    };
  }
  const funded = {
    depletionAge: null,
    yearsShort: 0,
    endAge,
    residue: boundary.residue,
  };
  if (result.fundedByOtherIncome) {
    return { ...funded, tone: "met", kind: "fundedByOtherIncome" };
  }
  const exhausted =
    boundary.residue !== null ||
    (plan.input.desiredAnnualSpending > 0 && atLedgerZero(result.finalBalance));
  if (exhausted) return { ...funded, tone: "caution", kind: "exactBoundary" };
  return { ...funded, tone: "met", kind: "funded" };
}
