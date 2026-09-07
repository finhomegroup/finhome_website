// Copy for /cong-cu/phi-quy-dau-tu/ — the cost of fund fees.
//
// Original FinHome copy.
//
// The page has one job: turn "2% một năm" from a rounding error into a
// number. It does that by running the same plan twice — once at the gross
// return, once net of every charge — and reporting the gap. A single
// "value after fees" figure hides the loss because the reader has nothing to
// compare it against.
//
// Figures quoted are the module's own output for 100 triệu ban đầu, góp
// 5 triệu/tháng trong 240 tháng, lợi nhuận gộp 10%/năm, phí mua 1%, phí quản
// lý 2%/năm: bỏ vào 1.300.000.000 ₫; cuối kỳ 3.197.188.632 ₫ so với
// 4.264.046.135 ₫ nếu không phí → mất 1.066.857.503 ₫, tức 35,99% toàn bộ
// lợi nhuận. Phí quản lý 515.853.900 ₫, phí mua 13.000.000 ₫. Lợi nhuận
// thực tế mỗi năm thấp hơn 1,517 điểm phần trăm.

export const FUND_FEES = {
  slug: "/cong-cu/phi-quy-dau-tu",

  pageTitle: "Phí quỹ đầu tư: 2% một năm lấy đi bao nhiêu?",
  metaTitle: "Tính phí quỹ đầu tư — Phần lợi nhuận bị phí ăn mất",
  metaDescription:
    "Tính số tiền phí quản lý, phí mua và phí bán lấy đi khỏi khoản đầu tư của bạn sau nhiều năm, và bao nhiêu phần trăm lợi nhuận bị mất. Công cụ miễn phí của FinHome.",

  lede:
    "Phí quản lý nghe như một khoản làm tròn và hoạt động như một người góp vốn thứ ba. Lý do là nó tính trên TÀI SẢN, nên nó lấy không chỉ phần lãi năm nay mà cả toàn bộ phần lãi mà số tiền đó lẽ ra còn sinh ra trong những năm sau.",

  form: {
    planGroup: "Kế hoạch đầu tư",
    initialLabel: "Số tiền ban đầu",
    initialUnit: "₫",
    initialHelp: "Khoản đầu tư một lần lúc bắt đầu. Có thể để 0.",
    initialInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultInitial: "100.000.000",

    contributionLabel: "Góp thêm mỗi tháng",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền nộp vào cuối mỗi tháng. Có thể để 0 nếu bạn chỉ đầu tư một lần.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultContribution: "5.000.000",

    monthsLabel: "Thời gian đầu tư",
    monthsHelp: "Số tháng. 20 năm là 240 tháng.",
    monthsInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultMonths: "240",

    grossReturnLabel: "Lợi nhuận trước phí",
    grossReturnUnit: "%/năm",
    grossReturnHelp:
      "Lợi nhuận quỹ đạt được TRƯỚC khi trừ phí. Nếu quỹ công bố lợi nhuận đã trừ phí quản lý thì đừng nhập thêm phí quản lý bên dưới.",
    grossReturnInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultGrossReturn: "10",

    feeGroup: "Biểu phí",
    entryFeeLabel: "Phí mua",
    entryFeeUnit: "% mỗi lần nộp",
    entryFeeHelp:
      "Trừ ngay trên mỗi số tiền bạn nộp vào, gồm cả khoản ban đầu và từng khoản góp thêm.",
    entryFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultEntryFee: "1",

    managementFeeLabel: "Phí quản lý",
    managementFeeUnit: "%/năm tài sản",
    managementFeeHelp:
      "Tính trên giá trị tài sản mỗi năm. Đây là khoản đắt nhất, và cũng là khoản dễ bị coi nhẹ nhất.",
    managementFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultManagementFee: "2",

    exitFeeLabel: "Phí bán",
    exitFeeUnit: "% giá trị cuối kỳ",
    exitFeeHelp:
      "Thu một lần khi bạn rút. Nhiều quỹ giảm dần theo thời gian nắm giữ và miễn sau một thời hạn — nhập 0 nếu bạn giữ đủ lâu để được miễn.",
    exitFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultExitFee: "0",

    resultTitle: "Phí lấy đi bao nhiêu",
    profitLostLabel: "Phần lợi nhuận bị phí ăn mất",
    valueLostLabel: "Số tiền bị mất",
    netValueLabel: "Giá trị cuối kỳ sau phí",

    compareTitle: "So với không có phí",
    grossValueLabel: "Giá trị cuối kỳ nếu không phí",
    contributedLabel: "Tổng số tiền bạn bỏ vào",
    netProfitLabel: "Lợi nhuận sau phí",
    grossProfitLabel: "Lợi nhuận nếu không phí",
    valueLostPercentLabel: "Số tiền mất so với giá trị không phí",

    detailTitle: "Chi tiết phí",
    managementFeesLabel: "Tổng phí quản lý",
    entryFeesLabel: "Tổng phí mua",
    exitFeeResultLabel: "Phí bán",
    totalFeesLabel: "Tổng phí đã trả",
    netAnnualLabel: "Lợi nhuận thực tế mỗi năm",
    grossAnnualLabel: "Lợi nhuận mỗi năm nếu không phí",
    dragLabel: "Chênh lệch",
    pointsUnit: "điểm %",

    noProfitNotice:
      "Không có lợi nhuận trước phí nên không tính được tỷ lệ lợi nhuận bị mất. Các con số phí vẫn đúng — và đây là trường hợp đáng chú ý: phí quản lý vẫn bị thu đầy đủ dù quỹ không sinh lời.",
    nothingInvestedNotice:
      "Cả số tiền ban đầu và khoản góp thêm đều bằng 0, nên không có gì để tính phí trên đó. Hãy nhập một trong hai ô.",
  },

  compoundNotice:
    "Với kế hoạch mặc định — 100 triệu ban đầu, 5 triệu mỗi tháng trong 20 năm, lợi nhuận gộp 10%/năm — phí quản lý 2%/năm cộng phí mua 1% lấy đi 1.066.857.503 ₫. Đó là 35,99% toàn bộ lợi nhuận bạn lẽ ra có được. Không phải 2%, không phải 20%: gần 36%. Lý do là phí tính trên tài sản, nên mỗi đồng phí bị lấy hôm nay cũng lấy theo toàn bộ phần lãi mà nó còn sinh ra trong những năm còn lại. Đây là lý do chênh lệch phí giữa hai quỹ đáng quan tâm hơn chênh lệch lợi nhuận một năm.",

  formula: {
    title: "Cách tính",
    body: [
      "Công cụ chạy đúng một kế hoạch HAI lần: một lần ở lợi nhuận gộp không phí, một lần trừ đủ ba loại phí. Con số đáng đọc là khoảng cách giữa hai kết quả, vì một mình con số “giá trị sau phí” không cho bạn cái gì để so.",
      "Phí mua trừ ngay trên mỗi khoản nộp vào: 1% của 1.300.000.000 ₫ tổng nộp là 13.000.000 ₫. Nhỏ, và nó không phải vấn đề.",
      "Phí quản lý được tính dồn theo tháng lên số dư, với hệ số (1 − phí)^(1/12) mỗi tháng để đủ 12 tháng đúng bằng mức phí năm. Với mặc định, tổng phí quản lý trong 20 năm là 515.853.900 ₫ — gấp gần 40 lần phí mua.",
      "Nhưng 515.853.900 ₫ phí quản lý lại làm mất 1.066.857.503 ₫ giá trị. Phần chênh là lãi kép trên số phí đã bị lấy: mỗi đồng phí trả năm thứ nhất còn mất thêm 19 năm sinh lãi. Đây là toàn bộ nội dung của trang này.",
      "Lợi nhuận thực tế mỗi năm là mức lãi kép biến tổng số tiền bạn bỏ vào thành giá trị cuối kỳ. Với mặc định, phí làm nó thấp hơn 1,517 điểm phần trăm so với trường hợp không phí — nghe nhỏ hơn con số 2% vì phần lớn tiền được nộp vào muộn nên chưa chịu phí đủ 20 năm.",
      "Khoản góp của mỗi tháng được nộp vào CUỐI tháng và chưa chịu phí quản lý trong tháng đó, vì nó chưa được đầu tư. Cách này khớp với công cụ mục tiêu tiết kiệm, nên hai công cụ cho cùng kết quả ở trường hợp không phí.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lợi nhuận quỹ công bố là trước hay sau phí?",
        a: "Hầu hết quỹ mở tại Việt Nam công bố lợi nhuận theo giá trị tài sản ròng, tức ĐÃ trừ phí quản lý nhưng CHƯA trừ phí mua và phí bán. Nếu bạn nhập con số đó vào ô lợi nhuận trước phí rồi lại nhập phí quản lý, bạn đang trừ hai lần. Cách dùng đúng: nhập lợi nhuận đã công bố và để ô phí quản lý bằng 0, hoặc cộng lại phí quản lý vào lợi nhuận công bố rồi nhập cả hai.",
      },
      {
        q: "Phí bao nhiêu là hợp lý?",
        a: "Quỹ cổ phiếu chủ động tại Việt Nam thường thu 1,5–2,5%/năm phí quản lý; quỹ trái phiếu thấp hơn, khoảng 0,5–1,2%; quỹ ETF mô phỏng chỉ số thấp nhất, thường dưới 0,8%. Hãy thử nhập 2% rồi 0,8% vào công cụ với cùng kế hoạch — chênh lệch trong 20 năm thường vượt vài trăm triệu, và đó là khoản duy nhất bạn kiểm soát được, khác với lợi nhuận.",
      },
      {
        q: "Vì sao phí quản lý 515 triệu lại làm mất hơn 1 tỷ?",
        a: "Vì mỗi đồng phí bị lấy đi không chỉ mất đồng đó mà mất cả phần lãi nó còn sinh ra trong những năm còn lại. Một đồng phí trả ở năm thứ nhất, nếu được giữ lại và sinh lãi 10%/năm trong 19 năm, sẽ thành hơn 6 đồng. Cộng dồn qua 240 tháng thì tổng thiệt hại gấp khoảng đôi số phí đã nộp.",
      },
      {
        q: "Phí bán có tránh được không?",
        a: "Thường là có, nếu bạn giữ đủ lâu. Nhiều quỹ mở tại Việt Nam áp phí bán giảm dần theo thời gian nắm giữ và miễn sau 12–24 tháng. Nếu bạn đầu tư dài hạn thì để ô này bằng 0 là hợp lý. Nếu bạn có khả năng phải rút sớm, hãy nhập mức phí của năm đầu để thấy nó tốn bao nhiêu.",
      },
      {
        q: "Còn phí giao dịch và thuế thì sao?",
        a: "Không nằm trong phép tính này. Với quỹ mở, phí giao dịch bên trong quỹ đã nằm trong lợi nhuận công bố. Với thuế, cá nhân bán chứng chỉ quỹ chịu thuế thu nhập cá nhân theo tỷ lệ trên giá trị bán tương tự cổ phiếu — hãy dùng công cụ lợi nhuận cổ phiếu của FinHome cho phần đó.",
      },
    ],
  },
} as const;
