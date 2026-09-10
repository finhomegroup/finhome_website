/**
 * Financial statement ratios and analysis, for /cong-cu/cac-chi-so-tai-chinh/
 * and /cong-cu/phan-tich-bao-cao-tai-chinh/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `financials.test.ts`.
 *
 * Two pages, one set of inputs, deliberately: both read the same statements,
 * and duplicating the input shape would let the two drift into disagreeing
 * about the same company.
 *
 * `computeRatios` produces the ratio set. `computeAnalysis` produces the
 * things a single year of ratios cannot say — year-on-year growth,
 * common-size percentages, and the DuPont decomposition that says WHY return
 * on equity is what it is.
 *
 * Every ratio that divides by a user figure returns **null** when that figure
 * is zero, rather than Infinity or a large number. A company with no debt has
 * no interest-coverage ratio; the honest output is "not applicable", and a
 * page that printed ∞ would be claiming infinite safety.
 *
 * Two conventions worth knowing:
 *
 * - Turnover and return ratios divide by the CLOSING balance, not an average
 *   of opening and closing. Averages are more correct and need two balance
 *   sheets; with one, the closing figure is the honest choice and the page
 *   says which it used.
 * - `netDebt` subtracts cash from debt, because that is how leverage is
 *   actually assessed. Gross debt is reported beside it.
 */

export type FinancialsInput = {
  /** Income statement, all for the same period, in đồng. */
  revenue: number;
  costOfGoodsSold: number;
  operatingExpenses: number;
  interestExpense: number;
  taxExpense: number;

  /** Balance sheet, at the period end, in đồng. */
  cash: number;
  receivables: number;
  inventory: number;
  otherCurrentAssets: number;
  nonCurrentAssets: number;
  currentLiabilities: number;
  longTermDebt: number;
  otherNonCurrentLiabilities: number;

  /** Per-share figures. Omit to skip the valuation ratios. */
  sharesOutstanding?: number;
  sharePrice?: number;
};

export type RatioSet = {
  /** Derived income statement lines. */
  grossProfit: number;
  operatingProfit: number;
  profitBeforeTax: number;
  netProfit: number;

  /** Derived balance sheet lines. */
  currentAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  totalDebt: number;
  netDebt: number;

  /** Profitability, in percent. Null when revenue or the base is zero. */
  grossMarginPercent: number | null;
  operatingMarginPercent: number | null;
  netMarginPercent: number | null;
  returnOnAssetsPercent: number | null;
  returnOnEquityPercent: number | null;

  /** Liquidity, as multiples. Null when current liabilities are zero. */
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;

  /** Leverage. Null where the denominator is zero. */
  debtToEquity: number | null;
  debtToAssetsPercent: number | null;
  equityMultiplier: number | null;
  interestCoverage: number | null;

  /** Efficiency. */
  assetTurnover: number | null;
  inventoryTurnover: number | null;
  /** Days sales outstanding, days inventory, in days. */
  daysSalesOutstanding: number | null;
  daysInventory: number | null;

  /** Per-share and valuation. Null without the share inputs. */
  earningsPerShare: number | null;
  bookValuePerShare: number | null;
  priceToEarnings: number | null;
  priceToBook: number | null;

  /** True when equity is negative — every equity ratio is then misleading. */
  negativeEquity: boolean;
};

/** Divide, or null when the denominator is zero or the result is not finite. */
function ratio(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : null;
}

/** As `ratio`, scaled to a percentage. */
function percent(numerator: number, denominator: number): number | null {
  const value = ratio(numerator, denominator);
  return value === null ? null : value * 100;
}

/** Every input must be a finite number; most must be non-negative. */
function validate(input: FinancialsInput): boolean {
  const all = [
    input.revenue,
    input.costOfGoodsSold,
    input.operatingExpenses,
    input.interestExpense,
    input.taxExpense,
    input.cash,
    input.receivables,
    input.inventory,
    input.otherCurrentAssets,
    input.nonCurrentAssets,
    input.currentLiabilities,
    input.longTermDebt,
    input.otherNonCurrentLiabilities,
  ];
  if (all.some((value) => !Number.isFinite(value) || value < 0)) return false;
  if (input.sharesOutstanding !== undefined) {
    if (!Number.isFinite(input.sharesOutstanding)) return false;
    if (input.sharesOutstanding < 0) return false;
  }
  if (input.sharePrice !== undefined) {
    if (!Number.isFinite(input.sharePrice) || input.sharePrice < 0) {
      return false;
    }
  }
  return true;
}

/**
 * Compute the ratio set from one period's statements.
 *
 * Null when any input is non-finite or negative where it cannot be — a cost
 * or a balance sheet line below zero is a data-entry error, not a company.
 * Individual ratios come back null when their own denominator is zero.
 */
export function computeRatios(input: FinancialsInput): RatioSet | null {
  if (!validate(input)) return null;

  const {
    revenue,
    costOfGoodsSold,
    operatingExpenses,
    interestExpense,
    taxExpense,
    cash,
    receivables,
    inventory,
    otherCurrentAssets,
    nonCurrentAssets,
    currentLiabilities,
    longTermDebt,
    otherNonCurrentLiabilities,
    sharesOutstanding,
    sharePrice,
  } = input;

  const grossProfit = revenue - costOfGoodsSold;
  const operatingProfit = grossProfit - operatingExpenses;
  const profitBeforeTax = operatingProfit - interestExpense;
  const netProfit = profitBeforeTax - taxExpense;

  const currentAssets =
    cash + receivables + inventory + otherCurrentAssets;
  const totalAssets = currentAssets + nonCurrentAssets;
  const totalLiabilities =
    currentLiabilities + longTermDebt + otherNonCurrentLiabilities;
  const equity = totalAssets - totalLiabilities;
  const totalDebt = longTermDebt + currentLiabilities;
  const netDebt = totalDebt - cash;

  return {
    grossProfit,
    operatingProfit,
    profitBeforeTax,
    netProfit,
    currentAssets,
    totalAssets,
    totalLiabilities,
    equity,
    totalDebt,
    netDebt,

    grossMarginPercent: percent(grossProfit, revenue),
    operatingMarginPercent: percent(operatingProfit, revenue),
    netMarginPercent: percent(netProfit, revenue),
    returnOnAssetsPercent: percent(netProfit, totalAssets),
    returnOnEquityPercent: percent(netProfit, equity),

    currentRatio: ratio(currentAssets, currentLiabilities),
    // Quick ratio drops inventory: it is the least liquid current asset and
    // the one a company in trouble cannot sell at book value.
    quickRatio: ratio(
      cash + receivables + otherCurrentAssets,
      currentLiabilities,
    ),
    cashRatio: ratio(cash, currentLiabilities),

    debtToEquity: ratio(totalDebt, equity),
    debtToAssetsPercent: percent(totalDebt, totalAssets),
    equityMultiplier: ratio(totalAssets, equity),
    // Null with no interest expense: a company with no debt has no coverage
    // ratio, and printing ∞ would claim infinite safety.
    interestCoverage: ratio(operatingProfit, interestExpense),

    assetTurnover: ratio(revenue, totalAssets),
    inventoryTurnover: ratio(costOfGoodsSold, inventory),
    daysSalesOutstanding: ratio(receivables * 365, revenue),
    daysInventory: ratio(inventory * 365, costOfGoodsSold),

    earningsPerShare:
      sharesOutstanding === undefined
        ? null
        : ratio(netProfit, sharesOutstanding),
    bookValuePerShare:
      sharesOutstanding === undefined
        ? null
        : ratio(equity, sharesOutstanding),
    priceToEarnings:
      sharesOutstanding === undefined || sharePrice === undefined
        ? null
        : ratio(sharePrice * sharesOutstanding, netProfit),
    priceToBook:
      sharesOutstanding === undefined || sharePrice === undefined
        ? null
        : ratio(sharePrice * sharesOutstanding, equity),

    negativeEquity: equity < 0,
  };
}

export type CommonSizeLine = {
  /** Stable key the page maps to a Vietnamese label. */
  key: string;
  /** This period's amount. */
  current: number;
  /** Last period's amount. */
  prior: number;
  /** Change in đồng. */
  change: number;
  /** Change as a percent of the prior figure. Null when that was zero. */
  changePercent: number | null;
  /** This period as a percent of revenue. */
  currentOfRevenuePercent: number | null;
  /** Last period as a percent of ITS revenue. */
  priorOfRevenuePercent: number | null;
};

export type DuPont = {
  /** Net profit ÷ revenue. */
  netMargin: number | null;
  /** Revenue ÷ total assets. */
  assetTurnover: number | null;
  /** Total assets ÷ equity. */
  equityMultiplier: number | null;
  /** The three multiplied — must reproduce return on equity. */
  returnOnEquityPercent: number | null;
};

export type AnalysisResult = {
  current: RatioSet;
  prior: RatioSet;
  /** Revenue and the profit lines, horizontally and vertically. */
  lines: CommonSizeLine[];
  /** DuPont for each period, so the change can be attributed. */
  currentDuPont: DuPont;
  priorDuPont: DuPont;
  /** Percentage-point change in return on equity. */
  returnOnEquityChangePoints: number | null;
};

/**
 * DuPont decomposition: ROE = margin × turnover × leverage.
 *
 * Revenue is passed separately rather than kept on `RatioSet`, because it is
 * an INPUT line and the set holds derived figures. Bolting it on would make
 * the set lie about what it is.
 */
function duPont(set: RatioSet, revenue: number): DuPont {
  const netMargin = ratio(set.netProfit, revenue);
  const assetTurnover = set.assetTurnover;
  const equityMultiplier = set.equityMultiplier;
  const product =
    netMargin === null || assetTurnover === null || equityMultiplier === null
      ? null
      : netMargin * assetTurnover * equityMultiplier * 100;
  return {
    netMargin,
    assetTurnover,
    equityMultiplier,
    returnOnEquityPercent: product,
  };
}

/**
 * Compare two periods.
 *
 * Null when either period's statements are rejected by `computeRatios`.
 *
 * The DuPont product is asserted against `returnOnEquityPercent` in the
 * tests: the two are computed by different routes and must agree, which is
 * what makes the decomposition trustworthy as an attribution.
 */
export function computeAnalysis(input: {
  current: FinancialsInput;
  prior: FinancialsInput;
}): AnalysisResult | null {
  const current = computeRatios(input.current);
  const prior = computeRatios(input.prior);
  if (current === null || prior === null) return null;

  const pairs: [string, number, number][] = [
    ["revenue", input.current.revenue, input.prior.revenue],
    [
      "costOfGoodsSold",
      input.current.costOfGoodsSold,
      input.prior.costOfGoodsSold,
    ],
    ["grossProfit", current.grossProfit, prior.grossProfit],
    [
      "operatingExpenses",
      input.current.operatingExpenses,
      input.prior.operatingExpenses,
    ],
    ["operatingProfit", current.operatingProfit, prior.operatingProfit],
    [
      "interestExpense",
      input.current.interestExpense,
      input.prior.interestExpense,
    ],
    ["profitBeforeTax", current.profitBeforeTax, prior.profitBeforeTax],
    ["taxExpense", input.current.taxExpense, input.prior.taxExpense],
    ["netProfit", current.netProfit, prior.netProfit],
    ["totalAssets", current.totalAssets, prior.totalAssets],
    ["equity", current.equity, prior.equity],
    ["totalDebt", current.totalDebt, prior.totalDebt],
  ];

  const lines: CommonSizeLine[] = pairs.map(([key, now, before]) => ({
    key,
    current: now,
    prior: before,
    change: now - before,
    changePercent: percent(now - before, Math.abs(before)),
    currentOfRevenuePercent: percent(now, input.current.revenue),
    priorOfRevenuePercent: percent(before, input.prior.revenue),
  }));

  const currentDuPont = duPont(current, input.current.revenue);
  const priorDuPont = duPont(prior, input.prior.revenue);

  return {
    current,
    prior,
    lines,
    currentDuPont,
    priorDuPont,
    returnOnEquityChangePoints:
      current.returnOnEquityPercent === null ||
      prior.returnOnEquityPercent === null
        ? null
        : current.returnOnEquityPercent - prior.returnOnEquityPercent,
  };
}
