/**
 * The cost of fund fees over time, for /cong-cu/phi-quy-dau-tu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `fund-fees.test.ts`.
 *
 * A management fee sounds like a rounding error and behaves like a third
 * partner. The reason is compounding: the fee is charged on ASSETS, so it is
 * taken not just from this year's gain but from every future gain that money
 * would have produced. Over twenty years a 2%/năm fee typically consumes
 * around a third of what the investor would otherwise have made.
 *
 * The point of the module is therefore the SIDE-BY-SIDE: it runs the same
 * contributions twice, once at the gross return and once net of every charge,
 * and reports the gap. A single "value after fees" figure hides the size of
 * what was lost, because nobody has the fee-free figure to compare it to.
 *
 * Charges modelled, all as they are actually levied in Vietnam:
 *
 * - **Entry fee** (phí mua) — a percent of each amount paid in, taken before
 *   it is invested. Applies to the initial sum and to every contribution.
 * - **Management fee** (phí quản lý) — a percent of assets per year, accrued
 *   monthly against the balance.
 * - **Exit fee** (phí bán) — a percent of the final balance, often tapering
 *   to zero after a holding period. Taken once at the end.
 *
 * Contributions land at the END of each month.
 *
 * ONE RATE CONVENTION, AND IT IS NOT THE SAVINGS TOOL'S. This module reads
 * `grossReturnPercent` as an EFFECTIVE annual return and converts it
 * geometrically, `(1 + r)^(1/12) − 1`. `savings-goal.ts` reads its rate as a
 * NOMINAL annual rate and divides by 12. Both are documented and both are
 * defensible; what is NOT true is that the same displayed percentage gives
 * the same fee-free answer in both tools. At an effective 6% here, the
 * equivalent savings input is 5,841060678411658% — an independent audit
 * computed that, and an earlier comment on this page claimed the two agree.
 * Neither engine is changed to force the equality; the copy states it.
 *
 * ORIGINAL ROW 27 needs the two balances OVER TIME, not just at the end, and
 * the loop below already walks them month by month — it simply threw the
 * history away. `series` keeps it, bounded before it allocates.
 */

import { bisect } from "@/lib/calc/solve";

/**
 * The longest plan this module will walk, in months.
 *
 * 1.200 — the same hundred-year horizon `card-debt.ts` and `floating-loan.ts`
 * disclose, so the suite has ONE stated bound rather than one per module. It
 * exists because `series` allocates one entry per month: before it did, an
 * absurd month count was merely a slow loop, and now it would be an array.
 * Bounded BEFORE allocating, per docs §3.
 */
export const MAX_FUND_FEE_MONTHS = 1200;

export type FundFeesInput = {
  /** Lump sum paid in at the start, in đồng. */
  initial: number;
  /** Amount paid in at the end of each month. */
  monthlyContribution?: number;
  /** How long the money is invested, in whole months. */
  months: number;
  /** Return before any fees, in percent per year. */
  grossReturnPercent: number;
  /** Percent taken off each amount paid in. */
  entryFeePercent?: number;
  /** Percent of assets charged per year. */
  managementFeePercent?: number;
  /** Percent of the final balance taken on exit. */
  exitFeePercent?: number;
};

/**
 * One month's two balances.
 *
 * `net` is the balance BEFORE the exit fee, at every month including the
 * last. That is deliberate and it is the distinction original row 27's visual
 * has to show: on the audit's 36-month fixture the last `net` is
 * 743.356.975,93 and the money the reader can actually take out is
 * 739.640.191,05, because the exit fee is charged once, at the horizon. A
 * chart that ends its line at `net` and labels it "số tiền bạn nhận" would
 * overstate the answer by exactly that fee.
 */
export type FundFeesPoint = {
  /** 0 is the opening position: the initial sum, after any entry fee. */
  month: number;
  /** Balance with no fee of any kind. */
  gross: number;
  /** Balance after entry and management fees, BEFORE the exit fee. */
  net: number;
};

export type FundFeesResult = {
  /** Everything paid in, before entry fees. */
  totalContributed: number;
  /** Entry fees over the whole period. */
  totalEntryFees: number;
  /** Management fees over the whole period. */
  totalManagementFees: number;
  /** The exit fee, charged once at the end. */
  exitFee: number;
  /** All three added. */
  totalFees: number;

  /** Final balance after every fee. */
  netValue: number;
  /** Final balance if no fee were charged at all. */
  grossValue: number;
  /** `grossValue − netValue` — what the fees actually cost. */
  valueLost: number;
  /** `valueLost` as a percent of the fee-free final value. */
  valueLostPercent: number;

  /** Profit after fees: `netValue − totalContributed`. */
  netProfit: number;
  /** Profit with no fees. */
  grossProfit: number;
  /**
   * Share of the fee-free PROFIT consumed by fees, in percent. The headline
   * figure: fees are small against the balance and large against the gain.
   * Null when there was no gross profit to consume.
   */
  profitLostPercent: number | null;

  /**
   * Money-weighted annual return actually achieved, in percent. Null when the
   * flows do not bracket a rate — see `moneyWeightedAnnual`.
   */
  netAnnualReturnPercent: number | null;
  /**
   * The same with no fees. With no fees this is the gross input back, to
   * solver precision — which is what makes the row a self-check.
   */
  grossAnnualReturnPercent: number | null;
  /** Percentage points of annual return lost to fees. Null if either rate is. */
  annualDragPoints: number | null;

  /**
   * Both balances at every month from 0 to `months`.
   *
   * `months + 1` entries. The last entry's `net` is before the exit fee; the
   * result's `netValue` is after it. See `FundFeesPoint`.
   */
  series: FundFeesPoint[];
};

/**
 * Money-weighted annual return: the rate at which the actual cash flows have
 * zero present value.
 *
 * Not the money multiple raised to 12/months — that would price 1,3 tỷ of
 * monthly instalments as if every đồng arrived on day one, and it did: with
 * every fee set to zero the previous version reported 6,119%/năm for a plan
 * the user said earns 10%/năm. The flows are `initial` out at t=0,
 * `contribution` out at the end of every month, and the terminal value in at
 * t=`months` (the last contribution and the terminal value land at the same
 * instant, which the discounting handles).
 *
 * Null rather than a guess when the flows do not bracket a rate. Three ways
 * that happens, and NONE of them is a fixed month count or a fixed fee —
 * every boundary below moves with the inputs, so do not write a guard or a
 * test against a constant:
 *
 * 1. **Below the bracket floor.** `npv` decreases in `rate` here, so with
 *    `npv(+1) < 0` — true of any plan whose monthly return is under the +1
 *    ceiling, i.e. everything this page is for — the solve fails exactly when
 *    `npv(−0,5) < 0` as well. At `rate = −0,5` every discount factor is `2^m`,
 *    so that collapses to a closed form on the terminal value alone:
 *      `terminal < initial·2^−months + contribution·(2 − 2^(1−months))`
 *    — past a couple of years, simply "terminal below twice the monthly
 *    contribution". This is NOT only the wiped-out plan. On the page's
 *    default plan the threshold is exactly 10.000.000 ₫, so a 99,687% exit
 *    fee still solves (terminal 10.007.200,42 ₫ → −99,975%/năm) while 99,7%
 *    nulls (terminal 9.591.565,90 ₫), and both are inside the field's 0–100
 *    range; a 100%/năm management fee nulls at 4.950.000 ₫ left. A 100% exit
 *    fee (terminal 0) is just the far end of that band. What the null means
 *    here is "the money-weighted return is below the −0,5 monthly floor",
 *    i.e. worse than −99,9756%/năm — not "no rate exists". Reporting the
 *    floor itself would be the fabrication.
 * 2. **Above the bracket ceiling.** The mirror case, and the reason mode 1's
 *    closed form is conditioned on `npv(+1) < 0`: a return over +1 monthly
 *    (+409.500%/năm) leaves BOTH ends positive, so there is again no sign
 *    change. Measured: `grossReturnPercent` 1.000.000 with months=1 and no
 *    fees gives npv(−0,5) = +3,3e6 and npv(+1) = +7,7e4, and nulls with a
 *    terminal value well ABOVE the mode-1 threshold. Only an absurd gross
 *    return reaches this.
 * 3. **Overflow at the floor.** `terminal / (1 + rate)^months` is
 *    `terminal·2^months` at `rate = −0,5`, and the instalment sum is
 *    `contribution·(2^(months+1) − 2)`; whichever leaves double range first
 *    ends the solve. That cutoff scales with the terminal MAGNITUDE, so it
 *    moves per leg and per plan: on the default plan the fee-free leg nulls
 *    first at months=984 while the net leg still reports 7,7846%/năm and
 *    holds out until 986; at initial 1e12 / contribution 1e11 it is 970 and
 *    972; for a 1 ₫ lump with no contributions, 1013 and 1015. At the returns
 *    this page is for it is always past 74 years (earliest measured 949
 *    months at ≤30%/năm, 896 at ≤100%/năm), well outside what the page is
 *    for; a hyperbolic gross return moves it arbitrarily early (1.000.000%
 *    /năm overflows at months=1). A null there beats a fabricated rate.
 *
 * Modes 1 and 3 were checked as predicates against this module over a
 * 51.040-leg sweep of months, amounts and fee schedules at gross returns from
 * −90% to +50%/năm, with zero mismatches; mode 2 sits outside that range,
 * which is how it escaped the sweep. The page renders a blank row for all
 * three, and `fund-fees.test.ts` pins the mode-1 and mode-3 boundaries so the
 * figures above cannot drift.
 */
function moneyWeightedAnnual(
  initial: number,
  contribution: number,
  months: number,
  terminal: number,
): number | null {
  const npv = (rate: number) => {
    let value = -initial;
    for (let month = 1; month <= months; month += 1) {
      value += -contribution / (1 + rate) ** month;
    }
    return value + terminal / (1 + rate) ** months;
  };
  // Bracket the MONTHLY rate. −0,5 is −99,98%/năm and +1 is +409.500%/năm:
  // wide enough for anything a fund can do, and it keeps the discount factors
  // finite where a bound nearer −1 would overflow on a 240-month horizon.
  const monthly = bisect(npv, -0.5, 1, { tolerance: 1e-12 });
  return monthly === null ? null : ((1 + monthly) ** 12 - 1) * 100;
}

/**
 * Run the same plan with and without fees.
 *
 * Null when the inputs cannot describe a plan: nothing paid in at all, a
 * non-positive or non-integer month count, a negative amount, a fee rate
 * outside 0–100, a gross return at or below −100%, or any non-finite number.
 */
export function computeFundFees(
  input: FundFeesInput,
): FundFeesResult | null {
  const {
    initial,
    monthlyContribution = 0,
    months,
    grossReturnPercent,
    entryFeePercent = 0,
    managementFeePercent = 0,
    exitFeePercent = 0,
  } = input;

  const nonNegative = [
    initial,
    monthlyContribution,
    months,
    entryFeePercent,
    managementFeePercent,
    exitFeePercent,
  ];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  if (!Number.isFinite(grossReturnPercent) || grossReturnPercent <= -100) {
    return null;
  }
  if (months <= 0 || !Number.isInteger(months)) return null;
  // Bounded BEFORE the loop allocates its series, not by sampling afterwards.
  if (months > MAX_FUND_FEE_MONTHS) return null;
  if (initial === 0 && monthlyContribution === 0) return null;
  for (const fee of [entryFeePercent, managementFeePercent, exitFeePercent]) {
    if (fee > 100) return null;
  }

  // Monthly equivalents. The gross return is an annual figure, so it is
  // converted geometrically — dividing by 12 would overstate it.
  const grossMonthly = (1 + grossReturnPercent / 100) ** (1 / 12) - 1;
  // The management fee is accrued monthly against the balance. Using
  // (1 - f)^(1/12) rather than f/12 keeps a full year's accrual equal to the
  // stated annual rate.
  const feeRetentionMonthly =
    (1 - managementFeePercent / 100) ** (1 / 12);
  const entryRate = entryFeePercent / 100;

  let netBalance = initial * (1 - entryRate);
  let grossBalance = initial;
  let totalEntryFees = initial * entryRate;
  let totalManagementFees = 0;
  let totalContributed = initial;

  // Month 0 is the opening position, and the two values already differ by the
  // entry fee on the initial sum — 500 triệu against 495 triệu on the audit's
  // fixture. Starting the series at month 1 would hide the first charge.
  const series: FundFeesPoint[] = [
    { month: 0, gross: grossBalance, net: netBalance },
  ];

  for (let month = 1; month <= months; month += 1) {
    // Growth first, then the management fee on the grown balance, then the
    // month's contribution — which has not been invested yet, so it is not
    // charged a management fee this month.
    netBalance *= 1 + grossMonthly;
    grossBalance *= 1 + grossMonthly;

    const beforeFee = netBalance;
    netBalance *= feeRetentionMonthly;
    totalManagementFees += beforeFee - netBalance;

    if (monthlyContribution > 0) {
      totalContributed += monthlyContribution;
      const entryFee = monthlyContribution * entryRate;
      totalEntryFees += entryFee;
      netBalance += monthlyContribution - entryFee;
      grossBalance += monthlyContribution;
    }

    // After the contribution, so a month's entry reads as the position at the
    // end of that month — the same instant the savings tools report.
    series.push({ month, gross: grossBalance, net: netBalance });
  }

  const exitFee = netBalance * (exitFeePercent / 100);
  const netValue = netBalance - exitFee;
  const grossValue = grossBalance;

  if (!Number.isFinite(netValue) || !Number.isFinite(grossValue)) return null;

  const netProfit = netValue - totalContributed;
  const grossProfit = grossValue - totalContributed;
  const netAnnualReturnPercent = moneyWeightedAnnual(
    initial,
    monthlyContribution,
    months,
    netValue,
  );
  const grossAnnualReturnPercent = moneyWeightedAnnual(
    initial,
    monthlyContribution,
    months,
    grossValue,
  );

  return {
    totalContributed,
    totalEntryFees,
    totalManagementFees,
    exitFee,
    totalFees: totalEntryFees + totalManagementFees + exitFee,
    netValue,
    grossValue,
    valueLost: grossValue - netValue,
    valueLostPercent:
      grossValue > 0 ? ((grossValue - netValue) / grossValue) * 100 : 0,
    netProfit,
    grossProfit,
    profitLostPercent:
      grossProfit > 0
        ? ((grossProfit - netProfit) / grossProfit) * 100
        : null,
    netAnnualReturnPercent,
    grossAnnualReturnPercent,
    annualDragPoints:
      netAnnualReturnPercent === null || grossAnnualReturnPercent === null
        ? null
        : grossAnnualReturnPercent - netAnnualReturnPercent,
    series,
  };
}
