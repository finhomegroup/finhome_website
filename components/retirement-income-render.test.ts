/**
 * Rendered-markup contracts for `/cong-cu/thu-nhap-huu-tri/` (plan row 50).
 *
 * WHY A RENDER TEST AND NOT A MODULE TEST. docs §6 records that three of this
 * suite's five worst defects were invisible to a green test run because they
 * lived in a COMPONENT or in a DEFAULT INPUT rather than in a module — and the
 * funded verdict on this page is exactly that defect. `fundedAtBoundary()`
 * (see `lib/calc/long-term-plan.ts`) has shipped since the model slice, with a
 * documented policy for the float residue a closed-form sustainable spend
 * leaves in the final year of a projection. The components in this family
 * decided funded-ness with a bare `result.depletionAge === null` instead, so a
 * draw that is funded to within four millionths of one đồng renders as running
 * out a year early. On THIS route that lands on the page's own headline
 * figure: the sustainable draw is precisely the spend that sits on the
 * boundary, so the verdict row could read "cạn ở tuổi 84" beside a figure
 * whose own table says "không cạn". A module test cannot see that; only
 * rendering the component at a chosen default can.
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment, with
 * `vi.doMock` on the shared content module to change one default — the idiom
 * `components/calc/chart/chart-render.test.ts` established and
 * `retirement-plan-render.test.ts` reuses, and the right fidelity here because
 * every calculator is prerendered at its defaults and must hydrate
 * byte-identically.
 *
 * What this file CANNOT check is appearance. Layout, contrast, touch targets
 * and overflow stay unverified by eye; nothing here may be reported as a
 * visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readRetirement } from "@/components/calc/retirement-fields";
import { withdrawalChartLabels } from "@/components/retirement-income-calculator";
import { fill } from "@/lib/calc/charts/labels";
import { longTermWithdrawalModel } from "@/lib/calc/charts/long-term-chart";
import {
  LONGEVITY_STRESS_YEARS,
  resolveLongTermPlan,
} from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

const F = C.form;
const CONTENT_PATH = "@/content/calculators/long-term-plan";

/** The component's own omit array, for the model-level cases below. */
const OMIT = ["desiredAnnualSpending"] as const;

/** The plan the page opens on, resolved the way the component resolves it. */
function planAtDefaults() {
  const read = readRetirement(L.defaults, OMIT);
  if (read.input === null) throw new Error("the shipped defaults do not parse");
  const plan = resolveLongTermPlan(read.input);
  if (plan === null) throw new Error("resolveLongTermPlan refused the defaults");
  return plan;
}

/** Render the calculator, optionally on a patched default scenario. */
async function render(
  defaults?: Partial<Record<string, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        LONG_TERM_PLAN: typeof L;
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
    // No `as Record<string, ComponentType>` cast. A literal-path dynamic
    // import is already typed, and the cast breaks under `--noEmit` the moment
    // the module exports anything that is not a component — which it now does
    // (`withdrawalChartLabels`). Row 45's render test hit exactly that error.
    const loaded = await import("@/components/retirement-income-calculator");
    return renderToStaticMarkup(
      createElement(loaded.RetirementIncomeCalculator),
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

/**
 * A draw that is funded, which the projection reports as depleting.
 *
 * Constructed rather than found, so it is reproducible — the same fixture
 * `retirement-plan-render.test.ts` uses, and it lands on this route's headline
 * for a reason worth stating. At a zero REAL return
 * (`returnAfterPercent === inflationPercent`) the annuity-due factor is
 * exactly the retirement span, so `sustainableSpending` is
 * `capital / span + other income` — 4 tỷ over 25 years is 160.000.000 ₫ plus
 * 36.000.000 ₫, exactly 196.000.000 ₫. That is both the desired spend below
 * AND the figure this page solves for, so the "asEntered" and "sustainable"
 * paths are the same plan and BOTH sit on the boundary.
 *
 * `projectRetirement` then reports `depletionAge` 84 against a horizon of 85,
 * with an unpaid 0,0000040531 ₫. Retiring today (`retirementAge` equal to
 * `currentAge`) keeps the accumulation phase out of it, so the only thing
 * under test is the drawdown verdict.
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

describe("thu-nhap-huu-tri, rendered at its shipped defaults", () => {
  it("reads the SHARED đồng scenario, not a scenario of its own", async () => {
    // The merge's whole point: four routes, one set of assumptions. A route
    // holding its own copy of the eleven defaults is how the four came to
    // disagree in the first place — and the USD object this component used to
    // read is still exported from `retirement-fields.tsx` for the last of the
    // three siblings, so reading it again would be silent.
    const html = await render();
    expect(html).toContain(L.defaults.currentBalance);
    expect(html).toContain(L.defaults.otherAnnualIncome);
    expect(html).not.toContain("USD");
    expect(html).toContain("₫");
  });

  it("does not render the field it solves for", async () => {
    // `omit`. A visible input that has no effect on the answer is a page lying
    // about what it does; this page answers the spending question, so it must
    // not ask it.
    const html = await render();
    expect(html).not.toContain(L.fields.fields.desiredAnnualSpending.label);
    // Every field it DOES read is present, so `omit` cannot quietly grow.
    for (const key of [
      "currentAge",
      "retirementAge",
      "endAge",
      "currentBalance",
      "annualContribution",
      "otherAnnualIncome",
      "returnAfterPercent",
      "inflationPercent",
    ] as const) {
      expect(html, `${key} is missing from the form`).toContain(
        L.fields.fields[key].label,
      );
    }
  });

  it("states the benchmark it does not ask for", async () => {
    // The other half of `omit` on THIS route. The hidden field's value is not
    // fed in as zero — `readRetirement` parses it — so the shared scenario's
    // desired spend is what both alternative paths and the shortfall row are
    // measured against. A figure that drives the answer and appears nowhere is
    // the mirror image of the defect `omit` exists to prevent.
    const html = await render();
    expect(html).toContain(F.desiredLabel);
    expect(html).toContain(F.desiredNote);
    expect(html).toContain("240.000.000 ₫");
  });

  it("keeps exactly one live results region, with the table outside it", async () => {
    // docs §4: exactly one live region per page, and never a table inside one.
    //
    // The delimiter is the NEXT `<h2`, not the next `</dl>`. `ResultGroup`
    // renders no `<dl>` at all — the only ones in this family come from
    // `ResultTable`'s `mobileCards` branch — so a `</dl>`-delimited slice is
    // "everything up to the chart's own mobile-card block" on a page whose
    // table sets `mobileCards` and "the whole document" on one that does not.
    // `<h2>` is `ResultGroup`'s own heading, so the next one is a real bound on
    // the live group, and the closing divs it also spans hold no markup.
    const html = await render();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    // Bounding by the next `<h2>` was guarded and therefore safe, but it is a
    // PROXY: it spans past the region to the following heading. `markupRegion`
    // counts the region's own depth, so all four of this repo's containment
    // assertions now mean the same thing.
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live).not.toContain("<table");
    // And the one table on the page belongs to the figure, which is where the
    // exact reading of a drawing lives.
    expect(html.indexOf("<table")).toBeGreaterThan(html.indexOf("<figure"));
  });

  it("leads on the draw the capital supports", async () => {
    const html = await render();
    expect(html).toContain("219.057.403 ₫");
    expect(html).toContain("18.254.784 ₫");
    expect(html).toContain("183.057.403 ₫");
    expect(html).toContain("20.942.597 ₫");
    // The rate is the SUSTAINABLE draw's, not the desired spend's: 4,99% is
    // route 44's figure and describes a plan that runs out.
    expect(html).toContain("4,48%");
  });

  it("opens on a desired spend the capital does NOT support", async () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing.
    const html = await render();
    expect(html).toContain(F.shortNotice);
    expect(html).not.toContain(F.fundedNotice);
    // Both unfunded paths deplete at the same age, so the VALUE cannot tell
    // them apart — the row's label is where the difference lives.
    expect(html).toContain(fill(F.pathRunsOut, { age: "82" }));
    expect(html).toContain(fill(C.chart.outcomeShort, { short: "3" }));
    expect(html).toContain(fill(C.chart.outcomeShort, { short: "8" }));
    expect(html).toContain(F.pathLasts);
    expect(html).toContain(C.chart.outcomeFunded);
  });

  it("draws the withdrawal figure the chart module was built for", async () => {
    // `longTermWithdrawalModel` was tested and rendered NOWHERE before this
    // slice. The frame's contracts belong to `ChartFigure`; what is asserted
    // here is that the figure exists at all and carries its text equivalent.
    const html = await render();
    expect(count(html, "<figure")).toBe(1);
    expect(html).toContain("<figcaption");
    expect(html).toContain(C.chart.title);
    // The summary is VISIBLE prose, and the drawing is not announced twice.
    expect(html).toContain(C.chart.sameCapitalNote);
    for (const svg of html.match(/<svg[^>]*>/g) ?? []) {
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
    }
    // The exact reading is a real table inside a native <details>.
    expect(html).toContain(C.chart.tableCaption);
    expect(html).toContain("<details");
    // Three paths, each named in the figure's own table.
    // Each path is named by its own horizon and outcome, filled from the
    // resolved plan. No raw placeholder may reach the page — an unfilled
    // template is the one way the label mechanism can fail visibly.
    const labels = withdrawalChartLabels(planAtDefaults());
    expect(html).toContain(labels.sustainablePath);
    expect(html).toContain(labels.longerLifePath);
    for (const placeholder of ["{endAge}", "{outcome}", "{short}", "{years}"]) {
      expect(html, `a raw ${placeholder} reached the page`).not.toContain(
        placeholder,
      );
    }
  });

  it("ships the chart's compact table and no wide per-year one", async () => {
    // Route 44 removed its seven-column every-five-years table after it
    // measured 762 px inside a 300 px scroll frame at 390 px — two and a half
    // screens of sideways scrolling per row. This page's five-column
    // every-five-years drawdown table was the same shape, and the replacement
    // is the figure plus its own three-column reading. So: exactly one table
    // on the page, and it is the figure's.
    const html = await render();
    expect(count(html, "<table")).toBe(1);
    const table = html.slice(html.indexOf("<table"));
    expect(table).toContain(C.chart.ageColumn);
    expect(table).toContain(C.chart.realColumn);
  });
});

/**
 * The marker list, which a browser review found repeating itself.
 *
 * Both unfunded paths spend the same amount from the same capital, so they run
 * out at the SAME age — living longer does not make the money run out sooner.
 * The first version of this figure therefore printed two marker lines whose
 * facts were identical ("cạn ở tuổi 82 — năm thứ 22", twice), while the one
 * thing that separates the two scenarios — 3 years unfunded against an 85
 * horizon, 8 against 90 — appeared nowhere in the figure.
 *
 * `longTermWithdrawalModel` builds the markers and fills `{path}` from the
 * caller's own path labels, so that label is the only per-path channel into a
 * marker. The labels therefore carry each path's horizon AND what it leaves
 * unfunded, and these tests hold that.
 */
describe("the depletion markers", () => {
  const plan = planAtDefaults();
  const model = longTermWithdrawalModel(plan, withdrawalChartLabels(plan));

  it("puts both unfunded paths at the SAME period, which is why this matters", () => {
    // The premise, asserted rather than assumed. If these ever stop coinciding
    // the duplication problem disappears on its own — and so does the reason
    // the guard below exists, which the next reader should be able to see.
    expect(model.markers).toHaveLength(2);
    expect(model.markers[0].period).toBe(model.markers[1].period);
  });

  it("gives each marker the years that path leaves unfunded", () => {
    // The fact the figure was missing. 3 against the entered horizon, 8
    // against the five-years-longer one — derived here from the plan so a
    // moved default moves the expectation with it.
    const short = (key: "asEntered" | "longerLife") =>
      plan.withdrawal.paths.find((p) => p.key === key)!.projection.yearsShort;
    expect(short("asEntered")).toBe(3);
    expect(short("longerLife")).toBe(8);
    expect(model.markers[0].label).toContain(
      fill(C.chart.outcomeShort, { short: String(short("asEntered")) }),
    );
    expect(model.markers[1].label).toContain(
      fill(C.chart.outcomeShort, { short: String(short("longerLife")) }),
    );
  });

  it("never lets two marker labels collapse into one string", () => {
    // The structural guard. Two vertical rules at one x position with the same
    // text is a figure repeating itself, and no future fixture may reach it.
    const labels = model.markers.map((marker) => marker.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("names each path's own horizon, read from the path and not guessed", () => {
    expect(model.markers[0].label).toContain(String(L.defaults.endAge));
    expect(model.markers[1].label).toContain(
      String(Number(L.defaults.endAge) + LONGEVITY_STRESS_YEARS),
    );
  });

  it("renders both distinct marker lines on the page", async () => {
    const html = await render();
    for (const marker of model.markers) {
      expect(html, `marker missing: ${marker.label}`).toContain(marker.label);
    }
  });
});

describe("the funded boundary, on the rendered page", () => {
  it("calls a float-residue depletion FUNDED, as fundedAtBoundary decides", async () => {
    // THE DEFECT THIS FILE EXISTS FOR. `depletionAge` is 84 here and both
    // paths are funded: the unpaid part is 0,0000040531 ₫ of a ~1,5e9 ₫ need
    // in the final year of the horizon. A verdict read straight off
    // `depletionAge` tells the reader the draw this page just computed runs
    // out a year early.
    const html = await render(FUNDED_BOUNDARY);
    // The discriminator is the verdict VALUE, which is what `verdictOf` reads
    // the funded flag for. Two of the three paths are funded here, so two rows
    // carry it; under the naive read neither did. The longevity path on this
    // fixture genuinely depletes at 84, so "Vốn cạn ở tuổi 84." legitimately
    // appears and cannot be the discriminator.
    expect(count(html, F.pathLasts)).toBe(2);
    expect(html).toContain(F.fundedNotice);
    expect(html).not.toContain(F.shortNotice);
    // A ratchet rather than a reproduction: the path LABELS already read the
    // funded flag, so nothing should ever describe these two as a year short.
    // It would fail if a future change rebuilt a label off `depletionAge`.
    expect(html).not.toContain(fill(C.chart.outcomeShort, { short: "1" }));
  });

  it("agrees with its own figure's table about which paths last", async () => {
    // The two-adjacent-contradictions test. `longTermWithdrawalModel` already
    // reads `path.funded`, so under the naive verdict the result rows and the
    // table inside the same page disagree about the same paths.
    const html = await render(FUNDED_BOUNDARY);
    expect(count(html, C.chart.lastsCell)).toBe(count(html, F.pathLasts));
  });

  it("states the residue it forgave instead of hiding it", async () => {
    // `fundedAtBoundary` returns the residue precisely so a consumer can say
    // it. A verdict that silently forgives a shortfall is one the reader
    // cannot check — and the same policy must never forgive a real shortfall,
    // which the default scenario above proves it does not.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain("0,000004");
  });

  it("still marks a REAL shortfall on the same fixture", async () => {
    // The guard is not vacuous: on this fixture the longevity path genuinely
    // fails — the same spend against a horizon five years longer runs out six
    // years early — so the boundary policy is forgiving a residue, not
    // suppressing depletion.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain(fill(F.pathRunsOut, { age: "84" }));
    expect(html).toContain(fill(C.chart.outcomeShort, { short: "6" }));
  });
});
