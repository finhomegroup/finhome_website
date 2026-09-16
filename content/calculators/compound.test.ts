/**
 * /cong-cu/lai-kep/ AT ITS SHIPPED DEFAULTS, and the figures its prose quotes.
 *
 * docs §6's substitute for component coverage: parse the content file's own
 * default strings with the SAME parsers the component uses, run the module,
 * format with the same formatters, and pin the result. Three of the suite's
 * five worst defects lived in a default input or in a component rather than in
 * a module, invisible to a green module-level run.
 *
 * ORIGINAL ROW 16 made the example a home fund, so every figure in the prose
 * moved. Each one below is bound to the module's own output.
 */
import { describe, expect, it } from "vitest";
import { COMPOUND } from "@/content/calculators/compound";
import { computeCompound, MAX_COMPOUND_YEARS } from "@/lib/calc/compound";
import { compoundChartModel } from "@/lib/calc/charts/compound-chart";
import { CHART_UI } from "@/content/calculators/chart-ui";
import type { Compounding } from "@/lib/calc/finance";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";

const F = COMPOUND.form;

/** The defaults, read through the component's own parsers. */
const principal = parseMoney(F.defaultPrincipal)!;
const contribution = parseMoney(F.defaultContribution)!;
const rate = parseDecimal(F.defaultRate)!;
const years = parseDecimal(F.defaultYears)!;

const result = computeCompound({
  principal,
  annualRatePercent: rate,
  years,
  compounding: F.defaultCompounding as Compounding,
  contributionPerPeriod: contribution,
});

const money = (value: number) => `${formatMoney(value)} ₫`;
const prose = JSON.stringify(COMPOUND);

describe("the shipped defaults are a home-fund example that computes", () => {
  it("parses every default with the grammar its field uses", () => {
    // `parseMoney` for money, `parseDecimal` for the rate and the term. The
    // reverse pair reads 8.000.000 as 8 and 6 as 6 — one of them silently.
    expect(principal).toBe(100_000_000);
    expect(contribution).toBe(8_000_000);
    expect(rate).toBe(6);
    expect(years).toBe(10);
    expect(result).not.toBeNull();
  });

  it("agrees with the closed form, not with itself", () => {
    // P(1+i)^n + A((1+i)^n − 1)/i, i = 0,5%/tháng, n = 120.
    const i = 0.005;
    const n = 120;
    const expected =
      principal * (1 + i) ** n + contribution * (((1 + i) ** n - 1) / i);
    expect(result!.periods).toBe(n);
    expect(result!.futureValue).toBeCloseTo(expected, 6);
  });

  it("binds every figure the prose quotes to the module's output", () => {
    const r = result!;
    expect(prose).toContain(money(r.futureValue));
    expect(prose).toContain(money(r.totalContributed));
    expect(prose).toContain(money(r.totalInterest));
    // The saver's own money is the initial amount plus 120 contributions,
    // counted once.
    expect(r.totalContributed).toBe(principal + contribution * 120);
  });

  it("binds the no-contribution and year-five figures too", () => {
    const lump = computeCompound({
      principal,
      annualRatePercent: rate,
      years,
      compounding: F.defaultCompounding as Compounding,
    })!;
    expect(prose).toContain(money(lump.futureValue));
    const yearFive = result!.yearlyBalances[4];
    expect(yearFive.year).toBe(5);
    expect(prose).toContain(money(yearFive.balance));
    expect(prose).toContain(money(yearFive.interest));
  });

  it("states the bound the module actually enforces", () => {
    expect(F.yearsHelp).toContain(String(MAX_COMPOUND_YEARS));
    expect(F.yearsInvalid).toContain(String(MAX_COMPOUND_YEARS));
    expect(
      computeCompound({
        principal,
        annualRatePercent: rate,
        years: MAX_COMPOUND_YEARS + 1,
        compounding: "monthly",
      }),
    ).toBeNull();
  });

  it("calls the rate an assumption wherever it is named", () => {
    // No unverified return claim: the rate is the reader's own input.
    expect(F.rateHelp).toContain("GIẢ ĐỊNH");
    expect(COMPOUND.chart.rateNote).toContain("không phải mức được bảo đảm");
  });

  it("resolves the chart at those defaults, with no placeholder left in it", () => {
    const model = compoundChartModel(result, principal, {
      ...CHART_UI.money,
      ...COMPOUND.chart,
    });
    expect(model.unavailable).toBeNull();
    expect(model.summary).not.toMatch(/\{[a-z]+\}/i);
    // Three bands over eleven points: time 0 plus one per credited year.
    expect(model.bands).toHaveLength(3);
    expect(model.bands[0].points).toHaveLength(11);
    expect(model.xMax).toBe(10);
    // The three bands sum to the headline figure at the last point.
    const sum = model.bands.reduce(
      (total, band) => total + band.points[band.points.length - 1].value,
      0,
    );
    expect(sum).toBeCloseTo(result!.futureValue, 6);
  });

  it("routes to the goal tool honestly, with no claim of a transfer", () => {
    const faq = COMPOUND.faq.items.map((item) => item.a).join(" ");
    expect(faq).toContain("Mục tiêu tiết kiệm");
    expect(faq).toContain("không lưu");
    for (const claim of ["tự động chuyển", "đã lưu", "gửi số liệu"]) {
      expect(faq.includes(claim), claim).toBe(false);
    }
  });
});
