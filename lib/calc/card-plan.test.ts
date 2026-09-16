/**
 * The dated card-payoff plan — original rows 29/30 — against the independent
 * reference table.
 *
 * Every figure below was computed OUTSIDE this codebase (exec43348d, plain
 * JS, no production imports) and is recorded in
 * `../../../artifacts/finhome-tools-audit-2026-09-14/card-payoff-acceptance.md`.
 * 50 triệu at 30%/năm, monthlyRate = (1 + 0,30/365)^(365/12) − 1 =
 * 0,025304592287556327; interest = opening balance × rate; the payment is
 * capped at the amount due; no new purchases and no fees:
 *
 * | Strategy | Payoff month | Total interest | Last payment | Month-12 balance |
 * |---|---:|---:|---:|---:|
 * | Fixed 3 triệu | 22 | 15.758.271,671711 | 2.758.271,671711 | 26.026.637,166228 |
 * | Fixed 4 triệu | 16 | 10.872.987,585179 | 872.987,585179 | 12.207.308,088176 |
 * | Minimum max(5% of due, 200k) | 125 | 46.478.510,384396 | 40.419,140974 | 36.465.997,556871 |
 * | First minimum 2.563.261,480719 held flat | 28 | 19.799.257,435620 | 591.197,456210 | 32.062.070,485235 |
 * | Minimum plus 1 triệu | 32 | 17.900.097,384351 | 483.026,807696 | 26.039.441,172490 |
 *
 * For a declared start of 2026-09-15 with the first payment one month later,
 * the payoff dates are 2028-07-15, 2028-01-15, 2037-02-15, 2029-01-15 and
 * 2029-05-15 respectively.
 *
 * These are hypothetical references, not financial advice, not a quoted
 * contract, and not a claim about what any Vietnamese card charges.
 */
import { describe, expect, it } from "vitest";
import {
  cardRefusalReason,
  planCardPayoff,
  type CardPlanInput,
} from "@/lib/calc/card-plan";
import { MAX_CARD_MONTHS } from "@/lib/calc/card-debt";
import { addMonths, type CalendarDate } from "@/lib/calc/dates";

const START: CalendarDate = { year: 2026, month: 9, day: 15 };

/** The acceptance table's own minimum rule: 5% of the amount due, floor 200k. */
const BASE: CardPlanInput = {
  balance: 50_000_000,
  annualRatePercent: 30,
  strategy: "fixed",
  monthlyPayment: 3_000_000,
  minimumPercent: 5,
  minimumFloor: 200_000,
  start: START,
};

/** A hundredth of a đồng. */
const DONG = 1e-2;

function plan(input: Partial<CardPlanInput> = {}) {
  const result = planCardPayoff({ ...BASE, ...input });
  expect(result).not.toBeNull();
  return result!;
}

function shows(date: CalendarDate): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

describe("the reference fixtures, on the chosen plan", () => {
  it("reproduces a fixed 3 triệu: 22 months and its last payment", () => {
    const { plan: path } = plan();
    expect(path.months).toBe(22);
    expect(Math.abs(path.result.totalInterest - 15_758_271.671711))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.lastPayment - 2_758_271.671711))
      .toBeLessThan(DONG);
    // The final payment is TRIMMED to what is outstanding, not a full 3 triệu.
    expect(path.result.lastPayment).toBeLessThan(3_000_000);
    expect(Math.abs(path.result.schedule[11].balance - 26_026_637.166228))
      .toBeLessThan(DONG);
  });

  it("reproduces a fixed 4 triệu: 16 months", () => {
    const { plan: path } = plan({ monthlyPayment: 4_000_000 });
    expect(path.months).toBe(16);
    expect(Math.abs(path.result.totalInterest - 10_872_987.585179))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.lastPayment - 872_987.585179))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.schedule[11].balance - 12_207_308.088176))
      .toBeLessThan(DONG);
  });

  it("reproduces the declining minimum: 125 months", () => {
    const { plan: path } = plan({ strategy: "minimum" });
    expect(path.months).toBe(125);
    expect(Math.abs(path.result.totalInterest - 46_478_510.384396))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.lastPayment - 40_419.140974))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.schedule[11].balance - 36_465_997.556871))
      .toBeLessThan(DONG);
    // A declining payment has no level figure to report, and that is the
    // point of the comparison rather than a missing number.
    expect(path.levelPayment).toBeNull();
    expect(Math.abs(path.result.firstPayment - 2_563_261.480719))
      .toBeLessThan(DONG);
  });

  it("reproduces the minimum plus 1 triệu: 32 months", () => {
    const { plan: path } = plan({
      strategy: "minimum",
      extraPerMonth: 1_000_000,
    });
    expect(path.months).toBe(32);
    expect(Math.abs(path.result.totalInterest - 17_900_097.384351))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.lastPayment - 483_026.807696))
      .toBeLessThan(DONG);
    expect(Math.abs(path.result.schedule[11].balance - 26_039_441.172490))
      .toBeLessThan(DONG);
    // Still declining: a fixed extra on top of a falling minimum falls too.
    expect(path.levelPayment).toBeNull();
  });

  it("solves the payment a target month needs, then simulates THAT", () => {
    // The quoted payment and the drawn schedule must be one plan.
    const { plan: path } = plan({ strategy: "target", targetMonths: 12 });
    expect(path.months).toBe(12);
    expect(path.levelPayment).not.toBeNull();
    expect(Math.round(path.levelPayment!)).toBe(4_883_350);
    const paid = path.result.schedule.reduce((sum, m) => sum + m.payment, 0);
    expect(Math.abs(paid - path.result.totalPaid)).toBeLessThan(1e-4);
  });
});

describe("the other path, on the same balance and rate", () => {
  it("puts the declining minimum beside a level plan", () => {
    const result = plan();
    expect(result.comparison).not.toBeNull();
    expect(result.comparison!.strategy).toBe("minimum");
    expect(result.comparison!.months).toBe(125);
    expect(result.comparison!.startingBalance).toBe(result.plan.startingBalance);
    expect(result.monthsDifference).toBe(125 - 22);
    expect(
      Math.abs(
        result.interestDifference! - (46_478_510.384396 - 15_758_271.671711),
      ),
    ).toBeLessThan(DONG);
  });

  it("puts the SAME first minimum, held flat, beside the minimum plan", () => {
    // Row 30's whole point: 125 months against 28, on one first payment.
    const result = plan({ strategy: "minimum" });
    expect(result.comparison!.strategy).toBe("minimumFlat");
    expect(result.comparison!.months).toBe(28);
    expect(
      Math.abs(result.comparison!.levelPayment! - 2_563_261.480719),
    ).toBeLessThan(DONG);
    expect(
      Math.abs(result.comparison!.result.totalInterest - 19_799_257.435620),
    ).toBeLessThan(DONG);
    expect(
      Math.abs(result.comparison!.result.lastPayment - 591_197.456210),
    ).toBeLessThan(DONG);
    expect(
      Math.abs(result.comparison!.result.schedule[11].balance - 32_062_070.485235),
    ).toBeLessThan(DONG);
    expect(result.monthsDifference).toBe(28 - 125);
  });

  it("reports a failed comparison as no comparison, not as no difference", () => {
    // A 0% minimum with no floor never covers the interest, so there is no
    // schedule at all. `x === null ? base : compute()` would make that
    // indistinguishable from "the two cost the same".
    const result = plan({ minimumPercent: 0, minimumFloor: 0 });
    expect(result.plan.months).toBe(22);
    expect(result.comparison).toBeNull();
    expect(result.monthsDifference).toBeNull();
    expect(result.interestDifference).toBeNull();
  });

  it("keeps the same balance and rate on both paths", () => {
    const result = plan();
    expect(result.comparison!.startingBalance).toBe(50_000_000);
    expect(result.plan.startingBalance).toBe(50_000_000);
  });
});

describe("the dates, under the stated convention", () => {
  it("puts the first payment one month after the start", () => {
    const result = plan();
    expect(shows(result.firstPaymentDate)).toBe("2026-10-15");
    expect(shows(result.start)).toBe("2026-09-15");
  });

  it("reproduces every reference payoff date", () => {
    expect(shows(plan().plan.payoffDate)).toBe("2028-07-15");
    expect(shows(plan({ monthlyPayment: 4_000_000 }).plan.payoffDate))
      .toBe("2028-01-15");
    expect(shows(plan({ strategy: "minimum" }).plan.payoffDate))
      .toBe("2037-02-15");
    expect(shows(plan({ strategy: "minimum" }).comparison!.payoffDate))
      .toBe("2029-01-15");
    expect(
      shows(
        plan({ strategy: "minimum", extraPerMonth: 1_000_000 }).plan.payoffDate,
      ),
    ).toBe("2029-05-15");
  });

  it("anchors the payoff date to the START, so it cannot drift", () => {
    // Chaining through the first payment date would clamp twice: 31 January
    // plus one month is 28 February, and 21 months after THAT is 28 November,
    // where 22 months after the start is 30 November.
    const start: CalendarDate = { year: 2026, month: 1, day: 31 };
    const result = plan({ start });
    expect(shows(result.firstPaymentDate)).toBe("2026-02-28");
    expect(shows(result.plan.payoffDate)).toBe("2027-11-30");
    expect(shows(addMonths(start, result.plan.months)!)).toBe("2027-11-30");
    // The clamp is a one-off, not a permanent shift: the anchor day comes
    // back in the next long month.
    expect(shows(addMonths(start, 2)!)).toBe("2026-03-31");
  });

  it("refuses a start date that does not exist", () => {
    expect(
      planCardPayoff({ ...BASE, start: { year: 2026, month: 2, day: 30 } }),
    ).toBeNull();
    expect(
      planCardPayoff({ ...BASE, start: { year: 2026, month: 13, day: 1 } }),
    ).toBeNull();
  });

  it("dates both paths from the one start", () => {
    const result = plan();
    expect(shows(result.comparison!.payoffDate)).toBe("2037-02-15");
    expect(shows(addMonths(START, result.comparison!.months)!))
      .toBe("2037-02-15");
  });
});

describe("the household allocation", () => {
  it("frees the amount the household reserved, and dates it", () => {
    const result = plan({ householdBudget: 3_000_000 });
    expect(result.budget).not.toBeNull();
    expect(result.budget!.freedMonthly).toBe(3_000_000);
    expect(result.budget!.freedFromMonth).toBe(22);
    expect(shows(result.budget!.freedFromDate)).toBe("2028-07-15");
    expect(result.budget!.coversPlan).toBe(true);
    expect(result.budget!.shortfall).toBe(0);
  });

  it("does NOT free a declining minimum's first payment", () => {
    // The acceptance boundary: the minimum was already falling, so nothing
    // was released by it. What frees up is the 1 triệu the household said it
    // had set aside — not the 2.563.261 ₫ of the first statement.
    const result = plan({ strategy: "minimum", householdBudget: 1_000_000 });
    expect(result.budget!.freedMonthly).toBe(1_000_000);
    expect(result.budget!.freedMonthly).not.toBe(
      result.plan.result.firstPayment,
    );
    // And the allocation does not even run this plan, which the page says.
    expect(result.budget!.coversPlan).toBe(false);
    expect(
      Math.abs(result.budget!.shortfall - (2_563_261.480719 - 1_000_000)),
    ).toBeLessThan(DONG);
  });

  it("does not treat the payoff month as a free month", () => {
    // The last payment lands IN the payoff month: 2.758.271,671711 ₫ of that
    // month's 3 triệu, leaving 241.728,328289 ₫. The whole allocation is free
    // only from the next cycle — month 23, 15/8/2028 — and the two dates are
    // reported separately because they are different facts.
    const result = plan({ householdBudget: 3_000_000 });
    const budget = result.budget!;
    expect(Math.abs(budget.finalPayment - 2_758_271.671711)).toBeLessThan(DONG);
    expect(Math.abs(budget.finalMonthSurplus - 241_728.328289))
      .toBeLessThan(DONG);
    expect(budget.freedFromMonth).toBe(22);
    expect(shows(budget.freedFromDate)).toBe("2028-07-15");
    expect(budget.fullBudgetFromMonth).toBe(23);
    expect(shows(budget.fullBudgetFromDate)).toBe("2028-08-15");
    // Anchored to the START, like every other date here.
    expect(shows(budget.fullBudgetFromDate)).toBe(shows(addMonths(START, 23)!));
  });

  it("reports a negative final-month surplus rather than hiding it", () => {
    // An allocation smaller than the last payment leaves nothing that month.
    const result = plan({ householdBudget: 1_500_000 });
    expect(result.budget!.finalMonthSurplus).toBeLessThan(0);
    expect(result.budget!.coversPlan).toBe(false);
  });

  it("reports no freed amount when none was reserved", () => {
    expect(plan().budget).toBeNull();
    expect(plan({ householdBudget: 0 }).budget).toBeNull();
  });

  it("measures the shortfall against the HIGHEST payment the plan needs", () => {
    const result = plan({ householdBudget: 2_000_000 });
    expect(result.plan.highestPayment).toBe(3_000_000);
    expect(result.budget!.coversPlan).toBe(false);
    expect(result.budget!.shortfall).toBe(1_000_000);
  });
});

describe("rejected and recoverable inputs", () => {
  it("refuses a payment that never covers the first month's interest", () => {
    // 50 triệu at 30%/năm charges 1.265.229,61 ₫ in month 1. A payment at or
    // below that is a debt that grows forever, which has to come back as no
    // payoff rather than a very large number of months.
    expect(planCardPayoff({ ...BASE, monthlyPayment: 1_265_229 })).toBeNull();
    expect(planCardPayoff({ ...BASE, monthlyPayment: 0 })).toBeNull();
    // One đồng more and there is a schedule again — a recoverable state, not
    // a dead end.
    const recovered = planCardPayoff({ ...BASE, monthlyPayment: 2_000_000 });
    expect(recovered).not.toBeNull();
    expect(recovered!.plan.months).toBeGreaterThan(22);
  });

  it("handles a zero rate exactly", () => {
    const result = plan({ annualRatePercent: 0, monthlyPayment: 5_000_000 });
    expect(result.plan.months).toBe(10);
    expect(result.plan.result.totalInterest).toBe(0);
    expect(result.plan.result.totalPaid).toBe(50_000_000);
    expect(shows(result.plan.payoffDate)).toBe("2027-07-15");
  });

  it("takes a whole number of months and nothing else", () => {
    expect(
      planCardPayoff({ ...BASE, strategy: "target", targetMonths: 12.5 }),
    ).toBeNull();
    expect(
      planCardPayoff({ ...BASE, strategy: "target", targetMonths: 0 }),
    ).toBeNull();
    expect(
      planCardPayoff({ ...BASE, strategy: "target", targetMonths: undefined }),
    ).toBeNull();
  });

  it("refuses figures that cannot describe a card", () => {
    for (const patch of [
      { balance: 0 },
      { balance: -1 },
      { balance: Number.NaN },
      { annualRatePercent: -1 },
      { minimumPercent: 101 },
      { minimumFloor: -1 },
      { householdBudget: -1 },
      { monthlyPayment: Number.POSITIVE_INFINITY },
    ] as Partial<CardPlanInput>[]) {
      expect(planCardPayoff({ ...BASE, ...patch }), JSON.stringify(patch))
        .toBeNull();
    }
  });

  it("tells the three refusals apart, because the fixes differ", () => {
    // All three come back as a null plan, and calling them all "this debt
    // never ends" would be wrong twice.
    expect(cardRefusalReason(BASE)).toBeNull();
    expect(cardRefusalReason({ ...BASE, monthlyPayment: 1_265_229 }))
      .toBe("neverClears");
    expect(cardRefusalReason({ ...BASE, minimumPercent: 0, minimumFloor: 0, strategy: "minimum" }))
      .toBe("neverClears");
    // A valid target past the model's own 100-year horizon: the payment is a
    // real annuity payment, so the debt DOES clear — just not inside the
    // supported window.
    expect(
      cardRefusalReason({
        ...BASE,
        strategy: "target",
        targetMonths: MAX_CARD_MONTHS + 1,
      }),
    ).toBe("beyondHorizon");
    for (const patch of [
      { balance: 0 },
      { annualRatePercent: -1 },
      { minimumPercent: 101 },
      { start: { year: 2026, month: 2, day: 30 } },
      { strategy: "target" as const, targetMonths: 12.5 },
    ] as Partial<CardPlanInput>[]) {
      expect(cardRefusalReason({ ...BASE, ...patch }), JSON.stringify(patch))
        .toBe("invalid");
    }
  });

  it("keeps every schedule finite and bounded", () => {
    // The card module stops at 1.200 months and reports no payoff rather than
    // a truncated answer, so a plan that would run past it is null and never
    // a schedule that quietly stops short of zero.
    const long = planCardPayoff({
      ...BASE,
      strategy: "minimum",
      minimumPercent: 1,
      minimumFloor: 1,
    });
    if (long !== null) {
      expect(long.plan.months).toBeLessThanOrEqual(1200);
      expect(long.plan.result.schedule).toHaveLength(long.plan.months);
      expect(
        long.plan.result.schedule[long.plan.months - 1].balance,
      ).toBe(0);
    }
    const plans = [plan(), plan({ strategy: "minimum" })];
    for (const result of plans) {
      expect(result.plan.result.schedule).toHaveLength(result.plan.months);
      expect(result.plan.result.schedule.at(-1)!.balance).toBe(0);
      for (const month of result.plan.result.schedule) {
        expect(Number.isFinite(month.balance)).toBe(true);
        expect(Number.isFinite(month.payment)).toBe(true);
        // interest + principal === payment, on every row.
        expect(
          Math.abs(month.interest + month.principal - month.payment),
        ).toBeLessThan(1e-6);
      }
    }
  });
});
