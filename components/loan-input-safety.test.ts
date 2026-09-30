/**
 * The 1 … 1.200-month support bound on /cong-cu/vay-mua-nha/ and
 * /cong-cu/vay-mua-xe/ (root input-safety review, 2026-09-29).
 *
 * What these prove: an out-of-range DERIVED month count is marked invalid on
 * the term field and never reaches the schedule engine (a spy on
 * `computeLoan` — which `computeAutoLoan` also delegates to — sees no call);
 * fractional terms still convert; the learning trials stop at the bound.
 * Nothing here is a browser observation.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MAX_TERM_MONTHS, derivedTermMonths, termMonthsSupported } from "@/components/calc/term-months";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";
import { AUTO_LEARNING } from "@/content/calculators/auto-learning";
import { LOAN } from "@/content/calculators/loan";
import { MORTGAGE_LEARNING } from "@/content/calculators/mortgage-learning";
import { computeLoan } from "@/lib/calc/loan";

const HUGE_YEARS = `1${"0".repeat(300)}`; // finite, but × 12 is no safe integer
const OVERFLOW_YEARS = `1${"0".repeat(308)}`; // × 12 is Infinity

describe("derivedTermMonths / termMonthsSupported", () => {
  it("keeps the fractional conversion and supports exactly 1 … 1.200", () => {
    expect(derivedTermMonths(5.5, "years")).toBe(66);
    expect(termMonthsSupported(66)).toBe(true);
    expect(derivedTermMonths(1200, "months")).toBe(1200);
    expect(derivedTermMonths(100, "years")).toBe(1200);
    expect(termMonthsSupported(MAX_TERM_MONTHS)).toBe(true);
    expect(termMonthsSupported(1)).toBe(true);
    expect(termMonthsSupported(1201)).toBe(false);
    expect(derivedTermMonths(100.1, "years")).toBe(1201);
  });

  it("small fractions rounding to 0, non-finite and overflowing input are never a count", () => {
    expect(termMonthsSupported(derivedTermMonths(0.4, "months"))).toBe(false);
    expect(termMonthsSupported(derivedTermMonths(0.02, "years"))).toBe(false);
    expect(derivedTermMonths(Number(HUGE_YEARS), "years")).toBeNull();
    expect(derivedTermMonths(Number(OVERFLOW_YEARS), "years")).toBeNull();
    expect(derivedTermMonths(Number.POSITIVE_INFINITY, "months")).toBeNull();
    expect(derivedTermMonths(null, "years")).toBeNull();
  });
});

/**
 * The test's OWN bound, written out rather than imported from the production
 * helper: if the production guard ever regressed, this harness must still
 * refuse to let a huge count reach the real schedule.
 */
const TEST_MAX_MONTHS = 1200;
const supportedInTest = (months: unknown) =>
  typeof months === "number" && Number.isSafeInteger(months) && months >= 1 && months <= TEST_MAX_MONTHS;

/**
 * Render a page with a spy on the schedule engine.
 *
 * FAIL-FAST (root review 2026-09-29): every call is recorded, but an
 * unsupported month count THROWS before `actual.computeLoan` runs, so a
 * future guard regression fails loudly here instead of allocating an
 * enormous schedule and hanging CI. Supported counts use the real engine.
 */
async function withEngineSpy(load: () => Promise<string>) {
  vi.resetModules();
  const spy = vi.fn();
  const actualCalls = vi.fn();
  vi.doMock("@/lib/calc/loan", async () => {
    const actual = await vi.importActual<typeof import("@/lib/calc/loan")>("@/lib/calc/loan");
    return {
      ...actual,
      computeLoan: (...args: Parameters<typeof actual.computeLoan>) => {
        spy(args[0].termMonths);
        if (!supportedInTest(args[0].termMonths)) {
          throw new Error(
            `loan-input-safety: computeLoan reached with unsupported termMonths ${String(args[0].termMonths)} — the UI guard regressed`,
          );
        }
        actualCalls(args[0].termMonths);
        return actual.computeLoan(...args);
      },
    };
  });
  const html = await load();
  return { html, spy, actualCalls };
}

async function mortgage(term: string, termUnit: string) {
  vi.doMock("@/content/calculators/loan", async () => {
    const actual = await vi.importActual<typeof import("@/content/calculators/loan")>("@/content/calculators/loan");
    return { LOAN: { ...actual.LOAN, form: { ...actual.LOAN.form, defaultTerm: term, defaultTermUnit: termUnit } } };
  });
  const { LoanCalculator } = await import("@/components/loan-calculator");
  return renderToStaticMarkup(createElement(LoanCalculator));
}

afterEach(() => {
  vi.doUnmock("@/lib/calc/loan");
  vi.doUnmock("@/content/calculators/loan");
  vi.doUnmock("@/content/calculators/auto-loan");
  vi.resetModules();
});

describe("the harness itself", () => {
  it("throws for an unsupported count WITHOUT calling the real engine, and passes supported ones through", async () => {
    const { spy, actualCalls } = await withEngineSpy(async () => "");
    const { computeLoan: guarded } = await import("@/lib/calc/loan");
    for (const termMonths of [0, 1201, 1e12, Number.POSITIVE_INFINITY, 12.5]) {
      expect(() => guarded({ amount: 1_000_000, annualRatePercent: 9, termMonths }), String(termMonths)).toThrow(
        /unsupported termMonths/,
      );
    }
    expect(spy).toHaveBeenCalledTimes(5);
    expect(actualCalls).not.toHaveBeenCalled();
    expect(guarded({ amount: 1_000_000, annualRatePercent: 9, termMonths: 12 })).not.toBeNull();
    expect(actualCalls).toHaveBeenCalledWith(12);
  });
});

describe("vay-mua-nha: invalid derived counts never reach the engine", () => {
  it.each([
    ["1201", "months"],
    ["100,1", "years"],
    [HUGE_YEARS, "years"],
    [OVERFLOW_YEARS, "years"],
    ["0,4", "months"],
    ["0,02", "years"],
  ])("%s %s: the term field is invalid with the bound in its error, and computeLoan is never called", async (term, unit) => {
    const { html, spy } = await withEngineSpy(() => mortgage(term, unit));
    expect(spy).not.toHaveBeenCalled();
    expect(html).toContain(LOAN.form.termInvalid);
    expect(LOAN.form.termInvalid).toContain("1.200");
    expect(html).toContain('aria-invalid="true"');
  });

  it("5,5 years, 1 month, 1.200 months and 100 years are accepted and computed at their exact counts", async () => {
    for (const [term, unit, months] of [
      ["5,5", "years", 66],
      ["1", "months", 1],
      ["1200", "months", 1200],
      ["100", "years", 1200],
    ] as const) {
      const { html, spy } = await withEngineSpy(() => mortgage(term, unit));
      expect(spy, `${term} ${unit}`).toHaveBeenCalledWith(months);
      expect(html).not.toContain(LOAN.form.termInvalid);
    }
  });

  it("unit switch recovers: 1.200 read as years is invalid, read as months is valid — never clamped", async () => {
    const years = await withEngineSpy(() => mortgage("1200", "years"));
    expect(years.spy).not.toHaveBeenCalled();
    expect(years.html).toContain(LOAN.form.termInvalid);
    vi.resetModules();
    const months = await withEngineSpy(() => mortgage("1200", "months"));
    expect(months.spy).toHaveBeenCalledWith(1200);
    expect(months.html).not.toContain(LOAN.form.termInvalid);
  });

  it("the help names the support range and says it is not a bank maximum; the error no longer claims 'số nguyên'", () => {
    expect(LOAN.form.termHelp).toContain("1.200 tháng");
    expect(LOAN.form.termHelp).toContain("không phải kỳ hạn tối đa của ngân hàng");
    expect(LOAN.form.termInvalid).not.toContain("số nguyên");
    expect(AUTO_LOAN.form.termInvalid).not.toContain("số nguyên");
    expect(AUTO_LOAN.form.termHelp).toContain("1.200 tháng");
  });
});

describe("vay-mua-xe: the form state gates the engine", () => {
  const values = (term: string, termUnit: string) => ({
    price: AUTO_LOAN.form.defaultPrice,
    down: AUTO_LOAN.form.defaultDown,
    tradeIn: AUTO_LOAN.form.defaultTradeIn,
    rate: AUTO_LOAN.form.defaultRate,
    term,
    termUnit,
    netIncome: AUTO_LOAN.form.defaultNetIncome,
    essentials: AUTO_LOAN.form.defaultEssentials,
    otherDebts: AUTO_LOAN.form.defaultOtherDebts,
    reserve: AUTO_LOAN.form.defaultReserve,
    running: AUTO_LOAN.form.defaultRunning,
  });

  it.each([
    ["1201", "months"],
    ["100,1", "years"],
    [HUGE_YEARS, "years"],
    [OVERFLOW_YEARS, "years"],
    ["0,4", "months"],
  ])("%s %s: termInvalid, no result, and computeLoan never called", async (term, unit) => {
    const { spy } = await withEngineSpy(async () => "");
    const { autoLoanFormState } = await import("@/components/auto-loan-calculator");
    const s = autoLoanFormState(values(term, unit));
    expect(s.termInvalid).toBe(true);
    expect(s.result).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("5,5 years → 66, 100 years → 1.200, and a unit switch recovers", async () => {
    const { spy } = await withEngineSpy(async () => "");
    const { autoLoanFormState } = await import("@/components/auto-loan-calculator");
    expect(autoLoanFormState(values("5,5", "years")).result!.loan.months).toBe(66);
    expect(autoLoanFormState(values("100", "years")).result!.loan.months).toBe(1200);
    expect(autoLoanFormState(values("1200", "years")).termInvalid).toBe(true);
    expect(autoLoanFormState(values("1200", "months")).result!.loan.months).toBe(1200);
    expect(spy).toHaveBeenCalledWith(66);
    expect(spy).toHaveBeenCalledWith(1200);
  });
});

describe("term trials never cross the support bound", () => {
  it("mortgage: +5 years / +60 months is offered only while the result stays ≤ 1.200 months", async () => {
    const { mortgageAvailability, termStepSupported } = await import("@/components/mortgage-learning");
    const result = computeLoan({ amount: 1_000_000_000, annualRatePercent: 9, termMonths: 240 })!;
    const base = { amount: "1.000.000.000", rate: "9", extra: "0" };
    expect(mortgageAvailability("term", { ...base, term: "95", termUnit: "years" }, result)).toEqual({ enabled: true });
    expect(termStepSupported({ ...base, term: "96", termUnit: "years" })).toBe(false);
    expect(mortgageAvailability("term", { ...base, term: "96", termUnit: "years" }, result)).toEqual({
      enabled: false,
      reason: MORTGAGE_LEARNING.blocked.termMax,
    });
    expect(mortgageAvailability("term", { ...base, term: "1150", termUnit: "months" }, result)).toEqual({
      enabled: false,
      reason: MORTGAGE_LEARNING.blocked.termMax,
    });
    expect(mortgageAvailability("term", { ...base, term: "1140", termUnit: "months" }, result)).toEqual({ enabled: true });
  });

  it("auto: +2 years / +24 months stops at 1.200 months with its reason", async () => {
    const { autoAvailability, autoTermStepSupported } = await import("@/components/auto-learning");
    const { autoLoanFormState } = await import("@/components/auto-loan-calculator");
    const at = (term: string, termUnit: string) => {
      const v = {
        price: AUTO_LOAN.form.defaultPrice,
        down: AUTO_LOAN.form.defaultDown,
        tradeIn: AUTO_LOAN.form.defaultTradeIn,
        rate: AUTO_LOAN.form.defaultRate,
        term,
        termUnit,
        netIncome: AUTO_LOAN.form.defaultNetIncome,
        essentials: AUTO_LOAN.form.defaultEssentials,
        otherDebts: AUTO_LOAN.form.defaultOtherDebts,
        reserve: AUTO_LOAN.form.defaultReserve,
        running: AUTO_LOAN.form.defaultRunning,
      };
      return autoAvailability("term", v, autoLoanFormState(v));
    };
    expect(at("98", "years")).toEqual({ enabled: true });
    expect(at("99", "years")).toEqual({ enabled: false, reason: AUTO_LEARNING.blocked.termMax });
    expect(at("1176", "months")).toEqual({ enabled: true });
    expect(at("1180", "months")).toEqual({ enabled: false, reason: AUTO_LEARNING.blocked.termMax });
    expect(autoTermStepSupported({ term: "5", termUnit: "years" })).toBe(true);
  });
});
