// The "Mua nhà bằng con số" collection: every article, in reading order.
//
// Split across files only because one file of full articles is unreadable; the
// order here is the reading order the collection index uses. `articles-1` and
// `articles-2` are the original twelve (C01–C12, the five P1 rows plus the
// first P2 ones); `articles-3` holds the P2 rows accepted later.
//
// NO COUNT IS WRITTEN DOWN HERE, and AGENTS.md says why: a prose count in this
// repository has gone stale repeatedly. Derive it from `EDUCATION_ARTICLES`.
// Which calculator rows are still WITHOUT an article, and whether each one
// belongs in a home-buying collection at all, is declared in
// `content/education/coverage.ts` and guarded in both directions.

import { ARTICLES_1 } from "@/content/education/articles-1";
import { ARTICLES_2 } from "@/content/education/articles-2";
import { ARTICLES_3 } from "@/content/education/articles-3";
import { EDUCATION_GROUPS, type EducationGroupId } from "@/content/education/groups";
import type { EducationArticle } from "@/content/education/types";

export const EDUCATION_ARTICLES: EducationArticle[] = [
  ...ARTICLES_1,
  ...ARTICLES_2,
  ...ARTICLES_3,
];

const BY_SLUG = new Map(EDUCATION_ARTICLES.map((a) => [a.slug, a]));

export function getEducationArticle(
  slug: string,
): EducationArticle | undefined {
  return BY_SLUG.get(slug);
}

/** The articles in one group, in reading order. */
export function articlesInGroup(group: EducationGroupId): EducationArticle[] {
  return EDUCATION_ARTICLES.filter((a) => a.group === group);
}

/** Groups paired with their articles, in the collection's display order. */
export function collectionOutline(): {
  group: (typeof EDUCATION_GROUPS)[number];
  articles: EducationArticle[];
}[] {
  return EDUCATION_GROUPS.map((group) => ({
    group,
    articles: articlesInGroup(group.id),
  }));
}
