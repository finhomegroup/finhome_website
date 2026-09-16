/**
 * What a car payment does to the household's month, for /cong-cu/vay-mua-xe/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `vehicle-budget.ts`'s
 * own test file.
 *
 * ORIGINAL ROW 31 IS NOT A VEHICLE-FINANCE QUESTION. It is "mua xe ảnh hưởng
 * tiền mua nhà ra sao" — the instalment competes with the home budget because
 * both are served by one income. `computeAutoLoan` already prices the loan;
 * what was missing was the allocation of the month's money with and without
 * it, and that is all this module adds. It runs NO loan arithmetic: the
 * instalment is passed in.
 *
 * THE INSTALMENT IS SUBTRACTED EXACTLY ONCE, in the with-car leg only.
 * `otherDebts` is every OTHER monthly obligation the household already has,
 * and the field that collects it says so — a reader who types the same car
 * payment into both places would see a difference of twice the instalment and
 * a shortfall that is not theirs. The reported `difference` is the vehicle's
 * own monthly cost rather than the subtraction of the two legs; see its note.
 *
 * AN UNKNOWN INSTALMENT IS NOT A FREE CAR. `vehiclePayment` is `number | null`,
 * and that distinction is a SHIPPED DEFECT this type exists to prevent. The
 * page used to pass `result?.loan.monthlyPrincipalInterest ?? 0`, so entering
 * a rate of −1 — which makes the loan unpriceable — moved the household from
 * "12 triệu before / 3,50 triệu after" to "12 triệu before / 12 triệu after"
 * and the figure announced a gap of 0 ₫. An independent review reproduced that
 * on the live page: an invalid field silently became a cash purchase.
 *
 * So `null` means UNKNOWN and withholds every with-car figure
 * (`withCar`, `difference`, `shortfall*` all come back null/false, and
 * `vehicleCostUnknown` is set); `0` means KNOWN AND ZERO, which is a real
 * answer — a buyer paying cash, whose two legs genuinely coincide. The caller
 * owns that classification because only it can tell the two `null`s of
 * `computeAutoLoan` apart: nothing left to finance, versus a field it refused.
 *
 * UNKNOWN ESSENTIAL COSTS STAY UNKNOWN, the same contract
 * `computeAffordability` keeps: `essentialExpenses` of `undefined` is "not
 * supplied", not zero, and it sets `limited`. A household that has not said
 * what it spends has not been told what it can afford; defaulting the blank to
 * zero would turn net income into a budget.
 *
 * WHAT THIS DELIBERATELY DOES NOT ANSWER. It is a MONTHLY cash allocation. The
 * deposit and the trade-in leave the household's assets rather than its month,
 * so they do not appear here at all — and that is precisely why the page has
 * to say that cash spent on a car is cash no longer available for a home
 * deposit. Running costs (fuel, insurance, servicing, parking) are not modelled
 * either unless the reader puts them in `vehicleRunningCosts`. Nothing here is
 * a lending decision, an approval, or a complete home-affordability answer.
 */

export type VehicleBudgetInput = {
  /** NET household income per month: what actually arrives, in đồng. */
  netIncome: number;
  /**
   * Essential living costs per month.
   *
   * `undefined` means NOT SUPPLIED and sets `limited`. An explicit `0` is a
   * statement — somebody else covers them — and is a different thing.
   *
   * Must exclude debt service and the vehicle's own costs, or they would be
   * subtracted twice.
   */
  essentialExpenses?: number;
  /**
   * Existing monthly debt service, EXCLUDING the vehicle loan being priced:
   * a mortgage, a card minimum, another car already being paid for.
   */
  otherDebts?: number;
  /** What the household intends to keep saving each month regardless. */
  reserveSaving?: number;
  /**
   * The vehicle instalment, from `computeAutoLoan`.
   *
   * `0` is a STATEMENT — the vehicle is being bought outright, so there is no
   * instalment and the two legs coincide. `null` is the ABSENCE of an answer:
   * the loan could not be priced, and every with-car figure is withheld. See
   * the module docstring for the defect that distinction exists to prevent.
   */
  vehiclePayment: number | null;
  /**
   * Running costs of the vehicle per month — fuel, insurance, servicing,
   * parking — when the reader has entered them. Zero, and disclosed as zero,
   * otherwise: this module will not invent them.
   */
  vehicleRunningCosts?: number;
};

export type VehicleBudgetResult = {
  netIncome: number;
  /** Echoed back so a caller charts the same figures it computed from. */
  essentialExpenses: number | null;
  otherDebts: number;
  reserveSaving: number;
  /** Echoed back. Null when the loan could not be priced. */
  vehiclePayment: number | null;
  vehicleRunningCosts: number;
  /** Everything that leaves the month before the vehicle. Each term once. */
  committedWithoutVehicle: number;
  /**
   * The vehicle's own monthly cost: instalment plus any running costs.
   *
   * Null when the instalment is unknown. Running costs alone are NOT reported
   * as the vehicle's cost in that state: a figure that names only the part it
   * happens to know understates the total and reads as if it were complete.
   */
  vehicleMonthlyCost: number | null;
  /**
   * Left each month with no vehicle at all. May be negative.
   *
   * Always available: it does not depend on the instalment, so an unpriceable
   * loan must not blank the one figure the reader can still act on.
   */
  withoutCar: number;
  /**
   * Left each month once the vehicle is paid for. May be negative.
   *
   * NEVER CLAMPED AT ZERO. A negative residual is the answer — the month does
   * not balance — and flooring it turns "you are 6,5 triệu short every month"
   * into "you have nothing spare", which reads like a tight budget rather than
   * an impossible one. Null when the instalment is unknown.
   */
  withCar: number | null;
  /**
   * The gap between the two legs, which IS the vehicle's own monthly cost.
   *
   * Returned as `vehicleMonthlyCost` itself, NOT as `withoutCar − withCar`.
   * The subtraction re-derives a figure the module already has and does not
   * land on it bit-exactly: at 34 triệu of residual and an 8.498.817,88 ₫
   * instalment the difference came back 4e-9 ₫ out. Nothing financial, but it
   * would let the page's "chênh lệch" row disagree with its own instalment
   * row in the exact-đồng reading, which is the class of defect this suite
   * keeps finding. A test pins that they are the same number.
   *
   * Null when the instalment is unknown — "could not compare" is not a zero
   * difference.
   */
  difference: number | null;
  /**
   * True when the month does not balance once the vehicle is in it.
   *
   * FALSE while the instalment is unknown, which is not the same as "no
   * shortfall" and is why `vehicleCostUnknown` exists beside it. A caller must
   * check that flag before describing the with-car month at all.
   */
  shortfall: boolean;
  /** How far short, as a positive figure. Null with no shortfall or no answer. */
  shortfallAmount: number | null;
  /** True when the month did not balance even BEFORE the vehicle. */
  shortfallWithoutVehicle: boolean;
  /**
   * True when no instalment was supplied, so no with-car figure exists.
   *
   * A caller must withhold the with-car result and the comparison figure while
   * this is set, and offer a specific recovery — not print a zero.
   */
  vehicleCostUnknown: boolean;
  /**
   * True when essential costs were not supplied. A caller must not describe
   * either figure as a budget while this is set.
   */
  limited: boolean;
  /** True when running costs are zero because none were entered. */
  runningCostsExcluded: boolean;
};

/**
 * Allocate the household's month with and without the vehicle.
 *
 * Null when the inputs cannot describe a month: a non-positive net income, a
 * negative outgoing, or any non-finite number. A NEGATIVE residual is not an
 * error — it is the answer, and `shortfall` names it — because clamping it to
 * zero would turn "you are 6,5 triệu short every month" into "you have nothing
 * spare", which reads like a tight budget rather than an impossible one.
 *
 * An UNKNOWN instalment (`vehiclePayment: null`) is also not an error: the
 * without-car month is still a real answer, so it is returned, and everything
 * that depends on the instalment comes back null with `vehicleCostUnknown`
 * set. Returning null for the whole month would take away the one figure the
 * reader can still use.
 */
export function compareVehicleBudget(
  input: VehicleBudgetInput,
): VehicleBudgetResult | null {
  const {
    netIncome,
    essentialExpenses,
    otherDebts = 0,
    reserveSaving = 0,
    vehiclePayment,
    vehicleRunningCosts = 0,
  } = input;

  const numbers = [netIncome, otherDebts, reserveSaving, vehicleRunningCosts];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (netIncome <= 0) return null;
  // Validated only when supplied. `null` is the documented unknown state, so
  // it must reach the result rather than being rejected here.
  if (vehiclePayment !== null) {
    if (!Number.isFinite(vehiclePayment) || vehiclePayment < 0) return null;
  }
  // Only validated when supplied: `undefined` is a meaningful state here.
  if (essentialExpenses !== undefined) {
    if (!Number.isFinite(essentialExpenses) || essentialExpenses < 0) return null;
  }

  const committedWithoutVehicle =
    (essentialExpenses ?? 0) + otherDebts + reserveSaving;

  const withoutCar = netIncome - committedWithoutVehicle;
  if (!Number.isFinite(withoutCar)) return null;

  // Everything below the vehicle's cost is withheld together, so no figure can
  // survive on its own and imply an answer the module does not have.
  const vehicleMonthlyCost =
    vehiclePayment === null ? null : vehiclePayment + vehicleRunningCosts;

  // The vehicle's cost enters HERE and nowhere else, which is what makes the
  // difference between the two legs exactly its own figure.
  const withCar =
    vehicleMonthlyCost === null ? null : withoutCar - vehicleMonthlyCost;

  if (withCar !== null && !Number.isFinite(withCar)) return null;

  return {
    netIncome,
    essentialExpenses: essentialExpenses ?? null,
    otherDebts,
    reserveSaving,
    vehiclePayment,
    vehicleRunningCosts,
    committedWithoutVehicle,
    vehicleMonthlyCost,
    withoutCar,
    withCar,
    difference: vehicleMonthlyCost,
    shortfall: withCar !== null && withCar < 0,
    shortfallAmount: withCar !== null && withCar < 0 ? -withCar : null,
    shortfallWithoutVehicle: withoutCar < 0,
    limited: essentialExpenses === undefined,
    // Running costs the reader DID enter are still disclosed as excluded from
    // nothing — the flag is about the running-cost field alone, not about the
    // instalment — so it stays meaningful in the unknown state too.
    runningCostsExcluded: vehicleRunningCosts === 0,
    vehicleCostUnknown: vehiclePayment === null,
  };
}
