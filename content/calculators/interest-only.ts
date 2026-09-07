// Copy for /cong-cu/chi-tra-lai/ — the interest-only loan calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// `jumpNotice` is the point of this whole page. An interest-only phase looks
// cheap and then the instalment rises sharply, because the same principal must
// be repaid over a shorter remaining term. Leading with that rather than
// burying it is the honest way to present the tool.

export const INTEREST_ONLY = {
  slug: "/cong-cu/chi-tra-lai",

  pageTitle: "Khoản vay chỉ trả lãi: sau ưu đãi phải trả bao nhiêu?",
  metaTitle: "Khoản vay chỉ trả lãi — Mức trả sau khi hết giai đoạn ân hạn",
  metaDescription:
    "Tính khoản trả trong giai đoạn chỉ trả lãi, mức trả sau khi bắt đầu trả gốc, và phần lãi phát sinh thêm. Công cụ miễn phí của FinHome.",

  lede:
    "Trong giai đoạn chỉ trả lãi, bạn không trả gốc nên khoản trả hằng tháng thấp. Nhưng hết giai đoạn đó, toàn bộ số gốc phải trả trong khoảng thời gian còn lại ngắn hơn, nên khoản trả tăng lên. Công cụ này cho bạn thấy mức tăng đó bằng con số cụ thể.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Nhập số tiền vay, ví dụ 2.000.000.000.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Tổng kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Toàn bộ kỳ hạn vay, tính cả giai đoạn chỉ trả lãi.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",

    ioLabel: "Giai đoạn chỉ trả lãi",
    ioUnit: "tháng",
    ioHelp:
      "Số tháng đầu bạn chỉ trả lãi, chưa trả gốc. Phải nhỏ hơn tổng kỳ hạn.",
    ioInvalid:
      "Giai đoạn chỉ trả lãi phải là số nguyên nhỏ hơn tổng kỳ hạn.",
    defaultIo: "24",

    resultTitle: "Kết quả",
    ioPaymentLabel: "Trả mỗi tháng trong giai đoạn chỉ trả lãi",
    amortizingPaymentLabel: "Trả mỗi tháng sau giai đoạn đó",
    increaseLabel: "Mức tăng khi hết giai đoạn ân hạn",
    ioPhaseInterestLabel: "Lãi trả trong giai đoạn chỉ trả lãi",
    totalInterestLabel: "Tổng lãi cả kỳ hạn",
    comparableLabel: "Tổng lãi nếu trả gốc ngay từ đầu",
    extraInterestLabel: "Phần lãi phát sinh thêm",
  },

  jumpNotice:
    "Hãy chú ý con số “Mức tăng khi hết giai đoạn ân hạn”. Đây là phần khiến nhiều người vay gặp khó: khoản trả hằng tháng tăng đột ngột đúng vào lúc giai đoạn ưu đãi kết thúc. Trước khi chọn cấu trúc này, hãy kiểm tra xem thu nhập của bạn có chịu được mức trả sau ân hạn hay không, chứ không chỉ mức trả trong giai đoạn đầu.",

  formula: {
    title: "Công thức tính",
    body: [
      "Trong giai đoạn chỉ trả lãi, khoản trả mỗi tháng bằng dư nợ nhân lãi suất tháng. Vì không trả gốc nên dư nợ giữ nguyên suốt giai đoạn này.",
      "Hết giai đoạn đó, toàn bộ số gốc ban đầu được trả dần trong số tháng còn lại theo công thức niên kim thông thường. Vì số tháng còn lại ít hơn tổng kỳ hạn, khoản trả mỗi tháng cao hơn so với khoản vay trả gốc ngay từ đầu.",
      "Tổng lãi bằng lãi của giai đoạn chỉ trả lãi cộng lãi của giai đoạn trả gốc. Công cụ cũng tính tổng lãi của cùng khoản vay nếu trả gốc ngay từ đầu, rồi lấy phần chênh lệch để cho thấy giai đoạn ân hạn đắt thêm bao nhiêu.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao khoản trả tăng mạnh sau giai đoạn ân hạn?",
        a: "Vì số gốc không hề giảm trong giai đoạn ân hạn, nhưng thời gian còn lại để trả gốc đã ngắn đi. Cùng một số tiền gốc chia cho ít tháng hơn thì mỗi tháng phải trả nhiều hơn. Với khoản vay 20 năm có 2 năm ân hạn, phần gốc phải dồn vào 18 năm còn lại.",
      },
      {
        q: "Khi nào chọn cấu trúc chỉ trả lãi là hợp lý?",
        a: "Khi bạn có lý do rõ ràng để cần dòng tiền thấp trong giai đoạn đầu và tin chắc thu nhập sẽ tăng, hoặc khi bạn dự định bán tài sản trước khi giai đoạn ân hạn kết thúc. Nếu chọn chỉ vì khoản trả ban đầu trông dễ chịu, đây thường là quyết định đắt.",
      },
      {
        q: "Cấu trúc này đắt hơn bao nhiêu?",
        a: "Công cụ cho bạn con số chính xác ở dòng “Phần lãi phát sinh thêm”. Khoản chênh này đến từ việc dư nợ không giảm trong giai đoạn ân hạn, nên lãi vẫn tính trên toàn bộ số gốc suốt thời gian đó.",
      },
    ],
  },
} as const;
