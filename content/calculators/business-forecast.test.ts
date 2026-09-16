/**
 * Content contracts for `/cong-cu/du-bao-kinh-doanh/` (plan row 64).
 *
 * WHY THIS FILE EXISTS. The module had no content test, and two of the three
 * things it guards are in the class docs §6 (T11) describes as invisible to a
 * green run: a prefilled statutory tax rate, and eleven figures quoted in a
 * notice that nothing bound to the engine. `components/business-forecast-
 * calculator.test.ts` covers the parser choice on the base year and nothing
 * else; `lib/calc/forecast.test.ts` covers the arithmetic against its own
 * fixture and never reads this module's defaults.
 *
 * THE TAX BAND GUARD is the reason to read this file before changing a
 * default. The rate a Vietnamese company pays has depended on its revenue
 * since 01/10/2025, so the prefilled `tax` and the prefilled `revenue` are
 * not independent choices — and the test below refuses to let one move
 * without the other.
 */
import { describe, expect, it } from "vitest";

import { computeForecast } from "@/lib/calc/forecast";
import {
  formatDecimal,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { BUSINESS_FORECAST as C } from "@/content/calculators/business-forecast";

/**
 * The rate bands of Điều 10, Luật Thuế thu nhập doanh nghiệp 67/2025/QH15,
 * in đồng of annual revenue. Cited on the page itself; see `C.sources`.
 *
 * Held here as data rather than as three `if`s so the band guard reads as the
 * statute does, and so the exemption floor is visible beside the tiers.
 */
const CIT_BANDS = [
  { upTo: 1e9, percent: 0 },
  { upTo: 3e9, percent: 15 },
  { upTo: 50e9, percent: 17 },
  { upTo: Infinity, percent: 20 },
] as const;

const bandFor = (revenue: number) =>
  CIT_BANDS.find((b) => revenue <= b.upTo)!.percent;

/** The eight shipped form strings, each through the parser its field needs. */
const shippedInput = () => ({
  baseRevenue: parseMoney(C.form.defaults.revenue)!,
  revenueGrowthPercent: parseDecimal(C.form.defaults.growth)!,
  variableCostPercent: parseDecimal(C.form.defaults.variable)!,
  baseFixedCost: parseMoney(C.form.defaults.fixed)!,
  fixedCostGrowthPercent: parseDecimal(C.form.defaults.fixedGrowth)!,
  years: parseCount(C.form.defaults.years)!,
  baseYear: parseCount(C.form.defaults.baseYear)!,
  taxPercent: parseDecimal(C.form.defaults.tax)!,
});

const run = () => computeForecast(shippedInput())!;

/** Every user-facing string in the module, by WALKING the exported object. */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["FinHome", "CAGR", "PDF"];

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

/**
 * đồng in tỷ, spelled the way the notice spells it.
 *
 * Two decimals, with a trailing ",00" trimmed — the copy writes "10 tỷ" and
 * "17,49 tỷ", not "10,00 tỷ". The trim is here rather than in the copy
 * because the comparison has to run in the copy's own register or it fails on
 * correct prose, which is what the first draft of this helper did.
 */
const ty = (dong: number) =>
  formatDecimal(dong / 1e9, 2).replace(/,00$/, "");

describe("du-bao-kinh-doanh at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // `years` and `baseYear` are counts: `parseMoney("3.0")` is 30, and it
    // eats the dot BEFORE any `Number.isInteger` guard runs, which is how a
    // typed 3 became a 30-year forecast (docs §4).
    expect(shippedInput()).toEqual({
      baseRevenue: 10_000_000_000,
      revenueGrowthPercent: 15,
      variableCostPercent: 60,
      baseFixedCost: 3_000_000_000,
      fixedCostGrowthPercent: 8,
      years: 5,
      baseYear: 2026,
      taxPercent: 17,
    });
  });

  it("prefills the tax rate the prefilled REVENUE actually falls in", () => {
    // The guard that makes the two defaults one decision. Since 01/10/2025 the
    // rate is set by total annual revenue — 15% up to 3 tỷ, 17% to 50 tỷ, 20%
    // above, and exempt at or below 1 tỷ — so prefilling 20% beside a 10 tỷ
    // revenue overstated the tax on this tool's own opening state by three
    // percentage points, on every year of the forecast. That is docs §8
    // defect 8's shape: a prefilled tax parameter the law moved under.
    //
    // Whoever changes either default will land here. Change both.
    const input = shippedInput();
    expect(input.taxPercent).toBe(bandFor(input.baseRevenue));

    // And the band has to hold for the WHOLE default horizon, not just year
    // one — a forecast that grows out of its band mid-horizon would need two
    // runs, which the tax field's help says.
    const years = run().years;
    for (const row of years) expect(bandFor(row.revenue)).toBe(input.taxPercent);
    expect(years.at(-1)!.revenue).toBeLessThan(50e9);
    expect(years[0].revenue).toBeGreaterThan(3e9);
  });

  it("quotes no figure that the tax rate can move", () => {
    // Why the rate could be corrected without touching a word of the prose:
    // every figure this module quotes is PRE-tax. Rather than asserting that
    // by reading the copy, run the model at both rates and require each
    // quoted quantity to be identical — docs §8 defect 19's lesson is that a
    // number in a sentence is an unwritten fixture, and this is the fixture.
    const at17 = computeForecast({ ...shippedInput(), taxPercent: 17 })!;
    const at20 = computeForecast({ ...shippedInput(), taxPercent: 20 })!;

    for (const key of [
      "finalRevenue",
      "finalOperatingProfit",
      "finalMarginPercent",
      "marginChangePoints",
      "totalRevenue",
      "totalCost",
      "totalOperatingProfit",
    ] as const) {
      expect(at17[key], `${key} moved with the tax rate`).toBe(at20[key]);
    }
    // And the two that SHOULD move, so this is not a vacuous comparison.
    expect(at17.totalProfitAfterTax).not.toBe(at20.totalProfitAfterTax);
    expect(at17.totalProfitAfterTax).toBeGreaterThan(at20.totalProfitAfterTax);
  });
});

describe("du-bao-kinh-doanh's notice, which used to read as a conclusion", () => {
  const r = run();
  const notice = C.leverageNotice;

  it("names the inputs as assumptions BEFORE reading anything off them", () => {
    // The row's requirement, and the single highest-value edit on it. The
    // notice fills the one red box above the calculator and opened "Với các
    // số mặc định, doanh thu tăng từ 10 tỷ lên 17,49 tỷ… gấp gần ba lần" — a
    // growth story in the most prominent slot on the page. The lesson existed
    // twice, in FAQ item 4 and in `formula.body`'s last paragraph, both BELOW
    // the calculator, where a reader who takes the headline never reaches it.
    expect(notice).toContain("giả định");
    // The word has to come before any figure, or "assumptions" is a footnote
    // to a conclusion rather than the frame for one.
    const firstFigure = notice.search(/\d/);
    expect(notice.indexOf("giả định")).toBeLessThan(firstFigure);
    // And it has to say what the table IS, not only what the inputs are.
    expect(notice).toContain("không phải dữ liệu");
    expect(notice).toContain("xảy ra nếu");
  });

  it("keeps the operating-leverage teaching AND the experiment that tests it", () => {
    // Requalifying must not cost the page its content. The mechanism and the
    // falsifiable check both survive: set fixed-cost growth to the revenue
    // growth and the margin stops moving.
    expect(notice).toContain("đòn bẩy hoạt động");
    expect(notice).toContain("định phí");
    expect(notice).toContain(`${C.form.defaults.fixedGrowth}%/năm`);
    expect(notice).toContain(`${C.form.defaults.growth}%/năm`);
    // The experiment: the same rate on both, and the margin that results.
    expect(notice).toContain("đặt tăng trưởng định phí bằng 15%");
  });

  it("quotes the figures the engine really produces", () => {
    expect(notice).toContain(`${ty(r.years[0].revenue)} tỷ`);
    expect(notice).toContain(`${ty(r.finalRevenue)} tỷ`);
    expect(notice).toContain(`${ty(r.years[0].operatingProfit)} tỷ`);
    expect(notice).toContain(`${ty(r.finalOperatingProfit)} tỷ`);
    expect(notice).toContain(formatPercent(r.years[0].operatingMarginPercent!, 2));
    expect(notice).toContain(formatPercent(r.finalMarginPercent!, 2));
  });

  it("is telling the truth about the experiment", () => {
    // The claim is that equal growth rates freeze the margin at year one's.
    // Asserted against the model rather than taken on trust, because it is
    // the one thing in the notice a reader is invited to reproduce.
    const flat = computeForecast({
      ...shippedInput(),
      fixedCostGrowthPercent: shippedInput().revenueGrowthPercent,
    })!;
    for (const row of flat.years) {
      expect(formatPercent(row.operatingMarginPercent!, 2)).toBe("10,00%");
    }
    expect(flat.marginChangePoints).toBeCloseTo(0, 10);
  });
});

describe("du-bao-kinh-doanh's citations", () => {
  it("gives every source a real, non-empty https url", () => {
    // The point of the slot: a reader can open it. A `sources` block whose
    // items carry an empty or relative url is a "Nguồn" heading over nothing,
    // which docs §3 says is worse than no heading.
    expect(C.sources.items.length).toBeGreaterThanOrEqual(1);
    for (const item of C.sources.items) {
      expect(item.url.trim().length).toBeGreaterThan(10);
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.label.trim().length).toBeGreaterThan(10);
    }
  });

  it("cites the law the prefilled rate comes from, by number", () => {
    const notes = C.sources.items.map((i) => `${i.label} ${i.note ?? ""}`).join(" ");
    expect(notes).toContain("67/2025/QH15");
    // All three bands named in the help must be traceable to a note.
    for (const band of ["15%", "17%", "20%"]) expect(notes).toContain(band);
    expect(C.form.taxHelp).toContain("15%");
    expect(C.form.taxHelp).toContain("17%");
    expect(C.form.taxHelp).toContain("20%");
  });

  it("states the provenance limit rather than implying completeness", () => {
    // docs §3: `intro` is where the limit goes, because a list of official
    // links implies a completeness no page here has earned. The specific
    // limits that matter on THIS page are the three things it does not model.
    const intro = C.sources.intro;
    expect(intro).toContain("không phải tư vấn thuế");
    expect(intro).toContain("chuyển lỗ");
    expect(intro).toContain("không tự đổi thuế suất");
  });
});

describe("du-bao-kinh-doanh's copy hygiene", () => {
  it("shouts at nobody", () => {
    // Vacuity fixtures FIRST, using lines this module really shipped: a sweep
    // that reports zero is indistinguishable from a broken sweep, and this
    // check has reported a false zero before.
    expect(shoutedRuns(["Thuế tính trên lợi nhuận của TỪNG NĂM"])).toEqual([
      "TỪNG",
      "NĂM",
    ]);
    expect(shoutedRuns(["Tăng trưởng tính KÉP. Ở kỳ 10 năm"])).toEqual(["KÉP"]);
    expect(shoutedRuns(["một tỷ lệ trên doanh thu CỦA CHÍNH NĂM ĐÓ"])).toEqual([
      "CỦA",
      "CHÍNH",
      "NĂM",
    ]);
    // A proper noun is not shouting.
    expect(shoutedRuns(["Công cụ miễn phí của FinHome."])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("quotes no invented statistical range", () => {
    // Same list as `loan.test.ts`, `auto-lease.test.ts` and
    // `apr-advanced.test.ts` rather than a new one that could drift.
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"])
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
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
    // Sentence case, so marking a phrase REPLACES the shouting rather than
    // wrapping `<strong>` around capitals.
    expect(shoutedRuns([...C.formula.emphasis])).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});
