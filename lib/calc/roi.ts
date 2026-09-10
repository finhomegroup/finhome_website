/**
 * Return on investment for /cong-cu/ty-suat-loi-nhuan-roi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `roi.test.ts`.
 *
 * Plain ROI is one division, and on its own it is close to useless for
 * comparing investments: 40% over eight months and 40% over eight years are
 * the same number and not remotely the same deal. So this module always
 * returns the annualised figure alongside it whenever a holding period is
 * given, and the page leads with the annualised one.
 *
 * Annualising uses the geometric form — `(final / cost) ** (1 / years) - 1`,
 * i.e. the compound annual growth rate — not `roi / years`. Dividing would
 * ignore compounding and overstate long holdings.
 */

export type RoiInput = {
  /** Total put in, in đồng. */
  cost: number;
  /** Total taken out, or current value, in đồng. */
  finalValue: number;
  /**
   * Holding period in years. Omit or pass 0 when unknown — the annualised
   * figures then come back null rather than as a guess.
   */
  years?: number;
};

export type RoiResult = {
  /** Money made, or lost. Negative on a loss. */
  gain: number;
  /** Gain as a percent of the cost. −100% is a total loss. */
  roiPercent: number;
  /**
   * Compound annual growth rate, in percent. Null when no holding period was
   * given, and on a total loss, where no annual rate reaches zero from
   * a positive start.
   */
  annualisedPercent: number | null;
  /**
   * What one đồng became: `finalValue / cost`. 1 is break-even. Handy for
   * "gấp 2,4 lần" phrasing, which reads better in Vietnamese than 140%.
   */
  multiple: number;
  /** Echoed back so the page never has to re-derive it. */
  years: number | null;
};

/**
 * Compute ROI.
 *
 * Null when the inputs cannot describe an investment: a cost of zero or less
 * (there is no return on nothing invested), a negative final value, a negative
 * holding period, or any non-finite number.
 */
export function computeRoi(input: RoiInput): RoiResult | null {
  const { cost, finalValue, years = 0 } = input;

  const numbers = [cost, finalValue, years];
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (cost <= 0) return null;
  if (finalValue < 0) return null;
  if (years < 0) return null;

  const gain = finalValue - cost;
  const multiple = finalValue / cost;

  // A total loss has no annual rate: no `r` satisfies cost × (1 + r)^n = 0
  // for finite n, and −100%/năm would imply the money vanished in year one.
  const annualisedPercent =
    years > 0 && finalValue > 0 ? (multiple ** (1 / years) - 1) * 100 : null;

  return {
    gain,
    roiPercent: (gain / cost) * 100,
    annualisedPercent,
    multiple,
    years: years > 0 ? years : null,
  };
}
