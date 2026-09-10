/**
 * Holding period return, for /cong-cu/loi-nhuan-ky-nam-giu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `holding-period.test.ts`.
 *
 * What this adds over plain ROI — and the reason it is a separate tool — is
 * that it SPLITS the return into its two sources:
 *
 *   capital gain yield = (end − begin) ÷ begin
 *   income yield       = income received ÷ begin
 *   holding period return = the two added together
 *
 * Two assets with the same total return but different splits are different
 * investments: one pays you while you wait, the other only on exit. A bond
 * fund and a growth stock can both return 12% and only one of them funds
 * your rent.
 *
 * The annualised figure is the compound rate, `(1 + HPR)^(1/years) − 1`, not
 * `HPR ÷ years`. Dividing ignores compounding and overstates long holdings —
 * the same error the ROI module documents.
 *
 * Income is a TOTAL over the whole period, not per year. That is the honest
 * default for someone reading a brokerage statement, and the module says so
 * rather than making the user pro-rate.
 */

export type HoldingPeriodInput = {
  /** Value at the start, in đồng. */
  beginValue: number;
  /** Value at the end, in đồng. */
  endValue: number;
  /** Cash received across the WHOLE period: dividends, coupons, rent. */
  incomeReceived?: number;
  /**
   * Length of the holding period in years. May be fractional — 6 months is
   * 0,5. Omit or pass 0 when unknown; the annualised figures then come back
   * null rather than as a guess.
   */
  years?: number;
};

export type HoldingPeriodResult = {
  /** `end − begin`. Negative when the asset fell. */
  capitalGain: number;
  /** Capital gain as a percent of the starting value. */
  capitalGainYieldPercent: number;
  /** Income as a percent of the starting value. */
  incomeYieldPercent: number;
  /** The two yields added: the total return over the period, in percent. */
  holdingPeriodReturnPercent: number;
  /** Capital gain plus income, in đồng. */
  totalGain: number;
  /** What the position is worth on exit, income included. */
  totalProceeds: number;
  /**
   * Compound annual rate. Null when no period was given, and on a total
   * wipeout, where no annual rate reaches zero from a positive start.
   */
  annualisedReturnPercent: number | null;
  /** Share of the total return that came from income, in percent. */
  incomeSharePercent: number | null;
  /** Echoed back. Null when no period was given. */
  years: number | null;
};

/**
 * Split and annualise a holding period return.
 *
 * Null when the inputs cannot describe a holding: a non-positive starting
 * value (every yield divides by it), a negative ending value or income, a
 * negative period, or any non-finite number.
 */
export function computeHoldingPeriod(
  input: HoldingPeriodInput,
): HoldingPeriodResult | null {
  const {
    beginValue,
    endValue,
    incomeReceived = 0,
    years = 0,
  } = input;

  const numbers = [beginValue, endValue, incomeReceived, years];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (beginValue <= 0) return null;
  if (endValue < 0 || incomeReceived < 0 || years < 0) return null;

  const capitalGain = endValue - beginValue;
  const totalGain = capitalGain + incomeReceived;
  const totalProceeds = endValue + incomeReceived;

  const capitalGainYieldPercent = (capitalGain / beginValue) * 100;
  const incomeYieldPercent = (incomeReceived / beginValue) * 100;
  const holdingPeriodReturnPercent =
    capitalGainYieldPercent + incomeYieldPercent;

  // The compound rate, not HPR ÷ years. A total wipeout has no annual rate:
  // no finite r satisfies begin × (1 + r)^n = 0.
  const multiple = totalProceeds / beginValue;
  const annualisedReturnPercent =
    years > 0 && totalProceeds > 0
      ? (multiple ** (1 / years) - 1) * 100
      : null;

  return {
    capitalGain,
    capitalGainYieldPercent,
    incomeYieldPercent,
    holdingPeriodReturnPercent,
    totalGain,
    totalProceeds,
    annualisedReturnPercent,
    // The split is only meaningful against a non-zero total.
    incomeSharePercent:
      totalGain !== 0 ? (incomeReceived / totalGain) * 100 : null,
    years: years > 0 ? years : null,
  };
}
