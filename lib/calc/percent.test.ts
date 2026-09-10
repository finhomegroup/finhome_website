import { describe, it, expect } from "vitest";
import { computePercent, type PercentInput } from "@/lib/calc/percent";

function compute(input: PercentInput) {
  const result = computePercent(input);
  expect(result).not.toBeNull();
  return result!;
}

/** Narrow to the mode asked for, so the test reads the right field. */
function amountOf(a: number, b: number) {
  const result = compute({ mode: "of", a, b });
  expect(result.mode).toBe("of");
  return (result as { mode: "of"; amount: number }).amount;
}

function shareOf(a: number, b: number) {
  const result = compute({ mode: "share", a, b });
  expect(result.mode).toBe("share");
  return (result as { mode: "share"; sharePercent: number }).sharePercent;
}

function changeFrom(a: number, b: number) {
  const result = compute({ mode: "change", a, b });
  expect(result.mode).toBe("change");
  return result as {
    mode: "change";
    changePercent: number;
    difference: number;
  };
}

describe("computePercent — a% of b", () => {
  it("takes a percentage of a quantity", () => {
    expect(amountOf(15, 2_000_000)).toBeCloseTo(300_000, 10);
    expect(amountOf(10, 850_000)).toBeCloseTo(85_000, 10);
    expect(amountOf(8, 1_000_000)).toBeCloseTo(80_000, 10);
  });

  it("handles 0% and 100%", () => {
    expect(amountOf(0, 2_000_000)).toBe(0);
    expect(amountOf(100, 2_000_000)).toBeCloseTo(2_000_000, 10);
  });

  it("allows a percentage above 100 and a negative one", () => {
    expect(amountOf(150, 2_000_000)).toBeCloseTo(3_000_000, 10);
    expect(amountOf(-15, 2_000_000)).toBeCloseTo(-300_000, 10);
  });

  it("is defined when the total is 0", () => {
    // Unlike the other two modes, nothing is divided by a user value here.
    expect(amountOf(15, 0)).toBe(0);
  });

  it("inverts `share`: taking p% of b gives back a", () => {
    const a = 300_000;
    const b = 2_000_000;
    expect(amountOf(shareOf(a, b), b)).toBeCloseTo(a, 6);
  });
});

describe("computePercent — a is what % of b", () => {
  it("states a part as a percentage of a whole", () => {
    expect(shareOf(300_000, 2_000_000)).toBeCloseTo(15, 10);
    expect(shareOf(1, 3)).toBeCloseTo(33.333_333_333, 8);
  });

  it("goes above 100 when the part exceeds the whole", () => {
    expect(shareOf(2_500_000, 2_000_000)).toBeCloseTo(125, 10);
  });

  it("reports 0% for a zero part", () => {
    expect(shareOf(0, 2_000_000)).toBe(0);
  });

  it("returns null when the whole is 0", () => {
    // Every percentage of 0 is 0, so no percentage answers this.
    expect(computePercent({ mode: "share", a: 300_000, b: 0 })).toBeNull();
    expect(computePercent({ mode: "share", a: 0, b: 0 })).toBeNull();
  });
});

describe("computePercent — change from a to b", () => {
  it("measures an increase against the starting value", () => {
    const result = changeFrom(20_000_000, 23_000_000);
    expect(result.changePercent).toBeCloseTo(15, 10);
    expect(result.difference).toBeCloseTo(3_000_000, 10);
  });

  it("measures a decrease as a negative percentage", () => {
    const result = changeFrom(23_000_000, 20_000_000);
    expect(result.changePercent).toBeCloseTo(-13.043_478_26, 7);
    expect(result.difference).toBeCloseTo(-3_000_000, 10);
  });

  it("is not symmetric — up then down does not return to zero", () => {
    // The classic trap: +15% then −15% is a net loss, because the second
    // percentage is taken on a larger base.
    const up = changeFrom(100, 115).changePercent;
    const down = changeFrom(115, 100).changePercent;
    expect(up).toBeCloseTo(15, 10);
    expect(Math.abs(down)).toBeLessThan(up);
  });

  it("reports no change as 0%", () => {
    const result = changeFrom(2_000_000, 2_000_000);
    expect(result.changePercent).toBe(0);
    expect(result.difference).toBe(0);
  });

  it("reads a move toward zero from a negative base as an improvement", () => {
    // Divides by |a|: −200 to −100 is +50%, not −50%.
    expect(changeFrom(-200, -100).changePercent).toBeCloseTo(50, 10);
    expect(changeFrom(-100, -200).changePercent).toBeCloseTo(-100, 10);
  });

  it("handles a loss turning into a profit", () => {
    const result = changeFrom(-50_000_000, 10_000_000);
    expect(result.changePercent).toBeCloseTo(120, 10);
    expect(result.difference).toBeCloseTo(60_000_000, 10);
  });

  it("returns null when the starting value is 0", () => {
    expect(computePercent({ mode: "change", a: 0, b: 500 })).toBeNull();
    expect(computePercent({ mode: "change", a: 0, b: 0 })).toBeNull();
  });
});

describe("computePercent — rejected inputs", () => {
  it("returns null rather than a guess on a non-finite input", () => {
    const modes = ["of", "share", "change"] as const;
    for (const mode of modes) {
      expect(computePercent({ mode, a: Number.NaN, b: 100 })).toBeNull();
      expect(computePercent({ mode, a: 100, b: Number.NaN })).toBeNull();
      expect(
        computePercent({ mode, a: Number.POSITIVE_INFINITY, b: 100 }),
      ).toBeNull();
    }
  });
});
