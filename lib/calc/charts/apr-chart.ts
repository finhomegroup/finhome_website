/**
 * The nominal-rate-versus-APR bars for /cong-cu/apr/ and /cong-cu/apr-nang-cao/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `apr-chart.test.ts`.
 *
 * The original plan row asks for "nominal rate versus APR bars plus a short
 * fee breakdown", and the reason is that an APR on its own is a number a
 * reader cannot check. Two bars of the same kind, one labelled what the
 * contract says and one labelled what the cash flows imply, make the fee
 * visible as the GAP between them — which is the only thing the page is
 * teaching.
 *
 * A RATE AXIS, NOT A MONEY ONE. `BarChartModel` carries no unit of its own:
 * the adapter formats every tick and every value label, so the same component
 * draws percentage points here and đồng elsewhere. Nothing in `lib/` holds
 * user-facing Vietnamese — the unit word arrives in `labels`.
 *
 * The fee breakdown is in the model's accessible TABLE rather than as extra
 * bars. Fees are money and the bars are rates; stacking them on one axis
 * would be the unit error this suite has shipped before.
 */

import type { AprResult } from "@/lib/calc/apr";
import { fill, type MoneyWords } from "@/lib/calc/charts/labels";
import {
  linearTicks,
  niceMax,
  type BarChartModel,
  type BarSegment,
  type StackedBar,
} from "@/lib/calc/charts/types";
import { formatDecimal, formatPercent } from "@/lib/calc/number";
import { moneyCell } from "@/lib/calc/table-cell";

export type AprChartLabels = MoneyWords & {
  title: string;
  /** The rate written in the contract. */
  nominalBar: string;
  /** The rate the cash flows imply once fees are counted. */
  aprBar: string;
  /** The same, if the loan is cleared at the chosen month. `{n}`. */
  payoffBar: string;
  /** `{unit}` substituted with the percentage-point word. */
  axis: string;
  /** The percentage-point unit word, e.g. "%/năm". */
  axisUnit: string;
  /** `{gap}`, `{nominal}`, `{apr}` substituted. */
  summary: string;
  /** Appended when the fees are zero and the two bars coincide. */
  noFeeNote: string;
  /** Appended always: this is a modelled rate, not a published one. */
  modeledNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  itemColumn: string;
  rateColumn: string;
  amountColumn: string;
  /** Fee breakdown row labels. */
  upfrontRow: string;
  pointsRow: string;
  financedRow: string;
  netProceedsRow: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

function empty(labels: AprChartLabels, reason: string): BarChartModel {
  return {
    kind: "bars",
    title: labels.title,
    summary: reason,
    assumptions: labels.assumptions,
    bars: [],
    max: 0,
    axis: { label: fill(labels.axis, { unit: labels.axisUnit }), ticks: [] },
    legend: [],
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.itemColumn },
        { label: labels.rateColumn, numeric: true },
        { label: labels.amountColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: { reason, recovery: labels.unavailableRecovery },
  };
}

/** One rate bar: a single segment, because a rate does not stack. */
function rateBar(key: string, label: string, value: number): StackedBar {
  const segment: BarSegment = {
    key,
    label,
    value,
    valueLabel: formatPercent(value, 4),
  };
  return {
    key,
    label,
    total: value,
    totalLabel: formatPercent(value, 4),
    segments: [segment],
    emphasis: key === "apr",
  };
}

/**
 * Build the rate comparison.
 *
 * `result` may be null — an invalid form clears the figure rather than leaving
 * the previous one beside new inputs. The APR fields may be null on their own
 * while the loan figures are valid, which is a real outcome the frame
 * explains rather than an error.
 */
export function aprRateBarsModel(
  result: AprResult | null,
  annualRatePercent: number,
  /** The money the borrower asked for, before any fee. */
  amount: number,
  labels: AprChartLabels,
): BarChartModel {
  if (result === null || !Number.isFinite(annualRatePercent)) {
    return empty(labels, labels.unavailableReason);
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return empty(labels, labels.unavailableReason);
  }
  if (result.aprPercent === null) {
    return empty(labels, labels.unavailableReason);
  }

  const bars: StackedBar[] = [
    rateBar("nominal", labels.nominalBar, annualRatePercent),
    rateBar("apr", labels.aprBar, result.aprPercent),
  ];
  if (result.payoffAprPercent !== null && result.payoffMonths !== null) {
    bars.push(
      rateBar(
        "payoff",
        fill(labels.payoffBar, {
          n: formatDecimal(result.payoffMonths, 0),
        }),
        result.payoffAprPercent,
      ),
    );
  }

  const max = niceMax(Math.max(...bars.map((bar) => bar.total)));
  const gap = result.aprPercent - annualRatePercent;

  let summary = fill(labels.summary, {
    nominal: formatPercent(annualRatePercent, 4),
    apr: formatPercent(result.aprPercent, 4),
    gap: `${formatDecimal(gap, 4)}`,
  });
  // The two bars coincide when there is no fee, and saying so is the honest
  // reading of an identical pair — not evidence the tool failed.
  if (result.totalFees === 0) summary += ` ${labels.noFeeNote}`;
  summary += ` ${labels.modeledNote}`;

  return {
    kind: "bars",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    bars,
    max,
    axis: {
      label: fill(labels.axis, { unit: labels.axisUnit }),
      // Percentage points, formatted here: the component draws whatever the
      // adapter says, so the axis is not silently a money one.
      ticks: linearTicks(max, 4, (value) => formatDecimal(value, 2)),
    },
    legend: [],
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.itemColumn },
        { label: labels.rateColumn, numeric: true },
        { label: labels.amountColumn, numeric: true },
      ],
      // Rates in the rate column, money in the money column, and never the
      // other way round — the table's compact unit applies to amounts only.
      rows: [
        [labels.nominalBar, formatPercent(annualRatePercent, 4), null],
        [labels.aprBar, formatPercent(result.aprPercent, 4), null],
        ...(result.payoffAprPercent !== null && result.payoffMonths !== null
          ? [
              [
                fill(labels.payoffBar, {
                  n: formatDecimal(result.payoffMonths, 0),
                }),
                formatPercent(result.payoffAprPercent, 4),
                null,
              ],
            ]
          : []),
        // Derived from `amount` and the result's own ledger, so the three fee
        // lines sum to `totalFees` exactly and nothing is counted twice:
        //   paidUpFront  = amount − netProceeds
        //   financedFees = principal − amount
        //   upfrontCash  = paidUpFront − pointsCost
        [
          labels.upfrontRow,
          null,
          moneyCell(amount - result.netProceeds - result.pointsCost),
        ],
        [labels.pointsRow, null, moneyCell(result.pointsCost)],
        [labels.financedRow, null, moneyCell(result.principal - amount)],
        [labels.netProceedsRow, null, moneyCell(result.netProceeds)],
      ],
    },
    unavailable: null,
  };
}
