// Copy for /cong-cu/thue-mua-xe/ — the vehicle lease calculator.
//
// Original FinHome copy. The arithmetic is the standard lease formula.
//
// TWO honesty notes drive this page, and both are in the copy above the tool:
//
// 1. Consumer car leasing barely exists in Vietnam. Cho thuê tài chính under
//    Nghị định 39/2014 is a licensed activity aimed at businesses, not a
//    retail product an individual walks into a dealership and signs. So the
//    page says who it is for rather than implying a Vietnamese consumer can
//    just choose this.
// 2. A lease leaves you owning nothing. The monthly figure is roughly half a
//    loan payment on the same car, and the copy puts both numbers side by
//    side so that gap cannot be mistaken for a saving.
//
// Figures quoted are the tool's own output for 800 triệu, trả trước 100 triệu,
// giá trị còn lại 440 triệu (55%), 36 tháng, 9%/năm, VAT 10%: khấu hao
// 7.222.222 ₫ + phí tài chính 4.275.000 ₫ = 11.497.222 ₫ trước thuế, VAT
// 1.149.722 ₫, tổng 12.646.944 ₫/tháng; tổng trả 455.290.000 ₫, tổng chi phí
// 555.290.000 ₫. Vay mua cùng xe: 22.259.813 ₫/tháng, lãi 101.353.263 ₫,
// tổng trả cho khoản vay 801.353.263 ₫ và bạn sở hữu chiếc xe.

export const AUTO_LEASE = {
  slug: "/cong-cu/thue-mua-xe",

  pageTitle: "Tính thuê mua xe: trả bao nhiêu mỗi tháng?",
  metaTitle: "Tính thuê mua xe — Khấu hao, phí tài chính và tổng chi phí",
  metaDescription:
    "Tính khoản trả hằng tháng của hợp đồng thuê mua xe: phần khấu hao, phần phí tài chính, VAT và tổng chi phí. Công cụ miễn phí của FinHome.",

  lede:
    "Khoản trả thuê mua không phải khoản trả vay trên một số tiền nhỏ hơn. Nó là hai khoản cộng lại: phần khấu hao trả cho giá trị chiếc xe mất đi trong thời gian bạn dùng, và phần phí tài chính là tiền thuê vốn của công ty cho thuê.",

  form: {
    vehicleGroup: "Xe và tiền trả trước",
    priceLabel: "Giá xe thương lượng",
    priceUnit: "₫",
    priceHelp:
      "Giá đã thỏa thuận, không phải giá niêm yết. Đây là con số quyết định phần khấu hao.",
    priceInvalid: "Vui lòng nhập giá xe lớn hơn 0.",
    defaultPrice: "800.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp: "Tiền mặt trả ngay, làm giảm số tiền được vốn hóa vào hợp đồng.",
    downInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDown: "100.000.000",

    tradeInLabel: "Giá trị xe cũ thu lại",
    tradeInUnit: "₫",
    tradeInHelp: "Số tiền được trừ khi đổi xe cũ. Để 0 nếu không có.",
    tradeInInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTradeIn: "0",

    feesLabel: "Phí gộp vào hợp đồng",
    feesUnit: "₫",
    feesHelp:
      "Phí hồ sơ, phí thu xếp và các khoản được cộng vào số tiền vốn hóa thay vì trả ngay. Để 0 nếu bạn trả riêng.",
    feesInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFees: "0",

    leaseGroup: "Điều kiện hợp đồng",
    residualLabel: "Giá trị còn lại cuối kỳ",
    residualUnit: "₫",
    residualHelp:
      "Giá trị chiếc xe được ấn định khi hết hạn hợp đồng. Không được lớn hơn số tiền vốn hóa. Với xe 3 năm, mức 50–60% giá xe là phổ biến.",
    residualInvalid:
      "Giá trị còn lại phải từ 0 trở lên và không vượt số tiền vốn hóa.",
    defaultResidual: "440.000.000",

    termLabel: "Thời hạn thuê",
    termHelp: "Số tháng của hợp đồng. Thường 24, 36 hoặc 48 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "36",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất hằng năm của hợp đồng. Công cụ tự quy về hệ số tiền tệ bằng cách chia 2400.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "9",

    taxLabel: "VAT trên khoản trả",
    taxUnit: "%",
    taxHelp:
      "VAT được tính trên từng khoản trả hằng tháng, không tính trên giá xe. Mức phổ thông là 10%.",
    taxInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTax: "10",

    resultTitle: "Khoản trả hằng tháng",
    monthlyLabel: "Trả hằng tháng, đã gồm VAT",
    depreciationLabel: "Trong đó phần khấu hao",
    financeLabel: "Trong đó phí tài chính",

    detailTitle: "Chi tiết",
    beforeTaxLabel: "Khoản trả trước thuế",
    taxResultLabel: "VAT mỗi tháng",
    capitalisedLabel: "Số tiền vốn hóa",
    moneyFactorLabel: "Hệ số tiền tệ",
    residualPercentLabel: "Giá trị còn lại so với giá xe",
    totalDepreciationLabel: "Tổng khấu hao cả kỳ",
    totalFinanceLabel: "Tổng phí tài chính cả kỳ",
    totalPaymentsLabel: "Tổng các khoản trả",
    totalCostLabel: "Tổng chi phí, gồm tiền trả trước",

    residualTooHighNotice:
      "Giá trị còn lại đang lớn hơn số tiền vốn hóa, nghĩa là chiếc xe phải TĂNG giá trong thời gian thuê. Phần khấu hao khi đó là số âm, nên phép tính không có kết quả. Hãy giảm giá trị còn lại hoặc giảm tiền trả trước.",
  },

  contextNotice:
    "Hai điều cần biết trước khi đọc con số. Thứ nhất, thuê mua xe cho cá nhân gần như không tồn tại ở Việt Nam: cho thuê tài chính là hoạt động có giấy phép, chủ yếu dành cho doanh nghiệp và tài sản phục vụ kinh doanh. Trang này hữu ích nhất khi bạn đang đọc một hợp đồng cho thuê tài chính của doanh nghiệp, hoặc đang so sánh với thị trường nước ngoài. Thứ hai, hết hạn hợp đồng bạn KHÔNG sở hữu chiếc xe. Với ví dụ mặc định, thuê mua trả 12.646.944 ₫ mỗi tháng còn vay mua cùng chiếc xe đó trả 22.259.813 ₫ — nhưng sau 36 tháng người vay có một chiếc xe trị giá khoảng 440 triệu, người thuê có một bộ chìa khóa phải trả lại.",

  formula: {
    title: "Cách tính",
    body: [
      "Số tiền vốn hóa = giá xe − tiền trả trước − giá trị xe cũ + phí gộp vào hợp đồng. Với mặc định là 700.000.000 ₫.",
      "Phần khấu hao mỗi tháng = (số tiền vốn hóa − giá trị còn lại) ÷ số tháng. Đây là tiền bạn trả cho phần giá trị chiếc xe mất đi: (700 − 440) triệu chia 36 tháng bằng 7.222.222 ₫.",
      "Phần phí tài chính mỗi tháng = (số tiền vốn hóa + giá trị còn lại) × hệ số tiền tệ, với hệ số tiền tệ = lãi suất năm ÷ 2400. Chú ý phép CỘNG: phí được tính trên tổng giá trị đầu kỳ và cuối kỳ, không phải trên một dư nợ giảm dần, vì trung bình trong cả kỳ hạn thì đó mới là số vốn đang nằm ở chiếc xe. Với mặc định: (700 + 440) triệu × 0,00375 = 4.275.000 ₫.",
      "Con số 2400 là 12 tháng × 200, trong đó 200 đến từ việc lấy tổng hai giá trị thay cho hai lần số dư bình quân. Đây là lý do phí tài chính của hợp đồng thuê KHÔNG giảm dần theo thời gian như tiền lãi của khoản vay.",
      "Khoản trả trước thuế = khấu hao + phí tài chính = 11.497.222 ₫. VAT được tính trên khoản trả này, không trên giá xe: 10% là 1.149.722 ₫, nên khoản trả hằng tháng là 12.646.944 ₫.",
      "Giá trị còn lại càng cao thì khoản trả càng thấp nhưng phí tài chính càng CAO — vì có nhiều vốn hơn nằm ở chiếc xe suốt kỳ hạn. Hãy thử tăng giảm ô giá trị còn lại để thấy hai dòng kết quả đi ngược chiều nhau.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Thuê mua và vay mua, cái nào rẻ hơn?",
        a: "Không so được trực tiếp, vì hai bên cho ra hai thứ khác nhau. Với ví dụ mặc định, thuê mua tốn 555.290.000 ₫ trong 36 tháng và bạn không có gì; vay mua tốn 901.353.263 ₫ gồm tiền trả trước nhưng bạn có một chiếc xe. Cách so công bằng là lấy tổng chi phí vay mua trừ giá trị chiếc xe khi hết 36 tháng, rồi đặt cạnh tổng chi phí thuê mua. Với các con số mặc định thì hai bên khá gần nhau, và lựa chọn phụ thuộc vào việc bạn có muốn giữ xe hay không.",
      },
      {
        q: "Giá trị còn lại nên là bao nhiêu?",
        a: "Con số này do bên cho thuê ấn định, không phải bạn chọn, và nó phản ánh dự đoán về giá xe khi hết hợp đồng. Xe giữ giá tốt có giá trị còn lại cao và vì thế khoản trả thấp hơn. Nếu bên cho thuê đưa ra một mức bạn thấy quá cao so với thực tế thị trường xe cũ, hãy để ý điều khoản mua lại cuối kỳ — mua lại theo một giá trị còn lại được thổi lên là một lựa chọn tồi.",
      },
      {
        q: "Vì sao giá trị còn lại cao lại làm phí tài chính tăng?",
        a: "Vì phí tài chính được tính trên tổng giá trị đầu kỳ và cuối kỳ. Giá trị còn lại cao nghĩa là bên cho thuê vẫn còn nhiều vốn nằm ở chiếc xe cho đến ngày cuối cùng, nên họ thu tiền thuê vốn trên số đó. Tổng khoản trả vẫn giảm, vì phần khấu hao giảm nhiều hơn mức phí tài chính tăng — nhưng tỷ trọng phí tài chính trong khoản trả thì tăng lên.",
      },
      {
        q: "Công cụ có tính phí vượt số km và phí hư hỏng không?",
        a: "Không. Hợp đồng thuê mua thường giới hạn số km mỗi năm và thu phí cho mỗi km vượt, cùng với phí cho hư hỏng vượt mức bình thường khi trả xe. Đây là hai khoản chi phí xuất hiện ở cuối hợp đồng và có thể lớn. Hãy đọc kỹ hai điều khoản đó và cộng ước tính vào tổng chi phí mà công cụ đưa ra.",
      },
      {
        q: "Hết hạn hợp đồng thì có mua lại được xe không?",
        a: "Tùy hợp đồng. Nhiều hợp đồng cho thuê tài chính tại Việt Nam có điều khoản chuyển quyền sở hữu khi kết thúc, thường ở mức giá trị còn lại hoặc một giá tượng trưng — đây chính là điểm khác biệt so với hình thức thuê hoạt động ở nước ngoài. Nếu hợp đồng của bạn có điều khoản này ở mức giá trị còn lại, thì tổng chi phí để cuối cùng sở hữu xe là tổng chi phí mà công cụ tính cộng thêm giá trị còn lại.",
      },
    ],
  },
} as const;
