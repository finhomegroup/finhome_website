/**
 * Rendered-markup contracts for /cong-cu/tinh-tien-tip/ — audit row 71,
 * "Ưu tiên số mỗi người trả; một khối gọn, phí dịch vụ/VAT/tip tách nhãn rõ."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the per-person figure is the single
 * emphasised answer, that the three surcharges keep three distinct labels
 * rather than being summed into one "phụ thu", that the long breakdown moved
 * into the detail region WITHOUT becoming a second announced region, and that
 * the field contracts the component documents are the ones it enforces — VAT
 * bounded at 100 because it is statutory, service and tip unbounded because
 * they are the payer's own money, people a whole count.
 *
 * WHAT IT CANNOT: appearance, and whether the rounding select is discoverable.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { TIP } from "@/content/calculators/tip";

const CONTENT = "@/content/calculators/tip";

type FormPatch = Partial<Record<keyof typeof TIP.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/tip")>(
          CONTENT,
        );
      return {
        TIP: { ...actual.TIP, form: { ...actual.TIP.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/tip-calculator");
    return renderToStaticMarkup(createElement(loaded.TipCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = TIP.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the per-person figure is the answer", () => {
  it("keeps the pre-implementation default figures", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // Baseline: 290.000 ₫ mỗi người, 1.160.000 ₫ cả bàn. 1.000.000 ₫ món ăn
    // + 5% phục vụ + 8% VAT, chia 4, làm tròn lên 10.000.
    expect(live!).toContain("290.000 ₫");
    expect(live!).toContain("1.160.000 ₫");
  });

  it("emphasises exactly one row, the per-person one", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.perPersonRoundedLabel,
    );
  });

  it("announces two rows, not nine", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.perPersonRoundedLabel);
    expect(live!).toContain(C.totalPaidLabel);
    // The breakdown is not in the announced region.
    expect(live!).not.toContain(C.roundingExtraLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the three surcharges stay three labelled rows", () => {
  it("keeps service, VAT and tip separate in the breakdown", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.breakdownTitle);
    for (const label of [
      C.serviceResultLabel,
      C.taxResultLabel,
      C.tipResultLabel,
      C.totalLabel,
      C.perPersonLabel,
      C.roundingExtraLabel,
      C.extraPercentLabel,
    ]) {
      expect(detail!, `breakdown lost "${label}"`).toContain(label);
    }
    // 5% of 1.000.000 is 50.000; 8% VAT on 1.050.000 is 84.000; tip 0.
    expect(detail!).toContain("50.000 ₫");
    expect(detail!).toContain("84.000 ₫");
  });

  it("shows a zero tip as zero, not as a missing row", async () => {
    // The default tip IS 0 — tipping is not customary here, and the module
    // header says so. A zero is a real answer.
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    const at = detail!.indexOf(C.tipResultLabel);
    expect(detail!.slice(at, at + 400)).toContain("0 ₫");
  });
});

describe("the block stayed compact", () => {
  it("emits one column, no chart, and the CTA points at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="tinh-tien-tip-nhap" data-calc-region="form"');
    expect(html).not.toContain("lg:grid-cols-5");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("fh-cta-pin");
    expect(html).toContain('id="tinh-tien-tip-ket-qua"');
    expect(html).toContain('aria-controls="tinh-tien-tip-ket-qua"');
  });
});

describe("the field contracts the component documents", () => {
  it("refuses a VAT above 100, which nobody can be invoiced", async () => {
    const html = await render({ defaultTax: "500" });
    expect(html).toContain(C.taxInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
  });

  it("accepts a 150% tip, which is the payer's own choice", async () => {
    const html = await render({ defaultTip: "150" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("₫");
  });

  it("accepts a 200% service charge for the same reason", async () => {
    const html = await render({ defaultService: "200" });
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("refuses a fractional headcount", async () => {
    const html = await render({ defaultPeople: "2,5" });
    expect(html).toContain(C.peopleInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("refuses a zero bill, and blames only the bill", async () => {
    const html = await render({ defaultBill: "0" });
    expect(html).toContain(C.billInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("accepts a zero VAT and a zero service charge", async () => {
    // A street-food bill has neither, and a valid zero is not an error.
    const html = await render({ defaultTax: "0", defaultService: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    // 1.000.000 ₫ split four ways, rounded up to 10.000: 250.000 each.
    expect(live!).toContain("250.000 ₫");
  });

  it("keeps the breakdown rows blank rather than invented when a field is unusable", async () => {
    const html = await render({ defaultPeople: "0" });
    const detail = markupRegion(html, 'data-calc-region="detail"');
    // The region and its labels remain — the figures do not.
    expect(detail!).toContain(C.breakdownTitle);
    expect(detail!).not.toContain("₫");
  });
});
