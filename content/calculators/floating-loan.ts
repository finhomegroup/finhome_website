// Copy for /cong-cu/lai-suat-tha-noi/ — the floating-rate loan.
//
// Original FinHome copy. Shares lib/calc/floating-loan.ts with the
// fixed-vs-floating page.
//
// This is the shape almost every Vietnamese mortgage actually has, and the
// shape almost every calculator ignores. The number that matters is not the
// promotional instalment on the offer sheet; it is the one after the promo
// ends, and how much bigger it is.
//
// Figures quoted are the module's own output for 2 tỷ, 240 tháng, ưu đãi
// 7,5% trong 12 tháng rồi 11%: trả 16.111.864 ₫ trong năm đầu, rồi
// 20.479.346 ₫ — tăng 4.367.482 ₫, tức 27,11%. Dư nợ sau 12 tháng vẫn còn
// 1.955.136.259 ₫, nghĩa là cả năm ưu đãi chỉ trả được 44.863.741 ₫ gốc.
// Tổng lãi cả kỳ hạn 2.862.633.323 ₫.

export const FLOATING_LOAN = {
  slug: "/cong-cu/lai-suat-tha-noi",

  // MODEL-SPECIFIC, because the shared one is wrong here. The default notice
  // says the tool "giả định lãi suất không đổi" — on the page whose entire
  // subject is the rate CHANGING. It keeps the mandatory opening sentence
  // (`check:markup` asserts exactly one "Công cụ này chỉ mang tính minh họa"
  // per page, and the contract is not weakened) and replaces only the
  // constant-rate clause with what this engine actually does.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, không phải lời khuyên tài chính. Lãi suất ở đây KHÔNG được giả định không đổi: nó thay đổi đúng theo kịch bản bạn nhập — số tháng ưu đãi, mức lãi sau ưu đãi, mức tăng mỗi chu kỳ và trần nếu có. Những kịch bản đó là giả định của bạn, không phải dự báo và không phải báo giá của ngân hàng. Kết quả chưa trừ thuế, phí, bảo hiểm và lạm phát, và mô hình tính lại khoản trả trên dư nợ còn lại trong số tháng còn lại — hợp đồng của bạn có thể quy định khác. Hãy đối chiếu điều khoản hợp đồng trước khi quyết định.",

  pageTitle: "Khoản vay lãi thả nổi: sau ưu đãi trả bao nhiêu?",
  metaTitle: "Tính khoản vay lãi thả nổi — Mức tăng khi hết ưu đãi",
  metaDescription:
    "Tính khoản trả hằng tháng trong và sau thời gian ưu đãi, mức tăng phải chịu, và tổng lãi khi lãi suất điều chỉnh theo kỳ. Công cụ miễn phí của FinHome.",

  lede: "Xem khoản trả trong thời gian ưu đãi và khoản trả sau đó.",
  ledeDetailTitle: "Vì sao nên xem con số thứ hai",
  ledeDetail:
    "Con số trên tờ báo giá thường là khoản trả trong thời gian ưu đãi. Nếu hợp đồng của bạn chuyển sang lãi thả nổi sau đó, khoản trả được tính lại trên dư nợ còn lại trong số tháng còn lại — và đó là con số quyết định bạn có trả được lâu dài hay không. Mức lãi sau ưu đãi ở đây là giả định bạn nhập để thử, không phải dự báo: hãy chạy vài mức và xem mức nào bạn vẫn chịu được.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền thực nhận từ ngân hàng.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay, nhập số nguyên. 20 năm là 240 tháng.",
    // States the supported horizon, because the field is what rejects it.
    termInvalid: "Vui lòng nhập số nguyên tháng từ 1 đến 1.200.",
    defaultTerm: "240",

    promoGroup: "Thời gian ưu đãi",
    promoMonthsLabel: "Số tháng ưu đãi",
    promoMonthsHelp:
      "Thường 6, 12, 18 hoặc 24 tháng. Nhập 0 nếu khoản vay không có lãi ưu đãi.",
    promoMonthsInvalid:
      "Vui lòng nhập số nguyên tháng từ 0 trở lên và nhỏ hơn kỳ hạn.",
    defaultPromoMonths: "12",

    promoRateLabel: "Lãi suất ưu đãi",
    promoRateUnit: "%/năm",
    promoRateHelp: "Mức lãi trong thời gian ưu đãi — con số trên tờ báo giá.",
    promoRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPromoRate: "7,5",

    postGroup: "Sau ưu đãi",
    postRateLabel: "Lãi suất sau ưu đãi",
    postRateUnit: "%/năm",
    postRateHelp:
      "Lãi cơ sở cộng biên độ. Hãy hỏi ngân hàng con số này bằng văn bản — đây là ô quan trọng nhất của trang.",
    postRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPostRate: "11",

    adjustEveryLabel: "Điều chỉnh lãi mỗi",
    adjustEveryUnit: "tháng",
    adjustEveryHelp:
      "Chu kỳ ngân hàng xem lại lãi suất, thường 3, 6 hoặc 12 tháng.",
    adjustEveryInvalid: "Vui lòng nhập số nguyên tháng từ 1 đến 1.200.",
    defaultAdjustEvery: "12",

    adjustStepLabel: "Mỗi lần điều chỉnh, lãi tăng",
    adjustStepUnit: "điểm %",
    adjustStepHelp:
      "Kịch bản DO BẠN đặt ra, không phải dự báo. Để 0 nếu bạn muốn giả định lãi sau ưu đãi không đổi.",
    adjustStepInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultAdjustStep: "0",

    rateCapLabel: "Trần lãi suất",
    rateCapUnit: "%/năm",
    rateCapHelp:
      "Mức lãi tối đa theo hợp đồng, nếu có. Để trống nếu hợp đồng không có trần — phần lớn hợp đồng ở Việt Nam thì không.",
    rateCapInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRateCap: "",

    resultTitle: "Khoản trả hằng tháng",
    firstPaymentLabel: "Trong thời gian ưu đãi",
    highestPaymentLabel: "Mức cao nhất phải chịu",
    shockLabel: "Tăng thêm so với thời gian ưu đãi",
    shockPercentLabel: "Tức tăng",

    budgetLabel: "Ngân sách bạn chịu được mỗi tháng",
    budgetUnit: "₫",
    budgetHelp:
      "Không bắt buộc. Nếu bạn nhập, biểu đồ sẽ kẻ một đường ngang ở mức đó để bạn thấy khoản trả có vượt qua hay không. Công cụ KHÔNG tự đoán con số này — để trống thì không có đường nào.",
    budgetInvalid: "Vui lòng nhập một số từ 0 trở lên, hoặc để trống.",
    defaultBudget: "",

    // ORIGINAL ROW 11: "nút thử tăng 1/2/3 điểm phần trăm với nhãn kịch bản".
    // ĐIỂM PHẦN TRĂM, not percent: +1 on 11%/năm is 12%/năm. The two differ by
    // 303 triệu of interest on the default loan, so the unit is in every label.
    stressLegend: "Thử lãi sau ưu đãi cao hơn",
    stressHelp:
      "Đây là KỊCH BẢN giả định để thử sức chịu đựng, không phải dự báo và không phải báo giá của ngân hàng. Mỗi mức cộng thêm số ĐIỂM PHẦN TRĂM đó vào lãi suất sau ưu đãi bạn vừa nhập — chọn lại cùng một mức không cộng dồn, và chọn “giữ mức bạn nhập” là quay về đúng con số ban đầu. Thời gian ưu đãi và khoản trả trong thời gian ưu đãi không đổi trong mọi kịch bản.",
    stressBaselineOption: "Giữ mức bạn nhập",
    stressPlusOne: "+1 điểm %",
    stressPlusTwo: "+2 điểm %",
    stressPlusThree: "+3 điểm %",

    stressComparisonTitle: "Kịch bản đang chọn so với mức bạn nhập",
    stressAppliedLabel: "Lãi sau ưu đãi đang tính",
    stressBaselineRateLabel: "Mức bạn nhập",
    stressBaselinePaymentLabel: "Khoản trả sau ưu đãi ở mức bạn nhập",
    // SCOPED TO ONE MONTH, and worded AT that month rather than FROM it. With
    // a kịch bản tăng dần active the instalment keeps rising afterwards, so
    // "trả thêm mỗi tháng" would read as a constant increment for the whole
    // term and "kể từ tháng 13" would claim the difference holds from there on.
    stressPaymentIncreaseLabel: "Chênh lệch khoản trả ở tháng {n}",
    stressInterestIncreaseLabel: "Tổng lãi cả kỳ hạn tăng thêm",
    // Signed on purpose: a negative figure IS the answer to "tôi có chịu nổi
    // không". Mounted only when the reader supplied a budget — the tool never
    // invents one. Two rows, because one gap cannot answer both questions:
    // whether the reset is affordable, and whether the whole scenario is.
    stressBudgetGapLabel: "Ngân sách trừ khoản trả ở tháng {n}",
    stressBudgetGapPeakLabel: "Ngân sách trừ khoản trả cao nhất (tháng {n})",
    stressBudgetOverNotice:
      "Với kịch bản này, khoản trả ngay khi hết ưu đãi đã vượt ngân sách bạn nhập. Đây là giả định của bạn, không phải dự báo — nhưng nó cho thấy mức lãi nào khiến kế hoạch không còn chịu được.",
    // The case one figure hides: the reset fits, a later step does not.
    //
    // Worded AT the peak month, not FROM it, and the earlier overrun is a
    // POSSIBILITY rather than a fact. Two counterexamples in the same
    // fixture family decide the wording: at a 22 triệu budget the payment
    // first passes it in month 25 while the peak is month 229, but at a 29,7
    // triệu budget the peak month IS the first month over — so "bị vượt từ
    // một tháng TRƯỚC mốc này" would be false there. This tool computes the
    // peak, not the first overrun, and says so instead of guessing.
    stressBudgetOverLaterNotice:
      "Khoản trả ngay khi hết ưu đãi vẫn nằm trong ngân sách, nhưng kịch bản tăng dần bạn đặt đẩy khoản trả lên cao hơn. Tại tháng {n}, khoản trả cao nhất vượt ngân sách {amount} mỗi tháng. Ngân sách CÓ THỂ đã bị vượt từ trước mốc đó — công cụ không tính tháng đầu tiên vượt ngân sách, nên hãy mở bảng từng giai đoạn ở phần chi tiết để xem khoản trả của mỗi giai đoạn. Đừng đọc con số ở mốc hết ưu đãi như kết luận cho cả kỳ hạn.",
    stressBaselineNotice:
      "Đang tính đúng mức lãi sau ưu đãi bạn nhập, chưa thêm kịch bản nào.",
    stressCapNotice:
      "Trần lãi suất bạn nhập đang chặn kịch bản này: lãi chỉ lên tới mức trần chứ không lên hết mức bạn chọn. Hai con số được hiện riêng để bạn thấy trần đang có tác dụng.",
    stressRequestedLabel: "Mức kịch bản yêu cầu (trước trần)",
    stressStepNotice:
      "Kịch bản tăng dần bạn đặt trong phần bên dưới vẫn được giữ: nó bắt đầu từ mức lãi sau ưu đãi của kịch bản này, và chỉ được tính một lần.",

    scenarioGroupTitle: "Kịch bản lãi suất tăng dần (tùy chọn)",
    scenarioUnused: "Chưa đặt kịch bản tăng dần — lãi giữ ở mức sau ưu đãi.",
    scenarioStepActive: "Mỗi kỳ tăng",
    scenarioCapActive: "Trần lãi",
    scenarioEveryActive: "Chu kỳ xem lại",

    detailDisclosureTitle: "Xem chi tiết và từng giai đoạn",
    detailDisclosureHint:
      "Tổng lãi, tổng tiền trả và bảng khoản trả theo từng giai đoạn lãi suất.",

    detailTitle: "Chi tiết",
    totalInterestLabel: "Tổng lãi cả kỳ hạn",
    totalPaidLabel: "Tổng số tiền trả",
    monthsLabel: "Số tháng trả nợ",
    lowestPaymentLabel: "Mức thấp nhất",
    monthsUnit: "tháng",

    table: {
      caption: "Từng giai đoạn lãi suất",
      phaseColumn: "Tháng",
      rateColumn: "Lãi suất",
      paymentColumn: "Trả hằng tháng",
      interestColumn: "Lãi trong giai đoạn",
      principalColumn: "Gốc trong giai đoạn",
      balanceColumn: "Dư nợ cuối giai đoạn",
      // CORRECTED. The earlier version blamed the LOW promotional rate for the
      // slow principal reduction, which is backwards: at the same principal
      // and term, a lower annuity rate retires MORE principal per payment, not
      // less. On these numbers month 1 at 7,5% repays 3.611.864 ₫ of principal
      // against 2.310.435 ₫ at 11%. The cause is the 240-month annuity itself.
      intro:
        "Cột dư nợ là cột đáng xem nhất. Với khoản vay mặc định, sau 12 tháng dư nợ vẫn còn 1.955.136.259 ₫ — cả năm chỉ trả được 44.863.741 ₫ gốc, tức 2,24% khoản vay 2 tỷ. Không phải vì lãi ưu đãi thấp: khoản trả được chia để vừa đủ tất toán trong 240 tháng, nên những tháng đầu gần như chỉ đủ bù tiền lãi trên dư nợ còn nguyên. Tháng đầu ở mức 7,5% trả 12.500.000 ₫ lãi và 3.611.864 ₫ gốc; nếu cùng số tiền và kỳ hạn đó ở 11% thì phần gốc còn nhỏ hơn, chỉ 2.310.435 ₫. Lãi cao hơn trả được ÍT gốc hơn, không phải nhiều hơn.",
    },
  },

  // CORRECTED. The earlier version said the payment rise was larger than the
  // rate rise without saying which "rate rise" — and on these numbers it is
  // smaller than the relative one. Percentage points and relative percent are
  // now named separately, and the re-amortisation effect is stated in the
  // direction the numbers actually go.
  shockNotice:
    "Với khoản vay mặc định, khoản trả đổi từ 16.111.864 ₫ lên 20.479.346 ₫ khi hết ưu đãi — thêm 4.367.482 ₫ mỗi tháng, tức 27,11%. Trước khi ký, hãy tự hỏi bạn có trả được con số thứ hai không, đừng hỏi về con số thứ nhất.",
  shockDetailTitle: "27,11% so với “lãi tăng 3,5%” — hai con số khác nhau",
  shockDetail:
    "Lãi đi từ 7,5%/năm lên 11%/năm là tăng 3,5 ĐIỂM PHẦN TRĂM. Tính theo tỷ lệ tương đối thì đó là tăng 46,67% so với mức cũ (3,5 chia 7,5). Hai cách nói này là hai con số khác nhau và không thể so trực tiếp với nhau. Khoản trả hằng tháng tăng 27,11% — ít hơn mức tương đối 46,67%, vì công thức niên kim tính lại khoản trả từ lãi suất, dư nợ và số tháng còn lại; cả phần gốc mỗi kỳ cũng thay đổi, không thể nhân khoản trả cũ với mức tăng của lãi suất. Nếu chỉ đổi lãi mà giữ nguyên 2 tỷ trong 240 tháng, khoản trả sẽ là 20.643.768 ₫, tức tăng 28,13%. Con số thực tế 27,11% thấp hơn một chút vì khi tính lại, dư nợ đã giảm còn 1.955.136.259 ₫ — phần giảm này bù được nhiều hơn tác động của việc chỉ còn 228 tháng thay vì 240.",

  chart: {
    title: "Khoản trả hằng tháng theo thời gian",
    paymentSeries: "Khoản trả mỗi tháng",
    budgetReference: "Ngân sách bạn nhập",
    resetMarker: "Tháng {n}: lãi suất đổi",
    xAxis: "Tháng thứ",
    yAxis: "Khoản trả mỗi tháng ({unit})",
    summary:
      "Khoản trả bắt đầu ở {first}, rồi nhảy lên {highest} từ tháng {resetMonth} — tăng {change} mỗi tháng, tức {changePercent}. Đường nằm ngang rồi gấp khúc, chứ không dốc dần: khoản trả đổi trong đúng một tháng.",
    summaryFlat:
      "Với các số này lãi suất không đổi, nên khoản trả giữ ở {first} suốt kỳ hạn.",
    scenarioNote:
      "Mức lãi sau ưu đãi là KỊCH BẢN bạn tự nhập, không phải báo giá của ngân hàng và không phải dự báo.",
    budgetNote: "Đường ngang là ngân sách do bạn nhập.",
    changePercentUndefined: "không tính được tỷ lệ vì khoản trả đầu bằng 0",
    assumptions: [
      "Ở mỗi lần lãi suất đổi, khoản trả được tính lại trên dư nợ còn lại trong số tháng còn lại. Đây là cách công cụ mô hình hóa; hợp đồng của bạn có thể tính khác — ví dụ trả gốc đều hoặc tính lãi theo số ngày thực tế.",
      "Không trang tĩnh nào biết lãi suất cơ sở vài năm sau ở đâu. Hãy thử nhiều mức để xem mức nào bạn vẫn trả được.",
      "Trục dọc bắt đầu từ 0, nên độ cao của bậc đúng bằng tỷ lệ tăng thật.",
    ],
    tableCaption: "Khoản trả theo từng giai đoạn lãi suất",
    phaseColumn: "Tháng",
    rateColumn: "Lãi suất",
    paymentColumn: "Trả hằng tháng",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì các số đã nhập chưa tạo thành một khoản vay.",
    // Names every field that can clear the chart, including the two rates —
    // the browser check found an invalid post-promo rate clearing the chart
    // while this sentence mentioned only amount, term and promo months.
    unavailableRecovery:
      "Ô đang có lỗi được tô đỏ kèm lời giải thích riêng. Thường là một trong năm ô: số tiền vay, kỳ hạn, số tháng ưu đãi (phải nhỏ hơn kỳ hạn), lãi suất ưu đãi, hoặc lãi suất sau ưu đãi.",
  },

  formula: {
    title: "Cách tính",
    body: [
      "Trong mỗi giai đoạn lãi suất, khoản trả được tính theo công thức niên kim thông thường. Điểm khác biệt nằm ở thời điểm chuyển giai đoạn: khoản trả mới được tính lại trên DƯ NỢ CÒN LẠI trong SỐ THÁNG CÒN LẠI. Đây là phép tính công cụ dùng và là cách phổ biến với khoản vay trả góp đều; hợp đồng cụ thể của bạn có thể quy định khác — trả gốc đều, hoặc tính lãi theo số ngày thực tế trong kỳ — nên hãy đối chiếu với điều khoản.",
      "Với mặc định: giai đoạn ưu đãi tính 2 tỷ ở 7,5% trong 240 tháng cho khoản trả 16.111.864 ₫. Sau 12 tháng, dư nợ còn 1.955.136.259 ₫, và giai đoạn sau tính số đó ở 11% trong 228 tháng còn lại, cho 20.479.346 ₫.",
      "Đây là lý do mức tăng 27,11% lớn hơn cảm nhận về việc lãi tăng từ 7,5% lên 11%. Hai yếu tố cộng lại: dư nợ gần như không giảm trong năm ưu đãi, và số tháng còn lại để trải khoản nợ đã ngắn hơn 12 tháng.",
      "Ô “mỗi lần điều chỉnh lãi tăng” tạo ra một kịch bản nhiều giai đoạn: sau ưu đãi, lãi suất tăng thêm số điểm phần trăm đó ở mỗi chu kỳ xem lại, cho đến khi chạm trần nếu bạn có nhập trần. Đây là KỊCH BẢN bạn đặt ra để thử độ bền của tài chính mình, không phải dự báo — không trang tĩnh nào biết được lãi cơ sở ba năm sau ở đâu.",
      "Giai đoạn cuối luôn nhận phần tháng còn lại, nên tổng số tháng của các giai đoạn đúng bằng kỳ hạn. Dư nợ kết thúc ở đúng 0.",
    ],
    // The post-promotional figure is a SCENARIO, and the recalculation basis
    // is what makes the rise bigger than the rate change suggests.
    emphasis: [
      "khoản trả mới được tính lại trên DƯ NỢ CÒN LẠI trong SỐ THÁNG CÒN LẠI",
      "Đây là KỊCH BẢN bạn đặt ra để thử độ bền của tài chính mình, không phải dự báo",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy lãi suất sau ưu đãi ở đâu?",
        a: "Hỏi ngân hàng và yêu cầu bằng văn bản, vì nó thường không nằm trên tờ quảng cáo. Công thức phổ biến là lãi cơ sở cộng biên độ, trong đó biên độ được ghi trong hợp đồng và lãi cơ sở do ngân hàng công bố theo kỳ. Nếu ngân hàng chỉ nói “theo lãi suất thị trường” mà không cho con số hay công thức, đó là dấu hiệu cần cẩn thận — hãy lấy mức lãi thả nổi ngân hàng đó đang áp cho khách hàng cũ làm mốc.",
      },
      {
        q: "Vì sao năm ưu đãi lại trả được ít gốc như vậy?",
        a: "Trong ví dụ 7,5% và 240 tháng, năm đầu trả khoảng 193 triệu, trong đó 44,86 triệu là gốc. Tỷ trọng này phụ thuộc cả lãi suất và kỳ hạn. Giữ nguyên số tiền vay, kỳ hạn và cách trả góp đều, lãi thấp hơn cho phần gốc tháng đầu lớn hơn; ở mức lãi 0%, toàn bộ khoản trả là gốc. Không phải lãi ưu đãi thấp khiến trả gốc chậm.",
      },
      {
        q: "Có nên trả thêm gốc trong thời gian ưu đãi?",
        a: "Nếu hợp đồng cho phép mà không thu phí, thì đây là thời điểm hiệu quả nhất: mỗi đồng gốc trả thêm trong giai đoạn ưu đãi làm giảm dư nợ sẽ được tính lại ở lãi suất mới, nên nó cắt lãi nhiều hơn cùng số tiền đó ở giai đoạn sau. Nhưng hãy đọc điều khoản phí trả nợ trước hạn trong hợp đồng của bạn: mức phí do hợp đồng quy định và có thể xóa hết phần lợi đó.",
      },
      {
        q: "Nên thử kịch bản lãi tăng bao nhiêu?",
        a: "Đủ để biết ngưỡng chịu đựng của bạn, không phải để dự báo. Một cách thực dụng: nhập mức tăng sao cho lãi suất cuối kỳ cao hơn mức hiện tại 3–4 điểm phần trăm, rồi xem khoản trả cao nhất có vượt ngân sách hay không. Nếu có, hãy vay ít hơn hoặc chọn kỳ hạn dài hơn — đừng dựa vào giả định lãi suất sẽ không tăng.",
      },
      {
        q: "Trần lãi suất có phổ biến ở Việt Nam không?",
        a: "Không phổ biến với vay mua nhà cho cá nhân. Phần lớn hợp đồng chỉ ghi công thức lãi cơ sở cộng biên độ mà không có mức tối đa. Nếu hợp đồng của bạn có trần thì đó là một điều khoản đáng giá — hãy nhập vào ô trần và so tổng lãi với trường hợp không trần để thấy nó bảo vệ bạn bao nhiêu.",
      },
    ],
  },
} as const;
