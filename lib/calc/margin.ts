/**
 * Margin and markup for /cong-cu/margin-va-markup/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `margin.test.ts`.
 *
 * The same profit, divided by two different denominators:
 *
 *   margin = profit ÷ SELLING PRICE
 *   markup = profit ÷ COST
 *
 * Margin is therefore always the smaller of the two, and a 50% markup is a
 * 33,33% margin. Confusing them is the classic small-business pricing error:
 * a shop that wants a 40% margin and marks cost up by 40% ends up on a 28,6%
 * margin and cannot work out where the money went. That is the whole reason
 * this tool exists, and why every mode returns BOTH figures.
 *
 * Margin is capped below 100%: a 100% margin means the goods were free, and
 * above it the implied selling price is negative. Markup has no ceiling.
 */

export type MarginMode =
  /** Cost and selling price known; derive both ratios. */
  | "price"
  /** Cost and target margin known; derive the price. */
  | "margin"
  /** Cost and target markup known; derive the price. */
  | "markup";

export type MarginInput = {
  mode: MarginMode;
  /** What the goods cost you, in đồng. */
  cost: number;
  /**
   * The second figure: the selling price in `price` mode, a percentage in
   * `margin` and `markup` modes.
   */
  value: number;
};

export type MarginResult = {
  cost: number;
  /** Selling price. */
  price: number;
  /** `price − cost`. Negative when selling below cost. */
  profit: number;
  /** Profit as a percent of the selling price. */
  marginPercent: number;
  /** Profit as a percent of the cost. */
  markupPercent: number;
};

/**
 * Compute the margin/markup/price triangle from any two of its corners.
 *
 * Null when the inputs cannot describe a sale: a cost of zero or less (both
 * ratios divide by it, or by a price derived from it), a target margin at or
 * above 100%, a price of zero in `price` mode, or any non-finite number.
 *
 * A negative price or a negative target percentage is allowed: selling below
 * cost is a real situation, and a tool that refused to show it would be
 * hiding the answer a user most needs.
 */
export function computeMargin(input: MarginInput): MarginResult | null {
  const { mode, cost, value } = input;

  if (!Number.isFinite(cost) || !Number.isFinite(value)) return null;
  if (cost <= 0) return null;

  let price: number;
  switch (mode) {
    case "price":
      // Margin divides by the price, so a free sale has no margin.
      if (value === 0) return null;
      price = value;
      break;
    case "margin":
      // price = cost / (1 − margin). At margin = 100% the cost is zero; above
      // it the price turns negative, which is not a price.
      if (value >= 100) return null;
      price = cost / (1 - value / 100);
      break;
    case "markup":
      price = cost * (1 + value / 100);
      if (price === 0) return null;
      break;
  }

  const profit = price - cost;

  return {
    cost,
    price,
    profit,
    marginPercent: (profit / price) * 100,
    markupPercent: (profit / cost) * 100,
  };
}
