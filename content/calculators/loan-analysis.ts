// Copy for /cong-cu/phan-tich-khoan-vay/ — the loan analysis calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Every number quoted in the prose below is the tool's own output for its
// prefilled defaults (2 tỷ, 8,5%/năm, 20 năm), read off the module rather than
// estimated: khoản trả 17.356.465 ₫, tổng lãi 2.165.551.520 ₫ (108,28% số tiền
// vay), tháng 1 gồm 81,62% lãi, tháng cuối 0,70%, vượt mốc ở tháng 143, trả
// hết nửa gốc ở tháng 166 (69,2% kỳ hạn), trả hết nửa lãi ở tháng 84 (35,0%).
// If the defaults change, re-read the module and update these sentences —
// otherwise the page contradicts the calculator sitting above it.

export const LOAN_ANALYSIS = {
  slug: "/cong-cu/phan-tich-khoan-vay",

  pageTitle: "Phân tích khoản vay: tiền của bạn đi đâu?",
  metaTitle: "Phân tích khoản vay — Cơ cấu gốc và lãi theo thời gian",
  metaDescription:
    "Xem tổng lãi bằng bao nhiêu phần trăm số tiền vay, bao lâu mới trả nhiều gốc hơn lãi, và cơ cấu gốc–lãi từng phần tư kỳ hạn. Công cụ miễn phí của FinHome.",

  lede:
    "Khoản trả hằng tháng của một khoản vay trả góp đều là con số không đổi, nhưng ruột của nó thay đổi từng tháng: những năm đầu gần như toàn bộ là lãi, những năm cuối gần như toàn bộ là gốc. Công cụ này bóc tách phần ruột đó.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền thực nhận từ ngân hàng.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Kỳ hạn vay mua nhà phổ biến là 15–25 năm.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",

    resultTitle: "Cơ cấu chi phí",
    monthlyLabel: "Trả hằng tháng",
    totalInterestLabel: "Tổng lãi",
    ratioLabel: "Tổng lãi so với số tiền vay",
    firstShareLabel: "Tỷ lệ lãi trong tháng đầu",
    lastShareLabel: "Tỷ lệ lãi trong tháng cuối",
    crossoverLabel: "Tháng đầu tiên trả gốc nhiều hơn lãi",
    halfInterestLabel: "Trả hết nửa số lãi ở tháng",
    halfPrincipalLabel: "Trả hết nửa số gốc ở tháng",
    monthsUnit: "tháng",
    ofTerm: "kỳ hạn",

    noCrossoverNotice:
      "Với mức lãi suất này, không tháng nào trong kỳ hạn trả được nhiều gốc hơn lãi. Đây là dấu hiệu của một mức lãi suất phi thực tế — hãy kiểm tra lại con số bạn đã nhập.",
  },

  table: {
    caption: "Cơ cấu gốc và lãi theo từng phần tư kỳ hạn",
    quarterColumn: "Giai đoạn",
    quarterFormat: "Tháng {from}–{to}",
    interestColumn: "Lãi đã trả",
    principalColumn: "Gốc đã trả",
    shareColumn: "Tỷ lệ lãi",
    balanceColumn: "Dư nợ cuối giai đoạn",
    intro:
      "Bốn giai đoạn có cùng số tháng nhưng không cùng nội dung. Với khoản vay mặc định — 2 tỷ, 8,5%/năm, 20 năm — phần tư đầu tiên có 77,2% số tiền trả là lãi, phần tư cuối chỉ còn 18,8%. Cùng một khoản trả hằng tháng, nhưng năm năm đầu bạn đang mua thời gian, năm năm cuối bạn mới đang mua căn nhà.",
  },

  frontLoadNotice:
    "Cơ cấu này không phải là ngân hàng thu lãi trước rồi mới thu gốc. Lãi mỗi tháng được tính trên dư nợ còn lại, và dư nợ những tháng đầu gần bằng toàn bộ số tiền vay, nên phần lãi tự nhiên lớn. Hệ quả thực tế: trả nợ trước hạn càng sớm càng tiết kiệm, và bán nhà sau vài năm đầu thì số gốc đã trả được ít hơn nhiều so với cảm giác.",

  formula: {
    title: "Cách đọc từng con số",
    body: [
      "Tổng lãi so với số tiền vay là tổng lãi chia cho số tiền vay. Với khoản vay mặc định, con số này là 108,28% — nghĩa là tiền lãi còn nhiều hơn cả số tiền đã vay. Đây là chỉ tiêu để so sánh mức độ đắt đỏ giữa các kỳ hạn, vì nó không phụ thuộc vào việc bạn vay nhiều hay ít.",
      "Tỷ lệ lãi trong một tháng là phần lãi chia cho khoản trả của tháng đó. Tháng đầu tiên của khoản vay mặc định gồm 81,62% là lãi; tháng cuối cùng chỉ còn 0,70%. Khoản trả hằng tháng không đổi, nhưng cơ cấu bên trong đảo ngược hoàn toàn.",
      "Tháng đầu tiên trả gốc nhiều hơn lãi là tháng 143 — gần 12 năm, tức quá nửa kỳ hạn. Đây là thời điểm cán cân trong mỗi khoản trả nghiêng về phía bạn.",
      "Hai mốc nửa đường cho thấy độ lệch rõ nhất. Nửa số lãi được trả xong ở tháng 84, tức 35,0% kỳ hạn, trong khi nửa số gốc phải đến tháng 166, tức 69,2% kỳ hạn. Lãi được trả sớm, gốc được trả muộn.",
      "Toàn bộ các con số trên được tính từ bảng trả nợ từng tháng, không từ công thức xấp xỉ, nên chúng luôn khớp với bảng trả nợ mà công cụ tính khoản vay in ra cho cùng một khoản vay.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao những năm đầu gần như chỉ trả lãi?",
        a: "Vì lãi mỗi tháng được tính trên dư nợ còn lại, và tháng đầu tiên dư nợ đúng bằng toàn bộ số tiền vay. Khoản trả hằng tháng được thiết kế cố định để bạn dễ thu xếp, nên khi phần lãi lớn thì phần gốc còn lại rất nhỏ. Dư nợ giảm chậm ở đầu kỳ, và mỗi tháng giảm được một chút thì phần lãi tháng sau nhỏ hơn một chút — quá trình này tăng tốc dần về cuối kỳ.",
      },
      {
        q: "Công cụ này khác gì công cụ tính khoản vay mua nhà?",
        a: "Công cụ tính khoản vay trả lời câu hỏi mỗi tháng phải trả bao nhiêu và bảng trả nợ ra sao. Công cụ này trả lời câu hỏi cơ cấu của khoản trả đó thay đổi thế nào theo thời gian, và tổng chi phí lãi lớn đến mức nào so với số tiền vay. Cả hai dùng chung một bảng trả nợ, nên các con số luôn khớp nhau.",
      },
      {
        q: "Biết cơ cấu này thì dùng để làm gì?",
        a: "Ba việc. Thứ nhất, quyết định trả nợ trước hạn: mỗi đồng trả thêm trong những năm đầu cắt được nhiều lãi hơn hẳn cùng số tiền đó ở những năm cuối. Thứ hai, quyết định kỳ hạn: hãy nhập cùng số tiền vay với 15, 20 và 25 năm rồi so sánh dòng tổng lãi so với số tiền vay. Thứ ba, ước lượng khi nào bán được nhà mà không lỗ, vì số gốc bạn đã trả trong vài năm đầu ít hơn nhiều so với cảm nhận.",
      },
      {
        q: "Vì sao trả hết nửa số gốc lại mất tới gần 70% kỳ hạn?",
        a: "Vì phần gốc trong mỗi khoản trả tăng dần theo thời gian, nên nửa sau của kỳ hạn trả được nhiều gốc hơn nửa đầu. Với khoản vay mặc định, nửa số gốc chỉ được trả xong ở tháng 166 trong 240 tháng. Kỳ hạn càng dài và lãi suất càng cao thì mốc này càng lùi về cuối.",
      },
      {
        q: "Kết quả có tính lãi suất thả nổi không?",
        a: "Không. Công cụ giả định lãi suất không đổi trong suốt kỳ hạn. Khoản vay mua nhà tại Việt Nam thường có lãi ưu đãi 6–24 tháng đầu rồi chuyển sang lãi thả nổi, nên hãy nhập mức lãi sau ưu đãi để thấy bức tranh gần thực tế hơn. Cơ cấu lãi dồn về đầu kỳ vẫn đúng dù lãi suất thay đổi — thậm chí còn rõ hơn, vì lãi suất thường tăng sau thời gian ưu đãi.",
      },
    ],
  },
} as const;
