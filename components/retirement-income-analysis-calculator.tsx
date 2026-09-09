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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  INCOME_SOURCE_KEYS,
  projectIncomeSources,
  type IncomeSourceKey,
  type RetirementIncomeSourcesInput,
} from "@/lib/calc/retirement-income-sources";
import { RETIREMENT_INCOME_ANALYSIS as C } from "@/content/calculators/retirement-income-analysis";

const F = C.form;
const ST = F.sourceTable;
const YT = F.yearTable;

/** A source that pays for life. The engine's age ceiling. */
const FOR_LIFE = 120;

/** Rows shown in the year-by-year table, plus the two rows named below. */
const TABLE_STEP = 4;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

export function RetirementIncomeAnalysisCalculator() {
  const fields = useCalcFields(F.defaults);
  const v = fields.values;

  // Ages are whole counts: parseMoney reads "72,5" as 725 and marks it
  // valid, because it discards the separator before any integer guard runs.
  const startAge = parseCount(v.startAge);
  const endAge = parseCount(v.endAge);
  const workThrough = parseCount(v.workThrough);
  const need = parseMoney(v.need);
  const social = parseMoney(v.social);
  const pension = parseMoney(v.pension);
  const work = parseMoney(v.work);
  const other = parseMoney(v.other);
  const balance = parseMoney(v.balance);
  const pensionIndex = parseDecimal(v.pensionIndex);
  const otherIndex = parseDecimal(v.otherIndex);
  const returnPercent = parseDecimal(v.returnPercent);
  const inflation = parseDecimal(v.inflation);

  const badAge = (value: number | null) =>
    value === null || !Number.isInteger(value) || value < 0 || value > FOR_LIFE;
  const badMoney = (value: number | null) => value === null || value < 0;
  const badRate = (value: number | null) =>
    value === null || value < -100 || value > 100;

  const invalid = {
    startAge: badAge(startAge),
    endAge: badAge(endAge),
    workThrough: badAge(workThrough),
    need: badMoney(need),
    social: badMoney(social),
    pension: badMoney(pension),
    work: badMoney(work),
    other: badMoney(other),
    balance: badMoney(balance),
    pensionIndex: badRate(pensionIndex),
    otherIndex: badRate(otherIndex),
    returnPercent: badRate(returnPercent),
    inflation: badRate(inflation),
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  // Two sources have their indexation WIRED rather than asked, and the
  // wiring lives here rather than in the module: "Social Security is
  // COLA-indexed" is a statement about United States statute, and a module
  // that hard-coded one source's rate would be encoding one country's law
  // into arithmetic. Part-time pay tracks wages, so it follows inflation too.
  const input: RetirementIncomeSourcesInput | null = anyInvalid
    ? null
    : {
        startAge: startAge!,
        endAge: endAge!,
        annualNeed: need!,
        inflationPercent: inflation!,
        portfolioBalance: balance!,
        portfolioReturnPercent: returnPercent!,
        sources: {
          social: {
            annualAmount: social!,
            indexationPercent: inflation!,
            throughAge: FOR_LIFE,
          },
          pension: {
            annualAmount: pension!,
            indexationPercent: pensionIndex!,
            throughAge: FOR_LIFE,
          },
          work: {
            annualAmount: work!,
            indexationPercent: inflation!,
            throughAge: workThrough!,
          },
          other: {
            annualAmount: other!,
            indexationPercent: otherIndex!,
            throughAge: FOR_LIFE,
          },
        },
      };

  const result = input === null ? null : projectIncomeSources(input);

  const sourceRows = result
    ? [
        ...INCOME_SOURCE_KEYS.map((key: IncomeSourceKey) => {
          const kept = result.realValueKeptPercent[key];
          const lastNominal = result.last.bySource[key];
          return [
            ST.names[key],
            usd(result.first.bySource[key]),
            lastNominal <= 0 ? null : usd(lastNominal),
            lastNominal <= 0 ? null : usd(result.last.realBySource[key]),
            kept === null ? null : formatPercent(kept, 1),
            result.realTotalNeed <= 0
              ? null
              : formatPercent(
                  (result.realTotalBySource[key] / result.realTotalNeed) * 100,
                  1,
                ),
          ];
        }),
        [
          ST.portfolioName,
          usd(result.first.withdrawal),
          usd(result.last.withdrawal),
          usd(result.last.realWithdrawal),
          null,
          result.realTotalNeed <= 0
            ? null
            : formatPercent(
                (result.realTotalWithdrawn / result.realTotalNeed) * 100,
                1,
              ),
        ],
        [
          ST.needName,
          usd(result.first.need),
          usd(result.last.need),
          usd(result.last.realNeed),
          null,
          result.realTotalNeed <= 0 ? null : formatPercent(100, 1),
        ],
      ]
    : [];

  const yearRows = result
    ? result.years
        .filter(
          (row, index) =>
            index % TABLE_STEP === 0 ||
            row.age === workThrough ||
            index === result.years.length - 1,
        )
        .map((row) => [
          String(row.age),
          usd(row.need),
          usd(row.fixedIncome),
          row.fixedCoveragePercent === null
            ? null
            : formatPercent(row.fixedCoveragePercent, 1),
          usd(row.withdrawal),
          usd(row.realWithdrawal),
          usd(row.realBalance),
        ])
    : [];

  return (
    <CalculatorCard>
      <FieldGroup title={F.needGroup}>
        <NumberField
          {...fields.bind("startAge")}
          label={F.startAgeLabel}
          unit={F.startAgeUnit}
          help={F.startAgeHelp}
          error={F.ageInvalid}
          invalid={invalid.startAge}
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
          {...fields.bind("need")}
          label={F.needLabel}
          unit={F.needUnit}
          help={F.needHelp}
          error={F.moneyInvalid}
          invalid={invalid.need}
        />
      </FieldGroup>

      <FieldGroup title={F.fixedGroup} className="mt-8">
        <NumberField
          {...fields.bind("social")}
          label={F.socialLabel}
          unit={F.socialUnit}
          help={F.socialHelp}
          error={F.moneyInvalid}
          invalid={invalid.social}
        />
        <NumberField
          {...fields.bind("pension")}
          label={F.pensionLabel}
          unit={F.pensionUnit}
          help={F.pensionHelp}
          error={F.moneyInvalid}
          invalid={invalid.pension}
        />
        <NumberField
          {...fields.bind("pensionIndex")}
          label={F.pensionIndexLabel}
          unit={F.pensionIndexUnit}
          help={F.pensionIndexHelp}
          error={F.rateInvalid}
          invalid={invalid.pensionIndex}
        />
      </FieldGroup>

      <FieldGroup title={F.flexGroup} className="mt-8">
        <NumberField
          {...fields.bind("work")}
          label={F.workLabel}
          unit={F.workUnit}
          help={F.workHelp}
          error={F.moneyInvalid}
          invalid={invalid.work}
        />
        <NumberField
          {...fields.bind("workThrough")}
          label={F.workThroughLabel}
          unit={F.workThroughUnit}
          help={F.workThroughHelp}
          error={F.ageInvalid}
          invalid={invalid.workThrough}
        />
        <NumberField
          {...fields.bind("other")}
          label={F.otherLabel}
          unit={F.otherUnit}
          help={F.otherHelp}
          error={F.moneyInvalid}
          invalid={invalid.other}
        />
        <NumberField
          {...fields.bind("otherIndex")}
          label={F.otherIndexLabel}
          unit={F.otherIndexUnit}
          help={F.otherIndexHelp}
          error={F.rateInvalid}
          invalid={invalid.otherIndex}
        />
      </FieldGroup>

      <FieldGroup title={F.portfolioGroup} className="mt-8">
        <NumberField
          {...fields.bind("balance")}
          label={F.balanceLabel}
          unit={F.balanceUnit}
          help={F.balanceHelp}
          error={F.moneyInvalid}
          invalid={invalid.balance}
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
          {...fields.bind("inflation")}
          label={F.inflationLabel}
          unit={F.inflationUnit}
          help={F.inflationHelp}
          error={F.rateInvalid}
          invalid={invalid.inflation}
        />
      </FieldGroup>

      {/* Both ends of retirement, side by side. A page that reported only
          the first year would say this plan covers 82,5% of the need and
          stop there. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.firstCoverageLabel}
          value={
            result === null || result.first.fixedCoveragePercent === null
              ? null
              : formatPercent(result.first.fixedCoveragePercent, 1)
          }
        />
        <ResultRow
          label={F.lastCoverageLabel}
          value={
            result === null || result.last.fixedCoveragePercent === null
              ? null
              : formatPercent(result.last.fixedCoveragePercent, 1)
          }
        />
        <ResultRow
          label={F.firstDrawLabel}
          value={result === null ? null : usd(result.first.realWithdrawal)}
        />
        <ResultRow
          label={F.lastDrawLabel}
          value={result === null ? null : usd(result.last.realWithdrawal)}
        />
      </ResultGroup>

      <ResultGroup title={F.portfolioTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.initialRateLabel}
          value={
            result === null || result.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(result.initialWithdrawalRatePercent, 2)
          }
        />
        <ResultRow
          label={F.depletionLabel}
          value={
            result === null || result.depletionAge === null
              ? null
              : String(result.depletionAge)
          }
        />
        <ResultRow
          label={F.unmetLabel}
          value={
            result === null || result.firstUnmetAge === null
              ? null
              : String(result.firstUnmetAge)
          }
        />
        <ResultRow
          label={F.finalRealLabel}
          value={result === null ? null : usd(result.last.realBalance)}
        />
      </ResultGroup>

      {sourceRows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{ST.intro}</p>
          <ResultTable
            className="mt-4"
            caption={ST.caption}
            columns={[
              { label: ST.sourceColumn },
              { label: ST.firstColumn, numeric: true },
              { label: ST.lastNominalColumn, numeric: true },
              { label: ST.lastRealColumn, numeric: true },
              { label: ST.keptColumn, numeric: true },
              { label: ST.shareColumn, numeric: true },
            ]}
            rows={sourceRows}
          />
        </>
      ) : null}

      {yearRows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{YT.intro}</p>
          <ResultTable
            className="mt-4"
            caption={YT.caption}
            columns={[
              { label: YT.ageColumn },
              { label: YT.needColumn, numeric: true },
              { label: YT.fixedColumn, numeric: true },
              { label: YT.coverageColumn, numeric: true },
              { label: YT.drawColumn, numeric: true },
              { label: YT.realDrawColumn, numeric: true },
              { label: YT.balanceColumn, numeric: true },
            ]}
            rows={yearRows}
          />
        </>
      ) : null}

      {result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.firstUnmetAge === null ? F.coveredNotice : F.unmetNotice}
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
