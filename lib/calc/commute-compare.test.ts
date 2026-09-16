// Original row 68's two-commute comparison. The fixture is the independent
// one from the P3 handoff: 8 km vs 25 km one way, round trip, 22 workdays,
// 7 L/100 km, an assumed 25.000 ₫/L.
//
// Hand-computed reference, so the assertions do not check the module against
// itself:
//   8 km one way  → 16 km/day × 22 = 352 km → 352/100 × 7 = 24,64 L
//                 → 24,64 × 25.000 = 616.000 ₫
//   25 km one way → 50 km/day × 22 = 1.100 km → 77 L → 1.925.000 ₫
//   difference 1.309.000 ₫; split between two people, 308.000 vs 962.500 and
//   a per-person difference of 654.500 ₫.
import { describe, expect, it } from "vitest";
import { compareCommutes, type CommuteCompareInput } from "./commute-compare";

const BASE: CommuteCompareInput = {
  legs: [
    { key: "near", oneWayKm: 8 },
    { key: "far", oneWayKm: 25 },
  ],
  roundTrip: true,
  workdaysPerMonth: 22,
  consumption: 7,
  consumptionUnit: "litresPer100km",
  pricePerLitre: 25_000,
};

describe("compareCommutes on the handoff fixture", () => {
  const result = compareCommutes(BASE)!;

  it("doubles the distance once for a round trip, not twice", () => {
    // The trap: doubling the distance AND the trips would price four one-way
    // journeys a day. 8 km one way is 16 km a day and 352 km a month.
    expect(result.legs[0].dailyKm).toBe(16);
    expect(result.legs[0].monthlyKm).toBe(352);
    expect(result.legs[1].dailyKm).toBe(50);
    expect(result.legs[1].monthlyKm).toBe(1_100);
  });

  it("burns the hand-computed litres each month", () => {
    expect(result.legs[0].monthlyLitres).toBeCloseTo(24.64, 9);
    expect(result.legs[1].monthlyLitres).toBeCloseTo(77, 9);
  });

  it("costs the hand-computed amounts each month", () => {
    expect(result.legs[0].monthlyCost).toBeCloseTo(616_000, 6);
    expect(result.legs[1].monthlyCost).toBeCloseTo(1_925_000, 6);
  });

  it("names the costlier home and the household difference", () => {
    expect(result.costlierKey).toBe("far");
    expect(result.monthlyDifference).toBeCloseTo(1_309_000, 6);
    expect(result.monthlyKmDifference).toBe(748);
  });

  it("keeps the order the reader gave, never sorted by cost", () => {
    expect(result.legs.map((leg) => leg.key)).toEqual(["near", "far"]);
    const swapped = compareCommutes({
      ...BASE,
      legs: [BASE.legs[1], BASE.legs[0]],
    })!;
    expect(swapped.legs.map((leg) => leg.key)).toEqual(["far", "near"]);
    // Same answer either way round.
    expect(swapped.monthlyDifference).toBeCloseTo(result.monthlyDifference, 6);
    expect(swapped.costlierKey).toBe("far");
  });

  it("echoes the normalised consumption, so a unit slip is visible", () => {
    expect(result.litresPer100km).toBe(7);
  });

  // The whole basis comes back out, because the same two distances cost twice
  // as much under a round trip and the distance labels say "một chiều" in both
  // states. A consumer cannot name the basis it did not receive.
  it("echoes the basis the figures were priced on", () => {
    expect(result.roundTrip).toBe(true);
    expect(result.pricePerLitre).toBe(25_000);
    expect(result.workdaysPerMonth).toBe(22);
    expect(result.people).toBe(1);

    const oneWay = compareCommutes({ ...BASE, roundTrip: false })!;
    expect(oneWay.roundTrip).toBe(false);
    // Same inputs, half the cost — which is exactly why the flag must travel.
    expect(oneWay.legs[0].monthlyCost).toBeCloseTo(
      result.legs[0].monthlyCost / 2,
      6,
    );
  });
});

describe("compareCommutes — the household and per-person bases", () => {
  const shared = compareCommutes({ ...BASE, people: 2 })!;

  it("halves each leg's cost, on the same basis for both", () => {
    expect(shared.legs[0].monthlyCostPerPerson).toBeCloseTo(308_000, 6);
    expect(shared.legs[1].monthlyCostPerPerson).toBeCloseTo(962_500, 6);
  });

  it("reports the per-person difference as the difference OF the per-person costs", () => {
    // The error this guards: comparing one side's per-person figure against
    // the other's household total, which would give 962.500 − 616.000.
    expect(shared.monthlyDifferencePerPerson).toBeCloseTo(654_500, 6);
    expect(shared.monthlyDifferencePerPerson).toBeCloseTo(
      shared.legs[1].monthlyCostPerPerson - shared.legs[0].monthlyCostPerPerson,
      6,
    );
  });

  it("leaves the household figures untouched by the split", () => {
    expect(shared.legs[0].monthlyCost).toBeCloseTo(616_000, 6);
    expect(shared.monthlyDifference).toBeCloseTo(1_309_000, 6);
    expect(shared.people).toBe(2);
  });

  it("makes the two bases coincide for a single person", () => {
    const alone = compareCommutes(BASE)!;
    expect(alone.legs[0].monthlyCostPerPerson).toBe(alone.legs[0].monthlyCost);
    expect(alone.monthlyDifferencePerPerson).toBe(alone.monthlyDifference);
  });
});

describe("compareCommutes — both consumption units", () => {
  it("agrees with the reciprocal figure", () => {
    // 100/7 km per litre IS 7 L/100 km. The two routes must not drift.
    const reciprocal = compareCommutes({
      ...BASE,
      consumption: 100 / 7,
      consumptionUnit: "kmPerLitre",
    })!;
    expect(reciprocal.litresPer100km).toBeCloseTo(7, 9);
    expect(reciprocal.legs[0].monthlyCost).toBeCloseTo(616_000, 3);
    expect(reciprocal.legs[1].monthlyCost).toBeCloseTo(1_925_000, 3);
    expect(reciprocal.monthlyDifference).toBeCloseTo(1_309_000, 3);
  });

  it("keeps a motorbike figure usable", () => {
    // 50 km on a litre is 2 L/100 km; 352 km is 7,04 L.
    const bike = compareCommutes({
      ...BASE,
      consumption: 50,
      consumptionUnit: "kmPerLitre",
    })!;
    expect(bike.litresPer100km).toBe(2);
    expect(bike.legs[0].monthlyLitres).toBeCloseTo(7.04, 9);
  });
});

describe("compareCommutes — zero is an answer, unknown is not", () => {
  it("prices a month with no commuting days at zero", () => {
    const none = compareCommutes({ ...BASE, workdaysPerMonth: 0 })!;
    expect(none.legs[0].monthlyCost).toBe(0);
    expect(none.legs[1].monthlyCost).toBe(0);
    expect(none.monthlyDifference).toBe(0);
    // Two homes that cost the same have no costlier one, and saying "far" here
    // would be false.
    expect(none.costlierKey).toBeNull();
    // The per-DAY distance is still real: the reader did enter the distances.
    expect(none.legs[1].dailyKm).toBe(50);
  });

  it("withholds everything when the workday count was not supplied", () => {
    // A blank field defaulting to 0 would announce that living 25 km away is
    // free. Every monthly figure depends on it, so there is nothing partial.
    expect(
      compareCommutes({ ...BASE, workdaysPerMonth: undefined }),
    ).toBeNull();
  });

  it("refuses a fractional workday count", () => {
    expect(compareCommutes({ ...BASE, workdaysPerMonth: 21.5 })).toBeNull();
  });

  it("refuses a negative workday count", () => {
    expect(compareCommutes({ ...BASE, workdaysPerMonth: -1 })).toBeNull();
  });
});

describe("compareCommutes — refusals", () => {
  it("refuses a non-positive distance on either side", () => {
    for (const legs of [
      [{ key: "a", oneWayKm: 0 }, { key: "b", oneWayKm: 25 }],
      [{ key: "a", oneWayKm: 8 }, { key: "b", oneWayKm: -1 }],
    ] as const) {
      expect(compareCommutes({ ...BASE, legs })).toBeNull();
    }
  });

  it("refuses a vehicle that burns nothing, in either unit", () => {
    expect(compareCommutes({ ...BASE, consumption: 0 })).toBeNull();
    expect(
      compareCommutes({
        ...BASE,
        consumption: 0,
        consumptionUnit: "kmPerLitre",
      }),
    ).toBeNull();
  });

  it("refuses a negative price and a fractional headcount", () => {
    expect(compareCommutes({ ...BASE, pricePerLitre: -1 })).toBeNull();
    expect(compareCommutes({ ...BASE, people: 0 })).toBeNull();
    expect(compareCommutes({ ...BASE, people: 1.5 })).toBeNull();
  });

  it("allows a price of zero, which is a real if unusual entry", () => {
    const free = compareCommutes({ ...BASE, pricePerLitre: 0 })!;
    expect(free.legs[1].monthlyCost).toBe(0);
    expect(free.monthlyDifference).toBe(0);
    // The litres are still different, and still reported.
    expect(free.legs[1].monthlyLitres).toBeCloseTo(77, 9);
  });

  it("refuses a DERIVED non-finite figure before anything can draw it", () => {
    // Finite inputs do not prove finite outputs: a price at the top of the
    // float range overflows once multiplied by the litres, and this result
    // feeds an SVG. `computeFuelCost` validates only its inputs.
    expect(
      compareCommutes({ ...BASE, pricePerLitre: Number.MAX_VALUE }),
    ).toBeNull();
  });

  it("refuses non-finite inputs outright", () => {
    expect(compareCommutes({ ...BASE, consumption: Number.NaN })).toBeNull();
    expect(
      compareCommutes({ ...BASE, pricePerLitre: Number.POSITIVE_INFINITY }),
    ).toBeNull();
    expect(
      compareCommutes({
        ...BASE,
        legs: [
          { key: "a", oneWayKm: Number.NaN },
          { key: "b", oneWayKm: 25 },
        ],
      }),
    ).toBeNull();
  });
});

describe("compareCommutes — a one-way commute", () => {
  it("does not double the distance", () => {
    const oneWay = compareCommutes({ ...BASE, roundTrip: false })!;
    expect(oneWay.legs[0].dailyKm).toBe(8);
    expect(oneWay.legs[0].monthlyCost).toBeCloseTo(308_000, 6);
    // Exactly half the round-trip figures, which is the only sane relation.
    expect(oneWay.monthlyDifference).toBeCloseTo(1_309_000 / 2, 6);
  });
});
