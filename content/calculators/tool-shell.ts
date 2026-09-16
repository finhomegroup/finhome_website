// Shared chrome for the calculator shell: the example notice, the advanced
// disclosure, and the contextual next steps.
//
// One copy for all five upgraded tools, so the same idea is not worded three
// ways. Per-tool wording that genuinely differs lives in that tool's own
// content file.

export const TOOL_SHELL = {
  /**
   * The labelled example state, before the user has typed anything.
   *
   * ONE LINE, INLINE. The browser check measured the first input 887,5 px down
   * a 390 px viewport even after the first repair, and the screenshot showed a
   * boxed eight-line explanation of this state taking most of the entry
   * screen. A reader does not need a paragraph to understand that the numbers
   * are a sample; they need to see the form.
   *
   * The longer explanation is not deleted — it moved to `detail`, behind a
   * disclosure after the core interaction.
   */
  example: {
    badge: "Ví dụ mẫu",
    /** The one visible line while every field is still at its example value. */
    note: "Thay số của bạn để tính.",
    /** Shown once the user has changed at least one field. */
    personalBadge: "Số của bạn",
    personalNote: "Không lưu, không gửi đi đâu.",
    resetLabel: "Về ví dụ mẫu",
    resetHelp:
      "Đưa mọi ô nhập về tình huống giả lập ban đầu. Việc này không lưu gì cả.",

    /** The full explanation, collapsed. */
    detailTitle: "Về các con số đang hiển thị",
    detail:
      "Các con số mặc định là một tình huống giả lập để bạn thấy công cụ hoạt động thế nào, không phải số liệu của một hộ gia đình thật và không phải báo giá của ngân hàng nào. Hãy sửa từng ô thành số của bạn — kết quả và biểu đồ cập nhật ngay khi bạn nhập, không cần bấm tính. FinHome không gửi hay lưu các con số này: chúng chỉ nằm trong trình duyệt của bạn và mất đi khi bạn tải lại trang. Nút “Về ví dụ mẫu” chỉ đưa các ô nhập về tình huống ban đầu, không lưu gì cả.",
  },

  /** The progressive-disclosure panel for advanced inputs. */
  advanced: {
    summaryNone: "Không có thiết lập nâng cao nào đang ảnh hưởng kết quả.",
    summarySeparator: " · ",
    summaryLimit: 2,
    summaryMore: "và {count} thiết lập khác",
    /** Screen-reader hint on the disclosure toggle. */
    toggleHint: "Mở để xem và sửa các thiết lập nâng cao.",
  },

  /** Contextual next steps under the result. */
  nextSteps: {
    title: "Bước tiếp theo",
    toolsTitle: "Công cụ liên quan",
    /**
     * The honest statement about saving, in place of a save button.
     *
     * There is no verified app destination in this codebase — the shared CTA
     * href is still a placeholder — and nothing on this website stores a
     * result. A "Lưu kế hoạch" button would therefore be a promise the product
     * cannot keep from this page, which is the single finding the audit rated
     * highest. So the page says what is true and gives the reader something
     * they can actually do.
     */
    saveTitle: "Giữ lại kết quả này",
    saveBody:
      "Trang này không lưu kết quả và không gửi số của bạn đi đâu. Hãy chụp màn hình hoặc ghi lại các con số quan trọng trước khi rời trang. Mở lại công cụ và nhập lại là cách duy nhất để xem lại kết quả.",
  },
} as const;
