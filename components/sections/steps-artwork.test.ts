import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { STEPS_SECTION } from "@/content/home";

/**
 * THE STEP CARD ARTWORK MUST NOT BE CROPPED BY THE VIEWPORT'S HEIGHT.
 *
 * `components/sections/steps.tsx` renders each step illustration in a
 * fixed-height box with `object-cover`, which crops whatever does not fit.
 * That is the Framer design — the 210px header deliberately trims the
 * artwork's blank artboard margin — and it is fine as long as the box's
 * aspect ratio stays near the artwork's.
 *
 * It did not. From `86a9215` to 2026-09-16 the box read
 * `h-[min(210px,22dvh)]`, a leftover from a one-viewport scroll-snap homepage
 * that `376183b` reverted (that commit's own message says it was "drop[ping]
 * the leftover dvh height cap on the steps artwork"; it fixed the lead artwork
 * and missed the card header). Because the height came from the VIEWPORT while
 * the width came from the GRID, the crop grew without bound as the window got
 * shorter. Measured in a browser: 24.8% of the artwork gone at 1280x800, 19%
 * at 390x844 — which is a user report of "Phân khúc phù hợp" sliced in half —
 * and 66.4% at 844x390, where a chart became a horizontal band.
 *
 * WHY THIS IS A CONDITIONAL AND NOT A STRING MATCH. Pinning the literal
 * `h-[210px]` would fail any honest refactor and would not say why. The real
 * rule is an implication: a box that CROPS (`object-cover`) may not take its
 * height from the viewport. Switching the image to `object-contain` — which is
 * how the lead artwork in the same file handles short viewports, scaling
 * instead of slicing — legitimately satisfies this test rather than fighting
 * it. That is the intended escape hatch.
 *
 * The crop ceiling is checked against the artwork's REAL aspect ratio, read
 * from each SVG's viewBox rather than assumed, so replacing an illustration
 * with a squarer one also trips this.
 *
 * Nothing here observes appearance; per the repo's AGENTS.md the suite cannot.
 * It checks that the geometry which PRODUCES the appearance stayed within the
 * bounds a browser measurement established.
 */

const source = readFileSync(
  new URL("./steps.tsx", import.meta.url),
  "utf8",
);

/**
 * Only the card header is in scope. The same file also renders the lead
 * artwork, which is `object-contain` and legitimately capped against `dvh` —
 * matching file-wide would conflate the two and forbid the correct pattern.
 * Anchored on the declarations rather than on line numbers.
 */
const CARD_START = "function StepCard";
const CARD_END = "export function Steps";

function stepCardSource(): string {
  const start = source.indexOf(CARD_START);
  const end = source.indexOf(CARD_END);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(
      `could not slice ${CARD_START}..${CARD_END} out of steps.tsx — ` +
        "the anchors were renamed; re-anchor this guard rather than deleting it",
    );
  }
  return source.slice(start, end);
}

/** Viewport-relative length units. A height in any of these is the defect. */
const VIEWPORT_HEIGHT_UNIT = /\b\d*\.?\d+(dvh|svh|lvh|vh)\b/;

/** The artwork box: the `overflow-hidden` wrapper holding the `<img>`. */
const HEADER_HEIGHT = /className="h-\[([^\]]+)\] overflow-hidden"/;

/**
 * Card widths MEASURED in a browser on 2026-09-16, one per grid breakpoint,
 * on the built export at a verified layout viewport. Widths are what the grid
 * produces, so they cannot be derived from this file alone — they are pinned
 * here with the viewport that produced them, the same way
 * `wide-table-pending.test.ts` pins `measured390`.
 *
 * `worstCase` marks the two-column breakpoint, which yields the WIDEST card
 * (390px) and therefore the deepest crop against a fixed-height box.
 */
const MEASURED_CARD_WIDTHS = [
  { viewport: "390x844", columns: 1, cardWidth: 350 },
  { viewport: "844x390", columns: 2, cardWidth: 390, worstCase: true },
  { viewport: "1280x800", columns: 3, cardWidth: 357 },
] as const;

/**
 * The most of the artwork's height the design may trim, as a fraction.
 *
 * THIS CEILING IS NOT THE GUARD AGAINST THE DVH DEFECT — the implication test
 * above is, and it is the one that fails on `min(210px,22dvh)`. Saying so
 * matters, because the numbers are too close to do both jobs: after the fix
 * the worst measured case is 17.6% (the two-column breakpoint), while the
 * MILDEST case under the old cap was 19%. A ceiling threaded between those two
 * would trip on about 4px of card-width drift, which is a guard that cries
 * wolf rather than one that holds a line.
 *
 * So this bounds a different failure: ARTWORK AND LAYOUT DRIFT. 0.25 clears
 * the measured 8.4% / 17.6% / 10.3% with room for ordinary padding changes,
 * and a materially squarer illustration dropped into these cards blows through
 * it — which the vacuity test below demonstrates rather than assumes. It is a
 * bound on the design, not a target; re-measure in a browser before raising it.
 */
const MAX_CROP_FRACTION = 0.25;

function artworkAspect(icon: string): number {
  const svg = readFileSync(
    new URL(`../../public/images/${icon}`, import.meta.url),
    "utf8",
  );
  const viewBox = /viewBox="([\d.\s-]+)"/.exec(svg);
  if (!viewBox) throw new Error(`${icon} has no viewBox to derive an aspect from`);
  // viewBox is "min-x min-y width height" — the extent is indexes 2 and 3.
  const [, , w, h] = viewBox[1].trim().split(/\s+/).map(Number);
  if (!w || !h) throw new Error(`${icon} viewBox has no usable extent: ${viewBox[1]}`);
  return w / h;
}

/**
 * Fraction of the artwork's HEIGHT that `object-cover` discards.
 *
 * `object-cover` scales to the larger of the two ratios. When the box is wider
 * per unit height than the artwork, the scale is set by width, the drawn
 * height becomes `w / aspect`, and the visible share is `h * aspect / w`.
 * A box narrower than the artwork crops horizontally instead, which returns 0
 * here — deliberately, since the reported defect is vertical slicing.
 */
function verticalCropFraction(
  boxWidth: number,
  boxHeight: number,
  aspect: number,
): number {
  const drawnHeight = boxWidth / aspect;
  if (drawnHeight <= boxHeight) return 0;
  return 1 - boxHeight / drawnHeight;
}

describe("step card artwork geometry", () => {
  const card = stepCardSource();

  it("slices a non-trivial StepCard body out of steps.tsx", () => {
    // Non-vacuity floor: every assertion below reads this slice, so a silently
    // empty one would turn the whole file green while checking nothing.
    expect(card.length).toBeGreaterThan(200);
    expect(card).toContain("<img");
  });

  it("crops the artwork, which is why the rest of this file exists", () => {
    // If this stops holding the box no longer crops and the height is free.
    expect(card).toMatch(/object-cover/);
  });

  it("gives the cropping box a height that does not depend on the viewport", () => {
    const match = HEADER_HEIGHT.exec(card);
    expect(match, "no `h-[...] overflow-hidden` artwork box found in StepCard").not.toBeNull();

    const height = match![1];
    expect(
      VIEWPORT_HEIGHT_UNIT.test(height),
      `the artwork box is \`h-[${height}]\`. Its width comes from the grid and ` +
        "its height would come from the viewport, so `object-cover` would crop " +
        "the illustration by an amount that grows as the window gets shorter " +
        "(measured up to 66.4% at 844x390). Use a fixed height, or switch the " +
        "image to `object-contain` so a shorter box scales the artwork instead " +
        "of slicing it.",
    ).toBe(false);

    // A fixed pixel length is what the -9px nudge on card 0 was calibrated
    // against in `ab0cd6e`; anything else needs that nudge re-checked.
    expect(height).toMatch(/^\d+px$/);
  });

  it("detects a reintroduced dvh cap", () => {
    // Discrimination control. The assertion above passes trivially if the
    // detector cannot see the defect it names, so run it against the exact
    // string that shipped the bug, plus the rest of the unit family.
    expect(VIEWPORT_HEIGHT_UNIT.test("min(210px,22dvh)")).toBe(true);
    expect(VIEWPORT_HEIGHT_UNIT.test("min(280px,32svh)")).toBe(true);
    expect(VIEWPORT_HEIGHT_UNIT.test("50vh")).toBe(true);
    // ...and must not fire on the fixed height that fixed it, nor on unrelated
    // lengths that merely contain those letters.
    expect(VIEWPORT_HEIGHT_UNIT.test("210px")).toBe(false);
    expect(VIEWPORT_HEIGHT_UNIT.test("444px")).toBe(false);
  });

  it("keeps all three illustrations on one aspect ratio", () => {
    // One height serves all three cards, so they have to agree. If an artwork
    // is swapped for a different shape, the shared 210px stops being right for
    // every card and the crop ceiling below is no longer a single number.
    const aspects = STEPS_SECTION.steps.map((step) => artworkAspect(step.icon));
    expect(aspects.length).toBeGreaterThanOrEqual(3);
    for (const aspect of aspects) {
      expect(aspect).toBeCloseTo(aspects[0], 2);
    }
  });

  it("trims no more than the artboard margin at every measured breakpoint", () => {
    const match = HEADER_HEIGHT.exec(card);
    const fixedPx = match && /^(\d+)px$/.exec(match[1]);
    // Without a fixed height there is no single crop figure to bound: the box
    // is viewport-dependent and the test above is the one that says so. Report
    // that rather than dereferencing null and failing on a TypeError.
    expect(
      fixedPx,
      `the artwork box height is \`${match?.[1] ?? "(not found)"}\`, which is ` +
        "not a fixed pixel length, so the crop depends on the viewport and " +
        "cannot be bounded here — see the viewport-independence test above",
    ).not.toBeNull();

    const boxHeight = Number(fixedPx![1]);
    const aspect = artworkAspect(STEPS_SECTION.steps[0].icon);

    for (const { viewport, columns, cardWidth } of MEASURED_CARD_WIDTHS) {
      const crop = verticalCropFraction(cardWidth, boxHeight, aspect);
      expect(
        crop,
        `at ${viewport} the ${columns}-column grid gives a ${cardWidth}px card, ` +
          `so a ${boxHeight}px box discards ${(crop * 100).toFixed(1)}% of the ` +
          "artwork's height — above the ceiling this design accepts. Re-measure " +
          "in a browser before changing either the height or the ceiling.",
      ).toBeLessThanOrEqual(MAX_CROP_FRACTION);
    }
  });

  it("states a ceiling that some plausible artwork would breach", () => {
    // Vacuity control for the ceiling. A threshold nothing can exceed is not a
    // guard, so show the case it is there for: a square-ish illustration in the
    // same cards. At the narrowest measured card that is 1 - 210/350 = 40%.
    const square = verticalCropFraction(350, 210, 1);
    expect(square).toBeGreaterThan(MAX_CROP_FRACTION);

    // And the shape actually shipped must sit comfortably inside it, not on
    // the edge — otherwise the next padding tweak turns this file red.
    const shipped = verticalCropFraction(390, 210, artworkAspect(STEPS_SECTION.steps[0].icon));
    expect(MAX_CROP_FRACTION - shipped).toBeGreaterThan(0.05);
  });
});
