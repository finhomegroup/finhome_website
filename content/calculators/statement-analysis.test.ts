/**
 * Content contracts for `/cong-cu/phan-tich-bao-cao-tai-chinh/` (plan row 66).
 *
 * WHY THIS FILE EXISTS. `components/statement-analysis-calculator.test.ts`
 * guards the DuPont change column's unit and `lib/calc/financials.test.ts`
 * guards the arithmetic. Neither reads this module's prose — and the most
 * load-bearing sentence on the page is a pair of COUNTERFACTUALS in
 * `duPontNotice` ("nếu chỉ biên lợi nhuận thuần đổi, ROE đã là 17,63%"), which
 * no test could see. A counterfactual is the easiest kind of claim to get
 * wrong and the hardest for a reader to check, so it is pinned here against
 * the model.
 *
 * The consolidation this unit performed is asserted from both sides: this
 * file, and `content/calculators/financial-ratios.test.ts`.
 */
import { describe, expect, it } from "vitest";

import { readStatement, STATEMENT_KEYS } from "@/components/calc/financials-fields";
import { computeAnalysis } from "@/lib/calc/financials";
import { formatDecimal, formatPercent, parseMoney } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { FINANCIAL_RATIOS } from "@/content/calculators/financial-ratios";
import { STATEMENT_ANALYSIS as C } from "@/content/calculators/statement-analysis";

/**
 * Band for "the module reproduces a counterfactual computed the other way".
 *
 * Both sides multiply three floats; the module divides then multiplies, the
 * reference multiplies the module's own components. Two routes to one number,
 * so a band and not equality — docs §8's rule. At ROE magnitudes around 17
 * points, 1,7 ulp is ~4e-15, so 1e-10 points leaves four decades of headroom
 * while staying ~5e7 times tighter than the 2-dp cell the figure is printed
 * into.
 */
const COUNTERFACTUAL_BAND_POINTS = 1e-10;

function prefixed(defaults: Record<string, string>, prefix: string) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(defaults)) out[`${prefix}${key}`] = value;
  return out;
}

const values = () => ({
  ...prefixed(C.form.currentDefaults, "cur_"),
  ...prefixed(C.form.priorDefaults, "pri_"),
});

/** The module's own output at the shipped two periods. */
function shipped() {
  const v = values();
  return computeAnalysis({
    current: readStatement(v, "cur_").input!,
    prior: readStatement(v, "pri_").input!,
  })!;
}

/** Every user-facing string in the module, by WALKING the exported object. */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/** Proper nouns and ratio initialisms a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["FinHome", "DuPont", "ROE", "ROA", "EPS"];

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

describe("phan-tich-bao-cao-tai-chinh's consolidation with row 65", () => {
  it("takes the thirteen statement labels from the ratio page, not a copy", () => {
    // The unit's definition of done, from the importing side. Object
    // IDENTITY, because two equal objects can be edited apart and that is the
    // whole failure mode: the superseded local copy had already drifted on
    // all thirteen lines.
    expect(C.statement).toBe(FINANCIAL_RATIOS.statement);
    expect(C.form.currentDefaults).toBe(FINANCIAL_RATIOS.form.defaults);

    // The help strings this page now shows are the substantive ones. The
    // local copy reduced every balance-sheet line to "Số dư cuối kỳ.", which
    // told a reader nothing about what belongs on the line.
    //
    // Widened to `string[]` deliberately. The content object is `as const`,
    // so with the narrow literal union `tsc` reports TS2367 on the
    // comparison below — "these types have no overlap" — which is true
    // STATICALLY and is exactly what a reader of this test needs to survive a
    // future edit: the guard has to keep working if someone reintroduces the
    // string, and a comparison the compiler has already decided is impossible
    // would be deleted rather than run. `vitest` was green on the narrow
    // version; `tsc` was not, which is why the gate runs both.
    const helps: string[] = STATEMENT_KEYS.map((k) => C.statement.lines[k].help);
    expect(helps.filter((h) => h === "Số dư cuối kỳ.")).toEqual([]);
    expect(C.statement.lines.inventory.help).toContain("thanh toán nhanh");
    expect(C.statement.lines.interestExpense.help).toContain("khả năng trả lãi");
  });

  it("keeps the closing-balance qualification, which MOVED rather than vanished", () => {
    // What sharing the labels cost this page: thirteen repetitions of "Số dư
    // cuối kỳ." It is not lost — it is stated once, for both periods at once,
    // in the method section, which is the honest place for a property of how
    // the tool reads a balance sheet rather than of any one field. Assert it
    // MOVED; a test that only checked the old string was gone would pass on a
    // page that had simply dropped the caveat.
    const body = C.formula.body.join(" ");
    expect(body).toContain("số dư cuối kỳ");
    expect(body).toContain("cả hai kỳ");
    expect(body).toContain("mười ba dòng");
    // And it says what it is NOT, which is the half a reader comparing
    // against a published figure needs.
    expect(body).toContain("không phải số dư bình quân");
  });

  it("marks each period without putting two em-dashes in one heading", () => {
    // The group titles now name their source statement and already contain an
    // em-dash, so the period suffix is parenthetical. Reads as
    // "Bảng cân đối kế toán — tài sản (kỳ này)".
    expect(C.form.currentSuffix).toContain("kỳ này");
    expect(C.form.priorSuffix).toContain("kỳ trước");
    for (const suffix of [C.form.currentSuffix, C.form.priorSuffix]) {
      expect(suffix).not.toContain("—");
      expect(suffix.trim().startsWith("(")).toBe(true);
    }
  });
});

describe("phan-tich-bao-cao-tai-chinh at its shipped two periods", () => {
  const r = shipped();

  it("reads every line of BOTH periods with the MONEY grammar", () => {
    const v = values();
    const current = readStatement(v, "cur_");
    const prior = readStatement(v, "pri_");
    expect(current.input).not.toBeNull();
    expect(prior.input).not.toBeNull();
    for (const key of STATEMENT_KEYS) {
      expect(current.invalid[key], `cur_${key} rejected`).toBe(false);
      expect(prior.invalid[key], `pri_${key} rejected`).toBe(false);
      expect(parseMoney(C.form.priorDefaults[key])).toBe(prior.input![key]);
    }
    // The two periods must actually differ, or every delta on the page is 0
    // and the whole tool has nothing to show.
    expect(prior.input!.revenue).not.toBe(current.input!.revenue);
  });

  it("prints the two-period figures its own prose quotes", () => {
    const copy = userFacingStrings(C).join(" ");
    expect(copy).toContain(formatPercent(r.current.returnOnEquityPercent!, 2));
    expect(copy).toContain(formatPercent(r.prior.returnOnEquityPercent!, 2));
    expect(copy).toContain(formatDecimal(r.returnOnEquityChangePoints!, 2));

    const revenue = r.lines.find((l) => l.key === "revenue")!;
    const netProfit = r.lines.find((l) => l.key === "netProfit")!;
    expect(copy).toContain(formatPercent(revenue.changePercent!, 2));
    expect(copy).toContain(formatPercent(netProfit.changePercent!, 2));

    // The page's headline reading: profit grew faster than revenue, which is
    // the margin expanding. If that ever stopped being true of the shipped
    // defaults, `formula.body[0]` would be teaching the opposite.
    expect(netProfit.changePercent!).toBeGreaterThan(revenue.changePercent!);
  });

  it("verifies the DuPont counterfactuals the notice asserts", () => {
    // The most load-bearing sentence on the page, and nothing checked it. It
    // holds two of the three drivers at the prior period and moves one:
    // margin alone gives 17,63%, leverage alone gives 13,55%, against an
    // actual move from 13,06% to 19,20%. That pair is what licenses the
    // claim that margin did the work and borrowing did almost none — reverse
    // them and the page's conclusion reverses with them.
    const cur = r.currentDuPont;
    const pri = r.priorDuPont;

    const marginOnly = cur.netMargin! * pri.assetTurnover! * pri.equityMultiplier! * 100;
    const leverageOnly = pri.netMargin! * pri.assetTurnover! * cur.equityMultiplier! * 100;

    expect(formatPercent(marginOnly, 2)).toBe("17,63%");
    expect(formatPercent(leverageOnly, 2)).toBe("13,55%");
    expect(C.duPontNotice).toContain(formatPercent(marginOnly, 2));
    expect(C.duPontNotice).toContain(formatPercent(leverageOnly, 2));

    // The ORDERING is the claim, not the two numbers: moving margin alone
    // must explain most of the rise, and moving leverage alone almost none.
    const actual = r.current.returnOnEquityPercent!;
    const before = r.prior.returnOnEquityPercent!;
    expect(marginOnly - before).toBeGreaterThan((actual - before) / 2);
    expect(leverageOnly - before).toBeLessThan((actual - before) / 4);

    // And the product route agrees with the direct route, which is what makes
    // the decomposition an attribution rather than a presentation.
    expect(
      Math.abs(cur.returnOnEquityPercent! - r.current.returnOnEquityPercent!),
    ).toBeLessThan(COUNTERFACTUAL_BAND_POINTS);
  });

  it("withholds a growth percent when the prior figure was zero", () => {
    // `formula.body[4]`'s claim: a blank is a refusal, not a zero. No percent
    // describes a rise from 0, and printing one would invent a number.
    const v = values();
    const zeroed = { ...v, pri_interestExpense: "0" };
    const result = computeAnalysis({
      current: readStatement(zeroed, "cur_").input!,
      prior: readStatement(zeroed, "pri_").input!,
    })!;
    const interest = result.lines.find((l) => l.key === "interestExpense")!;
    expect(interest.prior).toBe(0);
    expect(interest.changePercent).toBeNull();
    // The money change is still shown — only the ratio is withheld.
    expect(interest.change).toBeGreaterThan(0);
  });
});

describe("phan-tich-bao-cao-tai-chinh's copy hygiene", () => {
  it("shouts at nobody", () => {
    // Vacuity fixtures FIRST, using lines this module really shipped.
    expect(
      shoutedRuns(["phép tách DuPont cho biết TẠI SAO lợi nhuận thay đổi"]),
    ).toEqual(["TẠI", "SAO"]);
    expect(shoutedRuns(["mỗi dòng tính trên doanh thu CỦA CHÍNH KỲ ĐÓ"])).toEqual([
      "CỦA",
      "CHÍNH",
    ]);
    expect(shoutedRuns(["Cả hai kỳ dùng số dư CUỐI KỲ cho bảng cân đối"])).toEqual([
      "CUỐI",
    ]);
    // An initialism is not shouting, and neither is the name DuPont.
    expect(shoutedRuns(["Tách ROE theo DuPont"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("quotes no invented statistical range", () => {
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
    expect(shoutedRuns([...C.formula.emphasis])).toEqual([]);
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(userFacingStrings(C).length).toBeGreaterThan(20);
  });
});
