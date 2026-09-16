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
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import {
  computeEducationSavings,
  MAX_EDUCATION_YEARS,
} from "@/lib/calc/education-savings";
import { educationFundChartModel } from "@/lib/calc/charts/education-fund-chart";
import { moneyCell } from "@/lib/calc/table-cell";
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
  const yearsUntilAlone =
    yearsUntil === null || yearsUntil < 0 || !Number.isInteger(yearsUntil);
  const yearsOfStudyAlone =
    yearsOfStudy === null ||
    yearsOfStudy <= 0 ||
    !Number.isInteger(yearsOfStudy);
  // THE ENGINE'S BOUND, IN THE FORM. `computeEducationSavings` refuses a plan
  // longer than 100 years, and without this the whole result and both charts
  // cleared with no field marked invalid — the chart then explained the
  // refusal as a plan too SHORT. docs §6 records the same defect on row 11's
  // 1.201-month horizon.
  const yearsTogetherInvalid =
    !yearsUntilAlone &&
    !yearsOfStudyAlone &&
    yearsUntil! + yearsOfStudy! > MAX_EDUCATION_YEARS;
  const yearsUntilInvalid = yearsUntilAlone || yearsTogetherInvalid;
  const yearsOfStudyInvalid = yearsOfStudyAlone || yearsTogetherInvalid;
  const yearsBound = (template: string) =>
    template.replace("{max}", formatDecimal(MAX_EDUCATION_YEARS, 0));
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

  /**
   * The per-year tuition table, with the two MONETARY columns as typed cells.
   *
   * They were `formatMoney` strings, and an independent review measured the
   * consequence at 390 px: a 411 px table inside a 300 px frame with the
   * present-value column offscreen, no stated currency and no exact-đồng
   * control. `moneyCell` lets `ResultTable` derive the unit line, the compact
   * reading and the switch from raw numbers (docs §3).
   *
   * The two leading columns stay as they are on purpose: a year of study is a
   * COUNT and "10 năm" is a phrase, and neither may ever be divided into
   * triệu. Only `moneyCell` is scaled.
   */
  const tableRows =
    result?.years.map((row) => [
      formatDecimal(row.year, 0),
      `${formatDecimal(row.yearsFromNow, 0)} ${C.form.table.fromNowUnit}`,
      moneyCell(row.tuition),
      moneyCell(row.presentValueAtStart),
    ]) ?? [];

  const chart = educationFundChartModel(result, C.chart);

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
        {/* The error names WHICH rule was broken: the field's own, or the
            joint 100-year bound. Both fields carry the joint message,
            because either one is a valid thing to change. */}
        <NumberField
          {...fields.bind("yearsUntil")}
          label={C.form.yearsUntilLabel}
          help={yearsBound(C.form.yearsUntilHelp)}
          error={
            yearsTogetherInvalid
              ? yearsBound(C.form.yearsTogetherInvalid)
              : C.form.yearsUntilInvalid
          }
          invalid={yearsUntilInvalid}
        />
        <NumberField
          {...fields.bind("yearsOfStudy")}
          label={C.form.yearsOfStudyLabel}
          help={C.form.yearsOfStudyHelp}
          error={
            yearsTogetherInvalid
              ? yearsBound(C.form.yearsTogetherInvalid)
              : C.form.yearsOfStudyInvalid
          }
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
        {/* A dash, not 0 ₫, when no monthly amount can close the gap: with
            zero months to save there is no such figure, and "0 ₫" read as
            "you need to contribute nothing" on a plan short of 314 triệu. */}
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.monthlyContribution ?? undefined)}
        />
        <ResultRow
          label={C.form.targetLabel}
          value={money(result?.targetAtStart)}
        />
        <ResultRow
          label={C.form.shortfallLabel}
          value={money(result?.shortfallAtStart)}
        />
        {/* Mounted only on a plan that cannot pay — the two figures that ARE
            available when the monthly one is not. */}
        {result !== null && result.fundingGapAtStart > 0 ? (
          <>
            <ResultRow
              label={C.form.heldAtStartLabel}
              value={money(result.fundedAtStart)}
            />
            {/* NOT the same row as "Còn thiếu": that is the gap BEFORE any
                contribution, and this is what is still open AFTER the
                contributions the plan can actually make. They coincide only
                when no contribution is possible. */}
            <ResultRow
              label={C.form.fundingGapLabel}
              value={money(result.fundingGapAtStart)}
            />
            <ResultRow
              label={C.form.unpaidTuitionLabel}
              value={money(result.totalTuitionUnpaid)}
            />
          </>
        ) : null}
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

      {/* GUARDED BY A REAL GAP, not by the zero wait alone. A funded plan
          starting today has a monthly figure of 0 and no gap, and the
          unfunded notice told that reader an amount was missing and the
          result was blank. Source review found it on a 500 triệu fixture. */}
      {result?.noTimeToSave && result.fundingGapAtStart > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noTimeNotice}
        </p>
      ) : null}

      {result?.noTimeToSave && result.fundingGapAtStart <= 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noTimeFundedNotice}
        </p>
      ) : null}

      {/* ORIGINAL ROW 25's lesson, beside the figure it is about: this
          contribution competes with the home deposit, and the tool cannot
          net the two for the reader. Mounted only when there IS a
          contribution to compete — an already-funded plan asks for nothing. */}
      {result !== null &&
      result.monthlyContribution !== null &&
      result.monthlyContribution > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.parallelGoalNotice}
        </p>
      ) : null}

      {/* The fund against the need, year by year. Both paths come from the
          engine's own series. */}
      <ChartFigure model={chart}>
        <LineChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
