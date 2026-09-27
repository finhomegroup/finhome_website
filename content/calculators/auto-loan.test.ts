/**
 * /cong-cu/vay-mua-xe/ is a CAR page.
 *
 * The user's direction on 2026-09-26 — "xe là xe, không cần đề cập đến nhà
 * cửa" — retired the home-purchase framing this route carried from original
 * row 31: its title asked how a car affects the money for a house, its FAQ
 * answered whether the reader could buy one, and its next steps were the
 * affordability and home-deposit tools. What stays is the useful half of the
 * answer, the household month with and without the car, and every figure the
 * engine produced. These tests pin the framing; the arithmetic is pinned in
 * `auto-loan-calculator.test.ts` and `lib/calc/auto-loan.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { AUTO_LOAN as C } from "@/content/calculators/auto-loan";
import { nextStepsFor } from "@/content/calculators/next-steps";
import { dispositionFor } from "@/content/calculators/plan-disposition";
import { getCalculator } from "@/content/calculators/registry";

/** Every string a reader can see, wherever it sits in the content object. */
function visibleStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) visibleStrings(item, out);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) visibleStrings(item, out);
  }
  return out;
}

describe("vay-mua-xe is a standalone car tool", () => {
  it("titles itself as the car-loan calculator and promises the three car answers", () => {
    expect(C.pageTitle).toBe("Tính khoản vay mua xe");
    expect(getCalculator("vay-mua-xe")?.title).toBe(C.pageTitle);
    // Monthly payment, total interest, budget remaining — in plain words.
    expect(C.lede).toContain("mỗi tháng bạn trả bao nhiêu");
    expect(C.lede).toContain("tổng lãi");
    expect(C.lede).toContain("còn lại bao nhiêu sau khi mua xe");
    expect(C.metaTitle).toContain("Tính khoản vay mua xe");
    expect(C.metaDescription).toContain("tổng lãi");
  });

  it("names no house anywhere a reader can see, nor in the route's metadata", () => {
    for (const text of visibleStrings(C)) {
      expect(text, text).not.toMatch(/nhà/);
      expect(text, text).not.toContain("vốn tự có");
    }
    expect(getCalculator("vay-mua-xe")?.summary).not.toMatch(/nhà/);
    const disposition = dispositionFor("vay-mua-xe");
    expect(disposition?.question).not.toMatch(/nhà/);
    expect(disposition?.question).toMatch(/xe/);
    expect(disposition?.question.trim().endsWith("?")).toBe(true);
  });

  it("keeps the household budget and the worked example intact", () => {
    // The reframing removed a subject, not a result: the month with and
    // without the car is still the answer, at the same figures.
    expect(C.form.budgetTitle).toBe("Mỗi tháng còn lại bao nhiêu");
    expect(C.form.withCarLabel).toContain("Sau khi mua xe");
    const method = C.formula.body.join(" ");
    expect(method).toContain("800 − 300 − 100 = 400 triệu");
    expect(method).toContain("8.498.818 ₫");
    expect(method).toContain("109.929.073 ₫");
    expect(method).toContain("3.501.182 ₫");
    expect(C.form.defaultNetIncome).toBe("40.000.000");
  });

  it("offers car-related next actions only, each a live tool with a car question", () => {
    // No entry in the shared block: that block is guarded to the P1/P2
    // home-buying path, and this page is not on it.
    expect(nextStepsFor("vay-mua-xe")).toBeUndefined();

    const slugs = C.relatedTools.items.map((item) => item.slug);
    expect(slugs).toContain("thue-mua-xe");
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const item of C.relatedTools.items) {
      expect(item.slug).not.toBe("vay-mua-xe");
      expect(getCalculator(item.slug)?.status, item.slug).toBe("live");
      expect(getCalculator(item.slug)?.category, item.slug).not.toBe("vay-the-chap");
      expect(item.why.trim().endsWith("?"), item.slug).toBe(true);
      expect(item.why, item.slug).not.toMatch(/nhà/);
    }
    expect(C.relatedTools.intro).toContain("nhập lại");
  });

  it("is rendered by the route, which no longer mounts the home-path blocks", () => {
    const route = readFileSync("app/cong-cu/vay-mua-xe/page.tsx", "utf8");
    expect(route).toContain("relatedTools");
    expect(route).toContain("getCalculator(");
    expect(route).toContain("afterCalculator");
    // Neither block is imported or mounted; a comment may still name them.
    expect(route).not.toContain("<ToolNextSteps");
    expect(route).not.toContain("<ResultActions");
    expect(route).not.toContain("components/calc/tool-next-steps");
    expect(route).not.toContain("components/calc/result-actions");
  });

  it("distinguishes purchase and loan outlay from ownership costs", () => {
    const answer = C.faq.items.find((item) => item.q.includes("Tổng tiền mua và vay"));
    expect(answer?.a).toContain("chưa phải tổng chi phí sở hữu xe");
    expect(answer?.a).toContain("không được cộng vào chỉ tiêu");
    expect(answer?.a).toContain("giá bán lại");
    expect(C.depreciationNotice).toContain("có thể");
    expect(C.depreciationNotice).toContain("chưa ước tính");
    expect(C.depreciationNotice).not.toContain("sẽ có một khoảng thời gian");
  });

  it("labels rounded examples as approximate and qualifies interest savings", () => {
    const method = C.formula.body.join(" ");
    expect(method).toContain("khoảng 8,5 triệu");
    expect(method).toContain("khoảng 3,5 triệu");
    expect(method).not.toContain("12 − 8,50 = 3.501.182");
    expect(C.faq.items[1].a).toContain("lãi suất là 0%");
    expect(C.faq.items[0].a).toContain("nếu lãi suất dương");
  });
});
