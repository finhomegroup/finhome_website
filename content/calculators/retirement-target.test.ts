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
  solveRequiredContribution,
  type RetirementInput,
} from "@/lib/calc/retirement";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

// The module AT ITS SHIPPED DEFAULTS, which docs §6 names as the highest-value
// substitute for the component coverage this repo cannot have: the defaults are
// parsed with the SAME parsers the component uses (via readRetirement itself,
// not a re-implementation), the module is called, and the result is formatted
// with the same formatters. A ₫-vs-decimal parser mix-up in the shipped default
// state is therefore visible here, which is the class of defect that reached
// production twice.
const READ = readRetirement(RETIREMENT_DEFAULTS, ["annualContribution"]);

function solve(over: Partial<RetirementInput> = {}) {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const result = solveRequiredContribution({ ...READ.input, ...over });
  if (!result) throw new Error("solveRequiredContribution returned null");
  return result;
}

/** The component's own two formatters — see retirement-target-calculator.tsx. */
const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "retirement-target.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("tinh-huu-tri at its shipped defaults", () => {
  it("parses every default with the parser its own field kind needs", () => {
    // Not a formality: `parseMoney("2,5")` and `parseDecimal("100.000")` both
    // succeed and both are wrong by 1000x. readRetirement picks the parser per
    // field kind, and this asserts the shipped strings survive that.
    expect(READ.input).not.toBe(null);
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
    expect(READ.input).toMatchObject({
      currentAge: 35,
      retirementAge: 65,
      endAge: 95,
      currentBalance: 100_000,
      contributionGrowthPercent: 2,
      returnBeforePercent: 7,
      returnAfterPercent: 5,
      inflationPercent: 2.5,
      desiredAnnualSpending: 80_000,
      otherAnnualIncome: 25_000,
    });
  });

  it("renders the headline the copy quotes", () => {
    const r = solve();
    expect(usdCents(r.monthlyContribution)).toBe("1.163,04");
    expect(usdCents(r.annualContribution)).toBe("13.956,50");
    expect(r.alreadyFunded).toBe(false);
    expect(C.growingNotice).toContain(usdCents(r.monthlyContribution));
    expect(C.faq.items[0].a).toContain(usdCents(r.monthlyContribution));
  });

  it("quotes the LAST year's contribution, which is the trap", () => {
    const r = solve();
    const last = r.projection.years.filter((y) => y.accumulating).at(-1)!;
    expect(last.age).toBe(64);
    expect(usdCents(last.contribution / 12)).toBe("2.065,38");
    expect(C.growingNotice).toContain(usdCents(last.contribution / 12));
    // The whole point of showing it: it is nearly double the first year.
    expect(last.contribution / r.annualContribution).toBeGreaterThan(1.7);
  });

  it("quotes the level-contribution alternative and how much dearer it starts", () => {
    const level = solve({ contributionGrowthPercent: 0 });
    expect(usdCents(level.monthlyContribution)).toBe("1.428,46");
    expect(C.growingNotice).toContain(usdCents(level.monthlyContribution));
    const dearer =
      (level.annualContribution / solve().annualContribution - 1) * 100;
    expect(formatPercent(dearer, 1)).toBe("22,8%");
    expect(C.growingNotice).toContain("22,8%");
  });

  it("quotes the cost of starting ten years later", () => {
    const late = solve({ currentAge: 45 });
    expect(usdCents(late.monthlyContribution)).toBe("2.550,32");
    expect(usd(late.projection.totalContributed)).toBe("743.593");
    const dearer =
      (late.annualContribution / solve().annualContribution - 1) * 100;
    expect(formatPercent(dearer, 1)).toBe("119,3%");
    const a = C.faq.items[0].a;
    expect(a).toContain(usdCents(late.monthlyContribution));
    expect(a).toContain(usd(late.projection.totalContributed));
    expect(a).toContain("119,3%");
  });

  it("quotes the total contributed against 30 level payments", () => {
    const r = solve();
    expect(usd(r.projection.totalContributed)).toBe("566.188");
    expect(usd(r.annualContribution * 30)).toBe("418.695");
    expect(C.formula.body[3]).toContain(usd(r.projection.totalContributed));
    expect(C.formula.body[3]).toContain(usd(r.annualContribution * 30));
  });

  it("quotes the growth share", () => {
    const r = solve();
    const share =
      (r.projection.totalGrowth / r.projection.totalContributed) * 100;
    expect(usd(r.projection.totalGrowth)).toBe("4.398.700");
    expect(formatPercent(share, 1)).toBe("776,9%");
    expect(C.faq.items[1].a).toContain(usd(r.projection.totalGrowth));
    expect(C.faq.items[1].a).toContain("776,9%");
  });
});

describe("tinh-huu-tri — the identities the page prints", () => {
  it("makes the sustainable spend land back on the spend that was asked for", () => {
    // The check the copy promises in formula.body[5]. Two independent routes
    // to one number: a bisection over the projection, and the closed-form
    // annuity-due factor on the real return. Their agreement is what makes
    // either trustworthy — and it is exactly the identity that a sign flip in
    // `sustainableSpending` would break (see docs §8 defect 3).
    const r = solve();
    expect(r.projection.sustainableSpending).not.toBe(null);
    // The solver stops at a 1e-4 bracket on an annual contribution, so the
    // spend it implies carries a matching residue. An absolute bound in USD
    // is the honest assertion here; toBeCloseTo(80_000, 2) fails for a
    // correct answer. Measured residue on these defaults is ~2e-5 USD.
    expect(
      Math.abs(r.projection.sustainableSpending! - 80_000),
    ).toBeLessThan(0.01);
  });

  it("lands the plan on exactly zero, which is what 'minimum' means", () => {
    const r = solve();
    expect(r.projection.depletionAge).toBe(null);
    expect(usd(r.projection.finalBalance)).toBe("0");
    expect(r.projection.realFinalBalance).toBeLessThan(1);
  });

  it("answers 0, not a small number, when the balance already funds the plan", () => {
    const rich = solve({ currentBalance: 3_000_000 });
    expect(rich.alreadyFunded).toBe(true);
    expect(rich.annualContribution).toBe(0);
    expect(rich.monthlyContribution).toBe(0);
    expect(C.form.fundedNotice).toContain("0");
  });

  it("returns null rather than a guess when nothing in the bracket funds the plan", () => {
    if (READ.input === null) throw new Error("defaults do not parse");
    expect(
      solveRequiredContribution({
        ...READ.input,
        desiredAnnualSpending: 5e9,
      }),
    ).toBe(null);
    // And the page has a message for that case which is not the invalid-input
    // message — the two failures are different and say so.
    expect(C.form.unsolvableNotice).not.toBe(C.form.invalidNotice);
  });

  it("rejects contradictory ages through the shared reader, not the page", () => {
    const bad = readRetirement(
      { ...RETIREMENT_DEFAULTS, retirementAge: "abc" },
      ["annualContribution"],
    );
    expect(bad.input).toBe(null);
    expect(bad.invalid.retirementAge).toBe(true);
  });

  it("never marks the solved-for field invalid", () => {
    // The omitted field is not rendered, so an invalid flag on it could never
    // be seen or corrected — it would blank the whole page with no explanation.
    const blank = readRetirement(
      { ...RETIREMENT_DEFAULTS, annualContribution: "" },
      ["annualContribution"],
    );
    expect(blank.invalid.annualContribution).toBe(false);
    expect(blank.input).not.toBe(null);
  });
});

describe("tinh-huu-tri — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const r = solve();
    const last = r.projection.years.filter((y) => y.accumulating).at(-1)!;
    const late = solve({ currentAge: 45 });
    const level = solve({ contributionGrowthPercent: 0 });
    for (const figure of [
      usdCents(r.annualContribution),
      usdCents(r.monthlyContribution),
      usdCents(last.contribution),
      usdCents(last.contribution / 12),
      usdCents(r.projection.totalContributed),
      usdCents(r.annualContribution * 30),
      usdCents(level.annualContribution),
      usdCents(level.monthlyContribution),
      usdCents(late.annualContribution),
      usdCents(late.monthlyContribution),
      usdCents(late.projection.totalContributed),
      usdCents(r.projection.totalGrowth),
      usdCents(r.projection.balanceAtRetirement),
      usdCents(r.projection.realBalanceAtRetirement),
      formatPercent(r.projection.initialWithdrawalRatePercent!, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
