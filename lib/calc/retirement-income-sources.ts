/**
 * Retirement income, source by source.
 *
 * The other retirement modules in this suite treat non-portfolio income as
 * one indexed lump — `retirement.ts` inflates its `otherAnnualIncome` at the
 * inflation rate, so every source keeps its purchasing power for ever. That
 * is a convenient fiction, and it is wrong in the one direction that costs a
 * retiree the most money.
 *
 * ## Why the sources cannot share one indexation rate
 *
 * United States Social Security carries a statutory cost-of-living
 * adjustment, so it does roughly hold its real value. Most private employer
 * pensions and every fixed annuity pay a level NOMINAL amount, and at 2,5%
 * inflation a level amount keeps 51,3% of its purchasing power after 27
 * years. Part-time work in retirement usually tracks wages and then stops
 * altogether at some age.
 *
 * Averaging those into one rate does not produce a mildly imprecise answer.
 * It produces a plan that looks funded in year one and is short by a third
 * in year twenty-five, with the shortfall arriving at the age the retiree
 * has the least capacity to do anything about it. So each source carries its
 * own indexation rate and its own final age, and the module reports what the
 * mix looks like at BOTH ends of retirement rather than only at the start.
 *
 * ## What this module does not do
 *
 * It has no accumulation phase: the projection starts at the age the income
 * starts, and every amount is in the money of THAT year. A reader who knows
 * their pension in today's money and retires in twenty years must inflate it
 * first — `retirement.ts` is the module that spans both phases.
 *
 * It applies no rule about which source is COLA-indexed. The statutory claim
 * ("Social Security is indexed") belongs to the page that makes it, and the
 * page wires that source's indexation to the inflation field. A module that
 * hard-coded one source's rate would be encoding one country's statute into
 * arithmetic.
 *
 * Ordering within a year matches `retirement.ts`: income arrives and money
 * is spent at the START of the year, then the return is credited to what is
 * left in the portfolio. Crediting growth on money already spent would fund
 * the plan with imaginary returns.
 */

export const INCOME_SOURCE_KEYS = [
  "social",
  "pension",
  "work",
  "other",
] as const;

export type IncomeSourceKey = (typeof INCOME_SOURCE_KEYS)[number];

export type IncomeSourceInput = {
  /** Annual amount, in the money of the projection's FIRST year. */
  annualAmount: number;
  /**
   * Nominal growth a year, in percent. Zero is a level payment, which is
   * what most private pensions and all fixed annuities are.
   */
  indexationPercent: number;
  /**
   * Last age this source pays, inclusive. Below the start age it never pays
   * at all, which is the honest reading of "I will work until 60" from
   * someone who retires at 67 — not an input error.
   */
  throughAge: number;
};

export type RetirementIncomeSourcesInput = {
  /** Age the income and the spending both start. */
  startAge: number;
  /** Age the projection stops. Exclusive, so 67 to 95 is 28 years. */
  endAge: number;
  /** Annual spending need, in first-year money. Indexed at `inflationPercent`. */
  annualNeed: number;
  inflationPercent: number;
  /** Portfolio available to cover whatever the sources do not. */
  portfolioBalance: number;
  portfolioReturnPercent: number;
  sources: Record<IncomeSourceKey, IncomeSourceInput>;
};

export type IncomeYear = {
  age: number;
  /** Spending need this year, nominal. */
  need: number;
  /** Each source's payment this year, nominal. Zero once it has ended. */
  bySource: Record<IncomeSourceKey, number>;
  /** Every source added up, nominal. */
  fixedIncome: number;
  /** Need not met by the sources, nominal. */
  gap: number;
  /** Drawn from the portfolio, nominal. Never more than the balance. */
  withdrawal: number;
  /** Gap the portfolio could not cover either. The number that matters. */
  unmet: number;
  /** Portfolio balance at the END of the year, nominal. */
  balance: number;
  /** The same figures in first-year money. */
  realNeed: number;
  /** Each source's payment in first-year money — the column that decays. */
  realBySource: Record<IncomeSourceKey, number>;
  realFixedIncome: number;
  realWithdrawal: number;
  realUnmet: number;
  realBalance: number;
  /** Sources as a percent of the need — before the portfolio is touched. */
  fixedCoveragePercent: number | null;
  /** Sources plus withdrawal as a percent of the need. */
  totalCoveragePercent: number | null;
};

export type RetirementIncomeSourcesResult = {
  years: IncomeYear[];
  first: IncomeYear;
  last: IncomeYear;
  /** Age the portfolio hits zero, or null if it lasts. */
  depletionAge: number | null;
  /** First age the total income falls short of the need, or null. */
  firstUnmetAge: number | null;
  /**
   * Real value of each source in the final year as a percent of its real
   * value in the first, which is what indexation is worth. 100 for a fully
   * indexed source, null for one that has already ended.
   */
  realValueKeptPercent: Record<IncomeSourceKey, number | null>;
  /** Total received from each source across the span, in first-year money. */
  realTotalBySource: Record<IncomeSourceKey, number>;
  realTotalFixedIncome: number;
  realTotalWithdrawn: number;
  realTotalNeed: number;
  realTotalUnmet: number;
  /** First year's withdrawal as a percent of the opening balance. */
  initialWithdrawalRatePercent: number | null;
  /** Nominal totals, for the reader who wants to reconcile a statement. */
  totalWithdrawn: number;
  finalBalance: number;
};

const AGE_LIMIT = 120;
const MAX_SPAN = 100;

function zeroBySource(): Record<IncomeSourceKey, number> {
  return { social: 0, pension: 0, work: 0, other: 0 };
}

/**
 * Project the whole of retirement, source by source.
 *
 * Null on ages out of order or outside 0–120, a span over 100 years,
 * negative money, or any rate outside −100–100%. Ages must be integers: a
 * projection stepping by whole years cannot start half way through one.
 */
export function projectIncomeSources(
  input: RetirementIncomeSourcesInput,
): RetirementIncomeSourcesResult | null {
  const {
    startAge,
    endAge,
    annualNeed,
    inflationPercent,
    portfolioBalance,
    portfolioReturnPercent,
    sources,
  } = input;

  for (const age of [startAge, endAge]) {
    if (!Number.isFinite(age) || !Number.isInteger(age)) return null;
    if (age < 0 || age > AGE_LIMIT) return null;
  }
  if (endAge <= startAge) return null;
  if (endAge - startAge > MAX_SPAN) return null;

  if (!Number.isFinite(annualNeed) || annualNeed < 0) return null;
  if (!Number.isFinite(portfolioBalance) || portfolioBalance < 0) return null;
  for (const rate of [inflationPercent, portfolioReturnPercent]) {
    if (!Number.isFinite(rate) || rate < -100 || rate > 100) return null;
  }
  for (const key of INCOME_SOURCE_KEYS) {
    const source = sources[key];
    if (source === undefined) return null;
    if (!Number.isFinite(source.annualAmount) || source.annualAmount < 0) {
      return null;
    }
    if (
      !Number.isFinite(source.indexationPercent) ||
      source.indexationPercent < -100 ||
      source.indexationPercent > 100
    ) {
      return null;
    }
    if (
      !Number.isFinite(source.throughAge) ||
      !Number.isInteger(source.throughAge) ||
      source.throughAge < 0 ||
      source.throughAge > AGE_LIMIT
    ) {
      return null;
    }
  }

  const inflation = inflationPercent / 100;
  const portfolioReturn = portfolioReturnPercent / 100;

  const years: IncomeYear[] = [];
  let balance = portfolioBalance;
  let depletionAge: number | null = null;
  let firstUnmetAge: number | null = null;
  let totalWithdrawn = 0;
  const realTotalBySource = zeroBySource();
  let realTotalFixedIncome = 0;
  let realTotalWithdrawn = 0;
  let realTotalNeed = 0;
  let realTotalUnmet = 0;

  for (let age = startAge; age < endAge; age += 1) {
    const elapsed = age - startAge;
    // Two deflators, for the same reason retirement.ts has two: the flows
    // all move at the START of the year and the balance is an end-of-year
    // figure, so they are one year of inflation apart.
    const flowDeflator = Math.pow(1 + inflation, elapsed);
    const balanceDeflator = Math.pow(1 + inflation, elapsed + 1);

    const need = annualNeed * flowDeflator;

    const bySource = zeroBySource();
    const realBySource = zeroBySource();
    let fixedIncome = 0;
    for (const key of INCOME_SOURCE_KEYS) {
      const source = sources[key];
      if (age > source.throughAge) continue;
      // Each source compounds at its OWN rate from the first year. A level
      // payment (0%) therefore stays level in nominal terms and shrinks in
      // real terms, which is the whole point of the module.
      const amount =
        source.annualAmount * Math.pow(1 + source.indexationPercent / 100, elapsed);
      bySource[key] = amount;
      realBySource[key] = amount / flowDeflator;
      fixedIncome += amount;
    }

    const gap = Math.max(0, need - fixedIncome);
    const withdrawal = Math.min(balance, gap);
    const unmet = gap - withdrawal;

    balance -= withdrawal;
    // Return on what REMAINS after the year's spending.
    balance += balance * portfolioReturn;
    // A negative return can take the balance below zero; a portfolio cannot
    // owe money, so floor it. Without this floor a −100% return year would
    // leave a negative balance that then "recovered".
    if (balance < 0) balance = 0;

    totalWithdrawn += withdrawal;
    realTotalWithdrawn += withdrawal / flowDeflator;
    realTotalNeed += need / flowDeflator;
    realTotalUnmet += unmet / flowDeflator;
    realTotalFixedIncome += fixedIncome / flowDeflator;
    for (const key of INCOME_SOURCE_KEYS) {
      realTotalBySource[key] += bySource[key] / flowDeflator;
    }

    if (depletionAge === null && balance <= 0 && gap > 0) depletionAge = age;
    if (firstUnmetAge === null && unmet > 0) firstUnmetAge = age;

    years.push({
      age,
      need,
      bySource,
      fixedIncome,
      gap,
      withdrawal,
      unmet,
      balance,
      realNeed: need / flowDeflator,
      realBySource,
      realFixedIncome: fixedIncome / flowDeflator,
      realWithdrawal: withdrawal / flowDeflator,
      realUnmet: unmet / flowDeflator,
      realBalance: balance / balanceDeflator,
      fixedCoveragePercent: need === 0 ? null : (fixedIncome / need) * 100,
      totalCoveragePercent:
        need === 0 ? null : ((fixedIncome + withdrawal) / need) * 100,
    });
  }

  const first = years[0];
  const last = years[years.length - 1];

  // What indexation was worth, per source: the real value of the last
  // payment against the real value of the first. Null rather than zero for a
  // source that has ended, because "stopped paying" and "lost all its value"
  // are different facts and a page must not render them the same way.
  const realValueKeptPercent = {} as Record<IncomeSourceKey, number | null>;
  for (const key of INCOME_SOURCE_KEYS) {
    const firstReal = first.realBySource[key];
    realValueKeptPercent[key] =
      firstReal <= 0 || last.realBySource[key] <= 0
        ? null
        : (last.realBySource[key] / firstReal) * 100;
  }

  return {
    years,
    first,
    last,
    depletionAge,
    firstUnmetAge,
    realValueKeptPercent,
    realTotalBySource,
    realTotalFixedIncome,
    realTotalWithdrawn,
    realTotalNeed,
    realTotalUnmet,
    initialWithdrawalRatePercent:
      portfolioBalance <= 0 ? null : (first.withdrawal / portfolioBalance) * 100,
    totalWithdrawn,
    finalBalance: last.balance,
  };
}
