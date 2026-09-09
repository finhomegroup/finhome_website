// Copy for /cong-cu/ira-truyen-thong-hay-roth/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Contribution limits come from lib/calc/us-retirement-limits.ts. Do not
// restate one as a literal here.
//
// Figures quoted are computeUsIra's output, verified by running it on this
// page's own defaults (2026; 35 tuổi; góp 7.500 USD mỗi năm trong 30 năm;
// thuế suất biên hôm nay 24%, khi rút 22%; lợi suất 7%; thuế lãi vốn 15%):
//   Tổng góp 225.000 USD; hệ số tích lũy 101,0730; số dư trước thuế
//     758.048 USD — giống nhau ở cả hai loại tài khoản
//   Chi phí thực mỗi năm: truyền thống 5.700,00 (hoàn thuế 1.800,00),
//     Roth 7.500,00 — hai vế bằng nhau sau khi cộng phần hoàn thuế
//   Truyền thống: 758.048 trừ 166.771 thuế khi rút = 591.277
//     cộng tài khoản thường 162.742 (đã góp 54.000, lãi 127.931,
//     thuế lãi vốn 19.190) = 754.019
//   Roth: 758.048 — hơn 4.029 USD, DÙ thuế suất khi rút thấp hơn hôm nay
//   Thuế suất hoàn vốn 21,47%, tức thấp hơn mức 24% hôm nay 2,53 điểm
//   Nếu thuế lãi vốn bằng 0 và thuế suất không đổi: chênh lệch đúng bằng 0
//     và thuế suất hoàn vốn đúng bằng 24,00%
//   Khung so sánh "cùng số tiền góp": Roth hơn 166.771 USD — đúng bằng
//     tiền thuế khi rút — nhưng tốn thêm 1.800,00 USD mỗi năm, và
//     7.500 USD tiền Roth tương đương khoản góp trước thuế 9.868,42 USD
//   Thuế suất khi rút 12%: truyền thống thắng 71.776 USD
//   Thuế suất khi rút 21%: chênh lệch 3.552 USD, trong dải "ngang nhau"
//   Trần góp tuổi 50: 8.600 USD

export const US_IRA = {
  slug: "/cong-cu/ira-truyen-thong-hay-roth",

  pageTitle: "IRA truyền thống hay Roth",
  metaTitle: "IRA truyền thống hay Roth — So sánh trên cùng một chi phí sau thuế",
  metaDescription:
    "So sánh IRA truyền thống với Roth trên cùng một chi phí sau thuế, kèm tài khoản thường cho phần hoàn thuế, và tính mức thuế suất khi rút làm hai phương án ngang nhau. Công cụ miễn phí của FinHome.",

  lede:
    "Góp 7.500 USD vào IRA truyền thống và góp 7.500 USD vào Roth không phải hai giao dịch giống nhau: khoản đầu được trừ thuế nên nó tốn ít tiền lương về nhà hơn. Đặt hai con số đó cạnh nhau là so sánh hai lượng tiền khác nhau — và luôn kết luận Roth thắng, vì bên đó đã bỏ vào nhiều hơn. Trang này cân bằng hai vế trước khi so.",

  form: {
    contributionGroup: "Khoản góp",
    yearLabel: "Năm áp dụng",
    yearHelp: "Trần góp IRA thay đổi hằng năm.",
    ageLabel: "Tuổi hiện tại",
    ageUnit: "tuổi",
    ageHelp: "Từ 50 tuổi có thêm phần bù. IRA không có khung 60–63 như 401(k).",
    contributionLabel: "Góp mỗi năm",
    contributionUnit: "USD",
    contributionHelp:
      "Số tiền vào tài khoản mỗi năm. Với Roth đây là tiền sau thuế; với truyền thống đây là tiền trước thuế.",
    yearsLabel: "Số năm góp",
    yearsUnit: "năm",
    yearsHelp: "Cũng là thời gian tiền nằm trong tài khoản trước khi rút.",

    taxGroup: "Thuế suất",
    currentRateLabel: "Thuế suất biên hôm nay",
    currentRateUnit: "%",
    currentRateHelp:
      "Thuế suất áp lên đồng thu nhập kế tiếp của bạn: 10, 12, 22, 24, 32, 35 hoặc 37%, cộng thuế tiểu bang nếu có.",
    retirementRateLabel: "Thuế suất biên dự kiến khi rút",
    retirementRateUnit: "%",
    retirementRateHelp:
      "Đây là biến quyết định toàn bộ kết quả, và nó là một phỏng đoán về tương lai vài chục năm. Bảng bên dưới cho thấy kết quả ở mọi mức, nên hãy dùng bảng thay vì tin vào một con số.",
    capitalGainsLabel: "Thuế lãi vốn dài hạn",
    capitalGainsUnit: "%",
    capitalGainsHelp:
      "Áp cho tài khoản thường nơi phần hoàn thuế được đầu tư. Ba mức theo luật là 0, 15 và 20%.",

    returnGroup: "Lợi suất",
    returnLabel: "Lợi suất kỳ vọng",
    returnUnit: "%/năm",
    returnHelp: "Giống nhau ở cả ba tài khoản, vì loại tài khoản không làm thay đổi tài sản bên trong.",

    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    yearsInvalid: "Vui lòng nhập một số năm nguyên từ 0 đến 70.",

    defaults: {
      year: "2026",
      age: "35",
      contribution: "7.500",
      years: "30",
      currentRate: "24",
      retirementRate: "22",
      capitalGains: "15",
      returnPercent: "7",
    },

    resultTitle: "Kết quả",
    verdictLabel: "Nên chọn",
    verdictRoth: "Roth",
    verdictTraditional: "Truyền thống",
    verdictEqual: "Ngang nhau",
    differenceLabel: "Roth hơn truyền thống",
    breakEvenLabel: "Thuế suất khi rút làm hai bên ngang nhau",
    balanceLabel: "Số dư trước thuế, cả hai loại",

    equalCostTitle: "So sánh trên cùng chi phí sau thuế",
    rothAfterTaxLabel: "Roth, sau thuế",
    traditionalAfterTaxLabel: "Truyền thống, sau thuế khi rút",
    sideAccountLabel: "Cộng tài khoản thường của phần hoàn thuế",
    traditionalTotalLabel: "Tổng phương án truyền thống",
    netCostLabel: "Chi phí thực mỗi năm, cả hai bên",

    sameContribTitle: "Nếu không đầu tư phần hoàn thuế",
    sameContribAdvantageLabel: "Roth hơn bao nhiêu",
    withdrawalTaxLabel: "Thuế phải trả khi rút",
    extraCostLabel: "Nhưng Roth tốn thêm mỗi năm",
    preTaxEquivalentLabel: "Khoản góp Roth quy về trước thuế",

    detailTitle: "Chi tiết",
    limitLabel: "Trần góp IRA",
    catchUpLabel: "Phần bù tuổi trong trần đó",
    excessLabel: "Vượt trần",
    totalContributedLabel: "Tổng đã góp",
    sideContributedLabel: "Phần hoàn thuế đã đầu tư",
    sideTaxLabel: "Thuế lãi vốn của tài khoản thường",

    table: {
      caption: "Kết quả theo thuế suất khi rút",
      rateColumn: "Thuế suất khi rút",
      traditionalColumn: "Truyền thống, tổng",
      rothColumn: "Roth",
      differenceColumn: "Roth hơn",
      verdictColumn: "Kết luận",
      intro:
        "Đây là bảng nên dùng thay cho một con số duy nhất. Toàn bộ quyết định nằm ở một dòng của bảng này, và bạn không biết mình sẽ ở dòng nào trong ba mươi năm nữa — nên câu hỏi thực tế không phải “bên nào thắng” mà “tôi sai bao nhiêu nếu chọn sai”.",
    },

    excessNotice:
      "Khoản góp vượt trần IRA của năm. Phần vượt bị tính phạt 6% mỗi năm cho đến khi được rút ra, nên hãy giảm khoản góp hoặc rút phần vượt trước thời hạn khai thuế.",
    deductibilityNotice:
      "Công cụ giả định khoản góp truyền thống của bạn ĐƯỢC trừ thuế toàn bộ và bạn đủ điều kiện góp Roth. Cả hai điều đó phụ thuộc thu nhập, và với khoản góp truyền thống còn phụ thuộc việc bạn có được một kế hoạch hưu trí tại nơi làm việc bao phủ hay không. Các ngưỡng thu nhập này được điều chỉnh theo lạm phát mỗi năm; công cụ cố ý không cài cứng chúng, vì một bảng ngưỡng cũ một năm sẽ cho kết quả sai chắc nịch ở đúng những mức thu nhập nằm sát ranh giới. Hãy tra ngưỡng của năm thuế hiện hành trước khi dùng kết quả này.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, hoặc năm bạn chọn chưa có số liệu trong công cụ.",
  },

  equalCostNotice:
    "Với các giá trị mặc định, thuế suất khi rút được đặt ở 22% — THẤP HƠN mức 24% hôm nay — và Roth vẫn thắng, hơn 4.029 USD. Lý do là mức hoàn vốn không nằm ở 24% mà ở 21,47%: phần hoàn thuế của phương án truyền thống phải nằm trong một tài khoản thường và chịu thuế lãi vốn, nên nó không theo kịp. Nói cách khác, để phương án truyền thống thắng thì thuế suất khi rút của bạn phải thấp hơn mức hôm nay ít nhất 2,53 điểm phần trăm, chứ không chỉ “thấp hơn”. Nếu bạn không đầu tư phần hoàn thuế mà tiêu nó, phương án truyền thống mất luôn phần bù đó và khoảng cách rộng ra rất nhiều.",

  formula: {
    title: "Cách tính",
    body: [
      "Cả hai loại tài khoản đều đạt cùng một số dư trước thuế, vì loại tài khoản không làm thay đổi tài sản nằm trong nó. Khác biệt duy nhất là thuế được thu ở đầu nào: truyền thống trừ thuế lúc góp và thu thuế lúc rút, Roth thì ngược lại.",
      "Vì thế phép so sánh phải bắt đầu từ hai vế có cùng số tiền. Góp 7.500 USD vào tài khoản truyền thống chỉ tốn 5.700 USD tiền lương về nhà ở thuế suất 24%, còn góp 7.500 USD vào Roth tốn đúng 7.500 USD. Công cụ cân bằng bằng cách cho người chọn truyền thống đầu tư 1.800 USD tiền hoàn thuế mỗi năm vào một tài khoản thường — và bộ kiểm thử chốt đúng đẳng thức đó ở mọi thuế suất, vì đây chính là loại lỗi từng làm một trang khác trong bộ công cụ này kết luận sai: nó tính khoản trả trước của người mua nhà vào một bên mà không tính vào bên kia.",
      "Sau khi cân bằng, câu trả lời rút gọn thành một câu hỏi duy nhất: thuế suất biên của bạn khi rút cao hơn hay thấp hơn hôm nay. Nếu tài khoản thường không phải nộp thuế lãi vốn thì mức hoàn vốn đúng bằng thuế suất hôm nay, và hai loại tài khoản giống nhau về mặt đại số — một sự thật đáng biết, vì nó cho thấy mọi tranh luận về “Roth tốt hơn” đều thực chất là tranh luận về thuế suất tương lai.",
      "Nhưng tài khoản thường CÓ phải nộp thuế lãi vốn, nên phần hoàn thuế của phương án truyền thống bị hụt đi. Điều đó kéo mức hoàn vốn xuống dưới thuế suất hôm nay: 21,47% so với 24% với các giá trị mặc định. Công cụ tính mức hoàn vốn từ chính các con số tiền của nó — phần tài khoản thường sau thuế chia cho số dư trước thuế — chứ không đánh giá lại một công thức riêng, để hai thứ không thể lệch nhau.",
      "Khung so sánh thứ hai là khung của đời thực: phần lớn người ta không đầu tư phần hoàn thuế mà góp tối đa vào một trong hai loại. Trong khung đó, Roth hơn đúng bằng số tiền thuế khi rút — nhưng không phải vì tài khoản Roth tốt hơn, mà vì cùng một con số 7.500 USD tiền Roth là một khoản góp LỚN HƠN: nó tương đương 9.868,42 USD tiền trước thuế. Đó là một lợi thế thật của Roth khi bạn đang góp ở mức trần, và nó không liên quan gì đến thuế suất.",
      "Kết luận “ngang nhau” dùng một dải bằng nửa phần trăm số dư Roth, không phải một phép so sánh bằng nhau. Hai lý do: so hai số thực bằng “===” thì kết luận đó không bao giờ xảy ra được — đúng lỗi đã có trong module định giá cổ tức của bộ công cụ này — và quan trọng hơn, đầu vào là một phỏng đoán về thuế suất của vài chục năm sau, nên chênh lệch một phần tư phần trăm không phải một khác biệt.",
      "Tài khoản thường được tính thuế một lần, trên phần lãi, ở cuối kỳ. Một tài khoản thường thật còn phải nộp thuế cổ tức mỗi năm, nên cách tính này có lợi cho phương án truyền thống. Chúng tôi ghi rõ điều đó ở đây chứ không ẩn đi, vì chiều của phần đơn giản hóa mới là điều đáng quan tâm.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Thuế suất khi rút của tôi sẽ cao hay thấp hơn hôm nay?",
        a: "Không ai biết, và đó là lý do trang này có một cái bảng thay vì một câu trả lời. Có vài lực đẩy theo hai chiều. Đẩy xuống: khi nghỉ hưu bạn không còn tiền lương, nên nếu chỉ sống bằng khoản rút thì thu nhập chịu thuế thường thấp hơn lúc đang làm việc. Đẩy lên: mức rút tối thiểu bắt buộc có thể ép bạn rút nhiều hơn mình cần, phần an sinh xã hội có thể bị tính vào thu nhập chịu thuế, và bản thân thang thuế suất là do luật quy định nên nó có thể đổi. Cách dùng hợp lý nhất là đọc dòng “tôi sai bao nhiêu nếu chọn sai” trong bảng: với các giá trị mặc định, chọn sai chỉ tốn khoảng 4.000 USD nếu thuế suất đúng là 22%, nhưng tốn hơn 70.000 USD nếu nó là 12%.",
      },
      {
        q: "Vậy có nên chia đôi giữa hai loại không?",
        a: "Đó là câu trả lời phổ biến và nó có cơ sở, dù không phải vì lý do người ta thường nêu. Chia đôi không làm tăng kết quả kỳ vọng — nếu bạn tin thuế suất tương lai sẽ thấp hơn thì truyền thống vẫn tốt hơn cho từng đồng. Điều nó làm là giảm hậu quả của việc đoán sai, và tạo ra một thứ có giá trị khi nghỉ hưu: hai loại tiền chịu thuế khác nhau để rút, cho phép bạn điều tiết thu nhập chịu thuế theo từng năm — rút từ Roth trong năm cần một khoản lớn để không bị đẩy lên bậc thuế cao hơn. Không có công cụ nào trong bộ này mô hình hóa việc điều tiết đó, nhưng nó là lý do thật để giữ cả hai.",
      },
      {
        q: "Roth có ưu điểm nào không liên quan đến thuế suất?",
        a: "Có, ba điểm. Thứ nhất, ở mức trần góp, Roth cho phép cất giữ nhiều hơn: 7.500 USD tiền sau thuế tương đương 9.868,42 USD tiền trước thuế ở thuế suất 24%, nên với người tối đa hóa khoản góp thì Roth là tài khoản lớn hơn. Thứ hai, Roth IRA không có mức rút tối thiểu bắt buộc khi còn sống, nên tiền có thể ở lại tài khoản không chịu thuế lâu hơn — trang mức rút tối thiểu bắt buộc trong bộ công cụ này nói riêng về phần đó. Thứ ba, phần tiền gốc bạn đã góp vào Roth có thể rút ra bất cứ lúc nào mà không chịu thuế hay phạt, nên nó linh hoạt hơn hẳn trong trường hợp bất trắc. Cả ba đều nằm ngoài phép tính trên trang này.",
      },
      {
        q: "Vì sao cần tài khoản thường trong phép so sánh?",
        a: "Vì nếu không có nó, hai vế không có cùng số tiền. Người góp 7.500 USD vào tài khoản truyền thống ở thuế suất 24% vẫn còn 1.800 USD trong tay so với người góp 7.500 USD vào Roth. Bỏ qua 1.800 USD đó là tặng không cho phía Roth, đúng kiểu lỗi mà bộ công cụ này từng gặp ở trang thuê hay mua nhà: khoản trả trước được tính vào một bên mà không tính vào bên kia, và kết luận nghiêng hẳn về một phía. Nếu trên thực tế bạn sẽ tiêu phần hoàn thuế chứ không đầu tư nó, thì khung so sánh thứ hai trên trang mới là khung của bạn — và trong khung đó Roth thắng đậm.",
      },
      {
        q: "Thu nhập của tôi quá cao để góp Roth thì sao?",
        a: "Quyền được góp trực tiếp vào Roth IRA giảm dần rồi mất hẳn theo thu nhập, còn quyền được TRỪ THUẾ cho khoản góp truyền thống cũng giảm dần nếu bạn được một kế hoạch hưu trí ở nơi làm việc bao phủ. Các ngưỡng đó thay đổi hằng năm nên công cụ không cài cứng chúng — hãy tra ngưỡng của năm hiện hành. Khi vượt ngưỡng, hai hướng thường được dùng là góp vào 401(k) tại nơi làm việc, nơi không có ngưỡng thu nhập nào, hoặc góp một khoản không được trừ thuế vào IRA truyền thống rồi chuyển đổi sang Roth. Hướng thứ hai có những hệ quả về thuế mà công cụ này không tính, đặc biệt nếu bạn đã có tiền trước thuế trong IRA.",
      },
    ],
  },
} as const;
