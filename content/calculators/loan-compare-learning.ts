// Copy for the comparison pair's living-infographic panel (F5): shared by
// /cong-cu/so-sanh-khoan-vay/ and /cong-cu/lai-co-dinh-hay-tha-noi/.
//
// Every figure comes from `compareLoans`; the panel computes no payment and
// no cost. Rates are the reader's scenarios, never offers or forecasts. The
// panel names a cheapest option ONLY when every offer in use is complete —
// an offer with unreadable fields or fees marked unknown stops the ranking.

export const LOAN_COMPARE_LEARNING = {
  title: "Đặt các báo giá cạnh nhau: bạn đánh đổi điều gì",
  basisSample: "Đang so trên số ví dụ mẫu, chưa phải báo giá của bạn.",
  basisOwn: "Đang so trên các số bạn đã nhập.",
  artAlt: "Hình minh họa 3D một ngôi nhà phố nhỏ mái ngói, một chiếc ví màu xanh và một tờ giấy trống.",
  caption: "Ba cách đọc, mỗi cách một thang đo riêng, cùng mốc tháng {horizon}",

  /** The verdict, only as definite as the inputs allow. */
  verdictBest:
    "Đến tháng {horizon}, {option} tốn ít nhất: khoảng {cost} lãi và phí. Phương án tốn nhất nhiều hơn khoảng {spread}.",
  verdictTiedSome:
    "Đến tháng {horizon}, {options} tốn bằng nhau và ít nhất: khoảng {cost} lãi và phí. Phương án tốn nhất nhiều hơn khoảng {spread}.",
  verdictTiedAll: "Đến tháng {horizon}, các phương án tốn bằng nhau: khoảng {cost} lãi và phí. Không có phương án rẻ hơn.",
  verdictInvalid:
    "Chưa xếp hạng: {options} có ô chưa đọc được. Sửa ô đang báo lỗi để so tiếp; các con số không phụ thuộc phí vẫn hiện bên dưới.",
  verdictUnknown:
    "Chưa xếp hạng: {options} chưa biết đủ phí, nên chưa thể nói phương án nào tốn ít hơn. Khoản trả và dư nợ vẫn đọc được vì không phụ thuộc phí.",
  verdictTooFew: "Cần ít nhất hai báo giá đủ lãi suất và kỳ hạn để so. Một phương án một mình không phải người thắng.",
  /** Joins positional names: "Phương án B và Phương án C". */
  and: " và ",

  /** The horizon control, next to the figure. It writes the page's own field. */
  horizonLabel: "So tại tháng thứ",
  horizonPosition: "Tháng {horizon}",
  horizonHelp: "Kéo hoặc bấm để đổi mốc; ô “So sánh tại tháng thứ” trong form đổi theo, và mọi con số tính lại.",
  steps: {
    zero: { short: "Tháng 0", name: "So tại tháng 0: mới giải ngân, chưa trả tháng nào" },
    back: { short: "−12 tháng", name: "Lùi mốc so 12 tháng" },
    forward: { short: "+12 tháng", name: "Tiến mốc so 12 tháng" },
    end: { short: "Hết kỳ hạn dài nhất", name: "So tại tháng cuối của kỳ hạn dài nhất" },
  },

  /** Lane 1: cash flow. */
  paymentsTitle: "1 · Khoản trả mỗi tháng",
  paymentsScale: "Cùng một thang: khoản trả lớn nhất trong các báo giá là {max}.",
  paymentFirst: "Lúc đầu",
  paymentReset: "Từ tháng {month}",
  structureConstant: "một mức lãi suốt kỳ hạn",
  structurePhased: "đổi lãi từ tháng {month}",
  // QUALIFIED 2026-09-29: the longer-term effect holds for the same amount,
  // a positive rate and the same repayment method, so it says "có thể".
  paymentLesson:
    "Trả ít hơn mỗi tháng không có nghĩa là tốn ít hơn tổng cộng: với cùng số tiền và lãi suất dương, kỳ hạn dài hơn làm tháng nhẹ đi nhưng có thể tốn nhiều lãi hơn.",

  /** Lane 2: what borrowing cost up to the horizon. */
  costTitle: "2 · Chi phí đến tháng {horizon}: lãi + phí",
  // The DRAWING scale, not a claim about the largest actual cost.
  costScale: "Thang vẽ chung: cả thanh dài bằng {max}. Không tính phần gốc đã trả.",
  costScaleUnknown:
    "Thang vẽ chung: cả thanh dài bằng {max}, chỉ dựng từ phần đã biết. Phí chưa biết không được vẽ, nên đây không phải chi phí lớn nhất thật.",
  costInterest: "Lãi",
  costUpfront: "Phí lúc giải ngân",
  costExit: "Phí trả nợ trước hạn",
  // CORRECTED 2026-09-29: never "chắc chắn" — the interest is the scenario's.
  costUnknown:
    "Chưa biết đủ phí: lãi theo kịch bản đã nhập khoảng {interest}; tổng chi phí thật còn thiếu phần phí chưa biết.",
  costInvalid: "Chưa đọc được báo giá này.",

  /** Lane 3: what is still owed — a separate obligation, never "interest". */
  balanceTitle: "3 · Còn nợ tại tháng {horizon}",
  balanceScale: "Thang là số tiền vay {amount}. Đây là tiền gốc còn phải trả, không phải lãi.",
  balancePaidOff: "Đã trả hết ở tháng {month}; sau đó không còn nợ và không còn chi phí.",

  horizonVsFull:
    "Chi phí đến mốc bạn chọn khác chi phí cả kỳ hạn. Nếu giữ khoản vay đến hết, hãy đổi mốc về “Hết kỳ hạn dài nhất”.",
  roundedNote: "Số đã làm tròn; số chính xác ở bảng “Xem bảng so sánh từng chỉ tiêu”.",

  moreTitle: "Hiểu thêm",
  fullTermTitle: "Chi phí cả kỳ hạn (lãi + phí lúc giải ngân, không gồm phí trả nợ trước hạn)",
  fullTermUnknown: "Chưa biết đủ phí",
  scenarioNote:
    "Mọi mức lãi ở đây là giả định bạn nhập, không phải báo giá hay dự báo. Thanh khoản trả chỉ vẽ hai mức lúc đầu và sau đổi lãi, không phải lịch trả từng tháng.",

  unknown: "Chưa vẽ được: số tiền vay hoặc mốc so sánh đang báo lỗi. Sửa ô đó rồi xem lại.",
  fix: "Sửa ô đang báo lỗi",

  /** The per-offer switch, next to that offer's fees. */
  unknownFeesLabel: "Chưa biết đủ phí của báo giá này",
  unknownFeesHelp:
    "Đánh dấu nếu ngân hàng chưa cho biết hết các khoản phí. Các phí bạn đã nhập vẫn được giữ, nhưng công cụ sẽ không xếp hạng cho tới khi bạn bỏ đánh dấu.",

  /** Values the page shows instead of a figure it cannot stand behind. */
  notRanked: "Chưa xếp hạng",
  feeUnknownValue: "Chưa biết đủ phí",
  tieValue: "Bằng nhau",
  noSpread: "Không chênh lệch",

  /** The cost chart when no ranking may be stated. */
  chartInvalid: "Chưa so chi phí: {options} có ô chưa đọc được.",
  chartUnknown: "Chưa so chi phí: {options} chưa biết đủ phí.",
  recoveryInvalid: "Sửa ô đang báo lỗi để đưa báo giá đó trở lại so sánh.",
  recoveryUnknown:
    "Khi đã có đủ phí, nhập các phí còn thiếu rồi bỏ đánh dấu “Chưa biết đủ phí” để so lại.",
  /** The cost chart when the cheapest options are tied. */
  chartTied: "Tại tháng thứ {horizon}, {options} có chi phí bằng nhau, {cost}.",
  /** The payment chart's summary when no cheapest option may be named. */
  paymentSummaryNoRank:
    "{lowestOption} có khoản trả hằng tháng thấp nhất lúc đầu, {lowest}. Khoản trả thấp hơn không có nghĩa là tốn ít hơn.",
  /** …and when two or more opening instalments are equal. */
  paymentSummaryTied:
    "{options} có khoản trả hằng tháng lúc đầu bằng nhau, {lowest}. Khoản trả bằng nhau không có nghĩa là chi phí bằng nhau.",

  /**
   * THE WHOLE-TOOL LIMIT (release repair, 2026-10-01), both routes. The
   * boxes parse, yet the comparison cannot be completed ("model": no row,
   * or a non-finite figure — a schedule may still exist, e.g. an
   * overflowing fee total) or an entered value or result — money or a
   * percentage — is too large to print exactly ("display"). The page then states NO
   * ranking, spread, cost or lane — never a placeholder read as an answer —
   * and says why once, with a jump to each box that is itself the cause.
   * No sentence here claims that every box is valid: a box with its own
   * error keeps that error beside this.
   */
  limits: {
    /** The card's word and the pinned answer. */
    label: "Chưa hiển thị được",
    cta: "Chưa hiển thị được",
    display: {
      title: "Chưa so được: có con số quá lớn để hiển thị chính xác.",
      reason:
        "Với số hiện tại, có số đã nhập hoặc kết quả của {options} quá lớn để hiển thị chính xác, nên trang không xếp hạng và không in con số so sánh nào để khỏi gây hiểu sai. Hãy xem lại {fields}.",
      neutral:
        "Với số hiện tại, có kết quả của {options} quá lớn để hiển thị chính xác, nên trang không xếp hạng và không in con số so sánh nào. Hãy xem lại số tiền vay và các giả định lãi suất, kỳ hạn, phí của báo giá đó.",
    },
    model: {
      title: "Chưa so được: phép tính vượt giới hạn của công cụ.",
      reason:
        "Với số hiện tại, công cụ không tính trọn được phép so sánh cho {options} vì có con số vượt giới hạn tính toán, nên trang không xếp hạng và không đưa ra con số so sánh nào. Hãy xem lại {fields}.",
      neutral:
        "Với số hiện tại, công cụ không tính trọn được phép so sánh cho {options} vì có con số vượt giới hạn tính toán, nên trang không xếp hạng và không đưa ra con số so sánh nào. Hãy xem lại số tiền vay và các giả định lãi suất, kỳ hạn, phí của báo giá đó.",
    },
    /** When no single offer is affected (the amount alone). */
    allOptions: "các báo giá",
    /** Between two box names. */
    join: ", ",
    /** In place of the answer rows; the card with the reason sits just above. */
    rows: "Trang chưa xếp hạng và chưa in chênh lệch chi phí cho các số hiện tại. Lý do và ô cần xem lại ở ngay trên.",
    /** In place of both charts. */
    chart:
      "Chưa vẽ biểu đồ: các số hiện tại vượt giới hạn hiển thị hoặc tính toán của công cụ. Lý do và ô cần xem lại ở phần kết quả.",
    /** The panel, which sits below the answer. */
    scene: {
      display:
        "Chưa vẽ được: có con số quá lớn để hiển thị chính xác. Lý do và ô cần xem lại ở phần kết quả phía trên.",
      model:
        "Chưa vẽ được: phép tính vượt giới hạn của công cụ. Lý do và ô cần xem lại ở phần kết quả phía trên.",
    },
    /** The panel's jump: to the first box with an error, else the first box. */
    fix: "Xem lại các ô đã nhập",
    /** The guard's own fallback when a figure has no rank. */
    verdict: "Chưa xếp hạng: các con số vượt giới hạn hiển thị hoặc tính toán của công cụ.",
    /** A fee summary whose value cannot be printed. */
    settingTooLarge: "quá lớn để hiển thị",
  },
} as const;
