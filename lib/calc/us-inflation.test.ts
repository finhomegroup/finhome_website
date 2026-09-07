import { describe, expect, it } from "vitest";
import { computeUsInflation, type InflationInput } from "@/lib/calc/us-inflation";

const CPI: InflationInput = {
  mode: "cpi",
  amount: 1_000,
  // CPI-U readings the reader looks up; these are the module's inputs, not
  // shipped data. 2000 -> 2025 is a 25-year span.
  startCpi: 172.2,
  endCpi: 320,
  years: 25,
  ratePercent: 3,
};

const RATE: InflationInput = {
  mode: "rate",
  amount: 1_000,
  startCpi: 100,
  endCpi: 100,
  years: 25,
  ratePercent: 3,
};

describe("computeUsInflation — CPI mode", () => {
  it("converts by the ratio of the two readings", () => {
    const result = computeUsInflation(CPI)!;
    // 320 / 172,2 = 1,858304…
    expect(result.equivalentAmount).toBeCloseTo(1_858.3043, 4);
    expect(result.cumulativeInflationPercent).toBeCloseTo(85.83043, 4);
  });

  it("derives the annual rate from the readings and the span", () => {
    const result = computeUsInflation(CPI)!;
    // 1,858304^(1/25) − 1 = 2,50963%/năm.
    expect(result.annualRatePercent).toBeCloseTo(2.5096317, 4);
    // Round-trip: compounding the derived rate over the span must reproduce
    // the CPI ratio exactly. That check is what makes the figure trustworthy.
    const compounded = Math.pow(1 + result.annualRatePercent! / 100, 25);
    expect(compounded).toBeCloseTo(320 / 172.2, 12);
  });

  it("keeps cumulative inflation and power lost apart", () => {
    // A doubling: 100% inflation, but only 50% of purchasing power gone.
    // These two are routinely conflated and the loss is always smaller.
    const doubled = computeUsInflation({
      ...CPI,
      startCpi: 100,
      endCpi: 200,
    })!;
    expect(doubled.cumulativeInflationPercent).toBeCloseTo(100, 10);
    expect(doubled.purchasingPowerLostPercent).toBeCloseTo(50, 10);
    expect(doubled.purchasingPowerOfOne).toBeCloseTo(0.5, 10);

    // A tripling: 200% inflation, 66,67% lost.
    const tripled = computeUsInflation({
      ...CPI,
      startCpi: 100,
      endCpi: 300,
    })!;
    expect(tripled.cumulativeInflationPercent).toBeCloseTo(200, 10);
    expect(tripled.purchasingPowerLostPercent).toBeCloseTo(66.6667, 4);
  });

  it("never reports power lost above cumulative inflation", () => {
    // The invariant behind the previous test, over a wide sweep.
    for (const endCpi of [101, 120, 175, 250, 400, 1_000, 5_000]) {
      const result = computeUsInflation({ ...CPI, startCpi: 100, endCpi })!;
      expect(result.purchasingPowerLostPercent).toBeLessThan(
        result.cumulativeInflationPercent,
      );
      // And power lost can never reach 100%: money keeps some value.
      expect(result.purchasingPowerLostPercent).toBeLessThan(100);
    }
  });

  it("handles deflation", () => {
    const result = computeUsInflation({
      ...CPI,
      startCpi: 200,
      endCpi: 180,
      years: 5,
    })!;
    expect(result.deflation).toBe(true);
    expect(result.equivalentAmount).toBeCloseTo(900, 8);
    expect(result.cumulativeInflationPercent).toBeCloseTo(-10, 8);
    // Power GAINED shows as a negative loss, which is the honest sign.
    expect(result.purchasingPowerLostPercent).toBeCloseTo(-11.1111, 4);
    expect(result.purchasingPowerOfOne).toBeCloseTo(1.11111, 4);
    expect(result.annualRatePercent!).toBeLessThan(0);
    // Deflation never halves purchasing power, so there is no answer.
    expect(result.yearsToHalvePower).toBe(null);
  });

  it("handles no change at all", () => {
    const result = computeUsInflation({ ...CPI, startCpi: 250, endCpi: 250 })!;
    expect(result.equivalentAmount).toBe(1_000);
    expect(result.cumulativeInflationPercent).toBe(0);
    expect(result.annualRatePercent).toBeCloseTo(0, 12);
    expect(result.purchasingPowerLostPercent).toBe(0);
    expect(result.deflation).toBe(false);
    // A zero rate never halves anything.
    expect(result.yearsToHalvePower).toBe(null);
  });

  it("rejects a CPI reading of zero or below", () => {
    // The index has no zero point, so a 0 means the reader mistyped. A
    // ratio computed from it would look entirely plausible.
    expect(computeUsInflation({ ...CPI, startCpi: 0 })).toBe(null);
    expect(computeUsInflation({ ...CPI, endCpi: 0 })).toBe(null);
    expect(computeUsInflation({ ...CPI, startCpi: -5 })).toBe(null);
    expect(computeUsInflation({ ...CPI, endCpi: -5 })).toBe(null);
  });
});

describe("computeUsInflation — rate mode", () => {
  it("compounds the rate over the horizon", () => {
    const result = computeUsInflation(RATE)!;
    // 1,03^25 = 2,09377793…
    expect(result.equivalentAmount).toBeCloseTo(2_093.77793, 5);
    expect(result.cumulativeInflationPercent).toBeCloseTo(109.377793, 5);
    // The input rate comes back unchanged — it was given, not measured.
    expect(result.annualRatePercent).toBe(3);
  });

  it("ignores the CPI fields entirely", () => {
    const result = computeUsInflation({
      ...RATE,
      startCpi: 999,
      endCpi: 1,
    })!;
    // Those readings would imply massive deflation in CPI mode; in rate
    // mode they must have no effect at all.
    expect(result.equivalentAmount).toBeCloseTo(2_093.77793, 5);
    expect(result.deflation).toBe(false);
  });

  it("gives the halving time from the rate", () => {
    const result = computeUsInflation(RATE)!;
    // ln2 / ln1,03 = 23,4498 years.
    expect(result.yearsToHalvePower).toBeCloseTo(23.44977, 5);
    // Cross-check against the definition rather than the formula: at that
    // horizon, purchasing power must be exactly one half.
    const atHalving = computeUsInflation({
      ...RATE,
      years: result.yearsToHalvePower!,
    })!;
    expect(atHalving.purchasingPowerOfOne).toBeCloseTo(0.5, 12);
  });

  it("halves faster at higher rates", () => {
    const low = computeUsInflation({ ...RATE, ratePercent: 2 })!;
    const high = computeUsInflation({ ...RATE, ratePercent: 8 })!;
    expect(low.yearsToHalvePower).toBeCloseTo(35.00279, 5);
    expect(high.yearsToHalvePower).toBeCloseTo(9.00647, 5);
    expect(high.yearsToHalvePower!).toBeLessThan(low.yearsToHalvePower!);
  });

  it("handles a negative rate as deflation", () => {
    const result = computeUsInflation({ ...RATE, ratePercent: -2, years: 10 })!;
    // 0,98^10 = 0,81707…
    expect(result.equivalentAmount).toBeCloseTo(817.0728, 4);
    expect(result.deflation).toBe(true);
    expect(result.yearsToHalvePower).toBe(null);
  });

  it("rejects a rate at or below −100%", () => {
    // At exactly −100% prices go to zero, and purchasing power would be
    // infinite. Below it, growth turns negative — a sign error, not a fall.
    expect(computeUsInflation({ ...RATE, ratePercent: -100 })).toBe(null);
    expect(computeUsInflation({ ...RATE, ratePercent: -150 })).toBe(null);
  });
});

describe("computeUsInflation — shared validation", () => {
  it("agrees between the two modes when given matching inputs", () => {
    // The consistency check that keeps the two branches honest: a CPI pair
    // whose ratio is exactly 1,03^25 must produce rate mode's answer.
    const growth = Math.pow(1.03, 25);
    const viaCpi = computeUsInflation({
      ...CPI,
      startCpi: 100,
      endCpi: 100 * growth,
      years: 25,
    })!;
    const viaRate = computeUsInflation(RATE)!;
    expect(viaCpi.equivalentAmount).toBeCloseTo(viaRate.equivalentAmount, 8);
    expect(viaCpi.annualRatePercent).toBeCloseTo(viaRate.annualRatePercent!, 10);
    expect(viaCpi.yearsToHalvePower).toBeCloseTo(viaRate.yearsToHalvePower!, 8);
  });

  it("rejects a negative amount and a non-positive span", () => {
    expect(computeUsInflation({ ...CPI, amount: -1 })).toBe(null);
    expect(computeUsInflation({ ...CPI, years: 0 })).toBe(null);
    expect(computeUsInflation({ ...CPI, years: -5 })).toBe(null);
    expect(computeUsInflation({ ...RATE, years: 0 })).toBe(null);
  });

  it("handles a zero amount without breaking the rates", () => {
    const result = computeUsInflation({ ...CPI, amount: 0 })!;
    expect(result.equivalentAmount).toBe(0);
    // Rates are properties of the period, not of the amount, so they stand.
    expect(result.cumulativeInflationPercent).toBeCloseTo(85.83043, 4);
    expect(result.annualRatePercent).toBeCloseTo(2.5096317, 4);
  });

  it("accepts a fractional span", () => {
    // Eighteen months between two monthly CPI readings.
    const result = computeUsInflation({
      ...CPI,
      startCpi: 300,
      endCpi: 320,
      years: 1.5,
    })!;
    expect(result.cumulativeInflationPercent).toBeCloseTo(6.66667, 5);
    // Annualising a 1,5-year change gives MORE than the period figure.
    expect(result.annualRatePercent).toBeCloseTo(4.3964704, 5);
    expect(result.annualRatePercent!).toBeLessThan(
      result.cumulativeInflationPercent,
    );
  });
});
