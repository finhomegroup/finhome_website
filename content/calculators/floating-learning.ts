// Copy for /cong-cu/lai-suat-tha-noi/'s "Xem từng tháng quanh mốc hết ưu đãi"
// — the living-infographic F2 panel (docs/design/living-infographic/, row
// `lai-suat-tha-noi`: "Lịch có ranh giới ưu đãi và sau ưu đãi").
//
// Every figure is read from the schedule `compareRateStress` already built for
// the answer rows; the panel computes no payment. Sentences round to
// triệu/tỷ ("khoảng"); the exact đồng of the month sit in a disclosure.
// The post-promotional rate is the reader's ASSUMPTION, never a forecast.

export const FLOATING_LEARNING = {
  title: "Xem từng tháng quanh mốc hết ưu đãi",
  basisSample: "Đang xem trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang xem trên các số bạn đã nhập.",

  /** Context art: the mortgage scene, a text-free 3D miniature. */
  artAlt: "Hình minh họa 3D một ngôi nhà phố nhỏ mái ngói, một chiếc ví màu xanh và một tờ giấy trống.",

  /** The figure's caption: which month, which rate, which stretch. */
  caption: "Tháng {month}: lãi {rate}",
  inPromo: "đang trong ưu đãi",
  afterPromo: "đã hết ưu đãi",
  noPromo: "không có ưu đãi",

  /** The term axis: the whole loan, month 1 to the last. */
  timelineTitle: "Cả kỳ hạn {months} tháng",
  timelineStart: "Tháng 1",
  timelineEnd: "Tháng {months}",
  /** The boundary mark's own label. */
  boundaryMark: "Tháng {month}: đổi lãi",
  /** Rates in words, since the axis is drawn. */
  ratesPromo: "Tháng 1–{last}: {promoRate} (ưu đãi). Từ tháng {first}: {postRate}.",
  ratesNoPromo: "Không có ưu đãi: lãi {postRate} từ tháng 1.",
  /** Only with a recurring step: how many further changes, and the top rate. */
  ratesStepped:
    "Sau đó lãi đổi thêm {count} lần theo kịch bản tăng dần bạn đặt; mức cao nhất sau ưu đãi là {topRate}.",
  timelineLegendPromo: "Trong ưu đãi",
  timelineLegendPost: "Sau ưu đãi",
  timelineLegendMonth: "Tháng đang xem",

  /** The stress preset in force — a choice, never a running total. */
  scenarioBaseline: "Đang tính đúng mức lãi sau ưu đãi bạn nhập.",
  scenarioShift: "Kịch bản đang chọn: +{points} điểm % vào lãi sau ưu đãi, thành {rate}.",
  scenarioCapped: "Trần lãi bạn nhập chặn kịch bản ở {rate}.",

  /** This month's payment, then its whole as one bar. */
  headline: "Tháng này trả khoảng {payment}",
  splitWhole: "Cả thanh là 100% khoản trả tháng {month}.",
  principalLabel: "Tiền gốc",
  principalMeaning: "làm giảm số còn nợ",
  interestLabel: "Tiền lãi",
  interestMeaning: "tính trên số còn nợ đầu tháng",
  debtLine: "Còn nợ sau tháng {month}: khoảng {after}",
  paidOff: "Sau tháng {month}: đã trả hết.",

  /** Only while a stress preset is chosen: the SAME month at the reader's rate. */
  compareSamePromo:
    "Ở mức bạn nhập, tháng này cũng trả khoảng {baseline}: trong ưu đãi, kịch bản không đổi khoản trả.",
  compareSameCapped:
    "Ở mức bạn nhập, tháng này cũng trả khoảng {baseline}: trần lãi bạn nhập giữ lãi tháng này ở cùng mức.",
  compareSameNeutral: "Ở mức bạn nhập, tháng này cũng trả khoảng {baseline}.",
  compareHigher: "Ở mức bạn nhập, tháng này trả khoảng {baseline}; kịch bản này cao hơn khoảng {amount}.",
  compareLower: "Ở mức bạn nhập, tháng này trả khoảng {baseline}; kịch bản này thấp hơn khoảng {amount}.",

  /**
   * The budget, only from the reader's own field. ONE month's row: each
   * sentence names it, and none implies the other months fit.
   */
  budgetNone: "Chưa nhập ngân sách, nên chưa so khoản trả tháng này với ngân sách.",
  budgetFits:
    "Tháng {month} nằm trong ngân sách bạn nhập, còn khoảng {amount}. Chỉ nói về tháng này; tháng khác có thể khác.",
  budgetEqual: "Tháng {month} vừa bằng ngân sách bạn nhập. Chỉ nói về tháng này; tháng khác có thể khác.",
  budgetOver:
    "Tháng {month} vượt ngân sách bạn nhập khoảng {amount}. Chỉ nói về tháng này; tháng khác có thể khác.",

  /** The boundary columns: what the payment is on each side of the change. */
  levelsTitle: "Khoản trả trước và sau mốc đổi lãi",
  levelPromo: "Trong ưu đãi (tháng 1–{last})",
  levelPost: "Từ tháng {month}",
  levelOnly: "Từ tháng 1",
  /** Mounted only when the highest payment is a genuinely later month. */
  levelPeak: "Cao nhất trong lịch (tháng {month})",
  levelsAxis: "Các thanh cùng một thang đo, bắt đầu từ 0.",
  levelsBudget: "Vạch đứng là ngân sách bạn nhập: {budget}.",
  changeUp: "Ở tháng {month}, khoản trả tăng khoảng {amount}.",
  changeDown: "Ở tháng {month}, khoản trả giảm khoảng {amount}.",
  changeSame: "Ở tháng {month}, khoản trả gần như không đổi.",

  roundedNote: "Số đã làm tròn; số chính xác ở phần kết quả và trong “Hiểu thêm”.",

  /** The month control. It changes which month is LOOKED AT, nothing else. */
  monthLabel: "Chọn tháng để xem",
  position: "Tháng {month}/{months}",
  single: "Khoản vay chỉ có một tháng.",
  steps: {
    first: { short: "« Đầu", name: "Về tháng đầu" },
    prev: { short: "‹ Trước", name: "Xem tháng trước" },
    next: { short: "Sau ›", name: "Xem tháng sau" },
    last: { short: "Cuối »", name: "Đến tháng cuối" },
    promoEnd: { short: "Tháng cuối ưu đãi", name: "Xem tháng cuối ưu đãi" },
    boundary: { short: "Tháng đổi lãi", name: "Xem tháng đầu tiên sau ưu đãi" },
  },

  moreTitle: "Hiểu thêm",
  mechanism:
    "Ở mỗi lần lãi đổi, khoản trả được tính lại trên số còn nợ lúc đó và số tháng còn lại. Vì thế khoản trả sau ưu đãi không chỉ phụ thuộc mức lãi mới, mà còn vào phần gốc đã trả trong ưu đãi.",
  assumption:
    "Mức lãi sau ưu đãi và kịch bản tăng dần là giả định bạn nhập để thử, không phải dự báo và không phải báo giá của ngân hàng.",
  exactTitle: "Số chính xác tháng {month}",
  exactPayment: "Khoản trả",
  exactInterest: "Tiền lãi",
  exactPrincipal: "Tiền gốc",
  exactBefore: "Còn nợ đầu tháng",
  exactAfter: "Còn nợ cuối tháng",

  unknown: "Chưa vẽ được: có ô nhập đang báo lỗi. Sửa ô đó rồi xem lại.",
  fix: "Sửa ô đang báo lỗi",
  // FL2: every field passes its own check, yet the schedule cannot be built
  // (the engine returns no result). No single field is blamed: the limit
  // belongs to the current inputs together.
  modelLimit:
    "Hình này chưa vẽ được: các ô đều hợp lệ, nhưng với các số hiện tại, phép tính lịch trả nợ vượt giới hạn tính toán của công cụ. Đây không phải lỗi của riêng một ô nào — hãy xem lại các số đã nhập.",
  fixInputs: "Xem lại các số đã nhập",
  // FL1: the schedule is computed, but amounts THIS ILLUSTRATION would show
  // cannot be printed as numbers, so it draws and quotes nothing from them.
  // `{what}` names which figures: the loan's, the budget, or both.
  displayLimit:
    "Hình này chưa vẽ được: lịch trả nợ vẫn được tính, nhưng {what} quá lớn để hiển thị (từ 10^18 ₫ trở lên), nên hình này không vẽ thanh và không ghi số để khỏi gây hiểu sai.",
  displayWhat: {
    amount: "các khoản tiền của khoản vay trong tháng này",
    budget: "ngân sách tháng bạn nhập",
    both: "cả các khoản tiền của khoản vay lẫn ngân sách tháng bạn nhập",
  },
  fixAmount: "Sửa số tiền vay",
  fixBudget: "Sửa ngân sách tháng",
  // A RATE this illustration would print (a phase's rate in the caption and
  // the rates line, the requested or capped rate in the scenario line) is
  // past the percent formatter's limit, while the money may be printable.
  // Nothing is capped or rounded away: the illustration names the limit and
  // points to the rate control(s) that produce that rate.
  rateLimit:
    "Hình này chưa vẽ được: lịch trả nợ vẫn được tính, nhưng có mức lãi suất cần ghi trong hình quá lớn để hiển thị (từ 10^18 %/năm trở lên), nên hình này không ghi mức lãi và không vẽ lịch để khỏi gây hiểu sai. Mức lãi đó đến từ ô dưới đây.",
  fixRate: {
    promoRate: "Sửa lãi suất ưu đãi",
    postRate: "Sửa lãi suất sau ưu đãi",
    adjustStep: "Sửa mức tăng mỗi lần điều chỉnh",
    rateCap: "Sửa trần lãi suất",
  },
} as const;
