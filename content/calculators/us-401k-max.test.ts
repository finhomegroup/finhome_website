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
import { computeUs401kMax, type Us401kMaxInput } from "@/lib/calc/us-401k-max";
import { RETIREMENT_LIMITS } from "@/lib/calc/us-retirement-limits";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { US_401K_MAX as C } from "@/content/calculators/us-401k-max";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): Us401kMaxInput {
  return {
    year: Number(D.year),
    age: parseCount(D.age)!,
    annualSalary: parseMoney(D.salary)!,
    payPeriodsPerYear: Number(D.periods),
    periodsElapsed: parseCount(D.elapsed)!,
    contributedSoFar: parseMoney(D.contributed)!,
    employerMatchPercent: parseDecimal(D.matchPercent)!,
    employerMatchLimitPercent: parseDecimal(D.matchLimit)!,
    frontLoadPercent: parseDecimal(D.frontLoad)!,
  };
}

function run(over: Partial<Us401kMaxInput> = {}) {
  const result = computeUs401kMax({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUs401kMax returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

/**
 * Proper nouns a reader cannot mistake for shouting.
 *
 * `401(k)`, `402(g)` and `401(a)(17)` carry no uppercase letters at all and
 * need no exemption — listed here only so the next reader does not go
 * looking for them.
 */
const PROPER_NOUNS = ["SECURE", "FICA", "USD", "IRA", "IRS", "HSA", "Roth"];

/**
 * Every user-facing string in the module, by WALKING the object.
 *
 * Deliberately not a hand-written list of fields and deliberately not a
 * regex over the source text. A hand-written list goes stale the moment a
 * field is added — `relatedTool` and `sources` both arrived after this
 * module shipped — and extracting the literals with a regex first is what
 * made an earlier sweep of these files report zero shouted words when there
 * were ten.
 */
function userFacingStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) userFacingStrings(v, out);
  else if (value !== null && typeof value === "object")
    for (const v of Object.values(value)) userFacingStrings(v, out);
  return out;
}

/**
 * Whole words in capitals, once URLs and the proper nouns are removed.
 *
 * WHOLE WORDS, not runs of three letters, and that is the second version of
 * this rule. `\p{Lu}{3,}` is what this file shipped, and the investing shelf
 * proved it reads as clean over lines that are shouting in TWO-letter words:
 * "Nhập số ÂM cho tiền bỏ ra", "Công cụ CỐ Ý không tự chuẩn hóa", "rủi ro ÍT
 * hơn trên mỗi đơn vị lợi nhuận". Vietnamese is full of two-letter words, so
 * a three-letter minimum is a hole the size of the language.
 *
 * The bound is a WORD boundary rather than a length, which is what lets the
 * minimum drop to two without reporting the "IR" inside a mixed-case token.
 * A single capital standing alone is deliberately not judged: it is as
 * likely to be a name as an emphasis.
 *
 * URLs are stripped FIRST. A capitalised href is not prose — "USCODE" inside
 * a link is a path segment, not shouting — and a `sources` list is walked by
 * the same sweep as the copy. No URL in this module trips it today, which is
 * exactly why the fixture below pins it rather than leaving it to luck.
 */
function shoutedRuns(strings: readonly string[]): string[] {
  const found: string[] = [];
  for (const original of strings) {
    let text = original.replace(/https?:\/\/\S+/g, " ");
    // split/join, not a regex: these tokens contain regex metacharacters.
    for (const noun of PROPER_NOUNS) text = text.split(noun).join(" ");
    // `\p{Lu}`, never a range like `Ạ-Ỹ` — that range spans the LOWERCASE
    // accented block, so `[Ạ-Ỹ]` matches "ạ" and the sweep reads as clean.
    for (const match of text.matchAll(/(?<!\p{L})\p{Lu}{2,}(?!\p{L})/gu))
      found.push(match[0]);
  }
  return [...new Set(found)];
}

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-401k-max.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("toi-da-401k at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      year: 2026,
      age: 40,
      annualSalary: 130_000,
      payPeriodsPerYear: 26,
      periodsElapsed: 0,
      contributedSoFar: 0,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 6,
      frontLoadPercent: 50,
    });
  });

  it("offers a payroll-frequency option for every value the module accepts", () => {
    // The select's values are the only pay-period counts a reader can pick,
    // so each has to produce a usable result rather than a null page.
    for (const periods of [12, 24, 26, 52]) {
      expect(run({ payPeriodsPerYear: periods }).periodsRemaining).toBe(periods);
    }
    expect(Object.keys(C.form.periodOptions)).toHaveLength(4);
  });

  it("quotes the per-paycheck answer and its percent", () => {
    const r = run();
    expect(usd(r.limit)).toBe("24.500");
    expect(usdCents(r.payPerPeriod)).toBe("5.000,00");
    expect(usdCents(r.perPeriodAmount!)).toBe("942,31");
    expect(formatPercent(r.perPeriodPercent!, 2)).toBe("18,85%");
    expect(C.frontLoadNotice).toContain("942,31");
    expect(C.frontLoadNotice).toContain("18,85%");
  });

  it("quotes the match threshold, per period and per year", () => {
    const r = run();
    expect(usdCents(r.matchThresholdPerPeriod)).toBe("300,00");
    expect(usdCents(r.matchThresholdAnnual)).toBe("7.800,00");
    expect(C.frontLoadNotice).toContain("7.800");
  });

  it("loses nothing on the level schedule, under either kind of plan", () => {
    const r = run();
    expect(usdCents(r.planned.matchPerPeriodPlan)).toBe("7.800,00");
    expect(usdCents(r.planned.matchTrueUpPlan)).toBe("7.800,00");
    expect(r.planned.matchLostWithoutTrueUp).toBeCloseTo(0, 6);
    expect(r.planned.emptyPeriods).toBe(0);
    expect(r.planned.underThresholdPeriods).toBe(0);
    // So the page shows the reassuring notice, which still names the price
    // of front-loading rather than declaring the question closed.
    expect(C.form.evenNotice).toContain("4.800");
  });

  it("quotes the front-loading loss, and where it comes from", () => {
    const r = run();
    expect(r.frontLoaded.emptyPeriods).toBe(16);
    expect(usdCents(r.frontLoaded.matchPerPeriodPlan)).toBe("3.000,00");
    expect(usdCents(r.frontLoaded.matchTrueUpPlan)).toBe("7.800,00");
    expect(usdCents(r.frontLoadCost)).toBe("4.800,00");
    // Same money in, so the loss is purely about the spread.
    expect(r.frontLoaded.totalDeferral).toBeCloseTo(r.planned.totalDeferral, 6);
    // And it is exactly the match on the empty paychecks.
    expect(r.frontLoadCost).toBeCloseTo(
      r.frontLoaded.emptyPeriods * r.matchThresholdPerPeriod,
      6,
    );
    for (const figure of ["7.800", "3.000", "4.800", "16", "10"]) {
      expect(C.frontLoadNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the harder front-load in the FAQ range", () => {
    const hard = run({ frontLoadPercent: 100 });
    expect(hard.frontLoaded.emptyPeriods).toBe(21);
    expect(usdCents(hard.frontLoadCost)).toBe("6.300,00");
  });

  it("quotes the mid-year catch-up figures", () => {
    const mid = run({ periodsElapsed: 13, contributedSoFar: 10_000 });
    expect(usd(mid.remainingRoom)).toBe("14.500");
    expect(usdCents(mid.perPeriodAmount!)).toBe("1.115,38");
    expect(formatPercent(mid.perPeriodPercent!, 2)).toBe("22,31%");
  });

  it("quotes the lumpy case, where nothing is empty and match is still lost", () => {
    // The reader's OWN version of the trap: front-loaded by accident in the
    // first half of the year, then below the threshold for the rest.
    const lumpy = run({ periodsElapsed: 13, contributedSoFar: 23_000 });
    expect(usdCents(lumpy.perPeriodAmount!)).toBe("115,38");
    expect(formatPercent(lumpy.perPeriodPercent!, 2)).toBe("2,31%");
    expect(lumpy.planned.emptyPeriods).toBe(0);
    expect(lumpy.planned.underThresholdPeriods).toBe(13);
    expect(usdCents(lumpy.planned.matchLostWithoutTrueUp)).toBe("2.400,00");
  });

  it("says the limit is out of reach with one paycheck left", () => {
    const late = run({ periodsElapsed: 25 });
    expect(late.exceedsPay).toBe(true);
    expect(formatPercent(late.perPeriodPercent!, 2)).toBe("490,00%");
    expect(usd(late.maxStillPossible)).toBe("5.000");
    expect(usd(late.remainingRoom)).toBe("24.500");
    expect(C.form.unreachableNotice).toContain("nhiều nhất còn đưa được");
  });

  it("quotes the age-61 limit and paycheck", () => {
    const older = run({ age: 61 });
    expect(usd(older.limit)).toBe("35.750");
    expect(usdCents(older.perPeriodAmount!)).toBe("1.375,00");
    expect(formatPercent(older.perPeriodPercent!, 2)).toBe("27,50%");
    expect(older.limit).toBe(
      RETIREMENT_LIMITS[2026].electiveDeferral +
        RETIREMENT_LIMITS[2026].catchUp60to63,
    );
  });

  it("shouts nowhere mid-sentence", () => {
    // The capitals were the only emphasis available before `ProseText`
    // existed. Sentence case plus declared phrases replaces them, and
    // wrapping <strong> around text that is ALREADY shouted would stack two
    // mechanisms and keep the capitals. Result LABELS get sentence case and
    // nothing else — a label cannot carry declared emphasis.
    //
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. Prove the detector fires on lines this module really
    // shipped, and prove the proper-noun allowlist does not swallow a real
    // shout standing next to one.
    expect(shoutedRuns(["Trần này chỉ chặn TIỀN CỦA BẠN."])).toEqual([
      "TIỀN",
      "CỦA",
      "BẠN",
    ]);
    expect(shoutedRuns(["Chỉ tính phần bạn tự trừ vào lương"])).toEqual([]);
    expect(shoutedRuns(["mất 4.800,00 USD nếu quỹ KHÔNG bù"])).toEqual([
      "KHÔNG",
    ]);

    // THE TWO-LETTER CASE, which is why this is a word rule and not a
    // three-letter one. All three of these are lines the investing shelf
    // really shipped, and `\p{Lu}{3,}` reported every one of them clean.
    expect(shoutedRuns(["Nhập số ÂM cho tiền bỏ ra."])).toEqual(["ÂM"]);
    expect(shoutedRuns(["rủi ro ÍT hơn trên mỗi đơn vị"])).toEqual(["ÍT"]);
    // "CỐ" is reported; the one-letter "Ý" beside it is not, and that is the
    // rule's stated edge rather than an oversight.
    expect(shoutedRuns(["Công cụ CỐ Ý không tự chuẩn hóa"])).toEqual(["CỐ"]);
    // A capitalised href is a path, not prose. No shipped URL here trips the
    // sweep today, so this fixture is what keeps the strip honest.
    expect(
      shoutedRuns(["https://uscode.house.gov/USCODE-2024-title26 và phần bù"]),
    ).toEqual([]);
    expect(shoutedRuns(["xem tại https://x.test/A và mức TỐI ĐA"])).toEqual([
      "TỐI",
      "ĐA",
    ]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });

  it("does not say the paycheck itself is held to the income ceiling", () => {
    // formula.body[6] opened "Tiền lương mỗi kỳ được tính trên phần thu nhập
    // mà kế hoạch được phép nhìn thấy". The paycheck is real pay — a
    // 500.000 earner on 26 periods receives 19.230,77, not 13.846,15 — and
    // the ceiling reaches only the match threshold, 6% of 360.000 spread
    // over the periods. The paragraph has to say which of the two it binds.
    const rich = run({ annualSalary: 500_000 });
    expect(usdCents(rich.payPerPeriod)).toBe("19.230,77");
    expect(usdCents(rich.matchThresholdPerPeriod)).toBe("830,77");

    const p = C.formula.body[6];
    expect(p).not.toContain(
      "Tiền lương mỗi kỳ được tính trên phần thu nhập mà kế hoạch",
    );
    expect(p).toContain("402(g)");
    expect(p).toContain("ngưỡng đối ứng");
  });

  it("gives the table one match figure per period, from the module", () => {
    // The page renders `matches` rather than recomputing the per-period cap,
    // so the column and the total below it cannot disagree.
    const r = run();
    expect(r.planned.matches).toHaveLength(26);
    expect(r.frontLoaded.matches).toHaveLength(26);
    expect(r.planned.matches.reduce((a, b) => a + b, 0)).toBeCloseTo(
      r.planned.matchPerPeriodPlan,
      6,
    );
    expect(r.frontLoaded.matches.reduce((a, b) => a + b, 0)).toBeCloseTo(
      r.frontLoaded.matchPerPeriodPlan,
      6,
    );
    // The claim the table intro makes: the front-loaded column hits zero and
    // stays there.
    expect(r.frontLoaded.matches.at(-1)).toBe(0);
    expect(r.frontLoaded.matches[0]).toBeGreaterThan(0);
  });

  it("keeps the table under the row ceiling at weekly payroll", () => {
    const weekly = run({ payPeriodsPerYear: 52 });
    const step = Math.ceil(weekly.planned.deferrals.length / 26);
    expect(step).toBe(2);
    const shown = weekly.planned.deferrals.filter((_, i) => i % step === 0);
    expect(shown).toHaveLength(26);
  });
});

/**
 * This row adds NO emphasis, and that is enforced here.
 *
 * The chain is `library: "hoa-ky"` => filed `reference` => this pass added
 * nothing. `plan-disposition.test.ts` ("marks every US-law tool as
 * reference, never as a reading funnel") enforces the FIRST arrow for all
 * 75 rows. Nothing enforced the second: `reference` is documented as
 * asserting that nothing was added, and no test checked that a `reference`
 * row had in fact added nothing.
 *
 * That hole is not hypothetical. A declared phrase list was written into
 * this module on 2026-09-16 and both 401(k) pages rendered seven `<strong>`
 * each while still filed `reference` — a real inconsistency the whole suite
 * stayed green through, because the only emphasis assertions in the repo
 * look at rows already filed `emphasis`. This test is the second arrow.
 */
describe("toi-da-401k — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("toi-da-401k")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("toi-da-401k")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a type error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "toi-da-401k is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("toi-da-401k — sources", () => {
  it("cites an openable source for every item", () => {
    expect(C.sources.items.length).toBeGreaterThan(0);
    for (const item of C.sources.items) {
      expect(item.url, "a source item has an empty url").not.toBe("");
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.label).not.toBe("");
    }
  });

  it("says the true-up clause has no statutory source", () => {
    // The page's whole subject is a plan-document clause. A "Nguồn" heading
    // over official links would otherwise imply the law answers the question
    // the page says only the fund document can answer.
    expect(C.sources.intro).toBeDefined();
    expect(C.sources.intro).toContain("không có trong luật");
  });

  it("cites the page that the 401(a)(17) correction rests on", () => {
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("compensation-exceeds-the-annual-limit")),
      "the compensation-ceiling source is missing",
    ).toBe(true);
  });
});

describe("toi-da-401k — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const hard = run({ frontLoadPercent: 100 });
    const mid = run({ periodsElapsed: 13, contributedSoFar: 10_000 });
    const lumpy = run({ periodsElapsed: 13, contributedSoFar: 23_000 });
    const late = run({ periodsElapsed: 25 });
    const older = run({ age: 61 });
    for (const figure of [
      usd(r.limit),
      usdCents(r.payPerPeriod),
      usdCents(r.perPeriodAmount!),
      formatPercent(r.perPeriodPercent!, 2),
      usdCents(r.matchThresholdPerPeriod),
      usdCents(r.matchThresholdAnnual),
      usdCents(r.planned.matchPerPeriodPlan),
      usdCents(r.frontLoaded.matchPerPeriodPlan),
      usdCents(r.frontLoaded.matchTrueUpPlan),
      usdCents(r.frontLoadCost),
      usdCents(hard.frontLoadCost),
      usd(mid.remainingRoom),
      usdCents(mid.perPeriodAmount!),
      formatPercent(mid.perPeriodPercent!, 2),
      usdCents(lumpy.perPeriodAmount!),
      formatPercent(lumpy.perPeriodPercent!, 2),
      usdCents(lumpy.planned.matchLostWithoutTrueUp),
      formatPercent(late.perPeriodPercent!, 2),
      usd(late.maxStillPossible),
      usd(older.limit),
      usdCents(older.perPeriodAmount!),
      formatPercent(older.perPeriodPercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
