"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeDdmMulti } from "@/lib/calc/ddm-multi";
import { DDM_MULTI as C } from "@/content/calculators/ddm-multi";

/*
 * CSV row 37 ("Hai cột"): "chia hai giai đoạn tăng trưởng thành nhóm; nhấn
 * phần giá trị đến từ giả định dài hạn". Docs §8.
 *
 * WHY `emphasis` IS NOT ON THE PER-SHARE VALUE, which is what a sweep would
 * otherwise "fix": the row says to emphasise the share coming from the
 * long-run assumption, and this page's notice explains why — 77,41% of the
 * default answer comes from a perpetuity nobody can check. The value is still
 * the first row and still plainly labelled; what the headline says is which
 * of the two numbers the reader must not leave without.
 */
const FORM_ID = "co-phieu-khong-deu-nhap";
const RESULT_ID = "co-phieu-khong-deu-ket-qua";

export function DdmMultiCalculator() {
  const fields = useCalcFields({
    dividend: C.form.defaultDividend,
    highGrowth: C.form.defaultHighGrowth,
    years: C.form.defaultYears,
    terminalGrowth: C.form.defaultTerminalGrowth,
    required: C.form.defaultRequired,
  });

  const dividend = parseMoney(fields.values.dividend);
  const highGrowth = parseDecimal(fields.values.highGrowth);
  // A whole count of years, so `parseCount` — docs §4, same unreachable
  // arrangement as `irr-npv`: `parseDecimal("1.000")` is 1, an integer
  // inside [1, 20], so a grouped entry silently became a one-year first
  // stage while the field's own error promised "số nguyên từ 1 đến 20".
  const years = parseCount(fields.values.years);
  const terminalGrowth = parseDecimal(fields.values.terminalGrowth);
  const required = parseDecimal(fields.values.required);

  const dividendInvalid = dividend === null || dividend <= 0;
  const highGrowthInvalid = highGrowth === null;
  const yearsInvalid = years === null || years < 1 || years > 20;
  const requiredInvalid = required === null;
  // Only the TERMINAL rate is bounded by the required return. The first stage
  // being allowed to exceed it is the reason this model exists.
  const terminalGrowthInvalid =
    terminalGrowth === null ||
    (required !== null && terminalGrowth >= required);

  const anyInvalid =
    dividendInvalid ||
    highGrowthInvalid ||
    yearsInvalid ||
    terminalGrowthInvalid ||
    requiredInvalid;

  const result = anyInvalid
    ? null
    : computeDdmMulti({
        dividend,
        highGrowthPercent: highGrowth,
        highGrowthYears: years,
        terminalGrowthPercent: terminalGrowth,
        requiredReturnPercent: required,
      });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  // Formatted ONCE, for the rows and for the pinned restatement both —
  // `ResultCta`'s `answer` contract forbids a second rounding of either.
  const valueValue = money(result?.intrinsicValue);
  const shareValue = result ? formatPercent(result.terminalSharePercent, 2) : null;

  /**
   * The per-share value with the share of it that is assumption, or nothing.
   *
   * WHY THIS ROUTE NOW PINS, having been left in flow on a control count: an
   * independent pass at 1440×1000 focused the last field ("Lợi nhuận yêu cầu",
   * y 529–575) and measured the result block at y −178,25 to −4,25 — both
   * 54.716 ₫ and 77,41% entirely above the viewport, while that field is the
   * one that moves both. Five boxes in three legends turned out to be enough
   * height after all, which is what a measurement is for.
   *
   * WHY A PAIR rather than the value alone: the old comment here was right
   * that the figure worth keeping on screen is "the value WITH its terminal
   * share" — that is an argument for the Black–Scholes paired shape, not for
   * no pin. `emphasis` stays on the share (CSV row 37), and a pin is not an
   * emphasis, so nothing in the hierarchy moves.
   */
  const pinnedAnswer = {
    label: C.form.pinnedPairLabel,
    value:
      valueValue === null || shareValue === null
        ? null
        : `${valueValue} · ${C.form.pinnedTerminalPrefix} ${shareValue} ` +
          `${C.form.pinnedTerminalSuffix}`,
  };

  const tableRows =
    result?.years.map((row) => [
      formatDecimal(row.year, 0),
      formatMoney(row.dividend),
      formatMoney(row.presentValue),
    ]) ?? [];

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            {/* The row's "chia hai giai đoạn thành nhóm". The two stages are
                separate blocks because the rules differ between them: only
                the terminal rate is bounded by the required return. */}
            <FieldGroup title={C.form.dividendGroup}>
              <NumberField
                {...fields.bind("dividend")}
                label={C.form.dividendLabel}
                unit={C.form.dividendUnit}
                help={C.form.dividendHelp}
                error={C.form.dividendInvalid}
                invalid={dividendInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.highGroup} className="mt-8">
              <NumberField
                {...fields.bind("highGrowth")}
                label={C.form.highGrowthLabel}
                unit={C.form.highGrowthUnit}
                help={C.form.highGrowthHelp}
                error={C.form.highGrowthInvalid}
                invalid={highGrowthInvalid}
              />
              <NumberField
                {...fields.bind("years")}
                label={C.form.yearsLabel}
                help={C.form.yearsHelp}
                error={C.form.yearsInvalid}
                invalid={yearsInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.terminalGroup} className="mt-8">
              <NumberField
                {...fields.bind("terminalGrowth")}
                label={C.form.terminalGrowthLabel}
                unit={C.form.terminalGrowthUnit}
                help={C.form.terminalGrowthHelp}
                error={C.form.terminalGrowthInvalid}
                invalid={terminalGrowthInvalid}
              />
              <NumberField
                {...fields.bind("required")}
                label={C.form.requiredLabel}
                unit={C.form.requiredUnit}
                help={C.form.requiredHelp}
                error={C.form.requiredInvalid}
                invalid={requiredInvalid}
              />
            </FieldGroup>
          </>
        }
        cta={
          /* `sticky` with a PAIR — see `pinnedAnswer` for the measurement that
             replaced the control count, and for why both halves travel. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={pinnedAnswer}
          />
        }
        primary={
          <>
            {/* The terminal share sits beside the value, because it is what
                tells the reader how much of the value is assumption. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={C.form.valueLabel} value={valueValue} />
              <ResultRow
                label={C.form.terminalShareLabel}
                value={shareValue}
                emphasis
              />
              <ResultRow
                label={C.form.pvDividendsLabel}
                value={money(result?.pvOfDividends)}
              />
            </ResultGroup>

            {/* Explains why every figure is a dash, so it stays beside them. */}
            {terminalGrowthInvalid &&
            terminalGrowth !== null &&
            required !== null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.unpriceableNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          // How the terminal value was built, then the year-by-year dividends
          // the first stage contributes. Both are full-width workings rather
          // than part of the answer, and the table is the reason this route
          // needs the wide detail region: three columns of money.
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
              <ResultRow
                label={C.form.terminalDividendLabel}
                value={money(result?.terminalDividend)}
              />
              <ResultRow
                label={C.form.terminalValueLabel}
                value={money(result?.terminalValue)}
              />
              <ResultRow
                label={C.form.pvTerminalLabel}
                value={money(result?.pvOfTerminalValue)}
              />
            </ResultGroup>

            {tableRows.length > 0 ? (
              <ResultTable
                className="mt-8"
                caption={C.form.table.caption}
                columns={[
                  { label: C.form.table.yearColumn },
                  { label: C.form.table.dividendColumn, numeric: true },
                  { label: C.form.table.pvColumn, numeric: true },
                ]}
                rows={tableRows}
              />
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
