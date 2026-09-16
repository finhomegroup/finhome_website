"use client";

import { useState } from "react";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import { CHART_UI } from "@/content/calculators/chart-ui";
import {
  monthlyAllocationModel,
  priceCompositionModel,
} from "@/lib/calc/charts/affordability-chart";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import { moneyCell } from "@/lib/calc/table-cell";
import {
  computeAffordability,
  type AffordabilityInput,
  type AffordabilityMode,
  type AffordabilityResult,
} from "@/lib/calc/affordability";
import {
  compareAffordabilityScenarios,
  type AffordabilityComparison,
  type AffordabilityScenario,
  type ComparedKey,
} from "@/lib/calc/affordability-compare";
import { FH_POINTER } from "@/lib/interaction-styles";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";

/** Full đồng with the currency mark, shared by the two components here. */
function money(figure: number | null | undefined) {
  return figure === null || figure === undefined
    ? null
    : `${formatMoney(figure)} ₫`;
}

/**
 * The captured scenario beside the current one.
 *
 * A separate component with NO hooks, for two reasons. It is the only part of
 * this page whose interesting states cannot be reached by a server render of
 * the form — a snapshot only exists after a click — so exposing it as a
 * component is what lets a test drive real engine output through the real
 * markup instead of asserting the arithmetic twice. And it keeps the
 * calculator's own body readable.
 *
 * `comparison === null` with a snapshot present is a real state, not a bug: it
 * is what a malformed field on the CURRENT side looks like. The snapshot stays.
 */
export function AffordabilityScenarioComparison({
  snapshot,
  currentInput,
  result,
  comparison,
}: {
  snapshot: AffordabilityScenario;
  /**
   * The assumptions behind `result`. Null when the form cannot be read.
   *
   * Passed in rather than re-derived: the comparison must name the values the
   * displayed result came from, and building them twice is how two figures on
   * one page start disagreeing.
   */
  currentInput: AffordabilityInput | null;
  result: AffordabilityResult | null;
  comparison: AffordabilityComparison | null;
}) {
  /** "mốc → hiện tại", or nothing when there is no current figure. */
  const pair = (
    pick: (scenario: AffordabilityResult) => number | null,
  ): string | null =>
    comparison === null || result === null
      ? null
      : `${money(pick(snapshot.result))} → ${money(pick(result))}`;

  /** Which ceiling capped the price, in words. */
  const bindingWord = (scenario: AffordabilityResult) =>
    scenario.priceBinding === "financing"
      ? C.form.priceBindingFinancing
      : C.form.priceBindingPayment;

  /**
   * One changed assumption, as "label: before → after".
   *
   * Naming only the FIELD left the reader to remember what they had typed a
   * moment ago, which is what a comparison exists to spare them. The value is
   * formatted by what the key MEANS — money, a rate, a count of months, or
   * the mode — because "10,5" and "10.500.000 ₫" are not interchangeable.
   */
  const MONEY_KEYS: ComparedKey[] = [
    "monthlyIncome",
    "monthlyNetIncome",
    "essentialExpenses",
    "monthlyBuffer",
    "monthlyDebts",
    "downPayment",
    "cashReserve",
    "monthlyHousingCosts",
  ];
  const PERCENT_KEYS: ComparedKey[] = [
    "purchaseCostPercent",
    "assumedMaxLtvPercent",
    "annualRatePercent",
    "housingRatioPercent",
    "totalDebtRatioPercent",
  ];

  const changedValue = (key: ComparedKey, input: AffordabilityInput) => {
    const raw = input[key];
    if (raw === undefined) return C.form.compareUnset;
    if (key === "mode") {
      return raw === "ceiling"
        ? C.form.compareModeCeiling
        : C.form.compareModeHousehold;
    }
    const value = raw as number;
    if (MONEY_KEYS.includes(key)) return money(value) ?? C.form.compareUnset;
    if (PERCENT_KEYS.includes(key)) return formatPercent(value, 2);
    // `termMonths`, the only remaining key: a count, never a money unit.
    return `${formatDecimal(value, 0)} ${C.form.compareMonthsUnit}`;
  };

  return (
    <>
      {/* The snapshot's OWN figures on the left of every row, so the baseline
          is visible rather than remembered. `prose`: these values are two
          amounts and an arrow, not one figure, and the figure treatment cannot
          shrink them inside a 266 px panel. */}
      <ResultGroup title={C.form.compareTitle} live={false}>
        <ResultRow
          label={C.form.comparePriceLabel}
          value={pair((scenario) => scenario.maxPrice)}
          prose
        />
        <ResultRow
          label={C.form.comparePriceChangeLabel}
          value={comparison === null ? null : money(comparison.priceChange)}
        />
        <ResultRow
          label={C.form.compareLoanLabel}
          value={pair((scenario) => scenario.maxLoan)}
          prose
        />
        <ResultRow
          label={C.form.comparePaymentLabel}
          value={pair((scenario) => scenario.affordablePrincipalInterest)}
          prose
        />
        <ResultRow
          label={C.form.compareExpectedPaymentLabel}
          value={pair((scenario) => scenario.expectedPrincipalInterest)}
          prose
        />
        <ResultRow
          label={C.form.compareCapacityLabel}
          value={pair((scenario) => scenario.paymentSupportedLoan)}
          prose
        />
        {/* Both sides' binding reason, by name. The detail panel below holds
            only the current scenario's row, so a note pointing at "hai dòng"
            there would point at something that does not exist. */}
        <ResultRow
          label={C.form.compareBindingLabel}
          value={
            comparison === null || result === null
              ? null
              : `${bindingWord(snapshot.result)} → ${bindingWord(result)}`
          }
          prose
        />
      </ResultGroup>

      {/* WHICH assumptions moved, and FROM what TO what. Two figures with no
          named cause is the thing this replaces. */}
      {comparison !== null && comparison.changedKeys.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-ink-2">
            {`${C.form.compareChangedIntro}:`}
          </p>
          <ul className="mt-1 space-y-1">
            {comparison.changedKeys.map((key) => (
              <li key={key} className="text-sm leading-relaxed text-ink-2">
                {`${C.form.compareKeyLabels[key]}: ${changedValue(
                  key,
                  snapshot.input,
                )} → ${
                  currentInput === null
                    ? C.form.compareUnset
                    : changedValue(key, currentInput)
                }`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {comparison !== null && comparison.changedKeys.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.compareUnchangedNote}
        </p>
      ) : null}
      {/* A broken field on the current side does not delete the mốc. */}
      {comparison === null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareStaleNote}
        </p>
      ) : null}
      {comparison?.modeChanged ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareModeChangedNote}
        </p>
      ) : null}
      {comparison?.conclusionLimited ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareLimitedNote}
        </p>
      ) : null}
      {comparison?.priceBindingChanged ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareBindingChangedNote}
        </p>
      ) : null}
      {/* The no-store statement stays visible in this state too: it is the
          reason the comparison disappears on reload. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.compareCaptureHint}
      </p>
    </>
  );
}

/**
 * The affordability calculator.
 *
 * TWO MODES, AND KEEPING THEM APART IS THE POINT.
 *
 * "Ngân hàng cho vay tối đa bao nhiêu?" is a credit ceiling: two underwriting
 * ratios on GROSS income. "Hộ của tôi trả được bao nhiêu?" is a budget: NET
 * income less the things that leave the account before a mortgage does. They
 * are different questions with different answers, and the audit found this
 * page presenting the first under a label that read like the second — a buyer
 * took a lender's maximum for a figure they could live with.
 *
 * Household mode is the DEFAULT, because it is the question a first-home buyer
 * actually has. Ceiling mode is preserved, disclosed and unchanged: the gross
 * income field never quietly becomes a net one.
 *
 * AN EMPTY EXPENSES FIELD IS NOT ZERO EXPENSES. The field ships blank, and a
 * blank one sets `expensesKnown: false`, which makes the module flag
 * `conclusionLimited`. The page then says the figure is an upper bound rather
 * than a budget. Pre-filling it with "0" would have made household mode
 * silently degenerate into ceiling mode under a friendlier name.
 *
 * The live region is three rows — the price, the loan and the monthly payment.
 * Everything else, including which limit is binding, is a second view of the
 * same computation and sits in a `live={false}` group.
 */
export function AffordabilityCalculator() {
  const initial = {
    mode: C.form.defaultMode,
    netIncome: C.form.defaultNetIncome,
    essentials: C.form.defaultEssentials,
    buffer: C.form.defaultBuffer,
    income: C.form.defaultIncome,
    debts: C.form.defaultDebts,
    down: C.form.defaultDown,
    reserve: C.form.defaultReserve,
    purchaseCost: C.form.defaultPurchaseCost,
    ltv: C.form.defaultLtv,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    housingCosts: C.form.defaultHousingCosts,
    housingRatio: C.form.defaultHousingRatio,
    totalRatio: C.form.defaultTotalRatio,
  };
  const fields = useCalcFields(initial);

  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const mode = fields.values.mode as AffordabilityMode;
  const household = mode === "household";

  const netIncome = parseMoney(fields.values.netIncome);
  // A blank field means "I have not told you", and it is passed to the module
  // as `undefined` — NOT as 0. The module then reports `conclusionLimited` and
  // the page refuses to call the output a budget. Sending a 0 here would make
  // household mode silently return the ratio ceiling under a nicer label.
  const essentialsRaw = fields.values.essentials.trim();
  const essentialsKnown = essentialsRaw !== "";
  const essentials = essentialsKnown ? parseMoney(essentialsRaw) : undefined;
  const buffer = parseMoney(fields.values.buffer);
  const income = parseMoney(fields.values.income);
  const debts = parseMoney(fields.values.debts);
  const down = parseMoney(fields.values.down);
  const reserve = parseMoney(fields.values.reserve);
  const purchaseCost = parseDecimal(fields.values.purchaseCost);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const housingCosts = parseMoney(fields.values.housingCosts);
  const housingRatio = parseDecimal(fields.values.housingRatio);
  const totalRatio = parseDecimal(fields.values.totalRatio);
  const ltv = parseDecimal(fields.values.ltv);

  const incomeInvalid = income === null || income <= 0;
  const ltvInvalid = ltv === null || ltv < 0 || ltv > 100;
  const netIncomeInvalid = household && (netIncome === null || netIncome <= 0);
  const essentialsInvalid =
    essentialsKnown && (essentials === null || essentials === undefined || essentials < 0);
  const bufferInvalid = buffer === null || buffer < 0;
  const debtsInvalid = debts === null || debts < 0;
  const downInvalid = down === null || down < 0;
  const reserveInvalid = reserve === null || reserve < 0;
  const purchaseCostInvalid =
    purchaseCost === null || purchaseCost < 0 || purchaseCost >= 100;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const housingCostsInvalid = housingCosts === null || housingCosts < 0;
  const housingRatioInvalid =
    housingRatio === null || housingRatio < 0 || housingRatio > 100;
  const totalRatioInvalid =
    totalRatio === null || totalRatio < 0 || totalRatio > 100;

  const usable =
    !incomeInvalid &&
    !netIncomeInvalid &&
    !essentialsInvalid &&
    !bufferInvalid &&
    !debtsInvalid &&
    !downInvalid &&
    !reserveInvalid &&
    !purchaseCostInvalid &&
    !rateInvalid &&
    !termInvalid &&
    !housingCostsInvalid &&
    !housingRatioInvalid &&
    !totalRatioInvalid &&
    !ltvInvalid;

  /**
   * The input object, built ONCE.
   *
   * It used to be an inline argument. It is a named value now because the
   * comparison snapshot has to capture exactly the assumptions the displayed
   * result came from — building it twice would let the two drift, which is the
   * whole class of defect the APR mode switch was.
   */
  const input: AffordabilityInput | null = usable
    ? {
        mode,
        monthlyIncome: income,
        monthlyNetIncome: household ? (netIncome ?? undefined) : undefined,
        essentialExpenses: essentials ?? undefined,
        monthlyBuffer: buffer,
        monthlyDebts: debts,
        downPayment: down,
        cashReserve: reserve,
        purchaseCostPercent: purchaseCost,
        assumedMaxLtvPercent: ltv,
        annualRatePercent: rate,
        termMonths: term,
        monthlyHousingCosts: housingCosts,
        housingRatioPercent: housingRatio,
        totalDebtRatioPercent: totalRatio,
      }
    : null;

  const result: AffordabilityResult | null =
    input === null ? null : computeAffordability(input);

  /**
   * ORIGINAL ROW 7 — the baseline-versus-changed comparison.
   *
   * A TRANSIENT IN-PAGE SNAPSHOT, and the copy says so. It is `useState`, so
   * it lives exactly as long as this page is open: no storage, no query
   * string, nothing sent anywhere. That is not a limitation worked around —
   * a figure this page "saved" would be a false claim about a site that
   * stores nothing, and a bank's acceptance is not what any of this is.
   *
   * The snapshot keeps its OWN assumptions, so the comparison can name which
   * of them the reader has since changed. It is never recomputed: rebuilding
   * the baseline from today's fields is exactly how a baseline stops being one.
   */
  const [snapshot, setSnapshot] = useState<AffordabilityScenario | null>(null);

  const comparison =
    snapshot !== null && input !== null && result !== null
      ? compareAffordabilityScenarios(snapshot, { input, result })
      : null;

  /**
   * The same figure as a RAW cell, for the expanded detail.
   *
   * The headline rows keep full đồng — that is the answer. The detail panel
   * shows thirteen amounts, so those go in unformatted and `DetailFigures`
   * picks one unit for the block.
   */
  const cash = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : moneyCell(figure);

  const advancedSettings: DisclosedSetting[] = [
    {
      key: "housingCosts",
      label: C.form.housingCostsLabel,
      value: money(housingCosts ?? 0) ?? "",
      active: (housingCosts ?? 0) > 0,
    },
    {
      key: "housingRatio",
      label: C.form.housingRatioLabel,
      value: formatPercent(housingRatio ?? 0, 0),
      active: housingRatio !== null && housingRatio !== 40,
    },
    {
      key: "totalRatio",
      label: C.form.totalRatioLabel,
      value: formatPercent(totalRatio ?? 0, 0),
      active: totalRatio !== null && totalRatio !== 50,
    },
    {
      key: "ltv",
      label: C.form.ltvLabel,
      value: formatPercent(ltv ?? 100, 0),
      // 100 is "no deposit assumed", which is the neutral state.
      active: ltv !== null && ltv < 100,
    },
  ];

  const priceChart = priceCompositionModel(result, {
    ...CHART_UI.money,
    ...C.priceChart,
  });
  const monthlyChart = monthlyAllocationModel(
    result,
    {
      netIncome: netIncome ?? undefined,
      essentialExpenses: essentials ?? undefined,
      monthlyBuffer: buffer ?? undefined,
      monthlyDebts: debts ?? undefined,
      // So the ledger can separate the instalment from the other housing
      // costs instead of showing one "trả nợ nhà" block for both.
      monthlyHousingCosts: housingCosts ?? undefined,
    },
    { ...CHART_UI.money, ...C.monthlyChart },
  );

  const bindingLabel =
    result === null
      ? null
      : result.bindingLimit === "household"
        ? C.form.bindingHousehold
        : result.bindingLimit === "totalDebt"
          ? C.form.bindingTotal
          : C.form.bindingHousing;

  return (
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

      <FieldGroup>
        <RadioGroupField
          {...fields.bind("mode")}
          legend={C.form.modeLegend}
          help={C.form.modeHelp}
          options={[
            { value: "household", label: C.form.modeHousehold },
            { value: "ceiling", label: C.form.modeCeiling },
          ]}
        />
      </FieldGroup>

      <FieldGroup title={C.form.incomeGroup} className="mt-8">
        <NumberField
          {...fields.bind("income")}
          label={C.form.incomeLabel}
          unit={C.form.incomeUnit}
          help={C.form.incomeHelp}
          error={C.form.incomeInvalid}
          invalid={incomeInvalid}
        />
        <NumberField
          {...fields.bind("debts")}
          label={C.form.debtsLabel}
          unit={C.form.debtsUnit}
          help={C.form.debtsHelp}
          error={C.form.debtsInvalid}
          invalid={debtsInvalid}
        />
      </FieldGroup>

      {/* Only in household mode: these three fields have no meaning in a
          credit-ceiling calculation, and rendering them there would imply the
          ceiling takes living costs into account. It does not. */}
      {household ? (
        <FieldGroup title={C.form.householdGroup} className="mt-8">
          <NumberField
            {...fields.bind("netIncome")}
            label={C.form.netIncomeLabel}
            unit={C.form.netIncomeUnit}
            help={C.form.netIncomeHelp}
            error={C.form.netIncomeInvalid}
            invalid={netIncomeInvalid}
          />
          <NumberField
            {...fields.bind("essentials")}
            label={C.form.essentialsLabel}
            unit={C.form.essentialsUnit}
            help={C.form.essentialsHelp}
            error={C.form.essentialsInvalid}
            invalid={essentialsInvalid}
          />
          <NumberField
            {...fields.bind("buffer")}
            label={C.form.bufferLabel}
            unit={C.form.bufferUnit}
            help={C.form.bufferHelp}
            error={C.form.bufferInvalid}
            invalid={bufferInvalid}
          />
        </FieldGroup>
      ) : null}

      <FieldGroup title={C.form.purchaseGroup} className="mt-8">
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={downInvalid}
        />
        <NumberField
          {...fields.bind("reserve")}
          label={C.form.reserveLabel}
          unit={C.form.reserveUnit}
          help={C.form.reserveHelp}
          error={C.form.reserveInvalid}
          invalid={reserveInvalid}
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

      <AdvancedFields
        title={C.form.ratioGroup}
        settings={advancedSettings}
        className="mt-8"
      >
        <NumberField
          {...fields.bind("purchaseCost")}
          label={C.form.purchaseCostLabel}
          unit={C.form.purchaseCostUnit}
          help={C.form.purchaseCostHelp}
          error={C.form.purchaseCostInvalid}
          invalid={purchaseCostInvalid}
        />
        <NumberField
          {...fields.bind("housingCosts")}
          label={C.form.housingCostsLabel}
          unit={C.form.housingCostsUnit}
          help={C.form.housingCostsHelp}
          error={C.form.housingCostsInvalid}
          invalid={housingCostsInvalid}
        />
        <NumberField
          {...fields.bind("housingRatio")}
          label={C.form.housingRatioLabel}
          unit={C.form.housingRatioUnit}
          help={C.form.housingRatioHelp}
          error={C.form.housingRatioInvalid}
          invalid={housingRatioInvalid}
        />
        <NumberField
          {...fields.bind("totalRatio")}
          label={C.form.totalRatioLabel}
          unit={C.form.totalRatioUnit}
          help={C.form.totalRatioHelp}
          error={C.form.totalRatioInvalid}
          invalid={totalRatioInvalid}
        />
        <NumberField
          {...fields.bind("ltv")}
          label={C.form.ltvLabel}
          unit={C.form.ltvUnit}
          help={C.form.ltvHelp}
          error={C.form.ltvInvalid}
          invalid={ltvInvalid}
        />
      </AdvancedFields>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.maxPriceLabel} value={money(result?.maxPrice)} />
        <ResultRow label={C.form.maxLoanLabel} value={money(result?.maxLoan)} />
        {/* THE BUDGET AND THE BILL ARE TWO ROWS. The budget is the ceiling the
            price was solved from; the instalment is what the loan actually
            used charges, and they differ whenever the cash bound the price. */}
        <ResultRow
          label={C.form.paymentLabel}
          value={money(result?.affordablePrincipalInterest)}
        />
        <ResultRow
          label={C.form.expectedPaymentLabel}
          value={money(result?.expectedPrincipalInterest)}
        />
      </ResultGroup>

      {/* The notices that qualify the figure sit immediately under it, not at
          the bottom of the page. A reader who stops at the headline must still
          have read the caveat that applies to it. */}
      {result?.conclusionLimited ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          {C.form.essentialsUnknownNotice}
        </p>
      ) : null}

      {result && !household ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          {C.form.ceilingIsNotBudgetNotice}
        </p>
      ) : null}

      {/* Why the two monthly figures differ. Mounted only when they actually
          do: at a payment-bound price they coincide and there is nothing to
          explain. Half a đồng, because these are two float computations of the
          same quantity in that case, not a financial allowance. */}
      {result &&
      result.affordablePrincipalInterest - result.expectedPrincipalInterest >
        0.5 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.expectedPaymentBelowBudgetNotice}
        </p>
      ) : null}

      {/* The price is capped by the cash rather than by the payment — the
          buyer's obvious response would be to cut spending, which would not
          help. Say which constraint it actually is. */}
      {result && result.maxPrice > 0 && result.priceBinding === "financing" ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.financingBoundNotice}
        </p>
      ) : null}

      {result?.financingBlocked ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.financingBlockedNotice}
        </p>
      ) : null}

      {result?.infeasible ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.infeasibleNotice}
        </p>
      ) : null}

      {result?.noRoom && !result.infeasible && !result.financingBlocked ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.noRoomNotice}
        </p>
      ) : null}

      {result && result.purchaseCosts === 0 && result.maxPrice > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.purchaseCostsExcludedNotice}
        </p>
      ) : null}

      {/*
        ORIGINAL ROW 7's "so kịch bản", as a comparison the reader takes
        rather than a link to a second tool.

        The control is mounted only when there is a result to record: a button
        that captures nothing is worse than no button. Both buttons are plain
        `type="button"` inside no form, so neither can submit anything, and
        nothing here goes into a URL.
      */}
      <div className="mt-6 rounded-2xl border border-ink-4/20 p-4">
        {snapshot === null ? (
          <>
            <button
              type="button"
              disabled={result === null || input === null}
              onClick={() =>
                input !== null && result !== null
                  ? setSnapshot({ input, result })
                  : undefined
              }
              // `-ink`: 16px normal-weight text owes 4.5:1 and the raw brand
              // green is 3.02:1 on white, 2.91:1 on `bg-soft`.
              className={`font-display text-base font-medium text-brand-green-ink underline-offset-4 hover:underline disabled:text-ink-4 disabled:no-underline ${FH_POINTER}`}
            >
              {C.form.compareCaptureAction}
            </button>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {C.form.compareCaptureHint}
            </p>
          </>
        ) : (
          <>
            <AffordabilityScenarioComparison
              snapshot={snapshot}
              currentInput={input}
              result={result}
              comparison={comparison}
            />
            <button
              type="button"
              onClick={() => setSnapshot(null)}
              className={`mt-2 text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
            >
              {C.form.compareClearAction}
            </button>
          </>
        )}
      </div>

      {/* Charts before the detail ledger, and the ledger collapsed. */}
      <ChartFigure model={monthlyChart}>
        <BarChart model={monthlyChart} />
      </ChartFigure>

      <ChartFigure model={priceChart}>
        <BarChart model={priceChart} />
      </ChartFigure>

      <DetailDisclosure
        title={C.form.detailTitle}
        hint={C.form.detailHint}
        className="mt-8"
      >
        <DetailFigures
          title={C.form.monthlyDetailTitle}
          figures={[
            // `prose`: this one is a sentence naming which ceiling bound the
            // answer. Given the figure treatment it cannot shrink and pushes
            // the row past a 266 px panel.
            { label: C.form.bindingLabel, value: bindingLabel, prose: true },
            {
              label: C.form.ratioCeilingLabel,
              value: cash(result?.assumedRatioCeiling),
            },
            ...(household
              ? [
                  {
                    label: C.form.householdResidualLabel,
                    value: cash(result?.householdResidual),
                  },
                ]
              : []),
            {
              label: C.form.housingLimitLabel,
              value: cash(result?.housingLimit),
            },
            {
              label: C.form.totalLimitLabel,
              value: cash(result?.totalDebtLimit),
            },
            {
              label: C.form.budgetLabel,
              value: cash(result?.affordableHousingPayment),
            },
          ]}
        />

        {/* The three loan figures the review asked to be kept apart: what the
            payment could service, what is actually used, and what caps it. */}
        <DetailFigures
          title={C.form.financingDetailTitle}
          className="mt-4"
          figures={[
            {
              label: C.form.paymentSupportedLoanLabel,
              value: cash(result?.paymentSupportedLoan),
            },
            { label: C.form.maxLoanUsedLabel, value: cash(result?.maxLoan) },
            {
              // Also a sentence: which of the two ceilings capped the price.
              label: C.form.priceBindingLabel,
              value:
                result === null
                  ? null
                  : result.priceBinding === "financing"
                    ? C.form.priceBindingFinancing
                    : C.form.priceBindingPayment,
              prose: true,
            },
            { label: C.form.usableCashLabel, value: cash(result?.usableCash) },
            {
              label: C.form.purchaseCostsLabel,
              value: cash(result?.purchaseCosts),
            },
            { label: C.form.cashToPriceLabel, value: cash(result?.cashToPrice) },
            {
              // A share, not an amount.
              label: C.form.downPercentLabel,
              value:
                result?.downPaymentPercent == null
                  ? null
                  : formatPercent(result.downPaymentPercent, 1),
            },
          ]}
        />
      </DetailDisclosure>
      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />

    </CalculatorCard>
  );
}
