/**
 * Rendered-markup contracts for /cong-cu/co-phieu-tang-truong-khong-deu/ —
 * CSV row 37.
 *
 * WHAT THIS FILE CAN ESTABLISH: the split region contract, the CTA wiring,
 * that the two growth stages are separate input blocks, and — the half of the
 * row a later sweep is most likely to undo — that the headline belongs to the
 * share of value coming from the perpetuity, not to the per-share value.
 *
 * WHAT IT CANNOT: anything about appearance, including whether the split grid
 * actually becomes two columns at any width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { PLACEHOLDER } from "@/lib/calc/number";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";

const CONTENT = "@/content/calculators/ddm-multi";

type FormPatch = Partial<Record<keyof typeof DDM_MULTI.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/ddm-multi")>(
          CONTENT,
        );
      return {
        DDM_MULTI: {
          ...actual.DDM_MULTI,
          form: { ...actual.DDM_MULTI.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/ddm-multi-calculator");
    return renderToStaticMarkup(createElement(loaded.DdmMultiCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = DDM_MULTI.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the long-run assumption is the headline", () => {
  it("answers at the shipped defaults", async () => {
    // D0 2.000 ₫, 20%/năm for 5 năm, then 5% forever, discounted at 12%.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("54.716 ₫"); // value per share
    expect(live).toContain("77,41%"); // share from the terminal value
    expect(live).toContain("12.358 ₫"); // share from the first-stage dividends
  });

  it("gives the headline to the terminal SHARE, not to the value", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    const beforeHeadline = live.slice(0, live.indexOf(HEADLINE));
    expect(beforeHeadline).toContain(C.terminalShareLabel);
    // The value is still first and still labelled — it is just not the shout.
    expect(live.indexOf(C.valueLabel)).toBeLessThan(
      live.indexOf(C.terminalShareLabel),
    );
  });

  it("keeps both halves of the value in the same region", async () => {
    // The two shares must add to the value, so they cannot be split across a
    // disclosure boundary.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(C.terminalShareLabel);
    expect(live).toContain(C.pvDividendsLabel);
  });
});

describe("the two growth stages are separate blocks", () => {
  it("names all three input groups in the form region", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(C.dividendGroup);
    expect(form).toContain(C.highGroup);
    expect(form).toContain(C.terminalGroup);
    expect(form.split("<fieldset").length - 1).toBe(3);
  });

  it("keeps the first stage free to outgrow the required return", async () => {
    // 30% > 12% is the whole reason this model exists, so it is NOT an error.
    const html = await render({ defaultHighGrowth: "30" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(C.unpriceableNotice);
  });

  it("still refuses a terminal rate at or above the required return", async () => {
    const html = await render({ defaultTerminalGrowth: "12" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.terminalGrowthInvalid);
    expect(html).toContain(C.unpriceableNotice);
    expect(html).not.toContain("54.716 ₫");
  });

  it("still rejects a grouped year count", async () => {
    // `parseCount` exists so "1.000" cannot silently become a one-year first
    // stage; losing it would make the field's own error message a lie.
    const html = await render({ defaultYears: "1.000" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.yearsInvalid);
  });
});

describe("the split region and CTA contract", () => {
  it("emits the split grid and all three regions", async () => {
    const html = await render();
    expect(html).toContain(
      'id="co-phieu-khong-deu-nhap" data-calc-region="form"',
    );
    expect(html).toContain('data-calc-region="result"');
    expect(html).toContain('data-calc-region="detail"');
    expect(html).toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="co-phieu-khong-deu-ket-qua"');
    expect(html).toContain('aria-controls="co-phieu-khong-deu-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("pins the value WITH its terminal share, both strings from the rows", async () => {
    // The measured defect: at 1440×1000 with the last field ("Lợi nhuận yêu
    // cầu") focused at y 529–575, the result block was at y −178,25 to −4,25,
    // so both 54.716 ₫ and 77,41% were off the top while the field being
    // edited moved both of them.
    const html = await render();
    const at = html.indexOf('data-calc-answer="true"');
    expect(at, "no pinned restatement").toBeGreaterThan(-1);
    expect(html).toContain("fh-cta-pin");
    const strip = html.slice(at, html.indexOf("</p>", at));

    // The SAME formatted strings the rows render, never a second rounding:
    // both are formatted once in the component and shared.
    expect(strip).toContain(C.pinnedPairLabel);
    expect(strip).toContain("54.716 ₫");
    expect(strip).toContain("77,41%");
    expect(strip).toContain(C.pinnedTerminalSuffix);

    // Decorative by contract — `ResultGroup` owns the one live region.
    expect(html.slice(html.lastIndexOf("<p", at), at)).toContain(
      'aria-hidden="true"',
    );
    // And a pin is not an emphasis: still exactly one headline, on the share.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
  });

  it("pins the placeholder rather than half a pair when the model refuses", async () => {
    // Terminal growth at or above the required return: no finite value, so
    // neither half of the pair exists and the strip must not show one of them.
    const html = await render({ defaultTerminalGrowth: "12" });
    const at = html.indexOf('data-calc-answer="true"');
    const strip = html.slice(at, html.indexOf("</p>", at));
    expect(strip).toContain(C.pinnedPairLabel);
    expect(strip).toContain(PLACEHOLDER);
    expect(strip).not.toContain(C.pinnedTerminalPrefix);
    expect(strip).not.toContain("₫");
    expect(html).toContain(C.unpriceableNotice);
  });

  it("puts the terminal workings and the year table in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("74.650 ₫"); // terminal value at year 5
    expect(detail).toContain("42.358 ₫"); // discounted to today
    // The table's cells carry no ₫ suffix — the column header does that job —
    // so this asserts the bare cell.
    expect(detail).toContain(">4.977<"); // year-5 dividend
    expect(detail).toContain("5.225 ₫"); // first dividend of the stable stage
    expect(detail).toContain(C.table.caption);
    expect(detail).not.toContain('data-results-live="true"');
  });

  it("keeps the year table out of the answer region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("<table");
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});
