// Copy shared by every listed-but-not-yet-built calculator page.
//
// These pages exist so the tool menu is complete and every click lands
// somewhere honest. They are `noindex` on purpose — see the docstring in
// `app/cong-cu/[slug]/page.tsx`.
//
// The wording is deliberately plain about the state of the tool. Saying
// "coming soon" while showing an empty form would be worse than saying
// nothing.

export const CALCULATOR_PLACEHOLDER = {
  metaTitleSuffix: "đang phát triển",

  statusTitle: "Công cụ này đang được phát triển",
  statusBody:
    "Chúng tôi đang xây dựng công cụ này. Phần tính toán chưa sẵn sàng nên trang chưa hiển thị kết quả — chúng tôi không muốn đưa ra con số khi chưa kiểm chứng được. Bạn có thể xem các công cụ đã hoàn thiện ở trang danh sách.",

  backToHub: "Xem tất cả công cụ",
  siblingsTitle: "Các công cụ khác cùng nhóm",
} as const;
