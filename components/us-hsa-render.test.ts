/**
 * Rendered-markup contracts for `/cong-cu/tai-khoan-tiet-kiem-y-te-hoa-ky/` —
 * plan row 30.
 *
 * WHAT THE ROW ASKED FOR: "Tách Điều kiện / Đóng góp / Dự phóng; giữ nhãn Hoa
 * Kỳ và giới hạn áp dụng gần con số thuế tiết kiệm." Before this pass the
 * route had no `CalculatorLayout`, no CTA and no emphasised answer; four
 * result groups and six notices were printed flat, and one "Trần góp" group
 * mixed the month-prorated ceiling with what the reader had actually
 * contributed.
 *
 * THE US LABEL IS NOT ASSERTED HERE. It comes from the registry's
 * `usRules: true` flag via `CalculatorPage`, which this test does not mount;
 * `content/calculators/registry.test.ts` owns that.
 *
 * WHAT MUST NOT CHANGE: `computeUsHsa` is untouched. Every figure below is
 * derived from the engine rather than transcribed, so a defaults change moves
 * the test with the page — and so that a formatter change cannot be hidden by
 * a stale literal. The statutory ceilings keep their no-cents grammar; the
 * computed USD amounts keep cents.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_HSA } from "@/content/calculators/us-hsa";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computeUsHsa, type HsaResult } from "@/lib/calc/us-hsa";
import { type FilingStatus } from "@/lib/calc/us-payroll";

const CONTENT_PATH = "@/content/calculators/us-hsa";

const FORM_ID = "tai-khoan-tiet-kiem-y-te-hoa-ky-nhap";
const RESULT_ID = "tai-khoan-tiet-kiem-y-te-hoa-ky-ket-qua";

const F = US_HSA.form;

type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_HSA: typeof US_HSA;
      };
      return {
        US_HSA: {
          ...actual.US_HSA,
          form: {
            ...actual.US_HSA.form,
            defaults: { ...actual.US_HSA.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/us-hsa-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.UsHsaCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/**
 * The engine, fed exactly what the component feeds it for a given set of
 * defaults. Written once so that no expected figure in this file is a
 * transcription.
 */
function compute(defaults: Defaults = {}): HsaResult {
  const v = { ...F.defaults, ...defaults };
  const result = computeUsHsa({
    year: Number(v.year),
    coverage: v.coverage as "family" | "selfOnly",
    age: parseMoney(v.age) as number,
    eligibleMonths: parseMoney(v.eligibleMonths) as number,
    useLastMonthRule: v.lastMonth === "yes",
    contribution: parseMoney(v.contribution) as number,
    employerContribution: parseMoney(v.employer) as number,
    federalRatePercent: parseDecimal(v.federal) as number,
    stateRatePercent: parseDecimal(v.state) as number,
    viaPayroll: v.payroll === "yes",
    annualWagesBeforeHsa: parseMoney(v.wages) ?? 0,
    filingStatus: v.status as FilingStatus,
    currentBalance: parseMoney(v.balance) as number,
    returnPercent: parseDecimal(v.return) as number,
    years: parseMoney(v.years) as number,
  });
  if (result === null) throw new Error("the engine refused a valid case");
  return result;
}

const usd = (value: number): string => `${formatMoney(value, 2)} USD`;
/** The statutory ceilings, at the no-cents grammar the page gives them. */
const round = (value: number): string => `${formatMoney(value)} USD`;

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

const resultRegion = (html: string): string =>
  html.slice(
    html.indexOf('data-calc-region="result"'),
    html.indexOf('data-calc-region="detail"'),
  );

const detailRegion = (html: string): string =>
  html.slice(html.indexOf('data-calc-region="detail"'));

describe("row 30 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the two-column split the row asked for", async () => {
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

  it("pins a short current answer, this form being the longest", async () => {
    // CORRECTED; the reason and the shelf-wide pinned / unpinned table are in
    // `components/u-long-form-cta.test.ts`. Thirteen controls in four groups
    // is the largest form on the US shelf.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("emphasises the tax saved, once, in the one live region", async () => {
    const html = await render();
    const r = compute();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const result = resultRegion(html);
    expect(result).toContain(usd(r.firstYearTaxSaved));
    // The three rows that build it follow, in cause order.
    expect(result.indexOf(F.totalSavedLabel)).toBeLessThan(
      result.indexOf(F.netCostLabel),
    );
    expect(result.indexOf(F.incomeTaxSavedLabel)).toBeLessThan(
      result.indexOf(F.ficaSavedLabel),
    );
    expect(result).toContain(usd(r.netCostOfContribution));
    expect(result).toContain(usd(r.incomeTaxSaved));
    expect(result).toContain(usd(r.ficaSaved));
  });
});

describe("the result side is grouped the way the form is", () => {
  it("keeps the room left beside the answer, not behind a summary", async () => {
    // This is the number the reader can act on before the filing deadline, so
    // it is the one group that is NOT disclosed. The old single "Trần góp"
    // group ran it together with the month-by-month ceiling.
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.contributionStatusTitle);
    expect(result).toContain(usd(r.totalContribution));
    expect(result).toContain(usd(r.remainingRoom));
    expect(result).not.toContain(F.limitsDisclosureTitle);
  });

  it("discloses how the ceiling was reached, and the later horizon", async () => {
    const html = await render();
    const r = compute();
    const detail = detailRegion(html);
    expect(detail).toContain(F.limitsDisclosureTitle);
    expect(detail).toContain(F.limitTitle);
    expect(count(detail, "<details")).toBe(1);
    // Statutory ceilings, no cents: 8.750 family for 2026.
    expect(detail).toContain(round(r.fullYearBaseLimit));
    expect(detail).toContain(round(r.totalLimit));
    // The projection and the withdrawal rows are in the detail region but not
    // behind the summary: they are read after the answer, not instead of it.
    expect(detail).toContain(F.projectionTitle);
    expect(detail).toContain(usd(r.projectedBalance));
    expect(detail).toContain(usd(r.projectedGrowth));
    expect(detail).toContain(F.withdrawalTitle);
    expect(detail).toContain(usd(r.nonMedicalPenalty));
  });

  it("moves the penalty reading to the rows it reads, not the answer", async () => {
    const html = await render();
    const r = compute();
    expect(r.penaltyApplies).toBe(true);
    expect(html).toContain(F.penaltyNotice);
    expect(html).not.toContain(F.noPenaltyNotice);
    // After the withdrawal rows it explains, and inside the detail region.
    const detail = detailRegion(html);
    expect(detail).toContain(F.penaltyNotice);
    expect(detail.indexOf(F.nonMedicalNetLabel)).toBeLessThan(
      detail.indexOf(F.penaltyNotice),
    );
  });

  it("swaps that reading at the age where the penalty stops", async () => {
    // 40 + 30 years is 70, past the age-65 exit.
    const r = compute({ years: "30" });
    expect(r.penaltyApplies).toBe(false);
    const html = await render({ years: "30" });
    expect(html).toContain(F.noPenaltyNotice);
    expect(html).not.toContain(F.penaltyNotice);
  });
});

describe("the applicability limits sit beside the figure they qualify", () => {
  it("says nothing extra when the defaults are inside every limit", async () => {
    const html = await render();
    expect(html).not.toContain(F.excessNotice);
    expect(html).not.toContain(F.chequeNotice);
    expect(html).not.toContain(F.lastMonthNotice);
    expect(html).not.toContain(F.proratedNotice);
    expect(html).not.toContain(F.invalidNotice);
  });

  it("warns above the ceiling, in the primary column", async () => {
    const r = compute({ contribution: "10.000" });
    expect(r.excessContribution).toBeGreaterThan(0);
    const html = await render({ contribution: "10.000" });
    expect(resultRegion(html)).toContain(F.excessNotice);
    expect(resultRegion(html)).toContain(usd(r.excessContribution));
    // An over-limit contribution is NOT an invalid field: it still computes.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("warns that a cheque contribution forfeits the fourth layer", async () => {
    // And drops the two fields the answer then ignores, rather than leaving a
    // blank wage in front of the CTA's first-invalid search.
    const html = await render({ payroll: "no", wages: "" });
    expect(resultRegion(html)).toContain(F.chequeNotice);
    expect(html).not.toContain(F.wagesLabel);
    expect(html).not.toContain(F.statusLabel);
    expect(html).not.toContain('aria-invalid="true"');
    const r = compute({ payroll: "no", wages: "" });
    expect(r.ficaSaved).toBe(0);
    expect(resultRegion(html)).toContain(usd(r.firstYearTaxSaved));
  });

  it("names the last-month test instead of the proration", async () => {
    const html = await render({ eligibleMonths: "1", lastMonth: "yes" });
    expect(html).toContain(F.lastMonthNotice);
    expect(html).not.toContain(F.proratedNotice);
    const r = compute({ eligibleMonths: "1", lastMonth: "yes" });
    expect(r.lastMonthRuleApplied).toBe(true);
    expect(r.eligibilityFactor).toBe(1);
  });

  it("names the proration when the year is only part eligible", async () => {
    const d = { eligibleMonths: "6", contribution: "2.000", employer: "0" };
    const r = compute(d);
    expect(r.eligibilityFactor).toBeLessThan(1);
    expect(r.excessContribution).toBe(0);
    const html = await render(d);
    expect(html).toContain(F.proratedNotice);
    expect(html).not.toContain(F.lastMonthNotice);
    expect(html).not.toContain(F.excessNotice);
    expect(detailRegion(html)).toContain(round(r.baseLimit));
  });

  it("treats a zero contribution as valid, not as a missing field", async () => {
    const d = { contribution: "0", employer: "0" };
    const html = await render(d);
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    const r = compute(d);
    expect(html).toContain(usd(r.remainingRoom));
    expect(resultRegion(html)).toContain("0,00 USD");
  });

  it("withholds every figure on an unusable age, and says why", async () => {
    const html = await render({ age: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain(usd(compute().firstYearTaxSaved));
    // The rows are still there, as dashes — the region does not disappear.
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
    expect(html).toContain("—");
  });

  it("rejects the last-month rule with no eligible month at all", async () => {
    // The one case where the engine itself refuses: the rule needs 1/12.
    const html = await render({ eligibleMonths: "0", lastMonth: "yes" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.eligibleMonthsInvalid);
    expect(html).toContain(F.invalidNotice);
  });
});
