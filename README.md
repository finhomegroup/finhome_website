# FinHome — Next.js

Landing page FinHome dựng lại sạch từ bản Framer mirror (`../finhome-framer-mirror`).
Next.js 16 (App Router, SSG) + React 19 + Tailwind v4 + Framer Motion.

## Lệnh
```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # build tĩnh
pnpm start    # chạy bản build
pnpm lint
```

## Cấu trúc
- `app/` — routes: `/` (landing), `/blog`, `/blog/[slug]`
- `components/` — header/footer + `sections/*` (mỗi section 1 file) + `ui/*`
- `content/` — copy & dữ liệu (`site.ts`, `home.ts`, `posts.ts`) + `posts/*.md` (thân bài)
- `lib/images.ts` — map ảnh (auto-gen)
- `scripts/import-assets.mjs` — copy ảnh/font từ mirror, sinh `lib/images.ts` + `app/fonts.css`

## Asset
Chạy lại khi mirror đổi: `node scripts/import-assets.mjs`
