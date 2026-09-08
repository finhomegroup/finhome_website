/**
 * Retirement accumulation and drawdown.
 *
 * The shared engine behind the retirement planning pages. One projection
 * runs the whole life: contributions until retirement, then withdrawals
 * until the money runs out or the horizon ends.
 *
 * ## The three things this module refuses to do
 *
 * **It does not report a nominal balance as the answer.** A 40-year
 * projection at 3% inflation makes the nominal figure roughly three times
 * the real one, and a reader who plans against the nominal number will
 * plan to be poor. Every headline is available in today's money, and
 * `realBalance` is computed alongside the nominal one rather than left to
 * the page to remember.
 *
 * **It does not smooth over running out.** If the money is exhausted the
 * result says which year, in `depletionAge`. A projection that quietly
 * reports a zero final balance has hidden the only fact that mattered.
 *
 * **It does not compound annual figures monthly.** Contributions and
 * withdrawals here are annual, applied once a year, and the returns are
 * annual. Mixing a monthly contribution into an annual compounding loop
 * overstates growth by roughly half a year's return on each contribution.
 * The pages that want monthly inputs multiply by 12 before calling.
 *
 * ## Ordering within a year
 *
 * Accumulation: contribution first, then the return, so a contribution
 * earns a full year. Drawdown: withdrawal first, then the return on what
 * remains, so the retiree is never credited with growth on money they
 * already spent. Those two conventions are opposite on purpose, and each is
 * the conservative choice for its phase.
 */

import { bisect } from "@/lib/calc/solve";

export type RetirementInput = {
  currentAge: number;
  retirementAge: number;
  /** Age the projection stops, whether or not money remains. */
  endAge: number;
  /** Balance today, in the account's currency. */
  currentBalance: number;
  /** Contributed each year until retirement. */
  annualContribution: number;
  /** Contribution grows at this rate each year, in percent — usually wage growth. */
  contributionGrowthPercent: number;
  /** Annual return before retirement, in percent. */
  returnBeforePercent: number;
  /** Annual return after retirement, in percent. Usually lower. */
  returnAfterPercent: number;
  /** Inflation, in percent. Drives the real figures and indexes the spend. */
  inflationPercent: number;
  /**
   * Desired annual spending in TODAY's money. The projection inflates it to
   * each future year, which is what makes the answer a real one.
   */
  desiredAnnualSpending: number;
  /** Other annual income in retirement, in today's money — pension, Social Security. */
  otherAnnualIncome: number;
};

export type RetirementYear = {
  age: number;
  /** True while still contributing. */
  accumulating: boolean;
  /** Balance at the end of the year, nominal. */
  balance: number;
  /** The same balance in today's money. */
  realBalance: number;
  /** Paid in this year, nominal. Zero after retirement. */
  contribution: number;
  /** Taken out this year, nominal. Zero before retirement. */
  withdrawal: number;
  /** Investment return credited this year, nominal. */
  investmentReturn: number;
};

export type RetirementResult = {
  years: RetirementYear[];
  /** Balance at the moment of retirement, nominal and real. */
  balanceAtRetirement: number;
  realBalanceAtRetirement: number;
  /** Total paid in across the accumulation phase. */
  totalContributed: number;
  /** Growth earned across the whole projection. */
  totalGrowth: number;
  /** Total withdrawn across retirement, nominal. */
  totalWithdrawn: number;
  /** Balance at endAge, nominal and real. Zero if the money ran out. */
  finalBalance: number;
  realFinalBalance: number;
  /** Age the money ran out, or null if it lasted. THE headline for a shortfall. */
  depletionAge: number | null;
  /** Years of retirement funded before depletion, or the full span. */
  yearsFunded: number;
  /** Years of retirement the plan is short by. Zero when funded. */
  yearsShort: number;
  /** First year's withdrawal as a percent of the balance at retirement. */
  initialWithdrawalRatePercent: number | null;
  /**
   * Annual spending in today's money the balance WOULD support across the
   * full retirement span. Compare with what was asked for.
   */
  sustainableSpending: number | null;
  /** Shortfall between desired and sustainable spending, in today's money. */
  spendingShortfall: number;
};

/** Years of retirement, used in several places. */
function retirementSpan(input: RetirementInput): number {
  return input.endAge - input.retirementAge;
}

/**
 * Run the projection.
 *
 * Null on ages out of order, an age outside 0–120, a horizon over 100
 * years, negative money, or a rate outside −100–100%. Ages must be
 * integers: a projection stepping by whole years cannot start half way
 * through one.
 */
export function projectRetirement(
  input: RetirementInput,
): RetirementResult | null {
  const {
    currentAge,
    retirementAge,
    endAge,
    currentBalance,
    annualContribution,
    contributionGrowthPercent,
    returnBeforePercent,
    returnAfterPercent,
    inflationPercent,
    desiredAnnualSpending,
    otherAnnualIncome,
  } = input;

  for (const age of [currentAge, retirementAge, endAge]) {
    if (!Number.isFinite(age) || !Number.isInteger(age)) return null;
    if (age < 0 || age > 120) return null;
  }
  // Retiring before today, or a projection ending before retirement, are
  // not edge cases to handle — they are contradictory inputs.
  if (retirementAge < currentAge) return null;
  if (endAge <= retirementAge) return null;
  if (endAge - currentAge > 100) return null;

  if (currentBalance < 0 || annualContribution < 0) return null;
  if (desiredAnnualSpending < 0 || otherAnnualIncome < 0) return null;
  for (const rate of [
    contributionGrowthPercent,
    returnBeforePercent,
    returnAfterPercent,
    inflationPercent,
  ]) {
    if (!Number.isFinite(rate) || rate < -100 || rate > 100) return null;
  }

  const growth = contributionGrowthPercent / 100;
  const rateBefore = returnBeforePercent / 100;
  const rateAfter = returnAfterPercent / 100;
  const inflation = inflationPercent / 100;

  const years: RetirementYear[] = [];
  let balance = currentBalance;
  let totalContributed = 0;
  let totalWithdrawn = 0;
  let totalGrowth = 0;
  let balanceAtRetirement = currentBalance;
  let depletionAge: number | null = null;

  for (let age = currentAge; age < endAge; age += 1) {
    const elapsed = age - currentAge;
    // One deflator, used for every real figure, so the page cannot apply a
    // second one by accident.
    const deflator = Math.pow(1 + inflation, elapsed + 1);
    const accumulating = age < retirementAge;

    let contribution = 0;
    let withdrawal = 0;
    let investmentReturn = 0;

    if (accumulating) {
      contribution = annualContribution * Math.pow(1 + growth, elapsed);
      // Contribution first, then the return: a contribution earns a full
      // year, which matches how a January deposit behaves.
      balance += contribution;
      investmentReturn = balance * rateBefore;
      balance += investmentReturn;
      totalContributed += contribution;
    } else {
      // Spending is quoted in today's money, so it must be inflated to the
      // year it is actually spent. Not inflating it is how a plan looks
      // funded for 30 years and runs dry in 20.
      const inflatedSpending =
        desiredAnnualSpending * Math.pow(1 + inflation, elapsed);
      const inflatedIncome =
        otherAnnualIncome * Math.pow(1 + inflation, elapsed);
      const needed = Math.max(0, inflatedSpending - inflatedIncome);

      withdrawal = Math.min(balance, needed);
      balance -= withdrawal;
      // Return on what REMAINS after the withdrawal: crediting growth on
      // money already spent would fund the plan with imaginary returns.
      investmentReturn = balance * rateAfter;
      balance += investmentReturn;
      totalWithdrawn += withdrawal;

      // Depleted means the year's need could not be met in full.
      if (depletionAge === null && withdrawal < needed) {
        depletionAge = age;
      }
    }

    totalGrowth += investmentReturn;

    years.push({
      age,
      accumulating,
      balance,
      realBalance: balance / deflator,
      contribution,
      withdrawal,
      investmentReturn,
    });

    // The balance at retirement is the balance at the END of the last
    // accumulation year. When retirement is today there is no such year, and
    // the initialiser above already holds the right value.
    if (age === retirementAge - 1) balanceAtRetirement = balance;
  }

  const span = retirementSpan(input);
  const accumulationYears = retirementAge - currentAge;
  const retirementDeflator = Math.pow(1 + inflation, accumulationYears);

  const finalBalance = years[years.length - 1].balance;
  const finalDeflator = Math.pow(1 + inflation, endAge - currentAge);

  const firstRetirementYear = years.find((row) => !row.accumulating);
  const initialWithdrawalRatePercent =
    balanceAtRetirement <= 0 || firstRetirementYear === undefined
      ? null
      : (firstRetirementYear.withdrawal / balanceAtRetirement) * 100;

  // What the balance at retirement could actually support, in today's
  // money, as a level real annuity over the retirement span. Solved from
  // the real return so the answer is directly comparable to the input.
  const realReturn = (1 + rateAfter) / (1 + inflation) - 1;
  const realBalanceAtRetirement = balanceAtRetirement / retirementDeflator;
  let sustainableSpending: number | null;
  if (realBalanceAtRetirement <= 0) {
    sustainableSpending = 0;
  } else if (Math.abs(realReturn) < 1e-12) {
    // A zero real return is a straight division, and the annuity formula
    // would divide by zero here.
    sustainableSpending = realBalanceAtRetirement / span + otherAnnualIncome;
  } else {
    // An annuity DUE, not an ordinary annuity: the projection withdraws at
    // the START of each year and only then credits the return, so the
    // sustainable figure has to be solved on the same convention. Using the
    // end-of-period factor overstates the safe spend by a factor of
    // (1 + real return) — enough to make a plan that reports "funded" run
    // dry two years early. Caught by the round-trip test below, which feeds
    // this figure back through the projection.
    const annuityDueFactor =
      ((1 - Math.pow(1 + realReturn, -span)) / realReturn) * (1 + realReturn);
    sustainableSpending =
      realBalanceAtRetirement / annuityDueFactor + otherAnnualIncome;
  }

  const yearsFunded =
    depletionAge === null ? span : depletionAge - retirementAge;

  return {
    years,
    balanceAtRetirement,
    realBalanceAtRetirement,
    totalContributed,
    totalGrowth,
    totalWithdrawn,
    finalBalance,
    realFinalBalance: finalBalance / finalDeflator,
    depletionAge,
    yearsFunded,
    yearsShort: span - yearsFunded,
    initialWithdrawalRatePercent,
    sustainableSpending,
    spendingShortfall: Math.max(
      0,
      desiredAnnualSpending - (sustainableSpending ?? 0),
    ),
  };
}

/** Upper bound for the contribution solver, in the account's currency. */
const MAX_ANNUAL_CONTRIBUTION = 1e9;

export type RequiredContributionResult = {
  /** Annual contribution that just funds the plan to `endAge`. */
  annualContribution: number;
  /** The same figure per month. Pages that ask monthly divide here, once. */
  monthlyContribution: number;
  /** The projection that contribution produces, for the page to show. */
  projection: RetirementResult;
  /** True when the existing balance alone already funds the plan. */
  alreadyFunded: boolean;
};

/**
 * Solve for the contribution that funds the plan.
 *
 * Bisection on the projection itself rather than a closed-form annuity, for
 * one reason: the projection contains a floor — a withdrawal can never
 * exceed the balance — and the closed form does not. Solving the formula and
 * then displaying the projection is how a page comes to claim a plan is
 * funded while its own table shows the money running out.
 *
 * Returns null when the inputs are invalid, or when even the maximum
 * contribution cannot fund the plan. Null is the honest answer there: any
 * finite figure returned from an unbracketed search would be a guess.
 */
export function solveRequiredContribution(
  input: Omit<RetirementInput, "annualContribution">,
): RequiredContributionResult | null {
  const at = (annualContribution: number) =>
    projectRetirement({ ...input, annualContribution });

  const withNothing = at(0);
  if (withNothing === null) return null;

  // Already funded: the answer is zero, not the smallest number bisection
  // happens to land on.
  if (withNothing.depletionAge === null) {
    return {
      annualContribution: 0,
      monthlyContribution: 0,
      projection: withNothing,
      alreadyFunded: true,
    };
  }

  const withMax = at(MAX_ANNUAL_CONTRIBUTION);
  if (withMax === null || withMax.depletionAge !== null) return null;

  // The function bisected is the real balance left at the end. It is
  // negative-by-proxy below the answer (the plan depletes, so the shortfall
  // in funded years stands in) and positive above it.
  const shortfall = (contribution: number) => {
    const projection = at(contribution);
    if (projection === null) return Number.NaN;
    // Depleted: return the years short, negated, so the sign is right and
    // the function is monotone across the boundary.
    if (projection.depletionAge !== null) return -projection.yearsShort;
    return projection.realFinalBalance;
  };

  const solved = bisect(shortfall, 0, MAX_ANNUAL_CONTRIBUTION, {
    tolerance: 1e-4,
  });
  if (solved === null) return null;

  const projection = at(solved);
  if (projection === null) return null;

  return {
    annualContribution: solved,
    monthlyContribution: solved / 12,
    projection,
    alreadyFunded: false,
  };
}
