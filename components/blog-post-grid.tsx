"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { PostCardLink } from "@/components/post-card-link";
import { img } from "@/lib/images";
import { cn } from "@/lib/cn";
import {
  FH_CARD_IMAGE_ZOOM,
  FH_CLICKABLE_CARD,
  FH_POINTER,
} from "@/lib/interaction-styles";
import type { Post, Topic } from "@/content/posts";
import { TOPICS, topicLabel } from "@/content/blog-topics";

type TopicFilter = Topic | "all";

type BlogPostsResponse = {
  posts: Post[];
  page: number;
  pageCount: number;
  total: number;
};

const TOPIC_IDS = new Set<string>(TOPICS.map((t) => t.id));

function paramsFromUrl(): { topic: TopicFilter; page: number } {
  const search = new URLSearchParams(window.location.search);
  const rawTopic = search.get("topic");
  const topic: TopicFilter = rawTopic && TOPIC_IDS.has(rawTopic) ? (rawTopic as Topic) : "all";
  const page = Math.max(Number(search.get("page")) || 1, 1);
  return { topic, page };
}

function writeParamsToUrl(topic: TopicFilter, page: number) {
  const url = new URL(window.location.href);
  if (topic === "all") url.searchParams.delete("topic");
  else url.searchParams.set("topic", topic);
  if (page === 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));
  window.history.pushState(null, "", url);
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
  const requestIdRef = useRef(0);

  async function load(nextTopic: TopicFilter, nextPage: number, { syncUrl = true, scroll = true } = {}) {
    if (loading || (nextTopic === topic && nextPage === page)) return;

    if (nextTopic === "all" && nextPage === 1) {
      setTopic("all");
      setPage(1);
      setPosts(initialPosts);
      setPageCount(initialPageCount);
      if (syncUrl) writeParamsToUrl("all", 1);
      if (scroll) gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(nextPage) });
      if (nextTopic !== "all") qs.set("topic", nextTopic);
      const res = await fetch(`/api/blog-posts?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts");
      const data: BlogPostsResponse = await res.json();
      if (requestIdRef.current !== requestId) return;
      setPosts(data.posts);
      setPage(data.page);
      setPageCount(data.pageCount);
      setTopic(nextTopic);
      if (syncUrl) writeParamsToUrl(nextTopic, data.page);
      if (scroll) gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // keep current state on failure
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }

  useEffect(() => {
    const initial = paramsFromUrl();
    if (initial.topic !== "all" || initial.page !== 1) {
      queueMicrotask(() => load(initial.topic, initial.page, { syncUrl: false, scroll: false }));
    }

    function onPopState() {
      const next = paramsFromUrl();
      queueMicrotask(() => load(next.topic, next.page, { syncUrl: false, scroll: false }));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              ? "bg-brand-green text-white"
              : "border border-ink-4/40 text-ink-2 hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green",
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
                ? "bg-brand-green text-white"
                : "border border-ink-4/40 text-ink-2 hover:border-brand-green/40 hover:bg-brand-green/10 hover:text-brand-green",
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
              <span className="mt-2 flex flex-wrap gap-1.5">
                {post.topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-green"
                  >
                    {topicLabel(t)}
                  </span>
                ))}
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
            onClick={() => load(topic, page - 1)}
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
              onClick={() => load(topic, n)}
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
            onClick={() => load(topic, page + 1)}
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
