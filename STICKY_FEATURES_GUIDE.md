# Sticky Features Component Guide

## 📋 Tổng quan

Component `StickyFeatures.tsx` là một sticky scroll section với hình ảnh cố định bên phải và nội dung cuộn bên trái. Khi người dùng scroll, hình ảnh bên phải sẽ thay đổi tương ứng với nội dung đang active.

## ✨ Tính năng

### 🎯 Core Features
- ✅ **Sticky Image**: Hình ảnh cố định ở bên phải khi scroll
- ✅ **Auto-detect Active**: Tự động phát hiện section nào đang ở giữa viewport
- ✅ **Smooth Transitions**: Fade in/out mượt mà giữa các hình ảnh
- ✅ **Responsive**: Mobile-friendly với hình ảnh hiển thị dưới nội dung
- ✅ **Accessibility**: Semantic HTML, proper ARIA labels

### 🎨 UI Elements
- **Label**: Tag nhỏ màu xanh lá (#3CB550)
- **Title**: Heading lớn, bold
- **Description**: Paragraph text với line-height thoải mái
- **Link**: Animated link với arrow icon và underline effect
- **Images**: Full-width, object-contain, rounded corners

## 📦 Component Structure

```typescript
interface FeatureItem {
  label: string;        // Label/tag ở trên
  title: string;        // Tiêu đề chính
  description: string;  // Mô tả chi tiết
  linkText: string;     // Text của link button
  linkHref: string;     // URL của link
  imageSrc: string;     // Đường dẫn hình ảnh
  imageAlt: string;     // Alt text cho SEO
}
```

## 🎨 Styling

### Tailwind Classes Used
- **Layout**: `lg:grid lg:grid-cols-2`, `sticky`
- **Typography**: `text-3xl md:text-4xl font-bold`
- **Colors**: `text-[#3CB550]`, `text-gray-900`
- **Transitions**: `transition-opacity duration-500`
- **Responsive**: `hidden lg:block`, `lg:hidden`

### Custom Styles
```css
/* Sticky position */
position: sticky;
height: 500px;
top: calc(50vh - 250px); /* Center vertically */

/* Underline animation */
.group-hover:w-full
```

## 🔧 How It Works

### Scroll Detection Logic
```typescript
1. Listen to scroll event
2. Get viewport center position
3. Calculate distance from each section to viewport center
4. Set the closest section as active
5. Fade in corresponding image
```

### State Management
- `activeIndex`: Current active section (0, 1, or 2)
- `containerRef`: Reference to main container
- `itemRefs`: Array of references to each content section

## 📱 Responsive Behavior

| Breakpoint | Layout | Behavior |
|------------|--------|----------|
| Mobile (< 1024px) | Stacked | Content → Images below |
| Desktop (≥ 1024px) | 2-column | Content left, sticky image right |

## 🎯 Usage Example

### 1. Import Component
```tsx
import StickyFeatures from '@/components/StickyFeatures';
```

### 2. Add to Page
```tsx
function Page() {
  return (
    <div>
      <HeroSection />
      <StickyFeatures />
      <Footer />
    </div>
  );
}
```

### 3. Customize Content
Chỉnh sửa mảng `features` trong component:

```typescript
const features: FeatureItem[] = [
  {
    label: 'YOUR LABEL',
    title: 'Your Title',
    description: 'Your description here...',
    linkText: 'Learn more',
    linkHref: '/your-page',
    imageSrc: '/images/your-image.webp',
    imageAlt: 'Your alt text',
  },
  // Add more features...
];
```

## 🖼️ Images Setup

### Required Images
```
public/
  └── images/
      └── features/
          ├── multichannel.webp
          ├── all-in-one.webp
          └── optimize.webp
```

### Image Requirements
- **Format**: WebP (recommended) hoặc PNG/JPG
- **Size**: 800x600px hoặc tỷ lệ tương tự
- **Quality**: Tối ưu cho web (< 200KB)
- **Aspect Ratio**: Flexible (object-contain)

## 🎨 Customization Options

### 1. Change Colors
```typescript
// Primary color (label, link)
text-[#3CB550] → text-[#YOUR_COLOR]

// Hover color
hover:text-[#2d9a42] → hover:text-[#YOUR_HOVER_COLOR]
```

### 2. Adjust Sticky Height
```typescript
style={{
  height: '500px',  // Change this
  top: 'calc(50vh - 250px)', // And this (height/2)
}}
```

### 3. Change Transition Speed
```typescript
transition-opacity duration-500 → duration-300/700/1000
```

### 4. Modify Layout
```typescript
// Desktop columns ratio
lg:grid-cols-2 → lg:grid-cols-[1fr_1.5fr] // More space for images

// Gap between columns
lg:gap-12 → lg:gap-16/20/24
```

## 🚀 Performance Tips

1. **Lazy Loading**: Images use `loading="lazy"`
2. **Passive Scroll**: `{ passive: true }` for better performance
3. **Refs Array**: Minimal re-renders with useRef
4. **Cleanup**: Remove scroll listener on unmount

## ♿ Accessibility

- ✅ Semantic HTML (`<section>`, `<h3>`, `<p>`)
- ✅ Alt text for all images
- ✅ ARIA hidden for decorative icons
- ✅ Keyboard accessible links
- ✅ Focus states

## 📊 Browser Support

- ✅ Chrome, Edge, Safari, Firefox (latest)
- ✅ Mobile browsers
- ✅ CSS sticky support required

## 🐛 Troubleshooting

### Images không hiển thị
- Kiểm tra đường dẫn trong `imageSrc`
- Verify images tồn tại trong `public/images/features/`

### Sticky không hoạt động
- Check parent container không có `overflow: hidden`
- Verify height và top calculations

### Active detection sai
- Adjust `viewportCenter` calculation
- Check `itemRefs` được gán đúng

## 🎉 Kết quả

Component này tạo ra:
- ✅ **Professional UI**: Sticky scroll giống các website hiện đại
- ✅ **Smooth UX**: Transitions mượt mà, tự nhiên
- ✅ **Mobile-friendly**: Responsive hoàn toàn
- ✅ **Performant**: Optimized scroll handling
- ✅ **Customizable**: Dễ dàng thay đổi nội dung và style

---

**Tạo bởi**: AI Assistant  
**Ngày**: 23/12/2025  
**Status**: ✅ Hoàn thành

