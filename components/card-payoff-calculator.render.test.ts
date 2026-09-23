/**
 * Rendered-markup contracts for the ONE card workspace behind
 * /cong-cu/tra-het-the-tin-dung/ and /cong-cu/tra-toi-thieu-the-tin-dung/ —
 * audit rows 31 and 32.
 *
 * WHAT THIS FILE CAN ESTABLISH: that both routes render the SAME structure
 * (row 32 asks for that in as many words), that the announced group leads
 * with the payoff time and the total interest, that the signed difference
 * against the other rule is announced rather than buried in the comparison
 * group, that the comparison group and the schedule detail sit in the
 * full-width detail region at `live={false}`, and that there is exactly one
 * live region per route.
 *
 * THE ARITHMETIC IS `lib/calc/card-plan.test.ts`'s and the figures pinned
 * below are the ones the content module already documents for the shipped
 * defaults. They are repeated here because they are the pre-implementation
 * runtime baseline.
 *
 * WHAT IT CANNOT: appearance. Whether "hai cách trả dễ so sánh trên mobile"
 * is true of the rendered page at a phone width is not observable from
 * static markup — that is Codex's review, not this file's claim.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import type { CardStrategy } from "@/lib/calc/card-plan";

const CONTENT = "@/content/calculators/card-payoff";

type FormPatch = Partial<Record<keyof typeof CARD_PAYOFF.form, string>>;

async function render(
  strategy: CardStrategy,
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
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
          form: { ...actual.CARD_PAYOFF.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/card-payoff-calculator");
    return renderToStaticMarkup(
      createElement(loaded.CardPayoffCalculator, { strategy, ...props }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = CARD_PAYOFF.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

const ROUTES: CardStrategy[] = ["fixed", "minimum"];

describe("both routes render one structure", () => {
  for (const strategy of ROUTES) {
    it(`gives the ${strategy} route the same regions and ids`, async () => {
      const html = await render(strategy);
      expect(html).toContain('id="the-tin-dung-nhap" data-calc-region="form"');
      expect(html).toContain('id="the-tin-dung-ket-qua"');
      expect(html).toContain('aria-controls="the-tin-dung-ket-qua"');
      expect(html).toContain('data-calc-cta="true"');
      // A "Hai cột" row: the split, and a full-width detail band under it.
      expect(html).toContain("lg:grid-cols-5");
      expect(markupRegion(html, 'data-calc-region="detail"')).not.toBeNull();
      // And exactly one announced region, on both routes.
      expect(html.split('data-results-live="true"').length - 1).toBe(1);
    });

    it(`keeps all three strategies reachable from the ${strategy} route`, async () => {
      const html = await render(strategy);
      const form = markupRegion(html, 'data-calc-region="form"');
      expect(form!).toContain(C.strategyLegend);
      expect(form!).toContain(C.strategyFixedOption);
      expect(form!).toContain(C.strategyTargetOption);
      expect(form!).toContain(C.strategyMinimumOption);
      // The card's own minimum rule stays disclosed, not hidden.
      expect(form!).toContain(C.minimumTitle);
    });
  }
});

describe("the payoff time and the total interest lead", () => {
  it("headlines the months on the fixed route, with the shipped figures", async () => {
    const html = await render("fixed");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // 50 triệu at 30%, trả 3.000.000 ₫: 22 tháng, hết nợ 15/7/2028,
    // lãi 15.758.272 ₫.
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.monthsResultLabel,
    );
    expect(live!).toContain("22 tháng");
    expect(live!).toContain("15.758.272 ₫");
    expect(live!).toContain("15/7/2028");
    // THE DATE IS NO LONGER A PEER ROW — see the repair block at the end of
    // this file. It hangs on the headline row as a labelled qualifier, so it
    // now renders BEFORE the emphasised value and before the interest.
    expect(live!.indexOf(C.payoffDateLabel)).toBeLessThan(
      live!.indexOf(HEADLINE),
    );
    expect(live!.indexOf(C.payoffDateLabel)).toBeLessThan(
      live!.indexOf(C.totalInterestLabel),
    );
  });

  it("headlines the months on the minimum route too", async () => {
    const html = await render("minimum");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.monthsResultLabel,
    );
    // Chỉ trả tối thiểu: 90 tháng, hết nợ 15/3/2034, lãi 43.091.470 ₫.
    expect(live!).toContain("90 tháng");
    expect(live!).toContain("43.091.470 ₫");
    expect(live!).toContain("15/3/2034");
  });

  it("headlines the required payment when the months are the input", async () => {
    // In the target strategy the months are typed, so repeating them is not
    // a result. 12 tháng needs 4.883.350 ₫/tháng.
    const html = await render("target");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.paymentResultLabel,
    );
    expect(live!).toContain("4.883.350 ₫");
    expect(live!).not.toContain(C.monthsResultLabel);
  });

  it("keeps the freed household money and its two dates announced", async () => {
    const html = await render("fixed");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.freedLabel);
    // The payoff month is not a free month: the notice that says so sits
    // beside the figure, not in the detail band.
    expect(html).toContain(C.budgetNotProofNotice);
    expect(html.indexOf(C.budgetNotProofNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("the difference against the other rule is announced", () => {
  it("says faster, with the gap, on the fixed route", async () => {
    // 22 tháng against the minimum rule's 90: faster by 68.
    const html = await render("fixed");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.compareMonthsFasterLabel);
    expect(live!).toContain("68 tháng");
    expect(live!).not.toContain(C.compareMonthsSlowerLabel);
  });

  it("says slower, with the gap, on the minimum route", async () => {
    // THE LABEL FOLLOWS THE SIGN. 90 tháng against paying the same first
    // minimum as a flat amount, 28 tháng: slower by 62. "Nhanh hơn" here
    // would be a claim the figures contradict.
    const html = await render("minimum");
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.compareMonthsSlowerLabel);
    expect(live!).toContain("62 tháng");
    expect(live!).not.toContain(C.compareMonthsFasterLabel);
  });
});

describe("the comparison group and the schedule are detail", () => {
  it("moves the other rule's four figures below, unannounced", async () => {
    const html = await render("fixed");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.compareTitle);
    expect(detail!).toContain(C.compareStrategyLabel);
    expect(detail!).toContain(C.compareDateLabel);
    expect(detail!).toContain(C.compareInterestLabel);
    // The minimum path: 90 tháng, 15/3/2034, lãi 43.091.470 ₫.
    expect(detail!).toContain("15/3/2034");
    expect(detail!).toContain("43.091.470 ₫");
    // And the interest gap keeps its own sign-aware label, down here.
    expect(detail!).toContain(C.compareInterestSavedLabel);
    // Still one live region: this group is not a second announcement.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("keeps the schedule disclosure and the date convention in the band", async () => {
    const html = await render("fixed");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.detailToggle);
    expect(detail!).toContain(C.detailTitle);
    expect(detail!).toContain(C.dateConvention);
  });

  it("renders the chart beside the answer, not in the band", async () => {
    const html = await render("fixed");
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain("<svg");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).not.toContain("<svg");
  });
});

describe("the compact current answer on a long form", () => {
  for (const strategy of ROUTES) {
    it(`pins the ${strategy} route's one figure, not its result column`, async () => {
      const html = await render(strategy);
      // The pinned block is the CTA's own, inside the form region.
      const form = markupRegion(html, 'data-calc-region="form"');
      expect(form!).toContain("fh-cta-pin");
      expect(form!).toContain('data-calc-answer="true"');
      // It restates the headline figure and nothing else: no second live
      // region, no comparison rows, no chart.
      expect(html.split('data-calc-answer="true"').length - 1).toBe(1);
      expect(form!).toContain(C.monthsResultLabel);
      expect(form!).not.toContain(C.totalInterestLabel);
      expect(form!).not.toContain(C.compareTitle);
      // VISUAL ONLY. The authoritative copy is the row in the live region;
      // announcing the pinned duplicate would report one recomputation twice.
      const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
      expect(html).toContain('aria-hidden="true" data-calc-answer="true"');
      // The same formatted string as the announced row — one rounding.
      const months = strategy === "fixed" ? "22 tháng" : "90 tháng";
      expect(pinned.slice(0, 400)).toContain(months);
    });
  }

  it("shows the required payment instead when the months are typed", async () => {
    const html = await render("target");
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).toContain(C.paymentResultLabel);
    expect(form!).not.toContain(C.monthsResultLabel);
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
    expect(pinned.slice(0, 400)).toContain("4.883.350 ₫");
  });
});

describe("the refusals and the actions", () => {
  it("still says when a payment can never clear the debt", async () => {
    // 5.000 ₫/tháng against 50 triệu at 30%: the interest outruns it.
    const html = await render("fixed", { defaultPayment: "5.000" });
    expect(html).toContain(C.noPayoffNotice);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("22 tháng");
    // The reason sits with the missing answer, above the detail band.
    expect(html.indexOf(C.noPayoffNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("still blames an unreadable start date without blaming a number", async () => {
    const html = await render("fixed", { defaultStartDay: "31", defaultStartMonth: "2" });
    expect(html).toContain(C.dateInvalidNotice);
  });

  it("still bounds the balance, and blames that field", async () => {
    const html = await render("fixed", { defaultBalance: "0" });
    expect(html).toContain(C.balanceInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("puts the actions after the answer and before the guidance", async () => {
    const html = await render("fixed", undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain('data-test="actions"');
    expect(result!).toContain('data-test="next-steps"');
    expect(result!.indexOf('data-test="actions"')).toBeLessThan(
      result!.indexOf("<svg"),
    );
    expect(result!.indexOf("<svg")).toBeLessThan(
      result!.indexOf('data-test="next-steps"'),
    );
  });
});

/**
 * THE MEASURED REPAIR: five peer announced figures became one main answer plus
 * two support rows, plus the freed allocation when the household stated one.
 *
 * The count is asserted through `aria-atomic="true"`, which `ResultRow` puts on
 * every row it renders and nothing else in this component does — so it counts
 * announced ROWS rather than labels that might appear in a note, a caption or
 * the comparison group below.
 */
describe("the announced group is one answer with support, not five peers", () => {
  /** Rows inside the announced region. */
  const rows = (live: string) => live.split('aria-atomic="true"').length - 1;

  for (const strategy of ["fixed", "target", "minimum"] as CardStrategy[]) {
    it(`announces four rows on the ${strategy} strategy, with an allocation stated`, async () => {
      const html = await render(strategy);
      const live = markupRegion(html, 'data-results-live="true"');
      expect(live).not.toBeNull();
      // Headline + interest + signed comparison + freed allocation.
      expect(rows(live!)).toBe(4);
      // Still exactly one emphasised answer, and the date is not one of them.
      expect(live!.split(HEADLINE).length - 1).toBe(1);
      expect(live!).toContain(C.payoffDateLabel);
      expect(live!).toContain(C.totalInterestLabel);
      expect(live!).toContain(C.freedLabel);
    });

    it(`drops to three rows on the ${strategy} strategy when the budget is blank, keeping the date`, async () => {
      const html = await render(strategy, { defaultBudget: "0" });
      const live = markupRegion(html, 'data-results-live="true"');
      // The freed row is GONE rather than showing a dash for a number nobody
      // entered — `planCardPayoff` returns a null budget at a zero allocation.
      expect(rows(live!)).toBe(3);
      expect(live!).not.toContain(C.freedLabel);
      // THE DATE SURVIVES A BLANK BUDGET. That is the part of the old layout
      // this repair was required to preserve.
      expect(live!).toContain(C.payoffDateLabel);
      // And so does the signed comparison.
      expect(
        live!.includes(C.compareMonthsFasterLabel) ||
          live!.includes(C.compareMonthsSlowerLabel) ||
          live!.includes(C.compareMonthsEqualLabel),
      ).toBe(true);
    });
  }

  it("keeps the target-month strategy headlining the solved payment", async () => {
    const html = await render("target", { defaultBudget: "0" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.paymentResultLabel,
    );
    expect(live!).toContain("4.883.350 ₫");
    expect(live!).not.toContain(C.monthsResultLabel);
  });

  it("carries the date with its own label, on the headline row", async () => {
    const html = await render("fixed");
    const live = markupRegion(html, 'data-results-live="true"');
    const headlineRow = live!.slice(
      live!.indexOf(C.monthsResultLabel),
      live!.indexOf(C.totalInterestLabel),
    );
    expect(headlineRow).toContain(`${C.payoffDateLabel}: 15/7/2028`);
    // One row, so one announcement: no row boundary is crossed between the
    // headline's own label and the qualifier, so both sit inside the same
    // `aria-atomic` node.
    expect(
      rows(
        live!.slice(
          live!.indexOf(C.monthsResultLabel),
          live!.indexOf(C.payoffDateLabel),
        ),
      ),
    ).toBe(0);
  });

  it("keeps the budget timing notice beside the figure it qualifies", async () => {
    const html = await render("fixed");
    // Unchanged by the repair, and still above the detail band.
    expect(html).toContain(C.budgetNotProofNotice);
    expect(html.indexOf(C.budgetNotProofNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("still shows the other rule's own date in the comparison group", async () => {
    // The date was consolidated in the ANNOUNCED group only. The comparison
    // group keeps all four of its figures, unannounced.
    const html = await render("fixed");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.compareDateLabel);
    expect(detail!).toContain("15/3/2034");
  });
});
