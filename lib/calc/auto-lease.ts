/**
 * Vehicle leasing for /cong-cu/thue-mua-xe/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `auto-lease.test.ts`.
 *
 * A lease payment is NOT a loan payment on a smaller amount. It is two
 * separate charges added together, and they behave differently:
 *
 *   depreciation = (capitalised cost − residual) ÷ months
 *   finance      = (capitalised cost + residual) × money factor
 *
 * The depreciation half pays for the value the vehicle loses while you have
 * it. The finance half is rent on the lessor's capital — and it is charged on
 * the SUM of the opening and closing values, not on a declining balance,
 * because on average over the term that is what is outstanding. That sum is
 * why a lease on a car with a high residual can still carry a large finance
 * charge, and why modelling a lease as a loan understates it.
 *
 * `moneyFactor` is the lease industry's rate unit and equals
 * `annualRatePercent / 2400`. The 2400 is 12 months × 200, the 200 coming
 * from the "sum of values" convention standing in for twice the average
 * balance. This module takes a plain annual percentage and converts, because
 * nobody outside the trade thinks in money factors.
 *
 * VAT is charged on each monthly payment rather than on the vehicle price,
 * which is the substantive difference between leasing and buying for tax
 * purposes.
 */

export type AutoLeaseInput = {
  /** Negotiated price of the vehicle, in đồng. */
  price: number;
  /** Cash paid up front, reducing the amount capitalised. */
  downPayment?: number;
  /** Allowance for a vehicle traded in, also reducing the capitalised cost. */
  tradeIn?: number;
  /** Fees rolled INTO the lease rather than paid up front. */
  capitalisedFees?: number;
  /** Agreed value at the end of the lease, in đồng. */
  residualValue: number;
  /** Lease term in months. */
  termMonths: number;
  /** Nominal annual rate in percent; converted to a money factor internally. */
  annualRatePercent: number;
  /** VAT on each monthly payment, in percent. */
  taxPercent?: number;
};

export type AutoLeaseResult = {
  /** Price less deposit and trade-in, plus any capitalised fees. */
  capitalisedCost: number;
  /** The lease industry's rate unit: `annualRatePercent / 2400`. */
  moneyFactor: number;
  /** The part of the payment that buys the value lost. */
  depreciationCharge: number;
  /** The part of the payment that is rent on the lessor's capital. */
  financeCharge: number;
  /** Depreciation + finance, before tax. */
  monthlyPaymentBeforeTax: number;
  /** VAT on one monthly payment. */
  monthlyTax: number;
  /** What actually leaves the account each month. */
  monthlyPayment: number;
  /** Every monthly payment added up, tax included. */
  totalOfPayments: number;
  /** Payments plus the cash and trade-in put in at the start. */
  totalCost: number;
  /** Value lost over the term: `capitalisedCost − residualValue`. */
  totalDepreciation: number;
  /** Finance charges over the term, before tax. */
  totalFinanceCharge: number;
  /** Residual as a share of the price, in percent. */
  residualPercent: number;
};

/**
 * Price a vehicle lease.
 *
 * Null when the inputs cannot describe one: a non-positive price or term, a
 * negative amount or rate, a non-integer number of months, a residual above
 * the capitalised cost (the vehicle would have to gain value, and the
 * depreciation charge would come out negative), or any non-finite number.
 */
export function computeAutoLease(
  input: AutoLeaseInput,
): AutoLeaseResult | null {
  const {
    price,
    downPayment = 0,
    tradeIn = 0,
    capitalisedFees = 0,
    residualValue,
    termMonths,
    annualRatePercent,
    taxPercent = 0,
  } = input;

  const numbers = [
    price,
    downPayment,
    tradeIn,
    capitalisedFees,
    residualValue,
    termMonths,
    annualRatePercent,
    taxPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (price <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;

  const capitalisedCost = price - downPayment - tradeIn + capitalisedFees;
  if (capitalisedCost <= 0) return null;
  // A residual above the capitalised cost would mean the vehicle appreciates,
  // and would produce a negative depreciation charge. Reject, don't clamp.
  if (residualValue > capitalisedCost) return null;

  // annualRatePercent / 2400 — see the module note on where 2400 comes from.
  const moneyFactor = annualRatePercent / 2400;

  const depreciationCharge = (capitalisedCost - residualValue) / termMonths;
  // Charged on the SUM of opening and closing values, not a declining balance.
  const financeCharge = (capitalisedCost + residualValue) * moneyFactor;

  const monthlyPaymentBeforeTax = depreciationCharge + financeCharge;
  const monthlyTax = monthlyPaymentBeforeTax * (taxPercent / 100);
  const monthlyPayment = monthlyPaymentBeforeTax + monthlyTax;

  const totalOfPayments = monthlyPayment * termMonths;

  return {
    capitalisedCost,
    moneyFactor,
    depreciationCharge,
    financeCharge,
    monthlyPaymentBeforeTax,
    monthlyTax,
    monthlyPayment,
    totalOfPayments,
    totalCost: totalOfPayments + downPayment + tradeIn,
    totalDepreciation: capitalisedCost - residualValue,
    totalFinanceCharge: financeCharge * termMonths,
    residualPercent: (residualValue / price) * 100,
  };
}
