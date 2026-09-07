// Copy for /cong-cu/trai-phieu/ — the bond calculator.
//
// Original FinHome copy. Yield from price is solved numerically; see
// lib/calc/bond.ts.
//
// Three things the copy has to keep straight, because they are three
// different numbers people all call "lợi suất":
//
//   lãi suất coupon   — fixed, a percent of FACE value
//   lợi suất hiện tại — coupon ÷ PRICE, ignores maturity
//   YTM               — the actual return if held to maturity
//
// Figures quoted are the tool's own output for 100 triệu face, coupon 8%/năm
// trả 6 tháng/lần, 5 năm, YTM 10%: giá 92.278.265 ₫ (92,278% mệnh giá), lợi
// suất hiện tại 8,6694%, lợi suất hiệu dụng 10,2500%, thời gian đáo hạn bình
// quân 4,1798 năm, duration điều chỉnh 3,9808 năm, và giá giảm khoảng
// 3.673.373 ₫ nếu lợi suất tăng 1 điểm phần trăm. Ở giá 90 triệu: YTM
// 10,6299%, lợi suất hiện tại 8,8889%. Trái phiếu không trả lãi cùng điều
// kiện: giá 61.391.325 ₫, duration đúng 5,00 năm.
//
// The Vietnamese context note matters: since Nghị định 65/2022 an individual
// buying privately-placed corporate bonds must be a professional investor,
// so most retail readers can only reach public issues or bond funds.

export const BOND = {
  slug: "/cong-cu/trai-phieu",

  pageTitle: "Tính trái phiếu: giá, lợi suất và độ nhạy lãi suất",
  metaTitle: "Tính trái phiếu — Giá, YTM, lợi suất hiện tại và duration",
  metaDescription:
    "Tính giá trái phiếu từ lợi suất yêu cầu, hoặc lợi suất đáo hạn từ giá thị trường, kèm lợi suất hiện tại và duration. Công cụ miễn phí của FinHome.",

  lede:
    "Giá và lợi suất là hai chiều của cùng một quan hệ: biết một thì tính được cái kia. Công cụ làm cả hai chiều, và tách rõ ba con số đều được gọi là “lợi suất” nhưng có nghĩa khác nhau.",

  form: {
    modeLegend: "Bạn biết con số nào?",
    modeHelp:
      "Hai chiều của cùng một phép tính. Chiều thứ hai phải giải bằng phương pháp số vì không có công thức đóng.",
    modeYield: "Biết lợi suất yêu cầu, tính giá",
    modePrice: "Biết giá thị trường, tính lợi suất đáo hạn",

    bondGroup: "Trái phiếu",
    faceLabel: "Mệnh giá",
    faceUnit: "₫",
    faceHelp:
      "Số tiền được hoàn trả khi đáo hạn. Trái phiếu doanh nghiệp tại Việt Nam thường có mệnh giá 100.000 ₫ hoặc 100 triệu ₫.",
    faceInvalid: "Vui lòng nhập mệnh giá lớn hơn 0.",
    defaultFace: "100.000.000",

    couponLabel: "Lãi suất coupon",
    couponUnit: "%/năm",
    couponHelp:
      "Tính trên MỆNH GIÁ, không phải trên giá mua. Nhập 0 cho trái phiếu không trả lãi.",
    couponInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultCoupon: "8",

    yearsLabel: "Số năm còn lại đến đáo hạn",
    yearsHelp:
      "Phải là số nguyên kỳ trả lãi: với trái phiếu trả lãi 6 tháng một lần thì 5 hoặc 5,5 đều được, nhưng 5,25 thì không.",
    yearsInvalid: "Số năm phải lớn hơn 0 và tạo thành số nguyên kỳ trả lãi.",
    defaultYears: "5",

    frequencyLabel: "Số lần trả lãi mỗi năm",
    frequencyHelp:
      "Trái phiếu doanh nghiệp Việt Nam thường trả 1 hoặc 2 lần một năm. Con số này ảnh hưởng tới cả giá và lợi suất.",
    frequencyAnnual: "1 lần — hằng năm",
    frequencySemi: "2 lần — 6 tháng một lần",
    frequencyQuarterly: "4 lần — hằng quý",
    defaultFrequency: "2",

    marketGroup: "Thị trường",
    yieldLabel: "Lợi suất yêu cầu",
    yieldUnit: "%/năm",
    yieldHelp:
      "Mức lợi suất bạn đòi hỏi để mua trái phiếu này, tính theo quy ước danh nghĩa hằng năm.",
    yieldInvalid: "Vui lòng nhập một số.",
    defaultYield: "10",

    priceLabel: "Giá thị trường",
    priceUnit: "₫",
    priceHelp:
      "Giá bạn phải trả để mua, chưa gồm lãi dồn tích. Công cụ giải ra lợi suất đáo hạn tương ứng.",
    priceInvalid: "Vui lòng nhập giá lớn hơn 0.",
    defaultPrice: "92.278.265",

    resultTitle: "Kết quả",
    priceResultLabel: "Giá trái phiếu",
    yieldResultLabel: "Lợi suất đáo hạn (YTM)",
    pricePercentLabel: "So với mệnh giá",
    quoteLabel: "Trạng thái",
    quotePremium: "Cao hơn mệnh giá",
    quoteDiscount: "Thấp hơn mệnh giá",
    quotePar: "Bằng mệnh giá",

    detailTitle: "Chi tiết",
    currentYieldLabel: "Lợi suất hiện tại",
    effectiveYieldLabel: "Lợi suất hiệu dụng theo năm",
    couponPerPeriodLabel: "Lãi mỗi kỳ",
    couponPerYearLabel: "Lãi mỗi năm",
    periodsLabel: "Số kỳ còn lại",
    macaulayLabel: "Thời gian đáo hạn bình quân",
    modifiedLabel: "Duration điều chỉnh",
    sensitivityLabel: "Giá thay đổi nếu lợi suất tăng 1 điểm %",
    totalCashLabel: "Tổng tiền nhận được nếu giữ đến đáo hạn",
    yearsUnit: "năm",
    periodsUnit: "kỳ",

    unsolvableNotice:
      "Không tìm được lợi suất đáo hạn cho mức giá này. Thường là do giá quá cao so với tổng tiền trái phiếu sẽ trả — hãy kiểm tra lại mệnh giá, lãi suất coupon và số năm còn lại.",
  },

  threeYieldsNotice:
    "Ba con số dưới đây đều được gọi là “lợi suất” và chúng khác nhau. Lãi suất coupon 8%/năm là con số cố định tính trên MỆNH GIÁ — nó không đổi dù giá trái phiếu lên hay xuống. Lợi suất hiện tại là lãi mỗi năm chia GIÁ MUA, ở ví dụ mặc định là 8,6694%; nó bỏ qua việc bạn còn lãi hay lỗ phần chênh lệch giá khi đáo hạn. Lợi suất đáo hạn 10% là con số duy nhất tính đủ cả tiền lãi lẫn chênh lệch giá, và là con số để so sánh giữa các trái phiếu. Người bán thường nói lợi suất hiện tại vì nó không phản ánh mức chiết khấu.",

  formula: {
    title: "Cách tính",
    body: [
      "Giá trái phiếu là giá trị hiện tại của toàn bộ dòng tiền: các khoản lãi mỗi kỳ cộng mệnh giá ở kỳ cuối, chiết khấu theo lợi suất mỗi kỳ. Lợi suất mỗi kỳ bằng lợi suất năm chia số lần trả lãi mỗi năm — đây là quy ước của thị trường trái phiếu, không phải ghép lãi hằng năm.",
      "Với ví dụ mặc định: 4 triệu mỗi kỳ trong 10 kỳ, chiết khấu ở 5% mỗi kỳ, cộng 100 triệu ở kỳ thứ 10, cho giá 92.278.265 ₫, tức 92,278% mệnh giá. Lợi suất 10% cao hơn coupon 8% nên trái phiếu bán thấp hơn mệnh giá — quan hệ này luôn đúng theo cả hai chiều.",
      "Chiều nghịch không có công thức đóng. Vì giá giảm đơn điệu theo lợi suất, luôn tồn tại đúng một nghiệm khi nó nằm trong dải tìm kiếm, và công cụ giải bằng phương pháp chia đôi khoảng. Nếu không kẹp được nghiệm, ô lợi suất để trống thay vì hiển thị một con số đoán.",
      "Lợi suất hiệu dụng là lợi suất danh nghĩa đã ghép lãi theo số kỳ: với trả lãi hai lần một năm, 10%/năm danh nghĩa tương đương 10,2500% hiệu dụng. Với trái phiếu trả lãi một lần một năm, hai con số trùng nhau.",
      "Thời gian đáo hạn bình quân là bình quân gia quyền thời điểm nhận tiền, tính theo NĂM — 4,1798 năm với ví dụ mặc định. Nó luôn ngắn hơn kỳ hạn với trái phiếu có coupon, vì bạn nhận một phần tiền trước khi đáo hạn, và đúng bằng kỳ hạn với trái phiếu không trả lãi. Duration điều chỉnh là con số đó chia (1 + lợi suất mỗi kỳ), tức 3,9808 năm.",
      "Duration điều chỉnh đo độ nhạy giá: giá giảm khoảng duration × giá × 1% khi lợi suất tăng 1 điểm phần trăm, tức khoảng 3.673.373 ₫ ở ví dụ mặc định. Đây là xấp xỉ bậc một và nó hơi phóng đại mức giảm, vì quan hệ giá–lợi suất là đường cong lồi.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Cá nhân ở Việt Nam có mua được trái phiếu doanh nghiệp không?",
        a: "Chỉ trong giới hạn. Từ Nghị định 65/2022, cá nhân muốn mua trái phiếu doanh nghiệp phát hành RIÊNG LẺ phải là nhà đầu tư chứng khoán chuyên nghiệp, với các điều kiện về giá trị tài sản hoặc kinh nghiệm. Trái phiếu phát hành ra công chúng và các quỹ trái phiếu thì không bị giới hạn này. Hãy xác định rõ trái phiếu bạn được chào là loại nào trước khi bàn tới lợi suất.",
      },
      {
        q: "Vì sao lợi suất cao lại là dấu hiệu đáng lo?",
        a: "Vì lợi suất cao thường là giá của rủi ro, không phải một ưu đãi. Trái phiếu bán thấp hơn mệnh giá đáng kể thường vì thị trường lo tổ chức phát hành không trả được nợ, và công cụ này không tính rủi ro vỡ nợ — nó giả định mọi khoản lãi và mệnh giá đều được trả đủ, đúng hạn. Lợi suất 20% chỉ là 20% nếu bạn thực sự nhận được tiền.",
      },
      {
        q: "Ba con số lợi suất, nên dùng cái nào?",
        a: "Dùng lợi suất đáo hạn để so sánh, vì nó tính đủ cả lãi và chênh lệch giá. Lợi suất hiện tại chỉ hữu ích khi bạn cần biết dòng tiền hằng năm so với số tiền đã bỏ ra. Lãi suất coupon không phải lợi suất của bạn — nó là điều khoản của trái phiếu, tính trên mệnh giá, và chỉ trùng với lợi suất khi bạn mua đúng bằng mệnh giá.",
      },
      {
        q: "Duration dùng để làm gì?",
        a: "Để biết bạn mất bao nhiêu nếu lãi suất tăng. Trái phiếu kỳ hạn dài và coupon thấp có duration cao, nên giá biến động mạnh: cùng mức lãi suất tăng 1 điểm, một trái phiếu duration 4 năm mất khoảng 4% giá còn duration 12 năm mất khoảng 12%. Nếu bạn có thể phải bán trước đáo hạn, duration là con số đo rủi ro của bạn.",
      },
      {
        q: "Vì sao công cụ từ chối số năm như 5,25?",
        a: "Vì với trái phiếu trả lãi 6 tháng một lần, 5,25 năm nghĩa là bạn đang ở giữa hai kỳ trả lãi. Định giá đúng khi đó cần tính lãi dồn tích và một kỳ đầu ngắn hơn, việc mà công cụ này chưa làm. Từ chối rõ ràng tốt hơn là làm tròn âm thầm rồi đưa ra một con số sai vài phần trăm.",
      },
      {
        q: "Giá công cụ tính có phải giá tôi trả không?",
        a: "Chưa hẳn. Đây là giá sạch, chưa gồm lãi dồn tích từ kỳ trả lãi gần nhất — trên thực tế bạn trả giá sạch cộng lãi dồn tích, gọi là giá bẩn. Ngoài ra còn phí giao dịch và, với trái phiếu, chênh lệch giá mua bán thường rộng hơn cổ phiếu đáng kể.",
      },
    ],
  },
} as const;
