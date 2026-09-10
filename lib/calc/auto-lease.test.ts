import { describe, it, expect } from "vitest";
import { computeAutoLease, type AutoLeaseInput } from "@/lib/calc/auto-lease";

// 800 triệu vehicle, 100 triệu down, 55% residual over 3 years at 9%/năm.
const BASE: AutoLeaseInput = {
  price: 800_000_000,
  downPayment: 100_000_000,
  residualValue: 440_000_000,
  termMonths: 36,
  annualRatePercent: 9,
  taxPercent: 10,
};

function lease(input: AutoLeaseInput) {
  const result = computeAutoLease(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeAutoLease — the capitalised cost", () => {
  it("takes the deposit and trade-in off the price", () => {
    expect(lease(BASE).capitalisedCost).toBe(700_000_000);
    expect(
      lease({ ...BASE, tradeIn: 200_000_000 }).capitalisedCost,
    ).toBe(500_000_000);
  });

  it("adds fees that are rolled into the lease", () => {
    expect(
      lease({ ...BASE, capitalisedFees: 20_000_000 }).capitalisedCost,
    ).toBe(720_000_000);
  });

  it("uses the whole price when nothing is put down", () => {
    expect(lease({ ...BASE, downPayment: 0 }).capitalisedCost).toBe(
      800_000_000,
    );
  });
});

describe("computeAutoLease — the two halves of the payment", () => {
  it("splits depreciation evenly across the term", () => {
    // (700 − 440) triệu over 36 months.
    expect(lease(BASE).depreciationCharge).toBeCloseTo(
      260_000_000 / 36,
      6,
    );
    expect(lease(BASE).totalDepreciation).toBe(260_000_000);
  });

  it("converts the annual rate to a money factor by dividing by 2400", () => {
    expect(lease(BASE).moneyFactor).toBeCloseTo(9 / 2400, 12);
    expect(lease(BASE).moneyFactor).toBeCloseTo(0.00375, 12);
  });

  it("charges finance on the SUM of opening and closing values", () => {
    // (700 + 440) triệu × 0,00375 = 4.275.000 ₫ — not on a declining balance.
    expect(lease(BASE).financeCharge).toBeCloseTo(4_275_000, 6);
  });

  it("adds the two into the pre-tax payment", () => {
    const result = lease(BASE);
    expect(result.monthlyPaymentBeforeTax).toBeCloseTo(
      result.depreciationCharge + result.financeCharge,
      6,
    );
    expect(result.monthlyPaymentBeforeTax).toBeCloseTo(
      260_000_000 / 36 + 4_275_000,
      6,
    );
  });

  it("keeps the finance charge flat over the term, unlike a loan", () => {
    // The substantive modelling point: a loan's interest falls each month, a
    // lease's finance charge does not.
    const result = lease(BASE);
    expect(result.totalFinanceCharge).toBeCloseTo(
      result.financeCharge * 36,
      6,
    );
  });

  it("charges no finance at a 0% rate, leaving pure depreciation", () => {
    const result = lease({ ...BASE, annualRatePercent: 0 });
    expect(result.moneyFactor).toBe(0);
    expect(result.financeCharge).toBe(0);
    expect(result.monthlyPaymentBeforeTax).toBeCloseTo(260_000_000 / 36, 6);
  });
});

describe("computeAutoLease — the residual drives everything", () => {
  it("lowers the payment when the residual is higher", () => {
    const low = lease({ ...BASE, residualValue: 280_000_000 });
    const high = lease({ ...BASE, residualValue: 560_000_000 });
    expect(high.monthlyPayment).toBeLessThan(low.monthlyPayment);
  });

  it("raises the finance charge when the residual is higher", () => {
    // The counter-intuitive half: a bigger residual means more capital is
    // outstanding on average, so the finance charge goes UP even as the
    // total payment goes down.
    const low = lease({ ...BASE, residualValue: 280_000_000 });
    const high = lease({ ...BASE, residualValue: 560_000_000 });
    expect(high.financeCharge).toBeGreaterThan(low.financeCharge);
    expect(high.depreciationCharge).toBeLessThan(low.depreciationCharge);
  });

  it("states the residual as a share of the price", () => {
    expect(lease(BASE).residualPercent).toBeCloseTo(55, 10);
  });

  it("is pure finance charge when the residual equals the capitalised cost", () => {
    const result = lease({ ...BASE, residualValue: 700_000_000 });
    expect(result.depreciationCharge).toBe(0);
    expect(result.monthlyPaymentBeforeTax).toBeCloseTo(
      result.financeCharge,
      6,
    );
  });

  it("rejects a residual above the capitalised cost", () => {
    // The vehicle would have to gain value, and depreciation would be
    // negative. Reject rather than clamp.
    expect(
      computeAutoLease({ ...BASE, residualValue: 700_000_001 }),
    ).toBeNull();
  });
});

describe("computeAutoLease — tax and totals", () => {
  it("charges VAT on the payment, not on the vehicle price", () => {
    const result = lease(BASE);
    expect(result.monthlyTax).toBeCloseTo(
      result.monthlyPaymentBeforeTax * 0.1,
      6,
    );
    expect(result.monthlyPayment).toBeCloseTo(
      result.monthlyPaymentBeforeTax * 1.1,
      6,
    );
  });

  it("adds no tax at 0%", () => {
    const result = lease({ ...BASE, taxPercent: 0 });
    expect(result.monthlyTax).toBe(0);
    expect(result.monthlyPayment).toBeCloseTo(
      result.monthlyPaymentBeforeTax,
      6,
    );
  });

  it("counts the deposit and trade-in in the total cost", () => {
    const result = lease({ ...BASE, tradeIn: 50_000_000 });
    expect(result.totalCost).toBeCloseTo(
      result.totalOfPayments + 100_000_000 + 50_000_000,
      6,
    );
  });

  it("keeps the totals identity", () => {
    const result = lease(BASE);
    expect(result.totalOfPayments).toBeCloseTo(result.monthlyPayment * 36, 6);
    // Pre-tax payments = depreciation + finance over the term.
    expect(result.monthlyPaymentBeforeTax * 36).toBeCloseTo(
      result.totalDepreciation + result.totalFinanceCharge,
      4,
    );
  });
});

describe("computeAutoLease — rejected inputs", () => {
  it("rejects a deposit that covers the whole price", () => {
    expect(
      computeAutoLease({
        ...BASE,
        downPayment: 800_000_000,
        residualValue: 0,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeAutoLease({ ...BASE, price: 0 })).toBeNull();
    expect(computeAutoLease({ ...BASE, price: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, downPayment: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, tradeIn: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, residualValue: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeAutoLease({ ...BASE, termMonths: 36.5 })).toBeNull();
    expect(computeAutoLease({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, taxPercent: -1 })).toBeNull();
    expect(computeAutoLease({ ...BASE, price: Number.NaN })).toBeNull();
  });
});
