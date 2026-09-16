/**
 * C07, C10, C11 and C12's path visuals against the INDEPENDENT references.
 *
 * Every figure asserted here was computed outside this codebase — direct
 * monthly recurrence and the annuity formula, no production imports — and is
 * recorded in
 * `../../../artifacts/finhome-tools-audit-2026-09-14/education-visual-scope-check.md`:
 *
 * | Article | Reference |
 * |---|---|
 * | C07, 2 tỷ @ 8,5% | 240 months: payment 17.356.465, interest 2.165.551.520; 300 months: 16.104.542 and 2.831.362.501. Debts at 60: 1.762.543.662 / 1.855.739.862; at 120: 1.399.876.455 / 1.635.411.266; at 240: 0 / 784.954.406; at 300: 0 / 0 |
 * | C10, same 240-month loan, +2 triệu | baseline interest 2.165.551.520 vs 1.609.851.636; saving 555.699.884; payoff month 187 rather than 240. Debts at 60: 1.762.543.662 / 1.613.658.788; at 120: 1.399.876.455 / 1.023.599.623; at 187: 764.715.088 / 0. Final actual extra payment 9.549.208 |
 * | C11, 2 tỷ / 240 | fixed 10,5% pays 19.967.598 with 2.792.223.457 interest. Floating 7,5% for 12 months pays 16.111.864; post 9 / 11 / 13% resets to 17.926.581 / 20.479.346 / 23.166.370 with full-term interest 2.280.602.911 / 2.862.633.323 / 3.475.274.620 |
 * | C12, 1,8 tỷ 11% → 9%, 216 months, 40 triệu, H60 | payments 19.170.894 / 16.856.007. At 0 both −40 triệu; at 12 cost −3.962.835 and cash −12.221.362; at 24 cost 32.110.231 and cash 15.557.277; at 60 cost 139.632.799, cash 98.893.192, debts 1.587.615.672 / 1.546.876.065. Cost break-even 14, cash-flow break-even 18 |
 * | C12, new term 300 | payment 15.105.535; at 60 cost 112.633.271 vs cash 203.921.542, debts 1.587.615.672 / 1.678.903.943. Cost break-even 14, cash-flow break-even 10 |
 *
 * A sub-đồng residue at a 300-month endpoint is displayed as 0, not as an
 * extra period. These are the articles' own hypotheticals — not current bank
 * offers, not forecasts and not advice.
 */
import { describe, expect, it } from "vitest";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { LOAN } from "@/content/calculators/loan";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { FIXED_VS_FLOATING } from "@/content/calculators/fixed-vs-floating";
import { fill } from "@/lib/calc/charts/labels";
import { formatMoney } from "@/lib/calc/number";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { compareRefinance } from "@/lib/calc/refinance";
import type { LineChartModel } from "@/lib/calc/charts/types";
import { isMoneyCell, type TableCell } from "@/lib/calc/table-cell";

/** Resolve one article's declared visual into its line-chart model. */
function lines(planId: string): LineChartModel {
  const article = EDUCATION_ARTICLES.find((a) => a.planId === planId)!;
  const visual = resolveEducationVisual(article.visual, EDUCATION_VISUAL_LABELS);
  expect(visual.kind, planId).toBe("chart");
  if (visual.kind !== "chart") throw new Error("not a chart");
  expect(visual.model.unavailable, planId).toBeNull();
  expect(visual.model.kind, planId).toBe("lines");
  if (visual.model.kind !== "lines") throw new Error("not lines");
  return visual.model;
}

/** A money cell rounded to the đồng the references are quoted at. */
function dong(cell: TableCell): number {
  expect(isMoneyCell(cell)).toBe(true);
  return isMoneyCell(cell) ? Math.round(cell.value) : Number.NaN;
}

function count(cell: TableCell): number {
  return typeof cell === "object" && cell !== null && cell.kind === "count"
    ? cell.value
    : Number.NaN;
}

/** Every sentence an article renders as body prose. */
function prose(planId: string): string {
  const article = EDUCATION_ARTICLES.find((a) => a.planId === planId)!;
  return [
    ...article.shortAnswer,
    ...article.sections.flatMap((s) => s.paragraphs),
    ...article.household.items.map((i) => `${i.label} ${i.value}`),
    article.household.note,
  ].join(" ");
}

/** The row whose first cell starts with `label`. */
function row(model: LineChartModel, label: string): TableCell[] {
  const found = model.table.rows.find(
    (r) => typeof r[0] === "string" && r[0].startsWith(label),
  );
  expect(found, label).toBeDefined();
  return found as TableCell[];
}

/**
 * The exercise steps name controls the tools actually print.
 *
 * An article that quotes a heading the page no longer has sends the reader
 * looking for something that is not there — which is how these three drifted:
 * the comparison route now composes "Bên A — một mức lãi suốt kỳ hạn" from a
 * stable side name plus a descriptor read off what was typed, its promotional
 * field is "Lãi ưu đãi", and the mortgage tool keeps its extra-payment field
 * behind a collapsed disclosure.
 */
describe("the exercises quote the live controls", () => {
  const steps = (planId: string) => {
    const article = EDUCATION_ARTICLES.find((a) => a.planId === planId)!;
    return [
      article.exercise.intro,
      ...article.exercise.steps,
      article.exercise.change,
      article.exercise.check,
    ].join(" ");
  };

  it("C07 names the horizon field, the detail table and the full-term row", () => {
    const words = steps("C07");
    expect(words).toContain(`“${LOAN_COMPARE.form.horizonLabel}”`);
    expect(words).toContain(`“${LOAN_COMPARE.form.detailTitle}”`);
    expect(words).toContain(`“${LOAN_COMPARE.table.rows.totalInterest}”`);
    // The cost bars are a SELECTED-HORIZON measure: at the tool's default
    // month 60 this loan shows 803,9 / 822,0 triệu, neither of which is the
    // article's full-term figure.
    expect(words).toContain("ĐẾN MỐC");
    expect(words).not.toContain("biểu đồ cột (chi phí vay)");
    // The comparison tool takes a term in YEARS, and the step is right to
    // say so — this must not drift to months.
    expect(LOAN_COMPARE.form.termUnit).toContain("năm");
    expect(words).toContain("số năm");
    expect(words).not.toContain("“Kỳ hạn” là số tháng");
  });

  it("C10 opens the disclosure the extra-payment field lives behind", () => {
    const words = steps("C10");
    expect(words).toContain(`“${LOAN.form.extraPanelTitle}”`);
    expect(words).toContain(`“${LOAN.form.extraLabel}”`);
    // Stated in the order a reader does it: open, then type.
    const article = EDUCATION_ARTICLES.find((a) => a.planId === "C10")!;
    const openAt = article.exercise.steps.findIndex((s) =>
      s.includes(LOAN.form.extraPanelTitle),
    );
    const typeAt = article.exercise.steps.findIndex(
      (s) =>
        s.includes(`“${LOAN.form.extraLabel}”`) &&
        !s.includes(LOAN.form.extraPanelTitle),
    );
    expect(openAt).toBeGreaterThanOrEqual(0);
    expect(typeAt).toBeGreaterThan(openAt);
  });

  it("C11 names the stable side plus the current descriptor", () => {
    const words = steps("C11");
    const [sideA, sideB] = FIXED_VS_FLOATING.compare.sideNames;
    expect(words).toContain(`“${sideA}”`);
    expect(words).toContain(`“${sideB}”`);
    expect(words).toContain(FIXED_VS_FLOATING.compare.structureConstant);
    expect(words).toContain(
      fill(FIXED_VS_FLOATING.compare.structurePhased, { n: "12" }),
    );
    // The promotional rate field, exactly as the form prints it.
    expect(words).toContain(`“${LOAN_COMPARE.form.promoRateLabel}”`);
    expect(words).toContain(`“${LOAN_COMPARE.form.optionalFeesTitle}”`);
    // The headings the page stopped printing.
    expect(words).not.toContain("Lãi cố định cả kỳ hạn");
    expect(words).not.toContain("Ưu đãi rồi thả nổi");
    expect(words).not.toContain("Lãi suất ưu đãi");
  });

  it("every quoted control exists in the tool it sends the reader to", () => {
    // A cheap sweep over the three articles this unit touched: any string in
    // curly quotes must be a label one of those content files prints.
    const printed = [
      ...Object.values(LOAN.form),
      ...Object.values(LOAN_COMPARE.form),
      ...Object.values(LOAN_COMPARE.table.rows),
      ...FIXED_VS_FLOATING.compare.sideNames,
      // The fixed/floating perspective COMPOSES its column heading as
      // "<side> — <structure>", so the composed forms are what a reader sees
      // and what the steps may quote. Built here the same way
      // `loan-compare-calculator.tsx` builds them.
      ...FIXED_VS_FLOATING.compare.sideNames.flatMap((side) => [
        `${side} — ${FIXED_VS_FLOATING.compare.structureConstant}`,
        `${side} — ${fill(FIXED_VS_FLOATING.compare.structurePhased, { n: "12" })}`,
      ]),
    ]
      // One level of flattening: `optionLabels` is an array of column names,
      // and those are printed headings too.
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === "string");
    for (const planId of ["C07", "C10", "C11"]) {
      for (const [, quoted] of steps(planId).matchAll(/“([^”]+)”/g)) {
        expect(printed, `${planId} quotes “${quoted}”`).toContain(quoted);
      }
    }
  });
});

describe("C07 — two debt paths and each term's own full-term interest", () => {
  const model = lines("C07");

  it("draws both terms, each told apart by more than colour", () => {
    expect(model.series.map((s) => s.label)).toEqual([
      "Dư nợ — 20 năm (240 tháng)",
      "Dư nợ — 25 năm (300 tháng)",
    ]);
    expect(new Set(model.series.map((s) => s.stroke)).size).toBe(2);
    expect(model.xMax).toBe(300);
    // Both start from the SAME 2 tỷ, which is the premise of the comparison.
    for (const series of model.series) {
      expect(series.points[0]).toEqual({ period: 0, value: 2_000_000_000 });
    }
  });

  it("marks where each term's debt actually reaches zero", () => {
    expect(model.markers.map((m) => m.period)).toEqual([240, 300]);
    expect(model.markers[0].label).toContain("20 năm");
    expect(model.markers[0].label).toContain("240");
    expect(model.markers[1].label).toContain("300");
  });

  it("reports both instalments and both full-term interest figures", () => {
    const payment = row(model, "Khoản trả theo lịch");
    expect(dong(payment[1])).toBe(17_356_465);
    expect(dong(payment[2])).toBe(16_104_542);
    const interest = row(model, "Tổng lãi cả kỳ hạn");
    expect(dong(interest[1])).toBe(2_165_551_520);
    expect(dong(interest[2])).toBe(2_831_362_501);
    // The trade-off the article is about, from those same two figures.
    expect(dong(interest[2]) - dong(interest[1])).toBe(665_810_981);
    expect(dong(payment[1]) - dong(payment[2])).toBe(1_251_923);
  });

  it("reproduces the independent debt path at every checkpoint", () => {
    for (const [month, shorter, longer] of [
      [60, 1_762_543_662, 1_855_739_862],
      [120, 1_399_876_455, 1_635_411_266],
      [240, 0, 784_954_406],
      [300, 0, 0],
    ] as const) {
      const cells = row(model, `Dư nợ ở tháng ${month}`);
      expect(dong(cells[1]), `20 năm at ${month}`).toBe(shorter);
      expect(dong(cells[2]), `25 năm at ${month}`).toBe(longer);
    }
  });

  it("calls the interest figure a full-term one, not a horizon cost", () => {
    expect(model.table.hint).toContain("CẢ kỳ hạn");
    expect(model.summary).toContain("tổng lãi cả kỳ hạn");
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("quotes in prose only figures the figure itself produces", () => {
    const words = prose("C07");
    for (const cell of [
      row(model, "Dư nợ ở tháng 120")[1],
      row(model, "Dư nợ ở tháng 120")[2],
      row(model, "Dư nợ ở tháng 240")[2],
    ]) {
      expect(words).toContain(formatMoney(dong(cell)));
    }
  });

  it("describes the cells the reader sees, not blanks it does not have", () => {
    // The shared assumption list said a cell after a payoff is BLANK. That
    // is true of the adapter's own per-month table and false of this
    // article's override, which reports a real 0 at months 240 and 300.
    expect(dong(row(model, "Dư nợ ở tháng 240")[1])).toBe(0);
    const words = [...model.assumptions, model.table.hint ?? ""].join(" ");
    expect(words).not.toContain("ô bảng để trống sau mốc đó");
    expect(words).toContain("dư nợ 0");
    expect(words).toContain("mỗi đường dừng lại");
  });
});

describe("C10 — the baseline path the extra payment is measured against", () => {
  const model = lines("C10");

  it("draws the no-extra baseline beside the extra-payment path", () => {
    expect(model.series.map((s) => s.label)).toEqual([
      "Dư nợ — Theo lịch",
      "Dư nợ — Trả thêm 2 triệu",
    ]);
    expect(new Set(model.series.map((s) => s.stroke)).size).toBe(2);
    expect(model.xMax).toBe(240);
  });

  it("marks both payoff months: 240 on the schedule, 187 with the extra", () => {
    expect(model.markers.map((m) => m.period)).toEqual([240, 187]);
    expect(model.markers[1].label).toContain("187");
  });

  it("reproduces the independent interest, saving and months saved", () => {
    expect(count(row(model, "Số tháng trả hết nợ")[1])).toBe(240);
    expect(count(row(model, "Số tháng trả hết nợ")[2])).toBe(187);
    const interest = row(model, "Tổng lãi cả kỳ hạn");
    expect(dong(interest[1])).toBe(2_165_551_520);
    expect(dong(interest[2])).toBe(1_609_851_636);
    expect(dong(row(model, "Lãi tiết kiệm được")[2])).toBe(555_699_884);
    expect(count(row(model, "Rút ngắn")[2])).toBe(53);
    // A figure that exists on one path only is a placeholder on the other,
    // never a 0 that reads as "saved nothing".
    expect(row(model, "Lãi tiết kiệm được")[1]).toBeNull();
    expect(row(model, "Rút ngắn")[1]).toBeNull();
  });

  it("reproduces the independent debt path at every checkpoint", () => {
    for (const [month, baseline, extra] of [
      [60, 1_762_543_662, 1_613_658_788],
      [120, 1_399_876_455, 1_023_599_623],
      [187, 764_715_088, 0],
    ] as const) {
      const cells = row(model, `Dư nợ ở tháng ${month}`);
      expect(dong(cells[1]), `baseline at ${month}`).toBe(baseline);
      expect(dong(cells[2]), `extra at ${month}`).toBe(extra);
    }
  });

  it("reports the real final payment, not the instalment plus the extra", () => {
    const final = row(model, "Khoản gốc và lãi ở tháng cuối thực tế");
    expect(dong(final[1])).toBe(17_356_465);
    expect(dong(final[2])).toBe(9_549_208);
  });

  it("keeps the prepayment-fee exclusion on the figure itself", () => {
    const words = [model.summary, ...model.assumptions].join(" ");
    expect(words).toContain("phí trả nợ trước hạn");
  });

  it("quotes in prose only figures the figure itself produces", () => {
    const words = prose("C10");
    for (const cell of [
      row(model, "Dư nợ ở tháng 60")[1],
      row(model, "Dư nợ ở tháng 60")[2],
      row(model, "Dư nợ ở tháng 120")[1],
      row(model, "Dư nợ ở tháng 120")[2],
      row(model, "Dư nợ ở tháng 187")[1],
      row(model, "Lãi tiết kiệm được")[2],
    ]) {
      expect(words).toContain(formatMoney(dong(cell)));
    }
    expect(words).toContain("tháng 187");
  });
});

describe("C11 — both structures, under named post-promotional scenarios", () => {
  const model = lines("C11");

  it("draws the fixed level and two named floating scenarios", () => {
    expect(model.series).toHaveLength(3);
    expect(model.series.map((s) => s.stroke)).toEqual([
      "solid",
      "dashed",
      "dotted",
    ]);
    expect(model.series[0].label).toContain("Cố định 10,50%");
    expect(model.series[1].label).toContain("11,00%");
    expect(model.series[2].label).toContain("13,00%");
    // Stepped, because an instalment holds a level and then jumps.
    expect(model.step).toBe(true);
  });

  it("holds the promotional level for 12 months, then resets", () => {
    const floating = model.series[1].points;
    expect(floating[0]).toEqual({ period: 1, value: floating[0].value });
    expect(Math.round(floating[0].value)).toBe(16_111_864);
    expect(Math.round(floating[1].value)).toBe(16_111_864);
    expect(floating[1].period).toBe(12);
    expect(floating[2].period).toBe(13);
    expect(Math.round(floating[2].value)).toBe(20_479_346);
    expect(floating[3].period).toBe(240);
    // The fixed option never steps.
    const fixed = model.series[0].points;
    expect(fixed).toHaveLength(2);
    expect(Math.round(fixed[0].value)).toBe(19_967_598);
    expect(Math.round(fixed[1].value)).toBe(19_967_598);
  });

  it("reports all three named post-rate scenarios exactly", () => {
    expect(dong(row(model, "Cố định 10,50% — khoản trả")[1])).toBe(19_967_598);
    expect(dong(row(model, "Cố định 10,50% — tổng lãi")[1])).toBe(
      2_792_223_457,
    );
    expect(dong(row(model, "Thả nổi — khoản trả trong ưu đãi")[1])).toBe(
      16_111_864,
    );
    for (const [rate, reset, interest] of [
      ["9,00%", 17_926_581, 2_280_602_911],
      ["11,00%", 20_479_346, 2_862_633_323],
      ["13,00%", 23_166_370, 3_475_274_620],
    ] as const) {
      expect(
        dong(row(model, `Thả nổi — khoản trả sau ưu đãi, ở mức ${rate}`)[1]),
        `reset at ${rate}`,
      ).toBe(reset);
      expect(
        dong(
          row(model, `Thả nổi — tổng lãi cả kỳ hạn, sau ưu đãi ở ${rate}`)[1],
        ),
        `interest at ${rate}`,
      ).toBe(interest);
    }
  });

  it("keeps the break-even fixed rate the prose points at", () => {
    const cells = row(model, "Mức lãi cố định khiến hai phương án bằng nhau");
    const cell = cells[1];
    expect(
      typeof cell === "object" && cell !== null && cell.kind === "percent",
    ).toBe(true);
    if (typeof cell === "object" && cell !== null && cell.kind === "percent") {
      // The article's own hypothetical is the 11% scenario, and 10,5% fixed
      // sits below this rate — which is what its short answer claims.
      expect(cell.value).toBeGreaterThan(10.5);
      expect(cell.value).toBeLessThan(11);
    }
  });

  it("declares every named scenario in the article's own hypothetical", () => {
    // A figure may not rest on an assumption the article never stated.
    const words = prose("C11");
    for (const rate of ["9%/năm", "11%/năm", "13%/năm"]) {
      expect(words, rate).toContain(rate);
    }
    // And the prose quotes the resets and the fixed instalment the figure
    // actually produces.
    for (const value of [20_479_346, 23_166_370, 19_967_598]) {
      expect(words).toContain(formatMoney(value));
    }
  });

  it("says the scenarios are assumptions, not probabilities or quotes", () => {
    const words = [model.summary, ...model.assumptions, model.table.hint ?? ""]
      .join(" ");
    expect(words).toContain("không mang xác suất");
    expect(words).toContain("không phải báo giá");
    // Full term named as such, so it is not read as a horizon measure.
    expect(words).toContain("CẢ kỳ hạn 240 tháng");
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
  });

  it("calls the plotted instalments monthly, and only the rows totals", () => {
    // The summary said "mọi con số là tổng của cả kỳ hạn" on a figure whose
    // every plotted point is ONE month's payment. Only the interest rows in
    // the table are cumulative.
    expect(model.summary).toContain("KHOẢN TRẢ MỖI THÁNG");
    expect(model.summary).toContain("riêng các dòng tổng lãi trong bảng");
    expect(model.summary).toContain("mỗi điểm trên biểu đồ là tiền của một tháng");
    expect(model.summary).not.toContain("mọi con số là tổng của cả kỳ hạn");
    // And the y axis is a payment axis, not a cumulative one.
    expect(model.yAxis.label).toContain("Khoản trả");
  });

  it("does not inherit the tool's ranking, term or entered-fee sentences", () => {
    // The shared comparison summary names a cheapest option — true of the
    // drawn subset, but the exact table lists a 9%/năm scenario that is
    // cheaper than either drawn line, so that sentence read as a claim the
    // table contradicts. It also explains differing terms (all 240 months
    // here) and refers to fees the reader entered (no inputs on this page).
    expect(model.summary).not.toContain("rẻ nhất");
    expect(model.summary).not.toContain("kỳ hạn khác nhau");
    expect(model.summary).not.toContain("bạn nhập");
    // What it says instead: which scenarios are drawn, which is only in the
    // table, that the table's one is cheaper, and one common term.
    expect(model.summary).toContain("11,00% và 13,00%");
    expect(model.summary).toContain("9,00%");
    expect(model.summary).toContain("rẻ hơn cả hai đường được vẽ");
    expect(model.summary).toContain("cùng 240 tháng");
  });
});

describe("C12 — one path, two break-evens, kept apart", () => {
  const model = lines("C12");

  it("draws both signed ledgers over time", () => {
    expect(model.series.map((s) => s.key)).toEqual([
      "cost-saving",
      "cash-saving",
    ]);
    expect(new Set(model.series.map((s) => s.stroke)).size).toBe(2);
    expect(model.xMax).toBe(60);
    // Signed: both start at the 40 triệu of fees, below zero.
    for (const series of model.series) {
      expect(series.points[0]).toEqual({ period: 0, value: -40_000_000 });
    }
    expect(model.yMin).toBeLessThan(0);
    expect(model.references.map((r) => r.value)).toEqual([0]);
  });

  it("gives each measure its own marker at its own month", () => {
    const result = compareRefinance({
      balance: 1_800_000_000,
      currentRatePercent: 11,
      remainingMonths: 216,
      newRatePercent: 9,
      newTermMonths: 216,
      closingCosts: 20_000_000,
      earlySettlementFee: 20_000_000,
      horizonMonths: 60,
    })!;
    expect(Math.round(result.currentPayment)).toBe(19_170_894);
    expect(Math.round(result.newPayment)).toBe(16_856_007);
    expect(result.breakEvenMonths).toBe(14);
    expect(result.cashFlowBreakEvenMonths).toBe(18);
    const markers = model.markers.map((m) => m.label);
    expect(markers).toContain("Chi phí bù đủ phí lần đầu: tháng 14");
    expect(markers).toContain("Tiền đã chi bù đủ phí lần đầu: tháng 18");
    expect(model.summary).toContain("Hai mốc khác nhau");
  });

  it("reproduces the independent path at every checkpoint", () => {
    const at = (month: number) =>
      model.table.rows.find((r) => count(r[0]) === month)!;
    for (const [month, cost, cash] of [
      [0, -40_000_000, -40_000_000],
      [12, -3_962_835, -12_221_362],
      [24, 32_110_231, 15_557_277],
      [60, 139_632_799, 98_893_192],
    ] as const) {
      expect(dong(at(month)[1]), `cost at ${month}`).toBe(cost);
      expect(dong(at(month)[2]), `cash at ${month}`).toBe(cash);
    }
    // Both debts at the horizon, exactly.
    expect(dong(at(60)[3])).toBe(1_587_615_672);
    expect(dong(at(60)[4])).toBe(1_546_876_065);
    // Both crossings are rows, whatever the article's own checkpoints were.
    expect(model.table.rows.map((r) => count(r[0]))).toContain(14);
    expect(model.table.rows.map((r) => count(r[0]))).toContain(18);
    // Five columns fall back to one block per month on a phone.
    expect(model.table.mobileCards).toBe(true);
  });

  it("shows the trap: a stretched term relieves cash flow FIRST", () => {
    // The article's own exercise sends the reader to a 300-month new term.
    // There the cash-flow crossing arrives at month 10 and the economic one
    // still at 14 — the reverse order — while 1.678.903.943 ₫ of debt is
    // still owed against the old loan's 1.587.615.672 ₫.
    const stretched = compareRefinance({
      balance: 1_800_000_000,
      currentRatePercent: 11,
      remainingMonths: 216,
      newRatePercent: 9,
      newTermMonths: 300,
      closingCosts: 20_000_000,
      earlySettlementFee: 20_000_000,
      horizonMonths: 60,
    })!;
    expect(Math.round(stretched.newPayment)).toBe(15_105_535);
    expect(stretched.breakEvenMonths).toBe(14);
    expect(stretched.cashFlowBreakEvenMonths).toBe(10);
    expect(Math.round(stretched.horizonCostSaving)).toBe(112_633_271);
    expect(Math.round(stretched.horizonCashFlowSaving)).toBe(203_921_542);
    expect(Math.round(stretched.horizon.currentBalance)).toBe(1_587_615_672);
    expect(Math.round(stretched.horizon.newBalance)).toBe(1_678_903_943);
    expect(stretched.horizonCashFlowSaving).toBeGreaterThan(
      stretched.horizonCostSaving,
    );
  });

  it("quotes both crossing months and both signed checkpoints in prose", () => {
    const words = prose("C12");
    expect(words).toContain("tháng 14");
    expect(words).toContain("tháng 18");
    expect(words).toContain("tháng 10");
    for (const value of [
      -3_962_835, -12_221_362, 32_110_231, 15_557_277, 15_105_535,
      1_678_903_943, 1_587_615_672,
    ]) {
      expect(words, String(value)).toContain(formatMoney(Math.abs(value)));
    }
  });

  it("never calls the cash-flow measure an economic saving", () => {
    const words = [model.summary, ...model.assumptions, model.table.hint ?? ""]
      .join(" ");
    expect(words).toContain("chưa tính dư nợ");
    expect(words).toContain("không phải lợi ích kinh tế");
    // The SIGN is scoped per line: below zero on the cost line means dearer,
    // below zero on the cash line only means more money out so far.
    expect(model.summary).toContain("Đường tiết kiệm CHI PHÍ ở dưới 0");
    expect(model.summary).toContain("chưa nói gì về lợi ích kinh tế");
  });

  it("describes the phone layout the five-column table actually has", () => {
    // Telling a phone reader to swipe sideways described a layout they do
    // not have: with `mobileCards` each month is its own block below `md`.
    expect(model.table.hint).toContain("mỗi tháng hiển thị thành một khối");
    expect(model.table.mobileCards).toBe(true);
  });
});
