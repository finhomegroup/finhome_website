"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import {
  computeUsPayroll,
  PAYROLL_YEAR_ORDER,
  type FilingStatus,
} from "@/lib/calc/us-payroll";
import { US_PAYROLL_TAX as C } from "@/content/calculators/us-payroll-tax";

const F = C.form;

const STATUS_OPTIONS: readonly { value: FilingStatus; label: string }[] = [
  { value: "single", label: F.statusOptions.single },
  { value: "married", label: F.statusOptions.married },
  { value: "marriedSeparate", label: F.statusOptions.marriedSeparate },
  { value: "head", label: F.statusOptions.head },
];

const YEAR_OPTIONS = PAYROLL_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

const EMPLOYMENT_OPTIONS = [
  { value: "employee", label: F.employmentOptions.employee },
  { value: "selfEmployed", label: F.employmentOptions.selfEmployed },
];

/** USD carries cents, unlike every other page in the suite. */
function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsPayrollTaxCalculator() {
  const fields = useCalcFields(F.defaults);

  const wages = parseMoney(fields.values.wages);
  const wagesInvalid = wages === null || wages < 0;

  const result = wagesInvalid
    ? null
    : computeUsPayroll({
        wages,
        filingStatus: fields.values.status as FilingStatus,
        year: Number(fields.values.year),
        selfEmployed: fields.values.employment === "selfEmployed",
      });

  const selfEmployed = fields.values.employment === "selfEmployed";

  return (
    <CalculatorCard>
      <FieldGroup title={F.wageGroup}>
        <NumberField
          {...fields.bind("wages")}
          label={F.wagesLabel}
          unit={F.wagesUnit}
          help={F.wagesHelp}
          error={F.wagesInvalid}
          invalid={wagesInvalid}
        />
        <SelectField
          {...fields.bind("status")}
          label={F.statusLabel}
          help={F.statusHelp}
          options={STATUS_OPTIONS}
        />
        <SelectField
          {...fields.bind("employment")}
          label={F.employmentLabel}
          help={F.employmentHelp}
          options={EMPLOYMENT_OPTIONS}
        />
        <SelectField
          {...fields.bind("year")}
          label={F.yearLabel}
          help={F.yearHelp}
          options={YEAR_OPTIONS}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.employeeTotalLabel}
          value={result === null ? null : usd(result.employeeTotal)}
        />
        <ResultRow
          label={F.effectiveRateLabel}
          value={
            result === null || result.effectiveRatePercent === null
              ? null
              : formatPercent(result.effectiveRatePercent, 2)
          }
        />
        <ResultRow
          label={F.marginalRateLabel}
          value={
            result === null
              ? null
              : formatPercent(result.marginalRatePercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.breakdownTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.socialSecurityWagesLabel}
          value={result === null ? null : usd(result.socialSecurityWages)}
        />
        <ResultRow
          label={F.socialSecurityLabel}
          value={result === null ? null : usd(result.socialSecurityTax)}
        />
        <ResultRow
          label={F.medicareLabel}
          value={result === null ? null : usd(result.medicareTax)}
        />
        <ResultRow
          label={F.additionalWagesLabel}
          value={
            result === null ? null : usd(result.additionalMedicareWages)
          }
        />
        <ResultRow
          label={F.additionalLabel}
          value={result === null ? null : usd(result.additionalMedicareTax)}
        />
        <ResultRow
          label={F.employerLabel}
          value={result === null ? null : usd(result.employerTotal)}
        />
        <ResultRow
          label={F.combinedLabel}
          value={result === null ? null : usd(result.combinedTotal)}
        />
        <ResultRow
          label={F.wageBaseLabel}
          value={
            result === null
              ? null
              : `${formatMoney(result.params.socialSecurityWageBase)} USD`
          }
        />
        <ResultRow
          label={F.thresholdLabel}
          value={
            result === null
              ? null
              : `${formatMoney(
                  result.params.additionalMedicareThreshold[
                    fields.values.status as FilingStatus
                  ],
                )} USD`
          }
        />
        <ResultRow
          label={F.cappedSavingLabel}
          value={result === null ? null : usd(result.cappedSaving)}
        />
      </ResultGroup>

      {result?.aboveWageBase ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.aboveBaseNotice}
        </p>
      ) : null}

      {selfEmployed ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.selfEmployedNotice}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
