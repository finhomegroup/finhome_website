/**
 * Term deposits (sổ tiết kiệm có kỳ hạn) for /cong-cu/tien-gui-co-ky-han/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `term-deposit.test.ts`.
 *
 * Modelled on how Vietnamese banks actually compute a term deposit, which is
 * NOT the compound-interest formula:
 *
 * - Interest WITHIN a term is SIMPLE, pro-rated by the length of the term:
 *   a 6-month deposit at 6%/năm earns 3% of the principal, not
 *   `(1,005)^6 − 1`. Compounding only happens when a term ends and the
 *   interest is rolled into the principal for the next one.
 * - `payout` decides whether interest is handed over during the term
 *   (`monthly`, `quarterly`) or all at maturity. It changes WHEN you receive
 *   the money, not how much a single term earns — the total for one term is
 *   the same figure either way. Banks usually quote a slightly lower rate for
 *   interest-in-advance products; that difference is a rate you type in, not
 *   something this module invents.
 * - `compoundOnRollover` only means anything with `payout: "maturity"`. If
 *   the interest has already been paid out monthly, there is nothing left to
 *   roll into the principal, and the module ignores the flag rather than
 *   silently compounding money the saver has already spent.
 *
 * The early-withdrawal figures are the reason this module is worth more than
 * a multiplication. Break a Vietnamese term deposit early and you do not get
 * a reduced term rate — you get the DEMAND rate (lãi suất không kỳ hạn), on
 * the whole period, typically 0,1–0,2%/năm. That turns a 6%/năm deposit into
 * near-nothing, and it is the single most expensive surprise in the product.
 */

export type DepositPayout =
  /** All interest at the end of the term. */
  | "maturity"
  /** Interest paid out every month. */
  | "monthly"
  /** Interest paid out every quarter. */
  | "quarterly";

export type TermDepositInput = {
  /** Amount deposited, in đồng. */
  principal: number;
  /** Quoted nominal annual rate, in percent. */
  annualRatePercent: number;
  /** Length of ONE term, in months. */
  termMonths: number;
  /** When interest is handed over. Defaults to maturity. */
  payout?: DepositPayout;
  /** How many consecutive terms to run. 1 is a single term. */
  cycles?: number;
  /** Roll interest into the principal at each rollover. Maturity payout only. */
  compoundOnRollover?: boolean;
  /** Demand rate applied if the deposit is broken early, in percent per year. */
  demandRatePercent?: number;
  /** Months held before breaking, for the early-withdrawal comparison. */
  breakAfterMonths?: number;
};

export type TermDepositResult = {
  /** Total months across all cycles. */
  totalMonths: number;
  /** Interest handed over on each payout occasion, in the FIRST term. */
  interestPerPayout: number;
  /** How many payout occasions there are in total. */
  payoutCount: number;
  /** Interest across every cycle. */
  totalInterest: number;
  /** `principal + totalInterest`. */
  totalValue: number;
  /** Principal at work in the final term — grown only if compounding. */
  finalPrincipal: number;
  /** Whether interest was actually rolled into the principal. */
  compounded: boolean;
  /**
   * The annual rate that turns the principal into `totalValue` over
   * `totalMonths`, compounded annually. Equals the quoted rate for a single
   * 12-month term, and exceeds it when interest is rolled over.
   */
  effectiveAnnualPercent: number;
  /**
   * Interest actually received if the deposit is broken after
   * `breakAfterMonths`, at the demand rate. Null when no break was asked about.
   */
  earlyInterest: number | null;
  /** Interest the term rate would have earned over the same months, pro rata. */
  earlyForegoneInterest: number | null;
  /** `earlyForegoneInterest − earlyInterest`: the cost of breaking early. */
  earlyLoss: number | null;
};

/**
 * Compute a term deposit.
 *
 * Null when the inputs cannot describe one: a non-positive principal or term,
 * a negative rate, fewer than one cycle, a non-integer number of months or
 * cycles, a break after zero months or past the end of the deposit, or any
 * non-finite number.
 *
 * A term that is not a whole number of payout periods is rejected in the
 * `quarterly` case — a 5-month deposit paying quarterly is not a product, and
 * inventing a partial payout would be a guess.
 */
export function computeTermDeposit(
  input: TermDepositInput,
): TermDepositResult | null {
  const {
    principal,
    annualRatePercent,
    termMonths,
    payout = "maturity",
    cycles = 1,
    compoundOnRollover = false,
    demandRatePercent,
    breakAfterMonths,
  } = input;

  const numbers = [principal, annualRatePercent, termMonths, cycles];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (principal <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (cycles < 1 || !Number.isInteger(cycles)) return null;

  const payoutMonths =
    payout === "monthly" ? 1 : payout === "quarterly" ? 3 : termMonths;
  // A term that does not divide into whole payout periods is not a product.
  if (termMonths % payoutMonths !== 0) return null;

  const rate = annualRatePercent / 100;
  // Interest is only rolled in if there is any left to roll.
  const compounded = compoundOnRollover && payout === "maturity";

  let balance = principal;
  let totalInterest = 0;
  let interestPerPayout = 0;

  for (let cycle = 1; cycle <= cycles; cycle += 1) {
    // Simple interest, pro-rated by term length. This is the Vietnamese
    // convention and it is NOT (1 + r)^n.
    const cycleInterest = balance * rate * (termMonths / 12);
    if (cycle === 1) {
      interestPerPayout = balance * rate * (payoutMonths / 12);
    }
    totalInterest += cycleInterest;
    if (compounded) balance += cycleInterest;
  }

  const totalMonths = termMonths * cycles;
  const totalValue = principal + totalInterest;

  const effectiveAnnualPercent =
    ((totalValue / principal) ** (12 / totalMonths) - 1) * 100;
  if (!Number.isFinite(effectiveAnnualPercent)) return null;

  // The early-withdrawal block is optional; both inputs are needed for it.
  let earlyInterest: number | null = null;
  let earlyForegoneInterest: number | null = null;
  let earlyLoss: number | null = null;

  if (breakAfterMonths !== undefined) {
    if (!Number.isFinite(breakAfterMonths) || breakAfterMonths <= 0) return null;
    if (breakAfterMonths > totalMonths) return null;
    const demand = demandRatePercent ?? 0;
    if (!Number.isFinite(demand) || demand < 0) return null;
    earlyInterest = principal * (demand / 100) * (breakAfterMonths / 12);
    earlyForegoneInterest = principal * rate * (breakAfterMonths / 12);
    earlyLoss = earlyForegoneInterest - earlyInterest;
  }

  return {
    totalMonths,
    interestPerPayout,
    payoutCount: (termMonths / payoutMonths) * cycles,
    totalInterest,
    totalValue,
    finalPrincipal: balance,
    compounded,
    effectiveAnnualPercent,
    earlyInterest,
    earlyForegoneInterest,
    earlyLoss,
  };
}
