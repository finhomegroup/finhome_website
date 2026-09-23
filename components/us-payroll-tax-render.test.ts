/**
 * Rendered-markup contracts for `/cong-cu/thue-luong-hoa-ky/` — plan row 76.
 *
 * WHAT THE ROW ASKED FOR: "Giữ nhãn Hoa Kỳ; làm rõ người lao động/chủ lao
 * động/tự làm chủ, kết quả tách theo vai trò." Before this pass the employer
 * share and the combined total were rows 7 and 8 of an eleven-row breakdown
 * table, so who pays what was only readable by counting rows, and the route
 * had no `CalculatorLayout`, no CTA, no emphasised answer and three notices
 * stacked after the long table.
 *
 * WHAT MUST NOT CHANGE, and is asserted here rather than trusted: the figures.
 * `computeUsPayroll` is untouched, USD still carries cents, and the statutory
 * wage base and surtax threshold are still shown. The default case is
 * 100.000 USD / độc thân / 2026 → 7.650,00 USD and 7,65%, which is the figure
 * the content module's header comment records.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_PAYROLL_TAX } from "@/content/calculators/us-payroll-tax";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { computeUsPayroll } from "@/lib/calc/us-payroll";

const CONTENT_PATH = "@/content/calculators/us-payroll-tax";

const FORM_ID = "thue-luong-hoa-ky-nhap";
const RESULT_ID = "thue-luong-hoa-ky-ket-qua";

const F = US_PAYROLL_TAX.form;

/**
 * Render the calculator on patched defaults.
 *
 * Same lever as `components/percent-render.test.ts`: the component reads its
 * opening values from the content module, so replacing `form.defaults` is how
 * a static render reaches a state other than the shipped one. There is no
 * jsdom in this runner, so typing is not available and this is not a
 * simulation of interaction — it is the same component on a different opening
 * state.
 */
async function render(
  // Not `Partial<typeof F.defaults>`: the content module is `as const`, so
  // that type would only accept the shipped literals back again.
  defaults?: Partial<Record<keyof typeof F.defaults, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_PAYROLL_TAX: typeof US_PAYROLL_TAX;
      };
      return {
        US_PAYROLL_TAX: {
          ...actual.US_PAYROLL_TAX,
          form: {
            ...actual.US_PAYROLL_TAX.form,
            defaults: { ...actual.US_PAYROLL_TAX.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/us-payroll-tax-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.UsPayrollTaxCalculator),
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

describe("row 76 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    // The eleven-row breakdown is the detail region: it is a reference table,
    // not the answer, and it is what used to sit between the answer and the
    // notices that explain it.
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("stays a compact single column", async () => {
    // "Gọn" in the audit's own classification. Four controls split 40/60 is
    // two stub columns.
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
    // Four controls, well under the six of the only form on this shelf whose
    // height has actually been measured; the shelf-wide pinned / unpinned
    // table and that measurement are in `components/u-long-form-cta.test.ts`.
    // This form's own height has NOT been measured, so the claim here is the
    // precedent, not a pixel.
    const html = await render();
    expect(html).not.toContain("fh-cta-pin");
    expect(html).not.toContain('data-calc-answer="true"');
  });

  it("emphasises exactly one figure, and keeps one live region", async () => {
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });
});

describe("the result is split by role", () => {
  it("gives the three roles their own group above the breakdown", async () => {
    const html = await render();
    const roleAt = html.indexOf(F.roleGroupTitle);
    expect(roleAt).toBeGreaterThan(-1);
    expect(html.indexOf(F.employeeRoleLabel)).toBeGreaterThan(roleAt);
    expect(html.indexOf(F.employerLabel)).toBeGreaterThan(roleAt);
    expect(html.indexOf(F.combinedLabel)).toBeGreaterThan(roleAt);
    // Above the eleven-row table, not buried in it.
    expect(roleAt).toBeLessThan(html.indexOf(F.breakdownTitle));
  });

  it("renames the payer and explains the zero when self-employed", async () => {
    const html = await render({ employment: "selfEmployed" });
    expect(html).toContain(F.selfEmployedResultTitle);
    expect(html).toContain(F.selfEmployedRoleLabel);
    expect(html).not.toContain(F.employeeRoleLabel);
    // `computeUsPayroll` returns employerTotal 0 for a self-employed filer
    // because both halves are already in the figure above. A bare "0,00 USD"
    // beside "Phần người sử dụng lao động trả" reads as a bug without this.
    expect(html).toContain("0,00 USD");
    expect(html).toContain(F.employerNoneNotice);
    // The 92,35% base and the un-modelled half-of-SE-tax deduction are model
    // limits, so they stay visible rather than moving into a disclosure.
    expect(html).toContain(F.selfEmployedNotice);
  });

  it("shows no employer explanation for an employee", async () => {
    const html = await render();
    expect(html).not.toContain(F.employerNoneNotice);
    expect(html).not.toContain(F.selfEmployedNotice);
  });
});

/**
 * THE RATE IN A BREAKDOWN LABEL NAMES THE AMOUNT BESIDE IT.
 *
 * An independent review read the `Tự làm chủ` mode on the 10:16:38.280Z export
 * at the shipped defaults (100.000 USD, 2026, single). The figures were right —
 * base 92.350, total 14.129,55, employer 0 — and the two breakdown labels still
 * said "Social Security (6,2%)" and "Medicare (1,45%)" beside 11.451,40 and
 * 2.678,15 USD, which are both halves at 12,4% and 2,9%. A reader checking the
 * tool the way its own source list invites (Schedule SE lines 10 and 11) found
 * the label and the arithmetic disagreeing.
 *
 * This is a LABEL fix only: the assertions below pin the amounts from
 * `computeUsPayroll` as well, so a future change to the rates or the base
 * fails here rather than being papered over by the new wording.
 */
describe("the breakdown's rates name the mode's own halves", () => {
  /** The shipped default state, self-employed. */
  const selfEmployedResult = computeUsPayroll({
    wages: 100_000,
    filingStatus: "single",
    year: 2026,
    selfEmployed: true,
  });

  it("is both halves in the engine, which is what the labels must say", () => {
    // The premise, asserted rather than assumed. 92,35% of 100.000 is the
    // base; 12,4% and 2,9% of it are the two amounts the review read.
    expect(selfEmployedResult?.taxBase).toBeCloseTo(92_350, 2);
    expect(selfEmployedResult?.socialSecurityTax).toBeCloseTo(
      92_350 * 0.124,
      2,
    );
    expect(selfEmployedResult?.medicareTax).toBeCloseTo(92_350 * 0.029, 2);
  });

  it("names 12,4% and 2,9% in the self-employed mode", async () => {
    const html = await render({ employment: "selfEmployed" });
    expect(html).toContain(F.selfEmployedSocialSecurityLabel);
    expect(html).toContain(F.selfEmployedMedicareLabel);
    // And the employee-mode labels are GONE from this mode, which is the half
    // of the fix a "contains" assertion alone would miss.
    expect(html).not.toContain(F.socialSecurityLabel);
    expect(html).not.toContain(F.medicareLabel);
    // The amounts are untouched.
    expect(html).toContain("11.451,40 USD");
    expect(html).toContain("2.678,15 USD");
    expect(html).toContain("14.129,55 USD");
    // The 0,9% surcharge is NOT doubled, so its label does not change.
    expect(html).toContain(F.additionalLabel);
  });

  it("keeps 6,2% and 1,45% in the employee mode", async () => {
    const html = await render();
    expect(html).toContain(F.socialSecurityLabel);
    expect(html).toContain(F.medicareLabel);
    expect(html).not.toContain(F.selfEmployedSocialSecurityLabel);
    expect(html).not.toContain(F.selfEmployedMedicareLabel);
    expect(html).toContain("6.200,00 USD");
    expect(html).toContain("1.450,00 USD");
  });
});

describe("unavailable and boundary states are explained where they appear", () => {
  it("explains the effective-rate dash at a wage of 0", async () => {
    // A wage of 0 is a VALID entry: the field must not be flagged, the
    // marginal rate still computes, and only the effective rate is missing.
    expect(computeUsPayroll({
      wages: 0,
      filingStatus: "single",
      year: 2026,
      selfEmployed: false,
    })?.effectiveRatePercent).toBeNull();

    const html = await render({ wages: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain("—");
    expect(html).toContain(F.zeroWageNotice);
    // Still 7,65% on the next dollar earned.
    expect(html).toContain("7,65%");
  });

  it("explains the falling marginal rate above the wage base", async () => {
    // 300.000 USD, single, 2026: SS capped at 184.500 → 11.439, Medicare
    // 4.350, surtax 0,9% on 100.000 → 900, total 16.689 and 5,56%.
    const html = await render({ wages: "300.000" });
    expect(html).toContain("16.689,00 USD");
    expect(html).toContain("5,56%");
    expect(html).toContain(F.aboveBaseNotice);
  });

  it("keeps that explanation away from a wage below the base", async () => {
    const html = await render();
    expect(html).toContain("7.650,00 USD");
    expect(html).toContain("7,65%");
    expect(html).not.toContain(F.aboveBaseNotice);
  });

  it("withholds every figure on an unusable wage, and says why", async () => {
    const html = await render({ wages: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain("7.650,00 USD");
    // The statutory reference ROWS go with it — a wage base shown beside a
    // row of dashes invites reading it as this reader's answer. Scoped to the
    // result and detail regions on purpose: the same 184.500 USD is still in
    // the year field's help text, where it is the reader's way to check the
    // select, and it must NOT disappear with the answer.
    expect(html).toContain("184.500 USD cho năm 2026");
    expect(html.slice(html.indexOf('data-calc-region="result"'))).not.toContain(
      "184.500 USD",
    );
  });

  it("keeps the statutory figures and the cents on a valid wage", async () => {
    const html = await render();
    expect(html).toContain("184.500 USD");
    expect(html).toContain("200.000 USD");
    // Cents, not rounded đồng grammar: USD is the one currency in the suite
    // that carries them.
    expect(html).toContain("6.200,00 USD");
    expect(html).toContain("1.450,00 USD");
  });
});
