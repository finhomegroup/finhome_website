/**
 * Content contracts for `/cong-cu/apr-nang-cao/` (plan row 7's advanced APR).
 *
 * WHY THIS FILE EXISTS AT ALL. It did not, and that absence is exactly why a
 * defect survived here after being removed everywhere else. An invented
 * universal — "thường 1–3% dư nợ" for an early-repayment fee — was removed
 * from `content/calculators/loan.ts` by a browser check, then from
 * `biweekly.ts` and `points.ts` by two later units, each of which added a
 * sweep to its own test. This module had no test, so it kept the claim and
 * became the last live site in the suite.
 *
 * The lesson generalises past this one range: a guard that lives in each
 * module's own test protects only the modules that have a test. So the sweep
 * below runs over EVERY string this module exports, and the list of ranges is
 * the same one `loan.test.ts`, `auto-lease.test.ts` and the education
 * collection sweep for, rather than a new list that could drift from theirs.
 */
import { describe, expect, it } from "vitest";
import { APR_ADVANCED as C } from "@/content/calculators/apr-advanced";

/** Every user-facing string in the module, flattened. */
const everyString = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(everyString);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(everyString);
  }
  return [];
};

describe("apr-nang-cao's copy", () => {
  it("quotes no invented statistical range", () => {
    // Same list as `loan.test.ts` and `auto-lease.test.ts`. A made-up range
    // reads as researched and is not, which is worse on a page whose whole
    // subject is a number a reader will compare against a real bank offer.
    const copy = everyString(C).join(" ");
    for (const range of ["1–3%", "1-3%", "35–40", "45–55", "70–80", "3–6 tháng"]) {
      expect(copy, `copy quotes "${range}"`).not.toContain(range);
    }
  });

  it("tells the reader the exit fee is excluded, when it falls due, and where it is counted", () => {
    // 2026-09-26. The earlier assertion pinned the OLD workaround — put the
    // exit fee in the other-fees field. That advice was the fee-timing error
    // `form.settlementFeeNotice` on the same page warns against: a fee paid
    // at the settlement month is not a fee paid at disbursement, and adding
    // it at month 0 overstates the APR. The FAQ now agrees with the notice,
    // and this test pins the agreement rather than the mistake.
    const item = C.faq.items.find((entry) => entry.q.includes("trước hạn"));
    expect(item, "the exit-fee FAQ item is gone").toBeDefined();
    const answer = item!.a;
    // Excluded, not zero — and the reader is told where the real number lives.
    expect(answer).toContain("không cộng phí trả nợ trước hạn");
    expect(answer).toContain("hợp đồng");
    // Timing: do NOT add it to the upfront-fee boxes, and say why.
    expect(answer).toContain("Đừng cộng khoản này vào ô phí trả ngay");
    expect(answer).toContain("không phải phí trả lúc giải ngân");
    // Destination: the comparison tool has a box for it and charges it at
    // the horizon the reader chose.
    expect(answer).toContain("So sánh khoản vay");
    expect(answer).toContain("mốc bạn chọn");
    // The old workaround must not come back under any wording.
    expect(answer).not.toContain("ô “phí khác”");
    expect(answer).not.toContain("Cách gần đúng");
    // And the visible notice beside the result says the same thing, so the
    // page cannot contradict itself between its result and its FAQ.
    expect(C.form.settlementFeeNotice).toContain("đừng cộng nó vào ô phí trả ngay");
    expect(C.form.settlementFeeNotice).toContain("So sánh khoản vay");
  });

  it("does not claim a fee is universal", () => {
    // The replacement says some contracts do not charge one. A page that
    // implies every contract does is the same defect in prose form.
    const copy = everyString(C).join(" ");
    expect(copy).toContain("có hợp đồng không thu");
  });

  it("carries a non-empty title, lede and at least one FAQ item", () => {
    // Shape guard, so the sweeps above cannot pass by the module being empty.
    expect(C.pageTitle.trim().length).toBeGreaterThan(5);
    expect(C.lede.trim().length).toBeGreaterThan(20);
    expect(C.faq.items.length).toBeGreaterThanOrEqual(1);
    expect(everyString(C).length).toBeGreaterThan(20);
  });
});
