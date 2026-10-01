"use client";

import { displayable } from "@/components/calc/accumulation";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultStatusCard, type StatusView } from "@/components/calc/result-status";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { CHART_UI } from "@/content/calculators/chart-ui";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { DetailFigures } from "@/components/calc/detail-figures";
import { fill } from "@/lib/calc/charts/labels";
import {
  countCell,
  moneyCell,
  percentCell,
  type TableCell,
} from "@/lib/calc/table-cell";
import {
  costBarsModel,
  paymentTimelineModel,
} from "@/lib/calc/charts/compare-chart";
import {
  MAX_COMPARE_MONTHS,
  compareLoans,
  type LoanComparisonRow,
  type LoanOption,
} from "@/lib/calc/loan-compare";
import { LOAN_COMPARE as C } from "@/content/calculators/loan-compare";
import { FIXED_VS_FLOATING as F } from "@/content/calculators/fixed-vs-floating";
import { LOAN_COMPARE_LEARNING as LL } from "@/content/calculators/loan-compare-learning";
import {
  compareLimit,
  compareGuard,
  compareLanesView,
  lowestFirstPayment,
  namesOf,
  type CompareLimitKey,
} from "@/components/loan-compare-learning";
import { LoanCompareLearningPanel } from "@/components/loan-compare-learning-panel";

/**
 * Which question the comparison is being used for.
 *
 * `"offers"` is the ordinary two-or-three-quotes comparison on
 * `/cong-cu/so-sanh-khoan-vay/`. `"fixedFloating"` is ORIGINAL ROW 12: the
 * same tool, the same engine and the same horizon, with two NAMED
 * alternatives instead of lettered offers, rendered at
 * `/cong-cu/lai-co-dinh-hay-tha-noi/`.
 *
 * The perspective changes the LABELS, the prefilled example and whether a
 * third column is offered. It changes nothing about the model — which is the
 * whole reason the row asked for a perspective rather than a second form.
 */
export type ComparePerspective = "offers" | "fixedFloating";

/** Field keys for one option column. Three of these make up the form. */
const OPTION_KEYS = [
  {
    rate: "rateA",
    term: "termA",
    fee: "feeA",
    promoMonths: "promoMonthsA",
    promoRate: "promoRateA",
    flatFee: "flatFeeA",
    exitFee: "exitFeeA",
    unknownFees: "unknownFeesA",
  },
  {
    rate: "rateB",
    term: "termB",
    fee: "feeB",
    promoMonths: "promoMonthsB",
    promoRate: "promoRateB",
    flatFee: "flatFeeB",
    exitFee: "exitFeeB",
    unknownFees: "unknownFeesB",
  },
  {
    rate: "rateC",
    term: "termC",
    fee: "feeC",
    promoMonths: "promoMonthsC",
    promoRate: "promoRateC",
    flatFee: "flatFeeC",
    exitFee: "exitFeeC",
    unknownFees: "unknownFeesC",
  },
] as const;

/**
 * A field that is allowed to be left empty.
 *
 * Empty is "I am not using this option" and must not read as an error, while
 * a value that cannot be parsed — or a negative one — must. Collapsing the
 * two would either nag a user who only has two quotes, or silently drop a
 * column they typed a typo into.
 */
type OptionalNumber = {
  /** Parsed value, or null when empty or unparseable. */
  value: number | null;
  /** True only for a non-empty value that cannot be used. */
  invalid: boolean;
};

/**
 * A field's raw text, treating a missing key as empty.
 *
 * `useCalcFields` only holds the keys it was seeded with, so an option whose
 * defaults object is missing one — a content override that lists only the
 * fields it cares about — must read as "not filled in" rather than throwing
 * on `undefined.trim()`.
 */
function text(raw: string | undefined): string {
  return raw === undefined ? "" : raw;
}

function optionalDecimal(raw: string | undefined): OptionalNumber {
  if (text(raw).trim() === "") return { value: null, invalid: false };
  const parsed = parseDecimal(text(raw));
  if (parsed === null || parsed < 0) return { value: null, invalid: true };
  return { value: parsed, invalid: false };
}

/** The same, for a money field. */
function optionalMoney(raw: string | undefined): OptionalNumber {
  if (text(raw).trim() === "") return { value: null, invalid: false };
  const parsed = parseMoney(text(raw));
  if (parsed === null || parsed < 0) return { value: null, invalid: true };
  return { value: parsed, invalid: false };
}

/**
 * The same, for a whole count of months.
 *
 * `parseCount`, not `parseDecimal` plus an integer guard: docs §4's grammar
 * table is explicit that `parseDecimal("1.200")` is 1,2, so the dot is eaten
 * before any `Number.isInteger` check can run and the field's own error is
 * unreachable.
 */
function optionalCount(raw: string | undefined, max: number): OptionalNumber {
  if (text(raw).trim() === "") return { value: null, invalid: false };
  const parsed = parseCount(text(raw));
  if (parsed === null || parsed < 1 || parsed > max) {
    return { value: null, invalid: true };
  }
  return { value: parsed, invalid: false };
}

/*
 * One component, two routes, so the region ids are per PERSPECTIVE rather than
 * module constants: `#so-sanh-khoan-vay-ket-qua` on the fixed-versus-floating
 * page would be a link to an answer that is not this page's.
 */
const REGION_IDS: Record<
  ComparePerspective,
  { form: string; result: string }
> = {
  offers: {
    form: "so-sanh-khoan-vay-nhap",
    result: "so-sanh-khoan-vay-ket-qua",
  },
  fixedFloating: {
    form: "lai-co-dinh-hay-tha-noi-nhap",
    result: "lai-co-dinh-hay-tha-noi-ket-qua",
  },
};

/*
 * CSV row 6 ("Hai cột"): "Đặt các phương án cạnh nhau, đồng nhất mốc thời
 * gian; nhấn chênh lệch chi phí chứ không chỉ tên bên rẻ hơn."
 *
 * The first two clauses were ALREADY SATISFIED and are recorded rather than
 * rebuilt: the detail table is transposed so the offers ARE side-by-side
 * columns (and `mobileCards` keeps them side by side on a phone), and there is
 * exactly one horizon field, above the offers, that every column is priced at
 * — there is no per-offer horizon for the tool to disagree with itself over.
 *
 * The third clause is the change. The headline used to read "Rẻ nhất tại mốc
 * bạn chọn: Phương án B" first with the spread as an unemphasised second row,
 * so the page's answer was a NAME. Now the cost difference is the emphasised
 * figure, the winner's name sits under it as the thing the difference is
 * about, and the winner's cost at the chosen horizon follows so the difference
 * has a base to be read against.
 *
 * CSV row 15 (`lai-co-dinh-hay-tha-noi`): "Dùng cùng bố cục so sánh khoản vay;
 * cho đọc ngay rủi ro sau ưu đãi và chi phí tại cùng mốc." The first clause is
 * this component — the route has been a perspective of it since the original
 * row 12 consolidation, and it now inherits this layout unchanged. The second
 * clause adds the per-side block below: the instalment after the ưu đãi ends,
 * the month it starts, and each side's cost at the common horizon, all of
 * which previously existed ONLY inside the collapsed 15-row table.
 */
// No `= {}` default on the parameter: an optional PARAMETER makes the
// component fail `createElement`'s typed overload, so nothing could pass this
// from a page or a test. React always supplies a props object.
export function LoanCompareCalculator({
  perspective = "offers",
  initialUnknownFees,
  actions,
  nextSteps,
}: {
  perspective?: ComparePerspective;
  /**
   * Which offers open marked "Chưa biết đủ phí". TEST-ONLY, like the floating
   * tool's `initialStressPoints`: the static page renders every offer known,
   * and a server render is the only way to assert the ticked state's real
   * markup. No route passes it.
   */
  initialUnknownFees?: readonly boolean[];
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
}) {
  const fixedFloating = perspective === "fixedFloating";
  const ids = REGION_IDS[perspective];

  /**
   * The prefilled offers and the column names, per perspective.
   *
   * ONE set of field keys either way, so the model, the validation, the charts
   * and the detail table are literally the same code path. Only what the
   * columns are CALLED and what they open with differ.
   */
  const defaults = fixedFloating ? F.compare.defaults : C.form.defaults;

  const initial = {
    amount: C.form.defaultAmount,
    horizon: C.form.defaultHorizon,
    rateA: defaults[0].rate,
    termA: defaults[0].term,
    feeA: defaults[0].fee,
    promoMonthsA: defaults[0].promoMonths,
    promoRateA: defaults[0].promoRate,
    flatFeeA: defaults[0].flatFee,
    exitFeeA: defaults[0].exitFee,
    rateB: defaults[1].rate,
    termB: defaults[1].term,
    feeB: defaults[1].fee,
    promoMonthsB: defaults[1].promoMonths,
    promoRateB: defaults[1].promoRate,
    flatFeeB: defaults[1].flatFee,
    exitFeeB: defaults[1].exitFee,
    rateC: defaults[2].rate,
    termC: defaults[2].term,
    feeC: defaults[2].fee,
    promoMonthsC: defaults[2].promoMonths,
    promoRateC: defaults[2].promoRate,
    flatFeeC: defaults[2].flatFee,
    exitFeeC: defaults[2].exitFee,
    // "Chưa biết đủ phí", per offer: "1" when ticked. Not a figure and not a
    // content default — every example opens KNOWN under its visible no-fee
    // assumption, and "Về ví dụ mẫu" clears it with every other key.
    unknownFeesA: initialUnknownFees?.[0] ? "1" : "",
    unknownFeesB: initialUnknownFees?.[1] ? "1" : "",
    unknownFeesC: initialUnknownFees?.[2] ? "1" : "",
  };
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. `optionalMoney` keys group, `optionalDecimal` keys take a
  // comma; `horizon` and the promo months go through `parseCount` and format
  // nothing, because a dot would invalidate them.
  const fields = useCalcFields(initial, {
    amount: "money",
    rateA: "rate",
    termA: "rate",
    feeA: "rate",
    promoRateA: "rate",
    flatFeeA: "money",
    exitFeeA: "money",
    rateB: "rate",
    termB: "rate",
    feeB: "rate",
    promoRateB: "rate",
    flatFeeB: "money",
    exitFeeB: "money",
    rateC: "rate",
    termC: "rate",
    feeC: "rate",
    promoRateC: "rate",
    flatFeeC: "money",
    exitFeeC: "money",
  });

  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const amount = parseMoney(fields.values.amount);
  const amountInvalid = amount === null || amount <= 0;

  // The COMMON horizon: the one month at which every offer is measured. 0 is
  // allowed and means "fees paid, nothing repaid yet".
  const horizonRaw = text(fields.values.horizon).trim();
  const horizon = parseCount(horizonRaw);
  const horizonInvalid =
    horizonRaw === "" || horizon === null || horizon > MAX_COMPARE_MONTHS;

  const parsed = OPTION_KEYS.map((keys) => ({
    rate: optionalDecimal(fields.values[keys.rate]),
    term: optionalDecimal(fields.values[keys.term]),
    fee: optionalDecimal(fields.values[keys.fee]),
    promoMonths: optionalCount(fields.values[keys.promoMonths], MAX_COMPARE_MONTHS),
    promoRate: optionalDecimal(fields.values[keys.promoRate]),
    flatFee: optionalMoney(fields.values[keys.flatFee]),
    exitFee: optionalMoney(fields.values[keys.exitFee]),
  }));

  /**
   * A promotional stretch needs BOTH figures and a term to sit inside.
   *
   * Half a promotion is a typo, not an offer. It is flagged on the field AND
   * it makes the whole offer unusable — see `malformed` below.
   */
  const promoPartial = parsed.map(
    (option) =>
      (option.promoMonths.value !== null) !== (option.promoRate.value !== null),
  );
  const promoTooLong = parsed.map(
    (option) =>
      option.promoMonths.value !== null &&
      option.term.value !== null &&
      option.promoMonths.value >= Math.round(option.term.value * 12),
  );

  /**
   * An offer with ANY unusable field is excluded, not repaired.
   *
   * This is the review's reproduced defect. A promotional rate of `abc` used
   * to leave `promoUsable` false, which dropped the promotion and priced the
   * offer as a constant post-promotional loan — then RANKED it. The reader saw
   * their invalid field and a confident winner computed from a contract they
   * never described. A malformed fee did the same thing: `abc` parsed to null
   * and `?? 0` turned it into a free fee.
   *
   * BLANK IS NOT INVALID. An empty fee box means "no such fee" and is a
   * legitimate 0; an empty rate or term means the column is not in use. Only
   * NON-EMPTY text that cannot be read is malformed.
   */
  const malformed = parsed.map(
    (option, index) =>
      option.rate.invalid ||
      option.term.invalid ||
      option.fee.invalid ||
      option.flatFee.invalid ||
      option.exitFee.invalid ||
      option.promoMonths.invalid ||
      option.promoRate.invalid ||
      promoPartial[index] ||
      promoTooLong[index],
  );

  // An option enters the comparison only with both a rate and a term; -1 and 0
  // are values `compareLoans` rejects, so a missing one comes back as a null
  // row rather than as a default that would price a loan nobody was offered.
  //
  // Terms are entered in years and rounded to whole months, because that is
  // what a schedule can amortize over.
  const options: LoanOption[] = parsed.map((option, index) => {
    if (malformed[index]) {
      // A rate the model rejects outright, so the row comes back null with its
      // position preserved. Deliberately NOT a downgraded version of the
      // offer: the comparison must not invent a contract.
      return { annualRatePercent: -1, termMonths: 0 };
    }
    const termMonths =
      option.term.value === null ? 0 : Math.round(option.term.value * 12);
    return {
      annualRatePercent: option.rate.value ?? -1,
      termMonths,
      feePercent: option.fee.value ?? 0,
      upfrontFee: option.flatFee.value ?? 0,
      exitFee: option.exitFee.value ?? 0,
      promoMonths: option.promoMonths.value ?? 0,
      promoRatePercent: option.promoRate.value ?? undefined,
    };
  });

  const result =
    amountInvalid || horizonInvalid
      ? null
      : compareLoans({ amount, options, horizonMonths: horizon });

  /**
   * Offers the reader is USING that could not be priced.
   *
   * "In use" is any column with text in ANY of its boxes — including a
   * malformed promotional rate on an otherwise complete offer, which is
   * exactly the case that used to be ranked as something else. A genuinely
   * empty third column is not in use and draws no warning.
   */
  const inUse = OPTION_KEYS.map((keys) =>
    (
      [
        keys.rate,
        keys.term,
        keys.fee,
        keys.flatFee,
        keys.exitFee,
        keys.promoMonths,
        keys.promoRate,
      ] as const
    ).some((key) => text(fields.values[key]).trim() !== ""),
  );

  /** In use, no unreadable box, and both a rate and a term: the engine should price it. */
  const complete = parsed.map(
    (option, index) =>
      inUse[index] && !malformed[index] && option.rate.value !== null && option.term.value !== null,
  );
  /**
   * One complete offer priced on its own through the SAME engine — only when
   * the comparison itself was refused, to tell "the engine cannot price this"
   * from "fewer than two offers". No second calculation of any figure.
   */
  const probe = (index: number) =>
    amount === null || horizon === null
      ? null
      : (compareLoans({ amount, options: [options[index], options[index]], horizonMonths: horizon })?.rows[0] ??
        null);
  /*
   * ONE LIMIT FOR THE WHOLE TOOL, both routes (release repair, 2026-10-01).
   * The boxes parse, yet the engine priced a complete offer as nothing or
   * as a non-finite figure, or returned a figure ≥ 10^18 ₫. Then no ranking,
   * spread, cost, risk row, chart, table, APR or lane is printed — never a
   * "— ₫" read as an answer — and one card says why, with a jump to each box
   * that is itself the cause. Invalid, incomplete, too-few and unknown-fee
   * states are unchanged; an ordinary valid comparison passes through.
   */
  const limit =
    amountInvalid || horizonInvalid
      ? null
      : compareLimit({
          amount,
          columns: parsed.map((option, index) => ({
            complete: complete[index],
            row: !complete[index] ? null : result !== null ? (result.rows[index] ?? null) : probe(index),
            typed: {
              rate: option.rate.value,
              termMonths: option.term.value === null ? null : Math.round(option.term.value * 12),
              fee: option.fee.value,
              flatFee: option.flatFee.value,
              exitFee: option.exitFee.value,
              promoRate: option.promoRate.value,
            },
          })),
          spreads: result === null ? [] : [result.spread, result.fullTermSpread],
        });
  // An offer the ENGINE could not price is a limit, not an unreadable box:
  // only malformed or incomplete offers are "unusable" (and blame a field).
  const unusableInUse =
    result === null
      ? malformed.some((bad, index) => bad && inUse[index])
      : result.unusableIndexes.some((index) => inUse[index] && !complete[index]);

  /**
   * THE GUARD (F5, 2026-09-29). A cheapest option, a spread, a winner change
   * or any ranking is stated ONLY when every offer in use priced, none is
   * marked "Chưa biết đủ phí", and at least two are complete. An unused
   * third column blocks nothing; an exact tie is a tie. Every fee-dependent
   * figure below reads this one object.
   */
  const unknownFees = OPTION_KEYS.map((keys) => fields.values[keys.unknownFees] === "1");
  const columnFacts = { inUse, malformed, unknownFees };
  const guard = compareGuard(result, columnFacts);
  const ranked = guard.ranked && result !== null && limit === null;

  const money = (value: number) => `${formatMoney(value)} ₫`;
  /** The spread as the page may state it. */
  const spreadText =
    !ranked || result === null ? LL.notRanked : guard.allTied ? LL.noSpread : money(result.spread);

  /**
   * What each column is CALLED.
   *
   * In the offers perspective these are the reader's lettered quotes. In the
   * fixed/floating one they are a stable side name plus a descriptor DERIVED
   * from the structure actually entered — because a column named "lãi cố định
   * cả kỳ hạn" became false the moment a reader followed the hint and entered
   * a three-year fixed period followed by a different rate. The side name
   * makes two columns distinguishable even when their structures match, and
   * the labels drive the headline, both charts and the table together, so
   * nothing on the page can describe a phased schedule as fixed for the term.
   */
  const optionLabels = fixedFloating
    ? parsed.map((option, index) => {
        const side = F.compare.sideNames[index];
        const structure = malformed[index]
          ? F.compare.structureUnknown
          : option.promoMonths.value === null
            ? F.compare.structureConstant
            : fill(F.compare.structurePhased, {
                n: formatDecimal(option.promoMonths.value, 0),
              });
        return `${side} — ${structure}`;
      })
    : C.form.optionLabels;

  /** The short names the limit card uses: "Bên A" on fixed/floating. */
  const sideNames = fixedFloating ? F.compare.sideNames : optionLabels;
  const LIMIT_LABEL: Record<CompareLimitKey, string> = {
    amount: C.form.amountLabel,
    rate: C.form.rateLabel,
    term: C.form.termLabel,
    fee: C.form.feeLabel,
    flatFee: C.form.flatFeeLabel,
    exitFee: C.form.exitFeeLabel,
    promoRate: C.form.promoRateLabel,
  };
  /** The card: neutral, no figure, the reason once, a jump per causal box. */
  const limitView: StatusView | null = (() => {
    if (limit === null) return null;
    const copy = LL.limits[limit.kind];
    const jumps = limit.fields.map((field) =>
      field.column === null || field.key === "amount"
        ? { key: "amount", label: LIMIT_LABEL.amount }
        : {
            key: OPTION_KEYS[field.column][field.key],
            label: `${sideNames[field.column]} — ${LIMIT_LABEL[field.key]}`,
          },
    );
    const options = limit.columns.length > 0 ? namesOf(limit.columns, sideNames) : LL.limits.allOptions;
    return {
      tone: "unknown" as const,
      label: LL.limits.label,
      title: copy.title,
      reasons: [
        fill(jumps.length > 0 ? copy.reason : copy.neutral, {
          options,
          fields: jumps.map((jump) => `“${jump.label}”`).join(LL.limits.join),
        }),
      ],
      actions: jumps.map((jump) => ({ field: jump.key, label: jump.label })),
    };
  })();

  /**
   * The offer columns the detail table shows.
   *
   * ONLY the offers in use. A blank third column used to take a third of a
   * 390 px table's width to display nothing but dashes, which squeezed the
   * metric labels into one word per line. An offer in use but unusable keeps
   * its column — with dashes and the warning above — because dropping it
   * would hide that it was excluded.
   */
  const shownOffers = OPTION_KEYS.map((_keys, index) => index).filter(
    (index) => inUse[index],
  );

  /**
   * One table row: a metric label followed by that metric per shown option.
   *
   * This table is transposed — metrics are rows and options are columns — so
   * the months row sits among amounts. `countCell` is what keeps 240 months
   * out of the money unit the amounts are scaled to.
   */
  const metricRow = (
    label: string,
    cell: (row: LoanComparisonRow) => TableCell,
    /** Depends on the fees: withheld for an offer whose fees are unknown. */
    feeDependent = false,
  ): TableCell[] => [
    label,
    ...shownOffers.map((index) => {
      const row = result?.rows[index] ?? null;
      if (row === null) return null;
      return feeDependent && guard.feesUnknown[index] ? LL.feeUnknownValue : cell(row);
    }),
  ];

  /** A rate cell, or the "could not solve" text when the solver declined. */
  const rateCell = (value: number | null): TableCell =>
    value === null ? C.form.aprUnavailable : percentCell(value, 2);

  const tableRows: TableCell[][] = result && limit === null
    ? [
        metricRow(C.table.rows.monthly, (row) => moneyCell(row.monthlyPayment)),
        metricRow(C.table.rows.resetPayment, (row) =>
          moneyCell(row.resetPayment),
        ),
        metricRow(C.table.rows.resetMonth, (row) =>
          row.resetMonth === null ? null : countCell(row.resetMonth),
        ),
        metricRow(C.table.rows.months, (row) => countCell(row.months)),
        // The horizon block: every offer measured at the one month the reader
        // chose, with the debt still owed there beside it.
        metricRow(C.table.rows.horizonInterest, (row) =>
          moneyCell(row.horizonInterest),
        ),
        metricRow(C.table.rows.fee, (row) => moneyCell(row.upfrontFee), true),
        metricRow(C.table.rows.horizonBalance, (row) =>
          moneyCell(row.horizonBalance),
        ),
        // Charged at the horizon, not at origination — so it sits in the
        // horizon block and never in the full-term one.
        metricRow(C.table.rows.exitFee, (row) =>
          moneyCell(row.exitFeeAtHorizon),
        true),
        metricRow(C.table.rows.horizonCost, (row) =>
          moneyCell(row.horizonCost),
        true),
        // A distance from "the cheapest" exists only when there is one.
        ...(ranked
          ? [
              metricRow(C.table.rows.extraVsBest, (row) =>
                moneyCell(row.extraVsBest),
              ),
            ]
          : []),
        // The full-term block, kept separate because it answers a different
        // question from the one above.
        metricRow(C.table.rows.totalInterest, (row) =>
          moneyCell(row.totalInterest),
        ),
        metricRow(C.table.rows.costOfBorrowing, (row) =>
          moneyCell(row.costOfBorrowing),
        true),
        metricRow(C.table.rows.totalOutlay, (row) =>
          moneyCell(row.totalOutlay),
        true),
        // Rates, never scaled to the table's money unit.
        metricRow(C.table.rows.apr, (row) => rateCell(row.aprPercent), true),
        metricRow(C.table.rows.horizonApr, (row) =>
          rateCell(row.horizonAprPercent),
        true),
      ]
    : [];

  const bestLabel = !ranked
    ? result === null
      ? null
      : LL.notRanked
    : guard.best.length > 1
      ? `${LL.tieValue}: ${namesOf(guard.best, optionLabels)}`
      : optionLabels[guard.best[0]];

  /**
   * The winner's own cost at the chosen horizon — ROW 6's base for the spread.
   *
   * A difference with nothing to measure it against is unreadable: "chênh lệch
   * 180 triệu" means one thing on a 600 triệu cost and another on a 6 tỷ one.
   * Read off the ranked row, so it is the same figure the table reports.
   */
  const bestHorizonCost =
    !ranked || result === null ? null : (result.rows[guard.best[0]]?.horizonCost ?? null);

  /**
   * ROW 15's per-side block: the instalment after the ưu đãi ends and the cost
   * at the common horizon, for each side in use.
   *
   * Every figure is read off the same `result.rows` the detail table reads, so
   * nothing here is a second calculation — it is the two metrics the row asks
   * to be legible without opening a fifteen-row table. A side with no
   * promotional phase has no reset, so it reports its constant instalment
   * under its own name instead: printing "sau ưu đãi" for a loan that never
   * had one would invent a phase.
   */
  const riskRows = (limit === null ? shownOffers : []).flatMap((index) => {
    const row = result?.rows[index] ?? null;
    if (row === null) return [];
    const phased = row.resetMonth !== null;
    return [
      {
        label: `${optionLabels[index]} — ${
          phased ? C.table.rows.resetPayment : C.table.rows.monthly
        }`,
        value: money(phased ? row.resetPayment : row.monthlyPayment),
      },
      ...(phased
        ? [
            {
              label: `${optionLabels[index]} — ${C.table.rows.resetMonth}`,
              value: formatDecimal(row.resetMonth as number, 0),
            },
          ]
        : []),
      {
        label: `${optionLabels[index]} — ${C.table.rows.horizonCost}`,
        value: guard.feesUnknown[index] ? LL.feeUnknownValue : money(row.horizonCost),
      },
    ];
  });

  /** The two figures every offer needs: its rate and its term. */
  const offerCoreFields = (index: number) => (
    <>
      <NumberField
        {...fields.bind(OPTION_KEYS[index].rate)}
        label={C.form.rateLabel}
        unit={C.form.rateUnit}
        help={C.form.rateHelp}
        error={C.form.rateInvalid}
        invalid={parsed[index].rate.invalid}
        fieldKey={OPTION_KEYS[index].rate}
      />
      <NumberField
        {...fields.bind(OPTION_KEYS[index].term)}
        label={C.form.termLabel}
        unit={C.form.termUnit}
        help={C.form.termHelp}
        error={C.form.termInvalid}
        invalid={parsed[index].term.invalid}
        fieldKey={OPTION_KEYS[index].term}
      />
    </>
  );

  /**
   * That offer's optional fees and promotional pair, behind its own panel.
   *
   * The panel's `settings` are computed from the PARSED values the model
   * uses, so a fee inside a closed panel cannot move the ranking silently —
   * and a malformed entry is reported as active too, because the offer it
   * belongs to has been excluded and the reader needs to find it.
   */
  const offerFeeFields = (index: number) => {
    const option = parsed[index];
    const keys = OPTION_KEYS[index];
    // A summary never echoes "—%" or "— ₫" for a value it cannot print.
    const printable = (value: number | null, shown: string) =>
      displayable([value ?? 0]) ? shown : LL.limits.settingTooLarge;
    const settings: DisclosedSetting[] = [
      {
        key: "fee",
        label: C.form.feeLabel,
        value: printable(option.fee.value, `${formatDecimal(option.fee.value ?? 0, 2)}%`),
        active: option.fee.invalid || (option.fee.value ?? 0) > 0,
      },
      {
        key: "flatFee",
        label: C.form.flatFeeLabel,
        value: printable(option.flatFee.value, money(option.flatFee.value ?? 0)),
        active: option.flatFee.invalid || (option.flatFee.value ?? 0) > 0,
      },
      {
        key: "exitFee",
        label: C.form.exitFeeLabel,
        value: printable(option.exitFee.value, money(option.exitFee.value ?? 0)),
        active: option.exitFee.invalid || (option.exitFee.value ?? 0) > 0,
      },
      {
        key: "promo",
        label: C.form.promoRateLabel,
        value:
          option.promoMonths.value === null || option.promoRate.value === null
            ? C.form.promoNeedsBoth
            : printable(
                option.promoRate.value,
                `${formatDecimal(option.promoRate.value, 2)}% · ${formatDecimal(
                  option.promoMonths.value,
                  0,
                )} ${C.form.promoMonthsUnit}`,
              ),
        active:
          option.promoMonths.invalid ||
          option.promoRate.invalid ||
          promoPartial[index] ||
          promoTooLong[index] ||
          option.promoMonths.value !== null ||
          option.promoRate.value !== null,
      },
    ];
    return (
      <AdvancedFields
        title={C.form.optionalFeesTitle}
        settings={settings}
        emptySummary={C.form.optionalFeesSummary}
      >
        <NumberField
          {...fields.bind(keys.fee)}
          label={C.form.feeLabel}
          unit={C.form.feeUnit}
          help={C.form.feeHelp}
          error={C.form.feeInvalid}
          invalid={option.fee.invalid}
          fieldKey={keys.fee}
        />
        <NumberField
          {...fields.bind(keys.flatFee)}
          label={C.form.flatFeeLabel}
          unit={C.form.flatFeeUnit}
          help={C.form.flatFeeHelp}
          error={C.form.flatFeeInvalid}
          invalid={option.flatFee.invalid}
          fieldKey={keys.flatFee}
        />
        {/* Paid at the horizon, not at origination — its own box for that
            reason, and never folded into the one above. */}
        <NumberField
          {...fields.bind(keys.exitFee)}
          label={C.form.exitFeeLabel}
          unit={C.form.exitFeeUnit}
          help={C.form.exitFeeHelp}
          error={C.form.exitFeeInvalid}
          invalid={option.exitFee.invalid}
          fieldKey={keys.exitFee}
        />
        <NumberField
          {...fields.bind(keys.promoMonths)}
          label={C.form.promoMonthsLabel}
          unit={C.form.promoMonthsUnit}
          help={C.form.promoMonthsHelp}
          error={C.form.promoMonthsInvalid}
          invalid={option.promoMonths.invalid || promoTooLong[index]}
          fieldKey={keys.promoMonths}
        />
        <NumberField
          {...fields.bind(keys.promoRate)}
          label={C.form.promoRateLabel}
          unit={C.form.promoRateUnit}
          help={C.form.promoRateHelp}
          error={C.form.promoRateInvalid}
          invalid={option.promoRate.invalid}
          fieldKey={keys.promoRate}
        />
        {promoPartial[index] ? (
          <p className="text-sm leading-relaxed text-ink-2">
            {C.form.promoNeedsBoth}
          </p>
        ) : null}
      </AdvancedFields>
    );
  };

  /**
   * The fee-aware rate view: one row per priced offer per measure.
   *
   * Three rates, each named for what it is. The nominal figure is lãi tháng ×
   * 12, the effective one is the same rate compounded, and they are never
   * presented as interchangeable — the note under the block says so.
   */
  const ratePercent = (value: number | null) =>
    value === null ? C.form.aprUnavailable : formatPercent(value, 2);
  // An APR is fee-dependent: withheld for an offer whose fees are unknown.
  const aprOf = (index: number, value: number | null) =>
    guard.feesUnknown[index] ? LL.feeUnknownValue : ratePercent(value);
  const aprFigures = (result?.rows ?? []).flatMap((row, index) =>
    row === null
      ? []
      : [
          {
            label: `${optionLabels[index]} — ${C.form.aprLabel}`,
            value: aprOf(index, row.aprPercent),
          },
          {
            label: `${optionLabels[index]} — ${C.form.aprEffectiveLabel}`,
            value: aprOf(index, row.aprEffectivePercent),
          },
          {
            label: `${optionLabels[index]} — ${fill(
              C.form.horizonAprLabel,
              { n: formatDecimal(result?.horizonMonths ?? 0, 0) },
            )}`,
            value: aprOf(index, row.horizonAprPercent),
          },
        ],
  );

  // The third option is "in use" once it has both a rate and a term — the
  // same test `compareLoans` applies — so the disclosure opens itself for a
  // reader who has filled it in.
  const thirdInUse =
    parsed[2].rate.value !== null && parsed[2].term.value !== null;
  const thirdOptionSettings: DisclosedSetting[] = [
    {
      key: "optionC",
      label: optionLabels[2],
      value: thirdInUse ? C.form.thirdOptionUsed : C.form.thirdOptionUnused,
      active: thirdInUse,
    },
  ];

  // Two charts, because the two questions have different answers: the bars
  // rank by what borrowing costs, the lines show what each month costs. They
  // routinely point at different options, which is the page's whole lesson.
  //
  // THE GUARD REACHES BOTH. Unranked: no cost bars at all (their emphasis and
  // summary ARE a ranking), with the reason and the recovery in their place.
  // Tied: the bars, with no emphasis and a tie sentence. The payment chart is
  // fee-independent and stays, but names no cheapest option unless one is.
  const blockedNames = namesOf(guard.blocking, optionLabels);
  const costChart = !ranked
    ? costBarsModel(null, optionLabels, {
        ...CHART_UI.money,
        ...C.costChart,
        ...(guard.reason === "invalid"
          ? { unavailableReason: fill(LL.chartInvalid, { options: blockedNames }), unavailableRecovery: LL.recoveryInvalid }
          : guard.reason === "unknownFees"
            ? { unavailableReason: fill(LL.chartUnknown, { options: blockedNames }), unavailableRecovery: LL.recoveryUnknown }
            : {}),
      })
    : guard.best.length > 1
      ? costBarsModel({ ...result, bestIndex: -1, horizonChangesWinner: false }, optionLabels, {
          ...CHART_UI.money,
          ...C.costChart,
          summary: fill(LL.chartTied, {
            horizon: formatDecimal(result.horizonMonths, 0),
            options: namesOf(guard.best, optionLabels),
            cost: money(result.rows[guard.best[0]]?.horizonCost ?? 0),
          }),
        })
      : costBarsModel(result, optionLabels, {
          ...CHART_UI.money,
          ...C.costChart,
        });
  // Equal OPENING instalments are acknowledged as equal: the model's summary
  // would otherwise name the first of them "the lowest". Presentation only.
  // At a limit neither chart is drawn, so neither reads the engine's figures.
  const lowestFirst = lowestFirstPayment(limit === null ? result : null, inUse);
  const paymentChart = paymentTimelineModel(limit === null ? result : null, optionLabels, {
    ...CHART_UI.money,
    ...C.paymentChart,
    ...(lowestFirst !== null && lowestFirst.indexes.length > 1
      ? {
          summary: fill(LL.paymentSummaryTied, {
            options: namesOf(lowestFirst.indexes, optionLabels),
            lowest: money(lowestFirst.value),
          }),
        }
      : ranked && guard.best.length === 1
        ? {}
        : { summary: LL.paymentSummaryNoRank }),
  });

  /** The living panel's lanes, from the same result and the same guard. */
  const lanesView =
    amountInvalid || horizonInvalid || limit !== null
      ? null
      : // The panel's lanes print each side's ENGINE-derived structure under
        // its name, so fixed/floating passes the short stable side names
        // there ("Bên A"); the rows, charts and table keep the full labels.
        compareLanesView(result, guard, columnFacts, fixedFloating ? F.compare.sideNames : optionLabels);
  const setHorizon = (months: number) => fields.bind("horizon").onValueChange(String(months));

  /**
   * "Chưa biết đủ phí" for one offer: a native checkbox, 44 px tall, whose
   * state lives in the form so the example reset clears it. Ticking it never
   * touches the fee boxes.
   */
  const unknownFeesSwitch = (index: number) => {
    const key = OPTION_KEYS[index].unknownFees;
    const inputId = `${ids.form}-${key}`;
    const helpId = `${inputId}-help`;
    return (
      <div data-unknown-fees={index} className="mt-4">
        <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
          <input
            id={inputId}
            type="checkbox"
            checked={unknownFees[index]}
            aria-describedby={helpId}
            onChange={(event) => fields.bind(key).onValueChange(event.target.checked ? "1" : "")}
            className="size-5 shrink-0 accent-brand-green-ink"
          />
          {LL.unknownFeesLabel}
        </label>
        <p id={helpId} className="text-sm leading-relaxed text-ink-2">
          {LL.unknownFeesHelp}
        </p>
      </div>
    );
  };

  return (
    <CalculatorCard compact>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

      {/* ORIGINAL ROW 12's "hiện giả định ngay cạnh kết luận", at the top of
          the form rather than in a footnote: the prefilled fixed rate is an
          example, and the reader is told so before reading a figure off it.
          SENTENCE + LABELLED DISCLOSURE, the same two elements
          `CalculatorPage`'s `noticeDetail` places for shell routes: the whole
          paragraph pushed the first field to 887 px at 390×844, and what a
          reader needs BEFORE typing is that the figure is hypothetical — not
          how to replace it. */}
      {fixedFloating ? (
        <div className="mb-6 rounded-xl border border-red-400/40 bg-bg-soft p-4">
          <p className="text-sm leading-relaxed text-ink-2">
            {F.compare.exampleNotice}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-brand-green-ink">
              {F.compare.exampleDetailTitle}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {F.compare.exampleDetail}
            </p>
          </details>
        </div>
      ) : null}

      <CalculatorLayout
        formId={ids.form}
        columns="split"
        form={
          <>
            <FieldGroup title={C.form.amountGroup}>
              <NumberField
                {...fields.bind("amount")}
                label={C.form.amountLabel}
                unit={C.form.amountUnit}
                help={C.form.amountHelp}
                error={C.form.amountInvalid}
                invalid={amountInvalid}
                fieldKey="amount"
              />
            </FieldGroup>

            {/* The COMMON horizon, in the primary flow and above the offers:
                it is the one input that changes what "cheaper" means, and most
                buyers do not hold a mortgage to month 240. */}
            <FieldGroup title={C.form.horizonGroup} className="mt-8">
              <NumberField
                {...fields.bind("horizon")}
                label={C.form.horizonLabel}
                unit={C.form.horizonUnit}
                help={C.form.horizonHelp}
                error={C.form.horizonInvalid}
                invalid={horizonInvalid}
                fieldKey="horizon"
              />
            </FieldGroup>

            {/* Two offers in the primary flow, each with its RATE and TERM
                only. The four optional boxes — percent fee, one-off fee,
                settlement fee and the promotional pair — are behind that
                offer's own disclosure, which states what is active inside it.
                Original row 3 asked for progressive fee entry; every field
                visible at once was the opposite. `useCalcFields` holds every
                key, so collapsing a panel never loses what was typed into it.

                The third offer stays behind its own panel: three pre-filled
                columns is three sets of numbers to read before the page has
                answered anything. */}
            {OPTION_KEYS.slice(0, 2).map((keys, index) => (
              <FieldGroup
                key={keys.rate}
                title={optionLabels[index]}
                className="mt-8"
              >
                {/* THE PREFILLED FIXED RATE IS A LABELLED EXAMPLE. It says it
                    is a hypothetical figure, and the hint explains how to
                    enter a real "cố định 3 năm rồi thả nổi" quote instead —
                    which this form can express, because both columns take a
                    promotional pair. No claim about what the market offers:
                    none was verified here. */}
                {fixedFloating && index === 0 ? (
                  <p className="text-sm leading-relaxed text-ink-2">
                    {F.compare.fixedSideHint}
                  </p>
                ) : null}
                {offerCoreFields(index)}
                {offerFeeFields(index)}
                {unknownFeesSwitch(index)}
              </FieldGroup>
            ))}

            {/* A third column belongs to the offers question, not to this one:
                fixed against floating has two sides. Every key stays mounted,
                so nothing about the shared state changes. */}
            {fixedFloating ? null : (
              <AdvancedFields
                title={C.form.thirdOptionTitle}
                settings={thirdOptionSettings}
                emptySummary={C.form.thirdOptionUnused}
                className="mt-8"
              >
                {offerCoreFields(2)}
                {offerFeeFields(2)}
                {unknownFeesSwitch(2)}
              </AdvancedFields>
            )}
          </>
        }
        cta={
          /* Sticky: two offers of rate and term, the amount, the horizon and
             three fee panels is a form long enough that the answer leaves the
             screen while the second offer is being edited. The pinned figure
             is the SPREAD, because that is now the answer. */
          <ResultCta
            formId={ids.form}
            targetId={ids.result}
            invalid={amountInvalid || horizonInvalid || unusableInUse}
            answer={{
              label: C.form.spreadLabel,
              value: limit !== null ? LL.limits.cta : result === null ? null : spreadText,
            }}
            sticky
          />
        }
        primary={
          <>
            {/* The only live region on the page: three rows a screen reader
                can hear re-announced on every keystroke. The comparison table
                below carries 21 cells and is deliberately not live. */}
            <ResultGroup
              title={C.form.resultTitle}
              anchorId={ids.result}
              // Outside the live rows: the limit's reason and its jumps.
              status={limitView === null ? undefined : <ResultStatusCard status={limitView} formId={ids.form} />}
            >
              {limit !== null ? (
                // One sentence instead of three rows of placeholders.
                <p data-compare-limit={limit.kind} className="text-sm leading-relaxed text-ink">
                  {LL.limits.rows}
                </p>
              ) : (
              <>
              {/* ROW 6: the DIFFERENCE is the answer, not the winner's name.
                  A reader who only reads the big figure learns what choosing
                  wrongly costs them; a reader who only read "Phương án B"
                  learned nothing about whether the choice mattered. */}
              <ResultRow
                label={C.form.spreadLabel}
                value={result === null ? null : spreadText}
                emphasis
              />
              <ResultRow label={C.form.bestLabel} value={bestLabel} />
              {/* What the difference is measured against. */}
              <ResultRow
                label={C.form.horizonCostLabel}
                value={bestHorizonCost === null ? null : money(bestHorizonCost)}
              />
              </>
              )}
            </ResultGroup>

            {/* ROW 15, this route only: both metrics the reader has to weigh
                before the ranking means anything, out of the collapsed table.
                Not live — the group above already announces the answer. */}
            {fixedFloating && riskRows.length > 0 ? (
              <ResultGroup
                title={F.compare.riskTitle}
                className="mt-4"
                live={false}
              >
                {riskRows.map((row) => (
                  <ResultRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </ResultGroup>
            ) : null}

            {limit === null &&
            result === null &&
            !amountInvalid &&
            !horizonInvalid &&
            !unusableInUse ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.tooFewNotice}
              </p>
            ) : null}

            {/* An offer the reader typed that could not be priced must not
                vanish and leave a winner ranked among a different set of
                columns — and must never be priced as a repaired version of
                itself. */}
            {unusableInUse ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {result === null
                  ? C.form.unusableBlockedNotice
                  : C.form.unusableNotice}
              </p>
            ) : null}

            {limit === null && guard.reason === "unknownFees" ? (
              <p data-unknown-fees-notice="true" className="mt-4 text-sm leading-relaxed text-ink-2">
                {fill(C.form.unknownFeesNotice, { options: blockedNames })}
              </p>
            ) : null}

            {/* When the horizon winner and the full-term winner differ, the
                page says so instead of letting one ranking stand for both
                questions. */}
            {result !== null && limit === null && guard.winnerChanges ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {fill(C.form.winnerChangesNotice, {
                  horizonOption: optionLabels[guard.best[0]],
                  fullTermOption: optionLabels[guard.bestFullTerm[0]],
                })}
              </p>
            ) : null}

            <p className="mt-3 text-sm leading-relaxed text-ink-3">
              {C.form.settlementFeeNotice}
            </p>
          </>
        }
        learning={
          <LoanCompareLearningPanel
            sample={pristine}
            view={lanesView}
            emptyText={
              limit !== null
                ? LL.limits.scene[limit.kind]
                : amountInvalid || horizonInvalid
                  ? LL.unknown
                  : guard.reason === "invalid"
                    ? fill(LL.verdictInvalid, { options: blockedNames })
                    : LL.verdictTooFew
            }
            emptyState={limit === null ? "unknown" : limit.kind}
            fixLabel={limit === null ? undefined : LL.limits.fix}
            onHorizon={setHorizon}
            formId={ids.form}
          />
        }
        chart={
          /* Both charts sit outside every ResultGroup: neither may be
             re-announced on each keystroke. */
          limit !== null ? (
            <p data-compare-limit-chart={limit.kind} className="text-sm leading-relaxed text-ink-2">
              {LL.limits.chart}
            </p>
          ) : (
          <>
            <ChartFigure model={costChart}>
              <BarChart model={costChart} />
            </ChartFigure>

            <ChartFigure model={paymentChart}>
              <LineChart model={paymentChart} />
            </ChartFigure>
          </>
          )
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          tableRows.length > 0 ? (
            <DetailDisclosure title={C.form.detailTitle} hint={C.form.detailHint}>
              {/* MOVED OFF THE PAGE ENTRY. These four sentences are about
                  this table's two row groups, and they used to sit above the
                  form as `intro` — ahead of the amount box, the horizon and
                  the answer — where they described a table the reader had not
                  reached. Row 6's "shorten the entry copy" clause, without
                  losing a word of it. */}
              <p className="mb-4 text-sm leading-relaxed text-ink-2">
                {C.table.intro}
              </p>
              <ResultTable
                caption={C.table.caption}
                columns={[
                  { label: C.table.metricColumn },
                  ...shownOffers.map((index) => ({
                    label: optionLabels[index],
                    numeric: true,
                  })),
                ]}
                rows={tableRows}
                /*
                 * `mobileCards`, and here it is the IDEAL shape rather than a
                 * compromise — the opposite of the cost table above.
                 *
                 * This table's rows are METRICS and its columns are OFFERS,
                 * so a card per row is a card per metric with every offer
                 * inside it: "Trả hằng tháng — Phương án A …, B …, C …". That
                 * is precisely the comparison a reader opened this page for,
                 * kept intact.
                 *
                 * Needed because the column count GROWS WITH THE DATA. The
                 * prefilled example has two offers and the table measured 281
                 * px in its 266 px frame — a 15 px overhang easy to miss. Fill
                 * in the third offer, which the page's own title invites ("Đặt
                 * ba phương án cạnh nhau"), and it becomes four columns at 354
                 * px: 88 px hidden, enough to take part of an offer column
                 * off-frame. Both measured at a verified 390 px viewport on
                 * 2026-09-16.
                 *
                 * It stays under 390 px, so the layout manifest's
                 * wider-than-viewport criterion never flagged it. That
                 * criterion cannot see a table that overflows its own scroll
                 * frame, which is why this one survived two sweeps.
                 */
                mobileCards
              />

              {/* The fee-aware rate view, nested under the same disclosure as
                  the figures it is derived from. Its own qualification sits
                  with it, because a modelled APR is not a statutory
                  disclosure. */}
              <DetailFigures
                title={C.form.aprDetailTitle}
                className="mt-6"
                figures={aprFigures}
              />
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {C.form.aprNote}
              </p>
            </DetailDisclosure>
          ) : null
        }
      />

      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
