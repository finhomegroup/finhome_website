"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
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
  type ClaimingAnalysisOption,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ANALYSIS as C } from "@/content/calculators/us-social-security-analysis";

const F = C.form;
const T = F.table;

const FORM_ID = "phan-tich-an-sinh-xa-hoi-nhap";
const RESULT_ID = "phan-tich-an-sinh-xa-hoi-ket-qua";

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

type BreakEvenAbsence = "baseline" | "tie" | "beyond";

/**
 * Why an option has no break-even age. The engine returns one null for
 * three unrelated reasons (`us-social-security.ts`: the guard skips age 62
 * and any option that does not beat it, then discards a crossing past 120),
 * and a reader cannot tell them apart from the value alone.
 */
function breakEvenAbsence(
  option: ClaimingAnalysisOption,
  earliestMonthly: number,
): BreakEvenAbsence | null {
  if (option.breakEvenMonthsVsEarliest !== null) return null;
  if (option.age === EARLIEST_CLAIM_AGE) return "baseline";
  if (option.monthlyBenefit <= earliestMonthly) return "tie";
  return "beyond";
}

function absenceValue(absence: BreakEvenAbsence): string {
  return absence === "baseline"
    ? F.breakEvenBaselineValue
    : absence === "tie"
      ? F.breakEvenTieValue
      : F.breakEvenBeyondValue;
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

  // The headline row compares age 70 with age 62, so "baseline" cannot
  // reach it. A tie can, and it gets its own words beside the row rather
  // than an unexplained blank; "beyond" is the engine's defensive branch
  // and carries a label only — see the content module.
  const lateAbsence =
    late === null || early === null
      ? null
      : breakEvenAbsence(late, early.monthlyBenefit);

  // Formatted ONCE, for the two co-equal rows and the pinned pair both.
  const bestNominalValue =
    result === null ? null : String(result.bestByNominal.age);
  const bestPvValue =
    result === null ? null : String(result.bestByPresentValue.age);

  /**
   * Both optima in one `answer`, or nothing.
   *
   * The measured case: at 1440×1000 with the last discount-rate field focused
   * (y 529–575), the total-money optimum had scrolled above the viewport and
   * the present-value optimum sat on the top edge — while the field being
   * edited is precisely the one that moves the second figure. A labelled pair
   * restores both without ranking them, which is the Black–Scholes shape and
   * the only shape this page allows: `ResultCta`'s `answer` holds one label and
   * one value, and here neither age may be promoted over the other. The unit
   * is attached in the pin because the rows carry theirs in their labels and a
   * bare "70 · 68" on one line would not read as ages.
   */
  const pinnedAnswer = {
    label: F.pinnedPairLabel,
    value:
      bestNominalValue === null || bestPvValue === null
        ? null
        : `${F.pinnedNominalPrefix} ${bestNominalValue} ${F.endAgeUnit} · ` +
          `${F.pinnedPvPrefix} ${bestPvValue} ${F.endAgeUnit}`,
  };

  const rows =
    result === null || early === null
      ? []
      : result.options.map((option) => {
          const absence = breakEvenAbsence(option, early.monthlyBenefit);
          return [
            String(option.age),
            usd(option.monthlyBenefit),
            String(option.monthsReceived),
            usd(option.nominalTotal),
            usd(option.presentValue),
            absence === null
              ? breakEvenLabel(option.breakEvenMonthsVsEarliest)!
              : absenceValue(absence),
          ];
        });

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
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
            {/* Deliberately no `emphasis` on this page. The two answers are
                co-equal — which one applies depends on whether the reader
                has other assets to live on while waiting, which the tool
                cannot know — and one enlarged figure would read as the
                recommendation the row forbids. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={F.bestNominalLabel} value={bestNominalValue} />
              <ResultRow label={F.bestPvLabel} value={bestPvValue} />
              <ResultRow
                label={F.breakEven70Label}
                value={
                  late === null
                    ? null
                    : lateAbsence === null
                      ? breakEvenLabel(late.breakEvenMonthsVsEarliest)
                      : absenceValue(lateAbsence)
                }
              />
              <ResultRow
                label={F.fraLabel}
                value={fraMonths === null ? null : ageLabel(fraMonths)}
              />
            </ResultGroup>

            {result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.twoMeasuresHint}
              </p>
            ) : null}

            {/* Beside the two answers rather than after the nine-row table:
                whether the measures agree is the first thing that changes
                how they should be read. */}
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

            {lateAbsence === "tie" ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.breakEvenTieNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          <>
            <ResultGroup title={F.detailTitle} live={false}>
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
                <p className="mt-8 text-sm leading-relaxed text-ink-3">
                  {T.intro}
                </p>
                {/* Six columns, so `mobileCards` — docs §3 sets that from five
                    up. An independent browser review at a verified 390x844
                    viewport measured this table at 596 px inside the 300 px
                    scroll frame: a ratio of 1,99, so two screens of sideways
                    travel, with only "Tuổi nhận", "Mỗi tháng" and "Số tháng
                    nhận" on screen. The three columns this page exists to
                    compare — nominal total, present value and break-even —
                    were entirely off to the right, while the paragraph below
                    the table explains the comparison between two of them as
                    though both were visible. The headers are NOT the fix: six
                    numeric columns do not fit 300 px at any label length, and
                    shortening "Tổng danh nghĩa" or "Giá trị hiện tại" would
                    cost the nominal-versus-present-value distinction that is
                    the page's whole lesson. */}
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
                  mobileCards
                />
              </>
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
