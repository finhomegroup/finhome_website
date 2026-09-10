/**
 * Pivot point levels, for /cong-cu/diem-pivot/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `pivot.test.ts`.
 *
 * Four methods, all taking the previous session's high, low and close, and
 * all disagreeing with each other. That disagreement is the point: the levels
 * are a convention, not a measurement, and a page that printed only one
 * method would imply a precision that does not exist.
 *
 * - **Classic** — the pivot is the mean of high, low and close; supports and
 *   resistances are reflections of the range around it.
 * - **Fibonacci** — the same pivot, with the range scaled by 0,382, 0,618
 *   and 1,000 instead of the classic reflections.
 * - **Camarilla** — built from the close rather than the pivot, scaled by
 *   1,1/12, 1,1/6 and 1,1/4 of the range. Produces tighter levels.
 * - **Woodie** — weights the OPEN of the current session, so it needs one
 *   more input and moves as the session opens away from yesterday's close.
 *
 * Woodie is therefore the only method that can be absent: without an open
 * price it is not computable, and the module returns null for that method
 * rather than substituting the close and calling it Woodie.
 *
 * Nothing here predicts anything. The levels are where a lot of traders
 * happen to place orders, which is a different claim, and the page makes it.
 */

export type PivotMethod = "classic" | "fibonacci" | "camarilla" | "woodie";

export type PivotLevels = {
  method: PivotMethod;
  /** The central level. */
  pivot: number;
  /** Resistances, nearest first. */
  resistance: number[];
  /** Supports, nearest first. */
  support: number[];
};

export type PivotResult = {
  /** `high − low`. */
  range: number;
  /** The classic pivot, quoted separately because it anchors three methods. */
  pivot: number;
  /** Where the close sat in the session's range, in percent. */
  closePositionPercent: number;
  /** One entry per method. Woodie is absent when no open price was given. */
  methods: PivotLevels[];
};

/**
 * Compute pivot levels by four methods.
 *
 * Null when the inputs cannot describe a session: a low above the high, a
 * close outside the range, a non-positive price, an open outside the range
 * when given, or any non-finite number. A high equal to the low is allowed —
 * a limit-locked session is real — and collapses every level onto one price.
 */
export function computePivots(input: {
  /** Previous session's high. */
  high: number;
  /** Previous session's low. */
  low: number;
  /** Previous session's close. */
  close: number;
  /** Current session's open. Needed only for the Woodie method. */
  open?: number;
}): PivotResult | null {
  const { high, low, close, open } = input;

  const numbers = [high, low, close];
  if (numbers.some((value) => !Number.isFinite(value) || value <= 0)) {
    return null;
  }
  if (low > high) return null;
  // A close outside the session's own range is not a session.
  if (close < low || close > high) return null;
  if (open !== undefined) {
    if (!Number.isFinite(open) || open <= 0) return null;
  }

  const range = high - low;
  const pivot = (high + low + close) / 3;

  const methods: PivotLevels[] = [
    {
      method: "classic",
      pivot,
      resistance: [
        2 * pivot - low,
        pivot + range,
        high + 2 * (pivot - low),
      ],
      support: [
        2 * pivot - high,
        pivot - range,
        low - 2 * (high - pivot),
      ],
    },
    {
      method: "fibonacci",
      pivot,
      resistance: [
        pivot + 0.382 * range,
        pivot + 0.618 * range,
        pivot + range,
      ],
      support: [
        pivot - 0.382 * range,
        pivot - 0.618 * range,
        pivot - range,
      ],
    },
    {
      // Built off the close, not the pivot — which is why its levels sit
      // tighter and why it is quoted alongside rather than instead.
      method: "camarilla",
      pivot,
      resistance: [
        close + (range * 1.1) / 12,
        close + (range * 1.1) / 6,
        close + (range * 1.1) / 4,
      ],
      support: [
        close - (range * 1.1) / 12,
        close - (range * 1.1) / 6,
        close - (range * 1.1) / 4,
      ],
    },
  ];

  if (open !== undefined) {
    // Woodie weights today's open, so its pivot is not the classic one.
    const woodiePivot = (high + low + 2 * open) / 4;
    methods.push({
      method: "woodie",
      pivot: woodiePivot,
      resistance: [
        2 * woodiePivot - low,
        woodiePivot + range,
        high + 2 * (woodiePivot - low),
      ],
      support: [
        2 * woodiePivot - high,
        woodiePivot - range,
        low - 2 * (high - woodiePivot),
      ],
    });
  }

  return {
    range,
    pivot,
    // Guard the flat session: a locked market has no position within a range.
    closePositionPercent: range > 0 ? ((close - low) / range) * 100 : 50,
    methods,
  };
}
