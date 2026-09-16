// Copy for /cong-cu/apr/ — the APR calculator.
//
// Original FinHome copy. The rate is solved numerically; see lib/calc/apr.ts.
//
// Figures quoted are the tool's own output for 2 tỷ, 8,5%/năm, 240 tháng,
// phí trả ngay 30 triệu: trả 17.356.465 ₫/tháng, thực nhận 1.970.000.000 ₫,
// APR 8,7081%/năm (danh nghĩa), lãi thực tế theo năm 9,0642%, cao hơn lãi
// hợp đồng 0,2081 điểm phần trăm; tổng chi phí vay 2.195.551.520 ₫.
// Nếu gộp 30 triệu vào khoản vay thay vì trả ngay: trả 17.616.812 ₫/tháng,
// APR 8,7050% (thấp hơn chút ít so với 8,7081% khi trả ngay), nhưng tổng lãi
// tăng lên 2.198.034.793 ₫.
// Re-read the module if the defaults move.

export const APR = {
  slug: "/cong-cu/apr",

  pageTitle: "APR: lãi suất thực tế sau khi tính phí",
  metaTitle: "Tính APR — Lãi suất thực tế của khoản vay sau phí",
  metaDescription:
    "Quy phí vay về một mức lãi suất duy nhất để so sánh công bằng giữa các ngân hàng. Công cụ miễn phí của FinHome.",

  lede:
    "Lãi suất hợp đồng không nói hết chi phí. Phí thu xếp, phí thẩm định và bảo hiểm làm giảm số tiền bạn thực nhận mà không làm giảm số tiền bạn phải trả — nên mức lãi thực tế cao hơn mức trong hợp đồng. APR là con số quy tất cả về một mức duy nhất.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền ghi trên hợp đồng, trước khi trừ phí.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất hợp đồng",
    rateUnit: "%/năm",
    // CORRECTED. This said "sau thời gian ưu đãi", which reads as though the
    // tool models a promotional stretch. It does not: this rate is held for
    // every month of the term. A promotional offer belongs in the comparison
    // tool, which prices the two phases.
    rateHelp:
      "Mức lãi danh nghĩa ghi trong hợp đồng. Công cụ giữ NGUYÊN mức này suốt kỳ hạn — nếu báo giá của bạn có lãi ưu đãi rồi thả nổi, hãy nhập mức sau ưu đãi ở đây, hoặc dùng công cụ so sánh khoản vay để tính cả hai giai đoạn.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp:
      "Số tháng vay, tính theo tháng trọn vẹn. 20 năm là 240 tháng. Công cụ hỗ trợ tối đa 1.200 tháng.",
    termInvalid:
      "Vui lòng nhập một số nguyên tháng từ 1 đến 1.200 — ví dụ 240, không phải 20 hay 240,5.",
    defaultTerm: "240",

    feeGroup: "Phí",
    upfrontLabel: "Phí trả ngay khi giải ngân",
    upfrontUnit: "₫",
    upfrontHelp:
      "Tổng các khoản bạn trả bằng tiền mặt lúc giải ngân: phí thu xếp, thẩm định, công chứng, đăng ký giao dịch bảo đảm, bảo hiểm năm đầu.",
    upfrontInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultUpfront: "30.000.000",

    pointsLabel: "Phí tính theo phần trăm",
    pointsUnit: "% số tiền vay",
    pointsHelp:
      "Dùng khi ngân hàng báo phí theo tỷ lệ thay vì số tiền. Cộng dồn với ô trên. Để 0 nếu không có.",
    pointsInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultPoints: "0",

    resultTitle: "Kết quả",
    // The fee-aware comparison this page exists to make: the rate on the
    // contract beside the rate the cash flows imply once fees are counted.
    nominalLabel: "Lãi suất trên hợp đồng",
    aprLabel: "APR mô hình hóa sau phí",
    spreadLabel: "Cao hơn lãi hợp đồng",
    effectiveLabel: "Quy đổi lãi kép hằng năm",
    pointsSuffix: "điểm %",

    // The in-place mode switch. Both routes render the SAME tool; this control
    // is how a reader on /cong-cu/apr/ reaches the itemised fees, the financed
    // fee and the payoff month without leaving the page or retyping anything.
    modeLegend: "Mức chi tiết của phí",
    modeHelp:
      "Chế độ gọn dùng một ô tổng phí trả ngay. Chế độ chi tiết tách từng khoản phí, thêm phần phí được cộng vào gốc và cho bạn chọn tháng tất toán — cùng một khoản vay, cùng một phép tính, chỉ khác mức chi tiết khi nhập. Đổi chế độ ngay tại đây, không mất số đã nhập.",
    modeBasic: "Gọn",
    modeAdvanced: "Chi tiết",
    modeNoteBasic:
      "Đang ở chế độ gọn: ô phí bên dưới là TỔNG các khoản bạn trả ngay khi giải ngân. Đổi chế độ chỉ đổi cách hiển thị — mọi khoản bạn đã nhập ở chế độ chi tiết vẫn được tính, và nếu có khoản nào không sửa được ở đây thì nó được liệt kê ngay bên dưới. Chuyển sang chế độ chi tiết để tách từng khoản, khai phần phí gộp vào gốc, hoặc tính APR khi tất toán sớm.",

    // A DERIVED total, shown instead of an editable box once a breakdown
    // exists: an editable box labelled "total" would either misdescribe what
    // it holds or discard the other lines on the next keystroke.
    derivedTotalLabel: "Tổng phí trả ngay khi giải ngân",
    derivedTotalHelp:
      "Đây là tổng các khoản phí bạn đã nhập ở chế độ chi tiết, đúng con số công cụ đang dùng để tính. Không sửa trực tiếp ở đây được, vì sửa một ô tổng sẽ làm mất phần chi tiết — hãy mở chế độ chi tiết để đổi từng khoản.",

    retainedTitle: "Chế độ gọn đang giữ các giả định sau",
    retainedBreakdown: "Các khoản phí đã tách riêng",
    retainedUnreadable: "chưa đọc được",
    retainedEditHint:
      "Những giả định này VẪN được tính vào kết quả ở trên; chế độ gọn chỉ không hiển thị ô nhập của chúng. Đổi chế độ không bao giờ làm thay đổi con số.",
    retainedEditAction: "Mở chế độ chi tiết để sửa",

    // Named fields, not "một ô nào đó": when a fee breakdown makes the total
    // read-only, the first fee line is hidden as well, so the notice has to
    // say WHICH box the reader cannot see.
    hiddenInvalidNotice:
      "Có ô ở chế độ chi tiết đang chưa đọc được, nên kết quả để trống. Ô đó không hiển thị ở chế độ gọn — hãy mở chế độ chi tiết để sửa.",
    hiddenInvalidFields: "Ô đang lỗi",
    modeNoteAdvanced:
      "Đang ở chế độ chi tiết: ô đầu tiên là phí thu xếp, các ô còn lại là từng khoản phí khác. Tổng của chúng chính là con số chế độ gọn dùng, nên hai chế độ không cho hai kết quả khác nhau.",
    crossRouteNote:
      "Hai đường dẫn được giữ nguyên: trang này và trang bản chi tiết là cùng một công cụ ở hai chế độ. Mở đường dẫn kia là một trang mới — số bạn đang nhập ở đây KHÔNG được chuyển sang, hãy dùng nút đổi chế độ nếu bạn muốn giữ số.",

    chartTitle: "Lãi hợp đồng so với APR sau phí",

    // CORRECTED twice. "lãi kép luôn cao hơn" is false at 0%, where the two
    // coincide; and the constant-rate assumption now says so explicitly.
    modeledNote:
      "APR ở đây là lãi suất do FinHome mô hình hóa từ dòng tiền bạn nhập: số tiền thực nhận sau phí và các khoản trả theo lịch, với lãi suất giữ nguyên suốt kỳ hạn. Đây KHÔNG phải mức công bố theo quy định của Việt Nam và không phải báo giá của ngân hàng. APR danh nghĩa là lãi tháng × 12; con số quy đổi lãi kép không bao giờ thấp hơn mức danh nghĩa và cao hơn khi lãi suất dương (ở mức 0% thì hai con số bằng nhau) — đừng so một mức danh nghĩa với một mức ghép lãi.",
    // CORRECTED. The old wording asserted that settling early always costs
    // more. With no fees the APR is the contract rate at every horizon, so
    // the increase needs a positive fee to exist.
    payoffNote:
      "APR ở trên giả định bạn giữ khoản vay đến hết kỳ hạn. Nếu bạn dự kiến tất toán sớm VÀ có phí trả ngay, phí đó được rải trên ít tháng hơn nên APR cao hơn; nếu không có khoản phí nào thì APR bằng lãi hợp đồng ở mọi mốc. Chuyển sang chế độ chi tiết để chọn tháng tất toán và tính lại.",
    advancedLinkLabel: "Mở bản nâng cao: tách phí và chọn tháng tất toán",
    compareLinkLabel: "So hai báo giá tại cùng một mốc giữ khoản vay",

    detailDisclosureTitle: "Xem chi tiết khoản vay và phí",
    detailDisclosureHint:
      "Khoản trả, số tiền thực nhận, tổng phí, tổng lãi và tổng chi phí vay.",

    detailTitle: "Chi tiết",
    paymentLabel: "Trả hằng tháng",
    netProceedsLabel: "Số tiền thực nhận",
    totalFeesLabel: "Tổng phí",
    pointsCostLabel: "Trong đó phí theo phần trăm",
    totalInterestLabel: "Tổng lãi",
    totalCostLabel: "Tổng chi phí vay, gồm phí",
    totalPaidLabel: "Tổng số tiền trả cho khoản vay",

    unsolvableNotice:
      "Không tìm được mức APR cho các dòng tiền này. Thường là do phí quá lớn so với số tiền vay hoặc kỳ hạn quá ngắn. Các con số còn lại của khoản vay vẫn đúng — chỉ riêng APR là không xác định được.",
  },

  // The shared disclaimer says fees are excluded. This tool exists to include
  // them, so it carries its own accurate qualification instead.
  // Must open with the mandatory framing `scripts/check-built-markup.mjs`
  // asserts on every calculator page: a tool-owned qualification refines the
  // disclaimer, it does not replace it.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, không phải tư vấn tài chính. Các khoản phí bạn nhập đều được tính vào APR theo đúng thời điểm trả; những khoản bạn KHÔNG nhập thì không có trong kết quả. Lãi suất được giữ nguyên suốt kỳ hạn, chưa tính thuế và lạm phát. APR ở đây do FinHome mô hình hóa, không phải mức công bố theo quy định của Việt Nam và không phải báo giá của ngân hàng.",

  chart: {
    nominalBar: "Lãi suất trên hợp đồng",
    aprBar: "APR mô hình hóa sau phí",
    payoffBar: "APR nếu tất toán ở tháng {n}",
    axis: "Lãi suất ({unit})",
    axisUnit: "%/năm, danh nghĩa",
    summary:
      "Hợp đồng ghi {nominal}; tính theo dòng tiền thực tế sau phí thì thành {apr} — chênh {gap} điểm phần trăm. Khoảng cách giữa hai cột chính là phần phí, quy về lãi suất.",
    noFeeNote:
      "Ở đây bạn chưa nhập khoản phí nào, nên hai cột bằng nhau: không có phí thì APR đúng bằng lãi hợp đồng.",
    modeledNote:
      "Đây là mức FinHome mô hình hóa từ dòng tiền bạn nhập, không phải mức công bố theo quy định và không phải báo giá của ngân hàng.",
    assumptions: [
      "Khoản trả đều hằng tháng và lãi suất giữ nguyên suốt kỳ hạn. Nếu báo giá của bạn có lãi ưu đãi rồi thả nổi, hãy dùng công cụ so sánh khoản vay.",
      "Phí trả ngay bằng tiền mặt làm giảm số tiền thực nhận nhưng KHÔNG đổi khoản trả hằng tháng; phí gộp vào gốc thì ngược lại — nó làm tăng khoản trả vì bạn trả nợ cho một số lớn hơn. Cùng số tiền phí, hai cách cho APR khác nhau.",
      // CORRECTED. The earlier wording implied that choosing a payoff month
      // brought an early-settlement penalty into the figure. This model has
      // no exit-fee field at all, so the exclusion is unconditional.
      "KHÔNG tính phí trả nợ trước hạn — chọn tháng tất toán chỉ thay đổi khoảng thời gian phí được rải trên, không thêm khoản phí nào. Công cụ So sánh khoản vay có ô riêng cho phí đó và tính nó đúng tại mốc bạn chọn.",
    ],
    tableCaption: "Lãi suất và các khoản phí",
    itemColumn: "Chỉ tiêu",
    rateColumn: "Lãi suất",
    amountColumn: "Số tiền",
    upfrontRow: "Phí trả ngay bằng tiền mặt",
    pointsRow: "Trong đó phí theo phần trăm",
    financedRow: "Phí gộp vào gốc",
    netProceedsRow: "Số tiền thực nhận",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì chưa tính được APR cho các số đã nhập.",
    unavailableRecovery:
      "Hãy kiểm tra số tiền vay, lãi suất, kỳ hạn và các khoản phí — mỗi ô đều có hướng dẫn riêng ngay bên dưới.",
  },

  compareNotice:
    "APR chỉ có ích khi bạn dùng nó để so sánh, và chỉ khi hai bên được nhập đầy đủ phí như nhau. Với khoản vay mặc định, lãi hợp đồng 8,5% nhưng APR là 8,7081% — cao hơn 0,2081 điểm phần trăm chỉ vì 30 triệu phí. Một ngân hàng báo 8,4% kèm phí 60 triệu sẽ có APR cao hơn ngân hàng báo 8,5% không phí. Hãy hỏi rõ từng khoản phí trước khi so lãi suất, vì đó là chỗ khoản chênh lệch thật nằm.",

  formula: {
    title: "Cách tính",
    body: [
      // CORRECTED. "Phí không làm thay đổi con số này" is true only of fees
      // paid in cash. A financed fee enlarges P and therefore the payment —
      // which the last paragraph already explains, so the two were in
      // conflict.
      "Khoản trả hằng tháng được tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)). Phí bạn trả ngay bằng tiền mặt KHÔNG làm thay đổi con số này — P vẫn là số tiền vay. Phí gộp vào gốc thì có: nó làm P lớn hơn, nên khoản trả lớn hơn.",
      "Số tiền thực nhận = số tiền vay − phí trả ngay. Đây là chỗ phí phát huy tác dụng: bạn trả nợ như một khoản vay 2 tỷ nhưng chỉ nhận về 1,97 tỷ.",
      "APR là mức lãi suất mà tại đó chuỗi khoản trả hằng tháng có giá trị hiện tại đúng bằng số tiền thực nhận. Không có công thức đóng cho nó, nên công cụ giải bằng phương pháp chia đôi khoảng — và trả về “không xác định” thay vì một con số đoán nếu dòng tiền không kẹp được nghiệm.",
      // CORRECTED. "theo đúng thông lệ công bố" read as though this figure
      // were a regulated disclosure. It is a FinHome model.
      "APR được quy thành lãi suất năm DANH NGHĨA, tức lãi suất mỗi tháng nhân 12. Đây là quy ước của công cụ này, KHÔNG phải mức công bố theo quy định của Việt Nam và không phải chuẩn so sánh do cơ quan quản lý ban hành. Dòng lãi thực tế theo năm là con số đã ghép lãi 12 kỳ: với mặc định, APR 8,7081% tương đương 9,0642% nếu tính ghép lãi. Hai con số này khác nhau, khoảng cách rộng ra khi lãi suất cao, và ở mức 0% thì chúng bằng nhau.",
      "Phí gộp vào khoản vay lại có hiệu ứng khác: nó làm tăng số tiền vay nên khoản trả hằng tháng tăng, còn số tiền thực nhận không đổi — khoản phí đó là tiền bạn vay thêm để trả phí, không phải tiền vào tay bạn. Vì thế APR vẫn tăng, chỉ tăng ít hơn so với trả ngay cùng khoản phí: với mặc định, gộp 30 triệu cho APR 8,7050% thay vì 8,7081%. Công cụ APR nâng cao của FinHome tách riêng hai loại phí này.",
    ],
    // The distinction: the advertised rate is not the cost of borrowing, and
    // this page's APR is a FinHome convention rather than a regulated
    // disclosure. Both have to be visible to a reader who only scans.
    emphasis: [
      "bạn trả nợ như một khoản vay 2 tỷ nhưng chỉ nhận về 1,97 tỷ",
      "KHÔNG phải mức công bố theo quy định của Việt Nam",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ngân hàng Việt Nam có công bố APR không?",
        a: "Không theo một chuẩn bắt buộc như ở Hoa Kỳ hay EU. Ngân hàng công bố lãi suất cho vay và biểu phí riêng, và việc quy về một con số duy nhất là việc của bạn. Đây chính là lý do trang này tồn tại: hãy hỏi bảng kê từng khoản phí, cộng lại, rồi chạy công cụ cho từng ngân hàng.",
      },
      {
        q: "Những khoản nào nên tính vào phí?",
        a: "Mọi khoản bạn phải trả để có được khoản vay: phí thu xếp hoặc phí cấp tín dụng, phí thẩm định tài sản, phí công chứng, phí đăng ký giao dịch bảo đảm, và phí bảo hiểm nếu ngân hàng yêu cầu mua như điều kiện giải ngân. Không tính các khoản bạn sẽ phải trả dù không vay, ví dụ thuế chuyển nhượng khi mua nhà.",
      },
      {
        q: "Vì sao APR thấp hơn tôi tưởng?",
        a: "Vì phí được chia đều cho toàn bộ kỳ hạn. 30 triệu phí trên khoản vay 2 tỷ trong 20 năm chỉ nâng lãi suất lên 0,21 điểm phần trăm, vì nó được trải ra 240 tháng. Cùng khoản phí đó trên kỳ hạn 3 năm sẽ nâng lãi suất lên rất nhiều. Đây là lý do APR luôn phải đọc kèm kỳ hạn.",
      },
      {
        q: "APR có tính đến việc tôi trả nợ trước hạn không?",
        a: "Không. APR theo định nghĩa giả định bạn trả đến hết kỳ hạn. Nếu trả trước hạn, phí được trải trên ít tháng hơn nên chi phí thực cao hơn APR — với khoản vay mặc định, tất toán ở tháng 36 tương đương APR 9,0902% thay vì 8,7081%. Công cụ APR nâng cao có ô nhập thời điểm tất toán để tính trường hợp đó.",
      },
      {
        q: "APR có tính lãi suất thả nổi không?",
        a: "Không. Cả phép tính giả định lãi suất không đổi suốt kỳ hạn. Với khoản vay mua nhà tại Việt Nam, phần lớn kỳ hạn chạy theo lãi thả nổi, nên hãy nhập mức lãi SAU ưu đãi. Nhập mức ưu đãi năm đầu sẽ cho một APR đẹp nhưng vô nghĩa.",
      },
    ],
  },
} as const;
