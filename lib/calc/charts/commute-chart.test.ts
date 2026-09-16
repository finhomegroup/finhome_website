import { describe, expect, it } from "vitest";
import { compareCommutes, type CommuteCompareInput } from "@/lib/calc/commute-compare";
import { commuteChartModel } from "./commute-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Chi phí nhiên liệu đi làm mỗi tháng, theo hai nơi ở",
  axis: "Chi phí mỗi tháng ({unit})",
  assumptions: ["Khoảng cách do bạn nhập."],
  tableCaption: "Hai nơi ở",
  itemColumn: "Nơi ở",
  amountColumn: "Mỗi tháng",
  tableHint: "Hai cột cuối là hai cơ sở khác nhau.",
  unavailableReason: "Chưa đủ dữ liệu.",
  unavailableRecovery: "Hãy nhập số ngày đi làm mỗi tháng.",
  fuelSegment: "Tiền nhiên liệu",
  barFormat: "{name} — {km} km một chiều",
  summary:
    "{cheap} rẻ hơn {costly} khoảng {difference} tiền nhiên liệu mỗi tháng.",
  summaryEqual: "Hai nơi ở tốn như nhau: {cost} mỗi tháng.",
  perPersonNote: "Nếu chia đều, mỗi người chênh {difference}.",
  basisFormat:
    "Cơ sở: {direction}, {days} ngày mỗi tháng, {litres} lít/100 km, giá {price} mỗi lít.",
  directionOneWay: "tính một chiều mỗi ngày",
  directionRoundTrip: "tính khứ hồi mỗi ngày",
  fuelOnlyNote: "Đây là tiền nhiên liệu, không phải toàn bộ chi phí đi lại.",
  manualEntryNote: "Khoảng cách do bạn tự nhập; công cụ không đọc vị trí.",
  zeroDaysNote: "Bạn đang nhập 0 ngày đi làm, nên chi phí bằng 0.",
  distanceColumn: "Một chiều (km)",
  monthlyKmColumn: "Km mỗi tháng",
  householdColumn: "Cả xe",
  perPersonColumn: "Mỗi người",
  differenceRow: "Chênh lệch",
};

const NAMES = { near: "Nhà A", far: "Nhà B" };

const BASE: CommuteCompareInput = {
  legs: [
    { key: "near", oneWayKm: 8 },
    { key: "far", oneWayKm: 25 },
  ],
  roundTrip: true,
  workdaysPerMonth: 22,
  consumption: 7,
  consumptionUnit: "litresPer100km",
  pricePerLitre: 25_000,
};

describe("commuteChartModel on the handoff fixture", () => {
  const result = compareCommutes(BASE)!;
  const model = commuteChartModel(result, NAMES, LABELS);

  it("draws exactly two bars, one per candidate home", () => {
    expect(model.bars.map((bar) => bar.key)).toEqual(["near", "far"]);
  });

  it("gives each bar one segment: the month's fuel", () => {
    // One cost per home is the whole quantity; a decorative breakdown would
    // imply a split the model does not have.
    for (const bar of model.bars) {
      expect(bar.segments.map((s) => s.key)).toEqual(["fuel"]);
    }
  });

  it("draws the HOUSEHOLD figures, matching the engine", () => {
    expect(model.bars[0].total).toBeCloseTo(616_000, 6);
    expect(model.bars[1].total).toBeCloseTo(1_925_000, 6);
  });

  it("names each home with the distance it was priced from", () => {
    expect(model.bars[0].label).toBe("Nhà A — 8 km một chiều");
    expect(model.bars[1].label).toBe("Nhà B — 25 km một chiều");
  });

  it("emphasises the costlier home and only that one", () => {
    expect(model.bars[0].emphasis).toBe(false);
    expect(model.bars[1].emphasis).toBe(true);
  });

  it("states the difference in the summary, on the household basis", () => {
    expect(model.summary).toContain("Nhà A rẻ hơn Nhà B");
    expect(model.summary).toContain("1,3 triệu");
  });

  it("always says fuel is not the whole cost of commuting", () => {
    expect(model.summary).toContain(LABELS.fuelOnlyNote);
  });

  it("always says the distances were typed in, not located", () => {
    expect(model.summary).toContain(LABELS.manualEntryNote);
  });

  it("omits the per-person sentence for a single commuter", () => {
    expect(model.summary).not.toContain("mỗi người chênh");
  });

  // The defect an independent review reproduced: both states label the two
  // distances "một chiều", and switching the trip selector doubles every
  // figure on the model, so the summary has to name which reading it used.
  it("states the trip direction the bars were priced on", () => {
    expect(model.summary).toContain("tính khứ hồi mỗi ngày");
    expect(model.summary).not.toContain("tính một chiều mỗi ngày");
  });

  it("states the workdays, the consumption and the price with it", () => {
    expect(model.summary).toContain("22 ngày mỗi tháng");
    expect(model.summary).toContain("7,0 lít/100 km");
    expect(model.summary).toContain("25.000 ₫ mỗi lít");
  });

  it("names the OTHER direction when the one-way reading is selected", () => {
    const oneWay = commuteChartModel(
      compareCommutes({ ...BASE, roundTrip: false })!,
      NAMES,
      LABELS,
    );
    expect(oneWay.summary).toContain("tính một chiều mỗi ngày");
    expect(oneWay.summary).not.toContain("tính khứ hồi mỗi ngày");
    // And the figures really do differ by the factor the sentence explains.
    expect(oneWay.bars[0].total).toBeCloseTo(308_000, 6);
    expect(model.bars[0].total).toBeCloseTo(616_000, 6);
  });

  it("tabulates both bases in separate columns, with a reading hint", () => {
    expect(model.table.columns.map((c) => c.label)).toEqual([
      LABELS.itemColumn,
      LABELS.distanceColumn,
      LABELS.monthlyKmColumn,
      LABELS.householdColumn,
      LABELS.perPersonColumn,
    ]);
    expect(model.table.hint).toBe(LABELS.tableHint);
    // Five columns do not read at 390 px even compacted — docs §3.
    expect(model.table.mobileCards).toBe(true);
  });

  it("ends the table with the difference on both bases", () => {
    expect(model.table.rows.at(-1)).toEqual([
      LABELS.differenceRow,
      "",
      { kind: "count", value: 748 },
      { kind: "money", value: 1_309_000 },
      { kind: "money", value: 1_309_000 },
    ]);
  });

  it("carries raw typed cells, never formatted strings, for the amounts", () => {
    const nearRow = model.table.rows[0];
    // RAW and UNROUNDED, which is the whole point: 352/100 × 7 × 25.000 is
    // 616.000,0000000001 in float, and the table rounds for DISPLAY only. A
    // pre-formatted "616.000 ₫" string could not be rescaled to triệu without
    // parsing localized text back into a number.
    expect(nearRow[3]).toMatchObject({ kind: "money" });
    expect((nearRow[3] as { value: number }).value).toBeCloseTo(616_000, 6);
    // The distance is a COUNT: dividing 8 km by a million would be the mirror
    // image of the 1000× defect class.
    expect(nearRow[1]).toEqual({ kind: "count", value: 8 });
  });
});

describe("commuteChartModel with a shared vehicle", () => {
  const model = commuteChartModel(
    compareCommutes({ ...BASE, people: 2 })!,
    NAMES,
    LABELS,
  );

  it("keeps the BARS on the household basis", () => {
    // Drawing both bases in one plot is how a reader compares one home's
    // per-person cost against the other's household total.
    expect(model.bars[0].total).toBeCloseTo(616_000, 6);
    expect(model.bars[1].total).toBeCloseTo(1_925_000, 6);
  });

  it("adds the per-person difference as a sentence, not a third bar", () => {
    expect(model.summary).toContain("mỗi người chênh 654.500 ₫");
    expect(model.bars).toHaveLength(2);
  });

  it("splits both columns of the difference row", () => {
    expect(model.table.rows.at(-1)).toEqual([
      LABELS.differenceRow,
      "",
      { kind: "count", value: 748 },
      { kind: "money", value: 1_309_000 },
      { kind: "money", value: 654_500 },
    ]);
  });
});

describe("commuteChartModel edge states", () => {
  it("has nothing to draw without a result", () => {
    const model = commuteChartModel(null, NAMES, LABELS);
    expect(model.bars).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: LABELS.unavailableReason,
      recovery: LABELS.unavailableRecovery,
    });
  });

  it("emphasises neither home when the two cost the same", () => {
    const equal = compareCommutes({
      ...BASE,
      legs: [
        { key: "near", oneWayKm: 10 },
        { key: "far", oneWayKm: 10 },
      ],
    })!;
    const model = commuteChartModel(equal, NAMES, LABELS);
    expect(model.bars.every((bar) => bar.emphasis === false)).toBe(true);
    expect(model.summary).toContain("tốn như nhau");
    expect(model.summary).not.toContain("rẻ hơn");
  });

  it("says why everything is zero when no commuting days were entered", () => {
    const none = compareCommutes({ ...BASE, workdaysPerMonth: 0 })!;
    const model = commuteChartModel(none, NAMES, LABELS);
    expect(model.summary).toContain(LABELS.zeroDaysNote);
    // Zero-cost bars have no segment, so there is nothing to draw — and the
    // sentence is what carries the answer.
    expect(model.bars.every((bar) => bar.total === 0)).toBe(true);
  });

  it("still names the distances on a zero-cost month", () => {
    const none = compareCommutes({ ...BASE, workdaysPerMonth: 0 })!;
    const model = commuteChartModel(none, NAMES, LABELS);
    expect(model.bars[1].label).toBe("Nhà B — 25 km một chiều");
  });

  it("falls back to the key when a home has no name", () => {
    const model = commuteChartModel(compareCommutes(BASE)!, {}, LABELS);
    expect(model.bars[0].label).toBe("near — 8 km một chiều");
  });
});
