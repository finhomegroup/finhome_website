/**
 * Rental property returns for /cong-cu/bat-dong-san-cho-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `rental-property.test.ts`.
 *
 * Four different "yields" are in circulation and they answer four different
 * questions. Conflating them is how a flat that loses money every month gets
 * described as a 6% investment:
 *
 * - `grossYieldPercent` — rent ÷ price. Ignores everything. Only useful for
 *   a first screen across many listings.
 * - `capRatePercent` — net operating income ÷ price. Costs in, financing out.
 *   This is the property's own return, independent of how you paid for it,
 *   and it is the figure to compare two properties on.
 * - `cashOnCashPercent` — annual cash flow ÷ cash invested. Financing in.
 *   This is your return, and leverage can make it much higher than the cap
 *   rate — or negative while the cap rate is positive.
 * - `dscr` — net operating income ÷ debt service. Below 1 means the rent does
 *   not cover the loan and the shortfall comes out of your salary.
 *
 * The Vietnamese tax rule is built in rather than left to the user, and it is
 * TWO taxes on two different bases — which is why they are two inputs and two
 * result rows rather than one combined 10%:
 *
 * - **VAT (thuế GTGT), 5%** — charged on ALL of the revenue collected, once
 *   annual revenue passes the threshold. A cliff: nothing at or below the
 *   threshold, then 5% of the whole amount.
 * - **PIT (thuế TNCN), 5%** — charged only on the revenue ABOVE the
 *   threshold. The threshold is deducted before the rate applies, so this
 *   part is a taper.
 *
 * So at 900 triệu of collected rent against a 500 triệu threshold the bill is
 * 45 triệu of VAT plus 20 triệu of PIT — 65 triệu, not the 90 triệu a flat
 * 10% would give. Both are TURNOVER taxes, not profit taxes: they are charged
 * whether or not the property makes money.
 *
 * Threshold and both rates are inputs, not constants, because all three have
 * been revised more than once and this is a static page that cannot know the
 * current figures. Defaults follow the 500 triệu/năm threshold set by Luật
 * 149/2025/QH15 (VAT, in force 01/01/2026) and Luật Thuế TNCN 109/2025/QH15
 * (PIT, in force 01/07/2026). The copy tells the reader to check rather than
 * trust the prefill.
 */

import { computeLoan } from "@/lib/calc/loan";

export type RentalPropertyInput = {
  /** Purchase price, in đồng. */
  price: number;
  /** Cash deposit. The rest is borrowed. */
  downPayment?: number;
  /** One-off costs to buy: transfer tax, notary, agent, furnishing. */
  purchaseCosts?: number;
  /** Nominal annual rate on the loan, in percent. */
  annualRatePercent?: number;
  /** Loan term in months. Ignored when nothing is borrowed. */
  termMonths?: number;
  /** Rent per month at full occupancy, in đồng. */
  monthlyRent: number;
  /** Share of the year the property sits empty, in percent. */
  vacancyPercent?: number;
  /** Recurring costs per month: management, maintenance, insurance, sinking fund. */
  monthlyExpenses?: number;
  /**
   * VAT rate in percent. Charged on ALL collected revenue once the threshold
   * is passed, so the base is the whole amount — not just the excess.
   */
  vatPercent?: number;
  /**
   * Personal income tax rate in percent. Charged on the revenue ABOVE the
   * threshold only, because the threshold is deducted before the rate.
   */
  pitPercent?: number;
  /** Annual revenue at or below which no rental tax is due, in đồng. */
  taxThresholdPerYear?: number;
};

export type RentalPropertyResult = {
  /** Price less deposit: what is borrowed. 0 when paying cash. */
  loanAmount: number;
  /** Deposit plus one-off purchase costs — the money actually at risk. */
  cashInvested: number;
  /** Rent for a full year at full occupancy. */
  grossRentPerYear: number;
  /** Rent lost to vacancy over a year. */
  vacancyLossPerYear: number;
  /** Rent actually collected over a year. */
  effectiveRentPerYear: number;
  /** VAT for the year: the rate on ALL collected revenue. 0 below the threshold. */
  vatPerYear: number;
  /** PIT for the year: the rate on the revenue ABOVE the threshold only. */
  pitPerYear: number;
  /** VAT + PIT — the whole rental tax bill for the year. */
  rentalTaxPerYear: number;
  /** Whether the tax threshold was exceeded. */
  taxable: boolean;
  /** Recurring costs over a year. */
  expensesPerYear: number;
  /** Effective rent less tax and expenses. Excludes financing. */
  netOperatingIncomePerYear: number;
  /** Loan payments over a year. 0 when paying cash. */
  debtServicePerYear: number;
  /** Net operating income less debt service. Negative means a shortfall. */
  cashFlowPerYear: number;
  /** `cashFlowPerYear ÷ 12`. */
  cashFlowPerMonth: number;
  /** Rent ÷ price. The screening figure, and the least informative. */
  grossYieldPercent: number;
  /** Net operating income ÷ price. The property's own return. */
  capRatePercent: number;
  /** Cash flow ÷ cash invested. Your return. Null when nothing was invested. */
  cashOnCashPercent: number | null;
  /**
   * Net operating income ÷ debt service. Below 1 means the rent does not
   * cover the loan. Null when nothing is borrowed.
   */
  dscr: number | null;
  /** Monthly loan instalment. 0 when paying cash. */
  monthlyPayment: number;
};

/**
 * The prefilled Vietnamese rental-tax parameters.
 *
 * Exported so the copy can quote them and a test can assert the two agree —
 * this figure was prefilled at 100 triệu through two revisions
 * (100 → 200 → 500), and the copy kept saying 100 while the law did not.
 * See content/calculators/rental-property.test.ts.
 *
 * Numbers only: the statute names are user-facing text and belong in
 * content/. All three are INPUTS on the page, so a revision is a one-line
 * change here plus the copy the test forces you to update.
 */
export const VN_RENTAL_TAX_DEFAULTS = {
  /** Luật 149/2025/QH15 (GTGT, 01/01/2026); Luật Thuế TNCN 109/2025/QH15 (01/07/2026). */
  thresholdPerYear: 500_000_000,
  /** On ALL collected revenue once the threshold is passed — a cliff. */
  vatPercent: 5,
  /** On the revenue ABOVE the threshold only — a taper. */
  pitPercent: 5,
} as const;

/**
 * Assess a rental property.
 *
 * Null when the inputs cannot describe one: a non-positive price, a negative
 * amount or rate, a vacancy or tax rate outside 0–100, a deposit above the
 * price, a borrowed amount with no usable term, or any non-finite number.
 *
 * Never null merely because the numbers are bad news: a property that loses
 * money returns a negative cash flow and a negative cash-on-cash return,
 * which is the answer the user needs.
 */
export function computeRentalProperty(
  input: RentalPropertyInput,
): RentalPropertyResult | null {
  const {
    price,
    downPayment = 0,
    purchaseCosts = 0,
    annualRatePercent = 0,
    termMonths = 0,
    monthlyRent,
    vacancyPercent = 0,
    monthlyExpenses = 0,
    vatPercent = VN_RENTAL_TAX_DEFAULTS.vatPercent,
    pitPercent = VN_RENTAL_TAX_DEFAULTS.pitPercent,
    taxThresholdPerYear = VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
  } = input;

  const numbers = [
    price,
    downPayment,
    purchaseCosts,
    annualRatePercent,
    termMonths,
    monthlyRent,
    vacancyPercent,
    monthlyExpenses,
    vatPercent,
    pitPercent,
    taxThresholdPerYear,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (price <= 0) return null;
  if (vacancyPercent > 100 || vatPercent > 100 || pitPercent > 100) return null;
  if (downPayment > price) return null;

  const loanAmount = price - downPayment;

  // Financing is optional, but a loan with no term is not a loan.
  let monthlyPayment = 0;
  if (loanAmount > 0) {
    const loan = computeLoan({
      amount: loanAmount,
      annualRatePercent,
      termMonths,
    });
    if (loan === null) return null;
    monthlyPayment = loan.monthlyPrincipalInterest;
  }

  const grossRentPerYear = monthlyRent * 12;
  const vacancyLossPerYear = grossRentPerYear * (vacancyPercent / 100);
  const effectiveRentPerYear = grossRentPerYear - vacancyLossPerYear;

  // TURNOVER taxes on the rent actually collected, charged whether or not the
  // property is profitable — but on two different bases. VAT applies to the
  // WHOLE amount once the threshold is passed (a cliff); PIT applies only to
  // the part ABOVE it (a taper), because the threshold is deducted first.
  // Collapsing them into one combined rate overstates the bill by
  // `pitPercent` of the threshold at every revenue above it.
  const taxable = effectiveRentPerYear > taxThresholdPerYear;
  const vatPerYear = taxable ? effectiveRentPerYear * (vatPercent / 100) : 0;
  const pitPerYear = taxable
    ? (effectiveRentPerYear - taxThresholdPerYear) * (pitPercent / 100)
    : 0;
  const rentalTaxPerYear = vatPerYear + pitPerYear;

  const expensesPerYear = monthlyExpenses * 12;
  const netOperatingIncomePerYear =
    effectiveRentPerYear - rentalTaxPerYear - expensesPerYear;

  const debtServicePerYear = monthlyPayment * 12;
  const cashFlowPerYear = netOperatingIncomePerYear - debtServicePerYear;
  const cashInvested = downPayment + purchaseCosts;

  return {
    loanAmount,
    cashInvested,
    grossRentPerYear,
    vacancyLossPerYear,
    effectiveRentPerYear,
    vatPerYear,
    pitPerYear,
    rentalTaxPerYear,
    taxable,
    expensesPerYear,
    netOperatingIncomePerYear,
    debtServicePerYear,
    cashFlowPerYear,
    cashFlowPerMonth: cashFlowPerYear / 12,
    grossYieldPercent: (grossRentPerYear / price) * 100,
    capRatePercent: (netOperatingIncomePerYear / price) * 100,
    cashOnCashPercent:
      cashInvested > 0 ? (cashFlowPerYear / cashInvested) * 100 : null,
    dscr:
      debtServicePerYear > 0
        ? netOperatingIncomePerYear / debtServicePerYear
        : null,
    monthlyPayment,
  };
}
