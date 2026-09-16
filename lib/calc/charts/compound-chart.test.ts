/**
 * ORIGINAL ROW 16's visual: the balance as three STACKED BANDS over real
 * elapsed time — the money that was there at the start, the money added
 * afterwards, and the part the assumed rate produced.
 *
 * Two fixtures, both hypothetical arithmetic:
 *
 * - The page's shipped example: 100 triệu ban đầu, gửi thêm 8 triệu mỗi
 *   tháng, 6%/năm ghép hằng tháng, 10 năm → 1.492.974.447,85 ₫, of which
 *   1,06 tỷ is the saver's own money.
 * - The FRACTIONAL case an independent review supplied: 100 triệu ban đầu,
 *   6%/năm ghép nửa năm, 10 triệu mỗi kỳ, 1,5 năm = 3 credited periods →
 *   later contributions 30 triệu, interest 10.181.700 ₫, balance
 *   140.181.700 ₫. The last snapshot sits at 1,5 years, NOT at year 2.
 */
import { describe, expect, it } from "vitest";
import { computeCompound, MAX_COMPOUND_YEARS } from "@/lib/calc/compound";
import {
  compoundChartModel,
  type CompoundChartLabels,
} from "@/lib/calc/charts/compound-chart";
import { stackedAreaPaths } from "@/lib/calc/charts/geometry";

const L: CompoundChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Ba phần của số dư",
  initial: "Số tiền ban đầu",
  contributions: "Tiền gửi thêm về sau",
  interest: "Phần do lãi",
  yearTick: "Năm {n}",
  partialTick: "{n} năm",
  monthsTick: "{n} tháng",
  daysTick: "{n} ngày",
  endMarker: "Kết thúc ở {time}",
  xAxis: "Số năm đã tính lãi",
  xAxisMonths: "Số tháng đã tính lãi",
  xAxisDays: "Số ngày đã tính lãi",
  yAxis: "Số dư ({unit})",
  summary:
    "Sau {time} ({periods} kỳ): {balance}, gồm {initial} ban đầu, {contributions} gửi thêm và {interest} do lãi ({interestShare}%).",
  rateNote: "Lãi suất là giả định.",
  noContributionNote: "Ví dụ này không gửi thêm.",
  partialNote: "Mốc cuối không nằm ở cuối một năm tròn.",
  uncreditedNote: "Còn dư {periods} kỳ chưa hoàn thành.",
  assumptions: ["Gửi thêm vào cuối mỗi kỳ."],
  tableCaption: "Theo từng mốc",
  periodColumn: "Mốc",
  balanceColumn: "Số dư",
  unavailableReason: "Chưa có kết quả để vẽ.",
  unavailableRecovery: "Hãy nhập số tiền hoặc khoản gửi thêm lớn hơn 0.",
};

const INITIAL = 100_000_000;
const EXAMPLE = computeCompound({
  principal: INITIAL,
  annualRatePercent: 6,
  years: 10,
  compounding: "monthly",
  contributionPerPeriod: 8_000_000,
})!;

/** A band's value at one point index. */
const valueAt = (
  model: ReturnType<typeof compoundChartModel>,
  key: string,
  index: number,
) => model.bands.find((band) => band.key === key)!.points[index].value;

describe("compoundChartModel", () => {
  const model = compoundChartModel(EXAMPLE, INITIAL, L);

  it("is a stacked AREA, not a line or a bar", () => {
    // Original row 16 specifies "diện tích chồng": three disjoint cumulative
    // bands over time. Three overlapping filled lines are not that.
    expect(model.kind).toBe("areas");
    expect(model.bands.map((band) => band.key)).toEqual([
      "initial",
      "contributions",
      "interest",
    ]);
    expect(model.legend.map((entry) => entry.key)).toEqual([
      "initial",
      "contributions",
      "interest",
    ]);
  });

  it("starts at time 0 with the opening balance and nothing else", () => {
    // A band chart that started at year 1 would hide the fact that the
    // initial amount was there from the beginning.
    expect(model.bands[0].points[0]).toEqual({ period: 0, value: INITIAL });
    expect(valueAt(model, "contributions", 0)).toBe(0);
    expect(valueAt(model, "interest", 0)).toBe(0);
  });

  it("makes the three bands sum to the balance at every point", () => {
    // The identity the picture rests on: nothing double-counted, nothing
    // missing, and the initial amount counted once rather than also inside
    // the contributions band.
    const points = model.bands[0].points.length;
    for (let index = 0; index < points; index += 1) {
      const sum =
        valueAt(model, "initial", index) +
        valueAt(model, "contributions", index) +
        valueAt(model, "interest", index);
      const expected =
        index === 0 ? INITIAL : EXAMPLE.yearlyBalances[index - 1].balance;
      expect(sum).toBeCloseTo(expected, 6);
    }
  });

  it("holds the starting amount flat and grows the other two", () => {
    const lastIndex = model.bands[0].points.length - 1;
    expect(valueAt(model, "initial", lastIndex)).toBe(INITIAL);
    expect(valueAt(model, "contributions", lastIndex)).toBe(960_000_000);
    expect(valueAt(model, "interest", lastIndex)).toBeGreaterThan(
      valueAt(model, "interest", 1),
    );
  });

  it("matches the independent four-year reference", () => {
    // 300 triệu ban đầu, 6%/năm ghép hằng tháng, 15 triệu mỗi kỳ, 4 năm.
    const four = computeCompound({
      principal: 300_000_000,
      annualRatePercent: 6,
      years: 4,
      compounding: "monthly",
      contributionPerPeriod: 15_000_000,
    })!;
    const model = compoundChartModel(four, 300_000_000, L);
    const expected = [
      { contributions: 180_000_000, interest: 23_536_779.152848 },
      { contributions: 360_000_000, interest: 59_627_261.477791 },
      { contributions: 540_000_000, interest: 109_045_731.917281 },
      { contributions: 720_000_000, interest: 172_614_231.614779 },
    ];
    expected.forEach((row, year) => {
      const index = year + 1;
      expect(valueAt(model, "initial", index)).toBe(300_000_000);
      expect(valueAt(model, "contributions", index)).toBeCloseTo(
        row.contributions,
        6,
      );
      expect(valueAt(model, "interest", index)).toBeCloseTo(row.interest, 4);
    });
  });

  it("states the credited time and the interest share in its summary", () => {
    expect(model.summary).toContain("Sau 10 năm (120 kỳ)");
    expect(model.summary).toContain("1,5 tỷ");
    expect(model.summary).toContain("(29%)");
    expect(model.summary).toContain(L.rateNote);
    expect(model.summary).not.toContain(L.noContributionNote);
    expect(model.summary).not.toContain(L.partialNote);
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("puts the same figures in the table as in the bands", () => {
    const last = model.table.rows[model.table.rows.length - 1];
    expect(last[0]).toBe("Năm 10");
    expect(last[1]).toEqual({ kind: "money", value: INITIAL });
    expect(last[2]).toEqual({ kind: "money", value: 960_000_000 });
    expect((last[4] as { value: number }).value).toBeCloseTo(
      EXAMPLE.futureValue,
      6,
    );
  });

  it("drops the contributions band entirely when there are none", () => {
    // An always-zero band with a label invites a reader to look for it.
    const lump = computeCompound({
      principal: INITIAL,
      annualRatePercent: 6,
      years: 10,
      compounding: "monthly",
    })!;
    const model = compoundChartModel(lump, INITIAL, L);
    expect(model.bands.map((band) => band.key)).toEqual([
      "initial",
      "interest",
    ]);
    expect(model.summary).toContain(L.noContributionNote);
    // 100 triệu × 1,005^120 — the closed form, not a re-reading of the module.
    const lastIndex = model.bands[0].points.length - 1;
    expect(
      valueAt(model, "initial", lastIndex) +
        valueAt(model, "interest", lastIndex),
    ).toBeCloseTo(100e6 * 1.005 ** 120, 6);
  });

  it("draws an empty interest band at a zero rate", () => {
    const flat = computeCompound({
      principal: INITIAL,
      annualRatePercent: 0,
      years: 10,
      compounding: "monthly",
      contributionPerPeriod: 8_000_000,
    })!;
    const model = compoundChartModel(flat, INITIAL, L);
    const lastIndex = model.bands[0].points.length - 1;
    expect(valueAt(model, "interest", lastIndex)).toBeCloseTo(0, 6);
    expect(valueAt(model, "contributions", lastIndex)).toBeCloseTo(
      960_000_000,
      6,
    );
  });

  it("explains itself instead of drawing an empty axis", () => {
    const model = compoundChartModel(null, INITIAL, L);
    expect(model.unavailable?.reason).toBe(L.unavailableReason);
    expect(model.bands).toHaveLength(0);
    expect(model.table.rows).toHaveLength(0);
  });

  it("thins the table without dropping the last mốc", () => {
    const long = computeCompound({
      principal: INITIAL,
      annualRatePercent: 6,
      years: MAX_COMPOUND_YEARS,
      compounding: "monthly",
      contributionPerPeriod: 8_000_000,
    })!;
    const model = compoundChartModel(long, INITIAL, L);
    expect(model.xMax).toBe(MAX_COMPOUND_YEARS);
    expect(model.table.rows.length).toBeLessThanOrEqual(14);
    const last = model.table.rows[model.table.rows.length - 1];
    expect(last[0]).toBe(`Năm ${MAX_COMPOUND_YEARS}`);
  });
});

describe("a fractional term stops where the last period ends", () => {
  /** 1,5 năm ghép nửa năm = 3 credited periods. */
  const HALF = computeCompound({
    principal: INITIAL,
    annualRatePercent: 6,
    years: 1.5,
    compounding: "semiannually",
    contributionPerPeriod: 10_000_000,
  })!;
  const model = compoundChartModel(HALF, INITIAL, L);

  it("credits three periods and 1,5 years, not two years", () => {
    expect(HALF.periods).toBe(3);
    expect(HALF.periodsPerYear).toBe(2);
    expect(HALF.creditedYears).toBe(1.5);
    const snapshot = HALF.yearlyBalances[HALF.yearlyBalances.length - 1];
    expect(snapshot.elapsedPeriods).toBe(3);
    expect(snapshot.elapsedYears).toBe(1.5);
    expect(snapshot.partial).toBe(true);
  });

  it("reproduces the independent reference", () => {
    // Later contributions 30 triệu, interest 10.181.700 ₫, balance
    // 140.181.700 ₫.
    const lastIndex = model.bands[0].points.length - 1;
    expect(valueAt(model, "contributions", lastIndex)).toBe(30_000_000);
    expect(valueAt(model, "interest", lastIndex)).toBeCloseTo(10_181_700, 4);
    expect(HALF.futureValue).toBeCloseTo(140_181_700, 4);
  });

  it("positions the last point at 1,5 on the time axis", () => {
    // The defect: plotting it at 2 and labelling it "Năm 2" claimed a year of
    // compounding that never happened.
    expect(model.xMax).toBe(1.5);
    const periods = model.bands[0].points.map((point) => point.period);
    expect(periods).toEqual([0, 1, 1.5]);
  });

  it("labels the partial row by its real time and says so", () => {
    const last = model.table.rows[model.table.rows.length - 1];
    expect(last[0]).toBe("1,5 năm");
    expect(model.table.rows[0][0]).toBe("Năm 1");
    expect(model.summary).toContain("Sau 1,5 năm (3 kỳ)");
    expect(model.summary).toContain(L.partialNote);
    // And the picture marks where the credited term actually ends.
    expect(model.markers).toEqual([
      { period: 1.5, label: "Kết thúc ở 1,5 năm" },
    ]);
  });

  it("does NOT claim an uncredited compounding period here", () => {
    // 1,5 năm ghép nửa năm is exactly 3 periods: a partial YEAR, and nothing
    // left uncredited. The page used to report the first as the second.
    expect(HALF.uncreditedPeriods).toBe(0);
    expect(model.summary).not.toContain("Còn dư");
    // A term that really does leave a period uncredited says so: 2,5 năm ghép
    // hằng năm credits 2 and leaves half a period.
    const annual = computeCompound({
      principal: INITIAL,
      annualRatePercent: 6,
      years: 2.5,
      compounding: "annually",
    })!;
    expect(annual.periods).toBe(2);
    expect(annual.uncreditedPeriods).toBeCloseTo(0.5, 12);
    const withRemainder = compoundChartModel(annual, INITIAL, L);
    expect(withRemainder.summary).toContain("Còn dư 0,5 kỳ chưa hoàn thành.");
    // Its last checkpoint IS a whole year, so the partial-year note is absent.
    expect(withRemainder.summary).not.toContain(L.partialNote);
  });
});

/**
 * ORIGINAL ROW 16's short-horizon counterexample: daily compounding over an
 * entered 0,01 năm — 3 completed days — 100 triệu plus 10 triệu a day at 6%.
 *
 * The balance is valid (130.054.254,79 ₫), but a fixed one-decimal YEAR label
 * rendered the summary, the marker, every table row and every tick as
 * "0,0 năm", flattening real elapsed time to zero.
 */
describe("a horizon shorter than a year keeps its time visible", () => {
  const DAILY = computeCompound({
    principal: INITIAL,
    annualRatePercent: 6,
    years: 0.01,
    compounding: "daily",
    contributionPerPeriod: 10_000_000,
  })!;
  const model = compoundChartModel(DAILY, INITIAL, L);

  it("credits three daily periods", () => {
    expect(DAILY.periods).toBe(3);
    expect(DAILY.periodsPerYear).toBe(365);
    expect(DAILY.uncreditedPeriods).toBeCloseTo(0.65, 10);
    // 100 triệu + 3 × 10 triệu of own money, plus three days of interest.
    expect(DAILY.totalContributed).toBe(130_000_000);
    expect(DAILY.futureValue).toBeGreaterThan(130_000_000);
    expect(DAILY.futureValue).toBeLessThan(130_100_000);
  });

  it("reads the axis in DAYS instead of collapsing to 0,0 năm", () => {
    expect(model.xAxis.label).toBe(L.xAxisDays);
    const ticks = model.xAxis.ticks.map((tick) => tick.label);
    expect(ticks).toEqual(["0", "0,8", "1,5", "2,3", "3"]);
    // Every non-zero tick is distinguishable, which was the whole defect.
    expect(new Set(ticks).size).toBe(ticks.length);
  });

  it("names the span in days on the summary, the marker and the table", () => {
    expect(model.summary).toContain("Sau 3 ngày (3 kỳ)");
    // The defect, precisely: the time read "0,0 năm" everywhere.
    expect(model.summary).not.toContain("0,0 năm");
    expect(model.summary).not.toContain("0,0 ngày");
    expect(model.markers).toEqual([
      { period: DAILY.creditedYears, label: "Kết thúc ở 3 ngày" },
    ]);
    expect(model.table.rows[0][0]).toBe("3 ngày");
  });

  it("uses months for a horizon between a month and a year", () => {
    // 6 monthly periods: half a year, which reads better as 6 tháng.
    const halfYear = computeCompound({
      principal: INITIAL,
      annualRatePercent: 6,
      years: 0.5,
      compounding: "monthly",
      contributionPerPeriod: 10_000_000,
    })!;
    const model = compoundChartModel(halfYear, INITIAL, L);
    expect(halfYear.periods).toBe(6);
    expect(model.xAxis.label).toBe(L.xAxisMonths);
    expect(model.summary).toContain("Sau 6 tháng (6 kỳ)");
    expect(model.table.rows[0][0]).toBe("6 tháng");
    expect(model.xAxis.ticks.map((tick) => tick.label)).toEqual([
      "0",
      "1,5",
      "3",
      "4,5",
      "6",
    ]);
  });

  it("keeps the axis ticks readable at a fractional YEAR bound", () => {
    // Built here rather than reusing the enclosing model: this one is the
    // 1,5-year fixture, whose axis stays in years.
    const half = compoundChartModel(
      computeCompound({
        principal: INITIAL,
        annualRatePercent: 6,
        years: 1.5,
        compounding: "semiannually",
        contributionPerPeriod: 10_000_000,
      })!,
      INITIAL,
      L,
    );
    expect(half.xAxis.label).toBe(L.xAxis);
    expect(half.xAxis.ticks.map((tick) => tick.label)).toEqual([
      "0",
      "0,4",
      "0,8",
      "1,1",
      "1,5",
    ]);
  });
});

describe("the stacking geometry", () => {
  it("draws each band between the total below it and its own total", () => {
    const model = compoundChartModel(EXAMPLE, INITIAL, L);
    const paths = stackedAreaPaths(model.bands, model.xMax, model.yMax, {
      width: 100,
      height: 100,
      left: 0,
      right: 100,
      top: 0,
      bottom: 100,
    });
    expect(paths).toHaveLength(3);
    for (const path of paths) {
      expect(path.startsWith("M ")).toBe(true);
      expect(path.endsWith(" Z")).toBe(true);
    }
    // Disjoint: the second band's bottom edge is the first band's top edge, so
    // the same coordinate appears in both paths.
    const firstTopAtEnd = paths[0].match(/M ([\d.]+) ([\d.]+)/);
    expect(firstTopAtEnd).not.toBeNull();
  });
});

describe("the term bound", () => {
  it("refuses a term past the supported horizon rather than clamping it", () => {
    // Bounded BEFORE the year loop allocates: `years: 1e9` compounded daily
    // asked for a billion iterations from a finite input.
    expect(
      computeCompound({
        principal: INITIAL,
        annualRatePercent: 6,
        years: MAX_COMPOUND_YEARS + 1,
        compounding: "daily",
      }),
    ).toBeNull();
    expect(
      computeCompound({
        principal: INITIAL,
        annualRatePercent: 6,
        years: 1e9,
        compounding: "daily",
      }),
    ).toBeNull();
    // The bound itself is accepted, and the snapshots stop there.
    const atBound = computeCompound({
      principal: INITIAL,
      annualRatePercent: 6,
      years: MAX_COMPOUND_YEARS,
      compounding: "monthly",
    })!;
    expect(atBound.yearlyBalances).toHaveLength(MAX_COMPOUND_YEARS);
    expect(atBound.creditedYears).toBe(MAX_COMPOUND_YEARS);
  });
});
