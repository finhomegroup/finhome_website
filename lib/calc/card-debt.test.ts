import { describe, it, expect } from "vitest";
import {
  payFixed,
  payMinimum,
  paymentForMonths,
} from "@/lib/calc/card-debt";
import { parseMoney } from "@/lib/calc/number";

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
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
    expect(result.months).toBe(result.schedule.length);
  });

  it("never ends on a phantom month that renders as 0 ₫", () => {
    // A residue below half a đồng is settled, so no extra row is appended and
    // the last payment is always a real amount a statement could show.
    for (const payment of [1_500_000, 2_000_000, 3_000_000, 5_000_000]) {
      const result = fixed(payment);
      expect(result.lastPayment).toBeGreaterThan(1);
      expect(result.schedule.at(-1)!.balance).toBe(0);
    }
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
    // A balance the settlement band already calls settled is not a debt, and
    // must not produce an empty schedule.
    expect(payFixed({ ...good, balance: 0.4 })).toBeNull();
    expect(payFixed({ ...good, balance: 1 })!.months).toBe(1);
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
    expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
  });

  it("stops the month the balance is settled, not a month later", () => {
    // The same phantom-month defect as payFixed: with a high minimum the last
    // month's payment is capped at the whole amount due, which clears the
    // balance to float noise rather than 0, and an unbanded loop then reported
    // one month too many with a final payment that rendered "0 ₫". Hand check
    // for 93%: month 1 pays 93% of 51.265.229,61 and leaves 3.588.566,07;
    // month 2 leaves 257.556; month 3's amount due of 264.073,48 is below the
    // 500.000 ₫ floor, so the floor pays the lot and the card is clear.
    for (const [percent, expected] of [
      [37, 12],
      [66, 6],
      [93, 3],
    ] as const) {
      const result = minimum({ minimumPercent: percent });
      expect(result.months).toBe(expected);
      expect(result.lastPayment).toBeGreaterThan(1);
      expect(result.schedule.at(-1)!.balance).toBe(0);
    }
  });

  it("does not report a century of payments on a floorless card", () => {
    // Without a floor the minimum shrinks geometrically and the balance never
    // reaches exactly 0, so "months" is band-defined: it is the month the
    // balance drops below half a đồng, i.e. below anything a statement can
    // show. The unbanded loop instead chased float noise for 1108 months.
    const result = minimum({ minimumPercent: 51, minimumFloor: 0 });
    expect(result.months).toBe(27);
    expect(result.months).toBeLessThan(60);
    expect(result.schedule.at(-1)!.balance).toBe(0);
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
    expect(payMinimum({ ...good, balance: 0.4 })).toBeNull();
    expect(payMinimum({ ...good, balance: 1 })!.months).toBe(1);
  });
});

describe("paymentForMonths", () => {
  it("round-trips against payFixed", () => {
    // The exact annuity payment leaves float noise, not zero, at month n, so
    // without a settlement band payFixed ran a phantom month and reported
    // n + 1. 18 is the case the page itself offers; 240/300/360 are the
    // realistic long terms. This list turns red on the unbanded loop
    // ("expected 19 to be 18").
    for (const months of [
      1, 2, 3, 4, 6, 7, 10, 12, 18, 24, 25, 36, 48, 60, 120, 240, 300, 360,
    ]) {
      const payment = paymentForMonths({
        balance: BALANCE,
        annualRatePercent: RATE,
        months,
      })!;
      const result = fixed(payment);
      expect(result.months).toBe(months);
      // The last month is a FULL payment, not a "0 ₫" phantom.
      expect(result.lastPayment).toBeCloseTo(payment, 2);
      // …and the schedule ends on exactly zero, by construction.
      expect(result.schedule.at(-1)!.balance).toBe(0);
    }
  });

  it("keeps the payoff identity on every round-tripped term", () => {
    // Absorbing the residue into the final row is what keeps sum(payments)
    // equal to totalPaid; dropping it instead drifts to ~7,5e-5 ₫.
    for (const months of [7, 18, 25, 120, 360]) {
      const payment = paymentForMonths({
        balance: BALANCE,
        annualRatePercent: RATE,
        months,
      })!;
      const result = fixed(payment);
      const paid = result.schedule.reduce((sum, row) => sum + row.payment, 0);
      // Measured worst error across n = 1..400 is 4,7e-6 ₫; assert an order
      // above that rather than an arbitrary decimal count.
      expect(Math.abs(paid - result.totalPaid)).toBeLessThan(1e-4);
      expect(result.schedule.at(-1)!.interest + result.schedule.at(-1)!.principal).toBeCloseTo(
        result.lastPayment,
        6,
      );
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

  it("rejects a settled balance on the same terms as payFixed", () => {
    // The page's second mode solves the payment here and then simulates it
    // with payFixed, so the two guards must agree: with only payFixed banding
    // the balance, a sub-đồng dư nợ produced a quoted payment (0,039 ₫,
    // rendered "0 ₫") for a schedule payFixed refused to build.
    // parseMoney is what makes that input reachable from the form.
    expect(parseMoney("0,4")).toBe(0.4);
    for (const balance of [0.4, 0.5]) {
      const solved = paymentForMonths({
        balance,
        annualRatePercent: RATE,
        months: 12,
      });
      const simulated = payFixed({
        balance,
        annualRatePercent: RATE,
        monthlyPayment: 1_000_000,
      });
      expect(solved).toBeNull();
      expect(simulated).toBeNull();
    }
    // Just above the band both sides agree the other way: a real, if silly,
    // debt with a real schedule.
    const solved = paymentForMonths({
      balance: 1,
      annualRatePercent: RATE,
      months: 12,
    });
    expect(solved).not.toBeNull();
    expect(
      payFixed({
        balance: 1,
        annualRatePercent: RATE,
        monthlyPayment: solved!,
      }),
    ).not.toBeNull();
  });
});

describe("the settlement band's measured envelope", () => {
  // Helper: solve the exact annuity payment for `months`, then simulate it.
  const roundTrip = (balance: number, rate: number, months: number) => {
    const payment = paymentForMonths({
      balance,
      annualRatePercent: rate,
      months,
    })!;
    const result = payFixed({
      balance,
      annualRatePercent: rate,
      monthlyPayment: payment,
    })!;
    expect(result).not.toBeNull();
    return { payment, result };
  };

  it("is exact at the worst cases the band comment names", () => {
    // The residue the band absorbs is a share of the balance, so the worst
    // case sits at the corner of each envelope, not at the page defaults:
    // 0,384 ₫ at 5 tỷ / 50%/năm / 299 tháng (worst over the whole balance
    // range at terms <= 300) and 0,496 ₫ at 100 triệu / 50%/năm / 398 tháng
    // (worst for balances <= 100 triệu at terms <= 400). Both are under the
    // 0,5 ₫ band, so both must land on the intended month. Asserting only the
    // page's own 50 triệu / 30% cases, as the round-trip test above does,
    // never reaches either.
    for (const [balance, rate, months] of [
      [5_000_000_000, 50, 299],
      [5_000_000_000, 50, 300],
      [100_000_000, 50, 398],
      [100_000_000, 50, 400],
      [50_000_000, 50, 400],
    ] as const) {
      const { payment, result } = roundTrip(balance, rate, months);
      expect(result.months).toBe(months);
      expect(result.schedule.at(-1)!.balance).toBe(0);
      // The final row absorbs the residue, which inside this envelope the
      // band caps at 0,5 ₫ — so the last payment is the full instalment to
      // within a đồng, never a "0 ₫" phantom.
      expect(Math.abs(result.lastPayment - payment)).toBeLessThan(1);
    }
  });

  it("runs exactly one month long above the band's documented ceiling", () => {
    // Pinned deliberately: this is the limitation `SETTLED_BALANCE_DONG`
    // records, not desired behaviour. A fixed 0,5 ₫ band cannot absorb a
    // residue that scales with the balance, so at 5 tỷ / 50%/năm the round
    // trip starts reporting n + 1 from n = 316 (residue 0,571 ₫). If a future
    // band change clears this region, THIS test is what tells you — update it
    // and the comment together.
    expect(roundTrip(5_000_000_000, 50, 315).result.months).toBe(315);
    expect(roundTrip(5_000_000_000, 50, 316).result.months).toBe(317);
    // Sporadic, not a cutoff: 317 is exact again.
    expect(roundTrip(5_000_000_000, 50, 317).result.months).toBe(317);
    // And the overshoot is never more than one month, even at the far corner
    // of the swept range, where the phantom month renders as "19 ₫" in place
    // of a 212.585.911 ₫ instalment.
    const far = roundTrip(5_000_000_000, 50, 400);
    expect(far.result.months).toBe(401);
    expect(far.result.lastPayment).toBeLessThan(100);
    expect(far.result.schedule[399].payment).toBeCloseTo(far.payment, 6);
  });

  it("holds everywhere below that ceiling in a swept sample", () => {
    // A thinned sweep of the same grid the band comment quotes (the full grid
    // is 122.400 combinations; this is every 7th rate and every 23rd term).
    // Nothing in it may be off by a month.
    let checked = 0;
    for (const balance of [
      100_000, 10_000_000, 50_000_000, 500_000_000, 5_000_000_000,
    ]) {
      for (let rate = 0; rate <= 50; rate += 7) {
        for (let months = 1; months <= 300; months += 23) {
          const { result } = roundTrip(balance, rate, months);
          expect(result.months).toBe(months);
          expect(result.schedule.at(-1)!.balance).toBe(0);
          checked += 1;
        }
      }
    }
    expect(checked).toBe(5 * 8 * 14);
  });
});
