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

  it("says out loud what it does not model", () => {
    expect(C.formula.body[6]).toContain("giá sinh hoạt");
    expect(C.formula.body[6]).toContain("thuế");
    expect(C.form.withheldNotice).toContain("KHÔNG mất hẳn");
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
