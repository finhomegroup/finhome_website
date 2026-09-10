import { describe, it, expect } from "vitest";
import {
  rule72Years,
  exactYears,
  rule72Rate,
  exactRate,
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
