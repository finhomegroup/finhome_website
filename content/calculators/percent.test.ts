// The copy on /cong-cu/tinh-phan-tram/ against what the module actually does.
//
// This exists for one class of defect the suite keeps finding: a field's help
// text that forbids an input the tool accepts, or promises one it refuses. An
// independent review found exactly that on original row 59's rate-comparison
// mode — the old-rate field still said "Không được là 0" after a 0% old rate
// had been made valid, so the page told the reader not to type something it
// answers correctly.
import { describe, expect, it } from "vitest";
import { computePercent } from "@/lib/calc/percent";
import { parseDecimal } from "@/lib/calc/number";
import { CALCULATOR_COPY } from "@/content/calculators/shared";
import { PERCENT as C } from "@/content/calculators/percent";

const POINTS = C.form.modes.points;

describe("the rate-comparison mode's copy matches its behaviour", () => {
  it("parses its own defaults and reproduces the 7 → 9 lesson", () => {
    const a = parseDecimal(POINTS.defaultA)!;
    const b = parseDecimal(POINTS.defaultB)!;
    const result = computePercent({ mode: "points", a, b })!;
    if (result.mode !== "points") throw new Error("wrong mode");
    expect(result.differencePoints).toBeCloseTo(2, 10);
    expect(result.relativePercent!).toBeCloseTo(28.571428571428573, 8);
  });

  it("accepts a 0% old rate, which is what the help now says", () => {
    // 0% → 7% is a real +7 điểm phần trăm; only the relative change is
    // undefined, and the model returns that as null rather than refusing.
    const result = computePercent({ mode: "points", a: 0, b: 7 })!;
    if (result.mode !== "points") throw new Error("wrong mode");
    expect(result.differencePoints).toBe(7);
    expect(result.relativePercent).toBeNull();
  });

  it("no longer forbids 0 in the field's own help or error", () => {
    // The stale prohibition, pinned so it cannot come back.
    expect(POINTS.aHelp).not.toContain("Không được là 0");
    expect(POINTS.aInvalid).not.toContain("khác 0");
    // And it says what is actually unavailable at 0, rather than nothing.
    expect(POINTS.aHelp).toContain("Nhập 0 vẫn được");
    expect(POINTS.aHelp).toContain("điểm phần trăm");
  });

  it("keeps the 0 prohibition where it IS real: the money-change mode", () => {
    // That mode divides by the old amount, so 0 there has no answer at all —
    // a different rule, deliberately not unified with this one.
    expect(C.form.modes.change.aHelp).toContain("Không được là 0");
    expect(computePercent({ mode: "change", a: 0, b: 7 })).toBeNull();
  });

  // The shared disclaimer is what a tool with no override renders, and this
  // page is the reason it had to stop asserting a rate. There is no rate box
  // here: "30% của 2 tỷ" assumes no interest rate, constant or otherwise.
  it("inherits a default disclaimer that asserts nothing untrue here", () => {
    const shared = CALCULATOR_COPY.disclaimer;
    // The mandatory opening `check:markup` counts.
    expect(shared.startsWith("Công cụ này chỉ mang tính minh họa")).toBe(true);
    // No flat claim that this tool runs on a rate the reader typed.
    expect(shared).not.toContain("dựa trên mức lãi suất do bạn tự nhập");
    expect(shared).not.toContain("giả định lãi suất không đổi");
    // And it no longer asserts that fees were excluded from a calculation
    // that may well have subtracted them.
    expect(shared).not.toContain("Kết quả không trừ thuế, phí và lạm phát");
    // NOR does it infer the model from the FORM, in either direction. The two
    // counterexamples are both live routes: `ke-hoach-huu-tri` has rate
    // fields and uses different returns before and after retirement, and
    // `thue-luong-hoa-ky` applies statutory tax with no rate box at all.
    expect(shared).not.toContain("Nếu công cụ có ô lãi suất");
    expect(shared).not.toContain("giữ nguyên trong suốt thời gian được tính");
    expect(shared).not.toContain("chỉ được tính khi trang có ô để bạn nhập");
    // What it says instead: read the page's own assumptions and scope.
    expect(shared).toContain("các giả định được ghi trên trang này");
    expect(shared).toContain("phần giả định và giới hạn");
    // The part that is true everywhere stays.
    expect(shared).toContain("không phải lời khuyên đầu tư");
  });

  it("names a direction from the sign, never asserting a rise on a cut", () => {
    const cut = computePercent({ mode: "points", a: 9, b: 7 })!;
    if (cut.mode !== "points") throw new Error("wrong mode");
    expect(cut.differencePoints).toBeCloseTo(-2, 10);
    expect(cut.relativePercent!).toBeLessThan(0);
    // The label is neutral and the direction word is chosen per result.
    expect(POINTS.relativeLabel).not.toContain("tăng");
    expect(POINTS.relativeDecrease).toBe("giảm");
    expect(POINTS.relativeSame).toBe("không đổi");
  });
});
