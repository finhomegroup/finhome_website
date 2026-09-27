import { describe, expect, it } from "vitest";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { affordabilityStatus } from "@/lib/calc/affordability-status";

/** The shipped household scenario, parsed. */
const SHIPPED: AffordabilityInput = {
  mode: "household",
  monthlyIncome: 50_000_000,
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  cashReserve: 0,
  purchaseCostPercent: 0,
  assumedMaxLtvPercent: 100,
  annualRatePercent: 8.5,
  termMonths: 240,
  monthlyHousingCosts: 0,
  housingRatioPercent: 40,
  totalDebtRatioPercent: 50,
};

const status = (
  overrides: Partial<AffordabilityInput>,
  targetPrice: number | null = null,
  targetInvalid = false,
) => {
  const input = { ...SHIPPED, ...overrides };
  return affordabilityStatus({
    input,
    result: computeAffordability(input),
    targetPrice,
    targetInvalid,
  });
};

/** A fully costed household: purchase costs and a reserve are both modelled. */
const COSTED = { purchaseCostPercent: 3, cashReserve: 100_000_000 };

describe("affordabilityStatus without a target price", () => {
  it("is CAUTION on the shipped defaults: costs and reserve are not counted", () => {
    const s = status({});
    expect(s.tone).toBe("caution");
    expect(s.kind).toBe("referenceUncosted");
    expect(s.costsExcluded).toBe(true);
    expect(s.noReserve).toBe(true);
  });

  it("is only NEUTRAL when fully costed — a price range is not a verdict", () => {
    const s = status(COSTED);
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("reference");
  });

  it("keeps ceiling mode NEUTRAL: it is an assumed ceiling, not a budget", () => {
    const s = status({ ...COSTED, mode: "ceiling", monthlyNetIncome: undefined });
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("ceiling");
  });

  it("is NEUTRAL when essential costs are unknown", () => {
    const s = status({ ...COSTED, essentialExpenses: undefined });
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("limited");
  });

  it("names a negative household month as a CASH-FLOW shortfall", () => {
    const s = status({ essentialExpenses: 40_000_000 });
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("cashflowShort");
  });

  it("names missing cash for the costs as a CASH shortfall, not a monthly one", () => {
    const s = status({ downPayment: 0, purchaseCostPercent: 3 });
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("cashShort");
  });

  it("is UNKNOWN with no result", () => {
    const s = affordabilityStatus({
      input: null,
      result: null,
      targetPrice: null,
      targetInvalid: false,
    });
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("unknown");
  });
});

describe("affordabilityStatus against a target price", () => {
  const maxPrice = computeAffordability({ ...SHIPPED, ...COSTED })!.maxPrice;

  it("is a SHORTFALL above the range, with the gap as a PRICE difference", () => {
    const s = status(COSTED, Math.round(maxPrice) + 300_000_000);
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("aboveRange");
    expect(s.priceGap).toBeCloseTo(Math.round(maxPrice) + 300_000_000 - maxPrice, 6);
    // Which of the engine's two ceilings is the one the target breaks.
    expect(s.priceBinding).toBe(
      computeAffordability({ ...SHIPPED, ...COSTED })!.priceBinding,
    );
  });

  it("is MET within the range when costs and reserve are modelled", () => {
    const s = status(COSTED, Math.round(maxPrice) - 200_000_000);
    expect(s.tone).toBe("met");
    expect(s.kind).toBe("withinRange");
    expect(s.headroom).toBeCloseTo(maxPrice - (Math.round(maxPrice) - 200_000_000), 6);
  });

  it("is CAUTION within the range when costs or reserve are left out", () => {
    const plain = computeAffordability(SHIPPED)!.maxPrice;
    const s = status({}, Math.round(plain) - 200_000_000);
    expect(s.tone).toBe("caution");
    expect(s.kind).toBe("withinRangeUncosted");
  });

  it("stays a SHORTFALL above the range when costs are left out, since they only lower it", () => {
    const plain = computeAffordability(SHIPPED)!.maxPrice;
    const s = status({}, Math.round(plain) + 1_000_000);
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("aboveRange");
  });

  it("is CAUTION at the exact range, to the half đồng", () => {
    const s = status(COSTED, maxPrice);
    expect(s.tone).toBe("caution");
    expect(s.kind).toBe("atRange");
  });

  it("does not call a target within an unknown-expenses range met", () => {
    const limitedMax = computeAffordability({
      ...SHIPPED,
      ...COSTED,
      essentialExpenses: undefined,
    })!.maxPrice;
    const s = status(
      { ...COSTED, essentialExpenses: undefined },
      Math.round(limitedMax) - 100_000_000,
    );
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("limited");
  });

  it("never reports GREEN in ceiling mode, even within the ceiling", () => {
    const input = { ...SHIPPED, ...COSTED, mode: "ceiling" as const, monthlyNetIncome: undefined };
    const ceiling = computeAffordability(input)!.maxPrice;
    const s = status(
      { ...COSTED, mode: "ceiling", monthlyNetIncome: undefined },
      Math.round(ceiling) - 100_000_000,
    );
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("withinCeiling");
  });

  it("is UNKNOWN on an invalid target, keeping the range itself", () => {
    const s = status(COSTED, null, true);
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("targetInvalid");
    expect(s.maxPrice).toBeCloseTo(maxPrice, 6);
  });
});

/**
 * Codex repair 2 — essential completeness and a malformed target come BEFORE
 * any verdict; an exact-zero month is not a shortfall.
 */
describe("affordabilityStatus precedence", () => {
  const limitedInput = { ...COSTED, essentialExpenses: undefined };
  const limitedMax = computeAffordability({ ...SHIPPED, ...limitedInput })!.maxPrice;

  it("is UNKNOWN above an incomplete range: essentials are not optional", () => {
    const s = status(limitedInput, Math.round(limitedMax) + 500_000_000);
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("limited");
  });

  it("is UNKNOWN at an incomplete range, not a caution", () => {
    const s = status(limitedInput, limitedMax);
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("limited");
  });

  it("puts a malformed target before missing essentials and before any shortfall", () => {
    expect(status(limitedInput, null, true).kind).toBe("targetInvalid");
    expect(status({ downPayment: 0, purchaseCostPercent: 3 }, null, true).kind).toBe(
      "targetInvalid",
    );
  });

  it("puts missing essentials before a cash shortfall", () => {
    const s = status({ downPayment: 0, purchaseCostPercent: 3, essentialExpenses: undefined });
    expect(s.tone).toBe("unknown");
    expect(s.kind).toBe("limited");
  });

  it("keeps a KNOWN shortfall red with only optional costs omitted", () => {
    // 0% purchase cost and 0 reserve are optional; essentials are known.
    const plain = computeAffordability(SHIPPED)!.maxPrice;
    expect(status({}, Math.round(plain) + 1_000_000).tone).toBe("shortfall");
  });

  /** 44 − 18 − 5 − 21 = 0: nothing left each month, and nothing short. */
  const ZERO = { ...COSTED, monthlyBuffer: 21_000_000 };
  const cashOnly = computeAffordability({ ...SHIPPED, ...ZERO })!;

  it("calls an EXACT-zero month no headroom (caution), never a shortfall", () => {
    expect(cashOnly.infeasible).toBe(true); // the engine's flag includes zero
    const s = status(ZERO);
    expect(s.tone).toBe("caution");
    expect(s.kind).toBe("noMonthlyHeadroom");
  });

  it("stays CAUTION for a target within the cash-only price", () => {
    expect(cashOnly.maxPrice).toBeGreaterThan(0);
    const s = status(ZERO, Math.round(cashOnly.maxPrice) - 100_000_000);
    expect(s.tone).toBe("caution");
    expect(s.kind).toBe("noMonthlyHeadroom");
  });

  it("is a SHORTFALL for a target above the cash-only price", () => {
    const s = status(ZERO, Math.round(cashOnly.maxPrice) + 100_000_000);
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("aboveRange");
  });

  it("is a cash-flow SHORTFALL only when the month is truly negative", () => {
    const s = status({ ...COSTED, monthlyBuffer: 21_000_001 }, 100_000_000);
    expect(s.tone).toBe("shortfall");
    expect(s.kind).toBe("cashflowShort");
  });
});
