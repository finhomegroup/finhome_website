/**
 * /blog/ layout follow-up (docs/blog-layout-followup-2026-09-30.md): bounded
 * pagination, real publication dates, compact guide block.
 *
 * Server-rendered markup and pure helpers only. It proves structure, labels,
 * targets and dates; it cannot prove pixel positions, clipping or that a tap
 * lands — that is the independent browser review at 390px and desktop.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog/",
  notFound: () => {
    throw new Error("notFound");
  },
}));

import { BlogPagination } from "@/components/blog-pagination";
import { PostDate } from "@/components/post-date";
import { BLOG_PAGE_SIZE, paginationWindow } from "@/content/blog-pagination";
import { postDate } from "@/content/post-date";
import { POSTS, newsPosts, postKind } from "@/content/posts";

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const noop = () => {};
const pager = (page: number, pageCount: number, loading = false) =>
  html(createElement(BlogPagination, { page, pageCount, loading, onGo: noop }));
/** Every `<button …>` opening tag in markup. */
const buttons = (markup: string) => [...markup.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);
/** The rendered `<PostDate>` for a valid date; attribute case is React's, so match either. */
const timeTag = (date: string | undefined) => {
  const { iso, label } = postDate(date)!;
  return new RegExp(`<time datetime="${iso}"><span class="sr-only">Ngày đăng </span>${label.replace(/\//g, "\\/")}</time>`, "i");
};
const blogPage = async () => html(createElement((await import("@/app/blog/page")).default));
const articlePage = async (slug: string) => {
  const { default: Article } = await import("@/app/blog/[slug]/page");
  return html(await Article({ params: Promise.resolve({ slug }) }));
};

describe("paginationWindow: a bounded page list", () => {
  it("lists every page when there are seven or fewer", () => {
    for (let count = 1; count <= 7; count++) {
      for (let page = 1; page <= count; page++) {
        expect(paginationWindow(page, count)).toEqual(Array.from({ length: count }, (_, i) => i + 1));
      }
    }
  });

  it.each([8, 9, 21, 60])("never exceeds seven slots and always keeps first, last and current (%i pages)", (count) => {
    for (let page = 1; page <= count; page++) {
      const slots = paginationWindow(page, count);
      expect(slots.length).toBeLessThanOrEqual(7);
      expect(slots[0]).toBe(1);
      expect(slots.at(-1)).toBe(count);
      expect(slots).toContain(page);
      const numbers = slots.filter((s): s is number => s !== "gap");
      // Strictly ascending, and a gap never stands in for a single page.
      for (let i = 1; i < slots.length; i++) {
        const [prev, next] = [slots[i - 1], slots[i]];
        if (prev !== "gap" && next !== "gap") expect(next).toBe(prev + 1);
      }
      slots.forEach((slot, i) => {
        if (slot === "gap") expect((slots[i + 1] as number) - (slots[i - 1] as number)).toBeGreaterThan(2);
      });
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });

  it("gives the shape seen from the middle of the current 21-page feed", () => {
    expect(paginationWindow(1, 21)).toEqual([1, 2, 3, 4, 5, "gap", 21]);
    expect(paginationWindow(10, 21)).toEqual([1, "gap", 9, 10, 11, "gap", 21]);
    expect(paginationWindow(21, 21)).toEqual([1, "gap", 17, 18, 19, 20, 21]);
  });

  it("clamps out-of-range input instead of inventing pages", () => {
    expect(paginationWindow(99, 21)).toEqual(paginationWindow(21, 21));
    expect(paginationWindow(0, 21)).toEqual(paginationWindow(1, 21));
  });

  it("matches the real feed size (derived, not quoted)", () => {
    const count = Math.ceil(newsPosts().length / BLOG_PAGE_SIZE);
    expect(count).toBeGreaterThan(7); // the case that overflowed at 390px
    expect(paginationWindow(1, count).length).toBe(7);
  });
});

describe("BlogPagination markup", () => {
  it("renders nothing for a single page", () => {
    expect(pager(1, 1)).toBe("");
  });

  it("offers Trước, current/total and Sau for phones, and the bounded list from sm", () => {
    const m = pager(3, 21);
    expect(m).toContain('aria-label="Điều hướng trang"');
    expect(m).toMatch(/<button[^>]*aria-label="Trang trước"[^>]*>Trước<\/button>/);
    expect(m).toMatch(/<button[^>]*aria-label="Trang sau"[^>]*>Sau<\/button>/);
    // The phone status: visible "3 / 21", read as "Trang 3 trên 21".
    expect(m).toMatch(/<p class="[^"]*sm:hidden[^"]*"[^>]*aria-live="polite"/);
    expect(m.replace(/<[^>]+>/g, "")).toContain("Trang 3 /  trên 21");
    // The numbered list is hidden below sm and never holds every page.
    expect(m).toMatch(/<ol class="hidden[^"]*sm:flex/);
    const numbered = buttons(m).filter((b) => /aria-label="Trang \d+"/.test(b));
    expect(numbered.length).toBeLessThanOrEqual(7);
    expect(m).toMatch(/aria-label="Trang 1"/);
    expect(m).toMatch(/aria-label="Trang 21"/);
    expect(m).not.toMatch(/aria-label="Trang 10"/);
    expect(m).toMatch(/<button[^>]*aria-label="Trang 3"[^>]*aria-current="page"/);
  });

  it("gives every control a target of at least 44px and no fixed overflowing row", () => {
    const m = pager(3, 21);
    for (const b of buttons(m)) expect(b).toMatch(/\b(min-h-11|size-11)\b/);
    expect(m).toMatch(/<nav[^>]*class="[^"]*\bjustify-between\b/);
  });

  it("disables Trước on the first page, Sau on the last, and everything while loading", () => {
    const disabled = (m: string, label: string) =>
      buttons(m).find((b) => b.includes(`aria-label="${label}"`))!.includes('disabled=""');
    expect(disabled(pager(1, 21), "Trang trước")).toBe(true);
    expect(disabled(pager(1, 21), "Trang sau")).toBe(false);
    expect(disabled(pager(21, 21), "Trang sau")).toBe(true);
    expect(disabled(pager(21, 21), "Trang trước")).toBe(false);
    for (const b of buttons(pager(5, 21, true))) expect(b).toContain('disabled=""');
  });
});

describe("post dates: the registry's own date, formatted dd/mm/yyyy", () => {
  it("formats a real ISO day from its own digits", () => {
    expect(postDate("2026-09-30")).toEqual({ iso: "2026-09-30", label: "30/09/2026" });
    expect(postDate("2024-02-29")).toEqual({ iso: "2024-02-29", label: "29/02/2024" });
  });

  it.each([undefined, "", "2026-02-30", "2025-02-29", "2026-13-01", "2026-9-3", "30/09/2026", "2026-09-30T00:00:00Z"])(
    "shows nothing for %s",
    (value) => {
      expect(postDate(value)).toBeNull();
      expect(html(createElement(PostDate, { date: value }))).toBe("");
    },
  );

  it("renders a semantic <time> with a spoken prefix", () => {
    const m = html(createElement(PostDate, { date: "2026-09-30" }));
    expect(m).toMatch(new RegExp(`^${timeTag("2026-09-30").source}$`, "i"));
    expect(m).toContain(">30/09/2026</time>");
  });

  it("every news entry carries a valid date, so no card silently loses one", () => {
    for (const post of newsPosts()) expect(postDate(post.date), post.slug).not.toBeNull();
  });
});

describe("/blog/ renders dates, the bounded pager and the compact guide block", { timeout: 120_000 }, () => {
  const guides = POSTS.filter((p) => postKind(p) === "guide");

  it("dates each first-page market card with its own registry date", async () => {
    const page = await blogPage();
    for (const post of newsPosts().slice(0, BLOG_PAGE_SIZE)) expect(page, post.slug).toMatch(timeTag(post.date));
    // Guides and the collection are not market cards and carry no date here.
    const block = page.slice(page.indexOf('data-tool-guides="true"'), page.indexOf('id="tin-thi-truong"'));
    expect(block).not.toContain("<time");
  });

  it("uses the bounded pager on the page itself", async () => {
    const page = await blogPage();
    const nav = page.slice(page.indexOf('data-blog-pagination="true"'));
    expect(nav).toContain('aria-label="Trang trước"');
    expect(buttons(nav.slice(0, nav.indexOf("</nav>"))).length).toBeLessThanOrEqual(9);
  });

  it("shows three guides, then a disclosure holding the rest, every guide linked exactly once", async () => {
    const page = await blogPage();
    expect(guides.length).toBeGreaterThan(3); // otherwise the disclosure is untested
    const section = page.slice(page.indexOf('data-tool-guides="true"'), page.indexOf('id="tin-thi-truong"'));
    const detailsAt = section.indexOf("<details");
    expect(detailsAt).toBeGreaterThan(0);
    const before = section.slice(0, detailsAt);
    const inside = section.slice(detailsAt);
    guides.forEach((post, index) => {
      const href = `href="/blog/${post.slug}/?"`;
      expect(section.match(new RegExp(href, "g"))?.length, post.slug).toBe(1);
      expect(index < 3 ? before : inside, post.slug).toMatch(new RegExp(href));
    });
    // The summary is a real, labelled toggle with the derived count.
    expect(inside).toMatch(/<summary[^>]*min-h-11[^>]*>/);
    expect(inside).toContain(`Xem tất cả ${guides.length} bài hướng dẫn`);
    expect(inside).toContain("Thu gọn");
    // Closed by default and no script needed: native details, no `open`.
    expect(inside).not.toMatch(/<details[^>]*\bopen\b/);
  });

  it("keeps the two reading paths and each guide's wording", async () => {
    const page = await blogPage();
    expect(page).toContain('data-blog-paths="true"');
    expect(page).toContain('href="#tin-thi-truong"');
    for (const post of guides) expect(page).toContain(post.title);
    expect(page.match(/Đọc và thử với số của bạn →/g)?.length).toBe(guides.length);
  });
});

describe("article header date", { timeout: 120_000 }, () => {
  /** From the H1 to the end of the meta line under it. */
  const header = (m: string) => m.slice(m.indexOf("<h1"), m.indexOf("</h1>") + 800);

  it("shows the news post's own date in the header", async () => {
    const post = newsPosts()[0];
    expect(header(await articlePage(post.slug))).toMatch(timeTag(post.date));
  });

  it("adds no date to guides or collection articles", async () => {
    const guide = POSTS.find((p) => postKind(p) === "guide")!;
    const education = POSTS.find((p) => postKind(p) === "education")!;
    for (const slug of [guide.slug, education.slug]) {
      expect(header(await articlePage(slug)), slug).not.toMatch(/<time\b/);
    }
  });
});
