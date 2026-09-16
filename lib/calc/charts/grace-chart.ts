/**
 * The two pictures for /cong-cu/chi-tra-lai/ — ân hạn gốc.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `grace-chart.test.ts`.
 *
 * Original row 14 asks for exactly these two, and they answer two different
 * questions:
 *
 * 1. `gracePaymentBarsModel` — "khoản trả trước/sau ân hạn". One bar per
 *    payment LEVEL, in the order the months happen, so the jump is a length a
 *    reader can compare rather than a figure they have to subtract. Each bar
 *    splits into interest and principal, which is what makes the grace bars
 *    visibly all-interest.
 * 2. `graceBalanceLineModel` — "đường dư nợ". The debt path, with the grace
 *    end and the promotion end marked as SEPARATE months, because they are
 *    separate events. The flat opening stretch is the lesson: chưa trả gốc
 *    nghĩa là nghĩa vụ vẫn còn.
 *
 * Both read the SAME `GraceLoanResult` the headline does — every figure here
 * comes out of `computeGraceLoan`, and nothing in this file amortizes anything.
 *
 * NOT A PRODUCT, NOT A FORECAST. The grace length, the promotional rate and
 * the rate after it are the reader's own entries, and `scenarioNote` is
 * appended to both summaries here rather than left to a page to remember.
 */

import type { GraceLoanResult } from "@/lib/calc/grace-loan";
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
  type BarChartModel,
  type BarSegment,
  type LineChartModel,
  type StackedBar,
} from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { moneyCell, percentCell } from "@/lib/calc/table-cell";

export type GracePaymentBarsLabels = MoneyWords & {
  title: string;
  /** `{from}`, `{to}` substituted: "Tháng {from}–{to}". */
  phaseBar: string;
  /** Appended to a bar's label while only interest is charged. */
  graceSuffix: string;
  interestSegment: string;
  principalSegment: string;
  /** `{unit}` substituted. */
  axis: string;
  /** `{grace}`, `{after}`, `{jump}`, `{month}` substituted. */
  summary: string;
  /** Used when there is no grace period: `{first}` substituted. */
  summaryNoGrace: string;
  /** Appended to every summary. */
  scenarioNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  phaseColumn: string;
  rateColumn: string;
  paymentColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

export type GraceBalanceLabels = MoneyWords & {
  title: string;
  balanceSeries: string;
  /** `{n}` substituted. */
  graceMarker: string;
  /** `{n}` substituted. */
  resetMarker: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{month}`, `{balance}` substituted. */
  summary: string;
  /** Used when there is no grace period: `{first}` substituted. */
  summaryNoGrace: string;
  scenarioNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  monthColumn: string;
  balanceColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** A month range, as a label that never breaks across two lines. */
const range = (from: number, to: number) =>
  `${formatDecimal(from, 0)}–${formatDecimal(to, 0)}`;

function emptyBars(labels: GracePaymentBarsLabels): BarChartModel {
  return {
    kind: "bars",
    title: labels.title,
    summary: labels.unavailableReason,
    assumptions: labels.assumptions,
    bars: [],
    max: 0,
    axis: { label: fill(labels.axis, { unit: labels.currency }), ticks: [] },
    legend: [],
    table: {
      caption: labels.tableCaption,
      columns: [
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

function emptyLine(labels: GraceBalanceLabels): LineChartModel {
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
    step: false,
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.monthColumn, numeric: true, nowrap: true },
        { label: labels.balanceColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/** A segment, skipped entirely when it is zero — a grace bar has no principal. */
function segment(
  key: string,
  label: string,
  value: number,
  words: MoneyWords,
): BarSegment | null {
  if (!(value > 0)) return null;
  return { key, label, value, valueLabel: fullMoney(value, words) };
}

/**
 * One bar per payment level: the ân-hạn-gốc instalment, then the ones after it.
 *
 * The bar's TOTAL is the monthly instalment in that stretch, split into the
 * interest and principal of ITS FIRST MONTH — not the stretch's whole interest,
 * which would make a 216-month phase dwarf a 12-month one and answer a
 * question nobody asked. The split comes from that schedule row, so a grace
 * bar is all interest by construction rather than by a flag.
 *
 * The first month is the honest choice AND a limit worth stating: inside an
 * amortizing stretch the total payment holds constant but the split keeps
 * moving month by month, so this bar is a snapshot of the stretch's opening
 * month rather than a picture of the whole stretch. The labels say so.
 */
export function gracePaymentBarsModel(
  result: GraceLoanResult | null,
  labels: GracePaymentBarsLabels,
): BarChartModel {
  if (result === null || result.phases.length === 0) return emptyBars(labels);

  const bars: StackedBar[] = result.phases.map((phase) => {
    const first = result.schedule[phase.fromMonth - 1];
    const label =
      fill(labels.phaseBar, {
        from: formatDecimal(phase.fromMonth, 0),
        to: formatDecimal(phase.toMonth, 0),
      }) + (phase.interestOnly ? ` ${labels.graceSuffix}` : "");
    const segments = [
      segment("interest", labels.interestSegment, first.interest, labels),
      segment("principal", labels.principalSegment, first.principal, labels),
    ].filter((entry): entry is BarSegment => entry !== null);
    const total = segments.reduce((sum, entry) => sum + entry.value, 0);
    return {
      key: `phase-${phase.fromMonth}`,
      label,
      total,
      totalLabel: fullMoney(total, labels),
      segments,
      // The bar the page is about: the first one that repays principal.
      emphasis: phase.fromMonth === result.firstAmortizingMonth,
    };
  });

  const max = niceMax(Math.max(...bars.map((bar) => bar.total), 0));

  let summary: string;
  if (result.graceJump === null || result.lastGracePayment === null) {
    summary = fill(labels.summaryNoGrace, {
      first: compactMoney(result.firstPayment, labels),
    });
  } else {
    summary = fill(labels.summary, {
      grace: compactMoney(result.lastGracePayment, labels),
      after: compactMoney(result.firstAmortizingPayment, labels),
      jump: compactMoney(result.graceJump, labels),
      month: formatDecimal(result.firstAmortizingMonth, 0),
    });
  }
  summary += ` ${labels.scenarioNote}`;

  return {
    kind: "bars",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    bars,
    max,
    axis: {
      label: fill(labels.axis, { unit: axisUnit(max, labels) }),
      ticks: linearTicks(max, 4, (value) => axisTickLabel(value, max)),
    },
    legend: [
      { key: "interest", label: labels.interestSegment },
      { key: "principal", label: labels.principalSegment },
    ],
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.phaseColumn, nowrap: true },
        { label: labels.rateColumn, numeric: true },
        { label: labels.paymentColumn, numeric: true },
      ],
      // A rate is a `percentCell`, so no display mode ever divides it by a
      // million.
      rows: result.phases.map((phase) => [
        range(phase.fromMonth, phase.toMonth),
        percentCell(phase.annualRatePercent, 2),
        moneyCell(phase.payment),
      ]),
    },
    unavailable: null,
  };
}

/**
 * The outstanding balance, month by month, with both dates marked.
 *
 * Sampled at phase boundaries plus a bounded set of intermediate points, so a
 * 1.200-month schedule draws a readable path rather than 1.200 vertices. The
 * flat opening stretch is not an artefact of sampling: the grace months really
 * do all carry the same balance, and the boundary points are always included.
 */
const MAX_BALANCE_POINTS = 61;

export function graceBalanceLineModel(
  result: GraceLoanResult | null,
  labels: GraceBalanceLabels,
): LineChartModel {
  if (result === null || result.schedule.length === 0) return emptyLine(labels);

  const term = result.months;
  // Period 0 is the balance before any payment — the original loan.
  const periods = new Set<number>([0, term]);
  for (const phase of result.phases) {
    periods.add(phase.fromMonth - 1);
    periods.add(phase.toMonth);
  }
  const stride = Math.max(1, Math.ceil(term / (MAX_BALANCE_POINTS - 1)));
  for (let month = stride; month < term; month += stride) periods.add(month);

  const balanceAt = (period: number) =>
    period === 0
      ? result.schedule[0].balance + result.schedule[0].principal
      : result.schedule[period - 1].balance;

  const points = [...periods]
    .filter((period) => period >= 0 && period <= term)
    .sort((a, b) => a - b)
    .map((period) => ({ period, value: balanceAt(period) }));

  const markers: { period: number; label: string }[] = [];
  if (result.graceEndMonth !== null) {
    markers.push({
      period: result.graceEndMonth,
      label: fill(labels.graceMarker, { n: result.graceEndMonth }),
    });
  }
  if (result.promoEndMonth !== null) {
    markers.push({
      period: result.promoEndMonth,
      label: fill(labels.resetMarker, { n: result.promoEndMonth }),
    });
  }

  const yMax = niceMax(Math.max(...points.map((point) => point.value)));
  const unit = axisUnit(yMax, labels);

  let summary: string;
  if (result.graceEndMonth === null || result.balanceAtGraceEnd === null) {
    summary = fill(labels.summaryNoGrace, {
      first: compactMoney(points[0].value, labels),
    });
  } else {
    summary = fill(labels.summary, {
      month: formatDecimal(result.graceEndMonth, 0),
      balance: compactMoney(result.balanceAtGraceEnd, labels),
    });
  }
  summary += ` ${labels.scenarioNote}`;

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series: [
      {
        key: "balance",
        label: labels.balanceSeries,
        stroke: "solid",
        points,
      },
    ],
    markers,
    references: [],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(term, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax: term,
    yMin: 0,
    yMax,
    // A balance falls continuously once principal is being repaid, so a
    // straight join between sampled months is the right shape here — unlike a
    // payment level, which holds and jumps.
    step: false,
    table: {
      caption: labels.tableCaption,
      // The phase boundaries, which is where the reader's questions are.
      columns: [
        { label: labels.monthColumn, numeric: true, nowrap: true },
        { label: labels.balanceColumn, numeric: true },
      ],
      rows: result.phases.map((phase) => [
        formatDecimal(phase.toMonth, 0),
        moneyCell(phase.balance),
      ]),
    },
    unavailable: null,
  };
}

/** Re-exported for a test that pins the sampling bound. */
export { MAX_BALANCE_POINTS as GRACE_BALANCE_MAX_POINTS };
