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
import { longTermWithdrawalModel } from "@/lib/calc/charts/long-term-chart";
import {
  resolveLongTermPlan,
  type LongTermPlan,
  type WithdrawalPath,
} from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

const F = C.form;

/**
 * The spend is solved, so the field is not rendered.
 *
 * Its VALUE is still read — `readRetirement` parses every key it finds and
 * `omit` only skips the invalid marking — so the shared scenario's desired
 * spend is the benchmark the alternative paths and the shortfall row are
 * measured against. The page states that figure and says where it comes from;
 * a number that drives the answer and appears nowhere would be the mirror
 * image of the defect `omit` exists to prevent.
 */
const OMIT = ["desiredAnnualSpending"] as const;

/**
 * The figure's labels, with each path named by its own horizon and outcome.
 *
 * Exported and pure so a test can assert the marker strings without rendering
 * anything — `components/retirement-income-render.test.ts` does exactly that.
 *
 * WHY A PATH'S NAME CARRIES ITS OUTCOME. `longTermWithdrawalModel` builds the
 * depletion markers itself and fills `{path}` from these labels, so the label
 * is the only per-path channel into a marker line. A browser review found what
 * that costs when the names are plain: both unfunded paths spend the same
 * amount from the same capital, so they deplete at the SAME age, and the
 * figure printed two marker lines whose facts were identical while the years
 * each path leaves unfunded — three against a horizon of 85, eight against 90
 * — appeared nowhere in it. The name is where that fact can live, so it lives
 * there, and the same name is what the legend, the figure's table and the
 * verdict rows all show. One set of names, no drift.
 *
 * Every figure comes from the resolved plan. `endAge` is the path's OWN
 * horizon rather than `input.endAge + LONGEVITY_STRESS_YEARS` re-derived here,
 * because the engine already decided it.
 */
export function withdrawalChartLabels(plan: LongTermPlan | null) {
  const nameOf = (key: WithdrawalPath["key"], template: string): string => {
    const path = plan?.withdrawal.paths.find((entry) => entry.key === key);
    // An absent path is never named: the model only reads the label of a path
    // it drew, and the verdict rows below are mounted from the plan's own path
    // list. So the unfilled template cannot reach a reader — which
    // `retirement-income-render.test.ts` asserts by looking for a stray `{`.
    if (path === undefined) return template;
    return fill(template, {
      endAge: String(path.endAge),
      outcome: path.funded
        ? C.chart.outcomeFunded
        : fill(C.chart.outcomeShort, {
            short: String(path.projection.yearsShort),
          }),
    });
  };

  return {
    ...C.chart,
    asEnteredPath: nameOf("asEntered", C.chart.asEnteredPath),
    sustainablePath: nameOf("sustainable", C.chart.sustainablePath),
    longerLifePath: nameOf("longerLife", C.chart.longerLifePath),
  };
}

/**
 * The WITHDRAWAL view of the merged long-term plan (original plan row 50).
 *
 * It owns no arithmetic. The plan is `resolveLongTermPlan`, which resolves one
 * `RetirementInput` into all four views at once so this route and its three
 * siblings cannot disagree, and the figure is `longTermWithdrawalModel`. The
 * page reads fields, picks its view, and formats.
 *
 * EVERY FUNDED VERDICT HERE IS `path.funded`, NEVER `depletionAge === null`.
 * That distinction is the defect this family shipped, and it lands hardest on
 * this route: the draw this page computes is `sustainableSpending`, solved
 * from a closed-form annuity factor, and feeding a closed-form root back
 * through the year-by-year projection lands a hair either side of it. When it
 * lands low, the final year of a funded plan is short by a few millionths of
 * one đồng and the projection dutifully reports a depletion — so the naive
 * read renders THE PAGE'S OWN ANSWER as running out a year early, beside a
 * figure whose table says it does not. `WithdrawalPath.funded` is
 * `fundedAtBoundary` applied to that path at that path's own horizon: it
 * forgives a residue only in the final year, only when it is negligible
 * against that year's need, and it hands back the residue so this page can
 * state what was forgiven. See `lib/calc/long-term-plan.ts` and
 * `retirement-income-render.test.ts` for the reproduction.
 */
export function RetirementIncomeCalculator() {
  const fields = useCalcFields(L.defaults);
  const read = readRetirement(fields.values, OMIT);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);

  const withdrawal = plan?.withdrawal ?? null;
  const sustainable = withdrawal?.sustainableSpending ?? null;
  const other = read.input?.otherAnnualIncome ?? 0;
  const desired = read.input?.desiredAnnualSpending ?? 0;
  const fromPortfolio = sustainable === null ? null : sustainable - other;

  const pathOf = (key: WithdrawalPath["key"]) =>
    withdrawal?.paths.find((path) => path.key === key) ?? null;
  const entered = pathOf("asEntered");
  const sustainablePath = pathOf("sustainable");

  /**
   * Whether the spend the plan asked for lasts to the horizon.
   *
   * `path.funded`, never `projection.depletionAge === null`. See the component
   * docstring: the naive read is the defect this route shipped.
   */
  const desiredLasts = entered?.funded ?? false;

  const firstDraw = sustainablePath?.projection.years.find(
    (year) => !year.accumulating,
  );

  const chartLabels = withdrawalChartLabels(plan);
  const chart = longTermWithdrawalModel(plan, chartLabels);

  /** A path's name, the same string the figure and its table use. */
  const nameFor = (key: WithdrawalPath["key"]): string =>
    key === "asEntered"
      ? chartLabels.asEnteredPath
      : key === "sustainable"
        ? chartLabels.sustainablePath
        : chartLabels.longerLifePath;

  /**
   * One path's verdict, as a sentence rather than an age on its own.
   *
   * `path.funded` is the resolved plan's own verdict — `fundedAtBoundary`
   * applied to that path's projection at that path's horizon — and it is what
   * `longTermWithdrawalModel` reads for the same three rows of its own table.
   * Reading `projection.depletionAge` here instead put the two in direct
   * contradiction on the same page.
   */
  const verdictOf = (path: WithdrawalPath): string =>
    path.funded
      ? F.pathLasts
      : fill(F.pathRunsOut, { age: String(path.projection.depletionAge) });

  return (
    <CalculatorCard>
      <RetirementFields
        copy={L.fields}
        invalid={read.invalid}
        bind={fields.bind}
        omit={OMIT}
      />

      {/* The draw leads, in today's money and per month, because those are the
          two readings a household can compare against its own outgoings.
          Everything else on the page exists to qualify this figure. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.annualLabel}
          value={sustainable === null ? null : longTermMoney(sustainable)}
        />
        <ResultRow
          label={F.monthlyLabel}
          value={sustainable === null ? null : longTermMoney(sustainable / 12)}
        />
        <ResultRow
          label={F.portfolioAnnualLabel}
          value={fromPortfolio === null ? null : longTermMoney(fromPortfolio)}
        />
        <ResultRow
          label={F.shortfallLabel}
          value={
            withdrawal === null
              ? null
              : longTermMoney(withdrawal.spendingShortfall)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.otherIncomeLabel}
          value={read.input === null ? null : longTermMoney(other)}
        />
        <ResultRow
          label={F.desiredLabel}
          value={read.input === null ? null : longTermMoney(desired)}
        />
        <ResultRow
          label={F.shareLabel}
          value={
            sustainable === null || desired <= 0
              ? null
              : formatPercent((sustainable / desired) * 100, 1)
          }
        />
      </ResultGroup>

      <p className="mt-4 text-sm leading-relaxed text-ink-3">
        {F.desiredNote}
      </p>

      {/* The alternatives, as sentences. A verdict given the figure treatment
          cannot shrink and pushes the row past its container, which is what
          `ResultRow`'s `prose` is for.

          Mounted from the plan's OWN path list, in its order, rather than as
          three fixed rows: a path is absent rather than faked when the engine
          refuses its horizon, and a fixed row would then render a label whose
          `{endAge}` had nothing to fill it beside a dash. Row 44's note
          applies — an optional row is mounted conditionally, because a dash
          beside a label reads as a figure the tool failed to find. */}
      <ResultGroup title={F.pathsTitle} className="mt-4" live={false}>
        {(plan?.withdrawal.paths ?? []).map((path) => (
          <ResultRow
            key={path.key}
            label={nameFor(path.key)}
            value={verdictOf(path)}
            prose
          />
        ))}
      </ResultGroup>

      <ResultGroup title={F.capitalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.realBalanceLabel}
          value={
            plan === null
              ? null
              : longTermMoney(plan.asEntered.realBalanceAtRetirement)
          }
        />
        <ResultRow
          label={F.nominalBalanceLabel}
          value={
            plan === null
              ? null
              : longTermMoney(plan.asEntered.balanceAtRetirement)
          }
        />
        {/* The SUSTAINABLE draw's rate, not the desired spend's: quoting the
            rate of a plan that runs out beside a draw that does not would
            describe a different plan. */}
        <ResultRow
          label={F.initialRateLabel}
          value={
            sustainablePath === null ||
            sustainablePath.projection.initialWithdrawalRatePercent === null
              ? null
              : formatPercent(
                  sustainablePath.projection.initialWithdrawalRatePercent,
                  2,
                )
          }
        />
        <ResultRow
          label={F.firstDrawLabel}
          value={
            firstDraw === undefined ? null : longTermMoney(firstDraw.withdrawal)
          }
        />
        <ResultRow
          label={F.totalWithdrawnLabel}
          value={
            sustainablePath === null
              ? null
              : longTermMoney(sustainablePath.projection.totalWithdrawn)
          }
        />
      </ResultGroup>

      {plan !== null ? (
        <p className="mt-6 text-sm leading-relaxed text-ink-3">
          {desiredLasts ? F.fundedNotice : F.shortNotice}
        </p>
      ) : null}

      {/* What the boundary policy forgave on the draw this page reports, in
          đồng. Six decimal places: the residue is a fraction of one đồng by
          construction, and rounding it to the đồng would render the disclosure
          as "0 ₫". */}
      {sustainablePath !== null && sustainablePath.boundaryResidue !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {fill(F.boundaryNotice, {
            residue: formatMoney(sustainablePath.boundaryResidue, 6),
          })}
        </p>
      ) : null}

      {plan !== null && plan.asEntered.realBalanceAtRetirement <= 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {F.noBalanceNotice}
        </p>
      ) : null}

      {plan === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}

      {/* Row 50's figure. Built and tested with the model slice, rendered
          nowhere until now. The exact reading is this figure's own table. */}
      <ChartFigure model={chart} className="mt-8">
        <LineChart model={chart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
