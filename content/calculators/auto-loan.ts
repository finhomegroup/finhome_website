// Copy for /cong-cu/vay-mua-xe/ — the vehicle loan calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// THIS IS A CAR PAGE, and it stops at the car. It answers three questions about
// one vehicle purchase: what the loan costs each month, what it costs in
// interest over the term, and what the household has left each month once the
// car is paid for. An earlier version framed that third answer as "mua xe ảnh
// hưởng tiền mua nhà ra sao"; the user's direction on 2026-09-26 was "xe là
// xe, không cần đề cập đến nhà cửa", so no visible string here names a house,
// a home purchase or a home deposit — `auto-loan.test.ts` sweeps for it. The
// household month stays, because it is the useful half of the answer, and the
// loan arithmetic is unchanged.
//
// `depreciationNotice` distinguishes the remaining debt from resale value.
// The engine models repayment, not vehicle depreciation, so negative equity
// is a possibility to explain, not an outcome this calculator can predict.
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

  pageTitle: "Tính khoản vay mua xe",
  metaTitle:
    "Tính khoản vay mua xe — Trả hằng tháng, tổng lãi và ngân sách còn lại",
  metaDescription:
    "Nhập giá xe, tiền trả trước, lãi suất và kỳ hạn để biết mỗi tháng trả bao nhiêu, tổng lãi là bao nhiêu và ngân sách tháng còn lại bao nhiêu sau khi mua xe. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập giá xe, tiền trả trước, lãi suất và kỳ hạn. Công cụ cho biết mỗi tháng bạn trả bao nhiêu và tổng lãi của khoản vay là bao nhiêu, rồi đặt khoản trả đó vào ngân sách tháng để bạn thấy còn lại bao nhiêu sau khi mua xe.",

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
    rateHelp:
      // Qualified 2026-09-26 (independent review finding 9): one rate for the
      // whole loan is a constant-rate scenario, not the payment a lender
      // recomputes on the remaining balance after a promotion ends.
      "Mức lãi theo năm ghi trong báo giá của bạn, ví dụ 9,5 nghĩa là 9,5% một năm. Công cụ giữ một mức lãi này suốt kỳ hạn, nên kết quả là một kịch bản lãi cố định. Nếu báo giá có lãi ưu đãi rồi thả nổi, hãy chạy thêm một lần với mức sau ưu đãi để thấy kịch bản đó; muốn thấy khoản trả được tính lại trên dư nợ còn lại khi đổi lãi, hãy dùng công cụ Khoản vay lãi thả nổi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "10",

    termLabel: "Kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp:
      "Nhập theo kỳ hạn trong báo giá của bạn. Có thể nhập số năm lẻ; công cụ hỗ trợ từ 1 đến 1.200 tháng (100 năm) — giới hạn của công cụ, không phải kỳ hạn tối đa của ngân hàng.",
    termInvalid: "Nhập kỳ hạn lớn hơn 0 mà khi quy ra (làm tròn) được từ 1 đến 1.200 tháng.",
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
      "Bốn con số dưới đây quyết định câu trả lời thật: sau khi trả nợ xe, mỗi tháng bạn còn lại bao nhiêu. Các ô đang điền sẵn một ví dụ — hãy thay bằng số của bạn.",

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
      "Số tiền bạn muốn tiếp tục để dành bất kể có mua xe hay không — quỹ dự phòng hoặc một mục tiêu tiết kiệm khác của bạn.",
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

    /**
     * The semantic result card — 2026-09-27, the plan's second pilot.
     *
     * A CAR TOOL'S WORDS. Nothing here mentions a home: the question is
     * whether the month still balances once this vehicle is paid for. The
     * amounts are ROUNDED in these sentences; the exact đồng figure is the
     * live row directly beneath the card. The notices above are the card's
     * reasons rather than a second copy of them.
     *
     * "Còn dư" is scoped twice — to the saving already set aside, and to the
     * figures entered — because a positive remainder is not a lending
     * decision and not advice that the car is a good buy.
     */
    statusLabels: {
      shortfall: "Thiếu ngân sách",
      met: "Còn dư theo số bạn nhập",
      caution: "Cần lưu ý",
      unknown: "Chưa kết luận",
    },
    statusShortTitle: "Sau khi mua xe, ngân sách thiếu khoảng {shortfall} mỗi tháng.",
    statusShortBeforeTitle:
      "Ngân sách tháng đã thiếu khoảng {before} ngay trước khi mua xe.",
    statusShortBeforeFact:
      "Tính thêm khoản trả và chi phí xe, mỗi tháng thiếu khoảng {shortfall}; phần thiếu không đến hoàn toàn từ chiếc xe.",
    statusSurplusTitle:
      "Sau khi trả nợ và chi phí xe, còn khoảng {surplus} mỗi tháng, ngoài khoản để dành đã nhập.",
    statusMetNote:
      "Đây là dòng tiền theo đúng những gì bạn nhập, không phải kết luận rằng bạn được vay hay chiếc xe này là lựa chọn tốt.",
    statusExactZeroTitle:
      "Ngân sách vừa khớp; chưa có phần dư ngoài khoản để dành đã nhập.",
    statusRunningExcludedTitle:
      "Sau khi trả nợ xe, còn khoảng {surplus} mỗi tháng — nhưng chưa tính chi phí vận hành.",
    statusLimitedTitle: "Chưa kết luận: chưa có chi phí sinh hoạt thiết yếu.",
    statusPaymentUnknownTitle: "Chưa kết luận: chưa tính được khoản trả nợ xe.",
    statusUnknownTitle: "Chưa kết luận: có ô ngân sách của hộ chưa hợp lệ.",
    statusUnknownReason:
      "Hãy kiểm tra thu nhập thực nhận, chi phí thiết yếu, nợ khác, khoản để dành và chi phí vận hành: mỗi ô cần một số từ 0 trở lên, và thu nhập phải lớn hơn 0.",
    /**
     * A longer term is NOT offered as a lever on its own: it lowers the
     * monthly payment and raises the total interest, so the sentence says
     * both and points at where the total is shown.
     */
    statusTryShort:
      "Hãy thử giá xe thấp hơn, mức trả trước khác hoặc chi phí vận hành sát thực tế. Nếu vẫn dùng khoản vay có lãi, kỳ hạn dài hơn làm khoản trả mỗi tháng giảm nhưng tổng lãi tăng — hãy xem tổng lãi ở phần chi tiết khoản vay trước khi chọn.",
    statusTryRunning:
      "Hãy nhập chi phí vận hành sát thực tế để biết phần còn lại thật mỗi tháng.",
    /** Jumps to this page's own fields. They move focus and change nothing. */
    statusActions: {
      price: "Giá xe",
      down: "Tiền trả trước",
      running: "Chi phí vận hành",
      essentials: "Chi phí thiết yếu",
    },
  },

  table: {
    caption: "Bảng trả nợ theo từng năm",
    intro:
      "Mỗi dòng là một năm: cột “Gốc trả trong năm” là phần làm dư nợ giảm, cột “Lãi trả trong năm” là tiền trả cho việc được vay. Kỳ hạn càng ngắn thì dư nợ về 0 càng sớm, và với cùng một mức lãi dương, tổng lãi càng thấp.",
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
      "Đây là dòng tiền hằng tháng theo đúng những gì bạn nhập. Nó không nói gì về việc bạn có được vay hay không.",
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
      "Tiền trả trước và giá trị xe cũ KHÔNG nằm trong bảng này: chúng là tiền bỏ ra một lần lúc mua, không phải khoản chi hằng tháng.",
    // The status annotations on the "sau khi mua xe" bar — 2026-09-27.
    shortfallMark: "Thiếu",
    surplusMark: "Phần dư",
  },

  depreciationNotice:
    "Ngoài khoản trả mỗi tháng, hãy cân nhắc số tiền còn nợ nếu bạn cần bán xe sớm. Giá xe có thể giảm nhanh hơn số nợ còn lại, khiến tiền bán xe không đủ trả hết nợ. Công cụ này tính lịch trả nợ, chưa ước tính giá bán lại hay mức mất giá của xe.",

  scopeNoticeTitle: "Hai con số “còn lại” nói gì và không nói gì",
  scopeNotice:
    "Hai con số “còn lại” ở đây là dòng tiền mỗi tháng theo đúng những gì bạn nhập, không phải đánh giá của bất kỳ nơi cho vay nào về việc bạn có được vay hay không. Chúng cũng chưa trừ chi phí vận hành xe nếu bạn để 0, và chưa tính phần xe mất giá theo thời gian.",

  // The page's own next actions, all about the car. They cannot go through
  // `TOOL_NEXT_STEPS`: that file's test requires every destination to be a
  // P1/P2 tool on the home-buying path, and both of these are car pages off
  // it (`thue-mua-xe` is P4, `chi-phi-nhien-lieu` P3). The guard exists to
  // keep a mortgage funnel off pages like this one, so — as `thue-mua-xe`
  // does — the links are content the route resolves through the registry,
  // and a slug that stops being live fails the build instead of shipping a
  // dead link the page told the reader to follow.
  relatedTools: {
    title: "Tiếp theo cho chiếc xe này",
    intro:
      "Không có con số nào được mang sang trang khác — ở đó bạn nhập lại chiếc xe và điều kiện của mình.",
    // `newTab` only where the reader comes BACK with a figure: the fuel
    // estimate feeds the running-costs field, and a same-tab trip there and
    // Back was observed to return this form to its example (journey review
    // 2026-09-30, step 5). A new tab keeps the original form in memory.
    items: [
      {
        slug: "thue-mua-xe",
        why: "Thuê tài chính cùng chiếc xe này thì mỗi tháng trả bao nhiêu, và hết hạn bạn có sở hữu xe không?",
        newTab: false,
      },
      {
        slug: "chi-phi-nhien-lieu",
        why: "Tiền nhiên liệu cho quãng đường bạn đi là bao nhiêu mỗi chuyến và mỗi tháng — để điền vào ô chi phí vận hành ở trên?",
        newTab: true,
      },
    ],
  },

  /**
   * The visible name of the header link to `/cong-cu/`, on this page only.
   * The shared "Quay lại" read as "back to the article I came from" for a
   * reader arriving from the guide; the destination is the catalogue.
   */
  hubLinkLabel: "Tất cả công cụ",

  /** Tool → explanation (journey review step 6), through `EducationLink`. */
  explainer: {
    href: "/blog/vay-mua-xe-con-du-bao-nhieu/",
    label: "Xem cách đọc kết quả qua một ví dụ",
    why: "bài viết đi qua một gia đình giả định: tiền trả góp, tiền nuôi xe và phần còn lại mỗi tháng.",
  },

  /**
   * PUBLIC NAMED EXAMPLES, opened by an exact URL fragment such as
   * `/cong-cu/vay-mua-xe/#vi-du-bai-vay-mua-xe`. The fragment is an ID, never
   * a figure: no income or amount travels in a link, and an unknown fragment
   * is ignored. Loaded only into an untouched form; otherwise the reader is
   * asked. Fictional household — the guide's own fixture, whose results
   * `content/auto-education.test.ts` checks against the engines
   * (8.498.818 ₫ a month, 501.182 ₫ left).
   */
  namedExamples: {
    "vi-du-bai-vay-mua-xe": {
      articleHref: "/blog/vay-mua-xe-con-du-bao-nhieu/",
      articleTitle: "Vay mua xe: trả góp xong, mỗi tháng còn bao nhiêu?",
      values: {
        price: "700.000.000",
        down: "300.000.000",
        tradeIn: "0",
        rate: "10",
        term: "5",
        termUnit: "years",
        netIncome: "40.000.000",
        essentials: "22.000.000",
        otherDebts: "3.000.000",
        reserve: "3.000.000",
        running: "3.000.000",
      },
    },
  },
  namedExample: {
    badge: "Ví dụ trong bài",
    /** `{title}` is the article's title. */
    note: "Gia đình giả định của bài “{title}”, không phải số của bạn.",
    readLabel: "Đọc bài",
    offer:
      "Liên kết bạn mở có ví dụ trong bài viết. Các ô đang giữ số bạn đã nhập, nên công cụ chưa thay số nào.",
    offerApply: "Thay bằng ví dụ trong bài",
    offerKeep: "Giữ số đang nhập",
  },

  formula: {
    title: "Công thức tính",
    body: [
      "Số tiền phải vay bằng giá xe trừ tiền trả trước và trừ giá trị xe cũ thu lại. Đây là con số mà lãi được tính trên đó, không phải giá xe. Với mặc định: 800 − 300 − 100 = 400 triệu.",
      "Khoản trả hằng tháng tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), với P là số tiền vay, r là lãi suất mỗi tháng và n là số tháng vay. Với 400 triệu, 10%/năm và 60 tháng, con số là 8.498.818 ₫ mỗi tháng và 109.929.073 ₫ tổng lãi.",
      "Ngân sách tháng là một phép cộng trừ: thu nhập thực nhận trừ chi phí thiết yếu, nợ khác và mức để dành — đó là cột “chưa mua xe”. Cột “sau khi mua xe” trừ thêm khoản trả nợ xe và chi phí vận hành nếu bạn nhập. Trong ví dụ điền sẵn, 40 − 22 − 3 − 3 = 12 triệu còn lại trước khi mua. Trừ khoảng 8,5 triệu trả nợ xe, bạn còn khoảng 3,5 triệu mỗi tháng; số chính xác là 3.501.182 ₫, chưa trừ chi phí vận hành vì ô đó đang là 0.",
      "Khoản trả xe được trừ đúng MỘT lần. Vì vậy ô “nợ khác đang trả” phải là mọi khoản nợ TRỪ chiếc xe này — nhập lại nó ở đó sẽ trừ hai lần và tạo ra một khoản thiếu không có thật. Chênh lệch giữa hai cột luôn đúng bằng chi phí xe mỗi tháng.",
      "Tiền trả trước và giá trị xe cũ không xuất hiện trong bảng tháng, vì chúng không phải dòng tiền hằng tháng. Nhưng chúng là tiền thật, bỏ ra một lần lúc mua: 300 triệu đưa cho chiếc xe là 300 triệu không còn trong tài khoản của bạn. Đó là một cái giá riêng, ngoài khoản trả hằng tháng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên trả trước bao nhiêu?",
        a: "Hãy thử vài mức trả trước và xem cả tiền trả ngay lẫn khoản trả mỗi tháng. Với cùng giá xe, kỳ hạn và cách trả, trả trước nhiều hơn thì vay ít hơn và khoản trả hằng tháng thấp hơn; tổng lãi cũng thấp hơn nếu lãi suất dương. Đổi lại, bạn còn ít tiền mặt hơn cho chi tiêu và dự phòng. Mức trả trước tối thiểu cần đối chiếu với báo giá hoặc hợp đồng của nơi cho vay. Công cụ chưa ước tính giá bán lại của xe, nên không cho biết khi nào tiền bán xe sẽ đủ trả hết dư nợ.",
      },
      {
        q: "Vì sao kỳ hạn dài lại đắt hơn dù trả hằng tháng ít hơn?",
        a: "Với cùng số tiền vay, cùng mức lãi dương và cùng cách trả, kỳ hạn dài làm dư nợ giảm chậm hơn và bạn trả lãi trong nhiều tháng hơn. Hãy thử cùng khoản vay với kỳ hạn 3 năm và 7 năm để so khoản trả mỗi tháng và tổng lãi. Nếu lãi suất là 0%, tổng lãi vẫn là 0 ở cả hai kỳ hạn. Dù vậy, kỳ hạn dài vẫn khiến khoản trả nợ chiếm chỗ trong ngân sách lâu hơn.",
      },
      {
        q: "Hai con số “còn lại” có nghĩa là tôi được vay hay không?",
        a: "Không. Đó là dòng tiền còn lại mỗi tháng theo đúng những gì bạn nhập — không phải hạn mức được vay và không phải đánh giá của bất kỳ nơi cho vay nào. Có được vay hay không, và với điều kiện gì, nằm trong hồ sơ và hợp đồng của bạn. Con số này trả lời một câu khác: sau khi trả nợ xe và chi phí vận hành, mỗi tháng bạn còn dư bao nhiêu để sống và để dành.",
      },
      {
        q: "“Tổng tiền mua và vay” đã gồm mọi chi phí của xe chưa?",
        a: "Con số này gồm tiền trả trước, giá trị xe cũ dùng để đổi và toàn bộ số tiền trả cho khoản vay. Nó chưa phải tổng chi phí sở hữu xe: còn nhiên liệu, bảo hiểm, đăng kiểm, bảo dưỡng, đỗ xe và phí đường bộ. Bạn có thể nhập ước lượng các khoản đó vào ô “chi phí vận hành xe mỗi tháng” để xem ngân sách còn lại; chúng không được cộng vào chỉ tiêu “Tổng tiền mua và vay”. Công cụ cũng chưa ước tính mức mất giá hay giá bán lại của xe.",
      },
      {
        q: "Nên nhập lãi suất vay mua xe thế nào?",
        // 2026-09-26 (independent review finding 9/16): a one-rate run at the
        // later rate is a scenario, not the instalment the lender recomputes.
        a: "Nhập đúng mức lãi theo năm ghi trong báo giá bạn nhận được — mức cụ thể tùy từng báo giá, công cụ không đặt sẵn một mức nào là đúng. Nếu báo giá có lãi ưu đãi rồi chuyển sang thả nổi, hãy hỏi mức lãi sau ưu đãi và chạy thêm một lần với mức đó để thử kịch bản; khoản trả thật sau ưu đãi được tính lại trên dư nợ còn lại, nên nếu cần con số đó hãy dùng công cụ Khoản vay lãi thả nổi.",
      },
    ],
  },
} as const;
