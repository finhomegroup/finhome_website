// Copy for /cong-cu/phan-phoi-rong/ — gross to net and back.
//
// Original FinHome copy.
//
// ORIGINAL ROW 67 GAVE THIS PAGE ITS DEFAULT CASE: a loan that is disbursed
// after charges. "Số tiền báo giá khác thực nhận bao nhiêu" is the question,
// and its lesson is "thực nhận khác nghĩa vụ phải trả" — you receive
// 1,965 tỷ and you owe 2 tỷ. The generic gross/net mode is retained for every
// other kind of deduction chain, because the arithmetic is the same.
//
// The page also exists for the REVERSE direction. "What must be quoted for me
// to receive 100 triệu" is the question people cannot do in their heads, and
// the intuitive answer — add the deduction rate back — is wrong. Recovering a
// 10% deduction needs 11,11% more gross, not 10%, and at 50% the gross
// doubles.
//
// THE SAME-BASE RULE IS A DECLARED MODELLING ASSUMPTION, NOT TAX LAW. Several
// percentage lines here apply to the SAME base rather than compounding, so two
// 5% lines take 10% and not 9,75%. That is a convention this tool adopts and
// states; the FAQ used to present it as how Vietnamese tax and levy schedules
// are written, and it also quoted specific withholding rates (10% for service
// contracts, 5% on dividends, 0,1% on securities transfers) as current fact.
// Nobody here has verified those against a dated instrument, the P3 scope
// audit flagged them, and none of them is needed: every rate is the reader's
// own input. They are gone, and what replaced them points at the reader's own
// contract or notice.
//
// Figures quoted below are the module's output on this page's own defaults
// (2 tỷ, 1% + 0,5% of the gross, 5 triệu flat): 20 + 10 + 5 = 35 triệu
// withheld, 1,965 tỷ received, and 2.035.532.994,92 ₫ needed gross to receive
// 2 tỷ net. Re-run the module if a default moves.

export const NET_DISTRIBUTION = {
  slug: "/cong-cu/phan-phoi-rong",

  pageTitle: "Vay 2 tỷ, thực nhận bao nhiêu?",
  metaTitle: "Số tiền thực nhận — Từ khoản vay hoặc khoản báo giá sau phí",
  metaDescription:
    "Tính số tiền thực về tay sau các khoản trừ theo phần trăm và theo số tiền, hoặc ngược lại: cần vay hoặc báo giá bao nhiêu để nhận đủ số bạn cần. Công cụ miễn phí của FinHome.",

  lede:
    "Một khoản vay được giải ngân ít hơn số ghi trên hợp đồng khi có phí bị trừ ngay lúc nhận — nhưng nghĩa vụ trả nợ vẫn là số trên hợp đồng. Trang này chạy chuỗi khoản trừ đó theo cả hai chiều, với các khoản phí do BẠN nhập.",

  // A TOOL-SPECIFIC DISCLAIMER, because the shared one contradicts this page
  // twice. It says results do not deduct "thuế, phí và lạm phát" — this tool's
  // entire job is deducting the fees the reader entered — and it talks about
  // an unchanging interest rate, which this page never computes. An
  // independent reading review found both. The opening clause `check:markup`
  // counts is kept; only what follows it is replaced, and the real boundary
  // is stated instead: ONLY entered charges, no automatic tax, no APR, no
  // contract verification.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa. Nó trừ ĐÚNG những khoản bạn đã nhập và không thêm khoản nào: không tự tính thuế, không tự áp biểu phí của tổ chức nào, và không kiểm tra hợp đồng của bạn có những khoản phí gì. Kết quả cũng không quy các khoản phí đó về một mức lãi suất tương đương — đó là việc của công cụ APR. Con số ở đây không phải cam kết về số tiền bạn sẽ được giải ngân và không phải lời khuyên tài chính.",

  // Original row 67: "gắn rõ loại giao dịch".
  transactionNotice:
    "Các khoản trừ ở đây là GIẢ ĐỊNH do bạn nhập, không phải biểu phí của nơi nào. Công cụ không biết hợp đồng của bạn có phí gì, không phải công cụ tính thuế, và không xác định khoản nào là bắt buộc — hãy lấy đúng tên và tỷ lệ từ bảng phí hoặc hợp đồng bạn được cung cấp.",
  transactionNoticeDetailTitle: "Dùng cho những giao dịch nào?",
  transactionNoticeDetail:
    "Phép tính chỉ là một chuỗi khoản trừ, nên nó đúng cho nhiều tình huống: khoản vay bị trừ phí khi giải ngân, một khoản báo giá dịch vụ bị khấu trừ tại nguồn, tiền nhận từ nước ngoài qua phí chuyển và phí trung gian, hoặc tiền rút từ một sản phẩm đầu tư có phí bán. Điều công cụ KHÔNG làm là quyết định khoản nào áp dụng cho bạn và ở mức nào. Với khoản vay, cần nhớ thêm một điều mà phép trừ này không nói: lãi được tính trên số NỢ GỐC, không phải trên số tiền về tay.",

  form: {
    directionLegend: "Bạn có con số nào?",
    directionHelp:
      "Chiều thứ hai trả lời câu hỏi khó hơn: cần vay hoặc báo giá bao nhiêu để nhận đủ số tiền bạn cần.",
    directionToNet: "Có số nợ gốc, tính số thực nhận",
    directionToGross: "Có số cần nhận, tính số nợ gốc",
    defaultDirection: "toNet",

    amountGroup: "Số tiền",
    amountLabel: "Số tiền",
    amountUnit: "₫",
    amountHelp:
      "Con số bạn đang có, theo chiều đã chọn ở trên. Ở chiều thứ nhất đây là số nợ gốc trên hợp đồng.",
    amountInvalid: "Vui lòng nhập một số lớn hơn 0.",
    // Original row 67's default case: a 2 tỷ loan disbursed after charges.
    defaultAmount: "2.000.000.000",

    percentGroup: "Khoản trừ theo phần trăm",
    percentHelp:
      "Mỗi dòng được tính trên CÙNG số nợ gốc, không cộng dồn lên nhau — đây là quy ước công cụ này dùng và ghi rõ, không phải quy định của ai. Tổng phải nhỏ hơn 100%.",
    percent1Label: "Phí thu xếp / phí giải ngân",
    percent2Label: "Phí bảo hiểm hoặc khoản trừ khác",
    percent3Label: "Khoản trừ theo phần trăm khác",
    percentUnit: "%",
    percentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    // The CROSS-FIELD error: each rate can be legal while the sum is not.
    // Shown on every percentage field, because the sum is the fault.
    totalRateInvalid:
      "Tổng các khoản trừ theo phần trăm đang bằng hoặc vượt 100%, nên không còn gì về tay. Hãy giảm một trong các tỷ lệ.",
    defaultPercent1: "1",
    defaultPercent2: "0,5",
    defaultPercent3: "0",

    fixedGroup: "Khoản trừ theo số tiền",
    fixedHelp:
      "Các khoản cố định, trừ sau phần trăm. Ví dụ phí công chứng, phí thẩm định hoặc phí chuyển tiền theo bảng phí bạn có.",
    fixed1Label: "Khoản phí cố định 1",
    fixed2Label: "Khoản phí cố định 2",
    fixedUnit: "₫",
    fixedInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFixed1: "5.000.000",
    defaultFixed2: "0",

    resultTitle: "Kết quả",
    grossLabel: "Nợ gốc trên hợp đồng",
    netLabel: "Số tiền thực về tay",
    grossUpLabel: "Phải vay thêm bao nhiêu so với số cần nhận",

    // The row original row 67 asks for by name: the obligation stays visible
    // and is stated as unchanged, beside the smaller figure that arrived.
    obligationLabel: "Vẫn phải trả lãi và gốc trên",
    obligationNote:
      "Phí bị trừ khi giải ngân KHÔNG làm giảm khoản nợ. Bạn nhận về số nhỏ hơn nhưng vẫn trả lãi và trả gốc trên số nợ gốc — đó là lý do hai dòng đầu khác nhau.",

    detailTitle: "Chi tiết",
    percentAmountLabel: "Trừ theo phần trăm",
    fixedAmountLabel: "Trừ theo số tiền",
    totalDeductedLabel: "Tổng trừ",
    totalRateLabel: "Tổng tỷ lệ trừ",
    effectiveRateLabel: "Tỷ lệ trừ thực tế trên số tổng",
    retentionLabel: "Còn lại",

    negativeNetNotice:
      "Số thực nhận là số ÂM: các khoản trừ cố định lớn hơn cả số còn lại sau khi trừ phần trăm. Công cụ không làm tròn về 0 vì đây là kết quả thật — một khoản tiền nhỏ có thể bị một khoản phí cố định ăn hết và còn thiếu.",
    tooMuchNotice:
      "Tổng các khoản trừ theo phần trăm bằng hoặc vượt 100%, nên không còn gì lại và chiều nghịch cũng không có đáp án. Hãy kiểm tra lại các tỷ lệ đã nhập.",
  },

  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Từ tiền vay, trừ từng khoản phí, đến số thực về tay",
    axis: "Số TIỀN ({unit})",
    assumptions: [
      "Mọi khoản trừ là giả định do bạn nhập. Công cụ không biết bảng phí của nơi nào và không xác định khoản nào là bắt buộc.",
      "Các khoản theo phần trăm được tính trên CÙNG số nợ gốc — quy ước của công cụ này, ghi rõ ở cột “cơ sở tính”.",
      "Mỗi thanh ở giữa dài đúng bằng số tiền còn trong tay TRƯỚC khoản phí đó, và được chia hai phần: phần giữ lại và phần bị trừ. Vì vậy thanh nào cũng bắt đầu từ chỗ thanh trên kết thúc.",
      "Phần bị trừ trông mảnh vì phí thực sự nhỏ so với số tiền vay — câu tóm tắt ghi rõ tỷ lệ đó. Trục luôn bắt đầu từ 0; công cụ không cắt trục để khoản phí trông lớn hơn thực tế.",
      "Đây là hình của số TIỀN. Khoản NỢ không nằm trong hình và không giảm theo: xem dòng nợ gốc trong bảng và ở phần kết quả.",
    ],
    tableCaption: "Từng khoản trừ, cơ sở tính, số còn lại, và khoản nợ không đổi",
    itemColumn: "Khoản",
    amountColumn: "Số tiền",
    tableHint:
      "Đọc theo cột “tiền còn lại” là thấy đúng cây cầu trong hình: bắt đầu từ toàn bộ tiền vay, mỗi dòng giữa trừ đi một khoản (mang dấu âm), và số còn lại sau khoản đó nằm ngay bên phải. Dòng “tiền thực về tay” là số cuối cùng. Dòng cuối nhắc lại NỢ GỐC — nó không giảm đi vì phí đã bị trừ. Cột “cơ sở tính” cho biết mỗi khoản phần trăm tính trên đâu, để bạn đối chiếu với hợp đồng.",
    unavailableReason:
      "Chưa vẽ được: cần số tiền lớn hơn 0 và tổng tỷ lệ trừ nhỏ hơn 100%.",
    unavailableRecovery:
      "Hãy kiểm tra lại số tiền và các tỷ lệ đã nhập.",
    grossBar: "Tiền vay trước khi trừ phí",
    netBar: "= Tiền thực về tay",
    remainingSegment: "Phần tiền còn giữ lại",
    deductedSegment: "Phần bị trừ ở khoản phí đó",
    cashSegment: "Tiền thực về tay",
    stepFormat: "− {charge}: {amount}",
    stepRemainingFormat: "còn {remaining}",
    debtRow: "Nợ gốc vẫn phải trả",
    summary:
      "Tiền vay {gross}, trừ {charges} phí, còn {net} về tay.",
    scaleNote:
      "Tổng phí {charges} chỉ bằng {percent}% số tiền vay, nên trong hình các đoạn bị trừ rất mảnh — đó là tỷ lệ thật, không phải lỗi vẽ.",
    obligationNote:
      "Hình này chỉ trừ dần ở phần TIỀN. Khoản NỢ không giảm: bạn vẫn trả lãi và gốc trên {gross} — xem dòng “nợ gốc vẫn phải trả”.",
    noChargesNote: "Chưa nhập khoản trừ nào, nên hai con số bằng nhau.",
    negativeReason:
      "Các khoản trừ cố định lớn hơn cả số tiền, nên số về tay là số âm và không vẽ được thành thanh.",
    negativeRecovery:
      "Xem dòng “số tiền thực về tay” ở trên để thấy con số âm, và kiểm tra lại các khoản phí cố định.",
    percentBaseFormat: "{percent}% của nợ gốc",
    chargeColumn: "Khoản mục",
    basisColumn: "Cơ sở tính",
    remainingColumn: "Tiền còn lại",
    flatBasis: "Số tiền cố định",
  },

  reverseNotice:
    "Chiều nghịch là chỗ cách tính trong đầu sai. Nếu bị trừ 10% mà bạn cần nhận 90 triệu, số phải vay là 100 triệu — không phải 99 triệu. Nói cách khác, để bù một khoản trừ 10% bạn cần thêm 11,11% số gốc, không phải 10%. Khoảng cách này rộng rất nhanh: ở mức trừ 50% thì số gốc tăng gấp đôi, ở mức 75% thì gấp bốn. Với mặc định của trang, muốn nhận đủ 2 tỷ thì nợ gốc phải là 2.035.532.995 ₫ — và bạn trả lãi trên con số lớn hơn đó.",

  formula: {
    title: "Cách tính",
    body: [
      "Chiều thuận: số về tay = nợ gốc × (1 − tổng tỷ lệ trừ) − tổng khoản phí cố định. Với mặc định: 2.000.000.000 × 0,985 − 5.000.000 = 1.965.000.000 ₫. Nợ gốc vẫn là 2.000.000.000 ₫.",
      "Các khoản theo phần trăm được tính trên CÙNG số nợ gốc, không cộng dồn: 1% và 0,5% lấy đúng 1,5%, không phải 1 − 0,99 × 0,995 = 1,495%. Đây là QUY ƯỚC của công cụ này, được ghi ở cột “cơ sở tính”, không phải một quy định. Nếu bảng phí của bạn thực sự tính khoản sau trên phần còn lại, hãy chạy công cụ hai lần.",
      "Chiều nghịch là phép đảo: nợ gốc = (số cần nhận + tổng phí cố định) ÷ (1 − tổng tỷ lệ trừ). Phép CHIA đó là bước mà cách tính trong đầu bỏ qua — muốn nhận 2 tỷ với cùng cấu trúc phí thì nợ gốc là 2.035.532.995 ₫.",
      "Dòng “phải vay thêm bao nhiêu” được tính so với SỐ CẦN NHẬN, vì đó là con số bạn đang muốn bảo vệ. Ở mức trừ 10% nó là 11,11%; ở mức 50% là 100%; ở mức 75% là 300%.",
      "Khi các khoản phí cố định lớn hơn phần còn lại sau phần trăm, số về tay là số âm và công cụ hiển thị đúng như vậy chứ không làm tròn về 0 — một khoản nhỏ bị phí cố định ăn hết là trường hợp thật, và che nó lại là che mất vấn đề.",
      "Công cụ không tính APR. Một mức phí 1,5% cộng 5 triệu làm chi phí thực của khoản vay cao hơn lãi niêm yết, nhưng quy nó về một mức lãi suất tương đương cần cả kỳ hạn và dòng trả nợ — đó là việc của công cụ APR, và bạn sẽ nhập lại số ở đó.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Dùng công cụ này cho những trường hợp nào?",
        a: "Bất cứ khi nào có một chuỗi khoản trừ giữa con số trên giấy và con số về tay. Trường hợp mặc định của trang là khoản vay bị trừ phí khi giải ngân. Các trường hợp khác cùng phép tính: báo giá dịch vụ bị khấu trừ tại nguồn, nhận tiền từ nước ngoài qua phí chuyển và phí trung gian, hoa hồng trừ trên giá bán, hoặc rút tiền từ một sản phẩm đầu tư có phí bán. Công cụ không gắn với một loại thuế hay biểu phí cụ thể — mọi tỷ lệ và phí là con số bạn nhập.",
      },
      {
        q: "Nhận ít hơn thì có được trả nợ ít hơn không?",
        // This answer used to describe the FIRST version of the figure — "hai
        // thanh DÀI BẰNG NHAU" — which was replaced by the deduction bridge
        // the row actually specifies. Copy that describes a picture the page
        // no longer draws is a defect of its own.
        a: "Không. Đây là điểm quan trọng nhất của trang. Nếu hợp đồng ghi nợ gốc 2 tỷ và bạn bị trừ 35 triệu phí khi giải ngân, bạn nhận 1,965 tỷ nhưng vẫn trả lãi và trả gốc trên 2 tỷ. Vì vậy hình vẽ chỉ trừ dần ở phần TIỀN — mỗi thanh chia ra phần giữ lại và phần bị trừ — còn khoản NỢ được để riêng thành một dòng không đổi trong bảng và trong phần kết quả. Hai con số đó không phải một, và đó cũng là lý do phí làm chi phí thực của khoản vay cao hơn lãi niêm yết.",
      },
      {
        q: "Vì sao 10% lại cần bù 11,11%?",
        a: "Vì khoản trừ được tính trên con số LỚN HƠN. Để còn lại 90 sau khi mất 10%, bạn phải bắt đầu từ 100 — và 10 chia cho 90 là 11,11%. Cùng logic với việc một khoản lỗ 50% cần lãi 100% mới hồi vốn: phần trăm của hai mốc khác nhau thì không bù trừ nhau.",
      },
      {
        q: "Vì sao các khoản phần trăm không cộng dồn lên nhau?",
        a: "Vì công cụ chọn quy ước tính mọi khoản phần trăm trên cùng một cơ sở là số nợ gốc, và ghi rõ điều đó ở cột “cơ sở tính”. Hai dòng 1% và 0,5% vì vậy lấy đúng 1,5% của nợ gốc. Đây là một giả định về CÁCH TÍNH, không phải một phát biểu về việc biểu phí hay biểu thuế của bạn được viết thế nào — chúng tôi không biết điều đó. Nếu bảng phí của bạn tính khoản thứ hai trên phần còn lại sau khoản thứ nhất, hãy chạy công cụ hai lần và lấy kết quả lần trước làm số đầu vào lần sau.",
      },
      {
        q: "Có tính thuế thu nhập cá nhân lũy tiến không?",
        a: "Không. Công cụ chỉ làm việc với tỷ lệ cố định mà bạn nhập, nên nó phù hợp với những khoản khấu trừ tính theo một tỷ lệ phẳng. Thuế thu nhập từ tiền lương thì lũy tiến theo bậc và cần một bảng bậc thuế, nằm ngoài phạm vi này. Công cụ cũng không cho biết khoản nào bạn phải chịu hay ở mức bao nhiêu — hãy lấy tỷ lệ từ hợp đồng, thông báo hoặc hóa đơn của chính bạn.",
      },
    ],
  },
} as const;
