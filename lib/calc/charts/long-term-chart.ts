/**
 * The long-term plan's two line figures, for rows 44 and 50.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `long-term-chart.test.ts`.
 *
 * Row 44 asks for "accumulation / drawdown / depletion" and row 50 for
 * "remaining-capital lines". Both are the same picture shape — a capital
 * balance falling and rising over the plan's own years — so they are one
 * adapter with two entry points rather than two, and both go through
 * `valuePathsModel`.
 *
 * ## The x axis is DATES, in years from the start, and it starts at TODAY
 *
 * `valuePathsModel` (and the geometry under it) places a period at
 * `period / xMax`, which assumes an axis that starts at zero. An axis of AGES
 * does not: a plan from 35 to 85 would put its first point 41% of the way
 * across the plot. So the coordinate is years elapsed and the age is a label —
 * and since 2026-09-26 the age is EVERY label a reader sees: the tick labels
 * (`xTickLabel`), the markers and the table's first column all say the age at
 * that date, so nobody is asked to add their own age to "năm thứ 13". The
 * reader-first review measured that arithmetic as the figure's main cost.
 *
 * WHICH INSTANT EACH POINT IS was wrong in the first version, and an
 * independent review measured it: `RetirementYear` is an END-of-year row, so
 * mapping `age − currentAge` put the balance after a full year of
 * contributions and growth at period 0 — 121 triệu displayed as today on a
 * plan that starts with 100 triệu — and made a five-year horizon end at 4.
 * Worse, the retirement marker then landed on the end of the first
 * RETIREMENT year (94,1 triệu) rather than on the capital at the retirement
 * date (144,1 triệu), which is the figure the whole view is about.
 *
 * The timeline now is: **period p is the date p years from the start**, where
 * the start is today for the trajectory and the retirement date for the
 * withdrawal paths. So:
 *
 * - period 0 carries the TRUE opening capital — `currentBalance` for the
 *   trajectory, `balanceAtRetirement` for the drawdown — and is not an engine
 *   row at all;
 * - an engine row for age `a` is the end of that year, which is the date
 *   `a − start + 1`;
 * - the age at period p is `startAge + p`, so the retirement marker sits at
 *   `retirementAge − currentAge` where the capital at retirement is, and the
 *   depletion marker sits at `depletionAge − startAge`, the START of the year
 *   the plan could not pay in full;
 * - `xMax` is the full span — `endAge − currentAge` — so a five-year plan
 *   ends at 5.
 *
 * ## Both readings of one balance, never two funds
 *
 * The trajectory figure draws the balance in today's money AND in the money
 * of each year, which is the same pair `withdrawal-chart.ts` draws for row 26
 * and for the same reason: a plan that looks healthy in nominal terms can have
 * lost a third of its purchasing power, and the gap between the lines IS the
 * lesson. The summary says which is which, and the assumptions say the real
 * line is the nominal one deflated — not a second portfolio. The summary's
 * amounts are ROUNDED through `compactMoneyPair` ("10,9 tỷ" beside "4,1 tỷ"),
 * because a caption is prose; the exact đồng figures are the table's, and the
 * pair falls back to exact when rounding alone would make two different
 * amounts read as one.
 *
 * ## It computes nothing
 *
 * Every point is a `RetirementYear` the engine already produced, and every
 * headline is a field of `RetirementResult` or of `LongTermPlan`. The
 * depletion marker is the engine's `depletionAge`; this module never searches
 * for a zero crossing of its own.
 */

import {
  compactMoney,
  compactMoneyPair,
  fill,
  fullMoney,
} from "@/lib/calc/charts/labels";
import { formatDecimal } from "@/lib/calc/number";
import type { ChartMarkTone, LineChartModel } from "@/lib/calc/charts/types";
import {
  valuePathsModel,
  type ValuePath,
  type ValuePathsLabels,
} from "@/lib/calc/charts/value-paths-chart";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import { fundedAtBoundary } from "@/lib/calc/long-term-plan";
import type { LongTermPlan, WithdrawalPath } from "@/lib/calc/long-term-plan";
import type { RetirementResult } from "@/lib/calc/retirement";

export type LongTermTrajectoryLabels = ValuePathsLabels & {
  /** The balance in today's money. */
  realPath: string;
  /** The same balance in the money of each year. */
  nominalPath: string;
  /** `{age}` and `{year}` substituted — the age AND the year it falls in. */
  retirementMarker: string;
  /** `{age}`, `{year}` substituted. Only when the money runs out. */
  depletionMarker: string;
  /** `{age}`, `{year}` substituted. The end of the projection. */
  horizonMarker: string;
  /**
   * `{startAge}`, `{startCapital}`, `{retirementAge}`, `{capital}`,
   * `{realCapital}`, `{endAge}` substituted. Used when the plan lasts. The
   * amounts arrive rounded (see the module header).
   */
  summaryFunded: string;
  /**
   * `{startAge}`, `{startCapital}`, `{retirementAge}`, `{capital}`,
   * `{realCapital}`, `{depletionAge}`, `{yearsShort}` substituted. Used when
   * it does not.
   */
  summaryDepleted: string;
  /**
   * The partial payment in the depletion year.
   * `{planned}`, `{paid}`, `{short}` substituted.
   *
   * NOT appended to the summary any more — it is the figure's `detail`, behind
   * a disclosure whose summary line is `partialTitle`.
   */
  partialNote: string;
  /** The disclosure's own line, so `partialNote` is never an unlabelled toggle. */
  partialTitle: string;
  /** Appended when other income covers the whole spend. */
  otherIncomeNote: string;
  /** Always appended: the two lines are one balance. */
  readingNote: string;
  ageColumn: string;
  yearColumn: string;
  realColumn: string;
  nominalColumn: string;
  /**
   * The unmet span, named — 2026-09-27 result-status plan.
   * `{depletionAge}`, `{endAge}`, `{yearsShort}` substituted. Drawn as a band
   * from the depletion date to the horizon and listed in words beside the
   * figure; only when the plan falls short.
   */
  unmetBand: string;
  /** The table's fifth column on a short plan, and its four cell words. */
  statusColumn: string;
  statusSaving: string;
  statusCovered: string;
  statusDepletes: string;
  statusUnmet: string;
};

export type LongTermWithdrawalLabels = ValuePathsLabels & {
  /** One per path key, in the same order the plan resolves them. */
  asEnteredPath: string;
  sustainablePath: string;
  longerLifePath: string;
  /** `{age}`, `{year}`, `{path}` substituted. */
  depletionMarker: string;
  /** `{spending}`, `{sustainable}` substituted. */
  summary: string;
  /** Appended when the entered spend already lasts. */
  lastsNote: string;
  /** Appended when it does not. `{age}` substituted. */
  runsOutNote: string;
  /** Always appended: every path is the same capital, spent differently. */
  sameCapitalNote: string;
  /** Column headings: the path, the age it runs out, what is left. */
  ageColumn: string;
  yearColumn: string;
  realColumn: string;
  /** The cell for a path that never runs out — not a blank, not a 0. */
  lastsCell: string;
};

/**
 * Table rows the optional fill aims at, so the block reads at 390 px.
 *
 * A CEILING ON THE FILL, not on the table. See `checkpoints`.
 */
const TARGET_TABLE_ROWS = 8;

/**
 * Whole years the table reports: the ones that MATTER, then a bounded fill.
 *
 * The first version collected mandatory and optional years into one set,
 * sorted it and sliced the first eight — which silently dropped whatever
 * sorted last, and what sorts last is the horizon. An independent review
 * reproduced it on a 35 → 41 → 85 plan: the rows came out
 * [0, 6, 9, 11, 18, 27, 36, 45] and year 49, the end of the plan, was gone;
 * 15 of 35 tested retirement ages lost their horizon the same way.
 *
 * So mandatory years are selected FIRST and are never truncated — a table
 * missing the end of the plan, or the retirement date, is missing an answer,
 * and an arbitrary row count is not a reason to drop one. The optional fill
 * then takes whatever room is left, which can be none.
 */
function checkpoints(span: number, mandatory: readonly number[]): number[] {
  const required = new Set<number>([0, span]);
  for (const year of mandatory) {
    if (Number.isSafeInteger(year) && year >= 0 && year <= span) {
      required.add(year);
    }
  }
  const optional = new Set<number>();
  const room = Math.max(0, TARGET_TABLE_ROWS - required.size);
  if (room > 0) {
    const stride = Math.max(1, Math.ceil(span / (room + 1)));
    for (let year = stride; year < span; year += stride) {
      if (required.has(year) || optional.has(year)) continue;
      if (optional.size >= room) break;
      optional.add(year);
    }
  }
  return [...new Set([...required, ...optional])].sort((a, b) => a - b);
}

/**
 * A balance at the currency's own resolution.
 *
 * đồng has no circulating subunit — `formatMoney`'s `dp` defaults to 0 for
 * exactly that reason — so a figure below one đồng is not a quantity of đồng,
 * it is the arithmetic that produced it. The sustainable withdrawal path is
 * solved to exhaust its capital, and that solve lands on 1,127e-6 đồng rather
 * than on nothing.
 *
 * Handed over raw, `moneyCell` did the right thing with a tiny non-zero (it
 * refuses to print one as 0) and the table's last column read `0` / `< 1` /
 * `0` — so the single path that LASTS appeared to have more left than the two
 * that run out of money. Quantising here keeps "< 1" for its real job: an
 * amount small enough to surprise a reader but large enough to exist.
 *
 * Deliberately not pushed down into `moneyCell`, which has many consumers and
 * whose sub-unit handling is documented and wanted elsewhere.
 */
const inDong = (value: number): number => Math.round(value);

/** Years elapsed at an age, which is the drawn coordinate. */
const elapsedAt = (result: RetirementResult, age: number) =>
  age - result.years[0].age;

/**
 * Row 44's figure: the whole plan, in both readings of the balance.
 *
 * `unavailable` when there is nothing to draw — a plan needs at least two
 * years, and the engine already refuses a horizon that short.
 */
export function longTermTrajectoryModel(
  plan: LongTermPlan | null,
  labels: LongTermTrajectoryLabels,
): LineChartModel {
  if (plan === null || plan.asEntered.years.length < 2) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const result = plan.asEntered;
  const startAge = plan.input.currentAge;
  // The full span, so the last engine row (end of endAge − 1) lands on the
  // horizon date and a five-year plan ends at 5.
  const span = plan.input.endAge - startAge;

  /** Date of an engine row: its year END, one year after that year began. */
  const dateOf = (age: number) => age - startAge + 1;

  const paths: ValuePath[] = [
    {
      key: "real",
      label: labels.realPath,
      points: [
        // TODAY's capital, which is not an engine row: the first row is the
        // end of the first year. In today's money the two readings coincide.
        { period: 0, value: plan.input.currentBalance },
        ...result.years.map((year) => ({
          period: dateOf(year.age),
          value: year.realBalance,
        })),
      ],
      area: true,
    },
    {
      key: "nominal",
      label: labels.nominalPath,
      points: [
        { period: 0, value: plan.input.currentBalance },
        ...result.years.map((year) => ({
          period: dateOf(year.age),
          value: year.balance,
        })),
      ],
    },
  ];

  const retirementDate = Math.max(0, plan.input.retirementAge - startAge);
  const markers: { period: number; label: string; tone?: ChartMarkTone }[] = [
    {
      // The retirement DATE, where `balanceAtRetirement` sits — the end of
      // the last accumulation year is the same instant.
      period: retirementDate,
      label: fill(labels.retirementMarker, {
        age: String(plan.input.retirementAge),
        year: String(retirementDate),
      }),
    },
  ];
  // The plan's FUNDED verdict, not a bare `depletionAge` — the same policy the
  // page's own verdict row and the withdrawal figure already read.
  //
  // This branched on `result.depletionAge` alone until it was caught, and the
  // cost was a figure that contradicted the page above it AND itself: on a
  // plan funded to within four millionths of one đồng it read "cạn ở tuổi 84,
  // thiếu 1 năm" and then, in the very next sentence, "năm cạn cần
  // 410.128.666 ₫, chỉ trả được 410.128.666 ₫, thiếu 0 ₫". A policy the model
  // owns is not a policy the product keeps until every presenter reads it.
  const funded = fundedAtBoundary(result, plan.input.endAge).funded;
  const depletionAge = funded ? null : result.depletionAge;
  if (depletionAge !== null) {
    // The START of the year the plan could not pay in full, which is what
    // "cạn ở tuổi X" means. Toned: this rule IS the answer's shortfall.
    markers.push({
      period: depletionAge - startAge,
      label: fill(labels.depletionMarker, {
        age: String(depletionAge),
        year: String(depletionAge - startAge),
      }),
      tone: "shortfall",
    });
  } else {
    markers.push({
      period: span,
      label: fill(labels.horizonMarker, {
        age: String(plan.input.endAge),
        year: String(span),
      }),
    });
  }

  // Rounded for the caption; exact in the table. The pair helper keeps two
  // different amounts from reading as one when a decimal place is not enough
  // to separate them — a 0,1% inflation plan is the case.
  const [capital, realCapital] = compactMoneyPair(
    result.balanceAtRetirement,
    result.realBalanceAtRetirement,
    labels,
  );
  const shared = {
    startAge: String(startAge),
    startCapital: compactMoney(plan.input.currentBalance, labels),
    retirementAge: String(plan.input.retirementAge),
    capital,
    realCapital,
  };
  let summary =
    funded
      ? fill(labels.summaryFunded, {
          ...shared,
          endAge: String(plan.input.endAge),
        })
      : fill(labels.summaryDepleted, {
          ...shared,
          depletionAge: String(result.depletionAge),
          yearsShort: String(result.yearsShort),
        });

  if (result.fundedByOtherIncome) summary += ` ${labels.otherIncomeNote}`;
  summary += ` ${labels.readingNote}`;

  /**
   * The depletion year's PARTIAL payment — three more formatted amounts.
   *
   * It used to be appended to `summary`, which put nine đồng figures in one
   * paragraph above the plot. It is worked arithmetic about the figure rather
   * than a caveat, so it moved behind the figure's labelled disclosure; the
   * same three amounts are also rows in the page's own detail group.
   */
  const detail =
    result.lastWithdrawalShortfall !== null &&
    result.lastWithdrawalPlanned !== null &&
    result.lastWithdrawalPaid !== null
      ? {
          title: labels.partialTitle,
          body: fill(labels.partialNote, {
            planned: fullMoney(result.lastWithdrawalPlanned, labels),
            paid: fullMoney(result.lastWithdrawalPaid, labels),
            short: fullMoney(result.lastWithdrawalShortfall, labels),
          }),
        }
      : null;

  const mandatory = [
    retirementDate,
    // Same funded verdict as the marker and the summary above. A plan forgiven
    // at the boundary has no depletion year, so reserving a mandatory table
    // row for one would spend a row of an eight-row budget on a date the rest
    // of the page says does not exist.
    ...(funded || result.depletionAge === null
      ? []
      : [result.depletionAge - startAge]),
  ];
  /** The two balances AT a date, from the same points the lines are drawn from. */
  const balancesAt = (date: number) => {
    if (date === 0) {
      return { real: plan.input.currentBalance, nominal: plan.input.currentBalance };
    }
    const row = result.years.find((entry) => dateOf(entry.age) === date);
    return row === undefined
      ? null
      : { real: row.realBalance, nominal: row.balance };
  };

  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    mobileCards: true,
    columns: [
      { label: labels.ageColumn, numeric: true, nowrap: true },
      { label: labels.yearColumn, numeric: true, nowrap: true },
      { label: labels.realColumn, numeric: true },
      { label: labels.nominalColumn, numeric: true },
      // The figure's band, as a column: a short plan's table says which rows
      // are covered and which are not, so the picture and its text agree.
      ...(depletionAge === null ? [] : [{ label: labels.statusColumn }]),
    ],
    rows: checkpoints(span, mandatory).flatMap((date) => {
      const balances = balancesAt(date);
      if (balances === null) return [];
      const age = startAge + date;
      return [
        [
          // The age AT that date, which is what makes the row readable: at
          // date 0 it is today's age, and at the retirement date it is the
          // retirement age.
          countCell(age),
          countCell(date),
          moneyCell(balances.real),
          moneyCell(balances.nominal),
          ...(depletionAge === null
            ? []
            : [
                age < plan.input.retirementAge
                  ? labels.statusSaving
                  : age < depletionAge
                    ? labels.statusCovered
                    : age === depletionAge
                      ? labels.statusDepletes
                      : labels.statusUnmet,
              ]),
        ],
      ];
    }),
  };

  const model = valuePathsModel(paths, labels, {
    summary,
    detail,
    markers,
    table,
    // The axis READS in ages while it is DRAWN in years elapsed; see the
    // module header. A fractional tick cannot occur here (every period is a
    // whole year), but the formatter says what it would do if one did.
    xTickLabel: (period) =>
      formatDecimal(startAge + period, Number.isInteger(period) ? 0 : 1),
  });

  /**
   * The years the plan does not pay for, from the START of the depletion year
   * to the horizon. A span, not a negative balance: the engine stops the fund
   * at zero, and drawing a debt below the axis would invent one.
   */
  const bands =
    depletionAge === null || model.unavailable !== null
      ? []
      : [
          {
            from: depletionAge - startAge,
            to: span,
            tone: "shortfall" as const,
            label: fill(labels.unmetBand, {
              depletionAge: String(depletionAge),
              endAge: String(plan.input.endAge),
              yearsShort: String(result.yearsShort),
            }),
          },
        ];
  return { ...model, bands };
}

/**
 * Row 50's figure: the same capital, spent three ways.
 *
 * Every path is drawn in TODAY's money, because the comparison is between
 * spends and a nominal axis would make the longest-lived path look richest
 * simply for ending later. `unavailable` when there is no plan.
 */
export function longTermWithdrawalModel(
  plan: LongTermPlan | null,
  labels: LongTermWithdrawalLabels,
): LineChartModel {
  if (plan === null || plan.withdrawal.paths.length === 0) {
    return valuePathsModel([], labels, { summary: labels.unavailableReason });
  }

  const nameOf = (key: WithdrawalPath["key"]) =>
    key === "asEntered"
      ? labels.asEnteredPath
      : key === "sustainable"
        ? labels.sustainablePath
        : labels.longerLifePath;

  // Only the retirement years: the accumulation phase is identical on every
  // path, so drawing it three times would say the plans differ before they
  // do. Period 0 is the RETIREMENT DATE, carrying the capital that arrives
  // there — not the end of the first retirement year, which is period 1.
  const startAge = plan.input.retirementAge;

  const paths: ValuePath[] = plan.withdrawal.paths.map((path) => ({
    key: path.key,
    label: nameOf(path.key),
    points: [
      // The capital at the retirement date, in today's money. Identical on
      // every path by construction: they share the accumulation phase.
      { period: 0, value: path.projection.realBalanceAtRetirement },
      ...path.projection.years
        .filter((year) => year.age >= startAge)
        .map((year) => ({
          period: year.age - startAge + 1,
          value: year.realBalance,
        })),
    ],
    area: path.key === "asEntered",
  }));

  const markers = plan.withdrawal.paths.flatMap((path) =>
    // The path's own FUNDED verdict, not a raw `depletionAge`: a sustainable
    // spend forgiven at the float boundary must not be marked as running out
    // in its final year. See `fundedAtBoundary`.
    path.funded || path.projection.depletionAge === null
      ? []
      : [
          {
            // The START of the year that could not be paid in full.
            period: path.projection.depletionAge - startAge,
            label: fill(labels.depletionMarker, {
              age: String(path.projection.depletionAge),
              year: String(path.projection.depletionAge - startAge),
              path: nameOf(path.key),
            }),
          },
        ],
  );

  let summary = fill(labels.summary, {
    spending: fullMoney(plan.input.desiredAnnualSpending, labels),
    sustainable: fullMoney(plan.withdrawal.sustainableSpending ?? 0, labels),
  });
  const entered = plan.withdrawal.paths[0];
  summary +=
    entered.funded
      ? ` ${labels.lastsNote}`
      : ` ${fill(labels.runsOutNote, {
          age: String(plan.asEntered.depletionAge),
        })}`;
  summary += ` ${labels.sameCapitalNote}`;

  // One row per path: the spend, the age the money runs out, and what is left
  // at that path's own horizon. A table of balances per year would be three
  // times the length for no extra answer.
  const table = {
    caption: labels.tableCaption,
    hint: labels.tableHint,
    columns: [
      { label: labels.ageColumn },
      { label: labels.yearColumn, numeric: true },
      { label: labels.realColumn, numeric: true },
    ],
    rows: plan.withdrawal.paths.map((path) => [
      nameOf(path.key),
      // The funded verdict again, so the sustainable path reads "không cạn"
      // rather than naming its final year over a 1,5e-8 đồng residue.
      path.funded
        ? labels.lastsCell
        : countCell(path.projection.depletionAge ?? 0),
      moneyCell(inDong(path.projection.realFinalBalance)),
    ]),
  };

  return valuePathsModel(paths, labels, { summary, markers, table });
}

/** Years elapsed at an age, exported for a consumer that labels its own row. */
export { elapsedAt as longTermElapsedAt };
