# SEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete, build-time SEO baseline (metadata, canonical, OpenGraph/Twitter, sitemap, robots, manifest, JSON-LD, OG image) to the FinHome static-export site.

**Architecture:** All SEO output is generated at build time — no runtime server. A single `SITE` config in `content/site.ts` plus helpers in `lib/seo.ts` centralize the domain and derived URLs/schema. Root `app/layout.tsx` holds default metadata; each page overrides canonical/OpenGraph. `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` emit static files. JSON-LD is rendered inline per page via a small `JsonLd` component.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19, TypeScript 5. No test runner in the repo — verification is `pnpm build` + `pnpm lint` + `grep` assertions over the generated `out/` directory. macOS `sips` is used for image resizing.

## Global Constraints

- **Domain:** `https://finhome.group` — defined once in `content/site.ts`, never hardcoded elsewhere.
- **`trailingSlash: true`** (`next.config.ts`): every canonical and sitemap URL MUST end with `/` (e.g. `https://finhome.group/blog/`). Home is `/`.
- **Static export:** no request-time APIs in `sitemap.ts`/`robots.ts`/`manifest.ts`/`generateMetadata`. Build-time only.
- **`metadataBase` is required** in `app/layout.tsx` — relative canonical/OG paths cause a build error without it (Next.js docs).
- **Next.js 16 metadata API** — before editing metadata files, skim `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` and the file-convention docs for `sitemap`/`robots`/`manifest`.
- **Language:** all human-facing copy in Vietnamese, matching existing tone.
- **`metadata` / `generateMetadata` only work in Server Components** — do not add them to files with `"use client"`.
- Commit after each task.

## File Structure

- Create: `lib/seo.ts` — domain-aware URL helpers + JSON-LD schema builders.
- Create: `components/json-ld.tsx` — renders a `<script type="application/ld+json">` tag.
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` — static SEO route files.
- Create: `public/og-image.png` — 1200×630 default OpenGraph image.
- Modify: `content/site.ts` — add `SITE` config block.
- Modify: `content/posts.ts` — add optional `date` field + values.
- Modify: `app/layout.tsx` — full default metadata + `metadataBase`.
- Modify: `app/page.tsx` — home Organization + WebSite JSON-LD.
- Modify: `app/blog/page.tsx`, `app/privacy-policy/page.tsx`, `app/terms/page.tsx` — canonical + OpenGraph.
- Modify: `app/blog/[slug]/page.tsx` — canonical + article OpenGraph + Article JSON-LD.
- Modify: `.env.example` — Google Search Console verification token.

---

### Task 1: SEO config, URL helpers, schema builders, post dates

**Files:**
- Modify: `content/site.ts` (append `SITE` block)
- Modify: `content/posts.ts` (add `date` to type + entries)
- Create: `lib/seo.ts`

**Interfaces:**
- Produces:
  - `SITE` object: `{ url, name, title, description, locale, ogImage, keywords }` (all strings except `keywords: string[]`).
  - `absUrl(path: string): string` — absolute URL from a site-relative path.
  - `canonicalPath(path: string): string` — leading + trailing slash normalized (`"/"` stays `"/"`).
  - `organizationSchema(): Record<string, unknown>`
  - `websiteSchema(): Record<string, unknown>`
  - `articleSchema(post: Post): Record<string, unknown>`
  - `Post.date?: string` (ISO `YYYY-MM-DD`).

- [ ] **Step 1: Add the `SITE` block to `content/site.ts`**

Append to the end of `content/site.ts`:

```ts
// Single source of truth for SEO. Change the domain here only.
export const SITE = {
  url: "https://finhome.group",
  name: "FinHome",
  title: "FinHome — Mua nhà an toàn, sống an yên",
  description:
    "FinHome giúp bạn chọn đúng nhà, vay đúng sức: xác định vùng mua nhà an toàn, đánh giá khả năng vay và mở khóa la bàn định hướng tài chính.",
  locale: "vi_VN",
  ogImage: "/og-image.png", // 1200x630, resolved against SITE.url via metadataBase
  keywords: [
    "FinHome",
    "mua nhà",
    "vay mua nhà",
    "la bàn tài chính",
    "khả năng vay",
    "bất động sản",
    "nhà ở xã hội",
    "tài chính cá nhân",
  ],
} as const;
```

- [ ] **Step 2: Add `date` to the `Post` type and populate entries in `content/posts.ts`**

In the `Post` type, add after `cover`:

```ts
  date?: string; // ISO YYYY-MM-DD publish date (for Article schema + sitemap lastmod)
```

Add a `date` field to each of the four `POSTS` entries (values below are editable placeholders reflecting mid-2026 publication):

```ts
// dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026
date: "2026-06-20",
// lai-suat-vay-tang-cao-dong-tien-dich-chuyen
date: "2026-06-28",
// ma-dinh-danh-bat-dong-san-tu-2026
date: "2026-07-05",
// thu-tuong-tang-quy-dat-ho-tro-tin-dung-nha-o
date: "2026-07-12",
```

- [ ] **Step 3: Create `lib/seo.ts`**

```ts
// Domain-aware URL helpers and JSON-LD schema builders. All build-time only.
import { SITE, CONTACT } from "@/content/site";
import { img } from "@/lib/images";
import type { Post } from "@/content/posts";

/** Absolute URL from a site-relative path, e.g. "/blog/" -> "https://finhome.group/blog/". */
export function absUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE.url).toString();
}

/** Normalize to leading + trailing slash to match `trailingSlash: true`. "/" stays "/". */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absUrl("/logos/Logo_7.png"),
    email: CONTACT.email,
    telephone: CONTACT.phoneTel,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressCountry: "VN",
    },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "vi-VN",
  };
}

export function articleSchema(post: Post): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: absUrl(img(post.cover)),
    ...(post.date ? { datePublished: post.date } : {}),
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absUrl("/logos/Logo_7.png") },
    },
    mainEntityOfPage: absUrl(canonicalPath(`/blog/${post.slug}`)),
  };
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If `img`'s exported name differs, confirm via `grep -n "export" lib/images.ts` and adjust the import.)

- [ ] **Step 5: Lint**

Run: `pnpm lint`
Expected: no errors on the changed files.

- [ ] **Step 6: Commit**

```bash
git add content/site.ts content/posts.ts lib/seo.ts
git commit -m "feat(seo): add central SITE config, url helpers, and schema builders"
```

---

### Task 2: JsonLd component

**Files:**
- Create: `components/json-ld.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `JsonLd({ data }: { data: Record<string, unknown> })` — a Server Component rendering one `<script type="application/ld+json">`.

- [ ] **Step 1: Create `components/json-ld.tsx`**

```tsx
// Renders a JSON-LD structured-data block. Server Component (no "use client").
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, build-time content — safe to inline.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/json-ld.tsx
git commit -m "feat(seo): add JsonLd structured-data component"
```

---

### Task 3: Default OpenGraph image asset

**Files:**
- Create: `public/og-image.png` (1200×630)

**Interfaces:**
- Produces: `public/og-image.png` served at `/og-image.png` (referenced by `SITE.ogImage`).

- [ ] **Step 1: Generate a 1200×630 PNG from the existing skyline asset**

Source: `public/images/pBWyVGbn6q90q7em1mpZCUhjo.jpg` (4500×2251, real-estate skyline — brand-neutral, ratio ≈ 2.0). Resize to height 630 (→ 1260×630) then center-crop to 1200×630. `sips -c` takes HEIGHT then WIDTH.

```bash
SCRATCH="/private/tmp/claude-501/-Users-minhle-Personal-finhome-website/d90720e4-bcb1-498e-acf9-8228cee63900/scratchpad"
sips -s format png --resampleHeight 630 \
  public/images/pBWyVGbn6q90q7em1mpZCUhjo.jpg \
  --out "$SCRATCH/og-src.png"
sips -c 630 1200 "$SCRATCH/og-src.png" --out public/og-image.png
```

- [ ] **Step 2: Verify dimensions**

Run: `sips -g pixelWidth -g pixelHeight public/og-image.png`
Expected: `pixelWidth: 1200` and `pixelHeight: 630`.

- [ ] **Step 3: Commit**

```bash
git add public/og-image.png
git commit -m "feat(seo): add 1200x630 default OpenGraph image"
```

---

### Task 4: Default metadata in root layout + verification env

**Files:**
- Modify: `app/layout.tsx:5-15` (the `metadata` export)
- Modify: `.env.example`

**Interfaces:**
- Consumes: `SITE`, `canonicalPath` (Task 1).
- Produces: site-wide default `metadata` with `metadataBase`, canonical `/`, OpenGraph, Twitter, robots, keywords, verification.

- [ ] **Step 1: Replace the `metadata` export in `app/layout.tsx`**

Replace lines 1-15 (imports + `metadata`) with:

```tsx
import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SITE } from "@/content/site";
import { canonicalPath } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s — FinHome",
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  // Favicon resolved from app/icon.svg via the file convention.
  alternates: {
    canonical: canonicalPath("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};
```

> Note: existing blog/legal pages use plain string `title` values (e.g. `"Tin tức bất động sản — FinHome"`). The `title.template` above appends `" — FinHome"` only to child titles that are plain strings AND not already using absolute form. To avoid double suffixes, Task 5/6 switch page titles to the bare topic (template adds the suffix). Verify no `"— FinHome — FinHome"` appears in Step 3.

- [ ] **Step 2: Add the verification token to `.env.example`**

Append to `.env.example`:

```bash
# Google Search Console verification token (from the "HTML tag" method).
# Leave blank until the property is provisioned.
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

- [ ] **Step 3: Build and verify the home `<head>`**

Run:
```bash
pnpm build && \
grep -o '<link rel="canonical"[^>]*>' out/index.html && \
grep -o '<meta property="og:image"[^>]*>' out/index.html && \
grep -o '<meta name="twitter:card"[^>]*>' out/index.html && \
! grep -q '— FinHome — FinHome' out/index.html && echo "OK: no double suffix"
```
Expected: canonical `https://finhome.group/`, `og:image` `https://finhome.group/og-image.png`, `twitter:card` `summary_large_image`, and `OK: no double suffix`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx .env.example
git commit -m "feat(seo): full default metadata, canonical, OG/Twitter, verification"
```

---

### Task 5: Canonical + OpenGraph for blog list and legal pages

**Files:**
- Modify: `app/blog/page.tsx:12-16` (`metadata`)
- Modify: `app/privacy-policy/page.tsx` (`metadata`, ~lines 9-12)
- Modify: `app/terms/page.tsx` (`metadata`)

**Interfaces:**
- Consumes: `canonicalPath` (Task 1).
- Produces: per-page `alternates.canonical` + `openGraph`.

- [ ] **Step 1: Update `app/blog/page.tsx` metadata**

Add the import near the other imports:

```tsx
import { canonicalPath } from "@/lib/seo";
```

Replace the existing `metadata` export with (title becomes bare topic — layout template adds `" — FinHome"`):

```tsx
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
```

- [ ] **Step 2: Update `app/privacy-policy/page.tsx` metadata**

Add `import { canonicalPath } from "@/lib/seo";`. Replace the `metadata` export (currently uses an absolute `"… — FinHome"` title, which would double-suffix under the new `title.template`) with the bare-title form plus canonical:

```tsx
export const metadata: Metadata = {
  title: PRIVACY_CONTENT.pageTitle,
  description: PRIVACY_CONTENT.intro,
  alternates: { canonical: canonicalPath("/privacy-policy") },
};
```

- [ ] **Step 3: Update `app/terms/page.tsx` metadata**

Add `import { canonicalPath } from "@/lib/seo";`. Replace the `metadata` export with the bare-title form plus canonical:

```tsx
export const metadata: Metadata = {
  title: TERMS_CONTENT.pageTitle,
  description: TERMS_CONTENT.intro,
  alternates: { canonical: canonicalPath("/terms") },
};
```

- [ ] **Step 4: Build and verify canonicals**

Run:
```bash
pnpm build && \
grep -o '<link rel="canonical"[^>]*>' out/blog/index.html && \
grep -o '<link rel="canonical"[^>]*>' out/privacy-policy/index.html && \
grep -o '<link rel="canonical"[^>]*>' out/terms/index.html
```
Expected: `https://finhome.group/blog/`, `https://finhome.group/privacy-policy/`, `https://finhome.group/terms/` (all trailing-slashed).

- [ ] **Step 5: Commit**

```bash
git add app/blog/page.tsx app/privacy-policy/page.tsx app/terms/page.tsx
git commit -m "feat(seo): canonical + OpenGraph for blog list and legal pages"
```

---

### Task 6: Blog post metadata + Article JSON-LD

**Files:**
- Modify: `app/blog/[slug]/page.tsx:20-32` (`generateMetadata`) and the page body (render `JsonLd`)

**Interfaces:**
- Consumes: `canonicalPath`, `absUrl`, `articleSchema` (Task 1), `JsonLd` (Task 2), `img`, `getPost`.
- Produces: article canonical + OpenGraph (type `article`, cover image) + `Article` JSON-LD in the page HTML.

- [ ] **Step 1: Extend `generateMetadata` in `app/blog/[slug]/page.tsx`**

Add imports near the top:

```tsx
import { canonicalPath, absUrl, articleSchema } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
```

Replace the `generateMetadata` body (currently lines 20-32) with:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = canonicalPath(`/blog/${post.slug}`);
  const cover = absUrl(img(post.cover));
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${post.title} — FinHome`,
      description: post.excerpt,
      ...(post.date ? { publishedTime: post.date } : {}),
      images: [{ url: cover, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — FinHome`,
      description: post.excerpt,
      images: [cover],
    },
  };
}
```

- [ ] **Step 2: Render the Article JSON-LD in the page body**

In the `Page` component's returned JSX (after resolving `post`, and guarded by the existing `notFound()`/post check), add the JSON-LD as the first child of the returned fragment:

```tsx
      <JsonLd data={articleSchema(post)} />
```

(Place it inside the top-level returned fragment/element so it renders into the page HTML.)

- [ ] **Step 3: Build and verify an article page**

Run:
```bash
SLUG=dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026
pnpm build && \
grep -o '<link rel="canonical"[^>]*>' out/blog/$SLUG/index.html && \
grep -o '<meta property="og:type"[^>]*>' out/blog/$SLUG/index.html && \
grep -c 'application/ld+json' out/blog/$SLUG/index.html && \
node -e "const h=require('fs').readFileSync('out/blog/'+process.env.SLUG+'/index.html','utf8');const m=h.match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s);JSON.parse(m[1]);console.log('JSON-LD valid:', JSON.parse(m[1])['@type']);" SLUG=$SLUG
```
Expected: canonical `.../blog/dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026/`, `og:type` `article`, at least one `application/ld+json`, and `JSON-LD valid: Article`.

- [ ] **Step 4: Commit**

```bash
git add "app/blog/[slug]/page.tsx"
git commit -m "feat(seo): article metadata, OG image, and Article JSON-LD for blog posts"
```

---

### Task 7: Home Organization + WebSite JSON-LD

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `organizationSchema`, `websiteSchema` (Task 1), `JsonLd` (Task 2).
- Produces: two JSON-LD blocks in the home page HTML.

- [ ] **Step 1: Add imports and render JSON-LD in `app/page.tsx`**

Add imports:

```tsx
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo";
```

Add as the first children of the returned fragment (before `<SiteHeader />`):

```tsx
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
```

- [ ] **Step 2: Build and verify**

Run:
```bash
pnpm build && \
grep -c 'application/ld+json' out/index.html && \
node -e "const h=require('fs').readFileSync('out/index.html','utf8');const ms=[...h.matchAll(/<script type=\"application\/ld\+json\">(.*?)<\/script>/gs)];console.log(ms.map(m=>JSON.parse(m[1])['@type']));"
```
Expected: count `2`, and printed types `[ 'Organization', 'WebSite' ]`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(seo): Organization and WebSite JSON-LD on home page"
```

---

### Task 8: Sitemap

**Files:**
- Create: `app/sitemap.ts`

**Interfaces:**
- Consumes: `SITE`, `absUrl`, `canonicalPath` (Task 1), `POSTS` (`content/posts.ts`).
- Produces: `sitemap.xml` covering all static routes + blog posts, trailing-slashed.

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { absUrl, canonicalPath } from "@/lib/seo";
import { POSTS } from "@/content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absUrl(canonicalPath("/")), changeFrequency: "weekly", priority: 1 },
    { url: absUrl(canonicalPath("/blog")), changeFrequency: "weekly", priority: 0.8 },
    { url: absUrl(canonicalPath("/privacy-policy")), changeFrequency: "yearly", priority: 0.3 },
    { url: absUrl(canonicalPath("/terms")), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postEntries: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: absUrl(canonicalPath(`/blog/${post.slug}`)),
    ...(post.date ? { lastModified: post.date } : {}),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
```

- [ ] **Step 2: Build and verify `sitemap.xml`**

Run:
```bash
pnpm build && \
grep -c '<loc>' out/sitemap.xml && \
grep -o '<loc>https://finhome.group/blog/[^<]*</loc>' out/sitemap.xml && \
! grep -oE '<loc>https://finhome\.group/[a-z-]+</loc>' out/sitemap.xml && echo "OK: all URLs trailing-slashed"
```
Expected: `8` `<loc>` entries, the five blog URLs listed with trailing slash, and `OK: all URLs trailing-slashed`.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(seo): generate sitemap.xml for all routes and posts"
```

---

### Task 9: Robots

**Files:**
- Create: `app/robots.ts`

**Interfaces:**
- Consumes: `SITE`, `absUrl` (Task 1).
- Produces: `robots.txt` allowing all crawlers and pointing to the sitemap.

- [ ] **Step 1: Create `app/robots.ts`**

`SITE` lives in `@/content/site`; `absUrl` in `@/lib/seo`.

```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { absUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
```

- [ ] **Step 2: Build and verify `robots.txt`**

Run:
```bash
pnpm build && cat out/robots.txt
```
Expected: contains `User-Agent: *`, `Allow: /`, and `Sitemap: https://finhome.group/sitemap.xml`.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat(seo): generate robots.txt with sitemap reference"
```

---

### Task 10: Web manifest

**Files:**
- Create: `app/manifest.ts`

**Interfaces:**
- Consumes: `SITE` (`content/site.ts`).
- Produces: `manifest.webmanifest`.

- [ ] **Step 1: Create `app/manifest.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.title,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/logos/Logo_7.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
```

> Note: `/icon.svg` is served from the `app/icon.svg` file convention at the site root. Confirm it resolves after build (Step 2). `theme_color`/`background_color` use white; adjust to the brand color if a token exists in `globals.css`.

- [ ] **Step 2: Build and verify**

Run:
```bash
pnpm build && cat out/manifest.webmanifest | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const m=JSON.parse(s);console.log('name:',m.name,'| icons:',m.icons.length);})"
```
Expected: prints the name and `icons: 2`.

- [ ] **Step 3: Commit**

```bash
git add app/manifest.ts
git commit -m "feat(seo): add web app manifest"
```

---

### Task 11: Final full verification

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `rm -rf out .next && pnpm build`
Expected: build succeeds with no errors/warnings about metadata.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Assert all SEO artifacts exist**

Run:
```bash
ls out/sitemap.xml out/robots.txt out/manifest.webmanifest out/og-image.png && \
for f in index blog/index privacy-policy/index terms/index blog/dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026/index; do
  echo "== $f =="
  grep -o '<link rel="canonical"[^>]*>' "out/$f.html"
done && \
grep -c 'application/ld+json' out/index.html out/blog/dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026/index.html
```
Expected: all four artifact files exist; every page prints a trailing-slashed canonical on `finhome.group`; JSON-LD counts are `2` (home) and `≥1` (article).

- [ ] **Step 4: Confirm no hardcoded domain leaked outside config**

Run: `grep -rn "finhome.group" app lib components | grep -v "content/site.ts"`
Expected: no matches (the domain lives only in `content/site.ts`).

- [ ] **Step 5: Final commit (if any tidy-ups were needed)**

```bash
git add -A
git commit -m "chore(seo): final verification tidy-ups" || echo "nothing to commit"
```

---

## Notes for the implementer

- If `img` is not the exported symbol name in `lib/images.ts`, run `grep -n "export" lib/images.ts` and adjust imports in `lib/seo.ts` and the blog page.
- Do not add a test framework; the repo has none. Build + grep is the verification contract here.
- The OG image is a plain skyline photo (no logo overlay). A branded OG (logo + tagline composite) is a reasonable future enhancement but is out of scope — it would require a compositing dependency (e.g. `sharp` or `next/og`).
- Google Search Console: after deploy, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in the Vercel env and submit `https://finhome.group/sitemap.xml`.
