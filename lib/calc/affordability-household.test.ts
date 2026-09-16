import { describe, it, expect } from "vitest";
import {
  computeAffordability,
  type AffordabilityInput,
} from "@/lib/calc/affordability";
import { pv } from "@/lib/calc/finance";

/**
 * Household budget versus credit ceiling, and the cash ledger.
 *
 * Acceptance scenario 6: "expense/reserve omitted vs supplied: cannot label
 * unknowns zero or call a ceiling a safe budget. Living/debt/reserve totals
 * reconcile; negative residual rejects an infeasible plan with an explicit
 * action."
 *
 * The defaults below are the page's own: 50 triệu gross, 5 triệu of existing
 * debt, 600 triệu of cash, 8,5%/năm over 240 months.
 */

const CEILING: AffordabilityInput = {
  monthlyIncome: 50_000_000,
  monthlyDebts: 5_000_000,
  downPayment: 600_000_000,
  annualRatePercent: 8.5,
  termMonths: 240,
};

const HOUSEHOLD: AffordabilityInput = {
  ...CEILING,
  mode: "household",
  monthlyNetIncome: 44_000_000,
  essentialExpenses: 18_000_000,
  monthlyBuffer: 3_000_000,
};

const afford = (input: AffordabilityInput) => {
  const result = computeAffordability(input);
  if (result === null) throw new Error("computeAffordability returned null");
  return result;
};

describe("ceiling mode is unchanged and says so", () => {
  it("defaults to the credit ceiling and reports no household figure", () => {
    const result = afford(CEILING);
    expect(result.mode).toBe("ceiling");
    expect(result.householdResidual).toBeNull();
    expect(result.infeasible).toBe(false);
    // A ceiling-mode answer can never claim a limited conclusion about
    // expenses it never asked for.
    expect(result.conclusionLimited).toBe(false);
  });

  it("names the ceiling separately from the budget it is not", () => {
    const result = afford(CEILING);
    // 50 triệu × 50% − 5 triệu = 20 triệu, equal to 50 × 40%, so housing wins
    // the tie — the simpler story, per the module.
    expect(result.assumedRatioCeiling).toBeCloseTo(20_000_000, 6);
    expect(result.affordableHousingPayment).toBeCloseTo(result.assumedRatioCeiling, 6);
    expect(result.bindingLimit).toBe("housing");
  });

  it("moves with the ratios, which is what makes it an assumption", () => {
    // The ceiling is a function of inputs the user controls. If it were a
    // lender's decision it could not be.
    const stricter = afford({
      ...CEILING,
      housingRatioPercent: 30,
      totalDebtRatioPercent: 40,
    });
    expect(stricter.assumedRatioCeiling).toBeCloseTo(15_000_000, 6);
    expect(stricter.assumedRatioCeiling).toBeLessThan(
      afford(CEILING).assumedRatioCeiling,
    );
  });
});

describe("household mode against the lender ceiling", () => {
  const result = afford(HOUSEHOLD);

  it("reconciles the household's own ledger exactly", () => {
    // Net income is fully accounted for: essentials + debts + buffer +
    // residual, each counted once. This identity is what proves nothing is
    // double-subtracted.
    expect(
      18_000_000 + 5_000_000 + 3_000_000 + result.householdResidual!,
    ).toBeCloseTo(44_000_000, 6);
    expect(result.householdResidual).toBeCloseTo(18_000_000, 6);
  });

  it("does not subtract recurring housing costs twice", () => {
    // `monthlyHousingCosts` comes out of the housing BUDGET, not out of the
    // residual. If it were taken in both places a 2 triệu management fee
    // would cost the buyer 4 triệu of borrowing capacity.
    const withCosts = afford({ ...HOUSEHOLD, monthlyHousingCosts: 2_000_000 });
    expect(withCosts.householdResidual).toBeCloseTo(
      result.householdResidual!,
      6,
    );
    expect(withCosts.affordablePrincipalInterest).toBeCloseTo(
      result.affordablePrincipalInterest - 2_000_000,
      6,
    );
  });

  it("lets the household bind below the lender ceiling", () => {
    // 18 triệu of residual against a 20 triệu ceiling: the household is the
    // binding constraint, which is the common and dangerous case.
    expect(result.assumedRatioCeiling).toBeCloseTo(20_000_000, 6);
    expect(result.bindingLimit).toBe("household");
    expect(result.affordableHousingPayment).toBeCloseTo(18_000_000, 6);
    expect(result.affordableHousingPayment).toBeLessThan(result.assumedRatioCeiling);
  });

  it("produces a materially lower price than the ceiling answer", () => {
    // This gap IS the finding. A page that shows only the ceiling sends a
    // buyer to view houses it has not established they can pay for.
    const ceiling = afford(CEILING);
    expect(result.maxPrice).toBeLessThan(ceiling.maxPrice);
    const shortfall = 1 - result.maxPrice / ceiling.maxPrice;
    expect(shortfall).toBeGreaterThan(0.05);
  });

  it("lets the lender bind when the household has more room than the bank", () => {
    // The other direction must work too, or "household mode" would just be a
    // lower number rather than a comparison.
    const rich = afford({
      ...HOUSEHOLD,
      monthlyNetIncome: 48_000_000,
      essentialExpenses: 10_000_000,
      monthlyBuffer: 1_000_000,
    });
    expect(rich.householdResidual).toBeCloseTo(32_000_000, 6);
    expect(rich.affordableHousingPayment).toBeCloseTo(rich.assumedRatioCeiling, 6);
    expect(rich.bindingLimit).toBe("housing");
  });

  it("inverts the binding payment into a loan exactly", () => {
    // Independent reference: pv() of the affordable instalment, the same
    // closed form the page's prose quotes.
    const reference = pv(8.5 / 100 / 12, 240, -18_000_000);
    expect(result.maxLoan).toBeCloseTo(reference, 6);
  });

  it("requires a net income rather than falling back on the gross one", () => {
    // Silently reusing gross income here would overstate every household
    // residual by the whole tax and insurance wedge.
    expect(
      computeAffordability({ ...HOUSEHOLD, monthlyNetIncome: undefined }),
    ).toBeNull();
    expect(
      computeAffordability({ ...HOUSEHOLD, monthlyNetIncome: 0 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...HOUSEHOLD, monthlyNetIncome: -1 }),
    ).toBeNull();
  });
});

describe("unknown expenses are not zero expenses", () => {
  // Four states that must stay four states. Collapsing any pair of them is the
  // defect: a household whose living costs were never supplied would be
  // presented as a complete budget.
  //
  //   OMITTED   the key is absent from the input object
  //   UNDEFINED the key is present and explicitly undefined (a blank field)
  //   ZERO      the user stated zero
  //   ENTERED   the user stated a figure
  const omitted = afford({
    mode: "household",
    monthlyIncome: 50_000_000,
    monthlyNetIncome: 44_000_000,
    monthlyBuffer: 3_000_000,
    monthlyDebts: 5_000_000,
    downPayment: 600_000_000,
    annualRatePercent: 8.5,
    termMonths: 240,
  });
  const blank = afford({ ...HOUSEHOLD, essentialExpenses: undefined });
  const zero = afford({ ...HOUSEHOLD, essentialExpenses: 0 });
  const entered = afford(HOUSEHOLD);

  it("treats an OMITTED figure as unknown", () => {
    expect(omitted.conclusionLimited).toBe(true);
  });

  it("treats an explicitly BLANK figure as unknown too", () => {
    // What a cleared input field sends. It must not be read as a statement.
    expect(blank.conclusionLimited).toBe(true);
  });

  it("treats a stated ZERO as known", () => {
    // A household where someone else covers the living costs is unusual but
    // not impossible, and it is the user's statement to make.
    expect(zero.conclusionLimited).toBe(false);
  });

  it("treats an ENTERED figure as known", () => {
    expect(entered.conclusionLimited).toBe(false);
  });

  it("still answers when the figure is unknown, rather than refusing", () => {
    // Refusing would be no more honest than answering with the limit stated.
    expect(omitted.maxPrice).toBeGreaterThan(0);
    expect(blank.maxPrice).toBeGreaterThan(0);
  });

  it("makes unknown and stated-zero numerically identical, and that is the point", () => {
    // They produce the SAME arithmetic, which is exactly why the flag has to
    // carry the difference — nothing in the numbers can.
    expect(omitted.householdResidual).toBeCloseTo(zero.householdResidual!, 6);
    expect(omitted.maxPrice).toBeCloseTo(zero.maxPrice, 6);
    expect(omitted.conclusionLimited).not.toBe(zero.conclusionLimited);
  });

  it("degenerates into the ratio ceiling when expenses are unknown", () => {
    // The proof that the flag matters: with no expenses and no buffer the
    // household residual is net income less debts, which here clears the
    // ceiling — so household mode silently becomes ceiling mode under a
    // friendlier name. That is the answer `conclusionLimited` attaches to.
    const unknownNoBuffer = afford({
      ...HOUSEHOLD,
      essentialExpenses: undefined,
      monthlyBuffer: 0,
    });
    expect(unknownNoBuffer.affordableHousingPayment).toBeCloseTo(
      unknownNoBuffer.assumedRatioCeiling,
      6,
    );
    expect(unknownNoBuffer.conclusionLimited).toBe(true);
  });

  it("never sets the flag in ceiling mode, which never asks", () => {
    expect(afford(CEILING).conclusionLimited).toBe(false);
    expect(
      afford({ ...CEILING, essentialExpenses: undefined }).conclusionLimited,
    ).toBe(false);
  });

  it("still rejects a negative stated figure", () => {
    expect(
      computeAffordability({ ...HOUSEHOLD, essentialExpenses: -1 }),
    ).toBeNull();
  });
});

describe("an infeasible household", () => {
  it("reports a negative residual as infeasible, not as an error", () => {
    const broke = afford({
      ...HOUSEHOLD,
      monthlyNetIncome: 20_000_000,
      essentialExpenses: 18_000_000,
      monthlyBuffer: 3_000_000,
    });
    // 20 − 18 − 5 − 3 = −6 triệu.
    expect(broke.householdResidual).toBeCloseTo(-6_000_000, 6);
    expect(broke.infeasible).toBe(true);
    expect(broke.affordableHousingPayment).toBe(0);
    expect(broke.maxLoan).toBe(0);
    expect(broke.noRoom).toBe(true);
    // The cash is still real and still theirs: the answer is "no loan", not
    // "no money".
    expect(broke.maxPrice).toBeCloseTo(600_000_000, 6);
  });

  it("treats an exactly-zero residual as infeasible too", () => {
    const exact = afford({
      ...HOUSEHOLD,
      monthlyNetIncome: 26_000_000,
      essentialExpenses: 18_000_000,
      monthlyBuffer: 3_000_000,
    });
    expect(exact.householdResidual).toBe(0);
    expect(exact.infeasible).toBe(true);
    expect(exact.maxLoan).toBe(0);
  });

  it("is not infeasible in the ordinary case", () => {
    expect(afford(HOUSEHOLD).infeasible).toBe(false);
  });
});

describe("the cash ledger", () => {
  it("deducts the reserve from usable cash exactly once", () => {
    const withReserve = afford({ ...CEILING, cashReserve: 100_000_000 });
    expect(withReserve.usableCash).toBeCloseTo(500_000_000, 6);
    // And the price falls by exactly the reserve, not by twice it.
    const without = afford(CEILING);
    expect(withReserve.maxPrice).toBeCloseTo(without.maxPrice - 100_000_000, 6);
    // The loan is untouched: a reserve changes what you can put down, not
    // what a lender will lend.
    expect(withReserve.maxLoan).toBeCloseTo(without.maxLoan, 6);
  });

  it("never lets a reserve larger than the cash go negative", () => {
    const over = afford({ ...CEILING, cashReserve: 900_000_000 });
    expect(over.usableCash).toBe(0);
    expect(over.maxPrice).toBeCloseTo(over.maxLoan, 6);
  });

  it("solves price and purchase costs together, with no residue", () => {
    const withCosts = afford({ ...CEILING, purchaseCostPercent: 5 });
    // The identity the closed form exists to satisfy: the cash pays the
    // purchase costs AND the gap between price and loan, with nothing left
    // over and nothing double-spent.
    expect(withCosts.purchaseCosts).toBeCloseTo(withCosts.maxPrice * 0.05, 6);
    expect(withCosts.cashToPrice + withCosts.purchaseCosts).toBeCloseTo(
      withCosts.usableCash,
      6,
    );
    expect(withCosts.maxLoan + withCosts.cashToPrice).toBeCloseTo(
      withCosts.maxPrice,
      6,
    );
  });

  it("lowers the affordable price once purchase costs are admitted", () => {
    const without = afford(CEILING);
    const withCosts = afford({ ...CEILING, purchaseCostPercent: 5 });
    expect(withCosts.maxPrice).toBeLessThan(without.maxPrice);
  });

  it("is the original arithmetic when both cash extras are zero", () => {
    // Backwards compatibility, asserted rather than assumed: the page's
    // existing default state must produce exactly maxLoan + downPayment.
    const result = afford(CEILING);
    expect(result.purchaseCosts).toBe(0);
    expect(result.usableCash).toBe(600_000_000);
    expect(result.maxPrice).toBeCloseTo(result.maxLoan + 600_000_000, 6);
    expect(result.downPaymentPercent).toBeCloseTo(
      (600_000_000 / result.maxPrice) * 100,
      6,
    );
  });

  it("refuses a purchase-cost percent that cannot be paid for", () => {
    expect(
      computeAffordability({ ...CEILING, purchaseCostPercent: 100 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...CEILING, purchaseCostPercent: 120 }),
    ).toBeNull();
    expect(
      computeAffordability({ ...CEILING, purchaseCostPercent: -1 }),
    ).toBeNull();
  });
});

describe("household mode rejections", () => {
  it("refuses negative household figures", () => {
    for (const patch of [
      { essentialExpenses: -1 },
      { monthlyBuffer: -1 },
      { cashReserve: -1 },
    ]) {
      expect(computeAffordability({ ...HOUSEHOLD, ...patch })).toBeNull();
    }
  });

  it("refuses non-finite household figures", () => {
    expect(
      computeAffordability({ ...HOUSEHOLD, essentialExpenses: NaN }),
    ).toBeNull();
    expect(
      computeAffordability({ ...HOUSEHOLD, monthlyBuffer: Infinity }),
    ).toBeNull();
  });
});
