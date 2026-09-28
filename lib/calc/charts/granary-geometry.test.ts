// The granary's one piece of drawing arithmetic: the rice level is solved by
// AREA on the very polygon that is drawn, so a bowl drawn at a share holds
// exactly that share of its capacity.
import { describe, expect, it } from "vitest";
import {
  BOWL,
  CAPACITY_AREA,
  GROUP_HEIGHT,
  GROUP_SIZE,
  GROUP_WIDTH,
  bowlBody,
  bowlCapacity,
  bowlCenter,
  bowlFillPolygon,
  bowlHatch,
  pathAttr,
  pointsAttr,
  polygonArea,
  type Point,
} from "./granary-geometry";

/** True when `p` is inside the convex polygon, or on its edge within `eps`. */
function insideConvex(poly: readonly Point[], p: Point, eps = 1e-9): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (Math.abs(cross) <= eps) continue;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

describe("granary geometry", () => {
  const cx = bowlCenter(2);

  it("fills by area, not by height", () => {
    for (const f of [0.01, 0.1406, 0.25, 0.5, 0.75, 0.9, 0.99]) {
      const polygon = bowlFillPolygon(cx, f);
      expect(polygon).not.toBeNull();
      expect(polygonArea(polygon!) / CAPACITY_AREA).toBeCloseTo(f, 9);
    }
    // And the difference is visible: a seventh of the rice already reaches a
    // quarter of the way up the body, because the bowl narrows to its base.
    const rimY = bowlBody(cx)[0].y;
    const baseY = Math.max(...bowlBody(cx).map((p) => p.y));
    const level = Math.min(...bowlFillPolygon(cx, 0.1406)!.map((p) => p.y));
    expect((baseY - level) / (baseY - rimY)).toBeGreaterThan(0.25);
  });

  it("draws nothing for an empty bowl and the whole capacity for a full one", () => {
    expect(bowlFillPolygon(cx, 0)).toBeNull();
    expect(bowlFillPolygon(cx, Number.NaN)).toBeNull();
    expect(bowlFillPolygon(cx, 1)).toEqual(bowlCapacity(cx));
    expect(polygonArea(bowlCapacity(cx))).toBeCloseTo(CAPACITY_AREA, 9);
  });

  it("keeps a full bowl's heap above the rim, and every point inside the group", () => {
    const rimY = bowlBody(cx)[0].y;
    const top = Math.min(...bowlCapacity(cx).map((p) => p.y));
    expect(rimY - top).toBeCloseTo(BOWL.heap, 9);
    for (const p of bowlCapacity(cx)) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(GROUP_HEIGHT);
    }
  });

  it("keeps every hatch segment inside the bowl it shades", () => {
    const capacity = bowlCapacity(cx);
    const hatch = bowlHatch(cx);
    expect(hatch.length).toBeGreaterThan(2);
    for (const { a, b } of hatch) {
      expect(insideConvex(capacity, a, 1e-7)).toBe(true);
      expect(insideConvex(capacity, b, 1e-7)).toBe(true);
    }
  });

  it("lays five bowls inside one group's width", () => {
    expect(bowlCenter(0) - BOWL.rim / 2).toBeGreaterThan(0);
    expect(bowlCenter(GROUP_SIZE - 1) + BOWL.rim / 2).toBeLessThan(GROUP_WIDTH);
  });

  it("emits deterministic attribute strings", () => {
    const pts = bowlBody(cx);
    expect(pointsAttr(pts)).toBe(pointsAttr(bowlBody(cx)));
    expect(pathAttr(pts, false)).toMatch(/^M[\d.]+,[\d.]+( L[\d.]+,[\d.]+)+$/);
    expect(pathAttr(pts)).toMatch(/ Z$/);
  });
});
