import { describe, expect, it } from "vitest";
import {
  MAX_VALUE_PATHS,
  MAX_VALUE_PATH_POINTS,
  valuePathsModel,
  type ValuePath,
} from "./value-paths-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Hai đường giá trị",
  series: "{label}",
  xAxis: "Tháng",
  yAxis: "Giá trị ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Giá trị theo mốc",
  tableHint: "Đọc theo cột.",
  periodColumn: "Tháng",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy kiểm tra lại số liệu.",
};

/** A straight ramp, so every assertion below is hand-checkable. */
function ramp(key: string, label: string, from: number, step: number, n: number): ValuePath {
  return {
    key,
    label,
    points: Array.from({ length: n + 1 }, (_, i) => ({
      period: i,
      value: from + step * i,
    })),
  };
}

describe("valuePathsModel draws what it is given", () => {
  const model = valuePathsModel(
    [ramp("gross", "Không phí", 500, 10, 36), ramp("net", "Sau phí", 495, 9, 36)],
    LABELS,
    { summary: "Chênh lệch cuối kỳ." },
  );

  it("keeps the caller's own summary, not a template", () => {
    expect(model.summary).toBe("Chênh lệch cuối kỳ.");
    expect(model.unavailable).toBeNull();
  });

  it("gives each path its own stroke, so colour is never the only channel", () => {
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.series.map((s) => s.key)).toEqual(["gross", "net"]);
  });

  it("runs the x axis to the last period of the longest path", () => {
    expect(model.xMax).toBe(36);
  });

  it("puts every drawn point inside the axis", () => {
    const highest = Math.max(
      ...model.series.flatMap((s) => s.points.map((p) => p.value)),
    );
    expect(model.yMax).toBeGreaterThanOrEqual(highest);
    expect(model.yMin).toBe(0);
  });

  it("builds a default table with one column per path", () => {
    expect(model.table.columns.map((c) => c.label)).toEqual([
      "Tháng",
      "Không phí",
      "Sau phí",
    ]);
    expect(model.table.rows.length).toBeGreaterThan(0);
    expect(model.table.hint).toBe(LABELS.tableHint);
  });
});

describe("a path is drawn only where it exists", () => {
  it("stops a short path instead of continuing it along zero", () => {
    // The defect this rule exists for: a fund that runs out at month 12 has
    // no balance at month 24, and drawing 0 there reads as a real balance.
    const model = valuePathsModel(
      [ramp("long", "Dài", 100, 1, 36), ramp("short", "Ngắn", 100, -5, 12)],
      LABELS,
      { summary: "…" },
    );
    const short = model.series.find((s) => s.key === "short")!;
    expect(Math.max(...short.points.map((p) => p.period))).toBe(12);
    // And the long path still reaches the end.
    const long = model.series.find((s) => s.key === "long")!;
    expect(Math.max(...long.points.map((p) => p.period))).toBe(36);
  });
});

describe("markers and sampling", () => {
  it("keeps a marked period even when sampling would skip it", () => {
    // 400 months with a 121-point cap strides by 4, so month 187 would be
    // dropped — and it is exactly the month a caller marks.
    const model = valuePathsModel([ramp("a", "A", 0, 1, 400)], LABELS, {
      summary: "…",
      markers: [{ period: 187, label: "Hết tiền" }],
    });
    const periods = model.series[0].points.map((p) => p.period);
    expect(periods).toContain(187);
    expect(periods.length).toBeLessThanOrEqual(MAX_VALUE_PATH_POINTS + 2);
    expect(model.markers.map((m) => m.label)).toEqual(["Hết tiền"]);
  });

  it("always keeps both endpoints", () => {
    const model = valuePathsModel([ramp("a", "A", 0, 1, 400)], LABELS, {
      summary: "…",
    });
    const periods = model.series[0].points.map((p) => p.period);
    expect(periods[0]).toBe(0);
    expect(periods.at(-1)).toBe(400);
  });

  it("keeps a SHORT path's own last period, not just the global one", () => {
    // The independently executed counterexample: a drawdown that empties at
    // month 179 beside a plan running the full 1.200-month horizon. The
    // global stride is 10, so the short path used to be drawn to 170 and its
    // end — the month the money ran out — was deleted from the plot AND the
    // default table.
    const model = valuePathsModel(
      [ramp("long", "Dài", 0, 1, 1200), ramp("short", "Ngắn", 2000, -10, 179)],
      LABELS,
      { summary: "…", markers: [{ period: 1200, label: "Mốc mô phỏng" }] },
    );
    const short = model.series.find((s) => s.key === "short")!;
    const shortPeriods = short.points.map((p) => p.period);
    expect(shortPeriods.at(-1)).toBe(179);
    expect(shortPeriods).toContain(0);
    // And it is a REAL point, not a continuation at zero.
    expect(short.points.at(-1)!.value).toBe(2000 - 10 * 179);
    // The long path still owns the far end, and 179 is now a table row.
    const long = model.series.find((s) => s.key === "long")!;
    expect(long.points.at(-1)!.period).toBe(1200);
    expect(model.table.rows.some((row) => row[0] === "179")).toBe(true);
    // Still bounded: the cap plus the mandatory periods, not a point a month.
    expect(shortPeriods.length).toBeLessThan(MAX_VALUE_PATH_POINTS);
    expect(long.points.length).toBeLessThanOrEqual(
      MAX_VALUE_PATH_POINTS + 2 * MAX_VALUE_PATHS + 1,
    );
  });

  it("keeps the first period of a path that starts late", () => {
    const model = valuePathsModel(
      [
        ramp("long", "Dài", 0, 1, 600),
        {
          key: "late",
          label: "Muộn",
          points: [
            { period: 317, value: 50 },
            { period: 600, value: 80 },
          ],
        },
      ],
      LABELS,
      { summary: "…" },
    );
    const late = model.series.find((s) => s.key === "late")!;
    expect(late.points.map((p) => p.period)).toEqual([317, 600]);
  });
});

describe("the period axis labels whole counts at their own positions", () => {
  // The defect an independent review saw on a four-year course starting
  // today: xMax 3 with equal intervals and a rounding formatter drew
  // "0, 1, 2, 2, 3" — label 2 twice, at two different dates, and no 1.
  it("gives a three-period axis four DISTINCT labels", () => {
    const model = valuePathsModel(
      [ramp("fund", "Quỹ", 100, 10, 3), ramp("need", "Nhu cầu", 90, 5, 3)],
      LABELS,
      { summary: "…" },
    );
    expect(model.xMax).toBe(3);
    const labels = model.xAxis.ticks.map((t) => t.label);
    expect(labels).toEqual(["0", "1", "2", "3"]);
    expect(new Set(labels).size).toBe(labels.length);
    // And each label sits where that period actually is.
    expect(model.xAxis.ticks.map((t) => t.at)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });

  it("keeps the endpoint on a 37-period axis, without a duplicate", () => {
    const model = valuePathsModel([ramp("a", "A", 0, 1, 37)], LABELS, {
      summary: "…",
    });
    const labels = model.xAxis.ticks.map((t) => t.label);
    expect(labels).toEqual(["0", "10", "20", "30", "37"]);
    expect(new Set(labels).size).toBe(labels.length);
    expect(model.xAxis.ticks.at(-1)!.at).toBe(1);
    // The series' own endpoints are untouched by the axis change.
    expect(model.series[0].points.at(-1)!.period).toBe(37);
  });

  it("never repeats a label on any horizon these tools use", () => {
    for (const periods of [1, 2, 3, 4, 5, 12, 36, 37, 60, 179, 240, 1200]) {
      const model = valuePathsModel([ramp("a", "A", 0, 1, periods)], LABELS, {
        summary: "…",
      });
      const labels = model.xAxis.ticks.map((t) => t.label);
      expect(new Set(labels).size, `xMax ${periods}`).toBe(labels.length);
      expect(labels[0], `xMax ${periods}`).toBe("0");
      expect(labels.at(-1), `xMax ${periods}`).toBe(String(periods));
      expect(labels.length, `xMax ${periods}`).toBeLessThanOrEqual(5);
    }
  });
});

describe("a signed axis is not a positive one with minus signs", () => {
  it("keeps zero inside the plot when a path goes negative", () => {
    const model = valuePathsModel(
      [{ key: "gap", label: "Thiếu", points: [
        { period: 0, value: 100 },
        { period: 6, value: -40 },
        { period: 12, value: -90 },
      ] }],
      LABELS,
      { summary: "…", allowNegative: true },
    );
    expect(model.yMin).toBeLessThanOrEqual(-90);
    expect(model.yMax).toBeGreaterThanOrEqual(100);
  });

  it("does not lower the floor unless the caller asks", () => {
    // Without `allowNegative` the floor stays at zero, which is right for a
    // balance that cannot be negative — and a caller that forgets the flag
    // gets a clipped path rather than a silently re-scaled axis.
    const model = valuePathsModel(
      [{ key: "gap", label: "Thiếu", points: [
        { period: 0, value: 100 },
        { period: 12, value: -90 },
      ] }],
      LABELS,
      { summary: "…" },
    );
    expect(model.yMin).toBe(0);
  });
});

describe("refusals", () => {
  it("withholds a plot with no path of at least two points", () => {
    const one = valuePathsModel(
      [{ key: "a", label: "A", points: [{ period: 0, value: 1 }] }],
      LABELS,
      { summary: "…" },
    );
    expect(one.unavailable).toEqual({
      reason: LABELS.unavailableReason,
      recovery: LABELS.unavailableRecovery,
    });
    expect(one.series).toEqual([]);
  });

  it("refuses more paths than the stroke channels can tell apart", () => {
    const paths = Array.from({ length: MAX_VALUE_PATHS + 1 }, (_, i) =>
      ramp(`p${i}`, `P${i}`, 100, 1, 10),
    );
    expect(valuePathsModel(paths, LABELS, { summary: "…" }).unavailable)
      .not.toBeNull();
  });

  it("refuses a non-finite point before any SVG can see it", () => {
    const model = valuePathsModel(
      [{ key: "a", label: "A", points: [
        { period: 0, value: 100 },
        { period: 1, value: Number.NaN },
      ] }],
      LABELS,
      { summary: "…" },
    );
    expect(model.unavailable).not.toBeNull();
  });

  it("refuses a path that never advances past period 0", () => {
    const model = valuePathsModel(
      [{ key: "a", label: "A", points: [
        { period: 0, value: 100 },
        { period: 0, value: 100 },
      ] }],
      LABELS,
      { summary: "…" },
    );
    expect(model.unavailable).not.toBeNull();
  });

  it("carries the caller's table and assumptions even when empty", () => {
    const table = {
      caption: "Của tôi",
      columns: [{ label: "Mốc" }],
      rows: [["x"]],
    };
    const model = valuePathsModel([], LABELS, {
      summary: "…",
      table,
      assumptions: ["Giả định riêng."],
    });
    expect(model.table).toBe(table);
    expect(model.assumptions).toEqual(["Giả định riêng."]);
  });
});
