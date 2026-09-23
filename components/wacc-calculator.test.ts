/**
 * Rendered-markup contracts for /cong-cu/wacc/ — CSV row 41.
 *
 * WHAT THIS FILE CAN ESTABLISH: the region contract, the CTA wiring, that
 * WACC is the one headline, that the three capital sources are separate input
 * groups, and that the per-source components are a real `<table>` inside a
 * closed disclosure rather than nine rows in the answer.
 *
 * WHAT IT CANNOT: anything about appearance, and nothing about whether the
 * disclosure is operable with a keyboard — it is a native `<details>`, which
 * is the reason to use one, but that is a browser behaviour.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { WACC } from "@/content/calculators/wacc";

const CONTENT = "@/content/calculators/wacc";

type FormPatch = Partial<Record<keyof typeof WACC.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/wacc")>(
          CONTENT,
        );
      return {
        WACC: { ...actual.WACC, form: { ...actual.WACC.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/wacc-calculator");
    return renderToStaticMarkup(createElement(loaded.WaccCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = WACC.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("WACC is the answer", () => {
  it("computes 70/30 with the shield on debt alone", async () => {
    // 700 tỷ at 14%, 300 tỷ at 9%, tax 20%.
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("11,960%"); // WACC
    expect(live).toContain("7,200%"); // 9% × (1 − 0,20)
    expect(live).toContain("0,540 điểm %"); // what the shield is worth
  });

  it("gives the headline to WACC and to nothing else", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live.split(HEADLINE).length - 1).toBe(1);
    expect(live.slice(0, live.indexOf(HEADLINE))).toContain(C.waccLabel);
  });

  it("keeps the nine component figures out of the answer region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("<table");
    expect(live).not.toContain(C.totalCapitalLabel);
    expect(live).not.toContain(C.beforeShieldLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("says so when there is no capital structure at all", async () => {
    const html = await render({
      defaultEquityValue: "0",
      defaultDebtValue: "0",
    });
    expect(html).toContain(C.noCapitalNotice);
    // A zero total is not a bad field: every box holds a legal number.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain("11,960%");
  });
});

describe("the components are an expandable table", () => {
  it("renders a closed disclosure holding a real table", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("<details");
    expect(detail).not.toContain("<details open");
    expect(detail).toContain(C.componentsTitle);
    expect(detail).toContain("<table");
    expect(detail).toContain(C.componentsTable.caption);
  });

  it("names each source once, as a row", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    for (const column of [
      C.componentsTable.sourceColumn,
      C.componentsTable.weightColumn,
      C.componentsTable.costColumn,
      C.componentsTable.contributionColumn,
    ]) {
      expect(detail).toContain(column);
    }
    expect(detail).toContain("70,00%"); // equity weight
    expect(detail).toContain("30,00%"); // debt weight
    expect(detail).toContain("9,800"); // equity's contribution, in points
    expect(detail).toContain("2,160"); // debt's contribution, in points
  });

  it("shows the SHIELDED cost on the debt row and the raw cost elsewhere", async () => {
    // The single error this page exists to prevent is applying (1 − tax) to
    // every source, so the table must not print 14% × 0,8 for equity.
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain("14,000%"); // equity, undeducted
    expect(detail).toContain("7,200%"); // debt, deducted
    expect(detail).not.toContain("11,200%"); // 14% × 0,8 — must not appear
  });

  it("keeps the un-shielded WACC available for comparison", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(C.beforeShieldLabel);
    expect(detail).toContain("12,500%");
    expect(detail).not.toContain('data-results-live="true"');
  });
});

describe("the region and CTA contract", () => {
  it("groups the three capital sources in the form region", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form).toContain(C.equityGroup);
    expect(form).toContain(C.debtGroup);
    expect(form).toContain(C.preferredGroup);
    expect(form.split("<fieldset").length - 1).toBe(3);
  });

  it("keeps the tax rate with the only source it applies to", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    expect(form.indexOf(C.taxLabel)).toBeGreaterThan(form.indexOf(C.debtGroup));
    expect(form.indexOf(C.taxLabel)).toBeLessThan(
      form.indexOf(C.preferredGroup),
    );
  });

  it("emits both regions and points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="wacc-nhap" data-calc-region="form"');
    expect(html).toContain('id="wacc-ket-qua"');
    expect(html).toContain('aria-controls="wacc-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    // CORRECTED to the approved long-form layout — see the twin assertion in
    // `components/irr-npv-calculator.test.ts`. The single-column exception was
    // an implementation preference, not an approved change to the global 40/60
    // requirement for a grouped long form beside its result.
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("lg:col-span-2");
    // The three-by-three cost table stays full width below both columns.
    expect(html).toContain("lg:col-span-5");
  });

  it("still bounds the tax rate", async () => {
    const html = await render({ defaultTax: "120" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(C.taxInvalid);
  });
});
