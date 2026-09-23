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
  TEXTURE_KINDS,
  textureKind,
} from "@/components/calc/chart/chart-texture";
import {
  PALETTE_SLOTS,
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
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
  /**
   * CORRECTED: it is a filled shape WITH the segment's texture.
   *
   * This asserted a bare `bg-*` dot, which is the fill half of the very
   * defect the stroke branch above fixed for lines. An independent visual
   * review measured it on the stacked bars: the segment was a colour and
   * nothing else, the mark was a dot of the same shape as every other dot,
   * and two of the four palette slots are greens 1,75:1 apart. So the plot
   * now draws each segment with its slot's texture and the mark draws the
   * same `textureKind` at swatch size — `chart-texture.tsx`.
   *
   * It is still NOT a stroke mark: a fill is not a line, and `legendMarks`
   * (the dashed-line marks) must stay empty for a bar model.
   */
  it("is a filled shape carrying the slot's own texture", () => {
    const model = barModel();
    const html = renderToStaticMarkup(
      // See `renderLines` for why `children` is a prop here.
      // eslint-disable-next-line react/no-children-prop
      createElement(ChartFigure, { model, children: null }),
    );
    // One mark per legend entry, each a 10-unit swatch box carrying a
    // palette fill. `chart-render.test.ts` reads the same shape to check
    // that every plot fill is one a legend mark also draws.
    const swatches = [
      ...html.matchAll(/viewBox="0 0 10 10"[\s\S]*?class="(fill-[\w-/]+)"/g),
    ].map((m) => m[1]);
    expect(swatches).toHaveLength(model.legend.length);
    expect(new Set(swatches).size).toBe(model.legend.length);
    expect(legendMarks(html)).toHaveLength(0);

    // The second channel, in the key: slot 0 is the plain one by design, and
    // slot 1 carries marks. So exactly one of these two entries is textured,
    // which is what makes them tellable apart without colour.
    const marks = [...html.matchAll(/<g class="stroke-ink"|<g class="fill-ink"/g)];
    expect(marks).toHaveLength(1);
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
 * IT IS A RATCHET, NOT A PASS, FOR COLOUR. `monthlyAllocation` is recorded
 * below as a model whose legend is wider than the palette, so the gate stays
 * green on the brand's four colours while a new model that widens further is
 * still noticed. The palette itself is a brand decision (docs §6, beside the
 * palette-contrast entry) and is not changed here.
 *
 * WHAT CLOSED, AND WHEN. The first version of this paragraph said the texture
 * channel "does NOT close this: the texture is keyed to the same four slots".
 * That was true of that implementation and was measured as a live defect at
 * 390×844 — series 4 repeated series 0's colour AND its plain fill, series 5
 * repeated series 1's colour and its hatch. The texture is now keyed to
 * `seriesIndex`, the UNWRAPPED position in the declared legend order, and
 * `TEXTURE_KINDS` is eight long against a widest real legend of seven. So the
 * COLOUR still exhausts at four — the assertion below is unchanged and still
 * true — while the (colour, texture) PAIR does not, which is what a reader
 * matches a segment to its label with. `chart-texture.test.ts` asserts the
 * pairs on the exact six-segment shape the review measured.
 *
 * The ratchet that matters now is the second test in this block: no model's
 * legend may outgrow the non-colour channel. It compares the HAND-RECORDED
 * widths in `KNOWN_EXHAUSTED` against `TEXTURE_KINDS.length`, so it fails when
 * a ninth entry is recorded, not when a model grows one unrecorded. See the
 * comment inside that test.
 */
describe("the palette cannot distinguish more entries than it has slots", () => {
  /**
   * Models whose legend is wider than `PALETTE_SLOTS` today, with the widest
   * entry fixing the required width of the non-colour channel.
   *
   * `vehicleBudget` was ADDED when the six-series repair surveyed every
   * `finishBars`/`legend` site in `lib/calc/charts/` instead of trusting this
   * list: it lists seven entries when running costs are included and had been
   * colour-exhausted since it was written, unrecorded. Nothing about that model
   * changed — the list did, because it was incomplete. Every other legend in
   * the suite is four or fewer (rental waterfall 4, deposit 4, loan compare 4,
   * compound areas 3, grace/loan columns/education 2).
   */
  const KNOWN_EXHAUSTED: Record<string, number> = {
    // 6 segments: essentials, debts, buffer, housing P+I, other housing, left.
    monthlyAllocation: 6,
    // 7 entries: income, essentials, other debts, reserve, instalment,
    // running costs (conditional), leftover.
    vehicleBudget: 7,
  };

  it("holds for every legend built here, and names the ones that do not", () => {
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
    ).toEqual(["monthlyAllocation", "vehicleBudget"]);
  });

  it("never lets a legend outgrow the NON-COLOUR channel", () => {
    // The ratchet that replaced the colour one as the live constraint. A
    // segment's identity is the (colour, texture) pair, and the pair stays
    // unique only while every simultaneous series has its own texture.
    //
    // WHAT THIS ACTUALLY FAILS ON, stated accurately: the counts below are
    // HAND-RECORDED in `KNOWN_EXHAUSTED`, not read from `lib/calc/charts/`, so
    // this test fails when someone RECORDS a ninth entry — not when a model
    // silently grows one. A widened model that leaves its recorded number
    // stale is caught by neither test in this block; the roster assertion
    // above only catches a model being ADDED to the list.
    for (const [model, count] of Object.entries(KNOWN_EXHAUSTED)) {
      expect(
        count,
        `${model}'s legend needs more encodings than TEXTURE_KINDS has`,
      ).toBeLessThanOrEqual(TEXTURE_KINDS.length);
    }
    // And the channel is genuinely wider than the palette — the thing that
    // was not true when the six-series defect was measured.
    expect(TEXTURE_KINDS.length).toBeGreaterThan(PALETTE_SLOTS);
  });

  it("assigns a different texture to every entry a wide legend declares", () => {
    // The mechanism, through the real map: the colours collide in pairs and
    // the textures do not, so the pairs are unique.
    const legend = ["a", "b", "c", "d", "e", "f", "g"].map((key) => ({ key }));
    const slots = paletteIndexByKey({ legend, segmentKeys: [] });
    const pairs = legend.map(
      (entry, index) =>
        `${paletteSlot(slots, entry.key, index)}|${textureKind(
          seriesIndex(slots, entry.key, index),
        )}`,
    );
    expect(new Set(pairs).size).toBe(legend.length);
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
