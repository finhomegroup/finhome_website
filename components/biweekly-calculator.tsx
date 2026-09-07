"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeBiweekly } from "@/lib/calc/loan-variants";
import { BIWEEKLY as C } from "@/content/calculators/biweekly";

/** Paying half the monthly instalment every fortnight, against the monthly baseline. */
export function BiweeklyCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;

  const termMonths =
    term === null
      ? null
      : Math.round(fields.values.termUnit === "years" ? term * 12 : term);

  const result =
    amountInvalid || rateInvalid || termInvalid || termMonths === null
      ? null
      : computeBiweekly({
          amount,
          annualRatePercent: rate,
          termMonths,
        });

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;

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
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyPaymentLabel}
          value={money(result?.monthlyPayment)}
        />
        <ResultRow
          label={C.form.biweeklyPaymentLabel}
          value={money(result?.biweeklyPayment)}
        />
        <ResultRow
          label={C.form.monthlyInterestLabel}
          value={money(result?.monthlyTotalInterest)}
        />
        <ResultRow
          label={C.form.biweeklyInterestLabel}
          value={money(result?.biweeklyTotalInterest)}
        />
        <ResultRow
          label={C.form.savingLabel}
          value={money(result?.interestSaving)}
        />
        <ResultRow
          label={C.form.payoffLabel}
          value={
            result
              ? `${formatDecimal(result.biweeklyYears, 1)} ${C.form.payoffUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.monthsSavedLabel}
          value={
            result
              ? `${formatDecimal(result.monthsSaved, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.periodsLabel}
          value={
            result
              ? `${formatDecimal(result.biweeklyPeriods, 0)} ${C.form.periodsUnit}`
              : null
          }
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
