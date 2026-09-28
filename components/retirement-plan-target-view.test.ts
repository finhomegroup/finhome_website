// The retirement hero's "how much should I have": the engine's required
// capital, the share the plan reaches, and one suggestion that funds it.
import { describe, expect, it } from "vitest";
import { readRoutePlan } from "@/components/retirement-plan-read";
import {
  heldTrial,
  sharedMoney,
  suggestDown,
  suggestUp,
  targetView,
  type TargetView,
} from "@/components/retirement-plan-target-view";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import { resolveLongTermPlan } from "@/lib/calc/long-term-plan";
import { formatMoney, PLACEHOLDER } from "@/lib/calc/number";
import { retirementStatus } from "@/lib/calc/retirement-status";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { RETIREMENT_PLAN as C } from "@/content/calculators/retirement-plan";

const T = C.hero.target;

/** The plan and the status the page resolves for a patched scenario. */
function at(patch: Record<string, string> = {}) {
  const values = { ...C.defaults, ...patch } as Record<string, string>;
  const read = readRoutePlan(values);
  const plan = read.input === null ? null : resolveLongTermPlan(read.input);
  return { values, plan, status: retirementStatus(plan), view: targetView(plan, retirementStatus(plan)) };
}

/** A row's figure back in đồng: "1.152 triệu", "khoảng 766 triệu", "400.000 ₫", "123,4 tỷ". */
function parseShown(text: string): number {
  const match = /([\d.]+(?:,\d+)?) (triệu|tỷ|₫)$/.exec(text.replace(/^khoảng /, ""));
  if (match === null) throw new Error(`not a figure: ${text}`);
  const value = Number(match[1].replace(/\./g, "").replace(",", "."));
  return value * (match[2] === "tỷ" ? 1e9 : match[2] === "triệu" ? 1e6 : 1);
}

/** Every string a target view shows. */
const shownStrings = (view: TargetView) =>
  [
    view.basis,
    view.pho,
    view.progress,
    view.suggestion,
    ...view.rows.flatMap((row) => [row.label, row.value]),
  ].filter((text): text is string => text !== null);

describe("suggested amounts", () => {
  it("round to 100.000 ₫, up for what goes in and down for what comes out", () => {
    expect(suggestUp(27_369_769.9)).toBe(27_400_000);
    expect(suggestUp(27_400_000)).toBe(27_400_000);
    expect(suggestDown(6_434_192.3)).toBe(6_400_000);
    expect(suggestDown(99_999)).toBe(0);
  });
});

describe("sharedMoney", () => {
  it("reads figures set side by side at one precision, set by the largest", () => {
    // One "+1 tuổi" from the defaults: rounded alone, 1,152 tỷ read "1,2 tỷ"
    // beside "766,1 triệu", and the rows stopped adding up.
    expect(sharedMoney([1_152_000_000, 766_100_000, 385_900_000])).toEqual([
      "1.152 triệu",
      "766 triệu",
      "386 triệu",
    ]);
    expect(sharedMoney([743_800_000, 730_300_000, 13_500_000])).toEqual([
      "743,8 triệu",
      "730,3 triệu",
      "13,5 triệu",
    ]);
    expect(sharedMoney([8_000_000, 4_000_000])).toEqual(["8 triệu", "4 triệu"]);
    expect(sharedMoney([950_000, 400_000])).toEqual(["950.000 ₫", "400.000 ₫"]);
    expect(sharedMoney([123_400_000_000, 1_000_000_000])).toEqual(["123,4 tỷ", "1 tỷ"]);
  });

  it("keeps 0 exact, a figure too small for the precision its own reading, and prints nothing absurd", () => {
    expect(sharedMoney([1_214_000_000, 0])).toEqual(["1.214 triệu", T.zero]);
    expect(sharedMoney([1_200_000_000, 400_000])).toEqual(["1.200 triệu", "400.000 ₫"]);
    expect(sharedMoney([Number.NaN, Infinity, 1e20, 5_000_000])).toEqual([
      PLACEHOLDER,
      PLACEHOLDER,
      PLACEHOLDER,
      "5 triệu",
    ]);
  });
});

describe("heldTrial", () => {
  const trial = { key: "annualContribution" as const, before: "15.000.000", after: "27.600.000" };

  it("holds while the field reads the tried value, and is spent once it does not", () => {
    expect(heldTrial(trial, { annualContribution: "27.600.000" })).toBe(trial);
    // Moved off the tried value: spent. The hero drops it then, so a later
    // return to 27.600.000 brings no undo that would skip 15.600.000.
    expect(heldTrial(trial, { annualContribution: "15.600.000" })).toBeNull();
    expect(heldTrial(null, { annualContribution: "27.600.000" })).toBeNull();
  });
});

describe("targetView", () => {
  it("states the engine's required capital, the capital reached and the gap, on the defaults", () => {
    const { plan, view } = at();
    const { gap, input } = plan!;
    expect(view.kind).toBe("short");
    // Cần có · Dự kiến có · Còn thiếu — all three the engine's, in today's
    // money, at one precision.
    const [need, reached, short] = sharedMoney([
      gap.realBalanceRequired,
      gap.realBalanceReached,
      gap.realShortfall,
    ]);
    expect(view.rows).toEqual([
      { label: fill(T.rows.required, { age: input.retirementAge }), value: need },
      { label: T.rows.reached, value: fill(T.about, { amount: reached }) },
      { label: T.rows.short, value: fill(T.about, { amount: short }) },
    ]);
    // 4 triệu a month from the savings for 25 years at a real return of 0
    // (4,5% after retirement, 4,5% inflation): 1.200 triệu. 1.200 − 730 = 470.
    expect(view.rows.map((row) => row.value)).toEqual([
      "1.200 triệu",
      "khoảng 730 triệu",
      "khoảng 470 triệu",
    ]);
    // What the capital pays for, in the reader's months: 4 triệu from other
    // income, 4 triệu from the savings — and no second price basis beside it.
    expect(view.basis).toContain(`đến tuổi ${input.endAge}`);
    expect(view.basis).toContain("4 triệu từ thu nhập khác, 4 triệu rút từ khoản dành dụm");
    expect(view.basis).not.toContain(
      compactMoney(plan!.asEntered.requiredBalanceAtRetirement, L.money),
    );
    const percent = Math.floor(gap.coveragePercent!);
    expect(view.share).toBe(percent);
    expect(view.heaped).toBe(false);
    // "Theo giá hôm nay" by one bowl of phở, at the engine's own price rise:
    // 1,045^25 = 3,0054, so 50.000 ₫ is about 150.000 ₫ at 60.
    const factor = plan!.asEntered.requiredBalanceAtRetirement / plan!.asEntered.requiredRealBalanceAtRetirement;
    expect(factor).toBeCloseTo(1.045 ** 25, 9);
    expect(view.pho).toBe(fill(T.pho, { today: "50.000 ₫", then: "150.000 ₫", age: 60 }));
    expect(view.progress).toBe(fill(T.progress, { percent }));
  });

  it("adds up exactly as read — the last row IS Cần có − Dự kiến có — across lever and rate states", () => {
    let checked = 0;
    // The defaults' rates make the requirement a whole number of triệu; other
    // rates do not, and rounding the gap on its own then read 1 triệu off in
    // one state in five.
    const rateSets: Record<string, string>[] = [
      {},
      { returnAfterPercent: "3", inflationPercent: "4" },
      { returnAfterPercent: "6,5", inflationPercent: "3" },
    ];
    for (const rates of rateSets) {
      for (const saving of [0, 12, 24, 48]) {
        for (const age of [50, 55, 60, 65, 70]) {
          for (const spend of [4, 8, 12, 25]) {
            const { plan, view } = at({
              ...rates,
              annualContribution: formatMoney(saving * 1e6),
              retirementAge: String(age),
              desiredMonthlySpending: formatMoney(spend * 1e6),
            });
            if (view.kind !== "short" && view.kind !== "funded") continue;
            const [need, reached, rest] = view.rows.map((row) => parseShown(row.value));
            const shownGap = view.rows[2].label === T.rows.surplus ? reached - need : need - reached;
            if (shownGap === 0) {
              // Rounding hid a real gap: it keeps its own, finer reading.
              expect(rest, JSON.stringify(view.rows)).toBeCloseTo(plan!.gap.realShortfall || rest, -3);
            } else {
              expect(rest, JSON.stringify(view.rows)).toBeCloseTo(shownGap, 0);
            }
            checked += 1;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(150);
  });

  it("splits the month exactly as the engine does: the need is spend − other income", () => {
    // `retirement.ts` withdraws max(0, spend − other) a year (the inflated
    // form, line 311) and prices the requirement from the same difference
    // (line 398). On the defaults the real return after retirement is 0
    // (4,5% vs 4,5%), so the annuity is the 25 years themselves: 4 triệu a
    // month × 12 × 25 = the required 1.200 triệu. The split the lead-in shows
    // restates that relation; it adds none of its own.
    const { plan, view } = at();
    const { input, gap } = plan!;
    expect(gap.realBalanceRequired).toBeCloseTo(
      (input.desiredAnnualSpending - input.otherAnnualIncome) * 25,
      0,
    );
    expect(view.basis).toContain("4 triệu rút từ khoản dành dụm");
  });

  it("prints no broken figure at the edges the fields allow", () => {
    const edges: Record<string, string>[] = [
      { inflationPercent: "-90" },
      { inflationPercent: "-30" },
      { inflationPercent: "100", currentAge: "20", retirementAge: "60", endAge: "119" },
      { currentBalance: "9.000.000.000.000.000" },
      // Other income a hair under the spend: nearly nothing is required.
      { otherMonthlyIncome: "7.990.000" },
    ];
    for (const patch of edges) {
      const { view } = at(patch);
      for (const text of shownStrings(view)) {
        expect(text, JSON.stringify(patch)).not.toMatch(/e\+|NaN|Infinity|— ₫|— triệu|— tỷ|khoảng —/);
        // A share past 999% is "hơn 10 lần", never a percent that outgrows its line.
        expect(text, JSON.stringify(patch)).not.toMatch(/\d{4,}%/);
      }
    }
    expect(at({ otherMonthlyIncome: "7.990.000" }).view.progress).toBe(T.progressMany);
  });

  it("suggests the engine's contribution as a whole monthly figure, and applying it funds the plan", () => {
    const { plan, view } = at();
    const solved = plan!.contribution.annualContribution!;
    expect(view.apply?.key).toBe("annualContribution");
    // 27.369.770 a year is 2.280.814 a month: rounded up to 2,3 triệu, × 12.
    expect(view.apply?.next).toBe("27.600.000");
    expect(Number(view.apply!.next.replace(/\./g, ""))).toBeGreaterThanOrEqual(solved);
    expect(view.apply!.name.startsWith(T.apply)).toBe(true);
    // Yearly first — the engine credits the saving at the start of the year —
    // with the month as a budget equivalence, said "≈".
    expect(view.suggestion).toContain("để dành 27,6 triệu năm đầu (≈ 2,3 triệu/tháng)");
    expect(view.suggestion).not.toMatch(/mỗi tháng để dành/);
    expect(T.timing).toContain("góp cả năm vào đầu năm");
    // Funded with room, never on the boundary: the rounding is toward safety.
    expect(at({ annualContribution: view.apply!.next }).status.kind).toBe("funded");
  });

  it("falls back to retiring later, then to a lower pension, as the engine's remedies allow", () => {
    // Retiring today: no year left to save in, so the age is the suggestion.
    const later = at({ currentAge: "60", retirementAge: "60", currentBalance: "1.000.000.000" });
    expect(later.view.apply?.key).toBe("retirementAge");
    // WCAG 2.5.3: every fallback's name starts with the button's visible text.
    expect(later.view.apply!.name.startsWith(T.apply)).toBe(true);
    expect(later.status.kind).toBe("depleted");
    const age = later.view.apply!.next;
    expect(Number(age)).toBeGreaterThan(60);
    expect(at({ ...later.values, retirementAge: age }).status.kind).not.toBe("depleted");

    // No funded age within reach either: the pension the capital supports.
    const less = at({ currentAge: "55", retirementAge: "55", currentBalance: "500.000.000" });
    expect(less.view.apply?.key).toBe("desiredMonthlySpending");
    expect(less.view.apply!.name.startsWith(T.apply)).toBe(true);
    const monthly = less.view.apply!.next;
    expect(Number(monthly.replace(/\./g, "")) % 100_000).toBe(0);
    expect(at({ ...less.values, desiredMonthlySpending: monthly }).status.kind).toBe("funded");
  });

  it("says a funded plan is enough, with its surplus, and offers no press", () => {
    const { plan, view } = at({ annualContribution: "51.000.000" });
    expect(view.kind).toBe("funded");
    expect(view.share).toBe(100);
    // More than required: the basket heaps over its rim.
    expect(view.heaped).toBe(true);
    expect(view.apply).toBeNull();
    expect(view.settledLabel).toBe(T.settled.funded);
    expect(view.progress).toBe(fill(T.progress, { percent: Math.floor(plan!.gap.coveragePercent!) }));
    // Nothing missing: the last row says what is spare instead, at the rows'
    // one precision.
    const { gap } = plan!;
    const [, , spare] = sharedMoney([
      gap.realBalanceRequired,
      gap.realBalanceReached,
      gap.realBalanceReached - gap.realBalanceRequired,
    ]);
    expect(view.rows[2]).toEqual({ label: T.rows.surplus, value: fill(T.about, { amount: spare }) });
  });

  it("says a boundary plan has nothing to spare", () => {
    const { status, view } = at({
      currentAge: "60",
      retirementAge: "60",
      currentBalance: "4.800.000.000",
      annualContribution: "0",
      contributionGrowthPercent: "0",
      returnBeforePercent: "4",
      returnAfterPercent: "4",
      inflationPercent: "4",
      desiredMonthlySpending: "20.000.000",
      otherMonthlyIncome: "4.000.000",
    });
    expect(status.kind).toBe("exactBoundary");
    expect(view.progress).toBe(T.progressBoundary);
    expect(view.heaped).toBe(false);
    // Nothing missing and nothing spare, whatever đồng the two figures differ by.
    expect(view.rows[2]).toEqual({ label: T.rows.short, value: T.zero });
    // Retiring today: the price is today's.
    expect(view.pho).toBe(fill(T.phoToday, { today: "50.000 ₫" }));
    expect(view.apply).toBeNull();
  });

  it("draws no bar when nothing is required, and never calls that 100%", () => {
    const pension = at({ otherMonthlyIncome: "20.000.000" });
    expect(pension.view.kind).toBe("noNeed");
    expect(pension.view.share).toBeNull();
    expect(pension.view.rows[0].value).toBe(T.zero);
    // None of the savings is needed, so all of it is spare.
    expect(pension.view.rows[2]).toEqual({
      label: T.rows.surplus,
      value: pension.view.rows[1].value,
    });
    expect(pension.view.basis).toContain("20 triệu");
    const nothing = at({ desiredMonthlySpending: "0" });
    expect(nothing.view.basis).toBe(T.noNeedSpend);
  });

  it("follows the inflation field in the phở line, and says nothing it cannot read", () => {
    // Prices that do not move, or barely, or fall — the field takes all
    // three — are said so.
    expect(at({ inflationPercent: "0" }).view.pho).toBe(
      fill(T.phoSame, { today: "50.000 ₫", then: "50.000 ₫", age: 60 }),
    );
    // 1,0001^25 = 1,0025: 50.125 ₫, shown to the 1.000 ₫ as 50.000 ₫.
    expect(at({ inflationPercent: "0,01" }).view.pho).toBe(
      fill(T.phoFlat, { today: "50.000 ₫", then: "50.000 ₫", age: 60 }),
    );
    // 0,99^25 = 0,7778: 50.000 ₫ is about 39.000 ₫ at 60.
    expect(at({ inflationPercent: "-1" }).view.pho).toBe(
      fill(T.phoDown, { today: "50.000 ₫", then: "39.000 ₫", age: 60 }),
    );
    // Nothing required and nothing saved: no reading to take a price rise from.
    const blank = at({ otherMonthlyIncome: "20.000.000", currentBalance: "0", annualContribution: "0" });
    expect(blank.view.kind).toBe("noNeed");
    expect(blank.view.pho).toBeNull();
  });

  it("holds no figure while a field is unusable", () => {
    const { view } = at({ currentAge: "" });
    expect(view.kind).toBe("unavailable");
    expect(view.share).toBeNull();
    expect(view.pho).toBeNull();
    expect(view.apply).toBeNull();
    expect(view.basis).toBe(T.unavailable);
    // The rows stay, so the panel keeps its height, holding placeholders.
    expect(view.rows.map((row) => row.label)).toEqual([
      T.rows.requiredUnknown,
      T.rows.reached,
      T.rows.short,
    ]);
    expect(new Set(view.rows.map((row) => row.value))).toEqual(new Set([PLACEHOLDER]));
  });
});
