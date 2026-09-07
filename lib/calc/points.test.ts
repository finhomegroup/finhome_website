import { describe, it, expect } from "vitest";
import { computePoints, type PointsInput } from "@/lib/calc/points";
import { pmt } from "@/lib/calc/finance";

// 2 tỷ over 20 years at 8,5%, with 1% of the loan buying 0,25 points off.
const BASE: PointsInput = {
  amount: 2_000_000_000,
  termMonths: 240,
  baseRatePercent: 8.5,
  pointsPercent: 1,
  rateReductionPoints: 0.25,
};

function points(input: PointsInput) {
  const result = computePoints(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computePoints — the two loans", () => {
  it("takes the reduction in percentage POINTS, not percent of the rate", () => {
    // 0,25 turns 8,5 into 8,25 — not into 8,47875.
    expect(points(BASE).buydownRatePercent).toBeCloseTo(8.25, 10);
    expect(
      points({ ...BASE, rateReductionPoints: 1 }).buydownRatePercent,
    ).toBeCloseTo(7.5, 10);
  });

  it("agrees with pmt() on both instalments", () => {
    const result = points(BASE);
    expect(result.basePayment).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 240, 2_000_000_000)),
      6,
    );
    expect(result.buydownPayment).toBeCloseTo(
      Math.abs(pmt(8.25 / 100 / 12, 240, 2_000_000_000)),
      6,
    );
    expect(result.monthlySaving).toBeCloseTo(
      result.basePayment - result.buydownPayment,
      6,
    );
  });

  it("prices the points on the amount borrowed", () => {
    expect(points(BASE).cost).toBeCloseTo(20_000_000, 6);
    expect(points({ ...BASE, pointsPercent: 2.5 }).cost).toBeCloseTo(
      50_000_000,
      6,
    );
    expect(points({ ...BASE, pointsPercent: 0 }).cost).toBe(0);
  });

  it("saves interest over the full term", () => {
    const result = points(BASE);
    expect(result.buydownTotalInterest).toBeLessThan(result.baseTotalInterest);
    expect(result.lifetimeSaving).toBeCloseTo(
      result.baseTotalInterest - result.buydownTotalInterest - result.cost,
      6,
    );
    expect(result.lifetimeSaving).toBeGreaterThan(0);
  });
});

describe("computePoints — the naive break-even", () => {
  it("is cost divided by the monthly saving, rounded up", () => {
    const result = points(BASE);
    expect(result.breakEvenMonths).toBe(
      Math.ceil(result.cost / result.monthlySaving),
    );
  });

  it("is null when the payment does not fall", () => {
    const result = points({ ...BASE, rateReductionPoints: 0 });
    expect(result.monthlySaving).toBeCloseTo(0, 6);
    expect(result.breakEvenMonths).toBeNull();
  });

  it("arrives sooner for a bigger reduction at the same cost", () => {
    const small = points({ ...BASE, rateReductionPoints: 0.25 });
    const large = points({ ...BASE, rateReductionPoints: 1 });
    expect(large.breakEvenMonths!).toBeLessThan(small.breakEvenMonths!);
  });

  it("understates the true payback, because it ignores the balance", () => {
    // The reason this module reports holdPosition too. At the naive
    // break-even month the borrower is ALREADY ahead, because the lower rate
    // has also retired more principal by then.
    const result = points(BASE);
    const atBreakEven = points({
      ...BASE,
      holdMonths: result.breakEvenMonths!,
    });
    expect(atBreakEven.holdPosition).toBeGreaterThan(0);
    // And one month earlier they are ahead as well — the naive figure is late.
    const before = points({
      ...BASE,
      holdMonths: result.breakEvenMonths! - 1,
    });
    expect(before.holdPosition).toBeGreaterThan(0);
  });
});

describe("computePoints — the hold-horizon comparison", () => {
  it("counts payments made plus the balance still owed, plus the cost", () => {
    const result = points({ ...BASE, holdMonths: 60 });
    expect(result.holdMonths).toBe(60);
    expect(result.holdPosition).toBeCloseTo(
      result.baseHoldCost - result.buydownHoldCost,
      6,
    );
    // The buydown side carries the upfront cost.
    expect(result.buydownHoldCost).toBeGreaterThan(
      result.buydownHoldCost - result.cost,
    );
  });

  it("says no over a very short hold", () => {
    const result = points({ ...BASE, holdMonths: 6 });
    expect(result.worthIt).toBe(false);
    expect(result.holdPosition).toBeLessThan(0);
  });

  it("says yes over a long hold", () => {
    const result = points({ ...BASE, holdMonths: 240 });
    expect(result.worthIt).toBe(true);
    expect(result.holdPosition).toBeGreaterThan(0);
  });

  it("improves monotonically with the horizon", () => {
    let previous = Number.NEGATIVE_INFINITY;
    for (const holdMonths of [12, 24, 60, 120, 180, 240]) {
      const position = points({ ...BASE, holdMonths }).holdPosition;
      expect(position).toBeGreaterThan(previous);
      previous = position;
    }
  });

  it("defaults the horizon to the whole term", () => {
    const result = points(BASE);
    expect(result.holdMonths).toBe(240);
    // Over the whole term, holding to payoff, the position IS the lifetime
    // saving: both balances are zero and the only difference is interest.
    expect(result.holdPosition).toBeCloseTo(result.lifetimeSaving, 2);
  });

  it("clamps a horizon past the term to the term", () => {
    const result = points({ ...BASE, holdMonths: 600 });
    expect(result.holdMonths).toBe(240);
    expect(result.holdPosition).toBeCloseTo(points(BASE).holdPosition, 6);
  });

  it("is exactly minus the cost with no reduction", () => {
    const result = points({ ...BASE, rateReductionPoints: 0 });
    expect(result.holdPosition).toBeCloseTo(-result.cost, 4);
    expect(result.worthIt).toBe(false);
  });

  it("is zero-cost neutral when no points are bought", () => {
    const result = points({ ...BASE, pointsPercent: 0, rateReductionPoints: 0 });
    expect(result.cost).toBe(0);
    expect(result.holdPosition).toBeCloseTo(0, 6);
    expect(result.worthIt).toBe(false);
  });
});

describe("computePoints — realistic terms and rejection", () => {
  it("survives 240, 300 and 360 monthly periods", () => {
    for (const termMonths of [240, 300, 360]) {
      const result = points({ ...BASE, termMonths });
      expect(result.basePayment).toBeGreaterThan(0);
      expect(result.lifetimeSaving).toBeGreaterThan(0);
    }
  });

  it("rejects buying the rate below zero rather than clamping", () => {
    expect(
      computePoints({ ...BASE, rateReductionPoints: 9 }),
    ).toBeNull();
    // Exactly to zero is allowed: an interest-free loan is a real promotion.
    const free = points({ ...BASE, rateReductionPoints: 8.5 });
    expect(free.buydownRatePercent).toBeCloseTo(0, 10);
    expect(free.buydownTotalInterest).toBeCloseTo(0, 6);
  });

  it("returns null rather than a guess", () => {
    expect(computePoints({ ...BASE, amount: 0 })).toBeNull();
    expect(computePoints({ ...BASE, amount: -1 })).toBeNull();
    expect(computePoints({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computePoints({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(computePoints({ ...BASE, baseRatePercent: -1 })).toBeNull();
    expect(computePoints({ ...BASE, pointsPercent: -1 })).toBeNull();
    expect(computePoints({ ...BASE, rateReductionPoints: -1 })).toBeNull();
    expect(computePoints({ ...BASE, holdMonths: 0 })).toBeNull();
    expect(computePoints({ ...BASE, holdMonths: 60.5 })).toBeNull();
    expect(computePoints({ ...BASE, amount: Number.NaN })).toBeNull();
  });
});
