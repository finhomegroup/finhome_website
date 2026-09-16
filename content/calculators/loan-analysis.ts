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

    // ORIGINAL ROW 6: "Dùng chung kết quả với công cụ vay mua nhà … cho chọn
    // một tháng/năm". The repayment method has the SAME meaning here as on the
    // mortgage page — both read `computeLoan` — and it changes the cost
    // structure this page is about, so it belongs in the form rather than
    // being assumed.
    methodLegend: "Cách trả nợ",
    methodHelp:
      "Trả góp đều giữ số tiền mỗi tháng không đổi, nên cơ cấu bên trong đảo chiều dần: đầu kỳ gần như toàn lãi, cuối kỳ gần như toàn gốc. Trả gốc đều chia GỐC thành các phần bằng nhau và tính lãi trên dư nợ còn lại, nên tháng đầu nặng nhất rồi nhẹ dần đều, và tổng lãi thấp hơn. Cùng một định nghĩa với công cụ tính khoản vay mua nhà.",
    methodAnnuity: "Trả góp đều (số tiền mỗi tháng không đổi)",
    methodFlatPrincipal: "Trả gốc đều (gốc chia đều, lãi trên dư nợ)",
    defaultMethod: "annuity",

    examineGroup: "Xem một tháng cụ thể",
    examineLabel: "Tháng thứ",
    examineUnit: "tháng",
    examineHelp:
      "Bất kỳ tháng nào trong kỳ hạn, không chỉ hai năm đầu. Nhập số nguyên từ 1 đến số tháng của kỳ hạn — ví dụ 152 để xem tháng 8 của năm thứ 13.",
    examineInvalid:
      "Vui lòng nhập số nguyên tháng từ 1 đến số tháng của kỳ hạn.",
    defaultExamine: "152",

    examineTitle: "Tháng {month} — năm thứ {year}, tháng {monthOfYear}",
    examinePaymentLabel: "Khoản trả tháng đó",
    examineInterestLabel: "Trong đó là lãi",
    examinePrincipalLabel: "Trong đó là gốc",
    examineShareLabel: "Tỷ lệ lãi trong tháng đó",
    examineBalanceLabel: "Dư nợ còn lại cuối tháng đó",
    examineCumulativeInterestLabel: "Lãi đã trả từ đầu đến tháng đó",
    examineCumulativePrincipalLabel: "Gốc đã trả từ đầu đến tháng đó",
    examineRepaidShareLabel: "Đã trả được bao nhiêu phần gốc",
    examineRemainingLabel: "Còn lại sau tháng đó",

    // The return route original row 6 asks for ("Quay về phương án vay đang
    // tính"), with the truth about what a link can and cannot carry. There is
    // no saved context here and no financial figure in any URL.
    returnRouteLabel: "Mở công cụ tính khoản vay mua nhà",
    returnRouteNote:
      "Đó là một trang khác. Số bạn đang nhập ở đây KHÔNG được chuyển sang — trang này không lưu và không gửi gì đi — nên hãy ghi lại số tiền vay, lãi suất, kỳ hạn và cách trả nợ rồi nhập lại. Bù lại, hai trang dùng cùng một bảng trả nợ, nên cùng bộ số sẽ cho cùng con số.",

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

  // ORIGINAL ROW 6's chart: "Cột chồng gốc–lãi và đường dư nợ đồng bộ" — the
  // same stacked columns the mortgage page draws, from the same adapter, moved
  // to a window around the month being examined.
  chart: {
    title: "Gốc và lãi quanh tháng bạn đang xem",
    interest: "Lãi",
    principal: "Gốc",
    balance: "Dư nợ còn lại",
    yearTick: "Năm {n}",
    monthTick: "Tháng {n}",
    xAxisYear: "Năm thứ",
    xAxisMonth: "Tháng thứ",
    yAxis: "Gốc và lãi trong kỳ ({unit})",
    overlayAxis: "Dư nợ còn lại ({unit})",
    summaryYear:
      "Biểu đồ gộp theo năm: {periods} năm, tổng lãi {interest} và tổng gốc {principal}.",
    summaryMonths:
      "Biểu đồ đang xem {window} tháng đầu: lãi {interest}, gốc {principal}.",
    summaryWindow:
      "Biểu đồ đang xem tháng {from} đến {to}, với tháng {month} được viền đậm. Trong cửa sổ này bạn trả {interest} lãi và {principal} gốc. Đường nét đứt là dư nợ còn lại.",
    extraNote: "Biểu đồ đã tính cả khoản trả thêm.",
    methodAnnuity: "Đang tính theo cách trả góp đều.",
    methodFlatPrincipal: "Đang tính theo cách trả gốc đều.",
    assumptions: [
      "Mỗi cột là một tháng, tách thành phần lãi và phần gốc của đúng tháng đó.",
      "Cửa sổ 24 tháng được đặt sao cho chứa tháng bạn chọn; khi chọn gần cuối kỳ hạn, cửa sổ lùi lại để vẫn đủ 24 tháng.",
      "Hai trục dọc khác nhau: cột đọc theo trục bên trái, đường dư nợ đọc theo trục bên phải. Dư nợ ở đầu kỳ lớn hơn khoản trả một tháng rất nhiều nên không thể dùng chung một trục.",
      "Lãi suất được giả định không đổi suốt kỳ hạn.",
    ],
    tableCaption: "Gốc, lãi và dư nợ theo từng tháng trong cửa sổ",
    periodColumn: "Tháng",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì các số đã nhập chưa tạo thành một khoản vay.",
    unavailableRecovery:
      "Hãy sửa ô đang báo lỗi ở trên: số tiền vay, lãi suất, kỳ hạn, hoặc tháng bạn muốn xem (phải nằm trong kỳ hạn).",
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
      // ORIGINAL ROW 6's lesson, in plain Vietnamese: "Lãi tính trên dư nợ;
      // phân biệt trả góp đều và gốc đều."
      "TRẢ GÓP ĐỀU và TRẢ GỐC ĐỀU khác nhau ở chỗ con số nào được giữ cố định. Trả góp đều giữ cố định TỔNG khoản trả mỗi tháng: ngân hàng tính sẵn một số tiền không đổi cho cả kỳ hạn, và vì lãi tính trên dư nợ còn lại nên những tháng đầu phần lãi chiếm gần hết, phần gốc rất mỏng — rồi tỷ lệ đảo dần. Trả gốc đều giữ cố định phần GỐC: số tiền vay chia đều cho số tháng, cộng thêm lãi trên dư nợ còn lại. Phần lãi giảm đều mỗi tháng nên tổng khoản trả giảm đều theo, tháng đầu nặng nhất.",
      "Hệ quả thực tế của hai cách: với cùng số tiền vay, cùng lãi suất và cùng kỳ hạn, trả gốc đều có tháng đầu cao hơn nhưng tổng lãi THẤP hơn, vì dư nợ giảm nhanh hơn ngay từ đầu. Trả góp đều dễ thu xếp hơn cho ngân sách hằng tháng nhưng đắt hơn về tổng lãi. Cả hai đều chỉ tính lãi trên phần bạn còn nợ, không tính trên số tiền vay ban đầu — không cách nào là “thu lãi trước”. Hãy hỏi ngân hàng hợp đồng của bạn áp cách nào, rồi chọn đúng ô ở trên.",
      "Ô “Tháng thứ” cho bạn mở đúng một tháng bất kỳ trong kỳ hạn ra xem, không chỉ hai năm đầu. Mọi con số của tháng đó — khoản trả, phần lãi, phần gốc, dư nợ cuối tháng, và tổng lãi cùng tổng gốc đã trả tính từ tháng 1 — đều lấy từ cùng bảng trả nợ, nên biểu đồ, bảng số và các dòng kết quả luôn nói về cùng một tháng.",
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
