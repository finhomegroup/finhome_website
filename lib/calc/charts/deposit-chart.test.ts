/**
 * ORIGINAL ROW 20's figure: three bars over one deposit.
 *
 * The contract this file exists to hold: the gap between taking the money
 * early and holding to maturity is drawn as TWO steps — the rate difference
 * over the same days, then the days that have not run — so no part of the
 * picture can be read as "this is your penalty".
 */
import { describe, expect, it } from "vitest";
import { planDeposit, type DepositPlanInput } from "@/lib/calc/deposit-plan";
import {
  depositChartModel,
  depositTimelineModel,
  type DepositChartLabels,
  type DepositTimelineLabels,
} from "@/lib/calc/charts/deposit-chart";

const L: DepositChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Lãi tới ngày cần tiền",
  barAtExit: "Thực nhận",
  barSameHorizon: "Cùng số ngày theo lãi kỳ hạn",
  barHeldToMaturity: "Giữ tới đáo hạn",
  segmentMatured: "Kỳ đã đến hạn",
  segmentEarly: "Kỳ dở, mức rút sớm",
  segmentTermRate: "Kỳ dở, lãi kỳ hạn",
  segmentFuture: "Ngày chưa chạy",
  axis: "Lãi ({unit})",
  summaryBefore:
    "Cần tiền {need} trước đáo hạn {maturity}: {days} ngày của kỳ này, {totalDays} ngày từ ngày gửi, tổng {interest}.",
  summaryAt:
    "Đúng đáo hạn {maturity}: kỳ này {days} ngày, {totalDays} ngày qua {terms} kỳ, tổng {interest}.",
  summaryAfter: "Đáo hạn {maturity}, cần tiền {need}: {interest}.",
  earlyNote: "Mức rút sớm là con số bạn nhập.",
  noBreakNote: "Không cần rút trước hạn.",
  assumptions: ["Số ngày thực tế chia 365."],
  tableCaption: "Các mốc",
  itemColumn: "Chỉ tiêu",
  valueColumn: "Giá trị",
  rowDepositDate: "Ngày gửi ban đầu",
  rowFirstMaturity: "Đáo hạn kỳ đầu",
  rowCurrentStart: "Bắt đầu kỳ đang xét",
  rowCurrentMaturity: "Đáo hạn kỳ đang xét",
  rowNeedDate: "Ngày cần tiền",
  rowTerms: "Số kỳ hạn",
  rowTotalDays: "Tổng số ngày",
  rowCurrentTermDays: "Số ngày kỳ đang xét",
  rowDaysIntoTerm: "Ngày đã chạy trong kỳ",
  rowDaysToMaturity: "Ngày còn lại",
  rowMaturedInterest: "Lãi kỳ đã đến hạn",
  rowInterestAtExit: "Tổng lãi tới ngày cần tiền",
  rowSameHorizon: "Cùng số ngày theo lãi kỳ hạn",
  rowRateDifference: "Chênh do lãi suất",
  rowFuture: "Lãi ngày chưa chạy",
  rowAvailable: "Tiền bạn có",
  rowNewPayment: "Ngân hàng trả hôm đó",
  rowAlreadyPaid: "Lãi đã nhận trước đó",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy kiểm tra hai ngày.",
};

const TIMELINE: DepositTimelineLabels = {
  title: "Mốc thời gian",
  deposit: "Ngày gửi",
  firstMaturity: "Đáo hạn kỳ đầu",
  currentStart: "Bắt đầu kỳ đang xét",
  currentMaturity: "Đáo hạn kỳ đang xét",
  needDate: "Ngày cần tiền",
  dayOffset: "sau {days} ngày",
  summaryBefore: "Cần tiền {need} trước đáo hạn {maturity}, còn {days} ngày.",
  summaryAt: "Trùng đúng đáo hạn {maturity}.",
  summaryAfter: "Đáo hạn {maturity}, {days} ngày trước khi cần tiền {need}.",
  note: "Hình minh họa, không phải lịch hẹn.",
  unavailableReason: "Chưa vẽ được mốc thời gian.",
};

const BASE: DepositPlanInput = {
  principal: 500_000_000,
  annualRatePercent: 6,
  earlyRatePercent: 0.2,
  start: { year: 2026, month: 1, day: 31 },
  termMonths: 6,
  needDate: { year: 2026, month: 4, day: 30 },
  renew: false,
};

describe("the money is needed before maturity", () => {
  const plan = planDeposit(BASE)!;
  const model = depositChartModel(plan, L);

  it("draws three bars, each stacked from the same parts", () => {
    expect(model.bars.map((bar) => bar.key)).toEqual([
      "atExit",
      "sameHorizon",
      "heldToMaturity",
    ]);
    // The reader's own figure is the emphasised one.
    expect(model.bars[0].emphasis).toBe(true);
    expect(model.bars[2].segments.map((s) => s.key)).toEqual([
      "termRate",
      "future",
    ]);
  });

  it("makes each step ONE cause, and the two steps sum to the gap", () => {
    const [exit, same, held] = model.bars.map((bar) => bar.total);
    expect(same - exit).toBeCloseTo(plan.rateDifference!, 6);
    expect(held - same).toBeCloseTo(plan.foregoneFutureInterest!, 6);
    // 7.071.232,88 of rate plus 7.561.643,84 of unrun time.
    expect(same - exit).toBeCloseTo(7_071_232.876712329, 2);
    expect(held - same).toBeCloseTo(7_561_643.835616438, 2);
  });

  it("every bar's segments sum to its own total", () => {
    for (const bar of model.bars) {
      const sum = bar.segments.reduce((total, s) => total + s.value, 0);
      expect(sum).toBeCloseTo(bar.total, 6);
    }
  });

  it("states both dates and the early-rate caveat in its summary", () => {
    expect(model.summary).toContain("30/4/2026");
    expect(model.summary).toContain("31/7/2026");
    expect(model.summary).toContain("89 ngày");
    expect(model.summary).toContain(L.earlyNote);
    expect(model.summary).not.toContain(L.noBreakNote);
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("keeps days as counts and amounts as money in the table", () => {
    const rows = new Map(model.table.rows.map((row) => [row[0] as string, row[1]]));
    expect(rows.get(L.rowNeedDate)).toBe("30/4/2026");
    expect(rows.get(L.rowTotalDays)).toEqual({ kind: "count", value: 89 });
    expect(rows.get(L.rowDaysIntoTerm)).toEqual({ kind: "count", value: 89 });
    expect(rows.get(L.rowDaysToMaturity)).toEqual({ kind: "count", value: 92 });
    expect(rows.get(L.rowInterestAtExit)).toEqual({
      kind: "money",
      value: plan.interestAtExit,
    });
    // Availability and payment are separate rows, equal here.
    expect(rows.get(L.rowAvailable)).toEqual({
      kind: "money",
      value: plan.availableAtNeedDate,
    });
    expect(rows.get(L.rowNewPayment)).toEqual({
      kind: "money",
      value: plan.newPaymentAtNeedDate,
    });
  });

  it("lists only the segments that are actually drawn", () => {
    // No matured cycle here, so no legend entry for one.
    expect(model.legend.map((entry) => entry.key)).toEqual([
      "early",
      "termRate",
      "future",
    ]);
  });
});

describe("no term is being broken", () => {
  it("draws a single bar on the maturity date", () => {
    const plan = planDeposit({
      ...BASE,
      needDate: { year: 2026, month: 7, day: 31 },
    })!;
    const model = depositChartModel(plan, L);
    expect(model.bars).toHaveLength(1);
    expect(model.summary).toContain(L.noBreakNote);
    expect(model.summary).toContain("181 ngày");
  });

  it("draws a single bar after maturity, and says nothing accrued since", () => {
    const plan = planDeposit({
      ...BASE,
      needDate: { year: 2026, month: 10, day: 31 },
    })!;
    const model = depositChartModel(plan, L);
    expect(model.bars).toHaveLength(1);
    expect(model.bars[0].total).toBeCloseTo(14_876_712.328767123, 2);
    expect(model.summary).toContain(L.noBreakNote);
  });
});

describe("renewal", () => {
  it("shows the matured cycle as its own band, counted once", () => {
    const plan = planDeposit({
      ...BASE,
      renew: true,
      needDate: { year: 2026, month: 10, day: 31 },
    })!;
    const model = depositChartModel(plan, L);
    const bands = model.bars[0].segments;
    expect(bands.map((s) => s.key)).toEqual(["matured", "early"]);
    expect(bands[0].value).toBeCloseTo(14_876_712.328767123, 2);
    expect(bands[1].value).toBeCloseTo(259_554.28785888533, 2);
    expect(model.bars[0].total).toBeCloseTo(15_136_266.616626007, 2);
    // The matured band repeats in every bar, so the steps between bars stay
    // the two causes and nothing else.
    for (const bar of model.bars) {
      expect(bar.segments[0].key).toBe("matured");
    }
  });
});

describe("three horizons, never mixed", () => {
  /** 31/1/2026 + 6 months, renewed, needed on the second maturity. */
  const exact = planDeposit({
    ...BASE,
    renew: true,
    needDate: { year: 2027, month: 1, day: 31 },
  })!;

  it("attributes the CURRENT term's days and the plan's total separately", () => {
    // The defect: the summary read the FIRST term's 181 days beside interest
    // earned across both terms.
    const model = depositChartModel(exact, L);
    expect(model.summary).toContain("31/1/2027");
    expect(model.summary).toContain("kỳ này 184 ngày");
    expect(model.summary).toContain("365 ngày qua 2 kỳ");
    expect(model.summary).not.toContain("181");
  });

  it("names the first and the current term as different rows", () => {
    const model = depositChartModel(exact, L);
    const rows = new Map(
      model.table.rows.map((row) => [row[0] as string, row[1]]),
    );
    expect(rows.get(L.rowDepositDate)).toBe("31/1/2026");
    expect(rows.get(L.rowFirstMaturity)).toBe("31/7/2026");
    expect(rows.get(L.rowCurrentStart)).toBe("31/7/2026");
    expect(rows.get(L.rowCurrentMaturity)).toBe("31/1/2027");
    expect(rows.get(L.rowTerms)).toEqual({ kind: "count", value: 2 });
    expect(rows.get(L.rowCurrentTermDays)).toEqual({ kind: "count", value: 184 });
    expect(rows.get(L.rowTotalDays)).toEqual({ kind: "count", value: 365 });
  });

  it("does not repeat the current-term rows for a single term", () => {
    const single = planDeposit({
      ...BASE,
      needDate: { year: 2026, month: 7, day: 31 },
    })!;
    const labels = depositChartModel(single, L).table.rows.map(
      (row) => row[0] as string,
    );
    expect(labels).toContain(L.rowFirstMaturity);
    expect(labels).not.toContain(L.rowCurrentStart);
  });
});

describe("the timeline", () => {
  it("orders the deposit, the needed date and the maturity", () => {
    const plan = planDeposit(BASE)!;
    const model = depositTimelineModel(plan, TIMELINE);
    expect(model.milestones.map((m) => m.key)).toEqual([
      "deposit",
      "need",
      "firstMaturity",
    ]);
    expect(model.spanDays).toBe(181);
    expect(model.milestones[1].dayFromStart).toBe(89);
    expect(model.milestones[1].at).toBeCloseTo(89 / 181, 10);
    expect(model.milestones[1].emphasis).toBe(true);
    expect(model.milestones[1].dayOffsetLabel).toBe("sau 89 ngày");
    expect(model.summary).toContain("còn 92 ngày");
  });

  it("collapses the needed date and a maturity onto one point", () => {
    const plan = planDeposit({
      ...BASE,
      needDate: { year: 2026, month: 7, day: 31 },
    })!;
    const model = depositTimelineModel(plan, TIMELINE);
    // Two events on one day is one marker, and the needed date wins the tie.
    expect(model.milestones).toHaveLength(2);
    expect(model.milestones[1].key).toBe("need");
    expect(model.milestones[1].at).toBe(1);
    expect(model.summary).toBe(TIMELINE.summaryAt.replace("{maturity}", "31/7/2026"));
  });

  it("shows the renewed term's own start and maturity", () => {
    const plan = planDeposit({
      ...BASE,
      renew: true,
      needDate: { year: 2026, month: 10, day: 31 },
    })!;
    const model = depositTimelineModel(plan, TIMELINE);
    const keys = model.milestones.map((m) => m.key);
    expect(keys).toContain("currentMaturity");
    expect(keys[keys.length - 1]).toBe("currentMaturity");
    // 273 days in, 365 to the pending maturity.
    const need = model.milestones.find((m) => m.key === "need")!;
    expect(need.dayFromStart).toBe(273);
    expect(model.spanDays).toBe(365);
    expect(need.at).toBeCloseTo(273 / 365, 10);
  });

  it("places a RENEWED exact maturity at 0/181/365, with no duplicate", () => {
    // The defect: the current term's start was derived as "days elapsed minus
    // days into the broken term", and at a maturity there is no broken term —
    // so the needed date was treated as the current term's START and its
    // maturity was pushed 184 days past it, listing 31/1/2027 twice at 365
    // and 549 days. Offsets come from the stored dates now.
    const plan = planDeposit({
      ...BASE,
      renew: true,
      needDate: { year: 2027, month: 1, day: 31 },
    })!;
    const model = depositTimelineModel(plan, TIMELINE);
    expect(model.milestones.map((m) => m.dayFromStart)).toEqual([0, 181, 365]);
    expect(model.spanDays).toBe(365);
    // One marker on the needed date, which IS the current maturity.
    expect(model.milestones[2].key).toBe("need");
    expect(model.milestones[2].date).toEqual({
      year: 2027,
      month: 1,
      day: 31,
    });
    expect(model.milestones.filter((m) => m.dayFromStart === 549)).toHaveLength(
      0,
    );
  });

  it("says how long the money has been waiting after maturity", () => {
    const plan = planDeposit({
      ...BASE,
      needDate: { year: 2026, month: 10, day: 31 },
    })!;
    const model = depositTimelineModel(plan, TIMELINE);
    // 31/7/2026 to 31/10/2026 is 92 days of waiting.
    expect(model.summary).toContain("92 ngày");
    expect(model.milestones[model.milestones.length - 1].key).toBe("need");
  });

  it("draws nothing for a horizon that was never reached", () => {
    const far = planDeposit({
      ...BASE,
      termMonths: 1,
      renew: true,
      needDate: { year: 2076, month: 1, day: 31 },
    })!;
    const model = depositTimelineModel(far, TIMELINE);
    expect(model.unavailable).toBe(TIMELINE.unavailableReason);
    expect(model.milestones).toHaveLength(0);
    expect(depositTimelineModel(null, TIMELINE).milestones).toHaveLength(0);
  });
});

describe("nothing to draw", () => {
  it("explains itself for a null plan", () => {
    const model = depositChartModel(null, L);
    expect(model.unavailable?.reason).toBe(L.unavailableReason);
    expect(model.bars).toHaveLength(0);
    expect(model.table.rows).toHaveLength(0);
  });

  it("explains itself for a horizon past the supported cycles", () => {
    const plan = planDeposit({
      ...BASE,
      termMonths: 1,
      renew: true,
      needDate: { year: 2076, month: 1, day: 31 },
    })!;
    expect(plan.status).toBe("beyondLimit");
    const model = depositChartModel(plan, L);
    expect(model.unavailable).not.toBeNull();
    expect(model.bars).toHaveLength(0);
  });
});
