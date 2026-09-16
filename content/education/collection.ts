// Copy for the "Mua nhà bằng con số" collection: its index page and the
// fixed furniture of every article.
//
// The collection sits alongside the market-news feed, not inside it. The
// wording says so in both directions, because a reader who lands on an
// evergreen exercise from search needs to know it is not a dated report, and a
// reader browsing news needs to know the exercises exist.

export const EDUCATION_COLLECTION = {
  slug: "/blog/mua-nha-bang-con-so",
  name: "Mua nhà bằng con số",

  metaTitle: "Mua nhà bằng con số — Bài tập tính toán cho người mua nhà lần đầu",
  // NO COUNT IN EITHER OF THESE TWO STRINGS. Both used to open "Mười hai
  // bài", which was true when the collection had twelve and became a false
  // statement on the page the moment a thirteenth shipped — exactly the stale
  // prose count AGENTS.md says has bitten this repository repeatedly. The
  // wording now describes WHAT the collection covers, which does not go out
  // of date when one is added; the number a reader can see is the list of
  // articles on the page itself, rendered from `EDUCATION_ARTICLES`.
  metaDescription:
    "Bộ bài hướng dẫn tự tính: tầm giá, khoản trả hằng tháng, lãi sau ưu đãi, chi phí vay thật sau phí, tiền trả trước và cách so hai gói vay. Mỗi bài có một ví dụ giả lập, một hình và một bài tập trên công cụ miễn phí của FinHome.",

  pageTitle: "Mua nhà bằng con số",
  lede:
    "Mỗi bài một câu hỏi và một phép tính bạn tự làm được. Không phải tin thị trường: đây là bài tập, và con số trong bài đến từ chính các công cụ miễn phí trên trang này.",

  /** How this differs from the news feed, stated on the index. */
  scopeTitle: "Đây không phải tin tức",
  scopeBody:
    "Các bài ở đây không cũ đi theo ngày và không tóm tắt báo cáo của ai. Mỗi bài nêu rõ tình huống giả lập, chạy phép tính bằng công cụ của FinHome, và chỉ cho bạn cách tự nhập số của mình. Không bài nào trích lãi suất hay biểu phí đang áp dụng của ngân hàng nào — những con số đó thay đổi, và hợp đồng của bạn mới là câu trả lời.",

  groupsTitle: "Năm nhóm quyết định",
  groupsNote:
    "Mỗi bài thuộc đúng một nhóm. Bạn không cần đọc theo thứ tự — hãy vào nhóm gần nhất với điều bạn đang cân nhắc.",

  /** Link from the news feed to the collection. */
  fromNewsTitle: "Muốn tự tính thay vì đọc tin?",
  fromNewsBody:
    "Bộ bài “Mua nhà bằng con số” hướng dẫn từng phép tính khi mua nhà lần đầu, kèm bài tập trên công cụ miễn phí.",
  fromNewsCta: "Xem bộ bài",

  /** Link from the collection back to the news feed. */
  toNewsTitle: "Tin thị trường",
  toNewsBody:
    "Diễn biến giá, nguồn cung, hạ tầng và chính sách được cập nhật theo ngày, có dẫn nguồn.",
  toNewsCta: "Xem tin tức",

  /** Fixed headings inside every article. */
  article: {
    answerTitle: "Câu trả lời ngắn",
    // The reading of the figure, ABOVE the figure: a reader who knows what to
    // look for before looking is far likelier to look at all. Each article
    // supplies the sentence itself in `visualReading`.
    visualReadingTitle: "Biểu đồ này cho thấy gì",
    assumptionsTitle: "Bảng này giả định",
    openTool: "Mở công cụ",
    changeLabel: "Thử đổi một thứ:",
    checkLabel: "Tự kiểm tra:",
    provenanceTitle: "Bài này được viết và kiểm tra thế nào",
    groupNote: "Bài thuộc nhóm",
    nextTitle: "Đọc tiếp",
  },
} as const;
