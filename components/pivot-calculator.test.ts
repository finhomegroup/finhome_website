/**
 * Rendered-markup contracts for /cong-cu/diem-pivot/ — CSV row 43.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that the
 * four-method comparison table moved to the detail region without losing a
 * method, that the pivot is the one headline, that no chart was added, and —
 * the state most at risk — that the OPTIONAL opening price still drops Woodie
 * silently instead of reading as an error.
 *
 * WHAT IT CANNOT: anything about appearance, including whether the eight-column
 * table's card fallback is legible at 390 px. That measurement is in docs §3.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { PIVOT } from "@/content/calculators/pivot";

const CONTENT = "@/content/calculators/pivot";

type FormPatch = Partial<Record<keyof typeof PIVOT.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/pivot")>(
          CONTENT,
        );
      return {
        PIVOT: { ...actual.PIVOT, form: { ...actual.PIVOT.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/pivot-calculator");
    return renderToStaticMarkup(createElement(loaded.PivotCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = PIVOT.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the pivot is the answer", () => {
  it("computes the classic pivot at the shipped defaults", async () => {
    // (52.000 + 48.000 + 51.000) / 3, a 4.000 range, the close 75% up it.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).toContain("50.333 ₫");
    expect(live!).toContain("4.000 ₫");
    expect(live!).toContain("75,0%");
  });

  it("gives the headline to the pivot and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.pivotLabel);
  });
});

describe("the methods stay a comparison table, and there is no chart", () => {
  it("puts all four methods in the detail region's table", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.table.caption);
    for (const name of Object.values(C.methodNames)) {
      expect(detail!, `table lost the ${name} method`).toContain(name);
    }
  });

  it("adds no figure to a tool the plan calls chartless", async () => {
    const html = await render();
    expect(html).not.toContain("<svg");
  });

  it("keeps the 32-cell table out of the single live region", async () => {
    const html = await render();
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("<table");
  });
});

describe("the opening price stays optional", () => {
  it("drops Woodie and says so, without marking any field invalid", async () => {
    const html = await render({ defaultOpen: "" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain(C.noOpenNotice);
    // Scoped to the TABLE: the field's own help text names Woodie too, and
    // asserting on the whole page would only be testing that sentence.
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.methodNames.classic);
    expect(detail!).not.toContain(C.methodNames.woodie);
    // The pivot itself does not depend on the opening price.
    expect(html).toContain("50.333 ₫");
  });

  it("explains the missing method beside the answer, not under the table", async () => {
    const html = await render({ defaultOpen: "" });
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).not.toContain(C.noOpenNotice);
    expect(html.indexOf(C.noOpenNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("still rejects a NON-EMPTY bad opening price", async () => {
    const html = await render({ defaultOpen: "0" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.openInvalid);
  });
});

describe("the region and CTA contract", () => {
  it("emits both regions, compact rather than split", async () => {
    const html = await render();
    expect(html).toContain('id="diem-pivot-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-region="result"');
    expect(html).not.toContain("lg:grid-cols-5");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="diem-pivot-ket-qua"');
    expect(html).toContain('aria-controls="diem-pivot-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
  });

  it("keeps both input groups inside the form region", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).toContain(C.sessionGroup);
    expect(form!).toContain(C.todayGroup);
    expect(form!).toContain('data-calc-cta="true"');
  });
});
