import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseMoney,
} from "@/lib/calc/number";
import {
  aimeFromEarnings,
  BEND_POINT_YEAR_ORDER,
  BEND_POINTS,
  claimingSchedule,
  fullRetirementAgeMonths,
  PIA_RATES,
  piaFromAime,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_ESTIMATE as C } from "@/content/calculators/us-social-security-estimate";

const D = C.form.defaults;

/** The component's own parse and pipeline, reproduced — docs §6. */
function estimate(
  over: Partial<{
    formulaYear: number;
    earnings: number;
    yearsWorked: number;
    birthYear: number;
    claimAge: number;
  }> = {},
) {
  const input = {
    formulaYear: Number(D.formulaYear),
    earnings: parseMoney(D.earnings)!,
    yearsWorked: parseCount(D.yearsWorked)!,
    birthYear: parseCount(D.birthYear)!,
    claimAge: parseCount(D.claimAge)!,
    ...over,
  };
  const aime = aimeFromEarnings(
    input.earnings,
    input.yearsWorked,
    input.formulaYear,
  );
  if (!aime) throw new Error("aimeFromEarnings returned null");
  const pia = piaFromAime(aime.aime, input.formulaYear);
  if (!pia) throw new Error("piaFromAime returned null");
  const fraMonths = fullRetirementAgeMonths(input.birthYear);
  const schedule = claimingSchedule(pia.pia, fraMonths)!;
  const chosen = schedule.find((option) => option.age === input.claimAge)!;
  return { input, aime, pia, fraMonths, schedule, chosen };
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-social-security-estimate.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("uoc-tinh-an-sinh-xa-hoi at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const { input } = estimate();
    expect(input).toEqual({
      formulaYear: 2026,
      earnings: 78_000,
      yearsWorked: 35,
      birthYear: 1965,
      claimAge: 67,
    });
    // "78.000" through parseDecimal would be 78 — an AIME of 6,50 a month.
    expect(input.earnings).toBe(78_000);
  });

  it("opens on a full career at full retirement age", () => {
    // The clean baseline, so every variation the copy quotes is a departure
    // from a state the reader can see.
    const r = estimate();
    expect(r.aime.zeroYears).toBe(0);
    expect(r.aime.cappedByTaxableMaximum).toBe(false);
    expect(r.chosen.isFullRetirementAge).toBe(true);
    expect(r.chosen.factorPercent).toBeCloseTo(100, 10);
  });

  it("quotes the AIME, the PIA and the replacement rate", () => {
    const r = estimate();
    expect(usdCents(r.aime.aime)).toBe("6.500,00");
    expect(usdCents(r.pia.pia)).toBe("2.825,80");
    expect(formatPercent(r.pia.replacementRatePercent!, 2)).toBe("43,47%");
    expect(C.regressiveNotice).toContain("2.825,80");
    expect(C.regressiveNotice).toContain("43,47%");
  });

  it("quotes each tier of the formula from the module's bend points", () => {
    const r = estimate();
    const p = BEND_POINTS[2026];
    expect(usdCents(r.pia.firstTierAime)).toBe("1.286,00");
    expect(r.pia.firstTierAime).toBe(p.firstBendPoint);
    expect(usdCents(r.pia.firstTierPia)).toBe("1.157,40");
    expect(usdCents(r.pia.secondTierAime)).toBe("5.214,00");
    expect(usdCents(r.pia.secondTierPia)).toBe("1.668,48");
    expect(r.pia.thirdTierAime).toBe(0);
    expect(r.pia.marginalRatePercent).toBe(32);
  });

  it("quotes the whole claiming schedule the table renders", () => {
    const r = estimate();
    expect(r.schedule).toHaveLength(9);
    const at = (age: number) =>
      r.schedule.find((option) => option.age === age)!;
    expect(usd(at(62).monthlyBenefit)).toBe("1.978");
    expect(usd(at(67).monthlyBenefit)).toBe("2.825");
    expect(usd(at(70).monthlyBenefit)).toBe("3.503");
    expect(usd(at(70).monthlyBenefit - at(62).monthlyBenefit)).toBe("1.525");
    expect(formatMoney(at(70).monthlyBenefit / at(62).monthlyBenefit, 2)).toBe(
      "1,77",
    );
    expect(C.form.table.intro).toContain("1,77");
    expect(C.faq.items[2].a).toContain("1.978");
    expect(C.faq.items[2].a).toContain("3.503");
    expect(C.faq.items[2].a).toContain("1,77");
  });

  it("quotes what ten missing years cost, and why it is not 28,6%", () => {
    const full = estimate();
    const short = estimate({ yearsWorked: 25 });
    expect(short.aime.zeroYears).toBe(10);
    expect(usdCents(short.aime.aime)).toBe("4.642,86");
    expect(usdCents(short.pia.pia)).toBe("2.231,50");
    expect(usdCents(full.pia.pia - short.pia.pia)).toBe("594,30");
    const lost = (1 - short.pia.pia / full.pia.pia) * 100;
    expect(formatPercent(lost, 1)).toBe("21,0%");
    // Less than the 10-in-35 share, because the lost AIME sits in the 32%
    // tier rather than the 90% one. This is the FAQ's actual claim.
    expect(lost).toBeLessThan((10 / 35) * 100);
    expect(C.form.zeroYearsNotice).toContain("594,30");
    expect(C.form.zeroYearsNotice).toContain("21,0%");
    const a = C.faq.items[1].a;
    for (const figure of ["2.825,80", "2.231,50", "21,0%", "28,6%"]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
  });

  it("quotes the high earner, capped at the taxable maximum", () => {
    const high = estimate({ earnings: 400_000 });
    const p = BEND_POINTS[2026];
    expect(high.aime.cappedByTaxableMaximum).toBe(true);
    expect(usd(high.aime.cappedEarnings)).toBe("184.500");
    expect(high.aime.cappedEarnings).toBe(p.taxableMaximum);
    expect(usdCents(high.aime.aime)).toBe("15.375,00");
    expect(usdCents(high.pia.pia)).toBe("4.369,40");
    expect(formatPercent(high.pia.replacementRatePercent!, 2)).toBe("28,42%");
    expect(high.pia.marginalRatePercent).toBe(15);
  });

  it("quotes the low earner, and the regressivity between the two", () => {
    const low = estimate({ earnings: 30_000 });
    const mid = estimate();
    const high = estimate({ earnings: 400_000 });
    expect(usdCents(low.pia.pia)).toBe("1.545,80");
    expect(formatPercent(low.pia.replacementRatePercent!, 2)).toBe("61,83%");
    // The two ratios the notice puts side by side.
    expect(formatMoney(400_000 / 78_000, 2)).toBe("5,13");
    expect(formatMoney(high.pia.pia / mid.pia.pia, 2)).toBe("1,55");
    // Replacement falls monotonically as earnings rise, which is the claim.
    expect(low.pia.replacementRatePercent!).toBeGreaterThan(
      mid.pia.replacementRatePercent!,
    );
    expect(mid.pia.replacementRatePercent!).toBeGreaterThan(
      high.pia.replacementRatePercent!,
    );
    // The taxable maximum is DERIVED here, not typed. As a literal this
    // assertion would keep demanding the old figure after the constant was
    // bumped — a test defending a stale sentence, which docs §8 lists as a
    // finding in its own right. The percentages and ratios below stay
    // literal: they are pinned against the model three tests above, and
    // their whole purpose here is to catch a silent copy edit.
    for (const figure of [
      "61,83%",
      "28,42%",
      usd(BEND_POINTS[2026].taxableMaximum),
      "5,13",
      "1,55",
    ]) {
      expect(C.regressiveNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("reads the full retirement age off the birth year", () => {
    expect(estimate().fraMonths).toBe(67 * 12);
    expect(estimate({ birthYear: 1957 }).fraMonths).toBe(66 * 12 + 6);
    expect(estimate({ birthYear: 1950 }).fraMonths).toBe(66 * 12);
    expect(C.form.birthYearHelp).toContain("67");
    expect(C.form.birthYearHelp).toContain("1960");
  });

  it("marks no whole age as full retirement age for a mid-year cohort", () => {
    // The 1957 cohort reaches it at 66 and 6 months, so the table's "tuổi
    // hưởng đủ" marker must not appear on any row.
    const r = estimate({ birthYear: 1957 });
    expect(r.schedule.some((option) => option.isFullRetirementAge)).toBe(false);
  });

  it("does not claim equivalence with the SSA Quick Calculator", () => {
    // Source-review finding 3 (artifacts/.../us-reference-source-review.md:41).
    // The FAQ said this page works "đúng cách mà công cụ ước tính nhanh của
    // chính SSA hoạt động". It does not. The Quick Calculator takes a date
    // of birth and current earnings, RECONSTRUCTS an assumed year-by-year
    // earnings history, and lets the reader review and change it; this page
    // takes one average and divides by 35. The today's-money property the
    // paragraph explains is real and is kept — the equivalence claim on the
    // end of it was not verified and is not verifiable from here.
    const a = C.faq.items[0].a;
    expect(a).not.toContain("đúng cách mà công cụ ước tính nhanh");
    // The distinction is stated rather than merely left out, so the reader
    // who came for the comparison still gets an answer.
    expect(a).toContain("SSA");
    expect(a).toContain("lịch sử thu nhập");
  });

  it("says out loud that it is an estimate, as a standing notice", () => {
    // The one place this page could mislead, so the disclosure is not
    // conditional on any input.
    expect(C.form.estimateNotice).toContain("ƯỚC TÍNH");
    expect(C.form.estimateNotice).toContain("my Social Security");
    expect(C.faq.items[4].q).toContain("my Social Security");
  });

  it("names the United States in the H1 and in the first paragraph", () => {
    // The registry title carries "Hoa Kỳ" and plan-disposition.test.ts fails
    // the build if it does not. That guard stops at the hub: it never looks
    // at the page's own H1, which is what a reader arriving from search
    // actually reads first. "An sinh xã hội" is what BHXH is called here, so
    // an H1 without the country reads as a Vietnamese social-insurance tool.
    // The us-rules notice only reaches them after they start filling it in.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(C.metaTitle).toContain("Hoa Kỳ");
    expect(C.lede).toContain("Hoa Kỳ");
  });

  it("explains why the formula year is not the eligibility year", () => {
    expect(C.form.formulaYearHelp).toContain("giá hôm nay");
    expect(C.faq.items[0].q).toContain("62");
    expect(C.formula.body[3]).toContain("300 USD");
  });
});

/**
 * THE CITATION IS THE ONLY CHECK A READER HAS ON THESE RATES.
 *
 * `PIA_RATES` is hard-coded in `lib/calc/us-social-security.ts` with no field,
 * no year selector and, by its own comment, no indexation. So the page states
 * 90/32/15 and offers the reader nothing to disagree with: no box to correct,
 * nothing to recompute, and — before this block — no link to open either. That
 * is the state the `sources` block exists to end, and it is why these
 * assertions pin the rate against the MODULE rather than against a literal: a
 * silent edit to a number the reader cannot see would otherwise pass every
 * other test in this file, because every expected figure here is derived from
 * the same constant.
 *
 * The block itself is shared with the other two Social Security rows, in
 * `content/calculators/us-social-security-sources.ts` — one statute, one list.
 * `content/calculators/sources-wiring.test.ts` separately proves the block
 * reaches this page instead of merely being declared.
 */
describe("uoc-tinh-an-sinh-xa-hoi cites the rates it will not let you change", () => {
  const S = C.sources;
  const item = (tail: string) => {
    const found = S.items.find((entry) => entry.url.endsWith(tail));
    if (!found) throw new Error(`no cited source ends with ${tail}`);
    return found;
  };

  it("gives the reader links, every one of them a primary SSA page", () => {
    expect(S.items.length).toBeGreaterThanOrEqual(5);
    for (const entry of S.items) {
      // ssa.gov ONLY. A rate this page will not let the reader edit must not
      // be underwritten by a blog or an aggregator's summary of the statute.
      expect(
        entry.url.startsWith("https://www.ssa.gov/"),
        `${entry.url} is not an https www.ssa.gov URL`,
      ).toBe(true);
      // A "Nguồn" heading over a bare URL is not a citation either.
      expect(entry.label.length).toBeGreaterThan(20);
      expect(entry.note, `${entry.label} has no note`).toBeDefined();
      expect(entry.note.length).toBeGreaterThan(40);
    }
    expect(new Set(S.items.map((entry) => entry.url)).size).toBe(S.items.length);
  });

  it("names the issuing body, rather than “theo quy định Hoa Kỳ”", () => {
    expect(S.title).toContain("Cơ quan An sinh Xã hội Hoa Kỳ");
    expect(S.title).toContain("SSA");
  });

  it("states the provenance limit AND that the rates are not editable", () => {
    // The limit the shell's docstring puts in `intro`: read once, in a
    // review, on a stated date — not at the moment the reader opens the page.
    expect(S.intro).toContain("rà soát");
    expect(S.intro).toContain("16/09/2026");
    expect(S.intro).toContain("không phải danh sách đầy đủ");
    expect(S.intro).toContain("không phải tư vấn");
    // And the disclosure this row owes a reader with no field to touch.
    expect(S.intro).toContain("KHÔNG có ô nhập nào để bạn sửa");
  });

  it("pins the three PIA factors to the module the page actually runs", () => {
    expect(PIA_RATES).toEqual({ first: 90, second: 32, third: 15 });
    const formula = item("piaformula.html");
    for (const rate of [PIA_RATES.first, PIA_RATES.second, PIA_RATES.third]) {
      expect(
        formula.note,
        `the cited PIA formula quotes no ${rate}% tier`,
      ).toContain(`${rate}%`);
    }
    // The same note carries the year's own bend points, read from the module
    // rather than typed, so the citation cannot describe a formula the page
    // does not run.
    const current = BEND_POINTS[Number(D.formulaYear)];
    expect(formula.note).toContain(usd(current.firstBendPoint));
    expect(formula.note).toContain(usd(current.secondBendPoint));
  });

  it("covers every formula year the field offers, bend points and trần", () => {
    // The indexed half. A year in the selector with no published figures in
    // the citation is a year the reader cannot check.
    const bend = item("bendpoints.html");
    const base = item("cbb.html");
    for (const year of BEND_POINT_YEAR_ORDER) {
      const params = BEND_POINTS[year];
      expect(bend.note, `no ${year} first bend point`).toContain(
        usd(params.firstBendPoint),
      );
      expect(bend.note, `no ${year} second bend point`).toContain(
        usd(params.secondBendPoint),
      );
      expect(base.note, `no ${year} taxable maximum`).toContain(
        usd(params.taxableMaximum),
      );
    }
  });

  it("writes the claiming factors as fractions, never as rounded decimals", () => {
    // 5/9 of ONE PERCENT a month is not "0,55% a month", and a citation that
    // rounds the statute is no longer quoting it. The factor multiplies one
    // percentage point, not the benefit.
    const copy = [S.intro, ...S.items.map((entry) => entry.note)].join(" ");
    expect(copy).toContain("5/9 của 1%");
    expect(copy).toContain("5/12 của 1%");
    expect(copy).toContain("2/3 của 1%");
    expect(copy).toContain("25/36 của 1%");
    for (const rounded of ["0,55", "0,56", "0,41", "0,42", "0,67", "0,69"]) {
      expect(
        copy,
        `a statutory fraction is rounded to ${rounded} somewhere in the block`,
      ).not.toContain(rounded);
    }
  });
});

describe("uoc-tinh-an-sinh-xa-hoi — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = estimate();
    const short = estimate({ yearsWorked: 25 });
    const high = estimate({ earnings: 400_000 });
    const low = estimate({ earnings: 30_000 });
    const at = (age: number) =>
      r.schedule.find((option) => option.age === age)!;
    for (const figure of [
      usdCents(r.aime.aime),
      usdCents(r.pia.pia),
      formatPercent(r.pia.replacementRatePercent!, 2),
      usdCents(r.pia.firstTierAime),
      usdCents(r.pia.firstTierPia),
      usdCents(r.pia.secondTierAime),
      usdCents(r.pia.secondTierPia),
      usd(at(62).monthlyBenefit),
      usd(at(67).monthlyBenefit),
      usd(at(70).monthlyBenefit),
      usd(at(70).monthlyBenefit - at(62).monthlyBenefit),
      usdCents(short.aime.aime),
      usdCents(short.pia.pia),
      usdCents(r.pia.pia - short.pia.pia),
      usd(high.aime.cappedEarnings),
      usdCents(high.aime.aime),
      usdCents(high.pia.pia),
      formatPercent(high.pia.replacementRatePercent!, 2),
      usdCents(low.aime.aime),
      usdCents(low.pia.pia),
      formatPercent(low.pia.replacementRatePercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
