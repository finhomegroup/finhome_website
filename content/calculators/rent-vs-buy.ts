// Copy for /cong-cu/thue-hay-mua/ — the rent vs buy calculator.
//
// Original FinHome copy. The arithmetic is a month-by-month simulation.
//
// This is the most assumption-heavy tool in the suite and the copy says so
// twice, above the calculator and again in the FAQ. The result is dominated
// by ONE input nobody can know — the price growth rate — and a page that let
// a reader take "mua lợi hơn 1,15 tỷ" as a fact would be doing harm. The
// notice therefore tells them to run it at a negative growth rate too.
//
// Figures quoted are the tool's own output for the defaults (giá 3 tỷ, trả
// trước 900 triệu, phí mua 100 triệu, vay 8,5%/năm 240 tháng, chi phí sở hữu
// 2,5 triệu/tháng, giá nhà +5%/năm, phí bán 3%, thuê 15 triệu/tháng, thuê
// +4%/năm, cọc 30 triệu, đầu tư 6%/năm, so trong 120 tháng):
//   trả nợ 18.224.288 ₫/tháng
//   MUA:   bỏ ra 3.486.914.548 ₫, còn lại 3.270.213.086 ₫ → chi phí ròng 216.701.462 ₫
//   THUÊ:  tiền thuê 2.161.099.282 ₫ − lãi đầu tư 790.847.697 ₫ → 1.370.251.586 ₫
//   mua lợi hơn 1.153.550.123 ₫; điểm hòa vốn tháng 33
//   giá nhà cuối kỳ 4.886.683.880 ₫, dư nợ 1.469.870.278 ₫, lãi đã trả 1.556.784.826 ₫

export const RENT_VS_BUY = {
  slug: "/cong-cu/thue-hay-mua",

  pageTitle: "Thuê hay mua nhà?",
  metaTitle: "Thuê hay mua nhà — So chi phí ròng trong cùng một khoảng thời gian",
  metaDescription:
    "So sánh thuê và mua nhà bằng chi phí ròng: phần gốc là tài sản chứ không phải chi phí, và tiền không dùng để trả trước thì được đầu tư. Công cụ miễn phí của FinHome.",

  lede:
    "Phép so quen thuộc — “thuê 15 triệu, trả nợ 18 triệu, vậy mua đắt hơn 3 triệu” — sai theo cả hai chiều cùng lúc. Công cụ này quy cả hai phương án về CHI PHÍ RÒNG: số tiền bỏ ra trừ đi những gì bạn còn lại ở cuối kỳ.",

  form: {
    buyGroup: "Nếu mua",
    priceLabel: "Giá nhà",
    priceUnit: "₫",
    priceHelp: "Giá mua căn nhà, chưa gồm phí.",
    priceInvalid: "Vui lòng nhập giá nhà lớn hơn 0.",
    defaultPrice: "3.000.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp:
      "Tiền mặt bạn bỏ ra. Đây cũng chính là số tiền mà người đi thuê sẽ đem đầu tư, để hai bên khởi đầu từ cùng một mức tài sản.",
    downInvalid: "Tiền trả trước phải từ 0 và không vượt giá nhà.",
    defaultDown: "900.000.000",

    purchaseCostsLabel: "Phí mua một lần",
    purchaseCostsUnit: "₫",
    purchaseCostsHelp:
      "Thuế, công chứng, sang tên, hoa hồng, nội thất. Cũng được cộng vào số tiền người đi thuê đem đầu tư.",
    purchaseCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPurchaseCosts: "100.000.000",

    rateLabel: "Lãi suất vay",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi sau ưu đãi, không phải mức ưu đãi năm đầu.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn vay",
    termHelp: "Số tháng vay. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "240",

    ownerCostsLabel: "Chi phí sở hữu mỗi tháng",
    ownerCostsUnit: "₫",
    ownerCostsHelp:
      "Phí quản lý, quỹ bảo trì, sửa chữa, bảo hiểm tài sản. Người đi thuê không phải trả những khoản này.",
    ownerCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultOwnerCosts: "2.500.000",

    growthLabel: "Giá nhà tăng",
    growthUnit: "%/năm",
    growthHelp:
      "Ô quan trọng nhất và cũng là ô không ai biết chắc. Nhập số âm để thử trường hợp giá giảm.",
    growthInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultGrowth: "5",

    sellingCostLabel: "Phí khi bán",
    sellingCostUnit: "% giá bán",
    sellingCostHelp:
      "Hoa hồng môi giới và thuế chuyển nhượng, tính trên giá bán cuối kỳ chứ không phải giá mua.",
    sellingCostInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultSellingCost: "3",

    rentGroup: "Nếu thuê",
    rentLabel: "Tiền thuê mỗi tháng",
    rentUnit: "₫",
    rentHelp: "Tiền thuê một căn tương đương ở thời điểm hiện tại.",
    rentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRent: "15.000.000",

    rentGrowthLabel: "Tiền thuê tăng",
    rentGrowthUnit: "%/năm",
    rentGrowthHelp: "Mức tăng tiền thuê mỗi năm. Áp dụng một lần vào mỗi năm.",
    rentGrowthInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultRentGrowth: "4",

    depositLabel: "Tiền cọc thuê",
    depositUnit: "₫",
    depositHelp:
      "Thường 1–3 tháng tiền thuê. Được trả lại khi hết hợp đồng, nên nó không phải chi phí.",
    depositInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDeposit: "30.000.000",

    investmentLabel: "Lợi nhuận đầu tư",
    investmentUnit: "%/năm",
    investmentHelp:
      "Mức sinh lời của số tiền người đi thuê không dùng để trả trước. Bỏ qua ô này là sai lệch lớn nhất nghiêng về phía mua.",
    investmentInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultInvestment: "6",

    horizonGroup: "Khoảng thời gian so sánh",
    horizonLabel: "So sánh trong",
    horizonHelp:
      "Số tháng bạn dự định ở căn nhà này. 10 năm là 120 tháng. Đây là ô quyết định kết luận cùng với mức tăng giá nhà.",
    horizonInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultHorizon: "120",

    resultTitle: "Kết luận",
    verdictLabel: "Phương án lợi hơn",
    verdictBuy: "Mua",
    verdictRent: "Thuê",
    advantageLabel: "Lợi hơn",
    breakEvenLabel: "Mua bắt đầu có lợi từ tháng",
    monthsUnit: "tháng",

    buyTitle: "Nếu mua",
    rentTitle: "Nếu thuê",
    totalPaidLabel: "Tổng tiền bỏ ra",
    netWorthLabel: "Giá trị còn lại cuối kỳ",
    netCostLabel: "Chi phí ròng",

    detailTitle: "Chi tiết",
    monthlyPaymentLabel: "Trả nợ mỗi tháng",
    loanAmountLabel: "Số tiền vay",
    upfrontLabel: "Tiền bỏ ra ban đầu",
    houseValueLabel: "Giá nhà cuối kỳ",
    loanBalanceLabel: "Dư nợ cuối kỳ",
    totalInterestLabel: "Lãi đã trả",
    totalPrincipalLabel: "Gốc đã trả",
    ownerCostsResultLabel: "Chi phí sở hữu đã trả",
    sellingCostResultLabel: "Phí khi bán",
    totalRentLabel: "Tiền thuê đã trả",
    investmentValueLabel: "Giá trị khoản đầu tư cuối kỳ",
    investmentGainLabel: "Lãi từ khoản đầu tư",

    noBreakEvenNotice:
      "Trong khoảng thời gian bạn chọn, mua không lúc nào có lợi hơn thuê. Hãy thử kéo dài khoảng thời gian so sánh — phí mua và phí bán cần nhiều năm mới được bù lại.",
  },

  assumptionNotice:
    "Đây là công cụ nhiều giả định nhất trong bộ này, và kết quả bị chi phối gần như hoàn toàn bởi MỘT ô mà không ai biết chắc: mức tăng giá nhà. Với mặc định — giá nhà tăng 5%/năm, đầu tư sinh lời 6%/năm, so trong 10 năm — mua lợi hơn 1.153.550.123 ₫ và có lợi từ tháng thứ 33. Đổi mức tăng giá nhà thành −3%/năm và kéo dài lên 20 năm thì thuê lợi hơn. Vì vậy đừng đọc con số này như một dự báo: hãy chạy công cụ ba lần với mức tăng giá lạc quan, trung tính và âm, rồi xem kết luận có đổi chiều hay không. Nếu có, thì quyết định của bạn phụ thuộc vào một điều không thể biết trước, và những yếu tố khác — sự ổn định chỗ ở, khả năng chuyển việc, mức chịu đựng dòng tiền — mới nên là yếu tố quyết định.",

  formula: {
    title: "Cách so công bằng",
    body: [
      "Cả hai phương án được quy về CHI PHÍ RÒNG = tổng tiền bỏ ra − giá trị còn lại ở cuối kỳ. Hai bên khởi đầu từ cùng một mức tài sản, nên hiệu số giữa hai chi phí ròng là câu trả lời. Số thấp hơn là phương án lợi hơn.",
      "Phía mua: tiền bỏ ra gồm tiền trả trước, phí mua, toàn bộ các khoản trả nợ và chi phí sở hữu trong kỳ. Giá trị còn lại = giá nhà cuối kỳ − dư nợ − phí khi bán. Điểm quan trọng: phần GỐC trong khoản trả nợ không phải chi phí, nó quay lại thành tài sản của bạn. Chỉ tiền lãi, phí và chi phí sở hữu là tiền đi hẳn. Với mặc định, bỏ ra 3.486.914.548 ₫ nhưng chi phí ròng chỉ 216.701.462 ₫.",
      "Phía thuê: tiền bỏ ra gồm tiền thuê tăng dần hằng năm và tiền cọc. Giá trị còn lại = giá trị khoản đầu tư + tiền cọc được trả lại. Số tiền đem đầu tư đúng bằng tiền trả trước cộng phí mua của phía mua — đây là điều kiện để hai bên so được với nhau. Với mặc định, 1 tỷ đầu tư 6%/năm trong 10 năm sinh lời 790.847.697 ₫, và chi phí ròng của thuê là 2.161.099.282 − 790.847.697 = 1.370.251.586 ₫.",
      "Phí khi bán được tính trên giá nhà CUỐI KỲ, không phải giá mua. Với mặc định, căn nhà 3 tỷ thành 4.886.683.880 ₫ nên phí bán 3% là hơn 146 triệu, không phải 90 triệu.",
      "Điểm hòa vốn là tháng đầu tiên mà mua đã có lợi VÀ giữ được lợi thế đó đến hết khoảng thời gian so sánh. Công cụ dò từ cuối về đầu để không báo một tháng sớm mà sau đó lại bị đảo chiều.",
      "Một điều công cụ CỐ Ý không làm: nó không giả định người mua đem chênh lệch đi đầu tư khi khoản trả nợ nhỏ hơn tiền thuê. Giả định đó đòi hỏi một mức kỷ luật mà phần lớn người không có, và nó sẽ âm thầm nghiêng kết quả về phía mua.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao phần gốc lại không được tính là chi phí?",
        a: "Vì nó không mất đi. Mỗi đồng gốc bạn trả làm dư nợ giảm một đồng, nên nếu bán nhà bạn nhận lại đúng phần đó. Đây là sai lệch lớn nhất của phép so “tiền thuê với khoản trả nợ”: khoản trả nợ 18.224.288 ₫ không phải chi phí 18.224.288 ₫ — ở tháng đầu tiên 81,6% là lãi và 18,4% là gốc, nên chi phí thật thấp hơn nhiều, và tỷ lệ đó dịch dần về phía gốc theo thời gian.",
      },
      {
        q: "Vì sao phải tính lãi đầu tư của người đi thuê?",
        a: "Vì nếu không thuê thì số tiền đó đã nằm trong căn nhà. Người đi thuê giữ được 1 tỷ tiền trả trước và phí mua, và số tiền đó sinh lời. Bỏ qua khoản này là cách phổ biến nhất khiến các công cụ so sánh kết luận rằng mua luôn tốt hơn. Ô lợi nhuận đầu tư nên nhập ở mức bạn thực sự đạt được — lãi tiền gửi khoảng 5–6%/năm nếu bạn gửi ngân hàng, chứ đừng nhập mức của thị trường chứng khoán nếu bạn không thực sự đầu tư ở đó.",
      },
      {
        q: "Nhập mức tăng giá nhà bao nhiêu là hợp lý?",
        a: "Không có con số đúng, và đó là lý do trang này nhắc bạn chạy nhiều lần. Về dài hạn, giá nhà ở một thị trường trưởng thành thường tăng xấp xỉ mức lạm phát cộng một chút; ở Việt Nam giai đoạn vừa qua nhiều nơi tăng nhanh hơn nhiều, nhưng quá khứ không phải cam kết. Cách dùng an toàn: chạy với mức 0%, mức 5% và mức −3%, rồi chỉ tin kết luận nếu cả ba lần đều cùng chiều.",
      },
      {
        q: "Khoảng thời gian so sánh nên là bao lâu?",
        a: "Số năm bạn thật sự tin là mình sẽ ở căn nhà đó. Phí mua và phí bán cộng lại thường bằng 5–8% giá nhà, và cần nhiều năm mới bù được. Đây là lý do mua nhà rồi bán sau hai ba năm hầu như luôn lỗ, bất kể giá nhà tăng bao nhiêu. Nếu bạn có khả năng chuyển việc hoặc chuyển thành phố trong vài năm tới, hãy nhập mốc ngắn — kết quả sẽ khác hẳn.",
      },
      {
        q: "Công cụ có tính chuyện lãi suất vay thay đổi không?",
        a: "Không. Khoản vay được giả định giữ nguyên lãi suất suốt kỳ hạn. Với khoản vay mua nhà tại Việt Nam, đây là giả định lạc quan: lãi ưu đãi thường chỉ 6–24 tháng rồi chuyển sang thả nổi. Hãy nhập mức lãi SAU ưu đãi ở ô lãi suất, và nếu muốn thấy trường hợp xấu, hãy nhập thêm 2–3 điểm phần trăm rồi chạy lại.",
      },
      {
        q: "Còn những thứ không quy ra tiền được thì sao?",
        a: "Chúng thường quan trọng hơn con số. Mua nhà cho sự ổn định chỗ ở, quyền sửa sang theo ý mình, và một khoản tiết kiệm cưỡng bức. Thuê cho sự linh hoạt khi đổi việc, không phải chịu rủi ro giá nhà, và không bị khóa vốn vào một tài sản duy nhất. Công cụ này chỉ trả lời phần tiền; nếu hai bên chênh nhau không nhiều thì hãy để những yếu tố kia quyết định.",
      },
    ],
  },
} as const;
