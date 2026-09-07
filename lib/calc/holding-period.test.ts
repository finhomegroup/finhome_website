import { describe, it, expect } from "vitest";
import {
  computeHoldingPeriod,
  type HoldingPeriodInput,
} from "@/lib/calc/holding-period";

// Bought at 100 triệu, worth 118 triệu three years later, 12 triệu of
// dividends collected along the way.
const BASE: HoldingPeriodInput = {
  beginValue: 100_000_000,
  endValue: 118_000_000,
  incomeReceived: 12_000_000,
  years: 3,
};

function hpr(input: HoldingPeriodInput) {
  const result = computeHoldingPeriod(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeHoldingPeriod — the split", () => {
  it("separates the capital gain from the income", () => {
    const result = hpr(BASE);
    expect(result.capitalGain).toBe(18_000_000);
    expect(result.capitalGainYieldPercent).toBeCloseTo(18, 10);
    expect(result.incomeYieldPercent).toBeCloseTo(12, 10);
  });

  it("adds the two into the holding period return", () => {
    const result = hpr(BASE);
    expect(result.holdingPeriodReturnPercent).toBeCloseTo(30, 10);
    expect(result.holdingPeriodReturnPercent).toBeCloseTo(
      result.capitalGainYieldPercent + result.incomeYieldPercent,
      10,
    );
  });

  it("keeps the money identities", () => {
    const result = hpr(BASE);
    expect(result.totalGain).toBe(30_000_000);
    expect(result.totalProceeds).toBe(130_000_000);
    expect(result.totalProceeds - 100_000_000).toBe(result.totalGain);
    expect(result.capitalGain + 12_000_000).toBe(result.totalGain);
  });

  it("states how much of the return came from income", () => {
    expect(hpr(BASE).incomeSharePercent).toBeCloseTo(40, 10);
  });

  it("distinguishes two assets with the same total return", () => {
    // The whole reason this is a separate tool from ROI. Same 30% total,
    // completely different experience of holding it.
    const growth = hpr({ ...BASE, endValue: 130_000_000, incomeReceived: 0 });
    const income = hpr({ ...BASE, endValue: 100_000_000, incomeReceived: 30_000_000 });
    expect(growth.holdingPeriodReturnPercent).toBeCloseTo(
      income.holdingPeriodReturnPercent,
      10,
    );
    expect(growth.incomeSharePercent).toBeCloseTo(0, 10);
    expect(income.incomeSharePercent).toBeCloseTo(100, 10);
    expect(income.capitalGainYieldPercent).toBeCloseTo(0, 10);
  });

  it("handles a fall in price offset by income", () => {
    const result = hpr({
      ...BASE,
      endValue: 90_000_000,
      incomeReceived: 20_000_000,
    });
    expect(result.capitalGainYieldPercent).toBeCloseTo(-10, 10);
    expect(result.incomeYieldPercent).toBeCloseTo(20, 10);
    expect(result.holdingPeriodReturnPercent).toBeCloseTo(10, 10);
  });
});

describe("computeHoldingPeriod — annualising", () => {
  it("uses the compound rate, not the return divided by the years", () => {
    // 1,3^(1/3) − 1 = 9,1393…%. The naive 30 ÷ 3 = 10% overstates it.
    const result = hpr(BASE);
    expect(result.annualisedReturnPercent).toBeCloseTo(9.1393, 3);
    expect(result.annualisedReturnPercent!).toBeLessThan(10);
  });

  it("round-trips: compounding the annual rate reproduces the total", () => {
    const result = hpr(BASE);
    const rate = result.annualisedReturnPercent! / 100;
    expect((1 + rate) ** 3).toBeCloseTo(
      result.totalProceeds / 100_000_000,
      10,
    );
  });

  it("equals the period return over exactly one year", () => {
    const result = hpr({ ...BASE, years: 1 });
    expect(result.annualisedReturnPercent).toBeCloseTo(
      result.holdingPeriodReturnPercent,
      8,
    );
  });

  it("annualises a sub-year holding upward", () => {
    const result = hpr({
      beginValue: 100,
      endValue: 110,
      years: 0.5,
    });
    expect(result.annualisedReturnPercent).toBeCloseTo(21, 8);
  });

  it("is null when no period was given", () => {
    const result = hpr({ ...BASE, years: undefined });
    expect(result.holdingPeriodReturnPercent).toBeCloseTo(30, 10);
    expect(result.annualisedReturnPercent).toBeNull();
    expect(result.years).toBeNull();
  });

  it("is null on a total wipeout", () => {
    const result = hpr({
      beginValue: 100_000_000,
      endValue: 0,
      incomeReceived: 0,
      years: 2,
    });
    expect(result.holdingPeriodReturnPercent).toBe(-100);
    expect(result.annualisedReturnPercent).toBeNull();
  });

  it("still annualises a wipeout that paid income first", () => {
    // Not a total loss: some money came back, so a rate exists.
    const result = hpr({
      beginValue: 100_000_000,
      endValue: 0,
      incomeReceived: 30_000_000,
      years: 2,
    });
    expect(result.annualisedReturnPercent).not.toBeNull();
    expect(result.annualisedReturnPercent!).toBeLessThan(0);
  });
});

describe("computeHoldingPeriod — edges and rejection", () => {
  it("reports a flat holding as zero everywhere", () => {
    const result = hpr({
      beginValue: 100,
      endValue: 100,
      incomeReceived: 0,
      years: 1,
    });
    expect(result.holdingPeriodReturnPercent).toBe(0);
    expect(result.annualisedReturnPercent).toBeCloseTo(0, 10);
    // No total gain means the income share is undefined, not 0%.
    expect(result.incomeSharePercent).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeHoldingPeriod({ ...BASE, beginValue: 0 })).toBeNull();
    expect(computeHoldingPeriod({ ...BASE, beginValue: -1 })).toBeNull();
    expect(computeHoldingPeriod({ ...BASE, endValue: -1 })).toBeNull();
    expect(computeHoldingPeriod({ ...BASE, incomeReceived: -1 })).toBeNull();
    expect(computeHoldingPeriod({ ...BASE, years: -1 })).toBeNull();
    expect(computeHoldingPeriod({ ...BASE, beginValue: Number.NaN })).toBeNull();
    expect(
      computeHoldingPeriod({ ...BASE, years: Number.POSITIVE_INFINITY }),
    ).toBeNull();
  });
});
