/**
 * Rendered-markup contracts for the "Thử một thay đổi" pilot on
 * /cong-cu/kha-nang-mua-nha/, and its absence on /cong-cu/nha-o-xa-hoi/:
 * the commercial release changes nothing on the social-housing route.
 *
 * There is no jsdom here, so a click cannot be driven. The states a click
 * reaches are rendered by giving the real panel a real try — made by
 * `makeTrial` on the shipped raw values, measured with `computeAffordability`
 * — so the markup asserted is the markup a press produces. The page itself is
 * rendered at its opening state and with patched defaults.
 *
 * Nothing here checks appearance, focus or speech.
 */
import { describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AffordabilityLearningPanel,
  formJumpTarget,
} from "@/components/affordability-learning-panel";
import {
  affordabilityScene,
  makeTrial,
  trialImpactView,
  type FormValues,
  type TrialAvailability,
} from "@/components/affordability-learning";
import { AFFORDABILITY } from "@/content/calculators/affordability";
import { AFFORDABILITY_LEARNING as L } from "@/content/calculators/affordability-learning";
import { computeAffordability } from "@/lib/calc/affordability";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/affordability";
const F = AFFORDABILITY.form;
type FormPatch = Partial<Record<keyof typeof F, string>>;

async function renderPage(
  patch?: FormPatch,
  programme: "commercial" | "social-housing" = "commercial",
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/affordability")>(CONTENT);
      return {
        AFFORDABILITY: {
          ...actual.AFFORDABILITY,
          form: { ...actual.AFFORDABILITY.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/affordability-calculator");
    return renderToStaticMarkup(createElement(loaded.AffordabilityCalculator, { programme }));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const count = (html: string, needle: string) => html.split(needle).length - 1;

/**
 * The element opened by the last `<tag` at or before `marker`, through its
 * matching close — depth-counted, for tags `markupRegion` is not typed for
 * (`span` nests in the scene's tags; `details` does not nest here).
 */
function region(html: string, marker: string, tag: "span" | "details"): string {
  const at = html.indexOf(marker);
  if (at === -1) return "";
  const open = html.lastIndexOf(`<${tag}`, at);
  let depth = 0;
  for (let i = open; i < html.length; i += 1) {
    if (html.startsWith(`</${tag}>`, i)) {
      depth -= 1;
      if (depth === 0) return html.slice(open, i);
    } else if (html.startsWith(`<${tag}`, i) && /[\s>]/.test(html[i + tag.length + 1] ?? "")) {
      depth += 1;
    }
  }
  return "";
}
/**
 * Whether the try button carries a REAL `aria-disabled="true"` attribute.
 * Reads that button's opening tag only, and strips its `class` value first:
 * the `aria-disabled:` Tailwind variants in it are CSS, not the attribute.
 */
function isDisabled(html: string, key: "reserve" | "rate"): boolean {
  const tag = html.match(new RegExp(`<button[^>]*data-learning-try="${key}"[^>]*>`))?.[0];
  if (tag === undefined) throw new Error(`no try button for ${key}`);
  return / aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""));
}
const panelOf = (html: string) =>
  markupRegion(html, 'data-affordability-learning="true"', "section") ?? "";

const SHIPPED_VALUES: FormValues = {
  mode: F.defaultMode,
  netIncome: F.defaultNetIncome,
  essentials: F.defaultEssentials,
  buffer: F.defaultBuffer,
  income: F.defaultIncome,
  debts: F.defaultDebts,
  down: F.defaultDown,
  reserve: F.defaultReserve,
  purchaseCost: F.defaultPurchaseCost,
  ltv: F.defaultLtv,
  rate: F.defaultRate,
  term: F.defaultTerm,
  housingCosts: F.defaultHousingCosts,
  housingRatio: F.defaultHousingRatio,
  totalRatio: F.defaultTotalRatio,
  targetPrice: F.defaultTargetPrice,
};

const SHIPPED_INPUT = {
  mode: "household" as const,
  monthlyIncome: 50_000_000,
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  cashReserve: 0,
  purchaseCostPercent: 0,
  assumedMaxLtvPercent: 100,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyHousingCosts: 0,
  housingRatioPercent: 40,
  totalDebtRatioPercent: 50,
};

const OPEN: Record<"reserve" | "rate", TrialAvailability> = {
  reserve: { enabled: true },
  rate: { enabled: true },
};
const STATUS = { tone: "caution" as const, label: "Cần lưu ý", title: "Tầm giá tham khảo" };

function panel(props: Partial<Parameters<typeof AffordabilityLearningPanel>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(AffordabilityLearningPanel, {
      status: STATUS,
      formId: "kha-nang-mua-nha-nhap",
      sample: true,
      availability: OPEN,
      sharedReason: null,
      impact: null,
      scene: affordabilityScene(computeAffordability(SHIPPED_INPUT), 0, SHIPPED_INPUT.downPayment),
      canUndo: false,
      onTry: () => {},
      onUndo: () => {},
      ...props,
    }),
  );
}

describe("the commercial page at its opening state", () => {
  it("renders the panel in the learning slot AFTER the answer, holding the ONE status card", async () => {
    const html = await renderPage();
    expect(count(html, "<section data-result-status")).toBe(1);
    const panelAt = html.indexOf('data-affordability-learning="true"');
    expect(panelAt).toBeGreaterThan(-1);
    // Inside the result column, after the form and the answer rows.
    expect(panelAt).toBeGreaterThan(html.indexOf('data-calc-region="form"'));
    expect(panelAt).toBeGreaterThan(html.indexOf('data-calc-region="result"'));
    expect(panelAt).toBeGreaterThan(html.indexOf('id="kha-nang-mua-nha-ket-qua"'));
    expect(panelAt).toBeGreaterThan(html.indexOf('data-results-live="true"'));
    // …and wholly before the charts and the detail region.
    const end = html.lastIndexOf("<section", panelAt) + panelOf(html).length;
    expect(html.indexOf(AFFORDABILITY.monthlyChart.title)).toBeGreaterThan(end);
    expect(html.indexOf('data-calc-region="detail"')).toBeGreaterThan(end);
    // Not above the two columns any more.
    expect(html.slice(0, html.indexOf('data-calc-region="form"'))).not.toContain("data-affordability-learning");
    expect(panelOf(html)).toContain("<section data-result-status");
    // The result group keeps its anchor and rows, and no longer holds a card.
    const result = markupRegion(html, 'id="kha-nang-mua-nha-ket-qua"') ?? "";
    expect(result).toContain(F.maxPriceLabel);
    expect(result).not.toContain("data-result-status");
  });

  it("keeps exactly one live region, and none inside the panel", async () => {
    const html = await renderPage();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(panelOf(html)).not.toContain("aria-live");
    expect(panelOf(html)).not.toContain('role="status"');
  });

  it("offers both tries on the example, says the figures are the example, and has nothing to undo", async () => {
    const html = await renderPage();
    const p = panelOf(html);
    expect(p).toContain(L.trials.reserve.label);
    expect(p).toContain(L.trials.rate.label);
    expect(p).toContain('data-learning-basis="sample"');
    expect(isDisabled(p, "reserve")).toBe(false);
    expect(isDisabled(p, "rate")).toBe(false);
    expect(p).toMatch(/data-learning-undo="true" aria-disabled="true"/);
    expect(p).not.toContain("data-learning-impact");
    // The example badge is unchanged by the pilot.
    expect(html).toContain("Ví dụ mẫu");
  });

  it("keeps the comparison snapshot control and the form anchors", async () => {
    const html = await renderPage();
    expect(html).toContain(F.compareCaptureAction);
    expect(html).toContain('id="kha-nang-mua-nha-nhap"');
    expect(html).toContain('aria-controls="kha-nang-mua-nha-ket-qua"');
  });
});

describe("the tries are off, with the reason, when the input is not ready", () => {
  it("while essentials are blank", async () => {
    const p = panelOf(await renderPage({ defaultEssentials: "" }));
    expect(p).toContain(L.blocked.limited);
    expect(count(p, 'aria-disabled="true"')).toBe(3);
  });

  it("while a field is malformed", async () => {
    const p = panelOf(await renderPage({ defaultRate: "tám" }));
    expect(p).toContain(L.blocked.invalid);
    expect(p).not.toContain('data-result-status="met"');
  });

  it("while the target price is malformed", async () => {
    const p = panelOf(await renderPage({ defaultTargetPrice: "abc" }));
    expect(p).toContain(L.blocked.targetInvalid);
  });

  it("the reserve only, when the cash left is under 50 triệu", async () => {
    const p = panelOf(await renderPage({ defaultDown: "30.000.000" }));
    expect(p).toContain('data-learning-blocked="reserve"');
    expect(p).toContain("30.000.000 ₫");
    expect(isDisabled(p, "reserve")).toBe(true);
    expect(isDisabled(p, "rate")).toBe(false);
  });
});

describe("the panel after a press, from a real try", () => {
  const before = computeAffordability(SHIPPED_INPUT)!;
  const trial = makeTrial({
    key: "reserve",
    values: SHIPPED_VALUES,
    facts: { usable: true, targetInvalid: false, limited: false, down: 600_000_000, reserve: 0 },
    revision: 0,
    result: before,
    label: "Cần lưu ý",
  })!;
  const after = computeAffordability({ ...SHIPPED_INPUT, cashReserve: 50_000_000 })!;
  const impact = trialImpactView(trial, after, "Cần lưu ý");

  it("shows the field before/after, the engine's price change, the cause and the question", () => {
    const html = panel({ impact, canUndo: true });
    expect(html).toContain('data-learning-impact="reserve"');
    expect(html).toContain(impact.fieldLine);
    expect(html).toContain(impact.change);
    // The bars: both sides, rounded labels in HTML, widths from one axis.
    const bars = markupRegion(html, 'data-learning-bars="true"', "figure") ?? "";
    for (const bar of impact.bars) {
      expect(bars).toContain(`data-learning-bar="${bar.side}"`);
      expect(bars).toContain(bar.text);
      expect(bars).toContain(`data-bar-percent="${bar.percent.toFixed(2)}"`);
    }
    expect(bars).toContain('data-bar-percent="100.00"');
    expect(bars).toContain(L.impact.barBefore);
    expect(bars).toContain(L.impact.barAfter);
    // Exact đồng only inside labelled, collapsed disclosures — the impact's
    // table and the scene's "Xem số chính xác" — never in visible prose.
    const exact = html.slice(html.indexOf('data-learning-exact="true"'));
    const prose = html
      .slice(0, html.indexOf('data-learning-exact="true"'))
      .replace(/<details data-scene-details="true"[\s\S]*?<\/details>/g, "");
    expect(prose).not.toContain("data-scene-details");
    expect(exact).toContain(L.impact.exactTitle);
    expect(exact).toContain("<table");
    for (const row of impact.exact.rows.slice(1)) {
      expect(exact).toContain(row.before);
      expect(exact).toContain(row.after);
      expect(prose).not.toContain(row.before);
    }
    expect(exact).toContain(impact.exact.change);
    expect(html).toContain(L.why.reservePayment);
    expect(html).toContain(L.trials.reserve.question);
    expect(html).not.toMatch(/data-learning-undo="true" aria-disabled/);
    expect(html).not.toContain("aria-live");
  });

  it("puts the stable controls and the impact BEFORE the variable-height card", () => {
    const html = panel({ impact, canUndo: true });
    const card = html.indexOf("<section data-result-status");
    expect(html.indexOf('data-learning-try="reserve"')).toBeLessThan(card);
    expect(html.indexOf('data-learning-undo="true"')).toBeLessThan(card);
    expect(html.indexOf('data-learning-open-form="true"')).toBeLessThan(card);
    expect(html.indexOf('data-learning-impact="reserve"')).toBeLessThan(card);
    // No CSS reordering anywhere in the panel.
    expect(html).not.toMatch(/\border-/);
  });

  it("shows the exact figures through the suite's ResultTable, cards on a phone", () => {
    const html = panel({ impact, canUndo: true });
    const exact = html.slice(html.indexOf('data-learning-exact="true"'));
    // The existing mobileCards contract: a card list below `md`, figures
    // whole on one line, and the table in its own labelled scroll frame.
    expect(exact).toContain(`<ul class="md:hidden" aria-label="${L.impact.exactCaption}"`);
    expect(exact).toContain("whitespace-nowrap");
    expect(exact).toMatch(/class="max-w-full overflow-x-auto hidden md:block" role="region"/);
    expect(exact).not.toContain("table-fixed");
    for (const label of [L.impact.exactItem, L.impact.exactBefore, L.impact.exactAfter]) {
      expect(exact).toContain(label);
    }
    // Every exact string, unchanged, in BOTH readings (cards and table).
    for (const row of impact.exact.rows) {
      expect(count(exact, row.label)).toBeGreaterThanOrEqual(2);
      expect(count(exact, row.before)).toBeGreaterThanOrEqual(2);
      expect(count(exact, row.after)).toBeGreaterThanOrEqual(2);
    }
    expect(count(exact, L.impact.exactPriceChange)).toBeGreaterThanOrEqual(2);
    expect(count(exact, impact.exact.change)).toBeGreaterThanOrEqual(2);
  });

  it("keeps the example labelled as one after a press", () => {
    expect(panel({ impact, canUndo: true, sample: true })).toContain(L.basisSample);
    expect(panel({ impact, canUndo: true, sample: false })).toContain(L.basisOwn);
  });

  it("gives every blocked try an accessible reason and keeps it focusable", () => {
    const html = panel({
      availability: { reserve: { enabled: false, reason: "R" }, rate: { enabled: false, reason: "R" } },
      sharedReason: "R",
    });
    expect(count(html, 'data-learning-blocked="all"')).toBe(1);
    expect(html).not.toContain(" disabled=");
    const id = html.match(/<p id="([^"]+)" data-learning-blocked="all"/)?.[1];
    expect(id).toBeTruthy();
    // Both tries point at the one reason.
    expect(count(html, `aria-describedby="${id}"`)).toBe(2);
    expect(count(html, 'aria-disabled="true"')).toBe(3);
  });
});

describe("“Nhập số của bạn” — a jump that writes nothing", () => {
  const fake = (hits: Record<string, string>) => ({
    querySelector: (selector: string) => hits[selector] ?? null,
  });

  it("lands on the first invalid field when there is one", () => {
    expect(
      formJumpTarget(fake({ '[aria-invalid="true"]': "rate", "input, select, textarea": "mode" })),
    ).toBe("rate");
  });

  it("otherwise lands on the first control, and on nothing without a form", () => {
    expect(formJumpTarget(fake({ "input, select, textarea": "mode" }))).toBe("mode");
    expect(formJumpTarget(null)).toBeNull();
  });

  it("is a plain button in the panel, always enabled", async () => {
    const p = panelOf(await renderPage({ defaultRate: "tám" }));
    expect(p).toMatch(/<button type="button" data-learning-open-form="true" class=/);
    expect(p).toContain(L.openForm);
  });
});

describe("the scene: unlabelled trays, then two readings on named wholes (F1)", () => {
  const figureOf = (html: string) =>
    markupRegion(html, 'data-learning-illustration="true"', "figure") ?? "";
  const bar = (figure: string, marker: string) => markupRegion(figure, `data-split-bar="${marker}"`) ?? "";
  const pct = (bar: string, key: string) =>
    Number(bar.match(new RegExp(`data-segment="${key}" data-percent="([^"]+)"`))?.[1] ?? Number.NaN);

  it("renders once, RIGHT UNDER the buttons, and before the impact and the card", async () => {
    const p = panelOf(await renderPage());
    expect(count(p, 'data-learning-illustration="true"')).toBe(1);
    const at = p.indexOf('data-learning-illustration="true"');
    for (const before of [
      'data-learning-try="reserve"',
      'data-learning-try="rate"',
      'data-learning-undo="true"',
      'data-learning-open-form="true"',
    ]) {
      expect(p.indexOf(before)).toBeGreaterThan(-1);
      expect(p.indexOf(before)).toBeLessThan(at);
    }
    // The card comes AFTER the composition.
    expect(p.indexOf("<section data-result-status")).toBeGreaterThan(at);
    // Nothing heavy between the last button and the scene.
    const between = p.slice(p.indexOf('data-learning-open-form="true"'), at);
    expect(between).not.toMatch(/data-learning-impact|data-result-status|<table|data-scene-reading/);
  });

  it("shows the real 3D trays at their intrinsic 3 : 2, with nothing laid on them", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    expect(figure).toContain('data-scene-state="ready"');
    expect(figure).toContain('src="/images/tools/affordability-trays-720.webp"');
    expect(figure).toMatch(
      /srcSet="\/images\/tools\/affordability-trays-720\.webp 720w, \/images\/tools\/affordability-trays-1200\.webp 1200w"/i,
    );
    for (const file of ["affordability-trays-720.webp", "affordability-trays-1200.webp"]) {
      expect(existsSync(join(process.cwd(), "public/images/tools", file))).toBe(true);
    }
    // 720 × 480 and 1200 × 800 on disk: the reserved box is 3 : 2 as well.
    const art = markupRegion(figure, 'data-scene-art="true"') ?? "";
    expect(art).toContain('width="1200"');
    expect(art).toContain('height="800"');
    expect(art).toMatch(/class="block h-auto w-full select-none rounded-lg"/);
    expect(art).not.toMatch(/object-cover|object-fill|aspect-\[/);
    expect(figure).toContain(`alt="${L.scene.alt}"`);
    expect(figure).toContain("<figcaption");
    expect(figure).toContain(L.scene.title);
    // The rejected tagged stage is gone: no tag, chip, pin or stage.
    expect(figure).not.toMatch(/data-scene-stage|data-scene-tag|data-scene-mark|data-scene-pin|absolute/);
    // Motion only when welcome; nothing announced from here.
    expect(figure).not.toMatch(/(?<!motion-safe:)transition-/);
    expect(figure).not.toContain("aria-live");
    // The copy carries no area and no approval claim.
    expect(JSON.stringify(L.scene)).not.toMatch(/m²|m2/);
    expect(L.scene.priceLoanMeaning).toContain("không có nghĩa ngân hàng đã duyệt");
  });

  it("reading 1 names its whole — the price — and holds only own money and the loan", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    const scene = affordabilityScene(computeAffordability(SHIPPED_INPUT), 0, SHIPPED_INPUT.downPayment);
    if (scene.kind !== "ready") throw new Error(scene.kind);
    expect(figure).toContain(L.scene.priceHeading.replace("{price}", scene.price.wholeText));
    expect(figure).toContain(L.scene.priceWhole);
    const price = bar(figure, "price");
    expect(pct(price, "own") + pct(price, "loan")).toBeCloseTo(100, 1);
    expect(price).not.toMatch(/data-segment="(?:reserve|fees|toPrice|unused)"/);
    expect(figure).toContain(scene.price.ownText);
    expect(figure).toContain(scene.price.loanText);
    expect(figure).toContain(L.scene.priceLoanMeaning);
  });

  it("reading 2 names its whole — the savings — with the reserve kept apart and the trade-off said", async () => {
    const html = await renderPage({ defaultReserve: "50.000.000", defaultPurchaseCost: "3" });
    const figure = figureOf(panelOf(html));
    expect(figure).toContain(L.scene.savingsHeading.replace("{savings}", "600,0 triệu"));
    expect(figure).toContain(L.scene.savingsWhole);
    const savings = bar(figure, "savings");
    const sum = ["toPrice", "fees", "unused", "reserve"].map((key) => pct(savings, key)).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100, 1);
    expect(pct(savings, "reserve")).toBeCloseTo((50 / 600) * 100, 1);
    expect(pct(savings, "fees")).toBeGreaterThan(0);
    expect(figure).toContain(L.scene.savingsReserve);
    expect(figure).toContain(L.scene.tradeoff);
    // Colour AND texture for every fill; legends at 14 px or more.
    expect(savings).toMatch(/data-segment="reserve"[^>]*radial-gradient/);
    expect(savings).toMatch(/data-segment="fees"[^>]*repeating-linear-gradient/);
    expect(figure).not.toMatch(/text-xs|text-\[(?:[0-9]|1[0-3])px\]|truncate/);
  });

  it("keeps the exact đồng collapsed, below the readings", async () => {
    const p = panelOf(await renderPage());
    const details = region(p, 'data-scene-details="true"', "details");
    expect(details).toContain(L.scene.details);
    expect(details).toContain('data-exact-row="price"');
    expect(details).toContain('data-exact-row="reserve"');
    expect(p).toMatch(/<details data-scene-details="true"(?![^>]*\sopen)/);
  });

  it("is frameless below sm on the pilot, whose card opts into compact padding", async () => {
    const html = await renderPage();
    expect(panelOf(html)).toMatch(
      /^<section [^>]*class="mt-6 sm:rounded-2xl sm:border sm:border-ink-4\/20 sm:bg-white sm:p-4"/,
    );
    // One column in the result column: no two-column split, no reordering.
    expect(panelOf(html)).not.toMatch(/lg:grid-cols-2|\border-/);
    expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
    // The NOXH route keeps the shared default padding.
    const noxh = await renderPage(undefined, "social-housing");
    expect(noxh).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-6 md:p-8"/);
  });

  it("a reserve above the savings: the legend shows what is kept and says what was typed", async () => {
    const html = await renderPage({ defaultReserve: "700.000.000", defaultPurchaseCost: "0", defaultLtv: "100" });
    const figure = figureOf(panelOf(html));
    const legend = markupRegion(figure, 'data-split-label="reserve"') ?? "";
    expect(legend).toContain("600,0 triệu");
    expect(legend).not.toContain("700,0 triệu");
    expect(figure).toContain(L.scene.reserveOver.replace("{typed}", "700,0 triệu").replace("{kept}", "600,0 triệu"));
    const details = region(panelOf(html), 'data-scene-details="true"', "details");
    expect(details).toContain('data-exact-row="reserveTyped"');
    expect(details).toContain("700.000.000 ₫");
  });

  it("after a press the readings describe the result on screen; the impact comes AFTER the scene", () => {
    const before = computeAffordability(SHIPPED_INPUT)!;
    const trial = makeTrial({
      key: "reserve",
      values: SHIPPED_VALUES,
      facts: { usable: true, targetInvalid: false, limited: false, down: 600_000_000, reserve: 0 },
      revision: 0,
      result: before,
      label: "Cần lưu ý",
    })!;
    const after = computeAffordability({ ...SHIPPED_INPUT, cashReserve: 50_000_000 })!;
    const html = panel({
      impact: trialImpactView(trial, after, "Cần lưu ý"),
      scene: affordabilityScene(after, 50_000_000, SHIPPED_INPUT.downPayment),
      canUndo: true,
    });
    expect(html.indexOf('data-learning-illustration="true"')).toBeLessThan(
      html.indexOf('data-learning-impact="reserve"'),
    );
    expect(html.indexOf('data-learning-impact="reserve"')).toBeLessThan(
      html.indexOf("<section data-result-status"),
    );
    // No ghost on a bar that is 100% of its own whole; before/after is the impact's.
    expect(html).not.toContain("data-scene-ghost");
    const savings = bar(figureOf(html), "savings");
    expect(pct(savings, "reserve")).toBeCloseTo((50 / 600) * 100, 1);
    expect(html).toContain('data-learning-bars="true"');
  });

  it("draws no figure while the result is only an upper bound, or invalid", async () => {
    const limited = figureOf(panelOf(await renderPage({ defaultEssentials: "" })));
    expect(limited).toContain('data-scene-state="limited"');
    expect(limited).toContain(L.scene.limited);
    expect(limited).not.toContain("data-segment=");
    // The picture stays as context; the reason replaces the figures.
    expect(limited).toContain("affordability-trays-720.webp");
    const invalid = figureOf(panelOf(await renderPage({ defaultRate: "tám" })));
    expect(invalid).toContain('data-scene-state="unknown"');
    expect(invalid).not.toContain("data-segment=");
    expect(invalid).toContain(L.scene.unknown);
  });

  it("cash only: a real price with no loan says why, instead of a plausible 0", async () => {
    // Maximum loan typed as 0%: the whole price is own money.
    const ltv = figureOf(panelOf(await renderPage({ defaultLtv: "0" })));
    expect(ltv).toContain('data-scene-state="ready"');
    expect(ltv).toContain('data-scene-no-loan="ltv"');
    expect(ltv).toContain(L.scene.noLoanLtv);
    expect(ltv).not.toContain(L.scene.noLoanCapacity);
    // Net 44 − essentials 36 − debts 5 − buffer 3 = 0: no month left to repay.
    const capacity = figureOf(panelOf(await renderPage({ defaultEssentials: "36.000.000" })));
    expect(capacity).toContain('data-scene-no-loan="capacity"');
    expect(capacity).toContain(L.scene.noLoanCapacity);
    // The ordinary example has a loan and says nothing of the kind.
    expect(figureOf(panelOf(await renderPage()))).not.toContain("data-scene-no-loan");
  });

  it("no feasible price: the reason, no bar, and no '0 ₫' split", () => {
    const shipped = computeAffordability(SHIPPED_INPUT)!;
    const html = panel({ scene: affordabilityScene({ ...shipped, maxPrice: 0 }, 0, 600_000_000) });
    const figure = figureOf(html);
    expect(figure).toContain('data-scene-state="none"');
    expect(figure).toContain(L.scene.none);
    expect(figure).not.toContain("data-segment=");
    expect(figure).not.toMatch(/0 ₫|— ₫/);
  });

  it("a figure past the display limit: nothing drawn, no '— ₫', and a field kind to check", async () => {
    const html = await renderPage({ defaultReserve: "10.000.000.000.000.000.000" });
    expect(html).not.toContain('aria-invalid="true"');
    const figure = figureOf(panelOf(html));
    expect(figure).toContain('data-scene-state="display"');
    expect(figure).toContain(L.scene.display);
    expect(figure).not.toContain("data-segment=");
    expect(figure).not.toContain("data-scene-details");
    expect(figure).not.toContain("— ₫");
    // It points at the card below it, which names the field and jumps to it.
    expect(L.scene.display).toContain("phần kết luận bên dưới");
    const p = panelOf(html);
    expect(p.indexOf('data-learning-illustration="true"')).toBeLessThan(p.indexOf("<section data-result-status"));
    expect(p).toContain('data-calc-jump="reserve"');
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });
});

describe("the commercial field hooks are the base set", () => {
  it("marks only the fields a status action, a limit or a try can jump to", async () => {
    const html = await renderPage();
    const keys = [...html.matchAll(/data-calc-field="([^"]+)"/g)].map((match) => match[1]);
    // The base seven, plus the five a whole-tool limit can name (2026-09-30):
    // income, netIncome, rate, term, housingCosts. All pilot-gated.
    expect(keys).toEqual([
      "income",
      "debts",
      "netIncome",
      "essentials",
      "buffer",
      "down",
      "reserve",
      "rate",
      "term",
      "targetPrice",
      "purchaseCost",
      "housingCosts",
    ]);
  });
});

describe("the whole-tool limit (commercial): one refusal, no printed figure anywhere", () => {
  const LIM = L.limits;
  const HUGE = "10.000.000.000.000.000.000"; // 10^19 ₫, every field valid
  const resultOf = (html: string) => markupRegion(html, 'id="kha-nang-mua-nha-ket-qua"') ?? "";
  const answerOf = (html: string) => {
    const at = html.indexOf('data-calc-answer="true"');
    return at === -1 ? "" : html.slice(at, html.indexOf("</p>", at));
  };
  const jumps = (html: string) => [...html.matchAll(/data-calc-jump="([^"]+)"/g)].map((match) => match[1]);
  /** Every jump the card offers lands on a real control in the form. */
  const recoverable = (html: string) => {
    const form = markupRegion(html, 'id="kha-nang-mua-nha-nhap"') ?? html;
    for (const field of jumps(html)) expect(form).toContain(`data-calc-field="${field}"`);
  };
  const captureButton = (html: string) => {
    const at = html.indexOf(F.compareCaptureAction);
    return html.slice(html.lastIndexOf("<button", at), at);
  };

  /** Nothing the page prints at a limit reads as a figure. */
  function refusesEverywhere(html: string, kind: "display" | "model") {
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain("— ₫");
    // The rows are replaced by one sentence; no placeholder cell, no đồng.
    const result = resultOf(html);
    expect(result).toContain(`data-affordability-limit="${kind}"`);
    expect(result).toContain(LIM.rows);
    expect(result).not.toMatch(/>—<|\d ₫|\d (?:tỷ|triệu)/);
    expect(result).not.toContain(F.maxLoanLabel);
    // The pinned answer names the state, not a placeholder figure.
    expect(answerOf(html)).toContain(LIM.cta);
    expect(answerOf(html)).not.toMatch(/—|₫/);
    // No chart, no detail figures, no comparison capture.
    expect(html).toContain(`data-affordability-limit-chart="${kind}"`);
    expect(html).not.toContain(AFFORDABILITY.monthlyChart.title);
    expect(html).not.toContain(F.monthlyDetailTitle);
    expect(html).not.toContain(F.financingDetailTitle);
    expect(captureButton(html)).toContain('disabled=""');
    // One card, in the panel, neutral, with the reason and field jumps.
    const p = panelOf(html);
    expect(count(html, "<section data-result-status")).toBe(1);
    expect(p).toContain('<section data-result-status="unknown"');
    expect(p).toContain(LIM[kind].title);
    expect(p).toContain(LIM.label);
    expect(jumps(p).length).toBeGreaterThan(0);
    recoverable(html);
    // Both tries off with the limit's reason — never "có ô lỗi".
    expect(isDisabled(p, "reserve")).toBe(true);
    expect(isDisabled(p, "rate")).toBe(true);
    expect(p).toContain(LIM.blocked);
    expect(p).not.toContain(L.blocked.invalid);
    expect(p).not.toContain("data-learning-impact");
    // The scene names the same state and draws nothing.
    expect(p).toContain(`data-scene-state="${kind}"`);
    expect(p).not.toContain("data-segment=");
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(p).not.toContain("aria-live");
  }

  it("extreme savings (10^19 ₫): display refusal naming the savings", async () => {
    const html = await renderPage({ defaultDown: HUGE });
    refusesEverywhere(html, "display");
    expect(jumps(panelOf(html))).toEqual(["down"]);
    expect(panelOf(html)).toContain(`“${F.downLabel}”`);
  });

  it("extreme reserve (10^19 ₫): display refusal naming the reserve only", async () => {
    const html = await renderPage({ defaultReserve: HUGE });
    refusesEverywhere(html, "display");
    expect(jumps(panelOf(html))).toEqual(["reserve"]);
  });

  it("a price derived past 10^18 from printable inputs names what the price is built from", async () => {
    // 999.999.999 tỷ of savings + about 2 tỷ of loan capacity ≥ 10^18 ₫.
    const html = await renderPage({ defaultDown: "999.999.999.000.000.000" });
    refusesEverywhere(html, "display");
    expect(jumps(panelOf(html))).toEqual(["netIncome", "down", "term"]);
  });

  it("a finite input the engine cannot compute (credit ceiling on 10^308 ₫): model refusal", async () => {
    const html = await renderPage({ defaultMode: "ceiling", defaultIncome: `1${"0".repeat(308)}` });
    refusesEverywhere(html, "model");
    expect(jumps(panelOf(html))).toEqual(["income"]);
    expect(panelOf(html)).toContain(L.scene.model);
  });

  it("a target price past 10^18 ₫ is named, and nothing else is withheld differently", async () => {
    const html = await renderPage({ defaultTargetPrice: HUGE });
    refusesEverywhere(html, "display");
    expect(jumps(panelOf(html))).toEqual(["targetPrice"]);
  });

  it("an unprintable advanced setting is never echoed as '— ₫' in its summary", async () => {
    const html = await renderPage({ defaultHousingCosts: HUGE });
    refusesEverywhere(html, "display");
    expect(html).toContain(LIM.settingTooLarge);
    expect(jumps(panelOf(html))).toEqual(["housingCosts"]);
  });

  it("the ordinary states keep their own words: invalid, missing essentials, no price, the example", async () => {
    const invalid = await renderPage({ defaultRate: "tám" });
    expect(invalid).toMatch(/aria-invalid="true"/);
    expect(invalid).not.toContain("data-affordability-limit");
    expect(panelOf(invalid)).toContain(L.blocked.invalid);
    const limited = await renderPage({ defaultEssentials: "" });
    expect(limited).not.toContain("data-affordability-limit");
    expect(panelOf(limited)).toContain('data-scene-state="limited"');
    // No savings and a month whose debts use the whole ratio: no price at all.
    const none = await renderPage({ defaultDown: "0", defaultDebts: "25.000.000" });
    expect(none).not.toContain("data-affordability-limit");
    expect(panelOf(none)).toContain('data-scene-state="none"');
    const example = await renderPage();
    expect(example).not.toContain("data-affordability-limit");
    expect(resultOf(example)).toMatch(/\d ₫/);
    expect(example).toContain(AFFORDABILITY.monthlyChart.title);
    expect(captureButton(example)).not.toContain('disabled=""');
  });

  it("an invalid target beside a limit keeps its field error, and nothing claims every field is valid", async () => {
    const html = await renderPage({ defaultTargetPrice: "abc", defaultDown: HUGE });
    // The target keeps its own inline error.
    const target = html.match(/<input[^>]*data-calc-field="targetPrice"[^>]*>/)?.[0] ?? "";
    expect(target).toContain('aria-invalid="true"');
    expect(html).toContain(F.targetInvalid);
    // The limit is still stated, with its named recovery.
    const p = panelOf(html);
    expect(p).toContain(LIM.display.title);
    expect(jumps(p)).toEqual(["down"]);
    recoverable(html);
    // No categorical validity claim anywhere — in the card or the copy.
    expect(html).not.toMatch(/Các ô đều hợp lệ|các ô đều hợp lệ/);
    for (const kind of ["display", "model"] as const) {
      expect(LIM[kind].reason).not.toMatch(/hợp lệ/);
      expect(LIM[kind].reason.startsWith("Với số hiện tại")).toBe(true);
      expect(LIM[kind].reason).toContain("{fields}");
    }
  });
});

describe("the NOXH route renders no pilot (unchanged by this release)", () => {
  it("has no panel, no tries and no status card", async () => {
    const html = await renderPage(undefined, "social-housing");
    expect(html).not.toContain("data-learning-illustration");
    expect(html).not.toContain("affordability-trays");
    expect(html).not.toContain("data-affordability-learning");
    expect(html).not.toContain("data-learning-try");
    expect(html).not.toContain("data-result-status");
    expect(html).not.toContain(L.title);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("has no field hook, no programme notice and no scene markup", async () => {
    const html = await renderPage(undefined, "social-housing");
    expect(html).not.toContain("data-calc-field=");
    expect(html).not.toContain("data-noxh-");
    expect(html).not.toContain("data-refusal-fix");
    expect(html).not.toContain("data-scene-");
    expect(html).not.toContain("data-split-bar");
    expect(html).not.toContain("data-calc-status-announcement");
    expect(html).not.toContain(L.intro);
  });

  it("keeps its own anchors and the shared default card padding", async () => {
    const html = await renderPage(undefined, "social-housing");
    expect(html).toContain('id="nha-o-xa-hoi-nhap"');
    expect(html).toContain('id="nha-o-xa-hoi-ket-qua"');
    expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-6 md:p-8"/);
    expect(html).not.toContain("p-3 sm:p-6 md:p-8");
  });

  it("a figure past the display limit renders exactly as the base did: no new NOXH notice", async () => {
    const html = await renderPage({ defaultReserve: "10.000.000.000.000.000.000" }, "social-housing");
    expect(html).not.toContain("data-affordability-learning");
    expect(html).not.toContain("data-noxh-");
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("never computes the commercial limit: no refusal, no jumps, no new hooks", async () => {
    for (const patch of [
      { defaultDown: "10.000.000.000.000.000.000" },
      { defaultDown: "999.999.999.000.000.000" },
      { defaultMode: "ceiling", defaultIncome: `1${"0".repeat(308)}` },
    ]) {
      const html = await renderPage(patch, "social-housing");
      expect(html).not.toContain("data-affordability-limit");
      expect(html).not.toContain("data-calc-jump");
      expect(html).not.toContain("data-calc-field=");
      expect(html).not.toContain(L.limits.label);
      expect(html).not.toContain(L.limits.rows);
    }
  });

  it("keeps the base advanced-settings summary for an extreme housing cost", async () => {
    const html = await renderPage({ defaultHousingCosts: "10.000.000.000.000.000.000" }, "social-housing");
    // The advanced panel's own <summary>: its title, then the settings line.
    const at = html.lastIndexOf("<summary", html.indexOf(F.ratioGroup));
    const summary = html.slice(at, html.indexOf("</summary>", at));
    // Exactly what the base printed: `money(housingCosts)`, i.e. "— ₫".
    expect(summary).toContain(F.housingCostsLabel);
    expect(summary).toContain("— ₫");
    expect(html).not.toContain(L.limits.settingTooLarge);
    expect(html).not.toContain("data-affordability-limit");
  });
});
