# FinHome — Chuyển landing page từ Framer mirror sang Next.js

Ngày: 2026-06-25
Trạng thái: Đã duyệt thiết kế, chuẩn bị lập plan

## Bối cảnh

`finhome-framer-mirror/` là bản mirror tĩnh (wget) của https://finhomegroup.framer.website —
output SSR của Framer (HTML một dòng, 923 inline style, `data-framer-*`, runtime JS riêng).
Mục tiêu: chuyển thành một app **Next.js sạch** cho landing page FinHome.

Quyết định đã chốt khi brainstorm:
- **Dựng lại sạch** (clean rebuild), lấy bản Framer làm chuẩn thiết kế — KHÔNG cấy ghép markup Framer.
- Mục tiêu pixel: giống tới mức mắt thường khó phân biệt (~95%+), không cam kết trùng từng pixel.
- Phạm vi: trang chủ + blog (listing + 4 trang chi tiết, giữ "y nguyên" 4 slug).
- Blog: nội dung dạng **MDX/Markdown tĩnh**.
- Bỏ hoàn toàn runtime JS của Framer; animation dựng lại bằng Framer Motion / CSS.

## Stack & kiến trúc

- **Next.js (App Router, bản mới nhất) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion.**
- Render tĩnh (SSG) toàn bộ — phù hợp landing page, tốt cho SEO & tốc độ.
- Vị trí app mới: `finhome-website/finhome-next/` (sibling với `finhome-framer-mirror`, không đụng app Vite ở thư mục gốc).
- Asset 100% local — bỏ mọi tham chiếu `framerusercontent.com` và analytics `events.framer.com`.

## Design tokens (rút từ bản Framer)

Màu:
- primary blue `#0099ff`
- green `#17ab48`, lime `#a2db46`, green nhạt phụ `#90d77b`
- nền xanh nhạt `#f7fcf7`, nền trắng `#ffffff`
- text: `#000000`, `#575757`, `#bcbcbc`, `#848484`

Font (dùng `next/font/local` cho woff2 trong `assets/`, `next/font/google` cho Geist):
- `Inter` — body (woff2 local có sẵn)
- `Maison Neue Extended` (Medium/Book) — heading/display (woff2 local)
- `Geist` — phụ

## Cấu trúc route

| Route | Nội dung |
|---|---|
| `/` | Trang chủ (landing) — 8 section |
| `/blog` | Danh sách bài viết |
| `/blog/[slug]` | Chi tiết bài viết (4 slug, nội dung từ MDX) |

Blog slugs (giữ y nguyên theo bản gốc):
- `dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026`
- `dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026-copy`
- `dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026-copy-copy`
- `streamlining-saas-operations-without-adding-overhead`

(2 bài thật + 3 bản trùng dùng chung nội dung; map slug → file MDX.)

## Trang chủ — section (mỗi cái là 1 component độc lập)

1. **SiteHeader** — logo + nav (Tính năng / Nền tảng / Hỗ trợ / Tin tức) + nút "Thử ngay"; menu mobile (Radix).
2. **Hero** — headline "FinHome giúp bạn chọn đúng nhà, vay đúng sức" + ảnh hero + CTA "Thử ngay".
3. **Steps** — "Các bước đơn giản để hiểu khả năng mua nhà của bạn" / "Khởi động bằng dữ liệu" + 3 bước:
   - Xác định vùng mua nhà an toàn
   - Đánh giá phương án vay vốn
   - Mở khóa La bàn tài chính
4. **Platform** — "Một nền tảng đồng hành cùng bạn cả hành trình mua nhà" + 6 tính năng:
   Cá nhân hóa trải nghiệm · Luôn cập nhật xu hướng · Tính toán thông minh từ dữ liệu ·
   Giao diện thân thiện · Nền tảng đa tính năng · Diễn giải kết quả rõ ràng.
5. **Testimonials** — "Trải nghiệm từ người dùng" + 3 cảm nhận (Anh Phạm — nhân viên văn phòng;
   Thùy Như — người mua nhà lần đầu; Thái Vin — nhà đầu tư BĐS) dạng carousel (Embla/shadcn).
6. **FAQ** — accordion 5 câu hỏi (Radix Accordion).
7. **NewsSection** — "Tin tức bất động sản" + 1 thẻ nổi bật + 3 thẻ phụ + "Xem thêm" → `/blog`.
8. **SiteFooter** — Liên hệ (51 Nguyễn Thị Minh Khai, Quận 1, TP HCM; email; hotline 0963 177 497);
   cột "Tính năng" (La bàn tài chính / Đánh giá khả năng tài chính / Đánh giá khả năng vay vốn);
   cột "FinHome" (Về chúng tôi / Chính sách bảo mật / Điều khoản sử dụng); © 2026 FinHome.

Nội dung text + map ảnh tách ra `content/*.ts` để dễ sửa.

## Xử lý asset

- Ảnh: chọn 1 biến thể độ phân giải hợp lý cho mỗi ảnh, **đổi tên sạch** (bỏ đuôi `@width=…&height=…`),
  copy vào `finhome-next/public/images/`, dùng `next/image`.
- SVG (logo, icon): file `.svg` sạch hoặc component.
- Font woff2: copy vào `finhome-next/public/fonts/` (hoặc `app/fonts/`), khai báo qua `next/font/local`.

## Tương tác & animation

- Menu mobile, FAQ accordion, testimonial carousel: shadcn/Radix.
- Reveal-on-scroll bằng Framer Motion để gần cảm giác bản gốc (fade/slide-up khi vào viewport).

## Quyết định nội dung

- **Email liên hệ**: dùng `hotro@finhome.group` (theo commit mới nhất của repo, thay cho `support@finhome.group` trong mirror).
- **Nút "Thử ngay"**: trỏ tạm `#` (chờ URL app thật từ phía FinHome).

## Triển khai (orchestration)

Sau khi có plan: chạy một **Workflow điều phối subagent song song** — mỗi agent dựng 1 section/route độc lập
(scaffold chung trước), sau đó bước verify ráp lại + đối chiếu với bản gốc (build pass, lint pass, so layout).

## Ngoài phạm vi (YAGNI)

- Không CMS/backend cho blog (chỉ MDX tĩnh).
- Không port runtime/animation đóng của Framer 1:1.
- Không form thu lead / tracking (chưa có yêu cầu).
- Không đụng app Vite ở thư mục gốc.
