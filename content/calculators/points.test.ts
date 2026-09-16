import { describe, it, expect } from "vitest";
import { formatMoney, parseCount, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computePoints, type PointsInput } from "@/lib/calc/points";
import { POINTS as C } from "@/content/calculators/points";
import { TOOL_NEXT_STEPS } from "@/content/calculators/next-steps";
import { READING_DISPOSITIONS } from "@/content/calculators/plan-disposition";

/**
 * The module-at-shipped-defaults test docs §6 calls the highest-value
 * substitute for the coverage a green suite does not have. Original row 10.
 * This file did not exist before.
 *
 * Row 10 is the one unambiguously question-first row of the 36, and the only
 * one filed `context` — decision-first copy with visible assumptions. The
 * assumption most worth making visible was in the collapsed FAQ: whether this
 * offer structure exists for a Vietnamese reader at all. That is what moved.
 */

const F = C.form;

/** The component's own parse and wiring, reproduced — docs §6. */
function shippedInput(): PointsInput {
  return {
    amount: parseMoney(F.defaultAmount)!,
    // Whole counts of months, both of them: `parseCount`, per docs §4. Both
    // were `parseDecimal` behind a `Number.isInteger` guard, which is the
    // unreachable arrangement `parseCount`'s own docstring describes.
    termMonths: parseCount(F.defaultTerm)!,
    baseRatePercent: parseDecimal(F.defaultBaseRate)!,
    pointsPercent: parseDecimal(F.defaultPoints)!,
    rateReductionPoints: parseDecimal(F.defaultReduction)!,
    holdMonths: parseCount(F.defaultHold)!,
  };
}

function run(overrides: Partial<PointsInput> = {}) {
  const result = computePoints({ ...shippedInput(), ...overrides });
  expect(result).not.toBeNull();
  return result!;
}

describe("diem-chiet-khau at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shippedInput()).toEqual({
      amount: 2_000_000_000,
      termMonths: 240,
      baseRatePercent: 8.5,
      pointsPercent: 1,
      rateReductionPoints: 0.25,
      holdMonths: 60,
    });
  });

  it("rejects a grouped month count rather than reading it as one month", () => {
    // The defect `parseCount` exists to make reachable, on two fields here.
    // `parseDecimal("1.000")` is 1, and 1 is an integer, so the field's own
    // "số nguyên tháng" error never fired and the page priced a one-month
    // hold — which on this page decides the whole verdict.
    expect(parseDecimal("1.000")).toBe(1);
    expect(parseCount("1.000")).toBeNull();
    expect(parseCount("240")).toBe(240);
    expect(parseCount("60,5")).toBeNull();
  });

  it("reproduces every figure the provenance header records", () => {
    const r = run();
    expect(formatMoney(r.cost)).toBe("20.000.000");
    expect(formatMoney(r.basePayment)).toBe("17.356.465");
    expect(formatMoney(r.buydownPayment)).toBe("17.041.313");
    expect(formatMoney(r.monthlySaving)).toBe("315.152");
    expect(r.breakEvenMonths).toBe(64);
    expect(formatMoney(r.lifetimeSaving)).toBe("55.636.389");
  });

  it("keeps the 49-vs-64 gap that is the page's editorial point", () => {
    // The naive break-even is 64 months; the true position turns positive in
    // month 49. Derived here rather than transcribed, by scanning for the
    // first month at which the points are ahead.
    const r = run();
    expect(r.breakEvenMonths).toBe(64);
    let first: number | null = null;
    for (let month = 1; month <= 240; month += 1) {
      if (run({ holdMonths: month }).holdPosition > 0) {
        first = month;
        break;
      }
    }
    expect(first).toBe(49);
    // And the naive figure is LATE, which is the direction that matters: it
    // tells a reader to walk away from an offer that was already paying off.
    expect(r.breakEvenMonths!).toBeGreaterThan(first!);
    // The month-60 figures the prose quotes.
    expect(formatMoney(r.buydownHoldCost)).toBe("2.799.061.004");
    expect(formatMoney(r.baseHoldCost)).toBe("2.803.931.542");
    expect(formatMoney(r.holdPosition)).toBe("4.870.538");
    expect(r.worthIt).toBe(true);
  });

  it("quotes the model's own figures in the copy", () => {
    const r = run();
    const copy = [
      C.lede,
      C.scopeNotice,
      C.methodNotice,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
    ].join(" ");
    for (const figure of [
      formatMoney(r.buydownHoldCost),
      formatMoney(r.baseHoldCost),
      formatMoney(r.holdPosition),
      formatMoney(r.lifetimeSaving),
    ]) {
      expect(copy, `copy no longer quotes ${figure}`).toContain(figure);
    }
    expect(copy).toContain("64");
    expect(copy).toContain("49");
  });
});

describe("diem-chiet-khau — which assumption is visible", () => {
  it("puts the scope question in the VISIBLE notice", () => {
    // It was FAQ item 5 only. Whether this offer structure exists for the
    // reader decides whether the tool applies at all, and the shell's own
    // criterion for the visible slot is the thing a user must know BEFORE
    // they read a figure off the tool.
    expect(C.scopeNotice).toContain("hầu như không có sản phẩm");
    expect(C.scopeNotice).toContain("bảo hiểm nhân thọ");
    expect(C.scopeNotice).toContain("đừng coi cấu trúc này là mặc định");
  });

  it("keeps the methodology, in the disclosure rather than deleted", () => {
    // MOVED, not dropped: the 49-vs-64 argument is still above the
    // calculator behind `noticeDetail`, and still in the prose and the FAQ.
    // Asserting the move is the point — a promotion that quietly loses the
    // demoted string is the failure mode.
    expect(C.methodNotice).toContain("64 tháng");
    expect(C.methodNotice).toContain("tháng 49");
    expect(C.methodNoticeTitle.length).toBeGreaterThan(10);
    expect(C.formula.body[1]).toContain("bỏ qua dư nợ");
    expect(
      C.faq.items.some((item) => item.q.includes("vị thế thực")),
    ).toBe(true);
  });

  it("keeps the visible notice short enough to stay above the form", () => {
    // docs §3: a long notice pushed the form off the first screens on a
    // phone. The detail may be long; the visible one may not.
    expect(C.scopeNotice.length).toBeLessThan(420);
  });

  it("links the alternative it tells the reader to compare", () => {
    // FAQ item 4 tells the reader to run the loan tool twice and had no link
    // anywhere. Rows 10 and 13 are the only two P4 rows `next-steps.test.ts`
    // permits an entry for, and `vay-mua-nha` is P1, which it also requires.
    const steps = TOOL_NEXT_STEPS["diem-chiet-khau"];
    expect(steps, "row 10 has no next steps").toBeDefined();
    expect(steps.tools.map((t) => t.slug)).toContain("vay-mua-nha");
    expect(steps.tools.map((t) => t.slug)).toContain("so-sanh-khoan-vay");
    expect(steps.tools[0].why).toContain("Chạy hai lần");
  });

  it("stays `context` — decision-first copy, not declared emphasis", () => {
    // `context` means visible assumptions, explicitly NOT emphasis
    // (`plan-disposition.ts`'s own comment). The notice swap above IS that
    // treatment; no phrase list is declared here.
    expect(READING_DISPOSITIONS["diem-chiet-khau"]).toBe("context");
    expect("emphasis" in C.formula).toBe(false);
  });

  it("quotes no unverified fee range", () => {
    const copy = [
      C.lede,
      C.scopeNotice,
      C.methodNotice,
      ...C.formula.body,
      ...C.faq.items.map((item) => item.a),
    ].join(" ");
    for (const range of ["1–3%", "1-3%"]) {
      expect(copy, `copy quotes the range ${range}`).not.toContain(range);
    }
    // What is true, and still said.
    expect(
      C.faq.items.some((item) => item.a.includes("do hợp đồng của bạn quy định")),
    ).toBe(true);
  });
});
