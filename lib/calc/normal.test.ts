import { describe, it, expect } from "vitest";
import {
  inverseNormalCdf,
  normalCdf,
  normalPdf,
} from "@/lib/calc/normal";

describe("normalPdf", () => {
  it("peaks at zero with the known height", () => {
    // 1 / sqrt(2π) = 0,3989422804…
    expect(normalPdf(0)).toBeCloseTo(0.398_942_280_4, 9);
  });

  it("is symmetric", () => {
    for (const x of [0.5, 1, 1.96, 3]) {
      expect(normalPdf(-x)).toBeCloseTo(normalPdf(x), 12);
    }
  });

  it("matches published values", () => {
    expect(normalPdf(1)).toBeCloseTo(0.241_970_724_5, 9);
    expect(normalPdf(2)).toBeCloseTo(0.053_990_966_5, 9);
  });

  it("returns NaN for a non-finite input", () => {
    expect(Number.isNaN(normalPdf(Number.NaN))).toBe(true);
    expect(Number.isNaN(normalPdf(Number.POSITIVE_INFINITY))).toBe(true);
  });
});

describe("normalCdf — against published values", () => {
  it("is a half at zero, to the approximation's accuracy", () => {
    // Not "exactly": A&S 26.2.17 has a stated absolute error up to 7,5e-8,
    // so no assertion here should be tighter than that.
    expect(normalCdf(0)).toBeCloseTo(0.5, 7);
  });

  it("matches the standard table", () => {
    // Six places, i.e. within 5e-7: comfortably inside the approximation's
    // stated 7,5e-8 error, and not so tight that a correct implementation
    // fails.
    expect(normalCdf(1)).toBeCloseTo(0.841_344_746, 6);
    expect(normalCdf(-1)).toBeCloseTo(0.158_655_254, 6);
    expect(normalCdf(1.644_853_627)).toBeCloseTo(0.95, 6);
    expect(normalCdf(1.959_963_985)).toBeCloseTo(0.975, 6);
    expect(normalCdf(2.326_347_874)).toBeCloseTo(0.99, 6);
    expect(normalCdf(2.575_829_304)).toBeCloseTo(0.995, 6);
    expect(normalCdf(3)).toBeCloseTo(0.998_650_102, 6);
  });

  it("keeps the symmetry Φ(−x) = 1 − Φ(x) exactly", () => {
    // Exact, not approximate: the negative branch is computed from this
    // identity rather than from a separate fit.
    for (const x of [0.1, 0.5, 1, 1.96, 2.5, 4]) {
      expect(normalCdf(-x) + normalCdf(x)).toBeCloseTo(1, 12);
    }
  });

  it("covers the one-, two- and three-sigma intervals", () => {
    // Two CDF evaluations, so the errors add — one place looser again.
    expect(normalCdf(1) - normalCdf(-1)).toBeCloseTo(0.682_689_492, 6);
    expect(normalCdf(2) - normalCdf(-2)).toBeCloseTo(0.954_499_736, 6);
    expect(normalCdf(3) - normalCdf(-3)).toBeCloseTo(0.997_300_204, 6);
  });

  it("rises monotonically", () => {
    let previous = 0;
    for (let x = -5; x <= 5; x += 0.25) {
      const value = normalCdf(x);
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("stays inside 0 and 1 across a wide range", () => {
    for (let x = -40; x <= 40; x += 0.5) {
      const value = normalCdf(x);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("treats the infinities as limits, not errors", () => {
    // An option with infinite moneyness is a case the pricing code can hit.
    expect(normalCdf(Number.POSITIVE_INFINITY)).toBe(1);
    expect(normalCdf(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it("returns NaN for NaN", () => {
    expect(Number.isNaN(normalCdf(Number.NaN))).toBe(true);
  });
});

describe("inverseNormalCdf", () => {
  it("is zero at a half", () => {
    expect(inverseNormalCdf(0.5)).toBeCloseTo(0, 8);
  });

  it("matches the critical values people quote", () => {
    expect(inverseNormalCdf(0.95)!).toBeCloseTo(1.644_853_627, 5);
    expect(inverseNormalCdf(0.975)!).toBeCloseTo(1.959_963_985, 5);
    expect(inverseNormalCdf(0.99)!).toBeCloseTo(2.326_347_874, 4);
    expect(inverseNormalCdf(0.005)!).toBeCloseTo(-2.575_829_304, 4);
  });

  it("inverts normalCdf across the central region", () => {
    for (const probability of [0.05, 0.2, 0.4, 0.5, 0.6, 0.8, 0.95]) {
      const z = inverseNormalCdf(probability)!;
      expect(normalCdf(z)).toBeCloseTo(probability, 6);
    }
  });

  it("inverts normalCdf in the tails, to lower precision", () => {
    for (const probability of [0.001, 0.01, 0.99, 0.999]) {
      const z = inverseNormalCdf(probability)!;
      expect(normalCdf(z)).toBeCloseTo(probability, 4);
    }
  });

  it("is antisymmetric about a half", () => {
    for (const probability of [0.01, 0.1, 0.3, 0.45]) {
      expect(inverseNormalCdf(probability)!).toBeCloseTo(
        -inverseNormalCdf(1 - probability)!,
        5,
      );
    }
  });

  it("rises monotonically", () => {
    let previous = Number.NEGATIVE_INFINITY;
    for (let p = 0.01; p < 1; p += 0.01) {
      const value = inverseNormalCdf(p)!;
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });

  it("returns null where the answer is infinite", () => {
    // ±∞ is the honest answer, and a large finite number would be a guess.
    expect(inverseNormalCdf(0)).toBeNull();
    expect(inverseNormalCdf(1)).toBeNull();
    expect(inverseNormalCdf(-0.1)).toBeNull();
    expect(inverseNormalCdf(1.5)).toBeNull();
    expect(inverseNormalCdf(Number.NaN)).toBeNull();
  });
});
