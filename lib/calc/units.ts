/**
 * Unit conversion for /cong-cu/doi-don-vi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `units.test.ts`.
 *
 * Every unit is defined by ONE factor: how many base units it equals. Within
 * a category, converting is then `value × from.factor ÷ to.factor` — a single
 * expression rather than a table of pairs. A pairwise table for n units needs
 * n² entries and drifts; this needs n and cannot.
 *
 * The categories are chosen for a Vietnamese property and finance audience,
 * which is why this is not a general-purpose converter:
 *
 * - **Area** carries the traditional land measures that still appear in deeds
 *   and listings: `sào` and `mẫu`, both of which differ between the North and
 *   the Centre. They are separate units here rather than one averaged
 *   figure, because averaging them would silently produce wrong land areas —
 *   a Northern mẫu is 3.600 m², a Central one 4.999,5 m².
 * - **Gold** carries `lượng` (also called `cây`) and `chỉ`, the units gold is
 *   actually quoted in. A lượng is 37,5 g by Vietnamese trade convention, not
 *   the 37,8 g of a troy-based tael.
 * - **Length**, **mass** and **volume** are the metric and imperial units
 *   that turn up in construction and freight.
 *
 * Temperature is deliberately ABSENT. It is an affine conversion, not a
 * multiplicative one, so it does not fit the single-factor model — and
 * bolting it on with a special case is how a converter starts reporting that
 * 0°C is 0°F.
 */

export type UnitCategory = "area" | "length" | "mass" | "volume" | "gold";

export type UnitDefinition = {
  /** Stable key used in state and tests. */
  id: string;
  /** How many base units one of these equals. */
  factor: number;
};

/**
 * Units by category, each with its factor against the category's base.
 *
 * Bases: square metre, metre, kilogram, litre, gram.
 */
export const UNITS: Record<UnitCategory, UnitDefinition[]> = {
  area: [
    { id: "m2", factor: 1 },
    { id: "km2", factor: 1_000_000 },
    { id: "ha", factor: 10_000 },
    // Traditional Vietnamese land measures. North and Centre differ, and
    // both are still used — so both are listed rather than averaged.
    { id: "saoBac", factor: 360 },
    { id: "saoTrung", factor: 499.95 },
    { id: "mauBac", factor: 3_600 },
    { id: "mauTrung", factor: 4_999.5 },
    { id: "sqft", factor: 0.092_903_04 },
    { id: "acre", factor: 4_046.856_422_4 },
  ],
  length: [
    { id: "m", factor: 1 },
    { id: "km", factor: 1_000 },
    { id: "cm", factor: 0.01 },
    { id: "mm", factor: 0.001 },
    { id: "inch", factor: 0.0254 },
    { id: "foot", factor: 0.3048 },
    { id: "yard", factor: 0.9144 },
    { id: "mile", factor: 1_609.344 },
  ],
  mass: [
    { id: "kg", factor: 1 },
    { id: "tan", factor: 1_000 },
    { id: "g", factor: 0.001 },
    { id: "yen", factor: 10 },
    { id: "ta", factor: 100 },
    { id: "pound", factor: 0.453_592_37 },
    { id: "ounce", factor: 0.028_349_523_125 },
  ],
  volume: [
    { id: "l", factor: 1 },
    { id: "m3", factor: 1_000 },
    { id: "ml", factor: 0.001 },
    { id: "gallonUs", factor: 3.785_411_784 },
    { id: "gallonUk", factor: 4.546_09 },
  ],
  gold: [
    { id: "g", factor: 1 },
    // Vietnamese trade convention: a lượng (cây) is 37,5 g, and a chỉ is a
    // tenth of that. NOT the 37,8 g of a troy-based tael.
    { id: "luong", factor: 37.5 },
    { id: "chi", factor: 3.75 },
    { id: "phan", factor: 0.375 },
    { id: "kg", factor: 1_000 },
    { id: "ozt", factor: 31.103_476_8 },
  ],
};

export type ConversionRow = {
  /** The unit converted into. */
  id: string;
  /** The converted value. */
  value: number;
};

export type UnitConversionResult = {
  category: UnitCategory;
  /** Echoed back. */
  fromId: string;
  toId: string;
  /** The value entered. */
  value: number;
  /** The single requested conversion. */
  converted: number;
  /** How many `to` units one `from` unit is — the conversion factor itself. */
  factor: number;
  /** The same value in every unit of the category, in declaration order. */
  all: ConversionRow[];
};

/** Look a unit up within a category. */function find(
  category: UnitCategory,
  id: string,
): UnitDefinition | undefined {
  return UNITS[category].find((unit) => unit.id === id);
}

/**
 * Convert a value between two units of the same category.
 *
 * Null when the inputs cannot describe a conversion: an unknown category,
 * a unit that does not belong to the category given, or a non-finite value.
 *
 * Negative values are allowed: a change in area or mass can be negative, and
 * refusing it would be arbitrary for a pure multiplication.
 */
export function convertUnit(input: {
  category: UnitCategory;
  fromId: string;
  toId: string;
  value: number;
}): UnitConversionResult | null {
  const { category, fromId, toId, value } = input;

  if (!(category in UNITS)) return null;
  if (!Number.isFinite(value)) return null;

  const from = find(category, fromId);
  const to = find(category, toId);
  if (!from || !to) return null;

  // One factor per unit, so this is the whole conversion. A pairwise table
  // would need n² entries and could disagree with itself.
  const factor = from.factor / to.factor;
  const converted = value * factor;
  if (!Number.isFinite(converted)) return null;

  return {
    category,
    fromId,
    toId,
    value,
    converted,
    factor,
    all: UNITS[category].map((unit) => ({
      id: unit.id,
      value: (value * from.factor) / unit.factor,
    })),
  };
}
