"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeBlackScholes } from "@/lib/calc/black-scholes";
import { BLACK_SCHOLES as C } from "@/content/calculators/black-scholes";

export function BlackScholesCalculator() {
  const fields = useCalcFields({
    spot: C.form.defaultSpot,
    strike: C.form.defaultStrike,
    time: C.form.defaultTime,
    volatility: C.form.defaultVolatility,
    rate: C.form.defaultRate,
    dividend: C.form.defaultDividend,
  });

  const spot = parseMoney(fields.values.spot);
  const strike = parseMoney(fields.values.strike);
  const time = parseDecimal(fields.values.time);
  const volatility = parseDecimal(fields.values.volatility);
  const rate = parseDecimal(fields.values.rate);
  const dividend = parseDecimal(fields.values.dividend);

  const spotInvalid = spot === null || spot <= 0;
  const strikeInvalid = strike === null || strike <= 0;
  const timeInvalid = time === null || time < 0;
  const volatilityInvalid = volatility === null || volatility < 0;
  const rateInvalid = rate === null;
  const dividendInvalid = dividend === null || dividend < 0;

  const result =
    spotInvalid ||
    strikeInvalid ||
    timeInvalid ||
    volatilityInvalid ||
    rateInvalid ||
    dividendInvalid
      ? null
      : computeBlackScholes({
          spot,
          strike,
          timeToExpiryYears: time,
          volatilityPercent: volatility,
          riskFreeRatePercent: rate,
          dividendYieldPercent: dividend,
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure, 2)} ₫`;

  // Greeks are dimensionless or per-unit, so they get plain decimals rather
  // than money formatting — except vega, theta and rho, which are in đồng.
  const greekRows = result
    ? [
        [
          C.form.deltaLabel,
          formatDecimal(result.callGreeks.delta, 6),
          formatDecimal(result.putGreeks.delta, 6),
        ],
        [
          C.form.gammaLabel,
          formatDecimal(result.callGreeks.gamma, 8),
          formatDecimal(result.putGreeks.gamma, 8),
        ],
        [
          C.form.vegaLabel,
          formatMoney(result.callGreeks.vega, 2),
          formatMoney(result.putGreeks.vega, 2),
        ],
        [
          C.form.thetaLabel,
          formatMoney(result.callGreeks.theta, 2),
          formatMoney(result.putGreeks.theta, 2),
        ],
        [
          C.form.rhoLabel,
          formatMoney(result.callGreeks.rho, 2),
          formatMoney(result.putGreeks.rho, 2),
        ],
      ]
    : [];

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.optionGroup}>
        <NumberField
          {...fields.bind("spot")}
          label={C.form.spotLabel}
          unit={C.form.spotUnit}
          help={C.form.spotHelp}
          error={C.form.spotInvalid}
          invalid={spotInvalid}
        />
        <NumberField
          {...fields.bind("strike")}
          label={C.form.strikeLabel}
          unit={C.form.strikeUnit}
          help={C.form.strikeHelp}
          error={C.form.strikeInvalid}
          invalid={strikeInvalid}
        />
        <NumberField
          {...fields.bind("time")}
          label={C.form.timeLabel}
          unit={C.form.timeUnit}
          help={C.form.timeHelp}
          error={C.form.timeInvalid}
          invalid={timeInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.marketGroup} className="mt-8">
        <NumberField
          {...fields.bind("volatility")}
          label={C.form.volatilityLabel}
          unit={C.form.volatilityUnit}
          help={C.form.volatilityHelp}
          error={C.form.volatilityInvalid}
          invalid={volatilityInvalid}
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
          {...fields.bind("dividend")}
          label={C.form.dividendLabel}
          unit={C.form.dividendUnit}
          help={C.form.dividendHelp}
          error={C.form.dividendInvalid}
          invalid={dividendInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow label={C.form.callLabel} value={money(result?.callPrice)} />
        <ResultRow label={C.form.putLabel} value={money(result?.putPrice)} />
        {/* Labelled as risk-neutral in the copy itself, because this is the
            single most misread output of the model. */}
        <ResultRow
          label={C.form.probabilityLabel}
          value={
            result?.callProbabilityItmPercent == null
              ? null
              : formatPercent(result.callProbabilityItmPercent, 4)
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.d1Label}
          value={result?.d1 == null ? null : formatDecimal(result.d1, 6)}
        />
        <ResultRow
          label={C.form.d2Label}
          value={result?.d2 == null ? null : formatDecimal(result.d2, 6)}
        />
        <ResultRow
          label={C.form.callIntrinsicLabel}
          value={money(result?.callIntrinsic)}
        />
        <ResultRow
          label={C.form.callTimeValueLabel}
          value={money(result?.callTimeValue)}
        />
        <ResultRow
          label={C.form.putIntrinsicLabel}
          value={money(result?.putIntrinsic)}
        />
        <ResultRow
          label={C.form.putTimeValueLabel}
          value={money(result?.putTimeValue)}
        />
        <ResultRow
          label={C.form.moneynessLabel}
          value={result ? formatDecimal(result.moneyness, 6) : null}
        />
        <ResultRow
          label={C.form.forwardLabel}
          value={money(result?.forwardPrice)}
        />
      </ResultGroup>

      {greekRows.length > 0 ? (
        <ResultTable
          className="mt-8"
          caption={C.form.greeksTitle}
          columns={[
            { label: C.form.greekColumn },
            { label: C.form.callColumn, numeric: true },
            { label: C.form.putColumn, numeric: true },
          ]}
          rows={greekRows}
        />
      ) : null}

      {result !== null && time === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.atExpiryNotice}
        </p>
      ) : null}

      {result !== null && time !== 0 && volatility === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.zeroVolNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
