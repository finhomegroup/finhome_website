import { describe, expect, it } from "vitest";
import { computeUsTbill, type TbillInput } from "@/lib/calc/us-tbill";

const BASE: TbillInput = {
  faceValue: 10_000,
  discountRatePercent: 5,
  daysToMaturity: 91,
  federalRatePercent: 24,
  stateRatePercent: 5,
};

describe("computeUsTbill", () => {
  it("prices on the 360-day discount basis", () => {
    const result = computeUsTbill(BASE)!;
    // 10.000 x (1 − 0,05 x 91/360) = 10.000 x 0,98736111… = 9.873,611…
    expect(result.price).toBeCloseTo(9_873.6111111, 6);
    expect(result.discountAmount).toBeCloseTo(126.3888889, 6);
  });

  it("earns more than the quoted rate, for two compounding reasons", () => {
    const result = computeUsTbill(BASE)!;
    // 126,3889 / 9.873,611 = 1,280068% over 91 days.
    expect(result.periodReturnPercent).toBeCloseTo(1.28006752, 6);
    // Annualised on 365: 5,1343%. The quote said 5,00%.
    expect(result.investmentYieldPercent).toBeCloseTo(5.1343368, 5);
    expect(result.quoteUnderstatementPoints).toBeCloseTo(0.1343368, 5);
    expect(result.investmentYieldPercent!).toBeGreaterThan(5);
  });

  it("attributes the gap to price-vs-face and 365-vs-360, in that size order", () => {
    const result = computeUsTbill(BASE)!;
    // Reason 1 alone: annualise on 360 but divide by price, not face.
    const priceBasisOnly = (126.3888889 / 9_873.6111111) * (360 / 91) * 100;
    // Reason 2 alone: keep face as the base but use a 365-day year.
    const dayBasisOnly = (126.3888889 / 10_000) * (365 / 91) * 100;
    expect(priceBasisOnly).toBeCloseTo(5.0640034, 5);
    expect(dayBasisOnly).toBeCloseTo(5.0694444, 5);
    // Neither reason alone gets there: 0,0640 and 0,0694 points against a
    // combined 0,1343. They very nearly add, and slightly more than add,
    // which is what "compound" means here.
    expect(priceBasisOnly - 5 + (dayBasisOnly - 5)).toBeLessThan(
      result.quoteUnderstatementPoints!,
    );
    expect(result.investmentYieldPercent!).toBeGreaterThan(priceBasisOnly);
    expect(result.investmentYieldPercent!).toBeGreaterThan(dayBasisOnly);
  });

  it("orders the three yields by compounding frequency, and only below 182,5 days", () => {
    // All three are NOMINAL rates for the same annual growth G, at m = 365/t,
    // 2 and 1 compoundings a year: j(m) = m × (G^(1/m) − 1), which DECREASES
    // as m rises. So simple < semiannual holds only while 365/t > 2.
    const short = computeUsTbill(BASE)!; // 91 days
    expect(short.investmentYieldPercent!).toBeLessThan(
      short.bondEquivalentYieldPercent!,
    );
    expect(short.bondEquivalentYieldPercent!).toBeLessThan(
      short.effectiveAnnualYieldPercent!,
    );
    expect(short.effectiveAnnualYieldPercent).toBeCloseTo(5.2341341, 5);

    // 364 days is the 52-week bill daysHelp advertises, so this is a shipped
    // case, not an edge one. Past 182,5 days the first inequality flips.
    const long = computeUsTbill({ ...BASE, daysToMaturity: 364 })!;
    expect(long.investmentYieldPercent).toBeCloseTo(5.3393798, 6);
    expect(long.bondEquivalentYieldPercent).toBeCloseTo(5.2703228, 6);
    expect(long.effectiveAnnualYieldPercent).toBeCloseTo(5.3397636, 6);
    expect(long.bondEquivalentYieldPercent!).toBeLessThan(
      long.investmentYieldPercent!,
    );
    // Semiannual < annual survives at every term.
    expect(long.bondEquivalentYieldPercent!).toBeLessThan(
      long.effectiveAnnualYieldPercent!,
    );

    // The boundary: at exactly 365 days simple and annual coincide, and past
    // it the simple figure overtakes the annual one too.
    const year = computeUsTbill({ ...BASE, daysToMaturity: 365 })!;
    expect(year.investmentYieldPercent).toBeCloseTo(
      year.effectiveAnnualYieldPercent!,
      10,
    );
    const leap = computeUsTbill({ ...BASE, daysToMaturity: 366 })!;
    expect(leap.investmentYieldPercent!).toBeGreaterThan(
      leap.effectiveAnnualYieldPercent!,
    );
  });

  it("reproduces the Treasury investment rate for a short bill", () => {
    // 31 CFR 356 App B §I.B, term of half a year or less:
    //   i = [(100 − P)/P] × (y/r) — SIMPLE actual/365, no compounding.
    // Algebraically identical to investmentYieldPercent, so only float
    // residue separates them (worst observed 1,3e-13, at 13 days).
    for (const daysToMaturity of [13, 28, 56, 91, 182]) {
      const result = computeUsTbill({ ...BASE, daysToMaturity })!;
      const pricePer100 = result.price / 100;
      const cfr =
        ((100 - pricePer100) / pricePer100) * (365 / daysToMaturity) * 100;
      expect(result.investmentYieldPercent).toBeCloseTo(cfr, 10);
      // The bond-equivalent yield is a DIFFERENT quantity and must never be
      // mistaken for the Treasury's figure — it compounds inside the stub.
      expect(result.bondEquivalentYieldPercent!).toBeGreaterThan(cfr);
    }
    // Auction cross-check against a published result: a 4-week bill at a
    // 5,270% discount has a published investment rate of 5,37%.
    const fourWeek = computeUsTbill({
      ...BASE,
      discountRatePercent: 5.27,
      daysToMaturity: 28,
    })!;
    expect(fourWeek.investmentYieldPercent).toBeCloseTo(5.3652, 4);
  });

  it("round-trips the bond-equivalent yield back to the bill's growth", () => {
    // The derivation check: compounding the reported rate semiannually over
    // the bill's own term must reproduce face/price exactly. This is what
    // replaces transcribing the Treasury's quadratic.
    const result = computeUsTbill(BASE)!;
    const rate = result.bondEquivalentYieldPercent! / 100;
    const periods = BASE.daysToMaturity / 182.5;
    expect(Math.pow(1 + rate / 2, periods)).toBeCloseTo(
      BASE.faceValue / result.price,
      12,
    );
  });

  it("round-trips the effective annual yield too", () => {
    const result = computeUsTbill(BASE)!;
    const rate = result.effectiveAnnualYieldPercent! / 100;
    expect(Math.pow(1 + rate, BASE.daysToMaturity / 365)).toBeCloseTo(
      BASE.faceValue / result.price,
      12,
    );
  });

  it("flags a 52-week bill as beyond the short-bill rule", () => {
    const short = computeUsTbill({ ...BASE, daysToMaturity: 182 })!;
    expect(short.beyondShortBillRule).toBe(false);
    const long = computeUsTbill({ ...BASE, daysToMaturity: 364 })!;
    expect(long.beyondShortBillRule).toBe(true);
    // The longer bill costs less and earns more in absolute terms.
    expect(long.price).toBeLessThan(short.price);
    expect(long.discountAmount).toBeGreaterThan(short.discountAmount);
  });

  it("charges federal tax on the discount and no state tax", () => {
    const result = computeUsTbill(BASE)!;
    expect(result.federalTax).toBeCloseTo(126.3888889 * 0.24, 6);
    expect(result.afterTaxProfit).toBeCloseTo(126.3888889 * 0.76, 6);
    expect(result.afterTaxYieldPercent).toBeCloseTo(
      result.investmentYieldPercent! * 0.76,
      8,
    );
    // The state rate never reduces the bill's own return: Treasury interest
    // is state-exempt. It only appears in the equivalent-yield comparison.
    const noState = computeUsTbill({ ...BASE, stateRatePercent: 0 })!;
    expect(noState.afterTaxProfit).toBeCloseTo(result.afterTaxProfit, 8);
    expect(noState.afterTaxYieldPercent).toBeCloseTo(
      result.afterTaxYieldPercent!,
      8,
    );
  });

  it("prices the state exemption as a required taxable yield", () => {
    const result = computeUsTbill(BASE)!;
    // A state-taxable instrument keeps 95%, so it must pay 5,1343/0,95.
    expect(result.taxableEquivalentYieldPercent).toBeCloseTo(5.4045650, 5);
    expect(result.taxableEquivalentYieldPercent!).toBeGreaterThan(
      result.investmentYieldPercent!,
    );

    // In a no-income-tax state the exemption is worth nothing, and the two
    // figures must coincide rather than differ by a rounding artefact.
    const noTax = computeUsTbill({ ...BASE, stateRatePercent: 0 })!;
    expect(noTax.taxableEquivalentYieldPercent).toBeCloseTo(
      noTax.investmentYieldPercent!,
      10,
    );

    // A high-tax state makes the exemption worth much more.
    const california = computeUsTbill({ ...BASE, stateRatePercent: 13.3 })!;
    expect(california.taxableEquivalentYieldPercent).toBeCloseTo(5.9219570, 5);
  });

  it("leaves federal tax out of the state-exemption comparison", () => {
    // Federal tax applies to the bill AND to the alternative, so it must
    // cancel. If it did not, the exemption's value would move with a rate
    // that has nothing to do with it.
    const low = computeUsTbill({ ...BASE, federalRatePercent: 10 })!;
    const high = computeUsTbill({ ...BASE, federalRatePercent: 37 })!;
    expect(low.taxableEquivalentYieldPercent).toBeCloseTo(
      high.taxableEquivalentYieldPercent!,
      10,
    );
  });

  it("handles a zero discount rate as a zero return", () => {
    const result = computeUsTbill({ ...BASE, discountRatePercent: 0 })!;
    expect(result.price).toBe(10_000);
    expect(result.discountAmount).toBe(0);
    expect(result.periodReturnPercent).toBe(0);
    expect(result.investmentYieldPercent).toBe(0);
    expect(result.effectiveAnnualYieldPercent).toBe(0);
    expect(result.federalTax).toBe(0);
    // The quote and the yield agree only here.
    expect(result.quoteUnderstatementPoints).toBe(0);
  });

  it("rejects a discount that would zero or invert the price", () => {
    // At 400% over 91 days the formula gives a price of exactly 0; past it,
    // negative. Both are rejected rather than clamped, because every yield
    // would divide by zero and the page would be dashes with no reason.
    expect(
      computeUsTbill({ ...BASE, discountRatePercent: 400, daysToMaturity: 90 }),
    ).toBe(null);
    expect(computeUsTbill({ ...BASE, discountRatePercent: 500 })).toBe(null);
  });

  it("rejects impossible terms and face values", () => {
    expect(computeUsTbill({ ...BASE, daysToMaturity: 0 })).toBe(null);
    expect(computeUsTbill({ ...BASE, daysToMaturity: -30 })).toBe(null);
    expect(computeUsTbill({ ...BASE, daysToMaturity: 91.5 })).toBe(null);
    expect(computeUsTbill({ ...BASE, daysToMaturity: 400 })).toBe(null);
    expect(computeUsTbill({ ...BASE, faceValue: 0 })).toBe(null);
    expect(computeUsTbill({ ...BASE, faceValue: -1_000 })).toBe(null);
    expect(computeUsTbill({ ...BASE, federalRatePercent: 101 })).toBe(null);
    expect(computeUsTbill({ ...BASE, stateRatePercent: -1 })).toBe(null);
    // 366 days is accepted: a 52-week bill settling across a leap day.
    expect(computeUsTbill({ ...BASE, daysToMaturity: 366 })).not.toBe(null);
  });

  it("scales linearly with face value", () => {
    const small = computeUsTbill({ ...BASE, faceValue: 1_000 })!;
    const large = computeUsTbill({ ...BASE, faceValue: 1_000_000 })!;
    expect(large.price).toBeCloseTo(small.price * 1_000, 6);
    expect(large.discountAmount).toBeCloseTo(small.discountAmount * 1_000, 6);
    // Yields are rates, so they do not move with size at all.
    expect(large.investmentYieldPercent).toBeCloseTo(
      small.investmentYieldPercent!,
      10,
    );
  });
});
