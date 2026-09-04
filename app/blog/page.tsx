import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/reveal";
import { BlogPostGrid } from "@/components/blog-post-grid";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { PUBLIC_POSTS } from "@/content/posts";
import { BLOG_PAGE_SIZE } from "@/content/blog-pagination";
import { canonicalPath } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tin tức bất động sản",
  description: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở.",
  alternates: { canonical: canonicalPath("/blog") },
  openGraph: {
    type: "website",
    url: canonicalPath("/blog"),
    title: "Tin tức bất động sản — FinHome",
    description: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở.",
  },
};

export default function BlogPage() {
  const pageCount = Math.max(1, Math.ceil(PUBLIC_POSTS.length / BLOG_PAGE_SIZE));
  const initialPosts = PUBLIC_POSTS.slice(0, BLOG_PAGE_SIZE);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-3xl text-center">
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
            </Reveal>

            <BlogPostGrid initialPosts={initialPosts} pageCount={pageCount} />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
