// Copy for /cong-cu/tang-luong/ — the pay-rise calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The copy is careful about one thing throughout: these are GROSS figures.
// A rise in gross pay is not the same rise in take-home pay, because social
// insurance is capped and personal income tax is progressive, and a tool that
// let a user read a net figure off it would be misleading about their money.

export const RAISE = {
  slug: "/cong-cu/tang-luong",

  pageTitle: "Tính tăng lương",
  metaTitle: "Tính tăng lương — Lương mới, mức tăng và chênh lệch cả năm",
  metaDescription:
    "Nhập lương hiện tại rồi chọn tăng theo phần trăm, theo số tiền, hoặc nhập mức lương mong muốn. Công cụ miễn phí của FinHome.",

  lede:
    "Ba cách vào cùng một phép tính: bạn biết phần trăm, bạn biết số tiền, hoặc bạn biết mức lương mình muốn. Cách nào cũng cho ra cả hai con số còn lại, kèm chênh lệch tính cho cả năm.",

  form: {
    modeLegend: "Bạn biết con số nào?",
    modeHelp:
      "Kết quả luôn hiển thị cả phần trăm và số tiền, bất kể bạn nhập theo cách nào.",
    modePercent: "Tăng theo phần trăm",
    modeAmount: "Tăng theo số tiền",
    modeTarget: "Biết mức lương mong muốn",

    group: "Lương",
    currentLabel: "Lương hiện tại",
    currentUnit: "₫/tháng",
    currentHelp: "Lương gộp mỗi tháng, trước thuế và bảo hiểm.",
    currentInvalid: "Vui lòng nhập lương hiện tại lớn hơn 0.",
    defaultCurrent: "20.000.000",

    percentLabel: "Mức tăng",
    percentUnit: "%",
    percentHelp: "Ví dụ 15. Nhập số âm nếu muốn tính mức giảm.",
    percentInvalid: "Vui lòng nhập một số.",
    defaultPercent: "15",

    amountLabel: "Số tiền tăng",
    amountUnit: "₫/tháng",
    amountHelp: "Số tiền tăng thêm mỗi tháng. Nhập số âm nếu là mức giảm.",
    amountInvalid: "Vui lòng nhập một số.",
    defaultAmount: "3.000.000",

    targetLabel: "Lương mong muốn",
    targetUnit: "₫/tháng",
    targetHelp: "Mức lương gộp bạn muốn đạt được mỗi tháng.",
    targetInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTarget: "23.000.000",

    perYearLabel: "Số tháng lương mỗi năm",
    perYearHelp:
      "Để 12 nếu hợp đồng trả 12 tháng. Nhập 13 nếu có tháng lương thứ 13, vì khi đó mỗi đồng tăng lương được nhân 13 lần chứ không phải 12.",
    perYearInvalid: "Vui lòng nhập số tháng lớn hơn 0.",
    defaultPerYear: "12",

    resultTitle: "Kết quả",
    nextLabel: "Lương mới",
    increaseLabel: "Tăng thêm mỗi tháng",
    increasePercentLabel: "Mức tăng",
    increasePerYearLabel: "Tăng thêm cả năm",
    nextPerYearLabel: "Tổng lương cả năm sau khi tăng",
  },

  grossNotice:
    "Đây là các con số lương gộp, chưa trừ thuế thu nhập cá nhân và bảo hiểm. Lương thực nhận tăng ít hơn lương gộp, vì thuế thu nhập cá nhân ở Việt Nam có bậc lũy tiến — phần lương tăng thêm thường bị đánh thuế ở bậc cao hơn phần lương cũ. Ngược lại, mức đóng bảo hiểm xã hội có trần, nên khi lương đã vượt trần thì phần tăng thêm không phải đóng thêm bảo hiểm.",

  formula: {
    title: "Cách tính",
    body: [
      "Tăng theo phần trăm: lương mới = lương hiện tại × (1 + mức tăng ÷ 100). Tăng 15% từ 20 triệu cho ra 23 triệu.",
      "Tăng theo số tiền: lương mới = lương hiện tại + số tiền tăng, và mức tăng phần trăm = số tiền tăng ÷ lương hiện tại × 100.",
      "Biết mức lương mong muốn: mức tăng phần trăm = (lương mong muốn − lương hiện tại) ÷ lương hiện tại × 100. Đây là cách dùng khi bạn đã có một con số trong đầu và cần biết nó tương đương bao nhiêu phần trăm để nói trong buổi thương lượng.",
      "Chênh lệch cả năm = số tiền tăng × số tháng lương mỗi năm. Con số này thường thuyết phục hơn con số hằng tháng: 2 triệu mỗi tháng nghe nhỏ, 26 triệu một năm thì không.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lương thực nhận của tôi tăng bao nhiêu?",
        a: "Ít hơn mức tăng lương gộp, và công cụ này không tính được vì nó phụ thuộc vào số người phụ thuộc, các khoản giảm trừ và bậc thuế của bạn. Thuế thu nhập cá nhân ở Việt Nam có bậc lũy tiến, nên phần lương tăng thêm thường bị đánh thuế ở bậc cao hơn phần lương cũ. Nếu muốn con số chính xác, hãy tính thuế trên cả lương cũ và lương mới rồi lấy hiệu.",
      },
      {
        q: "Tăng lương bao nhiêu thì mới thực sự khá hơn?",
        a: "Phần vượt trên lạm phát. Nếu lạm phát trong năm là 4% mà bạn được tăng 4% thì sức mua của bạn đứng yên. Với mức tăng 15% và lạm phát 4%, sức mua tăng khoảng 10,6% — tính bằng (1,15 ÷ 1,04 − 1). Đây là lý do một năm không được tăng lương thực chất là một năm bị giảm lương.",
      },
      {
        q: "Vì sao phải nhập số tháng lương mỗi năm?",
        a: "Vì tháng lương thứ 13 rất phổ biến ở Việt Nam, và nó nhân lên cùng với mức tăng. Một mức tăng 2 triệu mỗi tháng đáng 24 triệu một năm với hợp đồng 12 tháng, nhưng đáng 26 triệu với hợp đồng 13 tháng. Khi so sánh hai lời mời làm việc có số tháng lương khác nhau, đây là chỗ dễ bỏ sót.",
      },
      {
        q: "Tôi nên nói phần trăm hay số tiền khi thương lượng?",
        a: "Hãy nắm cả hai và chọn tùy người nghe. Bộ phận nhân sự thường làm việc theo ngân sách phần trăm; người quản lý trực tiếp thường nghĩ theo số tiền. Con số cả năm hữu ích khi bạn cần cho thấy quy mô, còn con số hằng tháng hữu ích khi cần cho thấy nó nhỏ so với ngân sách của bộ phận.",
      },
      {
        q: "Công cụ có tính được mức giảm lương không?",
        a: "Có. Nhập số âm ở mức tăng hoặc ở số tiền, hoặc nhập một mức lương mong muốn thấp hơn lương hiện tại. Kết quả khi đó là số âm ở mọi dòng, và dòng chênh lệch cả năm cho thấy quy mô thật của việc bị giảm lương.",
      },
    ],
  },
} as const;
