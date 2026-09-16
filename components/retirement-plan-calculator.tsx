"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import {
  longTermMoney,
  readRetirement,
  RetirementFields,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { fill } from "@/lib/calc/charts/labels";
import { longTermTrajectoryModel } from "@/lib/calc/charts/long-term-chart";
import { fundedAtBoundary, resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const F = C.form;

/**
 * The TRAJECTORY view of the merged long-term plan (original plan row 44).
 *
 * It owns no arithmetic. The plan is `resolveLongTermPlan`, which resolves one
 * `RetirementInput` into all four views at once so this route and its three
 * siblings cannot disagree, and the figure is `longTermTrajectoryModel`. The
 * page reads fields, picks its view, and formats.
 *
 * THE FUNDED VERDICT COMES FROM `fundedAtBoundary`, NOT FROM `depletionAge`.
 * That distinction is the defect this component shipped: a sustainable spend
 * solved from a closed-form annuity factor and fed back through the projection
 * lands a hair either side of the root, so the FINAL year of a funded plan can
 * be short by a few millionths of one đồng and the projection dutifully
 * reports a depletion. Read straight off `depletionAge`, that renders as
 * "Không đủ" with a depletion age beside it. The policy forgives a residue
 * only in the final year and only when it is negligible against that year's
 * own need — a real shortfall fails both tests — and it hands back the residue
 * so this page can state what it forgave. See
 * `lib/calc/long-term-plan.ts`'s `fundedAtBoundary` docstring, and
 * `retirement-plan-render.test.ts` for the reproduction.
 */
export function RetirementPlanCalculator() {
  const fields = useCalcFields(L.defaults);
  const read = readRetirement(fields.values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  const result = plan?.asEntered ?? null;

  // The boundary policy, once. `plan.gap.funded` is the same call on the same
  // projection, so the verdict here and the gap view's cannot diverge; this
  // one is named because the page also needs the residue.
  const boundary =
    plan === null ? null : fundedAtBoundary(plan.asEntered, plan.input.endAge);
  const funded = boundary?.funded ?? false;

  /**
   * The depletion the page should SHOW.
   *
   * Null when the plan is funded, including the forgiven-residue case: a
   * funded plan that still reported "cạn ở tuổi 84" beside "Đủ" would
   * contradict itself in two adjacent rows.
   */
  const depletionAge = funded ? null : (result?.depletionAge ?? null);

  const firstWithdrawal = result?.years.find((row) => !row.accumulating);

  const chart = longTermTrajectoryModel(plan, C.chart);

  return (
    <CalculatorCard>
      <RetirementFields
        copy={L.fields}
        invalid={read.invalid}
        bind={fields.bind}
      />

      {/* The verdict and the capital in today's money lead, because the
          nominal figure is the one a reader will misuse. Optional rows are
          MOUNTED conditionally rather than nulled: `ResultRow` renders a dash
          beside a label, which reads as a figure the tool failed to find. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.verdictLabel}
          value={result === null ? null : funded ? F.verdictYes : F.verdictNo}
        />
        {depletionAge !== null ? (
          <ResultRow label={F.depletionLabel} value={String(depletionAge)} />
        ) : null}
        {result !== null && !funded && result.yearsShort > 0 ? (
          <ResultRow
            label={F.yearsShortLabel}
            value={`${result.yearsShort} ${F.yearsUnit}`}
          />
        ) : null}
        <ResultRow
          label={F.realBalanceAtRetirementLabel}
          value={
            result === null
              ? null
              : longTermMoney(result.realBalanceAtRetirement)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.nominalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.balanceAtRetirementLabel}
          value={result === null ? null : longTermMoney(result.balanceAtRetirement)}
        />
        <ResultRow
          label={F.finalBalanceLabel}
          value={result === null ? null : longTermMoney(result.finalBalance)}
        />
        <ResultRow
          label={F.realFinalBalanceLabel}
          value={result === null ? null : longTermMoney(result.realFinalBalance)}
        />
      </ResultGroup>

      <ResultGroup title={F.flowTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalContributedLabel}
          value={result === null ? null : longTermMoney(result.totalContributed)}
        />
        <ResultRow
          label={F.totalGrowthLabel}
          value={result === null ? null : longTermMoney(result.totalGrowth)}
        />
        <ResultRow
          label={F.totalWithdrawnLabel}
          value={result === null ? null : longTermMoney(result.totalWithdrawn)}
        />
        <ResultRow
          label={F.firstWithdrawalLabel}
          value={
            firstWithdrawal === undefined
              ? null
              : longTermMoney(firstWithdrawal.withdrawal)
          }
        />
        {/* The same draw in today's money. On a funded plan this is exactly
            the spend that was asked for, less other income — the identity
            `retirement.ts` keeps two deflators to preserve. */}
        <ResultRow
          label={F.firstWithdrawalRealLabel}
          value={
            firstWithdrawal === undefined
              ? null
              : longTermMoney(firstWithdrawal.realWithdrawal)
          }
        />
        <ResultRow
          label={F.initialRateLabel}
          value={
            result === null || result.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(result.initialWithdrawalRatePercent, 2)
          }
        />
        <ResultRow
          label={F.sustainableLabel}
          value={
            result === null || result.sustainableSpending === null
              ? null
              : longTermMoney(result.sustainableSpending)
          }
        />
        <ResultRow
          label={F.shortfallLabel}
          value={result === null ? null : longTermMoney(result.spendingShortfall)}
        />
      </ResultGroup>

      {/* "Cạn ở tuổi 82" counts the year the plan could not pay IN FULL, and
          that year is normally a PARTIAL payment — 181.159.463 ₫ of a
          1.288.834.386 ₫ need on the defaults. Reporting the age alone loses
          how much was actually received. Withheld entirely when the verdict is
          funded, so a forgiven residue cannot render as a real shortfall. */}
      {result !== null &&
      !funded &&
      result.lastWithdrawalPlanned !== null &&
      result.lastWithdrawalPaid !== null &&
      result.lastWithdrawalShortfall !== null ? (
        <ResultGroup title={F.partialTitle} className="mt-4" live={false}>
          <ResultRow
            label={F.partialPlannedLabel}
            value={longTermMoney(result.lastWithdrawalPlanned)}
          />
          <ResultRow
            label={F.partialPaidLabel}
            value={longTermMoney(result.lastWithdrawalPaid)}
          />
          <ResultRow
            label={F.partialShortLabel}
            value={longTermMoney(result.lastWithdrawalShortfall)}
          />
        </ResultGroup>
      ) : null}

      {result !== null ? (
        <p className="mt-6 text-sm leading-relaxed text-ink-3">
          {funded ? F.fundedNotice : F.depletionNotice}
        </p>
      ) : null}

      {/* What the boundary policy forgave, in đồng. Six decimal places: the
          residue is a fraction of one đồng by construction, and rounding it to
          the đồng would render the disclosure as "0 ₫". */}
      {boundary?.residue !== null && boundary?.residue !== undefined ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {fill(F.boundaryNotice, {
            residue: formatMoney(boundary.residue, 6),
          })}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}

      {/* Row 44's figure. Built and tested with the model slice, rendered
          nowhere until now. The exact reading is this figure's own table. */}
      <ChartFigure model={chart} className="mt-8">
        <LineChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
