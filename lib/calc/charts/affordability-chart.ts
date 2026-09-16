/**
 * The affordability charts for /cong-cu/kha-nang-mua-nha/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `affordability-chart.test.ts`.
 *
 * TWO pictures, because the page answers two questions and merging them would
 * imply they are the same one:
 *
 * 1. `priceCompositionModel` — what the affordable PRICE is made of: the cash
 *    that reaches the seller, and the loan. Purchase costs appear as their own
 *    segment of the cash, so they are visibly not part of the price.
 * 2. `monthlyAllocationModel` — where the monthly income GOES. In household
 *    mode this is the whole ledger: essentials, existing debt, buffer, the
 *    housing payment, and whatever is left. In ceiling mode there is no
 *    household ledger to draw, so it draws the two ratio limits side by side
 *    against the payment instead — and says that is what they are.
 *
 * The second chart is the one the audit asked for by name: distinguish the
 * ratio ceiling from a livable budget. A single bar labelled "ngân sách"
 * cannot do that. Two bars — what the ratios allow, what the household has
 * left — can, and the binding one is marked. The ceiling is an illustrative
 * figure from ratios the user supplied; nothing here calls it an approval or
 * claims what any bank does.
 *
 * NOTHING HERE IS CALLED SAFE. The models carry the `conclusionLimited` and
 * `infeasible` flags through as their own sentences, so a chart built on an
 * expenses figure nobody supplied says so on the figure itself rather than in
 * a footnote further down the page.
 */

import type { AffordabilityResult } from "@/lib/calc/affordability";
import {
  barOf,
  emptyBars,
  finishBars,
  LEDGER_RESIDUE_DONG,
  segment,
} from "@/lib/calc/charts/bars";
import { compactMoney, fill, type MoneyWords } from "@/lib/calc/charts/labels";
import type { BarChartModel } from "@/lib/calc/charts/types";

export type PriceCompositionLabels = MoneyWords & {
  title: string;
  priceBar: string;
  cashSegment: string;
  loanSegment: string;
  costsSegment: string;
  /** The bar for cash that does NOT go into the price. */
  otherCashBar: string;
  unusedCashSegment: string;
  /** A bar for borrowing capacity the financing assumption leaves unused. */
  capacityBar: string;
  usedCapacitySegment: string;
  unusedCapacitySegment: string;
  /** `{unit}` substituted. */
  axis: string;
  /** `{price}`, `{cash}`, `{loan}` substituted. */
  summary: string;
  /** Appended when the cash, not the payment, is what caps the price. */
  financingBoundNote: string;
  /** Appended when purchase costs are excluded from the model. */
  costsExcludedNote: string;
  /** Appended when the conclusion rests on unsupplied expenses. */
  limitedNote: string;
  /** Shown in place of a chart when no purchase is feasible. */
  blockedReason: string;
  blockedRecovery: string;
  assumptions: readonly string[];
  tableCaption: string;
  itemColumn: string;
  amountColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

export type MonthlyAllocationLabels = MoneyWords & {
  title: string;
  /** Household mode. */
  householdBar: string;
  essentials: string;
  debts: string;
  /** The ACTUAL instalment on the loan used, not the housing budget. */
  housing: string;
  /** Recurring housing costs that are not debt service. */
  otherHousing: string;
  buffer: string;
  leftover: string;
  /** Ceiling mode. */
  ceilingBar: string;
  housingLimitBar: string;
  totalDebtLimitBar: string;
  /** `{unit}` substituted. */
  axis: string;
  /** `{binding}`, `{budget}`, `{payment}` substituted. */
  summaryHousehold: string;
  /** Appended when the actual outflow leaves budget unused: `{headroom}`. */
  headroomNote: string;
  /** `{payment}` substituted. */
  summaryCeiling: string;
  bindingHousing: string;
  bindingTotalDebt: string;
  bindingHousehold: string;
  infeasibleNote: string;
  limitedNote: string;
  ceilingIsNotBudgetNote: string;
  assumptions: readonly string[];
  tableCaption: string;
  itemColumn: string;
  amountColumn: string;
  unavailableReason: string;
  unavailableRecovery: string;
};

/**
 * What the affordable price is made of, and what the money that is NOT in it
 * is doing.
 *
 * Three bars at most, and every đồng in each of them is non-negative because
 * `computeAffordability` now solves a coherent envelope rather than clamping
 * afterwards:
 *
 * 1. the PRICE — cash that reaches the seller, plus the loan actually used;
 * 2. the rest of the CASH — purchase costs, and anything left unused;
 * 3. the borrowing CAPACITY — how much of what the payment could service is
 *    actually used, and how much the cash or the financing assumption leaves
 *    on the table.
 *
 * The third bar is the one the old chart could not draw at all. When the cash
 * is what caps the price, the payment could support a much larger loan, and a
 * buyer needs to see that the constraint is the deposit rather than their
 * income — otherwise the obvious response is to cut spending, which would not
 * help.
 */
export function priceCompositionModel(
  result: AffordabilityResult | null,
  labels: PriceCompositionLabels,
): BarChartModel {
  if (result === null) return emptyBars(labels);

  // No feasible purchase: there is nothing coherent to draw, and the old chart
  // drew a loan bar next to a smaller price summary in exactly this case.
  if (!(result.maxPrice > 0)) {
    const empty = emptyBars(labels);
    if (!result.financingBlocked) return empty;
    return {
      ...empty,
      summary: labels.blockedReason,
      unavailable: {
        reason: labels.blockedReason,
        recovery: labels.blockedRecovery,
      },
    };
  }

  const priceBar = barOf(
    "price",
    labels.priceBar,
    [
      segment("cash", labels.cashSegment, result.cashToPrice, labels),
      segment("loan", labels.loanSegment, result.maxLoan, labels),
    ],
    labels,
    true,
  );

  // Cash that leaves the buyer, or stays with them, but never reaches the
  // price. Both parts are non-negative by construction.
  const unusedCash = Math.max(
    0,
    result.usableCash - result.cashToPrice - result.purchaseCosts,
  );
  const otherCash = barOf(
    "otherCash",
    labels.otherCashBar,
    [
      segment("costs", labels.costsSegment, result.purchaseCosts, labels),
      segment("unusedCash", labels.unusedCashSegment, unusedCash, labels),
    ],
    labels,
  );

  // The payment's borrowing capacity, split into used and unused.
  const unusedCapacity = Math.max(
    0,
    result.paymentSupportedLoan - result.maxLoan,
  );
  const capacity = barOf(
    "capacity",
    labels.capacityBar,
    [
      segment("usedCapacity", labels.usedCapacitySegment, result.maxLoan, labels),
      segment(
        "unusedCapacity",
        labels.unusedCapacitySegment,
        unusedCapacity,
        labels,
      ),
    ],
    labels,
  );

  let summary = fill(labels.summary, {
    price: compactMoney(result.maxPrice, labels),
    cash: compactMoney(result.cashToPrice, labels),
    loan: compactMoney(result.maxLoan, labels),
  });
  if (result.priceBinding === "financing") {
    summary += ` ${labels.financingBoundNote}`;
  }
  if (result.purchaseCosts === 0) summary += ` ${labels.costsExcludedNote}`;
  if (result.conclusionLimited) summary += ` ${labels.limitedNote}`;

  const bars = [priceBar];
  if (otherCash.total > 0) bars.push(otherCash);
  // Only worth a bar when there is a gap to explain.
  if (unusedCapacity > 0) bars.push(capacity);

  return finishBars(
    bars,
    [
      { key: "cash", label: labels.cashSegment },
      { key: "loan", label: labels.loanSegment },
      ...(result.purchaseCosts > 0
        ? [{ key: "costs", label: labels.costsSegment }]
        : []),
      ...(unusedCapacity > 0
        ? [{ key: "unusedCapacity", label: labels.unusedCapacitySegment }]
        : []),
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
}

/** Where the month's money goes — or, in ceiling mode, what the ratios allow. */
export function monthlyAllocationModel(
  result: AffordabilityResult | null,
  input: {
    /** Net income, essentials and buffer as the user supplied them. */
    netIncome?: number;
    essentialExpenses?: number;
    monthlyBuffer?: number;
    monthlyDebts?: number;
    /** Recurring housing costs other than principal and interest. */
    monthlyHousingCosts?: number;
  },
  labels: MonthlyAllocationLabels,
): BarChartModel {
  if (result === null) return emptyBars(labels);

  const bindingLabel =
    result.bindingLimit === "household"
      ? labels.bindingHousehold
      : result.bindingLimit === "totalDebt"
        ? labels.bindingTotalDebt
        : labels.bindingHousing;

  if (result.mode === "household" && result.householdResidual !== null) {
    const netIncome = input.netIncome ?? 0;
    /**
     * THE ACTUAL OUTFLOW, not the budget.
     *
     * This segment used to be `affordableHousingPayment` — the whole housing
     * BUDGET — which on a cash-bound fixture drew 17 triệu of "trả nợ nhà"
     * and no headroom, while the instalment on the loan actually used was
     * 13,81 triệu and 2 triệu of it was not debt service at all. A ledger
     * claiming the budget is what leaves the account is a chart contradicting
     * the page's own headline rows.
     */
    const loanPayment = result.expectedPrincipalInterest;
    const otherHousing = input.monthlyHousingCosts ?? 0;
    // Whatever the household does not spend after everything else, INCLUDING
    // the part of the housing budget the purchase never reaches.
    //
    // Below half a đồng is float residue and not money: when the payment is
    // what binds the price, `expectedPrincipalInterest` is a `pmt` inversion
    // of a `pv` inversion of this very budget, so the two agree to about a
    // billionth of a đồng — and an unconditional segment would draw a "còn
    // lại chưa dùng" sliver worth nothing at all.
    const unspent = result.householdResidual - loanPayment - otherHousing;
    const leftover = unspent > LEDGER_RESIDUE_DONG ? unspent : 0;

    const bar = barOf(
      "household",
      labels.householdBar,
      [
        segment(
          "essentials",
          labels.essentials,
          input.essentialExpenses ?? 0,
          labels,
        ),
        segment("debts", labels.debts, input.monthlyDebts ?? 0, labels),
        segment("buffer", labels.buffer, input.monthlyBuffer ?? 0, labels),
        segment("housing", labels.housing, loanPayment, labels),
        segment("otherHousing", labels.otherHousing, otherHousing, labels),
        segment("leftover", labels.leftover, leftover, labels),
      ],
      labels,
      true,
    );

    const ceilingBar = barOf(
      "ceiling",
      labels.ceilingBar,
      [segment("ceiling", labels.ceilingBar, result.assumedRatioCeiling, labels)],
      labels,
    );

    let summary = fill(labels.summaryHousehold, {
      binding: bindingLabel,
      budget: compactMoney(result.affordableHousingPayment, labels),
      payment: compactMoney(loanPayment, labels),
    });
    // Named rather than left as an unexplained gap in the bar.
    const headroom =
      result.affordableHousingPayment - loanPayment - otherHousing;
    if (headroom > LEDGER_RESIDUE_DONG) {
      summary += ` ${fill(labels.headroomNote, {
        headroom: compactMoney(headroom, labels),
      })}`;
    }
    summary += ` ${labels.ceilingIsNotBudgetNote}`;
    if (result.infeasible) summary += ` ${labels.infeasibleNote}`;
    if (result.conclusionLimited) summary += ` ${labels.limitedNote}`;

    // A ledger that does not add up to the income it came from is a chart
    // lying about arithmetic, so the bar is only drawn against the income when
    // the two agree; otherwise only the parts are shown.
    const bars =
      netIncome > 0 && ceilingBar.total > 0 ? [bar, ceilingBar] : [bar];

    return finishBars(
      bars,
      [
        { key: "essentials", label: labels.essentials },
        { key: "debts", label: labels.debts },
        { key: "buffer", label: labels.buffer },
        { key: "housing", label: labels.housing },
        { key: "otherHousing", label: labels.otherHousing },
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
  }

  // Ceiling mode: the two underwriting limits, and the payment that came out
  // of them. No household ledger is drawn because none was collected —
  // inventing one from a ratio is precisely the conflation this avoids.
  const bars = [
    barOf(
      "housingLimit",
      labels.housingLimitBar,
      [segment("limit", labels.housingLimitBar, result.housingLimit, labels)],
      labels,
      result.bindingLimit === "housing",
    ),
    barOf(
      "totalDebtLimit",
      labels.totalDebtLimitBar,
      [
        segment(
          "limit",
          labels.totalDebtLimitBar,
          Math.max(0, result.totalDebtLimit),
          labels,
        ),
      ],
      labels,
      result.bindingLimit === "totalDebt",
    ),
  ];

  const summary =
    fill(labels.summaryCeiling, {
      payment: compactMoney(result.affordableHousingPayment, labels),
    }) + ` ${labels.ceilingIsNotBudgetNote}`;

  return finishBars(
    bars,
    [{ key: "limit", label: labels.ceilingBar }],
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
}
