import { describe, it, expect } from "vitest";
import { computeAutoLoan, type AutoLoanInput } from "@/lib/calc/auto-loan";
import { computeLoan } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

// A realistic Vietnamese car purchase: 800 triệu, 200 triệu down, 5 years.
const PRICE = 800_000_000;
const BASE: AutoLoanInput = {
  price: PRICE,
  downPayment: 200_000_000,
  annualRatePercent: 9.5,
  termMonths: 60,
};

function auto(input: AutoLoanInput) {
  const result = computeAutoLoan(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeAutoLoan — the derived amount", () => {
  it("finances the price less the deposit", () => {
    expect(auto(BASE).amountFinanced).toBe(600_000_000);
  });

  it("subtracts a trade-in allowance as well", () => {
    expect(
      auto({ ...BASE, tradeIn: 150_000_000 }).amountFinanced,
    ).toBe(450_000_000);
  });

  it("finances the whole price when nothing is contributed", () => {
    expect(
      auto({ ...BASE, downPayment: 0 }).amountFinanced,
    ).toBe(PRICE);
  });

  it("reports the contribution as a share of the price", () => {
    expect(auto(BASE).downPaymentPercent).toBeCloseTo(25, 10);
    expect(
      auto({ ...BASE, downPayment: 100_000_000, tradeIn: 100_000_000 })
        .downPaymentPercent,
    ).toBeCloseTo(25, 10);
  });
});

describe("computeAutoLoan — delegation", () => {
  it("produces the same loan as computeLoan on the derived amount", () => {
    // The whole point of the module: it derives the amount, nothing more.
    const derived = auto(BASE).loan;
    const direct = computeLoan({
      amount: 600_000_000,
      annualRatePercent: 9.5,
      termMonths: 60,
    })!;
    expect(derived.monthlyPrincipalInterest).toBeCloseTo(
      direct.monthlyPrincipalInterest,
      6,
    );
    expect(derived.totalInterest).toBeCloseTo(direct.totalInterest, 6);
  });

  it("agrees with pmt() on the instalment", () => {
    expect(auto(BASE).loan.monthlyPrincipalInterest).toBeCloseTo(
      Math.abs(pmt(9.5 / 100 / 12, 60, 600_000_000)),
      6,
    );
  });

  it("repays exactly what was financed", () => {
    const result = auto(BASE);
    expect(
      result.loan.totalPrincipalInterest - result.loan.totalInterest,
    ).toBeCloseTo(result.amountFinanced, 2);
    expect(
      result.loan.schedule[result.loan.schedule.length - 1].balance,
    ).toBe(0);
  });

  it("costs less interest with a bigger deposit", () => {
    const small = auto({ ...BASE, downPayment: 100_000_000 });
    const large = auto({ ...BASE, downPayment: 400_000_000 });
    expect(large.loan.totalInterest).toBeLessThan(small.loan.totalInterest);
  });
});

describe("computeAutoLoan — rejected inputs", () => {
  it("returns null when there is nothing left to finance", () => {
    // Paying cash, or trading in a vehicle worth the whole price.
    expect(computeAutoLoan({ ...BASE, downPayment: PRICE })).toBeNull();
    expect(computeAutoLoan({ ...BASE, downPayment: 0, tradeIn: PRICE })).toBeNull();
    // Contributing more than the price is not a loan either.
    expect(
      computeAutoLoan({ ...BASE, downPayment: PRICE + 1 }),
    ).toBeNull();
    expect(
      computeAutoLoan({
        ...BASE,
        downPayment: 500_000_000,
        tradeIn: 500_000_000,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeAutoLoan({ ...BASE, price: 0 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, price: -1 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, downPayment: -1 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, tradeIn: -1 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, termMonths: 60.5 })).toBeNull();
    expect(computeAutoLoan({ ...BASE, price: Number.NaN })).toBeNull();
  });
});
