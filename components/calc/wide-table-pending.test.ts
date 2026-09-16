import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import {
  NARROW_OVERFLOW_MEASURED,
  WIDE_TABLE_PENDING,
} from "@/components/calc/wide-table-pending.mjs";
import { getCalculator } from "@/content/calculators/registry";

/**
 * THE DEBT LIST, PINNED TO THE MEASUREMENT IT CLAIMS TO QUOTE.
 *
 * `check:markup` already checks this list both ways against docs §3's
 * five-column rule. What it cannot check is whether the table actually
 * overflows a phone, because it parses HTML and has no layout engine — so the
 * rule is a static proxy and the list was, until now, a set of hand-written
 * reasons about a symptom nobody had observed.
 *
 * On 2026-09-16 every live route was rendered at a verified 390 px layout
 * viewport and the results recorded in `docs/visual-evidence.json`. That
 * measurement disagreed with the rule in BOTH directions: `lai-kep` violates
 * docs §3 and does not overflow, while `vay-thuong-mai` and `lai-suat-thuc-te`
 * satisfy docs §3 and do. `measured390` on each entry records which, and this
 * file is what stops that field from drifting away from the manifest — the same
 * pairing as `shipped()` against `verified` in the statutory registry.
 *
 * WHY THE MANIFEST IS THE SOURCE OF TRUTH AND NOT THIS LIST: the manifest also
 * records HOW it was measured, including that `chrome --headless --screenshot
 * --window-size=390,844` is rejected on this machine because it clamps the
 * window and crops the image, producing a 390-wide file of a wider layout. A
 * number without its method is not evidence.
 */

type Entry = { slug: string; columns: number; measured390: string; reason: string };
type Narrow = { slug: string; columns: number; measuredOn: string; reason: string };

const pending = WIDE_TABLE_PENDING as Entry[];
const narrow = NARROW_OVERFLOW_MEASURED as Narrow[];

const manifest = JSON.parse(
  readFileSync(new URL("../../docs/visual-evidence.json", import.meta.url), "utf8"),
) as {
  viewports: {
    viewport: number;
    viewportVerifiedForAll: boolean;
    elementsWiderThanViewport: { slug: string; count: number }[];
  }[];
};

const narrowViewport = manifest.viewports.find((v) => v.viewport === 390);
const overflowing = new Map(
  (narrowViewport?.elementsWiderThanViewport ?? []).map((e) => [e.slug, e.count] as const),
);

describe("the wide-table debt list is measured, not just reasoned", () => {
  it("has a manifest with a verified 390px sweep behind it", () => {
    expect(narrowViewport, "no 390px viewport in docs/visual-evidence.json").toBeDefined();
    // The claim that makes every assertion below meaningful. A sweep whose
    // layout width was not what it says would make all of this decorative.
    expect(narrowViewport!.viewportVerifiedForAll).toBe(true);
    // NO FLOOR ON EITHER LIST, and this is the third time that correction has
    // had to be made in this repo — after `STATUTORY_UNDECLARED` and
    // `NARROW_OVERFLOW_MEASURED`. These read
    // `expect(overflowing.size).toBeGreaterThan(5)` and
    // `expect(pending.length).toBeGreaterThan(5)`, and on 2026-09-16 the
    // measured-overflow list reached ZERO and the debt list dropped to one
    // entry, so both would have gone red for the work being finished.
    //
    // A guard on a backlog must let the backlog empty. What it keeps checking
    // is that the manifest is real (`viewportVerifiedForAll` above) and that
    // whatever REMAINS in either list is accurate — which the per-entry
    // assertions below still do, in both directions.
    expect(overflowing.size).toBeGreaterThanOrEqual(0);
    expect(pending.length).toBeGreaterThanOrEqual(0);
    // NO FLOOR ON `narrow`, deliberately: an empty list is the goal state and
    // it reached zero on 2026-09-16. This read
    // `expect(narrow.length).toBeGreaterThan(0)` and would have gone red the
    // moment the second row was fixed — punishing the work for being
    // finished, which is the same mistake `STATUTORY_UNDECLARED` made and
    // corrected. A guard on a backlog must let the backlog empty; what it
    // keeps checking is that whatever REMAINS is real and actionable.
  });

  it.each(pending.map((e) => [e.slug, e] as const))(
    "%s records the overflow it was actually measured to have",
    (slug, entry) => {
      expect(getCalculator(slug), `${slug} is not in the registry`).toBeDefined();
      expect(
        ["overflows", "fits"],
        `${slug}.measured390 is "${entry.measured390}"`,
      ).toContain(entry.measured390);
      const measured = overflowing.has(slug) ? "overflows" : "fits";
      expect(
        entry.measured390,
        `${slug} claims to ${entry.measured390} at 390px, but the 2026-09-16 ` +
          `sweep recorded that it ${measured}` +
          (overflowing.has(slug) ? ` (${overflowing.get(slug)} elements over)` : ""),
      ).toBe(measured);
      // A debt entry still owes a reason someone can act on.
      expect(entry.reason.length, `${slug}'s reason is too thin`).toBeGreaterThan(30);
      expect(entry.columns).toBeGreaterThanOrEqual(5);
    },
  );

  it("keeps the two lists disjoint, because they mean different things", () => {
    // One is a debt against docs §3; the other is evidence that docs §3 misses
    // cases. A slug in both would be claiming to be both a rule violation and
    // a rule gap.
    const pendingSlugs = new Set(pending.map((e) => e.slug));
    const overlap = narrow.filter((n) => pendingSlugs.has(n.slug)).map((n) => n.slug);
    expect(overlap, "listed as both a docs §3 debt and a docs §3 gap").toEqual([]);
  });

  it("keeps every remaining rule-gap entry real and actionable", () => {
    // A plain loop rather than `it.each`, because `it.each([])` is an error in
    // vitest and this list is allowed to be empty. Same shape as the
    // `STATUTORY_UNDECLARED` guard, for the same reason.
    for (const entry of narrow) {
      expect(getCalculator(entry.slug), `${entry.slug} is not in the registry`).toBeDefined();
      // Both halves must hold, or the entry belongs in the other list.
      expect(
        overflowing.has(entry.slug),
        `${entry.slug} is recorded as a rule gap but the sweep found no overflow`,
      ).toBe(true);
      expect(
        entry.columns,
        `${entry.slug} has ${entry.columns} columns, so it IS a docs §3 violation ` +
          `and belongs in WIDE_TABLE_PENDING instead`,
      ).toBeLessThan(5);
      expect(entry.reason.length).toBeGreaterThan(80);
    }
  });

  it("accounts for every measured overflow in one list or the other", () => {
    // The completeness half. Without this, a row could overflow at 390px and
    // appear in neither list — which is exactly the state `vay-thuong-mai` and
    // `lai-suat-thuc-te` were in before the sweep, invisible because the rule
    // they satisfy was the only thing anyone checked.
    const accounted = new Set([
      ...pending.filter((e) => e.measured390 === "overflows").map((e) => e.slug),
      ...narrow.map((n) => n.slug),
    ]);
    const unaccounted = [...overflowing.keys()].filter((slug) => !accounted.has(slug));
    expect(
      unaccounted,
      "these rows overflow 390px and are tracked by neither list",
    ).toEqual([]);
  });
});
