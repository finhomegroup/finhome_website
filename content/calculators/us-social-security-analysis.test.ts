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
