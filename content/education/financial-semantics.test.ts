import { describe, expect, it } from "vitest";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { computeAffordability, type AffordabilityInput } from "@/lib/calc/affordability";
import { computeLoan } from "@/lib/calc/loan";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";

const article = (id: string) => EDUCATION_ARTICLES.find(a => a.planId === id)!;
const prose = (id: string) => JSON.stringify(article(id));

// Independent textbook annuity/recurrence, not imports of finance.ts helpers.
const payment = (principal: number, annual: number, months: number) => {
  const r = annual / 100 / 12;
  return r === 0 ? principal / months : principal * r / (1 - (1 + r) ** -months);
};
function atMonth(principal: number, annual: number, months: number, horizon: number) {
  const regular = payment(principal, annual, months);
  let balance = principal, paid = 0, interest = 0;
  for (let m = 1; m <= horizon; m++) {
    const charge = balance * annual / 100 / 12;
    const actual = Math.min(regular, balance + charge);
    balance = Math.max(0, balance + charge - actual);
    paid += actual;
    interest += charge;
  }
  return { balance, paid, interest };
}

describe("reviewed education claims have counterexample fixtures", () => {
  it("C01: reserve-to-price sensitivity follows the binding constraint, not 1:1", () => {
    const base: AffordabilityInput = {
      mode: "household", monthlyIncome: 50e6, monthlyNetIncome: 44e6,
      essentialExpenses: 18e6, monthlyDebts: 5e6, monthlyBuffer: 3e6,
      downPayment: 600e6, purchaseCostPercent: 3, annualRatePercent: 8.5, termMonths: 240,
    };
    const before = computeAffordability(base)!;
    const after = computeAffordability({ ...base, cashReserve: 100e6 })!;
    expect(before.maxPrice - after.maxPrice).toBeCloseTo(100e6 / 1.03, 3);
    // Sufficient income makes BOTH reserve scenarios cash/LTV-bound.
    const cashBound = { ...base, monthlyIncome: 100e6, monthlyNetIncome: 90e6, assumedMaxLtvPercent: 80 };
    const cashBefore = computeAffordability(cashBound)!;
    const cashAfter = computeAffordability({ ...cashBound, cashReserve: 100e6 })!;
    expect(cashBefore.maxPrice - cashAfter.maxPrice).toBeCloseTo(100e6 / .23, 3);
    expect(prose("C01")).toContain("97,1 triệu");
    expect(prose("C01")).toContain("434,8 triệu");
    expect(prose("C01")).not.toContain("Tầm giá giảm đúng bằng số đó");
  });

  it("C02/C03: both term and rate matter, and zero-rate first year retires 5%", () => {
    const low = computeLoan({ amount: 2e9, annualRatePercent: 7.5, termMonths: 240 })!;
    const high = computeLoan({ amount: 2e9, annualRatePercent: 11, termMonths: 240 })!;
    const zero = computeLoan({ amount: 2e9, annualRatePercent: 0, termMonths: 240 })!;
    expect(low.schedule[0].principal).toBeCloseTo(payment(2e9, 7.5, 240) - 2e9 * .075 / 12, 3);
    expect(low.schedule[0].principal).toBeGreaterThan(high.schedule[0].principal);
    expect(zero.schedule.slice(0, 12).reduce((sum, row) => sum + row.principal, 0) / 2e9).toBeCloseTo(.05, 12);
    const related = prose("C02") + prose("C03") + JSON.stringify(FLOATING_LOAN);
    expect(related).not.toContain("phần đó không phụ thuộc lãi suất");
    expect(related).not.toContain("khoản trả nhỏ nghĩa là trả gốc chậm");
    expect(related).not.toContain("bất kỳ mức lãi nào");
    expect(prose("C03")).toContain("chưa phải chứng nhận an toàn");
  });

  it("C07: 25 years over budget does not imply 30 years is over budget", () => {
    expect(payment(2e9, 8.5, 300)).toBeGreaterThan(16e6);
    expect(payment(2e9, 8.5, 360)).toBeLessThan(16e6);
    expect(prose("C07")).toContain("15.378.270");
    expect(prose("C07")).not.toContain("cũng sẽ không cứu được");
  });

  it("C04/C09: nominal annual/12 and whole contribution dates are explicit", () => {
    for (const [contribution, whole] of [[8e6, 43], [10e6, 35]]) {
      const r = .06 / 12;
      const exact = Math.log((500e6 + contribution / r) / (100e6 + contribution / r)) / Math.log(1 + r);
      const computed = computeSavingsGoal({ mode: "months", initial: 100e6, target: 500e6, contribution, annualRatePercent: 6 })!;
      expect(computed.months).toBeCloseTo(exact, 8);
      expect(Math.ceil(computed.months)).toBe(whole);
      const balance = (n: number) => 100e6 * (1 + r) ** n + contribution * ((1 + r) ** n - 1) / r;
      expect(balance(whole - 1)).toBeLessThan(500e6);
      expect(balance(whole)).toBeGreaterThanOrEqual(500e6);
    }
    expect(prose("C04")).toContain("danh nghĩa");
    // C09 states the BEHAVIOUR, not the old instruction to round a fractional
    // month up by hand: the consumer answer is the first whole contribution
    // cycle that covers the goal, and the algebraic solve is kept beside it as
    // an estimate. The tool has answered in whole cycles since the savings
    // repair, so telling a reader to round is now wrong about the tool.
    expect(prose("C09")).toContain("KỲ GÓP TRỌN VẸN đầu tiên");
    expect(prose("C09")).toContain("ước lượng liên tục");
    expect(prose("C09")).not.toContain("cần làm tròn lên");
    // The 43 / 35 / 8 comparison is the article's own claim and stays pinned
    // to the whole cycles computed above.
    expect(prose("C09")).toContain("kỳ thứ 43");
    expect(prose("C09")).toContain("kỳ thứ 35");
    expect(prose("C09")).toContain("sớm 8 tháng");
  });

  it("C10: annual bonus /12 is not an equivalent repayment schedule", () => {
    const monthly = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 240, extraPerMonth: 2e6 })!;
    const annualBeforeBonus = atMonth(2e9, 8.5, 240, 12);
    const annualAfterBonus = annualBeforeBonus.balance - 24e6;
    expect(monthly.schedule[11].balance).toBeLessThan(annualAfterBonus);
    expect(prose("C10")).toContain("Không chia thưởng cuối năm cho 12");
  });

  it("C12: apparent cash-flow saving can hide a larger remaining debt", () => {
    const oldLoan = atMonth(2e9, 8.5, 120, 60);
    const newLoan = atMonth(2e9, 8.5, 240, 60);
    const fees = 40e6;
    const cashSaving = oldLoan.paid - newLoan.paid - fees;
    const costSaving = cashSaving + oldLoan.balance - newLoan.balance;
    expect(cashSaving).toBeCloseTo(406_440_386.4555, 2);
    expect(costSaving).toBeCloseTo(-147_461_455.1664, 2);
    expect(costSaving).toBeCloseTo(oldLoan.interest - newLoan.interest - fees, 2);
    expect(prose("C12")).toContain("chưa chứng minh lợi ích kinh tế");
    expect(prose("C12")).toContain("dư nợ cần tất toán");
  });

  it("states draft provenance and important comparison limitations", () => {
    for (const a of EDUCATION_ARTICLES) {
      expect(a.provenance).toContain("hỗ trợ AI");
      expect(a.provenance).not.toContain("đội nội dung FinHome viết");
    }
    expect(prose("C05")).toContain("chưa chiết khấu");
    expect(prose("C06")).not.toContain("Đây là trường hợp phổ biến");
    expect(prose("C06")).toContain("Không suy ra ngân hàng sẵn sàng cho vay");
    expect(prose("C08")).toContain("Hợp đồng thuê quyết định");
    // CORRECTED 2026-09-15. This used to pin "lần giao đầu tiên", which
    // described the break-even month as a first crossing that might not
    // last. The engine scans BACKWARD from the horizon, so the month it
    // reports is the first one where buying is ahead and STAYS ahead through
    // the selected horizon — and the article now says that, with the two
    // things the bounded meaning does not promise.
    expect(prose("C08")).toContain(
      "giữ được lợi thế đó đến hết đúng khoảng thời gian bạn đã chọn",
    );
    expect(prose("C08")).toContain("không có gì bảo đảm");
    expect(prose("C11")).toContain("không tự tìm ngưỡng lãi thả nổi");
  });
});
