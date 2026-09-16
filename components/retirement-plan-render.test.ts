/**
 * Rendered-markup contracts for `/cong-cu/ke-hoach-huu-tri/` (plan row 44).
 *
 * WHY A RENDER TEST AND NOT A MODULE TEST. docs §6 records that three of this
 * suite's five worst defects were invisible to a green test run because they
 * lived in a COMPONENT or in a DEFAULT INPUT rather than in a module — and the
 * funded verdict on this page was exactly that defect. The engine has shipped
 * `fundedAtBoundary()` (see `lib/calc/long-term-plan.ts`) since the model slice
 * landed, with a documented policy for the float residue a closed-form
 * sustainable spend leaves in the final year of a projection. No component
 * consumed it: this page decided funded-ness with a bare
 * `result.depletionAge === null`, so a plan that is funded to within four
 * millionths of one đồng rendered as "Không đủ", with a depletion age and a
 * "kế hoạch này cạn tiền" notice under it. A module test cannot see that; only
 * rendering the component at a chosen default can.
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment, with
 * `vi.doMock` on the content module to change one default — the idiom
 * `components/calc/chart/chart-render.test.ts` established, and the right
 * fidelity here because every calculator is prerendered at its defaults and
 * must hydrate byte-identically.
 *
 * What this file CANNOT check is appearance. Layout, contrast, touch targets
 * and overflow stay unverified by eye; nothing here may be reported as a
 * visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";

const CONTENT_PATH = "@/content/calculators/long-term-plan";

/** Render the calculator, optionally on a patched default scenario. */
async function render(
  defaults?: Partial<Record<string, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        LONG_TERM_PLAN: typeof LONG_TERM_PLAN;
      };
      return {
        LONG_TERM_PLAN: {
          ...actual.LONG_TERM_PLAN,
          defaults: { ...actual.LONG_TERM_PLAN.defaults, ...defaults },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/retirement-plan-calculator")) as
      Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.RetirementPlanCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

/** The live results region, bounded by its own nesting. See `markupRegion`. */
const liveRegion = (html: string) =>
  markupRegion(html, 'data-results-live="true"');

/**
 * A plan that is funded, which the projection reports as depleting.
 *
 * Constructed rather than found, so it is reproducible: at a zero REAL return
 * (`returnAfterPercent === inflationPercent`) the annuity-due factor is
 * exactly the retirement span, so a round balance over a round span is a round
 * sustainable spend that a form field can actually hold. 4 tỷ over 25 years is
 * 160.000.000 ₫ a year from the portfolio, plus the 36.000.000 ₫ of other
 * income, so a desired spend of exactly 196.000.000 ₫ is the boundary.
 *
 * `projectRetirement` then reports `depletionAge` 84 against a horizon of 85,
 * with an unpaid 0,0000040531 ₫ — the artefact `fundedAtBoundary`'s docstring
 * describes, at đồng magnitudes. Retiring today (`retirementAge` equal to
 * `currentAge`) keeps the accumulation phase out of it, so the only thing under
 * test is the drawdown verdict.
 */
const FUNDED_BOUNDARY = {
  currentAge: "60",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "4.000.000.000",
  annualContribution: "0",
  contributionGrowthPercent: "0",
  returnBeforePercent: "4",
  returnAfterPercent: "4",
  inflationPercent: "4",
  desiredAnnualSpending: "196.000.000",
  otherAnnualIncome: "36.000.000",
} as const;

describe("ke-hoach-huu-tri, rendered at its shipped defaults", () => {
  it("reads the SHARED đồng scenario, not a scenario of its own", async () => {
    // The merge's whole point: four routes, one set of assumptions. A route
    // holding its own copy of the eleven defaults is how the four came to
    // disagree in the first place.
    const html = await render();
    expect(html).toContain(LONG_TERM_PLAN.defaults.currentBalance);
    expect(html).toContain(LONG_TERM_PLAN.defaults.desiredAnnualSpending);
    // The ₫ unit on a money field, which is the visible half of the currency
    // change. "USD" must appear nowhere on the page.
    expect(html).not.toContain("USD");
    expect(html).toContain("₫");
  });

  it("keeps exactly one live results region, with the table outside it", async () => {
    // docs §4: exactly one live region per page, and never a table inside one.
    // A 50-row schedule inside a polite region re-announces on every keystroke.
    //
    // The bound is `markupRegion`, which counts depth — its own tests cover
    // the three ways the ad-hoc bounds in this repo got it wrong. The
    // not-null check is the guard each of those was missing: a -1 bound
    // silently widens the region to the whole page.
    const html = await render();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = liveRegion(html);
    expect(live).not.toBeNull();
    expect(live).not.toContain("<table");

    // And the page's one table is where it belongs: inside the figure, which
    // is outside the live region. Asserted positively so the check cannot be
    // satisfied by a page that simply has no table at all.
    expect(count(html, "<table")).toBe(1);
    const figure = html.slice(html.indexOf("<figure"), html.indexOf("</figure>"));
    expect(figure).toContain("<table");
  });

  it("draws the trajectory figure the chart module was built for", async () => {
    // `longTermTrajectoryModel` was tested and rendered NOWHERE before this
    // slice. The frame's contracts belong to `ChartFigure`; what is asserted
    // here is that the figure exists at all and carries its text equivalent.
    const html = await render();
    expect(count(html, "<figure")).toBe(1);
    expect(html).toContain("<figcaption");
    expect(html).toContain(C.chart.title);
    // The summary is VISIBLE prose, and the drawing is not announced twice.
    expect(html).toContain(C.chart.readingNote);
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
    // The exact reading is a real table inside a native <details>.
    expect(html).toContain(C.chart.tableCaption);
    expect(html).toContain("<details");
  });

  it("opens on a plan that is SHORT, and says which year", async () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing.
    const html = await render();
    expect(html).toContain(C.form.depletionNotice);
    expect(html).not.toContain(C.form.fundedNotice);
    // The depletion year is a PARTIAL payment, so all three figures are shown
    // rather than an age alone.
    expect(html).toContain(C.form.partialPlannedLabel);
    expect(html).toContain(C.form.partialShortLabel);
  });

});

describe("the funded boundary, on the rendered page", () => {
  it("calls a float-residue depletion FUNDED, as fundedAtBoundary decides", async () => {
    // THE DEFECT THIS FILE EXISTS FOR. `depletionAge` is 84 here and the plan
    // is funded: the unpaid part is 0,0000040531 ₫ of a 1,5e9 ₫ need in the
    // final year of the horizon. A verdict read straight off `depletionAge`
    // tells the reader their plan fails by four millionths of one đồng.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain(C.form.fundedNotice);
    expect(html).not.toContain(C.form.depletionNotice);
  });

  it("states the residue it forgave instead of hiding it", async () => {
    // `fundedAtBoundary` returns the residue precisely so a consumer can say
    // it. A verdict that silently forgives a shortfall is one the reader
    // cannot check — and the same policy must never forgive a real shortfall,
    // which the default scenario above proves it does not.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain("0,000004");
  });
});
