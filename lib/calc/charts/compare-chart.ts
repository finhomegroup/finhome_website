/**
 * The comparison charts for /cong-cu/so-sanh-khoan-vay/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `compare-chart.test.ts`.
 *
 * TWO pictures again, and for the same reason as the affordability page: the
 * question "which costs less" and the question "which can I pay each month"
 * have different answers, and one chart that tried to show both would be
 * answering neither.
 *
 * 1. `costBarsModel` — the cost of BORROWING under each option, split into
 *    interest and the arrangement fee, with the shared principal shown as its
 *    own segment so the bars cannot be read as "the cheap one lends less".
 * 2. `paymentTimelineModel` — the instalment each option asks for, over its
 *    own term. The bars in the first chart and the lines in this one routinely
 *    rank the options in OPPOSITE orders, which is the entire lesson.
 *
 * RANKING. `compareLoans` ranks on interest plus fee, never on the instalment
 * — a longer term always wins on monthly and usually loses on cost. That
 * ranking is carried through here as `emphasis` on one bar, and the summary
 * states what it is ranked on. Nothing in this module says an option is
 * "best", and nothing names a lender.
 *
 * FEES THIS MODEL DOES NOT SUPPORT ARE EXCLUDED IN WORDS. `compareLoans`
 * prices one upfront arrangement fee per option and a single fixed rate for
 * the whole term. Promotional periods, post-promotional rates, insurance and
 * early-settlement charges are not in it, so `exclusionNote` is appended to
 * every summary rather than left to a page to remember.
 */

import type { LoanComparison } from "@/lib/calc/loan-compare";
import { computeLoan } from "@/lib/calc/loan";
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
  type ChartSeries,
  type LineChartModel,
  type StackedBar,
} from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";

export type CompareCostLabels = MoneyWords & {
  title: string;
  principalSegment: string;
  interestSegment: string;
  feeSegment: string;
  /** Debt still owed at the horizon. A segment, never an omission. */
  balanceSegment: string;
  /** `{unit}` substituted. */
  axis: string;
  /** `{option}`, `{cost}`, `{spread}`, `{horizon}` substituted. */
  summary: string;
  /** Says what the ranking is on. Appended to the summary. */
  rankedOnNote: string;
  /** `{horizonOption}`, `{fullTermOption}`. Appended when the two disagree. */
  winnerChangesNote: string;
  /** Says which costs are not modelled. Appended to the summary. */
  exclusionNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  optionColumn: string;
  interestColumn: string;
  feeColumn: string;
  balanceColumn: string;
  costColumn: string;
  fullTermCostColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

export type ComparePaymentLabels = MoneyWords & {
  title: string;
  xAxis: string;
  /** `{unit}` substituted. */
  yAxis: string;
  /** `{lowest}`, `{lowestOption}`, `{cheapestOption}` substituted. */
  summary: string;
  /** Appended: a lower instalment is not a cheaper loan. */
  monthlyIsNotCostNote: string;
  /** `{count}`. Appended when any offer's instalment steps at a reset. */
  resetNote: string;
  /** `{n}`. Labels the selected-horizon rule on the plot. */
  horizonMarker: string;
  exclusionNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  optionColumn: string;
  paymentColumn: string;
  resetPaymentColumn: string;
  monthsColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/** Stroke patterns per option position, so colour is never the only channel. */
const STROKES: ChartSeries["stroke"][] = ["solid", "dashed", "dotted"];

function emptyBars(labels: CompareCostLabels): BarChartModel {
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
      // Six columns, so `mobileCards` per docs §3, which sets that from five
      // up. Set on the EMPTY model too, so the layout does not change shape
      // depending on whether there is data — see the populated model below for
      // why a card per offer keeps the comparison intact here.
      mobileCards: true,
      columns: [
        { label: labels.optionColumn, nowrap: true },
        { label: labels.interestColumn, numeric: true },
        { label: labels.feeColumn, numeric: true },
        { label: labels.balanceColumn, numeric: true },
        { label: labels.costColumn, numeric: true },
        { label: labels.fullTermCostColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

function emptyLines(labels: ComparePaymentLabels): LineChartModel {
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
        // NO `nowrap` ON THE OPTION COLUMN, and that is the fix rather than an
        // omission. See the populated model below for the measurement.
        { label: labels.optionColumn },
        { label: labels.paymentColumn, numeric: true },
        { label: labels.resetPaymentColumn, numeric: true },
        { label: labels.monthsColumn, numeric: true },
      ],
      rows: [],
    },
    unavailable: {
      reason: labels.unavailableReason,
      recovery: labels.unavailableRecovery,
    },
  };
}

/** What borrowing costs under each option. */
export function costBarsModel(
  comparison: LoanComparison | null,
  optionLabels: readonly string[],
  labels: CompareCostLabels,
): BarChartModel {
  if (comparison === null) return emptyBars(labels);

  const bars: StackedBar[] = [];
  comparison.rows.forEach((row, index) => {
    if (row === null) return;
    // MEASURED AT THE SELECTED HORIZON, not over each option's own term. The
    // four segments sum to `amount + horizonCost`, so an offer that merely
    // defers principal shows the deferred debt rather than looking cheap: the
    // balance still owed is a segment, not an omission. Full-term sums are a
    // separate measure and live in the table below.
    const segments: BarSegment[] = [
      {
        key: "principal",
        label: labels.principalSegment,
        value: row.horizonPrincipal,
        valueLabel: fullMoney(row.horizonPrincipal, labels),
      },
      {
        key: "interest",
        label: labels.interestSegment,
        value: row.horizonInterest,
        valueLabel: fullMoney(row.horizonInterest, labels),
      },
    ];
    if (row.upfrontFee > 0) {
      segments.push({
        key: "fee",
        label: labels.feeSegment,
        value: row.upfrontFee,
        valueLabel: fullMoney(row.upfrontFee, labels),
      });
    }
    if (row.horizonBalance > 0) {
      segments.push({
        key: "balance",
        label: labels.balanceSegment,
        value: row.horizonBalance,
        valueLabel: fullMoney(row.horizonBalance, labels),
      });
    }
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    bars.push({
      key: `option-${index}`,
      label: optionLabels[index] ?? `#${index + 1}`,
      total,
      totalLabel: fullMoney(total, labels),
      segments,
      emphasis: index === comparison.bestIndex,
    });
  });

  if (bars.length === 0) return emptyBars(labels);

  const best = comparison.rows[comparison.bestIndex];
  const max = niceMax(Math.max(...bars.map((bar) => bar.total)));

  let summary = fill(labels.summary, {
    option: optionLabels[comparison.bestIndex] ?? "",
    cost: compactMoney(best ? best.horizonCost : 0, labels),
    spread: compactMoney(comparison.spread, labels),
    horizon: formatDecimal(comparison.horizonMonths, 0),
  });
  summary += ` ${labels.rankedOnNote}`;
  // When the horizon winner and the full-term winner differ, the chart says
  // so on itself rather than leaving a reader to assume one ranking answers
  // both questions.
  if (comparison.horizonChangesWinner) {
    summary += ` ${fill(labels.winnerChangesNote, {
      horizonOption: optionLabels[comparison.bestIndex] ?? "",
      fullTermOption: optionLabels[comparison.bestFullTermIndex] ?? "",
    })}`;
  }
  summary += ` ${labels.exclusionNote}`;

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
      { key: "principal", label: labels.principalSegment },
      { key: "interest", label: labels.interestSegment },
      { key: "fee", label: labels.feeSegment },
      { key: "balance", label: labels.balanceSegment },
    ],
    table: {
      caption: labels.tableCaption,
      /*
       * SIX COLUMNS, so `mobileCards` per docs §3 — and this is the P1 entry
       * that sat in `WIDE_TABLE_PENDING` longest, because the list recorded a
       * design objection to exactly this fix: "it is a COMPARISON, so the
       * value is the row read across and a per-row card block breaks that up".
       *
       * Measured, that objection does not hold for THIS table. Its rows are
       * OFFERS and its columns are metrics, so a card per row is a card per
       * offer — "Phương án A: lãi …, phí …, dư nợ …, chi phí …" — which is a
       * coherent per-offer cost summary, not a broken comparison. What a
       * reader comparing offers needs is the metric read across several
       * offers, and THAT VIEW ALREADY EXISTS on the same page: the
       * "So sánh từng chỉ tiêu" table is metrics-as-rows with one column per
       * offer, and at 390 px it measures 281 px, comfortably inside the
       * viewport. Nothing is lost by carding this one.
       *
       * The numbers that made it necessary, at a verified 390 px viewport on
       * 2026-09-16: 394 px inside a 300 px frame, a ratio of 1,31, with two of
       * the five cost columns off-frame — including "Chi phí cả kỳ hạn", which
       * the page's own winner-changes note discusses as though it were visible.
       */
      mobileCards: true,
      columns: [
        { label: labels.optionColumn, nowrap: true },
        { label: labels.interestColumn, numeric: true },
        { label: labels.feeColumn, numeric: true },
        { label: labels.balanceColumn, numeric: true },
        { label: labels.costColumn, numeric: true },
        { label: labels.fullTermCostColumn, numeric: true },
      ],
      // Horizon measures and the full-term sum side by side, each under its
      // own heading, because they answer different questions.
      rows: comparison.rows.flatMap((row, index) =>
        row === null
          ? []
          : [
              [
                optionLabels[index] ?? `#${index + 1}`,
                moneyCell(row.horizonInterest),
                moneyCell(row.upfrontFee),
                moneyCell(row.horizonBalance),
                moneyCell(row.horizonCost),
                moneyCell(row.costOfBorrowing),
              ],
            ],
      ),
    },
    unavailable: null,
  };
}

/**
 * The instalment each option asks for, over its own term.
 *
 * `step: true`, because an instalment holds a level and then JUMPS at a
 * promotional reset — joining the two levels with a diagonal would draw a
 * gradual rise that does not happen. An offer with no promotional stretch is
 * two points, one level; an offer with one is four, and the step is visible.
 *
 * Where terms differ the lines end at different months, which is the visible
 * form of "these are not the same commitment". The SELECTED HORIZON is a
 * marker on the same plot, so the cost bars and this timeline are reading one
 * scenario rather than two.
 */
export function paymentTimelineModel(
  comparison: LoanComparison | null,
  optionLabels: readonly string[],
  labels: ComparePaymentLabels,
): LineChartModel {
  if (comparison === null) return emptyLines(labels);

  const series: ChartSeries[] = [];
  comparison.rows.forEach((row, index) => {
    if (row === null) return;
    const points =
      row.resetMonth === null
        ? [
            { period: 1, value: row.monthlyPayment },
            { period: row.months, value: row.monthlyPayment },
          ]
        : [
            { period: 1, value: row.monthlyPayment },
            { period: row.resetMonth - 1, value: row.monthlyPayment },
            { period: row.resetMonth, value: row.resetPayment },
            { period: row.months, value: row.resetPayment },
          ];
    series.push({
      key: `option-${index}`,
      label: optionLabels[index] ?? `#${index + 1}`,
      stroke: STROKES[index % STROKES.length],
      points,
    });
  });

  if (series.length === 0) return emptyLines(labels);

  const priced = comparison.rows.filter(
    (row): row is NonNullable<typeof row> => row !== null,
  );
  // Bounded above the HIGHEST instalment any option reaches, not the first
  // one: a promotional offer whose reset payment ran off the top of the plot
  // would draw the rise as a truncation.
  const yMax = niceMax(
    Math.max(...priced.map((row) => Math.max(row.monthlyPayment, row.resetPayment))),
  );
  const xMax = Math.max(...priced.map((row) => row.months));

  // The option with the smallest FIRST instalment, which is very often NOT
  // the cheapest one — the comparison the note under the summary exists to
  // make, and a promotional rate is exactly how that gap is manufactured.
  let lowest = priced[0];
  for (const row of priced) {
    if (row.monthlyPayment < lowest.monthlyPayment) lowest = row;
  }

  let summary = fill(labels.summary, {
    lowest: compactMoney(lowest.monthlyPayment, labels),
    lowestOption: optionLabels[lowest.index] ?? "",
    cheapestOption: optionLabels[comparison.bestIndex] ?? "",
  });
  summary += ` ${labels.monthlyIsNotCostNote}`;
  const resets = priced.filter((row) => row.resetMonth !== null);
  if (resets.length > 0) {
    summary += ` ${fill(labels.resetNote, {
      count: formatDecimal(resets.length, 0),
    })}`;
  }
  summary += ` ${labels.exclusionNote}`;

  const markers =
    comparison.horizonMonths > 0 && comparison.horizonMonths <= xMax
      ? [
          {
            period: comparison.horizonMonths,
            label: fill(labels.horizonMarker, {
              n: formatDecimal(comparison.horizonMonths, 0),
            }),
          },
        ]
      : [];

  return {
    kind: "lines",
    title: labels.title,
    summary,
    assumptions: labels.assumptions,
    series,
    markers,
    references: [],
    xAxis: {
      label: labels.xAxis,
      ticks: linearTicks(xMax, 4, (value) => formatDecimal(value, 0)),
    },
    yAxis: {
      label: fill(labels.yAxis, { unit: axisUnit(yMax, labels) }),
      ticks: linearTicks(yMax, 4, (value) => axisTickLabel(value, yMax)),
    },
    xMax,
    yMin: 0,
    yMax,
    step: true,
    table: {
      caption: labels.tableCaption,
      columns: [
        /*
         * `nowrap` REMOVED from the option column, because on one of the two
         * routes that share this builder the option label is not a short tag.
         *
         * `nowrap: true` declares "a short period or option label" — it keeps
         * "Phương án A" on one line and switches the 8,5rem prose floor off.
         * On `/cong-cu/lai-co-dinh-hay-tha-noi/` the labels are COMPOSED,
         * `${side} — ${structure}`, giving strings like "Bên B — giữ một mức
         * lãi 12 tháng rồi đổi" at 40 characters. Held on one line that is a
         * 264 px column, and the four-column table measured 427 px inside its
         * 300 px frame at a verified 390 px viewport on 2026-09-16 — a table
         * docs §3 expects to fit, overflowing for a reason the column rule
         * cannot see.
         *
         * Letting it wrap puts the table at exactly 300 px on BOTH routes.
         * `/cong-cu/so-sanh-khoan-vay/`, whose labels really are short, is
         * unaffected: wrapping never triggers for "Phương án A", and although
         * dropping `nowrap` switches the prose floor on, the table is `w-full`
         * in a 300 px frame and its min-content still fits, so it stays at
         * 300 px. Measured both ways rather than reasoned.
         *
         * Carding this table was the alternative and was rejected: it already
         * fits on the other route, and `ResultTable`'s own docstring says to
         * leave `mobileCards` off where the compact table fits, because a
         * block list is more scrolling for no gain.
         */
        { label: labels.optionColumn },
        { label: labels.paymentColumn, numeric: true },
        { label: labels.resetPaymentColumn, numeric: true },
        { label: labels.monthsColumn, numeric: true },
      ],
      rows: comparison.rows.flatMap((row, index) =>
        row === null
          ? []
          : [
              [
                optionLabels[index] ?? `#${index + 1}`,
                moneyCell(row.monthlyPayment),
                moneyCell(row.resetPayment),
                // A term, not an amount: `countCell` is what keeps 240 months
                // out of the money unit the rest of this table is scaled to.
                countCell(row.months),
              ],
            ],
      ),
    },
    unavailable: null,
  };
}

/**
 * The instalment an option would ask for, recomputed from its own terms.
 *
 * Exported for the test that proves the timeline's levels are the same figures
 * `computeLoan` produces, rather than something this module derived on its
 * own. Not used by the page.
 */
export function referenceInstalment(
  amount: number,
  annualRatePercent: number,
  termMonths: number,
): number | null {
  const loan = computeLoan({ amount, annualRatePercent, termMonths });
  return loan === null ? null : loan.monthlyPrincipalInterest;
}
