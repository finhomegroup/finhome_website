import {
  readRetirement,
  type RetirementFieldKey,
} from "@/components/calc/retirement-fields";
import { parseMoney } from "@/lib/calc/number";
import type { RetirementInput } from "@/lib/calc/retirement";

/**
 * /cong-cu/ke-hoach-huu-tri/ asks for the two RETIREMENT INCOMES per month —
 * the pension the reader wants and the pension or other income they expect —
 * because that is how a Vietnamese reader thinks about a pension. The engine
 * takes both per year; this module is the one place the unit changes.
 *
 * Everything else is the shared grammar: the other nine fields are read by
 * `readRetirement`, the one authority on what a valid plan is, and a monthly
 * field is valid by that module's own money rule (it parses, and it is ≥ 0).
 * The ×12 is a change of unit, exact — never a re-parse of a formatted string.
 */

/** This route's field keys: the shared eleven, with the two incomes per month. */
export type RouteFieldKey =
  | Exclude<RetirementFieldKey, "desiredAnnualSpending" | "otherAnnualIncome">
  | "desiredMonthlySpending"
  | "otherMonthlyIncome";

export type RouteValues = Record<RouteFieldKey, string>;

export type RouteRead = {
  input: RetirementInput | null;
  invalid: Record<RouteFieldKey, boolean>;
};

/** A monthly money field, by `readRetirement`'s money rule; null when unusable. */
function monthly(raw: string | undefined): number | null {
  const value = parseMoney(raw ?? "");
  return value === null || value < 0 ? null : value;
}

export function readRoutePlan(values: Readonly<Record<string, string>>): RouteRead {
  const spend = monthly(values.desiredMonthlySpending);
  const other = monthly(values.otherMonthlyIncome);
  // The nine shared fields, read by the shared parser; the two yearly slots
  // are filled with a valid placeholder and replaced below.
  const base = readRetirement({ ...values, desiredAnnualSpending: "0", otherAnnualIncome: "0" });
  const invalid = {
    currentAge: base.invalid.currentAge,
    retirementAge: base.invalid.retirementAge,
    endAge: base.invalid.endAge,
    currentBalance: base.invalid.currentBalance,
    annualContribution: base.invalid.annualContribution,
    contributionGrowthPercent: base.invalid.contributionGrowthPercent,
    returnBeforePercent: base.invalid.returnBeforePercent,
    returnAfterPercent: base.invalid.returnAfterPercent,
    inflationPercent: base.invalid.inflationPercent,
    desiredMonthlySpending: spend === null,
    otherMonthlyIncome: other === null,
  };
  return {
    input:
      base.input === null || spend === null || other === null
        ? null
        : { ...base.input, desiredAnnualSpending: spend * 12, otherAnnualIncome: other * 12 },
    invalid,
  };
}
