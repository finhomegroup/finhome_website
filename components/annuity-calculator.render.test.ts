/**
 * Rendered-markup contracts for /cong-cu/nien-kim/ — audit row 59, "Nhấn khoản
 * thực nhận sau thuế và phạm vi Hoa Kỳ; không để tỷ lệ chi trả bị hiểu thành
 * lợi suất bảo đảm", at "Hai cột".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the after-tax payment is the one
 * emphasised answer and the string the CTA pins, that the payout rate never
 * renders without its "not a yield, not a guarantee" line inside its own row,
 * that the United States/USD scope sits beside the figures, and that the three
 * study groups and the seven-column table moved to the full-width band.
 *
 * THE ARITHMETIC IS `lib/calc/annuity.test.ts`'s. The figures pinned here are
 * the ones `content/calculators/annuity.ts` already documents for the shipped
 * defaults (250.000 USD phí, 12 kỳ/năm, 20 năm, 4,5%, thuế 22%, báo giá
 * 1.500 USD), repeated as the runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance. Whether the split is usable at a stated width is
 * Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { ANNUITY } from "@/content/calculators/annuity";

const CONTENT = "@/content/calculators/annuity";
const F = ANNUITY.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

// `Record<…, string>`, not `Partial<typeof F.defaults>`: the content file is
// `as const`, so the derived type would only accept each key's SHIPPED value
// and reject every override this file exists to make.
type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/annuity")>(
          CONTENT,
        );
      return {
        ANNUITY: {
          ...actual.ANNUITY,
          form: {
            ...actual.ANNUITY.form,
            defaults: { ...actual.ANNUITY.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/annuity-calculator");
    return renderToStaticMarkup(createElement(loaded.AnnuityCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("the layout wiring", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="nien-kim-nhap" data-calc-region="form"');
    expect(html).toContain('id="nien-kim-ket-qua"');
    expect(html).toContain('aria-controls="nien-kim-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("keeps all three field groups in the form, in order", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    const order = [F.modeGroup, F.contractGroup, F.taxGroup].map((title) =>
      form!.indexOf(title),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("pins the same after-tax string the emphasised row renders", async () => {
    const html = await render();
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta).not.toBeNull();
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).toContain('aria-hidden="true"');
    expect(cta!).toContain(F.netLabel);
    expect(cta!).toContain("1.458,22 USD");
  });
});

describe("the after-tax payment is the answer", () => {
  it("emphasises it, and only it, at the head of the one live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(F.netLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("keeps the gross payment and the annual figure as support", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(rows(live)).toBe(4);
    expect(live).toContain("1.458,22 USD");
    expect(live).toContain("1.575,71 USD");
    expect(live).toContain("18.908,57 USD");
  });

  it("states the USD and United States scope beside the figures", async () => {
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.scopeLine);
    // The scope is context, not an announced answer.
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.scopeLine);
  });
});

describe("the payout rate cannot be read as a yield", () => {
  it("carries the note inside the payout rate's own row", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    const rateRow = live.slice(live.indexOf(F.payoutRateLabel));
    expect(rateRow).toContain("7,56%");
    expect(rateRow).toContain(F.payoutRateNote);
    // The slice starts INSIDE the last row's atomic node, so no further row
    // boundary may follow: the note did not become a fifth peer figure.
    expect(rows(rateRow)).toBe(0);
  });

  it("still renders the note when there is no rate to show", async () => {
    // A zero premium leaves `payoutRatePercent` null: the placeholder must not
    // arrive stripped of the warning either.
    const html = await render({ premium: "0" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain(F.payoutRateLabel);
    expect(live).toContain(F.payoutRateNote);
  });
});

describe("the long study is the full-width band", () => {
  it("moves all three groups and the seven-column table below", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    for (const title of [F.breakdownTitle, F.contractTitle, F.quoteTitle]) {
      expect(detail).toContain(title);
    }
    expect(detail).toContain(F.table.caption);
    expect(detail).toContain(F.table.intro);
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain(F.breakdownTitle);
    expect(live).not.toContain("<table");
  });

  it("keeps the exclusion breakdown and the signed quote comparison", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    // 1.041,67 USD of each payment is the reader's own principal returning.
    expect(detail).toContain("1.041,67 USD");
    expect(detail).toContain("117,49 USD");
    // The quote implies 3,92%, which is 75,71 USD a month worse.
    expect(detail).toContain("3,92%");
    expect(detail).toContain("−75,71 USD");
    expect(detail).toContain(F.quoteWorseNotice);
  });

  it("still withholds the comparison when no quote was entered", async () => {
    const html = await render({ quoted: "0" });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.noQuoteNotice);
    expect(detail).not.toContain(F.quoteWorseNotice);
    expect(detail).not.toContain(F.quoteBetterNotice);
  });
});

describe("the preserved mode-scoped refusals", () => {
  it("blames only the field the payment mode reads", async () => {
    const html = await render({ premium: "-1" });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(F.premiumLabel);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.invalidNotice);
  });

  it("solves for the premium in the other mode, and blames its own field", async () => {
    const usable = await render({ mode: "premium" });
    expect(usable).toContain(F.desiredPaymentLabel);
    expect(usable).not.toContain('aria-invalid="true"');
    // 2.000 USD a month needs a 317.316 USD premium.
    const detail = markupRegion(usable, 'data-calc-region="detail"')!;
    expect(detail).toContain("317.316 USD");

    const bad = await render({ mode: "premium", desiredPayment: "-1" });
    expect(bad.split('aria-invalid="true"').length - 1).toBe(1);
  });

  it("still bounds the term and the deferral", async () => {
    const tooLong = await render({ years: "71" });
    expect(tooLong).toContain(F.yearsInvalid);
    const tooFar = await render({ deferral: "51" });
    expect(tooFar).toContain(F.deferralInvalid);
  });
});
