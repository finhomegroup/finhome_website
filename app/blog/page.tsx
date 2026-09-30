import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { BlogPostGrid } from "@/components/blog-post-grid";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { newsPosts, POSTS, postKind, type Post } from "@/content/posts";
import { EDUCATION_COLLECTION } from "@/content/education/collection";
import { BLOG_PAGE_SIZE } from "@/content/blog-pagination";
import { canonicalPath, pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  path: canonicalPath("/blog"),
  title: "Bài viết về tài chính gia đình và bất động sản",
  description: "Hướng dẫn tài chính dễ hiểu qua ví dụ và công cụ, cùng tin thị trường, giá cả và chính sách nhà ở.",
});

/** Guides shown before "Xem tất cả …"; the rest stay one click away. */
const GUIDE_PREVIEW = 3;

/**
 * Compact guide cards: a row with a small cover on a phone, a three-column
 * card from `sm`. Title and CTA wording are unchanged from the stacked list
 * they replace; the excerpt shows from `sm`, clamped to two lines.
 */
function GuideList({ posts }: { posts: Post[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}/`}
            className={cn(
              "flex h-full items-center gap-3 rounded-2xl border border-ink-4/15 bg-white p-3 text-left transition-colors hover:border-brand-green/40 sm:flex-col sm:items-stretch sm:gap-0 sm:p-4",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
              FH_POINTER,
            )}
          >
            {post.cover ? (
              <img
                src={post.cover}
                alt=""
                width={1200}
                height={630}
                loading="lazy"
                decoding="async"
                className="aspect-[1200/630] w-24 shrink-0 rounded-lg object-cover sm:w-full sm:rounded-xl"
              />
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col sm:mt-3">
              <span className="block font-display text-base leading-snug text-ink">{post.title}</span>
              <span className="mt-1 hidden text-sm leading-relaxed text-ink-2 sm:line-clamp-2">{post.excerpt}</span>
              <span className="mt-1.5 block text-sm font-medium text-brand-green-ink sm:mt-auto sm:pt-2">
                Đọc và thử với số của bạn →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * NO `<Reveal>` ON THIS SURFACE, and it used to have it.
 *
 * `Reveal` server-renders `style="opacity:0;transform:translateY(24px)"` —
 * framer-motion's `initial` — and animates in on scroll. That is fine for a
 * marketing section and wrong for a content index, which is the distinction
 * the tool hub's own docstring draws and `/blog/mua-nha-bang-con-so/` already
 * follows. Measured on the built export on 2026-09-16, before this change:
 *
 *   /blog/                  80.1% of visible text hidden until JS ran
 *   a news post page        21.9%
 *   an education article     3.7%
 *   the collection index     0.0%   <- already correct
 *   /cong-cu/ and all 75
 *   calculator pages         0.0%   <- already correct
 *
 * On `/blog/` the two hidden blocks were the hero (back-link, h1, lede) and
 * the ENTIRE post grid, so without JavaScript the page had no headline and no
 * articles; 173 of 174 post pages hid their own header, cover and related
 * list. `prefers-reduced-motion` did not save it either — `Reveal` drops the
 * translate and the duration for that setting but still starts at opacity 0.
 *
 * The marketing surfaces keep `Reveal` deliberately: the homepage (24 blocks)
 * and `/vision/` (6) are not the only route to anything.
 */
export default function BlogPage() {
  // The feed is news only. The education collection is linked below instead,
  // so an evergreen exercise never sits in a dated list.
  const news = newsPosts();
  const pageCount = Math.max(1, Math.ceil(news.length / BLOG_PAGE_SIZE));
  const initialPosts = news.slice(0, BLOG_PAGE_SIZE);
  const guides = POSTS.filter((post) => postKind(post) === "guide");
  const pathCard = cn(
    "flex h-full flex-col rounded-2xl border border-ink-4/15 bg-white p-5 text-left transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
    FH_POINTER,
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <Link
                href="/"
                className={cn(
                  "mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink",
                  FH_POINTER,
                )}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại trang chủ
              </Link>
              <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
                Bài viết
              </h1>
              <p className="mt-4 text-lg text-ink-2">
                Hướng dẫn dễ hiểu về tài chính gia đình và tin thị trường bất động sản
              </p>
            </div>

            {/* THE TWO READING PATHS (map B01/B02): the existing collection,
                and the existing feed below on this same page. No new hub, no
                new URL — the second card is an in-page anchor. */}
            <nav aria-label="Chọn cách đọc" data-blog-paths="true" className="mx-auto mt-10 max-w-3xl">
              <ul className="grid gap-4 sm:grid-cols-2">
                <li>
                  <Link href={`${EDUCATION_COLLECTION.slug}/`} className={pathCard}>
                    {/* Named for what it holds: the home-buying collection.
                        "Hướng dẫn dễ hiểu" also described the car guide below
                        and sent readers of it to the wrong set. */}
                    <span className="font-display text-lg font-medium text-ink">{EDUCATION_COLLECTION.name}</span>
                    <span className="mt-2 text-sm leading-relaxed text-ink-2">
                      {EDUCATION_COLLECTION.fromNewsBody}
                    </span>
                    <span className="mt-3 text-sm font-medium text-brand-green-ink">
                      {EDUCATION_COLLECTION.fromNewsCta}
                    </span>
                  </Link>
                </li>
                <li>
                  <a href="#tin-thi-truong" className={pathCard}>
                    <span className="font-display text-lg font-medium text-ink">
                      {EDUCATION_COLLECTION.toNewsTitle}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-ink-2">
                      {EDUCATION_COLLECTION.toNewsBody}
                    </span>
                    <span className="mt-3 text-sm font-medium text-brand-green-ink">
                      {EDUCATION_COLLECTION.toNewsCta}
                    </span>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Tool guides: the first GUIDE_PREVIEW as compact cards, the rest
                behind a native <details>. Every link is in the server HTML;
                the summary sits between the two lists, so opening and closing
                never moves it or the focus away from where the reader is. */}
            <section aria-labelledby="tool-guides-title" data-tool-guides="true" className="mx-auto mt-12 max-w-3xl">
              <h2 id="tool-guides-title" className="font-display text-2xl text-ink">Tính thử trước khi quyết định</h2>
              <GuideList posts={guides.slice(0, GUIDE_PREVIEW)} />
              {guides.length > GUIDE_PREVIEW ? (
                <details className="group mt-3">
                  <summary
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full text-sm font-medium text-brand-green-ink [&::-webkit-details-marker]:hidden",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                      FH_POINTER,
                    )}
                  >
                    <span className="group-open:hidden">Xem tất cả {guides.length} bài hướng dẫn</span>
                    <span className="hidden group-open:inline">Thu gọn</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="transition-transform group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <GuideList posts={guides.slice(GUIDE_PREVIEW)} />
                </details>
              ) : null}
            </section>

            <section
              id="tin-thi-truong"
              aria-labelledby="tin-thi-truong-title"
              className="mt-16 scroll-mt-28 md:mt-20"
            >
              <h2
                id="tin-thi-truong-title"
                className="text-center font-display text-2xl leading-tight text-ink md:text-3xl"
              >
                {EDUCATION_COLLECTION.toNewsTitle}
              </h2>
              <BlogPostGrid initialPosts={initialPosts} pageCount={pageCount} />
            </section>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
