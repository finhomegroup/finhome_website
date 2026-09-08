"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
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
} from "@/lib/calc/us-mortgage-deduction";
import { US_MORTGAGE_DEDUCTION as C } from "@/content/calculators/us-mortgage-deduction";

const F = C.form;

const VINTAGE_OPTIONS: readonly { value: DebtVintage; label: string }[] = [
  { value: "current", label: F.vintageOptions.current },
  { value: "grandfathered", label: F.vintageOptions.grandfathered },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsMortgageDeductionCalculator() {
  const fields = useCalcFields(F.defaults);

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
        otherItemized,
        standardDeduction: standard,
        marginalRatePercent: rate,
      });

  return (
    <CalculatorCard>
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

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.taxSavingLabel}
          value={result === null ? null : usd(result.taxSaving)}
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

      <ResultGroup title={F.detailTitle} className="mt-4" live={false}>
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
        <ResultRow
          label={F.itemizedWithoutLabel}
          value={result === null ? null : usd(result.itemizedWithoutInterest)}
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

      {/* Exactly one of the three regimes applies, and which one is the
          reader's real answer — so the page names it rather than leaving
          them to infer it from the numbers. */}
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

      {result !== null && result.itemizes && !result.interestCausesItemizing ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.fullBenefitNotice}
        </p>
      ) : null}

      {result !== null && result.disallowedInterest > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.capNotice}
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
