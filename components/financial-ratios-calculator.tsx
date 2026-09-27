"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import {
  readStatement,
  StatementFields,
} from "@/components/calc/financials-fields";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseMoney,
  PLACEHOLDER,
} from "@/lib/calc/number";
import { computeRatios, type RatioSet } from "@/lib/calc/financials";
import { FINANCIAL_RATIOS as C } from "@/content/calculators/financial-ratios";

const T = C.form.ratioTable;

/**
 * ROW 67 — "Chia báo cáo thành nhóm; giữ ba chỉ số chính bên phải, bảng chi
 * tiết chiếm toàn chiều rộng phía dưới", at "Theo nhóm + kết quả".
 *
 * The grouping half of the row was already true: `StatementFields` emits the
 * thirteen lines as three `FieldGroup`s named after their source statement,
 * and the two optional share fields are a fourth. What was missing is the
 * "bên phải"/"phía dưới" half — eighteen money fields and a twenty-row table
 * were one column, so the three ratios the page promotes were roughly a
 * screen below the last input that moves them.
 *
 * WHAT MOVED, AND WHAT DID NOT. The `resultTitle` group keeps exactly its
 * three ratios and stays the page's one live region; the ROE row takes
 * `emphasis` because it is the ratio the lede, the prose and the sibling
 * page's whole DuPont argument are about. The ten-row derived statement and
 * the twenty-row ratio table go to the full-width band: neither is an answer,
 * both are the working behind one. No ratio, no format, no bound and no
 * refusal changed — `readShareFields`, `readStatement` and `computeRatios`
 * are untouched, and a null ratio is still the placeholder rather than a
 * number.
 */
const FORM_ID = "cac-chi-so-tai-chinh-nhap";
const RESULT_ID = "cac-chi-so-tai-chinh-ket-qua";

/** How each row of the ratio table is rendered. */
type RowSpec = {
  group: keyof typeof T.groups;
  name: keyof typeof T.names;
  value: (set: RatioSet) => number | null;
  format: "percent" | "times" | "days" | "money" | "plain";
};

const ROWS: RowSpec[] = [
  { group: "profitability", name: "grossMargin", value: (s) => s.grossMarginPercent, format: "percent" },
  { group: "profitability", name: "operatingMargin", value: (s) => s.operatingMarginPercent, format: "percent" },
  { group: "profitability", name: "netMargin", value: (s) => s.netMarginPercent, format: "percent" },
  { group: "profitability", name: "returnOnAssets", value: (s) => s.returnOnAssetsPercent, format: "percent" },
  { group: "profitability", name: "returnOnEquity", value: (s) => s.returnOnEquityPercent, format: "percent" },
  { group: "liquidity", name: "currentRatio", value: (s) => s.currentRatio, format: "times" },
  { group: "liquidity", name: "quickRatio", value: (s) => s.quickRatio, format: "times" },
  { group: "liquidity", name: "cashRatio", value: (s) => s.cashRatio, format: "times" },
  { group: "leverage", name: "debtToEquity", value: (s) => s.debtToEquity, format: "times" },
  { group: "leverage", name: "debtToAssets", value: (s) => s.debtToAssetsPercent, format: "percent" },
  { group: "leverage", name: "equityMultiplier", value: (s) => s.equityMultiplier, format: "times" },
  { group: "leverage", name: "interestCoverage", value: (s) => s.interestCoverage, format: "times" },
  { group: "efficiency", name: "assetTurnover", value: (s) => s.assetTurnover, format: "times" },
  { group: "efficiency", name: "inventoryTurnover", value: (s) => s.inventoryTurnover, format: "times" },
  { group: "efficiency", name: "daysSalesOutstanding", value: (s) => s.daysSalesOutstanding, format: "days" },
  { group: "efficiency", name: "daysInventory", value: (s) => s.daysInventory, format: "days" },
  { group: "valuation", name: "earningsPerShare", value: (s) => s.earningsPerShare, format: "money" },
  { group: "valuation", name: "bookValuePerShare", value: (s) => s.bookValuePerShare, format: "money" },
  { group: "valuation", name: "priceToEarnings", value: (s) => s.priceToEarnings, format: "plain" },
  { group: "valuation", name: "priceToBook", value: (s) => s.priceToBook, format: "plain" },
];

/**
 * Read the two optional share fields.
 *
 * Both are MONEY-grammar fields and both go through `parseMoney`. The price
 * carries `unit="₫"` and a prefilled "20.000": `parseDecimal` reads that as 20
 * and puts P/E and P/B out by a factor of 1000, and reads a two-group
 * "1.000.000" as null, which blanks all twenty ratios. See docs §4 — the two
 * grammars are two functions on purpose.
 *
 * Extracted and exported so the parser CHOICE itself is unit-testable: the
 * defect was invisible to `lib/calc/financials.test.ts`, which passes
 * `sharePrice` as a number and never crosses a parse step.
 *
 * Empty means "skip the valuation block", which is not the same as a bad
 * entry — hence the raw-vs-parsed split in the invalid flags.
 */
export function readShareFields(values: { shares: string; price: string }): {
  shares: number | null;
  price: number | null;
  sharesInvalid: boolean;
  priceInvalid: boolean;
} {
  const sharesRaw = values.shares.trim();
  const priceRaw = values.price.trim();
  const shares = sharesRaw === "" ? null : parseMoney(sharesRaw);
  const price = priceRaw === "" ? null : parseMoney(priceRaw);
  return {
    shares,
    price,
    sharesInvalid: sharesRaw !== "" && (shares === null || shares < 0),
    priceInvalid: priceRaw !== "" && (price === null || price < 0),
  };
}

export function FinancialRatiosCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with — see `FieldFormats`. The statement lines get theirs inside
  // `FinancialsFields`; these two are this page's own `parseMoney` fields.
  const fields = useCalcFields(
    {
      ...C.form.defaults,
      shares: C.form.defaultShares,
      price: C.form.defaultPrice,
    } as Record<string, string>,
    { shares: "money", price: "money" },
  );

  const statement = readStatement(fields.values);

  const { shares, price, sharesInvalid, priceInvalid } = readShareFields({
    shares: fields.values.shares,
    price: fields.values.price,
  });

  const result =
    statement.input === null || sharesInvalid || priceInvalid
      ? null
      : computeRatios({
          ...statement.input,
          sharesOutstanding: shares ?? undefined,
          sharePrice: price ?? undefined,
        });

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  /** A null ratio is NOT APPLICABLE, and renders as the placeholder. */
  const cell = (spec: RowSpec, set: RatioSet): string => {
    const value = spec.value(set);
    if (value === null) return PLACEHOLDER;
    switch (spec.format) {
      case "percent":
        return formatPercent(value, 2);
      case "times":
        return `${formatDecimal(value, 2)} ${T.units.times}`;
      case "days":
        return `${formatDecimal(value, 1)} ${T.units.days}`;
      case "money":
        return `${formatMoney(value)} ₫`;
      case "plain":
        return formatDecimal(value, 2);
    }
  };

  const tableRows = result
    ? ROWS.map((spec) => [
        T.groups[spec.group],
        T.names[spec.name],
        cell(spec, result),
      ])
    : [];

  /** The one promoted ratio, formatted once for the row and the CTA. */
  const roeAnswer =
    result?.returnOnEquityPercent == null
      ? null
      : formatPercent(result.returnOnEquityPercent, 2);

  const form = (
    <>
      <StatementFields
        copy={C.statement}
        invalid={statement.invalid}
        bind={fields.bind}
      />

      <FieldGroup title={C.form.shareGroup} className="mt-8">
        <NumberField
          {...fields.bind("shares")}
          label={C.form.sharesLabel}
          help={C.form.sharesHelp}
          error={C.form.sharesInvalid}
          invalid={sharesInvalid}
        />
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
      </FieldGroup>
    </>
  );

  const primary = (
    <>
      {/* Three headline ratios live; the full twenty-row set is a table and
          stays out of the live region. */}
      <ResultGroup
        title={C.form.resultTitle}
        className="mt-8"
        anchorId={RESULT_ID}
      >
        <ResultRow label={C.form.roeLabel} value={roeAnswer} emphasis />
        <ResultRow
          label={C.form.netMarginLabel}
          value={
            result?.netMarginPercent == null
              ? null
              : formatPercent(result.netMarginPercent, 2)
          }
        />
        <ResultRow
          label={C.form.currentRatioLabel}
          value={
            result?.currentRatio == null
              ? null
              : `${formatDecimal(result.currentRatio, 2)} ${T.units.times}`
          }
        />
      </ResultGroup>

      {/* Both notices stay BESIDE the three ratios, not in the band below.
          `negativeEquityNotice` says the promoted ROE cannot be read at all,
          and `invalidNotice` says nothing was computed — a qualification that
          arrives a band later has already been read as a figure. */}
      {result?.negativeEquity ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.negativeEquityNotice}
        </p>
      ) : null}

      {statement.input === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.invalidNotice}
        </p>
      ) : null}
    </>
  );

  const detail = (
    <>
      <ResultGroup title={C.form.statementTitle} live={false}>
        <ResultRow
          label={C.form.grossProfitLabel}
          value={money(result?.grossProfit)}
        />
        <ResultRow
          label={C.form.operatingProfitLabel}
          value={money(result?.operatingProfit)}
        />
        <ResultRow
          label={C.form.profitBeforeTaxLabel}
          value={money(result?.profitBeforeTax)}
        />
        <ResultRow
          label={C.form.netProfitLabel}
          value={money(result?.netProfit)}
        />
        <ResultRow
          label={C.form.currentAssetsLabel}
          value={money(result?.currentAssets)}
        />
        <ResultRow
          label={C.form.totalAssetsLabel}
          value={money(result?.totalAssets)}
        />
        <ResultRow
          label={C.form.totalLiabilitiesLabel}
          value={money(result?.totalLiabilities)}
        />
        <ResultRow label={C.form.equityLabel} value={money(result?.equity)} />
        <ResultRow
          label={C.form.totalDebtLabel}
          value={money(result?.totalDebt)}
        />
        <ResultRow label={C.form.netDebtLabel} value={money(result?.netDebt)} />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={T.caption}
          columns={[
            { label: T.groupColumn },
            { label: T.nameColumn },
            { label: T.valueColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}
    </>
  );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={form}
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={result === null}
            sticky
            answer={{ label: C.form.roeLabel, value: roeAnswer }}
          />
        }
        primary={primary}
        detail={detail}
      />
    </CalculatorCard>
  );
}
