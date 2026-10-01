/**
 * The F5 adapter against the engine: the ranking guard and the three lanes.
 *
 * Every comparison here is `compareLoans` itself. Fixtures: the two shipped
 * perspectives, horizon 0, a horizon past one maturity, unknown fees on and
 * off, an inactive third column, invalid B beside valid C, exact ties, a
 * winner that changes with the horizon, and a sole option.
 */
import { describe, expect, it } from "vitest";
import {
  compareGuard,
  compareLimit,
  compareLanesView,
  compareTexts,
  horizonMax,
  horizonStep,
  lowestFirstPayment,
  namesOf,
  type CompareColumnFacts,
  type CompareLimitColumn,
} from "@/components/loan-compare-learning";
import { LOAN_COMPARE_LEARNING as L } from "@/content/calculators/loan-compare-learning";
import { fill } from "@/lib/calc/charts/labels";
import { compareLoans, type LoanOption } from "@/lib/calc/loan-compare";

const LABELS = ["Phương án A", "Phương án B", "Phương án C"];
const A: LoanOption = { annualRatePercent: 8.5, termMonths: 240 };
const B: LoanOption = { annualRatePercent: 9.2, termMonths: 240 };
const UNUSED: LoanOption = { annualRatePercent: -1, termMonths: 0 };

const facts = (patch: Partial<CompareColumnFacts> = {}): CompareColumnFacts => ({
  inUse: [true, true, false],
  malformed: [false, false, false],
  unknownFees: [false, false, false],
  ...patch,
});
const run = (options: LoanOption[], horizonMonths: number, f: CompareColumnFacts = facts()) => {
  const result = compareLoans({ amount: 2e9, options, horizonMonths });
  const guard = compareGuard(result, f);
  return { result, guard, view: compareLanesView(result, guard, f, LABELS) };
};

describe("the shipped offers: a definite, fee-complete ranking", () => {
  const { result, guard, view } = run([A, B, UNUSED], 60);

  it("ranks A, names the spread, and changes no winner", () => {
    expect(guard).toMatchObject({ ranked: true, reason: null, best: [0], allTied: false, winnerChanges: false });
    expect(view!.verdict.tone).toBe("best");
    expect(view!.verdict.text).toContain("Phương án A");
    expect(result!.bestIndex).toBe(0);
  });

  it("draws one lane per offer IN USE, positionally, each on its named scale", () => {
    expect(view!.lanes.map((lane) => lane.index)).toEqual([0, 1]);
    // Payments: the larger instalment is 100%.
    const [a, b] = view!.lanes;
    expect(b.firstPercent).toBeCloseTo(100, 9);
    expect(a.firstPercent).toBeCloseTo((result!.rows[0]!.monthlyPayment / result!.rows[1]!.monthlyPayment) * 100, 9);
    expect(a.reset).toBeNull();
    expect(a.structure).toBe(L.structureConstant);
    // Cost: interest + upfront + exit, of the largest horizon cost.
    if (!a.cost?.known || !b.cost?.known) throw new Error("costs known");
    expect(b.cost.parts.reduce((sum, p) => sum + p.percent, 0)).toBeCloseTo(100, 9);
    // Balance: the amount lent is the scale; not interest, not omitted.
    expect(a.balancePercent).toBeCloseTo((result!.rows[0]!.horizonBalance / 2e9) * 100, 9);
    expect(a.paidOffMonth).toBeNull();
  });
});

describe("the fixed/floating perspective: labels follow the rate structure", () => {
  it("a promotional side shows its reset month and payment", () => {
    const promo: LoanOption = { annualRatePercent: 11, termMonths: 240, promoMonths: 12, promoRatePercent: 7.5 };
    const { result, view } = run([{ annualRatePercent: 9.5, termMonths: 240 }, promo, UNUSED], 60);
    const lane = view!.lanes[1];
    expect(lane.structure).toBe(fill(L.structurePhased, { month: 13 }));
    expect(lane.reset).toMatchObject({ month: 13 });
    expect(result!.rows[1]!.resetPayment).toBeGreaterThan(result!.rows[1]!.monthlyPayment);
    expect(view!.lanes[0].structure).toBe(L.structureConstant);
  });
});

describe("horizon 0 and a horizon past maturity", () => {
  it("at month 0 with no fees nothing has been paid: a tie, never A by default", () => {
    const { guard, view } = run([A, B, UNUSED], 0);
    expect(guard.best).toEqual([0, 1]);
    expect(guard.allTied).toBe(true);
    expect(view!.verdict).toEqual({ tone: "tie", text: fill(L.verdictTiedAll, { horizon: 0, cost: "0 ₫" }) });
    for (const lane of view!.lanes) expect(lane.balancePercent).toBeCloseTo(100, 9);
  });

  it("past a shorter loan's maturity it is labelled paid off, with nothing still owed", () => {
    const short: LoanOption = { annualRatePercent: 8.5, termMonths: 120 };
    const { result, view } = run([short, B, UNUSED], 180);
    expect(result!.rows[0]!.horizonMonths).toBe(120);
    expect(view!.lanes[0].paidOffMonth).toBe(120);
    expect(view!.lanes[0].balancePercent).toBe(0);
    expect(view!.lanes[1].paidOffMonth).toBeNull();
    expect(view!.sliderMax).toBe(264);
  });
});

describe("unknown fees stop the ranking, and only while in use", () => {
  it("A marked unknown: no winner, its totals withheld, its payments kept", () => {
    const f = facts({ unknownFees: [true, false, false] });
    const { guard, view } = run([{ ...A, feePercent: 1 }, B, UNUSED], 60, f);
    expect(guard).toMatchObject({ ranked: false, reason: "unknownFees", blocking: [0], best: [], winnerChanges: false });
    expect(view!.verdict).toEqual({
      tone: "blocked",
      text: fill(L.verdictUnknown, { options: "Phương án A" }),
    });
    const lane = view!.lanes[0];
    expect(lane.state).toBe("feesUnknown");
    expect(lane.cost).toMatchObject({ known: false });
    expect(lane.fullTermText).toBeNull();
    expect(lane.firstText).not.toBeNull();
    expect(lane.balanceText).not.toBeNull();
  });

  it("restored: unticking gives the ranking back", () => {
    expect(run([{ ...A, feePercent: 1 }, B, UNUSED], 60).guard.ranked).toBe(true);
  });

  it("an INACTIVE third column marked unknown blocks nothing", () => {
    const { guard, view } = run([A, B, UNUSED], 60, facts({ unknownFees: [false, false, true] }));
    expect(guard.ranked).toBe(true);
    expect(guard.feesUnknown).toEqual([false, false, false]);
    expect(view!.lanes).toHaveLength(2);
  });
});

describe("invalid B beside valid C, and an unused B", () => {
  it("invalid B in use: no ranking among A and C, B keeps its position", () => {
    const f = facts({ inUse: [true, true, true], malformed: [false, true, false] });
    const { result, guard, view } = run([A, UNUSED, B], 60, f);
    expect(result).not.toBeNull();
    expect(guard).toMatchObject({ ranked: false, reason: "invalid", blocking: [1] });
    expect(view!.lanes.map((lane) => [lane.index, lane.state])).toEqual([
      [0, "ok"],
      [1, "invalid"],
      [2, "ok"],
    ]);
    expect(view!.verdict.text).toBe(fill(L.verdictInvalid, { options: "Phương án B" }));
  });

  it("an EMPTY B is not in use: A and C are ranked, under their own letters", () => {
    const f = facts({ inUse: [true, false, true] });
    const { guard, view } = run([B, UNUSED, A], 60, f);
    expect(guard.ranked).toBe(true);
    expect(guard.best).toEqual([2]);
    expect(view!.verdict.text).toContain("Phương án C");
    expect(view!.lanes.map((lane) => lane.index)).toEqual([0, 2]);
  });
});

describe("ties and winner changes", () => {
  it("identical offers are tied, never 'A is cheaper'", () => {
    const { guard, view } = run([A, A, UNUSED], 60);
    expect(guard.best).toEqual([0, 1]);
    expect(guard.allTied).toBe(true);
    expect(view!.verdict.tone).toBe("tie");
    expect(view!.verdict.text).not.toMatch(/tốn ít nhất/);
  });

  it("two tied cheapest and a dearer third: both named, with the spread", () => {
    const f = facts({ inUse: [true, true, true] });
    const { guard, view } = run([A, A, B], 60, f);
    expect(guard.best).toEqual([0, 1]);
    expect(guard.allTied).toBe(false);
    expect(view!.verdict.text).toContain(namesOf([0, 1], LABELS));
  });

  it("a promotion cheaper early and dearer over the term changes the winner", () => {
    const promo: LoanOption = { annualRatePercent: 11, termMonths: 240, promoMonths: 24, promoRatePercent: 6.5 };
    const { guard } = run([promo, { annualRatePercent: 9, termMonths: 240 }, UNUSED], 24);
    expect(guard.best).toEqual([0]);
    expect(guard.bestFullTerm).toEqual([1]);
    expect(guard.winnerChanges).toBe(true);
  });

  it("a sole option is not a comparison and has no winner", () => {
    const { result, guard, view } = run([A, UNUSED, UNUSED], 60, facts({ inUse: [true, false, false] }));
    expect(result).toBeNull();
    expect(guard).toMatchObject({ ranked: false, reason: "tooFew", best: [] });
    expect(view).toBeNull();
  });
});

describe("the horizon control", () => {
  it("steps repeat, and clamp to 0 and to past the longest term", () => {
    const result = compareLoans({ amount: 2e9, options: [A, B], horizonMonths: 60 })!;
    const max = horizonMax(result, 60);
    expect(max).toBe(264);
    expect(horizonStep(horizonStep(60, 12, max), 12, max)).toBe(84);
    expect(horizonStep(6, -12, max)).toBe(0);
    expect(horizonStep(260, 12, max)).toBe(264);
    // A typed horizon above the usual range stays reachable.
    expect(horizonMax(result, 600)).toBe(600);
  });
});

describe("independent review repairs (2026-09-29)", () => {
  it("the unknown-fee narrative claims no certainty, and the scale is a drawing scale", () => {
    const { view } = run([{ ...A, feePercent: 1 }, B, UNUSED], 60, facts({ unknownFees: [true, false, false] }));
    const lane = view!.lanes[0];
    if (lane.cost === null || lane.cost.known) throw new Error("unknown cost expected");
    const text = fill(L.costUnknown, { interest: lane.cost.interestText });
    expect(text).toContain("theo kịch bản đã nhập");
    expect(text).not.toMatch(/chắc chắn/);
    expect(JSON.stringify(L)).not.toMatch(/chắc chắn/);
    expect(view!.costScale).toContain("không phải chi phí lớn nhất thật");
    expect(view!.costScale).not.toMatch(/chi phí lớn nhất là/);
    // Every offer known: the scale is still named as a drawing scale.
    expect(run([A, B, UNUSED], 60).view!.costScale).toMatch(/^Thang vẽ chung/);
  });

  it("the two shipped debts read differently, and exact ties may read alike", () => {
    const { result, view } = run([A, B, UNUSED], 60);
    const [a, b] = view!.lanes;
    expect(result!.rows[0]!.horizonBalance).not.toBeCloseTo(result!.rows[1]!.horizonBalance, 0);
    expect(a.balanceText).not.toBe(b.balanceText);
    expect(a.balanceText).toMatch(/^\d{1,3}(\.\d{3})*,\d triệu$/);
    expect(a.balanceText).not.toMatch(/tỷ/);
    // Figures that would still clash at one decimal fall back to full đồng.
    expect(compareTexts([1_816_300_000, 1_816_320_000])).toEqual(["1.816.300.000 ₫", "1.816.320.000 ₫"]);
    expect(compareTexts([1_816_300_000, 1_816_300_000])).toEqual(["1.816,3 triệu", "1.816,3 triệu"]);
    // Costs follow the same rule.
    if (!a.cost?.known || !b.cost?.known) throw new Error("known costs");
    expect(a.cost.total).not.toBe(b.cost.total);
  });

  it("finds tied opening instalments, positionally, for the payment summary", () => {
    const tied = compareLoans({ amount: 2e9, options: [A, A, UNUSED], horizonMonths: 60 });
    expect(lowestFirstPayment(tied, [true, true, false])?.indexes).toEqual([0, 1]);
    const apart = compareLoans({ amount: 2e9, options: [B, A, UNUSED], horizonMonths: 60 });
    expect(lowestFirstPayment(apart, [true, true, false])?.indexes).toEqual([1]);
    expect(lowestFirstPayment(null, [true, true, false])).toBeNull();
  });

  it("the lesson qualifies the longer-term claim", () => {
    expect(L.paymentLesson).toContain("cùng số tiền và lãi suất dương");
    expect(L.paymentLesson).toContain("có thể");
  });
});

describe("the whole-tool limit (release repair, 2026-10-01)", () => {
  const typed = (option: LoanOption): CompareLimitColumn["typed"] => ({
    rate: option.annualRatePercent,
    termMonths: option.termMonths,
    fee: option.feePercent ?? null,
    flatFee: option.upfrontFee ?? null,
    exitFee: option.exitFee ?? null,
    promoRate: option.promoRatePercent ?? null,
  });
  /** As the page asks: the comparison's rows, or a probe per offer when it was refused. */
  const limitOf = (amount: number, options: LoanOption[], horizonMonths = 60) => {
    const result = compareLoans({ amount, options, horizonMonths });
    const probe = (option: LoanOption) =>
      compareLoans({ amount, options: [option, option], horizonMonths })?.rows[0] ?? null;
    return compareLimit({
      amount,
      columns: options.map((option, index) => ({
        complete: true,
        row: result !== null ? (result.rows[index] ?? null) : probe(option),
        typed: typed(option),
      })),
      spreads: result === null ? [] : [result.spread, result.fullTermSpread],
    });
  };

  it("is null for the shipped comparison and for an unreadable amount", () => {
    expect(limitOf(2e9, [A, B])).toBeNull();
    expect(compareLimit({ amount: null, columns: [] })).toBeNull();
  });

  it("a 10^19 ₫ amount: display, naming the amount only", () => {
    expect(limitOf(1e19, [A, B])).toEqual({ kind: "display", columns: [0, 1], fields: [{ column: null, key: "amount" }] });
  });

  it("equal 10^19 % fees: display naming both fee boxes, never a placeholder tie", () => {
    const fee = 1e19;
    expect(limitOf(2e9, [{ ...A, feePercent: fee }, { ...A, feePercent: fee }])).toEqual({
      kind: "display",
      columns: [0, 1],
      fields: [
        { column: 0, key: "fee" },
        { column: 1, key: "fee" },
      ],
    });
  });

  it("a 10^308 % fee: a model limit on that offer alone", () => {
    expect(limitOf(2e9, [{ ...A, feePercent: 1e308 }, B])).toEqual({
      kind: "model",
      columns: [0],
      fields: [{ column: 0, key: "fee" }],
    });
  });

  it("a rate the engine cannot schedule: the comparison is refused, and the probe names it", () => {
    const options = [{ ...A, annualRatePercent: 1e308 }, B];
    expect(compareLoans({ amount: 2e9, options, horizonMonths: 60 })).toBeNull();
    expect(limitOf(2e9, options)).toEqual({ kind: "model", columns: [0], fields: [{ column: 0, key: "rate" }] });
  });

  it("a figure derived past 10^18 from printable boxes: affected offers, neutral review", () => {
    const limit = limitOf(9.9e17, [A, B]);
    expect(limit?.kind).toBe("display");
    expect(limit?.fields).toEqual([]);
    expect(limit?.columns).toEqual([0, 1]);
  });

  it("never reads an incomplete or unused column", () => {
    const result = compareLoans({ amount: 2e9, options: [A, B, UNUSED], horizonMonths: 60 })!;
    expect(
      compareLimit({
        amount: 2e9,
        columns: [0, 1, 2].map((index) => ({
          complete: index < 2,
          row: result.rows[index] ?? null,
          typed: { rate: null, termMonths: null, fee: null, flatFee: 1e30, exitFee: null, promoRate: null },
        })),
      }),
    ).toBeNull();
  });

  it("the guard never indexes an empty winner, and the lanes do not throw", () => {
    const options = [
      { ...A, feePercent: 1e308 },
      { ...B, feePercent: 1e308 },
    ];
    const { guard, view } = run(options, 60);
    expect(guard.ranked).toBe(false);
    expect(guard.reason).toBe("limit");
    expect(guard.best).toEqual([]);
    expect(guard.winnerChanges).toBe(false);
    expect(view?.verdict).toEqual({ tone: "blocked", text: L.limits.verdict });
  });
});
