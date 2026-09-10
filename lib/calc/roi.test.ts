import { describe, it, expect } from "vitest";
import { computeRoi, type RoiInput } from "@/lib/calc/roi";

const BASE: RoiInput = {
  cost: 500_000_000,
  finalValue: 700_000_000,
  years: 3,
};

function roi(input: RoiInput) {
  const result = computeRoi(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeRoi — plain ROI", () => {
  it("states the gain and the return on it", () => {
    const result = roi(BASE);
    expect(result.gain).toBe(200_000_000);
    expect(result.roiPercent).toBeCloseTo(40, 10);
    expect(result.multiple).toBeCloseTo(1.4, 10);
  });

  it("doubles to +100%", () => {
    const result = roi({ cost: 100, finalValue: 200, years: 1 });
    expect(result.roiPercent).toBeCloseTo(100, 10);
    expect(result.multiple).toBeCloseTo(2, 10);
  });

  it("reads break-even as 0%", () => {
    const result = roi({ cost: 100, finalValue: 100, years: 1 });
    expect(result.roiPercent).toBe(0);
    expect(result.gain).toBe(0);
    expect(result.annualisedPercent).toBeCloseTo(0, 12);
  });

  it("reports a loss as a negative return", () => {
    const result = roi({ cost: 500_000_000, finalValue: 400_000_000, years: 2 });
    expect(result.gain).toBe(-100_000_000);
    expect(result.roiPercent).toBeCloseTo(-20, 10);
    expect(result.annualisedPercent).toBeLessThan(0);
  });

  it("reads a total loss as −100%", () => {
    const result = roi({ cost: 500_000_000, finalValue: 0, years: 2 });
    expect(result.roiPercent).toBe(-100);
    expect(result.multiple).toBe(0);
  });
});

describe("computeRoi — annualising", () => {
  it("uses the compound rate, not the return divided by the years", () => {
    // 1,4^(1/3) − 1 = 11,8689…%, hand-checked. The naive 40 ÷ 3 = 13,33%
    // would overstate it, which is the error this module exists to avoid.
    expect(roi(BASE).annualisedPercent).toBeCloseTo(11.868_9, 4);
    expect(roi(BASE).annualisedPercent).toBeLessThan(40 / 3);
  });

  it("round-trips: compounding the annual rate over the years gives the multiple", () => {
    const result = roi(BASE);
    const rate = result.annualisedPercent! / 100;
    expect((1 + rate) ** 3).toBeCloseTo(result.multiple, 10);
  });

  it("equals plain ROI over exactly one year", () => {
    const result = roi({ cost: 100, finalValue: 140, years: 1 });
    expect(result.annualisedPercent).toBeCloseTo(result.roiPercent, 10);
  });

  it("annualises a holding period under a year upward", () => {
    // 10% in six months is far more than 10%/năm.
    const result = roi({ cost: 100, finalValue: 110, years: 0.5 });
    expect(result.annualisedPercent).toBeCloseTo(21, 10);
  });

  it("separates two investments plain ROI cannot tell apart", () => {
    const quick = roi({ cost: 100, finalValue: 140, years: 0.667 });
    const slow = roi({ cost: 100, finalValue: 140, years: 8 });
    expect(quick.roiPercent).toBeCloseTo(slow.roiPercent, 10);
    expect(quick.annualisedPercent!).toBeGreaterThan(slow.annualisedPercent!);
  });

  it("returns null for the annual figure when no period is given", () => {
    const noPeriod = roi({ cost: 500_000_000, finalValue: 700_000_000 });
    expect(noPeriod.roiPercent).toBeCloseTo(40, 10);
    expect(noPeriod.annualisedPercent).toBeNull();
    expect(noPeriod.years).toBeNull();
    expect(roi({ ...BASE, years: 0 }).annualisedPercent).toBeNull();
  });

  it("returns null for the annual figure on a total loss", () => {
    // No annual rate takes a positive sum to exactly zero in finite time.
    const wiped = roi({ cost: 500_000_000, finalValue: 0, years: 2 });
    expect(wiped.annualisedPercent).toBeNull();
    expect(wiped.roiPercent).toBe(-100);
  });

  it("echoes the holding period back", () => {
    expect(roi(BASE).years).toBe(3);
  });
});

describe("computeRoi — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeRoi({ ...BASE, cost: 0 })).toBeNull();
    expect(computeRoi({ ...BASE, cost: -1 })).toBeNull();
    expect(computeRoi({ ...BASE, finalValue: -1 })).toBeNull();
    expect(computeRoi({ ...BASE, years: -1 })).toBeNull();
    expect(computeRoi({ ...BASE, cost: Number.NaN })).toBeNull();
    expect(computeRoi({ ...BASE, finalValue: Number.NaN })).toBeNull();
    expect(computeRoi({ ...BASE, years: Number.POSITIVE_INFINITY })).toBeNull();
  });
});
