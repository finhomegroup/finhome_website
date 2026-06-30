# Responsive cho Tablet & Mobile — Design Spec

- **Ngày:** 2026-06-30
- **Trạng thái:** Approved (Hướng A)
- **Phạm vi:** Toàn bộ trang (homepage, blog list, blog post, privacy, terms)
- **Nhánh:** `feat/responsive-tablet-mobile`

## 1. Bối cảnh & hiện trạng

Site là bản mirror từ Framer, dựng bằng Next 16 (static export) + Tailwind v4. Hiện
trạng responsive dùng **ngưỡng nhị phân `md:` (768px)**: dưới 768 là mobile, từ 768
trở lên bật **toàn bộ layout desktop**. Hệ quả: dải **tablet (768–1023px)** nhận
layout desktop ngay lập tức, trong đó vài thành phần được canh theo kích thước
1120–1440px nên bị vỡ.

Trong working tree đã có sẵn **một đợt responsive trước đó (chưa commit)**: mobile
stacking cho Steps/Testimonials, fluid `clamp()` cho `.fh-lead`/`.fh-eyebrow`,
`overflow-x: clip`, cải thiện tap-target cho accordion. Đợt này **xây tiếp** trên đó,
không revert. Điểm còn thiếu của đợt trước: các bản stacked mới chỉ áp ở `md:hidden`
nên tablet vẫn rơi vào nhánh overlay/desktop và vẫn vỡ.

## 2. Mục tiêu / Không làm

**Mục tiêu**
- Tablet (640–1023px) có layout gọn gàng riêng, không tràn ngang, không đè text.
- Mobile (<640px) siết lại sạch, tap-target hợp lý.
- Không còn horizontal scroll ở mọi bề rộng từ 320px trở lên.

**Không làm (Non-goals)**
- **Không đổi giao diện desktop (≥1024px)** — mọi thứ ≥`lg` giữ y nguyên hiện tại.
- Không đổi nội dung/bản copy, không đổi ảnh asset.
- Không làm dark mode, không đổi palette/typography scale của desktop.

## 3. Chiến lược responsive (3 tầng)

Nguyên tắc: **dời mọi layout nặng đang bật ở `md` xuống `lg`**, chèn tầng tablet vào
giữa. Dùng breakpoint mặc định Tailwind v4: `sm`=640, `md`=768, `lg`=1024, `xl`=1280.

| Tầng | Bề rộng | Hành vi |
|------|---------|---------|
| **Mobile** | `base` (<640) | 1 cột, ảnh/card full-width, tap-target ≥40px |
| **Tablet** | `sm`/`md` (640–1023) | hamburger nav; hero stacked; Steps/Platform dùng bố cục sạch (không overlay tuyệt đối); grid 2 cột chỗ hợp lý |
| **Desktop** | `lg` (≥1024) | **giữ nguyên 100%**: overlay, bento 3 cột, hero 2 cột, nav đầy đủ, marquee |

## 4. Thay đổi theo từng file

### 4.1 `components/site-header.tsx`
- Nav + CTA desktop: `hidden md:flex` → `hidden lg:flex`.
- Nút hamburger: `md:hidden` → `lg:hidden`.
- Dropdown menu mobile: `md:hidden` → `lg:hidden`.
- Giữ logo `w-[104px] md:w-[116px]` (ổn). Tap-target hamburger 40px (giữ).
- Kết quả: iPad dọc (≤1023) dùng hamburger gọn thay vì nhồi 4 menu + CTA vào pill.

### 4.2 `components/sections/hero.tsx`
- Bố cục 2 cột: mọi prefix `md:` ở `<div>` wrapper, cột trái, cột phải đổi sang `lg:`
  (`lg:flex-row`, `lg:items-center`, `lg:justify-between`, `lg:gap-10`,
  `lg:w-auto`, `lg:pb-24`, `lg:shrink-0`, `lg:justify-end`, `lg:max-w-[451px]`).
- `pt-[119px] md:pt-[162px]` → `pt-[119px] lg:pt-[162px]`.
- Ảnh phone tablet: cho phép lớn hơn chút — `max-w-[min(100%,320px)] sm:max-w-[380px] lg:max-w-[451px]`.
- Kết quả: tablet hero xếp dọc, căn giữa (như mobile nhưng rộng rãi hơn); desktop ≥1024 không đổi.

### 4.3 `components/sections/steps.tsx`
- Nhánh stacked (mobile): `md:hidden` → `lg:hidden` (tablet dùng bản stacked sạch).
- Nhánh overlay (desktop): `hidden md:block` → `hidden lg:block`.
- Grid 3 step-card: giữ `grid-cols-1 md:grid-cols-3` (3 card nhỏ gọn, ~227px ở 768 vẫn ổn);
  giữ `mt-14 md:mt-[33px]`.
- Kết quả: overlay canh-theo-1120px chỉ chạy ở ≥1024; tablet dùng ảnh + text + CTA xếp dọc.

### 4.4 `components/sections/platform.tsx`
- Container bento: `grid-cols-1 md:grid-cols-3` → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Padding overlay trong `FeatureCard`: `px-5 pt-4 md:px-11` → `px-5 pt-4 lg:px-11`.
- **Không nhân đôi markup.** Cơ chế: cùng cấu trúc 3 "column-div" `[[0,1],[2,3],[4,5]]`:
  - `base`: `grid-cols-1` → 3 column-div xếp dọc, card full-width (như hiện tại).
  - `sm`/`md` (tablet): `grid-cols-2` → card ~294–358px, padding `px-5` → text không tràn.
  - `lg` (desktop): `grid-cols-3` + `px-11` → **y nguyên bento hiện tại**.
- Lưu ý chấp nhận được: ở tablet 2 cột, cặp thứ 3 (feature 4,5) nằm 1 mình ở hàng 2,
  lệch trái — đúng kỳ vọng, không vỡ.

### 4.5 `app/globals.css`
- Giữ nguyên các clamp đã có (`fh-h1`, `fh-h2`, `fh-lead`, `fh-eyebrow`).
- `.container-fh`: thêm guard màn rất nhỏ — `@media (max-width: 380px){ padding-inline: 16px }`
  (tránh chật ở điện thoại nhỏ). Không đổi padding ở ≥381px để desktop bất biến.

### 4.6 `components/markdown.tsx`
- Thêm guard tràn ngang cho nội dung blog: `prose-pre:overflow-x-auto` và bọc bảng
  `[&_table]:block [&_table]:w-full [&_table]:overflow-x-auto`.

### 4.7 Không đổi (đã verify responsive OK)
`testimonials.tsx` (marquee hợp lệ ở mọi bề rộng, mobile đã stack), `faq.tsx` +
`accordion.tsx`, `signup.tsx`, `news.tsx`, `site-footer.tsx`, `app/blog/page.tsx`,
`app/blog/[slug]/page.tsx`, `legal-document.tsx`, hai trang legal. Chỉ chỉnh nếu khâu
verify phát hiện lỗi thực tế.

## 5. Edge cases & rủi ro
- **Boundary 1024px:** mọi chuyển md→lg phải đảm bảo ≥1024 trùng khít hành vi cũ. Kiểm ở đúng 1023 và 1024.
- **Platform 2 cột:** xác nhận text overlay không tràn ở 640px (card hẹp nhất ~294px).
- **Header:** xác nhận ở 1024px nav desktop hiện đủ chỗ trong pill (đã chạy tốt ở range này từ trước).
- **Không tạo horizontal scroll:** `overflow-x: clip` đã có ở html/body/main; verify lại sau khi đổi.

## 6. Kế hoạch verify
Chạy `next dev`, kiểm từng trang ở các mốc: **375** (mobile), **768** (iPad dọc),
**1023** (sát ranh tablet), **1024** (sát ranh desktop), **1280** (desktop). Với mỗi mốc:
không scroll ngang, không đè/tràn text, nav dùng được, ảnh không méo. Build production
(`next build`) phải pass.

## 7. Out of scope
Redesign, đổi nội dung, tối ưu ảnh/LCP, i18n, dark mode.
