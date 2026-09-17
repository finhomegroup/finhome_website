/**
 * Reading time is DERIVED from the article, and this is what stops it drifting
 * back into a constant.
 *
 * WHY THIS FILE EXISTS. On 2026-09-17 a reader-perspective review of all 23
 * education articles found `readingTime` had collapsed into a near-constant:
 * every entry said 6 or 7 minutes while the prose ranged from 928 to 1.486
 * words — a 60% spread. C12 and C21 both said 6 for a 49% difference in
 * length, and the four SHORTEST articles all said 7, the same as the longest.
 * The number was on every card in the collection and on every article header,
 * and it was telling the reader nothing.
 *
 * Nothing caught it because nothing had ever asserted a relationship between
 * the figure and the text. A per-entry string is exactly the shape that rots:
 * each one looks plausible alone.
 *
 * THE BASIS, and it is deliberately narrow: `round(prose / 200)`, floored at
 * 4, where `prose` is what a reader reads straight through. The household
 * table, the source notes and the provenance line are EXCLUDED — they are
 * reference material people scan, and counting them inflated every article by
 * two to four minutes.
 *
 * The tolerance is ±1 minute, not exact equality. That is not slack: the word
 * count moves whenever a paragraph is reworded, and a test that demanded
 * exactness would turn every copy edit into a two-file change and would
 * eventually be "fixed" by deleting it. ±1 catches the failure that actually
 * happened — a figure unrelated to length — while leaving normal editing alone.
 */
import { describe, expect, it } from "vitest";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { POSTS } from "@/content/posts";
import type { EducationArticle } from "@/content/education/types";

/** Words per minute assumed for Vietnamese prose carrying this many figures. */
const WPM = 200;
/** No article is advertised as shorter than this. */
const FLOOR_MINUTES = 4;
/** Allowed drift, in minutes, before the figure is wrong rather than stale. */
const TOLERANCE = 1;

/** What a reader reads straight through. See the file header for exclusions. */
function proseWords(article: EducationArticle): number {
  return [
    article.question,
    ...article.shortAnswer,
    ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    article.visualReading,
    article.exercise.intro,
    ...article.exercise.steps,
    article.exercise.change,
    article.exercise.check,
    ...article.limits.items,
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function expectedMinutes(article: EducationArticle): number {
  return Math.max(FLOOR_MINUTES, Math.round(proseWords(article) / WPM));
}

const BY_SLUG = new Map(POSTS.map((p) => [p.slug, p]));

describe("every education article's reading time tracks its length", () => {
  it.each(EDUCATION_ARTICLES.map((a) => [a.planId, a] as const))(
    "%s",
    (planId, article) => {
      const post = BY_SLUG.get(article.slug);
      expect(post, `${article.slug} has no POSTS entry`).toBeDefined();

      const stated = Number(/(\d+)/.exec(post!.readingTime)?.[1] ?? NaN);
      expect(
        Number.isFinite(stated),
        `${planId} readingTime "${post!.readingTime}" has no number`,
      ).toBe(true);

      const want = expectedMinutes(article);
      expect(
        Math.abs(stated - want),
        `${planId} says ${stated} phút for ${proseWords(article)} words; ` +
          `derived is ${want} (round(words/${WPM}), floor ${FLOOR_MINUTES})`,
      ).toBeLessThanOrEqual(TOLERANCE);
    },
  );

  it("does not let the figure become a constant across the collection", () => {
    // THE ACTUAL DEFECT, asserted directly rather than only per-article. The
    // per-article check above passes on a collection where every entry is 6
    // minutes IF every article happens to be mid-length — so this asserts the
    // collection spreads, given that its lengths spread.
    const words = EDUCATION_ARTICLES.map(proseWords);
    const spread = Math.max(...words) / Math.min(...words);
    expect(spread, "articles no longer vary in length").toBeGreaterThan(1.2);

    const minutes = new Set(
      EDUCATION_ARTICLES.map(
        (a) => Number(/(\d+)/.exec(BY_SLUG.get(a.slug)!.readingTime)![1]),
      ),
    );
    expect(
      minutes.size,
      `lengths vary by ${spread.toFixed(2)}x but only ${minutes.size} distinct reading time(s) are advertised: ${[...minutes].sort().join(", ")}`,
    ).toBeGreaterThanOrEqual(3);
  });
});
