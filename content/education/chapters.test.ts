import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChapterNav } from "@/components/education/chapter-nav";
import { EducationArticleBody, sectionIds } from "@/components/education/education-article";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { chapterForGroup, educationChapters } from "@/content/education/chapters";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { EDUCATION_GROUPS } from "@/content/education/groups";
import { getCalculator } from "@/content/calculators/registry";
import { getPost } from "@/content/posts";

/** Width and height from a WebP header (lossy VP8, lossless VP8L or extended VP8X). */
function webpDimensions(bytes: Buffer) {
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("ascii")).toBe("WEBP");
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8 ") {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8X") {
    return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  }
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`Unknown WebP chunk ${chunk}`);
}

describe("the collection index as five chapters", () => {
  const chapters = educationChapters();

  it("is exactly the decision groups, in their order, numbered 01…", () => {
    expect(chapters.map((c) => c.group.id)).toEqual(EDUCATION_GROUPS.map((g) => g.id));
    chapters.forEach((chapter, index) => {
      expect(chapter.number).toBe(String(index + 1).padStart(2, "0"));
    });
  });

  it("uses unique, ASCII anchors that are also valid ids", () => {
    const anchors = chapters.map((c) => c.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
    for (const anchor of anchors) expect(anchor).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it("lists every education article exactly once, under its own group", () => {
    const listed = chapters.flatMap((c) => c.articles.map((a) => a.slug));
    expect([...listed].sort()).toEqual(EDUCATION_ARTICLES.map((a) => a.slug).sort());
    for (const chapter of chapters) {
      for (const entry of chapter.articles) {
        const article = EDUCATION_ARTICLES.find((a) => a.slug === entry.slug)!;
        expect(article.group).toBe(chapter.group.id);
      }
    }
  });

  it("shows each article's own registry title, excerpt, reading time and canonical URL", () => {
    for (const entry of chapters.flatMap((c) => c.articles)) {
      const post = getPost(entry.slug)!;
      expect(entry.href).toBe(`/blog/${entry.slug}/`);
      expect(entry.title).toBe(post.title);
      expect(entry.excerpt).toBe(post.excerpt);
      expect(entry.readingTime).toBe(post.readingTime);
    }
  });

  it("starts each chapter at its first article and sends the tool link to that article's live calculator", () => {
    for (const chapter of chapters) {
      const first = EDUCATION_ARTICLES.find((a) => a.group === chapter.group.id)!;
      expect(chapter.start.slug).toBe(first.slug);
      const tool = getCalculator(first.exercise.toolSlug)!;
      expect(tool.status).toBe("live");
      expect(chapter.tool.href).toBe(`/cong-cu/${first.exercise.toolSlug}/`);
    }
  });

  it("maps every group back to its chapter for article pages", () => {
    chapters.forEach((chapter) => {
      expect(chapterForGroup(chapter.group.id)).toEqual({
        number: chapter.number,
        anchor: chapter.anchor,
        label: chapter.label,
      });
    });
  });
});

describe("the chapter 01 illustration", () => {
  const picture = C.budgetIllustration;

  it("is the local WebP at the declared size", () => {
    expect(picture.src).toBe("/images/education/chapter-budget.webp");
    const bytes = readFileSync(join(process.cwd(), "public", picture.src));
    expect(webpDimensions(bytes)).toEqual({ width: picture.width, height: picture.height });
  });

  it("is labelled as an illustration, once, and states no figures", () => {
    expect(picture.caption).toBe("Minh họa cách chia ngân sách.");
    expect(picture.alt).toMatch(/^Minh họa/);
    expect(picture.alt).not.toMatch(/\d/);
    expect(picture.caption).not.toMatch(/\d/);
  });
});

describe("chapter hub typography", () => {
  // Scoped to the hub's own files; the shared header is not read or changed.
  const sources = [
    "app/blog/mua-nha-bang-con-so/page.tsx",
    "components/education/chapter-nav.tsx",
    "components/education/collection-hero.tsx",
  ].map(
    (file) => readFileSync(join(process.cwd(), file), "utf8"),
  );

  it("uses the self-hosted Inter weights only (400 body, 700 headings)", () => {
    expect(sources[0]).toContain("font-reading");
    for (const source of sources) {
      expect(source).not.toMatch(/\bfont-display\b/);
      // Inter is self-hosted at 400 and 700 only; 500/600 would be synthesised.
      expect(source).not.toMatch(/\bfont-(medium|semibold)\b/);
    }
  });
});

describe("chapter navigation is anchors, not tabs", () => {
  const chapters = educationChapters();
  const html = renderToStaticMarkup(
    createElement(ChapterNav, {
      label: C.chaptersLabel,
      chapters: chapters.map(({ anchor, number, label }) => ({ anchor, number, label })),
    }),
  );

  it("renders one in-page link per chapter with no tab semantics", () => {
    for (const chapter of chapters) expect(html).toContain(`href="#${chapter.anchor}"`);
    expect(html).not.toContain('role="tab');
    expect(html).not.toContain("aria-selected");
    expect(html).toContain(`aria-label="${C.chaptersLabel}"`);
  });
});

describe("education article template", () => {
  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s has unique heading ids that its contents links resolve to",
    (_slug, article) => {
      const ids = sectionIds(article);
      const all = [ids.answer, ids.contents, ids.household, ...ids.sections, ids.visual, ids.exercise, ids.limits, ids.sources, ids.next];
      expect(new Set(all).size).toBe(all.length);
      for (const id of all) expect(id).toMatch(/^[a-z0-9-]+$/);

      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article }));
      for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
        expect(html, `#${target} has no target`).toContain(`id="${target}"`);
      }
    },
  );

  it.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))(
    "%s offers its tool right after the short answer, before the worked example",
    (_slug, article) => {
      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article }));
      // Outside a Next build `<Link>` drops the trailing slash that
      // `trailingSlash: true` restores in the export; accept either.
      const toolHref = new RegExp(`href="/cong-cu/${article.exercise.toolSlug}/?"`, "g");
      const positions = [...html.matchAll(toolHref)].map((m) => m.index!);
      expect(positions.length).toBeGreaterThanOrEqual(2);
      expect(positions[0]).toBeGreaterThan(html.indexOf(`id="${sectionIds(article).answer}"`));
      expect(positions[0]).toBeLessThan(html.indexOf(`id="${sectionIds(article).household}"`));
      // The full exercise still links the same tool further down.
      expect(positions.at(-1)!).toBeGreaterThan(html.indexOf(`id="${sectionIds(article).exercise}"`));
    },
  );

  it("links each article back to its chapter on the index", () => {
    for (const article of EDUCATION_ARTICLES) {
      const html = renderToStaticMarkup(createElement(EducationArticleBody, { article }));
      const { anchor } = chapterForGroup(article.group);
      expect(html).toMatch(new RegExp(`href="/blog/mua-nha-bang-con-so/?#${anchor}"`));
    }
  });
});
