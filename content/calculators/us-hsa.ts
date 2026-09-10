// Copy for /cong-cu/tai-khoan-tiet-kiem-y-te-hoa-ky/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true.
//
// Figures quoted are computeUsHsa's output, verified by running it
// (2026, gia đình, 40 tuổi cuối năm, đủ điều kiện 12 tháng, tự góp 6.750 +
// chủ góp 2.000, liên bang 24%, bang 5%, lương 100.000, qua Section 125,
// dư 10.000, lợi suất 7%, 20 năm):
//   Trần 8.750 — hai nguồn cộng lại vừa đủ, còn trống 0
//   Thuế thu nhập tiết kiệm 1.957,50 + FICA 516,375 = 2.473,875 USD
//   Nên 6.750 vào tài khoản chỉ tốn 4.276,125 USD tiền thật
//   Sau 20 năm: 422.517,14 USD, trong đó 237.517,14 là lãi
//     (lãi LỚN HƠN tổng số đã góp 175.000)
//   Rút phi y tế ở tuổi 60: mất 49% (29% thuế + 20% phạt)
//
// Limits are transcribed and sit in one dated table; an unknown year returns
// null. See docs/calculator-suite-status.md §8.

export const US_HSA = {
  slug: "/cong-cu/tai-khoan-tiet-kiem-y-te-hoa-ky",

  pageTitle: "Tài khoản tiết kiệm y tế Hoa Kỳ (HSA)",
  metaTitle: "Tài khoản tiết kiệm y tế HSA — Ba lớp ưu đãi thuế và lớp thứ tư",
  metaDescription:
    "Tính trần góp, thuế tiết kiệm và giá trị tích lũy của tài khoản HSA. Kèm phần tiết kiệm FICA mà hầu hết bài viết bỏ qua. Công cụ miễn phí của FinHome.",

  lede:
    "HSA là tài khoản duy nhất trong luật thuế Hoa Kỳ có ba lớp ưu đãi cùng lúc: góp vào được khấu trừ, tăng trưởng không bị đánh thuế, rút ra cho chi phí y tế cũng không bị đánh thuế. Nhưng có một lớp thứ tư hầu như luôn bị bỏ qua — và với người thu nhập thấp thì nó là lớp lớn nhất.",

  form: {
    accountGroup: "Tài khoản",
    yearLabel: "Năm thuế",
    yearHelp: "Trần góp thay đổi mỗi năm.",

    coverageLabel: "Loại bảo hiểm",
    coverageHelp: "Trần góp của bảo hiểm gia đình cao gần gấp đôi.",
    coverageOptions: {
      selfOnly: "Chỉ cá nhân",
      family: "Gia đình",
    },

    ageLabel: "Tuổi vào cuối năm thuế",
    ageUnit: "tuổi",
    ageHelp: "Nếu đủ 55 tuổi vào cuối năm, bạn có thể được góp thêm 1.000 USD.",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",

    eligibleMonthsLabel: "Số tháng đủ điều kiện HSA",
    eligibleMonthsUnit: "tháng",
    eligibleMonthsHelp:
      "Đếm tháng bạn đủ điều kiện vào ngày đầu tháng: có HDHP, không có bảo hiểm cấm kèm, chưa vào Medicare và không là người phụ thuộc.",
    eligibleMonthsInvalid:
      "Nhập số nguyên từ 0 đến 12. Muốn dùng quy tắc tháng cuối thì phải có ít nhất một tháng đủ điều kiện.",

    lastMonthLabel: "Áp dụng quy tắc tháng cuối",
    lastMonthHelp:
      "Chỉ chọn Có nếu bạn đủ điều kiện ngày 1/12 và sẽ duy trì đủ điều kiện hết thời gian kiểm tra đến 31/12 năm sau.",
    lastMonthOptions: {
      no: "Không — tính theo số tháng thực tế",
      yes: "Có — đủ điều kiện ngày 1/12",
    },

    contributionGroup: "Số tiền góp",
    contributionLabel: "Bạn tự góp trong năm",
    contributionUnit: "USD",
    contributionHelp: "Phần bạn góp, chưa tính phần chủ lao động góp.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    employerLabel: "Chủ lao động góp",
    employerUnit: "USD",
    employerHelp:
      "Tính vào CÙNG MỘT trần với phần bạn góp, không phải một trần riêng.",
    employerInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    payrollLabel: "Góp qua bảng lương",
    payrollHelp:
      "Chỉ khoản giảm lương qua Section 125 cafeteria plan mới tránh FICA. Mức tiết kiệm phụ thuộc lương và các ngưỡng Social Security/Medicare.",
    payrollOptions: {
      yes: "Có, qua Section 125 cafeteria plan",
      no: "Không, tôi tự chuyển tiền vào",
    },

    wagesLabel: "Lương FICA trước khoản góp HSA",
    wagesUnit: "USD/năm",
    wagesHelp:
      "Dùng để tính phần FICA thực sự tránh được sau trần Social Security và ngưỡng Additional Medicare.",
    wagesInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    statusLabel: "Tình trạng khai thuế",
    statusHelp: "Quyết định ngưỡng Additional Medicare 0,9%.",
    statusOptions: {
      single: "Độc thân",
      married: "Vợ chồng khai chung",
      marriedSeparate: "Vợ chồng khai riêng",
      head: "Chủ hộ",
    },

    taxGroup: "Thuế",
    federalLabel: "Thuế suất liên bang biên",
    federalUnit: "%",
    federalHelp: "10, 12, 22, 24, 32, 35 hoặc 37%.",
    federalInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    stateLabel: "Thuế suất thu nhập bang",
    stateUnit: "%",
    stateHelp:
      "Đa số bang theo cách xử lý của liên bang. Một vài bang không cho khấu trừ khoản góp HSA — hãy nhập 0 nếu bang của bạn không cho.",
    stateInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    projectionGroup: "Dự phóng",
    balanceLabel: "Số dư hiện có",
    balanceUnit: "USD",
    balanceHelp: "Số dư đang có trong tài khoản.",
    balanceInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    returnLabel: "Lợi suất đầu tư kỳ vọng",
    returnUnit: "%/năm",
    returnHelp:
      "Chỉ có ý nghĩa nếu bạn thực sự đầu tư số dư. Nhiều tài khoản HSA để tiền ở dạng tiền gửi lãi rất thấp.",
    returnInvalid: "Vui lòng nhập một số từ −100 đến 100.",

    yearsLabel: "Số năm giữ",
    yearsUnit: "năm",
    yearsHelp: "Số năm tiếp tục góp và để tiền tăng trưởng. Từ 0 đến 70.",
    yearsInvalid: "Vui lòng nhập một số nguyên từ 0 đến 70.",

    defaults: {
      year: "2026",
      coverage: "family",
      age: "40",
      eligibleMonths: "12",
      lastMonth: "no",
      contribution: "6.750",
      employer: "2.000",
      payroll: "yes",
      wages: "100.000",
      status: "single",
      federal: "24",
      state: "5",
      balance: "10.000",
      return: "7",
      years: "20",
    },

    resultTitle: "Tiết kiệm thuế năm nay",
    totalSavedLabel: "Tổng thuế tiết kiệm",
    netCostLabel: "Số tiền thật bạn bỏ ra",
    incomeTaxSavedLabel: "Thuế thu nhập tiết kiệm",
    ficaSavedLabel: "FICA tiết kiệm (chỉ khi góp qua bảng lương)",

    limitTitle: "Trần góp",
    fullYearBaseLimitLabel: "Trần cơ bản đủ cả năm",
    baseLimitLabel: "Trần cơ bản được phép",
    catchUpLabel: "Được góp thêm do tuổi",
    totalLimitLabel: "Tổng trần",
    totalContributionLabel: "Tổng đã góp (bạn + chủ lao động)",
    remainingRoomLabel: "Còn trống",
    excessLabel: "Vượt trần",

    projectionTitle: "Sau kỳ dự phóng",
    projectedBalanceLabel: "Số dư dự kiến",
    totalContributedLabel: "Tổng đã góp cả kỳ",
    growthLabel: "Phần tăng trưởng",
    taxOnGrowthLabel: "Thuế mà phần tăng trưởng sẽ phải nộp ở tài khoản thường",

    withdrawalTitle: "Khi rút ra",
    medicalLabel: "Rút cho chi phí y tế — thuế phải nộp",
    nonMedicalTaxLabel: "Rút cho việc khác — thuế thu nhập",
    nonMedicalPenaltyLabel: "Rút cho việc khác — tiền phạt 20%",
    nonMedicalNetLabel: "Rút cho việc khác — còn lại",
    ageAtHorizonLabel: "Tuổi tại thời điểm rút",

    excessNotice:
      "Tổng số đã góp VƯỢT trần. Đây là lỗi phổ biến nhất với tài khoản HSA: phần chủ lao động góp tính vào cùng một trần chứ không phải một trần riêng, nên nhiều người vượt trần mà không biết. Phần vượt trần không được khấu trừ và còn bị phạt 6% mỗi năm nếu không rút ra trước hạn khai thuế. Công cụ chỉ tính phần thuế tiết kiệm trên số nằm trong trần.",
    penaltyNotice:
      "Ở tuổi rút này, khoản rút không dùng cho chi phí y tế vừa chịu thuế thu nhập vừa bị phạt 20%. Từ 65 tuổi, phần phạt biến mất và tài khoản hoạt động như một IRA truyền thống cho mọi mục đích — vẫn tốt hơn cho chi phí y tế, vì phần đó không chịu thuế ở bất kỳ tuổi nào.",
    noPenaltyNotice:
      "Từ 65 tuổi, khoản rút cho mục đích khác không còn bị phạt 20%, chỉ chịu thuế thu nhập như một IRA truyền thống. Còn khoản rút cho chi phí y tế thì không chịu thuế ở bất kỳ tuổi nào — kể cả sau 65.",
    chequeNotice:
      "Bạn đang chọn tự chuyển tiền vào thay vì giảm lương qua Section 125 cafeteria plan. Cách này vẫn có thể được khấu trừ thuế thu nhập nhưng không tránh FICA. Hãy xác nhận cơ chế của chủ lao động: một khoản khấu trừ lương thông thường không tự động được miễn FICA.",
    lastMonthNotice:
      "Công cụ đang cho phép toàn bộ trần năm theo quy tắc tháng cuối. Bạn phải đủ điều kiện vào ngày 1/12 và tiếp tục đủ điều kiện đến hết ngày 31/12 năm sau; nếu không, phần góp thêm nhờ quy tắc này có thể bị tính vào thu nhập và chịu thuế bổ sung 10%.",
    proratedNotice:
      "Trần góp đã được phân bổ theo số tháng đủ điều kiện. Nếu loại bảo hiểm thay đổi giữa các tháng, hãy dùng worksheet của Form 8889 vì một loại bảo hiểm duy nhất không mô tả đủ trường hợp đó.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Kiểm tra tuổi, số tháng đủ điều kiện, mức lương, số năm và các thuế suất.",
  },

  ficaNotice:
    "Lớp ưu đãi thứ tư: khoản góp HSA bằng giảm lương qua Section 125 cafeteria plan còn tránh được FICA, điều mà khoản góp 401(k) hay IRA không có. Với lương mặc định 100.000 USD — dưới trần Social Security và ngưỡng Additional Medicare — mức tránh được là đủ 7,65%, tức 516,375 USD. Nhưng đây không phải tỷ lệ cố định: phần lương đã vượt trần Social Security không còn tiết kiệm 6,2%, và quanh ngưỡng Additional Medicare còn có tác động của phụ thu 0,9%. Công cụ tính bằng chênh lệch giữa hai hóa đơn FICA thay vì nhân cứng 7,65%.",

  formula: {
    title: "Cách tính",
    body: [
      "Trần góp áp cho tổng mọi nguồn: phần bạn góp cộng phần chủ lao động góp. Nếu không đủ điều kiện cả năm, trần được tính theo từng tháng bạn đủ điều kiện vào ngày đầu tháng. Quy tắc tháng cuối có thể cho toàn bộ trần nếu đủ điều kiện ngày 1/12, nhưng đi kèm thời gian kiểm tra đến hết năm sau.",
      "Nếu đủ 55 tuổi vào cuối năm thuế, bạn được góp thêm 1.000 USD; khoản này cũng phân bổ theo tháng nếu không dùng quy tắc tháng cuối. Con số 1.000 USD ấn định trong luật và không điều chỉnh theo lạm phát.",
      "Lớp ưu đãi thứ nhất là khấu trừ khi góp vào. Nếu khoản giảm lương đi qua Section 125 cafeteria plan, nó còn được loại khỏi lương chịu FICA. Công cụ tính lại Social Security, Medicare và Additional Medicare trước và sau khoản góp, nên mức tiết kiệm phản ánh đúng các ngưỡng thay vì luôn dùng 7,65%.",
      "Lớp thứ hai là tăng trưởng không chịu thuế. Công cụ hiển thị số thuế mà phần tăng trưởng đó sẽ phải nộp ở một tài khoản thường, để bạn thấy lớp này đáng bao nhiêu qua kỳ dự phóng.",
      "Lớp thứ ba là rút ra cho chi phí y tế không chịu thuế, ở bất kỳ tuổi nào. Rút cho mục đích khác trước 65 tuổi thì vừa chịu thuế thu nhập vừa bị phạt 20%. Từ 65 tuổi, phần phạt biến mất và tài khoản hoạt động như một IRA truyền thống cho mục đích khác.",
      "Công cụ cố ý tách riêng hai trường hợp rút thay vì trộn thành một con số “dự kiến”. Tỷ lệ giữa chi phí y tế và chi tiêu khác là thông tin chỉ bạn có, và nếu tự đặt một tỷ lệ giả định thì mức phạt 20% sẽ bị hòa tan vào một con số bình quân — đúng chỗ mà người đọc cần thấy rõ nhất.",
      "Khoản góp được tính vào đầu mỗi năm nên năm đầu tiên đã có đủ một năm tăng trưởng. Với các số mặc định, sau 20 năm phần tăng trưởng 237.517 USD còn lớn hơn tổng số đã góp 175.000 USD — đó là lý do nên xem HSA như một tài khoản đầu tư dài hạn chứ không phải một ví tiền chi phí y tế.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao góp qua bảng lương lại tốt hơn tự chuyển tiền?",
        a: "Chỉ khoản giảm lương qua Section 125 cafeteria plan mới tránh FICA. Nếu tự chuyển tiền rồi khai khấu trừ, bạn vẫn có thể được khấu trừ thuế thu nhập nhưng không lấy lại FICA. Với mặc định lương 100.000 USD, 6.750 USD qua Section 125 tránh 516,38 USD; ở mức lương đã vượt trần Social Security, số tránh được thấp hơn vì phần 6,2% đã chạm trần.",
      },
      {
        q: "Nếu tôi chỉ đủ điều kiện HSA một phần năm thì sao?",
        a: "Thông thường trần được tính theo số tháng bạn đủ điều kiện vào ngày đầu tháng. Nếu đủ điều kiện ngày 1/12, quy tắc tháng cuối có thể cho toàn bộ trần, nhưng bạn phải duy trì đủ điều kiện đến hết ngày 31/12 năm sau. Nếu loại bảo hiểm đổi giữa cá nhân và gia đình trong năm, hãy dùng worksheet Form 8889 để tính theo từng tháng.",
      },
      {
        q: "Chủ lao động góp thì tôi được góp thêm bao nhiêu?",
        a: "Trần trừ đi phần chủ lao động đã góp. Nếu trần gia đình là 8.750 USD và chủ lao động góp 2.000 USD, bạn chỉ được góp tối đa 6.750 USD. Đây là lỗi hay gặp nhất: nhiều người tưởng phần chủ lao động góp là một khoản riêng, rồi góp thêm đủ trần và bị vượt. Phần vượt không được khấu trừ và bị phạt 6% mỗi năm cho đến khi rút ra.",
      },
      {
        q: "Có nên dùng HSA để trả chi phí y tế ngay hay để dành?",
        a: "Nếu bạn có thể trả chi phí y tế bằng tiền khác, để dành trong HSA thường có lợi hơn nhiều, vì tiền trong đó tăng trưởng không chịu thuế. Quy định Hoa Kỳ còn cho phép giữ hóa đơn y tế và rút tiền hoàn lại nhiều năm sau — không có thời hạn — miễn là chi phí đó phát sinh sau khi mở tài khoản. Nghĩa là bạn có thể để tiền tăng trưởng hàng chục năm rồi rút miễn thuế dựa trên hóa đơn cũ. Nhưng cách này chỉ khả thi nếu bạn thực sự có đủ tiền mặt để trả trước.",
      },
      {
        q: "Sau 65 tuổi tài khoản HSA thành cái gì?",
        a: "Thành một tài khoản tốt hơn IRA truyền thống. Rút cho chi phí y tế vẫn miễn thuế hoàn toàn, ở bất kỳ tuổi nào. Rút cho mục đích khác thì chịu thuế thu nhập nhưng không còn bị phạt 20% — tức là đúng bằng một IRA truyền thống. Nói cách khác, HSA không bao giờ tệ hơn IRA truyền thống, và tốt hơn ở mọi khoản chi y tế. Đó là lý do nhiều người xếp nó là tài khoản ưu tiên hàng đầu sau khi đã nhận đủ phần chủ lao động khớp trong 401(k).",
      },
      {
        q: "Lợi suất đầu tư 7% có thực tế không?",
        a: "Chỉ khi bạn thực sự đầu tư số dư. Rất nhiều tài khoản HSA để mặc tiền ở dạng tiền gửi lãi suất gần bằng 0, và nhiều nơi yêu cầu số dư tối thiểu trước khi cho phép mua quỹ. Nếu tài khoản của bạn đang ở dạng tiền gửi, hãy nhập lãi suất thật của nó — lớp ưu đãi thứ hai, tăng trưởng miễn thuế, chỉ đáng giá khi có tăng trưởng để miễn.",
      },
    ],
  },
} as const;
