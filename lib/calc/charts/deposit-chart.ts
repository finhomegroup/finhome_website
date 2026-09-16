/**
 * The two figures for /cong-cu/tien-gui-co-ky-han/'s date view.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `deposit-chart.test.ts`.
 *
 * ORIGINAL ROW 20 asks for both halves of its visual, and they answer
 * different questions:
 *
 * 1. `depositTimelineModel` — the TIMELINE: where the date the money is
 *    needed sits between the deposit date and the relevant maturity. That is
 *    the question a buyer has, and no amount of interest arithmetic answers
 *    it.
 * 2. `depositChartModel` — the INTEREST BARS: what is received by that date,
 *    the same days at the term rate, and holding to maturity. Three bars, so
 *    the gap between taking the money early and waiting splits into its two
 *    real causes:
 *
 *      matured cycles + early-rate days                     (bar 1)
 *      matured cycles + term-rate days                      (bar 2)
 *      matured cycles + term-rate days + days not yet run   (bar 3)
 *
 *    The whole gap is never one block: labelling it a penalty would charge
 *    the saver for time that has not happened.
 *
 * THREE HORIZONS, NEVER MIXED. After a renewal the first term, the current
 * term and the whole plan are three different spans — 181 days, 184 days and
 * 365 days on the module's own fixture. Every label here says which one its
 * figure belongs to; an independent check caught the first draft reporting the
 * first term's days beside the whole plan's interest.
 *
 * Every figure comes from `planDeposit`. Nothing financial is computed here.
 */

import type { DepositPlan } from "@/lib/calc/deposit-plan";
import { toDayNumber, type CalendarDate } from "@/lib/calc/dates";
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
  type StackedBar,
} from "@/lib/calc/charts/types";
import { countCell, moneyCell, type TableCell } from "@/lib/calc/table-cell";
import { formatDecimal } from "@/lib/calc/number";

export type DepositChartLabels = MoneyWords & {
  title: string;
  /** The three bars. */
  barAtExit: string;
  barSameHorizon: string;
  barHeldToMaturity: string;
  /** The stack's parts. */
  segmentMatured: string;
  segmentEarly: string;
  segmentTermRate: string;
  segmentFuture: string;
  axis: string;
  /**
   * `{need}`, `{maturity}` (the CURRENT term's), `{days}` (days run inside
   * that term), `{totalDays}` (days since the deposit) and `{interest}` (total
   * through the exit) substituted.
   */
  summaryBefore: string;
  /**
   * `{maturity}`, `{days}` (the CURRENT term's length), `{totalDays}`,
   * `{terms}` and `{interest}` substituted.
   */
  summaryAt: string;
  /** `{maturity}`, `{need}`, `{interest}` substituted. */
  summaryAfter: string;
  /** Appended when a term has to be broken. */
  earlyNote: string;
  /** Appended when no term has to be broken. */
  noBreakNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  itemColumn: string;
  valueColumn: string;
  rowDepositDate: string;
  rowFirstMaturity: string;
  rowCurrentStart: string;
  rowCurrentMaturity: string;
  rowNeedDate: string;
  rowTerms: string;
  rowTotalDays: string;
  rowCurrentTermDays: string;
  rowDaysIntoTerm: string;
  rowDaysToMaturity: string;
  rowMaturedInterest: string;
  rowInterestAtExit: string;
  rowSameHorizon: string;
  rowRateDifference: string;
  rowFuture: string;
  rowAvailable: string;
  rowNewPayment: string;
  rowAlreadyPaid: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** A date as the page writes it: 31/7/2026. */
function showDate(date: CalendarDate): string {
  return `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;
}

function unavailable(labels: DepositChartLabels): BarChartModel {
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
        { label: labels.itemColumn },
        { label: labels.valueColumn, numeric: true },
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
 * Build the deposit's interest comparison.
 *
 * `plan` may be null — an invalid form clears the figure. A `beyondLimit`
 * plan draws nothing either: its horizon was never reached, so it has no exit
 * figures to compare and none are invented.
 */
export function depositChartModel(
  plan: DepositPlan | null,
  labels: DepositChartLabels,
): BarChartModel {
  if (
    plan === null ||
    plan.status === "beyondLimit" ||
    plan.interestAtExit === null ||
    plan.maturedInterest === null
  ) {
    return unavailable(labels);
  }

  const matured = plan.maturedInterest;
  const money = (value: number) => fullMoney(value, labels);
  const segment = (key: string, label: string, value: number): BarSegment => ({
    key,
    label,
    value,
    valueLabel: money(value),
  });

  const bars: StackedBar[] = [];

  /** Bar 1 — what is actually received by the needed date. */
  const exitSegments: BarSegment[] = [];
  if (matured > 0) {
    exitSegments.push(segment("matured", labels.segmentMatured, matured));
  }
  if (plan.brokenInterest !== null) {
    exitSegments.push(segment("early", labels.segmentEarly, plan.brokenInterest));
  }
  bars.push({
    key: "atExit",
    label: labels.barAtExit,
    total: plan.interestAtExit,
    totalLabel: money(plan.interestAtExit),
    segments: exitSegments,
    // The figure the reader came for.
    emphasis: true,
  });

  // Bars 2 and 3 exist only when a term is actually being broken: with
  // nothing broken there is no rate difference and no unrun time, and drawing
  // two identical bars would imply a comparison that does not exist.
  if (
    plan.status === "beforeMaturity" &&
    plan.termRateSameHorizon !== null &&
    plan.interestIfHeldToMaturity !== null &&
    plan.foregoneFutureInterest !== null
  ) {
    const termRateDays = plan.termRateSameHorizon - matured;
    const sameHorizonSegments: BarSegment[] = [];
    if (matured > 0) {
      sameHorizonSegments.push(
        segment("matured", labels.segmentMatured, matured),
      );
    }
    sameHorizonSegments.push(
      segment("termRate", labels.segmentTermRate, termRateDays),
    );
    bars.push({
      key: "sameHorizon",
      label: labels.barSameHorizon,
      total: plan.termRateSameHorizon,
      totalLabel: money(plan.termRateSameHorizon),
      segments: sameHorizonSegments,
    });
    bars.push({
      key: "heldToMaturity",
      label: labels.barHeldToMaturity,
      total: plan.interestIfHeldToMaturity,
      totalLabel: money(plan.interestIfHeldToMaturity),
      segments: [
        ...sameHorizonSegments,
        segment("future", labels.segmentFuture, plan.foregoneFutureInterest),
      ],
    });
  }

  const max = niceMax(Math.max(...bars.map((bar) => bar.total), 1));
  const unit = axisUnit(max, labels);

  let summary: string;
  if (plan.status === "beforeMaturity") {
    summary = fill(labels.summaryBefore, {
      need: showDate(plan.needDate),
      // The CURRENT term's maturity, which after a renewal is not the first.
      maturity: showDate(plan.pendingMaturity ?? plan.currentMaturity),
      days: formatDecimal(plan.daysIntoBrokenTerm ?? 0, 0),
      totalDays: formatDecimal(plan.daysFromStart, 0),
      interest: compactMoney(plan.interestAtExit, labels),
    });
  } else if (plan.status === "atMaturity") {
    summary = fill(labels.summaryAt, {
      maturity: showDate(plan.currentMaturity),
      days: formatDecimal(plan.currentTermDays, 0),
      totalDays: formatDecimal(plan.daysFromStart, 0),
      terms: formatDecimal(plan.termsElapsed, 0),
      interest: compactMoney(plan.interestAtExit, labels),
    });
  } else {
    summary = fill(labels.summaryAfter, {
      maturity: showDate(plan.currentMaturity),
      need: showDate(plan.needDate),
      interest: compactMoney(plan.interestAtExit, labels),
    });
  }
  summary += plan.requiresEarlyWithdrawal
    ? ` ${labels.earlyNote}`
    : ` ${labels.noBreakNote}`;

  /**
   * The accessible reading: the dates and the day counts, then the money.
   *
   * A date is a plain string — `table-cell.ts` has no date kind and would not
   * scale one anyway — while a day count is a `countCell` and every amount is
   * a `moneyCell`, so the table can offer one compact unit with the exact
   * đồng behind it without touching the days.
   *
   * The first term and the current term are separate rows whenever they
   * differ, because after a renewal they are different dates and different
   * lengths.
   */
  const renewed = plan.termsElapsed > 1;
  const table: { label: string; cell: TableCell }[] = [
    { label: labels.rowDepositDate, cell: showDate(plan.cycles[0].start) },
    { label: labels.rowFirstMaturity, cell: showDate(plan.firstMaturity) },
    ...(renewed
      ? [
          {
            label: labels.rowCurrentStart,
            cell: showDate(plan.currentTermStart),
          },
          {
            label: labels.rowCurrentMaturity,
            cell: showDate(plan.currentMaturity),
          },
          { label: labels.rowTerms, cell: countCell(plan.termsElapsed) },
        ]
      : []),
    { label: labels.rowNeedDate, cell: showDate(plan.needDate) },
    { label: labels.rowTotalDays, cell: countCell(plan.daysFromStart) },
    { label: labels.rowCurrentTermDays, cell: countCell(plan.currentTermDays) },
    {
      label: labels.rowDaysIntoTerm,
      cell:
        plan.daysIntoBrokenTerm === null
          ? null
          : countCell(plan.daysIntoBrokenTerm),
    },
    {
      label: labels.rowDaysToMaturity,
      cell:
        plan.daysToPendingMaturity === null
          ? null
          : countCell(plan.daysToPendingMaturity),
    },
    { label: labels.rowMaturedInterest, cell: moneyCell(matured) },
    { label: labels.rowInterestAtExit, cell: moneyCell(plan.interestAtExit) },
    {
      label: labels.rowSameHorizon,
      cell:
        plan.termRateSameHorizon === null
          ? null
          : moneyCell(plan.termRateSameHorizon),
    },
    {
      label: labels.rowRateDifference,
      cell: plan.rateDifference === null ? null : moneyCell(plan.rateDifference),
    },
    {
      label: labels.rowFuture,
      cell:
        plan.foregoneFutureInterest === null
          ? null
          : moneyCell(plan.foregoneFutureInterest),
    },
    {
      label: labels.rowAvailable,
      cell:
        plan.availableAtNeedDate === null
          ? null
          : moneyCell(plan.availableAtNeedDate),
    },
    {
      label: labels.rowNewPayment,
      cell:
        plan.newPaymentAtNeedDate === null
          ? null
          : moneyCell(plan.newPaymentAtNeedDate),
    },
    {
      label: labels.rowAlreadyPaid,
      cell:
        plan.interestAlreadyPaid === null
          ? null
          : moneyCell(plan.interestAlreadyPaid),
    },
  ];

  return {
    kind: "bars",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    bars,
    max,
    axis: {
      label: fill(labels.axis, { unit }),
      ticks: linearTicks(max, 4, (value) => axisTickLabel(value, max)),
    },
    legend: [
      { key: "matured", label: labels.segmentMatured },
      { key: "early", label: labels.segmentEarly },
      { key: "termRate", label: labels.segmentTermRate },
      { key: "future", label: labels.segmentFuture },
    ].filter((entry) =>
      bars.some((bar) => bar.segments.some((s) => s.key === entry.key)),
    ),
    table: {
      caption: labels.tableCaption,
      columns: [
        { label: labels.itemColumn },
        { label: labels.valueColumn, numeric: true },
      ],
      rows: table.map((row) => [row.label, row.cell]),
    },
    unavailable: null,
  };
}

// ---------------------------------------------------------------- timeline

export type DepositTimelineLabels = {
  title: string;
  deposit: string;
  firstMaturity: string;
  currentStart: string;
  currentMaturity: string;
  needDate: string;
  /** `{days}` substituted: "ngày thứ {days} kể từ ngày gửi". */
  dayOffset: string;
  /** `{need}`, `{maturity}`, `{days}` substituted. */
  summaryBefore: string;
  /** `{maturity}` substituted. */
  summaryAt: string;
  /** `{maturity}`, `{need}`, `{days}` substituted. */
  summaryAfter: string;
  /** Stated on the figure: this is a drawing, not a reminder. */
  note: string;
  unavailableReason: string;
};

export type DepositTimelineMilestone = {
  key: "deposit" | "firstMaturity" | "currentStart" | "currentMaturity" | "need";
  label: string;
  date: CalendarDate;
  /** Actual days after the deposit date. */
  dayFromStart: number;
  /** `dayFromStart` as the page says it: "sau 89 ngày". */
  dayOffsetLabel: string;
  /** Position across the drawn span, 0 at the deposit date and 1 at the end. */
  at: number;
  /** The date the reader is asking about. */
  emphasis?: boolean;
};

export type DepositTimelineModel = {
  title: string;
  summary: string;
  /** Days from the deposit date to the last milestone. */
  spanDays: number;
  milestones: DepositTimelineMilestone[];
  note: string;
  /** Set when there is nothing to draw. */
  unavailable: string | null;
};

/**
 * Where the needed date sits between the deposit and the relevant maturity.
 *
 * ORIGINAL ROW 20's "timeline đáo hạn". Positions are FRACTIONS of the drawn
 * span so the component needs no scale of its own, and every milestone also
 * carries its date and its day offset — the list under the drawing is the
 * text equivalent, not a caption.
 *
 * A duplicate date is collapsed rather than drawn twice: on a maturity date
 * the needed date and the maturity are the same point, and two markers there
 * would read as two events.
 */
export function depositTimelineModel(
  plan: DepositPlan | null,
  labels: DepositTimelineLabels,
): DepositTimelineModel {
  const empty: DepositTimelineModel = {
    title: labels.title,
    summary: labels.unavailableReason,
    spanDays: 0,
    milestones: [],
    note: labels.note,
    unavailable: labels.unavailableReason,
  };
  if (plan === null || plan.status === "beyondLimit") return empty;

  const deposit = plan.cycles[0].start;
  /**
   * Day offsets are measured from the DATES, not reconstructed from the
   * plan's day counts.
   *
   * The first draft derived the current term's start by subtracting the days
   * run inside it from the days elapsed, which is right while a term is
   * running and wrong once the deposit has matured — it put the maturity 181
   * days AFTER the needed date and reported a negative wait.
   */
  const offset = (date: CalendarDate): number => {
    const from = toDayNumber(deposit);
    const to = toDayNumber(date);
    return from === null || to === null ? 0 : to - from;
  };
  const firstMaturityDay = offset(plan.firstMaturity);
  const currentStartDay = offset(plan.currentTermStart);
  const currentMaturityDay = offset(plan.currentMaturity);

  const milestone = (
    key: DepositTimelineMilestone["key"],
    label: string,
    date: CalendarDate,
    dayFromStart: number,
    emphasis = false,
  ): DepositTimelineMilestone => ({
    key,
    label,
    date,
    dayFromStart,
    dayOffsetLabel: fill(labels.dayOffset, {
      days: formatDecimal(dayFromStart, 0),
    }),
    at: 0,
    emphasis,
  });

  const raw: DepositTimelineMilestone[] = [
    milestone("deposit", labels.deposit, deposit, 0),
    milestone(
      "firstMaturity",
      labels.firstMaturity,
      plan.firstMaturity,
      firstMaturityDay,
    ),
  ];
  if (plan.termsElapsed > 1) {
    raw.push(
      milestone(
        "currentStart",
        labels.currentStart,
        plan.currentTermStart,
        currentStartDay,
      ),
    );
    raw.push(
      milestone(
        "currentMaturity",
        labels.currentMaturity,
        plan.currentMaturity,
        currentMaturityDay,
      ),
    );
  }
  raw.push(
    milestone("need", labels.needDate, plan.needDate, plan.daysFromStart, true),
  );

  // One marker per distinct day. The needed date wins a tie, because it is
  // what the reader is asking about — and its label says it is a maturity
  // date through the status sentence below.
  const byDay = new Map<number, DepositTimelineMilestone>();
  for (const point of raw) {
    const existing = byDay.get(point.dayFromStart);
    if (existing === undefined || point.emphasis) {
      byDay.set(point.dayFromStart, point);
    }
  }
  const milestones = [...byDay.values()].sort(
    (a, b) => a.dayFromStart - b.dayFromStart,
  );
  const spanDays = Math.max(...milestones.map((point) => point.dayFromStart));
  for (const point of milestones) {
    point.at = spanDays > 0 ? point.dayFromStart / spanDays : 0;
  }

  let summary: string;
  if (plan.status === "beforeMaturity") {
    summary = fill(labels.summaryBefore, {
      need: showDate(plan.needDate),
      maturity: showDate(plan.pendingMaturity ?? plan.currentMaturity),
      days: formatDecimal(plan.daysToPendingMaturity ?? 0, 0),
    });
  } else if (plan.status === "atMaturity") {
    summary = fill(labels.summaryAt, {
      maturity: showDate(plan.currentMaturity),
    });
  } else {
    summary = fill(labels.summaryAfter, {
      maturity: showDate(plan.currentMaturity),
      need: showDate(plan.needDate),
      days: formatDecimal(plan.daysFromStart - currentMaturityDay, 0),
    });
  }

  return {
    title: labels.title,
    summary,
    spanDays,
    milestones,
    note: labels.note,
    unavailable: null,
  };
}
