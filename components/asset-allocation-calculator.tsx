"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { ResultCta } from "@/components/calc/result-cta";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { moneyCell } from "@/lib/calc/table-cell";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { readDateFields } from "@/lib/calc/date-input";
import type { CalendarDate } from "@/lib/calc/dates";
import {
  analyseAllocation,
  ASSET_CLASSES,
  REBALANCE_BAND_POINTS,
  type AssetAllocationInput,
  type AssetClass,
  type RiskTolerance,
} from "@/lib/calc/asset-allocation";
import { fundAllocationModel } from "@/lib/calc/charts/fund-allocation-chart";
import { allocateFunds } from "@/lib/calc/fund-allocation";
import { ASSET_ALLOCATION as C } from "@/content/calculators/asset-allocation";

const F = C.form;
const T = F.table;
const P = C.purpose;

/**
 * ROW 58: "Ưu tiên quỹ dự phòng, tiền mua nhà và phần còn lại; biểu đồ phân bổ
 * cạnh form, ngày là giả định phụ", at "Hai cột".
 *
 * WHAT CHANGED, and nothing else did:
 *
 * 1. `CalculatorLayout columns="split"` (with `wide` on the route), so the
 *    allocation bar sits in the result column BESIDE the form instead of below
 *    a form that ends with a three-box date and a button.
 * 2. The announced group is the tool's fixed funding order and what is left
 *    over — reserve (the one main answer, because the reserve is separated
 *    before any purpose is funded and that is this page's whole convention),
 *    then the home money, then the other goal, then the unallocated remainder.
 *    "Tổng mong muốn dành" and "Còn thiếu" are not allocations; they are the
 *    wish measured against the money, and they now read together in their own
 *    unannounced group. No figure was dropped and no notice was shortened.
 * 3. The DATE is supplementary: each funded purpose carries its own need date
 *    as a `ResultRow note` inside that row's own `aria-atomic` node, the anchor
 *    is one short line under the group, and the full `anchorNotice` — the
 *    clamping convention and the per-purpose list — stays VERBATIM in a
 *    disclosure in the full-width band.
 *
 * Untouched: both modes and the mode selector, every field and default, the
 * reserve → home → other funding order, the anchor fields and the "Hôm nay"
 * button, the zero-month reading, the shortfall arithmetic, the no-capital and
 * no-product explanations, and the advanced study's table and formulas.
 */
const FORM_ID = "phan-bo-tai-san-nhap";
const RESULT_ID = "phan-bo-tai-san-ket-qua";

const RISK_OPTIONS: readonly { value: RiskTolerance; label: string }[] = [
  { value: "conservative", label: F.riskOptions.conservative },
  { value: "moderate", label: F.riskOptions.moderate },
  { value: "aggressive", label: F.riskOptions.aggressive },
];

/** Renamed from `usd` with the currency: this page works in đồng now. */
function dong(value: number): string {
  return `${formatMoney(value)} ₫`;
}

// A `signedDong` helper used to format the trade column here. The column
// passes `moneyCell` now, so the sign comes from the raw number and
// `ResultTable` renders it in whichever precision the reader chose — the
// helper would have been a second, divergent way to spell the same figure.

/** Drift is in percentage points, not percent — see the module docstring. */
function points(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatDecimal(Math.abs(value), 1)}`;
}

export function AssetAllocationCalculator({
  actions,
  studyActions,
  nextSteps,
}: {
  /**
   * The one or two near-answer destinations — `<ResultActions>`.
   *
   * PLACEMENT FOLLOWS THE ACTIVE MODE for free, which is why this belongs in
   * the layout slot rather than inside either mode's own result block: exactly
   * one `primary` mounts, and `CalculatorLayout` emits `actions` directly after
   * it, so the links sit under the purpose allocation's reserve figure or under
   * the study's max drift depending on which question is on screen. They used
   * to arrive after the whole card, below the allocation bar and the detail
   * band.
   */
  actions?: React.ReactNode;
  /**
   * The same destinations with the ADVANCED STUDY's own framing.
   *
   * Only the intro sentence differs — see `purpose.studyStepsIntro`. Two
   * prebuilt nodes rather than one, because the page is a server component and
   * cannot see the mode the reader selected, while this component cannot build
   * a `ResultActions` without becoming a second actions pattern. Falls back to
   * `actions` when a caller passes only one.
   */
  studyActions?: React.ReactNode;
  /** The further questions and the retention panel — `<ToolNextSteps promoted>`. */
  nextSteps?: React.ReactNode;
}) {
  const fields = useCalcFields({
    // Original row 56: the purpose/time allocation is the DEFAULT question.
    // The age/risk study below is a retained educational mode.
    mode: P.defaultMode,
    available: P.defaultAvailable,
    reserve: P.defaultReserve,
    homeAmount: P.defaultHomeAmount,
    homeMonths: P.defaultHomeMonths,
    otherAmount: P.defaultOtherAmount,
    otherMonths: P.defaultOtherMonths,
    // The declared anchor the month counts are measured from. A review found
    // the help text saying "kể từ hôm nay" on a page that never showed what
    // today was, so the convention could not be checked by a reader.
    anchorDay: P.defaultAnchorDay,
    anchorMonth: P.defaultAnchorMonth,
    anchorYear: P.defaultAnchorYear,
    ...F.defaults,
  });
  const v = fields.values;
  const portfolioMode = v.mode === "portfolio";

  // --- the default mode: one pot, split by purpose and need date -----------
  const available = parseMoney(v.available);
  const reserve = parseMoney(v.reserve);
  const homeAmount = parseMoney(v.homeAmount);
  const otherAmount = parseMoney(v.otherAmount);

  /**
   * A month count, where BLANK is "not stated" rather than zero.
   *
   * 0 months is a real answer — money needed this month — so a blank cannot
   * be defaulted to it. `parseCount` rather than `parseMoney`: "12" is a
   * count and `parseMoney("1.2")` would read 12 from a typo (docs §4).
   */
  const readMonths = (raw: string): { months: number | null; bad: boolean } => {
    const trimmed = raw.trim();
    if (trimmed === "") return { months: null, bad: false };
    const parsed = parseCount(trimmed);
    return { months: parsed, bad: parsed === null };
  };
  const homeMonths = readMonths(v.homeMonths);
  const otherMonths = readMonths(v.otherMonths);

  // The anchor, through the shared three-field reader so each box can be
  // blamed on its own — and so "31/2" marks the DAY rather than all three.
  const anchorFields = readDateFields(v.anchorYear, v.anchorMonth, v.anchorDay);

  const purposeInvalid = {
    available: available === null || available < 0,
    reserve: reserve === null || reserve < 0,
    homeAmount: homeAmount === null || homeAmount < 0,
    otherAmount: otherAmount === null || otherAmount < 0,
    homeMonths: homeMonths.bad,
    otherMonths: otherMonths.bad,
    anchor: anchorFields.date === null,
  };
  const purposeUsable = !Object.values(purposeInvalid).some(Boolean);

  const allocation = purposeUsable
    ? allocateFunds({
        available: available!,
        reserve: reserve!,
        // THE ORDER THIS PAGE DECLARES. Fixed, stated in the copy, and never
        // re-sorted by need date — see `fund-allocation.ts`'s docstring.
        purposes: [
          {
            key: "home",
            requested: homeAmount!,
            monthsUntilNeeded: homeMonths.months,
          },
          {
            key: "other",
            requested: otherAmount!,
            monthsUntilNeeded: otherMonths.months,
          },
        ],
        start: anchorFields.date!,
      })
    : null;

  /** "15/9/2026", hand-formatted like every other figure in the suite. */
  const showDate = (date: CalendarDate | null | undefined) =>
    date === null || date === undefined
      ? null
      : `${formatDecimal(date.day, 0)}/${formatDecimal(date.month, 0)}/${formatDecimal(date.year, 0)}`;

  const anchorLabel = showDate(allocation?.start ?? null);

  const allocationChart = fundAllocationModel(
    allocation,
    { home: P.homeName, other: P.otherName },
    C.chart,
    anchorLabel,
  );

  /**
   * Reads the clock — the one place in this feature that may.
   *
   * `lib/calc/` stays pure so the prerendered HTML and the hydrated HTML
   * agree; this runs only on a click, well after mount. Same pattern as
   * `raise-calculator.tsx` and `dates-calculator.tsx`.
   */
  const fillToday = () => {
    const now = new Date();
    fields.bind("anchorYear").onValueChange(String(now.getFullYear()));
    fields.bind("anchorMonth").onValueChange(String(now.getMonth() + 1));
    fields.bind("anchorDay").onValueChange(String(now.getDate()));
  };

  const purposeMoney = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : dong(figure);

  const purposeOf = (key: "home" | "other") =>
    allocation?.purposes.find((purpose) => purpose.key === key) ?? null;

  /**
   * The need date as a note on the purpose's OWN row — row 58's "ngày là giả
   * định phụ".
   *
   * `undefined` while there is no allocation at all: a row showing the
   * placeholder has no date to qualify. A purpose with a blank month count
   * says so rather than borrowing the anchor, because 0 months is a real
   * answer here and a blank is not.
   */
  const needNote = (key: "home" | "other"): string | undefined => {
    const purpose = purposeOf(key);
    if (purpose === null) return undefined;
    const date = showDate(purpose.needDate);
    return date === null
      ? P.needDateUnknownNote
      : P.needDateNote.replace("{date}", date);
  };

  /**
   * THE one main answer of the default mode, formatted once.
   *
   * The emphasised row and the pinned CTA both read this string, so the same
   * quantity cannot be rounded two ways on one screen.
   */
  const reserveAnswer = purposeMoney(allocation?.reserveAllocated);

  /**
   * `anchorNotice` verbatim, then the per-purpose need dates: the exact text
   * this mode used to render open between the inputs and the figures, now the
   * body of the disclosure in the full-width band.
   */
  const anchorDetailBody =
    allocation === null
      ? null
      : `${P.anchorNotice.replace("{date}", anchorLabel ?? "")} ${allocation.purposes
          .map((purpose) => {
            const name = purpose.key === "home" ? P.homeName : P.otherName;
            return purpose.needDate === null
              ? P.anchorUnknownFormat.replace("{name}", name)
              : P.anchorPurposeFormat
                  .replace("{name}", name)
                  .replace("{date}", showDate(purpose.needDate) ?? "");
          })
          .join(" · ")}`;

  const age = parseCount(v.age);
  const equityHolding = parseMoney(v.equityHolding);
  const bondHolding = parseMoney(v.bondHolding);
  const cashHolding = parseMoney(v.cashHolding);
  const equityReturn = parseDecimal(v.equityReturn);
  const bondReturn = parseDecimal(v.bondReturn);
  const cashReturn = parseDecimal(v.cashReturn);
  const equitySigma = parseDecimal(v.equitySigma);
  const bondSigma = parseDecimal(v.bondSigma);
  const correlation = parseDecimal(v.correlation);

  const badMoney = (value: number | null) => value === null || value < 0;
  const badReturn = (value: number | null) =>
    value === null || value < -100 || value > 100;
  const badSigma = (value: number | null) =>
    value === null || value < 0 || value > 100;

  const invalid = {
    age: age === null || age > 120,
    equityHolding: badMoney(equityHolding),
    bondHolding: badMoney(bondHolding),
    cashHolding: badMoney(cashHolding),
    equityReturn: badReturn(equityReturn),
    bondReturn: badReturn(bondReturn),
    cashReturn: badReturn(cashReturn),
    equitySigma: badSigma(equitySigma),
    bondSigma: badSigma(bondSigma),
    correlation:
      correlation === null || correlation < -1 || correlation > 1,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: AssetAllocationInput | null = anyInvalid
    ? null
    : {
        age: age!,
        riskTolerance: v.risk as RiskTolerance,
        holdings: {
          equity: equityHolding!,
          bond: bondHolding!,
          cash: cashHolding!,
        },
        returns: {
          equity: equityReturn!,
          bond: bondReturn!,
          cash: cashReturn!,
        },
        equitySigmaPercent: equitySigma!,
        bondSigmaPercent: bondSigma!,
        equityBondCorrelation: correlation!,
      };

  const result = input === null ? null : analyseAllocation(input);

  /** The study's own main answer, formatted once for its row and the CTA. */
  const driftAnswer =
    result === null || result.maxDriftPoints === null
      ? null
      : `${formatDecimal(result.maxDriftPoints, 1)} ${F.pointsUnit}`;

  /**
   * The advanced study's per-class table.
   *
   * THE TWO MONETARY COLUMNS ARE TYPED CELLS, not `formatMoney` strings. A
   * review measured this six-column table at 390 px and found only the first
   * four columns on screen — the holdings and the rebalancing trades, the two
   * money columns, were off the right edge with no compact reading and no
   * exact-đồng control. `moneyCell` lets `ResultTable` derive the stated unit,
   * the compact figures and the exact switch from the raw numbers (docs §3).
   *
   * The percentage and percentage-POINT columns stay strings on purpose: a
   * rate is not an amount and must never be scaled into triệu, and the signed
   * drift keeps its own ± sign. Only `moneyCell` is ever divided.
   *
   * `mobileCards` because six columns cannot compact into 390 px — docs §3
   * sets it from five up.
   */
  const rows =
    result === null
      ? []
      : ASSET_CLASSES.map((key: AssetClass) => [
          T.names[key],
          formatPercent(result.target[key], 0),
          result.currentWeights === null
            ? null
            : formatPercent(result.currentWeights[key], 1),
          result.driftPoints === null ? null : points(result.driftPoints[key]),
          input === null ? null : moneyCell(input.holdings[key]),
          result.trades === null ? null : moneyCell(result.trades[key]),
        ]);

  /**
   * The slots are built as values rather than inline branches.
   *
   * `CalculatorLayout` wants form / primary / chart / detail as four separate
   * nodes, and this page has two modes' worth of each. Composing them here
   * keeps every block in its original place in the file — and keeps the two
   * modes from being interleaved inside one deeply nested ternary.
   */
  const modeField = (
    <FieldGroup>
      <RadioGroupField
        {...fields.bind("mode")}
        legend={P.modeLegend}
        help={P.modeHelp}
        options={[
          { value: "purpose", label: P.modePurpose },
          { value: "portfolio", label: P.modePortfolio },
        ]}
      />
    </FieldGroup>
  );

  const purposeForm = (
    <>
          <FieldGroup title={P.potGroup} className="mt-8">
            <NumberField
              {...fields.bind("available")}
              label={P.availableLabel}
              unit={P.availableUnit}
              help={P.availableHelp}
              error={P.amountInvalid}
              invalid={purposeInvalid.available}
            />
            <NumberField
              {...fields.bind("reserve")}
              label={P.reserveLabel}
              unit={P.reserveUnit}
              help={P.reserveHelp}
              error={P.amountInvalid}
              invalid={purposeInvalid.reserve}
            />
          </FieldGroup>

          <FieldGroup title={P.homeGroup} className="mt-8">
            <NumberField
              {...fields.bind("homeAmount")}
              label={P.homeAmountLabel}
              unit={P.homeAmountUnit}
              help={P.homeAmountHelp}
              error={P.amountInvalid}
              invalid={purposeInvalid.homeAmount}
            />
            <NumberField
              {...fields.bind("homeMonths")}
              label={P.homeMonthsLabel}
              unit={P.homeMonthsUnit}
              help={P.homeMonthsHelp}
              error={P.monthsInvalid}
              invalid={purposeInvalid.homeMonths}
            />
          </FieldGroup>

          <FieldGroup title={P.otherGroup} className="mt-8">
            <NumberField
              {...fields.bind("otherAmount")}
              label={P.otherAmountLabel}
              unit={P.otherAmountUnit}
              help={P.otherAmountHelp}
              error={P.amountInvalid}
              invalid={purposeInvalid.otherAmount}
            />
            <NumberField
              {...fields.bind("otherMonths")}
              label={P.otherMonthsLabel}
              unit={P.otherMonthsUnit}
              help={P.otherMonthsHelp}
              error={P.monthsInvalid}
              invalid={purposeInvalid.otherMonths}
            />
          </FieldGroup>

          {/* The anchor the two month counts above are measured from. It is a
              FIELD rather than a sentence about "hôm nay" because a static
              export cannot know the date and a claim the reader cannot check
              is not a convention. */}
          <FieldGroup title={P.anchorGroup} className="mt-8">
            <p className="text-sm leading-relaxed text-ink-3">
              {P.anchorIntro}
            </p>
            <NumberField
              {...fields.bind("anchorDay")}
              label={P.anchorDayLabel}
              help={P.anchorDayHelp}
              error={P.anchorInvalid}
              invalid={anchorFields.dayBad}
            />
            <NumberField
              {...fields.bind("anchorMonth")}
              label={P.anchorMonthLabel}
              help={P.anchorMonthHelp}
              error={P.anchorInvalid}
              invalid={anchorFields.monthBad}
            />
            <NumberField
              {...fields.bind("anchorYear")}
              label={P.anchorYearLabel}
              help={P.anchorYearHelp}
              error={P.anchorInvalid}
              invalid={anchorFields.yearBad}
            />
            <div>
              <button
                type="button"
                onClick={fillToday}
                className={cn(
                  "rounded-xl border border-ink-4/40 bg-white px-4 py-2.5 font-display text-base font-medium text-ink transition",
                  "hover:border-brand-green focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30",
                  FH_POINTER,
                )}
              >
                {P.todayLabel}
              </button>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">
                {P.todayHelp}
              </p>
            </div>
          </FieldGroup>
    </>
  );

  const purposeResults = (
    <>
          {/* THE page's live region, because this is the default mode and the
              one the static export renders. The portfolio study's groups are
              all `live={false}`; docs §4 allows exactly one per page.

              ROW 58: the funding order, then the remainder. The reserve is the
              emphasised answer because it is separated FIRST — emphasising the
              house money instead would read as the priority this tool
              explicitly does not give it (`shortfallNotice`). */}
          <ResultGroup
            title={P.resultTitle}
            className="mt-8"
            anchorId={RESULT_ID}
          >
            <ResultRow
              label={P.reserveResultLabel}
              value={reserveAnswer}
              emphasis
            />
            <ResultRow
              label={P.homeResultLabel}
              value={purposeMoney(purposeOf("home")?.allocated)}
              note={needNote("home")}
            />
            <ResultRow
              label={P.otherResultLabel}
              value={purposeMoney(purposeOf("other")?.allocated)}
              note={needNote("other")}
            />
            <ResultRow
              label={P.unallocatedLabel}
              value={purposeMoney(allocation?.unallocated)}
            />
          </ResultGroup>

          {/* NOT allocations, and not announced: the wish measured against the
              money. Both figures are unchanged and both are still here — the
              shortfall row is still mounted only when something is short, so
              the page never invents a 0 ₫ gap. */}
          <ResultGroup
            title={P.comparisonTitle}
            className="mt-4"
            live={false}
          >
            <ResultRow
              label={P.requestedLabel}
              value={purposeMoney(allocation?.totalRequested)}
            />
            {allocation !== null && allocation.shortfall > 0 ? (
              <ResultRow
                label={P.shortfallLabel}
                value={purposeMoney(allocation.shortfall)}
              />
            ) : null}
          </ResultGroup>

          {allocation === null ? (
            // Two distinguishable refusals: a bad date names the date group,
            // which is the only one whose recovery is a button.
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {purposeInvalid.anchor ? P.anchorDateInvalid : P.invalidNotice}
            </p>
          ) : (
            <>
              {/* The anchor, restated where the figures are read — one line.
                  Not inside the live region: it re-announces on every
                  keystroke there, and it is context, not an answer. The
                  clamping convention and the per-purpose list are the same
                  text, verbatim, in the disclosure below the columns: row 58
                  makes the date a supplementary assumption of the answer. */}
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {P.anchorShort.replace("{date}", anchorLabel ?? "")}
              </p>
              {allocation.shortfall > 0 ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {P.shortfallNotice}
                </p>
              ) : null}
              {allocation.unallocated > 0 ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {P.unallocatedNotice}
                </p>
              ) : null}
              {allocation.anyTimeUnknown ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {P.timeUnknownNotice}
                </p>
              ) : null}
              {!allocation.orderMatchesTimeline ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-3">
                  {P.orderNotice}
                </p>
              ) : null}
            </>
          )}

    </>
  );

  // ROW 58's "biểu đồ phân bổ cạnh form": the `chart` slot of the layout,
  // which is the result column — beside the inputs from `lg` up, and still
  // directly under the answer on a phone.
  const purposeChart = (
          <ChartFigure model={allocationChart}>
            <BarChart model={allocationChart} />
          </ChartFigure>
  );

  const purposeDetail = (
    <>
          {anchorDetailBody === null ? null : (
            <DetailDisclosure title={P.anchorDetailTitle}>
              <p className="text-sm leading-relaxed text-ink-2">
                {anchorDetailBody}
              </p>
            </DetailDisclosure>
          )}

          {/* HOW TO READ THIS MODE'S OWN THREE FIGURES. It used to be the
              page's server-rendered `intro`, which cannot see the selected
              mode — so it went on describing an allocation bar and a
              shortfall table after the reader switched to the portfolio
              study, where neither exists. Mode-local guidance belongs in the
              mode. */}
          <p className="mt-8 text-base leading-relaxed text-ink-2">
            {C.purposeIntro}
          </p>
    </>
  );

  const portfolioForm = (
    <>
      <p className="mt-8 rounded-xl border border-red-400/40 bg-bg-soft p-4 text-sm leading-relaxed text-ink-2">
        {C.advancedNotice}
      </p>

      <FieldGroup title={F.profileGroup} className="mt-8">
        <NumberField
          {...fields.bind("age")}
          label={F.ageLabel}
          unit={F.ageUnit}
          help={F.ageHelp}
          error={F.ageInvalid}
          invalid={invalid.age}
        />
        <RadioGroupField
          {...fields.bind("risk")}
          legend={F.riskLabel}
          help={F.riskHelp}
          options={RISK_OPTIONS}
        />
      </FieldGroup>

      <FieldGroup title={F.holdingsGroup} className="mt-8">
        <NumberField
          {...fields.bind("equityHolding")}
          label={F.equityHoldingLabel}
          unit={F.holdingUnit}
          help={F.equityHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.equityHolding}
        />
        <NumberField
          {...fields.bind("bondHolding")}
          label={F.bondHoldingLabel}
          unit={F.holdingUnit}
          help={F.bondHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.bondHolding}
        />
        <NumberField
          {...fields.bind("cashHolding")}
          label={F.cashHoldingLabel}
          unit={F.holdingUnit}
          help={F.cashHoldingHelp}
          error={F.moneyInvalid}
          invalid={invalid.cashHolding}
        />
      </FieldGroup>

      <FieldGroup title={F.assumptionGroup} className="mt-8">
        <NumberField
          {...fields.bind("equityReturn")}
          label={F.equityReturnLabel}
          unit={F.returnUnit}
          help={F.equityReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.equityReturn}
        />
        <NumberField
          {...fields.bind("bondReturn")}
          label={F.bondReturnLabel}
          unit={F.returnUnit}
          help={F.bondReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.bondReturn}
        />
        <NumberField
          {...fields.bind("cashReturn")}
          label={F.cashReturnLabel}
          unit={F.returnUnit}
          help={F.cashReturnHelp}
          error={F.returnInvalid}
          invalid={invalid.cashReturn}
        />
        <NumberField
          {...fields.bind("equitySigma")}
          label={F.equitySigmaLabel}
          unit={F.sigmaUnit}
          help={F.equitySigmaHelp}
          error={F.sigmaInvalid}
          invalid={invalid.equitySigma}
        />
        <NumberField
          {...fields.bind("bondSigma")}
          label={F.bondSigmaLabel}
          unit={F.sigmaUnit}
          help={F.bondSigmaHelp}
          error={F.sigmaInvalid}
          invalid={invalid.bondSigma}
        />
        <NumberField
          {...fields.bind("correlation")}
          label={F.correlationLabel}
          help={F.correlationHelp}
          error={F.correlationInvalid}
          invalid={invalid.correlation}
        />
      </FieldGroup>

    </>
  );

  const portfolioResults = (
    <>
      {/* `live={false}`: the purpose mode above owns the page's one live
          results region, and that is the mode the static export renders. It
          still carries `anchorId`, because in this mode it is where the CTA
          has to land. */}
      <ResultGroup
        title={F.resultTitle}
        className="mt-8"
        live={false}
        anchorId={RESULT_ID}
      >
        <ResultRow label={F.maxDriftLabel} value={driftAnswer} emphasis />
        <ResultRow
          label={F.rebalanceLabel}
          value={
            result === null || result.maxDriftPoints === null
              ? null
              : result.rebalanceDue
                ? F.rebalanceYes
                : F.rebalanceNo
          }
        />
        <ResultRow
          label={F.targetReturnLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.expectedReturnPercent, 2)
          }
        />
        <ResultRow
          label={F.targetSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.standardDeviationPercent, 2)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.riskTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.averageSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.weightedAverageSigmaPercent, 2)
          }
        />
        <ResultRow
          label={F.actualSigmaLabel}
          value={
            result === null
              ? null
              : formatPercent(result.targetStats.standardDeviationPercent, 2)
          }
        />
        <ResultRow
          label={F.benefitLabel}
          value={
            result === null
              ? null
              : `${formatDecimal(
                  result.targetStats.diversificationBenefitPoints,
                  2,
                )} ${F.pointsUnit}`
          }
        />
        <ResultRow
          label={F.ratioLabel}
          value={
            result === null || result.targetStats.returnPerRiskUnit === null
              ? null
              : formatDecimal(result.targetStats.returnPerRiskUnit, 3)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.currentTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.totalLabel}
          value={result === null ? null : dong(result.totalValue)}
        />
        <ResultRow
          label={F.currentReturnLabel}
          value={
            result === null || result.currentStats === null
              ? null
              : formatPercent(result.currentStats.expectedReturnPercent, 2)
          }
        />
        <ResultRow
          label={F.currentSigmaLabel}
          value={
            result === null || result.currentStats === null
              ? null
              : formatPercent(result.currentStats.standardDeviationPercent, 2)
          }
        />
        <ResultRow
          label={F.currentRatioLabel}
          value={
            result === null ||
            result.currentStats === null ||
            result.currentStats.returnPerRiskUnit === null
              ? null
              : formatDecimal(result.currentStats.returnPerRiskUnit, 3)
          }
        />
      </ResultGroup>

      <ResultGroup title={F.ruleTitle} className="mt-4" live={false}>
        <ResultRow
          label={F.equityRuleLabel}
          value={
            result === null || age === null
              ? null
              : `${result.rule.equityBase} − ${age} = ${formatPercent(
                  result.target.equity,
                  0,
                )}`
          }
        />
        <ResultRow
          label={F.cashRuleLabel}
          value={result === null ? null : formatPercent(result.rule.cashPercent, 0)}
        />
        <ResultRow
          label={F.bandLabel}
          value={`${REBALANCE_BAND_POINTS} ${F.pointsUnit}`}
        />
      </ResultGroup>

      {/* The study's own verdict sentences, kept with the figures they are
          about. They used to sit under the six-column table; the table is
          detail now, and a verdict is not. */}
      {result !== null && result.currentWeights === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.emptyNotice}
        </p>
      ) : result !== null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {result.rebalanceDue ? F.rebalanceNotice : F.inBandNotice}
        </p>
      ) : null}

      {result === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {F.invalidNotice}
        </p>
      ) : null}
    </>
  );

  const portfolioDetail = (
    <>
      {rows.length > 0 ? (
        <>
          <p className="mt-8 text-sm leading-relaxed text-ink-3">{T.intro}</p>
          <ResultTable
            className="mt-4"
            caption={T.caption}
            // Six columns: one block per asset class below `md`, so the two
            // money columns are reachable on a phone instead of sitting off
            // the right edge.
            mobileCards
            columns={[
              { label: T.classColumn, nowrap: true },
              { label: T.targetColumn, numeric: true },
              { label: T.currentColumn, numeric: true },
              { label: T.driftColumn, numeric: true },
              { label: T.holdingColumn, numeric: true },
              { label: T.tradeColumn, numeric: true },
            ]}
            rows={rows}
          />
        </>
      ) : null}

      {/* THE ADVANCED STUDY'S OWN EXPLANATION, inside the advanced mode.
          Both of these used to render below the DEFAULT form, where they
          explained a 65/30/5 portfolio and a covariance sum that the default
          purpose allocation never computes — the separation an independent
          review asked for. Nothing is removed: the figures, the correlation
          sweep and the method are all still here, beside the inputs they are
          about. */}
      <p className="mt-8 text-base leading-relaxed text-ink-2">
        {C.correlationNotice}
      </p>

      <section className="mt-8">
        <h3 className="font-display text-lg font-medium text-ink">
          {C.advancedFormula.title}
        </h3>
        <div className="mt-3 space-y-3">
          {C.advancedFormula.body.map((paragraph) => (
            <p
              key={paragraph}
              className="text-base leading-relaxed text-ink-2"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            {modeField}
            {portfolioMode ? portfolioForm : purposeForm}
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={portfolioMode ? anyInvalid : !purposeUsable}
            // Ten inputs in the default mode and eleven in the study, with a
            // date group at the bottom of the form: the pinned block keeps the
            // mode's own main answer on screen while a lower field is edited.
            sticky
            answer={
              portfolioMode
                ? { label: F.maxDriftLabel, value: driftAnswer }
                : { label: P.reserveResultLabel, value: reserveAnswer }
            }
          />
        }
        primary={portfolioMode ? portfolioResults : purposeResults}
        // Same links, same position; the study does not claim the home figure.
        actions={portfolioMode ? (studyActions ?? actions) : actions}
        // The study has no chart; the default mode's allocation bar is the
        // figure that belongs beside the form.
        chart={portfolioMode ? undefined : purposeChart}
        nextSteps={nextSteps}
        detail={portfolioMode ? portfolioDetail : purposeDetail}
      />
    </CalculatorCard>
  );
}
