import { describe, it, expect } from "vitest";
import {
  computeRentalProperty,
  VN_RENTAL_TAX_DEFAULTS,
  type RentalPropertyInput,
} from "@/lib/calc/rental-property";
import { computeLoan } from "@/lib/calc/loan";

// A 3 tỷ apartment let for 15 triệu/tháng, 40% down, borrowed at 9% over
// 20 years, 5% vacancy, 2 triệu/tháng of running costs.
const BASE: RentalPropertyInput = {
  price: 3_000_000_000,
  downPayment: 1_200_000_000,
  purchaseCosts: 150_000_000,
  annualRatePercent: 9,
  termMonths: 240,
  monthlyRent: 15_000_000,
  vacancyPercent: 5,
  monthlyExpenses: 2_000_000,
};

function rental(input: RentalPropertyInput) {
  const result = computeRentalProperty(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeRentalProperty — the income statement", () => {
  it("borrows the price less the deposit", () => {
    expect(rental(BASE).loanAmount).toBe(1_800_000_000);
    expect(rental({ ...BASE, downPayment: 3_000_000_000 }).loanAmount).toBe(0);
  });

  it("counts purchase costs as cash at risk", () => {
    expect(rental(BASE).cashInvested).toBe(1_350_000_000);
  });

  it("takes vacancy off the gross rent", () => {
    const result = rental(BASE);
    expect(result.grossRentPerYear).toBe(180_000_000);
    expect(result.vacancyLossPerYear).toBeCloseTo(9_000_000, 6);
    expect(result.effectiveRentPerYear).toBeCloseTo(171_000_000, 6);
  });

  it("keeps the operating identity", () => {
    const result = rental(BASE);
    expect(result.netOperatingIncomePerYear).toBeCloseTo(
      result.effectiveRentPerYear -
        result.rentalTaxPerYear -
        result.expensesPerYear,
      6,
    );
    expect(result.cashFlowPerYear).toBeCloseTo(
      result.netOperatingIncomePerYear - result.debtServicePerYear,
      6,
    );
    expect(result.cashFlowPerMonth).toBeCloseTo(result.cashFlowPerYear / 12, 6);
  });

  it("agrees with computeLoan on the instalment", () => {
    const loan = computeLoan({
      amount: 1_800_000_000,
      annualRatePercent: 9,
      termMonths: 240,
    })!;
    expect(rental(BASE).monthlyPayment).toBeCloseTo(
      loan.monthlyPrincipalInterest,
      6,
    );
    expect(rental(BASE).debtServicePerYear).toBeCloseTo(
      loan.monthlyPrincipalInterest * 12,
      6,
    );
  });
});

describe("computeRentalProperty — the Vietnamese rental tax", () => {
  // A let collecting 1,14 tỷ — above the 1 tỷ default threshold set by Nghị
  // định 141/2026/NĐ-CP, so both taxes bite. 100 triệu/tháng gross is
  // 1,2 tỷ, less 5% vacancy.
  const TAXED: RentalPropertyInput = { ...BASE, monthlyRent: 100_000_000 };

  it("defaults to the statutory threshold, so a 171 triệu let owes nothing", () => {
    // The prefilled threshold is a legal fact, not a modelling choice, so it
    // is pinned: a revision must not land in the module without landing in
    // the copy too. 1 tỷ ₫/năm per Nghị định 141/2026/NĐ-CP Article 1, which
    // replaced the 500 triệu of Nghị định 68 with effect from 01/01/2026.
    expect(VN_RENTAL_TAX_DEFAULTS.thresholdPerYear).toBe(1_000_000_000);
    const result = rental(BASE);
    expect(result.effectiveRentPerYear).toBeCloseTo(171_000_000, 6);
    expect(result.taxable).toBe(false);
    expect(result.vatPerYear).toBe(0);
    expect(result.pitPerYear).toBe(0);
    expect(result.rentalTaxPerYear).toBe(0);
  });

  it("charges VAT on ALL revenue but PIT only on the excess", () => {
    // Hand-computed: 1,14 tỷ collected against the 1 tỷ threshold.
    //   VAT = 5% × 1.140 triệu           = 57 triệu
    //   PIT = 5% × (1.140 − 1.000) triệu =  7 triệu
    const result = rental(TAXED);
    expect(result.effectiveRentPerYear).toBeCloseTo(1_140_000_000, 6);
    expect(result.taxable).toBe(true);
    expect(result.vatPerYear).toBeCloseTo(57_000_000, 6);
    expect(result.pitPerYear).toBeCloseTo(7_000_000, 6);
    expect(result.rentalTaxPerYear).toBeCloseTo(64_000_000, 6);
  });

  it("charges a 900 triệu let NOTHING under the current threshold", () => {
    // The figure the source review supplied as the test of the repair: with
    // the superseded 500 triệu default this qualifying simple rental was
    // shown 65 triệu (45 VAT + 20 PIT) of tax it does not owe.
    const result = rental({
      ...BASE,
      monthlyRent: 75_000_000,
      vacancyPercent: 0,
    });
    expect(result.effectiveRentPerYear).toBeCloseTo(900_000_000, 6);
    expect(result.taxable).toBe(false);
    expect(result.pitApplies).toBe(false);
    expect(result.rentalTaxPerYear).toBe(0);
    // And the old figure is asserted as what must NOT come back.
    expect(result.rentalTaxPerYear).not.toBeCloseTo(65_000_000, 0);
  });

  it("matches the 1,08 tỷ worked example, not a flat 10%", () => {
    // 1,08 tỷ of rent owes 54 triệu of VAT plus 4 triệu of PIT = 58 triệu. A
    // single combined 10% rate on gross would say 108 triệu. This test is the
    // one that fails if the two bases are ever collapsed back into one.
    const result = rental({
      ...BASE,
      monthlyRent: 90_000_000,
      vacancyPercent: 0,
    });
    expect(result.effectiveRentPerYear).toBeCloseTo(1_080_000_000, 6);
    expect(result.vatPerYear).toBeCloseTo(54_000_000, 6);
    expect(result.pitPerYear).toBeCloseTo(4_000_000, 6);
    expect(result.rentalTaxPerYear).toBeCloseTo(58_000_000, 6);
    expect(result.rentalTaxPerYear).not.toBeCloseTo(108_000_000, 0);
  });

  it("overstates by exactly pitPercent of the threshold if collapsed to one rate", () => {
    // The defect this split fixes, stated as an invariant: a flat 10% on gross
    // charges PIT on the first 1 tỷ as well, and that error is constant in
    // the revenue — which is why it survived spot-checking one figure. Only
    // revenues ABOVE the threshold are swept; below it both taxes are zero
    // and there is no combined rate to compare against.
    for (const monthlyRent of [100_000_000, 150_000_000, 200_000_000]) {
      const result = rental({ ...BASE, monthlyRent, vacancyPercent: 0 });
      expect(result.taxable).toBe(true);
      const flat = result.effectiveRentPerYear * 0.1;
      expect(flat - result.rentalTaxPerYear).toBeCloseTo(
        VN_RENTAL_TAX_DEFAULTS.thresholdPerYear * 0.05,
        6,
      );
    }
  });

  it("charges nothing at all AT the threshold, and VAT on everything just past it", () => {
    // The cliff lives in VAT, the taper in PIT. At exactly the threshold
    // nothing is due; one đồng over, VAT applies to the whole 171 triệu while
    // PIT is still almost nothing.
    const at = rental({ ...BASE, taxThresholdPerYear: 171_000_000 });
    expect(at.taxable).toBe(false);
    expect(at.rentalTaxPerYear).toBe(0);

    const over = rental({ ...BASE, taxThresholdPerYear: 170_999_999 });
    expect(over.taxable).toBe(true);
    expect(over.vatPerYear).toBeCloseTo(8_550_000, 6);
    expect(over.pitPerYear).toBeCloseTo(0.05, 6);
  });

  it("tests the threshold against rent COLLECTED, not rent contracted", () => {
    // 8,8 triệu/tháng is 105,6 triệu gross — above a 100 triệu threshold — but
    // only 100,32 triệu after 5% vacancy, which is still above. At 20% vacancy
    // it falls below and the tax disappears.
    const base = { ...BASE, taxThresholdPerYear: 100_000_000 };
    expect(rental({ ...base, monthlyRent: 8_800_000 }).taxable).toBe(true);
    expect(
      rental({ ...base, monthlyRent: 8_800_000, vacancyPercent: 20 }).taxable,
    ).toBe(false);
  });

  it("is a turnover tax: charged even when the property loses money", () => {
    // 1,14 tỷ collected, 1,2 tỷ of running costs, and the 64 triệu of tax is
    // still charged in full — leaving the property 124 triệu in the red.
    const result = rental({ ...TAXED, monthlyExpenses: 100_000_000 });
    expect(result.rentalTaxPerYear).toBeCloseTo(64_000_000, 6);
    expect(result.netOperatingIncomePerYear).toBeCloseTo(-124_000_000, 6);
  });

  it("keeps rentalTaxPerYear as exactly VAT plus PIT", () => {
    for (const monthlyRent of [15_000_000, 50_000_000, 75_000_000]) {
      const result = rental({ ...BASE, monthlyRent });
      expect(result.rentalTaxPerYear).toBeCloseTo(
        result.vatPerYear + result.pitPerYear,
        6,
      );
    }
  });

  it("honours custom rates and a custom threshold", () => {
    // Both rates and the threshold are inputs because all three have been
    // revised. 3% on all of 171 triệu, 2% on the 71 triệu above 100 triệu.
    const result = rental({
      ...BASE,
      vatPercent: 3,
      pitPercent: 2,
      taxThresholdPerYear: 100_000_000,
    });
    expect(result.vatPerYear).toBeCloseTo(5_130_000, 6);
    expect(result.pitPerYear).toBeCloseTo(1_420_000, 6);
    expect(result.rentalTaxPerYear).toBeCloseTo(6_550_000, 6);

    // A rate of zero is a legitimate answer, not a rejected input: it is how
    // you model one of the two taxes not applying.
    const vatOnly = rental({ ...TAXED, pitPercent: 0 });
    expect(vatOnly.pitPerYear).toBe(0);
    expect(vatOnly.rentalTaxPerYear).toBeCloseTo(57_000_000, 6);
  });
});

// The two taxes take two thresholds, and a declared relief touches one of
// them. Fixture from the project's source review: 1,08 tỷ of collected rent
// against a 500 triệu VAT threshold and the 1 tỷ PIT deduction an official
// Ministry of Finance answer restates for non-lodging letting.
describe("computeRentalProperty — two thresholds, and the declared relief", () => {
  /** 1,08 tỷ/năm of collected rent, no vacancy, paid in cash. */
  const TAXED: RentalPropertyInput = {
    ...BASE,
    downPayment: 3_000_000_000,
    monthlyRent: 90_000_000,
    vacancyPercent: 0,
    monthlyExpenses: 0,
  };

  it("reads each tax against its OWN threshold", () => {
    const r = rental({ ...TAXED, pitThresholdPerYear: 1_000_000_000 });
    expect(r.effectiveRentPerYear).toBe(1_080_000_000);
    // VAT: 5% of ALL the revenue, because the 1 tỷ cliff was passed.
    expect(r.vatPerYear).toBeCloseTo(54_000_000, 6);
    // PIT: 5% of the excess over its own 1 tỷ deduction — 80 triệu.
    expect(r.pitPerYear).toBeCloseTo(4_000_000, 6);
    expect(r.rentalTaxPerYear).toBeCloseTo(58_000_000, 6);
    expect(r.taxable).toBe(true);
    expect(r.pitApplies).toBe(true);
  });

  it("lets ONE tax apply while the other does not", () => {
    // The case a single shared figure cannot express, and the reason the two
    // are separate fields even though Decree 141 puts both at 1 tỷ today: a
    // landlord letting two places allocates ONE PIT deduction across them,
    // so the share carried by this property can be lower than the VAT gate.
    const r = rental({
      ...TAXED,
      pitThresholdPerYear: 500_000_000,
    });
    expect(r.taxable).toBe(true);
    expect(r.vatPerYear).toBeCloseTo(54_000_000, 6);
    expect(r.pitApplies).toBe(true);
    expect(r.pitPerYear).toBeCloseTo(29_000_000, 6);

    // And the other direction: under the VAT gate, over a smaller allocated
    // PIT deduction.
    const under = rental({
      ...TAXED,
      monthlyRent: 75_000_000,
      pitThresholdPerYear: 500_000_000,
    });
    expect(under.taxable).toBe(false);
    expect(under.vatPerYear).toBe(0);
    expect(under.pitApplies).toBe(true);
    expect(under.pitPerYear).toBeCloseTo(20_000_000, 6);
  });

  it("defaults the PIT deduction to the VAT threshold when it is not given", () => {
    const shared = rental(TAXED);
    const explicit = rental({
      ...TAXED,
      pitThresholdPerYear: VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
    });
    expect(shared).toEqual(explicit);
  });

  it("applies a declared relief to PIT ONLY, never to the combined bill", () => {
    const r = rental({
      ...TAXED,
      pitThresholdPerYear: 1_000_000_000,
      pitReliefPercent: 30,
    });
    expect(r.vatPerYear).toBeCloseTo(54_000_000, 6);
    expect(r.pitPerYear).toBeCloseTo(4_000_000, 6);
    expect(r.pitReliefPerYear).toBeCloseTo(1_200_000, 6);
    expect(r.pitAfterReliefPerYear).toBeCloseTo(2_800_000, 6);
    // 54 + 2,8 = 56,8 triệu. NOT 58 × 70% = 40,6 triệu, which is what taking
    // the reduction off the combined bill would give — wrong by 30% of VAT.
    expect(r.rentalTaxPerYear).toBeCloseTo(56_800_000, 6);
    expect(r.rentalTaxBeforeReliefPerYear).toBeCloseTo(58_000_000, 6);
    expect(r.rentalTaxPerYear).not.toBeCloseTo(40_600_000, 0);
  });

  it("changes nothing at all when no relief is declared", () => {
    const none = rental({ ...TAXED, pitThresholdPerYear: 1_000_000_000 });
    expect(none.pitReliefPerYear).toBe(0);
    expect(none.pitAfterReliefPerYear).toBe(none.pitPerYear);
    expect(none.rentalTaxPerYear).toBe(none.rentalTaxBeforeReliefPerYear);
    expect(
      rental({ ...TAXED, pitThresholdPerYear: 1_000_000_000, pitReliefPercent: 0 }),
    ).toEqual(none);
  });

  it("carries the relief through to the cash flow it changes", () => {
    const before = rental({ ...TAXED, pitThresholdPerYear: 1_000_000_000 });
    const after = rental({
      ...TAXED,
      pitThresholdPerYear: 1_000_000_000,
      pitReliefPercent: 30,
    });
    expect(after.netOperatingIncomePerYear - before.netOperatingIncomePerYear)
      .toBeCloseTo(1_200_000, 6);
    expect(after.cashFlowPerYear - before.cashFlowPerYear).toBeCloseTo(
      1_200_000,
      6,
    );
  });

  it("rejects an impossible threshold or relief rather than clamping", () => {
    expect(
      computeRentalProperty({ ...TAXED, pitThresholdPerYear: -1 }),
    ).toBeNull();
    expect(
      computeRentalProperty({ ...TAXED, pitReliefPercent: -1 }),
    ).toBeNull();
    expect(
      computeRentalProperty({ ...TAXED, pitReliefPercent: 101 }),
    ).toBeNull();
    expect(
      computeRentalProperty({ ...TAXED, pitReliefPercent: 100 }),
    ).not.toBeNull();
  });
});

describe("computeRentalProperty — the four yields", () => {
  it("computes gross yield off the price alone", () => {
    expect(rental(BASE).grossYieldPercent).toBeCloseTo(6, 10);
  });

  it("computes the cap rate net of costs but before financing", () => {
    const result = rental(BASE);
    expect(result.capRatePercent).toBeCloseTo(
      (result.netOperatingIncomePerYear / 3_000_000_000) * 100,
      10,
    );
    // The gap between gross yield and cap rate is the cost of ownership.
    expect(result.capRatePercent).toBeLessThan(result.grossYieldPercent);
  });

  it("leaves the cap rate untouched by how the purchase was financed", () => {
    // The point of the cap rate: it is the property's return, not yours.
    const geared = rental(BASE);
    const cash = rental({ ...BASE, downPayment: 3_000_000_000 });
    expect(cash.capRatePercent).toBeCloseTo(geared.capRatePercent, 10);
  });

  it("computes cash-on-cash off the money actually put in", () => {
    const result = rental(BASE);
    expect(result.cashOnCashPercent).toBeCloseTo(
      (result.cashFlowPerYear / 1_350_000_000) * 100,
      10,
    );
  });

  it("shows leverage turning a positive cap rate into a negative return", () => {
    // The whole reason all four are reported. The property earns money; the
    // owner does not, because the loan costs more than the property yields.
    const result = rental(BASE);
    expect(result.capRatePercent).toBeGreaterThan(0);
    expect(result.cashFlowPerYear).toBeLessThan(0);
    expect(result.cashOnCashPercent!).toBeLessThan(0);
  });

  it("has no cash-on-cash figure when nothing was invested", () => {
    const result = rental({ ...BASE, downPayment: 0, purchaseCosts: 0 });
    expect(result.cashInvested).toBe(0);
    expect(result.cashOnCashPercent).toBeNull();
  });
});

describe("computeRentalProperty — the debt service cover", () => {
  it("falls below 1 when the rent does not cover the loan", () => {
    const result = rental(BASE);
    expect(result.dscr!).toBeLessThan(1);
    expect(result.cashFlowPerYear).toBeLessThan(0);
  });

  it("rises above 1 with a bigger deposit", () => {
    const result = rental({ ...BASE, downPayment: 2_400_000_000 });
    expect(result.dscr!).toBeGreaterThan(1);
    expect(result.cashFlowPerYear).toBeGreaterThan(0);
  });

  it("crosses 1 exactly where the cash flow crosses zero", () => {
    for (const downPayment of [1_200_000_000, 1_800_000_000, 2_400_000_000]) {
      const result = rental({ ...BASE, downPayment });
      expect(result.dscr! >= 1).toBe(result.cashFlowPerYear >= 0);
    }
  });

  it("has no DSCR when paying cash", () => {
    const result = rental({ ...BASE, downPayment: 3_000_000_000 });
    expect(result.dscr).toBeNull();
    expect(result.debtServicePerYear).toBe(0);
    expect(result.monthlyPayment).toBe(0);
  });
});

describe("computeRentalProperty — edges and rejection", () => {
  it("handles full vacancy", () => {
    const result = rental({ ...BASE, vacancyPercent: 100 });
    expect(result.effectiveRentPerYear).toBe(0);
    expect(result.vatPerYear).toBe(0);
    expect(result.pitPerYear).toBe(0);
    expect(result.rentalTaxPerYear).toBe(0);
    expect(result.netOperatingIncomePerYear).toBeCloseTo(-24_000_000, 6);
  });

  it("survives realistic 240, 300 and 360-month terms", () => {
    for (const termMonths of [240, 300, 360]) {
      expect(rental({ ...BASE, termMonths }).monthlyPayment).toBeGreaterThan(0);
    }
  });

  it("rejects a borrowed amount with no usable term", () => {
    expect(computeRentalProperty({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, termMonths: 240.5 })).toBeNull();
    // …but a cash purchase needs no term at all.
    expect(
      computeRentalProperty({
        ...BASE,
        downPayment: 3_000_000_000,
        termMonths: 0,
      }),
    ).not.toBeNull();
  });

  it("rejects a deposit above the price", () => {
    expect(
      computeRentalProperty({ ...BASE, downPayment: 3_000_000_001 }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeRentalProperty({ ...BASE, price: 0 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, price: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, monthlyRent: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, vacancyPercent: 101 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, vacancyPercent: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, vatPercent: 101 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, pitPercent: 101 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, vatPercent: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, pitPercent: -1 })).toBeNull();
    expect(
      computeRentalProperty({ ...BASE, taxThresholdPerYear: -1 }),
    ).toBeNull();
    expect(computeRentalProperty({ ...BASE, monthlyExpenses: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, purchaseCosts: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, price: Number.NaN })).toBeNull();
  });
});
