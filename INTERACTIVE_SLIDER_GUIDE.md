# Interactive Slider Component Guide

## 📋 Tổng quan

Component `InteractiveSlider.tsx` là một horizontal scrolling carousel với hover effects và navigation buttons. Hiển thị các loại đầu tư bất động sản với hình ảnh đẹp mắt.

## ✨ Tính năng

### 🎯 Core Features
- ✅ **Horizontal Scroll**: Smooth scrolling với mouse wheel hoặc drag
- ✅ **Navigation Buttons**: Left/Right arrows xuất hiện khi có thể scroll
- ✅ **Auto-hide Buttons**: Buttons tự động ẩn/hiện dựa trên scroll position
- ✅ **Hover Effects**: Scale up và zoom image khi hover
- ✅ **Smooth Transitions**: All animations mượt mà (300-500ms)
- ✅ **Responsive**: Mobile-friendly với touch scrolling
- ✅ **Accessibility**: Screen reader support, ARIA labels

### 🎨 UI Elements
- **Card Size**: 280px (mobile), 320px (desktop)
- **Aspect Ratio**: 4:5 (portrait orientation)
- **Gap**: 16px (mobile), 24px (desktop)
- **Image Overlay**: Gradient from black/80 to transparent
- **Title**: White text, bottom-left position, underline on hover

## 📦 Component Structure

```typescript
interface SliderItem {
  title: string;       // Tiêu đề hiển thị
  href: string;        // Link đến trang chi tiết
  imageSrc: string;    // Đường dẫn hình ảnh
  imageAlt: string;    // Alt text cho SEO
}
```

## 🎨 Styling Highlights

### Tailwind Classes
- **Container**: `flex gap-4 md:gap-6 overflow-x-auto`
- **Card**: `w-[280px] md:w-[320px] aspect-[4/5]`
- **Image**: `object-cover transition-transform duration-500 group-hover:scale-110`
- **Overlay**: `bg-gradient-to-t from-black/80 via-black/40 to-transparent`
- **Button**: `w-10 h-10 rounded-full bg-white shadow-lg`

### Custom Styles
```css
/* Hide scrollbar */
scrollbar-width: none;
-ms-overflow-style: none;
&::-webkit-scrollbar { display: none; }

/* Smooth scroll */
scroll-behavior: smooth;
```

## 🔧 How It Works

### Scroll Detection
```typescript
1. Monitor scroll position with useEffect
2. Calculate if can scroll left/right
3. Update button visibility states
4. Show/hide buttons with opacity transitions
```

### Navigation Logic
```typescript
scroll(direction) {
  - Calculate scroll amount (80% of viewport)
  - Scroll to new position smoothly
  - Update button states
}
```

## 📱 Responsive Behavior

| Breakpoint | Card Width | Gap | Behavior |
|------------|------------|-----|----------|
| Mobile (< 768px) | 280px | 16px | Touch scroll, 1.5 cards visible |
| Desktop (≥ 768px) | 320px | 24px | Mouse scroll, 3-4 cards visible |

## 🎯 Usage Example

### 1. Import Component
```tsx
import InteractiveSlider from '@/components/InteractiveSlider';
```

### 2. Add to Page
```tsx
function Page() {
  return (
    <div>
      <HeroSection />
      <InteractiveSlider />
      <Footer />
    </div>
  );
}
```

### 3. Customize Items
Chỉnh sửa mảng `sliderItems` trong component:

```typescript
const sliderItems: SliderItem[] = [
  {
    title: 'Your Title',
    href: '/your-page',
    imageSrc: '/images/slider/your-image.webp',
    imageAlt: 'Your alt text',
  },
  // Add more items...
];
```

## 🖼️ Images Setup

### Required Images Directory
```
public/
  └── images/
      └── slider/
          ├── apartment-investment.webp
          ├── villa-investment.webp
          ├── shophouse-investment.webp
          ├── condotel-investment.webp
          ├── land-investment.webp
          ├── resort-investment.webp
          ├── officetel-investment.webp
          ├── service-apartment.webp
          ├── townhouse-investment.webp
          ├── office-building.webp
          └── shopping-mall.webp
```

### Image Requirements
- **Format**: WebP (recommended) hoặc PNG/JPG
- **Aspect Ratio**: 4:5 (portrait)
- **Size**: 640x800px hoặc 800x1000px
- **Quality**: < 150KB per image
- **Content**: High-quality property photos

## 🎨 Customization Options

### 1. Change Card Size
```typescript
// In className
w-[280px] md:w-[320px] → w-[300px] md:w-[350px]
```

### 2. Adjust Gap
```typescript
gap-4 md:gap-6 → gap-6 md:gap-8
```

### 3. Modify Overlay
```typescript
// Change gradient opacity
from-black/80 → from-black/60
via-black/40 → via-black/30
```

### 4. Change Hover Scale
```typescript
group-hover:scale-110 → group-hover:scale-105/115
```

### 5. Adjust Scroll Amount
```typescript
const scrollAmount = sliderRef.current.clientWidth * 0.8; // 80%
// Change to 0.5 (50%) or 1.0 (100%)
```

## 🚀 Performance Tips

1. **Lazy Loading**: Images use `loading="lazy"`
2. **Passive Scroll**: `{ passive: true }` for better performance
3. **Transform Animations**: Use `transform` instead of position for GPU acceleration
4. **Smooth Scroll**: Native `scroll-behavior: smooth`
5. **Optimized Images**: WebP format, compressed

## ♿ Accessibility Features

- ✅ ARIA labels on all interactive elements
- ✅ `aria-controls` linking buttons to slider
- ✅ `aria-live` for screen reader announcements
- ✅ `aria-label` describing button actions
- ✅ Keyboard navigation support (arrow keys)
- ✅ Screen reader instructions
- ✅ Focus visible states

## 🎭 Animations

### Card Hover
```css
Duration: 300ms
Transform: scale(1.02)
Easing: ease-in-out
```

### Image Zoom
```css
Duration: 500ms
Transform: scale(1.1)
Easing: ease-in-out
```

### Button Fade
```css
Duration: 300ms
Opacity: 0 ↔ 1
Transform: scale(1.0) ↔ scale(1.1) on hover
```

### Underline Effect
```css
Duration: 300ms
Width: 0 → 100%
Easing: ease-in-out
```

## 🐛 Troubleshooting

### Images không hiển thị
- Check đường dẫn trong `imageSrc`
- Verify images tồn tại trong `public/images/slider/`
- Check console for 404 errors

### Scroll không smooth
- Verify `scroll-behavior: smooth` được apply
- Check browser support for smooth scrolling

### Buttons không ẩn/hiện đúng
- Check `checkScrollButtons()` logic
- Verify scroll event listener hoạt động
- Adjust threshold (hiện tại là 10px)

### Performance issues
- Optimize images (compress, resize)
- Reduce number of items if necessary
- Use WebP format

## 📊 Browser Support

- ✅ Chrome, Edge, Safari, Firefox (latest)
- ✅ Mobile browsers (iOS Safari, Chrome)
- ✅ CSS scroll-behavior support
- ⚠️ IE11: Needs polyfill for smooth scroll

## 🎉 Features Showcase

### Desktop View
```
┌────────────────────────────────────────────────┐
│  [←]  [Card1] [Card2] [Card3] [Card4]  [→]   │
└────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────┐
│ [Card1] [Card2]...   │
│ (Touch scroll)       │
└──────────────────────┘
```

### On Hover
```
┌────────────────┐
│   [Image ↑]    │ ← Zooms in
│                │
│   Title        │ ← Underline appears
│   ─────        │
└────────────────┘
```

## 💡 Best Practices

1. **Images**: Use consistent style và quality
2. **Titles**: Keep short và descriptive
3. **Links**: Ensure href points to valid pages
4. **Loading**: Lazy load images để improve initial load time
5. **Testing**: Test trên nhiều devices và browsers

## 🔗 Integration Example

```tsx
import InteractiveSlider from '@/components/InteractiveSlider';

function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <InteractiveSlider />  {/* Add here */}
      <Features />
      <Footer />
    </div>
  );
}
```

---

**Tạo bởi**: AI Assistant  
**Ngày**: 23/12/2025  
**Status**: ✅ Hoàn thành

