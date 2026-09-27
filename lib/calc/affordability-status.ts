/**
 * The semantic state of /cong-cu/kha-nang-mua-nha/'s answer, with or without
 * a home the reader is looking at.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese. Unit-tested in
 * `affordability-status.test.ts`.
 *
 * NO NEW FINANCIAL MODEL. `computeAffordability` owns the envelope, and it is
 * one of the modules `AGENTS.md` records as duplicating the canonical FinHome
 * engine, so nothing here prices a loan, a deposit or a fee at a second price.
 * The target comparison is a COMPARISON of one entered price with the
 * engine's `maxPrice` — subtraction and ordering, nothing else — and the
 * reason it gives is the engine's own `priceBinding`: above `maxPrice`, the
 * binding ceiling is by construction the one the target breaks. Whether the
 * OTHER ceiling also breaks is not known without a second formula, so no
 * presenter may claim it.
 *
 * THE ANSWER WITHOUT A TARGET IS A RANGE, NOT A VERDICT. Finding the highest
 * price the assumptions allow does not say anyone can afford a particular
 * home, so a positive `maxPrice` is `unknown` ("tầm giá tham khảo") — or
 * `caution` when the range leaves purchase costs or a cash reserve out. Only
 * a target within the range, with those modelled, is `met`.
 *
 * PRECEDENCE (Codex repair, 2026-09-27). A malformed target, then missing
 * ESSENTIAL living costs, withhold every verdict — `unknown` — even above
 * the range: essentials are essential data, not an optional cost. Only the
 * OPTIONAL omissions — a 0% purchase cost, a zero reserve — keep the
 * lower-bound argument: they can only make the true range smaller, so a
 * target above the range stays a proven `shortfall` with them, while a
 * target within it is amber, never green.
 *
 * THE FLAGS KEEP THEIR OWN MEANINGS. `financingBlocked` is missing CASH for
 * the costs; `infeasible` is a month with nothing left — and the engine sets
 * it at ZERO as well as below, so this module splits it: a truly negative
 * residual is `cashflowShort`, an exact zero is `noMonthlyHeadroom`
 * (caution: nothing is short, there is simply no room for an instalment, and
 * the range is then the cash-only price). `noRoom` is a monthly budget the
 * ratios or housing costs leave nothing of. None is a bank's refusal, and
 * ceiling mode — an assumed ceiling on gross income — is never green.
 */

import type {
  AffordabilityInput,
  AffordabilityResult,
  PriceBinding,
} from "@/lib/calc/affordability";
import { atLedgerZero, type ResultTone } from "@/lib/calc/result-status";

export type AffordabilityStatusKind =
  | "unknown"
  | "targetInvalid"
  | "cashShort"
  | "cashflowShort"
  | "noMonthlyHeadroom"
  | "noRoom"
  | "aboveRange"
  | "atRange"
  | "withinCeiling"
  | "limited"
  | "withinRangeUncosted"
  | "withinRange"
  | "ceiling"
  | "referenceUncosted"
  | "reference";

export type AffordabilityStatus = {
  tone: ResultTone;
  kind: AffordabilityStatusKind;
  /** Echoed so presenters read one figure. Null with no result. */
  maxPrice: number | null;
  targetPrice: number | null;
  /** `target − maxPrice`, only above the range. A PRICE gap, not cash. */
  priceGap: number | null;
  /** `maxPrice − target`, only below the range. */
  headroom: number | null;
  /** The engine's binding ceiling. Null with no result. */
  priceBinding: PriceBinding | null;
  /** No purchase costs modelled at a positive range. */
  costsExcluded: boolean;
  /** No cash reserve kept back. */
  noReserve: boolean;
  /** Essential costs not supplied (household mode). */
  limited: boolean;
};

export function affordabilityStatus({
  input,
  result,
  targetPrice,
  targetInvalid,
}: {
  input: AffordabilityInput | null;
  result: AffordabilityResult | null;
  /** The home the reader is looking at, or null when not entered. */
  targetPrice: number | null;
  /** A non-blank target that does not parse to a positive price. */
  targetInvalid: boolean;
}): AffordabilityStatus {
  const empty = {
    maxPrice: null,
    targetPrice: null,
    priceGap: null,
    headroom: null,
    priceBinding: null,
    costsExcluded: false,
    noReserve: false,
    limited: false,
  };
  if (input === null || result === null) {
    return { ...empty, tone: "unknown", kind: "unknown" };
  }

  const household = result.mode === "household";
  const base = {
    ...empty,
    maxPrice: result.maxPrice,
    priceBinding: result.priceBinding,
    costsExcluded: (input.purchaseCostPercent ?? 0) === 0,
    noReserve: (input.cashReserve ?? 0) === 0,
    limited: result.conclusionLimited,
  };
  const uncosted = base.costsExcluded || base.noReserve;

  // Data first: a malformed target, then missing essentials, withhold the
  // verdict. Then the engine's own "no answer" flags, each read for its own
  // meaning.
  if (targetInvalid) return { ...base, tone: "unknown", kind: "targetInvalid" };
  if (household && result.conclusionLimited) {
    return { ...base, tone: "unknown", kind: "limited" };
  }
  if (result.financingBlocked) {
    return { ...base, tone: "shortfall", kind: "cashShort" };
  }
  const residual = result.householdResidual;
  const noHeadroom = household && residual !== null && atLedgerZero(residual);
  if (household && result.infeasible && !noHeadroom) {
    return { ...base, tone: "shortfall", kind: "cashflowShort" };
  }
  if (!noHeadroom && household && result.noRoom) {
    return { ...base, tone: "shortfall", kind: "noRoom" };
  }

  if (targetPrice !== null) {
    const withTarget = { ...base, targetPrice };
    const difference = targetPrice - result.maxPrice;
    if (atLedgerZero(difference)) {
      return { ...withTarget, tone: "caution", kind: "atRange" };
    }
    if (difference > 0) {
      return {
        ...withTarget,
        tone: "shortfall",
        kind: "aboveRange",
        priceGap: difference,
      };
    }
    const within = { ...withTarget, headroom: -difference };
    if (noHeadroom) {
      return { ...within, tone: "caution", kind: "noMonthlyHeadroom" };
    }
    if (!household) return { ...within, tone: "unknown", kind: "withinCeiling" };
    if (uncosted) {
      return { ...within, tone: "caution", kind: "withinRangeUncosted" };
    }
    return { ...within, tone: "met", kind: "withinRange" };
  }

  if (noHeadroom) return { ...base, tone: "caution", kind: "noMonthlyHeadroom" };
  if (!household) return { ...base, tone: "unknown", kind: "ceiling" };
  if (uncosted) return { ...base, tone: "caution", kind: "referenceUncosted" };
  return { ...base, tone: "unknown", kind: "reference" };
}
