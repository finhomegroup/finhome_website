// Copy for /cong-cu/vay-thuong-mai/ — the commercial loan calculator.
//
// Original FinHome copy. Standard finance.
//
// Business lending has two structures a household mortgage does not, and both
// make the repayment profile uneven: a grace period on principal, and a
// balloon at maturity. Both are cheaper per month and dearer in total, and
// both concentrate risk on one future date. So the page reports the THREE
// payments a borrower actually faces — grace, amortizing, balloon — instead
// of one "monthly payment" that is true for neither stretch.
//
// Figures quoted are the module's own output for 5 tỷ, 11%/năm, 84 tháng,
// ân hạn 12 tháng, gốc cuối kỳ 20%: 45.833.333 ₫/tháng trong ân hạn, rồi
// 85.302.983 ₫/tháng, cộng 1.000.000.000 ₫ cuối kỳ. Tổng lãi 2.691.814.752 ₫
// tức 53,84% số vay. Khoản vay phẳng cùng điều kiện: 85.612.182 ₫/tháng và
// tổng lãi 2.191.423.303 ₫ — cấu trúc tốn thêm 500.391.450 ₫.

export const COMMERCIAL_LOAN = {
  slug: "/cong-cu/vay-thuong-mai",

  pageTitle: "Vay thương mại: ân hạn gốc và trả gốc cuối kỳ",
  metaTitle: "Tính vay thương mại — Kỳ ân hạn và trả gốc cuối kỳ",
  metaDescription:
    "Tính ba khoản trả của khoản vay kinh doanh: tiền lãi trong kỳ ân hạn, khoản trả góp sau đó, và số gốc phải trả cuối kỳ. Công cụ miễn phí của FinHome.",

  lede:
    "Khoản vay kinh doanh thường có kỳ ân hạn gốc, hoặc một phần gốc dồn vào cuối kỳ, hoặc cả hai. Cả hai đều làm mỗi tháng nhẹ hơn và tổng chi phí cao hơn — và dồn rủi ro vào một thời điểm trong tương lai.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền giải ngân.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "5.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất danh nghĩa hằng năm. Vay kinh doanh thường cao hơn vay mua nhà.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "11",

    termLabel: "Kỳ hạn",
    termHelp: "Tổng số tháng vay, đã gồm cả kỳ ân hạn. 7 năm là 84 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "84",

    structureGroup: "Cấu trúc trả nợ",
    graceLabel: "Kỳ ân hạn gốc",
    graceUnit: "tháng",
    graceHelp:
      "Số tháng chỉ trả lãi, chưa trả gốc. Phải nhỏ hơn kỳ hạn. Để 0 nếu trả gốc ngay từ đầu.",
    graceInvalid: "Vui lòng nhập số nguyên tháng từ 0 và nhỏ hơn kỳ hạn.",
    defaultGrace: "12",

    balloonLabel: "Gốc trả cuối kỳ",
    balloonUnit: "% số tiền vay",
    balloonHelp:
      "Phần gốc không trả góp mà dồn vào một lần khi đáo hạn. Phải nhỏ hơn 100%. Để 0 nếu trả góp hết.",
    balloonInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultBalloon: "20",

    resultTitle: "Ba khoản phải trả",
    gracePaymentLabel: "Trong kỳ ân hạn — chỉ lãi",
    amortizingPaymentLabel: "Sau ân hạn — gốc và lãi",
    balloonResultLabel: "Cuối kỳ — gốc còn lại",

    detailTitle: "Chi tiết",
    totalInterestLabel: "Tổng lãi",
    ratioLabel: "Tổng lãi so với số vay",
    structureCostLabel: "Cấu trúc này tốn thêm",
    plainPaymentLabel: "Nếu trả góp phẳng — trả hằng tháng",
    plainInterestLabel: "Nếu trả góp phẳng — tổng lãi",
    graceInterestLabel: "Lãi trả trong kỳ ân hạn",
    amortizingMonthsLabel: "Số tháng trả góp",
    totalPaidLabel: "Tổng số tiền bỏ ra",
    monthsUnit: "tháng",

    table: {
      caption: "Bảng trả nợ theo năm",
      yearColumn: "Năm",
      interestColumn: "Lãi trong năm",
      principalColumn: "Gốc trong năm",
      balanceColumn: "Dư nợ cuối năm",
      // The table's own two points now open `balloonSourceNotice` below,
      // which is the same slot this string used to fill. Kept as one string
      // rather than two so the page cannot end up saying the balance stops at
      // two different places.
    },
  },

  // PROMOTED, not authored. The three funding routes were written only into
  // FAQ item 2, inside a collapsed accordion, while the always-visible copy
  // below the calculator talked about the table and stopped at "bạn cần một
  // kế hoạch cho nó" without saying what the plan could be. A reader who
  // never opens the accordion is the reader who most needs the answer, so it
  // now sits in the `intro` slot — a plain paragraph, directly under the
  // balloon figure and the table whose last balance IS the balloon.
  //
  // The table intro's own two points are kept here word for word in substance:
  // the grace year's zero principal column, and the balance stopping at the
  // balloon rather than at 0. Nothing moved out of the page to make room.
  //
  // What was DROPPED rather than moved: "Đường thứ ba phổ biến nhất" — a
  // frequency claim about Vietnamese commercial borrowers that this project
  // has no data for, flagged by the scope audit and confirmed in source. The
  // risk half of that sentence is supportable and is kept. Rescaling an
  // unsupported claim preserves the wrongness (docs §8 defect 20), so the
  // frequency half is gone rather than softened to "thường".
  balloonSourceNotice:
    "Cột gốc của năm đầu bằng 0 — đó là kỳ ân hạn, và dư nợ không giảm một đồng nào. Cột dư nợ ở cuối bảng dừng tại 1.000.000.000 ₫ thay vì 0, vì đó là phần gốc trả cuối kỳ. Câu hỏi phải trả lời trước khi ký là lấy tiền ở đâu cho khoản đó. Có ba đường: dòng tiền tích lũy của doanh nghiệp, bán tài sản, hoặc tái cấp vốn bằng một khoản vay mới. Đường thứ ba mang rủi ro lớn nhất, vì nó phụ thuộc vào việc ngân hàng khi đó còn muốn cho vay và lãi suất khi đó ở đâu — hai điều bạn không kiểm soát được, và cả hai đều có thể đã khác vào tháng thứ 84.",

  structureNotice:
    "Hai cấu trúc này không làm khoản vay rẻ hơn, chúng chỉ dịch chuyển thời điểm trả. Với ví dụ mặc định, tổng lãi là 2.691.814.752 ₫ so với 2.191.423.303 ₫ của một khoản vay trả góp phẳng cùng số tiền, cùng lãi suất, cùng kỳ hạn — tốn thêm 500.391.450 ₫. Đổi lại, năm đầu bạn chỉ trả 45.833.333 ₫ mỗi tháng thay vì 85.612.182 ₫. Đó là đánh đổi hợp lý nếu dòng tiền của doanh nghiệp cần thời gian hình thành; nó là cái bẫy nếu bạn dùng nó chỉ để khoản vay trông vừa sức.",

  formula: {
    title: "Cách tính",
    body: [
      "Trong kỳ ân hạn, khoản trả bằng dư nợ × lãi suất mỗi tháng. Vì không trả gốc, dư nợ không đổi nên khoản trả cũng không đổi: 5 tỷ × 11% ÷ 12 = 45.833.333 ₫ mỗi tháng, và cả kỳ ân hạn không giảm được đồng gốc nào.",
      "Sau ân hạn, khoản trả góp được tính trên toàn bộ số tiền vay trong số tháng còn lại, với phần gốc cuối kỳ đưa vào công thức dưới dạng giá trị tương lai. Với mặc định: 5 tỷ trong 72 tháng còn lại, còn 1 tỷ ở cuối, cho 85.302.983 ₫ mỗi tháng.",
      "Điểm quan trọng về phần gốc cuối kỳ: lãi vẫn được tính trên toàn bộ dư nợ, gồm cả phần dồn cuối kỳ, suốt cả kỳ hạn. Đó chính là lý do cấu trúc này tốn thêm tiền — nó không phải vay ít hơn, nó là hoãn trả một phần gốc.",
      "Kỳ ân hạn có tác dụng kép làm khoản trả sau đó cao hơn: gốc chưa giảm một đồng, và số tháng còn lại để trả thì đã ngắn hơn. Ở ví dụ mặc định, hai hiệu ứng này gần như bù trừ với hiệu ứng giảm khoản trả của phần gốc cuối kỳ, nên 85.302.983 ₫ chỉ nhỏ hơn khoản trả phẳng một chút — nhưng tổng lãi thì cao hơn hẳn.",
      "Chi phí của cấu trúc được đo bằng cách so tổng lãi với một khoản vay trả góp phẳng cùng số tiền, cùng lãi suất, cùng kỳ hạn. Đây là thước đo trung thực nhất vì nó giữ mọi thứ khác không đổi.",
    ],
    emphasis: [
      // body[0] — nothing is repaid during grace, so the payment cannot move.
      "dư nợ không đổi",
      // body[1] — the balloon is not a smaller loan; interest runs on all of it.
      "toàn bộ số tiền vay",
      // body[2] — the structure defers, it does not discount.
      "hoãn trả một phần gốc",
      // body[3] — grace's second, less obvious effect on the later instalment.
      "số tháng còn lại để trả thì đã ngắn hơn",
      // body[4] — why the yardstick is honest: one thing changes at a time.
      "giữ mọi thứ khác không đổi",
    ],
  },

  /**
   * Editor-selected emphasis for the method section — DECLARED, NOT WIRED.
   *
   * This is deliberately NOT `formula.emphasis`. `CalculatorPage` passes
   * `prose.emphasis` straight into `ProseText`, and `check:markup` fails any
   * page that ships a `<strong>` while `content/calculators/plan-disposition.ts`
   * files it `reference` — which this row is. Filing the row as `emphasis` is
   * a change to that file, which this unit does not own, so the phrases live
   * here where a test can prove they still resolve against the prose. Moving
   * this key to `formula.emphasis` is the one-line half of the change.
   *
   * Each phrase marks a distinction the paragraph exists to draw, appears in
   * exactly ONE paragraph of `formula.body`, and is in sentence case — the
   * mid-sentence capitals these replaced are gone from the prose rather than
   * wrapped in `<strong>`, which would have emphasised the shouting.
   */

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Khi nào kỳ ân hạn là hợp lý?",
        a: "Khi khoản vay tài trợ một dự án chưa tạo ra dòng tiền ngay — xây nhà máy, mở chi nhánh, trồng cây lâu năm. Kỳ ân hạn cho phép doanh nghiệp trả lãi từ nguồn khác trong lúc dự án hình thành. Nó không hợp lý khi được dùng để khoản vay trông vừa sức hơn, vì khoản trả sau ân hạn cao hơn và đến rất nhanh.",
      },
      {
        q: "Phần gốc trả cuối kỳ thì lấy tiền đâu ra?",
        a: "Đây là câu hỏi phải trả lời trước khi ký, và câu trả lời ngắn nằm ngay dưới bảng trả nợ trên trang này. Ba đường thông thường: dòng tiền tích lũy, bán tài sản, hoặc tái cấp vốn bằng một khoản vay mới. Đường thứ ba rủi ro nhất, vì nó phụ thuộc vào việc ngân hàng còn muốn cho vay và lãi suất khi đó ở đâu — hai điều không ai kiểm soát được. Với mặc định, số tiền đó là 1 tỷ đến hạn vào tháng thứ 84. Một điểm dễ bỏ qua: nếu kế hoạch của bạn là tái cấp vốn, thì khoản vay mới sẽ được xét theo tình hình doanh nghiệp ở tháng thứ 84, không phải theo tình hình hôm nay.",
      },
      {
        q: "Vì sao khoản trả sau ân hạn không cao hơn nhiều so với trả góp phẳng?",
        a: "Vì trong ví dụ mặc định hai cấu trúc kéo ngược nhau: kỳ ân hạn đẩy khoản trả lên, còn phần gốc cuối kỳ kéo nó xuống. Hãy đặt phần gốc cuối kỳ về 0 và bạn sẽ thấy khoản trả sau ân hạn cao hơn hẳn khoản trả phẳng. Tổng lãi thì không bù trừ như vậy — cả hai cấu trúc đều làm nó tăng.",
      },
      {
        q: "Công cụ có tính phí không?",
        a: "Không. Vay kinh doanh thường có phí thu xếp, phí thẩm định tài sản bảo đảm và phí cam kết rút vốn trên phần chưa giải ngân. Nếu bạn muốn quy tất cả về một mức lãi suất duy nhất để so giữa các ngân hàng, hãy dùng công cụ APR nâng cao của FinHome — nó có ô riêng cho từng loại phí.",
      },
      {
        q: "Vì sao bảng trả nợ không về 0?",
        a: "Vì phần gốc cuối kỳ chưa được trả góp. Dư nợ cuối bảng dừng đúng ở số tiền dồn cuối kỳ, và số đó là một dòng riêng trong kết quả chứ không nằm trong bảng — vì nó không phải một khoản trả định kỳ.",
      },
    ],
  },
} as const;
