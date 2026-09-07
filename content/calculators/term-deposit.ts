// Copy for /cong-cu/tien-gui-co-ky-han/ — the term deposit calculator.
//
// Original FinHome copy. The arithmetic follows Vietnamese bank practice.
//
// Two things this page gets right that a generic compound-interest calculator
// gets wrong, and the copy explains both:
//
// 1. Interest WITHIN a term is simple and pro-rated. A 6-month deposit at
//    5,5%/năm earns 2,75% of the principal, not (1 + 0,055/12)^6 − 1.
//    Compounding only happens at rollover, if the interest is rolled in.
// 2. Breaking a term deposit early does not give a reduced term rate; it
//    gives the DEMAND rate on the whole period. On the defaults that is
//    750.000 ₫ instead of 20.625.000 ₫ — a loss of 19.875.000 ₫.
//
// Figures below are the tool's own output for 500 triệu, 5,5%/năm, 12 tháng:
// lãi 27.500.000 ₫, cuối kỳ 527.500.000 ₫. Ba kỳ tái tục có nhập lãi vào gốc:
// 587.120.687,50 ₫; rút lãi mỗi kỳ: 582.500.000 ₫.
//
// Rate levels quoted in the FAQ are ranges, deliberately, and the copy says
// they move — the site is a static export and cannot know today's board rate.

export const TERM_DEPOSIT = {
  slug: "/cong-cu/tien-gui-co-ky-han",

  pageTitle: "Tiền gửi có kỳ hạn: nhận được bao nhiêu?",
  metaTitle: "Tính tiền gửi có kỳ hạn — Lãi cuối kỳ và tái tục",
  metaDescription:
    "Tính lãi tiền gửi có kỳ hạn theo đúng cách ngân hàng Việt Nam tính, kèm phương án tái tục và mức thiệt hại nếu rút trước hạn. Công cụ miễn phí của FinHome.",

  lede:
    "Công cụ tính theo đúng cách ngân hàng Việt Nam tính: lãi trong một kỳ hạn là lãi đơn, chia theo số tháng, và chỉ ghép lãi khi bạn tái tục cả gốc lẫn lãi. Có thêm phần quan trọng nhất mà tờ rơi không ghi: rút trước hạn mất gì.",

  form: {
    depositGroup: "Khoản gửi",
    principalLabel: "Số tiền gửi",
    principalUnit: "₫",
    principalHelp: "Số tiền gốc bạn gửi vào.",
    principalInvalid: "Vui lòng nhập số tiền lớn hơn 0.",
    defaultPrincipal: "500.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất niêm yết cho kỳ hạn bạn chọn. Lãi suất trả lãi hằng tháng thường thấp hơn lãi cuối kỳ — hãy nhập đúng mức của sản phẩm bạn chọn.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "5,5",

    termLabel: "Kỳ hạn một lần gửi",
    termHelp: "Số tháng của một kỳ hạn: 1, 3, 6, 12, 24 là các mức phổ biến.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "12",

    payoutLabel: "Cách nhận lãi",
    payoutHelp:
      "Chọn thời điểm ngân hàng trả lãi. Cùng một kỳ hạn thì tổng lãi như nhau; chỉ khác lúc bạn nhận được tiền.",
    payoutMaturity: "Cuối kỳ",
    payoutMonthly: "Hằng tháng",
    payoutQuarterly: "Hằng quý",
    defaultPayout: "maturity",

    rolloverGroup: "Tái tục",
    cyclesLabel: "Số kỳ hạn liên tiếp",
    cyclesHelp:
      "Để 1 nếu chỉ gửi một kỳ rồi rút. Nhập 3 nếu bạn định tái tục ba lần kỳ hạn 12 tháng.",
    cyclesInvalid: "Vui lòng nhập số nguyên từ 1 trở lên.",
    defaultCycles: "1",

    compoundLegend: "Khi tái tục thì làm gì với lãi?",
    compoundHelp:
      "Chỉ có ý nghĩa khi nhận lãi cuối kỳ. Nếu bạn đã nhận lãi hằng tháng thì không còn lãi nào để nhập vào gốc.",
    compoundYes: "Nhập lãi vào gốc",
    compoundNo: "Rút lãi ra, chỉ tái tục gốc",
    defaultCompound: "yes",

    earlyGroup: "Nếu phải rút trước hạn",
    demandRateLabel: "Lãi suất không kỳ hạn",
    demandRateUnit: "%/năm",
    demandRateHelp:
      "Mức lãi ngân hàng áp khi bạn rút trước hạn, thường 0,1–0,2%/năm. Xem biểu lãi suất của ngân hàng.",
    demandRateInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDemandRate: "0,2",

    breakLabel: "Rút sau bao nhiêu tháng",
    breakHelp:
      "Để trống nếu bạn không cần xem phần này. Phải nhỏ hơn hoặc bằng tổng số tháng gửi.",
    breakInvalid:
      "Vui lòng nhập số tháng lớn hơn 0 và không vượt tổng số tháng gửi.",
    defaultBreak: "9",

    resultTitle: "Kết quả",
    totalValueLabel: "Nhận được cuối kỳ",
    totalInterestLabel: "Tổng lãi",
    effectiveLabel: "Lãi suất thực theo năm",

    detailTitle: "Chi tiết",
    perPayoutLabel: "Lãi mỗi lần nhận, kỳ đầu",
    payoutCountLabel: "Số lần nhận lãi",
    totalMonthsLabel: "Tổng số tháng gửi",
    finalPrincipalLabel: "Gốc ở kỳ cuối",
    compoundedLabel: "Có nhập lãi vào gốc",
    yes: "Có",
    no: "Không",
    timesUnit: "lần",
    monthsUnit: "tháng",

    earlyTitle: "Nếu rút trước hạn",
    earlyInterestLabel: "Lãi thực nhận",
    earlyForegoneLabel: "Lãi đáng ra được nếu tính theo kỳ hạn",
    earlyLossLabel: "Thiệt hại do rút trước hạn",

    compoundIgnoredNotice:
      "Bạn đang nhận lãi hằng tháng hoặc hằng quý, nên lựa chọn nhập lãi vào gốc không có tác dụng: lãi đã được trả cho bạn rồi. Nếu muốn ghép lãi, hãy chọn nhận lãi cuối kỳ.",
    payoutMismatchNotice:
      "Kỳ hạn không chia hết cho chu kỳ trả lãi bạn chọn, nên không có sản phẩm nào như vậy. Ví dụ kỳ hạn 5 tháng không thể trả lãi hằng quý. Hãy đổi kỳ hạn hoặc đổi cách nhận lãi.",
  },

  earlyWithdrawalNotice:
    "Điều đắt nhất của tiền gửi có kỳ hạn không nằm ở lãi suất mà ở điều khoản rút trước hạn: bạn không được nhận một phần lãi kỳ hạn, bạn được nhận lãi KHÔNG KỲ HẠN trên toàn bộ thời gian đã gửi — thường 0,1–0,2%/năm. Với 500 triệu gửi 12 tháng ở 5,5% mà rút ở tháng thứ 9, bạn nhận 750.000 ₫ thay vì 20.625.000 ₫, tức mất 19.875.000 ₫. Vì vậy hãy chia tiền thành nhiều sổ kỳ hạn khác nhau, đừng gửi toàn bộ vào một sổ dài hạn.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi trong một kỳ hạn = gốc × lãi suất năm × số tháng ÷ 12. Đây là lãi ĐƠN, chia theo số tháng, không phải lãi kép. Kỳ hạn 6 tháng ở mức 5,5%/năm cho 2,75% số gốc; kỳ hạn 12 tháng cho đúng 5,5%.",
      "Cách nhận lãi không đổi tổng lãi của một kỳ hạn, chỉ đổi thời điểm nhận. Lãi mỗi lần nhận = gốc × lãi suất năm × số tháng mỗi lần ÷ 12. Ngân hàng thường niêm yết lãi suất trả lãi hằng tháng thấp hơn lãi cuối kỳ một chút — đó là mức lãi suất khác, nên hãy nhập đúng mức của sản phẩm bạn chọn.",
      "Ghép lãi chỉ xảy ra ở thời điểm tái tục, và chỉ khi bạn nhập lãi vào gốc. Ba kỳ hạn 12 tháng liên tiếp có nhập lãi vào gốc cho 500.000.000 × 1,055³ = 587.120.687,50 ₫; rút lãi mỗi kỳ chỉ cho 582.500.000 ₫ — chênh 4.620.687,50 ₫.",
      "Lãi suất thực theo năm là mức lãi kép hằng năm tương đương với kết quả cuối cùng. Nó bằng đúng lãi suất niêm yết với một kỳ hạn 12 tháng, cao hơn khi bạn tái tục có nhập lãi, và THẤP HƠN khi bạn gửi một kỳ hạn dài hơn 12 tháng — vì lãi đơn trong kỳ hạn 24 tháng kém hơn ghép lãi hai lần 12 tháng.",
      "Phần rút trước hạn tính lãi thực nhận = gốc × lãi suất không kỳ hạn × số tháng đã gửi ÷ 12, và đặt cạnh mức lãi mà kỳ hạn đáng ra mang lại trong cùng số tháng đó. Chênh lệch giữa hai con số là thiệt hại.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao kỳ hạn 24 tháng lại cho lãi suất thực thấp hơn niêm yết?",
        a: "Vì lãi trong một kỳ hạn là lãi đơn. Gửi 24 tháng ở 5,5%/năm cho 11% số gốc, trong khi gửi hai kỳ 12 tháng và nhập lãi vào gốc cho 11,3025%. Chênh lệch nhỏ nhưng thật, và nó lớn dần theo kỳ hạn. Bù lại, kỳ hạn dài thường được niêm yết lãi suất cao hơn — hãy so bằng dòng lãi suất thực theo năm chứ đừng so lãi suất niêm yết.",
      },
      {
        q: "Nên chọn nhận lãi cuối kỳ hay hằng tháng?",
        a: "Nếu bạn không cần dòng tiền hằng tháng, hãy chọn cuối kỳ và tái tục có nhập lãi vào gốc — cách này cho kết quả cao nhất, vì lãi suất cuối kỳ thường cao hơn và lãi được ghép. Chọn nhận lãi hằng tháng khi bạn cần tiền để chi tiêu; đừng chọn nó rồi để tiền lãi nằm trong tài khoản thanh toán, vì ở đó lãi gần như bằng 0.",
      },
      {
        q: "Chia tiền thành nhiều sổ có lợi gì?",
        a: "Nó giữ cho bạn quyền rút một phần mà không phá cả khoản. Nếu gửi 500 triệu vào một sổ và cần 100 triệu, bạn phải tất toán toàn bộ và nhận lãi không kỳ hạn trên cả 500 triệu. Chia thành năm sổ 100 triệu thì chỉ một sổ bị ảnh hưởng. Nhiều ngân hàng cũng cho phép rút một phần, nhưng phần rút vẫn bị áp lãi không kỳ hạn — hãy hỏi rõ trước khi gửi.",
      },
      {
        q: "Lãi tiền gửi có phải nộp thuế không?",
        a: "Lãi tiền gửi tiết kiệm của cá nhân hiện không thuộc thu nhập chịu thuế thu nhập cá nhân tại Việt Nam, nên công cụ không trừ thuế. Với tổ chức thì lãi tiền gửi là thu nhập chịu thuế thu nhập doanh nghiệp. Quy định có thể thay đổi, nên hãy kiểm tra lại nếu số tiền lớn.",
      },
      {
        q: "Tiền gửi có được bảo hiểm không?",
        a: "Có, nhưng có hạn mức. Bảo hiểm tiền gửi Việt Nam chi trả tối đa một mức nhất định cho tất cả tiền gửi của một người tại một tổ chức tham gia bảo hiểm tiền gửi — hạn mức này do Thủ tướng quy định và đã được điều chỉnh nhiều lần, nên hãy tra mức hiện hành. Nếu số tiền của bạn vượt hạn mức, chia sang nhiều ngân hàng là cách giảm rủi ro.",
      },
      {
        q: "Lãi suất công cụ điền sẵn có phải mức hiện tại không?",
        a: "Không. Đó chỉ là một con số để bạn thay. Trang này là trang tĩnh, không kết nối tới biểu lãi suất của ngân hàng nào, nên nó không thể biết mức hôm nay. Lãi suất huy động thay đổi thường xuyên và chênh nhau đáng kể giữa các ngân hàng — hãy tra mức thực tế rồi nhập vào.",
      },
    ],
  },
} as const;
