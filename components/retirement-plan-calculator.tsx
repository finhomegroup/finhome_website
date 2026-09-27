"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import {
  longTermMoney,
  readRetirement,
  RetirementFields,
} from "@/components/calc/retirement-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent, formatQuantity } from "@/lib/calc/number";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import { longTermTrajectoryModel } from "@/lib/calc/charts/long-term-chart";
import { fundedAtBoundary, resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const F = C.form;

/** See `percent-calculator.tsx` for why these are literals, not `useId`. */
const FORM_ID = "ke-hoach-huu-tri-nhap";
const RESULT_ID = "ke-hoach-huu-tri-ket-qua";

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
export function RetirementPlanCalculator({
  actions,
}: {
  /**
   * `<LongTermViews current="trajectory">`, passed in from the route, into the
   * layout's `actions` slot: after the answer and BEFORE the figure.
   *
   * Passed rather than imported because this file is a client component and
   * `LongTermViews` is a server one: composed this way it still ships no
   * client JavaScript. That placement is the audit's P2 — "đưa 1–2 hành động
   * phù hợp ngay sau câu trả lời, không chôn sau bảng dài" — and for this route
   * the relevant action is the three sibling views of the SAME plan, which is
   * the control that already exists. It goes across WHOLE: the four-view set is
   * the property `LongTermViews` calls load-bearing, and it is a short nav with
   * no prose, so it fits the slot's budget. No save button and no handoff is
   * invented here; nothing on this site stores a result.
   */
  actions?: React.ReactNode;
}) {
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

  /**
   * The verdict, formatted ONCE.
   *
   * Both the primary row and the pinned CTA restatement read this, so the two
   * cannot say different things.
   */
  const verdict =
    result === null ? null : funded ? F.verdictYes : F.verdictNo;

  const chart = longTermTrajectoryModel(plan, C.chart);

  /**
   * The conclusion in the reader's own context — 2026-09-26.
   *
   * The review read "Không đủ / 82 / 3 năm / 20.942.597 ₫" as four figures
   * with no sentence joining them. These sentences are assembled HERE, from
   * the engine's result and the content templates, never from the default
   * scenario: the ages are the ones the reader typed and the ones the
   * projection found, and every amount is rounded through `compactMoney`
   * because a sentence beside a verdict is not the place for an eleven-digit
   * figure. The exact values are the rows above and the detail below.
   *
   * Three states, each read off the plan rather than inferred: SHORT (with
   * the depletion year's partial payment when it paid anything), FUNDED (with
   * the level spend the capital supports beside the spend that was asked
   * for), and funded BY OTHER INCOME, which is not a funded portfolio and
   * must not be described as one.
   */
  const input = plan?.input ?? null;
  const rounded = (value: number) => compactMoney(value, L.money);
  const rate = (value: number) => formatQuantity(value, 4);
  const sentences = (parts: readonly (string | null)[]) =>
    parts.filter((part): part is string => part !== null).join(" ");

  const conclusion =
    result === null || input === null
      ? null
      : funded
        ? {
            headline: fill(F.fundedHeadline, {
              retirementAge: input.retirementAge,
              endAge: input.endAge,
            }),
            body: result.fundedByOtherIncome
              ? F.otherIncomeNote
              : result.sustainableSpending === null
                ? null
                : fill(F.fundedBody, {
                    sustainable: rounded(result.sustainableSpending),
                    desired: rounded(input.desiredAnnualSpending),
                    endAge: input.endAge,
                    // The engine's last year is `endAge − 1`: a horizon of 85
                    // counts spending until the reader turns 85.
                    lastAge: input.endAge - 1,
                  }),
            next: F.fundedTry,
          }
        : depletionAge === null
          ? null
          : {
              headline: fill(F.depletedHeadline, { depletionAge }),
              body: sentences([
                fill(F.depletedBody, {
                  endAge: input.endAge,
                  depletionAge,
                  yearsShort: result.yearsShort,
                }),
                result.lastWithdrawalPlanned === null ||
                result.lastWithdrawalPaid === null
                  ? null
                  : result.lastWithdrawalPaid > 0
                    ? fill(F.depletedPartial, {
                        planned: rounded(result.lastWithdrawalPlanned),
                        paid: rounded(result.lastWithdrawalPaid),
                      })
                    : F.depletedNothingLeft,
              ]),
              next: F.depletedTry,
            };

  /**
   * What the promoted shortfall row means. It is the ANNUAL spending gap in
   * today's money — not a contribution, not a capital shortage — and the
   * sentence says so. Withheld when the plan is short but the closed-form gap
   * is zero, which the engine does not produce for a genuinely short plan.
   */
  const shortfallNote =
    result === null
      ? null
      : funded
        ? F.shortfallNone
        : result.spendingShortfall > 0
          ? fill(F.shortfallMeaning, {
              shortfall: rounded(result.spendingShortfall),
            })
          : null;

  /** The reader's own rates, stated beside the conclusion they produced. */
  const assumptions =
    input === null
      ? null
      : fill(F.assumptionsUsed, {
          before: rate(input.returnBeforePercent),
          after: rate(input.returnAfterPercent),
          inflation: rate(input.inflationPercent),
          growth: rate(input.contributionGrowthPercent),
        });

  /**
   * Purchasing power, after the result, with the reader's figures. The pair
   * helper keeps the two readings from rounding to one label; the draw
   * sentence is added only when the first retirement year draws anything; a
   * zero or negative inflation gets its own sentence, because "mua được ít
   * đồ hơn" is false there; and retiring TODAY gets its own too, because with
   * no accumulation year the two readings of the capital coincide and the
   * standard sentence would compare a figure with itself.
   */
  const purchasingPower =
    result === null || input === null
      ? null
      : (() => {
          const [capital, realCapital] = compactMoneyPair(
            result.balanceAtRetirement,
            result.realBalanceAtRetirement,
            L.money,
          );
          if (input.inflationPercent <= 0) {
            return fill(F.purchasingPowerFlat, {
              inflation: rate(input.inflationPercent),
              retirementAge: input.retirementAge,
              capital,
              realCapital,
            });
          }
          if (input.retirementAge <= input.currentAge) {
            return fill(F.purchasingPowerToday, {
              inflation: rate(input.inflationPercent),
              capital,
            });
          }
          return sentences([
            fill(F.purchasingPower, {
              inflation: rate(input.inflationPercent),
              retirementAge: input.retirementAge,
              capital,
              realCapital,
            }),
            firstWithdrawal !== undefined && firstWithdrawal.withdrawal > 0
              ? fill(F.purchasingPowerDraw, {
                  nominalDraw: rounded(firstWithdrawal.withdrawal),
                  realDraw: rounded(firstWithdrawal.realWithdrawal),
                })
              : null,
            F.purchasingPowerClose,
          ]);
        })();

  /*
   * A "Hai cột" row in the audit (CSV row 46), whose action is "Desktop: form
   * trái, kết luận và chart phải; ưu tiên đủ/thiếu, tuổi cạn tiền và khoản cần
   * điều chỉnh". Both halves are implemented here:
   *
   * - `CalculatorLayout` in `"split"` mode puts the eleven-field form in the
   *   40% column and the verdict plus the trajectory figure in the 60% one.
   *   This is the longest form in the suite outside `phan-bo-tai-san`, and it
   *   is why the reader previously could not see the verdict move.
   * - The live group is now the three things the action names plus the capital
   *   in today's money, with the verdict emphasised as the single main answer.
   *   `Thiếu so với mức mong muốn` is the "khoản cần điều chỉnh", and it MOVED
   *   UP out of the cash-flow group, where it was the eighth figure on the
   *   page. Nothing was added: every row below existed already.
   *
   * The three `live={false}` groups keep their figures and move to the
   * full-width detail region behind a disclosure — they are a ledger, not an
   * answer, and docs §4 already says a wide live group is the failure mode a
   * live table is.
   */
  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <RetirementFields
            copy={L.fields}
            invalid={read.invalid}
            bind={fields.bind}
          />
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            // Every one of the eleven fields is shown on this route, so any
            // invalid flag is a field the reader can be sent to.
            invalid={Object.values(read.invalid).some(Boolean)}
            // Eleven fields across four groups — the longest form in the suite
            // bar one, and the route the browser pass measured the answer
            // scrolling out of sight on.
            sticky
            answer={{ label: F.verdictLabel, value: verdict }}
          />
        }
        primary={
          <>
            {/* The verdict and the capital in today's money lead, because the
                nominal figure is the one a reader will misuse. Optional rows
                are MOUNTED conditionally rather than nulled: `ResultRow`
                renders a dash beside a label, which reads as a figure the tool
                failed to find. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.verdictLabel}
                // The one main answer: this page answers "đủ hay không".
                emphasis
                value={verdict}
              />
              {depletionAge !== null ? (
                <ResultRow
                  label={F.depletionLabel}
                  value={String(depletionAge)}
                />
              ) : null}
              {/* Beside the depletion age, because an age alone does not say
                  how far short of the horizon the plan falls. Both rows mount
                  only when the plan is short. */}
              {result !== null && !funded && result.yearsShort > 0 ? (
                <ResultRow
                  label={F.yearsShortLabel}
                  value={`${result.yearsShort} ${F.yearsUnit}`}
                />
              ) : null}
              {/* "Khoản cần điều chỉnh": the annual spending gap in today's
                  money — the figure the three sibling views price remedies
                  against. Its label carries the period and the price basis;
                  see the content file. */}
              <ResultRow
                label={F.shortfallLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.spendingShortfall)
                }
              />
              <ResultRow
                label={F.realBalanceAtRetirementLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.realBalanceAtRetirement)
                }
              />
            </ResultGroup>

            {conclusion !== null ? (
              <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink-2">
                {/* The verdict as a sentence with the reader's ages in it,
                    then what to try. Outside the live region on purpose: the
                    rows above are the announcement, this is the reading. */}
                <p className="font-medium text-ink">{conclusion.headline}</p>
                {conclusion.body ? <p>{conclusion.body}</p> : null}
                <p>{conclusion.next}</p>
                {shortfallNote !== null ? (
                  <p className="text-ink-3">{shortfallNote}</p>
                ) : null}
                {/* The conditions that can change the conclusion stay beside
                    it — the approved contract's never-collapse rule. */}
                <p className="text-ink-3">{F.estimateNote}</p>
                {assumptions !== null ? (
                  <p className="text-ink-3">{assumptions}</p>
                ) : null}
                {/* Purchasing power, explained AFTER the result with the
                    reader's own figures, behind a summary that names it. The
                    figure's caption and assumptions carry the same lesson
                    visibly, so nothing load-bearing is only in here. */}
                {purchasingPower !== null ? (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
                      {F.purchasingPowerTitle}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-3">
                      {purchasingPower}
                    </p>
                  </details>
                ) : null}
                <details className="mt-1">
                  <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
                    {F.verdictDetailTitle}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {F.verdictDetail}
                  </p>
                </details>
              </div>
            ) : null}

            {/* What the boundary policy forgave, in đồng. Six decimal places:
                the residue is a fraction of one đồng by construction, and
                rounding it to the đồng would render the disclosure as "0 ₫". */}
            {boundary?.residue !== null && boundary?.residue !== undefined ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {fill(F.boundaryNotice, {
                  residue: formatMoney(boundary.residue, 6),
                })}
              </p>
            ) : null}

            {/* The invalid state's own recovery, beside the answer it is
                standing in for. The authoritative rows above are already
                showing a dash rather than a stale figure — `result` is null —
                so this explains a gap rather than decorating one. */}
            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}
          </>
        }
        chart={
          /* Row 44's figure, in the right-hand column beside the form. The
             exact reading is this figure's own table, which `ChartFigure`
             keeps in a `<details>` outside every live region. */
          <ChartFigure model={chart} className="mt-8">
            <LineChart model={chart} />
          </ChartFigure>
        }
        actions={actions}
        detail={
          <DetailDisclosure title={F.detailTitle} hint={F.detailHint}>
            <ResultGroup title={F.nominalTitle} live={false}>
              <ResultRow
                label={F.balanceAtRetirementLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.balanceAtRetirement)
                }
              />
              <ResultRow
                label={F.finalBalanceLabel}
                value={
                  result === null ? null : longTermMoney(result.finalBalance)
                }
              />
              <ResultRow
                label={F.realFinalBalanceLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.realFinalBalance)
                }
              />
            </ResultGroup>

            <ResultGroup title={F.flowTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.totalContributedLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.totalContributed)
                }
              />
              <ResultRow
                label={F.totalGrowthLabel}
                value={
                  result === null ? null : longTermMoney(result.totalGrowth)
                }
              />
              <ResultRow
                label={F.totalWithdrawnLabel}
                value={
                  result === null ? null : longTermMoney(result.totalWithdrawn)
                }
              />
              <ResultRow
                label={F.firstWithdrawalLabel}
                value={
                  firstWithdrawal === undefined
                    ? null
                    : longTermMoney(firstWithdrawal.withdrawal)
                }
              />
              {/* The same draw in today's money. On a funded plan this is
                  exactly the spend that was asked for, less other income — the
                  identity `retirement.ts` keeps two deflators to preserve. */}
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
                  result === null ||
                  result.initialWithdrawalRatePercent === null
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
              {/* `shortfallLabel` is NOT repeated here: it moved up into the
                  live group as the audit's "khoản cần điều chỉnh". One figure,
                  one place — two copies of it is how a page comes to show the
                  same quantity twice with different rounding. */}
            </ResultGroup>

            {/* "Cạn ở tuổi 82" counts the year the plan could not pay IN FULL,
                and that year is normally a PARTIAL payment — 181.159.463 ₫ of
                a 1.288.834.386 ₫ need on the defaults. Reporting the age alone
                loses how much was actually received. Withheld entirely when
                the verdict is funded, so a forgiven residue cannot render as a
                real shortfall. */}
            {result !== null &&
            !funded &&
            result.lastWithdrawalPlanned !== null &&
            result.lastWithdrawalPaid !== null &&
            result.lastWithdrawalShortfall !== null ? (
              <ResultGroup
                title={F.partialTitle}
                className="mt-4"
                live={false}
              >
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
          </DetailDisclosure>
        }
      />
    </CalculatorCard>
  );
}
