import type { Metadata } from "next";
import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
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
import { POSTS, getPost } from "@/content/posts";
import { canonicalPath, absUrl, articleSchema } from "@/lib/seo";
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
  const cover = absUrl(img(post.cover));
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} — FinHome`,
      description: post.excerpt,
      ...(post.date ? { publishedTime: post.date } : {}),
      images: [{ url: cover, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — FinHome`,
      description: post.excerpt,
      images: [cover],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const body = await fs.readFile(
    path.join(process.cwd(), "content/posts", slug + ".md"),
    "utf8",
  );

  const related = POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <SiteHeader />
      <main>
        <article className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-3xl">
              <Link
                href="/blog"
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
                Quay lại Tin tức
              </Link>
              <span className="inline-block rounded-full bg-bg-soft px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                {post.category}
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-ink-3">{post.readingTime}</p>
              {post.source ? (
                <SourceAttribution
                  name={post.source.name}
                  url={post.source.url}
                />
              ) : null}
            </Reveal>

            <Reveal className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl">
              <img
                src={img(post.cover)}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </Reveal>

            <div className="mx-auto mt-10 max-w-3xl">
              <Markdown source={body} />
            </div>
          </Container>
        </article>

        <section className="border-t border-ink-4/15 bg-bg-soft py-16 md:py-24">
          <Container>
            <Reveal>
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                Bài viết liên quan
              </h2>
            </Reveal>
            <Reveal className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
              {related.map((p) => (
                <PostCardLink
                  key={p.slug}
                  post={p}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4",
                    FH_CLICKABLE_CARD,
                  )}
                >
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
                  <div className="flex flex-1 flex-col gap-2 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
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
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
