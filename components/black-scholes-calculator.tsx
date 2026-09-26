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
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeBlackScholes } from "@/lib/calc/black-scholes";
import { BLACK_SCHOLES as C } from "@/content/calculators/black-scholes";

/*
 * CSV row 42 ("Hai cột"): "tách nhóm nhập thị trường và giả định; giá mua và
 * giá bán ở trên, greeks phụ ở dưới". Docs §8.
 *
 * NO `emphasis` IN THE PRIMARY GROUP, AND THAT IS THE DECISION. `ResultRow`
 * allows at most one headline per group and also allows none, and this is the
 * page where none is right: giá quyền mua and giá quyền bán are two answers,
 * not an answer and its supporting figure. The reader has not said which side
 * they are on — the form takes a contract, not a direction — so promoting one
 * to display type would answer a question nobody asked, and would do it in the
 * one place a reader looks first. Both rows lead, in the same size, and the
 * region carries the emphasis the row asks for by holding nothing else.
 *
 * THE PINNED CTA FOLLOWS THE SAME RULE. The form is tall enough to push this
 * region off a 1000 px-tall viewport (measured: 1143,75 px at 1440×1000), so
 * the block pins — but it restates BOTH prices as one labelled pair, so the
 * pin does not do by placement what `emphasis` was refused for doing by size.
 *
 * WHAT WENT DOWN. The eight-row d₁/d₂ breakdown and the five-row greeks table
 * are thirteen rows of sensitivity analysis that sat between the form and the
 * two prices. They are the "greeks phụ" the row names, and they move into the
 * layout's `detail` region: someone reads them after deciding whether the
 * price is plausible, never before. Nothing was deleted and no formatter
 * changed — the mixed-unit greeks column still carries its units in its
 * labels, exactly as before.
 */
const FORM_ID = "quyen-chon-nhap";
const RESULT_ID = "quyen-chon-ket-qua";

export function BlackScholesCalculator() {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`.
  const fields = useCalcFields(
    {
      spot: C.form.defaultSpot,
      strike: C.form.defaultStrike,
      time: C.form.defaultTime,
      volatility: C.form.defaultVolatility,
      rate: C.form.defaultRate,
      dividend: C.form.defaultDividend,
    },
    {
      spot: "money",
      strike: "money",
      time: "rate",
      volatility: "rate",
      rate: "rate",
      dividend: "rate",
    },
  );

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

  /** One flag for the six fields, so the CTA and the result agree. */
  const anyInvalid =
    spotInvalid ||
    strikeInvalid ||
    timeInvalid ||
    volatilityInvalid ||
    rateInvalid ||
    dividendInvalid;

  const result = anyInvalid
    ? null
    : computeBlackScholes({
        spot: spot!,
        strike: strike!,
        timeToExpiryYears: time!,
        volatilityPercent: volatility!,
        riskFreeRatePercent: rate!,
        dividendYieldPercent: dividend!,
      });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure, 2)} ₫`;

  // Formatted ONCE and shared by the two rows and the pinned restatement.
  // `ResultCta`'s `answer` docstring requires the same string the row renders,
  // never a second rounding of the same number.
  const callValue = money(result?.callPrice);
  const putValue = money(result?.putPrice);

  /**
   * Both prices in one `answer`, or nothing.
   *
   * `answer` holds one label and one value, and this page has two answers of
   * equal standing — which is why it declined the pin until a browser pass
   * measured the form at 1143,75 px tall at 1440×1000 with the result region
   * off-screen at y −382..−140 after clicking the last field. A labelled pair
   * fits the existing slot without promoting either side: no `emphasis` moved,
   * no row moved, and the arithmetic is untouched. When either price is
   * unavailable the whole value is `null`, so `ResultCta` renders its
   * placeholder rather than half a pair.
   */
  const pairAnswer = {
    label: C.form.pinnedPairLabel,
    value:
      callValue === null || putValue === null
        ? null
        : `${C.form.pinnedCallPrefix} ${callValue} · ${C.form.pinnedPutPrefix} ${putValue}`,
  };

  // Delta is dimensionless and gamma is PER ĐỒNG (it scales as 1/spot), so
  // both get plain decimals; vega, theta and rho are đồng amounts, so they
  // get money formatting. The column is therefore mixed-unit, and the unit of
  // each row lives in its label in the content file — not here.
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
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
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

            {/* The row's "giả định" box. One field, and it is the only input
                on this page nobody can look up — `volatilityHelp` has said so
                since the tool shipped. It keeps its position between the
                contract and the two observable rates, so no field moved. */}
            <FieldGroup title={C.form.assumptionGroup} className="mt-8">
              <NumberField
                {...fields.bind("volatility")}
                label={C.form.volatilityLabel}
                unit={C.form.volatilityUnit}
                help={C.form.volatilityHelp}
                error={C.form.volatilityInvalid}
                invalid={volatilityInvalid}
              />
            </FieldGroup>

            <FieldGroup title={C.form.marketGroup} className="mt-8">
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
          </>
        }
        cta={
          /* `sticky`, and the earlier refusal here was wrong on the facts.
             It argued that six short boxes cannot push the answer column off
             a 900 px-tall screen — the height `.fh-cta-pin` starts pinning
             at. A browser pass measured this form at 1143,75 px at 1440×1000:
             clicking the last field put the focus ring at y 528..575 and the
             result region at y −382..−140, entirely above the viewport. The
             other half of that argument — that the block restates ONE answer
             while this page has two — is answered by `pairAnswer` rather than
             by declining, so neither price is promoted over the other. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={pairAnswer}
          />
        }
        primary={
          <>
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              <ResultRow label={C.form.callLabel} value={callValue} />
              <ResultRow label={C.form.putLabel} value={putValue} />
              {/* Labelled as risk-neutral in the copy itself, because this is
                  the single most misread output of the model. */}
              <ResultRow
                label={C.form.probabilityLabel}
                value={
                  result?.callProbabilityItmPercent == null
                    ? null
                    : formatPercent(result.callProbabilityItmPercent, 4)
                }
              />
            </ResultGroup>

            {/* Both notices describe a boundary case of the two prices right
                above them, so both stay in the answer's own region. */}
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
          </>
        }
        detail={
          <>
            <ResultGroup title={C.form.detailTitle} live={false}>
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

            {/* `greeksIntro` used to be the route's `intro` prop, which
                `calculator-page.tsx` renders BELOW the whole tool box — a
                screen away from the table it explains. It reads here, beside
                that table, and it is no longer above the form. */}
            {greekRows.length > 0 ? (
              <p className="mt-8 text-sm leading-relaxed text-ink-2">
                {C.form.greeksIntro}
              </p>
            ) : null}

            {greekRows.length > 0 ? (
              <ResultTable
                className="mt-4"
                caption={C.form.greeksTitle}
                columns={[
                  { label: C.form.greekColumn },
                  { label: C.form.callColumn, numeric: true },
                  { label: C.form.putColumn, numeric: true },
                ]}
                rows={greekRows}
              />
            ) : null}
          </>
        }
      />
    </CalculatorCard>
  );
}
