/**
 * Asset allocation: a target mix, the drift from it, and the trades back.
 *
 * ## Why the risk figure is not an average
 *
 * The expected return of a portfolio IS the weighted average of its parts.
 * Its risk is not, and that difference is the whole reason to hold more
 * than one asset class. Standard deviations do not add:
 *
 *     sigma_p^2 = sum_i sum_j w_i w_j sigma_i sigma_j rho_ij
 *
 * so unless every correlation is exactly 1, the portfolio's standard
 * deviation is strictly BELOW the weighted average of the individual ones.
 * The module reports both figures and the gap between them, because a page
 * that averaged the standard deviations would overstate the risk of every
 * mix it showed and make diversification look like it does nothing.
 *
 * The equity-bond correlation is an INPUT, not a constant, and that is a
 * deliberate refusal to pretend. It has been reliably negative in some
 * decades and firmly positive in others — including 2022, when both fell
 * together and the diversification a 60/40 portfolio was supposed to
 * provide did not arrive. A tool that hard-coded a comfortable figure would
 * be hiding the single assumption its risk number depends on most.
 *
 * ## The target rule, and what it is worth
 *
 * "Equity percent = a base minus your age" is a rule of thumb, not a
 * result. It has no theoretical standing; what it does have is the right
 * shape — less equity as the horizon shortens — and the virtue of being
 * followable. The three bases here (100, 110, 120) are the conventional
 * conservative, moderate and aggressive readings, and the page says plainly
 * that they are conventions.
 *
 * ## Rebalancing
 *
 * Drift is reported in PERCENTAGE POINTS, not as a relative change: a
 * holding that should be 25% and is 30% has drifted 5 points, which is what
 * every rebalancing band is written in terms of. Reporting it as "20% too
 * much" would not be comparable across classes with different weights.
 */

export const ASSET_CLASSES = ["equity", "bond", "cash"] as const;
export type AssetClass = (typeof ASSET_CLASSES)[number];

export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export type AllocationRule = {
  /** Equity target is this minus the holder's age. */
  equityBase: number;
  /** Cash sleeve held regardless of age, in percent. */
  cashPercent: number;
};

/**
 * The three conventional readings of the age rule.
 *
 * Conventions, not findings — see the module docstring. They are exported so
 * the page can quote them rather than restate them.
 */
export const ALLOCATION_RULES: Record<RiskTolerance, AllocationRule> = {
  conservative: { equityBase: 100, cashPercent: 10 },
  moderate: { equityBase: 110, cashPercent: 5 },
  aggressive: { equityBase: 120, cashPercent: 0 },
};

/**
 * Drift beyond which rebalancing is conventionally considered due, in
 * percentage points. Five points is the usual band; it is a convention and
 * the module reports the drift itself so a reader can apply their own.
 */
export const REBALANCE_BAND_POINTS = 5;

/**
 * Standard deviation of cash, in percent a year.
 *
 * Held as a constant rather than asked for, because it is small enough that
 * no plausible value changes the answer: at a 10% cash weight, moving it
 * from 0% to 2% moves a 60/35/5 portfolio's standard deviation by under a
 * hundredth of a point. Everything else on this page is an input.
 */
export const CASH_SIGMA_PERCENT = 1;

export type AssetAllocationInput = {
  age: number;
  riskTolerance: RiskTolerance;
  /** Current holdings by class, in the account's currency. */
  holdings: Record<AssetClass, number>;
  /** Expected annual return by class, in percent. */
  returns: Record<AssetClass, number>;
  /** Annual standard deviation of equity and bonds, in percent. */
  equitySigmaPercent: number;
  bondSigmaPercent: number;
  /** Correlation between equity and bonds, from −1 to 1. */
  equityBondCorrelation: number;
};

export type MixStatistics = {
  /** Weights in percent, summing to 100. */
  weights: Record<AssetClass, number>;
  /** Weighted average of the class returns. */
  expectedReturnPercent: number;
  /** The real thing: sqrt of the weighted covariance sum. */
  standardDeviationPercent: number;
  /**
   * What the standard deviation would be if risks simply averaged — i.e.
   * if every correlation were 1. Always at or above the figure above.
   */
  weightedAverageSigmaPercent: number;
  /** The gap: what diversification is worth, in points of risk. */
  diversificationBenefitPoints: number;
  /** Expected return per unit of risk. Null at zero risk. */
  returnPerRiskUnit: number | null;
};

export type AssetAllocationResult = {
  rule: AllocationRule;
  totalValue: number;
  /** Target weights in percent, summing to 100. */
  target: Record<AssetClass, number>;
  /** Current weights in percent. Null per class when there is nothing held. */
  currentWeights: Record<AssetClass, number> | null;
  /** Current minus target, in PERCENTAGE POINTS. Positive means overweight. */
  driftPoints: Record<AssetClass, number> | null;
  /** Largest absolute drift, in points. */
  maxDriftPoints: number | null;
  rebalanceDue: boolean;
  /** Amount to buy (positive) or sell (negative) per class. */
  trades: Record<AssetClass, number> | null;
  /** Statistics of the target mix and of what is actually held. */
  targetStats: MixStatistics;
  currentStats: MixStatistics | null;
};

function zeroByClass(): Record<AssetClass, number> {
  return { equity: 0, bond: 0, cash: 0 };
}

/**
 * Target weights for an age and a risk tolerance.
 *
 * The equity share is clamped into what is left after the cash sleeve, so
 * the three always sum to exactly 100 — including for a 20-year-old, whose
 * "120 minus age" would otherwise be 100 with no room for the sleeve, and
 * for a 105-year-old, whose would be negative.
 */
export function targetAllocation(
  age: number,
  riskTolerance: RiskTolerance,
): Record<AssetClass, number> | null {
  const rule = ALLOCATION_RULES[riskTolerance];
  if (rule === undefined) return null;
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;

  const room = 100 - rule.cashPercent;
  const equity = Math.min(Math.max(rule.equityBase - age, 0), room);
  return { equity, bond: room - equity, cash: rule.cashPercent };
}

/**
 * Expected return and standard deviation of a mix.
 *
 * `weights` are percentages and must sum to 100; the caller has already
 * normalised them. Correlations with cash are taken as zero — cash is a
 * bank balance, not a traded asset, and its standard deviation is small
 * enough that the assumption cannot move the answer.
 */
export function mixStatistics(input: {
  weights: Record<AssetClass, number>;
  returns: Record<AssetClass, number>;
  equitySigmaPercent: number;
  bondSigmaPercent: number;
  equityBondCorrelation: number;
}): MixStatistics | null {
  const {
    weights,
    returns,
    equitySigmaPercent,
    bondSigmaPercent,
    equityBondCorrelation,
  } = input;

  for (const key of ASSET_CLASSES) {
    if (!Number.isFinite(weights[key]) || weights[key] < 0) return null;
    if (!Number.isFinite(returns[key])) return null;
  }
  if (!Number.isFinite(equitySigmaPercent) || equitySigmaPercent < 0) return null;
  if (!Number.isFinite(bondSigmaPercent) || bondSigmaPercent < 0) return null;
  if (
    !Number.isFinite(equityBondCorrelation) ||
    equityBondCorrelation < -1 ||
    equityBondCorrelation > 1
  ) {
    return null;
  }

  const w = {
    equity: weights.equity / 100,
    bond: weights.bond / 100,
    cash: weights.cash / 100,
  };
  const sigma = {
    equity: equitySigmaPercent,
    bond: bondSigmaPercent,
    cash: CASH_SIGMA_PERCENT,
  };

  const expectedReturnPercent =
    w.equity * returns.equity + w.bond * returns.bond + w.cash * returns.cash;

  // The full covariance sum. Only the equity-bond pair has a non-zero
  // correlation; the cross terms with cash vanish rather than being
  // silently dropped, which is why they are written out.
  const variance =
    Math.pow(w.equity * sigma.equity, 2) +
    Math.pow(w.bond * sigma.bond, 2) +
    Math.pow(w.cash * sigma.cash, 2) +
    2 * w.equity * w.bond * sigma.equity * sigma.bond * equityBondCorrelation;
  // A negative correlation can drive the sum below zero only through float
  // residue at a genuine zero, never mathematically — the quadratic form is
  // positive semi-definite for any correlation in [-1, 1].
  const standardDeviationPercent = Math.sqrt(Math.max(0, variance));

  const weightedAverageSigmaPercent =
    w.equity * sigma.equity + w.bond * sigma.bond + w.cash * sigma.cash;

  return {
    weights,
    expectedReturnPercent,
    standardDeviationPercent,
    weightedAverageSigmaPercent,
    diversificationBenefitPoints:
      weightedAverageSigmaPercent - standardDeviationPercent,
    returnPerRiskUnit:
      standardDeviationPercent <= 0
        ? null
        : expectedReturnPercent / standardDeviationPercent,
  };
}

/**
 * Compare a portfolio with its target.
 *
 * Null on an age outside 0–120, a negative holding, an unknown risk
 * tolerance, a negative standard deviation, or a correlation outside −1–1.
 *
 * An EMPTY portfolio is not an error: the target and its statistics are
 * still meaningful, and everything that needs a current weight comes back
 * null rather than as a zero that a page would render as "0% equity, sell
 * nothing" — which is not the same statement as "there is nothing here".
 */
export function analyseAllocation(
  input: AssetAllocationInput,
): AssetAllocationResult | null {
  const {
    age,
    riskTolerance,
    holdings,
    returns,
    equitySigmaPercent,
    bondSigmaPercent,
    equityBondCorrelation,
  } = input;

  const target = targetAllocation(age, riskTolerance);
  if (target === null) return null;

  for (const key of ASSET_CLASSES) {
    if (!Number.isFinite(holdings[key]) || holdings[key] < 0) return null;
  }

  const targetStats = mixStatistics({
    weights: target,
    returns,
    equitySigmaPercent,
    bondSigmaPercent,
    equityBondCorrelation,
  });
  if (targetStats === null) return null;

  const totalValue = ASSET_CLASSES.reduce((sum, key) => sum + holdings[key], 0);

  if (totalValue <= 0) {
    return {
      rule: ALLOCATION_RULES[riskTolerance],
      totalValue: 0,
      target,
      currentWeights: null,
      driftPoints: null,
      maxDriftPoints: null,
      rebalanceDue: false,
      trades: null,
      targetStats,
      currentStats: null,
    };
  }

  const currentWeights = zeroByClass();
  const driftPoints = zeroByClass();
  const trades = zeroByClass();
  for (const key of ASSET_CLASSES) {
    currentWeights[key] = (holdings[key] / totalValue) * 100;
    driftPoints[key] = currentWeights[key] - target[key];
    // The trade is to the TARGET share of the current total: rebalancing
    // moves money between classes and does not add any.
    trades[key] = (target[key] / 100) * totalValue - holdings[key];
  }

  const maxDriftPoints = Math.max(
    ...ASSET_CLASSES.map((key) => Math.abs(driftPoints[key])),
  );

  return {
    rule: ALLOCATION_RULES[riskTolerance],
    totalValue,
    target,
    currentWeights,
    driftPoints,
    maxDriftPoints,
    rebalanceDue: maxDriftPoints > REBALANCE_BAND_POINTS,
    trades,
    targetStats,
    currentStats: mixStatistics({
      weights: currentWeights,
      returns,
      equitySigmaPercent,
      bondSigmaPercent,
      equityBondCorrelation,
    }),
  };
}
