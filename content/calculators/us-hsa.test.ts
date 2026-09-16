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
  computeUsHsa,
  EARLY_WITHDRAWAL_PENALTY_PERCENT,
  HSA_YEARS,
  HSA_YEAR_ORDER,
  PENALTY_FREE_AGE,
  type HsaCoverage,
} from "@/lib/calc/us-hsa";
import { PAYROLL_YEARS, type FilingStatus } from "@/lib/calc/us-payroll";
import { US_HSA as C } from "@/content/calculators/us-hsa";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shipped() {
  return {
    year: Number(D.year),
    coverage: D.coverage as HsaCoverage,
    age: parseCount(D.age)!,
    eligibleMonths: parseCount(D.eligibleMonths)!,
    // Widened deliberately — see the note in us-payroll-tax.test.ts: the
    // defaults are `as const`, the component compares form state strings.
    useLastMonthRule: String(D.lastMonth) === "yes",
    contribution: parseMoney(D.contribution)!,
    employerContribution: parseMoney(D.employer)!,
    federalRatePercent: parseDecimal(D.federal)!,
    stateRatePercent: parseDecimal(D.state)!,
    viaPayroll: String(D.payroll) === "yes",
    annualWagesBeforeHsa: parseMoney(D.wages)!,
    filingStatus: D.status as FilingStatus,
    currentBalance: parseMoney(D.balance)!,
    returnPercent: parseDecimal(D.return)!,
    years: parseCount(D.years)!,
  };
}

function hsa(over: Partial<ReturnType<typeof shipped>> = {}) {
  const input = { ...shipped(), ...over };
  const result = computeUsHsa(input);
  if (!result) throw new Error("computeUsHsa returned null");
  return { input, result };
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);
/**
 * The FICA saving lands on an exact third decimal (516,375), and the copy
 * quotes it that way in the standing notice while the FAQ rounds it to
 * cents. Both shapes are asserted where they are actually used.
 */
const usdMills = (v: number) => formatMoney(v, 3);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-hsa.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("tai-khoan-tiet-kiem-y-te-hoa-ky at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // Four grammars on one form: money, rates, whole counts. docs §4.
    expect(shipped()).toEqual({
      year: 2026,
      coverage: "family",
      age: 40,
      eligibleMonths: 12,
      useLastMonthRule: false,
      contribution: 6_750,
      employerContribution: 2_000,
      federalRatePercent: 24,
      stateRatePercent: 5,
      viaPayroll: true,
      annualWagesBeforeHsa: 100_000,
      filingStatus: "single",
      currentBalance: 10_000,
      returnPercent: 7,
      years: 20,
    });
    // "6.750" through parseDecimal is 6,75; "7" through parseMoney is 7.
    expect(shipped().contribution).toBe(6_750);
    expect(shipped().returnPercent).toBe(7);
  });

  it("opens on a year BOTH tables cover, and so does every year it offers", () => {
    // This page needs two dated tables to agree on which years exist:
    // HSA_YEARS for the contribution ceiling and PAYROLL_YEARS for the FICA
    // layer, which computeUsHsa reads directly. A year in one and not the
    // other makes computeUsHsa return null, and the select would offer a
    // year that renders a page of blanks with no explanation. Asserted
    // behaviourally rather than by comparing key sets, so the guard survives
    // a change in how the lookup is done.
    for (const year of HSA_YEAR_ORDER) {
      expect(HSA_YEARS[year], `HSA_YEARS has no ${year}`).toBeDefined();
      expect(
        PAYROLL_YEARS[year],
        `the HSA year select offers ${year}, which PAYROLL_YEARS lacks — the ` +
          `FICA layer would make computeUsHsa return null`,
      ).toBeDefined();
      expect(
        computeUsHsa({ ...shipped(), year, viaPayroll: true }),
        `the year select offers ${year}, which computeUsHsa rejects`,
      ).not.toBeNull();
    }
    expect(HSA_YEAR_ORDER).toContain(shipped().year);
  });

  it("derives the family ceiling in the prose from the dated table", () => {
    // docs §8 defect 8: a prefilled statutory ceiling is exactly the figure
    // that goes stale, and the FAQ works a three-number example off it.
    const { result, input } = hsa();
    const p = HSA_YEARS[2026];
    expect(result.fullYearBaseLimit).toBe(p.familyLimit);
    expect(result.totalLimit).toBe(p.familyLimit);
    const a = C.faq.items[2].a;
    for (const figure of [
      usd(p.familyLimit),
      usd(input.employerContribution),
      usd(p.familyLimit - input.employerContribution),
    ]) {
      expect(a, `FAQ 3 is missing ${figure}`).toContain(figure);
    }
    // The example's punchline: the two sources together exactly fill it.
    expect(result.remainingRoom).toBe(0);
    expect(result.excessContribution).toBe(0);
    expect(input.contribution).toBe(p.familyLimit - input.employerContribution);
  });

  it("derives the catch-up allowance and its age from the table", () => {
    const p = HSA_YEARS[2026];
    expect(C.formula.body[1]).toContain(usd(p.catchUpLimit));
    expect(C.form.ageHelp).toContain(usd(p.catchUpLimit));
    expect(C.form.ageHelp).toContain(String(p.catchUpAge));
    // Not available at the shipped age, and available one year past the gate.
    expect(hsa().result.catchUpAvailable).toBe(0);
    expect(hsa({ age: p.catchUpAge }).result.catchUpAvailable).toBe(
      p.catchUpLimit,
    );
  });

  it("quotes the income-tax saving off the two entered rates", () => {
    const { result, input } = hsa();
    expect(usdCents(result.incomeTaxSaved)).toBe("1.957,50");
    expect(result.incomeTaxSaved).toBeCloseTo(
      input.contribution *
        ((input.federalRatePercent + input.stateRatePercent) / 100),
      6,
    );
  });

  it("binds the fourth layer's 7,65% claim to the payroll constants", () => {
    // This is the row's real coupling and the reason it sits in the Social
    // Security / FICA unit rather than with the other US leaves: the notice
    // claims the full 7,65% is avoided at the default wage, and that is only
    // true while the wage is below BOTH payroll thresholds. Assert the
    // CONDITION, not just the figure — a wage-base cut could falsify the
    // sentence while leaving the arithmetic that produced 516,375 intact.
    const { result, input } = hsa();
    const p = PAYROLL_YEARS[2026];
    expect(input.annualWagesBeforeHsa).toBeLessThan(p.socialSecurityWageBase);
    expect(input.annualWagesBeforeHsa).toBeLessThan(
      p.additionalMedicareThreshold[input.filingStatus],
    );
    const fullRate = p.socialSecurityRate + p.medicareRate;
    expect(result.ficaSaved).toBeCloseTo(
      input.contribution * (fullRate / 100),
      9,
    );
    expect(formatPercent(fullRate, 2)).toBe("7,65%");
    expect(C.ficaNotice).toContain(formatPercent(fullRate, 2));
    expect(C.ficaNotice).toContain(usdMills(result.ficaSaved));
    expect(C.ficaNotice).toContain(usd(input.annualWagesBeforeHsa));
    // The FAQ quotes the same saving rounded to cents.
    expect(C.faq.items[0].a).toContain(usdCents(result.ficaSaved));
  });

  it("pins the saving rate's real shape, which is NOT monotone in the wage", () => {
    // The notice says the 7,65% is not a fixed rate, and names two reasons.
    // Both are here, and together they make the saving rate fall to a
    // MINIMUM and then rise again — the first draft of this test assumed it
    // fell monotonically to the Medicare rate and failed. docs §8 defect 14:
    // a monotonicity you assume is a finding waiting to happen.
    //
    //   below both thresholds        7,65%  (6,2 + 1,45)
    //   straddling the wage base     2,60%  part of the contribution is
    //                                       pushed back under the base, so
    //                                       some 6,2% IS saved
    //   clear of the base, under
    //     the surtax threshold       1,45%  the minimum
    //   above the surtax threshold   2,35%  (1,45 + 0,9) — the 0,9% comes
    //                                       back, so the rate RISES again
    const p = PAYROLL_YEARS[2026];
    const contribution = shipped().contribution;
    const rateAt = (wages: number) =>
      hsa({ annualWagesBeforeHsa: wages }).result.ficaSaved / contribution;

    const below = rateAt(100_000);
    // Straddling: the whole contribution does not clear the base.
    const straddle = rateAt(p.socialSecurityWageBase + 5_500);
    // Clear of the base by more than the contribution, still under the surtax
    // threshold — derived from the constants so it moves when they do.
    const clearWages = p.socialSecurityWageBase + contribution + 4_000;
    expect(clearWages).toBeLessThan(
      p.additionalMedicareThreshold[shipped().filingStatus],
    );
    const clear = rateAt(clearWages);
    const surtaxed = rateAt(
      p.additionalMedicareThreshold[shipped().filingStatus] + 40_000,
    );

    expect(below).toBeCloseTo((p.socialSecurityRate + p.medicareRate) / 100, 9);
    expect(clear).toBeCloseTo(p.medicareRate / 100, 9);
    expect(surtaxed).toBeCloseTo(
      (p.medicareRate + p.additionalMedicareRate) / 100,
      9,
    );
    // The minimum sits in the MIDDLE of the range, not at the top of it.
    expect(clear).toBeLessThan(straddle);
    expect(clear).toBeLessThan(surtaxed);
    expect(straddle).toBeLessThan(below);

    // Which is why the module differences two FICA bills instead of
    // multiplying by 7,65% — the notice says exactly that.
    expect(C.ficaNotice).toContain("6,2%");
    expect(C.ficaNotice).toContain("0,9%");
    expect(C.ficaNotice).toContain("chênh lệch giữa hai hóa đơn FICA");
  });

  it("saves no FICA at all on a contribution made by cheque", () => {
    // Only a section 125 salary reduction escapes FICA — the distinction the
    // whole fourth layer rests on.
    const { result } = hsa({ viaPayroll: false });
    expect(result.ficaSaved).toBe(0);
    expect(result.incomeTaxSaved).toBeGreaterThan(0);
    expect(C.form.chequeNotice).toContain("Section 125");
  });

  it("quotes the net cost and the total saved", () => {
    const { result, input } = hsa();
    expect(usdMills(result.firstYearTaxSaved)).toBe("2.473,875");
    expect(usdMills(result.netCostOfContribution)).toBe("4.276,125");
    expect(result.netCostOfContribution).toBeCloseTo(
      input.contribution - result.firstYearTaxSaved,
      9,
    );
  });

  it("quotes the projection, where growth exceeds everything contributed", () => {
    const { result } = hsa();
    expect(usdCents(result.projectedBalance)).toBe("422.517,14");
    expect(usd(result.totalContributed)).toBe("175.000");
    expect(usd(result.projectedGrowth)).toBe("237.517");
    // The claim the last method paragraph makes, as an inequality.
    expect(result.projectedGrowth).toBeGreaterThan(result.totalContributed);
    const body = C.formula.body[6];
    expect(body).toContain(usd(result.projectedGrowth));
    expect(body).toContain(usd(result.totalContributed));
  });

  it("lands the projection before 65, so the 20% penalty is the live case", () => {
    const { result } = hsa();
    expect(result.ageAtHorizon).toBe(60);
    expect(result.ageAtHorizon).toBeLessThan(PENALTY_FREE_AGE);
    expect(result.penaltyApplies).toBe(true);
    // A medical withdrawal is untaxed at ANY age — the third advantage.
    expect(result.medicalWithdrawalTax).toBe(0);
    // And the header's 49% is the two rates plus the penalty, not a guess.
    const input = shipped();
    const loss =
      input.federalRatePercent +
      input.stateRatePercent +
      EARLY_WITHDRAWAL_PENALTY_PERCENT;
    expect(formatPercent(loss, 0)).toBe("49%");
    expect(
      (result.nonMedicalTax + result.nonMedicalPenalty) /
        result.projectedBalance,
    ).toBeCloseTo(loss / 100, 9);
    // From 65 the penalty goes, which is the other notice.
    expect(hsa({ age: 50 }).result.penaltyApplies).toBe(false);
    expect(C.form.noPenaltyNotice).toContain(String(PENALTY_FREE_AGE));
  });

  it("counts the employer's money against the SAME ceiling", () => {
    // Named in the copy as the most common HSA mistake, so it is asserted
    // rather than trusted: one more dollar from either side is an excess.
    const overByOne = hsa({ contribution: 6_751 }).result;
    expect(overByOne.excessContribution).toBe(1);
    expect(C.form.employerHelp).toContain("CÙNG MỘT trần");
    expect(C.form.excessNotice).toContain("6%");
  });

  it("names the United States in the H1 and in the first paragraph", () => {
    // "HSA" is an unmistakably-US proper noun, so the registry title is
    // allowed to omit "Hoa Kỳ" (plan-disposition.test.ts records that
    // carve-out). The H1 and lede carry it anyway, which is what makes this
    // row's scope readable without knowing what HSA stands for.
    expect(C.pageTitle).toContain("Hoa Kỳ");
    expect(C.lede).toContain("Hoa Kỳ");
  });
});

describe("tai-khoan-tiet-kiem-y-te-hoa-ky — sources", () => {
  const items = C.sources.items;

  it("gives the reader something to open for every citation", () => {
    // Non-vacuous floor: a block that lost its items would satisfy every
    // `for` below without failing. docs §8's coincidental pass.
    expect(items.length).toBeGreaterThan(3);
    for (const item of items) {
      expect(item.url.startsWith("https://"), `${item.url} is not https`).toBe(
        true,
      );
      // irs.gov ONLY — no blog, no aggregator. A secondary source is how a
      // wrong statutory figure gets laundered into looking checked.
      expect(new URL(item.url).hostname).toBe("www.irs.gov");
      expect(item.label.length).toBeGreaterThan(20);
      expect(item.note, `${item.url} carries no note`).toBeDefined();
      expect(item.note!.length).toBeGreaterThan(80);
    }
    expect(new Set(items.map((item) => item.url)).size).toBe(items.length);
  });

  it("puts the provenance limit in the intro, where the shell's docs say", () => {
    const intro = C.sources.intro!;
    // Read in a project review on a stated date, NOT looked up live by the
    // page — the claim a bare link list otherwise implies.
    expect(intro).toContain("16/09/2026");
    expect(intro).toContain("không phải do trang tự tra lại");
    expect(intro).toContain("không phải danh sách đầy đủ");
    expect(intro).toContain("không phải tư vấn thuế");
    // AND the limit that matters most on this form: the prefilled state rate
    // is an example, not a sourced figure, because no federal page can say
    // what any particular state does.
    expect(intro).toContain("thuế suất thu nhập bang");
    expect(intro).toContain(formatPercent(parseDecimal(D.state)!, 0));
  });

  it("cites a revenue procedure for EVERY year the select offers", () => {
    // The real completeness test for this row: the year select is built from
    // HSA_YEAR_ORDER, so a year with no citation is a year whose ceiling the
    // reader cannot check. Walk the select, not the citation list.
    for (const year of HSA_YEAR_ORDER) {
      const p = HSA_YEARS[year];
      const cited = items.filter(
        (item) =>
          item.note!.includes(usd(p.selfOnlyLimit)) &&
          item.note!.includes(usd(p.familyLimit)),
      );
      expect(
        cited.map((item) => item.url),
        `no source note carries both ${year} ceilings (${usd(p.selfOnlyLimit)} / ${usd(p.familyLimit)})`,
      ).not.toHaveLength(0);
      // And the note names the tax year it belongs to, so two years' figures
      // cannot be read as one table.
      expect(
        cited.some((item) => item.note!.includes(String(year))),
        `the ${year} ceiling citation does not name ${year}`,
      ).toBe(true);
    }
    // The two years are cited SEPARATELY. One note carrying all four figures
    // would leave the reader unable to tell which year it covers.
    expect(HSA_YEAR_ORDER.length).toBeGreaterThan(1);
    const bothYears = items.filter(
      (item) =>
        item.note!.includes(usd(HSA_YEARS[2026].familyLimit)) &&
        item.note!.includes(usd(HSA_YEARS[2025].familyLimit)),
    );
    expect(bothYears, "one note covers both years at once").toHaveLength(0);
  });

  it("cites the two figures that have no field at all", () => {
    // The catch-up allowance and the 20% penalty are hard-coded in
    // lib/calc/us-hsa.ts with nothing on the form to edit, which is exactly
    // the case the statutory registry calls out for this row.
    const p = HSA_YEARS[2026];
    const pub = items.find((item) => item.url.includes("/publications/p969"));
    expect(pub, "no Publication 969 citation").toBeDefined();
    const note = pub!.note!;
    expect(note).toContain(usd(p.catchUpLimit));
    expect(note).toContain(String(p.catchUpAge));
    // The penalty, from the module's own constant rather than typed again.
    expect(note).toContain(
      formatPercent(EARLY_WITHDRAWAL_PENALTY_PERCENT, 0),
    );
    expect(note).toContain(String(PENALTY_FREE_AGE));
    // Pub. 969 gives THREE exits from the penalty while the module models
    // only the age, and the note must not quietly narrow the rule it cites.
    expect(note).toContain("khuyết tật");
    // The page's own copy and the citation agree on the penalty figure.
    expect(C.form.nonMedicalPenaltyLabel).toContain(
      formatPercent(EARLY_WITHDRAWAL_PENALTY_PERCENT, 0),
    );
  });

  it("cites the bracket set the federal rate field names in its help", () => {
    const brackets = items.find((item) =>
      item.url.includes("/newsroom/irs-releases-tax-inflation-adjustments"),
    );
    expect(brackets, "no citation for the seven bracket rates").toBeDefined();
    for (const rate of [10, 12, 22, 24, 32, 35, 37]) {
      expect(
        brackets!.note!.includes(String(rate)),
        `the bracket citation never names ${rate}`,
      ).toBe(true);
      expect(
        C.form.federalHelp.includes(String(rate)),
        `federalHelp never names ${rate}`,
      ).toBe(true);
    }
    // Confirmed FOR 2026, not carried over from the 2025 table.
    expect(brackets!.note!).toContain("2026");
    // The prefilled federal rate is a member of that set.
    expect([10, 12, 22, 24, 32, 35, 37]).toContain(parseDecimal(D.federal)!);
  });
});

describe("tai-khoan-tiet-kiem-y-te-hoa-ky — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const { result } = hsa();
    for (const figure of [
      usd(result.totalLimit),
      usdCents(result.incomeTaxSaved),
      usdMills(result.ficaSaved),
      usdMills(result.firstYearTaxSaved),
      usdMills(result.netCostOfContribution),
      usdCents(result.projectedBalance),
      usdCents(result.projectedGrowth),
      usd(result.totalContributed),
      String(result.ageAtHorizon),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
