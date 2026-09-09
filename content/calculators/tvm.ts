// Copy for /cong-cu/gia-tri-tien-te-theo-thoi-gian/ — the TVM solver.
//
// Original FinHome copy.
//
// This is the one page in the suite that exposes the Excel/HP-12C sign
// convention instead of hiding it, because a general solver cannot know which
// side of a transaction the user is on. So the convention IS the page: it is
// in the notice, in every field's help text, and in the FAQ. Getting the sign
// wrong is the single most common way to misuse a TVM calculator.
//
// Figures quoted are the module's own output. Loan case (nhận 2 tỷ, 240 kỳ,
// 0,7083333333%/kỳ — tức 8,5 ÷ 12, và defaultRate giữ đủ mười chữ số thập
// phân vì làm tròn thành 0,7083 lệch 506,33 ₫/kỳ): khoản trả −17.356.465 ₫/kỳ,
// lãi ròng −2.165.551.520 ₫.
// Savings case (góp −1.000.000 ₫/kỳ, 12 kỳ, 1%/kỳ): cuối kỳ +12.682.503 ₫,
// lãi ròng +682.503 ₫. Lump sum doubling over 120 kỳ: 0,5792941%/kỳ.
//
// Hai con số trong rateHelp cách nhau đúng một phép nhân, nên người đọc kiểm
// tra được: khoản trả lệch 506,32834681 ₫/kỳ, và 240 × số đó = 121.518,80 →
// 121.519 ₫ lãi ròng. Đừng viết 507 ₫/kỳ: 507 là hiệu của hai khoản trả ĐÃ
// làm tròn về đồng (17.356.465 − 17.355.958), và 240 × 507 = 121.680, lệch
// 161 ₫ so với con số lãi ròng trong cùng câu.

export const TVM = {
  slug: "/cong-cu/gia-tri-tien-te-theo-thoi-gian",

  pageTitle: "Giá trị tiền tệ theo thời gian",
  metaTitle: "Máy tính giá trị tiền tệ theo thời gian — Giải cho 1 trong 5 ẩn",
  metaDescription:
    "Nhập bốn trong năm đại lượng — giá trị hiện tại, giá trị tương lai, khoản trả, số kỳ, lãi suất mỗi kỳ — để giải đại lượng còn lại. Công cụ miễn phí của FinHome.",

  lede:
    "Năm đại lượng nối với nhau bằng một phương trình: giá trị hiện tại, giá trị tương lai, khoản trả mỗi kỳ, số kỳ, và lãi suất mỗi kỳ. Cho bốn thì tính được cái thứ năm. Đây là bàn phím của máy tính tài chính, và mọi công cụ vay hay tiết kiệm khác trong bộ này đều là một trường hợp riêng của nó.",

  form: {
    solveLegend: "Bạn muốn tính đại lượng nào?",
    solveHelp:
      "Bốn đại lượng còn lại đều phải nhập. Ô của đại lượng đang tính sẽ được ẩn.",
    solvePresent: "Giá trị hiện tại",
    solveFuture: "Giá trị tương lai",
    solvePayment: "Khoản trả mỗi kỳ",
    solvePeriods: "Số kỳ",
    solveRate: "Lãi suất mỗi kỳ",
    defaultSolveFor: "payment",

    group: "Đại lượng",
    presentLabel: "Giá trị hiện tại",
    presentUnit: "₫",
    presentHelp:
      "DƯƠNG nếu bạn NHẬN tiền hôm nay (đi vay), ÂM nếu bạn bỏ tiền ra hôm nay (đầu tư).",
    presentInvalid: "Vui lòng nhập một số.",
    defaultPresent: "2.000.000.000",

    futureLabel: "Giá trị tương lai",
    futureUnit: "₫",
    futureHelp:
      "DƯƠNG nếu bạn nhận tiền ở cuối kỳ, ÂM nếu bạn phải trả. Để 0 với khoản vay trả hết.",
    futureInvalid: "Vui lòng nhập một số.",
    defaultFuture: "0",

    paymentLabel: "Khoản trả mỗi kỳ",
    paymentUnit: "₫",
    paymentHelp:
      "ÂM nếu bạn trả ra mỗi kỳ, DƯƠNG nếu bạn nhận vào mỗi kỳ. Để 0 nếu chỉ có một khoản đầu và một khoản cuối.",
    paymentInvalid: "Vui lòng nhập một số.",
    defaultPayment: "-17.356.465",

    periodsLabel: "Số kỳ",
    periodsHelp:
      "Số kỳ, tính theo cùng đơn vị với lãi suất. 20 năm theo tháng là 240.",
    periodsInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultPeriods: "240",

    rateLabel: "Lãi suất mỗi kỳ",
    rateUnit: "%/kỳ",
    rateHelp:
      "MỖI KỲ, không phải mỗi năm. Lãi 8,5%/năm tính theo tháng là 8,5 ÷ 12 = 0,7083333333 — làm tròn thành 0,7083 làm khoản trả lệch 506,33 ₫ mỗi kỳ và 121.519 ₫ lãi ròng trên 240 kỳ, nên ở đây chúng tôi giữ đủ chữ số.",
    rateInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultRate: "0,7083333333",

    timingLegend: "Khoản trả vào lúc nào trong kỳ?",
    timingHelp:
      "Cuối kỳ là mặc định và đúng với hầu hết khoản vay. Đầu kỳ dùng cho tiền thuê trả trước và một số hợp đồng bảo hiểm.",
    timingEnd: "Cuối kỳ",
    timingBeginning: "Đầu kỳ",
    defaultTiming: "end",

    resultTitle: "Kết quả",
    solvedLabel: "Đại lượng vừa tính",
    netInterestLabel: "Lãi ròng",
    totalPaymentsLabel: "Tổng các khoản trả",

    detailTitle: "Cả năm đại lượng",
    presentResultLabel: "Giá trị hiện tại",
    futureResultLabel: "Giá trị tương lai",
    paymentResultLabel: "Khoản trả mỗi kỳ",
    periodsResultLabel: "Số kỳ",
    rateResultLabel: "Lãi suất mỗi kỳ",
    annualRateLabel: "Quy ra %/năm nếu kỳ là tháng",
    timingResultLabel: "Thời điểm trả",

    noSolutionNotice:
      "Không có đáp án cho tổ hợp số liệu này. Thường là do một trong ba lý do: dấu của các đại lượng không mô tả được một giao dịch có thật (ví dụ mọi dòng tiền đều cùng dấu); khoản trả quá nhỏ để trả hết dư nợ, nên không có số kỳ hữu hạn nào; hoặc lãi suất cần tìm nằm ngoài phạm vi tìm kiếm. Hãy kiểm tra lại dấu trước tiên.",
  },

  signNotice:
    "Trang này dùng quy ước dấu của máy tính tài chính: tiền BẠN TRẢ RA là số ÂM, tiền BẠN NHẬN VÀO là số DƯƠNG. Một công cụ tổng quát buộc phải lộ quy ước này ra, vì nó không thể biết bạn đang ở bên nào của giao dịch. Người đi vay: nhận gốc nên giá trị hiện tại DƯƠNG, trả góp nên khoản trả ÂM. Người tiết kiệm: bỏ tiền vào nên khoản trả ÂM, nhận số dư cuối kỳ nên giá trị tương lai DƯƠNG. Nhập sai dấu là cách phổ biến nhất để dùng sai máy tính tài chính, và kết quả khi đó thường vẫn là một con số trông hợp lý.",

  formula: {
    title: "Cách tính",
    body: [
      "Phương trình nối năm đại lượng: giá trị hiện tại × (1 + r)^n + khoản trả × ((1 + r)^n − 1) ÷ r + giá trị tương lai = 0, với r là lãi suất mỗi kỳ và n là số kỳ. Bốn trong năm đại lượng xác định đại lượng thứ năm.",
      "Bốn đại lượng đầu có công thức đóng. Riêng LÃI SUẤT thì không — nó được giải bằng phương pháp chia đôi khoảng, và công cụ trả về “không có đáp án” thay vì một con số đoán nếu dòng tiền không kẹp được nghiệm.",
      "Lãi ròng = giá trị hiện tại + khoản trả × số kỳ + giá trị tương lai. Theo quy ước dấu, số DƯƠNG là lãi bạn NHẬN được và số ÂM là lãi bạn TRẢ. Với khoản vay 2 tỷ ở 0,7083333333%/kỳ trong 240 kỳ: khoản trả −17.356.465 ₫ và lãi ròng −2.165.551.520 ₫. Với kế hoạch góp −1.000.000 ₫ mỗi kỳ ở 1%/kỳ trong 12 kỳ: cuối kỳ +12.682.503 ₫ và lãi ròng +682.503 ₫.",
      "Lãi suất phải cùng đơn vị kỳ với số kỳ. Lỗi phổ biến thứ hai sau lỗi dấu: nhập số kỳ theo tháng nhưng lãi suất theo năm. Lãi 8,5%/năm tính theo tháng là 0,7083333333%/kỳ; làm tròn còn 0,7083 là một lỗi riêng, nhỏ nhưng không bằng 0.",
      "Số kỳ KHÔNG được làm tròn khi nó là đại lượng cần tìm. 47,3 kỳ là 47,3 kỳ — làm tròn xuống sẽ nói rằng mục tiêu đạt được sớm hơn thực tế.",
      "Chọn trả đầu kỳ làm mỗi khoản trả sinh lãi thêm một kỳ, nên khoản trả cần thiết nhỏ hơn và giá trị tương lai lớn hơn so với trả cuối kỳ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Tôi nhập số dương hết thì sao?",
        a: "Bạn sẽ nhận được “không có đáp án”, hoặc tệ hơn, một con số vô nghĩa. Phương trình cần ít nhất một dòng tiền vào và một dòng tiền ra để có nghiệm — nếu mọi thứ cùng dấu thì không có giao dịch nào cả. Quy tắc nhanh: đi vay thì gốc dương và khoản trả âm; tiết kiệm thì khoản góp âm và số dư cuối dương.",
      },
      {
        q: "Khi nào dùng công cụ này thay vì công cụ chuyên biệt?",
        a: "Khi bài toán của bạn không khớp với một công cụ có sẵn: một khoản vay có số dư cuối kỳ khác 0, một hợp đồng vừa có khoản trả định kỳ vừa có khoản một lần, hay khi bạn cần giải cho số kỳ hoặc lãi suất. Với các bài toán thường gặp, công cụ tính khoản vay, lãi kép hay mục tiêu tiết kiệm của FinHome dễ dùng hơn vì chúng lo phần dấu thay bạn.",
      },
      {
        q: "Giá trị tương lai khác 0 nghĩa là gì?",
        a: "Nghĩa là còn một khoản tiền ở cuối kỳ. Với khoản vay có trả gốc cuối kỳ, đó là số gốc còn lại phải trả — nhập số âm. Với hợp đồng thuê mua có giá trị còn lại, đó là số bạn phải trả để mua lại. Với kế hoạch tiết kiệm, đó là số dư bạn nhận về — nhập số dương.",
      },
      {
        q: "Vì sao lãi suất là đại lượng duy nhất không có công thức?",
        a: "Vì nó xuất hiện trong phương trình dưới dạng (1 + r)^n, và không thể tách r ra một phía khi n lớn hơn 2. Đây không phải giới hạn của công cụ mà là của đại số. Mọi máy tính tài chính đều giải lãi suất bằng phương pháp số, và tất cả đều có thể không tìm được nghiệm với dòng tiền bất thường.",
      },
      {
        q: "Kết quả có tính thuế và lạm phát không?",
        a: "Không. Phương trình chỉ nói về dòng tiền danh nghĩa. Nếu bạn muốn kết quả theo giá trị thực, hãy nhập lãi suất thực thay vì lãi suất danh nghĩa — nhưng khi đó mọi dòng tiền cũng phải theo giá trị thực. Trộn hai loại là lỗi thường gặp.",
      },
    ],
  },
} as const;
