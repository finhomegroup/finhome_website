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
import { computeUs401k, type Us401kInput } from "@/lib/calc/us-401k";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_401K as C } from "@/content/calculators/us-401k";

const F = C.form;
const T = F.table;

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** Deferral percents the sensitivity table always shows. */
const TABLE_PERCENTS = [0, 2, 4, 6, 8, 10, 15];

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function Us401kCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const age = parseCount(v.age);
  const years = parseCount(v.years);
  const salary = parseMoney(v.salary);
  const deferral = parseDecimal(v.deferral);
  const matchPercent = parseDecimal(v.matchPercent);
  const matchLimit = parseDecimal(v.matchLimit);
  const extra = parseDecimal(v.extra);
  const marginal = parseDecimal(v.marginal);
  const returnPercent = parseDecimal(v.returnPercent);

  const invalid = {
    age: age === null || age > 120,
    years: years === null || years > 70,
    salary: salary === null || salary < 0,
    deferral: deferral === null || deferral < 0 || deferral > 100,
    matchPercent:
      matchPercent === null || matchPercent < 0 || matchPercent > 200,
    matchLimit: matchLimit === null || matchLimit < 0 || matchLimit > 100,
    extra: extra === null || extra < 0 || extra > 100,
    marginal: marginal === null || marginal < 0 || marginal > 100,
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: Us401kInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualSalary: salary!,
        deferralPercent: deferral!,
        employerMatchPercent: matchPercent!,
        employerMatchLimitPercent: matchLimit!,
        employerExtraPercent: extra!,
        marginalRatePercent: marginal!,
        returnPercent: returnPercent!,
        years: years!,
      };

  const result = input === null ? null : computeUs401k(input);

  // The elected percent joins the fixed list so the reader's own choice is
  // always a row they can find, and the match threshold joins it so the row
  // where the forfeited column reaches zero is always visible.
  const rows =
    result === null || input === null
      ? []
      : Array.from(
          new Set(
            [...TABLE_PERCENTS, input.deferralPercent, input.employerMatchLimitPercent]
              .filter((percent) => percent >= 0 && percent <= 100)
              .map((percent) => Math.round(percent * 100) / 100),
          ),
        )
          .sort((a, b) => a - b)
          .map((percent) => {
            const at = computeUs401k({ ...input, deferralPercent: percent });
            return [
              formatPercent(percent, percent % 1 === 0 ? 0 : 2),
              at === null ? null : usd(at.deferral),
              at === null ? null : usd(at.employerMatch),
              at === null ? null : usd(at.unclaimedMatch),
              at === null ? null : usd(at.totalContribution),
              at === null ? null : usd(at.netCostOfDeferral),
              at === null ? null : usd(at.projectedBalance),
            ];
          });

  return (
    <CalculatorCard>
      <FieldGroup title={F.incomeGroup}>
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
        <NumberField
          {...fields.bind("deferral")}
          label={F.deferralLabel}
          unit={F.deferralUnit}
          help={F.deferralHelp}
          error={F.percentInvalid}
          invalid={invalid.deferral}
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
          {...fields.bind("extra")}
          label={F.extraLabel}
          unit={F.extraUnit}
          help={F.extraHelp}
          error={F.percentInvalid}
          invalid={invalid.extra}
        />
      </FieldGroup>

      <FieldGroup title={F.planGroup} className="mt-8">
        <NumberField
          {...fields.bind("marginal")}
          label={F.marginalLabel}
          unit={F.marginalUnit}
          help={F.marginalHelp}
          error={F.percentInvalid}
          invalid={invalid.marginal}
        />
        <NumberField
          {...fields.bind("returnPercent")}
          label={F.returnLabel}
          unit={F.returnUnit}
          help={F.returnHelp}
          error={F.rateInvalid}
          invalid={invalid.returnPercent}
        />
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={invalid.years}
        />
      </FieldGroup>

      {/* The forfeited match leads, and its value at the horizon sits under
          it: the annual figure is small enough to shrug at and the horizon
          figure is not. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.unclaimedLabel}
          value={result === null ? null : usdCents(result.unclaimedMatch)}
        />
        <ResultRow
          label={F.unclaimedHorizonLabel}
          value={result === null ? null : usd(result.unclaimedMatchAtHorizon)}
        />
        <ResultRow
          label={F.matchLabel}
          value={result === null ? null : usdCents(result.employerMatch)}
        />
        <ResultRow
          label={F.totalLabel}
          value={result === null ? null : usdCents(result.totalContribution)}
        />
      </ResultGroup>

      <ResultGroup title={F.yourMoneyTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.deferralLabelResult}
          value={result === null ? null : usdCents(result.deferral)}
        />
        <ResultRow
          label={F.taxSavedLabel}
          value={result === null ? null : usdCents(result.incomeTaxSaved)}
        />
        <ResultRow
          label={F.netCostLabel}
          value={result === null ? null : usdCents(result.netCostOfDeferral)}
        />
        <ResultRow
          label={F.matchReturnLabel}
          value={
            result === null || result.matchReturnPercent === null
              ? null
              : formatPercent(result.matchReturnPercent, 0)
          }
        />
        <ResultRow
          label={F.thresholdLabel}
          value={
            result === null
              ? null
              : `${formatPercent(result.matchThresholdPercent, 0)} = ${usdCents(
                  result.matchThresholdAmount,
                )}`
          }
        />
      </ResultGroup>

      <ResultGroup title={F.limitTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.deferralLimitLabel}
          value={result === null ? null : usd(result.deferralLimit)}
        />
        <ResultRow
          label={F.catchUpLabel}
          value={result === null ? null : usd(result.catchUpAvailable)}
        />
        <ResultRow
          label={F.planCompLabel}
          value={result === null ? null : usd(result.planCompensation)}
        />
        <ResultRow
          label={F.additionsLimitLabel}
          value={result === null ? null : usd(result.params.annualAdditions)}
        />
        <ResultRow
          label={F.excessLabel}
          value={result === null ? null : usd(result.excessAdditions)}
        />
      </ResultGroup>

      <ResultGroup title={F.horizonTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.projectedLabel}
          value={result === null ? null : usd(result.projectedBalance)}
        />
        <ResultRow
          label={F.withoutMatchLabel}
          value={result === null ? null : usd(result.projectedWithoutMatch)}
        />
        <ResultRow
          label={F.matchValueLabel}
          value={result === null ? null : usd(result.matchValueAtHorizon)}
        />
        <ResultRow
          label={F.contributedLabel}
          value={result === null ? null : usd(result.totalContributed)}
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.percentColumn },
              { label: T.yoursColumn, numeric: true },
              { label: T.matchColumn, numeric: true },
              { label: T.unclaimedColumn, numeric: true },
              { label: T.totalColumn, numeric: true },
              { label: T.netColumn, numeric: true },
              { label: T.projectedColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.unclaimedMatch > 0 ? F.unclaimedNotice : F.fullMatchNotice}
        </p>
      ) : null}

      {result?.deferralCapped ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.cappedNotice}
        </p>
      ) : null}

      {result?.compensationCapped ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.compCappedNotice}
        </p>
      ) : null}

      {result !== null && result.excessAdditions > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.excessNotice}
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
