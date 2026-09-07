/**
 * Saving for tuition, for /cong-cu/tiet-kiem-hoc-phi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `education-savings.test.ts`.
 *
 * Two compounding rates run against each other here, and that is the whole
 * difficulty: tuition inflates while savings grow. A tool that ignored the
 * first would understate the target badly, because education costs have
 * historically risen faster than general inflation.
 *
 * The target is NOT one number at one date. Tuition is paid once per year of
 * study, each year at a higher price, so the goal is a stream. The module
 * therefore:
 *
 * 1. inflates today's annual tuition to each year it will actually be paid;
 * 2. discounts those payments back to the START OF STUDY at the investment
 *    return — because money not yet spent keeps earning;
 * 3. treats that present value as the balance needed on day one of study.
 *
 * Step 2 is what a naive "add up the inflated years" version gets wrong, and
 * it overstates the requirement by a wide margin on a four-year course.
 *
 * Years are counted from today: `yearsUntilStart` is the wait, and study runs
 * for `yearsOfStudy` after it. All rates are annual; contributions are
 * monthly and land at the end of each month, matching `savings-goal.ts`.
 */

export type EducationSavingsInput = {
  /** Annual tuition at TODAY's prices, in đồng. */
  annualTuitionToday: number;
  /** Years from now until study starts. May be 0 — study starts now. */
  yearsUntilStart: number;
  /** How many years the course runs. */
  yearsOfStudy: number;
  /** Tuition inflation, in percent per year. */
  tuitionInflationPercent?: number;
  /** What is saved already, in đồng. */
  currentSavings?: number;
  /** Return on savings, in percent per year. */
  investmentReturnPercent?: number;
};

export type TuitionYear = {
  /** 1-based year of study. */
  year: number;
  /** Whole years from today until this payment. */
  yearsFromNow: number;
  /** Tuition due that year, after inflation. */
  tuition: number;
  /** That payment discounted back to the start of study. */
  presentValueAtStart: number;
};

export type EducationSavingsResult = {
  /** One row per year of study. */
  years: TuitionYear[];
  /** Every inflated tuition payment added up, undiscounted. */
  totalTuitionNominal: number;
  /**
   * Balance needed on day one of study: the tuition stream discounted back
   * to that date at the investment return.
   */
  targetAtStart: number;
  /** What today's savings grow to by the start of study. */
  currentSavingsAtStart: number;
  /** `targetAtStart − currentSavingsAtStart`, floored at 0. */
  shortfallAtStart: number;
  /** Monthly contribution that closes the shortfall by the start of study. */
  monthlyContribution: number;
  /** Months available to save. */
  monthsToSave: number;
  /** Total of those contributions. */
  totalContributions: number;
  /** How much of the target the investment return provides. */
  interestEarned: number;
  /** True when today's savings already cover the target. */
  alreadyFunded: boolean;
  /**
   * True when study starts now, so there is no time to save. The target and
   * shortfall are still meaningful; the monthly contribution is not, and
   * comes back as 0.
   */
  noTimeToSave: boolean;
};

/**
 * Work out what a course will cost and what it takes to fund it.
 *
 * Null when the inputs cannot describe a plan: a non-positive tuition or
 * length of study, a negative wait or amount, a non-integer number of years,
 * a rate at or below −100%, or any non-finite number.
 */
export function computeEducationSavings(
  input: EducationSavingsInput,
): EducationSavingsResult | null {
  const {
    annualTuitionToday,
    yearsUntilStart,
    yearsOfStudy,
    tuitionInflationPercent = 0,
    currentSavings = 0,
    investmentReturnPercent = 0,
  } = input;

  const nonNegative = [
    annualTuitionToday,
    yearsUntilStart,
    yearsOfStudy,
    currentSavings,
  ];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  const rates = [tuitionInflationPercent, investmentReturnPercent];
  if (rates.some((value) => !Number.isFinite(value) || value <= -100)) {
    return null;
  }
  if (annualTuitionToday <= 0 || yearsOfStudy <= 0) return null;
  if (!Number.isInteger(yearsUntilStart) || !Number.isInteger(yearsOfStudy)) {
    return null;
  }

  const inflation = tuitionInflationPercent / 100;
  const growth = investmentReturnPercent / 100;

  const years: TuitionYear[] = [];
  let totalTuitionNominal = 0;
  let targetAtStart = 0;

  for (let year = 1; year <= yearsOfStudy; year += 1) {
    // Paid at the start of each year of study, so year 1 is paid at
    // `yearsUntilStart` and is not discounted back any further.
    const yearsFromNow = yearsUntilStart + (year - 1);
    const tuition = annualTuitionToday * (1 + inflation) ** yearsFromNow;
    // Discounted to the START OF STUDY, not to today: this is the balance
    // needed on day one, and later years keep earning until they are spent.
    const presentValueAtStart = tuition / (1 + growth) ** (year - 1);
    if (!Number.isFinite(tuition) || !Number.isFinite(presentValueAtStart)) {
      return null;
    }
    totalTuitionNominal += tuition;
    targetAtStart += presentValueAtStart;
    years.push({ year, yearsFromNow, tuition, presentValueAtStart });
  }

  const currentSavingsAtStart =
    currentSavings * (1 + growth) ** yearsUntilStart;
  if (!Number.isFinite(currentSavingsAtStart)) return null;

  const shortfallAtStart = Math.max(0, targetAtStart - currentSavingsAtStart);
  const monthsToSave = yearsUntilStart * 12;

  // The contribution that turns the shortfall into zero by the start date.
  // End-of-month contributions, matching savings-goal.ts.
  const monthlyRate = (1 + growth) ** (1 / 12) - 1;
  let monthlyContribution = 0;
  if (monthsToSave > 0 && shortfallAtStart > 0) {
    monthlyContribution =
      monthlyRate === 0
        ? shortfallAtStart / monthsToSave
        : (shortfallAtStart * monthlyRate) /
          ((1 + monthlyRate) ** monthsToSave - 1);
    if (!Number.isFinite(monthlyContribution)) return null;
  }

  const totalContributions = monthlyContribution * monthsToSave;

  return {
    years,
    totalTuitionNominal,
    targetAtStart,
    currentSavingsAtStart,
    shortfallAtStart,
    monthlyContribution,
    monthsToSave,
    totalContributions,
    // What the return contributes: everything the target is made of that the
    // saver did not put in.
    interestEarned: targetAtStart - currentSavings - totalContributions,
    alreadyFunded: shortfallAtStart <= 0,
    noTimeToSave: monthsToSave === 0,
  };
}
