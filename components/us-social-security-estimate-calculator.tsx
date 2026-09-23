"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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

const FORM_ID = "uoc-tinh-an-sinh-xa-hoi-nhap";
const RESULT_ID = "uoc-tinh-an-sinh-xa-hoi-ket-qua";

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

  // Formatted ONCE, for the rows and for the pinned restatement both. The age
  // is part of the answer, not context for it, so the pin carries the same two
  // strings the first two rows render rather than a second formatting of
  // either. When the chosen age is unavailable the whole pair is `null` and
  // `ResultCta` renders its own placeholder, exactly as the rows render a dash.
  const ageValue = chosen === null ? null : `${chosen.age} ${F.yearsUnitShort}`;
  const monthlyValue = chosen === null ? null : usd(chosen.monthlyBenefit);

  /**
   * The amount and the age it belongs to, or nothing.
   *
   * An independent pass at 1440×1000 clicked the last claim-age field, measured
   * it at y 529–575, and found the monthly figure and the chosen age both above
   * the viewport with only the replacement rate still visible. That supersedes
   * the control-count heuristic this route was previously left unpinned under
   * (five controls, against the six of the one form measured at the time). The
   * pair is the Black–Scholes repair's shape: one label, both halves of the
   * answer, no `emphasis` moved and no row moved.
   */
  const pinnedAnswer = {
    label: F.pinnedLabel,
    value:
      monthlyValue === null || ageValue === null
        ? null
        : `${monthlyValue} ${F.pinnedMonthlySuffix} · ${F.pinnedAgePrefix} ${ageValue}`,
  };

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
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={pinnedAnswer}
          />
        }
        primary={
          <>
            {/* The claiming age is the first row of the same block as the
                monthly figure, because the monthly figure means nothing
                without it — the nine ages differ by a factor of 1,77. The
                group's own title says the figures are an estimate built from
                what the reader typed. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={F.claimAgeLabel} value={ageValue} />
              <ResultRow
                label={F.monthlyLabel}
                value={monthlyValue}
                emphasis
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
                  pia === null
                    ? null
                    : pia.replacementRatePercent === null
                      ? F.noReplacementValue
                      : formatPercent(pia.replacementRatePercent, 2)
                }
              />
            </ResultGroup>

            {/* What the figure above is and is not, beside it rather than
                below the nine-row table: this page's whole liability is a
                reader treating an estimate as the cheque. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.estimateNotice}
            </p>

            {pia !== null && pia.replacementRatePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noReplacementNotice}
              </p>
            ) : null}

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

            <ResultGroup title={F.ageTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.fraLabel}
                value={fraMonths === null ? null : ageLabel(fraMonths)}
              />
              <ResultRow
                label={F.factorLabel}
                value={
                  chosen === null
                    ? null
                    : formatPercent(chosen.factorPercent, 2)
                }
              />
              <ResultRow
                label={F.fromFraLabel}
                value={chosen === null ? null : fromFraLabel(chosen.monthsFromFra)}
              />
            </ResultGroup>
          </>
        }
        detail={
          <>
            {rows.length > 0 ? (
              <>
                <p className="text-sm leading-relaxed text-ink-3">{T.intro}</p>
                {/* Five columns, so `mobileCards` — docs §3 sets that from
                    five up, and the sibling analysis table measured 596 px
                    inside a 300 px frame at a verified 390x844 viewport with
                    six. This one also carries the suite's longest table
                    heading, the 20-character "So với tuổi hưởng đủ", which a
                    card gives its own line. */}
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
                  mobileCards
                />
              </>
            ) : null}

            {/* How the estimate was built. Reference material: none of it
                changes which age the reader should compare, so it is the one
                block behind a summary. */}
            <DetailDisclosure
              title={F.aimeDisclosureTitle}
              className="mt-8"
            >
              <ResultGroup title={F.aimeTitle} live={false}>
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

              <ResultGroup
                title={F.formulaTitle}
                className="mt-4"
                live={false}
              >
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
                  value={
                    pia === null
                      ? null
                      : formatPercent(pia.marginalRatePercent, 0)
                  }
                />
              </ResultGroup>
            </DetailDisclosure>
          </>
        }
      />
    </CalculatorCard>
  );
}
