// The 2026-09-24 reader-first review of C13–C23, asserted.
//
// WHAT THIS FILE IS FOR. `articles.test.ts` pins C13–C15's prose to their
// engines; C16–C23 had no such pin, and the review found the opposite failure
// there — prose that claimed more than its calculation (eligibility, real
// supply, a contract outcome) and one household quietly described as C01's
// after C01 moved to a different one. So this file checks four things:
//
// 1. Every exact figure the body quotes is the string the article's OWN
//    declared visual input produces, and every rounded opening figure rounds
//    from that same engine value. The rounding is verified, not trusted.
// 2. Scenario identity: C16/C18/C19 declare their 44 triệu household as their
//    own, C01 really is a different household, and each chart draws the
//    scenario its article declares.
// 3. The specific reviewed defects stay fixed, and the qualification that
//    replaced each one sits beside the claim it qualifies.
// 4. Every quoted exercise label exists in the linked tool's own copy.
//
// It deliberately does NOT ban words collection-wide or measure tone. The
// negative checks below are each one reviewed sentence, scoped to its article.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { APPROVED_C01 } from "@/content/education/approved-tool-guides";
import type { EducationArticle } from "@/content/education/types";
import { computeAffordability, type AffordabilityInput } from "@/lib/calc/affordability";
import { computeApr } from "@/lib/calc/apr";
import { computeFloatingLoan } from "@/lib/calc/floating-loan";
import { computeLoan } from "@/lib/calc/loan";
import { computeSavingsGoal } from "@/lib/calc/savings-goal";
import { analyseLoan } from "@/lib/calc/loan-analysis";
import { computeGraceLoan } from "@/lib/calc/grace-loan";
import { formatDecimal, formatMoney, formatPercent } from "@/lib/calc/number";

const byId = (id: string) => {
  const found = EDUCATION_ARTICLES.find((a) => a.planId === id);
  if (!found) throw new Error(`no article ${id}`);
  return found;
};
const REVIEWED = ["C13", "C14", "C15", "C16", "C17", "C18", "C19", "C20", "C21", "C22", "C23"];

/** Body prose: what `articles.test.ts` treats as the article's quoted text. */
const body = (a: EducationArticle) =>
  [...a.sections.flatMap((s) => s.paragraphs), a.visualReading, a.exercise.change].join(" ");
/** Everything a reader can see, for the scoped negative checks. */
const everything = (a: EducationArticle) => JSON.stringify(a);
const opening = (a: EducationArticle) => a.shortAnswer.join(" ");
/** "5,29" for 5.288.086 at two decimals — a figure in triệu as prose writes it. */
const trieu = (value: number, digits: number) => formatDecimal(value / 1e6, digits);
const ty = (value: number, digits: number) => formatDecimal(value / 1e9, digits);

function affordabilityInput(a: EducationArticle): AffordabilityInput {
  if (a.visual.kind !== "affordabilityPrice" && a.visual.kind !== "affordabilityMonthly") {
    throw new Error(`${a.planId} does not draw an affordability figure`);
  }
  return a.visual.input as AffordabilityInput;
}

/**
 * The HOUSEHOLD fields of an affordability input. Rate, term and loan ceiling
 * are each article's own financing assumption, and `studied` is the one field
 * an article varies on purpose; everything else must be the same household.
 */
function household(input: AffordabilityInput, ...studied: (keyof AffordabilityInput)[]) {
  const copy: Partial<AffordabilityInput> = { ...input };
  for (const key of ["annualRatePercent", "termMonths", "assumedMaxLtvPercent", ...studied] as const) {
    delete copy[key];
  }
  return copy;
}

describe("C13–C15 open with rounded figures that round from their engines", () => {
  it("C13 rounds the two equivalent rates and the full-term saving", () => {
    const a = byId("C13");
    if (a.visual.kind !== "aprRateBars") throw new Error("C13 visual");
    const quoteA = computeApr(a.visual.input)!;
    const quoteB = computeApr({ ...a.visual.input, annualRatePercent: 8.8, upfrontFees: 0 })!;
    const text = opening(a);
    expect(text).toContain(`khoảng ${formatPercent(quoteA.aprPercent!, 2)}`); // 8,71%
    expect(text).toContain(`khoảng ${formatPercent(quoteA.payoffAprPercent!, 2)}`); // 8,89%
    expect(text).toContain(`khoảng ${trieu(quoteB.totalCost - quoteA.totalCost, 0)} triệu`); // 62
    // The flip the opening now states in words is still the engine's flip.
    expect(quoteA.aprPercent!).toBeLessThan(quoteB.aprPercent!);
    expect(quoteA.payoffAprPercent!).toBeGreaterThan(quoteB.aprPercent!);
  });

  it("C14 names both payment jumps, and both round from the schedule", () => {
    const a = byId("C14");
    if (a.visual.kind !== "graceLoanPhases") throw new Error("C14 visual");
    const input = a.visual.input;
    const g = computeGraceLoan(input)!;
    const text = opening(a);
    expect(text).toContain("khoản trả tăng HAI lần");
    expect(text).toContain(`tháng ${input.promoMonths + 1}`);
    expect(text).toContain(`tháng ${input.graceMonths + 1}`);
    expect(text).toContain(`khoảng ${trieu(g.lastGracePayment!, 1)} triệu`); // 18,3
    expect(text).toContain(`khoảng ${trieu(g.firstAmortizingPayment, 1)} triệu`); // 21,3
    // The two jumps are distinct events: the first is rate, the second is principal.
    expect(g.schedule[input.promoMonths].principal).toBe(0);
    expect(g.schedule[input.graceMonths].principal).toBeGreaterThan(0);
  });

  it("C15 explains the principal/interest split instead of defending anyone", () => {
    const a = byId("C15");
    if (a.visual.kind !== "loanCostQuarters") throw new Error("C15 visual");
    const an = analyseLoan(a.visual.input)!;
    const text = opening(a);
    expect(text).not.toContain("lỗi của ai");
    expect(text).toContain("Mỗi lần trả nợ gồm hai phần");
    expect(text).toContain(`khoảng ${trieu(an.selected!.cumulativePrincipal, 0)} triệu`); // 237
    expect(text).toContain(`khoảng ${ty(an.selected!.balance, 2)} tỷ`); // 1,76
    expect(text).toContain(`khoảng ${trieu(an.selected!.cumulativeInterest, 0)} triệu`); // 804
    expect(text).toContain(`khoảng ${formatDecimal(an.firstPaymentInterestSharePercent, 0)}%`); // 82%
  });
});

describe("C16–C23 quote their own declared scenarios", () => {
  it("C16: the 44 triệu household's two paths come from one engine", () => {
    const a = byId("C16");
    const noxh = affordabilityInput(a);
    const commercial = { ...noxh, assumedMaxLtvPercent: undefined, annualRatePercent: 8.5, termMonths: 240 };
    const social = computeAffordability(noxh)!;
    const market = computeAffordability(commercial)!;
    const words = body(a);
    expect(words).toContain(formatMoney(social.maxPrice)); // 2.173.913.043
    expect(words).toContain(formatMoney(market.maxPrice)); // 2.499.179.725
    expect(words).toContain(formatMoney(market.maxPrice - social.maxPrice)); // 325.266.682
    expect(words).toContain(formatMoney(social.expectedPrincipalInterest)); // 10.576.172
    expect(words).toContain(
      formatMoney(market.expectedPrincipalInterest - social.expectedPrincipalInterest),
    ); // 7.423.828
    // The counterintuitive claim, as an assertion: cheaper rate, lower price,
    // because the binding limit moved from the payment to the cash.
    expect(social.maxPrice).toBeLessThan(market.maxPrice);
    expect(social.priceBinding).toBe("financing");
    expect(market.priceBinding).toBe("payment");
    const text = opening(a);
    expect(text).toContain(`khoảng ${ty(social.maxPrice, 2)} tỷ`);
    expect(text).toContain(`khoảng ${ty(market.maxPrice, 2)} tỷ`);
    expect(text).toContain(`khoảng ${trieu(social.expectedPrincipalInterest, 1)} triệu`);
  });

  it("C17 and C22: the 30 triệu household's two paths come from one engine", () => {
    const c22 = byId("C22");
    const social = computeAffordability(affordabilityInput(c22))!;
    const c17 = byId("C17");
    const market = computeAffordability(affordabilityInput(c17))!;
    // C17 draws the commercial path, C22 the programme path, on ONE household.
    expect(household(affordabilityInput(c22))).toEqual(household(affordabilityInput(c17)));
    for (const a of [c17, c22]) {
      const words = body(a) + opening(a);
      expect(words, a.planId).toContain(formatMoney(market.maxPrice - social.maxPrice)); // 386.382.544
      expect(words, a.planId).toContain(`khoảng ${ty(market.maxPrice, 2)} tỷ`); // 1,47
      expect(words, a.planId).toContain(`khoảng ${ty(social.maxPrice, 2)} tỷ`); // 1,09
    }
    const net = affordabilityInput(c17).monthlyNetIncome!;
    const commercialShare = formatPercent((market.expectedPrincipalInterest / net) * 100, 1);
    const socialShare = formatPercent((social.expectedPrincipalInterest / net) * 100, 1);
    expect(opening(c17)).toContain(commercialShare); // 36,7%
    expect(opening(c17)).toContain(socialShare); // 17,6%
    expect(body(c17)).toContain(formatMoney(social.expectedPrincipalInterest)); // 5.288.086
    expect(opening(c22)).toContain(`khoảng ${trieu(social.expectedPrincipalInterest, 1)} triệu`); // 5,3
  });

  it("C18: the 3% → 5% → 7% ladder is the 44 triệu household's", () => {
    const a = byId("C18");
    const at = (pct: number) => computeAffordability({ ...affordabilityInput(a), purchaseCostPercent: pct })!;
    const words = body(a);
    for (const pct of [3, 5, 7]) {
      expect(words, `${pct}%`).toContain(formatMoney(at(pct).maxPrice));
    }
    expect(words).toContain(formatMoney(at(5).purchaseCosts)); // 122.578.815
    expect(words).toContain(formatMoney(at(3).purchaseCosts)); // 74.975.392
    // The 2 tỷ transaction arithmetic: 400 triệu down payment plus a DECLARED
    // hypothetical 50 triệu other-cost budget — not 2% + 0,5% of 2 tỷ, because
    // neither fee is levied on the VAT-inclusive price (see the C18 comment).
    expect(words).toContain("498 đến 546 triệu");
    expect(words).toContain("24,9% đến 27,3%");
    expect(2e9 * 0.2 + 50e6).toBe(450e6);
    expect(450e6 + 1.6e9 * 0.03).toBe(498e6);
    expect(450e6 + 1.6e9 * 0.06).toBe(546e6);
    // 2,5% other costs + 3% / 6% premium are the 4,9% / 7,3% the body rounds
    // to the chart's 5% and 7%.
    expect(((50e6 + 48e6) / 2e9) * 100).toBeCloseTo(4.9, 9);
    expect(((50e6 + 96e6) / 2e9) * 100).toBeCloseTo(7.3, 9);
  });

  it("C19: each management-fee level's price impact is the engine's", () => {
    const a = byId("C19");
    const base = { ...affordabilityInput(a), essentialExpenses: 18_000_000 };
    const without = computeAffordability(base)!;
    const words = body(a);
    for (const fee of [616_000, 1_270_500, 2_387_000]) {
      const withFee = computeAffordability({ ...base, essentialExpenses: 18_000_000 + fee })!;
      expect(words, `${fee}`).toContain(formatMoney(withFee.maxPrice));
      expect(words, `${fee}`).toContain(formatMoney(without.maxPrice - withFee.maxPrice));
    }
    // The three fees are declared ALL-IN hypotheticals, not band × 1,1 VAT:
    // the sources do not establish a blanket VAT treatment. The band's own
    // endpoints on 70 m² are the only derived figures the body quotes.
    expect(body(a)).toContain(formatMoney(70 * 1_200)); // 84.000
    expect(body(a)).toContain(formatMoney(70 * 16_500)); // 1.155.000
    const low = computeAffordability({ ...base, essentialExpenses: 18_616_000 })!;
    expect(opening(a)).toContain(`khoảng ${trieu(without.maxPrice - low.maxPrice, 0)} triệu`); // 69
  });

  it("C20: the months and the required contribution are the savings engine's", () => {
    const a = byId("C20");
    if (a.visual.kind !== "savingsCurve") throw new Error("C20 visual");
    const goal = a.visual.goal;
    const months = computeSavingsGoal(goal)!;
    const needed = computeSavingsGoal({
      mode: "contribution",
      initial: goal.initial,
      target: goal.target,
      months: 36,
      annualRatePercent: goal.annualRatePercent,
    })!;
    const words = body(a);
    expect(words).toContain(formatDecimal(months.months, 2)); // 27,35
    expect(words).toContain(formatMoney(needed.contribution)); // 1.165.084
    expect(opening(a)).toContain(`kỳ thứ ${Math.ceil(months.months)}`);
    expect(opening(a)).toContain(`khoảng ${trieu(needed.contribution, 2)} triệu`); // 1,17
    expect(needed.contribution).toBeLessThan(goal.contribution!);
  });

  it("C21: the subsidised schedule is the mortgage engine's", () => {
    const a = byId("C21");
    if (a.visual.kind !== "loanColumns") throw new Error("C21 visual");
    const loan = computeLoan(a.visual.loan)!;
    const commercial = computeLoan({ ...a.visual.loan, annualRatePercent: 8.5 })!;
    const words = body(a);
    expect(words).toContain(formatMoney(loan.monthlyPrincipalInterest)); // 5.288.086
    expect(words).toContain(formatMoney(loan.totalInterest)); // 716.860.654
    expect(words).toContain(formatMoney(commercial.totalInterest)); // 1.231.027.174
    expect(words).toContain(formatMoney(commercial.totalInterest - loan.totalInterest)); // 514.166.520
    expect(words).toContain(formatMoney(loan.schedule[59].balance)); // 775.093.281
    const crossover = loan.schedule.findIndex((row) => row.principal > row.interest) + 1;
    expect(words).toContain(`tháng ${crossover}`); // 147
    const text = opening(a);
    expect(text).toContain(`khoảng ${trieu(loan.monthlyPrincipalInterest, 2)} triệu`); // 5,29
    expect(text).toContain(`khoảng ${trieu(loan.totalInterest, 0)} triệu`); // 717
    expect(text).toContain(`khoảng ${ty(commercial.totalInterest, 2)} tỷ`); // 1,23
    // REMOVED CLAIM, guarded: the final instalment is NOT meaningfully smaller
    // on this loan, so the article must not say it is.
    expect(Math.abs(loan.schedule.at(-1)!.payment - loan.monthlyPrincipalInterest)).toBeLessThan(1);
    expect(everything(a)).not.toContain("Tháng cuối cùng lại nhỏ hơn");
  });

  it("C23: the shortfall is the floating engine's, on the declared rates", () => {
    const a = byId("C23");
    if (a.visual.kind !== "floatingTimeline") throw new Error("C23 visual");
    const v = a.visual;
    const f = computeFloatingLoan({
      amount: v.amount,
      phases: [
        { months: v.promoMonths, annualRatePercent: v.promoRatePercent },
        { months: v.termMonths - v.promoMonths, annualRatePercent: v.postRatePercent },
      ],
    })!;
    const words = body(a);
    expect(words).toContain(formatMoney(f.firstPayment)); // 10.211.210
    expect(words).toContain(formatMoney(f.highestPayment)); // 12.979.188
    expect(words).toContain(formatMoney(f.highestPayment - v.monthlyBudget!)); // 1.979.188
    const text = opening(a);
    expect(text).toContain(`khoảng ${trieu(f.firstPayment, 1)} triệu`); // 10,2
    expect(text).toContain(`khoảng ${trieu(f.highestPayment, 0)} triệu`); // 13
    expect(text).toContain(`khoảng ${trieu(f.highestPayment - v.monthlyBudget!, 0)} triệu`); // 2
  });
});

describe("C19–C23 open with rounded values, keeping exact ones below", () => {
  // A full-precision đồng figure is 1.234.567 or longer. The opening is where
  // the review found them stacked; the household table and body keep them.
  const EXACT = /\d{1,3}(?:\.\d{3}){2,}/;
  it.each(REVIEWED.map((id) => [id]))("%s's short answer has no exact đồng figure", (id) => {
    for (const paragraph of byId(id).shortAnswer) {
      expect(paragraph, `${id}: "${paragraph.match(EXACT)?.[0]}"`).not.toMatch(EXACT);
    }
  });
});

describe("one household per scenario, and it is named", () => {
  const c01 = APPROVED_C01 as EducationArticle;
  const c01Input = affordabilityInput(c01);
  const c16Input = affordabilityInput(byId("C16"));

  it("C01 really is a different household from C16's", () => {
    // If C01 ever returns to 44 triệu, the "different example" wording below
    // becomes false and this goes red first.
    expect(c16Input.monthlyNetIncome).toBe(44_000_000);
    expect(c01Input.monthlyNetIncome).not.toBe(c16Input.monthlyNetIncome);
  });

  it("C16, C18 and C19 say so, citing C01's actual figure", () => {
    const c01Net = `${formatDecimal(c01Input.monthlyNetIncome! / 1e6, 0)} triệu`;
    for (const id of ["C16", "C18", "C19"]) {
      const a = byId(id);
      const text = everything(a);
      expect(text, id).toContain("44 triệu");
      expect(text, id).toContain(c01Net);
      expect(text, id).not.toContain("Có 600 triệu, nên tìm nhà trong tầm giá nào?");
      expect(text, id).not.toContain("hộ giả lập của bài C01");
      expect(text, id).not.toContain("Hộ 50 triệu ở bài C01");
    }
    expect(byId("C16").household.note).not.toContain("đúng hộ giả lập ở bài C01");
  });

  it("C18 and C19 draw C16's household, changing only the field they study", () => {
    const c18 = affordabilityInput(byId("C18"));
    const c19 = affordabilityInput(byId("C19"));
    expect(household(c18, "purchaseCostPercent")).toEqual(household(c16Input, "purchaseCostPercent"));
    expect(household(c19, "essentialExpenses")).toEqual(household(c16Input, "essentialExpenses"));
    expect(c18.purchaseCostPercent).toBe(5);
    expect(c19.essentialExpenses).toBe(c16Input.essentialExpenses! + 616_000);
  });

  it("C21's loan is the 30 triệu household's programme loan, named correctly", () => {
    const a = byId("C21");
    if (a.visual.kind !== "loanColumns") throw new Error("C21 visual");
    const social = computeAffordability(affordabilityInput(byId("C22")))!;
    expect(a.visual.loan.amount).toBe(Math.round(social.maxLoan));
    expect(a.household.note).toContain("Thu nhập 30 triệu/tháng, mua nhà được không?");
  });
});

describe("the reviewed claims stay corrected", () => {
  it("C17/C22 claim no real supply, price or availability", () => {
    for (const id of ["C17", "C22"]) {
      const text = everything(byId(id));
      expect(text, id).not.toContain("nguồn cung thật");
      expect(text, id).not.toContain("đang mở bán");
      expect(text, id).not.toContain("khá xa trung tâm");
      expect(text, id).not.toContain("quan sát chung");
      expect(text, id).toContain("không có dữ liệu về giá hay nguồn cung");
    }
    expect(opening(byId("C17"))).not.toMatch(/^Được,/);
    expect(everything(byId("C22"))).not.toContain("Cách so sai");
    expect(everything(byId("C22"))).not.toContain("Cách so đúng");
  });

  it("C20 separates reaching the assumed cash from being ready to buy", () => {
    const a = byId("C20");
    const text = everything(a);
    expect(text).not.toContain("không còn phải chờ");
    expect(text).not.toContain("đúng 250 triệu");
    // The approximation is stated where the rounded price is used.
    const first = a.shortAnswer[0];
    expect(first).toContain("khoảng 1,09 tỷ");
    expect(first).toContain("khoảng 250 triệu");
    expect(first).toContain("chưa có nghĩa là hộ đủ điều kiện");
    // 23% of the ROUNDED price is not 250 triệu; 23% of the engine price is.
    expect(Math.abs(1.09e9 * 0.23 - 250e6)).toBeGreaterThan(0);
    const social = computeAffordability(affordabilityInput(byId("C22")))!;
    expect(social.maxPrice * 0.23).toBeCloseTo(250e6, 3);
  });

  it("C23 presents the reset as a scenario, with the shortfall beside its rate", () => {
    const a = byId("C23");
    const text = everything(a);
    expect(text).not.toContain("theo đúng hợp đồng");
    expect(text).not.toContain("hỏng theo đúng");
    expect(text).not.toContain("cách duy nhất");
    const shortfall = a.shortAnswer.find((p) => p.includes("vượt ngân sách"))!;
    expect(shortfall).toBeDefined();
    expect(shortfall).toContain("trong kịch bản này");
    expect(shortfall).toContain("11%");
    expect(a.shortAnswer.join(" ")).toContain("bài không dự báo");
  });

  it("C16 anchors legal figures to a named, dated instrument", () => {
    const a = byId("C16");
    const prose = [...a.shortAnswer, ...a.sections.flatMap((s) => s.paragraphs)];
    for (const paragraph of prose.filter((p) => /25 triệu|50 triệu đồng|35 triệu/.test(p))) {
      expect(paragraph).toMatch(/Nghị định 136\/2026\/NĐ-CP|07\/04\/2026/);
    }
    expect(everything(a)).not.toContain("Hà Nội áp dụng 4,8%");
    expect(everything(a)).toContain("Nghị định 54/2026/NĐ-CP");
    // Province adjustment of the ceiling is acknowledged beside the ceiling.
    expect(a.shortAnswer[0]).toContain("hệ số điều chỉnh");
    expect(a.sources.items.some((s) => s.url.includes("24-vbhn-bxd"))).toBe(true);
    // The VBSP route and the ceiling-not-guarantee distinction are declared.
    expect(a.household.note).toContain("Ngân hàng Chính sách xã hội");
    expect(a.household.note).toContain("là trần, không phải mức chắc chắn được vay");
  });

  it("C16/C17/C20/C22 present eligibility as a non-exhaustive check, not a closed list", () => {
    // The reviewed defect: a closed "ba nhóm" checklist that omitted the
    // eligible beneficiary categories and made prior social-housing rental a
    // universal disqualifier. Only the income ceiling is a calculation here.
    for (const id of ["C16", "C17", "C20", "C22"]) {
      const text = everything(byId(id));
      for (const phrase of ["ba nhóm", "hai trong ba", "Hai trong ba", "ba điều kiện", "hai điều kiện còn lại"]) {
        expect(text, `${id}: "${phrase}"`).not.toContain(phrase);
      }
      expect(text, id).toContain("đối tượng");
    }
    expect(everything(byId("C16"))).not.toContain("chưa từng được mua, thuê hay thuê mua");
    expect(everything(byId("C16"))).toContain("Danh sách này không đầy đủ");
  });

  it("C18 cites the current insurance rule and the right housing-law article", () => {
    const a = byId("C18");
    const text = everything(a);
    expect(text).toContain("khoản 5 Điều 15 Luật Các tổ chức tín dụng 2024");
    expect(text).toContain("Điều 153");
    expect(text).not.toContain("0,1–0,2%");
    expect(a.sources.items.some((s) => s.url.includes("toan-van-luat-cac-to-chuc-tin-dung"))).toBe(true);
  });

  it("C18 states each fee's real base and keeps its scenario costs hypothetical", () => {
    const a = byId("C18");
    const text = everything(a);
    expect(text).toContain("giá căn hộ chưa gồm thuế giá trị gia tăng");
    expect(text).toContain("giá tính lệ phí trước bạ");
    expect(text).toContain("để không cộng hai lần");
    expect(text).toContain("ngân sách giả định");
    expect(text).toContain("Nghị định 105/2025/NĐ-CP");
    for (const phrase of ["3–6%", "Thông tư 39", "thường bị trừ", "tiền mặt tối thiểu", "luatvietnam.vn"]) {
      expect(text, phrase).not.toContain(phrase);
    }
  });

  it("C19 treats the band as a reference and its fees as all-in assumptions", () => {
    const text = everything(byId("C19"));
    expect(text).not.toContain("14.500");
    expect(text).not.toContain("31.000");
    expect(text).not.toContain("10% trên phí quản lý");
    expect(text).not.toContain("TP.HCM");
    expect(text).not.toContain("92.400");
    expect(text).toContain("không thuộc phạm vi của khung");
    expect(text).toContain("ba mức GIẢ ĐỊNH đã tính trọn");
  });

  it("C21 declares its monthly annuity schedule illustrative and drops the band figures", () => {
    const a = byId("C21");
    expect(a.household.note).toContain("mô hình trả góp đều hằng tháng để minh họa");
    expect(a.visualReading).toContain("không phải lịch trả của ngân hàng");
    expect(everything(a)).not.toContain("92.400");
    expect(everything(a)).not.toContain("khung giá Hà Nội");
  });

  it.each(REVIEWED.map((id) => [id]))("%s names other articles by title, not internal ID", (id) => {
    // planId, slug and nextSlugs are routing data, not copy a reader sees.
    const routing = new Set(["planId", "slug", "nextSlugs"]);
    const reader = Object.entries(byId(id)).filter(([key]) => !routing.has(key));
    expect(JSON.stringify(reader)).not.toMatch(/\bC\d{2}\b/);
  });
});

describe("provenance, limits and exercise labels", () => {
  it.each(REVIEWED.map((id) => [id]))("%s has concise AI provenance without a draft label", (id) => {
    const a = byId(id);
    expect(a.provenance).toContain("hỗ trợ AI");
    expect(a.provenance).not.toMatch(/bản nháp/i);
    expect(a.provenance).toMatch(/chưa được .*thẩm định/);
    expect(a.provenance.length).toBeLessThan(400);
  });

  it.each(REVIEWED.map((id) => [id]))("%s's limits heading is an action", (id) => {
    const a = byId(id);
    expect(a.limits.title).not.toBe("Bài này không trả lời được gì");
    expect(a.limits.items.length).toBeGreaterThanOrEqual(3);
  });

  // Each tool's copy lives in its own content module; the label must be there.
  const COPY: Record<string, string[]> = {
    apr: ["apr.ts", "apr-advanced.ts"],
    "chi-tra-lai": ["interest-only.ts"],
    "phan-tich-khoan-vay": ["loan-analysis.ts", "loan.ts"],
    "kha-nang-mua-nha": ["affordability.ts"],
    "nha-o-xa-hoi": ["affordability.ts", "social-housing.ts"],
    "muc-tieu-tiet-kiem": ["savings-goal.ts"],
    "vay-mua-nha": ["loan.ts"],
    "lai-suat-tha-noi": ["floating-loan.ts"],
  };
  it.each(REVIEWED.map((id) => [id]))("%s quotes only labels its tool really has", (id) => {
    const a = byId(id);
    const files = COPY[a.exercise.toolSlug];
    expect(files, a.exercise.toolSlug).toBeDefined();
    const copy = files
      .map((f) => readFileSync(path.join(process.cwd(), "content/calculators", f), "utf8"))
      .join("\n");
    const quoted = [...a.exercise.steps, a.exercise.change, a.exercise.check]
      .flatMap((text) => [...text.matchAll(/“([^”]+)”/g)].map((m) => m[1]))
      // A label carrying a month placeholder is quoted with an ellipsis.
      .map((label) => label.replace("…", "{n}"));
    for (const label of quoted) {
      expect(copy.includes(label), `${id}: “${label}” is not in ${files.join(", ")}`).toBe(true);
    }
  });
});
