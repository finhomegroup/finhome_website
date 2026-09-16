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

/**
 * Original row 59: percentage POINTS beside relative percent.
 *
 * The lesson the plan states verbatim is "tăng từ 7% lên 9% là 2 điểm phần
 * trăm". The trap is that the same move is also "+28,57%", and a reader shown
 * only one of the two numbers has been told half the story. Reference values
 * are one subtraction and one division, computed by hand.
 */
describe("computePercent — two rates compared", () => {
  it("gives the plan's own example both ways at once", () => {
    const result = computePercent({ mode: "points", a: 7, b: 9 });
    expect(result).toEqual({
      mode: "points",
      differencePoints: 2,
      relativePercent: (2 / 7) * 100,
    });
    expect(result?.mode === "points" ? result.relativePercent : null)
      .toBeCloseTo(28.571428571428573, 9);
  });

  it("gives the FAQ's 8% → 10% example as 2 points and 25%", () => {
    const result = computePercent({ mode: "points", a: 8, b: 10 });
    expect(result).toEqual({
      mode: "points",
      differencePoints: 2,
      relativePercent: 25,
    });
  });

  it("is signed on a cut, in both figures", () => {
    const result = computePercent({ mode: "points", a: 9, b: 7 });
    expect(result).toEqual({
      mode: "points",
      differencePoints: -2,
      relativePercent: (-2 / 9) * 100,
    });
  });

  it("is zero points and zero percent when the rate does not move", () => {
    expect(computePercent({ mode: "points", a: 8, b: 8 })).toEqual({
      mode: "points",
      differencePoints: 0,
      relativePercent: 0,
    });
  });

  it("does NOT scale the point difference by a hundred", () => {
    // A percentage point is a difference of two percentages, full stop. The
    // defect this guards is treating 0,02 as the answer, or 200.
    const result = computePercent({ mode: "points", a: 7, b: 9 })!;
    expect(result.mode === "points" && result.differencePoints).toBe(2);
    expect(result.mode === "points" && result.differencePoints).not.toBe(0.02);
    expect(result.mode === "points" && result.differencePoints).not.toBe(200);
  });

  it("keeps the POINT difference from a 0% rate, and only nulls the relative", () => {
    // A 0% introductory rate rising to 7% is a real quote, and 7 − 0 = 7
    // points is the figure a reader needs. Only "7 chia 0" is undefined.
    // An earlier version refused the whole answer and a review found it.
    expect(computePercent({ mode: "points", a: 0, b: 7 })).toEqual({
      mode: "points",
      differencePoints: 7,
      relativePercent: null,
    });
    // And going back down to 0 is also a valid point difference.
    expect(computePercent({ mode: "points", a: 0, b: 0 })).toEqual({
      mode: "points",
      differencePoints: 0,
      relativePercent: null,
    });
  });

  it("nulls the relative change ONLY at a zero old rate", () => {
    for (const [a, b] of [
      [7, 9],
      [9, 7],
      [8, 8],
      [-2, -1],
    ] as const) {
      const result = computePercent({ mode: "points", a, b })!;
      expect(
        result.mode === "points" && result.relativePercent,
        `${a} -> ${b}`,
      ).not.toBeNull();
    }
  });

  it("reports the direction through the SIGN, for all three cases", () => {
    // The page picks the word from this sign. Its label used to read "tăng"
    // unconditionally, which asserted an increase on every rate cut.
    const up = computePercent({ mode: "points", a: 7, b: 9 })!;
    const down = computePercent({ mode: "points", a: 9, b: 7 })!;
    const flat = computePercent({ mode: "points", a: 8, b: 8 })!;
    expect(up.mode === "points" && up.differencePoints).toBeGreaterThan(0);
    expect(up.mode === "points" && up.relativePercent!).toBeGreaterThan(0);
    expect(down.mode === "points" && down.differencePoints).toBeLessThan(0);
    expect(down.mode === "points" && down.relativePercent!).toBeLessThan(0);
    expect(flat.mode === "points" && flat.differencePoints).toBe(0);
    expect(flat.mode === "points" && flat.relativePercent).toBe(0);
    // The 9 → 7 case the review named, to four places: −2 / 9 × 100.
    expect(down.mode === "points" && down.relativePercent).toBeCloseTo(
      -22.222222222222221,
      9,
    );
  });

  it("divides by the magnitude, so a negative starting rate still reads", () => {
    // A negative real rate is a genuine figure. −2% → −1% is +1 point and a
    // 50% improvement on the magnitude, not −50%.
    expect(computePercent({ mode: "points", a: -2, b: -1 })).toEqual({
      mode: "points",
      differencePoints: 1,
      relativePercent: 50,
    });
  });
});

describe("computePercent — rejected inputs", () => {
  it("returns null rather than a guess on a non-finite input", () => {
    const modes = ["of", "share", "change", "points"] as const;
    for (const mode of modes) {
      expect(computePercent({ mode, a: Number.NaN, b: 100 })).toBeNull();
      expect(computePercent({ mode, a: 100, b: Number.NaN })).toBeNull();
      expect(
        computePercent({ mode, a: Number.POSITIVE_INFINITY, b: 100 }),
      ).toBeNull();
    }
  });
});
