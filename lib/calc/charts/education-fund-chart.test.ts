// Original row 25, against the audit's independent arrival fixture.
//
// Tuition 80 triệu today, 8% tuition growth, study starts 10 years from now,
// 4 annual payments at the beginning of each study year; current fund 200
// triệu, 7% effective annual return, 120 end-month contributions. Computed in
// plain JavaScript with no production import.
import { describe, expect, it } from "vitest";
import { computeEducationSavings } from "@/lib/calc/education-savings";
import { formatMoney } from "@/lib/calc/number";
import { educationFundChartModel } from "./education-fund-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Quỹ học phí và nhu cầu theo thời gian",
  series: "{label}",
  xAxis: "Năm kể từ hôm nay",
  yAxis: "Số tiền ({unit})",
  assumptions: [
    "Mọi con số do bạn nhập.",
    "Học phí trả vào đầu mỗi năm học.",
    "Lợi nhuận là giả định của bạn.",
    "Chưa tính chi phí ngoài học phí.",
  ],
  contributionAssumption: "Giả định bạn góp đủ mức trên, mỗi tháng.",
  immediateFundAssumption: "Chỉ gồm số tiền đang có; không có khoản góp nào.",
  tableCaption: "Từng năm",
  tableHint: "Cột nhu cầu là số tiền cần có tại đúng năm đó.",
  periodColumn: "Năm",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy nhập học phí và số năm.",
  fundPath: "Quỹ dự kiến có",
  needPath: "Nhu cầu tại thời điểm đó",
  startMarker: "Năm {year}: bắt đầu học, trả học phí đầu tiên",
  summary:
    "Đến năm {startYear} quỹ cần đạt {target}; học phí năm đầu {firstTuition} được trả ngay, còn lại {afterFirst}. Mức góp cần thiết {contribution} mỗi tháng.",
  summaryUnderfunded:
    "Cần {target} nhưng chỉ có {held} — thiếu {gap}. Học phí năm đầu {firstTuition}, quỹ trả được {firstPaid}; cả khóa còn {unpaid} chưa có nguồn.",
  noContributionNote: "Không tính được mức góp mỗi tháng.",
  behindNote: "Hiện có {fund} so với nhu cầu {need} tại thời điểm này.",
  aheadNote: "Quỹ hiện tại đã vượt nhu cầu của thời điểm này.",
  assumptionNote: "Mức tăng học phí là giả định của bạn.",
  noTimeNote: "Không còn thời gian để góp.",
  yearColumn: "Năm",
  fundColumn: "Quỹ",
  tuitionColumn: "Học phí",
  paidColumn: "Quỹ trả được",
  needColumn: "Nhu cầu",
};

const INPUT = {
  annualTuitionToday: 80_000_000,
  yearsUntilStart: 10,
  yearsOfStudy: 4,
  tuitionInflationPercent: 8,
  currentSavings: 200_000_000,
  investmentReturnPercent: 7,
};

// The live-page boundary an independent review found: wait 0 with 10 triệu
// saved. The figure claimed the 80 triệu first tuition "được trả" while only
// 10 triệu existed, and quoted a contribution of 0/month.
describe("a plan with no time to save and not enough money", () => {
  const NOW = {
    ...INPUT,
    yearsUntilStart: 0,
    currentSavings: 10_000_000,
  };
  const r = computeEducationSavings(NOW)!;
  const model = educationFundChartModel(r, LABELS);

  it("uses the UNDERFUNDED sentence, never the funded one", () => {
    expect(model.summary).toContain("thiếu");
    expect(model.summary).toContain(LABELS.noContributionNote);
    // The funded sentence's own clause about the contribution must not appear.
    expect(model.summary).not.toContain("Mức góp cần thiết");
  });

  it("does not list a monthly contribution among its ASSUMPTIONS either", () => {
    // The last of the conditional-prose items: the bullet list is static, so
    // it kept promising a monthly deposit in both no-time cases.
    expect(model.assumptions).toContain(LABELS.immediateFundAssumption);
    expect(model.assumptions).not.toContain(LABELS.contributionAssumption);
    // The other four bullets are untouched, and the chosen one keeps its
    // position — third of five.
    expect(model.assumptions).toHaveLength(5);
    expect(model.assumptions[2]).toBe(LABELS.immediateFundAssumption);
    for (const bullet of LABELS.assumptions) {
      expect(model.assumptions).toContain(bullet);
    }
  });

  it("does not promise that contributions will close the gap", () => {
    // `behindNote` ends "phần các khoản góp phải bù", one sentence after the
    // summary has said no monthly amount exists. Source review found both.
    expect(model.summary).not.toContain(
      "Hiện có",
    );
    expect(model.summary).not.toContain(LABELS.aheadNote);
  });

  it("says what the fund can PAY, not what is due", () => {
    expect(model.summary).toContain(`${formatMoney(80_000_000)} ₫`);
    expect(model.summary).toContain(`${formatMoney(10_000_000)} ₫`);
    // And it names the tuition with no source across the whole course.
    expect(model.summary).toContain(
      `${formatMoney(r.totalTuitionUnpaid)} ₫`,
    );
    expect(r.totalTuitionUnpaid).toBeGreaterThan(0);
  });

  it("tabulates due beside payable, so the gap is readable per year", () => {
    const due = model.table.columns.map((c) => c.label);
    expect(due).toContain(LABELS.tuitionColumn);
    expect(due).toContain(LABELS.paidColumn);
    const firstStudy = model.table.rows.find(
      (row) => typeof row[2] === "object",
    )!;
    const cell = (value: unknown) => (value as { value: number }).value;
    expect(cell(firstStudy[2])).toBeCloseTo(80_000_000, 4);
    expect(cell(firstStudy[3])).toBe(10_000_000);
  });
});

describe("a plan with no time to save that IS funded", () => {
  const r = computeEducationSavings({
    ...INPUT,
    yearsUntilStart: 0,
    currentSavings: 400_000_000,
  })!;
  const model = educationFundChartModel(r, LABELS);

  it("also drops the contribution bullet when none is made", () => {
    // 0 contribution because none is NEEDED still means the drawn fund line
    // is only the money already held, so the bullet is wrong here too.
    expect(r.monthsToSave).toBe(0);
    expect(model.assumptions).toContain(LABELS.immediateFundAssumption);
    expect(model.assumptions).not.toContain(LABELS.contributionAssumption);
  });

  it("uses the funded sentence and pays every year in full", () => {
    expect(r.fundingGapAtStart).toBe(0);
    expect(r.totalTuitionUnpaid).toBeCloseTo(0, 6);
    expect(model.summary).toContain("Mức góp cần thiết");
    expect(model.summary).not.toContain("thiếu");
    // 0 ₫ is the honest contribution here: none is NEEDED.
    expect(r.monthlyContribution).toBe(0);
    expect(model.summary).not.toContain(LABELS.noContributionNote);
  });
});

describe("the engine matches the audit's arrival fixture", () => {
  const r = computeEducationSavings(INPUT)!;
  const at = (year: number) => r.series.find((p) => p.yearsFromNow === year)!;

  it("keeps the headline figures the audit computed", () => {
    expect(r.targetAtStart).toBeCloseTo(700_601_379.335921, 3);
    expect(r.currentSavingsAtStart).toBeCloseTo(393_430_271.457913, 3);
    expect(r.monthlyContribution!).toBeCloseTo(1_795_779.005698, 4);
    expect(r.totalTuitionNominal).toBeCloseTo(778_268_626.98487, 3);
  });

  it("starts the series today, with the fund behind the need", () => {
    // The gap the second line exists to show.
    expect(at(0).fund).toBe(200_000_000);
    expect(at(0).need).toBeCloseTo(700_601_379.335921 / 1.07 ** 10, 3);
    expect(at(0).fund).toBeLessThan(at(0).need);
  });

  it("pays the first tuition AT arrival, not a year later", () => {
    const arrival = at(10);
    expect(arrival.fund).toBeCloseTo(700_601_379.335923, 2);
    expect(arrival.tuitionDue).toBeCloseTo(172_713_999.781823, 3);
    expect(arrival.fundAfterTuition).toBeCloseTo(527_887_379.5541, 2);
    // And the need on that date IS the target.
    expect(arrival.need).toBeCloseTo(r.targetAtStart, 2);
  });

  it("walks the drawdown through every study year", () => {
    expect(at(11).fund).toBeCloseTo(564_839_496.122887, 2);
    expect(at(11).tuitionDue).toBeCloseTo(186_531_119.764369, 3);
    expect(at(11).fundAfterTuition).toBeCloseTo(378_308_376.358518, 2);

    expect(at(12).fund).toBeCloseTo(404_789_962.703614, 2);
    expect(at(12).tuitionDue).toBeCloseTo(201_453_609.345518, 3);
    expect(at(12).fundAfterTuition).toBeCloseTo(203_336_353.358095, 2);

    expect(at(13).fund).toBeCloseTo(217_569_898.093162, 2);
    expect(at(13).tuitionDue).toBeCloseTo(217_569_898.09316, 3);
    // The plan ends at approximately zero, by construction.
    expect(at(13).fundAfterTuition).toBeLessThan(1);
  });

  it("makes the need in the last year equal that year's tuition", () => {
    expect(at(13).need).toBeCloseTo(at(13).tuitionDue, 2);
  });

  it("bounds the plan before the series allocates", () => {
    expect(
      computeEducationSavings({ ...INPUT, yearsUntilStart: 97 }),
    ).toBeNull();
    expect(
      computeEducationSavings({ ...INPUT, yearsUntilStart: 96 }),
    ).not.toBeNull();
  });
});

describe("the figure reads the two curves", () => {
  const model = educationFundChartModel(computeEducationSavings(INPUT)!, LABELS);

  it("draws the fund and the need", () => {
    expect(model.series.map((s) => s.key)).toEqual(["fund", "need"]);
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.xMax).toBe(13);
    expect(model.unavailable).toBeNull();
  });

  it("marks the start of study as the first payment", () => {
    expect(model.markers).toHaveLength(1);
    expect(model.markers[0].period).toBe(10);
    expect(model.markers[0].label).toContain("trả học phí đầu tiên");
  });

  it("says the plan is behind today, with both figures", () => {
    // The need at today's date is the target discounted ten years at 7%. It
    // is derived here rather than typed: a hand-divided 356.148.443 was wrong
    // by 1.772 ₫ on the first draft of this test, and the engine was right.
    const r = computeEducationSavings(INPUT)!;
    const needToday = r.targetAtStart / 1.07 ** 10;
    expect(needToday).toBeCloseTo(356_150_215, 0);
    expect(model.summary).toContain("Hiện có 200.000.000 ₫");
    expect(model.summary).toContain(
      `so với nhu cầu ${formatMoney(needToday)} ₫`,
    );
  });

  it("names the target, the first payment and what is left", () => {
    expect(model.summary).toContain("700.601.379 ₫");
    expect(model.summary).toContain("172.714.000 ₫");
    expect(model.summary).toContain("527.887.380 ₫");
  });

  it("always says the tuition growth is an assumption", () => {
    expect(model.summary).toContain(LABELS.assumptionNote);
  });

  it("tabulates every year with the year as a COUNT, not money", () => {
    expect(model.table.rows).toHaveLength(14);
    const arrival = model.table.rows.find(
      (row) => (row[0] as { value: number }).value === 10,
    )!;
    expect(arrival[0]).toEqual({ kind: "count", value: 10 });
    expect((arrival[1] as { value: number }).value).toBeCloseTo(
      700_601_379.335923,
      2,
    );
    expect((arrival[2] as { value: number }).value).toBeCloseTo(
      172_713_999.781823,
      3,
    );
    // Four columns plus cards, because the money columns were offscreen at
    // 390 px before this row was typed.
    expect(model.table.mobileCards).toBe(true);
  });

  it("leaves the tuition cell empty during the saving years", () => {
    const year0 = model.table.rows[0];
    expect(year0[2]).toBe("");
  });
});

describe("the other states", () => {
  it("says so when the fund is already ahead", () => {
    const rich = computeEducationSavings({
      ...INPUT,
      currentSavings: 600_000_000,
    })!;
    const model = educationFundChartModel(rich, LABELS);
    expect(model.summary).toContain(LABELS.aheadNote);
  });

  it("withholds the plot with no result", () => {
    const model = educationFundChartModel(null, LABELS);
    expect(model.series).toEqual([]);
    expect(model.unavailable).not.toBeNull();
  });

  it("withholds the plot when study starts now with one year", () => {
    // One point cannot be a line, and the page's rows still report the case.
    const now = computeEducationSavings({
      ...INPUT,
      yearsUntilStart: 0,
      yearsOfStudy: 1,
    })!;
    expect(now.series).toHaveLength(1);
    expect(educationFundChartModel(now, LABELS).unavailable).not.toBeNull();
  });
});
