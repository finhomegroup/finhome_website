/**
 * Rendered-markup contracts for /cong-cu/cac-chi-so-tai-chinh/ — audit row 67,
 * "Chia báo cáo thành nhóm; giữ ba chỉ số chính bên phải, bảng chi tiết chiếm
 * toàn chiều rộng phía dưới", at "Theo nhóm + kết quả".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the eighteen fields stay in four named
 * groups inside the form region, that exactly the three promoted ratios are the
 * one live region with ROE emphasised and pinned, that the derived statement
 * and the twenty-row table moved to the full-width band, and that the
 * not-applicable dash and the negative-equity and invalid refusals survived the
 * move.
 *
 * THE ARITHMETIC IS `lib/calc/financials.test.ts`'s and the parser choice is
 * `components/financial-ratios-calculator.test.ts`'s. The figures pinned here
 * are the ones `content/calculators/financial-ratios.ts` already documents for
 * the prefilled statement (ROE 19,2%, biên thuần 9,6%, thanh toán hiện hành
 * 2,0, lợi nhuận gộp 400 tỷ), repeated as the runtime baseline this change must
 * not move.
 *
 * WHAT IT CANNOT: appearance. Whether the split reads at a stated width is
 * Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { PLACEHOLDER } from "@/lib/calc/number";
import { FINANCIAL_RATIOS } from "@/content/calculators/financial-ratios";

const CONTENT = "@/content/calculators/financial-ratios";
const C = FINANCIAL_RATIOS;
const F = C.form;
const T = F.ratioTable;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

// `Record<…, string>`, not `Partial<typeof F.defaults>`: the content file is
// `as const`, so the derived type would only accept each key's SHIPPED value.
type Patch = {
  defaults?: Partial<Record<keyof typeof F.defaults, string>>;
  defaultShares?: string;
  defaultPrice?: string;
};

async function render(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<
          typeof import("@/content/calculators/financial-ratios")
        >(CONTENT);
      const { defaults, ...rest } = patch;
      return {
        FINANCIAL_RATIOS: {
          ...actual.FINANCIAL_RATIOS,
          form: {
            ...actual.FINANCIAL_RATIOS.form,
            ...rest,
            defaults: {
              ...actual.FINANCIAL_RATIOS.form.defaults,
              ...defaults,
            },
          },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/financial-ratios-calculator");
    return renderToStaticMarkup(
      createElement(loaded.FinancialRatiosCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("the ratios are beside the statement", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="cac-chi-so-tai-chinh-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="cac-chi-so-tai-chinh-ket-qua"');
    expect(html).toContain('aria-controls="cac-chi-so-tai-chinh-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps all four input groups in the form, in order", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [
      C.statement.incomeGroup,
      C.statement.assetGroup,
      C.statement.liabilityGroup,
      F.shareGroup,
    ].map((title) => form!.indexOf(title));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    // All thirteen statement lines plus the two share fields, none stranded
    // in the result column.
    expect(form).toContain(C.statement.lines.revenue.label);
    expect(form).toContain(C.statement.lines.otherNonCurrentLiabilities.label);
  });
});

describe("the three promoted ratios are the answer", () => {
  it("emphasises ROE, and only it, at the head of the one live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(F.roeLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // Exactly the three the row names — the ten derived statement lines did
    // not follow them into the announced group.
    expect(rows(live!)).toBe(3);
    expect(live).not.toContain(F.grossProfitLabel);
  });

  it("pins the same ROE string the emphasised row renders", async () => {
    const html = await render();
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta).not.toBeNull();
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).toContain(F.roeLabel);
    expect(cta!).toContain("19,20%");
    expect(markupRegion(html, 'data-results-live="true"')!).toContain("19,20%");
  });

  it("keeps the margin and the current ratio as support", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("9,60%");
    expect(live).toContain(`2,00 ${T.units.times}`);
  });
});

describe("the working is the full-width band", () => {
  it("moves the derived statement and the twenty rows below", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.statementTitle);
    expect(detail).toContain(T.caption);
    // Lợi nhuận gộp 400 tỷ and vốn chủ 500 tỷ, per the content file's header.
    expect(detail).toContain("400.000.000.000 ₫");
    expect(detail).toContain("500.000.000.000 ₫");
    // One of each ratio group's names, so the table itself is the band's.
    expect(detail).toContain(T.names.interestCoverage);
    expect(detail).toContain(T.names.priceToBook);

    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("<table");
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain(T.caption);
  });

  it("still prints the valuation block only when asked for", async () => {
    const withShares = await render();
    expect(markupRegion(withShares, 'data-calc-region="detail"')!).toContain(
      "20,83",
    );

    // Blank shares and price mean "skip the block", not "invalid".
    const without = await render({ defaultShares: "", defaultPrice: "" });
    expect(without).not.toContain('aria-invalid="true"');
    const detail = markupRegion(without, 'data-calc-region="detail"')!;
    expect(detail).toContain(T.names.priceToEarnings);
    expect(detail).toContain(PLACEHOLDER);
    expect(detail).not.toContain("20,83");
  });

  it("still shows a dash rather than an infinity for a zero denominator", async () => {
    const html = await render({ defaults: { interestExpense: "0" } });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    const row = detail.slice(detail.indexOf(T.names.interestCoverage));
    expect(row).toContain(PLACEHOLDER);
  });
});

describe("the preserved refusals", () => {
  it("keeps the negative-equity warning beside the ROE it invalidates", async () => {
    // Nợ dài hạn 900 tỷ on 900 tỷ of assets: tổng nợ 1.200 tỷ, vốn chủ âm.
    const html = await render({
      defaults: { longTermDebt: "900.000.000.000" },
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.negativeEquityNotice);
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).not.toContain(F.negativeEquityNotice);
  });

  it("blames the offending line and withholds every ratio", async () => {
    const html = await render({ defaults: { inventory: "-1" } });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(C.statement.lines.inventory.label);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.invalidNotice);
    // The table disappears; the derived-statement group stays as placeholders.
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.statementTitle);
    expect(detail).not.toContain(T.caption);
  });

  it("refuses a bad share count without blaming the statement", async () => {
    const html = await render({ defaultShares: "-1" });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(F.sharesInvalid);
    // `invalidNotice` names a bad STATEMENT line, and no statement line is
    // bad here, so it must stay absent — the share field's own error is the
    // whole explanation. Preserved from before the layout change.
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain(F.invalidNotice);
    expect(result).toContain(PLACEHOLDER);
  });
});
