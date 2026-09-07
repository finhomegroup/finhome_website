import { describe, it, expect } from "vitest";
import {
  convertRate,
  COMPOUNDING_ORDER,
  type EffectiveRateInput,
} from "@/lib/calc/effective-rate";
import { periodsPerYear, toEffective } from "@/lib/calc/finance";

const BASE: EffectiveRateInput = {
  direction: "toEffective",
  ratePercent: 8,
  compounding: "monthly",
};

function rate(input: EffectiveRateInput) {
  const result = convertRate(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("convertRate — nominal to effective", () => {
  it("matches the closed form", () => {
    // (1 + 0,08/12)^12 − 1 = 8,299950…%
    const result = rate(BASE);
    expect(result.nominalPercent).toBe(8);
    expect(result.effectivePercent).toBeCloseTo(8.299_950_8, 6);
    expect(result.effectivePercent).toBeCloseTo(
      toEffective(0.08, 12) * 100,
      12,
    );
  });

  it("leaves an annually-compounded rate alone", () => {
    const result = rate({ ...BASE, compounding: "annually" });
    expect(result.effectivePercent).toBeCloseTo(8, 12);
    expect(result.compoundingGainPoints).toBeCloseTo(0, 12);
    expect(result.periodicPercent).toBeCloseTo(8, 12);
  });

  it("states the per-period rate", () => {
    expect(rate(BASE).periodicPercent).toBeCloseTo(8 / 12, 12);
    expect(rate({ ...BASE, compounding: "daily" }).periodicPercent).toBeCloseTo(
      8 / 365,
      12,
    );
    expect(rate(BASE).periodsPerYear).toBe(12);
  });

  it("reports the compounding gain in percentage points", () => {
    const result = rate(BASE);
    expect(result.compoundingGainPoints).toBeCloseTo(
      result.effectivePercent - result.nominalPercent,
      12,
    );
    expect(result.compoundingGainPoints).toBeCloseTo(0.299_950_8, 6);
  });

  it("rises with the compounding frequency", () => {
    let previous = 0;
    for (const compounding of COMPOUNDING_ORDER) {
      const result = rate({ ...BASE, compounding });
      expect(result.effectivePercent).toBeGreaterThan(previous);
      previous = result.effectivePercent;
    }
    // 8%/năm compounded daily is 8,3277…%, the ceiling in this set.
    expect(previous).toBeCloseTo(8.327_757, 5);
  });
});

describe("convertRate — effective to nominal", () => {
  it("inverts the other direction exactly", () => {
    const forward = rate(BASE);
    const back = rate({
      direction: "toNominal",
      ratePercent: forward.effectivePercent,
      compounding: "monthly",
    });
    expect(back.nominalPercent).toBeCloseTo(8, 10);
    expect(back.effectivePercent).toBeCloseTo(forward.effectivePercent, 10);
  });

  it("answers the question a saver actually has", () => {
    // "I need 10% a year in hand; what monthly-compounded rate is that?"
    const result = rate({
      direction: "toNominal",
      ratePercent: 10,
      compounding: "monthly",
    });
    expect(result.effectivePercent).toBe(10);
    expect(result.nominalPercent).toBeCloseTo(9.568_968_5, 6);
    expect(result.nominalPercent).toBeLessThan(10);
  });

  it("still prices the table off the NOMINAL rate", () => {
    // The table answers "what if this quoted rate compounded more often",
    // which only means anything from the nominal figure.
    const result = rate({
      direction: "toNominal",
      ratePercent: 10,
      compounding: "monthly",
    });
    const annual = result.table.find((row) => row.compounding === "annually")!;
    expect(annual.effectivePercent).toBeCloseTo(result.nominalPercent, 10);
    const monthly = result.table.find((row) => row.compounding === "monthly")!;
    expect(monthly.effectivePercent).toBeCloseTo(10, 10);
  });
});

describe("convertRate — the reference table", () => {
  it("covers every frequency once, in ascending order", () => {
    const result = rate(BASE);
    expect(result.table).toHaveLength(COMPOUNDING_ORDER.length);
    expect(result.table.map((row) => row.compounding)).toEqual(
      COMPOUNDING_ORDER,
    );
    for (const row of result.table) {
      expect(row.periodsPerYear).toBe(periodsPerYear(row.compounding));
    }
  });

  it("increases monotonically and starts at the nominal rate", () => {
    const result = rate(BASE);
    expect(result.table[0].effectivePercent).toBeCloseTo(8, 12);
    expect(result.table[0].extraPoints).toBeCloseTo(0, 12);
    for (let index = 1; index < result.table.length; index += 1) {
      expect(result.table[index].effectivePercent).toBeGreaterThan(
        result.table[index - 1].effectivePercent,
      );
      expect(result.table[index].extraPoints).toBeGreaterThan(0);
    }
  });

  it("agrees with the headline figure on the selected row", () => {
    for (const compounding of COMPOUNDING_ORDER) {
      const result = rate({ ...BASE, compounding });
      const row = result.table.find((entry) => entry.compounding === compounding)!;
      expect(row.effectivePercent).toBeCloseTo(result.effectivePercent, 10);
    }
  });
});

describe("convertRate — edges and rejection", () => {
  it("converts 0% to 0% in both directions", () => {
    for (const direction of ["toEffective", "toNominal"] as const) {
      const result = rate({ ...BASE, direction, ratePercent: 0 });
      expect(result.nominalPercent).toBe(0);
      expect(result.effectivePercent).toBe(0);
      expect(result.compoundingGainPoints).toBe(0);
    }
  });

  it("handles a negative rate above −100%", () => {
    // A real return below inflation is genuinely negative.
    const result = rate({ ...BASE, ratePercent: -3 });
    expect(result.effectivePercent).toBeLessThan(0);
    // Compounding makes a negative rate LESS negative in annual terms.
    expect(result.effectivePercent).toBeGreaterThan(-3);
  });

  it("returns null rather than a guess", () => {
    expect(convertRate({ ...BASE, ratePercent: -100 })).toBeNull();
    expect(convertRate({ ...BASE, ratePercent: -150 })).toBeNull();
    expect(convertRate({ ...BASE, ratePercent: Number.NaN })).toBeNull();
    expect(
      convertRate({ ...BASE, ratePercent: Number.POSITIVE_INFINITY }),
    ).toBeNull();
  });
});
