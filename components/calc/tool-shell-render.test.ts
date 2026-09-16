/**
 * Rendered contracts for the browser findings, across all five core tools.
 *
 * WHAT THESE DO AND DO NOT PROVE. Codex exercised the running UI in a browser
 * and measured, on a 390×844 viewport, the mortgage page's first input at
 * document y 1067,5 px and its chart at 4030,25 px. These tests cannot measure
 * pixels — there is no browser here — so they assert the ORDER and the
 * COLLAPSE that the pixel numbers were a symptom of:
 *
 *   short purpose → core inputs → one clear answer → chart → next step,
 *   with detail ledgers, year tables and long prose behind disclosures.
 *
 * Document order and disclosure state are checkable and they are the part
 * under this file's control. The resulting pixel offsets are NOT verified here
 * and must be re-measured in a browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function render<T extends Record<string, unknown>>(
  componentPath: string,
  componentName: string,
  contentPath: string,
  contentExport: string,
  patch?: (actual: T) => Partial<T>,
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as Record<string, T>;
      const original = actual[contentExport];
      return { [contentExport]: { ...original, ...patch(original) } };
    });
  }
  try {
    const loaded = (await import(componentPath)) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded[componentName]));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const TOOLS = [
  {
    name: "vay-mua-nha",
    componentPath: "@/components/loan-calculator",
    componentName: "LoanCalculator",
    contentPath: "@/content/calculators/loan",
    contentExport: "LOAN",
  },
  {
    name: "kha-nang-mua-nha",
    componentPath: "@/components/affordability-calculator",
    componentName: "AffordabilityCalculator",
    contentPath: "@/content/calculators/affordability",
    contentExport: "AFFORDABILITY",
  },
  {
    name: "lai-suat-tha-noi",
    componentPath: "@/components/floating-loan-calculator",
    componentName: "FloatingLoanCalculator",
    contentPath: "@/content/calculators/floating-loan",
    contentExport: "FLOATING_LOAN",
  },
  {
    name: "muc-tieu-tiet-kiem",
    componentPath: "@/components/savings-goal-calculator",
    componentName: "SavingsGoalCalculator",
    contentPath: "@/content/calculators/savings-goal",
    contentExport: "SAVINGS_GOAL",
  },
  {
    name: "so-sanh-khoan-vay",
    componentPath: "@/components/loan-compare-calculator",
    componentName: "LoanCompareCalculator",
    contentPath: "@/content/calculators/loan-compare",
    contentExport: "LOAN_COMPARE",
  },
] as const;

describe.each(TOOLS)(
  "$name — W02 shell, consistently",
  ({ componentPath, componentName, contentPath, contentExport }) => {
    const html = () =>
      render(componentPath, componentName, contentPath, contentExport);

    it("labels the prefilled state as an example", async () => {
      const markup = await html();
      expect(markup).toContain("Ví dụ mẫu");
      // And offers no reset until something has been changed — there is
      // nothing to reset to.
      expect(markup).not.toContain("Về lại ví dụ mẫu");
    });

    it("collapses at least one panel of optional input or detail", async () => {
      const markup = await html();
      expect((markup.match(/<details/g) ?? []).length).toBeGreaterThanOrEqual(1);
    });

    it("puts the inputs before the answer, and the answer before the chart", async () => {
      const markup = await html();
      const firstInput = markup.indexOf("<input");
      const firstResult = markup.indexOf('data-results-live="true"');
      const firstChart = markup.indexOf("<figure");

      expect(firstInput).toBeGreaterThan(-1);
      expect(firstResult).toBeGreaterThan(firstInput);
      expect(firstChart).toBeGreaterThan(firstResult);
    });

    it("puts the chart before any year table or detail ledger", async () => {
      // The browser finding: "Chart should not be buried under full detail
      // ledger and repeated paragraphs."
      const markup = await html();
      const firstChart = markup.indexOf("<figure");
      const detailLedger = markup.indexOf("Xem chi tiết");
      const firstTable = markup.indexOf("<table");

      expect(firstChart).toBeGreaterThan(-1);
      if (detailLedger > -1) expect(detailLedger).toBeGreaterThan(firstChart);
      // The only tables allowed before the chart are a chart's own accessible
      // data table, which sits inside the figure.
      if (firstTable > -1 && firstTable < firstChart) {
        throw new Error("a table renders before the first chart");
      }
    });

    it("keeps exactly one live results region", async () => {
      const markup = await html();
      expect((markup.match(/data-results-live="true"/g) ?? []).length).toBe(1);
    });

    it("shows a value, never a bare dash, in the live region at the defaults", async () => {
      // The browser finding, generalised: a `ResultRow` with a null value
      // still renders its label, so an optional row shows "—" beside a figure
      // the tool actually knows. No row inside the live region may do that at
      // the shipped defaults.
      const markup = await html();
      const liveStart = markup.indexOf('data-results-live="true"');
      const liveBlock = markup.slice(liveStart, markup.indexOf("</div></div>", liveStart));
      expect(liveBlock).not.toContain("—");
    });
  },
);

describe("the mortgage default state", () => {
  const loan = (defaultExtra?: string) =>
    render(
      "@/components/loan-calculator",
      "LoanCalculator",
      "@/content/calculators/loan",
      "LOAN",
      defaultExtra === undefined
        ? undefined
        : (actual: Record<string, unknown>) => ({
            form: {
              ...(actual.form as Record<string, unknown>),
              defaultExtra,
            },
          }),
    );

  it("shows the monthly total as a figure, not a dash", async () => {
    // The reported defect: with no extra payment both the extra row AND the
    // total showed "—", although the total was known to be 17.356.465 ₫.
    const markup = await loan();
    expect(markup).toContain("17.356.465 ₫");
    // The optional extra row is not mounted at all rather than mounted empty.
    expect(markup).not.toContain("Bạn trả thêm vào gốc");
    // And the total row is present with a value.
    expect(markup).toContain("Tổng tiền ra khỏi ví mỗi tháng");
  });

  it("mounts the extra row only once there is an extra payment", async () => {
    const markup = await loan("2.000.000");
    expect(markup).toContain("Bạn trả thêm vào gốc");
    expect(markup).toContain("19.356.465 ₫");
  });

  it("headlines the real payment when the loan clears in one month", async () => {
    // "tiny one-month payoff must headline actual capped outflow, not a
    // fictitious full month". 100 triệu at 8,5% with a 500 triệu extra clears
    // in month 1: 100.000.000 + 708.333 of interest.
    const markup = await render(
      "@/components/loan-calculator",
      "LoanCalculator",
      "@/content/calculators/loan",
      "LOAN",
      (actual: Record<string, unknown>) => ({
        form: {
          ...(actual.form as Record<string, unknown>),
          defaultAmount: "100.000.000",
          defaultExtra: "500.000.000",
        },
      }),
    );
    expect(markup).toContain("Tổng tiền ra khỏi ví (trả một lần)");
    expect(markup).toContain("100.708.333 ₫");
    // The fictitious full month — instalment plus the whole 500 triệu extra —
    // must not be the headline.
    expect(markup).not.toContain("Tổng tiền ra khỏi ví mỗi tháng");
  });
});

describe("the affordability financing envelope, as rendered", () => {
  const afford = (patch?: Record<string, string>) =>
    render(
      "@/components/affordability-calculator",
      "AffordabilityCalculator",
      "@/content/calculators/affordability",
      "AFFORDABILITY",
      patch === undefined
        ? undefined
        : (actual: Record<string, unknown>) => ({
            form: { ...(actual.form as Record<string, unknown>), ...patch },
          }),
    );

  it("explains an infeasible purchase instead of drawing a contradiction", async () => {
    // The reported case: no cash and a 5% cost rate produced a 4,8 tỷ loan bar
    // beside a 4,571 tỷ price summary, with the negative equity segment hidden.
    const markup = await afford({
      defaultDown: "0",
      defaultPurchaseCost: "5",
      defaultDebts: "0",
    });
    const { AFFORDABILITY } = await vi.importActual<
      typeof import("@/content/calculators/affordability")
    >("@/content/calculators/affordability");

    expect(markup).toContain(AFFORDABILITY.form.financingBlockedNotice);
    expect(markup).toContain(AFFORDABILITY.priceChart.blockedRecovery);
    // And the price chart draws nothing rather than a loan bar bigger than
    // its own price.
    expect(markup).not.toContain("4.571");
  });

  it("says the cash is the constraint when it is, not the income", async () => {
    const markup = await afford({
      defaultDown: "100.000.000",
      defaultPurchaseCost: "5",
    });
    const { AFFORDABILITY } = await vi.importActual<
      typeof import("@/content/calculators/affordability")
    >("@/content/calculators/affordability");
    expect(markup).toContain(AFFORDABILITY.form.financingBoundNotice);
  });

  it("treats a cleared expenses field as unknown, on the page", async () => {
    const markup = await afford({ defaultEssentials: "" });
    const { AFFORDABILITY } = await vi.importActual<
      typeof import("@/content/calculators/affordability")
    >("@/content/calculators/affordability");
    expect(markup).toContain(AFFORDABILITY.form.essentialsUnknownNotice);
  });

  it("does not claim a limited conclusion at the complete defaults", async () => {
    const markup = await afford();
    const { AFFORDABILITY } = await vi.importActual<
      typeof import("@/content/calculators/affordability")
    >("@/content/calculators/affordability");
    expect(markup).not.toContain(AFFORDABILITY.form.essentialsUnknownNotice);
  });

  it("keeps capacity, loan used and the binding constraint as separate rows", async () => {
    const markup = await afford();
    const { AFFORDABILITY } = await vi.importActual<
      typeof import("@/content/calculators/affordability")
    >("@/content/calculators/affordability");
    expect(markup).toContain(AFFORDABILITY.form.paymentSupportedLoanLabel);
    expect(markup).toContain(AFFORDABILITY.form.maxLoanUsedLabel);
    expect(markup).toContain(AFFORDABILITY.form.priceBindingLabel);
  });
});

describe("the comparison tool starts with two offers", () => {
  const compare = () =>
    render(
      "@/components/loan-compare-calculator",
      "LoanCompareCalculator",
      "@/content/calculators/loan-compare",
      "LOAN_COMPARE",
    );

  it("renders A and B in the primary flow and C behind a disclosure", async () => {
    const markup = await compare();
    const { LOAN_COMPARE } = await vi.importActual<
      typeof import("@/content/calculators/loan-compare")
    >("@/content/calculators/loan-compare");

    const aAt = markup.indexOf(LOAN_COMPARE.form.optionLabels[0]);
    const bAt = markup.indexOf(LOAN_COMPARE.form.optionLabels[1]);
    const thirdPanelAt = markup.indexOf(LOAN_COMPARE.form.thirdOptionTitle);

    expect(aAt).toBeGreaterThan(-1);
    expect(bAt).toBeGreaterThan(aAt);
    expect(thirdPanelAt).toBeGreaterThan(bAt);
    // The third option's panel is closed, and says so.
    expect(markup).toContain(LOAN_COMPARE.form.thirdOptionUnused);
  });

  it("preserves the third option's fields rather than removing them", async () => {
    // "preserved optional third": the inputs still exist, so whatever is typed
    // survives the panel being collapsed again.
    const markup = await compare();
    // Seven fields per offer — rate, term, percent fee, one-off fee,
    // settlement fee, promo months, promo rate — across three offers, plus
    // the shared amount and the common horizon. Counted on
    // `inputMode="decimal"`, which is `NumberField`'s own signature: a bare
    // `<input` count also picks up the checkbox each readable table renders
    // to switch its precision, and that is chrome, not a field the form has
    // to preserve.
    expect((markup.match(/inputMode="decimal"/g) ?? []).length).toBe(23);
  });

  it("compares the two offers it does have", async () => {
    const markup = await compare();
    const { LOAN_COMPARE } = await vi.importActual<
      typeof import("@/content/calculators/loan-compare")
    >("@/content/calculators/loan-compare");
    // A at 8,5% beats B at 9,2% on cost of borrowing over the same term.
    expect(markup).toContain(LOAN_COMPARE.form.bestLabel);
    expect(markup).toContain(LOAN_COMPARE.form.optionLabels[0]);
    // Two bars, not three.
    expect(markup).not.toContain(LOAN_COMPARE.form.thirdOptionUsed);
  });

  it("opens the third panel and prices three offers once it is filled", async () => {
    const markup = await render(
      "@/components/loan-compare-calculator",
      "LoanCompareCalculator",
      "@/content/calculators/loan-compare",
      "LOAN_COMPARE",
      (actual: Record<string, unknown>) => ({
        form: {
          ...(actual.form as Record<string, unknown>),
          defaults: [
            { rate: "8,5", term: "20", fee: "0" },
            { rate: "9,2", term: "20", fee: "0" },
            { rate: "8,5", term: "25", fee: "1" },
          ],
        },
      }),
    );
    const { LOAN_COMPARE } = await vi.importActual<
      typeof import("@/content/calculators/loan-compare")
    >("@/content/calculators/loan-compare");
    expect(markup).toContain(LOAN_COMPARE.form.thirdOptionUsed);
    // A `<details open>` — the panel opens itself for a reader who filled it.
    expect(markup).toMatch(/<details open=""/);
  });
});
