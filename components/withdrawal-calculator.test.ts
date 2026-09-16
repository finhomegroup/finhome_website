/**
 * Rendered-markup contracts for /cong-cu/thu-nhap-dau-tu/ (original row 26).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents. It is the
 * right fidelity here because this page is prerendered at its defaults and
 * must hydrate byte-identically.
 *
 * WHAT THIS FILE EXISTS FOR. The convention clause under the perpetual figure
 * is chosen from the inflation SIGN, and it was unconditional before: the page
 * claimed the monthly-real convention is always lower than the exact
 * year-end-preserving amount, i.e. always conservative. An independent check
 * on 2 tỷ / lợi nhuận 8% / lạm phát −4% got 19.727.161,11 against
 * 19.302.090,33 — higher. The oracle is recomputed below from a closed form
 * with no production import, and then the RENDERED page is asserted to carry
 * the matching sentence. A defect in the clause selection lives in the
 * component, which is exactly the place docs §6 says three of this suite's
 * five worst defects lived.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WITHDRAWAL } from "@/content/calculators/withdrawal";

type Loose = Record<string, unknown>;

/**
 * Render the calculator, optionally overriding some of its FORM defaults.
 *
 * The content object is `as const`, so its values are literal types and a
 * `Partial<typeof WITHDRAWAL>` patch cannot hold a different default string.
 * The mock is therefore typed loosely — the same reason
 * `chart-render.test.ts` takes a generic there — and the overrides are
 * merged into `form` so every other default is inherited.
 */
async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/withdrawal";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        WITHDRAWAL: Loose;
      };
      const original = actual.WITHDRAWAL;
      return {
        WITHDRAWAL: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/withdrawal-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.WithdrawalCalculator));
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

/**
 * The exact amount that preserves real capital at each YEAR END, under this
 * page's own once-a-year step-up schedule: P × (G − H) / A(12), where
 * g = G^(1/12) and A(12) = (g^12 − 1)/(g − 1). Independent of the module.
 */
function exactYearEndPreserving(
  balance: number,
  returnPercent: number,
  inflationPercent: number,
): number {
  const G = 1 + returnPercent / 100;
  const H = 1 + inflationPercent / 100;
  const g = G ** (1 / 12);
  const a12 = (g ** 12 - 1) / (g - 1);
  return (balance * (G - H)) / a12;
}

/** What the page reports: the REAL return, converted to a monthly rate. */
function conventionFigure(
  balance: number,
  returnPercent: number,
  inflationPercent: number,
): number {
  const real = (1 + returnPercent / 100) / (1 + inflationPercent / 100) - 1;
  return balance * ((1 + real) ** (1 / 12) - 1);
}

const TWO_BILLION = "2.000.000.000";

describe("the convention clause follows the inflation sign", () => {
  it("is LOWER with rising prices, and says so", async () => {
    expect(conventionFigure(2e9, 8, 4)).toBeCloseTo(6_299_956.238245752, 4);
    expect(exactYearEndPreserving(2e9, 8, 4)).toBeCloseTo(
      6_434_030.110003466,
      4,
    );
    expect(conventionFigure(2e9, 8, 4)).toBeLessThan(
      exactYearEndPreserving(2e9, 8, 4),
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "4",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionLower);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionHigher);
  });

  it("COINCIDES at zero inflation, where the two are one quantity", async () => {
    expect(conventionFigure(2e9, 8, 0)).toBeCloseTo(
      exactYearEndPreserving(2e9, 8, 0),
      6,
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "0",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionEqual);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionLower);
  });

  it("is HIGHER with falling prices, so the page drops the safety claim", async () => {
    // The counterexample that made the old sentence a defect.
    expect(conventionFigure(2e9, 8, -4)).toBeCloseTo(19_727_161.1064234, 4);
    expect(exactYearEndPreserving(2e9, 8, -4)).toBeCloseTo(
      19_302_090.3300104,
      4,
    );
    expect(conventionFigure(2e9, 8, -4)).toBeGreaterThan(
      exactYearEndPreserving(2e9, 8, -4),
    );

    const html = await render({
      defaultBalance: TWO_BILLION,
      defaultInflation: "-4",
    });
    expect(html).toContain(WITHDRAWAL.form.perpetualConventionHigher);
    expect(html).not.toContain(WITHDRAWAL.form.perpetualConventionLower);
    // The no-guarantee sentence is not what was qualified; it stays.
    expect(html).toContain("KHÔNG phải mức rút được bảo đảm");
  });
});

describe("no unqualified perpetual promise on the page", () => {
  it("never states a draw that lasts forever", async () => {
    const html = await render();
    for (const phrase of ["duy trì mãi", "duy trì được mãi", "vĩnh viễn"]) {
      expect(html.includes(phrase), `page says "${phrase}"`).toBe(false);
    }
  });

  it("keeps the label's own qualification beside the figure", async () => {
    const html = await render();
    expect(html).toContain(WITHDRAWAL.form.perpetualLabel);
    expect(WITHDRAWAL.form.perpetualLabel).toContain("theo giả định của bạn");
  });

  it("explains a zero inflation entry as an assumption about PRICES", async () => {
    // Not as an acceptance of a falling income, which is what the field's
    // help used to say — the model's 0% is stable prices.
    const help = WITHDRAWAL.form.inflationHelp;
    expect(help).toContain("giá cả không đổi");
    expect(help).toContain("số âm");
    expect(help).not.toContain("chấp nhận thu nhập giảm");
    expect(await render()).toContain(help);
  });
});
