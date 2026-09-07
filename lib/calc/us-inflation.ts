/**
 * United States inflation and purchasing power.
 *
 * Two ways to ask the question, and the module keeps them apart rather than
 * pretending one is the other:
 *
 * - **CPI mode.** Give two Consumer Price Index readings and it converts an
 *   amount between the two dates exactly. This is the arithmetic the Bureau
 *   of Labor Statistics itself does, and it is exact for the dates given.
 * - **Rate mode.** Give an annual rate and a horizon and it compounds. This
 *   is a projection, not a measurement, and the page labels it as one.
 *
 * ## Why the CPI series is an input and not a shipped table
 *
 * The obvious design is to hardcode the CPI-U series and let the user pick
 * two years. That is a hundred-odd transcribed figures, and transcribed
 * constants are a known defect class in this repo — see
 * docs/calculator-suite-status.md §8, where I shipped two published
 * coefficient sets wrong and only caught it by round-tripping. A single
 * mistyped CPI reading produces a wrong answer that no reader could detect,
 * because the whole point of the tool is that they do not know the number.
 *
 * The series is also revised and re-based, so a shipped table goes stale in
 * a way the reader cannot see. Taking the two readings as input makes the
 * tool exact for whatever the reader looks up, and it stays exact forever.
 * The page tells them where to get the numbers.
 *
 * Rounding note: nothing here rounds. Purchasing-power questions are
 * ratios, and rounding an intermediate ratio is how a 40-year conversion
 * drifts by dollars.
 */

export type InflationMode = "cpi" | "rate";

export type InflationInput = {
  mode: InflationMode;
  /** The amount being converted, in USD. */
  amount: number;
  /** CPI at the starting date. CPI mode only. */
  startCpi: number;
  /** CPI at the ending date. CPI mode only. */
  endCpi: number;
  /**
   * Years between the two dates. In CPI mode this is used only to annualise
   * the implied rate; the conversion itself does not need it.
   */
  years: number;
  /** Annual inflation, in percent. Rate mode only. */
  ratePercent: number;
};

export type InflationResult = {
  /** What the amount is worth at the later date, in later-date dollars. */
  equivalentAmount: number;
  /** Total price change across the period, in percent. */
  cumulativeInflationPercent: number;
  /**
   * Annualised inflation. In CPI mode this is DERIVED from the two readings
   * and the span; in rate mode it is the input handed back.
   */
  annualRatePercent: number | null;
  /**
   * What one dollar at the start buys at the end, in start-date dollars.
   * Falls below 1 whenever prices rose.
   */
  purchasingPowerOfOne: number;
  /**
   * Percent of purchasing power LOST. Note this is not the same as the
   * cumulative inflation rate and is always the smaller of the two — a
   * doubling of prices is 100% inflation but only a 50% loss of power.
   */
  purchasingPowerLostPercent: number;
  /**
   * Years for purchasing power to halve at the annualised rate. Null when
   * the rate is zero or negative — deflation never halves it.
   */
  yearsToHalvePower: number | null;
  /** True when prices fell over the period. */
  deflation: boolean;
};

/**
 * Convert.
 *
 * Null on a negative amount, non-positive CPI readings in CPI mode, a
 * non-positive span, or a rate at or below −100%/năm. A zero or negative CPI
 * is rejected rather than guarded around: the index has no zero point, so a
 * reading of 0 means the reader mistyped, and computing a ratio from it
 * would return a plausible-looking figure from bad data.
 */
export function computeUsInflation(
  input: InflationInput,
): InflationResult | null {
  const { mode, amount, startCpi, endCpi, years, ratePercent } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(years) || years <= 0) return null;

  let growth: number;
  let annualRatePercent: number | null;

  if (mode === "cpi") {
    if (!Number.isFinite(startCpi) || !Number.isFinite(endCpi)) return null;
    if (startCpi <= 0 || endCpi <= 0) return null;
    growth = endCpi / startCpi;
    // Annualise the measured change. This is derived, so it is the honest
    // per-year figure for THIS period rather than a forecast.
    annualRatePercent = (Math.pow(growth, 1 / years) - 1) * 100;
  } else {
    if (!Number.isFinite(ratePercent) || ratePercent <= -100) return null;
    growth = Math.pow(1 + ratePercent / 100, years);
    annualRatePercent = ratePercent;
  }

  // Guard the pathological case where a rate mode input drives growth to
  // zero: purchasing power would be infinite and every figure meaningless.
  if (!Number.isFinite(growth) || growth <= 0) return null;

  const equivalentAmount = amount * growth;
  const purchasingPowerOfOne = 1 / growth;

  // Prices doubling is 100% inflation but only a 50% loss of power. Keeping
  // these two as separate outputs is the point: they are routinely
  // conflated, and the loss figure is always the smaller one.
  const purchasingPowerLostPercent = (1 - purchasingPowerOfOne) * 100;

  const rate = annualRatePercent === null ? 0 : annualRatePercent / 100;
  const yearsToHalvePower =
    rate <= 0 ? null : Math.log(2) / Math.log(1 + rate);

  return {
    equivalentAmount,
    cumulativeInflationPercent: (growth - 1) * 100,
    annualRatePercent,
    purchasingPowerOfOne,
    purchasingPowerLostPercent,
    yearsToHalvePower,
    deflation: growth < 1,
  };
}
