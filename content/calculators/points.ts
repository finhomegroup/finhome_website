// Copy for /cong-cu/diem-chiet-khau/ — the discount points calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Figures quoted below are the tool's own output for its defaults (2 tỷ,
// 240 tháng, 8,5%/năm, trả trước 1% để giảm 0,25 điểm), read off the module:
// phí 20.000.000 ₫, trả hằng tháng 17.356.465 → 17.041.313 ₫, giảm 315.152 ₫,
// điểm hoàn phí kiểu đơn giản 64 tháng, nhưng vị thế thực dương từ tháng 49.
// Tiết kiệm cả kỳ hạn sau phí 55.636.389 ₫. Re-read the module if defaults move.
//
// The 49-vs-64 gap is the editorial point of the page: the familiar
// cost ÷ monthly-saving figure is 15 months LATE, because it ignores that the
// lower rate also retires principal faster.

export const POINTS = {
  slug: "/cong-cu/diem-chiet-khau",

  pageTitle: "Điểm chiết khấu: trả trước để hạ lãi có đáng không?",
  metaTitle: "Tính điểm chiết khấu — Trả phí trước để giảm lãi suất",
  metaDescription:
    "Tính xem trả trước một khoản phí để hạ lãi suất có đáng hay không, so cả theo điểm hoàn phí đơn giản và theo vị thế thực tại thời điểm bạn tất toán. Công cụ miễn phí của FinHome.",

  lede:
    "Ngân hàng đề nghị: trả trước 1% số tiền vay, lãi suất giảm 0,25 điểm phần trăm. Có đáng không thì phụ thuộc gần như hoàn toàn vào việc bạn giữ khoản vay bao lâu — nên công cụ này hỏi bạn con số đó, và so hai bên bằng cả tiền đã trả lẫn dư nợ còn lại.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền thực nhận. Phí điểm chiết khấu tính theo phần trăm số này.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay theo hợp đồng. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    baseRateLabel: "Lãi suất khi không trả phí",
    baseRateUnit: "%/năm",
    baseRateHelp: "Mức lãi thông thường, chưa có điểm chiết khấu.",
    baseRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultBaseRate: "8,5",

    offerGroup: "Đề nghị của ngân hàng",
    pointsLabel: "Phí trả trước",
    pointsUnit: "% số tiền vay",
    pointsHelp: "Trả một lần khi giải ngân. 1% của 2 tỷ là 20 triệu.",
    pointsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPoints: "1",

    reductionLabel: "Lãi suất giảm được",
    reductionUnit: "điểm %",
    reductionHelp:
      "Tính bằng ĐIỂM phần trăm, không phải phần trăm của lãi suất: nhập 0,25 để 8,5% thành 8,25%.",
    reductionInvalid: "Mức giảm không được làm lãi suất xuống dưới 0.",
    defaultReduction: "0,25",

    holdLabel: "Bạn dự định giữ khoản vay bao lâu",
    holdHelp:
      "Số tháng đến khi bạn bán nhà, tất toán hoặc tái cấp vốn. Đây là ô quyết định kết luận. Để bằng kỳ hạn nếu bạn định trả đến hết.",
    holdInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultHold: "60",

    resultTitle: "Kết luận",
    verdictLabel: "Có đáng không",
    verdictYes: "Đáng — bạn có lợi tại thời điểm tất toán",
    verdictNo: "Không đáng — bạn lỗ tại thời điểm tất toán",
    holdPositionLabel: "Lợi hoặc lỗ khi tất toán",
    holdMonthsLabel: "Tính tại tháng",
    monthsUnit: "tháng",

    detailTitle: "Chi tiết",
    costLabel: "Phí trả trước",
    buydownRateLabel: "Lãi suất sau khi giảm",
    basePaymentLabel: "Trả hằng tháng nếu không trả phí",
    buydownPaymentLabel: "Trả hằng tháng nếu trả phí",
    monthlySavingLabel: "Giảm mỗi tháng",
    breakEvenLabel: "Điểm hoàn phí kiểu đơn giản",
    baseHoldLabel: "Tổng bỏ ra nếu không trả phí",
    buydownHoldLabel: "Tổng bỏ ra nếu trả phí",
    lifetimeLabel: "Tiết kiệm cả kỳ hạn sau phí",

    noBreakEvenNotice:
      "Khoản trả hằng tháng không giảm, nên không có điểm hoàn phí. Hãy kiểm tra lại mức giảm lãi suất mà ngân hàng đưa ra.",
  },

  methodNotice:
    "Con số quen thuộc — phí chia cho mức giảm hằng tháng — là con số sai theo chiều bất lợi cho bạn. Với khoản vay mặc định nó cho 64 tháng, nhưng thực tế bạn đã có lợi từ tháng 49. Lý do: lãi suất thấp hơn không chỉ làm khoản trả nhẹ đi, nó còn trả được nhiều gốc hơn, nên dư nợ của bạn thấp hơn. Công cụ này so hai bên bằng tổng tiền đã trả CỘNG dư nợ còn lại tại thời điểm bạn tất toán, nên nó trả lời đúng câu hỏi bạn đang hỏi.",

  formula: {
    title: "Cách tính",
    body: [
      "Phí trả trước = số tiền vay × phần trăm phí. Lãi suất sau khi giảm = lãi suất gốc − mức giảm tính theo điểm phần trăm. Hai khoản vay được lập bảng trả nợ đầy đủ ở hai mức lãi suất đó, trên cùng một số tiền vay và cùng một kỳ hạn.",
      "Điểm hoàn phí kiểu đơn giản = phí ÷ mức giảm hằng tháng, làm tròn lên. Công cụ vẫn hiển thị vì đây là con số mọi nơi đều dùng, nhưng nó bỏ qua dư nợ, nên nó luôn muộn hơn thực tế.",
      "Vị thế thực tại thời điểm tất toán so hai tổng: bên không trả phí là tổng các khoản đã trả cộng dư nợ còn lại; bên trả phí là tổng đã trả cộng dư nợ còn lại cộng phí trả trước. Hiệu số dương nghĩa là trả phí có lợi. Với mặc định, tại tháng 60 bên trả phí bỏ ra 2.799.061.004 ₫ so với 2.803.931.542 ₫ — lợi 4.870.538 ₫.",
      "Tiết kiệm cả kỳ hạn sau phí là tổng lãi tiết kiệm được trong toàn bộ kỳ hạn trừ phí, tức 55.636.389 ₫ với mặc định. Con số này chỉ đúng nếu bạn giữ khoản vay đến hết kỳ hạn — điều mà phần lớn người vay mua nhà không làm.",
      "Mức giảm được nhập theo ĐIỂM phần trăm. Nhập 0,25 để 8,5% thành 8,25%. Nếu hiểu là “giảm 0,25% của lãi suất” thì con số chỉ là 0,02 điểm, tức nhỏ hơn khoảng ba mươi lần — công cụ từ chối mức giảm làm lãi suất xuống dưới 0 nhưng không thể đoán được bạn có nhầm đơn vị hay không.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên nhập bao nhiêu tháng vào ô “giữ khoản vay bao lâu”?",
        a: "Hãy nhập số tháng bạn thật sự tin là mình còn nợ khoản này, không phải kỳ hạn hợp đồng. Người mua nhà ở Việt Nam thường bán, tất toán hoặc chuyển sang ngân hàng khác sớm hơn nhiều so với kỳ hạn 20–25 năm trên giấy. Nếu không chắc, hãy chạy hai lần với mốc ngắn và mốc dài rồi xem kết luận có đổi không — nếu đổi, thì đây là quyết định phụ thuộc vào dự định của bạn chứ không phải vào con số ngân hàng đưa ra.",
      },
      {
        q: "Vì sao vị thế thực có lợi sớm hơn điểm hoàn phí đơn giản?",
        a: "Vì cách tính đơn giản chỉ đếm tiền bạn không phải trả mỗi tháng, mà bỏ qua việc phần gốc trong mỗi khoản trả cũng lớn hơn. Ở mức lãi thấp hơn, cùng một khoản trả nhỏ hơn nhưng lại dồn nhiều hơn vào gốc, nên sau vài năm dư nợ của bạn thấp hơn đáng kể. Khoản chênh lệch dư nợ đó là tiền thật, và nó xuất hiện ngay từ tháng đầu.",
      },
      {
        q: "Nếu tôi định trả nợ trước hạn thì sao?",
        a: "Trả nợ trước hạn làm điểm chiết khấu bớt hấp dẫn, vì nó rút ngắn thời gian bạn được hưởng lãi suất thấp. Cách gần đúng là nhập vào ô thời gian giữ khoản vay số tháng bạn dự kiến tất toán. Ngoài ra hãy nhớ phí trả nợ trước hạn của ngân hàng — nó không nằm trong phép tính này và thường bằng 1–3% dư nợ.",
      },
      {
        q: "Có nên dùng tiền đó để trả trước nhiều hơn thay vì mua điểm chiết khấu?",
        a: "Đáng để so, và công cụ này chưa so hộ bạn. Dùng 20 triệu để tăng tiền trả trước làm giảm số tiền vay, giảm cả lãi và khoản trả hằng tháng, và không phụ thuộc vào việc bạn giữ khoản vay bao lâu. Hãy chạy công cụ tính khoản vay mua nhà hai lần — một lần với số tiền vay 2 tỷ và một lần với 1,98 tỷ — rồi đặt cạnh kết quả ở đây.",
      },
      {
        q: "Điểm chiết khấu ở Việt Nam có phổ biến không?",
        a: "Không phổ biến dưới cái tên đó, nhưng cấu trúc thì có: nhiều ngân hàng đề nghị giảm biên độ lãi suất nếu khách mua bảo hiểm nhân thọ, mở thẻ hoặc chuyển lương về ngân hàng, và phần chi phí đó chính là một dạng phí trả trước. Hãy quy khoản chi phí đó về số tiền và nhập vào ô phí trả trước để so bằng cùng một thước đo.",
      },
    ],
  },
} as const;
