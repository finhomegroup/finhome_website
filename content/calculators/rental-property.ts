// Copy for /cong-cu/bat-dong-san-cho-thue/ — the rental property calculator.
//
// Original FinHome copy. The arithmetic is standard property analysis.
//
// The page's editorial job is to separate four figures that sound alike:
// gross yield, cap rate, cash-on-cash and DSCR. With the defaults (3 tỷ,
// trả trước 1,2 tỷ, phí mua 150 triệu, vay 9%/năm 240 tháng, thuê 15 triệu/
// tháng, trống 5%, chi phí 2 triệu/tháng) the tool returns: gross 6,00%,
// cap rate 4,90%, cash-on-cash −3,51%, DSCR 0,76 — a property that earns
// money while its owner loses 3.945.067 ₫ every month. Trả trước 2,4 tỷ đảo
// chiều: cash-on-cash +3,22%, DSCR 2,27, dòng tiền +82.219.731 ₫/năm. Mua
// bằng tiền tươi: cap rate vẫn 4,90%, cash-on-cash 4,67%.
//
// Tax: an individual letting property in Vietnam pays two turnover taxes on
// two different bases, which is why the form has two rate fields and the
// results have two rows. VAT at 5% applies to ALL revenue collected once the
// annual threshold is passed — a cliff. PIT at 5% applies only to the revenue
// ABOVE the deduction, which is subtracted first — a taper. At 1,08 tỷ of rent
// against a 1 tỷ threshold that is 54 triệu + 4 triệu = 58 triệu, where a
// single combined 10% rate would say 108 triệu. Neither is a profit tax: both
// are charged when the property loses money.
//
// THE THRESHOLD DEFAULT IS 1 TỶ/NĂM, per Nghị định 141/2026/NĐ-CP Article 1,
// which replaced the 500 triệu of Nghị định 68 Articles 3/4, in force
// 01/01/2026; the 12/06/2026 rental guidance covers both taxes below that
// revenue. The earlier 500 triệu prefill (Luật 149/2025/QH15) was already
// superseded, and an independent review rejected keeping it to preserve old
// outputs: a qualifying simple rental at 900 triệu of revenue was being shown
// 65 triệu of tax it does not owe. Threshold and both rates remain inputs
// because all of them have been revised (100 → 200 → 500 → 1.000 triệu), and
// the copy tells the reader to check rather than trust the prefill.

export const RENTAL_PROPERTY = {
  slug: "/cong-cu/bat-dong-san-cho-thue",

  pageTitle: "Bất động sản cho thuê: có ra tiền không?",
  metaTitle: "Tính bất động sản cho thuê — Dòng tiền, cap rate và DSCR",
  metaDescription:
    "Tính dòng tiền hằng tháng, tỷ suất gộp, cap rate, tỷ suất trên vốn tự có và hệ số trả nợ của một căn cho thuê, kèm thuế cho thuê tại Việt Nam. Công cụ miễn phí của FinHome.",

  lede:
    "Bốn con số cùng được gọi là “tỷ suất” nhưng trả lời bốn câu hỏi khác nhau, và lẫn chúng với nhau là cách một căn hộ lỗ tiền mỗi tháng được mô tả thành khoản đầu tư 6%. Công cụ tính cả bốn và nói rõ mỗi con số nghĩa là gì.",

  form: {
    purchaseGroup: "Mua nhà",
    priceLabel: "Giá mua",
    priceUnit: "₫",
    priceHelp: "Giá trả cho căn nhà, chưa gồm các khoản phí mua.",
    priceInvalid: "Vui lòng nhập giá mua lớn hơn 0.",
    defaultPrice: "3.000.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp:
      "Tiền mặt bạn bỏ ra. Phần còn lại được coi là đi vay. Để bằng giá mua nếu mua bằng tiền tươi.",
    downInvalid: "Tiền trả trước phải từ 0 và không vượt giá mua.",
    defaultDown: "1.200.000.000",

    purchaseCostsLabel: "Chi phí mua một lần",
    purchaseCostsUnit: "₫",
    purchaseCostsHelp:
      "Thuế, phí công chứng, phí sang tên, hoa hồng và tiền hoàn thiện nội thất. Được tính vào vốn tự có khi đo tỷ suất.",
    purchaseCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPurchaseCosts: "150.000.000",

    loanGroup: "Khoản vay",
    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi sau ưu đãi. Không dùng nếu bạn mua bằng tiền tươi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "9",

    termLabel: "Kỳ hạn",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    rentGroup: "Cho thuê",
    rentLabel: "Tiền thuê mỗi tháng",
    rentUnit: "₫",
    rentHelp: "Tiền thuê khi có khách, trước thuế.",
    rentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRent: "15.000.000",

    vacancyLabel: "Tỷ lệ trống",
    vacancyUnit: "% thời gian",
    vacancyHelp:
      "Phần thời gian trong năm căn nhà không có khách. Một tháng trống mỗi năm là khoảng 8%.",
    vacancyInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultVacancy: "5",

    expensesLabel: "Chi phí vận hành mỗi tháng",
    expensesUnit: "₫",
    expensesHelp:
      "Phí quản lý, quỹ bảo trì, sửa chữa, bảo hiểm, phí môi giới tìm khách chia đều. Không tính khoản trả nợ.",
    expensesInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultExpenses: "2.000.000",

    taxGroup: "Thuế cho thuê",
    vatRateLabel: "Thuế GTGT",
    vatRateUnit: "%",
    vatRateHelp:
      "Tính trên TOÀN BỘ doanh thu thu được, ngay khi doanh thu vượt ngưỡng bên dưới.",
    vatRateInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultVatRate: "5",

    pitRateLabel: "Thuế TNCN",
    pitRateUnit: "%",
    pitRateHelp:
      "Chỉ tính trên PHẦN doanh thu vượt ngưỡng, vì ngưỡng được trừ ra trước khi áp thuế suất.",
    pitRateInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultPitRate: "5",

    // TWO THRESHOLDS, because these are two taxes. One shared figure was the
    // same conflation as one combined rate, one level down — see the model's
    // own header. Both defaults stay at the shipped 500 triệu; the PIT field
    // carries the 1 tỷ evidence and tells the reader to enter what applies.
    thresholdLabel: "Ngưỡng chịu thuế GTGT mỗi năm",
    thresholdUnit: "₫",
    thresholdHelp:
      "Doanh thu từ mức này trở xuống thì không phải nộp thuế GTGT. Điền sẵn 1 tỷ đồng theo Nghị định 141/2026/NĐ-CP (Điều 1 nâng ngưỡng của Nghị định 68 từ 500 triệu lên 1 tỷ, hiệu lực 01/01/2026). Mức này đã đổi nhiều lần — hãy tra con số hiện hành và nhập lại nếu cần.",
    thresholdInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultThreshold: "1.000.000.000",

    pitThresholdLabel: "Mức doanh thu được trừ trước thuế TNCN mỗi năm",
    pitThresholdUnit: "₫",
    pitThresholdHelp:
      "Phần doanh thu được trừ ra trước khi tính thuế TNCN. Ô này TÁCH RIÊNG khỏi ngưỡng GTGT ở trên vì đây là hai loại thuế với hai căn cứ khác nhau — hôm nay cả hai đều là 1 tỷ, nhưng không có gì bảo đảm chúng luôn bằng nhau. Điền sẵn 1 tỷ đồng theo Nghị định 141/2026/NĐ-CP, và hướng dẫn ngày 12/06/2026 về cho thuê nhà áp cho cả hai loại thuế dưới mức doanh thu này. MỘT LƯU Ý QUAN TRỌNG: theo văn bản trả lời của Bộ Tài chính ngày 14/07/2026, cho thuê nhà không phải lưu trú thuộc thu nhập KINH DOANH theo Luật 109/2025/QH15 và mức được trừ tính CHUNG cho các hợp đồng cho thuê của cùng một người — nên nếu bạn cho thuê nhiều nơi, phần được trừ cho riêng căn này nhỏ hơn 1 tỷ và bạn nên nhập phần được phân bổ. Công cụ không xác định bạn thuộc diện nào; xem phần nguồn ở cuối trang.",
    pitThresholdInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPitThreshold: "1.000.000.000",

    reliefLegend: "Bạn có thuộc diện được giảm 30% thuế TNCN không?",
    reliefHelp:
      "Nghị quyết 43/2026/QH16 (hiệu lực 24/08/2026) giảm 30% số thuế TNCN PHẢI NỘP của cá nhân cư trú có thu nhập từ kinh doanh cho năm 2026 và 2027, với điều kiện tổng doanh thu trong năm không quá 10 tỷ đồng. Đây là điều kiện tính trên TOÀN BỘ doanh thu kinh doanh của bạn, không phải doanh thu của riêng căn nhà này — nên công cụ không thể tự biết và mặc định là “Không”. Nghị quyết này KHÔNG giảm thuế GTGT. Chỉ chọn “Có” nếu bạn đã tự xác nhận đủ điều kiện; kết quả khi đó là một phép tính theo khai báo của bạn, không phải xác nhận bạn được giảm.",
    reliefNo: "Không (mặc định)",
    reliefYes: "Có — tôi tự xác nhận đủ điều kiện",
    defaultRelief: "no",

    resultTitle: "Dòng tiền của bạn",
    cashFlowMonthLabel: "Dòng tiền mỗi tháng",
    cashFlowYearLabel: "Dòng tiền mỗi năm",
    cashOnCashLabel: "Tỷ suất trên vốn tự có",

    yieldTitle: "Bốn thước đo",
    grossYieldLabel: "Tỷ suất gộp (thuê ÷ giá mua)",
    capRateLabel: "Cap rate (lợi nhuận vận hành ÷ giá mua)",
    cashOnCashRepeatLabel: "Tỷ suất trên vốn tự có (dòng tiền ÷ vốn bỏ ra)",
    dscrLabel: "Hệ số trả nợ DSCR",

    detailTitle: "Chi tiết theo năm",
    grossRentLabel: "Tiền thuê cả năm nếu luôn có khách",
    vacancyLossLabel: "Mất do trống",
    effectiveRentLabel: "Tiền thuê thực thu",
    vatLabel: "Thuế GTGT (trên toàn bộ doanh thu)",
    pitLabel: "Thuế TNCN trước giảm (trên phần vượt mức được trừ)",
    pitReliefLabel: "Giảm 30% thuế TNCN theo khai báo của bạn",
    pitAfterReliefLabel: "Thuế TNCN sau giảm",
    taxLabel: "Tổng thuế cho thuê",
    taxBeforeReliefLabel: "Tổng thuế cho thuê trước giảm",
    expensesResultLabel: "Chi phí vận hành",
    noiLabel: "Lợi nhuận vận hành",
    debtServiceLabel: "Trả nợ cả năm",
    monthlyPaymentLabel: "Trả nợ mỗi tháng",
    loanAmountLabel: "Số tiền vay",
    cashInvestedLabel: "Vốn tự có đã bỏ ra",
    taxableLabel: "Có phải nộp thuế GTGT",
    pitAppliesLabel: "Có phải nộp thuế TNCN",
    yes: "Có",
    no: "Không",
  },

  // ORIGINAL ROW 15's scenario view: "kịch bản trống nhà / chi phí bảo trì".
  // Named by the assumption each one changed, with no likelihood attached to
  // any of them — the rule `rent-vs-buy.ts`'s scenario band established.
  scenarios: {
    title: "Nếu trống nhiều hơn, hoặc chi phí cao hơn",
    intro:
      "Ba kịch bản dưới đây được tính lại từ ĐÚNG các con số bạn nhập, chỉ thay một hoặc hai giả định. Không có kịch bản nào là dự báo và không con số nào ở đây kèm xác suất: mục đích là cho thấy câu trả lời của bạn có đổi chiều khi giả định đổi hay không.",
    baseName: "Như bạn nhập",
    vacancyName: "Trống thêm 1 tháng mỗi năm",
    expensesName: "Chi phí vận hành cao hơn 50%",
    bothName: "Cả hai điều trên",
    scenarioColumn: "Kịch bản",
    assumptionColumn: "Giả định",
    cashFlowColumn: "Dòng tiền mỗi tháng",
    deltaColumn: "So với như bạn nhập",
    cashOnCashColumn: "Tỷ suất vốn tự có",
    dscrColumn: "DSCR",
    // `{vacancy}` and `{expenses}` substituted, so each row states the two
    // figures it actually ran on rather than describing them.
    assumptionFormat: "trống {vacancy}, chi phí {expenses}/tháng",
    caption: "Dòng tiền theo từng kịch bản",
    hint:
      "Cột “so với như bạn nhập” là hiệu số dòng tiền mỗi tháng, nên nó âm khi kịch bản xấu hơn. Bốn dòng dùng cùng một giá mua, cùng khoản vay và cùng cách tính thuế; chỉ tỷ lệ trống và chi phí vận hành thay đổi.",
    flipsNegativeNotice:
      "Dòng tiền của bạn đang dương nhưng có kịch bản đưa nó xuống âm. Đây là điều đáng ghi lại trước khi mua: một tháng trống thêm hoặc một năm phải sửa chữa nhiều là chuyện thường, và khi đó khoản bù mỗi tháng lấy từ thu nhập khác của bạn.",
    alreadyNegativeNotice:
      "Dòng tiền đã âm ngay ở các con số bạn nhập, nên mọi kịch bản dưới đây chỉ âm hơn. Con số cần biết là bạn chịu được khoản bù đó trong bao nhiêu tháng.",
    unavailableNotice:
      "Chưa so được các kịch bản: hãy kiểm tra lại các ô còn báo lỗi ở trên.",
  },

  // ORIGINAL ROW 15's visual: "waterfall tiền thuê → chi phí → trả nợ".
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Tiền thuê một năm đi những đâu",
    axis: "Số tiền trong một năm ({unit})",
    assumptions: [
      "Mọi con số do bạn nhập: giá mua, khoản vay, tiền thuê, tỷ lệ trống, chi phí vận hành và các tham số thuế.",
      "Thứ tự các bước là thứ tự tính: trống nhà trừ trên tiền thuê đủ 12 tháng, thuế tính trên tiền thuê THỰC THU, chi phí vận hành trừ tiếp, và khoản trả nợ trả sau cùng từ lợi nhuận vận hành.",
      // CORRECTED. This said the view "không tính phần gốc bạn trả dần",
      // which is wrong: the debt step is the full instalment and the
      // principal inside it IS money leaving the reader. What the view does
      // not do is add the equity that principal builds, or any house-price
      // growth, back as a return.
      "Một năm, và đây là DÒNG TIỀN chứ không phải tổng lợi nhuận. Khoản trả nợ gồm cả gốc, và tiền gốc đó thật sự rời khỏi ví bạn nên nó nằm trong bước trả nợ; nhưng phần vốn chủ sở hữu mà nó tích lũy lại, cùng với giả định giá nhà tăng, KHÔNG được cộng vào đây.",
      "Thuế vẽ thành MỘT bước nhưng gồm hai loại với hai căn cứ khác nhau; bảng bên dưới tách riêng GTGT và TNCN.",
    ],
    tableCaption: "Sổ tiền thuê một năm",
    itemColumn: "Khoản",
    amountColumn: "Số tiền",
    unavailableReason:
      "Chưa vẽ được: cần tiền thuê mỗi tháng lớn hơn 0 và các ô còn lại hợp lệ.",
    unavailableRecovery:
      "Hãy nhập tiền thuê mỗi tháng và kiểm tra lại giá mua, khoản vay và các tham số thuế.",
    grossBar: "Tiền thuê đủ 12 tháng",
    netBar: "Dòng tiền còn lại",
    // The closing bar when the year is short. Its own name and its own
    // legend entry, because it is NOT money the reader has.
    deficitBar: "Phải bù thêm từ thu nhập khác",
    deficitSegment: "Phần phải bù thêm",
    remainingSegment: "Còn lại",
    deductedSegment: "Bị trừ ở bước này",
    coveredSegment: "Phần tiền thuê trả được",
    uncoveredSegment: "Phần tiền thuê không trả nổi",
    cashSegment: "Tiền còn về tay bạn",
    stepFormat: "− {charge} {amount}",
    stepRemainingFormat: "còn {remaining}",
    stepShortfallFormat: "thiếu {shortfall}",
    vacancyStep: "Mất do trống",
    taxStep: "Thuế cho thuê",
    expensesStep: "Chi phí vận hành",
    debtStep: "Trả nợ vay",
    vatRow: "trong đó: thuế GTGT (trên toàn bộ doanh thu)",
    // AFTER any declared relief, so the two "trong đó" rows add up to the tax
    // step above them.
    pitRow: "trong đó: thuế TNCN phải nộp (trên phần vượt mức được trừ)",
    pitReliefRow: "trong đó: đã giảm 30% thuế TNCN theo khai báo của bạn",
    noiRow: "Lợi nhuận vận hành (trước khi trả nợ)",
    shortfallRow: "Thiếu so với khoản trả nợ",
    // No loan: there is no instalment to be short against, so the row names
    // what the rent actually failed to cover.
    shortfallOperatingRow: "Thiếu so với thuế và chi phí vận hành",
    summary:
      "Tiền thuê đủ 12 tháng là {gross}; sau khi trừ {deducted} gồm trống nhà, thuế, chi phí vận hành và khoản trả nợ, còn {cash}.",
    shortfallNote:
      "Tiền thuê KHÔNG đủ trả nợ. Sau thuế và chi phí, căn nhà còn {available} cho cả năm, còn khoản trả nợ là {debt} — thiếu {shortfall}, và phần thiếu này lấy từ thu nhập khác của bạn. Ba con số đó khớp nhau, và cột cuối trong hình vẽ đúng phần phải bù thêm theo cùng thước đo với các cột trên, nên bạn so được độ dài của nó với tiền thuê cả năm.",
    // Only when NEITHER tax applies. A plan over the PIT deduction and under
    // the VAT gate does pay tax, and saying otherwise was wrong.
    noTaxNote:
      "Doanh thu chưa vượt ngưỡng của cả hai loại thuế, nên chưa có bước thuế nào trong hình.",
    shortfallOperatingNote:
      "Tiền thuê KHÔNG đủ cho thuế và chi phí vận hành — và ở đây bạn KHÔNG vay, nên khoản thiếu này không liên quan gì đến nợ. Cả năm thu về {collected}, riêng thuế và chi phí vận hành đã là {costs}, nên thiếu {shortfall} phải bù từ thu nhập khác. Cột cuối trong hình vẽ đúng phần phải bù thêm theo cùng thước đo với các cột trên.",
    noDebtNote: "Bạn mua bằng tiền tươi nên không có bước trả nợ.",
    chargeColumn: "Khoản",
    remainingColumn: "Còn lại sau khoản này",
    tableHint:
      "Đọc từ trên xuống: mỗi dòng trừ vào phần còn lại của dòng trên. Cột “số tiền” âm là khoản bị trừ, và cột “còn lại” âm nghĩa là tiền thuê không đủ cho khoản đó — phần âm chính là số phải bù từ thu nhập khác. Hai dòng “trong đó” tách tổng thuế thành hai loại có căn cứ khác nhau, nên đừng cộng chúng vào các dòng trừ một lần nữa.",
  },

  // The primary documents behind the prefilled tax parameters, as links. Row
  // 15's tax review is a release gate (docs §6) and this does not close it —
  // it gives the reader, and the professional who will review this page, the
  // documents the figures came from.
  sources: {
    title: "Nguồn cho các tham số thuế điền sẵn",
    intro:
      "Các văn bản dưới đây là nguồn của những con số điền sẵn trong phần “Thuế cho thuê”. Chúng được đọc trong phần rà soát nguồn của dự án, không phải do trang tự tra lại tại thời điểm bạn đọc. Đây KHÔNG phải danh sách đầy đủ, không phải tư vấn thuế, và phần thuế của trang này vẫn đang chờ rà soát của người có chuyên môn về thuế. Hãy đối chiếu bản công bố chính thức và hỏi cơ quan thuế cho trường hợp cụ thể của bạn.",
    items: [
      {
        url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-141-2026-nd-cp-nang-nguong-doanh-thu-khong-phai-chiu-thue-len-1-ty-dong-119260504154326455.htm",
        label:
          "Toàn văn Nghị định 141/2026/NĐ-CP — nâng ngưỡng doanh thu không phải chịu thuế lên 1 tỷ đồng",
        note: "Nguồn của mức 1 tỷ điền sẵn ở CẢ HAI ô ngưỡng: Điều 1 thay con số 500 triệu trong Nghị định 68 (các Điều 3, 4 và những điều liên quan) bằng 1 tỷ đồng, hiệu lực 01/01/2026. Đây là văn bản làm cho mức 500 triệu trước đây thành mức cũ.",
      },
      {
        url: "https://baochinhphu.vn/doanh-thu-cho-thue-nha-duoi-1-ty-dong-van-phai-khai-bao-thue-10226061216052641.htm",
        label:
          "Doanh thu cho thuê nhà dưới 1 tỷ đồng vẫn phải khai báo thuế (12/06/2026)",
        note: "Hướng dẫn về cho thuê nhà ở mức doanh thu dưới 1 tỷ, áp cho cả thuế GTGT và thuế TNCN. Lưu ý điều nó nói thêm: dưới ngưỡng thì không phải NỘP, nhưng nghĩa vụ KHAI BÁO vẫn còn — công cụ này chỉ tính tiền thuế, không phải thủ tục khai báo.",
      },
      {
        url: "https://nif.mof.gov.vn/hoidapcstc/home/cthoidap/162069",
        label: "Bộ Tài chính — hỏi đáp chính sách tài chính số 162069 (14/07/2026)",
        note: "Câu trả lời của cơ quan thuế xếp cho thuê nhà không phải lưu trú vào thu nhập KINH DOANH theo Điều 7 Luật 109/2025/QH15, và nhắc lại mức doanh thu được trừ 1 tỷ đồng/năm tính chung cho các hợp đồng cho thuê của một người. Đây là căn cứ để cân nhắc con số nhập vào ô mức được trừ trước thuế TNCN.",
      },
      {
        url: "https://vanban.chinhphu.vn/?docid=216495&pageid=27160",
        label: "Luật Thuế thu nhập cá nhân 109/2025/QH15 — trang công báo",
        note: "Hiệu lực từ 01/07/2026. Trang này không kiểm tra toàn văn luật hay các văn bản sửa đổi về sau.",
      },
      {
        url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-43-2026-qh16-ve-giam-thue-thu-nhap-ca-nhan-thue-thu-nhap-doanh-nghiep-119260830184758301.htm",
        label: "Toàn văn Nghị quyết 43/2026/QH16 về giảm thuế TNCN và thuế TNDN",
        note: "Điều 1(1) và Điều 2: giảm 30% số thuế TNCN phải nộp trên thu nhập từ kinh doanh của cá nhân cư trú cho năm 2026 và 2027, với điều kiện doanh thu trong năm không quá 10 tỷ đồng; hiệu lực 24/08/2026. Đây KHÔNG phải giảm thuế GTGT.",
      },
      {
        url: "https://xaydungchinhsach.chinhphu.vn/du-thao-nghi-dinh-ve-giam-thue-thu-nhap-ca-nhan-thue-thu-nhap-doanh-nghiep-119260909165544231.htm",
        label: "DỰ THẢO nghị định hướng dẫn (09/09/2026) — chưa phải quy định đang áp dụng",
        note: "Đưa vào đây để bạn biết phần hướng dẫn thi hành còn đang là dự thảo tại thời điểm rà soát. Các chi tiết trong dự thảo KHÔNG được dùng như quy định hiện hành, và công cụ này không áp dụng nội dung nào của nó.",
      },
    ],
  },

  // NARROWED. This used to end "Căn nhà có lãi; người mua thì không", which
  // is a claim about the whole investment from a cash-flow figure. The
  // distinction is between the property's OPERATING cash and the owner's cash
  // AFTER debt service; a negative monthly figure says the owner tops it up
  // each month, not that the investment loses money overall.
  fourNumbersNotice:
    "Với các con số mặc định, căn hộ này có tỷ suất gộp 6,00% và cap rate 4,90% — nghe như một khoản đầu tư ổn. Nhưng tỷ suất trên vốn tự có là −3,51% và DSCR là 0,76: tiền thuê chỉ bù được khoảng ba phần tư khoản trả nợ, nên mỗi tháng bạn phải bỏ thêm 3.945.067 ₫ từ thu nhập khác. Tiền thuê ĐỦ để vận hành căn nhà, nhưng KHÔNG đủ để trả nợ — đó là hai câu khác nhau, và dòng tiền âm ở đây không có nghĩa là toàn bộ khoản đầu tư lỗ, vì trang này không cộng phần gốc bạn trả dần thành vốn chủ sở hữu và không giả định giá nhà tăng. Đây là điều tỷ suất gộp không bao giờ cho bạn thấy, và là lý do cần đọc cả bốn dòng.",

  taxVintageNotice:
    "Mức thuế trên đang tính theo ngưỡng 1.000.000.000 ₫ doanh thu mỗi năm cho CẢ HAI loại thuế: thuế GTGT 5% trên toàn bộ doanh thu khi vượt ngưỡng, và thuế TNCN 5% chỉ trên phần vượt mức được trừ. Con số 1 tỷ theo Nghị định 141/2026/NĐ-CP — Điều 1 nâng ngưỡng của Nghị định 68 từ 500 triệu lên 1 tỷ, hiệu lực 01/01/2026 — và hướng dẫn ngày 12/06/2026 về cho thuê nhà áp cho cả hai loại thuế dưới mức doanh thu này. Hai con số vẫn nằm ở hai ô riêng vì đây là hai loại thuế với hai căn cứ khác nhau: hôm nay cùng là 1 tỷ, nhưng mức được trừ của thuế TNCN còn tính CHUNG cho các hợp đồng cho thuê của một người (văn bản trả lời của Bộ Tài chính ngày 14/07/2026, xếp cho thuê nhà không phải lưu trú vào thu nhập kinh doanh theo Luật 109/2025/QH15), nên nếu bạn cho thuê nhiều nơi thì phần được trừ cho riêng căn này nhỏ hơn 1 tỷ. Ngưỡng đã đổi nhiều lần — từ 100 lên 200, lên 500 triệu rồi lên 1 tỷ — nên nếu bạn đọc trang này về sau, hãy tra lại con số hiện hành. Ngoài ra Nghị quyết 43/2026/QH16 (hiệu lực 24/08/2026) giảm 30% thuế TNCN phải nộp của cá nhân cư trú có thu nhập kinh doanh trong năm 2026–2027 nếu doanh thu trong năm không quá 10 tỷ; nghị quyết này không giảm thuế GTGT, và công cụ chỉ áp dụng mức giảm khi bạn tự chọn ở phần thuế. Trang này rà soát ở mức văn bản công bố, không xác định trường hợp cụ thể của bạn và không phải xác nhận nghĩa vụ thuế — xem phần nguồn ở cuối trang.",

  formula: {
    title: "Bốn con số nghĩa là gì",
    body: [
      "Tỷ suất gộp = tiền thuê cả năm ÷ giá mua. Bỏ qua mọi chi phí, thuế và khoản vay. Chỉ dùng để lọc nhanh hàng chục tin bán nhà, không dùng để ra quyết định.",
      "Cap rate = lợi nhuận vận hành ÷ giá mua, trong đó lợi nhuận vận hành = tiền thuê thực thu − thuế cho thuê − chi phí vận hành. Cap rate KHÔNG phụ thuộc vào cách bạn thanh toán, nên nó là con số để so hai căn nhà với nhau. Với mặc định, 6,00% tụt xuống 4,90% khi tính đủ chi phí vận hành — ở mức thuê này doanh thu chưa vượt ngưỡng nên chưa phải nộp thuế; vượt ngưỡng thì cap rate còn tụt thêm.",
      "Tỷ suất trên vốn tự có = dòng tiền cả năm ÷ vốn tự có đã bỏ ra, trong đó dòng tiền = lợi nhuận vận hành − khoản trả nợ, và vốn tự có = tiền trả trước + chi phí mua một lần. Đây là con số của BẠN. Vay nợ có thể đẩy nó lên cao hơn cap rate, hoặc kéo nó xuống âm trong khi cap rate vẫn dương — đúng trường hợp mặc định ở đây.",
      "DSCR = lợi nhuận vận hành ÷ khoản trả nợ cả năm. Dưới 1 nghĩa là tiền thuê không đủ trả nợ và phần thiếu lấy từ thu nhập khác của bạn. Ngân hàng thường muốn thấy DSCR từ 1,2 trở lên với bất động sản cho thuê. DSCR bằng 1 xảy ra đúng lúc dòng tiền bằng 0.",
      "Thuế cho thuê được tính trên DOANH THU, không trên lợi nhuận, nên vẫn bị thu khi căn nhà lỗ. Đây là hai loại thuế với hai căn cứ khác nhau, không phải một mức 10% gộp. Thuế GTGT 5% tính trên TOÀN BỘ tiền thuê thực thu, ngay khi doanh thu vượt ngưỡng — đây là bậc thang dựng đứng. Thuế TNCN 5% chỉ tính trên PHẦN vượt mức được trừ, vì mức đó trừ ra trước — đây là phần tăng dần. Với ngưỡng 1 tỷ điền sẵn: doanh thu 900 triệu không phải nộp loại nào; doanh thu 1,08 tỷ thì GTGT 54 triệu cộng TNCN 4 triệu, tổng 58 triệu — không phải 108 triệu như cách tính 10% trên toàn bộ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Dòng tiền âm có nghĩa là không nên mua?",
        a: "Không tự động, nhưng bạn phải biết mình đang trả tiền cho cái gì. Dòng tiền âm nghĩa là bạn đang bù tiền mỗi tháng để nắm giữ tài sản, và lợi ích kỳ vọng nằm ở việc giá nhà tăng cộng với phần gốc bạn trả dần. Cả hai đều không chắc chắn, còn khoản bù mỗi tháng thì chắc chắn. Hãy tính xem bạn chịu được dòng tiền âm đó bao nhiêu tháng nếu mất việc hoặc căn nhà trống nửa năm.",
      },
      {
        q: "Tỷ lệ trống nên nhập bao nhiêu?",
        a: "Đừng nhập 0. Mỗi lần đổi khách thường mất từ hai tuần đến hai tháng để tìm người mới và sửa sang, và khách thuê căn hộ ở Việt Nam thường chỉ ở 1–2 năm. Một tháng trống mỗi năm tương đương khoảng 8%; hai tháng là 17%. Nếu căn nhà ở vị trí khó cho thuê hoặc giá thuê cao so với khu vực, hãy nhập mức cao hơn.",
      },
      {
        q: "Chi phí vận hành gồm những gì?",
        a: "Phí quản lý chung cư, quỹ bảo trì, bảo hiểm tài sản, sửa chữa và thay thế thiết bị, phí môi giới mỗi lần tìm khách chia đều theo tháng, và tiền điện nước phần chung nếu bạn chịu. Một quy tắc thực dụng: dự trù 5–10% tiền thuê cho sửa chữa và thay thế, ngay cả những năm không sửa gì — vì máy lạnh, bình nóng lạnh và nội thất đều có tuổi thọ.",
      },
      {
        q: "Vì sao mua bằng tiền tươi lại có tỷ suất thấp hơn cap rate một chút?",
        a: "Vì cap rate chia cho giá mua, còn tỷ suất trên vốn tự có chia cho giá mua CỘNG chi phí mua một lần. Với mặc định, cap rate 4,90% trên 3 tỷ trở thành 4,67% trên 3,15 tỷ. Chi phí mua là tiền thật đã bỏ ra, nên nó phải nằm ở mẫu số — nhiều người bỏ qua khoản này và vì thế báo cáo tỷ suất cao hơn thực tế.",
      },
      {
        q: "Ngưỡng miễn thuế cho thuê hiện nay là bao nhiêu?",
        a: "Công cụ điền sẵn 1 tỷ đồng doanh thu mỗi năm cho cả hai loại thuế, theo Nghị định 141/2026/NĐ-CP: Điều 1 nâng ngưỡng doanh thu không phải chịu thuế của Nghị định 68 từ 500 triệu lên 1 tỷ, hiệu lực 01/01/2026, và hướng dẫn ngày 12/06/2026 về cho thuê nhà áp cho cả thuế GTGT và thuế TNCN dưới mức doanh thu này. Mức này đã đổi nhiều lần — từ 100 lên 200, lên 500 triệu rồi lên 1 tỷ — và trang này là trang tĩnh nên không thể biết mức hiện hành ở thời điểm bạn đọc: hãy tra quy định mới nhất hoặc hỏi cơ quan thuế rồi nhập lại. Ngưỡng ảnh hưởng lớn và không đối xứng: đúng quanh ngưỡng, tăng tiền thuê một chút có thể làm bạn mất nhiều hơn được, vì thuế GTGT nhảy vào trên toàn bộ doanh thu chứ không chỉ phần vượt. Riêng thuế TNCN thì chỉ tính trên phần vượt mức được trừ, nên nó tăng dần chứ không nhảy bậc.",
      },
      {
        q: "Vì sao có chỗ nói ngưỡng là 500 triệu?",
        a: "Vì 500 triệu là mức CŨ. Nghị định 141/2026/NĐ-CP, Điều 1, thay con số 500 triệu trong Nghị định 68 bằng 1 tỷ đồng, hiệu lực 01/01/2026 — nên các bài viết cũ hơn mốc đó vẫn còn nói 500 triệu, và công cụ này trước đây cũng điền sẵn như vậy. Hiện cả hai ô đều điền sẵn 1 tỷ. Vẫn có hai lý do để bạn tự nhập lại. Thứ nhất, mức được trừ của thuế TNCN tính CHUNG cho các hợp đồng cho thuê của cùng một người, theo văn bản trả lời của Bộ Tài chính ngày 14/07/2026 xếp cho thuê nhà không phải lưu trú vào thu nhập kinh doanh theo Luật 109/2025/QH15 — nếu bạn cho thuê hai căn thì mức được trừ không nhân đôi, và phần phân bổ cho riêng căn này nhỏ hơn 1 tỷ. Thứ hai, quy định có thể thay đổi sau thời điểm trang này được rà soát. Công cụ không xác định trường hợp của bạn; hãy xem phần nguồn ở cuối trang và đối chiếu với cơ quan thuế.",
      },
      {
        q: "Giảm 30% thuế theo Nghị quyết 43 áp dụng thế nào ở đây?",
        a: "Nghị quyết 43/2026/QH16 (hiệu lực 24/08/2026) giảm 30% số thuế TNCN PHẢI NỘP trên thu nhập từ kinh doanh của cá nhân cư trú, cho năm 2026 và 2027, với điều kiện tổng doanh thu trong năm không quá 10 tỷ đồng. Ba điều cần chú ý. Thứ nhất, nó chỉ giảm thuế TNCN — thuế GTGT không đổi, nên lấy 30% trên tổng hai loại thuế là sai. Ví dụ doanh thu 1,08 tỷ với mức được trừ 1 tỷ: GTGT 54 triệu và TNCN 4 triệu, tổng 58 triệu; sau giảm 30% phần TNCN thì thành 54 + 2,8 = 56,8 triệu, không phải 58 × 70% = 40,6 triệu. Thứ hai, điều kiện 10 tỷ tính trên toàn bộ doanh thu kinh doanh trong năm của bạn, không phải doanh thu của riêng căn nhà này — nên doanh thu một căn không chứng minh được bạn đủ điều kiện. Thứ ba, hướng dẫn thi hành ở thời điểm rà soát vẫn đang là dự thảo. Vì vậy công cụ mặc định KHÔNG áp dụng mức giảm, và chỉ tính khi bạn tự chọn ở phần thuế.",
      },
      {
        q: "Ba kịch bản trống nhà và chi phí để làm gì?",
        a: "Để trả lời câu hỏi thật: dòng tiền của bạn có đổi CHIỀU khi một giả định đổi hay không. Bảng kịch bản tính lại từ đúng các con số bạn nhập, chỉ thay tỷ lệ trống (thêm một tháng trống mỗi năm, khoảng 8,33 điểm phần trăm) và chi phí vận hành (cao hơn 50%), rồi đặt bốn dòng tiền cạnh nhau. Không kịch bản nào là dự báo và không con số nào kèm xác suất — chúng chỉ nói “nếu giả định này khác đi thì kết quả ra sao”. Nếu một kịch bản đưa dòng tiền từ dương xuống âm, đó là con số nên ghi lại trước khi mua, vì một tháng trống thêm hoặc một năm sửa chữa nhiều là chuyện bình thường.",
      },
      {
        q: "Công cụ có tính giá nhà tăng không?",
        a: "Không. Toàn bộ kết quả ở đây là dòng tiền và tỷ suất vận hành trong một năm, không có giả định nào về giá nhà. Đó là cố ý: giá nhà tăng là phần không kiểm soát được, còn dòng tiền là phần bạn phải sống với mỗi tháng. Nếu muốn xem tổng lợi nhuận gồm cả tăng giá, hãy dùng công cụ thuê hay mua nhà của FinHome, nơi có ô nhập mức tăng giá.",
      },
    ],
  },
} as const;
