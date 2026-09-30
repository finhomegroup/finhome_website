/** Rendered contracts for /cong-cu/margin-va-markup/'s two frames. No appearance checked. */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { MARGIN } from "@/content/calculators/margin";
import { MARGIN_LEARNING as L } from "@/content/calculators/margin-learning";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/margin";

async function page(form: Partial<Record<keyof (typeof MARGIN)["form"], string>> = {}): Promise<string> {
  vi.resetModules();
  vi.doMock(CONTENT, async () => {
    const actual = (await vi.importActual(CONTENT)) as { MARGIN: typeof MARGIN };
    return { MARGIN: { ...actual.MARGIN, form: { ...actual.MARGIN.form, ...form } } };
  });
  try {
    const { MarginCalculator } = await import("@/components/margin-calculator");
    return renderToStaticMarkup(createElement(MarginCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}
const count = (html: string, needle: string) => html.split(needle).length - 1;
const panelOf = (html: string) => {
  const p = markupRegion(html, 'data-mg="M1"', "section");
  if (p === null) throw new Error("no panel");
  return p;
};

describe("placement and live policy", () => {
  it("after the one live answer; two frames; controls outside it; fields keyed", async () => {
    const html = await page();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    if (live === null) throw new Error("no live region");
    expect(live).not.toContain('data-mg="M1"');
    const p = panelOf(html);
    expect(count(p, "data-mg-frame=")).toBe(2);
    expect(p).not.toMatch(/aria-live|data-results-live|<svg|<figure/);
    expect(p).toContain('data-arith-open-form="true"');
    expect(html).toMatch(/data-calc-field="cost"/);
    expect(html).toMatch(/data-calc-field="price"/);
    expect(html).not.toContain("lg:grid-cols-5");
    for (const tag of p.match(/<(?:button|label)[^>]*>/g) ?? []) expect(tag).toMatch(/min-h-11/);
  });
});

describe("states on the page", () => {
  it("negative price: the warning that a positive margin is not a profit", async () => {
    const p = panelOf(await page({ defaultPrice: "-300.000" }));
    expect(p).toContain('data-mg-state="negativePrice"');
    expect(p).toContain(L.states.negativePrice);
  });

  it("derived overflow: the named limit, jumps to cost and the active field, tries disabled", async () => {
    const html = await page({ defaultMode: "markup", defaultCost: `1${"0".repeat(308)}`, defaultMarkup: "100" });
    const p = panelOf(html);
    expect(p).toContain('data-arith-state="limit"');
    expect(p).toContain('data-arith-fix="cost"');
    expect(p).toContain('data-arith-fix="markup"');
    expect(p).not.toContain(L.states.gain);
    expect(p).toMatch(/<button[^>]*data-learning-try="markup"[^>]*aria-disabled="true"/);
    expect(html).not.toMatch(/NaN|Infinity/);
  });
});
