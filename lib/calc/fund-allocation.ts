/**
 * Splitting one pot of money by PURPOSE and by when it is needed, for
 * /cong-cu/phan-bo-tai-san/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `fund-allocation.test.ts`.
 *
 * ORIGINAL ROW 56 REPLACED THIS PAGE'S DEFAULT QUESTION. The tool used to
 * open on "what mix should I hold at my age and risk tolerance", which is a
 * generic personal-investment recommendation — and the worst possible default
 * for money that is about to buy a home. The row's words: "khởi đầu bằng thời
 * gian cần tiền và quỹ dự phòng; không lấy danh mục chung làm khuyến nghị cá
 * nhân". So the default is now this: one pot, a reserve to protect, and named
 * purposes each with the month it is needed. The age/risk portfolio study is
 * retained as an explicitly advanced educational mode.
 *
 * ONE POT, MUTUALLY EXCLUSIVE CLAIMS. Every đồng is allocated to at most one
 * purpose. The reserve is taken first because it is the money the reader said
 * must survive everything else; the purposes then draw in the order the CALLER
 * passed them.
 *
 * THAT ORDER IS A DECLARED CONVENTION, NOT A PREFERENCE THE READER EXPRESSED.
 * An earlier version of this comment — and the page's own shortfall copy —
 * said the money is allocated "theo thứ tự bạn liệt kê", which an independent
 * review correctly rejected: the form has a FIXED sequence of groups (reserve,
 * then the home, then the other goal) and offers no way to reorder them, so
 * nothing about the order was chosen by the reader. What is true is narrower
 * and has to be said in those terms: this module draws in the order it is
 * given, it never re-sorts by need date — deciding whose goal gets cut is not
 * a web page's decision — and a consumer therefore has to DECLARE the order it
 * passes. `orderMatchesTimeline` then reports, as a FACT and not as advice,
 * whether that declared order happens to run soonest-need-first.
 *
 * A NEED TIME IS ANCHORED OR IT IS NOT A DATE. `monthsUntilNeeded` is a count
 * of months and means nothing on its own; "12 tháng kể từ hôm nay" on a page
 * that never shows what "hôm nay" is cannot be checked by the reader and
 * cannot be pinned by a test. Pass `start` and every stated month comes back
 * as a real `needDate` through `addMonths` — clamped once, per that function's
 * convention. Omit `start` and the dates are null while the month counts still
 * work: an anchor is an improvement to the disclosure, not a new requirement
 * for an answer.
 *
 * FOUR STATES KEPT APART, because collapsing any two of them is how a reader
 * is told their plan works when it does not:
 *
 * - ALLOCATED — money assigned to a purpose.
 * - UNALLOCATED — money in the pot with no purpose yet. Not "spare", not
 *   "investable", and emphatically not a recommendation to do anything.
 * - SHORTFALL — a request the pot cannot cover. The requested total is NEVER
 *   reported as funded: on the row's fixture a 1,05 tỷ set of requests
 *   against a 1 tỷ pot is 50 triệu short, and the page must say so rather
 *   than prorating silently.
 * - TIME NOT STATED — a purpose with no month. It still gets its money, but
 *   nothing about liquidity can be said for it, and the flag forces a page to
 *   admit that instead of implying a horizon.
 *
 * NOTHING HERE ALLOCATES TO A PRODUCT. No securities, no deposits, no
 * suggested instrument. Deciding WHERE money sits is out of scope; this
 * module only answers how much belongs to each purpose and whether the pot
 * covers them.
 */

import { addMonths, isValidDate, type CalendarDate } from "@/lib/calc/dates";

/** One thing the money is for. */
export type FundPurpose = {
  /** Stable key the page maps to a name. */
  key: string;
  /** Amount the reader wants for this purpose, in đồng. */
  requested: number;
  /**
   * Months from the plan's start until the money is needed.
   *
   * `null` means NOT STATED, which is a real state — a reader may know they
   * want 150 triệu set aside without knowing when. It sets `timeUnknown` and
   * suppresses every claim about liquidity for that purpose.
   */
  monthsUntilNeeded: number | null;
};

export type FundAllocationInput = {
  /** The single pot, in đồng. */
  available: number;
  /**
   * Money to keep untouched whatever else happens.
   *
   * Allocated FIRST, and counted exactly once — it is not also available to
   * the purposes below.
   */
  reserve: number;
  /**
   * Named purposes, drawing in the order given.
   *
   * The caller owns this order and must declare it to the reader — see the
   * module docstring. Nothing here re-sorts it.
   */
  purposes: readonly FundPurpose[];
  /**
   * The date the month counts are measured from, when one is stated.
   *
   * Optional: a stated month is still usable without an anchor, and the
   * resulting `needDate` is simply null. An INVALID date is not the same as an
   * absent one and refuses the whole allocation, because a page showing need
   * dates off a broken anchor is worse than one showing none.
   */
  start?: CalendarDate;
};

export type AllocatedPurpose = {
  key: string;
  requested: number;
  monthsUntilNeeded: number | null;
  /**
   * `start` advanced by `monthsUntilNeeded`, when both exist.
   *
   * Null when no month was stated OR no anchor was passed — the two are told
   * apart by `timeUnknown`, which is about the reader's answer, where this is
   * about whether the page declared an anchor.
   */
  needDate: CalendarDate | null;
  /** What the pot could actually cover for this purpose. */
  allocated: number;
  /** `requested − allocated`. Zero when fully covered. */
  shortfall: number;
  funded: boolean;
  /** True when no month was stated. See `FundPurpose.monthsUntilNeeded`. */
  timeUnknown: boolean;
};

export type FundAllocationResult = {
  available: number;
  /** The anchor the need dates were measured from, echoed for display. */
  start: CalendarDate | null;
  /** Echoed back: what the reader asked to protect. */
  reserve: number;
  /** What the pot could actually set aside for it. */
  reserveAllocated: number;
  /** How much of the reserve the pot cannot cover. */
  reserveShortfall: number;
  purposes: AllocatedPurpose[];
  /** Reserve plus every request. NOT a claim that this much exists. */
  totalRequested: number;
  /** Reserve plus every allocation. Never above `available`. */
  totalAllocated: number;
  /** `available − totalAllocated`. Money with no purpose yet. */
  unallocated: number;
  /** `totalRequested − available` when positive, else 0. */
  shortfall: number;
  /** True when the pot covers the reserve and every request in full. */
  fullyFunded: boolean;
  /** True when any purpose has no stated month. */
  anyTimeUnknown: boolean;
  /**
   * Whether the order this was CALLED with is also soonest-needed-first.
   *
   * A statement of fact about the declared allocation order, not a suggestion
   * to change it and not a claim that the reader picked it. Purposes with no
   * stated month are ignored for this check, because nothing is known about
   * where they belong.
   */
  orderMatchesTimeline: boolean;
};

/**
 * Split the pot.
 *
 * Null when the inputs cannot describe one: a negative pot or reserve, a
 * negative request, a negative or non-integer number of months, duplicate
 * purpose keys, an invalid `start` date, or any non-finite number. An EMPTY
 * purpose list is fine — the answer is then "all of it is unallocated", which
 * is a real starting state, and an ABSENT `start` is fine too.
 *
 * A pot too small for the requests is NOT null: that is the answer, and
 * `shortfall` plus each purpose's own `shortfall` says exactly where it
 * falls.
 */
export function allocateFunds(
  input: FundAllocationInput,
): FundAllocationResult | null {
  const { available, reserve, purposes, start } = input;

  if (!Number.isFinite(available) || available < 0) return null;
  if (!Number.isFinite(reserve) || reserve < 0) return null;
  // An anchor that is not a date refuses the allocation rather than being
  // dropped: a page that asked for a start date and then showed month counts
  // measured from nothing has lost the convention it was displaying.
  if (start !== undefined && !isValidDate(start)) return null;

  const seen = new Set<string>();
  for (const purpose of purposes) {
    if (!Number.isFinite(purpose.requested) || purpose.requested < 0) {
      return null;
    }
    if (purpose.monthsUntilNeeded !== null) {
      const months = purpose.monthsUntilNeeded;
      if (!Number.isFinite(months) || months < 0) return null;
      // A month is a whole month: 12,5 months is not a date anything can be
      // anchored to.
      if (!Number.isInteger(months)) return null;
    }
    // Two purposes under one key would collapse into one bar segment and one
    // table row, silently hiding a request.
    if (seen.has(purpose.key)) return null;
    seen.add(purpose.key);
  }

  // The reserve draws first, and only what the pot actually holds.
  const reserveAllocated = Math.min(reserve, available);
  let remaining = available - reserveAllocated;

  const allocated: AllocatedPurpose[] = purposes.map((purpose) => {
    const given = Math.min(purpose.requested, remaining);
    remaining -= given;
    return {
      key: purpose.key,
      requested: purpose.requested,
      monthsUntilNeeded: purpose.monthsUntilNeeded,
      // One anchored date per stated month, through the shared `addMonths`
      // convention — never a second calendar implementation here.
      needDate:
        start === undefined || purpose.monthsUntilNeeded === null
          ? null
          : addMonths(start, purpose.monthsUntilNeeded),
      allocated: given,
      shortfall: purpose.requested - given,
      // Strict: a purpose is funded only when nothing is missing.
      funded: given >= purpose.requested,
      timeUnknown: purpose.monthsUntilNeeded === null,
    };
  });

  const totalRequested =
    reserve + purposes.reduce((sum, purpose) => sum + purpose.requested, 0);
  const totalAllocated =
    reserveAllocated + allocated.reduce((sum, item) => sum + item.allocated, 0);

  // Whatever the purposes did not draw. Never negative: every allocation was
  // capped by what was left.
  const unallocated = Math.max(0, available - totalAllocated);

  // Is the listed order also soonest-first? Only among purposes that stated a
  // month — nothing is known about the others.
  const statedMonths = allocated
    .filter((item) => item.monthsUntilNeeded !== null)
    .map((item) => item.monthsUntilNeeded as number);
  const orderMatchesTimeline = statedMonths.every(
    (months, index) => index === 0 || statedMonths[index - 1] <= months,
  );

  const figures = [
    reserveAllocated,
    totalRequested,
    totalAllocated,
    unallocated,
    ...allocated.flatMap((item) => [item.allocated, item.shortfall]),
  ];
  if (figures.some((figure) => !Number.isFinite(figure))) return null;

  return {
    available,
    start: start ?? null,
    reserve,
    reserveAllocated,
    reserveShortfall: reserve - reserveAllocated,
    purposes: allocated,
    totalRequested,
    totalAllocated,
    unallocated,
    shortfall: Math.max(0, totalRequested - available),
    fullyFunded:
      reserveAllocated >= reserve && allocated.every((item) => item.funded),
    anyTimeUnknown: allocated.some((item) => item.timeUnknown),
    orderMatchesTimeline,
  };
}
