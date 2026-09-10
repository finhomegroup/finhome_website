"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  computeUsHsa,
  HSA_YEAR_ORDER,
  type HsaCoverage,
} from "@/lib/calc/us-hsa";
import { type FilingStatus } from "@/lib/calc/us-payroll";
import { US_HSA as C } from "@/content/calculators/us-hsa";

const F = C.form;

const YEAR_OPTIONS = HSA_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

const COVERAGE_OPTIONS: readonly { value: HsaCoverage; label: string }[] = [
  { value: "family", label: F.coverageOptions.family },
  { value: "selfOnly", label: F.coverageOptions.selfOnly },
];

const PAYROLL_OPTIONS = [
  { value: "yes", label: F.payrollOptions.yes },
  { value: "no", label: F.payrollOptions.no },
];

const LAST_MONTH_OPTIONS = [
  { value: "no", label: F.lastMonthOptions.no },
  { value: "yes", label: F.lastMonthOptions.yes },
];

const STATUS_OPTIONS: readonly { value: FilingStatus; label: string }[] = [
  { value: "single", label: F.statusOptions.single },
  { value: "married", label: F.statusOptions.married },
  { value: "marriedSeparate", label: F.statusOptions.marriedSeparate },
  { value: "head", label: F.statusOptions.head },
];

function usd(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function UsHsaCalculator() {
  const fields = useCalcFields(F.defaults);
  const viaPayroll = fields.values.payroll === "yes";

  const age = parseCount(fields.values.age);
  const eligibleMonths = parseCount(fields.values.eligibleMonths);
  const contribution = parseMoney(fields.values.contribution);
  const employer = parseMoney(fields.values.employer);
  const wages = parseMoney(fields.values.wages);
  const federal = parseDecimal(fields.values.federal);
  const state = parseDecimal(fields.values.state);
  const balance = parseMoney(fields.values.balance);
  const returnRate = parseDecimal(fields.values.return);
  const years = parseCount(fields.values.years);

  const useLastMonthRule = fields.values.lastMonth === "yes";
  const ageInvalid = age === null || age < 0 || age > 120;
  const eligibleMonthsInvalid =
    eligibleMonths === null ||
    eligibleMonths < 0 ||
    eligibleMonths > 12 ||
    (useLastMonthRule && eligibleMonths === 0);
  const contributionInvalid = contribution === null || contribution < 0;
  const employerInvalid = employer === null || employer < 0;
  const wagesInvalid = viaPayroll && (wages === null || wages < 0);
  const federalInvalid = federal === null || federal < 0 || federal > 100;
  const stateInvalid = state === null || state < 0 || state > 100;
  const balanceInvalid = balance === null || balance < 0;
  const returnInvalid =
    returnRate === null || returnRate < -100 || returnRate > 100;
  const yearsInvalid =
    years === null || !Number.isInteger(years) || years < 0 || years > 70;

  const anyInvalid =
    ageInvalid ||
    eligibleMonthsInvalid ||
    contributionInvalid ||
    employerInvalid ||
    wagesInvalid ||
    federalInvalid ||
    stateInvalid ||
    balanceInvalid ||
    returnInvalid ||
    yearsInvalid;

  const result = anyInvalid
    ? null
    : computeUsHsa({
        year: Number(fields.values.year),
        coverage: fields.values.coverage as HsaCoverage,
        age,
        eligibleMonths,
        useLastMonthRule,
        contribution,
        employerContribution: employer,
        federalRatePercent: federal,
        stateRatePercent: state,
        viaPayroll,
        annualWagesBeforeHsa: wages ?? 0,
        filingStatus: fields.values.status as FilingStatus,
        currentBalance: balance,
        returnPercent: returnRate,
        years,
      });

  const viaCheque = fields.values.payroll === "no";

  return (
    <CalculatorCard>
      <FieldGroup title={F.accountGroup}>
        <SelectField
          {...fields.bind("year")}
          label={F.yearLabel}
          help={F.yearHelp}
          options={YEAR_OPTIONS}
        />
        <SelectField
          {...fields.bind("coverage")}
          label={F.coverageLabel}
          help={F.coverageHelp}
          options={COVERAGE_OPTIONS}
        />
        <NumberField
          {...fields.bind("age")}
          label={F.ageLabel}
          unit={F.ageUnit}
          help={F.ageHelp}
          error={F.ageInvalid}
          invalid={ageInvalid}
        />
        <NumberField
          {...fields.bind("eligibleMonths")}
          label={F.eligibleMonthsLabel}
          unit={F.eligibleMonthsUnit}
          help={F.eligibleMonthsHelp}
          error={F.eligibleMonthsInvalid}
          invalid={eligibleMonthsInvalid}
        />
        <RadioGroupField
          {...fields.bind("lastMonth")}
          legend={F.lastMonthLabel}
          help={F.lastMonthHelp}
          options={LAST_MONTH_OPTIONS}
        />
      </FieldGroup>

      <FieldGroup title={F.contributionGroup} className="mt-8">
        <NumberField
          {...fields.bind("contribution")}
          label={F.contributionLabel}
          unit={F.contributionUnit}
          help={F.contributionHelp}
          error={F.contributionInvalid}
          invalid={contributionInvalid}
        />
        <NumberField
          {...fields.bind("employer")}
          label={F.employerLabel}
          unit={F.employerUnit}
          help={F.employerHelp}
          error={F.employerInvalid}
          invalid={employerInvalid}
        />
        <RadioGroupField
          {...fields.bind("payroll")}
          legend={F.payrollLabel}
          help={F.payrollHelp}
          options={PAYROLL_OPTIONS}
        />
        {viaPayroll ? (
          <>
            <NumberField
              {...fields.bind("wages")}
              label={F.wagesLabel}
              unit={F.wagesUnit}
              help={F.wagesHelp}
              error={F.wagesInvalid}
              invalid={wagesInvalid}
            />
            <SelectField
              {...fields.bind("status")}
              label={F.statusLabel}
              help={F.statusHelp}
              options={STATUS_OPTIONS}
            />
          </>
        ) : null}
      </FieldGroup>

      <FieldGroup title={F.taxGroup} className="mt-8">
        <NumberField
          {...fields.bind("federal")}
          label={F.federalLabel}
          unit={F.federalUnit}
          help={F.federalHelp}
          error={F.federalInvalid}
          invalid={federalInvalid}
        />
        <NumberField
          {...fields.bind("state")}
          label={F.stateLabel}
          unit={F.stateUnit}
          help={F.stateHelp}
          error={F.stateInvalid}
          invalid={stateInvalid}
        />
      </FieldGroup>

      <FieldGroup title={F.projectionGroup} className="mt-8">
        <NumberField
          {...fields.bind("balance")}
          label={F.balanceLabel}
          unit={F.balanceUnit}
          help={F.balanceHelp}
          error={F.balanceInvalid}
          invalid={balanceInvalid}
        />
        <NumberField
          {...fields.bind("return")}
          label={F.returnLabel}
          unit={F.returnUnit}
          help={F.returnHelp}
          error={F.returnInvalid}
          invalid={returnInvalid}
        />
        <NumberField
          {...fields.bind("years")}
          label={F.yearsLabel}
          unit={F.yearsUnit}
          help={F.yearsHelp}
          error={F.yearsInvalid}
          invalid={yearsInvalid}
        />
      </FieldGroup>

      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.totalSavedLabel}
          value={result === null ? null : usd(result.firstYearTaxSaved)}
        />
        <ResultRow
          label={F.netCostLabel}
          value={result === null ? null : usd(result.netCostOfContribution)}
        />
        <ResultRow
          label={F.incomeTaxSavedLabel}
          value={result === null ? null : usd(result.incomeTaxSaved)}
        />
        <ResultRow
          label={F.ficaSavedLabel}
          value={result === null ? null : usd(result.ficaSaved)}
        />
      </ResultGroup>

      <ResultGroup title={F.limitTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.fullYearBaseLimitLabel}
          value={
            result === null
              ? null
              : `${formatMoney(result.fullYearBaseLimit)} USD`
          }
        />
        <ResultRow
          label={F.baseLimitLabel}
          value={result === null ? null : `${formatMoney(result.baseLimit)} USD`}
        />
        <ResultRow
          label={F.catchUpLabel}
          value={
            result === null
              ? null
              : `${formatMoney(result.catchUpAvailable)} USD`
          }
        />
        <ResultRow
          label={F.totalLimitLabel}
          value={
            result === null ? null : `${formatMoney(result.totalLimit)} USD`
          }
        />
        <ResultRow
          label={F.totalContributionLabel}
          value={result === null ? null : usd(result.totalContribution)}
        />
        <ResultRow
          label={F.remainingRoomLabel}
          value={result === null ? null : usd(result.remainingRoom)}
        />
        <ResultRow
          label={F.excessLabel}
          value={result === null ? null : usd(result.excessContribution)}
        />
      </ResultGroup>

      <ResultGroup title={F.projectionTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.projectedBalanceLabel}
          value={result === null ? null : usd(result.projectedBalance)}
        />
        <ResultRow
          label={F.totalContributedLabel}
          value={result === null ? null : usd(result.totalContributed)}
        />
        <ResultRow
          label={F.growthLabel}
          value={result === null ? null : usd(result.projectedGrowth)}
        />
        <ResultRow
          label={F.taxOnGrowthLabel}
          value={result === null ? null : usd(result.taxOnGrowthIfTaxable)}
        />
      </ResultGroup>

      <ResultGroup title={F.withdrawalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.ageAtHorizonLabel}
          value={result === null ? null : `${formatMoney(result.ageAtHorizon)}`}
        />
        <ResultRow
          label={F.medicalLabel}
          value={result === null ? null : usd(result.medicalWithdrawalTax)}
        />
        <ResultRow
          label={F.nonMedicalTaxLabel}
          value={result === null ? null : usd(result.nonMedicalTax)}
        />
        <ResultRow
          label={F.nonMedicalPenaltyLabel}
          value={result === null ? null : usd(result.nonMedicalPenalty)}
        />
        <ResultRow
          label={F.nonMedicalNetLabel}
          value={result === null ? null : usd(result.nonMedicalNet)}
        />
      </ResultGroup>

      {result !== null && result.excessContribution > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.excessNotice}
        </p>
      ) : null}

      {viaCheque ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.chequeNotice}
        </p>
      ) : null}

      {result?.lastMonthRuleApplied ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.lastMonthNotice}
        </p>
      ) : null}

      {result !== null && result.eligibilityFactor < 1 && !result.lastMonthRuleApplied ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.proratedNotice}
        </p>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.penaltyApplies ? F.penaltyNotice : F.noPenaltyNotice}
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
