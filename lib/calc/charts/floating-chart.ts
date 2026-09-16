/**
 * The payment-timeline chart for /cong-cu/lai-suat-tha-noi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `floating-chart.test.ts`.
 *
 * The instalment holds flat through each rate phase and JUMPS at every reset,
 * so the series is a step function and `step: true` says so. Joining two phase
 * levels with a diagonal would draw a gradual climb that does not happen — the
 * borrower's payment does not creep up over a year, it changes in one month.
 *
 * The reset markers are the point of the picture. Each carries the month it
 * falls on, so "tháng 13" is readable off the chart rather than inferred from
 * a phase table.
 *
 * A BUDGET LINE IS DRAWN ONLY IF THE USER GAVE ONE. There is no default
 * affordable payment here and no ratio invented to stand in for one: a
 * horizontal rule labelled "ngân sách" that the tool made up would be the
 * worst kind of advice, because it looks like a measurement.
 *
 * SCENARIOS ARE NOT FORECASTS. The rates after the promotional period are the
 * user's own assumptions, and `scenarioNote` is appended to every summary this
 * module produces, not left to the page to remember.
 */

import type { FloatingLoanResult } from "@/lib/calc/floating-loan";
import {
  axisTickLabel,
  axisUnit,
  compactMoney,
  fill,
  fullMoney,
  type MoneyWords,
} from "@/lib/calc/charts/labels";
import {
  linearTicks,
  niceMax,
  type LineChartModel,
} from "@/lib/calc/charts/types";
import { formatDecimal, formatPercent } from "@/lib/calc/number";
import { moneyCell, percentCell } from "@/lib/calc/table-cell";

export type FloatingChartLabels = MoneyWords & {
  title: string;
  paymentSeries: string;
  budgetReference: string;
  /** `{n}` substituted: "Tháng {n}". */
  resetMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{first}`, `{highest}`, `{resetMonth}`, `{change}`, `{changePercent}`. */
  summary: string;
  /** Used instead when the rate never changes. */
  summaryFlat: string;
  /** Appended to every summary. */
  scenarioNote: string;
  /** Appended when a budget line is drawn. */
  budgetNote: string;
  /** Used when the first instalment is 0, so no percentage exists. */
  changePercentUndefined: string;
  assumptions: readonly string[];
  tableCaption: string;
  phaseColumn: string;
  rateColumn: string;
  paymentColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

function empty(labels: FloatingChartLabels): LineChartModel {
  return {
    kind: "lines",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    series: [],
    markers: [],
    references: [],
    xAxis: { label: labels.xAxis, ticks: [] },
    yAxis: { label: fill(labels.yAxis, { unit: labels.currency }), ticks: [] },
    xMax: 0,
    yMin: 0,
    yMax: 0,
    step: true,
    table: {
      caption: labels.tableCaption,
      columns: [
        // "1–12" is a range, not prose: an en dash break would read as two
        // separate months.
        { label: labels.phaseColumn, nowrap: true },
        { label: labels.rateColumn, numeric: true },
        { label: labels.paymentColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/**
 * Build the floating-rate timeline.
 *
 * `monthlyBudget` is optional and must come from an explicit input. Pass
 * `null` when the user has not supplied one; do not substitute a ratio.
 */
export function floatingChartModel(
  result: FloatingLoanResult | null,
  monthlyBudget: number | null,
  labels: FloatingChartLabels,
): LineChartModel {
  if (result === null || result.phases.length === 0) return empty(labels);

  // One point at the start of each phase, plus a closing point at the end of
  // the last one. With `step: true` that is exactly the payment level in force
  // at every month, and it is 2–20 points instead of 240.
  const points = result.phases.map((phase) => ({
    period: phase.fromMonth,
    value: phase.payment,
  }));
  const lastPhase = result.phases[result.phases.length - 1];
  points.push({ period: lastPhase.toMonth, value: lastPhase.payment });

  // Every phase boundary after the first is a reset the borrower feels.
  const markers = result.phases
    .slice(1)
    .map((phase) => ({
      period: phase.fromMonth,
      label: fill(labels.resetMarker, { n: phase.fromMonth }),
    }));

  const references =
    monthlyBudget !== null && monthlyBudget > 0
      ? [
          {
            value: monthlyBudget,
            label: `${labels.budgetReference}: ${fullMoney(monthlyBudget, labels)}`,
          },
        ]
      : [];

  // The budget line has to be inside the plot to be worth drawing, so it
  // participates in the maximum.
  const yMax = niceMax(
    Math.max(result.highestPayment, ...references.map((r) => r.value)),
  );
  const xMax = lastPhase.toMonth;
  const unit = axisUnit(yMax, labels);

  const flat = result.phases.length === 1 || result.paymentShock === 0;
  let summary: string;
  if (flat) {
    summary = fill(labels.summaryFlat, {
      first: compactMoney(result.firstPayment, labels),
    });
  } else {
    // `paymentShockPercent` is 0 by construction when the first payment is 0 —
    // the module refuses to divide by it — so the percentage is replaced by a
    // phrase rather than rendered as a meaningless "0,00%".
    const changePercent =
      result.firstPayment > 0
        ? formatPercent(result.paymentShockPercent, 1)
        : labels.changePercentUndefined;
    summary = fill(labels.summary, {
      first: compactMoney(result.firstPayment, labels),
      highest: compactMoney(result.highestPayment, labels),
      resetMonth: markers.length > 0 ? markers[0].period : result.months,
      change: compactMoney(result.paymentShock, labels),
      changePercent,
    });
  }
  summary += ` ${labels.scenarioNote}`;
  if (references.length > 0) summary += ` ${labels.budgetNote}`;

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series: [
      {
        key: "payment",
        label: labels.paymentSeries,
        stroke: "solid",
        points,
      },
    ],
    markers,
    references,
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMin: 0,
    yMax,
    // A payment level that holds and then jumps. See the module docstring.
    step: true,
    table: {
      caption: labels.tableCaption,
      columns: [
        // "1–12" is a range, not prose: an en dash break would read as two
        // separate months.
        { label: labels.phaseColumn, nowrap: true },
        { label: labels.rateColumn, numeric: true },
        { label: labels.paymentColumn, numeric: true },
      ],
      // The rate is a `percentCell`, so no display mode ever divides it by a
      // million: "8,50%" reads the same in the compact table and the exact one.
      rows: result.phases.map((phase) => [
        `${formatDecimal(phase.fromMonth, 0)}–${formatDecimal(phase.toMonth, 0)}`,
        percentCell(phase.annualRatePercent, 2),
        moneyCell(phase.payment),
      ]),
    },
    unavailable: null,
  };
}
