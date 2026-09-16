import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatMoney, formatPercent, parseCount, parseMoney } from "@/lib/calc/number";
import {
  EARNINGS_TEST,
  earningsTestWithholding,
  fullRetirementAgeMonths,
  householdBenefit,
  SPOUSAL_MAX_PERCENT,
  spousalFactorPercent,
} from "@/lib/calc/us-social-security";
import { US_SOCIAL_SECURITY_PAYOUT as C } from "@/content/calculators/us-social-security-payout";

const D = C.form.defaults;

/** The component's own parse and wiring, reproduced — docs §6. */
function shipped() {
  return {
    pia: parseMoney(D.pia)!,
    birthYear: parseCount(D.birthYear)!,
    claimAge: parseCount(D.claimAge)!,
    spousePia: parseMoney(D.spousePia)!,
    spouseBirthYear: parseCount(D.spouseBirthYear)!,
    spouseClaimAge: parseCount(D.spouseClaimAge)!,
    earnings: parseMoney(D.earnings)!,
    exemptUnderFra: parseMoney(D.exemptUnderFra)!,
    exemptFraYear: parseMoney(D.exemptFraYear)!,
  };
}

function house(over: Partial<ReturnType<typeof shipped>> = {}) {
  const input = { ...shipped(), ...over };
  const result = householdBenefit({
    pia: input.pia,
    workerFraMonths: fullRetirementAgeMonths(input.birthYear),
    workerClaimMonths: input.claimAge * 12,
    spousePia: input.spousePia,
    spouseFraMonths: fullRetirementAgeMonths(input.spouseBirthYear),
    spouseClaimMonths: input.spouseClaimAge * 12,
  });
  if (!result) throw new Error("householdBenefit returned null");
  return { input, result };
}

const usd = (v: number) => formatMoney(v);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-social-security-payout.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("chi-tra-an-sinh-xa-hoi at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shipped()).toEqual({
      pia: 2_800,
      birthYear: 1963,
      claimAge: 67,
      spousePia: 900,
      spouseBirthYear: 1965,
      spouseClaimAge: 67,
      earnings: 0,
      exemptUnderFra: 24_480,
      exemptFraYear: 65_160,
    });
  });

  it("prefills the earnings-test amounts from the module's dated constants", () => {
    // docs §8 defect 8: a prefilled statutory figure must be traceable to a
    // named constant with its year, and the copy must state that year.
    const s = shipped();
    expect(s.exemptUnderFra).toBe(EARNINGS_TEST.underFraAnnual);
    expect(s.exemptFraYear).toBe(EARNINGS_TEST.fraYearAnnual);
    expect(C.form.exemptUnderFraHelp).toContain(String(EARNINGS_TEST.year));
    expect(C.form.exemptFraYearHelp).toContain(String(EARNINGS_TEST.year));
    expect(C.form.exemptNotice).toContain(String(EARNINGS_TEST.year));
  });

  it("opens on a spouse who is paid the top-up, not their own record", () => {
    // The case the page's two asymmetries are visible in.
    const { result } = house();
    expect(result.spouseOnSpousalBenefit).toBe(true);
  });

  it("quotes the household figures", () => {
    const { result } = house();
    expect(usd(result.workerMonthly)).toBe("2.800");
    expect(usd(result.spouseOwnMonthly)).toBe("900");
    expect(usd(result.spousalMonthly)).toBe("1.400");
    expect(usd(result.spouseReceivesMonthly)).toBe("1.400");
    expect(usd(result.householdMonthly)).toBe("4.200");
    expect(usd(result.householdAnnual)).toBe("50.400");
    expect(usd(result.survivorMonthly)).toBe("2.800");
    expect(C.asymmetryNotice).toContain("4.200");
  });

  it("quotes the asymmetry: early claiming spares the spousal, cuts the survivor", () => {
    const late = house().result;
    const early = house({ claimAge: 62 }).result;
    expect(usd(early.workerMonthly)).toBe("1.960");
    // Unchanged, to the dollar.
    expect(early.spousalMonthly).toBe(late.spousalMonthly);
    expect(usd(early.spousalMonthly)).toBe("1.400");
    expect(usd(early.householdMonthly)).toBe("3.360");
    // And the survivor figure falls by exactly what the worker's did.
    expect(usd(early.survivorMonthly)).toBe("1.960");
    expect(late.survivorMonthly - early.survivorMonthly).toBe(
      late.workerMonthly - early.workerMonthly,
    );
    expect(usd(late.workerMonthly - early.workerMonthly)).toBe("840");
    const notice = C.asymmetryNotice;
    for (const figure of ["2.800", "1.960", "1.400"]) {
      expect(notice, `notice is missing ${figure}`).toContain(figure);
    }
    expect(C.faq.items[0].a).toContain("1.960");
    expect(C.faq.items[0].a).toContain("2.800");
  });

  it("quotes the spouse gaining nothing by waiting to 70", () => {
    const atFra = house().result;
    const at70 = house({ spouseClaimAge: 70 }).result;
    expect(usd(at70.spouseOwnMonthly)).toBe("1.116");
    expect(at70.spouseOwnMonthly).toBeGreaterThan(atFra.spouseOwnMonthly);
    expect(at70.spousalMonthly).toBe(atFra.spousalMonthly);
    expect(at70.householdMonthly - atFra.householdMonthly).toBe(0);
    expect(C.asymmetryNotice).toContain("1.116");
    expect(C.faq.items[1].a).toContain("1.116");
    expect(C.faq.items[1].a).toContain("900");
  });

  it("quotes the spouse claiming at 62", () => {
    const r = house({ spouseClaimAge: 62 }).result;
    expect(usd(r.spousalMonthly)).toBe("910");
    expect(usd(r.householdMonthly)).toBe("3.710");
    // 32,5% of the worker's PIA, which is what the FAQ explains.
    expect(r.spousalMonthly / 2_800).toBeCloseTo(0.325, 4);
    expect(C.faq.items[2].q).toContain("32,5%");
  });

  it("quotes the earnings test at 62 on 40.000 USD of wages", () => {
    const early = house({ claimAge: 62 }).result;
    const s = shipped();
    const test = earningsTestWithholding({
      annualBenefit: early.workerMonthly * 12,
      annualEarnings: 40_000,
      exemptAmount: s.exemptUnderFra,
      withholdingRatio: EARNINGS_TEST.underFraWithholdingRatio,
      atOrAboveFra: false,
    })!;
    expect(usd(early.workerMonthly * 12)).toBe("23.520");
    expect(usd(test.excessEarnings)).toBe("15.520");
    expect(usd(test.withheld)).toBe("7.760");
    expect(usd(test.paid)).toBe("15.760");
    expect(usd(test.paid / 12)).toBe("1.313");
    const haircut = (test.withheld / (early.workerMonthly * 12)) * 100;
    expect(formatPercent(haircut, 1)).toBe("33,0%");
    const a = C.faq.items[3].a;
    for (const figure of ["23.520", "15.760", "33,0%"]) {
      expect(a, `FAQ 4 is missing ${figure}`).toContain(figure);
    }
  });

  it("picks the exempt amount and ratio from the claim age, as the page does", () => {
    // Below the full-retirement year: 1 in 2 on the lower amount. In that
    // year: 1 in 3 on the higher one. After it: no test at all.
    const s = shipped();
    const fraWholeYear = Math.floor(fullRetirementAgeMonths(s.birthYear) / 12);
    expect(fraWholeYear).toBe(67);
    for (const [claimAge, expected] of [
      [62, s.exemptUnderFra],
      [66, s.exemptUnderFra],
      [67, s.exemptFraYear],
    ] as const) {
      const inFraYear = claimAge === fraWholeYear;
      expect(inFraYear ? s.exemptFraYear : s.exemptUnderFra).toBe(expected);
    }
    // And above it the test is exempt, whatever the earnings.
    const above = earningsTestWithholding({
      annualBenefit: 30_000,
      annualEarnings: 500_000,
      exemptAmount: s.exemptUnderFra,
      withholdingRatio: 2,
      atOrAboveFra: true,
    })!;
    expect(above.withheld).toBe(0);
    expect(above.exempt).toBe(true);
  });

  it("keeps the spousal column flat across the whole table", () => {
    // The claim the table intro makes, checked on every row rather than at
    // the two ends.
    const s = shipped();
    const spousal = new Set<number>();
    const survivor: number[] = [];
    for (let age = 62; age <= 70; age += 1) {
      const r = house({ claimAge: age }).result;
      spousal.add(r.spouseReceivesMonthly);
      survivor.push(r.survivorMonthly);
    }
    expect(spousal.size).toBe(1);
    expect([...spousal][0]).toBe(1_400);
    // While the survivor column rises with every year waited.
    for (let i = 1; i < survivor.length; i += 1) {
      expect(survivor[i]).toBeGreaterThan(survivor[i - 1]);
    }
    expect(s.pia).toBe(2_800);
  });

  it("still pays the top-up to a spouse with no record of their own", () => {
    const r = house({ spousePia: 0 }).result;
    expect(r.spouseOwnMonthly).toBe(0);
    expect(r.spouseReceivesMonthly).toBe(1_400);
    expect(C.form.spousePiaHelp).toContain("0");
  });

  it("does not assert the spouse is entitled, only what the amount would be", () => {
    // The field help said a spouse with no record of their own "vẫn được
    // nhận trợ cấp theo vợ/chồng" — an unconditional entitlement claim. A
    // spousal benefit is conditional in ways this page cannot see (the
    // worker must have filed, and the spouse has their own age and
    // marriage-duration conditions), and none of them is an input. The
    // module computes an AMOUNT; it does not adjudicate eligibility, and
    // the copy now says which of the two it is doing.
    const help = C.form.spousePiaHelp;
    expect(help).toContain("nếu đủ điều kiện");
    expect(help).toContain("không kiểm tra điều kiện");
  });

  it("says out loud what it does not model", () => {
    expect(C.formula.body[6]).toContain("giá sinh hoạt");
    expect(C.formula.body[6]).toContain("thuế");
    expect(C.form.withheldNotice).toContain("KHÔNG mất hẳn");
  });

  it("names the United States in the H1 and in the first paragraph", () => {
    // Same reasoning as the other two Social Security pages. This row was
    // the worst of the fifteen US rows: its registry summary omitted "Hoa
    // Kỳ" entirely, leaving the hub badge as the only scope signal. The
    // summary is fixed in the registry; the H1 and lede are this module's.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(C.metaTitle).toContain("Hoa Kỳ");
    expect(C.lede).toContain("Hoa Kỳ");
  });

  it("marks the household rules as United States rules, not transferable ones", () => {
    // This row's stated risk is a Vietnamese reader taking the spousal and
    // survivor rules for something that applies to BHXH. The rules are
    // 1983-amendment statute with no Vietnamese equivalent, so the limits
    // paragraph has to say whose rules these are.
    expect(C.formula.body[6]).toContain("Hoa Kỳ");
  });
});

/**
 * THE ONE ROW WHERE BOTH HALVES OF "IS THIS NUMBER RIGHT?" ARE VISIBLE.
 *
 * Two of this page's statutory figures are FIELDS — the earnings-test exempt
 * amounts, prefilled from `EARNINGS_TEST` with the year stated in the copy — so
 * a reader who finds them stale can correct them. The rest are not: the 25/36
 * of one percent a month spousal reduction, the 50% ceiling and the 1-for-2 and
 * 1-for-3 withholding ratios are hard-coded with no field and no year control,
 * exactly as on the other two Social Security rows. For those, the citation is
 * the only check that exists, which is why the assertions below pair each cited
 * figure with the module constant the page runs on.
 *
 * The block is shared with the other two rows, in
 * `content/calculators/us-social-security-sources.ts`.
 */
describe("chi-tra-an-sinh-xa-hoi cites both the editable and the fixed figures", () => {
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

  it("names the issuing body and states the provenance limit", () => {
    expect(S.title).toContain("Cơ quan An sinh Xã hội Hoa Kỳ");
    expect(S.title).toContain("SSA");
    expect(S.intro).toContain("rà soát");
    expect(S.intro).toContain("16/09/2026");
    expect(S.intro).toContain("không phải danh sách đầy đủ");
    expect(S.intro).toContain("không phải tư vấn");
    expect(S.intro).toContain("KHÔNG có ô nhập nào để bạn sửa");
  });

  it("pins the spousal ceiling and its own reduction scale", () => {
    expect(SPOUSAL_MAX_PERCENT).toBe(50);
    const fra = fullRetirementAgeMonths(shipped().spouseBirthYear);
    expect(fra).toBe(67 * 12);
    expect(spousalFactorPercent(fra, 67 * 12)).toBe(SPOUSAL_MAX_PERCENT);
    // No delayed retirement credit on a spousal benefit: three more years of
    // waiting buys the household nothing on that record.
    expect(spousalFactorPercent(fra, 70 * 12)).toBe(SPOUSAL_MAX_PERCENT);
    // 60 months early on the spousal scale: 36 x 25/36 + 24 x 5/12 = 35%
    // off 50%, which is the 32,5% SSA publishes and the FAQ quotes.
    expect(spousalFactorPercent(fra, 62 * 12)).toBe(32.5);
    const scale = item("earlyretire.html");
    expect(scale.note).toContain("25/36 của 1%");
    expect(scale.note).toContain(`${SPOUSAL_MAX_PERCENT}%`);
  });

  it("pins the earnings test's editable amounts AND its fixed ratios", () => {
    const test = item("rtea.html");
    // The two figures a reader CAN correct, cited at the value shipped.
    expect(parseMoney(D.exemptUnderFra)).toBe(EARNINGS_TEST.underFraAnnual);
    expect(parseMoney(D.exemptFraYear)).toBe(EARNINGS_TEST.fraYearAnnual);
    expect(test.note).toContain(usd(EARNINGS_TEST.underFraAnnual));
    expect(test.note).toContain(usd(EARNINGS_TEST.fraYearAnnual));
    expect(test.note).toContain(String(EARNINGS_TEST.year));
    // The two a reader cannot. Both ratios are in the statute and neither has
    // a field, so the citation is the only place they can be checked.
    expect(EARNINGS_TEST.underFraWithholdingRatio).toBe(2);
    expect(EARNINGS_TEST.fraYearWithholdingRatio).toBe(3);
    expect(test.note).toContain(
      `1 USD cho mỗi ${EARNINGS_TEST.underFraWithholdingRatio} USD`,
    );
    expect(test.note).toContain(
      `1 USD cho mỗi ${EARNINGS_TEST.fraYearWithholdingRatio} USD`,
    );
  });

  it("says in the block itself which figures are fields and which are not", () => {
    // The distinction this row exists to demonstrate. A list of links that
    // did not separate "you can fix this" from "you cannot" would leave the
    // reader unable to tell which of the two kinds they are looking at.
    expect(S.intro).toContain("ô nhập được");
    expect(S.intro).toContain("điều chỉnh hằng năm");
    const test = item("rtea.html");
    expect(test.note).toContain("điều chỉnh hằng năm");
  });

  it("writes the household scales as fractions, never as decimals", () => {
    const copy = [S.intro, ...S.items.map((entry) => entry.note)].join(" ");
    expect(copy).toContain("5/9 của 1%");
    expect(copy).toContain("5/12 của 1%");
    expect(copy).toContain("25/36 của 1%");
    for (const rounded of ["0,55", "0,56", "0,41", "0,42", "0,67", "0,69"]) {
      expect(
        copy,
        `a statutory fraction is rounded to ${rounded} somewhere in the block`,
      ).not.toContain(rounded);
    }
  });
});

describe("chi-tra-an-sinh-xa-hoi — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const late = house().result;
    const early = house({ claimAge: 62 }).result;
    const at70 = house({ spouseClaimAge: 70 }).result;
    const at62 = house({ spouseClaimAge: 62 }).result;
    const test = earningsTestWithholding({
      annualBenefit: early.workerMonthly * 12,
      annualEarnings: 40_000,
      exemptAmount: shipped().exemptUnderFra,
      withholdingRatio: 2,
      atOrAboveFra: false,
    })!;
    for (const figure of [
      usd(late.workerMonthly),
      usd(late.spouseOwnMonthly),
      usd(late.spousalMonthly),
      usd(late.householdMonthly),
      usd(late.householdAnnual),
      usd(late.survivorMonthly),
      usd(early.workerMonthly),
      usd(early.householdMonthly),
      usd(late.workerMonthly - early.workerMonthly),
      usd(at70.spouseOwnMonthly),
      usd(at62.spousalMonthly),
      usd(at62.householdMonthly),
      usd(early.workerMonthly * 12),
      usd(test.excessEarnings),
      usd(test.withheld),
      usd(test.paid),
      usd(test.paid / 12),
      usd(EARNINGS_TEST.underFraAnnual),
      usd(EARNINGS_TEST.fraYearAnnual),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
