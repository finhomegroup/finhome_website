/**
 * Rendered-markup contracts for /cong-cu/thue-mua-xe/ — audit row 34, "Đưa
 * khoản trả hàng tháng lên trước đoạn thuế dài; giữ cảnh báo loại thuế áp
 * dụng nhưng mở thêm chi tiết."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the monthly payment is the emphasised,
 * announced answer in its own region; that the ~1.100-character VAT passage is
 * still on the page WORD FOR WORD but collapsed, with the short
 * which-contract-applies warning left on the field; that the nine explanatory
 * rows moved to the full-width detail band unannounced; and that the two
 * engine refusals now speak for themselves instead of one speaking for both.
 *
 * THE ARITHMETIC IS `lib/calc/auto-lease.test.ts`'s. The figures pinned below
 * are the shipped defaults' own output, repeated here as the
 * pre-implementation runtime baseline for this route.
 *
 * WHAT IT CANNOT: appearance. Whether the payment is visibly "trước đoạn thuế
 * dài" at a stated viewport is Codex's review, not this file's claim — static
 * markup can only show that the passage is behind a closed `<details>` and
 * that the desktop split exists.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { AUTO_LEASE } from "@/content/calculators/auto-lease";

const CONTENT = "@/content/calculators/auto-lease";

type FormPatch = Partial<Record<keyof typeof AUTO_LEASE.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/auto-lease")
      >(CONTENT);
      return {
        AUTO_LEASE: {
          ...actual.AUTO_LEASE,
          form: { ...actual.AUTO_LEASE.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/auto-lease-calculator");
    return renderToStaticMarkup(createElement(loaded.AutoLeaseCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = AUTO_LEASE.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the monthly payment is the answer", () => {
  it("emphasises the payment and keeps its two halves beside it", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.monthlyLabel);
    // 800 triệu, trả trước 100 triệu, còn lại 440 triệu, 36 tháng, 9%/năm,
    // thuế suất 0: khấu hao 7.222.222 ₫ + phí tài chính 4.275.000 ₫.
    expect(live!).toContain("11.497.222 ₫");
    expect(live!).toContain("7.222.222 ₫");
    expect(live!).toContain("4.275.000 ₫");
  });

  it("gives the payment group the anchor the CTA points at", async () => {
    const html = await render();
    // `ResultGroup` renders its `h2` OUTSIDE the live div, so the title is
    // checked against the result column and the group by its anchor.
    const result = markupRegion(html, 'data-calc-region="result"');
    expect(result!).toContain(C.resultTitle);
    expect(html).toContain('id="thue-mua-xe-ket-qua"');
    expect(html).toContain('id="thue-mua-xe-ket-qua-title"');
    expect(html).toContain('aria-controls="thue-mua-xe-ket-qua"');
    expect(html).toContain('data-calc-cta="true"');
    // A "Hai cột" row.
    expect(html).toContain("lg:grid-cols-5");
    // One announcement, which is what `check:markup` enforces per page.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the compact current answer", () => {
  it("pins the payment beside the form, once, and nothing else", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).toContain("fh-cta-pin");
    expect(html).toContain('aria-hidden="true" data-calc-answer="true"');
    expect(html.split('data-calc-answer="true"').length - 1).toBe(1);
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
    expect(pinned.slice(0, 400)).toContain(C.monthlyLabel);
    // Same formatted string as the announced row — one rounding.
    expect(pinned.slice(0, 400)).toContain("11.497.222 ₫");
    // A restatement, not a second announcement.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(form!).not.toContain(C.depreciationLabel);
  });

  it("shows the placeholder rather than a stale figure when refused", async () => {
    const html = await render({ defaultDown: "800.000.000" });
    const pinned = html.slice(html.indexOf('data-calc-answer="true"'));
    expect(pinned.slice(0, 400)).not.toContain("₫");
  });
});

describe("the long tax passage", () => {
  it("keeps every word of it, in a collapsed disclosure under the field", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    // VERBATIM. This is the assertion that makes the repair a move rather
    // than a deletion of tax law.
    expect(form!).toContain(C.taxHelp);
    expect(form!).toContain(C.taxDetailTitle);
    // Collapsed: this component has no `AdvancedFields`, so a single
    // `<details` with no `open` is the passage's own disclosure.
    expect(form!).toContain("<details");
    expect(html).not.toContain("<details open");
    // It sits after the tax field it belongs to, not above the form.
    expect(form!.indexOf(C.taxLabel)).toBeLessThan(
      form!.indexOf(C.taxDetailTitle),
    );
  });

  it("leaves the which-contract warning open on the field itself", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).toContain(C.taxHelpShort);
    // The kept warning is the one that changes what the reader types.
    expect(C.taxHelpShort).toContain("không chịu thuế GTGT");
    expect(C.taxHelpShort).toContain("cho thuê tài sản thông thường");
    // And it is genuinely short — the defect was 1.100 characters of law
    // standing between the last input and the answer.
    expect(C.taxHelpShort.length).toBeLessThan(400);
    expect(C.taxHelp.length).toBeGreaterThan(900);
  });

  it("still applies a typed rate, with the tax row in the detail band", async () => {
    // The guard the content suite states in engine terms, in markup terms:
    // a taxable ordinary lease types 8 and the payment moves.
    const html = await render({ defaultTax: "8" });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("12.417.000 ₫");
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail!).toContain(C.taxResultLabel);
    expect(detail!).toContain("919.778 ₫");
  });
});

describe("the nine explanatory rows became detail", () => {
  it("keeps them all, unannounced, full width below", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    expect(detail!).toContain(C.detailTitle);
    for (const label of [
      C.beforeTaxLabel,
      C.taxResultLabel,
      C.capitalisedLabel,
      C.moneyFactorLabel,
      C.residualPercentLabel,
      C.totalDepreciationLabel,
      C.totalFinanceLabel,
      C.totalPaymentsLabel,
      C.totalCostLabel,
    ]) {
      expect(detail!, `detail lost "${label}"`).toContain(label);
    }
    // Số tiền vốn hóa 700.000.000 ₫, tổng khấu hao 260.000.000 ₫, tổng phí
    // tài chính 153.900.000 ₫, tổng các khoản trả 413.900.000 ₫, tổng chi phí
    // 513.900.000 ₫.
    expect(detail!).toContain("700.000.000 ₫");
    expect(detail!).toContain("260.000.000 ₫");
    expect(detail!).toContain("153.900.000 ₫");
    expect(detail!).toContain("413.900.000 ₫");
    expect(detail!).toContain("513.900.000 ₫");
    // The announced group is not a copy of this one.
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain(C.capitalisedLabel);
    expect(live!).not.toContain(C.totalCostLabel);
  });
});

describe("the two refusals are told apart", () => {
  it("blames the trade-in and the deposit when nothing is capitalised", async () => {
    // Trả trước 800 triệu on a 800-triệu car: số tiền vốn hóa = 0, which the
    // engine rejects BEFORE it looks at the residual. The residual here is
    // the shipped 440 triệu — a sensible figure, and the notice that used to
    // fire sent the reader to change it.
    const html = await render({ defaultDown: "800.000.000" });
    expect(html).toContain(C.capitalisedNotPositiveNotice);
    expect(html).not.toContain(C.residualTooHighNotice);
    // No field is at fault, so nothing is marked invalid — and no figure is
    // fabricated in place of the refused answer.
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
    // The reason sits with the missing answer, above the detail band.
    expect(html.indexOf(C.capitalisedNotPositiveNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("still blames the residual when the vehicle would have to appreciate", async () => {
    const html = await render({ defaultResidual: "800.000.000" });
    expect(html).toContain(C.residualTooHighNotice);
    expect(html).not.toContain(C.capitalisedNotPositiveNotice);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain("₫");
  });

  it("keeps the field-level errors it already had", async () => {
    const html = await render({ defaultTax: "800" });
    expect(html).toContain(C.taxInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    // A field error is not an engine refusal: neither notice may claim it.
    expect(html).not.toContain(C.residualTooHighNotice);
    expect(html).not.toContain(C.capitalisedNotPositiveNotice);
  });
});
