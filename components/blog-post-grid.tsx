"use client";

import { useEffect, useRef, useState } from "react";
import { PostCardLink } from "@/components/post-card-link";
import { PostDate } from "@/components/post-date";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_POINTER,
} from "@/lib/interaction-styles";
import { postCover } from "@/content/post-cover";
import { postDate } from "@/content/post-date";
import { BlogPagination } from "@/components/blog-pagination";
import type { Post } from "@/content/posts";
import { TOPICS, topicLabel } from "@/content/blog-topics";
import {
  createFeedNavigator,
  feedParams,
  feedUrl,
  type FeedPage,
  type TopicFilter,
} from "@/components/blog-feed-navigation";

async function fetchFeedPage(topic: TopicFilter, page: number): Promise<FeedPage> {
  const qs = new URLSearchParams({ page: String(page) });
  if (topic !== "all") qs.set("topic", topic);
  const res = await fetch(`/api/blog-posts?${qs.toString()}`);
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export function BlogPostGrid({
  initialPosts,
  pageCount: initialPageCount,
}: {
  initialPosts: Post[];
  pageCount: number;
}) {
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // One navigator for the component's lifetime. It owns the LIVE feed state,
  // so the popstate listener below (registered once) never reads a stale
  // render's topic/page — see components/blog-feed-navigation.ts.
  const [nav] = useState(() =>
    createFeedNavigator({
      initial: { topic: "all", page: 1, pageCount: initialPageCount, posts: initialPosts },
      fetchPage: fetchFeedPage,
      onState: (s) => {
        setTopic(s.topic);
        setPage(s.page);
        setPageCount(s.pageCount);
        setPosts(s.posts);
      },
      onLoading: setLoading,
      writeUrl: (t, p) => window.history.pushState(null, "", feedUrl(window.location.href, t, p)),
    }),
  );

  /** A user choice: pushes a history entry and scrolls to the grid when applied. */
  async function load(nextTopic: TopicFilter, nextPage: number) {
    if (await nav.go(nextTopic, nextPage)) {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    // Opening /blog/?page=… directly, and Back/Forward: follow the URL, never
    // push a new entry, never scroll.
    const followUrl = () => {
      const { topic: t, page: p } = feedParams(window.location.search);
      void nav.go(t, p, { fromHistory: true });
    };
    const initial = feedParams(window.location.search);
    if (initial.topic !== "all" || initial.page !== 1) queueMicrotask(followUrl);
    window.addEventListener("popstate", followUrl);
    return () => window.removeEventListener("popstate", followUrl);
  }, [nav]);

  return (
    <div ref={gridRef}>
      <div className="mt-12 flex flex-wrap justify-center gap-2" role="group" aria-label="Lọc theo chủ đề">
        <button
          type="button"
          onClick={() => load("all", 1)}
          disabled={loading}
          aria-pressed={topic === "all"}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none",
            FH_POINTER,
            topic === "all"
              ? "bg-brand-green-ink text-white"
              : "border border-ink-4/40 text-ink-2 hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green-ink",
          )}
        >
          Tất cả
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => load(t.id, 1)}
            disabled={loading}
            aria-pressed={topic === t.id}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none",
              FH_POINTER,
              topic === t.id
                ? "bg-brand-green-ink text-white"
                : "border border-ink-4/40 text-ink-2 hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <p className="mt-12 text-center text-sm text-ink-2">
          Chưa có bài viết nào cho chủ đề này.
        </p>
      )}

      <div
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
                src={img(postCover(post))}
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
              <span className="text-xs font-medium uppercase tracking-wide text-primary-ink">
                {post.category}
              </span>
              <h2 className="mt-2 font-display text-xl leading-snug text-ink">
                {post.title}
              </h2>
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-2">
                {post.excerpt}
              </p>
              <span className="mt-4 text-xs text-ink-3">
                <PostDate date={post.date} />
                {postDate(post.date) ? " · " : ""}
                {post.readingTime}
                {post.source ? ` · Theo ${post.source.name}` : ""}
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {post.topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-brand-green-ink/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-green-ink"
                  >
                    {topicLabel(t)}
                  </span>
                ))}
              </span>
            </div>
          </PostCardLink>
        ))}
      </div>

      <BlogPagination
        page={page}
        pageCount={pageCount}
        loading={loading}
        onGo={(n) => load(topic, n)}
      />
    </div>
  );
}
