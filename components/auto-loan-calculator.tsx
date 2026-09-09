"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeAutoLoan, type AutoLoanResult } from "@/lib/calc/auto-loan";
import { yearlySummary } from "@/lib/calc/loan";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";

/** The form's raw values, exactly as `useCalcFields` keeps them: strings. */
export type AutoLoanFormValues = {
  price: string;
  down: string;
  tradeIn: string;
  rate: string;
  /** "years" or "months"; anything else is read as months. */
  termUnit: string;
  term: string;
};

/** Everything the page derives from those strings. */
export type AutoLoanFormState = {
  priceInvalid: boolean;
  downInvalid: boolean;
  tradeInInvalid: boolean;
  rateInvalid: boolean;
  termInvalid: boolean;
  /** The entered term as whole months; null when the term does not parse. */
  termMonths: number | null;
  result: AutoLoanResult | null;
  /** True when the note replaces the blank rows, rather than a field error. */
  nothingToFinance: boolean;
  /** Deposit + trade-in + every loan payment. Null without a loan. */
  totalCost: number | null;
};

/**
 * Parse the form, decide which fields are invalid, and compute the loan.
 *
 * Pure and exported so the field gates can be pinned without a DOM — see
 * `auto-loan-calculator.test.ts`. `lib/calc/auto-loan.test.ts` covers only the
 * lib contract (`termMonths` of 0 or 60,5 gives null); it cannot say WHICH
 * field the page blames for that null, which is where both bugs below lived.
 */
export function autoLoanFormState(
  values: AutoLoanFormValues,
): AutoLoanFormState {
  const price = parseMoney(values.price);
  const down = parseMoney(values.down);
  const tradeIn = parseMoney(values.tradeIn);
  const rate = parseDecimal(values.rate);
  const term = parseDecimal(values.term);

  const priceInvalid = price === null || price <= 0;
  const downInvalid = down === null || down < 0;
  const tradeInInvalid = tradeIn === null || tradeIn < 0;
  const rateInvalid = rate === null || rate < 0;

  const termMonths =
    term === null
      ? null
      : Math.round(values.termUnit === "years" ? term * 12 : term);

  // Gate the DERIVED month count, not only the entered term: `Math.round(0,4)`
  // is 0 and `computeLoan` rejects `termMonths <= 0`, so any 0 < term < 0,5
  // tháng (or < 1/24 năm) used to pass this flag and come back as a null the
  // page then blamed on the deposit. A non-integer term stays legal on
  // purpose — 5,5 năm is 66 months, a real loan — which is why this gates
  // `termMonths`, not `Number.isInteger(term)`.
  const termInvalid =
    term === null || term <= 0 || termMonths === null || termMonths < 1;

  const fieldsUsable =
    !priceInvalid &&
    !downInvalid &&
    !tradeInInvalid &&
    !rateInvalid &&
    !termInvalid;

  const result = fieldsUsable
    ? computeAutoLoan({
        price,
        downPayment: down,
        tradeIn,
        annualRatePercent: rate,
        termMonths,
      })
    : null;

  // Every field is valid on its own, but the deposit and trade-in cover the
  // price — nothing to finance. That is a note, not a field error. The cause
  // is checked explicitly: a null from any OTHER source blanks the rows
  // silently, as every sibling calculator does, rather than printing advice
  // ("giảm tiền trả trước") that cannot help.
  const nothingToFinance =
    fieldsUsable && result === null && price - down - tradeIn <= 0;

  // What the car really costs: what the buyer hands over, plus every loan payment.
  const totalCost =
    result && down !== null && tradeIn !== null
      ? down + tradeIn + result.loan.totalPrincipalInterest
      : null;

  return {
    priceInvalid,
    downInvalid,
    tradeInInvalid,
    rateInvalid,
    termInvalid,
    termMonths,
    result,
    nothingToFinance,
    totalCost,
  };
}

/**
 * The vehicle loan calculator.
 *
 * The amount borrowed is derived (price less deposit less trade-in) rather
 * than entered, which is the one thing that makes this different from the
 * mortgage calculator. `computeAutoLoan` owns that derivation so it is tested;
 * `autoLoanFormState` above owns the parsing and the field gates for the same
 * reason. This function is only the wiring.
 */
export function AutoLoanCalculator() {
  const fields = useCalcFields({
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    tradeIn: C.form.defaultTradeIn,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
  });

  const {
    priceInvalid,
    downInvalid,
    tradeInInvalid,
    rateInvalid,
    termInvalid,
    result,
    nothingToFinance,
    totalCost,
  } = autoLoanFormState(fields.values);

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;

  const tableRows = result
    ? yearlySummary(result.loan.schedule).map((year) => [
        formatDecimal(year.year, 0),
        formatMoney(year.interest),
        formatMoney(year.principal),
        formatMoney(year.balance),
      ])
    : [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.vehicleGroup}>
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={downInvalid}
        />
        <NumberField
          {...fields.bind("tradeIn")}
          label={C.form.tradeInLabel}
          unit={C.form.tradeInUnit}
          help={C.form.tradeInHelp}
          error={C.form.tradeInInvalid}
          invalid={tradeInInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.loanGroup} className="mt-8">
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
        <SelectField
          {...fields.bind("termUnit")}
          label={C.form.termUnitLabel}
          options={[
            { value: "years", label: C.form.termUnitYears },
            { value: "months", label: C.form.termUnitMonths },
          ]}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.financedLabel}
          value={money(result?.amountFinanced)}
        />
        <ResultRow
          label={C.form.downPercentLabel}
          value={result ? formatPercent(result.downPaymentPercent, 1) : null}
        />
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.loan.monthlyPrincipalInterest)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.loan.totalInterest)}
        />
        <ResultRow
          label={C.form.totalPaymentLabel}
          value={money(result?.loan.totalPrincipalInterest)}
        />
        <ResultRow label={C.form.totalCostLabel} value={money(totalCost)} />
        <ResultRow
          label={C.form.termResultLabel}
          value={
            result
              ? `${formatDecimal(result.loan.months, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      {nothingToFinance ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.nothingToFinanceNotice}
        </p>
      ) : null}

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.yearColumn },
            { label: C.table.interestColumn, numeric: true },
            { label: C.table.principalColumn, numeric: true },
            { label: C.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
