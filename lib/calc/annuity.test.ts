import { describe, expect, it } from "vitest";
import { computeAnnuity, type AnnuityInput } from "@/lib/calc/annuity";

const BASE: AnnuityInput = {
  mode: "payment",
  premium: 250_000,
  desiredPayment: 0,
  paymentsPerYear: 12,
  years: 20,
  ratePercent: 4.5,
  paymentAtStart: true,
  deferralYears: 0,
  taxRatePercent: 22,
  quotedPayment: 0,
};

const run = (over: Partial<AnnuityInput> = {}) => {
  const result = computeAnnuity({ ...BASE, ...over });
  if (!result) throw new Error("computeAnnuity returned null");
  return result;
};

describe("computeAnnuity — the payment a premium buys", () => {
  it("amortises the premium over the term", () => {
    const r = run();
    expect(r.totalPayments).toBe(240);
    expect(r.ratePerPeriod).toBeCloseTo(0.045 / 12, 12);
    // Checked against the annuity-due present value written out directly.
    const i = 0.045 / 12;
    const factor = ((1 - Math.pow(1 + i, -240)) / i) * (1 + i);
    expect(r.payment).toBeCloseTo(250_000 / factor, 6);
    expect(r.annualPayment).toBeCloseTo(r.payment * 12, 10);
    expect(r.totalPaid).toBeCloseTo(r.payment * 240, 10);
  });

  it("pays more per period when payments come at the START", () => {
    // An annuity due gets each payment a period earlier, so the same
    // premium buys less per payment... no: it buys LESS, because the
    // insurer holds the money for one period less. Assert the direction
    // rather than assume it.
    const due = run({ paymentAtStart: true });
    const ordinary = run({ paymentAtStart: false });
    expect(due.payment).toBeLessThan(ordinary.payment);
    // And the ratio is exactly one period of interest.
    expect(ordinary.payment / due.payment).toBeCloseTo(1 + 0.045 / 12, 10);
  });

  it("returns the premium in equal slices at a zero rate", () => {
    const r = run({ ratePercent: 0 });
    expect(r.payment).toBeCloseTo(250_000 / 240, 8);
    expect(r.totalPaid).toBeCloseTo(250_000, 6);
    expect(r.interestEarned).toBeCloseTo(0, 6);
    expect(r.payoutMultiple).toBeCloseTo(1, 10);
    expect(r.moneyBackYears).toBeCloseTo(20, 8);
  });

  it("pays more for a shorter term and less for a longer one", () => {
    expect(run({ years: 10 }).payment).toBeGreaterThan(run().payment);
    expect(run({ years: 30 }).payment).toBeLessThan(run().payment);
  });

  it("reports the payout rate and the money-back point", () => {
    const r = run();
    expect(r.payoutRatePercent).toBeCloseTo(
      (r.annualPayment / 250_000) * 100,
      10,
    );
    expect(r.moneyBackYears).toBeCloseTo(250_000 / r.annualPayment, 10);
    // At a positive rate the premium comes back before the term ends, which
    // is the whole point of the figure.
    expect(r.moneyBackYears!).toBeLessThan(20);
    expect(r.payoutMultiple!).toBeGreaterThan(1);
  });
});

describe("computeAnnuity — the two modes are inverses", () => {
  it("round-trips a payment back to its premium", () => {
    // The identity: solve the payment from a premium, feed that payment in
    // as the desired one, and the premium must come back. Swept, because a
    // deferral or frequency slip would pass at one setting and fail at
    // another.
    for (const paymentsPerYear of [1, 4, 12]) {
      for (const years of [5, 20, 40]) {
        for (const deferralYears of [0, 5, 15]) {
          for (const paymentAtStart of [true, false]) {
            const forward = run({
              paymentsPerYear,
              years,
              deferralYears,
              paymentAtStart,
            });
            const back = run({
              mode: "premium",
              desiredPayment: forward.payment,
              paymentsPerYear,
              years,
              deferralYears,
              paymentAtStart,
            });
            expect(
              back.premium,
              `${paymentsPerYear}/${years}/${deferralYears}/${paymentAtStart}`,
            ).toBeCloseTo(250_000, 4);
            expect(back.payment).toBeCloseTo(forward.payment, 10);
          }
        }
      }
    }
  });

  it("needs a bigger premium for a bigger payment", () => {
    const small = run({ mode: "premium", desiredPayment: 1_000 });
    const large = run({ mode: "premium", desiredPayment: 2_000 });
    expect(large.premium).toBeCloseTo(small.premium * 2, 6);
  });
});

describe("computeAnnuity — deferral", () => {
  it("grows the premium before payments begin", () => {
    const r = run({ deferralYears: 10 });
    expect(r.valueAtAnnuitisation).toBeCloseTo(
      250_000 * Math.pow(1 + 0.045 / 12, 120),
      4,
    );
    expect(r.valueAtAnnuitisation).toBeGreaterThan(250_000);
  });

  it("pays more for every year of deferral", () => {
    let previous = 0;
    for (const deferralYears of [0, 5, 10, 20]) {
      const r = run({ deferralYears });
      expect(r.payment, `deferral ${deferralYears}`).toBeGreaterThan(previous);
      previous = r.payment;
    }
  });

  it("leaves an immediate contract untouched by the deferral maths", () => {
    const r = run({ deferralYears: 0 });
    expect(r.valueAtAnnuitisation).toBe(250_000);
  });
});

describe("computeAnnuity — the exclusion ratio", () => {
  it("shelters the return of capital and taxes only the interest", () => {
    const r = run();
    expect(r.exclusionRatioPercent).toBeCloseTo(
      (250_000 / r.totalPaid) * 100,
      10,
    );
    // Each payment's sheltered part is simply the premium spread evenly.
    expect(r.excludedPerPayment).toBeCloseTo(250_000 / 240, 6);
    expect(r.excludedPerPayment + r.taxablePerPayment).toBeCloseTo(r.payment, 8);
    expect(r.taxPerPayment).toBeCloseTo(r.taxablePerPayment * 0.22, 8);
    expect(r.netPerPayment).toBeCloseTo(r.payment - r.taxPerPayment, 10);
  });

  it("puts the effective tax rate far below the marginal rate", () => {
    // The point a reader comparing gross yields misses.
    const r = run();
    expect(r.effectiveTaxRatePercent!).toBeLessThan(22);
    expect(r.effectiveTaxRatePercent).toBeCloseTo(
      (1 - 250_000 / r.totalPaid) * 22,
      8,
    );
  });

  it("shelters the whole payment when nothing was earned", () => {
    const r = run({ ratePercent: 0 });
    expect(r.exclusionRatioPercent).toBeCloseTo(100, 8);
    expect(r.taxablePerPayment).toBeCloseTo(0, 6);
    expect(r.taxPerPayment).toBeCloseTo(0, 6);
    expect(r.effectiveTaxRatePercent).toBeCloseTo(0, 6);
  });

  it("caps the exclusion at the whole payment on a losing contract", () => {
    // A negative rate pays out less than the premium. The exclusion cannot
    // exceed the payment, or the taxable part would go negative and the
    // module would be inventing a deduction.
    const r = run({ ratePercent: -3 });
    expect(r.totalPaid).toBeLessThan(250_000);
    expect(r.exclusionRatioPercent).toBeCloseTo(100, 8);
    expect(r.taxablePerPayment).toBe(0);
    expect(r.taxPerPayment).toBe(0);
    expect(r.interestEarned).toBeLessThan(0);
  });
});

describe("computeAnnuity — inverting a quote", () => {
  it("recovers the rate that produced a payment", () => {
    // The check that makes the inversion trustworthy: feed back the payment
    // the module itself computed at 4,5% and the implied rate must be 4,5%.
    for (const ratePercent of [0.5, 3, 4.5, 8]) {
      for (const deferralYears of [0, 10]) {
        const forward = run({ ratePercent, deferralYears });
        const inverted = run({
          ratePercent,
          deferralYears,
          quotedPayment: forward.payment,
        });
        expect(
          inverted.quotedImpliedRatePercent!,
          `${ratePercent}% deferral ${deferralYears}`,
        ).toBeCloseTo(ratePercent, 6);
        // And the quote matches what the assumed rate buys, so no advantage.
        expect(inverted.quoteAdvantage!).toBeCloseTo(0, 8);
      }
    }
  });

  it("implies a higher rate for a more generous quote", () => {
    const base = run();
    const generous = run({ quotedPayment: base.payment * 1.1 });
    const stingy = run({ quotedPayment: base.payment * 0.9 });
    expect(generous.quotedImpliedRatePercent!).toBeGreaterThan(4.5);
    expect(stingy.quotedImpliedRatePercent!).toBeLessThan(4.5);
    expect(generous.quoteAdvantage!).toBeGreaterThan(0);
    expect(stingy.quoteAdvantage!).toBeLessThan(0);
  });

  it("implies a NEGATIVE rate for a quote that returns less than the premium", () => {
    // Real quotes for short period-certain contracts can do this once the
    // insurer's loading is taken out, and the module must say so rather
    // than refusing to answer.
    const r = run({ years: 10, quotedPayment: 1_500 });
    expect(1_500 * 120).toBeLessThan(250_000);
    expect(r.quotedImpliedRatePercent!).toBeLessThan(0);
  });

  it("reports no implied rate when there is nothing to invert", () => {
    expect(run({ quotedPayment: 0 }).quotedImpliedRatePercent).toBe(null);
    expect(run({ quotedPayment: 0 }).quoteAdvantage).toBe(null);
    expect(
      run({ premium: 0, quotedPayment: 1_000 }).quotedImpliedRatePercent,
    ).toBe(null);
  });

  it("finds the rate on a long-dated contract, not just a short one", () => {
    // docs §8 defect 1 and 5: a root finder's bracket is an overflow
    // surface, and both recurrences were caught by a long term. 40 years of
    // monthly payments is 480 periods.
    const forward = run({ years: 40, ratePercent: 6 });
    const inverted = run({
      years: 40,
      ratePercent: 6,
      quotedPayment: forward.payment,
    });
    expect(inverted.totalPayments).toBe(480);
    expect(inverted.quotedImpliedRatePercent!).toBeCloseTo(6, 6);
  });
});

describe("computeAnnuity — rejections and edges", () => {
  it("rejects impossible inputs", () => {
    expect(computeAnnuity({ ...BASE, premium: -1 })).toBe(null);
    expect(computeAnnuity({ ...BASE, quotedPayment: -1 })).toBe(null);
    expect(computeAnnuity({ ...BASE, paymentsPerYear: 0 })).toBe(null);
    expect(computeAnnuity({ ...BASE, paymentsPerYear: 367 })).toBe(null);
    expect(computeAnnuity({ ...BASE, paymentsPerYear: 12.5 })).toBe(null);
    expect(computeAnnuity({ ...BASE, years: 0 })).toBe(null);
    expect(computeAnnuity({ ...BASE, years: 71 })).toBe(null);
    expect(computeAnnuity({ ...BASE, years: 20.5 })).toBe(null);
    expect(computeAnnuity({ ...BASE, deferralYears: -1 })).toBe(null);
    expect(computeAnnuity({ ...BASE, deferralYears: 51 })).toBe(null);
    expect(computeAnnuity({ ...BASE, deferralYears: 5.5 })).toBe(null);
    expect(computeAnnuity({ ...BASE, ratePercent: -101 })).toBe(null);
    expect(computeAnnuity({ ...BASE, taxRatePercent: 101 })).toBe(null);
  });

  it("handles a zero premium without dividing by it", () => {
    const r = run({ premium: 0 });
    expect(r.payment).toBe(0);
    expect(r.totalPaid).toBe(0);
    expect(r.payoutMultiple).toBe(null);
    expect(r.payoutRatePercent).toBe(null);
    expect(r.moneyBackYears).toBe(null);
    expect(r.exclusionRatioPercent).toBe(null);
    expect(r.effectiveTaxRatePercent).toBe(null);
  });

  it("handles an annual, single-payment-a-year contract", () => {
    const r = run({ paymentsPerYear: 1, years: 20 });
    expect(r.totalPayments).toBe(20);
    expect(r.ratePerPeriod).toBeCloseTo(0.045, 12);
    expect(r.annualPayment).toBeCloseTo(r.payment, 10);
  });

  it("keeps every figure it returns positive", () => {
    // Presentation-shaped, per docs §2: the sign flip happens once inside
    // the module. Only `interestEarned` and `quoteAdvantage` may be
    // negative, and both are differences whose sign is the answer.
    for (const over of [
      {},
      { deferralYears: 10 },
      { paymentAtStart: false },
      { mode: "premium" as const, desiredPayment: 1_500 },
      { ratePercent: 0 },
    ]) {
      const r = run(over);
      for (const value of [
        r.premium,
        r.payment,
        r.annualPayment,
        r.totalPaid,
        r.valueAtAnnuitisation,
        r.excludedPerPayment,
        r.taxablePerPayment,
        r.taxPerPayment,
        r.netPerPayment,
      ]) {
        expect(value, JSON.stringify(over)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
