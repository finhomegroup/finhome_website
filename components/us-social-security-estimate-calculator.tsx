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
  parseMoney,
} from "@/lib/calc/number";
import {
  aimeFromEarnings,
  BEND_POINT_YEAR_ORDER,
  claimingSchedule,
  EARLIEST_CLAIM_AGE,
  fullRetirementAgeMonths,
  LATEST_CLAIM_AGE,
  piaFromAime,
  splitAgeMonths,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ESTIMATE as C } from "@/content/calculators/us-social-security-estimate";

const F = C.form;
const T = F.table;

const FORMULA_YEAR_OPTIONS = BEND_POINT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** "67 tuổi 6 tháng", or just "67 tuổi" on a whole year. */
function ageLabel(months: number): string {
  const split = splitAgeMonths(months);
  return split.months === 0
    ? `${split.years} ${F.yearsUnitShort}`
    : `${split.years} ${F.yearsUnitShort} ${split.months} ${F.monthsUnit}`;
}

/** "6 tháng sớm hơn" is left to the sign; the page shows a signed count. */
function fromFraLabel(monthsFromFra: number): string {
  if (monthsFromFra === 0) return T.atFra;
  const sign = monthsFromFra > 0 ? "+" : "−";
  return `${sign}${Math.abs(monthsFromFra)} ${F.monthsUnit}`;
}

export function UsSocialSecurityEstimateCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const birthYear = parseCount(v.birthYear);
  const yearsWorked = parseCount(v.yearsWorked);
  const claimAge = parseCount(v.claimAge);
  const earnings = parseMoney(v.earnings);
  const formulaYear = Number(v.formulaYear);

  const invalid = {
    birthYear: birthYear === null || birthYear < 1900 || birthYear > 2100,
    yearsWorked: yearsWorked === null || yearsWorked > 70,
    claimAge:
      claimAge === null ||
      claimAge < EARLIEST_CLAIM_AGE ||
      claimAge > LATEST_CLAIM_AGE,
    earnings: earnings === null || earnings < 0,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const estimate = anyInvalid
    ? null
    : aimeFromEarnings(earnings!, yearsWorked!, formulaYear);
  const pia = estimate === null ? null : piaFromAime(estimate.aime, formulaYear);
  const fraMonths = birthYear === null ? null : fullRetirementAgeMonths(birthYear);
  const schedule =
    pia === null || fraMonths === null ? null : claimingSchedule(pia.pia, fraMonths);
  const chosen =
    schedule === null ? null : schedule.find((option) => option.age === claimAge) ?? null;

  const rows =
    schedule === null
      ? []
      : schedule.map((option) => [
          String(option.age),
          formatPercent(option.factorPercent, 2),
          usd(option.monthlyBenefit),
          usd(option.annualBenefit),
          fromFraLabel(option.monthsFromFra),
        ]);

  return (
    <CalculatorCard>
      <FieldGroup title={F.workGroup}>
        <SelectField
          {...fields.bind("formulaYear")}
          label={F.formulaYearLabel}
          help={F.formulaYearHelp}
          options={FORMULA_YEAR_OPTIONS}
        />
        <NumberField
          {...fields.bind("earnings")}
          label={F.earningsLabel}
          unit={F.earningsUnit}
          help={F.earningsHelp}
          error={F.moneyInvalid}
          invalid={invalid.earnings}
        />
        <NumberField
          {...fields.bind("yearsWorked")}
          label={F.yearsWorkedLabel}
          unit={F.yearsWorkedUnit}
          help={F.yearsWorkedHelp}
          error={F.yearsInvalid}
          invalid={invalid.yearsWorked}
        />
      </FieldGroup>

      <FieldGroup title={F.ageGroup} className="mt-8">
        <NumberField
          {...fields.bind("birthYear")}
          label={F.birthYearLabel}
          help={F.birthYearHelp}
          error={F.yearInvalid}
          invalid={invalid.birthYear}
        />
        <NumberField
          {...fields.bind("claimAge")}
          label={F.claimAgeLabel}
          unit={F.claimAgeUnit}
          help={F.claimAgeHelp}
          error={F.claimAgeInvalid}
          invalid={invalid.claimAge}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.monthlyLabel}
          value={chosen === null ? null : usd(chosen.monthlyBenefit)}
        />
        <ResultRow
          label={F.annualLabel}
          value={chosen === null ? null : usd(chosen.annualBenefit)}
        />
        <ResultRow
          label={F.piaLabel}
          value={pia === null ? null : usdCents(pia.pia)}
        />
        <ResultRow
          label={F.replacementLabel}
          value={
            pia === null || pia.replacementRatePercent === null
              ? null
              : formatPercent(pia.replacementRatePercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.aimeTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.cappedEarningsLabel}
          value={estimate === null ? null : usd(estimate.cappedEarnings)}
        />
        <ResultRow
          label={F.yearsCountedLabel}
          value={estimate === null ? null : String(estimate.yearsCounted)}
        />
        <ResultRow
          label={F.zeroYearsLabel}
          value={estimate === null ? null : String(estimate.zeroYears)}
        />
        <ResultRow
          label={F.aimeLabel}
          value={estimate === null ? null : usdCents(estimate.aime)}
        />
      </ResultGroup>

      <ResultGroup title={F.formulaTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.firstTierLabel}
          value={
            pia === null
              ? null
              : `${usdCents(pia.firstTierAime)} → ${usdCents(pia.firstTierPia)}`
          }
        />
        <ResultRow
          label={F.secondTierLabel}
          value={
            pia === null
              ? null
              : `${usdCents(pia.secondTierAime)} → ${usdCents(pia.secondTierPia)}`
          }
        />
        <ResultRow
          label={F.thirdTierLabel}
          value={
            pia === null
              ? null
              : `${usdCents(pia.thirdTierAime)} → ${usdCents(pia.thirdTierPia)}`
          }
        />
        <ResultRow
          label={F.marginalLabel}
          value={pia === null ? null : formatPercent(pia.marginalRatePercent, 0)}
        />
      </ResultGroup>

      <ResultGroup title={F.ageTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.fraLabel}
          value={fraMonths === null ? null : ageLabel(fraMonths)}
        />
        <ResultRow
          label={F.factorLabel}
          value={chosen === null ? null : formatPercent(chosen.factorPercent, 2)}
        />
        <ResultRow
          label={F.fromFraLabel}
          value={chosen === null ? null : fromFraLabel(chosen.monthsFromFra)}
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={[
              { label: T.ageColumn },
              { label: T.factorColumn, numeric: true },
              { label: T.monthlyColumn, numeric: true },
              { label: T.annualColumn, numeric: true },
              { label: T.fromFraColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-ink-3">
        {F.estimateNotice}
      </p>

      {estimate?.cappedByTaxableMaximum ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.cappedNotice}
        </p>
      ) : null}

      {estimate !== null && estimate.zeroYears > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.zeroYearsNotice}
        </p>
      ) : null}

      {estimate === null || pia === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
