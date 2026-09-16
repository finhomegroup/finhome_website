// Copy for /cong-cu/kha-nang-mua-nha/ — the affordability calculator.
//
// Original FinHome copy. The arithmetic is standard finance run backwards.
//
// Figures quoted below are the tool's own output at its shipped defaults, read
// off the module and pinned by `affordability.test.ts` — re-run that test
// rather than trusting these numbers if a default moves.
//
// Defaults: gross 50 triệu, net 44 triệu, essentials 18 triệu, existing debt
// 5 triệu, monthly buffer 3 triệu, cash 600 triệu, 8,5%/năm, 240 tháng.
//
//   household mode (the default): the HOUSEHOLD binds at 18.000.000 ₫/month
//   → loan 2.074.155.117 ₫, price 2.674.155.117 ₫, deposit share 22,4%
//   ceiling mode: the lender's housing ratio binds at 20.000.000 ₫/month
//   → loan 2.304.616.796 ₫, price 2.904.616.796 ₫, deposit share 20,7%
//
// The 230.461.680 ₫ gap between those two prices for ONE household is the
// finding this page was rebuilt around: a lender will lend more than a
// household can carry, and the old page showed only the lender's number.
//
// THE RATIOS AND THE FINANCING SHARE ARE THE USER'S ASSUMPTIONS. The 40%/50%
// defaults are starting points for an illustration, not a statutory cap and
// not a claim about what any bank does — this task verified no such range, so
// the copy asserts none. Same for the financing share, which defaults to 100%
// precisely so the tool imposes no deposit requirement of its own. There is no
// "safe DTI" anywhere in this file, and household mode asks for actual amounts
// rather than a percentage for exactly that reason.

export const AFFORDABILITY = {
  slug: "/cong-cu/kha-nang-mua-nha",

  // MODEL-SPECIFIC. The shared notice says the result excludes "thuế, phí" —
  // but the purchase-cost percentage the reader enters IS modelled here, and it
  // is funded from the same cash as the deposit. Saying it is excluded would
  // make a reader add those costs a second time. The mandatory opening sentence
  // is kept verbatim, so `check:markup`'s one-disclaimer contract is unchanged.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, không phải lời khuyên tài chính và không phải cam kết cho vay của bất kỳ ngân hàng nào. Tỷ lệ trả nợ và phần vay được là GIẢ ĐỊNH của bạn. Đã tính: chi phí mua nhà ngoài giá theo tỷ lệ bạn nhập, chi phí nhà ở khác hằng tháng, nợ đang trả và quỹ dự phòng bạn giữ lại. Chưa tính: thuế thu nhập, lạm phát, phí trả nợ trước hạn, và thay đổi lãi suất — mức lãi được giả định không đổi suốt kỳ hạn. Hãy đối chiếu điều khoản hợp đồng và hỏi ngân hàng con số thật trước khi quyết định.",

  pageTitle: "Khả năng mua nhà: bạn nên nhắm giá nào?",
  metaTitle: "Tính khả năng mua nhà — Từ thu nhập ra mức giá nên nhắm",
  metaDescription:
    "Từ thu nhập, nợ đang trả và tiền tích lũy, tính khoản trả hằng tháng bạn chịu được, số tiền vay tối đa và mức giá nhà nên nhắm tới. Công cụ miễn phí của FinHome.",

  lede: "Từ thu nhập và tiền đã có, xem tầm giá để bắt đầu đi xem nhà.",
  ledeDetailTitle: "Công cụ này tính thế nào",
  ledeDetail:
    "Nó chạy ngược phép tính khoản vay: thay vì hỏi khoản vay này trả bao nhiêu mỗi tháng, nó hỏi bạn trả được bao nhiêu mỗi tháng thì vay được bao nhiêu, rồi ghép với tiền bạn tự có. Kết quả là một mức giá để đi xem nhà, không phải một mức ngân hàng đã cam kết. Chọn “Hộ của tôi trả được bao nhiêu” để đưa chi phí sinh hoạt vào phép tính.",

  form: {
    modeLegend: "Bạn muốn biết điều gì?",
    // No approval language: neither mode reports what a bank would do. The
    // first applies two ratios the reader supplies; the second works from the
    // household's own cash flow.
    modeHelp:
      "Hai câu hỏi khác nhau và hai con số khác nhau. Áp hai tỷ lệ lên thu nhập gộp cho ra một con số; lấy thu nhập thực nhận trừ chi phí sinh hoạt cho ra con số khác — thường nhỏ hơn. Không con số nào là mức ngân hàng đã đồng ý. Chọn “ngân sách của hộ” nếu bạn muốn con số thứ hai.",
    modeCeiling: "Theo tỷ lệ tôi giả định thì tối đa bao nhiêu?",
    modeHousehold: "Hộ của tôi trả được bao nhiêu mỗi tháng?",
    defaultMode: "household",

    householdGroup: "Dòng tiền thật của hộ",
    netIncomeLabel: "Thu nhập thực nhận mỗi tháng",
    netIncomeUnit: "₫",
    netIncomeHelp:
      "Số tiền thực sự vào tài khoản sau thuế và bảo hiểm — không phải thu nhập gộp ở ô trên. Đây là số dùng để tính ngân sách sống, vì đó là số bạn thực sự có.",
    netIncomeInvalid: "Vui lòng nhập thu nhập thực nhận lớn hơn 0.",
    defaultNetIncome: "44.000.000",

    essentialsLabel: "Chi phí sinh hoạt thiết yếu mỗi tháng",
    essentialsUnit: "₫",
    essentialsHelp:
      "Ăn uống, điện nước, học phí, đi lại, y tế — những khoản không cắt được. KHÔNG tính tiền nhà và không tính các khoản nợ đang trả, vì hai nhóm đó đã có ô riêng.",
    essentialsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    // Prefilled, so the worked example is a COMPLETE household rather than a
    // half-answered form. Clearing the field is what exercises the
    // unknown-expenses path, and the page says so when it happens.
    defaultEssentials: "18.000.000",
    essentialsUnknownNotice:
      "Bạn chưa nhập chi phí sinh hoạt, nên công cụ đang tính như thể chi phí đó bằng 0 — điều gần như không đúng với hộ nào. Kết quả bên dưới vì vậy là GIỚI HẠN TRÊN, không phải ngân sách. Hãy nhập một con số, dù là ước lượng, rồi xem kết quả đổi thế nào.",

    bufferLabel: "Muốn để dành mỗi tháng",
    bufferUnit: "₫",
    bufferHelp:
      "Khoản bạn muốn tiếp tục tích lũy sau khi đã trả nợ nhà: quỹ dự phòng, sửa nhà, việc bất ngờ. Để 0 nếu bạn chấp nhận không để dành được gì trong giai đoạn đầu.",
    bufferInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultBuffer: "3.000.000",

    incomeGroup: "Thu nhập và nợ",
    incomeLabel: "Thu nhập cả hộ mỗi tháng",
    incomeUnit: "₫",
    incomeHelp:
      "Thu nhập gộp trước thuế của tất cả người cùng đứng vay. Ngân hàng xét trên thu nhập chứng minh được, không phải thu nhập thực nhận.",
    incomeInvalid: "Vui lòng nhập thu nhập lớn hơn 0.",
    defaultIncome: "50.000.000",

    debtsLabel: "Nợ đang trả mỗi tháng",
    debtsUnit: "₫",
    debtsHelp:
      "Tổng các khoản đang trả: vay mua xe, trả góp, và mức trả tối thiểu của thẻ tín dụng. Đây là ô hay bị bỏ trống nhất, và cũng là ô hay quyết định kết quả nhất.",
    debtsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDebts: "5.000.000",

    purchaseGroup: "Điều kiện mua",
    downLabel: "Tiền tích lũy đang có",
    downUnit: "₫",
    downHelp:
      "Toàn bộ số tiền bạn có sẵn. Đừng tự trừ quỹ dự phòng ở đây — có ô riêng bên dưới, và công cụ chỉ trừ đúng một lần.",
    downInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDown: "600.000.000",

    reserveLabel: "Giữ lại làm quỹ dự phòng",
    reserveUnit: "₫",
    reserveHelp:
      "Phần bạn KHÔNG dùng để mua nhà, để dành cho việc bất ngờ. Giữ lại nhiều thì tầm giá thấp hơn nhưng bạn an toàn hơn nếu thu nhập gián đoạn. Số này bị trừ khỏi tiền tích lũy đúng một lần, không bị trừ lại ở chỗ nào khác.",
    reserveInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultReserve: "0",

    purchaseCostLabel: "Chi phí mua nhà ngoài giá",
    purchaseCostUnit: "% giá nhà",
    purchaseCostHelp:
      "Thuế, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm, bảo hiểm khoản vay và tiền hoàn thiện tối thiểu. Những khoản này lấy từ cùng túi tiền với tiền trả trước. Để 0 nếu bạn muốn bỏ qua — khi đó công cụ sẽ nói rõ là chưa tính.",
    purchaseCostInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultPurchaseCost: "0",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi sau ưu đãi, không phải mức ưu đãi năm đầu.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    housingCostsLabel: "Chi phí nhà ở khác mỗi tháng",
    housingCostsUnit: "₫",
    housingCostsHelp:
      "Phí quản lý chung cư, bảo hiểm tài sản, phí gửi xe. Được trừ ra trước khi tính số tiền vay, vì chúng cũng rời khỏi ví bạn mỗi tháng.",
    housingCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultHousingCosts: "0",

    ratioGroup: "Giả định của bạn",
    housingRatioLabel: "Trả nợ nhà tối đa",
    housingRatioUnit: "% thu nhập",
    housingRatioHelp:
      "Phần thu nhập gộp bạn giả định được dành cho khoản trả nhà. Đây là giả định để thử, không phải mức ngân hàng nào công bố. Nếu ngân hàng của bạn nói một con số khác, hãy nhập con số đó.",
    housingRatioInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultHousingRatio: "40",

    totalRatioLabel: "Tổng trả nợ tối đa",
    totalRatioUnit: "% thu nhập",
    totalRatioHelp:
      "Phần thu nhập gộp bạn giả định được dành cho TẤT CẢ các khoản nợ, gồm cả nợ hiện có. Cũng là giả định của bạn — hãy hỏi ngân hàng và nhập đúng con số họ dùng.",
    totalRatioInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTotalRatio: "50",

    ltvLabel: "Giả định vay được tối đa",
    ltvUnit: "% giá nhà",
    ltvHelp:
      "Phần giá nhà bạn giả định có thể vay. Để 100 nghĩa là chưa đặt yêu cầu trả trước nào — khi đó tiền của bạn chỉ cần đủ cho chi phí mua. Nếu ngân hàng yêu cầu bạn tự có 20% hoặc 30%, hãy nhập 80 hoặc 70 và xem tầm giá đổi thế nào. Đây là giả định của bạn, không phải cam kết của ngân hàng.",
    ltvInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultLtv: "100",

    // Renamed from "Mức nên nhắm" / "Giá nhà nên nhắm tới". The audit's
    // objection: that label reads as advice a bank has agreed to, when the
    // figure is the output of two ratios the user can change. It is a price to
    // START LOOKING at, and the label now says only that.
    resultTitle: "Tầm giá để bắt đầu đi xem",
    maxPriceLabel: "Tầm giá nhà",
    maxLoanLabel: "Số tiền vay tương ứng",
    // CORRECTED. This row used to read "Trả gốc và lãi mỗi tháng" and show the
    // BUDGET — on the audit's household fixture, 15.000.000 ₫ against an
    // instalment of about 13.806.000 ₫ on the 1.590.909.091 ₫ the cash actually
    // allows. The budget is a ceiling, and the instalment is a bill; they only
    // coincide when the monthly payment is what caps the price.
    paymentLabel: "Ngân sách trả gốc và lãi mỗi tháng",
    expectedPaymentLabel: "Khoản trả của số tiền vay ở trên",
    expectedPaymentBelowBudgetNotice:
      "Hai con số này khác nhau vì tầm giá đang bị chặn bởi tiền tự có và giả định vay được, không phải bởi khoản trả: khoản vay thực dùng nhỏ hơn mức khoản trả của bạn gánh được, nên khoản trả hằng tháng cũng nhỏ hơn ngân sách. Phần ngân sách chênh ra vẫn là của bạn — có thể để dành, trả thêm gốc, hoặc nhắm căn đắt hơn nếu tích lũy thêm.",

    detailTitle: "Xem con số này đến từ đâu",
    detailHint:
      "Ngân sách theo tháng, và cách tiền tự có với khoản vay ghép thành tầm giá.",
    monthlyDetailTitle: "Ngân sách theo tháng",
    financingDetailTitle: "Khoản vay và tiền tự có",
    bindingLabel: "Giới hạn đang chặn",
    bindingHousing: "Tỷ lệ trả nợ nhà bạn giả định",
    bindingTotal: "Tỷ lệ tổng nợ bạn giả định",
    bindingHousehold: "Ngân sách còn lại của hộ",
    housingLimitLabel: "Trần theo tỷ lệ trả nợ nhà",
    totalLimitLabel: "Còn lại theo tỷ lệ tổng nợ",
    ratioCeilingLabel: "Trần theo giả định của bạn",
    householdResidualLabel: "Hộ còn lại được mỗi tháng",
    budgetLabel: "Ngân sách nhà ở mỗi tháng",
    paymentSupportedLoanLabel: "Khoản trả này gánh được khoản vay",
    maxLoanUsedLabel: "Khoản vay dùng ở tầm giá này",
    priceBindingLabel: "Điều đang chặn tầm giá",
    priceBindingPayment: "Khoản trả hằng tháng",
    priceBindingFinancing: "Tiền tự có và giả định vay được",
    usableCashLabel: "Tiền dùng được để mua",
    purchaseCostsLabel: "Trong đó dành cho chi phí mua",
    cashToPriceLabel: "Thực trả trước cho căn nhà",
    downPercentLabel: "Tiền trả trước chiếm",

    ceilingIsNotBudgetNotice:
      "Trần này tính từ hai tỷ lệ BẠN nhập, không phải mức ngân hàng đã đồng ý. Chịu được theo công thức cũng không có nghĩa nên vay tới mức đó: phép tính chưa biết gia đình bạn tiêu bao nhiêu mỗi tháng. Hãy chuyển sang “Hộ của tôi trả được bao nhiêu” để đưa chi phí sinh hoạt vào.",
    financingBoundNotice:
      "Tầm giá ở trên đang bị chặn bởi tiền tự có, không phải bởi khoản trả hằng tháng: với giả định vay được hiện tại, tiền của bạn chỉ đủ cho mức giá này. Khoản trả bạn chịu được vẫn gánh được khoản vay lớn hơn. Tích lũy thêm, hoặc hỏi ngân hàng xem thực tế vay được bao nhiêu phần trăm giá nhà rồi nhập lại.",
    financingBlockedNotice:
      "Với các số này chưa có tầm giá nào khả thi: tiền dùng được để mua không đủ trả phần bạn phải tự có cộng chi phí mua. Đây không phải vấn đề thu nhập — khoản trả hằng tháng của bạn vẫn gánh được một khoản vay. Hãy giảm quỹ dự phòng giữ lại, tích lũy thêm, hạ tỷ lệ chi phí mua, hoặc nâng giả định vay được nếu ngân hàng cho vay nhiều hơn.",
    purchaseCostsExcludedNotice:
      "Chi phí mua nhà ngoài giá đang để 0, nên tầm giá ở trên CHƯA trừ thuế, phí công chứng, phí sang tên và tiền hoàn thiện. Những khoản này thường vài phần trăm giá nhà và lấy từ cùng số tiền bạn dùng để trả trước.",
    infeasibleNotice:
      "Với thu nhập thực nhận, chi phí sinh hoạt, nợ đang trả và khoản muốn để dành như trên, hộ của bạn không còn đồng nào cho khoản trả nhà. Đây là kết quả thật, không phải lỗi. Ba việc thực sự thay đổi được con số: giảm nợ đang trả, hạ khoản muốn để dành trong giai đoạn đầu, hoặc chờ thêm để tích lũy nhiều hơn và vay ít hơn.",
    noRoomNotice:
      "Với các con số này, không còn chỗ cho một khoản vay mua nhà: nợ đang trả và chi phí nhà ở khác đã dùng hết ngân sách mà các giới hạn cho phép. Đây là kết quả thật, không phải lỗi. Hãy thử giảm nợ hiện có, tăng thu nhập chứng minh được, hoặc chờ thêm để tích lũy.",

    // ORIGINAL ROW 7: "so kịch bản". A real baseline-versus-changed comparison
    // on the same model, held only while this page is open.
    //
    // The copy is careful about three things the review named: it is a mốc the
    // reader took, not a plan anyone saved; it says WHICH inputs moved instead
    // of showing two figures; and it refuses to read a mode change as an effect
    // of anything the reader changed.
    compareCaptureAction: "Ghi lại mốc so sánh",
    compareCaptureHint:
      "Ghi lại kết quả hiện tại để đối chiếu khi bạn đổi một giả định — ví dụ nhập lãi suất cao hơn. Mốc này chỉ nằm trong trang đang mở: không được lưu, không được gửi đi đâu, và mất khi bạn tải lại hoặc đóng trang.",
    compareClearAction: "Bỏ mốc so sánh",
    compareTitle: "Mốc bạn ghi lại so với số hiện tại",
    compareUnchangedNote:
      "Chưa có giả định nào khác mốc đã ghi, nên hai bên đang là cùng một kịch bản. Hãy đổi một giả định ở trên — lãi suất, kỳ hạn, tiền tích lũy — để xem tầm giá đổi bao nhiêu.",
    // Names AND values, before → after. Naming only the field left the reader
    // to remember what they had typed a moment ago, which is exactly what a
    // comparison is supposed to spare them.
    compareChangedIntro: "Giả định đã đổi so với mốc",
    compareUnset: "chưa nhập",
    compareModeHousehold: "ngân sách của hộ",
    compareModeCeiling: "trần theo tỷ lệ giả định",
    compareMonthsUnit: "tháng",
    compareStaleNote:
      "Số hiện tại đang có ô lỗi nên chưa so được. Mốc đã ghi vẫn giữ nguyên — sửa ô đang báo lỗi là so lại được.",
    compareModeChangedNote:
      "Hai bên đang trả lời HAI CÂU HỎI khác nhau: một bên là trần theo tỷ lệ bạn giả định trên thu nhập gộp, bên kia là ngân sách thật của hộ trên thu nhập thực nhận. Phần chênh lệch bên dưới KHÔNG phải tác động của một giả định nào bạn đổi — nó là khoảng cách giữa hai câu hỏi.",
    compareLimitedNote:
      "Ít nhất một bên chưa có chi phí sinh hoạt, nên bên đó là mức trên chứ không phải ngân sách. So sánh vẫn đọc được, nhưng đừng coi nó là so hai ngân sách.",
    comparePriceLabel: "Tầm giá: mốc → hiện tại",
    compareLoanLabel: "Số tiền vay: mốc → hiện tại",
    comparePaymentLabel: "Ngân sách trả gốc và lãi: mốc → hiện tại",
    compareExpectedPaymentLabel: "Khoản trả của khoản vay: mốc → hiện tại",
    compareCapacityLabel: "Ngân sách này gánh được khoản vay: mốc → hiện tại",
    comparePriceChangeLabel: "Tầm giá đổi",
    // CORRECTED TWICE. It used to send the reader to "hai dòng" in the detail
    // panel, which holds only the CURRENT scenario's row. Naming both sides
    // here — as a result row of its own — is the answer; a note that points at
    // a row that does not exist is not.
    compareBindingLabel: "Điều chặn tầm giá: mốc → hiện tại",
    compareBindingChangedNote:
      "Điều chặn tầm giá đã đổi giữa hai bên, nên phần chênh lệch ở trên không chỉ là “mua được nhiều hay ít hơn”: hai bên đang bị chặn bởi hai thứ khác nhau. Dòng ngay trên nói rõ bên nào bị chặn bởi gì.",
    // Field labels for the changed-assumption list, by input key.
    compareKeyLabels: {
      mode: "Câu hỏi đang trả lời",
      monthlyIncome: "Thu nhập gộp mỗi tháng",
      monthlyNetIncome: "Thu nhập thực nhận mỗi tháng",
      essentialExpenses: "Chi phí sinh hoạt thiết yếu",
      monthlyBuffer: "Muốn để dành mỗi tháng",
      monthlyDebts: "Nợ đang trả mỗi tháng",
      downPayment: "Tiền đã tích lũy",
      cashReserve: "Quỹ dự phòng giữ lại",
      purchaseCostPercent: "Chi phí mua ngoài giá nhà",
      assumedMaxLtvPercent: "Giả định vay được tối đa",
      annualRatePercent: "Lãi suất",
      termMonths: "Kỳ hạn",
      monthlyHousingCosts: "Chi phí nhà ở khác mỗi tháng",
      housingRatioPercent: "Tỷ lệ trả nợ nhà",
      totalDebtRatioPercent: "Tỷ lệ tổng nợ",
    },
  },

  priceChart: {
    title: "Tầm giá đó gồm những gì",
    priceBar: "Tầm giá nhà",
    cashSegment: "Tiền của bạn",
    loanSegment: "Tiền vay",
    costsSegment: "Chi phí mua ngoài giá",
    otherCashBar: "Tiền không vào giá nhà",
    unusedCashSegment: "Còn lại chưa dùng",
    capacityBar: "Khoản vay bạn gánh được",
    usedCapacitySegment: "Đang dùng",
    unusedCapacitySegment: "Chưa dùng được vì thiếu tiền tự có",
    axis: "Số tiền ({unit})",
    summary:
      "Tầm giá {price} gồm {cash} tiền của bạn và {loan} tiền vay, theo lãi suất, kỳ hạn, chi phí mua và tỷ lệ vay bạn đang giả định. Hãy xem giới hạn đang chặn trước khi thay một giả định; đây không phải mức ngân hàng đã duyệt.",
    financingBoundNote:
      "Đang bị chặn bởi tiền tự có: khoản trả của bạn còn gánh được khoản vay lớn hơn.",
    costsExcludedNote: "Chưa trừ thuế và phí mua nhà.",
    limitedNote: "Chưa có chi phí sinh hoạt nên đây là giới hạn trên.",
    blockedReason:
      "Chưa có tầm giá nào khả thi: tiền dùng được để mua không đủ cho phần bạn phải tự có cộng chi phí mua.",
    blockedRecovery:
      "Kiểm tra tiền tự có sau khi giữ quỹ dự phòng và các chi phí thực tế. Bạn có thể cần tích lũy thêm hoặc tìm tầm giá thấp hơn. Chỉ thay tỷ lệ vay khi có căn cứ; không hạ chi phí hay dự phòng chỉ để kết quả đẹp hơn.",
    assumptions: [
      "Lãi suất giữ nguyên suốt kỳ hạn. Hãy nhập mức lãi sau ưu đãi, không phải mức ưu đãi năm đầu.",
      "Phần vay được là GIẢ ĐỊNH bạn nhập. Ngân hàng còn xét giá thẩm định và hồ sơ của bạn, nên hãy hỏi rồi nhập lại con số thật.",
      "Đây là mức để bắt đầu đi xem nhà, không phải mức ngân hàng đã đồng ý.",
    ],
    tableCaption: "Cấu phần của tầm giá",
    itemColumn: "Khoản",
    amountColumn: "Số tiền",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì với các số này chưa có tầm giá nào.",
    unavailableRecovery:
      "Hãy kiểm tra thu nhập, nợ đang trả và chi phí sinh hoạt — phần giải thích ngay dưới kết quả cho biết điều gì đang chặn.",
  },

  monthlyChart: {
    title: "Mỗi tháng tiền đi đâu",
    householdBar: "Thu nhập thực nhận",
    essentials: "Sinh hoạt thiết yếu",
    debts: "Nợ đang trả",
    buffer: "Để dành",
    // CORRECTED. This segment used to carry the whole housing BUDGET, so on a
    // cash-bound fixture it showed 17 triệu of "trả nợ nhà" and no headroom at
    // all, while the actual instalment was 13,81 triệu plus 2 triệu of other
    // housing costs. The ledger now holds the real outflow and the real
    // leftover, which is also what the headline rows say.
    housing: "Trả nợ nhà (khoản trả thực tế)",
    otherHousing: "Chi phí nhà ở khác",
    leftover: "Còn lại chưa dùng",
    ceilingBar: "Trần theo giả định của bạn",
    housingLimitBar: "Tỷ lệ trả nợ nhà",
    totalDebtLimitBar: "Tỷ lệ tổng nợ",
    axis: "Số tiền mỗi tháng ({unit})",
    summaryHousehold:
      "Đang bị chặn bởi {binding}: ngân sách nhà ở là {budget} mỗi tháng, và khoản trả thực tế của khoản vay ở tầm giá này là {payment}.",
    // Appended when the actual outflow does not use the whole budget.
    headroomNote:
      "Còn {headroom} mỗi tháng chưa dùng đến, vì tầm giá đang bị chặn bởi tiền tự có chứ không bởi khoản trả.",
    summaryCeiling:
      "Theo hai tỷ lệ bạn nhập, tối đa {payment} mỗi tháng cho khoản trả nhà.",
    bindingHousing: "tỷ lệ trả nợ nhà bạn giả định",
    bindingTotalDebt: "tỷ lệ tổng nợ bạn giả định",
    bindingHousehold: "ngân sách còn lại của hộ",
    infeasibleNote: "Với các số này hộ chưa còn chỗ cho khoản trả nhà.",
    limitedNote: "Chưa có chi phí sinh hoạt nên đây là giới hạn trên.",
    ceilingIsNotBudgetNote:
      "Trần theo tỷ lệ không phải ngân sách sống, và không phải mức ngân hàng đã đồng ý.",
    assumptions: [
      "Các khoản trên được trừ đúng một lần mỗi khoản: sinh hoạt, nợ đang trả, phần để dành, khoản trả nhà thực tế, chi phí nhà ở khác và phần còn lại cộng lại đúng bằng thu nhập thực nhận.",
      "Mảng “trả nợ nhà” là khoản trả THỰC TẾ của khoản vay ở tầm giá bên trên, không phải toàn bộ ngân sách nhà ở. Hai con số chỉ bằng nhau khi khoản trả là thứ đang chặn tầm giá.",
      "Chi phí nhà ở khác (phí quản lý, bảo hiểm tài sản) là một mảng riêng, vì nó không phải tiền trả nợ.",
      "Hai tỷ lệ là giả định bạn nhập để thử, không phải quy định và không phải mức ngân hàng công bố.",
    ],
    tableCaption: "Phân bổ thu nhập mỗi tháng",
    itemColumn: "Khoản",
    amountColumn: "Số tiền",
    unavailableReason: "Chưa vẽ được biểu đồ vì các số đã nhập chưa đủ.",
    unavailableRecovery:
      "Hãy nhập thu nhập thực nhận và chi phí sinh hoạt để thấy tiền mỗi tháng đi đâu.",
  },

  ratioNotice:
    "Các tỷ lệ và phần vay được ở đây là GIẢ ĐỊNH của bạn, không phải quy định và không phải mức ngân hàng đã đồng ý. Nếu ngân hàng của bạn nói con số khác, hãy nhập con số đó. Và chịu được theo công thức không có nghĩa là nên vay tới mức đó.",

  formula: {
    title: "Cách tính",
    body: [
      // CORRECTED. This paragraph used to call the first figure "TRẦN CỦA NGÂN
      // HÀNG" and the third said "ngân hàng sẵn sàng cho vay nhiều hơn mức hộ
      // trả được". Neither is something this page knows: both ratios are boxes
      // the reader fills in, and no bank has been asked anything.
      "Công cụ tính hai con số khác nhau và nói rõ con số nào đang chặn bạn. Thứ nhất là TRẦN THEO TỶ LỆ BẠN GIẢ ĐỊNH: giới hạn trả nợ nhà = thu nhập gộp × tỷ lệ trả nợ nhà, và giới hạn tổng nợ = thu nhập gộp × tỷ lệ tổng nợ − nợ đang trả. Hai tỷ lệ đó là ô bạn nhập, không phải quy định và không phải mức ngân hàng công bố. Trần là con số nhỏ hơn trong hai giới hạn; nó có thể âm, vì nợ hiện có được trừ ra.",
      "Thứ hai là NGÂN SÁCH CÒN LẠI CỦA HỘ, chỉ có trong chế độ “Hộ của tôi trả được bao nhiêu”: thu nhập thực nhận − chi phí sinh hoạt thiết yếu − nợ đang trả − khoản muốn để dành. Mỗi khoản được trừ đúng một lần, nên bốn khoản đó cộng với ngân sách nhà ở luôn đúng bằng thu nhập thực nhận.",
      "Ngân sách nhà ở mỗi tháng là con số NHỎ HƠN giữa trần theo tỷ lệ giả định và ngân sách còn lại của hộ. Với tình huống mặc định — thu nhập gộp 50 triệu, thực nhận 44 triệu, sinh hoạt 18 triệu, nợ 5 triệu, muốn để dành 3 triệu — trần theo tỷ lệ là 20 triệu nhưng hộ chỉ còn 18 triệu, nên chính hộ là giới hạn đang chặn. Đó cũng là điều đáng lưu ý: một công thức tỷ lệ cho ra con số cao hơn mức hộ thực sự trả được, và con số cao hơn đó không phải là điều ngân hàng đã đồng ý.",
      "Chi phí nhà ở khác được trừ khỏi ngân sách trước khi quy ra số tiền vay, nên phần còn lại mới là NGÂN SÁCH trả gốc và lãi. Khoản vay mà ngân sách đó gánh được là giá trị hiện tại của nó trong suốt kỳ hạn: P = A × (1 − (1 + r)^(−n)) ÷ r. Đây là phép nghịch chính xác của công thức niên kim, không phải một phép dò tìm.",
      "Tiền dùng được để mua = tiền tích lũy − quỹ dự phòng giữ lại, trừ đúng một lần. Chi phí mua nhà ngoài giá tính theo phần trăm của GIÁ, nên giá và chi phí được giải cùng nhau. Có HAI trần trên giá và công cụ lấy trần nhỏ hơn: theo khoản trả, giá ≤ (khoản vay gánh được + tiền dùng được) ÷ (1 + tỷ lệ chi phí); theo tiền tự có và giả định vay được, giá ≤ tiền dùng được ÷ (1 + tỷ lệ chi phí − tỷ lệ vay được). Trần thứ hai là lý do phần bạn tự bỏ ra không bao giờ âm, và là lý do khi không có tiền mà tỷ lệ chi phí lớn hơn 0 thì không có mức giá nào khả thi.",
      "Khoản vay thực dùng ở tầm giá đó = giá × (1 + tỷ lệ chi phí) − tiền dùng được, và nó có thể NHỎ HƠN khoản vay mà ngân sách gánh được — khi trần thứ hai là trần đang chặn. Vì vậy trang hiện hai con số theo tháng: ngân sách trả gốc và lãi, và khoản trả thực tế của khoản vay thực dùng. Chúng chỉ bằng nhau khi khoản trả là thứ đang chặn giá.",
      // CORRECTED, same seam as the two paragraphs above: the larger figure
      // comes from the reader's own ratio assumptions, not from a bank.
      "Với tình huống mặc định: ngân sách 18 triệu mỗi tháng gánh được khoản vay 2.074.155.117 ₫, cộng 600 triệu tiền tích lũy thành tầm giá 2.674.155.117 ₫, trong đó tiền trả trước chiếm 22,4%. Nếu chỉ xét trần theo hai tỷ lệ bạn giả định thì con số là 2.904.616.796 ₫ — cao hơn 230 triệu cho cùng một hộ, và con số cao hơn đó không phải mức ngân hàng đã đồng ý. Khoảng cách 230 triệu ấy chính là lý do công cụ tách hai chế độ.",
      "Khi ngân sách còn lại bằng 0 hoặc âm, công cụ trả về số tiền vay bằng 0 kèm ghi chú, thay vì một số âm hay một mức giá không có thật.",
    ],
    // A ratio ceiling is not a spendable budget, and the bigger figure is the
    // reader's own assumption rather than an approval. Both are emphasised.
    emphasis: [
      "Hai tỷ lệ đó là ô bạn nhập, không phải quy định và không phải mức ngân hàng công bố",
      "Ngân sách nhà ở mỗi tháng là con số NHỎ HƠN giữa trần theo tỷ lệ giả định và ngân sách còn lại của hộ",
      "con số cao hơn đó không phải là điều ngân hàng đã đồng ý",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao ngân hàng cho vay ít hơn con số này?",
        a: "Vì con số ở đây tính từ giả định của bạn, còn ngân hàng thẩm định theo hồ sơ thật. Ba chỗ hay lệch nhất: thu nhập được xét là thu nhập chứng minh được qua sao kê và hợp đồng lao động, thường thấp hơn thu nhập thực của hộ; mức trả tối thiểu của thẻ tín dụng và các khoản trả góp nhỏ đều được tính vào nợ hiện có, kể cả khi bạn luôn trả hết dư nợ thẻ; và phần được vay còn phụ thuộc giá thẩm định tài sản bảo đảm, chứ không phải giá bạn mua. Hãy hỏi ngân hàng cho vay bao nhiêu phần trăm giá nhà rồi nhập vào ô “Giả định vay được tối đa”.",
      },
      {
        q: "Tiền tích lũy nên để bao nhiêu cho trả trước?",
        a: "Không phải toàn bộ. Hãy giữ lại quỹ dự phòng bằng 3–6 tháng chi phí sinh hoạt cộng với khoản trả nợ, rồi mới nhập phần còn lại vào ô này. Ngoài ra còn thuế, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm và tiền hoàn thiện nội thất — những khoản này không nằm trong phép tính và thường lên tới vài phần trăm giá nhà.",
      },
      {
        q: "Kéo dài kỳ hạn để mua nhà đắt hơn có nên không?",
        a: "Nó làm được, nhưng đắt. Kéo từ 240 lên 360 tháng nâng số tiền vay lên đáng kể vì mỗi tháng gánh được khoản vay lớn hơn, nhưng tổng lãi tăng mạnh hơn nhiều — hãy dùng công cụ phân tích khoản vay của FinHome trên con số bạn vừa tính ra để thấy tổng lãi. Một cách nhiều người chọn: lấy kỳ hạn dài cho khoản trả nhẹ, rồi trả thêm gốc hằng tháng như thể kỳ hạn ngắn. Trước khi làm vậy hãy kiểm tra điều khoản phí trả nợ trước hạn trong hợp đồng.",
      },
      {
        q: "Chịu được 40% thu nhập nghe cao quá, có thật không?",
        // CORRECTED. The old last sentence — "Công cụ tính mức tối đa ngân
        // hàng chấp nhận, không tính mức khiến bạn ngủ được" — was written
        // before this page had two modes, and it contradicts both of them: the
        // ratio mode reports the READER's own assumed ratios, not a bank's
        // acceptance, and household mode is precisely the comfort question it
        // said the tool does not answer.
        a: "Về công thức thì đúng, về đời sống thì tùy. 40% của 50 triệu để lại 30 triệu cho mọi thứ khác, còn 40% của 20 triệu để lại 12 triệu — cùng một tỷ lệ, hai mức áp lực rất khác nhau. Hãy hạ tỷ lệ trong ô nhập xuống mức bạn thực sự thoải mái, chạy lại, và lấy con số đó làm mức nhắm. Cần nhớ hai điều: tỷ lệ ở đây là giả định của BẠN, không phải mức ngân hàng chấp nhận; và nếu bạn muốn câu hỏi “hộ của tôi sống thoải mái được ở mức nào”, hãy chọn chế độ ngân sách của hộ và nhập chi phí sinh hoạt thật — chế độ đó tính đúng câu hỏi đó, còn chế độ tỷ lệ thì không.",
      },
      {
        q: "Lãi suất thả nổi ảnh hưởng thế nào tới con số này?",
        a: "Rất nhiều, và đây là rủi ro lớn nhất không nằm trong kết quả. Công cụ giả định lãi suất không đổi cả kỳ hạn. Nếu bạn nhập mức ưu đãi 7% rồi lãi thả nổi lên 11%, khoản trả hằng tháng tăng khoảng một phần ba và có thể vượt ngân sách. Cách dùng an toàn: nhập mức lãi cao hơn mức hiện tại 2–3 điểm phần trăm, và lấy mức giá thấp hơn trong hai lần chạy.",
      },
    ],
  },
} as const;
