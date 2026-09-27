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
    // Since the status repair the rows are a VISIBLE block outside the live
    // region (announcement mode); the live region holds only the sentence.
    const live = markupRegion(html, 'data-calc-rows="true"');
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
    const live = markupRegion(html, 'data-calc-rows="true"');
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
    // 1200, not 400: the block now opens with the status word and its icon.
    expect(pinned.slice(0, 1200)).toContain(C.withCarLabel);
    // The same formatted string as the announced row: one rounding of one
    // quantity, not two.
    expect(pinned.slice(0, 1200)).toContain("3.501.182 ₫");
    // Not the result column: no second live region and no chart in the form.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // The FIGURE, not any `<svg>`: the pinned status carries a 16px icon.
    expect(form!).not.toContain("<figure");
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
    // `<figure>` is the chart; an `<svg>` search would now find the status
    // card's icon, which sits above the actions by design.
    expect(result!).toContain("<figure");
    expect(result!.indexOf('data-test="actions"')).toBeLessThan(
      result!.indexOf("<figure"),
    );
    expect(result!.indexOf("<figure")).toBeLessThan(
      result!.indexOf('data-test="next-steps"'),
    );
  });
});

/**
 * The 2026-09-27 semantic result status — the plan's SECOND pilot. The tone
 * is `vehicleBudgetStatus`'s, read from `compareVehicleBudget`'s own flags.
 * The two fixtures are the plan's own observation: running costs of 5 triệu
 * leave −1.498.818 ₫ a month; 2 triệu leave +1.501.182 ₫. Appearance is not
 * checked here.
 */
describe("the semantic result status", () => {
  const status = (html: string) =>
    html.match(/<section data-result-status="([a-z]+)"/)?.[1] ?? null;
  const card = (html: string) => {
    const start = html.indexOf("<section data-result-status=");
    return html.slice(start, html.indexOf("</section>", start));
  };

  it("is a SHORTFALL at running costs of 5 triệu, rounded in the card, exact in the row", async () => {
    const html = await render({ defaultRunning: "5.000.000" });
    expect(status(html)).toBe("shortfall");
    expect(card(html)).toContain(C.statusLabels.shortfall);
    // The plan's own wording: "thiếu khoảng 1,5 triệu mỗi tháng".
    expect(card(html)).toContain("thiếu khoảng 1,5 triệu mỗi tháng");
    // The exact đồng figure stays a row of the primary group.
    const live = markupRegion(html, 'data-calc-rows="true"')!;
    expect(live).toContain("1.498.818 ₫");
    // Priced levers, as jumps to this page's own fields.
    for (const key of ["price", "down", "running"]) {
      expect(card(html)).toContain(`data-calc-jump="${key}"`);
      expect(html).toMatch(new RegExp(`<input[^>]*data-calc-field="${key}"`));
    }
    // A longer term is not offered as a free fix.
    expect(card(html)).not.toContain('data-calc-jump="term"');
    expect(card(html)).toContain("tổng lãi");
  });

  it("is MET at 2 triệu, with the scope stated and no approval implied", async () => {
    const html = await render({ defaultRunning: "2.000.000" });
    expect(status(html)).toBe("met");
    expect(card(html)).toContain("còn khoảng 1,5 triệu mỗi tháng");
    expect(card(html)).toContain("ngoài khoản để dành");
    expect(card(html)).toContain(C.statusMetNote);
  });

  it("is CAUTION on the shipped default, whose running costs are 0", async () => {
    const html = await render();
    expect(status(html)).toBe("caution");
    // The page's existing running-cost notice is the card's reason now.
    expect(card(html)).toContain(C.runningExcludedNotice);
    expect(card(html)).toContain('data-calc-jump="running"');
  });

  it("says a month already short BEFORE the car was short before it", async () => {
    const html = await render({
      defaultEssentials: "36.000.000",
      defaultRunning: "1.000.000",
    });
    expect(status(html)).toBe("shortfall");
    expect(card(html)).toContain("trước khi mua xe");
  });

  it("does not conclude while essentials are blank", async () => {
    const html = await render({ defaultEssentials: "", defaultRunning: "2.000.000" });
    expect(status(html)).toBe("unknown");
    expect(card(html)).toContain(C.statusLabels.unknown);
  });

  it("does not give unconditional loan-term advice on a cash-only purchase", async () => {
    // The real-UI fixture: 400 triệu covered by 300 + 100 triệu, so there is no
    // loan to extend; 12 − 12 triệu running costs = an exact zero.
    const html = await render({
      defaultPrice: "400.000.000",
      defaultDown: "300.000.000",
      defaultTradeIn: "100.000.000",
      defaultRunning: "12.000.000",
    });
    expect(status(html)).toBe("caution");
    expect(card(html)).toContain(C.statusTryShort);
    // The term sentence is conditional on still having an interest-bearing loan.
    expect(C.statusTryShort).toMatch(/Nếu vẫn dùng khoản vay có lãi, kỳ hạn dài hơn/);
    expect(card(html)).not.toContain(". Kỳ hạn dài hơn");
  });

  it("does not conclude a shortfall either while essentials are blank", async () => {
    // The partial figures go negative here, but essentials are essential.
    const html = await render({
      defaultEssentials: "",
      defaultNetIncome: "5.000.000",
      defaultRunning: "2.000.000",
    });
    expect(status(html)).toBe("unknown");
    expect(html).not.toContain('data-result-status="shortfall"');
    expect(html).not.toContain('data-chart-mark="shortfall"');
  });

  it("keeps the without-car month and concludes nothing when the loan cannot be priced", async () => {
    const html = await render({ defaultRate: "-1" });
    expect(status(html)).toBe("unknown");
    const live = markupRegion(html, 'data-calc-rows="true"')!;
    expect(live).toContain("12.000.000 ₫");
  });

  it("announces ONLY the settled sentence: no row sits inside the live region", async () => {
    const html = await render({ defaultRunning: "5.000.000" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(C.withCarLabel);
    expect(live).not.toContain("1.498.818 ₫");
    expect(live).not.toContain(HEADLINE);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // The CTA still lands on the group that holds the rows.
    expect(html).toContain('aria-controls="vay-mua-xe-ket-qua"');
    expect(html).toMatch(/id="vay-mua-xe-ket-qua" tabindex="-1"/);
  });

  it("syncs the pinned summary, and keeps the CTA the brand's button", async () => {
    const html = await render({ defaultRunning: "5.000.000" });
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'), html.indexOf("<button"));
    expect(pinned).toContain('data-result-status="shortfall"');
    expect(pinned).toContain(C.statusLabels.shortfall);
    expect(html).toContain("bg-brand-green-ink");
  });

  it("keeps the settled announcer inside the one live region, empty at load", async () => {
    const html = await render({ defaultRunning: "5.000.000" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toMatch(/data-calc-status-announcement="true"><\/p>/);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(html).not.toContain('role="alert"');
  });

  it("marks only the excess in the figure, and does not flag an input", async () => {
    const html = await render({ defaultRunning: "5.000.000" });
    const figure = html.slice(html.indexOf("<figure"), html.indexOf("</figure>"));
    expect(figure.split('data-chart-mark="shortfall"').length - 1).toBe(1);
    expect(figure).toContain(AUTO_LOAN.chart.shortfallMark);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("stays a car tool: no home-purchase framing in any status copy", () => {
    const copy = Object.entries(C)
      .filter(([key]) => key.startsWith("status"))
      .flatMap(([, value]) =>
        typeof value === "string" ? [value] : Object.values(value as object),
      )
      .join(" ");
    expect(copy.length).toBeGreaterThan(200);
    expect(copy).not.toMatch(/nhà/i);
  });
});
