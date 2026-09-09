/**
 * Gross-to-net and net-to-gross, for /cong-cu/phan-phoi-rong/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `net-distribution.test.ts`.
 *
 * A payment arrives less than it was quoted because a stack of deductions
 * sits between the two figures. This module runs that stack in both
 * directions, and the reverse direction is why it exists: "what must be
 * quoted for me to receive 100 triệu" is the question people cannot do in
 * their heads, and the intuitive answer — add the deductions back — is wrong.
 *
 * Deductions come in two shapes and the ORDER matters:
 *
 * 1. **Percentage deductions**, applied to the gross. Several may apply, and
 *    they are applied to the SAME base rather than compounded — that is how
 *    tax and levy schedules are written, and compounding them would quietly
 *    reduce the total.
 * 2. **Fixed deductions**, subtracted after. A transfer fee does not scale.
 *
 * So `net = gross × (1 − Σ rates) − Σ fixed`, and inverting gives
 * `gross = (net + Σ fixed) ÷ (1 − Σ rates)`. That division is the part the
 * intuitive answer misses: recovering a 10% deduction needs 11,11% more
 * gross, not 10%.
 *
 * Both directions are exposed rather than one, because which is useful
 * depends on whether the reader is quoting a price or receiving a payment.
 */

export type DistributionDirection =
  /** Have the gross; find what arrives. */
  | "toNet"
  /** Have the net you need; find what must be quoted. */
  | "toGross";

export type NetDistributionInput = {
  direction: DistributionDirection;
  /** The figure you have, in đồng — gross or net per `direction`. */
  amount: number;
  /**
   * Percentage deductions, each applied to the GROSS. Applied to the same
   * base, not compounded.
   */
  percentDeductions?: readonly number[];
  /** Fixed deductions in đồng, subtracted after the percentages. */
  fixedDeductions?: readonly number[];
};

export type NetDistributionResult = {
  /** The amount before any deduction. */
  gross: number;
  /** What actually arrives. */
  net: number;
  /** The percentage rates added up. */
  totalPercentRate: number;
  /** Đồng taken by the percentage deductions. */
  percentAmount: number;
  /** Đồng taken by the fixed deductions. */
  fixedAmount: number;
  /** Everything deducted. */
  totalDeducted: number;
  /** Deductions as a percent of the gross. */
  effectiveRatePercent: number;
  /** What share of the gross survives, in percent. */
  retentionPercent: number;
  /**
   * How much MORE gross is needed to recover the percentage deductions, as a
   * percent of the net. The figure the intuitive answer gets wrong: at a 10%
   * deduction this is 11,11%, not 10%.
   *
   * Null when the net is zero or negative: there is no gross-up to quote.
   * See the note at the return.
   */
  grossUpPercent: number | null;
};

/**
 * Convert between a quoted amount and an amount received.
 *
 * Null when the inputs cannot describe the stack: a negative amount or
 * deduction, percentage rates summing to 100 or more (nothing survives, and
 * the reverse direction divides by zero), a net target that no gross can
 * reach, or any non-finite number.
 *
 * A gross that the fixed deductions swallow entirely yields a NEGATIVE net,
 * which is reported rather than floored: it is a real outcome — a small
 * transfer eaten by a flat fee — and clamping it to zero would hide the
 * problem. The gross-up beside it comes back null in that state, because a
 * gross-up on a net of zero or less is not a quantity.
 */
export function computeNetDistribution(
  input: NetDistributionInput,
): NetDistributionResult | null {
  const {
    direction,
    amount,
    percentDeductions = [],
    fixedDeductions = [],
  } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  for (const rate of percentDeductions) {
    if (!Number.isFinite(rate) || rate < 0) return null;
  }
  for (const fixed of fixedDeductions) {
    if (!Number.isFinite(fixed) || fixed < 0) return null;
  }

  const totalPercentRate = percentDeductions.reduce(
    (sum, rate) => sum + rate,
    0,
  );
  // At 100% nothing survives, and the reverse direction divides by zero.
  if (totalPercentRate >= 100) return null;

  const fixedAmount = fixedDeductions.reduce((sum, fixed) => sum + fixed, 0);
  const retention = 1 - totalPercentRate / 100;

  let gross: number;
  let net: number;

  if (direction === "toNet") {
    gross = amount;
    net = gross * retention - fixedAmount;
  } else {
    // The inversion. Dividing by the retention rate is the step the
    // intuitive "add the deductions back" answer skips.
    net = amount;
    gross = (net + fixedAmount) / retention;
  }

  if (!Number.isFinite(gross) || !Number.isFinite(net)) return null;
  // A gross of zero has no meaningful rate, and the reverse direction should
  // never produce one from a non-negative net.
  if (gross <= 0) return null;

  const percentAmount = gross * (totalPercentRate / 100);
  const totalDeducted = percentAmount + fixedAmount;

  return {
    gross,
    net,
    totalPercentRate,
    percentAmount,
    fixedAmount,
    totalDeducted,
    effectiveRatePercent: (totalDeducted / gross) * 100,
    retentionPercent: (net / gross) * 100,
    // Relative to the NET, because that is the number the reader is trying
    // to protect. 10% off the gross needs 11,11% more gross to restore.
    //
    // Null rather than 0 at a net of zero or less. At a zero net the
    // gross-up is unbounded — no finite figure quoted restores nothing to
    // something — and at a negative net the ratio is not a gross-up at all:
    // for a 100.000 ₫ gross eaten by a 200.000 ₫ fee the formula gives
    // −195,24%, which would claim you must quote LESS in order to receive a
    // negative amount. The honest output is "not applicable", which the page
    // renders as the suite's "—" placeholder.
    grossUpPercent: net > 0 ? ((gross - net) / net) * 100 : null,
  };
}
