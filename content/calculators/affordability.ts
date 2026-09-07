// Copy for /cong-cu/kha-nang-mua-nha/ — the affordability calculator.
//
// Original FinHome copy. The arithmetic is standard finance run backwards.
//
// Figures quoted below are the tool's own output for its defaults (50 triệu
// thu nhập, 5 triệu nợ hiện có, 600 triệu tiền tích lũy, 8,5%/năm, 20 năm),
// read off the module: trả được 20.000.000 ₫/tháng → vay tối đa 2.304.616.796 ₫,
// giá nhà 2.904.616.796 ₫, tiền tích lũy chiếm 20,7%. Với 12 triệu nợ hiện có,
// giới hạn tổng nợ mới là giới hạn chặn: trả được 13.000.000 ₫/tháng, vay
// 1.498.000.918 ₫, giá nhà 2.098.000.918 ₫. Re-read the module if defaults move.
//
// The 40%/50% ratios are a CONVENTION, not a statutory cap — Vietnamese banks
// underwrite in that range but publish no fixed number. The copy says so
// rather than letting a reader take them for a rule.

export const AFFORDABILITY = {
  slug: "/cong-cu/kha-nang-mua-nha",

  pageTitle: "Khả năng mua nhà: bạn nên nhắm giá nào?",
  metaTitle: "Tính khả năng mua nhà — Từ thu nhập ra mức giá nên nhắm",
  metaDescription:
    "Từ thu nhập, nợ đang trả và tiền tích lũy, tính khoản trả hằng tháng bạn chịu được, số tiền vay tối đa và mức giá nhà nên nhắm tới. Công cụ miễn phí của FinHome.",

  lede:
    "Công cụ này chạy ngược phép tính khoản vay: thay vì hỏi khoản vay này trả bao nhiêu mỗi tháng, nó hỏi bạn trả được bao nhiêu mỗi tháng thì vay được bao nhiêu. Kết quả là một mức giá để đi xem nhà, không phải một mức được ngân hàng cam kết.",

  form: {
    incomeGroup: "Thu nhập và nợ",
    incomeLabel: "Thu nhập cả hộ mỗi tháng",
    incomeUnit: "₫",
    incomeHelp:
      "Thu nhập gộp trước thuế của tất cả người cùng đứng vay. Ngân hàng xét trên thu nhập chứng minh được, không phải thu nhập thực nhận.",
    incomeInvalid: "Vui lòng nhập thu nhập lớn hơn 0.",
    defaultIncome: "50.000.000",

    debtsLabel: "Nợ đang trả mỗi tháng",
    debtsUnit: "₫",
    debtsHelp:
      "Tổng các khoản đang trả: vay mua xe, trả góp, và mức trả tối thiểu của thẻ tín dụng. Đây là ô hay bị bỏ trống nhất, và cũng là ô hay quyết định kết quả nhất.",
    debtsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDebts: "5.000.000",

    purchaseGroup: "Điều kiện mua",
    downLabel: "Tiền tích lũy để trả trước",
    downUnit: "₫",
    downHelp: "Số tiền bạn có sẵn, sau khi đã giữ lại quỹ dự phòng.",
    downInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDown: "600.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi sau ưu đãi, không phải mức ưu đãi năm đầu.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    housingCostsLabel: "Chi phí nhà ở khác mỗi tháng",
    housingCostsUnit: "₫",
    housingCostsHelp:
      "Phí quản lý chung cư, bảo hiểm tài sản, phí gửi xe. Được trừ ra trước khi tính số tiền vay, vì chúng cũng rời khỏi ví bạn mỗi tháng.",
    housingCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultHousingCosts: "0",

    ratioGroup: "Giới hạn của ngân hàng",
    housingRatioLabel: "Trả nợ nhà tối đa",
    housingRatioUnit: "% thu nhập",
    housingRatioHelp:
      "Phần thu nhập tối đa dành cho khoản trả nhà. Thông lệ là 35–40%.",
    housingRatioInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultHousingRatio: "40",

    totalRatioLabel: "Tổng trả nợ tối đa",
    totalRatioUnit: "% thu nhập",
    totalRatioHelp:
      "Phần thu nhập tối đa dành cho TẤT CẢ các khoản nợ, gồm cả nợ hiện có. Thông lệ là 45–55%.",
    totalRatioInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTotalRatio: "50",

    resultTitle: "Mức nên nhắm",
    maxPriceLabel: "Giá nhà nên nhắm tới",
    maxLoanLabel: "Số tiền vay tối đa",
    paymentLabel: "Trả gốc và lãi mỗi tháng",

    detailTitle: "Giới hạn nào đang chặn",
    bindingLabel: "Giới hạn đang chặn",
    bindingHousing: "Giới hạn trả nợ nhà",
    bindingTotal: "Giới hạn tổng nợ",
    housingLimitLabel: "Trần theo giới hạn trả nợ nhà",
    totalLimitLabel: "Còn lại theo giới hạn tổng nợ",
    budgetLabel: "Ngân sách nhà ở mỗi tháng",
    downPercentLabel: "Tiền tích lũy chiếm",

    noRoomNotice:
      "Với các con số này, không còn chỗ cho một khoản vay mua nhà: nợ đang trả và chi phí nhà ở khác đã dùng hết ngân sách mà hai giới hạn cho phép. Đây là kết quả thật, không phải lỗi. Hãy thử giảm nợ hiện có, tăng thu nhập chứng minh được, hoặc chờ thêm để tích lũy.",
  },

  ratioNotice:
    "Hai giới hạn ở đây là thông lệ thẩm định, không phải quy định pháp luật — Ngân hàng Nhà nước không công bố một mức trần cố định, và mỗi ngân hàng có khung riêng. Vì vậy chúng là ô nhập chứ không phải hằng số: nếu ngân hàng của bạn nói con số khác, hãy nhập con số đó. Và điều quan trọng hơn: chịu được theo công thức không có nghĩa là nên vay tới mức đó.",

  formula: {
    title: "Cách tính",
    body: [
      "Hai giới hạn được tính song song. Giới hạn trả nợ nhà = thu nhập × tỷ lệ trả nợ nhà. Giới hạn tổng nợ = thu nhập × tỷ lệ tổng nợ − nợ đang trả; đây là phần CÒN LẠI cho nhà sau khi trừ nợ hiện có, nên nó có thể âm.",
      "Ngân sách nhà ở mỗi tháng là con số nhỏ hơn trong hai giới hạn, và công cụ nói rõ giới hạn nào đang chặn. Với mặc định 50 triệu thu nhập và 5 triệu nợ, hai giới hạn bằng nhau ở 20 triệu; nâng nợ hiện có lên 12 triệu thì giới hạn tổng nợ chặn ở 13 triệu.",
      "Chi phí nhà ở khác được trừ khỏi ngân sách trước khi quy ra số tiền vay, nên phần còn lại mới là khoản trả gốc và lãi. Số tiền vay tối đa là giá trị hiện tại của khoản trả đó trong suốt kỳ hạn: P = A × (1 − (1 + r)^(−n)) ÷ r. Đây là phép nghịch chính xác của công thức niên kim, không phải một phép dò tìm.",
      "Giá nhà nên nhắm tới = số tiền vay tối đa + tiền tích lũy. Với mặc định, trả được 20 triệu mỗi tháng tương đương vay 2.304.616.796 ₫, cộng 600 triệu tích lũy thành mức giá 2.904.616.796 ₫, trong đó tiền tích lũy chiếm 20,7%.",
      "Khi ngân sách còn lại bằng 0 hoặc âm, công cụ trả về số tiền vay bằng 0 kèm ghi chú, thay vì một số âm hay một mức giá không có thật.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao ngân hàng cho vay ít hơn con số này?",
        a: "Thường vì ba lý do. Thứ nhất, ngân hàng xét thu nhập chứng minh được qua sao kê và hợp đồng lao động, thấp hơn thu nhập thực của nhiều hộ. Thứ hai, mức trả tối thiểu của thẻ tín dụng và các khoản trả góp nhỏ đều được tính vào nợ hiện có, kể cả khi bạn luôn trả hết dư nợ thẻ. Thứ ba, ngân hàng còn giới hạn theo tỷ lệ cho vay trên giá trị tài sản bảo đảm — thường 70–80% giá thẩm định, mà giá thẩm định lại thấp hơn giá bán.",
      },
      {
        q: "Tiền tích lũy nên để bao nhiêu cho trả trước?",
        a: "Không phải toàn bộ. Hãy giữ lại quỹ dự phòng bằng 3–6 tháng chi phí sinh hoạt cộng với khoản trả nợ, rồi mới nhập phần còn lại vào ô này. Ngoài ra còn thuế, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm và tiền hoàn thiện nội thất — những khoản này không nằm trong phép tính và thường lên tới vài phần trăm giá nhà.",
      },
      {
        q: "Kéo dài kỳ hạn để mua nhà đắt hơn có nên không?",
        a: "Nó làm được, nhưng đắt. Kéo từ 240 lên 360 tháng nâng số tiền vay tối đa lên đáng kể vì mỗi tháng gánh được khoản vay lớn hơn, nhưng tổng lãi tăng mạnh hơn nhiều — hãy dùng công cụ phân tích khoản vay của FinHome trên con số bạn vừa tính ra để thấy tổng lãi. Nguyên tắc thực dụng: chọn kỳ hạn dài để được duyệt, rồi trả thêm gốc hằng tháng như thể kỳ hạn ngắn.",
      },
      {
        q: "Chịu được 40% thu nhập nghe cao quá, có thật không?",
        a: "Về công thức thì đúng, về đời sống thì tùy. 40% của 50 triệu để lại 30 triệu cho mọi thứ khác, còn 40% của 20 triệu để lại 12 triệu — cùng một tỷ lệ, hai mức áp lực rất khác nhau. Hãy hạ tỷ lệ trong ô nhập xuống mức bạn thực sự thoải mái, chạy lại, và lấy con số đó làm mức nhắm. Công cụ tính mức tối đa ngân hàng chấp nhận, không tính mức khiến bạn ngủ được.",
      },
      {
        q: "Lãi suất thả nổi ảnh hưởng thế nào tới con số này?",
        a: "Rất nhiều, và đây là rủi ro lớn nhất không nằm trong kết quả. Công cụ giả định lãi suất không đổi cả kỳ hạn. Nếu bạn nhập mức ưu đãi 7% rồi lãi thả nổi lên 11%, khoản trả hằng tháng tăng khoảng một phần tư và có thể vượt ngân sách. Cách dùng an toàn: nhập mức lãi cao hơn mức hiện tại 2–3 điểm phần trăm, và lấy mức giá thấp hơn trong hai lần chạy.",
      },
    ],
  },
} as const;
