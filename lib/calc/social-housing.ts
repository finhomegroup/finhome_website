/**
 * Nhà ở xã hội: the dated statutory parameters, and the one test that is
 * arithmetic.
 *
 * Pure module: no React, no I/O, no DOM, no `Date`. The reference date arrives
 * from the caller, for the reason `dates.ts` gives — a module that reads the
 * clock cannot be tested against a fixed answer, and a legal threshold is
 * exactly the kind of figure a reader checks against a date in the past.
 *
 * ## WHY THIS FILE IS A DATED CHAIN AND NOT FOUR CONSTANTS
 *
 * The income ceiling for buying nhà ở xã hội moved THREE TIMES IN 24 MONTHS:
 *
 *     NĐ 100/2024 (26/7/2024)
 *       → NĐ 261/2025 (10/10/2025)   20 / 40 / 30 triệu
 *       → NĐ 54/2026                 (housing condition only)
 *       → NĐ 136/2026 (07/04/2026)   25 / 50 / 35 triệu
 *
 * That volatility is not a footnote, it is the design constraint. While this
 * module was written, a `luatvietnam.vn` page TITLED "Điều kiện mua nhà ở xã
 * hội 2026" was still publishing the superseded 20/40/30 figures. Secondary
 * legal sites disagree with each other and go stale silently, so:
 *
 * 1. **Every row carries its instrument and its effective date.** The page
 *    renders them, so a reader can tell whether what they are reading has been
 *    overtaken. A ceiling with no date is not checkable.
 * 2. **The whole chain ships, not just the current row.** A reader checking a
 *    2025 application needs the figures that applied to THEM, and a table with
 *    history makes a missing update visible instead of silent.
 * 3. **An unverified period returns `undefined`, never a neighbour's figure.**
 *    This is `us-retirement-limits.ts`'s rule #1, and the reason is the same:
 *    a stale ceiling produces a confidently wrong answer for precisely the
 *    readers who sit near it. NĐ 100/2024's ORIGINAL figures were not verified
 *    from a primary source, so dates before 10/10/2025 are unknown here and
 *    say so. A from-memory draft of this file would have written 15 triệu for
 *    a single applicant — two amendments stale, and wrong in the direction
 *    that tells a qualifying household it does not qualify.
 *
 * ## WHAT THIS MODULE DELIBERATELY CANNOT DO
 *
 * Three conditions govern eligibility and only ONE of them is arithmetic:
 *
 * | Condition | Here? |
 * |---|---|
 * | Income against the dated ceiling | YES |
 * | No home in that province, or < 15 m² sàn/người | no — documentary |
 * | No prior NOXH or housing support in that province | no — documentary |
 *
 * So the income result is called `withinCeiling`, not `eligible`. A field
 * named `eligible` would be false at the type level: this module cannot see
 * two thirds of the statute. The page renders the documentary conditions as a
 * checklist the reader confirms, the same way the affordability article
 * already handles "ngân hàng có duyệt cho bạn vay hay không".
 *
 * Nothing here is legal advice, and nothing here is an eligibility decision.
 */

/** Which ceiling applies, per khoản 1 Điều 30. */
export type NoxhHousehold =
  /** One applicant, not married. */
  | "single"
  /** Married couple; the ceiling is on their COMBINED take-home. */
  | "couple"
  /** One applicant raising at least one child under the age of majority. */
  | "singleParentMinorChildren";

export type NoxhIncomeCeilings = {
  /** ISO date the instrument takes effect. */
  effectiveFrom: string;
  /** e.g. "Nghị định 136/2026/NĐ-CP". */
  instrument: string;
  /**
   * ISO date the instrument's own text stops applying, or null when it states
   * none.
   *
   * `null` is a fact about the instrument, not a missing value: NĐ 136/2026
   * states no expiry. Recording it as null rather than blank is what lets
   * `check:done` report "declared parameters, with instrument + expiry"
   * honestly instead of counting an absence as unfiled.
   */
  expiresAfter: string | null;
  /** Monthly take-home ceiling per household shape, in đồng. */
  ceilings: Record<NoxhHousehold, number>;
};

/**
 * The amendment chain, OLDEST FIRST.
 *
 * Exported so a page can render the history rather than only the current row.
 * Measured on `thu nhập bình quân hàng tháng THỰC NHẬN` — take-home, not
 * gross — averaged over the 12 months immediately preceding the point the
 * competent authority certifies the file.
 */
export const NOXH_INCOME_CEILINGS: readonly NoxhIncomeCeilings[] = [
  {
    effectiveFrom: "2025-10-10",
    instrument: "Nghị định 261/2025/NĐ-CP",
    // Điều 2 and khoản 2 Điều 3 of this decree run until 31/5/2030.
    expiresAfter: "2030-05-31",
    ceilings: {
      single: 20_000_000,
      couple: 40_000_000,
      singleParentMinorChildren: 30_000_000,
    },
  },
  {
    effectiveFrom: "2026-04-07",
    instrument: "Nghị định 136/2026/NĐ-CP",
    expiresAfter: null,
    ceilings: {
      single: 25_000_000,
      couple: 50_000_000,
      singleParentMinorChildren: 35_000_000,
    },
  },
];

/** The earliest date this module can answer for. */
export const NOXH_EARLIEST_KNOWN = NOXH_INCOME_CEILINGS[0].effectiveFrom;

/**
 * The ceiling row in force at `asOf`, or `undefined` before the earliest
 * verified row.
 *
 * `asOf` is an ISO `YYYY-MM-DD` string, compared lexicographically — valid for
 * that format and avoids constructing a `Date` in a pure module.
 */
export function noxhCeilingsAt(asOf: string): NoxhIncomeCeilings | undefined {
  let found: NoxhIncomeCeilings | undefined;
  for (const row of NOXH_INCOME_CEILINGS) {
    if (asOf >= row.effectiveFrom) found = row;
  }
  return found;
}

export type NoxhIncomeAssessment = {
  household: NoxhHousehold;
  /** The figure tested: monthly take-home, averaged over 12 months, in đồng. */
  monthlyNetIncome: number;
  /** The ceiling that applied on `asOf`. */
  ceiling: number;
  /**
   * Whether the income test is met. NOT an eligibility verdict — see the file
   * header for the two conditions this module cannot see.
   */
  withinCeiling: boolean;
  /**
   * Ceiling minus income. Positive is headroom, negative is the amount above
   * the ceiling.
   *
   * Signed on purpose. A reader over the ceiling is owed the SIZE of the gap,
   * because the ceiling has twice moved up by 5–10 triệu and "above it today"
   * is not "ineligible".
   */
  marginToCeiling: number;
  instrument: string;
  effectiveFrom: string;
  expiresAfter: string | null;
};

/**
 * Test a household's take-home income against the ceiling in force on a date.
 *
 * Returns `null` when the date predates the earliest verified ceiling, or when
 * the income is not a finite non-negative number. Never guesses a ceiling.
 */
export function assessNoxhIncome(input: {
  household: NoxhHousehold;
  monthlyNetIncome: number;
  asOf: string;
}): NoxhIncomeAssessment | null {
  const { household, monthlyNetIncome, asOf } = input;
  if (!Number.isFinite(monthlyNetIncome) || monthlyNetIncome < 0) return null;

  const row = noxhCeilingsAt(asOf);
  if (!row) return null;

  const ceiling = row.ceilings[household];
  return {
    household,
    monthlyNetIncome,
    ceiling,
    // Inclusive: the statute says "không quá", so exactly at the ceiling
    // passes. An exclusive test would fail a household on a round figure.
    withinCeiling: monthlyNetIncome <= ceiling,
    marginToCeiling: ceiling - monthlyNetIncome,
    instrument: row.instrument,
    effectiveFrom: row.effectiveFrom,
    expiresAfter: row.expiresAfter,
  };
}

/**
 * The subsidised loan's terms, per khoản 4 Điều 48 NĐ 100/2024 as amended by
 * NĐ 261/2025.
 *
 * `annualRatePercent` is a DEFAULT TO CONFIRM, not a fact about the reader's
 * province. NĐ 261/2025 set 5,4%/năm and `QĐ 2553/QĐ-TTg` applied the adjusted
 * NHCSXH policy-programme rates from 01/12/2025; local `HĐND` resolutions then
 * override it downwards — Hà Nội is 4,8%/năm under NQ 56/2025/NQ-HĐND. A
 * province-by-province table was considered and REJECTED: it is a 34-province
 * surface with per-province instruments and expiry dates, and one stale row
 * silently misprices a 25-year loan. So the national figure is the default, the
 * field stays overridable, and the copy names Hà Nội as the live example of why
 * the reader must confirm their own.
 *
 * `maxLtvPercent` and `maxTermMonths` are STATUTORY CAPS, which matters for the
 * copy: the affordability tool's own `assumedMaxLtvPercent` is documented as
 * "a user assumption, not a bank's limit and not a regulation", and under this
 * programme it is exactly a regulation. Same field, opposite status.
 */
export const NOXH_LOAN = {
  annualRatePercent: 5.4,
  maxLtvPercent: 80,
  /** 25 năm from first disbursement. */
  maxTermMonths: 300,
  /** Overdue principal accrues at 130% of the lending rate. */
  overdueRateMultiplier: 1.3,
  rateInstrument: "Nghị định 261/2025/NĐ-CP",
  rateAppliedBy: "Quyết định 2553/QĐ-TTg",
  rateEffectiveFrom: "2025-12-01",
  termsInstrument: "khoản 4 Điều 48 Nghị định 100/2024/NĐ-CP",
} as const;

/**
 * The floor-area test in the housing condition, for copy that quotes it.
 *
 * Điều 29 NĐ 100/2024, amended by NĐ 54/2026/NĐ-CP. **The amending decree's
 * effective date is NOT verified and must not be asserted** — cite the
 * instrument without a date until someone confirms it. That costs nothing
 * here because this condition is documentary: it renders as prose the reader
 * confirms, never as a computed threshold.
 */
export const NOXH_FLOOR_AREA = {
  /** Average m² of floor per resident, below which a home-owner still qualifies. */
  perPersonSqm: 15,
  instrument: "Điều 29 Nghị định 100/2024/NĐ-CP, sửa đổi bởi Nghị định 54/2026/NĐ-CP",
} as const;
