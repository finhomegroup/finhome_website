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
