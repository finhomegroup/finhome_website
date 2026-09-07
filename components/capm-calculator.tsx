"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import { formatPercent, parseDecimal } from "@/lib/calc/number";
import { computeCapm } from "@/lib/calc/capm";
import { CAPM as C } from "@/content/calculators/capm";

export function CapmCalculator() {
  const fields = useCalcFields({
    riskFree: C.form.defaultRiskFree,
    beta: C.form.defaultBeta,
    marketMode: C.form.defaultMarketMode,
    marketReturn: C.form.defaultMarketReturn,
    marketPremium: C.form.defaultMarketPremium,
    actual: C.form.defaultActual,
  });

  const byReturn = fields.values.marketMode === "return";

  const riskFree = parseDecimal(fields.values.riskFree);
  const beta = parseDecimal(fields.values.beta);
  const marketReturn = parseDecimal(fields.values.marketReturn);
  const marketPremium = parseDecimal(fields.values.marketPremium);

  // Optional: empty means "just give me the expected return", not an error.
  const actualRaw = fields.values.actual.trim();
  const actual = actualRaw === "" ? null : parseDecimal(actualRaw);

  const riskFreeInvalid = riskFree === null;
  const betaInvalid = beta === null;
  const marketReturnInvalid = byReturn && marketReturn === null;
  const marketPremiumInvalid = !byReturn && marketPremium === null;
  const actualInvalid = actualRaw !== "" && actual === null;

  const result =
    riskFreeInvalid ||
    betaInvalid ||
    marketReturnInvalid ||
    marketPremiumInvalid ||
    actualInvalid
      ? null
      : computeCapm({
          riskFreeRatePercent: riskFree,
          beta,
          // Exactly one of these is passed: the module rejects both, because
          // two figures for one quantity have no correct reconciliation.
          marketReturnPercent: byReturn ? (marketReturn ?? undefined) : undefined,
          marketPremiumPercent: byReturn
            ? undefined
            : (marketPremium ?? undefined),
          actualReturnPercent: actual ?? undefined,
        });

  const belowRiskFree =
    result !== null &&
    riskFree !== null &&
    result.expectedReturnPercent < riskFree;

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.group}>
        <NumberField
          {...fields.bind("riskFree")}
          label={C.form.riskFreeLabel}
          unit={C.form.riskFreeUnit}
          help={C.form.riskFreeHelp}
          error={C.form.riskFreeInvalid}
          invalid={riskFreeInvalid}
        />
        <NumberField
          {...fields.bind("beta")}
          label={C.form.betaLabel}
          help={C.form.betaHelp}
          error={C.form.betaInvalid}
          invalid={betaInvalid}
        />
        <RadioGroupField
          {...fields.bind("marketMode")}
          legend={C.form.marketModeLegend}
          help={C.form.marketModeHelp}
          options={[
            { value: "return", label: C.form.marketModeReturn },
            { value: "premium", label: C.form.marketModePremium },
          ]}
        />
        {/* Only the box the mode uses renders: showing both would invite the
            user to fill in two figures the module deliberately rejects. */}
        {byReturn ? (
          <NumberField
            {...fields.bind("marketReturn")}
            label={C.form.marketReturnLabel}
            unit={C.form.marketReturnUnit}
            help={C.form.marketReturnHelp}
            error={C.form.marketReturnInvalid}
            invalid={marketReturnInvalid}
          />
        ) : (
          <NumberField
            {...fields.bind("marketPremium")}
            label={C.form.marketPremiumLabel}
            unit={C.form.marketPremiumUnit}
            help={C.form.marketPremiumHelp}
            error={C.form.marketPremiumInvalid}
            invalid={marketPremiumInvalid}
          />
        )}
        <NumberField
          {...fields.bind("actual")}
          label={C.form.actualLabel}
          unit={C.form.actualUnit}
          help={C.form.actualHelp}
          error={C.form.actualInvalid}
          invalid={actualInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.expectedLabel}
          value={
            result ? formatPercent(result.expectedReturnPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.alphaLabel}
          value={
            result?.alphaPercent == null
              ? null
              : formatPercent(result.alphaPercent, 3)
          }
        />
        <ResultRow
          label={C.form.profileLabel}
          value={
            result === null
              ? null
              : result.profile === "inverse"
                ? C.form.profileInverse
                : result.profile === "defensive"
                  ? C.form.profileDefensive
                  : result.profile === "market"
                    ? C.form.profileMarket
                    : C.form.profileAggressive
          }
        />
      </ResultGroup>

      <ResultGroup title={C.form.detailTitle} className="mt-4" live={false}>
        <ResultRow
          label={C.form.premiumLabel}
          value={
            result ? formatPercent(result.marketPremiumPercent, 3) : null
          }
        />
        <ResultRow
          label={C.form.riskPremiumLabel}
          value={result ? formatPercent(result.riskPremiumPercent, 3) : null}
        />
        <ResultRow
          label={C.form.riskFreeResultLabel}
          value={
            riskFree === null ? null : formatPercent(riskFree, 3)
          }
        />
      </ResultGroup>

      {belowRiskFree ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.belowRiskFreeNotice}
        </p>
      ) : null}
    </CalculatorCard>
  );
}
