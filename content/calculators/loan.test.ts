import { describe, it, expect } from "vitest";
import { LOAN as C } from "@/content/calculators/loan";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { computeLoan, type RepaymentMethod } from "@/lib/calc/loan";
import { loanChartModel } from "@/lib/calc/charts/loan-chart";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { TABLE_UI } from "@/content/calculators/table-ui";
import {
  renderTableCell,
  tableMoneyUnit,
  type TableCell,
} from "@/lib/calc/table-cell";

/**
 * The module AT ITS SHIPPED DEFAULTS.
 *
 * docs §6 names this the highest-value substitute for the component coverage
 * this environment cannot have: parse the content file's own default strings
 * with the same parser the component uses, run the module, format with the
 * same formatter, and pin the result. Three of the suite's five worst defects
 * lived in a default input or a content string rather than in a module, and
 * were invisible to a green run.
 *
 * It also catches the specific mistake this page has a history of: a default
 * parsed with the wrong grammar. `parseMoney("8,5")` is 8,5 but
 * `parseMoney("2.000.000.000")` is 2e9 while `parseDecimal` of the same string
 * is 2 — a 1.000.000.000× error with no invalid state shown.
 */

/** Exactly what `loan-calculator.tsx` does with the default strings. */
function fromDefaults(method: RepaymentMethod = "annuity") {
  const amount = parseMoney(C.form.defaultAmount);
  const rate = parseDecimal(C.form.defaultRate);
  const term = parseDecimal(C.form.defaultTerm);
  const extra = parseMoney(C.form.defaultExtra);
  if (amount === null || rate === null || term === null || extra === null) {
    throw new Error("a default string does not parse with its own parser");
  }
  return {
    parsed: { amount, rate, term, extra },
    result: computeLoan({
      amount,
      annualRatePercent: rate,
      termMonths: C.form.defaultTermUnit === "years" ? term * 12 : term,
      extraPerMonth: extra,
      method,
    }),
  };
}

describe("the page's default inputs", () => {
  it("parses with the grammar each field actually uses", () => {
    const { parsed } = fromDefaults();
    expect(parsed.amount).toBe(2_000_000_000);
    expect(parsed.rate).toBe(8.5);
    expect(parsed.term).toBe(20);
    expect(parsed.extra).toBe(0);
  });

  it("is protected from the wrong parser by grammar, not by luck", () => {
    // The defect class docs §4 calls "the single most repeated defect in this
    // suite's history". Worth pinning what actually happens on THESE defaults
    // rather than the folklore version:
    //
    // - `parseDecimal` REFUSES the grouped amount outright, because its
    //   grammar allows at most one dot. That is a visible invalid state, not a
    //   silent 1.000.000.000× error — better than the usual case.
    // - `parseMoney` on the rate happens to agree, because "," is the decimal
    //   mark in both grammars.
    //
    // So neither substitution is silently wrong HERE. The dangerous shape is
    // a count field, where `parseMoney("3.0")` is 30 and eats the dot before
    // any integer guard can run — which is why the term field uses
    // `parseDecimal` and is bounded below by its own validity check.
    expect(parseDecimal(C.form.defaultAmount)).toBeNull();
    expect(parseMoney(C.form.defaultRate)).toBe(8.5);
    expect(parseMoney("3.0")).toBe(30);
  });

  it("declares a repayment method the module accepts", () => {
    expect(["annuity", "flatPrincipal"]).toContain(C.form.defaultMethod);
  });

  it("opens on the annuity, which is what a Vietnamese quote states", () => {
    expect(C.form.defaultMethod).toBe("annuity");
  });
});

describe("the result at those defaults", () => {
  const { result } = fromDefaults();
  if (result === null) throw new Error("the shipped defaults do not compute");

  it("produces the instalment the page's prose quotes", () => {
    expect(`${formatMoney(result.monthlyPayment)} ₫`).toBe("17.356.465 ₫");
  });

  it("plans exactly the scheduled outflow when no extra is set", () => {
    // At the defaults there is no extra payment, so the three monthly lines
    // must agree — the page hides two of them in that case, and this is why
    // that is safe.
    expect(result.monthlyExtra).toBe(0);
    expect(result.monthlyPlannedOutflow).toBeCloseTo(result.monthlyPayment, 6);
  });

  it("runs the full term, with a final month the page can name", () => {
    expect(result.months).toBe(240);
    expect(result.finalMonthPeriod).toBe(240);
    expect(result.hasFullMonths).toBe(true);
  });

  it("charges no PMI and no escrow, because both default to zero", () => {
    // The audit's context finding: PMI had four visible fields on a page
    // stating PMI does not apply in Vietnam. It is now behind the advanced
    // disclosure AND neutral at the defaults, so a Vietnamese borrower cannot
    // be charged it by accident.
    expect(result.monthlyPmi).toBe(0);
    expect(result.pmiMonths).toBe(0);
    expect(result.monthlyEscrow).toBe(0);
  });
});

describe("the flat-principal default path", () => {
  it("computes and differs from the annuity in both directions", () => {
    const flat = fromDefaults("flatPrincipal").result;
    const annuity = fromDefaults("annuity").result;
    expect(flat).not.toBeNull();
    expect(annuity).not.toBeNull();
    expect(flat!.monthlyPrincipalInterest).toBeGreaterThan(
      annuity!.monthlyPrincipalInterest,
    );
    expect(flat!.totalInterest).toBeLessThan(annuity!.totalInterest);
    expect(`${formatMoney(flat!.monthlyPrincipalInterest)} ₫`).toBe(
      "22.500.000 ₫",
    );
  });
});

describe("the chart, at the shipped copy and defaults", () => {
  const { result } = fromDefaults();
  const labels = { ...CHART_UI.money, ...C.chart };

  it("substitutes every placeholder in the summary", () => {
    // A visible "{interest}" in prose is a copy bug that no type check sees.
    for (const granularity of ["year", "firstMonths"] as const) {
      const model = loanChartModel(result, granularity, labels);
      expect(model.summary, granularity).not.toMatch(/\{[a-z]+\}/i);
      expect(model.yAxis.label, granularity).not.toMatch(/\{[a-z]+\}/i);
      expect(model.overlayAxis!.label, granularity).not.toMatch(/\{[a-z]+\}/i);
    }
  });

  it("names the magnitude words from the shared content file", () => {
    const model = loanChartModel(result, "year", labels);
    expect(model.overlayAxis!.label).toContain(CHART_UI.money.billion);
  });

  it("agrees with the page's own yearly table, row for row", () => {
    // The chart and the table under it are the same numbers. Asserted on the
    // rendered STRINGS, because that is what a reader compares — rendered the
    // way the component does, from the table's own chosen unit.
    const model = loanChartModel(result, "year", labels);
    expect(model.table.rows).toHaveLength(20);
    expect(model.table.rows[0][0]).toBe("Năm 1");

    const unit = tableMoneyUnit(model.table.rows);
    // Triệu, not tỷ: the unit is chosen from the SMALLEST figure so a year's
    // principal stays legible beside a balance in the billions.
    expect(unit).toBe("trieu");
    const compact = (cell: TableCell) =>
      renderTableCell(cell, "compact", unit, TABLE_UI);
    const exact = (cell: TableCell) =>
      renderTableCell(cell, "exact", unit, TABLE_UI);

    // Year 1, at the page's shipped defaults: 2 tỷ / 8,5% / 240 months.
    expect(compact(model.table.rows[0][1])).toBe("168,5");
    expect(compact(model.table.rows[0][2])).toBe("39,8");
    expect(compact(model.table.rows[0][3])).toBe("1.960,2");
    // The exact reading is the same number at full precision, and the two
    // must not be two different numbers.
    expect(exact(model.table.rows[0][1])).toBe("168.472.992");
    // A zero really is zero; only a NON-zero that rounds away gets "< 0,1".
    expect(compact(model.table.rows[19][3])).toBe("0,0");
    expect(exact(model.table.rows[19][3])).toBe("0");
  });

  it("keeps its honesty notes in the assumptions", () => {
    const model = loanChartModel(result, "year", labels);
    const text = model.assumptions.join(" ");
    // The two things this chart cannot show, stated on the chart itself.
    expect(text).toContain("thả nổi");
    expect(text).toContain("trước hạn");
  });

  it("explains itself when there is nothing to draw", () => {
    const model = loanChartModel(null, "year", labels);
    expect(model.unavailable).not.toBeNull();
    expect(model.unavailable!.reason.length).toBeGreaterThan(20);
    expect(model.unavailable!.recovery.length).toBeGreaterThan(20);
  });
});

describe("the page's honesty copy", () => {
  it("still warns that the rate is assumed fixed", () => {
    // Load-bearing, per the content file's own header note.
    expect(C.floatingRateNotice).toContain("thả nổi");
    expect(C.floatingRateNotice).toContain("ưu đãi");
  });

  it("still says PMI does not apply to a Vietnamese loan", () => {
    expect(C.pmiNotice).toContain("Hoa Kỳ");
    expect(C.pmiNotice).toContain("Việt Nam");
  });

  it("marks the PMI panel as United States rules in its own heading", () => {
    // The panel is collapsed by default, so its heading is the only warning a
    // reader gets before opening it.
    expect(C.pmiGroupTitle).toContain("Hoa Kỳ");
  });

  it("states that the prepayment saving is before a fee it does not model", () => {
    expect(C.form.prepaymentFeeNotice).toContain("trước hạn");
    expect(C.form.prepaymentFeeNotice).toContain("TRƯỚC phí");
  });

  it("quotes no fee range, because none was verified", () => {
    // The browser check flagged "Phần lớn hợp đồng … 1–3%" as an invented
    // universal. What is true is that the tool does not model the fee and the
    // contract decides it.
    expect(C.form.prepaymentFeeNotice).not.toContain("1–3%");
    expect(C.form.prepaymentFeeNotice).not.toContain("Phần lớn");
    expect(C.form.prepaymentFeeNotice).toContain("hợp đồng");
  });

  it("says the post-promotional payment MAY change, not that it will rise", () => {
    // A static page does not know the reader's contract or where a base rate
    // goes. "sẽ tăng" was a prediction.
    expect(C.floatingRateNotice).toContain("có thể thay đổi");
    expect(C.floatingRateNotice).not.toContain("sẽ tăng");
    expect(C.floatingRateDetail).not.toContain("sẽ tăng");
    for (const item of C.faq.items) {
      expect(item.a, item.q).not.toContain("sẽ tăng");
    }
  });

  it("keeps the visible risk notice short enough to stay on screen", () => {
    // Critical limitations stay VISIBLE but concise; the reasoning sits in
    // `floatingRateDetail`, behind a disclosure. The browser check measured
    // the first input 1067 px down a 390 px viewport, largely because of
    // notices like this one.
    expect(C.floatingRateNotice.length).toBeLessThan(220);
    expect(C.lede.length).toBeLessThan(120);
    // And the long version still exists rather than the content being lost.
    expect(C.floatingRateDetail.length).toBeGreaterThan(300);
  });

  it("quotes no fee or ratio range anywhere in the page's copy", () => {
    const everyString = (value: unknown): string[] => {
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) return value.flatMap(everyString);
      if (value && typeof value === "object") {
        return Object.values(value).flatMap(everyString);
      }
      return [];
    };
    const copy = everyString(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("labels the three monthly lines as three different things", () => {
    const labels = [
      C.form.monthlyPaymentLabel,
      C.form.extraRowLabel,
      C.form.plannedOutflowLabel,
    ];
    expect(new Set(labels).size).toBe(3);
    // And the sum is the one that says it is the sum.
    expect(C.form.plannedOutflowLabel).toContain("Tổng");
    expect(C.form.monthlyPaymentLabel).not.toContain("Tổng");
  });

  it("keeps a placeholder in the final-month label for the month number", () => {
    expect(C.form.finalMonthLabel).toContain("{n}");
  });

  it("explains the method choice rather than just offering it", () => {
    expect(C.form.methodHelp).toContain("Trả gốc đều");
    expect(C.form.methodHelp).toContain("tổng lãi");
  });
});
