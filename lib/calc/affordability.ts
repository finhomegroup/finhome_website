/**
 * Home affordability for /cong-cu/kha-nang-mua-nha/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `affordability.test.ts`
 * and `affordability-household.test.ts`.
 *
 * This runs the mortgage calculation BACKWARDS: instead of "here is my loan,
 * what is the payment", it is "here is what I can pay, how big a loan is
 * that". The inversion is `pv()` — the present value of the affordable
 * instalment over the term — not a search, so it is exact.
 *
 * TWO MODES.
 *
 * `"ceiling"` applies two ratios to GROSS income and reports the smaller. It
 * is an ILLUSTRATIVE ceiling under ratios the user supplies — not a lender
 * decision, not an approval, and not a published cap. The ratios are inputs
 * with defaults; nothing here asserts what any bank does.
 *
 * `"household"` starts from NET income and subtracts what leaves the account
 * before a mortgage does: essential living costs, existing debt service, and a
 * buffer the household wants to keep saving. What is left is the housing
 * budget. It is usually the smaller of the two, and `bindingLimit` names which
 * one is actually stopping the buyer.
 *
 * UNKNOWN EXPENSES STAY UNKNOWN. `essentialExpenses` is optional and
 * `undefined` means "not supplied" — NOT zero. In household mode an
 * unsupplied figure sets `conclusionLimited`, and the page must not call the
 * output a budget. An explicit `0` is a different thing: a household stating
 * that someone else covers its living costs. Defaulting a blank field to a
 * known zero would make household mode silently return the ratio ceiling
 * under a friendlier name.
 *
 * THREE DIFFERENT LOAN FIGURES, KEPT APART.
 *
 * - `paymentSupportedLoan` — how much borrowing the affordable instalment
 *   would service. A capacity, with no reference to any property.
 * - `assumedMaxLtvPercent` — how much of a price the buyer ASSUMES can be
 *   financed. A user assumption to stress-test, not a bank's limit.
 * - `maxLoan` — the loan actually used at `maxPrice`, after both of the above
 *   and after the cash has been allocated.
 *
 * THE FINANCING ENVELOPE, AND WHY A CLOSED FORM.
 *
 * Let P be the price, L the loan used, C the usable cash, c the purchase-cost
 * rate and v the assumed maximum loan-to-price. Every đồng of cash goes to
 * exactly one of two places — the purchase costs, or the equity in the house:
 *
 *     C = (P − L) + c·P                      (the cash identity)
 *
 * and the buyer cannot borrow more than either bound allows:
 *
 *     L ≤ paymentSupportedLoan               (capacity)
 *     L ≤ v·P                                (assumed financing limit)
 *
 * Substituting the identity into each bound gives two ceilings on P:
 *
 *     P ≤ (K + C) / (1 + c)                  from capacity
 *     P ≤ C / (1 + c − v)                    from the financing limit
 *
 * and `maxPrice` is the smaller. Because v ≤ 1, the second ceiling is always
 * at least as tight as the one that would make equity negative, so
 * `cashToPrice = P − L` comes out NON-NEGATIVE by construction rather than
 * being clamped afterwards.
 *
 * That matters because the previous version had no financing bound at all: it
 * computed `maxPrice = (maxLoan + usableCash) / (1 + costRate)` and, with no
 * cash and a 5% cost rate, reported a 4,57 tỷ price against a 4,8 tỷ loan —
 * i.e. −228 triệu of equity, which the chart then hid by dropping a negative
 * segment. Hiding it was not the fix; the model was incoherent. Now, with no
 * cash and costs above zero, the answer is a price of 0 and
 * `financingBlocked` explains why, because there is no cash to pay the costs
 * with.
 */

import { pmt, pv } from "@/lib/calc/finance";

/** Which question the tool is answering. */
export type AffordabilityMode =
  /** An illustrative ceiling from ratios on gross income. */
  | "ceiling"
  /** What the household can carry, on net income less what it must spend. */
  | "household";

/** Which constraint produced the housing budget. */
export type AffordabilityBinding =
  /** The housing-payment ratio the user supplied. */
  | "housing"
  /** The total-debt ratio the user supplied, after existing debts. */
  | "totalDebt"
  /** The household's own residual after living costs, debts and buffer. */
  | "household";

/** Which ceiling set the price. */
export type PriceBinding =
  /** What the monthly payment can service. */
  | "payment"
  /** The cash available, given purchase costs and the assumed financing limit. */
  | "financing";

export type AffordabilityInput = {
  /** Which question to answer. Defaults to `"ceiling"`. */
  mode?: AffordabilityMode;

  /**
   * GROSS household income per month, in đồng — what the ratios apply to.
   *
   * Required in both modes. Its meaning does not change between them.
   */
  monthlyIncome: number;
  /**
   * NET household income per month: what actually arrives in the account.
   * Required in `"household"` mode, ignored in `"ceiling"` mode.
   */
  monthlyNetIncome?: number;
  /**
   * Essential living costs per month — food, utilities, schooling, transport,
   * healthcare.
   *
   * `undefined` means NOT SUPPLIED, and in household mode that sets
   * `conclusionLimited`. An explicit `0` is a statement, not a blank.
   *
   * Must NOT include housing costs (those are `monthlyHousingCosts`) or debt
   * service (`monthlyDebts`), or the residual would subtract them twice.
   */
  essentialExpenses?: number;
  /** Monthly amount the household wants to keep putting aside for shocks. */
  monthlyBuffer?: number;

  /** Existing debt service per month: car loans, card minimums, other loans. */
  monthlyDebts?: number;

  /** Cash available, before the reserve is taken out. */
  downPayment?: number;
  /**
   * Cash to keep back as an emergency fund. Subtracted from `downPayment`
   * exactly once to give `usableCash`.
   */
  cashReserve?: number;
  /**
   * One-off purchase costs as a percent of the PRICE: taxes, notary, transfer
   * and registration fees, loan insurance, basic fit-out. These are paid from
   * the same cash as the deposit.
   */
  purchaseCostPercent?: number;
  /**
   * The share of the price the buyer ASSUMES can be financed, in percent.
   *
   * A user assumption, not a bank's limit and not a regulation. Defaults to
   * 100, which leaves the assumption out of the answer entirely — the only
   * remaining constraint is then that the cash must still cover the purchase
   * costs. Lower it to stress-test a deposit requirement someone has actually
   * quoted.
   */
  assumedMaxLtvPercent?: number;

  /** Nominal annual rate in percent. */
  annualRatePercent: number;
  /** Term in months. */
  termMonths: number;
  /** Recurring housing costs per month other than principal and interest. */
  monthlyHousingCosts?: number;
  /** Share of gross income the housing payment may take, in percent. */
  housingRatioPercent?: number;
  /** Share of gross income ALL debt service may take, in percent. */
  totalDebtRatioPercent?: number;
};

export type AffordabilityResult = {
  /** Which question this result answers. */
  mode: AffordabilityMode;

  /** Housing budget under the housing ratio alone. */
  housingLimit: number;
  /** Housing budget left under the total-debt ratio, after existing debts. */
  totalDebtLimit: number;
  /**
   * The smaller of the two ratio limits, floored at 0.
   *
   * An illustrative ceiling under the ratios supplied. Not an approval.
   */
  assumedRatioCeiling: number;

  /**
   * What the household has left for housing after living costs, existing debt
   * service and its buffer. Null in `"ceiling"` mode. Can be negative.
   */
  householdResidual: number | null;
  /** True when the household residual is at or below zero. */
  infeasible: boolean;
  /**
   * True when the result rests on essential expenses that were not supplied.
   * The page must not describe the output as a budget while this is set.
   */
  conclusionLimited: boolean;

  /** The binding monthly budget, floored at 0. */
  affordableHousingPayment: number;
  /** Which monthly limit bound. `"housing"` on a tie — the simpler story. */
  bindingLimit: AffordabilityBinding;
  /**
   * The monthly BUDGET for principal and interest: what is left of the housing
   * budget after other housing costs.
   *
   * A CEILING ON WHAT THE BUYER COULD PAY, not a bill. It is what
   * `paymentSupportedLoan` is inverted from, and it only coincides with the
   * instalment when the payment is the binding constraint.
   */
  affordablePrincipalInterest: number;
  /**
   * The instalment `maxLoan` would actually charge, at this rate and term.
   *
   * WHY BOTH FIGURES EXIST. When the cash and the assumed financing share bind
   * the price, the loan actually used is SMALLER than the payment could
   * service — so its instalment is smaller than the budget too. On the audit's
   * household fixture the budget is 15 triệu while the 1.590.909.091 ₫ loan
   * charges about 13,81 triệu, and reporting the budget as "trả gốc và lãi mỗi
   * tháng" told the reader they would be paying 1,2 triệu a month they would
   * not.
   *
   * Never above `affordablePrincipalInterest`, because `maxLoan` is never above
   * `paymentSupportedLoan` and the instalment rises with the principal.
   */
  expectedPrincipalInterest: number;

  /** The borrowing that instalment would service, ignoring any property. */
  paymentSupportedLoan: number;
  /** The financing assumption echoed back. */
  assumedMaxLtvPercent: number;
  /** The loan actually used at `maxPrice`. Never above either bound. */
  maxLoan: number;
  /** Which ceiling set `maxPrice`. */
  priceBinding: PriceBinding;
  /**
   * True when there is monthly capacity but no feasible purchase — typically
   * no cash against a non-zero purchase-cost rate.
   */
  financingBlocked: boolean;

  /** `downPayment − cashReserve`, floored at 0. Counted once. */
  usableCash: number;
  /** Purchase costs in đồng at `maxPrice`. */
  purchaseCosts: number;
  /** Cash that reaches the price: `maxPrice − maxLoan`. Never negative. */
  cashToPrice: number;
  /** The price to shop at, with purchase costs already funded from cash. */
  maxPrice: number;
  /** `cashToPrice` as a share of `maxPrice`, in percent. Null at price 0. */
  downPaymentPercent: number | null;
  /**
   * True when housing costs alone eat the whole monthly budget, so no loan is
   * supportable. `paymentSupportedLoan` is 0 and the page must say why.
   */
  noRoom: boolean;
};

/**
 * Work out what a buyer can afford.
 *
 * Null when the inputs cannot describe a purchase: a non-positive income or
 * term, a negative rate or amount, a ratio outside 0–100, a non-integer
 * number of months, a purchase-cost percent at or above 100, an assumed LTV
 * outside 0–100, a missing net income in household mode, or any non-finite
 * number.
 *
 * Never null merely because the answer is "nothing": a borrower whose debts
 * exceed the ratio gets `noRoom`, a household whose costs exceed its income
 * gets `infeasible`, and a buyer with no cash for the purchase costs gets
 * `financingBlocked`. All three are real answers, not errors.
 */
export function computeAffordability(
  input: AffordabilityInput,
): AffordabilityResult | null {
  const {
    mode = "ceiling",
    monthlyIncome,
    monthlyNetIncome,
    essentialExpenses,
    monthlyBuffer = 0,
    monthlyDebts = 0,
    downPayment = 0,
    cashReserve = 0,
    purchaseCostPercent = 0,
    assumedMaxLtvPercent = 100,
    annualRatePercent,
    termMonths,
    monthlyHousingCosts = 0,
    housingRatioPercent = 40,
    totalDebtRatioPercent = 50,
  } = input;

  const numbers = [
    monthlyIncome,
    monthlyBuffer,
    monthlyDebts,
    downPayment,
    cashReserve,
    purchaseCostPercent,
    assumedMaxLtvPercent,
    annualRatePercent,
    termMonths,
    monthlyHousingCosts,
    housingRatioPercent,
    totalDebtRatioPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  // Only validated when supplied: `undefined` is a meaningful state here.
  if (essentialExpenses !== undefined) {
    if (!Number.isFinite(essentialExpenses) || essentialExpenses < 0) return null;
  }
  if (monthlyIncome <= 0 || termMonths <= 0) return null;
  if (!Number.isInteger(termMonths)) return null;
  if (housingRatioPercent > 100 || totalDebtRatioPercent > 100) return null;
  // At or above 100% of the price there is no price that funds its own costs.
  if (purchaseCostPercent >= 100) return null;
  if (assumedMaxLtvPercent > 100) return null;

  const housingLimit = monthlyIncome * (housingRatioPercent / 100);
  // What is LEFT for housing once existing debt service is taken out, which is
  // why it can come out negative.
  const totalDebtLimit =
    monthlyIncome * (totalDebtRatioPercent / 100) - monthlyDebts;

  const ratioBinding: AffordabilityBinding =
    totalDebtLimit < housingLimit ? "totalDebt" : "housing";
  const assumedRatioCeiling = Math.max(0, Math.min(housingLimit, totalDebtLimit));

  // --- the household side, in household mode only --------------------------
  const expensesKnown = essentialExpenses !== undefined;
  let householdResidual: number | null = null;
  if (mode === "household") {
    if (monthlyNetIncome === undefined) return null;
    if (!Number.isFinite(monthlyNetIncome) || monthlyNetIncome <= 0) return null;
    // Each term is subtracted exactly once. Housing costs are NOT among them:
    // they come out of the housing budget below.
    householdResidual =
      monthlyNetIncome - (essentialExpenses ?? 0) - monthlyDebts - monthlyBuffer;
  }

  const infeasible = householdResidual !== null && householdResidual <= 0;

  let bindingLimit: AffordabilityBinding = ratioBinding;
  let affordableHousingPayment = assumedRatioCeiling;
  if (householdResidual !== null) {
    if (householdResidual < assumedRatioCeiling) bindingLimit = "household";
    affordableHousingPayment = Math.max(
      0,
      Math.min(assumedRatioCeiling, householdResidual),
    );
  }

  // Other housing costs come out before the instalment is inverted: they are
  // paid every month too.
  const affordablePrincipalInterest = Math.max(
    0,
    affordableHousingPayment - monthlyHousingCosts,
  );

  // pv() follows the outflow-negative convention, so the affordable payment
  // goes in negative and the loan comes back positive.
  const monthlyRate = annualRatePercent / 100 / 12;
  const paymentSupportedLoan =
    affordablePrincipalInterest > 0
      ? pv(monthlyRate, termMonths, -affordablePrincipalInterest)
      : 0;
  if (!Number.isFinite(paymentSupportedLoan)) return null;

  // --- the financing envelope ---------------------------------------------
  // The reserve is taken out here and nowhere else.
  const usableCash = Math.max(0, downPayment - cashReserve);
  const costRate = purchaseCostPercent / 100;
  const ltv = assumedMaxLtvPercent / 100;

  const capacityBound = (paymentSupportedLoan + usableCash) / (1 + costRate);
  // `slack` is 0 only when the buyer assumes 100% financing AND models no
  // purchase costs; then the financing bound cannot bind at all.
  const slack = 1 + costRate - ltv;
  const financingBound = slack > 0 ? usableCash / slack : Infinity;

  const maxPrice = Math.min(capacityBound, financingBound);
  if (!Number.isFinite(maxPrice)) return null;

  const priceBinding: PriceBinding =
    financingBound < capacityBound ? "financing" : "payment";
  // Non-negative by construction — see the module docstring. `Math.max` is
  // belt-and-braces against a float residue at the boundary, not a clamp
  // standing in for the constraint.
  const maxLoan = Math.max(0, maxPrice * (1 + costRate) - usableCash);
  const purchaseCosts = maxPrice * costRate;
  const cashToPrice = Math.max(0, maxPrice - maxLoan);

  // The instalment on the loan ACTUALLY used, which is not the budget whenever
  // the cash bound the price. `pmt` follows the outflow-negative convention,
  // so the sign is flipped once, here — see docs §4.
  const expectedPrincipalInterest =
    maxLoan > 0 ? Math.abs(pmt(monthlyRate, termMonths, maxLoan)) : 0;
  if (!Number.isFinite(expectedPrincipalInterest)) return null;

  return {
    mode,
    housingLimit,
    totalDebtLimit,
    assumedRatioCeiling,
    householdResidual,
    infeasible,
    conclusionLimited: mode === "household" && !expensesKnown,
    affordableHousingPayment,
    bindingLimit,
    affordablePrincipalInterest,
    expectedPrincipalInterest,
    paymentSupportedLoan,
    assumedMaxLtvPercent,
    maxLoan,
    priceBinding,
    financingBlocked: maxPrice <= 0 && paymentSupportedLoan > 0,
    usableCash,
    purchaseCosts,
    cashToPrice,
    maxPrice,
    downPaymentPercent: maxPrice > 0 ? (cashToPrice / maxPrice) * 100 : null,
    noRoom: affordablePrincipalInterest <= 0,
  };
}
