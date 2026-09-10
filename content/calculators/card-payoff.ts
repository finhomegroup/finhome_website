// Copy for /cong-cu/tra-het-the-tin-dung/ — the card payoff calculator.
//
// Original FinHome copy. The arithmetic follows how a card statement works.
//
// Figures quoted below are the tool's own output for 50 triệu at 30%/năm,
// read off the module: lãi thực mỗi tháng 2,5305% (không phải 2,5%); trả
// 3.000.000 ₫/tháng → 22 tháng, lãi 15.758.272 ₫ (31,5% dư nợ); trả
// 1.500.000 ₫/tháng → 75 tháng, lãi 61.325.640 ₫ (122,7% dư nợ); trả hết
// trong 12 tháng cần 4.883.350 ₫/tháng. Re-read the module if defaults move.

export const CARD_PAYOFF = {
  slug: "/cong-cu/tra-het-the-tin-dung",

  pageTitle: "Trả hết nợ thẻ tín dụng: mất bao lâu?",
  metaTitle: "Tính trả hết nợ thẻ tín dụng — Thời gian và tổng lãi",
  metaDescription:
    "Tính số tháng và tổng lãi để trả hết dư nợ thẻ tín dụng với mức trả cố định, hoặc số tiền cần trả mỗi tháng để hết nợ trong một số tháng nhất định. Công cụ miễn phí của FinHome.",

  lede:
    "Nợ thẻ tín dụng không phải một khoản vay trả góp, và tính nó như khoản vay sẽ ra con số dễ chịu hơn thực tế. Công cụ này tính theo đúng cách sao kê tính: lãi cộng theo ngày rồi tính vào cuối kỳ.",

  form: {
    modeLegend: "Bạn muốn tính gì?",
    modeHelp:
      "Hai chiều của cùng một phép tính. Chiều thứ hai hữu ích khi bạn đã có một mốc thời gian trong đầu.",
    modeMonths: "Trả mỗi tháng một mức cố định, mất bao lâu",
    modePayment: "Muốn hết nợ trong bao nhiêu tháng, cần trả bao nhiêu",

    group: "Dư nợ thẻ",
    balanceLabel: "Dư nợ hiện tại",
    balanceUnit: "₫",
    balanceHelp: "Tổng dư nợ trên sao kê, gồm cả các khoản đã trả góp qua thẻ.",
    balanceInvalid: "Vui lòng nhập dư nợ lớn hơn 0.",
    defaultBalance: "50.000.000",

    rateLabel: "Lãi suất thẻ",
    rateUnit: "%/năm",
    rateHelp:
      "Mức lãi ghi trong biểu phí, thường 20–40%/năm với thẻ tại Việt Nam. Lãi được tính theo ngày trên số dư.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "30",

    paymentLabel: "Trả mỗi tháng",
    paymentUnit: "₫",
    paymentHelp:
      "Số tiền cố định bạn trả mỗi tháng. Phải lớn hơn tiền lãi của tháng đầu, nếu không dư nợ sẽ tăng thay vì giảm.",
    paymentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPayment: "3.000.000",

    monthsLabel: "Muốn hết nợ trong",
    monthsHelp: "Số tháng bạn muốn tất toán xong.",
    monthsInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultMonths: "12",

    resultTitle: "Kết quả",
    monthsResultLabel: "Số tháng để hết nợ",
    paymentResultLabel: "Cần trả mỗi tháng",
    totalInterestLabel: "Tổng lãi phải trả",
    interestShareLabel: "Lãi so với dư nợ",
    monthsUnit: "tháng",

    detailTitle: "Chi tiết",
    totalPaidLabel: "Tổng số tiền bỏ ra",
    firstInterestLabel: "Tiền lãi tháng đầu",
    lastPaymentLabel: "Khoản trả tháng cuối",

    noPayoffNotice:
      "Mức trả này không đủ bù tiền lãi của tháng đầu, nên dư nợ sẽ tăng lên mỗi tháng và không bao giờ hết. Đây không phải lỗi tính toán mà là điều thực sự xảy ra. Hãy tăng mức trả lên trên con số tiền lãi tháng đầu.",
  },

  dailyInterestNotice:
    "Lãi thẻ được niêm yết theo năm nhưng cộng theo NGÀY, rồi tính vào cuối kỳ. Vì vậy thẻ 30%/năm không phải 2,5% một tháng mà 2,5305% — nhỏ về mặt con số nhưng cộng dồn đáng kể qua nhiều năm. Quan trọng hơn: mọi ưu đãi miễn lãi biến mất ngay khi bạn không trả hết dư nợ đúng hạn một lần, và lãi thường bị tính lại từ ngày phát sinh giao dịch chứ không phải từ ngày đến hạn.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi mỗi tháng = dư nợ × ((1 + lãi suất năm ÷ 365)^(365 ÷ 12) − 1). Với thẻ 30%/năm, hệ số này là 2,5305% một tháng. Cách tính chia 12 cho ra 2,5% và thấp hơn thực tế.",
      "Mỗi tháng: dư nợ mới = dư nợ cũ + lãi − khoản trả. Công cụ mô phỏng từng tháng cho đến khi dư nợ về 0, và khoản trả tháng cuối được cắt đúng bằng phần còn nợ nên số dư kết thúc ở đúng 0.",
      "Chiều nghịch dùng công thức niên kim với chính lãi suất tháng đó: khoản trả = dư nợ × r × (1 + r)^n ÷ ((1 + r)^n − 1). Với 50 triệu ở 30%/năm, muốn hết nợ trong 12 tháng cần trả 4.883.350 ₫ mỗi tháng.",
      "Khoảng cách giữa hai mức trả rất lớn. Trả 3.000.000 ₫ mỗi tháng: hết nợ sau 22 tháng, tổng lãi 15.758.272 ₫, tức 31,5% dư nợ. Trả 1.500.000 ₫ mỗi tháng: 75 tháng và tổng lãi 61.325.640 ₫ — nhiều hơn cả số đã nợ, 122,7% dư nợ. Giảm một nửa mức trả làm tổng lãi tăng gần bốn lần.",
      "Khi mức trả không bù nổi tiền lãi tháng đầu, công cụ trả về trạng thái không có kết quả kèm ghi chú, thay vì một số tháng rất lớn — vì món nợ đó thực sự không bao giờ hết.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao nợ thẻ đắt hơn khoản vay ngân hàng nhiều như vậy?",
        a: "Vì lãi suất thẻ thường 20–40%/năm so với 8–12%/năm của khoản vay có tài sản bảo đảm, và vì thẻ không có kỳ hạn cố định nên không có gì buộc dư nợ phải giảm. Thêm nữa, lãi thẻ được cộng theo ngày trên số dư, và khi bạn đã trễ hạn một lần thì lãi thường được tính lại từ ngày giao dịch. Nếu bạn đang mang dư nợ thẻ lâu dài, chuyển sang một khoản vay tiêu dùng có kỳ hạn thường rẻ hơn đáng kể.",
      },
      {
        q: "Trả góp 0% qua thẻ có thật là 0% không?",
        a: "Phần lãi thì đúng là 0%, nhưng thường có phí chuyển đổi trả góp 2–5% giá trị giao dịch thu ngay, tức tương đương một mức lãi suất thực đáng kể trên kỳ hạn ngắn. Quan trọng hơn: khoản trả góp và dư nợ thường vẫn nằm chung trên sao kê, nên nếu bạn không trả hết phần dư nợ thường thì phần đó bị tính lãi bình thường. Hãy tách hai loại dư nợ khi nhập vào công cụ.",
      },
      {
        q: "Nên trả thẻ nào trước khi có nhiều thẻ?",
        a: "Trả thẻ có lãi suất cao nhất trước, giữ mức tối thiểu ở các thẻ còn lại — cách này tiết kiệm tiền nhất. Nếu bạn cần động lực để duy trì, trả thẻ có dư nợ nhỏ nhất trước để nhanh có cảm giác hoàn thành cũng là một lựa chọn hợp lý, chỉ tốn hơn một chút. Hãy chạy công cụ cho từng thẻ để thấy chênh lệch trước khi chọn.",
      },
      {
        q: "Tôi có nên rút tiền mặt từ thẻ để trả nợ khác không?",
        a: "Gần như luôn là không. Rút tiền mặt từ thẻ tín dụng bị thu phí ngay 2–4% số tiền rút và KHÔNG có thời gian miễn lãi — lãi tính từ ngày rút. Đây là hình thức tín dụng đắt nhất trong hầu hết các biểu phí. Nếu bạn cần tiền mặt, một khoản vay tiêu dùng có kỳ hạn hầu như luôn rẻ hơn.",
      },
      {
        q: "Kết quả có tính phí thường niên và phí trễ hạn không?",
        a: "Không. Công cụ chỉ tính lãi trên dư nợ. Phí thường niên, phí trễ hạn và phí vượt hạn mức là các khoản riêng, và phí trễ hạn thường bằng 4–6% số tiền tối thiểu chưa trả với một mức sàn. Nếu bạn đang trễ hạn, hãy cộng các khoản phí đó vào dư nợ trước khi tính.",
      },
    ],
  },
} as const;
