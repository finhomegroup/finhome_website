/**
 * The tick-label frame, on rendered markup.
 *
 * WHAT THIS ESTABLISHES. That axis labels leave the `<svg>` and arrive as HTML
 * at a constant CSS size; that they are positioned from the SAME `PlotBox` the
 * drawing uses; that both tick layers are hidden from assistive technology
 * like the drawing itself; and that no `<text>` is left behind in the three
 * plotted kinds.
 *
 * WHAT IT CANNOT ESTABLISH. The rendered glyph height. A browser pass measured
 * 9px before this change and the target is about 12px, but that is a
 * measurement at a stated viewport, not something a string can prove. What is
 * provable here is the mechanism: `text-xs` is a CSS size the viewBox does not
 * scale, where a 9-unit `<text>` was scaled by the container's width.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { ColumnChart } from "@/components/calc/chart/column-chart";
import { LineChart } from "@/components/calc/chart/line-chart";
import { PLOT, PLOT_TWO_AXES, yForFraction } from "@/lib/calc/charts/geometry";
import type {
  ColumnChartModel,
  LineChartModel,
} from "@/lib/calc/charts/types";

/** A minimal exact reading, so every model carries its table contract. */
const table = () => ({
  caption: "Bảng số",
  columns: [{ label: "Kỳ" }, { label: "Số tiền" }],
  rows: [["1", "2"]],
});

function lineModel(overrides: Partial<LineChartModel> = {}): LineChartModel {
  return {
    kind: "lines",
    title: "Một biểu đồ",
    summary: "Một câu thay cho hình vẽ.",
    detail: null,
    assumptions: ["Giả định duy nhất."],
    table: table(),
    unavailable: null,
    series: [
      {
        key: "a",
        label: "Đường A",
        stroke: "solid",
        area: false,
        points: [
          { period: 0, value: 0 },
          { period: 10, value: 100 },
        ],
      },
    ],
    markers: [],
    references: [],
    xAxis: {
      label: "Năm thứ",
      ticks: [
        { at: 0, label: "0" },
        { at: 0.5, label: "5" },
        { at: 1, label: "10" },
      ],
    },
    yAxis: {
      label: "Số dư (tỷ)",
      ticks: [
        { at: 0, label: "0" },
        { at: 0.5, label: "2,0" },
        { at: 1, label: "4,0" },
      ],
    },
    xMax: 10,
    yMin: 0,
    yMax: 100,
    step: false,
    ...overrides,
  } as LineChartModel;
}

function columnModel(): ColumnChartModel {
  return {
    kind: "columns",
    title: "Cột",
    summary: "Một câu.",
    detail: null,
    assumptions: [],
    table: table(),
    unavailable: null,
    legend: [{ key: "lai", label: "Lãi" }],
    columns: Array.from({ length: 12 }, (_, i) => ({
      period: i + 1,
      label: `Năm ${i + 1}`,
      total: 10,
      segments: [
        { key: "lai", label: "Lãi", value: 10, valueLabel: "10 triệu" },
      ],
    })),
    yMax: 20,
    overlay: {
      key: "duno",
      label: "Dư nợ",
      stroke: "dashed",
      area: false,
      points: Array.from({ length: 12 }, (_, i) => ({
        period: i + 1,
        value: 100 - i,
      })),
    },
    overlayMax: 100,
    xAxis: { label: "Năm thứ", ticks: [] },
    yAxis: {
      label: "Gốc và lãi (triệu)",
      ticks: [
        { at: 0, label: "0" },
        { at: 1, label: "20" },
      ],
    },
    overlayAxis: {
      label: "Dư nợ (triệu)",
      ticks: [
        { at: 0, label: "0" },
        { at: 1, label: "100" },
      ],
    },
  };
}

/**
 * `createElement` with children passed positionally.
 *
 * These components declare `children` REQUIRED, which `createElement`'s
 * variadic overload does not satisfy, while `react/no-children-prop` forbids
 * passing it as a prop. Widening the component type is the one move that
 * satisfies both, and it keeps the call sites readable.
 */
function withChildren<P extends object>(
  type: ComponentType<P>,
  props: Omit<P, "children">,
  ...children: ReactNode[]
) {
  return createElement(
    type as ComponentType<Omit<P, "children">>,
    props,
    ...children,
  );
}

const drawLine = (model: LineChartModel = lineModel()) =>
  renderToStaticMarkup(
    withChildren(ChartFigure, { model }, createElement(LineChart, { model })),
  );

const drawColumn = () => {
  const model = columnModel();
  return renderToStaticMarkup(
    withChildren(ChartFigure, { model }, createElement(ColumnChart, { model })),
  );
};

describe("axis labels are HTML, at a size the viewBox does not scale", () => {
  it("leaves no <text> in a line plot", () => {
    const html = drawLine();
    // The legend's own line marks are `<svg>` but carry no text either.
    expect(html).not.toContain("<text");
  });

  it("leaves no <text> in a column plot, including the right-hand axis", () => {
    expect(drawColumn()).not.toContain("<text");
  });

  it("renders every tick label, both axes", () => {
    const html = drawLine();
    for (const label of ["0", "2,0", "4,0", "5", "10"]) {
      expect(html).toContain(`>${label}</span>`);
    }
  });

  it("renders the column chart's overlay axis labels too", () => {
    // The mortgage chart's balance line has its own right-hand axis, and it
    // was svg text as well.
    const html = drawColumn();
    expect(html).toContain(">100</span>");
  });

  it("sizes them in CSS, not in viewBox units", () => {
    // The whole point. `text-[9px]` inside a scaling viewBox rendered at 9px
    // on a phone and ~18px on a desktop column; `text-xs` is 12px at both.
    const html = drawLine();
    expect(html).toContain("text-xs");
    expect(html).not.toContain("text-[9px]");
  });
});

describe("the tick layers are hidden from assistive technology", () => {
  it("marks both layers aria-hidden, like the drawing", () => {
    // A screen reader reading a bare run of axis numbers gets noise. The
    // summary is the text equivalent and the table is the data.
    const html = drawLine();
    const layers = html.match(/<div aria-hidden="true"/g) ?? [];
    expect(layers.length).toBe(2);
  });

  it("keeps every svg aria-hidden and unfocusable", () => {
    for (const svg of drawLine().match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
  });
});

describe("positions come from the same box the drawing uses", () => {
  it("puts a y label on its own grid line", () => {
    // The midpoint tick: `yForFraction(0.5, PLOT)` as a percentage of the
    // viewBox height is where both the grid line and its label go, so the two
    // cannot drift.
    const expected = (yForFraction(0.5, PLOT) / PLOT.height) * 100;
    expect(drawLine()).toContain(`top:${expected}%`);
  });

  it("uses the two-axis box for a column chart, which is narrower", () => {
    // `PLOT_TWO_AXES` reserves the right-hand gutter the overlay axis needs,
    // and the overlay labels anchor to ITS plot edge, not the default one.
    const anchor = (PLOT_TWO_AXES.right / PLOT_TWO_AXES.width) * 100;
    expect(drawColumn()).toContain(`left:${anchor}%`);
    expect(PLOT_TWO_AXES.right).toBeLessThan(PLOT.right);
  });

  it("centres a column chart's period labels, all of them", () => {
    // Column ticks are column CENTRES: none sits on an end of the axis, so
    // none is pulled left or right. This is the behaviour the svg version had
    // with `textAnchor="middle"`, and anchoring by index rather than by
    // position would have changed the first and last.
    const html = drawColumn();
    const row = html.slice(html.lastIndexOf('<div aria-hidden="true"'));
    expect(row).not.toContain("-translate-x-full");
    // Counted by the x-tick class rather than by `<span`: the slice runs to the
    // end of the figure and picks up the legend swatch and the table.
    const xLabels = (row.match(/class="absolute top-0[^"]*"/g) ?? []).length;
    expect(xLabels).toBeGreaterThan(1);
    expect((row.match(/-translate-x-1\/2/g) ?? []).length).toBe(xLabels);
  });

  it("pulls a line chart's end labels inside the plot", () => {
    // A line chart DOES have ticks at 0 and 1.
    const row = (() => {
      const html = drawLine();
      return html.slice(html.lastIndexOf('<div aria-hidden="true"'));
    })();
    expect(row).toContain("-translate-x-full");
    expect(row).toContain("-translate-x-1/2");
  });

  it("hides a crowded period label below sm, and only that one", () => {
    // `countTicks` marks the earlier label of a pair that would overlap at
    // phone width — measured on `tiet-kiem-hoc-phi` at 390×844, where the
    // year-12 and year-13 labels overlapped by 5,09 px. The frame's whole
    // part in the repair is this class: the position stays the true fraction,
    // both ends of the axis stay, and the label returns from `sm` up.
    const html = drawLine(
      lineModel({
        xAxis: {
          label: "Năm thứ",
          ticks: [
            { at: 0, label: "0" },
            { at: 0.5, label: "5" },
            { at: 12 / 13, label: "12", crowded: true },
            { at: 1, label: "13" },
          ],
        },
      }),
    );
    const row = html.slice(html.lastIndexOf('<div aria-hidden="true"'));
    const spanOf = (label: string) =>
      row.match(new RegExp(`<span[^>]*>${label}</span>`))![0];
    expect(spanOf("12")).toContain("hidden sm:block");
    expect(spanOf("12")).toContain("-translate-x-1/2");
    // The endpoint it collided with is NOT hidden, and neither is any tick
    // that was never marked.
    expect(spanOf("13")).not.toContain("hidden");
    expect(spanOf("5")).not.toContain("hidden");
    expect(spanOf("0")).not.toContain("hidden");
    expect((row.match(/hidden sm:block/g) ?? []).length).toBe(1);
  });

  it("thins a twelve-column period axis to at most six labels", () => {
    // `columnTicks`: a tick under every column collides at phone width.
    const html = drawColumn();
    const row = html.slice(html.lastIndexOf('<div aria-hidden="true"'));
    const labels = row.match(/<span[^>]*>\d+<\/span>/g) ?? [];
    expect(labels.length).toBeGreaterThan(1);
    // Six evenly spaced PLUS the last one, which is not always on the stride:
    // twelve columns thin to 1/3/5/7/9/11 and then 12. Behaviour carried over
    // from the svg version unchanged — the thinning rule is not what moved.
    expect(labels.length).toBeLessThanOrEqual(7);
    // And the LAST period is always one of them — the end of the loan is what
    // a reader looks for.
    expect(row).toContain(">12</span>");
  });
});

describe("the plot has room to be a plot", () => {
  it("gives the drawing more than half its own height", () => {
    // The box no longer reserves space for descending tick glyphs, so
    // `bottom`/`height` grew into it. A browser pass measured a 155 px plot
    // inside an 885 px figure; this is the share the geometry now allows.
    const plotShare = (PLOT.bottom - PLOT.top) / PLOT.height;
    expect(plotShare).toBeGreaterThan(0.85);
  });

  it("stays wider than it is tall", () => {
    // A time axis read as a tall narrow strip is worse than a short one.
    expect(PLOT.right - PLOT.left).toBeGreaterThan(PLOT.bottom - PLOT.top);
  });
});

describe("worked arithmetic sits behind a labelled disclosure", () => {
  it("renders detail as a <details> with its own summary line", () => {
    const html = drawLine(
      lineModel({
        detail: { title: "Số liệu chi tiết", body: "Cần 10, trả được 4." },
      }),
    );
    expect(html).toContain("<details");
    expect(html).toContain("Số liệu chi tiết");
    expect(html).toContain("Cần 10, trả được 4.");
    // The caption is still the text equivalent and is not the disclosure.
    expect(html.indexOf("Một câu thay cho hình vẽ.")).toBeLessThan(
      html.indexOf("Số liệu chi tiết"),
    );
  });

  it("renders nothing when there is none, rather than an empty toggle", () => {
    const html = drawLine();
    expect(html).not.toContain("Số liệu chi tiết");
  });

  it("does not move the assumptions, which stay visible", () => {
    // A caveat is not worked arithmetic. `assumptions` are list items, outside
    // any disclosure.
    const html = drawLine();
    expect(html).toContain("<li");
    expect(html).toContain("Giả định duy nhất.");
  });
});
