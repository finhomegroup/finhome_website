/**
 * Content contracts for `/cong-cu/cac-chi-so-tai-chinh/` (plan row 65).
 *
 * WHY THIS FILE EXISTS, given that two other tests already touch this page.
 * `components/financial-ratios-calculator.test.ts` guards the PRESENTATION
 * layer — the share-price parser choice and the valuation block — and
 * `lib/calc/financials.test.ts` guards the arithmetic with numbers passed
 * straight in. Neither reads this module's prose, and neither could see the
 * two things this unit found: a lesson the row requires that was absent, and
 * thirteen statement labels defined twice in two files that had already
 * drifted apart.
 *
 * THE DEFINITION-OF-DONE ASSERTIONS for this unit are the first two tests in
 * the consolidation block: the two pages' label sets are one object, and
 * every input group names the financial statement it comes from.
 */
import { describe, expect, it } from "vitest";

import { readStatement, STATEMENT_KEYS } from "@/components/calc/financials-fields";
import { readShareFields } from "@/components/financial-ratios-calculator";
import { computeRatios } from "@/lib/calc/financials";
import { formatDecimal, formatPercent, parseMoney } from "@/lib/calc/number";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { FINANCIAL_RATIOS as C } from "@/content/calculators/financial-ratios";
import { STATEMENT_ANALYSIS } from "@/content/calculators/statement-analysis";

/** The module's own output at the shipped defaults, valuation block included. */
function shipped() {
  const statement = readStatement({ ...C.form.defaults } as Record<string, string>);
  const share = readShareFields({
    shares: C.form.defaultShares,
    price: C.form.defaultPrice,
  });
  return computeRatios({
    ...statement.input!,
    sharesOutstanding: share.shares!,
    sharePrice: share.price!,
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

/**
 * Proper nouns and standard ratio initialisms a reader cannot mistake for
 * shouting. `P/E` and `P/B` carry no three-capital run and need no entry.
 */
const PROPER_NOUNS = ["FinHome", "ROE", "ROA", "EPS", "BVPS"];

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
 * The two financial statements this tool reads, as the copy names them.
 *
 * Derived from nothing — these are the two statement names the row's
 * requirement is about — but listed once here so the group-title check names
 * a STATEMENT rather than each group's own expected string. Pinning the three
 * titles literally would make the test a copy of the copy, and it would pass
 * a title that named the wrong statement.
 */
const STATEMENT_NAMES = ["Báo cáo kết quả kinh doanh", "Bảng cân đối kế toán"];

describe("the 65 <-> 66 statement-copy consolidation", () => {
  it("defines the thirteen statement labels EXACTLY ONCE, in one object", () => {
    // The unit's definition of done. Before this, all thirteen labels and all
    // thirteen help strings existed in both `financial-ratios.ts` and
    // `statement-analysis.ts`, and had already diverged on every line —
    // "Doanh thu sau các khoản giảm trừ." against "Doanh thu sau giảm trừ.",
    // and every balance-sheet line flattened to "Số dư cuối kỳ." on the
    // sibling page. A duplicated label set is how two pages come to disagree
    // about what a line item is called.
    //
    // Object IDENTITY, not deep equality: two objects that are equal today
    // can be edited apart tomorrow, which is the entire failure mode. This is
    // the assertion that a well-meaning "let me just tweak the wording on one
    // page" cannot get past.
    expect(STATEMENT_ANALYSIS.statement).toBe(C.statement);
    expect(STATEMENT_ANALYSIS.form.currentDefaults).toBe(C.form.defaults);

    // And the set really is the thirteen the shared component renders, so the
    // identity above is not an identity between two half-empty objects.
    expect(Object.keys(C.statement.lines).sort()).toEqual(
      [...STATEMENT_KEYS].sort(),
    );
    for (const key of STATEMENT_KEYS) {
      expect(C.statement.lines[key].label.trim().length).toBeGreaterThan(3);
      expect(C.statement.lines[key].help.trim().length).toBeGreaterThan(10);
    }
  });

  it("names the source STATEMENT in every input group title", () => {
    // The row's requirement is to group the inputs by which financial
    // statement they come from. One of three titles did: `incomeGroup` named
    // the income statement, while "Tài sản" and "Nợ phải trả" named
    // balance-sheet SECTIONS and left the statement unnamed — so a reader
    // holding a printed report could not tell which of the two documents in
    // front of them the group wanted.
    const titles = [
      C.statement.incomeGroup,
      C.statement.assetGroup,
      C.statement.liabilityGroup,
    ];
    for (const title of titles) {
      expect(
        STATEMENT_NAMES.some((name) => title.includes(name)),
        `group title "${title}" names no financial statement`,
      ).toBe(true);
    }
    // Vacuity guard: a check that every title names a statement would also
    // pass if all three named the SAME one, which would be wrong — the income
    // lines and the balance-sheet lines come from different documents.
    expect(new Set(titles.map((t) => t.split(" — ")[0])).size).toBe(2);

    // Still readable once the sibling page appends its period suffix. These
    // are `FieldGroup` headings on their own line, not table headers or card
    // labels, so the ~12-character card bound does not apply — but a heading
    // carrying two em-dashes does read badly, which is why the suffix is
    // parenthetical.
    for (const suffix of [
      STATEMENT_ANALYSIS.form.currentSuffix,
      STATEMENT_ANALYSIS.form.priorSuffix,
    ]) {
      for (const title of titles) {
        expect((`${title}${suffix}`.match(/—/g) ?? []).length).toBeLessThan(2);
      }
    }
  });
});

describe("cac-chi-so-tai-chinh at its shipped defaults", () => {
  const r = shipped();

  it("reads all thirteen statement lines with the MONEY grammar", () => {
    // Every line is đồng at tỷ scale, so `parseDecimal` would read
    // "1.000.000.000.000" as 1000 — a 1e9 error that would leave every ratio
    // plausible and every absolute figure wrong.
    const statement = readStatement({ ...C.form.defaults } as Record<
      string,
      string
    >);
    expect(statement.input).not.toBeNull();
    expect(statement.input!.revenue).toBe(1_000e9);
    for (const key of STATEMENT_KEYS) {
      expect(statement.invalid[key], `${key} rejected`).toBe(false);
      expect(parseMoney(C.form.defaults[key])).toBe(statement.input![key]);
    }
  });

  it("derives the statement the prose quotes, by the accounting identity", () => {
    expect(r.netProfit).toBe(96e9);
    expect(r.totalAssets).toBe(900e9);
    expect(r.totalLiabilities).toBe(400e9);
    // Equity is DERIVED, never entered — the identity `formula.body[0]` names.
    expect(r.equity).toBe(r.totalAssets - r.totalLiabilities);
    expect(r.equity).toBe(500e9);
    expect(r.negativeEquity).toBe(false);
  });

  it("prints the ratios its own method section quotes", () => {
    // docs §8 defect 19: a number in a sentence is a fixture nobody wrote.
    // These are the figures in `formula.body[1..4]`.
    const copy = userFacingStrings(C).join(" ");
    for (const value of [
      formatPercent(r.grossMarginPercent!, 0),
      formatPercent(r.netMarginPercent!, 1),
      formatPercent(r.returnOnEquityPercent!, 1),
      formatPercent(r.returnOnAssetsPercent!, 2),
    ]) {
      expect(copy, `prose does not quote ${value}`).toContain(value);
    }
    expect(formatDecimal(r.currentRatio!, 2)).toBe("2,00");
    expect(formatDecimal(r.quickRatio!, 2)).toBe("1,20");
    expect(formatDecimal(r.interestCoverage!, 2)).toBe("5,00");
  });

  it("keeps the three liquidity ratios in the order the prose promises", () => {
    // `formula.body[2]`: "Ba con số luôn theo thứ tự giảm dần". That is a
    // claim about every input, not about these defaults, so it is asserted as
    // the construction property it is — each ratio has the same denominator
    // and a strictly smaller numerator than the one before it.
    expect(r.currentRatio!).toBeGreaterThan(r.quickRatio!);
    expect(r.quickRatio!).toBeGreaterThan(r.cashRatio!);

    // And on a company shaped the other way round, so the ordering is not an
    // artefact of the prefilled inventory being large.
    const noInventory = computeRatios({
      ...readStatement({ ...C.form.defaults } as Record<string, string>).input!,
      inventory: 0,
    })!;
    expect(noInventory.currentRatio!).toBeGreaterThanOrEqual(
      noInventory.quickRatio!,
    );
    expect(noInventory.quickRatio!).toBeGreaterThan(noInventory.cashRatio!);
  });

  it("reports a null ratio as not-applicable rather than as infinity", () => {
    // The module's stated first principle, and the reason the table shows a
    // dash. A company with no interest expense has no coverage ratio.
    const noDebt = computeRatios({
      ...readStatement({ ...C.form.defaults } as Record<string, string>).input!,
      interestExpense: 0,
    })!;
    expect(noDebt.interestCoverage).toBeNull();
    expect(C.form.ratioTable.intro).toContain("không áp dụng được");
  });
});

describe("cac-chi-so-tai-chinh's notice, and the lesson that was missing", () => {
  const r = shipped();

  it("says in the visible slot that one ratio concludes nothing", () => {
    // The row's lesson, and it was absent AS SUCH. The prose made two
    // adjacent but different points — ROE above ROA being leverage, and there
    // being no universal current-ratio threshold — which teach how to read
    // ONE ratio in context. Neither says a single ratio cannot conclude a
    // company's health.
    expect(C.oneRatioNotice).toContain("Một chỉ số không kết luận được");
    expect(C.oneRatioNotice).toContain("cùng nhau");
    // Argued with the page's own figures rather than asserted, so a reader can
    // check it against the table below.
    expect(C.oneRatioNotice).toContain(
      formatPercent(r.returnOnEquityPercent!, 1),
    );
    expect(C.oneRatioNotice).toContain(formatDecimal(r.currentRatio!, 1));
  });

  it("keeps the closing-balance caveat, which MOVED rather than vanished", () => {
    // The caveat gave up the notice slot to the lesson and now sits behind the
    // disclosure. Assert it moved, not merely that the notice changed — and
    // assert the disclosure has a title, because `CalculatorPage` renders
    // `noticeDetail` only when `noticeDetailTitle` is also present, so a
    // caveat with no title would silently not render at all.
    expect(C.closingBalanceNotice).toContain("số dư cuối kỳ");
    expect(C.closingBalanceNotice).toContain("báo cáo phân tích");
    expect(C.closingBalanceTitle.trim().length).toBeGreaterThan(10);

    // And the FAQ answer on the same subject still stands, so a reader who
    // goes looking finds it in both places.
    expect(C.faq.items.map((i) => i.a).join(" ")).toContain("bình quân");
  });
});

describe("cac-chi-so-tai-chinh's copy hygiene", () => {
  it("shouts at nobody", () => {
    // Vacuity fixtures FIRST, using lines this module really shipped.
    expect(
      shoutedRuns(["Dấu gạch ngang nghĩa là KHÔNG ÁP DỤNG ĐƯỢC, không phải 0"]),
    ).toEqual(["KHÔNG", "DỤNG", "ĐƯỢC"]);
    expect(shoutedRuns(["ở đây chia cho SỐ DƯ CUỐI KỲ"])).toEqual(["CUỐI"]);
    expect(shoutedRuns(["tính trên lợi nhuận HOẠT ĐỘNG, tức trước lãi vay"])).toEqual(
      ["HOẠT", "ĐỘNG"],
    );
    // A ratio initialism is not shouting.
    expect(shoutedRuns(["ROE cao hơn ROA là dấu hiệu của đòn bẩy"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("quotes no invented statistical range", () => {
    const copy = userFacingStrings(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"])
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    // The one number in this page's copy that could read as a benchmark is
    // explicitly labelled a convention, which is the honest treatment.
    expect(copy).toContain("Không có ngưỡng chung");
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
