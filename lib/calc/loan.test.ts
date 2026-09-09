import { describe, it, expect } from "vitest";
import { computeLoan, yearlySummary, type LoanInput } from "@/lib/calc/loan";
import { pmt } from "@/lib/calc/finance";

// A realistic Vietnamese home loan: 2 tỷ over 20 years at 8,5%/năm.
const AMOUNT = 2_000_000_000;
const RATE = 8.5;
const TERM = 240;
const BASE: LoanInput = {
  amount: AMOUNT,
  annualRatePercent: RATE,
  termMonths: TERM,
};

/** computeLoan returns null only for inputs it rejects; tests assert on a result. */
function loan(input: LoanInput) {
  const result = computeLoan(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeLoan — the core instalment", () => {
  it("agrees with pmt() on the scheduled payment, sign flipped", () => {
    // The one place this module inverts finance.ts's Excel convention.
    expect(loan(BASE).monthlyPrincipalInterest).toBeCloseTo(
      Math.abs(pmt(RATE / 100 / 12, TERM, AMOUNT)),
      6,
    );
  });

  it("pins the reference instalment", () => {
    expect(loan(BASE).monthlyPrincipalInterest).toBeCloseTo(17_356_465, 0);
  });

  it("runs for the full term when nothing is overpaid", () => {
    expect(loan(BASE).months).toBe(TERM);
    expect(loan(BASE).schedule.length).toBe(TERM);
  });

  it("divides principal evenly at a zero rate", () => {
    const flat = loan({ amount: 2_400_000_000, annualRatePercent: 0, termMonths: TERM });
    expect(flat.monthlyPrincipalInterest).toBeCloseTo(10_000_000, 6);
    expect(flat.totalInterest).toBeCloseTo(0, 6);
  });

  it("computes the mortgage constant as annual P&I over principal", () => {
    const result = loan(BASE);
    expect(result.mortgageConstant).toBeCloseTo(
      (result.monthlyPrincipalInterest * 12) / AMOUNT,
      10,
    );
  });
});

// These are what catch a sign or accumulation error before it reaches a page
// telling somebody what their house will cost.
describe("computeLoan — invariants", () => {
  it("repays exactly the principal borrowed", () => {
    const result = loan(BASE);
    expect(result.totalPrincipalInterest - result.totalInterest).toBeCloseTo(AMOUNT, 2);
  });

  it("ends at a zero balance", () => {
    const result = loan(BASE);
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
  });

  it("splits every row into interest plus principal", () => {
    for (const row of loan(BASE).schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 6);
    }
  });

  it("reports every figure as a positive number", () => {
    // The `propertyPrice` here is load-bearing: it is what keeps PMI actually
    // charged (61 months), and `monthlyPmi` is 0 whenever `pmiMonths` is 0. Drop
    // the price and this test's `toBeGreaterThan(0)` on monthlyPmi turns red.
    const result = loan({
      ...BASE,
      propertyTaxPerYear: 12_000_000,
      insurancePerYear: 6_000_000,
      otherFeePerYear: 18_000_000,
      pmiPercent: 0.5,
      propertyPrice: 2_200_000_000,
    });
    for (const value of [
      result.monthlyPrincipalInterest,
      result.monthlyPmi,
      result.monthlyEscrow,
      result.monthlyPayment,
      result.totalPrincipalInterest,
      result.totalInterest,
      result.totalPayment,
      result.annualPayment,
    ]) {
      expect(value).toBeGreaterThan(0);
    }
  });
});

describe("computeLoan — recurring costs", () => {
  it("converts yearly costs to a monthly figure", () => {
    const result = loan({
      ...BASE,
      propertyTaxPerYear: 12_000_000,
      insurancePerYear: 6_000_000,
      otherFeePerYear: 18_000_000,
    });
    expect(result.monthlyEscrow).toBeCloseTo(3_000_000, 6);
  });

  it("adds escrow to the monthly payment but not to the interest", () => {
    const bare = loan(BASE);
    const withEscrow = loan({ ...BASE, propertyTaxPerYear: 12_000_000 });
    expect(withEscrow.monthlyPayment).toBeCloseTo(bare.monthlyPayment + 1_000_000, 6);
    expect(withEscrow.totalInterest).toBeCloseTo(bare.totalInterest, 6);
  });
});

describe("computeLoan — PMI", () => {
  const withPmi: LoanInput = {
    ...BASE,
    pmiPercent: 0.5,
    pmiMode: "until80",
    propertyPrice: 2_200_000_000,
  };

  it("charges PMI as an annual percent of the loan, monthly", () => {
    expect(loan(withPmi).monthlyPmi).toBeCloseTo((0.5 / 100) * AMOUNT / 12, 6);
  });

  it("stops charging once the balance reaches 80% of the price", () => {
    const result = loan(withPmi);
    expect(result.pmiMonths).toBe(61);
    // The row PMI stops at is the first at or below the threshold.
    expect(result.schedule[60].balance).toBeLessThanOrEqual(2_200_000_000 * 0.8);
    expect(result.schedule[59].balance).toBeGreaterThan(2_200_000_000 * 0.8);
  });

  it("charges PMI for the whole term in life mode", () => {
    expect(loan({ ...withPmi, pmiMode: "life" }).pmiMonths).toBe(TERM);
  });

  it("charges nothing when the buyer already has 20% equity", () => {
    // Borrowing 2 tỷ against a 3 tỷ property is already under the threshold —
    // and the opening principal is not a row of the schedule, so testing only
    // post-payment balances used to bill a month here.
    const equity = loan({ ...withPmi, propertyPrice: 3_000_000_000 });
    expect(equity.pmiMonths).toBe(0);
    expect(equity.monthlyPmi).toBe(0);
    // No PMI charged means the lifetime cost is the bare loan's, to the đồng.
    expect(equity.totalPayment).toBeCloseTo(loan(BASE).totalPayment, 6);
  });

  it("treats exactly 80% LTV as already cleared", () => {
    // 2 tỷ borrowed against 2,5 tỷ is the boundary: threshold === principal.
    // 80% LTV is the point PMI stops, so a buyer starting there never owes it.
    expect(loan({ ...withPmi, propertyPrice: 2_500_000_000 }).pmiMonths).toBe(0);
  });

  it("charges nothing when no property price is given to test against", () => {
    const noPrice = loan({ ...BASE, pmiPercent: 0.5, pmiMode: "until80" });
    expect(noPrice.pmiMonths).toBe(0);
    // The monthly rows must not bill PMI the lifetime total does not contain.
    expect(noPrice.monthlyPmi).toBe(0);
    expect(noPrice.monthlyPayment).toBeCloseTo(noPrice.monthlyPrincipalInterest, 6);
    expect(noPrice.annualPayment).toBeCloseTo(noPrice.monthlyPayment * 12, 6);
    // With no PMI and no escrow, every month is the same: the invariant that
    // was off by 199.999.999,99 ₫ when monthlyPmi ignored pmiMonths.
    expect(noPrice.monthlyPayment * noPrice.months).toBeCloseTo(
      noPrice.totalPayment,
      2,
    );
  });

  it("charges nothing when the PMI rate is zero", () => {
    expect(loan(BASE).pmiMonths).toBe(0);
    expect(loan(BASE).monthlyPmi).toBe(0);
  });
});

describe("computeLoan — extra payments", () => {
  it("shortens the term and saves interest", () => {
    const result = loan({ ...BASE, extraPerMonth: 5_000_000 });
    expect(result.months).toBe(143);
    expect(result.monthsSaved).toBe(TERM - 143);
    expect(result.interestSaving).toBeGreaterThan(0);
    expect(result.interestSaving).toBeCloseTo(984_777_694, -3);
  });

  it("still repays exactly the principal", () => {
    const result = loan({ ...BASE, extraPerMonth: 5_000_000 });
    expect(result.totalPrincipalInterest - result.totalInterest).toBeCloseTo(AMOUNT, 2);
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
  });

  it("clears the loan in one month when the extra covers it", () => {
    expect(loan({ ...BASE, extraPerMonth: 3_000_000_000 }).months).toBe(1);
  });

  it("reports no saving when there is no extra payment", () => {
    expect(loan(BASE).interestSaving).toBeNull();
    expect(loan(BASE).monthsSaved).toBeNull();
  });

  it("leaves the scheduled instalment unchanged — it is what the bank asks for", () => {
    expect(loan({ ...BASE, extraPerMonth: 5_000_000 }).monthlyPrincipalInterest)
      .toBeCloseTo(loan(BASE).monthlyPrincipalInterest, 6);
  });
});

describe("computeLoan — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeLoan({ ...BASE, amount: 0 })).toBeNull();
    expect(computeLoan({ ...BASE, amount: -1 })).toBeNull();
    expect(computeLoan({ ...BASE, annualRatePercent: -1 })).toBeNull();
    expect(computeLoan({ ...BASE, termMonths: 0 })).toBeNull();
    expect(computeLoan({ ...BASE, termMonths: 240.5 })).toBeNull();
    expect(computeLoan({ ...BASE, annualRatePercent: Number.NaN })).toBeNull();
    expect(computeLoan({ ...BASE, extraPerMonth: -1 })).toBeNull();
    expect(computeLoan({ ...BASE, propertyTaxPerYear: -1 })).toBeNull();
    expect(computeLoan({ ...BASE, pmiPercent: -1 })).toBeNull();
  });
});

describe("yearlySummary", () => {
  it("collapses 240 monthly rows into 20 yearly ones", () => {
    const years = yearlySummary(loan(BASE).schedule);
    expect(years.length).toBe(20);
  });

  it("preserves the totals it summarises", () => {
    const result = loan(BASE);
    const years = yearlySummary(result.schedule);
    expect(years.reduce((sum, year) => sum + year.principal, 0)).toBeCloseTo(AMOUNT, 2);
    expect(years.reduce((sum, year) => sum + year.interest, 0)).toBeCloseTo(
      result.totalInterest,
      2,
    );
  });

  it("carries the year-end balance and ends at zero", () => {
    const years = yearlySummary(loan(BASE).schedule);
    expect(years[years.length - 1].balance).toBe(0);
    expect(years[0].balance).toBeLessThan(AMOUNT);
  });

  it("shifts from mostly-interest to mostly-principal across the term", () => {
    const years = yearlySummary(loan(BASE).schedule);
    expect(years[0].interest).toBeGreaterThan(years[0].principal);
    expect(years[19].principal).toBeGreaterThan(years[19].interest);
  });

  it("handles a part-year tail from extra payments", () => {
    // 143 months is 11 full years plus 11 months.
    const years = yearlySummary(loan({ ...BASE, extraPerMonth: 5_000_000 }).schedule);
    expect(years.length).toBe(12);
    expect(years[years.length - 1].balance).toBe(0);
  });

  it("returns nothing for an empty schedule", () => {
    expect(yearlySummary([])).toEqual([]);
  });
});
