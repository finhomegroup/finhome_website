"use client";

import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeAutoLoan, type AutoLoanResult } from "@/lib/calc/auto-loan";
import { vehicleBudgetModel } from "@/lib/calc/charts/vehicle-budget-chart";
import { yearlySummary } from "@/lib/calc/loan";
import { countCell, moneyCell } from "@/lib/calc/table-cell";
import {
  compareVehicleBudget,
  type VehicleBudgetResult,
} from "@/lib/calc/vehicle-budget";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";

/** The form's raw values, exactly as `useCalcFields` keeps them: strings. */
export type AutoLoanFormValues = {
  price: string;
  down: string;
  tradeIn: string;
  rate: string;
  /** "years" or "months"; anything else is read as months. */
  termUnit: string;
  term: string;
  /** The household month — original row 31's actual question. */
  netIncome: string;
  /** Blank means NOT SUPPLIED, which is not zero. See `essentialsKnown`. */
  essentials: string;
  /** Every other monthly obligation. Never this vehicle; see the lib note. */
  otherDebts: string;
  reserve: string;
  running: string;
};

/** Everything the page derives from those strings. */
export type AutoLoanFormState = {
  priceInvalid: boolean;
  downInvalid: boolean;
  tradeInInvalid: boolean;
  rateInvalid: boolean;
  termInvalid: boolean;
  netIncomeInvalid: boolean;
  essentialsInvalid: boolean;
  otherDebtsInvalid: boolean;
  reserveInvalid: boolean;
  runningInvalid: boolean;
  /** The entered term as whole months; null when the term does not parse. */
  termMonths: number | null;
  result: AutoLoanResult | null;
  /** True when the note replaces the blank rows, rather than a field error. */
  nothingToFinance: boolean;
  /** Deposit + trade-in + every loan payment. Null without a loan. */
  totalCost: number | null;
  /** True when a trade-in value is actually changing the amount financed. */
  tradeInActive: boolean;
  /**
   * The monthly instalment the household ledger is given.
   *
   * THREE STATES, AND THE MIDDLE ONE IS A SHIPPED DEFECT THIS EXISTS TO FIX:
   *
   * - a number above zero — the loan priced;
   * - `0` — a VALID purchase with no loan at all, because the deposit and the
   *   trade-in already cover the price (`nothingToFinance`);
   * - `null` — UNKNOWN, because a vehicle field is invalid or the loan could
   *   not be priced at all.
   *
   * `computeAutoLoan` returns `null` for the first two of those causes, so
   * `result?.loan.monthlyPrincipalInterest ?? 0` collapsed them: a rate of −1
   * made the car free and the figure announced a gap of 0 ₫. Only this
   * function can tell them apart, because only it knows whether the cause was
   * the price being covered or a field being refused.
   */
  vehiclePayment: number | null;
  /** The household month with and without the vehicle. Null when unusable. */
  budget: VehicleBudgetResult | null;
};

/**
 * Parse the form, decide which fields are invalid, and compute both answers.
 *
 * Pure and exported so the field gates can be pinned without a DOM — see
 * `auto-loan-calculator.test.ts`. `lib/calc/auto-loan.test.ts` covers only the
 * lib contract (`termMonths` of 0 or 60,5 gives null); it cannot say WHICH
 * field the page blames for that null, which is where both original bugs
 * lived. `lib/calc/vehicle-budget.test.ts` covers the household ledger the
 * same way.
 *
 * THE VEHICLE PAYMENT REACHES THE BUDGET FROM THE LOAN, not from a field. So
 * there is exactly one instalment on the page and the "nợ khác" field cannot
 * double it — see `vehicle-budget.ts`'s note.
 *
 * AND IT IS CLASSIFIED, NOT COALESCED. See `vehiclePayment` on
 * `AutoLoanFormState`: a covered price is a real 0, an invalid field is
 * `null`, and flattening the two with `?? 0` shipped an invalid rate as a
 * free car.
 */
export function autoLoanFormState(
  values: AutoLoanFormValues,
): AutoLoanFormState {
  const price = parseMoney(values.price);
  const down = parseMoney(values.down);
  const tradeIn = parseMoney(values.tradeIn);
  const rate = parseDecimal(values.rate);
  const term = parseDecimal(values.term);

  const priceInvalid = price === null || price <= 0;
  const downInvalid = down === null || down < 0;
  const tradeInInvalid = tradeIn === null || tradeIn < 0;
  const rateInvalid = rate === null || rate < 0;

  const termMonths =
    term === null
      ? null
      : Math.round(values.termUnit === "years" ? term * 12 : term);

  // Gate the DERIVED month count, not only the entered term: `Math.round(0,4)`
  // is 0 and `computeLoan` rejects `termMonths <= 0`, so any 0 < term < 0,5
  // tháng (or < 1/24 năm) used to pass this flag and come back as a null the
  // page then blamed on the deposit. A non-integer term stays legal on
  // purpose — 5,5 năm is 66 months, a real loan — which is why this gates
  // `termMonths`, not `Number.isInteger(term)`.
  const termInvalid =
    term === null || term <= 0 || termMonths === null || termMonths < 1;

  const fieldsUsable =
    !priceInvalid &&
    !downInvalid &&
    !tradeInInvalid &&
    !rateInvalid &&
    !termInvalid;

  const result = fieldsUsable
    ? computeAutoLoan({
        price,
        downPayment: down,
        tradeIn,
        annualRatePercent: rate,
        termMonths,
      })
    : null;

  // Every field is valid on its own, but the deposit and trade-in cover the
  // price — nothing to finance. That is a note, not a field error. The cause
  // is checked explicitly: a null from any OTHER source blanks the rows
  // silently, as every sibling calculator does, rather than printing advice
  // ("giảm tiền trả trước") that cannot help.
  const nothingToFinance =
    fieldsUsable && result === null && price - down - tradeIn <= 0;

  // THE THREE-WAY CLASSIFICATION the household ledger depends on. Both
  // branches of `result === null` are reachable and they are not the same
  // answer: see `vehiclePayment` on `AutoLoanFormState`.
  const vehiclePayment =
    result !== null
      ? result.loan.monthlyPrincipalInterest
      : nothingToFinance
        ? 0
        : null;

  // Purchase and financing only: deposit + trade-in + every loan payment. NOT
  // the cost of owning the car — see `totalCostLabel`/`totalCostHelp`.
  const totalCost =
    result && down !== null && tradeIn !== null
      ? down + tradeIn + result.loan.totalPrincipalInterest
      : null;

  // --- the household month -------------------------------------------------
  // A BLANK essentials box is "not supplied", which the model turns into
  // `limited` — not a zero it claims to know. The same contract
  // `computeAffordability` keeps for the same field.
  const essentialsRaw = values.essentials.trim();
  const essentialsKnown = essentialsRaw !== "";
  const essentials = essentialsKnown ? parseMoney(essentialsRaw) : undefined;

  const netIncome = parseMoney(values.netIncome);
  const otherDebts = parseMoney(values.otherDebts);
  const reserve = parseMoney(values.reserve);
  const running = parseMoney(values.running);

  const netIncomeInvalid = netIncome === null || netIncome <= 0;
  const essentialsInvalid =
    essentialsKnown &&
    (essentials === null || essentials === undefined || essentials < 0);
  const otherDebtsInvalid = otherDebts === null || otherDebts < 0;
  const reserveInvalid = reserve === null || reserve < 0;
  const runningInvalid = running === null || running < 0;

  const budgetUsable =
    !netIncomeInvalid &&
    !essentialsInvalid &&
    !otherDebtsInvalid &&
    !reserveInvalid &&
    !runningInvalid;

  const budget = budgetUsable
    ? compareVehicleBudget({
        netIncome: netIncome!,
        essentialExpenses: essentials ?? undefined,
        otherDebts: otherDebts!,
        reserveSaving: reserve!,
        // From the loan above, never from a field of its own, and carrying
        // its three states rather than a coalesced zero.
        vehiclePayment,
        vehicleRunningCosts: running!,
      })
    : null;

  return {
    priceInvalid,
    downInvalid,
    tradeInInvalid,
    rateInvalid,
    termInvalid,
    netIncomeInvalid,
    essentialsInvalid,
    otherDebtsInvalid,
    reserveInvalid,
    runningInvalid,
    termMonths,
    result,
    nothingToFinance,
    totalCost,
    tradeInActive: tradeIn !== null && tradeIn > 0,
    vehiclePayment,
    budget,
  };
}

/**
 * The vehicle loan calculator, and what the instalment does to the month.
 *
 * The amount borrowed is derived (price less deposit less trade-in) rather
 * than entered, which is the one thing that makes this different from the
 * mortgage calculator. `computeAutoLoan` owns that derivation so it is tested;
 * `autoLoanFormState` above owns the parsing, the field gates and the
 * household ledger for the same reason. This function is only the wiring.
 *
 * THE TRADE-IN IS BEHIND A DISCLOSURE, because most buyers are not trading a
 * car in and the field sat between the deposit and the loan terms for all of
 * them. `AdvancedFields` names an ACTIVE trade-in on its own summary line and
 * opens itself when one is set, so a value that is changing the amount
 * financed can never be hidden — see that component's docstring.
 */
export function AutoLoanCalculator() {
  const initial = {
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    tradeIn: C.form.defaultTradeIn,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    termUnit: C.form.defaultTermUnit,
    netIncome: C.form.defaultNetIncome,
    essentials: C.form.defaultEssentials,
    otherDebts: C.form.defaultOtherDebts,
    reserve: C.form.defaultReserve,
    running: C.form.defaultRunning,
  };
  const fields = useCalcFields(initial);

  // Whether anything on the page is still the worked example. `ExampleNotice`
  // turns this into a visible badge and a reset, which is the repair for a
  // page that prefilled 40/22/3/3 triệu and then told the reader those figures
  // were theirs.
  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const {
    priceInvalid,
    downInvalid,
    tradeInInvalid,
    rateInvalid,
    termInvalid,
    netIncomeInvalid,
    essentialsInvalid,
    otherDebtsInvalid,
    reserveInvalid,
    runningInvalid,
    result,
    nothingToFinance,
    totalCost,
    tradeInActive,
    budget,
  } = autoLoanFormState(fields.values);

  const money = (value: number | null | undefined) =>
    value === null || value === undefined ? null : `${formatMoney(value)} ₫`;

  // TYPED cells, not `formatMoney` strings. Three 9-digit đồng figures in four
  // columns do not fit 390 px: an independent review measured this table at
  // 452 px inside a 300 px parent, with clipped headings, no stated currency
  // and no way to get a shorter reading. `ResultTable` derives the compact
  // triệu reading, the unit line and the exact-đồng checkbox from the RAW
  // numbers — and it can only do that if it receives raw numbers, because
  // rescaling a formatted string means parsing "166.083.333 ₫" back to a
  // number, which is docs §4's 1000× trap.
  const tableRows = result
    ? yearlySummary(result.loan.schedule).map((year) => [
        countCell(year.year),
        moneyCell(year.interest),
        moneyCell(year.principal),
        moneyCell(year.balance),
      ])
    : [];

  const chart = vehicleBudgetModel(budget, C.chart);

  return (
    <CalculatorCard>
      <ExampleNotice
        pristine={pristine}
        onReset={fields.reset}
        className="mb-6"
      />

      <FieldGroup title={C.form.vehicleGroup}>
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={downInvalid}
        />
      </FieldGroup>

      <AdvancedFields
        className="mt-6"
        title={C.form.tradeInGroup}
        emptySummary={C.form.tradeInGroupEmpty}
        settings={[
          {
            key: "tradeIn",
            label: C.form.tradeInLabel,
            value: `${fields.values.tradeIn} ${C.form.tradeInUnit}`,
            active: tradeInActive,
          },
        ]}
      >
        <NumberField
          {...fields.bind("tradeIn")}
          label={C.form.tradeInLabel}
          unit={C.form.tradeInUnit}
          help={C.form.tradeInHelp}
          error={C.form.tradeInInvalid}
          invalid={tradeInInvalid}
        />
      </AdvancedFields>

      <FieldGroup title={C.form.loanGroup} className="mt-8">
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
        <SelectField
          {...fields.bind("termUnit")}
          label={C.form.termUnitLabel}
          options={[
            { value: "years", label: C.form.termUnitYears },
            { value: "months", label: C.form.termUnitMonths },
          ]}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.financedLabel}
          value={money(result?.amountFinanced)}
        />
        <ResultRow
          label={C.form.downPercentLabel}
          value={result ? formatPercent(result.downPaymentPercent, 1) : null}
        />
        <ResultRow
          label={C.form.monthlyLabel}
          value={money(result?.loan.monthlyPrincipalInterest)}
        />
        <ResultRow
          label={C.form.totalInterestLabel}
          value={money(result?.loan.totalInterest)}
        />
        <ResultRow
          label={C.form.totalPaymentLabel}
          value={money(result?.loan.totalPrincipalInterest)}
        />
        <ResultRow label={C.form.totalCostLabel} value={money(totalCost)} />
        <ResultRow
          label={C.form.termResultLabel}
          value={
            result
              ? `${formatDecimal(result.loan.months, 0)} ${C.form.monthsUnit}`
              : null
          }
        />
      </ResultGroup>

      {/* The scope of the total sits BESIDE the figure, not only in a
          collapsed FAQ: a nine-digit number labelled as the cost of owning a
          car, with the exclusions hidden, is the finding this answers. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.totalCostHelp}
      </p>

      {nothingToFinance ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.nothingToFinanceNotice}
        </p>
      ) : null}

      {/* Original row 31's own question. The loan above is the input to it. */}
      <FieldGroup title={C.form.householdGroup} className="mt-10">
        <p className="text-sm leading-relaxed text-ink-3">
          {C.form.householdIntro}
        </p>
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
          {...fields.bind("otherDebts")}
          label={C.form.otherDebtsLabel}
          unit={C.form.otherDebtsUnit}
          help={C.form.otherDebtsHelp}
          error={C.form.otherDebtsInvalid}
          invalid={otherDebtsInvalid}
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
          {...fields.bind("running")}
          label={C.form.runningLabel}
          unit={C.form.runningUnit}
          help={C.form.runningHelp}
          error={C.form.runningInvalid}
          invalid={runningInvalid}
        />
      </FieldGroup>

      {/* Not live: the loan group above already announces every keystroke, and
          docs §4 allows exactly one live results region per page. */}
      <ResultGroup
        title={C.form.budgetTitle}
        className="mt-6"
        live={false}
      >
        <ResultRow
          label={C.form.withoutCarLabel}
          value={money(budget?.withoutCar)}
        />
        <ResultRow label={C.form.withCarLabel} value={money(budget?.withCar)} />
        <ResultRow label={C.form.gapLabel} value={money(budget?.difference)} />
        {/* Mounted only when there IS a shortfall: docs §6 — an optional row
            is not mounted, not nulled, or it shows a dash beside figures the
            tool actually knows. */}
        {budget?.shortfallAmount != null ? (
          <ResultRow
            label={C.form.shortfallLabel}
            value={money(budget.shortfallAmount)}
          />
        ) : null}
        <ResultRow
          label={C.form.committedLabel}
          value={money(budget?.committedWithoutVehicle)}
        />
        <ResultRow
          label={C.form.vehicleCostLabel}
          value={money(budget?.vehicleMonthlyCost)}
        />
      </ResultGroup>

      {/* The recovery for a withheld with-car leg. The rows above show the
          placeholder rather than a 0, and this says why and what to fix. */}
      {budget?.vehicleCostUnknown ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.paymentUnknownNotice}
        </p>
      ) : null}

      {budget?.limited ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.budgetLimitedNotice}
        </p>
      ) : null}

      {budget?.shortfallWithoutVehicle ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.shortfallBeforeNotice}
        </p>
      ) : budget?.shortfall ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.shortfallNotice}
        </p>
      ) : null}

      {/* The "higher than reality" comparison needs an after figure to
          exist. With the instalment unknown the exclusion still matters, but
          nothing can be claimed about a number that was withheld. */}
      {budget?.runningCostsExcluded ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {budget.vehicleCostUnknown
            ? C.form.runningExcludedUnknownNotice
            : C.form.runningExcludedNotice}
        </p>
      ) : null}

      <ChartFigure model={chart}>
        <BarChart model={chart} />
      </ChartFigure>

      {tableRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.table.caption}
          columns={[
            { label: C.table.yearColumn },
            { label: C.table.interestColumn, numeric: true },
            { label: C.table.principalColumn, numeric: true },
            { label: C.table.balanceColumn, numeric: true },
          ]}
          rows={tableRows}
        />
      ) : null}

      {/* After the result, never before it — see ExampleNotice's docstring. */}
      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
