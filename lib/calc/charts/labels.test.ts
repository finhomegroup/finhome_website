import { describe, it, expect } from "vitest";
import {
  axisTickLabel,
  axisUnit,
  compactMoney,
  fill,
  fullMoney,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import { scaleMoney, scaleDecimals, PLACEHOLDER } from "@/lib/calc/number";

// The real words the pages pass in, so the assembled strings are the shipped
// ones rather than an English approximation of them.
const WORDS: MoneyWords = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
};

describe("scaleMoney", () => {
  it("picks tỷ above a billion and triệu above a million", () => {
    expect(scaleMoney(2_304_616_796)).toEqual({
      value: 2.304616796,
      scale: "ty",
    });
    expect(scaleMoney(17_356_465).scale).toBe("trieu");
    expect(scaleMoney(950_000).scale).toBe("dong");
  });

  it("switches exactly at the boundary, not near it", () => {
    expect(scaleMoney(999_999).scale).toBe("dong");
    expect(scaleMoney(1_000_000).scale).toBe("trieu");
    expect(scaleMoney(999_999_999).scale).toBe("trieu");
    expect(scaleMoney(1_000_000_000).scale).toBe("ty");
  });

  it("scales a negative the same way as its positive twin", () => {
    // A household residual can come out below zero, and it must not silently
    // render in đồng while the positive case renders in triệu.
    expect(scaleMoney(-6_000_000).scale).toBe("trieu");
    expect(scaleMoney(-6_000_000).value).toBeCloseTo(-6, 12);
  });

  it("refuses a non-finite figure rather than inventing a scale", () => {
    expect(scaleMoney(NaN)).toEqual({ value: NaN, scale: "dong" });
    expect(scaleMoney(Infinity).scale).toBe("dong");
  });

  it("shows one decimal place above đồng and none below", () => {
    expect(scaleDecimals("ty")).toBe(1);
    expect(scaleDecimals("trieu")).toBe(1);
    expect(scaleDecimals("dong")).toBe(0);
  });
});

describe("compactMoney", () => {
  it("reads in the magnitude a chart label can carry", () => {
    expect(compactMoney(2_304_616_796, WORDS)).toBe("2,3 tỷ");
    expect(compactMoney(17_356_465, WORDS)).toBe("17,4 triệu");
    expect(compactMoney(950_000, WORDS)).toBe("950.000 ₫");
  });

  it("uses the Vietnamese decimal comma, never a point", () => {
    // The whole suite hand-rolls formatting for this reason; a chart label is
    // no more allowed to print "2.3 tỷ" than a result row is.
    expect(compactMoney(2_300_000_000, WORDS)).toContain(",");
    expect(compactMoney(2_300_000_000, WORDS)).not.toMatch(/\d\.\d\s/);
  });

  it("takes every word from the caller, holding no Vietnamese itself", () => {
    const other: MoneyWords = { currency: "$", million: "M", billion: "B" };
    expect(compactMoney(2_000_000_000, other)).toBe("2,0 B");
    expect(compactMoney(500, other)).toBe("500 $");
  });

  it("renders a non-finite figure as the placeholder, not as NaN", () => {
    expect(compactMoney(NaN, WORDS)).toContain(PLACEHOLDER);
    expect(compactMoney(Infinity, WORDS)).toContain(PLACEHOLDER);
  });
});

describe("fullMoney", () => {
  it("is the exact figure with its symbol", () => {
    expect(fullMoney(2_304_616_796, WORDS)).toBe("2.304.616.796 ₫");
  });

  it("is the same NUMBER as the compact label, at more precision", () => {
    // The contract the whole chart layer rests on: the table and the chart
    // never show two different numbers, only two precisions of one.
    const value = 17_356_465;
    expect(fullMoney(value, WORDS)).toBe("17.356.465 ₫");
    expect(compactMoney(value, WORDS)).toBe("17,4 triệu");
    // 17,4 triệu rounded back is within half a granule of the exact figure.
    expect(Math.abs(17.4e6 - value)).toBeLessThan(0.05e6);
  });
});

describe("axisUnit and axisTickLabel", () => {
  it("fixes one unit for the whole axis, from its maximum", () => {
    expect(axisUnit(5_000_000_000, WORDS)).toBe("tỷ");
    expect(axisUnit(20_000_000, WORDS)).toBe("triệu");
    expect(axisUnit(500_000, WORDS)).toBe("₫");
  });

  it("labels every tick in that one unit, not in its own", () => {
    // The defect this prevents: an axis reading 0 / 5,0 triệu / 10,0 triệu /
    // 1,5 tỷ / 2,0 tỷ, where the intervals look uneven because each tick
    // rescaled itself.
    const max = 2_000_000_000;
    expect(axisTickLabel(0, max)).toBe("0,0");
    expect(axisTickLabel(500_000_000, max)).toBe("0,5");
    expect(axisTickLabel(1_000_000_000, max)).toBe("1,0");
    expect(axisTickLabel(2_000_000_000, max)).toBe("2,0");
  });

  it("drops the decimal but keeps the grouping for an axis in đồng", () => {
    expect(axisTickLabel(250_000, 500_000)).toBe("250.000");
    expect(axisTickLabel(0, 500_000)).toBe("0");
  });
});

describe("fill", () => {
  it("substitutes every placeholder it is given a value for", () => {
    expect(fill("{a} và {b}", { a: "1", b: 2 })).toBe("1 và 2");
  });

  it("leaves an unsupplied placeholder visible rather than printing undefined", () => {
    // A visible {months} in prose is a bug someone reports; "undefined tháng"
    // reads as a broken calculator to the person it happens to.
    expect(fill("sau {months} tháng", {})).toBe("sau {months} tháng");
    expect(fill("{a} {b}", { a: "x" })).toBe("x {b}");
  });

  it("substitutes a placeholder that appears more than once", () => {
    expect(fill("{n} rồi {n}", { n: 5 })).toBe("5 rồi 5");
  });

  it("leaves text with no placeholders untouched", () => {
    expect(fill("không có gì", { a: "1" })).toBe("không có gì");
  });
});
