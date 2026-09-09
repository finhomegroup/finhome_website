/**
 * Weighted average cost of capital, for /cong-cu/wacc/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `wacc.test.ts`.
 *
 *   WACC = wE × rE + wP × rP + wD × rD × (1 − tax)
 *
 * The one thing that makes WACC more than a weighted average: interest is
 * deductible, so debt costs the company `rD × (1 − tax)` rather than `rD`.
 * Dividends are not deductible, so equity and preferred carry no such
 * adjustment. Applying the tax shield to all three — or to none — is the
 * standard error, and it moves the answer by percentage points.
 *
 * Weights are on MARKET values, not book values. The module cannot enforce
 * that (a number is a number), so the page says it: for a listed company
 * equity is market capitalisation, not the equity line of the balance sheet.
 *
 * Vietnam's standard corporate income tax rate is 20%, which is the default.
 * It is an input because incentive rates exist for some sectors and locations.
 */

export type WaccInput = {
  /** Market value of equity, in đồng. */
  equityValue: number;
  /** Market value of debt, in đồng. */
  debtValue: number;
  /** Market value of preferred stock, in đồng. Rare in Vietnam. */
  preferredValue?: number;
  /** Cost of equity, in percent. From CAPM, usually. */
  costOfEquityPercent: number;
  /** Pre-tax cost of debt, in percent. The interest rate actually paid. */
  costOfDebtPercent: number;
  /** Cost of preferred stock, in percent. */
  costOfPreferredPercent?: number;
  /** Corporate income tax rate, in percent. Vietnam's standard rate is 20. */
  taxRatePercent?: number;
};

export type WaccResult = {
  /** Equity + debt + preferred. */
  totalCapital: number;
  equityWeightPercent: number;
  debtWeightPercent: number;
  preferredWeightPercent: number;
  /** `costOfDebt × (1 − tax)` — the only component with a tax shield. */
  afterTaxCostOfDebtPercent: number;
  /** Percentage points of WACC contributed by each component. */
  equityContributionPoints: number;
  debtContributionPoints: number;
  preferredContributionPoints: number;
  /** The answer, in percent. */
  waccPercent: number;
  /** What WACC would be with no deduction — the size of the shield. */
  waccBeforeTaxShieldPercent: number;
  /** Percentage points the deduction saves. */
  taxShieldPoints: number;
  /** Debt divided by equity. Null when there is no equity. */
  debtToEquity: number | null;
};

/**
 * Compute WACC.
 *
 * Null when the inputs cannot describe a capital structure: a non-positive
 * total capital, a negative value, a tax rate outside 0–100, preferred stock
 * with no cost given, or any non-finite number.
 *
 * A negative cost of equity or debt is allowed — it is nonsense in practice
 * but the module's job is arithmetic, and the page's job is to say so.
 */
export function computeWacc(input: WaccInput): WaccResult | null {
  const {
    equityValue,
    debtValue,
    preferredValue = 0,
    costOfEquityPercent,
    costOfDebtPercent,
    // Only reachable when there is no preferred capital at all: the guard
    // below rejects a preferred value whose cost was left out.
    costOfPreferredPercent = 0,
    taxRatePercent = 20,
  } = input;

  const values = [equityValue, debtValue, preferredValue];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return null;

  const costs = [
    costOfEquityPercent,
    costOfDebtPercent,
    costOfPreferredPercent,
    taxRatePercent,
  ];
  if (costs.some((value) => !Number.isFinite(value))) return null;
  if (taxRatePercent < 0 || taxRatePercent > 100) return null;

  // Preferred capital with no cost given would be priced at 0%, which
  // silently understates WACC by its whole weight — on a 700/300/100 tỷ
  // structure that is a full percentage point (10,87% instead of 11,87%).
  // capm.ts refuses the same shape for the same reason: choosing a number
  // silently is a guess. The RAW input is read, not the destructured
  // default, so an omitted cost is distinguishable from an explicit 0 — a
  // stated 0% is a claim, an omitted one is not.
  //
  // `preferredValue > 0` is load-bearing: preferred stock is rare in
  // Vietnam, so the ordinary equity-and-debt structure must stay valid with
  // the cost omitted.
  //
  // Unreachable from /cong-cu/wacc/ today — the page always passes a parsed
  // number inside its own usable-fields gate — so its "nothing in the
  // capital structure" notice still reads correctly for every null it can
  // see. If the cost of preferred is ever made an OPTIONAL field there, that
  // notice has to be widened to cover this rejection too.
  if (preferredValue > 0 && input.costOfPreferredPercent === undefined) {
    return null;
  }

  const totalCapital = equityValue + debtValue + preferredValue;
  if (totalCapital <= 0) return null;

  const equityWeight = equityValue / totalCapital;
  const debtWeight = debtValue / totalCapital;
  const preferredWeight = preferredValue / totalCapital;

  // Only debt gets the shield: interest is deductible, dividends are not.
  const afterTaxCostOfDebtPercent =
    costOfDebtPercent * (1 - taxRatePercent / 100);

  const equityContributionPoints = equityWeight * costOfEquityPercent;
  const debtContributionPoints = debtWeight * afterTaxCostOfDebtPercent;
  const preferredContributionPoints =
    preferredWeight * costOfPreferredPercent;

  const waccPercent =
    equityContributionPoints +
    debtContributionPoints +
    preferredContributionPoints;

  const waccBeforeTaxShieldPercent =
    equityWeight * costOfEquityPercent +
    debtWeight * costOfDebtPercent +
    preferredWeight * costOfPreferredPercent;

  return {
    totalCapital,
    equityWeightPercent: equityWeight * 100,
    debtWeightPercent: debtWeight * 100,
    preferredWeightPercent: preferredWeight * 100,
    afterTaxCostOfDebtPercent,
    equityContributionPoints,
    debtContributionPoints,
    preferredContributionPoints,
    waccPercent,
    waccBeforeTaxShieldPercent,
    taxShieldPoints: waccBeforeTaxShieldPercent - waccPercent,
    debtToEquity: equityValue > 0 ? debtValue / equityValue : null,
  };
}
