/**
 * Rendered-markup contracts for /cong-cu/phan-bo-tai-san/ — audit row 58, "Ưu
 * tiên quỹ dự phòng, tiền mua nhà và phần còn lại; biểu đồ phân bổ cạnh form,
 * ngày là giả định phụ", at "Hai cột".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the announced group is the tool's fixed
 * funding order plus the remainder with ONE emphasised answer, that the wish
 * pair ("tổng mong muốn" / "còn thiếu") is still rendered but no longer
 * announced beside the allocations, that each purpose's need date rides inside
 * its own row rather than as a peer figure, that the long anchor convention is
 * present verbatim in a collapsed disclosure, and that the allocation bar is
 * in the result region while the wide study table is in the full-width band.
 *
 * THE ARITHMETIC IS `lib/calc/fund-allocation.test.ts`'s. The figures pinned
 * below are the shipped defaults (1 tỷ available, 150 triệu reserve, 650 triệu
 * for the house at 12 months, 150 triệu elsewhere at 24, anchored 15/9/2026),
 * repeated here as the runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance. Whether the two columns are usable at a stated
 * width, and whether the bar reads beside the form, is Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { ASSET_ALLOCATION } from "@/content/calculators/asset-allocation";

import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import {
  furtherSteps,
  nearAnswerSteps,
  nextStepsFor,
} from "@/content/calculators/next-steps";

const CONTENT = "@/content/calculators/asset-allocation";
const P = ASSET_ALLOCATION.purpose;
const F = ASSET_ALLOCATION.form;
const SLUG = "phan-bo-tai-san";
const N = TOOL_SHELL.nextSteps;
/** The route's own entry, so no `why` string is retyped here. */
const STEPS = nextStepsFor(SLUG)!;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

// `Record<…, string>`, not `Partial<typeof …>`: the content file is `as
// const`, so the derived type would only accept each key's SHIPPED value and
// reject every override this file exists to make.
type Overrides = {
  purpose?: Partial<Record<keyof typeof P, string>>;
  defaults?: Partial<Record<keyof typeof F.defaults, string>>;
};

function mockContent(overrides: Overrides): void {
  vi.doMock(CONTENT, async () => {
    const actual =
      await vi.importActual<
        typeof import("@/content/calculators/asset-allocation")
      >(CONTENT);
    const base = actual.ASSET_ALLOCATION;
    return {
      ASSET_ALLOCATION: {
        ...base,
        purpose: { ...base.purpose, ...overrides.purpose },
        form: {
          ...base.form,
          defaults: { ...base.form.defaults, ...overrides.defaults },
        },
      },
    };
  });
}

async function render(overrides?: Overrides): Promise<string> {
  vi.resetModules();
  if (overrides) mockContent(overrides);
  try {
    const loaded = await import("@/components/asset-allocation-calculator");
    // `null` props, on the pattern `effective-rate-calculator.test.ts` ships:
    // the two slots are optional properties of a REQUIRED props object, so the
    // bare mount has to say so.
    return renderToStaticMarkup(
      createElement(loaded.AssetAllocationCalculator, null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/**
 * The same tool WITH the two slots the route passes.
 *
 * `render` above mounts it bare, which cannot see placement at all: the
 * near-answer links are a prop. This mounts what
 * `app/cong-cu/phan-bo-tai-san/page.tsx` mounts.
 */
async function renderPlaced(overrides?: Overrides): Promise<string> {
  vi.resetModules();
  if (overrides) mockContent(overrides);
  try {
    const [tool, actions, steps] = await Promise.all([
      import("@/components/asset-allocation-calculator"),
      import("@/components/calc/result-actions"),
      import("@/components/calc/tool-next-steps"),
    ]);
    return renderToStaticMarkup(
      createElement(tool.AssetAllocationCalculator, {
        actions: createElement(actions.ResultActions, { slug: SLUG }),
        // The advanced study's own framing, exactly as the route passes it.
        studyActions: createElement(actions.ResultActions, {
          slug: SLUG,
          intro: P.studyStepsIntro,
        }),
        nextSteps: createElement(steps.ToolNextSteps, {
          slug: SLUG,
          promoted: true,
        }),
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

describe("the layout wiring", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="phan-bo-tai-san-nhap" data-calc-region="form"');
    expect(html).toContain('id="phan-bo-tai-san-ket-qua"');
    expect(html).toContain('aria-controls="phan-bo-tai-san-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    // Ten inputs ending in a three-box date group: the block pins.
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps the mode selector and all four purpose groups in the form", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [
      P.modeLegend,
      P.potGroup,
      P.homeGroup,
      P.otherGroup,
      P.anchorGroup,
      P.todayLabel,
    ].map((title) => form!.indexOf(title));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("pins the same reserve string the emphasised row renders", async () => {
    const html = await render();
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta).not.toBeNull();
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).toContain('aria-hidden="true"');
    expect(cta!).toContain(P.reserveResultLabel);
    expect(cta!).toContain("150.000.000 ₫");
  });
});

describe("the announced group is the funding order and the remainder", () => {
  it("emphasises the reserve, and only the reserve", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      P.reserveResultLabel,
    );
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("announces four rows in the declared order, with the figures", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(rows(live)).toBe(4);
    const order = [
      P.reserveResultLabel,
      P.homeResultLabel,
      P.otherResultLabel,
      P.unallocatedLabel,
    ].map((label) => live.indexOf(label));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(live).toContain("650.000.000 ₫");
    expect(live).toContain("50.000.000 ₫");
  });

  it("moves the wish pair out of the announcement without dropping it", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(P.requestedLabel);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.comparisonTitle);
    expect(result).toContain(P.requestedLabel);
    // 150 + 650 + 150 triệu wanted, against a 1 tỷ pot.
    expect(result).toContain("950.000.000 ₫");
    // Nothing is short at the defaults, so there is no gap row to invent.
    expect(result).not.toContain(P.shortfallLabel);
  });

  it("still states a real shortfall, and still explains the fixed order", async () => {
    // Half the pot: the reserve draws first, the house takes what is left and
    // the other goal gets nothing — the convention `shortfallNotice` states.
    const html = await render({ purpose: { defaultAvailable: "500.000.000" } });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.shortfallLabel);
    expect(result).toContain("450.000.000 ₫");
    expect(result).toContain(P.shortfallNotice);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(rows(live)).toBe(4);
    expect(live).not.toContain(P.shortfallLabel);
    // The house is funded to 350 triệu and the other goal to nothing.
    expect(live).toContain("350.000.000 ₫");
    expect(live).toContain("0 ₫");
  });
});

describe("the date is a supplementary assumption", () => {
  it("carries each need date inside that purpose's own row", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    const homeRow = live.slice(
      live.indexOf(P.homeResultLabel),
      live.indexOf(P.otherResultLabel),
    );
    // 15/9/2026 plus twelve months, through the shared `addMonths`.
    expect(homeRow).toContain(P.needDateNote.replace("{date}", "15/9/2027"));
    // One row boundary between the two labels: the date did not become a peer.
    expect(rows(homeRow)).toBe(1);
    expect(live).toContain(P.needDateNote.replace("{date}", "15/9/2028"));
  });

  it("promotes one short anchor line and keeps the convention verbatim below", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.anchorShort.replace("{date}", "15/9/2026"));
    // The clamping paragraph is no longer open between the figures.
    expect(result).not.toContain(P.anchorNotice.slice(0, 40));

    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(P.anchorDetailTitle);
    expect(detail).toContain(P.anchorNotice.replace("{date}", "15/9/2026"));
    // And the per-purpose list it used to end with.
    expect(detail).toContain(
      P.anchorPurposeFormat
        .replace("{name}", P.homeName)
        .replace("{date}", "15/9/2027"),
    );
    expect(detail).toContain("<details ");
    expect(detail).not.toContain("<details open");
  });

  it("says so on the row when a purpose stated no month", async () => {
    const html = await render({ purpose: { defaultOtherMonths: "" } });
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(P.needDateUnknownNote);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.timeUnknownNotice);
    // A blank is not zero months: the allocation still happened.
    expect(live).toContain("150.000.000 ₫");
  });

  it("treats zero months as a real answer", async () => {
    const html = await render({ purpose: { defaultHomeMonths: "0" } });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(P.needDateNote.replace("{date}", "15/9/2026"));
    expect(live).not.toContain(P.needDateUnknownNote);
  });
});

describe("the figure sits in the result column, the wide table below", () => {
  it("puts the allocation bar beside the form, not in the detail band", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(ASSET_ALLOCATION.chart.title);
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).not.toContain(ASSET_ALLOCATION.chart.title);
    expect(detail).toContain(ASSET_ALLOCATION.purposeIntro);
  });

  it("keeps the six-column study table in the full-width band", async () => {
    // The mode lives in `purpose.defaultMode`, not in `form.defaults` — the
    // component binds `mode: P.defaultMode`.
    const html = await render({ purpose: { defaultMode: "portfolio" } });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.table.caption);
    expect(detail).toContain(ASSET_ALLOCATION.correlationNotice);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain(F.table.caption);
  });
});

describe("the retained study keeps its own answer and refusals", () => {
  it("emphasises the drift and lands the CTA on its group", async () => {
    // The mode lives in `purpose.defaultMode`, not in `form.defaults` — the
    // component binds `mode: P.defaultMode`.
    const html = await render({ purpose: { defaultMode: "portfolio" } });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain('id="phan-bo-tai-san-ket-qua"');
    expect(result).toContain(F.maxDriftLabel);
    expect(result.split(HEADLINE).length - 1).toBe(1);
    // All four groups, and the verdict sentence, stay with the figures.
    for (const title of [F.riskTitle, F.currentTitle, F.ruleTitle]) {
      expect(result).toContain(title);
    }
    expect(result).toContain(F.rebalanceNotice);
    // The study is not the announced mode; the export renders the default one.
    expect(html).not.toContain('data-results-live="true"');
  });
});

describe("the preserved refusals of the default mode", () => {
  it("blames one amount field and renders no detail disclosure", async () => {
    const html = await render({ purpose: { defaultAvailable: "-1" } });
    expect(html).toContain(P.amountInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.invalidNotice);
    // No allocation, so no anchor convention to disclose — but the mode's own
    // explanation is not conditional on a usable form.
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).not.toContain(P.anchorDetailTitle);
    expect(detail).toContain(ASSET_ALLOCATION.purposeIntro);
  });

  it("names the date group when the anchor itself is impossible", async () => {
    const html = await render({ purpose: { defaultAnchorDay: "31" } });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(P.anchorDateInvalid);
    expect(result).not.toContain(P.invalidNotice);
    expect(html).toContain(P.anchorInvalid);
  });
});

/** How many times a string occurs in some markup. */
const count = (markup: string, needle: string) =>
  markup.split(needle).length - 1;

describe("the destinations sit beside the active mode's answer", () => {
  it("places the two near-answer links between the reserve and the bar", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    const at = result.indexOf('data-calc-actions="near-answer"');
    expect(at).toBeGreaterThan(-1);
    expect(at).toBeGreaterThan(result.indexOf(P.reserveResultLabel));
    expect(at).toBeLessThan(result.indexOf(ASSET_ALLOCATION.chart.title));

    // `ResultActions` renders a `<section>`, so the bound is that tag's.
    const near = markupRegion(
      html,
      'data-calc-actions="near-answer"',
      "section",
    )!;
    // The DEFAULT mode is the one the entry sentence was written for: it does
    // produce a home-purchase allocation, so it keeps that sentence.
    expect(near).toContain(STEPS.intro);
    expect(near).not.toContain(P.studyStepsIntro);
    for (const step of nearAnswerSteps(SLUG)) expect(near).toContain(step.why);
    expect(near).toContain(N.actionsNote);
    // Not inside the live region: a recalculation must not recite link labels.
    expect(markupRegion(html, 'data-results-live="true"')!).not.toContain(
      "data-calc-actions",
    );
  });

  it("follows the mode selector without branching on it", async () => {
    // The study promotes max drift and mounts no chart, and this slot still
    // lands directly after its answer — one `primary` mounts, and the layout
    // emits `actions` after it, so no mode-local branch is needed. Unlike the
    // page's `intro` slot, these two destinations are mode-neutral.
    const html = await renderPlaced({ purpose: { defaultMode: "portfolio" } });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    const at = result.indexOf('data-calc-actions="near-answer"');
    expect(at).toBeGreaterThan(result.indexOf(F.maxDriftLabel));
    expect(at).toBeLessThan(result.indexOf(N.saveTitle));
    expect(result).not.toContain(ASSET_ALLOCATION.chart.title);
    // What DOES change with the mode is the sentence above the links. The
    // study compares today's weights with an age rule and allocates nothing
    // for a home, so it must not introduce them with the entry's "dùng chính
    // con số phân bổ cho tiền mua nhà".
    const near = markupRegion(
      html,
      'data-calc-actions="near-answer"',
      "section",
    )!;
    expect(near).toContain(P.studyStepsIntro);
    expect(near).not.toContain(STEPS.intro);
    // Same destinations either way — the override replaces the framing only.
    for (const step of nearAnswerSteps(SLUG)) expect(near).toContain(step.why);
    expect(near).toContain(N.actionsNote);
  });

  it("sends a home buyer to the purpose mode instead of claiming a figure", async () => {
    // The study's sentence has to name the mode that does allocate money for
    // a home, by the selector label on screen, and add no new destination.
    expect(P.studyStepsIntro).toContain(P.modePurpose);
    expect(P.studyStepsIntro).not.toContain("phân bổ cho tiền mua nhà");
  });

  it("retains the third destination and the article below, unduplicated", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    const further = furtherSteps(SLUG);
    expect(further.length).toBe(
      STEPS.tools.length - nearAnswerSteps(SLUG).length,
    );
    expect(result).toContain(N.furtherTitle);
    for (const step of further) expect(result).toContain(step.why);
    // Three tools in, three out, each printed exactly once.
    for (const step of STEPS.tools) expect(count(html, step.why)).toBe(1);
    // Exactly ONE framing renders, once: the page hands over two prebuilt
    // nodes and the mode picks one.
    expect(count(html, STEPS.intro)).toBe(1);
    expect(count(html, P.studyStepsIntro)).toBe(0);
    const study = await renderPlaced({ purpose: { defaultMode: "portfolio" } });
    expect(count(study, P.studyStepsIntro)).toBe(1);
    expect(count(study, STEPS.intro)).toBe(0);
    for (const step of STEPS.tools) expect(count(study, step.why)).toBe(1);
    // The education link is longer guidance, so it stays in the lower block.
    expect(result).toContain(STEPS.education!.label);
    expect(result.indexOf(N.furtherTitle)).toBeLessThan(
      result.indexOf(N.saveTitle),
    );
  });

  it("renders none of it when the route passes no slots", async () => {
    // Makes the assertions above non-vacuous.
    const html = await render();
    expect(html).not.toContain("data-calc-actions");
    expect(html).not.toContain(N.title);
    expect(html).not.toContain(STEPS.intro);
    expect(html).not.toContain(P.studyStepsIntro);
  });
});
