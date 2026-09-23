/**
 * Rendered-markup contracts for `/cong-cu/tiet-kiem-thue-vay-mua-nha/` — row 13.
 *
 * WHAT THE ROW ASKED FOR: "Giữ nhãn Hoa Kỳ trước form; nhấn số thuế thực sự
 * tiết kiệm; nhóm trần nợ gốc và cách khấu trừ vào disclosure." Before this
 * pass the route had no `CalculatorLayout`, no CTA and no emphasised answer,
 * the cap and the ladder were one nine-row "Chi tiết" table, and the regime
 * notices that say what the saving MEANS sat after that table.
 *
 * WHAT MUST NOT CHANGE, and is asserted here: `computeUsMortgageDeduction` is
 * untouched, USD keeps cents, and the two-decimal share is still two decimals.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_MORTGAGE_DEDUCTION } from "@/content/calculators/us-mortgage-deduction";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { computeUsMortgageDeduction } from "@/lib/calc/us-mortgage-deduction";

const CONTENT_PATH = "@/content/calculators/us-mortgage-deduction";

const FORM_ID = "tiet-kiem-thue-vay-mua-nha-nhap";
const RESULT_ID = "tiet-kiem-thue-vay-mua-nha-ket-qua";

const F = US_MORTGAGE_DEDUCTION.form;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(
  defaults?: Partial<Record<keyof typeof F.defaults, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_MORTGAGE_DEDUCTION: typeof US_MORTGAGE_DEDUCTION;
      };
      return {
        US_MORTGAGE_DEDUCTION: {
          ...actual.US_MORTGAGE_DEDUCTION,
          form: {
            ...actual.US_MORTGAGE_DEDUCTION.form,
            defaults: {
              ...actual.US_MORTGAGE_DEDUCTION.form.defaults,
              ...defaults,
            },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/us-mortgage-deduction-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.UsMortgageDeductionCalculator),
    );
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

describe("row 13 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the two-column split the row asked for", async () => {
    // "Hai cột": seven controls in two groups are long enough that the answer
    // belongs beside them rather than under them at wide widths.
    const html = await render();
    expect(html).toContain("lg:col-span-2");
    expect(html).toContain("lg:grid-cols-5");
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

  it("pins a short current answer, this form being a long one", async () => {
    // CORRECTED. The refusal this replaced argued that `.fh-cta-pin`'s
    // ≥1024×900 gate is where the split already keeps the answer beside the
    // form; `lg:items-start` holds the result column at the top of the grid,
    // so it does not. The measured precedent and the shelf-wide pinned /
    // unpinned table are in `components/u-long-form-cta.test.ts`.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("emphasises the tax actually saved, and only that", async () => {
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    // Scoped to the RESULT region, because the pinned CTA restates the same
    // answer earlier in the document, inside the form region. Before the pin
    // existed a document-wide `indexOf` meant the same thing; now it would
    // find the restatement and prove nothing about the row order.
    const result = html.slice(html.indexOf('data-calc-region="result"'));
    // The naive figure is the page's foil, so it must not be the emphasised
    // one: 480,00 USD is the answer, 5.760,00 USD is the mistake.
    expect(result.indexOf("480,00 USD")).toBeGreaterThan(
      result.indexOf("md:text-3xl"),
    );
    expect(result.indexOf("480,00 USD")).toBeLessThan(
      result.indexOf("5.760,00 USD"),
    );
  });

  it("keeps the figures and their precision", async () => {
    const html = await render();
    expect(html).toContain("480,00 USD");
    expect(html).toContain("2,00%");
    expect(html).toContain("5,88%");
    expect(html).toContain("5.760,00 USD");
    expect(html).toContain("5.280,00 USD");
  });
});

describe("the cap and the ladder are disclosed, not tabled", () => {
  it("puts both groups inside one disclosure in the detail region", async () => {
    const html = await render();
    const detail = html.slice(html.indexOf('data-calc-region="detail"'));
    expect(detail).toContain("<details");
    expect(detail).toContain(F.mechanicsDisclosureTitle);
    expect(detail).toContain(F.capTitle);
    expect(detail).toContain(F.stepsTitle);
    // The statutory cap is still shown, at its own grammar (no cents).
    expect(detail).toContain("750.000 USD");
    expect(detail).toContain("2.000,00 USD");
    // And the nine-row undifferentiated table is gone.
    expect(detail.indexOf(F.capTitle)).toBeLessThan(
      detail.indexOf(F.stepsTitle),
    );
  });

  it("explains a capped balance beside the rows that show it", async () => {
    const html = await render({ balance: "1.000.000" });
    expect(html).toContain("75,00%");
    expect(html).toContain("6.000,00 USD");
    expect(html).toContain(F.capNotice);
    // Inside the disclosure, with the cap — not after the page.
    expect(html.indexOf(F.capNotice)).toBeGreaterThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });

  it("keeps the cap note away from a balance under the cap", async () => {
    expect(await render()).not.toContain(F.capNotice);
  });
});

describe("which regime the reader is in is named beside the saving", () => {
  it("names the tipping case on the shipped numbers", async () => {
    const html = await render();
    expect(html).toContain(F.tipsIntoItemizingNotice);
    expect(html).not.toContain(F.noBenefitNotice);
    expect(html).not.toContain(F.fullBenefitNotice);
    // Above the comparison group, so it qualifies the answer rather than the
    // foil.
    expect(html.indexOf(F.tipsIntoItemizingNotice)).toBeLessThan(
      html.indexOf(F.comparisonTitle),
    );
  });

  it("names the majority case, where the loan saves nothing", async () => {
    const html = await render({ interest: "1.000" });
    expect(html).toContain(F.noBenefitNotice);
    expect(html).not.toContain(F.tipsIntoItemizingNotice);
    expect(html).toContain("0,00 USD");
  });

  it("names the one case where the common method is right", async () => {
    const html = await render({ otherItemized: "40.000" });
    expect(html).toContain(F.fullBenefitNotice);
    expect(html).not.toContain(F.tipsIntoItemizingNotice);
    // Saving and naive saving coincide here, and the overstatement is zero.
    expect(html).toContain("5.760,00 USD");
    expect(html).toContain("24,00%");
  });
});

describe("unavailable supporting rows are explained by their own cause", () => {
  it("explains the missing share when no interest was paid", async () => {
    const r = computeUsMortgageDeduction({
      loanBalance: 400000,
      annualInterest: 0,
      vintage: "current",
      filingStatus: "jointOrOther",
      otherItemized: 8000,
      standardDeduction: 30000,
      marginalRatePercent: 24,
    });
    // Zero interest is a VALID case, so the engine must return a result with
    // a null share inside it — not refuse the whole input.
    if (r === null) throw new Error("the engine refused a valid zero");
    expect(r.savingAsPercentOfInterest).toBeNull();
    expect(r.effectiveRatePercent).toBe(0);

    const html = await render({ interest: "0" });
    // A valid zero: nothing is flagged.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain(F.noInterestNotice);
    // The rate row still has an answer here, so its note must stay away.
    expect(html).not.toContain(F.noBalanceNotice);
  });

  it("explains the missing rate when there is no balance", async () => {
    const html = await render({ balance: "0", interest: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain(F.noBalanceNotice);
    expect(html).toContain(F.noInterestNotice);
  });

  it("keeps both notes away from an ordinary loan", async () => {
    const html = await render();
    expect(html).not.toContain(F.noInterestNotice);
    expect(html).not.toContain(F.noBalanceNotice);
  });

  it("flags interest on a zero balance, which is a data-entry error", async () => {
    // Distinct from the valid zero above: interest cannot exist without a
    // balance, and the field the reader needs marked is the interest one.
    const html = await render({ balance: "0" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain("480,00 USD");
  });
});
