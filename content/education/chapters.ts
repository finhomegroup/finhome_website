// The collection index as five chapters.
//
// A chapter is a decision GROUP from groups.ts, shown with the articles that
// group already owns, in reading order. Nothing here adds a category or moves
// an article: the chapter's number is its group's position in EDUCATION_GROUPS
// and its articles come from `collectionOutline()`. Titles, excerpts and
// reading times are the registry entries in POSTS, the same strings the
// article page and its metadata use, so the index cannot promise a different
// article from the one it opens.

import { collectionOutline } from "@/content/education/articles";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import type { EducationGroup, EducationGroupId } from "@/content/education/groups";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { getPost } from "@/content/posts";

type ChapterCopy = { anchor: string; label: string; title: string; lede: string };

// Typed as a full record so a sixth group without chapter copy is a type
// error, not a blank section.
const COPY: Record<EducationGroupId, ChapterCopy> = C.chapters;

export type ChapterArticle = {
  slug: string;
  href: string;
  /** "01.1" — chapter number, then position inside the chapter. */
  number: string;
  title: string;
  excerpt: string;
  readingTime: string;
};

export type EducationChapter = ChapterCopy & {
  group: EducationGroup;
  /** Two digits, "01"…"05". */
  number: string;
  articles: ChapterArticle[];
  /** The group's first article in reading order. */
  start: ChapterArticle;
  /** The live calculator that start article's exercise uses. */
  tool: { title: string; href: string };
};

export function educationChapters(): EducationChapter[] {
  return collectionOutline().map(({ group, articles }, index) => {
    const number = String(index + 1).padStart(2, "0");
    const copy = COPY[group.id];
    const entries = articles.map((article, position): ChapterArticle => {
      const post = getPost(article.slug);
      if (!post) {
        throw new Error(
          `content/education/chapters.ts: "${article.slug}" has no POSTS entry, so the index has no title for it.`,
        );
      }
      return {
        slug: article.slug,
        href: `/blog/${article.slug}/`,
        number: `${number}.${position + 1}`,
        title: post.title,
        excerpt: post.excerpt,
        readingTime: post.readingTime,
      };
    });
    const [start] = entries;
    if (!start) {
      throw new Error(`content/education/chapters.ts: group ${group.id} has no article.`);
    }
    const toolSlug = articles[0].exercise.toolSlug;
    const tool = getCalculator(toolSlug);
    if (!tool || tool.status !== "live") {
      throw new Error(
        `content/education/chapters.ts: chapter ${number} points at "${toolSlug}", which is not a live calculator.`,
      );
    }
    return {
      ...copy,
      group,
      number,
      articles: entries,
      start,
      tool: { title: tool.title, href: `${calculatorPath(toolSlug)}/` },
    };
  });
}

/** The chapter an article belongs to, for links back into the index. */
export function chapterForGroup(id: EducationGroupId): { number: string; anchor: string; label: string } {
  const index = collectionOutline().findIndex((entry) => entry.group.id === id);
  return {
    number: String(index + 1).padStart(2, "0"),
    anchor: COPY[id].anchor,
    label: COPY[id].label,
  };
}
