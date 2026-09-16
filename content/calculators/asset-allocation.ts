// Copy for /cong-cu/phan-bo-tai-san/.
//
// Original FinHome copy.
//
// ORIGINAL ROW 56 CHANGED THIS PAGE'S DEFAULT QUESTION, and that is the point
// of every edit below. The page opened on "what mix should someone your age
// hold", which for money about to buy a home is the wrong question and reads
// as a personal investment recommendation. The default is now purpose/time
// allocation: one pot, a reserve, and named goals with the month each is
// needed. The age/risk portfolio study is RETAINED, unchanged in its
// arithmetic, as an explicitly advanced educational mode.
//
// THE SERVER-RENDERED EXPLANATION BELONGS TO THE DEFAULT MODE. An independent
// review found the page opening on the purpose allocation while everything
// below the form — the 65/30/5 volatility paragraph, the whole covariance
// "Cách tính", and five of the six FAQ answers — still explained the age/risk
// portfolio study. Three consequences, all fixed here:
//
//   * `formula` is now the purpose allocation's own method. The covariance one
//     is `advancedFormula` and renders INSIDE the advanced mode, where the
//     inputs it describes are.
//   * `correlationNotice` also moved into the advanced mode's own block. It
//     quotes figures from a portfolio the default mode never computes.
//   * The FAQ is ordered and labelled by mode: the allocation questions first,
//     then the bridge question, then the advanced ones, each of which names
//     the mode it is about in its own question text. They stay on the page
//     (and in the FAQ schema) rather than being hidden behind client state —
//     the review asked for clear separation, not removal.
//
// THE ALLOCATION ORDER IS A DECLARED CONVENTION. The copy used to say money is
// given out "theo thứ tự bạn liệt kê". There is no reordering control: the
// groups are fixed at reserve, then the home, then the other goal. Every
// string now states that as the tool's convention and says the reader did not
// choose it.
//
// THE MONTH COUNTS HAVE A VISIBLE ANCHOR. "Kể từ hôm nay" was displayed on a
// page that never showed what today was, so no reader could check it. There is
// a declared start date now and the need dates are computed from it.
//
// THREE THINGS CHANGED BEYOND THE NEW MODE:
//
// 1. `usRules` was removed from the registry entry. The flag rendered
//    "Công cụ này mô phỏng quy định về thuế và hưu trí của Hoa Kỳ" above the
//    calculator — and this tool models neither tax nor retirement law. That
//    notice was already inaccurate; above a Vietnamese đồng home-fund
//    allocation it would be actively misleading.
// 2. The portfolio study now works in đồng, not USD. The covariance
//    arithmetic is currency-agnostic and the holdings are just amounts, so
//    two currencies on one page bought nothing but confusion.
// 3. Two unsupported claims are gone. The σ help said 16% means "roughly two
//    thirds of years land within ±16 points", which is a normal-distribution
//    frequency claim presented as a definition — the P3 audit flagged it, and
//    a standard deviation alone implies no such frequency. And the equity
//    return default was described as the long-run average of the United
//    States equity market; nobody here has verified that series. Both now
//    describe what the input IS: the reader's own assumption.
//
// Figures quoted are analyseAllocation's output, verified by running it on
// this page's own defaults (45 tuổi; mức chấp nhận rủi ro trung bình;
// đang giữ 500.000.000 cổ phiếu + 150.000.000 trái phiếu + 50.000.000
// tiền mặt; lợi suất 10% / 5% / 3%; độ lệch chuẩn 16% và 6%; tương quan 0,1).
// Số tiền đổi từ USD sang ₫ theo đúng hệ số 1.000, nên mọi TỶ LỆ, độ lệch và
// con số rủi ro dưới đây không thay đổi — chỉ các số tiền dịch ba chữ số:
//   Tổng giá trị 700.000.000 ₫
//   Mục tiêu 65% cổ phiếu / 30% trái phiếu / 5% tiền mặt
//   Hiện tại 71,4% / 21,4% / 7,1% — lệch +6,4 / −8,6 / +2,1 điểm
//   Lệch nhiều nhất 8,6 điểm, vượt dải 5 điểm nên cần cân lại
//   Giao dịch: bán 45.000.000 cổ phiếu, mua 60.000.000 trái phiếu,
//     bán 15.000.000 tiền mặt — tổng bằng 0, vì cân lại không thêm tiền vào
//   Mục tiêu: lợi nhuận kỳ vọng 8,15%; độ lệch chuẩn 10,73%
//     Bình quân gia quyền của các độ lệch chuẩn là 12,25%, nên đa dạng hóa
//     tiết kiệm 1,52 điểm rủi ro. Lợi nhuận trên mỗi đơn vị rủi ro 0,760
//   Hiện tại: lợi nhuận 8,43%, độ lệch chuẩn 11,63%, tỷ số 0,725 — cao
//     hơn cả lợi nhuận VÀ rủi ro, nhưng tỷ số thì kém hơn
//   Tương quan là đòn bẩy mạnh nhất: −0,5 -> 9,63% (tiết kiệm 2,62 điểm);
//     0 -> 10,55%; 0,1 -> 10,73%; 0,5 -> 11,41%; 1 -> 12,20% (0,05 điểm,
//     phần dư là do tương quan của tiền mặt vẫn lấy bằng 0)
//   Ba mức chấp nhận rủi ro ở tuổi 45: 55/35/10 -> 9,25%;
//     65/30/5 -> 10,73%; 75/25/0 -> 12,24%
//   Theo tuổi, mức trung bình: 25 tuổi 85/10/5 -> 13,67%;
//     65 tuổi 45/50/5 -> 8,07%

export const ASSET_ALLOCATION = {
  slug: "/cong-cu/phan-bo-tai-san",

  pageTitle: "Tiền sắp dùng để mua nhà nên được tách ra thế nào?",
  metaTitle: "Phân bổ tiền theo mục đích — Quỹ dự phòng và thời điểm cần dùng",
  metaDescription:
    "Chia một khoản tiền theo mục đích và thời điểm cần dùng: quỹ dự phòng, tiền trả trước cần trong bao nhiêu tháng, và phần chưa phân bổ. Kèm chế độ nâng cao về danh mục theo tuổi. Công cụ miễn phí của FinHome.",

  lede:
    "Tiền sắp dùng để mua nhà không nên được xếp cùng tiền để dành mười năm nữa. Bắt đầu từ ba câu hỏi: bạn muốn giữ lại bao nhiêu làm quỹ dự phòng, cần bao nhiêu cho việc gì, và cần vào lúc nào. Công cụ chia đúng khoản tiền bạn có theo các mục đích đó, và nói rõ phần nào chưa được phân bổ hoặc còn thiếu.",

  // A TOOL-SPECIFIC DISCLAIMER. The shared text says the result assumes an
  // unchanging interest rate and is not a promise of return; the DEFAULT mode
  // here divides money that already exists and assumes no return at all, so
  // the boilerplate was irrelevant where it mattered most. An independent
  // reading review flagged it. The opening clause `check:markup` counts is
  // kept; only what follows it is replaced, and the advanced study's own
  // assumption caveat is stated rather than dropped.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa. Ở chế độ mặc định, nó chia số tiền bạn đang có theo các mục đích bạn tự đặt: không giả định mức sinh lời nào, không cộng thêm gì vào khoản tiền đó, và không gợi ý nên gửi hay đầu tư vào đâu. Chế độ nâng cao về danh mục theo tuổi chạy trên các mức sinh lời và độ lệch chuẩn do BẠN giả định — chúng không phải cam kết lợi nhuận và không tính thuế hay phí giao dịch. Không phần nào trên trang là lời khuyên đầu tư hay đánh giá mức độ phù hợp của một sản phẩm với bạn.",

  // The boundary, above the tool. This page allocates MONEY THE READER HAS
  // between PURPOSES THEY NAME. It does not choose products.
  scopeNotice:
    "Công cụ chia số tiền bạn đang có theo các mục đích bạn tự đặt. Nó KHÔNG gợi ý nên gửi tiết kiệm, mua chứng khoán hay chọn sản phẩm nào, không đánh giá mức độ phù hợp của sản phẩm với bạn, và không phải tư vấn đầu tư.",
  scopeNoticeDetailTitle: "Vì sao không có gợi ý sản phẩm",
  scopeNoticeDetail:
    "Việc quyết định tiền nằm ở đâu phụ thuộc vào những điều một trang web không biết: bạn còn nguồn thu nào khác, bạn chịu được biến động đến đâu, và điều gì xảy ra nếu đúng tháng bạn cần tiền thì thị trường giảm. Điều công cụ làm được — và là điều quan trọng nhất với tiền sắp mua nhà — là tách rạch ròi từng mục đích với thời điểm cần dùng, để bạn thấy khoản nào không nên chịu rủi ro vì sắp phải dùng đến.",

  // ------------------------------------ original row 56: the default question
  purpose: {
    modeLegend: "Bạn muốn xem gì?",
    modeHelp:
      "Chế độ đầu là câu hỏi của người sắp mua nhà. Chế độ thứ hai là một bài học chung về danh mục đầu tư theo tuổi — hữu ích để hiểu khái niệm, nhưng không phải cách xử lý khoản tiền bạn sắp dùng.",
    modePurpose: "Chia tiền theo mục đích và thời điểm cần dùng",
    modePortfolio: "Bài học nâng cao: danh mục theo tuổi và rủi ro",
    defaultMode: "purpose",

    potGroup: "Khoản tiền và quỹ dự phòng",
    availableLabel: "Tổng số tiền đang có",
    availableUnit: "₫",
    availableHelp:
      "Tất cả trong MỘT khoản. Mỗi đồng chỉ được dùng cho một mục đích, nên đừng đếm cùng một khoản hai lần.",
    availableInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultAvailable: "1.000.000.000",

    reserveLabel: "Quỹ dự phòng muốn giữ nguyên",
    reserveUnit: "₫",
    reserveHelp:
      "Khoản không dùng cho mục đích nào khác, kể cả mua nhà. Được tách ra TRƯỚC, đúng một lần.",
    reserveInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultReserve: "150.000.000",

    homeGroup: "Tiền mua nhà",
    homeName: "Tiền mua nhà",
    homeAmountLabel: "Cần dành cho việc mua nhà",
    homeAmountUnit: "₫",
    homeAmountHelp: "Tiền trả trước cộng chi phí giao dịch bạn dự tính.",
    homeMonthsLabel: "Cần sau bao nhiêu tháng",
    homeMonthsUnit: "tháng",
    // The anchor is a field on the page now, so the help can point at it
    // instead of saying "hôm nay" and leaving the reader to guess the date.
    homeMonthsHelp:
      "Số tháng nguyên, tính từ ngày mốc bạn nhập ở nhóm dưới. Để trống nếu chưa biết — công cụ sẽ ghi rõ là chưa biết chứ không tự đặt một mốc.",
    defaultHomeAmount: "650.000.000",
    defaultHomeMonths: "12",

    otherGroup: "Mục tiêu khác",
    otherName: "Mục tiêu khác",
    otherAmountLabel: "Cần dành cho mục tiêu khác",
    otherAmountUnit: "₫",
    otherAmountHelp:
      "Một khoản đã có chủ đích khác, ví dụ học phí hoặc một kế hoạch riêng. Để 0 nếu không có.",
    otherMonthsLabel: "Cần sau bao nhiêu tháng",
    otherMonthsUnit: "tháng",
    otherMonthsHelp:
      "Số tháng nguyên, cũng tính từ ngày mốc ở nhóm dưới. Để trống nếu chưa biết thời điểm.",
    defaultOtherAmount: "150.000.000",
    defaultOtherMonths: "24",

    // ---------------------------------------- the declared time anchor
    anchorGroup: "Mốc tính thời gian",
    anchorIntro:
      "Hai ô “cần sau bao nhiêu tháng” ở trên được tính từ ngày này. Ô đang điền sẵn một ngày làm ví dụ; bấm “Hôm nay” để lấy ngày trên máy bạn.",
    anchorDayLabel: "Ngày",
    anchorMonthLabel: "Tháng",
    anchorYearLabel: "Năm",
    anchorDayHelp: "Ngày trong tháng, từ 1 đến 31.",
    anchorMonthHelp: "Tháng, từ 1 đến 12.",
    anchorYearHelp: "Năm, bốn chữ số.",
    anchorInvalid: "Ngày không tồn tại.",
    todayLabel: "Hôm nay",
    todayHelp:
      "Lấy ngày trên thiết bị của bạn. Công cụ không lưu ngày này và không gửi đi đâu.",
    defaultAnchorDay: "15",
    defaultAnchorMonth: "9",
    defaultAnchorYear: "2026",

    /** `{date}` substituted: the anchor, restated where the dates are read. */
    // The clamping example is QUALIFIED. An unqualified "31/1 cộng một tháng
    // là 28/2" sat beside the tool's own correct leap-year answer (31/1/2028
    // + 1 month = 29/2/2028), which an independent review flagged.
    anchorNotice:
      "Mốc tính thời gian: {date}. Các mốc cần tiền dưới đây đếm từ ngày đó, và nếu ngày đó không tồn tại trong tháng đích thì lùi về NGÀY CUỐI THÁNG — ví dụ 31/1 cộng một tháng là 28/2 trong năm thường và 29/2 trong năm nhuận.",
    /** `{name}` and `{date}` substituted, one per purpose with a stated month. */
    anchorPurposeFormat: "{name}: khoảng {date}",
    anchorUnknownFormat: "{name}: chưa ghi thời điểm",
    anchorDateInvalid:
      "Ngày mốc chưa hợp lệ, nên chưa có phân bổ và chưa có mốc cần tiền nào. Hãy sửa ngày, tháng, năm — hoặc bấm “Hôm nay”.",

    amountInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    monthsInvalid: "Vui lòng nhập số tháng nguyên từ 0 trở lên, hoặc để trống.",

    resultTitle: "Phân bổ",
    reserveResultLabel: "Quỹ dự phòng tách ra",
    homeResultLabel: "Phân bổ cho tiền mua nhà",
    otherResultLabel: "Phân bổ cho mục tiêu khác",
    unallocatedLabel: "Chưa phân bổ",
    shortfallLabel: "Còn thiếu so với mong muốn",
    requestedLabel: "Tổng mong muốn dành",

    unallocatedNotice:
      "Phần “chưa phân bổ” là tiền chưa có mục đích — không phải tiền dư, và công cụ không gợi ý làm gì với nó. Hãy đặt cho nó một mục đích, hoặc nâng quỹ dự phòng.",
    // The order is the TOOL's fixed sequence, not a priority the reader set:
    // there is no reordering control on this form. Saying "thứ tự bạn liệt kê"
    // credited the reader with a choice they were never offered.
    shortfallNotice:
      "Tổng mong muốn lớn hơn số tiền đang có, nên có mục đích không được cấp đủ. Công cụ KHÔNG chia đều theo tỷ lệ và không coi tổng mong muốn là đã có. Quy ước cấp tiền của công cụ là cố định theo đúng thứ tự các nhóm ô ở trên: quỹ dự phòng trước, rồi tiền mua nhà, rồi mục tiêu khác — rồi dừng khi hết tiền. Đây là quy ước của công cụ, không phải mức ưu tiên do bạn chọn; nếu bạn muốn thứ tự khác, hãy tự đổi số tiền ở các ô cho đúng ý mình.",
    timeUnknownNotice:
      "Có mục đích chưa ghi thời điểm cần dùng. Không có thời điểm thì không nói được gì về thanh khoản của khoản đó — và với tiền sắp mua nhà, thời điểm là yếu tố quan trọng nhất.",
    orderNotice:
      "Thứ tự cấp tiền cố định của công cụ (dự phòng → nhà → mục tiêu khác) không trùng với thứ tự cần tiền sớm nhất theo các mốc bạn đã nhập. Đây chỉ là một ghi nhận, không phải lời khuyên: công cụ không tự sắp lại, vì chọn mục đích nào bị cắt là quyết định của bạn.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, nên chưa có phân bổ. Số tiền phải từ 0 trở lên và số tháng phải là số nguyên.",
  },

  // A paragraph directly below the calculator, about the DEFAULT mode's own
  // output. It used to be the portfolio study's volatility note, which quotes
  // figures this mode never computes.
  purposeIntro:
    "Ba con số đáng đọc cùng nhau: phần đã phân bổ, phần chưa phân bổ và phần còn thiếu. “Chưa phân bổ” là tiền bạn có nhưng chưa gán mục đích — không phải tiền dư. “Còn thiếu” là khoảng cách giữa tổng mong muốn và số tiền thật có, nên nó KHÔNG phải một khoản tiền tồn tại ở đâu đó: bảng dưới biểu đồ tách hai cột đó ra đúng vì lý do này. Thanh phân bổ chỉ vẽ tiền có thật, còn phần thiếu nằm ở bảng và ở câu tóm tắt.",

  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Một khoản tiền, chia theo mục đích và thời điểm cần dùng",
    axis: "Số tiền ({unit})",
    assumptions: [
      "Mọi con số do bạn nhập. Các ô đang điền sẵn một ví dụ.",
      "Một khoản tiền duy nhất: mỗi đồng thuộc về đúng một mục đích.",
      "Quỹ dự phòng được tách ra trước và chỉ tính một lần.",
      "Thứ tự cấp tiền là quy ước cố định của công cụ: dự phòng → tiền mua nhà → mục tiêu khác. Bạn không chọn thứ tự này và công cụ không tự sắp lại theo thời điểm cần tiền.",
      "Công cụ không gợi ý sản phẩm, không đánh giá mức độ phù hợp và không giả định mức sinh lời nào cho các khoản này.",
    ],
    tableCaption: "Từng mục đích: mong muốn, phân bổ được và còn thiếu",
    itemColumn: "Mục đích",
    amountColumn: "Số tiền",
    tableHint:
      "Cột “muốn dành” là mong muốn của bạn, KHÔNG phải tiền đang có. Cột “phân bổ được” là phần khoản tiền thật cấp được, và cột “thiếu” là khoảng cách giữa hai cột đó.",
    unavailableReason:
      "Chưa có khoản tiền nào để chia, hoặc một ô nhập chưa hợp lệ.",
    unavailableRecovery:
      "Hãy nhập tổng số tiền đang có (lớn hơn 0) và kiểm tra lại các ô số tháng.",
    potBar: "Khoản tiền đang có",
    reserveSegment: "Quỹ dự phòng (giữ nguyên)",
    unallocatedSegment: "Chưa phân bổ",
    purposeWithTime: "{name} — cần sau {months} tháng",
    purposeWithoutTime: "{name} — chưa rõ thời điểm",
    summaryFunded:
      "Đã phân bổ {allocated}; còn {unallocated} chưa có mục đích.",
    summaryShort:
      "Chỉ phân bổ được {allocated} trong {requested} bạn muốn dành: thiếu {shortfall}.",
    timeUnknownNote: "Có mục đích chưa ghi thời điểm cần dùng.",
    orderNote:
      "Thứ tự cấp tiền cố định của công cụ (dự phòng → nhà → mục tiêu khác) không trùng thứ tự cần tiền sớm nhất — công cụ vẫn cấp theo quy ước đó.",
    /** `{date}` substituted: the declared anchor the months are counted from. */
    anchorNote: "Các mốc “cần sau … tháng” đếm từ ngày {date}.",
    noProductNote:
      "Công cụ không gợi ý nên gửi hay đầu tư khoản nào vào đâu.",
    monthsColumn: "Cần sau (tháng)",
    requestedColumn: "Muốn dành",
    allocatedColumn: "Phân bổ được",
    shortfallColumn: "Thiếu",
    reserveRow: "Quỹ dự phòng",
    unallocatedRow: "Chưa phân bổ",
    totalRow: "Tổng",
    noMonths: "Chưa rõ",
  },

  // The retained study. Explicitly a lesson, explicitly not the buyer default.
  advancedNotice:
    "Phần dưới là một BÀI HỌC về cách rủi ro của danh mục không bằng bình quân rủi ro các phần — hữu ích để hiểu khái niệm. Nó KHÔNG phải khuyến nghị cho khoản tiền của bạn, và đặc biệt không áp dụng cho tiền sắp dùng để mua nhà: quy tắc “một mốc trừ tuổi” không biết bạn cần tiền vào tháng nào.",

  form: {
    profileGroup: "Bạn",
    ageLabel: "Tuổi",
    ageUnit: "tuổi",
    ageHelp:
      "Quy tắc phân bổ theo tuổi lấy một mốc rồi trừ đi tuổi của bạn. Đây là một quy tắc kinh nghiệm, không phải một kết quả — xem phần cách tính.",
    riskLabel: "Mức chấp nhận rủi ro",
    riskHelp:
      "Ba mức tương ứng với ba mốc thường dùng: 100, 110 và 120 trừ đi tuổi. Chúng là quy ước phổ biến, không phải kết luận khoa học.",
    riskOptions: {
      conservative: "Thận trọng — mốc 100, giữ 10% tiền mặt",
      moderate: "Trung bình — mốc 110, giữ 5% tiền mặt",
      aggressive: "Mạnh — mốc 120, không giữ tiền mặt riêng",
    },

    holdingsGroup: "Đang giữ",
    equityHoldingLabel: "Cổ phiếu",
    bondHoldingLabel: "Trái phiếu",
    cashHoldingLabel: "Tiền mặt và tương đương",
    // đồng, not USD: the covariance arithmetic is currency-agnostic and two
    // currencies on one page bought nothing but confusion.
    holdingUnit: "₫",
    equityHoldingHelp: "Gồm cả quỹ chỉ số và quỹ mở đầu tư cổ phiếu.",
    bondHoldingHelp: "Gồm cả quỹ trái phiếu và trái phiếu chính phủ.",
    cashHoldingHelp:
      "Tiền gửi, tín phiếu ngắn hạn, quỹ thị trường tiền tệ. Để trống nếu bạn không tính khoản này vào danh mục đầu tư.",

    assumptionGroup: "Giả định lợi suất và rủi ro",
    equityReturnLabel: "Lợi suất cổ phiếu",
    bondReturnLabel: "Lợi suất trái phiếu",
    cashReturnLabel: "Lợi suất tiền mặt",
    returnUnit: "%/năm",
    // No asserted historical average: nobody here has verified a market
    // series, and the figure is the reader's assumption either way.
    equityReturnHelp:
      "Mức sinh lời bạn TỰ giả định cho nhóm cổ phiếu. Ô này đang điền sẵn 10 làm ví dụ, không phải một mức bình quân được xác nhận và không phải dự báo.",
    bondReturnHelp:
      "Mức sinh lời bạn tự giả định cho nhóm trái phiếu. Ô này đang điền sẵn 5 làm ví dụ.",
    cashReturnHelp: "Đặt bằng lãi suất tiền gửi bạn thực sự nhận được.",
    equitySigmaLabel: "Độ lệch chuẩn của cổ phiếu",
    bondSigmaLabel: "Độ lệch chuẩn của trái phiếu",
    sigmaUnit: "%/năm",
    // The old text said 16% means "roughly two thirds of years land within
    // ±16 points". That is a normal-distribution frequency claim dressed as a
    // definition — a standard deviation on its own implies no such
    // frequency, and real return series are not normal. It now says what the
    // number is and what it is used for here.
    equitySigmaHelp:
      "Thước đo mức dao động quanh mức sinh lời giả định, càng lớn thì dao động càng rộng. Trang này chỉ dùng nó để tính rủi ro của cả danh mục theo công thức hiệp phương sai — nó KHÔNG cho biết bao nhiêu phần trăm số năm sẽ rơi vào dải nào, vì điều đó còn cần một giả định về phân phối mà trang này không đưa ra.",
    bondSigmaHelp: "Trái phiếu thường dao động ít hơn, nhưng không phải bằng 0.",
    correlationLabel: "Tương quan giữa cổ phiếu và trái phiếu",
    correlationHelp:
      "Từ −1 đến 1. Đây là ô quan trọng nhất trên trang và cũng là ô ít ai biết chắc: hệ số này đã âm trong một số thập kỷ và dương rõ rệt trong những thập kỷ khác — kể cả năm 2022, khi cả hai cùng giảm.",

    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    returnInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    sigmaInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    correlationInvalid: "Vui lòng nhập một số từ −1 đến 1.",

    defaults: {
      age: "45",
      risk: "moderate",
      // Rescaled from the old USD example by 1.000, so the WEIGHTS — and
      // therefore every percentage, drift and rebalancing figure the
      // provenance header records — are unchanged. Only the currency moved.
      equityHolding: "500.000.000",
      bondHolding: "150.000.000",
      cashHolding: "50.000.000",
      equityReturn: "10",
      bondReturn: "5",
      cashReturn: "3",
      equitySigma: "16",
      bondSigma: "6",
      correlation: "0,1",
    },

    resultTitle: "Kết quả",
    maxDriftLabel: "Lệch nhiều nhất so với mục tiêu",
    pointsUnit: "điểm",
    rebalanceLabel: "Cần cân lại",
    rebalanceYes: "Có",
    rebalanceNo: "Không",
    targetReturnLabel: "Lợi nhuận kỳ vọng của mục tiêu",
    targetSigmaLabel: "Độ lệch chuẩn của mục tiêu",

    riskTitle: "Rủi ro không phải bình quân",
    averageSigmaLabel: "Nếu rủi ro cộng dồn theo tỷ trọng",
    actualSigmaLabel: "Độ lệch chuẩn thực tế của danh mục",
    benefitLabel: "Đa dạng hóa tiết kiệm được",
    ratioLabel: "Lợi nhuận trên mỗi đơn vị rủi ro",

    currentTitle: "Danh mục đang giữ",
    totalLabel: "Tổng giá trị",
    currentReturnLabel: "Lợi nhuận kỳ vọng",
    currentSigmaLabel: "Độ lệch chuẩn",
    currentRatioLabel: "Lợi nhuận trên mỗi đơn vị rủi ro",

    ruleTitle: "Quy tắc đang dùng",
    equityRuleLabel: "Cổ phiếu mục tiêu",
    cashRuleLabel: "Phần tiền mặt giữ cố định",
    bandLabel: "Dải cho phép trước khi cân lại",

    table: {
      caption: "Từng nhóm tài sản",
      classColumn: "Nhóm",
      targetColumn: "Mục tiêu",
      currentColumn: "Hiện tại",
      driftColumn: "Lệch (điểm)",
      holdingColumn: "Đang giữ",
      tradeColumn: "Mua (+) / bán (−)",
      names: {
        equity: "Cổ phiếu",
        bond: "Trái phiếu",
        cash: "Tiền mặt",
      },
      intro:
        "Cột cuối cộng lại bằng 0: cân lại là chuyển tiền giữa các nhóm, không phải thêm tiền vào. Cột “lệch” tính theo ĐIỂM PHẦN TRĂM, vì mọi dải cho phép đều được viết theo đơn vị đó — nói “thừa 20%” thì không so được giữa hai nhóm có tỷ trọng khác nhau.",
    },

    emptyNotice:
      "Bạn chưa nhập giá trị nào đang giữ, nên trang chỉ hiển thị tỷ lệ mục tiêu và các thống kê của nó. Đó là con số dùng được: nó cho biết nên chia một khoản mới theo tỷ lệ nào. Các ô về độ lệch và giao dịch để trống chứ không hiển thị 0, vì “chưa có gì” và “đang đúng tỷ lệ, không cần bán gì” là hai chuyện khác nhau.",
    rebalanceNotice:
      "Danh mục đã lệch quá dải 5 điểm, nên theo quy ước thường dùng là đến lúc cân lại. Hai điều đáng lưu ý trước khi bán: ở tài khoản chịu thuế, bán tài sản đã tăng giá sẽ phát sinh thuế lãi vốn mà bảng này không tính; và nếu bạn vẫn đang góp thêm định kỳ thì cách rẻ hơn là hướng các khoản góp mới vào nhóm đang thiếu cho đến khi tỷ lệ tự về đúng.",
    inBandNotice:
      "Danh mục vẫn nằm trong dải 5 điểm, nên chưa cần làm gì. Dải cho phép tồn tại là có lý do: cân lại quá thường xuyên phát sinh phí giao dịch và thuế, còn phần lợi ích thì nhỏ — nó không làm tăng lợi nhuận kỳ vọng mà chỉ giữ rủi ro ở mức bạn đã chọn.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Hệ số tương quan phải nằm trong khoảng −1 đến 1.",
  },

  correlationNotice:
    "Với các giá trị mặc định, tỷ lệ mục tiêu 65/30/5 có độ lệch chuẩn 10,73% một năm. Nếu rủi ro cộng dồn theo tỷ trọng như lợi nhuận, con số đó sẽ là 12,25% — nên đa dạng hóa đang tiết kiệm 1,52 điểm rủi ro, mà không hy sinh một đồng lợi nhuận kỳ vọng nào. Nhưng toàn bộ khoản tiết kiệm đó phụ thuộc vào hệ số tương quan: ở mức −0,5 nó là 2,62 điểm, ở mức 0,5 chỉ còn 0,84 điểm, và ở mức 1 thì gần như không còn gì. Hệ số này không phải một hằng số — năm 2022 cổ phiếu và trái phiếu cùng giảm, và phần bảo vệ mà một danh mục 60/40 lẽ ra được hưởng đã không xuất hiện. Hãy thử vài giá trị trước khi tin vào con số rủi ro nào.",

  // The DEFAULT mode's method, which is what belongs below the default form.
  formula: {
    title: "Cách tính phần chia tiền theo mục đích",
    body: [
      "Một khoản tiền, nhiều mục đích, và mỗi đồng chỉ thuộc về một mục đích. Công cụ không cộng thêm gì vào khoản tiền bạn nhập và không giả định mức sinh lời nào cho nó — đây là phép chia một số tiền đang có, không phải một kế hoạch tích lũy.",
      "Quỹ dự phòng được tách ra TRƯỚC và chỉ một lần. Nếu khoản tiền không đủ cho cả quỹ dự phòng thì nó nhận phần có được, và phần thiếu của chính nó được ghi riêng.",
      "Sau quỹ dự phòng, tiền được cấp theo một thứ tự CỐ ĐỊNH của công cụ, đúng theo thứ tự các nhóm ô trên trang: tiền mua nhà trước, rồi mục tiêu khác. Đây là quy ước của công cụ chứ không phải mức ưu tiên bạn chọn — trang này không có ô nào để sắp lại thứ tự. Công cụ cũng KHÔNG tự sắp theo mốc cần tiền sớm nhất, vì quyết định mục đích nào bị cắt không thuộc về một trang web; nếu thứ tự cố định đó không trùng thứ tự cần tiền của bạn, công cụ chỉ ghi nhận điều đó thành một câu.",
      "Khi tổng mong muốn lớn hơn số tiền đang có, công cụ không chia đều theo tỷ lệ. Nó cấp đủ cho từng mục đích theo thứ tự trên rồi dừng, và phần còn thiếu hiện ra ở đúng mục đích bị cắt. Tổng mong muốn không bao giờ được báo là đã có: 1,05 tỷ mong muốn trên một khoản 1 tỷ là thiếu 50 triệu, và cả hai con số đều hiển thị.",
      "“Chưa phân bổ” là phần khoản tiền không mục đích nào lấy. Nó không phải tiền dư và không phải gợi ý đầu tư; công cụ chỉ nói nó đang ở đó.",
      "Mốc “cần sau bao nhiêu tháng” được đếm từ NGÀY MỐC bạn nhập, nên mỗi mục đích có một ngày cụ thể để đối chiếu. Nếu ngày mốc không tồn tại trong tháng đích thì nó lùi về ngày cuối tháng đó — 31/1 cộng một tháng là 28/2 trong năm thường, và 29/2 trong năm nhuận — theo đúng một quy ước lịch duy nhất dùng chung cho cả trang web. Để trống số tháng vẫn là một trạng thái hợp lệ: mục đích đó vẫn được cấp tiền, nhưng công cụ ghi rõ là chưa biết thời điểm thay vì tự đặt một mốc.",
      "Công cụ không gợi ý nên gửi tiết kiệm hay mua sản phẩm nào, không đánh giá mức độ phù hợp của sản phẩm, và không tính thuế hay phí.",
    ],
  },

  // The advanced study's method. Rendered INSIDE the advanced mode, beside the
  // inputs it describes — not under the default form, where it explained
  // numbers that mode never computes.
  advancedFormula: {
    title: "Cách tính phần danh mục theo tuổi",
    body: [
      "Lợi nhuận kỳ vọng của danh mục là bình quân gia quyền lợi nhuận của từng nhóm. Phần này đơn giản và đúng theo định nghĩa.",
      "Rủi ro thì không cộng như vậy. Phương sai của danh mục là tổng của mọi cặp tỷ trọng nhân độ lệch chuẩn nhân hệ số tương quan, và độ lệch chuẩn là căn bậc hai của tổng đó. Trừ khi mọi hệ số tương quan đúng bằng 1, kết quả luôn NHỎ HƠN bình quân gia quyền của các độ lệch chuẩn. Một công cụ lấy bình quân các độ lệch chuẩn sẽ phóng đại rủi ro của mọi tỷ lệ nó hiển thị, và làm cho việc đa dạng hóa trông như không có tác dụng gì.",
      "Bộ kiểm thử chốt đúng đẳng thức đó theo cả hai chiều: ở hệ số tương quan bằng 1 thì hai con số phải trùng nhau, và ở hệ số −1 với tỷ trọng nghịch đảo hai độ lệch chuẩn thì rủi ro triệt tiêu về 0. Một công thức hiệp phương sai sai sẽ không qua được cả hai.",
      "Tương quan của tiền mặt với hai nhóm còn lại được lấy bằng 0, vì tiền mặt là một số dư ngân hàng chứ không phải một tài sản giao dịch. Độ lệch chuẩn của nó được cố định ở 1% trong module thay vì hỏi, vì không có giá trị nào hợp lý cho ô đó làm thay đổi kết quả: ở tỷ trọng tiền mặt 10%, đưa nó từ 0% lên 2% làm độ lệch chuẩn của cả danh mục dịch chưa tới một phần trăm điểm. Đó cũng là lý do ở hệ số tương quan bằng 1 khoản tiết kiệm không về đúng 0 mà còn 0,05 điểm.",
      "Tỷ lệ mục tiêu dùng quy tắc “một mốc trừ tuổi”. Quy tắc này không có cơ sở lý thuyết nào; điều nó có là hình dáng đúng — giảm cổ phiếu khi kỳ hạn còn lại ngắn đi — và ưu điểm là làm được. Ba mốc 100, 110 và 120 là ba cách đọc quy ước cho thận trọng, trung bình và mạnh. Phần cổ phiếu được kẹp vào khoảng còn lại sau khi trừ phần tiền mặt, nên ba tỷ lệ luôn cộng đúng 100 kể cả ở hai đầu độ tuổi.",
      "Độ lệch được báo theo ĐIỂM PHẦN TRĂM, không phải theo tỷ lệ tương đối. Một nhóm lẽ ra chiếm 25% mà đang chiếm 30% thì lệch 5 điểm — và mọi dải cho phép trong thực hành đều được viết theo đơn vị đó. Báo là “thừa 20%” sẽ không so được giữa các nhóm có tỷ trọng khác nhau.",
      "Các giao dịch cân lại được tính về tỷ trọng mục tiêu trên TỔNG GIÁ TRỊ HIỆN TẠI, nên chúng cộng lại bằng 0. Cân lại chuyển tiền giữa các nhóm; nó không phải một khoản góp thêm, và một trang tính ra tổng giao dịch khác 0 đã âm thầm thêm hoặc rút tiền của bạn.",
      "Trang này không tính thuế, phí giao dịch, chênh lệch giá mua bán, hay việc các tài sản nằm ở tài khoản chịu thuế hay tài khoản ưu đãi thuế — mà điều cuối cùng này thường quyết định NÊN BÁN GÌ Ở ĐÂU khi cân lại.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    // Ordered by MODE: the default allocation first, then the bridge question,
    // then the advanced study — each advanced question names its mode, so a
    // reader scanning the list can tell which tool an answer is about. They
    // stay on the page and in the FAQ schema; the review asked for separation,
    // not removal.
    items: [
      {
        q: "Công cụ cấp tiền theo thứ tự nào, và tôi có chọn được không?",
        a: "Thứ tự là cố định và do công cụ quy ước: quỹ dự phòng trước, rồi tiền mua nhà, rồi mục tiêu khác — đúng theo thứ tự các nhóm ô trên trang. Bạn không chọn thứ tự này; trang không có ô nào để sắp lại. Công cụ cũng không tự sắp theo mốc cần tiền sớm nhất, vì quyết định mục đích nào bị cắt khi thiếu tiền là quyết định của bạn chứ không phải của một trang web. Nếu thứ tự cố định đó không trùng thứ tự cần tiền theo các mốc bạn nhập, công cụ ghi nhận điều đó thành một câu ở phần kết quả và ở biểu đồ — chỉ là một ghi nhận, không phải lời khuyên. Muốn một cách chia khác, bạn đổi số tiền ở các ô cho đúng ý mình.",
      },
      {
        q: "Mốc “cần sau bao nhiêu tháng” được tính từ ngày nào?",
        a: "Từ NGÀY MỐC trong nhóm “mốc tính thời gian”, và ngày đó hiện ngay trên trang để bạn đối chiếu. Ô đang điền sẵn một ngày làm ví dụ; bấm “Hôm nay” để lấy ngày trên thiết bị của bạn — công cụ không lưu và không gửi ngày đó đi đâu. Với mốc 15/9/2026 thì “cần sau 12 tháng” là khoảng 15/9/2027. Nếu ngày mốc không tồn tại trong tháng đích, nó lùi về ngày cuối tháng: 31/1 cộng một tháng là 28/2 trong năm thường và 29/2 trong năm nhuận. Để trống số tháng vẫn hợp lệ và mục đích đó vẫn được cấp tiền — công cụ chỉ ghi rõ là chưa biết thời điểm, chứ không tự đặt một mốc cho bạn.",
      },
      {
        q: "Tổng mong muốn của tôi lớn hơn số tiền đang có thì công cụ làm gì?",
        a: "Nó nói thẳng là thiếu, và thiếu ở đâu. Công cụ KHÔNG chia đều theo tỷ lệ cho nhẹ đi, và không bao giờ báo tổng mong muốn là đã có: một khoản 1 tỷ với tổng mong muốn 1,05 tỷ hiện ra là phân bổ được 1 tỷ và còn thiếu 50 triệu, với phần thiếu nằm đúng ở mục đích bị cắt theo thứ tự cấp tiền. Phần thiếu không được vẽ vào thanh phân bổ, vì thanh đó chỉ vẽ tiền có thật — vẽ phần thiếu vào đó sẽ làm khoản tiền trông lớn hơn thực tế.",
      },
      {
        q: "“Chưa phân bổ” có phải tiền dư không?",
        a: "Không. Đó chỉ là phần tiền chưa có mục đích nào nhận, và công cụ không gợi ý làm gì với nó — không gửi tiết kiệm, không đầu tư, không sản phẩm nào. Hai việc hợp lý là đặt cho nó một mục đích, hoặc nâng quỹ dự phòng nếu bạn thấy mức dự phòng hiện tại còn mỏng. Cả hai đều là quyết định của bạn; điều công cụ làm được là không để khoản đó biến mất khỏi bảng.",
      },
      {
        q: "Quy tắc “110 trừ tuổi” ở chế độ nâng cao có đúng không?",
        a: "Nó không đúng và cũng không sai, vì nó không phải một kết quả. Không có mô hình nào suy ra được con số 110; đó là một quy ước có hình dáng hợp lý — người còn ít năm trước mặt thì chịu ít biến động hơn — và đủ đơn giản để người ta thực sự làm theo. Những thứ nó bỏ qua thì quan trọng hơn con số: bạn có bao nhiêu thu nhập ổn định ngoài danh mục, bạn có khả năng chịu được một đợt giảm 40% mà không bán hay không, và bạn còn bao nhiêu năm nữa mới cần đến tiền. Hãy dùng nó làm điểm khởi đầu rồi điều chỉnh, đừng dùng làm câu trả lời.",
      },
      {
        q: "Chế độ nâng cao: vì sao hệ số tương quan lại là một ô nhập?",
        a: "Vì nó là giả định mà con số rủi ro phụ thuộc vào nhiều nhất, và nó không phải hằng số. Với các giá trị mặc định, khoản tiết kiệm rủi ro nhờ đa dạng hóa đi từ 2,62 điểm ở hệ số −0,5 xuống 0,84 điểm ở hệ số 0,5. Trong lịch sử, tương quan giữa cổ phiếu và trái phiếu Hoa Kỳ đã âm trong phần lớn những năm 2000 và dương rõ rệt trong những giai đoạn lạm phát cao — năm 2022 là ví dụ gần nhất, khi cả hai cùng giảm mạnh. Một công cụ cài cứng một con số dễ chịu sẽ che đi đúng cái giả định đáng ngờ nhất, nên chúng tôi để bạn tự chọn và khuyến khích thử vài giá trị.",
      },
      {
        q: "Chế độ nâng cao: danh mục hiện tại có lợi nhuận cao hơn mục tiêu, sao lại phải sửa?",
        a: "Vì nó cũng có rủi ro cao hơn, và cao hơn theo tỷ lệ kém hơn. Với các giá trị mặc định, danh mục đang giữ có lợi nhuận kỳ vọng 8,43% so với 8,15% của mục tiêu — nhưng độ lệch chuẩn là 11,63% so với 10,73%, nên lợi nhuận trên mỗi đơn vị rủi ro giảm từ 0,760 xuống 0,725. Nếu bạn muốn nhiều rủi ro hơn thì cách đúng là chọn mức chấp nhận rủi ro cao hơn — nó cho bạn một tỷ lệ được thiết kế cho mức rủi ro đó — chứ không phải để danh mục lệch đi vì không cân lại.",
      },
      {
        q: "Chế độ nâng cao: bao lâu nên cân lại một lần?",
        a: "Theo dải lệch thì hợp lý hơn theo lịch. Quy ước phổ biến là cân lại khi một nhóm lệch quá 5 điểm phần trăm so với mục tiêu, thay vì cân lại vào một ngày cố định bất kể danh mục đang ở đâu. Lý do là chi phí: mỗi lần cân lại phát sinh phí giao dịch và, ở tài khoản chịu thuế, cả thuế lãi vốn — trong khi lợi ích thì không phải lợi nhuận cao hơn mà chỉ là giữ rủi ro ở mức bạn đã chọn. Nếu bạn còn đang góp thêm định kỳ, cách rẻ nhất là hướng khoản góp mới vào nhóm đang thiếu và gần như không phải bán gì.",
      },
      {
        q: "Chế độ nâng cao: vì sao độ lệch chuẩn quan trọng không kém mức sinh lời giả định?",
        a: "Vì nó là thước đo mức dao động bạn phải chịu được để có con số kia. Một mức sinh lời giả định 10% với độ dao động lớn nghĩa là những năm rất khác 10% — cả cao hơn và thấp hơn nhiều — là chuyện bình thường, không phải biến cố lạ. Chúng tôi không nói bao nhiêu phần trăm số năm rơi vào dải nào: điều đó cần một giả định về phân phối lợi suất mà trang này không đưa ra, và các chuỗi lợi suất thực tế không tuân theo phân phối chuẩn. Điều dùng được ở đây là so sánh: cùng một mức sinh lời giả định, tỷ lệ phân bổ nào cho độ dao động thấp hơn.",
      },
      {
        q: "Vì sao chế độ nâng cao không áp dụng cho tiền sắp mua nhà?",
        a: "Vì quy tắc “một mốc trừ tuổi” không biết bạn cần tiền vào tháng nào. Một người 35 tuổi cần 650 triệu trong 12 tháng và một người 35 tuổi không cần dùng tiền trong 20 năm sẽ nhận cùng một tỷ lệ gợi ý từ quy tắc đó, dù hoàn cảnh hoàn toàn khác nhau. Với khoản tiền sắp phải dùng, yếu tố quyết định là THỜI ĐIỂM cần tiền, không phải tuổi — đó là lý do chế độ mặc định của trang này bắt đầu từ mục đích và thời điểm, và phần danh mục theo tuổi được giữ lại như một bài học riêng.",
      },
    ],
  },
} as const;
