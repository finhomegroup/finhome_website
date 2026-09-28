/**
 * The 2026-09-27 semantic result status on /cong-cu/kha-nang-mua-nha/, and the
 * optional home the reader is looking at.
 *
 * Every figure asserted is the PRODUCTION engine's, recomputed here from the
 * same inputs, so this compares markup with `computeAffordability` rather
 * than with remembered numbers. Appearance is not checked.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AFFORDABILITY } from "@/content/calculators/affordability";
import { computeAffordability, type AffordabilityInput } from "@/lib/calc/affordability";
import { compactMoney } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/affordability";
const F = AFFORDABILITY.form;
type FormPatch = Partial<Record<keyof typeof F, string>>;

async function render(
  patch?: FormPatch,
  programme: "commercial" | "social-housing" = "commercial",
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/affordability")>(CONTENT);
      return {
        AFFORDABILITY: {
          ...actual.AFFORDABILITY,
          form: { ...actual.AFFORDABILITY.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/affordability-calculator");
    return renderToStaticMarkup(createElement(loaded.AffordabilityCalculator, { programme }));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** The shipped household scenario as the engine reads it. */
const SHIPPED: AffordabilityInput = {
  mode: "household",
  monthlyIncome: 50_000_000,
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  cashReserve: 0,
  purchaseCostPercent: 0,
  assumedMaxLtvPercent: 100,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyHousingCosts: 0,
  housingRatioPercent: 40,
  totalDebtRatioPercent: 50,
};
const rounded = (value: number) => compactMoney(value, CHART_UI.money);
const status = (html: string) =>
  html.match(/<section data-result-status="([a-z]+)"/)?.[1] ?? null;
const card = (html: string) => {
  const start = html.indexOf("<section data-result-status=");
  return html.slice(start, html.indexOf("</section>", start));
};

describe("without a home to compare with", () => {
  it("opens as a REFERENCE range with a caution, because costs and reserve are 0", async () => {
    const html = await render();
    const maxPrice = computeAffordability(SHIPPED)!.maxPrice;
    expect(status(html)).toBe("caution");
    expect(card(html)).toContain(rounded(maxPrice));
    expect(card(html)).toContain(F.purchaseCostsExcludedNotice);
    expect(card(html)).toContain(F.statusNoReserveNote);
    // A range is never announced as "đủ tiền mua nhà".
    expect(html).not.toMatch(/đủ tiền mua nhà/i);
    // The levers are this page's own fields, the advanced one included.
    for (const key of ["purchaseCost", "reserve", "targetPrice"]) {
      expect(card(html)).toContain(`data-calc-jump="${key}"`);
      expect(html).toMatch(new RegExp(`<input[^>]*data-calc-field="${key}"`));
    }
  });

  it("is NEUTRAL, not green, when fully costed", async () => {
    const html = await render({ defaultPurchaseCost: "3", defaultReserve: "100.000.000" });
    expect(status(html)).toBe("unknown");
    expect(card(html)).toContain(F.statusReferenceLabel);
  });

  it("keeps ceiling mode neutral and says it is not a budget", async () => {
    const html = await render({ defaultMode: "ceiling" });
    expect(status(html)).toBe("unknown");
    expect(card(html)).toContain(F.ceilingIsNotBudgetNotice);
  });

  it("names missing cash for the costs as such, and not as a refusal", async () => {
    const html = await render({ defaultDown: "0", defaultPurchaseCost: "5", defaultDebts: "0" });
    expect(status(html)).toBe("shortfall");
    expect(card(html)).toContain(F.statusCashShortTitle);
    expect(card(html)).toContain(F.financingBlockedNotice);
    expect(html).not.toMatch(/từ chối/);
  });

  it("names a negative household month as a cash-flow shortfall", async () => {
    const html = await render({ defaultEssentials: "40.000.000" });
    expect(status(html)).toBe("shortfall");
    expect(card(html)).toContain(F.statusCashflowShortTitle);
  });
});

describe("with the home the reader is looking at", () => {
  it("is a SHORTFALL above the range, and the gap is a price gap, not cash", async () => {
    const html = await render({ defaultTargetPrice: "3.000.000.000" });
    const maxPrice = computeAffordability(SHIPPED)!.maxPrice;
    expect(status(html)).toBe("shortfall");
    expect(card(html)).toContain(rounded(3_000_000_000 - maxPrice));
    expect(card(html)).toContain(F.statusGapNotCashNote);
    // The engine's binding ceiling is the reason given.
    expect(card(html)).toContain(F.statusBindingPayment);
    // The exact gap is a visible row; the live region holds only the sentence.
    const live = markupRegion(html, 'data-calc-rows="true"')!;
    expect(live).toContain(F.targetAboveLabel);
    expect(markupRegion(html, 'data-results-live="true"')!).not.toContain(F.targetAboveLabel);
  });

  it("is CAUTION within the range while costs and reserve are left out", async () => {
    const html = await render({ defaultTargetPrice: "2.000.000.000" });
    expect(status(html)).toBe("caution");
    expect(card(html)).toContain(F.purchaseCostsExcludedNotice);
  });

  it("is MET within a fully costed range, scoped to the reader's assumptions", async () => {
    const html = await render({
      defaultTargetPrice: "2.000.000.000",
      defaultPurchaseCost: "3",
      defaultReserve: "100.000.000",
    });
    expect(status(html)).toBe("met");
    expect(card(html)).toContain(F.statusMetNote);
    const live = markupRegion(html, 'data-calc-rows="true"')!;
    expect(live).toContain(F.targetBelowLabel);
  });

  it("never goes green in ceiling mode", async () => {
    const html = await render({ defaultMode: "ceiling", defaultTargetPrice: "1.000.000.000" });
    expect(status(html)).toBe("unknown");
  });

  it("flags an invalid target as a FIELD error and keeps the range", async () => {
    const html = await render({ defaultTargetPrice: "0" });
    expect(status(html)).toBe("unknown");
    expect(html).toMatch(/<input[^>]*aria-invalid="true"[^>]*data-calc-field="targetPrice"|<input[^>]*data-calc-field="targetPrice"[^>]*aria-invalid="true"/);
    expect(html).toContain(F.targetInvalid);
    const maxPrice = computeAffordability(SHIPPED)!.maxPrice;
    expect(html).toContain(rounded(maxPrice));
  });

  it("draws the comparison figure with the excess marked, and syncs the pinned summary", async () => {
    const html = await render({ defaultTargetPrice: "3.000.000.000" });
    expect(html).toContain(AFFORDABILITY.targetChart.title);
    expect(html).toContain('data-chart-mark="shortfall"');
    // Up to the CTA's own button: the learning panel above the form has
    // buttons of its own, so the first `<button>` on the page is not the bound.
    const pinnedAt = html.indexOf('data-calc-answer="true"');
    const pinned = html.slice(pinnedAt, html.indexOf("<button", pinnedAt));
    expect(pinned).toContain('data-result-status="shortfall"');
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(markupRegion(html, 'data-results-live="true"')!).toContain(
      'data-calc-status-announcement="true"',
    );
  });

  it("does not draw the comparison figure without a target", async () => {
    const html = await render();
    expect(html).not.toContain(AFFORDABILITY.targetChart.title);
  });
});

describe("precedence on the rendered page (Codex repair 2)", () => {
  /** The visible rows block, where the reference-price rows live. */
  const rows = (html: string) => markupRegion(html, 'data-calc-rows="true"')!;

  it("labels loan and payment as AT THE MAXIMUM REFERENCE PRICE once a target is entered", async () => {
    const html = await render({
      defaultTargetPrice: "2.000.000.000",
      defaultPurchaseCost: "3",
      defaultReserve: "100.000.000",
    });
    const block = rows(html);
    expect(block).toContain(F.maxLoanAtRangeLabel);
    expect(block).toContain(F.expectedPaymentAtRangeLabel);
    expect(block).not.toContain(`>${F.maxLoanLabel}<`);
    expect(block).not.toContain(`>${F.expectedPaymentLabel}<`);
    // The explanation is visible and comes BEFORE the first figure.
    expect(block).toContain(F.targetRowsNote);
    expect(block.indexOf(F.targetRowsNote)).toBeLessThan(block.indexOf(F.maxPriceLabel));
  });

  it("keeps the original labels, and no note, without a target", async () => {
    const block = rows(await render());
    expect(block).toContain(`>${F.maxLoanLabel}<`);
    expect(block).toContain(`>${F.expectedPaymentLabel}<`);
    expect(block).not.toContain(F.targetRowsNote);
  });

  it("concludes nothing above an incomplete range", async () => {
    const html = await render({ defaultEssentials: "", defaultTargetPrice: "3.000.000.000" });
    expect(status(html)).toBe("unknown");
    expect(card(html)).toContain(F.statusLimitedTitle);
  });

  it("renders an exact-zero month as no headroom, not as a shortfall", async () => {
    const html = await render({
      defaultBuffer: "21.000.000",
      defaultTargetPrice: "500.000.000",
    });
    expect(status(html)).toBe("caution");
    expect(card(html)).toContain(F.statusNoHeadroomTitle);
    expect(card(html)).not.toContain(F.statusCashflowShortTitle);
  });

  it("keeps the entered savings in the zero-headroom wording, with no borrowing advice", async () => {
    // The real-UI fixture: 26 − 18 − 5 − 3 = 0 after the 3 triệu saving.
    const html = await render({
      defaultNetIncome: "26.000.000",
      defaultEssentials: "18.000.000",
      defaultDebts: "5.000.000",
      defaultBuffer: "3.000.000",
      defaultDown: "600.000.000",
      defaultReserve: "100.000.000",
      defaultPurchaseCost: "3",
      defaultTargetPrice: "100.000.000",
    });
    expect(status(html)).toBe("caution");
    expect(card(html)).toContain(F.statusNoHeadroomNote);
    // The saving already entered is still being kept — only the EXTRA is 0.
    expect(F.statusNoHeadroomNote).toContain("khoản để dành bạn đã nhập vẫn được giữ");
    expect(html).not.toContain("không còn khoảng đệm nào trong tháng");
    // The infeasible notice ("…vay ít hơn") is neither in the card nor below.
    expect(html).not.toContain(F.infeasibleNotice);
  });
});

describe("the second route onto this component is NOT part of the pilot (NOXH)", () => {
  it("renders nha-o-xa-hoi with no status card and no target field", async () => {
    const html = await render(undefined, "social-housing");
    expect(html).not.toContain("data-result-status");
    expect(html).not.toContain('data-calc-field="targetPrice"');
    expect(html).not.toContain("data-calc-status-announcement");
    expect(html).toContain(`>${F.maxLoanLabel}<`);
    expect(html).not.toContain(F.targetRowsNote);
  });
});
