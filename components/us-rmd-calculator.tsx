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
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRmd, type RmdInput } from "@/lib/calc/us-rmd";
import { US_RMD as C } from "@/content/calculators/us-rmd";

const F = C.form;
const T = F.table;

const FORM_ID = "rut-toi-thieu-bat-buoc-nhap";
const RESULT_ID = "rut-toi-thieu-bat-buoc-ket-qua";

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsRmdCalculator() {
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. Birth year and the two ages are counts and format nothing.
  const fields = useCalcFields(F.defaults, {
    balance: "money",
    planned: "money",
    returnPercent: "rate",
    marginal: "rate",
  });
  const v = fields.values;

  // Every one of these is a whole count, and `parseMoney` would read a
  // birth year typed "1.953" as 1953 but also "19.53" as 1953 — a count
  // parser rejects both spellings that are not a year.
  const birthYear = parseCount(v.birthYear);
  const currentAge = parseCount(v.currentAge);
  const endAge = parseCount(v.endAge);
  const balance = parseMoney(v.balance);
  const planned = parseMoney(v.planned);
  const returnPercent = parseDecimal(v.returnPercent);
  const marginal = parseDecimal(v.marginal);

  const invalid = {
    birthYear: birthYear === null || birthYear < 1900 || birthYear > 2100,
    currentAge: currentAge === null || currentAge > 120,
    endAge: endAge === null || endAge > 120,
    balance: balance === null || balance < 0,
    planned: planned === null || planned < 0,
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
    marginal: marginal === null || marginal < 0 || marginal > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: RmdInput | null = anyInvalid
    ? null
    : {
        birthYear: birthYear!,
        currentAge: currentAge!,
        balance: balance!,
        returnPercent: returnPercent!,
        endAge: endAge!,
        marginalRatePercent: marginal!,
        plannedWithdrawal: planned!,
      };

  const result = input === null ? null : computeRmd(input);

  const rows =
    result === null
      ? []
      : result.years.map((row) => [
          String(row.age),
          row.divisor === null ? T.notRequired : formatDecimal(row.divisor, 1),
          usd(row.required),
          row.requiredPercent === null
            ? null
            : formatPercent(row.requiredPercent, 2),
          usd(row.openingBalance),
          usd(row.closingBalance),
        ]);

  /**
   * The percentage row reads empty for two unrelated reasons, so it says
   * which one: below the required age there is no divisor at all, and with a
   * zero prior balance there is a divisor but nothing to take a percent of.
   * Same wording as the table's own column, so the two cannot disagree.
   */
  const requiredPercentValue =
    result === null
      ? null
      : result.requiredPercent !== null
        ? formatPercent(result.requiredPercent, 2)
        : result.divisor === null
          ? T.notRequired
          : F.noBalanceValue;

  /*
   * `sticky`: seven controls in two groups, split and `wide`. The measured
   * precedent is a six-control form of the same shape at 1143,75 px
   * (`components/black-scholes-calculator.tsx`), where the result region sat
   * at y −382..−140 with the last field focused; `lg:items-start` keeps the
   * result column at the top of the grid. This form's own height has NOT been
   * measured.
   */
  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  const answerValue = result === null ? null : usdCents(result.required);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.whoGroup}>
              <NumberField
                {...fields.bind("birthYear")}
                label={F.birthYearLabel}
                help={F.birthYearHelp}
                error={F.yearInvalid}
                invalid={invalid.birthYear}
              />
              <NumberField
                {...fields.bind("currentAge")}
                label={F.currentAgeLabel}
                unit={F.currentAgeUnit}
                help={F.currentAgeHelp}
                error={F.ageInvalid}
                invalid={invalid.currentAge}
              />
              <NumberField
                {...fields.bind("balance")}
                label={F.balanceLabel}
                unit={F.balanceUnit}
                help={F.balanceHelp}
                error={F.moneyInvalid}
                invalid={invalid.balance}
              />
              <NumberField
                {...fields.bind("planned")}
                label={F.plannedLabel}
                unit={F.plannedUnit}
                help={F.plannedHelp}
                error={F.moneyInvalid}
                invalid={invalid.planned}
              />
            </FieldGroup>

            <FieldGroup title={F.assumptionGroup} className="mt-8">
              <NumberField
                {...fields.bind("returnPercent")}
                label={F.returnLabel}
                unit={F.returnUnit}
                help={F.returnHelp}
                error={F.rateInvalid}
                invalid={invalid.returnPercent}
              />
              <NumberField
                {...fields.bind("endAge")}
                label={F.endAgeLabel}
                unit={F.endAgeUnit}
                help={F.endAgeHelp}
                error={F.ageInvalid}
                invalid={invalid.endAge}
              />
              <NumberField
                {...fields.bind("marginal")}
                label={F.marginalLabel}
                unit={F.marginalUnit}
                help={F.marginalHelp}
                error={F.percentInvalid}
                invalid={invalid.marginal}
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
            answer={{ label: F.requiredLabel, value: answerValue }}
          />
        }
        primary={
          <>
            {/* The obligation leads. The three quantities under it stay
                separate rows — what the law requires, what the reader plans
                to take, and the tax — because the shortfall is a subtraction
                between the first two and the tax is on neither of them. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.requiredLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.requiredPercentLabel}
                value={requiredPercentValue}
              />
              <ResultRow
                label={F.plannedResultLabel}
                value={
                  result === null || input === null
                    ? null
                    : usdCents(input.plannedWithdrawal)
                }
              />
              <ResultRow
                label={F.shortfallLabel}
                value={result === null ? null : usdCents(result.shortfall)}
              />
              <ResultRow
                label={F.taxLabel}
                value={result === null ? null : usdCents(result.taxOnRequired)}
              />
            </ResultGroup>

            {/* Which of the three states the reader is in, next to the
                figures rather than below the year-by-year table. */}
            {result !== null && !result.alreadyRequired ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.notRequiredNotice}
              </p>
            ) : result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {result.planMeetsRequirement ? F.metNotice : F.shortfallNotice}
              </p>
            ) : null}

            {result !== null &&
            result.divisor !== null &&
            result.requiredPercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noBalanceNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            <ResultGroup title={F.penaltyTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.penaltyLabel}
                value={result === null ? null : usdCents(result.penalty)}
              />
              <ResultRow
                label={F.correctedLabel}
                value={
                  result === null ? null : usdCents(result.penaltyIfCorrected)
                }
              />
              <ResultRow
                label={F.divisorLabel}
                value={
                  result === null
                    ? null
                    : result.divisor === null
                      ? T.notRequired
                      : formatDecimal(result.divisor, 1)
                }
              />
            </ResultGroup>

            {/* The start age is derived from the birth year, not read off
                the table, and "0 năm" is not an answer for someone already
                past it — so the countdown row says so in words. */}
            <ResultGroup title={F.timingTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.startAgeLabel}
                value={result === null ? null : String(result.startAge)}
              />
              <ResultRow
                label={F.yearsUntilLabel}
                value={
                  result === null
                    ? null
                    : result.alreadyRequired
                      ? F.alreadyStartedValue
                      : `${result.yearsUntilRequired} ${F.yearsUnit}`
                }
              />
            </ResultGroup>

            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.startAgeFromBirthYear}
            </p>
          </>
        }
        detail={
          <>
            <ResultGroup title={F.horizonTitle} live={false}>
              <ResultRow
                label={F.totalRequiredLabel}
                value={result === null ? null : usd(result.totalRequired)}
              />
              <ResultRow
                label={F.totalTaxLabel}
                value={result === null ? null : usd(result.totalTax)}
              />
              <ResultRow
                label={F.peakAgeLabel}
                value={
                  result === null
                    ? null
                    : result.peakAge === null
                      ? F.noPeakValue
                      : String(result.peakAge)
                }
              />
              <ResultRow
                label={F.peakBalanceLabel}
                value={result === null ? null : usd(result.peakBalance)}
              />
              <ResultRow
                label={F.finalBalanceLabel}
                value={result === null ? null : usd(result.finalBalance)}
              />
            </ResultGroup>

            {/* Whichever way the projection went, said next to the peak row
                it describes. */}
            {result !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {result.peakAge === null ? F.decliningNotice : F.growingNotice}
              </p>
            ) : null}

            {rows.length > 0 ? (
              <>
                <p className="mt-8 text-sm leading-relaxed text-ink-3">
                  {T.intro}
                </p>
                <ResultTable
                  className="mt-4"
                  caption={T.caption}
                  columns={[
                    { label: T.ageColumn },
                    { label: T.divisorColumn, numeric: true },
                    { label: T.requiredColumn, numeric: true },
                    { label: T.percentColumn, numeric: true },
                    { label: T.openingColumn, numeric: true },
                    { label: T.closingColumn, numeric: true },
                  ]}
                  rows={rows}
                  // Six columns, so `mobileCards` per docs §3. Measured at a
                  // verified 390 px viewport on 2026-09-16: 605 px inside a
                  // 300 px frame, with 27 over-wide elements — the second
                  // worst count in the suite. Rows are ages, so a card per
                  // row is one year's required withdrawal beside the balance
                  // it comes from.
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
