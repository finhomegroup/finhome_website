# FinHome - Real Estate Platform

Ứng dụng web về bất động sản với giao diện hiện đại và tương tác, cung cấp thông tin về các dự án bất động sản, đánh giá và phân tích chuyên sâu.

## Tính năng

- **Hero Section với Dot Halftone Art**: Hiệu ứng hình ảnh dot halftone tương tác với animation mượt mà
- **Interactive Slider**: Hiển thị các ưu đãi lãi suất từ các ngân hàng
- **Real Estate Projects**: Danh sách và chi tiết các dự án bất động sản
- **Project Evaluation**: Đánh giá và phân tích chuyên sâu các dự án bất động sản
- **Case Studies**: Nghiên cứu tình huống về các dự án bất động sản

## Yêu cầu hệ thống

- Node.js (phiên bản 18 trở lên)
- npm hoặc yarn

## Cài đặt

1. **Clone repository**

```bash
git clone <YOUR_GIT_URL>
cd finhome
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Chạy development server**

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Preview build production
- `npm run lint` - Chạy linter để kiểm tra code

## Công nghệ sử dụng

- **Vite** - Build tool và development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **WebGL** - Rendering cho dot halftone effects


## Phát triển

### Thêm component mới

Tạo file component mới trong thư mục `src/components/` và import vào các file cần sử dụng.

### Styling

Dự án sử dụng Tailwind CSS cho styling. Tham khảo [Tailwind CSS Documentation](https://tailwindcss.com/docs) để biết thêm chi tiết.

### TypeScript

Tất cả code nên được viết bằng TypeScript. Đảm bảo định nghĩa types cho props và state của components.

## Build cho Production

```bash
npm run build
```

Files đã build sẽ được tạo trong thư mục `dist/`.

## Deploy

Sau khi build, bạn có thể deploy thư mục `dist/` lên bất kỳ static hosting service nào như:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

