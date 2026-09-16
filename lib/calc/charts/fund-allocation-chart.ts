/**
 * The purpose-allocation bar for /cong-cu/phan-bo-tai-san/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `fund-allocation-chart.test.ts`.
 *
 * Original row 56's visual is "thanh phân bổ theo mục tiêu và thời gian cần
 * dùng". So: ONE bar, the whole pot, split into the reserve, each named
 * purpose, and whatever is left unallocated. One bar because there is one pot
 * — drawing a second would imply money the reader does not have.
 *
 * EVERY SEGMENT LABEL CARRIES ITS NEED TIME, because "650 triệu cho nhà" and
 * "650 triệu cho nhà, cần trong 12 tháng" are different facts and only the
 * second one is about liquidity. A purpose with no stated month says so in its
 * label rather than being drawn as though it had no deadline.
 *
 * THE SHORTFALL IS NOT A SEGMENT. It is money that does not exist, and a
 * stacked bar drawing it would make the pot look bigger than it is — the
 * precise misreading the row warns about ("do not pretend requested 1.05bn is
 * funded"). It goes in the summary and as its own table rows, where a figure
 * can be negative without being drawn.
 *
 * NOTHING HERE NAMES A PRODUCT. No instrument, no suggested mix, no return
 * assumption: the figures are allocations of money the reader already has.
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
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import type { FundAllocationResult } from "@/lib/calc/fund-allocation";

export type FundAllocationLabels = BarFrameLabels & {
  /** The single bar: the whole pot. */
  potBar: string;
  reserveSegment: string;
  unallocatedSegment: string;
  /** `{name}`, `{months}` substituted. */
  purposeWithTime: string;
  /** `{name}` substituted, for a purpose with no stated month. */
  purposeWithoutTime: string;
  /** `{allocated}`, `{unallocated}` substituted. */
  summaryFunded: string;
  /** `{allocated}`, `{requested}`, `{shortfall}` substituted. */
  summaryShort: string;
  /** Appended when some purpose has no month. */
  timeUnknownNote: string;
  /** Appended when the declared allocation order is not soonest-first. */
  orderNote: string;
  /**
   * Appended when the caller declared a start date. `{date}` substituted.
   *
   * The month counts in the segment labels mean nothing without it — "cần sau
   * 12 tháng" counted from an unstated day is not a date a reader can check.
   */
  anchorNote: string;
  /** Always appended. */
  noProductNote: string;
  monthsColumn: string;
  requestedColumn: string;
  allocatedColumn: string;
  shortfallColumn: string;
  reserveRow: string;
  unallocatedRow: string;
  totalRow: string;
  noMonths: string;
  /** How to read a table whose "requested" column is not money that exists. */
  tableHint: string;
};

/** The name the page gave each purpose, keyed as the purposes are. */
export type PurposeNames = Record<string, string>;

/**
 * The anchor as the PAGE formats it, or null when none was declared.
 *
 * A formatted string rather than a `CalendarDate`, because date formatting in
 * this suite is hand-rolled per page (docs §4 — never `Intl`) and `lib/`
 * carries no user-facing Vietnamese.
 */
export type AnchorLabel = string | null;

/** One bar: the pot, split by purpose, with the need times in the labels. */
export function fundAllocationModel(
  result: FundAllocationResult | null,
  names: PurposeNames,
  labels: FundAllocationLabels,
  /** The declared anchor, already formatted by the page. Optional. */
  anchor: AnchorLabel = null,
): BarChartModel {
  if (result === null) return emptyBars(labels);
  if (!(result.available > 0)) return emptyBars(labels);

  const nameFor = (key: string) => names[key] ?? key;
  const labelFor = (purpose: FundAllocationResult["purposes"][number]) =>
    purpose.timeUnknown
      ? fill(labels.purposeWithoutTime, { name: nameFor(purpose.key) })
      : fill(labels.purposeWithTime, {
          name: nameFor(purpose.key),
          months: purpose.monthsUntilNeeded as number,
        });

  const bar = barOf(
    "pot",
    labels.potBar,
    [
      segment("reserve", labels.reserveSegment, result.reserveAllocated, labels),
      ...result.purposes.map((purpose) =>
        segment(purpose.key, labelFor(purpose), purpose.allocated, labels),
      ),
      segment(
        "unallocated",
        labels.unallocatedSegment,
        result.unallocated,
        labels,
      ),
    ],
    labels,
    true,
  );

  // EXACT figures, not `compactMoney`. At one decimal place in tỷ the
  // shortfall sentence read "1,0 tỷ trong 1,1 tỷ … thiếu 50,0 triệu", whose
  // three numbers do not agree with each other: the rounded gap is 100 triệu
  // and the real one is 50. A sentence whose whole content is a difference
  // cannot round its own terms. (The same trap `net-proceeds-chart` hit.)
  let summary = result.fullyFunded
    ? fill(labels.summaryFunded, {
        allocated: fullMoney(result.totalAllocated, labels),
        unallocated: fullMoney(result.unallocated, labels),
      })
    : fill(labels.summaryShort, {
        allocated: fullMoney(result.totalAllocated, labels),
        requested: fullMoney(result.totalRequested, labels),
        shortfall: fullMoney(result.shortfall, labels),
      });

  // The anchor comes BEFORE the two notes about time and order, because both
  // of those are about months this sentence gives a meaning to.
  if (anchor !== null) {
    summary += ` ${fill(labels.anchorNote, { date: anchor })}`;
  }
  if (result.anyTimeUnknown) summary += ` ${labels.timeUnknownNote}`;
  if (!result.orderMatchesTimeline) summary += ` ${labels.orderNote}`;
  summary += ` ${labels.noProductNote}`;

  const model = finishBars(
    [bar],
    [
      { key: "reserve", label: labels.reserveSegment },
      ...result.purposes.map((purpose) => ({
        key: purpose.key,
        label: labelFor(purpose),
      })),
      { key: "unallocated", label: labels.unallocatedSegment },
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

  // A four-figure table per row — months, requested, allocated, shortfall —
  // which is the only place the REQUESTED total and the shortfall can sit
  // beside the allocation without being drawn as if they existed.
  return {
    ...model,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      mobileCards: true,
      columns: [
        { label: labels.itemColumn },
        { label: labels.monthsColumn, numeric: true },
        { label: labels.requestedColumn, numeric: true },
        { label: labels.allocatedColumn, numeric: true },
        { label: labels.shortfallColumn, numeric: true },
      ],
      rows: [
        [
          labels.reserveRow,
          "",
          moneyCell(result.reserve),
          moneyCell(result.reserveAllocated),
          moneyCell(result.reserveShortfall),
        ],
        ...result.purposes.map((purpose) => [
          nameFor(purpose.key),
          purpose.timeUnknown
            ? labels.noMonths
            : countCell(purpose.monthsUntilNeeded as number),
          moneyCell(purpose.requested),
          moneyCell(purpose.allocated),
          moneyCell(purpose.shortfall),
        ]),
        [
          labels.unallocatedRow,
          "",
          "",
          moneyCell(result.unallocated),
          "",
        ],
        [
          labels.totalRow,
          "",
          moneyCell(result.totalRequested),
          moneyCell(result.totalAllocated),
          moneyCell(result.shortfall),
        ],
      ],
    },
  };
}
