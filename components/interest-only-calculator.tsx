"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computeInterestOnly } from "@/lib/calc/loan-variants";
import { INTEREST_ONLY as C } from "@/content/calculators/interest-only";

/**
 * An interest-only opening phase, then principal repayment over what is left.
 *
 * The result the page exists to surface is `paymentIncrease` — how far the
 * instalment jumps when the phase ends — so it sits directly under the two
 * payment figures it is the difference between.
 */
export function InterestOnlyCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
    io: C.form.defaultIo,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const io = parseDecimal(fields.values.io);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0;

  const termMonths =
    term === null
      ? null
      : Math.round(fields.values.termUnit === "years" ? term * 12 : term);

  // The interest-only phase must be a whole number of months shorter than the
  // term, so its validity depends on the term as well as its own value.
  const ioInvalid =
    io === null ||
    io < 0 ||
    !Number.isInteger(io) ||
    termMonths === null ||
    io >= termMonths;

  const result =
    amountInvalid || rateInvalid || termInvalid || ioInvalid || termMonths === null
      ? null
      : computeInterestOnly({
          amount,
          annualRatePercent: rate,
          termMonths,
          interestOnlyMonths: io,
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
        <NumberField
          {...fields.bind("io")}
          label={C.form.ioLabel}
          unit={C.form.ioUnit}
          help={C.form.ioHelp}
          error={C.form.ioInvalid}
          invalid={ioInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.ioPaymentLabel}
          value={money(result?.interestOnlyPayment)}
        />
        <ResultRow
          label={C.form.amortizingPaymentLabel}
          value={money(result?.amortizingPayment)}
        />
        <ResultRow
          label={C.form.increaseLabel}
          value={money(result?.paymentIncrease)}
        />
        <ResultRow
          label={C.form.ioPhaseInterestLabel}
          value={money(result?.interestOnlyPhaseInterest)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.totalInterest)}
        />
        <ResultRow
          label={C.form.comparableLabel}
          value={money(result?.comparableTotalInterest)}
        />
        <ResultRow
          label={C.form.extraInterestLabel}
          value={money(result?.extraInterest)}
        />
      </ResultGroup>
    </CalculatorCard>
  );
}
