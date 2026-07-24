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
- User asks to "SEO blog", "optimize HTML bài viết", or publish roundups

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
