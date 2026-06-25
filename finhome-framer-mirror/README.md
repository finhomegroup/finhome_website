# FinHome — bản mirror tĩnh từ Framer

Bản sao tĩnh (HTML/CSS/JS/ảnh/font) của trang https://finhomegroup.framer.website,
tải về bằng `wget --mirror` ngày 2026-06-25.

## Nội dung
- `index.html` — trang chủ
- `blog.html` — trang danh sách bài viết
- `blog/` — các bài viết chi tiết
- `sites/`, `assets/`, `images/` — JS module, CSS, ảnh, font

## Xem thử cục bộ
Cần chạy qua HTTP server (mở trực tiếp file:// sẽ chặn module JS):

```bash
cd finhome-framer-mirror
python3 -m http.server 8899
# mở http://localhost:8899/index.html
```

## Lưu ý
- Trang render sẵn ở HTML nên nội dung hiển thị ngay cả khi chưa hydrate JS.
- Một số biến thể ảnh `srcset` (nhiều kích thước) và script analytics
  (`events.framer.com`) vẫn trỏ ra Framer; khi online trình duyệt tự tải,
  khi offline vẫn còn ảnh kích thước chính đã lưu local.
- Đây là bản mirror tĩnh, độc lập với app React/Vite trong thư mục gốc dự án.
