import { describe, it, expect } from "vitest";
import { analyseLoan, type LoanAnalysisInput } from "@/lib/calc/loan-analysis";
import { pmt } from "@/lib/calc/finance";

// A realistic Vietnamese mortgage: 2 tỷ at 8,5%/năm over 20 years.
const AMOUNT = 2_000_000_000;
const BASE: LoanAnalysisInput = {
  amount: AMOUNT,
  annualRatePercent: 8.5,
  termMonths: 240,
};

function analyse(input: LoanAnalysisInput) {
  const result = analyseLoan(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("analyseLoan — the underlying loan", () => {
  it("agrees with pmt() on the instalment", () => {
    expect(analyse(BASE).loan.monthlyPrincipalInterest).toBeCloseTo(
      Math.abs(pmt(8.5 / 100 / 12, 240, AMOUNT)),
      6,
    );
  });

  it("keeps the loan identity: payments minus interest is the principal", () => {
    const { loan } = analyse(BASE);
    expect(loan.totalPrincipalInterest - loan.totalInterest).toBeCloseTo(
      AMOUNT,
      2,
    );
    expect(loan.schedule[loan.schedule.length - 1].balance).toBe(0);
  });

  it("keeps interest + principal === payment on every row", () => {
    for (const row of analyse(BASE).loan.schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });
});

describe("analyseLoan — the cost ratio", () => {
  it("states total interest as a share of the sum borrowed", () => {
    const result = analyse(BASE);
    expect(result.interestToPrincipalPercent).toBeCloseTo(
      (result.loan.totalInterest / AMOUNT) * 100,
      10,
    );
    // 20 years at 8,5% costs more in interest than the house did.
    expect(result.interestToPrincipalPercent).toBeGreaterThan(100);
  });

  it("costs no interest at a 0% rate", () => {
    const free = analyse({ ...BASE, annualRatePercent: 0 });
    expect(free.interestToPrincipalPercent).toBe(0);
    expect(free.loan.monthlyPrincipalInterest).toBeCloseTo(AMOUNT / 240, 6);
  });

  it("rises with the rate and with the term", () => {
    const base = analyse(BASE).interestToPrincipalPercent;
    expect(
      analyse({ ...BASE, annualRatePercent: 11 }).interestToPrincipalPercent,
    ).toBeGreaterThan(base);
    expect(
      analyse({ ...BASE, termMonths: 360 }).interestToPrincipalPercent,
    ).toBeGreaterThan(base);
  });
});

describe("analyseLoan — how lopsided the payments are", () => {
  it("computes the first instalment's interest share from the schedule", () => {
    const { schedule } = analyse(BASE).loan;
    // Month 1 interest is the whole balance times the monthly rate.
    expect(schedule[0].interest).toBeCloseTo(AMOUNT * (8.5 / 100 / 12), 6);
    expect(analyse(BASE).firstPaymentInterestSharePercent).toBeCloseTo(
      (schedule[0].interest / schedule[0].payment) * 100,
      10,
    );
  });

  it("front-loads interest: the first instalment is mostly interest, the last mostly principal", () => {
    const result = analyse(BASE);
    expect(result.firstPaymentInterestSharePercent).toBeGreaterThan(80);
    expect(result.lastPaymentInterestSharePercent).toBeLessThan(1);
  });

  it("charges no interest share on an interest-free loan", () => {
    const free = analyse({ ...BASE, annualRatePercent: 0 });
    expect(free.firstPaymentInterestSharePercent).toBe(0);
    expect(free.lastPaymentInterestSharePercent).toBe(0);
  });
});

describe("analyseLoan — the crossover", () => {
  it("finds the first month that repays more principal than interest", () => {
    const result = analyse(BASE);
    const month = result.crossoverMonth!;
    expect(month).toBeGreaterThan(1);
    const { schedule } = result.loan;
    // The named month crosses over and the one before it does not.
    expect(schedule[month - 1].principal).toBeGreaterThan(
      schedule[month - 1].interest,
    );
    expect(schedule[month - 2].principal).toBeLessThanOrEqual(
      schedule[month - 2].interest,
    );
  });

  it("crosses over in month 1 when there is no interest", () => {
    expect(analyse({ ...BASE, annualRatePercent: 0 }).crossoverMonth).toBe(1);
  });

  it("arrives later as the rate rises", () => {
    const cheap = analyse({ ...BASE, annualRatePercent: 6 }).crossoverMonth!;
    const dear = analyse({ ...BASE, annualRatePercent: 12 }).crossoverMonth!;
    expect(dear).toBeGreaterThan(cheap);
  });

  it("returns null when the crossover never arrives in the schedule", () => {
    // Covers the guard branch, at a rate no product carries. The final row
    // repays the whole remaining balance, so `principal > interest` holds on
    // it whenever the period rate is below 100% — which is every real loan.
    // Only at or above 100% PER MONTH does the crossover genuinely never
    // arrive, and then the answer must be null rather than the final month.
    const result = analyse({
      amount: AMOUNT,
      annualRatePercent: 1200,
      termMonths: 12,
    });
    expect(result.crossoverMonth).toBeNull();
  });
});

describe("analyseLoan — the halfway points", () => {
  it("takes well past half the term to repay half the debt", () => {
    const result = analyse(BASE);
    expect(result.halfPrincipalTermSharePercent).toBeGreaterThan(50);
    // Cross-check the month against the schedule's own cumulative principal.
    const { schedule } = result.loan;
    const upTo = (month: number) =>
      schedule
        .slice(0, month)
        .reduce((sum, row) => sum + row.principal, 0);
    expect(upTo(result.halfPrincipalMonth!)).toBeGreaterThanOrEqual(AMOUNT / 2);
    expect(upTo(result.halfPrincipalMonth! - 1)).toBeLessThan(AMOUNT / 2);
  });

  it("pays half the interest well before half the term", () => {
    const result = analyse(BASE);
    expect(result.halfInterestTermSharePercent).toBeLessThan(50);
    expect(result.halfInterestMonth!).toBeLessThan(
      result.halfPrincipalMonth!,
    );
  });

  it("has no interest halfway point on an interest-free loan", () => {
    const free = analyse({ ...BASE, annualRatePercent: 0 });
    expect(free.halfInterestMonth).toBeNull();
    expect(free.halfInterestTermSharePercent).toBeNull();
    // Half the principal is gone at exactly half the term.
    expect(free.halfPrincipalMonth).toBe(120);
    expect(free.halfPrincipalTermSharePercent).toBeCloseTo(50, 10);
  });

  it("reports the shares against the term actually amortized", () => {
    const result = analyse({ ...BASE, termMonths: 360 });
    expect(result.halfPrincipalTermSharePercent).toBeCloseTo(
      (result.halfPrincipalMonth! / 360) * 100,
      10,
    );
  });
});

describe("analyseLoan — the four segments", () => {
  it("covers the whole term once, with no gap and no overlap", () => {
    const result = analyse(BASE);
    expect(result.segments).toHaveLength(4);
    expect(result.segments[0].fromMonth).toBe(1);
    expect(result.segments[3].toMonth).toBe(240);
    for (let index = 1; index < result.segments.length; index += 1) {
      expect(result.segments[index].fromMonth).toBe(
        result.segments[index - 1].toMonth + 1,
      );
    }
  });

  it("sums back to the totals", () => {
    const result = analyse(BASE);
    const interest = result.segments.reduce(
      (sum, segment) => sum + segment.interest,
      0,
    );
    const principal = result.segments.reduce(
      (sum, segment) => sum + segment.principal,
      0,
    );
    expect(interest).toBeCloseTo(result.loan.totalInterest, 2);
    expect(principal).toBeCloseTo(AMOUNT, 2);
  });

  it("shifts from interest to principal across the term", () => {
    const shares = analyse(BASE).segments.map(
      (segment) => segment.interestSharePercent,
    );
    for (let index = 1; index < shares.length; index += 1) {
      expect(shares[index]).toBeLessThan(shares[index - 1]);
    }
    // The first five years of this loan are overwhelmingly interest; the last
    // five are mostly principal. Both bounds are hand-checked against the
    // schedule and are what the page's copy claims.
    expect(shares[0]).toBeGreaterThan(75);
    expect(shares[3]).toBeLessThan(25);
  });

  it("ends each segment on the balance the schedule says", () => {
    const result = analyse(BASE);
    for (const segment of result.segments) {
      expect(segment.balance).toBeCloseTo(
        result.loan.schedule[segment.toMonth - 1].balance,
        6,
      );
    }
    expect(result.segments[3].balance).toBe(0);
  });

  it("emits no empty segment on a term shorter than four months", () => {
    const short = analyse({ ...BASE, termMonths: 3 });
    expect(short.segments.length).toBeLessThan(4);
    for (const segment of short.segments) {
      expect(segment.toMonth).toBeGreaterThanOrEqual(segment.fromMonth);
    }
    expect(short.segments[short.segments.length - 1].toMonth).toBe(3);
  });

  it("handles a single-month term", () => {
    const single = analyse({ ...BASE, termMonths: 1 });
    expect(single.segments).toHaveLength(1);
    expect(single.segments[0].fromMonth).toBe(1);
    expect(single.segments[0].toMonth).toBe(1);
    expect(single.segments[0].balance).toBe(0);
  });
});

describe("analyseLoan — realistic terms and rejection", () => {
  it("survives 240, 300 and 360 monthly periods", () => {
    // Pinned: a bracket bug once made every term past ~24 years unsolvable.
    for (const termMonths of [240, 300, 360]) {
      const result = analyse({ ...BASE, termMonths });
      expect(result.loan.months).toBe(termMonths);
      expect(result.segments[result.segments.length - 1].toMonth).toBe(
        termMonths,
      );
    }
  });

  it("returns null rather than a guess", () => {
    expect(analyseLoan({ ...BASE, amount: 0 })).toBeNull();
    expect(analyseLoan({ ...BASE, amount: -1 })).toBeNull();
    expect(analyseLoan({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(analyseLoan({ ...BASE, termMonths: 0 })).toBeNull();
    expect(analyseLoan({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(analyseLoan({ ...BASE, amount: Number.NaN })).toBeNull();
    expect(analyseLoan({ ...BASE, annualRatePercent: Number.NaN })).toBeNull();
  });
});
