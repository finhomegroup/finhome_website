/**
 * History behaviour of the /blog/ news feed, on the navigator BlogPostGrid
 * uses (components/blog-feed-navigation.ts).
 *
 * The repo has no DOM test environment, so the browser is a small fake: a
 * history stack whose back()/forward() change the URL and then fire the same
 * popstate handler the component registers (`feedParams(location.search)` →
 * `go(…, { fromHistory: true })`). It proves state follows the URL; it does
 * not prove scrolling, focus or the real browser — that is the browser pass.
 *
 * Regression (Codex, built preview, 2026-10-01): page 1 → "Trang sau" →
 * Back left the URL at /blog/ but the pager at 2/21 and page-2 posts.
 */
import { describe, expect, it } from "vitest";
import {
  createFeedNavigator,
  feedParams,
  feedUrl,
  type FeedPage,
  type FeedState,
  type TopicFilter,
} from "@/components/blog-feed-navigation";
import type { Post } from "@/content/posts";

const PAGE_COUNT = 21;
const postsFor = (topic: TopicFilter, page: number) =>
  [{ slug: `${topic}-p${page}` }] as unknown as Post[];
const INITIAL: FeedState = { topic: "all", page: 1, pageCount: PAGE_COUNT, posts: postsFor("all", 1) };

type Pending = { topic: TopicFilter; page: number; resolve: () => void; reject: () => void };

/** A browser: history entries, the current URL and popstate dispatch. */
function fakeBrowser(start = "https://www.finhome.group/blog/") {
  const entries = [start];
  let index = 0;
  let onPopState: () => void = () => {};
  return {
    get href() {
      return entries[index];
    },
    get search() {
      return new URL(entries[index]).search;
    },
    get length() {
      return entries.length;
    },
    pushState(url: URL) {
      entries.splice(index + 1, Infinity, url.href);
      index = entries.length - 1;
    },
    listen(handler: () => void) {
      onPopState = handler;
    },
    back() {
      index = Math.max(0, index - 1);
      onPopState();
    },
    forward() {
      index = Math.min(entries.length - 1, index + 1);
      onPopState();
    },
  };
}

/**
 * The component's wiring, verbatim in behaviour. `manual` holds each request
 * until the test settles it, to exercise races; otherwise requests resolve
 * on the next microtask. Page numbers above PAGE_COUNT are clamped, as the
 * real handler does.
 */
function setup({ manual = false, fail = false } = {}) {
  const browser = fakeBrowser();
  const pending: Pending[] = [];
  const loadingLog: boolean[] = [];
  let shown: FeedState = INITIAL;
  const nav = createFeedNavigator({
    initial: INITIAL,
    fetchPage: (topic, page) =>
      new Promise<FeedPage>((resolve, reject) => {
        const clamped = Math.min(page, PAGE_COUNT);
        const settle = () => resolve({ posts: postsFor(topic, clamped), page: clamped, pageCount: PAGE_COUNT });
        const refuse = () => reject(new Error("network"));
        if (manual) pending.push({ topic, page, resolve: settle, reject: refuse });
        else queueMicrotask(fail ? refuse : settle);
      }),
    onState: (s) => (shown = s),
    onLoading: (l) => loadingLog.push(l),
    writeUrl: (t, p) => browser.pushState(feedUrl(browser.href, t, p)),
  });
  browser.listen(() => {
    const { topic, page } = feedParams(browser.search);
    void nav.go(topic, page, { fromHistory: true });
  });
  const flush = () => new Promise((r) => setTimeout(r, 0));
  return {
    browser,
    nav,
    pending,
    loadingLog,
    flush,
    get shown() {
      return shown;
    },
  };
}

describe("feed URL helpers", () => {
  it("reads topic and page, defaulting invalid values", () => {
    expect(feedParams("")).toEqual({ topic: "all", page: 1 });
    expect(feedParams("?page=2")).toEqual({ topic: "all", page: 2 });
    expect(feedParams("?topic=gia-cung&page=3")).toEqual({ topic: "gia-cung", page: 3 });
    expect(feedParams("?topic=nope&page=-4")).toEqual({ topic: "all", page: 1 });
    expect(feedParams("?page=2.7")).toEqual({ topic: "all", page: 2 });
  });

  it("writes only what differs from the default and keeps other parameters and the hash", () => {
    const base = "https://www.finhome.group/blog/?utm_source=x#tin-thi-truong";
    expect(feedUrl(base, "all", 1).href).toBe(base);
    expect(feedUrl(base, "all", 2).href).toBe("https://www.finhome.group/blog/?utm_source=x&page=2#tin-thi-truong");
    expect(feedUrl(feedUrl(base, "gia-cung", 2).href, "all", 1).href).toBe(base);
  });
});

describe("Back and Forward follow the URL", () => {
  it("Trang sau → Back returns to page 1; Forward returns to page 2 (the reported bug)", async () => {
    const t = setup();
    await t.nav.go("all", 2); // "Trang sau"
    expect(t.browser.search).toBe("?page=2");
    expect(t.shown.page).toBe(2);
    expect(t.shown.posts[0].slug).toBe("all-p2");

    t.browser.back();
    await t.flush();
    expect(t.browser.search).toBe("");
    expect(t.shown).toBe(INITIAL); // page 1, server-rendered posts
    expect(t.nav.state.page).toBe(1);
    expect(t.browser.length).toBe(2); // Back pushed nothing

    t.browser.forward();
    await t.flush();
    expect(t.browser.search).toBe("?page=2");
    expect(t.shown.page).toBe(2);
    expect(t.shown.posts[0].slug).toBe("all-p2");
    expect(t.browser.length).toBe(2);
  });

  it("walks several steps back and forward, keeping the topic filter", async () => {
    const t = setup();
    await t.nav.go("gia-cung", 1); // topic chip
    await t.nav.go("gia-cung", 2); // Trang sau
    await t.nav.go("gia-cung", 21); // last page
    expect(t.browser.search).toBe("?topic=gia-cung&page=21");

    t.browser.back();
    await t.flush();
    expect([t.shown.topic, t.shown.page]).toEqual(["gia-cung", 2]);
    t.browser.back();
    await t.flush();
    expect([t.shown.topic, t.shown.page]).toEqual(["gia-cung", 1]);
    t.browser.back();
    await t.flush();
    expect(t.shown).toBe(INITIAL);
    t.browser.forward();
    t.browser.forward();
    await t.flush();
    expect([t.shown.topic, t.shown.page]).toEqual(["gia-cung", 2]);
  });

  it("a user move after Back replaces the forward entries, as a browser does", async () => {
    const t = setup();
    await t.nav.go("all", 2);
    await t.nav.go("all", 3);
    t.browser.back();
    await t.flush();
    await t.nav.go("all", 5);
    expect(t.browser.search).toBe("?page=5");
    t.browser.back();
    await t.flush();
    expect(t.shown.page).toBe(2);
  });
});

describe("races and failure", () => {
  it("Back during a slow request wins; the late response is dropped", async () => {
    const t = setup({ manual: true });
    const click = t.nav.go("all", 3);
    expect(t.nav.loading).toBe(true);
    // The URL has not been pushed yet, so Back leaves the page; model the
    // realistic case: a history step to page 1 while page 3 is in flight.
    void t.nav.go("all", 1, { fromHistory: true });
    expect(t.nav.loading).toBe(false);
    t.pending[0].resolve();
    expect(await click).toBe(false);
    expect(t.shown).toBe(INITIAL);
    expect(t.nav.loading).toBe(false);
  });

  it("history steps are never dropped while loading, and the newest one wins", async () => {
    const t = setup({ manual: true });
    void t.nav.go("all", 2, { fromHistory: true });
    void t.nav.go("all", 4, { fromHistory: true });
    expect(t.pending.map((p) => p.page)).toEqual([2, 4]);
    t.pending[1].resolve(); // newest first…
    await t.flush();
    t.pending[0].resolve(); // …then the stale one arrives late
    await t.flush();
    expect(t.shown.page).toBe(4);
    expect(t.nav.loading).toBe(false);
  });

  it("a history step to the page already shown cancels an in-flight move away", async () => {
    const t = setup({ manual: true });
    void t.nav.go("all", 2, { fromHistory: true });
    t.pending[0].resolve();
    await t.flush();
    void t.nav.go("all", 3, { fromHistory: true });
    void t.nav.go("all", 2, { fromHistory: true }); // back to what is on screen
    expect(t.nav.loading).toBe(false);
    t.pending[1].resolve();
    await t.flush();
    expect(t.shown.page).toBe(2);
  });

  it("ignores a user click while loading (the buttons are disabled too)", async () => {
    const t = setup({ manual: true });
    void t.nav.go("all", 2);
    expect(await t.nav.go("all", 3)).toBe(false);
    expect(t.pending).toHaveLength(1);
  });

  it("keeps the current posts, and clears loading, when a request fails", async () => {
    const t = setup({ fail: true });
    expect(await t.nav.go("all", 2)).toBe(false);
    expect(t.shown).toBe(INITIAL);
    expect(t.nav.loading).toBe(false);
    expect(t.loadingLog.at(-1)).toBe(false);
    expect(t.browser.search).toBe(""); // no history entry for a failed move
  });

  it("writes the clamped page the server returned", async () => {
    const t = setup();
    await t.nav.go("all", 99);
    expect(t.shown.page).toBe(PAGE_COUNT);
    expect(t.browser.search).toBe(`?page=${PAGE_COUNT}`);
  });
});
