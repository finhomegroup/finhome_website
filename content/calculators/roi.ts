// Copy for /cong-cu/ty-suat-loi-nhuan-roi/ — the ROI calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// The page leads with the annualised figure, not with plain ROI, and the copy
// says why in three separate places. Plain ROI is the number people ask for
// and the number that misleads them: 40% is 40% whether it took eight months
// or eight years, and only one of those is a good investment.

export const ROI = {
  slug: "/cong-cu/ty-suat-loi-nhuan-roi",

  pageTitle: "Tỷ suất lợi nhuận (ROI)",
  metaTitle: "Tính ROI — Tỷ suất lợi nhuận và lợi nhuận theo năm",
  metaDescription:
    "Nhập số vốn, giá trị thu về và thời gian nắm giữ để tính ROI cùng tỷ suất lợi nhuận theo năm. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập số vốn bỏ ra, số tiền thu về và thời gian nắm giữ. Công cụ tính cả ROI tổng và tỷ suất lợi nhuận theo năm — con số thứ hai mới là con số dùng để so sánh giữa các khoản đầu tư.",

  form: {
    group: "Khoản đầu tư",

    costLabel: "Số vốn bỏ ra",
    costUnit: "₫",
    costHelp:
      "Toàn bộ số tiền đã bỏ ra, gồm cả phí giao dịch, thuế và chi phí liên quan.",
    costInvalid: "Vui lòng nhập số vốn lớn hơn 0.",
    defaultCost: "500.000.000",

    finalLabel: "Giá trị thu về",
    finalUnit: "₫",
    finalHelp:
      "Số tiền nhận lại, hoặc giá trị hiện tại nếu bạn vẫn đang giữ. Gồm cả cổ tức, tiền cho thuê hoặc lãi đã nhận.",
    finalInvalid: "Vui lòng nhập giá trị thu về từ 0 trở lên.",
    defaultFinal: "700.000.000",

    yearsLabel: "Thời gian nắm giữ",
    yearsUnit: "năm",
    yearsHelp:
      "Số năm, có thể là số thập phân — 6 tháng là 0,5. Để trống nếu bạn không cần con số theo năm.",
    yearsInvalid: "Thời gian nắm giữ không được là số âm.",
    defaultYears: "3",

    resultTitle: "Kết quả",
    annualisedLabel: "Lợi nhuận theo năm",
    roiLabel: "ROI tổng",
    gainLabel: "Lãi hoặc lỗ",
    multipleLabel: "Số vốn đã thành",
    multipleSuffix: "lần",

    noAnnualNotice:
      "Không có thời gian nắm giữ nên công cụ chỉ tính được ROI tổng. Hãy nhập số năm để biết con số theo năm — đó mới là con số so sánh được với lãi tiền gửi hay với một khoản đầu tư khác.",
    totalLossNotice:
      "Giá trị thu về bằng 0 nên ROI là −100%. Không có mức lợi nhuận theo năm nào diễn tả được trường hợp này, vì không mức nào đưa một số tiền dương về đúng 0 sau một số năm hữu hạn.",
  },

  leadNotice:
    "Hãy đọc dòng “lợi nhuận theo năm” trước. ROI tổng 40% nghe giống nhau dù bạn mất tám tháng hay tám năm để đạt được, nhưng tám tháng là 65,7%/năm còn tám năm chỉ là 4,3%/năm — thấp hơn cả lãi tiền gửi. ROI tổng không nói gì về thời gian, nên nó không so sánh được giữa các khoản đầu tư có kỳ hạn khác nhau.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi hoặc lỗ bằng giá trị thu về trừ số vốn bỏ ra. ROI tổng bằng lãi chia số vốn rồi nhân 100. Với 500 triệu thành 700 triệu, lãi là 200 triệu và ROI tổng là 40%.",
      "Lợi nhuận theo năm dùng công thức lũy kép: r = (giá trị thu về ÷ số vốn)^(1 ÷ số năm) − 1. Với ví dụ trên trong 3 năm, con số này là 11,87%/năm.",
      "Công cụ không dùng cách chia ROI cho số năm. Cách đó cho ra 40 ÷ 3 = 13,33%/năm, cao hơn thực tế, vì nó bỏ qua việc lãi của năm trước cũng sinh lãi trong năm sau. Sai lệch càng lớn khi thời gian nắm giữ càng dài.",
      "Khi giá trị thu về bằng 0, ROI là −100% và không có mức lợi nhuận theo năm — công cụ để trống ô đó thay vì ghi −100%/năm, vì mức đó hàm ý toàn bộ số tiền mất ngay trong năm đầu.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "ROI và lợi nhuận theo năm, nên dùng con số nào?",
        a: "Dùng lợi nhuận theo năm khi so sánh, dùng ROI tổng khi kể lại kết quả. Lợi nhuận theo năm quy mọi khoản đầu tư về cùng một thước đo thời gian, nên nó so sánh được với lãi tiền gửi, với lợi nhuận của quỹ hoặc với một cơ hội khác. ROI tổng chỉ trả lời “tôi lãi bao nhiêu phần trăm”, không trả lời “khoản này có tốt không”.",
      },
      {
        q: "Có nên tính cả phí và thuế vào không?",
        a: "Nên, và đây là chỗ hầu hết mọi người tự làm đẹp con số của mình. Số vốn bỏ ra nên gồm phí mua, phí môi giới, thuế và các chi phí phát sinh; giá trị thu về nên là số tiền thực nhận sau khi trừ phí bán và thuế. Với bất động sản, phần chi phí này thường lên tới vài phần trăm giá trị và đủ để thay đổi kết luận.",
      },
      {
        q: "Tôi vẫn đang giữ tài sản, chưa bán, thì nhập gì vào giá trị thu về?",
        a: "Nhập giá trị hiện tại theo mức bạn tin là bán được, cộng với các khoản đã nhận trong thời gian giữ như cổ tức hoặc tiền cho thuê. Kết quả khi đó là lợi nhuận trên giấy, và nó chưa trừ phí bán cùng thuế mà bạn sẽ phải trả khi thực sự bán.",
      },
      {
        q: "ROI có tính lạm phát không?",
        a: "Không. Cả ROI tổng và lợi nhuận theo năm ở đây đều là con số danh nghĩa. Nếu lợi nhuận theo năm là 11,87% và lạm phát trung bình 4%/năm, sức mua của bạn chỉ tăng khoảng 7,6%/năm. Với các khoản đầu tư dài hạn, đây là phần chênh lệch đáng để tính riêng.",
      },
      {
        q: "Vì sao lợi nhuận theo năm lại nhỏ hơn ROI chia số năm?",
        a: "Vì lãi kép. Nếu mỗi năm bạn lãi 11,87% thì năm thứ hai lãi được tính trên số tiền đã lớn hơn, nên chỉ cần mức thấp hơn 13,33% là đã đạt 40% sau 3 năm. Khoảng cách giữa hai cách tính rộng dần theo thời gian: sau 10 năm, ROI tổng 40% chỉ tương đương 3,42%/năm.",
      },
    ],
  },
} as const;
