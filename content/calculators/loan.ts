// Copy for /cong-cu/vay-mua-nha/ — the loan / mortgage calculator.
//
// Original FinHome copy. The arithmetic is standard finance; none of the
// wording is copied from any third-party reference tool.
//
// Two honesty notes are load-bearing here and must not be trimmed:
//
// 1. `floatingRateNotice` — the tool models a FIXED rate for the whole term.
//    Vietnamese home loans almost always carry a promotional rate for the
//    first 6–24 months and then float, so a real borrower's instalment RISES
//    after the promotional period. Showing a flat 20-year payment without
//    saying so would understate what somebody actually pays.
// 2. `pmiNotice` — PMI is a United States mortgage construct. The fields exist
//    for parity with the reference tool; Vietnamese lenders do not charge it.

export const LOAN = {
  slug: "/cong-cu/vay-mua-nha",

  pageTitle: "Tính khoản vay mua nhà: trả bao nhiêu mỗi tháng?",
  metaTitle: "Tính khoản vay mua nhà — Trả hằng tháng & bảng trả nợ",
  metaDescription:
    "Nhập số tiền vay, lãi suất và kỳ hạn để biết số tiền phải trả mỗi tháng, tổng lãi và bảng trả nợ từng năm. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập số tiền vay, lãi suất và kỳ hạn để xem khoản trả hằng tháng, tổng lãi phải trả và bảng trả nợ theo từng năm. Bạn cũng có thể thêm khoản trả trước hạn mỗi tháng để xem tiết kiệm được bao nhiêu.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Nhập số tiền vay, ví dụ 2.000.000.000.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Thời gian vay. Kỳ hạn phổ biến ở Việt Nam là 15–25 năm.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",

    extraLabel: "Trả thêm mỗi tháng",
    extraUnit: "₫",
    extraHelp: "Số tiền trả thêm vào gốc mỗi tháng. Để trống nếu không có.",
    extraInvalid: "Số tiền trả thêm không được là số âm.",
    defaultExtra: "0",

    costGroup: "Chi phí kèm theo",
    taxLabel: "Thuế nhà đất mỗi năm",
    taxUnit: "₫",
    taxHelp: "Để 0 nếu không áp dụng.",
    insuranceLabel: "Bảo hiểm mỗi năm",
    insuranceUnit: "₫",
    insuranceHelp: "Bảo hiểm khoản vay hoặc bảo hiểm tài sản, mỗi năm.",
    otherFeeLabel: "Phí khác mỗi năm",
    otherFeeUnit: "₫",
    otherFeeHelp: "Ví dụ phí quản lý chung cư, mỗi năm.",
    costInvalid: "Chi phí không được là số âm.",

    pmiGroup: "Bảo hiểm khoản vay (PMI)",
    pmiLabel: "Tỷ lệ PMI",
    pmiUnit: "%/năm",
    pmiHelp: "Tính theo phần trăm số tiền vay mỗi năm. Để 0 nếu không áp dụng.",
    pmiInvalid: "Tỷ lệ PMI không được là số âm.",
    priceLabel: "Giá bất động sản",
    priceUnit: "₫",
    priceHelp: "Chỉ cần khi bạn chọn dừng PMI ở mốc 80%.",
    pmiModeLegend: "Thời gian thu PMI",
    pmiModeUntil80: "Dừng khi dư nợ còn 80% giá bất động sản",
    pmiModeLife: "Thu suốt kỳ hạn vay",
    defaultPmiMode: "until80",

    resultTitle: "Kết quả",
    monthlyPaymentLabel: "Tổng trả hằng tháng",
    principalInterestLabel: "Trong đó gốc và lãi",
    escrowLabel: "Trong đó thuế, bảo hiểm và phí",
    pmiMonthlyLabel: "Trong đó PMI",
    annualPaymentLabel: "Trả mỗi năm",
    totalInterestLabel: "Tổng lãi phải trả",
    totalPaymentLabel: "Tổng số tiền phải trả",
    mortgageConstantLabel: "Hệ số khoản vay",
    termResultLabel: "Số tháng thực tế",

    extraResultTitle: "Nếu trả thêm mỗi tháng",
    interestSavingLabel: "Tiền lãi tiết kiệm được",
    monthsSavedLabel: "Trả xong sớm hơn",
    monthsUnit: "tháng",

    invalidSummary:
      "Vui lòng kiểm tra lại các số đã nhập — chưa thể tính được khoản vay.",
  },

  table: {
    caption: "Bảng trả nợ theo từng năm",
    intro:
      "Mỗi dòng là một năm. Ở những năm đầu, phần lớn số tiền bạn trả là lãi; càng về sau tỷ lệ trả gốc càng tăng.",
    yearColumn: "Năm",
    interestColumn: "Lãi trả trong năm",
    principalColumn: "Gốc trả trong năm",
    balanceColumn: "Dư nợ cuối năm",
  },

  floatingRateNotice:
    "Công cụ giả định lãi suất không đổi suốt kỳ hạn. Trên thực tế, phần lớn khoản vay mua nhà tại Việt Nam áp dụng lãi suất ưu đãi trong 6–24 tháng đầu, sau đó chuyển sang lãi suất thả nổi theo lãi suất cơ sở của ngân hàng cộng biên độ. Vì vậy số tiền bạn phải trả thực tế sẽ tăng lên sau thời gian ưu đãi. Hãy hỏi ngân hàng về mức lãi suất sau ưu đãi và thử tính lại với mức đó.",

  pmiNotice:
    "PMI (private mortgage insurance) là loại bảo hiểm khoản vay theo quy định của Hoa Kỳ. Các trường này có để đối chiếu với công cụ tham khảo; ngân hàng tại Việt Nam không thu PMI. Nếu bạn vay trong nước, hãy để tỷ lệ PMI bằng 0.",

  formula: {
    title: "Công thức tính",
    body: [
      "Khoản trả gốc và lãi hằng tháng được tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), trong đó P là số tiền vay, r là lãi suất mỗi tháng (lãi suất năm chia 12 rồi chia 100) và n là số tháng vay.",
      "Mỗi tháng, tiền lãi bằng dư nợ đầu kỳ nhân lãi suất tháng; phần còn lại của khoản trả được dùng để giảm gốc. Vì dư nợ giảm dần nên tiền lãi giảm dần và phần trả gốc tăng dần, dù tổng số tiền trả mỗi tháng không đổi.",
      "Khi bạn trả thêm vào gốc, dư nợ giảm nhanh hơn nên tổng tiền lãi giảm và kỳ hạn được rút ngắn. Công cụ tính cả hai trường hợp rồi lấy phần chênh lệch.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao số tiền trả hằng tháng không đổi nhưng tiền lãi lại giảm?",
        a: "Vì cách tính theo niên kim: tổng khoản trả mỗi tháng được giữ cố định, nhưng bên trong đó tỷ lệ giữa gốc và lãi thay đổi. Tiền lãi luôn tính trên dư nợ còn lại, nên khi dư nợ giảm thì tiền lãi giảm và phần trả gốc tăng tương ứng.",
      },
      {
        q: "Trả thêm mỗi tháng có thực sự tiết kiệm nhiều không?",
        a: "Có, và thường nhiều hơn dự đoán, vì mỗi đồng trả thêm đều làm giảm dư nợ mà lãi được tính trên đó. Bạn hãy thử nhập một khoản trả thêm vào công cụ để thấy phần lãi tiết kiệm được và số tháng rút ngắn. Lưu ý hỏi ngân hàng về phí trả nợ trước hạn, thường khoảng 1–3% số tiền trả trước và giảm dần theo thời gian.",
      },
      {
        q: "Kết quả này có đúng với khoản vay thật của tôi không?",
        a: "Đúng về mặt công thức, nhưng công cụ giả định lãi suất không đổi. Khoản vay mua nhà tại Việt Nam thường có lãi ưu đãi vài tháng đầu rồi chuyển sang lãi thả nổi, nên số tiền trả thực tế sẽ tăng sau thời gian ưu đãi. Hãy tính thử với cả mức lãi ưu đãi và mức lãi sau ưu đãi để thấy khoảng dao động.",
      },
      {
        q: "Hệ số khoản vay dùng để làm gì?",
        a: "Hệ số khoản vay là tổng số tiền gốc và lãi phải trả trong một năm chia cho số tiền vay ban đầu. Nó cho biết mỗi đồng vay tiêu tốn bao nhiêu đồng mỗi năm, nên tiện để so sánh nhanh giữa các phương án vay có số tiền và kỳ hạn khác nhau.",
      },
    ],
  },
} as const;
