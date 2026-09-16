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

      {/* ONE live group, and it holds the four rows the reader came for. It
          used to hold all eight, which docs §4 names as the same failure mode
          a live table is — eight rows re-announced on every keystroke. The
          other two groups are `live={false}`, which is the shape
          `live-region.test.ts`'s own header comment says to copy. */}
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
          label={C.form.savingLabel}
          value={money(result?.interestSaving)}
        />
        <ResultRow
          label={C.form.monthsSavedLabel}
          value={
            result
              ? `${formatDecimal(result.monthsSaved, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      {/* The decomposition. This is the page's actual answer: the saving is
          overwhelmingly the extra instalment, not the fortnightly schedule.
          Not live — it is an explanation of the figure above, not a second
          figure the reader is typing towards. */}
      <ResultGroup title={C.form.splitTitle} live={false} className="mt-6">
        <ResultRow
          label={C.form.extraPaymentSavingLabel}
          value={money(result?.split?.extraPaymentSaving)}
        />
        <ResultRow
          label={C.form.frequencySavingLabel}
          value={money(result?.split?.frequencySaving)}
        />
        <ResultRow
          label={C.form.samePaymentLabel}
          value={money(result?.split?.samePayment)}
        />
        <ResultRow
          label={C.form.sameInterestLabel}
          value={money(result?.split?.sameTotalInterest)}
        />
        {/* A null split is "could not be computed", never "both causes are
            worth zero" — so the reason is on the page rather than left as
            four dashes. Only shown when there IS a result to split. */}
        {result !== null && result.split === null ? (
          <p className="border-t border-ink-4/20 pt-3 text-sm leading-relaxed text-ink-2">
            {C.form.splitUnavailable}
          </p>
        ) : null}
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} live={false} className="mt-6">
        <ResultRow
          label={C.form.monthlyInterestLabel}
          value={money(result?.monthlyTotalInterest)}
        />
        <ResultRow
          label={C.form.biweeklyInterestLabel}
          value={money(result?.biweeklyTotalInterest)}
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
