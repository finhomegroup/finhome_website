import { describe, it, expect } from "vitest";
import {
  convertRate,
  COMPOUNDING_ORDER,
  type EffectiveRateInput,
} from "@/lib/calc/effective-rate";
import { periodsPerYear, toEffective } from "@/lib/calc/finance";
import { formatDecimal } from "@/lib/calc/number";

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

/**
 * The annually-compounded gain is zero by construction, but not bit-exactly:
 * `toEffective` at one period a year computes (1 + r) ** 1 − 1, which is not
 * bit-identical to r, so the difference is a signed float residue. Worst
 * observed across 0,1–30,0% in both directions, headline and table: 1,42e-14
 * points, against the 5e-5 resolution of the four-decimal display. Asserted
 * as an absolute band rather than `toBeCloseTo(0, 12)` because that passes on
 * a NEGATIVE residue, which is how "-0,0000 điểm %" shipped unnoticed.
 */
const ANNUAL_GAIN_RESIDUE_POINTS = 1e-13;

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
    expect(Math.abs(result.compoundingGainPoints)).toBeLessThan(
      ANNUAL_GAIN_RESIDUE_POINTS,
    );
    expect(result.periodicPercent).toBeCloseTo(8, 12);
  });

  it("never renders the annual gain with a spurious minus sign", () => {
    // The residue above is signed, and it used to reach the page as
    // "-0,0000 điểm %" for roughly half of all rates — 8,5 and 15 among them.
    // This asserts the rendered string, because the magnitude band alone
    // passes on a negative.
    for (const ratePercent of [0.1, 0.5, 8.5, 9.3, 13, 15, 21.9, 30]) {
      for (const direction of ["toEffective", "toNominal"] as const) {
        const result = rate({ ...BASE, direction, compounding: "annually", ratePercent });
        expect(formatDecimal(result.compoundingGainPoints, 4)).toBe("0,0000");
      }
      // …and the annually row of the table, at any selected frequency.
      for (const compounding of COMPOUNDING_ORDER) {
        const result = rate({ ...BASE, compounding, ratePercent });
        expect(formatDecimal(result.table[0].extraPoints, 4)).toBe("0,0000");
      }
    }
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
    expect(Math.abs(result.table[0].extraPoints)).toBeLessThan(
      ANNUAL_GAIN_RESIDUE_POINTS,
    );
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
