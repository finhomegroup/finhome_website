// Original row 26, against the audit's independent fixture and oracle.
//
// 2 tỷ initial, 15 triệu first-year monthly withdrawal, 8% effective annual
// return, 4% annual withdrawal increase. The audit's closed form, computed
// with no production import: G = 1,08, H = 1,04, g = G^(1/12),
// A(q) = (g^q − 1)/(g − 1); at a completed year y,
// P_y = 2bn × G^y − 15m × A(12) × (G^y − H^y)/(G − H); at month 12y + q,
// P = P_y × g^q − 15m × H^y × A(q).
import { describe, expect, it } from "vitest";
import { computeWithdrawal } from "@/lib/calc/withdrawal";
import { withdrawalChartModel } from "./withdrawal-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Số dư và sức mua theo thời gian",
  series: "{label}",
  xAxis: "Tháng",
  yAxis: "Số tiền ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Tại các mốc",
  tableHint: "Hai cột là hai cách đếm cùng một khoản tiền.",
  periodColumn: "Tháng",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy nhập số dư lớn hơn 0.",
  nominalPath: "Số dư danh nghĩa",
  realPath: "Sức mua theo giá hôm nay",
  ranOutMarker: "Hết tiền ở tháng {month}",
  survivedMarker: "Vẫn còn ở tháng {month}",
  summaryRanOut:
    "Khoản này chi trả được {months} tháng (khoảng {years} năm); tổng đã rút {nominal}, mức rút năm cuối {real}.",
  summarySurvived:
    "Sau {months} tháng vẫn còn {nominal}, tương đương {real} theo giá hôm nay.",
  indexNote: "Sức mua quy về giá hôm nay theo chỉ số trơn.",
  partialNote:
    "Chỉ {full} lần rút được trả đủ: lần cuối cần {planned} nhưng chỉ còn {paid}, thiếu {short}.",
  noInflationNote: "Lạm phát bằng 0 nên hai đường trùng nhau.",
  itemColumn: "Khoản",
  amountColumn: "Số tiền",
  monthRow: "Tháng",
  nominalRow: "Số dư danh nghĩa",
  realRow: "Sức mua",
};

const INPUT = {
  balance: 2_000_000_000,
  monthlyWithdrawal: 15_000_000,
  annualReturnPercent: 8,
  inflationPercent: 4,
};

describe("the engine matches the audit's closed form", () => {
  const r = computeWithdrawal(INPUT)!;
  const at = (month: number) => r.series.find((p) => p.month === month)!;

  it("opens at the balance, with purchasing power equal to it", () => {
    expect(at(0)).toEqual({
      month: 0,
      balance: 2_000_000_000,
      realBalance: 2_000_000_000,
    });
  });

  it("hits the oracle's nominal balances", () => {
    expect(at(12).balance).toBeCloseTo(1_973_491_702.7922714, 3);
    expect(at(60).balance).toBeCloseTo(1_760_505_740.499754, 3);
    expect(at(120).balance).toBeCloseTo(1_153_360_394.3216896, 3);
  });

  it("hits the oracle's purchasing power under the declared index", () => {
    expect(at(12).realBalance).toBeCloseTo(1_897_588_175.7617993, 3);
    expect(at(60).realBalance).toBeCloseTo(1_447_007_389.7221928, 3);
    expect(at(120).realBalance).toBeCloseTo(779_168_956.1465276, 3);
  });

  it("shows purchasing power falling faster than the balance", () => {
    // The lesson of the row: nominal health and spending power diverge.
    expect(at(120).realBalance).toBeLessThan(at(120).balance);
    expect(at(120).balance / 2_000_000_000).toBeGreaterThan(0.5);
    expect(at(120).realBalance / 2_000_000_000).toBeLessThan(0.4);
  });

  it("reports the partial last withdrawal, not just the month count", () => {
    expect(r.monthsLasted).toBe(179);
    // 178 were paid in full; the 179th was short.
    expect(r.fullWithdrawals).toBe(178);
    expect(r.lastWithdrawalPlanned!).toBeCloseTo(25_975_146.714042064, 3);
    expect(r.lastWithdrawalPaid!).toBeCloseTo(2_813_709.0952665554, 3);
    expect(r.lastWithdrawalShortfall!).toBeCloseTo(23_161_437.61877551, 3);
    // And the month before is the audit's figure.
    expect(
      r.series.find((p) => p.month === 178)!.balance,
    ).toBeCloseTo(2_795_721.339985907, 3);
  });

  it("keeps the perpetual figure as the conservative monthly-real one", () => {
    // Not the exact ceiling for the annual-step schedule (6.434.030,11); the
    // module documents the difference rather than claiming a maximum.
    expect(r.perpetualMonthlyWithdrawal!).toBeCloseTo(6_299_956.238245752, 4);
    expect(r.perpetualMonthlyWithdrawal!).toBeLessThan(6_434_030.110003466);
  });
});

describe("the figure reads both lines and the end of the money", () => {
  const model = withdrawalChartModel(computeWithdrawal(INPUT)!, LABELS);

  it("draws the balance and its purchasing power", () => {
    expect(model.series.map((s) => s.key)).toEqual(["nominal", "real"]);
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.unavailable).toBeNull();
  });

  it("marks the month the money runs out", () => {
    expect(model.markers).toEqual([
      { period: 179, label: "Hết tiền ở tháng 179" },
    ]);
    expect(model.xMax).toBe(179);
  });

  it("says 178 full withdrawals, not 179", () => {
    expect(model.summary).toContain("Chỉ 178 lần rút được trả đủ");
    expect(model.summary).toContain("thiếu 23.161.438 ₫");
  });

  it("declares the purchasing-power index convention", () => {
    expect(model.summary).toContain(LABELS.indexNote);
  });

  it("tabulates the checkpoints in raw money", () => {
    const months = model.table.rows.map((row) => row[0]);
    expect(months).toEqual(["0", "12", "60", "120", "179"]);
    const row120 = model.table.rows.find((row) => row[0] === "120")!;
    expect((row120[1] as { value: number }).value).toBeCloseTo(
      1_153_360_394.3216896,
      3,
    );
    expect((row120[2] as { value: number }).value).toBeCloseTo(
      779_168_956.1465276,
      3,
    );
  });
});

describe("the other states", () => {
  it("says the lines coincide when inflation is zero", () => {
    const flat = computeWithdrawal({ ...INPUT, inflationPercent: 0 })!;
    const model = withdrawalChartModel(flat, LABELS);
    expect(model.summary).toContain(LABELS.noInflationNote);
  });

  it("marks the cap instead of an end when the money never runs out", () => {
    const rich = computeWithdrawal({
      ...INPUT,
      monthlyWithdrawal: 1_000_000,
    })!;
    expect(rich.monthsLasted).toBeNull();
    expect(rich.fullWithdrawals).toBeNull();
    const model = withdrawalChartModel(rich, LABELS);
    expect(model.markers[0].label).toContain("Vẫn còn ở tháng 1200");
    expect(model.summary).toContain("vẫn còn");
    // No partial-payment sentence, because nothing was short.
    expect(model.summary).not.toContain("lần rút được trả đủ");
  });

  it("withholds the plot with no result", () => {
    const model = withdrawalChartModel(null, LABELS);
    expect(model.series).toEqual([]);
    expect(model.unavailable).not.toBeNull();
  });
});
