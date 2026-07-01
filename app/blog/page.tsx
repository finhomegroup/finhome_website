import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import { FH_CARD_IMAGE_ZOOM, FH_CLICKABLE_CARD } from "@/lib/interaction-styles";
import { POSTS } from "@/content/posts";

export const metadata: Metadata = {
  title: "Tin tức bất động sản — FinHome",
  description:
    "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở.",
};

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
                Tin tức bất động sản
              </h1>
              <p className="mt-4 text-lg text-ink-2">
                Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở
              </p>
            </Reveal>

            <Reveal className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4",
                    FH_CLICKABLE_CARD,
                  )}
                >
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={img(post.cover)}
                      alt={post.title}
                      className={cn(
                        "aspect-[3/2] w-full object-cover",
                        FH_CARD_IMAGE_ZOOM,
                      )}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {post.category}
                    </span>
                    <h2 className="mt-2 font-display text-xl leading-snug text-ink">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-2">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 text-xs text-ink-3">
                      {post.readingTime}
                    </span>
                  </div>
                </Link>
              ))}
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
