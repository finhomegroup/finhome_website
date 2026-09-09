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
  /**
   * The same two flows in TODAY's money.
   *
   * These exist here rather than in the pages because they need a DIFFERENT
   * deflator from the balances above, and getting that wrong is invisible:
   * both flows move at the START of a year and both balances are end-of-year
   * figures, so dividing a withdrawal by the balance deflator understates it
   * by exactly one year of inflation. On a funded plan `realWithdrawal` is
   * the level spend that was asked for, in every year — which is the
   * identity retirement.test.ts asserts, and the reason a page must not
   * compute this itself.
   */
  realContribution: number;
  realWithdrawal: number;
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
   * Annual spending in today's money the plan WOULD support across the full
   * retirement span: the balance drawn down as a level real annuity PLUS
   * other income. Compare with what was asked for. With no balance at all
   * it is exactly the other income, not zero.
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
    // Two deflators, both computed here so no page can apply one of its own.
    // `deflator` is end-of-year, for the balance; `flowDeflator` is
    // start-of-year, for the contribution and the withdrawal, which both move
    // before the year's return is credited. They differ by one year of
    // inflation, and using the wrong one is a silent 2,5%-a-year error.
    const deflator = Math.pow(1 + inflation, elapsed + 1);
    const flowDeflator = Math.pow(1 + inflation, elapsed);
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
      realContribution: contribution / flowDeflator,
      realWithdrawal: withdrawal / flowDeflator,
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
    // Other income is still there when the portfolio is not. Both live
    // branches below end in `+ otherAnnualIncome`, and the limit of the
    // annuity-due branch as the balance goes to zero is exactly that — so
    // returning 0 here put a discontinuity of a whole pension into the
    // rendered row: at a balance of 1 USD this field reads 25.000,17 and at
    // 0 it read 0. Nothing divides by zero at a zero balance, so this
    // branch exists only to avoid a negative annuity, not to drop the
    // income. Cross-checked against the projection's own depletion
    // boundary: with no balance and 25.000 of other income, a 25.000 spend
    // never depletes and 25.000,01 depletes in the first year.
    sustainableSpending = otherAnnualIncome;
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

/**
 * Bracket width the contribution search stops at, in the account's currency
 * per year — and therefore also the step used to settle onto the funded side
 * of the root. Named because both uses have to be the same number.
 */
const CONTRIBUTION_TOLERANCE = 1e-4;

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
 *
 * The returned `projection` is guaranteed to be a FUNDED one — see the
 * settling step in the body for why that needs saying.
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
    tolerance: CONTRIBUTION_TOLERANCE,
  });
  if (solved === null) return null;

  // Bisection converges on a BRACKET, so the midpoint it returns can sit a
  // whisker on the DEPLETING side of the root: |mid - root| < tolerance, in
  // either direction. That is 1e-4 of currency a year — economically nothing,
  // and yet it breaks this function's whole contract, because the projection
  // handed back then reports `depletionAge` at endAge - 1 while the headline
  // it accompanies says this is the contribution that funds the plan. A page
  // showing both would contradict itself.
  //
  // The search function is monotone, so stepping up by the tolerance crosses
  // the root at most once: the loop below normally runs zero or one times and
  // the ceiling is float paranoia, not a real bound. It is not a substitute
  // for bracketing — an unbracketed search still returns null above.
  //
  // Caught by tinh-huu-tri, whose defaults (a 100.000 starting balance) land
  // on the low side. The pre-existing test asserted this contract already but
  // happened to use a 50.000 balance, which lands on the high side. Hence the
  // sweep in retirement.test.ts rather than one more single case.
  let annualContribution = solved;
  let projection = at(annualContribution);
  for (let step = 0; step < 4; step += 1) {
    if (projection !== null && projection.depletionAge === null) break;
    annualContribution += CONTRIBUTION_TOLERANCE;
    projection = at(annualContribution);
  }
  if (projection === null || projection.depletionAge !== null) return null;

  return {
    annualContribution,
    monthlyContribution: annualContribution / 12,
    projection,
    alreadyFunded: false,
  };
}
