import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { collectionOutline } from "@/content/education/articles";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { canonicalPath, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: canonicalPath(C.slug),
  title: C.metaTitle,
  description: C.metaDescription,
});

/**
 * The collection index.
 *
 * A STATIC segment under `app/blog/`, so it sits inside the blog information
 * architecture and takes precedence over `app/blog/[slug]`. `POSTS` contains
 * no entry with this slug, so the dynamic route never tries to build it.
 *
 * No `<Reveal>`: the list of articles is the only way into the collection and
 * must be visible without JavaScript, for the same reason the tool hub's
 * catalogue is.
 */
export default function EducationCollectionPage() {
  const outline = collectionOutline();
  const total = outline.reduce((sum, entry) => sum + entry.articles.length, 0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink",
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
              {C.toNewsCta}
            </Link>

            <h1 className="mt-6 font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
              {C.pageTitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-2">
              {C.lede}
            </p>

            {/* What this is not. Stated on the index, not only in each piece. */}
            <div className="mt-6 rounded-2xl bg-bg-soft p-5">
              <h2 className="font-display text-base font-medium text-ink">
                {C.scopeTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                {C.scopeBody}
              </p>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="font-display text-xl font-medium text-ink md:text-2xl">
              {C.groupsTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              {C.groupsNote} Hiện có {total} bài.
            </p>

            <div className="mt-8 space-y-10">
              {outline.map(({ group, articles }) => (
                <section key={group.id} aria-labelledby={`nhom-${group.id}`}>
                  <h3
                    id={`nhom-${group.id}`}
                    className="font-display text-lg font-medium text-ink"
                  >
                    {group.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">
                    {group.question}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-3">
                    {group.boundary}
                  </p>

                  <ul className="mt-4 space-y-3">
                    {articles.map((article) => {
                      const tool = getCalculator(article.exercise.toolSlug);
                      return (
                        <li key={article.slug}>
                          <Link
                            href={`/blog/${article.slug}/`}
                            className={cn(
                              "flex flex-col rounded-2xl border border-ink-4/15 bg-white p-4 transition-colors hover:border-brand-green/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
                              FH_POINTER,
                            )}
                          >
                            <span className="font-display text-base font-medium leading-snug text-ink">
                              {article.question}
                            </span>
                            <span className="mt-2 text-sm leading-relaxed text-ink-2">
                              {article.shortAnswer[0]}
                            </span>
                            {tool ? (
                              <span className="mt-3 text-sm font-medium text-brand-green-ink">
                                Bài tập trên: {tool.title}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            {/* Two-way discovery: back to the tools, and back to the feed. */}
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              <Link
                href={`${calculatorPath("kha-nang-mua-nha")}/`}
                className={cn(
                  "flex flex-col rounded-2xl bg-bg-soft p-5 transition-colors hover:bg-bg-soft/70",
                  FH_POINTER,
                )}
              >
                <span className="font-display text-base font-medium text-ink">
                  Bắt đầu từ công cụ
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-2">
                  Nếu bạn muốn tính trước rồi đọc sau, mở công cụ Khả năng mua
                  nhà và nhập số của mình.
                </span>
              </Link>
              <Link
                href="/blog"
                className={cn(
                  "flex flex-col rounded-2xl bg-bg-soft p-5 transition-colors hover:bg-bg-soft/70",
                  FH_POINTER,
                )}
              >
                <span className="font-display text-base font-medium text-ink">
                  {C.toNewsTitle}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-2">
                  {C.toNewsBody}
                </span>
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
