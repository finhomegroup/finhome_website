/**
 * The two assumptions a rental plan is most exposed to, as named scenarios —
 * for /cong-cu/bat-dong-san-cho-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `rental-scenarios.test.ts`.
 *
 * Original row 15 asks for "kịch bản trống nhà / chi phí bảo trì" beside the
 * monthly cash figure. The reason it is a scenario view rather than advice to
 * run the tool three times is the same reason `rent-vs-buy.ts` has one: the
 * answer turns on an input nobody can know. A flat at 5% vacancy with 3 triệu
 * of costs is cash-positive; one empty month more and 50% more maintenance can
 * put it under water, and that is a fact about the plan the reader should see
 * without re-typing eleven fields.
 *
 * NO ENGINE OF ITS OWN. Every figure is `computeRentalProperty` on the reader's
 * own inputs with one or two assumptions replaced. The four ratios, the tax
 * treatment and the debt service all come from there, so a scenario cannot
 * disagree with the headline about how tax is charged.
 *
 * A SCENARIO IS A SELECTION, NOT AN INCREMENT — the lesson
 * `floating-loan.ts`'s rate stress records. Each scenario is rebuilt from the
 * ORIGINAL input, so nothing compounds and the baseline is recoverable
 * exactly.
 *
 * NO LIKELIHOOD IS ATTACHED TO ANY OF THEM. These are not forecasts and not a
 * confidence interval: each is named by the assumption it changed and carries
 * the vacancy and cost figures it ran on. An empty month is expressed as
 * PERCENTAGE POINTS of a year (100/12 ≈ 8,33), because that is the unit the
 * form's own field uses.
 *
 * VACANCY IS CAPPED AT 100%, not wrapped: a property cannot be empty for more
 * than a year in a year. The scenario reports the vacancy it actually used, so
 * a capped case is visible rather than silently equal to the baseline.
 */

import {
  computeRentalProperty,
  type RentalPropertyInput,
  type RentalPropertyResult,
} from "@/lib/calc/rental-property";

/** Extra empty months the vacancy scenario assumes, over a year. */
export const SCENARIO_EXTRA_VACANT_MONTHS = 1;

/** How much higher the cost scenario assumes recurring costs are, in percent. */
export const SCENARIO_EXPENSE_UPLIFT_PERCENT = 50;

export type RentalScenarioKey = "base" | "vacancy" | "expenses" | "both";

export type RentalScenario = {
  key: RentalScenarioKey;
  /** The vacancy this scenario ran on, in percent of a year. */
  vacancyPercent: number;
  /** The monthly recurring cost this scenario ran on. */
  monthlyExpenses: number;
  result: RentalPropertyResult;
  /** Monthly cash flow less the baseline's. 0 on the baseline itself. */
  cashFlowPerMonthDelta: number;
  /** Cash-on-cash less the baseline's, in percentage points. */
  cashOnCashDeltaPoints: number | null;
  /** DSCR less the baseline's. Null when nothing is borrowed. */
  dscrDelta: number | null;
};

export type RentalScenarioComparison = {
  /** The reader's own figures, first. */
  base: RentalPropertyResult;
  /** Baseline first, then the three variations. */
  scenarios: RentalScenario[];
  /** The percentage points one empty month is worth over a year. */
  extraVacancyPoints: number;
  /** True when at least one scenario turns the monthly cash flow negative. */
  anyNegativeCashFlow: boolean;
  /** True when the baseline itself is already negative. */
  baseNegativeCashFlow: boolean;
};

/**
 * Run the plan under the baseline and three named variations.
 *
 * Null when the baseline inputs do not describe a property — the same
 * refusals `computeRentalProperty` documents — or when any scenario fails to
 * compute, which would leave a comparison with a hole in it.
 */
export function compareRentalScenarios(
  input: RentalPropertyInput,
): RentalScenarioComparison | null {
  const base = computeRentalProperty(input);
  if (base === null) return null;

  const extraVacancyPoints = (SCENARIO_EXTRA_VACANT_MONTHS / 12) * 100;
  const baseVacancy = input.vacancyPercent ?? 0;
  const baseExpenses = input.monthlyExpenses ?? 0;
  const worseVacancy = Math.min(100, baseVacancy + extraVacancyPoints);
  const worseExpenses =
    baseExpenses * (1 + SCENARIO_EXPENSE_UPLIFT_PERCENT / 100);

  const plans: { key: RentalScenarioKey; vacancy: number; expenses: number }[] =
    [
      { key: "base", vacancy: baseVacancy, expenses: baseExpenses },
      { key: "vacancy", vacancy: worseVacancy, expenses: baseExpenses },
      { key: "expenses", vacancy: baseVacancy, expenses: worseExpenses },
      { key: "both", vacancy: worseVacancy, expenses: worseExpenses },
    ];

  const scenarios: RentalScenario[] = [];
  for (const plan of plans) {
    // Rebuilt from the ORIGINAL input every time: nothing compounds.
    const result = computeRentalProperty({
      ...input,
      vacancyPercent: plan.vacancy,
      monthlyExpenses: plan.expenses,
    });
    if (result === null) return null;
    scenarios.push({
      key: plan.key,
      vacancyPercent: plan.vacancy,
      monthlyExpenses: plan.expenses,
      result,
      cashFlowPerMonthDelta: result.cashFlowPerMonth - base.cashFlowPerMonth,
      // Both sides can be null — nothing invested, nothing borrowed — and a
      // difference against a missing figure is not zero.
      cashOnCashDeltaPoints:
        result.cashOnCashPercent === null || base.cashOnCashPercent === null
          ? null
          : result.cashOnCashPercent - base.cashOnCashPercent,
      dscrDelta:
        result.dscr === null || base.dscr === null
          ? null
          : result.dscr - base.dscr,
    });
  }

  return {
    base,
    scenarios,
    extraVacancyPoints,
    anyNegativeCashFlow: scenarios.some((s) => s.result.cashFlowPerMonth < 0),
    baseNegativeCashFlow: base.cashFlowPerMonth < 0,
  };
}
