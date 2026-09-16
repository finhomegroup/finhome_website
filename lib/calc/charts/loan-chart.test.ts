import { describe, it, expect } from "vitest";
import {
  loanChartModel,
  FIRST_MONTHS_WINDOW,
  type LoanChartLabels,
} from "@/lib/calc/charts/loan-chart";
import { computeLoan, yearlySummary } from "@/lib/calc/loan";

/**
 * Label fixture. Deliberately not the shipped Vietnamese copy: these tests are
 * about the model's arithmetic and structure, and pinning them to the copy
 * would make every wording change a red test. The shipped strings are checked
 * where they belong — in the content file's own test, against the page's
 * defaults.
 */
const L: LoanChartLabels = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "T",
  interest: "Lãi",
  principal: "Gốc",
  balance: "Dư nợ",
  yearTick: "Năm {n}",
  monthTick: "Tháng {n}",
  xAxisYear: "Năm",
  xAxisMonth: "Tháng",
  yAxis: "Tiền ({unit})",
  overlayAxis: "Dư nợ ({unit})",
  summaryYear: "{periods} năm, lãi {interest}, gốc {principal}.",
  summaryMonths: "{window} tháng đầu, lãi {interest}, gốc {principal}.",
  extraNote: "Đã tính khoản trả thêm.",
  methodAnnuity: "Trả góp đều.",
  methodFlatPrincipal: "Trả gốc đều.",
  assumptions: ["Lãi suất không đổi."],
  tableCaption: "Bảng",
  periodColumn: "Kỳ",
  unavailableReason: "Chưa tính được.",
  unavailableRecovery: "Kiểm tra lại số đã nhập.",
};

const result = computeLoan({
  amount: 2_000_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
});
if (result === null) throw new Error("fixture loan did not compute");

describe("loanChartModel — yearly", () => {
  const model = loanChartModel(result, "year", L);

  it("draws one column per year of the schedule", () => {
    expect(model.columns).toHaveLength(20);
    expect(model.columns[0].label).toBe("Năm 1");
    expect(model.columns[19].label).toBe("Năm 20");
  });

  it("takes every figure from the schedule the headline came from", () => {
    // The rule the whole chart layer exists to keep: no second financial
    // model. Asserted against `yearlySummary` of the same result, which is
    // also what the page's existing table renders.
    const years = yearlySummary(result.schedule);
    for (const [index, column] of model.columns.entries()) {
      expect(column.segments[0].value).toBeCloseTo(years[index].interest, 6);
      expect(column.segments[1].value).toBeCloseTo(years[index].principal, 6);
      expect(model.overlay!.points[index].value).toBeCloseTo(
        years[index].balance,
        6,
      );
    }
  });

  it("makes the table the same numbers as the chart, cell for cell", () => {
    // Not a summary of the chart: the accessible alternative has to be the
    // chart. A mismatch here is the "chart and table disagree" defect.
    //
    // RAW numbers, not formatted strings. The table renders these at two
    // precisions, and it can only do that from the number — so this asserts
    // the cell IS the segment's own value, with no rounding in between.
    expect(model.table.rows).toHaveLength(model.columns.length);
    for (const [index, row] of model.table.rows.entries()) {
      const column = model.columns[index];
      expect(row[0]).toBe(column.label);
      expect(row[1]).toEqual({
        kind: "money",
        value: column.segments[0].value,
      });
      expect(row[2]).toEqual({
        kind: "money",
        value: column.segments[1].value,
      });
      expect(row[3]).toEqual({
        kind: "money",
        value: model.overlay!.points[index].value,
      });
    }
  });

  it("carries the raw đồng in the table, not a rounded display string", () => {
    // The defect this forecloses: formatting here and rescaling in the
    // component would mean parsing "168.472.992 ₫" back into a number, which
    // is the 1000x grammar trap in §4 of the suite doc.
    const first = model.table.rows[0][1];
    expect(typeof first).toBe("object");
    expect((first as { value: number }).value).not.toBe(
      Math.round((first as { value: number }).value),
    );
  });

  it("bounds the value axis above the tallest column", () => {
    const tallest = Math.max(...model.columns.map((c) => c.total));
    expect(model.yMax).toBeGreaterThanOrEqual(tallest);
    expect(model.yAxis.ticks).toHaveLength(5);
    expect(model.yAxis.ticks[0].at).toBe(0);
    expect(model.yAxis.ticks[4].at).toBe(1);
  });

  it("gives the balance its own axis, above the opening balance", () => {
    // One shared axis would flatten every column to nothing: the opening
    // balance is two orders of magnitude above any single year's payment.
    expect(model.overlayMax).toBeGreaterThanOrEqual(2_000_000_000);
    expect(model.overlayMax).toBeGreaterThan(model.yMax);
    expect(model.overlayAxis).not.toBeNull();
    expect(model.overlayAxis!.label).toContain("tỷ");
  });

  it("ends the balance line at zero", () => {
    const points = model.overlay!.points;
    expect(points[points.length - 1].value).toBe(0);
  });

  it("falls monotonically along the balance line", () => {
    const points = model.overlay!.points;
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].value).toBeLessThan(points[i - 1].value);
    }
  });

  it("names the repayment method in the summary", () => {
    // "Clear repayment method" is part of the chart contract: the same picture
    // means different things under the two structures.
    expect(model.summary).toContain("Trả góp đều.");
    expect(model.summary).toContain("20 năm");
  });

  it("distinguishes colour with an explicit legend and ordered segments", () => {
    expect(model.legend.map((l) => l.key)).toEqual(["interest", "principal"]);
    for (const column of model.columns) {
      expect(column.segments.map((s) => s.key)).toEqual([
        "interest",
        "principal",
      ]);
    }
  });

  it("carries its assumptions rather than leaving them to the page", () => {
    expect(model.assumptions.length).toBeGreaterThan(0);
    expect(model.unavailable).toBeNull();
  });
});

describe("loanChartModel — the opening months", () => {
  const model = loanChartModel(result, "firstMonths", L);

  it("caps the window and says so in the summary", () => {
    // A chart of 24 months that read as the whole loan would be the worst kind
    // of true picture.
    expect(model.columns).toHaveLength(FIRST_MONTHS_WINDOW);
    expect(model.summary).toContain("24 tháng đầu");
    expect(model.xAxis.label).toBe("Tháng");
  });

  it("uses the monthly rows, not a twelfth of a year", () => {
    for (const [index, column] of model.columns.entries()) {
      expect(column.segments[0].value).toBeCloseTo(
        result.schedule[index].interest,
        6,
      );
      expect(column.label).toBe(`Tháng ${index + 1}`);
    }
  });

  it("shows interest above principal in month one, on this loan", () => {
    // The educational point of the monthly view: at 8,5% over 240 months the
    // first payment is mostly interest. 2e9 × 8,5%/12 = 14.166.667 ₫ of the
    // 17.356.465 ₫ instalment.
    const first = model.columns[0];
    expect(first.segments[0].value).toBeGreaterThan(first.segments[1].value);
    expect(first.segments[0].value).toBeCloseTo(14_166_666.67, 1);
  });

  it("never draws more months than the schedule has", () => {
    const short = computeLoan({
      amount: 100_000_000,
      annualRatePercent: 8.5,
      termMonths: 6,
    });
    const shortModel = loanChartModel(short, "firstMonths", L);
    expect(shortModel.columns).toHaveLength(6);
    expect(shortModel.summary).toContain("6 tháng đầu");
  });
});

describe("loanChartModel — extra payments and methods", () => {
  it("says the extra payment is included, and shortens the chart", () => {
    const withExtra = computeLoan({
      amount: 2_000_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      extraPerMonth: 2_000_000,
    });
    const model = loanChartModel(withExtra, "year", L);
    // 187 months is 16 calendar years of columns, not 20.
    expect(model.columns).toHaveLength(16);
    expect(model.summary).toContain("Đã tính khoản trả thêm.");
  });

  it("reflects the flat-principal shape and names it", () => {
    const flat = computeLoan({
      amount: 2_000_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      method: "flatPrincipal",
    });
    const model = loanChartModel(flat, "year", L);
    expect(model.summary).toContain("Trả gốc đều.");
    // Under flat principal the yearly principal slice is constant and the
    // interest falls, so the first column is the tallest — the opposite of the
    // annuity's flat columns.
    const totals = model.columns.map((c) => c.total);
    for (let i = 1; i < totals.length; i += 1) {
      expect(totals[i]).toBeLessThan(totals[i - 1]);
    }
  });
});

/**
 * ORIGINAL ROW 6's window. `/cong-cu/phan-tich-khoan-vay/` lets a reader
 * examine an arbitrary month, and a chart permanently stuck on months 1–24
 * cannot answer a question about month 152. The mortgage page's two modes are
 * untouched — the tests above are the proof of that.
 */
describe("loanChartModel — an arbitrary monthly window", () => {
  const W: LoanChartLabels = {
    ...L,
    summaryWindow:
      "Tháng {from}–{to}, xem tháng {month}, lãi {interest}, gốc {principal}.",
  };

  it("opens the window at the examined month", () => {
    const model = loanChartModel(result, "window", W, { examineMonth: 152 });
    expect(model.columns).toHaveLength(FIRST_MONTHS_WINDOW);
    expect(model.columns[0].period).toBe(152);
    expect(model.columns[FIRST_MONTHS_WINDOW - 1].period).toBe(175);
    expect(model.columns[0].label).toBe("Tháng 152");
  });

  it("marks the examined column, and only that one", () => {
    const model = loanChartModel(result, "window", W, { examineMonth: 152 });
    expect(
      model.columns.filter((column) => column.emphasis === true).map((c) => c.period),
    ).toEqual([152]);
  });

  it("slides back from the end so the last months are reachable", () => {
    // Month 240 of a 240-month loan: the window cannot start there and still
    // hold 24 months, so it ends there instead — and the emphasis stays on
    // the month that was asked for.
    const model = loanChartModel(result, "window", W, { examineMonth: 240 });
    expect(model.columns).toHaveLength(FIRST_MONTHS_WINDOW);
    expect(model.columns[0].period).toBe(217);
    expect(model.columns[FIRST_MONTHS_WINDOW - 1].period).toBe(240);
    expect(
      model.columns.filter((column) => column.emphasis === true).map((c) => c.period),
    ).toEqual([240]);
  });

  it("takes every figure from the same schedule", () => {
    // No second financial model: asserted against the schedule rows directly.
    const model = loanChartModel(result, "window", W, { examineMonth: 100 });
    for (const [index, column] of model.columns.entries()) {
      const row = result.schedule[99 + index];
      expect(column.period).toBe(row.period);
      expect(column.segments[0].value).toBe(row.interest);
      expect(column.segments[1].value).toBe(row.principal);
      expect(model.overlay?.points[index]).toEqual({
        period: row.period,
        value: row.balance,
      });
      expect(model.table.rows[index][3]).toEqual({
        kind: "money",
        value: row.balance,
      });
    }
  });

  it("says WHICH months it is showing", () => {
    const model = loanChartModel(result, "window", W, { examineMonth: 152 });
    expect(model.summary).toContain("Tháng 152–175");
    expect(model.summary).toContain("xem tháng 152");
    expect(model.summary).toContain("Trả góp đều.");
    expect(model.summary).not.toContain("{");
  });

  it("falls back to the first months without a window label", () => {
    // A caller that asks for the mode without supplying the label gets the
    // length of the window stated, which is what `summaryMonths` says.
    const model = loanChartModel(result, "window", L, { examineMonth: 152 });
    expect(model.columns[0].period).toBe(152);
    expect(model.summary).toContain("24 tháng đầu");
    expect(model.summary).not.toContain("{");
  });

  it("starts at month 1 with no examined month, matching firstMonths", () => {
    const window = loanChartModel(result, "window", W);
    const first = loanChartModel(result, "firstMonths", W);
    expect(window.columns.map((c) => c.period)).toEqual(
      first.columns.map((c) => c.period),
    );
    expect(window.columns.every((column) => column.emphasis !== true)).toBe(true);
  });

  it("clamps an out-of-range month into the schedule", () => {
    // The MODULE refuses an out-of-range month; the chart is downstream of a
    // result that already exists, so here the safe behaviour is to stay inside
    // the schedule rather than to draw nothing.
    const low = loanChartModel(result, "window", W, { examineMonth: 0 });
    expect(low.columns[0].period).toBe(1);
    const high = loanChartModel(result, "window", W, { examineMonth: 9_999 });
    expect(high.columns[FIRST_MONTHS_WINDOW - 1].period).toBe(240);
  });

  it("handles a schedule shorter than the window", () => {
    const short = computeLoan({
      amount: 100_000_000,
      annualRatePercent: 8.5,
      termMonths: 6,
    });
    if (short === null) throw new Error("fixture did not compute");
    const model = loanChartModel(short, "window", W, { examineMonth: 5 });
    expect(model.columns.map((c) => c.period)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(
      model.columns.filter((column) => column.emphasis === true).map((c) => c.period),
    ).toEqual([5]);
  });

  it("leaves the mortgage page's own modes unemphasised", () => {
    for (const granularity of ["year", "firstMonths"] as const) {
      const model = loanChartModel(result, granularity, W, {
        examineMonth: 152,
      });
      expect(
        model.columns.every((column) => column.emphasis !== true),
        granularity,
      ).toBe(true);
    }
    // And `firstMonths` still starts at month 1 whatever is passed.
    const first = loanChartModel(result, "firstMonths", W, {
      examineMonth: 152,
    });
    expect(first.columns[0].period).toBe(1);
  });
});

describe("loanChartModel — nothing to draw", () => {
  it("explains a null result instead of drawing an empty box", () => {
    const model = loanChartModel(null, "year", L);
    expect(model.unavailable).not.toBeNull();
    expect(model.unavailable!.reason).toBe("Chưa tính được.");
    expect(model.unavailable!.recovery).toBe("Kiểm tra lại số đã nhập.");
    expect(model.columns).toEqual([]);
    expect(model.table.rows).toEqual([]);
    expect(model.overlay).toBeNull();
  });

  it("keeps its title and table headers so the figure is still labelled", () => {
    const model = loanChartModel(null, "year", L);
    expect(model.title).toBe("T");
    expect(model.table.columns).toHaveLength(4);
    expect(model.yMax).toBe(0);
  });
});
