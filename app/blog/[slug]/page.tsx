import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Markdown } from "@/components/markdown";
import { PostCardLink } from "@/components/post-card-link";
import { SourceAttribution } from "@/components/source-attribution";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_POINTER,
} from "@/lib/interaction-styles";
import { EducationArticleBody } from "@/components/education/education-article";
import { getEducationArticle } from "@/content/education/articles";
import { POSTS, getPost, postCover, postKind } from "@/content/posts";
import { canonicalPath, absUrl, articleSchema, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = canonicalPath(`/blog/${post.slug}`);
  const cover = absUrl(img(postCover(post)));
  return pageMetadata({
    path: url,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    image: { url: cover, alt: post.title },
    ...(post.date ? { publishedTime: post.date } : {}),
  });
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
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const kind = postKind(post);
  const education = kind === "education" ? getEducationArticle(slug) : undefined;
  if (kind === "education" && !education) {
    // A registry entry marked as education with no article behind it would
    // render an empty page in the sitemap. Fail the build instead.
    throw new Error(
      `app/blog/[slug]: "${slug}" is kind "education" but has no entry in content/education/articles.ts`,
    );
  }

  // Only news posts have a markdown body on disk; an education article's body
  // is structured data, so nothing is read from the filesystem for it.
  const body = education
    ? null
    : await fs.readFile(
        path.join(process.cwd(), "content/posts", slug + ".md"),
        "utf8",
      );

  // Related stays inside the same kind: an evergreen exercise under a dated
  // market report reads as though the exercise were news, and vice versa.
  const related = POSTS.filter(
    (p) => p.slug !== slug && postKind(p) === kind,
  ).slice(0, 3);

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <SiteHeader />
      <main>
        <article className="py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              <Link
                href={education ? "/blog/mua-nha-bang-con-so/" : "/blog"}
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
                {education ? "Quay lại Mua nhà bằng con số" : "Quay lại Tin tức"}
              </Link>

              <h1 className="mt-8 font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
                <span className="font-medium uppercase tracking-wide text-primary-ink">
                  {post.category}
                </span>
                <span aria-hidden="true" className="text-ink-4">
                  ·
                </span>
                <span>{post.readingTime}</span>
                {post.source ? (
                  <>
                    <span aria-hidden="true" className="text-ink-4">
                      ·
                    </span>
                    <span>Theo {post.source.name}</span>
                  </>
                ) : null}
              </div>

              {post.source ? (
                <SourceAttribution
                  name={post.source.name}
                  url={post.source.url}
                />
              ) : null}
            </div>

            {/* A photograph only where one exists. Education articles have no
                cover: their visual is a rendered SVG from the calculator's own
                engine, and a stock image would be the only invented thing on
                the page. */}
            {post.cover ? (
              <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl">
                <img
                  src={img(post.cover)}
                  alt={post.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            ) : null}

            <div className="mx-auto mt-10 max-w-3xl">
              {education ? (
                <EducationArticleBody article={education} />
              ) : (
                <Markdown source={body ?? ""} />
              )}
            </div>
          </Container>
        </article>

        <section className="border-t border-ink-4/15 bg-bg-soft py-16 md:py-24">
          <Container>
            <div>
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                Bài viết liên quan
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {related.map((p) => (
                <PostCardLink
                  key={p.slug}
                  post={p}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4",
                    FH_CLICKABLE_CARD,
                  )}
                >
                  {p.cover ? (
                    <div className="overflow-hidden rounded-xl">
                      <img
                        src={img(p.cover)}
                        alt={p.title}
                        className={cn(
                          "aspect-[3/2] w-full object-cover",
                          FH_CARD_IMAGE_ZOOM,
                        )}
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-2 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary-ink">
                      {p.category}
                    </span>
                    <h3 className="mt-2 font-display text-lg leading-snug text-ink">
                      {p.title}
                    </h3>
                    <span className="mt-3 text-xs text-ink-3">
                      {p.readingTime}
                      {p.source ? ` · Theo ${p.source.name}` : ""}
                    </span>
                  </div>
                </PostCardLink>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
