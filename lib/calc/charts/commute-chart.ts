/**
 * Two monthly commute costs, side by side, for /cong-cu/chi-phi-nhien-lieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `commute-chart.test.ts`.
 *
 * Original row 68's visual is "hai thanh chi phí tháng theo hai nơi ở", so
 * this is exactly two bars and nothing else. Each is a single segment: the
 * monthly fuel cost of commuting from that candidate home. There is no
 * composition to stack — one cost per home is the whole quantity — and adding
 * a decorative breakdown would imply a split the model does not have.
 *
 * ONE BASIS, NAMED ON THE FIGURE. The bars are the HOUSEHOLD figure (the
 * whole vehicle's fuel), and the per-person reading is in the summary and the
 * table rather than as a second pair of bars. Drawing both bases in one plot
 * is how a reader ends up comparing one home's per-person cost against the
 * other's household total — so the basis is stated once, in words, and the
 * bars never mix.
 *
 * THE TRIP DIRECTION IS PART OF THAT BASIS, AND IT IS SPELLED OUT. The two
 * distance fields say "một chiều" in both states, yet selecting khứ hồi
 * doubles every figure on this model — 308.000 ₫ becomes 616.000 ₫ on the
 * page's own example. An independent review found the result and this figure
 * naming neither direction, so `basisFormat` now states the direction, the
 * workday count, the normalised consumption and the fuel price that produced
 * the bars. Every one of those is an input the reader already entered; nothing
 * is inferred, and no location is read.
 *
 * FUEL IS NOT THE COST OF COMMUTING, and the figure says so itself rather
 * than leaving it to a paragraph elsewhere on the page.
 *
 * Every figure arrives from `compareCommutes`, which has already refused any
 * derived non-finite value — so nothing here can hand a NaN to an SVG.
 */

import {
  barOf,
  emptyBars,
  finishBars,
  segment,
  type BarFrameLabels,
} from "@/lib/calc/charts/bars";
import { compactMoney, fill, fullMoney } from "@/lib/calc/charts/labels";
import type { BarChartModel } from "@/lib/calc/charts/types";
import { formatDecimal } from "@/lib/calc/number";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import type { CommuteCompareResult } from "@/lib/calc/commute-compare";

export type CommuteChartLabels = BarFrameLabels & {
  /** The bar segment's own name — the same for both bars. */
  fuelSegment: string;
  /** `{name}`, `{km}` substituted, per bar. */
  barFormat: string;
  /** `{cheap}`, `{costly}`, `{difference}` substituted. */
  summary: string;
  /** Used instead when the two cost the same: `{cost}` substituted. */
  summaryEqual: string;
  /** `{difference}` substituted. Appended only when more than one person. */
  perPersonNote: string;
  /**
   * The basis both bars were priced on. Always appended.
   *
   * `{direction}`, `{days}`, `{litres}` and `{price}` substituted — the trip
   * direction selected above, the workday count, the consumption normalised to
   * L/100 km and the fuel price. See the module docstring for why the
   * direction in particular cannot be left implicit.
   */
  basisFormat: string;
  /** Word for the one-way reading, substituted into `basisFormat`. */
  directionOneWay: string;
  /** Word for the round-trip reading, substituted into `basisFormat`. */
  directionRoundTrip: string;
  /** Always appended. */
  fuelOnlyNote: string;
  /** Always appended: no location was read. */
  manualEntryNote: string;
  /** Appended when no commuting days were entered. */
  zeroDaysNote: string;
  distanceColumn: string;
  monthlyKmColumn: string;
  householdColumn: string;
  perPersonColumn: string;
  /** Label for the final table row, which carries both bases. */
  differenceRow: string;
  /** How to read a five-column table whose last two columns are two bases. */
  tableHint: string;
};

/** The name the page gave each candidate, keyed the same way as the legs. */
export type CommuteNames = Record<string, string>;

/**
 * Two bars: the monthly fuel cost of commuting from each candidate home.
 *
 * `unavailable` only when there is no result at all — the caller distinguishes
 * "no workday count yet" from "invalid entry" and supplies the matching reason
 * and recovery, because this adapter cannot tell them apart from a null.
 */
export function commuteChartModel(
  result: CommuteCompareResult | null,
  names: CommuteNames,
  labels: CommuteChartLabels,
): BarChartModel {
  if (result === null) return emptyBars(labels);

  const nameFor = (key: string) => names[key] ?? key;

  const bars = result.legs.map((leg) =>
    barOf(
      leg.key,
      fill(labels.barFormat, {
        name: nameFor(leg.key),
        km: leg.oneWayKm,
      }),
      [segment("fuel", labels.fuelSegment, leg.monthlyCost, labels)],
      labels,
      // The costlier home is the one the reader is being warned about. Null
      // when they cost the same, in which case neither is emphasised.
      result.costlierKey === leg.key,
    ),
  );

  const [a, b] = result.legs;
  const cheaper = a.monthlyCost <= b.monthlyCost ? a : b;
  const costlier = cheaper === a ? b : a;

  let summary =
    result.costlierKey === null
      ? fill(labels.summaryEqual, {
          cost: compactMoney(a.monthlyCost, labels),
        })
      : fill(labels.summary, {
          cheap: nameFor(cheaper.key),
          costly: nameFor(costlier.key),
          difference: compactMoney(result.monthlyDifference, labels),
        });

  // Only worth a sentence when there is actually a split to describe.
  if (result.people > 1) {
    summary += ` ${fill(labels.perPersonNote, {
      difference: compactMoney(result.monthlyDifferencePerPerson, labels),
    })}`;
  }
  if (result.workdaysPerMonth === 0) summary += ` ${labels.zeroDaysNote}`;

  // The basis, right after the answer and before the limits. Every value is an
  // echoed input: the direction decides whether these bars are one journey a
  // day or two, and the figures change by a factor of two between them.
  summary += ` ${fill(labels.basisFormat, {
    direction: result.roundTrip
      ? labels.directionRoundTrip
      : labels.directionOneWay,
    days: formatDecimal(result.workdaysPerMonth, 0),
    litres: formatDecimal(result.litresPer100km, 1),
    price: fullMoney(result.pricePerLitre, labels),
  })}`;

  summary += ` ${labels.fuelOnlyNote}`;
  summary += ` ${labels.manualEntryNote}`;

  const model = finishBars(
    bars,
    [{ key: "fuel", label: labels.fuelSegment }],
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

  // A richer table than `finishBars` builds: with one segment per bar its
  // default rows would repeat the same figure twice per home. This replaces
  // them with the distances and litres the cost came from — five columns, so
  // `mobileCards` per docs §3.
  return {
    ...model,
    table: {
      caption: labels.tableCaption,
      hint: labels.tableHint,
      mobileCards: true,
      columns: [
        { label: labels.itemColumn },
        { label: labels.distanceColumn, numeric: true },
        { label: labels.monthlyKmColumn, numeric: true },
        { label: labels.householdColumn, numeric: true },
        { label: labels.perPersonColumn, numeric: true },
      ],
      rows: [
        ...result.legs.map((leg) => [
          nameFor(leg.key),
          countCell(leg.oneWayKm),
          countCell(Math.round(leg.monthlyKm)),
          moneyCell(leg.monthlyCost),
          moneyCell(leg.monthlyCostPerPerson),
        ]),
        [
          labels.differenceRow,
          "",
          countCell(Math.round(result.monthlyKmDifference)),
          moneyCell(result.monthlyDifference),
          moneyCell(result.monthlyDifferencePerPerson),
        ],
      ],
    },
  };
}
