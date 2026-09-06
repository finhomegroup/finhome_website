import { describe, it, expect } from "vitest";
import {
  parseRate,
  rule72Years,
  exactYears,
  formatYears,
} from "@/lib/rule-of-72";

describe("parseRate", () => {
  it("parses a plain integer", () => {
    expect(parseRate("6")).toBe(6);
  });

  it("parses a dot decimal", () => {
    expect(parseRate("7.5")).toBe(7.5);
  });

  it("parses a comma decimal (Vietnamese keyboard)", () => {
    expect(parseRate("7,5")).toBe(7.5);
  });

  it("tolerates a trailing separator while the user is still typing", () => {
    expect(parseRate("7,")).toBe(7);
    expect(parseRate("7.")).toBe(7);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseRate("  6  ")).toBe(6);
  });

  it("parses a leading-dot decimal", () => {
    expect(parseRate(".5")).toBe(0.5);
  });

  it("parses a negative rate (validity is decided downstream)", () => {
    expect(parseRate("-5")).toBe(-5);
  });

  it("returns null for empty or whitespace-only input", () => {
    expect(parseRate("")).toBeNull();
    expect(parseRate("   ")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseRate("abc")).toBeNull();
    expect(parseRate("7abc")).toBeNull();
    expect(parseRate("7.5.2")).toBeNull();
    expect(parseRate(".")).toBeNull();
  });

  it("returns null for exponent notation", () => {
    expect(parseRate("1e9")).toBeNull();
  });
});

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
});

describe("formatYears", () => {
  it("renders two decimals with a Vietnamese decimal comma", () => {
    expect(formatYears(12)).toBe("12,00");
    expect(formatYears(11.8957)).toBe("11,90");
    expect(formatYears(7.2725)).toBe("7,27");
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
    const rate = parseRate(raw);
    const est = rate === null ? null : rule72Years(rate);
    const ex = rate === null ? null : exactYears(rate);
    expect(est === null ? null : formatYears(est)).toBe(estimate);
    expect(ex === null ? null : formatYears(ex)).toBe(exact);
  });
});
