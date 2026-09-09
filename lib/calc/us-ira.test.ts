import { describe, expect, it } from "vitest";
import {
  computeUsIra,
  VERDICT_BAND_PERCENT,
  type UsIraInput,
} from "@/lib/calc/us-ira";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";

const P = RETIREMENT_LIMITS[2026];

const BASE: UsIraInput = {
  year: 2026,
  age: 35,
  annualContribution: 7_500,
  currentRatePercent: 24,
  retirementRatePercent: 22,
  returnPercent: 7,
  years: 30,
  capitalGainsRatePercent: 15,
};

const run = (over: Partial<UsIraInput> = {}) => {
  const result = computeUsIra({ ...BASE, ...over });
  if (!result) throw new Error("computeUsIra returned null");
  return result;
};

describe("computeUsIra — both sides start from identical wealth", () => {
  it("makes the two paths cost exactly the same after-tax money today", () => {
    // The identity the whole comparison rests on, and the one docs §8
    // records as broken in rent-vs-buy.ts: the traditional saver's
    // out-of-pocket plus the refund they invest equals the Roth saver's
    // out-of-pocket. Swept, because a rate-dependent slip would pass at one
    // rate and fail elsewhere.
    for (const currentRatePercent of [0, 10, 22, 24, 37, 50]) {
      for (const annualContribution of [0, 1_000, 7_500, 20_000]) {
        const r = run({ currentRatePercent, annualContribution });
        // Per year, which is the year-by-year form of the identity...
        expect(
          r.netCostTraditional + r.upfrontTaxSaving,
          `${currentRatePercent}% on ${annualContribution}`,
        ).toBeCloseTo(r.netCostRoth, 10);
        // ...and across the whole horizon, which is the form the page states.
        expect(
          r.netCostTraditional * 30 + r.sideAccountContribution,
        ).toBeCloseTo(r.totalContributed, 8);
      }
    }
  });

  it("reaches the same pre-tax balance in either account", () => {
    // Nothing about the account changes the growth; only the tax differs.
    const r = run();
    expect(r.rothAfterTax).toBe(r.balanceAtHorizon);
    expect(r.traditionalAfterTax + r.withdrawalTax).toBeCloseTo(
      r.balanceAtHorizon,
      6,
    );
    // A STREAM of contributions, one at the start of each year — the
    // annuity-due factor, not a single lump grown for thirty years.
    const annuityDue = ((Math.pow(1.07, 30) - 1) / 0.07) * 1.07;
    expect(r.growthFactor).toBeCloseTo(annuityDue, 8);
    expect(r.balanceAtHorizon).toBeCloseTo(7_500 * annuityDue, 4);
    expect(r.totalContributed).toBe(7_500 * 30);
    // The stream is worth far more than one contribution would be, which is
    // the check that catches a lump-sum implementation behind this field name.
    expect(r.balanceAtHorizon).toBeGreaterThan(7_500 * Math.pow(1.07, 30) * 10);
  });
});

describe("computeUsIra — the equal-cost verdict", () => {
  it("calls them identical when the rate never changes and the side account is untaxed", () => {
    // The algebraic core: with no drag on the side account and the same rate
    // at both ends, the two accounts are the same account.
    const r = run({
      currentRatePercent: 24,
      retirementRatePercent: 24,
      capitalGainsRatePercent: 0,
    });
    expect(r.traditionalTotalEqualCost).toBeCloseTo(r.rothAfterTax, 6);
    expect(r.rothAdvantageEqualCost).toBeCloseTo(0, 6);
    expect(r.verdict).toBe("equal");
    expect(r.breakEvenRetirementRatePercent!).toBeCloseTo(24, 8);
  });

  it("favours traditional when the retirement rate is lower", () => {
    const r = run({ currentRatePercent: 32, retirementRatePercent: 12 });
    expect(r.verdict).toBe("traditional");
    expect(r.rothAdvantageEqualCost).toBeLessThan(0);
  });

  it("favours Roth when the retirement rate is higher", () => {
    const r = run({ currentRatePercent: 12, retirementRatePercent: 32 });
    expect(r.verdict).toBe("roth");
    expect(r.rothAdvantageEqualCost).toBeGreaterThan(0);
  });

  it("puts the break-even rate BELOW today's rate once the side account is taxed", () => {
    const r = run();
    expect(r.breakEvenRetirementRatePercent!).toBeLessThan(24);
    // The closed form from the docstring, checked against the module's own
    // money figures rather than restated inside it. (A - n) is the side
    // account's taxable gain per unit contributed, so it is the stream form
    // of (G - 1) and NOT interchangeable with it: at these inputs the two
    // differ by 0,6 percentage points.
    const a = r.growthFactor;
    const expected = 24 * (1 - 0.15 * ((a - 30) / a));
    expect(r.breakEvenRetirementRatePercent!).toBeCloseTo(expected, 8);
  });

  it("makes the break-even rate the actual tie point", () => {
    // Feed it back in: at that retirement rate the two paths must be equal.
    for (const currentRatePercent of [10, 24, 37]) {
      for (const capitalGainsRatePercent of [0, 15, 20]) {
        for (const years of [1, 10, 40]) {
          const probe = run({
            currentRatePercent,
            capitalGainsRatePercent,
            years,
          });
          const at = run({
            currentRatePercent,
            capitalGainsRatePercent,
            years,
            retirementRatePercent: probe.breakEvenRetirementRatePercent!,
          });
          expect(
            at.rothAdvantageEqualCost,
            `${currentRatePercent}/${capitalGainsRatePercent}/${years}`,
          ).toBeCloseTo(0, 6);
          expect(at.verdict).toBe("equal");
        }
      }
    }
  });

  it("is monotone in the retirement rate", () => {
    // Sanity on the direction of the whole tool: a higher expected rate in
    // retirement can only help Roth.
    let previous = -Infinity;
    for (const retirementRatePercent of [0, 10, 20, 24, 30, 40, 60]) {
      const r = run({ retirementRatePercent });
      expect(r.rothAdvantageEqualCost).toBeGreaterThan(previous);
      previous = r.rothAdvantageEqualCost;
    }
  });

  it("uses a BAND for 'equal', not an equality against a float", () => {
    const r = run();
    const band = r.rothAfterTax * (VERDICT_BAND_PERCENT / 100);
    // Just inside the band on the Roth side: still "equal".
    const inside = run({
      retirementRatePercent: r.breakEvenRetirementRatePercent! + 0.05,
    });
    expect(Math.abs(inside.rothAdvantageEqualCost)).toBeLessThan(band);
    expect(inside.verdict).toBe("equal");
    // Far enough out: a verdict.
    const outside = run({
      retirementRatePercent: r.breakEvenRetirementRatePercent! + 5,
    });
    expect(outside.verdict).toBe("roth");
  });
});

describe("computeUsIra — the same-contribution framing", () => {
  it("gives Roth the whole withdrawal tax as its advantage", () => {
    const r = run();
    expect(r.rothAdvantageSameContribution).toBeCloseTo(r.withdrawalTax, 6);
    // And it cost more up front by exactly the refund that was not taken.
    expect(r.extraCostOfRoth).toBeCloseTo(r.upfrontTaxSaving, 10);
  });

  it("prices the Roth contribution as its pre-tax equivalent", () => {
    const r = run();
    expect(r.rothAsPreTaxContribution!).toBeCloseTo(7_500 / 0.76, 6);
    expect(r.rothAsPreTaxContribution!).toBeGreaterThan(7_500);
    // Which is the real advantage at the limit: the same nominal cap buys a
    // bigger sheltered contribution in a Roth.
    expect(r.rothAsPreTaxContribution!).toBeCloseTo(9_868.42, 2);
  });

  it("leaves the pre-tax equivalent equal to the contribution at a zero rate", () => {
    const r = run({ currentRatePercent: 0 });
    expect(r.rothAsPreTaxContribution).toBeCloseTo(7_500, 10);
    expect(r.upfrontTaxSaving).toBe(0);
    expect(r.sideAccountContribution).toBe(0);
    // With no deduction to invest, the equal-cost and same-contribution
    // framings coincide.
    expect(r.rothAdvantageEqualCost).toBeCloseTo(
      r.rothAdvantageSameContribution,
      6,
    );
  });

  it("returns null for the pre-tax equivalent at a 100% rate", () => {
    // The division by (1 - rate) is undefined there, and a page must not
    // print Infinity into a sentence about dollars.
    expect(run({ currentRatePercent: 100 }).rothAsPreTaxContribution).toBe(null);
  });
});

describe("computeUsIra — the side account", () => {
  it("taxes the gain and not the contribution", () => {
    const r = run();
    // The refund goes in every year, so the contributed figure is the total.
    expect(r.upfrontTaxSaving).toBeCloseTo(7_500 * 0.24, 10);
    expect(r.sideAccountContribution).toBeCloseTo(7_500 * 0.24 * 30, 10);
    expect(r.sideAccountAtHorizon).toBeCloseTo(
      r.upfrontTaxSaving * r.growthFactor,
      6,
    );
    expect(r.sideAccountGain).toBeCloseTo(
      r.sideAccountAtHorizon - r.sideAccountContribution,
      6,
    );
    expect(r.sideAccountTax).toBeCloseTo(r.sideAccountGain * 0.15, 6);
    expect(r.sideAccountAfterTax).toBeCloseTo(
      r.sideAccountAtHorizon - r.sideAccountTax,
      6,
    );
  });

  it("charges no gains tax on a loss", () => {
    // A negative return leaves no gain, and taxing a loss would be a refund
    // the module has no business inventing.
    const r = run({ returnPercent: -5 });
    expect(r.sideAccountAtHorizon).toBeLessThan(r.sideAccountContribution);
    expect(r.sideAccountGain).toBe(0);
    expect(r.sideAccountTax).toBe(0);
    expect(r.sideAccountAfterTax).toBeCloseTo(r.sideAccountAtHorizon, 6);
  });

  it("makes a higher gains rate favour Roth", () => {
    const low = run({ capitalGainsRatePercent: 0 });
    const high = run({ capitalGainsRatePercent: 20 });
    expect(high.rothAdvantageEqualCost).toBeGreaterThan(
      low.rothAdvantageEqualCost,
    );
    expect(high.breakEvenRetirementRatePercent!).toBeLessThan(
      low.breakEvenRetirementRatePercent!,
    );
  });
});

describe("computeUsIra — limits and rejections", () => {
  it("uses the year's IRA limit and adds the catch-up from 50", () => {
    expect(run({ age: 49 }).contributionLimit).toBe(P.ira);
    expect(run({ age: 50 }).contributionLimit).toBe(P.ira + P.iraCatchUp50);
    // No 60-63 window on an IRA — that is a 401(k) feature only.
    expect(run({ age: 61 }).contributionLimit).toBe(P.ira + P.iraCatchUp50);
    expect(run({ age: 61 }).catchUpAvailable).toBe(P.iraCatchUp50);
  });

  it("names an excess contribution rather than pricing it silently", () => {
    const r = run({ annualContribution: 10_000 });
    expect(r.excessContribution).toBe(10_000 - P.ira);
    const under = run({ annualContribution: 5_000 });
    expect(under.excessContribution).toBe(0);
  });

  it("refuses a year the limits table does not cover", () => {
    expect(computeUsIra({ ...BASE, year: 2019 })).toBe(null);
  });

  it("rejects impossible inputs", () => {
    expect(computeUsIra({ ...BASE, annualContribution: -1 })).toBe(null);
    expect(computeUsIra({ ...BASE, age: 121 })).toBe(null);
    expect(computeUsIra({ ...BASE, currentRatePercent: 101 })).toBe(null);
    expect(computeUsIra({ ...BASE, retirementRatePercent: -1 })).toBe(null);
    expect(computeUsIra({ ...BASE, capitalGainsRatePercent: 101 })).toBe(null);
    expect(computeUsIra({ ...BASE, returnPercent: -101 })).toBe(null);
    expect(computeUsIra({ ...BASE, years: 71 })).toBe(null);
    expect(computeUsIra({ ...BASE, years: 1.5 })).toBe(null);
  });

  it("handles a zero contribution without dividing by it", () => {
    const r = run({ annualContribution: 0 });
    expect(r.balanceAtHorizon).toBe(0);
    expect(r.rothAdvantageEqualCost).toBe(0);
    expect(r.verdict).toBe("equal");
    // No balance means no break-even rate: every rate ties.
    expect(r.breakEvenRetirementRatePercent).toBe(null);
  });

  it("contributes nothing at all over a zero-year horizon", () => {
    // A stream of no payments, not one payment held for no time.
    const r = run({ years: 0 });
    expect(r.growthFactor).toBe(0);
    expect(r.totalContributed).toBe(0);
    expect(r.balanceAtHorizon).toBe(0);
    expect(r.sideAccountGain).toBe(0);
    expect(r.verdict).toBe("equal");
    expect(r.breakEvenRetirementRatePercent).toBe(null);
  });

  it("makes a one-year horizon a single contribution", () => {
    const r = run({ years: 1 });
    expect(r.growthFactor).toBeCloseTo(1.07, 10);
    expect(r.balanceAtHorizon).toBeCloseTo(7_500 * 1.07, 6);
    expect(r.totalContributed).toBe(7_500);
    // One year of growth, so the side account's gain is one year's return.
    expect(r.sideAccountGain).toBeCloseTo(7_500 * 0.24 * 0.07, 6);
  });
});
