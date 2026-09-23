/**
 * Rendered-markup contracts for /cong-cu/irr-npv/ — CSV row 24.
 *
 * WHAT THIS FILE CAN ESTABLISH: that the cash-flow boxes and the NPV/IRR
 * answer are separate regions with the CTA between them, that every rate
 * this page reports carries its period, that NPV is the one headline, and
 * that a legitimately absent IRR or payback is explained beside the blank
 * without marking any control invalid.
 *
 * WHAT IT CANNOT: anything about appearance. It also cannot reach the
 * multiple-root branch of the no-IRR copy — `defaultFlow` is one string for
 * all twelve periods, so a content patch can only build flow sets that
 * change sign at most once. `lib/calc/irr-npv.test.ts` owns that condition
 * at the arithmetic level; what is untested is only the sentence.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { IRR_NPV } from "@/content/calculators/irr-npv";

const CONTENT = "@/content/calculators/irr-npv";

type FormPatch = Partial<Record<keyof typeof IRR_NPV.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/irr-npv")>(
          CONTENT,
        );
      return {
        IRR_NPV: {
          ...actual.IRR_NPV,
          form: { ...actual.IRR_NPV.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/irr-npv-calculator");
    return renderToStaticMarkup(createElement(loaded.IrrNpvCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = IRR_NPV.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("NPV leads and every rate names its period", () => {
  it("answers at the shipped defaults", async () => {
    // −1 tỷ, then 300 triệu × 5, discounted at 10% per period.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("137.236.031 ₫");
    expect(live).toContain("15,2382%/kỳ");
    expect(live).toContain("12,8659%/kỳ");
  });

  it("never prints a bare percentage for IRR or MIRR", async () => {
    // Row 24's "ghi rõ kỳ": the tool cannot know whether a kỳ is a year or a
    // month, so it must not report a rate as if it knew.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("15,2382%<");
    expect(live).not.toContain("12,8659%<");
  });

  it("gives the headline to NPV and to nothing else", async () => {
    // People come for the IRR; the page's notice says to read NPV first. A
    // headline on IRR would make that notice decoration.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(C.npvLabel);
    expect(live.indexOf(C.npvLabel)).toBeLessThan(live.indexOf(C.irrLabel));
    expect(live.indexOf(C.irrLabel)).toBeLessThan(live.indexOf(C.mirrLabel));
  });

  it("states the period basis in the result region but outside the live region", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.periodBasisNote);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(C.periodBasisNote);
  });
});

describe("the conditions under which a figure is absent", () => {
  it("explains a missing IRR beside the blank, without a bad field", async () => {
    // Every flow positive: there is no break-even to solve for.
    const html = await render({ defaultPeriod0: "1.000.000.000" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.noIrrSameSign);
    expect(result).not.toContain(C.noIrrManySigns);
    // The flows are all legal numbers; nothing is wrong with any box.
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("explains a missing MIRR beside its own blank", async () => {
    // The state an independent browser pass reached: period 0 positive, so
    // there is no discounted outflow and `modifiedIrrPercent` is null while
    // every field stays legal. `formula` used to say MIRR always exists.
    const html = await render({ defaultPeriod0: "1.000.000.000" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.noMirr);
    expect(html).not.toContain('aria-invalid="true"');
    // Both blanks are explained, and the MIRR row is genuinely empty.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("2.137.236.031 ₫");
    expect(live).not.toContain("%/kỳ");
  });

  it("says nothing about a MIRR that exists", async () => {
    const html = await render();
    expect(html).not.toContain(C.noMirr);
  });

  it("explains a project that never recovers its outlay", async () => {
    const html = await render({ defaultFlow: "0" });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(C.noPayback);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("keeps the sign-change count available as the diagnostic", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(C.signChangesLabel);
    expect(detail).toContain(`1 ${C.timesUnit}`);
  });
});

describe("the flow boxes are separated from the answer", () => {
  it("keeps the secondary measures in one non-live detail group", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("1,1372"); // profitability index
    expect(detail).toContain(`3,33 ${C.periodsUnit}`);
    expect(detail).toContain(`4,26 ${C.periodsUnit}`);
    expect(detail).not.toContain('data-results-live="true"');
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("renders one flow box per period and no more", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(C.periodLabel.replace("{n}", "5"));
    expect(form).not.toContain(C.periodLabel.replace("{n}", "6"));
    // Setup and flows, still two groups.
    expect(form.split("<fieldset").length - 1).toBe(2);
  });

  it("still rejects a grouped period count and drops the flow boxes", async () => {
    // `parseCount` is why "1.000" cannot pass as one period.
    const html = await render({ defaultPeriods: "1.000" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.periodsInvalid);
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).not.toContain(C.periodLabel.replace("{n}", "1"));
  });

  it("emits both regions and points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="irr-npv-nhap" data-calc-region="form"');
    expect(html).toContain('id="irr-npv-ket-qua"');
    expect(html).toContain('aria-controls="irr-npv-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    // CORRECTED to the approved long-form layout. This asserted the ABSENCE of
    // the split grid, recording the single-column choice as deliberate; an
    // independent review ruled that an implementation preference rather than
    // an approved exception to the global 40/60 requirement for long tools.
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("lg:col-span-2");
    // And the detail region still spans the whole grid, so the seven-row
    // workings group is not squeezed into three-fifths.
    expect(html).toContain("lg:col-span-5");
  });
});
