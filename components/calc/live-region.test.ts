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
// The measured state of the suite when this test was written, which is why the
// assertions are shaped the way they are:
//   - 62 calculator components
//   - exactly one has more than one live group: rule-of-72 (see ALLOWLIST)
//   - no ResultTable is nested inside a ResultGroup
//   - the largest live group is 9 rows (loan), then 8 (biweekly,
//     loan-analysis), then 7 (auto-loan, interest-only, price-adjust)
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

const COMPONENT_DIR = "components";

/**
 * Pages allowed more than one live results region, with the reason.
 *
 * `rule-of-72` stacks two INDEPENDENT tools — rate→years and years→rate —
 * each with its own single input and its own two output rows. Typing in one
 * field changes only its own region, so each announcement is two rows. Merging
 * them into one region would announce four rows for a change that affected
 * two, which is worse. This is a real exception to the convention, not a
 * defect; anything added here needs its own reason on the same footing.
 */
const MULTI_LIVE_ALLOWLIST = new Set(["rule-of-72-calculator.tsx"]);

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

  it("gives each calculator one live ResultGroup, or an allowlisted reason", () => {
    for (const file of calculatorComponents()) {
      const live = resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      ).filter((g) => g.live);
      const limit = MULTI_LIVE_ALLOWLIST.has(file) ? 2 : 1;
      expect(
        live.length,
        `${file} has ${live.length} live ResultGroups (limit ${limit})`,
      ).toBeLessThanOrEqual(limit);
    }
  });

  it("keeps the allowlist honest — an entry that no longer needs it is removed", () => {
    // Prevents the allowlist becoming a place defects hide.
    for (const file of MULTI_LIVE_ALLOWLIST) {
      const live = resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      ).filter((g) => g.live);
      expect(
        live.length,
        `${file} is allowlisted but now has ${live.length} live group(s) — drop it from MULTI_LIVE_ALLOWLIST`,
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
