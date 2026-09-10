import { describe, it, expect } from "vitest";
import { convertUnit, UNITS, type UnitCategory } from "@/lib/calc/units";

const CATEGORIES = Object.keys(UNITS) as UnitCategory[];

function convert(
  category: UnitCategory,
  fromId: string,
  toId: string,
  value: number,
) {
  const result = convertUnit({ category, fromId, toId, value });
  expect(result).not.toBeNull();
  return result!;
}

describe("convertUnit — the single-factor model", () => {
  it("is the identity when both units are the same", () => {
    for (const category of CATEGORIES) {
      for (const unit of UNITS[category]) {
        const result = convert(category, unit.id, unit.id, 7);
        expect(result.converted).toBeCloseTo(7, 10);
        expect(result.factor).toBeCloseTo(1, 12);
      }
    }
  });

  it("round-trips every pair in every category", () => {
    // The property a pairwise table cannot guarantee.
    for (const category of CATEGORIES) {
      for (const from of UNITS[category]) {
        for (const to of UNITS[category]) {
          const forward = convert(category, from.id, to.id, 123.456);
          const back = convert(category, to.id, from.id, forward.converted);
          expect(back.converted).toBeCloseTo(123.456, 6);
        }
      }
    }
  });

  it("is transitive: A→B→C equals A→C", () => {
    for (const category of CATEGORIES) {
      const units = UNITS[category];
      if (units.length < 3) continue;
      const [a, b, c] = units;
      const viaB = convert(
        category,
        b.id,
        c.id,
        convert(category, a.id, b.id, 42).converted,
      ).converted;
      const direct = convert(category, a.id, c.id, 42).converted;
      expect(viaB).toBeCloseTo(direct, 6);
    }
  });

  it("scales linearly", () => {
    const one = convert("area", "ha", "m2", 1).converted;
    const ten = convert("area", "ha", "m2", 10).converted;
    expect(ten).toBeCloseTo(one * 10, 6);
    expect(convert("area", "ha", "m2", 0).converted).toBe(0);
  });

  it("handles negative values", () => {
    expect(convert("mass", "kg", "g", -2.5).converted).toBeCloseTo(-2500, 6);
  });
});

describe("convertUnit — Vietnamese land measures", () => {
  it("keeps the Northern and Central sào apart", () => {
    // Averaging these would silently produce wrong land areas.
    expect(convert("area", "saoBac", "m2", 1).converted).toBeCloseTo(360, 6);
    expect(convert("area", "saoTrung", "m2", 1).converted).toBeCloseTo(
      499.95,
      6,
    );
  });

  it("keeps the Northern and Central mẫu apart", () => {
    expect(convert("area", "mauBac", "m2", 1).converted).toBeCloseTo(
      3_600,
      6,
    );
    expect(convert("area", "mauTrung", "m2", 1).converted).toBeCloseTo(
      4_999.5,
      6,
    );
  });

  it("makes a mẫu ten sào in both regions", () => {
    expect(convert("area", "mauBac", "saoBac", 1).converted).toBeCloseTo(
      10,
      8,
    );
    expect(convert("area", "mauTrung", "saoTrung", 1).converted).toBeCloseTo(
      10,
      8,
    );
  });

  it("converts a hectare to Northern sào", () => {
    // 10.000 ÷ 360 = 27,777…
    expect(convert("area", "ha", "saoBac", 1).converted).toBeCloseTo(
      27.777_777_78,
      6,
    );
  });

  it("uses the exact international acre and square foot", () => {
    expect(convert("area", "acre", "m2", 1).converted).toBeCloseTo(
      4_046.856_422_4,
      6,
    );
    expect(convert("area", "sqft", "m2", 1).converted).toBeCloseTo(
      0.092_903_04,
      10,
    );
  });
});

describe("convertUnit — gold on Vietnamese trade convention", () => {
  it("makes a lượng 37,5 g, not a troy-based 37,8", () => {
    const result = convert("gold", "luong", "g", 1);
    expect(result.converted).toBeCloseTo(37.5, 10);
    expect(result.converted).not.toBeCloseTo(37.8, 1);
  });

  it("makes a chỉ a tenth of a lượng and a phân a hundredth", () => {
    expect(convert("gold", "luong", "chi", 1).converted).toBeCloseTo(10, 10);
    expect(convert("gold", "luong", "phan", 1).converted).toBeCloseTo(
      100,
      10,
    );
  });

  it("converts a lượng to troy ounces", () => {
    // 37,5 ÷ 31,1034768 = 1,20565…
    expect(convert("gold", "luong", "ozt", 1).converted).toBeCloseTo(
      1.205_65,
      5,
    );
  });

  it("converts a kilogram of gold to lượng", () => {
    expect(convert("gold", "kg", "luong", 1).converted).toBeCloseTo(
      1000 / 37.5,
      8,
    );
  });
});

describe("convertUnit — the other categories", () => {
  it("converts length with exact imperial definitions", () => {
    expect(convert("length", "inch", "cm", 1).converted).toBeCloseTo(2.54, 10);
    expect(convert("length", "mile", "km", 1).converted).toBeCloseTo(
      1.609_344,
      10,
    );
    expect(convert("length", "foot", "inch", 1).converted).toBeCloseTo(
      12,
      8,
    );
  });

  it("converts the Vietnamese mass units", () => {
    expect(convert("mass", "yen", "kg", 1).converted).toBeCloseTo(10, 10);
    expect(convert("mass", "ta", "kg", 1).converted).toBeCloseTo(100, 10);
    expect(convert("mass", "tan", "ta", 1).converted).toBeCloseTo(10, 8);
  });

  it("keeps the US and UK gallon apart", () => {
    const us = convert("volume", "gallonUs", "l", 1).converted;
    const uk = convert("volume", "gallonUk", "l", 1).converted;
    expect(us).toBeCloseTo(3.785_411_784, 9);
    expect(uk).toBeCloseTo(4.546_09, 9);
    expect(uk).toBeGreaterThan(us);
  });

  it("converts a cubic metre to litres", () => {
    expect(convert("volume", "m3", "l", 1).converted).toBeCloseTo(1000, 8);
  });
});

describe("convertUnit — the full table", () => {
  it("lists every unit of the category, in declaration order", () => {
    const result = convert("gold", "luong", "g", 2);
    expect(result.all.map((row) => row.id)).toEqual(
      UNITS.gold.map((unit) => unit.id),
    );
  });

  it("agrees with the single conversion on the requested unit", () => {
    for (const category of CATEGORIES) {
      const units = UNITS[category];
      const result = convert(category, units[0].id, units[1].id, 3.5);
      const row = result.all.find((entry) => entry.id === units[1].id)!;
      expect(row.value).toBeCloseTo(result.converted, 8);
    }
  });

  it("echoes the source value on the source unit's row", () => {
    const result = convert("area", "ha", "m2", 2.5);
    const row = result.all.find((entry) => entry.id === "ha")!;
    expect(row.value).toBeCloseTo(2.5, 10);
  });

  it("reports the factor between the two units", () => {
    const result = convert("area", "ha", "m2", 1);
    expect(result.factor).toBeCloseTo(10_000, 6);
    expect(convert("area", "m2", "ha", 1).factor).toBeCloseTo(0.0001, 10);
  });
});

describe("convertUnit — rejected inputs", () => {
  it("rejects a unit from another category", () => {
    // "luong" exists, but not in area.
    expect(
      convertUnit({
        category: "area",
        fromId: "luong",
        toId: "m2",
        value: 1,
      }),
    ).toBeNull();
    expect(
      convertUnit({ category: "gold", fromId: "g", toId: "ha", value: 1 }),
    ).toBeNull();
  });

  it("rejects an unknown unit", () => {
    expect(
      convertUnit({
        category: "length",
        fromId: "parsec",
        toId: "m",
        value: 1,
      }),
    ).toBeNull();
  });

  it("returns null rather than a guess on a non-finite value", () => {
    expect(
      convertUnit({
        category: "length",
        fromId: "m",
        toId: "km",
        value: Number.NaN,
      }),
    ).toBeNull();
    expect(
      convertUnit({
        category: "length",
        fromId: "m",
        toId: "km",
        value: Number.POSITIVE_INFINITY,
      }),
    ).toBeNull();
  });

  it("has no duplicate unit ids within a category", () => {
    for (const category of CATEGORIES) {
      const ids = UNITS[category].map((unit) => unit.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("has a positive factor for every unit", () => {
    for (const category of CATEGORIES) {
      for (const unit of UNITS[category]) {
        expect(unit.factor).toBeGreaterThan(0);
        expect(Number.isFinite(unit.factor)).toBe(true);
      }
    }
  });

  it("has exactly one base unit per category", () => {
    for (const category of CATEGORIES) {
      const bases = UNITS[category].filter((unit) => unit.factor === 1);
      expect(bases).toHaveLength(1);
    }
  });
});
