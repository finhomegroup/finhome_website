// Copy for /cong-cu/gia-tri-tien-te-theo-thoi-gian/ — the TVM solver.
//
// Original FinHome copy.
//
// This is the one page in the suite that exposes the Excel/HP-12C sign
// convention instead of hiding it, because a general solver cannot know which
// side of a transaction the user is on. So the convention IS the page: it is
// in the notice, in every field's help text, and in the FAQ. Getting the sign
// wrong is the single most common way to misuse a TVM calculator.
//
// Figures quoted are the module's own output. Loan case (nhận 2 tỷ, 240 kỳ,
// 0,7083333333%/kỳ — tức 8,5 ÷ 12, và defaultRate giữ đủ mười chữ số thập
// phân vì làm tròn thành 0,7083 lệch 506,33 ₫/kỳ): khoản trả −17.356.465 ₫/kỳ,
// lãi ròng −2.165.551.520 ₫.
// Savings case (góp −1.000.000 ₫/kỳ, 12 kỳ, 1%/kỳ): cuối kỳ +12.682.503 ₫,
// lãi ròng +682.503 ₫. Lump sum doubling over 120 kỳ: 0,5792941%/kỳ.
//
// Hai con số trong rateHelp cách nhau đúng một phép nhân, nên người đọc kiểm
// tra được: khoản trả lệch 506,32834681 ₫/kỳ, và 240 × số đó = 121.518,80 →
// 121.519 ₫ lãi ròng. Đừng viết 507 ₫/kỳ: 507 là hiệu của hai khoản trả ĐÃ
// làm tròn về đồng (17.356.465 − 17.355.958), và 240 × 507 = 121.680, lệch
// 161 ₫ so với con số lãi ròng trong cùng câu.

// ORIGINAL ROW 18, second pass: the page now OPENS on an everyday question
// instead of on "chọn đại lượng cần tìm". The advanced solver is unchanged and
// stays one control away, because it is the only tool in the suite that can
// take a loan with a non-zero closing balance.
//
// Question-mode figures, from `answerTvmQuestion` on 500 triệu hiện có,
// 5 triệu/tháng cuối tháng, 6%/năm danh nghĩa (0,5%/tháng):
//   36 tháng → 795.020.787 ₫; tiền bỏ vào 680.000.000 ₫.
//   mục tiêu 800 triệu sau 36 tháng → góp 5.126.581 ₫/tháng.
//   mục tiêu 800 triệu với mức góp 5 triệu → đại số 36,56 kỳ, nhưng tháng đầu
//   tiên ĐỦ là 37: tháng 36 còn 795.020.787 ₫, tháng 37 là 803.995.891 ₫.

export const TVM = {
  slug: "/cong-cu/gia-tri-tien-te-theo-thoi-gian",

  pageTitle: "Giá trị tiền tệ theo thời gian",
  metaTitle: "Giá trị tiền tệ theo thời gian — Trả lời ba câu hỏi thường gặp",
  metaDescription:
    "Trả lời ba câu hỏi: sau N tháng tôi có bao nhiêu, mỗi tháng cần góp bao nhiêu, và bao lâu thì đủ. Kèm chế độ nâng cao giải một trong năm đại lượng. Công cụ miễn phí của FinHome.",

  lede:
    "Bắt đầu bằng câu hỏi của bạn: sau một số tháng thì có bao nhiêu, mỗi tháng cần góp bao nhiêu, hay bao lâu thì đủ. Ba câu hỏi này đều là cùng một phép tính — tiền hôm nay, tiền góp thêm và thời gian — và công cụ giữ nguyên chế độ NÂNG CAO bên dưới cho các bài toán không khớp với ba câu trên, ví dụ một khoản vay còn dư nợ ở cuối kỳ.",

  // The guided entry. Every amount here is entered as a POSITIVE figure the
  // way a saver says it; `lib/calc/tvm-questions.ts` applies the sign
  // convention once and reports what it handed the solver, so the two modes
  // cannot disagree about which way the money moved.
  question: {
    modeLegend: "Bạn đang muốn biết điều gì?",
    modeHelp:
      "Ba câu hỏi này dùng chung một phép tính; chọn câu nào thì các ô cần nhập sẽ đổi theo. Cần một bài toán khác — có dư nợ cuối kỳ, có khoản trả đầu kỳ, hay cần tìm lãi suất — thì mở chế độ nâng cao bên dưới.",
    modeBalance: "Sau một số tháng tôi có bao nhiêu?",
    modeContribution: "Mỗi tháng cần góp bao nhiêu?",
    modeMonths: "Bao lâu thì đủ?",
    defaultMode: "balanceAfter",

    group: "Số liệu của bạn",
    savingsLabel: "Bạn đang có",
    savingsUnit: "₫",
    savingsHelp:
      "Số tiền hiện có cho mục tiêu này. Nhập 0 nếu bắt đầu từ đầu. Ở đây bạn nhập số DƯƠNG — công cụ tự lo phần dấu.",
    savingsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultSavings: "500.000.000",

    contributionLabel: "Góp mỗi tháng",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền bạn bỏ thêm vào CUỐI mỗi tháng, như một lệnh chuyển tiền tự động. Nhập 0 nếu chỉ để nguyên số tiền đang có.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultContribution: "5.000.000",

    goalLabel: "Mục tiêu cần đạt",
    goalUnit: "₫",
    goalHelp: "Số tiền bạn cần có. Ví dụ tiền trả trước cho một căn nhà.",
    goalInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultGoal: "800.000.000",

    monthsLabel: "Trong bao nhiêu tháng",
    monthsHelp:
      "Số tháng, là số nguyên: mỗi tháng là một lần góp, nên nửa tháng không có nghĩa ở đây. Tối đa 1.200 tháng (100 năm).",
    monthsInvalid: "Vui lòng nhập số nguyên từ 1 đến 1.200.",
    defaultMonths: "36",

    rateLabel: "Lãi suất giả định",
    rateUnit: "%/năm",
    rateHelp:
      "Mức DANH NGHĨA mỗi năm, chia 12 cho mỗi tháng — cùng cách đọc với công cụ mục tiêu tiết kiệm. Đây là giả định của bạn, không phải mức được cam kết. Nhập 0 nếu không muốn giả định sinh lời.",
    rateInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultRate: "6",

    resultTitle: "Câu trả lời",
    balanceAnswerLabel: "Số dư cuối kỳ",
    contributionAnswerLabel: "Cần góp mỗi tháng",
    monthsAnswerLabel: "Tháng đầu tiên đủ mục tiêu",
    paidLabel: "Tiền của bạn đã bỏ vào",
    interestLabel: "Phần do lãi giả định",
    // The friendly mode's own secondary heading. "Cả năm đại lượng" belongs
    // to the advanced mode, where there ARE five quantities; using it over a
    // one- or two-row block was a mislabel an independent review caught.
    detailTitle: "Chi tiết phép tính",
    monthlyRateLabel: "Lãi suất mỗi tháng đã dùng",

    // The finding this mode exists to keep straight. The solver's fractional
    // period count is algebra; the funded month is a month a standing order
    // can actually be made in.
    exactPeriodsLabel: "Số kỳ theo đại số",
    periodsUnit: "kỳ",
    monthsUnit: "tháng",
    exactPeriodsNotice:
      "Hai con số này trả lời hai câu khác nhau. “Số kỳ theo đại số” là nghiệm của phương trình và thường là số lẻ — không có lần góp thứ 36,56. “Tháng đầu tiên đủ mục tiêu” là tháng mà số dư sau khi góp đã bằng hoặc vượt mục tiêu, nên nó luôn là số nguyên và là con số bạn dùng để đặt hẹn.",
    boundaryNotice:
      "Cuối tháng {before} bạn còn {beforeBalance} — chưa đủ. Cuối tháng {funded} là {fundedBalance}, đủ mục tiêu.",

    alreadyFundedNotice:
      "Số tiền bạn đang có đã bằng hoặc vượt mục tiêu, nên mục tiêu đạt ngay từ tháng 0 mà chưa cần góp thêm lần nào.",
    notReachedNotice:
      "Với mức góp và lãi suất này, kế hoạch chưa đạt mục tiêu trong 1.200 tháng — giới hạn mô phỏng của công cụ. Hãy thử tăng mức góp, hạ mục tiêu, hoặc kiểm tra lại lãi suất giả định.",
    unattainableNotice:
      "Không có tiền góp thêm và cũng không giả định sinh lời, nên số dư không thay đổi và sẽ không bao giờ đạt mục tiêu. Hãy nhập mức góp mỗi tháng hoặc một mức lãi suất giả định.",
    // THE PRIMARY ANSWER IS THE PLAN, NOT THE ALGEBRA. With 900 triệu already
    // saved toward an 800 triệu goal the equation solves to −7.042.194 ₫/tháng,
    // and that was shown as "Cần góp mỗi tháng" while the chart drew a
    // contribution of 0. The headline now reads 0 with this sentence beside
    // it, and the signed figure moved into the detail block under its own
    // name — see `question.algebraicContributionLabel`.
    alreadyEnoughLabel: "Không cần góp thêm",
    algebraicContributionLabel: "Mức góp theo đại số (có dấu)",
    negativeContributionNotice:
      "Số tiền bạn đang có đã đủ để đạt mục tiêu trong khoảng thời gian này, nên câu trả lời là KHÔNG cần góp thêm đồng nào — biểu đồ cũng vẽ theo mức góp 0. Phương trình thì cho ra một mức góp ÂM, và đó là một câu hỏi khác: nó nói bạn có thể rút ra bớt bấy nhiêu mỗi tháng mà vẫn về đúng mục tiêu. Con số có dấu đó nằm ở phần chi tiết, không phải ở dòng trả lời, và nó KHÔNG phải kế hoạch đang được vẽ.",
    noAnswerNotice:
      "Chưa tính được với tổ hợp số liệu này. Hãy kiểm tra lại mục tiêu, số tháng và lãi suất giả định.",

    modeAdvanced: "Nâng cao: giải một trong năm đại lượng",
    // The page-level notice has to be true in BOTH modes, so the sign
    // convention is not stated here as if it applied to the whole page — it
    // is rendered inside the advanced mode, beside the fields it governs.
    // Mode-local guidance, the same lesson row 56 learned.
    pageNotice:
      "Ba câu hỏi thường gặp nhận số DƯƠNG như cách bạn nói hằng ngày; công cụ tự lo quy ước dấu. Chỉ chế độ NÂNG CAO mới yêu cầu bạn tự đặt dấu, và quy ước đó được giải thích ngay trong phần đó.",
  },

  // ORIGINAL ROW 18's visual: the cash-flow timeline beside the answer.
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Dòng tiền theo thời gian: số dư và phần tiền bạn bỏ vào",
    series: "{label}",
    xAxis: "Tháng kể từ hôm nay",
    yAxis: "Số tiền ({unit})",
    assumptions: [
      "Mọi con số do bạn nhập: số tiền đang có, mức góp, số tháng hoặc mục tiêu, và lãi suất giả định.",
      "Khoản góp vào CUỐI mỗi tháng, nên tháng 0 chỉ là số tiền bạn đang có.",
      "Lãi suất là mức DANH NGHĨA mỗi năm chia 12 cho mỗi tháng. Đây là giả định của bạn, không phải cam kết, và thị trường hay lãi tiền gửi đều không đứng yên như hình vẽ.",
      "Chưa tính thuế, phí và lạm phát.",
    ],
    tableCaption: "Số dư theo từng mốc",
    tableHint:
      "Hai cột trả lời hai câu: “số dư” là tất cả số tiền có ở thời điểm đó, “tiền bạn đã bỏ vào” là phần tiền của chính bạn. Khoảng cách giữa hai cột là phần do lãi suất giả định — với thời gian ngắn, khoảng cách đó thường nhỏ hơn nhiều so với cảm nhận.",
    periodColumn: "Tháng",
    unavailableReason:
      "Chưa vẽ được: cần số tháng hợp lệ hoặc một kế hoạch đạt được mục tiêu.",
    unavailableRecovery:
      "Hãy kiểm tra lại mức góp, mục tiêu, số tháng và lãi suất giả định.",
    balancePath: "Số dư",
    contributedPath: "Tiền bạn đã bỏ vào",
    goalReference: "Mục tiêu {goal}",
    horizonMarker: "Mốc bạn chọn: tháng {month}",
    fundedMarker: "Đủ mục tiêu: tháng {month}",
    summaryBalance:
      "Sau {months} tháng bạn có {balance}, trong đó {paid} là tiền bạn bỏ vào và {interest} là phần do lãi suất giả định.",
    summaryContribution:
      "Để có {goal} sau {months} tháng, mỗi tháng cần góp {contribution} — tổng tiền bạn bỏ vào là {paid}.",
    summaryMonths:
      "Tháng đầu tiên số dư đạt {goal} là tháng {months}, khi số dư là {balance}.",
    exactPeriodNote:
      "Phương trình cho {exact} kỳ, nhưng không có lần góp thứ {exact}: cuối tháng {before} số dư là {beforeBalance}, chưa đủ; cuối tháng {funded} là {fundedBalance}.",
    notReachedNote:
      "Trong giới hạn mô phỏng 1.200 tháng, kế hoạch này chưa đạt mục tiêu — đường mục tiêu nằm trên đường số dư ở mọi mốc được vẽ.",
    alreadyFundedNote:
      "Số tiền đang có đã đạt mục tiêu, nên không có quãng thời gian nào để vẽ.",
    rateNote:
      "Lãi suất là giả định của bạn, tính theo mức danh nghĩa mỗi năm chia 12.",
    monthColumn: "Tháng",
    balanceColumn: "Số dư",
    contributedColumn: "Tiền bạn đã bỏ vào",
  },

  form: {
    solveLegend: "Bạn muốn tính đại lượng nào?",
    solveHelp:
      "Bốn đại lượng còn lại đều phải nhập. Ô của đại lượng đang tính sẽ được ẩn.",
    solvePresent: "Giá trị hiện tại",
    solveFuture: "Giá trị tương lai",
    solvePayment: "Khoản trả mỗi kỳ",
    solvePeriods: "Số kỳ",
    solveRate: "Lãi suất mỗi kỳ",
    defaultSolveFor: "payment",

    group: "Đại lượng",
    presentLabel: "Giá trị hiện tại",
    presentUnit: "₫",
    presentHelp:
      "DƯƠNG nếu bạn NHẬN tiền hôm nay (đi vay), ÂM nếu bạn bỏ tiền ra hôm nay (đầu tư).",
    presentInvalid: "Vui lòng nhập một số.",
    defaultPresent: "2.000.000.000",

    futureLabel: "Giá trị tương lai",
    futureUnit: "₫",
    futureHelp:
      "DƯƠNG nếu bạn nhận tiền ở cuối kỳ, ÂM nếu bạn phải trả. Để 0 với khoản vay trả hết.",
    futureInvalid: "Vui lòng nhập một số.",
    defaultFuture: "0",

    paymentLabel: "Khoản trả mỗi kỳ",
    paymentUnit: "₫",
    paymentHelp:
      "ÂM nếu bạn trả ra mỗi kỳ, DƯƠNG nếu bạn nhận vào mỗi kỳ. Để 0 nếu chỉ có một khoản đầu và một khoản cuối.",
    paymentInvalid: "Vui lòng nhập một số.",
    defaultPayment: "-17.356.465",

    periodsLabel: "Số kỳ",
    periodsHelp:
      "Số kỳ, tính theo cùng đơn vị với lãi suất. 20 năm theo tháng là 240.",
    periodsInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultPeriods: "240",

    rateLabel: "Lãi suất mỗi kỳ",
    rateUnit: "%/kỳ",
    rateHelp:
      "MỖI KỲ, không phải mỗi năm. Lãi 8,5%/năm tính theo tháng là 8,5 ÷ 12 = 0,7083333333 — làm tròn thành 0,7083 làm khoản trả lệch 506,33 ₫ mỗi kỳ và 121.519 ₫ lãi ròng trên 240 kỳ, nên ở đây chúng tôi giữ đủ chữ số.",
    rateInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultRate: "0,7083333333",

    timingLegend: "Khoản trả vào lúc nào trong kỳ?",
    timingHelp:
      "Cuối kỳ là mặc định và đúng với hầu hết khoản vay. Đầu kỳ dùng cho tiền thuê trả trước và một số hợp đồng bảo hiểm.",
    timingEnd: "Cuối kỳ",
    timingBeginning: "Đầu kỳ",
    defaultTiming: "end",

    resultTitle: "Kết quả",
    solvedLabel: "Đại lượng vừa tính",
    netInterestLabel: "Lãi ròng",
    totalPaymentsLabel: "Tổng các khoản trả",

    detailTitle: "Cả năm đại lượng",
    presentResultLabel: "Giá trị hiện tại",
    futureResultLabel: "Giá trị tương lai",
    paymentResultLabel: "Khoản trả mỗi kỳ",
    periodsResultLabel: "Số kỳ",
    rateResultLabel: "Lãi suất mỗi kỳ",
    annualRateLabel: "Quy ra %/năm nếu kỳ là tháng",
    timingResultLabel: "Thời điểm trả",

    noSolutionNotice:
      "Không có đáp án cho tổ hợp số liệu này. Thường là do một trong ba lý do: dấu của các đại lượng không mô tả được một giao dịch có thật (ví dụ mọi dòng tiền đều cùng dấu); khoản trả quá nhỏ để trả hết dư nợ, nên không có số kỳ hữu hạn nào; hoặc lãi suất cần tìm nằm ngoài phạm vi tìm kiếm. Hãy kiểm tra lại dấu trước tiên.",
  },

  signNotice:
    "Trang này dùng quy ước dấu của máy tính tài chính: tiền BẠN TRẢ RA là số ÂM, tiền BẠN NHẬN VÀO là số DƯƠNG. Một công cụ tổng quát buộc phải lộ quy ước này ra, vì nó không thể biết bạn đang ở bên nào của giao dịch. Người đi vay: nhận gốc nên giá trị hiện tại DƯƠNG, trả góp nên khoản trả ÂM. Người tiết kiệm: bỏ tiền vào nên khoản trả ÂM, nhận số dư cuối kỳ nên giá trị tương lai DƯƠNG. Nhập sai dấu là cách phổ biến nhất để dùng sai máy tính tài chính, và kết quả khi đó thường vẫn là một con số trông hợp lý.",

  formula: {
    title: "Cách tính",
    body: [
      "Phương trình nối năm đại lượng: giá trị hiện tại × (1 + r)^n + khoản trả × ((1 + r)^n − 1) ÷ r + giá trị tương lai = 0, với r là lãi suất mỗi kỳ và n là số kỳ. Bốn trong năm đại lượng xác định đại lượng thứ năm.",
      "Bốn đại lượng đầu có công thức đóng. Riêng LÃI SUẤT thì không — nó được giải bằng phương pháp chia đôi khoảng, và công cụ trả về “không có đáp án” thay vì một con số đoán nếu dòng tiền không kẹp được nghiệm.",
      "Lãi ròng = giá trị hiện tại + khoản trả × số kỳ + giá trị tương lai. Theo quy ước dấu, số DƯƠNG là lãi bạn NHẬN được và số ÂM là lãi bạn TRẢ. Với khoản vay 2 tỷ ở 0,7083333333%/kỳ trong 240 kỳ: khoản trả −17.356.465 ₫ và lãi ròng −2.165.551.520 ₫. Với kế hoạch góp −1.000.000 ₫ mỗi kỳ ở 1%/kỳ trong 12 kỳ: cuối kỳ +12.682.503 ₫ và lãi ròng +682.503 ₫.",
      "Lãi suất phải cùng đơn vị kỳ với số kỳ. Lỗi phổ biến thứ hai sau lỗi dấu: nhập số kỳ theo tháng nhưng lãi suất theo năm. Lãi 8,5%/năm tính theo tháng là 0,7083333333%/kỳ; làm tròn còn 0,7083 là một lỗi riêng, nhỏ nhưng không bằng 0.",
      "Số kỳ KHÔNG được làm tròn khi nó là đại lượng cần tìm. 47,3 kỳ là 47,3 kỳ — làm tròn xuống sẽ nói rằng mục tiêu đạt được sớm hơn thực tế.",
      // The two modes, and the one place they genuinely differ in what they
      // report. Both run on the same equation; only the friendly mode also
      // walks the months, because only it has a schedule to walk.
      "Ba câu hỏi thường gặp ở đầu trang dùng ĐÚNG phương trình này, chỉ khác ở cách nhập: bạn nhập số dương như cách nói hằng ngày và công cụ tự đặt dấu — tiền bạn đang có và tiền góp vào là dòng tiền ra, số dư cuối là dòng tiền vào. Lãi suất ở đó nhập theo %/năm DANH NGHĨA và được chia 12, giống công cụ mục tiêu tiết kiệm; khoản góp luôn vào cuối tháng. Chế độ nâng cao giữ nguyên quy ước “lãi suất mỗi kỳ” và cho phép trả đầu kỳ, dư nợ cuối kỳ khác 0 hay tìm lãi suất — những trường hợp ba câu hỏi trên không mô tả được.",
      "Với câu hỏi “bao lâu thì đủ”, công cụ trả về HAI con số và chúng không thay thế nhau. Nghiệm của phương trình là số kỳ, thường là số lẻ: với 500.000.000 ₫ đang có, góp 5.000.000 ₫ mỗi tháng ở 6%/năm để đạt 800.000.000 ₫, nghiệm là 36,56 kỳ. Nhưng không có lần góp thứ 36,56 — cuối tháng 36 số dư là 795.020.787 ₫, chưa đủ, và cuối tháng 37 mới là 803.995.891 ₫. Vì vậy “tháng đầu tiên đủ mục tiêu” là 37, và đó là con số dùng để đặt hẹn; 36,56 chỉ là đại số. Làm tròn xuống thành 36 tháng là nói rằng bạn đã có tiền trong khi còn thiếu gần 5 triệu.",
      "Chọn trả đầu kỳ làm mỗi khoản trả sinh lãi thêm một kỳ, nên khoản trả cần thiết nhỏ hơn và giá trị tương lai lớn hơn so với trả cuối kỳ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Tôi nhập số dương hết thì sao?",
        a: "Bạn sẽ nhận được “không có đáp án”, hoặc tệ hơn, một con số vô nghĩa. Phương trình cần ít nhất một dòng tiền vào và một dòng tiền ra để có nghiệm — nếu mọi thứ cùng dấu thì không có giao dịch nào cả. Quy tắc nhanh: đi vay thì gốc dương và khoản trả âm; tiết kiệm thì khoản góp âm và số dư cuối dương.",
      },
      {
        q: "Khi nào dùng công cụ này thay vì công cụ chuyên biệt?",
        a: "Khi bài toán của bạn không khớp với một công cụ có sẵn: một khoản vay có số dư cuối kỳ khác 0, một hợp đồng vừa có khoản trả định kỳ vừa có khoản một lần, hay khi bạn cần giải cho số kỳ hoặc lãi suất. Với các bài toán thường gặp, công cụ tính khoản vay, lãi kép hay mục tiêu tiết kiệm của FinHome dễ dùng hơn vì chúng lo phần dấu thay bạn.",
      },
      {
        q: "Giá trị tương lai khác 0 nghĩa là gì?",
        a: "Nghĩa là còn một khoản tiền ở cuối kỳ. Với khoản vay có trả gốc cuối kỳ, đó là số gốc còn lại phải trả — nhập số âm. Với hợp đồng thuê tài chính có giá trị còn lại, đó là số bạn phải trả để mua lại. Với kế hoạch tiết kiệm, đó là số dư bạn nhận về — nhập số dương.",
      },
      {
        q: "Vì sao lãi suất là đại lượng duy nhất không có công thức?",
        a: "Vì nó xuất hiện trong phương trình dưới dạng (1 + r)^n, và không thể tách r ra một phía khi n lớn hơn 2. Đây không phải giới hạn của công cụ mà là của đại số. Mọi máy tính tài chính đều giải lãi suất bằng phương pháp số, và tất cả đều có thể không tìm được nghiệm với dòng tiền bất thường.",
      },
      {
        q: "Kết quả có tính thuế và lạm phát không?",
        a: "Không. Phương trình chỉ nói về dòng tiền danh nghĩa. Nếu bạn muốn kết quả theo giá trị thực, hãy nhập lãi suất thực thay vì lãi suất danh nghĩa — nhưng khi đó mọi dòng tiền cũng phải theo giá trị thực. Trộn hai loại là lỗi thường gặp.",
      },
    ],
  },
} as const;
