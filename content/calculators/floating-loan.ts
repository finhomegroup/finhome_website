// Copy for /cong-cu/lai-suat-tha-noi/ — the floating-rate loan.
//
// Original FinHome copy. Shares lib/calc/floating-loan.ts with the
// fixed-vs-floating page.
//
// This is the shape almost every Vietnamese mortgage actually has, and the
// shape almost every calculator ignores. The number that matters is not the
// promotional instalment on the offer sheet; it is the one after the promo
// ends, and how much bigger it is.
//
// Figures quoted are the module's own output for 2 tỷ, 240 tháng, ưu đãi
// 7,5% trong 12 tháng rồi 11%: trả 16.111.864 ₫ trong năm đầu, rồi
// 20.479.346 ₫ — tăng 4.367.482 ₫, tức 27,11%. Dư nợ sau 12 tháng vẫn còn
// 1.955.136.259 ₫, nghĩa là cả năm ưu đãi chỉ trả được 44.863.741 ₫ gốc.
// Tổng lãi cả kỳ hạn 2.862.633.323 ₫.

export const FLOATING_LOAN = {
  slug: "/cong-cu/lai-suat-tha-noi",

  pageTitle: "Khoản vay lãi thả nổi: sau ưu đãi trả bao nhiêu?",
  metaTitle: "Tính khoản vay lãi thả nổi — Mức tăng khi hết ưu đãi",
  metaDescription:
    "Tính khoản trả hằng tháng trong và sau thời gian ưu đãi, mức tăng phải chịu, và tổng lãi khi lãi suất điều chỉnh theo kỳ. Công cụ miễn phí của FinHome.",

  lede:
    "Gần như mọi khoản vay mua nhà ở Việt Nam đều có lãi ưu đãi 6–24 tháng rồi chuyển sang lãi thả nổi. Con số trên tờ báo giá là khoản trả trong thời gian ưu đãi; con số quyết định bạn có trả được hay không là khoản trả sau đó.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền thực nhận từ ngân hàng.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    promoGroup: "Thời gian ưu đãi",
    promoMonthsLabel: "Số tháng ưu đãi",
    promoMonthsHelp:
      "Thường 6, 12, 18 hoặc 24 tháng. Nhập 0 nếu khoản vay không có lãi ưu đãi.",
    promoMonthsInvalid:
      "Vui lòng nhập số nguyên tháng từ 0 và nhỏ hơn kỳ hạn.",
    defaultPromoMonths: "12",

    promoRateLabel: "Lãi suất ưu đãi",
    promoRateUnit: "%/năm",
    promoRateHelp: "Mức lãi trong thời gian ưu đãi — con số trên tờ báo giá.",
    promoRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPromoRate: "7,5",

    postGroup: "Sau ưu đãi",
    postRateLabel: "Lãi suất sau ưu đãi",
    postRateUnit: "%/năm",
    postRateHelp:
      "Lãi cơ sở cộng biên độ. Hãy hỏi ngân hàng con số này bằng văn bản — đây là ô quan trọng nhất của trang.",
    postRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPostRate: "11",

    adjustEveryLabel: "Điều chỉnh lãi mỗi",
    adjustEveryUnit: "tháng",
    adjustEveryHelp:
      "Chu kỳ ngân hàng xem lại lãi suất, thường 3, 6 hoặc 12 tháng.",
    adjustEveryInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultAdjustEvery: "12",

    adjustStepLabel: "Mỗi lần điều chỉnh, lãi tăng",
    adjustStepUnit: "điểm %",
    adjustStepHelp:
      "Kịch bản DO BẠN đặt ra, không phải dự báo. Để 0 nếu bạn muốn giả định lãi sau ưu đãi không đổi.",
    adjustStepInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultAdjustStep: "0",

    rateCapLabel: "Trần lãi suất",
    rateCapUnit: "%/năm",
    rateCapHelp:
      "Mức lãi tối đa theo hợp đồng, nếu có. Để trống nếu hợp đồng không có trần — phần lớn hợp đồng ở Việt Nam thì không.",
    rateCapInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRateCap: "",

    resultTitle: "Khoản trả hằng tháng",
    firstPaymentLabel: "Trong thời gian ưu đãi",
    highestPaymentLabel: "Mức cao nhất phải chịu",
    shockLabel: "Tăng thêm so với thời gian ưu đãi",
    shockPercentLabel: "Tức tăng",

    detailTitle: "Chi tiết",
    totalInterestLabel: "Tổng lãi cả kỳ hạn",
    totalPaidLabel: "Tổng số tiền trả",
    monthsLabel: "Số tháng trả nợ",
    lowestPaymentLabel: "Mức thấp nhất",
    monthsUnit: "tháng",

    table: {
      caption: "Từng giai đoạn lãi suất",
      phaseColumn: "Tháng",
      rateColumn: "Lãi suất",
      paymentColumn: "Trả hằng tháng",
      interestColumn: "Lãi trong giai đoạn",
      principalColumn: "Gốc trong giai đoạn",
      balanceColumn: "Dư nợ cuối giai đoạn",
      intro:
        "Cột dư nợ là cột đáng xem nhất. Với khoản vay mặc định, sau cả năm ưu đãi dư nợ vẫn còn 1.955.136.259 ₫ — nghĩa là 12 tháng trả góp chỉ giảm được 44.863.741 ₫ tiền gốc trên khoản vay 2 tỷ. Lãi ưu đãi thấp nghe dễ chịu nhưng nó cũng có nghĩa là bạn gần như chưa bắt đầu trả nợ.",
    },
  },

  shockNotice:
    "Với khoản vay mặc định, khoản trả nhảy từ 16.111.864 ₫ lên 20.479.346 ₫ khi hết ưu đãi — tăng 4.367.482 ₫ mỗi tháng, tức 27,11%. Lý do mức tăng lớn hơn tỷ lệ tăng lãi suất: sau 12 tháng ưu đãi bạn chỉ trả được 44.863.741 ₫ gốc, nên gần như toàn bộ khoản vay được tính lại ở lãi suất mới, và tính trên 228 tháng còn lại thay vì 240. Trước khi ký, hãy tự hỏi bạn có trả được con số thứ hai không — đừng hỏi về con số thứ nhất.",

  formula: {
    title: "Cách tính",
    body: [
      "Trong mỗi giai đoạn lãi suất, khoản trả được tính theo công thức niên kim thông thường. Điểm khác biệt nằm ở thời điểm chuyển giai đoạn: khoản trả mới được tính lại trên DƯ NỢ CÒN LẠI trong SỐ THÁNG CÒN LẠI, đúng như ngân hàng làm.",
      "Với mặc định: giai đoạn ưu đãi tính 2 tỷ ở 7,5% trong 240 tháng cho khoản trả 16.111.864 ₫. Sau 12 tháng, dư nợ còn 1.955.136.259 ₫, và giai đoạn sau tính số đó ở 11% trong 228 tháng còn lại, cho 20.479.346 ₫.",
      "Đây là lý do mức tăng 27,11% lớn hơn cảm nhận về việc lãi tăng từ 7,5% lên 11%. Hai yếu tố cộng lại: dư nợ gần như không giảm trong năm ưu đãi, và số tháng còn lại để trải khoản nợ đã ngắn hơn 12 tháng.",
      "Ô “mỗi lần điều chỉnh lãi tăng” tạo ra một kịch bản nhiều giai đoạn: sau ưu đãi, lãi suất tăng thêm số điểm phần trăm đó ở mỗi chu kỳ xem lại, cho đến khi chạm trần nếu bạn có nhập trần. Đây là KỊCH BẢN bạn đặt ra để thử độ bền của tài chính mình, không phải dự báo — không trang tĩnh nào biết được lãi cơ sở ba năm sau ở đâu.",
      "Giai đoạn cuối luôn nhận phần tháng còn lại, nên tổng số tháng của các giai đoạn đúng bằng kỳ hạn. Dư nợ kết thúc ở đúng 0.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy lãi suất sau ưu đãi ở đâu?",
        a: "Hỏi ngân hàng và yêu cầu bằng văn bản, vì nó thường không nằm trên tờ quảng cáo. Công thức phổ biến là lãi cơ sở cộng biên độ, trong đó biên độ được ghi trong hợp đồng và lãi cơ sở do ngân hàng công bố theo kỳ. Nếu ngân hàng chỉ nói “theo lãi suất thị trường” mà không cho con số hay công thức, đó là dấu hiệu cần cẩn thận — hãy lấy mức lãi thả nổi ngân hàng đó đang áp cho khách hàng cũ làm mốc.",
      },
      {
        q: "Vì sao năm ưu đãi lại trả được ít gốc như vậy?",
        a: "Vì khoản trả được tính để trải đều trên toàn bộ 240 tháng, nên trong năm đầu phần lãi chiếm gần hết. Với mặc định, 12 tháng đầu trả tổng khoảng 193 triệu mà chỉ 44,86 triệu vào gốc. Lãi ưu đãi thấp làm khoản trả nhỏ, và khoản trả nhỏ nghĩa là trả gốc chậm — hai điều đó đi cùng nhau.",
      },
      {
        q: "Có nên trả thêm gốc trong thời gian ưu đãi?",
        a: "Nếu hợp đồng cho phép mà không thu phí, thì đây là thời điểm hiệu quả nhất: mỗi đồng gốc trả thêm trong năm ưu đãi làm giảm dư nợ được tính lại ở lãi suất cao hơn, nên nó cắt lãi nhiều hơn cùng số tiền đó ở giai đoạn sau. Nhưng hãy đọc điều khoản phí trả nợ trước hạn — nhiều hợp đồng thu 1–3% trong vài năm đầu, và khoản phí đó có thể xóa hết phần lợi.",
      },
      {
        q: "Nên thử kịch bản lãi tăng bao nhiêu?",
        a: "Đủ để biết ngưỡng chịu đựng của bạn, không phải để dự báo. Một cách thực dụng: nhập mức tăng sao cho lãi suất cuối kỳ cao hơn mức hiện tại 3–4 điểm phần trăm, rồi xem khoản trả cao nhất có vượt ngân sách hay không. Nếu có, hãy vay ít hơn hoặc chọn kỳ hạn dài hơn — đừng dựa vào giả định lãi suất sẽ không tăng.",
      },
      {
        q: "Trần lãi suất có phổ biến ở Việt Nam không?",
        a: "Không phổ biến với vay mua nhà cho cá nhân. Phần lớn hợp đồng chỉ ghi công thức lãi cơ sở cộng biên độ mà không có mức tối đa. Nếu hợp đồng của bạn có trần thì đó là một điều khoản đáng giá — hãy nhập vào ô trần và so tổng lãi với trường hợp không trần để thấy nó bảo vệ bạn bao nhiêu.",
      },
    ],
  },
} as const;
