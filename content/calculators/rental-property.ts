// Copy for /cong-cu/bat-dong-san-cho-thue/ — the rental property calculator.
//
// Original FinHome copy. The arithmetic is standard property analysis.
//
// The page's editorial job is to separate four figures that sound alike:
// gross yield, cap rate, cash-on-cash and DSCR. With the defaults (3 tỷ,
// trả trước 1,2 tỷ, phí mua 150 triệu, vay 9%/năm 240 tháng, thuê 15 triệu/
// tháng, trống 5%, chi phí 2 triệu/tháng) the tool returns: gross 6,00%,
// cap rate 4,33%, cash-on-cash −4,77%, DSCR 0,67 — a property that earns
// money while its owner loses 5.370.067 ₫ every month. Trả trước 2,4 tỷ đảo
// chiều: cash-on-cash +2,55%, DSCR 2,01, dòng tiền +65.119.731 ₫/năm. Mua
// bằng tiền tươi: cap rate vẫn 4,33%, cash-on-cash 4,12%.
//
// Tax: an individual letting property in Vietnam pays 5% VAT + 5% PIT on
// GROSS revenue once annual revenue passes the threshold, and nothing below
// it — a cliff, not a taper, and a turnover tax rather than a profit tax. The
// threshold is an input because it has been revised more than once; the copy
// tells the reader to check the current figure rather than trusting the
// prefilled 100 triệu.

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
    taxRateLabel: "Thuế trên doanh thu",
    taxRateUnit: "%",
    taxRateHelp:
      "Cá nhân cho thuê nhà tại Việt Nam nộp 5% thuế giá trị gia tăng cộng 5% thuế thu nhập cá nhân trên doanh thu, tức 10%.",
    taxRateInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTaxRate: "10",

    thresholdLabel: "Ngưỡng miễn thuế mỗi năm",
    thresholdUnit: "₫",
    thresholdHelp:
      "Dưới mức doanh thu này thì không phải nộp thuế cho thuê. Mức này đã được điều chỉnh nhiều lần — hãy tra con số hiện hành và nhập lại.",
    thresholdInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultThreshold: "100.000.000",

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
    taxLabel: "Thuế cho thuê",
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
    "Với các con số mặc định, căn hộ này có tỷ suất gộp 6,00% và cap rate 4,33% — nghe như một khoản đầu tư ổn. Nhưng tỷ suất trên vốn tự có là −4,77% và DSCR là 0,67: tiền thuê chỉ bù được hai phần ba khoản trả nợ, nên mỗi tháng bạn phải bỏ thêm 5.370.067 ₫ từ thu nhập khác. Căn nhà có lãi; người mua thì không. Đây là điều mà tỷ suất gộp không bao giờ cho bạn thấy, và là lý do cần đọc cả bốn dòng.",

  formula: {
    title: "Bốn con số nghĩa là gì",
    body: [
      "Tỷ suất gộp = tiền thuê cả năm ÷ giá mua. Bỏ qua mọi chi phí, thuế và khoản vay. Chỉ dùng để lọc nhanh hàng chục tin bán nhà, không dùng để ra quyết định.",
      "Cap rate = lợi nhuận vận hành ÷ giá mua, trong đó lợi nhuận vận hành = tiền thuê thực thu − thuế cho thuê − chi phí vận hành. Cap rate KHÔNG phụ thuộc vào cách bạn thanh toán, nên nó là con số để so hai căn nhà với nhau. Với mặc định, 6,00% tụt xuống 4,33% khi tính đủ chi phí và thuế.",
      "Tỷ suất trên vốn tự có = dòng tiền cả năm ÷ vốn tự có đã bỏ ra, trong đó dòng tiền = lợi nhuận vận hành − khoản trả nợ, và vốn tự có = tiền trả trước + chi phí mua một lần. Đây là con số của BẠN. Vay nợ có thể đẩy nó lên cao hơn cap rate, hoặc kéo nó xuống âm trong khi cap rate vẫn dương — đúng trường hợp mặc định ở đây.",
      "DSCR = lợi nhuận vận hành ÷ khoản trả nợ cả năm. Dưới 1 nghĩa là tiền thuê không đủ trả nợ và phần thiếu lấy từ thu nhập khác của bạn. Ngân hàng thường muốn thấy DSCR từ 1,2 trở lên với bất động sản cho thuê. DSCR bằng 1 xảy ra đúng lúc dòng tiền bằng 0.",
      "Thuế cho thuê được tính trên DOANH THU, không trên lợi nhuận: 5% thuế giá trị gia tăng cộng 5% thuế thu nhập cá nhân trên tiền thuê thực thu. Nó vẫn bị thu khi căn nhà lỗ. Và nó là một ngưỡng chứ không phải bậc lũy tiến: dưới ngưỡng thì không nộp gì, vượt ngưỡng thì nộp trên toàn bộ doanh thu.",
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
        a: "Vì cap rate chia cho giá mua, còn tỷ suất trên vốn tự có chia cho giá mua CỘNG chi phí mua một lần. Với mặc định, cap rate 4,33% trên 3 tỷ trở thành 4,12% trên 3,15 tỷ. Chi phí mua là tiền thật đã bỏ ra, nên nó phải nằm ở mẫu số — nhiều người bỏ qua khoản này và vì thế báo cáo tỷ suất cao hơn thực tế.",
      },
      {
        q: "Ngưỡng miễn thuế cho thuê hiện nay là bao nhiêu?",
        a: "Công cụ điền sẵn 100 triệu đồng doanh thu mỗi năm, nhưng mức này thuộc quy định về cá nhân kinh doanh và đã được điều chỉnh nhiều lần. Trang này là trang tĩnh nên không thể biết mức hiện hành — hãy tra quy định mới nhất hoặc hỏi cơ quan thuế rồi nhập lại. Ngưỡng ảnh hưởng lớn: đúng quanh ngưỡng, tăng tiền thuê một chút có thể làm bạn mất nhiều hơn được, vì thuế được thu trên toàn bộ doanh thu chứ không chỉ phần vượt ngưỡng.",
      },
      {
        q: "Công cụ có tính giá nhà tăng không?",
        a: "Không. Toàn bộ kết quả ở đây là dòng tiền và tỷ suất vận hành trong một năm, không có giả định nào về giá nhà. Đó là cố ý: giá nhà tăng là phần không kiểm soát được, còn dòng tiền là phần bạn phải sống với mỗi tháng. Nếu muốn xem tổng lợi nhuận gồm cả tăng giá, hãy dùng công cụ thuê hay mua nhà của FinHome, nơi có ô nhập mức tăng giá.",
      },
    ],
  },
} as const;
