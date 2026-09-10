/**
 * Multi-year revenue and cost forecast.
 *
 * Growth compounds, so a forecast is a geometric series and NOT a
 * multiplication. Over a ten-year horizon at 15%/năm the final year's
 * revenue is ×3,518 of the base; adding the growth up linearly gives ×2,35,
 * a third less. The gap widens with the horizon, so a short forecast can
 * hide the error while a long one cannot.
 *
 * The modelling choice that matters most here is that costs are split into a
 * variable part, quoted as a percent of revenue, and a fixed part with its
 * own growth rate. That split is what makes a forecast say anything: with
 * every cost a fixed percent of revenue, the margin is constant by
 * construction and the forecast can only ever repeat year one's margin back
 * at you. Operating leverage — margin widening as revenue outgrows fixed
 * costs — only appears when fixed costs are modelled separately.
 *
 * No `Date` here: the base year is a number the caller supplies, so the same
 * input always renders the same output. See docs/calculator-suite-status.md.
 */

export type ForecastInput = {
  /** Year one revenue, in đồng. */
  baseRevenue: number;
  /** Annual revenue growth, in percent. May be negative — a decline is a forecast too. */
  revenueGrowthPercent: number;
  /** Variable cost as a percent of that year's revenue. */
  variableCostPercent: number;
  /** Year one fixed cost, in đồng. */
  baseFixedCost: number;
  /** Annual fixed-cost growth, in percent. */
  fixedCostGrowthPercent: number;
  /** Years to project, including year one. */
  years: number;
  /** Label for year one, e.g. 2026. Only used to number the rows. */
  baseYear: number;
  /** Corporate income tax, in percent. 20 in Vietnam. */
  taxPercent: number;
};

export type ForecastYear = {
  /** Year label: baseYear, baseYear + 1, … */
  year: number;
  /** 1-based index into the horizon. */
  index: number;
  revenue: number;
  variableCost: number;
  fixedCost: number;
  totalCost: number;
  /** Revenue less both costs, before tax. */
  operatingProfit: number;
  /** Tax, charged only on a profit. A loss carries no tax here. */
  tax: number;
  profitAfterTax: number;
  /** Operating profit as a percent of revenue. Null when revenue is zero. */
  operatingMarginPercent: number | null;
};

export type ForecastResult = {
  years: ForecastYear[];
  /** Sums across the horizon. */
  totalRevenue: number;
  totalCost: number;
  totalOperatingProfit: number;
  totalProfitAfterTax: number;
  /** Final year's figures, the ones a plan is usually quoted by. */
  finalRevenue: number;
  finalOperatingProfit: number;
  finalMarginPercent: number | null;
  /**
   * Margin in the final year minus margin in year one, in percentage points.
   * Positive means operating leverage worked. Null if either is unavailable.
   */
  marginChangePoints: number | null;
  /**
   * Compound annual growth rate of revenue across the horizon, in percent.
   * Equals the input growth rate — it is here as a check that the series
   * really compounded, not as new information.
   */
  revenueCagrPercent: number | null;
  /**
   * First year the forecast turns a profit, as a year label. Null when it
   * never does, and equal to the base year when it starts profitable.
   */
  firstProfitableYear: number | null;
  /** True when at least one year in the horizon loses money. */
  hasLossYear: boolean;
};

/**
 * Project the horizon.
 *
 * Null on inputs that cannot describe a business: a non-positive horizon, a
 * horizon beyond 30 years (compounding a guess for three decades is not a
 * forecast), negative money, a variable-cost share outside 0–100%, growth
 * below −100%/năm, or a tax rate outside 0–100%.
 */
export function computeForecast(input: ForecastInput): ForecastResult | null {
  const {
    baseRevenue,
    revenueGrowthPercent,
    variableCostPercent,
    baseFixedCost,
    fixedCostGrowthPercent,
    years,
    baseYear,
    taxPercent,
  } = input;

  if (!Number.isFinite(years) || years < 1 || years > 30) return null;
  if (!Number.isInteger(years)) return null;
  if (baseRevenue < 0 || baseFixedCost < 0) return null;
  if (variableCostPercent < 0 || variableCostPercent > 100) return null;
  if (taxPercent < 0 || taxPercent > 100) return null;
  // −100%/năm wipes revenue out entirely; below that it would go negative,
  // which is not a decline but a sign error.
  if (revenueGrowthPercent < -100 || fixedCostGrowthPercent < -100) {
    return null;
  }
  if (!Number.isFinite(baseYear) || !Number.isInteger(baseYear)) return null;

  const revenueRate = revenueGrowthPercent / 100;
  const fixedRate = fixedCostGrowthPercent / 100;
  const variableShare = variableCostPercent / 100;
  const taxRate = taxPercent / 100;

  const rows: ForecastYear[] = [];
  for (let index = 1; index <= years; index += 1) {
    // Year one is the base, untouched. Growth applies from year two, so the
    // exponent is index − 1 and a one-year horizon returns exactly the input.
    const revenue = baseRevenue * Math.pow(1 + revenueRate, index - 1);
    const fixedCost = baseFixedCost * Math.pow(1 + fixedRate, index - 1);
    const variableCost = revenue * variableShare;
    const totalCost = variableCost + fixedCost;
    const operatingProfit = revenue - totalCost;
    // Tax follows a profit. A loss-making year pays nothing — it does not
    // generate a refund, and carrying the loss forward is a separate rule
    // this tool deliberately leaves out rather than half-implementing.
    const tax = operatingProfit > 0 ? operatingProfit * taxRate : 0;

    rows.push({
      year: baseYear + index - 1,
      index,
      revenue,
      variableCost,
      fixedCost,
      totalCost,
      operatingProfit,
      tax,
      profitAfterTax: operatingProfit - tax,
      operatingMarginPercent:
        revenue === 0 ? null : (operatingProfit / revenue) * 100,
    });
  }

  const sum = (pick: (row: ForecastYear) => number) =>
    rows.reduce((total, row) => total + pick(row), 0);

  const first = rows[0];
  const last = rows[rows.length - 1];

  const profitable = rows.find((row) => row.operatingProfit > 0);

  return {
    years: rows,
    totalRevenue: sum((row) => row.revenue),
    totalCost: sum((row) => row.totalCost),
    totalOperatingProfit: sum((row) => row.operatingProfit),
    totalProfitAfterTax: sum((row) => row.profitAfterTax),
    finalRevenue: last.revenue,
    finalOperatingProfit: last.operatingProfit,
    finalMarginPercent: last.operatingMarginPercent,
    marginChangePoints:
      last.operatingMarginPercent === null ||
      first.operatingMarginPercent === null
        ? null
        : last.operatingMarginPercent - first.operatingMarginPercent,
    // A single-year horizon has no growth to measure, and a zero base has no
    // rate that gets anywhere from it.
    revenueCagrPercent:
      years < 2 || baseRevenue <= 0 || last.revenue <= 0
        ? null
        : (Math.pow(last.revenue / baseRevenue, 1 / (years - 1)) - 1) * 100,
    firstProfitableYear: profitable === undefined ? null : profitable.year,
    hasLossYear: rows.some((row) => row.operatingProfit < 0),
  };
}
