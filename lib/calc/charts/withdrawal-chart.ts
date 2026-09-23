/**
 * The drawdown, in đồng and in purchasing power, for /cong-cu/thu-nhap-dau-tu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `withdrawal-chart.test.ts`.
 *
 * Original row 26's visual, in the plan's own words: "đường số dư và sức mua
 * dưới kịch bản", under a row whose lesson is "lợi nhuận danh nghĩa khác khả
 * năng chi tiêu". So the picture is two readings of ONE balance rather than
 * two balances: the same money, counted in the đồng of each month and then at
 * today's prices.
 *
 * WHY THAT PAIR IS THE WHOLE POINT. A portfolio earning 8% while the
 * withdrawal rises 4% a year can look healthy in nominal terms for a decade —
 * on the fixture below the balance is still 1,15 tỷ at month 120 — while its
 * purchasing power has already fallen to 779 triệu. A reader shown only the
 * nominal line concludes the plan is fine; the gap between the two lines IS
 * the risk the row exists to show.
 *
 * THE INDEX IS DECLARED, NOT ASSUMED. `realBalance` deflates smoothly by
 * `(1 + inflation)^(month/12)` while the WITHDRAWAL steps up once a year.
 * Those are different shapes on purpose and the figure's assumptions say so —
 * see `withdrawal.ts`. Without that sentence a reader who notices the two
 * curves are not parallel has no way to tell a convention from a bug.
 *
 * THE END OF THE MONEY IS AN EVENT, AND IT IS LABELLED HONESTLY. When the
 * balance runs out the marker names the month AND the fact that the last
 * withdrawal was partial, because `monthsLasted` of 179 means 178 full
 * payments and one short one on this fixture. Nothing here recomputes that:
 * the engine reports `fullWithdrawals` and the shortfall.
 *
 * NO PROMISE ANYWHERE. Every figure rests on a return the reader typed. The
 * summary says the horizon is what these assumptions imply, not what the
 * money will do.
 */

import { compactMoney, fill, fullMoney } from "@/lib/calc/charts/labels";
import type { LineChartModel } from "@/lib/calc/charts/types";
import {
  valuePathsModel,
  type ValuePathsLabels,
} from "@/lib/calc/charts/value-paths-chart";
import { moneyCell } from "@/lib/calc/table-cell";
import type { WithdrawalResult } from "@/lib/calc/withdrawal";

export type WithdrawalChartLabels = ValuePathsLabels & {
  /** The nominal balance path. */
  nominalPath: string;
  /** The same balance at today's prices. */
  realPath: string;
  /** Marker when the money runs out. `{month}` substituted. */
  ranOutMarker: string;
  /** Marker at the simulation cap when it never runs out. `{month}`. */
  survivedMarker: string;
  /** `{months}`, `{years}`, `{nominal}`, `{real}` substituted. */
  summaryRanOut: string;
  /** `{months}`, `{nominal}`, `{real}` substituted. */
  summarySurvived: string;
  /** Always appended: the smooth index convention. */
  indexNote: string;
  /**
   * Appended when the final withdrawal was short.
   * `{full}`, `{planned}`, `{paid}`, `{short}` substituted.
   */
  partialNote: string;
  /**
   * Appended when the two drawn series coincide at every point.
   *
   * NOT "when inflation is zero". This module never receives the inflation
   * entry — `WithdrawalResult` reports `realReturnPercent`, which cannot be
   * inverted without the nominal return — so the copy must describe the
   * coincidence, not diagnose its cause. See the note in the content file.
   */
  coincidentLinesNote: string;
  itemColumn: string;
  amountColumn: string;
  monthRow: string;
  nominalRow: string;
  realRow: string;
};

/** Checkpoints the exact table reports, in months. */
const CHECKPOINTS = [0, 12, 60, 120] as const;

/**
 * Two readings of the balance over time, with the end of the money marked.
 *
 * `unavailable` when there is no result. A result always has at least two
 * points: month 0 plus at least one simulated month.
 */
export function withdrawalChartModel(
  result: WithdrawalResult | null,
  labels: WithdrawalChartLabels,
): LineChartModel {
  if (result === null) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const lastMonth = result.series[result.series.length - 1].month;
  const ranOut = result.monthsLasted !== null;

  // The exact reading at a few checkpoints, plus the end. Typed money cells so
  // `ResultTable` states one unit for the block and keeps the exact đồng
  // behind its checkbox (docs §3).
  const checkpoints = [...new Set([...CHECKPOINTS, lastMonth])]
    .filter((month) => month <= lastMonth)
    .sort((a, b) => a - b);
  const pointAt = (month: number) =>
    result.series.find((p) => p.month === month);

  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    columns: [
      { label: labels.monthRow, numeric: true, nowrap: true },
      { label: labels.nominalRow, numeric: true },
      { label: labels.realRow, numeric: true },
    ],
    rows: checkpoints.flatMap((month) => {
      const point = pointAt(month);
      if (point === undefined) return [];
      return [
        [
          String(month),
          moneyCell(point.balance),
          moneyCell(point.realBalance),
        ],
      ];
    }),
  };

  const endPoint = result.series[result.series.length - 1];
  let summary = ranOut
    ? fill(labels.summaryRanOut, {
        months: String(result.monthsLasted),
        years: String(Math.floor((result.monthsLasted ?? 0) / 12)),
        nominal: fullMoney(result.totalWithdrawn, labels),
        real: fullMoney(result.finalMonthlyWithdrawal, labels),
      })
    : fill(labels.summarySurvived, {
        months: String(lastMonth),
        nominal: fullMoney(endPoint.balance, labels),
        real: fullMoney(endPoint.realBalance, labels),
      });

  // The partial last payment, BEFORE the index note, because it changes how
  // the month count itself should be read.
  if (
    result.lastWithdrawalShortfall !== null &&
    result.lastWithdrawalShortfall > 0 &&
    result.fullWithdrawals !== null &&
    result.lastWithdrawalPlanned !== null &&
    result.lastWithdrawalPaid !== null
  ) {
    summary += ` ${fill(labels.partialNote, {
      full: String(result.fullWithdrawals),
      planned: fullMoney(result.lastWithdrawalPlanned, labels),
      paid: fullMoney(result.lastWithdrawalPaid, labels),
      short: fullMoney(result.lastWithdrawalShortfall, labels),
    })}`;
  }

  summary += ` ${labels.indexNote}`;

  // A reader seeing one line needs to know the second is exactly underneath
  // it. The condition is what it has always been — the two series agree at
  // every drawn point — but it is NOT evidence that inflation was zero, and
  // the note used to say it was. A plan that depletes in month 1 draws only
  // month 0 and a terminal 0, both of which agree at any inflation: a browser
  // pass hit exactly that with 1.000.000 ₫, a 30.000.000 ₫ draw, 8% and 4%,
  // and got "Bạn đang đặt lạm phát bằng 0" beside a real return of 3,8462%.
  const linesCoincide = result.series.every(
    (point) => point.balance === point.realBalance,
  );
  if (linesCoincide) summary += ` ${labels.coincidentLinesNote}`;

  return valuePathsModel(
    [
      {
        key: "nominal",
        label: labels.nominalPath,
        points: result.series.map((p) => ({
          period: p.month,
          value: p.balance,
        })),
        area: true,
      },
      {
        key: "real",
        label: labels.realPath,
        points: result.series.map((p) => ({
          period: p.month,
          value: p.realBalance,
        })),
      },
    ],
    labels,
    {
      summary,
      markers: [
        {
          period: lastMonth,
          label: ranOut
            ? fill(labels.ranOutMarker, { month: String(lastMonth) })
            : fill(labels.survivedMarker, { month: String(lastMonth) }),
        },
      ],
      table,
    },
  );
}

/** Exported for the content test: the checkpoints the table reports. */
export const WITHDRAWAL_CHECKPOINTS = CHECKPOINTS;

/** Kept for a consumer that wants the compact form of a checkpoint. */
export function withdrawalCheckpointLabel(
  value: number,
  labels: WithdrawalChartLabels,
): string {
  return compactMoney(value, labels);
}
