# Blog Source Roundups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 10 copyright-safe FinHome blog roundups (summary + outbound source links), wire source attribution in the article UI, tighten SEO HTML for sourced posts, and add a project SEO skill for future blog work.

**Architecture:** Keep the existing MD + `POSTS` metadata pattern. Extend `Post` with optional `source`. Render a small attribution CTA on `/blog/[slug]` when present. Bodies are original FinHome summaries that cite and link out. SEO helpers gain `isBasedOn`/`citation`; Markdown external anchors get safe `rel`.

**Tech Stack:** Next.js App Router (static export), TypeScript, `react-markdown` + `remark-gfm`, existing `lib/seo.ts` / `JsonLd`.

## Global Constraints

- Language: Vietnamese, FinHome tone (calm, practical, no hype).
- Copyright: never paste full source articles or hotlink source images; paraphrase + short optional quotes only.
- Domain / trailing slash / static export rules from existing SEO plan still apply.
- Keep existing 4 posts; append 10 new ones.
- Covers: reuse existing `img()` Framer filenames already used in `content/posts.ts` (rotate among them).
- Commit after each task when implementing.

## File Structure

- Modify: `content/posts.ts` — `source` on `Post` + 10 new entries.
- Create: `content/posts/<slug>.md` × 10 — roundup bodies.
- Create: `components/source-attribution.tsx` — attribution + outbound CTA.
- Modify: `app/blog/[slug]/page.tsx` — render attribution when `post.source`.
- Modify: `components/markdown.tsx` — external links `target="_blank"` + `rel="noopener noreferrer"`.
- Modify: `lib/seo.ts` — Article schema `isBasedOn` / `citation` when sourced.
- Create: `.cursor/skills/seo-blog/SKILL.md` — SEO checklist for blog posts.

---

### Task 1: Extend Post type + SourceAttribution UI + safe Markdown links

**Files:**
- Modify: `content/posts.ts`
- Create: `components/source-attribution.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `components/markdown.tsx`
- Modify: `lib/seo.ts`

**Interfaces:**
- Produces:
  - `Post.source?: { name: string; url: string; accessed?: string }`
  - `SourceAttribution({ name, url }: { name: string; url: string })` component
  - `articleSchema(post)` includes `isBasedOn: { "@type": "WebPage", name, url }` when `post.source` set

- [ ] **Step 1: Extend the `Post` type**

In `content/posts.ts`, update the type:

```ts
export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
  cover: string;
  date?: string;
  source?: {
    name: string;
    url: string;
    accessed?: string;
  };
};
```

Leave the existing 4 `POSTS` entries unchanged for now.

- [ ] **Step 2: Create `components/source-attribution.tsx`**

```tsx
type Props = { name: string; url: string };

export function SourceAttribution({ name, url }: Props) {
  return (
    <aside className="mt-6 rounded-2xl border border-ink-4/20 bg-bg-soft px-5 py-4 text-sm text-ink-2">
      <p>
        Bài viết này tổng hợp góc nhìn FinHome dựa trên thông tin từ{" "}
        <strong className="text-ink">{name}</strong>. Nội dung chi tiết thuộc về
        đơn vị xuất bản gốc.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex font-medium text-primary underline-offset-4 hover:underline"
      >
        Đọc bài gốc trên {name} →
      </a>
    </aside>
  );
}
```

- [ ] **Step 3: Mount attribution on the article page**

In `app/blog/[slug]/page.tsx`, import `SourceAttribution` and render it after the reading-time line (before cover), only when `post.source` exists:

```tsx
{post.source ? (
  <SourceAttribution name={post.source.name} url={post.source.url} />
) : null}
```

- [ ] **Step 4: Harden external links in Markdown**

Replace `components/markdown.tsx` with a custom `a` renderer:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  a: ({ href, children, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...props}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-primary prose-img:rounded-2xl prose-pre:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 5: Extend `articleSchema` for citations**

In `lib/seo.ts`, inside `articleSchema(post)`, after `mainEntityOfPage`, add:

```ts
...(post.source
  ? {
      isBasedOn: {
        "@type": "WebPage",
        name: post.source.name,
        url: post.source.url,
      },
      citation: post.source.url,
    }
  : {}),
```

- [ ] **Step 6: Verify TypeScript / lint on touched files**

Run: `pnpm lint` (or project’s lint script). Expected: no new errors on the files above.

- [ ] **Step 7: Commit**

```bash
git add content/posts.ts components/source-attribution.tsx app/blog/[slug]/page.tsx components/markdown.tsx lib/seo.ts
git commit -m "feat(blog): source attribution UI and citation-safe SEO hooks"
```

---

### Task 2: Add 10 roundup posts (metadata + markdown)

**Files:**
- Modify: `content/posts.ts` (append 10 entries at the **top** of `POSTS` so newest appear first on `/blog` and homepage news)
- Create: 10 files under `content/posts/`

**Interfaces:**
- Consumes: `Post` + `source` from Task 1
- Produces: 10 slugs listed below

**Slug / metadata map (use exactly):**

1. `kha-nang-mua-nha-viet-nam-numbeo` — category `Tài chính` — source VnExpress — cover reuse `oWCUzm8toUrYjCtF86RIMXwJky8.jpg` — date `2026-07-24`
2. `hon-30-nam-thu-nhap-de-mua-nha` — `Tài chính` — CafeF — `oIxITa5snaVT7XXKnAxj031jsc.jpg` — `2026-07-24`
3. `gioi-tre-mua-nha-thoi-bao-gia` — `Tài chính` — CafeF — `pBWyVGbn6q90q7em1mpZCUhjo.jpg` — `2026-07-24`
4. `chinh-sach-nha-o-thu-nhap-trung-binh` — `Nhà ở xã hội` — VnExpress — `KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg` — `2026-07-23`
5. `gia-nha-phu-hop-thu-nhap-trung-binh` — `Tài chính` — VnExpress — `oWCUzm8toUrYjCtF86RIMXwJky8.jpg` — `2026-07-23`
6. `uu-tien-mua-nha-gia-phu-hop-tren-20-trieu` — `Nhà ở xã hội` — VnExpress — `oIxITa5snaVT7XXKnAxj031jsc.jpg` — `2026-07-22`
7. `vay-von-mua-nha-o-xa-hoi-dieu-kien` — `Nhà ở xã hội` — Luật Việt Nam — `pBWyVGbn6q90q7em1mpZCUhjo.jpg` — `2026-07-22`
8. `ma-dinh-danh-dien-tu-bat-dong-san` — `Bất động sản` — VnExpress — `KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg` — `2026-07-21`
9. `lai-suat-vay-mua-nha-neo-cao` — `Tài chính` — DNSE — `oWCUzm8toUrYjCtF86RIMXwJky8.jpg` — `2026-07-21`
10. `goi-tin-dung-uu-dai-nguoi-tre-duoi-35` — `Tài chính` — VnExpress — `oIxITa5snaVT7XXKnAxj031jsc.jpg` — `2026-07-20`

Source URLs (must match design spec table).

- [ ] **Step 1: Write one markdown body using the shared template**

For each slug, create `content/posts/<slug>.md` with this structure (original copy only — paraphrase facts, do not copy paragraphs from the source):

```markdown
[Mở 1–2 đoạn: bối cảnh vấn đề + vì sao người mua nhà cần quan tâm]

## Điểm chính cần nắm

- [takeaway 1 — paraphrase]
- [takeaway 2]
- [takeaway 3]
- [takeaway 4 nếu cần]

## Góc nhìn FinHome

[2–4 câu: liên hệ vùng mua nhà an toàn / khả năng vay / kế hoạch trả nợ. Không copy CTA quảng cáo thô.]

## Đọc thêm

Nội dung phân tích đầy đủ nằm ở bài gốc. FinHome chỉ tổng hợp để hỗ trợ độc giả định hướng tài chính khi mua nhà.

[Đọc bài gốc trên <Nguồn>](<url>)
```

Target length: ~350–600 Vietnamese words. `readingTime`: `"3 phút đọc"` or `"4 phút đọc"`.

- [ ] **Step 2: Append matching `POSTS` metadata**

Example entry shape:

```ts
{
  slug: "kha-nang-mua-nha-viet-nam-numbeo",
  title: "Khả năng mua nhà của người Việt đang khó hơn thế nào?",
  category: "Tài chính",
  excerpt:
    "Khi giá nhà tăng nhanh hơn thu nhập, số năm tích lũy để sở hữu nhà tăng rõ rệt. FinHome tóm tắt các tín hiệu quan trọng và gợi ý cách đọc con số này khi lập kế hoạch mua nhà.",
  readingTime: "3 phút đọc",
  cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
  date: "2026-07-24",
  source: {
    name: "VnExpress",
    url: "https://vnexpress.net/nguoi-viet-thuoc-nhom-kho-mua-nha-nhat-the-gioi-5072991.html",
    accessed: "2026-07-24",
  },
},
```

Titles/excerpts must be **FinHome-original** (paraphrase; do not clone source headlines 1:1 when a clearer FinHome angle exists).

- [ ] **Step 3: Build and spot-check**

Run: `pnpm build`  
Expected: success; `out/blog/<slug>/index.html` exists for each new slug; each HTML contains the source URL string and “Đọc bài gốc”.

- [ ] **Step 4: Commit**

```bash
git add content/posts.ts content/posts/*.md
git commit -m "feat(blog): add 10 copyright-safe source roundup posts"
```

---

### Task 3: Project SEO skill for blog posts

**Files:**
- Create: `.cursor/skills/seo-blog/SKILL.md`

**Interfaces:**
- Produces: agent skill triggered when editing/adding FinHome blog posts or optimizing blog HTML/SEO

- [ ] **Step 1: Create the skill directory and file**

```markdown
---
name: seo-blog
description: >-
  Optimize FinHome blog posts and article HTML/SEO (metadata, headings,
  Article JSON-LD, canonical, source attribution). Use when adding or editing
  content/posts, blog pages, or when the user asks for blog SEO.
---

# FinHome Blog SEO

## When to use

- Adding/editing `content/posts.ts` or `content/posts/*.md`
- Changing `app/blog/**` or article schema
- User asks to “SEO blog”, “optimize HTML bài viết”, or publish roundups

## Hard rules

1. **Canonical** on FinHome: `/blog/<slug>/` via `canonicalPath` (trailing slash).
2. **Do not republish** full third-party articles. Summarize + link out with `source`.
3. **One H1** = post title. Body uses `##` / `###` only.
4. **Title** ≤ ~60 chars when practical; **excerpt** 120–160 chars for meta description.
5. **Cover**: site assets via `img(post.cover)` only — never hotlink outlet images.
6. External links: `target="_blank"` `rel="noopener noreferrer"` (Markdown component handles this).
7. If `post.source` exists, page must show `SourceAttribution` and schema `isBasedOn`.
8. After changes: `pnpm build` and confirm `out/blog/<slug>/index.html` has title, description, canonical, JSON-LD Article.

## Checklist per new post

- [ ] Unique `slug` kebab-case Vietnamese ASCII
- [ ] `date` ISO; `readingTime` set
- [ ] Original title + excerpt (not a verbatim source headline dump)
- [ ] Body follows roundup template (điểm chính → góc FinHome → đọc thêm + link)
- [ ] `source.name` + `source.url` correct
- [ ] Appears in `POSTS` (sitemap picks it up automatically)
- [ ] No scraped copyrighted image or long pasted quotes

## HTML / metadata map

| Concern | Where |
|--------|--------|
| Title / description / OG / Twitter | `generateMetadata` in `app/blog/[slug]/page.tsx` |
| Article JSON-LD | `articleSchema` + `JsonLd` |
| List page | `app/blog/page.tsx` metadata |
| Sitemap | `app/sitemap.ts` reads `POSTS` |
```

- [ ] **Step 2: Commit**

```bash
git add .cursor/skills/seo-blog/SKILL.md
git commit -m "chore(skills): add seo-blog skill for FinHome posts"
```

---

### Task 4: Verification pass

**Files:** none (verify only)

- [ ] **Step 1: List all posts**

Run: `node -e "const {POSTS}=require('./content/posts.ts')"` — if TS require fails, instead:

```bash
rg "slug:" content/posts.ts
```

Expected: 14 slugs (4 old + 10 new).

- [ ] **Step 2: Confirm outbound links in built HTML**

```bash
rg -n "Đọc bài gốc|vnexpress.net|cafef.vn|luatvietnam.vn|dnse.com.vn" out/blog -g "*.html"
```

Expected: matches across the 10 new article pages.

- [ ] **Step 3: Confirm JSON-LD citation on one sourced page**

Open `out/blog/kha-nang-mua-nha-viet-nam-numbeo/index.html` and confirm `isBasedOn` or `citation` appears in the JSON-LD script.

- [ ] **Step 4: Manual UI check**

Start preview (`pnpm start` or static server on `out/`). Open `/blog/` → open one roundup → click “Đọc bài gốc” → external site.

---

## Spec coverage

| Spec requirement | Task |
|------------------|------|
| 10 roundup posts from locked source list | Task 2 |
| FinHome format, copyright-safe, link out | Tasks 1–2 |
| Source attribution UI | Task 1 |
| SEO HTML + Article citation | Task 1 + 4 |
| SEO skill | Task 3 |
| Keep existing 4 posts | Task 2 (append only) |
