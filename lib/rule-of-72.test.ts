import { describe, it, expect } from "vitest";
import {
  rule72Years,
  exactYears,
  rule72Rate,
  exactRate,
  estimateErrorMonths,
  doublingMilestones,
  DEFAULT_GROWTH_MULTIPLES,
} from "@/lib/rule-of-72";
import { parseDecimal, formatDecimal } from "@/lib/calc/number";

describe("rule72Years", () => {
  it("divides 72 by the rate", () => {
    expect(rule72Years(6)).toBeCloseTo(12, 10);
    expect(rule72Years(10)).toBeCloseTo(7.2, 10);
    expect(rule72Years(72)).toBeCloseTo(1, 10);
  });

  it("returns null when the principal never doubles", () => {
    expect(rule72Years(0)).toBeNull();
    expect(rule72Years(-5)).toBeNull();
  });

  it("returns null for non-finite input", () => {
    expect(rule72Years(Number.NaN)).toBeNull();
    expect(rule72Years(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("exactYears", () => {
  it("solves (1 + r)^t = 2", () => {
    expect(exactYears(6)).toBeCloseTo(11.8957, 4);
    expect(exactYears(10)).toBeCloseTo(7.2725, 4);
    expect(exactYears(72)).toBeCloseTo(1.2781, 4);
  });

  it("returns null when the principal never doubles", () => {
    expect(exactYears(0)).toBeNull();
    expect(exactYears(-5)).toBeNull();
  });

  it("returns null for non-finite input", () => {
    expect(exactYears(Number.NaN)).toBeNull();
    expect(exactYears(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("returns null when the rate is too small for log1p to resolve above zero", () => {
    expect(exactYears(1e-21)).toBeNull();
  });
});

describe("rule72Rate", () => {
  it("divides 72 by the number of years", () => {
    expect(rule72Rate(10)).toBeCloseTo(7.2, 10);
    expect(rule72Rate(5)).toBeCloseTo(14.4, 10);
    expect(rule72Rate(72)).toBeCloseTo(1, 10);
  });

  it("is the inverse of rule72Years", () => {
    expect(rule72Rate(rule72Years(6) as number)).toBeCloseTo(6, 10);
  });

  it("returns null when the term cannot describe a doubling period", () => {
    expect(rule72Rate(0)).toBeNull();
    expect(rule72Rate(-5)).toBeNull();
    expect(rule72Rate(Number.NaN)).toBeNull();
    expect(rule72Rate(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("exactRate", () => {
  it("solves (1 + r)^t = 2 for r", () => {
    expect(exactRate(10)).toBeCloseTo(7.1773, 4);
    expect(exactRate(5)).toBeCloseTo(14.8698, 4);
    expect(exactRate(1)).toBeCloseTo(100, 10);
  });

  it("is the inverse of exactYears", () => {
    expect(exactRate(exactYears(6) as number)).toBeCloseTo(6, 8);
    expect(exactRate(exactYears(10) as number)).toBeCloseTo(10, 8);
  });

  it("returns null when the term cannot describe a doubling period", () => {
    expect(exactRate(0)).toBeNull();
    expect(exactRate(-5)).toBeNull();
    expect(exactRate(Number.NaN)).toBeNull();
    expect(exactRate(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("returns null for a term so long the required rate rounds to zero", () => {
    expect(exactRate(1e18)).toBeNull();
  });
});

// The reference table from the spec, end to end through parse -> compute ->
// format. This is the contract the page's displayed numbers must satisfy.
describe("reference values (spec table)", () => {
  const cases: [string, string | null, string | null][] = [
    ["2", "36,00", "35,00"],
    ["6", "12,00", "11,90"],
    ["7", "10,29", "10,24"],
    ["7,5", "9,60", "9,58"],
    ["7.5", "9,60", "9,58"],
    ["10", "7,20", "7,27"],
    ["72", "1,00", "1,28"],
    ["0", null, null],
    ["-5", null, null],
    ["", null, null],
    ["abc", null, null],
  ];

  it.each(cases)("rate %s -> estimate %s, exact %s", (raw, estimate, exact) => {
    const rate = parseDecimal(raw);
    const est = rate === null ? null : rule72Years(rate);
    const ex = rate === null ? null : exactYears(rate);
    expect(est === null ? null : formatDecimal(est)).toBe(estimate);
    expect(ex === null ? null : formatDecimal(ex)).toBe(exact);
  });
});

/**
 * Original row 17: "quy tắc nhẩm có sai số", made concrete at the reader's own
 * rate instead of asserted as a band.
 *
 * Reference values are the closed forms, computed independently: the estimate
 * is 72/r and the exact answer is ln2 / ln(1 + r/100). At 8%/năm that is
 * 9 against 9,006468342 — the same pair the review recomputed by hand.
 */
describe("estimateErrorMonths", () => {
  it("is almost nothing in the middle of the band the rule is good for", () => {
    // 9 − 9,006468342 = −0,006468342 năm = −0,0776 tháng.
    expect(estimateErrorMonths(8)).toBeCloseTo((9 - 9.006468342) * 12, 6);
    expect(estimateErrorMonths(8)).toBeCloseTo(-0.0776, 3);
  });

  it("is signed, so the reader can tell optimistic from pessimistic", () => {
    // Below ~7,85% the rule OVERSTATES the wait; above it, understates.
    expect(estimateErrorMonths(2)!).toBeGreaterThan(0);
    expect(estimateErrorMonths(6)!).toBeGreaterThan(0);
    expect(estimateErrorMonths(10)!).toBeLessThan(0);
    expect(estimateErrorMonths(20)!).toBeLessThan(0);
  });

  it("grows away from the band, which is the lesson", () => {
    // At 2%/năm the estimate is nearly a full year too long: 36 vs 35,0028.
    expect(estimateErrorMonths(2)).toBeCloseTo((36 - 35.002788781) * 12, 6);
    expect(estimateErrorMonths(2)).toBeCloseTo(11.9665, 3);
    expect(Math.abs(estimateErrorMonths(2)!)).toBeGreaterThan(
      Math.abs(estimateErrorMonths(8)!),
    );
    expect(Math.abs(estimateErrorMonths(20)!)).toBeGreaterThan(
      Math.abs(estimateErrorMonths(10)!),
    );
  });

  it("has no answer where neither figure has one", () => {
    expect(estimateErrorMonths(0)).toBeNull();
    expect(estimateErrorMonths(-3)).toBeNull();
    expect(estimateErrorMonths(Number.NaN)).toBeNull();
  });
});

describe("doublingMilestones", () => {
  it("is the exact doubling time times the number of doublings", () => {
    const rungs = doublingMilestones(8)!;
    expect(rungs.map((r) => r.multiple)).toEqual([2, 4, 8]);
    expect(rungs.map((r) => r.doublings)).toEqual([1, 2, 3]);
    // Growth is multiplicative: 8× is three doublings, not a second model.
    expect(rungs[0].years).toBeCloseTo(9.006468342, 8);
    expect(rungs[1].years).toBeCloseTo(9.006468342 * 2, 8);
    expect(rungs[2].years).toBeCloseTo(9.006468342 * 3, 8);
  });

  it("uses the EXACT figure, not the 72 estimate", () => {
    // Multiplying the approximation by three would multiply its error by
    // three, on the very page that is about that error. At 2%/năm the
    // estimate-based 8× rung would be 108 năm against a true 105,0084.
    const rungs = doublingMilestones(2)!;
    expect(rungs[2].years).toBeCloseTo(35.002788781 * 3, 6);
    expect(rungs[2].years).not.toBeCloseTo(108, 1);
  });

  it("agrees with exactYears on the first rung, by construction", () => {
    for (const rate of [1, 6, 8, 12, 25]) {
      expect(doublingMilestones(rate)![0].years).toBe(exactYears(rate));
    }
  });

  it("refuses a multiple that is not a whole number of doublings", () => {
    // 3× is not 2^k, so it cannot be described as "k lần nhân đôi" and this
    // function will not silently take its own logarithm.
    expect(doublingMilestones(8, [3])).toBeNull();
    expect(doublingMilestones(8, [2, 5])).toBeNull();
    expect(doublingMilestones(8, [1])).toBeNull();
    expect(doublingMilestones(8, [0])).toBeNull();
  });

  it("accepts further powers of two", () => {
    const rungs = doublingMilestones(8, [2, 16])!;
    expect(rungs.map((r) => r.doublings)).toEqual([1, 4]);
  });

  it("returns null, not an empty list, at a rate that never doubles", () => {
    // "No answer" and "no milestones" are different statements.
    expect(doublingMilestones(0)).toBeNull();
    expect(doublingMilestones(-1)).toBeNull();
    expect(doublingMilestones(Number.NaN)).toBeNull();
  });

  it("defaults to the three rungs the page draws", () => {
    expect([...DEFAULT_GROWTH_MULTIPLES]).toEqual([2, 4, 8]);
  });
});
