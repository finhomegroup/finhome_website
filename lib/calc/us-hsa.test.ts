import { describe, expect, it } from "vitest";
import { computeUsHsa, HSA_YEARS, type HsaInput } from "@/lib/calc/us-hsa";

const BASE: HsaInput = {
  year: 2026,
  coverage: "family",
  age: 40,
  contribution: 6_750,
  employerContribution: 2_000,
  federalRatePercent: 24,
  stateRatePercent: 5,
  viaPayroll: true,
  currentBalance: 10_000,
  returnPercent: 7,
  years: 20,
};

describe("computeUsHsa — limits", () => {
  it("counts the employer's money against the SAME limit", () => {
    const result = computeUsHsa(BASE)!;
    // 8.750 family limit for 2026; 6.750 + 2.000 fills it exactly.
    expect(result.totalLimit).toBe(8_750);
    expect(result.totalContribution).toBe(8_750);
    expect(result.remainingRoom).toBe(0);
    expect(result.excessContribution).toBe(0);
  });

  it("flags an excess when the two sources together overshoot", () => {
    // The most common HSA mistake: treating the employer's contribution as
    // a separate allowance. The holder does not know they overshot.
    const result = computeUsHsa({ ...BASE, contribution: 8_750 })!;
    expect(result.totalContribution).toBe(10_750);
    expect(result.excessContribution).toBe(2_000);
    expect(result.remainingRoom).toBe(0);
  });

  it("gives no deduction for the excess", () => {
    const result = computeUsHsa({ ...BASE, contribution: 8_750 })!;
    // Only 6.750 of the employee's 8.750 fits under the limit alongside
    // the employer's 2.000, so only that much is deductible. Crediting the
    // full contribution would overstate the saving by the excess.
    const deductible = 6_750;
    expect(result.incomeTaxSaved).toBeCloseTo(deductible * 0.29, 6);
    expect(result.ficaSaved).toBeCloseTo(deductible * 0.0765, 6);
  });

  it("adds the catch-up allowance from 55", () => {
    const younger = computeUsHsa({ ...BASE, age: 54 })!;
    const older = computeUsHsa({ ...BASE, age: 55 })!;
    expect(younger.catchUpAvailable).toBe(0);
    expect(younger.totalLimit).toBe(8_750);
    expect(older.catchUpAvailable).toBe(1_000);
    expect(older.totalLimit).toBe(9_750);
    // The extra room appears as room, not as a bigger contribution.
    expect(older.remainingRoom).toBe(1_000);
  });

  it("uses the self-only limit for self-only coverage", () => {
    const result = computeUsHsa({
      ...BASE,
      coverage: "selfOnly",
      contribution: 2_400,
    })!;
    expect(result.baseLimit).toBe(HSA_YEARS[2026].selfOnlyLimit);
    expect(result.totalLimit).toBe(4_400);
    expect(result.remainingRoom).toBe(0);
  });

  it("uses the year's own limits", () => {
    const older = computeUsHsa({ ...BASE, year: 2025 })!;
    const newer = computeUsHsa({ ...BASE, year: 2026 })!;
    expect(older.totalLimit).toBe(8_550);
    expect(newer.totalLimit).toBe(8_750);
    // 8.750 overshoots the 2025 limit by 200.
    expect(older.excessContribution).toBe(200);
    expect(newer.excessContribution).toBe(0);
  });

  it("refuses an unknown year rather than borrowing a limit", () => {
    expect(computeUsHsa({ ...BASE, year: 2020 })).toBe(null);
    expect(computeUsHsa({ ...BASE, year: 2030 })).toBe(null);
  });
});

describe("computeUsHsa — the FICA advantage", () => {
  it("saves FICA on top of income tax, through payroll", () => {
    const result = computeUsHsa(BASE)!;
    // Income tax at 24 + 5 = 29% on 6.750.
    expect(result.incomeTaxSaved).toBeCloseTo(1_957.5, 6);
    // Plus 7,65% FICA — the advantage most write-ups omit.
    expect(result.ficaSaved).toBeCloseTo(516.375, 6);
    expect(result.firstYearTaxSaved).toBeCloseTo(2_473.875, 6);
    // So 6.750 into the account costs 4.276,125 out of pocket.
    expect(result.netCostOfContribution).toBeCloseTo(4_276.125, 6);
  });

  it("withholds the FICA saving from a direct contribution", () => {
    const payroll = computeUsHsa(BASE)!;
    const cheque = computeUsHsa({ ...BASE, viaPayroll: false })!;
    expect(cheque.ficaSaved).toBe(0);
    // Income tax is identical; only FICA differs. Writing a cheque to the
    // same account in April forfeits 516,375 for nothing.
    expect(cheque.incomeTaxSaved).toBeCloseTo(payroll.incomeTaxSaved, 8);
    expect(payroll.firstYearTaxSaved - cheque.firstYearTaxSaved).toBeCloseTo(
      516.375,
      6,
    );
    expect(cheque.netCostOfContribution).toBeGreaterThan(
      payroll.netCostOfContribution,
    );
  });

  it("makes FICA worth more than income tax at low brackets", () => {
    // The claim in the module docstring, checked. At the 12% bracket in a
    // no-income-tax state, 7,65% FICA is most of the benefit.
    const result = computeUsHsa({
      ...BASE,
      federalRatePercent: 12,
      stateRatePercent: 0,
    })!;
    expect(result.incomeTaxSaved).toBeCloseTo(6_750 * 0.12, 6);
    expect(result.ficaSaved).toBeCloseTo(6_750 * 0.0765, 6);
    // Not larger than income tax at 12%, but nearly two thirds of it —
    // and it IS larger below the 10% bracket boundary.
    expect(result.ficaSaved / result.incomeTaxSaved).toBeCloseTo(0.6375, 6);
    const lowest = computeUsHsa({
      ...BASE,
      federalRatePercent: 7,
      stateRatePercent: 0,
    })!;
    expect(lowest.ficaSaved).toBeGreaterThan(lowest.incomeTaxSaved);
  });
});

describe("computeUsHsa — projection", () => {
  it("compounds contributions from the start of each year", () => {
    const result = computeUsHsa({ ...BASE, years: 1 })!;
    // (10.000 + 8.750) x 1,07 = 20.062,50.
    expect(result.projectedBalance).toBeCloseTo(20_062.5, 6);
    expect(result.totalContributed).toBe(8_750);
    expect(result.projectedGrowth).toBeCloseTo(1_312.5, 6);
  });

  it("projects the full horizon", () => {
    const result = computeUsHsa(BASE)!;
    // 20 years of 8.750 at 7%, on a 10.000 opening balance.
    expect(result.projectedBalance).toBeCloseTo(422_517.1415, 4);
    expect(result.totalContributed).toBe(175_000);
    expect(result.projectedGrowth).toBeCloseTo(237_517.1415, 4);
    // Growth exceeds contributions over this horizon, which is the whole
    // argument for treating the HSA as an investment account.
    expect(result.projectedGrowth).toBeGreaterThan(result.totalContributed);
  });

  it("returns the opening balance for a zero horizon", () => {
    const result = computeUsHsa({ ...BASE, years: 0 })!;
    expect(result.projectedBalance).toBe(10_000);
    expect(result.totalContributed).toBe(0);
    expect(result.projectedGrowth).toBe(0);
    expect(result.ageAtHorizon).toBe(40);
  });

  it("prices the untaxed growth", () => {
    const result = computeUsHsa(BASE)!;
    // What that growth would have cost in a taxable account at 24%.
    expect(result.taxOnGrowthIfTaxable).toBeCloseTo(237_517.1415 * 0.24, 3);
  });

  it("reports no tax on growth when there is none", () => {
    const result = computeUsHsa({ ...BASE, returnPercent: 0 })!;
    expect(result.projectedGrowth).toBeCloseTo(0, 6);
    expect(result.taxOnGrowthIfTaxable).toBeCloseTo(0, 6);
    expect(result.projectedBalance).toBeCloseTo(10_000 + 175_000, 6);
  });

  it("does not credit tax on a loss", () => {
    const result = computeUsHsa({ ...BASE, returnPercent: -5 })!;
    expect(result.projectedGrowth).toBeLessThan(0);
    // A negative growth figure must not become a negative tax, which would
    // read as a benefit.
    expect(result.taxOnGrowthIfTaxable).toBe(0);
  });
});

describe("computeUsHsa — withdrawals", () => {
  it("taxes a medical withdrawal at nothing, ever", () => {
    const young = computeUsHsa({ ...BASE, years: 5 })!;
    const old = computeUsHsa({ ...BASE, years: 40 })!;
    // The third advantage, and it does not depend on age at all.
    expect(young.medicalWithdrawalTax).toBe(0);
    expect(old.medicalWithdrawalTax).toBe(0);
  });

  it("taxes AND penalises a non-medical withdrawal before 65", () => {
    // Age 40 + 20 years = 60, still under 65.
    const result = computeUsHsa(BASE)!;
    expect(result.ageAtHorizon).toBe(60);
    expect(result.penaltyApplies).toBe(true);
    expect(result.nonMedicalTax).toBeCloseTo(result.projectedBalance * 0.29, 4);
    expect(result.nonMedicalPenalty).toBeCloseTo(
      result.projectedBalance * 0.2,
      4,
    );
    // 49% of the balance gone: that is what the penalty is for.
    expect(result.nonMedicalNet).toBeCloseTo(result.projectedBalance * 0.51, 4);
  });

  it("drops the penalty from 65, leaving it like a traditional IRA", () => {
    const result = computeUsHsa({ ...BASE, years: 25 })!;
    expect(result.ageAtHorizon).toBe(65);
    expect(result.penaltyApplies).toBe(false);
    expect(result.nonMedicalPenalty).toBe(0);
    // Taxed as income and nothing more.
    expect(result.nonMedicalNet).toBeCloseTo(result.projectedBalance * 0.71, 4);
  });

  it("treats 65 as the boundary, not 66", () => {
    const at64 = computeUsHsa({ ...BASE, years: 24 })!;
    const at65 = computeUsHsa({ ...BASE, years: 25 })!;
    expect(at64.penaltyApplies).toBe(true);
    expect(at65.penaltyApplies).toBe(false);
  });

  it("keeps the medical and non-medical cases separate", () => {
    // Deliberately not averaged into one "expected" figure: the reader's
    // own split between medical and other spending is the input the module
    // does not have, and inventing it would bury the 20% penalty.
    const result = computeUsHsa(BASE)!;
    expect(result.medicalWithdrawalTax).toBe(0);
    expect(result.nonMedicalTax).toBeGreaterThan(0);
    expect(result.nonMedicalNet).toBeLessThan(result.projectedBalance);
  });
});

describe("computeUsHsa — validation", () => {
  it("rejects impossible inputs", () => {
    expect(computeUsHsa({ ...BASE, contribution: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, employerContribution: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, currentBalance: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, age: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, age: 121 })).toBe(null);
    expect(computeUsHsa({ ...BASE, years: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, years: 71 })).toBe(null);
    expect(computeUsHsa({ ...BASE, years: 10.5 })).toBe(null);
    expect(computeUsHsa({ ...BASE, federalRatePercent: 101 })).toBe(null);
    expect(computeUsHsa({ ...BASE, stateRatePercent: -1 })).toBe(null);
    expect(computeUsHsa({ ...BASE, returnPercent: -101 })).toBe(null);
  });

  it("accepts the boundaries", () => {
    expect(computeUsHsa({ ...BASE, years: 0 })).not.toBe(null);
    expect(computeUsHsa({ ...BASE, years: 70 })).not.toBe(null);
    expect(computeUsHsa({ ...BASE, contribution: 0 })).not.toBe(null);
    expect(computeUsHsa({ ...BASE, age: 0 })).not.toBe(null);
    expect(computeUsHsa({ ...BASE, federalRatePercent: 0 })).not.toBe(null);
  });

  it("handles a zero contribution as a pure projection", () => {
    const result = computeUsHsa({
      ...BASE,
      contribution: 0,
      employerContribution: 0,
    })!;
    expect(result.firstYearTaxSaved).toBe(0);
    expect(result.netCostOfContribution).toBe(0);
    expect(result.remainingRoom).toBe(8_750);
    // The existing balance still compounds.
    expect(result.projectedBalance).toBeCloseTo(10_000 * Math.pow(1.07, 20), 6);
  });
});
