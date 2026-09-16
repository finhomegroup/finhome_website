import { describe, it, expect } from "vitest";
import { computeFibonacci } from "@/lib/calc/fibonacci";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { FIBONACCI as C } from "@/content/calculators/fibonacci";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";

/**
 * A level by its ratio, matched on the FORMATTED percent.
 *
 * Not `ratioPercent === 38.2`: the module builds it as `0.382 * 100`, which
 * is 38.199999999999996, so an equality test against a literal finds
 * nothing and this helper returned undefined on its first run. docs §8 —
 * any comparison against a computed float needs a band, and the display
 * rounding is the band the page itself uses.
 */
const priceAt = (ratioLabel: string, over = {}) =>
  formatMoney(
    run(over).retracements.find(
      (l) => formatPercent(l.ratioPercent, 1) === ratioLabel,
    )!.price,
  );

describe("fibonacci at its shipped defaults", () => {
  it("parses both prices as money, not as decimals", () => {
    // `parseDecimal("60.000")` is 60 — the 1000x trap docs §4 opens with,
    // and it would put every level three orders of magnitude out while
    // still looking like a price.
    expect(shippedInput()).toEqual({
      high: 60_000,
      low: 40_000,
      direction: "uptrend",
    });
  });

  it("quotes the levels its own copy states, to the đồng", () => {
    const r = run();
    expect(formatMoney(r.range)).toBe("20.000");
    expect(priceAt("38,2%")).toBe("52.360");
    expect(priceAt("50,0%")).toBe("50.000");
    expect(priceAt("61,8%")).toBe("47.640");
    expect(priceAt("78,6%")).toBe("44.280");
    // Per paragraph, not against the joined body: the same level appears in
    // both direction paragraphs, so a concatenated containment check is
    // satisfied by the other one. See the twin note in `pivot.test.ts`,
    // where a staged mutation proved exactly that.
    expect(C.formula.body[0]).toContain("20.000");
    for (const figure of ["52.360", "50.000", "47.640", "44.280"])
      expect(
        C.formula.body[1],
        `the uptrend paragraph no longer states ${figure}`,
      ).toContain(figure);
  });

  it("marks 50% and 78,6% as convention rather than Fibonacci", () => {
    const conventional = run()
      .retracements.filter((l) => l.conventional)
      .map((l) => formatPercent(l.ratioPercent, 1));
    expect(conventional).toEqual(["50,0%", "78,6%"]);
    // The table has a column for it, which is why the claim is disclosed
    // rather than merely asserted in prose.
    expect(F.retracementTable.kindColumn).toBeTruthy();
    expect(F.retracementTable.conventional).toBeTruthy();
  });

  it("puts the same 50% level on both directions and moves 61,8%", () => {
    // `formula.body[2]`'s claim: the two directions are symmetric about the
    // midpoint, so 50% coincides. Run it rather than trust it.
    expect(priceAt("50,0%", { direction: "downtrend" })).toBe(priceAt("50,0%"));
    expect(priceAt("61,8%", { direction: "downtrend" })).toBe("52.360");
  });
});

/**
 * Row 42 — Fibonacci retracements — at the copy it actually ships, plus the
 * promotion this row's requirement asks for.
 *
 * docs §6 (T11): a green `lib/calc/fibonacci.test.ts` proves the ratios are
 * arithmetically right and says nothing about whether the page states the
 * one thing the requirement names.
 */

const F = C.form;
function shippedInput() {
  return {
    high: parseMoney(F.defaultHigh)!,
    low: parseMoney(F.defaultLow)!,
    direction: F.defaultDirection as "uptrend" | "downtrend",
  };
}

function run(over: Partial<ReturnType<typeof shippedInput>> = {}) {
  const result = computeFibonacci({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeFibonacci returned null");
  return result;
}

/**
 * Row 42 is `dau-tu`, filed `emphasis`, and the phrases are real.
 *
 * THIS GUARD WAS THE INVERSE ONE DAY AGO. It asserted that this row carried
 * NO emphasis, because `plan-disposition.ts` filed it `reference` and
 * `scripts/check-built-markup.mjs` fails a page that ships `<strong>` while
 * not filed `emphasis`. The filing has now moved with the copy, so the guard
 * moves with it — in the same change, because the reverse contract makes the
 * other order red too ("filed as `emphasis` but the page ships no
 * `<strong>`"). There is no safe order for this pair, only a safe atomic
 * commit, and `check:markup` passing is the proof it was atomic.
 *
 * What is asserted is what `reference` could never assert: that the phrases
 * OCCUR. A declared phrase that matches nothing is a silent no-op in
 * `emphasise()` by design, so `missingPhrases` is the only thing standing
 * between a phrase list and a page that renders none of it.
 */
describe("fibonacci — reading disposition is applied, not just filed", () => {
  it("is a dau-tu row filed emphasis, with phrases that occur", () => {
    expect(dispositionFor("fibonacci")?.library).toBe("dau-tu");
    expect(readingDispositionFor("fibonacci")).toBe("emphasis");
    const phrases = C.formula.emphasis;
    expect(phrases.length).toBeGreaterThan(0);
    expect(
      missingPhrases(C.formula.body, phrases),
      "a declared phrase does not occur in the prose it was declared for",
    ).toEqual([]);
    // Each phrase in exactly ONE paragraph: `emphasise` marks only the first
    // occurrence per paragraph, so a phrase spanning two paragraphs would
    // render twice and read as "bold everything" in miniature.
    for (const phrase of phrases) {
      const paragraphs = C.formula.body.filter((p) => p.includes(phrase));
      expect(paragraphs, `"${phrase}" occurs in ${paragraphs.length} paragraphs`)
        .toHaveLength(1);
    }
    // The ratchet, restated locally so this row cannot drift alone.
    expect(emphasisShare(C.formula.body, phrases)).toBeLessThan(0.2);
  });
});
