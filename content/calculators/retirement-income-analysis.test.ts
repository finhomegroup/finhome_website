import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  INCOME_SOURCE_KEYS,
  projectIncomeSources,
  type RetirementIncomeSourcesInput,
} from "@/lib/calc/retirement-income-sources";
import { RETIREMENT_INCOME_ANALYSIS as C } from "@/content/calculators/retirement-income-analysis";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";

const D = C.form.defaults;

/**
 * The component's own parse and wiring, reproduced field by field — docs §6.
 * Two things are under test here that no module test can see: that each
 * default string is read by the parser its FIELD KIND needs, and that the
 * two sources whose indexation the page wires (rather than asks) are wired
 * to the inflation field.
 */
function shippedInput(): RetirementIncomeSourcesInput {
  const inflation = parseDecimal(D.inflation)!;
  return {
    startAge: parseCount(D.startAge)!,
    endAge: parseCount(D.endAge)!,
    annualNeed: parseMoney(D.need)!,
    inflationPercent: inflation,
    portfolioBalance: parseMoney(D.balance)!,
    portfolioReturnPercent: parseDecimal(D.returnPercent)!,
    sources: {
      social: {
        annualAmount: parseMoney(D.social)!,
        indexationPercent: inflation,
        throughAge: 120,
      },
      pension: {
        annualAmount: parseMoney(D.pension)!,
        indexationPercent: parseDecimal(D.pensionIndex)!,
        throughAge: 120,
      },
      work: {
        annualAmount: parseMoney(D.work)!,
        indexationPercent: inflation,
        throughAge: parseCount(D.workThrough)!,
      },
      other: {
        annualAmount: parseMoney(D.other)!,
        indexationPercent: parseDecimal(D.otherIndex)!,
        throughAge: 120,
      },
    },
  };
}

function run(over: Partial<RetirementIncomeSourcesInput> = {}) {
  const result = projectIncomeSources({ ...shippedInput(), ...over });
  if (!result) throw new Error("projectIncomeSources returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-income-analysis.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("phan-tich-thu-nhap-huu-tri at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const input = shippedInput();
    expect(input).toMatchObject({
      startAge: 67,
      endAge: 95,
      annualNeed: 80_000,
      inflationPercent: 2.5,
      portfolioBalance: 600_000,
      portfolioReturnPercent: 5,
    });
    // "80.000" through parseDecimal would be 80; "2,5" through parseMoney
    // would be 25; "67" through either is 67, which is why the ages are the
    // easy ones to get wrong and the money is not.
    expect(input.sources.social.annualAmount).toBe(30_000);
    expect(input.sources.pension.annualAmount).toBe(18_000);
    expect(input.sources.work.annualAmount).toBe(12_000);
    expect(input.sources.other.annualAmount).toBe(6_000);
    expect(input.sources.work.throughAge).toBe(72);
  });

  it("wires the COLA sources to the inflation field, not to a constant", () => {
    // The page's claim is that Social Security is indexed; if the wiring
    // broke, the tool would quietly show it decaying like the pension.
    const input = shippedInput();
    expect(input.sources.social.indexationPercent).toBe(
      input.inflationPercent,
    );
    expect(input.sources.work.indexationPercent).toBe(input.inflationPercent);
    // And the pension is deliberately NOT wired: 0 is its shipped default.
    expect(input.sources.pension.indexationPercent).toBe(0);
  });

  it("quotes the coverage at both ends of retirement", () => {
    const r = run();
    expect(formatPercent(r.first.fixedCoveragePercent!, 1)).toBe("82,5%");
    expect(formatPercent(r.last.fixedCoveragePercent!, 1)).toBe("56,6%");
    expect(usdCents(r.first.fixedIncome)).toBe("66.000,00");
    expect(usdCents(r.last.fixedIncome)).toBe("88.120,80");
    // The nominal figure GOES UP while the coverage goes down, which is the
    // sentence the notice makes.
    expect(r.last.fixedIncome).toBeGreaterThan(r.first.fixedIncome);
    expect(C.decayNotice).toContain("82,5%");
    expect(C.decayNotice).toContain("56,6%");
  });

  it("quotes the real draw at both ends and the ratio between them", () => {
    const r = run();
    expect(usdCents(r.first.realWithdrawal)).toBe("14.000,00");
    expect(usdCents(r.last.realWithdrawal)).toBe("34.758,80");
    const ratio = r.last.realWithdrawal / r.first.realWithdrawal;
    expect(formatDecimalRatio(ratio)).toBe("2,48");
    expect(C.decayNotice).toContain(usd(r.first.realWithdrawal));
    expect(C.decayNotice).toContain(usd(r.last.realWithdrawal));
    expect(C.decayNotice).toContain("2,48");
    expect(C.faq.items[1].a).toContain("2,48");
  });

  it("quotes what the level pension is worth by the final year", () => {
    const r = run();
    expect(formatPercent(r.realValueKeptPercent.pension!, 1)).toBe("51,3%");
    expect(usd(r.last.realBySource.pension)).toBe("9.241");
    expect(C.decayNotice).toContain("51,3%");
    expect(C.decayNotice).toContain("9.241");
    expect(C.formula.body[3]).toContain("51,3%");
  });

  it("names the two causes of the fall separately", () => {
    // The notice blames the work income stopping AND the pension decaying.
    // Check each contributes, by removing one at a time.
    const both = run();
    const noStop = run({
      sources: {
        ...shippedInput().sources,
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    expect(noStop.last.fixedCoveragePercent!).toBeGreaterThan(
      both.last.fixedCoveragePercent!,
    );
    expect(indexed.last.fixedCoveragePercent!).toBeGreaterThan(
      both.last.fixedCoveragePercent!,
    );
    // Fix both and the coverage stops falling at all.
    const neither = run({
      sources: {
        social: { annualAmount: 30_000, indexationPercent: 2.5, throughAge: 120 },
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 120 },
        other: { annualAmount: 6_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    expect(neither.last.fixedCoveragePercent!).toBeCloseTo(
      neither.first.fixedCoveragePercent!,
      6,
    );
  });

  it("shows the coverage step down the year after the work stops", () => {
    const r = run();
    const at72 = r.years.find((y) => y.age === 72)!;
    const at73 = r.years.find((y) => y.age === 73)!;
    expect(formatPercent(at72.fixedCoveragePercent!, 1)).toBe("79,9%");
    expect(formatPercent(at73.fixedCoveragePercent!, 1)).toBe("64,4%");
  });

  it("prices the pension's indexation clause, which is the first FAQ", () => {
    const level = run();
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    const worth = level.realTotalWithdrawn - indexed.realTotalWithdrawn;
    expect(usd(level.realTotalWithdrawn)).toBe("791.648");
    expect(usd(indexed.realTotalWithdrawn)).toBe("656.000");
    expect(usd(worth)).toBe("135.648");
    expect(usd(level.finalBalance)).toBe("166.983");
    expect(usd(indexed.finalBalance)).toBe("517.442");
    const a = C.faq.items[0].a;
    for (const figure of ["135.648", "656.000", "791.648", "517.442", "166.983"]) {
      expect(a, `FAQ 1 is missing ${figure}`).toContain(figure);
    }
  });

  it("splits the whole retirement between the sources and the portfolio", () => {
    const r = run();
    const shares = INCOME_SOURCE_KEYS.map((key) =>
      formatPercent((r.realTotalBySource[key] / r.realTotalNeed) * 100, 1),
    );
    expect(shares).toEqual(["37,5%", "16,4%", "3,2%", "7,5%"]);
    expect(
      formatPercent((r.realTotalWithdrawn / r.realTotalNeed) * 100, 1),
    ).toBe("35,3%");
    // The ledger closes: the shares plus the portfolio plus the unmet part
    // are the whole need. formula.body[4] promises exactly this.
    expect(
      r.realTotalFixedIncome + r.realTotalWithdrawn + r.realTotalUnmet,
    ).toBeCloseTo(r.realTotalNeed, 4);
    expect(usd(r.realTotalNeed)).toBe("2.240.000");
  });

  it("does not run out of money in the default state, and says so", () => {
    const r = run();
    expect(r.depletionAge).toBe(null);
    expect(r.firstUnmetAge).toBe(null);
    expect(usd(r.last.realBalance)).toBe("83.638");
    // So the page shows the "covered" notice — which still warns about the
    // decay rather than declaring the plan safe.
    expect(C.form.coveredNotice).toContain("giảm dần");
  });

  it("quotes the deceptively low first-year withdrawal rate", () => {
    const r = run();
    expect(formatPercent(r.initialWithdrawalRatePercent!, 2)).toBe("2,33%");
    // The figure is in the question, which is where the reader meets it.
    expect(`${C.faq.items[1].q} ${C.faq.items[1].a}`).toContain("2,33%");
  });
});

/** Two decimal places, Vietnamese separator — for a bare ratio, not money. */
function formatDecimalRatio(value: number): string {
  return formatMoney(value, 2);
}

describe("phan-tich-thu-nhap-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    for (const figure of [
      usdCents(r.first.fixedIncome),
      usdCents(r.last.fixedIncome),
      usdCents(r.last.realFixedIncome),
      usdCents(r.first.withdrawal),
      usdCents(r.last.withdrawal),
      usdCents(r.last.realWithdrawal),
      usdCents(r.last.need),
      usd(r.last.realBySource.pension),
      usd(r.realTotalBySource.social),
      usd(r.realTotalBySource.pension),
      usd(r.realTotalBySource.work),
      usd(r.realTotalBySource.other),
      usd(r.realTotalWithdrawn),
      usd(r.realTotalNeed),
      usd(r.finalBalance),
      usd(r.last.realBalance),
      usd(indexed.realTotalWithdrawn),
      usd(indexed.finalBalance),
      formatPercent(r.first.fixedCoveragePercent!, 1),
      formatPercent(r.last.fixedCoveragePercent!, 1),
      formatPercent(r.realValueKeptPercent.pension!, 1),
      formatPercent(r.initialWithdrawalRatePercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});

/**
 * ---------------------------------------------------------------------------
 * Added 2026-09-16 with this row's `sources` list. Three guards that did not
 * exist on this file: a copy sweep, a shouting sweep, and the reading-
 * disposition chain.
 *
 * NOTE FOR THE NEXT READER. `sources` means two unrelated things around this
 * file. `shippedInput().sources` above is the income-source INPUT fixtures —
 * social, pension, work, other. `C.sources` below is the content module's
 * CITATIONS field. They are not related and a grep for "sources" here will
 * hit both.
 * ---------------------------------------------------------------------------
 */

/** Proper nouns a reader cannot mistake for shouting. */
const PROPER_NOUNS = ["USD", "COLA"];

/**
 * Every user-facing string in the module, by WALKING the exported object.
 *
 * Not a hand-written field list and not a regex over the source text. A
 * field list goes stale the moment a field is added — `sources` arrived on
 * this module today — and extracting the literals with a regex first is
 * what made an earlier sweep of a sibling report zero shouted words on a
 * file that had ten.
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

describe("phan-tich-thu-nhap-huu-tri's copy", () => {
  it("quotes no invented statistical range", () => {
    // Same list as `apr-advanced.test.ts` and `loan.test.ts`, deliberately
    // reused rather than rewritten: an invented range survived in the one
    // sibling module that had no test of its own, and a fresh list here
    // would be a list that can drift from theirs.
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
      shoutedRuns(["Lợi nhuận được tính trên phần CÒN LẠI sau khi rút"]),
    ).toEqual(["CÒN", "LẠI"]);
    expect(
      shoutedRuns(["và MỌI số tiền bạn nhập bên dưới là số tiền theo giá"]),
    ).toEqual(["MỌI"]);
    // And the allowlist must not swallow a real shout beside an allowed one.
    expect(
      shoutedRuns(["an sinh xã hội có COLA nên KHÔNG mất sức mua"]),
    ).toEqual(["KHÔNG"]);
    expect(shoutedRuns(["Chi tiêu mỗi năm, tính bằng USD"])).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("keeps the market visible in the lede, since the H1 does not carry it", () => {
    // This row's H1 is market-neutral and the registry row is not. That is
    // acceptable here — unlike row 9 — precisely because the lede's FIRST
    // substantive clause names the market. Assert the thing that makes it
    // acceptable, so a lede rewrite cannot quietly remove it.
    expect(C.lede).toContain("Hoa Kỳ");
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
 * This row is the one where the temptation is strongest, because the
 * twenty-first unit's handoff confirmed it "stays as it is" as a US
 * reference page and it reads more like an essay than a calculator. P4's
 * standing instruction is still "maintain or move to a library until
 * audience evidence justifies more", and `emphasis` is an investment in a
 * page as reading. If that evidence arrives, the disposition moves FIRST.
 */
describe("phan-tich-thu-nhap-huu-tri — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("phan-tich-thu-nhap-huu-tri")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("phan-tich-thu-nhap-huu-tri")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "phan-tich-thu-nhap-huu-tri is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("phan-tich-thu-nhap-huu-tri — sources", () => {
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

  it("cites the statute behind the one legal claim the page makes", () => {
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("title42-chap7-subchapII-sec415")),
      "the Social Security COLA statute is missing",
    ).toBe(true);
    expect(
      urls.every((url) => url.endsWith(".gov") || url.includes(".gov/")),
      "a source is not on a .gov host",
    ).toBe(true);
  });

  it("does not label its citations with the word its table already uses", () => {
    // `sourceTable.sourceColumn` is "Nguồn" and means an INCOME source. A
    // citations heading reading "Nguồn" too would put the same word on two
    // unrelated things on one page, which is why this row overrides the
    // suite's usual heading. Asserted as a RELATION, so renaming either side
    // keeps them distinct rather than re-colliding.
    expect(C.form.sourceTable.sourceColumn).toBe("Nguồn");
    expect(C.sources.title).not.toBe(C.form.sourceTable.sourceColumn);
    expect(C.sources.title).toBe("Nguồn tham khảo");
  });

  it("cites once, because only one figure on this page comes from law", () => {
    // The short list is the FINDING, not an omission. Every amount and rate
    // here is a reader input — there is no US table, no year key and no
    // statutory constant in `lib/calc/retirement-income-sources.ts` — so a
    // longer list would be citing things the page does not assert.
    expect(C.sources.items.length).toBe(1);
    expect(C.sources.intro).toContain("ô bạn nhập");
  });

  it("stays no more precise than the statute it cites", () => {
    // §415(i) ties the increase to "the Consumer Price Index (as prepared by
    // the Department of Labor)" and names no series. The page says "một chỉ
    // số giá tiêu dùng" and must not be sharpened to naming CPI-W, which
    // would make the claim more specific than its own citation.
    //
    // Scoped to the CLAIM-BEARING surfaces, deliberately. The first version
    // of this assertion swept `userFacingStrings(C)` — which includes the
    // source note whose whole job is to say the statute does NOT name a
    // series — so it failed on the sentence that makes the point. A guard
    // that cannot distinguish asserting a thing from disclaiming it is
    // measuring the wrong string.
    const claims = [
      C.lede,
      ...C.formula.body,
      ...C.faq.items.map((item) => `${item.q} ${item.a}`),
      ...userFacingStrings(C.form),
    ].join(" ");
    expect(claims).toContain("một chỉ số giá tiêu dùng");
    expect(claims).not.toContain("CPI-W");
    expect(claims).not.toContain("CPI-U");
  });

  it("does not claim a source for the indexation rate, which is an input", () => {
    // The page derives Social Security growth from the reader's own
    // inflation field rather than from a published COLA, and says so. A
    // citation implying it ships real COLA figures would be false.
    expect(C.sources.intro).toContain("mức lạm phát bạn nhập");
    expect(C.form.socialHelp).toContain("theo luật");
  });
});
