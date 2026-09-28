import type { StatusView } from "@/components/calc/result-status";
import { compactMoney, compactMoneyPair, fill } from "@/lib/calc/charts/labels";
import { monthlyEquivalent } from "@/lib/calc/retirement-lever-facts";
import type { LongTermPlan } from "@/lib/calc/long-term-plan";
import type { RetirementStatus } from "@/lib/calc/retirement-status";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const F = C.form;

const rounded = (value: number) => compactMoney(value, L.money);

/**
 * /cong-cu/ke-hoach-huu-tri/'s sentences about its answer, as pure builders.
 *
 * MOVED, NOT REWRITTEN (2026-09-27, tool-first hero): `retirementStatusView`
 * is the card builder that lived inline in `retirement-plan-calculator.tsx`.
 * The verdict card now renders once, in the hero, while the ONE live sentence
 * stays in the result region — two subtrees, so the view is built once, in
 * `RetirementPlanState`, and both read it from there.
 *
 * The conclusion in the reader's own context — 2026-09-26. These sentences
 * are assembled from the engine's result and the content templates, never
 * from the default scenario: the ages are the ones the reader typed and the
 * ones the projection found, and every amount is rounded through
 * `compactMoney`, because a sentence beside a verdict is not the place for an
 * eleven-digit figure. The exact values are the rows and the detail.
 *
 * THE SEMANTIC STATE is `retirementStatus`, which decides the tone from
 * `fundedAtBoundary` — the same policy the verdict row reads — so the card,
 * the row, the pinned summary and both figures cannot disagree. Everything
 * here only words it.
 */
export function retirementStatusView(
  plan: LongTermPlan | null,
  status: RetirementStatus,
): StatusView {
  const result = plan?.asEntered ?? null;
  const input = plan?.input ?? null;

  /**
   * Per month: the unit the reader typed the pension in on this route
   * (`retirement-plan-read.ts`); the exact yearly figure is the sustainable-
   * spending row in the detail. A PAIR, because at 0,1 triệu a thin margin
   * would round the two to one label — "9,6 triệu … bạn muốn 9,6 triệu".
   */
  const monthlyPair =
    result === null || input === null || result.sustainableSpending === null
      ? null
      : compactMoneyPair(
          monthlyEquivalent(result.sustainableSpending),
          monthlyEquivalent(input.desiredAnnualSpending),
          L.money,
        );

  /** The funded body, when the capital (not other income) is what funds it. */
  const fundedBody =
    result === null || input === null || monthlyPair === null
      ? null
      : fill(F.fundedBody, {
          sustainable: monthlyPair[0],
          desired: monthlyPair[1],
          endAge: input.endAge,
          // The engine's last year is `endAge − 1`: a horizon of 85 counts
          // spending until the reader turns 85.
          lastAge: input.endAge - 1,
        });

  const view: StatusView =
    result === null || input === null || status.kind === "unknown"
      ? { tone: "unknown", title: F.invalidHeadline, reasons: [F.invalidNotice] }
      : status.kind === "depleted" && status.depletionAge !== null
        ? {
            tone: "shortfall",
            title: fill(F.depletedHeadline, { endAge: input.endAge }),
            fact: fill(F.depletedBody, {
              endAge: input.endAge,
              depletionAge: status.depletionAge,
              yearsShort: status.yearsShort,
            }),
            reasons: [
              result.lastWithdrawalPlanned === null ||
              result.lastWithdrawalPaid === null
                ? null
                : result.lastWithdrawalPaid > 0
                  ? fill(F.depletedPartial, {
                      depletionAge: status.depletionAge,
                      planned: rounded(result.lastWithdrawalPlanned),
                      paid: rounded(result.lastWithdrawalPaid),
                    })
                  : F.depletedNothingLeft,
            ],
            next: F.depletedTry,
          }
        : status.kind === "exactBoundary"
          ? {
              tone: "caution",
              title: fill(F.boundaryHeadline, { endAge: input.endAge }),
              reasons: [fill(F.boundaryBody, { endAge: input.endAge }), fundedBody],
              next: F.fundedTry,
            }
          : status.kind === "fundedByOtherIncome"
            ? {
                tone: "met",
                title: fill(F.otherIncomeHeadline, { endAge: input.endAge }),
                reasons: [F.otherIncomeNote],
                next: F.fundedTry,
              }
            : {
                tone: "met",
                title: fill(F.fundedHeadline, { endAge: input.endAge }),
                reasons: [fundedBody],
                next: F.fundedTry,
              };
  return { ...view, label: F.statusLabels[view.tone ?? "unknown"] };
}
