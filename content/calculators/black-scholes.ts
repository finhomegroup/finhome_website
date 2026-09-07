// Copy for /cong-cu/quyen-chon-black-scholes/ — option pricing.
//
// Original FinHome copy. Φ comes from lib/calc/normal.ts, tested separately.
//
// Two honesty notes drive the page:
//
// 1. Vietnam has no listed equity options market. Covered warrants (chứng
//    quyền có bảo đảm) are the closest listed instrument and they ARE priced
//    off this model, so the tool is useful — but the copy says what it is for
//    rather than implying a market that does not exist.
// 2. N(d₂) is a RISK-NEUTRAL probability, not a real-world one. It is the
//    single most misread output of the model, so it is labelled as such in
//    the results and explained in the prose.
//
// Figures quoted are the module's own output for the textbook case (spot 100,
// strike 100, 1 năm, vol 20%, lãi 5%, không cổ tức): call 10,450584,
// put 5,573526, d₁ = 0,35, d₂ = 0,15, delta call 0,636831, gamma 0,018762,
// vega 0,375240 mỗi điểm phần trăm, N(d₂) = 55,9618%.

export const BLACK_SCHOLES = {
  slug: "/cong-cu/quyen-chon-black-scholes",

  pageTitle: "Định giá quyền chọn Black–Scholes",
  metaTitle: "Định giá quyền chọn Black–Scholes — Giá và các hệ số greek",
  metaDescription:
    "Tính giá quyền chọn mua và bán theo mô hình Black–Scholes, kèm delta, gamma, vega, theta, rho và giá trị thời gian. Công cụ miễn phí của FinHome.",

  lede:
    "Mô hình Black–Scholes cho quyền chọn kiểu châu Âu, kèm toàn bộ hệ số greek. Mọi lãi suất và độ biến động ở đây là mức HẰNG NĂM GHÉP LIÊN TỤC — đó là hệ mà mô hình được xây trên, và nhập theo hệ khác sẽ ra một con số trông hợp lý nhưng sai.",

  form: {
    optionGroup: "Quyền chọn",
    spotLabel: "Giá tài sản cơ sở hiện tại",
    spotUnit: "₫",
    spotHelp: "Giá thị trường hiện tại của cổ phiếu hoặc chỉ số cơ sở.",
    spotInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultSpot: "100.000",

    strikeLabel: "Giá thực hiện",
    strikeUnit: "₫",
    strikeHelp: "Mức giá ghi trong hợp đồng quyền chọn.",
    strikeInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultStrike: "100.000",

    timeLabel: "Thời gian đến khi đáo hạn",
    timeUnit: "năm",
    timeHelp:
      "Tính theo NĂM: ba tháng là 0,25, sáu tháng là 0,5. Nhập 0 để xem giá trị nội tại tại thời điểm đáo hạn.",
    timeInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTime: "1",

    marketGroup: "Thị trường",
    volatilityLabel: "Độ biến động",
    volatilityUnit: "%/năm",
    volatilityHelp:
      "Độ lệch chuẩn hằng năm của lợi suất tài sản cơ sở. Đây là ô duy nhất không quan sát trực tiếp được — xem phần câu hỏi thường gặp.",
    volatilityInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultVolatility: "20",

    rateLabel: "Lãi suất phi rủi ro",
    rateUnit: "%/năm",
    rateHelp:
      "Ghép LIÊN TỤC, không phải ghép năm. Mức 5% ở đây tương đương 5,127% hiệu dụng.",
    rateInvalid: "Vui lòng nhập một số.",
    defaultRate: "5",

    dividendLabel: "Tỷ suất cổ tức",
    dividendUnit: "%/năm",
    dividendHelp:
      "Tỷ suất cổ tức liên tục. Để 0 nếu tài sản cơ sở không trả cổ tức trong thời gian còn lại.",
    dividendInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDividend: "0",

    resultTitle: "Giá quyền chọn",
    callLabel: "Quyền chọn mua",
    putLabel: "Quyền chọn bán",
    probabilityLabel: "Xác suất trung tính rủi ro quyền mua có lãi",

    greeksTitle: "Hệ số greek",
    deltaLabel: "Delta",
    gammaLabel: "Gamma",
    vegaLabel: "Vega — mỗi điểm % biến động",
    thetaLabel: "Theta — mỗi ngày",
    rhoLabel: "Rho — mỗi điểm % lãi suất",
    callColumn: "Quyền mua",
    putColumn: "Quyền bán",
    greekColumn: "Hệ số",
    greeksIntro:
      "Gamma và vega giống nhau cho quyền mua và quyền bán; delta, theta và rho thì không. Vega được tính theo mỗi ĐIỂM PHẦN TRĂM biến động và theta theo mỗi NGÀY, vì đó là đơn vị chúng thực sự được dùng — chứ không phải theo mỗi đơn vị biến động và mỗi năm như trong công thức gốc.",

    detailTitle: "Chi tiết",
    d1Label: "d₁",
    d2Label: "d₂",
    callIntrinsicLabel: "Giá trị nội tại — quyền mua",
    callTimeValueLabel: "Giá trị thời gian — quyền mua",
    putIntrinsicLabel: "Giá trị nội tại — quyền bán",
    putTimeValueLabel: "Giá trị thời gian — quyền bán",
    moneynessLabel: "Tỷ lệ giá hiện tại trên giá thực hiện",
    forwardLabel: "Giá kỳ hạn tại thời điểm đáo hạn",

    atExpiryNotice:
      "Thời gian đến đáo hạn bằng 0, nên quyền chọn đúng bằng giá trị nội tại của nó và mọi hệ số greek trừ delta đều bằng 0. Công cụ xử lý trường hợp này riêng vì công thức d₁ chia cho căn của thời gian, tức chia cho 0.",
    zeroVolNotice:
      "Độ biến động bằng 0, nên khoản chi trả là chắc chắn và quyền chọn bằng giá trị nội tại của giá kỳ hạn, đã chiết khấu. Đây cũng là một trường hợp biên được xử lý riêng vì cùng lý do chia cho 0.",
  },

  contextNotice:
    "Việt Nam chưa có thị trường quyền chọn cổ phiếu niêm yết. Công cụ này hữu ích nhất cho hai việc: định giá CHỨNG QUYỀN CÓ BẢO ĐẢM đang giao dịch trên HOSE — vốn được các công ty chứng khoán định giá bằng đúng mô hình này — và hiểu cơ chế quyền chọn khi bạn đọc tài liệu nước ngoài. Ngoài ra, hãy chú ý một điều dễ hiểu sai nhất trong toàn bộ kết quả: N(d₂) là xác suất TRUNG TÍNH RỦI RO, không phải xác suất thực tế. Nó là một con số dùng để định giá, không phải một dự báo về việc quyền chọn có lãi hay không.",

  formula: {
    title: "Cách tính",
    body: [
      "d₁ = [ln(S ÷ K) + (r − q + σ² ÷ 2)·t] ÷ (σ·√t), và d₂ = d₁ − σ·√t. Giá quyền mua = S·e^(−qt)·N(d₁) − K·e^(−rt)·N(d₂); giá quyền bán = K·e^(−rt)·N(−d₂) − S·e^(−qt)·N(−d₁). N là hàm phân phối tích lũy chuẩn.",
      "Với ví dụ sách giáo khoa — S = K, t = 1 năm, σ = 20%, r = 5% — ta có d₁ = 0,35 và d₂ = 0,15, cho quyền mua 10,450584 và quyền bán 5,573526 trên mỗi đơn vị giá.",
      "Bất biến đáng tin hơn bất kỳ con số đơn lẻ nào là ngang giá quyền chọn: giá mua − giá bán = S·e^(−qt) − K·e^(−rt). Bộ kiểm thử của module kiểm bất biến này trên cả một lưới giá, thời gian, biến động và cổ tức, chứ không chỉ ở một điểm.",
      "Hàm N được cài trong một module riêng và kiểm thử độc lập với phần định giá, dựa trên bảng giá trị đã công bố. Đây là chủ ý: một sai số trong N sẽ hiện ra ở đây dưới dạng một giá quyền chọn trông hoàn toàn hợp lý.",
      "Hai trường hợp biên được xử lý riêng thay vì để công thức tự chạy, vì cả hai đều chia cho 0 ở d₁ và cả hai đều đến được từ ô nhập. Tại đáo hạn (t = 0), quyền chọn bằng đúng giá trị nội tại. Với biến động bằng 0, khoản chi trả là chắc chắn nên quyền chọn bằng giá trị nội tại của giá kỳ hạn, đã chiết khấu.",
      "Vega được quy về mỗi điểm phần trăm biến động và theta về mỗi ngày, vì đó là đơn vị thực dùng. Công thức gốc cho vega theo mỗi đơn vị biến động (tức 100 điểm phần trăm) và theta theo mỗi năm.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy độ biến động ở đâu?",
        a: "Đây là ô khó nhất và là ô duy nhất không quan sát trực tiếp được. Hai cách: biến động lịch sử, tính từ độ lệch chuẩn của lợi suất hằng ngày trong quá khứ rồi nhân căn 252; hoặc biến động ngụ ý, suy ra từ giá thị trường của một quyền chọn đang giao dịch. Hai con số thường khác nhau đáng kể, và chênh lệch đó chính là quan điểm của thị trường về tương lai. Hãy chạy công cụ ở vài mức biến động để thấy giá nhạy đến đâu.",
      },
      {
        q: "Vì sao lãi suất phải là mức ghép liên tục?",
        a: "Vì mô hình được xây trên giả định ghép liên tục, và các hệ số e^(−rt) trong công thức chỉ đúng với hệ đó. Mức 5% ghép liên tục tương đương 5,127% hiệu dụng hằng năm. Nhập 5% hiệu dụng vào đây sẽ ra giá hơi thấp — sai không nhiều nhưng sai một cách âm thầm. Nếu bạn có lãi suất hiệu dụng, hãy quy đổi bằng ln(1 + lãi hiệu dụng).",
      },
      {
        q: "N(d₂) có phải xác suất quyền chọn có lãi không?",
        a: "Không, và đây là chỗ bị hiểu sai nhiều nhất. N(d₂) là xác suất trong một thế giới TRUNG TÍNH RỦI RO — một cấu trúc toán học trong đó mọi tài sản tăng trưởng bằng lãi suất phi rủi ro. Xác suất thực tế phụ thuộc vào lợi suất kỳ vọng thật của tài sản, thường cao hơn lãi suất phi rủi ro, nên xác suất thật của một quyền mua có lãi thường lớn hơn N(d₂). Con số này dùng để định giá, không dùng để dự báo.",
      },
      {
        q: "Mô hình có dùng được cho quyền chọn kiểu Mỹ không?",
        a: "Không chính xác. Black–Scholes định giá quyền chọn kiểu châu Âu, chỉ thực hiện được tại đáo hạn. Quyền chọn kiểu Mỹ cho phép thực hiện sớm nên đáng giá bằng hoặc hơn, và cần mô hình khác như cây nhị thức. Một ngoại lệ hữu ích: với quyền chọn MUA trên tài sản không trả cổ tức, thực hiện sớm không bao giờ tối ưu, nên hai giá trùng nhau.",
      },
      {
        q: "Cổ tức trả theo đợt thì nhập thế nào?",
        a: "Ô tỷ suất cổ tức là tỷ suất LIÊN TỤC, phù hợp với chỉ số hơn là với một cổ phiếu trả cổ tức theo đợt. Với cổ phiếu đơn lẻ, cách xấp xỉ thông dụng là lấy tổng cổ tức dự kiến trong thời gian còn lại chia giá hiện tại rồi quy về mức năm. Đây là xấp xỉ, và nó kém chính xác khi thời gian còn lại ngắn và ngày trả cổ tức gần đáo hạn.",
      },
      {
        q: "Vì sao giả định của mô hình lại quan trọng?",
        a: "Vì mô hình giả định biến động không đổi, lợi suất phân phối chuẩn theo log, không có chi phí giao dịch và có thể phòng hộ liên tục — không giả định nào đúng hoàn toàn. Hệ quả thực tế rõ nhất là mô hình định giá thấp các quyền chọn xa giá, vì thị trường thật có nhiều biến động cực đoan hơn phân phối chuẩn. Đây là lý do biến động ngụ ý không phẳng theo giá thực hiện.",
      },
    ],
  },
} as const;
