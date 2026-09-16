"use client";

import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
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
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
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
  },
  {
    rate: "rateB",
    term: "termB",
    fee: "feeB",
    promoMonths: "promoMonthsB",
    promoRate: "promoRateB",
    flatFee: "flatFeeB",
    exitFee: "exitFeeB",
  },
  {
    rate: "rateC",
    term: "termC",
    fee: "feeC",
    promoMonths: "promoMonthsC",
    promoRate: "promoRateC",
    flatFee: "flatFeeC",
    exitFee: "exitFeeC",
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

// No `= {}` default on the parameter: an optional PARAMETER makes the
// component fail `createElement`'s typed overload, so nothing could pass this
// from a page or a test. React always supplies a props object.
export function LoanCompareCalculator({
  perspective = "offers",
}: {
  perspective?: ComparePerspective;
}) {
  const fixedFloating = perspective === "fixedFloating";

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
  };
  const fields = useCalcFields(initial);

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
  const unusableInUse =
    result === null
      ? malformed.some((bad, index) => bad && inUse[index])
      : result.unusableIndexes.some((index) => inUse[index]);

  const money = (value: number) => `${formatMoney(value)} ₫`;

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
  ): TableCell[] => [
    label,
    ...shownOffers.map((index) => {
      const row = result?.rows[index] ?? null;
      return row === null ? null : cell(row);
    }),
  ];

  /** A rate cell, or the "could not solve" text when the solver declined. */
  const rateCell = (value: number | null): TableCell =>
    value === null ? C.form.aprUnavailable : percentCell(value, 2);

  const tableRows: TableCell[][] = result
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
        metricRow(C.table.rows.fee, (row) => moneyCell(row.upfrontFee)),
        metricRow(C.table.rows.horizonBalance, (row) =>
          moneyCell(row.horizonBalance),
        ),
        // Charged at the horizon, not at origination — so it sits in the
        // horizon block and never in the full-term one.
        metricRow(C.table.rows.exitFee, (row) =>
          moneyCell(row.exitFeeAtHorizon),
        ),
        metricRow(C.table.rows.horizonCost, (row) =>
          moneyCell(row.horizonCost),
        ),
        metricRow(C.table.rows.extraVsBest, (row) =>
          moneyCell(row.extraVsBest),
        ),
        // The full-term block, kept separate because it answers a different
        // question from the one above.
        metricRow(C.table.rows.totalInterest, (row) =>
          moneyCell(row.totalInterest),
        ),
        metricRow(C.table.rows.costOfBorrowing, (row) =>
          moneyCell(row.costOfBorrowing),
        ),
        metricRow(C.table.rows.totalOutlay, (row) =>
          moneyCell(row.totalOutlay),
        ),
        // Rates, never scaled to the table's money unit.
        metricRow(C.table.rows.apr, (row) => rateCell(row.aprPercent)),
        metricRow(C.table.rows.horizonApr, (row) =>
          rateCell(row.horizonAprPercent),
        ),
      ]
    : [];

  const bestLabel =
    result === null ? null : optionLabels[result.bestIndex];

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
      />
      <NumberField
        {...fields.bind(OPTION_KEYS[index].term)}
        label={C.form.termLabel}
        unit={C.form.termUnit}
        help={C.form.termHelp}
        error={C.form.termInvalid}
        invalid={parsed[index].term.invalid}
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
    const settings: DisclosedSetting[] = [
      {
        key: "fee",
        label: C.form.feeLabel,
        value: `${formatDecimal(option.fee.value ?? 0, 2)}%`,
        active: option.fee.invalid || (option.fee.value ?? 0) > 0,
      },
      {
        key: "flatFee",
        label: C.form.flatFeeLabel,
        value: money(option.flatFee.value ?? 0),
        active: option.flatFee.invalid || (option.flatFee.value ?? 0) > 0,
      },
      {
        key: "exitFee",
        label: C.form.exitFeeLabel,
        value: money(option.exitFee.value ?? 0),
        active: option.exitFee.invalid || (option.exitFee.value ?? 0) > 0,
      },
      {
        key: "promo",
        label: C.form.promoRateLabel,
        value:
          option.promoMonths.value === null || option.promoRate.value === null
            ? C.form.promoNeedsBoth
            : `${formatDecimal(option.promoRate.value, 2)}% · ${formatDecimal(
                option.promoMonths.value,
                0,
              )} ${C.form.promoMonthsUnit}`,
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
        />
        <NumberField
          {...fields.bind(keys.flatFee)}
          label={C.form.flatFeeLabel}
          unit={C.form.flatFeeUnit}
          help={C.form.flatFeeHelp}
          error={C.form.flatFeeInvalid}
          invalid={option.flatFee.invalid}
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
        />
        <NumberField
          {...fields.bind(keys.promoMonths)}
          label={C.form.promoMonthsLabel}
          unit={C.form.promoMonthsUnit}
          help={C.form.promoMonthsHelp}
          error={C.form.promoMonthsInvalid}
          invalid={option.promoMonths.invalid || promoTooLong[index]}
        />
        <NumberField
          {...fields.bind(keys.promoRate)}
          label={C.form.promoRateLabel}
          unit={C.form.promoRateUnit}
          help={C.form.promoRateHelp}
          error={C.form.promoRateInvalid}
          invalid={option.promoRate.invalid}
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
  const aprFigures = (result?.rows ?? []).flatMap((row, index) =>
    row === null
      ? []
      : [
          {
            label: `${optionLabels[index]} — ${C.form.aprLabel}`,
            value: ratePercent(row.aprPercent),
          },
          {
            label: `${optionLabels[index]} — ${C.form.aprEffectiveLabel}`,
            value: ratePercent(row.aprEffectivePercent),
          },
          {
            label: `${optionLabels[index]} — ${fill(
              C.form.horizonAprLabel,
              { n: formatDecimal(result?.horizonMonths ?? 0, 0) },
            )}`,
            value: ratePercent(row.horizonAprPercent),
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
  const costChart = costBarsModel(result, optionLabels, {
    ...CHART_UI.money,
    ...C.costChart,
  });
  const paymentChart = paymentTimelineModel(result, optionLabels, {
    ...CHART_UI.money,
    ...C.paymentChart,
  });

  return (
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

      {/* ORIGINAL ROW 12's "hiện giả định ngay cạnh kết luận", at the top of
          the form rather than in a footnote: the prefilled fixed rate is an
          example, and the reader is told so before reading a figure off it. */}
      {fixedFloating ? (
        <p className="mb-6 rounded-xl border border-red-400/40 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
          {F.compare.exampleNotice}
        </p>
      ) : null}

      <FieldGroup title={C.form.amountGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
      </FieldGroup>

      {/* The COMMON horizon, in the primary flow and above the offers: it is
          the one input that changes what "cheaper" means, and most buyers do
          not hold a mortgage to month 240. */}
      <FieldGroup title={C.form.horizonGroup} className="mt-8">
        <NumberField
          {...fields.bind("horizon")}
          label={C.form.horizonLabel}
          unit={C.form.horizonUnit}
          help={C.form.horizonHelp}
          error={C.form.horizonInvalid}
          invalid={horizonInvalid}
        />
      </FieldGroup>

      {/* Two offers in the primary flow, each with its RATE and TERM only.
          The four optional boxes — percent fee, one-off fee, settlement fee
          and the promotional pair — are behind that offer's own disclosure,
          which states what is active inside it. Original row 3 asked for
          progressive fee entry; every field visible at once was the opposite.
          `useCalcFields` holds every key, so collapsing a panel never loses
          what was typed into it.

          The third offer stays behind its own panel: three pre-filled columns
          is three sets of numbers to read before the page has answered
          anything. */}
      {OPTION_KEYS.slice(0, 2).map((keys, index) => (
        <FieldGroup
          key={keys.rate}
          title={optionLabels[index]}
          className="mt-8"
        >
          {/* THE PREFILLED FIXED RATE IS A LABELLED EXAMPLE. It says it is a
              hypothetical figure, and the hint explains how to enter a real
              "cố định 3 năm rồi thả nổi" quote instead — which this form can
              express, because both columns take a promotional pair. No claim
              about what the market offers: none was verified here. */}
          {fixedFloating && index === 0 ? (
            <p className="text-sm leading-relaxed text-ink-2">
              {F.compare.fixedSideHint}
            </p>
          ) : null}
          {offerCoreFields(index)}
          {offerFeeFields(index)}
        </FieldGroup>
      ))}

      {/* A third column belongs to the offers question, not to this one: fixed
          against floating has two sides. Every key stays mounted, so nothing
          about the shared state changes. */}
      {fixedFloating ? null : (
        <AdvancedFields
          title={C.form.thirdOptionTitle}
          settings={thirdOptionSettings}
          emptySummary={C.form.thirdOptionUnused}
          className="mt-8"
        >
          {offerCoreFields(2)}
          {offerFeeFields(2)}
        </AdvancedFields>
      )}

      {/* The only live region on the page: two rows a screen reader can hear
          re-announced on every keystroke. The comparison table below carries
          21 cells and is deliberately not live. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.bestLabel} value={bestLabel} />
        <ResultRow
          label={C.form.spreadLabel}
          value={result === null ? null : money(result.spread)}
        />
      </ResultGroup>

      {result === null && !amountInvalid && !horizonInvalid && !unusableInUse ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.tooFewNotice}
        </p>
      ) : null}

      {/* An offer the reader typed that could not be priced must not vanish
          and leave a winner ranked among a different set of columns — and
          must never be priced as a repaired version of itself. */}
      {unusableInUse ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          {result === null
            ? C.form.unusableBlockedNotice
            : C.form.unusableNotice}
        </p>
      ) : null}

      {/* When the horizon winner and the full-term winner differ, the page
          says so instead of letting one ranking stand for both questions. */}
      {result?.horizonChangesWinner ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          {fill(C.form.winnerChangesNotice, {
            horizonOption: optionLabels[result.bestIndex],
            fullTermOption: optionLabels[result.bestFullTermIndex],
          })}
        </p>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.settlementFeeNotice}
      </p>

      {/* Both charts sit outside every ResultGroup: neither may be
          re-announced on each keystroke. */}
      <ChartFigure model={costChart}>
        <BarChart model={costChart} />
      </ChartFigure>

      <ChartFigure model={paymentChart}>
        <LineChart model={paymentChart} />
      </ChartFigure>

      {tableRows.length > 0 ? (
        <DetailDisclosure
          title={C.form.detailTitle}
          hint={C.form.detailHint}
          className="mt-8"
        >
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
          />

          {/* The fee-aware rate view, nested under the same disclosure as the
              figures it is derived from. Its own qualification sits with it,
              because a modelled APR is not a statutory disclosure. */}
          <DetailFigures
            title={C.form.aprDetailTitle}
            className="mt-6"
            figures={aprFigures}
          />
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            {C.form.aprNote}
          </p>
        </DetailDisclosure>
      ) : null}
      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />

    </CalculatorCard>
  );
}
