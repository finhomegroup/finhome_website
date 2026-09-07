import { describe, it, expect } from "vitest";
import {
  computeNetDistribution,
  type NetDistributionInput,
} from "@/lib/calc/net-distribution";

// 100 triệu quoted, 10% withheld in two 5% lines, plus a 200.000 ₫ flat fee.
const BASE: NetDistributionInput = {
  direction: "toNet",
  amount: 100_000_000,
  percentDeductions: [5, 5],
  fixedDeductions: [200_000],
};

function dist(input: NetDistributionInput) {
  const result = computeNetDistribution(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeNetDistribution — gross to net", () => {
  it("applies the percentages to the same base, not compounded", () => {
    // Two 5% lines take 10%, not 1 − 0,95² = 9,75%.
    const result = dist(BASE);
    expect(result.totalPercentRate).toBe(10);
    expect(result.percentAmount).toBeCloseTo(10_000_000, 6);
    expect(result.percentAmount).not.toBeCloseTo(9_750_000, 0);
  });

  it("subtracts the fixed deductions after", () => {
    const result = dist(BASE);
    expect(result.fixedAmount).toBe(200_000);
    expect(result.net).toBeCloseTo(89_800_000, 6);
  });

  it("keeps the deduction identity", () => {
    const result = dist(BASE);
    expect(result.totalDeducted).toBeCloseTo(
      result.percentAmount + result.fixedAmount,
      6,
    );
    expect(result.net).toBeCloseTo(result.gross - result.totalDeducted, 6);
  });

  it("states the effective rate and the retention", () => {
    const result = dist(BASE);
    expect(result.effectiveRatePercent).toBeCloseTo(10.2, 8);
    expect(result.retentionPercent).toBeCloseTo(89.8, 8);
    expect(
      result.effectiveRatePercent + result.retentionPercent,
    ).toBeCloseTo(100, 8);
  });

  it("passes the amount through with no deductions", () => {
    const result = dist({
      direction: "toNet",
      amount: 100_000_000,
      percentDeductions: [],
      fixedDeductions: [],
    });
    expect(result.net).toBe(100_000_000);
    expect(result.totalDeducted).toBe(0);
    expect(result.retentionPercent).toBeCloseTo(100, 8);
    expect(result.grossUpPercent).toBeCloseTo(0, 8);
  });

  it("reports a negative net rather than clamping it", () => {
    // A small transfer eaten by a flat fee is a real outcome, and hiding it
    // behind a zero would hide the problem.
    const result = dist({
      direction: "toNet",
      amount: 100_000,
      percentDeductions: [5],
      fixedDeductions: [200_000],
    });
    expect(result.net).toBeLessThan(0);
    expect(result.net).toBeCloseTo(-105_000, 6);
  });
});

describe("computeNetDistribution — net to gross", () => {
  it("divides by the retention rate rather than adding the rate back", () => {
    // The step the intuitive answer skips. To net 90 triệu after 10%, you
    // need 100 triệu — not 99.
    const result = dist({
      direction: "toGross",
      amount: 90_000_000,
      percentDeductions: [10],
      fixedDeductions: [],
    });
    expect(result.gross).toBeCloseTo(100_000_000, 6);
    expect(result.gross).not.toBeCloseTo(99_000_000, 0);
  });

  it("adds the fixed deductions before dividing", () => {
    const result = dist({
      direction: "toGross",
      amount: 89_800_000,
      percentDeductions: [5, 5],
      fixedDeductions: [200_000],
    });
    expect(result.gross).toBeCloseTo(100_000_000, 4);
  });

  it("round-trips against the forward direction", () => {
    for (const percentDeductions of [[], [5], [5, 5], [10, 2, 0.5]]) {
      for (const fixedDeductions of [[], [200_000], [50_000, 150_000]]) {
        const forward = dist({
          direction: "toNet",
          amount: 250_000_000,
          percentDeductions,
          fixedDeductions,
        });
        const back = dist({
          direction: "toGross",
          amount: forward.net,
          percentDeductions,
          fixedDeductions,
        });
        expect(back.gross).toBeCloseTo(250_000_000, 4);
      }
    }
  });

  it("reports the gross-up as a share of the NET", () => {
    // 10% off the gross needs 11,11% more gross to restore.
    const result = dist({
      direction: "toGross",
      amount: 90_000_000,
      percentDeductions: [10],
      fixedDeductions: [],
    });
    expect(result.grossUpPercent).toBeCloseTo(11.111_111_11, 6);
    expect(result.grossUpPercent).toBeGreaterThan(10);
  });

  it("grows the gross-up faster than the deduction rate", () => {
    const pairs: [number, number][] = [];
    for (const rate of [5, 10, 25, 50, 75]) {
      const result = dist({
        direction: "toGross",
        amount: 100_000_000,
        percentDeductions: [rate],
      });
      pairs.push([rate, result.grossUpPercent]);
    }
    for (const [rate, grossUp] of pairs) {
      expect(grossUp).toBeGreaterThan(rate);
    }
    // At 50% the gross must double: a 100% gross-up.
    expect(pairs[3][1]).toBeCloseTo(100, 6);
    // At 75% it quadruples.
    expect(pairs[4][1]).toBeCloseTo(300, 6);
  });

  it("passes through with no deductions", () => {
    const result = dist({
      direction: "toGross",
      amount: 100_000_000,
      percentDeductions: [],
      fixedDeductions: [],
    });
    expect(result.gross).toBe(100_000_000);
    expect(result.net).toBe(100_000_000);
  });
});

describe("computeNetDistribution — rejected inputs", () => {
  it("rejects percentages summing to 100 or more", () => {
    // Nothing survives, and the reverse direction divides by zero.
    expect(
      computeNetDistribution({ ...BASE, percentDeductions: [100] }),
    ).toBeNull();
    expect(
      computeNetDistribution({ ...BASE, percentDeductions: [60, 40] }),
    ).toBeNull();
    expect(
      computeNetDistribution({ ...BASE, percentDeductions: [60, 39.9] }),
    ).not.toBeNull();
  });

  it("rejects a zero amount, which has no meaningful rate", () => {
    expect(computeNetDistribution({ ...BASE, amount: 0 })).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeNetDistribution({ ...BASE, amount: -1 })).toBeNull();
    expect(
      computeNetDistribution({ ...BASE, percentDeductions: [-1] }),
    ).toBeNull();
    expect(
      computeNetDistribution({ ...BASE, fixedDeductions: [-1] }),
    ).toBeNull();
    expect(
      computeNetDistribution({ ...BASE, amount: Number.NaN }),
    ).toBeNull();
    expect(
      computeNetDistribution({
        ...BASE,
        percentDeductions: [Number.NaN],
      }),
    ).toBeNull();
  });
});
