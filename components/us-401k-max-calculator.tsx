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
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUs401kMax, type Us401kMaxInput } from "@/lib/calc/us-401k-max";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";

const F = C.form;
const T = F.table;

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** The four payroll frequencies, labelled in the content file. */
const PERIOD_OPTIONS = [
  { value: "26", label: F.periodOptions.biweekly },
  { value: "24", label: F.periodOptions.semimonthly },
  { value: "12", label: F.periodOptions.monthly },
  { value: "52", label: F.periodOptions.weekly },
];

/** Keeps the per-period table readable when payroll is weekly. */
const MAX_TABLE_ROWS = 26;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function Us401kMaxCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const periodsPerYear = Number(v.periods);
  const age = parseCount(v.age);
  const elapsed = parseCount(v.elapsed);
  const salary = parseMoney(v.salary);
  const contributed = parseMoney(v.contributed);
  const matchPercent = parseDecimal(v.matchPercent);
  const matchLimit = parseDecimal(v.matchLimit);
  const frontLoad = parseDecimal(v.frontLoad);

  const invalid = {
    age: age === null || age > 120,
    elapsed: elapsed === null || elapsed > periodsPerYear,
    salary: salary === null || salary < 0,
    contributed: contributed === null || contributed < 0,
    matchPercent:
      matchPercent === null || matchPercent < 0 || matchPercent > 200,
    matchLimit: matchLimit === null || matchLimit < 0 || matchLimit > 100,
    frontLoad: frontLoad === null || frontLoad < 0 || frontLoad > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: Us401kMaxInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualSalary: salary!,
        payPeriodsPerYear: periodsPerYear,
        periodsElapsed: elapsed!,
        contributedSoFar: contributed!,
        employerMatchPercent: matchPercent!,
        employerMatchLimitPercent: matchLimit!,
        frontLoadPercent: frontLoad!,
      };

  const result = input === null ? null : computeUs401kMax(input);

  const step =
    result === null
      ? 1
      : Math.ceil(result.planned.deferrals.length / MAX_TABLE_ROWS);

  const rows =
    result === null
      ? []
      : result.planned.deferrals
          .map((amount, index) => ({ amount, index }))
          .filter(({ index }) => index % step === 0)
          .map(({ amount, index }) => [
            String(index + 1),
            usd(amount),
            usd(result.planned.matches[index]),
            usd(result.frontLoaded.deferrals[index]),
            usd(result.frontLoaded.matches[index]),
          ]);

  return (
    <CalculatorCard>
      <FieldGroup title={F.payGroup}>
        <SelectField
          {...fields.bind("year")}
          label={F.yearLabel}
          help={F.yearHelp}
          options={YEAR_OPTIONS}
        />
        <NumberField
          {...fields.bind("age")}
          label={F.ageLabel}
          unit={F.ageUnit}
          help={F.ageHelp}
          error={F.ageInvalid}
          invalid={invalid.age}
        />
        <NumberField
          {...fields.bind("salary")}
          label={F.salaryLabel}
          unit={F.salaryUnit}
          help={F.salaryHelp}
          error={F.moneyInvalid}
          invalid={invalid.salary}
        />
        <SelectField
          {...fields.bind("periods")}
          label={F.periodsLabel}
          help={F.periodsHelp}
          options={PERIOD_OPTIONS}
        />
      </FieldGroup>

      <FieldGroup title={F.progressGroup} className="mt-8">
        <NumberField
          {...fields.bind("elapsed")}
          label={F.elapsedLabel}
          unit={F.elapsedUnit}
          help={F.elapsedHelp}
          error={F.elapsedInvalid}
          invalid={invalid.elapsed}
        />
        <NumberField
          {...fields.bind("contributed")}
          label={F.contributedLabel}
          unit={F.contributedUnit}
          help={F.contributedHelp}
          error={F.moneyInvalid}
          invalid={invalid.contributed}
        />
      </FieldGroup>

      <FieldGroup title={F.matchGroup} className="mt-8">
        <NumberField
          {...fields.bind("matchPercent")}
          label={F.matchPercentLabel}
          unit={F.matchPercentUnit}
          help={F.matchPercentHelp}
          error={F.matchPercentInvalid}
          invalid={invalid.matchPercent}
        />
        <NumberField
          {...fields.bind("matchLimit")}
          label={F.matchLimitLabel}
          unit={F.matchLimitUnit}
          help={F.matchLimitHelp}
          error={F.percentInvalid}
          invalid={invalid.matchLimit}
        />
        <NumberField
          {...fields.bind("frontLoad")}
          label={F.frontLoadLabel}
          unit={F.frontLoadUnit}
          help={F.frontLoadHelp}
          error={F.percentInvalid}
          invalid={invalid.frontLoad}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.perPeriodLabel}
          value={
            result === null || result.perPeriodAmount === null
              ? null
              : usdCents(result.perPeriodAmount)
          }
        />
        <ResultRow
          label={F.perPeriodPercentLabel}
          value={
            result === null || result.perPeriodPercent === null
              ? null
              : formatPercent(result.perPeriodPercent, 2)
          }
        />
        <ResultRow
          label={F.roomLabel}
          value={result === null ? null : usd(result.remainingRoom)}
        />
        <ResultRow
          label={F.periodsLeftLabel}
          value={result === null ? null : String(result.periodsRemaining)}
        />
      </ResultGroup>

      <ResultGroup title={F.yourPlanTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.yourMatchPeriodLabel}
          value={
            result === null ? null : usdCents(result.planned.matchPerPeriodPlan)
          }
        />
        <ResultRow
          label={F.yourMatchTrueUpLabel}
          value={
            result === null ? null : usdCents(result.planned.matchTrueUpPlan)
          }
        />
        <ResultRow
          label={F.yourLostLabel}
          value={
            result === null
              ? null
              : usdCents(result.planned.matchLostWithoutTrueUp)
          }
        />
        <ResultRow
          label={F.yourUnderLabel}
          value={
            result === null ? null : String(result.planned.underThresholdPeriods)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.frontTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.frontEmptyLabel}
          value={result === null ? null : String(result.frontLoaded.emptyPeriods)}
        />
        <ResultRow
          label={F.frontMatchPeriodLabel}
          value={
            result === null
              ? null
              : usdCents(result.frontLoaded.matchPerPeriodPlan)
          }
        />
        <ResultRow
          label={F.frontMatchTrueUpLabel}
          value={
            result === null ? null : usdCents(result.frontLoaded.matchTrueUpPlan)
          }
        />
        <ResultRow
          label={F.frontLostLabel}
          value={
            result === null
              ? null
              : usdCents(result.frontLoaded.matchLostWithoutTrueUp)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.limitTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.limitLabel}
          value={result === null ? null : usd(result.limit)}
        />
        <ResultRow
          label={F.catchUpLabel}
          value={result === null ? null : usd(result.catchUpAvailable)}
        />
        <ResultRow
          label={F.payPerPeriodLabel}
          value={result === null ? null : usdCents(result.payPerPeriod)}
        />
        <ResultRow
          label={F.thresholdLabel}
          value={
            result === null
              ? null
              : usdCents(result.matchThresholdPerPeriod)
          }
        />
        <ResultRow
          label={F.thresholdAnnualLabel}
          value={
            result === null ? null : usdCents(result.matchThresholdAnnual)
          }
        />
        <ResultRow
          label={F.maxPossibleLabel}
          value={result === null ? null : usd(result.maxStillPossible)}
        />
      </ResultGroup>

      {result !== null && result.exceedsPay ? (
        <p className="mt-6 text-sm leading-relaxed text-ink-3">
          {F.unreachableNotice}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.periodColumn },
              { label: T.yourColumn, numeric: true },
              { label: T.yourMatchColumn, numeric: true },
              { label: T.frontColumn, numeric: true },
              { label: T.frontMatchColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.planned.matchLostWithoutTrueUp > 0
            ? F.lostMatchNotice
            : F.evenNotice}
        </p>
      ) : null}

      {result !== null && result.overLimit > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.overLimitNotice}
        </p>
      ) : result !== null && result.alreadyAtLimit ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.atLimitNotice}
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
