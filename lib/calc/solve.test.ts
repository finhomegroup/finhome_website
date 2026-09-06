import { describe, it, expect } from "vitest";
import { bisect } from "@/lib/calc/solve";

describe("bisect", () => {
  it("finds a simple root", () => {
    const root = bisect((x) => x * x - 4, 0, 10);
    expect(root).not.toBeNull();
    expect(root as number).toBeCloseTo(2, 8);
  });

  it("returns an exact endpoint when it is already the root", () => {
    expect(bisect((x) => x - 3, 3, 10)).toBe(3);
    expect(bisect((x) => x - 10, 3, 10)).toBe(10);
  });

  it("returns null when the interval does not bracket a root", () => {
    // f(3)=5 and f(10)=96 are both positive: no sign change, so no root here.
    expect(bisect((x) => x * x - 4, 3, 10)).toBeNull();
  });

  it("returns null when the function is not finite at an endpoint", () => {
    expect(bisect(() => Number.NaN, 0, 1)).toBeNull();
    expect(bisect((x) => 1 / x, 0, 1)).toBeNull();
  });

  it("returns null for a reversed or degenerate bracket", () => {
    // Same function and bounds as the bracketing test, but the wrong way round.
    // Without the guard this returns 5 — a confident non-root.
    expect(bisect((x) => x * x - 4, 10, 0)).toBeNull();
    expect(bisect((x) => x * x - 4, 5, 5)).toBeNull();
    expect(bisect((x) => x * x - 4, Number.NaN, 10)).toBeNull();
  });

  it("recovers a known IRR from a cash-flow series", () => {
    const flows = [-1000, 500, 500, 500];
    const npv = (r: number) =>
      flows.reduce((sum, cf, i) => sum + cf / (1 + r) ** i, 0);

    const irr = bisect(npv, -0.9, 10);
    expect(irr).not.toBeNull();
    expect(irr as number).toBeCloseTo(0.23375193, 6);
    // The defining property matters more than the digits: NPV at the IRR is 0.
    expect(npv(irr as number)).toBeCloseTo(0, 6);
  });

  it("honours an explicit tolerance", () => {
    const loose = bisect((x) => x * x - 2, 0, 2, { tolerance: 1e-2 });
    expect(loose as number).toBeCloseTo(Math.SQRT2, 1);
  });
});
