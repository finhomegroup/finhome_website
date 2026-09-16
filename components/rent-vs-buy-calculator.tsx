"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { LineChart } from "@/components/calc/chart/line-chart";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { moneyCell } from "@/lib/calc/table-cell";
import {
  compareGrowthScenarios,
  compareRentVsBuy,
  growthScenarioRates,
  MAX_RENT_BUY_MONTHS,
} from "@/lib/calc/rent-vs-buy";
import {
  rentBuyScenariosModel,
  rentBuyTrajectoryModel,
} from "@/lib/calc/charts/rent-buy-chart";
import { fill } from "@/lib/calc/charts/labels";
import { CHART_UI } from "@/content/calculators/chart-ui";
import { RENT_VS_BUY as C } from "@/content/calculators/rent-vs-buy";

/**
 * Renting against buying, under named assumptions — original row 8.
 *
 * THE SHAPE THE ROW ASKS FOR, and why each part is where it is:
 *
 * - **The six fields a reader can actually answer come first.** Price,
 *   deposit, rate, term, rent and how long they mean to stay. Everything
 *   else is an assumption and lives in `AdvancedFields`, which states on its
 *   own summary line whatever is currently moving the result — so the growth
 *   rate can be collapsed without being hidden.
 * - **The verdict is scoped.** "Mua" alone is a claim about a decision. The
 *   row's label carries the horizon, and the sentence under the group names
 *   all four assumptions the answer depends on.
 * - **Two charts, not one.** The trajectory shows both net costs at every
 *   month, because the endpoint hides the crossing; the scenario chart shows
 *   the same comparison under `growthScenarioRates`, because the answer
 *   genuinely reverses and a single growth rate conceals that.
 * - **Non-financial reasons are on the page**, before a reader acts on a
 *   difference the model itself calls assumption-dependent.
 *
 * One live results region — the three rows a reader came for. Everything
 * else is `live={false}` or behind a disclosure.
 */
export function RentVsBuyCalculator() {
  const initial = {
    price: C.form.defaultPrice,
    down: C.form.defaultDown,
    rate: C.form.defaultRate,
    term: C.form.defaultTerm,
    rent: C.form.defaultRent,
    horizon: C.form.defaultHorizon,
    purchaseCosts: C.form.defaultPurchaseCosts,
    ownerCosts: C.form.defaultOwnerCosts,
    growth: C.form.defaultGrowth,
    sellingCost: C.form.defaultSellingCost,
    rentGrowth: C.form.defaultRentGrowth,
    deposit: C.form.defaultDeposit,
    investment: C.form.defaultInvestment,
  };
  const fields = useCalcFields(initial);
  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  const price = parseMoney(fields.values.price);
  const down = parseMoney(fields.values.down);
  const purchaseCosts = parseMoney(fields.values.purchaseCosts);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const ownerCosts = parseMoney(fields.values.ownerCosts);
  const growth = parseDecimal(fields.values.growth);
  const sellingCost = parseDecimal(fields.values.sellingCost);
  const rent = parseMoney(fields.values.rent);
  const rentGrowth = parseDecimal(fields.values.rentGrowth);
  const deposit = parseMoney(fields.values.deposit);
  const investment = parseDecimal(fields.values.investment);
  const horizon = parseDecimal(fields.values.horizon);

  const invalid = {
    price: price === null || price <= 0,
    down: down === null || down < 0 || (price !== null && down > price),
    purchaseCosts: purchaseCosts === null || purchaseCosts < 0,
    rate: rate === null || rate < 0,
    // The engine's own bound, named in the field's error and help rather
    // than left as a silent refusal: a term of 1.201 used to clear the
    // result and the charts with no field marked invalid, so the chart's
    // recovery sentence pointed at an errored field that did not exist.
    term:
      term === null ||
      term <= 0 ||
      !Number.isInteger(term) ||
      term > MAX_RENT_BUY_MONTHS,
    ownerCosts: ownerCosts === null || ownerCosts < 0,
    // Growth rates may be negative — a falling market is the case worth
    // checking — but not at or below −100%/năm.
    growth: growth === null || growth <= -100,
    sellingCost:
      sellingCost === null || sellingCost < 0 || sellingCost > 100,
    rent: rent === null || rent < 0,
    rentGrowth: rentGrowth === null || rentGrowth <= -100,
    // A deposit above the upfront cash breaks the equal-starting-wealth
    // premise, and the engine refuses it. Blamed on the field that can fix it.
    deposit:
      deposit === null ||
      deposit < 0 ||
      (down !== null &&
        purchaseCosts !== null &&
        deposit > down + purchaseCosts),
    investment: investment === null || investment <= -100,
    horizon:
      horizon === null ||
      horizon <= 0 ||
      !Number.isInteger(horizon) ||
      horizon > MAX_RENT_BUY_MONTHS,
  };

  /**
   * The suite's one disclosed horizon, as the copy writes it.
   *
   * `formatMoney`, not `formatDecimal`: this is a four-digit count inside a
   * sentence, and "1200 tháng" is the ungrouped run of digits the number
   * grammar exists to avoid. Grouping only affects the prose — the bound
   * itself comes from the engine's constant.
   */
  const limit = { limit: formatMoney(MAX_RENT_BUY_MONTHS, 0) };

  const usable = !Object.values(invalid).some(Boolean);
  const input = usable
    ? {
        price: price!,
        downPayment: down!,
        purchaseCosts: purchaseCosts!,
        annualRatePercent: rate!,
        termMonths: term!,
        monthlyOwnerCosts: ownerCosts!,
        priceGrowthPercent: growth!,
        sellingCostPercent: sellingCost!,
        monthlyRent: rent!,
        rentGrowthPercent: rentGrowth!,
        rentDeposit: deposit!,
        investmentReturnPercent: investment!,
        horizonMonths: horizon!,
      }
    : null;

  const result = input === null ? null : compareRentVsBuy(input);

  // The same comparison under named growth assumptions. One field changes per
  // call; the rates are chosen so the reader's own is always one of them.
  const scenarioRates = growth === null ? null : growthScenarioRates(growth);
  const scenarios =
    input === null || scenarioRates === null
      ? null
      : compareGrowthScenarios(input, scenarioRates);

  const trajectory = rentBuyTrajectoryModel(result, {
    ...CHART_UI.money,
    ...C.chart,
  });
  const scenarioChart = rentBuyScenariosModel(scenarios, {
    ...CHART_UI.money,
    ...C.scenarioChart,
  });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;
  /**
   * A rate as the page states it: "5%", "2,5%".
   *
   * Integer-aware, because "giá nhà 5,00%/năm" in a sentence reads like a
   * quoted figure rather than the round assumption the reader typed.
   */
  const rateText = (figure: number | null, invalidText: string) =>
    figure === null
      ? invalidText
      : formatPercent(figure, Number.isInteger(figure) ? 0 : 2);
  const horizonText = horizon === null ? "—" : formatDecimal(horizon, 0);

  return (
    <CalculatorCard>
      <ExampleNotice pristine={pristine} onReset={fields.reset} />

      <FieldGroup title={C.form.knownGroup} className="mt-6">
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={invalid.price}
        />
        <NumberField
          {...fields.bind("down")}
          label={C.form.downLabel}
          unit={C.form.downUnit}
          help={C.form.downHelp}
          error={C.form.downInvalid}
          invalid={invalid.down}
        />
        <NumberField
          {...fields.bind("rate")}
          label={C.form.rateLabel}
          unit={C.form.rateUnit}
          help={C.form.rateHelp}
          error={C.form.rateInvalid}
          invalid={invalid.rate}
        />
        <NumberField
          {...fields.bind("term")}
          label={C.form.termLabel}
          help={fill(C.form.termHelp, limit)}
          error={fill(C.form.termInvalid, limit)}
          invalid={invalid.term}
        />
        <NumberField
          {...fields.bind("rent")}
          label={C.form.rentLabel}
          unit={C.form.rentUnit}
          help={C.form.rentHelp}
          error={C.form.rentInvalid}
          invalid={invalid.rent}
        />
        <NumberField
          {...fields.bind("horizon")}
          label={C.form.horizonLabel}
          help={fill(C.form.horizonHelp, limit)}
          error={fill(C.form.horizonInvalid, limit)}
          invalid={invalid.horizon}
        />
      </FieldGroup>

      {/* Every assumption, disclosed rather than hidden: the summary line
          names the ones that are moving the answer, and the panel opens
          itself while any of them is. */}
      <AdvancedFields
        title={C.form.assumptionsTitle}
        emptySummary={C.form.assumptionsNone}
        className="mt-6"
        settings={[
          {
            key: "growth",
            label: C.form.growthLabel,
            value: rateText(growth, C.form.growthInvalid),
            active: invalid.growth || growth !== 0,
          },
          {
            key: "investment",
            label: C.form.investmentLabel,
            value: rateText(investment, C.form.investmentInvalid),
            active: invalid.investment || investment !== 0,
          },
          {
            key: "rentGrowth",
            label: C.form.rentGrowthLabel,
            value: rateText(rentGrowth, C.form.rentGrowthInvalid),
            active: invalid.rentGrowth || rentGrowth !== 0,
          },
          {
            key: "purchaseCosts",
            label: C.form.purchaseCostsLabel,
            value: invalid.purchaseCosts
              ? C.form.purchaseCostsInvalid
              : money(purchaseCosts!)!,
            active: invalid.purchaseCosts || purchaseCosts !== 0,
          },
          {
            key: "ownerCosts",
            label: C.form.ownerCostsLabel,
            value: invalid.ownerCosts
              ? C.form.ownerCostsInvalid
              : money(ownerCosts!)!,
            active: invalid.ownerCosts || ownerCosts !== 0,
          },
          {
            key: "sellingCost",
            label: C.form.sellingCostLabel,
            value: rateText(sellingCost, C.form.sellingCostInvalid),
            active: invalid.sellingCost || sellingCost !== 0,
          },
          {
            key: "deposit",
            label: C.form.depositLabel,
            value: invalid.deposit ? C.form.depositInvalid : money(deposit!)!,
            active: invalid.deposit || deposit !== 0,
          },
        ]}
      >
        <FieldGroup title={C.form.buyAssumptionsGroup}>
          <NumberField
            {...fields.bind("growth")}
            label={C.form.growthLabel}
            unit={C.form.growthUnit}
            help={C.form.growthHelp}
            error={C.form.growthInvalid}
            invalid={invalid.growth}
          />
          <NumberField
            {...fields.bind("purchaseCosts")}
            label={C.form.purchaseCostsLabel}
            unit={C.form.purchaseCostsUnit}
            help={C.form.purchaseCostsHelp}
            error={C.form.purchaseCostsInvalid}
            invalid={invalid.purchaseCosts}
          />
          <NumberField
            {...fields.bind("ownerCosts")}
            label={C.form.ownerCostsLabel}
            unit={C.form.ownerCostsUnit}
            help={C.form.ownerCostsHelp}
            error={C.form.ownerCostsInvalid}
            invalid={invalid.ownerCosts}
          />
          <NumberField
            {...fields.bind("sellingCost")}
            label={C.form.sellingCostLabel}
            unit={C.form.sellingCostUnit}
            help={C.form.sellingCostHelp}
            error={C.form.sellingCostInvalid}
            invalid={invalid.sellingCost}
          />
        </FieldGroup>

        <FieldGroup title={C.form.rentAssumptionsGroup} className="mt-6">
          <NumberField
            {...fields.bind("rentGrowth")}
            label={C.form.rentGrowthLabel}
            unit={C.form.rentGrowthUnit}
            help={C.form.rentGrowthHelp}
            error={C.form.rentGrowthInvalid}
            invalid={invalid.rentGrowth}
          />
          <NumberField
            {...fields.bind("deposit")}
            label={C.form.depositLabel}
            unit={C.form.depositUnit}
            help={C.form.depositHelp}
            error={C.form.depositInvalid}
            invalid={invalid.deposit}
          />
          <NumberField
            {...fields.bind("investment")}
            label={C.form.investmentLabel}
            unit={C.form.investmentUnit}
            help={C.form.investmentHelp}
            error={C.form.investmentInvalid}
            invalid={invalid.investment}
          />
        </FieldGroup>
      </AdvancedFields>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={fill(C.form.verdictLabel, { months: horizonText })}
          value={
            result === null
              ? null
              : // A TIE IS NOT A WIN FOR RENTING. `buyingWins` is
                // `advantage > 0`, so without this the page announces "Thuê"
                // beside an advantage of 0 ₫.
                result.tied
                ? C.form.verdictEqual
                : result.buyingWins
                  ? C.form.verdictBuy
                  : C.form.verdictRent
          }
          prose
        />
        <ResultRow
          label={fill(C.form.advantageLabel, { months: horizonText })}
          value={money(
            result === null ? undefined : Math.abs(result.advantageOfBuying),
          )}
        />
        <ResultRow
          label={C.form.breakEvenLabel}
          value={
            result?.breakEvenMonth == null
              ? null
              : `${formatDecimal(result.breakEvenMonth, 0)} ${C.form.monthsUnit}`
          }
        />
      </ResultGroup>

      {/* The verdict's scope, beside the verdict. */}
      {result !== null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {fill(C.form.verdictScope, {
            months: horizonText,
            growth: rateText(growth, C.form.growthInvalid),
            rentGrowth: rateText(rentGrowth, C.form.rentGrowthInvalid),
            investment: rateText(investment, C.form.investmentInvalid),
          })}
        </p>
      ) : null}

      {result !== null && result.tied ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          {C.form.tieNotice}
        </p>
      ) : null}

      {/* NULL HAS TWO MEANINGS. Buying may never have been ahead, or it may
          have been ahead for a stretch and then been overtaken again before
          the horizon — and "mua không lúc nào có lợi" is false in the second
          case, in the reader's favour. */}
      {result !== null && result.breakEvenMonth === null
        ? (() => {
            const ahead = result.trajectory.filter(
              (point) => point.month > 0 && point.advantageOfBuying > 0,
            );
            return (
              <p className="mt-2 text-sm leading-relaxed text-ink-3">
                {ahead.length === 0
                  ? C.form.noBreakEvenNotice
                  : fill(C.form.reversedNotice, {
                      first: formatDecimal(ahead[0].month, 0),
                      last: formatDecimal(ahead[ahead.length - 1].month, 0),
                    })}
              </p>
            );
          })()
        : null}

      <ResultGroup title={C.form.netCostTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.buyNetCostLabel}
          value={money(result?.buy.netCost)}
        />
        <ResultRow
          label={C.form.rentNetCostLabel}
          value={money(result?.rent.netCost)}
        />
      </ResultGroup>

      <ChartFigure model={trajectory}>
        <LineChart model={trajectory} />
      </ChartFigure>

      <ChartFigure model={scenarioChart}>
        <LineChart model={scenarioChart} />
      </ChartFigure>

      {result !== null ? (
        <DetailDisclosure title={C.form.detailToggle} className="mt-6">
          <DetailFigures
            title={C.form.detailTitle}
            figures={[
              {
                label: C.form.monthlyPaymentLabel,
                value: moneyCell(result.monthlyPayment),
              },
              {
                label: C.form.loanAmountLabel,
                value: moneyCell(result.loanAmount),
              },
              {
                label: C.form.upfrontLabel,
                value: moneyCell(result.buyerUpfront),
              },
              {
                label: C.form.houseValueLabel,
                value: moneyCell(result.houseValue),
              },
              {
                label: C.form.loanBalanceLabel,
                value: moneyCell(result.loanBalance),
              },
              {
                label: C.form.totalInterestLabel,
                value: moneyCell(result.totalInterest),
              },
              {
                label: C.form.totalPrincipalLabel,
                value: moneyCell(result.totalPrincipal),
              },
              {
                label: C.form.ownerCostsResultLabel,
                value: moneyCell(result.totalOwnerCosts),
              },
              {
                label: C.form.sellingCostResultLabel,
                value: moneyCell(result.sellingCost),
              },
              {
                label: C.form.buyTotalPaidLabel,
                value: moneyCell(result.buy.totalPaid),
              },
              {
                label: C.form.buyNetWorthLabel,
                value: moneyCell(result.buy.netWorth),
              },
              {
                label: C.form.totalRentLabel,
                value: moneyCell(result.totalRent),
              },
              {
                label: C.form.investedCashLabel,
                value: moneyCell(result.investedCash),
              },
              {
                label: C.form.investmentValueLabel,
                value: moneyCell(result.investmentValue),
              },
              {
                label: C.form.investmentGainLabel,
                value: moneyCell(result.investmentGain),
              },
              {
                label: C.form.rentTotalPaidLabel,
                value: moneyCell(result.rent.totalPaid),
              },
              {
                label: C.form.rentNetWorthLabel,
                value: moneyCell(result.rent.netWorth),
              },
            ]}
          />
        </DetailDisclosure>
      ) : null}

      {/* ORIGINAL ROW 8: the reasons the model cannot price, on the page. */}
      <section className="mt-6 rounded-2xl bg-bg-soft p-5">
        <h3 className="font-display text-base font-medium text-ink">
          {C.nonFinancial.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          {C.nonFinancial.intro}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
              {C.nonFinancial.buyTitle}
            </h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {C.nonFinancial.buyItems.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ink-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wide text-ink-3">
              {C.nonFinancial.rentTitle}
            </h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {C.nonFinancial.rentItems.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-ink-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.nonFinancial.note}
        </p>
      </section>

      <ExampleNoticeDetail className="mt-4" />
    </CalculatorCard>
  );
}
