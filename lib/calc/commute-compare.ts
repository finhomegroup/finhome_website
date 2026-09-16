/**
 * Two candidate homes, one commute each, for /cong-cu/chi-phi-nhien-lieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `commute-compare.test.ts`.
 *
 * ORIGINAL ROW 68 IS A HOUSING QUESTION: "ở xa hơn tốn thêm chi phí đi lại bao
 * nhiêu", whose lesson is "nhà rẻ hơn có thể kèm chi phí đi lại cao hơn". That
 * needs TWO commutes priced on ONE basis, which is all this module adds.
 *
 * IT RUNS NO FUEL ARITHMETIC OF ITS OWN. Each leg goes through
 * `computeFuelCost`, so there is exactly one place that converts km/L to
 * L/100 km and one place that doubles a round trip. Re-deriving either here
 * would be a second engine to keep in step — and the doubling in particular
 * is a trap: the distance is doubled ONCE, by that function, and the workday
 * count stays the number of round trips. Doubling the trips as well would
 * price four one-way journeys a day.
 *
 * ONE BASIS FOR BOTH SIDES. The same vehicle consumption, the same fuel
 * price, the same number of workdays and the same number of people apply to
 * both legs, because the question is what the LOCATION costs. A comparison
 * where one side assumed a different price would not answer it.
 *
 * HOUSEHOLD AND PER-PERSON ARE BOTH REPORTED, AND NEVER MIXED. Comparing one
 * side's per-person cost against the other's household total is the error the
 * naming exists to prevent: `monthlyCost` is always the whole vehicle's fuel
 * and `monthlyCostPerPerson` is always that divided by the people sharing it.
 * The difference is reported on both bases.
 *
 * UNKNOWN WORKDAYS ARE NOT ZERO WORKDAYS. `workdaysPerMonth` of `undefined`
 * withholds every monthly figure; an explicit `0` is a real answer — no
 * commuting that month, so no fuel cost — and returns zeros. A blank field
 * defaulting to 0 would announce that living 25 km away is free.
 *
 * THE RESULT ECHOES THE BASIS IT WAS PRICED ON. `roundTrip`, `pricePerLitre`,
 * `workdaysPerMonth`, `people` and `litresPer100km` all come back out, because
 * the SAME two distances cost twice as much under a round trip as under a
 * one-way reading and the input labels say "một chiều" in both states. A
 * consumer that reports 308.000 ₫ against 616.000 ₫ without naming which
 * direction was selected is reporting two different answers under one label —
 * an independent review reproduced exactly that. Nothing here is computed for
 * the echo; these are the inputs the figures were already built from.
 *
 * WHAT THIS IS NOT. Fuel is not the cost of commuting: tolls, parking, fares,
 * servicing, tyres, depreciation and TIME are all outside it, and so is any
 * question about the vehicle being available at all. Nothing here reads a
 * location: both distances are typed in by the reader.
 */

import { computeFuelCost, type ConsumptionUnit } from "@/lib/calc/fuel";

/** One candidate home, identified by the caller. */
export type CommuteLeg = {
  /** Stable key the page maps to a name. Not shown to the reader. */
  key: string;
  /** ONE-WAY distance to work, in km. */
  oneWayKm: number;
};

export type CommuteCompareInput = {
  /** Exactly two candidates: this is a comparison, not a list. */
  legs: readonly [CommuteLeg, CommuteLeg];
  /** True when each workday is out and back. Doubles the distance ONCE. */
  roundTrip: boolean;
  /**
   * Commuting days per month.
   *
   * `undefined` means NOT SUPPLIED and withholds the monthly figures; `0` is
   * a statement and yields zero cost. See the module docstring.
   */
  workdaysPerMonth?: number;
  /** Consumption in the unit named by `consumptionUnit`. Same for both legs. */
  consumption: number;
  consumptionUnit: ConsumptionUnit;
  /** Fuel price per litre, in đồng. The reader's own figure. */
  pricePerLitre: number;
  /** People sharing the vehicle. At least 1. */
  people?: number;
};

/** What one candidate costs per month. */
export type CommuteLegResult = {
  key: string;
  oneWayKm: number;
  /** Distance actually driven per commuting day, after any doubling. */
  dailyKm: number;
  /** Km driven commuting in a month. */
  monthlyKm: number;
  /** Litres burned in a month. */
  monthlyLitres: number;
  /** The whole vehicle's fuel cost for the month. */
  monthlyCost: number;
  /** `monthlyCost` divided by the people sharing it. */
  monthlyCostPerPerson: number;
};

export type CommuteCompareResult = {
  /** In the order given, never sorted: the reader named them. */
  legs: [CommuteLegResult, CommuteLegResult];
  /** Consumption normalised to L/100 km, echoed so a unit slip is visible. */
  litresPer100km: number;
  workdaysPerMonth: number;
  people: number;
  /**
   * Whether each workday was priced as out AND back.
   *
   * Echoed, not derived: the two distances are labelled "một chiều" in both
   * states and the monthly cost doubles between them, so every consumer has to
   * be able to name the basis beside the figure.
   */
  roundTrip: boolean;
  /** The price per litre both legs were priced at. Echoed for the same reason. */
  pricePerLitre: number;
  /**
   * The costlier leg's key, or null when the two cost the same.
   *
   * Null is a third state on purpose: two homes the same distance away cost
   * the same, and naming one of them "more expensive" would be false.
   */
  costlierKey: string | null;
  /** Household difference, as a magnitude. Both legs, same basis. */
  monthlyDifference: number;
  /** The same difference per person sharing the vehicle. */
  monthlyDifferencePerPerson: number;
  /** Extra km a month the costlier leg drives. */
  monthlyKmDifference: number;
};

/**
 * Price two candidate commutes on one basis.
 *
 * Null when the inputs cannot describe a commute: a non-positive distance on
 * either side, a non-positive consumption figure, a negative price, fewer
 * than one person, a non-integer number of people, a negative or non-integer
 * workday count, or any non-finite number — including a non-finite figure
 * DERIVED from finite inputs, which is checked before anything is returned so
 * a chart can never receive NaN.
 *
 * Null is also returned when `workdaysPerMonth` was not supplied: every
 * monthly figure on this result depends on it, so there is nothing partial
 * worth returning. The caller distinguishes that state from an invalid one.
 */
export function compareCommutes(
  input: CommuteCompareInput,
): CommuteCompareResult | null {
  const {
    legs,
    roundTrip,
    workdaysPerMonth,
    consumption,
    consumptionUnit,
    pricePerLitre,
    people = 1,
  } = input;

  if (workdaysPerMonth === undefined) return null;
  if (!Number.isFinite(workdaysPerMonth) || workdaysPerMonth < 0) return null;
  // A commuting day is a whole day. 21,5 days is a reasonable average to type
  // but not a number of trips, and `computeFuelCost` would happily scale it.
  if (!Number.isInteger(workdaysPerMonth)) return null;

  const priced = legs.map((leg) =>
    // ONE fuel engine, once per leg. `tripsPerMonth` is the number of ROUND
    // trips; the doubling happens inside, exactly once.
    computeFuelCost({
      distanceKm: leg.oneWayKm,
      consumption,
      consumptionUnit,
      pricePerLitre,
      people,
      tripsPerMonth: workdaysPerMonth,
      roundTrip,
    }),
  );

  if (priced.some((result) => result === null)) return null;
  const [first, second] = priced as [
    NonNullable<(typeof priced)[number]>,
    NonNullable<(typeof priced)[number]>,
  ];

  const toLeg = (
    leg: CommuteLeg,
    result: typeof first,
  ): CommuteLegResult => ({
    key: leg.key,
    oneWayKm: leg.oneWayKm,
    dailyKm: result.tripDistanceKm,
    monthlyKm: result.tripDistanceKm * workdaysPerMonth,
    monthlyLitres: result.monthlyLitres,
    monthlyCost: result.monthlyCost,
    monthlyCostPerPerson: result.monthlyCostPerPerson,
  });

  const a = toLeg(legs[0], first);
  const b = toLeg(legs[1], second);

  const difference = Math.abs(a.monthlyCost - b.monthlyCost);
  const result: CommuteCompareResult = {
    legs: [a, b],
    litresPer100km: first.litresPer100km,
    workdaysPerMonth,
    people,
    roundTrip,
    pricePerLitre,
    costlierKey:
      a.monthlyCost === b.monthlyCost
        ? null
        : a.monthlyCost > b.monthlyCost
          ? a.key
          : b.key,
    monthlyDifference: difference,
    // Divided by the same `people` as each leg, so the per-person difference
    // is the difference OF the per-person costs and not a second convention.
    monthlyDifferencePerPerson: difference / people,
    monthlyKmDifference: Math.abs(a.monthlyKm - b.monthlyKm),
  };

  // FINITE INPUTS DO NOT PROVE FINITE OUTPUTS, and this result feeds an SVG.
  // Every number is checked here rather than in the chart, so no consumer can
  // forget. `computeFuelCost` validates its own inputs only.
  const figures = [
    result.litresPer100km,
    result.monthlyDifference,
    result.monthlyDifferencePerPerson,
    result.monthlyKmDifference,
    ...result.legs.flatMap((leg) => [
      leg.dailyKm,
      leg.monthlyKm,
      leg.monthlyLitres,
      leg.monthlyCost,
      leg.monthlyCostPerPerson,
    ]),
  ];
  if (figures.some((figure) => !Number.isFinite(figure))) return null;

  return result;
}
