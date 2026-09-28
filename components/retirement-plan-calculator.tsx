"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FormDisclosure } from "@/components/calc/form-disclosure";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { labelOf, toneOf, useSettledText } from "@/components/calc/result-status";
import { pressAnnouncement } from "@/components/retirement-granary-echo";
import { longTermMoney } from "@/components/calc/retirement-fields";
import {
  RetirementEssentialFields,
  RetirementOptionalFields,
} from "@/components/retirement-plan-fields";
import {
  RETIREMENT_FORM_ID as FORM_ID,
  RETIREMENT_RESULT_ID as RESULT_ID,
  useRetirementPlan,
} from "@/components/retirement-plan-state";
import { disclosureLines } from "@/components/retirement-plan-input-lines";
import { formatMoney, formatPercent, formatQuantity } from "@/lib/calc/number";
import { monthlyEquivalent } from "@/lib/calc/retirement-lever-facts";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import { longTermTrajectoryModel } from "@/lib/calc/charts/long-term-chart";
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
 * TWO ISLANDS, ONE PLAN — 2026-09-27, tool-first hero. The field state, the
 * plan and the card's view moved to `RetirementPlanState`, because the
 * route's hero (`retirement-granary-hero.tsx`, under the `h1`) reads the same
 * plan from another subtree. The verdict CARD moved into that hero and
 * renders once there; this component keeps the rows, the ONE live sentence,
 * the pinned CTA, the figure and the detail. The eleven fields sit behind a
 * native disclosure whose summary names every value it hides.
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
  // The boundary policy is applied once, in the provider. `plan.gap.funded`
  // is the same call on the same projection, so the verdict here and the gap
  // view's cannot diverge; it is named because the page also needs the residue.
  const { fields, read, plan, boundary, statusView, computable, lastPress } =
    useRetirementPlan();
  const result = plan?.asEntered ?? null;
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

  /*
   * The conclusion's sentences — the card's title, fact and reasons — are
   * `retirementStatusView`'s, built once in the provider and rendered by the
   * hero. What stays here reads the ROWS: the gap, purchasing power, method.
   */
  const input = plan?.input ?? null;
  const rounded = (value: number) => compactMoney(value, L.money);
  const rate = (value: number) => formatQuantity(value, 4);
  const sentences = (parts: readonly (string | null)[]) =>
    parts.filter((part): part is string => part !== null).join(" ");

  // Announced once typing — or a lever press — pauses, and withdrawn the
  // moment it is stale. The card it words renders in the hero; the ONE live
  // region stays here, in the result group. A press leads the sentence with
  // the lever, its new value and what it did, so a press that leaves the
  // verdict unchanged is still heard (WCAG 4.1.3).
  const announcement = useSettledText(pressAnnouncement(lastPress, statusView));

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
              // The same gap per month, as the pension is asked on this route.
              monthly: rounded(monthlyEquivalent(result.spendingShortfall)),
            })
          : null;

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
          // Two tiers, 2026-09-27: the three fields every reader answers —
          // age, the age to retire at, the pension wanted — then the other
          // eight, optional, collapsed in the server HTML. Their summary names
          // every value they hold, and they are forced open while the plan
          // cannot be computed — docs §5, amended by §1c.
          <>
            <RetirementEssentialFields invalid={read.invalid} bind={fields.bind} />
            <FormDisclosure
              title={C.hero.disclosure.title}
              lines={disclosureLines(fields.values)}
              forcedOpen={!computable}
              className="mt-6"
            >
              <RetirementOptionalFields invalid={read.invalid} bind={fields.bind} />
            </FormDisclosure>
          </>
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
            // The card's own tone and word, from the one `statusView`.
            answer={{
              label: F.verdictLabel,
              value: verdict,
              status: { tone: toneOf(statusView), label: labelOf(statusView) },
            }}
          />
        }
        primary={
          <>
            {/* The verdict and the capital in today's money lead, because the
                nominal figure is the one a reader will misuse. Optional rows
                are MOUNTED conditionally rather than nulled: `ResultRow`
                renders a dash beside a label, which reads as a figure the tool
                failed to find. */}
            <ResultGroup
              title={F.resultTitle}
              anchorId={RESULT_ID}
              // The card moved to the hero (docs §1c) and renders once there;
              // the one settled sentence stays here, in the ONE live region.
              announcement={announcement}
            >
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
              {/* "Khoản cần điều chỉnh": the spending gap in today's money,
                  said PER MONTH on this route — the unit the reader budgets
                  and asks the pension in (the engine's yearly gap ÷ 12). Its
                  label carries the period and the price basis; the FAQ keeps
                  the yearly figure. */}
              <ResultRow
                label={F.shortfallLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(monthlyEquivalent(result.spendingShortfall))
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

            {result !== null ? (
              <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink-2">
                {/* The verdict sentences, the estimate note and the rates in
                    use moved with the card into the hero (2026-09-27). What
                    stays is the reading of the rows: the gap, the method. */}
                {shortfallNote !== null ? (
                  <p className="text-ink-3">{shortfallNote}</p>
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

            {/* The invalid state's recovery is the hero card's visible closing
                line now (`invalidNotice`), above the form — one place, not two. */}
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

            {/* The hero's "Mục tiêu hưu trí", exact: the engine's required
                capital in both readings, what is still missing, and the
                smallest first-year contribution that funds the plan. */}
            <ResultGroup title={F.targetTitle} className="mt-4" live={false}>
              <ResultRow
                label={F.requiredRealLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.requiredRealBalanceAtRetirement)
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
              <ResultRow
                label={F.requiredShortLabel}
                value={
                  result === null
                    ? null
                    : longTermMoney(result.realBalanceShortfallAtRetirement)
                }
              />
              <ResultRow
                label={F.requiredContributionLabel}
                value={
                  plan === null || plan.contribution.annualContribution === null
                    ? null
                    : longTermMoney(plan.contribution.annualContribution)
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

            {/* The depletion age counts the year the plan could not pay IN
                FULL, and that year is normally a PARTIAL payment — the savings
                pay part of its need. Reporting the age alone loses how much
                was actually received. Withheld entirely when the verdict is
                funded, so a forgiven residue cannot render as a real
                shortfall. */}
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
