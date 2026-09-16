/**
 * The CASH WATERFALL for /cong-cu/phan-phoi-rong/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `net-proceeds-chart.test.ts`.
 *
 * Original row 67 specifies the visual exactly: "Waterfall tổng → khoản trừ →
 * thực nhận" — three kinds of row, and the middle one is the DEDUCTION. So
 * this is a bridge:
 *
 *   Tiền vay trước khi trừ   [############################]  2.000.000.000
 *   − Phí thu xếp            [##########################|=]  còn 1.980.000.000
 *   − Phí bảo hiểm           [#########################|=]   còn 1.970.000.000
 *   − Phí cố định            [#########################|]    còn 1.965.000.000
 *   = Tiền thực về tay       [#########################]     1.965.000.000
 *
 * A STEP BAR IS THE CASH THAT WAS IN HAND, SPLIT INTO KEPT AND TAKEN. Its
 * length is the balance BEFORE the charge — so it starts where the row above
 * ended — and it carries two segments: `remaining`, the cash still held after
 * the charge, and `deducted`, the charge itself, in its own colour with its
 * own legend entry and its own table row. The deduction is therefore a DRAWN
 * quantity rather than something the reader has to infer from two bar lengths
 * being slightly different.
 *
 * WHY NOT REMAINING-BALANCE BARS ALONE. That was the previous version: five
 * bars whose lengths were 2,000 / 1,980 / 1,970 / 1,965 / 1,965 tỷ. The
 * arithmetic was right and the labels named each charge, but nothing in the
 * PLOT was the deduction — a review called it a remaining-balance step
 * comparison rather than the specified deduction bridge, and it was right:
 * renaming a chart is not implementing one. The ledger and every figure from
 * that version are preserved exactly; what changed is that each charge is now
 * drawn.
 *
 * WHY NOT A FLOATING SLICE ON ITS OWN ROW. The textbook waterfall draws only
 * the deduction, offset to the running balance. On this page's own example the
 * charges are 1%, 0,5% and 0,25% of the amount, so those rows would be three
 * slivers on an otherwise empty plot with no visible link to the totals. The
 * bridge above keeps the offset reading — each bar begins at zero and ends
 * where the previous one did — while still drawing the charge.
 *
 * THE THIN SLICES ARE HONEST AND THE SUMMARY SAYS WHY. 35 triệu of charges on
 * a 2 tỷ loan is 1,75%, so the taken slices ARE narrow. `scaleNote` states
 * that share, computed from the engine's own figures, rather than letting a
 * reader conclude the drawing is broken — or, worse, truncating the axis to
 * make the charges look bigger than they are.
 *
 * Each bar's own label carries the charge that caused the step and its amount,
 * and the right-hand figure is the cash still in hand; both are readable
 * because `BarChart` renders bar labels and totals as HTML rather than as
 * 10-unit svg text.
 *
 * WHY THE FIRST VERSION WAS NOT THIS. It drew two equal-length composition
 * bars — the gross, and the gross split into cash-plus-charges — reasoning
 * that a descending staircase would imply the DEBT had fallen. An independent
 * review rejected that: the row asks for a deduction-by-deduction bridge, and
 * the debt misreading is solved by labelling the staircase as CASH and
 * keeping the unchanged obligation as its own prominent figure, not by
 * replacing the requested visual. Both facts are now taught: every bar is
 * named as tiền (cash), and `obligationNote` plus the first table row and the
 * page's own result rows carry the debt that does not move.
 *
 * THE FINAL BAR IS DRAWN EVEN THOUGH IT REPEATS THE LAST STEP'S KEPT SLICE. A
 * waterfall's closing total is the figure the reader came for, and leaving it
 * implicit in the last step means the answer is never stated as an answer.
 *
 * A NEGATIVE NET IS NOT DRAWN, because a bar has no signed form. When the
 * fixed charges swallow the whole amount the figure withholds itself with its
 * own reason, and the page's result rows still report the negative figure —
 * that state is real (a small transfer eaten by a flat fee) and the rows are
 * where it belongs. A net of exactly ZERO is drawn: an empty final bar under
 * a full first one is an honest picture of nothing arriving.
 *
 * EVERY CHARGE APPEARS ONCE. The steps are built from the charge list the
 * caller passes, and the tests assert the last step lands on the engine's own
 * net — so a charge counted twice, or one added back into the gross, is a
 * failing test rather than a plausible picture.
 */

import {
  barOf,
  emptyBars,
  finishBars,
  segment,
  type BarFrameLabels,
} from "@/lib/calc/charts/bars";
import { fill, fullMoney } from "@/lib/calc/charts/labels";
import type { BarChartModel } from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { moneyCell } from "@/lib/calc/table-cell";
import type { NetDistributionResult } from "@/lib/calc/net-distribution";

/** One named charge, as the page collected it. */
export type NamedCharge = {
  key: string;
  label: string;
  /** Đồng withheld by this charge. */
  amount: number;
  /**
   * The percentage that produced it, when it was a percentage charge.
   *
   * Carried so the table can state the DECLARED BASE — "1% của tổng" — rather
   * than leaving a reader to guess whether a charge was a share of the gross
   * or of the net. Null for a flat charge.
   */
  percent: number | null;
};

export type NetProceedsLabels = BarFrameLabels & {
  /** The first step: all the cash, before anything is withheld. */
  grossBar: string;
  /** The closing total. */
  netBar: string;
  /** Legend entry for the cash still in hand at each step. */
  remainingSegment: string;
  /**
   * Legend entry for the slice each charge takes.
   *
   * Its own key and its own colour, because the deduction is the middle term
   * of "tổng → khoản trừ → thực nhận" and has to be visible as a quantity.
   */
  deductedSegment: string;
  /** Legend entry and segment key label for the closing total. */
  cashSegment: string;
  /** One step's own label. `{charge}` and `{amount}` substituted. */
  stepFormat: string;
  /**
   * The figure shown beside a step: the cash still in hand.
   *
   * `{remaining}` substituted. Overrides the bar's own total, which for a step
   * is the balance BEFORE the charge — correct as a bar length and confusing
   * as a number, since it repeats the row above.
   */
  stepRemainingFormat: string;
  /**
   * Why the taken slices are thin. `{charges}` and `{percent}` substituted.
   *
   * Appended whenever a charge was made. The share is computed from the
   * engine's figures — see the module note on not truncating the axis.
   */
  scaleNote: string;
  /** Row label for the debt, which the staircase never touches. */
  debtRow: string;
  /** `{gross}`, `{net}`, `{charges}` substituted. */
  summary: string;
  /** Always appended: the obligation does not shrink. `{gross}` substituted. */
  obligationNote: string;
  /** Appended when no charge was entered at all. */
  noChargesNote: string;
  /** Shown instead of a plot when the charges exceed the amount. */
  negativeReason: string;
  negativeRecovery: string;
  /** `{percent}` substituted — the declared base for a percentage charge. */
  percentBaseFormat: string;
  chargeColumn: string;
  basisColumn: string;
  /** The running-balance column: the numeric form of the same bridge. */
  remainingColumn: string;
  flatBasis: string;
  /** One sentence on how to read a ledger whose middle rows are negative. */
  tableHint: string;
};

/**
 * The cash waterfall: one descending step per charge, then the closing total.
 *
 * `unavailable` when there is no result, or when the net is BELOW zero — see
 * the module note on why that case is reported in rows rather than drawn. A
 * net of exactly zero IS drawn: an empty final bar under a full first one is
 * an honest picture of nothing arriving.
 */
export function netProceedsModel(
  result: NetDistributionResult | null,
  charges: readonly NamedCharge[],
  labels: NetProceedsLabels,
): BarChartModel {
  if (result === null) return emptyBars(labels);
  if (result.net < 0) {
    const empty = emptyBars(labels);
    return {
      ...empty,
      summary: labels.negativeReason,
      unavailable: {
        reason: labels.negativeReason,
        recovery: labels.negativeRecovery,
      },
    };
  }

  // Only charges that actually took money. A 0 ₫ step is a bar claiming a
  // deduction nobody was billed, and it would flatten the staircase.
  const live = charges.filter((charge) => charge.amount > 0);

  // Step one: every đồng of the loan, before anything is withheld. Its
  // segment is keyed `remaining`, NOT `gross` — the cash still in hand is one
  // quantity down the whole figure and must be one colour. A `gross` key was
  // drawn here first and matched no legend swatch, which is precisely the
  // defect `palette.ts` exists to prevent; this module's own legend test is
  // what caught it.
  const bars = [
    barOf(
      "gross",
      labels.grossBar,
      [segment("remaining", labels.remainingSegment, result.gross, labels)],
      labels,
    ),
  ];

  // One bridge step per charge: the cash that was in hand, split into what
  // survives the charge and what the charge took. The running balance
  // accumulates from the SAME charge amounts the table lists, so the last step
  // cannot drift from the engine's net — a test pins that it lands on it.
  //
  // The two rows of figures per step are deliberately different quantities:
  // the bar's TOTAL is the balance before the charge (which is why the bar
  // starts where the row above ended) and the bar's displayed figure is the
  // balance after it. Showing the total as the number would repeat the row
  // above and read as though nothing had been taken.
  const ledger: { charge: NamedCharge; remaining: number }[] = [];
  let remaining = result.gross;
  for (const charge of live) {
    const before = remaining;
    remaining -= charge.amount;
    const kept = Math.max(0, remaining);
    ledger.push({ charge, remaining: kept });
    bars.push({
      key: `after-${charge.key}`,
      label: fill(labels.stepFormat, {
        charge: charge.label,
        amount: fullMoney(charge.amount, labels),
      }),
      total: before,
      totalLabel: fill(labels.stepRemainingFormat, {
        remaining: fullMoney(kept, labels),
      }),
      segments: [
        segment("remaining", labels.remainingSegment, kept, labels),
        segment("deducted", labels.deductedSegment, charge.amount, labels),
      ].filter((s): s is NonNullable<typeof s> => s !== null),
    });
  }

  // The closing total, drawn even though it repeats the last step's length: a
  // waterfall's final bar is the figure the reader came for, and leaving it
  // implicit means the answer is never stated as an answer.
  bars.push(
    barOf(
      "net",
      labels.netBar,
      [segment("cash", labels.cashSegment, result.net, labels)],
      labels,
      true,
    ),
  );

  // EXACT figures, not `compactMoney`, and this is not a style choice. At one
  // decimal place in tỷ the default fixture renders "2,0 tỷ" for the debt and
  // "2,0 tỷ" for the cash received — the summary would collapse the two
  // numbers whose difference is the entire point of the figure. A compact
  // unit is right for an axis that must fit four labels; it is wrong for a
  // sentence about a 35 triệu gap on a 2 tỷ amount. Caught by this module's
  // own test.
  let summary = fill(labels.summary, {
    gross: fullMoney(result.gross, labels),
    net: fullMoney(result.net, labels),
    charges: fullMoney(result.totalDeducted, labels),
  });
  // The debt, restated on the figure itself. `fill` because this sentence
  // names the unchanged obligation — the whole reason a descending cash
  // staircase is safe to draw.
  summary += ` ${fill(labels.obligationNote, {
    gross: fullMoney(result.gross, labels),
  })}`;
  if (live.length === 0) {
    summary += ` ${labels.noChargesNote}`;
  } else if (result.gross > 0) {
    // Why the taken slices are narrow, from the engine's own two figures. The
    // alternative — an axis that does not start at zero — would make a 1,75%
    // charge look like a third of the loan.
    summary += ` ${fill(labels.scaleNote, {
      charges: fullMoney(result.totalDeducted, labels),
      percent: formatDecimal((result.totalDeducted / result.gross) * 100, 2),
    })}`;
  }

  const model = finishBars(
    bars,
    // Three entries, one per quantity the bridge draws: the cash still in
    // hand, the slice a charge took, and the closing total. `deducted` is the
    // middle term of "tổng → khoản trừ → thực nhận" and needs its own colour.
    [
      { key: "remaining", label: labels.remainingSegment },
      { key: "deducted", label: labels.deductedSegment },
      { key: "cash", label: labels.cashSegment },
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

  // The ledger, with the two columns the generic table cannot carry: the
  // declared BASIS, which is what makes a percentage charge checkable against
  // a contract, and the RUNNING BALANCE, which is the bridge in numbers —
  // every step's own remainder, readable at any screen width where the thin
  // drawn slices are not. The DEBT row is here too, because the bridge
  // deliberately never touches it.
  //
  // Four columns, so no `mobileCards`: docs §3 sets that from five up.
  return {
    ...model,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      columns: [
        { label: labels.chargeColumn },
        { label: labels.basisColumn },
        { label: labels.amountColumn, numeric: true },
        { label: labels.remainingColumn, numeric: true },
      ],
      rows: [
        [labels.grossBar, "", moneyCell(result.gross), moneyCell(result.gross)],
        ...ledger.map((step) => [
          step.charge.label,
          step.charge.percent === null
            ? labels.flatBasis
            : fill(labels.percentBaseFormat, { percent: step.charge.percent }),
          moneyCell(-step.charge.amount),
          moneyCell(step.remaining),
        ]),
        // The closing total has no "after this" remainder of its own: it IS
        // the remainder. An empty cell rather than the figure repeated, which
        // would read as a sixth step.
        [labels.cashSegment, "", moneyCell(result.net), ""],
        // The obligation, stated once more where the cash figures are, so the
        // two cannot be read as the same quantity.
        [labels.debtRow, "", moneyCell(result.gross), ""],
      ],
    },
  };
}
