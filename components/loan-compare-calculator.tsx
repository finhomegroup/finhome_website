"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  compareLoans,
  type LoanComparisonRow,
  type LoanOption,
} from "@/lib/calc/loan-compare";
import { LOAN_COMPARE as C } from "@/content/calculators/loan-compare";

/** Field keys for one option column. Three of these make up the form. */
const OPTION_KEYS = [
  { rate: "rateA", term: "termA", fee: "feeA" },
  { rate: "rateB", term: "termB", fee: "feeB" },
  { rate: "rateC", term: "termC", fee: "feeC" },
] as const;

/**
 * A field that is allowed to be left empty.
 *
 * Empty is "I am not using this option" and must not read as an error, while
 * a value that cannot be parsed — or a negative one — must. Collapsing the
 * two would either nag a user who only has two quotes, or silently drop a
 * column they typed a typo into.
 */
type OptionalNumber = {
  /** Parsed value, or null when empty or unparseable. */
  value: number | null;
  /** True only for a non-empty value that cannot be used. */
  invalid: boolean;
};

function optionalDecimal(raw: string): OptionalNumber {
  if (raw.trim() === "") return { value: null, invalid: false };
  const parsed = parseDecimal(raw);
  if (parsed === null || parsed < 0) return { value: null, invalid: true };
  return { value: parsed, invalid: false };
}

export function LoanCompareCalculator() {
  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rateA: C.form.defaults[0].rate,
    termA: C.form.defaults[0].term,
    feeA: C.form.defaults[0].fee,
    rateB: C.form.defaults[1].rate,
    termB: C.form.defaults[1].term,
    feeB: C.form.defaults[1].fee,
    rateC: C.form.defaults[2].rate,
    termC: C.form.defaults[2].term,
    feeC: C.form.defaults[2].fee,
  });

  const amount = parseMoney(fields.values.amount);
  const amountInvalid = amount === null || amount <= 0;

  const parsed = OPTION_KEYS.map((keys) => ({
    rate: optionalDecimal(fields.values[keys.rate]),
    term: optionalDecimal(fields.values[keys.term]),
    fee: optionalDecimal(fields.values[keys.fee]),
  }));

  // An option enters the comparison only with both a rate and a term; -1 and 0
  // are values `compareLoans` rejects, so a missing one comes back as a null
  // row rather than as a default that would price a loan nobody was offered.
  // A blank fee is the exception and means 0 — the common case, and the safer
  // reading of an empty box than dropping the whole column.
  //
  // Terms are entered in years and rounded to whole months, because that is
  // what a schedule can amortize over.
  const options: LoanOption[] = parsed.map((option) => ({
    annualRatePercent: option.rate.value ?? -1,
    termMonths:
      option.term.value === null ? 0 : Math.round(option.term.value * 12),
    feePercent: option.fee.value ?? 0,
  }));

  const result = amountInvalid
    ? null
    : compareLoans({ amount, options });

  const money = (value: number) => `${formatMoney(value)} ₫`;

  /** One table row: a metric label followed by that metric per option. */
  const metricRow = (
    label: string,
    cell: (row: LoanComparisonRow) => string,
  ): (string | null)[] => [
    label,
    ...(result?.rows ?? [null, null, null]).map((row) =>
      row === null ? null : cell(row),
    ),
  ];

  const tableRows: (string | null)[][] = result
    ? [
        metricRow(C.table.rows.monthly, (row) => money(row.monthlyPayment)),
        metricRow(C.table.rows.months, (row) => formatDecimal(row.months, 0)),
        metricRow(C.table.rows.totalInterest, (row) =>
          money(row.totalInterest),
        ),
        metricRow(C.table.rows.fee, (row) => money(row.upfrontFee)),
        metricRow(C.table.rows.costOfBorrowing, (row) =>
          money(row.costOfBorrowing),
        ),
        metricRow(C.table.rows.totalOutlay, (row) => money(row.totalOutlay)),
        metricRow(C.table.rows.extraVsBest, (row) => money(row.extraVsBest)),
      ]
    : [];

  const bestLabel =
    result === null ? null : C.form.optionLabels[result.bestIndex];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.amountGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
      </FieldGroup>

      {OPTION_KEYS.map((keys, index) => (
        <FieldGroup
          key={keys.rate}
          title={C.form.optionLabels[index]}
          className="mt-8"
        >
          <NumberField
            {...fields.bind(keys.rate)}
            label={C.form.rateLabel}
            unit={C.form.rateUnit}
            help={C.form.rateHelp}
            error={C.form.rateInvalid}
            invalid={parsed[index].rate.invalid}
          />
          <NumberField
            {...fields.bind(keys.term)}
            label={C.form.termLabel}
            unit={C.form.termUnit}
            help={C.form.termHelp}
            error={C.form.termInvalid}
            invalid={parsed[index].term.invalid}
          />
          <NumberField
            {...fields.bind(keys.fee)}
            label={C.form.feeLabel}
            unit={C.form.feeUnit}
            help={C.form.feeHelp}
            error={C.form.feeInvalid}
            invalid={parsed[index].fee.invalid}
          />
        </FieldGroup>
      ))}

      {/* The only live region on the page: two rows a screen reader can hear
          re-announced on every keystroke. The comparison table below carries
          21 cells and is deliberately not live. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.bestLabel} value={bestLabel} />
        <ResultRow
          label={C.form.spreadLabel}
          value={result === null ? null : money(result.spread)}
        />
      </ResultGroup>

      {result === null && !amountInvalid ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.tooFewNotice}
        </p>
      ) : null}

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.metricColumn },
            ...C.form.optionLabels.map((label) => ({
              label,
              numeric: true,
            })),
          ]}
          rows={tableRows}
        />
      ) : null}
    </CalculatorCard>
  );
}
