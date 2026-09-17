/**
 * The legend's rendering contract, on models built here rather than on a whole
 * calculator.
 *
 * WHY THIS FILE EXISTS. A defect measured on the LIVE site at a verified
 * 390 px layout viewport, on `/blog/lai-co-dinh-hay-tha-noi/`:
 *
 *   plot     ink-3 SOLID · brand-green DASHED · brand-softgreen DOTTED
 *   legend   ink-3 dot   · brand-green dot    · brand-softgreen dot
 *
 * `ChartFigure` built its line legend with `model.series.map((s) => ({ key,
 * label }))` and dropped `s.stroke`, so the plot distinguished series on two
 * channels and the key that explains the plot distinguished them on one. That
 * is "colour is never the only channel" holding on the drawing and breaking in
 * the legend — the worse of the two places to break it, because the legend is
 * the only thing that maps a label to a line.
 *
 * It mattered concretely rather than theoretically: slots 1 and 2 are two
 * greens measured 1,75:1 apart from each other, under the ~15:1 that tells a
 * pair apart with full colour vision at all. A reader could separate the LINES
 * and still not know which label named which.
 *
 * `renderToStaticMarkup` in the runner's node environment, per docs §6 — and
 * the reason a module test could not see this is that the dropped field was in
 * JSX.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ChartFigure,
  SERIES_STROKE,
  STROKE_DASH,
} from "@/components/calc/chart/chart-figure";
import {
  PALETTE_SLOTS,
  paletteIndexByKey,
  paletteSlot,
} from "@/lib/calc/charts/palette";
import { LineChart } from "@/components/calc/chart/line-chart";
import type {
  BarChartModel,
  ChartSeries,
  LineChartModel,
} from "@/lib/calc/charts/types";

const TABLE = {
  caption: "Số liệu",
  columns: [{ label: "Kỳ" }, { label: "Giá trị", numeric: true }],
  rows: [["0", "0"]],
};

const AXIS = {
  label: "Giá trị (triệu)",
  ticks: [
    { at: 0, label: "0" },
    { at: 1, label: "10" },
  ],
};

/** Three series, one per stroke kind — the C11 shape. */
function threeSeriesModel(): LineChartModel {
  const stroke: ChartSeries["stroke"][] = ["solid", "dashed", "dotted"];
  return {
    kind: "lines",
    title: "Ba đường",
    summary: "Ba kịch bản.",
    assumptions: ["Giả lập."],
    table: TABLE,
    unavailable: null,
    series: stroke.map((s, i) => ({
      key: `s${i}`,
      label: `Kịch bản ${i + 1}`,
      stroke: s,
      points: [
        { period: 0, value: 1 + i },
        { period: 10, value: 5 + i },
      ],
    })),
    markers: [],
    references: [],
    xAxis: AXIS,
    yAxis: AXIS,
    xMax: 10,
    yMin: 0,
    yMax: 10,
    step: false,
  };
}

/** A bar model, whose legend entries are FILLS and must not change. */
function barModel(): BarChartModel {
  return {
    kind: "bars",
    title: "Hai cột",
    summary: "Hai thành phần.",
    assumptions: ["Giả lập."],
    table: TABLE,
    unavailable: null,
    bars: [
      {
        key: "b",
        label: "Tổng",
        total: 10,
        totalLabel: "10",
        segments: [
          { key: "a", label: "A", value: 6, valueLabel: "6" },
          { key: "b2", label: "B", value: 4, valueLabel: "4" },
        ],
      },
    ],
    max: 10,
    axis: AXIS,
    legend: [
      { key: "a", label: "A" },
      { key: "b2", label: "B" },
    ],
  };
}

/**
 * `children` GOES IN THE PROPS OBJECT, and the two checkers disagree about it.
 *
 * `ChartFigure` declares `children` as a required prop — it is the plot, and a
 * figure without one is a frame around nothing. `createElement`'s variadic
 * third argument does not satisfy a required prop, so `tsc` rejects the
 * idiomatic call; `react/no-children-prop` rejects the one `tsc` accepts. The
 * rule is about JSX authoring style and this is a `.test.ts` file, where JSX is
 * unavailable: `vitest.config.ts` includes `*.test.ts` only, and widening it
 * for one file is a bigger change than this comment.
 */
function renderLines(model: LineChartModel): string {
  return renderToStaticMarkup(
    // eslint-disable-next-line react/no-children-prop
    createElement(ChartFigure, {
      model,
      children: createElement(LineChart, { model }),
    }),
  );
}

/** Every `<line>` inside a legend mark svg, in document order. */
function legendMarks(html: string): { dash: string | null; cls: string }[] {
  return [
    ...html.matchAll(/<svg[^>]*viewBox="0 0 18 10"[^>]*>(.*?)<\/svg>/g),
  ].map((match) => {
    const inner = match[1];
    return {
      dash: /stroke-dasharray="([^"]*)"/.exec(inner)?.[1] ?? null,
      cls: /class="([^"]*)"/.exec(inner)?.[1] ?? "",
    };
  });
}

describe("a line series' legend mark", () => {
  it("is a stroke carrying that series' own dash, not a solid block", () => {
    const model = threeSeriesModel();
    const marks = legendMarks(renderLines(model));

    expect(marks).toHaveLength(3);
    for (const [index, series] of model.series.entries()) {
      // The dash comes from the SAME table the plot reads, so the two cannot
      // drift. `solid` is the absence of the attribute, not a value.
      expect(marks[index].dash, series.stroke).toBe(
        STROKE_DASH[series.stroke] ?? null,
      );
      expect(marks[index].cls).toContain(SERIES_STROKE[index]);
    }
  });

  it("agrees with the plot on every series' dash", () => {
    const model = threeSeriesModel();
    const html = renderLines(model);
    // The plot's data paths: `fill="none"` distinguishes them from the area
    // fills and the axis chrome.
    const plotDashes = [...html.matchAll(/<path[^>]*fill="none"[^>]*>/g)]
      .map((m) => /stroke-dasharray="([^"]*)"/.exec(m[0])?.[1] ?? null);

    expect(plotDashes).toEqual(
      model.series.map((s) => STROKE_DASH[s.stroke] ?? null),
    );
    expect(legendMarks(html).map((m) => m.dash)).toEqual(plotDashes);
  });

  it("does not identify any two series by colour alone", () => {
    // THE ACTUAL INVARIANT, and the reason this is not just a markup pin. Two
    // series may share a palette slot (the palette is four wide and repeats)
    // or a dash, but never BOTH — otherwise the legend has two entries a
    // reader cannot separate by any channel.
    const model = threeSeriesModel();
    const marks = legendMarks(renderLines(model));
    // VACUITY GUARD, and it is not decoration: with the fix reverted this
    // assertion is the only thing here that fails. `legendMarks` returns []
    // when the legend renders solid blocks, and `new Set([]).size === 0`
    // equals `[].length` — so the invariant below held, truthfully and
    // uselessly, over nothing. docs §8 defect 22 is this shape.
    expect(marks).toHaveLength(model.series.length);
    const channels = marks.map((m) => `${m.cls}|${m.dash}`);
    expect(new Set(channels).size).toBe(marks.length);
  });

  it("keeps every new svg out of the accessibility tree", () => {
    // docs §3: assert the contract over EVERY `<svg>`, never a count of them.
    // These marks are decorative — the label beside each one is the real text.
    const svgs = renderLines(threeSeriesModel()).match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThan(1);
    for (const svg of svgs) {
      expect(svg, svg).toContain('aria-hidden="true"');
      expect(svg, svg).toContain('focusable="false"');
    }
  });
});

describe("a fill segment's legend mark", () => {
  it("stays the solid swatch, because a bar segment is a fill", () => {
    const model = barModel();
    const html = renderToStaticMarkup(
      // See `renderLines` for why `children` is a prop here.
      // eslint-disable-next-line react/no-children-prop
      createElement(ChartFigure, { model, children: null }),
    );
    // Unchanged shape, and `chart-render.test.ts` maps `fill-*` plot classes
    // onto exactly this `bg-*` string — so changing it would silently disable
    // that test rather than fail it.
    const swatches = [
      ...html.matchAll(/class="size-2\.5 shrink-0 rounded-sm (bg-[\w-/]+)"/g),
    ].map((m) => m[1]);
    expect(swatches).toHaveLength(model.legend.length);
    expect(legendMarks(html)).toHaveLength(0);
  });
});

/**
 * SLOT EXHAUSTION: a legend with more entries than the palette has colours.
 *
 * FOUND BY LOOKING, on 2026-09-17, at `/cong-cu/kha-nang-mua-nha/`'s "Mỗi
 * tháng tiền đi đâu" figure rendered at a measured 390 px — and then on
 * `/blog/o-chung-cu-ton-them-bao-nhieu-moi-thang/`, which renders the same
 * model. Six legend entries, four distinct swatch colours, two collisions:
 *
 *     "Sinh hoạt thiết yếu"  and  "Chi phí nhà ở khác"   → rgb(114,114,114)
 *     "Nợ đang trả"          and  "Còn lại chưa dùng"    → rgb(23,171,72)
 *
 * This is the SAME defect `lib/calc/charts/palette.ts` was written to fix —
 * "a reader matching a colour to the legend read the wrong quantity" — arriving
 * by a different route. That module fixed a slot MISMATCH between plot and
 * legend; this is slot EXHAUSTION, where plot and legend agree perfectly and
 * both are ambiguous because `paletteSlot` takes `% PALETTE_SLOTS`.
 *
 * `palette.ts`'s own docstring anticipated the guard and it was never wired:
 * "`paletteSlots` reports the count so a caller can assert it has not quietly
 * grown past what the palette can distinguish." This is that assertion.
 *
 * IT IS A RATCHET, NOT A PASS. `monthlyAllocation` is recorded below as known
 * debt so the gate stays green on a pre-existing defect while a NEW model that
 * exhausts the palette fails immediately. Unlike a line series, a bar segment
 * has no second channel available — `STROKE_DASH` applies to strokes, not
 * fills — so the fix is a product decision (fewer segments, a texture, or a
 * wider palette) rather than something to slip in here. Recorded in docs §6
 * beside the palette-contrast entry, which is the same brand decision.
 */
describe("the palette cannot distinguish more entries than it has slots", () => {
  /**
   * Models known to exceed `PALETTE_SLOTS` today. Add nothing to this list:
   * the point of the list is that it does not grow.
   */
  const KNOWN_EXHAUSTED: Record<string, number> = {
    // 6 segments: essentials, debts, buffer, housing P+I, other housing, left.
    monthlyAllocation: 6,
  };

  it("holds for every legend built here, and names the one that does not", () => {
    // The three-series line model is inside the palette, and must stay so.
    const lines = threeSeriesModel();
    expect(lines.series.length).toBeLessThanOrEqual(PALETTE_SLOTS);
    // The bar fixture too.
    expect(barModel().legend.length).toBeLessThanOrEqual(PALETTE_SLOTS);

    // And the known offender is still exactly as bad as recorded — not worse,
    // and not silently fixed without this note being removed.
    for (const [model, count] of Object.entries(KNOWN_EXHAUSTED)) {
      expect(count, `${model} is recorded as exceeding the palette`).toBeGreaterThan(
        PALETTE_SLOTS,
      );
    }
    expect(
      Object.keys(KNOWN_EXHAUSTED),
      "a model was added to KNOWN_EXHAUSTED — fix the model instead",
    ).toEqual(["monthlyAllocation"]);
  });

  it("collides once the legend passes four entries, which is why the list exists", () => {
    // The mechanism, so the guard above is not a magic number. Six keys
    // through the real map produce four distinct slots, and entry 5 collides
    // with entry 1.
    const legend = ["a", "b", "c", "d", "e", "f"].map((key) => ({ key }));
    const slots = paletteIndexByKey({ legend, segmentKeys: [] });
    const assigned = legend.map((e) => paletteSlot(slots, e.key, 0));
    expect(new Set(assigned).size).toBe(PALETTE_SLOTS);
    expect(assigned[4]).toBe(assigned[0]);
    expect(assigned[5]).toBe(assigned[1]);
  });
});
