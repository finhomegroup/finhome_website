/**
 * Black–Scholes option pricing, for /cong-cu/quyen-chon-black-scholes/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `black-scholes.test.ts`.
 *
 * The European call and put, plus the greeks, on the standard model with a
 * continuous dividend yield. Φ comes from `normal.ts`, which is tested
 * separately against published tables — an error there would surface here as
 * a plausible-looking price, so the two are kept apart on purpose.
 *
 * Conventions that change the answer:
 *
 * - Rates and volatility are ANNUAL and CONTINUOUSLY COMPOUNDED, because
 *   that is what the model is derived in. A 5% rate here is e^0,05 − 1 =
 *   5,127% effective, not 5%. The page says so; the module cannot guess.
 * - `timeToExpiryYears` is in years, so 3 months is 0,25.
 * - `dividendYieldPercent` is the continuous yield q. For an index it is the
 *   dividend yield; for a single stock paying discrete dividends the model is
 *   an approximation, and the page says that too.
 *
 * Two limiting cases are handled exactly rather than left to the formula,
 * because both are reachable from a form and both divide by zero in d₁:
 *
 * - **At expiry** (`t = 0`): the option is worth its intrinsic value, delta
 *   is 0 or 1, and every other greek is 0.
 * - **Zero volatility**: the payoff is deterministic, so the option is worth
 *   the discounted intrinsic value of the forward.
 *
 * Put-call parity is the invariant worth trusting over any single price, and
 * the tests assert it across a grid rather than at one point.
 */

import { normalCdf, normalPdf } from "@/lib/calc/normal";

export type OptionKind = "call" | "put";

export type BlackScholesInput = {
  /** Current price of the underlying, in đồng. */
  spot: number;
  /** Strike price, in đồng. */
  strike: number;
  /** Time to expiry in YEARS. Three months is 0,25. */
  timeToExpiryYears: number;
  /** Annualised volatility, in percent. 30 means 30%/năm. */
  volatilityPercent: number;
  /** Continuously compounded risk-free rate, in percent per year. */
  riskFreeRatePercent: number;
  /** Continuous dividend yield, in percent per year. */
  dividendYieldPercent?: number;
};

export type OptionGreeks = {
  /** Change in price per 1 đồng change in the underlying. */
  delta: number;
  /** Change in delta per 1 đồng change in the underlying. */
  gamma: number;
  /** Change in price per 1 percentage point of volatility. */
  vega: number;
  /** Change in price per DAY of time passing. Negative for a long option. */
  theta: number;
  /** Change in price per 1 percentage point of interest rate. */
  rho: number;
};

export type BlackScholesResult = {
  /** The call price. */
  callPrice: number;
  /** The put price. */
  putPrice: number;
  /** d₁ and d₂. Null in the two limiting cases, where they are undefined. */
  d1: number | null;
  d2: number | null;
  /** Greeks for the call. */
  callGreeks: OptionGreeks;
  /** Greeks for the put. */
  putGreeks: OptionGreeks;
  /** `spot − strike` for a call; the reverse for a put. Floored at 0. */
  callIntrinsic: number;
  putIntrinsic: number;
  /** Price less intrinsic value: what the remaining time is worth. */
  callTimeValue: number;
  putTimeValue: number;
  /** `spot / strike`. Above 1 a call is in the money. */
  moneyness: number;
  /** Risk-neutral probability the call finishes in the money, in percent. */
  callProbabilityItmPercent: number | null;
  /** The forward price of the underlying at expiry. */
  forwardPrice: number;
};

/** Greeks that are all zero: the shape used at expiry. */
function zeroGreeks(delta: number): OptionGreeks {
  return { delta, gamma: 0, vega: 0, theta: 0, rho: 0 };
}

/**
 * Price a European option and its greeks.
 *
 * Null when the inputs cannot describe an option: a non-positive spot or
 * strike, a negative time, volatility, or dividend yield, or any non-finite
 * number. A zero time and a zero volatility are both allowed and handled as
 * exact limiting cases.
 *
 * The risk-free rate may be negative; that has happened in real markets and
 * the formula is unaffected.
 */
export function computeBlackScholes(
  input: BlackScholesInput,
): BlackScholesResult | null {
  const {
    spot,
    strike,
    timeToExpiryYears: t,
    volatilityPercent,
    riskFreeRatePercent,
    dividendYieldPercent = 0,
  } = input;

  const nonNegative = [t, volatilityPercent, dividendYieldPercent];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  if (!Number.isFinite(spot) || spot <= 0) return null;
  if (!Number.isFinite(strike) || strike <= 0) return null;
  if (!Number.isFinite(riskFreeRatePercent)) return null;

  const sigma = volatilityPercent / 100;
  const r = riskFreeRatePercent / 100;
  const q = dividendYieldPercent / 100;

  const callIntrinsic = Math.max(0, spot - strike);
  const putIntrinsic = Math.max(0, strike - spot);
  const moneyness = spot / strike;
  const forwardPrice = spot * Math.exp((r - q) * t);

  // Limiting case: at expiry the option IS its intrinsic value. d₁ divides by
  // sigma·√t, so the formula cannot be used here.
  if (t === 0) {
    return {
      callPrice: callIntrinsic,
      putPrice: putIntrinsic,
      d1: null,
      d2: null,
      callGreeks: zeroGreeks(spot > strike ? 1 : 0),
      putGreeks: zeroGreeks(spot < strike ? -1 : 0),
      callIntrinsic,
      putIntrinsic,
      callTimeValue: 0,
      putTimeValue: 0,
      moneyness,
      callProbabilityItmPercent: spot > strike ? 100 : 0,
      forwardPrice,
    };
  }

  const discount = Math.exp(-r * t);
  const carry = Math.exp(-q * t);

  // Limiting case: with no volatility the payoff is certain, so the option is
  // the discounted intrinsic value of the forward. Same division-by-zero.
  if (sigma === 0) {
    const callPrice = discount * Math.max(0, forwardPrice - strike);
    const putPrice = discount * Math.max(0, strike - forwardPrice);
    const inTheMoney = forwardPrice > strike;
    return {
      callPrice,
      putPrice,
      d1: null,
      d2: null,
      callGreeks: zeroGreeks(inTheMoney ? carry : 0),
      putGreeks: zeroGreeks(inTheMoney ? 0 : -carry),
      callIntrinsic,
      putIntrinsic,
      callTimeValue: callPrice - callIntrinsic,
      putTimeValue: putPrice - putIntrinsic,
      moneyness,
      callProbabilityItmPercent: inTheMoney ? 100 : 0,
      forwardPrice,
    };
  }

  const sqrtT = Math.sqrt(t);
  const d1 =
    (Math.log(spot / strike) + (r - q + (sigma * sigma) / 2) * t) /
    (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const nd1 = normalCdf(d1);
  const nd2 = normalCdf(d2);
  const nMinusD1 = normalCdf(-d1);
  const nMinusD2 = normalCdf(-d2);
  const pdfD1 = normalPdf(d1);

  const callPrice = spot * carry * nd1 - strike * discount * nd2;
  const putPrice = strike * discount * nMinusD2 - spot * carry * nMinusD1;

  if (!Number.isFinite(callPrice) || !Number.isFinite(putPrice)) return null;

  // Gamma and vega are identical for a call and a put; delta, theta and rho
  // are not. Vega is per PERCENTAGE POINT and theta per DAY, because those
  // are the units they are quoted and used in.
  const gamma = (carry * pdfD1) / (spot * sigma * sqrtT);
  const vega = (spot * carry * pdfD1 * sqrtT) / 100;

  const callTheta =
    (-(spot * carry * pdfD1 * sigma) / (2 * sqrtT) +
      q * spot * carry * nd1 -
      r * strike * discount * nd2) /
    365;
  const putTheta =
    (-(spot * carry * pdfD1 * sigma) / (2 * sqrtT) -
      q * spot * carry * nMinusD1 +
      r * strike * discount * nMinusD2) /
    365;

  return {
    callPrice,
    putPrice,
    d1,
    d2,
    callGreeks: {
      delta: carry * nd1,
      gamma,
      vega,
      theta: callTheta,
      rho: (strike * t * discount * nd2) / 100,
    },
    putGreeks: {
      delta: -carry * nMinusD1,
      gamma,
      vega,
      theta: putTheta,
      rho: (-strike * t * discount * nMinusD2) / 100,
    },
    callIntrinsic,
    putIntrinsic,
    callTimeValue: callPrice - callIntrinsic,
    putTimeValue: putPrice - putIntrinsic,
    moneyness,
    // N(d₂) is the risk-neutral probability of finishing in the money. It is
    // NOT a real-world probability, and the page is explicit about that.
    callProbabilityItmPercent: nd2 * 100,
    forwardPrice,
  };
}
