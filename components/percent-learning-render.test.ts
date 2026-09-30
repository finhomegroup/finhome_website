/** Rendered contracts for /cong-cu/tinh-phan-tram/'s ruler. No appearance checked. */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PERCENT } from "@/content/calculators/percent";
import { ARITH_WORDS as W } from "@/content/calculators/arith-learning-words";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/percent";

// Fixture STRINGS, not the content's `as const` literal types, so a test may
// pass any typed value ("1000", a 309-digit number, "").
async function page(of: Partial<Record<keyof (typeof PERCENT)["form"]["modes"]["of"], string>> = {}): Promise<string> {
  vi.resetModules();
  vi.doMock(CONTENT, async () => {
    const actual = (await vi.importActual(CONTENT)) as { PERCENT: typeof PERCENT };
    return {
      PERCENT: {
        ...actual.PERCENT,
        form: { ...actual.PERCENT.form, modes: { ...actual.PERCENT.form.modes, of: { ...actual.PERCENT.form.modes.of, ...of } } },
      },
    };
  });
  try {
    const { PercentCalculator } = await import("@/components/percent-calculator");
    return renderToStaticMarkup(createElement(PercentCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}
const count = (html: string, needle: string) => html.split(needle).length - 1;
const panelOf = (html: string) => {
  const p = markupRegion(html, 'data-pc="P1"', "section");
  if (p === null) throw new Error("no panel");
  return p;
};

describe("placement, live policy and focus metadata", () => {
  it("after the one live answer; controls outside it; no chart, table or figure; number fields keyed", async () => {
    const html = await page();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    if (live === null) throw new Error("no live region");
    expect(live).not.toContain('data-pc="P1"');
    expect(html.indexOf('data-pc="P1"')).toBeGreaterThan(html.indexOf('data-results-live="true"'));
    expect(html).not.toMatch(/<svg|<table|<figure/);
    const p = panelOf(html);
    expect(p).not.toMatch(/aria-live|data-results-live/);
    expect(count(p, 'type="radio"')).toBe(2);
    expect(p).toContain('data-arith-open-form="true"');
    expect(p).not.toContain('data-learning-open-form="true"');
    expect(html).toMatch(/data-calc-field="ofPercent"/);
    expect(html).toMatch(/data-calc-field="ofTotal"/);
    for (const tag of p.match(/<(?:button|label)[^>]*>/g) ?? []) expect(tag).toMatch(/min-h-11/);
    expect(count(html, "md:text-3xl")).toBe(1);
  });
});

describe("limits and invalid input", () => {
  it("a non-finite result: the named limit with real field jumps, the try disabled, no NaN/Infinity", async () => {
    const html = await page({ defaultA: "1000", defaultB: `1${"0".repeat(308)}` });
    const p = panelOf(html);
    expect(p).toContain('data-arith-state="limit"');
    expect(p).toContain('data-arith-fix="ofPercent"');
    expect(p).toContain('data-arith-fix="ofTotal"');
    expect(p).not.toContain("data-pc-illustration");
    expect(p).toMatch(/<button[^>]*data-learning-try="ofPercent"[^>]*aria-disabled="true"/);
    expect(html).not.toMatch(/NaN|Infinity/);
    expect(markupRegion(html, 'data-results-live="true"')).toContain(W.unavailable);
  });

  it("a blank box: the empty state and no stale figure", async () => {
    const p = panelOf(await page({ defaultA: "" }));
    expect(p).toContain('data-pc-state="empty"');
    expect(p).not.toContain("600.000.000");
  });
});
