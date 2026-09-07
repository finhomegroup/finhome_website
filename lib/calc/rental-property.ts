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
 * The Vietnamese tax rule is built in rather than left to the user: an
 * individual letting property pays 5% VAT plus 5% personal income tax on
 * GROSS rental revenue — 10% in total — once revenue exceeds the annual
 * threshold, and nothing at all below it. It is a turnover tax, not a profit
 * tax, so it is charged whether or not the property makes money. Defaults
 * reflect that; the threshold is an input because it has been revised.
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
  /** Combined VAT + PIT rate on gross rental revenue, in percent. */
  rentalTaxPercent?: number;
  /** Annual revenue below which no rental tax is due, in đồng. */
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
  /** Rental tax for the year. 0 below the threshold. */
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
    rentalTaxPercent = 10,
    taxThresholdPerYear = 100_000_000,
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
    rentalTaxPercent,
    taxThresholdPerYear,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (price <= 0) return null;
  if (vacancyPercent > 100 || rentalTaxPercent > 100) return null;
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

  // A TURNOVER tax on gross revenue, charged only above the threshold, and
  // charged whether or not the property is profitable. Assessed on the rent
  // actually collected.
  const taxable = effectiveRentPerYear > taxThresholdPerYear;
  const rentalTaxPerYear = taxable
    ? effectiveRentPerYear * (rentalTaxPercent / 100)
    : 0;

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
