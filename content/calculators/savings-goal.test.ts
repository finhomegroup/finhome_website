/**
 * Content contracts for `/cong-cu/muc-tieu-tiet-kiem/` — the reader-first
 * method prose, 2026-09-26.
 *
 * "Cách tính" now leads with meaning and quotes ROUNDED figures ("khoảng 5,2
 * triệu"); the exact đồng figures live in `formula.detail`, the shell's
 * disclosed method layer. Both layers are derived here from the engine on the
 * shipped defaults, so a moved default turns this red instead of leaving the
 * prose describing a scenario the tool no longer runs.
 *
 * Rounding is checked the way `affordability.test.ts` checks its "230 triệu":
 * the CLAIM is that the engine's exact figure rounds to what the prose says,
 * not merely that a string appears somewhere.
 */
import { describe, expect, it } from "vitest";
import { SAVINGS_GOAL as C } from "@/content/calculators/savings-goal";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";
import { houseFundTarget, planHouseFund } from "@/lib/calc/house-fund";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";

const initial = parseMoney(C.form.defaultInitial)!;
const target = parseMoney(C.form.defaultTarget)!;
const months = parseCount(C.form.defaultMonths)!;
const annualRatePercent = parseDecimal(C.form.defaultRate)!;

const byContribution = computeSavingsGoal({
  mode: "contribution",
  initial,
  target,
  months,
  annualRatePercent,
})!;
const atZero = computeSavingsGoal({
  mode: "contribution",
  initial,
  target,
  months,
  annualRatePercent: 0,
})!;

const body = C.formula.body;
const detail = C.formula.detail.body.join(" ");

describe("muc-tieu-tiet-kiem's method section", () => {
  it("opens with what the figure means, and keeps the equation behind the disclosure", () => {
    expect(body[0]).toMatch(/^Hiểu ngay:/);
    // No exponent notation anywhere in the visible paragraphs — the equation
    // is the detail layer's job, and the visible text says where it is.
    for (const paragraph of body) expect(paragraph).not.toContain("^");
    expect(body[0]).toContain("phần mở rộng cuối mục này");
    expect(C.formula.detail.title.length).toBeGreaterThan(0);
    expect(detail).toContain("(1 + r)^n");
  });

  it("quotes the default example in rounded triệu that the engine actually rounds to", () => {
    const example = body[1];
    expect(formatDecimal(byContribution.contribution / 1e6, 1)).toBe("5,2");
    expect(example).toContain("khoảng 5,2 triệu mỗi tháng");
    expect(Math.round(byContribution.totalContributed / 1e6)).toBe(414);
    expect(example).toContain("khoảng 414 triệu");
    expect(Math.round(byContribution.interestEarned / 1e6)).toBe(86);
    expect(example).toContain("khoảng 86 triệu");
    expect(Math.round(byContribution.interestSharePercent)).toBe(17);
    expect(example).toContain("khoảng 17%");
    // The example names its own inputs, so the figures are not orphaned.
    expect(example).toContain("100 triệu");
    expect(example).toContain("500 triệu");
    expect(example).toContain("60 tháng");
    expect(example).toContain("6%/năm");
  });

  it("compares the 0% case off the engine and suggests trying it on the tool", () => {
    const paragraph = body[2];
    expect(formatDecimal(atZero.contribution / 1e6, 1)).toBe("6,7");
    expect(paragraph).toContain("khoảng 6,7 triệu");
    const gap = atZero.contribution - byContribution.contribution;
    expect(formatDecimal(gap / 1e6, 1)).toBe("1,4");
    expect(paragraph).toContain("khoảng 1,4 triệu");
    // Reader-first: one experiment to run, not only a fact to absorb.
    expect(paragraph).toContain("Hãy thử");
  });

  it("keeps every exact figure the rounded prose stands for, in the detail layer", () => {
    expect(detail).toContain(`${formatMoney(byContribution.contribution)} ₫`);
    expect(detail).toContain(`${formatMoney(byContribution.totalContributed)} ₫`);
    expect(detail).toContain(`${formatMoney(byContribution.interestEarned)} ₫`);
    expect(detail).toContain(formatPercent(byContribution.interestSharePercent, 1));
    expect(detail).toContain(`${formatMoney(atZero.contribution)} ₫`);
  });

  it("explains whole funded cycles with the engine's own months-mode figure", () => {
    const byMonths = computeSavingsGoal({
      mode: "months",
      initial,
      target,
      contribution: 6_000_000,
      annualRatePercent,
    })!;
    expect(formatDecimal(byMonths.months, 1)).toBe("53,8");
    expect(Math.ceil(byMonths.months)).toBe(54);
    const paragraph = body[3];
    expect(paragraph).toContain("53,8 tháng");
    expect(paragraph).toContain("kỳ thứ 54");
    expect(paragraph).toContain("ước lượng liên tục");
  });

  it("quotes the house-fund example in tỷ and triệu that house-fund.ts rounds to", () => {
    const composed = houseFundTarget({
      price: 3_000_000_000,
      downPaymentPercent: 30,
      purchaseCostPercent: 3,
      reserve: 150_000_000,
    })!;
    expect(composed.target).toBe(1_140_000_000);
    expect(body[5]).toContain("900 triệu + 90 triệu + 150 triệu = 1,14 tỷ");

    const plan = planHouseFund({
      initial: 300_000_000,
      contribution: 15_000_000,
      annualRatePercent: 6,
      target: composed.target,
      start: { year: 2026, month: 9, day: 15 },
      comparisonContribution: 20_000_000,
    })!;
    expect(plan.current.schedule.fundedMonth).toBe(46);
    expect(plan.current.fundedDate).toEqual({ year: 2030, month: 7, day: 15 });
    expect(plan.higher?.schedule.fundedMonth).toBe(36);
    expect(plan.higher?.fundedDate).toEqual({ year: 2029, month: 9, day: 15 });
    expect(plan.monthsEarlier).toBe(10);
    expect(body[6]).toContain("kỳ thứ 46");
    expect(body[7]).toContain("15/7/2030");
    expect(body[7]).toContain("15/9/2029");
    expect(body[7]).toContain("sớm hơn 10 tháng");
    // Own money in by each funded cycle, rounded as the prose rounds it.
    expect(formatDecimal(plan.higher!.ownFunds / 1e9, 2)).toBe("1,02");
    expect(Math.round(plan.current.ownFunds / 1e6)).toBe(990);
    expect(body[7]).toContain("khoảng 1,02 tỷ");
    expect(body[7]).toContain("khoảng 990 triệu");
  });

  it("tells the reader which mode to pick before it mentions rounding, and promises no fixed magnitude", () => {
    const help = C.form.modeHelp;
    expect(help).toMatch(/^Chọn theo điều bạn đã biết chắc/);
    expect(help.indexOf("mức góp mỗi tháng")).toBeLessThan(help.indexOf("làm tròn"));
    // Independent review finding 8: a rounding difference compounds over a
    // long horizon, so "vài đồng" was a promise the tool cannot keep.
    expect(help).not.toContain("vài đồng");
    expect(help).toContain("do làm tròn");
  });

  it("keeps the reserve-definition qualification the component test relies on", () => {
    // Same pins `savings-goal-calculator.test.ts` holds, restated on the
    // paragraph rather than the joined prose so a reorder cannot hide them.
    expect(body[6]).toContain("hai cách trùng nhau");
    expect(body[6]).not.toContain("KHÔNG cho cùng một ngày");
    expect(body[6]).toContain("có thể cho một NGÀY khác");
  });
});
