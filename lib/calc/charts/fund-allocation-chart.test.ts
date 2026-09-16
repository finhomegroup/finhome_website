import { describe, expect, it } from "vitest";
import { allocateFunds, type FundAllocationInput } from "@/lib/calc/fund-allocation";
import { fundAllocationModel } from "./fund-allocation-chart";

const LABELS = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Một khoản tiền, chia theo mục đích và thời điểm cần dùng",
  axis: "Số tiền ({unit})",
  assumptions: ["Số liệu do bạn nhập."],
  tableCaption: "Từng mục đích",
  itemColumn: "Mục đích",
  amountColumn: "Số tiền",
  tableHint: "Cột “muốn dành” là mong muốn, không phải tiền đang có.",
  unavailableReason: "Chưa có khoản tiền nào để chia.",
  unavailableRecovery: "Hãy nhập số tiền hiện có.",
  potBar: "Khoản tiền hiện có",
  reserveSegment: "Quỹ dự phòng (giữ nguyên)",
  unallocatedSegment: "Chưa phân bổ",
  purposeWithTime: "{name} — cần sau {months} tháng",
  purposeWithoutTime: "{name} — chưa rõ thời điểm",
  summaryFunded:
    "Đã phân bổ {allocated}; còn {unallocated} chưa có mục đích.",
  summaryShort:
    "Chỉ phân bổ được {allocated} trong {requested} bạn muốn dành: thiếu {shortfall}.",
  timeUnknownNote: "Có mục đích chưa ghi thời điểm cần dùng.",
  orderNote: "Thứ tự cấp tiền cố định không theo thời điểm cần tiền sớm nhất.",
  anchorNote: "Các mốc đếm từ ngày {date}.",
  noProductNote: "Công cụ không gợi ý nên gửi hay đầu tư khoản nào vào đâu.",
  monthsColumn: "Cần sau (tháng)",
  requestedColumn: "Muốn dành",
  allocatedColumn: "Phân bổ được",
  shortfallColumn: "Thiếu",
  reserveRow: "Quỹ dự phòng",
  unallocatedRow: "Chưa phân bổ",
  totalRow: "Tổng",
  noMonths: "Chưa rõ",
};

const NAMES = { home: "Tiền mua nhà", other: "Mục tiêu khác" };

const BASE: FundAllocationInput = {
  available: 1_000_000_000,
  reserve: 150_000_000,
  purposes: [
    { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
    { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
  ],
};

describe("fundAllocationModel on the handoff fixture", () => {
  const model = fundAllocationModel(allocateFunds(BASE)!, NAMES, LABELS);

  it("draws ONE bar, because there is one pot", () => {
    expect(model.bars).toHaveLength(1);
    expect(model.bars[0].key).toBe("pot");
  });

  it("splits it into the reserve, both purposes and the unallocated rest", () => {
    expect(model.bars[0].segments.map((s) => s.key)).toEqual([
      "reserve",
      "home",
      "other",
      "unallocated",
    ]);
  });

  it("totals the pot exactly — no shortfall is drawn into it", () => {
    expect(model.bars[0].total).toBe(1_000_000_000);
  });

  it("omits the anchor sentence when the page declared no anchor", () => {
    // A month count without an anchor is still usable; inventing a date for
    // it is not allowed, and neither is claiming an anchor that was not given.
    expect(model.summary).not.toContain("đếm từ ngày");
  });

  it("states the declared anchor when the page supplies one", () => {
    const anchored = fundAllocationModel(
      allocateFunds(BASE)!,
      NAMES,
      LABELS,
      "15/9/2026",
    );
    expect(anchored.summary).toContain("Các mốc đếm từ ngày 15/9/2026.");
  });

  it("names the need time in each purpose's own label", () => {
    const labels = model.bars[0].segments.map((s) => s.label);
    expect(labels).toContain("Tiền mua nhà — cần sau 12 tháng");
    expect(labels).toContain("Mục tiêu khác — cần sau 24 tháng");
  });

  it("states the unallocated money as its own quantity, exactly", () => {
    expect(model.summary).toContain("còn 50.000.000 ₫ chưa có mục đích");
  });

  it("always says it does not recommend where to put the money", () => {
    expect(model.summary).toContain(LABELS.noProductNote);
  });

  it("adds no note about unknown times or ordering when neither applies", () => {
    expect(model.summary).not.toContain(LABELS.timeUnknownNote);
    expect(model.summary).not.toContain(LABELS.orderNote);
  });

  it("tabulates requested beside allocated, so the two cannot be confused", () => {
    expect(model.table.columns.map((c) => c.label)).toEqual([
      LABELS.itemColumn,
      LABELS.monthsColumn,
      LABELS.requestedColumn,
      LABELS.allocatedColumn,
      LABELS.shortfallColumn,
    ]);
    expect(model.table.rows[1]).toEqual([
      "Tiền mua nhà",
      { kind: "count", value: 12 },
      { kind: "money", value: 650_000_000 },
      { kind: "money", value: 650_000_000 },
      { kind: "money", value: 0 },
    ]);
    expect(model.table.mobileCards).toBe(true);
  });

  it("ends on a total row carrying requested, allocated and shortfall", () => {
    expect(model.table.rows.at(-1)).toEqual([
      LABELS.totalRow,
      "",
      { kind: "money", value: 950_000_000 },
      { kind: "money", value: 950_000_000 },
      { kind: "money", value: 0 },
    ]);
  });
});

describe("fundAllocationModel when the requests exceed the pot", () => {
  const short = allocateFunds({
    ...BASE,
    purposes: [
      { key: "home", requested: 750_000_000, monthsUntilNeeded: 12 },
      { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
    ],
  })!;
  const model = fundAllocationModel(short, NAMES, LABELS);

  it("does NOT draw the shortfall as a segment", () => {
    // Drawing money that does not exist would make the pot look bigger than
    // it is — the exact misreading the row warns about.
    expect(model.bars[0].total).toBe(1_000_000_000);
    expect(model.bars[0].segments.map((s) => s.key)).not.toContain("shortfall");
    expect(model.bars[0].segments.map((s) => s.key)).not.toContain(
      "unallocated",
    );
  });

  it("says what was requested and what is missing, and the three agree", () => {
    // Compacted to one decimal in tỷ these read "1,0 tỷ trong 1,1 tỷ … thiếu
    // 50,0 triệu", whose rounded gap (100 triệu) contradicts the stated
    // shortfall. A sentence whose content IS a difference cannot round.
    expect(model.summary).toContain("1.000.000.000 ₫");
    expect(model.summary).toContain("1.050.000.000 ₫");
    expect(model.summary).toContain("thiếu 50.000.000 ₫");
    expect(1_050_000_000 - 1_000_000_000).toBe(50_000_000);
  });

  it("puts the shortfall in the table, where a figure need not be drawn", () => {
    expect(model.table.rows[2]).toEqual([
      "Mục tiêu khác",
      { kind: "count", value: 24 },
      { kind: "money", value: 150_000_000 },
      { kind: "money", value: 100_000_000 },
      { kind: "money", value: 50_000_000 },
    ]);
    expect(model.table.rows.at(-1)).toEqual([
      LABELS.totalRow,
      "",
      { kind: "money", value: 1_050_000_000 },
      { kind: "money", value: 1_000_000_000 },
      { kind: "money", value: 50_000_000 },
    ]);
  });
});

describe("fundAllocationModel — the two disclosures", () => {
  it("says when a purpose has no stated month", () => {
    const model = fundAllocationModel(
      allocateFunds({
        ...BASE,
        purposes: [
          { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
          { key: "other", requested: 150_000_000, monthsUntilNeeded: null },
        ],
      })!,
      NAMES,
      LABELS,
    );
    expect(model.summary).toContain(LABELS.timeUnknownNote);
    expect(model.bars[0].segments.map((s) => s.label)).toContain(
      "Mục tiêu khác — chưa rõ thời điểm",
    );
    expect(model.table.rows[2][1]).toBe(LABELS.noMonths);
  });

  it("says when the listed order is not soonest-first", () => {
    const model = fundAllocationModel(
      allocateFunds({
        ...BASE,
        purposes: [
          { key: "other", requested: 150_000_000, monthsUntilNeeded: 24 },
          { key: "home", requested: 650_000_000, monthsUntilNeeded: 12 },
        ],
      })!,
      NAMES,
      LABELS,
    );
    // A statement of fact about the reader's ordering, not a suggestion.
    expect(model.summary).toContain(LABELS.orderNote);
  });
});

describe("fundAllocationModel edge states", () => {
  it("has nothing to draw without a result", () => {
    const model = fundAllocationModel(null, NAMES, LABELS);
    expect(model.bars).toEqual([]);
    expect(model.unavailable).toEqual({
      reason: LABELS.unavailableReason,
      recovery: LABELS.unavailableRecovery,
    });
  });

  it("has nothing to draw for an empty pot", () => {
    const empty = allocateFunds({ ...BASE, available: 0 })!;
    expect(fundAllocationModel(empty, NAMES, LABELS).unavailable).not.toBeNull();
  });

  it("draws an all-unallocated pot when nothing has a purpose yet", () => {
    const model = fundAllocationModel(
      allocateFunds({ available: 1_000_000_000, reserve: 0, purposes: [] })!,
      NAMES,
      LABELS,
    );
    expect(model.bars[0].segments.map((s) => s.key)).toEqual(["unallocated"]);
    expect(model.bars[0].total).toBe(1_000_000_000);
  });

  it("falls back to the key when a purpose has no name", () => {
    const model = fundAllocationModel(allocateFunds(BASE)!, {}, LABELS);
    expect(model.bars[0].segments.map((s) => s.label)).toContain(
      "home — cần sau 12 tháng",
    );
  });
});
