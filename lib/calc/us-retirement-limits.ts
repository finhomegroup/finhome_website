/**
 * United States retirement contribution limits, by tax year.
 *
 * One dated table, shared by every page in the retirement tier that needs a
 * statutory ceiling: `gop-401k`, `toi-da-401k` and
 * `ira-truyen-thong-hay-roth`. Transcribed numeric constants are a defect
 * class of their own in this repo — see docs/calculator-suite-status.md §8,
 * where two coefficient sets shipped wrong and a tax threshold shipped two
 * revisions stale — so the rules for this file are strict:
 *
 * 1. **Every figure carries its tax year.** An unknown year returns
 *    `undefined` and each caller returns null rather than borrowing another
 *    year's ceiling. A limit that is one year stale produces a confidently
 *    wrong answer for exactly the readers who are contributing at the cap.
 * 2. **Nothing is derived.** The 401(k) deferral limit is not the IRA limit
 *    times anything, and none of them can be computed from the Social
 *    Security wage base. Every number here is the published figure.
 * 3. **`limits.test.ts` asserts the internal shape** — every limit positive,
 *    catch-ups smaller than the base limit, the 415(c) ceiling above the
 *    deferral limit, and each year at least as large as the year before,
 *    since these are indexed and round up in $500/$1.000 steps.
 *
 * ## What each limit actually limits
 *
 * - `electiveDeferral` — IRC 402(g). The employee's own salary deferrals,
 *   across ALL 401(k)/403(b) plans they participate in, in a calendar year.
 * - `catchUp50` — extra deferral allowed from the year the employee turns 50.
 * - `catchUp60to63` — SECURE 2.0's higher catch-up, for ages 60, 61, 62 and
 *   63 only. At 64 the allowance drops back to `catchUp50`, which surprises
 *   people, so the pages say it.
 * - `annualAdditions` — IRC 415(c). Deferral PLUS employer match PLUS any
 *   non-elective contribution, per plan. Catch-up contributions sit outside
 *   this ceiling, which is why the pages test it on the non-catch-up part.
 * - `compensation` — IRC 401(a)(17). Pay above this is invisible to the
 *   plan, so a match expressed as "6% of pay" stops growing here. This is
 *   the limit high earners are most often unaware of.
 * - `ira` / `iraCatchUp50` — IRC 219(b), traditional and Roth IRAs combined.
 *   The catch-up was a flat 1.000 for two decades and became indexed under
 *   SECURE 2.0, which is why it now moves.
 * - `rothCatchUpWageThreshold` — SECURE 2.0 604/603: an employee whose
 *   PRIOR-year FICA wages from that employer exceeded this must make their
 *   catch-up contributions as Roth, so those dollars are not deductible.
 *   `null` for a year the requirement was not yet in force. This is not a
 *   footnote: it removes the deduction from precisely the older, higher-paid
 *   readers who use catch-up at all.
 */

export type RetirementLimitYear = {
  year: number;
  electiveDeferral: number;
  catchUp50: number;
  catchUp60to63: number;
  annualAdditions: number;
  compensation: number;
  ira: number;
  iraCatchUp50: number;
  /** Null when the Roth catch-up requirement is not in force for this year. */
  rothCatchUpWageThreshold: number | null;
};

export const CATCH_UP_AGE = 50;
/** SECURE 2.0's higher catch-up window. Inclusive at both ends. */
export const SUPER_CATCH_UP_FIRST_AGE = 60;
export const SUPER_CATCH_UP_LAST_AGE = 63;

export const RETIREMENT_LIMITS: Record<number, RetirementLimitYear> = {
  2025: {
    year: 2025,
    electiveDeferral: 23_500,
    catchUp50: 7_500,
    catchUp60to63: 11_250,
    annualAdditions: 70_000,
    compensation: 350_000,
    ira: 7_000,
    iraCatchUp50: 1_000,
    // The Roth catch-up requirement was legislated for 2024 and
    // administratively delayed; 2025 is inside that relief window, so no
    // threshold applies.
    rothCatchUpWageThreshold: null,
  },
  2026: {
    year: 2026,
    electiveDeferral: 24_500,
    catchUp50: 8_000,
    catchUp60to63: 11_250,
    annualAdditions: 72_000,
    compensation: 360_000,
    ira: 7_500,
    iraCatchUp50: 1_100,
    rothCatchUpWageThreshold: 150_000,
  },
};

/** Newest first, which is the order the year selector should offer. */
export const RETIREMENT_LIMIT_YEAR_ORDER = [2026, 2025] as const;

export type CatchUpTier = "none" | "age50" | "age60to63";

/**
 * Which catch-up tier an age falls in.
 *
 * The window is inclusive at both ends and the allowance DROPS at 64 — the
 * one non-monotonic step in the whole schedule, and the reason this is a
 * named function rather than a comparison written out at each call site.
 */
export function catchUpTier(age: number): CatchUpTier {
  if (!Number.isFinite(age) || age < CATCH_UP_AGE) return "none";
  if (age >= SUPER_CATCH_UP_FIRST_AGE && age <= SUPER_CATCH_UP_LAST_AGE) {
    return "age60to63";
  }
  return "age50";
}

/** The extra deferral allowed at this age, in USD. Zero below 50. */
export function catchUpAllowance(
  params: RetirementLimitYear,
  age: number,
): number {
  switch (catchUpTier(age)) {
    case "age60to63":
      return params.catchUp60to63;
    case "age50":
      return params.catchUp50;
    default:
      return 0;
  }
}

/** The extra IRA contribution allowed at this age, in USD. Zero below 50. */
export function iraCatchUpAllowance(
  params: RetirementLimitYear,
  age: number,
): number {
  return catchUpTier(age) === "none" ? 0 : params.iraCatchUp50;
}

/**
 * True when this year's rules force catch-up contributions into Roth for
 * someone earning this much.
 *
 * The test is on the PRIOR year's FICA wages from the employer sponsoring
 * the plan. Callers must ask for that figure separately: current salary or
 * income from another employer can put the reader on the wrong side of the
 * threshold.
 */
export function catchUpMustBeRoth(
  params: RetirementLimitYear,
  priorYearWages: number,
): boolean {
  const threshold = params.rothCatchUpWageThreshold;
  return threshold !== null && priorYearWages > threshold;
}
