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
 * Contributions land at the END of each month, matching the savings-goal
 * module, so the two agree on the fee-free case.
 */

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

  /** Compound annual return actually achieved, in percent. */
  netAnnualReturnPercent: number;
  /** The same with no fees — close to, but not exactly, the gross input. */
  grossAnnualReturnPercent: number;
  /** Percentage points of annual return lost to fees. */
  annualDragPoints: number;
};

/** Compound annual rate that turns `paid` into `value` over `months`. */
function annualised(value: number, paid: number, months: number): number {
  if (paid <= 0 || value <= 0 || months <= 0) return 0;
  return ((value / paid) ** (12 / months) - 1) * 100;
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
  }

  const exitFee = netBalance * (exitFeePercent / 100);
  const netValue = netBalance - exitFee;
  const grossValue = grossBalance;

  if (!Number.isFinite(netValue) || !Number.isFinite(grossValue)) return null;

  const netProfit = netValue - totalContributed;
  const grossProfit = grossValue - totalContributed;
  const netAnnualReturnPercent = annualised(netValue, totalContributed, months);
  const grossAnnualReturnPercent = annualised(
    grossValue,
    totalContributed,
    months,
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
    annualDragPoints: grossAnnualReturnPercent - netAnnualReturnPercent,
  };
}
