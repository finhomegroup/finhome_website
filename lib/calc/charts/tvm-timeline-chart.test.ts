// Original row 18's timeline, on the same independently computed fixture as
// `lib/calc/tvm-questions.test.ts`: 500 triệu hiện có, 5 triệu cuối mỗi
// tháng, 6%/năm danh nghĩa.
import { describe, expect, it } from "vitest";
import { answerTvmQuestion } from "@/lib/calc/tvm-questions";
import { tvmTimelineModel } from "./tvm-timeline-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Dòng tiền theo thời gian",
  series: "{label}",
  xAxis: "Tháng",
  yAxis: "Số tiền ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Số dư theo mốc",
  tableHint: "Hai cột, hai câu hỏi.",
  periodColumn: "Tháng",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy kiểm tra lại số liệu.",
  balancePath: "Số dư",
  contributedPath: "Tiền bạn đã bỏ vào",
  goalReference: "Mục tiêu {goal}",
  horizonMarker: "Mốc bạn chọn: tháng {month}",
  fundedMarker: "Đủ mục tiêu: tháng {month}",
  summaryBalance:
    "Sau {months} tháng bạn có {balance}, gồm {paid} tiền của bạn và {interest} do lãi.",
  summaryContribution:
    "Để có {goal} sau {months} tháng, mỗi tháng góp {contribution}; tổng bỏ vào {paid}.",
  summaryMonths: "Tháng đầu tiên đạt {goal} là tháng {months}, số dư {balance}.",
  exactPeriodNote:
    "Phương trình cho {exact} kỳ: cuối tháng {before} là {beforeBalance}, cuối tháng {funded} là {fundedBalance}.",
  notReachedNote: "Chưa đạt trong giới hạn mô phỏng.",
  alreadyFundedNote: "Đã đạt ngay hôm nay.",
  rateNote: "Lãi suất là giả định của bạn.",
  monthColumn: "Tháng",
  balanceColumn: "Số dư",
  contributedColumn: "Tiền bạn đã bỏ vào",
};

const BASE = {
  currentSavings: 500_000_000,
  monthlyContribution: 5_000_000,
  annualRatePercent: 6,
};

describe("the horizon question", () => {
  const model = tvmTimelineModel(
    answerTvmQuestion({ ...BASE, question: "balanceAfter", months: 36 }),
    LABELS,
  );

  it("draws the balance and the reader's own money as two paths", () => {
    expect(model.series.map((s) => s.key)).toEqual(["balance", "contributed"]);
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.xMax).toBe(36);
    expect(model.unavailable).toBeNull();
  });

  it("starts both paths at month 0 and ends both at the horizon", () => {
    for (const series of model.series) {
      expect(series.points[0].period).toBe(0);
      expect(series.points.at(-1)!.period).toBe(36);
    }
    // Month 0 is the money in hand, with no contribution yet made.
    const balance = model.series[0].points[0].value;
    const contributed = model.series[1].points[0].value;
    expect(balance).toBe(500_000_000);
    expect(contributed).toBe(500_000_000);
  });

  it("puts the balance ABOVE the contributions at the end", () => {
    const balance = model.series[0].points.at(-1)!.value;
    const contributed = model.series[1].points.at(-1)!.value;
    expect(balance).toBeCloseTo(795_020_787.2351221, 4);
    expect(contributed).toBe(680_000_000);
    expect(balance).toBeGreaterThan(contributed);
  });

  it("marks the horizon and draws no goal line when there is no goal", () => {
    expect(model.markers).toEqual([
      { period: 36, label: "Mốc bạn chọn: tháng 36" },
    ]);
    expect(model.references).toEqual([]);
  });

  it("keeps the rate note on every summary", () => {
    expect(model.summary).toContain(LABELS.rateNote);
  });
});

describe("the goal questions", () => {
  it("draws the goal as a horizontal reference, not a marker", () => {
    const model = tvmTimelineModel(
      answerTvmQuestion({
        currentSavings: 500_000_000,
        annualRatePercent: 6,
        question: "contributionNeeded",
        goal: 800_000_000,
        months: 36,
      }),
      LABELS,
    );
    expect(model.references).toEqual([
      { value: 800_000_000, label: "Mục tiêu 800.000.000 ₫" },
    ]);
    expect(model.yMax).toBeGreaterThanOrEqual(800_000_000);
  });

  it("marks the DISCRETE funded month and explains the fractional one", () => {
    const model = tvmTimelineModel(
      answerTvmQuestion({
        ...BASE,
        question: "monthsNeeded",
        goal: 800_000_000,
      }),
      LABELS,
    );
    expect(model.markers[0].period).toBe(37);
    expect(model.markers[0].label).toBe("Đủ mục tiêu: tháng 37");
    expect(model.summary).toContain("là tháng 37");
    // The whole point of row 18's fixture, in the figure's own words.
    expect(model.summary).toContain("36,56 kỳ");
    expect(model.summary).toContain("cuối tháng 36 là 795.020.787 ₫");
    expect(model.summary).toContain("cuối tháng 37 là 803.995.891 ₫");
  });

  it("draws the plan to the funded month, whose balance is in the table", () => {
    const model = tvmTimelineModel(
      answerTvmQuestion({
        ...BASE,
        question: "monthsNeeded",
        goal: 800_000_000,
      }),
      LABELS,
    );
    expect(model.xMax).toBe(37);
    for (const series of model.series) {
      expect(series.points.at(-1)!.period).toBe(37);
    }
    // Both sides of the boundary are readable as exact figures.
    const months = model.table.rows.map((row) =>
      typeof row[0] === "string" ? row[0] : (row[0] as { value: number }).value,
    );
    expect(months).toContain(36);
    expect(months).toContain(37);
    expect(model.table.rows.length).toBeLessThanOrEqual(8);
  });

  it("says a goal beyond the horizon is not reached, and draws no false end", () => {
    const model = tvmTimelineModel(
      answerTvmQuestion({
        currentSavings: 1_000_000,
        monthlyContribution: 1_000,
        annualRatePercent: 0,
        question: "monthsNeeded",
        goal: 800_000_000,
      }),
      LABELS,
    );
    expect(model.summary).toContain(LABELS.notReachedNote);
    expect(model.summary).toContain("tháng —");
    // The goal line is inside the plot even though no path reaches it: that
    // is exactly the case a reader needs to see.
    expect(model.references[0].value).toBe(800_000_000);
    expect(model.yMax).toBeGreaterThanOrEqual(800_000_000);
  });

  it("withholds the plot when there is no span to draw", () => {
    const model = tvmTimelineModel(
      answerTvmQuestion({
        ...BASE,
        question: "monthsNeeded",
        goal: 400_000_000,
      }),
      LABELS,
    );
    expect(model.unavailable).not.toBeNull();
    expect(model.series).toEqual([]);
    // `ChartFigure` renders the REASON in place of the summary when a model
    // is unavailable, so the named case has to be there.
    expect(model.unavailable!.reason).toBe(LABELS.alreadyFundedNote);
  });

  it("withholds the plot with no answer at all", () => {
    const model = tvmTimelineModel(null, LABELS);
    expect(model.unavailable).not.toBeNull();
    expect(model.series).toEqual([]);
  });
});
