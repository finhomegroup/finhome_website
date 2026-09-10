/**
 * Credit card debt for /cong-cu/tra-het-the-tin-dung/ and
 * /cong-cu/tra-toi-thieu-the-tin-dung/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `card-debt.test.ts`.
 *
 * Card debt is not an amortizing loan and must not be modelled as one. Three
 * differences matter, and all three make the debt worse than a loan:
 *
 * 1. **The rate is quoted per year but charged per day**, then billed
 *    monthly. A card at 30%/năm charges 30/365 % a day, so a month compounds
 *    to slightly more than 30/12 %. This module works in a monthly period
 *    rate derived from the daily rate — `(1 + r/365)^(days) − 1` — because
 *    that is what the statement does.
 * 2. **The minimum payment is a PERCENTAGE of the balance with a floor**, so
 *    it shrinks as the balance does. That is why paying the minimum takes so
 *    long: the payment falls almost as fast as the debt. `payFixed` and
 *    `payMinimum` therefore need genuinely different loops, not one with a
 *    flag.
 * 3. **A payment below the interest charge never repays anything.** The
 *    balance rises every month and the debt never clears. That has to come
 *    back as "no payoff", not as a very large number of months.
 *
 * Both functions simulate month by month rather than using a closed form.
 * There is no closed form for the minimum-payment case, and simulating both
 * keeps them comparable.
 */

/** Hard stop on the simulation: 100 years of monthly periods. */
const MAX_MONTHS = 1200;

/**
 * A balance at or below this is settled, not outstanding.
 *
 * The đồng has no subunit, so half a đồng is below anything a statement can
 * express — the same reasoning as `PAR_BAND_DONG` in `bond.ts`. The band is
 * needed because `paymentForMonths(n)` is the EXACT annuity payment, so month
 * `n` lands the balance on float noise rather than 0; a bare `owed > 0` then
 * ran a phantom month whose payment rendered as "0 ₫" and reported `n + 1`
 * months (115 of n = 1..360 at 50 triệu / 30%/năm, including 18 — one of the
 * three terms, 12 / 18 / 24, that the minimum-payment page's copy sends people
 * here to try; 12 and 24 happen to land on exactly 0, 18 lands on 7,9e-9 ₫).
 *
 * Sized by measurement, not by taste — and what it has to absorb is a
 * RELATIVE error, not a fixed number of đồng: the residue is float drift in
 * the annuity payment amplified by (1 + r)^n, so it grows with the balance and
 * with the term. Worst residue as a SHARE of the starting balance, over 8
 * balances from 100.000 to 5.000.000.000 ₫ × rates 0–50%/năm, all of it at
 * the top of the rate range: 6,4e-13 at terms ≤ 180 months, 1,2e-10 at ≤ 300,
 * 1,2e-9 at ≤ 360, 5,0e-9 at ≤ 400. A FIXED band therefore holds only while
 * balance × that share stays under it, which puts 0,5 ₫ here:
 *
 * - 1e-6 fails outright — 44 of n = 1..360 at the page defaults alone — and
 *   0,01 ₫ fails on big balances: 807 of 20.800 swept combinations at 1 tỷ and
 *   5 tỷ, worst 18,6 ₫.
 * - 0,5 ₫ is exact across both envelopes a card can plausibly reach. Zero
 *   off-by-one in 122.400 combinations (the 8 balances × rates 0–50%/năm step
 *   1 × terms 1–300 months), worst residue 0,384 ₫ at 5 tỷ / 50% / 299; and
 *   zero in 163.200 combinations of balances up to 100 triệu × the same rates
 *   × terms 1–400 months, worst 0,496 ₫ at 100 triệu / 50% / 398. Note how
 *   thin that second margin is: 0,496 against a 0,5 ₫ band is the relative
 *   residue catching up with the fixed one.
 * - Above that line the phantom month comes back, and THAT is the real ceiling
 *   on this band — the worst residue over the full 1–400 range is not 0,021 ₫
 *   but 18,573 ₫, at 5 tỷ / 50% / 400 (a payment with 12,42 ₫ of headroom, so
 *   inside the range, not a degenerate case). First off-by-one: n = 316 at
 *   5 tỷ / 50%/năm, 343 at 5 tỷ / 45%, 393 at 5 tỷ / 40%, 379 at 500 triệu /
 *   50%, 419 at 50 triệu / 50%; none at all in 111.600 combinations of
 *   balances ≤ 500 triệu × rates 0–30%/năm × terms up to 600 months. It is
 *   sporadic rather than a clean cutoff — 5 tỷ / 50% is one month long at
 *   n = 316 yet exact again at 317 — and the overshoot is always exactly one
 *   month (241 of the 163.200 combinations at the widest grid, every one of
 *   them +1), but that month's payment renders as a few đồng in place of the
 *   real last instalment: at 5 tỷ / 50% / 400, months 401 and "19 ₫" where the
 *   month-400 payment is 212.585.911 ₫. 33 years on a 5 tỷ card at 50%/năm is
 *   far outside any card, but the region is real, so `card-debt.test.ts` pins
 *   both sides of the ceiling.
 * - Widening the band is not the fix, which is why the ceiling is documented
 *   rather than papered over: 18,6 ₫ is a sum a statement can express, so a
 *   band that swallows it swallows a payable amount. Making the band
 *   proportional — max(0,5 ₫, balance × 1e-8) — does clear the whole 1–400
 *   sweep, but at 5 tỷ that band is 50 ₫, which meets the same objection.
 */
const SETTLED_BALANCE_DONG = 0.5;

/** Days in a billing month, for converting the annual rate. */
const DAYS_PER_MONTH = 365 / 12;

export type CardMonth = {
  /** 1-based month index. */
  month: number;
  /** Interest charged this month. */
  interest: number;
  /** Amount paid this month. */
  payment: number;
  /** How much of the payment reduced the balance. */
  principal: number;
  /** Balance after the payment. */
  balance: number;
};

export type CardPayoffResult = {
  /** Months to clear the balance. */
  months: number;
  /** Interest paid across the whole payoff. */
  totalInterest: number;
  /** Everything paid: balance plus interest. */
  totalPaid: number;
  /** Interest as a share of the original balance, in percent. */
  interestSharePercent: number;
  /** The first month's payment — the largest one in the minimum-payment case. */
  firstPayment: number;
  /** The last month's payment, which is usually a part-month. */
  lastPayment: number;
  /** Month-by-month detail. */
  schedule: CardMonth[];
};

/** The monthly period rate a card's annual rate really implies. */
function monthlyRate(annualRatePercent: number): number {
  const daily = annualRatePercent / 100 / 365;
  return (1 + daily) ** DAYS_PER_MONTH - 1;
}

/**
 * Pay a fixed amount every month until the card is clear.
 *
 * Null when the debt never clears — a payment at or below the first month's
 * interest charge — or when the inputs cannot describe a card: a balance at or
 * below `SETTLED_BALANCE_DONG`, a negative rate or payment, or any non-finite
 * number.
 *
 * The final payment is trimmed to whatever is actually outstanding, so the
 * balance lands on exactly zero rather than overshooting into a credit.
 */
export function payFixed(input: {
  /** Balance owed, in đồng. */
  balance: number;
  /** Nominal annual rate in percent, as quoted on the card. */
  annualRatePercent: number;
  /** Fixed amount paid every month. */
  monthlyPayment: number;
}): CardPayoffResult | null {
  const { balance, annualRatePercent, monthlyPayment } = input;

  const numbers = [balance, annualRatePercent, monthlyPayment];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  // Already settled by the band's own definition, so there is no schedule to
  // build and nothing a statement could show.
  if (balance <= SETTLED_BALANCE_DONG) return null;

  const rate = monthlyRate(annualRatePercent);
  // A payment that does not cover the first month's interest never will:
  // the balance only grows from here.
  if (monthlyPayment <= balance * rate) return null;

  const schedule: CardMonth[] = [];
  let owed = balance;
  let totalInterest = 0;

  for (
    let month = 1;
    month <= MAX_MONTHS && owed > SETTLED_BALANCE_DONG;
    month += 1
  ) {
    const interest = owed * rate;
    // Never pay more than is outstanding: the last month is a part-payment.
    const payment = Math.min(monthlyPayment, owed + interest);
    const principal = payment - interest;
    owed -= principal;
    totalInterest += interest;
    schedule.push({ month, interest, payment, principal, balance: owed });
  }

  // Guard: with a payment barely above the interest charge the loop can run
  // out before the balance clears. Report no payoff rather than a wrong one.
  if (owed > SETTLED_BALANCE_DONG) return null;

  settleFinalRow(schedule);
  return summarise(balance, totalInterest, schedule);
}

/**
 * Pay the card's minimum every month until it is clear.
 *
 * The minimum is `max(amount due × percent, floor)`, capped at the amount
 * due — where the amount due is the balance PLUS that month's interest. That
 * is what a Vietnamese statement does: it computes 5% of "tổng dư nợ cuối
 * kỳ", which already includes the interest charged. Taking the percentage of
 * the pre-interest balance instead would understate the minimum, and at a
 * 100% minimum would leave the interest unpaid and the card open.
 *
 * Because the percentage part shrinks with the balance, the floor is what
 * eventually clears the debt, and on a large balance at a high rate the floor
 * may be reached only after many years.
 *
 * Null when the debt never clears, which here means the minimum never exceeds
 * the interest charge — possible when the percentage is at or below the
 * monthly rate and the floor is 0. Also null for inputs that cannot describe
 * a card: a balance at or below `SETTLED_BALANCE_DONG`, a percentage outside
 * 0–100, a negative rate or floor, or any non-finite number.
 */
export function payMinimum(input: {
  /** Balance owed, in đồng. */
  balance: number;
  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Minimum payment as a percent of the balance. Vietnamese cards use 5. */
  minimumPercent: number;
  /** Absolute floor on the minimum payment, in đồng. */
  minimumFloor?: number;
  /** Extra paid on top of the minimum every month. */
  extraPerMonth?: number;
}): CardPayoffResult | null {
  const {
    balance,
    annualRatePercent,
    minimumPercent,
    minimumFloor = 0,
    extraPerMonth = 0,
  } = input;

  const numbers = [
    balance,
    annualRatePercent,
    minimumPercent,
    minimumFloor,
    extraPerMonth,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (balance <= SETTLED_BALANCE_DONG) return null;
  if (minimumPercent > 100) return null;

  const rate = monthlyRate(annualRatePercent);
  const schedule: CardMonth[] = [];
  let owed = balance;
  let totalInterest = 0;

  for (
    let month = 1;
    month <= MAX_MONTHS && owed > SETTLED_BALANCE_DONG;
    month += 1
  ) {
    const interest = owed * rate;
    const due = owed + interest;
    // The statement minimum: a share of the amount DUE, never below the
    // floor, and never more than the whole amount due.
    const minimum = Math.min(
      due,
      Math.max(due * (minimumPercent / 100), minimumFloor),
    );
    const payment = Math.min(due, minimum + extraPerMonth);
    // The minimum does not even cover the interest: this never clears.
    if (payment <= interest) return null;
    const principal = payment - interest;
    owed -= principal;
    totalInterest += interest;
    schedule.push({ month, interest, payment, principal, balance: owed });
  }

  if (owed > SETTLED_BALANCE_DONG) return null;

  settleFinalRow(schedule);
  return summarise(balance, totalInterest, schedule);
}

/**
 * Absorb the float residue into the final row so the balance is exactly 0.
 *
 * The same convention `amortize` documents in `finance.ts`: land the payoff on
 * zero by construction rather than leaving a rounding tolerance for the
 * caller. It also keeps `sum(payments) === totalPaid` — without it the dropped
 * residue reaches 7,5e-5 ₫ and the payoff-identity assertion in
 * `card-debt.test.ts` (a 5e-5 tolerance) becomes a coin flip.
 */
function settleFinalRow(schedule: CardMonth[]): void {
  const last = schedule[schedule.length - 1];
  if (last === undefined || last.balance === 0) return;
  last.payment += last.balance;
  last.principal += last.balance;
  last.balance = 0;
}

/** Shared tail of both simulations. */
function summarise(
  balance: number,
  totalInterest: number,
  schedule: CardMonth[],
): CardPayoffResult {
  return {
    months: schedule.length,
    totalInterest,
    totalPaid: balance + totalInterest,
    interestSharePercent: (totalInterest / balance) * 100,
    firstPayment: schedule[0].payment,
    lastPayment: schedule[schedule.length - 1].payment,
    schedule,
  };
}

/**
 * The fixed monthly payment that clears a balance in exactly `months`.
 *
 * The annuity formula, at the card's true monthly rate. Null when the inputs
 * cannot describe a card or the term is not a whole number of months.
 *
 * A balance at or below `SETTLED_BALANCE_DONG` is rejected on the same terms
 * as in `payFixed`, and the two guards have to stay in step: the page's second
 * mode solves the payment here and then simulates it with `payFixed`, so a
 * balance one accepts and the other calls settled would quote a payment for a
 * schedule that does not exist. `parseMoney("0,4")` is 0.4, so the form can
 * reach it.
 */
export function paymentForMonths(input: {
  balance: number;
  annualRatePercent: number;
  months: number;
}): number | null {
  const { balance, annualRatePercent, months } = input;

  const numbers = [balance, annualRatePercent, months];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (balance <= SETTLED_BALANCE_DONG) return null;
  if (months <= 0 || !Number.isInteger(months)) return null;

  const rate = monthlyRate(annualRatePercent);
  if (rate === 0) return balance / months;

  const growth = (1 + rate) ** months;
  const payment = (balance * rate * growth) / (growth - 1);
  return Number.isFinite(payment) ? payment : null;
}
