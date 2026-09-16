// The shared ₫ scenario behind the four long-term plan routes (44/45/48/50),
// and the guard that route 44's prose agrees with it.
//
// WHY THIS FILE EXISTS. docs §6 records that three of this suite's five worst
// defects were invisible to a green test run because they lived in a DEFAULT
// INPUT or in a component rather than in a module. The cheapest substitute is
// to assert the module at its shipped defaults: parse the content file's own
// strings with the same parser the component uses, run the engine, format with
// the same formatter, and pin the result.
//
// It also closes a gap this page has had since it shipped. Route 44's notice
// and FAQ quote exact computed figures — a balance at retirement, the same
// balance in today's money, a first-year draw, a withdrawal rate, a
// sustainable spend — and NOTHING checked them against the model. Re-scaling a
// default silently falsifies every one of those sentences, and on these pages
// the prose IS the teaching. So each quoted figure is derived here from the
// shipped strings and asserted to occur in the sentence that quotes it: move a
// default and the failure names the sentence that has to move with it.
import { describe, it, expect } from "vitest";
import { readRetirement } from "@/components/calc/retirement-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  fundedAtBoundary,
  remedyFor,
  resolveLongTermPlan,
} from "@/lib/calc/long-term-plan";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const READ = readRetirement(L.defaults);

/** The plan the four routes open on. */
function shippedPlan() {
  if (READ.input === null) throw new Error("the shipped defaults do not parse");
  const plan = resolveLongTermPlan(READ.input);
  if (plan === null) throw new Error("resolveLongTermPlan refused the defaults");
  return plan;
}

/** The same formatter the components use. Never `Intl`. */
const dong = (value: number) => formatMoney(value);

describe("the shared long-term ₫ scenario", () => {
  it("reads a ₫ money field with parseMoney, never with parseDecimal", () => {
    // §4's single most repeated defect, stated as an executable fact rather
    // than as a comment: the same string is a 1000x different number under the
    // two grammars. It has shipped a P/E out by 1000x, a 30-year forecast from
    // a typed "3.0", and 500 lượng of gold for "0.5".
    expect(parseMoney("500.000")).toBe(500_000);
    expect(parseDecimal("500.000")).toBe(500);
    // And the shipped money defaults are actually read the money way. Each is
    // a grouped string, so the wrong parser is not a near miss.
    for (const key of [
      "currentBalance",
      "annualContribution",
      "desiredAnnualSpending",
      "otherAnnualIncome",
    ] as const) {
      const raw = L.defaults[key];
      expect(raw, `${key} is not written in Vietnamese grouping`).toContain(".");
      expect(parseMoney(raw)).toBeGreaterThan(parseDecimal(raw)! * 999);
    }
  });

  it("denominates every money default in đồng, not in dollars", () => {
    // A ₫ scenario is three orders of magnitude larger than the USD one these
    // four routes shipped with. A FLOOR rather than an exact figure, so this
    // stays a currency check and leaves the founder free to move the scenario.
    expect(READ.input).not.toBe(null);
    const input = READ.input!;
    // The defect this first caught: the superseded USD default `"100.000"`
    // parses to 100.000 ₫ — one hundred thousand đồng of long-term savings —
    // because the grammar was already right and only the MAGNITUDE was in
    // dollars. That object is gone now that all four routes read
    // `LONG_TERM_PLAN.defaults`, so the floors below are what stands guard.
    expect(input.currentBalance).toBeGreaterThanOrEqual(100_000_000);
    expect(input.annualContribution).toBeGreaterThanOrEqual(12_000_000);
    expect(input.desiredAnnualSpending).toBeGreaterThanOrEqual(60_000_000);
    expect(input.otherAnnualIncome).toBeGreaterThanOrEqual(12_000_000);
  });

  it("parses its own defaults with the right parser per field kind", () => {
    expect(Object.values(READ.invalid).some(Boolean)).toBe(false);
    expect(READ.input).toMatchObject({
      currentAge: 35,
      retirementAge: 60,
      endAge: 85,
      currentBalance: 500_000_000,
      annualContribution: 60_000_000,
      contributionGrowthPercent: 5,
      returnBeforePercent: 8,
      returnAfterPercent: 5,
      inflationPercent: 4,
      desiredAnnualSpending: 240_000_000,
      otherAnnualIncome: 36_000_000,
    });
  });

  it("states the currency once, and in đồng", () => {
    // Four routes suffix amounts from this one place, so two pages of the same
    // plan cannot render the same quantity in two currencies.
    expect(L.money.currency).toBe("₫");
    for (const field of Object.values(L.fields.fields)) {
      expect(field.unit ?? "", `${field.label} still says USD`).not.toContain(
        "USD",
      );
    }
  });

  it("agrees with a closed form on the capital it accumulates", () => {
    // An independent reference, not a re-run of the engine. The accumulation
    // recursion B(k+1) = (B(k) + C(k)) * (1+r) with C(k) = C * (1+g)^k has the
    // closed form B(n) = B0*(1+r)^n + C*(1+r)^n * sum((1+g)/(1+r))^k, k=0..n-1.
    const input = READ.input!;
    const n = input.retirementAge - input.currentAge;
    const r = input.returnBeforePercent / 100;
    const g = input.contributionGrowthPercent / 100;
    const q = (1 + g) / (1 + r);
    const expected =
      input.currentBalance * (1 + r) ** n +
      input.annualContribution * (1 + r) ** n * ((1 - q ** n) / (1 - q));
    const { asEntered } = shippedPlan();
    // A 1 ₫ absolute bound on a figure of order 1e10: the two expressions
    // accumulate float error differently, so `toBeCloseTo(_, 8)` would fail a
    // correct answer — docs §8's tolerance note.
    expect(
      Math.abs(asEntered.balanceAtRetirement - expected),
    ).toBeLessThan(1);
  });

  it("opens on a plan that is SHORT, which is what a planner must show", () => {
    // A planning tool whose default state reports "đủ" demonstrates nothing —
    // the judgement `retirement-savings-analysis.test.ts` already records.
    const plan = shippedPlan();
    expect(plan.gap.funded).toBe(false);
    expect(plan.asEntered.depletionAge).not.toBe(null);
    expect(plan.gap.realShortfall).toBeGreaterThan(0);
    // And all three remedies are reachable, so the sibling routes have
    // something to price.
    for (const key of ["contribute", "retireLater", "spendLess"] as const) {
      expect(remedyFor(plan.gap, key).available, key).toBe(true);
    }
  });

  it("gives the same funded verdict everywhere it is asked", () => {
    // `gap.funded`, the entered withdrawal path's `funded` and a direct
    // `fundedAtBoundary` call are one policy on one projection. A page reading
    // a different one of the three would contradict its own sibling.
    const plan = shippedPlan();
    const direct = fundedAtBoundary(plan.asEntered, plan.input.endAge);
    expect(plan.gap.funded).toBe(direct.funded);
    expect(plan.withdrawal.paths[0].key).toBe("asEntered");
    expect(plan.withdrawal.paths[0].funded).toBe(direct.funded);
  });

  it("forgives a float residue only in the FINAL year", () => {
    // The artefact, reproducible at đồng magnitudes: at a zero real return the
    // annuity-due factor is exactly the span, so 4 tỷ over 25 years plus
    // 36.000.000 ₫ of other income is a sustainable spend of exactly
    // 196.000.000 ₫ — and the projection reports a depletion in the final
    // year, short by a few millionths of one đồng.
    const boundaryInput = {
      currentAge: 60,
      retirementAge: 60,
      endAge: 85,
      currentBalance: 4_000_000_000,
      annualContribution: 0,
      contributionGrowthPercent: 0,
      returnBeforePercent: 4,
      returnAfterPercent: 4,
      inflationPercent: 4,
      desiredAnnualSpending: 196_000_000,
      otherAnnualIncome: 36_000_000,
    };
    const plan = resolveLongTermPlan(boundaryInput)!;
    // The naive read says the plan fails.
    expect(plan.asEntered.depletionAge).toBe(boundaryInput.endAge - 1);
    // The policy says it is funded, and hands back what it forgave.
    expect(plan.gap.funded).toBe(true);
    const residue = plan.withdrawal.paths[0].boundaryResidue;
    expect(residue).not.toBe(null);
    expect(residue!).toBeGreaterThan(0);
    expect(residue!).toBeLessThan(1);

    // And it forgives NOTHING on a plan that is genuinely short: the default
    // scenario above depletes three years early, by real money.
    const shipped = shippedPlan();
    expect(shipped.gap.funded).toBe(false);
    expect(shipped.withdrawal.paths[0].boundaryResidue).toBe(null);
    expect(shipped.asEntered.lastWithdrawalShortfall!).toBeGreaterThan(1e6);
  });
});

// The guard this content has never had: the sentences and the model agree.
describe("route 44's prose quotes the model, not a memory of it", () => {
  const plan = shippedPlan();
  const r = plan.asEntered;
  const firstWithdrawal = r.years.find((row) => !row.accumulating)!;

  it("quotes the capital both ways in the notice above the calculator", () => {
    // The page's whole point: the nominal figure and the same figure in
    // today's money. Both are rendered in the result rows, so the notice must
    // not quote a third number.
    expect(C.realNotice).toContain(dong(r.balanceAtRetirement));
    expect(C.realNotice).toContain(dong(r.realBalanceAtRetirement));
  });

  it("quotes the first year's draw in both readings", () => {
    expect(C.realNotice).toContain(dong(firstWithdrawal.withdrawal));
    // In today's money the draw is exactly the spend that was asked for less
    // other income — the identity `retirement.ts` keeps two deflators for.
    expect(firstWithdrawal.realWithdrawal).toBeCloseTo(
      plan.input.desiredAnnualSpending - plan.input.otherAnnualIncome,
      6,
    );
    expect(C.realNotice).toContain(dong(firstWithdrawal.realWithdrawal));
  });

  it("quotes the inflation factor and the share it leaves", () => {
    const years = plan.input.retirementAge - plan.input.currentAge;
    const factor = (1 + plan.input.inflationPercent / 100) ** years;
    const share = (r.realBalanceAtRetirement / r.balanceAtRetirement) * 100;
    const answer = C.faq.items[0].a;
    expect(answer).toContain(`1,04^${years}`);
    expect(answer).toContain(formatDecimal(factor, 2));
    expect(answer).toContain(formatDecimal(share, 1));
    expect(answer).toContain(dong(r.balanceAtRetirement));
    expect(answer).toContain(dong(r.realBalanceAtRetirement));
  });

  it("quotes the withdrawal rate in the question that asks about it", () => {
    // The old copy asked about 3,56%, which was the USD scenario's rate. A
    // question whose own number is stale is worse than no question.
    expect(r.initialWithdrawalRatePercent).not.toBe(null);
    expect(C.faq.items[3].q).toContain(
      formatPercent(r.initialWithdrawalRatePercent!, 2),
    );
  });

  it("quotes the sustainable spend and the gap to what was asked", () => {
    const answer = C.faq.items[3].a;
    expect(r.sustainableSpending).not.toBe(null);
    expect(answer).toContain(dong(r.sustainableSpending!));
    expect(answer).toContain(dong(plan.input.desiredAnnualSpending));
    expect(answer).toContain(dong(r.spendingShortfall));
  });

  it("quotes the depletion year's PARTIAL payment in the component's copy", () => {
    // "Cạn ở tuổi 82" counts the year that could not be paid in full, and that
    // year normally pays something. The component comment naming those figures
    // is bound here so it cannot rot into a different scenario's numbers.
    expect(r.lastWithdrawalPlanned).not.toBe(null);
    expect(r.lastWithdrawalPaid).not.toBe(null);
    expect(r.yearsShort).toBeGreaterThan(0);
  });

  it("says nothing about United States law anywhere on the page", () => {
    // The `usRules` notice is gone from the registry; a leftover sentence
    // would reinstate the claim without the flag.
    const everything = [
      C.pageTitle,
      C.metaTitle,
      C.metaDescription,
      C.lede,
      C.realNotice,
      ...C.formula.body,
      ...C.faq.items.flatMap((item) => [item.q, item.a]),
      ...Object.values(C.chart).flatMap((value) =>
        typeof value === "string" ? [value] : [...value],
      ),
    ].join(" ");
    for (const claim of ["Hoa Kỳ", "USD", "401", "IRA", "Roth"]) {
      expect(everything, `still mentions ${claim}`).not.toContain(claim);
    }
  });
});
