/**
 * What the retirement hero's levers SAY: the facts behind each hint, and what
 * one saving step is worth by retirement.
 *
 * Pure module: no React, no DOM, no Vietnamese. Unit-tested in
 * `retirement-levers.test.ts` beside the steps themselves.
 *
 * Each fact comes from its OWN field's parse, so a malformed neighbour blanks
 * only its own slot. The one sum here is `contributionDelta`, and it is a
 * difference of two `projectRetirement` ledgers, not a formula of its own.
 */

import { parseCount, parseDecimal, parseMoney } from "@/lib/calc/number";
import type { RetirementInput, RetirementResult } from "@/lib/calc/retirement";
import { LEVER_STEP_PER_YEAR } from "@/lib/calc/retirement-levers";

/** The plan's input with the contribution one lever step higher. */
export function withSavingStep(input: RetirementInput): RetirementInput {
  return { ...input, annualContribution: input.annualContribution + LEVER_STEP_PER_YEAR };
}

/**
 * A yearly figure said per month: `annual / 12`, a BUDGETING equivalence.
 * The engine credits the contribution once a year, so a reader who pays
 * this every month ends slightly behind the plan — see `long-term-plan.ts`.
 */
export function monthlyEquivalent(annual: number): number {
  return annual / 12;
}

/** A monthly amount said per year: `monthly × 12`, exact. */
export function annualEquivalent(monthly: number): number {
  return monthly * 12;
}

/** What the levers' hints say, each from its own field's parse. */
export type LeverFacts = {
  annualContribution: number | null;
  desiredMonthlySpending: number | null;
  retirementAge: number | null;
  contributionGrowthPercent: number | null;
  /** Years still to save in, and years retired — null unless the ages are in order. */
  savingYears: number | null;
  retiredYears: number | null;
};

export function leverFacts(values: Readonly<Record<string, string>>): LeverFacts {
  const money = (key: string) => {
    const n = parseMoney(values[key] ?? "");
    return n === null || n < 0 ? null : n;
  };
  const current = parseCount(values.currentAge ?? "");
  const retirement = parseCount(values.retirementAge ?? "");
  const end = parseCount(values.endAge ?? "");
  const ordered =
    current !== null && retirement !== null && end !== null &&
    current <= retirement && retirement < end;
  return {
    annualContribution: money("annualContribution"),
    desiredMonthlySpending: money("desiredMonthlySpending"),
    retirementAge: retirement,
    contributionGrowthPercent: parseDecimal(values.contributionGrowthPercent ?? ""),
    savingYears: ordered ? retirement - current : null,
    retiredYears: ordered ? end - retirement : null,
  };
}

/**
 * What one saving step is worth in total, by the engine's own ledger.
 *
 * `stepped` is the projection with the contribution one step higher; the
 * total is the difference of the two projections' `totalContributed`, and
 * the age is the stepped plan's last accumulation year; `realTotal` is the
 * same difference in today's money. Null when either
 * projection is missing or there is no year to save in.
 */
export function contributionDelta(
  current: RetirementResult | null,
  stepped: RetirementResult | null,
): { total: number; realTotal: number; lastContributionAge: number } | null {
  if (current === null || stepped === null) return null;
  const saving = stepped.years.filter((row) => row.accumulating);
  if (saving.length === 0) return null;
  // Today's money from the engine's own start-of-year deflator per row
  // (`realContribution`) — never a deflator of this module's.
  const real = (result: RetirementResult) =>
    result.years.reduce((sum, row) => sum + row.realContribution, 0);
  return {
    total: stepped.totalContributed - current.totalContributed,
    realTotal: real(stepped) - real(current),
    lastContributionAge: saving[saving.length - 1].age,
  };
}
