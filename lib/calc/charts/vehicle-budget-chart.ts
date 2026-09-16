/**
 * The with/without-car monthly allocation for /cong-cu/vay-mua-xe/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `vehicle-budget-chart.test.ts`.
 *
 * Original row 31's visual is "phân bổ ngân sách có/không khoản vay xe". This
 * draws it as THREE bars, and the third one is the repair of a shipped defect:
 *
 * 1. `income` — the net income, on its own. The REFERENCE the other two are
 *    read against.
 * 2. `without` — what leaves the month with no vehicle, plus the leftover.
 * 3. `with` — the same, plus the instalment and any running costs.
 *
 * WHY AN INCOME BAR, AND WHY THE FIRST VERSION WAS WRONG. `segment()` drops a
 * non-positive value, so a NEGATIVE leftover simply has no segment and the
 * with-car bar is then the sum of the outgoings alone. On the review's
 * fixture — 30 triệu net against 22 + 3 + 3 + 8,50 — that bar totals
 * 36.498.818 ₫, which is LONGER than the income, not shorter. The module used
 * to claim in this very comment that the bar "stops at the income", and the
 * summary printed `max(0, withCar)` as the after figure: the figure announced
 * "2 triệu before, 0 after, gap 8,5 triệu", which is not arithmetic. An
 * independent review reproduced it on the live page.
 *
 * Both halves are fixed here. The residual is printed SIGNED — or as an
 * explicit "thiếu X" through its own sentence — so 2 − (−6,50) = 8,50 reads
 * correctly; and the income bar makes "outgoings exceed income" the visible
 * shape of a deficit instead of a mystery. No expense is truncated to force
 * the totals to match, which was the other way this could have been closed
 * and would have hidden a real cost.
 *
 * AN UNKNOWN INSTALMENT WITHHOLDS THE WHOLE FIGURE. This chart IS the
 * comparison; with no instalment there is nothing to compare, so it returns
 * its own reason and recovery rather than a two-bar picture a reader could
 * mistake for the answer. The without-car figure is still on the page, in the
 * result rows.
 *
 * Every figure comes from `compareVehicleBudget`; nothing is recomputed here.
 */

import {
  barOf,
  finishBars,
  emptyBars,
  segment,
  type BarFrameLabels,
} from "@/lib/calc/charts/bars";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import type { BarChartModel } from "@/lib/calc/charts/types";
import { moneyCell } from "@/lib/calc/table-cell";
import type { VehicleBudgetResult } from "@/lib/calc/vehicle-budget";

export type VehicleBudgetLabels = BarFrameLabels & {
  /** The reference bar: net income, on its own. */
  incomeBar: string;
  withoutBar: string;
  withBar: string;
  essentials: string;
  /** Existing debts, EXCLUDING this vehicle. */
  otherDebts: string;
  reserve: string;
  /** The vehicle instalment. */
  payment: string;
  /** Running costs, only when entered. */
  running: string;
  /** What is left over. */
  leftover: string;
  /** Row naming the deficit, when the month does not balance. */
  shortfallRow: string;
  /** How to read three bars against each other. Shown above the table. */
  tableHint: string;
  /** Balanced month. `{income}`, `{without}`, `{with}`, `{gap}` substituted. */
  summaryBalanced: string;
  /**
   * Deficit month. `{income}`, `{without}`, `{shortfall}`, `{gap}` substituted.
   *
   * A separate sentence rather than a clamped figure in the balanced one: the
   * grammar of "thiếu X" is not the grammar of "còn X", and the content file
   * has to own both — see `labels.ts`'s note on `fill`.
   */
  summaryShortfall: string;
  /** Appended when essential costs were not supplied. */
  limitedNote: string;
  /**
   * Appended when running costs are not in the figures.
   *
   * Only ever added where a with-car residual EXISTS: the note says that
   * residual is higher than reality, which is a claim about a number. The
   * unknown-instalment state withholds the whole figure, so it never reaches
   * this line.
   */
  runningExcludedNote: string;
  /** Always appended: the deposit and trade-in are not monthly money. */
  upfrontNote: string;
  /** Instalment unknown: this figure is withheld. */
  unknownReason: string;
  unknownRecovery: string;
  /** The month already failed before the vehicle. */
  brokenReason: string;
  brokenRecovery: string;
};

/** An empty model carrying a cause-specific reason and recovery. */
function withheld(
  labels: VehicleBudgetLabels,
  reason: string,
  recovery: string,
): BarChartModel {
  const empty = emptyBars(labels);
  // `summary` IS the text equivalent `ChartFigure` renders, so it has to carry
  // the same reason rather than the generic one.
  return { ...empty, summary: reason, unavailable: { reason, recovery } };
}

/**
 * Income, the month without the vehicle, and the month with it.
 *
 * Withheld — with its own reason and recovery, never a blank plot — in three
 * distinguishable states: no usable household figures at all, an instalment
 * that could not be priced, and a month that does not balance even before the
 * vehicle. Each has a different cause and therefore a different sentence.
 */
export function vehicleBudgetModel(
  result: VehicleBudgetResult | null,
  labels: VehicleBudgetLabels,
): BarChartModel {
  if (result === null) return emptyBars(labels);
  if (result.vehicleCostUnknown) {
    return withheld(labels, labels.unknownReason, labels.unknownRecovery);
  }
  if (result.shortfallWithoutVehicle) {
    return withheld(labels, labels.brokenReason, labels.brokenRecovery);
  }

  // Non-null in every path below: `vehicleCostUnknown` returned above.
  const vehicleCost = result.vehicleMonthlyCost ?? 0;
  const withCar = result.withCar ?? 0;

  const incomeBar = barOf(
    "income",
    labels.incomeBar,
    [segment("income", labels.incomeBar, result.netIncome, labels)],
    labels,
  );

  const commonSegments = () => [
    segment("essentials", labels.essentials, result.essentialExpenses ?? 0, labels),
    segment("otherDebts", labels.otherDebts, result.otherDebts, labels),
    segment("reserve", labels.reserve, result.reserveSaving, labels),
  ];

  const withoutBar = barOf(
    "without",
    labels.withoutBar,
    [
      ...commonSegments(),
      segment("leftover", labels.leftover, result.withoutCar, labels),
    ],
    labels,
  );

  // In deficit the leftover segment does not exist — a stacked bar has no
  // signed form — so this bar is the outgoings alone and is LONGER than the
  // income bar by exactly the shortfall. That is the honest picture; the
  // alternative (trimming the instalment to fit) would delete a real expense.
  const withBar = barOf(
    "with",
    labels.withBar,
    [
      ...commonSegments(),
      segment("payment", labels.payment, result.vehiclePayment ?? 0, labels),
      segment("running", labels.running, result.vehicleRunningCosts, labels),
      segment("leftover", labels.leftover, withCar, labels),
    ],
    labels,
    true,
  );

  // The residual is never clamped. `{with}` carries the signed figure in the
  // balanced sentence; the deficit gets its own sentence with `{shortfall}` as
  // a magnitude, so the sign lives in the words rather than in a minus sign
  // the reader has to reconcile with "còn".
  let summary =
    result.shortfall && result.shortfallAmount !== null
      ? fill(labels.summaryShortfall, {
          income: compactMoney(result.netIncome, labels),
          without: compactMoney(result.withoutCar, labels),
          shortfall: compactMoney(result.shortfallAmount, labels),
          gap: compactMoney(vehicleCost, labels),
        })
      : fill(labels.summaryBalanced, {
          income: compactMoney(result.netIncome, labels),
          without: compactMoney(result.withoutCar, labels),
          with: compactMoney(withCar, labels),
          gap: compactMoney(vehicleCost, labels),
        });

  summary += ` ${labels.upfrontNote}`;
  if (result.runningCostsExcluded) summary += ` ${labels.runningExcludedNote}`;
  if (result.limited) summary += ` ${labels.limitedNote}`;

  const model = finishBars(
    [incomeBar, withoutBar, withBar],
    [
      { key: "income", label: labels.incomeBar },
      { key: "essentials", label: labels.essentials },
      { key: "otherDebts", label: labels.otherDebts },
      { key: "reserve", label: labels.reserve },
      { key: "payment", label: labels.payment },
      ...(result.vehicleRunningCosts > 0
        ? [{ key: "running", label: labels.running }]
        : []),
      { key: "leftover", label: labels.leftover },
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

  // The reading instruction belongs with the table: three bars whose lengths
  // are meant to be compared need one sentence saying so.
  const table = { ...model.table, hint: labels.tableHint };

  if (!result.shortfall || result.shortfallAmount === null) {
    return { ...model, table };
  }

  // The deficit is a real figure no stacked segment can carry, so the table
  // states it explicitly rather than leaving it to the summary alone. Raw
  // đồng, like every other cell, so the compact/exact switch drives it too.
  return {
    ...model,
    table: {
      ...table,
      rows: [...table.rows, [labels.shortfallRow, moneyCell(result.shortfallAmount)]],
    },
  };
}
