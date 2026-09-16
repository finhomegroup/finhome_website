/**
 * The rent → cost → debt waterfall for /cong-cu/bat-dong-san-cho-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `rental-waterfall-chart.test.ts`.
 *
 * Original row 15 specifies it: "waterfall tiền thuê → chi phí → trả nợ". So
 * this is the same BRIDGE shape `net-proceeds-chart.ts` argues for, on a
 * different ledger — and it is one adapter rather than a copy because the
 * argument there applies here word for word: a step bar is the cash that was
 * in hand, split into what survives the deduction and what the deduction took,
 * so the deduction is a DRAWN quantity instead of a difference between two bar
 * lengths.
 *
 *   Tiền thuê đủ 12 tháng     [############################]  1.200.000.000
 *   − Trống nhà               [##########################|==]  còn 1.140.000.000
 *   − Thuế cho thuê           [#######################|=====]  còn 1.056.000.000
 *   − Chi phí vận hành        [####################|========]  còn 1.020.000.000
 *   − Trả nợ vay              [##########|=================]   còn 300.000.000
 *   = Dòng tiền còn lại       [##########]                     300.000.000
 *
 * WHY THE FOUR DEDUCTIONS ARE IN THIS ORDER. It is the order of the ledger the
 * engine computes, and each step is the base of the next: vacancy comes off
 * the full-occupancy rent, the two turnover taxes are charged on the rent
 * actually COLLECTED, operating costs come out of what is left, and debt
 * service is paid last out of net operating income. Reordering them would
 * change no total and misstate every base.
 *
 * TAX IS ONE STEP WITH TWO NAMED PARTS IN THE TABLE. VAT and PIT have
 * different bases — a cliff on all revenue and a taper on the excess — which
 * is `rental-property.ts`'s central point, so the table lists them separately
 * while the bridge draws one tax step. Two adjacent slivers in a drawing
 * cannot teach the difference between the bases; a table row each can.
 *
 * A SHORTFALL IS A DRAWN QUANTITY, ON THE SAME SCALE. This is the second
 * version of that decision and the first one was wrong. It clamped the debt
 * step at the cash that existed and put the deficit in prose — and an
 * independent review measured the result: a 194,34 triệu debt service against
 * 147 triệu of available cash rendered as a bar truncated at zero, with the
 * 47,34 triệu that decides the whole question appearing only as a sentence.
 * "A bar has no signed form" is a property of the component, not a reason to
 * omit the central result, and the plan row asks for "rent → costs → debt →
 * remaining/SHORTFALL" in the figure.
 *
 * So the deficit is its OWN final bar, keyed `deficit`, with its own legend
 * entry and its own colour, measured on the same axis as every other bar: the
 * reader can compare its length against the rent bar directly. The debt step
 * above it splits into what the rent actually covered and what it did not, so
 * the three quantities reconcile exactly — available + deficit = debt
 * service, and available − debt service = the engine's own negative
 * `cashFlowPerYear`. The closing "cash in hand" bar is still omitted in that
 * case, because there is none; a deficit bar is not a cash bar and is labelled
 * as money that has to come from somewhere else.
 *
 * IT COMPUTES NOTHING. Every figure is `computeRentalProperty`'s own, and the
 * test asserts the last step lands on the engine's `cashFlowPerYear`.
 */

import {
  barOf,
  emptyBars,
  finishBars,
  segment,
  type BarFrameLabels,
} from "@/lib/calc/charts/bars";
import { fill, fullMoney } from "@/lib/calc/charts/labels";
import type { BarChartModel, StackedBar } from "@/lib/calc/charts/types";
import { moneyCell } from "@/lib/calc/table-cell";
import type { RentalPropertyResult } from "@/lib/calc/rental-property";

export type RentalWaterfallLabels = BarFrameLabels & {
  /** The first bar: a full year at full occupancy. */
  grossBar: string;
  /** The closing bar, drawn only when the cash flow is positive. */
  netBar: string;
  /** Legend entry for the cash still in hand at each step. */
  remainingSegment: string;
  /** Legend entry for the slice each deduction takes. */
  deductedSegment: string;
  /** Legend entry for the closing total. */
  cashSegment: string;
  /**
   * The closing bar when the year is short: money that has to come from
   * somewhere else. Its own key, colour and legend entry — it is NOT cash.
   */
  deficitBar: string;
  deficitSegment: string;
  /** The part of the debt service the rent DID cover. */
  coveredSegment: string;
  /** The part it did not. Same key as `deficitSegment`, drawn in the step. */
  uncoveredSegment: string;
  /** One step's label. `{charge}` and `{amount}` substituted. */
  stepFormat: string;
  /** The figure beside a step: the cash still in hand. `{remaining}`. */
  stepRemainingFormat: string;
  /**
   * The figure beside a step the cash did not cover. `{shortfall}`.
   *
   * Unsigned magnitude with the word, never "còn −47.340.000 ₫" — a signed
   * label under a positive-only bar is the mistake row 8's "−97 tháng
   * nhanh hơn" already shipped once.
   */
  stepShortfallFormat: string;
  /** Step names, in ledger order. */
  vacancyStep: string;
  taxStep: string;
  expensesStep: string;
  debtStep: string;
  /** Table rows the bridge draws as one step or not at all. */
  vatRow: string;
  /** The PIT row is the figure AFTER any declared relief. */
  pitRow: string;
  /** The relief itself, so the row above is checkable. */
  pitReliefRow: string;
  noiRow: string;
  shortfallRow: string;
  /** The same row when there is no loan: nothing to be short AGAINST. */
  shortfallOperatingRow: string;
  /** `{gross}`, `{cash}`, `{deducted}` substituted. */
  summary: string;
  /**
   * Appended when the year's cash flow is negative.
   * `{shortfall}`, `{available}`, `{debt}` substituted — the three figures
   * that have to reconcile.
   */
  shortfallNote: string;
  /**
   * The shortfall sentence when NOTHING is borrowed.
   * `{shortfall}`, `{collected}`, `{costs}` substituted.
   */
  shortfallOperatingNote: string;
  /** Appended when neither tax applies. */
  noTaxNote: string;
  /** Appended when nothing is borrowed. */
  noDebtNote: string;
  chargeColumn: string;
  remainingColumn: string;
  tableHint: string;
};

/** One bridge step, before the bars are built. */
type Step = { key: string; label: string; amount: number };

/**
 * The bridge from a full year's rent to the cash the owner keeps.
 *
 * `unavailable` when there is no result, or when the full-occupancy rent is
 * zero — there is no ledger to walk from nothing.
 */
export function rentalWaterfallModel(
  result: RentalPropertyResult | null,
  labels: RentalWaterfallLabels,
): BarChartModel {
  if (result === null || !(result.grossRentPerYear > 0)) {
    return emptyBars(labels);
  }

  // The ledger, in the order the engine computes it. Each step's base is the
  // remainder above it, which is why the order is not a presentation choice.
  const steps: Step[] = [
    {
      key: "vacancy",
      label: labels.vacancyStep,
      amount: result.vacancyLossPerYear,
    },
    { key: "tax", label: labels.taxStep, amount: result.rentalTaxPerYear },
    {
      key: "expenses",
      label: labels.expensesStep,
      amount: result.expensesPerYear,
    },
    { key: "debt", label: labels.debtStep, amount: result.debtServicePerYear },
  ].filter((step) => step.amount > 0);

  const bars: StackedBar[] = [
    barOf(
      "gross",
      labels.grossBar,
      [
        segment(
          "remaining",
          labels.remainingSegment,
          result.grossRentPerYear,
          labels,
        ),
      ],
      labels,
    ),
  ];

  const ledger: { label: string; amount: number; remaining: number }[] = [];
  let remaining = result.grossRentPerYear;
  for (const step of steps) {
    const before = remaining;
    remaining -= step.amount;
    ledger.push({ label: step.label, amount: step.amount, remaining });

    // A step the available cash does not cover splits into the part it DID
    // cover and the part it did not, so the deduction is still drawn in full
    // and the two parts reconcile to the charge. Its bar is then longer than
    // the one above it, which is the honest picture: the charge is bigger than
    // the money that was there.
    const short = remaining < 0;
    const covered = short ? Math.max(0, before) : Math.min(step.amount, before);
    const uncovered = short ? step.amount - covered : 0;

    bars.push({
      key: `after-${step.key}`,
      label: fill(labels.stepFormat, {
        charge: step.label,
        amount: fullMoney(step.amount, labels),
      }),
      // The bar's TOTAL is the balance BEFORE this deduction — which is why it
      // starts where the row above ended — except on a short step, where the
      // charge itself sets the length. Its displayed figure is the balance
      // after, signed.
      total: short ? covered + uncovered : before,
      totalLabel: fill(
        short ? labels.stepShortfallFormat : labels.stepRemainingFormat,
        {
          remaining: fullMoney(remaining, labels),
          shortfall: fullMoney(Math.abs(remaining), labels),
        },
      ),
      segments: [
        segment(
          "remaining",
          labels.remainingSegment,
          short ? 0 : Math.max(0, remaining),
          labels,
        ),
        segment(
          "deducted",
          short ? labels.coveredSegment : labels.deductedSegment,
          covered,
          labels,
        ),
        segment("deficit", labels.uncoveredSegment, uncovered, labels),
      ].filter((s): s is NonNullable<typeof s> => s !== null),
    });
  }

  // The closing bar states the answer as an answer, and there are two answers
  // this ledger can have. Cash in hand, or a deficit that has to be funded
  // from somewhere else — drawn on the SAME axis, so its size is readable
  // against the rent rather than described in a sentence.
  if (result.cashFlowPerYear > 0) {
    bars.push(
      barOf(
        "net",
        labels.netBar,
        [segment("cash", labels.cashSegment, result.cashFlowPerYear, labels)],
        labels,
        true,
      ),
    );
  } else if (result.cashFlowPerYear < 0) {
    bars.push(
      barOf(
        "deficit",
        labels.deficitBar,
        [
          segment(
            "deficit",
            labels.deficitSegment,
            -result.cashFlowPerYear,
            labels,
          ),
        ],
        labels,
        true,
      ),
    );
  }

  // EXACT figures, never `compactMoney`: this sentence compares two near
  // amounts, and at one decimal place in tỷ a 1,2 tỷ rent and a 1,14 tỷ
  // collected rent both render "1,2 tỷ". The lesson `net-proceeds-chart.ts`
  // records, same reason.
  const deducted =
    result.vacancyLossPerYear +
    result.rentalTaxPerYear +
    result.expensesPerYear +
    result.debtServicePerYear;
  let summary = fill(labels.summary, {
    gross: fullMoney(result.grossRentPerYear, labels),
    cash: fullMoney(result.cashFlowPerYear, labels),
    deducted: fullMoney(deducted, labels),
  });
  if (result.cashFlowPerYear < 0) {
    // WHICH shortfall. With a loan, the three figures that reconcile are what
    // the rent covered, what the loan asked for and the difference. With NO
    // loan there is no debt to blame: the rent did not cover the tax and the
    // running costs, and a sentence about "trả nợ" would be describing an
    // instalment that does not exist. Source review caught that case.
    summary +=
      result.debtServicePerYear > 0
        ? ` ${fill(labels.shortfallNote, {
            shortfall: fullMoney(-result.cashFlowPerYear, labels),
            available: fullMoney(result.netOperatingIncomePerYear, labels),
            debt: fullMoney(result.debtServicePerYear, labels),
          })}`
        : ` ${fill(labels.shortfallOperatingNote, {
            shortfall: fullMoney(-result.cashFlowPerYear, labels),
            collected: fullMoney(result.effectiveRentPerYear, labels),
            costs: fullMoney(
              result.expensesPerYear + result.rentalTaxPerYear,
              labels,
            ),
          })}`;
  }
  if (!result.taxable && !result.pitApplies) {
    summary += ` ${labels.noTaxNote}`;
  }
  if (result.debtServicePerYear === 0) summary += ` ${labels.noDebtNote}`;

  const model = finishBars(
    bars,
    // Four quantities, four palette slots — the ceiling `palette.ts` sets.
    // `deficit` earns its own because it is the one quantity here that is not
    // money the reader has.
    [
      { key: "remaining", label: labels.remainingSegment },
      { key: "deducted", label: labels.deductedSegment },
      { key: "cash", label: labels.cashSegment },
      { key: "deficit", label: labels.deficitSegment },
    ],
    labels.axis,
    labels,
    {
      title: labels.title,
      summary,
      assumptions: labels.assumptions,
      tableCaption: labels.tableCaption,
      itemColumn: labels.itemColumn,
      amountColumn: labels.amountColumn,
    },
  );

  // The ledger in numbers, where the thin slices are not readable — and with
  // the two things the bridge deliberately draws as one step or not at all:
  // VAT and PIT on their different bases, and a negative closing figure.
  //
  // Three columns plus the charge name, so no `mobileCards`: docs §3 sets that
  // from five columns up.
  // EACH ROW ON ITS OWN TAX, and PIT AFTER the declared relief.
  //
  // Two defects this replaces, both found in source review. The list was
  // gated on `taxable` — the VAT flag — so a plan over the PIT deduction and
  // under the VAT threshold drew a tax step with no breakdown at all: 600
  // triệu of revenue against a 1 tỷ VAT gate and a 100 triệu allocated PIT
  // deduction owes 25 triệu of PIT and showed none of it. And the PIT row was
  // the PRE-relief figure, so a declared 30% reduction left the two "trong
  // đó" rows summing to 58 triệu under a 56,8 triệu step.
  const taxRows: (string | ReturnType<typeof moneyCell>)[][] = [];
  if (result.vatPerYear > 0) {
    taxRows.push([labels.vatRow, moneyCell(-result.vatPerYear), ""]);
  }
  if (result.pitAfterReliefPerYear > 0) {
    taxRows.push([labels.pitRow, moneyCell(-result.pitAfterReliefPerYear), ""]);
  }
  // The relief, stated as its own line so the after-relief row above is
  // checkable against the pre-relief figure rather than unexplained.
  if (result.pitReliefPerYear > 0) {
    taxRows.push([
      labels.pitReliefRow,
      moneyCell(result.pitReliefPerYear),
      "",
    ]);
  }

  return {
    ...model,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      columns: [
        { label: labels.chargeColumn },
        { label: labels.amountColumn, numeric: true },
        { label: labels.remainingColumn, numeric: true },
      ],
      rows: [
        [
          labels.grossBar,
          moneyCell(result.grossRentPerYear),
          moneyCell(result.grossRentPerYear),
        ],
        ...ledger.map((step) => [
          step.label,
          moneyCell(-step.amount),
          moneyCell(step.remaining),
        ]),
        ...taxRows,
        [
          labels.noiRow,
          moneyCell(result.netOperatingIncomePerYear),
          "",
        ],
        // The short step's own split, so the drawn segments have exact
        // figures beside them and the three quantities reconcile in numbers
        // as well as in lengths.
        ...(result.cashFlowPerYear < 0
          ? [
              [
                labels.coveredSegment,
                moneyCell(result.netOperatingIncomePerYear),
                "",
              ],
              [
                labels.uncoveredSegment,
                moneyCell(-result.cashFlowPerYear),
                "",
              ],
            ]
          : []),
        result.cashFlowPerYear < 0
          ? [
              // Not "thiếu so với khoản trả nợ" when there is no loan.
              result.debtServicePerYear > 0
                ? labels.shortfallRow
                : labels.shortfallOperatingRow,
              moneyCell(result.cashFlowPerYear),
              "",
            ]
          : [labels.cashSegment, moneyCell(result.cashFlowPerYear), ""],
      ],
    },
  };
}
