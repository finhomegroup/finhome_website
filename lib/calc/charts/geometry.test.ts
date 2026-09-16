import { describe, it, expect } from "vitest";
import {
  PLOT,
  PLOT_TWO_AXES,
  areaPath,
  linePath,
  stackSegments,
  xFor,
  yFor,
  yForFraction,
} from "@/lib/calc/charts/geometry";

describe("xFor", () => {
  it("puts period 0 at the left edge and the maximum at the right", () => {
    expect(xFor(0, 240, PLOT)).toBe(PLOT.left);
    expect(xFor(240, 240, PLOT)).toBe(PLOT.right);
  });

  it("is linear in between", () => {
    const mid = xFor(120, 240, PLOT);
    expect(mid).toBeCloseTo((PLOT.left + PLOT.right) / 2, 6);
  });

  it("clamps a period past the axis inside the plot", () => {
    // A goal reached at month 47,06 drawn on a 48-month axis is inside; a
    // marker at month 300 on a 240-month axis must not be drawn off the edge.
    expect(xFor(300, 240, PLOT)).toBe(PLOT.right);
    expect(xFor(-5, 240, PLOT)).toBe(PLOT.left);
  });

  it("collapses to the left edge when there is no axis", () => {
    expect(xFor(10, 0, PLOT)).toBe(PLOT.left);
  });

  it("respects a narrower plot when a second axis takes the right margin", () => {
    expect(PLOT_TWO_AXES.right).toBeLessThan(PLOT.right);
    expect(xFor(240, 240, PLOT_TWO_AXES)).toBe(PLOT_TWO_AXES.right);
  });
});

describe("yFor", () => {
  it("puts zero at the baseline and the maximum at the top", () => {
    // Inverted axis: SVG y grows downward, money grows upward.
    expect(yFor(0, 100, PLOT)).toBe(PLOT.bottom);
    expect(yFor(100, 100, PLOT)).toBe(PLOT.top);
  });

  it("is linear in between", () => {
    expect(yFor(50, 100, PLOT)).toBeCloseTo((PLOT.top + PLOT.bottom) / 2, 6);
  });

  it("clamps rather than drawing outside the plot", () => {
    expect(yFor(200, 100, PLOT)).toBe(PLOT.top);
    expect(yFor(-10, 100, PLOT)).toBe(PLOT.bottom);
  });

  it("collapses to the baseline when there is no axis", () => {
    expect(yFor(10, 0, PLOT)).toBe(PLOT.bottom);
  });
});

describe("yForFraction", () => {
  it("places an axis tick by its fraction", () => {
    expect(yForFraction(0, PLOT)).toBe(PLOT.bottom);
    expect(yForFraction(1, PLOT)).toBe(PLOT.top);
    expect(yForFraction(0.5, PLOT)).toBeCloseTo(
      (PLOT.top + PLOT.bottom) / 2,
      6,
    );
  });
});

describe("linePath", () => {
  const points = [
    { period: 1, value: 10 },
    { period: 5, value: 20 },
  ];

  it("draws a plain polyline when not stepping", () => {
    const path = linePath(points, 10, 20, PLOT, false);
    // Two commands: a move and one line.
    expect(path.match(/L/g)).toHaveLength(1);
    expect(path.startsWith("M ")).toBe(true);
  });

  it("holds then jumps when stepping", () => {
    // The mechanic: the previous LEVEL runs across to the new period, and only
    // then does the value change. Two L commands per segment, not one.
    const path = linePath(points, 10, 20, PLOT, true);
    expect(path.match(/L/g)).toHaveLength(2);

    const x5 = xFor(5, 10, PLOT);
    const y10 = yFor(10, 20, PLOT);
    const y20 = yFor(20, 20, PLOT);
    // ... across at the old level, then straight up at the same x.
    expect(path).toContain(`L ${x5} ${y10}`);
    expect(path).toContain(`L ${x5} ${y20}`);
  });

  it("never draws a diagonal between two payment levels when stepping", () => {
    // The defect this exists to prevent: a 52% payment jump rendered as a
    // gentle year-long climb. In step mode every segment is axis-parallel.
    const path = linePath(points, 10, 20, PLOT, true);
    const commands = path.split("L ").slice(1).map((c) => c.trim().split(" "));
    const start = path.slice(2).split(" L")[0].trim().split(" ");
    let [px, py] = start.map(Number);
    for (const [xs, ys] of commands) {
      const x = Number(xs);
      const y = Number(ys);
      const moved = (x !== px ? 1 : 0) + (y !== py ? 1 : 0);
      expect(moved, `segment from ${px},${py} to ${x},${y} is diagonal`)
        .toBeLessThanOrEqual(1);
      px = x;
      py = y;
    }
  });

  it("rounds coordinates so the prerendered path can hydrate identically", () => {
    // 17 digits of float per coordinate in the server HTML is both payload and
    // a hydration risk; two decimals is finer than a viewBox unit.
    const path = linePath(
      [
        { period: 1, value: 1 },
        { period: 3, value: 2 },
      ],
      7,
      3,
      PLOT,
      false,
    );
    for (const number of path.match(/-?\d+(\.\d+)?/g) ?? []) {
      const decimals = number.split(".")[1];
      expect((decimals ?? "").length).toBeLessThanOrEqual(2);
    }
  });

  it("returns nothing for an empty series", () => {
    expect(linePath([], 10, 10, PLOT, false)).toBe("");
    expect(linePath([], 10, 10, PLOT, true)).toBe("");
  });

  it("draws a single point as a bare move", () => {
    const path = linePath([{ period: 1, value: 5 }], 10, 10, PLOT, false);
    expect(path.startsWith("M ")).toBe(true);
    expect(path).not.toContain("L");
  });
});

describe("areaPath", () => {
  it("closes the line down to the baseline", () => {
    const path = areaPath(
      [
        { period: 0, value: 10 },
        { period: 5, value: 20 },
      ],
      10,
      20,
      PLOT,
      false,
    );
    expect(path.endsWith("Z")).toBe(true);
    expect(path).toContain(`${PLOT.bottom}`);
  });

  it("is empty when the line is empty, so no fill floats alone", () => {
    expect(areaPath([], 10, 10, PLOT, false)).toBe("");
  });
});

describe("stackSegments", () => {
  it("returns fractions that tile the stack without a gap or an overlap", () => {
    const stacked = stackSegments([25, 75], 100);
    expect(stacked[0]).toEqual({ offset: 0, size: 0.25 });
    expect(stacked[1]).toEqual({ offset: 0.25, size: 0.75 });
    const last = stacked[stacked.length - 1];
    expect(last.offset + last.size).toBeCloseTo(1, 12);
  });

  it("handles three segments", () => {
    const stacked = stackSegments([2, 3, 5], 10);
    expect(stacked.map((s) => s.offset)).toEqual([0, 0.2, 0.5]);
    expect(stacked.map((s) => s.size)).toEqual([0.2, 0.3, 0.5]);
  });

  it("treats a negative value as zero rather than drawing backwards", () => {
    const stacked = stackSegments([-5, 10], 10);
    expect(stacked[0].size).toBe(0);
    expect(stacked[1].size).toBe(1);
  });

  it("collapses everything when the total is zero", () => {
    expect(stackSegments([0, 0], 0)).toEqual([
      { offset: 0, size: 0 },
      { offset: 0, size: 0 },
    ]);
  });
});

describe("the plot box itself", () => {
  it("leaves room for tick labels on every side that has them", () => {
    expect(PLOT.left).toBeGreaterThan(0);
    expect(PLOT.right).toBeLessThan(PLOT.width);
    expect(PLOT.bottom).toBeLessThan(PLOT.height);
    expect(PLOT.top).toBeGreaterThan(0);
  });

  it("is wider than it is tall, which is what a period series wants", () => {
    expect(PLOT.right - PLOT.left).toBeGreaterThan(PLOT.bottom - PLOT.top);
  });
});
