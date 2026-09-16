// The suite's live-region conventions (docs §4), which until now were a
// comment in result-group.tsx and nothing else. A 360-row amortization
// schedule inside a polite live region re-announces on every keystroke and
// makes the page unusable with a screen reader; §4 says a nine-row GROUP is
// "the same failure mode a live table is".
//
// Checked on the SOURCE text, not on a render: there is no jsdom here. That is
// a limitation but also an advantage — it catches the mistake in the component
// as it is written, with no build.
//
// The measured state of the suite, which is why the assertions are shaped the
// way they are. Re-measure rather than trusting this list; the counts were
// written at 62 components and the suite is now complete at 75:
//   - 75 calculator components
//   - exactly one has more than one live group: rule-of-72 (see ALLOWLIST)
//   - no ResultTable is nested inside a ResultGroup
//   - the largest live group is 9 rows (loan), then 8 (biweekly,
//     loan-analysis), then 7 (auto-loan, interest-only, price-adjust) —
//     unchanged by the retirement tier, whose thirteen pages each keep their
//     live group to exactly 4 rows and put everything else in `live={false}`
//     groups. That is the shape to copy.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { MULTI_LIVE_ALLOWLIST } from "./multi-live-allowlist.mjs";

const COMPONENT_DIR = "components";

// Pages allowed more than one live results region, and why, live in
// ./multi-live-allowlist.mjs — shared verbatim with
// scripts/check-built-markup.mjs, which enforces the built-HTML side of the
// same exception. Keyed here by component filename.
const limitByFilename = new Map(
  MULTI_LIVE_ALLOWLIST.map((e) => [e.filename, e.limit]),
);

/**
 * Ceiling on rows in a single live region — a RATCHET at the current maximum,
 * not an endorsement of it.
 *
 * 9 is `loan-calculator.tsx` today, and docs §4 names nine rows as the same
 * failure mode a live table is, so this number should come DOWN rather than
 * up. It is asserted so a new page cannot make things worse while the
 * existing wide groups wait for a design decision. If you are raising it,
 * you are going the wrong way.
 */
const MAX_LIVE_ROWS = 9;

function calculatorComponents(): string[] {
  return readdirSync(COMPONENT_DIR).filter((f) =>
    f.endsWith("-calculator.tsx"),
  );
}

/**
 * True when a component owns NO results of its own and simply renders another
 * calculator — a second route onto one tool.
 *
 * Both conditions are required: no `ResultGroup` at all, and a rendered
 * `<...Calculator` element imported from another component. A file with its
 * own results cannot qualify, so this cannot be used to skip the convention.
 */
function delegatesToAnotherCalculator(src: string): boolean {
  return (
    !src.includes("<ResultGroup") &&
    /<[A-Z][A-Za-z]*Calculator\b/.test(src) &&
    /from "@\/components\/[a-z0-9-]*-calculator"/.test(src)
  );
}

/** Each `<ResultGroup>` in a component, with its liveness and its row count. */
function resultGroups(src: string): { live: boolean; rows: number }[] {
  return src
    .split("<ResultGroup")
    .slice(1)
    .map((block) => {
      const tag = block.slice(0, block.indexOf(">") + 1);
      const body = block.split("</ResultGroup>")[0] ?? "";
      return {
        // `live` defaults to true, so a group is live unless it opts out.
        live: !/live=\{false\}/.test(tag),
        rows: (body.match(/<ResultRow/g) ?? []).length,
      };
    });
}

describe("the live-region conventions", () => {
  it("finds the calculator components at all", () => {
    // Guards the glob itself: a rename that emptied this list would turn every
    // assertion below into a silent pass.
    expect(calculatorComponents().length).toBeGreaterThan(50);
  });

  it("never puts a ResultTable inside a ResultGroup", () => {
    // The hard rule. A table in a polite region is the original failure mode.
    for (const file of calculatorComponents()) {
      for (const block of readFileSync(`${COMPONENT_DIR}/${file}`, "utf8")
        .split("<ResultGroup")
        .slice(1)) {
        const body = block.split("</ResultGroup>")[0] ?? "";
        expect(
          body.includes("<ResultTable"),
          `${file} nests a ResultTable inside a ResultGroup`,
        ).toBe(false);
      }
    }
  });

  it("gives each calculator exactly one live ResultGroup, or its allowlisted count", () => {
    // toBe, not toBeLessThanOrEqual: scripts/check-built-markup.mjs enforces
    // the built-HTML side of this same rule with `!== liveLimit` — a page
    // that dropped its live region entirely (0 found) would pass a
    // LessThanOrEqual check here and only fail after a full build. Matching
    // exactly catches that at the source-text stage instead.
    for (const file of calculatorComponents()) {
      const source = readFileSync(`${COMPONENT_DIR}/${file}`, "utf8");
      // A route that renders ANOTHER calculator gets its live region from
      // that component, so there is nothing to count here. `apr-nang-cao` is
      // the APR tool at its detailed mode rather than a second calculator —
      // see `apr-advanced-calculator.tsx`. The built-HTML side of this rule
      // still checks the rendered page, where the count is 1.
      if (delegatesToAnotherCalculator(source)) continue;
      const live = resultGroups(source).filter((g) => g.live);
      const limit = limitByFilename.get(file) ?? 1;
      expect(
        live.length,
        `${file} has ${live.length} live ResultGroups (expected exactly ${limit})`,
      ).toBe(limit);
    }
  });

  it("finds at most a couple of delegating calculators", () => {
    // Guards the skip above from becoming a hole: delegation is a deliberate
    // shape for a second ROUTE onto one tool, not a way to opt out of the
    // convention.
    //
    // This asserted `toEqual(["apr-advanced-calculator.tsx"])` — the exact
    // list — which contradicted its own name and made the guard a tripwire on
    // legitimate work: several remaining plan rows consolidate a pair of
    // routes onto one tool using precisely this shipped pattern, and each one
    // would have turned this red. That is the "temporary truth as a permanent
    // invariant" shape twice over in this suite already (the placeholder route
    // and the pending-reading list).
    //
    // So assert the actual invariant — delegation stays a small MINORITY of
    // the suite — as a proportion rather than a literal, so it scales with the
    // suite instead of dating with it.
    const components = calculatorComponents();
    const delegating = components.filter((file) =>
      delegatesToAnotherCalculator(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      ),
    );

    const ceiling = Math.ceil(components.length * 0.1);
    expect(
      delegating.length,
      `${delegating.length} of ${components.length} calculators delegate ` +
        `(ceiling ${ceiling}): ${delegating.join(", ")}`,
    ).toBeLessThanOrEqual(ceiling);

    // And not vacuous: the detector must still recognise the one case that is
    // known to delegate, so a broken predicate returning [] cannot pass.
    expect(delegating).toContain("apr-advanced-calculator.tsx");
  });

  it("keeps the allowlist honest — an entry that no longer needs it is removed", () => {
    // Prevents the allowlist becoming a place defects hide.
    for (const { filename } of MULTI_LIVE_ALLOWLIST) {
      const live = resultGroups(
        readFileSync(`${COMPONENT_DIR}/${filename}`, "utf8"),
      ).filter((g) => g.live);
      expect(
        live.length,
        `${filename} is allowlisted but now has ${live.length} live group(s) — drop it from MULTI_LIVE_ALLOWLIST`,
      ).toBeGreaterThan(1);
    }
  });

  it("does not let a live region grow past the current widest", () => {
    for (const file of calculatorComponents()) {
      for (const g of resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      )) {
        if (!g.live) continue;
        expect(
          g.rows,
          `${file} has a ${g.rows}-row live region; see MAX_LIVE_ROWS`,
        ).toBeLessThanOrEqual(MAX_LIVE_ROWS);
      }
    }
  });
});
