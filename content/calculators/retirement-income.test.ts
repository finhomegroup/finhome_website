import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readRetirement,
  RETIREMENT_DEFAULTS,
} from "@/components/calc/retirement-fields";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import {
  projectRetirement,
  type RetirementInput,
} from "@/lib/calc/retirement";
import { RETIREMENT_INCOME as C } from "@/content/calculators/retirement-income";

// The module at its shipped defaults — docs §6. The defaults are parsed by
// `readRetirement`, the same reader the component uses, not by a copy of it.
const READ = readRetirement(RETIREMENT_DEFAULTS, ["desiredAnnualSpending"]);

/** The component's two-pass shape, reproduced exactly. */
function income(over: Partial<RetirementInput> = {}) {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const input = { ...READ.input, desiredAnnualSpending: 0, ...over };
  const probe = projectRetirement(input);
  if (!probe || probe.sustainableSpending === null) {
    throw new Error("projectRetirement returned nothing usable");
  }
  const sustainable = probe.sustainableSpending;
  const plan = projectRetirement({
    ...input,
    desiredAnnualSpending: sustainable,
  })!;
  return {
    probe,
    plan,
    sustainable,
    fromPortfolio: sustainable - input.otherAnnualIncome,
    drawing: plan.years.filter((row) => !row.accumulating),
  };
}

const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-income.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("thu-nhap-huu-tri at its shipped defaults", () => {
  it("parses every default with the parser its own field kind needs", () => {
    expect(READ.input).not.toBe(null);
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
    expect(READ.input).toMatchObject({
      currentAge: 35,
      retirementAge: 65,
      endAge: 95,
      currentBalance: 100_000,
      annualContribution: 20_000,
      returnAfterPercent: 5,
      inflationPercent: 2.5,
      otherAnnualIncome: 25_000,
    });
  });

  it("never marks the solved-for field invalid", () => {
    const blank = readRetirement(
      { ...RETIREMENT_DEFAULTS, desiredAnnualSpending: "" },
      ["desiredAnnualSpending"],
    );
    expect(blank.invalid.desiredAnnualSpending).toBe(false);
    expect(blank.input).not.toBe(null);
  });

  it("renders the two headline figures the copy quotes", () => {
    const r = income();
    expect(usdCents(r.sustainable)).toBe("96.546,38");
    expect(usdCents(r.sustainable / 12)).toBe("8.045,53");
    expect(usdCents(r.fromPortfolio)).toBe("71.546,38");
    expect(usdCents(r.fromPortfolio / 12)).toBe("5.962,20");
    expect(formatPercent(r.plan.initialWithdrawalRatePercent!, 2)).toBe("4,63%");
  });

  it("does not let the probe's assumed spend leak into the answer", () => {
    // The component probes at a zero spend. If `sustainableSpending` depended
    // on the spend that was fed in, that choice would silently bias every
    // figure on the page — so assert it does not, at four different spends.
    const at = (desiredAnnualSpending: number) =>
      projectRetirement({ ...READ.input!, desiredAnnualSpending })!
        .sustainableSpending;
    const zero = at(0);
    for (const spend of [1, 50_000, 96_546.38, 400_000]) {
      expect(at(spend)).toBe(zero);
    }
  });

  it("holds the real withdrawal level while the nominal one more than doubles", () => {
    const r = income();
    const first = r.drawing[0];
    const last = r.drawing.at(-1)!;
    expect(first.age).toBe(65);
    expect(last.age).toBe(94);
    expect(usdCents(first.withdrawal)).toBe("150.073,36");
    expect(usdCents(last.withdrawal)).toBe("307.111,24");
    expect(last.withdrawal / first.withdrawal).toBeGreaterThan(2);
    // The column that stands still, which is the page's whole argument.
    for (const row of r.drawing) {
      expect(usdCents(row.realWithdrawal)).toBe(usdCents(r.fromPortfolio));
    }
    expect(C.formula.body[3]).toContain(usd(first.withdrawal));
    expect(C.formula.body[3]).toContain(usd(last.withdrawal));
    expect(C.formula.body[3]).toContain(usd(r.fromPortfolio));
  });

  it("is the MAXIMUM sustainable spend, not a safe-looking figure below it", () => {
    // Feeding the answer back in must just fund the plan; a thousand more
    // must not. Without this the page could print any number it liked.
    const r = income();
    expect(r.plan.depletionAge).toBe(null);
    expect(r.plan.realFinalBalance).toBeLessThan(1);
    const over = projectRetirement({
      ...READ.input!,
      desiredAnnualSpending: r.sustainable + 1_000,
    })!;
    expect(over.depletionAge).toBe(94);
    expect(C.formula.body[5]).toContain("94");
  });

  it("quotes the 4%-rule comparison the FAQ makes", () => {
    const r = income();
    const fourPercent = r.probe.realBalanceAtRetirement * 0.04;
    expect(usd(fourPercent)).toBe("61.862");
    const dearer = (r.fromPortfolio / fourPercent - 1) * 100;
    expect(formatPercent(dearer, 1)).toBe("15,7%");
    const a = C.faq.items[0].a;
    expect(a).toContain(usd(fourPercent));
    expect(a).toContain(usd(r.fromPortfolio));
    expect(a).toContain("15,7%");
  });

  it("quotes what a 105-year horizon costs", () => {
    const to95 = income();
    const to105 = income({ endAge: 105 });
    expect(usd(to105.fromPortfolio)).toBe("59.526");
    expect(usd(to105.fromPortfolio / 12)).toBe("4.961");
    const lower = (1 - to105.fromPortfolio / to95.fromPortfolio) * 100;
    expect(formatPercent(lower, 1)).toBe("16,8%");
    expect(C.zeroNotice).toContain(usd(to105.fromPortfolio / 12));
    expect(C.zeroNotice).toContain(usd(to95.fromPortfolio / 12));
    expect(C.zeroNotice).toContain("16,8%");
  });

  it("states the real return as a ratio, not a subtraction", () => {
    // formula.body[1] claims 2,44%, not 2,5%. The difference is small and it
    // compounds over 30 years, which is why the module uses the ratio.
    const real = (1.05 / 1.025 - 1) * 100;
    expect(formatPercent(real, 2)).toBe("2,44%");
    expect(C.formula.body[1]).toContain("2,44%");
  });

  it("keeps paying the other income when the portfolio is empty", () => {
    // The discontinuity docs §8 records: at a zero balance this row must be
    // the pension, not zero.
    const broke = income({ currentBalance: 0, annualContribution: 0 });
    expect(broke.probe.realBalanceAtRetirement).toBe(0);
    expect(broke.sustainable).toBe(25_000);
    expect(broke.fromPortfolio).toBe(0);
    expect(C.form.noBalanceNotice).toContain("0");
  });

  it("reduces to balance-over-years when the real return is zero", () => {
    const flat = income({ returnAfterPercent: 2.5 });
    expect(flat.fromPortfolio).toBeCloseTo(
      flat.probe.realBalanceAtRetirement / 30,
      6,
    );
  });

  it("quotes the purchasing power an unindexed pension keeps", () => {
    const kept = 1 / Math.pow(1.025, 30);
    expect(formatPercent(kept * 100, 0)).toBe("48%");
    expect(C.faq.items[3].a).toContain("48%");
  });

  it("quotes the after-tax figure at a 22% marginal rate", () => {
    const r = income();
    const net = (r.fromPortfolio / 12) * 0.78;
    expect(usd(net)).toBe("4.651");
    expect(C.faq.items[4].a).toContain(usd(net));
    expect(C.faq.items[4].a).toContain(usd(r.fromPortfolio / 12));
  });
});

describe("thu-nhap-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = income();
    const to105 = income({ endAge: 105 });
    for (const figure of [
      usdCents(r.sustainable),
      usdCents(r.sustainable / 12),
      usdCents(r.fromPortfolio),
      usdCents(r.fromPortfolio / 12),
      formatPercent(r.plan.initialWithdrawalRatePercent!, 2),
      usdCents(r.probe.balanceAtRetirement),
      usdCents(r.probe.realBalanceAtRetirement),
      usdCents(r.drawing[0].withdrawal),
      usdCents(r.drawing.at(-1)!.withdrawal),
      usd(r.plan.totalWithdrawn),
      usd(r.plan.totalContributed),
      usdCents(r.probe.realBalanceAtRetirement * 0.04),
      usdCents((r.probe.realBalanceAtRetirement * 0.04) / 12),
      usd(to105.fromPortfolio),
      usd(to105.fromPortfolio / 12),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
