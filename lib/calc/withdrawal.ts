/**
 * Drawing an income from a portfolio, for /cong-cu/thu-nhap-dau-tu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `withdrawal.test.ts`.
 *
 * Two questions, and the module answers both because they are the same
 * relationship read from either end:
 *
 * - **How long does it last?** Given a withdrawal, simulate month by month
 *   until the balance runs out — or report that it never does.
 * - **What is sustainable?** Given a horizon, solve for the withdrawal that
 *   ends at exactly zero, and separately report the PERPETUAL withdrawal
 *   that leaves the balance intact forever.
 *
 * The figure that matters most is the one people skip: withdrawals have to
 * RISE with inflation or the income shrinks in real terms every year. A
 * "sustainable" 8% of a portfolio is not sustainable if the portfolio earns
 * 8% and the withdrawal grows 4% a year — the balance falls from the first
 * month. So `inflationPercent` is a first-class input and the perpetual
 * withdrawal is computed on the REAL return, not the nominal one.
 *
 * Simulation rather than a closed form, because the withdrawal grows
 * annually while the return compounds monthly, and the two schedules do not
 * line up. The simulation is capped and reports "does not run out" rather
 * than a very large number.
 */

/** Hard stop on the simulation: 100 years of monthly periods. */
const MAX_MONTHS = 1200;

export type WithdrawalInput = {
  /** Portfolio value today, in đồng. */
  balance: number;
  /** Amount withdrawn at the END of each month, in đồng, in year one. */
  monthlyWithdrawal: number;
  /** Return on the portfolio, in percent per year. */
  annualReturnPercent?: number;
  /** How fast the withdrawal is increased each year, in percent. */
  inflationPercent?: number;
};

export type WithdrawalResult = {
  /**
   * Months the balance lasts. Null when it never runs out inside the
   * simulation's 100-year cap — reported as such rather than as a number.
   */
  monthsLasted: number | null;
  /** `monthsLasted / 12`. Null on the same condition. */
  yearsLasted: number | null;
  /** Everything withdrawn before the balance ran out. */
  totalWithdrawn: number;
  /** Balance at the cap, when it never runs out. */
  finalBalance: number;
  /** The withdrawal in the last year it was taken, after inflation. */
  finalMonthlyWithdrawal: number;
  /** First month's return, for comparison with the first withdrawal. */
  firstMonthReturn: number;
  /**
   * The withdrawal the portfolio can pay FOREVER, at today's prices, rising
   * with inflation. Computed on the real return, so it is null when the real
   * return is not positive — in that case no withdrawal is perpetual.
   */
  perpetualMonthlyWithdrawal: number | null;
  /** Real return: `(1 + nominal) / (1 + inflation) − 1`, in percent. */
  realReturnPercent: number;
  /** The withdrawal as a percent of the starting balance, annualised. */
  withdrawalRatePercent: number;
  /** True when the first withdrawal already exceeds the first month's return. */
  drawingDownPrincipal: boolean;
};

/**
 * Simulate an income drawn from a portfolio.
 *
 * Null when the inputs cannot describe one: a non-positive balance, a
 * negative withdrawal, a return or inflation rate at or below −100%, or any
 * non-finite number.
 *
 * A withdrawal of zero is allowed: the balance simply grows, and the result
 * reports that it never runs out.
 */
export function computeWithdrawal(
  input: WithdrawalInput,
): WithdrawalResult | null {
  const {
    balance,
    monthlyWithdrawal,
    annualReturnPercent = 0,
    inflationPercent = 0,
  } = input;

  if (!Number.isFinite(balance) || balance <= 0) return null;
  if (!Number.isFinite(monthlyWithdrawal) || monthlyWithdrawal < 0) return null;
  for (const rate of [annualReturnPercent, inflationPercent]) {
    if (!Number.isFinite(rate) || rate <= -100) return null;
  }

  const nominal = annualReturnPercent / 100;
  const inflation = inflationPercent / 100;
  // Geometric, not divided by 12: a full year must compound to the stated
  // annual rate.
  const monthlyReturn = (1 + nominal) ** (1 / 12) - 1;
  const realReturn = (1 + nominal) / (1 + inflation) - 1;

  let remaining = balance;
  let totalWithdrawn = 0;
  let monthsLasted: number | null = null;
  let finalMonthlyWithdrawal = monthlyWithdrawal;
  const firstMonthReturn = balance * monthlyReturn;

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    remaining *= 1 + monthlyReturn;
    // The withdrawal steps up once a year, so it is flat within each year.
    const yearsElapsed = Math.floor((month - 1) / 12);
    const withdrawal = monthlyWithdrawal * (1 + inflation) ** yearsElapsed;
    finalMonthlyWithdrawal = withdrawal;

    if (withdrawal >= remaining) {
      // The last withdrawal is trimmed to whatever is left.
      totalWithdrawn += remaining;
      remaining = 0;
      monthsLasted = month;
      break;
    }

    remaining -= withdrawal;
    totalWithdrawn += withdrawal;
  }

  // A perpetual withdrawal has to grow with inflation too, so it is the real
  // return that funds it. A non-positive real return funds nothing forever.
  const perpetualMonthlyWithdrawal =
    realReturn > 0
      ? (balance * ((1 + realReturn) ** (1 / 12) - 1))
      : null;

  return {
    monthsLasted,
    yearsLasted: monthsLasted === null ? null : monthsLasted / 12,
    totalWithdrawn,
    finalBalance: remaining,
    finalMonthlyWithdrawal,
    firstMonthReturn,
    perpetualMonthlyWithdrawal,
    realReturnPercent: realReturn * 100,
    withdrawalRatePercent: ((monthlyWithdrawal * 12) / balance) * 100,
    drawingDownPrincipal: monthlyWithdrawal > firstMonthReturn,
  };
}
