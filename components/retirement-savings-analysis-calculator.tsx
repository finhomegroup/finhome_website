"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import {
  longTermMoney,
  readRetirement,
  RetirementFields,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { fill } from "@/lib/calc/charts/labels";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import type { TableCell } from "@/lib/calc/table-cell";
import {
  fundedAtBoundary,
  remedyFor,
  resolveLongTermPlan,
  MAX_EXTRA_WORKING_YEARS,
  type ContributionState,
  type GapAnswer,
} from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_SAVINGS_ANALYSIS as C } from "@/content/calculators/retirement-savings-analysis";

const F = C.form;
const R = F.remedies;

/**
 * The three remedies as table rows — label, what to reach, what changes.
 *
 * Every cell is a field of the `GapAnswer` this function is handed. It runs no
 * projection, solves nothing and searches nothing, which is the whole point:
 * the six-column age sweep this replaced called `projectRetirement` and
 * `solveRequiredContribution` inside its own `.map()`.
 *
 * A remedy that cannot close the gap says WHY in its own cell rather than
 * rendering a dash. The contribution remedy's `available: false` has two
 * causes — the solver bracketed nothing, or retirement is today and there is
 * no year left to contribute in — so the model's own `ContributionState` comes
 * in beside the gap to tell them apart. Both would otherwise render as the
 * same sentence, which is docs §7's "a null has as many meanings as it has
 * causes, and a page must say which".
 */
function remedyRows(
  gap: GapAnswer,
  contributionState: ContributionState,
): TableCell[][] {
  const rows: TableCell[][] = [];

  const contribute = remedyFor(gap, "contribute");
  if (contribute.key === "contribute") {
    const target = contribute.annualContribution;
    const extra = contribute.extraPerYear;
    rows.push([
      R.contributeLabel,
      target !== null
        ? longTermMoney(target)
        : // Two causes, two sentences. The solver found nothing in its
          // bracket, or retirement is today and there is no year left to
          // contribute in — both arrive as `available: false`, and only the
          // model's own state tells them apart.
          contributionState === "noTimeToContribute"
          ? R.contributeNoTime
          : R.contributeUnavailable,
      extra === null
        ? R.changeUnavailable
        : extra === 0
          ? R.noChange
          : fill(R.contributeChange, { amount: longTermMoney(extra) }),
    ]);
  }

  const retire = remedyFor(gap, "retireLater");
  if (retire.key === "retireLater") {
    const age = retire.retirementAge;
    const extraYears = retire.extraYears;
    rows.push([
      R.retireLabel,
      age === null
        ? // The bound the model actually searched, substituted from the
          // constant: "no retirement age works" and "no retirement age within
          // seven years works" are different claims.
          fill(R.retireUnavailable, { years: String(MAX_EXTRA_WORKING_YEARS) })
        : fill(R.retireTarget, { age: String(age) }),
      extraYears === null
        ? R.changeUnavailable
        : extraYears === 0
          ? R.noChange
          : fill(R.retireChange, { years: String(extraYears) }),
    ]);
  }

  const spend = remedyFor(gap, "spendLess");
  if (spend.key === "spendLess") {
    const target = spend.annualSpending;
    const reduction = spend.reductionPerYear;
    rows.push([
      R.spendLabel,
      target === null ? R.spendUnavailable : longTermMoney(target),
      reduction === null
        ? R.changeUnavailable
        : reduction === 0
          ? R.noChange
          : fill(R.spendChange, { amount: longTermMoney(reduction) }),
    ]);
  }

  return rows;
}

/**
 * The GAP view of the merged long-term plan (original plan row 48).
 *
 * It owns no arithmetic. The plan is `resolveLongTermPlan`, which resolves one
 * `RetirementInput` into all four views at once so this route and its three
 * siblings cannot disagree about the capital at retirement, the real return or
 * the year the money runs out. This page reads fields, picks `plan.gap`, and
 * formats.
 *
 * TWO DEFECTS THIS COMPONENT USED TO CARRY, both of the class docs §6 records
 * as invisible to a green module-test run:
 *
 * 1. **Finance inside JSX.** It ran its own retirement-age search loop and
 *    called `projectRetirement` / `solveRequiredContribution` inside the
 *    table's `.map()`. `lib/calc/long-term-plan.ts`'s docstring names this
 *    file as the reason that module exists; `resolveLongTermPlan`'s
 *    `retireLater` remedy is the search now, tested where a test can see it.
 * 2. **A naive funded verdict.** `result.depletionAge === null`, repeated at
 *    the verdict row, the notice and the table. That is exactly the
 *    float-residue artefact `fundedAtBoundary()` exists to fix: a sustainable
 *    spend solved from a closed-form annuity factor and fed back through the
 *    projection lands a hair either side of the root, so the final year of a
 *    funded plan can be short by a few millionths of one đồng and the
 *    projection dutifully reports a depletion. The verdict now comes from
 *    `plan.gap.funded`, the policy forgives a residue only in the final year
 *    and only when it is negligible against that year's own need, and the page
 *    states what it forgave. See `retirement-savings-analysis-render.test.ts`
 *    for the reproduction.
 */
export function RetirementSavingsAnalysisCalculator() {
  const fields = useCalcFields(L.defaults);
  const read = readRetirement(fields.values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  const result = plan?.asEntered ?? null;
  const gap = plan?.gap ?? null;

  // The boundary policy, once. `gap.funded` is the same call on the same
  // projection, so the verdict here and the three sibling routes' cannot
  // diverge; this one is named because the page also states the residue.
  const boundary =
    plan === null ? null : fundedAtBoundary(plan.asEntered, plan.input.endAge);
  const funded = gap?.funded ?? false;

  /**
   * The depletion age the page should SHOW.
   *
   * Null when the plan is funded, including the forgiven-residue case: a
   * funded plan that still reported "cạn ở tuổi 84" beside "Đủ" would
   * contradict itself in two adjacent rows.
   */
  const depletionAge = funded ? null : (result?.depletionAge ?? null);

  // The remedy set is what a SHORT plan needs. A funded plan has nothing to
  // close, and three rows of "không cần" would be a table about nothing.
  const rows =
    gap === null || plan === null || funded
      ? []
      : remedyRows(gap, plan.contribution.state);

  /**
   * Whether the only remaining lever is the spend.
   *
   * The two remedies that keep the spend as entered are the contribution and
   * the retirement age; the third IS the spend coming down. So "nothing
   * closes this gap while you keep spending that much" is these two flags, and
   * it is a different statement from "no remedy exists" — the spend remedy
   * exists whenever there is capital and a spend to reduce.
   */
  const onlySpendLess =
    gap !== null &&
    !remedyFor(gap, "contribute").available &&
    !remedyFor(gap, "retireLater").available;

  const contribute = gap === null ? null : remedyFor(gap, "contribute");
  /**
   * The contribution remedy's own figures, for the one remedy a reader wants
   * per month.
   *
   * Gated on the plan being SHORT, like the table is. A funded plan can still
   * have this remedy "available" — the solver finds the minimum the plan needs
   * even when the entered contribution already exceeds it — and a block headed
   * "nếu bạn chọn cách dành thêm" over a plan with nothing to close would
   * contradict the funded notice three paragraphs down, which points at the
   * sibling route for exactly that figure.
   */
  const contributeDetail =
    !funded &&
    contribute !== null &&
    contribute.key === "contribute" &&
    contribute.available &&
    contribute.annualContribution !== null &&
    contribute.monthlyEquivalent !== null
      ? {
          annual: contribute.annualContribution,
          monthly: contribute.monthlyEquivalent,
        }
      : null;

  return (
    <CalculatorCard>
      <RetirementFields
        copy={L.fields}
        invalid={read.invalid}
        bind={fields.bind}
      />

      {/* The verdict, the coverage, the money missing and the age it runs out
          sit together on purpose: the last one is what stops the coverage from
          being read as a comfort level. Optional rows are MOUNTED
          conditionally rather than nulled — `ResultRow` renders a dash beside
          its label, which reads as a figure the tool failed to find. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.verdictLabel}
          value={gap === null ? null : funded ? F.verdictYes : F.verdictNo}
        />
        {/* Left out entirely when no capital is needed: other income already
            covers the spend, `coveragePercent` is null, and "100% đáp ứng" and
            "không có gì phải đáp ứng" are different statements. */}
        {gap !== null && gap.coveragePercent !== null ? (
          <ResultRow
            label={F.coverageLabel}
            value={formatPercent(gap.coveragePercent, 1)}
          />
        ) : null}
        <ResultRow
          label={F.gapRealLabel}
          value={gap === null ? null : longTermMoney(gap.realShortfall)}
        />
        {depletionAge !== null ? (
          <ResultRow label={F.depletionLabel} value={String(depletionAge)} />
        ) : null}
      </ResultGroup>

      <ResultGroup title={F.capitalTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.reachedRealLabel}
          value={gap === null ? null : longTermMoney(gap.realBalanceReached)}
        />
        <ResultRow
          label={F.requiredRealLabel}
          value={gap === null ? null : longTermMoney(gap.realBalanceRequired)}
        />
        <ResultRow
          label={F.reachedNominalLabel}
          value={
            result === null ? null : longTermMoney(result.balanceAtRetirement)
          }
        />
        <ResultRow
          label={F.requiredNominalLabel}
          value={
            result === null
              ? null
              : longTermMoney(result.requiredBalanceAtRetirement)
          }
        />
        {result !== null && !funded && result.yearsShort > 0 ? (
          <ResultRow
            label={F.yearsShortLabel}
            value={`${result.yearsShort} ${F.yearsUnit}`}
          />
        ) : null}
      </ResultGroup>

      {/* The one remedy a reader wants per month, with the label saying which
          of the two figures it is. `monthlyEquivalent` is `annual / 12` — a
          budgeting equivalence, not a payment schedule that reaches the same
          balance, because twelve month-end deposits land behind one January
          deposit. The model names it that way so a consumer has to notice. */}
      {contributeDetail !== null ? (
        <ResultGroup title={F.contributeTitle} className="mt-4" live={false}>
          <ResultRow
            label={F.contributeAnnualLabel}
            value={longTermMoney(contributeDetail.annual)}
          />
          <ResultRow
            label={F.contributeMonthlyLabel}
            value={longTermMoney(contributeDetail.monthly)}
          />
        </ResultGroup>
      ) : null}

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{R.intro}</p>
          {/* Three columns, and `mobileCards` below `md`. The six-column age
              sweep this replaced put nine-digit đồng figures behind a
              horizontal scroll at 390 px; the same measurement retired row
              44's seven-column table. A prose first column plus two money
              columns still reads better as one block per remedy on a phone. */}
          <ResultTable
            className="mt-4"
            caption={R.caption}
            columns={[
              { label: R.wayColumn },
              { label: R.targetColumn, numeric: true },
              { label: R.changeColumn, numeric: true },
            ]}
            rows={rows}
            mobileCards
          />
        </>
      ) : null}

      {gap !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {funded ? F.fundedNotice : F.gapNotice}
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

      {/* Short, and neither remedy that PRESERVES the spend reaches it — so
          the only lever left is the spend itself. Read off the same two
          `available` flags the table's cells are, not a second copy of the
          rule, and distinct from both a funded plan and an invalid form. */}
      {gap !== null && !funded && onlySpendLess ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.onlySpendLessNotice}
        </p>
      ) : null}

      {gap === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
