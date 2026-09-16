/**
 * Content contracts for `/cong-cu/tiet-kiem-thue-vay-mua-nha/` (plan row 9).
 *
 * WHY THIS FILE EXISTS. It did not. The suite's sharpest lesson about that
 * gap is one file away: an invented "thường 1–3% dư nợ" range survived in
 * `content/calculators/apr-advanced.ts` after three sibling modules each
 * removed the same claim and each added a sweep to its own test. The module
 * with no test kept the claim and became the last live site for it. So the
 * sweeps here run over EVERY string this module exports, and the range list
 * is copied from `apr-advanced.test.ts` / `loan.test.ts` rather than written
 * fresh, because a fresh list is one that can drift from theirs.
 *
 * This row's own gap was SCOPE IN THE HEADING. "Hoa Kỳ" appeared only in
 * `metaTitle`, which never renders, while the slug reads as a Vietnamese
 * home-buying phrase. The shell was never silent — `usRules` puts a
 * United-States notice above the calculator on every US tool — but a reader
 * scanning headings had nothing. Both title and lede now say it, and the
 * first describe block below is what keeps them saying it.
 */
import { describe, expect, it } from "vitest";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { US_MORTGAGE_DEDUCTION as C } from "@/content/calculators/us-mortgage-deduction";
import { formatMoney, formatPercent, parseDecimal, parseMoney } from "@/lib/calc/number";
import {
  computeUsMortgageDeduction,
  type MortgageDeductionInput,
} from "@/lib/calc/us-mortgage-deduction";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §4. */
function shippedInput(): MortgageDeductionInput {
  return {
    loanBalance: parseMoney(D.balance)!,
    annualInterest: parseMoney(D.interest)!,
    vintage: D.vintage,
    filingStatus: D.filingStatus,
    otherItemized: parseMoney(D.otherItemized)!,
    standardDeduction: parseMoney(D.standard)!,
    marginalRatePercent: parseDecimal(D.rate)!,
  };
}

function run(over: Partial<MortgageDeductionInput> = {}) {
  const result = computeUsMortgageDeduction({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUsMortgageDeduction returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const pct = (v: number) => formatPercent(v, 2);

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["USD", "IRS", "SALT"];

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

describe("tiet-kiem-thue-vay-mua-nha's scope is on the page, not only in metadata", () => {
  it("names the market in the H1", () => {
    // `metaTitle` said "Quy định Hoa Kỳ" and the H1 said nothing, so the one
    // marker a reader could see was the shell's own us-rules notice.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(C.metaTitle).toContain("Hoa Kỳ");
  });

  it("says in the lede that it does not apply to a Vietnamese loan", () => {
    // The row's own requirement, in the row's own words. Asserted against
    // the lede rather than against the shared notice, because the shared
    // notice is not this row's to keep.
    expect(C.lede).toContain("Hoa Kỳ");
    expect(C.lede).toContain("Việt Nam");
  });
});

describe("tiet-kiem-thue-vay-mua-nha's copy", () => {
  it("quotes no invented statistical range", () => {
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("shouts nowhere mid-sentence", () => {
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. These three fixtures are lines this module REALLY shipped
    // before 2026-09-16.
    expect(shoutedRuns(["Cách tính sai phóng đại GẤP MƯỜI HAI LẦN."])).toEqual([
      "GẤP",
      "MƯỜI",
      "HAI",
      "LẦN",
    ]);
    expect(
      shoutedRuns(["chỉ có giá trị ở PHẦN VƯỢT khoản khấu trừ chuẩn"]),
    ).toEqual(["PHẦN", "VƯỢT"]);
    // And the allowlist must not swallow a real shout beside an allowed one.
    expect(shoutedRuns(["trần 750.000 USD là con số ẤN ĐỊNH"])).toEqual([
      "ĐỊNH",
    ]);
    expect(shoutedRuns(["Lấy từ ô 1 trên mẫu 1098 do IRS quy định"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});

describe("tiet-kiem-thue-vay-mua-nha at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "400.000" through parseDecimal is 400 — a 1000x error, and this page's
    // whole output is money.
    expect(shippedInput()).toEqual({
      loanBalance: 400_000,
      annualInterest: 24_000,
      vintage: "current",
      filingStatus: "jointOrOther",
      otherItemized: 8_000,
      standardDeduction: 30_000,
      marginalRatePercent: 24,
    });
  });

  it("opens on the case the page exists to correct", () => {
    // A page about the naive calculation overstating the benefit needs a
    // default state where it DOES overstate. Interest is what tips this
    // filer into itemizing, which is the middle of the three cases.
    const r = run();
    expect(r.itemizes).toBe(true);
    expect(r.interestCausesItemizing).toBe(true);
    expect(r.naiveOverstatement).toBeGreaterThan(0);
  });

  it("quotes the itemised ladder and the saving the notice states", () => {
    const r = run();
    expect(usd(r.itemizedWithInterest)).toBe("32.000");
    expect(usd(r.itemizedWithoutInterest)).toBe("8.000");
    expect(usd(r.deductionTaken)).toBe("32.000");
    expect(usd(r.effectiveDeduction)).toBe("2.000");
    expect(usd(r.taxSaving)).toBe("480");
    expect(usd(r.naiveSaving)).toBe("5.760");
    for (const figure of ["32.000", "30.000", "24.000", "2.000", "480", "5.760"]) {
      expect(C.marginalNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("makes the twelve-fold claim arithmetic rather than rhetoric", () => {
    // "gấp mười hai lần" is a ratio the model can be asked for. If a default
    // moves and the ratio stops being twelve, this fails instead of the
    // sentence quietly becoming false.
    const r = run();
    expect(r.naiveSaving / r.taxSaving).toBeCloseTo(12, 10);
    expect(C.marginalNotice).toContain("gấp mười hai lần");
    expect(C.faq.items[1].a).toContain("gấp mười hai lần");
  });

  it("quotes the after-tax rate, and the contract rate it is NOT", () => {
    const r = run();
    const input = shippedInput();
    expect(pct(r.effectiveRatePercent!)).toBe("5,88%");
    // The contract rate the lede contrasts against.
    expect(pct((input.annualInterest / input.loanBalance) * 100)).toBe("6,00%");
    // And the figure the naive calculation would have produced.
    const naive =
      ((input.annualInterest - r.naiveSaving) / input.loanBalance) * 100;
    expect(pct(naive)).toBe("4,56%");
    for (const figure of ["5,88%", "6,00%", "4,56%"]) {
      expect(C.marginalNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("answers zero, not a fraction, for the filer who never itemises", () => {
    // The page's claim about most taxpayers. A reader with small other
    // deductions gets nothing from the loan, and the page says so.
    const r = run({ annualInterest: 4_000, otherItemized: 2_000 });
    expect(r.itemizes).toBe(false);
    expect(r.taxSaving).toBe(0);
    // And the after-tax rate equals the contract rate exactly — the page
    // refuses to discount it "for no reason", which is body[5]'s promise.
    expect(r.effectiveRatePercent).toBeCloseTo(
      (4_000 / shippedInput().loanBalance) * 100,
      10,
    );
    expect(C.form.noBenefitNotice).toContain("không tiết kiệm được đồng thuế nào");
  });

  it("makes the naive calculation correct only in the third case", () => {
    // body[2]'s claim, asserted as a property across the three cases rather
    // than spot-checked on one.
    const alreadyItemising = run({ otherItemized: 40_000 });
    expect(alreadyItemising.taxSaving).toBeCloseTo(
      alreadyItemising.naiveSaving,
      8,
    );
    expect(alreadyItemising.naiveOverstatement).toBeCloseTo(0, 8);
    expect(C.form.fullBenefitNotice).toContain("duy nhất");
  });

  it("carries the statutory caps the sources back, and pro-rates above them", () => {
    // These four are hardcoded in the model because they are statutory and
    // unindexed, which is exactly why they are the figures that need an href.
    expect(run().cap).toBe(750_000);
    expect(run({ vintage: "grandfathered" }).cap).toBe(1_000_000);
    expect(run({ filingStatus: "marriedSeparate" }).cap).toBe(375_000);
    expect(
      run({ vintage: "grandfathered", filingStatus: "marriedSeparate" }).cap,
    ).toBe(500_000);
    // The FAQ's worked pro-rata example: 1.000.000 balance against a
    // 750.000 cap deducts 75% of the interest.
    const over = run({ loanBalance: 1_000_000, otherItemized: 40_000 });
    expect(over.deductibleShare).toBeCloseTo(0.75, 12);
    expect(pct(over.deductibleShare * 100)).toBe("75,00%");
    expect(C.faq.items[3].a).toContain("75%");
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
 * `<strong>` per page while still filed `reference`, with the suite green.
 *
 * P4's standing instruction is "maintain or move to a library until audience
 * evidence justifies more", and `emphasis` is an investment in a page as
 * reading. So if that evidence arrives, the disposition moves FIRST and this
 * test moves with it.
 */
describe("tiet-kiem-thue-vay-mua-nha — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("tiet-kiem-thue-vay-mua-nha")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("tiet-kiem-thue-vay-mua-nha")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "tiet-kiem-thue-vay-mua-nha is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("tiet-kiem-thue-vay-mua-nha — sources", () => {
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

  it("cites the publication the hardcoded caps come from", () => {
    // The two caps are the only figures on this page that are neither
    // arithmetic nor an input, so they are the ones that must be checkable.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("p936")),
      "the acquisition-debt cap source is missing",
    ).toBe(true);
    expect(
      urls.every((url) => url.includes("irs.gov")),
      "a source is not on an official IRS host",
    ).toBe(true);
  });

  it("gives the reader somewhere to get the standard deduction it asks for", () => {
    // The standard deduction is an INPUT precisely because it is indexed, so
    // a page that demands it and does not say where to find it has moved the
    // staleness onto the reader instead of removing it.
    const sourced = C.sources.items.map((i) => `${i.label} ${i.note ?? ""}`).join(" ");
    expect(sourced).toContain("khấu trừ chuẩn");
    expect(C.form.standardHelp).toContain("tra đúng năm thuế");
  });
});
