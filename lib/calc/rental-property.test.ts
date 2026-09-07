import { describe, it, expect } from "vitest";
import {
  computeRentalProperty,
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
  it("charges 10% of collected rent above the threshold", () => {
    // 171 triệu collected, above the 100 triệu threshold.
    const result = rental(BASE);
    expect(result.taxable).toBe(true);
    expect(result.rentalTaxPerYear).toBeCloseTo(17_100_000, 6);
  });

  it("charges nothing at all below the threshold", () => {
    // A cliff, not a taper: below the threshold the tax is zero.
    const result = rental({ ...BASE, monthlyRent: 8_000_000 });
    expect(result.effectiveRentPerYear).toBeCloseTo(91_200_000, 6);
    expect(result.taxable).toBe(false);
    expect(result.rentalTaxPerYear).toBe(0);
  });

  it("tests the threshold against rent COLLECTED, not rent contracted", () => {
    // 8,8 triệu/tháng is 105,6 triệu gross — above the threshold — but only
    // 100,32 triệu after 5% vacancy, which is still above. At 20% vacancy it
    // falls below and the tax disappears.
    expect(rental({ ...BASE, monthlyRent: 8_800_000 }).taxable).toBe(true);
    expect(
      rental({ ...BASE, monthlyRent: 8_800_000, vacancyPercent: 20 }).taxable,
    ).toBe(false);
  });

  it("is a turnover tax: charged even when the property loses money", () => {
    // 171 triệu collected, 168 triệu of costs, and the 17,1 triệu of tax is
    // still charged in full — leaving the property 14,1 triệu in the red.
    const result = rental({ ...BASE, monthlyExpenses: 14_000_000 });
    expect(result.rentalTaxPerYear).toBeCloseTo(17_100_000, 6);
    expect(result.netOperatingIncomePerYear).toBeCloseTo(-14_100_000, 6);
  });

  it("honours a custom rate and threshold", () => {
    const result = rental({
      ...BASE,
      rentalTaxPercent: 7,
      taxThresholdPerYear: 200_000_000,
    });
    // 171 triệu is below a 200 triệu threshold.
    expect(result.taxable).toBe(false);
    expect(result.rentalTaxPerYear).toBe(0);
    const taxed = rental({ ...BASE, rentalTaxPercent: 7 });
    expect(taxed.rentalTaxPerYear).toBeCloseTo(171_000_000 * 0.07, 6);
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
    expect(computeRentalProperty({ ...BASE, rentalTaxPercent: 101 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, monthlyExpenses: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, purchaseCosts: -1 })).toBeNull();
    expect(computeRentalProperty({ ...BASE, price: Number.NaN })).toBeNull();
  });
});
