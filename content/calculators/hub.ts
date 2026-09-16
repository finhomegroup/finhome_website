// Copy for the /cong-cu/ hub page.
//
// The hub is question-first. The audit found a visitor arriving at a
// seventy-five-item index by financial CATEGORY had no way in: the
// affordability tool — the one a first-home buyer needs first — sat eighth
// inside a list called "Vay & Thế chấp", and there was no search. So the page
// now opens with five questions in a buyer's own words and keeps the complete
// categorised catalogue underneath, searchable.
//
// Two rules this copy follows on purpose:
//
// 1. **The tool count is not the headline.** How many tools exist is a fact
//    about us; which question a visitor can answer is a fact about them. The
//    count moved down to the catalogue section, where it is genuinely useful
//    as a search result count.
// 2. **A library tool says so in the list.** A tool that models United States
//    law, or that belongs to a corporate-finance shelf, is labelled where a
//    visitor sees it BEFORE clicking — not only in a notice on its own page.

export const CALCULATOR_HUB = {
  slug: "/cong-cu",
  pageTitle: "Bạn đang muốn biết điều gì?",
  metaTitle: "Công cụ tính toán tài chính",
  metaDescription:
    "Bộ công cụ tính toán tài chính miễn phí của FinHome: khả năng mua nhà, khoản vay, lãi sau ưu đãi, mục tiêu tiết kiệm và nhiều công cụ khác, bằng tiếng Việt.",
  plannedBadge: "Đang phát triển",
  detailNavigationLabel: "Điều hướng công cụ",
  backLabel: "Quay lại",
  backAriaLabel: "Quay lại danh sách tất cả công cụ",

  lede:
    "Chọn câu hỏi gần nhất với điều bạn đang cân nhắc. Mọi công cụ đều miễn phí, tính ngay trên trang và không cần đăng nhập.",

  // --- the five first-home-buyer questions ---------------------------------
  journeysTitle: "Năm câu hỏi khi mua nhà lần đầu",
  // Buyer-facing guidance, not our investment order. Which tools FinHome
  // builds first is a fact about us and belongs in the execution document.
  journeysNote:
    "Không cần đi theo thứ tự. Nếu chưa biết bắt đầu từ đâu, hãy chọn câu hỏi đầu tiên; nếu đã có báo giá của ngân hàng, vào thẳng câu hỏi số 2 hoặc số 5.",
  journeyCta: "Tính thử",

  // --- the complete catalogue ---------------------------------------------
  catalogTitle: "Tất cả công cụ",
  catalogLede:
    "Danh sách đầy đủ, xếp theo nhóm tài chính. Gõ để tìm theo tên công cụ hoặc theo câu hỏi bạn đang có.",

  searchLabel: "Tìm công cụ",
  searchPlaceholder: "Ví dụ: khả năng mua nhà, hết ưu đãi, tiết kiệm…",
  searchHelp:
    "Không cần dấu: gõ “kha nang mua nha” vẫn tìm được. Gõ nhiều từ để thu hẹp kết quả.",
  clearSearchLabel: "Xóa tìm kiếm",

  // {count} and {total} are substituted at render time from the registry, so
  // the numbers cannot drift from what the page actually lists.
  countAll: "Đang hiển thị toàn bộ {total} công cụ.",
  countFiltered: "Tìm thấy {count} trong {total} công cụ.",

  emptyTitle: "Không có công cụ nào khớp với từ khóa này.",
  emptyBody:
    "Có thể công cụ bạn cần mang tên khác, hoặc FinHome chưa có công cụ cho câu hỏi đó. Hãy thử một từ khóa ngắn hơn — “vay”, “tiết kiệm”, “thuế” — hoặc xem lại toàn bộ danh sách.",
  emptyReset: "Xem lại toàn bộ danh sách",

  // --- library shelves -----------------------------------------------------
  libraryLegend:
    "Nhãn bên phải cho biết công cụ nằm ở thư viện tham khảo chứ không thuộc hành trình mua nhà tại Việt Nam.",
  libraryLabels: {
    "hoa-ky": "Hoa Kỳ",
    "dau-tu": "Đầu tư",
    "doanh-nghiep": "Doanh nghiệp",
    "dai-han": "Dài hạn",
    "tien-ich": "Tiện ích",
  },
  libraryDescriptions: {
    "hoa-ky":
      "Tính theo quy định thuế hoặc hưu trí của Hoa Kỳ. Không áp dụng cho khoản vay hay thu nhập tại Việt Nam.",
    "dau-tu": "Thuộc thư viện học về đầu tư và chứng khoán.",
    "doanh-nghiep": "Thuộc thư viện tài chính doanh nghiệp.",
    "dai-han": "Kế hoạch tài chính dài hạn, ngoài phạm vi mua nhà.",
    "tien-ich": "Tiện ích dùng chung, không gắn với việc mua nhà.",
  },
} as const;

/**
 * The five first-home-buyer questions, in the order the plan invests in them.
 *
 * `slug` must be a P1 entry in `plan-disposition.ts` and must be live — both
 * asserted in `hub.test.ts`, so a question card cannot point at a tool that
 * does not exist or has quietly dropped out of the priority tier.
 *
 * `answer` is what the visitor gets, in one line. It is deliberately not a
 * promise: "một mức giá để đi xem nhà" rather than "mức giá bạn được duyệt".
 */
export const HUB_JOURNEYS = [
  {
    slug: "kha-nang-mua-nha",
    step: "1",
    question: "Tôi nên tìm nhà trong tầm giá nào?",
    answer:
      "Từ thu nhập, nợ đang trả và tiền đã có, xem mức giá để đi xem nhà — và giới hạn nào đang chặn bạn.",
  },
  {
    slug: "vay-mua-nha",
    step: "2",
    question: "Mỗi tháng tôi phải chuẩn bị bao nhiêu?",
    answer:
      "Khoản trả theo lịch, phần trả thêm và tổng tiền thực sự rời khỏi ví mỗi tháng.",
  },
  {
    slug: "lai-suat-tha-noi",
    step: "3",
    question: "Hết ưu đãi thì khoản trả tăng bao nhiêu?",
    answer:
      "Tháng lãi suất đổi, khoản trả trước và sau đó, theo giả định lãi suất bạn tự nhập.",
  },
  {
    slug: "muc-tieu-tiet-kiem",
    step: "4",
    question: "Cần để dành bao nhiêu để đủ tiền trả trước?",
    answer:
      "Mức góp mỗi tháng, thời điểm đạt mục tiêu, và phần nào là tiền bạn góp chứ không phải lãi.",
  },
  {
    slug: "so-sanh-khoan-vay",
    step: "5",
    question: "Gói vay nào hợp với khả năng trả của tôi?",
    answer:
      "So chi phí vay thật của từng gói, không chỉ so khoản trả hằng tháng.",
  },
] as const;
