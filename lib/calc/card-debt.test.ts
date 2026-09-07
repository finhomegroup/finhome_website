import { describe, it, expect } from "vitest";
import {
  payFixed,
  payMinimum,
  paymentForMonths,
} from "@/lib/calc/card-debt";

// 50 triệu on a card at 30%/năm — a realistic Vietnamese card rate.
const BALANCE = 50_000_000;
const RATE = 30;

function fixed(monthlyPayment: number, balance = BALANCE, rate = RATE) {
  const result = payFixed({
    balance,
    annualRatePercent: rate,
    monthlyPayment,
  });
  expect(result).not.toBeNull();
  return result!;
}

function minimum(
  overrides: Partial<Parameters<typeof payMinimum>[0]> = {},
) {
  const result = payMinimum({
    balance: BALANCE,
    annualRatePercent: RATE,
    minimumPercent: 5,
    minimumFloor: 500_000,
    ...overrides,
  });
  expect(result).not.toBeNull();
  return result!;
}

describe("payFixed — the schedule", () => {
  it("clears the balance to exactly zero", () => {
    const result = fixed(3_000_000);
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(
      0,
      6,
    );
    expect(result.months).toBe(result.schedule.length);
  });

  it("keeps interest + principal === payment on every row", () => {
    for (const row of fixed(3_000_000).schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 8);
    }
  });

  it("keeps the payoff identity: paid minus interest is the balance", () => {
    const result = fixed(3_000_000);
    const paid = result.schedule.reduce((sum, row) => sum + row.payment, 0);
    expect(paid).toBeCloseTo(result.totalPaid, 4);
    expect(result.totalPaid - result.totalInterest).toBeCloseTo(BALANCE, 4);
  });

  it("trims the final payment to what is outstanding", () => {
    const result = fixed(3_000_000);
    expect(result.lastPayment).toBeLessThan(3_000_000);
    expect(result.firstPayment).toBe(3_000_000);
  });

  it("charges the rate daily, not monthly", () => {
    // 30%/năm charged daily compounds to slightly more than 30/12 = 2,5% a
    // month. Month 1's interest must exceed the naive figure.
    const naive = BALANCE * (RATE / 100 / 12);
    expect(fixed(3_000_000).schedule[0].interest).toBeGreaterThan(naive);
    // …but not by much: the gap is well under a tenth of the charge.
    expect(fixed(3_000_000).schedule[0].interest).toBeLessThan(naive * 1.02);
  });
});

describe("payFixed — how much you pay changes everything", () => {
  it("clears faster and cheaper with a bigger payment", () => {
    const small = fixed(2_000_000);
    const large = fixed(5_000_000);
    expect(large.months).toBeLessThan(small.months);
    expect(large.totalInterest).toBeLessThan(small.totalInterest);
  });

  it("costs a punishing share of the balance at a low payment", () => {
    // The figure the page leads with: on a 30% card, paying 1,5 triệu a
    // month on 50 triệu costs more than half the balance again in interest.
    const result = fixed(1_500_000);
    expect(result.interestSharePercent).toBeGreaterThan(50);
  });

  it("charges no interest at a 0% rate", () => {
    const result = fixed(5_000_000, BALANCE, 0);
    expect(result.totalInterest).toBeCloseTo(0, 6);
    expect(result.months).toBe(10);
    expect(result.totalPaid).toBeCloseTo(BALANCE, 6);
  });

  it("clears in one month when the payment covers everything", () => {
    const result = fixed(BALANCE * 2);
    expect(result.months).toBe(1);
    expect(result.lastPayment).toBeLessThan(BALANCE * 2);
  });

  it("returns null when the payment cannot cover the interest", () => {
    // The balance only grows from here; "no payoff" is the honest answer.
    const interestMonth1 = BALANCE * ((1 + RATE / 100 / 365) ** (365 / 12) - 1);
    expect(
      payFixed({
        balance: BALANCE,
        annualRatePercent: RATE,
        monthlyPayment: interestMonth1,
      }),
    ).toBeNull();
    expect(
      payFixed({
        balance: BALANCE,
        annualRatePercent: RATE,
        monthlyPayment: interestMonth1 / 2,
      }),
    ).toBeNull();
    expect(
      payFixed({
        balance: BALANCE,
        annualRatePercent: RATE,
        monthlyPayment: 0,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    const good = { balance: BALANCE, annualRatePercent: RATE, monthlyPayment: 3e6 };
    expect(payFixed({ ...good, balance: 0 })).toBeNull();
    expect(payFixed({ ...good, balance: -1 })).toBeNull();
    expect(payFixed({ ...good, annualRatePercent: -1 })).toBeNull();
    expect(payFixed({ ...good, monthlyPayment: -1 })).toBeNull();
    expect(payFixed({ ...good, balance: Number.NaN })).toBeNull();
  });
});

describe("payMinimum — the shrinking payment", () => {
  it("starts at the percentage and falls with the balance", () => {
    const result = minimum();
    // 5% of the amount DUE — balance plus month 1's interest — as a
    // Vietnamese statement computes it, so slightly above 5% of the balance.
    const interest = result.schedule[0].interest;
    expect(result.firstPayment).toBeCloseTo((BALANCE + interest) * 0.05, 6);
    expect(result.firstPayment).toBeGreaterThan(BALANCE * 0.05);
    // Every payment is no larger than the one before, until the floor.
    const payments = result.schedule.map((row) => row.payment);
    for (let index = 1; index < payments.length - 1; index += 1) {
      expect(payments[index]).toBeLessThanOrEqual(payments[index - 1] + 1e-6);
    }
  });

  it("takes far longer than a fixed payment of the same starting size", () => {
    // The whole point of the minimum-payment page. The first minimum is
    // 2,5 triệu; paying that as a FIXED amount clears the card much sooner.
    const asMinimum = minimum();
    const asFixed = fixed(BALANCE * 0.05);
    expect(asMinimum.months).toBeGreaterThan(asFixed.months * 2);
    expect(asMinimum.totalInterest).toBeGreaterThan(asFixed.totalInterest);
  });

  it("is eventually cleared by the floor, not by the percentage", () => {
    const result = minimum();
    // The last payments sit at the floor, not at 5% of a tiny balance.
    const tail = result.schedule.slice(-3, -1);
    for (const row of tail) {
      expect(row.payment).toBeCloseTo(500_000, 6);
    }
  });

  it("never clears without a floor when the percentage is too small", () => {
    // 2% of the balance against a ~2,54%/month charge: the minimum never
    // covers the interest, so there is no payoff at all.
    expect(
      payMinimum({
        balance: BALANCE,
        annualRatePercent: RATE,
        minimumPercent: 2,
        minimumFloor: 0,
      }),
    ).toBeNull();
  });

  it("clears with a floor even when the percentage is too small", () => {
    const result = minimum({ minimumPercent: 2, minimumFloor: 2_000_000 });
    expect(result.months).toBeGreaterThan(0);
    expect(result.schedule[result.schedule.length - 1].balance).toBeCloseTo(
      0,
      6,
    );
  });

  it("takes a very long time on a high rate with a 5% minimum", () => {
    // Pinned because it is the page's headline claim.
    const result = minimum();
    expect(result.months).toBeGreaterThan(36);
    expect(result.interestSharePercent).toBeGreaterThan(30);
  });

  it("is transformed by a small fixed extra each month", () => {
    const plain = minimum();
    const withExtra = minimum({ extraPerMonth: 1_000_000 });
    expect(withExtra.months).toBeLessThan(plain.months);
    expect(withExtra.totalInterest).toBeLessThan(plain.totalInterest);
  });

  it("clears in one month when the minimum is the whole balance", () => {
    const result = minimum({ minimumPercent: 100 });
    expect(result.months).toBe(1);
  });

  it("keeps interest + principal === payment on every row", () => {
    for (const row of minimum().schedule) {
      expect(row.interest + row.principal).toBeCloseTo(row.payment, 8);
    }
  });

  it("returns null rather than a guess", () => {
    const good = {
      balance: BALANCE,
      annualRatePercent: RATE,
      minimumPercent: 5,
      minimumFloor: 500_000,
    };
    expect(payMinimum({ ...good, balance: 0 })).toBeNull();
    expect(payMinimum({ ...good, balance: -1 })).toBeNull();
    expect(payMinimum({ ...good, annualRatePercent: -1 })).toBeNull();
    expect(payMinimum({ ...good, minimumPercent: -1 })).toBeNull();
    expect(payMinimum({ ...good, minimumPercent: 101 })).toBeNull();
    expect(payMinimum({ ...good, minimumFloor: -1 })).toBeNull();
    expect(payMinimum({ ...good, extraPerMonth: -1 })).toBeNull();
    expect(payMinimum({ ...good, balance: Number.NaN })).toBeNull();
  });
});

describe("paymentForMonths", () => {
  it("round-trips against payFixed", () => {
    for (const months of [6, 12, 24, 36]) {
      const payment = paymentForMonths({
        balance: BALANCE,
        annualRatePercent: RATE,
        months,
      })!;
      expect(fixed(payment).months).toBe(months);
    }
  });

  it("asks for more each month over a shorter term", () => {
    const six = paymentForMonths({
      balance: BALANCE,
      annualRatePercent: RATE,
      months: 6,
    })!;
    const thirtySix = paymentForMonths({
      balance: BALANCE,
      annualRatePercent: RATE,
      months: 36,
    })!;
    expect(six).toBeGreaterThan(thirtySix);
  });

  it("is plain division at a 0% rate", () => {
    expect(
      paymentForMonths({
        balance: BALANCE,
        annualRatePercent: 0,
        months: 10,
      }),
    ).toBeCloseTo(5_000_000, 6);
  });

  it("returns null rather than a guess", () => {
    const good = { balance: BALANCE, annualRatePercent: RATE, months: 12 };
    expect(paymentForMonths({ ...good, balance: 0 })).toBeNull();
    expect(paymentForMonths({ ...good, months: 0 })).toBeNull();
    expect(paymentForMonths({ ...good, months: 12.5 })).toBeNull();
    expect(paymentForMonths({ ...good, annualRatePercent: -1 })).toBeNull();
    expect(paymentForMonths({ ...good, balance: Number.NaN })).toBeNull();
  });
});
