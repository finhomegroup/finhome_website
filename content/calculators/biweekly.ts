// Copy for /cong-cu/tra-no-hai-tuan/ — the bi-weekly repayment calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// `prepaymentNotice` is load-bearing for Vietnam: most domestic lenders charge
// a prepayment penalty, and paying fortnightly is a form of prepaying. Showing
// a saving without mentioning that fee would overstate the benefit.

export const BIWEEKLY = {
  slug: "/cong-cu/tra-no-hai-tuan",

  pageTitle: "Trả nợ hai tuần một lần tiết kiệm bao nhiêu?",
  metaTitle: "Trả nợ hai tuần một lần — Tiết kiệm lãi và rút ngắn kỳ hạn",
  metaDescription:
    "So sánh trả nợ hằng tháng với trả nửa kỳ mỗi hai tuần: số tiền lãi tiết kiệm được và số năm rút ngắn. Công cụ miễn phí của FinHome.",

  lede:
    "Thay vì trả một lần mỗi tháng, bạn trả một nửa số đó mỗi hai tuần. Vì một năm có 26 kỳ hai tuần, tương đương 13 kỳ hằng tháng thay vì 12, nên mỗi năm bạn trả thêm được khoảng một kỳ và dư nợ giảm nhanh hơn.",

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
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Kỳ hạn theo hợp đồng, tính theo cách trả hằng tháng.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",

    resultTitle: "So sánh hai cách trả",
    monthlyPaymentLabel: "Trả hằng tháng",
    biweeklyPaymentLabel: "Trả mỗi hai tuần",
    monthlyInterestLabel: "Tổng lãi khi trả hằng tháng",
    biweeklyInterestLabel: "Tổng lãi khi trả hai tuần",
    savingLabel: "Tiền lãi tiết kiệm được",
    payoffLabel: "Trả xong sau",
    payoffUnit: "năm",
    monthsSavedLabel: "Rút ngắn được",
    monthsUnit: "tháng",
    periodsLabel: "Số kỳ trả",
    periodsUnit: "kỳ",
  },

  prepaymentNotice:
    "Trả hai tuần một lần thực chất là trả nợ trước hạn. Phần lớn ngân hàng tại Việt Nam thu phí trả nợ trước hạn, thường khoảng 1–3% số tiền trả trước và giảm dần theo thời gian, và không phải ngân hàng nào cũng cho phép lịch trả hai tuần. Hãy hỏi ngân hàng về cả hai điều này trước khi tính khoản tiết kiệm là chắc chắn.",

  formula: {
    title: "Vì sao cách này tiết kiệm được",
    body: [
      "Một năm có 52 tuần, tức 26 kỳ hai tuần. Nếu mỗi kỳ bạn trả một nửa khoản trả hằng tháng, tổng số tiền trả trong năm bằng 13 khoản trả hằng tháng, trong khi trả theo tháng chỉ là 12 khoản. Phần chênh lệch đó đi thẳng vào gốc.",
      "Ngoài ra, dư nợ được giảm sớm hơn hai tuần một lần thay vì mỗi tháng một lần, nên tiền lãi tính trên dư nợ cũng thấp hơn. Hai yếu tố này cộng lại tạo ra khoản tiết kiệm.",
      "Công cụ tính lãi mỗi kỳ hai tuần bằng lãi suất năm chia cho 26, rồi chạy bảng trả nợ đến khi dư nợ về 0, và đem so với bảng trả nợ hằng tháng thông thường.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ngân hàng ở Việt Nam có cho trả hai tuần một lần không?",
        a: "Không phải ngân hàng nào cũng có lịch trả hai tuần. Nếu ngân hàng của bạn không hỗ trợ, bạn có thể đạt hiệu quả tương tự bằng cách giữ lịch trả hằng tháng nhưng trả thêm vào gốc mỗi tháng một khoản bằng khoảng một phần mười hai kỳ trả. Hãy hỏi ngân hàng về phí trả nợ trước hạn trước khi làm.",
      },
      {
        q: "Vì sao tiết kiệm được nhiều hơn tôi tưởng?",
        a: "Vì khoản trả thêm mỗi năm đi trực tiếp vào gốc, mà tiền lãi luôn tính trên dư nợ còn lại. Mỗi đồng gốc trả sớm đều tiết kiệm toàn bộ phần lãi mà đồng đó sẽ phát sinh trong những năm còn lại của khoản vay.",
      },
      {
        q: "Có rủi ro gì khi chọn cách này?",
        a: "Rủi ro chính là phí trả nợ trước hạn và áp lực dòng tiền: bạn thực tế trả nhiều hơn khoảng một kỳ mỗi năm. Nếu quỹ dự phòng của bạn còn mỏng, việc giữ tiền mặt có thể quan trọng hơn khoản lãi tiết kiệm được.",
      },
    ],
  },
} as const;
