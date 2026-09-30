/**
 * Rendered-markup contracts for the A3 learning panel on /cong-cu/vay-mua-xe/
 * — board 04 of the approved living infographic (2026-09-29): the household
 * month as a readable subtraction, purchase money apart, three trials.
 *
 * No jsdom: the page renders at its opening state and with patched defaults;
 * the panel renders on its own with a REAL press. Nothing here checks
 * appearance, focus, speech or comprehension.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AutoLearningPanel } from "@/components/auto-learning-panel";
import { autoFlowView, autoImpactView, autoScene, makeAutoTrial } from "@/components/auto-learning";
import { autoLoanFormState, type AutoLoanFormValues } from "@/components/auto-loan-calculator";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";
import { AUTO_LEARNING as L } from "@/content/calculators/auto-learning";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { compactMoney } from "@/lib/calc/charts/labels";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/auto-loan";
type FormPatch = Partial<Record<keyof typeof AUTO_LOAN.form, string>>;
const r = (value: number) => compactMoney(value, CHART_UI.money);

async function renderPage(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/auto-loan")>(CONTENT);
      return { AUTO_LOAN: { ...actual.AUTO_LOAN, form: { ...actual.AUTO_LOAN.form, ...patch } } };
    });
  }
  try {
    const loaded = await import("@/components/auto-loan-calculator");
    return renderToStaticMarkup(
      createElement(loaded.AutoLoanCalculator, {
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
const panelOf = (html: string) => markupRegion(html, 'data-auto-learning="true"', "section") ?? "";
const figureOf = (html: string) => markupRegion(html, 'data-learning-illustration="true"', "figure") ?? "";
/** The rendered value of one flow tile. */
function tile(html: string, key: string): string | undefined {
  const start = html.indexOf(`data-flow-item="${key}"`);
  if (start === -1) return undefined;
  const cell = html.slice(start, html.indexOf("</li>", start));
  return cell.match(/<p class="[^"]*tabular-nums[^"]*">([^<]*)</)?.[1];
}
function isDisabled(html: string, marker: string): boolean {
  const tag = html.match(new RegExp(`<button[^>]*${marker}[^>]*>`))?.[0];
  if (tag === undefined) throw new Error(`no button ${marker}`);
  return / aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""));
}

const F = AUTO_LOAN.form;
const SHIPPED: AutoLoanFormValues = {
  price: F.defaultPrice,
  down: F.defaultDown,
  tradeIn: F.defaultTradeIn,
  rate: F.defaultRate,
  term: F.defaultTerm,
  termUnit: F.defaultTermUnit,
  netIncome: F.defaultNetIncome,
  essentials: F.defaultEssentials,
  otherDebts: F.defaultOtherDebts,
  reserve: F.defaultReserve,
  running: F.defaultRunning,
};

describe("the car page at its opening state", () => {
  // SUPERSEDED ORDER, changed on purpose: the full-width hook ABOVE the form
  // was replaced by the user's later correction — form first, then the result
  // card with this panel at its top (see result-visual-first.test.ts).
  it("VISUAL FIRST (2026-09-29): form, then the result card led by the one panel, then the one live answer, actions and charts", async () => {
    const html = await renderPage();
    expect(count(html, 'data-auto-learning="true"')).toBe(1);
    expect(count(html, "data-infographic-art=")).toBe(1);
    expect(count(html, "<img")).toBe(1);
    const at = html.indexOf('data-auto-learning="true"');
    const panelEnd = html.lastIndexOf("<section", at) + panelOf(html).length;
    // The form first; the picture opens the result column.
    expect(html.indexOf('data-calc-region="form"')).toBeLessThan(at);
    expect(html.indexOf('data-calc-region="result"')).toBeLessThan(at);
    expect(html.indexOf('data-calc-region="result"')).toBeGreaterThan(html.indexOf('data-calc-region="form"'));
    expect(html.indexOf('data-results-live="true"')).toBeGreaterThan(panelEnd);
    expect(html.indexOf('data-test="actions"')).toBeGreaterThan(html.indexOf('data-results-live="true"'));
    expect(html.indexOf(AUTO_LOAN.chart.title)).toBeGreaterThan(html.indexOf('data-test="actions"'));
    expect(html.indexOf('data-test="next-steps"')).toBeGreaterThan(html.indexOf(AUTO_LOAN.chart.title));
    expect(html.indexOf(L.balanceChart.title)).toBeGreaterThan(html.indexOf(AUTO_LOAN.chart.title));
    // Exactly one live region, and none inside the panel; the form keeps a heading.
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(panelOf(html)).not.toMatch(/aria-live|role="status"|data-results-live/);
    expect(markupRegion(html, 'data-calc-region="form"')).toContain(L.formHeading);
    // The sample stays labelled as the example until the reader types.
    expect(panelOf(html)).toContain('data-learning-basis="sample"');
  });

  it("the entry action is near the TOP of the panel, native, 44 px, and the only one of its kind", async () => {
    const html = await renderPage();
    const p = panelOf(html);
    const entry = p.match(/<button[^>]*data-learning-open-form="top"[^>]*>([^<]*)<\/button>/);
    expect(entry).not.toBeNull();
    expect(entry![0]).toContain('type="button"');
    expect(entry![0]).toContain("min-h-11");
    expect(entry![1]).toBe(L.openForm);
    // Before the illustration and the ledger, so no one walks the picture to find the form.
    expect(p.indexOf('data-learning-open-form="top"')).toBeLessThan(p.indexOf('data-learning-illustration="true"'));
    // No second identical control in the trial row, and trial + undo still render.
    expect(count(html, "data-learning-open-form=")).toBe(1);
    expect(count(html, `>${L.openForm}</button>`)).toBe(1);
    for (const key of ["down", "term", "running"]) expect(p).toContain(`data-learning-try="${key}"`);
    expect(p).toContain('data-learning-undo="true"');
  });

  it("is ONE composition: art → headline → month flow → purchase money → trial buttons", async () => {
    const p = panelOf(await renderPage());
    const order = [
      'data-learning-open-form="top"',
      'data-infographic-art="true"',
      "<figcaption",
      "data-auto-headline=",
      'data-flow-equation="month"',
      "data-auto-upfront=",
      'data-learning-try="down"',
      'data-learning-try="term"',
      'data-learning-try="running"',
      'data-learning-limits="true"',
    ].map((needle) => p.indexOf(needle));
    for (const position of order) expect(position).toBeGreaterThan(-1);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // The rejected design is gone: no tags, pins or chips over the photo.
    expect(p).not.toMatch(/data-scene-stage|data-scene-tag|data-scene-mark|data-scene-pin|data-scene-zone/);
    // ONE image, text-free, with nothing laid over it.
    expect(count(p, "<img")).toBe(1);
    const art = markupRegion(p, 'data-infographic-art="true"') ?? "";
    expect(art).toMatch(/^<div [^>]*><img [^>]*\/>$/);
    expect(art).toContain('src="/images/tools/auto-living-scene-v1-650.webp"');
    expect(art).toContain(
      'srcSet="/images/tools/auto-living-scene-v1-650.webp 650w, /images/tools/auto-living-scene-v1-1300.webp 1300w"',
    );
    expect(art).toContain('width="1983"');
    expect(art).toContain('height="793"');
    expect(art).not.toMatch(/aspect-\[|\bh-28\b|object-cover|object-fill/);
    expect(art).toContain(`alt="${L.flow.artAlt}"`);
    expect(L.flow.artAlt).toMatch(/hatchback.*trắng.*ví.*lịch/);
    expect(L.flow.artAlt).not.toMatch(/chìa khóa|bãi/);
    // No redundant "Tính lại": the month recomputes on every edit.
    expect(p).not.toMatch(/Tính lại/);
    // The standing condition, without the removed composition's "mục 2".
    expect(p).toContain(L.flow.debtNotValue);
    expect(p).not.toContain(L.scene.priceNote);
    expect(p).not.toMatch(/mục 2/);
    // SUPERSEDED STYLE, changed on purpose: frameless at EVERY width now — the
    // budget ResultGroup is the card surface, so the section adds no border,
    // background, padding or margin (no nested card).
    expect(p).toMatch(/^<section aria-labelledby="[^"]+" data-auto-learning="true">/);
    expect(p.match(/^<section[^>]*>/)![0]).not.toContain("class=");
    expect(p).toContain(L.limits);
  });

  it("draws the month from the ledger: every tile is the engine's, the instalment derived", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    const state = autoLoanFormState(SHIPPED);
    const b = state.budget!;
    // The instalment is the ENGINE's, not a hardcoded sample.
    expect(b.vehiclePayment).toBeCloseTo(state.result!.loan.monthlyPrincipalInterest, 6);
    expect(tile(figure, "income")).toBe(r(b.netIncome));
    expect(tile(figure, "essentials")).toBe(r(b.essentialExpenses!));
    expect(tile(figure, "otherDebts")).toBe(r(b.otherDebts));
    expect(tile(figure, "reserve")).toBe(r(b.reserveSaving));
    expect(tile(figure, "payment")).toBe(r(b.vehiclePayment!));
    expect(tile(figure, "running")).toBe(r(0));
    expect(tile(figure, "result")).toBe(r(b.withCar!));
    // The ledger adds up: income − every commitment = what is left.
    expect(b.netIncome - b.essentialExpenses! - b.otherDebts - b.reserveSaving - b.vehiclePayment! - b.vehicleRunningCosts).toBeCloseTo(
      b.withCar!,
      4,
    );
    // Running costs are 0, so this is the adapter's caution — not green.
    expect(figure).toContain('data-auto-headline="caution"');
    expect(figure).toContain(L.flow.runningExcluded);
    expect(figure).not.toMatch(/data-auto-headline="caution"[^>]*status-met/);
    // The deposit is purchase money, NOT a monthly tile.
    expect(figure).not.toContain('data-flow-item="down"');
    expect(figure).toContain(L.flow.upfrontTitle);
  });

  it("keeps one live region; the running-costs field stays in the form, one press away", async () => {
    const html = await renderPage();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const p = panelOf(html);
    expect(p).not.toContain("aria-live");
    const form = markupRegion(html, 'data-calc-region="form"') ?? "";
    expect(form).toContain('data-calc-field="running"');
    // The jump sits ON the running-cost term, 44 px tall.
    const running = p.slice(p.indexOf('data-flow-item="running"'), p.indexOf('data-flow-item="result"'));
    expect(running).toMatch(/<button[^>]*data-learning-jump="running"[^>]*min-h-11/);
  });

  it("running costs entered and a remainder left: the adapter's met, in green, with words", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultRunning: "2.000.000" })));
    expect(figure).toContain('data-auto-headline="surplus"');
    expect(figure).toMatch(/data-auto-headline="surplus" class="[^"]*status-met/);
    expect(figure).not.toContain(L.flow.runningExcluded);
  });

  it("a shortfall is named as such, red with words, and the result tile says Thiếu", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultRunning: "5.000.000" })));
    expect(figure).toContain('data-auto-headline="short"');
    expect(figure).toMatch(/data-auto-headline="short" class="[^"]*status-shortfall/);
    expect(figure).toContain(L.flow.resultShort);
    expect(figure).toContain("Thiếu khoảng");
  });

  it("blank essentials: 'chưa nhập', and NO remainder is invented", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultEssentials: "" })));
    expect(figure).toContain('data-auto-headline="limited"');
    expect(tile(figure, "essentials")).toBe(L.flow.missingEssentials);
    expect(tile(figure, "result")).toBe("—");
    expect(figure).not.toContain("Còn lại khoảng");
  });

  it("an invalid car field: the instalment is 'chưa tính được', never 0", async () => {
    const p = panelOf(await renderPage({ defaultRate: "abc" }));
    const figure = figureOf(p);
    expect(figure).toContain('data-auto-headline="unknown"');
    expect(tile(figure, "payment")).toBe(L.flow.missingPayment);
    expect(tile(figure, "result")).toBe("—");
    expect(figure).toContain('data-auto-upfront="unknown"');
    expect(isDisabled(p, 'data-learning-try="down"')).toBe(true);
    expect(isDisabled(p, 'data-learning-try="running"')).toBe(true);
  });

  it("an invalid household field: no month at all, a repair instead", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultNetIncome: "" })));
    expect(figure).toContain('data-scene-state="unknown"');
    expect(figure).not.toContain('data-flow-equation="month"');
    expect(figure).toContain('data-scene-fix="true"');
  });

  it("the exact cash purchase is a no-loan month; the term press is off with its reason", async () => {
    const p = panelOf(await renderPage({ defaultDown: "700.000.000" }));
    const figure = figureOf(p);
    expect(figure).toContain('data-auto-upfront="cash"');
    expect(tile(figure, "payment")).toBe(r(0));
    expect(figure).toContain('data-segment="financed" data-percent="0.00"');
    expect(isDisabled(p, 'data-learning-try="term"')).toBe(true);
    expect(p).toContain(L.blocked.noLoan);
    // Running costs still apply to a car bought for cash.
    expect(isDisabled(p, 'data-learning-try="running"')).toBe(false);
  });

  it("an excess deposit is refused in the purchase strip, never a zero balance", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultDown: "750.000.000" })));
    expect(figure).toContain('data-auto-upfront="excess"');
    expect(figure).toContain(L.scene.excess);
    expect(figure).not.toMatch(/data-split-bar="upfront"/);
  });

  it("names the term step in the unit the reader chose", async () => {
    const p = panelOf(await renderPage({ defaultTermUnit: "months", defaultTerm: "60" }));
    expect(p).toContain("Kéo dài kỳ hạn thêm 24 tháng");
  });

  it("keeps every label at 14 px or more, never truncated; motion only when welcome", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    expect(figure).not.toMatch(/text-xs|text-\[(?:[0-9]|1[0-3])px\]|truncate|text-ellipsis|line-clamp/);
    expect(figure).not.toMatch(/(?<!motion-safe:)transition-/);
    expect(JSON.stringify(L.flow)).not.toMatch(/nhà|căn hộ/i);
  });
});

describe("the panel after a real press", () => {
  const before = autoLoanFormState(SHIPPED);

  function render(key: "down" | "running") {
    const trial = makeAutoTrial({ key, values: SHIPPED, revision: 0, state: before, label: "" })!;
    const after = autoLoanFormState(trial.after as AutoLoanFormValues);
    return {
      after,
      html: renderToStaticMarkup(
        createElement(AutoLearningPanel, {
          sample: true,
          flow: autoFlowView(after),
          scene: autoScene(trial.after, after, { values: trial.before, state: before }),
          availability: { down: { enabled: true }, term: { enabled: true }, running: { enabled: true } },
          termLabel: "Kéo dài kỳ hạn thêm 2 năm",
          impact: autoImpactView(trial, after, ""),
          canUndo: true,
          formId: "vay-mua-xe-nhap",
          onTry: () => {},
          onUndo: () => {},
        }),
      ),
    };
  }

  it("+50 triệu deposit: the purchase strip and the instalment tile move; the impact follows", () => {
    const { html, after } = render("down");
    expect(html).toContain('data-segment="down" data-percent="43.75"');
    expect(html).toContain('data-segment="financed" data-percent="43.75"');
    expect(tile(html, "payment")).toBe(r(after.budget!.vehiclePayment!));
    const at = (needle: string) => html.indexOf(needle);
    expect(at('data-learning-illustration="true"')).toBeLessThan(at('data-learning-try="down"'));
    expect(at('data-learning-try="down"')).toBeLessThan(at('data-learning-impact="down"'));
    for (const line of ["payment", "interest", "months", "budget"]) {
      expect(html).toContain(`data-impact-line="${line}"`);
    }
    expect(html).toContain("data-learning-bars=");
    expect(html).not.toContain("aria-live");
  });

  it("+1 triệu running costs: only the month moves — no payment bars, remainder 1 triệu lower", () => {
    const { html, after } = render("running");
    expect(tile(html, "running")).toBe(r(1_000_000));
    expect(after.budget!.withCar).toBeCloseTo(before.budget!.withCar! - 1_000_000, 4);
    expect(tile(html, "result")).toBe(r(after.budget!.withCar!));
    expect(html).toContain('data-learning-impact="running"');
    expect(html).not.toContain("data-learning-bars=");
    expect(html).toContain(L.why.runningMore.replace("{amount}", r(1_000_000)));
  });
});
