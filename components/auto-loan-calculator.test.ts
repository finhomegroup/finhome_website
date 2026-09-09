/**
 * The vehicle loan page's field gates and its nothing-to-finance note.
 *
 * `lib/calc/auto-loan.test.ts` pins the lib contract only: `termMonths` of 0 or
 * 60,5 gives null. That says nothing about which field the PAGE then blames for
 * that null, and both bugs this file exists for lived exactly there:
 *
 *  1. `termInvalid` used to test the entered term (`term <= 0`) instead of the
 *     derived month count, so 0,4 tháng passed the gate, came back null from
 *     `computeLoan`, and the page printed "giảm tiền trả trước" — advice about
 *     the deposit for a broken term.
 *  2. `nothingToFinance` used to be `fieldsUsable && result === null`, with no
 *     test of the cause, which is what made that misattribution reachable.
 *
 * `autoLoanFormState` is exported from the component precisely so this can be a
 * pure test: vitest.config.ts runs `node` with no jsdom. The last block renders
 * the component with `react-dom/server` — as `loan-calculator.test.ts` does —
 * to prove the flags are actually wired to the fields, since a pure test of the
 * helper alone would still pass if the JSX stopped using it.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  autoLoanFormState,
  type AutoLoanFormValues,
} from "@/components/auto-loan-calculator";
import { formatMoney } from "@/lib/calc/number";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";

const D = AUTO_LOAN.form;
const CONTENT = "@/content/calculators/auto-loan";

/** The page's initial state: whatever the content file prefills. */
const DEFAULTS: AutoLoanFormValues = {
  price: D.defaultPrice,
  down: D.defaultDown,
  tradeIn: D.defaultTradeIn,
  rate: D.defaultRate,
  term: D.defaultTerm,
  termUnit: D.defaultTermUnit,
};

const state = (over: Partial<AutoLoanFormValues> = {}) =>
  autoLoanFormState({ ...DEFAULTS, ...over });

describe("autoLoanFormState — the default state", () => {
  it("finances 600 triệu over 60 months with nothing flagged", () => {
    const s = state();
    expect(s.termMonths).toBe(60);
    for (const flag of [
      s.priceInvalid,
      s.downInvalid,
      s.tradeInInvalid,
      s.rateInvalid,
      s.termInvalid,
    ]) {
      expect(flag).toBe(false);
    }
    expect(s.nothingToFinance).toBe(false);
    expect(s.result!.amountFinanced).toBe(600_000_000);
    expect(s.result!.downPaymentPercent).toBeCloseTo(25, 10);
    expect(s.result!.loan.months).toBe(60);
  });

  it("pays the published annuity instalment", () => {
    // A = P·r / (1 − (1+r)^(−n)) — the formula the page's own "Công thức tính"
    // quotes — with P = 600.000.000, r = 9,5%/12 and n = 60. `pmt` evaluates the
    // algebraically equal P·g·r/(g−1) form instead, so the two are only equal to
    // float rounding: at these inputs they happen to agree exactly, but at n=66
    // they differ by 1,9e-9 ₫. 6 dp (5e-7 ₫ on a 1,26e7 ₫ payment, 4e-14
    // relative) is above that divergence and still far below one đồng.
    const r = 9.5 / 100 / 12;
    const reference = (600_000_000 * r) / (1 - (1 + r) ** -60);
    const s = state();
    expect(s.result!.loan.monthlyPrincipalInterest).toBeCloseTo(reference, 6);
    // What the row actually renders: formatMoney's default is whole đồng.
    expect(formatMoney(s.result!.loan.monthlyPrincipalInterest)).toBe(
      "12.601.117",
    );
  });

  it("adds the buyer's own money to the loan payments for total cost", () => {
    const s = state();
    expect(s.totalCost).toBe(
      200_000_000 + 0 + s.result!.loan.totalPrincipalInterest,
    );
    expect(state({ tradeIn: "150.000.000" }).totalCost).toBe(
      200_000_000 +
        150_000_000 +
        state({ tradeIn: "150.000.000" }).result!.loan.totalPrincipalInterest,
    );
  });
});

describe("autoLoanFormState — the term gate is on the derived months", () => {
  // Every value here rounds to 0 months, so `computeLoan` rejects it. Measured:
  // Math.round(0,4) = 0 and Math.round(0,5) = 1, so in tháng the whole failing
  // band is 0 < term < 0,5; in năm it is term < 1/24 = 0,041666… (0,0416 fails,
  // 0,0417 passes on a 1e-4 grid).
  const roundsToZero: [string, string][] = [
    ["0,4", "months"],
    ["0,49", "months"],
    ["0,04", "years"],
    ["0,0416", "years"],
  ];

  it("flags Kỳ hạn, not the deposit, for a term that rounds to zero", () => {
    for (const [term, termUnit] of roundsToZero) {
      const s = state({ term, termUnit });
      expect(s.termMonths, `${term} ${termUnit}`).toBe(0);
      expect(s.termInvalid, `${term} ${termUnit}`).toBe(true);
      expect(s.result, `${term} ${termUnit}`).toBeNull();
      // The regression: this used to be true, blaming the deposit.
      expect(s.nothingToFinance, `${term} ${termUnit}`).toBe(false);
      // No other field is implicated either.
      expect(s.priceInvalid).toBe(false);
      expect(s.downInvalid).toBe(false);
      expect(s.tradeInInvalid).toBe(false);
      expect(s.rateInvalid).toBe(false);
    }
  });

  it("still rejects a term of zero or below, and an unparseable one", () => {
    expect(state({ term: "0" }).termInvalid).toBe(true);
    expect(state({ term: "-1" }).termInvalid).toBe(true);
    expect(state({ term: "" }).termInvalid).toBe(true);
    expect(state({ term: "" }).termMonths).toBeNull();
    expect(state({ term: "abc" }).termMonths).toBeNull();
  });

  it("keeps a non-integer term legal: 5,5 năm is 66 tháng", () => {
    const years = state({ term: "5,5", termUnit: "years" });
    const months = state({ term: "66", termUnit: "months" });
    expect(years.termInvalid).toBe(false);
    expect(years.termMonths).toBe(66);
    expect(years.result!.loan.months).toBe(66);
    // 5,5 × 12 is exactly 66 in binary floating point, so both routes hand
    // `computeAutoLoan` the identical integer: one computation, not two to
    // reconcile, which is why this is an exact comparison.
    expect(years.result!.loan.monthlyPrincipalInterest).toBe(
      months.result!.loan.monthlyPrincipalInterest,
    );
    expect(formatMoney(years.result!.loan.monthlyPrincipalInterest)).toBe(
      "11.706.931",
    );
  });

  it("accepts the smallest term that rounds up to a month", () => {
    // Math.round(0,5) = 1: a half-month entry is a one-month loan, not an error.
    const half = state({ term: "0,5", termUnit: "months" });
    expect(half.termInvalid).toBe(false);
    expect(half.result!.loan.months).toBe(1);
    const year = state({ term: "0,0417", termUnit: "years" });
    expect(year.termInvalid).toBe(false);
    expect(year.result!.loan.months).toBe(1);
  });
});

describe("autoLoanFormState — the note is only for the real cause", () => {
  it("shows the note when the deposit and trade-in cover the price", () => {
    const paidCash = state({ down: "800.000.000" });
    expect(paidCash.termInvalid).toBe(false);
    expect(paidCash.result).toBeNull();
    expect(paidCash.nothingToFinance).toBe(true);

    const split = state({ down: "500.000.000", tradeIn: "400.000.000" });
    expect(split.nothingToFinance).toBe(true);
    // Exactly at the price counts: there is nothing left to borrow.
    expect(state({ down: "600.000.000", tradeIn: "200.000.000" }).nothingToFinance).toBe(
      true,
    );
  });

  it("stays silent for a null that came from somewhere else", () => {
    // The case the cause check exists for, and the only one reachable once the
    // term gate is right: every field flag is false, yet there is no loan.
    // At 1e9 %/năm the monthly rate is 833.333, (1+r)^60 overflows to Infinity
    // and `pmt` returns NaN, so `amortize` — and therefore `computeLoan` —
    // returns null. (Measured: the schedule still computes at 1e7 %/năm and
    // first fails at 1,6e8 %/năm, where P·growth alone overflows.)
    const s = state({ rate: "1000000000" });
    expect(s.rateInvalid).toBe(false);
    expect(s.termInvalid).toBe(false);
    expect(s.result).toBeNull();
    // There is 600 triệu left to finance, so the deposit advice would be wrong.
    expect(s.nothingToFinance).toBe(false);
  });

  it("stays silent while a field is invalid on its own", () => {
    // A field error is already on screen; the note would contradict it.
    for (const over of [
      { price: "0" },
      { price: "" },
      { down: "-1" },
      { tradeIn: "-1" },
      { rate: "-0,5" },
    ]) {
      const s = state(over);
      expect(s.nothingToFinance, JSON.stringify(over)).toBe(false);
      expect(s.result, JSON.stringify(over)).toBeNull();
      expect(s.totalCost, JSON.stringify(over)).toBeNull();
    }
  });
});

/**
 * `aria-invalid` per field, keyed by the visible label.
 *
 * `NumberField` renders the label immediately before its input, so the first
 * input after a label is that label's own. `SelectField`'s label has no input
 * after it on this page and drops out of the map, which is fine: it has no
 * validity flag.
 */
function fieldFlags(html: string): Map<string, boolean> {
  return new Map(
    [...html.matchAll(/<label[^>]*>(.*?)<\/label>[\s\S]*?<input\b([^>]*)>/g)].map(
      (match) => [match[1], /aria-invalid="true"/.test(match[2])],
    ),
  );
}

/** Render the calculator with the prefilled values overridden. */
async function render(over: Partial<Record<string, string>>): Promise<string> {
  vi.resetModules();
  vi.doMock(CONTENT, async () => {
    const actual = await vi.importActual<typeof import("@/content/calculators/auto-loan")>(
      CONTENT,
    );
    return {
      AUTO_LOAN: {
        ...actual.AUTO_LOAN,
        form: { ...actual.AUTO_LOAN.form, ...over },
      },
    };
  });
  try {
    const { AutoLoanCalculator } = await import("@/components/auto-loan-calculator");
    return renderToStaticMarkup(createElement(AutoLoanCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("AutoLoanCalculator — the flags reach the right field", () => {
  it("marks the term field and not the deposit for 0,4 tháng", async () => {
    const html = await render({ defaultTerm: "0,4", defaultTermUnit: "months" });
    const flags = fieldFlags(html);
    expect(flags.get(D.termLabel)).toBe(true);
    expect(flags.get(`${D.downLabel} (${D.downUnit})`)).toBe(false);
    expect(flags.get(`${D.priceLabel} (${D.priceUnit})`)).toBe(false);
    // The term field shows its own error text, and the deposit advice is absent.
    expect(html).toContain(D.termInvalid);
    expect(html).not.toContain(D.nothingToFinanceNotice);
  });

  it("shows the note with no field flagged when the deposit covers the price", async () => {
    const html = await render({ defaultDown: "800.000.000" });
    expect([...fieldFlags(html).values()]).toEqual([false, false, false, false, false]);
    expect(html).toContain(D.nothingToFinanceNotice);
    expect(html).not.toContain(D.termInvalid);
  });

  it("shows neither at the defaults", async () => {
    const html = await render({});
    expect([...fieldFlags(html).values()]).toEqual([false, false, false, false, false]);
    expect(html).not.toContain(D.nothingToFinanceNotice);
    expect(html).toContain("12.601.117");
  });
});
