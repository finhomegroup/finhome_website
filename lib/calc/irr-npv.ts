/**
 * NPV, IRR and payback for /cong-cu/irr-npv/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `irr-npv.test.ts`.
 *
 * The cash flows are an ARRAY, index 0 being period 0 — the moment of the
 * investment. That indexing is the whole convention: `flows[0]` is not
 * discounted, `flows[1]` is discounted once. Off-by-one here silently changes
 * every answer, which is why the tests pin period 0 explicitly.
 *
 * IRR is solved with bisection rather than Newton–Raphson. Slower and it
 * needs a bracket, but it cannot diverge and — the property that matters — it
 * returns **null** when no rate in the searched range makes NPV zero, instead
 * of a plausible wrong number. Three cases genuinely have no single IRR and
 * all three come back null:
 *
 * - every flow the same sign (nothing to break even on);
 * - more than one sign change, which can admit several IRRs — reporting one
 *   of them as "the" IRR would be false, so the module reports the count and
 *   declines;
 * - a root outside the searched bracket.
 *
 * `modifiedIrr` exists because of that second case. MIRR reinvests positive
 * flows at a rate you supply instead of at the IRR itself, so it is unique
 * even when IRR is not, and it does not assume you can redeploy cash at 40%
 * merely because the project earned that.
 */

import { bisect } from "@/lib/calc/solve";

export type IrrNpvInput = {
  /** Cash flows by period; index 0 is period 0 and is not discounted. */
  flows: readonly number[];
  /** Discount rate per period, in percent. Drives NPV, not IRR. */
  discountRatePercent: number;
  /** Rate positive flows are assumed to be reinvested at, for MIRR. */
  reinvestRatePercent?: number;
  /** Rate negative flows are financed at, for MIRR. Defaults to the discount rate. */
  financeRatePercent?: number;
};

export type IrrNpvResult = {
  /** Present value of every flow at the discount rate, period 0 included. */
  npv: number;
  /** Sum of the flows, undiscounted. */
  totalFlows: number;
  /** Negative flows added up, as a positive figure. */
  totalOutflows: number;
  /** Positive flows added up. */
  totalInflows: number;
  /** Present value of the inflows divided by that of the outflows. */
  profitabilityIndex: number | null;
  /** IRR per period, in percent. Null when there is no single answer. */
  irrPercent: number | null;
  /** How many times the flows change sign. More than one means IRR is not unique. */
  signChanges: number;
  /** MIRR per period, in percent. Defined where IRR often is not. */
  modifiedIrrPercent: number | null;
  /**
   * Period by which the cumulative undiscounted flows first turn positive,
   * interpolated within the period. Null when they never do.
   */
  paybackPeriod: number | null;
  /** The same, on discounted flows. */
  discountedPaybackPeriod: number | null;
};

/** Present value of `flows` at `rate` per period, index 0 undiscounted. */
export function netPresentValue(
  flows: readonly number[],
  rate: number,
): number {
  let total = 0;
  for (let period = 0; period < flows.length; period += 1) {
    total += flows[period] / (1 + rate) ** period;
  }
  return total;
}

/** How many times the sign of the flows flips. Zeros are skipped. */
function countSignChanges(flows: readonly number[]): number {
  let changes = 0;
  let previous = 0;
  for (const flow of flows) {
    if (flow === 0) continue;
    const sign = flow > 0 ? 1 : -1;
    if (previous !== 0 && sign !== previous) changes += 1;
    previous = sign;
  }
  return changes;
}

/**
 * First period at which a running total turns non-negative, interpolated.
 *
 * Returns a fractional period: 2,4 means 40% of the way through period 3.
 * Null when the running total never gets there. Period 0 counts as 0 when the
 * flows start out non-negative.
 */
function firstCrossing(amounts: readonly number[]): number | null {
  let running = 0;
  for (let period = 0; period < amounts.length; period += 1) {
    const before = running;
    running += amounts[period];
    if (running >= 0) {
      if (period === 0) return 0;
      // Interpolate across the period that closed the gap.
      const closed = amounts[period];
      return closed === 0 ? period : period - 1 + -before / closed;
    }
  }
  return null;
}

/**
 * Evaluate a project's cash flows.
 *
 * Null when the inputs cannot describe a project: fewer than two flows, any
 * non-finite flow, a discount rate at or below −100%, or a non-finite
 * reinvestment or financing rate.
 *
 * `irrPercent` and `modifiedIrrPercent` are individually null when they have
 * no single answer — the rest of the result is still valid and worth showing.
 */
export function computeIrrNpv(input: IrrNpvInput): IrrNpvResult | null {
  const {
    flows,
    discountRatePercent,
    reinvestRatePercent,
    financeRatePercent,
  } = input;

  if (flows.length < 2) return null;
  if (flows.some((flow) => !Number.isFinite(flow))) return null;
  if (!Number.isFinite(discountRatePercent) || discountRatePercent <= -100) {
    return null;
  }

  const rate = discountRatePercent / 100;
  const reinvest =
    (reinvestRatePercent ?? discountRatePercent) / 100;
  const finance = (financeRatePercent ?? discountRatePercent) / 100;
  if (!Number.isFinite(reinvest) || reinvest <= -1) return null;
  if (!Number.isFinite(finance) || finance <= -1) return null;

  const npv = netPresentValue(flows, rate);

  let totalInflows = 0;
  let totalOutflows = 0;
  let pvInflows = 0;
  let pvOutflows = 0;
  for (let period = 0; period < flows.length; period += 1) {
    const flow = flows[period];
    const discounted = flow / (1 + rate) ** period;
    if (flow >= 0) {
      totalInflows += flow;
      pvInflows += discounted;
    } else {
      totalOutflows += -flow;
      pvOutflows += -discounted;
    }
  }

  const signChanges = countSignChanges(flows);

  // Exactly one sign change guarantees at most one IRR. With more than one,
  // several rates can satisfy NPV = 0 and naming one would be false.
  let irrPercent: number | null = null;
  if (signChanges === 1) {
    // Lower bound just above −100%: at exactly −1 the discount factors blow
    // up. Upper bound 1000% per period is far past any real project.
    const solved = bisect((r) => netPresentValue(flows, r), -0.999_999, 10);
    irrPercent = solved === null ? null : solved * 100;
  }

  // MIRR: compound the inflows forward at the reinvestment rate, discount the
  // outflows back at the financing rate, then find the rate linking the two.
  const periods = flows.length - 1;
  let terminalInflows = 0;
  let presentOutflows = 0;
  for (let period = 0; period < flows.length; period += 1) {
    const flow = flows[period];
    if (flow >= 0) {
      terminalInflows += flow * (1 + reinvest) ** (periods - period);
    } else {
      presentOutflows += -flow / (1 + finance) ** period;
    }
  }
  const modifiedIrrPercent =
    periods > 0 && presentOutflows > 0 && terminalInflows > 0
      ? ((terminalInflows / presentOutflows) ** (1 / periods) - 1) * 100
      : null;

  const discounted = flows.map(
    (flow, period) => flow / (1 + rate) ** period,
  );

  return {
    npv,
    totalFlows: totalInflows - totalOutflows,
    totalOutflows,
    totalInflows,
    profitabilityIndex: pvOutflows > 0 ? pvInflows / pvOutflows : null,
    irrPercent,
    signChanges,
    modifiedIrrPercent,
    paybackPeriod: firstCrossing(flows),
    discountedPaybackPeriod: firstCrossing(discounted),
  };
}
