/** Rendered contracts for /cong-cu/giam-gia-va-thue/'s price-tag path. No appearance checked. */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PRICE_ADJUST } from "@/content/calculators/price-adjust";
import { PRICE_ADJUST_LEARNING as L } from "@/content/calculators/price-adjust-learning";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/price-adjust";

async function page(form: Partial<Record<keyof (typeof PRICE_ADJUST)["form"], string>> = {}): Promise<string> {
  vi.resetModules();
  vi.doMock(CONTENT, async () => {
    const actual = (await vi.importActual(CONTENT)) as { PRICE_ADJUST: typeof PRICE_ADJUST };
    return { PRICE_ADJUST: { ...actual.PRICE_ADJUST, form: { ...actual.PRICE_ADJUST.form, ...form } } };
  });
  try {
    const { PriceAdjustCalculator } = await import("@/components/price-adjust-calculator");
    return renderToStaticMarkup(createElement(PriceAdjustCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}
const count = (html: string, needle: string) => html.split(needle).length - 1;
const panelOf = (html: string) => {
  const p = markupRegion(html, 'data-pa="A1"', "section");
  if (p === null) throw new Error("no panel");
  return p;
};

describe("placement and live policy", () => {
  it("after the one live answer; the engine's four lines; tax inside as composition; fields keyed", async () => {
    const html = await page();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    if (live === null) throw new Error("no live region");
    expect(live).not.toContain('data-pa="A1"');
    const p = panelOf(html);
    expect(count(p, "data-pa-step=")).toBe(4);
    expect(p).toContain('data-pa-composition="true"');
    expect(p).toContain('data-pa-mode="included"');
    expect(p).not.toMatch(/aria-live|data-results-live|<svg|<figure/);
    for (const key of ["price", "discountPercent", "secondDiscountPercent", "discountAmount", "tax"]) {
      expect(html).toMatch(new RegExp(`data-calc-field="${key}"`));
    }
    expect(html).toContain("lg:grid-cols-5");
    for (const tag of p.match(/<(?:button|label)[^>]*>/g) ?? []) expect(tag).toMatch(/min-h-11/);
  });

  it("excluded: the last line adds the tax", async () => {
    const p = panelOf(await page({ defaultTaxIncluded: "no" }));
    expect(p).toContain('data-pa-step="taxAdded"');
    expect(p).not.toContain('data-pa-step="taxInside"');
  });
});

describe("refused combination", () => {
  it("named, with jumps to the voucher and the first discount; no drawing, no stale figure", async () => {
    const html = await page({ defaultDiscountAmount: "800.000" });
    const p = panelOf(html);
    expect(p).toContain('data-pa-state="refused"');
    expect(p).toContain(L.refused);
    expect(p).toContain('data-arith-fix="discountAmount"');
    expect(p).not.toContain("data-pa-illustration");
    expect(p).not.toContain("720.000");
  });
});
