// The P2 coverage guard, checked in BOTH directions.
//
// The property: every P2 row in `plan-disposition.ts` is EITHER exercised by an
// article in the collection OR carries a triage verdict in
// `content/education/coverage.ts`. Never both, never neither.
//
// Both directions matter and they fail differently:
//
//   · neither → a P2 row was added, or an article was deleted, and nobody
//     decided whether it belongs in a home-buying collection;
//   · both → an article was written for a listed row and the entry was left
//     behind, so the list now overstates the gap and reads as a decision that
//     was never revisited.
//
// This is the shape `components/calc/wide-table-pending.mjs` and
// `content/calculators/statutory-parameters.ts` already use in this repository:
// assert the property, list the exceptions with a reason each, and make a stale
// line as red as a new violation.
import { describe, expect, it } from "vitest";
import {
  P2_COVERAGE,
  coverageBacklog,
  coverageFor,
  type CoverageEntry,
} from "@/content/education/coverage";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_GROUPS } from "@/content/education/groups";
import {
  PRIORITY_COUNTS,
  dispositionsByPriority,
} from "@/content/calculators/plan-disposition";
import { getCalculator } from "@/content/calculators/registry";

/** The P2 rows, derived — never a literal list copied out of the plan. */
const P2_SLUGS = dispositionsByPriority("P2").map((d) => d.slug);

/**
 * The calculator slugs the collection's articles EXERCISE.
 *
 * `exercise.toolSlug`, not the engine behind the figure: the exercise is the
 * only place an article sends a reader to a tool and names its field labels,
 * so it is the link a reader follows. Counting figure engines instead would
 * mark `so-sanh-khoan-vay` covered by C07 — which draws the mortgage engine —
 * and mark rows covered by articles that never mention them.
 */
const EXERCISED = new Set(EDUCATION_ARTICLES.map((a) => a.exercise.toolSlug));

const covered = P2_SLUGS.filter((slug) => EXERCISED.has(slug));
const listed = P2_SLUGS.filter((slug) => coverageFor(slug) !== undefined);

describe("the sweep has something to sweep", () => {
  // THE NON-VACUITY FLOOR. Every assertion below is a loop over a derived
  // collection, and a loop over an empty collection passes. These four checks
  // are what make the file die loudly instead of going green on nothing.
  //
  // Deliberately NO floor on `P2_COVERAGE.length`. An empty list would be the
  // GOAL state — every P2 row exercised by an article — and
  // `statutory-parameters.test.ts` records what happens when a backlog guard
  // pins its own backlog above zero: it goes red the day the work finishes and
  // punishes the finishing. What is guarded instead is that whatever remains
  // in the list is real and actionable.
  it("derives a non-empty P2 tier from the plan, at its committed size", () => {
    expect(P2_SLUGS.length).toBeGreaterThan(0);
    expect(P2_SLUGS.length).toBe(PRIORITY_COUNTS.P2);
    expect(new Set(P2_SLUGS).size).toBe(P2_SLUGS.length);
  });

  it("parsed real articles with real exercises", () => {
    expect(EDUCATION_ARTICLES.length).toBeGreaterThan(0);
    expect(EXERCISED.size).toBeGreaterThan(0);
    for (const slug of EXERCISED) {
      expect(slug.length, "an article exercises an empty tool slug").toBeGreaterThan(0);
    }
  });

  it("has at least one P2 row on each side of the property", () => {
    // Without this, "every P2 row is listed" would pass with no article ever
    // read, and "every listed row lacks an article" would pass with nothing
    // listed. One row on each side proves both halves are live.
    expect(covered.length, "no P2 row is exercised by any article").toBeGreaterThan(0);
    expect(
      listed.length,
      "no P2 row is triaged, so the both-ways check below compares nothing",
    ).toBeGreaterThan(0);
  });
});

describe("every P2 row is either written or triaged — and not both", () => {
  it.each(P2_SLUGS.map((slug) => [slug] as const))(
    "%s has exactly one of an article and a verdict",
    (slug) => {
      const hasArticle = EXERCISED.has(slug);
      const entry = coverageFor(slug);
      // Asserted as two booleans with a written-out message rather than
      // `toContain` on a list, for the reason `statutory-parameters.test.ts`
      // gives: a failure message is part of the guard, and the reader needs
      // the slug and what to do, not a dump of the whole list.
      expect(
        hasArticle || entry !== undefined,
        `P2 row "${slug}" has no article exercising it and no verdict in ` +
          `content/education/coverage.ts. Decide whether it belongs in a ` +
          `home-buying collection and add an entry, or write the article.`,
      ).toBe(true);
      expect(
        !(hasArticle && entry !== undefined),
        `P2 row "${slug}" is exercised by an article AND still listed in ` +
          `content/education/coverage.ts as "${entry?.verdict}". Delete the ` +
          `entry: the list records rows with NO article.`,
      ).toBe(true);
    },
  );

  it("lists nothing that is not a P2 row", () => {
    const p2 = new Set(P2_SLUGS);
    const strays = P2_COVERAGE.filter((entry) => !p2.has(entry.slug)).map(
      (entry) => entry.slug,
    );
    expect(
      strays,
      "listed in coverage.ts but not P2 in plan-disposition.ts — either the " +
        "row changed tier or the entry is for a row this list does not govern",
    ).toEqual([]);
  });

  it("lists every row once, against a live calculator", () => {
    const slugs = P2_COVERAGE.map((entry) => entry.slug);
    expect(new Set(slugs).size, `duplicate entries: ${slugs.join(", ")}`).toBe(
      slugs.length,
    );
    for (const entry of P2_COVERAGE) {
      const tool = getCalculator(entry.slug);
      expect(tool, `${entry.slug} is not in the registry`).toBeDefined();
      expect(tool?.status, `${entry.slug} is not live`).toBe("live");
    }
  });
});

describe("every verdict is one a reader can act on", () => {
  const cases = P2_COVERAGE.map(
    (entry) => [`${entry.slug} — ${entry.verdict}`, entry] as const,
  );

  it.each(cases)("%s gives a reason long enough to act on", (_name, entry) => {
    // The same bound `statutory-parameters.test.ts` puts on an uncited row's
    // reason: long enough to say WHAT was decided and why, so the next owner
    // does not re-derive it. A label would fail this.
    expect(
      entry.reason.length,
      `${entry.slug}'s reason is too thin to act on`,
    ).toBeGreaterThan(120);
  });

  it.each(cases)("%s names a group it could belong to, or says none", (_name, entry) => {
    const groupIds = EDUCATION_GROUPS.map((g) => g.id);
    if (entry.verdict === "belongs") {
      // A queued row without a filing is half a decision: whoever writes it
      // would have to re-take the group call the list exists to record.
      expect(
        entry.group,
        `${entry.slug} is accepted but names no decision group`,
      ).not.toBeNull();
    }
    if (entry.group !== null) {
      expect(groupIds, `${entry.slug} names an unknown group`).toContain(
        entry.group,
      );
    } else {
      // `null` is the strong claim that NO group could own it, so it is
      // allowed only for an exclusion.
      expect(
        entry.verdict,
        `${entry.slug} has no group but is not excluded`,
      ).toBe("excluded");
    }
  });

  it("keeps the backlog and the exclusions apart", () => {
    const backlog = coverageBacklog();
    for (const entry of backlog) expect(entry.verdict).toBe("belongs");
    const excluded = P2_COVERAGE.filter((e) => e.verdict === "excluded");
    expect(backlog.length + excluded.length).toBe(P2_COVERAGE.length);
  });

  it("keeps every P1 row exercised, which is why only P2 needs a list", () => {
    // The premise the whole file rests on. If a P1 row ever lost its article
    // this would go red HERE, naming the row, rather than the P2 sweep quietly
    // continuing to pass while the more important tier had a hole.
    for (const disposition of dispositionsByPriority("P1")) {
      expect(
        EXERCISED.has(disposition.slug),
        `P1 row "${disposition.slug}" is no longer exercised by any article`,
      ).toBe(true);
    }
  });
});

describe("the entry shape cannot drift from the type", () => {
  it("accepts only the two verdicts", () => {
    const allowed: CoverageEntry["verdict"][] = ["belongs", "excluded"];
    for (const entry of P2_COVERAGE) {
      expect(allowed, `${entry.slug}`).toContain(entry.verdict);
    }
  });

  it("returns undefined for a row it does not govern", () => {
    expect(coverageFor("vay-mua-nha")).toBeUndefined();
    expect(coverageFor("khong-ton-tai")).toBeUndefined();
  });
});
