// Copy for /cong-cu/tien-gui-co-ky-han/'s living-infographic panel (F3 cash
// events). Every figure is `computeTermDeposit`'s (months/12 view) or
// `planDeposit`'s (actual days/365 view); the panel computes no interest.
// Rates are the reader's figures, never a quote, forecast or legal rule.

export const DEPOSIT_LEARNING = {
  title: "Tiền có sẵn khi bạn cần không?",
  basisSample: "Đang xem trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang xem trên các số bạn đã nhập.",
  artAlt:
    "Hình minh họa 3D một hũ thủy tinh đựng vài đồng xu, một cuốn sổ màu xanh mở ra với trang trống, một cuốn lịch để bàn trống và một cây bút.",

  /** The two views, named on the figure as they are on the page. */
  captionTerm: "Theo kỳ hạn (mỗi tháng tính là 1/12 năm)",
  captionDates: "Theo ngày thực tế (số ngày ÷ 365)",

  events: {
    start: "Gửi tiền",
    maturity: "Đáo hạn kỳ {n}",
    end: "Hết kế hoạch",
    exit: "Rút tiền",
    need: "Ngày cần tiền",
    more: "… và {n} lần đáo hạn khác",
  },
  monthAt: "Tháng {m}",

  /** The whole of the split bar, named. */
  // CONDITIONAL, by name (2026-09-29 review): with a break selected this is
  // the alternative, never the money paid at the exit.
  wholeTermEnd: "Nếu giữ đủ cả kế hoạch (đến tháng {m}): gốc và lãi được hưởng là {total}",
  wholeTermIfHeld:
    "Phương án khác, nếu KHÔNG rút mà giữ đủ cả kế hoạch (đến tháng {m}): gốc và lãi được hưởng là {total}",
  /** Paid-out interest: the total counts it, but it is not cash held at the end. */
  wholeNotePaidAlong:
    "Tổng này gồm cả lãi đã nhận dần trong kỳ. Chỉ là số tiền bạn có ở cuối kế hoạch nếu bạn giữ lại toàn bộ lãi đã nhận.",
  wholeNeed: "Vào ngày cần tiền bạn có {total}",
  parts: {
    principal: "Tiền gốc",
    interest: "Lãi",
    interestPaidAlong: "Lãi đã nhận dần ({n} lần), không nhập vào gốc",
    principalRenewed: "Gốc đang gửi, đã gồm lãi các kỳ trước",
    interestAtNeed: "Lãi trả vào ngày cần tiền",
    interestAlready: "Lãi đã nhận lúc đáo hạn, đã nằm trong số tiền này",
  },
  finalPrincipal:
    "Kỳ cuối mở đầu với {amount} tiền gốc (đã gồm lãi các kỳ trước). Đây là gốc đầu kỳ cuối, không phải số tiền bạn có cuối kế hoạch.",

  /** Months view: the typed break month, read off the engine. */
  termNoBreak: "Chưa chọn tháng rút sớm. Dùng các nút bên dưới để xem một mốc rút.",
  termBreakAtMaturity: "Rút ở tháng {m}, đúng một ngày đáo hạn: không mất lãi kỳ hạn của các kỳ đã xong.",
  termBreakBefore: "Rút ở tháng {m}, khi một kỳ đang chạy: kỳ đó chỉ được tính lãi không kỳ hạn bạn nhập.",
  termEarly: "Lãi được hưởng nếu rút ở tháng {m}: {early}.",
  termSame: "Cùng số tháng mà tính theo lãi kỳ hạn: {same}.",
  termLossPositive: "Lãi ít hơn khoảng {amount} vì rút trước hạn.",
  termLossNegative: "Lãi rút sớm bạn nhập cao hơn lãi kỳ hạn, nên lãi được hưởng nhiều hơn khoảng {amount}.",
  termLossZero: "Không chênh lệch lãi.",
  termPaidAlong:
    "Bạn nhận lãi dần trong kỳ, nên con số trên là tổng lãi được hưởng, không phải một lần chi trả khi rút; công cụ không mô phỏng việc ngân hàng đối trừ lãi đã trả.",

  /** Dates view states. */
  statusBefore: "Cần tiền khi kỳ đang chạy: phải rút trước hạn.",
  statusAt: "Cần tiền đúng ngày đáo hạn: nhận đủ lãi kỳ hạn.",
  statusAfter: "Cần tiền sau đáo hạn: tiền đã về từ {date} và được giữ, không sinh thêm lãi trong mô hình.",
  statusAfterRenewed: "Cần tiền sau đáo hạn: tiền đã được gửi tiếp sang kỳ mới.",
  statusBeyond: "Ngày cần tiền vượt quá {limit} kỳ công cụ tính được, nên chưa có số tiền để vẽ.",
  available: "Có trong tay vào ngày cần tiền: {amount}.",
  newPayment: "Ngân hàng trả mới vào đúng ngày đó: {amount}.",
  rateDiffPositive: "Cùng số ngày đã gửi, lãi rút sớm ít hơn lãi kỳ hạn khoảng {amount}.",
  rateDiffNegative: "Cùng số ngày đã gửi, lãi rút sớm bạn nhập cao hơn lãi kỳ hạn khoảng {amount}.",
  rateDiffZero: "Cùng số ngày đã gửi, lãi rút sớm bằng lãi kỳ hạn.",
  foregone: "Lãi của {days} ngày còn lại mà bạn không gửi tiếp: {amount}. Đây là thời gian sinh lời bỏ qua.",
  notPenalty: "Hai con số này đo hai điều khác nhau; cộng lại không phải một khoản phí hay phạt.",

  /** The trials: each writes the page's own field, with undo. */
  trials: {
    breakBefore: "Rút trước đáo hạn đầu 1 tháng (tháng {m})",
    breakAt: "Rút đúng đáo hạn đầu (tháng {m})",
    breakEnd: "Rút khi hết kế hoạch (tháng {m})",
    needBefore: "Cần tiền 1 ngày trước đáo hạn đầu ({date})",
    needAt: "Cần tiền đúng ngày đáo hạn đầu ({date})",
    needAfter: "Cần tiền 1 ngày sau đáo hạn đầu ({date})",
  },
  /** When the term or deposit date cannot be read: the same controls, no figure. */
  trialsNeutral: {
    breakBefore: "Rút trước đáo hạn đầu 1 tháng",
    breakAt: "Rút đúng đáo hạn đầu",
    breakEnd: "Rút khi hết kế hoạch",
    needBefore: "Cần tiền 1 ngày trước đáo hạn đầu",
    needAt: "Cần tiền đúng ngày đáo hạn đầu",
    needAfter: "Cần tiền 1 ngày sau đáo hạn đầu",
  },
  undo: "Hoàn tác lần thử",
  undoNone: "Chưa có lần thử nào để hoàn tác.",
  openForm: "Nhập số của bạn",
  blocked: {
    invalid: "Chưa thử được: có ô nhập đang báo lỗi. Sửa ô đó rồi thử lại.",
    here: "Đang xem đúng mốc này.",
    noTarget: "Mốc này không có với kỳ hạn hiện tại.",
    noResult: "Chưa thử được: với các số này chưa có kết quả để so.",
    tooLarge: "Chưa thử được: số tiền vượt quá mức trang này hiển thị chính xác được.",
    targetUnusable: "Chưa thử được: với các số này, ngày đó cũng không tính được kết quả.",
  },
  impact: {
    heading: "Kết quả lần thử",
    termLine: "Mốc rút đổi từ {before} thành tháng {after}. {reading}",
    termNone: "chưa chọn",
    datesLine: "Ngày cần tiền đổi từ {before} thành {after}. {reading}",
    barsTitle: "Tiền có trong tay trước và sau lần thử",
    barsBefore: "Trước khi thử",
    barsAfter: "Sau khi thử",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
  },

  limits:
    "Lãi suất là con số bạn nhập, không phải báo giá hay dự báo. Công cụ không mô phỏng cách làm tròn, ngày nghỉ hay rút một phần của từng hợp đồng.",
  unknown: "Chưa vẽ được: có ô nhập đang báo lỗi. Sửa ô đó rồi xem lại.",
  noResult:
    // Never points at a note that may not exist: the specific causes carry
    // their own sentence; this is the last fallback.
    "Chưa vẽ được với các số này, dù không ô nào báo lỗi. Hãy thử với số nhỏ hơn hoặc kỳ hạn ngắn hơn.",
  tooLarge: "Số tiền vượt quá mức trang này hiển thị chính xác được, nên hình không được vẽ. Hãy thử với số nhỏ hơn.",
  fix: "Sửa ô đang báo lỗi",
} as const;
