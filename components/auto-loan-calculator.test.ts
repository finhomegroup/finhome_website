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
import { TABLE_UI } from "@/content/calculators/table-ui";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";

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
  netIncome: D.defaultNetIncome,
  essentials: D.defaultEssentials,
  otherDebts: D.defaultOtherDebts,
  reserve: D.defaultReserve,
  running: D.defaultRunning,
};

const state = (over: Partial<AutoLoanFormValues> = {}) =>
  autoLoanFormState({ ...DEFAULTS, ...over });

describe("autoLoanFormState — the default state", () => {
  it("finances 400 triệu over 60 months with nothing flagged", () => {
    const s = state();
    expect(s.termMonths).toBe(60);
    for (const flag of [
      s.priceInvalid,
      s.downInvalid,
      s.tradeInInvalid,
      s.rateInvalid,
      s.termInvalid,
      s.netIncomeInvalid,
      s.essentialsInvalid,
      s.otherDebtsInvalid,
      s.reserveInvalid,
      s.runningInvalid,
    ]) {
      expect(flag).toBe(false);
    }
    expect(s.nothingToFinance).toBe(false);
    // 800 − 300 deposit − 100 trade-in, the audit's row-31 fixture.
    expect(s.result!.amountFinanced).toBe(400_000_000);
    expect(s.result!.downPaymentPercent).toBeCloseTo(50, 10);
    expect(s.result!.loan.months).toBe(60);
  });

  it("pays the published annuity instalment", () => {
    // A = P·r / (1 − (1+r)^(−n)) — the formula the page's own "Công thức tính"
    // quotes — with P = 400.000.000, r = 10%/12 and n = 60. `pmt` evaluates the
    // algebraically equal P·g·r/(g−1) form instead, so the two are only equal to
    // float rounding: 6 dp (5e-7 ₫ on an 8,5e6 ₫ payment) is above any such
    // divergence and still far below one đồng.
    const r = 10 / 100 / 12;
    const reference = (400_000_000 * r) / (1 - (1 + r) ** -60);
    const s = state();
    expect(s.result!.loan.monthlyPrincipalInterest).toBeCloseTo(reference, 6);
    // The audit's independently computed figure for the same loan.
    expect(s.result!.loan.monthlyPrincipalInterest).toBeCloseTo(
      8_498_817.884507332,
      6,
    );
    expect(s.result!.loan.totalInterest).toBeCloseTo(109_929_073.07043993, 4);
    // What the row actually renders: formatMoney's default is whole đồng.
    expect(formatMoney(s.result!.loan.monthlyPrincipalInterest)).toBe(
      "8.498.818",
    );
  });

  it("adds the buyer's own money to the loan payments for total cost", () => {
    const s = state();
    expect(s.totalCost).toBe(
      300_000_000 + 100_000_000 + s.result!.loan.totalPrincipalInterest,
    );
    expect(state({ tradeIn: "150.000.000" }).totalCost).toBe(
      300_000_000 +
        150_000_000 +
        state({ tradeIn: "150.000.000" }).result!.loan.totalPrincipalInterest,
    );
  });

  it("marks the trade-in as active, so its disclosure cannot stay silent", () => {
    // The trade-in default is 100 triệu, which is CHANGING the amount
    // financed — `AdvancedFields` must therefore open itself and name it.
    expect(state().tradeInActive).toBe(true);
    expect(state({ tradeIn: "0" }).tradeInActive).toBe(false);
    expect(state({ tradeIn: "" }).tradeInActive).toBe(false);
  });
});

describe("autoLoanFormState — the household month (original row 31)", () => {
  it("allocates the audit's month on both legs", () => {
    const s = state();
    expect(s.budget!.withoutCar).toBe(12_000_000);
    expect(s.budget!.withCar).toBeCloseTo(3_501_182.115492668, 6);
  });

  it("takes the vehicle payment from the LOAN, so no field can double it", () => {
    // The instalment is not a field: there is exactly one on the page, and
    // "nợ khác" is documented as every debt EXCEPT this vehicle.
    const s = state();
    expect(s.budget!.vehiclePayment).toBe(
      s.result!.loan.monthlyPrincipalInterest,
    );
    expect(s.budget!.difference).toBe(s.result!.loan.monthlyPrincipalInterest);
    expect(s.budget!.otherDebts).toBe(3_000_000);
  });

  it("coincides on both legs when the purchase genuinely needs no loan", () => {
    // Deposit covers the price: the answer is a car with no debt, not a blank.
    // This is the VALID zero, and it has to stay reachable — the repair below
    // must not turn a cash purchase into an unknown.
    const s = state({ down: "800.000.000", tradeIn: "0" });
    expect(s.result).toBeNull();
    expect(s.nothingToFinance).toBe(true);
    expect(s.vehiclePayment).toBe(0);
    expect(s.budget!.vehiclePayment).toBe(0);
    expect(s.budget!.vehicleCostUnknown).toBe(false);
    expect(s.budget!.withCar).toBe(s.budget!.withoutCar);
    expect(s.budget!.difference).toBe(0);
  });
});

/**
 * An invalid loan is not a free car.
 *
 * The shipped defect, reproduced on the live page by an independent review:
 * with the default 400 triệu loan, setting the rate to −1 made the loan
 * unpriceable and the household moved from "12 / 3,50 triệu" to "12 / 12
 * triệu" with a vehicle cost of 0 ₫ and a chart announcing a gap of 0 ₫.
 *
 * The cause was `result?.loan.monthlyPrincipalInterest ?? 0` — which cannot
 * distinguish "there is no loan" from "we could not price the loan".
 */
describe("autoLoanFormState — an unpriceable loan is UNKNOWN, not zero", () => {
  const cases: [string, Partial<AutoLoanFormValues>][] = [
    ["a negative rate", { rate: "-1" }],
    ["a blank rate", { rate: "" }],
    ["an unparseable rate", { rate: "abc" }],
    ["a zero price", { price: "0" }],
    ["a blank price", { price: "" }],
    ["a term that rounds to zero months", { term: "0,4", termUnit: "months" }],
    ["a blank term", { term: "" }],
    ["a negative deposit", { down: "-1" }],
    // Not a field error at all: the rate is legal and the loan still cannot
    // be priced, because (1+r)^60 overflows. Same unknown, different cause.
    ["an overflowing rate", { rate: "1000000000" }],
  ];

  it("withholds every with-car figure instead of inferring a zero", () => {
    for (const [name, over] of cases) {
      const s = state(over);
      expect(s.result, name).toBeNull();
      expect(s.nothingToFinance, name).toBe(false);
      expect(s.vehiclePayment, name).toBeNull();

      const budget = s.budget!;
      expect(budget.vehicleCostUnknown, name).toBe(true);
      expect(budget.vehiclePayment, name).toBeNull();
      expect(budget.vehicleMonthlyCost, name).toBeNull();
      expect(budget.withCar, name).toBeNull();
      expect(budget.difference, name).toBeNull();
      // Not "no shortfall" — no answer. The flag above is what a caller reads.
      expect(budget.shortfall, name).toBe(false);
      expect(budget.shortfallAmount, name).toBeNull();
    }
  });

  it("keeps the without-car month, which does not depend on the loan", () => {
    // Withholding the whole ledger would take away the one figure the reader
    // can still act on.
    const s = state({ rate: "-1" });
    expect(s.budget!.withoutCar).toBe(12_000_000);
    expect(s.budget!.committedWithoutVehicle).toBe(28_000_000);
  });

  it("recovers the full comparison as soon as the field is valid again", () => {
    const broken = state({ rate: "-1" });
    expect(broken.budget!.withCar).toBeNull();

    const fixed = state({ rate: "10" });
    expect(fixed.budget!.vehicleCostUnknown).toBe(false);
    expect(fixed.budget!.withCar).toBeCloseTo(3_501_182.115492668, 6);
    expect(fixed.budget!.difference).toBeCloseTo(8_498_817.884507332, 6);
  });

  it("never lets an unknown instalment read as a smaller one", () => {
    // The specific arithmetic the defect produced: 12 − 0 = 12, i.e. the car
    // appeared to cost nothing at all.
    const s = state({ rate: "-1" });
    expect(s.budget!.withCar).not.toBe(s.budget!.withoutCar);
    expect(s.budget!.withCar).not.toBe(0);
  });
});

describe("autoLoanFormState — the household month, continued", () => {

  it("treats a BLANK essentials box as unknown, not as zero", () => {
    const s = state({ essentials: "" });
    expect(s.essentialsInvalid).toBe(false);
    expect(s.budget!.limited).toBe(true);
    expect(s.budget!.essentialExpenses).toBeNull();
    // 40 − 3 − 3, with nothing claimed about living costs.
    expect(s.budget!.withoutCar).toBe(34_000_000);
  });

  it("flags a non-blank essentials box that does not parse", () => {
    expect(state({ essentials: "abc" }).essentialsInvalid).toBe(true);
    expect(state({ essentials: "-1" }).essentialsInvalid).toBe(true);
    expect(state({ essentials: "abc" }).budget).toBeNull();
  });

  it("reports a shortfall rather than flooring the month at zero", () => {
    const s = state({ netIncome: "30.000.000" });
    expect(s.budget!.withCar).toBeCloseTo(-6_498_817.884507332, 6);
    expect(s.budget!.shortfall).toBe(true);
    expect(s.budget!.shortfallWithoutVehicle).toBe(false);
  });

  it("blanks the budget while one of its own fields is invalid", () => {
    for (const over of [
      { netIncome: "0" },
      { netIncome: "" },
      { otherDebts: "-1" },
      { reserve: "-1" },
      { running: "-1" },
    ]) {
      expect(state(over).budget, JSON.stringify(over)).toBeNull();
    }
  });

  it("keeps the loan answer even when the household fields are unusable", () => {
    // The two halves of the page fail independently: a blank net income must
    // not blank the instalment the reader came for.
    const s = state({ netIncome: "" });
    expect(s.budget).toBeNull();
    expect(s.result!.amountFinanced).toBe(400_000_000);
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
    // RECOMPUTED for the row-31 fixture, not weakened. This expectation still
    // read 11.706.931, which was the 600 triệu / 9,5% loan the page shipped
    // before original row 31 changed the defaults to 400 triệu / 10%.
    // A = P·r / (1 − (1+r)^(−n)) with P = 400.000.000, r = 0,10/12, n = 66 is
    // 7.903.879,717219689 — confirmed independently by the review.
    const r = 10 / 100 / 12;
    expect(years.result!.loan.monthlyPrincipalInterest).toBeCloseTo(
      (400_000_000 * r) / (1 - (1 + r) ** -66),
      6,
    );
    expect(formatMoney(years.result!.loan.monthlyPrincipalInterest)).toBe(
      "7.903.880",
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
    // There is 400 triệu left to finance, so the deposit advice would be wrong.
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
 * PAIRED BY `for`/`id`, NOT BY DOM ADJACENCY, and that is a repair. The first
 * version walked from EVERY `<label>` to the next `<input>`, with a comment
 * claiming `SelectField`'s label had no following input. That was true until
 * the household fields were added below it: the "Đơn vị kỳ hạn" select label
 * then sat immediately before the net-income input and consumed it under the
 * wrong key, so `flags.get("<net income label>")` came back `undefined` and a
 * real assertion failed for a reason that had nothing to do with the page.
 *
 * `NumberField` owns `htmlFor`/`id` from one `useId` (see its docstring), so
 * the attributes are the reliable binding. A `SelectField` drops out of the
 * map because its control is a `<select>`, not an `<input>` — which is the
 * correct reason rather than an accident of ordering.
 */
function fieldFlags(html: string): Map<string, boolean> {
  const labelsFor = new Map<string, string>();
  for (const match of html.matchAll(
    /<label[^>]*\bfor="([^"]+)"[^>]*>(.*?)<\/label>/g,
  )) {
    labelsFor.set(match[1], match[2]);
  }

  const flags = new Map<string, boolean>();
  for (const match of html.matchAll(/<input\b([^>]*)>/g)) {
    const attributes = match[1];
    const id = /\bid="([^"]+)"/.exec(attributes)?.[1];
    if (id === undefined) continue;
    const label = labelsFor.get(id);
    if (label === undefined) continue;
    flags.set(label, /aria-invalid="true"/.test(attributes));
  }
  return flags;
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
    const html = await render({
      defaultDown: "800.000.000",
      defaultTradeIn: "0",
    });
    expect([...fieldFlags(html).values()].some(Boolean)).toBe(false);
    expect(html).toContain(D.nothingToFinanceNotice);
    expect(html).not.toContain(D.termInvalid);
  });

  it("shows neither at the defaults, and renders both answers", async () => {
    const html = await render({});
    expect([...fieldFlags(html).values()].some(Boolean)).toBe(false);
    expect(html).not.toContain(D.nothingToFinanceNotice);
    // The instalment, and the two household residuals it moves between.
    expect(html).toContain("8.498.818");
    expect(html).toContain("12.000.000");
    expect(html).toContain("3.501.182");
  });

  it("flags the household field, not a vehicle field, for a bad net income", async () => {
    // The two halves fail independently; the loan rows must survive.
    const html = await render({ defaultNetIncome: "0" });
    const flags = fieldFlags(html);
    expect(flags.get(`${D.netIncomeLabel} (${D.netIncomeUnit})`)).toBe(true);
    expect(flags.get(`${D.priceLabel} (${D.priceUnit})`)).toBe(false);
    expect(html).toContain("8.498.818");
  });

  it("opens the trade-in disclosure and names the value when one is active", async () => {
    const html = await render({});
    // `AdvancedFields` pushes itself open on an active setting, and its
    // summary line carries the label and the value — collapsed AND silent is
    // not allowed.
    expect(html).toContain("<details open");
    expect(html).toContain(`${D.tradeInLabel} 100.000.000 ${D.tradeInUnit}`);
    expect(html).not.toContain(D.tradeInGroupEmpty);
  });

  it("collapses the trade-in disclosure when nothing is traded in", async () => {
    const html = await render({ defaultTradeIn: "0" });
    expect(html).toContain(D.tradeInGroupEmpty);
    expect(html).not.toContain("<details open");
  });

  it("says the essentials are unknown when the box is blank", async () => {
    const html = await render({ defaultEssentials: "" });
    expect(html).toContain(D.budgetLimitedNotice);
    expect(html).not.toContain(D.essentialsInvalid);
  });

  it("names the shortfall when the instalment breaks the month", async () => {
    const html = await render({ defaultNetIncome: "30.000.000" });
    expect(html).toContain(D.shortfallNotice);
    expect(html).not.toContain(D.shortfallBeforeNotice);
    expect(html).toContain("6.498.818");
  });

  it("withholds the with-car rows, with a recovery, for an invalid rate", async () => {
    // The live defect: rate −1 rendered "12.000.000" twice and a 0 ₫ gap.
    const html = await render({ defaultRate: "-1" });
    expect(html).toContain(D.paymentUnknownNotice);
    // The without-car figure survives; the with-car one is the placeholder.
    expect(html).toContain("12.000.000");
    expect(html).not.toContain("3.501.182");
    // The chart withholds itself with its own reason, rather than drawing a
    // confident zero-gap comparison.
    expect(html).toContain(AUTO_LOAN.chart.unknownReason);
    expect(html).toContain(AUTO_LOAN.chart.unknownRecovery);
    // Neither summary sentence is rendered: the distinctive tail of each is
    // absent, so no "gap" claim survives. (A leading fragment would also
    // match the net-income FIELD label, which is not what this is about.)
    expect(html).not.toContain("Khoảng cách đúng bằng chi phí xe mỗi tháng");
    expect(html).not.toContain("thanh tiền ra dài hơn thanh thu nhập");
  });

  it("does not show the unknown recovery once the rate is valid", async () => {
    const html = await render({});
    expect(html).not.toContain(D.paymentUnknownNotice);
    expect(html).not.toContain(AUTO_LOAN.chart.unknownReason);
  });
});

describe("AutoLoanCalculator — the example state is stated, not implied", () => {
  it("renders the example badge on arrival", async () => {
    // Four prefilled household figures with no badge is a page claiming to
    // have analysed a household it knows nothing about.
    const html = await render({});
    expect(html).toContain(TOOL_SHELL.example.badge);
    expect(html).toContain(TOOL_SHELL.example.note);
    expect(html).toContain(TOOL_SHELL.example.detailTitle);
  });

  it("no longer tells the reader the prefilled figures are theirs", async () => {
    const html = await render({});
    // The exact sentence an independent review found on the live page.
    expect(html).not.toContain("là của bạn, không phải giả định");
    // Its replacement says what the state actually is.
    expect(html).toContain("đang điền sẵn một ví dụ");
  });

  it("keeps the chart's own assumptions honest about the prefills", async () => {
    const html = await render({});
    expect(html).toContain(AUTO_LOAN.chart.assumptions[0]);
    expect(AUTO_LOAN.chart.assumptions[0]).toContain("ví dụ");
    // And no assumption claims the numbers are the reader's own.
    for (const assumption of AUTO_LOAN.chart.assumptions) {
      expect(assumption).not.toContain("Mọi con số là của bạn");
    }
  });
});

describe("AutoLoanCalculator — the repayment table is readable on a phone", () => {
  it("passes RAW typed amounts, so the table owns both precisions", async () => {
    const html = await render({});
    // The unit line only exists when the table received money CELLS; with
    // pre-formatted strings there is no unit, no compact reading and no
    // switch — which is what a 390 px measurement found.
    expect(html).toContain(TABLE_UI.units.trieu);
    expect(html).toContain(TABLE_UI.exactToggle);
    // Year 1's interest on this loan is 37.078.567 ₫ — the sum of the first
    // twelve months' interest, amortized independently of the module (400
    // triệu, 0,10/12 per month, 60 months). Its compact reading in triệu at
    // one decimal place is "37,1". BOTH are in the markup: one control
    // switches between them and both come from the same raw number.
    expect(html).toContain("37,1");
    expect(html).toContain("37.078.567");
  });

  it("does not scale the year number as though it were money", async () => {
    // `countCell`, not `moneyCell`: a year is 1, not 0,000001 triệu. Dividing
    // a count by a million is the mirror image of the 1000× defect class.
    const html = await render({});
    expect(html).toContain(TABLE_UI.units.trieu);
    expect(html).not.toContain("0,000001");
  });
});
