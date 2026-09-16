// Copy for /cong-cu/vay-mua-xe/ — the vehicle loan calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// ORIGINAL ROW 31 IS A HOME-BUYING QUESTION, and that is what the second half
// of this page now answers: "mua xe ảnh hưởng tiền mua nhà ra sao". The
// instalment is shown as a monthly obligation of the HOUSEHOLD, beside the
// month with and without it, because one income serves both. The loan
// arithmetic is unchanged.
//
// `depreciationNotice` is the honest caveat for this particular tool: a car
// loses value while the loan does not, so a buyer with a small deposit can owe
// more than the car is worth for a good part of the term. The reference tool
// does not say this; we should.
//
// TWO CLAIMS WERE REMOVED FROM THIS FILE, both about what banks do:
// "Ngân hàng thường yêu cầu tối thiểu 20–30% giá xe" appeared in the deposit
// field's help and again in the FAQ. Nobody here has read a Vietnamese auto
// lender's terms, the suite's copy rule forbids an unverified population claim
// or any statement that a bank lends, allows or approves an amount, and the
// deposit is the reader's own figure either way. The replacement points at the
// reader's own quote.
//
// Figures quoted below come from running the modules on this page's own
// defaults (800 triệu giá xe, 300 triệu trả trước, 100 triệu xe cũ, 10%/năm,
// 60 tháng; NET 40 triệu, thiết yếu 22 triệu, nợ khác 3 triệu, để dành
// 3 triệu): vay 400 triệu, trả 8.498.818 ₫/tháng, tổng lãi 109.929.073 ₫,
// còn 12.000.000 ₫ mỗi tháng trước khi mua xe và 3.501.182 ₫ sau khi mua.
// Re-run the modules if a default moves; do not adjust these by hand.

export const AUTO_LOAN = {
  slug: "/cong-cu/vay-mua-xe",

  pageTitle: "Mua xe ảnh hưởng tiền mua nhà ra sao?",
  metaTitle: "Tính khoản vay mua xe — Trả hằng tháng và ngân sách hộ",
  metaDescription:
    "Nhập giá xe, tiền trả trước, lãi suất và kỳ hạn để biết khoản trả hằng tháng, rồi xem ngân sách mỗi tháng của hộ có và không có khoản vay xe đó. Công cụ miễn phí của FinHome.",

  lede:
    "Khoản trả xe và khoản trả nhà cùng lấy từ một dòng thu nhập. Trang này tính khoản trả hằng tháng của khoản vay mua xe, rồi đặt nó vào ngân sách tháng của hộ để bạn thấy còn lại bao nhiêu trước và sau khi mua.",

  form: {
    vehicleGroup: "Xe và tiền trả trước",
    priceLabel: "Giá xe",
    priceUnit: "₫",
    priceHelp: "Giá lăn bánh, đã gồm thuế và phí đăng ký.",
    priceInvalid: "Vui lòng nhập giá xe lớn hơn 0.",
    defaultPrice: "800.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp:
      "Tiền mặt bạn trả ngay. Mức tối thiểu tùy hợp đồng của từng nơi cho vay — hãy nhập theo báo giá bạn đang có.",
    downInvalid: "Tiền trả trước không được là số âm.",
    defaultDown: "300.000.000",

    tradeInGroup: "Đổi xe cũ (tùy chọn)",
    tradeInGroupEmpty:
      "Chưa nhập giá trị xe cũ, nên số tiền vay đang tính từ giá xe trừ tiền trả trước.",
    tradeInLabel: "Giá trị xe cũ thu lại",
    tradeInUnit: "₫",
    tradeInHelp:
      "Số tiền được trừ khi đổi xe cũ. Để 0 nếu không đổi xe — khi đó ô này không ảnh hưởng kết quả.",
    tradeInInvalid: "Giá trị xe cũ không được là số âm.",
    defaultTradeIn: "100.000.000",

    loanGroup: "Điều kiện vay",
    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm theo báo giá của bạn, ví dụ 9,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "10",

    termLabel: "Kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Nhập theo kỳ hạn trong báo giá của bạn.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "5",

    resultTitle: "Khoản vay xe",
    financedLabel: "Số tiền phải vay",
    downPercentLabel: "Tỷ lệ trả trước",
    monthlyLabel: "Trả hằng tháng",
    totalInterestLabel: "Tổng lãi phải trả",
    totalPaymentLabel: "Tổng số tiền trả cho khoản vay",
    // NOT "tổng chi phí sở hữu xe": this figure is trả trước + xe cũ + cả
    // khoản vay, and it excludes running costs and depreciation entirely. An
    // independent review found 909.929.073 ₫ labelled as the cost of OWNING
    // the car, with the exclusion only in a collapsed FAQ. The scope is now in
    // the label and in the help line beside the figure.
    totalCostLabel: "Tổng tiền mua và vay (chưa tính vận hành)",
    totalCostHelp:
      "Tiền trả trước + giá trị xe cũ + toàn bộ số tiền trả cho khoản vay. Đây là chi phí MUA và VAY, không phải chi phí sở hữu: chưa có nhiên liệu, bảo hiểm, bảo dưỡng, phí đường bộ, và chưa trừ phần xe mất giá.",
    termResultLabel: "Số tháng trả nợ",
    monthsUnit: "tháng",

    nothingToFinanceNotice:
      "Tiền trả trước và giá trị xe cũ đã bằng hoặc vượt giá xe, nên không cần vay. Đây là phương án mua thẳng: khoản trả nợ xe bằng 0, và ngân sách tháng bên dưới so đúng như vậy. Hãy giảm một trong hai số đó nếu bạn muốn xem phương án vay.",

    // ---------------------------------------------------- the household month
    householdGroup: "Ngân sách tháng của hộ",
    // This line used to read "Bốn con số dưới đây là của bạn, không phải giả
    // định của công cụ" — beside four prefilled figures nobody had entered. A
    // review found it on the live page. `ExampleNotice` now carries the state
    // and this line no longer claims whose numbers these are.
    householdIntro:
      "Bốn con số dưới đây quyết định câu trả lời thật: sau khi trả nợ xe, mỗi tháng hộ còn lại bao nhiêu để dành cho nhà. Các ô đang điền sẵn một ví dụ — hãy thay bằng số của bạn.",

    netIncomeLabel: "Thu nhập thực nhận của hộ",
    netIncomeUnit: "₫/tháng",
    netIncomeHelp:
      "Số tiền THỰC VỀ tài khoản mỗi tháng, đã trừ thuế và bảo hiểm, cộng cả hai người nếu cùng lo tài chính.",
    netIncomeInvalid: "Vui lòng nhập thu nhập thực nhận lớn hơn 0.",
    defaultNetIncome: "40.000.000",

    essentialsLabel: "Chi phí thiết yếu mỗi tháng",
    essentialsUnit: "₫/tháng",
    essentialsHelp:
      "Ăn uống, điện nước, học phí, đi lại, y tế. KHÔNG tính khoản trả nợ và không tính chi phí của chiếc xe này. Để trống nếu bạn chưa biết — công cụ sẽ nói rõ là chưa biết, chứ không coi bằng 0.",
    essentialsInvalid: "Vui lòng nhập một số từ 0 trở lên, hoặc để trống.",
    defaultEssentials: "22.000.000",

    otherDebtsLabel: "Nợ khác đang trả mỗi tháng",
    otherDebtsUnit: "₫/tháng",
    otherDebtsHelp:
      "Mọi khoản trả nợ hiện có TRỪ chiếc xe này: thẻ tín dụng, trả góp, khoản vay khác. Đừng nhập lại khoản trả xe ở đây, nó đã được tính một lần ở trên.",
    otherDebtsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultOtherDebts: "3.000.000",

    reserveLabel: "Để dành đều mỗi tháng",
    reserveUnit: "₫/tháng",
    reserveHelp:
      "Số tiền bạn muốn tiếp tục để dành bất kể có mua xe hay không — quỹ dự phòng hoặc quỹ mua nhà.",
    reserveInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultReserve: "3.000.000",

    runningLabel: "Chi phí vận hành xe mỗi tháng",
    runningUnit: "₫/tháng",
    runningHelp:
      "Nhiên liệu, bảo hiểm, bảo dưỡng, đỗ xe, phí đường bộ. Để 0 nếu bạn chưa muốn tính — công cụ sẽ ghi rõ là chưa tính, chứ không tự ước lượng.",
    runningInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRunning: "0",

    budgetTitle: "Mỗi tháng còn lại bao nhiêu",
    withoutCarLabel: "Trước khi mua xe, còn lại",
    withCarLabel: "Sau khi mua xe, còn lại",
    gapLabel: "Chênh lệch giữa hai phương án",
    shortfallLabel: "Thiếu mỗi tháng",
    committedLabel: "Đã cam kết mỗi tháng (chưa tính xe)",
    vehicleCostLabel: "Chi phí xe mỗi tháng",

    budgetLimitedNotice:
      "Bạn chưa nhập chi phí thiết yếu, nên hai con số “còn lại” chỉ là thu nhập trừ những khoản đã nhập — chưa phải một ngân sách. Hãy nhập chi phí thiết yếu để chúng có nghĩa.",
    shortfallNotice:
      "Sau khi trả nợ xe, tháng của hộ không cân: các khoản đã nhập lớn hơn thu nhập thực nhận. Công cụ hiển thị số âm đúng như vậy chứ không làm tròn về 0.",
    shortfallBeforeNotice:
      "Các khoản bạn đã nhập đã lớn hơn thu nhập thực nhận ngay khi CHƯA có xe, nên phép so hai phương án chưa có ý nghĩa. Hãy kiểm tra lại thu nhập, chi phí thiết yếu và nợ khác.",
    // Two versions, because the claim "the after figure is higher than
    // reality" needs an after figure to exist. With the instalment unknown
    // the exclusion is still worth stating, but nothing can be said about a
    // number that was withheld.
    runningExcludedNotice:
      "Chi phí vận hành xe đang là 0 vì bạn chưa nhập, nên con số “sau khi mua xe” chỉ trừ khoản trả nợ — tức nó đang CAO HƠN thực tế. Nhiên liệu, bảo hiểm, bảo dưỡng và phí đỗ xe đều là tiền ra thật.",
    runningExcludedUnknownNotice:
      "Chi phí vận hành xe đang là 0 vì bạn chưa nhập. Nhiên liệu, bảo hiểm, bảo dưỡng và phí đỗ xe đều là tiền ra thật và sẽ được trừ thêm khi bạn nhập vào.",
    // The with-car leg is WITHHELD, not zeroed, when the loan cannot be
    // priced. Passing 0 in that state turned an invalid rate into a free car
    // on the live page — see `vehicle-budget.ts`'s docstring.
    paymentUnknownNotice:
      "Chưa tính được khoản trả nợ xe, nên phần “sau khi mua xe” và phần chênh lệch đang để trống thay vì hiển thị 0 — một khoản trả chưa tính được không phải một chiếc xe miễn phí. Hãy sửa các ô giá xe, lãi suất và kỳ hạn ở trên; con số “trước khi mua xe” vẫn dùng được.",
  },

  table: {
    caption: "Bảng trả nợ theo từng năm",
    intro:
      "Mỗi dòng là một năm. Với khoản vay mua xe kỳ hạn ngắn, tỷ lệ trả gốc tăng nhanh hơn so với vay mua nhà.",
    yearColumn: "Năm",
    interestColumn: "Lãi trả trong năm",
    principalColumn: "Gốc trả trong năm",
    balanceColumn: "Dư nợ cuối năm",
  },

  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Ngân sách tháng: trước và sau khi mua xe",
    axis: "Số tiền mỗi tháng ({unit})",
    assumptions: [
      "Các ô đang điền sẵn một ví dụ. Hình này vẽ lại đúng những gì đang nằm trong ô — chưa phải phân tích cho hoàn cảnh của bạn cho tới khi bạn thay số.",
      "Khoản trả nợ xe được trừ MỘT lần, chỉ ở thanh “sau khi mua xe”.",
      "Lãi suất và kỳ hạn được giả định không đổi suốt kỳ hạn. Đó là một giả định để tính, không phải một cam kết của ai.",
      "Đây là dòng tiền hằng tháng. Nó không nói gì về khả năng được vay, và cũng không phải câu trả lời đầy đủ cho tầm giá nhà.",
    ],
    tableCaption: "Từng khoản trong ba thanh",
    itemColumn: "Khoản",
    amountColumn: "Mỗi tháng",
    tableHint:
      "Thanh đầu là thu nhập thực nhận, dùng làm mốc. Hai thanh sau là PHÂN BỔ của cùng số thu nhập đó: các khoản chi, cộng phần còn lại khi còn. Khi một thanh phân bổ DÀI HƠN thanh thu nhập, phần dài thêm chính là khoản thiếu — lúc đó không có “còn lại”, và công cụ không cắt bớt khoản chi nào để hai thanh bằng nhau.",
    unavailableReason: "Chưa đủ dữ liệu về ngân sách tháng để vẽ hình này.",
    unavailableRecovery:
      "Hãy nhập thu nhập thực nhận và chi phí thiết yếu của hộ.",
    unknownReason:
      "Chưa tính được khoản trả nợ xe, nên chưa có phương án “sau khi mua xe” để so.",
    unknownRecovery:
      "Hãy sửa giá xe, lãi suất và kỳ hạn ở trên. Công cụ không vẽ khoản trả xe bằng 0 khi chưa tính được.",
    brokenReason:
      "Các khoản đã nhập đã lớn hơn thu nhập thực nhận ngay khi chưa có xe, nên phép so hai phương án chưa có ý nghĩa.",
    brokenRecovery:
      "Hãy kiểm tra lại thu nhập thực nhận, chi phí thiết yếu, nợ khác và mức để dành.",
    incomeBar: "Thu nhập thực nhận",
    // NOT "tiền ra": these bars include the leftover segment, so at 30 triệu
    // net income the "chưa mua xe" bar totals 30 triệu of which 2 triệu is
    // money NOT going out. A review found that label asserting 30 triệu of
    // outflow. "Phân bổ" covers both the spending and the remainder.
    withoutBar: "Phân bổ — chưa mua xe",
    withBar: "Phân bổ — sau khi mua xe",
    essentials: "Chi phí thiết yếu",
    otherDebts: "Nợ khác đang trả",
    reserve: "Để dành đều",
    payment: "Trả nợ xe",
    running: "Vận hành xe",
    leftover: "Còn lại",
    shortfallRow: "Thiếu mỗi tháng",
    summaryBalanced:
      "Thu nhập thực nhận {income} mỗi tháng. Chưa mua xe thì còn {without}; sau khi mua còn {with}. Khoảng cách đúng bằng chi phí xe mỗi tháng: {gap}.",
    summaryShortfall:
      "Thu nhập thực nhận {income} mỗi tháng. Chưa mua xe thì còn {without}; sau khi mua thì THIẾU {shortfall} — thanh tiền ra dài hơn thanh thu nhập đúng bằng khoản thiếu đó. Khoảng cách giữa hai phương án vẫn đúng bằng chi phí xe mỗi tháng: {gap}.",
    limitedNote:
      "Chưa nhập chi phí thiết yếu, nên đây chưa phải một ngân sách.",
    runningExcludedNote:
      "Chưa tính chi phí vận hành xe, nên phần còn lại “sau khi mua xe” đang CAO HƠN thực tế.",
    upfrontNote:
      "Tiền trả trước và giá trị xe cũ KHÔNG nằm trong bảng này: chúng là tài sản, và tiền đã đưa cho chiếc xe thì không còn để trả trước cho căn nhà.",
  },

  depreciationNotice:
    "Một điều công cụ này không tính được: xe mất giá trong khi khoản nợ thì không. Nếu bạn trả trước ít và vay kỳ hạn dài, sẽ có một khoảng thời gian dư nợ còn lớn hơn giá trị chiếc xe — nghĩa là bán xe cũng không đủ trả hết nợ. Trả trước nhiều hơn và chọn kỳ hạn ngắn hơn sẽ thu hẹp khoảng đó.",

  scopeNoticeTitle: "Hai con số “còn lại” nói gì và không nói gì",
  scopeNotice:
    "Hai con số “còn lại” ở đây là dòng tiền mỗi tháng, không phải kết luận về khả năng mua nhà và không phải đánh giá của bất kỳ nơi cho vay nào. Chúng cũng chưa trừ chi phí vận hành xe nếu bạn để 0, và chưa tính việc tiền trả trước cho xe làm vốn tự có mua nhà ít đi.",

  formula: {
    title: "Công thức tính",
    body: [
      "Số tiền phải vay bằng giá xe trừ tiền trả trước và trừ giá trị xe cũ thu lại. Đây là con số mà lãi được tính trên đó, không phải giá xe. Với mặc định: 800 − 300 − 100 = 400 triệu.",
      "Khoản trả hằng tháng tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), với P là số tiền vay, r là lãi suất mỗi tháng và n là số tháng vay. Với 400 triệu, 10%/năm và 60 tháng, con số là 8.498.818 ₫ mỗi tháng và 109.929.073 ₫ tổng lãi.",
      "Ngân sách tháng là một phép cộng trừ thẳng: thu nhập thực nhận trừ chi phí thiết yếu, trừ nợ khác, trừ mức để dành — đó là cột “chưa mua xe”. Cột “sau khi mua xe” trừ thêm khoản trả nợ xe và chi phí vận hành nếu bạn nhập. Với mặc định: 40 − 22 − 3 − 3 = 12 triệu, rồi 12 − 8,50 = 3.501.182 ₫.",
      "Khoản trả xe được trừ đúng MỘT lần. Vì vậy ô “nợ khác đang trả” phải là mọi khoản nợ TRỪ chiếc xe này — nhập lại nó ở đó sẽ trừ hai lần và tạo ra một khoản thiếu không có thật. Chênh lệch giữa hai cột luôn đúng bằng chi phí xe mỗi tháng.",
      "Tiền trả trước và giá trị xe cũ không xuất hiện trong bảng tháng, vì chúng không phải dòng tiền hằng tháng. Nhưng chúng là tiền thật: 300 triệu đưa cho chiếc xe là 300 triệu không còn nằm trong vốn tự có mua nhà. Đó là một cái giá riêng, ngoài khoản trả hằng tháng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên trả trước bao nhiêu?",
        a: "Công cụ không đặt một mức nào là đúng, và cũng không nói nơi cho vay yêu cầu bao nhiêu — mức tối thiểu nằm trong hợp đồng bạn được chào, không nằm ở đây. Điều công cụ cho thấy là hệ quả: trả trước nhiều hơn thì vay ít hơn, trả hằng tháng ít hơn, tổng lãi thấp hơn, và khoảng thời gian dư nợ lớn hơn giá trị xe ngắn hơn. Đổi lại, số tiền đó rời khỏi vốn tự có mua nhà ngay hôm nay. Hãy thử vài mức và đọc cả hai phần kết quả.",
      },
      {
        q: "Vì sao kỳ hạn dài lại đắt hơn dù trả hằng tháng ít hơn?",
        a: "Vì bạn trả lãi trong nhiều tháng hơn, và dư nợ giảm chậm hơn nên lãi tính trên số dư lớn hơn trong thời gian dài hơn. Hãy nhập cùng một khoản vay với kỳ hạn 3 năm và 7 năm để thấy chênh lệch tổng lãi. Kỳ hạn dài cũng đồng nghĩa nghĩa vụ hằng tháng đó còn chiếm chỗ trong ngân sách của hộ lâu hơn, đúng vào những năm bạn đang tích lũy tiền mua nhà.",
      },
      {
        q: "Hai con số “còn lại” có nghĩa là tôi mua được nhà hay không?",
        a: "Không. Đó là dòng tiền còn lại mỗi tháng theo đúng những gì bạn nhập — không phải tầm giá nhà, không phải hạn mức được vay và không phải đánh giá của bất kỳ nơi cho vay nào. Tầm giá nhà còn phụ thuộc vốn tự có, lãi suất, kỳ hạn và chi phí giao dịch; công cụ “Khả năng mua nhà” tính riêng phần đó, và ở đó khoản trả xe được nhập vào ô nợ khác của hộ.",
      },
      {
        q: "Tổng chi phí sở hữu xe gồm những gì?",
        a: "Trong công cụ này, đó là tiền trả trước cộng giá trị xe cũ cộng tổng số tiền trả cho khoản vay. Chưa gồm chi phí vận hành như bảo hiểm, đăng kiểm, bảo dưỡng, nhiên liệu và phí đường bộ — bạn có thể nhập ước lượng của mình vào ô “chi phí vận hành xe mỗi tháng” để nó vào bảng ngân sách, còn nếu để 0 thì công cụ ghi rõ là chưa tính.",
      },
      {
        q: "Lãi suất vay mua xe có giống vay mua nhà không?",
        a: "Hai khoản vay có cấu trúc khác nhau: kỳ hạn xe ngắn hơn và tài sản bảo đảm mất giá theo thời gian. Mức lãi cụ thể thì tùy báo giá bạn nhận được, nên hãy nhập đúng con số trong báo giá của mình. Nếu báo giá có lãi ưu đãi rồi chuyển sang thả nổi, hãy hỏi mức lãi sau ưu đãi và tính lại với mức đó — khoản trả hằng tháng khi ấy là con số sẽ nằm trong ngân sách của hộ phần lớn kỳ hạn.",
      },
    ],
  },
} as const;
