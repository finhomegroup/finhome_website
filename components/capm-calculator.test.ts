/**
 * Rendered-markup contracts for /cong-cu/capm/ — CSV row 38.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that the
 * expected return is the one headline, that the short beta and alpha
 * explanations are on the page beside their labels and OUTSIDE the live region,
 * and — the row's second half — that the prefilled state explains in words why
 * there is no alpha instead of showing a bare dash.
 *
 * WHAT IT CANNOT: anything about appearance, and nothing about whether the two
 * explanations read as "beside" their labels at a given width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { CAPM } from "@/content/calculators/capm";

const CONTENT = "@/content/calculators/capm";

type FormPatch = Partial<Record<keyof typeof CAPM.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/capm")>(
          CONTENT,
        );
      return {
        CAPM: { ...actual.CAPM, form: { ...actual.CAPM.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/capm-calculator");
    return renderToStaticMarkup(createElement(loaded.CapmCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = CAPM.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the expected return is the answer", () => {
  it("computes 4% + 1,2 × 8 points at the shipped defaults", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("13,600%");
    expect(live!).toContain(C.profileAggressive);
  });

  it("gives the headline to the expected return and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.expectedLabel);
  });

  it("sets the beta verdict as prose, not as a figure", async () => {
    // "Khuếch đại — biến động mạnh hơn thị trường" at display size wraps to
    // three lines and stops being a headline; see ResultRow's `prose`.
    const html = await render();
    expect(html).not.toContain("md:text-2xl\">Khuếch đại");
    expect(html).toContain("md:max-w-sm");
  });
});

describe("the short beta and alpha explanations", () => {
  it("puts both on the page, each next to its own label", async () => {
    const html = await render();
    expect(html).toContain(C.betaNote);
    expect(html).toContain(C.alphaNote);
    // Each sentence follows the label it explains.
    expect(html.indexOf(C.betaNote)).toBeGreaterThan(
      html.indexOf(`${C.profileLabel}:`),
    );
    expect(html.indexOf(C.alphaNote)).toBeGreaterThan(
      html.indexOf(`${C.alphaLabel}:`),
    );
  });

  it("keeps them out of the live announcement", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain(C.betaNote);
    expect(live!).not.toContain(C.alphaNote);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("keeps them in the result region, not in the detail region", async () => {
    const html = await render();
    expect(html.indexOf(C.betaNote)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("no actual return entered", () => {
  it("says why alpha is unavailable, in the shipped state", async () => {
    // `defaultActual` is empty, so this is what most readers see first.
    expect(CAPM.form.defaultActual).toBe("");
    const html = await render();
    expect(html).toContain(C.alphaUnavailableNote);
    // …and it is not an error: no field is marked invalid.
    expect(html).not.toContain('aria-invalid="true"');
    // …while the expected return is still answered.
    expect(html).toContain("13,600%");
  });

  it("drops the explanation once an actual return IS entered", async () => {
    const html = await render({ defaultActual: "15" });
    expect(html).not.toContain(C.alphaUnavailableNote);
    // 15 − 13,6 = 1,4 points of alpha.
    expect(html).toContain("1,400%");
  });

  it("still rejects a NON-EMPTY unparseable actual return", async () => {
    const html = await render({ defaultActual: "abc" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.actualInvalid);
    // A bad entry is not the "no alpha yet" state, and must not borrow its
    // explanation.
    expect(html).not.toContain(C.alphaUnavailableNote);
  });
});

describe("the region and CTA contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="capm-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="capm-ket-qua"');
    expect(html).toContain('aria-controls="capm-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("keeps the components the answer was built from in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.riskPremiumLabel);
    expect(detail!).toContain("9,600%"); // 1,2 × 8 points
    expect(detail!).not.toContain('data-results-live="true"');
  });

  it("shows only the market box the chosen mode uses", async () => {
    const byPremium = await render({ defaultMarketMode: "premium" });
    expect(byPremium).toContain(C.marketPremiumLabel);
    // 4% + 1,2 × 8 is the same answer by either route.
    expect(byPremium).toContain("13,600%");
  });
});
