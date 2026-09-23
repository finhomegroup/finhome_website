import { describe, expect, it } from "vitest";
import {
  PALETTE_SLOTS,
  paletteIndexByKey,
  paletteSlot,
  seriesIndex,
} from "./palette";

describe("paletteIndexByKey", () => {
  it("gives legend keys their legend order", () => {
    const slots = paletteIndexByKey({
      legend: [{ key: "a" }, { key: "b" }, { key: "c" }],
      segmentKeys: ["a", "b", "c"],
    });
    expect([...slots]).toEqual([
      ["a", 0],
      ["b", 1],
      ["c", 2],
    ]);
  });

  it("keeps a key's slot when a bar OMITS an earlier segment", () => {
    // The shipped defect, in one assertion. The legend is
    // income/essentials/..., and the income bar draws only `income` while the
    // budget bars start at `essentials`. Colouring by position inside each bar
    // gave `essentials` slot 0 on those bars — the legend's income colour.
    const slots = paletteIndexByKey({
      legend: [{ key: "income" }, { key: "essentials" }, { key: "leftover" }],
      segmentKeys: ["income", "essentials", "leftover"],
    });
    expect(slots.get("income")).toBe(0);
    expect(slots.get("essentials")).toBe(1);
    // ...and that is true regardless of which bar is being drawn, because the
    // slot comes from the MODEL and not from the bar.
    expect(paletteSlot(slots, "essentials", 0)).toBe(1);
  });

  it("appends a drawn key the legend does not name", () => {
    // `affordability-chart` draws `unusedCash` and `usedCapacity` without
    // listing them in the legend. They must not collide with a legend key.
    const slots = paletteIndexByKey({
      legend: [{ key: "cash" }, { key: "loan" }],
      segmentKeys: ["cash", "loan", "unusedCash", "usedCapacity"],
    });
    expect(slots.get("cash")).toBe(0);
    expect(slots.get("loan")).toBe(1);
    expect(slots.get("unusedCash")).toBe(2);
    expect(slots.get("usedCapacity")).toBe(3);
    // Every drawn key has its own slot: no two share one before the palette
    // itself runs out.
    expect(new Set(slots.values()).size).toBe(slots.size);
  });

  it("is stable when the same key repeats across bars", () => {
    const slots = paletteIndexByKey({
      legend: [{ key: "a" }, { key: "a" }, { key: "b" }],
      segmentKeys: ["a", "b", "a", "b"],
    });
    // First occurrence wins, the same rule ChartFigure's dedupe applies.
    expect(slots.get("a")).toBe(0);
    expect(slots.get("b")).toBe(1);
    expect(slots.size).toBe(2);
  });

  it("handles a model with no legend at all", () => {
    const slots = paletteIndexByKey({
      legend: [],
      segmentKeys: ["only"],
    });
    expect(slots.get("only")).toBe(0);
  });

  it("does not invent slots for keys nothing draws", () => {
    const slots = paletteIndexByKey({
      legend: [{ key: "listed" }],
      segmentKeys: [],
    });
    // A legend entry still gets its slot — the swatch is rendered from it.
    expect(slots.get("listed")).toBe(0);
    expect(slots.size).toBe(1);
  });
});

describe("paletteSlot", () => {
  it("wraps past the palette's real size", () => {
    const slots = paletteIndexByKey({
      legend: [
        { key: "a" },
        { key: "b" },
        { key: "c" },
        { key: "d" },
        { key: "e" },
      ],
      segmentKeys: [],
    });
    expect(slots.get("e")).toBe(4);
    // Colour is never the only channel here — segments are ordered and
    // labelled and every model ships a table — so wrapping is a real limit
    // rather than a failure.
    expect(paletteSlot(slots, "e", 0)).toBe(0);
    expect(paletteSlot(slots, "a", 9)).toBe(0);
  });

  it("falls back for a key the map never saw", () => {
    const slots = paletteIndexByKey({ legend: [], segmentKeys: [] });
    expect(paletteSlot(slots, "missing", 2)).toBe(2);
    expect(paletteSlot(slots, "missing", 6)).toBe(2);
  });

  it("reports a palette size the components actually have", () => {
    expect(PALETTE_SLOTS).toBe(4);
  });
});

describe("seriesIndex", () => {
  it("does NOT wrap, so a fifth series is a fifth series", () => {
    // The non-colour channel's index. `paletteSlot` wrapping is correct for
    // four colours and wrong for the texture list, which is longer: keying the
    // texture to the wrapped slot is how six segments ended up with four
    // encodings on `kha-nang-mua-nha` at 390 px.
    const slots = paletteIndexByKey({
      legend: ["a", "b", "c", "d", "e", "f"].map((key) => ({ key })),
      segmentKeys: [],
    });
    expect(["a", "b", "c", "d", "e", "f"].map((k) => seriesIndex(slots, k, 0)))
      .toEqual([0, 1, 2, 3, 4, 5]);
    expect(paletteSlot(slots, "e", 0)).toBe(seriesIndex(slots, "a", 0));
    expect(seriesIndex(slots, "e", 0)).not.toBe(seriesIndex(slots, "a", 0));
  });

  it("uses the same fallback rule as paletteSlot, unwrapped", () => {
    const slots = paletteIndexByKey({ legend: [], segmentKeys: [] });
    expect(seriesIndex(slots, "missing", 6)).toBe(6);
    expect(paletteSlot(slots, "missing", 6)).toBe(2);
  });
});
