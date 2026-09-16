/**
 * The discrete savings projection, against an INDEPENDENT recurrence.
 *
 * `reference()` below is a plain month-by-month loop written here, importing
 * nothing from `finance.ts`, `savings-goal.ts` or the module under test. The
 * module uses the closed form instead, so agreement between the two is real
 * evidence rather than a tautology — and the two accumulate float differently,
 * which is why the assertions carry an absolute đồng bound rather than
 * `toBe`.
 */
import { describe, expect, it } from "vitest";
import {
  MAX_PROJECTION_MONTHS,
  MAX_SERIES_POINTS,
  balanceAfter,
  balanceIsExact,
  fundedSlack,
  projectSavings,
  savingsScheduleFor,
} from "@/lib/calc/savings-schedule";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";

/**
 * First end-of-month cycle whose closing balance covers the target, by
 * recurrence: interest on the opening balance, then the contribution.
 */
function reference(
  initial: number,
  contribution: number,
  monthlyRate: number,
  target: number,
  limit = 2000,
): { month: number; balance: number; contributed: number } | null {
  let balance = initial;
  if (balance >= target) {
    return { month: 0, balance, contributed: initial };
  }
  for (let month = 1; month <= limit; month += 1) {
    balance = balance * (1 + monthlyRate) + contribution;
    if (balance >= target) {
      return { month, balance, contributed: initial + contribution * month };
    }
  }
  return null;
}

const RATE = 0.06 / 12;
const INITIAL = 100_000_000;
const TARGET = 500_000_000;

/** A đồng is the smallest unit in circulation; a hundredth of one is slack. */
const DONG_SLACK = 0.01;

describe("the handoff fixtures", () => {
  it("funds a 8 triệu plan on the 43rd contribution", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(schedule.status).toBe("funded");
    expect(schedule.fundedMonth).toBe(43);
    expect(schedule.months).toBe(43);
    expect(Math.abs(schedule.balance - 506_636_365.7418972)).toBeLessThan(
      DONG_SLACK,
    );
    expect(schedule.totalContributed).toBe(444_000_000);
    expect(Math.abs(schedule.interest - 62_636_365.741897225)).toBeLessThan(
      DONG_SLACK,
    );
  });

  it("funds a 10 triệu plan on the 35th contribution", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 10_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(schedule.status).toBe("funded");
    expect(schedule.fundedMonth).toBe(35);
    expect(Math.abs(schedule.balance - 500_526_469.78027797)).toBeLessThan(
      DONG_SLACK,
    );
    expect(schedule.totalContributed).toBe(450_000_000);
    expect(Math.abs(schedule.interest - 50_526_469.78027797)).toBeLessThan(
      DONG_SLACK,
    );
  });

  it("shortens the plan by 8 WHOLE contributions, not by 7,4 months", () => {
    // The claim C09 makes. The algebraic estimates are 42,367 and 34,958, a
    // 7,409-month difference — which is not a number of contributions anyone
    // can make, and rounding it would understate the saving by a month.
    const base = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    const increased = projectSavings({
      initial: INITIAL,
      contribution: 10_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(base.fundedMonth! - increased.fundedMonth!).toBe(8);

    const algebraicBase = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 8_000_000,
      annualRatePercent: 6,
    })!;
    const algebraicIncreased = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 10_000_000,
      annualRatePercent: 6,
    })!;
    expect(algebraicBase.months).toBeGreaterThan(42.3);
    expect(algebraicBase.months).toBeLessThan(42.4);
    expect(algebraicIncreased.months).toBeGreaterThan(34.9);
    expect(algebraicIncreased.months).toBeLessThan(35.0);
    // The estimate rounds UP to the funded cycle in both cases, and the
    // difference of the estimates is not the difference of the cycles.
    expect(Math.ceil(algebraicBase.months)).toBe(base.fundedMonth);
    expect(Math.ceil(algebraicIncreased.months)).toBe(increased.fundedMonth);
    expect(
      Math.round((algebraicBase.months - algebraicIncreased.months) * 10) / 10,
    ).not.toBe(8);
  });

  it("agrees with the independent recurrence on both fixtures", () => {
    for (const contribution of [8_000_000, 10_000_000]) {
      const schedule = projectSavings({
        initial: INITIAL,
        contribution,
        monthlyRate: RATE,
        target: TARGET,
      });
      const expected = reference(INITIAL, contribution, RATE, TARGET)!;
      expect(schedule.fundedMonth, String(contribution)).toBe(expected.month);
      expect(
        Math.abs(schedule.balance - expected.balance),
        String(contribution),
      ).toBeLessThan(DONG_SLACK);
      expect(schedule.totalContributed, String(contribution)).toBe(
        expected.contributed,
      );
    }
  });

  it("agrees with the recurrence across a sweep of contributions", () => {
    // One fixture can agree by luck. A sweep cannot: the funded month is an
    // integer, so any disagreement over the band shows up as a whole month.
    for (let contribution = 1_000_000; contribution <= 20_000_000; contribution += 500_000) {
      const schedule = projectSavings({
        initial: INITIAL,
        contribution,
        monthlyRate: RATE,
        target: TARGET,
      });
      const expected = reference(INITIAL, contribution, RATE, TARGET)!;
      expect(schedule.fundedMonth, String(contribution)).toBe(expected.month);
    }
  });
});

describe("the funded band", () => {
  it("does not charge an extra contribution when the plan lands exactly", () => {
    // The defect the band exists for. `contribution` mode solves the payment
    // that lands ON the target at month 60, and `(1 + r) ** 60` does not
    // return it bit-exactly — so a bare `>=` reports 61 contributions for a
    // 60-month plan.
    const solved = computeSavingsGoal({
      mode: "contribution",
      initial: INITIAL,
      target: TARGET,
      months: 60,
      annualRatePercent: 6,
    })!;
    const schedule = savingsScheduleFor(solved, 6, "contribution")!;
    expect(schedule.fundedMonth).toBe(60);
    expect(schedule.months).toBe(60);
    expect(schedule.status).toBe("funded");
    // Without the slack the raw balance is BELOW the target, by a couple of
    // ULPs — which is what would have bought the extra month.
    const raw = balanceAfter(60, INITIAL, solved.contribution, RATE);
    expect(raw).toBeLessThan(TARGET + 1);
    expect(TARGET - raw).toBeLessThan(fundedSlack(raw, TARGET));
  });

  it("does the same across a wide sweep of targets, horizons and rates", () => {
    // The sweep that JUSTIFIES the tolerance. The worst shortfall observed
    // across it is 1,28 ULPs of the target; `FUNDED_ULPS` is 16. If a change
    // to the closed form pushes the residue past that, this fails here rather
    // than as an extra contribution on somebody's plan.
    let worstUlps = 0;
    for (const target of [1, 100, 1_000, 1e6, 5e8, 2e9, 1e12, 1e15]) {
      for (const months of [1, 2, 7, 12, 36, 60, 120, 240, 360, 600, 1200]) {
        for (const ratePercent of [0, 0.1, 3, 6, 12, 36]) {
          const initial = target * 0.2;
          const solved = computeSavingsGoal({
            mode: "contribution",
            initial,
            target,
            months,
            annualRatePercent: ratePercent,
          });
          if (solved === null) continue;
          const label = `${target}/${months}/${ratePercent}`;
          const schedule = savingsScheduleFor(solved, ratePercent, "contribution")!;
          expect(schedule.fundedMonth, label).toBe(months);
          const raw = balanceAfter(
            months,
            initial,
            solved.contribution,
            ratePercent / 100 / 12,
          );
          const shortfall = target - raw;
          if (shortfall > 0) {
            worstUlps = Math.max(
              worstUlps,
              shortfall / (target * Number.EPSILON),
            );
          }
        }
      }
    }
    // The measured worst case, pinned with headroom against the 16 allowed.
    expect(worstUlps).toBeGreaterThan(0);
    expect(worstUlps).toBeLessThan(4);
  });

  it("has no contribution to solve once the starting balance overshoots", () => {
    // Not a band problem, and worth pinning so the sweep above is not quietly
    // truncated: 100 triệu at 0,5%/tháng passes 500 triệu on its own before
    // month 360, so "how much should I add" has no non-negative answer.
    expect(balanceAfter(360, INITIAL, 0, RATE)).toBeGreaterThan(TARGET);
    expect(
      computeSavingsGoal({
        mode: "contribution",
        initial: INITIAL,
        target: TARGET,
        months: 360,
        annualRatePercent: 6,
      }),
    ).toBeNull();
  });

  it("is far too small to claim success early", () => {
    // A month short of a 500 triệu goal is short by millions; the slack is
    // under a millionth of a đồng.
    expect(fundedSlack(TARGET, TARGET)).toBeLessThan(1e-5);
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(balanceAfter(42, INITIAL, 8_000_000, RATE)).toBeLessThan(
      TARGET - 1_000_000,
    );
    expect(schedule.fundedMonth).not.toBe(42);
  });

  it("scales with the figures compared, and is never a fixed allowance", () => {
    // The two shapes the old band got wrong. It allowed half a đồng
    // absolutely — a FRACTION of a small goal — with a 1e-12 relative floor
    // that was 1.000 ₫ at 1e15.
    expect(fundedSlack(1, 1)).toBeLessThan(1e-14);
    expect(fundedSlack(0, 0)).toBe(0);
    expect(fundedSlack(1e15, 1e15)).toBeLessThan(4);
    // Taken from the LARGER of the two, because that is the figure whose
    // representation error dominates.
    expect(fundedSlack(1e15, 1)).toBe(fundedSlack(1, 1e15));
    expect(fundedSlack(Number.POSITIVE_INFINITY, 1)).toBe(0);
  });
});

/**
 * The independent review's counterexamples, executed against this module.
 *
 * Each of these was reported as FUNDED or as a valid projection by the first
 * version. None of them is rounding residue; each was a financial allowance
 * or a missing output check.
 */
describe("the review's counterexamples", () => {
  it("does not call a 1 ₫ goal funded at a balance of 0,5 ₫", () => {
    // `initial: 0, contribution: 1/60, rate: 0, target: 1, months: 60`
    // reported fundedMonth 30 — half the target — because the allowance was
    // half a đồng regardless of the figures involved. At a 0% rate the
    // arithmetic here is exact, so there was no residue to forgive.
    const schedule = projectSavings({
      initial: 0,
      contribution: 1 / 60,
      monthlyRate: 0,
      target: 1,
      months: 60,
    });
    expect(schedule.fundedMonth).not.toBe(30);
    // The 60th contribution is the first that covers it, and the balance
    // there is the goal to within a ULP.
    expect(schedule.fundedMonth).toBe(60);
    expect(schedule.months).toBe(60);
    expect(balanceAfter(30, 0, 1 / 60, 0)).toBeCloseTo(0.5, 12);
  });

  it("funds a 1e15 ₫ integer goal at EXACTLY month 999, not 996", () => {
    // Two rounds of this counterexample. First it was `alreadyFunded` at
    // month 0 (a 1e-12 relative floor is 1.000 ₫ here). Then it funded at
    // 996 — three đồng early — because a ULP-scaled allowance was still
    // applied to `initial + contribution × n` at a zero rate, which is exact
    // arithmetic on whole đồng and has no error to forgive.
    const schedule = projectSavings({
      initial: 999_999_999_999_001,
      contribution: 1,
      monthlyRate: 0,
      target: 1_000_000_000_000_000,
    });
    expect(schedule.status).toBe("funded");
    expect(schedule.fundedMonth).toBe(999);
    expect(schedule.balance).toBe(1_000_000_000_000_000);
    // Month 996 really is short, and the figures are exactly representable —
    // so the comparison there must be strict.
    expect(999_999_999_999_001 + 996).toBe(999_999_999_999_997);
    expect(balanceIsExact(
      { initial: 999_999_999_999_001, contribution: 1, monthlyRate: 0 },
      996,
    )).toBe(true);
    // The slack that used to bridge it is about 3,6 ₫ at this magnitude.
    expect(fundedSlack(999_999_999_999_001, 1e15)).toBeGreaterThan(3);
    expect(fundedSlack(999_999_999_999_001, 1e15)).toBeLessThan(10);
    // And it is not applied, so no month before 999 is reported.
    expect(schedule.fundedMonth).not.toBe(996);
    expect(schedule.fundedMonth).not.toBe(0);
  });

  it("decides exactness from the arithmetic, not from the rate alone", () => {
    const whole = { initial: 1_000, contribution: 1, monthlyRate: 0 };
    const fractional = { initial: 0, contribution: 1 / 60, monthlyRate: 0 };
    const growing = { initial: 1_000, contribution: 1, monthlyRate: 0.005 };

    // Month 0 is the starting balance itself: exact at any rate.
    expect(balanceIsExact(growing, 0)).toBe(true);
    // Zero rate on whole đồng: exact.
    expect(balanceIsExact(whole, 12)).toBe(true);
    // Zero rate with a fractional contribution: NOT exact — 1/60 × 60 is
    // 0,9999999999999999, and the tiny-target counterexample needs that
    // residue forgiven.
    expect(balanceIsExact(fractional, 60)).toBe(false);
    // Any compounding: not exact.
    expect(balanceIsExact(growing, 12)).toBe(false);
    // Past the safe-integer range the sum is no longer exact either.
    expect(
      balanceIsExact({ initial: 2 ** 53, contribution: 3, monthlyRate: 0 }, 5),
    ).toBe(false);
  });

  it("keeps the tiny fractional goal at month 60, slack or no slack", () => {
    // The first counterexample must still pass. It happens not to need the
    // slack at all: `1/60 × 60` rounds to exactly 1, so month 60 covers a
    // 1 ₫ goal under a strict comparison too. Worth pinning, because it
    // means the strict rule above cannot have broken this case.
    const schedule = projectSavings({
      initial: 0,
      contribution: 1 / 60,
      monthlyRate: 0,
      target: 1,
      months: 60,
    });
    expect(schedule.fundedMonth).toBe(60);
    expect(balanceAfter(60, 0, 1 / 60, 0)).toBe(1);
    // Month 59 is genuinely short, by far more than any slack.
    expect(balanceAfter(59, 0, 1 / 60, 0)).toBeLessThan(0.99);
  });

  it("still forgives a real residue where the arithmetic makes one", () => {
    // The case the slack exists for: a solved contribution at a POSITIVE
    // rate can land a couple of ULPs BELOW its target at the horizon, and a
    // strict comparison there would charge an extra contribution nobody
    // needs to make. Found by sweep rather than asserted at one fixture,
    // because which points undershoot depends on the arithmetic.
    let undershot = 0;
    for (const target of [100, 1_000, 1e6, 5e8, 2e9, 1e12]) {
      for (const months of [12, 36, 60, 120, 240]) {
        for (const ratePercent of [0.1, 3, 6, 12]) {
          const initial = target * 0.2;
          const solved = computeSavingsGoal({
            mode: "contribution",
            initial,
            target,
            months,
            annualRatePercent: ratePercent,
          });
          if (solved === null) continue;
          const monthlyRate = ratePercent / 100 / 12;
          const raw = balanceAfter(months, initial, solved.contribution, monthlyRate);
          if (raw >= target) continue;
          undershot += 1;
          const label = `${target}/${months}/${ratePercent}`;
          // Short, but only by float residue — and the arithmetic is
          // correctly classified as inexact, so the slack applies.
          expect(target - raw, label).toBeLessThan(fundedSlack(raw, target));
          expect(
            balanceIsExact(
              { initial, contribution: solved.contribution, monthlyRate },
              months,
            ),
            label,
          ).toBe(false);
          expect(
            savingsScheduleFor(solved, ratePercent, "contribution")!.fundedMonth,
            label,
          ).toBe(months);
        }
      }
    }
    // The sweep has to actually contain such a case, or it proves nothing.
    expect(undershot).toBeGreaterThan(0);
  });

  it("refuses a projection whose OUTPUTS are not finite", () => {
    // A monthly rate of 1e308 is a finite input whose compound growth is not.
    // This used to come back as a valid `horizon` carrying NaN/Infinity.
    const schedule = projectSavings({
      initial: 0,
      contribution: 1,
      monthlyRate: 1e308,
      months: 12,
    });
    expect(schedule.status).toBe("invalid");
    expect(schedule.points).toEqual([]);
    expect(Number.isFinite(schedule.balance)).toBe(true);
    expect(schedule.balance).toBe(0);
  });

  it("refuses a SEARCH whose outputs would overflow too", () => {
    // Month 1 reaches 1e200, month 2 overflows. A non-finite balance can
    // never cover anything, so the search runs to the cap — and the cap's own
    // figures are not finite either, so the whole projection is refused
    // rather than reported as `beyondLimit` carrying Infinity.
    const schedule = projectSavings({
      initial: 1,
      contribution: 1,
      monthlyRate: 1e200,
      target: 1e308,
    });
    expect(schedule.status).toBe("invalid");
    expect(schedule.points).toEqual([]);
  });

  it("still answers a search whose outputs ARE finite", () => {
    // The companion case, so the guard above is a FINITENESS check and not a
    // blanket refusal of large rates: one month at 1e308 does reach 1e300,
    // and every figure at that month is finite.
    const schedule = projectSavings({
      initial: 1,
      contribution: 1,
      monthlyRate: 1e308,
      target: 1e300,
    });
    expect(schedule.status).toBe("funded");
    expect(schedule.fundedMonth).toBe(1);
    expect(Number.isFinite(schedule.balance)).toBe(true);
  });

  it("bounds the override arguments against the supported caps", () => {
    // A caller cannot ask this module to walk a million months or emit a
    // million points just because it passed a number.
    expect(
      projectSavings({
        initial: 0,
        contribution: 1_000_000,
        monthlyRate: 0,
        months: 12,
        limitMonths: MAX_PROJECTION_MONTHS + 1,
      }).status,
    ).toBe("invalid");
    expect(
      projectSavings({
        initial: 0,
        contribution: 1_000_000,
        monthlyRate: 0,
        months: 12,
        maxPoints: MAX_SERIES_POINTS + 1,
      }).status,
    ).toBe("invalid");
  });

  it("takes the mode from its caller rather than guessing from the solve", () => {
    // `months` mode searches; `contribution` and `target` keep the horizon
    // they were given. Inferring that from whether the solved `months`
    // happened to be an integer made the branch depend on a coincidence.
    const solvedMonths = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 8_000_000,
      annualRatePercent: 6,
    })!;
    expect(savingsScheduleFor(solvedMonths, 6, "months")!.months).toBe(43);

    // A months-mode solve that lands on a WHOLE number still searches, and
    // gets the same answer either way — which is the property inference
    // could not guarantee.
    const exact = computeSavingsGoal({
      mode: "months",
      initial: 0,
      target: 12_000_000,
      contribution: 1_000_000,
      annualRatePercent: 0,
    })!;
    expect(exact.months).toBe(12);
    expect(savingsScheduleFor(exact, 0, "months")!.fundedMonth).toBe(12);

    // A non-integer horizon in a mode that should have been given a whole one
    // is a broken result, not a request to search.
    expect(
      savingsScheduleFor({ ...solvedMonths }, 6, "contribution"),
    ).toBeNull();
  });
});

describe("a zero rate", () => {
  it("funds on the exact whole cycle, with no interest", () => {
    // 100m + 8m × 50 = 500m exactly, so the 50th contribution is the first
    // covering one and not the 51st.
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: 0,
      target: TARGET,
    });
    expect(schedule.fundedMonth).toBe(50);
    expect(schedule.balance).toBe(TARGET);
    expect(schedule.interest).toBe(0);
    expect(schedule.interestSharePercent).toBe(0);
    expect(reference(INITIAL, 8_000_000, 0, TARGET)!.month).toBe(50);
  });

  it("projects a horizon with no interest", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: 0,
      months: 60,
    });
    expect(schedule.status).toBe("horizon");
    expect(schedule.balance).toBe(580_000_000);
    expect(schedule.interest).toBe(0);
    expect(schedule.fundedMonth).toBeNull();
  });
});

describe("the states that are not a duration", () => {
  it("reports an already-funded goal as achieved, not as no answer", () => {
    // `computeSavingsGoal` returns null here, correctly — a duration is not
    // the answer. The schedule can still say what IS true.
    expect(
      computeSavingsGoal({
        mode: "months",
        initial: 600_000_000,
        target: TARGET,
        contribution: 8_000_000,
        annualRatePercent: 6,
      }),
    ).toBeNull();
    const schedule = projectSavings({
      initial: 600_000_000,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(schedule.status).toBe("alreadyFunded");
    expect(schedule.fundedMonth).toBe(0);
    expect(schedule.months).toBe(0);
    expect(schedule.balance).toBe(600_000_000);
    expect(schedule.totalContributed).toBe(600_000_000);
    expect(schedule.interest).toBe(0);
    expect(schedule.points).toHaveLength(1);
  });

  it("counts a goal met exactly by the starting balance as already funded", () => {
    const schedule = projectSavings({
      initial: TARGET,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(schedule.status).toBe("alreadyFunded");
    expect(schedule.fundedMonth).toBe(0);
  });

  it("reports a frozen balance as unattainable without searching", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 0,
      monthlyRate: 0,
      target: TARGET,
    });
    expect(schedule.status).toBe("unattainable");
    expect(schedule.fundedMonth).toBeNull();
    expect(schedule.balance).toBe(INITIAL);
  });

  it("reports a goal outside the supported horizon rather than guessing", () => {
    // 1 ₫ a month toward 500 triệu at 0% is 400 million months. The search
    // stops at the cap and says so; it does not run.
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 1,
      monthlyRate: 0,
      target: TARGET,
    });
    expect(schedule.status).toBe("beyondLimit");
    expect(schedule.fundedMonth).toBeNull();
    expect(schedule.months).toBe(MAX_PROJECTION_MONTHS);
    expect(schedule.limitMonths).toBe(MAX_PROJECTION_MONTHS);
  });

  it("reports a fixed horizon that misses the target as short, not funded", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 1_000_000,
      monthlyRate: RATE,
      months: 12,
      target: TARGET,
    });
    expect(schedule.status).toBe("shortOfTarget");
    expect(schedule.fundedMonth).toBeNull();
    expect(schedule.months).toBe(12);
    expect(schedule.balance).toBeLessThan(TARGET);
  });

  it("finds a goal met before the end of a fixed horizon", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 20_000_000,
      monthlyRate: RATE,
      months: 60,
      target: TARGET,
    });
    expect(schedule.status).toBe("funded");
    expect(schedule.fundedMonth).toBe(
      reference(INITIAL, 20_000_000, RATE, TARGET)!.month,
    );
    // A fixed horizon still REPORTS on that horizon: the saver asked what
    // happens over 60 months, so the balance and totals are month 60's and the
    // funded cycle is reported beside them.
    expect(schedule.months).toBe(60);
    expect(schedule.fundedMonth).toBeLessThan(60);
    expect(schedule.totalContributed).toBe(INITIAL + 20_000_000 * 60);
  });

  it("keeps a fixed horizon even when the balance already covers the goal", () => {
    // The degenerate "what will I have" case: no contribution and no rate, so
    // the closing balance equals the opening one. Collapsing the horizon to
    // month 0 would erase the 60 months the saver asked about.
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 0,
      monthlyRate: 0,
      months: 60,
      target: INITIAL,
    });
    expect(schedule.status).toBe("alreadyFunded");
    expect(schedule.fundedMonth).toBe(0);
    expect(schedule.months).toBe(60);
    expect(schedule.balance).toBe(INITIAL);
  });
});

describe("invalid input", () => {
  it("refuses a negative or non-finite figure", () => {
    const cases = [
      { initial: -1, contribution: 1, monthlyRate: RATE, target: TARGET },
      { initial: 1, contribution: -1, monthlyRate: RATE, target: TARGET },
      { initial: 1, contribution: 1, monthlyRate: -0.01, target: TARGET },
      { initial: 1, contribution: 1, monthlyRate: RATE, target: -1 },
      { initial: Number.NaN, contribution: 1, monthlyRate: RATE, target: TARGET },
      {
        initial: 1,
        contribution: Number.POSITIVE_INFINITY,
        monthlyRate: RATE,
        target: TARGET,
      },
    ];
    for (const input of cases) {
      const schedule = projectSavings(input);
      expect(schedule.status, JSON.stringify(input)).toBe("invalid");
      expect(schedule.points, JSON.stringify(input)).toEqual([]);
    }
  });

  it("refuses a fractional or over-long horizon", () => {
    for (const months of [1.5, -1, MAX_PROJECTION_MONTHS + 1, Number.NaN]) {
      const schedule = projectSavings({
        initial: INITIAL,
        contribution: 1_000_000,
        monthlyRate: RATE,
        months,
      });
      expect(schedule.status, String(months)).toBe("invalid");
    }
  });

  it("refuses a projection with neither a horizon nor a target", () => {
    expect(
      projectSavings({ initial: INITIAL, contribution: 1, monthlyRate: RATE })
        .status,
    ).toBe("invalid");
  });

  it("recovers on the next valid input", () => {
    // The clearing contract: an invalid state is not sticky, because nothing
    // is remembered between calls.
    const bad = projectSavings({
      initial: -1,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(bad.status).toBe("invalid");
    const good = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    expect(good.status).toBe("funded");
    expect(good.fundedMonth).toBe(43);
  });
});

describe("bounded drawing", () => {
  it("draws every month up to 360 and samples beyond", () => {
    const short = projectSavings({
      initial: 0,
      contribution: 1_000_000,
      monthlyRate: RATE,
      months: 360,
    });
    expect(short.points).toHaveLength(361);
    expect(short.sampled).toBe(false);

    const long = projectSavings({
      initial: 0,
      contribution: 1_000,
      monthlyRate: 0,
      target: TARGET,
    });
    expect(long.status).toBe("beyondLimit");
    expect(long.points.length).toBeLessThanOrEqual(MAX_SERIES_POINTS);
    expect(long.sampled).toBe(true);
  });

  it("always keeps the real endpoints, whatever the stride", () => {
    for (const months of [1, 2, 361, 500, 999, MAX_PROJECTION_MONTHS]) {
      const schedule = projectSavings({
        initial: INITIAL,
        contribution: 1_000_000,
        monthlyRate: RATE,
        months,
      });
      expect(schedule.points[0].period, String(months)).toBe(0);
      expect(
        schedule.points[schedule.points.length - 1].period,
        String(months),
      ).toBe(months);
      expect(schedule.points.length, String(months)).toBeLessThanOrEqual(
        MAX_SERIES_POINTS,
      );
    }
  });

  it("puts the same figures on every point as the schedule reports", () => {
    const schedule = projectSavings({
      initial: INITIAL,
      contribution: 8_000_000,
      monthlyRate: RATE,
      target: TARGET,
    });
    const last = schedule.points[schedule.points.length - 1];
    expect(last.balance).toBe(schedule.balance);
    expect(last.contributed).toBe(schedule.totalContributed);
    for (const point of schedule.points) {
      expect(point.contributed).toBe(INITIAL + 8_000_000 * point.period);
      expect(point.balance).toBeGreaterThanOrEqual(point.contributed - DONG_SLACK);
    }
  });

  it("honours a caller's own bounds", () => {
    const schedule = projectSavings({
      initial: 0,
      contribution: 1_000_000,
      monthlyRate: 0,
      months: 100,
      maxPoints: 11,
      limitMonths: 200,
    });
    expect(schedule.points.length).toBeLessThanOrEqual(11);
    expect(schedule.limitMonths).toBe(200);
    expect(schedule.sampled).toBe(true);
  });
});

describe("savingsScheduleFor", () => {
  it("searches for the cycle when the solver returned a fraction", () => {
    const solved = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 8_000_000,
      annualRatePercent: 6,
    })!;
    expect(Number.isInteger(solved.months)).toBe(false);
    const schedule = savingsScheduleFor(solved, 6, "months")!;
    expect(schedule.fundedMonth).toBe(43);
    expect(schedule.months).toBe(43);
  });

  it("keeps the horizon the solver was given in target mode", () => {
    const solved = computeSavingsGoal({
      mode: "target",
      initial: INITIAL,
      contribution: 6_000_000,
      months: 60,
      annualRatePercent: 6,
    })!;
    const schedule = savingsScheduleFor(solved, 6, "target")!;
    expect(schedule.months).toBe(60);
    // The solver's own future value, to the đồng.
    expect(Math.abs(schedule.balance - solved.target)).toBeLessThan(DONG_SLACK);
    // And the goal "reached" is that same balance, so the cycle is the last.
    expect(schedule.fundedMonth).toBe(60);
  });

  it("returns the solver's totals at the cycle it actually reports", () => {
    // The consistency claim: in `months` mode the solver's continuous totals
    // are NOT the schedule's, and the schedule's are the ones a saver sees.
    const solved = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 8_000_000,
      annualRatePercent: 6,
    })!;
    const schedule = savingsScheduleFor(solved, 6, "months")!;
    expect(Math.round(solved.totalContributed)).not.toBe(
      schedule.totalContributed,
    );
    expect(schedule.totalContributed).toBe(444_000_000);
    expect(schedule.balance).toBeGreaterThan(solved.target);
  });

  it("returns null for no result and for an impossible rate", () => {
    expect(savingsScheduleFor(null, 6, "months")).toBeNull();
    const solved = computeSavingsGoal({
      mode: "months",
      initial: INITIAL,
      target: TARGET,
      contribution: 8_000_000,
      annualRatePercent: 6,
    })!;
    expect(savingsScheduleFor(solved, -1, "months")).toBeNull();
    expect(savingsScheduleFor(solved, Number.NaN, "months")).toBeNull();
  });
});
