import type { Post, Topic } from "@/content/posts";
import { TOPICS } from "@/content/blog-topics";

/**
 * Navigation for the /blog/ news feed, framework-free so the history
 * behaviour can be exercised in tests without a DOM.
 *
 * WHY THIS EXISTS (2026-10-01): `BlogPostGrid` registered its popstate
 * listener once, and that listener closed over the FIRST render's `load` —
 * where topic was "all", page 1 and loading false. After "Trang sau" (URL
 * ?page=2) the browser Back button restored the URL to /blog/, but the stale
 * `load("all", 1)` saw "already on page 1" and returned, so page 2 stayed on
 * screen. The controller below keeps the live state in one object that every
 * caller reads, so there is no stale copy to consult.
 *
 * Race rules, all via one request counter:
 * - every navigation (including the no-fetch return to all/page 1, and a
 *   history step that lands on what is already shown) supersedes any request
 *   still in flight, so a late response can never overwrite what the URL now
 *   says;
 * - a user click while a page is loading is ignored (the buttons are also
 *   disabled), but a history step is never dropped: the URL has already
 *   changed, so the feed must follow it;
 * - a failed request keeps the current posts, as before.
 */

export type TopicFilter = Topic | "all";

export type FeedState = {
  topic: TopicFilter;
  page: number;
  pageCount: number;
  posts: Post[];
};

export type FeedPage = { posts: Post[]; page: number; pageCount: number };

const TOPIC_IDS = new Set<string>(TOPICS.map((t) => t.id));

/** `?topic=…&page=…` → a valid topic and a page ≥ 1; anything else is the default. */
export function feedParams(search: string): { topic: TopicFilter; page: number } {
  const params = new URLSearchParams(search);
  const rawTopic = params.get("topic");
  const topic: TopicFilter = rawTopic && TOPIC_IDS.has(rawTopic) ? (rawTopic as Topic) : "all";
  const page = Math.max(Math.floor(Number(params.get("page"))) || 1, 1);
  return { topic, page };
}

/** The URL for a feed position, keeping every other query parameter and the hash. */
export function feedUrl(href: string, topic: TopicFilter, page: number): URL {
  const url = new URL(href);
  if (topic === "all") url.searchParams.delete("topic");
  else url.searchParams.set("topic", topic);
  if (page === 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));
  return url;
}

export function createFeedNavigator({
  initial,
  fetchPage,
  onState,
  onLoading,
  writeUrl,
}: {
  /** The server-rendered first page of "all"; restored without a request. */
  initial: FeedState;
  fetchPage: (topic: TopicFilter, page: number) => Promise<FeedPage>;
  onState: (state: FeedState) => void;
  onLoading: (loading: boolean) => void;
  /** Push a history entry for a user-initiated move. */
  writeUrl: (topic: TopicFilter, page: number) => void;
}) {
  let current = initial;
  let loading = false;
  let requestId = 0;

  const setLoading = (value: boolean) => {
    loading = value;
    onLoading(value);
  };
  const apply = (next: FeedState) => {
    current = next;
    onState(next);
  };

  /**
   * Move the feed. Resolves `true` when new content was applied (callers
   * scroll only then), `false` when nothing changed, the request was
   * superseded or it failed.
   */
  async function go(
    topic: TopicFilter,
    page: number,
    { fromHistory = false }: { fromHistory?: boolean } = {},
  ): Promise<boolean> {
    if (loading && !fromHistory) return false;
    const id = ++requestId;

    if (topic === current.topic && page === current.page) {
      // Already shown: just cancel anything in flight towards elsewhere.
      if (loading) setLoading(false);
      return false;
    }

    if (topic === "all" && page === 1) {
      if (loading) setLoading(false);
      apply(initial);
      if (!fromHistory) writeUrl("all", 1);
      return true;
    }

    setLoading(true);
    try {
      const data = await fetchPage(topic, page);
      if (id !== requestId) return false;
      apply({ topic, page: data.page, pageCount: data.pageCount, posts: data.posts });
      if (!fromHistory) writeUrl(topic, data.page);
      return true;
    } catch {
      // Keep the current posts on failure.
      return false;
    } finally {
      if (id === requestId) setLoading(false);
    }
  }

  return {
    go,
    /** The live state, for tests and for callers that must not use a stale copy. */
    get state() {
      return current;
    },
    get loading() {
      return loading;
    },
  };
}
