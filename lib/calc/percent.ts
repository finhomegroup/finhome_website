/**
 * Percentage arithmetic for /cong-cu/tinh-phan-tram/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `percent.test.ts`.
 *
 * Three questions people actually mean when they say "tính phần trăm", kept
 * as one entry point with a mode rather than three exported functions, so the
 * page can hold a single live results region instead of one per question.
 *
 * The result is a discriminated union: the headline figure of "phần trăm của
 * một số" is a QUANTITY and of the other two modes is a PERCENTAGE, and they
 * must not be formatted the same way. Naming the field differently per mode
 * makes that impossible to get wrong at the call site.
 */

export type PercentMode =
  /** `a`% of `b`. 30% of 2.000.000.000 is 600.000.000. */
  | "of"
  /** `a` is what percent of `b`. 300.000 of 2.000.000 is 15%. */
  | "share"
  /** Change from `a` to `b`, as a percentage of `a`. */
  | "change"
  /**
   * Two RATES compared: the gap in percentage points AND in relative percent.
   *
   * Original row 59's lesson — "tăng từ 7% lên 9% là 2 điểm phần trăm" — needs
   * both numbers beside each other, because either one alone is the half a
   * reader mistakes for the whole. This mode exists rather than reusing
   * `change` because `change`'s inputs are money and its output is a single
   * percentage: it cannot say "2 điểm phần trăm" at all.
   */
  | "points";

export type PercentComputation =
  | { mode: "of"; amount: number }
  | { mode: "share"; sharePercent: number }
  | { mode: "change"; changePercent: number; difference: number }
  | {
      mode: "points";
      /** `b − a`, in percentage POINTS. 7% → 9% is 2, and 0% → 7% is 7. */
      differencePoints: number;
      /**
       * The same move as a percentage OF the old rate. 7% → 9% is 28,57%.
       *
       * NULL when the old rate is 0, and only then. "7 chia 0" is not a
       * percentage, but 7 − 0 = 7 points is perfectly valid and useful — a 0%
       * introductory rate rising to 7% is a real quote. The two figures are
       * therefore reported independently: withholding the whole answer
       * because one derived measure divides by zero threw away the one the
       * reader could use. An independent review found exactly that.
       */
      relativePercent: number | null;
    };

export type PercentInput = {
  mode: PercentMode;
  /**
   * First box. The percentage in "of", the part in "share", the old value in
   * "change", the OLD RATE in "points".
   */
  a: number;
  /**
   * Second box. The total in "of" and "share", the new value in "change", the
   * NEW RATE in "points".
   */
  b: number;
};

/**
 * Answer one of the three percentage questions.
 *
 * Null when the question has no answer:
 *
 * - `share` and `change` both divide by a figure the user supplied, so a zero
 *   there is rejected. "300.000 is what percent of 0" and "an increase from 0
 *   to 500" are genuinely undefined — every percentage of 0 is 0, so no
 *   percentage describes the step away from it. Returning ∞, 0 or 100 would
 *   each be a guess.
 * - Any non-finite input.
 *
 * Negative inputs are allowed throughout: a loss, a temperature or a negative
 * balance are all legitimate here. `change` divides by `|a|`, so a move from
 * −200 to −100 reads as +50% (an improvement of half the starting magnitude)
 * rather than −50%.
 */
export function computePercent(input: PercentInput): PercentComputation | null {
  const { mode, a, b } = input;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  switch (mode) {
    case "of":
      return { mode: "of", amount: (a / 100) * b };

    case "share":
      if (b === 0) return null;
      return { mode: "share", sharePercent: (a / b) * 100 };

    case "change": {
      if (a === 0) return null;
      return {
        mode: "change",
        changePercent: ((b - a) / Math.abs(a)) * 100,
        difference: b - a,
      };
    }

    case "points": {
      // NOT the same rule as `change`. A zero old rate is a legitimate rate —
      // a 0% introductory period is a real quote — and the point difference
      // from it is valid: 0% → 7% is +7 points. Only the RELATIVE change is
      // undefined there, so only that comes back null. Refusing the whole
      // answer, as an earlier version did, threw away the figure the reader
      // came for because a different derived measure divided by zero.
      return {
        mode: "points",
        // A DIFFERENCE of two percentages, which is what a percentage point
        // is. Never scaled by 100 again and never rendered as money.
        differencePoints: b - a,
        relativePercent: a === 0 ? null : ((b - a) / Math.abs(a)) * 100,
      };
    }
  }
}
