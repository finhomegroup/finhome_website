import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { BlogPostGrid } from "@/components/blog-post-grid";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { newsPosts } from "@/content/posts";
import { EDUCATION_COLLECTION } from "@/content/education/collection";
import { BLOG_PAGE_SIZE } from "@/content/blog-pagination";
import { canonicalPath, pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  path: canonicalPath("/blog"),
  title: "Tin tức bất động sản",
  description: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở.",
});

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
                Tin tức bất động sản
              </h1>
              <p className="mt-4 text-lg text-ink-2">
                Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở
              </p>
            </div>

            {/* Two-way discovery: the feed points at the collection. Not a
                fifth topic filter — a separate kind of reading. */}
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-bg-soft p-5 md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <h2 className="font-display text-base font-medium text-ink">
                  {EDUCATION_COLLECTION.fromNewsTitle}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">
                  {EDUCATION_COLLECTION.fromNewsBody}
                </p>
              </div>
              <Link
                href={`${EDUCATION_COLLECTION.slug}/`}
                className={cn(
                  "mt-3 inline-flex min-h-11 shrink-0 items-center rounded-full border border-ink-4/35 bg-white px-5 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:text-brand-green-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green md:mt-0",
                  FH_POINTER,
                )}
              >
                {EDUCATION_COLLECTION.fromNewsCta}
              </Link>
            </div>

            <BlogPostGrid initialPosts={initialPosts} pageCount={pageCount} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
