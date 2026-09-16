// Copy for the card-payoff WORKSPACE — original rows 29 and 30.
//
// Original FinHome copy. The arithmetic follows a common card-statement
// shape; `lib/calc/card-debt.ts` and `lib/calc/card-plan.ts` do it.
//
// THIS FILE OWNS THE FORM, THE RESULTS AND THE CHART FOR BOTH ROUTES.
// `/cong-cu/tra-het-the-tin-dung/` and `/cong-cu/tra-toi-thieu-the-tin-dung/`
// render the SAME calculator at two different opening strategies (original
// rows 29 and 30: "gộp thành chế độ so sánh của công cụ trả hết nợ"), and
// `content/calculators/card-minimum.ts` keeps only that route's own framing.
// Both URLs are unchanged.
//
// Figures quoted below are the tool's own output for the shipped defaults —
// 50 triệu at 30%/năm, mức tối thiểu 5% với sàn 500.000 ₫, trả cố định
// 3.000.000 ₫/tháng, ngân sách hộ 3.000.000 ₫/tháng, bắt đầu 15/9/2026 —
// read off the module and bound to it by `card-payoff.test.ts`:
//   lãi thực mỗi tháng 2,5305% (không phải 2,5%)
//   trả cố định 3.000.000 ₫: 22 tháng, hết nợ 15/7/2028, lãi 15.758.272 ₫
//   trả cố định 4.000.000 ₫: 16 tháng, hết nợ 15/1/2028, lãi 10.872.988 ₫
//   muốn hết nợ trong 12 tháng: cần 4.883.350 ₫/tháng
//   chỉ trả tối thiểu: 90 tháng, hết nợ 15/3/2034, lãi 43.091.470 ₫
//   mức tối thiểu tháng đầu 2.563.261 ₫; trả ĐÚNG số đó nhưng cố định: 28
//   tháng, hết nợ 15/1/2029, lãi 19.799.257 ₫
// Re-read the module if any default moves.

export const CARD_PAYOFF = {
  slug: "/cong-cu/tra-het-the-tin-dung",

  pageTitle: "Trả hết nợ thẻ tín dụng: mất bao lâu?",
  metaTitle: "Tính trả hết nợ thẻ tín dụng — Thời gian, ngày hết nợ và tổng lãi",
  metaDescription:
    "Tính số tháng, ngày hết nợ và tổng lãi để trả hết dư nợ thẻ tín dụng với mức trả cố định, theo mốc thời gian mong muốn, hoặc chỉ trả mức tối thiểu — hai đường dư nợ cạnh nhau. Công cụ miễn phí của FinHome.",

  lede:
    "Nợ thẻ tín dụng không phải một khoản vay trả góp, và tính nó như khoản vay sẽ ra con số dễ chịu hơn thực tế. Công cụ này mô phỏng theo cách sao kê thường tính — lãi cộng theo ngày rồi tính vào cuối kỳ — và cho bạn xem hai cách trả cạnh nhau, kèm ngày hết nợ của từng cách.",

  form: {
    strategyLegend: "Bạn định trả thế nào?",
    strategyHelp:
      "Ba cách trả trên cùng một dư nợ. Dù chọn cách nào, công cụ vẫn vẽ thêm đường dư nợ của cách còn lại để so.",
    strategyFixedOption: "Trả một mức cố định mỗi tháng",
    strategyTargetOption: "Muốn hết nợ trong một số tháng nhất định",
    strategyMinimumOption: "Chỉ trả mức tối thiểu trên sao kê",

    group: "Dư nợ thẻ",
    balanceLabel: "Dư nợ hiện tại",
    balanceUnit: "₫",
    balanceHelp:
      "Chỉ nhập phần dư nợ mà mức lãi và quy định tối thiểu bạn nhập ở dưới áp dụng cho. Các khoản trả góp qua thẻ thường có lãi, phí chuyển đổi và cách tính riêng theo từng chương trình — nếu thẻ của bạn tính chúng khác, hãy để chúng ra ngoài và tính riêng, đừng cộng vào đây.",
    balanceInvalid: "Vui lòng nhập dư nợ lớn hơn 0.",
    defaultBalance: "50.000.000",

    rateLabel: "Lãi suất thẻ",
    rateUnit: "%/năm",
    rateHelp:
      "Lấy đúng mức lãi ghi trong biểu phí của thẻ bạn đang dùng. Trang này không biết biểu phí của bạn nên con số điền sẵn chỉ là ví dụ. Lãi thẻ thường được cộng theo ngày trên số dư.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "30",

    paymentLabel: "Trả mỗi tháng",
    paymentUnit: "₫",
    paymentHelp:
      "Số tiền cố định bạn thực sự chuyển cho thẻ mỗi tháng. Phải lớn hơn tiền lãi của tháng đầu, nếu không dư nợ sẽ tăng thay vì giảm.",
    paymentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPayment: "3.000.000",

    monthsLabel: "Muốn hết nợ trong",
    monthsUnitField: "tháng",
    monthsHelp: "Số tháng bạn muốn tất toán xong. Công cụ giải ra mức trả cần thiết.",
    monthsInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultMonths: "12",

    minimumTitle: "Quy định mức tối thiểu của thẻ",
    minimumNone:
      "Chưa có quy định tối thiểu nào đang tác động tới kết quả.",
    minimumGroup: "Mức tối thiểu theo biểu phí",
    minimumHint:
      "Hai ô này quyết định đường “chỉ trả tối thiểu”. Đây là ô nhập chứ không phải quy định chung: hãy lấy đúng tỷ lệ và mức sàn trong biểu phí của thẻ bạn dùng.",
    percentLabel: "Mức tối thiểu",
    percentUnit: "% dư nợ cuối kỳ",
    percentHelp:
      "Phần trăm dư nợ cuối kỳ mà bạn buộc phải trả, theo biểu phí của chính thẻ đó. Con số 5% điền sẵn chỉ là ví dụ minh họa.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultPercent: "5",

    floorLabel: "Mức sàn",
    floorUnit: "₫",
    floorHelp:
      "Số tiền tối thiểu tuyệt đối, áp dụng khi tỷ lệ phần trăm cho ra con số nhỏ hơn. Chính mức sàn này mới là thứ dứt điểm được món nợ khi dư nợ đã nhỏ.",
    floorInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFloor: "500.000",

    extraLabel: "Trả thêm mỗi tháng",
    extraUnit: "₫",
    extraHelp:
      "Số tiền cố định bạn trả thêm trên mức tối thiểu. Để 0 để thấy trường hợp chỉ trả đúng mức tối thiểu.",
    extraInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultExtra: "0",

    planGroup: "Ngân sách của hộ và ngày bắt đầu",
    budgetLabel: "Ngân sách trả nợ mỗi tháng của hộ",
    budgetUnit: "₫",
    budgetHelp:
      "Số tiền hộ gia đình đã CHỦ Ý dành riêng cho nợ thẻ mỗi tháng. Đây là con số quyết định “khoản tiền mỗi tháng được giải phóng” sau khi hết nợ: nếu bạn không thực sự dành riêng khoản này thì sau khi hết nợ cũng không có gì được giải phóng. Để 0 nếu chưa muốn tính phần đó.",
    budgetInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultBudget: "3.000.000",

    startDayLabel: "Ngày bắt đầu",
    startMonthLabel: "Tháng bắt đầu",
    startYearLabel: "Năm bắt đầu",
    startDayHelp: "Ngày trong tháng bạn bắt đầu kế hoạch trả nợ.",
    startMonthHelp: "Tháng bắt đầu, từ 1 đến 12.",
    startYearHelp: "Năm bắt đầu, viết liền bốn chữ số — ví dụ 2026.",
    startDayInvalid: "Ngày không có trong tháng bạn chọn.",
    startMonthInvalid: "Vui lòng nhập tháng từ 1 đến 12.",
    startYearInvalid: "Vui lòng nhập một năm dạng số nguyên.",
    defaultStartDay: "15",
    defaultStartMonth: "9",
    defaultStartYear: "2026",
    todayLabel: "Dùng ngày hôm nay làm ngày bắt đầu",
    todayHelp:
      "Ngày điền sẵn chỉ là ví dụ. Trang này là trang tĩnh nên không tự biết hôm nay là ngày nào; bấm nút trên để lấy ngày từ thiết bị của bạn.",
    dateConvention:
      "Quy ước ngày của công cụ: bạn nhập ngày BẮT ĐẦU, khoản trả đầu tiên rơi vào một tháng sau đó, nên kế hoạch dài n tháng sẽ hết nợ vào đúng ngày đó n tháng sau. Ngày hết nợ luôn neo theo ngày bắt đầu; nếu ngày đó không tồn tại trong một tháng ngắn thì lùi về ngày cuối tháng.",

    resultTitle: "Kế hoạch bạn chọn",
    monthsResultLabel: "Thời gian để hết nợ",
    /**
     * Replaces the row above in the target-month strategy.
     *
     * There the months are the INPUT and the payment is the answer, so the
     * headline row has to be the payment — a live region repeating the number
     * the reader just typed is not a result.
     */
    paymentResultLabel: "Cần trả mỗi tháng",
    payoffDateLabel: "Ngày hết nợ",
    totalInterestLabel: "Tổng lãi phải trả",
    freedLabel: "Khoản tiền mỗi tháng được giải phóng sau đó",
    monthsUnit: "tháng",
    yearsUnit: "năm",
    firstPaymentLabel: "Khoản trả đầu tiên vào ngày",

    compareTitle: "Cách trả còn lại, cùng dư nợ và cùng lãi suất",
    compareStrategyLabel: "Cách trả",
    compareMonthsLabel: "Thời gian để hết nợ",
    compareDateLabel: "Ngày hết nợ",
    compareInterestLabel: "Tổng lãi phải trả",
    /**
     * Three labels per difference, chosen by the SIGN.
     *
     * "Kế hoạch của bạn nhanh hơn: −97 tháng" is the defect this replaces:
     * on the minimum strategy the chosen plan is 97 months SLOWER than the
     * flat comparison, and a negative number under a "faster" label is a
     * claim the figures contradict.
     */
    compareMonthsFasterLabel: "Kế hoạch của bạn nhanh hơn",
    compareMonthsSlowerLabel: "Kế hoạch của bạn chậm hơn",
    compareMonthsEqualLabel: "Thời gian hết nợ của hai cách trả",
    compareMonthsEqualValue: "Bằng nhau",
    compareInterestSavedLabel: "Kế hoạch của bạn tiết kiệm lãi",
    compareInterestExtraLabel: "Kế hoạch của bạn tốn thêm lãi",
    compareInterestEqualLabel: "Tổng lãi của hai cách trả",
    compareInterestEqualValue: "Bằng nhau",
    noComparisonNotice:
      "Với các con số này, cách trả còn lại không bao giờ dứt được nợ nên không có gì để so. Điều này xảy ra khi mức tối thiểu không bù nổi tiền lãi — hãy kiểm tra lại tỷ lệ và mức sàn trong biểu phí của thẻ.",

    detailToggle: "Xem chi tiết từng khoản",
    detailTitle: "Chi tiết",
    levelPaymentLabel: "Mức trả cố định của kế hoạch",
    decliningPaymentLabel: "Mức trả tháng đầu (giảm dần theo dư nợ)",
    totalPaidLabel: "Tổng số tiền bỏ ra",
    firstInterestLabel: "Tiền lãi tháng đầu",
    lastPaymentLabel: "Khoản trả tháng cuối",
    interestShareLabel: "Lãi so với dư nợ",
    highestPaymentLabel: "Khoản trả cao nhất kế hoạch cần",
    budgetLabelDetail: "Ngân sách hộ đã dành riêng",

    budgetShortfallNotice:
      "Ngân sách bạn khai báo thấp hơn khoản trả cao nhất mà kế hoạch này cần, nên ngân sách đó chưa trang trải được kế hoạch. Vì vậy số tháng và ngày hết nợ ở trên là một kế hoạch GIẢ ĐỊNH — chúng chỉ đúng nếu bạn thực sự trả đủ mức đã nhập, từ một nguồn nào đó ngoài khoản đã dành riêng. Đây không phải kết luận rằng kế hoạch khả thi hay an toàn. Hãy tăng ngân sách, hạ mức trả, hoặc chọn mốc thời gian dài hơn.",
    /**
     * `{lastPayment}`, `{surplus}`, `{payoffDate}`, `{fullMonth}` and
     * `{fullDate}` substituted.
     *
     * The payoff month is NOT a free month: the last payment lands in it. On
     * the shipped defaults that leaves 241.728 ₫ of July 2028's 3 triệu, and
     * the whole allocation is free only from the next cycle.
     */
    freedTimingNotice:
      "Tháng hết nợ vẫn còn khoản trả cuối {lastPayment} vào ngày {payoffDate}, nên tháng đó chỉ dư {surplus} trong ngân sách đã dành riêng. Khoản tiền được giải phóng trọn vẹn từ kỳ tháng {fullMonth} — ngày {fullDate} — trở đi.",
    /** Used instead when the last payment takes the whole allocation. */
    freedTimingNoneNotice:
      "Khoản trả cuối {lastPayment} vào ngày {payoffDate} bằng hoặc lớn hơn cả ngân sách đã dành riêng, nên tháng hết nợ không dư đồng nào. Khoản tiền được giải phóng trọn vẹn từ kỳ tháng {fullMonth} — ngày {fullDate} — trở đi.",
    /** `{limit}` substituted with the model's own month ceiling. */
    beyondHorizonNotice:
      "Với các con số này, kế hoạch chạy quá giới hạn {limit} tháng mà công cụ mô phỏng (100 năm), nên chưa có kết quả để hiển thị. Mức trả vẫn bù được tiền lãi, nhưng phần trả vào gốc quá nhỏ. Hãy tăng mức trả, hoặc chọn mốc thời gian ngắn hơn.",
    budgetNotProofNotice:
      "Khoản tiền được giải phóng chỉ là số tiền chính bạn khai báo đang dành riêng cho nợ thẻ, tính từ ngày hết nợ trở đi. Nó không phải bằng chứng về khả năng trả nợ hay điều kiện được vay, và công cụ này không xét duyệt gì cả. Mức trả tối thiểu giảm dần theo dư nợ, nên nó KHÔNG tự giải phóng số tiền của tháng đầu cho mọi tháng sau — chỉ khoản bạn thực sự dành riêng mới được giải phóng.",
    noPayoffNotice:
      "Mức trả này không đủ bù tiền lãi của tháng đầu, nên dư nợ sẽ tăng lên mỗi tháng và không bao giờ hết. Đây không phải lỗi tính toán mà là điều thực sự xảy ra. Hãy tăng mức trả lên trên con số tiền lãi tháng đầu.",
    dateInvalidNotice:
      "Chưa đọc được ngày bắt đầu, nên công cụ chưa tính được ngày hết nợ. Hãy sửa ô ngày, tháng hoặc năm đang báo lỗi.",
  },

  /** Labels for the two-path chart. See `lib/calc/charts/card-chart.ts`. */
  chart: {
    title: "Dư nợ theo thời gian ở hai cách trả",
    series: "Dư nợ — {strategy}",
    payoffMarker: "{strategy}: hết nợ ở tháng {months}, ngày {date}",
    xAxis: "Tháng kể từ ngày bắt đầu",
    yAxis: "Dư nợ còn lại ({unit})",
    summary:
      "Với cách trả “{plan}”, dư nợ về 0 sau {planMonths} tháng — ngày {planDate} — và tổng lãi là {planInterest}.",
    comparisonNote:
      "Cách trả “{comparison}” cần {comparisonMonths} tháng, tới ngày {comparisonDate}: chênh nhau {monthsDifference} tháng và {interestDifference} tiền lãi.",
    noComparisonNote:
      "Cách trả còn lại không dứt được nợ với các con số này, nên chỉ có một đường trên biểu đồ.",
    assumptions: [
      "Mỗi điểm là dư nợ cuối một tháng trong đúng lịch trả mà kết quả ở trên dùng; biểu đồ không tính lại gì và không nội suy ngày.",
      "Lãi suất, tỷ lệ tối thiểu và mức sàn là các ô bạn nhập, mô phỏng một dạng sao kê phổ biến — không phải điều khoản chung của mọi thẻ.",
      "Chưa tính giao dịch mới, phí thường niên, phí trễ hạn, phí chuyển đổi trả góp và việc thời gian miễn lãi được khôi phục hay không.",
      "Ngày hết nợ neo theo ngày bắt đầu, với khoản trả đầu tiên một tháng sau ngày đó.",
    ],
    tableCaption: "Dư nợ hai cách trả tại các mốc chọn lọc",
    tableHint:
      "Ô để trống nghĩa là cách trả đó đã hết nợ trước tháng này. Khi bật số tiền đầy đủ, vuốt ngang trong bảng để xem đủ các cột.",
    monthColumn: "Tháng",
    unavailableReason: "Chưa đủ dữ liệu hợp lệ để vẽ đường dư nợ.",
    unavailableRecovery:
      "Kiểm tra dư nợ, lãi suất, mức trả và ngày bắt đầu. Nếu mức trả không bù nổi tiền lãi tháng đầu thì không có lịch trả nào để vẽ.",
    strategyFixed: "Trả cố định mỗi tháng",
    strategyTarget: "Trả đủ để hết nợ đúng mốc",
    strategyMinimum: "Chỉ trả mức tối thiểu",
    /**
     * `{extra}` substituted. Used instead of `strategyMinimum` whenever an
     * extra is entered: "minimum + 1 triệu" is not the minimum-only path, and
     * a label that omitted the extra would name the wrong rule on the line
     * the reader is looking at.
     */
    strategyMinimumPlus: "Mức tối thiểu + {extra} mỗi tháng",
    /** `{payment}` substituted with the level the flat path actually holds. */
    strategyMinimumFlat: "Giữ nguyên khoản trả tháng đầu ({payment})",
  },

  dailyInterestNotice:
    "MÔ HÌNH NÀY giả định lãi được cộng dồn theo NGÀY trên số dư rồi tính vào cuối kỳ — tức lãi kép theo ngày. Theo giả định đó, thẻ 30%/năm tương đương 2,5305% một tháng chứ không phải 2,5%: nhỏ về mặt con số nhưng cộng dồn đáng kể qua nhiều năm. Hợp đồng thẻ của bạn có thể tính khác — số ngày trong kỳ, thời điểm nhập lãi, điều khoản miễn lãi và mốc bắt đầu tính lãi đều do biểu phí của từng thẻ quy định — nên hãy đọc đúng phần đó trước khi tin một con số nào ở đây.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi mỗi tháng = dư nợ × ((1 + lãi suất năm ÷ 365)^(365 ÷ 12) − 1). Đây là GIẢ ĐỊNH của mô hình: lãi cộng dồn theo ngày, một tháng lấy 365 ÷ 12 ngày. Với thẻ 30%/năm, hệ số này là 2,5305% một tháng, trong khi cách chia 12 cho ra 2,5%. Hợp đồng của từng thẻ có thể dùng số ngày khác, mốc nhập lãi khác hoặc cách làm tròn khác, nên con số thực tế trên sao kê có thể lệch.",
      "Mỗi tháng: dư nợ mới = dư nợ cũ + lãi − khoản trả. Công cụ mô phỏng từng tháng cho đến khi dư nợ về 0, và khoản trả tháng cuối được cắt đúng bằng phần còn nợ nên số dư kết thúc ở đúng 0.",
      "Chế độ theo mốc thời gian dùng công thức niên kim với chính lãi suất tháng đó: khoản trả = dư nợ × r × (1 + r)^n ÷ ((1 + r)^n − 1), rồi mô phỏng lại đúng mức trả vừa giải ra — nên con số hiển thị và lịch trả được vẽ là cùng một kế hoạch. Với 50 triệu ở 30%/năm, muốn hết nợ trong 12 tháng cần trả 4.883.350 ₫ mỗi tháng.",
      "Mức tối thiểu = phần trăm × dư nợ CUỐI KỲ, tức dư nợ đã cộng lãi của tháng đó, và không thấp hơn mức sàn. Đây là dạng công thức nhiều sao kê dùng, nhưng cả tỷ lệ và mức sàn đều là ô nhập vì chúng khác nhau giữa các thẻ. Vì mức tối thiểu là một tỷ lệ của dư nợ, nó co lại cùng dư nợ — đó là lý do toán học của việc trả tối thiểu mất nhiều năm, và chính MỨC SÀN mới dứt điểm được món nợ.",
      "Khoảng cách giữa hai cách trả rất lớn. Với 50 triệu ở 30%/năm: trả cố định 3.000.000 ₫ mỗi tháng thì hết nợ sau 22 tháng với tổng lãi 15.758.272 ₫; chỉ trả tối thiểu 5% với sàn 500.000 ₫ thì mất 90 tháng và tổng lãi 43.091.470 ₫. Mức tối thiểu tháng đầu là 2.563.261 ₫ — trả ĐÚNG số đó nhưng giữ nguyên không giảm thì chỉ 28 tháng và lãi 19.799.257 ₫. Cùng một số tiền ở tháng đầu, khác nhau ở chỗ một bên hạ mức trả theo dư nợ và bên kia thì không.",
      "Ngày hết nợ lấy đúng số tháng của lịch trả rồi cộng vào ngày bắt đầu, không phải chia dư nợ cho mức trả. Khoản trả đầu tiên rơi vào một tháng sau ngày bắt đầu, nên kế hoạch 22 tháng bắt đầu ngày 15/9/2026 sẽ hết nợ ngày 15/7/2028.",
      "Khi mức trả không bù nổi tiền lãi tháng đầu, công cụ trả về trạng thái không có kết quả kèm ghi chú, thay vì một số tháng rất lớn — vì món nợ đó thực sự không bao giờ hết.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao chỉ cần giữ nguyên mức trả đã tiết kiệm được nhiều như vậy?",
        a: "Vì mỗi đồng vượt trên mức tối thiểu đi thẳng vào gốc, và mỗi đồng gốc trả sớm sẽ tiết kiệm lãi cho toàn bộ số tháng còn lại. Khi dư nợ giảm, mức tối thiểu tự động giảm theo và bạn vô tình trả ít gốc hơn đúng lúc lẽ ra nên trả nhiều hơn. Cách đơn giản nhất: đặt một lệnh chuyển tiền định kỳ với số tiền cố định, thay vì trả theo con số in trên sao kê.",
      },
      {
        q: "“Khoản tiền được giải phóng” có nghĩa là tôi đủ sức vay mua nhà không?",
        a: "Không. Đó chỉ là chính số tiền bạn khai báo đang dành riêng cho nợ thẻ mỗi tháng, được gắn thêm ngày mà nó thôi phải đi trả nợ. Nó không phải đánh giá khả năng trả nợ, không phải hạn mức và không phải điều kiện được vay — trang này không xét duyệt gì và không gửi số của bạn đi đâu. Nếu bạn không thực sự dành riêng khoản đó thì sau khi hết nợ cũng không có khoản nào được giải phóng.",
      },
      {
        q: "Mức tối thiểu ở thẻ của tôi là bao nhiêu?",
        a: "Hãy tra biểu phí của chính thẻ đó: cả tỷ lệ phần trăm và mức sàn đều do từng ngân hàng quy định và đều là ô nhập trong công cụ vì chúng thay đổi kết quả rất nhiều. Con số 5% và sàn 500.000 ₫ điền sẵn chỉ là ví dụ minh họa để trang có một kết quả để xem, không phải mức áp dụng cho thẻ của bạn.",
      },
      {
        q: "Kết quả có tính phí thường niên, phí trễ hạn hay trả góp qua thẻ không?",
        a: "Không. Công cụ chỉ mô phỏng lãi trên dư nợ. Phí thường niên, phí trễ hạn, phí vượt hạn mức và phí chuyển đổi trả góp là các khoản riêng, và cách tính của chúng ghi trong biểu phí của từng thẻ. Nếu bạn đang có các khoản đó, hãy cộng chúng vào dư nợ trước khi tính, và tách riêng phần dư nợ trả góp nếu nó được tính lãi theo cách khác.",
      },
      {
        q: "Nên trả thẻ nào trước khi có nhiều thẻ?",
        a: "Xét về số học, trả thẻ có lãi suất cao nhất trước sẽ tiết kiệm nhất, khi các điều kiện khác như nhau. Nếu bạn cần cảm giác hoàn thành để duy trì, trả thẻ có dư nợ nhỏ nhất trước cũng là một lựa chọn hợp lý và thường chỉ tốn hơn một chút. Hãy chạy công cụ cho từng thẻ với đúng lãi suất và quy định tối thiểu của thẻ đó rồi so hai kết quả, thay vì chọn theo cảm giác.",
      },
      {
        q: "Có nên vay một khoản có kỳ hạn để trả hết thẻ không?",
        a: "Phép so là tổng lãi, không phải khoản trả mỗi tháng: một khoản vay có kỳ hạn buộc dư nợ phải giảm, nhưng chỉ rẻ hơn nếu lãi suất và phí của nó thực sự thấp hơn. Hãy lấy lãi suất và phí trên báo giá bạn có, chạy công cụ này cho thẻ và công cụ so sánh khoản vay cho khoản vay, rồi so hai tổng lãi. Và nó chỉ có ích nếu bạn ngừng dùng lại hạn mức thẻ sau đó — nếu dư nợ thẻ lại tăng lên thì bạn có hai món nợ thay vì một. Công cụ này không cấp và không hứa một khoản vay nào.",
      },
    ],
  },
} as const;
