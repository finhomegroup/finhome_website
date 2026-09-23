/**
 * Rendered-markup contracts for `/cong-cu/tin-phieu-kho-bac-hoa-ky/` — row 75.
 *
 * WHAT THE ROW ASKED FOR: "Giữ nhãn Hoa Kỳ; giá và lợi suất cạnh nhau; tách quy
 * ước niêm yết khỏi lợi suất thật; trạng thái chiết khấu không hợp lệ suy ra từ
 * định giá." Before this pass the route had no `CalculatorLayout`, no CTA and no
 * emphasised answer, and the understatement row sat in the same group as the
 * yields it is measured against — so a distance between two quoting conventions
 * read as a fifth kind of return.
 *
 * WHAT MUST NOT CHANGE, and is asserted here rather than trusted:
 * `computeUsTbill` is untouched, every yield keeps FOUR decimals, USD keeps
 * cents, and `discountInvalid` still comes from the module returning null
 * rather than from a range check in the component.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_TBILL } from "@/content/calculators/us-tbill";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { computeUsTbill } from "@/lib/calc/us-tbill";

const CONTENT_PATH = "@/content/calculators/us-tbill";

const FORM_ID = "tin-phieu-kho-bac-hoa-ky-nhap";
const RESULT_ID = "tin-phieu-kho-bac-hoa-ky-ket-qua";

const F = US_TBILL.form;

/** Same `vi.doMock` lever as the row 74 and row 76 render tests. */
async function render(
  defaults?: Partial<Record<keyof typeof F.defaults, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_TBILL: typeof US_TBILL;
      };
      return {
        US_TBILL: {
          ...actual.US_TBILL,
          form: {
            ...actual.US_TBILL.form,
            defaults: { ...actual.US_TBILL.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/us-tbill-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.UsTbillCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

describe("row 75 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    // The four-row yields table and the tax table are reference material, not
    // the answer, so they are the detail region.
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("stays a compact single column", async () => {
    expect(await render()).not.toContain("lg:col-span-2");
  });

  it("puts the CTA in the form region, naming the answer", async () => {
    const html = await render();
    const form = html.slice(
      html.indexOf(`id="${FORM_ID}"`),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
    expect(form).toContain(`aria-controls="${RESULT_ID}"`);
    expect(html).toContain(TOOL_SHELL.cta.autoNote);
  });

  it("does not pin a current-answer block", async () => {
    const html = await render();
    expect(html).not.toContain("fh-cta-pin");
    expect(html).not.toContain('data-calc-answer="true"');
  });

  it("emphasises exactly one figure, and keeps one live region", async () => {
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("puts the price, the discount and the annual yield adjacent", async () => {
    // 10.000 USD face, 5% quoted, 91 days.
    const html = await render();
    const result = html.slice(
      html.indexOf('data-calc-region="result"'),
      html.indexOf('data-calc-region="detail"'),
    );
    expect(result.indexOf(F.priceLabel)).toBeLessThan(
      result.indexOf(F.discountAmountLabel),
    );
    expect(result.indexOf(F.discountAmountLabel)).toBeLessThan(
      result.indexOf(F.investmentYieldLabel),
    );
    expect(html).toContain("9.873,61 USD");
    expect(html).toContain("126,39 USD");
    // Four decimals: the yields are compared against deposit rates, where the
    // fourth decimal is the whole point of the page.
    expect(html).toContain("5,1343%");
  });
});

describe("the quoting convention is separated from the real yield", () => {
  it("gives the understatement its own group, with the disclaimer beside it", async () => {
    const html = await render();
    const conventionAt = html.indexOf(F.quoteConventionTitle);
    expect(conventionAt).toBeGreaterThan(-1);
    expect(html.indexOf(F.understatementLabel)).toBeGreaterThan(conventionAt);
    expect(html).toContain("0,1343");
    // "This is not a yield" sits under the row, not after the tax table.
    const noteAt = html.indexOf(F.quoteConventionNote);
    expect(noteAt).toBeGreaterThan(html.indexOf(F.understatementLabel));
    expect(noteAt).toBeLessThan(html.indexOf('data-calc-region="detail"'));
    // And it is out of the group that holds the four comparable yields.
    expect(conventionAt).toBeLessThan(html.indexOf(F.yieldsTitle));
  });

  it("keeps the four yields and the tax table in the detail region", async () => {
    const html = await render();
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));
    expect(detail).toContain(F.yieldsTitle);
    expect(detail).toContain(F.taxTitle);
    expect(detail).toContain("5,1674%");
    expect(detail).toContain("5,2341%");
    expect(detail).toContain("30,33 USD");
    expect(detail).toContain("96,06 USD");
    expect(detail).toContain("3,9021%");
    expect(detail).toContain("5,4046%");
  });
});

describe("unavailable and boundary states are explained where they appear", () => {
  it("explains the one blank row a 100% state rate leaves", async () => {
    // A VALID entry: nothing is flagged, and exactly one row has no answer
    // because no taxable product can match a yield that keeps nothing.
    const r = computeUsTbill({
      faceValue: 10000,
      discountRatePercent: 5,
      daysToMaturity: 91,
      federalRatePercent: 24,
      stateRatePercent: 100,
    });
    expect(r).not.toBeNull();
    expect(r!.taxableEquivalentYieldPercent).toBeNull();

    const html = await render({ state: "100" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain(F.taxableEquivalentUnavailableNotice);
    // Every other figure still computes, which is what the notice claims.
    expect(html).toContain("9.873,61 USD");
    expect(html).toContain("5,1343%");
  });

  it("keeps that explanation away from an ordinary state rate", async () => {
    expect(await render()).not.toContain(
      F.taxableEquivalentUnavailableNotice,
    );
  });

  it("flags the semiannual caveat only beyond 182 days", async () => {
    const short = await render();
    expect(short).not.toContain(F.beyondShortBillNotice);

    const long = await render({ days: "364" });
    expect(long).toContain(F.beyondShortBillNotice);
    // Directly under the group whose row it qualifies.
    expect(long.indexOf(F.beyondShortBillNotice)).toBeGreaterThan(
      long.indexOf(F.bondEquivalentLabel),
    );
    expect(long.indexOf(F.beyondShortBillNotice)).toBeLessThan(
      long.indexOf(F.taxTitle),
    );
  });

  it("derives the discount-invalid state from the pricing, not a range", async () => {
    // 400% over 91 days prices the bill at or below zero, so the MODULE is the
    // judge. Nothing about "400" is out of range on its own.
    expect(
      computeUsTbill({
        faceValue: 10000,
        discountRatePercent: 400,
        daysToMaturity: 91,
        federalRatePercent: 24,
        stateRatePercent: 5,
      }),
    ).toBeNull();

    const html = await render({ discount: "400" });
    expect(html).toContain(F.discountInvalid);
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain("9.873,61 USD");
    // Only the discount field is flagged: the term is a legitimate 91 days and
    // the CTA must not send the reader to it.
    expect(count(html, 'aria-invalid="true"')).toBe(1);
  });

  it("withholds every figure on an unusable term, and says why", async () => {
    const html = await render({ days: "0" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).not.toContain("9.873,61 USD");
  });
});
