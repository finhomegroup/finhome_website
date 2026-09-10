// Copy for /cong-cu/capm/ — the CAPM calculator.
//
// Original FinHome copy. The arithmetic is one line; the honesty is the work.
//
// Two things the copy insists on, because CAPM is the most over-trusted
// formula in finance:
//
// 1. Beta is measured on the PAST and every input is an estimate. The output
//    has three or four significant figures and none of that precision is
//    real. The notice says so above the calculator.
// 2. A negative beta giving an expected return below the risk-free rate is
//    the model working, not a bug. Explained rather than hidden.
//
// Figures quoted are for the defaults (phi rủi ro 4%, thị trường 12%,
// beta 1,2): phần bù thị trường 8%, phần bù rủi ro 9,6%, lợi nhuận kỳ vọng
// 13,6%. Beta 1 cho đúng 12%; beta 0 cho đúng 4%; beta −0,5 cho 0%.

export const CAPM = {
  slug: "/cong-cu/capm",

  pageTitle: "Mô hình CAPM: lợi nhuận nào là hợp lý với rủi ro?",
  metaTitle: "Tính CAPM — Lợi nhuận kỳ vọng theo beta và alpha Jensen",
  metaDescription:
    "Tính lợi nhuận kỳ vọng theo mô hình CAPM từ lãi suất phi rủi ro, beta và phần bù thị trường, kèm alpha Jensen. Công cụ miễn phí của FinHome.",

  lede:
    "CAPM trả lời một câu duy nhất: với mức rủi ro thị trường mà tài sản này gánh, lợi nhuận bao nhiêu mới là hợp lý? Công thức chỉ có một dòng — lãi suất phi rủi ro cộng beta nhân phần bù thị trường — nhưng cả ba con số đầu vào đều là ước lượng.",

  form: {
    group: "Đầu vào",
    riskFreeLabel: "Lãi suất phi rủi ro",
    riskFreeUnit: "%/năm",
    riskFreeHelp:
      "Thường lấy lợi suất trái phiếu chính phủ kỳ hạn tương ứng với thời gian đầu tư của bạn.",
    riskFreeInvalid: "Vui lòng nhập một số.",
    defaultRiskFree: "4",

    betaLabel: "Beta",
    betaHelp:
      "Độ nhạy với thị trường. 1 là biến động cùng thị trường, dưới 1 là phòng thủ, trên 1 là khuếch đại. Số âm là hợp lệ và có ý nghĩa.",
    betaInvalid: "Vui lòng nhập một số.",
    defaultBeta: "1,2",

    marketModeLegend: "Bạn có con số thị trường nào?",
    marketModeHelp:
      "Chỉ nhập MỘT trong hai. Hai con số cùng nói về một đại lượng, và nếu chúng lệch nhau thì không có cách nào chọn đúng.",
    marketModeReturn: "Lợi nhuận kỳ vọng của thị trường",
    marketModePremium: "Phần bù rủi ro thị trường",
    defaultMarketMode: "return",

    marketReturnLabel: "Lợi nhuận kỳ vọng của thị trường",
    marketReturnUnit: "%/năm",
    marketReturnHelp:
      "Mức sinh lời kỳ vọng của cả thị trường, ví dụ của VN-Index trong dài hạn.",
    marketReturnInvalid: "Vui lòng nhập một số.",
    defaultMarketReturn: "12",

    marketPremiumLabel: "Phần bù rủi ro thị trường",
    marketPremiumUnit: "%/năm",
    marketPremiumHelp:
      "Phần thị trường sinh lời vượt trên lãi suất phi rủi ro. Với thị trường mới nổi, các ước lượng thường nằm trong khoảng 6–10%.",
    marketPremiumInvalid: "Vui lòng nhập một số.",
    defaultMarketPremium: "8",

    actualLabel: "Lợi nhuận thực tế đã đạt",
    actualUnit: "%/năm",
    actualHelp:
      "Để trống nếu bạn chỉ cần lợi nhuận kỳ vọng. Nhập vào để tính alpha Jensen — phần vượt trên mức mà rủi ro biện minh được.",
    actualInvalid: "Vui lòng nhập một số.",
    defaultActual: "",

    resultTitle: "Kết quả",
    expectedLabel: "Lợi nhuận kỳ vọng",
    alphaLabel: "Alpha Jensen",
    profileLabel: "Đặc tính beta",
    profileInverse: "Nghịch chiều thị trường",
    profileDefensive: "Phòng thủ — biến động ít hơn thị trường",
    profileMarket: "Đi cùng thị trường",
    profileAggressive: "Khuếch đại — biến động mạnh hơn thị trường",

    detailTitle: "Chi tiết",
    premiumLabel: "Phần bù rủi ro thị trường",
    riskPremiumLabel: "Phần bù rủi ro của tài sản (beta × phần bù)",
    riskFreeResultLabel: "Lãi suất phi rủi ro",

    belowRiskFreeNotice:
      "Lợi nhuận kỳ vọng thấp hơn lãi suất phi rủi ro. Đây là kết quả đúng của mô hình chứ không phải lỗi: beta âm nghĩa là tài sản này tăng khi thị trường giảm, và một tài sản như vậy có giá trị bảo hiểm — nhà đầu tư sẵn sàng nhận mức sinh lời thấp hơn để có nó trong danh mục.",
  },

  precisionNotice:
    "Con số công cụ đưa ra có ba bốn chữ số nhưng không có chữ số nào trong đó là chắc chắn. Beta được đo trên dữ liệu QUÁ KHỨ và thay đổi theo khoảng thời gian bạn chọn để đo; phần bù thị trường là một ước lượng mà các nhà nghiên cứu không đồng ý với nhau trong phạm vi vài điểm phần trăm; lãi suất phi rủi ro thay đổi theo kỳ hạn bạn lấy. Hãy dùng CAPM để trả lời “mức này có hợp lý không”, đừng dùng nó như một dự báo. Cách thực dụng: chạy công cụ với ba mức phần bù thị trường — 6%, 8%, 10% — rồi xem kết luận của bạn có đổi hay không.",

  formula: {
    title: "Cách tính",
    body: [
      "Lợi nhuận kỳ vọng = lãi suất phi rủi ro + beta × phần bù rủi ro thị trường. Phần bù thị trường bằng lợi nhuận kỳ vọng của thị trường trừ lãi suất phi rủi ro, nên bạn có thể nhập trực tiếp phần bù hoặc để công cụ suy ra.",
      "Với mặc định: phần bù là 12% − 4% = 8%; beta 1,2 nhân 8% cho phần bù rủi ro của tài sản là 9,6%; cộng 4% cho lợi nhuận kỳ vọng 13,6%.",
      "Hai mốc đáng nhớ. Beta bằng 1 cho ra đúng lợi nhuận thị trường, tức 12% — tài sản gánh đúng rủi ro thị trường nên được trả đúng mức thị trường. Beta bằng 0 cho ra đúng lãi suất phi rủi ro, tức 4% — tài sản không gánh rủi ro thị trường nào thì không được trả phần bù nào.",
      "Beta âm cho lợi nhuận kỳ vọng THẤP HƠN lãi suất phi rủi ro: beta −0,5 với các con số mặc định cho 0%. Không phải lỗi. Tài sản tăng khi thị trường giảm có giá trị bảo hiểm cho danh mục, nên nhà đầu tư chấp nhận sinh lời thấp hơn để giữ nó.",
      "Alpha Jensen = lợi nhuận thực tế − lợi nhuận kỳ vọng. Đây là con số mà mọi quỹ chủ động đều tuyên bố có: phần sinh lời vượt trên mức mà rủi ro đã gánh biện minh được. Alpha dương 4,4% nghĩa là tài sản đạt 18% trong khi rủi ro của nó chỉ đáng 13,6%.",
      "CAPM chỉ tính rủi ro THỊ TRƯỜNG, tức phần rủi ro không thể loại bỏ bằng đa dạng hóa. Nó giả định bạn đã đa dạng hóa hết phần rủi ro riêng của từng doanh nghiệp. Nếu danh mục của bạn chỉ có ba mã cổ phiếu, mô hình này không mô tả rủi ro thật của bạn.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy beta của cổ phiếu Việt Nam ở đâu?",
        a: "Các công ty chứng khoán và trang dữ liệu thường công bố beta so với VN-Index, và bạn cũng có thể tự tính bằng hồi quy lợi nhuận cổ phiếu theo lợi nhuận chỉ số. Hãy chú ý ba điều: beta phụ thuộc vào khoảng thời gian đo (2 năm và 5 năm cho hai con số khác nhau), vào tần suất dữ liệu (ngày, tuần, tháng), và vào chỉ số dùng làm thị trường. Hai nguồn khác nhau báo beta khác nhau cho cùng một mã là chuyện bình thường.",
      },
      {
        q: "Phần bù rủi ro thị trường ở Việt Nam nên lấy bao nhiêu?",
        a: "Không có con số chuẩn. Các ước lượng cho thị trường mới nổi thường nằm trong khoảng 6–10%, cao hơn thị trường phát triển vì rủi ro quốc gia và rủi ro thanh khoản. Vì kết quả CAPM tỷ lệ thuận với con số này, hãy chạy công cụ ở cả hai đầu của khoảng và xem quyết định của bạn có phụ thuộc vào nó hay không.",
      },
      {
        q: "Lãi suất phi rủi ro nên lấy kỳ hạn nào?",
        a: "Kỳ hạn khớp với thời gian bạn định đầu tư. Nếu bạn đánh giá một khoản đầu tư 5 năm thì lấy lợi suất trái phiếu chính phủ 5 năm, không lấy lãi suất tín phiếu ngắn hạn. Trong thực tế nhiều người dùng luôn lợi suất trái phiếu chính phủ 10 năm cho mọi trường hợp, và đó là một xấp xỉ chấp nhận được.",
      },
      {
        q: "Alpha dương có nghĩa là quỹ đó giỏi không?",
        a: "Không kết luận được từ một giai đoạn. Alpha dương có thể đến từ kỹ năng, từ may mắn, hoặc từ việc quỹ gánh một loại rủi ro mà CAPM không đo — quy mô, giá trị, thanh khoản, đòn bẩy. Đây là lý do các mô hình nhiều nhân tố ra đời. Alpha dương ổn định qua nhiều giai đoạn và nhiều điều kiện thị trường thì đáng chú ý hơn nhiều.",
      },
      {
        q: "CAPM có dùng được cho bất động sản hay doanh nghiệp chưa niêm yết?",
        a: "Gián tiếp và cần thận trọng. Không có giá thị trường liên tục thì không tính được beta trực tiếp; cách thông dụng là lấy beta của các doanh nghiệp niêm yết cùng ngành rồi điều chỉnh theo cơ cấu vốn. Kết quả khi đó là một ước lượng thô, và với tài sản kém thanh khoản thì thường phải cộng thêm một phần bù thanh khoản mà CAPM không có.",
      },
    ],
  },
} as const;
