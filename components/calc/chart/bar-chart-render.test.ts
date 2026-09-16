/**
 * `BarChart`'s rendering contracts, on models built here rather than on a
 * whole calculator.
 *
 * WHY THIS FILE EXISTS. Two defects an independent review found on the live
 * vehicle-budget figure at 390 px, neither of which any model test could see
 * because both lived in the renderer:
 *
 * 1. **Colour disagreed with the legend.** The fills were chosen by a
 *    segment's position INSIDE ITS OWN BAR, and the legend by position in the
 *    model's `legend` array. On a model where one bar omits an earlier
 *    segment — which happens whenever `segment()` drops a zero — the same key
 *    was drawn in two different colours on two bars, and neither matched its
 *    swatch.
 * 2. **The bar labels were svg `<text>`.** A 10-unit glyph in a 360-unit
 *    viewBox renders around 8px at a 300px plot. Labels and nine-digit totals
 *    are HTML now.
 *
 * `renderToStaticMarkup` in the runner's node environment, per docs §6.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { SERIES_FILL } from "@/components/calc/chart/chart-figure";
import { barOf, finishBars, segment } from "@/lib/calc/charts/bars";
import {
  paletteIndexByKey,
  paletteSlot,
} from "@/lib/calc/charts/palette";
import type { BarChartModel } from "@/lib/calc/charts/types";

const WORDS = { currency: "₫", million: "triệu", billion: "tỷ" };

/**
 * A model whose FIRST bar omits the segments the later bars start with —
 * exactly the shape the vehicle-budget figure has, where the income bar
 * carries only `income` and the two budget bars start at `essentials`.
 */
function omittedSegmentModel(): BarChartModel {
  return finishBars(
    [
      barOf(
        "income",
        "Thu nhập",
        [segment("income", "Thu nhập", 30_000_000, WORDS)],
        WORDS,
      ),
      barOf(
        "spend",
        "Phân bổ",
        [
          segment("essentials", "Thiết yếu", 22_000_000, WORDS),
          segment("leftover", "Còn lại", 8_000_000, WORDS),
        ],
        WORDS,
        true,
      ),
    ],
    [
      { key: "income", label: "Thu nhập" },
      { key: "essentials", label: "Thiết yếu" },
      { key: "leftover", label: "Còn lại" },
    ],
    "Số tiền ({unit})",
    WORDS,
    {
      title: "Ví dụ",
      summary: "Tóm tắt",
      assumptions: [],
      tableCaption: "Bảng",
      itemColumn: "Khoản",
      amountColumn: "Số tiền",
    },
  );
}

const draw = (model: BarChartModel) =>
  renderToStaticMarkup(createElement(BarChart, { model }));

/** Fill classes in the order they appear in the markup. */
function fills(markup: string): string[] {
  return [...markup.matchAll(/class="(fill-[a-z0-9-/]+)"/g)].map((m) => m[1]);
}

describe("BarChart — colour follows the segment KEY", () => {
  it("gives a key the same fill on every bar that draws it", () => {
    const model = finishBars(
      [
        barOf(
          "a",
          "A",
          [
            segment("x", "X", 10, WORDS),
            segment("y", "Y", 10, WORDS),
          ],
          WORDS,
        ),
        // `x` is absent here, so `y` is this bar's FIRST segment. Under the
        // positional rule it took slot 0 — `x`'s colour.
        barOf("b", "B", [segment("y", "Y", 10, WORDS)], WORDS),
      ],
      [
        { key: "x", label: "X" },
        { key: "y", label: "Y" },
      ],
      "({unit})",
      WORDS,
      {
        title: "t",
        summary: "s",
        assumptions: [],
        tableCaption: "c",
        itemColumn: "i",
        amountColumn: "a",
      },
    );

    // Track fills are the `fill-bg-soft` rects plus one per segment. Drop the
    // tracks and read the segment fills in order: x, y (bar A), then y (bar B).
    const segmentFills = fills(draw(model)).filter(
      (fill) => fill !== "fill-bg-soft",
    );
    expect(segmentFills).toHaveLength(3);
    expect(segmentFills[0]).toBe(SERIES_FILL[0]);
    expect(segmentFills[1]).toBe(SERIES_FILL[1]);
    // The defect in one assertion: `y` on bar B must still be `y`'s colour.
    expect(segmentFills[2]).toBe(SERIES_FILL[1]);
    expect(segmentFills[2]).not.toBe(SERIES_FILL[0]);
  });

  it("derives its fills from the SAME map the legend swatches use", () => {
    // `ChartFigure` is rendered with children by each calculator's own JSX,
    // and a `.ts` test cannot build that element without either a `children`
    // prop (which `react/no-children-prop` forbids) or a type error. So the
    // agreement is asserted where it actually matters — on the shared map,
    // which both consumers read — and end to end on a real calculator's
    // markup in `chart-render.test.ts`.
    const model = omittedSegmentModel();
    const slots = paletteIndexByKey({
      legend: model.legend,
      segmentKeys: model.bars.flatMap((bar) =>
        bar.segments.map((s) => s.key),
      ),
    });

    // The swatch for legend entry i uses slot i, because the legend defines
    // the order. So a fill matching `slots.get(key)` matches its swatch.
    const segmentFills = fills(draw(model)).filter(
      (f) => f !== "fill-bg-soft",
    );
    const drawnKeys = model.bars.flatMap((bar) =>
      bar.segments.map((s) => s.key),
    );
    expect(segmentFills).toHaveLength(drawnKeys.length);
    drawnKeys.forEach((key, index) => {
      expect(segmentFills[index], key).toBe(
        SERIES_FILL[paletteSlot(slots, key, index)],
      );
    });
    // And "essentials" — legend slot 1 — is the brand green in the plot even
    // though it is the FIRST segment of its own bar.
    expect(slots.get("essentials")).toBe(1);
    expect(segmentFills[1]).toBe("fill-brand-green");
  });

  it("keeps a drawn key the legend never names out of the legend's slots", () => {
    const model = finishBars(
      [
        barOf(
          "only",
          "Only",
          [
            segment("listed", "Listed", 10, WORDS),
            segment("unlisted", "Unlisted", 10, WORDS),
          ],
          WORDS,
        ),
      ],
      [{ key: "listed", label: "Listed" }],
      "({unit})",
      WORDS,
      {
        title: "t",
        summary: "s",
        assumptions: [],
        tableCaption: "c",
        itemColumn: "i",
        amountColumn: "a",
      },
    );
    const segmentFills = fills(draw(model)).filter(
      (f) => f !== "fill-bg-soft",
    );
    // `listed` owns slot 0 from the legend; `unlisted` is appended at slot 1
    // rather than colliding with it.
    expect(segmentFills).toEqual([SERIES_FILL[0], SERIES_FILL[1]]);
  });
});

describe("BarChart — labels and totals are readable text", () => {
  const markup = draw(omittedSegmentModel());

  it("renders every bar label as HTML, not as svg text", () => {
    expect(markup).toContain("Thu nhập");
    expect(markup).toContain("Phân bổ");
    // No `<text>` carrying a label: the only svg text left is the tick row.
    expect(markup).not.toMatch(/<text[^>]*>Thu nhập</);
    expect(markup).not.toMatch(/<text[^>]*>Phân bổ</);
  });

  it("renders the totals as HTML too", () => {
    expect(markup).toContain("30.000.000 ₫");
    expect(markup).not.toMatch(/<text[^>]*>30\.000\.000/);
  });

  it("keeps the tick numbers inside the svg, where they line up", () => {
    // Only the ticks need positioning against the plot — see `geometry.ts`.
    const texts = [...markup.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(
      (m) => m[1],
    );
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      expect(text).not.toContain("Thu nhập");
      expect(text).not.toContain("Phân bổ");
    }
  });

  it("hides every drawing it emits from assistive technology", () => {
    const svgs = markup.match(/<svg[^>]*>/g) ?? [];
    // One track per bar, plus the tick row.
    expect(svgs).toHaveLength(3);
    for (const svg of svgs) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
  });

  it("marks the emphasised bar with an outline, not a colour change", () => {
    // A shape, so it reads without colour vision.
    expect(markup).toContain('class="stroke-ink"');
  });

  it("draws nothing at all for an empty model", () => {
    const empty = finishBars([], [], "({unit})", WORDS, {
      title: "t",
      summary: "s",
      assumptions: [],
      tableCaption: "c",
      itemColumn: "i",
      amountColumn: "a",
    });
    expect(draw(empty)).toBe("");
  });
});
