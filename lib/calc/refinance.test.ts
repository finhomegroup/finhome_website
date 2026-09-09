import { describe, it, expect } from "vitest";
import { compareRefinance, type RefinanceInput } from "@/lib/calc/refinance";
import { computeLoan } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

// 1,5 tỷ outstanding, 11%/năm with 18 years to run, refinanced at 8,5% over
// the same 18 years, for 30 triệu of fees.
const BASE: RefinanceInput = {
  balance: 1_500_000_000,
  currentRatePercent: 11,
  remainingMonths: 216,
  newRatePercent: 8.5,
  newTermMonths: 216,
  closingCosts: 30_000_000,
};

function refi(input: RefinanceInput) {
  const result = compareRefinance(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("compareRefinance — the two loans", () => {
  it("prices the current loan as its remaining balance over its remaining term", () => {
    const result = refi(BASE);
    expect(result.currentPayment).toBeCloseTo(
      Math.abs(pmt(11 / 100 / 12, 216, 1_500_000_000)),
      6,
    );
    const direct = computeLoan({
      amount: 1_500_000_000,
      annualRatePercent: 11,
      termMonths: 216,
    })!;
    expect(result.currentRemainingInterest).toBeCloseTo(direct.totalInterest, 6);
  });

  it("prices the new loan on the same balance", () => {
    const result = refi(BASE);
    expect(result.newPayment).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 216, 1_500_000_000)),
      6,
    );
  });

  it("keeps the saving identities", () => {
    const result = refi(BASE);
    expect(result.monthlySaving).toBeCloseTo(
      result.currentPayment - result.newPayment,
      6,
    );
    expect(result.interestSaving).toBeCloseTo(
      result.currentRemainingInterest - result.newTotalInterest,
      6,
    );
    expect(result.lifetimeSaving).toBeCloseTo(
      result.interestSaving - result.closingCosts,
      6,
    );
  });
});

describe("compareRefinance — a genuinely good refinance", () => {
  it("cuts both the instalment and the total interest", () => {
    const result = refi(BASE);
    expect(result.monthlySaving).toBeGreaterThan(0);
    expect(result.interestSaving).toBeGreaterThan(0);
    expect(result.lifetimeSaving).toBeGreaterThan(0);
  });

  it("breaks even within a plausible number of months", () => {
    const result = refi(BASE);
    expect(result.breakEvenMonths).toBeGreaterThan(0);
    expect(result.breakEvenMonths!).toBeLessThan(24);
  });

  it("rounds break-even UP", () => {
    const result = refi(BASE);
    const exact = result.closingCosts / result.monthlySaving;
    // Equal terms, so the level saving holds for the whole horizon and the
    // month-by-month answer coincides with ceil(cost ÷ saving). It does NOT
    // coincide when the new term is shorter — see the shortened-term tests.
    expect(result.breakEvenMonths).toBe(Math.ceil(exact));
    // And the rounded month is genuinely enough to cover the costs.
    expect(result.monthlySaving * result.breakEvenMonths!).toBeGreaterThanOrEqual(
      result.closingCosts,
    );
  });

  it("does not extend the term when the term is unchanged", () => {
    const result = refi(BASE);
    expect(result.termExtended).toBe(false);
    expect(result.termShortened).toBe(false);
    expect(result.termChangeMonths).toBe(0);
  });
});

describe("compareRefinance — the reset-the-term trap", () => {
  it("lowers the instalment while costing MORE interest overall", () => {
    // The whole reason both figures are reported. 18 years left, refinanced
    // into a fresh 25-year term at a lower rate: cheaper every month, dearer
    // in total.
    const result = refi({ ...BASE, newTermMonths: 300 });
    expect(result.monthlySaving).toBeGreaterThan(0);
    expect(result.interestSaving).toBeLessThan(0);
    expect(result.lifetimeSaving).toBeLessThan(0);
    expect(result.termExtended).toBe(true);
    expect(result.termChangeMonths).toBe(84);
  });

  it("still reports a break-even, which is why break-even alone is not enough", () => {
    // Break-even is short and positive here, and following it would be wrong.
    const result = refi({ ...BASE, newTermMonths: 300 });
    expect(result.breakEvenMonths).toBeGreaterThan(0);
    expect(result.lifetimeSaving).toBeLessThan(0);
  });

  it("saves more in total on a SHORTER new term, at a higher instalment", () => {
    const result = refi({ ...BASE, newTermMonths: 180 });
    expect(result.termExtended).toBe(false);
    expect(result.termShortened).toBe(true);
    expect(result.termChangeMonths).toBe(-36);
    expect(result.interestSaving).toBeGreaterThan(refi(BASE).interestSaving);
    expect(result.monthlySaving).toBeLessThan(refi(BASE).monthlySaving);
  });
});

describe("compareRefinance — a SHORTER new term", () => {
  it("does not report a break-even past the end of the new loan", () => {
    // 1,5 tỷ at 11% with 216 months left, refinanced at 9,75% over 180 months
    // for 60 triệu. The instalment barely moves (85.305 ₫/tháng), so
    // ceil(cost ÷ saving) gave 704 months — on a loan that is fully repaid at
    // month 180. From month 181 the new loan is gone and the saving is the
    // WHOLE old instalment of 15.975.745 ₫, so the running total goes
    // −44.645.155 at 180 → +3.282.079 at 183. Hand-checked month by month.
    const result = refi({
      ...BASE,
      newRatePercent: 9.75,
      newTermMonths: 180,
      closingCosts: 60_000_000,
    });
    expect(result.termExtended).toBe(false);
    expect(result.termShortened).toBe(true);
    expect(result.monthlySaving).toBeGreaterThan(0);
    expect(result.breakEvenMonths).toBe(183);
    expect(result.breakEvenMonths!).toBeLessThanOrEqual(Math.max(216, 180));
  });

  it("never reports a break-even beyond the longer of the two terms", () => {
    // The property the closed form violated, swept rather than spot-checked:
    // 13 of these 128 combinations returned a break-even past the end of both
    // loans before the fix (worst: 8,5% over 155 months for 30 triệu, which
    // reported 17.710 months).
    for (const newRatePercent of [8.5, 9.75, 10.5, 10.9]) {
      for (const newTermMonths of [120, 150, 155, 180, 200, 216, 240, 300]) {
        for (const closingCosts of [0, 30_000_000, 60_000_000, 120_000_000]) {
          const result = refi({
            ...BASE,
            newRatePercent,
            newTermMonths,
            closingCosts,
          });
          if (result.breakEvenMonths !== null) {
            expect(result.breakEvenMonths).toBeLessThanOrEqual(
              Math.max(216, newTermMonths),
            );
          }
        }
      }
    }
  });

  it("declines a break-even when the payments avoided never cover the costs", () => {
    // The instalment DOES fall here, so the closed form still produced a
    // number (7034). But 600 triệu of fees against a lifetime saving of
    // −9.518.348 ₫ is never recovered, so the honest answer is no answer.
    const result = refi({
      ...BASE,
      newRatePercent: 9.75,
      newTermMonths: 180,
      closingCosts: 600_000_000,
    });
    expect(result.monthlySaving).toBeGreaterThan(0);
    expect(result.lifetimeSaving).toBeLessThan(0);
    expect(result.breakEvenMonths).toBeNull();
  });

  it("ends the cumulative saving exactly at lifetimeSaving", () => {
    // Both loans retire the same principal, so the payments avoided over the
    // whole horizon ARE the interest saving. This is the identity the
    // month-by-month loop sums, so it has to close. 2 dp: the two sides differ
    // by 4e-5 ₫, the last-row nudge inside computeLoan.
    const result = refi({ ...BASE, newTermMonths: 180 });
    const total =
      result.currentPayment * 216 - result.newPayment * 180 - result.closingCosts;
    expect(total).toBeCloseTo(result.lifetimeSaving, 2);
  });
});

describe("compareRefinance — refinances not worth doing", () => {
  it("returns a null break-even when the instalment does not fall", () => {
    // Same rate, shorter term: the payment rises, so there is nothing to
    // break even on even though total interest falls.
    const result = refi({
      ...BASE,
      newRatePercent: 11,
      newTermMonths: 120,
    });
    expect(result.monthlySaving).toBeLessThan(0);
    expect(result.breakEvenMonths).toBeNull();
    expect(result.interestSaving).toBeGreaterThan(0);
  });

  it("reports negative savings when the new rate is worse", () => {
    const result = refi({ ...BASE, newRatePercent: 13 });
    expect(result.monthlySaving).toBeLessThan(0);
    expect(result.interestSaving).toBeLessThan(0);
    expect(result.breakEvenMonths).toBeNull();
  });

  it("is neutral on identical terms except for the fees", () => {
    const result = refi({
      ...BASE,
      newRatePercent: 11,
      newTermMonths: 216,
    });
    expect(result.monthlySaving).toBeCloseTo(0, 6);
    expect(result.interestSaving).toBeCloseTo(0, 4);
    expect(result.lifetimeSaving).toBeCloseTo(-30_000_000, 4);
    // A zero monthly saving is not a positive one: no break-even.
    expect(result.breakEvenMonths).toBeNull();
  });

  it("treats zero fees as an instant break-even", () => {
    const result = refi({ ...BASE, closingCosts: 0 });
    // Month 0 comes from the check before the month-by-month loop, not from
    // the loop: with nothing to recover the costs are covered before the first
    // instalment falls due, so no month has to complete.
    expect(result.breakEvenMonths).toBe(0);
    expect(result.lifetimeSaving).toBeCloseTo(result.interestSaving, 6);
  });
});

describe("compareRefinance — realistic terms and rejection", () => {
  it("survives 240, 300 and 360 monthly periods on either side", () => {
    for (const months of [240, 300, 360]) {
      expect(refi({ ...BASE, remainingMonths: months }).currentPayment).toBeGreaterThan(0);
      expect(refi({ ...BASE, newTermMonths: months }).newPayment).toBeGreaterThan(0);
    }
  });

  it("returns null rather than a guess", () => {
    expect(compareRefinance({ ...BASE, balance: 0 })).toBeNull();
    expect(compareRefinance({ ...BASE, balance: -1 })).toBeNull();
    expect(compareRefinance({ ...BASE, currentRatePercent: -1 })).toBeNull();
    expect(compareRefinance({ ...BASE, newRatePercent: -1 })).toBeNull();
    expect(compareRefinance({ ...BASE, remainingMonths: 0 })).toBeNull();
    expect(compareRefinance({ ...BASE, newTermMonths: 0 })).toBeNull();
    expect(compareRefinance({ ...BASE, remainingMonths: 216.5 })).toBeNull();
    expect(compareRefinance({ ...BASE, closingCosts: -1 })).toBeNull();
    expect(compareRefinance({ ...BASE, balance: Number.NaN })).toBeNull();
  });
});
