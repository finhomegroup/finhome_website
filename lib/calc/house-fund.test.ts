/**
 * ORIGINAL ROW 19 — a dated home-fund goal with an extra-saving comparison.
 *
 * The supervisor's acceptance fixture: price 3 tỷ, down-payment share 30%,
 * purchase costs 3% of the PRICE, protected reserve 150 triệu → target 1,14
 * tỷ. Initial 300 triệu, nominal 6%/năm (0,5%/tháng), end-of-month
 * contributions from 2026-09-15.
 *
 * | Contribution | Funded month | Date       | Balance              | Own funds     | Interest             |
 * |-------------:|-------------:|------------|---------------------:|--------------:|---------------------:|
 * | 15 triệu     | 46           | 2030-07-15 | 1.151.000.452,0826542| 990.000.000   | 161.000.452,0826544  |
 * | 20 triệu     | 36           | 2029-09-15 | 1.145.726.256,7407029| 1.020.000.000 | 125.726.256,74070312 |
 *
 * The extra 5 triệu reaches the goal 10 whole months earlier.
 *
 * Deterministic test inputs: a hypothetical price and an assumed return, not a
 * market rate, a product or a forecast.
 *
 * Bounds are stated absolutely — `toBeCloseTo`'s second argument is a digit
 * count, not a delta.
 */
import { describe, expect, it } from "vitest";
import {
  houseFundTarget,
  planHouseFund,
  type HouseFundPlanInput,
} from "@/lib/calc/house-fund";
import { MAX_PROJECTION_MONTHS } from "@/lib/calc/savings-schedule";

/** `|actual − expected| < tolerance`, with the bound stated at the call. */
function near(
  actual: number | null | undefined,
  expected: number,
  tolerance: number,
  label?: string,
) {
  expect(actual, label).not.toBeNull();
  expect(Math.abs((actual as number) - expected), label).toBeLessThan(
    tolerance,
  );
}

/** A thousandth of a đồng: float residue on a nine-figure accumulation. */
const DONG = 1e-3;

const TARGET_INPUT = {
  price: 3_000_000_000,
  downPaymentPercent: 30,
  purchaseCostPercent: 3,
  reserve: 150_000_000,
};

const START = { year: 2026, month: 9, day: 15 };

const PLAN: HouseFundPlanInput = {
  target: 1_140_000_000,
  start: START,
  initial: 300_000_000,
  contribution: 15_000_000,
  annualRatePercent: 6,
};

describe("houseFundTarget — one goal, each amount once", () => {
  it("composes the acceptance target from the price", () => {
    const target = houseFundTarget(TARGET_INPUT);
    expect(target).not.toBeNull();
    if (target === null) return;
    expect(target.downPayment).toBe(900_000_000);
    // 3% of the PRICE, not of the down payment.
    expect(target.purchaseCosts).toBe(90_000_000);
    expect(target.reserve).toBe(150_000_000);
    expect(target.target).toBe(1_140_000_000);
    // The sum is the three parts and nothing else.
    expect(target.downPayment + target.purchaseCosts + target.reserve).toBe(
      target.target,
    );
  });

  it("scales purchase costs with the price, not the deposit", () => {
    // Doubling the down-payment share must not change the cost line.
    const base = houseFundTarget(TARGET_INPUT);
    const bigger = houseFundTarget({ ...TARGET_INPUT, downPaymentPercent: 60 });
    expect(bigger?.purchaseCosts).toBe(base?.purchaseCosts);
    expect(bigger?.downPayment).toBe(1_800_000_000);
    expect(bigger?.target).toBe(2_040_000_000);
  });

  it("keeps the reserve as a stated part of the target", () => {
    // Removing the reserve removes exactly the reserve — the proof that it is
    // counted once and inside the target.
    const withReserve = houseFundTarget(TARGET_INPUT);
    const without = houseFundTarget({ ...TARGET_INPUT, reserve: 0 });
    expect(withReserve!.target - without!.target).toBe(150_000_000);
  });

  it("refuses inputs that cannot describe a purchase", () => {
    for (const patch of [
      { price: 0 },
      { price: -1 },
      { price: Number.NaN },
      { downPaymentPercent: -1 },
      { downPaymentPercent: 101 },
      { purchaseCostPercent: 101 },
      { reserve: -1 },
    ]) {
      expect(
        houseFundTarget({ ...TARGET_INPUT, ...patch }),
        JSON.stringify(patch),
      ).toBeNull();
    }
  });

  it("allows a 100% down payment, which is a cash purchase", () => {
    const cash = houseFundTarget({
      ...TARGET_INPUT,
      downPaymentPercent: 100,
    });
    expect(cash?.downPayment).toBe(3_000_000_000);
    expect(cash?.target).toBe(3_240_000_000);
  });
});

describe("planHouseFund — the acceptance fixture, with dates", () => {
  const plan = planHouseFund(PLAN);

  it("reaches the goal in month 46, on 2030-07-15", () => {
    expect(plan).not.toBeNull();
    if (plan === null) return;
    expect(plan.current.schedule.status).toBe("funded");
    expect(plan.current.schedule.fundedMonth).toBe(46);
    expect(plan.current.fundedDate).toEqual({ year: 2030, month: 7, day: 15 });
    near(plan.current.balance, 1_151_000_452.0826542, DONG, "balance");
  });

  it("separates own funds from modelled interest", () => {
    if (plan === null) return;
    // 300 triệu of initial funds plus 46 × 15 triệu — the initial amount
    // counted exactly once.
    expect(plan.current.ownFunds).toBe(990_000_000);
    near(plan.current.interest, 161_000_452.0826544, DONG, "interest");
    near(
      plan.current.ownFunds + plan.current.interest,
      plan.current.balance,
      1e-6,
      "ledger",
    );
  });

  it("dates the first contribution one month after the start", () => {
    if (plan === null) return;
    // Contributions are end-of-period, so none has landed at month 0.
    expect(plan.firstContributionDate).toEqual({
      year: 2026,
      month: 10,
      day: 15,
    });
    expect(plan.start).toEqual(START);
  });

  it("offers no comparison until a higher figure is entered", () => {
    if (plan === null) return;
    expect(plan.higher).toBeNull();
    expect(plan.monthsEarlier).toBeNull();
  });
});

describe("planHouseFund — the extra-saving comparison", () => {
  const plan = planHouseFund({ ...PLAN, comparisonContribution: 20_000_000 });

  it("reaches the goal in month 36, on 2029-09-15", () => {
    expect(plan).not.toBeNull();
    if (plan === null || plan.higher === null) return;
    expect(plan.higher.schedule.fundedMonth).toBe(36);
    expect(plan.higher.fundedDate).toEqual({ year: 2029, month: 9, day: 15 });
    near(plan.higher.balance, 1_145_726_256.7407029, DONG, "balance");
    expect(plan.higher.ownFunds).toBe(1_020_000_000);
    near(plan.higher.interest, 125_726_256.74070312, DONG, "interest");
  });

  it("is ten whole months earlier", () => {
    expect(plan?.higher).not.toBeNull();
    if (plan === null || plan.higher === null) return;
    expect(plan.monthsEarlier).toBe(10);
    // Compared on whole funded cycles, not on a fractional estimate: 46 − 36.
    expect(plan.current.schedule.fundedMonth).toBe(46);
    expect(plan.higher.schedule.fundedMonth).toBe(36);
  });

  it("leaves the current plan untouched by the comparison", () => {
    // The baseline must be the same answer with or without a comparison.
    const alone = planHouseFund(PLAN);
    if (plan === null || alone === null) return;
    expect(plan.current.schedule.fundedMonth).toBe(
      alone.current.schedule.fundedMonth,
    );
    expect(plan.current.balance).toBe(alone.current.balance);
    expect(plan.current.fundedDate).toEqual(alone.current.fundedDate);
  });

  it("saves more money-in but less interest, which is the lesson", () => {
    if (plan === null || plan.higher === null) return;
    // Getting there sooner means contributing MORE of your own money and
    // earning LESS modelled interest — the trade-off the page has to show.
    expect(plan.higher.ownFunds).toBeGreaterThan(plan.current.ownFunds);
    expect(plan.higher.interest).toBeLessThan(plan.current.interest);
  });

  it("is not a comparison when the figure is not higher", () => {
    for (const comparisonContribution of [15_000_000, 10_000_000, 0]) {
      const same = planHouseFund({ ...PLAN, comparisonContribution });
      expect(same?.higher, String(comparisonContribution)).toBeNull();
      expect(same?.monthsEarlier).toBeNull();
    }
  });
});

describe("planHouseFund — the calendar is explicit, not timezone-dependent", () => {
  it("clamps a month-end start without drifting afterwards", () => {
    // 31 January anchored: one month is 28 February, two months is 31 March.
    // The alternative — iterating from the clamped date — would drift to 28
    // March and stay there. This is a stated convention, not a universal rule.
    const plan = planHouseFund({
      ...PLAN,
      start: { year: 2026, month: 1, day: 31 },
      contribution: 200_000_000,
    });
    expect(plan).not.toBeNull();
    if (plan === null) return;
    expect(plan.firstContributionDate).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    // Funded in month 5, which is June — 30 days, so the 31st clamps again.
    expect(plan.current.schedule.fundedMonth).toBe(5);
    expect(plan.current.fundedDate).toEqual({ year: 2026, month: 6, day: 30 });

    // NO DRIFT: a cycle landing on a 31-day month gets the 31st back, because
    // every date is computed from the START and not from the clamped one.
    // Iterating from 28 February would have produced 28 March here.
    const twoMonths = planHouseFund({
      ...PLAN,
      start: { year: 2026, month: 1, day: 31 },
      contribution: 420_000_000,
    });
    expect(twoMonths?.current.schedule.fundedMonth).toBe(2);
    expect(twoMonths?.current.fundedDate).toEqual({
      year: 2026,
      month: 3,
      day: 31,
    });
  });

  it("clamps to 29 February in a leap year", () => {
    const plan = planHouseFund({
      ...PLAN,
      start: { year: 2028, month: 1, day: 31 },
      contribution: 840_000_000,
    });
    expect(plan?.firstContributionDate).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
    expect(plan?.current.schedule.fundedMonth).toBe(1);
    expect(plan?.current.fundedDate).toEqual({
      year: 2028,
      month: 2,
      day: 29,
    });
  });

  it("dates an already-funded plan at the start, not a month later", () => {
    const plan = planHouseFund({ ...PLAN, initial: 1_200_000_000 });
    expect(plan).not.toBeNull();
    if (plan === null) return;
    expect(plan.current.schedule.status).toBe("alreadyFunded");
    expect(plan.current.schedule.fundedMonth).toBe(0);
    expect(plan.current.fundedDate).toEqual(START);
    // No contribution has been made, so own funds are the initial amount.
    expect(plan.current.ownFunds).toBe(1_200_000_000);
    expect(plan.current.interest).toBe(0);
  });

  it("refuses a start date that does not exist", () => {
    for (const start of [
      { year: 2026, month: 2, day: 30 },
      { year: 2026, month: 13, day: 1 },
      { year: 2026, month: 1, day: 0 },
      { year: 2026.5, month: 1, day: 1 },
    ]) {
      expect(planHouseFund({ ...PLAN, start }), JSON.stringify(start)).toBeNull();
    }
  });

  it("crosses a year boundary correctly", () => {
    const plan = planHouseFund({
      ...PLAN,
      start: { year: 2026, month: 11, day: 15 },
    });
    // Month 46 from November 2026 is September 2030.
    expect(plan?.current.fundedDate).toEqual({
      year: 2030,
      month: 9,
      day: 15,
    });
  });
});

describe("planHouseFund — states that are answers, not errors", () => {
  it("reports a plan that cannot reach the goal in the supported horizon", () => {
    const plan = planHouseFund({ ...PLAN, contribution: 1, annualRatePercent: 0 });
    expect(plan).not.toBeNull();
    if (plan === null) return;
    expect(plan.current.schedule.status).toBe("beyondLimit");
    expect(plan.current.schedule.fundedMonth).toBeNull();
    // No date invented for a cycle that never arrives.
    expect(plan.current.fundedDate).toBeNull();
    expect(plan.monthsEarlier).toBeNull();
  });

  it("reports a frozen balance as unattainable", () => {
    const plan = planHouseFund({
      ...PLAN,
      contribution: 0,
      annualRatePercent: 0,
    });
    expect(plan?.current.schedule.status).toBe("unattainable");
    expect(plan?.current.fundedDate).toBeNull();
  });

  it("gives no months-earlier figure when only one leg funds", () => {
    // An earlier date against a plan that never funds is not a comparison.
    const plan = planHouseFund({
      ...PLAN,
      contribution: 1,
      annualRatePercent: 0,
      comparisonContribution: 20_000_000,
    });
    expect(plan?.current.schedule.fundedMonth).toBeNull();
    expect(plan?.higher?.schedule.fundedMonth).not.toBeNull();
    expect(plan?.monthsEarlier).toBeNull();
  });

  it("funds at a zero rate purely from contributions", () => {
    const plan = planHouseFund({
      ...PLAN,
      annualRatePercent: 0,
      contribution: 20_000_000,
    });
    // (1.140 − 300) / 20 = 42 months exactly, with no interest.
    expect(plan?.current.schedule.fundedMonth).toBe(42);
    expect(plan?.current.interest).toBe(0);
    expect(plan?.current.ownFunds).toBe(1_140_000_000);
    expect(plan?.current.fundedDate).toEqual({
      year: 2030,
      month: 3,
      day: 15,
    });
  });

  it("refuses figures that are not usable", () => {
    for (const patch of [
      { target: -1 },
      { initial: -1 },
      { contribution: -1 },
      { annualRatePercent: -1 },
      { target: Number.NaN },
      { comparisonContribution: -1 },
      { comparisonContribution: Number.POSITIVE_INFINITY },
    ]) {
      expect(
        planHouseFund({ ...PLAN, ...patch }),
        JSON.stringify(patch),
      ).toBeNull();
    }
  });
});

describe("the reserve definition is not interchangeable", () => {
  it("agrees on the funding gap and disagrees on the date", () => {
    // Reserve INSIDE the target — what this module models: the whole 300
    // triệu earns the assumed rate and the goal is 1,14 tỷ.
    const inside = planHouseFund(PLAN);
    // Reserve OUTSIDE both sides: 150 triệu held back, goal 990 triệu. The
    // static gap is identical…
    const outside = planHouseFund({
      ...PLAN,
      target: 990_000_000,
      initial: 150_000_000,
    });
    expect(1_140_000_000 - 300_000_000).toBe(990_000_000 - 150_000_000);
    // …but the money held back no longer earns anything, so the dated answer
    // is strictly later. This is why the module claims no equivalence.
    expect(inside?.current.schedule.fundedMonth).toBe(46);
    expect(outside!.current.schedule.fundedMonth!).toBeGreaterThan(46);
  });
});

describe("planHouseFund — bounds and preserved regressions", () => {
  it("bounds the search before it allocates, via the shared projection", () => {
    // The cap lives in `projectSavings`, checked before its loop; this wrapper
    // adds no loop of its own.
    const plan = planHouseFund({ ...PLAN, limitMonths: MAX_PROJECTION_MONTHS });
    expect(plan?.current.schedule.limitMonths).toBe(MAX_PROJECTION_MONTHS);
    const tooBig = planHouseFund({
      ...PLAN,
      limitMonths: MAX_PROJECTION_MONTHS + 1,
    });
    expect(tooBig?.current.schedule.status).toBe("invalid");
    expect(tooBig?.current.fundedDate).toBeNull();
  });

  it("keeps the exact-integer attainment regression", () => {
    // A 1e15 goal funded by whole đồng at a zero rate is exact arithmetic, and
    // the funded cycle is 999 — not 996, and not month 0.
    const plan = planHouseFund({
      ...PLAN,
      target: 1_000_000_000_000_000,
      initial: 999_999_999_999_001,
      contribution: 1,
      annualRatePercent: 0,
    });
    expect(plan?.current.schedule.fundedMonth).toBe(999);
  });

  it("keeps the fractional-contribution regression", () => {
    // 1/60 a month toward a 1 ₫ goal funds at 60, not at 30.
    const plan = planHouseFund({
      ...PLAN,
      target: 1,
      initial: 0,
      contribution: 1 / 60,
      annualRatePercent: 0,
    });
    expect(plan?.current.schedule.fundedMonth).toBe(60);
  });

  it("returns finite figures, or none at all", () => {
    const plan = planHouseFund({ ...PLAN, annualRatePercent: 1e308 });
    // A finite input does not prove a finite output: the projection refuses it.
    expect(plan?.current.schedule.status).toBe("invalid");
    for (const value of [
      plan?.current.balance,
      plan?.current.ownFunds,
      plan?.current.interest,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });
});
