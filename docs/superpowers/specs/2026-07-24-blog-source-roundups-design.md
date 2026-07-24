# Blog Source Roundups — Design Spec

**Date:** 2026-07-24  
**Status:** Draft for review  
**Goal:** Publish 10 FinHome-style blog posts that summarize reputable 2024–2026 housing/finance articles without copyright risk, each linking out to the original source, with SEO-optimized HTML and a reusable Cursor SEO skill.

---

## Problem

FinHome blog currently has 4 original posts. The team wants ~10 more pieces grounded in reputable press (VnExpress, CafeF, Tuổi Trẻ, Luật Việt Nam, …) about home affordability and related FinHome topics — without republishing full articles.

## Content approach (chosen)

**Original FinHome summary + outbound source link** (copyright-safe):

- Write **new** Vietnamese copy in FinHome voice (context, 3–5 takeaways, FinHome angle, CTA).
- Do **not** paste long quotes or scrape full article HTML/images from the source.
- Always show clear attribution: source name, publish window, and a primary CTA **“Đọc bài gốc”** → external URL (`target="_blank"` `rel="noopener noreferrer"`).
- Optional: 1 short attributed quote (≤25 words) only when essential; prefer paraphrase.

This keeps list/detail UI looking like today’s blog cards + article layout, while remaining a commentary/roundup, not a mirror.

## Source list (locked for v1)

| # | FinHome angle | Source | URL |
|---|---|---|---|
| 1 | Affordability | VnExpress | https://vnexpress.net/nguoi-viet-thuoc-nhom-kho-mua-nha-nhat-the-gioi-5072991.html |
| 2 | Years-of-income to buy | CafeF | https://cafef.vn/nguoi-viet-can-hon-30-nam-thu-nhap-de-mua-duoc-nha-188260202110901204.chn |
| 3 | Young buyers / price pressure | CafeF | https://cafef.vn/gioi-tre-va-su-chuyen-dich-trong-quyet-dinh-mua-nha-thoi-bao-gia-188260531074034384.chn |
| 4 | Middle-income housing policy | VnExpress | https://vnexpress.net/thu-tuong-can-co-chinh-sach-nha-o-cho-nguoi-thu-nhap-trung-binh-5044253.html |
| 5 | Safe price band | VnExpress | https://vnexpress.net/gia-nha-bao-nhieu-phu-hop-voi-nguoi-thu-nhap-trung-binh-5046151.html |
| 6 | Eligibility / income threshold | VnExpress | https://vnexpress.net/thu-nhap-tren-20-trieu-dong-mot-thang-co-the-duoc-uu-tien-mua-nha-gia-phu-hop-5044245.html |
| 7 | Social housing loans | Luật Việt Nam | https://luatvietnam.vn/dat-dai-nha-o/dieu-kien-va-chinh-sach-uu-dai-vay-von-mua-nha-o-xa-hoi-567-101470-article.html |
| 8 | Property e-ID transparency | VnExpress | https://vnexpress.net/moi-bat-dong-san-se-co-ma-dinh-danh-dien-tu-rieng-tu-1-3-5001623.html |
| 9 | Mortgage rate pressure | DNSE | https://www.dnse.com.vn/senses/tin-tuc/lai-suat-cho-vay-mua-nha-tiep-tuc-tang-chua-co-hy-vong-giam-35237636 |
| 10 | Youth credit policy | VnExpress | https://vnexpress.net/thu-tuong-de-nghi-co-goi-tin-dung-uu-dai-nha-o-cho-nguoi-khong-qua-35-tuoi-4848272.html |

Keep the existing 4 posts; **add** these 10 (total 14). Do not delete existing content in this pass.

## Data model

Extend `Post` in `content/posts.ts`:

```ts
source?: {
  name: string;   // e.g. "VnExpress"
  url: string;    // canonical article URL
  accessed?: string; // ISO date FinHome published the roundup
};
```

Bodies remain `content/posts/<slug>.md` (same as today).

## UI / UX

- **List** (`/blog`, homepage news): unchanged card pattern (cover, category, title, excerpt, reading time). No source badge required on cards (keep clean); optional small “Theo nguồn báo” later if needed.
- **Detail** (`/blog/[slug]`):
  1. Existing hero (category, H1, reading time, cover).
  2. New **SourceAttribution** block (only if `post.source`): source name + outbound button/link.
  3. Markdown body (FinHome summary).
  4. Related posts (existing).

Cover images: reuse existing Framer asset filenames already in `POSTS` rotation / `img()` — do **not** hotlink source outlet images.

## Markdown body template (per post)

```markdown
[1–2 đoạn mở: bối cảnh + vì sao quan trọng với người mua nhà]

## Điểm chính cần nắm
- …
- …

## Góc nhìn FinHome
[Liên hệ vùng mua nhà an toàn / khả năng vay / la bàn tài chính — không bán hàng thô]

## Đọc thêm
Nội dung chi tiết nằm ở bài gốc của [Nguồn]. FinHome chỉ tổng hợp góc nhìn để hỗ trợ độc giả định hướng tài chính khi mua nhà.

[Đọc bài gốc trên Nguồn](https://…)
```

Reading time target: **3–5 phút** (shorter than full reprints).

## SEO / HTML

Reuse existing pipeline (`generateMetadata`, `articleSchema`, sitemap). Enhancements for roundups:

1. Titles/excerpts original to FinHome (not copy source headlines verbatim when avoidable; may paraphrase).
2. `articleSchema`: add `isBasedOn` / `citation` when `source` present.
3. External links in Markdown: ensure `rel="noopener noreferrer"` via Markdown component override for `a` tags with `http(s)`.
4. Canonical stays on FinHome `/blog/<slug>/`.
5. Project Cursor skill `.cursor/skills/seo-blog/SKILL.md` documenting checklist for future posts (title length, H1, OG, Article JSON-LD, source link, no full scrape).

## Out of scope

- Scraping or mirroring full source HTML.
- Paywall bypass / downloading source images.
- Replacing or rewriting the existing 4 posts.
- CMS / admin UI.

## Success criteria

- 10 new posts live in `POSTS` + `.md` files; build passes.
- Each detail page shows attribution + working outbound link.
- No full-article republication; summaries are original.
- SEO skill committed; Article schema includes citation when sourced.
- Team can open `/blog` and see cards + open posts linking to sources.
