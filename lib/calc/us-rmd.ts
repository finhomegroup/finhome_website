/**
 * United States required minimum distributions.
 *
 * From an age set by statute, the holder of a traditional IRA or 401(k) must
 * take a minimum amount out every year and pay income tax on it. The amount
 * is the prior 31 December balance divided by a divisor from the IRS Uniform
 * Lifetime Table, and the divisor falls every year — so the REQUIRED
 * percentage rises every year, from 3,77% at 73 to over 15% by 100.
 *
 * ## The thing this tool exists to show
 *
 * People assume an RMD drains the account. For the first decade and a half
 * it usually does not: while the required percentage is small enough the
 * balance keeps growing, and it only turns over when the two cross. The
 * projection makes the crossing visible rather than asserting it, because
 * where it falls depends entirely on the return assumed.
 *
 * The crossing is NOT where the required percentage reaches the return. The
 * distribution comes out before the year's return is credited, so
 *
 *     closing = opening x (1 - 1/divisor) x (1 + r)
 *
 * and the balance grows while `1/divisor < r / (1 + r)`. At a 7% return that
 * threshold is 6,54%, not 7%, so the account turns over a year earlier than
 * a reader comparing the draw with the raw return would predict. The test
 * sweeps that relation across six returns rather than pinning one crossing.
 *
 * ## The vendored table
 *
 * `UNIFORM_LIFETIME` is transcribed from the Uniform Lifetime Table in effect
 * from 2022, which replaced an older table with shorter life expectancies and
 * therefore larger required draws. Transcribed constants are a defect class
 * of their own in this repo — docs/calculator-suite-status.md §8 — so the
 * test asserts the table's internal shape as well as spot values: contiguous
 * ages, every divisor positive, strictly falling with age, and therefore a
 * strictly rising required percentage. A single mistyped digit breaks the
 * monotonicity check even when the value looks plausible.
 *
 * ## Not modelled, and stated rather than hidden
 *
 * The Joint Life and Last Survivor table, which applies when the sole
 * beneficiary is a spouse more than ten years younger. It gives a LARGER
 * divisor and therefore a SMALLER required draw, so every figure here is an
 * upper bound for that case. It is a two-dimensional table and vendoring it
 * would multiply the transcription surface by fifty.
 *
 * Inherited accounts, which follow different rules entirely, and the
 * aggregation rules — IRAs may be aggregated and satisfied from one account,
 * 401(k)s may not.
 */

export type RmdDivisorTable = Record<number, number>;

/**
 * IRS Uniform Lifetime Table, in effect from 2022. Age 120 is the last row
 * and applies to every age from 120 up.
 */
export const UNIFORM_LIFETIME: RmdDivisorTable = {
  72: 27.4,
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4,
  101: 6.0,
  102: 5.6,
  103: 5.2,
  104: 4.9,
  105: 4.6,
  106: 4.3,
  107: 4.1,
  108: 3.9,
  109: 3.7,
  110: 3.5,
  111: 3.4,
  112: 3.3,
  113: 3.1,
  114: 3.0,
  115: 2.9,
  116: 2.8,
  117: 2.7,
  118: 2.5,
  119: 2.3,
  120: 2.0,
};

export const TABLE_FIRST_AGE = 72;
export const TABLE_LAST_AGE = 120;

/** Excise tax on an RMD that was not taken. */
export const SHORTFALL_PENALTY_PERCENT = 25;
/** The same penalty if corrected inside the statutory window. */
export const CORRECTED_PENALTY_PERCENT = 10;

/**
 * The age at which distributions must begin, by year of birth.
 *
 * SECURE 2.0 moved it twice. The 1959 cohort sits in a genuine drafting
 * ambiguity in the statute — read one way they get 73, another way 75 — and
 * the proposed regulations resolve it at 73, which is what this follows.
 * Anyone born in 1959 should confirm rather than rely on this.
 */
export function rmdStartAge(birthYear: number): number {
  if (!Number.isFinite(birthYear)) return 73;
  if (birthYear <= 1950) return 72;
  if (birthYear <= 1959) return 73;
  return 75;
}

/** The divisor for an age, or null below the table's first row. */
export function lifetimeDivisor(age: number): number | null {
  if (!Number.isFinite(age) || age < TABLE_FIRST_AGE) return null;
  // The last row applies to every age from 120 up.
  const key = Math.min(Math.floor(age), TABLE_LAST_AGE);
  return UNIFORM_LIFETIME[key] ?? null;
}

export type RmdInput = {
  /** Year of birth, which decides when distributions must begin. */
  birthYear: number;
  /** Age now. */
  currentAge: number;
  /** Balance on the prior 31 December, in USD. */
  balance: number;
  /** Expected annual return, in percent. */
  returnPercent: number;
  /** Age the projection stops. Exclusive. */
  endAge: number;
  /** Marginal income tax rate on the distribution, in percent. */
  marginalRatePercent: number;
  /**
   * What the holder actually plans to take this year, in USD. Below the
   * required amount the difference attracts the excise tax.
   */
  plannedWithdrawal: number;
};

export type RmdYear = {
  age: number;
  /** Balance at the start of the year, before the distribution. */
  openingBalance: number;
  /** Null before distributions are required. */
  divisor: number | null;
  /** Required this year. Zero before the start age. */
  required: number;
  /** Required as a percent of the opening balance. Null when none is required. */
  requiredPercent: number | null;
  tax: number;
  /** Balance after the distribution and the year's return. */
  closingBalance: number;
  /** True when the balance ends the year higher than it started. */
  stillGrowing: boolean;
};

export type RmdResult = {
  startAge: number;
  /** True when distributions have already begun at `currentAge`. */
  alreadyRequired: boolean;
  /** Years until they begin. Zero once they have. */
  yearsUntilRequired: number;

  /** This year's divisor, or null if nothing is required yet. */
  divisor: number | null;
  /** This year's required amount. Zero if nothing is required yet. */
  required: number;
  requiredPercent: number | null;
  taxOnRequired: number;

  /** Required minus planned, floored at zero. */
  shortfall: number;
  /** 25% of the shortfall. */
  penalty: number;
  /** 10% of it, if corrected inside the window. */
  penaltyIfCorrected: number;
  /** True when the plan already takes at least the required amount. */
  planMeetsRequirement: boolean;

  years: RmdYear[];
  totalRequired: number;
  totalTax: number;
  /** Balance at the end of the projection. */
  finalBalance: number;
  /** The age the balance stops growing, or null if it never does. */
  peakAge: number | null;
  /** The balance at that peak. */
  peakBalance: number;
};

const AGE_LIMIT = 120;

/**
 * Work out this year's distribution and project the rest.
 *
 * Null on a birth year outside 1900–2100, an age outside 0–120, a negative
 * balance or planned withdrawal, a non-integer age, an end age at or below
 * the current age, a span over 60 years, a return outside −100–100%, or a
 * tax rate outside 0–100%.
 */
export function computeRmd(input: RmdInput): RmdResult | null {
  const {
    birthYear,
    currentAge,
    balance,
    returnPercent,
    endAge,
    marginalRatePercent,
    plannedWithdrawal,
  } = input;

  if (!Number.isFinite(birthYear) || !Number.isInteger(birthYear)) return null;
  if (birthYear < 1900 || birthYear > 2100) return null;
  for (const age of [currentAge, endAge]) {
    if (!Number.isFinite(age) || !Number.isInteger(age)) return null;
    if (age < 0 || age > AGE_LIMIT) return null;
  }
  if (endAge <= currentAge) return null;
  if (endAge - currentAge > 60) return null;
  if (!Number.isFinite(balance) || balance < 0) return null;
  if (!Number.isFinite(plannedWithdrawal) || plannedWithdrawal < 0) return null;
  if (!Number.isFinite(returnPercent) || returnPercent < -100 || returnPercent > 100) {
    return null;
  }
  if (
    !Number.isFinite(marginalRatePercent) ||
    marginalRatePercent < 0 ||
    marginalRatePercent > 100
  ) {
    return null;
  }

  const startAge = rmdStartAge(birthYear);
  const rate = returnPercent / 100;
  const taxRate = marginalRatePercent / 100;

  const years: RmdYear[] = [];
  let running = balance;
  let totalRequired = 0;
  let totalTax = 0;
  let peakAge: number | null = null;
  let peakBalance = balance;

  for (let age = currentAge; age < endAge; age += 1) {
    const openingBalance = running;
    // Below the start age nothing is required, even though the table has a
    // divisor for the age: the table row and the obligation are separate
    // things, and someone born in 1960 has a divisor at 73 but no RMD.
    const divisor = age >= startAge ? lifetimeDivisor(age) : null;
    const required = divisor === null ? 0 : openingBalance / divisor;
    const tax = required * taxRate;

    // The distribution comes out first, then the year's return is credited
    // to what remains. Crediting the return first would fund the account
    // with growth on money already withdrawn.
    running = (openingBalance - required) * (1 + rate);
    if (running < 0) running = 0;

    totalRequired += required;
    totalTax += tax;
    if (running > peakBalance) {
      peakBalance = running;
    }

    years.push({
      age,
      openingBalance,
      divisor,
      required,
      requiredPercent:
        divisor === null || openingBalance <= 0 ? null : (100 / divisor),
      tax,
      closingBalance: running,
      stillGrowing: running > openingBalance,
    });
  }

  // The first year the balance stops growing is the peak. Reported as the
  // age of the LAST growing year, because that is the year the balance is
  // highest at its close.
  const lastGrowing = years.filter((row) => row.stillGrowing).at(-1);
  peakAge = lastGrowing === undefined ? null : lastGrowing.age;
  peakBalance = lastGrowing === undefined ? balance : lastGrowing.closingBalance;

  const thisYear = years[0];
  const shortfall = Math.max(0, thisYear.required - plannedWithdrawal);

  return {
    startAge,
    alreadyRequired: currentAge >= startAge,
    yearsUntilRequired: Math.max(0, startAge - currentAge),

    divisor: thisYear.divisor,
    required: thisYear.required,
    requiredPercent: thisYear.requiredPercent,
    taxOnRequired: thisYear.tax,

    shortfall,
    penalty: shortfall * (SHORTFALL_PENALTY_PERCENT / 100),
    penaltyIfCorrected: shortfall * (CORRECTED_PENALTY_PERCENT / 100),
    planMeetsRequirement: shortfall <= 0,

    years,
    totalRequired,
    totalTax,
    finalBalance: years[years.length - 1].closingBalance,
    peakAge,
    peakBalance,
  };
}
