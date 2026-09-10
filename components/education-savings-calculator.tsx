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
import { computeEducationSavings } from "@/lib/calc/education-savings";
import { EDUCATION_SAVINGS as C } from "@/content/calculators/education-savings";

export function EducationSavingsCalculator() {
  const fields = useCalcFields({
    tuition: C.form.defaultTuition,
    inflation: C.form.defaultInflation,
    yearsUntil: C.form.defaultYearsUntil,
    yearsOfStudy: C.form.defaultYearsOfStudy,
    currentSavings: C.form.defaultCurrentSavings,
    returnRate: C.form.defaultReturn,
  });

  const tuition = parseMoney(fields.values.tuition);
  const inflation = parseDecimal(fields.values.inflation);
  const yearsUntil = parseDecimal(fields.values.yearsUntil);
  const yearsOfStudy = parseDecimal(fields.values.yearsOfStudy);
  const currentSavings = parseMoney(fields.values.currentSavings);
  const returnRate = parseDecimal(fields.values.returnRate);

  const tuitionInvalid = tuition === null || tuition <= 0;
  const inflationInvalid = inflation === null || inflation <= -100;
  const yearsUntilInvalid =
    yearsUntil === null || yearsUntil < 0 || !Number.isInteger(yearsUntil);
  const yearsOfStudyInvalid =
    yearsOfStudy === null ||
    yearsOfStudy <= 0 ||
    !Number.isInteger(yearsOfStudy);
  const currentSavingsInvalid = currentSavings === null || currentSavings < 0;
  const returnInvalid = returnRate === null || returnRate <= -100;

  const result =
    tuitionInvalid ||
    inflationInvalid ||
    yearsUntilInvalid ||
    yearsOfStudyInvalid ||
    currentSavingsInvalid ||
    returnInvalid
      ? null
      : computeEducationSavings({
          annualTuitionToday: tuition,
          tuitionInflationPercent: inflation,
          yearsUntilStart: yearsUntil,
          yearsOfStudy,
          currentSavings,
          investmentReturnPercent: returnRate,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  const tableRows =
    result?.years.map((row) => [
      formatDecimal(row.year, 0),
      `${formatDecimal(row.yearsFromNow, 0)} năm`,
      formatMoney(row.tuition),
      formatMoney(row.presentValueAtStart),
    ]) ?? [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.tuitionGroup}>
        <NumberField
          {...fields.bind("tuition")}
          label={C.form.tuitionLabel}
          unit={C.form.tuitionUnit}
          help={C.form.tuitionHelp}
          error={C.form.tuitionInvalid}
          invalid={tuitionInvalid}
        />
        <NumberField
          {...fields.bind("inflation")}
          label={C.form.inflationLabel}
          unit={C.form.inflationUnit}
          help={C.form.inflationHelp}
          error={C.form.inflationInvalid}
          invalid={inflationInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.timeGroup} className="mt-8">
        <NumberField
          {...fields.bind("yearsUntil")}
          label={C.form.yearsUntilLabel}
          help={C.form.yearsUntilHelp}
          error={C.form.yearsUntilInvalid}
          invalid={yearsUntilInvalid}
        />
        <NumberField
          {...fields.bind("yearsOfStudy")}
          label={C.form.yearsOfStudyLabel}
          help={C.form.yearsOfStudyHelp}
          error={C.form.yearsOfStudyInvalid}
          invalid={yearsOfStudyInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.savingsGroup} className="mt-8">
        <NumberField
          {...fields.bind("currentSavings")}
          label={C.form.currentSavingsLabel}
          unit={C.form.currentSavingsUnit}
          help={C.form.currentSavingsHelp}
          error={C.form.currentSavingsInvalid}
          invalid={currentSavingsInvalid}
        />
        <NumberField
          {...fields.bind("returnRate")}
          label={C.form.returnLabel}
          unit={C.form.returnUnit}
          help={C.form.returnHelp}
          error={C.form.returnInvalid}
          invalid={returnInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.monthlyContribution)}
        />
        <ResultRow
          label={C.form.targetLabel}
          value={money(result?.targetAtStart)}
        />
        <ResultRow
          label={C.form.shortfallLabel}
          value={money(result?.shortfallAtStart)}
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.nominalLabel}
          value={money(result?.totalTuitionNominal)}
        />
        <ResultRow
          label={C.form.savingsAtStartLabel}
          value={money(result?.currentSavingsAtStart)}
        />
        <ResultRow
          label={C.form.interestLabel}
          value={money(result?.interestEarned)}
        />
        <ResultRow
          label={C.form.totalContributionsLabel}
          value={money(result?.totalContributions)}
        />
        <ResultRow
          label={C.form.monthsToSaveLabel}
          value={
            result
              ? `${formatDecimal(result.monthsToSave, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.yearColumn },
            { label: C.form.table.fromNowColumn },
            { label: C.form.table.tuitionColumn, numeric: true },
            { label: C.form.table.pvColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}

      {result?.alreadyFunded ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.alreadyFundedNotice}
        </p>
      ) : null}

      {result?.noTimeToSave ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noTimeNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
