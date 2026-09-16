/**
 * Turning an article's declared hypothetical into a rendered visual.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `education-visual.test.ts`.
 *
 * WHY A RESOLVER RATHER THAN NUMBERS IN THE PROSE. Every figure a "Mua nhà
 * bằng con số" article quotes has to be the SAME figure the calculator it
 * links to produces — otherwise the exercise sends the reader to a tool that
 * disagrees with the article they just read. docs §8 records that several
 * figures quoted in content prose were wrong on the first pass and were only
 * fixed by running the module.
 *
 * So an article declares a hypothetical as DATA, and this module runs the
 * production engine on it and hands back a resolved chart or table model. The
 * article's prose then quotes figures that a test can bind to the same call.
 * There is no second financial model anywhere in the collection.
 *
 * LABELS COME FROM THE CALCULATORS. Each visual reuses the label block of the
 * tool it is teaching (`LOAN.chart`, `AFFORDABILITY.priceChart`, …), so the
 * axis titles, the legend and the assumption list a reader sees in an article
 * are the ones they will see again on the tool. Only the figure's TITLE is
 * overridden per article.
 */

import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { computeApr, type AprInput } from "@/lib/calc/apr";
import {
  computeGraceLoan,
  type GraceLoanInput,
} from "@/lib/calc/grace-loan";
import { analyseLoan, type LoanAnalysisInput } from "@/lib/calc/loan-analysis";
import { computeLoan, type LoanInput } from "@/lib/calc/loan";
import {
  buildPhases,
  computeFloatingLoan,
  compareFixedFloating,
} from "@/lib/calc/floating-loan";
import { compareLoans, type LoanOption } from "@/lib/calc/loan-compare";
import { compareRefinance, type RefinanceInput } from "@/lib/calc/refinance";
import {
  countCell,
  moneyCell,
  percentCell,
  type TableCell,
} from "@/lib/calc/table-cell";
import { savingsScheduleFor } from "@/lib/calc/savings-schedule";
import {
  compareGrowthScenarios,
  type RentVsBuyInput,
} from "@/lib/calc/rent-vs-buy";
import { rentBuyScenariosModel } from "@/lib/calc/charts/rent-buy-chart";
import {
  computeSavingsGoal,
  type SavingsGoalInput,
} from "@/lib/calc/savings-goal";
import {
  loanChartModel,
  type LoanChartGranularity,
} from "@/lib/calc/charts/loan-chart";
import {
  monthlyAllocationModel,
  priceCompositionModel,
} from "@/lib/calc/charts/affordability-chart";
import { floatingChartModel } from "@/lib/calc/charts/floating-chart";
import {
  savingsChartModel,
  savingsPathsModel,
} from "@/lib/calc/charts/savings-chart";
import {
  costBarsModel,
  paymentTimelineModel,
} from "@/lib/calc/charts/compare-chart";
import { debtPathsModel } from "@/lib/calc/charts/debt-path-chart";
import { refinanceChartModel } from "@/lib/calc/charts/refinance-chart";
import { aprRateBarsModel } from "@/lib/calc/charts/apr-chart";
import { gracePaymentBarsModel } from "@/lib/calc/charts/grace-chart";
import {
  barOf,
  finishBars,
  segment,
  type BarFrameLabels,
} from "@/lib/calc/charts/bars";
import { fill, fullMoney, type MoneyWords } from "@/lib/calc/charts/labels";
import type { ChartModel, ChartTable } from "@/lib/calc/charts/types";
import { formatDecimal, formatPercent } from "@/lib/calc/number";

/** The declared hypothetical, as an article states it. */
export type EducationVisualSpec =
  /** Principal and interest per period, with the outstanding balance. */
  | {
      kind: "loanColumns";
      title: string;
      loan: LoanInput;
      granularity: LoanChartGranularity;
    }
  /** The instalment before and after a rate change. */
  | {
      kind: "floatingTimeline";
      title: string;
      amount: number;
      termMonths: number;
      promoMonths: number;
      promoRatePercent: number;
      postRatePercent: number;
      /** Only when the article's household states one. */
      monthlyBudget?: number;
    }
  /** Accumulation to a target, with contributions separated from interest. */
  | {
      kind: "savingsCurve";
      title: string;
      goal: SavingsGoalInput;
    }
  /** What an affordable price is made of. */
  | { kind: "affordabilityPrice"; title: string; input: AffordabilityInput }
  /** Where a month's income goes. */
  | { kind: "affordabilityMonthly"; title: string; input: AffordabilityInput }
  /** Cost of borrowing per option. */
  | {
      kind: "compareCost";
      title: string;
      amount: number;
      options: LoanOption[];
      optionLabels: readonly string[];
      /**
       * The common horizon the article is measuring at, in whole months.
       *
       * REQUIRED rather than optional: the tool defaults to a realistic hold
       * and an article that omitted this silently measured at the longest
       * term, so its figures could not be reproduced by following its own
       * exercise. Stating it here is what keeps the prose, the picture and
       * the steps at one horizon.
       */
      horizonMonths: number;
    }
  /** Instalment and term per option. */
  | {
      kind: "comparePayments";
      title: string;
      amount: number;
      options: LoanOption[];
      optionLabels: readonly string[];
    }
  /**
   * Renting versus buying over TIME, under named house-price assumptions.
   *
   * C08's plan row asks for "so dòng tiền/tài sản theo thời gian, ít nhất hai
   * kịch bản giá", and an endpoint table is neither. The picture is the signed
   * advantage month by month, one line per assumption; the figure's own
   * accessible table stays an exact endpoint reading, per scenario, because
   * that is what a reader reproduces in the tool.
   */
  | {
      kind: "rentBuyScenarios";
      title: string;
      input: RentVsBuyInput;
      /** The named growth rates, in percent per year. At least two. */
      growthPercents: readonly number[];
    }
  /**
   * Two contribution levels against the same goal.
   *
   * Drawn as two accumulation PATHS with a marker on each first-funded cycle,
   * because the article's point is that a 25% bigger contribution does not
   * shorten the plan by 25%. The exact comparison figures stay as the
   * figure's own accessible table — the picture was added, the data was not
   * replaced.
   */
  | {
      kind: "savingsComparePaths";
      title: string;
      base: SavingsGoalInput;
      increased: SavingsGoalInput;
      baseLabel: string;
      increasedLabel: string;
    }
  /** A fixed rate against a phased floating path. */
  | {
      kind: "fixedFloatingTable";
      title: string;
      amount: number;
      termMonths: number;
      promoMonths: number;
      promoRatePercent: number;
      postRatePercent: number;
      fixedRatePercent: number;
    }
  /** Switching to a cheaper loan, and when the costs are recovered. */
  | { kind: "refinanceTable"; title: string; input: RefinanceInput }
  /**
   * Two debt paths for the SAME loan over two terms, plus each term's own
   * full-term interest — C07's original requirement.
   *
   * The two figures answer different questions and the row's own wording
   * insists on both: the instalment is lighter on the longer term and the
   * total interest is higher, so neither number alone is the trade-off. The
   * interest here is each option's FULL TERM, never a cost measured to some
   * common month.
   */
  | {
      kind: "loanTermDebtPaths";
      title: string;
      amount: number;
      annualRatePercent: number;
      /** Exactly two terms, in months, shortest first. */
      terms: readonly [number, number];
      termLabels: readonly [string, string];
      /** Months the exact table reports a balance at. */
      checkpoints: readonly number[];
    }
  /**
   * The same loan with and without a monthly extra payment — C10's original
   * requirement: "baseline versus extra-payment debt and total cost/month
   * savings", with a payoff marker on each path.
   */
  | {
      kind: "extraPaymentDebtPaths";
      title: string;
      /** The loan WITHOUT the extra. The baseline path is this exactly. */
      loan: LoanInput;
      extraPerMonth: number;
      baselineLabel: string;
      extraLabel: string;
      checkpoints: readonly number[];
    }
  /**
   * Instalment paths under a fixed rate and under a promotional rate that
   * resets — C11's original requirement, with more than one NAMED
   * post-promotional assumption.
   *
   * `drawnPostRatePercents` are the scenarios the picture carries, bounded by
   * the three non-colour stroke channels; `postRatePercents` are every named
   * scenario the exact table reports. No scenario carries a probability and
   * none is a quote.
   */
  | {
      kind: "fixedFloatingPaths";
      title: string;
      amount: number;
      termMonths: number;
      promoMonths: number;
      promoRatePercent: number;
      fixedRatePercent: number;
      postRatePercents: readonly number[];
      drawnPostRatePercents: readonly number[];
      /**
       * The scenario the article DECLARES as its own hypothetical.
       *
       * The break-even fixed rate is only meaningful against one named
       * floating scenario — it is the fixed rate whose full-term interest
       * equals THAT path's — so it is stated explicitly rather than taken
       * from the first entry of a list, which would silently answer a
       * different question than the prose asks.
       */
      declaredPostRatePercent: number;
    }
  /**
   * The signed cost and cash-flow paths of a switch over time, each with its
   * own break-even marker — C12's original requirement.
   */
  | {
      kind: "refinanceCostPath";
      title: string;
      input: RefinanceInput;
      checkpoints: readonly number[];
    }
  /**
   * The contract rate beside the rate the cash flows imply once fees are
   * counted — and, when the article declares a settlement month, the same
   * rate for that shorter hold.
   *
   * Built from the APR tool's OWN adapter, so the three bars an article shows
   * are the three bars the tool draws for the same inputs. `input.payoffMonths`
   * is what mounts the third bar; leaving it off draws two.
   */
  | { kind: "aprRateBars"; title: string; input: AprInput }
  /**
   * The instalment in each phase of a loan with a principal grace period,
   * split into interest and principal.
   *
   * One bar per phase, each the FIRST month of that phase — the grace tool's
   * own convention, stated in its assumption list, because inside an
   * amortizing stretch the total holds while the split keeps moving. A grace
   * phase has no principal segment at all, which is the whole point.
   */
  | { kind: "graceLoanPhases"; title: string; input: GraceLoanInput }
  /**
   * What each quarter of a term's payments is made of.
   *
   * The loan-analysis tool's own segment table, drawn: four bars of equal
   * duration and very unequal content. Built from `analyseLoan` so the
   * milestone months an article quotes (crossover, half-principal) come from
   * the same call as the picture.
   */
  | {
      kind: "loanCostQuarters";
      title: string;
      input: LoanAnalysisInput;
    };

/** A resolved visual: either a chart model, or a table with its own prose. */
export type EducationVisualModel =
  | { kind: "chart"; model: ChartModel }
  | {
      kind: "table";
      title: string;
      summary: string;
      assumptions: readonly string[];
      table: ChartTable;
      /** Set when the engine could not compute the declared hypothetical. */
      unavailable: string | null;
    };

/** Every label block a resolved visual may need, supplied by the caller. */
export type EducationVisualLabels = {
  money: MoneyWords;
  /** `LOAN.chart`. */
  loanChart: Parameters<typeof loanChartModel>[2];
  /** `FLOATING_LOAN.chart`. */
  floatingChart: Parameters<typeof floatingChartModel>[2];
  /** `SAVINGS_GOAL.chart`. */
  savingsChart: Parameters<typeof savingsChartModel>[2];
  /** `SAVINGS_GOAL.pathsChart` — the two-contribution comparison. */
  savingsPaths: Parameters<typeof savingsPathsModel>[2];
  /** `RENT_VS_BUY.scenarioChart` — the named house-growth assumptions. */
  rentBuyScenarios: Parameters<typeof rentBuyScenariosModel>[1];
  /** `EDUCATION_VISUAL_LABELS.debtPaths` — two balances falling together. */
  debtPaths: Parameters<typeof debtPathsModel>[2];
  /** `REFINANCE.chart` — the two signed ledgers over time. */
  refinanceChart: Parameters<typeof refinanceChartModel>[1];
  /** `AFFORDABILITY.priceChart`. */
  affordabilityPrice: Parameters<typeof priceCompositionModel>[1];
  /** `AFFORDABILITY.monthlyChart`. */
  affordabilityMonthly: Parameters<typeof monthlyAllocationModel>[2];
  /** `LOAN_COMPARE.costChart`. */
  compareCost: Parameters<typeof costBarsModel>[2];
  /** `LOAN_COMPARE.paymentChart`. */
  comparePayments: Parameters<typeof paymentTimelineModel>[2];
  /** `APR.chart` — the contract rate beside the fee-aware one. */
  aprRateBars: Parameters<typeof aprRateBarsModel>[3];
  /** `INTEREST_ONLY.paymentChart` — the instalment per phase. */
  graceLoanPhases: Parameters<typeof gracePaymentBarsModel>[1];
  /**
   * The quarter-composition bars.
   *
   * No calculator equivalent: `/cong-cu/phan-tich-khoan-vay/` prints its
   * quarters as a TABLE and reuses the mortgage tool's chart for the month
   * window, so the bar frame's own strings live in `visual-labels.ts` beside
   * `debtPaths`, which is here for the same reason.
   */
  loanCostQuarters: EducationQuarterLabels;
  /** The four table visuals' own strings. */
  tables: EducationTableLabels;
};

/** Strings for the quarter-composition bars. */
export type EducationQuarterLabels = BarFrameLabels & {
  /** `{n}`, `{from}`, `{to}` substituted: "Phần tư {n} — tháng {from}–{to}". */
  quarterBar: string;
  interestSegment: string;
  principalSegment: string;
  /**
   * `{firstShare}`, `{lastShare}`, `{crossover}`, `{total}` substituted.
   *
   * Every one of those is formatted by the resolver from the engine's own
   * fields, never interpolated raw — a share computed as `1 − a × b` is the
   * float-noise case docs §4 records.
   */
  summary: string;
  /** Appended always: these are the article's own assumptions, not a quote. */
  scenarioNote: string;
};

export type EducationTableLabels = {
  itemColumn: string;
  valueColumn: string;
  /** Heading of the column naming which assumption a row is about. */
  growthColumn: string;
  /** A row label per figure the four tables report. */
  rows: {
    /** `{rate}` substituted: "Giá nhà 3%/năm". */
    growthScenario: string;
    rentTotal: string;
    buyTotal: string;
    advantage: string;
    breakEven: string;
    houseValue: string;
    loanBalance: string;
    baseContribution: string;
    increasedContribution: string;
    baseMonths: string;
    increasedMonths: string;
    monthsSaved: string;
    baseBalance: string;
    increasedBalance: string;
    fixedPayment: string;
    floatingFirst: string;
    floatingHighest: string;
    fixedInterest: string;
    floatingInterest: string;
    breakEvenFixedRate: string;
    currentPayment: string;
    newPayment: string;
    monthlySaving: string;
    closingCosts: string;
    breakEvenMonths: string;
    lifetimeSaving: string;
    refinanceHorizon: string;
    refinanceCostSaving: string;
    refinanceCashSaving: string;
    refinanceOldBalance: string;
    refinanceNewBalance: string;
    /** `{month}` substituted: "Dư nợ ở tháng {month}". */
    debtAtMonth: string;
    /** Each option's own full term, never a common-horizon cost. */
    fullTermInterest: string;
    scheduledPayment: string;
    monthsToPayoff: string;
    interestSaved: string;
    actualFinalPayment: string;
    /** `{rate}` substituted. */
    promoPayment: string;
    /** `{rate}` substituted. */
    postPayment: string;
    /** `{rate}` substituted. */
    postFullTermInterest: string;
    fixedPaymentRow: string;
    fixedInterestRow: string;
    /** `{rate}` substituted: which floating scenario it is measured against. */
    breakEvenFixedRateAt: string;
  };
  /** One summary sentence per table visual. */
  summaries: {
    rentBuy: string;
    savingsCompare: string;
    fixedFloating: string;
    refinance: string;
    /**
     * C11's OWN summary, in place of the comparison tool's.
     *
     * The shared one ranks the options it was given and says which is
     * cheapest — true of the drawn subset, but the article's exact table
     * also lists a 9%/năm scenario that is cheaper still, so the tool's
     * sentence read as a claim the table contradicts. It also explains a
     * difference in terms (all four are 240 months here) and refers to fees
     * the reader entered (this article has no inputs). `{drawn}`,
     * `{alternative}` and `{term}` substituted.
     */
    fixedFloatingPaths: string;
  };
  assumptions: {
    rentBuy: readonly string[];
    savingsCompare: readonly string[];
    fixedFloating: readonly string[];
    refinance: readonly string[];
    /** For a debt-path figure whose table is an endpoint comparison. */
    debtPaths: readonly string[];
    /** For C11's payment paths, where the scenarios are named assumptions. */
    fixedFloatingPaths: readonly string[];
  };
  /** Captions for the exact tables the four new path figures carry. */
  captions: {
    loanTerms: string;
    extraPayment: string;
    fixedFloatingPaths: string;
    refinancePath: string;
  };
  /** Reading instructions for those tables. */
  hints: {
    loanTerms: string;
    extraPayment: string;
    fixedFloatingPaths: string;
    refinancePath: string;
  };
  /** Shown when the declared hypothetical does not compute. */
  unavailable: string;
  /** For a figure that has no answer, e.g. a break-even that never arrives. */
  none: string;
  monthsUnit: string;
};

/** A two-column table, built row by row. */
function tableOf(
  labels: EducationVisualLabels,
  caption: string,
  rows: [string, TableCell][],
): ChartTable {
  return {
    caption,
    columns: [
      { label: labels.tables.itemColumn },
      { label: labels.tables.valueColumn, numeric: true },
    ],
    rows,
  };
}

function emptyTable(
  spec: { title: string },
  labels: EducationVisualLabels,
): EducationVisualModel {
  return {
    kind: "table",
    title: spec.title,
    summary: labels.tables.unavailable,
    assumptions: [],
    table: tableOf(labels, spec.title, []),
    unavailable: labels.tables.unavailable,
  };
}

/**
 * Resolve a declared hypothetical into something renderable.
 *
 * Never throws and never returns a fabricated figure: a hypothetical the
 * engine rejects comes back as an `unavailable` table, so a broken article
 * shows an explanation rather than a blank or a guess.
 */
export function resolveEducationVisual(
  spec: EducationVisualSpec,
  labels: EducationVisualLabels,
): EducationVisualModel {
  const money = (value: number) => fullMoney(value, labels.money);
  const months = (value: number) =>
    `${formatDecimal(value, 0)} ${labels.tables.monthsUnit}`;

  switch (spec.kind) {
    case "loanColumns": {
      const result = computeLoan(spec.loan);
      return {
        kind: "chart",
        model: loanChartModel(result, spec.granularity, {
          ...labels.loanChart,
          title: spec.title,
        }),
      };
    }

    case "floatingTimeline": {
      const phases = buildPhases({
        termMonths: spec.termMonths,
        promoMonths: spec.promoMonths,
        promoRatePercent: spec.promoRatePercent,
        postRatePercent: spec.postRatePercent,
      });
      const result =
        phases === null
          ? null
          : computeFloatingLoan({ amount: spec.amount, phases });
      return {
        kind: "chart",
        model: floatingChartModel(result, spec.monthlyBudget ?? null, {
          ...labels.floatingChart,
          title: spec.title,
        }),
      };
    }

    case "savingsCurve": {
      const result = computeSavingsGoal(spec.goal);
      return {
        kind: "chart",
        // The mode travels with the spec: the schedule must not guess whether
        // to search for the funded cycle from whether a solve happened to
        // land on a whole month.
        model: savingsChartModel(
          result,
          spec.goal.annualRatePercent,
          { ...labels.savingsChart, title: spec.title },
          spec.goal.mode,
        ),
      };
    }

    case "affordabilityPrice": {
      const result = computeAffordability(spec.input);
      return {
        kind: "chart",
        model: priceCompositionModel(result, {
          ...labels.affordabilityPrice,
          title: spec.title,
        }),
      };
    }

    case "affordabilityMonthly": {
      const result = computeAffordability(spec.input);
      return {
        kind: "chart",
        model: monthlyAllocationModel(
          result,
          {
            netIncome: spec.input.monthlyNetIncome,
            essentialExpenses: spec.input.essentialExpenses,
            monthlyBuffer: spec.input.monthlyBuffer,
            monthlyDebts: spec.input.monthlyDebts,
          },
          { ...labels.affordabilityMonthly, title: spec.title },
        ),
      };
    }

    case "compareCost": {
      const comparison = compareLoans({
        amount: spec.amount,
        options: spec.options,
        // The article's own stated horizon, so its figures are the ones a
        // reader reproduces by setting the same month in the tool.
        horizonMonths: spec.horizonMonths,
      });
      return {
        kind: "chart",
        model: costBarsModel(comparison, spec.optionLabels, {
          ...labels.compareCost,
          title: spec.title,
        }),
      };
    }

    case "comparePayments": {
      const comparison = compareLoans({
        amount: spec.amount,
        options: spec.options,
      });
      return {
        kind: "chart",
        model: paymentTimelineModel(comparison, spec.optionLabels, {
          ...labels.comparePayments,
          title: spec.title,
        }),
      };
    }

    case "rentBuyScenarios": {
      const scenarios = compareGrowthScenarios(spec.input, [
        ...spec.growthPercents,
      ]);
      // Every declared assumption must compute: a scenario the engine refused
      // would leave a gap in a picture whose whole point is the comparison
      // between them.
      if (
        scenarios === null ||
        scenarios.length < 2 ||
        scenarios.some((scenario) => scenario.result === null)
      ) {
        return emptyTable(spec, labels);
      }
      const r = labels.tables.rows;
      // The exact endpoint reading, per assumption. It replaces the chart's
      // own per-month table: an article's reader reproduces the endpoint in
      // the tool, and the months are in the picture above it.
      const table: ChartTable = {
        caption: spec.title,
        columns: [
          { label: labels.tables.growthColumn },
          { label: r.buyTotal, numeric: true },
          { label: r.rentTotal, numeric: true },
          { label: r.advantage, numeric: true },
        ],
        rows: scenarios.map((scenario) => [
          fill(r.growthScenario, {
            rate: formatPercent(
              scenario.priceGrowthPercent,
              Number.isInteger(scenario.priceGrowthPercent) ? 0 : 2,
            ),
          }),
          moneyCell(scenario.result!.buy.netCost),
          moneyCell(scenario.result!.rent.netCost),
          // SIGNED, not absolute: negative is renting ahead, and which side
          // is ahead is the answer this table exists to give.
          moneyCell(scenario.result!.advantageOfBuying),
        ]),
      };
      return {
        kind: "chart",
        model: rentBuyScenariosModel(
          scenarios,
          { ...labels.rentBuyScenarios, title: spec.title },
          {
            table,
            // The chart's shared list explains what its per-month table does;
            // this figure's table has no month rows, so it carries the
            // article's own assumption list instead — the same reason C09's
            // override does.
            assumptions: labels.tables.assumptions.rentBuy,
          },
        ),
      };
    }

    case "savingsComparePaths": {
      const base = computeSavingsGoal(spec.base);
      const increased = computeSavingsGoal(spec.increased);
      if (base === null || increased === null) return emptyTable(spec, labels);
      // The CONSUMER answer is whole contribution cycles, from the same
      // schedule the tool's headline reads. The fractional solve is not a
      // number of contributions anyone can make, and the difference of two
      // fractions (7,409) is not the difference of two cycles (8).
      const baseSchedule = savingsScheduleFor(
        base,
        spec.base.annualRatePercent,
        spec.base.mode,
      );
      const increasedSchedule = savingsScheduleFor(
        increased,
        spec.increased.annualRatePercent,
        spec.increased.mode,
      );
      if (
        baseSchedule?.fundedMonth == null ||
        increasedSchedule?.fundedMonth == null
      ) {
        return emptyTable(spec, labels);
      }
      const r = labels.tables.rows;
      // The exact comparison, unchanged: it is now the figure's accessible
      // table rather than the figure itself.
      const table = tableOf(labels, spec.title, [
        [`${r.baseContribution} (${spec.baseLabel})`, money(base.contribution)],
        [
          `${r.increasedContribution} (${spec.increasedLabel})`,
          money(increased.contribution),
        ],
        [r.baseMonths, countCell(baseSchedule.fundedMonth)],
        [r.increasedMonths, countCell(increasedSchedule.fundedMonth)],
        [
          r.monthsSaved,
          countCell(baseSchedule.fundedMonth - increasedSchedule.fundedMonth),
        ],
        // The balance at each funded cycle, because it is NOT the target:
        // the cycle that first covers 500 triệu closes above it.
        [`${r.baseBalance} (${spec.baseLabel})`, moneyCell(baseSchedule.balance)],
        [
          `${r.increasedBalance} (${spec.increasedLabel})`,
          moneyCell(increasedSchedule.balance),
        ],
      ]);
      return {
        kind: "chart",
        model: savingsPathsModel(
          [
            {
              key: "base",
              label: spec.baseLabel,
              schedule: baseSchedule,
              initial: base.initial,
              contribution: base.contribution,
              monthlyRate: spec.base.annualRatePercent / 100 / 12,
            },
            {
              key: "increased",
              label: spec.increasedLabel,
              schedule: increasedSchedule,
              initial: increased.initial,
              contribution: increased.contribution,
              monthlyRate: spec.increased.annualRatePercent / 100 / 12,
            },
          ],
          base.target,
          { ...labels.savingsPaths, title: spec.title },
          {
            table,
            // The shared assumption list explains what the TOOL's per-month
            // table does past an attainment month. This figure's table is an
            // endpoint summary with no month rows, so inheriting that clause
            // would describe blank cells a reader cannot find.
            assumptions: labels.savingsPaths.assumptions,
          },
        ),
      };
    }

    case "fixedFloatingTable": {
      const phases = buildPhases({
        termMonths: spec.termMonths,
        promoMonths: spec.promoMonths,
        promoRatePercent: spec.promoRatePercent,
        postRatePercent: spec.postRatePercent,
      });
      const result =
        phases === null
          ? null
          : compareFixedFloating({
              amount: spec.amount,
              phases,
              fixedRatePercent: spec.fixedRatePercent,
            });
      if (result === null) return emptyTable(spec, labels);
      const r = labels.tables.rows;
      return {
        kind: "table",
        title: spec.title,
        summary: labels.tables.summaries.fixedFloating,
        assumptions: labels.tables.assumptions.fixedFloating,
        table: tableOf(labels, spec.title, [
          [r.fixedPayment, money(result.fixedPayment)],
          [r.floatingFirst, money(result.floating.firstPayment)],
          [r.floatingHighest, money(result.floating.highestPayment)],
          [r.fixedInterest, money(result.fixedTotalInterest)],
          [r.floatingInterest, money(result.floating.totalInterest)],
          [
            r.breakEvenFixedRate,
            result.breakEvenFixedRatePercent === null
              ? labels.tables.none
              : formatPercent(result.breakEvenFixedRatePercent, 2),
          ],
        ]),
        unavailable: null,
      };
    }

    case "loanTermDebtPaths": {
      // ORIGINAL C07: two debt paths from the SAME principal and rate, and
      // each term's own full-term interest beside them.
      const loans = spec.terms.map((termMonths) =>
        computeLoan({
          amount: spec.amount,
          annualRatePercent: spec.annualRatePercent,
          termMonths,
        }),
      );
      if (loans.some((loan) => loan === null)) return emptyTable(spec, labels);
      const priced = loans as NonNullable<(typeof loans)[number]>[];
      const r = labels.tables.rows;
      const table: ChartTable = {
        caption: labels.tables.captions.loanTerms,
        hint: labels.tables.hints.loanTerms,
        columns: [
          { label: labels.tables.itemColumn },
          ...spec.termLabels.map((label) => ({ label, numeric: true })),
        ],
        rows: [
          [
            r.scheduledPayment,
            ...priced.map((loan) => moneyCell(loan.monthlyPrincipalInterest)),
          ],
          [
            r.fullTermInterest,
            ...priced.map((loan) => moneyCell(loan.totalInterest)),
          ],
          ...spec.checkpoints.map((month) => [
            fill(r.debtAtMonth, { month: formatDecimal(month, 0) }),
            // A schedule that has ended owes nothing; `?? 0` would be wrong
            // for a month BEFORE it starts, and there is no such month here.
            ...priced.map((loan) =>
              moneyCell(loan.schedule[month - 1]?.balance ?? 0),
            ),
          ]),
        ],
      };
      return {
        kind: "chart",
        model: debtPathsModel(
          priced.map((loan, index) => ({
            key: `term-${spec.terms[index]}`,
            label: spec.termLabels[index],
            balances: loan.schedule.map((row) => row.balance),
            totalInterest: loan.totalInterest,
          })),
          spec.amount,
          { ...labels.debtPaths, title: spec.title },
          { table, assumptions: labels.tables.assumptions.debtPaths },
        ),
      };
    }

    case "extraPaymentDebtPaths": {
      // ORIGINAL C10: the no-extra baseline path beside the extra one, each
      // marked where it ends. The baseline is the article's own loan with the
      // extra removed, so nothing but the extra differs.
      const baseline = computeLoan({ ...spec.loan, extraPerMonth: 0 });
      const withExtra = computeLoan({
        ...spec.loan,
        extraPerMonth: spec.extraPerMonth,
      });
      if (baseline === null || withExtra === null) {
        return emptyTable(spec, labels);
      }
      const r = labels.tables.rows;
      const table: ChartTable = {
        caption: labels.tables.captions.extraPayment,
        hint: labels.tables.hints.extraPayment,
        columns: [
          { label: labels.tables.itemColumn },
          { label: spec.baselineLabel, numeric: true },
          { label: spec.extraLabel, numeric: true },
        ],
        rows: [
          [
            r.monthsToPayoff,
            countCell(baseline.months),
            countCell(withExtra.months),
          ],
          [
            r.fullTermInterest,
            moneyCell(baseline.totalInterest),
            moneyCell(withExtra.totalInterest),
          ],
          // A figure that exists on ONE path only is mounted with the
          // placeholder on the other, never with a 0 that reads as a real
          // saving of nothing.
          [
            r.interestSaved,
            null,
            moneyCell(baseline.totalInterest - withExtra.totalInterest),
          ],
          [
            r.monthsSaved,
            null,
            countCell(baseline.months - withExtra.months),
          ],
          ...spec.checkpoints.map((month) => [
            fill(r.debtAtMonth, { month: formatDecimal(month, 0) }),
            moneyCell(baseline.schedule[month - 1]?.balance ?? 0),
            moneyCell(withExtra.schedule[month - 1]?.balance ?? 0),
          ]),
          [
            r.actualFinalPayment,
            moneyCell(baseline.actualFinalPrincipalInterest),
            moneyCell(withExtra.actualFinalPrincipalInterest),
          ],
        ],
      };
      return {
        kind: "chart",
        model: debtPathsModel(
          [
            {
              key: "baseline",
              label: spec.baselineLabel,
              balances: baseline.schedule.map((row) => row.balance),
              totalInterest: baseline.totalInterest,
            },
            {
              key: "extra",
              label: spec.extraLabel,
              balances: withExtra.schedule.map((row) => row.balance),
              totalInterest: withExtra.totalInterest,
            },
          ],
          spec.loan.amount,
          { ...labels.debtPaths, title: spec.title },
          { table, assumptions: labels.tables.assumptions.debtPaths },
        ),
      };
    }

    case "fixedFloatingPaths": {
      // ORIGINAL C11: both instalment paths, under more than one named
      // post-promotional assumption. Built from the loan COMPARISON — the
      // primitive the consolidated row-12 route uses — so the article and
      // the tool price a promotional reset the same way.
      const fixedOption: LoanOption = {
        annualRatePercent: spec.fixedRatePercent,
        termMonths: spec.termMonths,
      };
      const floating = (postRatePercent: number): LoanOption => ({
        annualRatePercent: postRatePercent,
        termMonths: spec.termMonths,
        promoMonths: spec.promoMonths,
        promoRatePercent: spec.promoRatePercent,
      });
      const fixedLabel = fill(labels.tables.rows.fixedPaymentRow, {
        rate: formatPercent(spec.fixedRatePercent, 2),
      });
      // Two calls to ONE engine: the drawn scenarios, and every named
      // scenario the table reports. The horizon is left to default, which is
      // the longest term — so "cost at the horizon" IS the full term here
      // and the two measures cannot disagree in this figure.
      const drawn = compareLoans({
        amount: spec.amount,
        options: [fixedOption, ...spec.drawnPostRatePercents.map(floating)],
      });
      const all = compareLoans({
        amount: spec.amount,
        options: [fixedOption, ...spec.postRatePercents.map(floating)],
      });
      // Against the DECLARED scenario, because a break-even fixed rate is
      // the rate that matches one particular floating path's full-term
      // interest — it is a different number for each post-rate assumption.
      const breakEven = compareFixedFloating({
        amount: spec.amount,
        phases:
          buildPhases({
            termMonths: spec.termMonths,
            promoMonths: spec.promoMonths,
            promoRatePercent: spec.promoRatePercent,
            postRatePercent: spec.declaredPostRatePercent,
          }) ?? [],
        fixedRatePercent: spec.fixedRatePercent,
      });
      if (drawn === null || all === null) return emptyTable(spec, labels);
      const fixedRow = all.rows[0];
      if (fixedRow === null) return emptyTable(spec, labels);
      const r = labels.tables.rows;
      const rows: [string, TableCell][] = [
        [fixedLabel, moneyCell(fixedRow.monthlyPayment)],
        [
          fill(r.fixedInterestRow, {
            rate: formatPercent(spec.fixedRatePercent, 2),
          }),
          moneyCell(fixedRow.totalInterest),
        ],
        [
          fill(r.promoPayment, {
            rate: formatPercent(spec.promoRatePercent, 2),
          }),
          moneyCell(all.rows[1]?.monthlyPayment ?? 0),
        ],
      ];
      spec.postRatePercents.forEach((rate, index) => {
        const row = all.rows[index + 1];
        if (row === null || row === undefined) return;
        const rateText = formatPercent(rate, 2);
        rows.push([fill(r.postPayment, { rate: rateText }), moneyCell(row.resetPayment)]);
        rows.push([
          fill(r.postFullTermInterest, { rate: rateText }),
          moneyCell(row.totalInterest),
        ]);
      });
      if (breakEven?.breakEvenFixedRatePercent != null) {
        rows.push([
          fill(r.breakEvenFixedRateAt, {
            rate: formatPercent(spec.declaredPostRatePercent, 2),
          }),
          percentCell(breakEven.breakEvenFixedRatePercent, 2),
        ]);
      }
      const labelsForDrawn = [
        fixedLabel,
        ...spec.drawnPostRatePercents.map((rate) =>
          fill(r.postPayment, { rate: formatPercent(rate, 2) }),
        ),
      ];
      const model = paymentTimelineModel(drawn, labelsForDrawn, {
        ...labels.comparePayments,
        title: spec.title,
        assumptions: labels.tables.assumptions.fixedFloatingPaths,
      });
      // THE TOOL'S SUMMARY IS THE WRONG SENTENCE HERE. It ranks the options
      // it was handed and names a cheapest, but the exact table below also
      // lists a scenario that is cheaper than any drawn one; it explains a
      // term difference that does not exist in this figure; and it refers to
      // fees the reader entered, on a page with no inputs.
      const undrawn = spec.postRatePercents.filter(
        (rate) => !spec.drawnPostRatePercents.includes(rate),
      );
      model.summary = fill(labels.tables.summaries.fixedFloatingPaths, {
        drawn: spec.drawnPostRatePercents
          .map((rate) => formatPercent(rate, 2))
          .join(" và "),
        alternative: undrawn.map((rate) => formatPercent(rate, 2)).join(" và "),
        term: formatDecimal(spec.termMonths, 0),
      });
      // The picture carries the drawn scenarios; the exact table carries
      // EVERY named one, as an item/value list rather than a per-series
      // table, so there is no row that claims to be a line.
      model.table = {
        caption: labels.tables.captions.fixedFloatingPaths,
        hint: labels.tables.hints.fixedFloatingPaths,
        columns: [
          { label: labels.tables.itemColumn },
          { label: labels.tables.valueColumn, numeric: true },
        ],
        rows,
      };
      return { kind: "chart", model };
    }

    case "refinanceCostPath": {
      // ORIGINAL C12: the signed path over time with TWO break-evens kept
      // apart. Same engine and same adapter as the tool; only the table's
      // checkpoints are the article's own.
      const result = compareRefinance(spec.input);
      if (result === null) return emptyTable(spec, labels);
      const c = labels.refinanceChart;
      const model = refinanceChartModel(result, {
        ...c,
        title: spec.title,
        tableCaption: labels.tables.captions.refinancePath,
      });
      model.table = {
        caption: labels.tables.captions.refinancePath,
        hint: labels.tables.hints.refinancePath,
        mobileCards: true,
        columns: [
          { label: c.monthColumn, numeric: true },
          { label: c.savingColumn, numeric: true },
          { label: c.cashColumn, numeric: true },
          { label: c.oldDebtColumn, numeric: true },
          { label: c.newDebtColumn, numeric: true },
        ],
        rows: [
          ...new Set([
            ...spec.checkpoints,
            ...(result.breakEvenMonths === null ? [] : [result.breakEvenMonths]),
            ...(result.cashFlowBreakEvenMonths === null
              ? []
              : [result.cashFlowBreakEvenMonths]),
          ]),
        ]
          .filter((month) => result.timeline[month] !== undefined)
          .sort((a, b) => a - b)
          .map((month) => {
            const row = result.timeline[month];
            return [
              countCell(month),
              moneyCell(row.costSaving),
              moneyCell(row.cashFlowSaving),
              moneyCell(row.currentBalance),
              moneyCell(row.newBalance),
            ];
          }),
      };
      return { kind: "chart", model };
    }

    case "aprRateBars": {
      const result = computeApr(spec.input);
      // Two separate failures, both of which the adapter would render as its
      // own empty figure. They are caught here instead so a broken article
      // shows the COLLECTION's explanation — "this is the article's fault,
      // not yours" — rather than the tool's "check your inputs", which is
      // advice a reader of an article has no inputs to act on.
      if (result === null || result.aprPercent === null) {
        return emptyTable(spec, labels);
      }
      return {
        kind: "chart",
        model: aprRateBarsModel(
          result,
          spec.input.annualRatePercent,
          spec.input.amount,
          { ...labels.aprRateBars, title: spec.title },
        ),
      };
    }

    case "graceLoanPhases": {
      const result = computeGraceLoan(spec.input);
      if (result === null || result.phases.length === 0) {
        return emptyTable(spec, labels);
      }
      return {
        kind: "chart",
        model: gracePaymentBarsModel(result, {
          ...labels.graceLoanPhases,
          title: spec.title,
        }),
      };
    }

    case "loanCostQuarters": {
      const analysis = analyseLoan(spec.input);
      if (analysis === null || analysis.segments.length === 0) {
        return emptyTable(spec, labels);
      }
      const q = labels.loanCostQuarters;
      const bars = analysis.segments.map((seg) =>
        barOf(
          `quarter-${seg.quarter}`,
          fill(q.quarterBar, {
            n: formatDecimal(seg.quarter, 0),
            from: formatDecimal(seg.fromMonth, 0),
            to: formatDecimal(seg.toMonth, 0),
          }),
          [
            segment("interest", q.interestSegment, seg.interest, q),
            segment("principal", q.principalSegment, seg.principal, q),
          ],
          q,
          // The bar the article is about: the first quarter in which a payment
          // finally repays more principal than interest.
          analysis.crossoverMonth !== null &&
            seg.fromMonth <= analysis.crossoverMonth &&
            analysis.crossoverMonth <= seg.toMonth,
        ),
      );
      // Every share goes through `formatPercent`, so a value the engine
      // computed as 77.19808897721812 is quoted as one rounded string in both
      // the sentence and any test that pins it.
      const summary =
        fill(q.summary, {
          firstShare: formatPercent(
            analysis.segments[0].interestSharePercent,
            1,
          ),
          lastShare: formatPercent(
            analysis.segments[analysis.segments.length - 1]
              .interestSharePercent,
            1,
          ),
          crossover:
            analysis.crossoverMonth === null
              ? labels.tables.none
              : formatDecimal(analysis.crossoverMonth, 0),
          total: fullMoney(analysis.loan.totalInterest, labels.money),
        }) + ` ${q.scenarioNote}`;
      return {
        kind: "chart",
        model: finishBars(
          bars,
          [
            { key: "interest", label: q.interestSegment },
            { key: "principal", label: q.principalSegment },
          ],
          q.axis,
          q,
          {
            title: spec.title,
            summary,
            assumptions: q.assumptions,
            tableCaption: q.tableCaption,
            itemColumn: q.itemColumn,
            amountColumn: q.amountColumn,
          },
        ),
      };
    }

    case "refinanceTable": {
      const result = compareRefinance(spec.input);
      if (result === null) return emptyTable(spec, labels);
      const r = labels.tables.rows;
      return {
        kind: "table",
        title: spec.title,
        summary: labels.tables.summaries.refinance,
        assumptions: labels.tables.assumptions.refinance,
        table: tableOf(labels, spec.title, [
          [r.refinanceHorizon, months(result.horizonMonths)],
          [r.refinanceCostSaving, moneyCell(result.horizonCostSaving)],
          [r.refinanceCashSaving, moneyCell(result.horizonCashFlowSaving)],
          [r.refinanceOldBalance, moneyCell(result.horizon.currentBalance)],
          [r.refinanceNewBalance, moneyCell(result.horizon.newBalance)],
          [r.currentPayment, moneyCell(result.currentPayment)],
          [r.newPayment, moneyCell(result.newPayment)],
          [r.monthlySaving, moneyCell(result.monthlySaving)],
          [r.closingCosts, moneyCell(result.closingCosts)],
          [
            r.breakEvenMonths,
            result.breakEvenMonths === null
              ? labels.tables.none
              : months(result.breakEvenMonths),
          ],
          [r.lifetimeSaving, moneyCell(result.lifetimeSaving)],
        ]),
        unavailable: null,
      };
    }
  }
}
