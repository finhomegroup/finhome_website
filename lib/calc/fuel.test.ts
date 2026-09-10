import { describe, it, expect } from "vitest";
import { computeFuelCost, type FuelInput } from "@/lib/calc/fuel";

// Hà Nội to Hải Phòng: about 120 km, a 7 L/100 km car, petrol at 21.000 ₫/L.
const BASE: FuelInput = {
  distanceKm: 120,
  consumption: 7,
  consumptionUnit: "litresPer100km",
  pricePerLitre: 21_000,
};

function fuel(input: FuelInput) {
  const result = computeFuelCost(input);
  expect(result).not.toBeNull();
  return result!;
}

describe("computeFuelCost — one trip", () => {
  it("burns the litres the rating implies", () => {
    // 120 km at 7 L/100 km is 8,4 L; at 21.000 ₫ that is 176.400 ₫.
    const result = fuel(BASE);
    expect(result.litres).toBeCloseTo(8.4, 10);
    expect(result.tripCost).toBeCloseTo(176_400, 6);
    expect(result.tripDistanceKm).toBe(120);
  });

  it("costs the same per kilometre whatever the distance", () => {
    const short = fuel({ ...BASE, distanceKm: 30 });
    const long = fuel({ ...BASE, distanceKm: 300 });
    expect(short.costPerKm).toBeCloseTo(long.costPerKm, 8);
    expect(short.costPerKm).toBeCloseTo(1470, 6);
  });

  it("doubles the distance on a round trip", () => {
    const oneWay = fuel(BASE);
    const both = fuel({ ...BASE, roundTrip: true });
    expect(both.tripDistanceKm).toBe(240);
    expect(both.litres).toBeCloseTo(oneWay.litres * 2, 10);
    expect(both.tripCost).toBeCloseTo(oneWay.tripCost * 2, 6);
    // Per kilometre is unchanged — it is a property of the vehicle.
    expect(both.costPerKm).toBeCloseTo(oneWay.costPerKm, 8);
  });

  it("is free when the fuel is", () => {
    const result = fuel({ ...BASE, pricePerLitre: 0 });
    expect(result.tripCost).toBe(0);
    expect(result.litres).toBeCloseTo(8.4, 10);
  });
});

describe("computeFuelCost — the two consumption units", () => {
  it("converts km/L to L/100 km", () => {
    // A motorbike doing 50 km/L burns 2 L/100 km.
    const result = fuel({
      ...BASE,
      consumption: 50,
      consumptionUnit: "kmPerLitre",
    });
    expect(result.litresPer100km).toBeCloseTo(2, 10);
    expect(result.litres).toBeCloseTo(2.4, 10);
    expect(result.tripCost).toBeCloseTo(50_400, 6);
  });

  it("agrees with itself across the two units", () => {
    // The reason the conversion happens once, at the boundary.
    const asRate = fuel(BASE);
    const asDistance = fuel({
      ...BASE,
      consumption: 100 / 7,
      consumptionUnit: "kmPerLitre",
    });
    expect(asDistance.litresPer100km).toBeCloseTo(asRate.litresPer100km, 8);
    expect(asDistance.tripCost).toBeCloseTo(asRate.tripCost, 4);
  });

  it("reads a thirstier vehicle as more expensive in both units", () => {
    const thirsty = fuel({ ...BASE, consumption: 12 });
    expect(thirsty.tripCost).toBeGreaterThan(fuel(BASE).tripCost);
    const efficient = fuel({
      ...BASE,
      consumption: 25,
      consumptionUnit: "kmPerLitre",
    });
    const guzzler = fuel({
      ...BASE,
      consumption: 8,
      consumptionUnit: "kmPerLitre",
    });
    expect(guzzler.tripCost).toBeGreaterThan(efficient.tripCost);
  });
});

describe("computeFuelCost — sharing and the monthly view", () => {
  it("splits the trip between passengers", () => {
    const result = fuel({ ...BASE, people: 4 });
    expect(result.costPerPerson).toBeCloseTo(44_100, 6);
    expect(result.tripCost).toBeCloseTo(176_400, 6);
  });

  it("charges one person the whole trip by default", () => {
    expect(fuel(BASE).costPerPerson).toBeCloseTo(fuel(BASE).tripCost, 6);
  });

  it("scales to a month of commuting", () => {
    // 22 working days, out and back, alone.
    const result = fuel({
      ...BASE,
      distanceKm: 12,
      roundTrip: true,
      tripsPerMonth: 22,
    });
    expect(result.tripDistanceKm).toBe(24);
    expect(result.monthlyLitres).toBeCloseTo(24 * 0.07 * 22, 8);
    expect(result.monthlyCost).toBeCloseTo(result.tripCost * 22, 6);
  });

  it("splits the monthly figure too", () => {
    const result = fuel({ ...BASE, tripsPerMonth: 22, people: 2 });
    expect(result.monthlyCostPerPerson).toBeCloseTo(result.monthlyCost / 2, 6);
  });

  it("reports zero for the month when no trip count is given", () => {
    const result = fuel(BASE);
    expect(result.monthlyCost).toBe(0);
    expect(result.monthlyLitres).toBe(0);
    expect(result.monthlyCostPerPerson).toBe(0);
  });
});

describe("computeFuelCost — rejected inputs", () => {
  it("returns null rather than a guess", () => {
    expect(computeFuelCost({ ...BASE, distanceKm: 0 })).toBeNull();
    expect(computeFuelCost({ ...BASE, distanceKm: -1 })).toBeNull();
    expect(computeFuelCost({ ...BASE, pricePerLitre: -1 })).toBeNull();
    expect(computeFuelCost({ ...BASE, tripsPerMonth: -1 })).toBeNull();
    expect(computeFuelCost({ ...BASE, distanceKm: Number.NaN })).toBeNull();
  });

  it("rejects a zero consumption figure in either unit", () => {
    // In km/L a zero would divide by zero on conversion; in L/100 km it
    // describes a vehicle that needs no fuel and no calculator.
    expect(computeFuelCost({ ...BASE, consumption: 0 })).toBeNull();
    expect(
      computeFuelCost({
        ...BASE,
        consumption: 0,
        consumptionUnit: "kmPerLitre",
      }),
    ).toBeNull();
    expect(computeFuelCost({ ...BASE, consumption: -1 })).toBeNull();
  });

  it("rejects a head count that is not a whole number of people", () => {
    expect(computeFuelCost({ ...BASE, people: 0 })).toBeNull();
    expect(computeFuelCost({ ...BASE, people: 1.5 })).toBeNull();
  });
});
