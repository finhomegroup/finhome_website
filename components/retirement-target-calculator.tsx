"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import {
  readRetirement,
  RetirementFields,
  RETIREMENT_DEFAULTS,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import {
  projectRetirement,
  solveRequiredContribution,
} from "@/lib/calc/retirement";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

const F = C.form;
const T = F.table;

/** The contribution is solved, so the field is not rendered. */
const OMIT = ["annualContribution"] as const;

const TABLE_STEP = 5;

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

/**
 * The contribution rows carry cents; the balances do not.
 *
 * This is the number a reader will copy into a standing order, and the gap
 * between the plans this page compares is decided in the tens of dollars —
 * 1.163,04 against 1.428,46 a month. Rounding those to whole dollars would
 * hide a distinction the page then goes on to explain. Balances in the
 * millions get no such benefit, and match the sibling projection page.
 */
function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

export function RetirementTargetCalculator() {
  const fields = useCalcFields(RETIREMENT_DEFAULTS);
  const read = readRetirement(fields.values, OMIT);

  const solved = read.input === null ? null : solveRequiredContribution(read.input);

  // Two different failures need two different messages, and only the engine
  // can tell them apart: the ages may be contradictory (nothing can be
  // solved) or they may be fine while no contribution in the searched
  // bracket funds the plan. Projecting at zero asks exactly that question.
  const inputsUsable =
    read.input !== null && projectRetirement(read.input) !== null;

  const projection = solved?.projection ?? null;
  const lastAccumulating = projection?.years
    .filter((row) => row.accumulating)
    .at(-1);

  const rows =
    projection && read.input
      ? projection.years
          .filter(
            (row, index) =>
              index % TABLE_STEP === 0 ||
              row.age === read.input!.retirementAge ||
              row.age === read.input!.retirementAge - 1 ||
              index === projection.years.length - 1,
          )
          .map((row) => [
            String(row.age),
            row.accumulating ? T.accumulating : T.drawing,
            usd(row.contribution),
            usd(row.withdrawal),
            usd(row.balance),
            usd(row.realBalance),
          ])
      : [];

  return (
    <CalculatorCard>
      <RetirementFields
        copy={C.fields}
        invalid={read.invalid}
        bind={fields.bind}
        omit={OMIT}
      />

      {/* The first-year figure leads, and the last-year figure sits directly
          under it: the growth assumption is the part a reader would
          otherwise carry away wrong. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.monthlyLabel}
          value={solved === null ? null : usdCents(solved.monthlyContribution)}
        />
        <ResultRow
          label={F.annualLabel}
          value={solved === null ? null : usdCents(solved.annualContribution)}
        />
        <ResultRow
          label={F.lastMonthlyLabel}
          value={
            lastAccumulating === undefined
              ? null
              : usdCents(lastAccumulating.contribution / 12)
          }
        />
        <ResultRow
          label={F.realBalanceLabel}
          value={
            projection === null
              ? null
              : usd(projection.realBalanceAtRetirement)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.checkTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.nominalBalanceLabel}
          value={
            projection === null ? null : usd(projection.balanceAtRetirement)
          }
        />
        <ResultRow
          label={F.totalContributedLabel}
          value={projection === null ? null : usd(projection.totalContributed)}
        />
        <ResultRow
          label={F.totalGrowthLabel}
          value={projection === null ? null : usd(projection.totalGrowth)}
        />
        <ResultRow
          label={F.initialRateLabel}
          value={
            projection === null ||
            projection.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(projection.initialWithdrawalRatePercent, 2)
          }
        />
        <ResultRow
          label={F.sustainableLabel}
          value={
            projection === null || projection.sustainableSpending === null
              ? null
              : usd(projection.sustainableSpending)
          }
        />
        <ResultRow
          label={F.finalBalanceLabel}
          value={projection === null ? null : usd(projection.finalBalance)}
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
              { label: T.phaseColumn },
              { label: T.contributionColumn, numeric: true },
              { label: T.withdrawalColumn, numeric: true },
              { label: T.balanceColumn, numeric: true },
              { label: T.realBalanceColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {solved?.alreadyFunded ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.fundedNotice}
        </p>
      ) : null}

      {inputsUsable && solved === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.unsolvableNotice}
        </p>
      ) : null}

      {!inputsUsable ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
