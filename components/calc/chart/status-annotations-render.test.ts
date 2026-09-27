/**
 * The chart side of the result-status plan: a SHORTFALL is annotated where it
 * is, with a word and a texture, never by recolouring every expense.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import type { BarChartModel, LineChartModel } from "@/lib/calc/charts/types";

const barModel: BarChartModel = {
  kind: "bars",
  title: "Ngân sách",
  summary: "Tóm tắt",
  assumptions: [],
  bars: [
    {
      key: "with",
      label: "Có xe",
      total: 110,
      totalLabel: "110 ₫",
      segments: [
        { key: "essentials", label: "Sinh hoạt", value: 60, valueLabel: "60 ₫" },
        { key: "payment", label: "Trả xe", value: 50, valueLabel: "50 ₫" },
      ],
      marks: [
        {
          key: "shortfall",
          tone: "shortfall",
          label: "Thiếu",
          start: 100,
          value: 10,
          valueLabel: "10 ₫",
        },
      ],
    },
  ],
  max: 120,
  axis: { label: "Số tiền", ticks: [] },
  legend: [
    { key: "essentials", label: "Sinh hoạt" },
    { key: "payment", label: "Trả xe" },
  ],
  table: { caption: "c", columns: [{ label: "a" }], rows: [] },
  unavailable: null,
};

describe("BarChart status marks", () => {
  const html = renderToStaticMarkup(createElement(BarChart, { model: barModel }));
  /** Each bar's own track: the category segments, and nothing else. */
  const tracks = html.match(/<svg viewBox="0 0 100 6"[\s\S]*?<\/svg>/g) ?? [];

  it("labels the excess in words beside the bar", () => {
    expect(html).toContain("Thiếu");
    expect(html).toContain("10 ₫");
    expect(html).toContain('data-chart-mark="shortfall"');
  });

  it("draws the excess on a separate RAIL on white, never over a segment", () => {
    // Codex repair 3: red hatch over the grey segment measured 1,37:1 and over
    // brand green 2,18:1. The span is now a solid status fill on its own
    // white rail, aligned to the same axis — the pair that matters is status
    // ink against white, pinned in `result-status-contrast.test.ts`.
    expect(html).toContain("fill-ink-3");
    expect(html).toContain("fill-brand-green");
    expect(tracks.length).toBeGreaterThan(0);
    for (const track of tracks) expect(track).not.toContain("status-");
    const rail = html.match(/<svg[^>]*data-chart-rail="true"[\s\S]*?<\/svg>/)?.[0] ?? "";
    expect(rail).toContain('class="fill-white"');
    expect(rail).toContain("fill-status-shortfall");
    // Aligned: the span starts at 100/120 of the axis, like the income edge.
    expect(rail).toMatch(/x="83\.3/);
    expect(html).not.toMatch(/url\(#[^)]*status/);
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
    }
  });

  it("draws a MET span on the rail too, not as an outline over a segment", () => {
    const met = renderToStaticMarkup(
      createElement(BarChart, {
        model: {
          ...barModel,
          bars: [
            {
              ...barModel.bars[0],
              marks: [{ ...barModel.bars[0].marks![0], tone: "met", label: "Phần dư" }],
            },
          ],
        },
      }),
    );
    const rail = met.match(/<svg[^>]*data-chart-rail="true"[\s\S]*?<\/svg>/)?.[0] ?? "";
    expect(rail).toContain("fill-status-met");
    expect(met).not.toContain("stroke-status-met");
  });

  it("adds nothing to a bar without marks", () => {
    const plain = renderToStaticMarkup(
      createElement(BarChart, {
        model: { ...barModel, bars: [{ ...barModel.bars[0], marks: undefined }] },
      }),
    );
    expect(plain).not.toContain("data-chart-mark");
    expect(plain).not.toContain("status-shortfall");
  });
});

const lineModel: LineChartModel = {
  kind: "lines",
  title: "Quỹ",
  summary: "Tóm tắt",
  assumptions: [],
  table: { caption: "c", columns: [{ label: "a" }], rows: [] },
  unavailable: null,
  series: [
    {
      key: "real",
      label: "Theo giá hôm nay",
      stroke: "solid",
      points: [
        { period: 0, value: 10 },
        { period: 10, value: 0 },
      ],
    },
  ],
  markers: [
    { period: 7, label: "Tiền bắt đầu thiếu ở tuổi 82", tone: "shortfall" },
    { period: 2, label: "Nghỉ hưu ở tuổi 60" },
  ],
  bands: [
    { from: 7, to: 10, label: "Từ tuổi 82 đến 85: chưa đủ chi tiêu", tone: "shortfall" },
  ],
  references: [],
  xAxis: { label: "Tuổi", ticks: [] },
  yAxis: { label: "Số tiền", ticks: [] },
  xMax: 10,
  yMin: 0,
  yMax: 10,
  step: false,
};

describe("LineChart status band and marker", () => {
  it("draws the unmet span as a solid rail below the plot, and tones the marker", () => {
    const html = renderToStaticMarkup(createElement(LineChart, { model: lineModel }));
    expect(html).toContain('data-chart-band="shortfall"');
    const band = html.match(/<g data-chart-band="shortfall">[\s\S]*?<\/g>/)?.[0] ?? "";
    // A solid rail in the status ink, under the baseline on the plot's white
    // ground — not a 35%-opacity hatch behind the lines.
    expect(band).toMatch(/<rect[^>]*y="21[2-9][^"]*"[^>]*class="fill-status-shortfall"/);
    expect(html).not.toMatch(/url\(#[^)]*status/);
    expect(html).toContain("stroke-status-shortfall");
  });

  it("names the band and the marker as text in the figure, with the tone's word", () => {
    const html = renderToStaticMarkup(
      createElement(
        ChartFigure,
        { model: lineModel } as ComponentProps<typeof ChartFigure>,
        createElement(LineChart, { model: lineModel }),
      ),
    );
    expect(html).toContain("Từ tuổi 82 đến 85: chưa đủ chi tiêu");
    expect(html).toContain("Tiền bắt đầu thiếu ở tuổi 82");
    expect(html).toContain('data-chart-note="shortfall"');
  });

  it("leaves a model without bands exactly as before", () => {
    const html = renderToStaticMarkup(
      createElement(LineChart, {
        model: { ...lineModel, bands: undefined, markers: [{ period: 2, label: "x" }] },
      }),
    );
    expect(html).not.toContain("data-chart-band");
    expect(html).not.toContain("status-shortfall");
  });
});
