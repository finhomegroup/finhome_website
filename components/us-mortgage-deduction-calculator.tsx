"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeUsMortgageDeduction,
  type DebtVintage,
  type MortgageFilingStatus,
} from "@/lib/calc/us-mortgage-deduction";
import { US_MORTGAGE_DEDUCTION as C } from "@/content/calculators/us-mortgage-deduction";

const F = C.form;

const VINTAGE_OPTIONS: readonly { value: DebtVintage; label: string }[] = [
  { value: "current", label: F.vintageOptions.current },
  { value: "grandfathered", label: F.vintageOptions.grandfathered },
];

const FILING_STATUS_OPTIONS: readonly {
  value: MortgageFilingStatus;
  label: string;
}[] = [
  { value: "jointOrOther", label: F.filingStatusOptions.jointOrOther },
  { value: "marriedSeparate", label: F.filingStatusOptions.marriedSeparate },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/** The CTA contract's two ids — literals, so prerender and hydration agree. */
const FORM_ID = "tiet-kiem-thue-vay-mua-nha-nhap";
const RESULT_ID = "tiet-kiem-thue-vay-mua-nha-ket-qua";

export function UsMortgageDeductionCalculator() {
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. Vintage and filing status are lists.
  const fields = useCalcFields(F.defaults, {
    balance: "money",
    interest: "money",
    otherItemized: "money",
    standard: "money",
    rate: "rate",
  });

  const balance = parseMoney(fields.values.balance);
  const interest = parseMoney(fields.values.interest);
  const otherItemized = parseMoney(fields.values.otherItemized);
  const standard = parseMoney(fields.values.standard);
  const rate = parseDecimal(fields.values.rate);

  const balanceInvalid = balance === null || balance < 0;
  const otherItemizedInvalid = otherItemized === null || otherItemized < 0;
  const standardInvalid = standard === null || standard < 0;
  const rateInvalid = rate === null || rate < 0 || rate > 100;
  // Interest on a zero balance is a data-entry error, and the field the
  // reader needs marked is the interest one — they typed the balance
  // deliberately.
  const interestInvalid =
    interest === null ||
    interest < 0 ||
    (balance !== null && balance === 0 && interest > 0);

  const anyInvalid =
    balanceInvalid ||
    interestInvalid ||
    otherItemizedInvalid ||
    standardInvalid ||
    rateInvalid;

  const result = anyInvalid
    ? null
    : computeUsMortgageDeduction({
        loanBalance: balance,
        annualInterest: interest,
        vintage: fields.values.vintage as DebtVintage,
        filingStatus: fields.values.filingStatus as MortgageFilingStatus,
        otherItemized,
        standardDeduction: standard,
        marginalRatePercent: rate,
      });

  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  // `ResultCta`'s `answer` contract is the same string the row renders, never
  // a second rounding of the same quantity.
  const answerValue = result === null ? null : usd(result.taxSaving);

  /*
   * CSV row 13 is "Hai cột", so `columns="split"` (and the page passes `wide`,
   * which is what gives the split room). Its action: keep the US label before
   * the form, emphasise the tax ACTUALLY saved, and put the statutory cap and
   * the deduction mechanics into a disclosure.
   *
   * The US label is already there and is not rebuilt: the registry marks this
   * slug `usRules: true`, so `CalculatorPage` renders the scope disclaimer
   * above the tool. The three regime notices were already conditional; what
   * changed is that they now sit directly under the saving they explain
   * instead of after a nine-row table.
   *
   * `sticky`, and the earlier refusal here was wrong for the same reason
   * `components/black-scholes-calculator.tsx` records. It argued that at
   * ≥1024×900 — where `.fh-cta-pin` starts acting — the split layout already
   * puts the answer beside the form. It does not: `lg:items-start` holds the
   * result column at the top of the grid, so a form taller than the viewport
   * scrolls the answer off the screen while the reader is still editing. The
   * browser pass that measured a split, `wide`, SIX-control form at 1143,75 px
   * (result region at y −382..−140 while the last field was focused) is the
   * evidence; this form has seven controls in the same shell, so the pin is
   * applied rather than declined. Its own height has NOT been measured.
   *
   * `computeUsMortgageDeduction` is untouched and every figure keeps its
   * precision, including the cents on USD and the two decimals on the share.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.loanGroup}>
              <NumberField
                {...fields.bind("balance")}
                label={F.balanceLabel}
                unit={F.balanceUnit}
                help={F.balanceHelp}
                error={F.balanceInvalid}
                invalid={balanceInvalid}
              />
              <NumberField
                {...fields.bind("interest")}
                label={F.interestLabel}
                unit={F.interestUnit}
                help={F.interestHelp}
                error={F.interestInvalid}
                invalid={interestInvalid}
              />
              <SelectField
                {...fields.bind("vintage")}
                label={F.vintageLabel}
                help={F.vintageHelp}
                options={VINTAGE_OPTIONS}
              />
              <SelectField
                {...fields.bind("filingStatus")}
                label={F.filingStatusLabel}
                help={F.filingStatusHelp}
                options={FILING_STATUS_OPTIONS}
              />
            </FieldGroup>

            <FieldGroup title={F.taxGroup} className="mt-8">
              <NumberField
                {...fields.bind("otherItemized")}
                label={F.otherItemizedLabel}
                unit={F.otherItemizedUnit}
                help={F.otherItemizedHelp}
                error={F.otherItemizedInvalid}
                invalid={otherItemizedInvalid}
              />
              <NumberField
                {...fields.bind("standard")}
                label={F.standardLabel}
                unit={F.standardUnit}
                help={F.standardHelp}
                error={F.standardInvalid}
                invalid={standardInvalid}
              />
              <NumberField
                {...fields.bind("rate")}
                label={F.rateLabel}
                unit={F.rateUnit}
                help={F.rateHelp}
                error={F.rateInvalid}
                invalid={rateInvalid}
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
            answer={{ label: F.taxSavingLabel, value: answerValue }}
          />
        }
        primary={
          <>
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              {/* The answer: the tax this loan actually saves, which on most
                  filers' numbers is far below interest × rate. */}
              <ResultRow
                label={F.taxSavingLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.savingPercentLabel}
                value={
                  result === null || result.savingAsPercentOfInterest === null
                    ? null
                    : formatPercent(result.savingAsPercentOfInterest, 2)
                }
              />
              <ResultRow
                label={F.effectiveRateLabel}
                value={
                  result === null || result.effectiveRatePercent === null
                    ? null
                    : formatPercent(result.effectiveRatePercent, 2)
                }
              />
            </ResultGroup>

            {/* WHICH OF THE THREE REGIMES the reader is in. Exactly one holds,
                and it is the sentence that makes the figure above mean
                something — so it sits under the figure, not after the table
                it used to follow. */}
            {result !== null && !result.itemizes ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noBenefitNotice}
              </p>
            ) : null}

            {result?.interestCausesItemizing ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.tipsIntoItemizingNotice}
              </p>
            ) : null}

            {result !== null &&
            result.itemizes &&
            !result.interestCausesItemizing ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.fullBenefitNotice}
              </p>
            ) : null}

            {/* The two blank supporting rows a valid entry can leave, each
                named by its own cause rather than by one shared sentence. */}
            {result !== null && result.savingAsPercentOfInterest === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noInterestNotice}
              </p>
            ) : null}

            {result !== null && result.effectiveRatePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noBalanceNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            <ResultGroup title={F.comparisonTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.naiveSavingLabel}
                value={result === null ? null : usd(result.naiveSaving)}
              />
              <ResultRow
                label={F.overstatementLabel}
                value={result === null ? null : usd(result.naiveOverstatement)}
              />
            </ResultGroup>
          </>
        }
        detail={
          <DetailDisclosure title={F.mechanicsDisclosureTitle}>
            <ResultGroup title={F.capTitle} live={false}>
              <ResultRow
                label={F.capLabel}
                value={result === null ? null : `${formatMoney(result.cap)} USD`}
              />
              <ResultRow
                label={F.deductibleShareLabel}
                value={
                  result === null
                    ? null
                    : formatPercent(result.deductibleShare * 100, 2)
                }
              />
              <ResultRow
                label={F.deductibleInterestLabel}
                value={result === null ? null : usd(result.deductibleInterest)}
              />
              <ResultRow
                label={F.disallowedInterestLabel}
                value={result === null ? null : usd(result.disallowedInterest)}
              />
            </ResultGroup>

            {/* Why part of the interest is not deductible at all — beside the
                two rows that show it, inside the same disclosure. */}
            {result !== null && result.disallowedInterest > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.capNotice}
              </p>
            ) : null}

            <ResultGroup title={F.stepsTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.itemizedWithoutLabel}
                value={
                  result === null ? null : usd(result.itemizedWithoutInterest)
                }
              />
              <ResultRow
                label={F.itemizedWithLabel}
                value={result === null ? null : usd(result.itemizedWithInterest)}
              />
              <ResultRow
                label={F.deductionTakenLabel}
                value={result === null ? null : usd(result.deductionTaken)}
              />
              <ResultRow
                label={F.effectiveDeductionLabel}
                value={result === null ? null : usd(result.effectiveDeduction)}
              />
              <ResultRow
                label={F.afterTaxInterestLabel}
                value={result === null ? null : usd(result.afterTaxInterest)}
              />
            </ResultGroup>
          </DetailDisclosure>
        }
      />
    </CalculatorCard>
  );
}
