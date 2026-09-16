import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { nextStepsFor } from "@/content/calculators/next-steps";
import { US_401K_MAX } from "@/content/calculators/us-401k-max";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUs401k, type Us401kInput } from "@/lib/calc/us-401k";
import {
  RETIREMENT_LIMITS,
  RETIREMENT_LIMIT_YEAR_ORDER,
} from "@/lib/calc/us-retirement-limits";
import { US_401K as C } from "@/content/calculators/us-401k";
import { US_IRA } from "@/content/calculators/us-ira";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): Us401kInput {
  return {
    year: Number(D.year),
    age: parseCount(D.age)!,
    annualSalary: parseMoney(D.salary)!,
    priorYearWages: parseMoney(D.priorYearWages)!,
    deferralPercent: parseDecimal(D.deferral)!,
    employerMatchPercent: parseDecimal(D.matchPercent)!,
    employerMatchLimitPercent: parseDecimal(D.matchLimit)!,
    employerExtraPercent: parseDecimal(D.extra)!,
    marginalRatePercent: parseDecimal(D.marginal)!,
    returnPercent: parseDecimal(D.returnPercent)!,
    years: parseCount(D.years)!,
  };
}

function run(over: Partial<Us401kInput> = {}) {
  const result = computeUs401k({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeUs401k returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

/**
 * Proper nouns a reader cannot mistake for shouting.
 *
 * `401(k)`, `402(g)`, `415(c)` and `401(a)(17)` carry no uppercase letters at
 * all and need no exemption — listed here only so the next reader does not
 * go looking for them.
 */
const PROPER_NOUNS = ["SECURE", "FICA", "USD", "IRA", "IRS", "HSA", "Roth"];

/**
 * Every user-facing string in the module, by WALKING the object.
 *
 * Deliberately not a hand-written list of fields and deliberately not a
 * regex over the source text. A hand-written list goes stale the moment a
 * field is added — `relatedTool` and `sources` both arrived after this
 * module shipped — and extracting the literals with a regex first is what
 * made an earlier sweep of this file report zero shouted words when there
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
    "us-401k.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("gop-401k at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "90.000" through parseDecimal is 90, and the age and the year are
    // counts, not money: parseMoney("30") is fine but parseMoney("3.0")
    // would be 30, which is the failure this pattern exists to catch.
    expect(shippedInput()).toEqual({
      year: 2026,
      age: 35,
      annualSalary: 90_000,
      priorYearWages: 90_000,
      deferralPercent: 3,
      employerMatchPercent: 100,
      employerMatchLimitPercent: 6,
      employerExtraPercent: 0,
      marginalRatePercent: 24,
      returnPercent: 7,
      years: 30,
    });
  });

  it("opens on a reader who IS leaving match behind", () => {
    // A page about forfeited match whose default state forfeits nothing has
    // nothing to show.
    const r = run();
    expect(r.unclaimedMatch).toBeGreaterThan(0);
  });

  it("quotes the year's forfeited match and what it grows to", () => {
    const r = run();
    expect(usdCents(r.deferral)).toBe("2.700,00");
    expect(usdCents(r.employerMatch)).toBe("2.700,00");
    expect(usdCents(r.unclaimedMatch)).toBe("2.700,00");
    expect(usd(r.unclaimedMatchAtHorizon)).toBe("272.897");
    expect(C.forfeitNotice).toContain("2.700");
    expect(C.forfeitNotice).toContain("272.897");
  });

  it("quotes the cost of fixing it, and the return on that cost", () => {
    const now = run();
    const full = run({ deferralPercent: 6 });
    const extraNetCost = full.netCostOfDeferral - now.netCostOfDeferral;
    const extraIn = full.totalContribution - now.totalContribution;
    expect(usdCents(extraNetCost)).toBe("2.052,00");
    expect(usdCents(extraIn)).toBe("5.400,00");
    expect(formatPercent((extraIn / extraNetCost) * 100, 0)).toBe("263%");
    expect(usd(now.projectedBalance)).toBe("545.794");
    expect(usd(full.projectedBalance)).toBe("1.091.589");
    // "đúng gấp đôi" — a dollar-for-dollar match on a doubled deferral is
    // exactly twice the contribution, so exactly twice the balance.
    expect(full.projectedBalance / now.projectedBalance).toBeCloseTo(2, 10);
    for (const figure of ["2.052", "5.400", "263%", "545.794", "1.091.589"]) {
      expect(C.forfeitNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("makes the forfeited match equal the match received, at 3% of a 6% formula", () => {
    // Not a coincidence worth hiding: half the threshold claims half the
    // match. Asserted so the two equal figures in the notice are explained
    // rather than looking like a copy-paste slip.
    const r = run();
    expect(r.unclaimedMatch).toBe(r.employerMatch);
    expect(r.matchReturnPercent).toBe(100);
    expect(r.matchValueAtHorizon).toBeCloseTo(r.unclaimedMatchAtHorizon, 6);
  });

  it("quotes the compensation ceiling's effect on a high earner", () => {
    const rich = run({ annualSalary: 500_000, deferralPercent: 6 });
    expect(rich.compensationCapped).toBe(true);
    expect(usd(rich.planCompensation)).toBe("360.000");
    expect(usd(rich.employerMatch)).toBe("21.600");
    expect(usd(500_000 * 0.06)).toBe("30.000");
    expect(usd(500_000 * 0.06 - rich.employerMatch)).toBe("8.400");
    const a = C.faq.items[3].a;
    for (const figure of ["360.000", "21.600", "30.000", "8.400"]) {
      expect(a, `FAQ 4 is missing ${figure}`).toContain(figure);
    }
    // And the copy's ceiling figure is the module's, not a literal.
    expect(a).toContain(usd(RETIREMENT_LIMITS[2026].compensation));
  });

  it("holds the MATCH to the 401(a)(17) ceiling and the reader's own deferral to 402(g)", () => {
    // The ceiling belongs on the EMPLOYER's side of the formula only.
    // IRS, "401(k) plans - deferrals and matching when compensation exceeds
    // the annual limit": a participant "may contribute to the plan until she
    // reaches her annual deferral limit ... even though her compensation
    // will exceed the annual limit", while the match formula may be applied
    // only to compensation up to the ceiling — its worked example pays
    // 50% x 5% x 280.000 on a 360.000 salary, and does NOT cut her own
    // 19.000 deferral down to a percent of 280.000.
    //
    // So on a 500.000 salary a 4% election is 4% of the SALARY, 20.000,
    // which is inside 402(g) and therefore goes in whole. Reading it as 4%
    // of the 360.000 ceiling would report 14.400 and understate what this
    // reader may defer by 5.600 — on the one page in the suite whose
    // subject is money left on the table.
    const p = RETIREMENT_LIMITS[2026];
    const low = run({ annualSalary: 500_000, deferralPercent: 4 });
    expect(low.deferral).toBe(500_000 * 0.04);
    expect(low.deferral).toBeLessThan(p.electiveDeferral);
    // And the percent reported back is the percent the reader typed, in the
    // case where no limit cut the election short.
    expect(low.effectiveDeferralPercent).toBeCloseTo(4, 10);

    // 402(g), not the ceiling, is what stops a large election — and the
    // match still stops at 6% of the ceiling.
    const high = run({ annualSalary: 500_000, deferralPercent: 20 });
    expect(high.deferral).toBe(p.electiveDeferral);
    expect(high.employerMatch).toBe(p.compensation * 0.06);
    expect(high.maxEmployerMatch).toBe(p.compensation * 0.06);
  });

  it("quotes the drop in the deferral ceiling at 64", () => {
    const at63 = run({ age: 63, annualSalary: 200_000, deferralPercent: 100 });
    const at64 = run({ age: 64, annualSalary: 200_000, deferralPercent: 100 });
    expect(usd(at63.deferralLimit)).toBe("35.750");
    expect(usd(at64.deferralLimit)).toBe("32.500");
    expect(usd(at63.deferralLimit - at64.deferralLimit)).toBe("3.250");
    const a = C.faq.items[1].a;
    for (const figure of ["35.750", "32.500", "3.250"]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("keeps the prose's 415(c) and 401(a)(17) figures tied to the table", () => {
    const p = RETIREMENT_LIMITS[2026];
    // formula.body[3] quotes the compensation ceiling and the match it caps.
    expect(C.formula.body[3]).toContain(usd(p.compensation));
    expect(C.formula.body[3]).toContain(usd(p.compensation * 0.06));
    expect(C.formula.body[3]).toContain(usd(500_000 * 0.06));
  });

  it("does not tell a high earner the income ceiling caps their own deferral", () => {
    // formula.body[3] used to close with "Trần này cũng áp cho tỷ lệ góp của
    // bạn, không chỉ cho phần đối ứng" — the reverse of the rule. The
    // paragraph has to name what this reader may still defer, and name the
    // limit that actually stops them, with the figure quoted from the module
    // rather than written out as a literal.
    const p = RETIREMENT_LIMITS[2026];
    const rich = run({ annualSalary: 500_000, deferralPercent: 6 });
    expect(rich.deferral).toBe(p.electiveDeferral);
    expect(C.formula.body[3]).toContain(usd(p.electiveDeferral));
    expect(C.formula.body[3]).toContain("402(g)");
  });

  it("does not claim the employer match is always traditional", () => {
    // SECURE 2.0 s.604 lets a plan offer matching and non-elective
    // contributions as designated Roth at the participant's election, so
    // "the match always lands in a traditional account" stopped being true.
    // It is the default and the plan decides, which is what the answer has
    // to say — this page's own model still computes the traditional case.
    const a = C.faq.items[2].a;
    expect(a).toContain("SECURE 2.0");
    expect(a).not.toContain("luôn vào tài khoản truyền thống");
  });

  it("pins the sensitivity table the component renders", () => {
    const input = shippedInput();
    const percents = Array.from(
      new Set(
        [0, 2, 4, 6, 8, 10, 15, input.deferralPercent, input.employerMatchLimitPercent]
          .filter((percent) => percent >= 0 && percent <= 100)
          .map((percent) => Math.round(percent * 100) / 100),
      ),
    ).sort((a, b) => a - b);
    expect(percents).toEqual([0, 2, 3, 4, 6, 8, 10, 15]);

    const unclaimed = percents.map((percent) =>
      usd(run({ deferralPercent: percent }).unclaimedMatch),
    );
    expect(unclaimed).toEqual([
      "5.400",
      "3.600",
      "2.700",
      "1.800",
      "0",
      "0",
      "0",
      "0",
    ]);
    // The claim the table intro makes: the column reaches zero at the
    // threshold and never goes negative.
    for (const percent of percents) {
      expect(run({ deferralPercent: percent }).unclaimedMatch).toBeGreaterThanOrEqual(0);
    }
  });

  it("stops paying match above the threshold, as the table intro says", () => {
    const at = run({ deferralPercent: 6 });
    for (const percent of [8, 10, 15, 100]) {
      expect(run({ deferralPercent: percent }).employerMatch).toBe(
        at.employerMatch,
      );
    }
  });

  it("quotes the deduction the Roth catch-up rule removes", () => {
    const r = run({
      age: 55,
      annualSalary: 200_000,
      priorYearWages: 200_000,
      deferralPercent: 100,
      marginalRatePercent: 32,
    });
    expect(r.catchUpForcedRoth).toBe(true);
    expect(usd(r.deferral)).toBe("32.500");
    expect(usd(r.deductibleDeferral)).toBe("24.500");
    expect(usdCents(r.catchUpUsed * 0.32)).toBe("2.560,00");
    // The header records it; the prose states the rule without the figures,
    // which is deliberate — the threshold is a moving statutory number and
    // the page points at the module for it.
    expect(C.formula.body[5]).toContain("Roth");
  });

  it("shouts nowhere mid-sentence", () => {
    // The capitals were the only emphasis available before `ProseText`
    // existed. Sentence case plus declared phrases replaces them, and
    // wrapping <strong> around text that is ALREADY shouted would stack two
    // mechanisms and keep the capitals.
    //
    // VACUITY GUARD FIRST, because a sweep that matches nothing passes on
    // every file. Prove the detector fires on lines this module really
    // shipped, and prove the proper-noun allowlist does not swallow a real
    // shout standing next to one.
    expect(shoutedRuns(["Đây là trần cho phần TIỀN CỦA BẠN"])).toEqual([
      "TIỀN",
      "CỦA",
      "BẠN",
    ]);
    expect(shoutedRuns(["Lương FICA năm trước tại công ty này"])).toEqual([]);
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

  it("refuses a year with no published limits rather than borrowing one", () => {
    expect(computeUs401k({ ...shippedInput(), year: 2019 })).toBe(null);
    expect(C.form.yearHelp).toContain("từ chối");
  });
});

/**
 * The 46 <-> 47 cross-link.
 *
 * These two pages answer halves of one question — how much match a formula
 * pays over a year, and what spreading the deferral across the year does to
 * it — and neither linked to the other while both described the other in
 * prose. The link CANNOT go through `TOOL_NEXT_STEPS`: `next-steps.test.ts`
 * fails if any library-shelved row has an entry, and both of these are
 * shelved `hoa-ky`. So it lives in each row's own content and is rendered by
 * each row's own route through the shell's `afterCalculator` slot.
 *
 * What is asserted here is that the link RESOLVES — a slug that is live in
 * the registry, with a route file on disk — rather than that a hand-written
 * href string is present. A dead cross-link is worse than none: the reader
 * followed it because the page told them to.
 */
describe("gop-401k <-> toi-da-401k cross-link", () => {
  const routeFile = (slug: string) =>
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      `../../app/cong-cu/${slug}/page.tsx`,
    );

  it("points at a sibling that is live in the registry", () => {
    for (const [from, related] of [
      ["gop-401k", C.relatedTool],
      ["toi-da-401k", US_401K_MAX.relatedTool],
    ] as const) {
      const entry = getCalculator(related.slug);
      expect(entry, `${from} links to "${related.slug}", not in the registry`)
        .toBeDefined();
      expect(entry!.status).toBe("live");
      expect(existsSync(routeFile(related.slug))).toBe(true);
    }
  });

  it("points the two rows at each other, not at a third page", () => {
    expect(C.relatedTool.slug).toBe("toi-da-401k");
    expect(US_401K_MAX.relatedTool.slug).toBe("gop-401k");
    expect(calculatorPath(C.relatedTool.slug)).toBe("/cong-cu/toi-da-401k");
    expect(calculatorPath(US_401K_MAX.relatedTool.slug)).toBe("/cong-cu/gop-401k");
  });

  it("renders it from the route, and not through TOOL_NEXT_STEPS", () => {
    for (const slug of ["gop-401k", "toi-da-401k"] as const) {
      const page = readFileSync(routeFile(slug), "utf8");
      expect(page, `${slug} does not render afterCalculator`).toContain(
        "afterCalculator",
      );
      expect(page, `${slug} does not use its relatedTool`).toContain(
        "relatedTool",
      );
      // The guard that makes the in-content route necessary. If this ever
      // returns an entry, next-steps.test.ts is already red.
      expect(nextStepsFor(slug)).toBeUndefined();
    }
  });

  it("gives the reader a reason to follow it, not just a title", () => {
    for (const related of [C.relatedTool, US_401K_MAX.relatedTool]) {
      expect(related.why.length).toBeGreaterThan(40);
      expect(related.title.length).toBeGreaterThan(0);
    }
  });
});

/**
 * The three rows bound by `lib/calc/us-retirement-limits.ts`.
 *
 * `gop-401k`, `toi-da-401k` and `ira-truyen-thong-hay-roth` read one dated
 * limits table, so a year refresh has to move all three together. Each row
 * already pins its OWN default against its own figures, and nothing
 * asserted that the three agree with each other or that they track the
 * newest year the module publishes. The failure this catches is a refresh
 * that adds a year to the table and updates two of the three pages — which
 * is the shape the module's own docstring warns about, a limit one year
 * stale answering confidently for exactly the readers sitting at the cap.
 *
 * PROPERTY GUARD. This passed on its first run; it reproduces nothing
 * currently wrong.
 */
describe("the three rows sharing us-retirement-limits.ts", () => {
  it("all default to the newest year the limits table publishes", () => {
    const newest = RETIREMENT_LIMIT_YEAR_ORDER[0];
    expect(RETIREMENT_LIMITS[newest]).toBeDefined();
    for (const [slug, year] of [
      ["gop-401k", C.form.defaults.year],
      ["toi-da-401k", US_401K_MAX.form.defaults.year],
      ["ira-truyen-thong-hay-roth", US_IRA.form.defaults.year],
    ] as const) {
      expect(Number(year), `${slug} is not on the newest published year`).toBe(
        newest,
      );
    }
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
 * this module on 2026-09-16 and both pages rendered seven `<strong>` each
 * while still filed `reference` — a real inconsistency that the whole suite
 * stayed green through, because the only emphasis assertions in the repo
 * look at rows already filed `emphasis`. This test is the second arrow.
 *
 * If a future pass has audience evidence that this page deserves reading
 * investment, the disposition moves FIRST and this test moves with it.
 */
describe("gop-401k — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("gop-401k")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("gop-401k")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a type error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "gop-401k is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("gop-401k — sources", () => {
  it("cites an openable source for every item", () => {
    expect(C.sources.items.length).toBeGreaterThan(0);
    for (const item of C.sources.items) {
      expect(item.url, "a source item has an empty url").not.toBe("");
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.label).not.toBe("");
    }
  });

  it("states the provenance limit rather than implying completeness", () => {
    // docs §3: a list of official links implies a completeness no page here
    // has earned, which is what `intro` exists to disclaim.
    expect(C.sources.intro).toBeDefined();
    expect(C.sources.intro.length).toBeGreaterThan(40);
  });

  it("cites the page that the 401(a)(17) correction rests on", () => {
    // The rule this page applies was changed against this source. If the
    // citation is dropped, the page asserts a finance rule with nothing
    // behind it.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("compensation-exceeds-the-annual-limit")),
      "the compensation-ceiling source is missing",
    ).toBe(true);
  });
});

describe("gop-401k — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const full = run({ deferralPercent: 6 });
    const rich = run({ annualSalary: 500_000, deferralPercent: 6 });
    const at63 = run({ age: 63, annualSalary: 200_000, deferralPercent: 100 });
    const at64 = run({ age: 64, annualSalary: 200_000, deferralPercent: 100 });
    const roth = run({
      age: 55,
      annualSalary: 200_000,
      priorYearWages: 200_000,
      deferralPercent: 100,
      marginalRatePercent: 32,
    });
    for (const figure of [
      usdCents(r.deferral),
      usdCents(r.employerMatch),
      usdCents(r.unclaimedMatch),
      usdCents(r.totalContribution),
      usdCents(r.incomeTaxSaved),
      usdCents(r.netCostOfDeferral),
      usd(r.projectedBalance),
      usd(r.matchValueAtHorizon),
      usd(r.unclaimedMatchAtHorizon),
      usdCents(full.totalContribution),
      usd(full.projectedBalance),
      usdCents(full.netCostOfDeferral - r.netCostOfDeferral),
      usdCents(full.totalContribution - r.totalContribution),
      usd(rich.planCompensation),
      usd(rich.employerMatch),
      usd(at63.deferralLimit),
      usd(at64.deferralLimit),
      usd(at63.deferralLimit - at64.deferralLimit),
      usd(roth.deferral),
      usd(roth.deductibleDeferral),
      usdCents(roth.catchUpUsed * 0.32),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
