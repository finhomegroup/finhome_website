// Copy for /cong-cu/ty-suat-loi-nhuan-roi/ — the ROI calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// The page leads with the annualised figure, not with plain ROI, and the copy
// says why in three separate places. Plain ROI is the number people ask for
// and the number that misleads them: 40% is 40% whether it took eight months
// or eight years, and only one of those is a good investment.
//
// ORIGINAL ROW 21 asks for a buyer-relevant example, the total-versus-annual
// distinction, and the fees NOT included named explicitly. Three things
// changed for it, all copy:
//
// 1. THE EXAMPLE IS THE HOME FUND. 500 triệu of down-payment money that grew
//    to 700 triệu over three years, not an anonymous investment, because this
//    row exists on the buying path and the next step is the own-capital plan.
// 2. TWO UNSUPPORTED DEPOSIT COMPARISONS REMOVED. The lede notice said 4,3%
//    per year is "thấp hơn cả lãi tiền gửi" and a FAQ said the same. Nobody
//    here has a dated deposit rate, and the site is a static export that
//    cannot fetch one. The arithmetic that made the point — 40% over eight
//    months is 65,7%/năm, over eight years 4,3%/năm — is kept; the claim about
//    what banks pay is gone, and the reader is pointed at their own rate.
// 3. THE TOTAL-LOSS EXPLANATION WAS MATHEMATICALLY FALSE. It said no rate
//    brings a positive amount to exactly zero; −100%/năm does, for every
//    positive holding period. The tool still withholds the figure, and now
//    says why in terms of what the number would MEAN rather than claiming it
//    does not exist. See `lib/calc/roi.ts`.
//
// Also stated once, because the audit found it implied: entered fees are the
// READER'S figures. This page models no fee and deducts none automatically.

export const ROI = {
  slug: "/cong-cu/ty-suat-loi-nhuan-roi",

  pageTitle: "Tỷ suất lợi nhuận (ROI)",
  metaTitle: "Tính ROI — Tỷ suất lợi nhuận và lợi nhuận theo năm",
  metaDescription:
    "Nhập số vốn, giá trị thu về và thời gian nắm giữ để tính ROI cùng tỷ suất lợi nhuận theo năm. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập số vốn bỏ ra, số tiền thu về và thời gian nắm giữ. Công cụ tính cả ROI tổng và tỷ suất lợi nhuận theo năm — con số thứ hai mới là con số dùng để so sánh giữa các khoản đầu tư. Ví dụ điền sẵn là một phần vốn dành để mua nhà: 500 triệu thành 700 triệu sau 3 năm.",

  form: {
    group: "Khoản đầu tư",

    costLabel: "Số vốn bỏ ra",
    costUnit: "₫",
    // The fee boundary, on the field where it matters. The tool adds nothing
    // and deducts nothing: whatever the reader types is the whole of it.
    costHelp:
      "Toàn bộ số tiền đã bỏ ra, gồm cả phí giao dịch, thuế và chi phí liên quan. Công cụ KHÔNG tự tính phí nào — nếu bạn không cộng vào đây thì nó không có trong kết quả.",
    costInvalid: "Vui lòng nhập số vốn lớn hơn 0.",
    defaultCost: "500.000.000",

    finalLabel: "Giá trị thu về",
    finalUnit: "₫",
    // The endpoint boundary. Adding interim income here is allowed and useful,
    // but it makes the answer a TOTAL return that ignores when the money
    // arrived — see the module docstring and the FAQ.
    finalHelp:
      "Số tiền nhận lại, hoặc giá trị hiện tại nếu bạn vẫn đang giữ. Gồm cả cổ tức, tiền cho thuê hoặc lãi đã nhận — nhưng công cụ chỉ cộng chúng vào con số cuối, không xét chúng đến vào tháng nào.",
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
      "Không có thời gian nắm giữ nên công cụ chỉ tính được ROI tổng — con số đó vẫn đúng và vẫn dùng được. Hãy nhập số năm để biết thêm con số theo năm, vì chỉ con số theo năm mới đặt được cạnh một mức lãi hay một khoản đầu tư có kỳ hạn khác.",
    // CORRECTED. This used to claim no rate brings a positive amount to
    // exactly 0, which is false: −100%/năm does, for any positive number of
    // years. The tool still withholds the figure; the reason is what it would
    // MEAN, not that it cannot be computed.
    totalLossNotice:
      "Giá trị thu về bằng 0 nên ROI tổng là −100%: mất toàn bộ số vốn. Công cụ để trống dòng theo năm vì con số duy nhất thỏa công thức là −100%/năm, và nó gây hiểu sai — mức đó đọc như “mất hết trong năm đầu”, lại giống nhau dù bạn giữ một năm hay hai mươi năm. Con số −100% tổng đã nói đúng kết quả rồi.",
  },

  leadNotice:
    "Hãy đọc dòng “lợi nhuận theo năm” trước. ROI tổng 40% nghe giống nhau dù bạn mất tám tháng hay tám năm để đạt được, nhưng tám tháng là 65,7%/năm còn tám năm chỉ là 4,3%/năm. ROI tổng không nói gì về thời gian, nên nó không so sánh được giữa các khoản đầu tư có kỳ hạn khác nhau — hãy lấy con số theo năm và đặt cạnh mức lãi bạn thực sự được trả ở nơi khác.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi hoặc lỗ bằng giá trị thu về trừ số vốn bỏ ra. ROI tổng bằng lãi chia số vốn rồi nhân 100. Với 500 triệu thành 700 triệu, lãi là 200 triệu và ROI tổng là 40%.",
      "Lợi nhuận theo năm dùng công thức lũy kép: r = (giá trị thu về ÷ số vốn)^(1 ÷ số năm) − 1. Với ví dụ trên trong 3 năm, con số này là 11,87%/năm.",
      "Công cụ không dùng cách chia ROI cho số năm. Cách đó cho ra 40 ÷ 3 = 13,33%/năm, cao hơn thực tế, vì nó bỏ qua việc lãi của năm trước cũng sinh lãi trong năm sau. Sai lệch càng lớn khi thời gian nắm giữ càng dài.",
      "Khi giá trị thu về bằng 0, ROI tổng là −100% và công cụ để trống dòng theo năm. Đây là một quy ước đọc, không phải một giới hạn của phép tính: công thức vẫn cho ra đúng −100%/năm, nhưng con số đó hàm ý mất hết ngay trong năm đầu và không phân biệt được một năm với hai mươi năm.",
      "Cả hai con số đều tính ở ĐIỂM ĐẦU và ĐIỂM CUỐI. Nếu bạn cộng tiền cho thuê hay cổ tức đã nhận vào giá trị thu về, kết quả là tổng lợi nhuận đúng, nhưng nó không xét các khoản đó đến vào tháng nào — 10 triệu nhận ở tháng đầu và 10 triệu nhận ở tháng cuối cho cùng một con số ở đây. Khi thời điểm của từng dòng tiền mới là điều bạn cần, hãy dùng công cụ NPV và IRR.",
      "Công cụ không tự tính phí, thuế hay lạm phát. Mọi khoản phí bạn muốn tính phải được cộng vào số vốn bỏ ra hoặc trừ khỏi giá trị thu về — nếu không nhập thì chúng không có trong kết quả.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "ROI và lợi nhuận theo năm, nên dùng con số nào?",
        a: "Dùng lợi nhuận theo năm khi so sánh, dùng ROI tổng khi kể lại kết quả. Lợi nhuận theo năm quy mọi khoản đầu tư về cùng một thước đo thời gian, nên nó đặt được cạnh mức lãi bạn được trả ở nơi khác hoặc cạnh một cơ hội khác — với điều kiện bạn lấy đúng mức lãi đang áp dụng cho mình, vì trang này không biết mức nào. ROI tổng chỉ trả lời “tôi lãi bao nhiêu phần trăm”, không trả lời “khoản này có tốt không”.",
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
        q: "Khoản này là tiền tôi để dành mua nhà — đọc con số nào?",
        a: "Đọc con số theo năm, rồi so với thời điểm bạn cần tiền. Với tiền sắp dùng để trả trước, hai điều quan trọng hơn mức lợi nhuận: tiền có rút ra được đúng lúc cần không, và nếu đúng tháng đó thị trường giảm thì bạn có phải bán lỗ không. Ví dụ điền sẵn trên trang là 500 triệu thành 700 triệu sau 3 năm, tức 11,87%/năm — một kết quả tốt, nhưng nó không nói gì về việc khoản đó có nằm sẵn ở đó vào ngày ký hợp đồng mua nhà hay không. Sau khi có con số, hãy mở công cụ mục tiêu tiết kiệm và nhập lại để xem đến ngày cần tiền còn thiếu bao nhiêu.",
      },
      {
        q: "Tôi nhận tiền cho thuê hằng tháng — cộng vào đâu?",
        a: "Cộng vào “giá trị thu về”, và biết rằng khi đó kết quả là tổng lợi nhuận của cả kỳ chứ không phải lợi nhuận có xét thời điểm. Công cụ này chỉ nhìn số vốn ở đầu kỳ và tổng thu về ở cuối kỳ, nên một khoản tiền thuê nhận ở tháng đầu và cùng khoản đó nhận ở tháng cuối cho ra cùng một con số — dù trên thực tế nhận sớm thì tốt hơn, vì tiền về sớm còn làm được việc khác. Nếu điều bạn cần chính là ảnh hưởng của thời điểm từng dòng tiền, hãy dùng công cụ NPV và IRR; trang này không tính IRR và không nên dùng thay.",
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
