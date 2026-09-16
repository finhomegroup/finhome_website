/**
 * Trip fuel cost for /cong-cu/chi-phi-nhien-lieu/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `fuel.test.ts`.
 *
 * Consumption can be given either way round, because both are in use in
 * Vietnam: cars are rated in litres per 100 km, motorbikes are talked about in
 * kilometres per litre. They are reciprocals, and the module converts once at
 * the boundary so everything downstream works in litres per 100 km. Letting
 * the two units meet anywhere else is how a 2 L/100 km car appears.
 *
 * The price is an INPUT with no default baked into the math, and nothing here
 * fetches a rate: the site is a static export, and a stale petrol price would
 * be worse than an empty box.
 *
 * This docstring used to assert that Vietnamese fuel prices are set by a joint
 * MOIT/MOF announcement on a ten-day cycle. Nobody here has verified that
 * schedule against a current instrument, the P3 scope audit flagged it as a
 * stale unsupported claim, and it made no difference to the arithmetic — the
 * reader supplies the price either way. Removed rather than re-sourced.
 */

export type ConsumptionUnit =
  /** Litres per 100 km — how cars are rated. */
  | "litresPer100km"
  /** Kilometres per litre — how motorbikes are usually discussed. */
  | "kmPerLitre";

export type FuelInput = {
  /** One-way distance in km. */
  distanceKm: number;
  /** Consumption figure, in the unit named by `consumptionUnit`. */
  consumption: number;
  consumptionUnit: ConsumptionUnit;
  /** Fuel price per litre, in đồng. */
  pricePerLitre: number;
  /** People sharing the cost. */
  people?: number;
  /** How many of these trips per month, for the monthly figure. */
  tripsPerMonth?: number;
  /** True when each trip is out and back — doubles the distance. */
  roundTrip?: boolean;
};

export type FuelResult = {
  /** Distance actually driven per trip, after any round-trip doubling. */
  tripDistanceKm: number;
  /** Consumption normalised to litres per 100 km. */
  litresPer100km: number;
  /** Litres burned on one trip. */
  litres: number;
  /** Cost of one trip. */
  tripCost: number;
  /** One trip, split. */
  costPerPerson: number;
  /** Cost of driving one kilometre. */
  costPerKm: number;
  /** `tripCost × tripsPerMonth`. */
  monthlyCost: number;
  /** The monthly figure, split. */
  monthlyCostPerPerson: number;
  /** Litres burned in a month. */
  monthlyLitres: number;
};

/**
 * Cost a trip.
 *
 * Null when the inputs cannot describe one: a non-positive distance, a
 * non-positive consumption figure (either unit — a vehicle that burns nothing
 * needs no calculator, and a zero would divide by zero on conversion), a
 * negative price, fewer than one person, a non-integer number of people, a
 * negative trip count, or any non-finite number.
 */
export function computeFuelCost(input: FuelInput): FuelResult | null {
  const {
    distanceKm,
    consumption,
    consumptionUnit,
    pricePerLitre,
    people = 1,
    tripsPerMonth = 0,
    roundTrip = false,
  } = input;

  const numbers = [
    distanceKm,
    consumption,
    pricePerLitre,
    people,
    tripsPerMonth,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (distanceKm <= 0 || consumption <= 0) return null;
  if (people < 1 || !Number.isInteger(people)) return null;

  // Normalise to litres per 100 km once, here.
  const litresPer100km =
    consumptionUnit === "litresPer100km" ? consumption : 100 / consumption;

  const tripDistanceKm = roundTrip ? distanceKm * 2 : distanceKm;
  const litres = (tripDistanceKm / 100) * litresPer100km;
  const tripCost = litres * pricePerLitre;
  const monthlyCost = tripCost * tripsPerMonth;

  return {
    tripDistanceKm,
    litresPer100km,
    litres,
    tripCost,
    costPerPerson: tripCost / people,
    costPerKm: tripCost / tripDistanceKm,
    monthlyCost,
    monthlyCostPerPerson: monthlyCost / people,
    monthlyLitres: litres * tripsPerMonth,
  };
}
