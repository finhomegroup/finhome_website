"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import { computePivots } from "@/lib/calc/pivot";
import { PIVOT as C } from "@/content/calculators/pivot";

export function PivotCalculator() {
  const fields = useCalcFields({
    high: C.form.defaultHigh,
    low: C.form.defaultLow,
    close: C.form.defaultClose,
    open: C.form.defaultOpen,
  });

  const high = parseMoney(fields.values.high);
  const low = parseMoney(fields.values.low);
  const close = parseMoney(fields.values.close);

  // Optional: without it Woodie is simply absent, which is not an error.
  const openRaw = fields.values.open.trim();
  const open = openRaw === "" ? null : parseMoney(openRaw);

  const highInvalid = high === null || high <= 0;
  const lowInvalid =
    low === null || low <= 0 || (high !== null && low > high);
  const closeInvalid =
    close === null ||
    close <= 0 ||
    (low !== null && close < low) ||
    (high !== null && close > high);
  const openInvalid = openRaw !== "" && (open === null || open <= 0);

  const result =
    highInvalid || lowInvalid || closeInvalid || openInvalid
      ? null
      : computePivots({
          high,
          low,
          close,
          open: open ?? undefined,
        });

  const money = (figure: number) => formatMoney(figure);

  const tableRows =
    result?.methods.map((entry) => [
      C.form.methodNames[entry.method],
      money(entry.pivot),
      money(entry.resistance[0]),
      money(entry.resistance[1]),
      money(entry.resistance[2]),
      money(entry.support[0]),
      money(entry.support[1]),
      money(entry.support[2]),
    ]) ?? [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.sessionGroup}>
        <NumberField
          {...fields.bind("high")}
          label={C.form.highLabel}
          unit={C.form.highUnit}
          help={C.form.highHelp}
          error={C.form.highInvalid}
          invalid={highInvalid}
        />
        <NumberField
          {...fields.bind("low")}
          label={C.form.lowLabel}
          unit={C.form.lowUnit}
          help={C.form.lowHelp}
          error={C.form.lowInvalid}
          invalid={lowInvalid}
        />
        <NumberField
          {...fields.bind("close")}
          label={C.form.closeLabel}
          unit={C.form.closeUnit}
          help={C.form.closeHelp}
          error={C.form.closeInvalid}
          invalid={closeInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.todayGroup} className="mt-8">
        <NumberField
          {...fields.bind("open")}
          label={C.form.openLabel}
          unit={C.form.openUnit}
          help={C.form.openHelp}
          error={C.form.openInvalid}
          invalid={openInvalid}
        />
      </FieldGroup>

      {/* Three summary rows live; the 32-cell method table is a table and
          stays out of the live region entirely. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.pivotLabel}
          value={result ? `${money(result.pivot)} ₫` : null}
        />
        <ResultRow
          label={C.form.rangeLabel}
          value={result ? `${money(result.range)} ₫` : null}
        />
        <ResultRow
          label={C.form.closePositionLabel}
          value={
            result ? formatPercent(result.closePositionPercent, 1) : null
          }
        />
      </ResultGroup>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.table.caption}
          columns={[
            { label: C.form.table.methodColumn },
            { label: C.form.table.pivotColumn, numeric: true },
            { label: C.form.table.r1Column, numeric: true },
            { label: C.form.table.r2Column, numeric: true },
            { label: C.form.table.r3Column, numeric: true },
            { label: C.form.table.s1Column, numeric: true },
            { label: C.form.table.s2Column, numeric: true },
            { label: C.form.table.s3Column, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}

      {result !== null && result.methods.length < 4 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.noOpenNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
