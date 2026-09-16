/**
 * ORIGINAL ROW 20 — a deposit against the date the money is needed.
 *
 * The supervisor's acceptance fixtures, all on actual days ÷ 365 and all
 * hypothetical arithmetic rather than any bank's terms:
 *
 * | Case | Days | Figure |
 * |---|---:|---:|
 * | 500 triệu, 6%/năm, 31/1/2026 → 31/7/2026 | 181 | 14.876.712,328767123 |
 * | the same term in a leap year, 2028 | 182 | 14.958.904,10958904 |
 * | need 30/4/2026, early rate 0,2% | 89 | 243.835,61643835617 |
 * | the same 89 days at the TERM rate | 89 | 7.315.068,493150685 |
 * | renewal opening on 31/7/2026 | — | 514.876.712,3287671 |
 * | need 31/10/2026, 92 days into term two | 92 | 259.554,28785888533 |
 * | total interest through that exit | — | 15.136.266,616626007 |
 *
 * `toBeCloseTo`'s second argument is a DIGIT COUNT, not a delta, so every
 * tolerance below is stated as an absolute bound on the đồng.
 */
import { describe, expect, it } from "vitest";
import {
  DAYS_PER_YEAR,
  MAX_DEPOSIT_TERMS,
  planDeposit,
  type DepositPlanInput,
} from "@/lib/calc/deposit-plan";

/** A hundredth of a đồng: float residue on a nine-figure accrual. */
const DONG = 1e-2;

function near(actual: number | null, expected: number, label: string) {
  expect(actual, label).not.toBeNull();
  expect(Math.abs((actual as number) - expected), label).toBeLessThan(DONG);
}

const BASE: DepositPlanInput = {
  principal: 500_000_000,
  annualRatePercent: 6,
  earlyRatePercent: 0.2,
  start: { year: 2026, month: 1, day: 31 },
  termMonths: 6,
  needDate: { year: 2026, month: 7, day: 31 },
  renew: false,
};

describe("the term is measured in days, not in twelfths of a year", () => {
  it("counts 181 days from 31/1/2026 to 31/7/2026", () => {
    const plan = planDeposit(BASE)!;
    expect(plan).not.toBeNull();
    expect(plan.firstMaturity).toEqual({ year: 2026, month: 7, day: 31 });
    expect(plan.firstTermDays).toBe(181);
    near(plan.firstTermInterest, 14_876_712.328767123, "first term interest");
    // The months/12 approximation would give 15.000.000 ₫ — 123.288 ₫ more,
    // which is the whole reason this view exists.
    expect(500_000_000 * 0.06 * (6 / 12)).toBe(15_000_000);
  });

  it("counts 182 days across a leap February", () => {
    const leap = planDeposit({
      ...BASE,
      start: { year: 2028, month: 1, day: 31 },
      needDate: { year: 2028, month: 7, day: 31 },
    })!;
    expect(leap.firstTermDays).toBe(182);
    near(leap.firstTermInterest, 14_958_904.10958904, "leap term interest");
  });

  it("clamps a month-end term without drifting afterwards", () => {
    // 31/1 + 1 month is 28/2; the NEXT term is measured from 28/2, which is
    // the stated convention — a renewal follows the previous actual maturity.
    const monthly = planDeposit({
      ...BASE,
      termMonths: 1,
      renew: true,
      needDate: { year: 2026, month: 4, day: 30 },
    })!;
    expect(monthly.cycles[0].maturity).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(monthly.cycles[1].start).toEqual({ year: 2026, month: 2, day: 28 });
    expect(monthly.cycles[1].maturity).toEqual({
      year: 2026,
      month: 3,
      day: 28,
    });
    expect(monthly.cycles[0].days).toBe(28);
  });

  it("quotes every figure on the 365-day basis it states", () => {
    const plan = planDeposit(BASE)!;
    expect(DAYS_PER_YEAR).toBe(365);
    near(
      plan.firstTermInterest,
      (500_000_000 * 0.06 * plan.firstTermDays) / 365,
      "365 basis",
    );
  });
});

describe("the money is needed exactly on the maturity date", () => {
  const plan = planDeposit(BASE)!;

  it("keeps the whole term interest and breaks nothing", () => {
    expect(plan.status).toBe("atMaturity");
    expect(plan.requiresEarlyWithdrawal).toBe(false);
    near(plan.interestAtExit, 14_876_712.328767123, "interest at exit");
    expect(plan.brokenInterest).toBeNull();
    // No early-exit comparison exists, and none is invented: a zero
    // difference and "there is nothing to compare" are different answers.
    expect(plan.rateDifference).toBeNull();
    expect(plan.foregoneFutureInterest).toBeNull();
  });

  it("pays the principal back with that interest, as new cash", () => {
    expect(plan.principalReturned).toBe(500_000_000);
    near(plan.interestPaidAtNeedDate, 14_876_712.328767123, "cash interest");
    near(plan.newPaymentAtNeedDate, 514_876_712.3287671, "paid on the day");
    // Available and paid are the same figure here: it all arrives that day.
    expect(plan.availableAtNeedDate).toBe(plan.newPaymentAtNeedDate);
    expect(plan.interestAlreadyPaid).toBe(0);
    expect(plan.proceedsHeldSinceMaturity).toBe(false);
  });

  it("reports the CURRENT term's dates and days, not the first term's", () => {
    // One term here, so the two coincide — the renewal case below is where
    // they diverge, and that is the mix-up this field pair exists to prevent.
    expect(plan.currentMaturity).toEqual(plan.firstMaturity);
    expect(plan.currentTermDays).toBe(plan.firstTermDays);
    expect(plan.termsElapsed).toBe(1);
  });
});

describe("the money is needed before maturity", () => {
  const plan = planDeposit({
    ...BASE,
    needDate: { year: 2026, month: 4, day: 30 },
  })!;

  it("runs 89 days into the term and pays the entered early rate on them", () => {
    expect(plan.status).toBe("beforeMaturity");
    expect(plan.requiresEarlyWithdrawal).toBe(true);
    expect(plan.daysFromStart).toBe(89);
    expect(plan.daysIntoBrokenTerm).toBe(89);
    near(plan.brokenInterest, 243_835.61643835617, "early interest");
    near(plan.interestAtExit, 243_835.61643835617, "interest at exit");
  });

  it("separates the RATE difference from the days not yet run", () => {
    // The same 89 days at the term rate: 7.315.068,49. That difference —
    // 7.071.232,88 — is what breaking early costs over the days actually run.
    near(plan.termRateSameHorizon, 7_315_068.493150685, "same horizon");
    near(plan.rateDifference, 7_071_232.876712329, "rate difference");
    // The rest of the gap to maturity is 92 days that have not happened.
    expect(plan.daysToPendingMaturity).toBe(92);
    expect(plan.pendingMaturity).toEqual({ year: 2026, month: 7, day: 31 });
    near(
      plan.interestIfHeldToMaturity,
      14_876_712.328767123,
      "held to maturity",
    );
    near(plan.foregoneFutureInterest, 7_561_643.835616438, "future time");
    // The two parts sum to the whole gap, and the whole gap is NOT a penalty:
    // 14.632.876,71 is 7.071.232,88 of rate plus 7.561.643,84 of time.
    near(
      plan.rateDifference! + plan.foregoneFutureInterest!,
      14_876_712.328767123 - 243_835.61643835617,
      "gap identity",
    );
  });

  it("returns the whole deposit, because that is what it models", () => {
    near(plan.availableAtNeedDate, 500_243_835.61643836, "available");
    expect(plan.newPaymentAtNeedDate).toBe(plan.availableAtNeedDate);
    expect(plan.principalReturned).toBe(500_000_000);
    expect(plan.interestAlreadyPaid).toBe(0);
    expect(plan.proceedsHeldSinceMaturity).toBe(false);
  });

  it("earns nothing at a zero early rate, and says nothing else changed", () => {
    const zero = planDeposit({
      ...BASE,
      earlyRatePercent: 0,
      needDate: { year: 2026, month: 4, day: 30 },
    })!;
    expect(zero.brokenInterest).toBe(0);
    expect(zero.availableAtNeedDate).toBe(500_000_000);
    near(zero.rateDifference, 7_315_068.493150685, "whole term rate lost");
  });
});

describe("the money is needed after the deposit has matured", () => {
  const plan = planDeposit({
    ...BASE,
    needDate: { year: 2026, month: 10, day: 31 },
  })!;

  it("does not accrue term interest past maturity", () => {
    expect(plan.status).toBe("afterMaturity");
    expect(plan.requiresEarlyWithdrawal).toBe(false);
    // Exactly the first term's interest — not a day more, because after
    // maturity this model holds the cash and pays nothing on it.
    near(plan.interestAtExit, 14_876_712.328767123, "interest at exit");
    expect(plan.cycles).toHaveLength(1);
  });

  it("distinguishes money HELD from a payment made that day", () => {
    // The defect this closes: reporting 500.000.000 ₫ as cash received on the
    // later date while the interest had arrived months earlier — which both
    // invents a payment and drops the matured interest out of the reader's
    // own money.
    expect(plan.proceedsHeldSinceMaturity).toBe(true);
    expect(plan.newPaymentAtNeedDate).toBe(0);
    expect(plan.principalReturned).toBe(0);
    expect(plan.interestPaidAtNeedDate).toBe(0);
    near(plan.interestAlreadyPaid, 14_876_712.328767123, "already paid");
    // What the saver HAS: principal plus the interest that matured earlier.
    near(plan.availableAtNeedDate, 514_876_712.3287671, "available");
  });
});

describe("renewal keeps matured cycles and counts them once", () => {
  const plan = planDeposit({
    ...BASE,
    renew: true,
    needDate: { year: 2026, month: 10, day: 31 },
  })!;

  it("opens the second term with principal plus matured interest", () => {
    expect(plan.status).toBe("beforeMaturity");
    expect(plan.cycles).toHaveLength(2);
    near(plan.cycles[1].opening, 514_876_712.3287671, "second opening");
    expect(plan.cycles[1].start).toEqual({ year: 2026, month: 7, day: 31 });
    expect(plan.cycles[1].maturity).toEqual({ year: 2027, month: 1, day: 31 });
  });

  it("charges the early rate on 92 days of the unfinished second term", () => {
    expect(plan.daysIntoBrokenTerm).toBe(92);
    near(plan.brokenInterest, 259_554.28785888533, "second term early");
    near(plan.maturedInterest, 14_876_712.328767123, "matured interest");
    near(plan.interestAtExit, 15_136_266.616626007, "total through exit");
  });

  it("does not pay the matured interest twice", () => {
    // It was rolled into the principal, so it comes back as PRINCIPAL and
    // nothing was handed over earlier.
    expect(plan.interestAlreadyPaid).toBe(0);
    near(plan.principalReturned, 514_876_712.3287671, "principal back");
    near(plan.interestPaidAtNeedDate, 259_554.28785888533, "new interest");
    near(plan.availableAtNeedDate, 515_136_266.616626, "available");
    // The ledger identity: cash out = principal in + every interest figure
    // earned through the exit, each counted once.
    near(
      plan.availableAtNeedDate,
      500_000_000 + plan.interestAtExit!,
      "ledger identity",
    );
  });

  it("reports the CURRENT term, which is not the first one", () => {
    // The horizon mix-up an independent check found: 181 days in the first
    // term, 184 in the second, 365 across the plan.
    expect(plan.termsElapsed).toBe(2);
    expect(plan.firstTermDays).toBe(181);
    expect(plan.firstMaturity).toEqual({ year: 2026, month: 7, day: 31 });
    expect(plan.currentTermStart).toEqual({ year: 2026, month: 7, day: 31 });
    expect(plan.currentMaturity).toEqual({ year: 2027, month: 1, day: 31 });
    expect(plan.currentTermDays).toBe(184);
    expect(plan.daysFromStart).toBe(273);
  });

  it("dates a later EXACT maturity at that maturity, not the first", () => {
    // 31/1/2027 is the second term's maturity: 365 days of plan, 184 of which
    // are that term's. The first draft reported 31/7/2026 here.
    const exact = planDeposit({
      ...BASE,
      renew: true,
      needDate: { year: 2027, month: 1, day: 31 },
    })!;
    expect(exact.status).toBe("atMaturity");
    expect(exact.currentMaturity).toEqual({ year: 2027, month: 1, day: 31 });
    expect(exact.currentTermDays).toBe(184);
    expect(exact.daysFromStart).toBe(365);
    expect(exact.termsElapsed).toBe(2);
    // Independent reference: 14.876.712,328767123 + 15.573.257,27153312.
    near(exact.cycles[1].interest, 15_573_257.27153312, "second term");
    near(exact.interestAtExit, 30_449_969.600300245, "total interest");
    near(exact.availableAtNeedDate, 530_449_969.60030025, "available");
    expect(exact.newPaymentAtNeedDate).toBe(exact.availableAtNeedDate);
  });

  it("keeps an earlier renewal's interest when a later term is broken", () => {
    const third = planDeposit({
      ...BASE,
      renew: true,
      needDate: { year: 2027, month: 4, day: 30 },
    })!;
    expect(third.cycles).toHaveLength(3);
    // Two matured cycles, neither lost and neither doubled.
    near(
      third.maturedInterest,
      third.cycles[0].interest + third.cycles[1].interest,
      "two matured cycles",
    );
    expect(third.cycles[2].opening).toBeGreaterThan(third.cycles[1].opening);
  });
});

describe("bounds, refusals and states that are answers", () => {
  it("refuses a need date before the deposit date", () => {
    expect(
      planDeposit({ ...BASE, needDate: { year: 2025, month: 12, day: 31 } }),
    ).toBeNull();
  });

  it("refuses a date that does not exist", () => {
    for (const patch of [
      { start: { year: 2026, month: 2, day: 30 } },
      { needDate: { year: 2026, month: 13, day: 1 } },
      { start: { year: 2026.5, month: 1, day: 1 } },
    ]) {
      expect(planDeposit({ ...BASE, ...patch }), JSON.stringify(patch)).toBeNull();
    }
  });

  it("refuses figures that cannot describe a deposit", () => {
    for (const patch of [
      { principal: 0 },
      { principal: -1 },
      { annualRatePercent: -1 },
      { earlyRatePercent: -1 },
      { termMonths: 0 },
      { termMonths: 6.5 },
      { principal: Number.NaN },
      { maxTerms: 0 },
      { maxTerms: MAX_DEPOSIT_TERMS + 1 },
    ]) {
      expect(planDeposit({ ...BASE, ...patch }), JSON.stringify(patch)).toBeNull();
    }
  });

  it("reports a need date beyond the supported cycles as an answer", () => {
    // Bounded BEFORE the walk: a one-month term renewed toward a date fifty
    // years out would be six hundred cycles.
    const far = planDeposit({
      ...BASE,
      termMonths: 1,
      renew: true,
      needDate: { year: 2076, month: 1, day: 31 },
    })!;
    expect(far.status).toBe("beyondLimit");
    expect(far.cycles.length).toBeLessThanOrEqual(MAX_DEPOSIT_TERMS);
    // No invented figures for a horizon that was not modelled.
    expect(far.brokenInterest).toBeNull();
    expect(far.interestIfHeldToMaturity).toBeNull();
  });

  it("keeps a zero-rate deposit finite and flat", () => {
    const flat = planDeposit({
      ...BASE,
      annualRatePercent: 0,
      earlyRatePercent: 0,
      renew: true,
      needDate: { year: 2026, month: 10, day: 31 },
    })!;
    expect(flat.interestAtExit).toBe(0);
    expect(flat.availableAtNeedDate).toBe(500_000_000);
    expect(flat.rateDifference).toBe(0);
  });

  it("treats a need date on the deposit date as zero days, not as an error", () => {
    const sameDay = planDeposit({ ...BASE, needDate: BASE.start })!;
    expect(sameDay.status).toBe("beforeMaturity");
    expect(sameDay.daysFromStart).toBe(0);
    expect(sameDay.brokenInterest).toBe(0);
    expect(sameDay.availableAtNeedDate).toBe(500_000_000);
  });

  it("carries NO exit figures at all past the supported cycles", () => {
    // The defect: a 0 in the cash and interest fields of a horizon that was
    // never reached reads as a computed answer.
    const far = planDeposit({
      ...BASE,
      termMonths: 1,
      renew: true,
      needDate: { year: 2076, month: 1, day: 31 },
    })!;
    expect(far.status).toBe("beyondLimit");
    for (const figure of [
      far.interestAtExit,
      far.maturedInterest,
      far.availableAtNeedDate,
      far.newPaymentAtNeedDate,
      far.principalReturned,
      far.interestPaidAtNeedDate,
      far.interestAlreadyPaid,
    ]) {
      expect(figure).toBeNull();
    }
    // The dates that WERE modelled stay, because the recovery sentence needs
    // them and they are real.
    expect(far.firstMaturity).toEqual({ year: 2026, month: 2, day: 28 });
    expect(far.cycles.length).toBe(MAX_DEPOSIT_TERMS);
  });
});
