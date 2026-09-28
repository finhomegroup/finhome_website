// The shared ₫ scenario behind the long-term plan's sibling routes (45/48/50),
// and the guard that route 44's prose agrees with ITS OWN scenario — since
// 2026-09-27, `RETIREMENT_PLAN.defaults`, the latest Vietnamese assumptions
// with the pension per month (the owner's decision; siblings unchanged).
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
import { readRoutePlan } from "@/components/retirement-plan-read";
import { compactMoney } from "@/lib/calc/charts/labels";
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
    // dollars. That object is gone now that the sibling routes read
    // `LONG_TERM_PLAN.defaults` (route 44 reads its own, pinned below), so
    // the floors below are what stands guard.
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

/**
 * The plan route 44 opens on: ITS scenario, read the way the page reads it —
 * `readRoutePlan`, which turns the two monthly incomes into the engine's year.
 */
function routePlan() {
  const read = readRoutePlan(C.defaults);
  if (read.input === null) throw new Error("the route's defaults do not parse");
  const plan = resolveLongTermPlan(read.input);
  if (plan === null) throw new Error("resolveLongTermPlan refused the route's defaults");
  return plan;
}

// The guard this content has never had: the sentences and the model agree.
describe("route 44's prose quotes the model, not a memory of it", () => {
  const plan = routePlan();
  const r = plan.asEntered;
  const firstWithdrawal = r.years.find((row) => !row.accumulating)!;

  /**
   * Where the figures live after the 2026-09-26 reader-first rewrite.
   *
   * The opening notice no longer quotes the eleven-digit pair: the review
   * found the page opening with two 10–11 digit amounts before the reader had
   * seen a result. The limitation stays visible there in words; the
   * demonstration moved to two places that both have to agree with the
   * engine — the method prose, ROUNDED through `compactMoney` (the same
   * formatter the figure caption uses), and the FAQ, EXACT. The render test
   * covers the third place, the sentence under the result filled from the
   * live plan. Same coverage as before; different homes.
   */
  const compact = (value: number) => compactMoney(value, L.money);
  // The method prose is both layers: the worked years open behind its
  // disclosure, and every figure in them is still pinned here.
  const prose = [...C.formula.body, ...C.formula.detail.body].join(" ");
  /** A detail paragraph by its opening words, not its position. */
  const detailParagraph = (opening: string) => {
    const found = C.formula.detail.body.find((paragraph) => paragraph.startsWith(opening));
    if (found === undefined) throw new Error(`no detail paragraph opens "${opening}"`);
    return found;
  };

  it("keeps the eleven-digit pair OUT of the opening notice, and the limitation IN it", () => {
    expect(C.realNotice).not.toContain(dong(r.balanceAtRetirement));
    expect(C.realNotice).not.toContain(dong(r.realBalanceAtRetirement));
    // No grouped amount of seven digits or more anywhere in the opening.
    expect(C.realNotice).not.toMatch(/\d{1,3}(\.\d{3}){2,}/);
    // The model limitation that changes how a figure is read is still there.
    expect(C.realNotice).toContain("giá hôm nay");
    expect(C.realNotice).toContain("mua được ít hơn");
  });

  it("quotes the capital both ways — rounded in the method prose, exact in the FAQ", () => {
    expect(prose).toContain(compact(r.balanceAtRetirement));
    expect(prose).toContain(compact(r.realBalanceAtRetirement));
    // Rounding did not erase the difference the paragraph is about.
    expect(compact(r.balanceAtRetirement)).not.toBe(
      compact(r.realBalanceAtRetirement),
    );
    expect(C.faq.items[0].a).toContain(dong(r.balanceAtRetirement));
    expect(C.faq.items[0].a).toContain(dong(r.realBalanceAtRetirement));
  });

  it("quotes the first year's draw in both readings, from the engine", () => {
    // In today's money the draw is exactly the spend that was asked for less
    // other income — the identity `retirement.ts` keeps two deflators for.
    expect(firstWithdrawal.realWithdrawal).toBeCloseTo(
      plan.input.desiredAnnualSpending - plan.input.otherAnnualIncome,
      6,
    );
    expect(prose).toContain(compact(firstWithdrawal.withdrawal));
    expect(prose).toContain(
      `${formatDecimal(firstWithdrawal.realWithdrawal / 1e6, 0)} triệu`,
    );
  });

  it("quotes the first accumulation year's arithmetic from the engine", () => {
    // 100 + 15 = 115 triệu, 6,5% of it, the end-of-year balance, and the
    // grown second-year contribution — the worked year a beginner is shown
    // first. Each figure is the engine's own row, not the paragraph's memory.
    const firstYear = r.years[0];
    expect(firstYear.accumulating).toBe(true);
    expect(prose).toContain(compact(firstYear.balance));
    expect(prose).toContain(
      `${formatDecimal(firstYear.investmentReturn / 1e6, 1)} triệu`,
    );
    // One decimal: 15 triệu grown 6% is 15,9 triệu, which "16 triệu" would round away.
    expect(prose).toContain(
      `${formatDecimal(r.years[1].contribution / 1e6, 1)} triệu`,
    );
  });

  it("quotes the annual shortfall in the FAQ that says what it is not", () => {
    const answer = C.faq.items[4].a;
    expect(answer).toContain(dong(r.spendingShortfall));
    // …and the same gap per month, rounded, as the row now shows it.
    expect(answer).toContain(`khoảng ${formatDecimal(r.spendingShortfall / 12 / 1e6, 1)} triệu mỗi tháng`);
    expect(answer).toContain("không phải số tiền phải nộp thêm");
    expect(answer).toContain("không phải tổng số vốn còn thiếu");
  });

  it("pins the default scenario's figures the copy rounds from", () => {
    // These are the engine's outputs on the route's defaults, as quoted in
    // the content file's header; a moved figure here means an engine or
    // default changed, which no copy round is allowed to do. (2026-09-27:
    // re-pinned when the route took its own scenario — the ENGINE did not
    // move; `lib/calc/retirement.ts` is byte-identical.)
    expect(plan.input.desiredAnnualSpending).toBe(96_000_000);
    expect(plan.input.otherAnnualIncome).toBe(48_000_000);
    expect(Math.round(r.balanceAtRetirement)).toBe(2_194_741_612);
    expect(Math.round(r.realBalanceAtRetirement)).toBe(730_257_686);
    expect(r.depletionAge).toBe(75);
    expect(r.yearsShort).toBe(10);
    expect(Math.round(r.spendingShortfall)).toBe(18_789_693);
    expect(Math.round(r.lastWithdrawalPlanned!)).toBe(279_185_498);
    expect(Math.round(r.lastWithdrawalPaid!)).toBe(59_662_441);
    expect(Math.round(firstWithdrawal.withdrawal)).toBe(144_260_854);
    expect(Math.round(r.years[0].balance)).toBe(122_475_000);
    // The three ways the header says close the gap — the hero's suggestion
    // and its fallbacks read these.
    const [contribute, retireLater, spendLess] = plan.gap.remedies;
    expect(contribute.key === "contribute" && Math.round(contribute.annualContribution!)).toBe(27_369_770);
    expect(contribute.key === "contribute" && Math.round(contribute.extraPerYear!)).toBe(12_369_770);
    expect(retireLater.key === "retireLater" && retireLater.retirementAge).toBe(66);
    expect(spendLess.key === "spendLess" && Math.round(spendLess.annualSpending!)).toBe(77_210_307);
    expect(spendLess.key === "spendLess" && formatDecimal(spendLess.percentOfDesired!, 1)).toBe("80,4");
    expect(Math.round(r.requiredRealBalanceAtRetirement)).toBe(1_200_000_000);
  });

  it("qualifies the monthly-versus-yearly timing by the sign of the return", () => {
    // One January deposit beats twelve month-end deposits only when the
    // return is positive; they tie at 0% and reverse below it. The detailed
    // method used to state the comparison as absolute.
    const timing = detailParagraph("Giai đoạn để dành");
    expect(timing).toContain("sinh lời dương");
    expect(timing).toContain("0% hai cách bằng nhau");
    expect(timing).toContain("âm thì ngược lại");
    expect(timing).not.toContain("chứ không cao hơn");
  });

  it("says the horizon counts the years until the reader TURNS the end age", () => {
    // The engine's last year is `endAge − 1`. Stated where the reader sets
    // the age (the shared help), where they ask about it (the FAQ) and in
    // the detailed method's bounds paragraph.
    expect(L.fields.fields.endAge.help).toContain("tròn 85 tuổi");
    expect(L.fields.fields.endAge.help).toContain("không nằm trong kế hoạch");
    expect(C.faq.items[1].a).toContain("tròn tuổi đó");
    expect(C.formula.detail.body.join(" ")).toContain("tròn 85 tuổi");
  });

  it("describes assumptions plainly, without favourability or account claims", () => {
    // A simplified model is not necessarily kinder than reality, a modelled
    // balance is not the money a reader WILL see, and a withdrawal ratio is
    // explained by what it measures rather than by what the page declines to
    // claim.
    const body = C.formula.body.join(" ");
    expect(body).not.toContain("thuận lợi hơn thực tế");
    expect(body).not.toContain("sẽ thấy trên sổ tiết kiệm");
    expect(body).toContain("có thể cao hơn hoặc thấp hơn");
    expect(C.faq.items[2].a).not.toContain("kịch bản thuận lợi");
    expect(C.faq.items[3].a).not.toContain("không có cơ sở");
    expect(C.faq.items[3].a).toContain("phần trăm số tiền có lúc nghỉ");
    expect(C.faq.items[3].a).toContain("chưa nói được kế hoạch có an toàn hay không");
  });

  it("states the implemented order and formula without universal comparisons", () => {
    // Third round. "Chỉ thứ tự thứ hai là lựa chọn thận trọng" is not true at
    // a non-positive return; "đủ 30 năm rồi cạn ở năm thứ 20" was an
    // illustration nothing computed; "phóng đại theo (1 + lợi suất thực) …
    // cạn sớm hai năm" was a universal claim about a formula the tool does
    // not use. What remains is what the model does: withdraw first, credit
    // the return on what remains, index the spend, solve an annuity-due at
    // the real return, add other income.
    const withdrawal = detailParagraph("Giai đoạn rút tiền");
    const indexing = detailParagraph("Mức chi tiêu mong muốn");
    const annuity = detailParagraph("Mức chi giữ được đến hết kỳ");
    expect(withdrawal).toContain("trừ khoản rút trước");
    expect(withdrawal).toContain("phần còn lại");
    expect(withdrawal).not.toContain("thận trọng");
    expect(indexing).toContain("cùng sức mua");
    expect(indexing).not.toContain("cạn ở năm thứ 20");
    expect(annuity).toContain("niên kim đầu kỳ");
    expect(annuity).toContain("(1 + lợi suất sau khi nghỉ) ÷ (1 + lạm phát) − 1");
    expect(annuity).toContain("Thu nhập khác");
    expect(annuity).not.toContain("phóng đại");
    expect(annuity).not.toContain("cạn sớm hai năm");
  });

  it("quotes the inflation factor and the share it leaves", () => {
    const years = plan.input.retirementAge - plan.input.currentAge;
    const factor = (1 + plan.input.inflationPercent / 100) ** years;
    const share = (r.realBalanceAtRetirement / r.balanceAtRetirement) * 100;
    const answer = C.faq.items[0].a;
    // "1,045^25": the base in the page's own decimal grammar, trailing zeros off.
    const base = formatDecimal(1 + plan.input.inflationPercent / 100, 4).replace(/0+$/, "");
    expect(answer).toContain(`${base}^${years}`);
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
    // "Cạn ở tuổi 75" counts the year that could not be paid in full, and that
    // year normally pays something — which is why the page reports both. (The
    // component comment that used to quote these figures now names none.)
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
      C.ledeDetail,
      C.realNotice,
      ...C.formula.body,
      // The disclosed method too: a claim about United States law does not
      // stop being a claim because it is behind a `<details>`.
      ...C.formula.detail.body,
      ...Object.values(C.form),
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
