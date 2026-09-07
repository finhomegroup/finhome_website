/**
 * Stock trade return after Vietnamese fees and taxes, for
 * /cong-cu/loi-nhuan-co-phieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `stock-return.test.ts`.
 *
 * A generic gain/loss calculator gets Vietnamese equity wrong in one
 * important way, and this module exists for it: personal income tax on
 * transferring securities is **0,1% of the SALE VALUE**, not of the profit.
 * It is charged whether the trade made money or lost it. So a position that
 * falls still owes tax, and the loss is bigger than the price move suggests.
 *
 * The other two charges behave normally: brokerage commission is a percent of
 * each transaction, charged on the way in and again on the way out; cash
 * dividends carry 5% PIT, usually withheld at source.
 *
 * All three are inputs with Vietnamese defaults rather than constants — rates
 * change, brokers compete on commission, and a static page should not pretend
 * to know today's schedule.
 *
 * `breakEvenPricePerShare` is the figure this arithmetic is really for: the
 * price the shares must reach for the trade to come out level once every fee
 * and tax is counted. It is above the purchase price even before any profit,
 * and it has a closed form, so it is exact rather than searched.
 */

export type StockReturnInput = {
  /** Number of shares. */
  shares: number;
  /** Price paid per share, in đồng. */
  buyPricePerShare: number;
  /** Price received per share, in đồng. */
  sellPricePerShare: number;
  /** Brokerage commission as a percent of transaction value, EACH way. */
  brokerageFeePercent?: number;
  /** Total cash dividend per share across the whole holding period. */
  dividendPerShare?: number;
  /** PIT on cash dividends, in percent. Vietnam: 5. */
  dividendTaxPercent?: number;
  /** PIT on transfer, as a percent of SALE value. Vietnam: 0,1. */
  transferTaxPercent?: number;
  /** Holding period in years, for the annualised figure. */
  years?: number;
};

export type StockReturnResult = {
  /** `shares × buy price`, before commission. */
  grossCost: number;
  /** Commission on the purchase. */
  buyFee: number;
  /** What the position really cost: gross plus commission. */
  totalCost: number;

  /** `shares × sell price`, before anything is deducted. */
  grossProceeds: number;
  /** Commission on the sale. */
  sellFee: number;
  /** Transfer tax — charged on the SALE VALUE, profit or loss. */
  transferTax: number;
  /** Proceeds after commission and transfer tax. */
  netProceeds: number;

  /** Dividends before tax. */
  grossDividends: number;
  /** Tax withheld on the dividends. */
  dividendTax: number;
  /** Dividends in hand. */
  netDividends: number;

  /** `netProceeds + netDividends − totalCost`. */
  netProfit: number;
  /** Net profit as a percent of what the position cost. */
  returnPercent: number;
  /** The same, ignoring every fee and tax — for contrast. */
  grossReturnPercent: number;
  /** Percentage points of return lost to fees and taxes. */
  dragPoints: number;

  /** Commission on both sides. */
  totalFees: number;
  /** Transfer tax plus dividend tax. */
  totalTaxes: number;

  /** Compound annual rate. Null with no holding period, or on a total loss. */
  annualisedPercent: number | null;

  /**
   * True when the trade lost money and transfer tax was still charged — the
   * case the page exists to make visible.
   */
  taxedOnALoss: boolean;

  /**
   * Sale price per share at which the trade breaks even after every fee and
   * tax, dividends included. Null when the deductions reach 100% of the sale,
   * where no finite price clears the costs.
   */
  breakEvenPricePerShare: number | null;
};

/**
 * Compute a stock trade's return.
 *
 * Null when the inputs cannot describe a trade: a non-positive share count or
 * purchase price, a negative sale price, dividend or rate, a fee or tax rate
 * at or above 100%, a negative holding period, or any non-finite number.
 */
export function computeStockReturn(
  input: StockReturnInput,
): StockReturnResult | null {
  const {
    shares,
    buyPricePerShare,
    sellPricePerShare,
    brokerageFeePercent = 0.15,
    dividendPerShare = 0,
    dividendTaxPercent = 5,
    transferTaxPercent = 0.1,
    years = 0,
  } = input;

  const numbers = [
    shares,
    buyPricePerShare,
    sellPricePerShare,
    brokerageFeePercent,
    dividendPerShare,
    dividendTaxPercent,
    transferTaxPercent,
    years,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (shares <= 0 || buyPricePerShare <= 0) return null;
  if (brokerageFeePercent >= 100) return null;
  if (dividendTaxPercent >= 100 || transferTaxPercent >= 100) return null;

  const feeRate = brokerageFeePercent / 100;
  const transferRate = transferTaxPercent / 100;

  const grossCost = shares * buyPricePerShare;
  const buyFee = grossCost * feeRate;
  const totalCost = grossCost + buyFee;

  const grossProceeds = shares * sellPricePerShare;
  const sellFee = grossProceeds * feeRate;
  // Charged on the sale value regardless of outcome. This is the whole point.
  const transferTax = grossProceeds * transferRate;
  const netProceeds = grossProceeds - sellFee - transferTax;

  const grossDividends = shares * dividendPerShare;
  const dividendTax = grossDividends * (dividendTaxPercent / 100);
  const netDividends = grossDividends - dividendTax;

  const netProfit = netProceeds + netDividends - totalCost;
  const returnPercent = (netProfit / totalCost) * 100;

  // What the trade would have returned with no friction at all.
  const grossReturnPercent =
    ((grossProceeds + grossDividends - grossCost) / grossCost) * 100;

  const totalFees = buyFee + sellFee;
  const totalTaxes = transferTax + dividendTax;

  const totalReceived = netProceeds + netDividends;
  const annualisedPercent =
    years > 0 && totalReceived > 0
      ? ((totalReceived / totalCost) ** (1 / years) - 1) * 100
      : null;

  // Solve netProfit = 0 for the sale price. Every deduction on the sale side
  // scales with it, so this is one division rather than a search.
  const saleRetention = 1 - feeRate - transferRate;
  const breakEvenPricePerShare =
    saleRetention > 0
      ? (totalCost - netDividends) / (shares * saleRetention)
      : null;

  return {
    grossCost,
    buyFee,
    totalCost,
    grossProceeds,
    sellFee,
    transferTax,
    netProceeds,
    grossDividends,
    dividendTax,
    netDividends,
    netProfit,
    returnPercent,
    grossReturnPercent,
    dragPoints: grossReturnPercent - returnPercent,
    totalFees,
    totalTaxes,
    annualisedPercent,
    taxedOnALoss: netProfit < 0 && transferTax > 0,
    breakEvenPricePerShare,
  };
}
