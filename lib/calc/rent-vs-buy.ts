/**
 * Renting against buying for /cong-cu/thue-hay-mua/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `rent-vs-buy.test.ts`.
 *
 * The comparison most people make — "rent is 15 triệu, the mortgage is
 * 18 triệu, so buying costs 3 triệu more" — is wrong in both directions at
 * once, and this module exists to fix three things it gets wrong:
 *
 * 1. **Part of a mortgage payment is not a cost.** The principal portion
 *    buys equity. Only interest, tax, fees and maintenance are money gone.
 * 2. **The renter's deposit is not idle.** Money not spent on a deposit and
 *    purchase costs is invested, and its growth is a real benefit of renting.
 *    Ignoring it is the single biggest error in favour of buying.
 * 3. **Buying has an exit cost.** Selling means agent fees and transfer tax,
 *    and they are paid on the grown price, not the purchase price.
 *
 * So each side is reduced to a NET POSITION at the horizon — what you are
 * worth at the end, given identical starting wealth — and the difference
 * between the two positions is the answer. Everything is simulated month by
 * month rather than annualised, because rent rises, the balance falls and
 * the interest share of the payment moves, all on different schedules.
 *
 * A deliberate simplification, stated on the page: the module does NOT
 * assume the buyer invests the difference when the mortgage payment is lower
 * than rent. Modelling that requires assuming a discipline most people do
 * not have, and it would quietly tilt the result toward buying.
 */

import { amortize, pmt } from "@/lib/calc/finance";

export type RentVsBuyInput = {
  /** Purchase price, in đồng. */
  price: number;
  /** Cash deposit. */
  downPayment: number;
  /** One-off costs to buy: transfer tax, notary, agent, furnishing. */
  purchaseCosts?: number;
  /** Nominal annual rate on the loan, in percent. */
  annualRatePercent: number;
  /** Loan term in months. */
  termMonths: number;
  /** Recurring ownership costs per month: management, maintenance, insurance. */
  monthlyOwnerCosts?: number;
  /** Expected house price growth, in percent per year. */
  priceGrowthPercent?: number;
  /** Costs to sell, as a percent of the sale price. */
  sellingCostPercent?: number;
  /** Rent per month at the start, in đồng. */
  monthlyRent: number;
  /** Expected rent growth, in percent per year. */
  rentGrowthPercent?: number;
  /** Deposit held by the landlord, returned at the end. */
  rentDeposit?: number;
  /** Return the renter earns on invested cash, in percent per year. */
  investmentReturnPercent?: number;
  /** How long the comparison runs, in months. */
  horizonMonths: number;
};

export type RentVsBuySide = {
  /** Everything paid out over the horizon. */
  totalPaid: number;
  /** What you are worth at the horizon, after any exit costs. */
  netWorth: number;
  /**
   * The comparable figure: money spent, less what you have to show for it.
   * Lower is better. Both sides start from identical wealth, so this is a
   * fair like-for-like cost.
   */
  netCost: number;
};

export type RentVsBuyResult = {
  /** Loan drawn: price less deposit. */
  loanAmount: number;
  /** The buyer's monthly principal-and-interest instalment. */
  monthlyPayment: number;
  /** Cash the buyer commits at the start: deposit plus purchase costs. */
  buyerUpfront: number;
  /** House price at the horizon, after growth. */
  houseValue: number;
  /** Loan balance still owed at the horizon. */
  loanBalance: number;
  /** Interest paid over the horizon. */
  totalInterest: number;
  /** Principal repaid over the horizon. */
  totalPrincipal: number;
  /** Ownership costs paid over the horizon. */
  totalOwnerCosts: number;
  /** Cost of selling at the horizon. */
  sellingCost: number;
  /** Rent paid over the horizon, with growth applied yearly. */
  totalRent: number;
  /** What the renter's invested cash grows to. */
  investmentValue: number;
  /** Growth on that cash: `investmentValue − buyerUpfront`. */
  investmentGain: number;
  buy: RentVsBuySide;
  rent: RentVsBuySide;
  /**
   * `rent.netCost − buy.netCost`. Positive means buying came out ahead by
   * that many đồng over the horizon.
   */
  advantageOfBuying: number;
  /** Whether buying won at this horizon. */
  buyingWins: boolean;
  /**
   * First month at which buying is ahead and stays ahead through the
   * horizon. Null when buying never gets ahead within it.
   */
  breakEvenMonth: number | null;
};

/** One month's rent, with growth compounded once a year. */
function rentInMonth(
  baseRent: number,
  growthPerYear: number,
  month: number,
): number {
  const yearsElapsed = Math.floor((month - 1) / 12);
  return baseRent * (1 + growthPerYear) ** yearsElapsed;
}

/**
 * The two net positions at a given horizon.
 *
 * Split out from `compareRentVsBuy` because the break-even search needs to
 * evaluate it at every month, and re-deriving the schedule each time would be
 * both slow and a place for the two to drift apart.
 */
function positionsAt(
  months: number,
  ctx: {
    schedule: ReturnType<typeof amortize>;
    price: number;
    buyerUpfront: number;
    monthlyOwnerCosts: number;
    priceGrowthMonthly: number;
    sellingCostRate: number;
    baseRent: number;
    rentGrowthPerYear: number;
    rentDeposit: number;
    investmentMonthly: number;
    monthlyPayment: number;
  },
): { buy: RentVsBuySide; rent: RentVsBuySide; detail: {
  houseValue: number;
  loanBalance: number;
  totalInterest: number;
  totalPrincipal: number;
  totalOwnerCosts: number;
  sellingCost: number;
  totalRent: number;
  investmentValue: number;
} } {
  const rows = (ctx.schedule ?? []).slice(0, months);

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
  // Past the end of the schedule the loan is repaid and nothing is owed.
  const loanBalance = rows.length > 0 ? rows[rows.length - 1].balance : 0;
  const totalOwnerCosts = ctx.monthlyOwnerCosts * months;

  const houseValue = ctx.price * (1 + ctx.priceGrowthMonthly) ** months;
  const sellingCost = houseValue * ctx.sellingCostRate;

  // The buyer paid the instalment for every month of the loan they held, plus
  // ownership costs, plus the cash committed at the start.
  const buyerPaid =
    rows.reduce((sum, row) => sum + row.payment, 0) +
    totalOwnerCosts +
    ctx.buyerUpfront;
  // Worth at the horizon: sell the house, clear the loan, pay the agent.
  const buyerNetWorth = houseValue - loanBalance - sellingCost;

  let totalRent = 0;
  for (let month = 1; month <= months; month += 1) {
    totalRent += rentInMonth(ctx.baseRent, ctx.rentGrowthPerYear, month);
  }

  // The renter invests exactly what the buyer committed up front, so both
  // sides start from identical wealth and the comparison is like-for-like.
  const investmentValue =
    ctx.buyerUpfront * (1 + ctx.investmentMonthly) ** months;
  // `buyerUpfront` is counted as committed on BOTH sides. The buyer spends it
  // on a deposit, the renter locks it into an investment — but if it appeared
  // only on the buy side, renting would look cheaper by that whole amount and
  // the verdict would be biased. It cancels out of the net cost, leaving
  // `totalRent − investmentGain`, which is the right figure.
  const renterPaid = ctx.buyerUpfront + totalRent + ctx.rentDeposit;
  // The rental deposit comes back at the end, so it is worth, not cost.
  const renterNetWorth = investmentValue + ctx.rentDeposit;

  return {
    buy: {
      totalPaid: buyerPaid,
      netWorth: buyerNetWorth,
      netCost: buyerPaid - buyerNetWorth,
    },
    rent: {
      totalPaid: renterPaid,
      netWorth: renterNetWorth,
      netCost: renterPaid - renterNetWorth,
    },
    detail: {
      houseValue,
      loanBalance,
      totalInterest,
      totalPrincipal,
      totalOwnerCosts,
      sellingCost,
      totalRent,
      investmentValue,
    },
  };
}

/**
 * Compare renting with buying over a fixed horizon.
 *
 * Null when the inputs cannot describe the comparison: a non-positive price,
 * term or horizon, a deposit above the price, a negative amount, a selling
 * cost above 100%, a non-integer number of months, or any non-finite number.
 *
 * A growth rate may be negative — a falling market is exactly the case worth
 * checking — but it is rejected at or below −100% per year, where the price
 * would go negative within a year.
 */
export function compareRentVsBuy(
  input: RentVsBuyInput,
): RentVsBuyResult | null {
  const {
    price,
    downPayment,
    purchaseCosts = 0,
    annualRatePercent,
    termMonths,
    monthlyOwnerCosts = 0,
    priceGrowthPercent = 0,
    sellingCostPercent = 0,
    monthlyRent,
    rentGrowthPercent = 0,
    rentDeposit = 0,
    investmentReturnPercent = 0,
    horizonMonths,
  } = input;

  const nonNegative = [
    price,
    downPayment,
    purchaseCosts,
    annualRatePercent,
    termMonths,
    monthlyOwnerCosts,
    sellingCostPercent,
    monthlyRent,
    rentDeposit,
    horizonMonths,
  ];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  // Growth rates and returns may be negative; only their finiteness and the
  // −100% floor are checked.
  const signed = [
    priceGrowthPercent,
    rentGrowthPercent,
    investmentReturnPercent,
  ];
  if (signed.some((value) => !Number.isFinite(value) || value <= -100)) {
    return null;
  }

  if (price <= 0 || termMonths <= 0 || horizonMonths <= 0) return null;
  if (!Number.isInteger(termMonths) || !Number.isInteger(horizonMonths)) {
    return null;
  }
  if (downPayment > price) return null;
  if (sellingCostPercent > 100) return null;

  const loanAmount = price - downPayment;
  const monthlyRate = annualRatePercent / 100 / 12;

  // A cash purchase has no schedule; an empty one keeps the maths uniform.
  const schedule =
    loanAmount > 0
      ? amortize({
          principal: loanAmount,
          ratePerPeriod: monthlyRate,
          periods: termMonths,
        })
      : [];
  if (schedule === null) return null;

  const monthlyPayment =
    loanAmount > 0 ? Math.abs(pmt(monthlyRate, termMonths, loanAmount)) : 0;
  if (!Number.isFinite(monthlyPayment)) return null;

  const ctx = {
    schedule,
    price,
    buyerUpfront: downPayment + purchaseCosts,
    monthlyOwnerCosts,
    // Annual growth spread over months as a compound rate, so a 12-month
    // horizon reproduces the annual figure exactly.
    priceGrowthMonthly: (1 + priceGrowthPercent / 100) ** (1 / 12) - 1,
    sellingCostRate: sellingCostPercent / 100,
    baseRent: monthlyRent,
    rentGrowthPerYear: rentGrowthPercent / 100,
    rentDeposit,
    investmentMonthly: (1 + investmentReturnPercent / 100) ** (1 / 12) - 1,
    monthlyPayment,
  };

  const at = positionsAt(horizonMonths, ctx);

  // Break-even: the first month buying is ahead AND stays ahead to the
  // horizon. Scanning backwards from the horizon finds that directly, and
  // avoids reporting an early month that a later crossing undoes.
  let breakEvenMonth: number | null = null;
  for (let month = horizonMonths; month >= 1; month -= 1) {
    const position = positionsAt(month, ctx);
    if (position.rent.netCost - position.buy.netCost > 0) {
      breakEvenMonth = month;
    } else {
      break;
    }
  }

  const advantageOfBuying = at.rent.netCost - at.buy.netCost;

  return {
    loanAmount,
    monthlyPayment,
    buyerUpfront: ctx.buyerUpfront,
    ...at.detail,
    investmentGain: at.detail.investmentValue - ctx.buyerUpfront,
    buy: at.buy,
    rent: at.rent,
    advantageOfBuying,
    buyingWins: advantageOfBuying > 0,
    breakEvenMonth,
  };
}
