/**
 * Rendered-markup contracts for the A2 learning panel on /cong-cu/vay-mua-nha/
 * — "Thước tháng", the monthly payment ruler (2026-09-28).
 *
 * No jsdom, so a press or a drag cannot be driven. The page is rendered at
 * its opening state and with patched defaults; the panel is also rendered on
 * its own with a REAL trial — made by `makeMortgageTrial` and measured with
 * `computeLoan` — so the markup asserted is the markup a press produces.
 * Nothing here checks appearance, focus, speech or comprehension.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MortgageLearningPanel } from "@/components/mortgage-learning-panel";
import {
  makeMortgageTrial,
  mortgageImpactView,
  mortgageRuler,
} from "@/components/mortgage-learning";
import { LOAN } from "@/content/calculators/loan";
import { MORTGAGE_LEARNING as L } from "@/content/calculators/mortgage-learning";
import { computeLoan } from "@/lib/calc/loan";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/loan";
type FormPatch = Partial<Record<keyof typeof LOAN.form, string>>;
const S = L.scene;

async function renderPage(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/loan")>(CONTENT);
      return { LOAN: { ...actual.LOAN, form: { ...actual.LOAN.form, ...patch } } };
    });
  }
  try {
    const loaded = await import("@/components/loan-calculator");
    return renderToStaticMarkup(
      createElement(loaded.LoanCalculator, {
        actions: createElement("div", { "data-test": "actions" }),
        nextSteps: createElement("div", { "data-test": "next-steps" }),
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const count = (html: string, needle: string) => html.split(needle).length - 1;
const panelOf = (html: string) =>
  markupRegion(html, 'data-mortgage-learning="true"', "section") ?? "";
const figureOf = (html: string) =>
  markupRegion(html, 'data-learning-illustration="true"', "figure") ?? "";
/** Whether a button carries a REAL `aria-disabled="true"`, not a CSS variant. */
function isDisabled(html: string, marker: string): boolean {
  const tag = html.match(new RegExp(`<button[^>]*${marker}[^>]*>`))?.[0];
  if (tag === undefined) throw new Error(`no button ${marker}`);
  return / aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""));
}
/** The exact đồng in one row of the collapsed detail, as a number. */
function exactRow(html: string, key: string): number {
  const cell = markupRegion(html, `data-exact-row="${key}"`) ?? "";
  const dd = cell.match(/<dd[^>]*>([^<]*)</)?.[1] ?? "";
  return Number(dd.replace(/[^\d]/g, ""));
}

const SHIPPED = {
  amount: LOAN.form.defaultAmount,
  rate: LOAN.form.defaultRate,
  term: LOAN.form.defaultTerm,
  termUnit: LOAN.form.defaultTermUnit,
  extra: LOAN.form.defaultExtra,
  method: LOAN.form.defaultMethod,
  tax: "0",
  insurance: "0",
  otherFee: "0",
  pmi: "0",
  price: "",
  pmiMode: LOAN.form.defaultPmiMode,
};
const BEFORE = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 240 })!;
const EXTRA = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 240, extraPerMonth: 1e6 })!;

function panel(ruler: ReturnType<typeof mortgageRuler>, extra: Partial<Parameters<typeof MortgageLearningPanel>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(MortgageLearningPanel, {
      sample: true,
      ruler,
      onMonth: () => {},
      availability: { term: { enabled: true }, extra: { enabled: true } },
      termLabel: "Kéo dài kỳ hạn thêm 5 năm",
      impact: null,
      canUndo: false,
      formId: "vay-mua-nha-nhap",
      onTry: () => {},
      onUndo: () => {},
      ...extra,
    }),
  );
}

describe("the mortgage page at its opening state", () => {
  // SUPERSEDED ORDER, changed on purpose: the panel was AFTER the answer rows;
  // the user's later correction puts it FIRST inside the result card, before
  // the rows (see result-visual-first.test.ts). Everything after is unchanged.
  it("puts the learning response FIRST in the result card, BEFORE the answer rows, the actions and the whole-term chart", async () => {
    const html = await renderPage();
    expect(count(html, 'data-mortgage-learning="true"')).toBe(1);
    const at = html.indexOf('data-mortgage-learning="true"');
    expect(html.indexOf('data-calc-region="form"')).toBeLessThan(at);
    expect(html.indexOf('data-results-live="true"')).toBeGreaterThan(at);
    // The panel's region starts at its `<section`, before the attribute.
    const panelEnd = html.lastIndexOf("<section", at) + panelOf(html).length;
    // The rows follow the panel; the "Làm gì tiếp" actions follow both.
    expect(html.indexOf('data-results-live="true"')).toBeGreaterThan(panelEnd);
    expect(html.indexOf('data-test="actions"')).toBeGreaterThan(panelEnd);
    expect(html.indexOf("<figure", panelEnd)).toBeGreaterThan(panelEnd);
    expect(html.indexOf(LOAN.chart.granularityLegend)).toBeGreaterThan(at);
    expect(html.indexOf('data-test="next-steps"')).toBeGreaterThan(at);
    expect(html.indexOf(LOAN.table.caption)).toBeGreaterThan(at);
  });

  it("draws board 02 in order — payment, why, debt, next — then the controls, then the extras", async () => {
    const p = panelOf(await renderPage());
    const order = [
      'data-infographic-art="true"',
      "<figcaption",
      'data-ruler-part="payment"',
      'data-ruler-part="measure"',
      'data-ruler-part="debt"',
      'data-ruler-part="next"',
      'type="range"',
      'data-month-step="last"',
      'data-learning-try="term"',
      'data-learning-try="extra"',
      'data-ruler-more="true"',
      'data-ruler-walk="true"',
      'data-ruler-exact="true"',
      'data-learning-limits="true"',
    ].map((needle) => p.indexOf(needle));
    for (const position of order) expect(position).toBeGreaterThan(-1);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // Not a pile of cards, not a live table, not an image with tags.
    expect(p).not.toMatch(/<table|data-scene-zone|data-scene-tag|data-scene-stage/);
    // ONE image: the text-free context miniature, with nothing laid over it.
    expect(count(p, "<img")).toBe(1);
    const art = markupRegion(p, 'data-infographic-art="true"') ?? "";
    expect(art).toMatch(/^<div [^>]*><img [^>]*\/>$/);
    expect(art).toContain('src="/images/tools/mortgage-living-scene-v1-650.webp"');
    expect(art).toContain(
      'srcSet="/images/tools/mortgage-living-scene-v1-650.webp 650w, /images/tools/mortgage-living-scene-v1-1300.webp 1300w"',
    );
    expect(art).toContain(`alt="${S.artAlt}"`);
    expect(S.artAlt).toMatch(/nhà phố.*ví.*giấy/);
    expect(S.artAlt).not.toMatch(/lịch|chìa khóa|căn hộ/);
    expect(p).toContain(L.month.excludes);
    expect(p).toContain(L.limits);
  });

  it("is COMPACT before the slider: no lecture, nothing between the figure and the trials", async () => {
    const p = panelOf(await renderPage());
    const figure = figureOf(p);
    // The art at its INTRINSIC 2,5 : 1 size, full width up to 650 px, never a
    // fixed-height box; width/height reserve the space.
    const art = markupRegion(figure, 'data-infographic-art="true"') ?? "";
    expect(art).toMatch(/class="mx-auto w-full max-w-\[40\.625rem\]"/);
    expect(art).toContain('width="1983"');
    expect(art).toContain('height="793"');
    expect(art).toMatch(/class="block h-auto w-full select-none"/);
    expect(art).not.toMatch(/aspect-\[|\bh-28\b|object-cover|object-fill/);
    // Everything a reader must get through before the month control.
    const beforeSlider = figure.slice(0, figure.indexOf('type="range"')).replace(/<[^>]+>/g, " ");
    const words = beforeSlider.replace(/\s+/g, " ").trim();
    expect(words.length).toBeLessThan(470);
    // The optional parts are NOT in the figure.
    expect(figure).not.toMatch(/data-ruler-more|data-ruler-walk|data-ruler-exact|data-walk-step/);
    expect(figure).not.toContain(S.debtTiny);
    expect(figure).not.toContain(S.paymentScale.split("{month}")[0]);
    // The trial buttons come RIGHT after the figure: no paragraph or disclosure between.
    const between = p.slice(p.indexOf("</figure>"), p.indexOf('data-learning-try="term"'));
    expect(between).not.toMatch(/<p[\s>]|<details/);
    // The optional explanation is collapsed.
    expect(p).toMatch(/<details data-ruler-more="true"(?![^>]*\sopen)/);
  });

  it("keeps exactly one live results region, and none inside the panel", async () => {
    const html = await renderPage();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const p = panelOf(html);
    expect(p).not.toContain("aria-live");
    expect(p).not.toContain('role="status"');
    expect(p).not.toMatch(/data-result-status|text-status-met|bg-status-met/);
  });

  it("reads month 1 of the sample: 2 tỷ, 8,5%, 240 months, annuity", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    // Engine fixture: payment 17.356.464,67; interest 14.166.666,67; principal 3.189.798,00.
    expect(figure).toContain(S.title.replace("{month}", "1"));
    expect(figure).toContain(S.headline.replace("{payment}", "17,36 triệu"));
    expect(figure).toContain(S.headlineAnnuity);
    expect(figure).toContain(S.debtAfterLine.replace("{month}", "1").replace("{after}", "1.996,8 triệu"));
    expect(figure).toContain("khoảng 0,708%");
    // Approximate, and never an "=" with the approximate rate.
    expect(figure).not.toMatch(/0,708%[^<]*=/);
    expect(figure).toContain(S.roundedNote);
    const label = (part: string) =>
      (markupRegion(figure, `data-split-label="${part}"`) ?? "").match(/<dd[^>]*>([^<]*)</)?.[1];
    expect(label("interest")).toBe("14,17 triệu");
    expect(label("principal")).toBe("3,19 triệu");
    expect(figure).not.toContain('data-split-label="extra"');
    // The split's whole is THIS payment: 3,19 / 17,36 ≈ 18,4%; 14,17 / 17,36 ≈ 81,6%.
    const bar = markupRegion(figure, 'data-split-bar="payment"') ?? "";
    const share = (key: string) => Number(bar.match(new RegExp(`data-segment="${key}" data-percent="([^"]+)"`))![1]);
    const row = BEFORE.schedule[0];
    expect(share("principal")).toBeCloseTo((row.principal / row.payment) * 100, 2);
    expect(share("interest")).toBeCloseTo((row.interest / row.payment) * 100, 2);
    expect(share("principal") + share("extra") + share("interest")).toBeCloseTo(100, 1);
    expect(bar).toContain(">18,4%<");
    expect(bar).toContain(">81,6%<");
    // Direct meaning beside each figure.
    expect(figure).toContain(S.principalMeaning);
    expect(figure).toContain(S.interestMeaning);
    // Next month is measured on the debt after: the NEXT schedule row.
    expect(figure).toContain(
      S.nextShort
        .replace("{nextMonth}", "2")
        .replace("{nextInterest}", `${(BEFORE.schedule[1].interest / 1e6).toFixed(2).replace(".", ",")} triệu`),
    );
    // The mechanism is said ONCE, by the labels themselves — not repeated below.
    expect(figure).not.toContain(S.effectShort);
  });

  it("explains the axes and the not-magnified cut in the collapsed explanation", async () => {
    const p = panelOf(await renderPage());
    const more = p.slice(p.indexOf('data-ruler-more="true"'));
    expect(more).toContain(S.debtTiny);
    // The payment bar's whole is THIS month's payment, not the schedule's largest.
    expect(more).toContain(S.paymentScale.replace("{month}", "1").replace("{payment}", "17,36 triệu"));
    expect(more).not.toMatch(/lớn nhất/);
    expect(more).toContain(S.debtScale.split("{opening}")[0]);
    expect(more).toContain(S.debtEarlier);
    // No trial, no ghost mark: the note about it is not said.
    expect(p).not.toContain("data-scene-ghost=");
    expect(p).not.toContain(S.ghostNote);
    expect(more).not.toMatch(/0,708%[^<]*=/);
  });

  it("names the debt strip's two fills once, right under it", () => {
    const html = panel(mortgageRuler(EXTRA, 1, BEFORE));
    const debt = html.slice(html.indexOf('data-ruler-part="debt"'), html.indexOf('data-ruler-part="next"'));
    expect(count(html, 'data-debt-legend="true"')).toBe(1);
    const legend = debt.slice(debt.indexOf('data-debt-legend="true"'), debt.indexOf("</ul>"));
    expect(legend).toContain(S.debtLegendAfter);
    expect(legend).toContain(S.debtLegendCut);
    expect(legend).toContain("bg-ink-3/60");
    expect(legend).toContain("bg-brand-green-ink");
    expect(count(html, `>${S.debtLegendCut}<`)).toBe(1);
  });

  it("keeps the exact equation in the collapsed detail: before − principal = after", async () => {
    for (const patch of [undefined, { defaultExtra: "1.000.000" }]) {
      const p = panelOf(await renderPage(patch));
      const before = exactRow(p, "debtBefore");
      const principal = exactRow(p, "principal");
      const after = exactRow(p, "debtAfter");
      const payment = exactRow(p, "payment");
      const interest = exactRow(p, "interest");
      expect(Math.abs(before - principal - after)).toBeLessThanOrEqual(1);
      expect(Math.abs(payment - interest - principal)).toBeLessThanOrEqual(1);
      expect(before).toBe(2_000_000_000);
      expect(interest).toBe(14_166_667);
    }
  });

  it("with 1 triệu extra from month 1: same interest, principal split into regular and extra", async () => {
    const p = panelOf(await renderPage({ defaultExtra: "1.000.000" }));
    const figure = figureOf(p);
    const label = (part: string) =>
      (markupRegion(figure, `data-split-label="${part}"`) ?? "").match(/<dd[^>]*>([^<]*)</)?.[1];
    // Month-1 interest is measured on the same 2 tỷ: unchanged by the extra.
    expect(label("interest")).toBe("14,17 triệu");
    expect(label("principal")).toBe("3,19 triệu");
    expect(label("extra")).toBe("1,00 triệu");
    // Principal counted ONCE: 4.189.798 in the exact row, extra shown inside it.
    expect(exactRow(p, "principal")).toBe(4_189_798);
    expect(exactRow(p, "extra")).toBe(1_000_000);
    expect(figure).toContain(S.debtAfterLine.replace("{month}", "1").replace("{after}", "1.995,8 triệu"));
    expect(figure).toMatch(/data-segment="extra" data-percent="[1-9]/);
    // The headline is the actual first payment: instalment + 1 triệu extra.
    expect(figure).toContain(S.headline.replace("{payment}", "18,36 triệu"));
  });

  it("an invalid field hides EVERY number and offers the repair", async () => {
    const p = panelOf(await renderPage({ defaultRate: "tám" }));
    const figure = figureOf(p);
    expect(figure).toContain('data-scene-state="unknown"');
    expect(figure).toContain(S.unknown);
    expect(figure).toContain('data-scene-fix="true"');
    expect(figure).not.toMatch(/triệu|₫|\d%|data-segment|type="range"|data-exact-row/);
    expect(isDisabled(p, 'data-learning-try="term"')).toBe(true);
    expect(isDisabled(p, 'data-learning-try="extra"')).toBe(true);
    expect(count(p, L.blocked.invalid)).toBe(1);
  });

  it("names the flat-principal schedule for what it is — not a level payment", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultMethod: "flatPrincipal" })));
    expect(figure).toContain(S.headlineFlat);
    expect(figure).not.toContain(S.headlineAnnuity);
  });

  it("a one-month loan: its one payment is the final one, no next month, no range", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultAmount: "1.000.000", defaultExtra: "5.000.000" })));
    expect(figure).not.toContain('type="range"');
    expect(figure).toContain(L.month.single);
    expect(figure).toContain(S.headlineFinal);
    expect(figure).toContain(S.finalShort);
  });

  it("at 0% there is nothing to measure: the ruler is all principal", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultRate: "0" })));
    expect(figure).toContain('data-segment="interest" data-percent="0.00"');
    expect(figure).toContain("khoảng 0,000%");
    expect((markupRegion(figure, 'data-split-label="interest"') ?? "")).toMatch(/<dd[^>]*>0 ₫</);
    expect(figure).toContain('data-segment="principal" data-percent="100.00"');
  });

  it("labels the term step in months when the unit is months", async () => {
    const p = panelOf(await renderPage({ defaultTermUnit: "months", defaultTerm: "240" }));
    expect(p).toContain("Kéo dài kỳ hạn thêm 60 tháng");
    expect(p).toContain('max="240"');
  });
});

describe("the ruler moves with the observed month, on stable axes", () => {
  it("a later month: less debt, less interest, more principal; the range follows", () => {
    const early = panel(mortgageRuler(BEFORE, 1, null));
    const late = panel(mortgageRuler(BEFORE, 200, null));
    const pct = (html: string, key: string) =>
      Number(html.match(new RegExp(`data-segment="${key}" data-percent="([^"]+)"`))![1]);
    expect(pct(late, "after")).toBeLessThan(pct(early, "after"));
    expect(pct(late, "interest")).toBeLessThan(pct(early, "interest"));
    expect(pct(late, "principal")).toBeGreaterThan(pct(early, "principal"));
    // The split is of each month's own payment: always the whole bar.
    expect(pct(late, "interest") + pct(late, "principal")).toBeCloseTo(100, 1);
    expect(pct(early, "interest") + pct(early, "principal")).toBeCloseTo(100, 1);
    expect(late).toContain('value="200"');
    expect(late).toContain('aria-valuetext="Tháng 200 trên 240"');
    expect(late).toContain(`>${S.monthLabel}<`);
  });

  it("the final month says the payment may be smaller and there is no next interest", () => {
    const html = panel(mortgageRuler(EXTRA, 999, null));
    expect(html).toContain(`value="${EXTRA.months}"`);
    expect(html).toContain(S.headlineFinal);
    expect(html).toContain(S.finalShort);
    expect(html).not.toContain("lãi tính trên dư nợ mới");
    // The final row is below the instalment: the scheduled part covers it, no extra.
    expect(html).not.toContain('data-split-label="extra"');
  });

  it("the month steps are 44 px buttons named as viewing, the first ones off at month 1", () => {
    const html = panel(mortgageRuler(BEFORE, 1, null));
    // 2 × 2 below 380 px, 4 across above: each step keeps ≥ 44 × 44 px and a whole label.
    expect(html).toMatch(/data-month-steps="true" class="grid grid-cols-2 gap-1\.5 min-\[380px\]:grid-cols-4"/);
    for (const step of ["first", "prev", "next", "last"] as const) {
      const tag = html.match(new RegExp(`<button[^>]*data-month-step="${step}"[^>]*>`))![0];
      expect(tag).toContain("min-h-11");
      expect(tag).toContain("min-w-11");
      expect(tag).toContain("whitespace-nowrap");
      expect(tag).toContain(`aria-label="${S.steps[step].name}"`);
      expect(S.steps[step].name.startsWith("Xem")).toBe(true);
      expect(/ aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""))).toBe(
        step === "first" || step === "prev",
      );
    }
    // SUPERSEDED STYLE, changed on purpose: frameless at EVERY width now — the
    // primary ResultGroup is the card surface (no nested card); the tinted
    // figure keeps its padding.
    expect(html).toMatch(/^<section aria-labelledby="[^"]+" data-mortgage-learning="true">/);
    expect(html.match(/^<section[^>]*>/)![0]).not.toContain("class=");
    expect(figureOf(html)).toMatch(/^<figure [^>]*class="[^"]*bg-bg-soft p-3"/);
    // The interest hatch is LIGHT, so the dark in-bar percentage reads.
    const interest = html.match(/data-segment="interest"[^>]*class="([^"]+)"/)![1];
    expect(interest).toContain("#cfcfcf");
    expect(interest).not.toContain("#6d6d6d");
  });

  it("both pilots opt in to the compact card; the shared default is unchanged", async () => {
    const { CalculatorCard } = await import("@/components/calc/calculator-card");
    const plain = renderToStaticMarkup(createElement(CalculatorCard, null, "x"));
    expect(plain).toMatch(/class="[^"]*\bp-6 md:p-8"/);
    expect(plain).not.toContain("p-3");
    const html = await renderPage();
    expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
    const car = renderToStaticMarkup(
      createElement((await import("@/components/auto-loan-calculator")).AutoLoanCalculator, {}),
    );
    expect(car).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
  });

  it("the optional walk-through (collapsed) only highlights: four 44 px toggles, none pressed", () => {
    const html = panel(mortgageRuler(BEFORE, 1, null));
    const figure = figureOf(html);
    expect(figure).toContain('data-walk="none"');
    const more = html.slice(html.indexOf('data-ruler-more="true"'));
    for (const step of ["debt", "measure", "principal", "next"]) {
      const tag = more.match(new RegExp(`<button[^>]*data-walk-step="${step}"[^>]*>`))![0];
      expect(tag).toContain('aria-pressed="false"');
      expect(tag).toContain("min-h-11");
    }
    // Every part of the loop is on screen without pressing anything.
    for (const part of ["debt", "measure", "payment", "next"]) {
      expect(figure).toContain(`data-ruler-part="${part}"`);
    }
    expect(figure).not.toMatch(/(?<!motion-safe:)transition-|animate-|<animate/);
  });

  it("while the extra press holds: month-1 interest unchanged, month-2 interest ~7.083 ₫ lower", () => {
    const html = panel(mortgageRuler(EXTRA, 1, BEFORE));
    expect(html).toContain(S.compareNowSame);
    expect(html).toContain(S.compareNextLower.replace("{amount}", "7.083 ₫"));
    // The ghost mark exists, so its note is said — and only then.
    expect(count(html, S.ghostNote)).toBe(1);
    // The debt rail marks where the balance stood after month 1 before the press.
    const debt = html.slice(html.indexOf('data-ruler-part="debt"'), html.indexOf('data-ruler-part="next"'));
    expect(debt).toContain(`data-scene-ghost="${((BEFORE.schedule[0].balance / 2e9) * 100).toFixed(2)}"`);
  });

  it("past the earlier payoff it says paid off instead of comparing", () => {
    const extended = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 300 })!;
    const html = panel(mortgageRuler(extended, 300, BEFORE));
    expect(html).toContain('data-scene-reference-paid-off="240"');
    expect(html).toContain(S.referencePaidOff.replace("{month}", "240"));
    expect(html).not.toContain("data-scene-ghost=");
    expect(html).not.toContain(S.ghostNote);
    expect(html).not.toContain('data-ruler-compare="true"');
  });

  it("keeps every label at 14 px or more, never truncated, colour AND pattern for the split", () => {
    const figure = figureOf(panel(mortgageRuler(EXTRA, 1, BEFORE)));
    expect(figure).not.toMatch(/text-xs|text-\[(?:[0-9]|1[0-3])px\]|truncate|text-ellipsis|line-clamp/);
    expect(figure).toMatch(/data-segment="interest"[^>]*repeating-linear-gradient/);
    expect(figure).toMatch(/data-segment="extra"[^>]*repeating-linear-gradient/);
    expect(figure).not.toMatch(/red-|status-shortfall/);
  });
});

describe("the panel after a press, from a real trial", () => {
  const trial = makeMortgageTrial({ key: "term", values: SHIPPED, revision: 0, result: BEFORE })!;
  const after = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 300 })!;
  const impact = mortgageImpactView(trial, after, L.unitWords);
  const html = panel(mortgageRuler(after, 1, BEFORE), { impact, canUndo: true });

  it("board 03: the payoff on one time axis, the rounded before/after, the exact figures collapsed", () => {
    expect(html).toContain('data-learning-impact="term"');
    expect(html).toContain(impact.fieldLine);
    // 240 → 300 months, one axis from 0 to the longer.
    const timeline = html.slice(html.indexOf('data-timeline-compare="payoff"'));
    expect(timeline).toMatch(/data-timeline-row="before"[\s\S]*data-timeline-percent="80.00"/);
    expect(timeline).toMatch(/data-timeline-row="after"[\s\S]*data-timeline-percent="100.00"/);
    expect(timeline).toContain(L.impact.deltaLater.replace("{months}", "60"));
    const compare = html.slice(html.indexOf('data-impact-compare="true"'));
    for (const row of impact.compare) {
      expect(compare).toContain(row.before);
      expect(compare).toContain(row.after);
    }
    const exact = html.slice(html.indexOf('data-learning-exact="true"'));
    expect(exact).toContain("<table");
    expect(html).toContain(impact.why);
    expect(html).toContain(L.trials.term.question);
    expect(isDisabled(html, 'data-learning-undo="true"')).toBe(false);
    expect(html).not.toContain("aria-live");
  });

  it("board 03 for 1 triệu extra: 240 → 210 months, sooner by 30, less total interest", () => {
    const press = makeMortgageTrial({ key: "extra", values: SHIPPED, revision: 0, result: BEFORE })!;
    const view = mortgageImpactView(press, EXTRA, L.unitWords);
    expect(view.timeline).toMatchObject({ before: 240, after: 210, axisMax: 240 });
    expect(view.timeline.delta).toBe(L.impact.deltaSooner.replace("{months}", "30"));
    const out = panel(mortgageRuler(EXTRA, 1, BEFORE), { impact: view, canUndo: true });
    expect(out).toMatch(/data-timeline-row="after"[\s\S]*data-timeline-percent="87.50"/);
    const interest = view.compare.find((r) => r.key === "interest")!;
    expect(EXTRA.totalInterest).toBeLessThan(BEFORE.totalInterest);
    expect(out).toContain(interest.before);
    expect(out).toContain(interest.after);
  });

  it("keeps the ruler and its month control first, then the presses, then the impact", () => {
    const at = (needle: string) => html.indexOf(needle);
    expect(at('data-learning-illustration="true"')).toBeLessThan(at('type="range"'));
    expect(at('type="range"')).toBeLessThan(at('data-learning-try="term"'));
    expect(at('data-learning-open-form="true"')).toBeLessThan(at('data-learning-impact="term"'));
    expect(html).not.toMatch(/\border-(?:first|last|none|\d)/);
  });
});
