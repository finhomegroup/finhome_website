/**
 * The education fund against the need it has to meet, for
 * /cong-cu/tiet-kiem-hoc-phi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `education-fund-chart.test.ts`.
 *
 * Original row 25's visual: "hai đường quỹ học phí và nhu cầu dự kiến", under
 * a row framed as a goal PARALLEL to buying a home and a lesson that says
 * "không dùng cùng một khoản tiền cho hai mục tiêu". Every figure comes from
 * `computeEducationSavings`; this module chooses the labels, the markers and
 * the accessible table.
 *
 * WHY BOTH LINES. The fund line alone says what the plan projects; the need
 * line says what the plan has to have at that date. Their GAP is whether the
 * saver is on track, and on the audit's fixture the gap is real from day one:
 * 200 triệu held against 356,15 triệu needed. A single target figure reports
 * neither the gap nor the date it closes.
 *
 * THE ARRIVAL IS MARKED, AND IT IS WHERE THE FIRST TUITION IS PAID. The two
 * lines meet at the start of study and the fund then steps down each year as
 * a payment is taken. The marker says so, because a reader watching a line
 * turn over at year 10 should know the turn is a planned payment rather than
 * a market event.
 *
 * NOTHING HERE PREDICTS TUITION. The growth rate is the reader's assumption
 * and the summary says so.
 */

import { fill, fullMoney } from "@/lib/calc/charts/labels";
import type { LineChartModel } from "@/lib/calc/charts/types";
import {
  valuePathsModel,
  type ValuePathsLabels,
} from "@/lib/calc/charts/value-paths-chart";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import type { EducationSavingsResult } from "@/lib/calc/education-savings";

export type EducationFundChartLabels = ValuePathsLabels & {
  /** The projected balance. */
  fundPath: string;
  /** What the plan must hold at each date. */
  needPath: string;
  /** Marker at the start of study. `{year}` substituted. */
  startMarker: string;
  /**
   * `{startYear}`, `{target}`, `{firstTuition}`, `{afterFirst}`,
   * `{contribution}` substituted.
   */
  summary: string;
  /**
   * Used INSTEAD of `summary` when the plan cannot fund the course.
   *
   * `{startYear}`, `{target}`, `{held}`, `{gap}`, `{firstTuition}`,
   * `{firstPaid}`, `{unpaid}` substituted. The reason it is a separate
   * sentence rather than a suffix: the funded one says a contribution closes
   * the gap and names the first tuition as paid, and neither is true here.
   */
  summaryUnderfunded: string;
  /** Appended when no monthly contribution can be solved at all. */
  noContributionNote: string;
  /** Column for what the fund can actually hand over that year. */
  paidColumn: string;
  /** Appended when today's fund is already behind. `{fund}`, `{need}`. */
  behindNote: string;
  /** Appended when it is already ahead. */
  aheadNote: string;
  /** Always appended: the growth rate is an assumption. */
  assumptionNote: string;
  /** Appended when there is no time to save at all. */
  noTimeNote: string;
  /**
   * The assumptions bullet about the monthly contributions.
   *
   * Chosen rather than static: on a plan with no month to contribute in, "the
   * fund line assumes you pay in the amount above, every month" describes a
   * deposit that cannot happen — and the figure was printing it beside a
   * summary saying no monthly amount exists. Source review found it in BOTH
   * no-time cases.
   */
  contributionAssumption: string;
  /** Its replacement when the fund is only what is already held. */
  immediateFundAssumption: string;
  yearColumn: string;
  fundColumn: string;
  tuitionColumn: string;
  needColumn: string;
};

/**
 * Two paths and the yearly ledger.
 *
 * `unavailable` when there is no result, or when the plan is a single point —
 * study starting today with one year of study gives one row, and two points
 * are needed to draw a line. The page's own rows still report that case.
 */
export function educationFundChartModel(
  result: EducationSavingsResult | null,
  labels: EducationFundChartLabels,
): LineChartModel {
  if (result === null || result.series.length < 2) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const startYear = result.series.find((p) => p.tuitionDue > 0)?.yearsFromNow;
  const firstStudy = result.series.find((p) => p.tuitionDue > 0);
  const today = result.series[0];

  // One row per year: the balance, the tuition taken that year, and the need.
  // Typed money cells, so `ResultTable` states one unit for the block and
  // keeps the exact đồng behind its checkbox — and the YEAR column stays a
  // count, never divided into triệu (docs §3).
  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    mobileCards: true,
    columns: [
      { label: labels.yearColumn, numeric: true, nowrap: true },
      { label: labels.fundColumn, numeric: true },
      { label: labels.tuitionColumn, numeric: true },
      { label: labels.paidColumn, numeric: true },
      { label: labels.needColumn, numeric: true },
    ],
    rows: result.series.map((point) => [
      countCell(point.yearsFromNow),
      moneyCell(point.fund),
      point.tuitionDue > 0 ? moneyCell(point.tuitionDue) : "",
      // What the fund can actually hand over. Equal to the due column on a
      // funded plan, and the whole point on one that is short.
      point.tuitionDue > 0 ? moneyCell(point.tuitionPaid) : "",
      moneyCell(point.need),
    ]),
  };

  // TWO SUMMARIES, because the funded one makes two claims that are false on
  // a plan that cannot pay: that a monthly contribution closes the gap, and
  // that the first year's tuition is paid.
  const underfunded =
    result.fundingGapAtStart > 0 || result.totalTuitionUnpaid > 0;

  let summary = underfunded
    ? fill(labels.summaryUnderfunded, {
        startYear: String(startYear ?? 0),
        target: fullMoney(result.targetAtStart, labels),
        held: fullMoney(result.fundedAtStart, labels),
        gap: fullMoney(result.fundingGapAtStart, labels),
        firstTuition: fullMoney(firstStudy?.tuitionDue ?? 0, labels),
        firstPaid: fullMoney(firstStudy?.tuitionPaid ?? 0, labels),
        unpaid: fullMoney(result.totalTuitionUnpaid, labels),
      })
    : fill(labels.summary, {
        startYear: String(startYear ?? 0),
        target: fullMoney(result.targetAtStart, labels),
        firstTuition: fullMoney(firstStudy?.tuitionDue ?? 0, labels),
        afterFirst: fullMoney(firstStudy?.fundAfterTuition ?? 0, labels),
        contribution: fullMoney(result.monthlyContribution ?? 0, labels),
      });

  // On track or behind, at TODAY's date — the one comparison a reader can act
  // on, and the reason the need line exists at all.
  //
  // SKIPPED ON AN UNFUNDABLE PLAN. `behindNote` ends "khoảng cách đó là phần
  // các khoản góp phải bù", which promises monthly contributions will close
  // the gap — and the sentence immediately before it has just said no monthly
  // amount exists. Source review found both in the same summary.
  if (!underfunded) {
    summary +=
      today.fund < today.need
        ? ` ${fill(labels.behindNote, {
            fund: fullMoney(today.fund, labels),
            need: fullMoney(today.need, labels),
          })}`
        : ` ${labels.aheadNote}`;
  }

  if (result.noTimeToSave) summary += ` ${labels.noTimeNote}`;
  // Said once, where it is true: no monthly figure exists to quote.
  if (result.monthlyContribution === null) {
    summary += ` ${labels.noContributionNote}`;
  }
  summary += ` ${labels.assumptionNote}`;

  // The contributions bullet is CHOSEN, not static. A plan with no month to
  // contribute in draws a fund line that is simply the money already held,
  // and the figure was still listing "giả định bạn góp đủ mức ở trên, đều
  // đặn, mỗi tháng" among its assumptions. The other four are untouched, and
  // this one keeps its position.
  const contributes = result.monthlyContribution !== null && result.monthsToSave > 0;
  const figureAssumptions = [
    ...labels.assumptions.slice(0, 2),
    contributes ? labels.contributionAssumption : labels.immediateFundAssumption,
    ...labels.assumptions.slice(2),
  ];

  return valuePathsModel(
    [
      {
        key: "fund",
        label: labels.fundPath,
        points: result.series.map((p) => ({
          period: p.yearsFromNow,
          value: p.fund,
        })),
        area: true,
      },
      {
        key: "need",
        label: labels.needPath,
        points: result.series.map((p) => ({
          period: p.yearsFromNow,
          value: p.need,
        })),
      },
    ],
    labels,
    {
      summary,
      assumptions: figureAssumptions,
      markers:
        startYear === undefined
          ? []
          : [
              {
                period: startYear,
                label: fill(labels.startMarker, { year: String(startYear) }),
              },
            ],
      table,
    },
  );
}
