// Copy for /cong-cu/loi-nhuan-ky-nam-giu/ — holding period return.
//
// Original FinHome copy. Standard finance.
//
// What justifies this as a tool separate from ROI: it SPLITS the return into
// capital gain and income. Two assets with the same total return and
// different splits are different investments — one pays you while you wait,
// the other only on exit — and the split is what the page is for.
//
// Figures quoted are for the defaults (mua 100 triệu, cuối kỳ 118 triệu,
// nhận 12 triệu cổ tức, giữ 3 năm): lãi vốn 18%, lợi tức 12%, tổng 30%,
// theo năm 9,1393%, cổ tức chiếm 40% tổng lợi nhuận.

export const HOLDING_PERIOD = {
  slug: "/cong-cu/loi-nhuan-ky-nam-giu",

  pageTitle: "Lợi nhuận kỳ nắm giữ: lãi vốn và lợi tức tách riêng",
  metaTitle: "Tính lợi nhuận kỳ nắm giữ — Lãi vốn, lợi tức và mức theo năm",
  metaDescription:
    "Tách lợi nhuận kỳ nắm giữ thành phần lãi vốn và phần lợi tức, kèm mức lợi nhuận quy về năm. Công cụ miễn phí của FinHome.",

  lede:
    "Hai khoản đầu tư cùng lãi 30% có thể là hai thứ hoàn toàn khác nhau: một trả tiền cho bạn trong lúc chờ, một chỉ trả khi bán. Công cụ tách lợi nhuận thành phần lãi vốn và phần lợi tức, rồi quy về mức theo năm.",

  form: {
    group: "Khoản đầu tư",
    beginLabel: "Giá trị lúc mua",
    beginUnit: "₫",
    beginHelp:
      "Số tiền bỏ ra ban đầu. Nên gồm cả phí mua, vì mọi tỷ lệ đều chia cho con số này.",
    beginInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultBegin: "100.000.000",

    endLabel: "Giá trị lúc cuối kỳ",
    endUnit: "₫",
    endHelp:
      "Giá trị khi bán, hoặc giá trị hiện tại nếu bạn vẫn đang giữ. Chưa gồm các khoản đã nhận.",
    endInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultEnd: "118.000.000",

    incomeLabel: "Tiền đã nhận trong cả kỳ",
    incomeUnit: "₫",
    incomeHelp:
      "Tổng cổ tức, lãi trái phiếu hoặc tiền cho thuê nhận được trong toàn bộ thời gian nắm giữ — không phải mỗi năm.",
    incomeInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultIncome: "12.000.000",

    yearsLabel: "Thời gian nắm giữ",
    yearsUnit: "năm",
    yearsHelp:
      "Có thể là số thập phân — 6 tháng là 0,5. Để trống nếu bạn không cần con số theo năm.",
    yearsInvalid: "Thời gian nắm giữ không được là số âm.",
    defaultYears: "3",

    resultTitle: "Kết quả",
    annualisedLabel: "Lợi nhuận theo năm",
    hprLabel: "Lợi nhuận cả kỳ nắm giữ",
    // The SAME number as `hprLabel`, with the period named. CSV row 40's
    // action is "tách rõ lợi nhuận cả kỳ và theo năm bằng nhãn rõ ràng": two
    // percentages stacked in one panel invite being read as two measurements
    // of the same thing, and naming the span on one of them is what stops it.
    // Falls back to the bare label when no period was entered.
    hprPeriodFormat: "Lợi nhuận cả kỳ nắm giữ ({years} năm)",
    capitalGainYieldLabel: "Trong đó lãi vốn",
    incomeYieldLabel: "Trong đó lợi tức",

    detailTitle: "Chi tiết",
    capitalGainLabel: "Lãi vốn",
    totalGainLabel: "Tổng lãi",
    totalProceedsLabel: "Tổng tiền thu về",
    incomeShareLabel: "Lợi tức chiếm bao nhiêu phần trăm tổng lãi",
    yearsResultLabel: "Thời gian nắm giữ",
    yearsSuffix: "năm",

    noAnnualNotice:
      "Không có thời gian nắm giữ nên công cụ chỉ tính được lợi nhuận cả kỳ. Hãy nhập số năm để có con số theo năm — đó mới là con số so sánh được với lãi tiền gửi hoặc với một khoản đầu tư khác.",
    totalLossNotice:
      // Aligned with roi.ts, 2026-09-26: −100%/năm DOES satisfy the formula
      // for any positive holding period; the row is withheld because of what
      // it would mean, not because it cannot be computed.
      "Tổng tiền thu về bằng 0 nên lợi nhuận cả kỳ là −100%: mất toàn bộ số vốn. Công cụ để trống dòng theo năm vì con số duy nhất thỏa công thức là −100%/năm, và nó không phân biệt được một năm với hai mươi năm — con số −100% cả kỳ đã nói đúng kết quả rồi.",
  },

  splitNotice:
    "Dòng cần đọc là hai dòng tách phần, không phải dòng tổng: hai khoản cùng lãi 30% có thể là một khoản đã trả tiền vào tay bạn và một khoản chưa. Chỉ phần lợi tức trả được tiền thuê nhà của bạn trong thời gian nắm giữ.",
  splitNoticeDetailTitle: "Con số cụ thể: 30% chia thành 18% và 12%",
  splitNoticeDetail:
    "Với ví dụ mặc định, lợi nhuận cả kỳ 30% gồm 18% lãi vốn và 12% lợi tức — cổ tức chiếm 40% toàn bộ số lãi. Một cổ phiếu tăng trưởng cùng lãi 30% nhưng không trả cổ tức sẽ có 30% lãi vốn và 0% lợi tức: cùng một con số tổng, nhưng khoản thứ nhất đã trả tiền vào tay bạn còn khoản thứ hai thì chưa.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi vốn = giá trị cuối kỳ − giá trị lúc mua. Lãi vốn tính theo phần trăm = lãi vốn ÷ giá trị lúc mua × 100. Với mặc định: (118 − 100) triệu chia 100 triệu bằng 18%.",
      "Lợi tức tính theo phần trăm = tiền đã nhận ÷ giá trị lúc mua × 100, tức 12 triệu chia 100 triệu bằng 12%. Chú ý mẫu số là giá trị lúc mua, không phải giá trị cuối kỳ — đó là quy ước, và nó giữ cho hai phần cộng lại đúng bằng tổng.",
      "Lợi nhuận cả kỳ nắm giữ = lãi vốn + lợi tức = 30%. Đây là lý do cả hai phần đều chia cho cùng một mẫu số.",
      // "luôn cao hơn" scoped 2026-09-26: the simple division overstates only
      // for a gain held longer than a year; under a year it understates.
      "Lợi nhuận theo năm dùng công thức lũy kép: (tổng tiền thu về ÷ giá trị lúc mua)^(1 ÷ số năm) − 1. Với mặc định là 1,3^(1/3) − 1 = 9,1393%/năm. Không phải 30 ÷ 3 = 10%: cách chia bỏ qua lãi kép, và với một khoản có lãi giữ trên một năm — như ví dụ này — nó cho ra số cao hơn thực tế.",
      // Same correction roi.ts already carries: −100%/năm satisfies the
      // formula; the blank is a reading convention, not a limit of arithmetic.
      "Khi tổng tiền thu về bằng 0, công cụ để trống ô lợi nhuận theo năm. Đây là một quy ước đọc, không phải giới hạn của phép tính: công thức vẫn cho ra đúng −100%/năm, nhưng con số đó hàm ý mất hết ngay trong năm đầu và không phân biệt được một năm với hai mươi năm. Nếu bạn đã nhận được một phần tiền trước khi mất trắng phần còn lại thì vẫn có con số theo năm, và nó âm.",
    ],
    // Editor-selected phrases, rendered as <strong> by `ProseText`.
    // Never markup inside the string: the paragraph stays one plain
    // string so the search index, the JSON-LD and what a reader copies
    // cannot drift from what they see. These mark the denominator convention, and the identity it exists to preserve.
    //
    // Each phrase occurs in exactly ONE paragraph of `body`, so
    // `missingPhrases` is empty and no phrase is marked twice. They are
    // in sentence case on purpose: they REPLACE the mid-sentence capitals
    // this file used to carry, rather than wrapping <strong> around them.
    emphasis: [
      "mẫu số là giá trị lúc mua",
      "cộng lại đúng bằng tổng",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Công cụ này khác gì công cụ tính ROI?",
        a: "ROI cho một con số tổng và mức theo năm. Công cụ này tách con số tổng đó thành lãi vốn và lợi tức, và cho biết mỗi phần chiếm bao nhiêu. Nếu bạn chỉ cần biết lãi bao nhiêu thì dùng ROI; nếu bạn đang chọn giữa một cổ phiếu cổ tức cao và một cổ phiếu tăng trưởng, hoặc đang cần dòng tiền trong thời gian nắm giữ, thì phần tách mới là thông tin.",
      },
      {
        q: "Cổ tức nhận được có phải nhập số sau thuế không?",
        a: "Nên, nếu bạn muốn con số thật. Cổ tức tiền mặt của cá nhân tại Việt Nam chịu thuế thu nhập cá nhân 5%, thường được khấu trừ tại nguồn, nên số thực nhận đã là số sau thuế. Với cổ tức bằng cổ phiếu thì phức tạp hơn: thuế phát sinh khi bạn bán, nên phần đó thường được tính vào lãi vốn thay vì lợi tức.",
      },
      {
        q: "Vì sao lợi tức chia cho giá lúc mua chứ không phải giá hiện tại?",
        a: "Vì mục đích là tách lợi nhuận của chính bạn, và mẫu số phải là số tiền bạn đã bỏ ra. Chia cho giá hiện tại cho ra “lợi suất cổ tức” — một chỉ tiêu khác, dùng để đánh giá cổ phiếu ở giá hôm nay cho người sắp mua. Với ví dụ mặc định, lợi tức của bạn là 12% trên giá mua, nhưng lợi suất cổ tức ở giá 118 triệu chỉ là 10,17%.",
      },
      {
        q: "Tôi vẫn đang giữ, chưa bán, thì nhập gì?",
        a: "Nhập giá trị hiện tại vào ô giá trị cuối kỳ. Kết quả khi đó là lợi nhuận trên giấy đối với phần lãi vốn, và là lợi nhuận thật đối với phần lợi tức — đây là một lý do nữa để đọc hai dòng tách phần. Phần lợi tức đã nằm trong tay bạn; phần lãi vốn thì chưa, và chưa trừ phí bán cùng thuế chuyển nhượng.",
      },
      {
        q: "Có tính lạm phát không?",
        a: "Không. Toàn bộ con số là danh nghĩa. Nếu lợi nhuận theo năm là 9,1393% và lạm phát trung bình 4%/năm, sức mua của bạn chỉ tăng khoảng 4,94%/năm. Với kỳ nắm giữ dài, khoảng chênh này đáng để tính riêng.",
      },
    ],
  },
} as const;
