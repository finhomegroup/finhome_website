# SEO Improvements — FinHome Landing (Next.js 16, Static Export)

**Date:** 2026-07-16
**Status:** Approved (design)

## Context

FinHome is a Vietnamese landing site built with Next.js 16 (App Router, SSG via
`output: "export"`), React 19, Tailwind v4. It deploys as a fully static site to
Vercel (`out/`). Config sets `trailingSlash: true`, so every route resolves at
`route/index.html` and public URLs end with `/`.

Current SEO state:
- Basic default metadata in `app/layout.tsx` (title, description, minimal
  OpenGraph title/description/type).
- Per-page metadata for `/blog` (static), `/blog/[slug]` (`generateMetadata`),
  `/privacy-policy`, `/terms`.
- GA4 wired via `components/google-analytics.tsx`.
- Favicon via `app/icon.svg` (file convention).

Missing: `metadataBase`, canonical URLs, Twitter cards, keywords, robots meta,
sitemap, robots.txt, JSON-LD structured data, OG images, manifest, Search Console
verification.

**Production domain:** `https://finhome.group` (confirmed via
`support@finhome.group` in `content/site.ts`).

## Goals

Ship a complete, correct SEO baseline for the static export without a Node server
at runtime. All generation happens at build time.

Non-goals: runtime/dynamic OG generation, multilingual/i18n, A/B SEO experiments,
unrelated refactors.

## Constraints & gotchas

- **Static export**: `sitemap.ts`, `robots.ts`, `manifest.ts` are supported and
  emit static files at build. No runtime route handlers.
- **`trailingSlash: true`**: canonical and sitemap URLs MUST end with `/`
  (e.g. `https://finhome.group/blog/`), otherwise canonical won't match the served
  URL and sitemap entries redirect.
- **Next.js 16**: APIs may differ from prior versions. Per `AGENTS.md`, read the
  relevant guide under `node_modules/next/dist/docs/` (metadata, sitemap, robots,
  manifest) before writing code.
- Keep the domain in ONE place so it can change without hunting.

## Architecture

### 1. Central SEO config — `content/site.ts`

Add an exported `SITE` (or `SEO`) block:

```ts
export const SITE = {
  url: "https://finhome.group",
  name: "FinHome",
  title: "FinHome — Mua nhà an toàn, sống an yên",
  description: "<existing default description>",
  locale: "vi_VN",
  ogImage: "/og-image.png", // 1200x630, relative to SITE.url via metadataBase
  keywords: [
    "FinHome", "mua nhà", "vay mua nhà", "la bàn tài chính",
    "khả năng vay", "bất động sản", "nhà ở xã hội", "tài chính cá nhân",
  ],
};
```

Helper `absUrl(path)` and `canonical(path)` (ensures trailing slash) may live in a
small `lib/seo.ts` to avoid duplication across pages.

### 2. Default metadata — `app/layout.tsx`

Extend the existing `metadata` export:
- `metadataBase: new URL(SITE.url)` — required for relative canonical/OG images.
- `keywords`, `robots: { index: true, follow: true }`, `authors`/`creator`.
- `openGraph`: add `siteName`, `locale`, `url`, keep `type: "website"`, add
  `images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }]`.
- `twitter`: `card: "summary_large_image"`, title, description, images.
- `alternates: { canonical: "/" }` (home default; per-page overrides below).
- `verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }`
  (omit cleanly when env unset).
- Keep `icons` behavior (icon.svg via convention; add explicit entry only if
  needed).

### 3. Per-page metadata

- **`/` (`app/page.tsx`)**: currently relies on layout default. Add explicit
  `metadata` with `alternates.canonical: "/"` (or rely on layout default — but set
  it explicitly for clarity).
- **`/blog` (`app/blog/page.tsx`)**: add `alternates.canonical: "/blog/"` and
  `openGraph` (title/description/url).
- **`/blog/[slug]` (`app/blog/[slug]/page.tsx`)**: extend `generateMetadata` with
  `alternates.canonical: "/blog/<slug>/"`, `openGraph` `type: "article"`, and
  `images` set from the post cover (resolved via `img()`), plus `twitter` image.
- **`/privacy-policy`, `/terms`**: add `alternates.canonical` for each.

### 4. Sitemap — `app/sitemap.ts`

Default-export a function returning `MetadataRoute.Sitemap`:
- Static routes: `/`, `/blog/`, `/privacy-policy/`, `/terms/`.
- Blog posts: `/blog/<slug>/` for each `POSTS` entry.
- All `url` absolute with trailing slash; set `changeFrequency` and `priority`
  (home highest, posts use `lastModified` from post `date` when present).

### 5. Robots — `app/robots.ts`

Default-export returning `MetadataRoute.Robots`:
- `rules: [{ userAgent: "*", allow: "/" }]`
- `sitemap: "https://finhome.group/sitemap.xml"`
- `host: SITE.url`

### 6. Structured data (JSON-LD) — `components/json-ld.tsx`

A small server component rendering `<script type="application/ld+json">` with
sanitized JSON:
- **Home**: `Organization` (name, url, logo, contactPoint from `CONTACT`,
  address) + `WebSite` (name, url).
- **Blog post**: `Article` / `BlogPosting` (headline, description, image,
  author, publisher, `datePublished` from post `date`, `mainEntityOfPage`).

Rendered inside the relevant pages (home in `app/page.tsx`, article in
`app/blog/[slug]/page.tsx`).

### 7. OG image — `public/og-image.png`

Requirement: use an existing brand asset. Produce a 1200×630 PNG named
`public/og-image.png` derived from an existing hero/brand asset in
`public/images` or `public/logos` (resize/crop only; no new artwork). Per-post OG
uses the post cover image instead of the global default.

### 8. Web manifest — `app/manifest.ts`

Default-export returning `MetadataRoute.Manifest`:
- `name`, `short_name: "FinHome"`, `description`, `start_url: "/"`,
  `display: "standalone"`, `theme_color`, `background_color`,
  `icons` (icon.svg, and `/logos/Logo_7.png`).

### 9. Environment — `.env.example`

Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=` with a comment explaining it's the
Google Search Console verification token (leave blank until provisioned).

### 10. Content — `content/posts.ts`

Add an optional `date` field (ISO `YYYY-MM-DD`) to the `Post` type and populate it
for the 4 existing posts. Used for Article `datePublished` and sitemap
`lastModified`. When absent, those fields are simply omitted.

## Data flow

Build time only: `next build` executes `metadata`/`generateMetadata`,
`sitemap.ts`, `robots.ts`, `manifest.ts` and emits static `sitemap.xml`,
`robots.txt`, `manifest.webmanifest`, and per-page `<head>` tags into `out/`.
JSON-LD is rendered inline in each page's HTML.

## Testing / verification

- `pnpm build` succeeds; inspect `out/` for `sitemap.xml`, `robots.txt`,
  `manifest.webmanifest`.
- Grep built HTML for canonical, og:*, twitter:*, and `application/ld+json`.
- Validate JSON-LD parses (JSON.parse in a quick check) and matches schema shape.
- Confirm all sitemap URLs use `https://finhome.group/.../` with trailing slash.
- `pnpm lint` passes.

## Out of scope

- Actually registering the site in Google Search Console.
- Generating brand-new OG artwork.
- i18n / hreflang.
