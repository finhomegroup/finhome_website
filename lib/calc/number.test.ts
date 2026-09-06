import { describe, it, expect } from "vitest";
import {
  parseDecimal,
  parseMoney,
  formatDecimal,
  formatMoney,
  formatPercent,
} from "@/lib/calc/number";

describe("parseDecimal", () => {
  it("accepts integers and both decimal marks", () => {
    expect(parseDecimal("6")).toBe(6);
    expect(parseDecimal("7.5")).toBe(7.5);
    expect(parseDecimal("7,5")).toBe(7.5);
  });

  it("tolerates a trailing separator while the user is still typing", () => {
    expect(parseDecimal("7,")).toBe(7);
    expect(parseDecimal("7.")).toBe(7);
  });

  it("tolerates surrounding whitespace and a leading dot", () => {
    expect(parseDecimal("  6  ")).toBe(6);
    expect(parseDecimal(".5")).toBe(0.5);
  });

  it("accepts a negative value (validity is a caller's concern)", () => {
    expect(parseDecimal("-5")).toBe(-5);
  });

  it("rejects empty, non-numeric, and exponent input", () => {
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("   ")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("7abc")).toBeNull();
    expect(parseDecimal("7.5.2")).toBeNull();
    expect(parseDecimal(".")).toBeNull();
    expect(parseDecimal("1e9")).toBeNull();
  });
});

describe("parseMoney", () => {
  it("strips '.' as a thousands separator", () => {
    expect(parseMoney("500.000.000")).toBe(500_000_000);
    expect(parseMoney("1.000")).toBe(1000);
  });

  it("accepts an ungrouped integer", () => {
    expect(parseMoney("500000")).toBe(500_000);
  });

  it("treats ',' as the decimal mark, per Vietnamese convention", () => {
    expect(parseMoney("500,5")).toBe(500.5);
    expect(parseMoney("1.234,5")).toBe(1234.5);
  });

  it("rejects more than one decimal mark", () => {
    expect(parseMoney("1,2,3")).toBeNull();
  });

  it("rejects empty, non-numeric, and bare-separator input", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("   ")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
    expect(parseMoney(",")).toBeNull();
    expect(parseMoney(".")).toBeNull();
  });
});

describe("formatDecimal", () => {
  it("defaults to two decimals with a comma mark", () => {
    expect(formatDecimal(12)).toBe("12,00");
    expect(formatDecimal(11.8957)).toBe("11,90");
    expect(formatDecimal(7.2725)).toBe("7,27");
  });

  it("honours an explicit precision", () => {
    expect(formatDecimal(7.2725, 0)).toBe("7");
    expect(formatDecimal(7.2725, 4)).toBe("7,2725");
  });
});

describe("formatMoney", () => {
  it("groups thousands with '.' and defaults to no decimals", () => {
    expect(formatMoney(1_440_000)).toBe("1.440.000");
    expect(formatMoney(100_000_000)).toBe("100.000.000");
    expect(formatMoney(1000)).toBe("1.000");
  });

  it("does not group below a thousand", () => {
    expect(formatMoney(999)).toBe("999");
    expect(formatMoney(500)).toBe("500");
    expect(formatMoney(0)).toBe("0");
  });

  it("uses a comma for requested decimals", () => {
    expect(formatMoney(1234.5, 1)).toBe("1.234,5");
    expect(formatMoney(1234.56, 2)).toBe("1.234,56");
  });

  it("keeps the sign outside the grouping", () => {
    expect(formatMoney(-8_884_879)).toBe("-8.884.879");
  });

  it("returns the placeholder rather than scientific notation or NaN", () => {
    expect(formatMoney(Number.NaN)).toBe("—");
    expect(formatMoney(Number.POSITIVE_INFINITY)).toBe("—");
    expect(formatMoney(1e21)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("appends the sign to a comma decimal", () => {
    expect(formatPercent(12.6825)).toBe("12,68%");
    expect(formatPercent(6, 0)).toBe("6%");
  });
});
