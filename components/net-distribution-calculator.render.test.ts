/**
 * Rendered-markup contracts for /cong-cu/phan-phoi-rong/ — audit row 69, "Đưa
 * số thực về tay cạnh số vay; biểu đồ trừ phí trước giải thích dài, không gọi
 * đây là đề nghị giải ngân", at "Hai cột".
 *
 * WHAT THIS FILE CAN ESTABLISH: that "số tiền thực về tay" is the one
 * emphasised answer and the string the sticky CTA pins, that the unchanged
 * obligation is said ON the single nợ gốc row rather than as a second row
 * repeating its đồng figure, that the deduction
 * bridge renders BEFORE the six-row Chi tiết band, that the not-a-commitment
 * line sits in the result region, and that the cross-field percentage rule
 * still marks all three rate fields and blanks every figure.
 *
 * THE ARITHMETIC IS `lib/calc/net-distribution.test.ts`'s. The figures pinned
 * here are the ones `content/calculators/net-distribution.ts` already documents
 * for the shipped defaults (2 tỷ, 1% + 0,5%, 5 triệu phẳng → 35 triệu trừ,
 * 1,965 tỷ về tay; and 2.035.532.995 ₫ gross to receive 2 tỷ), repeated as the
 * runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance. Whether the split reads at a stated width, and
 * whether the bridge is legible beside the answer, is Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { NET_DISTRIBUTION } from "@/content/calculators/net-distribution";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import {
  furtherSteps,
  nearAnswerSteps,
  nextStepsFor,
} from "@/content/calculators/next-steps";

const CONTENT = "@/content/calculators/net-distribution";
const C = NET_DISTRIBUTION;
const F = C.form;
const SLUG = "phan-phoi-rong";
const N = TOOL_SHELL.nextSteps;
/** The route's own entry, so no `why` string is retyped here. */
const STEPS = nextStepsFor(SLUG)!;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

/** The seven form defaults, by their content-file key. */
type Patch = Partial<{
  defaultDirection: string;
  defaultAmount: string;
  defaultPercent1: string;
  defaultPercent2: string;
  defaultPercent3: string;
  defaultFixed1: string;
  defaultFixed2: string;
}>;

function mockDefaults(patch: Patch): void {
  vi.doMock(CONTENT, async () => {
    const actual =
      await vi.importActual<
        typeof import("@/content/calculators/net-distribution")
      >(CONTENT);
    return {
      NET_DISTRIBUTION: {
        ...actual.NET_DISTRIBUTION,
        form: { ...actual.NET_DISTRIBUTION.form, ...patch },
      },
    };
  });
}

async function render(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) mockDefaults(patch);
  try {
    const loaded = await import("@/components/net-distribution-calculator");
    return renderToStaticMarkup(
      // `null` props, on the pattern `effective-rate-calculator.test.ts`
      // ships: the two slots are optional properties of a REQUIRED props
      // object, so the bare mount has to say so.
      createElement(loaded.NetDistributionCalculator, null),
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
 * `app/cong-cu/phan-phoi-rong/page.tsx` mounts.
 */
async function renderPlaced(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) mockDefaults(patch);
  try {
    const [tool, actions, steps] = await Promise.all([
      import("@/components/net-distribution-calculator"),
      import("@/components/calc/result-actions"),
      import("@/components/calc/tool-next-steps"),
    ]);
    return renderToStaticMarkup(
      createElement(tool.NetDistributionCalculator, {
        actions: createElement(actions.ResultActions, { slug: SLUG }),
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

describe("the money in hand is beside the money borrowed", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="phan-phoi-rong-nhap" data-calc-region="form"');
    expect(html).toContain('id="phan-phoi-rong-ket-qua"');
    expect(html).toContain('aria-controls="phan-phoi-rong-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps all four input groups in the form, in order", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [
      F.directionLegend,
      F.amountGroup,
      F.percentGroup,
      F.fixedGroup,
    ].map((title) => form!.indexOf(title));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("emphasises the net, and says the obligation ON the gross row", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(F.netLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // §6: net, nợ gốc, gross-up. The obligation used to be a fourth peer row
    // repeating the nợ gốc figure; it is now a note on the row it qualifies.
    expect(rows(live!)).toBe(3);
    expect(live).toContain("1.965.000.000 ₫");
    expect(live).toContain(F.obligationLabel);
    // One quantity, one place: the gross đồng figure is announced ONCE.
    expect(live!.split("2.000.000.000 ₫").length - 1).toBe(1);
    // And the qualifier travels with it, inside the same row.
    const grossRow = live!.slice(live!.indexOf(F.grossLabel));
    expect(grossRow.indexOf(F.obligationLabel)).toBeLessThan(
      grossRow.indexOf(F.grossUpLabel),
    );

    const cta = markupRegion(html, 'data-calc-cta="true"')!;
    expect(cta).toContain('data-calc-answer="true"');
    expect(cta).toContain(F.netLabel);
    // One formatting of one quantity, in both places.
    expect(cta).toContain("1.965.000.000 ₫");
  });

  it("keeps the 'fees do not reduce the debt' sentence beside the answer", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.obligationNote);
    // Context, not an announced answer.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.obligationNote.slice(0, 30));
  });
});

describe("this is not a disbursement offer", () => {
  it("says so in the result region, not only at the foot of the page", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.notCommitmentLine);
  });

  it("says so even while the figures are refused", async () => {
    // A promoted placeholder is still a promoted figure's slot.
    const html = await render({ defaultPercent1: "100" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.notCommitmentLine);
  });
});

describe("the chart comes before the long explanation", () => {
  it("puts the deduction bridge in the result column, above the band", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.chart.title);
    // The figure follows the answer inside the same column…
    expect(result.indexOf(F.netLabel)).toBeLessThan(
      result.indexOf(C.chart.title),
    );
    // …and the six-row breakdown is the full-width band below it.
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.detailTitle);
    expect(detail).toContain(F.totalRateLabel);
    expect(result).not.toContain(F.detailTitle);
  });

  it("keeps the whole breakdown and its rates out of the live region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("30.000.000 ₫");
    expect(detail).toContain("5.000.000 ₫");
    expect(detail).toContain("35.000.000 ₫");
    expect(detail).toContain("1,5000%");
    expect(detail).toContain("1,7500%");
    expect(detail).toContain("98,2500%");
    expect(rows(detail)).toBe(6);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.totalRateLabel);
  });
});

describe("the preserved directions and refusals", () => {
  it("still answers the reverse direction", async () => {
    const html = await render({ defaultDirection: "toGross" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    // 2.035.532.995 ₫ must be quoted to receive 2 tỷ, per the content file.
    expect(live).toContain("2.035.532.995 ₫");
    expect(live).toContain("2.000.000.000 ₫");
  });

  it("still blames every rate field when the rates sum to 100", async () => {
    // Each rate is individually legal; the SUM is the fault, so all three
    // carry the flag and the shared total-rate error.
    const html = await render({
      defaultPercent1: "60",
      defaultPercent2: "40",
    });
    expect(html.split('aria-invalid="true"').length - 1).toBe(3);
    expect(html).toContain(F.totalRateInvalid);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.tooMuchNotice);
    // And nothing survives to be announced.
    expect(result).not.toContain("1.965.000.000 ₫");
    expect(result).not.toContain(F.obligationNote.slice(0, 30));
    // The qualifier goes with the figure: nothing asserts an obligation on a
    // dash.
    expect(result).not.toContain(F.obligationLabel);
  });

  it("still reports a negative net rather than rounding it to zero", async () => {
    const html = await render({
      defaultAmount: "1.000.000",
      defaultFixed1: "5.000.000",
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.negativeNetNotice);
  });

  it("still refuses a zero amount on the amount field alone", async () => {
    const html = await render({ defaultAmount: "0" });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(F.amountInvalid);
  });
});

/** How many times a string occurs in some markup. */
const count = (markup: string, needle: string) =>
  markup.split(needle).length - 1;

describe("the APR question sits beside the net figure", () => {
  it("places the two near-answer links between the answer and the chart", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    const at = result.indexOf('data-calc-actions="near-answer"');
    expect(at).toBeGreaterThan(-1);
    // Answer → actions → chart → further guidance, in source order. The links
    // used to be reachable only after the chart, the six-row band and both
    // refusal paragraphs.
    expect(at).toBeGreaterThan(result.indexOf(F.netLabel));
    expect(at).toBeLessThan(result.indexOf(C.chart.title));

    // `ResultActions` renders a `<section>`, so the bound is that tag's.
    const near = markupRegion(
      html,
      'data-calc-actions="near-answer"',
      "section",
    )!;
    expect(near).toContain(STEPS.intro);
    for (const step of nearAnswerSteps(SLUG)) expect(near).toContain(step.why);
    expect(near).toContain(N.actionsNote);
    // The links are NOT inside the live region: a recalculation must not recite
    // two link labels on every keystroke.
    expect(markupRegion(html, 'data-results-live="true"')!).not.toContain(
      "data-calc-actions",
    );
  });

  it("retains the third destination below, without duplicating the first two", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    // Nothing was dropped: three tools in, three tools out — two promoted and
    // one under `furtherTitle` after the figure.
    const further = furtherSteps(SLUG);
    expect(further.length).toBe(STEPS.tools.length - nearAnswerSteps(SLUG).length);
    expect(result).toContain(N.furtherTitle);
    for (const step of further) expect(result).toContain(step.why);
    for (const step of STEPS.tools) expect(count(html, step.why)).toBe(1);
    // The intro travelled with the promoted links; it is not printed twice.
    expect(count(html, STEPS.intro)).toBe(1);
    // And the retention panel stays after the further list.
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
  });
});
