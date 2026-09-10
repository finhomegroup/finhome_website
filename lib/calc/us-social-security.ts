/**
 * United States Social Security retirement benefits.
 *
 * The engine behind the three Social Security pages. It has two halves with
 * very different risk profiles, and the split matters:
 *
 * **The claiming-age arithmetic is stable statute.** Full retirement age by
 * year of birth, the reduction for claiming early and the credit for
 * claiming late have not changed since the 1983 amendments and are not
 * indexed to anything. Nothing here goes stale.
 *
 * **The PIA formula's bend points are indexed every year.** They live in one
 * dated table keyed by ELIGIBILITY year — the year the worker turns 62, not
 * the year they claim — and an eligibility year the table does not cover
 * returns null rather than borrowing another year's figures. Per
 * docs/calculator-suite-status.md §8 a stale threshold produces a
 * confidently wrong answer for exactly the readers near a boundary, and
 * these bend points cannot be derived from anything else: the Social
 * Security wage base moves on the same average-wage index but rounds to the
 * nearest 300 USD, which does not pin the index closely enough to recover
 * the bend points. A year is added here only with its published figures.
 *
 * That is why only one of the three pages needs the table at all. The other
 * two take the PIA as an input, because the reader's own Social Security
 * statement prints it — and a figure read off a statement is better than one
 * this module reconstructs from an earnings history it cannot see.
 *
 * ## Two roundings that are statutory, not cosmetic
 *
 * The PIA is rounded DOWN to the next lower ten cents, and a monthly benefit
 * amount is rounded DOWN to the next lower dollar. Both are in the
 * regulations, both are always downward, and leaving them out puts a page a
 * dollar or two above what the cheque will actually say.
 *
 * ## Not modelled
 *
 * Cost-of-living adjustments after eligibility, so every figure is in the
 * money of the eligibility year. Survivor benefits, which can reach 100% of
 * the deceased worker's benefit. The windfall elimination and government
 * pension offset provisions, both repealed for benefits payable from
 * January 2024. Taxation of benefits, which depends on total income.
 */

export type BendPointYear = {
  /** The year the formula's figures were published for. */
  year: number;
  /** 90% applies up to here. */
  firstBendPoint: number;
  /** 32% applies between the two; 15% above the second. */
  secondBendPoint: number;
  /**
   * Earnings above this paid no Social Security tax that year and so do not
   * count toward the benefit either. Held here because the AIME estimate
   * needs it; `us-payroll.ts` holds the same figure for the years the two
   * tables overlap, and the test asserts they agree.
   */
  taxableMaximum: number;
};

/**
 * PIA bend points by eligibility year, as published by the SSA.
 *
 * Two years only, and deliberately so — see the module docstring. Adding a
 * year means transcribing that year's two published figures, not
 * interpolating them.
 */
export const BEND_POINTS: Record<number, BendPointYear> = {
  2024: {
    year: 2024,
    firstBendPoint: 1_174,
    secondBendPoint: 7_078,
    taxableMaximum: 168_600,
  },
  2025: {
    year: 2025,
    firstBendPoint: 1_226,
    secondBendPoint: 7_391,
    taxableMaximum: 176_100,
  },
};

export const BEND_POINT_YEAR_ORDER = [2025, 2024] as const;

/** The three PIA replacement rates. Fixed in statute, never indexed. */
export const PIA_RATES = { first: 90, second: 32, third: 15 } as const;

/**
 * Retirement earnings test exempt amounts for 2025, in USD a year.
 *
 * Indexed annually. Prefilled as this page's defaults WITH the year stated
 * in the copy and bound to these constants by a test, which is the pattern
 * `bat-dong-san-cho-thue` adopted after a prefilled tax threshold shipped
 * two revisions stale (docs §8 defect 8). Both are inputs, so a correction
 * is a one-line default change.
 */
export const EARNINGS_TEST = {
  year: 2025,
  /** Below full retirement age: 1 USD withheld per 2 USD above this. */
  underFraAnnual: 23_400,
  /** In the year full retirement age is reached: 1 USD per 3 USD above this. */
  fraYearAnnual: 62_160,
  underFraWithholdingRatio: 2,
  fraYearWithholdingRatio: 3,
} as const;

/** Earliest and latest a retirement benefit may be claimed. */
export const EARLIEST_CLAIM_AGE = 62;
export const LATEST_CLAIM_AGE = 70;

/** Reduction per month for the first 36 months before full retirement age. */
const EARLY_FIRST_36_PERCENT = 5 / 9;
/** Reduction per month beyond those 36. */
const EARLY_BEYOND_36_PERCENT = 5 / 12;
/** Delayed retirement credit per month after full retirement age. */
const DELAYED_PERCENT = 2 / 3;
/** Spousal reduction per month for the first 36 months. */
const SPOUSAL_FIRST_36_PERCENT = 25 / 36;
/** The most a spousal benefit can be, as a percent of the worker's PIA. */
export const SPOUSAL_MAX_PERCENT = 50;

/**
 * A float residue below a nanodollar is not an amount below the dime.
 *
 * Both statutory roundings are downward, so a value that should be exactly
 * 1.234,60 but arrives as 1.234,5999999999999 would round to 1.234,50 — a
 * ten-cent error created by float representation rather than by the
 * regulation. The nudge is nine orders of magnitude below the smallest unit
 * either rounding works in, so it cannot change a genuine boundary.
 */
const ROUNDING_EPSILON = 1e-9;

/** Round down to the next lower ten cents, as the PIA regulation requires. */
export function roundDownToDime(value: number): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.floor(value * 10 + ROUNDING_EPSILON) / 10;
}

/** Round down to the next lower dollar, as a monthly benefit amount is. */
export function roundDownToDollar(value: number): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.floor(value + ROUNDING_EPSILON);
}

/**
 * Full retirement age, in MONTHS, by year of birth.
 *
 * Months rather than years because the schedule moves in two-month steps for
 * two cohorts, and a benefit claimed one month early is reduced. Working in
 * years would force a rounding decision that the statute does not make.
 *
 * The 1937-and-earlier and 1960-and-later ends are flat, so this is defined
 * for every birth year.
 */
export function fullRetirementAgeMonths(birthYear: number): number {
  if (!Number.isFinite(birthYear)) return 67 * 12;
  if (birthYear <= 1937) return 65 * 12;
  if (birthYear <= 1942) return 65 * 12 + (birthYear - 1937) * 2;
  if (birthYear <= 1954) return 66 * 12;
  if (birthYear <= 1959) return 66 * 12 + (birthYear - 1954) * 2;
  return 67 * 12;
}

/**
 * A worker's own benefit as a percent of their PIA, for a claim at
 * `claimMonths` of age.
 *
 * Null outside 62–70, which are the ages the statute allows.
 *
 * The early reduction is in two tiers — 5/9 of 1% for the first 36 months
 * and 5/12 of 1% beyond them — and using one rate for the whole span is the
 * classic error. At a full retirement age of 67 the one-rate reading gives
 * 66,67% at 62 instead of the correct 70%.
 */
export function benefitFactorPercent(
  fraMonths: number,
  claimMonths: number,
): number | null {
  if (!Number.isFinite(fraMonths) || !Number.isFinite(claimMonths)) return null;
  if (claimMonths < EARLIEST_CLAIM_AGE * 12) return null;
  if (claimMonths > LATEST_CLAIM_AGE * 12) return null;

  if (claimMonths < fraMonths) {
    const early = fraMonths - claimMonths;
    const firstTier = Math.min(early, 36);
    const secondTier = Math.max(0, early - 36);
    return (
      100 -
      firstTier * EARLY_FIRST_36_PERCENT -
      secondTier * EARLY_BEYOND_36_PERCENT
    );
  }
  // Delayed credits accrue to 70 and then stop. Claiming at 71 would earn
  // nothing more, which is why the ceiling above is a rejection rather than
  // a cap: a page must not quietly price a claim the statute does not allow.
  return 100 + (claimMonths - fraMonths) * DELAYED_PERCENT;
}

/**
 * A spousal benefit as a percent of the WORKER's PIA.
 *
 * Two differences from a worker's own benefit, both easy to miss: the
 * maximum is half the worker's PIA rather than all of it, and there are NO
 * delayed retirement credits — waiting past full retirement age adds
 * nothing. The early reduction also uses a different first tier, 25/36 of
 * 1% a month.
 */
export function spousalFactorPercent(
  spouseFraMonths: number,
  spouseClaimMonths: number,
): number | null {
  if (!Number.isFinite(spouseFraMonths) || !Number.isFinite(spouseClaimMonths)) {
    return null;
  }
  if (spouseClaimMonths < EARLIEST_CLAIM_AGE * 12) return null;
  if (spouseClaimMonths > LATEST_CLAIM_AGE * 12) return null;

  if (spouseClaimMonths >= spouseFraMonths) return SPOUSAL_MAX_PERCENT;

  const early = spouseFraMonths - spouseClaimMonths;
  const firstTier = Math.min(early, 36);
  const secondTier = Math.max(0, early - 36);
  const reduction =
    firstTier * SPOUSAL_FIRST_36_PERCENT + secondTier * EARLY_BEYOND_36_PERCENT;
  return SPOUSAL_MAX_PERCENT * ((100 - reduction) / 100);
}

/**
 * Years of earnings the benefit formula averages over. Fixed in statute.
 *
 * The divisor is always 35 — years with no earnings enter the average as
 * ZEROS. That is why a 25-year career does not produce 25/25 of the average
 * but 25/35 of it, and it is the single most misunderstood part of the
 * formula.
 */
export const AVERAGING_YEARS = 35;

export type AimeEstimate = {
  /** Average annual earnings after the taxable maximum is applied. */
  cappedEarnings: number;
  /** True when earnings were cut by the taxable maximum. */
  cappedByTaxableMaximum: boolean;
  /** Years counted, never more than 35. */
  yearsCounted: number;
  /** Years entering the average as zeros. */
  zeroYears: number;
  /** The estimate itself. */
  aime: number;
};

/**
 * Estimate AIME from average annual earnings and a career length.
 *
 * A reader knows roughly what they earn; almost nobody knows their AIME, and
 * the Social Security statement does not print it. So this converts.
 *
 * Two things it applies that a naive division does not. Earnings above the
 * taxable maximum paid no Social Security tax and do not count toward the
 * benefit, so they are cut. And the divisor is 35 whatever the career
 * length, so a short career is averaged against zeros rather than against
 * itself.
 *
 * It is an ESTIMATE, and the page says so: the real figure indexes each
 * year's earnings to the wage level of the year the worker turns 60 and
 * takes the highest 35 of them, which needs an earnings history this module
 * cannot see. Entering earnings in today's money is what makes the
 * approximation reasonable, because the indexing does the same job.
 *
 * Null on negative earnings, a negative or non-integer career length, or an
 * unknown formula year.
 */
export function aimeFromEarnings(
  averageAnnualEarnings: number,
  yearsWorked: number,
  formulaYear: number,
): AimeEstimate | null {
  const params = BEND_POINTS[formulaYear];
  if (params === undefined) return null;
  if (!Number.isFinite(averageAnnualEarnings) || averageAnnualEarnings < 0) {
    return null;
  }
  if (!Number.isFinite(yearsWorked) || !Number.isInteger(yearsWorked)) {
    return null;
  }
  if (yearsWorked < 0 || yearsWorked > 70) return null;

  const cappedEarnings = Math.min(averageAnnualEarnings, params.taxableMaximum);
  const yearsCounted = Math.min(yearsWorked, AVERAGING_YEARS);
  return {
    cappedEarnings,
    cappedByTaxableMaximum: averageAnnualEarnings > params.taxableMaximum,
    yearsCounted,
    zeroYears: AVERAGING_YEARS - yearsCounted,
    aime: (cappedEarnings * yearsCounted) / AVERAGING_YEARS / 12,
  };
}

export type PiaBreakdown = {
  params: BendPointYear;
  /** Portion of AIME in each of the three tiers. */
  firstTierAime: number;
  secondTierAime: number;
  thirdTierAime: number;
  /** What each tier contributes to the PIA. */
  firstTierPia: number;
  secondTierPia: number;
  thirdTierPia: number;
  /** The sum, rounded down to the next lower dime as the regulation requires. */
  pia: number;
  /** PIA as a percent of AIME — the replacement rate. */
  replacementRatePercent: number | null;
  /** What the next dollar of AIME would add to the PIA, in cents. */
  marginalRatePercent: number;
};

/**
 * Primary insurance amount from average indexed monthly earnings.
 *
 * Null on a negative AIME or an eligibility year the table does not cover.
 *
 * The formula is deliberately regressive: 90% of the first tier, 32% of the
 * next, 15% above. A worker with ten times another's AIME does not get ten
 * times the benefit, and the marginal rate is reported so a page can say so
 * with a number.
 */
export function piaFromAime(
  aime: number,
  eligibilityYear: number,
): PiaBreakdown | null {
  const params = BEND_POINTS[eligibilityYear];
  if (params === undefined) return null;
  if (!Number.isFinite(aime) || aime < 0) return null;

  const { firstBendPoint, secondBendPoint } = params;

  const firstTierAime = Math.min(aime, firstBendPoint);
  const secondTierAime = Math.max(
    0,
    Math.min(aime, secondBendPoint) - firstBendPoint,
  );
  const thirdTierAime = Math.max(0, aime - secondBendPoint);

  const firstTierPia = firstTierAime * (PIA_RATES.first / 100);
  const secondTierPia = secondTierAime * (PIA_RATES.second / 100);
  const thirdTierPia = thirdTierAime * (PIA_RATES.third / 100);

  const pia = roundDownToDime(firstTierPia + secondTierPia + thirdTierPia);

  return {
    params,
    firstTierAime,
    secondTierAime,
    thirdTierAime,
    firstTierPia,
    secondTierPia,
    thirdTierPia,
    pia,
    replacementRatePercent: aime <= 0 ? null : (pia / aime) * 100,
    // Which tier the NEXT dollar falls in. At exactly a bend point the next
    // dollar is in the tier ABOVE it, so both comparisons are >=.
    marginalRatePercent:
      aime >= secondBendPoint
        ? PIA_RATES.third
        : aime >= firstBendPoint
          ? PIA_RATES.second
          : PIA_RATES.first,
  };
}

export type EarningsTestResult = {
  /** Wages above the exempt amount. */
  excessEarnings: number;
  /** Benefit withheld this year. Never more than the benefit itself. */
  withheld: number;
  /** Benefit actually paid this year, after the withholding. */
  paid: number;
  /** Which exempt amount applied. */
  exemptAmount: number;
  /** 2 below full retirement age, 3 in the year it is reached. */
  withholdingRatio: number;
  /** True when the test does not apply at all — from full retirement age. */
  exempt: boolean;
};

/**
 * The retirement earnings test.
 *
 * A benefit claimed before full retirement age is withheld against earned
 * income: 1 USD for every 2 above the exempt amount, or every 3 in the year
 * full retirement age is reached. From that age the test stops entirely.
 *
 * The withholding is NOT a permanent loss — the benefit is recomputed
 * upward at full retirement age to give back what was withheld — but this
 * function reports the cash effect of the year in question, and the page
 * says what happens afterwards.
 *
 * Null on negative money or a non-positive ratio.
 */
export function earningsTestWithholding(input: {
  /** Benefit otherwise payable this year, in USD. */
  annualBenefit: number;
  /** Earned income this year. Investment income does not count. */
  annualEarnings: number;
  /** Exempt amount for the year, in USD. */
  exemptAmount: number;
  /** 2 below full retirement age, 3 in the year it is reached. */
  withholdingRatio: number;
  /** True from full retirement age, when the test no longer applies. */
  atOrAboveFra: boolean;
}): EarningsTestResult | null {
  const {
    annualBenefit,
    annualEarnings,
    exemptAmount,
    withholdingRatio,
    atOrAboveFra,
  } = input;

  if (!Number.isFinite(annualBenefit) || annualBenefit < 0) return null;
  if (!Number.isFinite(annualEarnings) || annualEarnings < 0) return null;
  if (!Number.isFinite(exemptAmount) || exemptAmount < 0) return null;
  if (!Number.isFinite(withholdingRatio) || withholdingRatio <= 0) return null;

  if (atOrAboveFra) {
    return {
      excessEarnings: 0,
      withheld: 0,
      paid: annualBenefit,
      exemptAmount,
      withholdingRatio,
      exempt: true,
    };
  }

  const excessEarnings = Math.max(0, annualEarnings - exemptAmount);
  // Capped at the benefit: the test withholds a benefit, it does not create
  // a debt. Without the cap a high earner would show a negative payment.
  const withheld = Math.min(annualBenefit, excessEarnings / withholdingRatio);

  return {
    excessEarnings,
    withheld,
    paid: annualBenefit - withheld,
    exemptAmount,
    withholdingRatio,
    exempt: false,
  };
}

export type ClaimingOption = {
  /** Whole age in years. */
  age: number;
  /** Age in months, which is what the factor is computed from. */
  months: number;
  /** Percent of PIA this claim receives. */
  factorPercent: number;
  monthlyBenefit: number;
  annualBenefit: number;
  /** True at exactly full retirement age. */
  isFullRetirementAge: boolean;
  /** Months early (negative) or late (positive) relative to that age. */
  monthsFromFra: number;
};

/**
 * The whole menu: what a claim at each whole age from 62 to 70 pays.
 *
 * Every page in this tier shows this, so it is computed once here. Whole
 * ages only — a claim can be made in any month, and offering all 97 of them
 * would bury the nine decisions a reader is actually choosing between.
 *
 * Null on a negative PIA.
 */
export function claimingSchedule(
  pia: number,
  fraMonths: number,
): ClaimingOption[] | null {
  if (!Number.isFinite(pia) || pia < 0) return null;
  if (!Number.isFinite(fraMonths)) return null;

  const options: ClaimingOption[] = [];
  for (let age = EARLIEST_CLAIM_AGE; age <= LATEST_CLAIM_AGE; age += 1) {
    const months = age * 12;
    const factorPercent = benefitFactorPercent(fraMonths, months);
    if (factorPercent === null) continue;
    const monthlyBenefit = roundDownToDollar(pia * (factorPercent / 100));
    options.push({
      age,
      months,
      factorPercent,
      monthlyBenefit,
      annualBenefit: monthlyBenefit * 12,
      isFullRetirementAge: months === fraMonths,
      monthsFromFra: months - fraMonths,
    });
  }
  return options;
}

/** Format a month count as whole years and months, for a page to render. */
export function splitAgeMonths(months: number): { years: number; months: number } {
  return { years: Math.floor(months / 12), months: months % 12 };
}

export type HouseholdBenefit = {
  /** What the worker is paid, after their own claiming adjustment. */
  workerMonthly: number;
  /** The spouse's benefit on their OWN record, at their claiming age. */
  spouseOwnMonthly: number;
  /**
   * The spousal benefit: up to half the worker's PIA, adjusted for the
   * SPOUSE's claiming age. Computed from the worker's PIA and NOT from the
   * worker's reduced or increased benefit — which is the rule most people
   * get wrong, and the reason a worker claiming early does not cut this.
   */
  spousalMonthly: number;
  /** What the spouse actually receives: the greater of the two. */
  spouseReceivesMonthly: number;
  /** True when the spousal top-up is what they are actually paid. */
  spouseOnSpousalBenefit: boolean;
  householdMonthly: number;
  householdAnnual: number;
  /**
   * What a survivor would receive: the greater of the two ACTUAL benefits.
   * Unlike the spousal benefit this one does follow the worker's claiming
   * decision, which is why claiming early has an effect that outlives the
   * worker.
   *
   * Simplified: a survivor claiming before their own full retirement age is
   * reduced on a schedule this module does not carry, and survivor benefits
   * can start as early as 60. Every figure here is the at-or-after-FRA case.
   */
  survivorMonthly: number;
};

/**
 * What a couple is actually paid.
 *
 * Two asymmetries decide most of the answer, and both are counter-intuitive:
 *
 * - A spousal benefit is half the worker's PIA, adjusted only for the
 *   SPOUSE's claiming age. The worker claiming at 62 cuts their own benefit
 *   by 30% and does not touch the spousal one.
 * - A spousal benefit earns NO delayed retirement credit. A spouse waiting
 *   past full retirement age gains nothing on that record, while their own
 *   record would gain 8% a year.
 *
 * Null on a negative PIA or a claiming age outside 62–70 for either person.
 */
export function householdBenefit(input: {
  /** The worker's primary insurance amount, in USD a month. */
  pia: number;
  workerFraMonths: number;
  workerClaimMonths: number;
  /** The spouse's own PIA. Zero when they have no record of their own. */
  spousePia: number;
  spouseFraMonths: number;
  spouseClaimMonths: number;
}): HouseholdBenefit | null {
  const {
    pia,
    workerFraMonths,
    workerClaimMonths,
    spousePia,
    spouseFraMonths,
    spouseClaimMonths,
  } = input;

  if (!Number.isFinite(pia) || pia < 0) return null;
  if (!Number.isFinite(spousePia) || spousePia < 0) return null;

  const workerFactor = benefitFactorPercent(workerFraMonths, workerClaimMonths);
  const spouseOwnFactor = benefitFactorPercent(spouseFraMonths, spouseClaimMonths);
  const spousalFactor = spousalFactorPercent(spouseFraMonths, spouseClaimMonths);
  if (workerFactor === null || spouseOwnFactor === null || spousalFactor === null) {
    return null;
  }

  const workerMonthly = roundDownToDollar(pia * (workerFactor / 100));
  const spouseOwnMonthly = roundDownToDollar(spousePia * (spouseOwnFactor / 100));
  const spousalMonthly = roundDownToDollar(pia * (spousalFactor / 100));

  const spouseReceivesMonthly = Math.max(spouseOwnMonthly, spousalMonthly);

  return {
    workerMonthly,
    spouseOwnMonthly,
    spousalMonthly,
    spouseReceivesMonthly,
    spouseOnSpousalBenefit: spousalMonthly > spouseOwnMonthly,
    householdMonthly: workerMonthly + spouseReceivesMonthly,
    householdAnnual: (workerMonthly + spouseReceivesMonthly) * 12,
    survivorMonthly: Math.max(workerMonthly, spouseOwnMonthly),
  };
}
