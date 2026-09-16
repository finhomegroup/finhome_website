"use client";

import { useState } from "react";
import Link from "next/link";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  PLACEHOLDER,
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import { moneyCell } from "@/lib/calc/table-cell";
import { MAX_APR_MONTHS, computeApr } from "@/lib/calc/apr";
import { aprRateBarsModel } from "@/lib/calc/charts/apr-chart";
import { fill } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { APR as C } from "@/content/calculators/apr";
import { APR_ADVANCED as A } from "@/content/calculators/apr-advanced";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { FH_POINTER } from "@/lib/interaction-styles";

/** Which fee detail the reader is working at. */
export type AprMode = "basic" | "advanced";

/**
 * The five cash-fee lines, summed into the one figure the module takes.
 *
 * ONE set of fields for BOTH modes. Basic mode renders only the first, and
 * labels it as the total of the cash fees; advanced mode renders all five with
 * the first named for what it usually is. So the total is the same figure in
 * either mode, switching modes loses nothing, and no line is counted twice.
 */
const FEE_FIELDS = [
  { key: "arrangement", basicLabel: C.form.upfrontLabel, basicHelp: C.form.upfrontHelp },
  { key: "appraisal" },
  { key: "notary" },
  { key: "insurance" },
  { key: "other" },
] as const;

const ADVANCED_FEE_COPY: Record<
  (typeof FEE_FIELDS)[number]["key"],
  { label: string; help: string }
> = {
  arrangement: { label: A.form.arrangementLabel, help: A.form.arrangementHelp },
  appraisal: { label: A.form.appraisalLabel, help: A.form.appraisalHelp },
  notary: { label: A.form.notaryLabel, help: A.form.notaryHelp },
  insurance: { label: A.form.insuranceLabel, help: A.form.insuranceHelp },
  other: { label: A.form.otherLabel, help: A.form.otherHelp },
};

/**
 * The APR tool, in two modes behind two URLs.
 *
 * ONE COMPONENT, ONE ENGINE, ONE SET OF FIELDS. The review was right that two
 * separate pages joined by a link are not an integrated mode: a reader who
 * had typed their loan into the basic page had to retype it to reach the
 * itemised fees. The mode is now a control ON the page, so
 * `/cong-cu/apr-nang-cao/` is this same tool rendered at
 * `initialMode="advanced"` — both routes keep their own URL, metadata, prose
 * and FAQ, and switching mode in place keeps every figure.
 *
 * WHAT DOES NOT TRANSFER is a cross-ROUTE link. Opening the other URL is a
 * new page with its own defaults, and the copy says so rather than implying
 * the numbers travel.
 *
 * No second financial model: `computeApr` solves both modes, and it is the
 * same function the loan comparison's fee view uses.
 */
// No `= {}` default on the parameter: an optional PARAMETER makes the
// component fail `createElement`'s typed overload, so `initialMode` could not
// be passed from a test. React always supplies a props object, so destructuring
// an all-optional props type is safe and keeps `<AprCalculator />` valid.
export function AprCalculator({
  initialMode = "basic",
}: {
  initialMode?: AprMode;
}) {
  const [mode, setMode] = useState<AprMode>(initialMode);
  const advanced = mode === "advanced";

  const fields = useCalcFields({
    amount: C.form.defaultAmount,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    // The basic mode's single total lives in `arrangement`; the other four
    // ship blank so the two modes agree on the total from the first render.
    // Seeded FROM CONTENT, not hardcoded: hardcoding them left
    // `defaultAppraisal` and friends as dead keys nothing could change, and
    // a default that no content file owns is a default no test can vary.
    arrangement: C.form.defaultUpfront,
    appraisal: A.form.defaultAppraisal,
    notary: A.form.defaultNotary,
    insurance: A.form.defaultInsurance,
    other: A.form.defaultOther,
    points: C.form.defaultPoints,
    financed: A.form.defaultFinanced,
    payoff: A.form.defaultPayoff,
  });

  const amount = parseMoney(fields.values.amount);
  const rate = parseDecimal(fields.values.rate);
  // `parseCount`, not `parseDecimal` plus `Number.isInteger`: docs §4 is
  // explicit that `parseDecimal("1.200")` is 1,2, so the dot is eaten before
  // the integer guard runs and the field's own error is unreachable.
  const term = parseCount(fields.values.term);
  const points = parseDecimal(fields.values.points);

  /** A blank fee box is 0; a non-blank one that cannot be read is invalid. */
  const feeOf = (raw: string) => {
    const trimmed = (raw ?? "").trim();
    if (trimmed === "") return { value: 0, invalid: false };
    const parsed = parseMoney(trimmed);
    if (parsed === null || parsed < 0) return { value: 0, invalid: true };
    return { value: parsed, invalid: false };
  };

  /**
   * THE MODE IS PRESENTATION. It reads NOTHING out of the model.
   *
   * The reproduced regression: `financedRaw` used to be
   * `advanced ? fields.values.financed : "0"`, so switching to the compact
   * view silently dropped a 30 triệu financed fee — full APR fell from
   * 8,9503% to 8,7433% — while the visible box said TOTAL upfront fees and
   * showed 30 triệu with a hidden 5 triệu appraisal still counted (35 triệu
   * actual). A layout control must not change the loan. Every fee, the
   * financed amount and the payoff month are now read from the fields in
   * BOTH modes; what differs is only which boxes are on screen, and the
   * compact view DISCLOSES what it is not showing.
   */
  const fees = FEE_FIELDS.map((field) => feeOf(fields.values[field.key]));
  const feeInvalid = fees.map((fee) => fee.invalid);
  const upfrontTotal = feeInvalid.some(Boolean)
    ? null
    : fees.reduce((sum, fee) => sum + fee.value, 0);

  const financed = feeOf(fields.values.financed);

  // Optional: empty means "I'll hold it to term", not a bad entry.
  const payoffRaw = (fields.values.payoff ?? "").trim();
  const payoff = payoffRaw === "" ? null : parseCount(payoffRaw);

  const amountInvalid = amount === null || amount <= 0;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term < 1 || term > MAX_APR_MONTHS;
  const pointsInvalid = points === null || points < 0 || points >= 100;
  // Rejected on the TYPED value rather than clamped into range: the module
  // clamps to the term for its own safety, but a UI that silently moved a
  // typed 300 to 240 would answer a question nobody asked.
  const payoffInvalid =
    payoffRaw !== "" &&
    (payoff === null ||
      payoff < 1 ||
      payoff > MAX_APR_MONTHS ||
      (term !== null && payoff > term));

  /**
   * Is a fee breakdown in play?
   *
   * This is what makes the compact fee box a DERIVED read-only total rather
   * than an editable one. Once a second fee line exists, a single editable
   * box labelled "total" is either a lie about what it contains or a control
   * that silently discards the other lines on the next keystroke. Neither is
   * acceptable, so the compact view shows the true total and sends the reader
   * to the detailed mode to change it.
   */
  const extraFeeKeys = FEE_FIELDS.slice(1)
    .map((field, index) => ({ field, fee: fees[index + 1] }))
    .filter(
      (entry) =>
        (fields.values[entry.field.key] ?? "").trim() !== "" || entry.fee.invalid,
    );
  const breakdownActive = extraFeeKeys.length > 0;

  /** Assumptions the compact view holds but cannot edit. */
  const retainedInCompact =
    breakdownActive ||
    financed.value > 0 ||
    financed.invalid ||
    (points ?? 0) > 0 ||
    pointsInvalid ||
    payoffRaw !== "";

  /**
   * The unusable fields the compact view is not showing, BY NAME.
   *
   * The result clears in both modes — the model reads every field — so a
   * reader in compact mode would otherwise see dashes with no visible cause.
   *
   * `feeInvalid.slice(1)` was not the right set. The first fee line is on
   * screen in compact mode only while the box is editable: as soon as
   * `breakdownActive` turns it into a read-only derived total, a malformed
   * `arrangement` is hidden too. The reproduced case — arrangement `abc` plus
   * a 5 triệu appraisal, then compact — cleared the result with no notice at
   * all, and the retained list named only the fee that parsed. The fee lines
   * after the first are never on screen in compact mode, so they are hidden
   * whatever the total is doing.
   */
  const hiddenInvalidLabels = [
    ...FEE_FIELDS.filter(
      (_field, index) => feeInvalid[index] && (index > 0 || breakdownActive),
    ).map((field) => ADVANCED_FEE_COPY[field.key].label),
    ...(financed.invalid ? [A.form.financedLabel] : []),
    ...(payoffInvalid ? [A.form.payoffLabel] : []),
  ];
  const hiddenInvalid = !advanced && hiddenInvalidLabels.length > 0;

  const fieldsUsable =
    !amountInvalid &&
    !rateInvalid &&
    !termInvalid &&
    !pointsInvalid &&
    !financed.invalid &&
    !payoffInvalid &&
    upfrontTotal !== null;

  const result = fieldsUsable
    ? computeApr({
        amount,
        annualRatePercent: rate,
        termMonths: term,
        upfrontFees: upfrontTotal,
        financedFees: financed.value,
        pointsPercent: points,
        payoffMonths: payoff ?? undefined,
      })
    : null;

  // Every box parses but the fees swallow the loan — a note about the
  // combination, not a fault in any single field.
  const feesTooLarge = fieldsUsable && result === null;
  const unsolvable = result !== null && result.aprPercent === null;

  /** A raw cell, for the compact detail panel. */
  const cash = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : moneyCell(figure);

  /**
   * Full đồng with the currency mark, for the horizon block.
   *
   * Not `cash`: those rows are an arrow PAIR of two amounts, which is prose
   * rather than one figure, so `DetailFigures`' single-unit compacting does
   * not apply to them.
   */
  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? PLACEHOLDER
      : `${formatMoney(figure)} ₫`;

  const chart = aprRateBarsModel(result, rate ?? 0, amount ?? 0, {
    ...CHART_UI.money,
    ...C.chart,
    title: C.form.chartTitle,
  });

  /**
   * What the collapsed fee panel is doing to the answer.
   *
   * `active` is decided from the PARSED values the calculator itself uses, so
   * a reader can see that a fee inside a closed panel is moving the APR — and
   * a malformed entry counts as active, because they need to find it.
   */
  const feeSettings: DisclosedSetting[] = [
    {
      key: "upfront",
      label: A.form.upfrontTotalLabel,
      value: `${formatMoney(upfrontTotal ?? 0)} ₫`,
      active: feeInvalid.some(Boolean) || (upfrontTotal ?? 0) > 0,
    },
    {
      key: "points",
      label: C.form.pointsLabel,
      value: `${formatDecimal(points ?? 0, 2)}%`,
      active: pointsInvalid || (points ?? 0) > 0,
    },
    {
      key: "financed",
      label: A.form.financedLabel,
      value: `${formatMoney(financed.value)} ₫`,
      active: financed.invalid || financed.value > 0,
    },
  ];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.loanGroup}>
        <NumberField
          {...fields.bind("amount")}
          label={C.form.amountLabel}
          unit={C.form.amountUnit}
          help={C.form.amountHelp}
          error={C.form.amountInvalid}
          invalid={amountInvalid}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={rateInvalid}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={C.form.termHelp}
          error={C.form.termInvalid}
          invalid={termInvalid}
        />
      </FieldGroup>

      {/* The mode, ON the page. Switching keeps every figure, which is the
          whole difference between a mode and a second tool. */}
      <FieldGroup className="mt-8">
        <RadioGroupField
          value={mode}
          onValueChange={(next) => setMode(next as AprMode)}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "basic", label: C.form.modeBasic },
            { value: "advanced", label: C.form.modeAdvanced },
          ]}
        />
      </FieldGroup>

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {advanced ? C.form.modeNoteAdvanced : C.form.modeNoteBasic}
      </p>

      {advanced ? (
        <>
          {/* The payoff month is what the advanced mode is FOR, so it stays in
              the primary flow while the fee itemisation goes behind a panel
              that discloses what is active inside it. */}
          <FieldGroup title={A.form.payoffGroup} className="mt-8">
            <NumberField
              {...fields.bind("payoff")}
              label={A.form.payoffLabel}
              help={A.form.payoffHelp}
              error={A.form.payoffInvalid}
              invalid={payoffInvalid}
            />
          </FieldGroup>

          <AdvancedFields
            title={A.form.feeAllocationTitle}
            settings={feeSettings}
            emptySummary={A.form.feeAllocationSummary}
            className="mt-8"
          >
            {FEE_FIELDS.map((field, index) => (
              <NumberField
                key={field.key}
                {...fields.bind(field.key)}
                label={ADVANCED_FEE_COPY[field.key].label}
                unit={A.form.feeUnit}
                help={ADVANCED_FEE_COPY[field.key].help}
                error={A.form.feeInvalid}
                invalid={feeInvalid[index]}
              />
            ))}
            <NumberField
              {...fields.bind("points")}
              label={A.form.pointsLabel}
              unit={A.form.pointsUnit}
              help={A.form.pointsHelp}
              error={A.form.pointsInvalid}
              invalid={pointsInvalid}
            />
            <NumberField
              {...fields.bind("financed")}
              label={A.form.financedLabel}
              unit={A.form.financedUnit}
              help={A.form.financedHelp}
              error={A.form.financedInvalid}
              invalid={financed.invalid}
            />
          </AdvancedFields>
        </>
      ) : (
        <FieldGroup title={C.form.feeGroup} className="mt-8">
          {breakdownActive ? (
            /* A DERIVED, read-only total. Once a breakdown exists, an
               editable box labelled "total" would either misdescribe what it
               holds or discard the other lines on the next keystroke. The
               figure shown here is the one the model used. */
            <div>
              <p className="font-display text-base font-medium text-ink">
                {C.form.derivedTotalLabel}
              </p>
              <p className="mt-2 font-display text-xl font-medium tabular-nums text-ink">
                {upfrontTotal === null
                  ? PLACEHOLDER
                  : `${formatMoney(upfrontTotal)} ₫`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">
                {C.form.derivedTotalHelp}
              </p>
            </div>
          ) : (
            <NumberField
              {...fields.bind("arrangement")}
              label={FEE_FIELDS[0].basicLabel}
              unit={C.form.upfrontUnit}
              help={FEE_FIELDS[0].basicHelp}
              error={C.form.upfrontInvalid}
              invalid={feeInvalid[0]}
            />
          )}
          <NumberField
            {...fields.bind("points")}
            label={C.form.pointsLabel}
            unit={C.form.pointsUnit}
            help={C.form.pointsHelp}
            error={C.form.pointsInvalid}
            invalid={pointsInvalid}
          />
        </FieldGroup>
      )}

      {/* Everything the compact view is HOLDING but not showing. A layout
          control that quietly dropped a financed fee is the regression this
          block exists to make impossible: the assumptions stay in the model
          and they are named here, with the route to edit them. */}
      {!advanced && retainedInCompact ? (
        <div className="mt-4 rounded-2xl border border-ink-4/20 p-4">
          <p className="font-display text-base font-medium text-ink">
            {C.form.retainedTitle}
          </p>
          <ul className="mt-2 space-y-1">
            {breakdownActive ? (
              <li className="text-sm leading-relaxed text-ink-2">
                {`${C.form.retainedBreakdown}: ${extraFeeKeys
                  .map((entry) => ADVANCED_FEE_COPY[entry.field.key].label)
                  .join(", ")}`}
              </li>
            ) : null}
            {financed.value > 0 || financed.invalid ? (
              <li className="text-sm leading-relaxed text-ink-2">
                {`${A.form.financedLabel}: ${
                  financed.invalid
                    ? C.form.retainedUnreadable
                    : `${formatMoney(financed.value)} ₫`
                }`}
              </li>
            ) : null}
            {(points ?? 0) > 0 || pointsInvalid ? (
              <li className="text-sm leading-relaxed text-ink-2">
                {`${C.form.pointsLabel}: ${
                  pointsInvalid
                    ? C.form.retainedUnreadable
                    : `${formatDecimal(points ?? 0, 2)}%`
                }`}
              </li>
            ) : null}
            {payoffRaw !== "" ? (
              <li className="text-sm leading-relaxed text-ink-2">
                {`${A.form.payoffLabel}: ${
                  payoffInvalid
                    ? C.form.retainedUnreadable
                    : formatDecimal(payoff ?? 0, 0)
                }`}
              </li>
            ) : null}
          </ul>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            {C.form.retainedEditHint}
          </p>
          <button
            type="button"
            onClick={() => setMode("advanced")}
            className={`mt-2 text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
          >
            {C.form.retainedEditAction}
          </button>
        </div>
      ) : null}

      {/* Naming the field is the difference between "something is wrong
          somewhere you cannot see" and a reader knowing which box to open the
          detailed mode for. The edit-details button above is the recovery and
          stays where it is. */}
      {hiddenInvalid ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {`${C.form.hiddenInvalidNotice} ${
            C.form.hiddenInvalidFields
          }: ${hiddenInvalidLabels.join(", ")}.`}
        </p>
      ) : null}

      {/* The contract rate first, then the modelled one, then the gap. Four
          decimals: the whole point of the tool is a difference that shows up
          in the second and third digit after the comma. */}
      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.nominalLabel}
          value={rate === null ? null : formatPercent(rate, 4)}
        />
        <ResultRow
          label={C.form.aprLabel}
          value={
            result?.aprPercent == null
              ? null
              : formatPercent(result.aprPercent, 4)
          }
        />
        {advanced ? (
          <ResultRow
            label={A.form.payoffAprLabel}
            value={
              result?.payoffAprPercent == null
                ? null
                : formatPercent(result.payoffAprPercent, 4)
            }
          />
        ) : null}
        <ResultRow
          label={C.form.spreadLabel}
          value={
            result?.aprSpreadPoints == null
              ? null
              : `${formatDecimal(result.aprSpreadPoints, 4)} ${C.form.pointsSuffix}`
          }
        />
      </ResultGroup>

      {/*
        ORIGINAL ROW 4: the MONEY at the chosen payoff month.

        An APR is a rate, and a rate does not tell a borrower what the loan
        has cost them by the month they actually clear it. Three figures do:
        interest accrued, that plus every fee, and the principal still owed —
        each beside its full-term twin, from the same schedule.

        In the DETAILED view only, alongside the payoff APR row and the payoff
        balance figure, and for the same reason: this is the question
        `/cong-cu/apr-nang-cao/` exists for. Mode is presentation — the compact
        view computes the identical figures and names the retained payoff month
        in its own disclosure block, so switching changes what is on screen and
        never what the loan costs. A test pins that.
      */}
      {advanced && result?.payoffCost != null ? (
        <>
          <ResultGroup
            title={A.form.horizonTitle}
            className="mt-4"
            live={false}
          >
            <ResultRow
              label={fill(A.form.horizonInterestLabel, {
                n: formatDecimal(result.payoffMonths ?? 0, 0),
              })}
              value={`${money(result.payoffInterest)} → ${money(
                result.totalInterest,
              )}`}
              prose
            />
            <ResultRow
              label={fill(A.form.horizonCostLabel, {
                n: formatDecimal(result.payoffMonths ?? 0, 0),
              })}
              value={`${money(result.payoffCost)} → ${money(result.totalCost)}`}
              prose
            />
            {/* Principal, NOT a cost — its own row, never added in. */}
            <ResultRow
              label={fill(A.form.horizonBalanceLabel, {
                n: formatDecimal(result.payoffMonths ?? 0, 0),
              })}
              value={money(result.payoffBalance)}
            />
          </ResultGroup>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">
            {A.form.horizonNote}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            {A.form.horizonExcludesNote}
          </p>
        </>
      ) : null}

      {/* The visual the original row asked for: the contract rate beside the
          modelled one, with the fee breakdown in the figure's own table. */}
      <ChartFigure model={chart}>
        <BarChart model={chart} />
      </ChartFigure>

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.modeledNote}
      </p>

      {feesTooLarge ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {A.form.feesTooLargeNotice}
        </p>
      ) : null}

      {unsolvable ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.unsolvableNotice}
        </p>
      ) : null}

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {advanced ? A.form.settlementFeeNotice : C.form.payoffNote}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.crossRouteNote}
      </p>
      <ul className="mt-2 space-y-1">
        <li>
          <Link
            href={advanced ? `${C.slug}/` : `${A.slug}/`}
            className={`text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
          >
            {advanced ? A.form.basicLinkLabel : C.form.advancedLinkLabel}
          </Link>
        </li>
        <li>
          <Link
            href={`${LOAN_COMPARE.slug}/`}
            className={`text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
          >
            {C.form.compareLinkLabel}
          </Link>
        </li>
      </ul>

      <DetailDisclosure
        title={C.form.detailDisclosureTitle}
        hint={C.form.detailDisclosureHint}
        className="mt-8"
      >
        <DetailFigures
          title={C.form.detailTitle}
          figures={[
            {
              label: C.form.effectiveLabel,
              value:
                result?.aprEffectivePercent == null
                  ? null
                  : formatPercent(result.aprEffectivePercent, 4),
            },
            { label: C.form.paymentLabel, value: cash(result?.monthlyPayment) },
            ...(advanced
              ? [
                  {
                    label: A.form.principalLabel,
                    value: cash(result?.principal),
                  },
                ]
              : []),
            {
              label: C.form.netProceedsLabel,
              value: cash(result?.netProceeds),
            },
            { label: C.form.totalFeesLabel, value: cash(result?.totalFees) },
            { label: C.form.pointsCostLabel, value: cash(result?.pointsCost) },
            ...(advanced
              ? [
                  {
                    label: A.form.payoffBalanceLabel,
                    value: cash(result?.payoffBalance),
                  },
                ]
              : []),
            {
              label: C.form.totalInterestLabel,
              value: cash(result?.totalInterest),
            },
            { label: C.form.totalCostLabel, value: cash(result?.totalCost) },
            { label: C.form.totalPaidLabel, value: cash(result?.totalPaid) },
          ]}
        />
      </DetailDisclosure>
    </CalculatorCard>
  );
}
