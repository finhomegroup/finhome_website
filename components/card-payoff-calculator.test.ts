/**
 * The card-payoff workspace as RENDERED, at both routes' opening strategies —
 * original rows 29 and 30.
 *
 * Why this has to be a render test. The consolidation's whole claim is that
 * two routes now render ONE tool at two strategies, and that each route still
 * shows the right fields, both dates and one live region. None of that is
 * visible in the module tests (`lib/calc/card-plan.test.ts` pins the
 * arithmetic and the dates) or in a grep of `out/`, because the strategy is a
 * PROP: a page that passed the wrong one, or a form that rendered the fixed
 * payment field on the minimum route, would pass both.
 *
 * Server-rendered with `react-dom/server` in the runner's existing `node`
 * environment — no jsdom, no new dependency — which is also the right
 * fidelity, since both routes are prerendered at these defaults and must
 * hydrate byte-identically. `.test.ts`, so `createElement` rather than JSX.
 *
 * What this cannot check is appearance: layout, contrast and whether the
 * 125-month minimum curve is legible at 390 px remain unverified by eye.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import { CARD_MINIMUM } from "@/content/calculators/card-minimum";
import { fill } from "@/lib/calc/charts/labels";

const CONTENT = "@/content/calculators/card-payoff";

type Strategy = "fixed" | "target" | "minimum";

/**
 * Render the workspace at one strategy, optionally patching one default.
 *
 * `patch` receives the real form object and returns overrides, so a case
 * changes one field and inherits the other eleven.
 */
async function render(
  strategy: Strategy,
  patch?: (form: Record<string, unknown>) => Record<string, unknown>,
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/card-payoff")
      >(CONTENT);
      return {
        CARD_PAYOFF: {
          ...actual.CARD_PAYOFF,
          form: {
            ...actual.CARD_PAYOFF.form,
            ...patch(actual.CARD_PAYOFF.form as Record<string, unknown>),
          },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/card-payoff-calculator");
    return renderToStaticMarkup(
      createElement(loaded.CardPayoffCalculator, { strategy }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const F = CARD_PAYOFF.form;

/**
 * A field's rendered label, which is what tells the three strategies' inputs
 * apart.
 *
 * `NumberField` renders "label (unit)". The bare label is not enough here:
 * the target strategy's own radio reads "Muốn hết nợ trong một số tháng nhất
 * định", which CONTAINS `monthsLabel`, so a negative assertion on the label
 * alone would fail on every route.
 */
const fieldLabel = (label: string, unit: string) => `${label} (${unit})`;

const PAYMENT_FIELD = fieldLabel(
  CARD_PAYOFF.form.paymentLabel,
  CARD_PAYOFF.form.paymentUnit,
);
const MONTHS_FIELD = fieldLabel(
  CARD_PAYOFF.form.monthsLabel,
  CARD_PAYOFF.form.monthsUnitField,
);
const EXTRA_FIELD = fieldLabel(
  CARD_PAYOFF.form.extraLabel,
  CARD_PAYOFF.form.extraUnit,
);

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

describe("both routes, one workspace", () => {
  it("opens the payoff route on the fixed-payment strategy", async () => {
    const html = await render("fixed");
    // React emits `checked` before `value` on a controlled radio, so the
    // assertion is anchored on the element rather than on attribute order.
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="fixed"/);
    // The field that strategy needs, and not the others'.
    expect(html).toContain(PAYMENT_FIELD);
    expect(html).not.toContain(MONTHS_FIELD);
    expect(html).not.toContain(EXTRA_FIELD);
  });

  it("opens the minimum route on the minimum strategy", async () => {
    const html = await render("minimum");
    expect(html).toMatch(/<input[^>]*checked=""[^>]*value="minimum"/);
    expect(html).toContain(EXTRA_FIELD);
    expect(html).not.toContain(PAYMENT_FIELD);
    expect(html).not.toContain(MONTHS_FIELD);
  });

  it("offers all three strategies from either route", async () => {
    for (const strategy of ["fixed", "minimum"] as const) {
      const html = await render(strategy);
      expect(html).toContain(F.strategyFixedOption);
      expect(html).toContain(F.strategyTargetOption);
      expect(html).toContain(F.strategyMinimumOption);
      // Native radios: one tab stop and arrow-key movement for free.
      expect(count(html, /type="radio"/g)).toBe(3);
    }
  });

  it("solves the payment in the target-month strategy", async () => {
    const html = await render("target");
    expect(html).toContain(MONTHS_FIELD);
    expect(html).not.toContain(PAYMENT_FIELD);
    // 12 months at these defaults needs 4.883.350 ₫ a month.
    expect(html).toContain("4.883.350 ₫");
  });

  it("keeps exactly one live results region on either route", async () => {
    for (const strategy of ["fixed", "minimum"] as const) {
      const html = await render(strategy);
      expect(count(html, 'data-results-live="true"')).toBe(1);
      // The comparison group and the chart table are outside it.
      expect(count(html, "<table")).toBeGreaterThanOrEqual(1);
      for (const figure of html.split("<figure").slice(1)) {
        expect(figure.split("</figure>")[0]).not.toContain(
          'aria-live="polite"',
        );
      }
    }
  });
});

describe("the figures both routes show", () => {
  it("reports the plan's months, its date and the freed allocation", async () => {
    const html = await render("fixed");
    // 22 months from 15/9/2026, and the 3 triệu the household reserved.
    expect(html).toContain("22 tháng (1,8 năm)");
    expect(html).toContain("15/7/2028");
    expect(html).toContain(F.freedLabel);
    expect(html).toContain("3.000.000 ₫");
  });

  it("shows the other path with its own date, on both routes", async () => {
    const fixed = await render("fixed");
    expect(fixed).toContain(CARD_PAYOFF.chart.strategyMinimum);
    expect(fixed).toContain("90 tháng (7,5 năm)");
    expect(fixed).toContain("15/3/2034");

    const minimum = await render("minimum");
    expect(minimum).toContain("Giữ nguyên khoản trả tháng đầu");
    expect(minimum).toContain("28 tháng (2,3 năm)");
    expect(minimum).toContain("15/1/2029");
  });

  it("says which way round the comparison went", async () => {
    // On the fixed plan the reader's plan is faster and cheaper.
    const fixed = await render("fixed");
    expect(fixed).toContain(F.compareMonthsFasterLabel);
    expect(fixed).toContain(F.compareInterestSavedLabel);
    expect(fixed).toContain("68 tháng");
    // On the minimum plan it is 62 months SLOWER and dearer than holding the
    // first payment flat — and a negative figure under a "faster" label was
    // the reported defect.
    const minimum = await render("minimum");
    expect(minimum).toContain(F.compareMonthsSlowerLabel);
    expect(minimum).toContain(F.compareInterestExtraLabel);
    expect(minimum).not.toContain(F.compareMonthsFasterLabel);
    expect(minimum).not.toContain("-62 tháng");
    expect(minimum).toContain("62 tháng");
  });

  it("names the extra on top of the minimum, on both labels", async () => {
    // The reference table's own minimum rule — 5% of the amount due with a
    // 200k floor — rather than the page's illustrative 500k default, so the
    // 32 months and 15/5/2029 are the published figures.
    const html = await render("minimum", () => ({
      defaultExtra: "1.000.000",
      defaultFloor: "200.000",
    }));
    expect(html).toContain("Mức tối thiểu + 1,0 triệu");
    expect(html).toContain("32 tháng");
    expect(html).toContain("15/5/2029");
  });

  it("does not claim the whole allocation is free in the payoff month", async () => {
    const html = await render("fixed");
    // The last payment is in that month; only the remainder is released, and
    // the whole amount from the next cycle.
    expect(html).toContain("2.758.272 ₫");
    expect(html).toContain("241.728 ₫");
    expect(html).toContain("15/8/2028");
  });

  it("draws both debt paths in one figure", async () => {
    const html = await render("fixed");
    expect(count(html, "<figure")).toBe(1);
    // ONE PLOT — counted by excluding the legend's own marks rather than by a
    // bare `viewBox=` count, which is no longer a proxy for "one drawing":
    // `ChartFigure` emits one 18x10 `<svg>` per LINE-series legend entry so the
    // key carries the same dash the plot does. docs §3 already warns against
    // asserting one `<svg>` per chart; this is that warning arriving.
    const legendMarks = count(html, 'viewBox="0 0 18 10"');
    expect(legendMarks).toBe(2);
    expect(count(html, "viewBox=") - legendMarks).toBe(1);
    // Two series: one solid, one dashed — and the dash is in BOTH places, so a
    // reader who cannot separate the two hues can still match label to line.
    expect(count(html, /<path[^>]*stroke-dasharray="6 4"/g)).toBeGreaterThan(0);
    expect(count(html, /<line[^>]*stroke-dasharray="6 4"/g)).toBe(1);
    expect(html).toContain(CARD_PAYOFF.chart.tableCaption);
  });

  it("says the freed budget proves nothing, next to the figure", async () => {
    const html = await render("fixed");
    expect(html).toContain(F.budgetNotProofNotice);
  });
});

describe("recovery, not a stale answer", () => {
  it("clears the result and explains when the payment cannot clear the debt", async () => {
    // Below the first month's interest of 1.265.229,61 ₫.
    const html = await render("fixed", () => ({
      defaultPayment: "1.000.000",
    }));
    expect(html).toContain(F.noPayoffNotice);
    // No chart, and the reason plus the recovery instead of an empty axis.
    expect(html).not.toContain("<svg");
    expect(html).toContain(CARD_PAYOFF.chart.unavailableReason);
    expect(html).toContain(CARD_PAYOFF.chart.unavailableRecovery);
    // And the typed value survives in the field.
    expect(html).toContain('value="1.000.000"');
  });

  it("names the field to fix when the balance cannot be read", async () => {
    const html = await render("fixed", () => ({
      defaultBalance: "khong phai so",
    }));
    expect(html).toContain(F.balanceInvalid);
    expect(html).toContain('aria-invalid="true"');
    expect(html).not.toContain("<svg");
    expect(html).toContain('value="khong phai so"');
  });

  it("names the date field to fix, and keeps the rest of the form", async () => {
    // 31 September does not exist; the day is the field to blame.
    const html = await render("fixed", () => ({ defaultStartDay: "31" }));
    expect(html).toContain(F.startDayInvalid);
    expect(html).toContain(F.dateInvalidNotice);
    expect(html).toContain('value="31"');
    // The balance field is untouched by a bad date.
    expect(html).toContain('value="50.000.000"');
  });

  it("says so when the other path never clears, rather than showing no gap", async () => {
    const html = await render("fixed", () => ({
      defaultPercent: "0",
      defaultFloor: "0",
    }));
    expect(html).toContain(F.noComparisonNotice);
    // The plan itself still answers.
    expect(html).toContain("22 tháng (1,8 năm)");
    expect(html).toContain("<svg");
  });

  it("reports a household allocation that does not cover the plan", async () => {
    const html = await render("fixed", () => ({ defaultBudget: "1.000.000" }));
    expect(html).toContain(F.budgetShortfallNotice);
    // The freed figure is still the stated allocation, not the plan's payment.
    expect(html).toContain("1.000.000 ₫");
    // And the dates are labelled as a hypothetical plan rather than a
    // feasible one.
    expect(F.budgetShortfallNotice).toContain("GIẢ ĐỊNH");
    // Nothing is left over in the payoff month at this allocation.
    expect(html).toContain(
      fill(F.freedTimingNoneNotice, {
        lastPayment: "2.758.272 ₫",
        payoffDate: "15/7/2028",
        fullMonth: "23",
        fullDate: "15/8/2028",
      }),
    );
  });

  it("separates a plan past the model's horizon from one that never clears", async () => {
    // A 1.201-month target has a real annuity payment, so the debt DOES
    // clear — just not inside the 1.200-month window the model supports.
    // "This never ends" would be the wrong sentence.
    const html = await render("target", () => ({
      defaultMonths: "1201",
    }));
    expect(html).toContain(
      fill(F.beyondHorizonNotice, { limit: "1.200" }),
    );
    expect(html).not.toContain(F.noPayoffNotice);
    expect(html).not.toContain("<svg");
  });

  it("drops the freed row's figure when no allocation was stated", async () => {
    const html = await render("fixed", () => ({ defaultBudget: "0" }));
    expect(html).toContain(F.freedLabel);
    // The row is there with a placeholder; the detail block does not invent a
    // "0 ₫ đã dành riêng".
    expect(html).not.toContain(F.budgetLabelDetail);
  });
});

describe("the second route keeps its own framing", () => {
  it("has a title, a notice, prose and an FAQ of its own", () => {
    expect(CARD_MINIMUM.pageTitle).not.toBe(CARD_PAYOFF.pageTitle);
    expect(CARD_MINIMUM.trapNotice.length).toBeGreaterThan(200);
    expect(CARD_MINIMUM.formula.body.length).toBeGreaterThanOrEqual(3);
    expect(CARD_MINIMUM.faq.items.length).toBeGreaterThanOrEqual(3);
  });
});
