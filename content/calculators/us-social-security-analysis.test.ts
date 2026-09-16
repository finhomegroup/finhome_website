import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatDecimal,
  formatMoney,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  benefitFactorPercent,
  claimingAnalysis,
  fullRetirementAgeMonths,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ANALYSIS as C } from "@/content/calculators/us-social-security-analysis";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shipped() {
  return {
    pia: parseMoney(D.pia)!,
    birthYear: parseCount(D.birthYear)!,
    endAge: parseCount(D.endAge)!,
    discount: parseDecimal(D.discount)!,
  };
}

function analyse(over: Partial<ReturnType<typeof shipped>> = {}) {
  const input = { ...shipped(), ...over };
  const result = claimingAnalysis({
    pia: input.pia,
    fraMonths: fullRetirementAgeMonths(input.birthYear),
    endAge: input.endAge,
    discountRatePercent: input.discount,
  });
  if (!result) throw new Error("claimingAnalysis returned null");
  return result;
}

const at = (result: ReturnType<typeof analyse>, age: number) =>
  result.options.find((option) => option.age === age)!;

const usd = (v: number) => formatMoney(v);
/** The component's break-even formatter: two decimals of a year. */
const years = (months: number) => formatDecimal(months / 12, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-social-security-analysis.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("phan-tich-an-sinh-xa-hoi at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shipped()).toEqual({
      pia: 2_800,
      birthYear: 1963,
      endAge: 85,
      discount: 3,
    });
  });

  it("opens on the case where the two measures DISAGREE", () => {
    // A default state where both agree would hide the page's whole point.
    const r = analyse();
    expect(r.bestByNominal.age).toBe(70);
    expect(r.bestByPresentValue.age).toBe(68);
    expect(r.bestByNominal.age).not.toBe(r.bestByPresentValue.age);
  });

  it("quotes the two totals and the two present values", () => {
    const r = analyse();
    expect(usd(at(r, 62).nominalTotal)).toBe("540.960");
    expect(usd(at(r, 70).nominalTotal)).toBe("624.960");
    expect(usd(at(r, 62).presentValue)).toBe("390.426");
    expect(usd(at(r, 68).presentValue)).toBe("403.341");
    expect(usd(at(r, 70).presentValue)).toBe("395.607");
    // The claim that makes the notice: 70 is worth LESS than 68 here.
    expect(at(r, 70).presentValue).toBeLessThan(at(r, 68).presentValue);
    for (const figure of ["540.960", "624.960", "403.341", "395.607"]) {
      expect(C.twoAnswersNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the monthly amounts at both ends", () => {
    const r = analyse();
    expect(usd(at(r, 62).monthlyBenefit)).toBe("1.960");
    expect(usd(at(r, 67).monthlyBenefit)).toBe("2.800");
    expect(usd(at(r, 70).monthlyBenefit)).toBe("3.472");
  });

  it("quotes the 80-and-4-months break-even", () => {
    const r = analyse();
    const months = at(r, 70).breakEvenMonthsVsEarliest!;
    expect(years(months)).toBe("80,37");
    expect(Math.floor(months / 12)).toBe(80);
    expect(Math.round(months) % 12).toBe(4);
    expect(C.twoAnswersNotice).toContain("80 tuổi 4 tháng");
  });

  it("pins the whole break-even column, dip included", () => {
    const r = analyse();
    const column = [63, 64, 65, 66, 67, 68, 69, 70].map((age) =>
      years(at(r, age).breakEvenMonthsVsEarliest!),
    );
    expect(column).toEqual([
      "77,00",
      "78,00",
      "77,62",
      "78,01",
      "78,67",
      "79,05",
      "79,65",
      "80,37",
    ]);
    // The dip the table intro and the second FAQ both explain.
    expect(at(r, 65).breakEvenMonthsVsEarliest!).toBeLessThan(
      at(r, 64).breakEvenMonthsVsEarliest!,
    );
    expect(C.form.table.intro).toContain("78,00");
    expect(C.form.table.intro).toContain("77,62");
    const a = C.faq.items[1].a;
    for (const figure of ["78,00", "77,62", "5/9", "5/12"]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the per-year rewards that cause the dip", () => {
    // 5, 6,67 and 8 points a year. Derived from the module's own monthly
    // figures rather than from the statute, so the copy cannot drift.
    const r = analyse();
    const factor = (age: number) => at(r, age).factorPercent;
    expect(factor(63) - factor(62)).toBeCloseTo(5, 8);
    expect(factor(65) - factor(64)).toBeCloseTo(6.667, 3);
    expect(factor(68) - factor(67)).toBeCloseTo(8, 8);
    for (const figure of ["5 điểm", "6,67 điểm", "8 điểm"]) {
      expect(C.formula.body[4], `formula 5 is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the interior optimum at a short horizon", () => {
    const short = analyse({ endAge: 78, discount: 0 });
    expect(short.bestByNominal.age).toBe(65);
    expect(usd(at(short, 65).nominalTotal)).toBe("378.456");
    expect(usd(at(short, 62).nominalTotal)).toBe("376.320");
    expect(usd(at(short, 70).nominalTotal)).toBe("333.312");
    const body = C.formula.body[5];
    for (const figure of ["378.456", "376.320", "333.312"]) {
      expect(body, `formula 6 is missing ${figure}`).toContain(figure);
    }
  });

  it("makes both measures agree at a long horizon", () => {
    const long = analyse({ endAge: 95 });
    expect(long.bestByNominal.age).toBe(70);
    expect(long.bestByPresentValue.age).toBe(70);
    expect(usd(at(long, 70).nominalTotal)).toBe("1.041.600");
    expect(usd(at(long, 70).presentValue)).toBe("576.112");
    // So the page shows the agreeing notice, which still names what the
    // table cannot see.
    expect(C.form.agreeNotice).toContain("người còn sống");
  });

  it("leaves the break-even unchanged by the horizon and the rate", () => {
    // A crossing is a property of two payment streams. If it moved with the
    // end age or the discount rate the column would be meaningless.
    const base = at(analyse(), 70).breakEvenMonthsVsEarliest!;
    for (const over of [{ endAge: 75 }, { endAge: 110 }, { discount: 0 }, { discount: 9 }]) {
      expect(
        at(analyse(over), 70).breakEvenMonthsVsEarliest!,
        JSON.stringify(over),
      ).toBeCloseTo(base, 10);
    }
  });

  it("says out loud what it does not model", () => {
    expect(C.formula.body[6]).toContain("vợ/chồng");
    expect(C.formula.body[6]).toContain("người còn sống");
    expect(C.faq.items[3].q).toContain("kết hôn");
  });

  it("names the United States in the H1 and in the first paragraph", () => {
    // Same reasoning as the estimate page's copy of this test: the registry
    // guard in plan-disposition.test.ts covers the hub title only, and this
    // page's H1 and lede were the weakest of the three — before this, the
    // only "Hoa Kỳ" in the whole module was the metaDescription, which no
    // reader sees.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(C.metaTitle).toContain("Hoa Kỳ");
    expect(C.lede).toContain("Hoa Kỳ");
  });

  it("does not call a life expectancy a median", () => {
    // A life expectancy is a MEAN — the average remaining years in a life
    // table — not the age half a cohort outlives. The two differ, and the
    // copy asserted the median reading as a definition in two places.
    //
    // The page's advice is unaffected and in fact stronger without the
    // claim: enter above the expectancy, because an average is not a
    // threshold you have a known chance of passing. Asserting the absence
    // rather than a replacement wording is deliberate — the defect was a
    // false definition, and any rewording that reintroduces it should fail.
    for (const text of [C.form.endAgeHelp, C.faq.items[0].a]) {
      expect(text).not.toContain("trung vị");
      expect(text).not.toContain("TRUNG VỊ");
    }
    // And the actionable half survives in both.
    expect(C.form.endAgeHelp).toContain("bình quân");
    expect(C.faq.items[0].a).toContain("Cao hơn kỳ vọng sống");
  });
});

/**
 * EVERY FIGURE IN THIS PAGE'S TABLE IS A STATUTORY FACTOR TIMES ONE INPUT.
 *
 * The reader supplies the PIA; the nine rows are that PIA times a percentage
 * the statute fixes and this tool does not expose — 5/9 of one percent a month
 * for the first 36 months early, 5/12 beyond them, 2/3 of one percent a month
 * late. There is no field, no year selector and nothing on the page to
 * disagree with, so the citation is the reader's only check. This block pins
 * the whole curve against the table SSA publishes, which is the one artifact
 * that would catch a factor edited in `lib/` — the break-even columns already
 * tested above are all derived from those same factors and would move with
 * them without a single assertion going red.
 *
 * The block is shared with the other two Social Security rows, in
 * `content/calculators/us-social-security-sources.ts`: one statute, one list,
 * and no way for three pages to end up citing three different things.
 */
describe("phan-tich-an-sinh-xa-hoi cites the factors it will not let you change", () => {
  const S = C.sources;
  const item = (tail: string) => {
    const found = S.items.find((entry) => entry.url.endsWith(tail));
    if (!found) throw new Error(`no cited source ends with ${tail}`);
    return found;
  };

  it("gives the reader links, every one of them a primary SSA page", () => {
    expect(S.items.length).toBeGreaterThanOrEqual(5);
    for (const entry of S.items) {
      expect(
        entry.url.startsWith("https://www.ssa.gov/"),
        `${entry.url} is not an https www.ssa.gov URL`,
      ).toBe(true);
      expect(entry.label.length).toBeGreaterThan(20);
      expect(entry.note, `${entry.label} has no note`).toBeDefined();
      expect(entry.note.length).toBeGreaterThan(40);
    }
  });

  it("names the issuing body, and states what the list does not cover", () => {
    expect(S.title).toContain("Cơ quan An sinh Xã hội Hoa Kỳ");
    expect(S.title).toContain("SSA");
    expect(S.intro).toContain("rà soát");
    expect(S.intro).toContain("16/09/2026");
    expect(S.intro).toContain("không phải danh sách đầy đủ");
    expect(S.intro).toContain("không phải tư vấn");
    expect(S.intro).toContain("KHÔNG có ô nhập nào để bạn sửa");
  });

  it("pins the whole age-factor curve against the SSA table it cites", () => {
    const fra = fullRetirementAgeMonths(shipped().birthYear);
    expect(fra).toBe(67 * 12);
    const published = item("ar_drc.html");
    // SSA's own percent-of-PIA table for a full retirement age of 67. The
    // module's value is asserted first, so a factor change breaks this even
    // if someone edits the note to match.
    for (const [age, percent] of [
      [62, 70],
      [63, 75],
      [64, 80],
      [67, 100],
      [70, 124],
    ] as const) {
      expect(benefitFactorPercent(fra, age * 12), `age ${age}`).toBe(percent);
      expect(published.note, `the cited table quotes no ${percent}%`).toContain(
        `${percent}%`,
      );
    }
    // The two ages SSA prints as thirds. Asserted against the module only —
    // the note quotes them the way the source writes them, as fractions.
    expect(benefitFactorPercent(fra, 65 * 12)!).toBeCloseTo(260 / 3, 10);
    expect(benefitFactorPercent(fra, 66 * 12)!).toBeCloseTo(280 / 3, 10);
    expect(published.note).toContain("86 2/3%");
    expect(published.note).toContain("93 1/3%");
    // A second cohort off the same table, because this page's birth-year
    // field reaches the 66 schedule too.
    expect(benefitFactorPercent(66 * 12, 62 * 12)).toBe(75);
    expect(benefitFactorPercent(66 * 12, 70 * 12)).toBe(132);
    expect(published.note).toContain("132%");
  });

  it("cites the 8%-a-year delayed credit as the fraction it is", () => {
    const fra = 67 * 12;
    // One year of waiting past full retirement age, from the module.
    expect(benefitFactorPercent(fra, fra + 12)).toBe(108);
    const delayed = item("delayret.html");
    expect(delayed.note).toContain("2/3 của 1%");
    expect(delayed.note).toContain("8,0%");
    // And that the credit stops, which is why 71 is refused rather than paid.
    expect(delayed.note).toContain("70");
    expect(benefitFactorPercent(fra, 71 * 12)).toBeNull();
  });

  it("writes the early-claiming scale as fractions, never as decimals", () => {
    const copy = [S.intro, ...S.items.map((entry) => entry.note)].join(" ");
    expect(copy).toContain("5/9 của 1%");
    expect(copy).toContain("5/12 của 1%");
    for (const rounded of ["0,55", "0,56", "0,41", "0,42", "0,67", "0,69"]) {
      expect(
        copy,
        `a statutory fraction is rounded to ${rounded} somewhere in the block`,
      ).not.toContain(rounded);
    }
  });
});

describe("phan-tich-an-sinh-xa-hoi — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = analyse();
    const short = analyse({ endAge: 78, discount: 0 });
    const long = analyse({ endAge: 95 });
    for (const figure of [
      usd(at(r, 62).monthlyBenefit),
      usd(at(r, 67).monthlyBenefit),
      usd(at(r, 70).monthlyBenefit),
      usd(at(r, 62).nominalTotal),
      usd(at(r, 67).nominalTotal),
      usd(at(r, 70).nominalTotal),
      usd(at(r, 62).presentValue),
      usd(at(r, 68).presentValue),
      usd(at(r, 70).presentValue),
      usd(at(short, 65).nominalTotal),
      usd(at(short, 62).nominalTotal),
      usd(at(short, 70).nominalTotal),
      usd(at(long, 70).nominalTotal),
      usd(at(long, 70).presentValue),
      ...[63, 64, 65, 66, 67, 68, 69, 70].map((age) =>
        years(at(r, age).breakEvenMonthsVsEarliest!),
      ),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
