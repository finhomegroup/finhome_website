import { describe, expect, it } from "vitest";
import {
  computeUsDividendTax,
  NIIT_THRESHOLDS,
  type DividendTaxInput,
} from "@/lib/calc/us-dividend-tax";

const BASE: DividendTaxInput = {
  qualifiedDividends: 10_000,
  ordinaryDividends: 2_000,
  qualifiedRatePercent: 15,
  ordinaryRatePercent: 24,
  modifiedAgi: 120_000,
  status: "single",
  applyNiit: true,
};

describe("computeUsDividendTax", () => {
  it("taxes the two kinds of dividend at their own rates", () => {
    const result = computeUsDividendTax(BASE)!;
    expect(result.qualifiedTax).toBeCloseTo(1_500, 6);
    expect(result.ordinaryTax).toBeCloseTo(480, 6);
    // MAGI is under 200.000, so no surtax.
    expect(result.niitTax).toBe(0);
    expect(result.totalTax).toBeCloseTo(1_980, 6);
    expect(result.afterTaxIncome).toBeCloseTo(10_020, 6);
    expect(result.effectiveRatePercent).toBeCloseTo(16.5, 8);
  });

  it("prices what the qualified classification is worth", () => {
    const result = computeUsDividendTax(BASE)!;
    // All 12.000 at 24% would be 2.880 against the actual 1.980.
    expect(result.taxIfAllOrdinary).toBeCloseTo(2_880, 6);
    expect(result.qualifiedSaving).toBeCloseTo(900, 6);
  });

  it("charges the surtax on the LESSER of dividends and MAGI excess", () => {
    // Just over the threshold with large dividends: the excess binds.
    const justOver = computeUsDividendTax({
      ...BASE,
      qualifiedDividends: 50_000,
      ordinaryDividends: 0,
      modifiedAgi: 205_000,
    })!;
    expect(justOver.magiExcess).toBe(5_000);
    expect(justOver.niitBase).toBe(5_000);
    expect(justOver.niitTax).toBeCloseTo(190, 6);
    // Taking the dividends instead would charge 1.900 — ten times too much.

    // Far over the threshold with small dividends: the income binds.
    const farOver = computeUsDividendTax({
      ...BASE,
      qualifiedDividends: 8_000,
      ordinaryDividends: 0,
      modifiedAgi: 500_000,
    })!;
    expect(farOver.magiExcess).toBe(300_000);
    expect(farOver.niitBase).toBe(8_000);
    expect(farOver.niitTax).toBeCloseTo(304, 6);
    // Taking the excess instead would charge 11.400 on 8.000 of income.
  });

  it("uses the filing status's own NIIT threshold", () => {
    const single = computeUsDividendTax({ ...BASE, modifiedAgi: 240_000 })!;
    const married = computeUsDividendTax({
      ...BASE,
      modifiedAgi: 240_000,
      status: "married",
    })!;
    const separate = computeUsDividendTax({
      ...BASE,
      modifiedAgi: 240_000,
      status: "marriedSeparate",
    })!;
    expect(single.magiExcess).toBe(40_000);
    expect(married.magiExcess).toBe(0);
    expect(married.niitTax).toBe(0);
    // 125.000 for separate filers — lower than a single filer's 200.000.
    expect(separate.magiExcess).toBe(115_000);
    expect(separate.niitThreshold).toBe(NIIT_THRESHOLDS.marriedSeparate);
  });

  it("lets the surtax be switched off to show its size", () => {
    const on = computeUsDividendTax({ ...BASE, modifiedAgi: 400_000 })!;
    const off = computeUsDividendTax({
      ...BASE,
      modifiedAgi: 400_000,
      applyNiit: false,
    })!;
    expect(on.niitTax).toBeCloseTo(12_000 * 0.038, 6);
    expect(off.niitTax).toBe(0);
    expect(on.totalTax - off.totalTax).toBeCloseTo(on.niitTax, 6);
    // The threshold flag still reports the truth when the tax is off, so the
    // page can say "you are above it" without charging for it.
    expect(off.aboveNiitThreshold).toBe(true);
  });

  it("leaves the surtax out of the qualified-vs-ordinary comparison", () => {
    // NIIT applies to investment income whatever its character, so it must
    // cancel from the saving. Otherwise the classification would appear to
    // change a tax it has no effect on.
    const result = computeUsDividendTax({ ...BASE, modifiedAgi: 400_000 })!;
    const withoutNiit = computeUsDividendTax({
      ...BASE,
      modifiedAgi: 400_000,
      applyNiit: false,
    })!;
    expect(result.qualifiedSaving).toBeCloseTo(withoutNiit.qualifiedSaving, 6);
  });

  it("gives a zero bill at the 0% qualified rate", () => {
    const result = computeUsDividendTax({
      ...BASE,
      ordinaryDividends: 0,
      qualifiedRatePercent: 0,
      modifiedAgi: 40_000,
    })!;
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRatePercent).toBe(0);
    // And the saving is the whole ordinary bill.
    expect(result.qualifiedSaving).toBeCloseTo(10_000 * 0.24, 6);
  });

  it("applies the 20% rate at the top", () => {
    const result = computeUsDividendTax({
      ...BASE,
      ordinaryDividends: 0,
      qualifiedRatePercent: 20,
      ordinaryRatePercent: 37,
      modifiedAgi: 800_000,
    })!;
    expect(result.qualifiedTax).toBeCloseTo(2_000, 6);
    expect(result.niitTax).toBeCloseTo(380, 6);
    // Top qualified rate plus surtax is 23,8%, against 40,8% ordinary — the
    // gap the whole classification is about.
    expect(result.effectiveRatePercent).toBeCloseTo(23.8, 8);
    const ordinaryEquivalent =
      (result.taxIfAllOrdinary / result.totalDividends) * 100;
    expect(ordinaryEquivalent).toBeCloseTo(40.8, 8);
  });

  it("rejects a qualified rate the law does not have", () => {
    // 18% is not a statutory rate. Accepting it would let the page state a
    // legal-looking figure no filer could owe.
    expect(computeUsDividendTax({ ...BASE, qualifiedRatePercent: 18 })).toBe(
      null,
    );
    expect(computeUsDividendTax({ ...BASE, qualifiedRatePercent: 10 })).toBe(
      null,
    );
    expect(computeUsDividendTax({ ...BASE, qualifiedRatePercent: -5 })).toBe(
      null,
    );
    // The three that do exist all work.
    for (const rate of [0, 15, 20]) {
      expect(
        computeUsDividendTax({ ...BASE, qualifiedRatePercent: rate }),
      ).not.toBe(null);
    }
  });

  it("rejects negative money and an impossible ordinary rate", () => {
    expect(computeUsDividendTax({ ...BASE, qualifiedDividends: -1 })).toBe(
      null,
    );
    expect(computeUsDividendTax({ ...BASE, ordinaryDividends: -1 })).toBe(null);
    expect(computeUsDividendTax({ ...BASE, modifiedAgi: -1 })).toBe(null);
    expect(computeUsDividendTax({ ...BASE, ordinaryRatePercent: -1 })).toBe(
      null,
    );
    expect(computeUsDividendTax({ ...BASE, ordinaryRatePercent: 101 })).toBe(
      null,
    );
  });

  it("returns a null rate rather than dividing by no dividends", () => {
    const result = computeUsDividendTax({
      ...BASE,
      qualifiedDividends: 0,
      ordinaryDividends: 0,
    })!;
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRatePercent).toBe(null);
    expect(result.qualifiedSaving).toBe(0);
  });

  it("treats the threshold as strictly above, not at", () => {
    const at = computeUsDividendTax({ ...BASE, modifiedAgi: 200_000 })!;
    expect(at.magiExcess).toBe(0);
    expect(at.niitTax).toBe(0);
    expect(at.aboveNiitThreshold).toBe(false);
    const over = computeUsDividendTax({ ...BASE, modifiedAgi: 200_001 })!;
    expect(over.aboveNiitThreshold).toBe(true);
    expect(over.niitBase).toBe(1);
  });

  it("adds up", () => {
    const result = computeUsDividendTax({ ...BASE, modifiedAgi: 400_000 })!;
    expect(result.totalTax).toBeCloseTo(
      result.qualifiedTax + result.ordinaryTax + result.niitTax,
      6,
    );
    expect(result.afterTaxIncome).toBeCloseTo(
      result.totalDividends - result.totalTax,
      6,
    );
    expect(result.totalDividends).toBe(12_000);
  });
});
