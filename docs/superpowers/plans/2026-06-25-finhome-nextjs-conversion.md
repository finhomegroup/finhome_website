# FinHome Next.js Conversion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean Next.js landing site for FinHome that visually matches the Framer mirror (`finhome-framer-mirror/`) to ~95%+, with a blog (listing + 4 MDX articles).

**Architecture:** Next.js App Router (SSG) + TypeScript + Tailwind + shadcn/ui + Framer Motion. Each landing section is an isolated server/client component; copy & image references live in `content/*.ts`; blog bodies live in MDX. All assets are local (no Framer CDN / analytics).

**Tech Stack:** Next.js (latest), React, TypeScript, Tailwind CSS v3, shadcn/ui (Radix), embla-carousel, Framer Motion, next-mdx-remote (or `@next/mdx`).

## Global Constraints

- App lives in `finhome-website/finhome-next/` — do NOT touch the root Vite app or `finhome-framer-mirror/`.
- Source of truth for layout/visuals: `finhome-framer-mirror/index.html`, `blog.html`, `blog/*.html`. Run the mirror with `cd finhome-framer-mirror && python3 serve.py` (http://localhost:8899) for visual comparison.
- Brand colors: primary `#0099ff`; green `#17ab48`; lime `#a2db46`; soft-green `#90d77b`; bg-soft `#f7fcf7`; text `#000000`/`#575757`/`#848484`/`#bcbcbc`; white `#ffffff`.
- Fonts: `Inter` (body), `Maison Neue Extended` Medium+Book (display/headings) via `next/font/local`; `Geist` via `next/font/google`.
- Contact email: `hotro@finhome.group` (NOT `support@finhome.group`).
- Hotline: `0963 177 497`. Address: `51 Nguyễn Thị Minh Khai, Quận 1, TP HCM`.
- "Thử ngay" CTA links to `#` (placeholder until real app URL provided).
- All Vietnamese copy must be reproduced verbatim (with diacritics) from the mirror.
- Every task ends with: `pnpm build` (or `npm run build`) passes + `pnpm lint` passes.

---

## Content reference (verbatim, for content/*.ts)

**Nav:** Tính năng · Nền tảng · Hỗ trợ · Tin tức | CTA: Thử ngay

**Hero headline:** `FinHome giúp bạn chọn đúng nhà, vay đúng sức`

**Steps section** — eyebrow/title: `Các bước đơn giản để hiểu khả năng mua nhà của bạn`; lead block title `Khởi động bằng dữ liệu`, lead body `Nhập thông tin cơ bản, FinHome sẽ xác định vùng mua nhà an toàn, đánh giá khả năng vay và mở khóa la bàn định hướng tài chính cho bạn`. Three steps:
1. `Xác định vùng mua nhà an toàn` — `Biết mức giá căn nhà phù hợp với tài chính hiện tại của bạn`
2. `Đánh giá phương án vay vốn` — `Kiểm tra khả năng vay và áp lực trả nợ trước khi mua nhà`
3. `Mở khóa La bàn tài chính` — `Nhận điểm số và định hướng tổng quan tài chính của bạn`

**Platform section** — title `Một nền tảng đồng hành cùng bạn cả hành trình mua nhà`. Six features:
1. `Cá nhân hóa trải nghiệm` — `Gợi ý phù hợp hơn với tình trạng tài chính và hành trình của bạn`
2. `Luôn cập nhật xu hướng` — `Cập nhật tín hiệu mới để bạn chủ động hơn`
3. `Tính toán thông minh từ dữ liệu` — `Kết nối dữ liệu cơ bản thành tính toán rõ ràng và gợi ý thực tế`
4. `Giao diện thân thiện` — `Thiết kế trực quan, dễ dùng, dễ theo dõi`
5. `Nền tảng đa tính năng` — `Đủ tính năng để đánh giá, theo dõi và ra quyết định tốt hơn`
6. `Diễn giải kết quả rõ ràng` — `Biến kết quả tính toán thành nhận định dễ hiểu và dễ hành động`

**Testimonials** — title `Trải nghiệm từ người dùng`, sub `Góc nhìn từ người dùng sau khi hiểu rõ hơn về khả năng tài chính và quyết định mua nhà với FinHome`. Three:
1. `Điều tôi thích ở FinHome là mọi thứ dễ hiểu và sát thực tế. Tôi biết mình đang ở đâu về tài chính, nên chọn mức giá nào và cần cẩn trọng điều gì trước khi xuống tiền.` — `Anh Phạm` · `Nhân viên văn phòng`
2. `FinHome không giúp tôi mua nhanh hơn, mà giúp tôi mua chắc hơn. Tôi hiểu rõ ngân sách, khả năng vay và các rủi ro cần cân nhắc trước khi bước tiếp.` — `Thùy Như` · `Người mua nhà lần đầu`
3. `Trước đây tôi tìm nhà khá cảm tính. Dùng FinHome rồi, tôi mới biết mình phù hợp với mức giá nào, nên vay bao nhiêu và cần tránh những rủi ro gì.` — `Thái Vin` · `Nhà đầu tư bất động sản`

**FAQ** — title `Những câu hỏi thường gặp`, sub `Những thông tin cần thiết giúp bạn hiểu rõ FinHome trước khi trải nghiệm`. Five (answers: extract verbatim from `index.html`; Q1 answer = `FinHome là ứng dụng hỗ trợ bạn hiểu rõ khả năng tài chính cá nhân khi mua nhà, từ mức giá phù hợp, khả năng vay an toàn đến các gợi ý giúp ra quyết định tự tin hơn.`):
1. `FinHome là gì và giúp tôi điều gì?`
2. `FinHome đánh giá khả năng tài chính như thế nào?`
3. `FinHome có giúp tôi biết mình vay bao nhiêu là an toàn không?`
4. `La bàn trong FinHome là gì và mở khóa như thế nào?`
5. `Dữ liệu tài chính của tôi trên FinHome có an toàn không?`

(Answers for Q2–Q5 are collapsed in the mirror; extract from `index.html` accordion markup. If an answer is empty in source, leave the panel empty.)

**News section** — title `Tin tức bất động sản`, sub `Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở`. Cards link to the 4 posts below. CTA `Xem thêm` → `/blog`.

**Footer** — `Liên hệ` / address / `hotro@finhome.group` / `Chuyên gia tư vấn BĐS: 0963 177 497`; col `Tính năng`: `La bàn tài chính`, `Đánh giá khả năng tài chính`, `Đánh giá khả năng vay vốn`; col `FinHome`: `Về chúng tôi`, `Chính sách bảo mật`, `Điều khoản sử dụng`; `© 2026 FinHome. Mọi quyền được bảo lưu.`

**Blog posts** (4) — `{ slug, title, category, excerpt, readingTime }`:
1. slug `dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026` · `Nhà ở xã hội` · `5 phút đọc` · title `Điều kiện vay mua nhà ở xã hội năm 2026` · source `blog/streamlining-saas-operations-without-adding-overhead.html` · excerpt `Trong bối cảnh chi phí nhà ở ngày càng tăng, chính sách nhà ở xã hội tiếp tục là giải pháp giúp người thu nhập trung bình và thấp có cơ hội an cư. Tuy nhiên, để tiếp cận nguồn vốn vay ưu đãi, người mua cần đáp ứng một loạt điều kiện cụ thể theo quy định mới nhất.`
2. slug `lai-suat-vay-tang-cao-dong-tien-dich-chuyen` · `Tài chính` · `5 phút đọc` · title `Lãi suất vay tăng cao, dòng tiền đầu tư dịch chuyển ra sao?` · source `blog/điều-kiện-vay-mua-nhà-ở-xã-hội-năm-2026-copy.html`
3. slug `ma-dinh-danh-bat-dong-san-tu-2026` · `Bất động sản` · title `Mã định danh bất động sản từ 2026: Bước ngoặt minh bạch hóa thị trường` · source `blog/điều-kiện-vay-mua-nhà-ở-xã-hội-năm-2026-copy-copy.html`
4. slug `thu-tuong-tang-quy-dat-ho-tro-tin-dung-nha-o` · `Nhà ở xã hội` · title `Thủ tướng: Tăng quỹ đất, hỗ trợ tín dụng nhà ở giá phù hợp` · source `blog/điều-kiện-vay-mua-nhà-ở-xã-hội-năm-2026-copy-copy-copy.html`

---

## File structure

```
finhome-next/
  app/
    layout.tsx              # html, fonts, globals, metadata
    globals.css             # tailwind + tokens
    page.tsx                # home: assembles sections
    blog/page.tsx           # listing
    blog/[slug]/page.tsx    # detail (renders MDX)
  components/
    site-header.tsx  site-footer.tsx
    sections/hero.tsx  steps.tsx  platform.tsx  testimonials.tsx  faq.tsx  news.tsx
    ui/                     # shadcn primitives (accordion, carousel, button…)
    reveal.tsx              # Framer Motion scroll-reveal wrapper
  content/
    site.ts                 # nav, footer, brand text
    home.ts                 # hero/steps/platform/testimonials/faq/news data
    posts.ts                # blog post metadata (the 4 above) + slug→mdx map
  content/posts/*.mdx       # 4 article bodies
  lib/images.ts             # clean image name map
  public/images/*  public/fonts/*
  scripts/import-assets.mjs # copies+renames assets from mirror
  next.config.mjs  tailwind.config.ts  tsconfig.json  package.json
```

---

### Task 1: Scaffold Next.js app + Tailwind + tokens + fonts + base layout

**Files:**
- Create: `finhome-next/` via `create-next-app`
- Create/Modify: `finhome-next/app/globals.css`, `finhome-next/tailwind.config.ts`, `finhome-next/app/layout.tsx`
- Create: `finhome-next/scripts/import-assets.mjs`, `finhome-next/lib/images.ts`

**Produces:** Tailwind theme exposing colors `primary`, `brand-green`, `brand-lime`, `bg-soft`, text grays; font CSS vars `--font-inter`, `--font-maison`, `--font-geist`; `cleanImageName(original: string): string` in `lib/images.ts`.

- [ ] **Step 1:** Scaffold:
```bash
cd finhome-website
pnpm create next-app@latest finhome-next --ts --app --tailwind --eslint --src-dir=false --import-alias "@/*" --use-pnpm --no-turbopack
```
- [ ] **Step 2:** Write `scripts/import-assets.mjs` — read `../finhome-framer-mirror`, copy every `images/*` and `assets/*.woff2` into `public/images` / `public/fonts`, stripping the `@…` suffix (e.g. `abc.png@width=4170&height=3750` → `abc.png`); when multiple variants exist keep the largest file; emit `lib/images.ts` mapping originalBaseName→`/images/<clean>`.
- [ ] **Step 3:** Run `node scripts/import-assets.mjs`. Expected: `public/images` populated, `public/fonts` has the woff2 files, `lib/images.ts` written.
- [ ] **Step 4:** In `app/layout.tsx` register fonts with `next/font/local` (Inter, Maison Neue Extended Medium+Book from `public/fonts`) and `next/font/google` (Geist); set `<html lang="vi">`; set `metadata = { title: 'FinHome', description: '...' }`; apply font CSS vars on `<body>`.
- [ ] **Step 5:** In `tailwind.config.ts` extend `colors` and `fontFamily` per Global Constraints; in `globals.css` add the brand tokens as CSS variables and base body styles (bg white, text `#000`, font Inter).
- [ ] **Step 6:** Verify: `pnpm build` passes; `pnpm dev` renders an empty styled page. Commit.
```bash
git add finhome-next && git commit -m "feat(finhome-next): scaffold Next.js app, tokens, fonts, asset import"
```

---

### Task 2: Content data + shared types

**Files:** Create `finhome-next/content/site.ts`, `content/home.ts`, `content/posts.ts`.

**Produces:**
- `site.ts`: `NAV_ITEMS: {label:string; href:string}[]`, `FOOTER: {...}`, `CONTACT: {email:'hotro@finhome.group'; phone:'0963 177 497'; address:string}`.
- `home.ts`: `HERO`, `STEPS: {title;desc;icon?}[]`, `PLATFORM_FEATURES: {title;desc}[]`, `TESTIMONIALS: {quote;name;role}[]`, `FAQ_ITEMS: {q;a}[]`, `NEWS_TITLE`/`NEWS_SUB`.
- `posts.ts`: `POSTS: {slug;title;category;excerpt;readingTime;cover:string}[]` (4 entries above) + helper `getPost(slug)`.

- [ ] **Step 1:** Write the three files with the verbatim copy from the Content reference section. Use image clean-names from `lib/images.ts` for `cover`.
- [ ] **Step 2:** Add `content/site.test.ts` (vitest) asserting `CONTACT.email === 'hotro@finhome.group'` and `POSTS.length === 4` with unique slugs.
- [ ] **Step 3:** Run `pnpm test`. Expected: PASS.
- [ ] **Step 4:** `pnpm build` passes. Commit.

---

### Task 3: shadcn primitives + Reveal wrapper

**Files:** Create `components/ui/{button,accordion,carousel}.tsx` (via `pnpm dlx shadcn@latest add button accordion carousel`), `components/reveal.tsx`.

**Produces:** `<Reveal>` client component (Framer Motion) that fades + slides children up when entering viewport; shadcn `Accordion*`, `Carousel*`, `Button`.

- [ ] **Step 1:** Init shadcn (`pnpm dlx shadcn@latest init`) and add button, accordion, carousel; install `framer-motion embla-carousel-react`.
- [ ] **Step 2:** Write `components/reveal.tsx`: `'use client'`, wraps children in `motion.div` with `initial={{opacity:0,y:24}}`, `whileInView={{opacity:1,y:0}}`, `viewport={{once:true,margin:'-80px'}}`, `transition={{duration:0.5}}`.
- [ ] **Step 3:** `pnpm build` passes. Commit.

---

### Tasks 4–9: Landing sections (parallelizable)

Each section task: build the component to visually match the corresponding block in `finhome-framer-mirror/index.html` (compare against http://localhost:8899). Use copy/data from `content/home.ts`, images from `lib/images.ts`, `next/image`, Tailwind, and wrap major blocks in `<Reveal>`. Responsive: match Framer breakpoints (mobile < 810px, tablet 810–1199, desktop ≥ 1200 roughly). Each ends with `pnpm build` + `pnpm lint` pass + visual check, then commit.

- [ ] **Task 4 — `components/site-header.tsx` + `components/site-footer.tsx`**
  - Header: logo (`y9hwKK3MJX6DL9OckY7P3La9kZg.svg`), nav anchors (`#tinhnang #nentang #hotro #tintuc`), "Thử ngay" button; sticky/translucent like mirror; mobile hamburger (Radix/disclosure) with slide-in menu.
  - Footer: brand logo (`9s4vQoO4B1yGmAja7Y9j3ldBNDU.svg`), contact column, "Tính năng" column, "FinHome" column, copyright. Use `content/site.ts`. Email `hotro@finhome.group`.
  - Verify text present, links resolve, build+lint pass. Commit.

- [ ] **Task 5 — `components/sections/hero.tsx`** (`id="hero"`/`trangchu`)
  - Headline `FinHome giúp bạn chọn đúng nhà, vay đúng sức` (match Maison display style), CTA "Thử ngay", hero imagery (`hInhX9Ug…`, `2rgZQTm…`, `o8jJXgRi…`, `x8UhU3Z…` as in mirror hero block). Match layout/spacing to mirror. Commit.

- [ ] **Task 6 — `components/sections/steps.tsx`** (`id` per mirror)
  - Section title + `Khởi động bằng dữ liệu` lead + CTA; 3 step cards using icons `9DWQzTI…svg`, `5Q3gFip…svg`, `wucS1gL…svg`. Data from `STEPS`. Commit.

- [ ] **Task 7 — `components/sections/platform.tsx`** (`id="nentang"`)
  - Title + 6 feature cards (`PLATFORM_FEATURES`) with images `tpQ6tM…`, `J4egHx…`, `FdTECw…`, `4RetLJ…`, `qxo9Xh…`, `1fbxcH…` matched to features per mirror order. Commit.

- [ ] **Task 8 — `components/sections/testimonials.tsx`**
  - Title + sub + Embla carousel of 3 cards (`TESTIMONIALS`), avatars `sS56Q5…jpg`/`dTeZrx…jpg`/`4F8Fzh…jpg`, prev/next arrows (`6tTbkX…svg` left, `11KSGb…svg` right). Commit.

- [ ] **Task 9 — `components/sections/faq.tsx` + `components/sections/news.tsx`**
  - FAQ: Radix Accordion over `FAQ_ITEMS` (id `hotro`). News: title+sub, featured card + grid of remaining posts from `POSTS`, `Xem thêm` → `/blog` (id `tintuc`). Commit.

---

### Task 10: Home page assembly

**Files:** Modify `app/page.tsx`.

- [ ] **Step 1:** Import and stack `SiteHeader, Hero, Steps, Platform, Testimonials, Faq, News, SiteFooter` in mirror order.
- [ ] **Step 2:** `pnpm build` passes; open `pnpm dev` and compare each section side-by-side with http://localhost:8899. Note visual diffs.
- [ ] **Step 3:** Fix spacing/typography diffs flagged. Commit.

---

### Task 11: Blog — MDX content + listing + detail

**Files:** Create `content/posts/*.mdx` (4), `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`; configure MDX in `next.config.mjs` (`@next/mdx` or `next-mdx-remote`).

**Interfaces:** Consumes `POSTS`/`getPost` from `content/posts.ts`.

- [ ] **Step 1:** Configure MDX. Install deps.
- [ ] **Step 2:** For each of the 4 posts, extract the real article body (headings + paragraphs, verbatim) from its source HTML (see Content reference mapping) into `content/posts/<slug>.mdx`. Include frontmatter matching `POSTS`.
- [ ] **Step 3:** `app/blog/page.tsx`: render `SiteHeader`, page title `Tin tức bất động sản` + sub, grid of all `POSTS` as cards linking to `/blog/[slug]`, `SiteFooter`. SSG.
- [ ] **Step 4:** `app/blog/[slug]/page.tsx`: `generateStaticParams` from `POSTS`; render header, article (category badge, title, reading time, cover image, MDX body styled with `@tailwindcss/typography` `prose`), a "Bài viết liên quan" block (other 3 posts), footer.
- [ ] **Step 5:** `pnpm build` passes (4 static blog pages generated); visually compare `/blog` and one detail page with mirror `blog.html`. Commit.

---

### Task 12: Final verification & polish

- [ ] **Step 1:** Run `pnpm build && pnpm lint`. Both pass with zero errors.
- [ ] **Step 2:** Grep the built output / dev DOM: confirm NO references to `framerusercontent.com` or `events.framer.com`, and email is `hotro@finhome.group` (not `support@`).
- [ ] **Step 3:** Side-by-side visual pass of `/` and `/blog` vs mirror at 375px, 810px, 1280px widths; fix major diffs.
- [ ] **Step 4:** Add `finhome-next/README.md` (dev/build commands). Commit.

---

## Self-review notes

- Spec coverage: stack (T1,T3), tokens/fonts (T1), routes (T10,T11), 8 home sections (T4–T9), asset handling (T1), interactions/animation (T3,T8,T9), email/CTA decisions (Global Constraints), no-Framer-CDN (T12). ✓
- Blog "4 slug y nguyên": spec said keep 4 slugs; investigation found the 4 files are 4 *distinct* real articles (filenames are misleading) — plan maps each file to its true title/slug, which honors "toàn bộ y nguyên" better than reproducing accidental duplicates. Flag for user awareness.
- Visual tasks use build/lint + side-by-side visual diff as the verification cycle (vs unit tests), appropriate for a faithful visual port; content data has a unit test (T2).
