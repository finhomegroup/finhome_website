# Blog → App Feed (Website side) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the FinHome website (`finhome_website`) the source of the blog data the native app will consume, and add an on-page CTA that hands blog readers off to the matching in-app tool — the two website-side deliverables of `finhome_app_native/plans/260804-1200-blog-content-integration/plan.md` (Phase 1 web CTA, Phase 2 web JSON export).

**Architecture:** Two independent, static, build-time pieces — no server, no DB:
1. A prebuild script converts `content/posts.ts` + `content/posts/*.md` into `public/api/blog/index.json` and `public/api/blog/<slug>.json`, so `next build`'s static export ships them at `https://www.finhome.group/api/blog/*.json` for the app to fetch cross-origin.
2. A small CTA block on `/blog/[slug]` maps each post's `topics[0]` to the matching in-app tool and renders a deep link (`finhomeappnative://...`) using the app's own SSOT copy.

**Tech Stack:** Next.js 16 (`output: "export"`), TypeScript, `unified`/`remark-parse`/`remark-gfm`/`mdast-util-to-string` for markdown parsing, `tsx` to run TypeScript build scripts, Node's built-in `node:test`/`node:assert` for unit tests (no test framework exists in this repo today — see constraints).

## Global Constraints

- **Static export only.** `next.config.ts` has `output: "export"`, `trailingSlash: true`. Anything the app needs to fetch must exist as a real file under `public/` *before* `next build` runs (Next copies `public/` into `out/` verbatim; there is no server at runtime).
- **No CMS/DB.** Content stays in `content/posts.ts` (`POSTS: Post[]`) + `content/posts/<slug>.md`. Do not add a database.
- **No fabricated data.** `Post.date` and `Post.source` are optional — omit the corresponding JSON field when absent, never invent a value (matches this org's data-integrity requirements).
- **Terminology parity with the app.** CTA button copy must reuse the app's `TOOL_LABELS.<key>.cardCta` strings verbatim: `budget` → "Tính tầm giá", `borrowing` → "Tính khoản vay", `compass` → "Bắt đầu đánh giá" (source: `finhome_app_native/features/shared/constants/tool-labels.ts`). Do not invent new phrasing.
- **Deep-link scheme is `finhomeappnative`** (source: `finhome_app_native/app.config.ts` → `scheme: "finhomeappnative"`). The app-side route handler that resolves `finhomeappnative://<tool>-intro?src=blog:<slug>` does not exist yet — that is Phase 1 of the app's own plan and is **out of scope here**. This plan only needs to emit the correct, real scheme so the link activates once the app adds the route; it will be a silent no-op link until then, which is expected.
- **No test framework in this repo.** `package.json` has no jest/vitest and no `test` script. Do not add one. Use Node's built-in `node:test` + `node:assert/strict`, run via `tsx --test` (tsx is already being added as a devDependency for the build script, so this adds zero new tooling beyond it).
- **Repo boundary.** Every file in this plan lives in `finhome_website`. Do not modify anything under `finhome_app_native`.

---

### Task 1: Markdown → block-array converter

**Files:**
- Create: `lib/markdown-to-blocks.ts`
- Create: `lib/markdown-to-blocks.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `export type BlogBodyBlock = { id: string; type: "heading"; text: string } | { id: string; type: "paragraph"; text: string } | { id: string; type: "list"; ordered: boolean; items: string[] } | { id: string; type: "quote"; text: string } | { id: string; type: "link"; text: string; url: string };` and `export function markdownToBlocks(markdown: string): BlogBodyBlock[]`, both exported from `lib/markdown-to-blocks.ts`. Task 3 and Task 5 import both.

All 35 files in `content/posts/*.md` follow the same shape: an optional lead-in paragraph, then `## Điểm chính cần nắm` (a bullet list), `## Góc nhìn FinHome` (prose), and — only on posts that have a `source` — a trailing `## Đọc thêm` heading + a single markdown link. That last section is dropped: `Post.source` already carries `{name, url, accessed}` as structured data (used by the app's `SourceTierBlock`-style rendering), so repeating it as a body block would duplicate the same fact in two shapes.

- [ ] **Step 1: Add the parsing + test-running deps**

```bash
npm install -D unified remark-parse mdast-util-to-string @types/mdast tsx
```

Then add to `package.json` `"scripts"` (keep existing `dev`/`build`/`start`/`lint`):

```json
"test": "tsx --test lib/markdown-to-blocks.test.ts content/blog-tool-cta.test.ts"
```

(`content/blog-tool-cta.test.ts` doesn't exist yet — Task 2 creates it. Referencing it now means the script fails to find the file, which is a clear, honest failure state that resolves once Task 2 lands — not a placeholder in the code we ship.)

- [ ] **Step 2: Write the failing test**

Create `lib/markdown-to-blocks.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { markdownToBlocks } from "./markdown-to-blocks.ts";

test("converts lead-in, bullet list, prose and drops the trailing Đọc thêm link", () => {
  const markdown = `Đoạn mở đầu ngắn.

## Điểm chính cần nắm

- Ý thứ nhất.
- Ý thứ hai **quan trọng**.

## Góc nhìn FinHome

Đoạn phân tích của FinHome.

## Đọc thêm

[Đọc bài gốc trên Nhân Dân](https://nhandan.vn/bai-goc)
`;

  const blocks = markdownToBlocks(markdown);

  assert.deepEqual(blocks, [
    { id: "b1", type: "paragraph", text: "Đoạn mở đầu ngắn." },
    { id: "b2", type: "heading", text: "Điểm chính cần nắm" },
    {
      id: "b3",
      type: "list",
      ordered: false,
      items: ["Ý thứ nhất.", "Ý thứ hai quan trọng."],
    },
    { id: "b4", type: "heading", text: "Góc nhìn FinHome" },
    { id: "b5", type: "paragraph", text: "Đoạn phân tích của FinHome." },
  ]);
});

test("keeps a blockquote as a quote block and a lone link paragraph as a link block", () => {
  const markdown = `> Trích dẫn đáng chú ý.

[Xem thêm](https://example.com/nguon)
`;

  const blocks = markdownToBlocks(markdown);

  assert.deepEqual(blocks, [
    { id: "b1", type: "quote", text: "Trích dẫn đáng chú ý." },
    { id: "b2", type: "link", text: "Xem thêm", url: "https://example.com/nguon" },
  ]);
});
```

- [ ] **Step 3: Run it, confirm it fails**

```bash
npm test
```

Expected: fails with `Cannot find module './markdown-to-blocks.ts'` (and separately reports the missing `content/blog-tool-cta.test.ts` from the `test` script — ignore that second failure until Task 2).

- [ ] **Step 4: Implement `lib/markdown-to-blocks.ts`**

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Root } from "mdast";

export type BlogBodyBlock =
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "quote"; text: string }
  | { id: string; type: "link"; text: string; url: string };

/** Every post's optional source-attribution section — dropped because
 * `Post.source` already carries the same fact as structured data. */
const READ_MORE_HEADING = "Đọc thêm";

const processor = unified().use(remarkParse).use(remarkGfm);

export function markdownToBlocks(markdown: string): BlogBodyBlock[] {
  const tree = processor.parse(markdown) as Root;
  const blocks: BlogBodyBlock[] = [];
  let count = 0;
  const nextId = () => `b${++count}`;

  for (const node of tree.children) {
    if (node.type === "heading") {
      const text = mdastToString(node).trim();
      if (text === READ_MORE_HEADING) break;
      blocks.push({ id: nextId(), type: "heading", text });
      continue;
    }

    if (node.type === "paragraph") {
      const onlyChild = node.children.length === 1 ? node.children[0] : undefined;
      if (onlyChild?.type === "link") {
        blocks.push({
          id: nextId(),
          type: "link",
          text: mdastToString(onlyChild).trim(),
          url: onlyChild.url,
        });
        continue;
      }
      blocks.push({ id: nextId(), type: "paragraph", text: mdastToString(node).trim() });
      continue;
    }

    if (node.type === "list") {
      blocks.push({
        id: nextId(),
        type: "list",
        ordered: node.ordered === true,
        items: node.children.map((item) => mdastToString(item).trim()),
      });
      continue;
    }

    if (node.type === "blockquote") {
      blocks.push({ id: nextId(), type: "quote", text: mdastToString(node).trim() });
      continue;
    }
  }

  return blocks;
}
```

- [ ] **Step 5: Run it, confirm the markdown-to-blocks tests pass**

```bash
npm test
```

Expected: both tests in `lib/markdown-to-blocks.test.ts` pass. The run still fails overall because `content/blog-tool-cta.test.ts` doesn't exist — that's Task 2.

- [ ] **Step 6: Commit**

```bash
git add lib/markdown-to-blocks.ts lib/markdown-to-blocks.test.ts package.json package-lock.json
git commit -m "feat(blog): add markdown-to-block-array converter for the app feed"
```

---

### Task 2: Topic → in-app tool CTA mapping

**Files:**
- Create: `content/blog-tool-cta.ts`
- Create: `content/blog-tool-cta.test.ts`

**Interfaces:**
- Consumes: `Post` / `Topic` types from `content/posts.ts` (`slug: string`, `topics: Topic[]`, both already defined there).
- Produces: `export type ToolKey = "budget" | "borrowing" | "compass";`, `export type BlogToolCta = { toolKey: ToolKey; label: string; deepLink: string };`, `export function toolCtaForPost(post: Pick<Post, "slug" | "topics">): BlogToolCta`. Task 3 (UI) and Task 5 (JSON generator) both import `toolCtaForPost` and the `BlogToolCta` type.

Mapping rationale (topic id → tool, using the 4 existing `Topic` values from `content/posts.ts`): `gia-cung` (Giá & Cung) → `budget` (tầm giá nhà mua được); `cau-thanh-khoan` (Cầu & Thanh khoản — covers interest-rate/credit posts) → `borrowing` (khả năng vay); `khu-vuc-ha-tang` (Khu vực & Hạ tầng) → `compass` (la bàn khu vực); `chinh-sach-su-kien` (Chính sách & Sự kiện) → `borrowing` (policy posts are usually lending-policy). A post can have several topics; `topics[0]` (the primary one, as authored) decides the tool. This mapping is provisional per the source plan's own open decision #2 — it is real, shipped code, not a stub, and can be revised by editing this one file if product picks a different mapping later.

- [ ] **Step 1: Write the failing test**

Create `content/blog-tool-cta.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { toolCtaForPost } from "./blog-tool-cta.ts";

test("gia-cung maps to budget with the app's SSOT copy", () => {
  const cta = toolCtaForPost({ slug: "vd-bai-viet", topics: ["gia-cung"] });
  assert.deepEqual(cta, {
    toolKey: "budget",
    label: "Tính tầm giá",
    deepLink: "finhomeappnative://budget-intro?src=blog:vd-bai-viet",
  });
});

test("chinh-sach-su-kien maps to borrowing", () => {
  const cta = toolCtaForPost({ slug: "vd-chinh-sach", topics: ["chinh-sach-su-kien"] });
  assert.equal(cta.toolKey, "borrowing");
  assert.equal(cta.deepLink, "finhomeappnative://borrowing-intro?src=blog:vd-chinh-sach");
});

test("uses the first topic when a post has several", () => {
  const cta = toolCtaForPost({
    slug: "vd-nhieu-topic",
    topics: ["khu-vuc-ha-tang", "gia-cung"],
  });
  assert.equal(cta.toolKey, "compass");
});
```

- [ ] **Step 2: Run it, confirm it fails**

```bash
npm test
```

Expected: `lib/markdown-to-blocks.test.ts` still passes; `content/blog-tool-cta.test.ts` fails with `Cannot find module './blog-tool-cta.ts'`.

- [ ] **Step 3: Implement `content/blog-tool-cta.ts`**

```ts
import type { Post, Topic } from "./posts";

export type ToolKey = "budget" | "borrowing" | "compass";

export type BlogToolCta = {
  toolKey: ToolKey;
  label: string;
  deepLink: string;
};

type ToolCtaConfig = { toolKey: ToolKey; label: string; introPath: string };

/**
 * Topic → tool mapping (source-plan §9 open decision #2, not yet chosen by
 * product at time of writing). `label` is copied verbatim from
 * finhome_app_native TOOL_LABELS.<key>.cardCta so web/app copy never drifts.
 */
const TOPIC_TOOL_CTA: Record<Topic, ToolCtaConfig> = {
  "gia-cung": { toolKey: "budget", label: "Tính tầm giá", introPath: "budget-intro" },
  "cau-thanh-khoan": { toolKey: "borrowing", label: "Tính khoản vay", introPath: "borrowing-intro" },
  "khu-vuc-ha-tang": { toolKey: "compass", label: "Bắt đầu đánh giá", introPath: "compass-intro" },
  "chinh-sach-su-kien": { toolKey: "borrowing", label: "Tính khoản vay", introPath: "borrowing-intro" },
};

/** Matches finhome_app_native/app.config.ts `scheme: "finhomeappnative"`. */
const DEEP_LINK_SCHEME = "finhomeappnative";

export function toolCtaForPost(post: Pick<Post, "slug" | "topics">): BlogToolCta {
  const config = TOPIC_TOOL_CTA[post.topics[0]];
  return {
    toolKey: config.toolKey,
    label: config.label,
    deepLink: `${DEEP_LINK_SCHEME}://${config.introPath}?src=blog:${post.slug}`,
  };
}
```

- [ ] **Step 4: Run it, confirm both test files pass**

```bash
npm test
```

Expected: all tests in both files pass.

- [ ] **Step 5: Commit**

```bash
git add content/blog-tool-cta.ts content/blog-tool-cta.test.ts
git commit -m "feat(blog): map post topics to the matching in-app tool CTA"
```

---

### Task 3: On-page CTA — hand blog readers to the matching tool

**Files:**
- Create: `components/blog-cta.tsx`
- Modify: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `toolCtaForPost` from `content/blog-tool-cta.ts` (Task 2); `window.gtag` global declared in `components/google-analytics.tsx` (already project-wide via `declare global`).

**Manual verification steps (UI — no test runner for rendering):**

- [ ] **Step 1: Implement `components/blog-cta.tsx`**

```tsx
"use client";

import type { Post } from "@/content/posts";
import { toolCtaForPost } from "@/content/blog-tool-cta";

type Props = { post: Pick<Post, "slug" | "topics"> };

export function BlogCta({ post }: Props) {
  const cta = toolCtaForPost(post);

  function handleClick() {
    window.gtag?.("event", "blog_cta_click", {
      tool_key: cta.toolKey,
      post_slug: post.slug,
    });
  }

  return (
    <aside className="mt-8 rounded-2xl border border-ink-4/20 bg-bg-soft px-5 py-5 text-sm text-ink-2">
      <p className="font-medium text-ink">
        Xem bài này ảnh hưởng thế nào đến kế hoạch mua nhà của bạn
      </p>
      <a
        href={cta.deepLink}
        onClick={handleClick}
        className="mt-3 inline-flex rounded-full bg-primary px-5 py-2.5 font-display font-medium text-white transition-opacity hover:opacity-90"
      >
        {cta.label} →
      </a>
    </aside>
  );
}
```

- [ ] **Step 2: Insert it into the article page**

In `app/blog/[slug]/page.tsx`, add the import next to the other component imports:

```ts
import { BlogCta } from "@/components/blog-cta";
```

Then insert the CTA right after the markdown body and before the "Bài viết liên quan" section:

```tsx
            <div className="mx-auto mt-10 max-w-3xl">
              <Markdown source={body} />
              <BlogCta post={post} />
            </div>
          </Container>
        </article>
```

(replacing the current three-line block that ends the `<article>` — the only change is adding `<BlogCta post={post} />` right after `<Markdown source={body} />`.)

- [ ] **Step 3: Run the dev server and check a real post**

```bash
npm run dev
```

Open `http://localhost:3000/blog/co-phieu-bat-dong-san-dan-dat-vn-index-1777-diem/` (topic `cau-thanh-khoan` → expect `borrowing`). Confirm:
- The CTA box renders after the article body, before "Bài viết liên quan", with label "Tính khoản vay →".
- Inspecting the anchor in devtools shows `href="finhomeappnative://borrowing-intro?src=blog:co-phieu-bat-dong-san-dan-dat-vn-index-1777-diem"`.
- Clicking it does nothing visible in a desktop browser (no registered protocol handler) and does not throw a console error — that's the expected no-op state described in Global Constraints.

Then open a `khu-vuc-ha-tang` post (e.g. any post with that topic — grep `content/posts.ts` for one) and confirm the CTA switches to "Bắt đầu đánh giá →" with a `compass-intro` deep link, proving the mapping is live per-post and not hardcoded to one tool.

- [ ] **Step 4: Commit**

```bash
git add components/blog-cta.tsx app/blog/[slug]/page.tsx
git commit -m "feat(blog): add tool-CTA at the end of each blog article"
```

---

### Task 4: Blog feed JSON contract types

**Files:**
- Create: `content/blog-feed.types.ts`

**Interfaces:**
- Consumes: `Post` from `content/posts.ts`; `BlogBodyBlock` from `lib/markdown-to-blocks.ts` (Task 1); `BlogToolCta` from `content/blog-tool-cta.ts` (Task 2).
- Produces: `export type BlogFeedSummary` and `export type BlogFeedPost`, both imported by Task 5's generator script.

This is a pure type-only file (no runtime logic), so it has no independent test cycle — it's verified by the TypeScript compiler when Task 5's script imports it, and by `tsc` below.

- [ ] **Step 1: Implement `content/blog-feed.types.ts`**

```ts
import type { Post } from "./posts";
import type { BlogBodyBlock } from "@/lib/markdown-to-blocks";
import type { BlogToolCta } from "./blog-tool-cta";

export type { BlogBodyBlock, BlogToolCta };

/** List-surface response shape written to public/api/blog/index.json. */
export type BlogFeedSummary = Pick<
  Post,
  "slug" | "title" | "category" | "topics" | "excerpt" | "readingTime" | "source"
> & {
  /** Absolute URL (https://www.finhome.group/...) — the app fetches cross-origin. */
  cover: string;
  /** ISO date, mirrors `Post.date` when present. Omitted (never fabricated) otherwise. */
  publishedAt?: string;
};

/** Full-article shape written to public/api/blog/<slug>.json. */
export type BlogFeedPost = BlogFeedSummary & {
  body: BlogBodyBlock[];
  /** Slugs of up to 3 related posts, same selection as the website's own related-posts section. */
  related: string[];
  toolCta: BlogToolCta;
};

/** public/api/blog/index.json top-level shape. */
export type BlogFeedIndex = {
  posts: BlogFeedSummary[];
};
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors (pre-existing errors, if any, are unrelated to this file — if `tsc --noEmit` reports anything inside `content/blog-feed.types.ts`, fix it before moving on).

- [ ] **Step 3: Commit**

```bash
git add content/blog-feed.types.ts
git commit -m "feat(blog): define the JSON contract types for the app feed"
```

---

### Task 5: Static JSON generator + prebuild wiring

**Files:**
- Create: `scripts/generate-blog-json.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `POSTS` + `Post` from `content/posts.ts`; `img` from `lib/images.ts`; `SITE` from `content/site.ts`; `markdownToBlocks` from `lib/markdown-to-blocks.ts` (Task 1); `toolCtaForPost` from `content/blog-tool-cta.ts` (Task 2); `BlogFeedSummary`/`BlogFeedPost`/`BlogFeedIndex` from `content/blog-feed.types.ts` (Task 4).
- Produces: `public/api/blog/index.json` and one `public/api/blog/<slug>.json` per post — this is the file-based contract the app repo's own plan (Phase 2) will consume.

- [ ] **Step 1: Implement `scripts/generate-blog-json.ts`**

```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { POSTS, type Post } from "../content/posts.ts";
import { img } from "../lib/images.ts";
import { SITE } from "../content/site.ts";
import { markdownToBlocks } from "../lib/markdown-to-blocks.ts";
import { toolCtaForPost } from "../content/blog-tool-cta.ts";
import type { BlogFeedPost, BlogFeedSummary } from "../content/blog-feed.types.ts";

function absUrl(sitePath: string): string {
  return new URL(sitePath, SITE.url).toString();
}

function toSummary(post: Post): BlogFeedSummary {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    topics: post.topics,
    excerpt: post.excerpt,
    readingTime: post.readingTime,
    cover: absUrl(img(post.cover)),
    ...(post.date ? { publishedAt: post.date } : {}),
    ...(post.source ? { source: post.source } : {}),
  };
}

async function readBody(slug: string): Promise<string> {
  return fs.readFile(path.join(process.cwd(), "content/posts", `${slug}.md`), "utf8");
}

function relatedSlugs(slug: string): string[] {
  return POSTS.filter((p) => p.slug !== slug).slice(0, 3).map((p) => p.slug);
}

async function main() {
  const outDir = path.join(process.cwd(), "public/api/blog");
  await fs.mkdir(outDir, { recursive: true });

  const summaries = POSTS.map(toSummary);
  await fs.writeFile(
    path.join(outDir, "index.json"),
    JSON.stringify({ posts: summaries }, null, 2),
  );

  for (const post of POSTS) {
    const markdown = await readBody(post.slug);
    const full: BlogFeedPost = {
      ...toSummary(post),
      body: markdownToBlocks(markdown),
      related: relatedSlugs(post.slug),
      toolCta: toolCtaForPost(post),
    };
    await fs.writeFile(
      path.join(outDir, `${post.slug}.json`),
      JSON.stringify(full, null, 2),
    );
  }

  console.log(`Generated ${summaries.length} blog JSON files in public/api/blog/`);
}

main();
```

- [ ] **Step 2: Wire it as a prebuild step and ignore the generated output**

Add to `package.json` `"scripts"`:

```json
"prebuild": "tsx scripts/generate-blog-json.ts"
```

npm runs `prebuild` automatically before `build`, so `npm run build` always regenerates the JSON first — no manual step to forget.

Add to `.gitignore`:

```
public/api/
```

(The JSON is fully derived from `content/posts.ts` + `content/posts/*.md`, which are already in git — regenerating it is cheap and automatic, so there's nothing to gain from committing the output, and something to lose: it would silently go stale the next time a post is edited without re-running the script by hand.)

- [ ] **Step 3: Run the generator directly and inspect the output**

```bash
npx tsx scripts/generate-blog-json.ts
```

Expected console output: `Generated 35 blog JSON files in public/api/blog/`.

Then verify the shape with a real assertion pass:

```bash
node -e '
const fs = require("node:fs");
const index = JSON.parse(fs.readFileSync("public/api/blog/index.json", "utf8"));
console.assert(index.posts.length === 35, "expected 35 summaries, got " + index.posts.length);
console.assert(index.posts[0].cover.startsWith("https://www.finhome.group/"), "cover must be absolute");

const post = JSON.parse(fs.readFileSync("public/api/blog/co-phieu-bat-dong-san-dan-dat-vn-index-1777-diem.json", "utf8"));
console.assert(Array.isArray(post.body) && post.body.length > 0, "body must be a non-empty block array");
console.assert(!post.body.some(b => b.type === "heading" && b.text === "Đọc thêm"), "Đọc thêm section must be dropped");
console.assert(post.related.length === 3 && !post.related.includes(post.slug), "related must exclude self");
console.assert(post.toolCta.deepLink.startsWith("finhomeappnative://"), "deep link must use the real app scheme");
console.log("All assertions passed.");
'
```

Expected: `All assertions passed.` with no `Assertion failed` lines above it.

- [ ] **Step 4: Verify it survives a real static export**

```bash
npm run build
ls out/api/blog | wc -l
```

Expected: `npm run build` completes without errors, and `ls out/api/blog` lists 36 files (35 `<slug>.json` + `index.json`) — proving the prebuild-generated JSON makes it into the static export the same way `public/images/blog/*` already does.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-blog-json.ts package.json package-lock.json .gitignore
git commit -m "feat(blog): generate public/api/blog/*.json for the native app to fetch"
```

---

## Self-review notes

- **Spec coverage:** covers the website-side half of the source plan's Phase 1 (§7.1 CTA — Task 3) and Phase 2 (§4 JSON export, decision A — Tasks 1, 4, 5). The source plan's Phase 1 also asked to "dọn `console.log('aaa')` ở `app/blog/page.tsx`" — verified during research that no such line exists anywhere in the repo (full grep across `app/`, `components/`, `lib/`), so no task was added for it. The FB-post CTA template and everything from Phase 3 onward (contextual card, News list/reader screens, push) are `finhome_app_native` work and explicitly out of scope per the earlier scope decision.
- **Placeholder scan:** no TBD/TODO strings; the one open product decision (topic→tool mapping) ships as real, working code in one file (`content/blog-tool-cta.ts`) rather than a stub, so it's easy to change later without re-deriving anything.
- **Type consistency:** `BlogBodyBlock` (Task 1) is re-exported unchanged through `content/blog-feed.types.ts` (Task 4) and consumed as-is by the generator (Task 5); `BlogToolCta`/`toolCtaForPost` (Task 2) likewise flow unchanged into Task 4's `BlogFeedPost` and Task 5's generator — no renamed fields between tasks.
