import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { computeDdm, type DdmInput } from "@/lib/calc/ddm";
import { formatDecimal, formatMoney, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";
import { DDM as C } from "@/content/calculators/ddm";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";

/**
 * Row 34 — the Gordon growth model — at the copy it actually ships.
 *
 * docs §6 (T11 in the P4 plan): a green `lib/calc/ddm.test.ts` says nothing
 * about the page, because the defect that shipped on the sibling investing
 * row lived in a DEFAULT and in a sentence, not in the engine. Every figure
 * this module's prose quotes is re-derived here from `computeDdm` at the
 * shipped defaults, so "a number in a sentence" stops being a test fixture
 * that was never written.
 */

const F = C.form;

/** The component's own parse, field by field — docs §4. */
function shippedInput(): DdmInput {
  return {
    dividend: parseMoney(F.defaultDividend)!,
    dividendIsNext: F.defaultMode !== "current",
    growthPercent: parseDecimal(F.defaultGrowth)!,
    requiredReturnPercent: parseDecimal(F.defaultRequired)!,
    price: parseMoney(F.defaultPrice)!,
  };
}

function run(over: Partial<DdmInput> = {}) {
  const result = computeDdm({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeDdm returned null");
  return result;
}

describe("co-phieu-tang-truong-deu at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // The dividend and the price are money — `parseDecimal("2.000")` is 2,
    // which is the 1000x grammar trap docs §4 opens with, and this row's
    // sibling `loi-nhuan-co-phieu` is where it actually shipped (a P/E out
    // by 1000x). The two rates are rates, so `parseMoney("5")` would be
    // fine here but `parseMoney("7.5")` would be 75.
    expect(shippedInput()).toEqual({
      dividend: 2_000,
      dividendIsNext: false,
      growthPercent: 5,
      requiredReturnPercent: 12,
      price: 25_000,
    });
  });

  it("quotes the figures its notice states, to the digit", () => {
    const r = run();
    expect(formatMoney(r.nextDividend)).toBe("2.100");
    expect(formatMoney(r.intrinsicValue)).toBe("30.000");
    expect(formatPercent(r.impliedGrowthPercent!, 3)).toBe("3,704%");
    expect(formatPercent(r.impliedReturnPercent!, 3)).toBe("13,400%");
    for (const figure of ["30.000", "3,704", "13,400", "25.000"])
      expect(C.denominatorNotice).toContain(figure);
  });

  it("backs the notice's own sensitivity claim by running it", () => {
    // The notice's argument is arithmetic, not rhetoric: "raise growth to
    // 11% and the denominator is 1% and the value jumps past 220.000 ₫".
    // docs §7 — do not assert an inequality that only holds on a fixture;
    // run the fixture the sentence names.
    const at11 = run({ growthPercent: 11 });
    expect(at11.intrinsicValue).toBeGreaterThan(220_000);
    expect(C.denominatorNotice).toContain("220.000");
  });

  it("refuses g >= r rather than printing the negative number", () => {
    expect(computeDdm({ ...shippedInput(), growthPercent: 12 })).toBe(null);
    expect(computeDdm({ ...shippedInput(), growthPercent: 15 })).toBe(null);
    // And the copy attributes that to the MODEL, not to the tool.
    expect(F.unpriceableNotice).toContain("mô hình Gordon");
  });

  it("splits the required return into the two yields the prose checks with", () => {
    const r = run();
    expect(r.dividendYieldPercent + r.capitalGainsYieldPercent).toBeCloseTo(
      r.totalReturnPercent,
      10,
    );
    expect(formatPercent(r.totalReturnPercent, 0)).toBe("12%");
  });

  it("states the D0/D1 gap with the figure it really produces", () => {
    // `formula.body[1]`: entering 2.000 as D1 gives 28.571 ₫ rather than
    // 30.000 ₫ — "5% apart, exactly the growth rate".
    const asNext = run({ dividendIsNext: true });
    expect(formatMoney(asNext.intrinsicValue)).toBe("28.571");
    expect(C.formula.body[1]).toContain("28.571");
    expect(formatDecimal(30_000 / asNext.intrinsicValue - 1, 2)).toBe("0,05");
  });
});

/**
 * The 34 <-> 35 cross-link.
 *
 * Row 35's own requirement is to be reachable "as the advanced mode from the
 * Gordon tool", and row 34's copy already tells the reader to go there — but
 * only inside `unpriceableNotice`, which renders ONLY when g >= r, plus an
 * FAQ mention. Neither page carried a link, and the two engines share no
 * production code (both `lib/calc/ddm.ts` and `lib/calc/ddm-multi.ts` have
 * zero imports), so there is nothing to merge: the pairing is editorial plus
 * a link.
 *
 * The link CANNOT go through `TOOL_NEXT_STEPS`: `next-steps.test.ts` fails
 * if any library-shelved row has an entry at all, and both of these are
 * shelved `dau-tu`. So it lives in each row's own content as a SLUG and is
 * resolved through the registry by each route — the mechanism row 46/47 use.
 *
 * What is asserted is that the link RESOLVES, not that an href string is
 * present: a dead slug then fails `next build` instead of shipping a link
 * the page told the reader to follow.
 */
describe("co-phieu-tang-truong-deu <-> co-phieu-tang-truong-khong-deu", () => {
  const routeFile = (slug: string) =>
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../app/cong-cu/${slug}/page.tsx`,
    );

  it("points at a sibling that is live in the registry", () => {
    for (const [from, related] of [
      ["co-phieu-tang-truong-deu", C.relatedTool],
      ["co-phieu-tang-truong-khong-deu", DDM_MULTI.relatedTool],
    ] as const) {
      const entry = getCalculator(related.slug);
      expect(
        entry,
        `${from} links to "${related.slug}", which is not in the registry`,
      ).toBeDefined();
      expect(entry!.status).toBe("live");
      expect(existsSync(routeFile(related.slug))).toBe(true);
    }
  });

  it("resolves to the sibling's own /cong-cu/ path, both ways", () => {
    expect(C.relatedTool.slug).toBe("co-phieu-tang-truong-khong-deu");
    expect(DDM_MULTI.relatedTool.slug).toBe("co-phieu-tang-truong-deu");
    expect(calculatorPath(C.relatedTool.slug)).toBe(
      "/cong-cu/co-phieu-tang-truong-khong-deu",
    );
    expect(calculatorPath(DDM_MULTI.relatedTool.slug)).toBe(
      "/cong-cu/co-phieu-tang-truong-deu",
    );
  });

  it("renders it from the route, and not through TOOL_NEXT_STEPS", () => {
    for (const slug of [
      "co-phieu-tang-truong-deu",
      "co-phieu-tang-truong-khong-deu",
    ] as const) {
      const page = readFileSync(routeFile(slug), "utf8");
      expect(page, `${slug} does not render afterCalculator`).toContain(
        "afterCalculator",
      );
      expect(page, `${slug} does not resolve its relatedTool`).toContain(
        "relatedTool",
      );
      // Resolved through the registry rather than written out. `getCalculator`
      // is what makes a withdrawn slug a build failure.
      expect(page, `${slug} does not resolve the slug through the registry`)
        .toContain("getCalculator");
      expect(page).toContain("calculatorPath");
    }
  });

  it("says why the sibling is worth opening, not just that it exists", () => {
    // A bare "see also" is a link; naming the limitation the other tool
    // removes is a reason. Row 34's own FAQ already makes this argument in
    // prose, so the link's copy must not contradict it.
    for (const related of [C.relatedTool, DDM_MULTI.relatedTool]) {
      expect(related.why.length).toBeGreaterThan(60);
      expect(related.title.length).toBeGreaterThan(8);
    }
  });
});

/**
 * Row 34 is `dau-tu`, filed `emphasis`, and the phrases are real.
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
describe("co-phieu-tang-truong-deu — reading disposition is applied, not just filed", () => {
  it("is a dau-tu row filed emphasis, with phrases that occur", () => {
    expect(dispositionFor("co-phieu-tang-truong-deu")?.library).toBe("dau-tu");
    expect(readingDispositionFor("co-phieu-tang-truong-deu")).toBe("emphasis");
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
