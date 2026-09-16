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
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";
import { computeRmd, UNIFORM_LIFETIME, type RmdInput } from "@/lib/calc/us-rmd";
import { US_RMD as C } from "@/content/calculators/us-rmd";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): RmdInput {
  return {
    birthYear: parseCount(D.birthYear)!,
    currentAge: parseCount(D.currentAge)!,
    balance: parseMoney(D.balance)!,
    returnPercent: parseDecimal(D.returnPercent)!,
    endAge: parseCount(D.endAge)!,
    marginalRatePercent: parseDecimal(D.marginal)!,
    plannedWithdrawal: parseMoney(D.planned)!,
  };
}

function run(over: Partial<RmdInput> = {}) {
  const result = computeRmd({ ...shippedInput(), ...over });
  if (!result) throw new Error("computeRmd returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-rmd.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("rut-toi-thieu-bat-buoc at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      birthYear: 1953,
      currentAge: 73,
      balance: 800_000,
      returnPercent: 7,
      endAge: 95,
      marginalRatePercent: 22,
      plannedWithdrawal: 30_000,
    });
  });

  it("opens on a reader who is ALREADY short, by a rounded-down withdrawal", () => {
    // The commonest way to be penalised, and a default state that meets the
    // requirement exactly would not show it.
    const r = run();
    expect(r.alreadyRequired).toBe(true);
    expect(r.planMeetsRequirement).toBe(false);
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.shortfall).toBeLessThan(200);
  });

  it("quotes this year's required amount, percentage and tax", () => {
    const r = run();
    expect(r.divisor).toBe(UNIFORM_LIFETIME[73]);
    expect(usdCents(r.required)).toBe("30.188,68");
    expect(formatPercent(r.requiredPercent!, 2)).toBe("3,77%");
    expect(usdCents(r.taxOnRequired)).toBe("6.641,51");
    expect(C.risingNotice).toContain("30.188,68");
    expect(C.risingNotice).toContain("3,77%");
  });

  it("quotes the penalty on the small shortfall", () => {
    const r = run();
    expect(usdCents(r.shortfall)).toBe("188,68");
    expect(usdCents(r.penalty)).toBe("47,17");
    expect(usdCents(r.penaltyIfCorrected)).toBe("18,87");
    const a = C.faq.items[0].a;
    for (const figure of ["30.188,68", "30.000", "188,68", "47,17"]) {
      expect(a, `FAQ 1 is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the rising percentage at the ages the copy names", () => {
    const r = run();
    const at = (age: number) =>
      formatPercent(r.years.find((row) => row.age === age)!.requiredPercent!, 2);
    expect(at(73)).toBe("3,77%");
    expect(at(85)).toBe("6,25%");
    // Age 100 is past this projection's end, so read the table directly —
    // the percentage is a property of the table, not of the projection.
    expect(formatPercent(100 / UNIFORM_LIFETIME[100], 2)).toBe("15,63%");
    for (const figure of ["3,77%", "6,25%", "15,63%"]) {
      expect(C.risingNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the peak, the final balance and the totals", () => {
    const r = run();
    expect(r.peakAge).toBe(85);
    expect(usd(r.peakBalance)).toBe("1.010.339");
    expect(usd(r.finalBalance)).toBe("846.673");
    expect(usd(r.totalRequired)).toBe("1.309.790");
    expect(usd(r.totalTax)).toBe("288.154");
    // The claim that makes the page: still above the starting balance after
    // twenty-two years of mandatory draws.
    expect(r.finalBalance).toBeGreaterThan(800_000);
    for (const figure of [
      "1.010.339",
      "846.673",
      "1.309.790",
      "288.154",
      "800.000",
    ]) {
      expect(C.risingNotice, `notice is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the crossover threshold, and that it is not the return", () => {
    const r = run();
    const threshold = (0.07 / 1.07) * 100;
    expect(formatPercent(threshold, 2)).toBe("6,54%");
    const at85 = r.years.find((row) => row.age === 85)!;
    const at86 = r.years.find((row) => row.age === 86)!;
    expect(at85.stillGrowing).toBe(true);
    expect(at86.stillGrowing).toBe(false);
    expect(formatPercent(at85.requiredPercent!, 2)).toBe("6,25%");
    expect(formatPercent(at86.requiredPercent!, 2)).toBe("6,58%");
    for (const figure of ["6,54%", "6,25%", "6,58%"]) {
      expect(C.formula.body[4], `formula 5 is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the 1960 cohort, which has a table row and no obligation", () => {
    const later = run({ birthYear: 1960, currentAge: 73 });
    expect(later.startAge).toBe(75);
    expect(later.yearsUntilRequired).toBe(2);
    expect(later.required).toBe(0);
    expect(later.divisor).toBe(null);
    // The table row exists all the same, which is the distinction the copy
    // draws in formula.body[3].
    expect(UNIFORM_LIFETIME[73]).toBe(26.5);
    expect(C.formula.body[3]).toContain("26,5");

    const at75 = run({ birthYear: 1960, currentAge: 75 });
    expect(usdCents(at75.required)).toBe("32.520,33");
    expect(formatPercent(at75.requiredPercent!, 2)).toBe("4,07%");
  });

  it("names the start ages the field help promises", () => {
    expect(run({ birthYear: 1949, currentAge: 80 }).startAge).toBe(72);
    expect(run({ birthYear: 1955, currentAge: 80 }).startAge).toBe(73);
    expect(run({ birthYear: 1965, currentAge: 80 }).startAge).toBe(75);
    for (const figure of ["1960", "75", "1951", "1959", "73", "72"]) {
      expect(C.form.birthYearHelp, `help is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("gives the table one row per projected year", () => {
    const r = run();
    expect(r.years).toHaveLength(22);
    expect(r.years[0].age).toBe(73);
    expect(r.years.at(-1)!.age).toBe(94);
    // The claim the table intro makes: the percentage only ever rises.
    for (let i = 1; i < r.years.length; i += 1) {
      expect(r.years[i].requiredPercent!).toBeGreaterThan(
        r.years[i - 1].requiredPercent!,
      );
    }
    // And the balance goes up before it comes down, so it is not monotone.
    expect(r.years.some((row) => row.stillGrowing)).toBe(true);
    expect(r.years.some((row) => !row.stillGrowing)).toBe(true);
  });

  it("says out loud what it does not model", () => {
    expect(C.formula.body[6]).toContain("mười tuổi");
    expect(C.formula.body[6]).toContain("thừa kế");
    expect(C.formula.body[2]).toContain("1959");
  });
});

describe("rut-toi-thieu-bat-buoc — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const at75 = run({ birthYear: 1960, currentAge: 75 });
    for (const figure of [
      usdCents(r.required),
      usdCents(r.taxOnRequired),
      usdCents(r.shortfall),
      usdCents(r.penalty),
      usdCents(r.penaltyIfCorrected),
      usd(r.peakBalance),
      usd(r.finalBalance),
      usd(r.totalRequired),
      usd(r.totalTax),
      usdCents(at75.required),
      formatPercent(r.requiredPercent!, 2),
      formatPercent(at75.requiredPercent!, 2),
      formatPercent(100 / UNIFORM_LIFETIME[85], 2),
      formatPercent(100 / UNIFORM_LIFETIME[86], 2),
      formatPercent(100 / UNIFORM_LIFETIME[100], 2),
      formatPercent((0.07 / 1.07) * 100, 2),
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
 * ---------------------------------------------------------------------------
 */

/**
 * Proper nouns a reader cannot mistake for shouting.
 *
 * "III" earned its place the honest way: the first run of the sweep below
 * reported it, from the source label naming Appendix B, Table III. That is
 * the detector working on real copy rather than on its fixtures, so it is
 * recorded here rather than quietly widened.
 */
const PROPER_NOUNS = ["USD", "IRS", "IRA", "RMD", "SECURE", "Roth", "III"];

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

describe("rut-toi-thieu-bat-buoc's copy", () => {
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
    // every file. All three fixtures are lines this module REALLY shipped
    // before 2026-09-16.
    expect(
      shoutedRuns(["Mức dự định rút của bạn THẤP HƠN mức bắt buộc."]),
    ).toEqual(["THẤP", "HƠN"]);
    expect(
      shoutedRuns(["Số tiền phạt tính trên PHẦN THIẾU, không phải trên"]),
    ).toEqual(["PHẦN", "THIẾU"]);
    // And the allowlist must not swallow a real shout beside an allowed one.
    expect(
      shoutedRuns(["Roth IRA thì KHÔNG phải rút, theo SECURE 2.0"]),
    ).toEqual(["KHÔNG"]);
    expect(
      shoutedRuns(["Khoản rút chịu thuế, khai với IRS bằng USD"]),
    ).toEqual([]);

    expect(shoutedRuns(userFacingStrings(C))).toEqual([]);
  });
});

describe("rut-toi-thieu-bat-buoc — the correction window is quantified", () => {
  it("states two years wherever it states the reduced penalty", () => {
    // "trong thời hạn quy định" was true and unactionable, on the one figure
    // a reader in this situation would move on. IRS states the window as two
    // years; all three surfaces that mention the 10% rate now say so.
    expect(C.form.correctedLabel).toContain("2 năm");
    expect(C.form.shortfallNotice).toContain("2 năm");
    expect(C.formula.body[5]).toContain("2 năm");
  });

  it("keeps the penalty on the shortfall, not on the whole withdrawal", () => {
    // The claim the two rates hang off. Asserted against the model so the
    // sentence cannot outlive the arithmetic.
    const r = run();
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.penalty).toBeCloseTo(r.shortfall * 0.25, 8);
    expect(r.penaltyIfCorrected).toBeCloseTo(r.shortfall * 0.1, 8);
    expect(r.penalty).toBeLessThan(r.required * 0.25);
    expect(C.formula.body[5]).toContain("phần thiếu");
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
 * reading. If that evidence arrives, the disposition moves FIRST and this
 * test moves with it.
 */
describe("rut-toi-thieu-bat-buoc — reading disposition adds nothing", () => {
  it("is a hoa-ky row, filed reference, declaring no emphasis", () => {
    expect(dispositionFor("rut-toi-thieu-bat-buoc")?.library).toBe("hoa-ky");
    expect(readingDispositionFor("rut-toi-thieu-bat-buoc")).toBe("reference");
    // `in`, not a property read: the content object is `as const`, so once
    // the key is gone `C.formula.emphasis` is a TYPE error rather than
    // `undefined`, and a test that cannot compile guards nothing.
    expect(
      "emphasis" in C.formula,
      "rut-toi-thieu-bat-buoc is filed `reference` but declares emphasis phrases",
    ).toBe(false);
  });
});

describe("rut-toi-thieu-bat-buoc — sources", () => {
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

  it("cites the publication the vendored table comes from", () => {
    // The divisor table is the ONLY data on this page that does not come
    // from the reader's own inputs, which is what makes it the figure that
    // must be checkable. It was named in four places with no href.
    const urls = C.sources.items.map((item) => item.url);
    expect(
      urls.some((url) => url.includes("p590b")),
      "the Uniform Lifetime Table source is missing",
    ).toBe(true);
    expect(
      urls.every((url) => url.includes("irs.gov")),
      "a source is not on an official IRS host",
    ).toBe(true);
  });

  it("agrees with the cited publication at the one divisor both state", () => {
    // Pub 590-B's worked example uses 24,6 for age 75. The vendored table
    // must return the same, or the citation is decoration. This is the cheap
    // cross-check the docs recommend wherever two sources of one published
    // figure overlap.
    expect(UNIFORM_LIFETIME[75]).toBe(24.6);
    const notes = C.sources.items.map((i) => i.note ?? "").join(" ");
    expect(notes).toContain("24,6");
    // And the figure in the source note is the module's, not a literal that
    // could drift from it.
    expect(notes).toContain(
      String(UNIFORM_LIFETIME[75]).replace(".", ","),
    );
  });

  it("does not claim a source for what the page says it never models", () => {
    // `intro` must not imply the list covers inherited accounts or the Joint
    // Life table, because formula.body[6] says those are out of scope. A
    // citation implying otherwise is the completeness claim `intro` exists
    // to prevent.
    expect(C.sources.intro).toContain("thừa kế");
    expect(C.sources.intro).toContain("Tuổi thọ Chung");
  });
});
