import { describe, expect, it } from "vitest";
import {
  computeUsMortgageDeduction,
  ACQUISITION_CAP_CURRENT,
  type MortgageDeductionInput,
} from "@/lib/calc/us-mortgage-deduction";

const BASE: MortgageDeductionInput = {
  loanBalance: 400_000,
  annualInterest: 24_000,
  vintage: "current",
  filingStatus: "jointOrOther",
  otherItemized: 8_000,
  standardDeduction: 30_000,
  marginalRatePercent: 24,
};

describe("computeUsMortgageDeduction", () => {
  it("gives a partial benefit when the interest tips the filer into itemising", () => {
    const result = computeUsMortgageDeduction(BASE)!;
    // Itemised with interest: 8.000 + 24.000 = 32.000, against a 30.000
    // standard deduction. Only the 2.000 EXCESS is bought by the mortgage.
    expect(result.itemizedWithInterest).toBe(32_000);
    expect(result.effectiveDeduction).toBe(2_000);
    expect(result.taxSaving).toBeCloseTo(480, 6);
    expect(result.itemizes).toBe(true);
    expect(result.interestCausesItemizing).toBe(true);
  });

  it("shows how badly the naive calculation overstates that case", () => {
    const result = computeUsMortgageDeduction(BASE)!;
    // interest x rate = 24.000 x 24% = 5.760, against an actual 480.
    expect(result.naiveSaving).toBeCloseTo(5_760, 6);
    expect(result.naiveOverstatement).toBeCloseTo(5_280, 6);
    // Twelve times the real benefit.
    expect(result.naiveSaving / result.taxSaving).toBeCloseTo(12, 6);
  });

  it("gives NOTHING to a filer who still takes the standard deduction", () => {
    // The common post-2018 case: interest plus other deductions do not
    // reach the standard deduction, so the mortgage saves nothing at all.
    const result = computeUsMortgageDeduction({
      ...BASE,
      annualInterest: 15_000,
      otherItemized: 5_000,
    })!;
    expect(result.itemizedWithInterest).toBe(20_000);
    expect(result.itemizes).toBe(false);
    expect(result.effectiveDeduction).toBe(0);
    expect(result.taxSaving).toBe(0);
    expect(result.savingAsPercentOfInterest).toBe(0);
    // And the naive figure would have claimed 3.600.
    expect(result.naiveSaving).toBeCloseTo(3_600, 6);
    expect(result.naiveOverstatement).toBeCloseTo(3_600, 6);
    // The effective rate is then exactly the stated rate: no benefit.
    expect(result.afterTaxInterest).toBe(15_000);
  });

  it("gives the full benefit to a filer already itemising without it", () => {
    // Other deductions alone clear the standard deduction, so every dollar
    // of interest is a dollar of extra deduction. Only here is the naive
    // answer right.
    const result = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 35_000,
    })!;
    expect(result.itemizedWithoutInterest).toBe(35_000);
    expect(result.effectiveDeduction).toBe(24_000);
    expect(result.taxSaving).toBeCloseTo(5_760, 6);
    expect(result.naiveOverstatement).toBeCloseTo(0, 6);
    expect(result.savingAsPercentOfInterest).toBeCloseTo(24, 8);
    expect(result.interestCausesItemizing).toBe(false);
  });

  it("never lets the saving exceed the naive figure", () => {
    // The invariant across the whole space: the honest answer is bounded
    // above by rate x interest, and equals it only in the case above.
    for (const otherItemized of [0, 5_000, 20_000, 29_999, 30_000, 50_000]) {
      for (const annualInterest of [0, 1_000, 24_000, 60_000]) {
        const result = computeUsMortgageDeduction({
          ...BASE,
          otherItemized,
          annualInterest,
        })!;
        expect(result.taxSaving).toBeLessThanOrEqual(result.naiveSaving + 1e-9);
        expect(result.taxSaving).toBeGreaterThanOrEqual(0);
        expect(result.effectiveDeduction).toBeLessThanOrEqual(
          result.deductibleInterest + 1e-9,
        );
      }
    }
  });

  it("prorates interest by the acquisition-debt cap", () => {
    const result = computeUsMortgageDeduction({
      ...BASE,
      loanBalance: 1_000_000,
      annualInterest: 50_000,
      otherItemized: 40_000,
    })!;
    expect(result.cap).toBe(ACQUISITION_CAP_CURRENT);
    // 750.000 / 1.000.000 = 75% of the interest is deductible.
    expect(result.deductibleShare).toBeCloseTo(0.75, 10);
    expect(result.deductibleInterest).toBeCloseTo(37_500, 6);
    expect(result.disallowedInterest).toBeCloseTo(12_500, 6);
    // Already itemising, so the full deductible amount counts — but the
    // saving is on 37.500, not 50.000.
    expect(result.taxSaving).toBeCloseTo(37_500 * 0.24, 6);
    // The saving as a share of interest PAID is below the marginal rate,
    // because a quarter of the interest bought nothing.
    expect(result.savingAsPercentOfInterest).toBeCloseTo(18, 8);
  });

  it("uses the grandfathered cap for older debt", () => {
    const older = computeUsMortgageDeduction({
      ...BASE,
      loanBalance: 1_000_000,
      annualInterest: 50_000,
      otherItemized: 40_000,
      vintage: "grandfathered",
    })!;
    expect(older.cap).toBe(1_000_000);
    // The whole balance is within the cap, so nothing is disallowed.
    expect(older.deductibleShare).toBe(1);
    expect(older.disallowedInterest).toBe(0);
    expect(older.taxSaving).toBeCloseTo(50_000 * 0.24, 6);
  });

  it("halves both acquisition-debt caps for married filing separately", () => {
    const current = computeUsMortgageDeduction({
      ...BASE,
      loanBalance: 750_000,
      annualInterest: 45_000,
      otherItemized: 40_000,
      filingStatus: "marriedSeparate",
    })!;
    expect(current.cap).toBe(375_000);
    expect(current.deductibleInterest).toBeCloseTo(22_500, 6);

    const older = computeUsMortgageDeduction({
      ...BASE,
      loanBalance: 1_000_000,
      annualInterest: 50_000,
      vintage: "grandfathered",
      filingStatus: "marriedSeparate",
    })!;
    expect(older.cap).toBe(500_000);
    expect(older.deductibleInterest).toBeCloseTo(25_000, 6);
  });

  it("does not prorate a balance inside the cap", () => {
    const result = computeUsMortgageDeduction(BASE)!;
    expect(result.deductibleShare).toBe(1);
    expect(result.deductibleInterest).toBe(24_000);
    expect(result.disallowedInterest).toBe(0);
  });

  it("lowers the effective rate only by what the deduction is worth", () => {
    const tips = computeUsMortgageDeduction(BASE)!;
    // 24.000 interest on 400.000 is 6,00% stated. The 480 saving takes it
    // to 5,88% — not to the 4,56% the naive calculation would imply.
    expect(24_000 / 400_000).toBeCloseTo(0.06, 10);
    expect(tips.effectiveRatePercent).toBeCloseTo(5.88, 8);

    const noBenefit = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 0,
      annualInterest: 20_000,
    })!;
    // No benefit at all, so the effective rate is exactly the stated one.
    expect(noBenefit.effectiveRatePercent).toBeCloseTo(5, 8);

    const fullBenefit = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 35_000,
    })!;
    expect(fullBenefit.effectiveRatePercent).toBeCloseTo(4.56, 8);
  });

  it("treats a deduction exactly equal to the standard as no benefit", () => {
    // The boundary: itemising to precisely the standard deduction buys
    // nothing, and `itemizes` must be false rather than true-by-tie.
    const result = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 6_000,
      annualInterest: 24_000,
    })!;
    expect(result.itemizedWithInterest).toBe(30_000);
    expect(result.itemizes).toBe(false);
    expect(result.effectiveDeduction).toBe(0);
    expect(result.taxSaving).toBe(0);
  });

  it("gives no benefit at a zero marginal rate", () => {
    const result = computeUsMortgageDeduction({
      ...BASE,
      marginalRatePercent: 0,
    })!;
    // The deduction still exists; it is just worth nothing.
    expect(result.effectiveDeduction).toBe(2_000);
    expect(result.taxSaving).toBe(0);
    expect(result.naiveSaving).toBe(0);
  });

  it("scales the benefit with the marginal rate", () => {
    const low = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 35_000,
      marginalRatePercent: 12,
    })!;
    const high = computeUsMortgageDeduction({
      ...BASE,
      otherItemized: 35_000,
      marginalRatePercent: 37,
    })!;
    expect(low.taxSaving).toBeCloseTo(24_000 * 0.12, 6);
    expect(high.taxSaving).toBeCloseTo(24_000 * 0.37, 6);
    // The deduction itself does not move with the rate — only its value.
    expect(low.effectiveDeduction).toBe(high.effectiveDeduction);
  });

  it("handles a paid-off mortgage", () => {
    const result = computeUsMortgageDeduction({
      ...BASE,
      loanBalance: 0,
      annualInterest: 0,
    })!;
    expect(result.taxSaving).toBe(0);
    // No interest paid means no percentage to report, and no balance means
    // no effective rate.
    expect(result.savingAsPercentOfInterest).toBe(null);
    expect(result.effectiveRatePercent).toBe(null);
  });

  it("rejects interest on no balance, and negative money", () => {
    // Interest cannot accrue on nothing; the cap share would be undefined.
    expect(
      computeUsMortgageDeduction({ ...BASE, loanBalance: 0 }),
    ).toBe(null);
    expect(computeUsMortgageDeduction({ ...BASE, loanBalance: -1 })).toBe(null);
    expect(computeUsMortgageDeduction({ ...BASE, annualInterest: -1 })).toBe(
      null,
    );
    expect(computeUsMortgageDeduction({ ...BASE, otherItemized: -1 })).toBe(
      null,
    );
    expect(
      computeUsMortgageDeduction({ ...BASE, standardDeduction: -1 }),
    ).toBe(null);
    expect(
      computeUsMortgageDeduction({ ...BASE, marginalRatePercent: 101 }),
    ).toBe(null);
  });

  it("adds up", () => {
    const result = computeUsMortgageDeduction(BASE)!;
    expect(result.deductibleInterest + result.disallowedInterest).toBeCloseTo(
      BASE.annualInterest,
      6,
    );
    expect(result.afterTaxInterest).toBeCloseTo(
      BASE.annualInterest - result.taxSaving,
      6,
    );
    expect(result.itemizedWithInterest).toBeCloseTo(
      result.itemizedWithoutInterest + result.deductibleInterest,
      6,
    );
  });
});
