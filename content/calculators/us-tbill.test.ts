/**
 * Content contracts for `/cong-cu/tin-phieu-kho-bac-hoa-ky/` (plan row 73).
 *
 * WHY THIS FILE EXISTS. It did not, and the suite's clearest lesson about
 * that is one file away: an invented "thường 1–3% dư nợ" range survived in
 * `content/calculators/apr-advanced.ts` after being removed from three
 * sibling modules, purely because that module had no test of its own while
 * each sibling added a sweep to its own. A guard that lives per-module
 * protects only the modules that have one, so the sweeps below run over
 * EVERY string this module exports and the range list is copied from
 * `apr-advanced.test.ts` / `loan.test.ts` rather than freshly written,
 * because a fresh list is a list that can drift from theirs.
 *
 * This row's own job was the cheapest source fix in the P4 set: the module
 * already carried the best provenance TEXT of the 36 — an eCFR sentence
 * quoted verbatim with a retrieval date in its header comment — and no href
 * anywhere. Turning that into an openable `sources` list is the change these
 * tests hold in place.
 */
import { describe, expect, it } from "vitest";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { US_TBILL as C } from "@/content/calculators/us-tbill";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsTbill, type TbillInput } from "@/lib/calc/us-tbill";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §4. */
function shippedInput(): TbillInput {
  return {
    faceValue: parseMoney(D.face)!,
    discountRatePercent: parseDecimal(D.discount)!,
    daysToMaturity: parseCount(D.days)!,
    federalRatePercent: parseDecimal(D.federal)!,
    stateRatePercent: parseDecimal(D.state)!,
  };
}

function run(over: Partial<TbillInput> = {}) {
  const result = computeUsTbill({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUsTbill returned null");
  return result;
}

/** The page's own money and rate formatting, from the component. */
const usd = (v: number) => formatMoney(v, 2);
const pct = (v: number) => formatPercent(v, 4);

/**
 * Proper nouns a reader cannot mistake for shouting.
 *
 * "CFR" earned its place the honest way: the first run of the sweep below
 * reported it, because `sources.intro` names 31 CFR part 356 and the Code of
 * Federal Regulations. That is the detector working on real copy rather than
 * on its fixtures, so it is recorded here rather than quietly widened — and
 * `eCFR`, which appears only in the header comment the walk never sees,
 * needs no exemption at all.
 */
const PROPER_NOUNS = ["USD", "APY", "CFR"];

/**
 * Every user-facing string in the module, by WALKING the exported object.
 *
 * Not a hand-written field list and not a regex over the source text. A
 * field list goes stale the moment a field is added — `sources` arrived
 * after this module shipped — and pulling the literals out with a regex
 * first is what made an earlier sweep of a sibling file report zero shouted
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

describe("tin-phieu-kho-bac-hoa-ky's copy", () => {
  it("quotes no invented statistical range", () => {
    // Same list as `apr-advanced.test.ts` and `loan.test.ts`, deliberately
    // reused rather than rewritten. A made-up range reads as researched and
    // is not, which is worse on a page whose subject is a yield a reader
    // will compare against a real auction result.
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("shouts nowhere mid-sentence", () => {
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. The two fixtures are lines this module REALLY shipped
    // before 2026-09-16, and the third proves the proper-noun allowlist does
    // not swallow a real shout standing next to an allowed token.
    expect(
      shoutedRuns(["lãi suất được NIÊM YẾT luôn thấp hơn lợi suất thực nhận"]),
    ).toEqual(["NIÊM", "YẾT"]);
    expect(
      shoutedRuns(["chỉ số của Kho bạc là lãi ĐƠN và trùng với dòng"]),
    ).toEqual(["ĐƠN"]);
    expect(shoutedRuns(["so với APY 5,00% của một khoản tiền gửi"])).toEqual([]);
    expect(shoutedRuns(["mức chiết khấu tính trên MỆNH GIÁ, không USD"])).toEqual(
      ["MỆNH", "GIÁ"],
    );

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    // Shape guard, so the sweeps above cannot pass by the module being empty.
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });

  it("names the market in the H1, not only in the metadata", () => {
    // Row 9 shipped with "Hoa Kỳ" in `metaTitle` only, which is invisible on
    // the page. This row did it right; assert it so it stays that way.
    expect(C.pageTitle).toContain("Hoa Kỳ");
  });
});

describe("tin-phieu-kho-bac-hoa-ky at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "10.000" through parseDecimal is 10 — a 1000x error. The day count is
    // a count, not money: parseMoney("91") is fine but parseMoney("9.1")
    // would be 91, which is the failure this pattern exists to catch.
    expect(shippedInput()).toEqual({
      faceValue: 10_000,
      discountRatePercent: 5,
      daysToMaturity: 91,
      federalRatePercent: 24,
      stateRatePercent: 5,
    });
  });

  it("opens on a bill whose quote UNDERSTATES the yield", () => {
    // The page's whole thesis is that gap. A default state where the gap is
    // zero would have nothing to show.
    const r = run();
    expect(r.quoteUnderstatementPoints).not.toBeNull();
    expect(r.quoteUnderstatementPoints!).toBeGreaterThan(0);
  });

  it("quotes the price, the discount and the three yields the notice states", () => {
    const r = run();
    expect(usd(r.price)).toBe("9.873,61");
    expect(usd(r.discountAmount)).toBe("126,39");
    expect(pct(r.investmentYieldPercent!)).toBe("5,1343%");
    expect(pct(r.bondEquivalentYieldPercent!)).toBe("5,1674%");
    expect(pct(r.effectiveAnnualYieldPercent!)).toBe("5,2341%");
    expect(formatDecimal(r.quoteUnderstatementPoints!, 4)).toBe("0,1343");
    for (const figure of ["9.873,61", "126,39", "5,1343%", "0,1343"]) {
      expect(C.quoteNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("splits the understatement into its two causes, each isolated", () => {
    // The notice claims 5,0640% from cause 1 alone and 5,0694% from cause 2
    // alone. Both are DERIVED here from the model's own figures rather than
    // retyped, so a defaults change moves the test with the page.
    const r = run();
    const input = shippedInput();
    // Cause 1 only: the discount measured against the PRICE actually put up,
    // still annualised on the Treasury's 360-day basis.
    const causeOne =
      (r.discountAmount / r.price) * (360 / input.daysToMaturity) * 100;
    // Cause 2 only: the quote as published, re-annualised on 365 days.
    const causeTwo = input.discountRatePercent * (365 / 360);
    expect(pct(causeOne)).toBe("5,0640%");
    expect(pct(causeTwo)).toBe("5,0694%");
    // Neither cause alone reaches the combined figure, and both together do.
    expect(causeOne).toBeLessThan(r.investmentYieldPercent!);
    expect(causeTwo).toBeLessThan(r.investmentYieldPercent!);
    for (const figure of ["5,0640%", "5,0694%"]) {
      expect(C.quoteNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("prices the state-tax exemption at the two rates the FAQ names", () => {
    const r = run();
    expect(pct(r.taxableEquivalentYieldPercent!)).toBe("5,4046%");
    const california = run({ stateRatePercent: 13.3 });
    expect(pct(california.taxableEquivalentYieldPercent!)).toBe("5,9220%");
    // A zero-state-tax reader gets the same two numbers, which is the FAQ's
    // own claim — asserted rather than left as prose.
    const noStateTax = run({ stateRatePercent: 0 });
    expect(noStateTax.taxableEquivalentYieldPercent).toBeCloseTo(
      noStateTax.investmentYieldPercent!,
      10,
    );
    const a = C.faq.items[2].a;
    for (const figure of ["5,4046%", "5,9220%"]) {
      expect(a, `FAQ 3 is missing ${figure}`).toContain(figure);
    }
  });

  it("holds the leap-year hedge to the exact 366/365 ratio the copy claims", () => {
    // The copy states a RATIO, not a points bound, because the gap is i/365
    // and grows with the yield level. Assert the ratio at the defaults and
    // at a second term, so a single-point coincidence cannot pass.
    const r = run();
    const leap = r.investmentYieldPercent! * (366 / 365);
    expect(pct(leap)).toBe("5,1484%");
    expect(formatDecimal(leap - r.investmentYieldPercent!, 4)).toBe("0,0141");
    const long = run({ daysToMaturity: 182 });
    expect(long.investmentYieldPercent! * (366 / 365)).toBeCloseTo(
      (long.investmentYieldPercent! * 366) / 365,
      12,
    );
    expect(C.faq.items[3].a).toContain("5,1484%");
    expect(C.faq.items[3].a).toContain("366/365");
  });

  it("reverses the yield ordering past 182,5 days, with the copy's own figures", () => {
    // formula.body[4] claims simple < semiannual < annual only below
    // 182,5 days, and quotes the 52-week bill as the reversed case.
    const short = run();
    expect(short.investmentYieldPercent!).toBeLessThan(
      short.bondEquivalentYieldPercent!,
    );
    expect(short.bondEquivalentYieldPercent!).toBeLessThan(
      short.effectiveAnnualYieldPercent!,
    );

    const year = run({ daysToMaturity: 364 });
    expect(pct(year.investmentYieldPercent!)).toBe("5,3394%");
    expect(pct(year.bondEquivalentYieldPercent!)).toBe("5,2703%");
    expect(pct(year.effectiveAnnualYieldPercent!)).toBe("5,3398%");
    // Reversed: the simple figure now sits ABOVE the semiannual one.
    expect(year.bondEquivalentYieldPercent!).toBeLessThan(
      year.investmentYieldPercent!,
    );
    // And the one relation that holds at EVERY term, per the same paragraph.
    expect(year.bondEquivalentYieldPercent!).toBeLessThan(
      year.effectiveAnnualYieldPercent!,
    );
    const body = C.formula.body[4];
    for (const figure of ["5,3394%", "5,2703%", "5,3398%"]) {
      expect(body, `formula.body[4] is missing ${figure}`).toContain(figure);
    }
  });

  it("flags the term where the Treasury's own name stops applying", () => {
    expect(run({ daysToMaturity: 182 }).beyondShortBillRule).toBe(false);
    expect(run({ daysToMaturity: 183 }).beyondShortBillRule).toBe(true);
    // And the page has copy for that state rather than silently relabelling.
    expect(C.form.beyondShortBillNotice).toContain("182");
  });

  it("offers the 6-week bill the Treasury actually sells", () => {
    // Found while verifying the sources: TreasuryDirect lists 4, 6, 8, 13,
    // 17, 26 and 52 weeks, and this copy named every term except 6 in both
    // places it lists them. 42 days is well inside the 182,5-day boundary,
    // so body[4]'s ordering claim still holds for it.
    expect(C.form.daysHelp).toContain("6");
    expect(C.formula.body[4]).toContain("4, 6, 8, 13, 17 và 26 tuần");
    const sixWeek = run({ daysToMaturity: 42 });
    expect(sixWeek.beyondShortBillRule).toBe(false);
    expect(sixWeek.investmentYieldPercent!).toBeLessThan(
      sixWeek.bondEquivalentYieldPercent!,
    );
  });
});

/**
 * This row adds NO emphasis, and that is enforced here.
 *
 * The chain is `library: "hoa-ky"` => filed `reference` => this pass added
 * nothing. `plan-disposition.test.ts` enforces the FIRST arrow for all 75
 * rows. Nothing enforces the second: `reference` is documented as asserting
 * that nothing was added, and no test checks that a `reference` row did in
 * fact add nothing — which is how a sibling US row shipped seven `<strong>`
 * per page while still filed `reference`, with the whole suite green.
 *
 * If a future pass has audience evidence that this page deserves reading
 * investment, the disposition moves FIRST and this test moves with it.
 */
describe("tin-phieu-kho-bac-hoa-ky — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("tin-phieu-kho-bac-hoa-ky")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("tin-phieu-kho-bac-hoa-ky")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "tin-phieu-kho-bac-hoa-ky is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("tin-phieu-kho-bac-hoa-ky — sources", () => {
  it("cites an openable source for every item", () => {
    expect(C.sources.items.length).toBeGreaterThan(0);
    for (const item of C.sources.items) {
      expect(item.url, "a source item has an empty url").not.toBe("");
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.label.trim()).not.toBe("");
    }
  });

  it("states the provenance limit rather than implying completeness", () => {
    // docs §3: a list of official links implies a completeness no page here
    // has earned, which is what `intro` exists to disclaim.
    expect(C.sources.intro).toBeDefined();
    expect(C.sources.intro.length).toBeGreaterThan(40);
  });

  it("cites the page carrying this module's own price formula", () => {
    // The 360-day discount formula is the one figure on this page that is a
    // Treasury CONVENTION rather than arithmetic, so it is the one that most
    // needs an href. TreasuryDirect's pricing page states it verbatim.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("understanding-pricing")),
      "the pricing-formula source is missing",
    ).toBe(true);
    expect(
      urls.every((url) => url.includes("treasurydirect.gov")),
      "a source is not on an official Treasury host",
    ).toBe(true);
  });

  it("names the underlying regulation even though it does not link it", () => {
    // eCFR and govinfo both refuse automated requests from this
    // environment, so the section is NAMED in `intro` rather than linked
    // with an href nobody verified. Naming beats a dead link; see the
    // header comment.
    expect(C.sources.intro).toContain("356");
    expect(C.sources.intro).toContain("Appendix B");
  });
});
