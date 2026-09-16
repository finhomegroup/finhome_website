/**
 * Content contracts for `/cong-cu/thue-co-tuc/` (plan row 43).
 *
 * WHY THIS FILE EXISTS. It did not. The clearest lesson in the suite about
 * that gap is one file away: an invented "thường 1–3% dư nợ" range survived
 * in `content/calculators/apr-advanced.ts` after three sibling modules each
 * removed the same claim and each added a sweep to its own test. The module
 * with no test kept the claim. So the sweeps here run over EVERY string this
 * module exports, and the range list is copied from `apr-advanced.test.ts` /
 * `loan.test.ts` rather than written fresh, because a fresh list is one that
 * can drift from theirs.
 *
 * This row's own remaining job was THE YEAR. The registry title rename
 * landed earlier; what was left was a page quoting bracket guidance "theo
 * mức năm 2025" with no year control, no check date and no href — a vintage
 * with no base. The tests below hold the recorded form: the guide names the
 * tax year, names the date it was checked, and the figures it quotes are the
 * ones the cited IRS page actually publishes.
 *
 * NOTE ON WHAT IS DELIBERATELY NOT ASSERTED. There is no test pinning a 2026
 * bracket table, because no verifiable IRS page published one when this was
 * written: Topic no. 409 still carried 2025 and the 2026 newsroom release
 * omits the capital-gains breakpoints. Pinning a remembered table would make
 * this file defend a number nobody checked.
 */
import { describe, expect, it } from "vitest";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { getCalculator } from "@/content/calculators/registry";
import { US_DIVIDEND_TAX as C } from "@/content/calculators/us-dividend-tax";
import { formatMoney, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";
import {
  computeUsDividendTax,
  NIIT_THRESHOLDS,
  type DividendTaxInput,
} from "@/lib/calc/us-dividend-tax";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §4. */
function shippedInput(): DividendTaxInput {
  return {
    qualifiedDividends: parseMoney(D.qualified)!,
    ordinaryDividends: parseMoney(D.ordinary)!,
    qualifiedRatePercent: Number(D.qualifiedRate),
    ordinaryRatePercent: parseDecimal(D.ordinaryRate)!,
    modifiedAgi: parseMoney(D.magi)!,
    status: D.status,
    applyNiit: D.niit === "yes",
  };
}

function run(over: Partial<DividendTaxInput> = {}) {
  const result = computeUsDividendTax({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUsDividendTax returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const pct = (v: number) => formatPercent(v, 2);

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = [
  "USD",
  "IRS",
  "IRA",
  "MAGI",
  "NIIT",
  "REIT",
  "DIV",
  "Roth",
  // Earned its place the honest way: the first run of the sweep below
  // reported it, from the FAQ item asking whether dividends pay FICA.
  "FICA",
];

/**
 * Every user-facing string in the module, by WALKING the exported object.
 *
 * Not a hand-written field list and not a regex over the source text. A
 * field list goes stale the moment a field is added — `sources` arrived
 * after this module shipped — and extracting the literals with a regex
 * first is what made an earlier sweep of a sibling report zero shouted
 * words on a file that had ten.
 */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/** Runs of three or more capitals, once the proper nouns are removed. */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    // A URL is not prose. Strip hrefs BEFORE the proper-noun pass: the
    // govinfo href on a sibling US row is
    // ".../USCODE-2023-title42-..." and reported "USCODE" as shouting,
    // which is a false positive no allowlist should have to absorb. Doing
    // it here rather than per-file means the next agent who adds a
    // capitalised href does not have to rediscover this.
    let text = original.replace(/https?:\/\/\S+/g, " ");
    // split/join, not a regex: these tokens can contain regex metacharacters.
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ` — that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean.
    for (const match of text.matchAll(/\p{Lu}{3,}/gu)) found.push(match[0]);
  }
  return [...new Set(found)];
}

describe("thue-co-tuc's copy", () => {
  it("quotes no invented statistical range", () => {
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("shouts nowhere mid-sentence", () => {
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. Both fixtures are lines this module REALLY shipped before
    // 2026-09-16.
    expect(
      shoutedRuns(["Cơ sở tính phụ thu là số NHỎ HƠN giữa tổng thu nhập"]),
    ).toEqual(["NHỎ", "HƠN"]);
    expect(
      shoutedRuns(["công cụ cố ý KHÔNG tự suy ra thuế suất từ thu nhập"]),
    ).toEqual(["KHÔNG"]);
    // The allowlist must not swallow a real shout beside an allowed token.
    expect(shoutedRuns(["cổ tức REIT thì KHÔNG đủ điều kiện"])).toEqual([
      "KHÔNG",
    ]);
    expect(shoutedRuns(["Trên mẫu 1099-DIV, đây là ô 1b"])).toEqual([]);

    // The vintage label that opens the threshold guide was written as
    // "NĂM THUẾ 2025" on the first pass of this change and is now sentence
    // case: removing the page's shouting and then adding a new shout in the
    // same commit would have been the mechanism, not the fix.
    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
    expect(C.form.thresholdGuide).toContain("năm thuế 2025");
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });

  it("keeps the H1 at least as scoped as the directory row", () => {
    // This row's original complaint was the reverse: the registry said
    // "Thuế cổ tức" while the page said "Thuế cổ tức Hoa Kỳ", so the
    // directory was LESS scoped than the page. Assert the relation rather
    // than either string, so neither side can quietly drop the market.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(getCalculator("thue-co-tuc")?.title).toContain("Hoa Kỳ");
  });
});

describe("thue-co-tuc — the applicable year is stated, with a base", () => {
  it("names the tax year the bracket guidance belongs to", () => {
    // A vintage with no year is the defect; a year with no check date is
    // half of it. docs §8 defect 8: effective date AND base.
    expect(C.form.thresholdGuide).toContain("2025");
    expect(C.form.thresholdGuide).toContain("16/09/2026");
  });

  it("quotes the figures the cited IRS page actually publishes", () => {
    // Fetched from IRS Topic no. 409 on 2026-09-16. The old copy rounded
    // these ("khoảng dưới 48.000 USD"); once a source is named, an
    // approximation reads as the source's own number and is not.
    const guide = C.form.thresholdGuide;
    for (const figure of ["48.350", "96.700", "64.750", "533.400", "600.050"]) {
      expect(guide, `threshold guide is missing ${figure}`).toContain(figure);
    }
    // And it must still tell the reader to go get their own year.
    expect(guide).toContain("năm thuế");
  });

  it("does not claim a bracket table for a year it cannot cite", () => {
    // The guard against the tempting fix. If a later pass rolls these
    // forward, it must cite the page it took them from, and this assertion
    // is the reminder.
    const copy = userFacingStrings(C).join(" ");
    expect(copy).not.toContain("năm 2026:");
    expect(C.sources.items.some((i) => i.url.includes("tc409"))).toBe(true);
  });

  it("keeps the NIIT thresholds out of the year story, because they are static", () => {
    // The page's own distinction, and the reason only ONE of its two
    // threshold families is a staleness risk. Read from the model, so the
    // prose cannot drift from the constants.
    expect(NIIT_THRESHOLDS.single).toBe(200_000);
    expect(NIIT_THRESHOLDS.married).toBe(250_000);
    expect(NIIT_THRESHOLDS.marriedSeparate).toBe(125_000);
    expect(NIIT_THRESHOLDS.head).toBe(200_000);
    const body = C.formula.body[3];
    for (const figure of ["200.000", "250.000", "125.000"]) {
      expect(body, `formula.body[3] is missing ${figure}`).toContain(figure);
    }
    expect(body).toContain("2013");
  });
});

describe("thue-co-tuc at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "10.000" through parseDecimal is 10 — a 1000x error. The qualified
    // rate is a fixed three-value select, so it is read as a plain number
    // rather than through a locale parser.
    expect(shippedInput()).toEqual({
      qualifiedDividends: 10_000,
      ordinaryDividends: 2_000,
      qualifiedRatePercent: 15,
      ordinaryRatePercent: 24,
      modifiedAgi: 120_000,
      status: "single",
      applyNiit: true,
    });
  });

  it("opens below the NIIT threshold, so the classification is the story", () => {
    // A default state already paying the surcharge would bury the thing the
    // page is about behind a second tax.
    const r = run();
    expect(r.aboveNiitThreshold).toBe(false);
    expect(r.niitTax).toBe(0);
    expect(r.qualifiedSaving).toBeGreaterThan(0);
  });

  it("quotes the tax, the effective rate and what classification is worth", () => {
    const r = run();
    expect(usd(r.totalTax)).toBe("1.980");
    expect(pct(r.effectiveRatePercent!)).toBe("16,50%");
    expect(usd(r.taxIfAllOrdinary)).toBe("2.880");
    expect(usd(r.qualifiedSaving)).toBe("900");
    expect(usd(r.totalDividends)).toBe("12.000");
    for (const figure of ["1.980", "16,50%", "2.880", "900", "12.000"]) {
      expect(C.classificationNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("derives the top-bracket gap the notice quotes rather than asserting it", () => {
    // 23,80% against 40,80%. Both come from the model at the top rates, so
    // if the surcharge or a rate moves the sentence fails with it.
    const top = run({
      qualifiedRatePercent: 20,
      ordinaryRatePercent: 37,
      modifiedAgi: 2_000_000,
    });
    expect(pct(top.effectiveRatePercent!)).not.toBe("");
    const allQualified = run({
      qualifiedDividends: 12_000,
      ordinaryDividends: 0,
      qualifiedRatePercent: 20,
      modifiedAgi: 2_000_000,
    });
    const allOrdinary = run({
      qualifiedDividends: 0,
      ordinaryDividends: 12_000,
      ordinaryRatePercent: 37,
      modifiedAgi: 2_000_000,
    });
    expect(pct(allQualified.effectiveRatePercent!)).toBe("23,80%");
    expect(pct(allOrdinary.effectiveRatePercent!)).toBe("40,80%");
    for (const figure of ["23,80%", "40,80%"]) {
      expect(C.classificationNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("takes the LESSER of investment income and the MAGI excess", () => {
    // formula.body[4]'s claim, and the one the NIIT source states verbatim.
    // Two readers, each of whom would be overcharged by the wrong pick.
    const barelyOver = run({ modifiedAgi: 201_000 });
    expect(barelyOver.aboveNiitThreshold).toBe(true);
    expect(barelyOver.magiExcess).toBe(1_000);
    // Investment income is 12.000, the excess is 1.000 — the excess binds.
    expect(barelyOver.niitBase).toBe(1_000);
    expect(usd(barelyOver.niitTax)).toBe("38");

    const farOver = run({ modifiedAgi: 900_000 });
    // Now the dividends bind instead.
    expect(farOver.niitBase).toBe(12_000);
    expect(usd(farOver.niitTax)).toBe("456");
    expect(C.formula.body[4]).toContain("nhỏ hơn");
  });

  it("leaves the surcharge out of the classification saving, because it is blind to it", () => {
    // formula.body[5]'s claim: the 3,8% applies either way, so including it
    // would make classification look as if it changed a tax it cannot.
    const withNiit = run({ modifiedAgi: 900_000 });
    const withoutNiit = run({ modifiedAgi: 900_000, applyNiit: false });
    expect(withNiit.qualifiedSaving).toBeCloseTo(withoutNiit.qualifiedSaving, 8);
    expect(withNiit.totalTax - withoutNiit.totalTax).toBeCloseTo(
      withNiit.niitTax,
      8,
    );
  });

  it("refuses a qualified rate the statute does not have", () => {
    // Three rates exist in law. The page says so and the model enforces it,
    // which is what makes the rate a select rather than a number field.
    expect(
      computeUsDividendTax({ ...shippedInput(), qualifiedRatePercent: 18 }),
    ).toBe(null);
    for (const rate of [0, 15, 20]) {
      expect(
        computeUsDividendTax({ ...shippedInput(), qualifiedRatePercent: rate }),
      ).not.toBe(null);
    }
    expect(C.form.invalidNotice).toContain("0, 15 hoặc 20");
  });
});

/**
 * This row adds NO emphasis, and that is enforced here.
 *
 * The chain is `library: "hoa-ky"` => filed `reference` => this pass added
 * nothing. `plan-disposition.test.ts` enforces the FIRST arrow for all 75
 * rows. Nothing enforced the second: `reference` is documented as asserting
 * that nothing was added, and no test checked that a `reference` row had in
 * fact added nothing — which is how a sibling US row shipped seven
 * `<strong>` per page while still filed `reference`, suite green.
 */
describe("thue-co-tuc — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("thue-co-tuc")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("thue-co-tuc")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "thue-co-tuc is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("thue-co-tuc — sources", () => {
  it("cites an openable source for every item", () => {
    expect(C.sources.items.length).toBeGreaterThan(0);
    for (const item of C.sources.items) {
      expect(item.url, "a source item has an empty url").not.toBe("");
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.label.trim()).not.toBe("");
    }
  });

  it("states the provenance limit rather than implying completeness", () => {
    expect(C.sources.intro).toBeDefined();
    expect(C.sources.intro.length).toBeGreaterThan(40);
  });

  it("cites a source for each of the three things the tool prefills", () => {
    // The brackets, the surcharge thresholds and the holding-period test are
    // three separate authorities, and the page applies all three.
    const urls = C.sources.items.map((item) => item.url);
    expect(urls.some((u) => u.includes("tc409")), "brackets").toBe(true);
    expect(
      urls.some((u) => u.includes("net-investment-income-tax")),
      "NIIT thresholds",
    ).toBe(true);
    expect(urls.some((u) => u.includes("p550")), "qualified-dividend test").toBe(
      true,
    );
    expect(
      urls.every((url) => url.includes("irs.gov")),
      "a source is not on an official IRS host",
    ).toBe(true);
  });

  it("tells the reader the brackets move and their year may differ", () => {
    // The whole point of recording a vintage. A source list that implies the
    // quoted year is the reader's year reintroduces the defect it fixed.
    expect(C.sources.intro).toContain("năm thuế");
    const notes = C.sources.items.map((i) => i.note ?? "").join(" ");
    expect(notes).toContain("2025");
  });
});
