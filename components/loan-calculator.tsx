"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeLoan, yearlySummary, type PmiMode } from "@/lib/calc/loan";
import { LOAN as C } from "@/content/calculators/loan";

/**
 * The loan / mortgage calculator.
 *
 * All eleven inputs are held as raw strings by `useCalcFields` and parsed at
 * render time, so a half-typed "2.000.000." survives in the field. Money
 * fields use `parseMoney` (where "." groups thousands) and rate fields use
 * `parseDecimal` (where "," is the decimal mark) — the two grammars are
 * genuinely different and mixing them turns 500.000 into 500.
 *
 * The yearly schedule sits OUTSIDE the results live region: a 20-year loan is
 * 20 rows and a 30-year one is 30, and announcing them on every keystroke
 * would make the page unusable with a screen reader.
 */
export function LoanCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
    extra: C.form.defaultExtra,
    tax: "0",
    insurance: "0",
    otherFee: "0",
    pmi: "0",
    price: "",
    pmiMode: C.form.defaultPmiMode,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const extra = parseMoney(fields.values.extra);
  const tax = parseMoney(fields.values.tax);
  const insurance = parseMoney(fields.values.insurance);
  const otherFee = parseMoney(fields.values.otherFee);
  const pmi = parseDecimal(fields.values.pmi);
  const price = parseMoney(fields.values.price);

  const termMonths =
    term === null
      ? null
      : fields.values.termUnit === "years"
        ? Math.round(term * 12)
        : Math.round(term);

  // Per-field validity, so each field can show its own message rather than one
  // banner for the whole form.
  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;
  const extraInvalid = extra === null || extra < 0;
  const taxInvalid = tax === null || tax < 0;
  const insuranceInvalid = insurance === null || insurance < 0;
  const otherFeeInvalid = otherFee === null || otherFee < 0;
  const pmiInvalid = pmi === null || pmi < 0;

  const result =
    amountInvalid ||
    rateInvalid ||
    termInvalid ||
    extraInvalid ||
    taxInvalid ||
    insuranceInvalid ||
    otherFeeInvalid ||
    pmiInvalid ||
    termMonths === null
      ? null
      : computeLoan({
          amount,
          annualRatePercent: rate,
          termMonths,
          extraPerMonth: extra,
          propertyTaxPerYear: tax,
          insurancePerYear: insurance,
          otherFeePerYear: otherFee,
          pmiPercent: pmi,
          pmiMode: fields.values.pmiMode as PmiMode,
          propertyPrice: price ?? undefined,
        });

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;
  const months = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${formatDecimal(value, 0)} ${C.form.monthsUnit}`;

  const tableRows = result
    ? yearlySummary(result.schedule).map((year) => [
        formatDecimal(year.year, 0),
        formatMoney(year.interest),
        formatMoney(year.principal),
        formatMoney(year.balance),
      ])
    : [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.loanGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
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
        <NumberField
          {...fields.bind("extra")}
          label={C.form.extraLabel}
          unit={C.form.extraUnit}
          help={C.form.extraHelp}
          error={C.form.extraInvalid}
          invalid={extraInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.costGroup} className="mt-8">
        <NumberField
          {...fields.bind("tax")}
          label={C.form.taxLabel}
          unit={C.form.taxUnit}
          help={C.form.taxHelp}
          error={C.form.costInvalid}
          invalid={taxInvalid}
        />
        <NumberField
          {...fields.bind("insurance")}
          label={C.form.insuranceLabel}
          unit={C.form.insuranceUnit}
          help={C.form.insuranceHelp}
          error={C.form.costInvalid}
          invalid={insuranceInvalid}
        />
        <NumberField
          {...fields.bind("otherFee")}
          label={C.form.otherFeeLabel}
          unit={C.form.otherFeeUnit}
          help={C.form.otherFeeHelp}
          error={C.form.costInvalid}
          invalid={otherFeeInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.pmiGroup} className="mt-8">
        <p className="text-sm leading-relaxed text-ink-3">{C.pmiNotice}</p>
        <NumberField
          {...fields.bind("pmi")}
          label={C.form.pmiLabel}
          unit={C.form.pmiUnit}
          help={C.form.pmiHelp}
          error={C.form.pmiInvalid}
          invalid={pmiInvalid}
        />
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
        />
        <RadioGroupField
          {...fields.bind("pmiMode")}
          legend={C.form.pmiModeLegend}
          options={[
            { value: "until80", label: C.form.pmiModeUntil80 },
            { value: "life", label: C.form.pmiModeLife },
          ]}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyPaymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.principalInterestLabel}
          value={money(result?.monthlyPrincipalInterest)}
        />
        <ResultRow
          label={C.form.escrowLabel}
          value={money(result?.monthlyEscrow)}
        />
        <ResultRow
          label={C.form.pmiMonthlyLabel}
          value={money(result?.monthlyPmi)}
        />
        <ResultRow
          label={C.form.annualPaymentLabel}
          value={money(result?.annualPayment)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.totalPaymentLabel}
          value={money(result?.totalPayment)}
        />
        <ResultRow
          label={C.form.mortgageConstantLabel}
          value={
            result ? `${formatDecimal(result.mortgageConstant * 100)}%` : null
          }
        />
        <ResultRow
          label={C.form.termResultLabel}
          value={months(result?.months)}
        />
      </ResultGroup>

      {result?.interestSaving != null ? (
        <ResultGroup title={C.form.extraResultTitle} className="mt-6">
          <ResultRow
            label={C.form.interestSavingLabel}
            value={money(result.interestSaving)}
          />
          <ResultRow
            label={C.form.monthsSavedLabel}
            value={months(result.monthsSaved)}
          />
        </ResultGroup>
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
