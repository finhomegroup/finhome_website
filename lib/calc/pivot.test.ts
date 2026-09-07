import { describe, it, expect } from "vitest";
import { computePivots, type PivotLevels } from "@/lib/calc/pivot";

// A session with a 4.000 ₫ range, closing in the upper half.
const SESSION = { high: 52_000, low: 48_000, close: 51_000 };

function pivots(input: Parameters<typeof computePivots>[0]) {
  const result = computePivots(input);
  expect(result).not.toBeNull();
  return result!;
}

function method(
  input: Parameters<typeof computePivots>[0],
  name: PivotLevels["method"],
) {
  const found = pivots(input).methods.find(
    (entry) => entry.method === name,
  );
  expect(found).toBeDefined();
  return found!;
}

describe("computePivots — the session", () => {
  it("measures the range and where the close sat in it", () => {
    const result = pivots(SESSION);
    expect(result.range).toBe(4_000);
    expect(result.closePositionPercent).toBeCloseTo(75, 10);
  });

  it("computes the classic pivot as the mean of the three prices", () => {
    // (52.000 + 48.000 + 51.000) ÷ 3 = 50.333,33…
    expect(pivots(SESSION).pivot).toBeCloseTo(151_000 / 3, 8);
  });

  it("offers three methods without an open price, four with one", () => {
    expect(pivots(SESSION).methods).toHaveLength(3);
    expect(pivots({ ...SESSION, open: 50_500 }).methods).toHaveLength(4);
    expect(
      pivots(SESSION).methods.some((entry) => entry.method === "woodie"),
    ).toBe(false);
  });
});

describe("computePivots — classic", () => {
  it("reflects the range around the pivot", () => {
    const classic = method(SESSION, "classic");
    const p = 151_000 / 3;
    expect(classic.resistance[0]).toBeCloseTo(2 * p - 48_000, 8);
    expect(classic.support[0]).toBeCloseTo(2 * p - 52_000, 8);
    expect(classic.resistance[1]).toBeCloseTo(p + 4_000, 8);
    expect(classic.support[1]).toBeCloseTo(p - 4_000, 8);
  });

  it("orders the levels outward from the pivot", () => {
    const classic = method(SESSION, "classic");
    expect(classic.resistance[0]).toBeLessThan(classic.resistance[1]);
    expect(classic.resistance[1]).toBeLessThan(classic.resistance[2]);
    expect(classic.support[0]).toBeGreaterThan(classic.support[1]);
    expect(classic.support[1]).toBeGreaterThan(classic.support[2]);
  });

  it("straddles the pivot", () => {
    const classic = method(SESSION, "classic");
    for (const level of classic.resistance) {
      expect(level).toBeGreaterThan(classic.pivot);
    }
    for (const level of classic.support) {
      expect(level).toBeLessThan(classic.pivot);
    }
  });
});

describe("computePivots — fibonacci", () => {
  it("scales the range by the Fibonacci fractions", () => {
    const fib = method(SESSION, "fibonacci");
    const p = 151_000 / 3;
    expect(fib.resistance[0]).toBeCloseTo(p + 0.382 * 4_000, 8);
    expect(fib.resistance[1]).toBeCloseTo(p + 0.618 * 4_000, 8);
    expect(fib.resistance[2]).toBeCloseTo(p + 4_000, 8);
    expect(fib.support[0]).toBeCloseTo(p - 0.382 * 4_000, 8);
  });

  it("shares the classic pivot", () => {
    expect(method(SESSION, "fibonacci").pivot).toBeCloseTo(
      method(SESSION, "classic").pivot,
      10,
    );
  });

  it("is symmetric about the pivot, unlike classic", () => {
    const fib = method(SESSION, "fibonacci");
    for (let index = 0; index < 3; index += 1) {
      expect(fib.resistance[index] - fib.pivot).toBeCloseTo(
        fib.pivot - fib.support[index],
        8,
      );
    }
  });
});

describe("computePivots — camarilla", () => {
  it("builds off the close, not the pivot", () => {
    const cam = method(SESSION, "camarilla");
    expect(cam.resistance[0]).toBeCloseTo(51_000 + (4_000 * 1.1) / 12, 8);
    expect(cam.resistance[2]).toBeCloseTo(51_000 + (4_000 * 1.1) / 4, 8);
    expect(cam.support[0]).toBeCloseTo(51_000 - (4_000 * 1.1) / 12, 8);
  });

  it("produces tighter levels than the classic method", () => {
    const cam = method(SESSION, "camarilla");
    const classic = method(SESSION, "classic");
    const camSpan = cam.resistance[2] - cam.support[2];
    const classicSpan = classic.resistance[2] - classic.support[2];
    expect(camSpan).toBeLessThan(classicSpan);
  });

  it("centres on the close, so it need not straddle the pivot", () => {
    // A close near the high puts every Camarilla level above the pivot —
    // which is the method behaving, and why it is shown separately.
    const cam = method({ high: 52_000, low: 48_000, close: 51_900 }, "camarilla");
    expect(cam.support[0]).toBeGreaterThan(cam.pivot);
  });
});

describe("computePivots — woodie", () => {
  it("weights the open, so its pivot differs from the classic one", () => {
    const woodie = method({ ...SESSION, open: 50_500 }, "woodie");
    // (52.000 + 48.000 + 2 × 50.500) ÷ 4 = 50.250.
    expect(woodie.pivot).toBeCloseTo(50_250, 8);
    expect(woodie.pivot).not.toBeCloseTo(151_000 / 3, 2);
  });

  it("still differs from classic when the open equals the close", () => {
    // Worth pinning because it is easy to assume otherwise: Woodie weights
    // its fourth price DOUBLE, so (H + L + 2C)/4 ≠ (H + L + C)/3 even when
    // the open and close are the same number.
    const woodie = method({ ...SESSION, open: 51_000 }, "woodie");
    expect(woodie.pivot).toBeCloseTo(50_500, 8);
    expect(woodie.pivot).not.toBeCloseTo(151_000 / 3, 2);
    // It leans toward the close, so it sits above the classic pivot here.
    expect(woodie.pivot).toBeGreaterThan(method(SESSION, "classic").pivot);
  });

  it("moves with a gap open", () => {
    const gapUp = method({ ...SESSION, open: 53_000 }, "woodie").pivot;
    const gapDown = method({ ...SESSION, open: 47_000 }, "woodie").pivot;
    expect(gapUp).toBeGreaterThan(gapDown);
  });

  it("allows an open outside the previous session's range", () => {
    // A gap through yesterday's high is normal; only the previous session's
    // own close has to sit inside its range.
    expect(computePivots({ ...SESSION, open: 60_000 })).not.toBeNull();
  });
});

describe("computePivots — the methods disagree, deliberately", () => {
  it("gives four different first resistances", () => {
    const result = pivots({ ...SESSION, open: 50_500 });
    const firsts = result.methods.map((entry) => entry.resistance[0]);
    expect(new Set(firsts.map((value) => value.toFixed(4))).size).toBe(4);
  });
});

describe("computePivots — edges and rejection", () => {
  it("collapses every level onto one price in a locked session", () => {
    const result = pivots({ high: 50_000, low: 50_000, close: 50_000 });
    expect(result.range).toBe(0);
    expect(result.closePositionPercent).toBe(50);
    const classic = result.methods.find((m) => m.method === "classic")!;
    expect(classic.pivot).toBeCloseTo(50_000, 8);
    for (const level of [...classic.resistance, ...classic.support]) {
      expect(level).toBeCloseTo(50_000, 8);
    }
  });

  it("rejects a close outside the session's range", () => {
    expect(
      computePivots({ high: 52_000, low: 48_000, close: 52_001 }),
    ).toBeNull();
    expect(
      computePivots({ high: 52_000, low: 48_000, close: 47_999 }),
    ).toBeNull();
  });

  it("rejects a low above the high", () => {
    expect(
      computePivots({ high: 48_000, low: 52_000, close: 50_000 }),
    ).toBeNull();
  });

  it("returns null rather than a guess", () => {
    expect(computePivots({ ...SESSION, high: 0 })).toBeNull();
    expect(computePivots({ ...SESSION, low: 0 })).toBeNull();
    expect(computePivots({ ...SESSION, close: -1 })).toBeNull();
    expect(computePivots({ ...SESSION, open: 0 })).toBeNull();
    expect(computePivots({ ...SESSION, high: Number.NaN })).toBeNull();
    expect(computePivots({ ...SESSION, open: Number.NaN })).toBeNull();
  });
});
