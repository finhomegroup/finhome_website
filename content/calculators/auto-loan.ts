// Copy for /cong-cu/vay-mua-xe/ — the vehicle loan calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// `depreciationNotice` is the honest caveat for this particular tool: a car
// loses value while the loan does not, so a buyer with a small deposit can owe
// more than the car is worth for a good part of the term. The reference tool
// does not say this; we should.

export const AUTO_LOAN = {
  slug: "/cong-cu/vay-mua-xe",

  pageTitle: "Tính khoản vay mua xe: trả bao nhiêu mỗi tháng?",
  metaTitle: "Tính khoản vay mua xe — Trả hằng tháng và tổng lãi",
  metaDescription:
    "Nhập giá xe, tiền trả trước, lãi suất và kỳ hạn để biết số tiền vay, khoản trả hằng tháng và tổng lãi. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập giá xe và số tiền bạn trả trước để xem thực tế phải vay bao nhiêu, trả bao nhiêu mỗi tháng và tổng lãi trong suốt kỳ hạn. Nếu bạn đổi xe cũ, nhập giá trị xe cũ vào phần thu lại.",

  form: {
    vehicleGroup: "Xe và tiền trả trước",
    priceLabel: "Giá xe",
    priceUnit: "₫",
    priceHelp: "Giá lăn bánh, đã gồm thuế và phí đăng ký.",
    priceInvalid: "Vui lòng nhập giá xe lớn hơn 0.",
    defaultPrice: "800.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp: "Tiền mặt bạn trả ngay. Ngân hàng thường yêu cầu tối thiểu 20–30% giá xe.",
    downInvalid: "Tiền trả trước không được là số âm.",
    defaultDown: "200.000.000",

    tradeInLabel: "Giá trị xe cũ thu lại",
    tradeInUnit: "₫",
    tradeInHelp: "Số tiền được trừ khi đổi xe cũ. Để 0 nếu không có.",
    tradeInInvalid: "Giá trị xe cũ không được là số âm.",
    defaultTradeIn: "0",

    loanGroup: "Điều kiện vay",
    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 9,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "9,5",

    termLabel: "Kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Kỳ hạn vay mua xe phổ biến là 3–7 năm.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "5",

    resultTitle: "Kết quả",
    financedLabel: "Số tiền phải vay",
    downPercentLabel: "Tỷ lệ trả trước",
    monthlyLabel: "Trả hằng tháng",
    totalInterestLabel: "Tổng lãi phải trả",
    totalPaymentLabel: "Tổng số tiền trả cho khoản vay",
    totalCostLabel: "Tổng chi phí sở hữu xe",
    termResultLabel: "Số tháng trả nợ",
    monthsUnit: "tháng",

    nothingToFinanceNotice:
      "Tiền trả trước và giá trị xe cũ đã bằng hoặc vượt giá xe, nên không cần vay. Hãy giảm một trong hai số đó nếu bạn muốn xem phương án vay.",
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

  depreciationNotice:
    "Một điều công cụ này không tính được: xe mất giá trong khi khoản nợ thì không. Nếu bạn trả trước ít và vay kỳ hạn dài, sẽ có một khoảng thời gian dư nợ còn lớn hơn giá trị chiếc xe — nghĩa là bán xe cũng không đủ trả hết nợ. Trả trước nhiều hơn và chọn kỳ hạn ngắn hơn sẽ thu hẹp khoảng đó.",

  formula: {
    title: "Công thức tính",
    body: [
      "Số tiền phải vay bằng giá xe trừ tiền trả trước và trừ giá trị xe cũ thu lại. Đây là con số mà lãi được tính trên đó, không phải giá xe.",
      "Khoản trả hằng tháng tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), với P là số tiền vay, r là lãi suất mỗi tháng và n là số tháng vay.",
      "Tổng chi phí sở hữu xe bằng tiền trả trước cộng giá trị xe cũ cộng toàn bộ số tiền trả cho khoản vay. Con số này cho thấy chiếc xe thực sự tốn bao nhiêu, khác với giá niêm yết.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên trả trước bao nhiêu phần trăm?",
        a: "Ngân hàng tại Việt Nam thường yêu cầu tối thiểu 20–30% giá xe. Trả trước nhiều hơn mức tối thiểu giúp giảm tiền lãi, giảm khoản trả hằng tháng, và rút ngắn khoảng thời gian dư nợ lớn hơn giá trị xe. Bạn có thể thử vài mức trả trước trong công cụ để so sánh.",
      },
      {
        q: "Vì sao kỳ hạn dài lại đắt hơn dù trả hằng tháng ít hơn?",
        a: "Vì bạn trả lãi trong nhiều tháng hơn, và dư nợ giảm chậm hơn nên lãi tính trên số dư lớn hơn trong thời gian dài hơn. Hãy nhập cùng một khoản vay với kỳ hạn 3 năm và 7 năm để thấy chênh lệch tổng lãi.",
      },
      {
        q: "Tổng chi phí sở hữu xe gồm những gì?",
        a: "Trong công cụ này, đó là tiền trả trước cộng giá trị xe cũ cộng tổng số tiền trả cho khoản vay. Chưa gồm chi phí vận hành như bảo hiểm, đăng kiểm, bảo dưỡng, nhiên liệu và phí đường bộ — những khoản này thường đáng kể và nên được tính riêng.",
      },
      {
        q: "Lãi suất vay mua xe có giống vay mua nhà không?",
        a: "Thường cao hơn, vì kỳ hạn ngắn hơn và tài sản bảo đảm mất giá. Giống vay mua nhà, nhiều khoản vay mua xe cũng áp lãi ưu đãi trong thời gian đầu rồi chuyển sang lãi thả nổi, nên hãy hỏi ngân hàng mức lãi sau ưu đãi và thử tính lại với mức đó.",
      },
    ],
  },
} as const;
