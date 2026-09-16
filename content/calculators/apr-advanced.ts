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
//    behave differently: financed fees raise the payment AND the APR, while
//    upfront fees leave the payment alone and raise the APR MORE, because the
//    fee is surrendered on day one instead of spread over the term. A
//    financed fee is BORROWED, not received, so it never enters the net
//    proceeds. Merging the two boxes would hide the whole distinction.
// 3. APR at an early payoff. APR by definition assumes the loan runs to
//    term, and most Vietnamese mortgages do not. Clearing at month 36 turns
//    the default 8,7081% into 9,0902%.
//
// Figures quoted are the tool's own output for 2 tỷ, 8,5%/năm, 240 tháng,
// 30 triệu phí trả ngay: APR 8,7081%, tất toán tháng 60 → 8,8923% với dư nợ
// 1.762.543.662 ₫, tất toán tháng 36 → 9,0902%. Gộp 30 triệu vào khoản vay:
// trả 17.616.812 ₫/tháng, APR 8,7050% (tất toán tháng 60 → 8,8864%), tổng
// lãi 2.198.034.793 ₫, thực nhận 2.000.000.000 ₫.

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
    rateHelp:
      "Mức lãi danh nghĩa ghi trong hợp đồng. Công cụ giữ NGUYÊN mức này suốt kỳ hạn; lãi ưu đãi rồi thả nổi thuộc công cụ so sánh khoản vay.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp:
      "Số tháng vay theo hợp đồng, tính theo tháng trọn vẹn. Công cụ hỗ trợ tối đa 1.200 tháng.",
    termInvalid:
      "Vui lòng nhập một số nguyên tháng từ 1 đến 1.200 — ví dụ 240, không phải 20 hay 240,5.",
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
    // CORRECTED. The earlier wording described life or property insurance as
    // a bank condition for disbursement. Điều 15(5) Luật Các tổ chức tín dụng
    // 2024 prohibits tying a non-compulsory insurance product to a banking
    // service, and participation in a voluntary product is the customer's
    // choice — so this box asks only for a cost the reader actually has, and
    // does not present voluntary cover as required to receive a loan. Some
    // cover IS compulsory by law or by the security agreement; that is the
    // reader's own contract to check, not something this tool asserts.
    insuranceHelp:
      "Phí bảo hiểm bạn THỰC SỰ phải trả trong năm đầu, nếu có. Bảo hiểm bắt buộc theo quy định hoặc theo hợp đồng bảo đảm thì nhập vào đây; bảo hiểm tự nguyện là quyền lựa chọn của bạn và không phải điều kiện để được vay — nếu bạn không mua thì để trống. Hãy đối chiếu với hợp đồng của bạn.",
    otherHelp:
      "Các khoản còn lại bạn thực sự phải trả để hoàn tất giải ngân. Để trống nếu không có.",
    // One set of defaults for both modes: the basic mode's single total box is
    // this `arrangement` line, so the four below start blank and the two modes
    // report the same total from the first render.
    defaultArrangement: "30.000.000",
    defaultAppraisal: "",
    defaultNotary: "",
    defaultInsurance: "",
    defaultOther: "",

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
      "Khoản phí bạn không trả bằng tiền mặt mà cho vào dư nợ. Nó làm tăng khoản trả hằng tháng VÀ làm tăng APR, vì bạn trả nợ cho một khoản lớn hơn số tiền thực nhận. Chỉ riêng APR là thấp hơn một chút so với trả ngay, vì khoản phí được trải ra theo kỳ hạn — còn tổng lãi thì cao hơn, nên đừng chọn phương án này theo APR.",
    financedInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFinanced: "0",

    payoffGroup: "Tất toán trước hạn",
    payoffLabel: "Dự định tất toán ở tháng",
    payoffHelp:
      "Số tháng đến khi bạn trả hết, bán nhà hoặc chuyển sang ngân hàng khác. Để trống nếu bạn định trả đến hết kỳ hạn.",
    payoffInvalid:
      "Vui lòng nhập một số nguyên tháng từ 1 đến kỳ hạn của khoản vay.",
    defaultPayoff: "60",

    resultTitle: "Kết quả",
    nominalLabel: "Lãi suất trên hợp đồng",
    aprLabel: "APR nếu trả đến hết kỳ hạn",
    payoffAprLabel: "APR nếu tất toán ở tháng đã chọn",
    spreadLabel: "Cao hơn lãi hợp đồng",
    pointsSuffix: "điểm %",

    // Same qualification as the basic page, because it is the same model.
    modeledNote:
      "APR ở đây là lãi suất do FinHome mô hình hóa từ dòng tiền bạn nhập: số tiền thực nhận sau phí, các khoản trả theo lịch, và dư nợ còn lại nếu tất toán ở tháng đã chọn, với lãi suất giữ nguyên suốt kỳ hạn. Đây KHÔNG phải mức công bố theo quy định của Việt Nam và không phải báo giá của ngân hàng. APR danh nghĩa là lãi tháng × 12; con số quy đổi lãi kép ở phần chi tiết không bao giờ thấp hơn mức danh nghĩa và bằng nhau khi lãi suất bằng 0.",
    // CORRECTED. This told readers to add a future early-settlement penalty
    // to the “Phí khác” box — the same fee-timing error already repaired in
    // the comparison tool. A penalty paid in month 60 is not money
    // surrendered at drawdown, and putting it there overstates the APR. This
    // model has no exit-fee field, so the exclusion is explicit and the
    // reader is sent to the tool that does charge it at the horizon.
    settlementFeeNotice:
      "Mô hình tất toán sớm ở đây CHỈ gồm dư nợ còn lại. Phí trả nợ trước hạn KHÔNG được tính — và đừng cộng nó vào ô phí trả ngay: khoản trả ở tháng 60 không phải khoản trả lúc giải ngân, cộng sai thời điểm sẽ làm APR cao hơn thực tế. Công cụ So sánh khoản vay có ô riêng cho phí trả nợ trước hạn và tính nó đúng tại mốc bạn chọn.",

    // ORIGINAL ROW 4: the MONEY at the chosen payoff month, not only the rate
    // it implies. Three rows is the whole block — two arrow pairs and the
    // principal still owed — because a reader comparing "tất toán ở tháng 60"
    // with "trả đến hết kỳ hạn" needs exactly that.
    horizonTitle: "Đến lúc tất toán, khoản vay đã tốn bao nhiêu?",
    /** `{n}` substituted with the chosen payoff month. */
    horizonInterestLabel: "Lãi đã trả: đến tháng {n} → cả kỳ hạn",
    horizonCostLabel: "Chi phí vay (lãi + phí): đến tháng {n} → cả kỳ hạn",
    horizonBalanceLabel: "Gốc còn phải trả khi tất toán ở tháng {n}",
    // The distinction the block exists to make. Principal is not a cost, and
    // each fee is counted once — the financed part is settled by the balance
    // above, so it is not charged twice.
    horizonNote:
      "Chi phí vay ở đây là tiền BẠN MẤT: lãi đã phát sinh cộng toàn bộ phí. Phần gốc bạn trả không phải chi phí — nó giảm nợ, nên nó nằm ở dòng riêng bên trên chứ không cộng vào. Mỗi khoản phí chỉ tính một lần: phí trả ngay đã mất lúc giải ngân, còn phí gộp vào vay nằm trong số gốc nên được tất toán cùng dư nợ. Nếu bạn giữ đến hết kỳ hạn, dư nợ bằng 0 và hai con số bên phải chính là con số cuối cùng.",
    horizonExcludesNote:
      "Chưa gồm phí trả nợ trước hạn: công cụ này không có ô cho khoản đó, nên nó được LOẠI TRỪ chứ không được coi là bằng 0. Hãy hỏi ngân hàng mức phí và cộng thêm vào con số bên trên, hoặc dùng công cụ So sánh khoản vay — nơi có ô riêng và tính đúng tại mốc bạn chọn.",

    feeAllocationTitle: "Tách từng khoản phí và phần phí gộp vào vay",
    feeAllocationSummary: "Đang tính tổng phí trả ngay",

    basicLinkLabel: "Bản gọn hơn: chỉ một ô tổng phí",
    compareLinkLabel: "So hai báo giá tại cùng một mốc giữ khoản vay",

    detailDisclosureTitle: "Xem chi tiết khoản vay, phí và dư nợ",
    detailDisclosureHint:
      "Quy đổi lãi kép, khoản trả, số tiền thực nhận, tổng phí, dư nợ khi tất toán và tổng chi phí vay.",

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
      "Số tiền thực nhận = số tiền vay − tổng phí trả ngay − phí theo phần trăm. Phí gộp vào khoản vay KHÔNG nằm trong số thực nhận: đó là khoản bạn vay thêm để trả phí, không phải tiền vào tay bạn. Phí theo phần trăm được tính trên số tiền vay ĐÃ gộp phí, vì đó là quy mô khoản vay thật.",
      "APR là mức lãi suất mà tại đó chuỗi khoản trả hằng tháng có giá trị hiện tại bằng số tiền thực nhận. Công cụ giải bằng phương pháp chia đôi khoảng và trả về “không xác định” nếu dòng tiền không kẹp được nghiệm, thay vì một con số đoán.",
      "Hai loại phí tác động khác nhau, và đây là lý do chúng được nhập riêng. Phí trả ngay không đổi khoản trả hằng tháng nhưng giảm số thực nhận, nên toàn bộ tác động dồn vào APR. Phí gộp vào khoản vay giữ nguyên số thực nhận nhưng tăng khoản trả, nên APR vẫn tăng — chỉ tăng ít hơn so với trả ngay cùng khoản phí, vì khoản phí được trải ra theo kỳ hạn thay vì mất ngay từ ngày đầu. Với mặc định, gộp 30 triệu vào khoản vay cho khoản trả 17.616.812 ₫/tháng, APR 8,7050% (so với 8,7081% nếu trả ngay), và tổng lãi 2.198.034.793 ₫.",
      "APR khi tất toán sớm được giải trên đúng chuỗi dòng tiền thực tế: số tiền thực nhận ở thời điểm 0, các khoản trả hằng tháng đến tháng tất toán, và một khoản trả cuối bằng dư nợ còn lại. Dư nợ đó lấy từ bảng trả nợ, không phải từ công thức xấp xỉ.",
    ],
    // A rate is not a sum of money, and a financed fee is not cash received.
    emphasis: [
      "Phí gộp vào khoản vay KHÔNG nằm trong số thực nhận",
      "Dư nợ đó lấy từ bảng trả nợ, không phải từ công thức xấp xỉ",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên trả phí bằng tiền mặt hay gộp vào khoản vay?",
        a: "Trả bằng tiền mặt nếu bạn có tiền: gộp vào khoản vay nghĩa là bạn trả lãi cho khoản phí đó suốt kỳ hạn. Với mặc định, gộp 30 triệu làm tổng lãi tăng khoảng 32,5 triệu so với trả ngay — tức bạn trả hơn gấp đôi khoản phí. APR của hai phương án gần như không phân biệt được: 8,7050% khi gộp so với 8,7081% khi trả ngay. Vì thế đừng chọn phương án theo APR — hãy chọn theo tổng lãi.",
      },
      {
        q: "Phí gộp vào khoản vay ảnh hưởng thế nào đến APR?",
        a: "Nó làm APR tăng. APR đo mối quan hệ giữa tiền bạn NHẬN và tiền bạn TRẢ: khi gộp 30 triệu, bạn nhận về 2 tỷ nhưng trả nợ cho một khoản vay 2,03 tỷ, nên mức lãi mà dòng tiền đó hàm ý là 8,7050% chứ không phải 8,5%. Khoản phí gộp vào không phải tiền vào tay bạn, vì vậy nó không nằm trong số tiền thực nhận. Nếu tất toán sớm thì con số còn cao hơn: tất toán ở tháng 60 tương đương APR 8,8864%.",
      },
      {
        q: "Phí trả nợ trước hạn có được tính không?",
        // The "thường 1–3% dư nợ" range was an invented universal — the same
        // one a browser check already removed from `loan.ts:149` and two more
        // units removed from `biweekly.ts` and `points.ts`. This was the last
        // live site. No range is stated: the fee and the years it applies for
        // are set by the contract, and some contracts do not charge one. The
        // actionable half of the answer is kept unchanged.
        a: "Chưa. Công cụ tính APR khi tất toán sớm nhưng không cộng phí trả nợ trước hạn, vì mức phí và thời gian áp dụng do hợp đồng của bạn quy định — biểu phí thường giảm dần theo số năm đã vay, và có hợp đồng không thu. Hãy đọc điều khoản hoặc hỏi ngân hàng để biết con số của chính bạn. Cách gần đúng: cộng khoản phí đó vào ô “phí khác”, hiểu rằng khi đó con số APR đến hết kỳ hạn sẽ bị tính cao hơn thực tế một chút, còn con số APR khi tất toán sớm mới là con số bạn cần.",
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
