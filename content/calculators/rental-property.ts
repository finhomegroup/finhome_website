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
// ABOVE the threshold, which is deducted first — a taper. At 900 triệu of rent
// against a 500 triệu threshold that is 45 triệu + 20 triệu = 65 triệu, where
// a single combined 10% rate would say 90 triệu. Neither is a profit tax: both
// are charged when the property loses money.
//
// The defaults follow the 500 triệu/năm threshold of Luật 149/2025/QH15 (GTGT,
// hiệu lực 01/01/2026) and Luật Thuế TNCN 109/2025/QH15 (hiệu lực 01/07/2026).
// Threshold and both rates are inputs because all three have been revised
// (100 → 200 → 500 triệu); the copy tells the reader to check the current
// figures rather than trusting the prefill.

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

    thresholdLabel: "Ngưỡng miễn thuế mỗi năm",
    thresholdUnit: "₫",
    thresholdHelp:
      "Doanh thu từ mức này trở xuống thì không phải nộp thuế cho thuê. Điền sẵn theo mức 500 triệu của Luật 149/2025/QH15 và Luật Thuế TNCN 109/2025/QH15. Mức này đã đổi nhiều lần — hãy tra con số hiện hành và nhập lại.",
    thresholdInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultThreshold: "500.000.000",

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
    pitLabel: "Thuế TNCN (trên phần vượt ngưỡng)",
    taxLabel: "Tổng thuế cho thuê",
    expensesResultLabel: "Chi phí vận hành",
    noiLabel: "Lợi nhuận vận hành",
    debtServiceLabel: "Trả nợ cả năm",
    monthlyPaymentLabel: "Trả nợ mỗi tháng",
    loanAmountLabel: "Số tiền vay",
    cashInvestedLabel: "Vốn tự có đã bỏ ra",
    taxableLabel: "Có phải nộp thuế cho thuê",
    yes: "Có",
    no: "Không",
  },

  fourNumbersNotice:
    "Với các con số mặc định, căn hộ này có tỷ suất gộp 6,00% và cap rate 4,90% — nghe như một khoản đầu tư ổn. Nhưng tỷ suất trên vốn tự có là −3,51% và DSCR là 0,76: tiền thuê chỉ bù được khoảng ba phần tư khoản trả nợ, nên mỗi tháng bạn phải bỏ thêm 3.945.067 ₫ từ thu nhập khác. Căn nhà có lãi; người mua thì không. Đây là điều mà tỷ suất gộp không bao giờ cho bạn thấy, và là lý do cần đọc cả bốn dòng.",

  taxVintageNotice:
    "Mức thuế trên đang tính theo ngưỡng 500.000.000 ₫ doanh thu mỗi năm: thuế GTGT 5% trên toàn bộ doanh thu khi vượt ngưỡng, và thuế TNCN 5% chỉ trên phần vượt ngưỡng. Ngưỡng này theo Luật 149/2025/QH15 (thuế GTGT, hiệu lực 01/01/2026) và Luật Thuế TNCN 109/2025/QH15 (hiệu lực 01/07/2026). Ngưỡng đã đổi nhiều lần — từ 100 lên 200 rồi lên 500 triệu — nên nếu bạn đọc trang này về sau, hãy tra lại con số hiện hành rồi nhập vào ô ngưỡng.",

  formula: {
    title: "Bốn con số nghĩa là gì",
    body: [
      "Tỷ suất gộp = tiền thuê cả năm ÷ giá mua. Bỏ qua mọi chi phí, thuế và khoản vay. Chỉ dùng để lọc nhanh hàng chục tin bán nhà, không dùng để ra quyết định.",
      "Cap rate = lợi nhuận vận hành ÷ giá mua, trong đó lợi nhuận vận hành = tiền thuê thực thu − thuế cho thuê − chi phí vận hành. Cap rate KHÔNG phụ thuộc vào cách bạn thanh toán, nên nó là con số để so hai căn nhà với nhau. Với mặc định, 6,00% tụt xuống 4,90% khi tính đủ chi phí vận hành — ở mức thuê này doanh thu chưa vượt ngưỡng nên chưa phải nộp thuế; vượt ngưỡng thì cap rate còn tụt thêm.",
      "Tỷ suất trên vốn tự có = dòng tiền cả năm ÷ vốn tự có đã bỏ ra, trong đó dòng tiền = lợi nhuận vận hành − khoản trả nợ, và vốn tự có = tiền trả trước + chi phí mua một lần. Đây là con số của BẠN. Vay nợ có thể đẩy nó lên cao hơn cap rate, hoặc kéo nó xuống âm trong khi cap rate vẫn dương — đúng trường hợp mặc định ở đây.",
      "DSCR = lợi nhuận vận hành ÷ khoản trả nợ cả năm. Dưới 1 nghĩa là tiền thuê không đủ trả nợ và phần thiếu lấy từ thu nhập khác của bạn. Ngân hàng thường muốn thấy DSCR từ 1,2 trở lên với bất động sản cho thuê. DSCR bằng 1 xảy ra đúng lúc dòng tiền bằng 0.",
      "Thuế cho thuê được tính trên DOANH THU, không trên lợi nhuận, nên vẫn bị thu khi căn nhà lỗ. Đây là hai loại thuế với hai căn cứ khác nhau, không phải một mức 10% gộp. Thuế GTGT 5% tính trên TOÀN BỘ tiền thuê thực thu, ngay khi doanh thu vượt ngưỡng — đây là bậc thang dựng đứng. Thuế TNCN 5% chỉ tính trên PHẦN vượt ngưỡng, vì ngưỡng được trừ ra trước — đây là phần tăng dần. Ví dụ doanh thu 900 triệu với ngưỡng 500 triệu: GTGT 45 triệu cộng TNCN 20 triệu, tổng 65 triệu — không phải 90 triệu như cách tính 10% trên toàn bộ.",
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
        a: "Công cụ điền sẵn 500 triệu đồng doanh thu mỗi năm, theo Luật 149/2025/QH15 với thuế GTGT và Luật Thuế TNCN 109/2025/QH15. Mức này đã đổi nhiều lần — từ 100 lên 200 rồi lên 500 triệu — và trang này là trang tĩnh nên không thể biết mức hiện hành: hãy tra quy định mới nhất hoặc hỏi cơ quan thuế rồi nhập lại. Ngưỡng ảnh hưởng lớn và không đối xứng: đúng quanh ngưỡng, tăng tiền thuê một chút có thể làm bạn mất nhiều hơn được, vì thuế GTGT nhảy vào trên toàn bộ doanh thu chứ không chỉ phần vượt. Riêng thuế TNCN thì chỉ tính trên phần vượt, nên nó tăng dần chứ không nhảy bậc.",
      },
      {
        q: "Công cụ có tính giá nhà tăng không?",
        a: "Không. Toàn bộ kết quả ở đây là dòng tiền và tỷ suất vận hành trong một năm, không có giả định nào về giá nhà. Đó là cố ý: giá nhà tăng là phần không kiểm soát được, còn dòng tiền là phần bạn phải sống với mỗi tháng. Nếu muốn xem tổng lợi nhuận gồm cả tăng giá, hãy dùng công cụ thuê hay mua nhà của FinHome, nơi có ô nhập mức tăng giá.",
      },
    ],
  },
} as const;
