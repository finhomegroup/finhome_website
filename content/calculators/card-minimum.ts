// Copy for /cong-cu/tra-toi-thieu-the-tin-dung/ — the minimum payment tool.
//
// Original FinHome copy. The arithmetic follows how a card statement works.
//
// Figures quoted below are the tool's own output for 50 triệu at 30%/năm với
// mức tối thiểu 5% và sàn 500.000 ₫, read off the module: 90 tháng (7,5 năm),
// tổng lãi 43.091.470 ₫ tức 86,2% dư nợ, khoản trả đầu 2.563.261 ₫ — tức 5%
// của dư nợ cuối kỳ đầu tiên, 51.265.229,61 ₫ (hiển thị 51.265.230 ₫). Trả ĐÚNG
// con số 2.563.261 ₫ đó mỗi tháng nhưng CỐ ĐỊNH: chỉ 28 tháng và lãi
// 19.799.257 ₫ — nhanh hơn hơn ba lần, lãi thấp hơn một nửa. Thêm 1 triệu mỗi
// tháng trên mức tối thiểu: 31 tháng, lãi 17.800.490 ₫.
//
// That fixed-vs-minimum comparison IS the page. It is computed here rather
// than described, so the numbers cannot drift from the claim.

export const CARD_MINIMUM = {
  slug: "/cong-cu/tra-toi-thieu-the-tin-dung",

  pageTitle: "Trả mức tối thiểu thẻ tín dụng: mất bao nhiêu năm?",
  metaTitle: "Tính trả mức tối thiểu thẻ tín dụng — Bẫy trả tối thiểu",
  metaDescription:
    "Tính số năm và tổng lãi nếu bạn chỉ trả mức tối thiểu của thẻ tín dụng, và so với việc trả cùng số tiền đó nhưng cố định. Công cụ miễn phí của FinHome.",

  lede:
    "Mức trả tối thiểu là một tỷ lệ phần trăm của dư nợ, nên nó nhỏ dần đúng theo tốc độ dư nợ giảm. Đó là lý do trả tối thiểu mất nhiều năm — và là lý do trả CỐ ĐỊNH đúng số tiền tối thiểu của tháng đầu lại nhanh hơn nhiều lần.",

  form: {
    group: "Dư nợ thẻ",
    balanceLabel: "Dư nợ hiện tại",
    balanceUnit: "₫",
    balanceHelp: "Tổng dư nợ trên sao kê.",
    balanceInvalid: "Vui lòng nhập dư nợ lớn hơn 0.",
    defaultBalance: "50.000.000",

    rateLabel: "Lãi suất thẻ",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi trong biểu phí, thường 20–40%/năm với thẻ tại Việt Nam.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "30",

    minimumGroup: "Quy định mức tối thiểu",
    percentLabel: "Mức tối thiểu",
    percentUnit: "% dư nợ cuối kỳ",
    percentHelp:
      "Phần trăm dư nợ cuối kỳ mà bạn buộc phải trả. Phần lớn thẻ tại Việt Nam quy định 5%.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultPercent: "5",

    floorLabel: "Mức sàn",
    floorUnit: "₫",
    floorHelp:
      "Số tiền tối thiểu tuyệt đối, áp dụng khi tỷ lệ phần trăm cho ra con số nhỏ hơn. Chính mức sàn này mới là thứ dứt điểm được món nợ.",
    floorInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFloor: "500.000",

    extraLabel: "Trả thêm mỗi tháng",
    extraUnit: "₫",
    extraHelp:
      "Số tiền cố định bạn trả thêm trên mức tối thiểu. Để 0 để thấy trường hợp chỉ trả tối thiểu.",
    extraInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultExtra: "0",

    resultTitle: "Nếu chỉ trả mức tối thiểu",
    monthsLabel: "Thời gian để hết nợ",
    totalInterestLabel: "Tổng lãi phải trả",
    interestShareLabel: "Lãi so với dư nợ",
    monthsUnit: "tháng",
    yearsUnit: "năm",

    compareTitle: "Nếu trả cố định đúng số tiền đó",
    compareIntro: "Cùng số tiền của tháng đầu, nhưng giữ nguyên mỗi tháng",
    compareMonthsLabel: "Thời gian để hết nợ",
    compareInterestLabel: "Tổng lãi phải trả",
    compareSavedMonthsLabel: "Nhanh hơn",
    compareSavedInterestLabel: "Tiết kiệm lãi",

    detailTitle: "Chi tiết",
    firstPaymentLabel: "Mức tối thiểu tháng đầu",
    firstInterestLabel: "Tiền lãi tháng đầu",
    lastPaymentLabel: "Khoản trả tháng cuối",
    totalPaidLabel: "Tổng số tiền bỏ ra",

    noPayoffNotice:
      "Với các con số này, mức tối thiểu không bao giờ bù nổi tiền lãi, nên dư nợ tăng lên mãi và món nợ không bao giờ hết. Điều này xảy ra khi tỷ lệ tối thiểu quá thấp so với lãi suất và không có mức sàn. Hãy kiểm tra lại biểu phí của thẻ — gần như mọi thẻ đều có mức sàn.",
  },

  trapNotice:
    "Đây là con số đáng nhớ nhất của trang này. Dư nợ 50 triệu trên thẻ 30%/năm, trả tối thiểu 5%: mất 90 tháng — bảy năm rưỡi — và tổng lãi 43.091.470 ₫, gần bằng số đã nợ. Mức tối thiểu tháng đầu là 2.563.261 ₫. Nếu bạn trả ĐÚNG 2.563.261 ₫ đó mỗi tháng nhưng giữ nguyên không giảm: hết nợ sau 28 tháng và tổng lãi 19.799.257 ₫. Cùng một số tiền ở tháng đầu, chênh nhau 62 tháng và hơn 23 triệu tiền lãi. Khác biệt duy nhất là bạn không hạ mức trả xuống khi dư nợ giảm.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi mỗi tháng = dư nợ × ((1 + lãi suất năm ÷ 365)^(365 ÷ 12) − 1), vì lãi thẻ cộng theo ngày. Thẻ 30%/năm tương đương 2,5305% một tháng.",
      "Mức tối thiểu = phần trăm × dư nợ CUỐI KỲ, tức dư nợ đã cộng lãi của tháng đó, và không thấp hơn mức sàn. Đây đúng là cách sao kê tính, nên mức tối thiểu tháng đầu của 50 triệu ở 30%/năm là 5% × 51.265.229,61 = 2.563.261 ₫, không phải 5% × 50 triệu.",
      "Vì mức tối thiểu là một tỷ lệ của dư nợ, nó co lại cùng dư nợ. Phần trả vào gốc mỗi tháng do đó cũng co lại, và tốc độ giảm nợ chậm dần theo thời gian — đây là lý do toán học của việc trả tối thiểu mất nhiều năm.",
      "Chính MỨC SÀN mới dứt điểm được món nợ. Khi dư nợ đã nhỏ, 5% của nó thấp hơn mức sàn, nên khoản trả dừng co lại và phần trả vào gốc bắt đầu tăng trở lại. Nếu thẻ không có mức sàn và tỷ lệ tối thiểu thấp hơn lãi suất tháng, món nợ không bao giờ hết — công cụ trả về trạng thái không có kết quả trong trường hợp đó.",
      "Phần so sánh lấy đúng mức tối thiểu của tháng đầu và mô phỏng lại như một khoản trả cố định. Hai bên khởi đầu bằng cùng một số tiền, nên chênh lệch kết quả hoàn toàn đến từ việc một bên hạ mức trả theo dư nợ và bên kia thì không.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Trả mức tối thiểu có ảnh hưởng điểm tín dụng không?",
        a: "Trả đủ mức tối thiểu và đúng hạn thì không bị ghi nhận là chậm trả, nên nó vẫn tốt hơn nhiều so với trả trễ. Nhưng dư nợ cao duy trì lâu làm tỷ lệ sử dụng hạn mức luôn ở mức cao, và tỷ lệ này ảnh hưởng tới hồ sơ tín dụng của bạn tại CIC khi ngân hàng xét khoản vay khác. Trả tối thiểu là cách tránh vi phạm, không phải cách quản lý nợ.",
      },
      {
        q: "Vì sao chỉ cần giữ nguyên mức trả đã tiết kiệm được nhiều như vậy?",
        a: "Vì mỗi đồng vượt trên mức tối thiểu đi thẳng vào gốc, và mỗi đồng gốc trả sớm sẽ tiết kiệm lãi cho toàn bộ số tháng còn lại. Khi dư nợ giảm, mức tối thiểu tự động giảm theo và bạn vô tình trả ít gốc hơn đúng lúc lẽ ra nên trả nhiều hơn. Cách đơn giản nhất: đặt một lệnh chuyển tiền định kỳ với số tiền cố định, thay vì trả theo con số in trên sao kê.",
      },
      {
        q: "Nên trả bao nhiêu là hợp lý?",
        a: "Nhiều nhất mức bạn chịu được, và tốt nhất là trả hết toàn bộ dư nợ đúng hạn mỗi kỳ để không phát sinh lãi. Nếu chưa làm được, hãy đặt một mức cố định và giữ nguyên. Công cụ tính trả hết nợ thẻ tín dụng của FinHome cho biết cần trả bao nhiêu mỗi tháng để hết nợ trong 12, 18 hay 24 tháng.",
      },
      {
        q: "Có nên vay tiêu dùng để trả hết thẻ không?",
        a: "Thường là có lợi về mặt số học, vì khoản vay tiêu dùng có kỳ hạn thường 15–25%/năm so với 20–40%/năm của thẻ, và nó có kỳ hạn cố định nên buộc dư nợ phải giảm. Nhưng chỉ có ích nếu bạn ngừng dùng thẻ sau đó — nếu dư nợ thẻ lại tăng lên thì bạn có hai món nợ thay vì một. Hãy so bằng tổng lãi: chạy công cụ này cho thẻ và công cụ so sánh khoản vay cho khoản vay.",
      },
      {
        q: "Mức tối thiểu ở thẻ của tôi là 5% hay khác?",
        a: "Hãy tra biểu phí của chính thẻ đó. Phần lớn thẻ tại Việt Nam quy định 5% dư nợ cuối kỳ với một mức sàn, nhưng con số này khác nhau giữa các ngân hàng và một số thẻ dùng mức khác. Cả tỷ lệ và mức sàn đều là ô nhập trong công cụ vì chúng thay đổi kết quả đáng kể.",
      },
    ],
  },
} as const;
