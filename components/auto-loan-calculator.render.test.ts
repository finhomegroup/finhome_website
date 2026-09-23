/**
 * Layout contracts for /cong-cu/vay-mua-xe/ — audit row 33, "Ưu tiên ngân
 * sách tháng còn lại sau khi mua xe; kết quả khoản vay xe là phần giải thích
 * đi kèm."
 *
 * The behavioural contracts — the field gates, the withheld with-car leg, the
 * shortfall wording, the phone-readable table — are
 * `auto-loan-calculator.test.ts`'s and are untouched. THIS file only pins the
 * inversion: which figure is the answer, which group announces, and where the
 * loan's own seven figures went.
 *
 * WHAT IT CANNOT: appearance, and whether eleven inputs in one column read as
 * one form at a phone width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";

const CONTENT = "@/content/calculators/auto-loan";

type FormPatch = Partial<Record<keyof typeof AUTO_LOAN.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/auto-loan")
      >(CONTENT);
      return {
        AUTO_LOAN: {
          ...actual.AUTO_LOAN,
          form: { ...actual.AUTO_LOAN.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/auto-loan-calculator");
    return renderToStaticMarkup(
      createElement(loaded.AutoLoanCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = AUTO_LOAN.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the month after the car is the answer", () => {
  it("emphasises the with-car residual and nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.withCarLabel);
    // The shipped example: 12.000.000 ₫ before, 3.501.182 ₫ after.
    expect(live!).toContain("3.501.182 ₫");
    expect(live!).toContain("12.000.000 ₫");
    expect(live!).toContain(C.gapLabel);
  });

  it("announces the budget group, and only it", async () => {
    const html = await render();
    // `ResultGroup` renders its `h2` OUTSIDE the live div — the region is the
    // rows — so the title is checked against the whole result column, and the
    // group is identified by the anchor the CTA was given.
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain(C.budgetTitle);
    expect(html).toContain('id="vay-mua-xe-ket-qua-title"');
    // The loan group used to be the live one. Exactly one region, still.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(result!).not.toContain(C.resultTitle);
  });

  it("does not announce the instalment as a figure of its own", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    // The instalment's own label and row are gone from the announcement.
    // Its VALUE, 8.498.818 ₫, still appears — at these defaults it is also
    // the before/after gap, because the running costs are zero. That is the
    // same number arrived at from the household side, not the loan row.
    expect(live!).not.toContain(C.monthlyLabel);
    expect(live!).not.toContain(C.financedLabel);
    expect(live!).not.toContain(C.totalInterestLabel);
  });

  it("keeps the shortfall row and its wording beside the answer", async () => {
    const html = await render({ defaultNetIncome: "30.000.000" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.shortfallLabel);
    expect(live!).toContain("6.498.818 ₫");
    expect(html).toContain(C.shortfallNotice);
    expect(html.indexOf(C.shortfallNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("the loan result became the explanation", () => {
  it("keeps all seven loan figures, unannounced, in the detail band", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.resultTitle);
    for (const label of [
      C.financedLabel,
      C.downPercentLabel,
      C.monthlyLabel,
      C.totalInterestLabel,
      C.totalPaymentLabel,
      C.totalCostLabel,
      C.termResultLabel,
    ]) {
      expect(detail!, `detail lost "${label}"`).toContain(label);
    }
    expect(detail!).toContain("8.498.818 ₫");
    // And the two ledger components that explain how it reaches the month.
    expect(detail!).toContain(C.committedLabel);
    expect(detail!).toContain(C.vehicleCostLabel);
  });

  it("keeps the total's scope beside the total, not only in the FAQ", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.totalCostHelp);
    expect(detail!.indexOf(C.totalCostLabel)).toBeLessThan(
      detail!.indexOf(C.totalCostHelp),
    );
  });

  it("keeps the yearly schedule full width, below both columns", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(AUTO_LOAN.table.caption);
    // The result column carries the chart, which has its own accessible data
    // table, so the assertion is on the SCHEDULE — not on `<table`.
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).not.toContain(AUTO_LOAN.table.caption);
    expect(result!).not.toContain(AUTO_LOAN.table.balanceColumn);
  });
});

describe("the layout wiring", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="vay-mua-xe-nhap" data-calc-region="form"');
    expect(html).toContain('id="vay-mua-xe-ket-qua"');
    expect(html).toContain('aria-controls="vay-mua-xe-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("keeps a compact current answer with the long form", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    // The pinned CTA block, carrying the ONE answer — and only it.
    expect(form!).toContain("fh-cta-pin");
    expect(html).toContain('aria-hidden="true" data-calc-answer="true"');
    expect(html.split('data-calc-answer="true"').length - 1).toBe(1);
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
    expect(pinned.slice(0, 400)).toContain(C.withCarLabel);
    // The same formatted string as the announced row: one rounding of one
    // quantity, not two.
    expect(pinned.slice(0, 400)).toContain("3.501.182 ₫");
    // Not the result column: no second live region and no chart in the form.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(form!).not.toContain("<svg");
  });

  it("puts every input in the form region, household fields included", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).toContain(C.vehicleGroup);
    expect(form!).toContain(C.loanGroup);
    // These five used to sit BELOW the loan result.
    expect(form!).toContain(C.householdGroup);
    expect(form!).toContain(C.netIncomeLabel);
    expect(form!).toContain(C.essentialsLabel);
    expect(form!).toContain(C.otherDebtsLabel);
    expect(form!).toContain(C.reserveLabel);
    expect(form!).toContain(C.runningLabel);
    // The trade-in disclosure came along, still opening on an active value.
    expect(form!).toContain(C.tradeInGroup);
    expect(form!).toContain("<details open");
  });

  it("puts the chart beside the answer and the actions above it", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain("<svg");
    expect(result!.indexOf('data-test="actions"')).toBeLessThan(
      result!.indexOf("<svg"),
    );
    expect(result!.indexOf("<svg")).toBeLessThan(
      result!.indexOf('data-test="next-steps"'),
    );
  });
});
