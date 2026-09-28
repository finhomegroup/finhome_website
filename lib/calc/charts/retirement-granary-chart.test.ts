// The granary is the engine's ledger drawn as bowls: every fixture below is
// compared with `resolveLongTermPlan`'s own rows, never with memorised counts.
import { describe, expect, it } from "vitest";
import { resolveLongTermPlan, type LongTermPlan } from "@/lib/calc/long-term-plan";
import type { RetirementInput } from "@/lib/calc/retirement";
import {
  retirementGranaryModel,
  shareText,
  type GranaryLabels,
  type GranaryModel,
} from "./retirement-granary-chart";

const LABELS: GranaryLabels = {
  unit: { withOtherIncome: "UNIT-OTHER", withoutOtherIncome: "UNIT-PLAIN" },
  legend: {
    full: "L-FULL",
    partial: "L-PARTIAL",
    otherOnly: "L-OTHER-ONLY",
    empty: "L-EMPTY",
    coveredOtherIncome: "L-COVERED-INCOME",
    coveredNoSpending: "L-COVERED-NOTHING",
  },
  range: { one: "tuổi {age}", span: "từ tuổi {from} đến {to}" },
  summary: {
    fullRun: "FULL {count} năm, {range}.",
    zeroFull: "ZERO-FULL tuổi {age}.",
    partial: "PARTIAL tuổi {age}: {share}.",
    otherOnlyRun: "OTHER-ONLY {count} năm, {range}: {share}.",
    allOtherOnly: "ALL-OTHER-ONLY {count} năm, {range}: {share}.",
    emptyRun: "EMPTY {count} năm, {range}.",
    allEmpty: "ALL-EMPTY {count} năm, {range}.",
    funded: "FUNDED {count} năm, {range}.",
    otherIncome: "OTHER-INCOME {count} năm.",
    noSpending: "NO-SPENDING.",
  },
  share: { percent: "{value}%", below: "dưới 1%", above: "hơn 99%" },
};

/** The shipped scenario, as numbers — `content/calculators/long-term-plan.ts`. */
const BASE: RetirementInput = {
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
};

/** Retiring today on a flat 0% world: every need is 204 triệu, exactly. */
const FLAT: Partial<RetirementInput> = {
  currentAge: 60,
  retirementAge: 60,
  annualContribution: 0,
  contributionGrowthPercent: 0,
  returnBeforePercent: 0,
  returnAfterPercent: 0,
  inflationPercent: 0,
};
const NEED = 204_000_000;

function plan(patch: Partial<RetirementInput> = {}): LongTermPlan {
  const resolved = resolveLongTermPlan({ ...BASE, ...patch });
  if (resolved === null) throw new Error("fixture refused by the engine");
  return resolved;
}

type Drawn = Exclude<GranaryModel, { kind: "unavailable" }>;
function drawn(p: LongTermPlan): Drawn {
  const model = retirementGranaryModel(p, LABELS);
  if (model.kind === "unavailable") throw new Error("expected a drawing");
  return model;
}

describe("the granary at the shipped defaults", () => {
  const p = plan();
  const model = drawn(p);
  const result = p.asEntered;

  it("draws one bowl per retirement year, read off the engine's rows", () => {
    const rows = result.years.filter((row) => !row.accumulating);
    expect(model.bowls.map((bowl) => bowl.age)).toEqual(rows.map((row) => row.age));
    expect(model.bowls.length).toBe(p.input.endAge - p.input.retirementAge);
  });

  it("is short: full years, one partial year, then other-income-only ones", () => {
    expect(model.kind).toBe("short");
    // Other income exists on this scenario, so a year the savings cannot pay
    // still keeps its lower layer: other-income-only, not empty.
    expect(model.counts).toEqual({
      full: result.yearsFunded,
      partial: 1,
      otherOnly: result.yearsShort - 1,
      empty: 0,
      covered: 0,
    });
    // Derived above; pinned here too so a moved default is visible.
    expect([model.counts.full, model.counts.partial, model.counts.otherOnly]).toEqual([22, 1, 2]);
    expect(model.firstShortAge).toBe(result.depletionAge);
    expect(model.firstShortAge).toBe(82);
  });

  it("fills the depletion year with exactly the share the savings paid, over the other-income layer", () => {
    const share = result.lastWithdrawalPaid! / result.lastWithdrawalPlanned!;
    const other = p.input.otherAnnualIncome / p.input.desiredAnnualSpending;
    expect(other).toBe(0.15);
    expect(model.partialShare).toBe(share);
    expect(model.partialShare).toBeCloseTo(0.1406, 4);
    const partial = model.bowls.find((bowl) => bowl.state === "partial")!;
    expect(partial.age).toBe(result.depletionAge);
    expect(partial.savings).toBe(share);
    expect(partial.other).toBe(other);
    expect(partial.fill).toBeCloseTo(other + (1 - other) * share, 12);
    // Every bowl carries the same other-income layer.
    expect(new Set(model.bowls.map((bowl) => bowl.other))).toEqual(new Set([other]));
  });

  it("groups in fives with a tick at each group's first age", () => {
    expect(model.groups.map((group) => group.length)).toEqual([5, 5, 5, 5, 5]);
    expect(model.ticks.map((tick) => tick.age)).toEqual([60, 65, 70, 75, 80]);
  });

  it("says every bowl in three sentences, with other income named", () => {
    expect(model.unit).toBe("UNIT-OTHER");
    expect(model.summary).toEqual([
      "FULL 22 năm, từ tuổi 60 đến 81.",
      "PARTIAL tuổi 82: 14%.",
      "OTHER-ONLY 2 năm, từ tuổi 83 đến 84: 15%.",
    ]);
  });
});

describe("the granary's other states", () => {
  it("draws a forgiven final-year residue as a full granary", () => {
    // The render test's FUNDED_BOUNDARY: the projection reports a depletion
    // at 84 by a fraction of one đồng, and `fundedAtBoundary` forgives it.
    const p = plan({
      ...FLAT,
      currentBalance: 4_000_000_000,
      returnBeforePercent: 4,
      returnAfterPercent: 4,
      inflationPercent: 4,
      desiredAnnualSpending: 196_000_000,
    });
    expect(p.asEntered.depletionAge).toBe(84);
    const model = drawn(p);
    expect(model.kind).toBe("boundary");
    expect(model.counts.full).toBe(25);
    expect(model.firstShortAge).toBeNull();
    expect(model.partialShare).toBeNull();
  });

  it("is funded on the QA document's green case", () => {
    const model = drawn(plan({ annualContribution: 120_000_000 }));
    expect(model.kind).toBe("funded");
    expect(model.counts.full).toBe(25);
    expect(model.summary).toEqual(["FUNDED 25 năm, từ tuổi 60 đến 84."]);
  });

  it("covers every year when other income pays for the spend", () => {
    const model = drawn(plan({ otherAnnualIncome: 240_000_000 }));
    expect(model.kind).toBe("zeroNeed");
    expect(model.zeroNeedReason).toBe("otherIncome");
    expect(model.counts.covered).toBe(25);
    expect(model.summary).toEqual(["OTHER-INCOME 25 năm."]);
  });

  it("gives a zero spend its own cause and its own label", () => {
    for (const other of [36_000_000, 0]) {
      const model = drawn(plan({ desiredAnnualSpending: 0, otherAnnualIncome: other }));
      expect(model.kind).toBe("zeroNeed");
      expect(model.zeroNeedReason).toBe("noSpending");
      expect(model.summary).toEqual(["NO-SPENDING."]);
      expect(model.unit).toBe(other > 0 ? "UNIT-OTHER" : "UNIT-PLAIN");
    }
  });

  it("starts the bowls at today when retiring today, and handles a one-year span", () => {
    expect(drawn(plan({ currentAge: 60, retirementAge: 60 })).bowls[0].age).toBe(60);
    const one = drawn(plan({ retirementAge: 84 }));
    expect(one.bowls.length).toBe(1);
    expect(one.ticks).toEqual([{ group: 0, age: 84 }]);
  });

  it("holds a hundred-year horizon in twenty groups", () => {
    const model = drawn(
      plan({ currentAge: 20, retirementAge: 20, endAge: 120, currentBalance: 0, annualContribution: 0 }),
    );
    expect(model.bowls.length).toBe(100);
    expect(model.groups.length).toBe(20);
  });

  it("says ONE sentence when nothing was ever saved", () => {
    const model = drawn(plan({ currentBalance: 0, annualContribution: 0 }));
    expect(model.counts.otherOnly).toBe(25);
    expect(model.firstShortAge).toBe(60);
    expect(model.partialShare).toBeNull();
    expect(model.summary).toEqual(["ALL-OTHER-ONLY 25 năm, từ tuổi 60 đến 84: 15%."]);
    // With no other income either, every bowl is truly empty.
    const bare = drawn(plan({ currentBalance: 0, annualContribution: 0, otherAnnualIncome: 0 }));
    expect(bare.counts.empty).toBe(25);
    expect(bare.summary).toEqual(["ALL-EMPTY 25 năm, từ tuổi 60 đến 84."]);
  });

  it("never prints a backwards range when the first year is already short", () => {
    const model = drawn(plan({ ...FLAT, currentBalance: 100_000_000 }));
    expect(model.counts.full).toBe(0);
    expect(model.summary[0]).toBe("ZERO-FULL tuổi 60.");
    expect(model.summary[1]).toBe(`PARTIAL tuổi 60: ${shareText(100 / 204, LABELS.share)}.`);
    expect(model.summary[2]).toBe("OTHER-ONLY 24 năm, từ tuổi 61 đến 84: 15%.");
  });

  it("draws a depletion year that paid nothing as its other-income layer, with no share", () => {
    const model = drawn(plan({ ...FLAT, currentBalance: NEED }));
    expect(model.firstShortAge).toBe(61);
    expect(model.partialShare).toBeNull();
    expect(model.bowls[1]).toEqual({ age: 61, fill: 0.15, other: 0.15, savings: 0, state: "otherOnly" });
    expect(model.summary).toEqual([
      "FULL 1 năm, tuổi 60.",
      "OTHER-ONLY 24 năm, từ tuổi 61 đến 84: 15%.",
    ]);
    // …and as EMPTY, dashed, when there is no other income at all.
    const bare = drawn(plan({ ...FLAT, currentBalance: 240_000_000, otherAnnualIncome: 0 }));
    expect(bare.bowls[1]).toEqual({ age: 61, fill: 0, other: 0, savings: 0, state: "empty" });
    expect(bare.summary).toEqual(["FULL 1 năm, tuổi 60.", "EMPTY 24 năm, từ tuổi 61 đến 84."]);
  });

  it("keeps a real last-year shortfall partial, and guards the rounding", () => {
    const at = (paidLastYear: number) =>
      drawn(plan({ ...FLAT, currentBalance: 24 * NEED + paidLastYear }));
    const half = at(100_000_000);
    expect(half.kind).toBe("short");
    expect([half.counts.full, half.counts.partial]).toEqual([24, 1]);
    expect(at(200_000).summary[1]).toBe("PARTIAL tuổi 84: dưới 1%.");
    expect(at(203_900_000).summary[1]).toBe("PARTIAL tuổi 84: hơn 99%.");
  });

  it("draws nothing without a plan", () => {
    expect(retirementGranaryModel(null, LABELS)).toEqual({ kind: "unavailable" });
  });
});

describe("the granary on a grid of plans", () => {
  const pick = <T,>(values: readonly T[], i: number, prime: number) =>
    values[(i * prime) % values.length];

  it("keeps the ledger's shape and every identity on 300 plans", () => {
    let drawnCount = 0;
    for (let i = 0; i < 300; i += 1) {
      const currentAge = pick([20, 35, 50, 60, 70], i, 7);
      const retirementAge = currentAge + pick([0, 1, 10, 25], i, 11);
      const endAge = Math.min(120, retirementAge + pick([1, 5, 25, 40], i, 13));
      const p = resolveLongTermPlan({
        currentAge,
        retirementAge,
        endAge,
        currentBalance: pick([0, 1e8, 5e8, 4e9], i, 17),
        annualContribution: pick([0, 6e7, 1.2e8], i, 19),
        contributionGrowthPercent: pick([0, 5, -3], i, 23),
        returnBeforePercent: pick([-10, 0, 5, 8, 12], i, 29),
        returnAfterPercent: pick([-10, 0, 3, 5, 12], i, 31),
        inflationPercent: pick([-2, 0, 2, 4], i, 37),
        desiredAnnualSpending: pick([0, 1.2e8, 2.4e8, 6e8], i, 41),
        otherAnnualIncome: pick([0, 3.6e7, 2.4e8], i, 43),
      });
      if (p === null) continue;
      drawnCount += 1;
      const model = drawn(p);
      const result = p.asEntered;
      const rows = result.years.filter((row) => !row.accumulating);
      const span = p.input.endAge - p.input.retirementAge;

      expect(model.bowls.length).toBe(span);
      let previous = 1;
      for (const [index, bowl] of model.bowls.entries()) {
        expect(bowl.fill).toBeGreaterThanOrEqual(0);
        expect(bowl.fill).toBeLessThanOrEqual(1);
        expect(bowl.fill).toBeLessThanOrEqual(previous);
        previous = bowl.fill;
        const row = rows[index];
        if (bowl.state === "empty" || bowl.state === "otherOnly") expect(row.withdrawal).toBe(0);
        if (bowl.state === "partial") expect(row.withdrawal).toBe(result.lastWithdrawalPaid);
        if (bowl.state !== "covered") {
          // The two layers add up to the bowl: other income, then savings.
          expect(bowl.fill).toBeCloseTo(bowl.other + (1 - bowl.other) * bowl.savings, 12);
          expect(bowl.other).toBeLessThan(1);
        }
      }

      const sum = model.bowls.reduce((total, bowl) => total + bowl.fill, 0);
      const savings = model.bowls.reduce((total, bowl) => total + bowl.savings, 0);
      if (model.kind === "short") {
        expect(savings).toBeCloseTo(result.yearsFunded + (model.partialShare ?? 0), 9);
        expect(model.firstShortAge).toBe(result.depletionAge);
      } else {
        expect(sum).toBe(span);
      }

      for (const text of [...model.summary, model.unit]) {
        expect(text).not.toMatch(/\{[a-zA-Z]+\}/);
        expect(text).not.toMatch(/(^|\D)0 năm/);
      }
      for (const match of model.summary.join(" ").matchAll(/từ tuổi (\d+) đến (\d+)/g)) {
        expect(Number(match[1])).toBeLessThan(Number(match[2]));
      }
      const guarded = /dưới 1%|hơn 99%/.test(model.summary.join(" "));
      if (guarded) {
        expect(model.partialShare).not.toBeNull();
        expect(model.partialShare!).toBeGreaterThan(0);
        expect(model.partialShare!).toBeLessThan(1);
      }
    }
    expect(drawnCount).toBeGreaterThanOrEqual(200);
  });
});

describe("what one change does to the granary", () => {
  it("counts short years as the plan's own yearsShort, covered years met", async () => {
    const { shortYears } = await import("./retirement-granary-chart");
    const p = plan();
    expect(shortYears(drawn(p))).toBe(p.asEntered.yearsShort);
    expect(shortYears(drawn(plan({ otherAnnualIncome: 240_000_000 })))).toBe(0);
    expect(shortYears({ kind: "unavailable" })).toBeNull();
  });

  it("names the bowls that changed, and nothing else", async () => {
    const { granaryChange } = await import("./retirement-granary-chart");
    const before = drawn(plan());
    const after = drawn(plan({ annualContribution: 72_000_000 }));
    const change = granaryChange(before, after)!;
    expect(change.shortBefore).toBe(3);
    expect(change.shortAfter).toBe(0);
    // The partial year and the two empty ones fill; the 22 full ones do not move.
    expect(change.changedAges).toEqual([82, 83, 84]);
    expect(granaryChange(before, before)!.changedAges).toEqual([]);
    expect(granaryChange(before, { kind: "unavailable" })).toBeNull();
  });
});
