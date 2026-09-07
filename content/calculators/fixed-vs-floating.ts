// Copy for /cong-cu/lai-co-dinh-hay-tha-noi/ — fixed against floating.
//
// Original FinHome copy. Shares lib/calc/floating-loan.ts with the
// floating-rate page.
//
// The editorial point: this comparison cannot be won on arithmetic, because
// one side depends on a rate nobody knows. So the tool computes the ONE
// number that is knowable — the fixed rate at which the two cost the same —
// and turns the decision into a judgement about whether the market will beat
// that. That reframing is the value; the totals alone would imply a certainty
// the inputs do not support.
//
// Figures quoted are the module's own output for 2 tỷ, 240 tháng, thả nổi
// ưu đãi 7,5% trong 12 tháng rồi 11%, so với cố định 9,5%: cố định trả
// 18.642.624 ₫ và tổng lãi 2.474.229.702 ₫; thả nổi tổng lãi 2.862.633.323 ₫
// → cố định rẻ hơn 388.403.622 ₫. Lãi cố định hòa vốn là 10,7177%.

export const FIXED_VS_FLOATING = {
  slug: "/cong-cu/lai-co-dinh-hay-tha-noi",

  pageTitle: "Lãi cố định hay thả nổi?",
  metaTitle: "So sánh lãi cố định và thả nổi — Mức lãi cố định hòa vốn",
  metaDescription:
    "So tổng lãi giữa khoản vay lãi cố định và khoản vay lãi thả nổi, và tính mức lãi cố định mà tại đó hai phương án ngang nhau. Công cụ miễn phí của FinHome.",

  lede:
    "Phép so này không thể phân định bằng số học, vì một bên phụ thuộc vào mức lãi mà không ai biết trước. Công cụ tính con số duy nhất biết được: mức lãi cố định mà tại đó hai phương án tốn như nhau. Từ đó câu hỏi trở nên trả lời được.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền thực nhận, dùng chung cho cả hai phương án.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay, dùng chung cho cả hai phương án.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    fixedGroup: "Phương án lãi cố định",
    fixedRateLabel: "Lãi suất cố định",
    fixedRateUnit: "%/năm",
    fixedRateHelp:
      "Mức lãi giữ nguyên suốt kỳ hạn. Thường cao hơn lãi ưu đãi của phương án thả nổi — đó là giá của sự chắc chắn.",
    fixedRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultFixedRate: "9,5",

    floatingGroup: "Phương án lãi thả nổi",
    promoMonthsLabel: "Số tháng ưu đãi",
    promoMonthsHelp: "Nhập 0 nếu phương án thả nổi không có lãi ưu đãi.",
    promoMonthsInvalid:
      "Vui lòng nhập số nguyên tháng từ 0 và nhỏ hơn kỳ hạn.",
    defaultPromoMonths: "12",

    promoRateLabel: "Lãi suất ưu đãi",
    promoRateUnit: "%/năm",
    promoRateHelp: "Mức lãi trong thời gian ưu đãi.",
    promoRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPromoRate: "7,5",

    postRateLabel: "Lãi suất sau ưu đãi",
    postRateUnit: "%/năm",
    postRateHelp:
      "Lãi cơ sở cộng biên độ. Đây là ô quyết định kết quả — hãy hỏi ngân hàng bằng văn bản.",
    postRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPostRate: "11",

    adjustEveryLabel: "Điều chỉnh lãi mỗi",
    adjustEveryUnit: "tháng",
    adjustEveryHelp: "Chu kỳ ngân hàng xem lại lãi suất.",
    adjustEveryInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultAdjustEvery: "12",

    adjustStepLabel: "Mỗi lần điều chỉnh, lãi tăng",
    adjustStepUnit: "điểm %",
    adjustStepHelp:
      "Kịch bản do bạn đặt. Để 0 để giả định lãi sau ưu đãi không đổi.",
    adjustStepInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultAdjustStep: "0",

    resultTitle: "Kết luận",
    breakEvenLabel: "Lãi cố định hòa vốn",
    verdictLabel: "Phương án rẻ hơn theo giả định của bạn",
    verdictFixed: "Lãi cố định",
    verdictFloating: "Lãi thả nổi",
    savingLabel: "Rẻ hơn",

    detailTitle: "Chi tiết",
    fixedPaymentLabel: "Lãi cố định — trả hằng tháng",
    fixedInterestLabel: "Lãi cố định — tổng lãi",
    floatingFirstLabel: "Thả nổi — trả trong ưu đãi",
    floatingHighestLabel: "Thả nổi — mức cao nhất",
    floatingInterestLabel: "Thả nổi — tổng lãi",
    shockLabel: "Thả nổi — mức tăng khi hết ưu đãi",

    noBreakEvenNotice:
      "Không tìm được mức lãi cố định hòa vốn trong phạm vi 0–100%/năm. Thường là do kịch bản thả nổi bạn đặt ra quá cực đoan. Hai dòng tổng lãi vẫn so sánh được bình thường.",
  },

  reframeNotice:
    "Đừng đọc dòng “phương án rẻ hơn” như một câu trả lời — nó chỉ đúng với kịch bản lãi suất mà chính bạn vừa nhập. Con số dùng được là LÃI CỐ ĐỊNH HÒA VỐN: với các giả định mặc định, mức đó là 10,7177%/năm. Nghĩa là nếu ngân hàng chào bạn lãi cố định dưới 10,7177% thì cố định rẻ hơn kịch bản thả nổi bạn vừa mô tả; trên mức đó thì thả nổi rẻ hơn. Câu hỏi của bạn không còn là “cái nào rẻ hơn” mà là “tôi có tin lãi thả nổi trung bình sẽ thấp hơn 10,7177% trong 20 năm tới không” — một câu hỏi có thể suy nghĩ được.",

  formula: {
    title: "Cách tính",
    body: [
      "Phương án cố định là một khoản vay niên kim thông thường ở một mức lãi duy nhất. Với 2 tỷ ở 9,5% trong 240 tháng: trả 18.642.624 ₫ mỗi tháng và tổng lãi 2.474.229.702 ₫.",
      "Phương án thả nổi được tính theo từng giai đoạn lãi suất, và ở mỗi lần đổi lãi khoản trả được tính lại trên dư nợ còn lại trong số tháng còn lại — đúng như ngân hàng làm. Với kịch bản mặc định, tổng lãi là 2.862.633.323 ₫.",
      "Chênh lệch: cố định rẻ hơn 388.403.622 ₫. Nhưng con số đó chỉ đúng với kịch bản lãi sau ưu đãi bằng 11% và không đổi.",
      "Lãi cố định hòa vốn được tìm bằng cách chia đôi khoảng trên tổng lãi của phương án cố định, vốn tăng đơn điệu theo lãi suất — nên chỉ có đúng một nghiệm. Với mặc định là 10,7177%: ở mức đó tổng lãi hai bên bằng nhau.",
      "Một điều công cụ không tính: rủi ro. Phương án thả nổi có thể rẻ hơn về kỳ vọng nhưng khiến khoản trả tăng 27% khi hết ưu đãi, và mức tăng đó là chắc chắn còn phần tiết kiệm thì không. Hãy dùng công cụ khoản vay lãi thả nổi để xem khoản trả cao nhất và tự hỏi bạn có gánh được không.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Việt Nam có khoản vay lãi cố định dài hạn không?",
        a: "Rất ít. Phần lớn ngân hàng chỉ cố định lãi trong 1–5 năm đầu rồi chuyển sang thả nổi, nên “lãi cố định 20 năm” hầu như không tồn tại với vay mua nhà cho cá nhân. Nếu bạn được chào cố định 3 hoặc 5 năm, cách dùng công cụ đúng hơn là mô hình cả HAI phương án như thả nổi: một bên có giai đoạn cố định dài hơn, và so bằng công cụ khoản vay lãi thả nổi.",
      },
      {
        q: "Vì sao lãi cố định hòa vốn cao hơn cả lãi sau ưu đãi?",
        a: "Vì phương án thả nổi được hưởng lãi ưu đãi thấp trong năm đầu, nên tính chung cả kỳ hạn nó rẻ hơn mức 11% thuần. Mức hòa vốn 10,7177% nằm giữa 7,5% và 11%, gần với 11% hơn vì giai đoạn sau ưu đãi dài gấp 19 lần. Điều này cho thấy giá trị của một năm ưu đãi nhỏ hơn nhiều so với cảm nhận.",
      },
      {
        q: "Kịch bản lãi tăng nên đặt thế nào?",
        a: "Đặt hai kịch bản: một trung tính, một xấu. Trung tính là lãi sau ưu đãi giữ nguyên; xấu là tăng thêm 0,5 điểm mỗi năm. Nếu mức hòa vốn ở cả hai kịch bản đều cao hơn lãi cố định được chào, thì cố định là lựa chọn rõ ràng. Nếu kết luận đổi chiều giữa hai kịch bản, thì quyết định của bạn phụ thuộc vào một điều không thể biết — và khi đó nên chọn theo mức chịu đựng rủi ro chứ không theo con số.",
      },
      {
        q: "Rẻ hơn về tổng lãi có nghĩa là nên chọn không?",
        a: "Không tự động. Tổng lãi là một tiêu chí; khả năng gánh khoản trả cao nhất là tiêu chí khác, và nó ràng buộc hơn. Một phương án thả nổi rẻ hơn 100 triệu tổng lãi nhưng có tháng phải trả nhiều hơn 5 triệu là một phương án tệ nếu 5 triệu đó vượt ngân sách của bạn. Lãi cố định về bản chất là bạn trả thêm một khoản để mua sự chắc chắn — hãy quyết định xem khoản đó có đáng.",
      },
    ],
  },
} as const;
