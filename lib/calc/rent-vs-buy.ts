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
 * not have, and it would quietly tilt the result toward buying. Neither side
 * invests its monthly cash-flow difference here, and the page says so for
 * BOTH — this is a net-cost comparison, not a wealth forecast.
 *
 * THE RENTAL DEPOSIT COMES OUT OF THE SAME POOL. Corrected 2026-09-15 after
 * an independent runtime check: the renter used to invest the buyer's WHOLE
 * upfront cash while also funding and getting back a rental deposit from
 * nowhere, so the deposit earned a return it never could. On the reference
 * fixture — 960 triệu of upfront cash, a 24 triệu deposit, 6%/năm over 60
 * months — that overstated the renter's gain by 8.117.413,86 ₫ and its
 * net cost accordingly. The investable pool is now `buyerUpfront −
 * rentDeposit`, the deposit is returned once at the horizon, and a deposit
 * larger than the upfront cash is REFUSED rather than quietly financed:
 * "identical starting wealth" is the whole basis of the comparison, and a
 * renter who cannot fund the deposit out of it is not that comparison.
 */

import { amortize, pmt } from "@/lib/calc/finance";

/**
 * The longest term or horizon this comparison supports, in months — 100
 * years, the suite's one disclosed horizon (see `savings-schedule.ts`).
 *
 * Checked BEFORE `amortize` allocates a row per month and before the
 * trajectory evaluates a position per month.
 */
export const MAX_RENT_BUY_MONTHS = 1200;

/**
 * Below this, the two net costs are the same figure — a TIE, not a win.
 *
 * Half a đồng, on the same reasoning as `SETTLED_BALANCE_DONG` in
 * `card-debt.ts`: the đồng has no circulating subunit, so a difference under
 * half of one is below anything a statement or a page can express. It has to
 * be a band rather than `=== 0` because both sides are sums of compounded
 * monthly paths, so an economically exact tie generally lands on float noise;
 * the only inputs that hit bit-exact zero are the degenerate ones (a cash
 * purchase with every rate at 0).
 *
 * Deliberately NOT a relative band. A relative tolerance on a 3 tỷ
 * comparison would swallow tens of thousands of đồng of real difference,
 * which is a figure a reader can act on.
 */
export const TIE_BAND_DONG = 0.5;

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
  /**
   * The cash the renter actually has to invest: `buyerUpfront − rentDeposit`.
   *
   * Both sides start from `buyerUpfront`. The buyer spends it on the deposit
   * and the purchase costs; the renter has to leave the landlord's deposit
   * with the landlord, so only the rest of it can be invested.
   */
  investedCash: number;
  /** What the renter's invested cash grows to. */
  investmentValue: number;
  /** Growth on that cash: `investmentValue − investedCash`. */
  investmentGain: number;
  buy: RentVsBuySide;
  rent: RentVsBuySide;
  /**
   * `rent.netCost − buy.netCost`. Positive means buying came out ahead by
   * that many đồng over the horizon.
   */
  advantageOfBuying: number;
  /** Whether buying won at this horizon. False also when the two are level. */
  buyingWins: boolean;
  /**
   * Whether the two net costs are the same figure.
   *
   * `buyingWins` alone cannot say this: it is `advantage > 0`, so a tie
   * reads as a win for renting and a page built on it announces "thuê lợi
   * hơn 0 ₫". A cash purchase at a 0% growth, a 0% return and no rent is an
   * exact tie, and a reader can reach it.
   *
   * Banded, not `=== 0`, for the reason §8 of the suite doc gives for every
   * equality against a computed float: both sides are sums of compounded
   * paths, so an economic tie lands on float noise rather than on zero. The
   * band is `TIE_BAND_DONG`.
   */
  tied: boolean;
  /**
   * First month at which buying is ahead AND stays ahead through the horizon.
   *
   * Null in TWO different situations, and a page must not describe them the
   * same way: buying was never ahead at any month, or it was ahead for a
   * while and the lead was reversed again before the horizon. The second is
   * real — on a 360-month horizon at 4% growth and a 10% return, buying is
   * ahead from month 90 to month 302 and renting is 2 tỷ ahead by month 360 —
   * so "mua không lúc nào có lợi" would be false. `trajectory` is what
   * distinguishes them.
   */
  breakEvenMonth: number | null;
  /**
   * Both net costs at every month from 0 to the horizon.
   *
   * ORIGINAL ROW 8 asks for two bounded net-cost trajectories rather than a
   * single endpoint, because the endpoint hides the crossing. Month 0 is
   * included and is not a zero row: the buyer is already down the entry and
   * exit costs there, the renter is level. Every figure comes from the same
   * `positionsAt` the headline and the break-even scan use.
   */
  trajectory: {
    month: number;
    buyNetCost: number;
    rentNetCost: number;
    /** `rentNetCost − buyNetCost`: positive means buying is ahead. */
    advantageOfBuying: number;
  }[];
};

/**
 * How many named growth scenarios one comparison may carry.
 *
 * Each one is a full comparison over the same horizon, so this is a bound on
 * work as well as on how much a reader can be asked to hold in their head.
 */
export const MAX_GROWTH_SCENARIOS = 5;

export type RentVsBuyScenario = {
  /** The growth rate this scenario assumes, in percent per year. */
  priceGrowthPercent: number;
  /** The comparison at that rate. Null when the engine refused it. */
  result: RentVsBuyResult | null;
};

/**
 * The same comparison under several NAMED house-growth assumptions.
 *
 * ORIGINAL ROW 8 asks for this because the answer genuinely reverses: on the
 * reference fixture buying costs 1.144 tỷ at 0% growth and 149,7 triệu at 6%,
 * while renting costs 447,9 triệu either way — so the ranking flips between
 * the two. A single growth rate hides that.
 *
 * THESE ARE SCENARIOS, NOT A FORECAST OR AN INTERVAL. The module computes
 * exactly the rates it is handed and attaches no likelihood to any of them;
 * the page says so. Rates come from the caller so a reader's own assumption
 * can be one of them.
 *
 * No second engine: every scenario is `compareRentVsBuy` on the same input
 * with one field changed. Null for the whole call when more scenarios are
 * asked for than are supported, or when the list is empty.
 */
export function compareGrowthScenarios(
  input: RentVsBuyInput,
  growthPercents: readonly number[],
): RentVsBuyScenario[] | null {
  if (growthPercents.length === 0) return null;
  if (growthPercents.length > MAX_GROWTH_SCENARIOS) return null;
  return growthPercents.map((priceGrowthPercent) => ({
    priceGrowthPercent,
    result: compareRentVsBuy({ ...input, priceGrowthPercent }),
  }));
}

/**
 * How far above the reader's own assumption the third scenario sits, in
 * percentage POINTS per year.
 *
 * Points, not a multiplier: doubling a 0,5%/năm assumption is not a scenario
 * anyone would notice, and doubling a 12%/năm one is not a scenario anyone
 * should be shown. Three points is the same step the floating-rate tool's
 * stress presets use.
 */
export const GROWTH_SCENARIO_STEP_POINTS = 3;

/**
 * The named growth rates a page should compare, given the reader's own.
 *
 * Always includes 0 — "the house does not go up at all" is the one assumption
 * that needs no forecast and is the case the copy asks the reader to try — and
 * always includes the rate they actually typed, so the scenario view contains
 * the figure the headline is built from. The third is their rate plus
 * `GROWTH_SCENARIO_STEP_POINTS`.
 *
 * Sorted ascending and de-duplicated, so a reader on 0%/năm gets two
 * scenarios rather than the same one three times. At 3%/năm it returns
 * exactly 0/3/6, which is the fixture the reversal is documented on.
 *
 * Null for a rate the comparison itself would refuse, so a caller cannot
 * build a scenario list around an input that has no result.
 */
export function growthScenarioRates(
  priceGrowthPercent: number,
): number[] | null {
  if (!Number.isFinite(priceGrowthPercent)) return null;
  if (priceGrowthPercent <= -100) return null;
  const rates = [0, priceGrowthPercent, priceGrowthPercent + GROWTH_SCENARIO_STEP_POINTS]
    .filter((rate) => rate > -100)
    .sort((a, b) => a - b);
  return [...new Set(rates)];
}

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
    loanAmount: number;
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
  investedCash: number;
  investmentValue: number;
} } {
  const rows = (ctx.schedule ?? []).slice(0, months);

  const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = rows.reduce((sum, row) => sum + row.principal, 0);
  /**
   * What is still owed at this month.
   *
   * MONTH 0 OWES THE WHOLE LOAN. The empty slice used to fall through to 0,
   * which reads as a paid-off mortgage at the moment of purchase and would
   * hand a trajectory its first point as a fictitious equity gain. Past the
   * end of the schedule the loan really is repaid, and only then is 0 right.
   */
  const loanBalance =
    rows.length > 0
      ? rows[rows.length - 1].balance
      : months === 0
        ? ctx.loanAmount
        : 0;
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

  // Both sides start from `buyerUpfront`. The renter has to leave the
  // landlord's deposit with the landlord, so only the REST of that cash is
  // invested — see the module docstring for the figure this corrected.
  const investedCash = ctx.buyerUpfront - ctx.rentDeposit;
  const investmentValue = investedCash * (1 + ctx.investmentMonthly) ** months;
  // `buyerUpfront` is counted as committed on BOTH sides, exactly once: the
  // buyer spends it on the deposit and the fees, the renter splits it between
  // the landlord's deposit and the investment. If it appeared only on the buy
  // side, renting would look cheaper by that whole amount and the verdict
  // would be biased. It cancels out of the net cost, leaving `totalRent −
  // investmentGain`, which is the right figure.
  const renterPaid = investedCash + ctx.rentDeposit + totalRent;
  // The rental deposit comes back at the end — returned ONCE, and it is worth
  // rather than cost. It earns nothing while the landlord holds it.
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
      investedCash,
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
  // BOUNDED BEFORE `amortize` ALLOCATES. A term is a count of rows in a
  // schedule and the horizon is a count of evaluations over it, so both are
  // checked against the suite's one disclosed horizon first — a finite
  // `termMonths: 1e9` is a finite input asking for a billion rows.
  if (termMonths > MAX_RENT_BUY_MONTHS) return null;
  if (horizonMonths > MAX_RENT_BUY_MONTHS) return null;

  const buyerUpfrontCash = downPayment + purchaseCosts;
  // A deposit the renter cannot fund out of the SAME starting cash breaks the
  // comparison's only premise. Refused rather than financed from nowhere.
  if (rentDeposit > buyerUpfrontCash) return null;

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
    loanAmount,
    buyerUpfront: buyerUpfrontCash,
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

  const result: RentVsBuyResult = {
    loanAmount,
    monthlyPayment,
    buyerUpfront: ctx.buyerUpfront,
    ...at.detail,
    // Growth on the cash that was actually invested — not on the part the
    // landlord is holding.
    investmentGain: at.detail.investmentValue - at.detail.investedCash,
    buy: at.buy,
    rent: at.rent,
    advantageOfBuying,
    buyingWins: advantageOfBuying > 0,
    tied: Math.abs(advantageOfBuying) <= TIE_BAND_DONG,
    breakEvenMonth,
    // Month 0 first, where the buyer is already down the entry and exit costs
    // and the renter is level. Bounded by `horizonMonths`, itself bounded
    // above.
    trajectory: Array.from({ length: horizonMonths + 1 }, (_, month) => {
      const position = positionsAt(month, ctx);
      return {
        month,
        buyNetCost: position.buy.netCost,
        rentNetCost: position.rent.netCost,
        advantageOfBuying: position.rent.netCost - position.buy.netCost,
      };
    }),
  };

  // FINITE INPUTS DO NOT PROVE FINITE OUTPUTS: a 1e308 growth rate is finite
  // and its compound path is not.
  const figures = [
    result.monthlyPayment,
    result.houseValue,
    result.loanBalance,
    result.investmentValue,
    result.investmentGain,
    result.buy.netCost,
    result.rent.netCost,
    result.advantageOfBuying,
    ...result.trajectory.flatMap((point) => [
      point.buyNetCost,
      point.rentNetCost,
    ]),
  ];
  if (figures.some((value) => !Number.isFinite(value))) return null;
  return result;
}
