// Copy for the /cong-cu/ hub page.

export const CALCULATOR_HUB = {
  slug: "/cong-cu",
  pageTitle: "Công cụ tính toán tài chính",
  metaTitle: "Công cụ tính toán tài chính",
  metaDescription:
    "Bộ công cụ tính toán tài chính miễn phí của FinHome: lãi kép, thời gian nhân đôi tiền, khoản vay và nhiều công cụ khác, bằng tiếng Việt.",
  plannedBadge: "Đang phát triển",

  // {live} and {total} are substituted at render time from the registry,
  // so the count cannot drift from what the page actually lists.
  legend:
    "Hiện có {live} công cụ dùng được trong tổng số {total} công cụ. Dấu tròn xanh là công cụ đã hoàn thiện; mục màu nhạt là công cụ đang phát triển.",

  lede:
    "Các công cụ miễn phí giúp bạn tự tính toán trước khi ra quyết định tài chính. Chọn một công cụ bên dưới để bắt đầu.",
} as const;
