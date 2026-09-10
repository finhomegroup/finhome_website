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
 * and tax is counted. It has a closed form —
 * `(totalCost − netDividends) ÷ (shares × (1 − feeRate − transferRate))` — so
 * it is exact rather than searched. Whether it lands above or below the
 * PURCHASE price depends entirely on the dividends, and both sides happen:
 *
 * - With no dividends it is never below the purchase price, and strictly above
 *   it whenever the commission or the transfer tax is non-zero: a 30.000 ₫
 *   share on the Vietnamese defaults must reach 30.120,30 ₫. Only with both of
 *   those at zero does it equal the purchase price (the dividend tax rate does
 *   not enter here — there are no dividends to tax).
 * - Cash dividends already banked cut what the sale still has to recover, so
 *   they pull it DOWN — below the purchase price once `netDividends` passes
 *   `grossCost × (2 × feeRate + transferRate)`, i.e. 126,32 ₫/share of gross
 *   dividend at the defaults. At the page's own shipped default of 1.500 ₫/cp
 *   it is 28.691,73 ₫, well under the 30.000 ₫ buy; the page has an FAQ item
 *   for that ("Vì sao giá hòa vốn lại thấp hơn giá mua?").
 * - Beyond that again it is clamped to 0 — see `alreadyBreakEven`.
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
   * where no finite price clears the costs. Zero when the dividends already
   * cover the whole position — see `alreadyBreakEven`.
   */
  breakEvenPricePerShare: number | null;

  /**
   * True when the dividends already received exceed the whole cost of the
   * position, so the trade is level even if the shares go to zero. The
   * closed form's root is then negative — not a price — and
   * `breakEvenPricePerShare` is 0: the lowest price that still breaks even.
   */
  alreadyBreakEven: boolean;
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
  const breakEvenRoot =
    saleRetention > 0
      ? (totalCost - netDividends) / (shares * saleRetention)
      : null;
  // The root goes negative once net dividends exceed the total cost, i.e. once
  // dividendPerShare > buyPricePerShare × (1 + feeRate)/(1 − divTaxRate)
  // — 1,0542 × the buy price at the Vietnamese defaults. A negative
  // đồng-per-share price is not a price, and it is outside this module's own
  // input domain (feeding it back in as sellPricePerShare returns null), so
  // clamp to the lowest price that DOES break even: zero. `< 0` needs no
  // tolerance band because 0 is a valid in-domain answer either way — at
  // exactly 0 both branches return the same number.
  const alreadyBreakEven = breakEvenRoot !== null && breakEvenRoot < 0;
  const breakEvenPricePerShare = alreadyBreakEven ? 0 : breakEvenRoot;

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
    alreadyBreakEven,
  };
}
