import { describe, it, expect } from "vitest";
import {
  computeCommercialLoan,
  type CommercialLoanInput,
} from "@/lib/calc/commercial-loan";
import { computeLoan } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

// 5 tỷ over 7 years at 11%, 12 months of grace, 20% due as a balloon.
const BASE: CommercialLoanInput = {
  amount: 5_000_000_000,
  annualRatePercent: 11,
  termMonths: 84,
  graceMonths: 12,
  balloonPercent: 20,
};

function loan(input: CommercialLoanInput) {
  const result = computeCommercialLoan(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeCommercialLoan — the plain case", () => {
  it("matches computeLoan with no grace and no balloon", () => {
    const result = loan({ ...BASE, graceMonths: 0, balloonPercent: 0 });
    const plain = computeLoan({
      amount: 5_000_000_000,
      annualRatePercent: 11,
      termMonths: 84,
    })!;
    expect(result.amortizingPayment).toBeCloseTo(
      plain.monthlyPrincipalInterest,
      6,
    );
    expect(result.totalInterest).toBeCloseTo(plain.totalInterest, 2);
    expect(result.structureCost).toBeCloseTo(0, 2);
    expect(result.gracePayment).toBe(0);
    expect(result.balloonAmount).toBe(0);
  });

  it("clears the balance to zero with no balloon", () => {
    const result = loan({ ...BASE, balloonPercent: 0 });
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(
      0,
      6,
    );
  });
});

describe("computeCommercialLoan — the grace period", () => {
  it("pays interest only, and the balance does not move", () => {
    const result = loan(BASE);
    expect(result.gracePayment).toBeCloseTo(
      5_000_000_000 * (11 / 100 / 12),
      6,
    );
    for (const row of result.schedule.slice(0, 12)) {
      expect(row.principal).toBe(0);
      expect(row.balance).toBe(5_000_000_000);
      expect(row.payment).toBeCloseTo(result.gracePayment, 6);
    }
  });

  it("charges the same interest every grace month", () => {
    const result = loan(BASE);
    expect(result.graceInterest).toBeCloseTo(result.gracePayment * 12, 6);
  });

  it("amortizes over the SHORTER remaining term afterwards", () => {
    const result = loan(BASE);
    expect(result.amortizingMonths).toBe(72);
    expect(result.amortizingPayment).toBeCloseTo(
      Math.abs(
        pmt(11 / 100 / 12, 72, 5_000_000_000, -1_000_000_000),
      ),
      6,
    );
  });

  it("makes the post-grace instalment larger than the plain one", () => {
    // The trade the structure makes: cheaper now, dearer later.
    const withGrace = loan({ ...BASE, balloonPercent: 0 });
    const plain = loan({ ...BASE, graceMonths: 0, balloonPercent: 0 });
    expect(withGrace.gracePayment).toBeLessThan(plain.amortizingPayment);
    expect(withGrace.amortizingPayment).toBeGreaterThan(
      plain.amortizingPayment,
    );
  });

  it("costs more interest the longer the grace runs", () => {
    let previous = 0;
    for (const graceMonths of [0, 6, 12, 24]) {
      const value = loan({ ...BASE, graceMonths, balloonPercent: 0 })
        .totalInterest;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });
});

describe("computeCommercialLoan — the balloon", () => {
  it("leaves exactly the balloon outstanding at maturity", () => {
    const result = loan(BASE);
    expect(result.balloonAmount).toBe(1_000_000_000);
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(
      1_000_000_000,
      4,
    );
  });

  it("charges interest on the whole balance, balloon included", () => {
    // The reason the balloon goes in as a future value rather than by
    // amortizing a smaller principal: interest accrues on all of it.
    const withBalloon = loan({ ...BASE, graceMonths: 0 });
    const smallerLoan = computeLoan({
      amount: 4_000_000_000,
      annualRatePercent: 11,
      termMonths: 84,
    })!;
    expect(withBalloon.totalInterest).toBeGreaterThan(
      smallerLoan.totalInterest,
    );
  });

  it("lowers the instalment and raises the total", () => {
    const withBalloon = loan({ ...BASE, graceMonths: 0 });
    const without = loan({ ...BASE, graceMonths: 0, balloonPercent: 0 });
    expect(withBalloon.amortizingPayment).toBeLessThan(
      without.amortizingPayment,
    );
    expect(withBalloon.totalInterest).toBeGreaterThan(
      without.totalInterest,
    );
  });

  it("grows the total interest with the balloon share", () => {
    let previous = 0;
    for (const balloonPercent of [0, 10, 20, 40, 60]) {
      const value = loan({ ...BASE, graceMonths: 0, balloonPercent })
        .totalInterest;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("counts the balloon in what actually leaves the borrower", () => {
    const result = loan(BASE);
    expect(result.totalPaid).toBeCloseTo(
      5_000_000_000 + result.totalInterest,
      2,
    );
    const paidInInstalments = result.schedule.reduce(
      (sum, row) => sum + row.payment,
      0,
    );
    // Instalments plus the balloon must equal everything paid.
    expect(paidInInstalments + result.balloonAmount).toBeCloseTo(
      result.totalPaid,
      2,
    );
  });
});

describe("computeCommercialLoan — the cost of the structure", () => {
  it("measures against a plain loan of the same size and term", () => {
    const result = loan(BASE);
    const plain = computeLoan({
      amount: 5_000_000_000,
      annualRatePercent: 11,
      termMonths: 84,
    })!;
    expect(result.plainTotalInterest).toBeCloseTo(plain.totalInterest, 2);
    expect(result.structureCost).toBeCloseTo(
      result.totalInterest - result.plainTotalInterest,
      6,
    );
    expect(result.structureCost).toBeGreaterThan(0);
  });

  it("keeps the schedule identities on every row", () => {
    for (const row of loan(BASE).schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
      expect(row.balance).toBeGreaterThanOrEqual(-1e-6);
    }
  });

  it("states interest as a share of the principal", () => {
    const result = loan(BASE);
    expect(result.interestToPrincipalPercent).toBeCloseTo(
      (result.totalInterest / 5_000_000_000) * 100,
      10,
    );
  });
});

describe("computeCommercialLoan — rejected inputs", () => {
  it("rejects a grace period as long as the term", () => {
    // That is an interest-only loan, a different product.
    expect(
      computeCommercialLoan({ ...BASE, graceMonths: 84 }),
    ).toBeNull();
    expect(
      computeCommercialLoan({ ...BASE, graceMonths: 100 }),
    ).toBeNull();
    expect(
      computeCommercialLoan({ ...BASE, graceMonths: 83 }),
    ).not.toBeNull();
  });

  it("rejects a balloon of 100% or more", () => {
    expect(
      computeCommercialLoan({ ...BASE, balloonPercent: 100 }),
    ).toBeNull();
    expect(
      computeCommercialLoan({ ...BASE, balloonPercent: 120 }),
    ).toBeNull();
    expect(
      computeCommercialLoan({ ...BASE, balloonPercent: 99 }),
    ).not.toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computeCommercialLoan({ ...BASE, amount: 0 })).toBeNull();
    expect(computeCommercialLoan({ ...BASE, amount: -1 })).toBeNull();
    expect(
      computeCommercialLoan({ ...BASE, annualRatePercent: -1 }),
    ).toBeNull();
    expect(computeCommercialLoan({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeCommercialLoan({ ...BASE, termMonths: 84.5 })).toBeNull();
    expect(computeCommercialLoan({ ...BASE, graceMonths: 12.5 })).toBeNull();
    expect(computeCommercialLoan({ ...BASE, amount: Number.NaN })).toBeNull();
  });

  it("handles a 0% rate", () => {
    const result = loan({ ...BASE, annualRatePercent: 0 });
    expect(result.totalInterest).toBeCloseTo(0, 6);
    expect(result.gracePayment).toBe(0);
    expect(result.amortizingPayment).toBeCloseTo(4_000_000_000 / 72, 6);
  });
});
