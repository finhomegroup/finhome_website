/**
 * The drawing units of the retirement granary's bowls, and the one piece of
 * arithmetic the drawing owns: how high a fill reaches.
 *
 * Pure module: no React, no DOM, no Vietnamese. Unit-tested in
 * `granary-geometry.test.ts`.
 *
 * A BOWL OF RICE, SEEN FROM THE SIDE, CUT AWAY: a rounded body under the rim
 * and, when full, a low heap of rice above it — the shape a reader already
 * knows as "a full bowl". Both halves together are the bowl's CAPACITY, one
 * year's whole draw, sampled into a convex polygon.
 *
 * AREA, NOT HEIGHT. The body narrows towards its base, so a fill drawn at
 * `fill × height` would show a half-paid year as well under half a bowl. The
 * level is solved so the AREA of the rice drawn is the paid share of the
 * capacity drawn — the picture never invents rice. It is solved on the very
 * polygon that is drawn, by bisection with a fixed number of steps, so the
 * server's prerender and the client agree to the byte.
 *
 * NO `id`, NO `<use>`, NO `clipPath`. Every coordinate is emitted inline: a
 * page-level id in a component rendered once per group would collide, and the
 * hatch is precomputed as segments inside the bowl instead of being clipped.
 */

/** One group of bowls — the unit the eye counts without counting (subitizing). */
export const GROUP_SIZE = 5;

/** A bowl, in viewBox units. */
export const BOWL = {
  /** Width at the rim. */
  rim: 24,
  /** Depth of the body under the rim. */
  depth: 11,
  /** Height of the heap of rice above the rim when full. */
  heap: 4,
  /** Space between two bowls of one group. */
  gap: 5,
  /** The foot ring under the body. Decoration: it holds no rice. */
  foot: { width: 10, height: 2 },
} as const;

/** Space around the group, so the rim's lip and every stroke stay inside. */
const PAD = 3;
const TOP = 1;
const BOTTOM = 1;
/** Points per half of the outline — enough for a smooth curve at 30 px. */
const ARC_STEPS = 16;
/** Distance between two hatch lines, perpendicular to them, in units. */
const HATCH_STEP = 3.5;
/** A hatch segment shorter than this is a corner sliver, not a line. */
const HATCH_MIN = 1;
/** Bisection steps: 2^-60 of the bowl's height is far below one pixel. */
const LEVEL_STEPS = 60;

const RIM_Y = TOP + BOWL.heap;
const BASE_Y = RIM_Y + BOWL.depth;

export const GROUP_WIDTH =
  PAD * 2 + GROUP_SIZE * BOWL.rim + (GROUP_SIZE - 1) * BOWL.gap;
export const GROUP_HEIGHT = BASE_Y + BOWL.foot.height + BOTTOM;
export const GROUP_VIEWBOX = `0 0 ${GROUP_WIDTH} ${GROUP_HEIGHT}`;

export type Point = { x: number; y: number };
export type Segment = { a: Point; b: Point };

/** The horizontal centre of bowl `index` (0-based) inside its group. */
export function bowlCenter(index: number): number {
  return PAD + index * (BOWL.rim + BOWL.gap) + BOWL.rim / 2;
}

/** A half-ellipse from the rim's left end to its right end, `sign` −1 up, +1 down. */
function arc(cx: number, radius: number, sign: 1 | -1): Point[] {
  const half = BOWL.rim / 2;
  const points: Point[] = [];
  for (let i = 0; i <= ARC_STEPS; i += 1) {
    const t = Math.PI * (1 - i / ARC_STEPS);
    points.push({ x: cx + half * Math.cos(t), y: RIM_Y - sign * radius * Math.sin(t) });
  }
  return points;
}

/** The body's curve, rim to rim through the base — the line a bowl is drawn with. */
export function bowlBody(cx: number): Point[] {
  return arc(cx, BOWL.depth, -1);
}

/**
 * The capacity: the heap above the rim, left to right, then the body back.
 * Convex, because both halves are half-ellipses on the same chord.
 */
export function bowlCapacity(cx: number): Point[] {
  const heap = arc(cx, BOWL.heap, 1);
  const body = bowlBody(cx).reverse();
  return [...heap, ...body.slice(1, -1)];
}

/** Shoelace area of a simple polygon. */
export function polygonArea(points: readonly Point[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return Math.abs(sum) / 2;
}

/** The part of `poly` at or below the line y = `level` (screen y grows down). */
function below(poly: readonly Point[], level: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < poly.length; i += 1) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const pIn = p.y >= level;
    const qIn = q.y >= level;
    if (pIn) out.push(p);
    if (pIn !== qIn) {
      const t = (level - p.y) / (q.y - p.y);
      out.push({ x: p.x + (q.x - p.x) * t, y: level });
    }
  }
  return out;
}

/** The capacity's area — the same at every centre. */
export const CAPACITY_AREA = polygonArea(bowlCapacity(0));

/**
 * The rice in bowl `cx` as a polygon, or null when there is none to draw.
 *
 * `fill` of the capacity by area; `fill >= 1` is the whole capacity exactly,
 * not a solved level that lands a float residue under the heap's top.
 */
export function bowlFillPolygon(cx: number, fill: number): Point[] | null {
  if (!(fill > 0)) return null;
  const capacity = bowlCapacity(cx);
  if (fill >= 1) return capacity;
  const target = fill * CAPACITY_AREA;
  let high = TOP; // the heap's top: everything is below it
  let low = BASE_Y; // the base: nothing is below it
  for (let i = 0; i < LEVEL_STEPS; i += 1) {
    const mid = (high + low) / 2;
    if (polygonArea(below(capacity, mid)) > target) high = mid;
    else low = mid;
  }
  return below(capacity, (high + low) / 2);
}

/**
 * Diagonal hatch lines inside the capacity, as segments.
 *
 * Each line is `x + y = k` (rising to the right on screen), intersected with
 * the convex capacity edge by edge — so every endpoint lies on the outline
 * and nothing needs clipping.
 */
export function bowlHatch(cx: number): Segment[] {
  const poly = bowlCapacity(cx);
  const sums = poly.map((p) => p.x + p.y);
  const from = Math.min(...sums);
  const to = Math.max(...sums);
  const stride = HATCH_STEP * Math.SQRT2;
  const segments: Segment[] = [];
  for (let k = from + stride / 2; k < to; k += stride) {
    const hits: Point[] = [];
    for (let i = 0; i < poly.length; i += 1) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      const sp = p.x + p.y - k;
      const sq = q.x + q.y - k;
      if (sp === sq || (sp > 0 && sq > 0) || (sp < 0 && sq < 0)) continue;
      const t = sp / (sp - sq);
      hits.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
    if (hits.length < 2) continue;
    hits.sort((m, n) => m.x - n.x);
    const a = hits[0];
    const b = hits[hits.length - 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) >= HATCH_MIN) segments.push({ a, b });
  }
  return segments;
}

/** The rim's lip: a line a little wider than the bowl's mouth. */
export function bowlLip(cx: number): Segment {
  const half = BOWL.rim / 2 + 1.25;
  return { a: { x: cx - half, y: RIM_Y }, b: { x: cx + half, y: RIM_Y } };
}

/** The foot ring, as a short trapezoid under the base. */
export function bowlFoot(cx: number): Point[] {
  const { width, height } = BOWL.foot;
  return [
    { x: cx - width / 2 + 1, y: BASE_Y - 0.4 },
    { x: cx + width / 2 - 1, y: BASE_Y - 0.4 },
    { x: cx + width / 2, y: BASE_Y + height },
    { x: cx - width / 2, y: BASE_Y + height },
  ];
}

/**
 * Points as an SVG `points` string, three decimals.
 *
 * `toFixed` is specified exactly by ECMAScript, so the server's prerender and
 * the client's hydration emit the same attribute byte for byte.
 */
export function pointsAttr(points: readonly Point[]): string {
  return points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(" ");
}

/** An open path through `points`; `closed` adds the closing segment. */
export function pathAttr(points: readonly Point[], closed = true): string {
  return `M${pointsAttr(points).replace(/ /g, " L")}${closed ? " Z" : ""}`;
}
