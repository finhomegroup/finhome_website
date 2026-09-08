// Copy for /cong-cu/tai-khoan-tiet-kiem-y-te-hoa-ky/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true.
//
// Figures quoted are computeUsHsa's output, verified by running it
// (2026, gia đình, 40 tuổi, tự góp 6.750 + chủ góp 2.000, liên bang 24%,
// bang 5%, qua bảng lương, dư 10.000, lợi suất 7%, 20 năm):
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

    ageLabel: "Tuổi hiện tại",
    ageUnit: "tuổi",
    ageHelp: "Từ 55 tuổi được góp thêm 1.000 USD mỗi năm.",
    ageInvalid: "Vui lòng nhập một tuổi từ 0 đến 120.",

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
      "Góp qua bảng lương còn tránh được cả thuế FICA 7,65%. Chuyển tiền trực tiếp thì không.",
    payrollOptions: {
      yes: "Có, trừ trực tiếp từ lương",
      no: "Không, tôi tự chuyển tiền vào",
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
      contribution: "6.750",
      employer: "2.000",
      payroll: "yes",
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
    baseLimitLabel: "Trần cơ bản",
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
      "Bạn đang chọn tự chuyển tiền vào thay vì trừ qua bảng lương. Cách này vẫn được khấu trừ thuế thu nhập nhưng MẤT phần tiết kiệm FICA. Nếu chủ lao động của bạn có cơ chế trừ qua bảng lương, chuyển sang cách đó là một khoản lợi miễn phí — cùng số tiền vào cùng tài khoản, chỉ khác đường đi.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Kiểm tra lại số năm (số nguyên, 0–70) và các thuế suất.",
  },

  ficaNotice:
    "Lớp ưu đãi thứ tư: khoản góp HSA qua bảng lương còn tránh được thuế FICA 7,65%, điều mà khoản góp 401(k) hay IRA KHÔNG có. Với các số mặc định, phần này là 516,375 USD — cộng với 1.957,50 USD thuế thu nhập, tổng 2.473,875 USD. Nghĩa là đưa 6.750 USD vào tài khoản chỉ tốn 4.276,125 USD tiền thật. Và ở các bậc thuế thấp, FICA còn lớn hơn cả phần thuế thu nhập tiết kiệm được: ở bậc 12% tại một bang không có thuế thu nhập, FICA bằng gần hai phần ba phần thuế thu nhập; dưới bậc 10% thì nó vượt hẳn. Điểm quan trọng: nếu bạn tự chuyển tiền vào tài khoản thay vì trừ qua bảng lương, bạn mất trọn phần này — cùng số tiền, cùng tài khoản, chỉ khác đường đi.",

  formula: {
    title: "Cách tính",
    body: [
      "Trần góp áp cho TỔNG mọi nguồn: phần bạn góp cộng phần chủ lao động góp. Đây là lỗi phổ biến nhất — nhiều người coi phần chủ lao động là một trần riêng và vượt trần mà không biết. Phần vượt trần không được khấu trừ và bị phạt 6% mỗi năm nếu không rút ra kịp.",
      "Từ 55 tuổi được góp thêm 1.000 USD mỗi năm. Con số này ấn định trong luật và không điều chỉnh theo lạm phát, khác với hai mức trần cơ bản.",
      "Lớp ưu đãi thứ nhất là khấu trừ khi góp vào. Nhưng nếu góp qua bảng lương, khoản đó còn được loại khỏi lương chịu thuế FICA, nên tránh thêm 7,65% — và chủ lao động cũng tránh 7,65% của họ. Khoản góp 401(k) hay IRA không có phần này: chúng chỉ tránh thuế thu nhập.",
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
        a: "Vì cùng số tiền vào cùng tài khoản, nhưng chỉ cách qua bảng lương mới tránh được FICA. Nếu bạn tự chuyển tiền vào rồi khai khấu trừ khi làm thuế, bạn vẫn được khấu trừ thuế thu nhập nhưng đã nộp xong 7,65% FICA và không lấy lại được. Với 6.750 USD thì đó là 516 USD mất trắng mỗi năm. Chủ lao động cũng tiết kiệm 7,65% của họ khi trừ qua bảng lương, nên đây là điều họ thường sẵn sàng hỗ trợ.",
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
