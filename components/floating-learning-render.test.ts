/**
 * Rendered-markup contracts for the F2 panel on /cong-cu/lai-suat-tha-noi/.
 *
 * Server-rendered at the shipped defaults and with patched defaults, as the
 * page's own test does. No jsdom: a slider drag is not driven; the states it
 * reaches are asserted on the pure view in `floating-learning.test.ts`.
 * Nothing here checks appearance, focus or speech.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FLOATING_LEARNING as L } from "@/content/calculators/floating-learning";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { fill } from "@/lib/calc/charts/labels";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/floating-loan";
type FormPatch = Partial<Record<keyof typeof FLOATING_LOAN.form, string>>;

async function render(options?: { stressPoints?: number; patch?: FormPatch }): Promise<string> {
  vi.resetModules();
  if (options?.patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/floating-loan")>(CONTENT);
      return {
        FLOATING_LOAN: { ...actual.FLOATING_LOAN, form: { ...actual.FLOATING_LOAN.form, ...options.patch } },
      };
    });
  }
  try {
    const { FloatingLoanCalculator } = await import("@/components/floating-loan-calculator");
    return renderToStaticMarkup(
      createElement(FloatingLoanCalculator, {
        initialStressPoints: options?.stressPoints ?? 0,
        actions: createElement("div", { "data-test": "actions" }),
        nextSteps: createElement("div", { "data-test": "next-steps" }),
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const panelOf = (html: string) => markupRegion(html, 'data-floating-learning="true"', "section") ?? "";
const figureOf = (html: string) => markupRegion(html, 'data-learning-illustration="true"', "figure") ?? "";
const count = (html: string, needle: string) => html.split(needle).length - 1;
const stepTag = (html: string, key: string) =>
  html.match(new RegExp(`<button[^>]*data-month-step="${key}"[^>]*>`))?.[0] ?? "";
const isDisabled = (tag: string) => / aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""));

describe("where the panel sits", () => {
  it("once, in the result column: after the answer, before the actions and the chart", async () => {
    const html = await render();
    expect(count(html, 'data-floating-learning="true"')).toBe(1);
    const at = html.indexOf('data-floating-learning="true"');
    const result = html.indexOf('data-calc-region="result"');
    expect(result).toBeGreaterThan(-1);
    expect(at).toBeGreaterThan(result);
    // After the ONE live answer and the scenario comparison.
    expect(at).toBeGreaterThan(html.indexOf('data-results-live="true"'));
    expect(at).toBeGreaterThan(html.indexOf(FLOATING_LOAN.form.stressComparisonTitle));
    // The whole panel precedes the actions, the chart and the next steps.
    const end = html.lastIndexOf("<section", at) + panelOf(html).length;
    expect(html.indexOf('data-test="actions"')).toBeGreaterThan(end);
    expect(html.indexOf(FLOATING_LOAN.chart.title)).toBeGreaterThan(end);
    expect(html.indexOf('data-test="next-steps"')).toBeGreaterThan(end);
    // Same order at every width: no CSS reordering in the panel.
    expect(panelOf(html)).not.toMatch(/\border-|\bflex-col-reverse\b|\bflex-row-reverse\b/);
  });

  it("keeps exactly one live region, and none inside the panel", async () => {
    for (const stressPoints of [0, 2]) {
      const html = await render({ stressPoints });
      expect(count(html, 'data-results-live="true"')).toBe(1);
      const p = panelOf(html);
      expect(p).not.toContain("aria-live");
      expect(p).not.toContain('role="status"');
    }
  });

  it("the card opts into the compact phone padding; the panel is frameless below sm", async () => {
    const html = await render();
    expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
    expect(panelOf(html)).toMatch(/^<section [^>]*class="mt-6 sm:rounded-2xl sm:border sm:border-ink-4\/20 sm:bg-white sm:p-4"/);
  });
});

describe("the calendar around the promotional boundary, at the shipped loan", () => {
  it("opens on month 13 and names its rate, its stretch and the boundary", async () => {
    const figure = figureOf(panelOf(await render()));
    expect(figure).toContain(`${fill(L.caption, { month: 13, rate: "11,00%/năm" })} (${L.afterPromo})`);
    expect(figure).toContain('data-floating-boundary="13"');
    expect(figure).toContain(fill(L.boundaryMark, { month: 13 }));
    expect(figure).toContain(
      fill(L.ratesPromo, { last: 12, promoRate: "7,50%/năm", first: 13, postRate: "11,00%/năm" }),
    );
    // The term as two phases on one axis: 12 of 240 months, then 228.
    expect(figure).toMatch(/data-phase="promo" data-phase-months="1-12" data-percent="5.00"/);
    expect(figure).toMatch(/data-phase="post" data-phase-months="13-240" data-percent="95.00"/);
    expect(figure).toContain('data-floating-month-mark="13"');
  });

  it("names the payment bar's whole, and splits it into principal and interest", async () => {
    const figure = figureOf(panelOf(await render()));
    expect(figure).toContain(fill(L.splitWhole, { month: 13 }));
    const bar = markupRegion(figure, 'data-split-bar="floating-payment"') ?? "";
    const pct = (key: string) => Number(bar.match(new RegExp(`data-segment="${key}" data-percent="([^"]+)"`))![1]);
    expect(pct("principal") + pct("interest")).toBeCloseTo(100, 1);
    expect(figure).toContain(L.principalMeaning);
    expect(figure).toContain(L.interestMeaning);
    expect(figure).toContain(fill(L.headline, { payment: "20,48 triệu" }));
  });

  it("shows the payment on both sides of the boundary, and no separate peak", async () => {
    const figure = figureOf(panelOf(await render()));
    expect(figure).toContain('data-floating-level="promo"');
    expect(figure).toContain('data-floating-level="post"');
    expect(figure).not.toContain('data-floating-level="peak"');
    expect(figure).toContain(fill(L.changeUp, { month: 13, amount: "4,37 triệu" }));
    expect(figure).toContain(L.levelsAxis);
  });

  it("uses the text-free 3D scene as context only", async () => {
    const figure = figureOf(panelOf(await render()));
    const art = markupRegion(figure, 'data-infographic-art="true"') ?? "";
    expect(art).toContain('src="/images/tools/mortgage-living-scene-v1-650.webp"');
    expect(art).toContain(`alt="${L.artAlt}"`);
    expect(figure).not.toMatch(/data-scene-stage|data-scene-tag|data-scene-mark/);
  });

  it("offers 44 px month steps and jumps to either side of the boundary", async () => {
    const html = panelOf(await render());
    expect(html).toMatch(/<input id="[^"]+" type="range" min="1" max="240" step="1" [^>]*value="13"/);
    expect(html).toMatch(/data-month-steps="true" class="grid grid-cols-2 gap-1\.5 min-\[380px\]:grid-cols-4"/);
    for (const key of ["first", "prev", "next", "last", "promoEnd", "boundary"]) {
      const tag = stepTag(html, key);
      expect(tag, key).toContain("min-h-11");
      expect(tag, key).toContain(`aria-label="${L.steps[key as keyof typeof L.steps].name}"`);
    }
    // On the boundary already: its own jump is off, the one before it is not.
    expect(isDisabled(stepTag(html, "boundary"))).toBe(true);
    expect(isDisabled(stepTag(html, "promoEnd"))).toBe(false);
    expect(isDisabled(stepTag(html, "first"))).toBe(false);
  });

  it("lets the long boundary labels wrap inside their pill, stacked below 380 px", async () => {
    const html = panelOf(await render());
    expect(html).toMatch(/data-boundary-steps="true" class="mt-1\.5 grid grid-cols-1 gap-1\.5 min-\[380px\]:grid-cols-2"/);
    for (const key of ["promoEnd", "boundary"]) {
      const tag = stepTag(html, key);
      expect(tag, key).not.toContain("whitespace-nowrap");
      expect(tag, key).toContain("min-h-11");
      expect(tag, key).toContain("px-3");
      expect(tag, key).toContain("text-center");
    }
    // The four short steps keep their one-line labels.
    expect(stepTag(html, "first")).toContain("whitespace-nowrap");
  });

  it("keeps the mechanism and this month's exact đồng collapsed", async () => {
    const p = panelOf(await render());
    expect(p).toMatch(/<details data-floating-more="true"(?![^>]*\sopen)/);
    const more = p.slice(p.indexOf('data-floating-more="true"'));
    expect(more).toContain(L.mechanism);
    expect(more).toContain(L.assumption);
    expect(more).toContain("20.479.346 ₫");
    expect(more).toContain("1.955.136.259 ₫");
    // The exact đồng are not repeated in the figure above.
    expect(figureOf(p)).not.toContain("1.955.136.259 ₫");
  });
});

describe("budget: from the reader's field, or not at all", () => {
  it("no budget: a neutral sentence, never green, and no budget line", async () => {
    const p = panelOf(await render());
    const tag = p.match(/<p data-floating-budget="none" class="([^"]+)"/)?.[1] ?? "";
    expect(tag).not.toMatch(/status-met|status-shortfall/);
    expect(p).toContain(L.budgetNone);
    expect(p).not.toContain("data-floating-budget-line");
  });

  it("a typed budget the reset exceeds: red WITH words, and the line on the levels", async () => {
    const p = panelOf(await render({ patch: { defaultBudget: "18.000.000" } }));
    const tag = p.match(/<p data-floating-budget="over" class="([^"]+)"/)?.[1] ?? "";
    expect(tag).toContain("text-status-shortfall");
    expect(p).toContain(fill(L.budgetOver, { month: 13, amount: "2,48 triệu" }));
    expect(p).toContain("data-floating-budget-line=");
    expect(p).toContain(fill(L.levelsBudget, { budget: "18,00 triệu" }));
  });
});

describe("stress presets and the other shapes", () => {
  it("a chosen preset compares the same month with the reader's rate", async () => {
    const stressed = panelOf(await render({ stressPoints: 1 }));
    expect(stressed).toContain('data-floating-compare="true"');
    expect(stressed).toContain(fill(L.scenarioShift, { points: 1, rate: "12,00%/năm" }));
    const baseline = panelOf(await render());
    expect(baseline).not.toContain("data-floating-compare");
    expect(baseline).toContain(L.scenarioBaseline);
  });

  it("no promotion: no boundary mark and no boundary jumps", async () => {
    const p = panelOf(await render({ patch: { defaultPromoMonths: "0" } }));
    expect(p).toContain(L.noPromo);
    expect(p).not.toContain("data-floating-boundary");
    expect(p).not.toContain("data-boundary-steps");
    expect(p).toContain('data-learning-month="1"');
  });

  it("a recurring step: the later peak is its own level, at its own month", async () => {
    const html = await render({ stressPoints: 1, patch: { defaultAdjustStep: "0,5" } });
    const p = panelOf(html);
    expect(p).toContain('data-floating-level="peak"');
    expect(p).toContain(fill(L.levelPeak, { month: 229 }));
    expect(html).not.toContain("từ tháng 229");
  });

  it("an invalid field draws no figure, offers the fix, and recovers", async () => {
    const p = panelOf(await render({ stressPoints: 2, patch: { defaultPostRate: "abc" } }));
    expect(p).toContain('data-scene-state="unknown"');
    expect(p).toContain(L.unknown);
    expect(p).toContain('data-scene-fix="true"');
    expect(p).not.toMatch(/data-floating-headline|data-floating-level|₫/);
    expect(panelOf(await render({ stressPoints: 2 }))).toContain('data-scene-state="ready"');
  });

  it("FL2: an accepted but uncomputable amount (10^308) is a named calculation limit, no field blamed", async () => {
    const html = await render({ patch: { defaultAmount: `1${"0".repeat(308)}` } });
    expect(html).not.toContain('aria-invalid="true"');
    const p = panelOf(html);
    expect(p).toContain('data-scene-state="modelLimit"');
    expect(p).toContain(L.modelLimit);
    expect(p).not.toContain(L.unknown);
    // No single field is blamed: the recovery opens the form.
    expect(p).toContain('data-scene-fix="inputs"');
    expect(p).toContain(L.fixInputs);
    expect(p).not.toContain('data-scene-fix="amount"');
    expect(p).not.toContain(L.fixAmount);
    expect(p).not.toMatch(/data-floating-headline|data-floating-level|data-split-bar|₫/);
    expect(html).toMatch(/data-calc-field="amount"/);
  });

  it("FL1: a finite schedule with unprintable amounts (10^24) draws nothing and quotes no '— ₫'", async () => {
    const html = await render({ patch: { defaultAmount: `1${"0".repeat(24)}` } });
    expect(html).not.toContain('aria-invalid="true"');
    const p = panelOf(html);
    expect(p).toContain('data-scene-state="displayLimit"');
    expect(p).toContain(fill(L.displayLimit, { what: L.displayWhat.amount }));
    expect(p).toContain('data-scene-fix="amount"');
    expect(p).not.toContain('data-scene-fix="budget"');
    expect(p).not.toMatch(/data-floating-headline|data-floating-level|data-floating-exact|data-split-bar/);
    expect(p).not.toContain("— ₫");
  });

  it("a budget-only display limit (10^19): the jump and the label are the BUDGET's", async () => {
    const html = await render({ patch: { defaultBudget: "10.000.000.000.000.000.000" } });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toMatch(/data-calc-field="budget"/);
    const p = panelOf(html);
    expect(p).toContain('data-display-limit="budget"');
    expect(p).toContain(fill(L.displayLimit, { what: L.displayWhat.budget }));
    expect(p).toContain('data-scene-fix="budget"');
    expect(p).toContain(L.fixBudget);
    expect(p).not.toContain('data-scene-fix="amount"');
  });

  it("loan and budget both unprintable: both real fields are offered", async () => {
    const p = panelOf(
      await render({ patch: { defaultAmount: `1${"0".repeat(24)}`, defaultBudget: "10.000.000.000.000.000.000" } }),
    );
    expect(p).toContain('data-display-limit="amount budget"');
    expect(p).toContain(fill(L.displayLimit, { what: L.displayWhat.both }));
    expect(p).toContain('data-scene-fix="amount"');
    expect(p).toContain('data-scene-fix="budget"');
  });

  it("the display-limit copy speaks of THIS illustration, not the whole page", () => {
    expect(L.displayLimit.startsWith("Hình này")).toBe(true);
    expect(L.displayLimit).not.toMatch(/Trang không vẽ/);
    expect(L.modelLimit).not.toMatch(/số tiền vay này/);
    expect(L.rateLimit.startsWith("Hình này")).toBe(true);
  });

  it("round 3: 1 ₫ over 2 months at 10^19 %/năm names the RATE limit, jumps to the post rate, prints no '—'", async () => {
    const html = await render({
      patch: {
        defaultAmount: "1",
        defaultTerm: "2",
        defaultPromoMonths: "0",
        defaultPromoRate: "0",
        defaultPostRate: "10000000000000000000",
        defaultAdjustEvery: "12",
        defaultAdjustStep: "0",
      },
    });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toMatch(/data-calc-field="postRate"/);
    const p = panelOf(html);
    expect(p).toContain('data-scene-state="rateLimit"');
    expect(p).toContain('data-rate-limit="postRate"');
    expect(p).toContain(L.rateLimit);
    expect(p).toContain('data-scene-fix="postRate"');
    expect(p).toContain(L.fixRate.postRate);
    expect(p).not.toMatch(/data-floating-caption|data-floating-rates|data-floating-headline|lãi —/);
  });

  it("every rate control carries a field key for the jump", async () => {
    const html = await render();
    for (const key of ["promoRate", "postRate", "adjustStep", "rateCap"]) {
      expect(html).toMatch(new RegExp(`data-calc-field="${key}"`));
    }
    expect(panelOf(html)).toContain('data-scene-state="ready"');
  });

  it("an invalid amount is still `invalid`, and its jump goes to the aria-invalid field", async () => {
    const html = await render({ patch: { defaultAmount: "0" } });
    expect(html).toMatch(/aria-invalid="true"/);
    const p = panelOf(html);
    expect(p).toContain('data-scene-state="unknown"');
    expect(p).toContain('data-scene-fix="true"');
  });
});

describe("the whole tool reads the lesson's limit reason (round 4)", () => {
  const L2 = FLOATING_LOAN.limits;
  const resultRegion = (html: string) => markupRegion(html, 'data-calc-region="result"') ?? "";
  const HUGE_AMOUNT = `1${"0".repeat(308)}`;
  const BIG_AMOUNT = `1${"0".repeat(24)}`;
  const RATE_PATCH: FormPatch = {
    defaultAmount: "1",
    defaultTerm: "2",
    defaultPromoMonths: "0",
    defaultPromoRate: "0",
    defaultPostRate: "10000000000000000000",
    defaultAdjustEvery: "12",
    defaultAdjustStep: "0",
  };

  it("10^308: no field blamed anywhere — result status and chart name the calculation limit", async () => {
    const html = await render({ patch: { defaultAmount: HUGE_AMOUNT } });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain('data-floating-limit="modelLimit"');
    expect(html).toContain(L2.modelLimit.result);
    expect(html).toContain(L2.modelLimit.chart);
    expect(html).not.toContain(FLOATING_LOAN.chart.unavailableRecovery);
    expect(html).not.toContain("— ₫");
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("10^24: no '— ₫' in rows, pinned answer or chart; no quantitative chart or table", async () => {
    const html = await render({ patch: { defaultAmount: BIG_AMOUNT } });
    expect(html).toContain('data-floating-limit="displayLimit"');
    expect(html).toContain(L2.displayLimit.chart);
    expect(html).not.toContain("— ₫");
    expect(html).not.toContain(FLOATING_LOAN.chart.unavailableRecovery);
    expect(html).not.toContain(FLOATING_LOAN.form.table.caption);
    expect(resultRegion(html)).not.toMatch(/\d tỷ|\d triệu/);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("rate 10^19: no rate placeholder sentence — the chart and status name the rate limit", async () => {
    const html = await render({ patch: RATE_PATCH });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain('data-floating-limit="rateLimit"');
    expect(html).toContain(L2.rateLimit.chart);
    expect(html).not.toMatch(/—\/năm|—%|— ₫/);
    expect(html).not.toContain(FLOATING_LOAN.chart.unavailableRecovery);
  });

  it("the ordinary 2 tỷ loan is unchanged: figures, chart and table, no limit status", async () => {
    const html = await render();
    expect(html).not.toContain("data-floating-limit=");
    expect(html).toContain("20.479.346 ₫");
    expect(html).toContain(FLOATING_LOAN.form.table.caption);
    expect(html).not.toContain(L2.modelLimit.chart);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(html).toContain('aria-controls="lai-suat-tha-noi-ket-qua"');
  });

  it("invalid input keeps the input-error chart copy and no limit status", async () => {
    const html = await render({ patch: { defaultPostRate: "abc" } });
    expect(html).toMatch(/aria-invalid="true"/);
    expect(html).not.toContain("data-floating-limit=");
    expect(html).toContain(FLOATING_LOAN.chart.unavailableRecovery);
  });
});
