"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import {
  ResultTable,
  type ResultTableColumn,
} from "@/components/calc/result-table";
import {
  longTermMoney,
  readRetirement,
  RetirementFields,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { fill } from "@/lib/calc/charts/labels";
import { fundedAtBoundary, resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

const F = C.form;
const T = F.table;

/** The contribution is solved, so the field is not rendered. */
const OMIT = ["annualContribution"] as const;

/**
 * Table rows the optional fill aims at, so the block reads at 390 px.
 *
 * A CEILING ON THE FILL, not on the table. See `contributionCheckpointAges`.
 */
const TARGET_TABLE_ROWS = 8;

/**
 * The four columns, exported so a test can check the labels that SHIP.
 *
 * Below `md` these labels are the `<dt>` of a two-track grid whose value track
 * is sized to its own content and never squeezed — `result-table.tsx` says so
 * at the JSX, and never breaking a money figure across lines is the right
 * priority. The consequence is that a long label starves beside a long đồng
 * figure: an independent browser pass measured a 23-character label collapsing
 * to a 55 px track over four lines at 390 px on a sibling route. About 300 px
 * is available inside a card there and an exact đồng figure takes most of it,
 * so a money column's heading has to stay short.
 *
 * Column 0 is exempt and is not in that grid: `mobileCards` renders the first
 * cell on the card's own heading line, which is `flex flex-wrap` and wraps as
 * a unit instead of starving a track.
 *
 * The full reading of the last column — that these are đồng in TODAY's money —
 * moved into the caption and the paragraph above the table. It is the
 * distinction this whole family of routes teaches, so it is stated once where
 * there is room for it rather than truncated into a heading.
 */
export const CONTRIBUTION_TABLE_COLUMNS: ResultTableColumn[] = [
  { label: T.ageColumn, numeric: true, nowrap: true },
  { label: T.contributionColumn, numeric: true },
  { label: T.withdrawalColumn, numeric: true },
  { label: T.realBalanceColumn, numeric: true },
];

/**
 * Years the table reports: the ones that MATTER, then a bounded fill.
 *
 * This route used to render every fifth year across six columns of đồng
 * figures. Measured at 390 px on the sibling trajectory route, that shape is
 * 762 px inside a 300 px scroll frame — about two and a half screens of
 * sideways scrolling to read one row — which is why row 44 removed it. The
 * replacement is the shape `checkpoints()` in `lib/calc/charts/long-term-chart.ts`
 * arrived at, and it is a private function there, so the selection rule is
 * restated here rather than a wider export being added to a module this route
 * does not own.
 *
 * MANDATORY YEARS ARE CHOSEN FIRST AND ARE NEVER TRUNCATED. That module
 * records why: its first version gathered mandatory and optional years into
 * one set, sorted and sliced to a row count, which silently dropped whatever
 * sorted last — and what sorts last is the horizon. For this view the four
 * years that cannot be dropped are the FIRST contribution, the LAST and
 * largest one (the year before the retirement age, which is the figure this
 * page's own notice is about), the first draw, and the end of the plan. The
 * optional fill then takes whatever room is left, which can be none.
 */
export function contributionCheckpointAges(
  ages: readonly number[],
  retirementAge: number,
  depletionAge: number | null,
): number[] {
  if (ages.length === 0) return [];
  const first = ages[0];
  const last = ages[ages.length - 1];
  const inRange = (age: number) =>
    Number.isSafeInteger(age) && age >= first && age <= last;

  const required = new Set<number>([first, last]);
  for (const age of [retirementAge - 1, retirementAge, depletionAge]) {
    if (age !== null && inRange(age)) required.add(age);
  }

  const optional = new Set<number>();
  const room = Math.max(0, TARGET_TABLE_ROWS - required.size);
  if (room > 0) {
    const stride = Math.max(1, Math.ceil((last - first) / (room + 1)));
    for (let age = first + stride; age < last; age += stride) {
      if (required.has(age) || optional.has(age)) continue;
      if (optional.size >= room) break;
      optional.add(age);
    }
  }
  return [...new Set([...required, ...optional])].sort((a, b) => a - b);
}

/**
 * The CONTRIBUTION view of the merged long-term plan (original plan row 45).
 *
 * It owns no arithmetic. The plan is `resolveLongTermPlan`, which resolves one
 * `RetirementInput` into all four views at once so this route and its three
 * siblings cannot disagree, and this page leads with `plan.contribution`.
 */
export function RetirementTargetCalculator() {
  const fields = useCalcFields(L.defaults);
  const read = readRetirement(fields.values, OMIT);

  /**
   * The contribution is ZEROED before the model sees it.
   *
   * `readRetirement` parses every money key whether or not it is in `omit` —
   * only the invalid MARKING is skipped — so the shared scenario's
   * 60.000.000 ₫ would otherwise sit inside this page's model under a field
   * the reader cannot see or change, on the one route whose whole question is
   * what that figure ought to be. Zeroing it also makes `plan.asEntered` the
   * honest baseline this view needs: what the existing balance does on its
   * own, with nothing added.
   */
  const input =
    read.input === null ? null : { ...read.input, annualContribution: 0 };
  const plan = input === null ? null : resolveLongTermPlan(input);
  const answer = plan?.contribution ?? null;

  /**
   * THE FUNDED VERDICT COMES FROM `fundedAtBoundary`, NOT FROM A BARE
   * `depletionAge === null`.
   *
   * `plan.asEntered` is the baseline with nothing added, so this asks exactly
   * the question this page's zero answer is about: does the balance already
   * there fund the plan? `solveRequiredContribution` asks it with
   * `withNothing.depletionAge === null`, which is the float-residue artefact
   * `fundedAtBoundary` exists to fix — a sustainable spend solved from a
   * closed-form annuity factor and fed back through the year-by-year
   * projection can leave the FINAL year short by a few hundred-thousandths of
   * one đồng, and the projection dutifully reports a depletion. The solver
   * then bisects and hands back `state: "solved"` with a contribution that
   * formats to "0 ₫", so the page shows a required contribution of zero with
   * no explanation of what a zero means. The policy forgives a residue only
   * in the final year and only when it is negligible against that year's own
   * need — a real shortfall fails both tests — and it returns the residue so
   * this page can state what it forgave. See `fundedAtBoundary`'s docstring
   * and `retirement-target-render.test.ts` for the reproduction.
   */
  const boundary =
    plan === null ? null : fundedAtBoundary(plan.asEntered, plan.input.endAge);

  /**
   * "The pension covers it" and "the balance covers it" are two answers, and
   * this page must not merge them.
   *
   * `contributionAnswer` tests `fundedByOtherIncome` FIRST, and its comment
   * says why: the solver would otherwise report it as `alreadyFunded`,
   * "crediting the reader's savings for what their pension is doing". The same
   * trap sits one level up, because `fundedAtBoundary` reads the projection —
   * which does not deplete in either case — so the verdict alone cannot tell
   * them apart. The state does.
   */
  const fundedByOtherIncome = answer?.state === "fundedByOtherIncome";
  const alreadyFunded =
    !fundedByOtherIncome &&
    ((boundary?.funded ?? false) || answer?.state === "alreadyFunded");

  const projection = answer?.projection ?? null;
  const lastAccumulating = projection?.years
    .filter((row) => row.accumulating)
    .at(-1);

  /**
   * Typed cells, so the whole block reads in ONE stated unit with the exact
   * đồng figures behind the same checkbox `ResultTable` already owns. Never a
   * pre-formatted string scaled afterwards — that is §4's 1000x grammar trap.
   */
  const rows =
    projection === null || input === null
      ? []
      : contributionCheckpointAges(
          projection.years.map((row) => row.age),
          input.retirementAge,
          projection.depletionAge,
        ).flatMap((age) => {
          const row = projection.years.find((entry) => entry.age === age);
          return row === undefined
            ? []
            : [
                [
                  countCell(row.age),
                  moneyCell(row.contribution),
                  moneyCell(row.withdrawal),
                  moneyCell(row.realBalance),
                ],
              ];
        });

  return (
    <CalculatorCard>
      <RetirementFields
        copy={L.fields}
        invalid={read.invalid}
        bind={fields.bind}
        omit={OMIT}
      />

      {/* The annual figure leads: it is the plan's actual instruction, and the
          model adds it once a year. The month figure under it is that figure
          divided by twelve and says so. */}
      <ResultGroup title={F.resultTitle} className="mt-8">
        <ResultRow
          label={F.annualLabel}
          value={
            answer?.annualContribution === null ||
            answer?.annualContribution === undefined
              ? null
              : longTermMoney(answer.annualContribution)
          }
        />
        <ResultRow
          label={F.monthlyLabel}
          value={
            answer?.monthlyEquivalent === null ||
            answer?.monthlyEquivalent === undefined
              ? null
              : longTermMoney(answer.monthlyEquivalent)
          }
        />
        <ResultRow
          label={F.lastAnnualLabel}
          value={
            lastAccumulating === undefined
              ? null
              : longTermMoney(lastAccumulating.contribution)
          }
        />
        <ResultRow
          label={F.realBalanceLabel}
          value={
            projection === null
              ? null
              : longTermMoney(projection.realBalanceAtRetirement)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.checkTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.nominalBalanceLabel}
          value={
            projection === null
              ? null
              : longTermMoney(projection.balanceAtRetirement)
          }
        />
        <ResultRow
          label={F.requiredBalanceLabel}
          value={
            projection === null
              ? null
              : longTermMoney(projection.requiredRealBalanceAtRetirement)
          }
        />
        <ResultRow
          label={F.totalContributedLabel}
          value={
            projection === null
              ? null
              : longTermMoney(projection.totalContributed)
          }
        />
        <ResultRow
          label={F.totalGrowthLabel}
          value={
            projection === null ? null : longTermMoney(projection.totalGrowth)
          }
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
              : longTermMoney(projection.sustainableSpending)
          }
        />
        <ResultRow
          label={F.finalBalanceLabel}
          value={
            projection === null ? null : longTermMoney(projection.finalBalance)
          }
        />
      </ResultGroup>

      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            columns={CONTRIBUTION_TABLE_COLUMNS}
            rows={rows}
            mobileCards
          />
        </>
      ) : null}

      {alreadyFunded ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.fundedNotice}
        </p>
      ) : null}

      {fundedByOtherIncome ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.otherIncomeNotice}
        </p>
      ) : null}

      {/* Retirement is today, so there is no year left to contribute in. The
          solver returns null there and null alone cannot tell this apart from
          a plan that is merely out of reach — which is why the model gives it
          its own state and this page its own sentence. */}
      {answer?.state === "noTimeToContribute" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.noTimeNotice}
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

      {answer?.state === "unreachable" ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.unsolvableNotice}
        </p>
      ) : null}

      {plan === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
