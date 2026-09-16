/**
 * The cash-flow timeline for /cong-cu/gia-tri-tien-te-theo-thoi-gian/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `tvm-timeline-chart.test.ts`.
 *
 * Original row 18 asks for a "dòng tiền theo thời gian" beside the everyday
 * question. Two paths, because the question a timeline answers here is not
 * "how big does it get" but "how much of that is mine":
 *
 * - **Số dư** — the closing balance each month, from `projectSavings`.
 * - **Tiền bạn đã bỏ vào** — the starting amount plus the contributions made
 *   so far. The GAP between them is everything the assumed rate contributed,
 *   and at the horizons this page is for that gap is small, which is the
 *   honest lesson.
 *
 * THE GOAL IS A REFERENCE, NOT A MARKER. A target is an amount, so it is a
 * horizontal rule; drawing it as a vertical rule at the month it is reached
 * would say the goal was a date. The month it IS reached is a marker, and in
 * the "how long" question that month is the DISCRETE one — see
 * `tvm-questions.ts` on why 36,56 algebraic periods is month 37.
 *
 * IT COMPUTES NOTHING. Every figure comes from `answerTvmQuestion`, which in
 * turn delegates to `solveTvm` and `projectSavings`.
 */

import { fill, fullMoney } from "@/lib/calc/charts/labels";
import type { LineChartModel } from "@/lib/calc/charts/types";
import {
  valuePathsModel,
  type ValuePathsLabels,
} from "@/lib/calc/charts/value-paths-chart";
import { formatDecimal } from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { balanceAfter } from "@/lib/calc/savings-schedule";
import type { TvmQuestionResult } from "@/lib/calc/tvm-questions";

export type TvmTimelineLabels = ValuePathsLabels & {
  /** The closing-balance path. */
  balancePath: string;
  /** The reader's own money in, cumulative. */
  contributedPath: string;
  /** Horizontal rule at the goal. `{goal}` substituted. */
  goalReference: string;
  /** Vertical rule at the horizon the answer is stated at. `{month}`. */
  horizonMarker: string;
  /** Vertical rule at the month a goal is first covered. `{month}`. */
  fundedMarker: string;
  /** `{months}`, `{balance}`, `{paid}`, `{interest}` substituted. */
  summaryBalance: string;
  /** `{months}`, `{goal}`, `{contribution}`, `{paid}` substituted. */
  summaryContribution: string;
  /** `{months}`, `{goal}`, `{balance}` substituted. */
  summaryMonths: string;
  /**
   * The algebra-versus-schedule distinction, appended in the "how long"
   * question. `{exact}`, `{before}`, `{beforeBalance}`, `{funded}`,
   * `{fundedBalance}` substituted.
   */
  exactPeriodNote: string;
  /** Appended when the goal is not reached inside the supported horizon. */
  notReachedNote: string;
  /** Appended when the goal is already met today. */
  alreadyFundedNote: string;
  /** Always appended: the rate is an assumption, and it is nominal ÷ 12. */
  rateNote: string;
  monthColumn: string;
  balanceColumn: string;
  contributedColumn: string;
};

/** Table rows, at most this many, so the block reads at 390 px. */
const MAX_TABLE_ROWS = 8;

/** The months the exact table reports: year marks plus the months that matter. */
function checkpoints(
  horizon: number,
  mandatory: readonly number[],
): number[] {
  const keep = new Set<number>([0, horizon]);
  for (const month of mandatory) {
    if (Number.isSafeInteger(month) && month >= 0 && month <= horizon) {
      keep.add(month);
    }
  }
  // Year marks, thinned in whole years so the column stays readable.
  const years = Math.max(1, Math.ceil(horizon / 12));
  const strideYears = Math.max(1, Math.ceil(years / (MAX_TABLE_ROWS - 2)));
  for (let month = strideYears * 12; month < horizon; month += strideYears * 12) {
    keep.add(month);
  }
  return [...keep].sort((a, b) => a - b);
}

/**
 * The timeline, its goal line and the exact reading.
 *
 * `unavailable` when there is no result, or when the plan has no months to
 * draw — a goal already met today is one point, and the page's own rows
 * report that case in words.
 */
export function tvmTimelineModel(
  result: TvmQuestionResult | null,
  labels: TvmTimelineLabels,
): LineChartModel {
  if (result === null) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const monthlyRate = result.monthlyRatePercent / 100;
  const contributed = (month: number) =>
    result.currentSavings + result.monthlyContribution * month;
  const balance = (month: number) =>
    balanceAfter(
      month,
      result.currentSavings,
      result.monthlyContribution,
      monthlyRate,
    );

  // What horizon to DRAW. The stated one where there is one; for a goal that
  // is never reached there is still a plan worth seeing, so the schedule's own
  // reported months are used and the summary says the goal is not in it.
  const horizon =
    result.months !== null && result.months > 0
      ? result.months
      : result.schedule.months;

  if (!(horizon > 0)) {
    // One point is not a line, and the empty frame shows the REASON rather
    // than a summary — so the already-met case is named there, not in a
    // sentence `ChartFigure` would discard.
    return valuePathsModel([], labels, {
      summary: labels.alreadyFundedNote,
      unavailable: {
        reason: labels.alreadyFundedNote,
        recovery: labels.unavailableRecovery,
      },
    });
  }

  const drawn = result.schedule.points
    .filter((point) => point.period <= horizon)
    .map((point) => point.period);
  // The schedule is sampled for the horizon it ran to, which is not always the
  // horizon drawn here (the "how long" question funds at a month the sample
  // may have skipped). Endpoints are mandatory either way —
  // `value-paths-chart.ts` keeps each path's own first and last.
  const periods = [...new Set([...drawn, 0, horizon])].sort((a, b) => a - b);

  const markerMonth = result.fundedMonth ?? horizon;
  const markers = [
    {
      period: markerMonth,
      label: fill(
        result.fundedMonth === null
          ? labels.horizonMarker
          : labels.fundedMarker,
        { month: String(markerMonth) },
      ),
    },
  ];

  const references =
    result.goal === null
      ? []
      : [
          {
            value: result.goal,
            label: fill(labels.goalReference, {
              goal: fullMoney(result.goal, labels),
            }),
          },
        ];

  // The exact reading. Typed money cells so `ResultTable` states one unit for
  // the block and keeps the đồng behind its checkbox (docs §3), and the MONTH
  // column stays a count.
  const rows = checkpoints(horizon, [
    result.fundedMonth ?? horizon,
    result.fundedMonth === null ? horizon : result.fundedMonth - 1,
  ]).map((month) => [
    countCell(month),
    moneyCell(balance(month)),
    moneyCell(contributed(month)),
  ]);

  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    mobileCards: true,
    columns: [
      { label: labels.monthColumn, numeric: true, nowrap: true },
      { label: labels.balanceColumn, numeric: true },
      { label: labels.contributedColumn, numeric: true },
    ],
    rows,
  };

  let summary: string;
  if (result.question === "balanceAfter") {
    summary = fill(labels.summaryBalance, {
      months: String(horizon),
      balance: fullMoney(result.balanceAtHorizon ?? 0, labels),
      paid: fullMoney(result.totalContributed ?? 0, labels),
      interest: fullMoney(result.interest ?? 0, labels),
    });
  } else if (result.question === "contributionNeeded") {
    summary = fill(labels.summaryContribution, {
      months: String(horizon),
      goal: fullMoney(result.goal ?? 0, labels),
      contribution: fullMoney(result.monthlyContribution, labels),
      paid: fullMoney(result.totalContributed ?? 0, labels),
    });
  } else {
    summary = fill(labels.summaryMonths, {
      months: result.fundedMonth === null ? "—" : String(result.fundedMonth),
      goal: fullMoney(result.goal ?? 0, labels),
      balance: fullMoney(result.balanceAtFundedMonth ?? balance(horizon), labels),
    });
    if (result.fundedMonth === null) {
      summary += ` ${labels.notReachedNote}`;
    } else if (
      result.exactPeriods !== null &&
      result.balanceBeforeFundedMonth !== null
    ) {
      // The distinction the row exists for: the algebraic period count is not
      // a month a standing order can be made in.
      summary += ` ${fill(labels.exactPeriodNote, {
        // The house formatter, never `toFixed`: `,` is the decimal separator
        // here and every figure in the suite goes through `lib/calc/number`.
        exact: formatDecimal(result.exactPeriods, 2),
        before: String(result.fundedMonth - 1),
        beforeBalance: fullMoney(result.balanceBeforeFundedMonth, labels),
        funded: String(result.fundedMonth),
        fundedBalance: fullMoney(result.balanceAtFundedMonth ?? 0, labels),
      })}`;
    }
  }
  summary += ` ${labels.rateNote}`;

  return valuePathsModel(
    [
      {
        key: "balance",
        label: labels.balancePath,
        points: periods.map((period) => ({
          period,
          value: balance(period),
        })),
        area: true,
      },
      {
        key: "contributed",
        label: labels.contributedPath,
        points: periods.map((period) => ({
          period,
          value: contributed(period),
        })),
      },
    ],
    labels,
    { summary, markers, references, table },
  );
}
