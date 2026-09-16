/**
 * Content contracts for `/cong-cu/wacc/` (plan row 39).
 *
 * WHY THIS FILE EXISTS. `lib/calc/wacc.test.ts` covers the arithmetic with
 * numbers passed in, so nothing could see this module's two real exposures:
 * a prefilled statutory tax rate stated in prose with no citation, and the
 * page's central teaching — that the shield applies to debt ONLY — asserted
 * in the notice with the wrong-answer figures quoted but never computed.
 *
 * THE SHIELD IS THE PAGE. Applying `(1 − tax)` to all three components, or to
 * none, is the standard error and moves a discount rate by half a point on
 * every year of a discounted cash flow. The notice quotes both wrong answers
 * to show their size; the test below derives them, because a notice that
 * quotes a wrong figure inaccurately is worse than one that does not quote it.
 */
import { describe, expect, it } from "vitest";

import { computeWacc } from "@/lib/calc/wacc";
import { formatDecimal, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { WACC as C } from "@/content/calculators/wacc";

/**
 * Band for "two float routes to one percentage".
 *
 * The reference recomputes a weighted average from the module's own weights;
 * the module accumulates contributions. At WACC magnitudes around 12 points,
 * a couple of ulp is ~4e-15, so 1e-10 points is four decades clear and still
 * ~5e7 times tighter than the 2-dp figure the page prints.
 */
const WACC_BAND_POINTS = 1e-10;

/** The seven shipped form strings, each through the parser its field needs. */
const shippedInput = () => ({
  equityValue: parseMoney(C.form.defaultEquityValue)!,
  costOfEquityPercent: parseDecimal(C.form.defaultCostOfEquity)!,
  debtValue: parseMoney(C.form.defaultDebtValue)!,
  costOfDebtPercent: parseDecimal(C.form.defaultCostOfDebt)!,
  taxRatePercent: parseDecimal(C.form.defaultTax)!,
  preferredValue: parseMoney(C.form.defaultPreferredValue)!,
  costOfPreferredPercent: parseDecimal(C.form.defaultCostOfPreferred)!,
});

const run = () => computeWacc(shippedInput())!;

/** Every user-facing string in the module, by WALKING the exported object. */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/** Proper nouns and model names a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["FinHome", "WACC", "CAPM", "NPV", "IRR", "PDF"];

/** Runs of three or more capitals, once the proper nouns are removed. */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    let text = original;
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ` — that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean.
    for (const match of text.matchAll(/\p{Lu}{3,}/gu)) found.push(match[0]);
  }
  return [...new Set(found)];
}

describe("wacc at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // The values are money at tỷ scale and the costs are rates:
    // `parseDecimal("700.000.000.000")` is 700 and `parseMoney("7.5")` is 75.
    expect(shippedInput()).toEqual({
      equityValue: 700e9,
      costOfEquityPercent: 14,
      debtValue: 300e9,
      costOfDebtPercent: 9,
      taxRatePercent: 20,
      preferredValue: 0,
      costOfPreferredPercent: 0,
    });
  });

  it("opens on a capital structure that HAS both debt and equity", () => {
    // A page about the debt-only tax shield whose default state has no debt
    // would have nothing to show — the same emptiness check the retirement
    // rows use on their own defaults.
    const r = run();
    expect(r.equityWeightPercent).toBe(70);
    expect(r.debtWeightPercent).toBe(30);
    expect(r.preferredWeightPercent).toBe(0);
    expect(r.totalCapital).toBe(1_000e9);
  });

  it("prints the figures the notice and the method section quote", () => {
    const r = run();
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain(formatPercent(r.waccPercent, 2));
    expect(copy).toContain(formatPercent(r.afterTaxCostOfDebtPercent, 1));
    expect(copy).toContain(formatPercent(r.waccBeforeTaxShieldPercent, 1));
    expect(copy).toContain(formatDecimal(r.taxShieldPoints, 2));
    // The per-source contributions, which `formula.body[2]` reads off.
    expect(copy).toContain(formatDecimal(r.equityContributionPoints, 1));
    expect(copy).toContain(formatDecimal(r.debtContributionPoints, 2));
  });

  it("agrees with a weighted average recomputed from its own weights", () => {
    // A ledger identity rather than a reference value: the answer must be the
    // weights times the costs, with `(1 − tax)` on debt alone. This is what
    // catches a shield applied in the wrong place, which is the one error the
    // page exists to warn about.
    const r = run();
    const i = shippedInput();
    const reference =
      (r.equityWeightPercent / 100) * i.costOfEquityPercent +
      (r.debtWeightPercent / 100) *
        i.costOfDebtPercent *
        (1 - i.taxRatePercent / 100) +
      (r.preferredWeightPercent / 100) * i.costOfPreferredPercent;
    expect(Math.abs(r.waccPercent - reference)).toBeLessThan(WACC_BAND_POINTS);

    // The contributions have to add up to the answer, or the breakdown the
    // page shows is decorative.
    const summed =
      r.equityContributionPoints +
      r.debtContributionPoints +
      r.preferredContributionPoints;
    expect(Math.abs(r.waccPercent - summed)).toBeLessThan(WACC_BAND_POINTS);
  });

  it("shields DEBT only, and the notice's two wrong answers are the real ones", () => {
    // The notice says applying it nowhere gives 12,5% and applying it to all
    // three gives something lower still. Both are derived here rather than
    // trusted, because a page that misquotes the wrong answer teaches a
    // different wrong thing.
    const i = shippedInput();
    const r = run();

    const noShield = computeWacc({ ...i, taxRatePercent: 0 })!;
    expect(noShield.waccPercent).toBe(r.waccBeforeTaxShieldPercent);
    expect(formatPercent(noShield.waccPercent, 1)).toBe("12,5%");
    expect(noShield.waccPercent).toBeGreaterThan(r.waccPercent);

    // Shielding everything: the same weights against after-tax costs on all
    // three legs. Lower than the correct answer, which is the notice's claim.
    const all =
      (r.equityWeightPercent / 100) * i.costOfEquityPercent * 0.8 +
      (r.debtWeightPercent / 100) * i.costOfDebtPercent * 0.8;
    expect(all).toBeLessThan(r.waccPercent);

    // And the size of the error the page says it is worth avoiding.
    expect(r.taxShieldPoints).toBeCloseTo(
      noShield.waccPercent - r.waccPercent,
      10,
    );
  });

  it("holds the two boundary cases the method section invites", () => {
    // `formula.body[4]`: no debt means WACC is exactly the cost of equity, no
    // equity means exactly the after-tax cost of debt. A reader is told to
    // check these, so they are pinned.
    const i = shippedInput();
    const noDebt = computeWacc({ ...i, debtValue: 0 })!;
    expect(noDebt.waccPercent).toBe(i.costOfEquityPercent);
    const noEquity = computeWacc({ ...i, equityValue: 0 })!;
    expect(noEquity.waccPercent).toBe(noEquity.afterTaxCostOfDebtPercent);
    expect(formatPercent(noEquity.waccPercent, 1)).toBe("7,2%");
  });
});

describe("wacc's citations", () => {
  it("gives every source a real, non-empty https url", () => {
    expect(C.sources.items.length).toBeGreaterThanOrEqual(1);
    for (const item of C.sources.items) {
      expect(item.url.trim().length).toBeGreaterThan(10);
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.label.trim().length).toBeGreaterThan(10);
    }
  });

  it("cites the law the tax rates in the help text come from", () => {
    // The gap this closes: the help said "Mức phổ thông tại Việt Nam là 20%"
    // with no href anywhere, which docs §3 names as exactly what the `sources`
    // slot was built for. It was also INCOMPLETE — since 01/10/2025 the rate
    // article itself carries size tiers, and the sentence framed every
    // non-20% case as a sectoral or geographic incentive.
    const notes = C.sources.items.map((i) => `${i.label} ${i.note ?? ""}`).join(" ");
    expect(notes).toContain("67/2025/QH15");
    for (const band of ["15%", "17%", "20%"]) {
      expect(notes, `sources do not carry ${band}`).toContain(band);
      expect(C.form.taxHelp, `taxHelp does not carry ${band}`).toContain(band);
    }
    // The prefilled 20% has to be justified by the prefilled capital, not
    // presented as the only rate.
    expect(C.form.taxHelp).toContain("thực chịu");
  });

  it("states the provenance limit rather than implying completeness", () => {
    expect(C.sources.intro).toContain("không phải tư vấn thuế");
    expect(C.sources.intro).toContain("không tự chọn thuế suất");
  });
});

describe("wacc's framing and copy hygiene", () => {
  it("opens on the reader's question, not on a definition of the acronym", () => {
    // The row's question is "Doanh nghiệp cần mức sinh lời bao nhiêu?" and the
    // lede used to open "WACC là mức sinh lời tối thiểu…" — defining the
    // acronym in the page title to a reader who has no reason to care yet.
    expect(C.lede.trim().endsWith("?")).toBe(false);
    const firstSentence = C.lede.split(/(?<=\?)/)[0];
    expect(firstSentence.trim().endsWith("?")).toBe(true);
    expect(firstSentence).not.toContain("WACC");
    // And it still answers the question in the same breath.
    expect(C.lede).toContain("chi phí vốn");
    expect(C.lede).toContain("chỉ lãi vay được trừ thuế");
  });

  it("shouts at nobody", () => {
    // Vacuity fixtures FIRST, using lines this module really shipped.
    expect(shoutedRuns(["Giá trị THỊ TRƯỜNG, tức vốn hóa"])).toEqual([
      "THỊ",
      "TRƯỜNG",
    ]);
    expect(shoutedRuns(["tấm chắn thuế CHỈ áp cho nợ"])).toEqual(["CHỈ"]);
    expect(shoutedRuns(["chi phí vốn cho các quyết định TƯƠNG LAI"])).toEqual([
      "TƯƠNG",
      "LAI",
    ]);
    // An acronym is not shouting — and this module is full of one.
    expect(shoutedRuns(["WACC dùng để làm gì? Thường lấy từ CAPM."])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("does not read the formula as advice to borrow more", () => {
    // The honest limit of a weighted average: swapping expensive equity for
    // cheap debt always lowers it ON PAPER, because the formula holds both
    // costs constant and reality does not. The page says so, and that
    // sentence is load-bearing on a page a business owner may act on.
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain("đừng đọc kết quả như một khuyến nghị vay thêm");
    expect(copy).toContain("rủi ro tài chính");
  });

  it("declares emphasis phrases that resolve against the method prose", () => {
    const body = [...C.formula.body];
    expect(missingPhrases(body, [...C.formula.emphasis])).toEqual([]);
    for (const phrase of C.formula.emphasis) {
      const hits = body.filter((p) => p.includes(phrase)).length;
      expect(hits, `"${phrase}" appears in ${hits} paragraphs`).toBe(1);
    }
    const share = emphasisShare(body, [...C.formula.emphasis]);
    expect(share).toBeLessThan(0.2);
    expect(share).toBeGreaterThan(0);
    expect(shoutedRuns([...C.formula.emphasis])).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});
