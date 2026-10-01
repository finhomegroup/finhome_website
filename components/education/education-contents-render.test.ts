/**
 * The shared in-page contents of every "Mua nhà bằng con số" article.
 *
 * Server markup only — no jsdom, no browser. What is checked: the ordered
 * anchors, the semantics, the no-JavaScript default (the phone's `<details>`
 * is closed and native), which copy each breakpoint shows by class, and that
 * the two presentations carry the same links with no duplicate id. What is
 * NOT checked: pixels, the 44 px row as rendered, contrast, the open
 * animation, or the scroll offset under the fixed header — those need a
 * browser at a stated viewport.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EducationArticleBody, sectionIds } from "@/components/education/education-article";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { markupRegion } from "@/lib/markup-region";
import type { EducationArticle } from "@/content/education/types";

const render = (article: EducationArticle) =>
  renderToStaticMarkup(createElement(EducationArticleBody, { article }));

/**
 * The element opened by the first `<tag` at or before `marker`, through its
 * first `</tag>`. Only for tags that do not nest in this markup — `nav`,
 * `details`, `summary` here — which `markupRegion`'s depth count is not
 * typed for.
 */
function element(html: string, marker: string, tag: "nav" | "details" | "summary"): string {
  const at = html.indexOf(marker);
  if (at === -1) return "";
  const open = html.lastIndexOf(`<${tag}`, at);
  const close = html.indexOf(`</${tag}>`, at);
  return open === -1 || close === -1 ? "" : html.slice(open, close);
}

/** The links the contents must offer, in reading order, with full labels. */
function expected(article: EducationArticle) {
  const ids = sectionIds(article);
  return [
    { id: ids.answer, label: C.article.answerTitle },
    { id: ids.household, label: article.household.title },
    ...article.sections.map((s, i) => ({ id: ids.sections[i], label: s.heading })),
    { id: ids.visual, label: C.article.visualReadingTitle },
    { id: ids.exercise, label: article.exercise.title },
    { id: ids.limits, label: article.limits.title },
    { id: ids.sources, label: article.sources.title },
  ];
}

/** `{ id, label }` for each row of one presentation. */
function rows(region: string) {
  return [
    ...region.matchAll(/<a href="#([^"]+)"[^>]*>[\s\S]*?<span class="min-w-0">([\s\S]*?)<\/span><\/a>/g),
  ].map(([, id, label]) => ({ id, label }));
}

const unescape = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

describe.each(EDUCATION_ARTICLES.map((a) => [a.slug, a] as const))("%s contents", (_slug, article) => {
  const html = render(article);
  const nav = element(html, 'data-education-contents="true"', "nav");
  const mobile = element(nav, 'data-contents="mobile"', "details");
  const desktop = markupRegion(nav, 'data-contents="desktop"', "div") ?? "";
  const want = expected(article);

  it("is ONE labelled nav landmark, holding the two presentations", () => {
    expect(html.split("<nav").length - 1).toBe(1);
    expect(nav).toMatch(/^<nav id="trong-bai-nay" aria-label="Trong bài này"/);
    expect(mobile).not.toBe("");
    expect(desktop).not.toBe("");
  });

  it("links every section, in order, with its full heading — in both presentations", () => {
    for (const region of [mobile, desktop]) {
      expect(rows(region).map((r) => ({ id: r.id, label: unescape(r.label) }))).toEqual(want);
    }
    // Each target exists exactly once in the page.
    for (const { id } of want) expect(html.split(`id="${id}"`).length - 1, `#${id}`).toBe(1);
    // Nothing shortens a label.
    expect(nav).not.toMatch(/truncate|line-clamp|text-ellipsis|…/);
  });

  it("adds no duplicate id anywhere on the page", () => {
    const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(all.length).toBe(new Set(all).size);
  });

  it("is closed and native on a phone without JavaScript, and says how many items", () => {
    const open = mobile.match(/^<details[^>]*>/)?.[0] ?? "";
    expect(open).toContain("md:hidden");
    expect(open).not.toMatch(/\sopen(=|\s|>)/);
    const summary = element(mobile, "<summary", "summary");
    expect(summary).toContain(C.article.contentsTitle);
    expect(summary).toContain(C.article.contentsShow.replace("{count}", String(want.length)));
    expect(summary).toContain(C.article.contentsHide);
    // The native marker is replaced by a drawn chevron hidden from AT.
    expect(summary).toContain("[&amp;::-webkit-details-marker]:hidden");
    expect(summary).toMatch(/<svg aria-hidden="true" focusable="false"/);
    expect(summary).not.toContain("<a ");
  });

  it("is always shown from md, under a heading, in one column", () => {
    expect(desktop).toMatch(/^<div data-contents="desktop" class="hidden md:block">/);
    expect(desktop).toContain(`>${C.article.contentsTitle}</h2>`);
    expect(nav).not.toMatch(/grid-cols-|columns-\d/);
  });

  it("gives every row a full-width 44 px target, divided, dark on white", () => {
    expect(nav).toContain("bg-white");
    expect(nav).toContain('role="list"');
    expect(nav).toContain("divide-y");
    const links = [...nav.matchAll(/<a href="#[^"]+" class="([^"]+)"/g)].map((m) => m[1]);
    expect(links).toHaveLength(want.length * 2);
    for (const cls of links) {
      expect(cls).toContain("min-h-11");
      expect(cls).toContain("w-full");
      expect(cls).toMatch(/(^|\s)text-ink(\s|$)/);
      expect(cls).toContain("focus-visible:outline");
    }
  });

  it("ships no script and no handler", () => {
    expect(nav).not.toMatch(/<script|onclick/i);
  });
});

it("opens C01 with its AI hero before the contents; the balance illustration moved into the body, after the contents", () => {
  const c01 = EDUCATION_ARTICLES.find((a) => a.slug === "co-600-trieu-nen-tim-nha-tam-gia-nao")!;
  const html = render(c01);
  const hero = html.indexOf('data-article-hero="true"');
  const figure = html.indexOf('data-education-illustration="true"');
  const contents = html.indexOf('data-education-contents="true"');
  expect(html.indexOf(C.article.earlyToolLead)).toBeLessThan(hero);
  expect(hero).toBeLessThan(contents);
  // Exactly one image opens the article; the concept figure follows the contents.
  expect(figure).toBeGreaterThan(contents);
});
