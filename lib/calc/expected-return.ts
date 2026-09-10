/**
 * Probability-weighted expected return, for /cong-cu/loi-nhuan-ky-vong/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `expected-return.test.ts`.
 *
 * The expected return is the easy half — a weighted average. The half that
 * matters is the SPREAD around it, and this module returns three measures of
 * it because they answer different questions:
 *
 * - `standardDeviationPercent` — the usual measure of risk, in the same units
 *   as the return, so it can be read alongside it.
 * - `coefficientOfVariation` — risk per unit of return. This is the figure
 *   that compares two investments with different expected returns, and it is
 *   the one people skip. A 20% expected return with 30% deviation is riskier
 *   per đồng than a 10% return with 12%.
 * - `downsideRiskPercent` — semi-deviation, counting only outcomes BELOW the
 *   expectation. Standard deviation punishes upside surprises equally, which
 *   is not how anyone actually feels about them.
 *
 * Probabilities are in PERCENT and must sum to 100, within a small tolerance
 * for typing. A set that does not sum to 100 is rejected rather than
 * normalised: normalising silently changes the question from the one the user
 * asked, and the near-miss is usually a missing scenario rather than a
 * rounding issue.
 *
 * Population statistics, not sample — these are probabilities over a known
 * distribution, so there is no `n − 1` correction to make.
 */

/** How far the probabilities may sum from 100 and still be accepted. */
const PROBABILITY_TOLERANCE = 0.01;

export type ReturnScenario = {
  /** Chance of this outcome, in percent. */
  probabilityPercent: number;
  /** Return if it happens, in percent. May be negative. */
  returnPercent: number;
};

export type ExpectedReturnResult = {
  /** Probability-weighted mean return, in percent. */
  expectedReturnPercent: number;
  /** Variance, in percent SQUARED — kept for anyone who wants it. */
  variance: number;
  /** Square root of the variance, in percent. */
  standardDeviationPercent: number;
  /**
   * Standard deviation divided by expected return. Null when the expected
   * return is zero or negative, where the ratio is meaningless rather than
   * merely large.
   */
  coefficientOfVariation: number | null;
  /** Semi-deviation: spread of the outcomes below the expectation. */
  downsideRiskPercent: number;
  /** Total probability of an outcome below zero, in percent. */
  probabilityOfLossPercent: number;
  /** Best and worst outcomes in the set, in percent. */
  bestCasePercent: number;
  worstCasePercent: number;
};

/**
 * Compute the expected return and the spread around it.
 *
 * Null when the inputs cannot describe a distribution: no scenarios, a
 * negative probability, probabilities that do not sum to 100, or any
 * non-finite number.
 */
export function computeExpectedReturn(
  scenarios: readonly ReturnScenario[],
): ExpectedReturnResult | null {
  if (scenarios.length === 0) return null;

  for (const scenario of scenarios) {
    if (!Number.isFinite(scenario.probabilityPercent)) return null;
    if (!Number.isFinite(scenario.returnPercent)) return null;
    if (scenario.probabilityPercent < 0) return null;
  }

  const totalProbability = scenarios.reduce(
    (sum, scenario) => sum + scenario.probabilityPercent,
    0,
  );
  // Rejected, not normalised: a set summing to 90 is usually a missing
  // scenario, and rescaling would answer a question nobody asked.
  if (Math.abs(totalProbability - 100) > PROBABILITY_TOLERANCE) return null;

  const expectedReturnPercent = scenarios.reduce(
    (sum, scenario) =>
      sum + (scenario.probabilityPercent / 100) * scenario.returnPercent,
    0,
  );

  let variance = 0;
  let downsideVariance = 0;
  let probabilityOfLossPercent = 0;

  for (const scenario of scenarios) {
    const weight = scenario.probabilityPercent / 100;
    const deviation = scenario.returnPercent - expectedReturnPercent;
    variance += weight * deviation * deviation;
    // Semi-deviation counts only the outcomes that disappoint.
    if (deviation < 0) downsideVariance += weight * deviation * deviation;
    if (scenario.returnPercent < 0) {
      probabilityOfLossPercent += scenario.probabilityPercent;
    }
  }

  const returns = scenarios.map((scenario) => scenario.returnPercent);
  const standardDeviationPercent = Math.sqrt(variance);

  return {
    expectedReturnPercent,
    variance,
    standardDeviationPercent,
    coefficientOfVariation:
      expectedReturnPercent > 0
        ? standardDeviationPercent / expectedReturnPercent
        : null,
    downsideRiskPercent: Math.sqrt(downsideVariance),
    probabilityOfLossPercent,
    bestCasePercent: Math.max(...returns),
    worstCasePercent: Math.min(...returns),
  };
}
