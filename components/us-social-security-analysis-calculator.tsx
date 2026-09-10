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
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  claimingAnalysis,
  EARLIEST_CLAIM_AGE,
  fullRetirementAgeMonths,
  LATEST_CLAIM_AGE,
  splitAgeMonths,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ANALYSIS as C } from "@/content/calculators/us-social-security-analysis";

const F = C.form;
const T = F.table;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function ageLabel(months: number): string {
  const split = splitAgeMonths(months);
  return split.months === 0
    ? `${split.years} ${F.endAgeUnit}`
    : `${split.years} ${F.endAgeUnit} ${split.months} tháng`;
}

/** A break-even lands mid-month, so it is shown to two decimals of a year. */
function breakEvenLabel(months: number | null): string | null {
  return months === null ? null : `${formatDecimal(months / 12, 2)} ${F.endAgeUnit}`;
}

export function UsSocialSecurityAnalysisCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const pia = parseMoney(v.pia);
  const birthYear = parseCount(v.birthYear);
  const endAge = parseCount(v.endAge);
  const discount = parseDecimal(v.discount);

  const invalid = {
    pia: pia === null || pia < 0,
    birthYear: birthYear === null || birthYear < 1900 || birthYear > 2100,
    endAge: endAge === null || endAge <= EARLIEST_CLAIM_AGE || endAge > 120,
    discount: discount === null || discount < 0 || discount > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const fraMonths = birthYear === null ? null : fullRetirementAgeMonths(birthYear);

  const result =
    anyInvalid || fraMonths === null
      ? null
      : claimingAnalysis({
          pia: pia!,
          fraMonths,
          endAge: endAge!,
          discountRatePercent: discount!,
        });

  const at = (age: number) =>
    result === null
      ? null
      : result.options.find((option) => option.age === age) ?? null;
  const early = at(EARLIEST_CLAIM_AGE);
  const late = at(LATEST_CLAIM_AGE);

  // The two measures agreeing is worth saying, and so is their disagreeing —
  // they answer different questions, and the page's notice depends on which
  // case the reader is in.
  const agree =
    result !== null && result.bestByNominal.age === result.bestByPresentValue.age;
  const interior =
    result !== null &&
    ((result.bestByNominal.age !== EARLIEST_CLAIM_AGE &&
      result.bestByNominal.age !== LATEST_CLAIM_AGE) ||
      (result.bestByPresentValue.age !== EARLIEST_CLAIM_AGE &&
        result.bestByPresentValue.age !== LATEST_CLAIM_AGE));

  const rows =
    result === null
      ? []
      : result.options.map((option) => [
          String(option.age),
          usd(option.monthlyBenefit),
          String(option.monthsReceived),
          usd(option.nominalTotal),
          usd(option.presentValue),
          breakEvenLabel(option.breakEvenMonthsVsEarliest) ?? T.never,
        ]);

  return (
    <CalculatorCard>
      <FieldGroup title={F.benefitGroup}>
        <NumberField
          {...fields.bind("pia")}
          label={F.piaLabel}
          unit={F.piaUnit}
          help={F.piaHelp}
          error={F.piaInvalid}
          invalid={invalid.pia}
        />
        <NumberField
          {...fields.bind("birthYear")}
          label={F.birthYearLabel}
          help={F.birthYearHelp}
          error={F.yearInvalid}
          invalid={invalid.birthYear}
        />
      </FieldGroup>

      <FieldGroup title={F.horizonGroup} className="mt-8">
        <NumberField
          {...fields.bind("endAge")}
          label={F.endAgeLabel}
          unit={F.endAgeUnit}
          help={F.endAgeHelp}
          error={F.endAgeInvalid}
          invalid={invalid.endAge}
        />
        <NumberField
          {...fields.bind("discount")}
          label={F.discountLabel}
          unit={F.discountUnit}
          help={F.discountHelp}
          error={F.discountInvalid}
          invalid={invalid.discount}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.bestNominalLabel}
          value={result === null ? null : String(result.bestByNominal.age)}
        />
        <ResultRow
          label={F.bestPvLabel}
          value={result === null ? null : String(result.bestByPresentValue.age)}
        />
        <ResultRow
          label={F.breakEven70Label}
          value={
            late === null
              ? null
              : breakEvenLabel(late.breakEvenMonthsVsEarliest)
          }
        />
        <ResultRow
          label={F.fraLabel}
          value={fraMonths === null ? null : ageLabel(fraMonths)}
        />
      </ResultGroup>

      <ResultGroup title={F.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.earlyMonthlyLabel}
          value={early === null ? null : usd(early.monthlyBenefit)}
        />
        <ResultRow
          label={F.lateMonthlyLabel}
          value={late === null ? null : usd(late.monthlyBenefit)}
        />
        <ResultRow
          label={F.earlyTotalLabel}
          value={early === null ? null : usd(early.nominalTotal)}
        />
        <ResultRow
          label={F.lateTotalLabel}
          value={late === null ? null : usd(late.nominalTotal)}
        />
        <ResultRow
          label={F.earlyPvLabel}
          value={early === null ? null : usd(early.presentValue)}
        />
        <ResultRow
          label={F.latePvLabel}
          value={late === null ? null : usd(late.presentValue)}
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
              { label: T.monthlyColumn, numeric: true },
              { label: T.monthsColumn, numeric: true },
              { label: T.totalColumn, numeric: true },
              { label: T.pvColumn, numeric: true },
              { label: T.breakEvenColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {agree ? F.agreeNotice : F.disagreeNotice}
        </p>
      ) : null}

      {interior ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.interiorNotice}
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
