# Admin Components Structure

Cấu trúc thư mục admin đã được tổ chức lại để dễ quản lý và bảo trì hơn.

## Cấu trúc thư mục

```
src/components/admin/
├── dashboard/           # Các component dashboard stats và management
│   ├── DashboardStats.tsx
│   ├── NumberProjectbyFields.tsx
│   ├── Gender.tsx
│   ├── StartupStageChart.tsx
│   ├── ActivityTimeline.tsx
│   ├── TopStartups.tsx
│   ├── StartupsManagement.tsx
│   ├── UsersManagement.tsx
│   └── index.ts         # Export tất cả dashboard components
├── entrepreneurship/    # Các component về entrepreneurship ecosystem
│   ├── Entrepreneurship.tsx
│   └── index.ts         # Export tất cả entrepreneurship components
├── layout/              # Các component layout cho admin
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   └── index.ts         # Export tất cả layout components
└── README.md           # File này
```

## Cách sử dụng

### Import dashboard components:
```typescript
import {
  DashboardStats,
  NumberProjectbyFields,
  Gender,
  StartupStageChart,
  ActivityTimeline,
  TopStartups,
  StartupsManagement,
  UsersManagement
} from '@/components/admin/dashboard';
```

### Import entrepreneurship components:
```typescript
import { Entrepreneurship } from '@/components/admin/entrepreneurship';
```

### Import layout components:
```typescript
import { AdminSidebar, AdminHeader } from '@/components/admin/layout';
```

## Lợi ích của cấu trúc mới

1. **Tách biệt rõ ràng**: Dashboard, entrepreneurship và layout components được tách riêng
2. **Dễ bảo trì**: Mỗi loại component có thư mục riêng
3. **Import đơn giản**: Sử dụng file index.ts để import gọn gàng
4. **Mở rộng dễ dàng**: Có thể thêm các loại component mới vào thư mục phù hợp
5. **Tổ chức logic**: Các tính năng liên quan được nhóm lại với nhau
