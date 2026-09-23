/**
 * Rendered-markup contracts for /cong-cu/fibonacci/ — CSV row 44.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that the
 * three key levels stay in the announced summary while both full tables sit in
 * the detail region, and — the one that is easy to undo by accident — that NO
 * level is given the headline treatment. See the component docstring: on a page
 * whose own notice says a level guarantees nothing, promoting 61,8% would be a
 * trading claim.
 *
 * WHAT IT CANNOT: anything about appearance or table readability at a width.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { FIBONACCI } from "@/content/calculators/fibonacci";

const CONTENT = "@/content/calculators/fibonacci";

type FormPatch = Partial<Record<keyof typeof FIBONACCI.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/fibonacci")
      >(CONTENT);
      return {
        FIBONACCI: {
          ...actual.FIBONACCI,
          form: { ...actual.FIBONACCI.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/fibonacci-calculator");
    return renderToStaticMarkup(createElement(loaded.FibonacciCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = FIBONACCI.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the key levels stay visible in the summary", () => {
  it("answers at the shipped defaults", async () => {
    // 40.000 to 60.000, uptrend: a 20.000 range retraced from the high.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("52.360 ₫"); // 38,2%
    expect(live!).toContain("50.000 ₫"); // 50%
    expect(live!).toContain("47.640 ₫"); // 61,8%
    expect(live!).toContain("20.000 ₫"); // the range
  });

  it("gives no level the headline treatment", async () => {
    const html = await render();
    expect(html).not.toContain(HEADLINE);
  });

  it("reverses the levels with the trend, without reordering the rows", async () => {
    const html = await render({ defaultDirection: "downtrend" });
    const live = markupRegion(html, 'data-results-live="true"');
    // Measured up from the low instead: 40.000 + 0,382 × 20.000.
    expect(live!).toContain("47.640 ₫");
    expect(live!).toContain("52.360 ₫");
    // Row ORDER is the ratio order either way, so 38,2% is still read first.
    expect(live!.indexOf(C.level382Label)).toBeLessThan(
      live!.indexOf(C.level618Label),
    );
  });
});

describe("the full level tables sit below, not in the announcement", () => {
  it("puts both tables in the detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.retracementTable.caption);
    expect(detail!).toContain(C.extensionTable.caption);
    expect(detail!).toContain("<table");
  });

  it("keeps the tables out of the single live region", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("<table");
  });

  it("drops the tables rather than rendering empty ones on a bad entry", async () => {
    // A low above the high has no swing to retrace.
    const html = await render({ defaultLow: "70.000" });
    expect(html).toContain(C.lowInvalid);
    expect(html).toContain('aria-invalid="true"');
    expect(html).not.toContain("<table");
  });
});

describe("the region and CTA contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="fibonacci-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="fibonacci-ket-qua"');
    expect(html).toContain('aria-controls="fibonacci-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("keeps the price inputs and the trend fork in ONE group", async () => {
    // Row 44: "giữ đỉnh/đáy/xu hướng thành một nhóm".
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!.split("<fieldset").length - 1).toBe(2); // the group + the radio
    expect(form!).toContain(C.group);
    expect(form!).toContain(C.directionLegend);
  });
});
