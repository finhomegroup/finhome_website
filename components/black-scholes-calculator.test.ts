/**
 * Rendered-markup contracts for /cong-cu/quyen-chon-black-scholes/ (CSV row 42).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * WHAT THIS FILE EXISTS FOR. `lib/calc/black-scholes.test.ts` proves the
 * arithmetic, including put–call parity across a grid. It cannot see that
 * thirteen rows of sensitivity analysis sat between the six inputs and the two
 * prices, which is the whole of row 42's "greeks phụ ở dưới", nor that độ biến
 * động — the one input on the page that has to be estimated — shared a legend
 * with two rates anyone can look up.
 *
 * ONE ASSERTION HERE IS ABOUT AN ABSENCE. The primary group carries NO
 * `emphasis`, on purpose: giá quyền mua and giá quyền bán are two answers to a
 * form that never asks which side the reader is on. A later sweep looking for
 * "the headline" on every route would add one, so the count is pinned at zero
 * with the reason next to it.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";

type Loose = Record<string, unknown>;

/** Render the calculator, optionally overriding some of its FORM defaults. */
async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/black-scholes";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        BLACK_SCHOLES: Loose;
      };
      const original = actual.BLACK_SCHOLES;
      return {
        BLACK_SCHOLES: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/black-scholes-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(createElement(loaded.BlackScholesCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const F = BLACK_SCHOLES.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** Every row that row 42 calls a secondary figure. */
const SECONDARY = [
  F.d1Label,
  F.d2Label,
  F.callIntrinsicLabel,
  F.callTimeValueLabel,
  F.putIntrinsicLabel,
  F.putTimeValueLabel,
  F.moneynessLabel,
  F.forwardLabel,
  F.deltaLabel,
  F.gammaLabel,
  F.vegaLabel,
  F.thetaLabel,
  F.rhoLabel,
];

describe("both prices lead, and neither is promoted", () => {
  it("puts the call, the put and the risk-neutral probability in the live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.indexOf(F.callLabel)).toBeLessThan(live.indexOf(F.putLabel));
    expect(live.indexOf(F.putLabel)).toBeLessThan(
      live.indexOf(F.probabilityLabel),
    );
    // The module's own figures for the shipped defaults, quoted in `formula`.
    expect(live).toContain("10.450,58 ₫");
    expect(live).toContain("5.573,52 ₫");
    expect(live).toContain("55,9618%");
  });

  it("emphasises neither price, because the form never asks which side", async () => {
    // Not an oversight: `ResultRow` permits zero headlines per group, and
    // promoting one of two answers would assert a direction the reader has
    // not stated. Do not "fix" this by adding `emphasis`.
    const html = await render();
    expect(html).not.toContain(HEADLINE);
  });

  it("keeps the boundary notices beside the prices they explain", async () => {
    const atExpiry = await render({ defaultTime: "0" });
    const expiryResult = markupRegion(atExpiry, 'data-calc-region="result"')!;
    expect(expiryResult).toContain(F.atExpiryNotice);
    expect(expiryResult).not.toContain(F.zeroVolNotice);

    const zeroVol = await render({ defaultVolatility: "0" });
    const volResult = markupRegion(zeroVol, 'data-calc-region="result"')!;
    expect(volResult).toContain(F.zeroVolNotice);
    expect(volResult).not.toContain(F.atExpiryNotice);

    // Neither boundary is an input error.
    expect(atExpiry).not.toContain('aria-invalid="true"');
    expect(zeroVol).not.toContain('aria-invalid="true"');
  });
});

describe("the greeks and the d-values are off the input→result path", () => {
  it("moves all thirteen secondary rows into the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    const live = markupRegion(html, 'data-results-live="true"')!;
    for (const label of SECONDARY) {
      expect(detail, `${label} left the detail region`).toContain(label);
      expect(live, `${label} is back on the input→result path`).not.toContain(
        label,
      );
    }
    expect(detail).toContain(F.greeksTitle);
    expect(detail).toContain(F.detailTitle);
    // d₁ = 0,35 and d₂ = 0,15 exactly, at the shipped defaults.
    expect(detail).toContain("0,350000");
    expect(detail).toContain("0,150000");
  });

  it("keeps the mixed-unit greeks column and its per-row units", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    // Nothing about the formatters changed with the move: gamma is still a
    // plain eight-place decimal, vega/theta/rho still money to two places.
    expect(detail).toContain("375,24");
    expect(detail).toContain("-17,57");
    expect(detail).toContain("532,32");
    expect(detail).toContain("trên mỗi ₫");
    expect(detail).toContain("₫ mỗi ngày");
  });

  it("keeps the detail region non-live, with one live region on the page", async () => {
    const html = await render();
    expect(markupRegion(html, 'data-calc-region="detail"')).not.toContain(
      'data-results-live="true"',
    );
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the assumption is its own box", () => {
  it("splits độ biến động away from the two observable rates", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.split("<fieldset").length - 1).toBe(3);
    expect(form.indexOf(F.optionGroup)).toBeLessThan(
      form.indexOf(F.assumptionGroup),
    );
    expect(form.indexOf(F.assumptionGroup)).toBeLessThan(
      form.indexOf(F.marketGroup),
    );
    // The legend the volatility field sits under is the assumption one, and
    // the rates are under the market one — that is the whole of the split.
    expect(form.indexOf(F.assumptionGroup)).toBeLessThan(
      form.indexOf(F.volatilityLabel),
    );
    expect(form.indexOf(F.volatilityLabel)).toBeLessThan(
      form.indexOf(F.marketGroup),
    );
    expect(form.indexOf(F.marketGroup)).toBeLessThan(form.indexOf(F.rateLabel));
  });

  it("moves no field while regrouping them", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    const order = [
      F.spotLabel,
      F.strikeLabel,
      F.timeLabel,
      F.volatilityLabel,
      F.rateLabel,
      F.dividendLabel,
    ].map((label) => form.indexOf(label));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order.some((index) => index < 0)).toBe(false);
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid, all three regions and the CTA target", async () => {
    const html = await render();
    expect(html).toContain('id="quyen-chon-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('id="quyen-chon-ket-qua"');
    expect(html).toContain('aria-controls="quyen-chon-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("marks the CTA help as pointing at a bad field only when one exists", async () => {
    const clean = await render();
    const broken = await render({ defaultSpot: "0" });
    // `ResultCta`'s `invalid` drives only the help sentence; the jump
    // destination is read from the DOM. So this asserts the two states
    // differ, not which words either one uses.
    expect(broken).toContain('aria-invalid="true"');
    expect(clean).not.toContain('aria-invalid="true"');
  });

  it("still accepts a negative risk-free rate", async () => {
    // `rateInvalid` is `rate === null` alone, and the regrouping did not
    // touch it: a negative continuously-compounded rate is a real quote.
    const html = await render({ defaultRate: "-1" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(markupRegion(html, 'data-results-live="true"')).not.toContain("—");
  });

  /**
   * THE PINNED CURRENT ANSWER, WHICH THIS ROUTE USED TO DECLINE.
   *
   * The decline was measured wrong: at 1440×1000 the form is 1143,75 px tall
   * and clicking the last field (`Tỷ suất cổ tức`) left the result region at
   * y −382..−140, entirely off-screen. The reason behind the decline was real
   * though — the block holds ONE `answer` and this page has two prices — so
   * the value is a labelled pair, and these assertions exist to keep it a
   * PAIR rather than letting a later pass pick a side.
   *
   * Nothing here is a viewport claim. Whether the pinned line clears the
   * focused field is a browser question, and `.fh-cta-pin` in
   * `app/globals.css` owns the height threshold it is allowed under.
   */
  const pinned = (html: string) => {
    const at = html.indexOf('data-calc-answer="true"');
    if (at === -1) return null;
    const open = html.lastIndexOf("<p", at);
    return html.slice(open, html.indexOf("</p>", at) + 4);
  };

  /** Every money figure in a fragment, in document order. */
  const figures = (fragment: string) =>
    fragment.match(/[\d.,]+\s₫/g) ?? [];

  it("pins the block and names both prices in it", async () => {
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    const block = pinned(html);
    expect(block, "no pinned answer on a 1143,75 px form").toBeTruthy();
    expect(block).toContain(F.pinnedPairLabel);
    // Each side is named inline, so neither reads as the trade to make.
    expect(block).toContain(F.pinnedCallPrefix);
    expect(block).toContain(F.pinnedPutPrefix);
  });

  it("restates the SAME strings the two rows render", async () => {
    // `ResultCta`'s `answer` docstring forbids a second formatting of the
    // same number, and two roundings of one price is exactly the defect a
    // pair could introduce. Derived from the markup, not hardcoded.
    const html = await render();
    const block = pinned(html)!;
    const pair = figures(block);
    expect(pair).toHaveLength(2);
    const live = markupRegion(html, 'data-results-live="true"')!;
    const rows = figures(live);
    // Call first, put second, in the rows' own order.
    expect(rows.slice(0, 2)).toEqual(pair);
  });

  it("shows the placeholder rather than half a pair when a field is unusable", async () => {
    const html = await render({ defaultSpot: "0" });
    const block = pinned(html)!;
    expect(block).toContain("—");
    expect(figures(block)).toHaveLength(0);
    // And the label still says what the blank is for.
    expect(block).toContain(F.pinnedPairLabel);
  });

  it("stays decorative, and out of the way below lg", async () => {
    // A duplicate of a row the one live region already announces: announcing
    // it again reports a single recomputation twice. And the phone layout
    // keeps the CTA in flow, where it cannot cover a field or the keyboard.
    const html = await render();
    const block = pinned(html)!;
    expect(block).toContain('aria-hidden="true"');
    expect(block).toContain("hidden");
    expect(block).toContain("lg:flex");
    // Exactly one live region, unchanged by the restatement.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("does not add a housing funnel to a tool with no next steps", async () => {
    // `next-steps.ts` has no entry for this slug, so the route passes no
    // `actions`/`nextSteps` — and this component takes no props for them.
    const html = await render();
    expect(html).not.toContain("data-calc-actions");
  });
});
