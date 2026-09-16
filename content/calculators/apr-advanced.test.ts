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

  it("still tells the reader how to handle an early-repayment fee", () => {
    // Removing the invented range must not remove the actionable half. The
    // answer has to keep naming the workaround — putting the fee in the
    // other-fees field — and has to say where the real number comes from.
    const copy = everyString(C).join(" ");
    expect(copy).toContain("phí khác");
    expect(copy).toContain("hợp đồng");
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
