// Copy for /cong-cu/so-sanh-khoan-vay/ — the loan comparison calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// The one editorial decision in here: the tool ranks options on the cost of
// borrowing (lãi + phí), and the copy says so repeatedly and says why. A
// borrower shown three instalments side by side will pick the smallest, which
// on a longer term is the most expensive option on the page. Every label,
// every help line and the FAQ all push back on that instinct.

export const LOAN_COMPARE = {
  slug: "/cong-cu/so-sanh-khoan-vay",

  pageTitle: "So sánh khoản vay: phương án nào rẻ hơn?",
  metaTitle: "So sánh khoản vay — Đặt ba phương án cạnh nhau",
  metaDescription:
    "Nhập lãi suất, kỳ hạn và phí của từng phương án vay để so sánh khoản trả hằng tháng, tổng lãi và tổng chi phí vay. Công cụ miễn phí của FinHome.",

  lede: "Nhập hai báo giá để xem phương án nào thực sự rẻ hơn.",
  ledeDetailTitle: "Vì sao trả ít mỗi tháng chưa chắc là rẻ",
  ledeDetail:
    "Phương án có khoản trả hằng tháng thấp nhất thường không phải phương án rẻ nhất: kéo dài kỳ hạn luôn làm khoản trả nhỏ đi trong khi tổng lãi tăng lên. Công cụ giữ cùng một số tiền vay cho mọi phương án — chỉ khi đó lãi suất và phí mới so sánh được — và xếp hạng theo chi phí đến MỐC bạn dự kiến giữ khoản vay: lãi đến tháng đó cộng phí, với dư nợ còn lại hiện ngay bên cạnh. Chi phí cả kỳ hạn là một thước đo riêng, cũng có trong bảng. Có thể thêm phương án thứ ba nếu bạn có ba báo giá.",

  form: {
    amountGroup: "Số tiền vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp:
      // "cả ba phương án" is wrong on the fixed/floating perspective, which
      // renders two sides and no third column. Neutral wording is true in
      // both, and this help text is shared by both routes.
      "Dùng chung cho mọi phương án trên trang này, vì chỉ khi cùng số tiền vay thì lãi suất và phí mới so sánh được với nhau.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    optionLabels: ["Phương án A", "Phương án B", "Phương án C"],

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",

    termLabel: "Kỳ hạn",
    termUnit: "năm",
    termHelp: "Số năm trả nợ.",
    termInvalid: "Vui lòng nhập kỳ hạn lớn hơn 0.",

    feeLabel: "Phí thu xếp",
    feeUnit: "% số tiền vay",
    feeHelp:
      "Phí trả một lần khi giải ngân, tính theo phần trăm số tiền vay. Để 0 nếu không có.",
    feeInvalid: "Phí không được là số âm.",

    // The original plan row this page was missing: a Vietnamese mortgage offer
    // quotes a promotional rate for 6–24 months and a different rate after it.
    // Pricing it as one constant rate held for 240 months is not that offer.
    promoGroup: "Lãi ưu đãi (nếu báo giá có)",
    promoMonthsLabel: "Số tháng ưu đãi",
    promoMonthsUnit: "tháng",
    promoMonthsHelp:
      "Số tháng đầu áp lãi ưu đãi. Để trống nếu báo giá chỉ có một mức lãi.",
    promoMonthsInvalid:
      "Vui lòng nhập một số nguyên tháng từ 1 đến 1.200, và nhỏ hơn kỳ hạn.",
    promoRateLabel: "Lãi ưu đãi",
    promoRateUnit: "%/năm",
    promoRateHelp:
      "Mức lãi trong thời gian ưu đãi. Ô “Lãi suất” ở trên là mức SAU ưu đãi.",
    promoRateInvalid: "Vui lòng nhập lãi ưu đãi từ 0 trở lên.",
    promoNeedsBoth:
      "Cần nhập cả số tháng ưu đãi và mức lãi ưu đãi; thiếu một trong hai thì phương án được tính theo một mức lãi duy nhất.",

    flatFeeLabel: "Phí khác trả khi giải ngân",
    flatFeeUnit: "₫",
    flatFeeHelp:
      "Các khoản bạn trả NGAY lúc giải ngân, ngoài phí thu xếp: thẩm định, công chứng, đăng ký giao dịch bảo đảm. Chỉ nhập khoản bạn thực sự phải trả. Để trống nếu không có.",
    flatFeeInvalid: "Vui lòng nhập một số tiền từ 0 trở lên, hoặc để trống.",

    // A separate field because it is paid on a DIFFERENT DATE. The earlier
    // version of this page told readers to add it to the upfront fee box,
    // which moves a month-60 payment to day one and overstates the APR.
    exitFeeLabel: "Phí trả nợ trước hạn tại mốc so sánh",
    exitFeeUnit: "₫",
    exitFeeHelp:
      "Nếu bạn tất toán ở mốc so sánh, hợp đồng có thể thu phí trả nợ trước hạn. Nhập mức phí đó ở đây, KHÔNG cộng vào ô phí giải ngân: hai khoản trả ở hai thời điểm khác nhau nên ảnh hưởng tới APR cũng khác nhau. Để trống nếu bạn chưa biết hoặc không tất toán sớm.",
    exitFeeInvalid: "Vui lòng nhập một số tiền từ 0 trở lên, hoặc để trống.",

    optionalFeesTitle: "Phí và lãi ưu đãi của báo giá này",
    optionalFeesSummary: "Chưa nhập phí hay lãi ưu đãi nào",

    horizonGroup: "Thời gian bạn dự kiến giữ khoản vay",
    horizonLabel: "So sánh tại tháng thứ",
    horizonUnit: "tháng",
    horizonHelp:
      "Mốc chung để so hai báo giá: đến tháng đó bạn đã trả bao nhiêu lãi và còn nợ bao nhiêu. Nhập số nguyên từ 0 đến 1.200. Phần lớn người mua không giữ khoản vay đến hết kỳ hạn, nên mốc này thường quyết định phương án nào rẻ hơn.",
    horizonInvalid: "Vui lòng nhập một số nguyên tháng từ 0 đến 1.200.",
    defaultHorizon: "60",

    // TWO offers to start with, because two is what a borrower usually has in
    // hand, and a third pre-filled column is three sets of numbers to read
    // before the page has said anything. The third is preserved — it is one
    // disclosure away and whatever is typed into it survives being collapsed.
    // Optional boxes ship BLANK, not "0": blank means "no such fee" and keeps
    // the progressive-entry panel closed until a reader has something to put
    // in it. An explicit 0 and a blank are the same figure; a blank and a
    // malformed entry are not, and the tool keeps those apart.
    defaults: [
      {
        rate: "8,5",
        term: "20",
        fee: "",
        promoMonths: "",
        promoRate: "",
        flatFee: "",
        exitFee: "",
      },
      {
        rate: "9,2",
        term: "20",
        fee: "",
        promoMonths: "",
        promoRate: "",
        flatFee: "",
        exitFee: "",
      },
      {
        rate: "",
        term: "",
        fee: "",
        promoMonths: "",
        promoRate: "",
        flatFee: "",
        exitFee: "",
      },
    ],

    thirdOptionTitle: "Thêm phương án thứ ba",
    thirdOptionUnused: "Chưa nhập — đang so hai phương án.",
    thirdOptionUsed: "Đang so ba phương án.",

    resultTitle: "Phương án rẻ nhất",
    bestLabel: "Rẻ nhất tại mốc bạn chọn",
    spreadLabel: "Chênh lệch với phương án đắt nhất",
    horizonCostLabel: "Chi phí đến mốc đó",
    horizonBalanceLabel: "Còn nợ tại mốc đó",

    detailTitle: "Xem bảng so sánh từng chỉ tiêu",
    detailHint:
      "Khoản trả trước và sau ưu đãi, lãi và phí đến mốc bạn chọn, dư nợ còn lại, chi phí cả kỳ hạn và APR mô hình hóa.",

    aprDetailTitle: "Lãi suất mô hình hóa sau phí",
    aprLabel: "APR danh nghĩa (cả kỳ hạn)",
    aprEffectiveLabel: "Quy đổi lãi kép hằng năm",
    horizonAprLabel: "APR nếu tất toán ở tháng {n}",
    aprUnavailable: "Không giải được",
    aprNote:
      // CORRECTED: "luôn cao hơn" is false at 0%, where the nominal and the
      // compounded figure coincide.
      "APR ở đây là lãi suất do FinHome mô hình hóa từ dòng tiền bạn nhập: số tiền thực nhận sau phí, các khoản trả theo lịch, và dư nợ còn lại nếu tất toán tại mốc đã chọn. Đây KHÔNG phải mức công bố theo quy định, không phải báo giá của ngân hàng, và không bao gồm phí trả nợ trước hạn trừ khi bạn tự nhập vào ô phí. APR danh nghĩa là lãi tháng × 12; con số quy đổi lãi kép không bao giờ thấp hơn mức danh nghĩa và cao hơn khi lãi suất dương — ở mức 0% thì hai con số bằng nhau. Đừng so một mức danh nghĩa với một mức ghép lãi.",

    winnerChangesNotice:
      "Tại mốc bạn chọn, {horizonOption} rẻ hơn; nhưng nếu giữ đến hết kỳ hạn thì {fullTermOption} rẻ hơn. Hai câu hỏi khác nhau nên hai đáp án khác nhau — hãy chọn mốc gần với thời gian bạn thực sự dự kiến giữ khoản vay.",

    // The reproduced defect this copy exists for: an offer with a malformed
    // field used to be priced as a DIFFERENT contract and ranked. It is now
    // excluded, and the reader is told which one and why.
    unusableNotice:
      "Một phương án bạn đã nhập có ô chưa đọc được, nên công cụ KHÔNG xếp hạng nó: nếu tính tiếp, con số sẽ là của một hợp đồng khác hợp đồng bạn đang có. Bảng và biểu đồ phía trên chỉ so giữa các phương án còn hợp lệ. Hãy sửa ô đang báo lỗi để đưa phương án đó trở lại so sánh.",
    unusableBlockedNotice:
      "Phương án bạn đã nhập có ô chưa đọc được nên bị loại khỏi so sánh, và không còn đủ hai phương án hợp lệ. Công cụ để trống kết quả thay vì xếp hạng một hợp đồng mà bạn không nhập. Hãy sửa ô đang báo lỗi.",

    tooFewNotice:
      "Cần ít nhất hai phương án có đủ lãi suất và kỳ hạn để so sánh. Hãy điền lại phương án còn thiếu, hoặc dùng công cụ tính khoản vay nếu bạn chỉ có một phương án.",

    settlementFeeNotice:
      "Phí trả nợ trước hạn được tính ĐÚNG THỜI ĐIỂM tất toán, không phải lúc giải ngân — mỗi phương án có ô riêng cho nó trong phần phí. Nếu bạn để trống ô đó, chi phí tại mốc so sánh KHÔNG bao gồm phí trả nợ trước hạn: đó là khoản công cụ chưa biết, không phải khoản bằng 0. Hãy hỏi ngân hàng mức phí và số năm bị áp phí rồi nhập vào ô đó.",
  },

  table: {
    caption: "So sánh từng chỉ tiêu",
    metricColumn: "Chỉ tiêu",
    rows: {
      monthly: "Trả hằng tháng (giai đoạn đầu)",
      resetPayment: "Trả hằng tháng sau ưu đãi",
      // CORRECTED. The value is `resetMonth`, the FIRST month on the new rate
      // — 13 for a twelve-month promotion — and the old label "Tháng hết ưu
      // đãi" pointed at month 12. The schedule is right; the label was
      // describing the month before the one it printed, which is exactly the
      // boundary this row exists to teach.
      resetMonth: "Tháng đầu áp lãi mới",
      months: "Số tháng trả nợ",
      horizonInterest: "Lãi đã trả đến mốc đã chọn",
      horizonBalance: "Dư nợ còn lại tại mốc đó",
      exitFee: "Phí trả nợ trước hạn tại mốc đó",
      horizonCost: "Chi phí đến mốc đó (lãi + phí)",
      totalInterest: "Tổng lãi cả kỳ hạn",
      fee: "Phí trả một lần",
      costOfBorrowing: "Chi phí vay cả kỳ hạn (lãi + phí)",
      totalOutlay: "Tổng số tiền bỏ ra cả kỳ hạn",
      apr: "APR danh nghĩa mô hình hóa",
      horizonApr: "APR nếu tất toán tại mốc đó",
      extraVsBest: "Đắt hơn phương án rẻ nhất (tại mốc đó)",
    },
    intro:
      "Hai nhóm dòng trả lời hai câu hỏi khác nhau. Nhóm “đến mốc đã chọn” là chi phí tại cùng một thời điểm tất toán cho mọi phương án — cộng thêm dư nợ còn lại, để một phương án chỉ trả chậm gốc không trông rẻ hơn. Nhóm “cả kỳ hạn” là tổng danh nghĩa nếu bạn giữ đến hết. Dòng trả hằng tháng cho biết mỗi tháng cần thu xếp bao nhiêu, nhưng con số đó nhỏ đi khi kỳ hạn dài ra nên nó không nói lên phương án nào rẻ hơn.",
  },

  // The shared disclaimer says fees are excluded. On this page they are not:
  // the comparison prices the fees the reader enters, at the date each one is
  // paid. Saying otherwise would contradict the figures above it.
  // Must open with the mandatory framing `scripts/check-built-markup.mjs`
  // asserts on every calculator page: a tool-owned qualification refines the
  // disclaimer, it does not replace it.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, không phải tư vấn tài chính. Kết quả dùng đúng những con số bạn nhập: lãi ưu đãi, lãi sau ưu đãi, phí trả khi giải ngân và phí trả nợ trước hạn tại mốc so sánh đều được tính. Những khoản bạn KHÔNG nhập thì không có trong kết quả — công cụ không biết biểu phí của hợp đồng bạn. Chưa tính thuế, lạm phát, bảo hiểm khoản vay hay thay đổi lãi suất ngoài kịch bản bạn đặt. Đây không phải báo giá của ngân hàng.",

  rankingNotice:
    "Công cụ xếp hạng theo lãi cộng phí ĐẾN MỐC bạn chọn, không theo khoản trả hằng tháng, và dư nợ còn lại tại mốc đó được hiển thị bên cạnh chứ không bị bỏ qua. Tổng cả kỳ hạn là một thước đo riêng, cũng có trong bảng. Khi cùng số tiền, lãi suất dương và cách trả, kỳ hạn dài hơn làm tháng nhẹ hơn nhưng tổng lãi cao hơn. Lãi ưu đãi và lãi sau ưu đãi là giả định bạn nhập, không phải dự báo hay báo giá của ngân hàng.",

  costChart: {
    title: "Chi phí của từng phương án tại mốc bạn chọn",
    principalSegment: "Gốc đã trả",
    interestSegment: "Lãi đã trả",
    feeSegment: "Phí trả một lần",
    balanceSegment: "Dư nợ còn lại",
    axis: "Tiền đã trả cộng dư nợ còn lại ({unit})",
    summary:
      "Tại tháng thứ {horizon}, {option} có chi phí thấp nhất, {cost}. Khoảng cách giữa phương án rẻ nhất và đắt nhất là {spread}. Cột được xếp từ gốc đã trả, lãi đã trả, phí, rồi phần dư nợ còn nợ lại — nên một phương án chỉ trả chậm gốc không trông rẻ hơn.",
    rankedOnNote:
      "Xếp theo lãi cộng phí đến mốc đã chọn, không theo khoản trả hằng tháng.",
    winnerChangesNote:
      "Nếu giữ đến hết kỳ hạn thì {fullTermOption} mới là phương án rẻ nhất, không phải {horizonOption} — đổi mốc so sánh là đổi câu hỏi.",
    exclusionNote:
      "Chưa tính bảo hiểm khoản vay, phí trả nợ trước hạn và phí thẩm định trừ khi bạn nhập vào ô phí. Lãi ưu đãi, lãi sau ưu đãi và mốc so sánh đều là giả định bạn nhập.",
    assumptions: [
      "Cả ba phương án dùng chung một số tiền vay và một mốc so sánh; chỉ khi đó lãi suất và phí mới so sánh được.",
      "Sau giai đoạn ưu đãi, mỗi phương án giữ mức lãi sau ưu đãi bạn nhập cho phần còn lại của kỳ hạn. Hợp đồng thật có thể điều chỉnh tiếp theo lãi cơ sở.",
      "Đây là các báo giá bạn tự nhập. Công cụ không biết và không xếp hạng ngân hàng nào.",
    ],
    tableCaption: "Chi phí tại mốc đã chọn và cả kỳ hạn",
    optionColumn: "Phương án",
    interestColumn: "Lãi đến mốc đó",
    feeColumn: "Phí trả một lần",
    balanceColumn: "Dư nợ còn lại",
    costColumn: "Chi phí đến mốc đó",
    fullTermCostColumn: "Chi phí cả kỳ hạn",
    unavailableReason: "Cần ít nhất hai phương án tính được để so sánh.",
    unavailableRecovery:
      "Hãy điền lãi suất và kỳ hạn cho phương án thứ hai, hoặc dùng công cụ tính khoản vay nếu bạn chỉ có một báo giá.",
  },

  paymentChart: {
    title: "Khoản trả hằng tháng, giai đoạn ưu đãi và kỳ hạn",
    xAxis: "Tháng thứ",
    yAxis: "Khoản trả mỗi tháng ({unit})",
    summary:
      "{lowestOption} có khoản trả hằng tháng thấp nhất lúc đầu, {lowest}. Nhưng phương án rẻ nhất tại mốc bạn chọn là {cheapestOption}.",
    monthlyIsNotCostNote:
      "Đường nào kết thúc muộn hơn là kỳ hạn dài hơn: trả nhẹ hơn mỗi tháng nhưng trả trong nhiều năm hơn, và tổng lãi cao hơn.",
    resetNote:
      "{count} phương án có bậc: khoản trả giữ một mức trong thời gian ưu đãi rồi nhảy lên mức sau ưu đãi — đường vẽ theo bậc vì cú nhảy đó xảy ra trong một tháng, không tăng dần.",
    horizonMarker: "Tháng {n}: mốc so sánh",
    exclusionNote:
      "Chưa tính bảo hiểm khoản vay và phí trả nợ trước hạn trừ khi bạn nhập vào ô phí.",
    assumptions: [
      "Khoản trả được tính lại tại thời điểm hết ưu đãi, trên dư nợ còn lại và số tháng còn lại.",
      "Sau mốc đó công cụ giữ nguyên mức lãi sau ưu đãi. Hợp đồng thật có thể điều chỉnh tiếp theo lãi cơ sở, nên hãy thử vài mức.",
    ],
    tableCaption: "Khoản trả trước và sau ưu đãi theo từng phương án",
    optionColumn: "Phương án",
    paymentColumn: "Trả hằng tháng lúc đầu",
    resetPaymentColumn: "Sau ưu đãi",
    monthsColumn: "Số tháng",
    unavailableReason: "Cần ít nhất hai phương án tính được để so sánh.",
    unavailableRecovery:
      "Hãy điền lãi suất và kỳ hạn cho phương án thứ hai.",
  },

  // CORRECTED. Paragraph two used to say "chi phí vay … tổng lãi cộng phí thu
  // xếp — đây là con số dùng để xếp hạng", which stopped being true when the
  // ranking moved to a COMMON HORIZON. Two different measures were being
  // described as one, and the full-term one is not the one `bestIndex` uses.
  formula: {
    title: "Cách tính",
    body: [
      "Mỗi phương án được tính từ bảng trả nợ của chính nó. Không có ưu đãi thì đó là một khoản vay trả góp đều theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), với P là số tiền vay, r là lãi suất mỗi tháng và n là số tháng vay. Có ưu đãi thì khoản vay chạy theo từng giai đoạn, và ở mốc hết ưu đãi khoản trả được tính lại trên dư nợ còn lại trong số tháng còn lại.",
      "XẾP HẠNG THEO CHI PHÍ ĐẾN MỐC BẠN CHỌN, không theo cả kỳ hạn: lãi phát sinh đến tháng đó, cộng các khoản phí trả ngay lúc giải ngân, cộng phí tất toán nếu ở mốc đó bạn tất toán và còn dư nợ. Dư nợ còn lại tại mốc đó được hiện ngay bên cạnh, nên một phương án chỉ hoãn trả gốc không thể trông rẻ hơn thật.",
      "Phí thu xếp tính trên số tiền vay tại thời điểm giải ngân, không tính trên tổng số tiền trả. Phí tất toán thì tính ở MỐC bạn chọn chứ không phải lúc giải ngân — hai khoản trả ở hai thời điểm khác nhau, nên chúng có hai ô riêng và ảnh hưởng tới APR cũng khác nhau.",
      "Bảng chi tiết còn có hai thước đo cả kỳ hạn: tổng lãi, và chi phí vay cả kỳ hạn bằng tổng lãi cộng phí trả ngay (không gồm phí tất toán, vì một khoản vay giữ đến hết kỳ hạn thì không tất toán sớm). Hai thước đo này có thể chọn ra phương án khác với thước đo tại mốc — khi điều đó xảy ra, trang nói rõ thay vì để một thứ tự đại diện cho cả hai câu hỏi.",
      "Khi hai phương án có chi phí bằng nhau tại mốc so, công cụ giữ phương án đứng trước làm phương án rẻ nhất, để không tạo ra một chênh lệch không tồn tại.",
    ],
    // The distinction this page exists to protect: the ranking is at a CHOSEN
    // month and includes the debt still owed, so a cheaper instalment is not
    // a cheaper loan.
    emphasis: [
      "XẾP HẠNG THEO CHI PHÍ ĐẾN MỐC BẠN CHỌN, không theo cả kỳ hạn",
      "một phương án chỉ hoãn trả gốc không thể trông rẻ hơn thật",
      "Hai thước đo này có thể chọn ra phương án khác với thước đo tại mốc",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao phương án trả hằng tháng ít nhất lại không phải phương án rẻ nhất?",
        a: "Vì khoản trả hằng tháng phụ thuộc vào kỳ hạn nhiều hơn là vào lãi suất. Kéo kỳ hạn từ 20 năm lên 25 năm làm mỗi tháng nhẹ đi đáng kể, nhưng bạn trả lãi thêm 5 năm trên một dư nợ giảm chậm hơn, nên tổng lãi tăng. Hãy nhập cùng một lãi suất với hai kỳ hạn khác nhau trong công cụ để thấy rõ.",
      },
      {
        q: "Phí thu xếp nhỏ như vậy có đáng đưa vào so sánh không?",
        a: "Có, vì nó thường đủ để đảo ngược thứ tự. Với khoản vay 2 tỷ trong 20 năm, mỗi 0,1 điểm phần trăm lãi suất tương đương khoảng 30 triệu tiền lãi — cùng cỡ với một khoản phí 1,5%. Một ngân hàng báo lãi suất thấp hơn 0,1 điểm nhưng thu phí 2% thực chất đang bán phương án đắt hơn.",
      },
      {
        q: "Nếu ngân hàng chỉ ưu đãi lãi suất trong hai năm đầu thì so sánh thế nào?",
        a: "Công cụ này giả định lãi suất không đổi trong suốt kỳ hạn, nên đừng nhập mức lãi ưu đãi. Hãy hỏi ngân hàng mức lãi sau ưu đãi — thường là lãi cơ sở cộng biên độ — và nhập mức đó, vì đó là mức bạn trả trong phần lớn thời gian vay. Nếu muốn thấy khoảng dao động, hãy chạy công cụ hai lần: một lần với mức lãi ưu đãi, một lần với mức sau ưu đãi.",
      },
      {
        q: "Còn phí trả nợ trước hạn thì sao?",
        a: "Công cụ chưa tính, vì nó chỉ phát sinh nếu bạn tất toán sớm và mỗi ngân hàng quy định một biểu phí khác nhau, thường giảm dần theo số năm đã vay. Nếu bạn dự định trả trước hạn, hãy hỏi rõ mức phí và số năm bị áp phí, rồi cộng thủ công vào chi phí vay của phương án đó.",
      },
      {
        q: "Tôi chỉ muốn so sánh hai phương án, phải làm gì với phương án C?",
        a: "Xóa trống lãi suất hoặc kỳ hạn của phương án C. Cột đó sẽ hiển thị dấu gạch ngang và không tham gia xếp hạng, còn hai phương án còn lại vẫn được so sánh bình thường.",
      },
    ],
  },
} as const;
