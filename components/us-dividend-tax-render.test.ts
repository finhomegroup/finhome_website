/**
 * Rendered-markup contracts for `/cong-cu/thue-co-tuc/` — plan row 45.
 *
 * WHAT THE ROW ASKED FOR: "Ưu tiên tổng thuế và số còn lại; đưa chi tiết phụ
 * thu vào disclosure." Before this pass the route had no `CalculatorLayout`, no
 * CTA and no emphasised answer; the effective rate sat between the two figures
 * the row wants first; and the four surcharge rows plus a nine-line bracket
 * guide were printed in full under an eight-row breakdown.
 *
 * WHAT MUST NOT CHANGE, and is asserted here: `computeUsDividendTax` is
 * untouched, USD keeps cents, and the statutory NIIT threshold keeps its
 * no-cents grammar.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_DIVIDEND_TAX } from "@/content/calculators/us-dividend-tax";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { computeUsDividendTax } from "@/lib/calc/us-dividend-tax";

const CONTENT_PATH = "@/content/calculators/us-dividend-tax";

const FORM_ID = "thue-co-tuc-nhap";
const RESULT_ID = "thue-co-tuc-ket-qua";

const F = US_DIVIDEND_TAX.form;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(
  defaults?: Partial<Record<keyof typeof F.defaults, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_DIVIDEND_TAX: typeof US_DIVIDEND_TAX;
      };
      return {
        US_DIVIDEND_TAX: {
          ...actual.US_DIVIDEND_TAX,
          form: {
            ...actual.US_DIVIDEND_TAX.form,
            defaults: { ...actual.US_DIVIDEND_TAX.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/us-dividend-tax-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(createElement(loaded.UsDividendTaxCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

describe("row 45 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the two-column split the row asked for", async () => {
    const html = await render();
    expect(html).toContain("lg:col-span-2");
    expect(html).toContain("lg:grid-cols-5");
  });

  it("puts the CTA in the form region, naming the answer", async () => {
    const html = await render();
    const form = html.slice(
      html.indexOf(`id="${FORM_ID}"`),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
    expect(form).toContain(`aria-controls="${RESULT_ID}"`);
    expect(html).toContain(TOOL_SHELL.cta.autoNote);
  });

  it("pins a short current answer, this form being a long one", async () => {
    // CORRECTED; the reason and the shelf-wide pinned / unpinned table are in
    // `components/u-long-form-cta.test.ts`. Six controls in three groups is
    // the boundary case on this shelf — the shortest form that pins.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("leads with the total tax, then what is left, then the rate", async () => {
    const html = await render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    expect(result.indexOf(F.totalTaxLabel)).toBeLessThan(
      result.indexOf(F.afterTaxLabel),
    );
    expect(result.indexOf(F.afterTaxLabel)).toBeLessThan(
      result.indexOf(F.effectiveRateLabel),
    );
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(html).toContain("1.980,00 USD");
    expect(html).toContain("10.020,00 USD");
    expect(html).toContain("16,50%");
  });

  it("keeps what the classification is worth in the primary column", async () => {
    // The page's whole subject. It is not reference material and must not go
    // behind a summary with the surcharge rows.
    const html = await render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    expect(result).toContain(F.savingLabel);
    expect(result).toContain("900,00 USD");
    expect(result).toContain("2.880,00 USD");
  });
});

describe("the surcharge and the bracket table are disclosed", () => {
  it("puts the four surcharge rows behind their own summary", async () => {
    const html = await render();
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));
    expect(detail).toContain(F.niitDisclosureTitle);
    expect(detail).toContain(F.thresholdLabel);
    expect(detail).toContain(F.niitBaseLabel);
    // The statutory threshold, at its own grammar.
    expect(detail).toContain("200.000 USD");
    expect(count(detail, "<details")).toBe(2);
  });

  it("keeps the year limit visible but the five brackets disclosed", async () => {
    const html = await render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    // Visible beside the answer: the year, the check date and the reason the
    // tool does not pick the rate for you.
    expect(result).toContain(F.thresholdGuide);
    expect(result).toContain("năm thuế 2025");
    expect(result).toContain("16/09/2026");
    // Disclosed: the table itself.
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));
    expect(detail).toContain(F.thresholdGuideDetailTitle);
    expect(detail).toContain("48.350");
    expect(detail).toContain("600.050");
    expect(result).not.toContain("48.350");
  });
});

describe("the surcharge state is named beside the answer it changes", () => {
  it("says the surcharge applied, above the threshold", async () => {
    const r = computeUsDividendTax({
      qualifiedDividends: 10000,
      ordinaryDividends: 2000,
      qualifiedRatePercent: 15,
      ordinaryRatePercent: 24,
      modifiedAgi: 250000,
      status: "single",
      applyNiit: true,
    });
    if (r === null) throw new Error("the engine refused a valid case");
    expect(r.aboveNiitThreshold).toBe(true);
    expect(r.niitTax).toBe(456);

    const html = await render({ magi: "250.000" });
    expect(html).toContain(F.aboveThresholdNotice);
    expect(html).toContain("2.436,00 USD");
    expect(html).toContain("20,30%");
    // In the primary column, not inside the disclosure that holds the rows.
    expect(html.indexOf(F.aboveThresholdNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
    // The base is the LESSER of investment income and the excess: 12.000, not
    // the 50.000 of MAGI excess.
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));
    expect(detail).toContain("50.000,00 USD");
    expect(detail).toContain("12.000,00 USD");
    expect(detail).toContain("456,00 USD");
  });

  it("keeps that notice away from a filer below the threshold", async () => {
    expect(await render()).not.toContain(F.aboveThresholdNotice);
  });

  it("explains the blank rate when there is no dividend at all", async () => {
    // A VALID zero: nothing is flagged and only the rate row is missing.
    const html = await render({ qualified: "0", ordinary: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain(F.noDividendNotice);
    expect(html).toContain("0,00 USD");
  });

  it("withholds every figure on an unusable rate, and says why", async () => {
    const html = await render({ ordinaryRate: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain("1.980,00 USD");
    expect(html).not.toContain(F.noDividendNotice);
  });
});
