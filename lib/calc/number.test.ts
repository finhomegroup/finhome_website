import { describe, it, expect } from "vitest";
import {
  parseDecimal,
  parseMoney,
  parseCount,
  parseMagnitude,
  formatDecimal,
  formatMoney,
  formatPercent,
  PLACEHOLDER,
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

describe("parseCount", () => {
  it("accepts a plain whole number, with or without surrounding space", () => {
    expect(parseCount("30")).toBe(30);
    expect(parseCount(" 30 ")).toBe(30);
    expect(parseCount("0")).toBe(0);
    expect(parseCount("91")).toBe(91);
    expect(parseCount("2026")).toBe(2026);
  });

  it("rejects the two spellings the other parsers mis-read", () => {
    // The whole reason this function exists. "3.0" is an ordinary
    // spreadsheet spelling of 3 and used to become a 30-year forecast;
    // "1.000" is a correctly grouped thousand and used to become 1.
    expect(parseMoney("3.0")).toBe(30);
    expect(parseDecimal("1.000")).toBe(1);
    expect(parseCount("3.0")).toBeNull();
    expect(parseCount("1.000")).toBeNull();
    expect(parseCount("1.5")).toBeNull();
    expect(parseCount("3,5")).toBeNull();
  });

  it("rejects a sign, a bare separator, exponent form and junk", () => {
    expect(parseCount("-3")).toBeNull();
    expect(parseCount("+3")).toBeNull();
    expect(parseCount("")).toBeNull();
    expect(parseCount("   ")).toBeNull();
    expect(parseCount("3.")).toBeNull();
    expect(parseCount("1e3")).toBeNull();
    expect(parseCount("abc")).toBeNull();
    expect(parseCount("12 3")).toBeNull();
  });

  it("rejects a magnitude that is not a safe integer", () => {
    expect(parseCount("99999999999999999999")).toBeNull();
  });
});

describe("parseMagnitude", () => {
  it("reads a dot-triple group as thousands grouping", () => {
    expect(parseMagnitude("10.000")).toBe(10_000);
    expect(parseMagnitude("1.500")).toBe(1500);
    expect(parseMagnitude("1.700")).toBe(1700);
    expect(parseMagnitude("1.234.567")).toBe(1_234_567);
    expect(parseMagnitude("-1.500")).toBe(-1500);
  });

  it("reads any other dot as a decimal point", () => {
    expect(parseMagnitude("1.5")).toBe(1.5);
    expect(parseMagnitude("0.5")).toBe(0.5);
    expect(parseMagnitude("10.00")).toBe(10);
    expect(parseMagnitude("1.5000")).toBe(1.5);
    expect(parseMagnitude("120")).toBe(120);
    expect(parseMagnitude("7")).toBe(7);
  });

  it("never reads a leading zero as a thousands group", () => {
    // "0.500" is an English 0,5 written with trailing zeros — nobody spells
    // five hundred that way, so the leading zero settles the grammar. Reading
    // it as grouping made every such entry 1000x too large with no error
    // shown: 0,5 lượng vàng became 500 lượng.
    expect(parseMagnitude("0.500")).toBe(0.5);
    expect(parseMagnitude("0.250")).toBe(0.25);
    expect(parseMagnitude("0.500,5")).toBeNull();
    expect(parseMagnitude("-0.500")).toBe(-0.5);
    // A leading zero on a longer group is equally not grouping, so this is
    // the decimal 1,000 — one — not one thousand.
    expect(parseMagnitude("01.000")).toBe(1);
    // …while the ordinary grouped readings are untouched.
    expect(parseMagnitude("10.000")).toBe(10_000);
    expect(parseMagnitude("100.000")).toBe(100_000);
  });

  it("keeps ',' as the decimal mark in either reading", () => {
    expect(parseMagnitude("1,5")).toBe(1.5);
    expect(parseMagnitude("10.000,5")).toBe(10_000.5);
    expect(parseMagnitude("-1.500,25")).toBe(-1500.25);
  });

  it("rejects what both underlying parsers reject", () => {
    expect(parseMagnitude("")).toBeNull();
    expect(parseMagnitude("abc")).toBeNull();
    expect(parseMagnitude("1e3")).toBeNull();
    expect(parseMagnitude(".")).toBeNull();
  });

  it("is needed because neither sibling parser is usable here", () => {
    // A magnitude field is used both far below 10 (1,5 chỉ of gold) and far
    // above a thousand (10.000 m²), so both mis-readings are reachable:
    // parseMoney turns 1,5 chỉ into 56,25 g, and parseDecimal turns 1 ha
    // into 0,002778 mẫu — neither with an error shown.
    expect(parseMoney("1.5")).toBe(15);
    expect(parseDecimal("10.000")).toBe(10);
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

  it("never renders negative zero from a float residue", () => {
    // The residue this was found on: an annually-compounded gain is zero by
    // construction but arrives as -4,16e-15 and rendered as "-0,0000 điểm %".
    expect(formatDecimal(-4.163336342344337e-15, 4)).toBe("0,0000");
    expect(formatDecimal(-0.4, 0)).toBe("0");
    expect(formatPercent(-1e-14, 4)).toBe("0,0000%");
    // A value that really is negative at the requested precision keeps its
    // sign — the guard reads the ROUNDED value, not the raw one.
    expect(formatDecimal(-0.6, 0)).toBe("-1");
    expect(formatDecimal(-0.05, 1)).toBe("-0,1");
    expect(formatDecimal(-0.3632, 4)).toBe("-0,3632");
  });

  it("renders the placeholder rather than non-finite or scientific output", () => {
    expect(formatDecimal(Number.NaN)).toBe(PLACEHOLDER);
    expect(formatDecimal(Number.POSITIVE_INFINITY)).toBe(PLACEHOLDER);
    expect(formatDecimal(1e21)).toBe(PLACEHOLDER);
    expect(formatPercent(Number.NaN)).toBe(PLACEHOLDER);
    expect(formatPercent(Number.NEGATIVE_INFINITY)).toBe(PLACEHOLDER);
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

  it("never renders negative zero from a float residue", () => {
    expect(formatMoney(-0.4)).toBe("0");
    expect(formatMoney(-0.0001, 2)).toBe("0,00");
  });
});

describe("formatPercent", () => {
  it("appends the sign to a comma decimal", () => {
    expect(formatPercent(12.6825)).toBe("12,68%");
    expect(formatPercent(6, 0)).toBe("6%");
  });
});
