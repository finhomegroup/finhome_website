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
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import { computePivots } from "@/lib/calc/pivot";
import { PIVOT as C } from "@/content/calculators/pivot";

/*
 * CSV row 43 ("Gọn"): "các phương pháp trong một bảng so sánh, không cần
 * chart". The comparison table was already the shape; what changes is that it
 * moves into the full-width detail region, the pivot itself becomes the one
 * headline, and the route gains the region ids and the CTA. NO chart is added:
 * plotting four conventions' ladders would be chart chrome, which docs §3
 * forbids. Docs §8.
 */
const FORM_ID = "diem-pivot-nhap";
const RESULT_ID = "diem-pivot-ket-qua";

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
      <CalculatorLayout
        formId={FORM_ID}
        columns="single"
        form={
          <>
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
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            // An EMPTY opening price is not in this list: it drops Woodie and
            // keeps the other three methods, which is a supported answer, not
            // a mistake. `openInvalid` is already false when the box is blank.
            invalid={highInvalid || lowInvalid || closeInvalid || openInvalid}
          />
        }
        primary={
          <>
            {/* Three summary rows live; the 32-cell method table is a table
                and stays out of the live region entirely. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={C.form.pivotLabel}
                value={result ? `${money(result.pivot)} ₫` : null}
                emphasis
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

            {/* Explains why the table below has three rows rather than four,
                so it belongs with the answer and not under the table. */}
            {result !== null && result.methods.length < 4 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.noOpenNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          tableRows.length > 0 ? (
            <ResultTable
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
              /*
               * Eight columns — the widest table in the suite — so `mobileCards`
               * per docs §3. Measured at a verified 390 px viewport on
               * 2026-09-16: 617 px inside a 300 px scroll frame, a ratio of 2,06.
               *
               * `WIDE_TABLE_PENDING` recorded a real cost here and it is worth
               * keeping: reading ACROSS a row gives one method's ladder, which
               * cards preserve, but reading DOWN a column compares the four
               * conventions at one level, which cards break up. What settles it is
               * that the column comparison WAS NOT AVAILABLE ANYWAY — at 2,06 a
               * reader saw roughly two of the seven level columns, so comparing
               * four methods at one level meant scrolling to it and holding three
               * numbers in memory. Four methods is four cards, which scans.
               */
              mobileCards
            />
          ) : null
        }
      />
    </CalculatorCard>
  );
}
