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

  /**
   * The primary action between the last input and the answer.
   *
   * THIS BUTTON DOES NOT CALCULATE. Every calculator in the suite recomputes
   * on each keystroke and that behaviour is kept — the 2026-09-21 audit found
   * the automatic recalculation working on all 76 routes and found no primary
   * action leading from the form to the result on any of them. So the button
   * answers "where is my answer", not "please compute": it moves focus and the
   * viewport to the result, or to the first field standing in the way.
   *
   * `autoNote` is therefore load-bearing rather than decorative. Without it a
   * reader reasonably assumes nothing was computed until they pressed
   * something, and the one thing this must never do is imply a pending
   * calculation that does not exist — no spinner, no "đang tính", no disabled
   * state while a result already sits on screen.
   *
   * `invalidNote` promises two things the handler has to keep: the button
   * takes you to the offending field, and nothing you typed is discarded on
   * the way. `ResultCta` never writes to a field's value.
   */
  cta: {
    label: "Xem kết quả",
    autoNote:
      "Kết quả tự cập nhật ngay khi bạn thay đổi số — nút này chỉ đưa bạn tới kết quả.",
    invalidNote:
      "Còn ô chưa hợp lệ. Nút này đưa bạn tới ô đó và giữ nguyên những gì bạn đã nhập.",
  },

  /**
   * The semantic result card's WORDS, one per tone — 2026-09-27.
   *
   * The word is the channel and the colour only agrees with it, so each label
   * has to be true on every tool that uses it. None of them is an approval:
   * "Đạt theo giả định" names the reader's own assumptions as the condition,
   * and "Chưa kết luận" is what a missing or invalid essential figure gets —
   * never a green left over from the last valid keystroke. A tool may pass
   * its own label where it has a better name for the same state.
   */
  status: {
    labels: {
      shortfall: "Chưa đủ",
      met: "Đạt theo giả định",
      caution: "Cần lưu ý",
      unknown: "Chưa kết luận",
    },
    /** Before the field-jump buttons. They move focus; they change nothing. */
    actionsLabel: "Thử điều chỉnh trên trang này:",
    /** Joins the label and the title in the one announced sentence. */
    announcementJoin: ". ",
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
     * The compact block beside the answer — `ResultActions`. Short on purpose:
     * P2 asks for one or two actions immediately after the answer, and a
     * browser pass measured the full block 1101,9px below it, behind a plot.
     */
    actionsTitle: "Làm gì tiếp",
    /**
     * One line, where the reader is about to leave. The full paragraph stays
     * in `saveBody` below the figure; this says the one thing that changes
     * what they do next — the link carries nothing with it.
     */
    actionsNote:
      "Không có con số nào được mang sang công cụ khác — bạn sẽ nhập lại.",
    /** Frames the links that did NOT go beside the answer. */
    furtherTitle: "Câu hỏi liên quan khác",
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
    /** Inside the education link's text (map T03): where it will open. */
    newTabNote: "(mở trong tab mới)",
    /**
     * The app introduction on the home-buying tools only (map T06). It links
     * to the homepage section that DESCRIBES the app — no download, store or
     * deep link exists — and says plainly that nothing typed here travels.
     */
    appTitle: "Chuẩn bị mua nhà cùng ứng dụng FinHome",
    appBody:
      "Ứng dụng FinHome giúp bạn chuẩn bị mua nhà từng bước. Số bạn nhập trên trang này không được chuyển sang ứng dụng.",
  },
} as const;
