// Copy for /cong-cu/apr-nang-cao/ — the advanced APR calculator.
//
// Original FinHome copy. Shares lib/calc/apr.ts with /cong-cu/apr/.
//
// What "nâng cao" actually adds over the simple page, and why each matters:
//
// 1. Itemised fees. Five boxes instead of one, because the point is to make
//    the reader go through a bank's fee schedule line by line rather than
//    guess a total. The itemisation is presentation only — the component sums
//    it and hands the module one figure.
// 2. Fees rolled into the loan, kept SEPARATE from fees paid in cash. They
//    behave differently: financed fees raise the payment and leave the APR at
//    the contract rate, upfront fees leave the payment alone and raise the
//    APR. Merging them would hide the whole distinction.
// 3. APR at an early payoff. APR by definition assumes the loan runs to
//    term, and most Vietnamese mortgages do not. Clearing at month 36 turns
//    the default 8,7081% into 9,0902%.
//
// Figures quoted are the tool's own output for 2 tỷ, 8,5%/năm, 240 tháng,
// 30 triệu phí trả ngay: APR 8,7081%, tất toán tháng 60 → 8,8923% với dư nợ
// 1.762.543.662 ₫, tất toán tháng 36 → 9,0902%. Gộp 30 triệu vào khoản vay:
// trả 17.616.812 ₫/tháng, APR 8,5000%, tổng lãi 2.198.034.793 ₫.

export const APR_ADVANCED = {
  slug: "/cong-cu/apr-nang-cao",

  pageTitle: "APR nâng cao: phí chi tiết và tất toán sớm",
  metaTitle: "Tính APR nâng cao — Phí chi tiết, phí gộp vào vay, tất toán sớm",
  metaDescription:
    "Tính APR với từng khoản phí riêng, phân biệt phí trả ngay và phí gộp vào khoản vay, và tính lại APR nếu bạn tất toán trước hạn. Công cụ miễn phí của FinHome.",

  lede:
    "Ba thứ mà công cụ APR cơ bản không làm: liệt kê từng khoản phí, tách phí trả ngay khỏi phí gộp vào khoản vay vì hai loại tác động khác nhau, và tính lại APR cho trường hợp bạn tất toán trước hạn — điều mà phần lớn người vay mua nhà thực sự làm.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Số tiền ghi trên hợp đồng, chưa gồm phí gộp vào khoản vay.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất hợp đồng",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi danh nghĩa sau thời gian ưu đãi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay theo hợp đồng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    upfrontGroup: "Phí trả ngay bằng tiền mặt",
    arrangementLabel: "Phí thu xếp / cấp tín dụng",
    appraisalLabel: "Phí thẩm định tài sản",
    notaryLabel: "Phí công chứng và đăng ký giao dịch bảo đảm",
    insuranceLabel: "Phí bảo hiểm năm đầu",
    otherLabel: "Phí khác",
    feeUnit: "₫",
    feeInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    arrangementHelp:
      "Khoản ngân hàng thu để cấp khoản vay. Thường được báo theo phần trăm — nếu vậy hãy dùng ô phần trăm bên dưới.",
    appraisalHelp: "Phí định giá tài sản bảo đảm.",
    notaryHelp: "Phí công chứng hợp đồng thế chấp và phí đăng ký.",
    insuranceHelp:
      "Bảo hiểm nhân thọ hoặc bảo hiểm tài sản, nếu ngân hàng yêu cầu mua như điều kiện giải ngân.",
    otherHelp: "Mọi khoản còn lại bạn phải trả để được giải ngân.",
    defaultArrangement: "20.000.000",
    defaultAppraisal: "5.000.000",
    defaultNotary: "5.000.000",
    defaultInsurance: "0",
    defaultOther: "0",

    pointsLabel: "Phí tính theo phần trăm số tiền vay",
    pointsUnit: "%",
    pointsHelp:
      "Dùng khi phí được báo theo tỷ lệ. Cộng dồn với các ô tiền mặt ở trên.",
    pointsInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultPoints: "0",

    financedGroup: "Phí gộp vào khoản vay",
    financedLabel: "Phí được cộng vào số tiền vay",
    financedUnit: "₫",
    financedHelp:
      "Khoản phí bạn không trả bằng tiền mặt mà cho vào dư nợ. Nó làm tăng khoản trả hằng tháng nhưng KHÔNG làm tăng APR — bạn không bị đắt hơn theo lãi suất, bạn chỉ đang vay nhiều hơn.",
    financedInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFinanced: "0",

    payoffGroup: "Tất toán trước hạn",
    payoffLabel: "Dự định tất toán ở tháng",
    payoffHelp:
      "Số tháng đến khi bạn trả hết, bán nhà hoặc chuyển sang ngân hàng khác. Để trống nếu bạn định trả đến hết kỳ hạn.",
    payoffInvalid:
      "Vui lòng nhập số nguyên tháng lớn hơn 0 và không vượt kỳ hạn.",
    defaultPayoff: "60",

    resultTitle: "Kết quả",
    aprLabel: "APR nếu trả đến hết kỳ hạn",
    payoffAprLabel: "APR nếu tất toán ở tháng đã chọn",
    spreadLabel: "Cao hơn lãi hợp đồng",
    pointsSuffix: "điểm %",

    detailTitle: "Chi tiết",
    effectiveLabel: "Lãi thực tế theo năm, có ghép lãi",
    paymentLabel: "Trả hằng tháng",
    principalLabel: "Số tiền vay sau khi gộp phí",
    netProceedsLabel: "Số tiền thực nhận",
    upfrontTotalLabel: "Tổng phí trả ngay",
    pointsCostLabel: "Trong đó phí theo phần trăm",
    totalFeesLabel: "Tổng phí, gồm phí gộp vào vay",
    payoffBalanceLabel: "Dư nợ tại thời điểm tất toán",
    totalInterestLabel: "Tổng lãi nếu trả đến hết kỳ hạn",
    totalCostLabel: "Tổng chi phí vay, gồm phí",

    unsolvableNotice:
      "Không tìm được mức APR cho các dòng tiền này, thường vì phí quá lớn so với số tiền vay. Các con số còn lại vẫn đúng.",
    feesTooLargeNotice:
      "Tổng phí trả ngay đang bằng hoặc vượt số tiền vay, nên bạn sẽ không thực nhận được gì. Hãy kiểm tra lại các khoản phí đã nhập.",
  },

  payoffNotice:
    "Điểm quan trọng nhất của trang này: APR theo định nghĩa giả định bạn trả đến hết kỳ hạn, và người vay mua nhà tại Việt Nam thường không làm vậy. Phí là một khoản cố định — trả sớm nghĩa là khoản phí đó được trải trên ít tháng hơn, nên chi phí thực cao hơn. Với khoản vay mặc định, APR đến hết kỳ hạn là 8,7081%; tất toán ở tháng 60 tương đương 8,8923%; tất toán ở tháng 36 tương đương 9,0902%. Nếu bạn có ý định trả trước hạn, hãy đọc dòng thứ hai chứ đừng đọc dòng thứ nhất — và đừng quên phí trả nợ trước hạn, khoản này chưa nằm trong phép tính.",

  formula: {
    title: "Cách tính",
    body: [
      "Số tiền vay sau khi gộp phí = số tiền vay + phí gộp vào khoản vay. Đây là con số mà lãi được tính trên đó, nên nó quyết định khoản trả hằng tháng.",
      "Số tiền thực nhận = số tiền vay sau khi gộp phí − tổng phí trả ngay − phí theo phần trăm. Phí theo phần trăm được tính trên số tiền vay ĐÃ gộp phí, vì đó là quy mô khoản vay thật.",
      "APR là mức lãi suất mà tại đó chuỗi khoản trả hằng tháng có giá trị hiện tại bằng số tiền thực nhận. Công cụ giải bằng phương pháp chia đôi khoảng và trả về “không xác định” nếu dòng tiền không kẹp được nghiệm, thay vì một con số đoán.",
      "Hai loại phí tác động khác nhau, và đây là lý do chúng được nhập riêng. Phí trả ngay không đổi khoản trả hằng tháng nhưng giảm số thực nhận, nên toàn bộ tác động dồn vào APR. Phí gộp vào khoản vay giữ nguyên số thực nhận nhưng tăng khoản trả — nên APR vẫn đúng bằng lãi hợp đồng, còn tổng lãi thì tăng. Với mặc định, gộp 30 triệu vào khoản vay cho khoản trả 17.616.812 ₫/tháng, APR 8,5000%, và tổng lãi 2.198.034.793 ₫.",
      "APR khi tất toán sớm được giải trên đúng chuỗi dòng tiền thực tế: số tiền thực nhận ở thời điểm 0, các khoản trả hằng tháng đến tháng tất toán, và một khoản trả cuối bằng dư nợ còn lại. Dư nợ đó lấy từ bảng trả nợ, không phải từ công thức xấp xỉ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên trả phí bằng tiền mặt hay gộp vào khoản vay?",
        a: "Trả bằng tiền mặt nếu bạn có tiền: gộp vào khoản vay nghĩa là bạn trả lãi cho khoản phí đó suốt kỳ hạn. Với mặc định, gộp 30 triệu làm tổng lãi tăng khoảng 32,5 triệu so với trả ngay — tức bạn trả hơn gấp đôi khoản phí. Nghịch lý là APR khi gộp phí lại trông đẹp hơn, đúng bằng lãi hợp đồng; đó là lý do đừng chọn phương án chỉ vì APR thấp hơn.",
      },
      {
        q: "Vì sao phí gộp vào khoản vay không làm APR tăng?",
        a: "Vì APR đo mối quan hệ giữa tiền bạn nhận và tiền bạn trả, và khi phí được gộp thì cả hai đều tăng cùng tỷ lệ — bạn đang vay 2,03 tỷ và trả nợ cho 2,03 tỷ ở cùng mức lãi. Không có gì bị đắt hơn theo lãi suất. Cái tăng là tổng số tiền, và dòng tổng lãi cùng dòng tổng chi phí vay mới cho thấy điều đó.",
      },
      {
        q: "Phí trả nợ trước hạn có được tính không?",
        a: "Chưa. Công cụ tính APR khi tất toán sớm nhưng không cộng phí trả nợ trước hạn, vì mỗi ngân hàng có một biểu phí riêng giảm dần theo số năm đã vay — thường 1–3% dư nợ. Cách gần đúng: cộng khoản phí đó vào ô “phí khác”, hiểu rằng khi đó con số APR đến hết kỳ hạn sẽ bị tính cao hơn thực tế một chút, còn con số APR khi tất toán sớm mới là con số bạn cần.",
      },
      {
        q: "Nhập tháng tất toán bao nhiêu là hợp lý?",
        a: "Số tháng bạn thật sự tin là mình còn nợ khoản này, không phải kỳ hạn trên hợp đồng. Người vay mua nhà ở Việt Nam thường bán, tất toán hoặc chuyển ngân hàng sớm hơn nhiều so với 20–25 năm trên giấy. Nếu không chắc, hãy chạy hai lần với mốc ngắn và mốc dài rồi lấy con số bất lợi hơn.",
      },
      {
        q: "Vì sao phải liệt kê phí thành nhiều ô?",
        a: "Vì để bạn đi hết biểu phí của ngân hàng thay vì ước một con số tổng. Trên thực tế, phí thẩm định và phí công chứng hay bị bỏ sót, còn phí bảo hiểm bắt buộc thì thường không được nhắc đến khi báo lãi suất. Công cụ chỉ cộng năm ô lại rồi đưa vào một phép tính duy nhất — việc liệt kê là để bạn không quên khoản nào.",
      },
    ],
  },
} as const;
