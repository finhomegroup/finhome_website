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
  /** `a`% of `b`. 15% of 2.000.000 is 300.000. */
  | "of"
  /** `a` is what percent of `b`. 300.000 of 2.000.000 is 15%. */
  | "share"
  /** Change from `a` to `b`, as a percentage of `a`. */
  | "change";

export type PercentComputation =
  | { mode: "of"; amount: number }
  | { mode: "share"; sharePercent: number }
  | { mode: "change"; changePercent: number; difference: number };

export type PercentInput = {
  mode: PercentMode;
  /** First box. The percentage in "of", the part in "share", the old value in "change". */
  a: number;
  /** Second box. The total in "of" and "share", the new value in "change". */
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
  }
}
