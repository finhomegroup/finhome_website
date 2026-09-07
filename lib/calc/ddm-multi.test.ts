import { describe, it, expect } from "vitest";
import { computeDdmMulti, type DdmMultiInput } from "@/lib/calc/ddm-multi";
import { computeDdm } from "@/lib/calc/ddm";

// D0 = 2.000 ₫, 20%/năm for five years, then 5% forever, discounted at 12%.
const BASE: DdmMultiInput = {
  dividend: 2_000,
  highGrowthPercent: 20,
  highGrowthYears: 5,
  terminalGrowthPercent: 5,
  requiredReturnPercent: 12,
};

function multi(input: DdmMultiInput) {
  const result = computeDdmMulti(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeDdmMulti — the explicit stretch", () => {
  it("emits one row per year, growing at the high rate", () => {
    const result = multi(BASE);
    expect(result.years).toHaveLength(5);
    expect(result.years[0].dividend).toBeCloseTo(2_400, 8);
    expect(result.years[4].dividend).toBeCloseTo(
      2_000 * 1.2 ** 5,
      6,
    );
  });

  it("discounts each year by its own period count", () => {
    const result = multi(BASE);
    for (const row of result.years) {
      expect(row.presentValue).toBeCloseTo(
        row.dividend / 1.12 ** row.year,
        6,
      );
    }
  });

  it("sums the discounted dividends", () => {
    const result = multi(BASE);
    expect(result.pvOfDividends).toBeCloseTo(
      result.years.reduce((sum, row) => sum + row.presentValue, 0),
      6,
    );
  });

  it("allows high growth ABOVE the required return", () => {
    // The reason this model exists at all — Gordon cannot do this.
    const result = multi({ ...BASE, highGrowthPercent: 30 });
    expect(result.intrinsicValue).toBeGreaterThan(
      multi(BASE).intrinsicValue,
    );
  });
});

describe("computeDdmMulti — the terminal value", () => {
  it("grows the last explicit dividend at the TERMINAL rate", () => {
    const result = multi(BASE);
    const lastExplicit = result.years[4].dividend;
    expect(result.terminalDividend).toBeCloseTo(lastExplicit * 1.05, 6);
    // Not the high rate — that would overstate the tail's first year.
    expect(result.terminalDividend).not.toBeCloseTo(lastExplicit * 1.2, 0);
  });

  it("applies Gordon at the end of the stretch", () => {
    const result = multi(BASE);
    expect(result.terminalValue).toBeCloseTo(
      result.terminalDividend / (0.12 - 0.05),
      6,
    );
  });

  it("discounts the terminal value back n years, not n + 1", () => {
    // The classic off-by-one. The terminal value is already stated as of the
    // end of year n, so it comes back exactly n periods.
    const result = multi(BASE);
    expect(result.pvOfTerminalValue).toBeCloseTo(
      result.terminalValue / 1.12 ** 5,
      6,
    );
    expect(result.pvOfTerminalValue).not.toBeCloseTo(
      result.terminalValue / 1.12 ** 6,
      0,
    );
  });

  it("keeps the value identity", () => {
    const result = multi(BASE);
    expect(result.intrinsicValue).toBeCloseTo(
      result.pvOfDividends + result.pvOfTerminalValue,
      6,
    );
    expect(result.terminalSharePercent).toBeCloseTo(
      (result.pvOfTerminalValue / result.intrinsicValue) * 100,
      10,
    );
  });

  it("puts most of the value in the terminal", () => {
    // Worth pinning because it is the page's main caveat: most of the answer
    // rests on the assumption nobody can check.
    expect(multi(BASE).terminalSharePercent).toBeGreaterThan(60);
  });

  it("shifts value out of the terminal as the stretch lengthens", () => {
    const short = multi({ ...BASE, highGrowthYears: 2 })
      .terminalSharePercent;
    const long = multi({ ...BASE, highGrowthYears: 15 })
      .terminalSharePercent;
    expect(long).toBeLessThan(short);
  });
});

describe("computeDdmMulti — agreement with the Gordon model", () => {
  it("reproduces Gordon exactly when both growth rates match", () => {
    // The single property that catches almost every indexing mistake in a
    // two-stage model. Must hold for ANY length of explicit stretch.
    const gordon = computeDdm({
      dividend: 2_000,
      growthPercent: 5,
      requiredReturnPercent: 12,
    })!;
    for (const highGrowthYears of [1, 2, 5, 10, 20]) {
      const staged = multi({
        ...BASE,
        highGrowthPercent: 5,
        terminalGrowthPercent: 5,
        highGrowthYears,
      });
      expect(staged.intrinsicValue).toBeCloseTo(gordon.intrinsicValue, 4);
    }
  });

  it("exceeds Gordon when the first stage grows faster", () => {
    const gordon = computeDdm({
      dividend: 2_000,
      growthPercent: 5,
      requiredReturnPercent: 12,
    })!;
    expect(multi(BASE).intrinsicValue).toBeGreaterThan(
      gordon.intrinsicValue,
    );
  });

  it("falls below Gordon when the first stage grows slower", () => {
    const gordon = computeDdm({
      dividend: 2_000,
      growthPercent: 5,
      requiredReturnPercent: 12,
    })!;
    expect(
      multi({ ...BASE, highGrowthPercent: 0 }).intrinsicValue,
    ).toBeLessThan(gordon.intrinsicValue);
  });
});

describe("computeDdmMulti — rejected inputs", () => {
  it("refuses terminal growth at or above the required return", () => {
    expect(
      computeDdmMulti({ ...BASE, terminalGrowthPercent: 12 }),
    ).toBeNull();
    expect(
      computeDdmMulti({ ...BASE, terminalGrowthPercent: 20 }),
    ).toBeNull();
    expect(
      computeDdmMulti({ ...BASE, terminalGrowthPercent: 11.99 }),
    ).not.toBeNull();
  });

  it("bounds the explicit stretch to 1–20 whole years", () => {
    expect(computeDdmMulti({ ...BASE, highGrowthYears: 0 })).toBeNull();
    expect(computeDdmMulti({ ...BASE, highGrowthYears: 21 })).toBeNull();
    expect(computeDdmMulti({ ...BASE, highGrowthYears: 5.5 })).toBeNull();
    expect(computeDdmMulti({ ...BASE, highGrowthYears: 1 })).not.toBeNull();
    expect(computeDdmMulti({ ...BASE, highGrowthYears: 20 })).not.toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeDdmMulti({ ...BASE, dividend: 0 })).toBeNull();
    expect(computeDdmMulti({ ...BASE, dividend: -1 })).toBeNull();
    expect(computeDdmMulti({ ...BASE, dividend: Number.NaN })).toBeNull();
    expect(
      computeDdmMulti({ ...BASE, highGrowthPercent: Number.NaN }),
    ).toBeNull();
    expect(
      computeDdmMulti({ ...BASE, requiredReturnPercent: Number.NaN }),
    ).toBeNull();
  });
});
