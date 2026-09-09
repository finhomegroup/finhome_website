"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
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
  PLACEHOLDER,
} from "@/lib/calc/number";
import {
  computeAnalysis,
  type AnalysisResult,
  type DuPont,
} from "@/lib/calc/financials";
import { STATEMENT_ANALYSIS as C } from "@/content/calculators/statement-analysis";

const D = C.form.duPontTable;
const L = C.form.linesTable;

/** Prefixes keeping the two periods' field keys apart in one flat state. */
const CURRENT = "cur_";
const PRIOR = "pri_";

/** Signed money, because a change of −40 tỷ must not read as 40 tỷ. */
function signedMoney(figure: number): string {
  const sign = figure < 0 ? "−" : figure > 0 ? "+" : "";
  return `${sign}${formatMoney(Math.abs(figure))} ₫`;
}

/** Signed percent. Null means the prior figure was zero — no growth rate exists. */
function signedPercent(value: number | null, digits = 2): string {
  if (value === null) return PLACEHOLDER;
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${formatPercent(Math.abs(value), digits)}`;
}

function plainPercent(value: number | null): string {
  return value === null ? PLACEHOLDER : formatPercent(value, 2);
}

function times(value: number | null): string {
  return value === null ? PLACEHOLDER : formatDecimal(value, 2);
}

export function StatementAnalysisCalculator() {
  const fields = useCalcFields({
    ...prefixed(C.form.currentDefaults, CURRENT),
    ...prefixed(C.form.priorDefaults, PRIOR),
  });

  const current = readStatement(fields.values, CURRENT);
  const prior = readStatement(fields.values, PRIOR);

  const result =
    current.input === null || prior.input === null
      ? null
      : computeAnalysis({ current: current.input, prior: prior.input });

  const duPontTableRows = result ? duPontRows(result) : [];

  const lineRows = result
    ? result.lines.map((line) => [
        L.names[line.key as keyof typeof L.names] ?? line.key,
        `${formatMoney(line.current)} ₫`,
        `${formatMoney(line.prior)} ₫`,
        signedMoney(line.change),
        signedPercent(line.changePercent),
        plainPercent(line.currentOfRevenuePercent),
        plainPercent(line.priorOfRevenuePercent),
      ])
    : [];

  const negativeEquity =
    result !== null &&
    (result.current.negativeEquity || result.prior.negativeEquity);

  return (
    <CalculatorCard>
      <StatementFields
        copy={C.statement}
        invalid={current.invalid}
        bind={fields.bind}
        prefix={CURRENT}
        titleSuffix={C.form.currentSuffix}
      />
      <StatementFields
        copy={C.statement}
        invalid={prior.invalid}
        bind={fields.bind}
        prefix={PRIOR}
        titleSuffix={C.form.priorSuffix}
      />

      {/* One live region on the page: the ROE move, which is the answer.
          Both tables below stay out of it. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.roeChangeLabel}
          value={
            result === null || result.returnOnEquityChangePoints === null
              ? null
              : `${signedDecimal(result.returnOnEquityChangePoints)} ${C.form.pointsUnit}`
          }
        />
        <ResultRow
          label={C.form.roeCurrentLabel}
          value={
            result ? plainPercent(result.current.returnOnEquityPercent) : null
          }
        />
        <ResultRow
          label={C.form.roePriorLabel}
          value={
            result ? plainPercent(result.prior.returnOnEquityPercent) : null
          }
        />
      </ResultGroup>

      {duPontTableRows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">
            {C.form.duPontIntro}
          </p>
          <ResultTable
            className="mt-4"
            caption={D.caption}
            columns={[
              { label: D.driverColumn },
              { label: D.currentColumn, numeric: true },
              { label: D.priorColumn, numeric: true },
              { label: D.changeColumn, numeric: true },
            ]}
            rows={duPontTableRows}
          />
        </>
      ) : null}

      {lineRows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{L.intro}</p>
          <ResultTable
            className="mt-4"
            caption={L.caption}
            columns={[
              { label: L.lineColumn },
              { label: L.currentColumn, numeric: true },
              { label: L.priorColumn, numeric: true },
              { label: L.changeColumn, numeric: true },
              { label: L.changePercentColumn, numeric: true },
              { label: L.currentShareColumn, numeric: true },
              { label: L.priorShareColumn, numeric: true },
            ]}
            rows={lineRows}
          />
        </>
      ) : null}

      {negativeEquity ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.negativeEquityNotice}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.invalidNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}

/** Statement defaults keyed by period, flattened into one state object. */
function prefixed(
  defaults: Record<string, string>,
  prefix: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(defaults)) {
    out[`${prefix}${key}`] = value;
  }
  return out;
}

/** DuPont margin is a RATIO; the table shows it as a percent. */
function pct(value: DuPont["netMargin"]): number | null {
  return value === null ? null : value * 100;
}

/** A difference only exists when both periods have the figure. */
function diff(now: number | null, before: number | null): number | null {
  return now === null || before === null ? null : now - before;
}

function signedDecimal(value: number): string {
  const sign = value < 0 ? "−" : value > 0 ? "+" : "";
  return `${sign}${formatDecimal(Math.abs(value), 2)}`;
}

function signedTimes(value: number | null): string {
  return value === null ? PLACEHOLDER : signedDecimal(value);
}

/**
 * The change between two PERCENTS is percentage POINTS, not a percent.
 *
 * 7,11% → 9,60% is +2,49 điểm %, and the relative change is +35%. Printing
 * "+2,49%" for it collides with the sibling `Tăng trưởng` column, which really
 * does hold relative growth, and understates the move. The headline ROE row
 * already says "điểm %"; the DuPont table now agrees with it.
 *
 * Exported so the UNIT on a points delta is unit-testable — the wrong suffix
 * renders a perfectly correct number as a different quantity, and nothing in
 * `lib/calc/` can see a formatting choice.
 */
export function signedPoints(value: number | null): string {
  return value === null
    ? PLACEHOLDER
    : `${signedDecimal(value)} ${C.form.pointsUnit}`;
}

/**
 * The DuPont table body: three drivers plus the product, which exists to be
 * checked against the ROE row above it.
 *
 * Pure and exported so the change column's UNITS are unit-testable. Two
 * quantities are mixed in one column on purpose: rows 0 and 3 hold percents, so
 * their change is percentage POINTS (`signedPoints`), while rows 1 and 2 hold
 * unitless multiples, whose change is a plain number (`signedTimes`). Reaching
 * for `signedPercent` on the percent rows — as this table once did — prints the
 * points figure as if it were the relative growth the sibling table's `Tăng
 * trưởng` column holds, understating the ROE move by a factor of about 7,7.
 */
export function duPontRows(result: AnalysisResult): string[][] {
  return [
    [
      D.drivers.netMargin,
      plainPercent(pct(result.currentDuPont.netMargin)),
      plainPercent(pct(result.priorDuPont.netMargin)),
      signedPoints(
        diff(
          pct(result.currentDuPont.netMargin),
          pct(result.priorDuPont.netMargin),
        ),
      ),
    ],
    [
      D.drivers.assetTurnover,
      times(result.currentDuPont.assetTurnover),
      times(result.priorDuPont.assetTurnover),
      signedTimes(
        diff(
          result.currentDuPont.assetTurnover,
          result.priorDuPont.assetTurnover,
        ),
      ),
    ],
    [
      D.drivers.equityMultiplier,
      times(result.currentDuPont.equityMultiplier),
      times(result.priorDuPont.equityMultiplier),
      signedTimes(
        diff(
          result.currentDuPont.equityMultiplier,
          result.priorDuPont.equityMultiplier,
        ),
      ),
    ],
    [
      D.drivers.product,
      plainPercent(result.currentDuPont.returnOnEquityPercent),
      plainPercent(result.priorDuPont.returnOnEquityPercent),
      signedPoints(
        diff(
          result.currentDuPont.returnOnEquityPercent,
          result.priorDuPont.returnOnEquityPercent,
        ),
      ),
    ],
  ];
}
