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
    rateHelp: "Mức lãi danh nghĩa ghi trong hợp đồng, sau thời gian ưu đãi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
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
    aprLabel: "APR (lãi suất thực tế)",
    spreadLabel: "Cao hơn lãi hợp đồng",
    effectiveLabel: "Lãi thực tế theo năm, có ghép lãi",
    pointsSuffix: "điểm %",

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

  compareNotice:
    "APR chỉ có ích khi bạn dùng nó để so sánh, và chỉ khi hai bên được nhập đầy đủ phí như nhau. Với khoản vay mặc định, lãi hợp đồng 8,5% nhưng APR là 8,7081% — cao hơn 0,2081 điểm phần trăm chỉ vì 30 triệu phí. Một ngân hàng báo 8,4% kèm phí 60 triệu sẽ có APR cao hơn ngân hàng báo 8,5% không phí. Hãy hỏi rõ từng khoản phí trước khi so lãi suất, vì đó là chỗ khoản chênh lệch thật nằm.",

  formula: {
    title: "Cách tính",
    body: [
      "Khoản trả hằng tháng được tính trên số tiền vay theo lãi suất hợp đồng, theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)). Phí không làm thay đổi con số này.",
      "Số tiền thực nhận = số tiền vay − phí trả ngay. Đây là chỗ phí phát huy tác dụng: bạn trả nợ như một khoản vay 2 tỷ nhưng chỉ nhận về 1,97 tỷ.",
      "APR là mức lãi suất mà tại đó chuỗi khoản trả hằng tháng có giá trị hiện tại đúng bằng số tiền thực nhận. Không có công thức đóng cho nó, nên công cụ giải bằng phương pháp chia đôi khoảng — và trả về “không xác định” thay vì một con số đoán nếu dòng tiền không kẹp được nghiệm.",
      "APR được quy thành lãi suất năm DANH NGHĨA, tức lãi suất mỗi tháng nhân 12, theo đúng thông lệ công bố. Dòng lãi thực tế theo năm là con số đã ghép lãi 12 kỳ: với mặc định, APR 8,7081% tương đương 9,0642% nếu tính ghép lãi. Hai con số này khác nhau, và khoảng cách rộng ra khi lãi suất cao.",
      "Phí gộp vào khoản vay lại có hiệu ứng khác: nó làm tăng số tiền vay nên khoản trả hằng tháng tăng, còn số tiền thực nhận không đổi — khoản phí đó là tiền bạn vay thêm để trả phí, không phải tiền vào tay bạn. Vì thế APR vẫn tăng, chỉ tăng ít hơn so với trả ngay cùng khoản phí: với mặc định, gộp 30 triệu cho APR 8,7050% thay vì 8,7081%. Công cụ APR nâng cao của FinHome tách riêng hai loại phí này.",
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
