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
 * interest charge — or when the inputs cannot describe a card: a non-positive
 * balance, a negative rate or payment, or any non-finite number.
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
  if (balance <= 0) return null;

  const rate = monthlyRate(annualRatePercent);
  // A payment that does not cover the first month's interest never will:
  // the balance only grows from here.
  if (monthlyPayment <= balance * rate) return null;

  const schedule: CardMonth[] = [];
  let owed = balance;
  let totalInterest = 0;

  for (let month = 1; month <= MAX_MONTHS && owed > 0; month += 1) {
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
  if (owed > 0) return null;

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
 * a card: a non-positive balance, a percentage outside 0–100, a negative rate
 * or floor, or any non-finite number.
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
  if (balance <= 0) return null;
  if (minimumPercent > 100) return null;

  const rate = monthlyRate(annualRatePercent);
  const schedule: CardMonth[] = [];
  let owed = balance;
  let totalInterest = 0;

  for (let month = 1; month <= MAX_MONTHS && owed > 0; month += 1) {
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

  if (owed > 0) return null;

  return summarise(balance, totalInterest, schedule);
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
 */
export function paymentForMonths(input: {
  balance: number;
  annualRatePercent: number;
  months: number;
}): number | null {
  const { balance, annualRatePercent, months } = input;

  const numbers = [balance, annualRatePercent, months];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (balance <= 0 || months <= 0 || !Number.isInteger(months)) return null;

  const rate = monthlyRate(annualRatePercent);
  if (rate === 0) return balance / months;

  const growth = (1 + rate) ** months;
  const payment = (balance * rate * growth) / (growth - 1);
  return Number.isFinite(payment) ? payment : null;
}
