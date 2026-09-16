/**
 * Rendered-markup contracts for /cong-cu/phan-tich-khoan-vay/.
 *
 * ORIGINAL ROW 6: "Dùng chung kết quả với công cụ vay mua nhà; giữ trang như
 * bài học giải thích; cho chọn một tháng/năm", with a synchronised
 * interest/principal column chart and balance line, and a route back to the
 * loan being planned.
 *
 * Server-rendered: this page is prerendered at its defaults and must hydrate
 * byte-identically. Nothing here is a visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LOAN_ANALYSIS } from "@/content/calculators/loan-analysis";
import { LOAN } from "@/content/calculators/loan";
import { analyseLoan } from "@/lib/calc/loan-analysis";
import { formatMoney } from "@/lib/calc/number";

const CONTENT = "@/content/calculators/loan-analysis";

type StringFormKey = {
  [K in keyof typeof LOAN_ANALYSIS.form]: (typeof LOAN_ANALYSIS.form)[K] extends string
    ? K
    : never;
}[keyof typeof LOAN_ANALYSIS.form];

type FormPatch = Partial<Record<StringFormKey, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/loan-analysis")
      >(CONTENT);
      return {
        LOAN_ANALYSIS: {
          ...actual.LOAN_ANALYSIS,
          form: { ...actual.LOAN_ANALYSIS.form, ...patch },
        },
      };
    });
  }
  try {
    const { LoanAnalysisCalculator } = await import(
      "@/components/loan-analysis-calculator"
    );
    return renderToStaticMarkup(createElement(LoanAnalysisCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

async function copy(patch?: FormPatch) {
  const actual = await vi.importActual<
    typeof import("@/content/calculators/loan-analysis")
  >(CONTENT);
  return {
    ...actual.LOAN_ANALYSIS,
    form: { ...actual.LOAN_ANALYSIS.form, ...patch },
  };
}

/** The production model at the page's shipped defaults. */
const DEFAULTS = analyseLoan({
  amount: 2_000_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
  method: "annuity",
  selectedMonth: 152,
});

describe("any month of the term can be examined", () => {
  it("offers the month field with the whole term available", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.examineGroup);
    expect(html).toContain(C.form.examineLabel);
    expect(html).toContain(C.form.examineHelp);
    // The default is deliberately NOT inside the first twenty-four months,
    // which is the window the chart used to be stuck on.
    expect(html).toContain('value="152"');
    expect(C.form.examineHelp).toContain("không chỉ hai năm đầu");
  });

  it("names the month over the term AND as a month of a year", async () => {
    const html = await render();
    // Month 152 is month 8 of year 13.
    expect(html).toContain("Tháng 152 — năm thứ 13, tháng 8");
    expect(html).not.toContain("{month}");
    expect(html).not.toContain("{year}");
    expect(html).not.toContain("{monthOfYear}");
  });

  it("shows that month's own figures, from the production model", async () => {
    const C = await copy();
    const html = await render();
    expect(DEFAULTS).not.toBeNull();
    const selected = DEFAULTS?.selected;
    expect(selected).not.toBeNull();
    if (!selected) return;

    expect(html).toContain(C.form.examinePaymentLabel);
    expect(html).toContain(`${formatMoney(selected.payment)} ₫`);
    expect(html).toContain(`${formatMoney(selected.interest)} ₫`);
    expect(html).toContain(`${formatMoney(selected.principal)} ₫`);
    expect(html).toContain(`${formatMoney(selected.balance)} ₫`);
    // The running totals are typed cells in the detail block: exact reading,
    // no per-figure "₫".
    expect(html).toContain(`>${formatMoney(selected.cumulativeInterest)}<`);
    expect(html).toContain(`>${formatMoney(selected.cumulativePrincipal)}<`);
  });

  it("moves the whole page when the month moves", async () => {
    const early = await render({ defaultExamine: "1" });
    const late = await render({ defaultExamine: "240" });

    // The first month's interest, and the last month's, are both on their own
    // page and not on the other's.
    expect(early).toContain("Tháng 1 — năm thứ 1, tháng 1");
    expect(late).toContain("Tháng 240 — năm thứ 20, tháng 12");
    expect(early).not.toContain("Tháng 240 — năm thứ 20, tháng 12");
    // The chart window follows: month 240's window is 217–240.
    expect(late).toContain("Tháng 217");
    expect(late).toContain("Tháng 240");
    expect(early).toContain("Tháng 1");
    expect(early).not.toContain("Tháng 217");
  });

  it("rejects a month outside the term, and clears the result", async () => {
    const C = await copy({ defaultExamine: "300" });
    const html = await render({ defaultExamine: "300" });
    expect(html).toContain('value="300"');
    expect(html).toContain(C.form.examineInvalid);
    expect(html).toContain('aria-invalid="true"');
    // Nothing is answered about a month that is not in the schedule.
    expect(html).not.toContain("17.356.465 ₫");
    expect(html).toContain(C.chart.unavailableRecovery);
  });

  it("rejects a grouped or fractional month count", async () => {
    for (const typed of ["1.200", "3,5", "3.0"]) {
      const C = await copy({ defaultExamine: typed });
      const html = await render({ defaultExamine: typed });
      expect(html, typed).toContain(C.form.examineInvalid);
      expect(html, typed).not.toContain("17.356.465 ₫");
    }
  });
});

describe("the mortgage's repayment method, with the same meaning", () => {
  it("offers both structures with the mortgage's own wording", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.methodLegend);
    expect(html).toContain(C.form.methodAnnuity);
    expect(html).toContain(C.form.methodFlatPrincipal);
    // The same two option labels the mortgage page uses, so a reader who set
    // one there recognises it here.
    expect(C.form.methodAnnuity).toBe(LOAN.form.methodAnnuity);
    expect(C.form.methodFlatPrincipal).toBe(LOAN.form.methodFlatPrincipal);
  });

  it("explains the two in plain Vietnamese", async () => {
    const C = await copy();
    const html = await render();
    // Row 6's lesson: "lãi tính trên dư nợ; phân biệt trả góp đều và gốc đều".
    expect(html).toContain(C.form.methodHelp);
    expect(C.form.methodHelp).toContain("dư nợ còn lại");
    const prose = C.formula.body.join(" ");
    expect(prose).toContain("TRẢ GÓP ĐỀU và TRẢ GỐC ĐỀU");
    expect(prose).toContain("tổng lãi THẤP hơn");
    expect(prose).toContain("không cách nào là “thu lãi trước”");
  });

  it("reports the flat-principal structure when it is chosen", async () => {
    const html = await render({ defaultMethod: "flatPrincipal" });
    const flat = analyseLoan({
      amount: 2_000_000_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      method: "flatPrincipal",
      selectedMonth: 152,
    });
    expect(flat).not.toBeNull();
    if (flat === null) return;
    // Equal principal: the crossover and the halfway point both move.
    expect(html).toContain(`${formatMoney(flat.loan.totalInterest)} ₫`);
    expect(html).toContain("100 tháng");
    expect(html).toContain("120 tháng");
    // And the chart says which structure it drew.
    const C = await copy();
    expect(html).toContain(C.chart.methodFlatPrincipal);
  });
});

describe("the chart answers the selected period", () => {
  it("draws the window around the examined month, with its own table", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.chart.title);
    expect(html).toContain(C.chart.tableCaption);
    expect(html).toContain("<figure");
    // The window's range and the examined month, in the figure's own summary.
    expect(html).toContain("tháng 152 đến 175");
    expect(html).toContain("với tháng 152 được viền đậm");
    // Both axes are titled, since the balance has its own.
    expect(html).toContain("Dư nợ còn lại");
    expect(html).not.toContain("{unit}");
  });

  it("is outside every live region, with exactly one on the page", async () => {
    // docs §4: the examined month is a `live={false}` group and the chart and
    // both tables are outside all of them.
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the route back to the loan being planned", () => {
  it("links to the mortgage tool and says nothing travels with it", async () => {
    const C = await copy();
    const html = await render();
    // `Link` normalises the trailing slash away in the rendered href.
    expect(html).toContain(`href="${LOAN.slug}"`);
    expect(html).toContain(C.form.returnRouteLabel);
    expect(html).toContain(C.form.returnRouteNote);
    expect(C.form.returnRouteNote).toContain("KHÔNG được chuyển sang");
    expect(C.form.returnRouteNote).toContain("không lưu");
  });

  it("puts no financial figure in the link", async () => {
    const html = await render();
    // No query string at all on the return route: not the amount, not the
    // rate, not the month.
    expect(html).toContain(`href="${LOAN.slug}"`);
    expect(html).not.toMatch(/href="[^"]*\?[^"]*amount/);
    expect(html).not.toMatch(/href="[^"]*\?/);
  });

  it("claims no saved or transferred plan anywhere", async () => {
    const strings = JSON.stringify(LOAN_ANALYSIS);
    for (const forbidden of ["Lưu kế hoạch", "đã lưu", "đăng nhập", "tải app"]) {
      expect(strings, forbidden).not.toContain(forbidden);
    }
  });
});
