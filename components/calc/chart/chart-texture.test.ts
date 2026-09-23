/**
 * The non-colour channel for stacked FILLS, in all three renderers that draw
 * one.
 *
 * WHY THIS FILE EXISTS. An independent visual review found that a stacked
 * segment was identifiable by its fill colour and by nothing else: the plot
 * drew a plain coloured rectangle and the legend's mark was a coloured dot of
 * the same shape as every other dot. Two of the palette's four fills are
 * greens. Line series already carried `STROKE_DASH`; fills carried nothing.
 *
 * WHAT THESE TESTS CAN AND CANNOT SEE. `renderToStaticMarkup` in the runner's
 * node environment (docs §6) renders no pixels, so nothing here claims the
 * textures are TELLABLE APART on a phone — that is a browser measurement.
 * What is checked is everything a static renderer can decide: that the marks
 * exist wherever a fill is drawn, that they are keyed by the same map the
 * legend reads, that the plain slot stays plain, that a segment with no length
 * draws neither colour nor texture, and that two figures on one page cannot
 * define the same pattern id.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AreaChart } from "@/components/calc/chart/area-chart";
import { BarChart } from "@/components/calc/chart/bar-chart";
import {
  ChartFigure,
  SERIES_FILL,
} from "@/components/calc/chart/chart-figure";
import {
  TEXTURE_KINDS,
  TextureDefs,
  TextureMarks,
  textureFill,
  textureKind,
} from "@/components/calc/chart/chart-texture";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import type {
  AreaChartModel,
  BarChartModel,
  ColumnChartModel,
} from "@/lib/calc/charts/types";

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(element);

/** Every `fill="url(#…-kind)"` in the markup, as its kind, in order. */
function textureUses(markup: string): string[] {
  return [...markup.matchAll(/fill="url\(#[^)]*-([a-z]+)\)"/g)].map(
    (match) => match[1],
  );
}

/** Every pattern id the markup DEFINES, in order. */
function definedIds(markup: string): string[] {
  return [...markup.matchAll(/<pattern id="([^"]+)"/g)].map(
    (match) => match[1],
  );
}

const TABLE = {
  caption: "Bảng",
  columns: [{ label: "Khoản" }, { label: "Số tiền", numeric: true }],
  rows: [],
};

const FRAME = {
  title: "Ví dụ",
  summary: "Tóm tắt",
  assumptions: [],
  table: TABLE,
  unavailable: null,
} as const;

/**
 * A bar model built BY HAND rather than through `bars.ts`.
 *
 * `segment()` drops a zero, so the only way to reach the renderer's own
 * `size <= 0` guard — the case a rounded-to-nothing segment hits — is to build
 * the model directly.
 */
function barModel(values: { key: string; value: number }[]): BarChartModel {
  const segments = values.map((item) => ({
    key: item.key,
    label: item.key.toUpperCase(),
    value: item.value,
    valueLabel: `${item.value} ₫`,
  }));
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  return {
    ...FRAME,
    kind: "bars",
    bars: [
      {
        key: "only",
        label: "Chỉ một",
        total,
        totalLabel: `${total} ₫`,
        segments,
      },
    ],
    max: Math.max(total, 1),
    axis: { label: "Số tiền (₫)", ticks: [{ at: 0, label: "0" }] },
    legend: segments.map((item) => ({ key: item.key, label: item.label })),
  };
}

/** Two columns, the second of which OMITS the first's opening segment. */
function columnModel(): ColumnChartModel {
  const seg = (key: string, value: number) => ({
    key,
    label: key.toUpperCase(),
    value,
    valueLabel: `${value} ₫`,
  });
  return {
    ...FRAME,
    kind: "columns",
    columns: [
      {
        period: 1,
        label: "Năm 1",
        segments: [seg("principal", 40), seg("interest", 60)],
        total: 100,
      },
      // No `principal` here: under the old positional rule `interest` took
      // slot 0 — `principal`'s colour AND its plain texture.
      {
        period: 2,
        label: "Năm 2",
        segments: [seg("interest", 50)],
        total: 50,
      },
    ],
    legend: [
      { key: "principal", label: "Gốc" },
      { key: "interest", label: "Lãi" },
    ],
    xAxis: { label: "Năm", ticks: [{ at: 0, label: "1" }] },
    yAxis: { label: "Số tiền (₫)", ticks: [{ at: 0, label: "0" }] },
    yMax: 100,
    overlay: null,
    overlayAxis: null,
    overlayMax: 0,
  };
}

function areaModel(): AreaChartModel {
  const band = (key: string, value: number) => ({
    key,
    label: key.toUpperCase(),
    points: [
      { period: 0, value: 0 },
      { period: 1, value },
      { period: 2, value: value * 2 },
    ],
  });
  return {
    ...FRAME,
    kind: "areas",
    bands: [band("deposit", 10), band("added", 20), band("interest", 5)],
    legend: [
      { key: "deposit", label: "Ban đầu" },
      { key: "added", label: "Nộp thêm" },
      { key: "interest", label: "Lãi" },
    ],
    xAxis: { label: "Năm", ticks: [{ at: 0, label: "0" }] },
    yAxis: { label: "Số tiền (₫)", ticks: [{ at: 0, label: "0" }] },
    xMax: 2,
    yMax: 70,
    markers: [],
  };
}

/**
 * The widest legend any model in this suite ships, counted from the source
 * rather than from prose: `vehicleBudgetModel` lists income, essentials, other
 * debts, reserve, instalment, running costs (when they are included) and
 * leftover. `monthlyAllocationModel`'s six is the next widest.
 *
 * Hard-coded HERE rather than imported so this stays a statement about the
 * channel's required width; `legend-render.test.ts` is where the real models
 * are ratcheted against it.
 */
const WIDEST_LEGEND = 7;

describe("the texture is keyed to the series, not to the palette slot", () => {
  it("has a distinct kind for every series a real legend can carry", () => {
    // CORRECTED from `toHaveLength(SERIES_FILL.length)`. Four textures for
    // four colours reads as symmetry and is the defect: the palette wraps at
    // four, so keying the texture to the same four made series 4 and 5
    // identical to series 0 and 1 in BOTH channels.
    expect(TEXTURE_KINDS.length).toBeGreaterThanOrEqual(WIDEST_LEGEND);
    expect(TEXTURE_KINDS.length).toBeGreaterThan(SERIES_FILL.length);
    expect(new Set(TEXTURE_KINDS).size).toBe(TEXTURE_KINDS.length);
    TEXTURE_KINDS.forEach((kind, series) => {
      expect(textureKind(series), `series ${series}`).toBe(kind);
    });
  });

  it("does NOT repeat where the palette repeats", () => {
    // The measured defect, as an assertion: six simultaneous series get six
    // different textures even though they get four colours.
    const textures = [0, 1, 2, 3, 4, 5].map((series) => textureKind(series));
    expect(new Set(textures).size).toBe(6);
    expect(textureKind(SERIES_FILL.length)).not.toBe(textureKind(0));
    expect(textureKind(SERIES_FILL.length + 1)).not.toBe(textureKind(1));
  });

  it("wraps only past its own end, which no real model reaches", () => {
    // The modulo is a last resort so an unforeseen model renders something
    // rather than `undefined` — not the encoding. `legend-render.test.ts`
    // fails before a model this wide could ship.
    expect(textureKind(TEXTURE_KINDS.length)).toBe(textureKind(0));
    expect(TEXTURE_KINDS.length).toBeGreaterThan(WIDEST_LEGEND - 1);
  });

  it("leaves the first series plain and namespaces the rest", () => {
    expect(textureFill("_R_1_", 0)).toBeUndefined();
    // Series 4 is no longer plain: that was the collision.
    expect(textureFill("_R_1_", SERIES_FILL.length)).toBe(
      "url(#_R_1_-backhatch)",
    );
    expect(textureFill("_R_1_", 1)).toBe("url(#_R_1_-hatch)");
    expect(textureFill("_R_2_", 1)).toBe("url(#_R_2_-hatch)");
    // Only a full wrap of the LIST returns to the plain one.
    expect(textureFill("_R_1_", TEXTURE_KINDS.length)).toBeUndefined();
  });

  it("defines a pattern for every kind except the plain one", () => {
    const markup = render(
      createElement(TextureDefs, { prefix: "p", tile: 6 }),
    );
    expect(definedIds(markup)).toEqual([
      "p-hatch",
      "p-dots",
      "p-grid",
      "p-backhatch",
      "p-vstripe",
      "p-hstripe",
      "p-cross",
    ]);
    // Unconditionally: a drawing does not know which series the figure's
    // legend will list, and an unreferenced pattern paints nothing.
    expect(definedIds(markup)).toHaveLength(TEXTURE_KINDS.length - 1);
    // `userSpaceOnUse`, so the pitch is the same on a long segment and a short
    // one — a texture that stretched with its segment would be a second,
    // misleading size channel.
    expect([...markup.matchAll(/patternUnits="userSpaceOnUse"/g)]).toHaveLength(
      TEXTURE_KINDS.length - 1,
    );
    // The tile is in the REFERENCING drawing's units, so it is a prop.
    expect(render(createElement(TextureDefs, { prefix: "p", tile: 2.6 })))
      .toContain('width="2.6"');
  });

  it("separates the kinds by DIRECTION rather than by density", () => {
    // Why the list can reach eight members at all: density is the channel that
    // fails first on a segment 2 % of a bar wide, which is the width the
    // review measured for "Chi phí nhà ở khác".
    const markup = render(createElement(TextureDefs, { prefix: "p", tile: 6 }));
    const angles = Object.fromEntries(
      [...markup.matchAll(/<pattern ([^>]*)>/g)].map((match) => {
        const tag = match[1];
        const kind = /id="p-([a-z]+)"/.exec(tag)?.[1] ?? "";
        return [kind, /rotate\((-?\d+)\)/.exec(tag)?.[1] ?? "0"];
      }),
    );
    expect(angles.hatch).toBe("45");
    expect(angles.backhatch).toBe("-45");
    expect(angles.cross).toBe("45");
    // The two axis-aligned stripes are the same tile at no rotation; they
    // differ by which coordinate the line runs along.
    expect(angles.vstripe).toBe("0");
    expect(angles.hstripe).toBe("0");
    const stripes = [...markup.matchAll(/<pattern ([^>]*)>(.*?)<\/pattern>/g)]
      .filter((m) => /id="p-(vstripe|hstripe)"/.test(m[1]))
      .map((m) => m[2]);
    expect(stripes).toHaveLength(2);
    expect(stripes[0]).not.toBe(stripes[1]);
  });

  it("draws the legend's copy of every kind but the plain one", () => {
    expect(render(createElement(TextureMarks, { kind: "plain", size: 10 })))
      .toBe("");
    // Drawn literally, not tiled: a 10-unit swatch of a 6-unit pattern reads
    // as grey mush. Same `textureKind`, so the channel cannot drift.
    const dots = render(createElement(TextureMarks, { kind: "dots", size: 10 }));
    expect([...dots.matchAll(/<circle/g)]).toHaveLength(4);
    const drawn = new Set<string>();
    for (const kind of TEXTURE_KINDS) {
      if (kind === "plain" || kind === "dots") continue;
      const marks = render(createElement(TextureMarks, { kind, size: 10 }));
      expect([...marks.matchAll(/<line/g)], kind).toHaveLength(2);
      expect(marks, kind).toContain("stroke-ink");
      // And no two line kinds draw the SAME two lines — a swatch that looked
      // identical would reintroduce the defect in the legend alone.
      const geometry = [...marks.matchAll(/<line[^>]*>/g)].join("");
      expect(drawn.has(geometry), `${kind} duplicates another kind`).toBe(
        false,
      );
      drawn.add(geometry);
    }
  });
});

describe("every stacked renderer draws the channel", () => {
  it("textures a bar's segments from the second slot on", () => {
    const markup = render(
      createElement(BarChart, {
        model: barModel([
          { key: "a", value: 30 },
          { key: "b", value: 40 },
          { key: "c", value: 30 },
        ]),
      }),
    );
    // Slot 0 is plain on purpose, so three segments carry two textures.
    expect(textureUses(markup)).toEqual(["hatch", "dots"]);
  });

  it("textures a column's segments by KEY, so an omitted one cannot shift them", () => {
    const markup = render(createElement(ColumnChart, { model: columnModel() }));
    // `interest` is legend slot 1 in BOTH columns, including the one where it
    // is the first segment drawn. Positionally it would have been plain there.
    expect(textureUses(markup)).toEqual(["hatch", "hatch"]);
    expect(
      [...markup.matchAll(new RegExp(`class="${SERIES_FILL[1]}"`, "g"))],
    ).toHaveLength(2);
  });

  it("textures an area's bands, over the same shape as the fill", () => {
    const markup = render(createElement(AreaChart, { model: areaModel() }));
    expect(textureUses(markup)).toEqual(["hatch", "dots"]);
    // The texture path is the band's OWN path: an outline says where a band
    // ends, not which quantity it is, so the two must cover the same area.
    const paths = [...markup.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
    expect(paths).toHaveLength(5); // three bands + two texture overlays
    expect(paths[2]).toBe(paths[1]); // band 2's texture repeats band 2's path
    expect(paths[4]).toBe(paths[3]);
  });

  it("draws neither colour nor texture for a segment with no length", () => {
    // The renderer's `size <= 0` guard. A segment rounded to nothing must not
    // leave a hairline of pattern where there is no quantity.
    const markup = render(
      createElement(BarChart, {
        model: barModel([
          { key: "a", value: 100 },
          { key: "b", value: 0 },
        ]),
      }),
    );
    expect(textureUses(markup)).toEqual([]);
    expect(markup).not.toContain(SERIES_FILL[1]);
  });

  it("still textures a segment that is tiny but real", () => {
    const markup = render(
      createElement(BarChart, {
        model: barModel([
          { key: "a", value: 1_000_000_000 },
          { key: "b", value: 1 },
        ]),
      }),
    );
    expect(textureUses(markup)).toEqual(["hatch"]);
  });
});

/**
 * THE SIX-SERIES DEFECT, measured rather than argued.
 *
 * An independent review opened `/cong-cu/kha-nang-mua-nha/` at 390×844 on the
 * 11:26:30.837Z export, set "Chi phí nhà ở khác mỗi tháng" to 1.000.000 and
 * "Trả nợ nhà tối đa" to 10 %, and read the first figure's six positive
 * segments — 18/5/3/4/1/13 tr on a 50 tr scale, so 36/10/6/8/2/26 % wide.
 * Series 0 and 4 rendered as the same plain grey and series 1 and 5 as the same
 * green hatch, in the plot AND in the legend.
 *
 * The DEFAULT state hides it, which is why these fixtures are explicit: the
 * trailing `leftover` segment is dropped below `LEDGER_RESIDUE_DONG`, so a
 * default screenshot often shows five or fewer segments.
 */
describe("six and seven simultaneous series", () => {
  /** Each `<g>`'s (colour class, texture kind) pair, in document order. */
  function channels(markup: string): string[] {
    return [...markup.matchAll(/<g>([\s\S]*?)<\/g>/g)].map((match) => {
      const inner = match[1];
      const colour = /class="(fill-[\w-]+)"/.exec(inner)?.[1] ?? "?";
      const texture = /fill="url\(#[^)]*-([a-z]+)\)"/.exec(inner)?.[1] ?? "plain";
      return `${colour}|${texture}`;
    });
  }

  /** The allocation bar's measured shape, in đồng. */
  const ALLOCATION = [
    { key: "essentials", value: 18_000_000 },
    { key: "debts", value: 5_000_000 },
    { key: "buffer", value: 3_000_000 },
    { key: "housing", value: 4_000_000 },
    { key: "otherHousing", value: 1_000_000 },
    { key: "leftover", value: 13_000_000 },
  ];

  it("gives all six of the measured segments a different encoding", () => {
    const markup = render(
      createElement(BarChart, { model: barModel(ALLOCATION) }),
    );
    // Five textures for six segments because series 0 is plain by design.
    expect(textureUses(markup)).toEqual([
      "hatch",
      "dots",
      "grid",
      "backhatch",
      "vstripe",
    ]);
    // THE INVARIANT. Not the texture list, but the pairs: no two of the six
    // simultaneous quantities share both channels. With the wrapped version
    // this returned 4.
    const pairs = channels(markup);
    expect(pairs).toHaveLength(6);
    expect(new Set(pairs).size).toBe(6);
    // And the colours DID repeat, so this is not passing by a palette change.
    const colours = pairs.map((pair) => pair.split("|")[0]);
    expect(new Set(colours).size).toBe(SERIES_FILL.length);
  });

  it("covers the widest legend in the suite, which is seven", () => {
    // `vehicleBudgetModel` with running costs included.
    const seven = [
      "income",
      "essentials",
      "otherDebts",
      "reserve",
      "payment",
      "running",
      "leftover",
    ].map((key, index) => ({ key, value: 1_000_000 * (index + 1) }));
    const pairs = channels(
      render(createElement(BarChart, { model: barModel(seven) })),
    );
    expect(pairs).toHaveLength(7);
    expect(new Set(pairs).size).toBe(7);
  });

  it("keeps the encodings in place when a middle segment is zero", () => {
    // `segment()` drops a zero before the renderer sees it in production; the
    // survivors must keep the encodings their LEGEND order gives them rather
    // than closing up. Here the model is hand-built with the zero present, so
    // the renderer's own `size <= 0` guard runs too.
    const withHole = ALLOCATION.map((item) =>
      item.key === "buffer" ? { ...item, value: 0 } : item,
    );
    const markup = render(
      createElement(BarChart, { model: barModel(withHole) }),
    );
    expect(textureUses(markup)).toEqual([
      "hatch",
      // no `dots`: `buffer` is series 2 and draws nothing
      "grid",
      "backhatch",
      "vstripe",
    ]);
    expect(new Set(channels(markup)).size).toBe(5);
  });

  it("still encodes a segment that is 2 % of the bar", () => {
    // `otherHousing` is series 4 at 1 tr of this fixture's 44 tr total — the
    // segment the review measured at 2 % of its 50 tr axis — and it gets the
    // fifth texture, not the first one.
    const markup = render(
      createElement(BarChart, { model: barModel(ALLOCATION) }),
    );
    expect(markup).toContain("-backhatch)");
    // Nothing is labelled INSIDE a segment: the brief forbids cramming text
    // into a 2 % box, and the figure's table carries every number.
    expect(markup).not.toContain("<text");
  });

  it("reads the LEGEND's order, not each bar's own order", () => {
    // Omitted and reordered against the declared legend, which is the case
    // `paletteIndexByKey` exists for. `leftover` is legend series 5 in both
    // bars even though it is drawn first in the second one.
    const legend = ALLOCATION.map((item) => ({
      key: item.key,
      label: item.key.toUpperCase(),
    }));
    const seg = (key: string, value: number) => ({
      key,
      label: key.toUpperCase(),
      value,
      valueLabel: `${value} ₫`,
    });
    const model: BarChartModel = {
      ...FRAME,
      kind: "bars",
      bars: [
        {
          key: "full",
          label: "Đủ",
          total: 44_000_000,
          totalLabel: "44",
          segments: ALLOCATION.map((item) => seg(item.key, item.value)),
        },
        {
          key: "reordered",
          label: "Đảo",
          total: 18_000_000,
          totalLabel: "18",
          segments: [seg("leftover", 13_000_000), seg("debts", 5_000_000)],
        },
      ],
      max: 50_000_000,
      axis: { label: "Số tiền (₫)", ticks: [{ at: 0, label: "0" }] },
      legend,
    };
    const pairs = channels(render(createElement(BarChart, { model })));
    expect(pairs).toHaveLength(8); // 6 + 2
    // The second bar's two segments repeat the first bar's encodings for the
    // same keys, in the legend's order — never in the drawing's.
    expect(pairs[6]).toBe(pairs[5]); // leftover
    expect(pairs[7]).toBe(pairs[1]); // debts
  });

  it("gives a six-entry legend six distinguishable marks", () => {
    // The other half of the measured defect: the legend repeated too, so a
    // reader could not resolve the ambiguity there either.
    const model = barModel(ALLOCATION);
    const html = renderToStaticMarkup(
      // eslint-disable-next-line react/no-children-prop
      createElement(ChartFigure, { model, children: null }),
    );
    const swatches = [
      ...html.matchAll(/viewBox="0 0 10 10"[^>]*>([\s\S]*?)<\/svg>/g),
    ].map((match) => {
      const inner = match[1];
      const colour = /class="(fill-[\w-]+)"/.exec(inner)?.[1] ?? "?";
      const marks = inner.replace(/^[\s\S]*?\/>/, "");
      return `${colour}|${marks}`;
    });
    expect(swatches).toHaveLength(model.legend.length);
    expect(new Set(swatches).size).toBe(model.legend.length);
  });
});

describe("two figures on one page", () => {
  it("define different pattern ids and reference their own", () => {
    // `useId` per drawing. A paint server resolves by DOCUMENT id, so a shared
    // id would make the second figure's segments pick up the first's tiles —
    // and a duplicate id is invalid markup besides.
    const markup = render(
      createElement(
        "div",
        null,
        createElement(BarChart, {
          model: barModel([
            { key: "a", value: 30 },
            { key: "b", value: 70 },
          ]),
        }),
        createElement(ColumnChart, { model: columnModel() }),
      ),
    );
    const ids = definedIds(markup);
    const perDrawing = TEXTURE_KINDS.length - 1;
    expect(ids).toHaveLength(perDrawing * 2);
    expect(new Set(ids).size).toBe(perDrawing * 2);

    // And each drawing references the prefix it defined, not the other's.
    const used = [...markup.matchAll(/fill="url\(#([^)]+)\)"/g)].map(
      (match) => match[1],
    );
    expect(used.length).toBeGreaterThan(0);
    for (const reference of used) {
      expect(ids, reference).toContain(reference);
    }
    const prefixes = new Set(
      used.map((reference) => reference.replace(/-[a-z]+$/, "")),
    );
    expect(prefixes.size).toBe(2);
  });
});
