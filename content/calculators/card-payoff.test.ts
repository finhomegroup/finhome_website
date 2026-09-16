/**
 * The card-payoff WORKSPACE at its shipped defaults, and every figure the two
 * routes' prose quotes — original rows 29 and 30.
 *
 * docs §6's substitute for component coverage: parse the content file's own
 * default strings with the SAME parsers the component uses, run the module,
 * format with the same formatter, and pin the result. Three of the suite's
 * five worst defects lived in a default input or in prose rather than in a
 * module.
 *
 * Both files are read as RAW TEXT so the `//` provenance headers are covered
 * too — that header is where each route's worked example lives, and a header
 * that drifts from the module is how a page ends up quoting a figure it no
 * longer produces.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import { CARD_MINIMUM } from "@/content/calculators/card-minimum";
import { planCardPayoff, type CardPlanResult } from "@/lib/calc/card-plan";
import { readDateFields } from "@/lib/calc/date-input";
import { addMonths } from "@/lib/calc/dates";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";

const F = CARD_PAYOFF.form;

const start = readDateFields(
  F.defaultStartYear,
  F.defaultStartMonth,
  F.defaultStartDay,
);

/** The shared half of the form, read through the component's own parsers. */
const base = {
  balance: parseMoney(F.defaultBalance)!,
  annualRatePercent: parseDecimal(F.defaultRate)!,
  minimumPercent: parseDecimal(F.defaultPercent)!,
  minimumFloor: parseMoney(F.defaultFloor)!,
  householdBudget: parseMoney(F.defaultBudget)!,
  start: start.date!,
};

const fixed = planCardPayoff({
  ...base,
  strategy: "fixed",
  monthlyPayment: parseMoney(F.defaultPayment)!,
});
const target = planCardPayoff({
  ...base,
  strategy: "target",
  targetMonths: parseCount(F.defaultMonths)!,
});
const minimum = planCardPayoff({
  ...base,
  strategy: "minimum",
  extraPerMonth: parseMoney(F.defaultExtra)!,
});

const payoffProse = readFileSync("content/calculators/card-payoff.ts", "utf8");
const minimumProse = readFileSync(
  "content/calculators/card-minimum.ts",
  "utf8",
);
const bothProse = `${payoffProse}\n${minimumProse}`;

const money = (value: number) => formatMoney(value);
/** The page's own date format: 15/7/2028. */
const showDate = (plan: CardPlanResult) =>
  `${formatDecimal(plan.plan.payoffDate.day, 0)}/${formatDecimal(plan.plan.payoffDate.month, 0)}/${formatDecimal(plan.plan.payoffDate.year, 0)}`;

describe("the shipped defaults compute", () => {
  it("parses every default with the grammar its field uses", () => {
    expect(base.balance).toBe(50_000_000);
    expect(base.annualRatePercent).toBe(30);
    expect(base.minimumPercent).toBe(5);
    expect(base.minimumFloor).toBe(500_000);
    expect(base.householdBudget).toBe(3_000_000);
    expect(parseMoney(F.defaultPayment)).toBe(3_000_000);
    // `parseCount`, not `parseMoney`: a typed "3.0" would otherwise be 30.
    expect(parseCount(F.defaultMonths)).toBe(12);
    expect(parseMoney(F.defaultExtra)).toBe(0);
    expect(start.date).toEqual({ year: 2026, month: 9, day: 15 });
  });

  it("answers in all three strategies", () => {
    expect(fixed).not.toBeNull();
    expect(target).not.toBeNull();
    expect(minimum).not.toBeNull();
    expect(fixed!.plan.months).toBe(22);
    expect(target!.plan.months).toBe(12);
    expect(minimum!.plan.months).toBe(90);
  });

  it("pairs each strategy with the other path", () => {
    expect(fixed!.comparison!.strategy).toBe("minimum");
    expect(fixed!.comparison!.months).toBe(90);
    expect(minimum!.comparison!.strategy).toBe("minimumFlat");
    expect(minimum!.comparison!.months).toBe(28);
  });
});

describe("the prose quotes what the module produces", () => {
  it("binds the fixed-payment example, with its date", () => {
    expect(payoffProse).toContain(money(fixed!.plan.result.totalInterest));
    expect(payoffProse).toContain(`${fixed!.plan.months} tháng`);
    expect(payoffProse).toContain(showDate(fixed!));
  });

  it("binds the target-month example", () => {
    expect(payoffProse).toContain(money(target!.plan.levelPayment!));
  });

  it("binds the minimum-payment example on BOTH routes", () => {
    const interest = money(minimum!.plan.result.totalInterest);
    const firstPayment = money(minimum!.plan.result.firstPayment);
    for (const prose of [payoffProse, minimumProse]) {
      expect(prose).toContain(`${minimum!.plan.months} tháng`);
      expect(prose).toContain(interest);
      expect(prose).toContain(firstPayment);
    }
    // The minimum route's own headline figures.
    expect(minimumProse).toContain(showDate(minimum!));
    expect(minimumProse).toContain(
      formatPercent(minimum!.plan.result.interestSharePercent, 1),
    );
    // "7,5 năm", as the notice says.
    expect(formatDecimal(minimum!.plan.months / 12, 1)).toBe("7,5");
  });

  it("binds the held-flat comparison and the gap between the two", () => {
    const flat = minimum!.comparison!;
    for (const prose of [payoffProse, minimumProse]) {
      expect(prose).toContain(`${flat.months} tháng`);
      expect(prose).toContain(money(flat.result.totalInterest));
    }
    // "chênh nhau 62 tháng" in the notice is the module's own difference.
    expect(minimum!.monthsDifference).toBe(flat.months - minimum!.plan.months);
    expect(minimumProse).toContain(
      `${Math.abs(minimum!.monthsDifference!)} tháng`,
    );
  });

  it("states the monthly rate the daily accrual really implies", () => {
    // 2,5305%, not 2,5%: the figure the notice and the formula both quote.
    const rate = minimum!.plan.result.schedule[0].interest / base.balance;
    expect(formatPercent(rate * 100, 4)).toBe("2,5305%");
    expect(payoffProse).toContain("2,5305%");
    expect(CARD_PAYOFF.dailyInterestNotice).toContain("2,5305%");
  });

  it("quotes the first statement's closing balance correctly", () => {
    // 5% of 51.265.229,61 ₫ — not 5% of 50 triệu, which is the arithmetic the
    // minimum route exists to correct.
    const due = base.balance + minimum!.plan.result.schedule[0].interest;
    expect(formatMoney(due, 2)).toBe("51.265.229,61");
    expect(minimumProse).toContain("51.265.229,61");
    expect(
      Math.abs(minimum!.plan.result.firstPayment - due * 0.05),
    ).toBeLessThan(1e-6);
  });
});

describe("the dates the copy explains", () => {
  it("uses the convention it states: start + n months", () => {
    expect(F.dateConvention).toContain("một tháng sau");
    for (const plan of [fixed!, target!, minimum!]) {
      expect(plan.plan.payoffDate).toEqual(
        addMonths(base.start, plan.plan.months),
      );
    }
    expect(fixed!.firstPaymentDate).toEqual(addMonths(base.start, 1));
  });

  it("dates the worked example in the header from the module", () => {
    expect(payoffProse).toContain(showDate(fixed!));
    expect(payoffProse).toContain(showDate(minimum!));
  });
});

describe("the household allocation, as the copy describes it", () => {
  it("frees the stated allocation and nothing derived", () => {
    expect(fixed!.budget!.freedMonthly).toBe(base.householdBudget);
    expect(fixed!.budget!.freedFromMonth).toBe(fixed!.plan.months);
    // The boundary the acceptance asks for, in copy AND in the model.
    expect(minimum!.budget!.freedMonthly).toBe(base.householdBudget);
    expect(minimum!.budget!.freedMonthly).not.toBe(
      minimum!.plan.result.firstPayment,
    );
    expect(F.budgetNotProofNotice).toContain("KHÔNG tự giải phóng");
  });

  it("dates the final month's remainder and the first full month", () => {
    // The payoff month still contains the last payment, so the whole
    // allocation is not free until the next cycle. Both figures come from the
    // module rather than from the copy.
    const budget = fixed!.budget!;
    expect(formatMoney(budget.finalPayment)).toBe("2.758.272");
    expect(formatMoney(budget.finalMonthSurplus)).toBe("241.728");
    expect(budget.fullBudgetFromMonth).toBe(fixed!.plan.months + 1);
    expect(budget.fullBudgetFromDate).toEqual(
      addMonths(base.start, fixed!.plan.months + 1),
    );
    // And the copy that reports them has a slot for each.
    for (const key of [
      "{lastPayment}",
      "{surplus}",
      "{payoffDate}",
      "{fullMonth}",
      "{fullDate}",
    ]) {
      expect(F.freedTimingNotice, key).toContain(key);
      expect(F.freedTimingNoneNotice.includes(key) || key === "{surplus}")
        .toBe(true);
    }
  });

  it("says the budget is not proof of anything", () => {
    const all = [
      F.budgetHelp,
      F.budgetNotProofNotice,
      ...CARD_PAYOFF.faq.items.map((item) => item.a),
    ].join(" ");
    expect(all).toContain("không phải bằng chứng");
    for (const claim of [
      "bạn sẽ được vay",
      "đủ điều kiện vay",
      "ngân hàng sẽ",
      "đã lưu",
      "lưu kế hoạch",
    ]) {
      expect(all.toLowerCase(), `card copy claims "${claim}"`).not.toContain(
        claim.toLowerCase(),
      );
    }
  });
});

describe("the assumptions are stated as assumptions", () => {
  it("quotes no market range for a rate, a fee or a minimum", () => {
    // The 2026-09-15 repair: an illustrative rate or minimum formula is not a
    // universal current Vietnamese card contract, and this page cannot know
    // the reader's biểu phí. See the borrower-suite convention on unverified
    // population claims.
    for (const range of [
      "20–40",
      "20-40",
      "15–25",
      "8–12",
      "2–5%",
      "2–4%",
      "4–6%",
    ]) {
      expect(bothProse, `card copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("makes no categorical claim about what every card or statement does", () => {
    for (const claim of [
      "Phần lớn thẻ tại Việt Nam quy định",
      "đúng là cách sao kê tính",
      "Đây đúng là cách sao kê",
      "mọi thẻ đều",
      "gần như mọi thẻ",
    ]) {
      expect(bothProse, `card copy claims "${claim}"`).not.toContain(claim);
    }
    // And it says where the real numbers come from instead.
    expect(F.percentHelp).toContain("biểu phí");
    expect(F.rateHelp).toContain("biểu phí");
    expect(F.minimumHint).toContain("không phải quy định chung");
  });

  it("calls the daily compounding this model's assumption", () => {
    // Not an inevitable consequence of daily accrual: the day count, the
    // posting date and the rounding are the contract's, and they can differ.
    expect(CARD_PAYOFF.dailyInterestNotice).toContain("MÔ HÌNH NÀY");
    expect(CARD_PAYOFF.dailyInterestNotice).toContain("có thể tính khác");
    expect(CARD_PAYOFF.formula.body[0]).toContain("GIẢ ĐỊNH");
    expect(CARD_PAYOFF.formula.body[0]).toContain("số ngày khác");
  });

  it("asks only for the debt the entered rule applies to", () => {
    // A 0% instalment balance priced by a different rule does not belong in a
    // single-rate revolving simulation.
    expect(F.balanceHelp).toContain("áp dụng cho");
    expect(F.balanceHelp).toContain("trả góp");
    expect(F.balanceHelp).not.toContain("gồm cả các khoản đã trả góp");
  });

  it("lists what the model excludes, on the chart itself", () => {
    const assumptions = CARD_PAYOFF.chart.assumptions.join(" ");
    expect(assumptions).toContain("giao dịch mới");
    expect(assumptions).toContain("phí thường niên");
    expect(assumptions).toContain("miễn lãi");
    expect(assumptions).toContain("neo theo ngày bắt đầu");
  });
});

describe("the two routes stay two routes", () => {
  it("keeps both slugs, with their own framing", () => {
    expect(CARD_PAYOFF.slug).toBe("/cong-cu/tra-het-the-tin-dung");
    expect(CARD_MINIMUM.slug).toBe("/cong-cu/tra-toi-thieu-the-tin-dung");
    expect(CARD_MINIMUM.pageTitle).not.toBe(CARD_PAYOFF.pageTitle);
    expect(CARD_MINIMUM.faq.items.length).toBeGreaterThanOrEqual(3);
    expect(CARD_MINIMUM.formula.body.length).toBeGreaterThanOrEqual(3);
  });

  it("says the second route is the same tool, not a second form", () => {
    const all = [
      CARD_MINIMUM.lede,
      ...CARD_MINIMUM.faq.items.map((item) => item.a),
    ].join(" ");
    expect(all).toContain("cùng một công cụ");
    expect(all).toContain("không phải nhập lại");
  });

  it("owns the form copy in ONE place", () => {
    // The consolidation's point: the minimum route has no form strings of its
    // own, so the two routes cannot drift into two different forms.
    expect(Object.keys(CARD_MINIMUM)).not.toContain("form");
    expect(minimumProse).not.toContain("defaultBalance");
  });
});
