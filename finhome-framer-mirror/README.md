# FinHome — bản mirror tĩnh từ Framer

Bản sao tĩnh (HTML/CSS/JS/ảnh/font) của trang https://finhomegroup.framer.website,
tải về bằng `wget --mirror` ngày 2026-06-25.

## Nội dung
- `index.html` — trang chủ
- `blog.html` — trang danh sách bài viết
- `blog/` — các bài viết chi tiết
- `sites/`, `assets/`, `images/` — JS module, CSS, ảnh, font

## Xem thử cục bộ
PHẢI chạy bằng `serve.py` (KHÔNG dùng `python3 -m http.server`):

```bash
cd finhome-framer-mirror
python3 serve.py
# mở http://localhost:8899/index.html
```

Vì sao không dùng `http.server`: sau khi hydrate, JS của Framer request ảnh
kèm query string (vd `images/abc.png?scale-down-to=512&width=2000`), trong khi
wget lưu file dưới dạng `images/abc.png@width=2000&height=...`. `http.server`
cắt query rồi tìm `images/abc.png` -> 404 -> ảnh vỡ. `serve.py` tự bỏ query và
khớp mọi biến thể về đúng file đã tải.

## Lưu ý
- Trang render sẵn ở HTML nên nội dung hiển thị ngay cả khi chưa hydrate JS.
- `srcset` do wget tạo bị lỗi nên đã được gỡ bỏ khỏi các file HTML; trình duyệt
  dùng `src` (trỏ đúng file local).
- Vài tham chiếu vẫn trỏ ra CDN Framer (`framerusercontent.com`) và script
  analytics (`events.framer.com`) -> cần internet để load đầy đủ 100%.
- Đây là bản mirror tĩnh, độc lập với app React/Vite trong thư mục gốc dự án.
