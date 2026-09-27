/**
 * The semantic state of /cong-cu/vay-mua-xe/'s household answer.
 *
 * Pure module: no React, no I/O, no DOM, no Vietnamese. Unit-tested in
 * `vehicle-budget-status.test.ts`. Reads `compareVehicleBudget` and nothing
 * else; every figure it returns is one that module already computed.
 *
 * THE ORDER IS THE POLICY:
 *
 * 1. No usable month, or an instalment that could not be priced → `unknown`.
 *    The without-car month is still on the page; it is simply not a verdict
 *    about the car.
 * 2. Essentials unknown → `unknown`, BEFORE any verdict — even when the
 *    partial figures alone already go negative. Living costs are ESSENTIAL
 *    data, and the approved plan says a missing essential withholds the
 *    conclusion; the "an omission can only make it worse" argument is
 *    authorised for OPTIONAL costs only (running costs, rule 4).
 * 3. Already short BEFORE the car → `shortfall`, as its own kind, so the page
 *    does not blame the whole gap on the vehicle.
 * 4. Short WITH the car → `shortfall`. This stays red with running costs at
 *    0, because that optional omission can only make the month WORSE: a
 *    proven deficit is not softened to amber.
 * 5. A remainder of zero, to the half đồng → `caution` ("vừa khớp").
 * 6. Running costs excluded → `caution`: the remainder is overstated by
 *    exactly the costs nobody entered.
 * 7. Otherwise → `met`, and only in the tool's own sense: after the
 *    instalment and the entered running costs, beyond the saving already set
 *    aside. Not "được vay" and not "nên mua".
 */

import { atLedgerZero, type ResultTone } from "@/lib/calc/result-status";
import type { VehicleBudgetResult } from "@/lib/calc/vehicle-budget";

export type VehicleBudgetStatusKind =
  | "unknown"
  | "paymentUnknown"
  | "shortBefore"
  | "short"
  | "limited"
  | "exactZero"
  | "runningExcluded"
  | "surplus";

export type VehicleBudgetStatus = {
  tone: ResultTone;
  kind: VehicleBudgetStatusKind;
  /** The with-car deficit as a positive figure; null unless short. */
  shortfall: number | null;
  /** The without-car deficit as a positive figure; null unless short before. */
  shortfallBefore: number | null;
  /** The with-car remainder when it is not negative; null otherwise. */
  surplus: number | null;
  /** Carried through so a presenter can state the limitation beside a red. */
  limited: boolean;
  runningExcluded: boolean;
};

export function vehicleBudgetStatus(
  budget: VehicleBudgetResult | null,
): VehicleBudgetStatus {
  const base = {
    shortfall: null,
    shortfallBefore: null,
    surplus: null,
    limited: budget?.limited ?? false,
    runningExcluded: budget?.runningCostsExcluded ?? false,
  };
  if (budget === null) return { ...base, tone: "unknown", kind: "unknown" };
  if (budget.vehicleCostUnknown || budget.withCar === null) {
    return { ...base, tone: "unknown", kind: "paymentUnknown" };
  }
  if (budget.limited) return { ...base, tone: "unknown", kind: "limited" };

  const withCar = budget.withCar;
  const zero = atLedgerZero(withCar);
  const shortfall = !zero && withCar < 0 ? -withCar : null;

  if (budget.shortfallWithoutVehicle) {
    return {
      ...base,
      tone: "shortfall",
      kind: "shortBefore",
      shortfall,
      shortfallBefore: -budget.withoutCar,
    };
  }
  if (shortfall !== null) {
    return { ...base, tone: "shortfall", kind: "short", shortfall };
  }
  const surplus = zero ? 0 : withCar;
  if (zero) return { ...base, tone: "caution", kind: "exactZero", surplus };
  if (budget.runningCostsExcluded) {
    return { ...base, tone: "caution", kind: "runningExcluded", surplus };
  }
  return { ...base, tone: "met", kind: "surplus", surplus };
}
