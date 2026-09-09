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
  INCOME_SOURCE_KEYS,
  projectIncomeSources,
  type RetirementIncomeSourcesInput,
} from "@/lib/calc/retirement-income-sources";
import { RETIREMENT_INCOME_ANALYSIS as C } from "@/content/calculators/retirement-income-analysis";

const D = C.form.defaults;

/**
 * The component's own parse and wiring, reproduced field by field — docs §6.
 * Two things are under test here that no module test can see: that each
 * default string is read by the parser its FIELD KIND needs, and that the
 * two sources whose indexation the page wires (rather than asks) are wired
 * to the inflation field.
 */
function shippedInput(): RetirementIncomeSourcesInput {
  const inflation = parseDecimal(D.inflation)!;
  return {
    startAge: parseCount(D.startAge)!,
    endAge: parseCount(D.endAge)!,
    annualNeed: parseMoney(D.need)!,
    inflationPercent: inflation,
    portfolioBalance: parseMoney(D.balance)!,
    portfolioReturnPercent: parseDecimal(D.returnPercent)!,
    sources: {
      social: {
        annualAmount: parseMoney(D.social)!,
        indexationPercent: inflation,
        throughAge: 120,
      },
      pension: {
        annualAmount: parseMoney(D.pension)!,
        indexationPercent: parseDecimal(D.pensionIndex)!,
        throughAge: 120,
      },
      work: {
        annualAmount: parseMoney(D.work)!,
        indexationPercent: inflation,
        throughAge: parseCount(D.workThrough)!,
      },
      other: {
        annualAmount: parseMoney(D.other)!,
        indexationPercent: parseDecimal(D.otherIndex)!,
        throughAge: 120,
      },
    },
  };
}

function run(over: Partial<RetirementIncomeSourcesInput> = {}) {
  const result = projectIncomeSources({ ...shippedInput(), ...over });
  if (!result) throw new Error("projectIncomeSources returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-income-analysis.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("phan-tich-thu-nhap-huu-tri at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    const input = shippedInput();
    expect(input).toMatchObject({
      startAge: 67,
      endAge: 95,
      annualNeed: 80_000,
      inflationPercent: 2.5,
      portfolioBalance: 600_000,
      portfolioReturnPercent: 5,
    });
    // "80.000" through parseDecimal would be 80; "2,5" through parseMoney
    // would be 25; "67" through either is 67, which is why the ages are the
    // easy ones to get wrong and the money is not.
    expect(input.sources.social.annualAmount).toBe(30_000);
    expect(input.sources.pension.annualAmount).toBe(18_000);
    expect(input.sources.work.annualAmount).toBe(12_000);
    expect(input.sources.other.annualAmount).toBe(6_000);
    expect(input.sources.work.throughAge).toBe(72);
  });

  it("wires the COLA sources to the inflation field, not to a constant", () => {
    // The page's claim is that Social Security is indexed; if the wiring
    // broke, the tool would quietly show it decaying like the pension.
    const input = shippedInput();
    expect(input.sources.social.indexationPercent).toBe(
      input.inflationPercent,
    );
    expect(input.sources.work.indexationPercent).toBe(input.inflationPercent);
    // And the pension is deliberately NOT wired: 0 is its shipped default.
    expect(input.sources.pension.indexationPercent).toBe(0);
  });

  it("quotes the coverage at both ends of retirement", () => {
    const r = run();
    expect(formatPercent(r.first.fixedCoveragePercent!, 1)).toBe("82,5%");
    expect(formatPercent(r.last.fixedCoveragePercent!, 1)).toBe("56,6%");
    expect(usdCents(r.first.fixedIncome)).toBe("66.000,00");
    expect(usdCents(r.last.fixedIncome)).toBe("88.120,80");
    // The nominal figure GOES UP while the coverage goes down, which is the
    // sentence the notice makes.
    expect(r.last.fixedIncome).toBeGreaterThan(r.first.fixedIncome);
    expect(C.decayNotice).toContain("82,5%");
    expect(C.decayNotice).toContain("56,6%");
  });

  it("quotes the real draw at both ends and the ratio between them", () => {
    const r = run();
    expect(usdCents(r.first.realWithdrawal)).toBe("14.000,00");
    expect(usdCents(r.last.realWithdrawal)).toBe("34.758,80");
    const ratio = r.last.realWithdrawal / r.first.realWithdrawal;
    expect(formatDecimalRatio(ratio)).toBe("2,48");
    expect(C.decayNotice).toContain(usd(r.first.realWithdrawal));
    expect(C.decayNotice).toContain(usd(r.last.realWithdrawal));
    expect(C.decayNotice).toContain("2,48");
    expect(C.faq.items[1].a).toContain("2,48");
  });

  it("quotes what the level pension is worth by the final year", () => {
    const r = run();
    expect(formatPercent(r.realValueKeptPercent.pension!, 1)).toBe("51,3%");
    expect(usd(r.last.realBySource.pension)).toBe("9.241");
    expect(C.decayNotice).toContain("51,3%");
    expect(C.decayNotice).toContain("9.241");
    expect(C.formula.body[3]).toContain("51,3%");
  });

  it("names the two causes of the fall separately", () => {
    // The notice blames the work income stopping AND the pension decaying.
    // Check each contributes, by removing one at a time.
    const both = run();
    const noStop = run({
      sources: {
        ...shippedInput().sources,
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    expect(noStop.last.fixedCoveragePercent!).toBeGreaterThan(
      both.last.fixedCoveragePercent!,
    );
    expect(indexed.last.fixedCoveragePercent!).toBeGreaterThan(
      both.last.fixedCoveragePercent!,
    );
    // Fix both and the coverage stops falling at all.
    const neither = run({
      sources: {
        social: { annualAmount: 30_000, indexationPercent: 2.5, throughAge: 120 },
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
        work: { annualAmount: 12_000, indexationPercent: 2.5, throughAge: 120 },
        other: { annualAmount: 6_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    expect(neither.last.fixedCoveragePercent!).toBeCloseTo(
      neither.first.fixedCoveragePercent!,
      6,
    );
  });

  it("shows the coverage step down the year after the work stops", () => {
    const r = run();
    const at72 = r.years.find((y) => y.age === 72)!;
    const at73 = r.years.find((y) => y.age === 73)!;
    expect(formatPercent(at72.fixedCoveragePercent!, 1)).toBe("79,9%");
    expect(formatPercent(at73.fixedCoveragePercent!, 1)).toBe("64,4%");
  });

  it("prices the pension's indexation clause, which is the first FAQ", () => {
    const level = run();
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    const worth = level.realTotalWithdrawn - indexed.realTotalWithdrawn;
    expect(usd(level.realTotalWithdrawn)).toBe("791.648");
    expect(usd(indexed.realTotalWithdrawn)).toBe("656.000");
    expect(usd(worth)).toBe("135.648");
    expect(usd(level.finalBalance)).toBe("166.983");
    expect(usd(indexed.finalBalance)).toBe("517.442");
    const a = C.faq.items[0].a;
    for (const figure of ["135.648", "656.000", "791.648", "517.442", "166.983"]) {
      expect(a, `FAQ 1 is missing ${figure}`).toContain(figure);
    }
  });

  it("splits the whole retirement between the sources and the portfolio", () => {
    const r = run();
    const shares = INCOME_SOURCE_KEYS.map((key) =>
      formatPercent((r.realTotalBySource[key] / r.realTotalNeed) * 100, 1),
    );
    expect(shares).toEqual(["37,5%", "16,4%", "3,2%", "7,5%"]);
    expect(
      formatPercent((r.realTotalWithdrawn / r.realTotalNeed) * 100, 1),
    ).toBe("35,3%");
    // The ledger closes: the shares plus the portfolio plus the unmet part
    // are the whole need. formula.body[4] promises exactly this.
    expect(
      r.realTotalFixedIncome + r.realTotalWithdrawn + r.realTotalUnmet,
    ).toBeCloseTo(r.realTotalNeed, 4);
    expect(usd(r.realTotalNeed)).toBe("2.240.000");
  });

  it("does not run out of money in the default state, and says so", () => {
    const r = run();
    expect(r.depletionAge).toBe(null);
    expect(r.firstUnmetAge).toBe(null);
    expect(usd(r.last.realBalance)).toBe("83.638");
    // So the page shows the "covered" notice — which still warns about the
    // decay rather than declaring the plan safe.
    expect(C.form.coveredNotice).toContain("giảm dần");
  });

  it("quotes the deceptively low first-year withdrawal rate", () => {
    const r = run();
    expect(formatPercent(r.initialWithdrawalRatePercent!, 2)).toBe("2,33%");
    // The figure is in the question, which is where the reader meets it.
    expect(`${C.faq.items[1].q} ${C.faq.items[1].a}`).toContain("2,33%");
  });
});

/** Two decimal places, Vietnamese separator — for a bare ratio, not money. */
function formatDecimalRatio(value: number): string {
  return formatMoney(value, 2);
}

describe("phan-tich-thu-nhap-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const indexed = run({
      sources: {
        ...shippedInput().sources,
        pension: { annualAmount: 18_000, indexationPercent: 2.5, throughAge: 120 },
      },
    });
    for (const figure of [
      usdCents(r.first.fixedIncome),
      usdCents(r.last.fixedIncome),
      usdCents(r.last.realFixedIncome),
      usdCents(r.first.withdrawal),
      usdCents(r.last.withdrawal),
      usdCents(r.last.realWithdrawal),
      usdCents(r.last.need),
      usd(r.last.realBySource.pension),
      usd(r.realTotalBySource.social),
      usd(r.realTotalBySource.pension),
      usd(r.realTotalBySource.work),
      usd(r.realTotalBySource.other),
      usd(r.realTotalWithdrawn),
      usd(r.realTotalNeed),
      usd(r.finalBalance),
      usd(r.last.realBalance),
      usd(indexed.realTotalWithdrawn),
      usd(indexed.finalBalance),
      formatPercent(r.first.fixedCoveragePercent!, 1),
      formatPercent(r.last.fixedCoveragePercent!, 1),
      formatPercent(r.realValueKeptPercent.pension!, 1),
      formatPercent(r.initialWithdrawalRatePercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
