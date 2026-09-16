/**
 * Content contracts for `/cong-cu/lam-phat-hoa-ky/` (plan row 72).
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
 * THE ROW'S OWN LESSON, and a correction. The scope plan called this "the
 * one genuinely unmet LESSON in the 36" on the grounds that a grep for
 * "giỏ" / "rổ" / "basket" in the module returned zero hits. It does not:
 * FAQ item 4 has said "CPI là giá của một giỏ hàng hóa bình quân" since the
 * page shipped. What was really missing was the CONTRAST the row asked for —
 * a basket against one asset's price rise — because item 4 contrasted the
 * basket with the reader's own spending mix instead. The first describe
 * block below pins both halves, so neither can be dropped as redundant.
 */
import { describe, expect, it } from "vitest";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { US_INFLATION as C } from "@/content/calculators/us-inflation";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsInflation, type InflationInput } from "@/lib/calc/us-inflation";

const D = C.form.defaults;

/**
 * The component's own parse, field by field — docs §4.
 *
 * `years` is `parseDecimal`, not `parseCount`, and that is correct here
 * rather than an oversight: `yearsHelp` invites a fractional value ("18
 * tháng là 1,5") and nothing downstream applies an integer guard, which is
 * the combination that makes `parseDecimal` safe. The trap the docs warn
 * about is `parseDecimal` sitting BEHIND a `Number.isInteger` check, where
 * `parseDecimal("1.000")` is 1 and the field's own error never fires.
 */
function shippedInput(): InflationInput {
  return {
    mode: D.mode,
    amount: parseMoney(D.amount)!,
    startCpi: parseDecimal(D.startCpi)!,
    endCpi: parseDecimal(D.endCpi)!,
    years: parseDecimal(D.years)!,
    ratePercent: parseDecimal(D.rate)!,
  };
}

function run(over: Partial<InflationInput> = {}) {
  const result = computeUsInflation({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUsInflation returned null");
  return result;
}

const usd = (v: number) => formatMoney(v, 2);
const pct = (v: number) => formatPercent(v, 2);

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["USD", "CPI", "BLS"];

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

describe("lam-phat-hoa-ky says CPI is a basket, and says what that excludes", () => {
  it("names the basket in the lede, not only in a collapsed FAQ", () => {
    // The lede is the one surface on this shell that is never collapsed.
    // Before this change the basket sentence lived only in FAQ item 4,
    // inside the accordion.
    expect(C.lede).toContain("giỏ hàng hóa");
  });

  it("contrasts the basket with a single asset's price rise", () => {
    // The row's actual requirement. A basket definition on its own does not
    // stop the misuse; naming the thing CPI is NOT is what does.
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain("không phải giá của một món");
    expect(C.lede).toContain("một căn nhà");
  });

  it("answers the house-price question in both directions", () => {
    // One direction stops a reader typing property growth into the rate
    // field; the other stops them concluding a house tracks CPI. A FAQ item
    // that only did one would leave half the misuse in place.
    const houseFaq = C.faq.items.find((item) => item.q.includes("Giá nhà"));
    expect(houseFaq, "the house-price FAQ item is missing").toBeDefined();
    expect(houseFaq!.a).toContain("lạm phát bình quân");
    expect(houseFaq!.a).toContain("cũng chỉ tăng 2,5%");
  });

  it("keeps the basket claim consistent with what BLS is cited as saying", () => {
    // The copy says housing is ONE group among eight and that the basket is
    // built on an average household. Both are claims the cited Q&A page
    // makes; if the copy is reworded away from them, the citation stops
    // supporting it.
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain("tám nhóm lớn");
    expect(copy).toContain("hộ gia đình bình quân");
  });
});

describe("lam-phat-hoa-ky's copy", () => {
  it("quotes no invented statistical range", () => {
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("shouts nowhere mid-sentence", () => {
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. Both fixtures are lines this module REALLY shipped before
    // 2026-09-16, and the contrast in the first one is the reason casing was
    // used as emphasis here at all.
    // NOTE THE DETECTOR'S KNOWN LIMIT, recorded here rather than left for
    // someone to discover: the pattern is `\p{Lu}{3,}`, so a shouted word of
    // one or two letters does not register. "ĐO" and "DỰ" in this real
    // shipped line are invisible to it; "PHÉP" and "BÁO" are what it sees.
    // Three is the threshold the sibling US tests use and this file keeps it
    // for consistency, but a future pass tightening it should expect this
    // fixture to gain entries rather than assume it was already clean.
    expect(
      shoutedRuns([
        "theo hai số đọc CPI là một PHÉP ĐO chính xác, còn theo một tỷ lệ giả định là một PHÉP DỰ BÁO",
      ]),
    ).toEqual(["PHÉP", "BÁO"]);
    expect(shoutedRuns(["một PHÉP ĐO"]).includes("ĐO")).toBe(false);
    expect(
      shoutedRuns(["Tỷ lệ bình quân mỗi năm được SUY RA từ hai số đọc"]),
    ).toEqual(["SUY"]);
    // The allowlist must not swallow a real shout beside an allowed token.
    expect(shoutedRuns(["chuỗi CPI cũng được ĐIỀU CHỈNH theo thời gian"])).toEqual(
      ["ĐIỀU", "CHỈNH"],
    );
    expect(shoutedRuns(["Tra từ BLS, chuỗi CPI-U, tính bằng USD"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });

  it("names the market in the H1", () => {
    expect(C.pageTitle).toContain("Hoa Kỳ");
  });
});

describe("lam-phat-hoa-ky at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "1.000" through parseDecimal is 1 — a 1000x error on the one money
    // field. The two CPI readings are magnitudes with a decimal comma, so
    // they are parseDecimal: parseMoney("172,2") would not read the comma
    // as a decimal point.
    expect(shippedInput()).toEqual({
      mode: "cpi",
      amount: 1_000,
      startCpi: 172.2,
      endCpi: 320,
      years: 25,
      ratePercent: 3,
    });
  });

  it("opens in measurement mode, which is the mode with a real answer", () => {
    // The lede's whole distinction collapses if the page opens on the
    // forecast.
    expect(shippedInput().mode).toBe("cpi");
    expect(run().deflation).toBe(false);
  });

  it("quotes the equivalent amount and both purchasing-power figures", () => {
    const r = run();
    expect(usd(r.equivalentAmount)).toBe("1.858,30");
    expect(pct(r.cumulativeInflationPercent)).toBe("85,83%");
    expect(formatPercent(r.annualRatePercent!, 4)).toBe("2,5096%");
    expect(formatDecimal(r.purchasingPowerOfOne, 4)).toBe("0,5381");
    expect(pct(r.purchasingPowerLostPercent)).toBe("46,19%");
    expect(formatDecimal(r.yearsToHalvePower!, 2)).toBe("27,96");
    for (const figure of ["85,83%", "0,5381", "46,19%"]) {
      expect(C.formula.body[3], `formula.body[3] is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("keeps purchasing-power lost strictly below cumulative inflation, swept", () => {
    // conflationNotice claims this holds at every level and never reaches
    // 100%. Swept rather than spot-checked, which is the claim's own promise.
    for (const endCpi of [180, 250, 344.4, 1_000, 17_220]) {
      const r = run({ endCpi });
      expect(r.purchasingPowerLostPercent).toBeLessThan(
        r.cumulativeInflationPercent,
      );
      expect(r.purchasingPowerLostPercent).toBeLessThan(100);
      expect(r.purchasingPowerLostPercent).toBeGreaterThan(0);
    }
  });

  it("proves the doubling and tripling figures the notice teaches with", () => {
    // Exactly 2x prices: 100% inflation, 50% of purchasing power lost.
    const doubled = run({ startCpi: 100, endCpi: 200 });
    expect(pct(doubled.cumulativeInflationPercent)).toBe("100,00%");
    expect(pct(doubled.purchasingPowerLostPercent)).toBe("50,00%");
    // Exactly 3x: 200% inflation, 66,67% lost.
    const tripled = run({ startCpi: 100, endCpi: 300 });
    expect(pct(tripled.cumulativeInflationPercent)).toBe("200,00%");
    expect(pct(tripled.purchasingPowerLostPercent)).toBe("66,67%");
    for (const figure of ["100%", "50%", "200%", "66,67%"]) {
      expect(C.conflationNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("defines the halving year by round trip rather than by its formula", () => {
    // body[4]'s own promise: put the halving period back in and purchasing
    // power must land on exactly 0,5.
    const r = run();
    const atHalving = run({
      mode: "rate",
      ratePercent: r.annualRatePercent!,
      years: r.yearsToHalvePower!,
    });
    expect(atHalving.purchasingPowerOfOne).toBeCloseTo(0.5, 12);
  });

  it("recomposes the derived annual rate back into the CPI ratio", () => {
    // body[1] claims 12 decimal places. Asserted at that precision.
    const r = run();
    const input = shippedInput();
    const recomposed = (1 + r.annualRatePercent! / 100) ** input.years;
    expect(recomposed).toBeCloseTo(input.endCpi / input.startCpi, 12);
    expect(C.formula.body[1]).toContain("12 chữ số thập phân");
  });

  it("treats deflation as extra purchasing power, never as a halving", () => {
    const r = run({ startCpi: 320, endCpi: 172.2 });
    expect(r.deflation).toBe(true);
    expect(r.purchasingPowerLostPercent).toBeLessThan(0);
    expect(r.yearsToHalvePower).toBeNull();
    expect(C.form.deflationNotice).toContain("số âm");
    expect(C.form.neverHalves).toContain("Không bao giờ");
  });

  it("keeps the rate mode honest about being a forecast", () => {
    const r = run({ mode: "rate" });
    expect(usd(r.equivalentAmount)).toBe("2.093,78");
    expect(formatDecimal(r.yearsToHalvePower!, 2)).toBe("23,45");
    expect(C.form.rateModeNotice).toContain("dự báo");
    // And the two CPI fields must not influence it, which is that notice's
    // own claim.
    const otherCpi = run({ mode: "rate", startCpi: 1, endCpi: 999 });
    expect(otherCpi.equivalentAmount).toBeCloseTo(r.equivalentAmount, 10);
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
 *
 * Worth stating plainly for this row in particular, because it is the row
 * where new copy landed: a lede clause and a FAQ item were ADDED here on
 * 2026-09-16 and neither is emphasised. Copy is not a reading investment;
 * declared emphasis phrases are.
 */
describe("lam-phat-hoa-ky — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("lam-phat-hoa-ky")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("lam-phat-hoa-ky")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "lam-phat-hoa-ky is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("lam-phat-hoa-ky — sources", () => {
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

  it("links the place the reader is told to go", () => {
    // This page refuses to ship a CPI table and tells the reader to look up
    // two readings at BLS. Naming bls.gov in prose without an href was the
    // whole defect: the instruction was there and the link was not.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.every((url) => url.includes("bls.gov")),
      "a source is not on an official BLS host",
    ).toBe(true);
    expect(urls.some((url) => url === "https://www.bls.gov/cpi/")).toBe(true);
    expect(C.form.cpiSourceNotice).toContain("bls.gov");
  });

  it("cites the page that backs the basket claim specifically", () => {
    // The lede and the new FAQ item both rest on it, so it is not optional.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("questions-and-answers")),
      "the basket-composition source is missing",
    ).toBe(true);
  });
});
