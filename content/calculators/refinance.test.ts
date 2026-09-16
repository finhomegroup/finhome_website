import { describe, it, expect } from "vitest";
import { REFINANCE as C } from "@/content/calculators/refinance";
import { compareRefinance } from "@/lib/calc/refinance";
import { parseMoney, parseDecimal, parseCount } from "@/lib/calc/number";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_VISUAL_LABELS } from "@/content/education/visual-labels";
import { resolveEducationVisual } from "@/lib/calc/charts/education-visual";
import { moneyCell } from "@/lib/calc/table-cell";
import { nextStepsFor } from "@/content/calculators/next-steps";

describe("refinance content and C12 same-model seam", () => {
  it("parses the shipped hypothetical with the field's actual grammar", () => {
    const r = compareRefinance({ balance: parseMoney(C.form.defaultBalance)!,
      currentRatePercent: parseDecimal(C.form.defaultCurrentRate)!, remainingMonths: parseCount(C.form.defaultRemaining)!,
      newRatePercent: parseDecimal(C.form.defaultNewRate)!, newTermMonths: parseCount(C.form.defaultNewTerm)!,
      closingCosts: parseMoney(C.form.defaultCosts)!, earlySettlementFee: parseMoney(C.form.defaultOldFee)!,
      horizonMonths: parseCount(C.form.defaultHorizon)! })!;
    expect(r.horizonMonths).toBe(60);
    expect(r.closingCosts).toBe(40e6);
    expect(r.horizonCostSaving).toBeCloseTo(180_064_623.1226, 2);
  });
  it("C12 declares its horizon and fees, resolves typed cost/cash/debt from production", () => {
    const a = EDUCATION_ARTICLES.find((article) => article.planId === "C12")!;
    // UPDATED with C12's original visual requirement: the endpoint table is
    // now the accessible reading of a time/cost figure with a marker per
    // break-even, so the resolved shape is a chart whose own table carries
    // the same typed cells at the article's checkpoints.
    if (a.visual.kind !== "refinanceCostPath") throw new Error("wrong C12 visual");
    expect(a.visual.input.horizonMonths).toBe(60);
    expect(a.visual.input.closingCosts).toBe(20e6);
    expect(a.visual.input.earlySettlementFee).toBe(20e6);
    const r = compareRefinance(a.visual.input)!;
    const v = resolveEducationVisual(a.visual, EDUCATION_VISUAL_LABELS);
    if (v.kind !== "chart") throw new Error("wrong C12 resolved shape");
    const horizonRow = v.model.table.rows.at(-1)!;
    expect(horizonRow[1]).toEqual(moneyCell(r.horizonCostSaving));
    expect(horizonRow[2]).toEqual(moneyCell(r.horizonCashFlowSaving));
    expect(horizonRow[3]).toEqual(moneyCell(r.horizon.currentBalance));
    expect(horizonRow[4]).toEqual(moneyCell(r.horizon.newBalance));
    expect(JSON.stringify(a)).not.toContain("Công cụ hiện chưa có mốc đánh giá chung");
    for (const label of [C.form.balanceLabel, C.form.currentRateLabel, C.form.remainingLabel, C.form.newRateLabel, C.form.newTermLabel, C.form.horizonLabel, C.form.oldFeeLabel, C.form.costsLabel]) {
      expect(a.exercise.steps.join(" ")).toContain(`“${label}”`);
    }
    expect(nextStepsFor(a.exercise.toolSlug)?.education?.href).toBe(`/blog/${a.slug}/`);
  });
  it("does not promote cash-flow recoup into early-exit economic advice", () => {
    const all = JSON.stringify(C);
    expect(all).toContain("không phải tổng lợi ích kinh tế");
    expect(all).toContain("không hỗ trợ phí vay thêm vào gốc");
    expect(all).toContain("Không chiết khấu");
    expect(all).not.toContain("điểm hoàn phí là con số quyết định");
    expect(all).not.toContain("Ngân hàng thường thu");
    const a = EDUCATION_ARTICLES.find((article) => article.planId === "C12")!;
    expect(JSON.stringify(a)).not.toContain("Sai sót thứ hai: giữ nguyên kỳ hạn cũ");
    expect(JSON.stringify(a)).toContain("hai kỳ hạn khác nhau vẫn so được");
  });
  it("keeps the independently found C04/C08/C09 exercise labels executable", () => {
    const exercise = (planId: string) => JSON.stringify(EDUCATION_ARTICLES.find((a) => a.planId === planId)!.exercise);
    for (const id of ["C04", "C09"]) {
      expect(exercise(id)).toContain("Số tiền đã có");
      expect(exercise(id)).toContain("Mất bao lâu để đạt mục tiêu");
      expect(exercise(id)).not.toContain("Bao lâu thì đạt mục tiêu");
    }
    expect(exercise("C04")).toContain("Số tháng");
    expect(exercise("C09")).toContain("Góp mỗi tháng");
    for (const label of ["Tiền thuê mỗi tháng", "Lãi suất vay", "Kỳ hạn vay", "So sánh trong", "Giá nhà tăng", "Tiền thuê tăng", "Lợi nhuận đầu tư"]) expect(exercise("C08")).toContain(label);
    expect(exercise("C08")).toContain("60 lên 120 rồi 180 tháng");
    expect(exercise("C08")).not.toContain("Mở phần giả định");
  });
});
