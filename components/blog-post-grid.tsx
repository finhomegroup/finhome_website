"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { PostCardLink } from "@/components/post-card-link";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_POINTER,
} from "@/lib/interaction-styles";
import type { Post } from "@/content/posts";

type BlogPostsResponse = {
  posts: Post[];
  page: number;
  pageCount: number;
  total: number;
};

export function BlogPostGrid({
  initialPosts,
  pageCount,
}: {
  initialPosts: Post[];
  pageCount: number;
}) {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  async function goToPage(next: number) {
    const clamped = Math.min(Math.max(next, 1), pageCount);
    if (clamped === page || loading) return;

    if (clamped === 1) {
      setPage(1);
      setPosts(initialPosts);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog-posts?page=${clamped}`);
      if (!res.ok) throw new Error("Failed to load posts");
      const data: BlogPostsResponse = await res.json();
      if (requestIdRef.current !== requestId) return;
      setPosts(data.posts);
      setPage(data.page);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // keep current page on failure
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }

  return (
    <div ref={gridRef}>
      <Reveal
        className={cn(
          "mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 transition-opacity",
          loading && "opacity-50",
        )}
      >
        {posts.map((post, index) => (
          <PostCardLink
            key={post.slug}
            post={post}
            className={cn(
              "group flex flex-col overflow-hidden rounded-[20px] bg-white p-4",
              FH_CLICKABLE_CARD,
            )}
          >
            <div className="overflow-hidden rounded-xl">
              <img
                src={img(post.cover)}
                alt={post.title}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
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
                {post.source ? ` · Theo ${post.source.name}` : ""}
              </span>
            </div>
          </PostCardLink>
        ))}
      </Reveal>

      {pageCount > 1 && (
        <nav
          aria-label="Điều hướng trang"
          className="mt-12 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || loading}
            className={cn(
              "rounded-full border border-ink-4/40 px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green disabled:pointer-events-none disabled:opacity-40",
              FH_POINTER,
            )}
          >
            Trước
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goToPage(n)}
              disabled={loading}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "h-10 w-10 rounded-full text-sm font-medium transition-colors disabled:pointer-events-none",
                FH_POINTER,
                n === page
                  ? "bg-brand-green text-white"
                  : "text-ink-2 hover:bg-brand-green/10",
              )}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === pageCount || loading}
            className={cn(
              "rounded-full border border-ink-4/40 px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green disabled:pointer-events-none disabled:opacity-40",
              FH_POINTER,
            )}
          >
            Sau
          </button>
        </nav>
      )}
    </div>
  );
}
