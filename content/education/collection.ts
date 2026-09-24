// Copy for the "Mua nhà bằng con số" collection: its index page and the
// fixed furniture of every article.
//
// Internal taxonomy keeps education separate from news. Reader-facing copy
// explains the decision and experiment, not that internal distinction.

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
  // One short line under the H1, the wording approved with the selected
  // chapters design. The five chapter titles below carry the questions.
  lede: "Những câu hỏi thực tế trước khi mua nhà.",

  /**
   * The index presents the five decision groups as chapters. The label is the
   * short nav name; title and lede restate the group's question in plain
   * words. Keyed by group id so a new group without chapter copy fails to
   * type-check instead of rendering blank.
   */
  chaptersLabel: "Năm chương của bộ bài",
  chapters: {
    BUDGET: {
      anchor: "ngan-sach",
      label: "Ngân sách",
      title: "Tìm nhà trong tầm giá nào?",
      lede: "Hiểu ngân sách trước khi bắt đầu đi xem nhà.",
    },
    SAVING: {
      anchor: "tich-luy",
      label: "Tích lũy",
      title: "Góp bao nhiêu, bao lâu thì đủ vốn?",
      lede: "Lên kế hoạch để dành từng tháng và xem khi nào đủ tiền trả trước.",
    },
    PAYMENT: {
      anchor: "khoan-tra",
      label: "Khoản trả",
      title: "Mỗi tháng trả gì, trả bao nhiêu?",
      lede: "Hiểu phần gốc, phần lãi và số nợ còn lại qua từng năm.",
    },
    CHOICE: {
      anchor: "lua-chon",
      label: "Lựa chọn",
      title: "Chọn phương án nào cho phù hợp?",
      lede: "Đặt các lựa chọn cạnh nhau để thấy mình đang đánh đổi điều gì.",
    },
    RESILIENCE: {
      anchor: "thay-doi",
      label: "Thay đổi",
      title: "Nếu hoàn cảnh đổi, mình xoay xở ra sao?",
      lede: "Thử trước khi lãi tăng, khi có tiền dư hoặc khi muốn đổi khoản vay.",
    },
  },
  chapter: {
    startCta: "Đọc bài bắt đầu",
    toolCta: "Tự tính với số của bạn",
    listTitle: "Trong chương này",
    listNote: "Chọn bất kỳ câu hỏi nào phù hợp với bạn.",
    nextLabel: "Chương tiếp theo",
    backToChapters: "Xem lại năm chương",
  },
  /**
   * Chapter 01 illustration: a generated picture with no figures. The visible
   * caption is one short label; the alt text carries the description.
   */
  budgetIllustration: {
    src: "/images/education/chapter-budget.webp",
    width: 1600,
    height: 733,
    alt: "Minh họa năm hộp thẻ đặt cạnh nhau, ghi Sinh hoạt, Nợ đang trả, Để dành, Nhà ở và Dự phòng: chia tiền mỗi tháng thành từng phần trước khi tính tầm giá.",
    caption: "Minh họa cách chia ngân sách.",
  },

  /** A useful starting point for readers arriving from search or the news feed. */
  scopeTitle: "Thử một ví dụ, hiểu kế hoạch của bạn",
  scopeBody:
    "Chọn câu hỏi bạn đang băn khoăn, xem ví dụ và cách đọc biểu đồ, rồi thay bằng số của mình trên công cụ. Thử đổi một điều — giá nhà, thời hạn vay hoặc tiền tiết kiệm mỗi tháng — để thấy kế hoạch thay đổi ra sao. Giả định và nguồn tham khảo được ghi ngay trong từng bài.",

  /** Link from the news feed to the collection. */
  fromNewsTitle: "Thông tin này có ý nghĩa gì với kế hoạch mua nhà của bạn?",
  fromNewsBody:
    "Tìm hiểu tầm giá vừa túi tiền, khoản trả hằng tháng và tiền cần chuẩn bị qua ví dụ, biểu đồ và công cụ miễn phí.",
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
    assumptionsTitle: "Giả định của ví dụ",
    openTool: "Mở công cụ",
    changeLabel: "Thử đổi một thứ:",
    checkLabel: "Tự kiểm tra:",
    provenanceTitle: "Về nội dung này",
    groupNote: "Bài thuộc nhóm",
    nextTitle: "Đọc tiếp",
    contentsTitle: "Trong bài này",
    earlyToolLead: "Muốn thử ngay với số của bạn?",
    exerciseLink: "Xem các bước",
    chapterLink: "Xem cả chương",
  },
} as const;
