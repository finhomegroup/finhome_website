"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseMoney,
} from "@/lib/calc/number";
import {
  benefitFactorPercent,
  EARLIEST_CLAIM_AGE,
  EARNINGS_TEST,
  earningsTestWithholding,
  fullRetirementAgeMonths,
  householdBenefit,
  LATEST_CLAIM_AGE,
  splitAgeMonths,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_PAYOUT as C } from "@/content/calculators/us-social-security-payout";

const F = C.form;
const T = F.table;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function ageLabel(months: number): string {
  const split = splitAgeMonths(months);
  return split.months === 0
    ? `${split.years} ${F.yearsUnitShort}`
    : `${split.years} ${F.yearsUnitShort} ${split.months} ${F.monthsUnit}`;
}

export function UsSocialSecurityPayoutCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  const pia = parseMoney(v.pia);
  const spousePia = parseMoney(v.spousePia);
  const earnings = parseMoney(v.earnings);
  const exemptUnderFra = parseMoney(v.exemptUnderFra);
  const exemptFraYear = parseMoney(v.exemptFraYear);
  const birthYear = parseCount(v.birthYear);
  const spouseBirthYear = parseCount(v.spouseBirthYear);
  const claimAge = parseCount(v.claimAge);
  const spouseClaimAge = parseCount(v.spouseClaimAge);

  const badYear = (value: number | null) =>
    value === null || value < 1900 || value > 2100;
  const badClaimAge = (value: number | null) =>
    value === null || value < EARLIEST_CLAIM_AGE || value > LATEST_CLAIM_AGE;
  const badMoney = (value: number | null) => value === null || value < 0;

  const invalid = {
    pia: badMoney(pia),
    spousePia: badMoney(spousePia),
    earnings: badMoney(earnings),
    exemptUnderFra: badMoney(exemptUnderFra),
    exemptFraYear: badMoney(exemptFraYear),
    birthYear: badYear(birthYear),
    spouseBirthYear: badYear(spouseBirthYear),
    claimAge: badClaimAge(claimAge),
    spouseClaimAge: badClaimAge(spouseClaimAge),
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const fraMonths = birthYear === null ? null : fullRetirementAgeMonths(birthYear);
  const spouseFraMonths =
    spouseBirthYear === null ? null : fullRetirementAgeMonths(spouseBirthYear);

  const household =
    anyInvalid || fraMonths === null || spouseFraMonths === null
      ? null
      : householdBenefit({
          pia: pia!,
          workerFraMonths: fraMonths,
          workerClaimMonths: claimAge! * 12,
          spousePia: spousePia!,
          spouseFraMonths,
          spouseClaimMonths: spouseClaimAge! * 12,
        });

  // Which exempt amount applies is decided by the claiming age against the
  // WHOLE year full retirement age falls in: below it the 1-in-2 test with
  // the lower amount, in that year the 1-in-3 test with the higher one, and
  // from the following year the test does not apply at all. A month-level
  // rule would need a claiming month the page does not ask for.
  const fraWholeYear = fraMonths === null ? null : Math.floor(fraMonths / 12);
  const inFraYear = fraWholeYear !== null && claimAge === fraWholeYear;
  const atOrAboveFra = fraWholeYear !== null && claimAge !== null
    ? claimAge > fraWholeYear
    : false;
  const exemptApplied = inFraYear ? exemptFraYear : exemptUnderFra;
  const ratioApplied = inFraYear
    ? EARNINGS_TEST.fraYearWithholdingRatio
    : EARNINGS_TEST.underFraWithholdingRatio;

  const test =
    household === null || exemptApplied === null
      ? null
      : earningsTestWithholding({
          annualBenefit: household.workerMonthly * 12,
          annualEarnings: earnings!,
          exemptAmount: exemptApplied,
          withholdingRatio: ratioApplied,
          atOrAboveFra,
        });

  const rows =
    anyInvalid || fraMonths === null || spouseFraMonths === null
      ? []
      : Array.from(
          { length: LATEST_CLAIM_AGE - EARLIEST_CLAIM_AGE + 1 },
          (_, index) => EARLIEST_CLAIM_AGE + index,
        ).map((age) => {
          const at = householdBenefit({
            pia: pia!,
            workerFraMonths: fraMonths,
            workerClaimMonths: age * 12,
            spousePia: spousePia!,
            spouseFraMonths,
            spouseClaimMonths: spouseClaimAge! * 12,
          });
          return [
            String(age),
            at === null ? null : usd(at.workerMonthly),
            at === null ? null : usd(at.spouseReceivesMonthly),
            at === null ? null : usd(at.householdMonthly),
            at === null ? null : usd(at.survivorMonthly),
          ];
        });

  const workerFactor =
    fraMonths === null || claimAge === null
      ? null
      : benefitFactorPercent(fraMonths, claimAge * 12);

  return (
    <CalculatorCard>
      <FieldGroup title={F.workerGroup}>
        <NumberField
          {...fields.bind("pia")}
          label={F.piaLabel}
          unit={F.piaUnit}
          help={F.piaHelp}
          error={F.moneyInvalid}
          invalid={invalid.pia}
        />
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

      <FieldGroup title={F.spouseGroup} className="mt-8">
        <NumberField
          {...fields.bind("spousePia")}
          label={F.spousePiaLabel}
          unit={F.spousePiaUnit}
          help={F.spousePiaHelp}
          error={F.moneyInvalid}
          invalid={invalid.spousePia}
        />
        <NumberField
          {...fields.bind("spouseBirthYear")}
          label={F.spouseBirthYearLabel}
          help={F.spouseBirthYearHelp}
          error={F.yearInvalid}
          invalid={invalid.spouseBirthYear}
        />
        <NumberField
          {...fields.bind("spouseClaimAge")}
          label={F.spouseClaimAgeLabel}
          unit={F.spouseClaimAgeUnit}
          help={F.spouseClaimAgeHelp}
          error={F.claimAgeInvalid}
          invalid={invalid.spouseClaimAge}
        />
      </FieldGroup>

      <FieldGroup title={F.earningsGroup} className="mt-8">
        <NumberField
          {...fields.bind("earnings")}
          label={F.earningsLabel}
          unit={F.earningsUnit}
          help={F.earningsHelp}
          error={F.moneyInvalid}
          invalid={invalid.earnings}
        />
        <NumberField
          {...fields.bind("exemptUnderFra")}
          label={F.exemptUnderFraLabel}
          unit={F.exemptUnderFraUnit}
          help={F.exemptUnderFraHelp}
          error={F.moneyInvalid}
          invalid={invalid.exemptUnderFra}
        />
        <NumberField
          {...fields.bind("exemptFraYear")}
          label={F.exemptFraYearLabel}
          unit={F.exemptFraYearUnit}
          help={F.exemptFraYearHelp}
          error={F.moneyInvalid}
          invalid={invalid.exemptFraYear}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.householdMonthlyLabel}
          value={household === null ? null : usd(household.householdMonthly)}
        />
        <ResultRow
          label={F.householdAnnualLabel}
          value={household === null ? null : usd(household.householdAnnual)}
        />
        <ResultRow
          label={F.workerMonthlyLabel}
          value={household === null ? null : usd(household.workerMonthly)}
        />
        <ResultRow
          label={F.spouseMonthlyLabel}
          value={
            household === null ? null : usd(household.spouseReceivesMonthly)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.spouseTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.spouseOwnLabel}
          value={household === null ? null : usd(household.spouseOwnMonthly)}
        />
        <ResultRow
          label={F.spousalLabel}
          value={household === null ? null : usd(household.spousalMonthly)}
        />
        <ResultRow
          label={F.spouseReceivesLabel}
          value={
            household === null ? null : usd(household.spouseReceivesMonthly)
          }
        />
        <ResultRow
          label={F.survivorLabel}
          value={household === null ? null : usd(household.survivorMonthly)}
        />
      </ResultGroup>

      <ResultGroup title={F.earningsTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.exemptAppliedLabel}
          value={test === null || test.exempt ? null : usd(test.exemptAmount)}
        />
        <ResultRow
          label={F.excessLabel}
          value={test === null ? null : usd(test.excessEarnings)}
        />
        <ResultRow
          label={F.withheldLabel}
          value={test === null ? null : usd(test.withheld)}
        />
        <ResultRow
          label={F.paidLabel}
          value={test === null ? null : usd(test.paid)}
        />
        <ResultRow
          label={F.effectiveMonthlyLabel}
          value={test === null ? null : usd(test.paid / 12)}
        />
      </ResultGroup>

      <ResultGroup title={F.ageTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.yourFraLabel}
          value={fraMonths === null ? null : ageLabel(fraMonths)}
        />
        <ResultRow
          label={F.spouseFraLabel}
          value={spouseFraMonths === null ? null : ageLabel(spouseFraMonths)}
        />
        <ResultRow
          label={F.yourFactorLabel}
          value={workerFactor === null ? null : formatPercent(workerFactor, 2)}
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
              { label: T.workerColumn, numeric: true },
              { label: T.spousalColumn, numeric: true },
              { label: T.householdColumn, numeric: true },
              { label: T.survivorColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      <p className="mt-6 text-sm leading-relaxed text-ink-3">
        {F.exemptNotice}
      </p>

      {household !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {household.spouseOnSpousalBenefit
            ? F.spousalTopUpNotice
            : F.ownRecordNotice}
        </p>
      ) : null}

      {test !== null && test.withheld > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.withheldNotice}
        </p>
      ) : null}

      {household === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
