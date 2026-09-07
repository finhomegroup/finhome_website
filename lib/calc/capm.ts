/**
 * The capital asset pricing model, for /cong-cu/capm/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `capm.test.ts`.
 *
 *   expected return = risk-free rate + beta × market risk premium
 *
 * The market risk premium can be given directly, or derived as
 * `market return − risk-free rate`. Both are in circulation, so the module
 * accepts either — but **not both**, because two figures that disagree have
 * no correct resolution and silently picking one would be a guess.
 *
 * `beta` is deliberately unconstrained in sign. A negative beta is rare but
 * real (gold miners against a falling market, inverse ETFs), and it produces
 * an expected return BELOW the risk-free rate — which is the model working,
 * not a bug: an asset that pays off when everything else falls is worth
 * holding at a discount.
 *
 * The alpha field is Jensen's alpha: what an asset actually returned, less
 * what CAPM said it should. Positive alpha is the claim every active manager
 * makes; computing it is how you check.
 */

export type CapmInput = {
  /** Risk-free rate, in percent per year. */
  riskFreeRatePercent: number;
  /** Sensitivity to the market. 1 moves with it, 0 ignores it. */
  beta: number;
  /** Expected market return, in percent per year. Give this OR the premium. */
  marketReturnPercent?: number;
  /** Market risk premium, in percent per year. Give this OR the market return. */
  marketPremiumPercent?: number;
  /** What the asset actually returned, for Jensen's alpha. */
  actualReturnPercent?: number;
};

export type CapmResult = {
  /** The premium used, whether supplied or derived. */
  marketPremiumPercent: number;
  /** `beta × premium` — the part of the return you are paid for risk. */
  riskPremiumPercent: number;
  /** `risk-free + beta × premium`. */
  expectedReturnPercent: number;
  /** How the beta reads. */
  profile: "inverse" | "defensive" | "market" | "aggressive";
  /**
   * Actual return less expected. Positive means the asset beat what its risk
   * justified. Null when no actual return was given.
   */
  alphaPercent: number | null;
};

/**
 * Price risk under CAPM.
 *
 * Null when the inputs cannot describe the model: neither the market return
 * nor the premium supplied, both supplied (ambiguous), or any non-finite
 * number. Negative rates and a negative beta are all allowed.
 */
export function computeCapm(input: CapmInput): CapmResult | null {
  const {
    riskFreeRatePercent,
    beta,
    marketReturnPercent,
    marketPremiumPercent,
    actualReturnPercent,
  } = input;

  if (!Number.isFinite(riskFreeRatePercent)) return null;
  if (!Number.isFinite(beta)) return null;

  // Exactly one of the two. Both would be two claims about the same
  // quantity, and choosing between them silently is a guess.
  let premium: number;
  if (marketReturnPercent !== undefined) {
    if (marketPremiumPercent !== undefined) return null;
    if (!Number.isFinite(marketReturnPercent)) return null;
    premium = marketReturnPercent - riskFreeRatePercent;
  } else if (marketPremiumPercent !== undefined) {
    if (!Number.isFinite(marketPremiumPercent)) return null;
    premium = marketPremiumPercent;
  } else {
    return null;
  }

  if (actualReturnPercent !== undefined && !Number.isFinite(actualReturnPercent)) {
    return null;
  }

  const riskPremiumPercent = beta * premium;
  const expectedReturnPercent = riskFreeRatePercent + riskPremiumPercent;

  const profile =
    beta < 0
      ? "inverse"
      : beta < 1
        ? "defensive"
        : beta === 1
          ? "market"
          : "aggressive";

  return {
    marketPremiumPercent: premium,
    riskPremiumPercent,
    expectedReturnPercent,
    profile,
    alphaPercent:
      actualReturnPercent === undefined
        ? null
        : actualReturnPercent - expectedReturnPercent,
  };
}
