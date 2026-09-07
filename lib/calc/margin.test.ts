import { describe, it, expect } from "vitest";
import { computeMargin, type MarginInput } from "@/lib/calc/margin";

const COST = 600_000;

function margin(input: MarginInput) {
  const result = computeMargin(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeMargin — from cost and price", () => {
  it("divides the same profit by two different denominators", () => {
    // 600.000 cost, 1.000.000 price: 400.000 profit.
    // margin = 400/1000 = 40%; markup = 400/600 = 66,67%.
    const result = margin({ mode: "price", cost: COST, value: 1_000_000 });
    expect(result.profit).toBe(400_000);
    expect(result.marginPercent).toBeCloseTo(40, 10);
    expect(result.markupPercent).toBeCloseTo(66.666_666_67, 8);
  });

  it("keeps margin below markup whenever there is a profit", () => {
    for (const price of [700_000, 900_000, 1_500_000, 5_000_000]) {
      const result = margin({ mode: "price", cost: COST, value: price });
      expect(result.marginPercent).toBeLessThan(result.markupPercent);
    }
  });

  it("reads a sale at cost as 0% both ways", () => {
    const result = margin({ mode: "price", cost: COST, value: COST });
    expect(result.profit).toBe(0);
    expect(result.marginPercent).toBe(0);
    expect(result.markupPercent).toBe(0);
  });

  it("reports selling below cost as a negative margin and markup", () => {
    const result = margin({ mode: "price", cost: COST, value: 500_000 });
    expect(result.profit).toBe(-100_000);
    expect(result.marginPercent).toBeCloseTo(-20, 10);
    expect(result.markupPercent).toBeCloseTo(-16.666_666_67, 8);
    // Below cost the ordering flips: the loss is a bigger share of the
    // smaller number, which is the price.
    expect(result.marginPercent).toBeLessThan(result.markupPercent);
  });
});

describe("computeMargin — from cost and a target margin", () => {
  it("prices for the margin asked for", () => {
    // 40% margin on a 600.000 cost needs a 1.000.000 price.
    const result = margin({ mode: "margin", cost: COST, value: 40 });
    expect(result.price).toBeCloseTo(1_000_000, 6);
    expect(result.marginPercent).toBeCloseTo(40, 8);
  });

  it("exposes the margin/markup trap", () => {
    // The whole reason this tool exists. Wanting a 40% margin but marking the
    // cost up by 40% lands on a 28,57% margin — 11,4 points short.
    const wanted = margin({ mode: "margin", cost: COST, value: 40 });
    const mistake = margin({ mode: "markup", cost: COST, value: 40 });
    expect(wanted.price).toBeCloseTo(1_000_000, 6);
    expect(mistake.price).toBeCloseTo(840_000, 6);
    expect(mistake.marginPercent).toBeCloseTo(28.571_428_57, 8);
    expect(wanted.marginPercent - mistake.marginPercent).toBeCloseTo(
      11.428_571_43,
      8,
    );
  });

  it("agrees with the price mode on the derived price", () => {
    const derived = margin({ mode: "margin", cost: COST, value: 35 });
    const direct = margin({ mode: "price", cost: COST, value: derived.price });
    expect(direct.marginPercent).toBeCloseTo(35, 8);
    expect(direct.markupPercent).toBeCloseTo(derived.markupPercent, 8);
  });

  it("allows a negative target margin", () => {
    const result = margin({ mode: "margin", cost: COST, value: -25 });
    expect(result.price).toBeCloseTo(480_000, 6);
    expect(result.profit).toBeCloseTo(-120_000, 6);
  });

  it("returns null at or above a 100% margin", () => {
    // A 100% margin means the goods were free; above it the price is negative.
    expect(computeMargin({ mode: "margin", cost: COST, value: 100 })).toBeNull();
    expect(computeMargin({ mode: "margin", cost: COST, value: 150 })).toBeNull();
    expect(
      computeMargin({ mode: "margin", cost: COST, value: 99.9 }),
    ).not.toBeNull();
  });
});

describe("computeMargin — from cost and a target markup", () => {
  it("marks the cost up by the percentage given", () => {
    const result = margin({ mode: "markup", cost: COST, value: 66.666_666_67 });
    expect(result.price).toBeCloseTo(1_000_000, 2);
    expect(result.marginPercent).toBeCloseTo(40, 6);
  });

  it("has no ceiling, unlike margin", () => {
    const result = margin({ mode: "markup", cost: COST, value: 400 });
    expect(result.price).toBeCloseTo(3_000_000, 6);
    expect(result.markupPercent).toBeCloseTo(400, 8);
    expect(result.marginPercent).toBeCloseTo(80, 8);
  });

  it("converts the textbook pairs", () => {
    // 50% markup is a 33,33% margin; 100% markup is a 50% margin.
    expect(
      margin({ mode: "markup", cost: COST, value: 50 }).marginPercent,
    ).toBeCloseTo(33.333_333_33, 8);
    expect(
      margin({ mode: "markup", cost: COST, value: 100 }).marginPercent,
    ).toBeCloseTo(50, 10);
  });

  it("round-trips through the margin mode", () => {
    const fromMarkup = margin({ mode: "markup", cost: COST, value: 66.7 });
    const back = margin({
      mode: "margin",
      cost: COST,
      value: fromMarkup.marginPercent,
    });
    expect(back.price).toBeCloseTo(fromMarkup.price, 6);
  });

  it("returns null when a markup of −100% makes the price zero", () => {
    expect(
      computeMargin({ mode: "markup", cost: COST, value: -100 }),
    ).toBeNull();
  });
});

describe("computeMargin — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    const modes = ["price", "margin", "markup"] as const;
    for (const mode of modes) {
      expect(computeMargin({ mode, cost: 0, value: 40 })).toBeNull();
      expect(computeMargin({ mode, cost: -1, value: 40 })).toBeNull();
      expect(computeMargin({ mode, cost: COST, value: Number.NaN })).toBeNull();
      expect(computeMargin({ mode, cost: Number.NaN, value: 40 })).toBeNull();
    }
  });

  it("rejects a selling price of zero, which has no margin", () => {
    expect(computeMargin({ mode: "price", cost: COST, value: 0 })).toBeNull();
  });
});
