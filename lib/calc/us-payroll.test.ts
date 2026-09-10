import { describe, expect, it } from "vitest";
import {
  computeUsPayroll,
  PAYROLL_YEARS,
  SELF_EMPLOYMENT_NET_EARNINGS_FACTOR,
  type PayrollInput,
} from "@/lib/calc/us-payroll";

const BASE: PayrollInput = {
  wages: 100_000,
  filingStatus: "single",
  year: 2026,
  selfEmployed: false,
};

describe("computeUsPayroll", () => {
  it("charges 7,65% below every threshold", () => {
    const result = computeUsPayroll(BASE)!;
    expect(result.socialSecurityTax).toBeCloseTo(6_200, 6);
    expect(result.medicareTax).toBeCloseTo(1_450, 6);
    expect(result.additionalMedicareTax).toBe(0);
    expect(result.employeeTotal).toBeCloseTo(7_650, 6);
    expect(result.effectiveRatePercent).toBeCloseTo(7.65, 8);
    expect(result.marginalRatePercent).toBeCloseTo(7.65, 8);
    expect(result.aboveWageBase).toBe(false);
    expect(result.aboveSurtaxThreshold).toBe(false);
    expect(result.cappedSaving).toBe(0);
  });

  it("caps Social Security at the wage base", () => {
    const base = PAYROLL_YEARS[2026].socialSecurityWageBase;
    const result = computeUsPayroll({ ...BASE, wages: 300_000 })!;
    expect(result.socialSecurityWages).toBe(base);
    expect(result.socialSecurityTax).toBeCloseTo(base * 0.062, 6);
    // Medicare has no cap, so it keeps climbing on the full 300k.
    expect(result.medicareTax).toBeCloseTo(4_350, 6);
    expect(result.aboveWageBase).toBe(true);
    // The cap is worth the tax on the 115.500 USD above it.
    expect(result.cappedSaving).toBeCloseTo((300_000 - base) * 0.062, 6);
  });

  it("makes the marginal rate FALL once past the wage base", () => {
    // The headline claim of the tool. Payroll tax is regressive at the top,
    // which is the opposite of income tax.
    const below = computeUsPayroll({ ...BASE, wages: 150_000 })!;
    const above = computeUsPayroll({ ...BASE, wages: 190_000 })!;
    expect(below.marginalRatePercent).toBeCloseTo(7.65, 8);
    expect(above.marginalRatePercent).toBeCloseTo(1.45, 8);
    expect(above.marginalRatePercent).toBeLessThan(below.marginalRatePercent);
    // And so does the effective rate, even though total tax is higher.
    expect(above.employeeTotal).toBeGreaterThan(below.employeeTotal);
    expect(above.effectiveRatePercent!).toBeLessThan(
      below.effectiveRatePercent!,
    );
  });

  it("adds 0,9% only above the surtax threshold", () => {
    const at = computeUsPayroll({ ...BASE, wages: 200_000 })!;
    expect(at.additionalMedicareWages).toBe(0);
    expect(at.additionalMedicareTax).toBe(0);
    expect(at.aboveSurtaxThreshold).toBe(false);

    const over = computeUsPayroll({ ...BASE, wages: 250_000 })!;
    expect(over.additionalMedicareWages).toBe(50_000);
    expect(over.additionalMedicareTax).toBeCloseTo(450, 6);
    expect(over.marginalRatePercent).toBeCloseTo(1.45 + 0.9, 8);
  });

  it("uses a different surtax threshold per filing status", () => {
    const single = computeUsPayroll({ ...BASE, wages: 240_000 })!;
    const married = computeUsPayroll({
      ...BASE,
      wages: 240_000,
      filingStatus: "married",
    })!;
    const separate = computeUsPayroll({
      ...BASE,
      wages: 240_000,
      filingStatus: "marriedSeparate",
    })!;
    expect(single.additionalMedicareWages).toBe(40_000);
    // A joint filer at the same wage is below the 250k threshold entirely.
    expect(married.additionalMedicareWages).toBe(0);
    // Filing separately halves it to 125k, catching far more.
    expect(separate.additionalMedicareWages).toBe(115_000);
  });

  it("matches the employee share, except the surtax", () => {
    const result = computeUsPayroll({ ...BASE, wages: 250_000 })!;
    const base = PAYROLL_YEARS[2026].socialSecurityWageBase;
    // Employer pays 6,2% capped plus 1,45% uncapped — and nothing on the
    // 0,9%, which is the worker's alone.
    expect(result.employerTotal).toBeCloseTo(base * 0.062 + 250_000 * 0.0145, 6);
    expect(result.employeeTotal - result.employerTotal).toBeCloseTo(450, 6);
    expect(result.combinedTotal).toBeCloseTo(
      result.employeeTotal + result.employerTotal,
      6,
    );
  });

  it("uses 92,35% of net profit and charges both halves to the self-employed", () => {
    const own = computeUsPayroll({
      ...BASE,
      wages: 100_000,
      selfEmployed: true,
    })!;
    expect(own.taxBase).toBeCloseTo(92_350, 6);
    expect(own.socialSecurityTax).toBeCloseTo(92_350 * 0.124, 6);
    expect(own.medicareTax).toBeCloseTo(92_350 * 0.029, 6);
    expect(own.employeeTotal).toBeCloseTo(
      100_000 * SELF_EMPLOYMENT_NET_EARNINGS_FACTOR * 0.153,
      6,
    );
    expect(own.employerTotal).toBe(0);
    expect(own.combinedTotal).toBeCloseTo(own.employeeTotal, 6);
  });

  it("reports the marginal rate per next dollar of self-employment profit", () => {
    const own = computeUsPayroll({
      ...BASE,
      wages: 100_000,
      selfEmployed: true,
    })!;
    expect(own.marginalRatePercent).toBeCloseTo(15.3 * 0.9235, 8);
    const high = computeUsPayroll({
      ...BASE,
      wages: 300_000,
      selfEmployed: true,
    })!;
    // Past both thresholds: (2 x 1,45 + 0,9) on 92,35% of the next dollar.
    expect(high.marginalRatePercent).toBeCloseTo(3.8 * 0.9235, 8);
  });

  it("uses the year's own wage base", () => {
    const older = computeUsPayroll({ ...BASE, wages: 300_000, year: 2025 })!;
    const newer = computeUsPayroll({ ...BASE, wages: 300_000, year: 2026 })!;
    expect(older.params.socialSecurityWageBase).toBe(176_100);
    expect(newer.params.socialSecurityWageBase).toBe(184_500);
    // The base rose, so the same wage pays more Social Security tax.
    expect(newer.socialSecurityTax).toBeGreaterThan(older.socialSecurityTax);
    // Medicare is unaffected — no cap to move.
    expect(newer.medicareTax).toBeCloseTo(older.medicareTax, 6);
  });

  it("refuses an unknown year rather than defaulting to another one", () => {
    // Silently using a different year's wage base would produce a wrong
    // number that looks entirely plausible.
    expect(computeUsPayroll({ ...BASE, year: 2019 })).toBe(null);
    expect(computeUsPayroll({ ...BASE, year: 2030 })).toBe(null);
  });

  it("rejects negative wages and handles zero", () => {
    expect(computeUsPayroll({ ...BASE, wages: -1 })).toBe(null);
    const zero = computeUsPayroll({ ...BASE, wages: 0 })!;
    expect(zero.employeeTotal).toBe(0);
    // No wages means no rate, not a zero rate.
    expect(zero.effectiveRatePercent).toBe(null);
  });

  it("keeps the effective rate below the marginal rate below the cap", () => {
    // Below every threshold the two coincide, because the tax is flat.
    const flat = computeUsPayroll({ ...BASE, wages: 50_000 })!;
    expect(flat.effectiveRatePercent).toBeCloseTo(flat.marginalRatePercent, 8);
    // Above the cap the effective rate sits between the two regimes.
    const high = computeUsPayroll({ ...BASE, wages: 400_000 })!;
    expect(high.effectiveRatePercent!).toBeGreaterThan(
      high.marginalRatePercent,
    );
    expect(high.effectiveRatePercent!).toBeLessThan(7.65);
  });
});

describe("marginalRatePercent at the boundaries", () => {
  // marginalRatePercent answers a NEXT-dollar question, so exactly ON a
  // boundary it must report the RIGHT-hand derivative of the statutory
  // schedule. At wages equal to the wage base the Social Security maximum
  // is already paid, so the next dollar costs 1,45% (or 2,9% self-employed);
  // at wages equal to the surtax threshold the next dollar is the first one
  // "in excess of" it and carries the extra 0,9%. Both boundary values are
  // printed on the page as result rows, so typing them is expected use.

  it("charges no more Social Security on the dollar after the wage base", () => {
    const base = PAYROLL_YEARS[2026].socialSecurityWageBase; // 184.500
    expect(
      computeUsPayroll({ ...BASE, wages: base - 1 })!.marginalRatePercent,
    ).toBeCloseTo(7.65, 8);
    // 6,2 + 1,45 -> 1,45: the last dollar cost 7,65%, the next costs 1,45%.
    expect(
      computeUsPayroll({ ...BASE, wages: base })!.marginalRatePercent,
    ).toBeCloseTo(1.45, 8);
    expect(
      computeUsPayroll({ ...BASE, wages: base + 1 })!.marginalRatePercent,
    ).toBeCloseTo(1.45, 8);
  });

  it("charges the surtax on the dollar after the threshold", () => {
    const threshold = 200_000; // single
    expect(
      computeUsPayroll({ ...BASE, wages: threshold - 1 })!.marginalRatePercent,
    ).toBeCloseTo(1.45, 8);
    const at = computeUsPayroll({ ...BASE, wages: threshold })!;
    expect(at.marginalRatePercent).toBeCloseTo(2.35, 8);
    // The flag and the rate are deliberately DIFFERENT questions: no surtax
    // is owed on these wages (nothing is in excess of the threshold yet),
    // but the next dollar earned does carry it.
    expect(at.aboveSurtaxThreshold).toBe(false);
    expect(at.additionalMedicareTax).toBe(0);
    expect(
      computeUsPayroll({ ...BASE, wages: threshold + 1 })!.marginalRatePercent,
    ).toBeCloseTo(2.35, 8);
  });

  it("places self-employed boundaries after the 92,35% adjustment", () => {
    const base = PAYROLL_YEARS[2026].socialSecurityWageBase;
    const profitAtBase = base / SELF_EMPLOYMENT_NET_EARNINGS_FACTOR;
    expect(
      computeUsPayroll({ ...BASE, wages: profitAtBase, selfEmployed: true })!
        .marginalRatePercent,
    ).toBeCloseTo(2.9 * SELF_EMPLOYMENT_NET_EARNINGS_FACTOR, 8);
    const profitAtSurtax = 200_000 / SELF_EMPLOYMENT_NET_EARNINGS_FACTOR;
    expect(
      computeUsPayroll({ ...BASE, wages: profitAtSurtax, selfEmployed: true })!
        .marginalRatePercent,
    ).toBeCloseTo(3.8 * SELF_EMPLOYMENT_NET_EARNINGS_FACTOR, 8);
  });

  it("uses each filing status's own threshold at the boundary", () => {
    expect(
      computeUsPayroll({ ...BASE, wages: 250_000, filingStatus: "married" })!
        .marginalRatePercent,
    ).toBeCloseTo(2.35, 8);
    expect(
      computeUsPayroll({ ...BASE, wages: 200_000, filingStatus: "head" })!
        .marginalRatePercent,
    ).toBeCloseTo(2.35, 8);
    // 125.000 sits BELOW the wage base, so Social Security still applies and
    // the surtax stacks on top of the full rate: 6,2 + 1,45 + 0,9.
    expect(
      computeUsPayroll({
        ...BASE,
        wages: 125_000,
        filingStatus: "marriedSeparate",
      })!.marginalRatePercent,
    ).toBeCloseTo(8.55, 8);
  });

  it("applies the same rule to the earlier year's own wage base", () => {
    const base2025 = PAYROLL_YEARS[2025].socialSecurityWageBase; // 176.100
    expect(
      computeUsPayroll({ ...BASE, wages: base2025 - 1, year: 2025 })!
        .marginalRatePercent,
    ).toBeCloseTo(7.65, 8);
    expect(
      computeUsPayroll({ ...BASE, wages: base2025, year: 2025 })!
        .marginalRatePercent,
    ).toBeCloseTo(1.45, 8);
    expect(
      computeUsPayroll({ ...BASE, wages: 200_000, year: 2025 })!
        .marginalRatePercent,
    ).toBeCloseTo(2.35, 8);
  });

  it("equals the forward difference of the tax bill over the next dollar", () => {
    // The definition, checked against the module's own money figures rather
    // than against the marginal-rate formula: the cost of one more dollar of
    // wages. Residue is float only (worst ~7e-11 on a ~1e2 subtraction), so
    // 6 decimal places is generous but not loose.
    const wages = [
      50_000, 100_000, 176_099, 176_100, 184_499, 184_500, 184_501, 199_999,
      200_000, 200_001, 250_000, 400_000,
    ];
    for (const year of [2025, 2026]) {
      for (const selfEmployed of [false, true]) {
        for (const w of wages) {
          const here = computeUsPayroll({ ...BASE, wages: w, year, selfEmployed })!;
          const next = computeUsPayroll({
            ...BASE,
            wages: w + 1,
            year,
            selfEmployed,
          })!;
          expect(here.marginalRatePercent).toBeCloseTo(
            (next.employeeTotal - here.employeeTotal) * 100,
            6,
          );
        }
      }
    }
  });
});
