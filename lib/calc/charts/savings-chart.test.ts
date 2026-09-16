import { describe, it, expect } from "vitest";
import {
  savingsChartModel,
  savingsPathsModel,
  type SavingsChartLabels,
  type SavingsPathsLabels,
} from "@/lib/calc/charts/savings-chart";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";
import { projectSavings } from "@/lib/calc/savings-schedule";
import { countCell } from "@/lib/calc/table-cell";
import {
  renderTableCell,
  tableMoneyUnit,
  type TableCell,
} from "@/lib/calc/table-cell";
import { TABLE_UI } from "@/content/calculators/table-ui";

const L: SavingsChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Tích lũy tới mục tiêu",
  balanceSeries: "Số dư",
  contributedSeries: "Tiền bạn đã góp",
  targetReference: "Mục tiêu",
  goalMarker: "Tháng {n}",
  xAxis: "Tháng",
  yAxis: "Số tiền ({unit})",
  summary:
    "Đạt {target} sau {months} tháng: góp {contributed}, lãi giả định {interest}.",
  rateNote: "Lãi suất là giả định, không phải cam kết.",
  zeroRateNote: "Với lãi 0%, số dư đúng bằng tiền bạn góp.",
  sampledNote: "Đường vẽ lấy mẫu theo bước đều.",
  assumptions: ["Góp vào cuối mỗi tháng."],
  tableCaption: "Từng mốc",
  monthColumn: "Tháng",
  contributedColumn: "Đã góp",
  balanceColumn: "Số dư",
  unavailableReason: "Chưa có đáp án cho các số này.",
  unavailableRecovery: "Hãy tăng mức góp, kéo dài thời gian hoặc hạ mục tiêu.",
  unavailableBeyondLimit: "Không đạt được trong giới hạn công cụ hỗ trợ.",
  unavailableBeyondLimitRecovery: "Giới hạn là {limit} tháng.",
  unavailableInvalidInput: "Có ô đang nhập chưa đọc được.",
  unavailableInvalidInputRecovery: "Hãy sửa ô đang báo lỗi phía trên.",
};

/** Acceptance scenario 4: 100 triệu → 500 triệu over 60 months at 0%. */
const ZERO_RATE = computeSavingsGoal({
  mode: "contribution",
  initial: 100_000_000,
  target: 500_000_000,
  months: 60,
  annualRatePercent: 0,
})!;

const WITH_RATE = computeSavingsGoal({
  mode: "contribution",
  initial: 100_000_000,
  target: 500_000_000,
  months: 60,
  annualRatePercent: 6,
})!;

describe("the zero-rate acceptance scenario", () => {
  it("solves 6.666.666,67 ₫ a month", () => {
    expect(ZERO_RATE.contribution).toBeCloseTo(6_666_666.666_67, 4);
  });

  const model = savingsChartModel(ZERO_RATE, 0, L);

  it("reaches the target line at exactly the solver's month", () => {
    // The contract: the goal line and the hit time come from the solver, and
    // the drawn curve must agree with it rather than approximating it.
    const balance = model.series[0].points;
    const atMonth60 = balance.find((p) => p.period === 60)!;
    expect(atMonth60.value).toBeCloseTo(ZERO_RATE.target, 4);
    expect(model.references[0].value).toBeCloseTo(500_000_000, 6);
    expect(model.markers[0].period).toBeCloseTo(60, 6);
  });

  it("makes the two lines coincide at a 0% rate, and says why", () => {
    const [balance, contributed] = model.series;
    for (const [index, point] of balance.points.entries()) {
      expect(point.value).toBeCloseTo(contributed.points[index].value, 4);
    }
    expect(model.summary).toContain("số dư đúng bằng tiền bạn góp");
  });

  it("starts both lines at the opening balance, not at zero", () => {
    // Month 0 is what the saver already has. A curve from the origin would
    // claim they started with nothing.
    expect(model.series[0].points[0]).toEqual({
      period: 0,
      value: 100_000_000,
    });
    expect(model.series[1].points[0].value).toBe(100_000_000);
  });
});

/**
 * ORIGINAL ROW 19 / C09 — two accumulation paths, one target, two markers.
 *
 * The C09 fixture: 100 triệu already saved, a 500 triệu goal, 8 triệu a month
 * against 10 triệu a month at 6%/năm nominal. Whole funded cycles are 43 and
 * 35, eight months apart — the figures that article's own table reports.
 */
const PATH_LABELS: SavingsPathsLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Hai mức góp, cùng một mục tiêu",
  targetReference: "Mục tiêu",
  pathMarker: "{label}: đủ ở kỳ góp thứ {n}",
  xAxis: "Tháng thứ",
  yAxis: "Số dư ({unit})",
  summary: "Kỳ {base} so với kỳ {increased}, sớm hơn {earlier} tháng.",
  summaryZeroRate:
    "Kỳ {base} so với kỳ {increased}, sớm hơn {earlier} tháng, hoàn toàn do tiền góp thêm.",
  summaryOneLeg: "Chỉ một trong hai mức góp đạt mục tiêu.",
  rateNote: "Lãi suất là giả định.",
  assumptions: ["Góp vào cuối mỗi tháng."],
  tableCaption: "Số dư theo từng mốc",
  monthColumn: "Tháng",
  unavailableReason: "Chưa vẽ được biểu đồ.",
  unavailableRecovery: "Hãy tăng mức góp hoặc hạ mục tiêu.",
};

function pathFor(key: string, label: string, contribution: number) {
  const monthlyRate = 6 / 100 / 12;
  return {
    key,
    label,
    initial: 100_000_000,
    contribution,
    monthlyRate,
    schedule: projectSavings({
      initial: 100_000_000,
      contribution,
      monthlyRate,
      target: 500_000_000,
    }),
  };
}

describe("savingsPathsModel", () => {
  const base = pathFor("base", "Mức hiện tại", 8_000_000);
  const higher = pathFor("higher", "Sau khi góp thêm", 10_000_000);
  const model = savingsPathsModel([base, higher], 500_000_000, PATH_LABELS);

  it("draws one series per contribution level", () => {
    expect(model.series.map((s) => s.key)).toEqual(["base", "higher"]);
    // Colour is never the only channel: the second path is dashed.
    expect(model.series[0].stroke).toBe("solid");
    expect(model.series[1].stroke).toBe("dashed");
  });

  it("marks BOTH first-funded cycles, at 43 and 35", () => {
    expect(base.schedule.fundedMonth).toBe(43);
    expect(higher.schedule.fundedMonth).toBe(35);
    expect(model.markers.map((m) => m.period)).toEqual([43, 35]);
    expect(model.markers[0].label).toContain("43");
    expect(model.markers[1].label).toContain("Sau khi góp thêm");
  });

  it("states the eight-month difference in its own summary", () => {
    expect(model.summary).toContain("sớm hơn 8 tháng");
    expect(model.summary).toContain(PATH_LABELS.rateNote);
  });

  it("runs the axis to the SLOWER path, so it is not cut off", () => {
    expect(model.xMax).toBe(43);
    expect(model.yMax).toBeGreaterThanOrEqual(500_000_000);
    expect(model.references[0].value).toBe(500_000_000);
  });

  it("puts the same balances in the table as on the lines", () => {
    const firstRow = model.table.rows[0];
    expect(firstRow[0]).toEqual({ kind: "count", value: 0 });
    expect(firstRow[1]).toEqual({ kind: "money", value: 100_000_000 });
    const lastRow = model.table.rows[model.table.rows.length - 1];
    expect(lastRow[0]).toEqual({ kind: "count", value: 43 });
    const slower = lastRow[1] as { value: number };
    expect(slower.value).toBeCloseTo(base.schedule.balance, 6);
  });

  it("stops each column where that path stops, rather than extrapolating", () => {
    // The defect: the faster plan funded at 35 and the table kept adding its
    // contribution out to month 43, reporting balances the plan never has —
    // and they look precise in the exact-đồng reading.
    const monthOf = (row: (typeof model.table.rows)[number]) =>
      (row[0] as { value: number }).value;
    const beyond = model.table.rows.filter((row) => monthOf(row) > 35);
    expect(beyond.length).toBeGreaterThan(0);
    for (const row of beyond) {
      expect(row[2], `month ${monthOf(row)}`).toBeNull();
    }
    // Up to its own horizon it still reports figures.
    const within = model.table.rows.filter((row) => monthOf(row) <= 35);
    for (const row of within) expect(row[2]).not.toBeNull();
  });

  it("keeps BOTH attainment months as checkpoints, whatever the thinning", () => {
    const months = model.table.rows.map(
      (row) => (row[0] as { value: number }).value,
    );
    expect(months).toContain(35);
    expect(months).toContain(43);
    // Still sorted, and still bounded.
    expect([...months].sort((a, b) => a - b)).toEqual(months);
    expect(months.length).toBeLessThanOrEqual(16);
    // The funded balance at each path's own attainment month is the figure
    // the headline names.
    const at35 = model.table.rows[months.indexOf(35)];
    expect((at35[2] as { value: number }).value).toBeCloseTo(
      higher.schedule.balance,
      6,
    );
  });

  it("does not credit interest for the gap at a 0% rate", () => {
    // The positive-rate sentence says the extra contributions AND the
    // interest they earn explain the faster path, and that the two cannot be
    // separated. At 0% there is no interest in either figure.
    const flatBase = {
      key: "base",
      label: "Mức hiện tại",
      initial: 100_000_000,
      contribution: 8_000_000,
      monthlyRate: 0,
      schedule: projectSavings({
        initial: 100_000_000,
        contribution: 8_000_000,
        monthlyRate: 0,
        target: 500_000_000,
      }),
    };
    const flatHigher = {
      ...flatBase,
      key: "higher",
      label: "Sau khi góp thêm",
      contribution: 10_000_000,
      schedule: projectSavings({
        initial: 100_000_000,
        contribution: 10_000_000,
        monthlyRate: 0,
        target: 500_000_000,
      }),
    };
    const flat = savingsPathsModel(
      [flatBase, flatHigher],
      500_000_000,
      PATH_LABELS,
    );
    // 400 triệu of gap: 50 cycles at 8 triệu, 40 at 10 triệu.
    expect(flatBase.schedule.fundedMonth).toBe(50);
    expect(flatHigher.schedule.fundedMonth).toBe(40);
    expect(flat.summary).toContain("hoàn toàn do tiền góp thêm");
    expect(flat.summary).not.toContain(PATH_LABELS.summary.slice(0, 12));
    // A positive rate keeps the general sentence.
    expect(model.summary).toContain("sớm hơn 8 tháng");
    expect(model.summary).not.toContain("hoàn toàn do tiền góp thêm");
  });

  it("lets a caller replace the assumptions with its own", () => {
    // C09's figure has an endpoint table with no month rows, so it must not
    // inherit the clause about what later month rows do.
    const own = ["Chỉ một giả định của bài viết."];
    const withOwn = savingsPathsModel(
      [base, higher],
      500_000_000,
      PATH_LABELS,
      { assumptions: own },
    );
    expect(withOwn.assumptions).toBe(own);
    expect(model.assumptions).toEqual(PATH_LABELS.assumptions);
  });

  it("keeps a caller's own accessible table when one is supplied", () => {
    // C09 keeps its exact comparison figures as the data behind the picture.
    const supplied = {
      caption: "Bảng của bài viết",
      columns: [{ label: "Chỉ tiêu" }, { label: "Giá trị", numeric: true }],
      rows: [["Kỳ góp đủ mục tiêu", countCell(43)]],
    };
    const withTable = savingsPathsModel(
      [base, higher],
      500_000_000,
      PATH_LABELS,
      { table: supplied },
    );
    expect(withTable.table).toBe(supplied);
    expect(withTable.markers).toHaveLength(2);
  });

  it("explains itself instead of drawing when no path is usable", () => {
    const frozen = {
      key: "frozen",
      label: "Không góp",
      initial: 100_000_000,
      contribution: 0,
      monthlyRate: 0,
      schedule: projectSavings({
        initial: 100_000_000,
        contribution: 0,
        monthlyRate: 0,
        target: 500_000_000,
      }),
    };
    const blank = savingsPathsModel([frozen], 500_000_000, PATH_LABELS);
    expect(blank.unavailable?.reason).toBe(PATH_LABELS.unavailableReason);
    expect(blank.series).toHaveLength(0);
    expect(blank.markers).toHaveLength(0);
  });

  it("says so when only one of the two paths funds", () => {
    const crawling = {
      key: "crawl",
      label: "Góp rất ít",
      initial: 0,
      contribution: 1,
      monthlyRate: 0,
      schedule: projectSavings({
        initial: 0,
        contribution: 1,
        monthlyRate: 0,
        target: 500_000_000,
      }),
    };
    const oneLeg = savingsPathsModel(
      [crawling, higher],
      500_000_000,
      PATH_LABELS,
    );
    expect(crawling.schedule.fundedMonth).toBeNull();
    expect(oneLeg.summary).toContain(PATH_LABELS.summaryOneLeg);
    // One marker, for the path that actually arrives. No invented date.
    expect(oneLeg.markers).toHaveLength(1);
  });
});

describe("savingsChartModel with a positive rate", () => {
  const model = savingsChartModel(WITH_RATE, 6, L);

  it("separates what the saver put in from what the rate added", () => {
    // The educational point: the lower line is the part they control.
    const [balance, contributed] = model.series;
    const lastBalance = balance.points[balance.points.length - 1].value;
    const lastContributed =
      contributed.points[contributed.points.length - 1].value;
    expect(lastBalance).toBeGreaterThan(lastContributed);
    expect(lastBalance - lastContributed).toBeCloseTo(
      WITH_RATE.interestEarned,
      2,
    );
  });

  it("agrees with the solver at the final month, to the đồng", () => {
    const balance = model.series[0].points;
    expect(balance[balance.length - 1].value).toBeCloseTo(WITH_RATE.target, 2);
  });

  it("distinguishes the two lines without relying on colour", () => {
    expect(model.series[0].stroke).toBe("solid");
    expect(model.series[1].stroke).toBe("dashed");
  });

  it("always says the rate is an assumption", () => {
    expect(model.summary).toContain("không phải cam kết");
  });

  it("does not claim the zero-rate coincidence when the rate is positive", () => {
    expect(model.summary).not.toContain("đúng bằng tiền bạn góp");
  });

  it("bounds the axis above both the target and the final balance", () => {
    expect(model.yMax).toBeGreaterThanOrEqual(WITH_RATE.target);
    expect(model.yMin).toBe(0);
    expect(model.step).toBe(false);
  });
});

describe("a fractional number of months", () => {
  const solved = computeSavingsGoal({
    mode: "months",
    initial: 100_000_000,
    target: 500_000_000,
    contribution: 8_500_000,
    annualRatePercent: 0,
  })!;

  it("puts the marker on the funded CYCLE, not on the fractional solve", () => {
    // (500 − 100) / 8,5 = 47,06 months. The 47th contribution leaves
    // 499,5 triệu — short — so the 48th is the first one that covers the goal.
    // A marker at 47,1 drew a contribution that nobody makes, and it sat at a
    // different month from the headline and the table.
    expect(solved.months).toBeCloseTo(47.0588, 3);
    // The MODE is passed in, not inferred from whether `months` happens to be
    // an integer — see `savings-schedule.ts`.
    const model = savingsChartModel(solved, 0, L, "months");
    expect(model.markers[0].period).toBe(48);
    expect(model.markers[0].label).toBe("Tháng 48");
    expect(100_000_000 + 8_500_000 * 47).toBeLessThan(500_000_000);
    expect(100_000_000 + 8_500_000 * 48).toBeGreaterThan(500_000_000);
  });

  it("names the same month in the summary as on the marker", () => {
    // The consistency claim: one horizon, not three.
    const model = savingsChartModel(solved, 0, L, "months");
    expect(model.summary).toContain("sau 48 tháng");
    expect(model.xMax).toBe(48);
    const lastRow = model.table.rows[model.table.rows.length - 1];
    expect(lastRow[0]).toEqual({ kind: "count", value: 48 });
  });

  it("draws whole months out to the month the goal is reached IN", () => {
    const model = savingsChartModel(solved, 0, L, "months");
    expect(model.xMax).toBe(48);
    const last = model.series[0].points[model.series[0].points.length - 1];
    expect(last.period).toBe(48);
    // And it does overshoot the target by month 48, which is the truth.
    expect(last.value).toBeGreaterThan(500_000_000);
  });

  it("gives a malformed FIELD its own recovery, not plan advice", () => {
    // Telling a reader to raise their contribution when the real problem is
    // a stray comma sends them after the wrong thing.
    const model = savingsChartModel(null, 0, L, "months", true);
    expect(model.unavailable!.reason).toBe(L.unavailableInvalidInput);
    expect(model.unavailable!.recovery).toBe(L.unavailableInvalidInputRecovery);
    expect(model.unavailable!.recovery).not.toBe(L.unavailableRecovery);
    expect(model.series).toEqual([]);
  });

  it("draws nothing when a fractional solve is handed to a whole-horizon mode", () => {
    // Not a cosmetic guard: a fractional horizon in `contribution` or
    // `target` mode is a broken result, and drawing it would put a plan on
    // screen that the solver never produced.
    const model = savingsChartModel(solved, 0, L, "contribution");
    expect(model.unavailable).not.toBeNull();
    expect(model.series).toEqual([]);
  });
});

describe("nothing to draw", () => {
  it("explains an unreachable goal and what to change", () => {
    // Acceptance scenario 4's second half: a 0% rate and no contribution
    // cannot reach a higher target, and the chart must not extrapolate to it.
    const impossible = computeSavingsGoal({
      mode: "months",
      initial: 100_000_000,
      target: 500_000_000,
      contribution: 0,
      annualRatePercent: 0,
    });
    expect(impossible).toBeNull();

    const model = savingsChartModel(impossible, 0, L);
    expect(model.unavailable).not.toBeNull();
    expect(model.unavailable!.reason).toBe("Chưa có đáp án cho các số này.");
    expect(model.unavailable!.recovery).toContain("tăng mức góp");
    expect(model.series).toEqual([]);
    expect(model.references).toEqual([]);
    expect(model.markers).toEqual([]);
  });

  it("never shows a success state with no series", () => {
    const model = savingsChartModel(null, 0, L);
    expect(model.references).toEqual([]);
    expect(model.table.rows).toEqual([]);
    expect(model.yMax).toBe(0);
  });

  it("refuses a non-finite or non-positive horizon", () => {
    const broken = { ...ZERO_RATE, months: Infinity };
    expect(savingsChartModel(broken, 0, L).unavailable).not.toBeNull();
    expect(
      savingsChartModel({ ...ZERO_RATE, months: 0 }, 0, L).unavailable,
    ).not.toBeNull();
  });
});

describe("the accessible table", () => {
  it("stays readable instead of shipping one row per month", () => {
    const long = computeSavingsGoal({
      mode: "contribution",
      initial: 0,
      target: 2_000_000_000,
      months: 360,
      annualRatePercent: 6,
    })!;
    const model = savingsChartModel(long, 6, L);
    expect(model.series[0].points).toHaveLength(361);
    // Thinned to checkpoints — a 361-row table is not an alternative to a
    // picture, it is a worse one.
    expect(model.table.rows.length).toBeLessThanOrEqual(13);
  });

  it("always includes the final month, because that is the answer", () => {
    const long = computeSavingsGoal({
      mode: "contribution",
      initial: 0,
      target: 2_000_000_000,
      months: 360,
      annualRatePercent: 6,
    })!;
    const model = savingsChartModel(long, 6, L);
    expect(model.table.rows[model.table.rows.length - 1][0]).toEqual({
      kind: "count",
      value: 360,
    });
  });

  it("puts the same numbers in the table as on the lines", () => {
    const model = savingsChartModel(ZERO_RATE, 0, L);
    const firstRow = model.table.rows[0];
    // A month number is a COUNT: never scaled to a money unit in either
    // display mode, so month 360 reads "360" beside amounts in triệu.
    expect(firstRow[0]).toEqual({ kind: "count", value: 0 });
    expect(firstRow[1]).toEqual({ kind: "money", value: 100_000_000 });
    expect(firstRow[2]).toEqual({ kind: "money", value: 100_000_000 });
    const lastRow = model.table.rows[model.table.rows.length - 1];
    expect(lastRow[0]).toEqual({ kind: "count", value: 60 });
    expect(lastRow[2]).toEqual({ kind: "money", value: 500_000_000 });
  });

  it("renders its own rows in one unit, months excepted", () => {
    // The founder's requirement, on this table's real figures: one stated
    // money unit, thousands-grouped, with the month column untouched.
    const model = savingsChartModel(ZERO_RATE, 0, L);
    const unit = tableMoneyUnit(model.table.rows);
    expect(unit).toBe("trieu");
    const show = (cell: TableCell) =>
      renderTableCell(cell, "compact", unit, TABLE_UI);
    expect(show(model.table.rows[0][0])).toBe("0");
    expect(show(model.table.rows[0][1])).toBe("100,0");
    const last = model.table.rows[model.table.rows.length - 1];
    expect(show(last[0])).toBe("60");
    expect(show(last[2])).toBe("500,0");
  });
});
