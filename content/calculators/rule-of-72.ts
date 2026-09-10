// Copy for /cong-cu/quy-tac-72/ — the Rule of 72 calculator.
//
// Original FinHome copy. The arithmetic is standard finance, but none of the
// wording or layout here is copied from any third-party reference tool.
//
// `faq.items` is reused verbatim as FAQPage JSON-LD on the page, so the prose
// and the structured data cannot drift apart.

export const RULE_OF_72 = {
  slug: "/cong-cu/quy-tac-72",

  pageTitle: "Quy tắc 72: Bao lâu để tiền của bạn nhân đôi?",
  metaTitle: "Quy tắc 72 — Tính số năm để tiền nhân đôi",
  metaDescription:
    "Nhập lãi suất hằng năm để biết cần bao nhiêu năm để số tiền gốc nhân đôi. Công cụ miễn phí của FinHome, so sánh ước tính theo quy tắc 72 với kết quả chính xác.",

  lede:
    "Quy tắc 72 là cách nhẩm nhanh: lấy 72 chia cho lãi suất hằng năm, bạn có ngay số năm để số tiền gốc nhân đôi nhờ lãi kép. Nhập lãi suất bên dưới để xem kết quả.",

  form: {
    rateLabel: "Lãi suất hằng năm",
    rateSuffix: "%",
    rateHelp: "Nhập lãi suất kép hằng năm, ví dụ 6 hoặc 7,5.",
    rateInvalid: "Vui lòng nhập lãi suất lớn hơn 0 để tính thời gian nhân đôi.",
    resultTitle: "Số năm để gốc nhân đôi",
    estimateLabel: "Ước tính theo quy tắc 72",
    exactLabel: "Kết quả chính xác",
    unit: "năm",
    // Prefilled: ~6%/năm is a realistic Vietnamese deposit rate and sits
    // inside the 6–10% band where the rule is accurate. A default also means
    // the statically exported HTML ships a worked result, not empty fields.
    defaultRate: "6",

    // The inverse direction: the user knows how long they have and wants the
    // rate it would take. The reference tool offers both on one page.
    yearsLabel: "Số năm bạn muốn nhân đôi",
    yearsSuffix: "năm",
    yearsHelp: "Nhập số năm bạn muốn số tiền nhân đôi, ví dụ 10.",
    yearsInvalid:
      "Vui lòng nhập số năm lớn hơn 0 để tính lãi suất cần thiết.",
    rateResultTitle: "Lãi suất cần thiết để gốc nhân đôi",
    rateUnit: "%/năm",
    defaultYears: "10",
  },

  table: {
    title: "Bảng tra nhanh quy tắc 72",
    intro:
      "Thời gian để số tiền nhân đôi ở các mức lãi suất thường gặp. Cột ước tính lấy 72 chia cho lãi suất; cột chính xác dùng công thức lãi kép.",
    caption: "Số năm để gốc nhân đôi theo từng mức lãi suất",
    rateColumn: "Lãi suất (%/năm)",
    estimateColumn: "Ước tính theo quy tắc 72",
    exactColumn: "Kết quả chính xác",
    // The rates a Vietnamese saver or investor actually encounters, from a
    // low-rate deposit through an optimistic equity return.
    rates: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20],
  },

  formula: {
    title: "Công thức và cách hoạt động",
    body: [
      "Ước tính theo quy tắc 72: Số năm ≈ 72 ÷ lãi suất (%). Với lãi suất 6%/năm, bạn cần khoảng 72 ÷ 6 = 12 năm để số tiền gốc nhân đôi.",
      "Kết quả chính xác được tính từ công thức lãi kép: giải phương trình (1 + r)^t = 2, ta có t = ln2 ÷ ln(1 + r). Ở mức 6%/năm, con số chính xác là 11,90 năm — rất gần với ước tính 12 năm.",
      "Quy tắc này chỉ đúng với lãi kép, tức là lãi được nhập vào gốc và tiếp tục sinh lãi. Với lãi đơn, tiền của bạn tăng theo đường thẳng và quy tắc 72 không áp dụng được.",
    ],
  },

  example: {
    title: "Ví dụ với 500 triệu đồng",
    body: [
      "Giả sử bạn có 500 triệu đồng và đầu tư ở mức 7%/năm với lãi kép. Theo quy tắc 72, thời gian để khoản này thành 1 tỷ đồng là 72 ÷ 7 ≈ 10,3 năm. Công thức chính xác cho 10,24 năm — chênh lệch chưa tới một tháng.",
      "Cùng số tiền đó, nếu lãi suất chỉ 5%/năm thì cần khoảng 14,4 năm; nếu đạt 10%/năm thì chỉ cần khoảng 7,2 năm. Mỗi điểm phần trăm lãi suất đều rút ngắn đáng kể thời gian chờ, nhưng mức lãi suất càng cao thường đi kèm rủi ro càng lớn.",
    ],
  },

  caveats: {
    title: "Khi nào quy tắc 72 không còn chính xác",
    items: [
      "Quy tắc chính xác nhất trong khoảng lãi suất 6%–10%/năm. Ra ngoài khoảng này, sai số tăng dần theo cả hai hướng.",
      "Với lãi kép liên tục, tử số đúng về mặt toán học gần với 69 hơn là 72, vì ln2 ≈ 0,69.",
      "Kết quả giả định lãi suất không đổi suốt kỳ hạn. Trên thực tế lãi suất huy động, lợi nhuận đầu tư và lạm phát đều thay đổi theo thời gian.",
      "Công cụ không trừ thuế, phí giao dịch, phí quản lý hay tác động của lạm phát lên sức mua.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Quy tắc 72 là gì?",
        a: "Quy tắc 72 là cách nhẩm nhanh số năm cần thiết để một khoản tiền nhân đôi nhờ lãi kép: lấy 72 chia cho lãi suất hằng năm tính theo phần trăm. Ví dụ ở mức 8%/năm, bạn cần khoảng 72 ÷ 8 = 9 năm.",
      },
      {
        q: "Quy tắc 72 có chính xác không?",
        a: "Đây là ước tính, không phải kết quả tuyệt đối. Trong khoảng 6%–10%/năm, sai số thường dưới một năm so với công thức lãi kép chính xác. Với lãi suất rất thấp hoặc rất cao, bạn nên dùng công thức chính xác t = ln2 ÷ ln(1 + r).",
      },
      {
        q: "Quy tắc 72 áp dụng cho lãi kép hay lãi đơn?",
        a: "Chỉ lãi kép. Quy tắc 72 xuất phát từ công thức tăng trưởng lũy tiến, nên nó chỉ đúng khi lãi được nhập vào gốc và tiếp tục sinh lãi ở kỳ sau.",
      },
      {
        q: "Cần lãi suất bao nhiêu để nhân đôi tiền trong 5 năm?",
        a: "Đảo ngược công thức: 72 ÷ 5 = 14,4. Bạn cần mức lãi kép khoảng 14,4%/năm và duy trì liên tục trong 5 năm. Đây là mức cao hơn nhiều so với lãi suất tiết kiệm thông thường, nên thường đi kèm rủi ro lớn hơn.",
      },
    ],
  },
} as const;
