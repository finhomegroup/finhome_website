import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  ALLOCATION_RULES,
  analyseAllocation,
  ASSET_CLASSES,
  REBALANCE_BAND_POINTS,
  type AssetAllocationInput,
  type RiskTolerance,
} from "@/lib/calc/asset-allocation";
import { isValidDate } from "@/lib/calc/dates";
import { ASSET_ALLOCATION as C } from "@/content/calculators/asset-allocation";

const D = C.form.defaults;

/** The component's own parse, field by field — docs §6. */
function shippedInput(): AssetAllocationInput {
  return {
    age: parseCount(D.age)!,
    riskTolerance: D.risk as RiskTolerance,
    holdings: {
      equity: parseMoney(D.equityHolding)!,
      bond: parseMoney(D.bondHolding)!,
      cash: parseMoney(D.cashHolding)!,
    },
    returns: {
      equity: parseDecimal(D.equityReturn)!,
      bond: parseDecimal(D.bondReturn)!,
      cash: parseDecimal(D.cashReturn)!,
    },
    equitySigmaPercent: parseDecimal(D.equitySigma)!,
    bondSigmaPercent: parseDecimal(D.bondSigma)!,
    equityBondCorrelation: parseDecimal(D.correlation)!,
  };
}

function run(over: Partial<AssetAllocationInput> = {}) {
  const result = analyseAllocation({ ...shippedInput(), ...over });
  if (!result) throw new Error("analyseAllocation returned null");
  return result;
}

const usd = (v: number) => formatMoney(v);

/**
 * A FAQ answer found by a distinctive phrase in its question.
 *
 * Positional indexes were how this file used to reach the FAQ, and the review
 * repair that ordered the list by MODE — allocation questions first, then the
 * advanced study — moved every one of them. A lookup by content survives the
 * next reordering too.
 */
function faqAnswer(questionFragment: string): string {
  const match = C.faq.items.find((item) => item.q.includes(questionFragment));
  if (!match) {
    throw new Error(
      `no FAQ question containing "${questionFragment}" — the list was ` +
        "reordered or reworded; fix the fragment, not the assertion",
    );
  }
  return match.a;
}

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "asset-allocation.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("phan-bo-tai-san at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    // "0,1" is the correlation and must go through parseDecimal: parseMoney
    // would read it as 0,1 too, but "500.000.000" through parseDecimal is 500.
    //
    // The holdings are in ĐỒNG now, not USD — original row 56 dropped the
    // second currency from this page. They were rescaled by exactly 1.000,
    // so every WEIGHT, drift, percentage and risk figure below is unchanged;
    // only the money figures moved by three digits.
    expect(shippedInput()).toEqual({
      age: 45,
      riskTolerance: "moderate",
      holdings: {
        equity: 500_000_000,
        bond: 150_000_000,
        cash: 50_000_000,
      },
      returns: { equity: 10, bond: 5, cash: 3 },
      equitySigmaPercent: 16,
      bondSigmaPercent: 6,
      equityBondCorrelation: 0.1,
    });
  });

  it("offers a radio option for every risk tolerance the module has", () => {
    const optionKeys = Object.keys(C.form.riskOptions).sort();
    expect(optionKeys).toEqual(Object.keys(ALLOCATION_RULES).sort());
    // And each label states its own base, so the copy cannot drift from the
    // rule it describes.
    for (const [key, rule] of Object.entries(ALLOCATION_RULES)) {
      const label = C.form.riskOptions[key as RiskTolerance];
      expect(label, `${key} label`).toContain(String(rule.equityBase));
    }
  });

  it("opens on a portfolio that HAS drifted out of band", () => {
    // A default state already on target would show an empty trade column.
    const r = run();
    expect(r.rebalanceDue).toBe(true);
    expect(r.maxDriftPoints!).toBeGreaterThan(REBALANCE_BAND_POINTS);
  });

  it("quotes the target, the current weights and the drift", () => {
    const r = run();
    // The weights and drifts below are IDENTICAL to the USD era: rescaling
    // every holding by the same factor cannot move a share of the total.
    expect(usd(r.totalValue)).toBe("700.000.000");
    expect(r.target).toEqual({ equity: 65, bond: 30, cash: 5 });
    expect(formatPercent(r.currentWeights!.equity, 1)).toBe("71,4%");
    expect(formatPercent(r.currentWeights!.bond, 1)).toBe("21,4%");
    expect(formatPercent(r.currentWeights!.cash, 1)).toBe("7,1%");
    expect(formatDecimal(r.driftPoints!.equity, 1)).toBe("6,4");
    expect(formatDecimal(r.driftPoints!.bond, 1)).toBe("-8,6");
    expect(formatDecimal(r.driftPoints!.cash, 1)).toBe("2,1");
    expect(formatDecimal(r.maxDriftPoints!, 1)).toBe("8,6");
  });

  it("quotes the trades, and they net to zero", () => {
    const r = run();
    expect(usd(r.trades!.equity)).toBe("-45.000.000");
    expect(usd(r.trades!.bond)).toBe("60.000.000");
    expect(usd(r.trades!.cash)).toBe("-15.000.000");
    const net = ASSET_CLASSES.reduce((sum, key) => sum + r.trades![key], 0);
    expect(net).toBeCloseTo(0, 6);
    expect(C.form.table.intro).toContain("bằng 0");
  });

  it("quotes the risk figures and what diversification is worth", () => {
    const r = run();
    expect(formatPercent(r.targetStats.expectedReturnPercent, 2)).toBe("8,15%");
    expect(formatPercent(r.targetStats.standardDeviationPercent, 2)).toBe(
      "10,73%",
    );
    expect(
      formatPercent(r.targetStats.weightedAverageSigmaPercent, 2),
    ).toBe("12,25%");
    expect(
      formatDecimal(r.targetStats.diversificationBenefitPoints, 2),
    ).toBe("1,52");
    expect(formatDecimal(r.targetStats.returnPerRiskUnit!, 3)).toBe("0,760");
    for (const figure of ["10,73%", "12,25%", "1,52"]) {
      expect(C.correlationNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the correlation sweep the notice rests on", () => {
    const sweep = [-0.5, 0, 0.1, 0.5, 1].map((equityBondCorrelation) => {
      const r = run({ equityBondCorrelation });
      return {
        sigma: formatPercent(r.targetStats.standardDeviationPercent, 2),
        benefit: formatDecimal(r.targetStats.diversificationBenefitPoints, 2),
      };
    });
    expect(sweep.map((each) => each.sigma)).toEqual([
      "9,63%",
      "10,55%",
      "10,73%",
      "11,41%",
      "12,20%",
    ]);
    expect(sweep.map((each) => each.benefit)).toEqual([
      "2,62",
      "1,70",
      "1,52",
      "0,84",
      "0,05",
    ]);
    for (const figure of ["2,62", "0,84"]) {
      expect(C.correlationNotice, `notice is missing ${figure}`).toContain(
        figure,
      );
    }
    const correlationAnswer = faqAnswer("hệ số tương quan");
    expect(correlationAnswer).toContain("2,62");
    expect(correlationAnswer).toContain("0,84");
    // The residue at a correlation of 1 is the cash sleeve, whose own
    // correlation stays at zero — which the advanced method explains.
    expect(C.advancedFormula.body[3]).toContain("0,05");
  });

  it("quotes the current portfolio buying return at a worse rate", () => {
    const r = run();
    expect(formatPercent(r.currentStats!.expectedReturnPercent, 2)).toBe("8,43%");
    expect(formatPercent(r.currentStats!.standardDeviationPercent, 2)).toBe(
      "11,63%",
    );
    expect(formatDecimal(r.currentStats!.returnPerRiskUnit!, 3)).toBe("0,725");
    // Higher return AND higher risk, but a worse ratio — the third FAQ.
    expect(r.currentStats!.expectedReturnPercent).toBeGreaterThan(
      r.targetStats.expectedReturnPercent,
    );
    expect(r.currentStats!.standardDeviationPercent).toBeGreaterThan(
      r.targetStats.standardDeviationPercent,
    );
    expect(r.currentStats!.returnPerRiskUnit!).toBeLessThan(
      r.targetStats.returnPerRiskUnit!,
    );
    const a = faqAnswer("lợi nhuận cao hơn mục tiêu");
    for (const figure of ["8,43%", "8,15%", "11,63%", "10,73%", "0,760", "0,725"]) {
      expect(a, `the drifted-portfolio answer is missing ${figure}`).toContain(
        figure,
      );
    }
  });

  it("quotes the three risk tolerances at this age", () => {
    const rows = (["conservative", "moderate", "aggressive"] as const).map(
      (riskTolerance) => {
        const r = run({ riskTolerance });
        return `${r.target.equity}/${r.target.bond}/${r.target.cash} ${formatPercent(
          r.targetStats.standardDeviationPercent,
          2,
        )}`;
      },
    );
    expect(rows).toEqual([
      "55/35/10 9,25%",
      "65/30/5 10,73%",
      "75/25/0 12,24%",
    ]);
  });

  it("quotes the age effect on the same risk tolerance", () => {
    const young = run({ age: 25 });
    const older = run({ age: 65 });
    expect(`${young.target.equity}/${young.target.bond}/${young.target.cash}`).toBe(
      "85/10/5",
    );
    expect(formatPercent(young.targetStats.standardDeviationPercent, 2)).toBe(
      "13,67%",
    );
    expect(`${older.target.equity}/${older.target.bond}/${older.target.cash}`).toBe(
      "45/50/5",
    );
    expect(formatPercent(older.targetStats.standardDeviationPercent, 2)).toBe(
      "8,07%",
    );
  });

  it("leaves the drift and trade rows EMPTY for an empty portfolio", () => {
    // "Nothing here" is not "on target, sell nothing".
    const r = run({ holdings: { equity: 0, bond: 0, cash: 0 } });
    expect(r.currentWeights).toBe(null);
    expect(r.trades).toBe(null);
    expect(r.maxDriftPoints).toBe(null);
    expect(r.rebalanceDue).toBe(false);
    // The target and its statistics are still there and still useful.
    expect(r.target.equity).toBe(65);
    expect(r.targetStats.standardDeviationPercent).toBeGreaterThan(0);
    expect(C.form.emptyNotice).toContain("chưa có gì");
  });

  it("names the band in the copy from the module's own constant", () => {
    expect(C.form.rebalanceNotice).toContain(String(REBALANCE_BAND_POINTS));
    expect(C.form.inBandNotice).toContain(String(REBALANCE_BAND_POINTS));
    expect(faqAnswer("cân lại một lần")).toContain(
      String(REBALANCE_BAND_POINTS),
    );
  });

  it("says out loud that the age rule is a convention", () => {
    expect(C.form.ageHelp).toContain("quy tắc kinh nghiệm");
    expect(C.advancedFormula.body[4]).toContain("không có cơ sở lý thuyết");
    expect(C.faq.items.some((item) => item.q.includes("110"))).toBe(true);
  });
});

// The review's first row-56 finding: the page's own explanation belonged to
// the advanced study while the form asked the allocation question.
describe("phan-bo-tai-san — the explanation matches the DEFAULT mode", () => {
  it("opens on the allocation mode, not the portfolio study", () => {
    expect(C.purpose.defaultMode).toBe("purpose");
  });

  it("gives the page-level method to the allocation, not the covariance sum", () => {
    const body = C.formula.body.join(" ");
    expect(body).toContain("quỹ dự phòng");
    expect(body).toContain("Chưa phân bổ");
    // The portfolio study's vocabulary must not be in the default method.
    expect(body).not.toContain("hiệp phương sai");
    expect(body).not.toContain("độ lệch chuẩn");
    expect(C.formula.body.length).toBeGreaterThan(3);
  });

  it("keeps the covariance method available, under its own title", () => {
    // Retained, not removed: it renders inside the advanced mode.
    expect(C.advancedFormula.body.join(" ")).toContain("hiệp phương sai");
    expect(C.advancedFormula.title).not.toBe(C.formula.title);
  });

  it("gives the paragraph under the calculator to the allocation too", () => {
    expect(C.purposeIntro).toContain("Chưa phân bổ");
    // The volatility figures belong to a portfolio this mode never computes.
    expect(C.purposeIntro).not.toContain("10,73%");
  });

  // Both mode-specific paragraphs have now been caught rendering in the OTHER
  // mode through the page's server-rendered `intro` slot, which cannot see
  // client state. The route passes no `intro` at all any more: each mode's
  // guidance is rendered inside that mode by the client component.
  it("passes no mode-specific paragraph through the page-level intro slot", () => {
    const page = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../app/cong-cu/phan-bo-tai-san/page.tsx",
      ),
      "utf8",
    );
    expect(page).not.toMatch(/^\s*intro=/m);
    // And the two paragraphs that must stay mode-local are referenced by the
    // client component, not by the route.
    const component = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../components/asset-allocation-calculator.tsx",
      ),
      "utf8",
    );
    expect(component).toContain("C.purposeIntro");
    expect(component).toContain("C.correlationNotice");
    expect(component).toContain("C.advancedFormula");
  });

  it("puts the allocation questions first and labels the advanced ones", () => {
    const questions = C.faq.items.map((item) => item.q);
    const firstAdvanced = questions.findIndex((q) =>
      q.includes("Chế độ nâng cao"),
    );
    expect(firstAdvanced).toBeGreaterThan(0);
    // Nothing about the advanced study sits above the allocation questions.
    for (const q of questions.slice(0, firstAdvanced)) {
      expect(q).not.toContain("tương quan");
      expect(q).not.toContain("cân lại");
    }
    // And every question after it names the mode it is about.
    const advanced = questions.slice(firstAdvanced);
    expect(advanced.length).toBeGreaterThanOrEqual(5);
    for (const q of advanced) {
      expect(q, `"${q}" does not name its mode`).toContain("nâng cao");
    }
  });
});

// The review's second and third row-56 findings.
describe("phan-bo-tai-san — the allocation order and the time anchor", () => {
  it("never credits the reader with choosing the order", () => {
    // There is no reordering control on the form, so "theo thứ tự bạn liệt
    // kê" described a choice the reader was never offered.
    const strings = [
      C.purpose.shortfallNotice,
      C.purpose.orderNotice,
      C.chart.orderNote,
      ...C.chart.assumptions,
      ...C.formula.body,
    ];
    for (const text of strings) {
      expect(text, `"${text}" still credits the reader`).not.toContain(
        "thứ tự bạn liệt kê",
      );
    }
  });

  it("states the fixed order as the tool's own convention", () => {
    expect(C.purpose.shortfallNotice).toContain("cố định");
    expect(C.purpose.shortfallNotice).toContain("không phải mức ưu tiên do bạn chọn");
    expect(C.chart.assumptions.join(" ")).toContain("quy ước cố định");
  });

  it("asks for the anchor instead of saying an unshown “hôm nay”", () => {
    expect(C.purpose.homeMonthsHelp).not.toContain("kể từ hôm nay");
    expect(C.purpose.homeMonthsHelp).toContain("ngày mốc");
    expect(C.purpose.anchorGroup).toBeTruthy();
    expect(C.purpose.anchorNotice).toContain("{date}");
    expect(C.chart.anchorNote).toContain("{date}");
  });

  it("prefills the anchor as a valid example date", () => {
    // A default that fails its own validator would open the page refused.
    const day = parseCount(C.purpose.defaultAnchorDay)!;
    const month = parseCount(C.purpose.defaultAnchorMonth)!;
    const year = parseCount(C.purpose.defaultAnchorYear)!;
    expect(isValidDate({ year, month, day })).toBe(true);
  });

  it("keeps an unstated month a valid, named state", () => {
    expect(C.purpose.anchorUnknownFormat).toContain("{name}");
    expect(C.purpose.timeUnknownNotice).toContain("chưa ghi thời điểm");
  });
});

describe("phan-bo-tai-san — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = run();
    const young = run({ age: 25 });
    const older = run({ age: 65 });
    for (const figure of [
      usd(r.totalValue),
      // The header states the direction of each trade in words ("bán
      // 45.000"), so the magnitude is what has to match — the sign lives in
      // the sentence rather than in the figure.
      ...ASSET_CLASSES.map((key) => usd(Math.abs(r.trades![key]))),
      formatPercent(r.currentWeights!.equity, 1),
      formatPercent(r.currentWeights!.bond, 1),
      formatPercent(r.currentWeights!.cash, 1),
      formatDecimal(r.maxDriftPoints!, 1),
      formatPercent(r.targetStats.expectedReturnPercent, 2),
      formatPercent(r.targetStats.standardDeviationPercent, 2),
      formatPercent(r.targetStats.weightedAverageSigmaPercent, 2),
      formatDecimal(r.targetStats.diversificationBenefitPoints, 2),
      formatDecimal(r.targetStats.returnPerRiskUnit!, 3),
      formatPercent(r.currentStats!.expectedReturnPercent, 2),
      formatPercent(r.currentStats!.standardDeviationPercent, 2),
      formatDecimal(r.currentStats!.returnPerRiskUnit!, 3),
      formatPercent(young.targetStats.standardDeviationPercent, 2),
      formatPercent(older.targetStats.standardDeviationPercent, 2),
      ...[-0.5, 0, 0.5, 1].map((equityBondCorrelation) =>
        formatPercent(
          run({ equityBondCorrelation }).targetStats.standardDeviationPercent,
          2,
        ),
      ),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
