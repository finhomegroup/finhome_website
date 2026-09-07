// Copy for /cong-cu/lai-kep/ — the compound interest calculator.
//
// Original FinHome copy. The arithmetic is standard finance; none of the
// wording is copied from any third-party reference tool.

export const COMPOUND = {
  slug: "/cong-cu/lai-kep",

  pageTitle: "Tính lãi kép: tiền của bạn lớn lên bao nhiêu?",
  metaTitle: "Tính lãi kép — Số tiền tương lai và lãi nhận được",
  metaDescription:
    "Nhập số tiền ban đầu, lãi suất, kỳ hạn và khoản gửi thêm định kỳ để biết số tiền tương lai, tổng lãi và bảng tăng trưởng theo từng năm. Công cụ miễn phí của FinHome.",

  lede:
    "Lãi kép là khi tiền lãi được nhập vào gốc và tiếp tục sinh lãi. Nhập số tiền ban đầu, lãi suất và kỳ hạn để xem số tiền cuối kỳ, phần lãi bạn nhận được và mức tăng qua từng năm.",

  form: {
    depositGroup: "Khoản gửi",
    principalLabel: "Số tiền ban đầu",
    principalUnit: "₫",
    principalHelp: "Số tiền bạn có ngay bây giờ. Nhập 0 nếu bắt đầu từ đầu.",
    principalInvalid: "Số tiền ban đầu không được là số âm.",
    defaultPrincipal: "100.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 6.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "6",

    yearsLabel: "Số năm gửi",
    yearsUnit: "năm",
    yearsHelp: "Thời gian bạn để tiền tiếp tục sinh lãi.",
    yearsInvalid: "Vui lòng nhập số năm lớn hơn 0.",
    defaultYears: "10",

    compoundingLabel: "Kỳ ghép lãi",
    compoundingHelp:
      "Lãi được nhập vào gốc bao nhiêu lần mỗi năm. Ghép lãi càng thường xuyên thì lãi suất thực tế càng cao.",
    defaultCompounding: "monthly",
    compoundingOptions: [
      { value: "annually", label: "Hằng năm" },
      { value: "semiannually", label: "Nửa năm" },
      { value: "quarterly", label: "Hằng quý" },
      { value: "monthly", label: "Hằng tháng" },
      { value: "daily", label: "Hằng ngày" },
    ],

    contributionLabel: "Gửi thêm mỗi kỳ",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền bạn gửi thêm vào mỗi kỳ ghép lãi. Để 0 nếu chỉ gửi một lần.",
    contributionInvalid: "Số tiền gửi thêm không được là số âm.",
    defaultContribution: "0",

    resultTitle: "Kết quả",
    futureValueLabel: "Số tiền cuối kỳ",
    contributedLabel: "Tổng số tiền bạn đã gửi",
    interestLabel: "Tổng lãi nhận được",
    effectiveRateLabel: "Lãi suất thực tế mỗi năm",
    periodsLabel: "Số kỳ ghép lãi",
    periodsUnit: "kỳ",

    emptyNotice:
      "Nhập số tiền ban đầu hoặc khoản gửi thêm lớn hơn 0 để xem kết quả.",
  },

  table: {
    caption: "Số dư cuối mỗi năm",
    intro:
      "Mỗi dòng là số dư vào cuối năm đó. Phần lãi tăng nhanh dần về sau, vì lãi của những năm trước cũng bắt đầu sinh lãi.",
    yearColumn: "Năm",
    contributedColumn: "Đã gửi",
    interestColumn: "Lãi cộng dồn",
    balanceColumn: "Số dư cuối năm",
  },

  formula: {
    title: "Công thức tính",
    body: [
      "Với một khoản gửi duy nhất: Số tiền cuối kỳ = P × (1 + r/m)^(m×t), trong đó P là số tiền ban đầu, r là lãi suất năm, m là số kỳ ghép lãi trong một năm và t là số năm.",
      "Nếu bạn gửi thêm một khoản đều đặn mỗi kỳ, phần đó được tính theo công thức niên kim: Số tiền cuối kỳ = A × ((1 + i)^n − 1) ÷ i, với A là khoản gửi mỗi kỳ, i là lãi suất mỗi kỳ và n là tổng số kỳ. Công cụ cộng hai phần này lại.",
      "Lãi suất thực tế mỗi năm cao hơn lãi suất danh nghĩa khi ghép lãi nhiều lần trong năm: (1 + r/m)^m − 1. Ví dụ 6%/năm ghép lãi hằng tháng cho lãi suất thực tế khoảng 6,17%/năm.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lãi kép khác lãi đơn ở đâu?",
        a: "Lãi đơn chỉ tính trên số tiền gốc ban đầu, nên tiền lãi mỗi năm bằng nhau. Lãi kép tính trên cả gốc và phần lãi đã nhận, nên tiền lãi mỗi năm một tăng. Càng gửi lâu thì khoảng cách giữa hai cách tính càng lớn.",
      },
      {
        q: "Ghép lãi hằng tháng có lợi hơn hằng năm nhiều không?",
        a: "Có lợi hơn nhưng không nhiều như nhiều người nghĩ. Ở mức 6%/năm, ghép lãi hằng tháng cho lãi suất thực tế khoảng 6,17%/năm so với 6% khi ghép hằng năm. Kỳ hạn và lãi suất ảnh hưởng lớn hơn tần suất ghép lãi.",
      },
      {
        q: "Vì sao nên gửi thêm đều đặn thay vì chờ có nhiều tiền?",
        a: "Vì mỗi khoản gửi sớm đều có thêm thời gian sinh lãi. Trong công cụ này, bạn có thể để số tiền ban đầu bằng 0 và chỉ nhập khoản gửi thêm mỗi kỳ để thấy một khoản nhỏ đều đặn tích lũy thành bao nhiêu.",
      },
      {
        q: "Kết quả có trừ thuế và lạm phát chưa?",
        a: "Chưa. Công cụ tính theo lãi suất bạn nhập và giả định lãi suất không đổi suốt kỳ hạn. Trên thực tế lãi suất tiết kiệm thay đổi theo từng kỳ gửi, và lạm phát làm giảm sức mua của số tiền cuối kỳ, nên hãy xem kết quả là con số trước lạm phát.",
      },
    ],
  },
} as const;
