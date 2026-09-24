import { describe, expect, it } from "vitest";
import { ARTICLES_1 } from "@/content/education/articles-1";
import { ARTICLES_2 } from "@/content/education/articles-2";
import { computeLoan } from "@/lib/calc/loan";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";
import { compareRefinance } from "@/lib/calc/refinance";
import { formatMoney } from "@/lib/calc/number";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { isMoneyCell } from "@/lib/calc/table-cell";

const articles = [...ARTICLES_1, ...ARTICLES_2];
const article = (id: string) => articles.find((a) => a.planId === id)!;
const detail = (id: string) => article(id).sections.flatMap((s) => s.results?.rows ?? []);
const details = (id: string) => detail(id).map((r) => `${r.label} ${r.value}`).join(" ");
const roundMillion = (value: number, digits = 1) =>
  (value / 1e6).toFixed(digits).replace(".", ",");

describe("core reader-first review preserves the financial example", () => {
  it.each(articles)("$planId keeps truthful concise provenance and a practical limit heading", (a) => {
    expect(a.provenance).toContain("hỗ trợ AI");
    expect(a.provenance).toContain("chưa được chuyên gia độc lập thẩm định");
    expect(a.provenance).not.toContain("Bản nháp");
    expect(a.limits.title).not.toBe("Bài này không trả lời được gì");
    expect(a.limits.items.length).toBeGreaterThanOrEqual(3);
  });

  it.each(["C02", "C04", "C07", "C10"])("%s puts readable amounts in its opening and exact results in details", (id) => {
    expect(article(id).shortAnswer.join(" ")).not.toMatch(/\d{1,3}(?:\.\d{3}){2,}/);
    expect(article(id).shortAnswer.join(" ")).toContain("khoảng");
    expect(detail(id).length).toBeGreaterThan(1);
  });

  it("C02 distinguishes scheduled payment, voluntary principal and housing costs", () => {
    const a = article("C02");
    if (a.visual.kind !== "loanColumns") throw new Error("C02 visual changed");
    const actual = computeLoan(a.visual.loan)!;
    const baseline = computeLoan({ ...a.visual.loan, extraPerMonth: 0 })!;
    const flat = computeLoan({ ...a.visual.loan, extraPerMonth: 0, method: "flatPrincipal" })!;
    for (const value of [actual.monthlyPrincipalInterest, actual.monthlyPlannedOutflow,
      actual.finalMonthOutflow, baseline.schedule[0].interest, baseline.schedule[0].principal,
      flat.monthlyPrincipalInterest, flat.totalInterest, baseline.totalInterest]) {
      expect(details("C02")).toContain(formatMoney(value));
    }
    expect(a.shortAnswer.join(" ")).toContain(`${roundMillion(actual.monthlyPrincipalInterest)} triệu`);
    expect(a.shortAnswer.join(" ")).toContain(`${roundMillion(actual.monthlyPlannedOutflow)} triệu`);
    expect(a.shortAnswer.join(" ")).toContain("chưa kể chi phí nhà ở");
  });

  it("C04 rounds a solved contribution, without changing the target or its precise detail", () => {
    const a = article("C04");
    if (a.visual.kind !== "savingsCurve") throw new Error("C04 visual changed");
    const six = computeSavingsGoal(a.visual.goal)!;
    const zero = computeSavingsGoal({ ...a.visual.goal, annualRatePercent: 0 })!;
    for (const value of [six.contribution, zero.contribution, six.totalContributed, six.interestEarned]) {
      expect(details("C04")).toContain(formatMoney(value));
    }
    expect(a.shortAnswer.join(" ")).toContain(`${roundMillion(six.contribution)} triệu`);
    expect(a.shortAnswer.join(" ")).toContain(`${roundMillion(zero.contribution)} triệu`);
    expect(a.visualReading).toContain(`${roundMillion(six.totalContributed)} triệu`);
    expect(six.totalContributed + six.interestEarned).toBeCloseTo(500e6, 0);
  });

  it.each(["C07", "C10", "C11"])("%s precise results remain figures produced by its declared chart", (id) => {
    const visual = resolveEducationVisual(article(id).visual, EDUCATION_VISUAL_LABELS);
    if (visual.kind !== "chart") throw new Error(`${id} visual changed`);
    const computed = visual.model.table.rows.flat().filter(isMoneyCell).map((cell) => formatMoney(cell.value));
    if (id === "C07") {
      const spec = article(id).visual;
      if (spec.kind !== "loanTermDebtPaths") throw new Error("C07 visual changed");
      const [short, long] = spec.terms.map((termMonths) => computeLoan({
        amount: spec.amount, annualRatePercent: spec.annualRatePercent, termMonths,
      })!);
      computed.push(formatMoney(long.totalInterest - short.totalInterest));
      computed.push(formatMoney(short.monthlyPrincipalInterest - long.monthlyPrincipalInterest));
    }
    for (const row of detail(id)) {
      // C07's 30-year counterexample is a separate, explicitly labelled run.
      if (row.label.includes("30 năm")) continue;
      expect(computed, `${id}: ${row.label}`).toContain(row.value.replace(" ₫", ""));
    }
  });

  it("C07's rounded threshold still distinguishes a 16 million budget", () => {
    const short = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 240 })!;
    const long = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 300 })!;
    const longest = computeLoan({ amount: 2e9, annualRatePercent: 8.5, termMonths: 360 })!;
    expect(long.monthlyPrincipalInterest).toBeGreaterThan(16e6);
    expect(longest.monthlyPrincipalInterest).toBeLessThan(16e6);
    expect(details("C07")).toContain(formatMoney(longest.monthlyPrincipalInterest));
    expect(article("C07").shortAnswer.join(" ")).toContain(
      `${roundMillion(short.monthlyPrincipalInterest - long.monthlyPrincipalInterest, 2)} triệu`,
    );
    expect(article("C07").shortAnswer.join(" ")).toContain(
      `${roundMillion(long.totalInterest - short.totalInterest)} triệu`,
    );
  });

  it("C09 answers the practical eight-month difference before continuous algebra", () => {
    const answer = article("C09").shortAnswer.join(" ");
    expect(answer).toContain("sớm 8 tháng");
    expect(answer).toContain("kỳ thứ 43 xuống kỳ thứ 35");
    expect(answer).not.toContain("đại số");
    expect(article("C09").sections.flatMap((s) => s.paragraphs).join(" ")).toContain("ước lượng liên tục");
  });

  it("C10 keeps the before-fee qualification beside the rounded saving", () => {
    const answer = article("C10").shortAnswer.join(" ");
    expect(answer).toContain("555,7 triệu");
    expect(answer).toContain("TRƯỚC phí trả nợ trước hạn");
    expect(answer).toContain("53 tháng");
    // Collection cards show only the first paragraph; its saving must carry
    // the fee qualification too, not rely on the full article's second one.
    expect(article("C10").shortAnswer[0]).toContain("trước phí trả nợ trước hạn");
  });

  it("C11 puts payment uncertainty before the equivalent-rate detail", () => {
    expect(article("C11").shortAnswer.join(" ")).toContain("khoản trả hằng tháng có thể thay đổi");
    expect(article("C11").shortAnswer.join(" ")).not.toContain("tương đương");
    expect(article("C11").sections.at(-1)!.heading).toContain("lãi tương đương");
  });

  it("C12 leads with the switch decision and keeps the two break-even measures distinct", () => {
    const a = article("C12");
    if (a.visual.kind !== "refinanceCostPath") throw new Error("C12 visual changed");
    const result = compareRefinance(a.visual.input)!;
    expect(a.shortAnswer[0]).toMatch(/^Đổi khoản vay đáng cân nhắc/);
    expect(a.shortAnswer[0]).toContain("40 triệu phí giả định");
    expect(a.shortAnswer[0]).toContain(`${roundMillion(result.monthlySaving)} triệu`);
    expect(a.shortAnswer[1]).toContain("tháng 14");
    expect(a.shortAnswer[1]).toContain("tháng 18");
    expect(a.shortAnswer[1]).toContain("chưa chứng minh lợi ích kinh tế");
    const current = computeLoan({ amount: a.visual.input.balance,
      annualRatePercent: a.visual.input.currentRatePercent, termMonths: a.visual.input.remainingMonths })!;
    const next = computeLoan({ amount: a.visual.input.balance,
      annualRatePercent: a.visual.input.newRatePercent, termMonths: a.visual.input.newTermMonths })!;
    // Lower rate with the same remaining term lowers payments AND retires
    // principal faster; it is not the stretched-term counterexample below it.
    expect(next.monthlyPrincipalInterest).toBeLessThan(current.monthlyPrincipalInterest);
    expect(next.schedule[0].principal).toBeGreaterThan(current.schedule[0].principal);
    expect(a.sections.flatMap((s) => s.paragraphs).join(" ")).toContain("vừa trả nhẹ hơn vừa giảm gốc nhanh hơn");
  });
});
