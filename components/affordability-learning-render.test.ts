/**
 * Rendered-markup contracts for the "Thử một thay đổi" pilot on
 * /cong-cu/kha-nang-mua-nha/, and its absence on /cong-cu/nha-o-xa-hoi/.
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
  illustrationParts,
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
      illustration: illustrationParts(computeAffordability(SHIPPED_INPUT), 0),
      canUndo: false,
      onTry: () => {},
      onUndo: () => {},
      ...props,
    }),
  );
}

describe("the commercial page at its opening state", () => {
  it("renders the panel BEFORE the form, holding the ONE status card", async () => {
    const html = await renderPage();
    expect(count(html, "<section data-result-status")).toBe(1);
    const panelAt = html.indexOf('data-affordability-learning="true"');
    expect(panelAt).toBeGreaterThan(-1);
    expect(panelAt).toBeLessThan(html.indexOf('data-calc-region="form"'));
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
    // Exact đồng only inside the labelled disclosure, not in the prose above it.
    const exact = html.slice(html.indexOf('data-learning-exact="true"'));
    const prose = html.slice(0, html.indexOf('data-learning-exact="true"'));
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

describe("the tray illustration (concept A)", () => {
  const figureOf = (html: string) =>
    markupRegion(html, 'data-learning-illustration="true"', "figure") ?? "";

  it("renders once, AFTER the controls and the card, so it cannot move a button", async () => {
    const p = panelOf(await renderPage());
    expect(count(p, 'data-learning-illustration="true"')).toBe(1);
    const at = p.indexOf('data-learning-illustration="true"');
    for (const before of [
      'data-learning-try="reserve"',
      'data-learning-try="rate"',
      'data-learning-undo="true"',
      'data-learning-open-form="true"',
      "<section data-result-status",
    ]) {
      expect(p.indexOf(before)).toBeGreaterThan(-1);
      expect(p.indexOf(before)).toBeLessThan(at);
    }
  });

  it("stays after the impact of a press, too", () => {
    const before = computeAffordability(SHIPPED_INPUT)!;
    const trial = makeTrial({
      key: "rate",
      values: SHIPPED_VALUES,
      facts: { usable: true, targetInvalid: false, limited: false, down: 600_000_000, reserve: 0 },
      revision: 0,
      result: before,
      label: "Cần lưu ý",
    })!;
    const after = computeAffordability({ ...SHIPPED_INPUT, annualRatePercent: 9.5 })!;
    const html = panel({
      impact: trialImpactView(trial, after, "Cần lưu ý"),
      illustration: illustrationParts(after, 0),
      canUndo: true,
    });
    expect(html.indexOf('data-learning-impact="rate"')).toBeLessThan(
      html.indexOf('data-learning-illustration="true"'),
    );
  });

  it("is a labelled local WebP with alt text, a badge and an HTML caption", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    expect(figure).toContain('src="/images/tools/affordability-trays-720.webp"');
    expect(figure).toMatch(
      /srcSet="\/images\/tools\/affordability-trays-720\.webp 720w, \/images\/tools\/affordability-trays-1200\.webp 1200w"/i,
    );
    for (const file of ["affordability-trays-720.webp", "affordability-trays-1200.webp"]) {
      expect(existsSync(join(process.cwd(), "public/images/tools", file))).toBe(true);
    }
    expect(figure).toContain(`alt="${L.illustration.alt}"`);
    expect(figure).toContain('loading="lazy"');
    expect(figure).toContain(L.illustration.badge);
    expect(figure).toContain("<figcaption");
    expect(figure).toContain(L.illustration.title);
    expect(L.illustration.title).toBe("Tiền mua nhà và khoản giữ lại");
    expect(figure).toContain(L.illustration.caption);
    // Own money + loan is the price; the purchase costs are named apart, once.
    expect(figure).toContain('data-illustration-fees="true"');
    expect(count(figure, L.illustration.feesNote)).toBe(1);
    expect(L.illustration.feesNote).toContain("kết quả chi tiết");
    // Nothing in the picture's copy names a price, an area or an approval.
    const words = JSON.stringify(L.illustration);
    expect(words).not.toMatch(/m²|m2|\d+(?:[.,]\d+)?\s*(?:tỷ|triệu)/);
    expect(L.illustration.caption).toContain("không thể hiện giá, diện tích hay việc ngân hàng duyệt vay");
  });

  it("names the three parts, with the engine's own rounded figures", async () => {
    const figure = figureOf(panelOf(await renderPage()));
    const result = computeAffordability(SHIPPED_INPUT)!;
    const parts = illustrationParts(result, SHIPPED_INPUT.cashReserve);
    expect(parts.map((part) => part.key)).toEqual(["own", "loan", "reserve"]);
    for (const part of parts) {
      expect(figure).toContain(`data-illustration-part="${part.key}"`);
      expect(figure).toContain(part.label);
      expect(figure).toContain(part.meaning);
      expect(part.value).not.toBeNull();
      expect(figure).toContain(part.value!);
    }
    expect(figure).toContain(L.illustration.figuresNote);
    expect(figure).not.toContain(L.illustration.noFigures);
    expect(figure).not.toContain("aria-live");
  });

  it("drops the figures, not the legend, while the result is only an upper bound", async () => {
    const figure = figureOf(panelOf(await renderPage({ defaultEssentials: "" })));
    expect(count(figure, "data-illustration-part=")).toBe(3);
    expect(figure).toContain(L.illustration.noFigures);
    expect(figure).not.toContain(L.illustration.figuresNote);
  });
});

describe("the NOXH route renders no pilot", () => {
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
});
