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
 *
 * ORIGINAL ROW 26 needs the SERIES, not just the totals: "đường số dư và sức
 * mua dưới kịch bản". The loop already walks the balance month by month, so
 * `series` keeps it, and each point carries the same month's purchasing
 * power.
 *
 * THE PURCHASING-POWER CONVENTION IS DECLARED, because there are two
 * defensible ones and they are not the same number. The withdrawal steps up
 * ONCE A YEAR — it is flat inside each year — while `realBalance` deflates
 * the balance SMOOTHLY by `(1 + inflation)^(month/12)`. Those are different
 * concepts on purpose: the first is a payment schedule somebody actually
 * receives, the second is "what this balance would buy at today's prices",
 * which does not step. An independent audit checked both against a closed
 * form and confirmed the arithmetic; what it asked for is that the page SAY
 * which index it uses, rather than a reader discovering that the two curves
 * do not move in lockstep and assuming one is wrong.
 *
 * THE LAST WITHDRAWAL IS USUALLY PARTIAL, AND THAT IS REPORTED. On the
 * audit's fixture the plan asks for 25.975.146,71 in month 179 and only
 * 2.813.709,10 is there, so `monthsLasted` of 179 does NOT mean 179 funded
 * withdrawals: 178 were paid in full and the 179th was short by
 * 23.161.437,62. `lastWithdrawalPaid`, `lastWithdrawalPlanned` and
 * `lastWithdrawalShortfall` exist so a page cannot round that into "lasted
 * 179 months" and leave it there.
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

/** One month of the drawdown: what is left, and what it would buy. */
export type WithdrawalPoint = {
  /** 0 is the opening balance, before any return or withdrawal. */
  month: number;
  /** Balance in đồng of that month. */
  balance: number;
  /**
   * The same balance at TODAY's prices: `balance / (1 + inflation)^(month/12)`.
   *
   * A smooth index, deliberately — see the module docstring on why this does
   * not step in time with the annual withdrawal increase. Equal to `balance`
   * at month 0 and whenever inflation is zero.
   */
  realBalance: number;
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

  /**
   * The balance and its purchasing power at every month, from 0 to the month
   * the money ran out — or to the cap when it never does.
   */
  series: WithdrawalPoint[];

  /**
   * What the final month actually paid out.
   *
   * Equal to `lastWithdrawalPlanned` while the plan is funded. On the month
   * the money runs out it is whatever was left, which is usually a fraction
   * of the planned amount. Null when the balance never runs out.
   */
  lastWithdrawalPaid: number | null;
  /** What the schedule asked for in that month. Null on the same condition. */
  lastWithdrawalPlanned: number | null;
  /**
   * `planned − paid` on the month it ran out, so "lasted 179 months" cannot
   * be read as 179 full withdrawals. Null when it never runs out.
   */
  lastWithdrawalShortfall: number | null;
  /**
   * Withdrawals paid IN FULL. `monthsLasted − 1` when the last one was
   * short, `monthsLasted` when it happened to land exactly. Null when the
   * balance never runs out.
   */
  fullWithdrawals: number | null;
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

  /** The deflator for a month, as a smooth annual index. */
  const realValue = (nominalAmount: number, month: number) =>
    nominalAmount / (1 + inflation) ** (month / 12);

  const series: WithdrawalPoint[] = [
    { month: 0, balance, realBalance: balance },
  ];
  let lastWithdrawalPaid: number | null = null;
  let lastWithdrawalPlanned: number | null = null;

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    remaining *= 1 + monthlyReturn;
    // The withdrawal steps up once a year, so it is flat within each year.
    const yearsElapsed = Math.floor((month - 1) / 12);
    const withdrawal = monthlyWithdrawal * (1 + inflation) ** yearsElapsed;
    finalMonthlyWithdrawal = withdrawal;

    if (withdrawal >= remaining) {
      // The last withdrawal is trimmed to whatever is left — and BOTH the
      // planned and the paid amount are kept, because reporting only the
      // month count turns a partial payment into a full one.
      lastWithdrawalPaid = remaining;
      lastWithdrawalPlanned = withdrawal;
      totalWithdrawn += remaining;
      remaining = 0;
      monthsLasted = month;
      series.push({ month, balance: 0, realBalance: 0 });
      break;
    }

    remaining -= withdrawal;
    totalWithdrawn += withdrawal;
    series.push({
      month,
      balance: remaining,
      realBalance: realValue(remaining, month),
    });
  }

  // A perpetual withdrawal has to grow with inflation too, so it is the real
  // return that funds it. A non-positive real return funds nothing forever.
  //
  // THIS IS A MONTHLY-REAL-RETURN FIGURE, NOT THE EXACT MAXIMUM FOR THE
  // ANNUAL-STEP SCHEDULE ABOVE. On the audit's fixture it gives
  // 6.299.956,24, while the withdrawal that preserves real capital exactly at
  // each year end under a once-a-year step-up is 6.434.030,11
  // (= P × (G − H) / A(12), with G = 1,08, H = 1,04). This figure is the
  // LOWER of the two, so it is conservative rather than an overspend — but
  // the page must not present it as the precise ceiling for the schedule it
  // simulates, and the copy says which convention it is.
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
    series,
    lastWithdrawalPaid,
    lastWithdrawalPlanned,
    lastWithdrawalShortfall:
      lastWithdrawalPaid === null || lastWithdrawalPlanned === null
        ? null
        : lastWithdrawalPlanned - lastWithdrawalPaid,
    // A shortfall of exactly zero means the last withdrawal happened to land
    // on the balance, so it WAS a full one. Anything short means the month
    // before was the last funded one.
    fullWithdrawals:
      monthsLasted === null ||
      lastWithdrawalPaid === null ||
      lastWithdrawalPlanned === null
        ? null
        : lastWithdrawalPaid >= lastWithdrawalPlanned
          ? monthsLasted
          : monthsLasted - 1,
  };
}
