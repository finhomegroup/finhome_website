import { describe, it, expect } from "vitest";
import { computeFibonacci, type FibonacciResult } from "@/lib/calc/fibonacci";

// A move from 40.000 to 60.000 — a 20.000 range, so every ratio is easy to
// check by hand.
const MOVE = { high: 60_000, low: 40_000 } as const;

function fib(direction: "uptrend" | "downtrend"): FibonacciResult {
  const result = computeFibonacci({ ...MOVE, direction });
  expect(result).not.toBeNull();
  return result!;
}

/** Look a retracement level up by its ratio. */
function level(result: FibonacciResult, ratioPercent: number): number {
  const found = result.retracements.find(
    (entry) => Math.abs(entry.ratioPercent - ratioPercent) < 1e-9,
  );
  expect(found).toBeDefined();
  return found!.price;
}

describe("computeFibonacci — the move", () => {
  it("measures the range and echoes the inputs", () => {
    const result = fib("uptrend");
    expect(result.range).toBe(20_000);
    expect(result.high).toBe(60_000);
    expect(result.low).toBe(40_000);
    expect(result.direction).toBe("uptrend");
  });

  it("returns seven retracements and five extensions", () => {
    const result = fib("uptrend");
    expect(result.retracements).toHaveLength(7);
    expect(result.extensions).toHaveLength(5);
  });
});

describe("computeFibonacci — uptrend retracements fall from the high", () => {
  it("anchors 0% at the high and 100% at the low", () => {
    const result = fib("uptrend");
    expect(level(result, 0)).toBe(60_000);
    expect(level(result, 100)).toBe(40_000);
  });

  it("places the classic levels where hand arithmetic says", () => {
    const result = fib("uptrend");
    expect(level(result, 23.6)).toBeCloseTo(60_000 - 0.236 * 20_000, 8);
    expect(level(result, 38.2)).toBeCloseTo(52_360, 8);
    expect(level(result, 50)).toBeCloseTo(50_000, 8);
    expect(level(result, 61.8)).toBeCloseTo(47_640, 8);
    expect(level(result, 78.6)).toBeCloseTo(44_280, 8);
  });

  it("descends monotonically as the retracement deepens", () => {
    const prices = fib("uptrend").retracements.map((entry) => entry.price);
    for (let index = 1; index < prices.length; index += 1) {
      expect(prices[index]).toBeLessThan(prices[index - 1]);
    }
  });

  it("keeps every retracement inside the move", () => {
    for (const entry of fib("uptrend").retracements) {
      expect(entry.price).toBeGreaterThanOrEqual(40_000);
      expect(entry.price).toBeLessThanOrEqual(60_000);
    }
  });
});

describe("computeFibonacci — downtrend retracements rise from the low", () => {
  it("anchors 0% at the low and 100% at the high", () => {
    const result = fib("downtrend");
    expect(level(result, 0)).toBe(40_000);
    expect(level(result, 100)).toBe(60_000);
  });

  it("mirrors the uptrend about the midpoint", () => {
    // The direction check that matters: the same fraction on the opposite
    // anchor. Getting this backwards puts levels on the wrong side of price.
    const up = fib("uptrend");
    const down = fib("downtrend");
    for (const ratio of [23.6, 38.2, 50, 61.8, 78.6]) {
      expect(level(up, ratio) + level(down, ratio)).toBeCloseTo(100_000, 6);
    }
  });

  it("ascends monotonically as the bounce deepens", () => {
    const prices = fib("downtrend").retracements.map((entry) => entry.price);
    for (let index = 1; index < prices.length; index += 1) {
      expect(prices[index]).toBeGreaterThan(prices[index - 1]);
    }
  });

  it("puts 50% at the same place in both directions", () => {
    expect(level(fib("uptrend"), 50)).toBeCloseTo(
      level(fib("downtrend"), 50),
      8,
    );
  });
});

describe("computeFibonacci — extensions go past the end of the move", () => {
  it("sits above the high in an uptrend", () => {
    const result = fib("uptrend");
    for (const entry of result.extensions) {
      expect(entry.price).toBeGreaterThan(60_000);
    }
    // 161,8% of a 20.000 range added to the low.
    expect(result.extensions[2].ratioPercent).toBeCloseTo(161.8, 8);
    expect(result.extensions[2].price).toBeCloseTo(40_000 + 1.618 * 20_000, 8);
    expect(result.extensions[2].price).toBeCloseTo(72_360, 8);
  });

  it("sits below the low in a downtrend", () => {
    const result = fib("downtrend");
    for (const entry of result.extensions) {
      expect(entry.price).toBeLessThan(40_000);
    }
    expect(result.extensions[2].price).toBeCloseTo(60_000 - 1.618 * 20_000, 8);
    expect(result.extensions[2].price).toBeCloseTo(27_640, 8);
  });

  it("orders them outward", () => {
    const up = fib("uptrend").extensions.map((entry) => entry.price);
    for (let index = 1; index < up.length; index += 1) {
      expect(up[index]).toBeGreaterThan(up[index - 1]);
    }
    const down = fib("downtrend").extensions.map((entry) => entry.price);
    for (let index = 1; index < down.length; index += 1) {
      expect(down[index]).toBeLessThan(down[index - 1]);
    }
  });

  it("doubles the move at the 200% level", () => {
    const result = fib("uptrend");
    const double = result.extensions.find(
      (entry) => Math.abs(entry.ratioPercent - 200) < 1e-9,
    )!;
    expect(double.price).toBeCloseTo(80_000, 8);
  });
});

describe("computeFibonacci — which ratios are actually Fibonacci", () => {
  it("flags 50% and 78,6% as convention, not Fibonacci", () => {
    const result = fib("uptrend");
    const flagged = result.retracements
      .filter((entry) => entry.conventional)
      .map((entry) => entry.ratioPercent);
    // Compared with a tolerance, not `toEqual`: 0,786 × 100 is
    // 78,60000000000001 in binary floating point.
    expect(flagged).toHaveLength(2);
    expect(flagged[0]).toBeCloseTo(50, 8);
    expect(flagged[1]).toBeCloseTo(78.6, 8);
  });

  it("does not flag the genuine ratios", () => {
    const result = fib("uptrend");
    for (const ratio of [0, 23.6, 38.2, 61.8, 100]) {
      const entry = result.retracements.find(
        (candidate) => Math.abs(candidate.ratioPercent - ratio) < 1e-9,
      )!;
      expect(entry.conventional).toBe(false);
    }
  });

  it("flags nothing among the extensions", () => {
    for (const entry of fib("uptrend").extensions) {
      expect(entry.conventional).toBe(false);
    }
  });
});

describe("computeFibonacci — edges and rejection", () => {
  it("collapses onto one price when the high equals the low", () => {
    const result = computeFibonacci({
      high: 50_000,
      low: 50_000,
      direction: "uptrend",
    })!;
    expect(result).not.toBeNull();
    expect(result.range).toBe(0);
    for (const entry of [...result.retracements, ...result.extensions]) {
      expect(entry.price).toBeCloseTo(50_000, 8);
    }
  });

  it("returns null rather than a guess", () => {
    expect(
      computeFibonacci({ high: 40_000, low: 60_000, direction: "uptrend" }),
    ).toBeNull();
    expect(
      computeFibonacci({ high: 0, low: 0, direction: "uptrend" }),
    ).toBeNull();
    expect(
      computeFibonacci({ high: 60_000, low: -1, direction: "uptrend" }),
    ).toBeNull();
    expect(
      computeFibonacci({
        high: Number.NaN,
        low: 40_000,
        direction: "uptrend",
      }),
    ).toBeNull();
  });
});
