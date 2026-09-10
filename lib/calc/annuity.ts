/**
 * Annuities: the payment a premium buys, and what a quote implies.
 *
 * ## What this module refuses to do
 *
 * It does not price a LIFE annuity. Doing that needs a mortality table and
 * an insurer's loading, and a tool that invented either would produce a
 * number that looks like a quote and is not one. Transcribing a mortality
 * table would also multiply this suite's transcription surface for no gain,
 * since the reader can get a real quote in minutes.
 *
 * What it does instead is more useful and entirely honest: it INVERTS the
 * quote. Given what an insurer actually offers, it solves the return that
 * offer implies over a horizon the reader chooses. That turns "is 5.800 USD
 * a year for a 100.000 USD premium any good?" into a number comparable with
 * a bond yield — which is the question a reader can actually act on.
 *
 * Everything the module computes directly is a PERIOD-CERTAIN annuity: a
 * fixed number of payments at a stated rate. That is pure time value of
 * money with no mortality in it, and it is the right benchmark to hold a
 * life quote against.
 *
 * ## The tax rule people miss
 *
 * On a non-qualified annuity — bought with money that has already been
 * taxed — each payment is part return of your own capital and part
 * interest. Only the interest is taxable, in the ratio of the premium to
 * the total expected payments. So the effective tax rate on an annuity
 * payment is far below the marginal rate, and a reader comparing an annuity
 * with a taxable bond on gross yields is comparing the wrong two numbers.
 *
 * The exclusion is not permanent. It runs until the premium has been fully
 * recovered — for a period-certain annuity that is exactly the end of the
 * term, but a LIFE annuitant who outlives the expected recovery period
 * finds every later payment fully taxable. The module says so rather than
 * implying the shelter lasts for ever.
 *
 * ## Sign convention
 *
 * `finance.ts` is used for the annuity factor and follows the Excel
 * convention, so the premium goes in positive and `pmt` comes back
 * negative. The flip happens once, here, and every figure this module
 * returns is positive — see docs/calculator-suite-status.md §2.
 */

import { pmt, pv } from "@/lib/calc/finance";
import { bisect } from "@/lib/calc/solve";

export type AnnuityMode = "payment" | "premium";

export type AnnuityInput = {
  /**
   * "payment" solves the payment a premium buys; "premium" solves the
   * premium a desired payment needs. The two are exact inverses and the
   * test asserts the round trip.
   */
  mode: AnnuityMode;
  /** Lump sum handed over, in USD. Read in "payment" mode. */
  premium: number;
  /** Wanted per payment, in USD. Read in "premium" mode. */
  desiredPayment: number;
  /** Payments a year: 12 monthly, 4 quarterly, 1 annually. */
  paymentsPerYear: number;
  /** Years of payments. A period certain, not a life expectancy. */
  years: number;
  /** Annual rate the contract credits, in percent. */
  ratePercent: number;
  /** True for payments at the START of each period, as most annuities pay. */
  paymentAtStart: boolean;
  /** Years the premium grows before payments begin. Zero is immediate. */
  deferralYears: number;
  /** Marginal income tax rate, in percent, for the exclusion ratio. */
  taxRatePercent: number;
  /**
   * A payment an insurer has actually quoted, in USD per period. Zero skips
   * the comparison.
   */
  quotedPayment: number;
};

export type AnnuityResult = {
  /** Periods of payment. */
  totalPayments: number;
  /** Rate per period, which is what the annuity factor is built on. */
  ratePerPeriod: number;
  /** Premium, whether given or solved. */
  premium: number;
  /** Value at the moment payments begin, after any deferral. */
  valueAtAnnuitisation: number;
  /** Payment per period, whether given or solved. */
  payment: number;
  annualPayment: number;
  /** Every payment added up. */
  totalPaid: number;
  /** Total paid less the premium. Negative at a negative rate. */
  interestEarned: number;
  /** Total paid as a multiple of the premium. Null at a zero premium. */
  payoutMultiple: number | null;
  /** Annual payment as a percent of the premium — the payout rate. */
  payoutRatePercent: number | null;
  /**
   * Years of payments before the premium has simply been handed back, with
   * no interest counted. The "when do I get my money back" figure.
   */
  moneyBackYears: number | null;

  /** Premium divided by total expected payments, as a percent. */
  exclusionRatioPercent: number | null;
  /** Return of capital in each payment — not taxable. */
  excludedPerPayment: number;
  /** Interest in each payment — taxable. */
  taxablePerPayment: number;
  taxPerPayment: number;
  netPerPayment: number;
  /** Tax as a percent of the whole payment, which is below the marginal rate. */
  effectiveTaxRatePercent: number | null;

  /** The quote, if one was given. */
  quotedPayment: number;
  /** Annual rate the quote implies over this horizon, in percent. Null if unsolvable. */
  quotedImpliedRatePercent: number | null;
  /** Quote minus the payment the assumed rate produces. */
  quoteAdvantage: number | null;
};

const MAX_PAYMENTS_PER_YEAR = 366;
const MAX_YEARS = 70;
const MAX_DEFERRAL_YEARS = 50;

/**
 * Present value of `periods` payments of 1, at `rate` per period, starting
 * `offset` periods from now.
 *
 * Built on `pv` so there is one annuity factor in this repo rather than two.
 * `pv` follows the Excel convention, so a payment of −1 returns a positive
 * present value.
 */
function annuityFactor(
  rate: number,
  periods: number,
  offset: number,
  type: 0 | 1,
): number {
  const atStart = pv(rate, periods, -1, 0, type);
  return atStart / Math.pow(1 + rate, offset);
}

/**
 * Work out the contract.
 *
 * Null on negative money, a payment frequency outside 1–366, a term outside
 * 1–70 whole years, a deferral outside 0–50 whole years, a rate outside
 * −100–100%, or a tax rate outside 0–100%.
 */
export function computeAnnuity(input: AnnuityInput): AnnuityResult | null {
  const {
    mode,
    premium,
    desiredPayment,
    paymentsPerYear,
    years,
    ratePercent,
    paymentAtStart,
    deferralYears,
    taxRatePercent,
    quotedPayment,
  } = input;

  if (!Number.isInteger(paymentsPerYear)) return null;
  if (paymentsPerYear < 1 || paymentsPerYear > MAX_PAYMENTS_PER_YEAR) return null;
  if (!Number.isInteger(years) || years < 1 || years > MAX_YEARS) return null;
  if (!Number.isInteger(deferralYears)) return null;
  if (deferralYears < 0 || deferralYears > MAX_DEFERRAL_YEARS) return null;
  if (!Number.isFinite(ratePercent) || ratePercent < -100 || ratePercent > 100) {
    return null;
  }
  if (
    !Number.isFinite(taxRatePercent) ||
    taxRatePercent < 0 ||
    taxRatePercent > 100
  ) {
    return null;
  }
  for (const money of [premium, desiredPayment, quotedPayment]) {
    if (!Number.isFinite(money) || money < 0) return null;
  }

  const ratePerPeriod = ratePercent / 100 / paymentsPerYear;
  const totalPayments = years * paymentsPerYear;
  const deferralPeriods = deferralYears * paymentsPerYear;
  const type: 0 | 1 = paymentAtStart ? 1 : 0;

  let resolvedPremium: number;
  let payment: number;
  if (mode === "premium") {
    // Solve the premium a desired payment needs: the annuity factor times
    // the payment, discounted back over the deferral.
    payment = desiredPayment;
    resolvedPremium =
      payment * annuityFactor(ratePerPeriod, totalPayments, deferralPeriods, type);
  } else {
    resolvedPremium = premium;
    const valueAtStart =
      resolvedPremium * Math.pow(1 + ratePerPeriod, deferralPeriods);
    // pmt comes back negative under the Excel convention. This is the one
    // flip, per the module docstring.
    payment = Math.abs(pmt(ratePerPeriod, totalPayments, valueAtStart, 0, type));
  }

  const valueAtAnnuitisation =
    resolvedPremium * Math.pow(1 + ratePerPeriod, deferralPeriods);
  const annualPayment = payment * paymentsPerYear;
  const totalPaid = payment * totalPayments;

  // The exclusion ratio: what share of each payment is the reader's own
  // capital coming back. Capped at 1, because a contract that pays out less
  // than the premium cannot shelter more than the whole payment.
  const exclusionRatio =
    totalPaid <= 0 ? null : Math.min(1, resolvedPremium / totalPaid);
  const excludedPerPayment = exclusionRatio === null ? 0 : payment * exclusionRatio;
  const taxablePerPayment = Math.max(0, payment - excludedPerPayment);
  const taxPerPayment = taxablePerPayment * (taxRatePercent / 100);

  // Invert a quote: the rate at which its payments are worth the premium.
  // Bisection rather than `solveRate`, because a deferred contract has a
  // gap between the premium and the first payment that `solveRate`'s cash
  // flow shape cannot express.
  let quotedImpliedRatePercent: number | null = null;
  if (quotedPayment > 0 && resolvedPremium > 0) {
    // Solved on the ANNUAL rate, not the per-period one, and that is a
    // numeric decision rather than a cosmetic one. A per-period bracket
    // just above -100% underflows `(1 + rate) ** periods` to zero at 480
    // monthly periods, the annuity factor then divides by zero, and
    // `bisect` correctly refuses a non-finite endpoint — so every
    // long-dated contract returned "no solution". That is the same overflow
    // surface docs §8 records twice, in `solveRate` and again in `bond.ts`,
    // and the long-term test below is what caught it here.
    //
    // At -99% a year the worst case is (1 - 0.0825) ** 480, about 1e-18:
    // comfortably finite, and far below any rate a real contract implies.
    const solved = bisect(
      (annualRate) =>
        quotedPayment *
          annuityFactor(
            annualRate / paymentsPerYear,
            totalPayments,
            deferralPeriods,
            type,
          ) -
        resolvedPremium,
      -0.99,
      1,
    );
    if (solved !== null) {
      quotedImpliedRatePercent = solved * 100;
    }
  }

  return {
    totalPayments,
    ratePerPeriod,
    premium: resolvedPremium,
    valueAtAnnuitisation,
    payment,
    annualPayment,
    totalPaid,
    interestEarned: totalPaid - resolvedPremium,
    payoutMultiple: resolvedPremium <= 0 ? null : totalPaid / resolvedPremium,
    payoutRatePercent:
      resolvedPremium <= 0 ? null : (annualPayment / resolvedPremium) * 100,
    moneyBackYears: annualPayment <= 0 ? null : resolvedPremium / annualPayment,

    exclusionRatioPercent: exclusionRatio === null ? null : exclusionRatio * 100,
    excludedPerPayment,
    taxablePerPayment,
    taxPerPayment,
    netPerPayment: payment - taxPerPayment,
    effectiveTaxRatePercent:
      payment <= 0 ? null : (taxPerPayment / payment) * 100,

    quotedPayment,
    quotedImpliedRatePercent,
    quoteAdvantage: quotedPayment <= 0 ? null : quotedPayment - payment,
  };
}
