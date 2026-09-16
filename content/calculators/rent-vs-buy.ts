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
//   THUÊ:  tiền thuê 2.161.099.282 ₫ − lãi đầu tư 767.122.266 ₫ → 1.393.977.016 ₫
//   mua lợi hơn 1.177.275.554 ₫; điểm hòa vốn tháng 32
//
// CORRECTED 2026-09-15 (original row 8). The renter's invested pool is the
// upfront cash MINUS the rental deposit — 970 triệu, not 1 tỷ — because the
// landlord holds the deposit and it earns nothing while held. The old figures
// (lãi 790.847.697 ₫, chi phí ròng 1.370.251.586 ₫, mua lợi hơn
// 1.153.550.123 ₫) had the deposit invested and refunded at the same time.
// `rent-vs-buy.test.ts` pins the supervisor's independent fixture and
// `content/calculators/rent-vs-buy.test.ts` binds every figure quoted here to
// the module's own output.
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
      "Tiền mặt bạn bỏ ra. Người đi thuê được coi là khởi đầu với đúng số tiền này, nhưng phải để một phần làm tiền cọc nên chỉ phần còn lại được đem đầu tư.",
    downInvalid: "Tiền trả trước phải từ 0 và không vượt giá nhà.",
    defaultDown: "900.000.000",

    purchaseCostsLabel: "Phí mua một lần",
    purchaseCostsUnit: "₫",
    purchaseCostsHelp:
      "Thuế, công chứng, sang tên, hoa hồng, nội thất. Cũng được cộng vào số tiền mặt ban đầu của cả hai phía.",
    purchaseCostsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPurchaseCosts: "100.000.000",

    rateLabel: "Lãi suất vay",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi sau ưu đãi, không phải mức ưu đãi năm đầu.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn vay",
    // `{limit}` substituted from MAX_RENT_BUY_MONTHS, so the bound named in
    // the copy cannot drift from the bound the engine enforces.
    termHelp:
      "Số tháng vay. 20 năm là 240 tháng. Công cụ hỗ trợ tối đa {limit} tháng.",
    termInvalid:
      "Vui lòng nhập số nguyên tháng từ 1 đến {limit} (tức tối đa 100 năm).",
    defaultTerm: "240",

    ownerCostsLabel: "Chi phí sở hữu mỗi tháng",
    ownerCostsUnit: "₫",
    ownerCostsHelp:
      "Phí quản lý, quỹ bảo trì, sửa chữa, bảo hiểm tài sản. Chỉ nhập phần người MUA phải trả thêm so với khi thuê: hợp đồng thuê quyết định ai chịu phí quản lý và bảo trì, và một phần có thể đã nằm trong tiền thuê. Nếu ở hợp đồng thuê của bạn những khoản này do người thuê trả, đừng tính chúng ở đây để không cộng trùng.",
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
      "Thường 1–3 tháng tiền thuê. Được trả lại đủ khi hết hợp đồng nên nó không phải chi phí, nhưng trong lúc chủ nhà giữ thì nó không sinh lời — công cụ trừ nó ra khỏi số tiền đem đầu tư. Tiền cọc không được vượt số tiền mặt ban đầu.",
    // The refusal is not just "a number ≥ 0": a deposit above the upfront
    // cash breaks the comparison's one premise, so the error names the bound
    // and where it comes from.
    depositInvalid:
      "Tiền cọc phải từ 0 trở lên và không vượt số tiền mặt ban đầu (tiền trả trước + phí mua một lần).",
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
      "Số tháng bạn dự định ở căn nhà này. 10 năm là 120 tháng. Đây là ô quyết định kết luận cùng với mức tăng giá nhà. Công cụ hỗ trợ tối đa {limit} tháng.",
    horizonInvalid:
      "Vui lòng nhập số nguyên tháng từ 1 đến {limit} (tức tối đa 100 năm).",
    defaultHorizon: "120",

    /**
     * ORIGINAL ROW 8: "Bắt đầu số ít dữ liệu thực biết; mở nhóm giả định."
     *
     * The six fields above the disclosure are the ones a reader can answer
     * from a listing and a rent contract. Everything inside it is an
     * assumption, and `AdvancedFields` names on its own summary line whatever
     * is currently moving the result — so the panel can be collapsed without
     * a hidden growth rate deciding the verdict silently.
     */
    knownGroup: "Những con số bạn đã biết",
    assumptionsTitle: "Giả định và chi phí kèm theo",
    assumptionsNone:
      "Không có giả định nào đang tác động: chưa có phí mua, chi phí sở hữu, mức tăng giá hay lợi nhuận đầu tư.",
    buyAssumptionsGroup: "Giả định phía mua",
    rentAssumptionsGroup: "Giả định phía thuê",

    resultTitle: "Kết luận",
    /** `{months}` substituted: the verdict is only about the chosen horizon. */
    verdictLabel: "Phương án có chi phí ròng thấp hơn trong {months} tháng",
    verdictBuy: "Mua",
    verdictRent: "Thuê",
    /** `{months}` substituted. */
    advantageLabel: "Lợi hơn trong {months} tháng",
    breakEvenLabel: "Mua bắt đầu có lợi từ tháng",
    monthsUnit: "tháng",
    /**
     * The scope of the verdict, stated beside it.
     *
     * `{months}`, `{growth}`, `{rentGrowth}`, `{investment}` substituted. A
     * bare "Mua" is a claim about a decision; the same word with its four
     * assumptions attached is a claim about a calculation.
     */
    verdictScope:
      "Kết luận này chỉ đúng cho {months} tháng, với giả định giá nhà {growth}/năm, tiền thuê {rentGrowth}/năm và tiền tự có sinh lời {investment}/năm. Đổi một trong bốn con số đó là kết luận có thể đổi chiều — biểu đồ kịch bản bên dưới cho thấy đổi bao nhiêu.",

    buyTitle: "Nếu mua",
    rentTitle: "Nếu thuê",
    totalPaidLabel: "Tổng tiền bỏ ra",
    netWorthLabel: "Giá trị còn lại cuối kỳ",
    netCostLabel: "Chi phí ròng",
    netCostTitle: "Chi phí ròng của hai phương án",
    buyNetCostLabel: "Chi phí ròng nếu mua",
    rentNetCostLabel: "Chi phí ròng nếu thuê",

    detailToggle: "Xem chi tiết từng khoản",
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
    buyTotalPaidLabel: "Tổng tiền bỏ ra nếu mua",
    buyNetWorthLabel: "Giá trị còn lại nếu mua",
    totalRentLabel: "Tiền thuê đã trả",
    investedCashLabel: "Tiền thực sự đem đầu tư",
    investmentValueLabel: "Giá trị khoản đầu tư cuối kỳ",
    investmentGainLabel: "Lãi từ khoản đầu tư",
    rentTotalPaidLabel: "Tổng tiền bỏ ra nếu thuê",
    rentNetWorthLabel: "Giá trị còn lại nếu thuê",

    /**
     * Shown when `breakEvenMonth` is null AND buying was never ahead.
     *
     * The other null case has its own sentence below, because a lead that
     * existed and was reversed is a different answer.
     */
    noBreakEvenNotice:
      "Trong khoảng thời gian bạn chọn, không có tháng nào mua rẻ hơn thuê. Hãy thử kéo dài khoảng thời gian so sánh — phí mua và phí bán cần nhiều năm mới được bù lại.",
    /** `{first}` and `{last}` substituted. */
    reversedNotice:
      "Không có mốc nào mà mua rẻ hơn VÀ giữ được lợi thế đó đến hết khoảng thời gian bạn chọn. Mua có rẻ hơn trong quãng từ tháng {first} đến tháng {last}, rồi bị đảo lại trước cuối kỳ — vì vậy ô “Mua bắt đầu có lợi từ tháng” để trống. Nếu bạn thật sự dự định bán trong quãng đó, hãy nhập đúng số tháng ấy vào ô “So sánh trong”.",
    /** Shown in place of the verdict when the two net costs are level. */
    verdictEqual: "Hai phương án tốn ngang nhau",
    tieNotice:
      "Hai phương án có chi phí ròng bằng nhau theo đúng các giả định đang nhập, nên không có phương án nào lợi hơn. Đây là lúc những yếu tố không quy ra tiền ở dưới nên quyết định.",
  },

  /**
   * ORIGINAL ROW 8: "thêm lý do phi tài chính".
   *
   * On the page, not only in the FAQ, and deliberately BEFORE the reader
   * acts on a difference of a few chục triệu: when the two net costs are
   * close, these are what should decide. No claim about which side wins and
   * no attempt to price any of them.
   */
  nonFinancial: {
    title: "Những điều công cụ này không tính được",
    intro:
      "Công cụ chỉ so phần tiền. Khi chênh lệch giữa hai phương án không lớn so với số tiền bạn đang nói đến, thì những điều dưới đây mới nên là yếu tố quyết định — và không có con số nào ở trên đo được chúng.",
    buyTitle: "Thường nghiêng về mua",
    buyItems: [
      "Ổn định chỗ ở: không phụ thuộc việc chủ nhà có gia hạn hợp đồng hay không, con không phải chuyển trường.",
      "Được sửa sang, cải tạo và dùng căn nhà theo ý mình.",
      "Khoản trả nợ hằng tháng hoạt động như một hình thức tiết kiệm cưỡng bức.",
    ],
    rentTitle: "Thường nghiêng về thuê",
    rentItems: [
      "Linh hoạt khi đổi việc, đổi thành phố hoặc thay đổi quy mô gia đình.",
      "Không gánh rủi ro giá nhà và không khóa phần lớn tài sản vào một tài sản duy nhất.",
      "Không chịu nghĩa vụ trả nợ dài hạn trong giai đoạn thu nhập chưa ổn định.",
    ],
    note:
      "Danh sách này là các yếu tố thường được nhắc đến khi cân nhắc, không phải kết quả nghiên cứu về người mua nhà Việt Nam và không xếp hạng phương án nào tốt hơn.",
  },

  /** Labels for the two-trajectory chart. See `lib/calc/charts/rent-buy-chart.ts`. */
  chart: {
    title: "Chi phí ròng của hai phương án theo thời gian",
    buySeries: "Chi phí ròng nếu mua",
    rentSeries: "Chi phí ròng nếu thuê",
    zeroReference: "Đường 0: chưa mất gì trong mô hình",
    horizonMarker: "Mốc so sánh: tháng {month}",
    breakEvenMarker: "Mua bắt đầu có lợi và giữ được lợi thế: tháng {month}",
    xAxis: "Tháng kể từ khi mua hoặc bắt đầu thuê",
    yAxis: "Chi phí ròng ({unit})",
    summary:
      "Đến tháng {months}, chi phí ròng của mua là {buy} và của thuê là {rent}; phương án {winner} thấp hơn {advantage}.",
    summaryTie:
      "Đến tháng {months}, hai phương án tốn ngang nhau: chi phí ròng của mua là {buy} và của thuê là {rent}. Không phương án nào lợi hơn theo các giả định đang nhập.",
    winnerBuy: "mua",
    winnerRent: "thuê",
    /**
     * `{month}` and `{previous}` substituted.
     *
     * CORRECTED 2026-09-15: this used to add "trước mốc đó thuê đang rẻ hơn",
     * which is an inference about EVERY earlier month that the engine does
     * not make. The backward scan only establishes that the month before the
     * reported one was not ahead; an earlier stretch may have been ahead and
     * lost it. So the sentence claims exactly that one month and sends the
     * reader to the two drawn lines for the rest.
     */
    breakEvenNote:
      "Từ tháng {month}, mua có chi phí ròng thấp hơn và giữ được lợi thế đó đến hết khoảng thời gian bạn chọn; ở tháng {previous} liền trước thì chưa. Những tháng sớm hơn có thể lúc rẻ hơn lúc không — hai đường trên biểu đồ cho thấy đúng diễn biến. Đây là kết luận cho đúng khoảng thời gian này, không phải cho các tháng sau đó.",
    /** Used when the crossing is month 1, where there is no earlier month. */
    breakEvenFirstMonthNote:
      "Ngay từ tháng 1, mua đã có chi phí ròng thấp hơn và giữ được lợi thế đó đến hết khoảng thời gian bạn chọn. Đây là kết luận cho đúng khoảng thời gian này, không phải cho các tháng sau đó.",
    noBreakEvenNote:
      "Không có tháng nào mua rẻ hơn thuê trong khoảng thời gian này.",
    reversedNote:
      "Không có mốc nào mà mua rẻ hơn VÀ giữ được lợi thế đó đến hết khoảng thời gian bạn chọn: mua có rẻ hơn trong quãng từ tháng {first} đến tháng {last}, nhưng đến cuối kỳ thì thuê lại rẻ hơn. Nếu bạn dự định bán trong quãng đó, hãy nhập đúng số tháng ấy vào ô “So sánh trong” rồi đọc lại.",
    /**
     * The shared half of the negative-value note. The side-specific halves
     * below say WHOSE money made it negative.
     *
     * CORRECTED 2026-09-15: one sentence used to attribute every negative
     * value to house-price growth. On a long horizon with a high assumed
     * return the RENTER's line goes negative too, and that is investment
     * gain on their own cash — not an appreciating house they do not own.
     */
    negativeNote:
      "Chi phí ròng âm được vẽ đúng dấu âm chứ không kéo về 0.",
    negativeBuyNote:
      "Phía mua âm nghĩa là phần tăng giá nhà theo giả định đã lớn hơn toàn bộ số tiền người mua bỏ ra.",
    negativeRentNote:
      "Phía thuê âm nghĩa là lãi từ khoản đầu tư theo giả định đã lớn hơn toàn bộ tiền thuê đã trả — đây là tiền của người thuê sinh lời, không liên quan tới giá nhà.",
    assumptions: [
      "Mỗi tháng lấy từ cùng một lịch trả nợ và cùng một phép tính với kết quả ở trên; biểu đồ không tính lại gì.",
      "Mức tăng giá nhà, mức tăng tiền thuê và lợi nhuận đầu tư là giả định của bạn, không phải dự báo.",
      "Tháng 0 là thời điểm mua: phía mua đã mất phí mua và phí bán, phía thuê chưa mất gì.",
      "Cả hai phía đều không đem chênh lệch dòng tiền hằng tháng đi đầu tư — đây là phép so chi phí ròng, không phải dự báo tài sản.",
    ],
    tableCaption: "Chi phí ròng hai phương án tại các mốc chọn lọc",
    tableHint:
      "Cột chênh lệch dương nghĩa là mua đang có lợi ở tháng đó. Khi bật số tiền đầy đủ, vuốt ngang trong bảng để xem đủ các cột.",
    monthColumn: "Tháng",
    buyColumn: "Mua",
    rentColumn: "Thuê",
    advantageColumn: "Chênh lệch",
    unavailableReason: "Chưa đủ dữ liệu hợp lệ để vẽ hai đường chi phí.",
    unavailableRecovery:
      "Kiểm tra giá nhà, tiền trả trước, lãi suất, kỳ hạn, tiền thuê và số tháng so sánh. Nhập lại ô đang báo lỗi để dựng lại biểu đồ.",
  },

  /**
   * Labels for the growth-scenario chart — shared with education article C08.
   *
   * "Dải kịch bản tăng giá, KHÔNG gọi là khoảng tin cậy" is original row 8's
   * own wording, and `scenarioNote` is where that boundary is stated.
   */
  scenarioChart: {
    title: "Kết luận đổi thế nào theo giả định tăng giá nhà",
    scenarioSeries: "Giá nhà {rate}/năm",
    zeroReference: "Đường 0: hai phương án tốn ngang nhau",
    scenarioMarker: "Giá nhà {rate}/năm: mua có lợi từ tháng {month}",
    /**
     * `{rate}` substituted. Only for a scenario where buying is not ahead at
     * ANY month of the horizon.
     *
     * CORRECTED 2026-09-15: this sentence used to be shown for every scenario
     * with no durable crossing, which contradicted the trajectory figure on
     * the same page — the 360-month reversal fixture has buying ahead from
     * month 90 to 302 under the same assumption.
     */
    scenarioNoMarker:
      "Giá nhà {rate}/năm: mua không rẻ hơn ở tháng nào trong khoảng này.",
    /** `{rate}`, `{first}` and `{last}` substituted. */
    scenarioReversedNote:
      "Giá nhà {rate}/năm: mua rẻ hơn trong quãng từ tháng {first} đến tháng {last} rồi bị đảo lại trước cuối kỳ, nên không có mốc bền vững đến hết khoảng thời gian này.",
    xAxis: "Tháng kể từ khi mua hoặc bắt đầu thuê",
    yAxis: "Mua lợi hơn thuê ({unit})",
    summary:
      "Ở tháng {months}, cùng một hộ và cùng một khoảng thời gian, chênh lệch giữa hai phương án chạy từ {lowest} đến {highest} — tức là {spread} chỉ do đổi giả định tăng giá nhà.",
    scenarioNote:
      "Đây là các kịch bản do bạn và trang này đặt ra, không phải dự báo giá nhà và không phải khoảng tin cậy: không kịch bản nào được gán xác suất. Số dương nghĩa là mua có chi phí ròng thấp hơn, số âm nghĩa là thuê thấp hơn.",
    assumptions: [
      "Mỗi đường là đúng một phép so sánh, chỉ khác ô “Giá nhà tăng”; mọi ô khác giữ nguyên như bạn đã nhập.",
      "Không kịch bản nào được coi là khả năng cao hơn kịch bản khác. Nếu kết luận đổi chiều giữa các đường, quyết định của bạn đang dựa vào một điều không thể biết trước.",
      "Giá trị âm được vẽ đúng dấu âm: đó là những tháng thuê đang rẻ hơn.",
    ],
    tableCaption: "Mua lợi hơn thuê bao nhiêu, theo từng giả định tăng giá",
    tableHint:
      "Số dương là mua có lợi, số âm là thuê có lợi. Khi bật số tiền đầy đủ, vuốt ngang trong bảng để xem đủ các cột.",
    monthColumn: "Tháng",
    unavailableReason:
      "Chưa đủ dữ liệu hợp lệ để dựng các kịch bản tăng giá nhà.",
    unavailableRecovery:
      "Kiểm tra các ô đang báo lỗi, đặc biệt là giá nhà, kỳ hạn vay và số tháng so sánh.",
    tooManyReason:
      "Quá nhiều kịch bản để phân biệt được trên cùng một biểu đồ mà không chỉ dựa vào màu.",
    tooManyRecovery: "Giảm xuống tối đa ba kịch bản tăng giá.",
  },

  /**
   * Replaces the text after the shared opening clause of the site-wide
   * disclaimer, for this route only.
   *
   * The shared one says results do not subtract fees or taxes. On this page
   * three fee fields ARE in the result — phí mua một lần, phí khi bán, chi
   * phí sở hữu — so the shared sentence is false here. The mandatory opening
   * clause ("Công cụ này chỉ mang tính minh họa") is preserved verbatim,
   * because `scripts/check-built-markup.mjs` counts it to prove every
   * calculator carries a disclaimer.
   */
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, dựa trên các giả định do bạn tự nhập và giả định lãi suất vay không đổi trong cả kỳ hạn. Những khoản bạn đã nhập — phí mua một lần, phí khi bán, chi phí sở hữu hằng tháng — ĐƯỢC tính vào kết quả; các khoản không có ô để nhập thì không, và kết quả không trừ thuế thu nhập, lạm phát hay chi phí chuyển nhà. Mức tăng giá nhà, mức tăng tiền thuê và lợi nhuận đầu tư là giả định của bạn: đây không phải dự báo giá nhà, không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",

  assumptionNotice:
    "Đây là công cụ nhiều giả định nhất trong bộ này, và kết quả bị chi phối gần như hoàn toàn bởi MỘT ô mà không ai biết chắc: mức tăng giá nhà. Với mặc định — giá nhà tăng 5%/năm, đầu tư sinh lời 6%/năm, so trong 10 năm — mua lợi hơn 1.177.275.554 ₫ và có lợi từ tháng thứ 32. Đổi mức tăng giá nhà thành −3%/năm và kéo dài lên 20 năm thì thuê lợi hơn. Vì vậy đừng đọc con số này như một dự báo: hãy chạy công cụ ba lần với mức tăng giá lạc quan, trung tính và âm, rồi xem kết luận có đổi chiều hay không. Nếu có, thì quyết định của bạn phụ thuộc vào một điều không thể biết trước, và những yếu tố khác — sự ổn định chỗ ở, khả năng chuyển việc, mức chịu đựng dòng tiền — mới nên là yếu tố quyết định.",

  formula: {
    title: "Cách so công bằng",
    body: [
      "Cả hai phương án được quy về CHI PHÍ RÒNG = tổng tiền bỏ ra − giá trị còn lại ở cuối kỳ. Hai bên khởi đầu từ cùng một mức tài sản, nên hiệu số giữa hai chi phí ròng là câu trả lời. Số thấp hơn là phương án lợi hơn.",
      "Phía mua: tiền bỏ ra gồm tiền trả trước, phí mua, toàn bộ các khoản trả nợ và chi phí sở hữu trong kỳ. Giá trị còn lại = giá nhà cuối kỳ − dư nợ − phí khi bán. Điểm quan trọng: phần GỐC trong khoản trả nợ không phải chi phí, nó quay lại thành tài sản của bạn. Chỉ tiền lãi, phí và chi phí sở hữu là tiền đi hẳn. Với mặc định, bỏ ra 3.486.914.548 ₫ nhưng chi phí ròng chỉ 216.701.462 ₫.",
      // CORRECTED 2026-09-15. This said the invested amount equals the
      // buyer's deposit plus fees — which let the rental deposit be held by
      // the landlord AND earn a return at the same time.
      "Phía thuê: tiền bỏ ra gồm tiền thuê tăng dần hằng năm và tiền cọc. Giá trị còn lại = giá trị khoản đầu tư + tiền cọc được trả lại. Hai bên khởi đầu từ cùng một số tiền mặt — bằng tiền trả trước cộng phí mua của phía mua — nhưng người đi thuê phải để một phần làm tiền cọc cho chủ nhà, nên chỉ PHẦN CÒN LẠI được đem đầu tư; tiền cọc không sinh lời trong lúc chủ nhà giữ. Với mặc định, 1 tỷ trừ 30 triệu tiền cọc còn 970 triệu đem đầu tư 6%/năm trong 10 năm sinh lời 767.122.266 ₫, và chi phí ròng của thuê là 2.161.099.282 − 767.122.266 = 1.393.977.016 ₫.",
      "Phí khi bán được tính trên giá nhà CUỐI KỲ, không phải giá mua. Với mặc định, căn nhà 3 tỷ thành 4.886.683.880 ₫ nên phí bán 3% là hơn 146 triệu, không phải 90 triệu.",
      "Điểm hòa vốn là tháng đầu tiên mà mua đã có lợi VÀ giữ được lợi thế đó đến hết khoảng thời gian so sánh. Công cụ dò từ cuối về đầu để không báo một tháng sớm mà sau đó lại bị đảo chiều. Vì vậy ô này để trống có hai nghĩa khác nhau, và trang nói rõ bạn đang ở nghĩa nào: mua không rẻ hơn ở bất kỳ tháng nào, hoặc mua có rẻ hơn trong một quãng giữa kỳ rồi bị đảo lại trước cuối kỳ. Trường hợp thứ hai không phải “mua luôn đắt hơn”, và biểu đồ hai đường cho thấy quãng đó nằm ở đâu.",
      "Một điều công cụ CỐ Ý không làm: nó không giả định bên nào đem chênh lệch dòng tiền hằng tháng đi đầu tư. Cả hai phía đều vậy — người mua không đầu tư phần chênh khi khoản trả nợ nhỏ hơn tiền thuê, và người thuê cũng không đầu tư phần chênh khi tiền thuê nhỏ hơn khoản trả nợ. Đây là một sự đơn giản hóa của mô hình, áp dụng đối xứng cho cả hai bên: nếu chỉ áp cho một bên thì nó âm thầm nghiêng kết quả. Vì vậy đây là phép so CHI PHÍ RÒNG dưới các giả định đã nêu, không phải dự báo tài sản của bạn sau nhiều năm. Nếu bạn thực sự đầu tư phần chênh lệch hằng tháng, kết quả thật sẽ nghiêng về phía có khoản trả hằng tháng thấp hơn.",
    ],
    // The distinction C08 teaches, on the tool itself: a monthly instalment
    // is not a cost, and the verdict is scoped to the chosen horizon.
    emphasis: [
      "phần GỐC trong khoản trả nợ không phải chi phí, nó quay lại thành tài sản của bạn",
      "giữ được lợi thế đó đến hết khoảng thời gian so sánh",
      "không phải dự báo tài sản của bạn sau nhiều năm",
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
        a: "Vì nếu không thuê thì số tiền đó đã nằm trong căn nhà. Người đi thuê giữ được 1 tỷ tiền trả trước và phí mua, trừ phần phải đặt cọc cho chủ nhà, và phần còn lại sinh lời. Bỏ qua khoản này là cách phổ biến nhất khiến các công cụ so sánh kết luận rằng mua luôn tốt hơn. Ô lợi nhuận đầu tư nên nhập ở mức bạn thực sự đạt được: lấy con số trên hợp đồng hoặc biểu lãi suất của nơi bạn đang gửi, chứ đừng nhập mức của thị trường chứng khoán nếu bạn không thực sự đầu tư ở đó. Trang này là trang tĩnh, không kết nối tới biểu lãi suất nào nên không gợi ý một mức nào; hãy thử cả mức 0% để xem kết luận có đổi chiều không.",
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
