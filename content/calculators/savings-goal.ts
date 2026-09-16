// Copy for /cong-cu/muc-tieu-tiet-kiem/ — the savings goal calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Figures quoted below are the tool's own output, read off the module for
// 100 triệu ban đầu, mục tiêu 500 triệu, 60 tháng, 6%/năm ghép hằng tháng:
// cần góp 5.233.121 ₫/tháng, tổng bỏ vào 413.987.237 ₫, lãi 86.012.763 ₫
// (17,2% số cuối). Ở 0%/năm mức góp là 6.666.667 ₫ — chênh gần 1,43 triệu mỗi
// tháng. Góp 6 triệu/tháng thì đạt mục tiêu sau 53,8 tháng, hoặc sau 60 tháng
// được 553.505.198 ₫. Re-read the module if the defaults move.
//
// ORIGINAL ROW 19 added the home-purchase goal, the calendar and the
// extra-saving comparison. Its figures come from `house-fund.ts` for giá nhà
// 3 tỷ, trả trước 30%, chi phí mua 3% CỦA GIÁ NHÀ, dự phòng 150 triệu →
// mục tiêu 1,14 tỷ; đã có 300 triệu, 6%/năm, bắt đầu 15/9/2026: góp 15
// triệu/tháng đủ ở kỳ 46 (15/7/2030), góp 20 triệu/tháng đủ ở kỳ 36
// (15/9/2029) — sớm 10 tháng.
//
// TWO DEFINITIONS THE COPY MUST KEEP STRAIGHT:
//
// 1. Quỹ dự phòng nằm TRONG mục tiêu, và toàn bộ số tiền đã có được tính vào
//    mục tiêu đó. Cách định nghĩa khác — giữ dự phòng ra ngoài cả hai phía —
//    cho cùng khoảng thiếu nhưng NGÀY đạt mục tiêu khác, vì phần giữ lại
//    không còn sinh lãi trong mô hình. Trang không tuyên bố hai cách tương
//    đương.
// 2. Lãi là giả định của người dùng, áp cho toàn bộ số dư — kể cả phần sau
//    này giữ làm dự phòng. Đây là giả định, không phải sản phẩm.

export const SAVINGS_GOAL = {
  slug: "/cong-cu/muc-tieu-tiet-kiem",

  pageTitle: "Mục tiêu tiết kiệm: mỗi tháng cần góp bao nhiêu?",
  metaTitle: "Tính mục tiêu tiết kiệm — Mức góp, thời gian hoặc số cuối kỳ",
  metaDescription:
    "Tính số tiền cần góp mỗi tháng để đạt mục tiêu, thời gian cần thiết, hoặc số tiền có được sau một số tháng. Công cụ miễn phí của FinHome.",

  lede: "Chọn điều bạn cần biết, rồi nhập hai con số còn lại.",
  ledeDetailTitle: "Ba ẩn số, biết hai thì tính được cái thứ ba",
  ledeDetail:
    "Mỗi tháng cần góp bao nhiêu, mất bao lâu, hoặc cuối kỳ có bao nhiêu — cả ba chế độ dùng cùng một công thức nên chúng luôn khớp nhau. Nếu bạn đang để dành để mua nhà, chọn “Tính từ giá nhà” để công cụ cộng tiền trả trước, chi phí mua và quỹ dự phòng thành một mục tiêu duy nhất, rồi cho biết ngày đạt mục tiêu và mức góp cao hơn rút ngắn được bao lâu. Biểu đồ tách phần tiền bạn tự góp khỏi phần do lãi, vì phần bạn kiểm soát được là mức góp chứ không phải lãi suất.",

  form: {
    defaultMode: "contribution",
    modeLegend: "Bạn cần tính gì?",
    // CORRECTED. The three modes agree in the MODEL, on unrounded figures.
    // What the page displays is rounded to the đồng, so retyping a displayed
    // contribution reproduces the target to within that rounding, not exactly.
    modeHelp:
      "Ba chế độ dùng cùng một công thức nên chúng khớp nhau trong mô hình: mức góp giải ra, nếu nhập lại nguyên vẹn, sẽ về đúng mục tiêu ban đầu. Con số trên trang đã làm tròn tới đồng, nên khi bạn gõ lại mức đã làm tròn thì kết quả lệch một chút — đó là sai số làm tròn khi hiển thị, không phải hai công thức khác nhau.",
    modeContribution: "Mỗi tháng cần góp bao nhiêu",
    modeMonths: "Mất bao lâu để đạt mục tiêu",
    modeTarget: "Cuối kỳ có bao nhiêu",

    group: "Số liệu",
    initialLabel: "Số tiền đã có",
    initialUnit: "₫",
    initialHelp: "Số dư hiện tại của khoản tiết kiệm. Để 0 nếu bắt đầu từ đầu.",
    initialInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultInitial: "100.000.000",

    targetLabel: "Mục tiêu",
    targetUnit: "₫",
    targetHelp: "Số tiền bạn muốn có được.",
    targetInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTarget: "500.000.000",

    // ------------------------------------------------ ORIGINAL ROW 19: nhà
    goalSourceLegend: "Mục tiêu đến từ đâu?",
    goalSourceHelp:
      "Chọn “Tính từ giá nhà” nếu bạn đang để dành để mua nhà: công cụ sẽ cộng tiền trả trước, chi phí mua và quỹ dự phòng thành một mục tiêu duy nhất, mỗi khoản đúng một lần.",
    goalSourceAmount: "Tôi tự nhập số tiền mục tiêu",
    goalSourceHouse: "Tính từ giá nhà",
    defaultGoalSource: "amount",

    houseGroup: "Tiền cần có để mua nhà",
    priceLabel: "Giá nhà dự kiến",
    priceUnit: "₫",
    priceHelp:
      "Giá căn nhà bạn nhắm tới, theo mức giá bạn dự kiến vào THỜI ĐIỂM MUA. Công cụ không dự báo giá nhà.",
    priceInvalid: "Vui lòng nhập giá nhà lớn hơn 0.",
    defaultPrice: "3.000.000.000",

    downPercentLabel: "Tỷ lệ trả trước",
    downPercentUnit: "% giá nhà",
    downPercentHelp:
      "Phần giá nhà bạn trả bằng tiền của mình. Đây là giả định của bạn, không phải mức ngân hàng chấp nhận.",
    downPercentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultDownPercent: "30",

    costPercentLabel: "Chi phí mua nhà",
    costPercentUnit: "% giá nhà",
    costPercentHelp:
      "Thuế, phí công chứng, đăng bộ, môi giới — tính theo GIÁ NHÀ, không theo số tiền trả trước, vì chúng tăng theo giá trị căn nhà. Hãy nhập mức bạn khảo sát được.",
    costPercentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultCostPercent: "3",

    reserveLabel: "Quỹ dự phòng giữ lại",
    reserveUnit: "₫",
    reserveHelp:
      "Số tiền bạn muốn CÒN LẠI sau khi mua. Nó nằm trong mục tiêu, nên toàn bộ số tiền bạn đang có vẫn được tính vào mục tiêu — không trừ hai lần.",
    reserveInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultReserve: "150.000.000",

    compositionTitle: "Mục tiêu gồm những gì",
    downPaymentRowLabel: "Tiền trả trước",
    purchaseCostsRowLabel: "Chi phí mua nhà",
    reserveRowLabel: "Quỹ dự phòng giữ lại",
    composedTargetLabel: "Mục tiêu tích lũy",
    houseInvalidNotice:
      "Chưa tính được mục tiêu từ giá nhà: hãy kiểm tra giá nhà, hai tỷ lệ phần trăm và quỹ dự phòng ở trên.",
    // CORRECTED. This said the alternative definition's date WILL be later.
    // At a 0% rate, or with no reserve at all, the two dates coincide — and
    // whole-cycle rounding can make them coincide at other rates too.
    reserveAssumptionNotice:
      "Quỹ dự phòng được tính TRONG mục tiêu, và mô hình cho toàn bộ số dư — kể cả phần sau này giữ làm dự phòng — sinh lãi ở mức bạn nhập. Cách định nghĩa khác, giữ dự phòng ra ngoài cả mục tiêu lẫn số tiền đã có, cho đúng cùng khoảng thiếu; nhưng nếu phần giữ lại không sinh lãi thì ngày đạt mục tiêu CÓ THỂ muộn hơn con số ở đây. Ở lãi 0% hoặc khi không giữ dự phòng, hai cách cho cùng một ngày.",

    // ------------------------------------------------ ORIGINAL ROW 19: ngày
    dateGroup: "Mốc thời gian và thử góp thêm",
    startDayLabel: "Ngày bắt đầu",
    startMonthLabel: "Tháng bắt đầu",
    startYearLabel: "Năm bắt đầu",
    startDayHelp:
      "Ngày trong tháng bạn bắt đầu để dành. Các kỳ góp sau đều neo vào ngày này.",
    startMonthHelp: "Tháng bắt đầu, từ 1 đến 12.",
    startYearHelp: "Năm bắt đầu, viết liền bốn chữ số — ví dụ 2026.",
    startDayInvalid: "Ngày không tồn tại trong tháng đã chọn.",
    startMonthInvalid: "Vui lòng nhập tháng từ 1 đến 12.",
    startYearInvalid: "Vui lòng nhập năm là số nguyên, ví dụ 2026.",
    defaultStartDay: "15",
    defaultStartMonth: "9",
    defaultStartYear: "2026",
    todayLabel: "Dùng ngày hôm nay",
    todayHelp:
      "Ngày điền sẵn chỉ là ví dụ. Trang này là trang tĩnh nên không tự biết hôm nay là ngày nào; bấm nút trên để lấy ngày từ thiết bị của bạn.",

    higherContributionLabel: "Thử góp mỗi tháng",
    higherContributionUnit: "₫",
    higherContributionHelp:
      "Để trống nếu bạn không cần so sánh. Nhập một mức CAO HƠN mức góp hiện tại để xem đạt mục tiêu sớm hơn bao lâu.",
    higherContributionInvalid:
      "Vui lòng nhập một số từ 0 trở lên, hoặc để trống.",
    defaultHigherContribution: "",

    startDateLabel: "Bắt đầu để dành",
    firstContributionDateLabel: "Kỳ góp đầu tiên",
    fundedDateLabel: "Ngày đủ mục tiêu (dự kiến)",
    horizonEndDateLabel: "Ngày cuối kỳ",

    comparisonTitle: "Nếu góp thêm mỗi tháng",
    comparisonContributionLabel: "Mức góp đem so",
    comparisonMonthsLabel: "Kỳ góp đầu tiên đủ mục tiêu",
    comparisonDateLabel: "Ngày đủ mục tiêu (dự kiến)",
    monthsEarlierLabel: "Sớm hơn",
    comparisonOwnFundsLabel: "Tiền của bạn phải bỏ vào",
    comparisonInterestLabel: "Phần do lãi",
    comparisonNotHigherNotice:
      "Mức góp đem so phải CAO HƠN mức góp hiện tại mới thành một so sánh. Hãy nhập một con số lớn hơn, hoặc để trống ô đó.",
    comparisonOneLegNotice:
      "Chỉ một trong hai mức góp đạt được mục tiêu trong giới hạn công cụ hỗ trợ, nên không có số tháng rút ngắn để so. Hãy nâng mức góp hiện tại hoặc hạ mục tiêu.",
    // CORRECTED. This asserted that a higher contribution always means more
    // of your own money in and less interest. At a 0% rate both plans put in
    // exactly the target and both earn 0, so the strict inequalities are
    // false — the sentence is now shown only when the figures above actually
    // show that trade-off, and the flat case has its own line.
    comparisonTradeOffNotice:
      "Ở hai dòng trên, đạt mục tiêu sớm hơn đi kèm việc bạn bỏ vào nhiều tiền của mình hơn và nhận ít lãi hơn — vì thời gian sinh lãi ngắn lại. Đó là đánh đổi của mức góp cao hơn trong ví dụ này.",
    // CORRECTED AGAIN. This said both plans put in EXACTLY the target, which
    // only holds when the gap divides evenly by both contributions. With a
    // 1,15 tỷ target from 300 triệu, 15 triệu/tháng funds at cycle 57 with
    // 1,155 tỷ of own money and 20 triệu/tháng at cycle 43 with 1,16 tỷ — the
    // last whole contribution overshoots, and by different amounts.
    comparisonNoInterestTradeOffNotice:
      "Với lãi suất giả định bằng 0, toàn bộ số tiền cuối kỳ là tiền bạn bỏ vào và không có phần lãi nào; mức góp cao hơn chỉ rút ngắn thời gian. Hai con số “tiền của bạn phải bỏ vào” có thể lệch nhau một chút vì kỳ góp trọn vẹn cuối cùng thường vượt mục tiêu, và mỗi mức góp vượt một lượng khác nhau. Hãy thử một mức lãi lớn hơn 0 để thấy phần lãi thay đổi thế nào.",

    initialFundsLabel: "Số tiền đã có",
    laterContributionsLabel: "Tiền bạn góp thêm sau đó",
    invalidScheduleNotice:
      "Không lập được lịch tích lũy cho tổ hợp số liệu này, nên trang để trống thay vì hiển thị một kế hoạch bằng 0. Hãy kiểm tra lại các ô phía trên.",
    startDateInvalidNotice:
      "Ngày bắt đầu chưa đọc được, nên công cụ chưa thể đưa ra ngày đạt mục tiêu. Số tháng vẫn đúng; hãy sửa ngày ở trên để có mốc lịch.",
    calendarNotice:
      "Quy ước lịch: mỗi kỳ góp cách ngày bắt đầu đúng số tháng trọn vẹn, ngày trong tháng được giữ nguyên và chỉ co lại ở tháng ngắn — bắt đầu ngày 31/1 thì kỳ 1 là 28/2 (29/2 năm nhuận) và kỳ 2 quay lại 31/3, không bị lệch dần. Đây là quy ước của công cụ, không phải lịch thu tiền của một sản phẩm nào.",

    contributionLabel: "Góp mỗi tháng",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền bỏ vào cuối mỗi tháng. Để 0 nếu bạn chỉ để tiền tự sinh lãi.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultContribution: "6.000.000",

    monthsLabel: "Số tháng",
    monthsHelp:
      "Thời gian tiết kiệm, tính theo số tháng trọn vẹn — viết liền, không dấu chấm. 5 năm là 60 tháng. Công cụ hỗ trợ tối đa 1.200 tháng.",
    // CORRECTED. The earlier text said "không phải 5", but 5 months is a
    // perfectly valid horizon — the point is the GRAMMAR, not the size.
    monthsInvalid:
      "Vui lòng nhập một số nguyên tháng từ 1 đến 1.200, viết liền không dấu chấm hay dấu phẩy — ví dụ 60 hoặc 120, không phải 60,5 hay 1.200.",
    defaultMonths: "60",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất danh nghĩa hằng năm, giả định ghép lãi hằng tháng. Để 0 nếu bạn chỉ gom tiền mà không sinh lãi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "6",

    resultTitle: "Kết quả",
    contributionResultLabel: "Cần góp mỗi tháng",
    monthsResultLabel: "Kỳ góp đầu tiên đủ mục tiêu",
    targetResultLabel: "Số tiền cuối kỳ",
    monthsUnit: "tháng",
    monthsOrdinalUnit: "tháng thứ",
    yearsSuffix: "năm",

    detailDisclosureTitle: "Xem chi tiết",
    detailDisclosureHint:
      "Số dư thực tế ở kỳ góp đó, tách riêng số tiền đã có, tiền góp thêm sau đó và phần do lãi; kèm ngày bắt đầu, kỳ góp đầu tiên và ước lượng liên tục chưa làm tròn kỳ góp.",

    detailTitle: "Chi tiết",
    scheduleTitle: "Theo từng kỳ góp",
    fundedMonthLabel: "Kỳ góp đầu tiên đủ mục tiêu",
    scheduleBalanceLabel: "Số dư thực tế ở kỳ đó",
    totalContributedLabel: "Tổng số tiền bạn bỏ vào",
    interestLabel: "Phần do lãi",
    interestShareLabel: "Lãi chiếm",
    // The continuous solve is real information and it is NOT a payment date:
    // 0,367 of a contribution is not something a standing order can make. It
    // stays visible, labelled as an estimate, below the discrete figures.
    continuousEstimateLabel: "Ước lượng liên tục (chưa làm tròn kỳ góp)",
    continuousEstimateNote:
      "Ước lượng liên tục giải phương trình niên kim cho một số tháng có phần lẻ. Vì tiền chỉ vào cuối mỗi tháng, kỳ góp trọn vẹn đầu tiên đủ mục tiêu mới là mốc để lên kế hoạch — và số dư ở kỳ đó thường nhỉnh hơn mục tiêu một chút.",

    // CORRECTED. This listed "mục tiêu đã đạt" and "số dư không đổi" among
    // its causes, but the months mode now names both of those states itself —
    // so repeating them here would send a reader looking for the wrong thing.
    noResultNotice:
      "Không có đáp án cho tổ hợp số liệu này. Ở chế độ tính mức góp, nguyên nhân thường là số tiền bạn đang có tự sinh lãi đã vượt mục tiêu trong khoảng thời gian đó, nên mức góp cần thiết ra số âm — hãy hạ thời gian xuống, hoặc nâng mục tiêu lên.",
    alreadyFundedNotice:
      "Số tiền bạn đang có đã bằng hoặc vượt mục tiêu, nên không cần thêm kỳ góp nào: mốc đạt mục tiêu là ngay bây giờ. Nếu bạn muốn biết số dư sẽ thành bao nhiêu sau một thời gian nữa, hãy chuyển sang chế độ “Cuối kỳ có bao nhiêu”.",
    unattainableNotice:
      "Với mức góp 0 và lãi suất 0%, số dư không bao giờ thay đổi nên mục tiêu không bao giờ đạt được. Hãy nhập một mức góp, hoặc một lãi suất lớn hơn 0.",
    beyondLimitNotice:
      "Ở mức góp này, mục tiêu không đạt được trong 1.200 tháng — giới hạn công cụ hỗ trợ. Hãy tăng mức góp hoặc hạ mục tiêu; công cụ không ngoại suy quá giới hạn đó.",
    shortOfTargetNotice:
      "Sau số tháng bạn nhập, số dư vẫn chưa tới mục tiêu. Số dư cuối kỳ ở bảng chi tiết là con số thực tế; hãy kéo dài thời gian hoặc tăng mức góp.",
  },

  chart: {
    title: "Tiền tích lũy tới mục tiêu",
    balanceSeries: "Số dư",
    contributedSeries: "Phần bạn tự góp",
    targetReference: "Mục tiêu",
    goalMarker: "Tháng {n}: đạt mục tiêu",
    xAxis: "Tháng thứ",
    yAxis: "Số tiền ({unit})",
    summary:
      "Đạt {target} ở kỳ góp thứ {months}. Đến mốc đó {contributed} là tiền bạn tự góp và {interest} là phần do lãi. Khoảng cách giữa hai đường chính là phần lãi — phần bạn kiểm soát được là đường dưới.",
    rateNote:
      "Lãi suất là giả định bạn nhập, không phải mức được bảo đảm. Hãy thử cả mức 0% để thấy kế hoạch còn đứng được không.",
    zeroRateNote: "Với lãi 0%, hai đường trùng nhau: toàn bộ là tiền bạn góp.",
    sampledNote:
      "Kỳ hạn dài nên đường biểu đồ lấy mẫu theo bước đều thay vì vẽ từng tháng; các mốc đầu và cuối vẫn là số thực tế.",
    assumptions: [
      "Góp vào CUỐI mỗi tháng, nên khoản góp của tháng nào chỉ sinh lãi từ tháng sau.",
      "Mốc đạt mục tiêu là KỲ GÓP TRỌN VẸN đầu tiên có số dư bằng hoặc vượt mục tiêu, nên số dư ở mốc đó thường nhỉnh hơn mục tiêu.",
      "Giá nhà và số tiền trả trước cần có thể tăng trong lúc bạn tích lũy. Biểu đồ này giữ mục tiêu cố định, nên hãy xem lại mục tiêu định kỳ.",
      "Chưa tính thuế hay phí của sản phẩm gửi tiền bạn chọn.",
    ],
    tableCaption: "Số dư và phần tự góp theo từng mốc",
    monthColumn: "Tháng",
    contributedColumn: "Đã góp",
    balanceColumn: "Số dư",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì tổ hợp số liệu này không có đáp án.",
    unavailableRecovery:
      "Hãy tăng mức góp, kéo dài thời gian, hoặc hạ mục tiêu xuống trên mức bạn đang có.",
    unavailableBeyondLimit:
      "Chưa vẽ được biểu đồ vì ở mức góp này mục tiêu không đạt được trong giới hạn công cụ hỗ trợ.",
    unavailableBeyondLimitRecovery:
      "Giới hạn là {limit} tháng. Hãy tăng mức góp hoặc hạ mục tiêu — công cụ không ngoại suy quá mốc đó.",
    // A malformed entry is not an unattainable plan, and telling a reader to
    // raise their contribution when the real problem is a stray comma sends
    // them after the wrong thing.
    unavailableInvalidInput:
      "Chưa vẽ được biểu đồ vì có ô đang nhập chưa đọc được.",
    unavailableInvalidInputRecovery:
      "Hãy sửa ô đang báo lỗi phía trên — mỗi ô có ghi rõ định dạng nó nhận. Số liệu bạn đã nhập vẫn được giữ nguyên.",
  },

  // ORIGINAL ROW 19's comparison figure: two accumulation paths, one target,
  // a marker on each path's first funded cycle.
  pathsChart: {
    title: "Hai mức góp, cùng một mục tiêu",
    targetReference: "Mục tiêu",
    pathMarker: "{label}: đủ mục tiêu ở kỳ góp thứ {n}",
    xAxis: "Tháng thứ",
    yAxis: "Số dư ({unit})",
    // CORRECTED. This called the gap between the two curves "the part bought
    // by the extra contributions, not by interest". At the same month the
    // extra contributions have also earned extra interest, so the gap is not
    // a clean decomposition the way the balance-vs-contributed chart is.
    summary:
      "Mức góp hiện tại đủ mục tiêu ở kỳ thứ {base}; mức góp cao hơn đủ ở kỳ thứ {increased} — sớm hơn {earlier} tháng. Đường trên tích lũy nhanh hơn vì mỗi tháng có thêm tiền góp, và phần góp thêm đó cũng sinh lãi theo cùng mức lãi giả định; hai tác động này đi cùng nhau chứ không tách rời được trên biểu đồ.",
    // At a 0% rate there is no interest for the extra contributions to earn,
    // so the general sentence above would name an effect the figures do not
    // contain.
    summaryZeroRate:
      "Mức góp hiện tại đủ mục tiêu ở kỳ thứ {base}; mức góp cao hơn đủ ở kỳ thứ {increased} — sớm hơn {earlier} tháng. Với lãi suất giả định bằng 0, khoảng cách giữa hai đường hoàn toàn do tiền góp thêm: không có phần lãi nào trong hai con số này.",
    summaryOneLeg:
      "Chỉ một trong hai mức góp đạt được mục tiêu trong giới hạn công cụ hỗ trợ, nên không có số tháng rút ngắn để so.",
    rateNote:
      "Cả hai đường dùng cùng một lãi suất giả định bạn nhập, không phải mức được bảo đảm.",
    assumptions: [
      "Hai đường chỉ khác nhau ở mức góp mỗi tháng; số tiền đã có, lãi suất và mục tiêu giữ nguyên.",
      "Mốc đạt mục tiêu là KỲ GÓP TRỌN VẸN đầu tiên có số dư bằng hoặc vượt mục tiêu, nên phần rút ngắn là hiệu của hai kỳ góp, không phải hiệu của hai con số có phần lẻ.",
      "Đường của mức góp cao hơn kết thúc sớm hơn vì kế hoạch đó đã đủ tiền; phần sau đó không được vẽ.",
    ],
    // Only true of a table that has a row per month — the tool's. C09 shows
    // an endpoint summary table instead, so it must not inherit this clause.
    assumptionTableStops:
      "Trong bảng số liệu theo mốc tháng, các mốc sau khi một kế hoạch đã đủ tiền để trống thay vì tiếp tục cộng tiền góp mà kế hoạch đó không còn cần.",
    tableCaption: "Số dư của hai mức góp theo từng mốc",
    monthColumn: "Tháng",
    unavailableReason:
      "Chưa vẽ được biểu đồ so sánh vì một trong hai mức góp không có lịch tích lũy.",
    unavailableRecovery:
      "Hãy nhập mức góp đem so cao hơn mức hiện tại, và kiểm tra các ô đang báo lỗi.",
  },

  endOfMonthNotice:
    "Công cụ giả định bạn góp vào CUỐI mỗi tháng, tức mỗi khoản góp được tính lãi từ tháng sau. Đây là cách một lệnh chuyển tiền định kỳ hoạt động và là giả định thận trọng hơn. Nếu bạn góp vào đầu tháng, số cuối kỳ thực tế nhỉnh hơn một chút — với 12 khoản góp 1 triệu ở mức 12%/năm thì chênh lệch khoảng 127 nghìn đồng.",

  formula: {
    title: "Cách tính",
    body: [
      "Cả ba chế độ đều dựa trên cùng một quan hệ niên kim: số cuối kỳ = số đã có × (1 + r)^n + góp mỗi tháng × ((1 + r)^n − 1) ÷ r, với r là lãi suất mỗi tháng và n là số tháng. Mỗi chế độ chỉ là giải phương trình đó cho một ẩn khác.",
      "Với mặc định — 100 triệu ban đầu, mục tiêu 500 triệu, 60 tháng, 6%/năm — bạn cần góp 5.233.121 ₫ mỗi tháng. Tổng bạn bỏ vào là 413.987.237 ₫, phần còn lại 86.012.763 ₫ là do lãi, tức 17,2% số tiền cuối kỳ.",
      "Lãi suất làm được nhiều hơn cảm nhận. Cùng mục tiêu đó ở mức 0%/năm cần góp 6.666.667 ₫ mỗi tháng — nhiều hơn gần 1,43 triệu mỗi tháng chỉ vì không có lãi.",
      // The example's own inputs are named, because "53,8 tháng" is
      // meaningless without them: 100 triệu ban đầu, mục tiêu 500 triệu, góp
      // 6 triệu/tháng, lãi 6%/năm ghép hằng tháng.
      "Chế độ tính thời gian trả lời theo KỲ GÓP, không theo phần lẻ. Với 100 triệu ban đầu, mục tiêu 500 triệu, góp 6 triệu mỗi tháng và lãi 6%/năm ghép hằng tháng, phương trình niên kim cho 53,8 tháng — nhưng tiền chỉ vào cuối mỗi tháng nên 0,8 tháng không phải một khoản góp đã đến: kỳ góp trọn vẹn đầu tiên đủ mục tiêu là kỳ thứ 54, và số dư ở kỳ đó nhỉnh hơn mục tiêu một chút. Trang này lấy kỳ thứ 54 làm kết quả, giữ 53,8 ở phần chi tiết và gọi đúng tên nó là ước lượng liên tục.",
      "Khi tổ hợp số liệu không có đáp án — mục tiêu đã đạt, mức góp cần thiết ra số âm, hoặc số dư không bao giờ đổi — công cụ để trống kết quả kèm ghi chú, thay vì hiển thị số 0 hay một con số âm trông như thật.",
      // ORIGINAL ROW 19. Figures from house-fund.ts on the inputs named here.
      "Chế độ “Tính từ giá nhà” cộng ba khoản thành một mục tiêu: tiền trả trước = giá nhà × tỷ lệ trả trước, chi phí mua = giá nhà × tỷ lệ chi phí, cộng quỹ dự phòng bạn muốn giữ lại. Chi phí mua tính theo GIÁ NHÀ chứ không theo tiền trả trước, vì thuế và phí tăng theo giá trị căn nhà. Với giá 3 tỷ, trả trước 30%, chi phí 3% và dự phòng 150 triệu, mục tiêu là 900 + 90 + 150 = 1.140 triệu đồng — mỗi khoản đúng một lần.",
      // CORRECTED. This asserted the two definitions can never give the same
      // date. At a 0% rate, or with no reserve at all, they give exactly the
      // same one — and whole-cycle rounding can make them coincide at other
      // rates too.
      "Quỹ dự phòng nằm TRONG mục tiêu, nên toàn bộ số tiền bạn đang có vẫn được tính vào mục tiêu đó. Cách định nghĩa khác — giữ dự phòng ra ngoài cả mục tiêu lẫn số tiền đã có — cho đúng cùng khoảng thiếu, nhưng có thể cho một NGÀY khác: phần giữ lại khi đó không sinh lãi trong mô hình nữa. Ở ví dụ trên, đã có 300 triệu và góp 15 triệu mỗi tháng ở lãi giả định 6%/năm thì kỳ góp trọn vẹn đầu tiên đủ 1,14 tỷ là kỳ thứ 46, còn định nghĩa kia cho một mốc muộn hơn. Khi lãi suất bằng 0 hoặc bạn không giữ dự phòng, hai cách trùng nhau; việc làm tròn theo kỳ góp trọn vẹn cũng có thể khiến chúng trùng. Vì vậy trang nói rõ mình dùng cách nào thay vì gọi hai cách là tương đương.",
      "Số tháng được đổi thành ngày bằng cách cộng đúng số tháng trọn vẹn vào ngày bắt đầu, giữ nguyên ngày trong tháng và chỉ co lại ở tháng ngắn. Bắt đầu 15/9/2026, kỳ thứ 46 là 15/7/2030. Nếu góp 20 triệu mỗi tháng thì đủ ở kỳ thứ 36, tức 15/9/2029 — sớm hơn 10 tháng, và đổi lại bạn bỏ vào 1,02 tỷ tiền của mình thay vì 990 triệu. Đây là mốc để lên kế hoạch, không phải một lịch hẹn đã được đặt: công cụ không lưu, không nhắc và không gửi gì đi.",
    ],
    // What the reader controls versus what they are assuming, plus the
    // whole-cycle convention that makes the answer a date rather than a
    // fraction of a month.
    emphasis: [
      "Chế độ tính thời gian trả lời theo KỲ GÓP, không theo phần lẻ",
      "Đây là mốc để lên kế hoạch, không phải một lịch hẹn đã được đặt",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên nhập lãi suất bao nhiêu?",
        // CORRECTED. This quoted an undated 4,5–6%/năm range for Vietnamese
        // term deposits. The site is a static export with no rate feed, so it
        // cannot know today's board rate, and a stale range beside a
        // hypothetical-rate tool reads as a current quote.
        a: "Nhập mức bạn thực sự nhận được, không phải mức bạn hy vọng: lấy con số trên hợp đồng hoặc biểu lãi suất của ngân hàng bạn đang gửi. Trang này là trang tĩnh, không kết nối tới biểu lãi suất nào, nên nó không thể biết mức hôm nay và cũng không gợi ý một mức nào. Tiền gửi không kỳ hạn thấp hơn tiền gửi có kỳ hạn đáng kể. Với mục tiêu dưới ba năm, đừng nhập lãi suất của quỹ cổ phiếu — thời gian quá ngắn để chịu được một năm giảm giá. Và hãy chạy thêm một lần với lãi 0% để xem kế hoạch còn đứng được không.",
      },
      {
        q: "Kết quả có tính lạm phát không?",
        a: "Không. Cả mục tiêu và số cuối kỳ đều là số tiền danh nghĩa. Nếu giá của thứ bạn nhắm tới có thể thay đổi — một căn nhà, tiền học — thì hãy nhập mục tiêu theo mức giá bạn dự kiến vào thời điểm mua, không phải giá hôm nay. Công cụ không dự báo giá và không có con số nào đúng cho mọi trường hợp; hãy chạy vài mức mục tiêu để xem mức góp cần thiết thay đổi thế nào.",
      },
      {
        q: "Vì sao lãi chỉ chiếm 17% dù lãi suất tới 6%/năm?",
        // CORRECTED. The closing sentence asserted a universal ordering
        // between starting early and contributing more; the example shows only
        // that the interest share grows with the horizon.
        a: "Vì phần lớn số tiền cuối kỳ mới được bỏ vào gần đây, nên nó chưa có thời gian sinh lãi. Khoản góp của tháng cuối cùng gần như không sinh lãi gì. Tỷ lệ này tăng nhanh theo thời gian: cùng mức góp đó trong 240 tháng thì phần lãi chiếm hơn một nửa. Nói cách khác, thời gian là thứ làm phần lãi lớn lên, còn mức góp là thứ làm phần tiền của bạn lớn lên — với mục tiêu ngắn hạn thì mức góp gần như quyết định toàn bộ, còn mục tiêu dài thì thời gian mới phát huy. Hãy thử đổi cả hai để thấy số của bạn thay đổi thế nào.",
      },
      {
        q: "Tôi muốn tăng mức góp dần theo lương thì tính thế nào?",
        a: "Công cụ này giả định mức góp không đổi. Cách gần đúng đơn giản là chia mục tiêu thành từng chặng: chạy công cụ cho hai năm đầu với mức góp hiện tại để biết số dư cuối chặng, rồi lấy số đó làm “số tiền đã có” cho chặng tiếp theo với mức góp mới. Cách này chính xác hơn là lấy mức góp trung bình.",
      },
      {
        q: "Tiền trả trước, chi phí mua và quỹ dự phòng — có bị tính trùng không?",
        a: "Không. Mục tiêu là tổng của đúng ba khoản đó, mỗi khoản một lần: tiền trả trước theo tỷ lệ bạn chọn, chi phí mua theo tỷ lệ trên GIÁ NHÀ, và quỹ dự phòng bạn muốn còn lại sau khi mua. Vì quỹ dự phòng nằm trong mục tiêu, số tiền bạn đang có được tính vào mục tiêu đầy đủ — không bị trừ thêm một lần nữa. Mô hình cũng cho toàn bộ số dư sinh lãi ở mức bạn nhập, kể cả phần sau này giữ làm dự phòng; nếu bạn để phần đó ở nơi không sinh lãi thì ngày đạt mục tiêu CÓ THỂ muộn hơn con số ở đây — còn khi lãi suất bằng 0 hoặc bạn không giữ dự phòng thì hai cách tính cho cùng một ngày, và việc làm tròn theo kỳ góp trọn vẹn cũng có thể khiến chúng trùng.",
      },
      {
        q: "Ngày đạt mục tiêu có phải một cam kết không?",
        a: "Không. Đó là mốc suy ra từ số tháng: cộng số kỳ góp trọn vẹn vào ngày bắt đầu bạn nhập, giữ nguyên ngày trong tháng và co lại ở tháng ngắn. Nó phụ thuộc vào việc bạn góp đủ và đúng hạn, và vào lãi suất giả định. Công cụ không lưu kế hoạch, không đặt nhắc nhở và không gửi số liệu đi đâu — nếu cần theo dõi, hãy tự ghi lại con số.",
      },
      {
        q: "Nên chọn chế độ nào?",
        a: "Nếu bạn có một mốc thời gian cố định — đóng tiền nhà vào tháng 6 năm sau, học phí đầu năm học — hãy dùng chế độ tính mức góp. Nếu mức góp của bạn đã bị giới hạn bởi thu nhập, hãy dùng chế độ tính thời gian để biết thực tế bao lâu. Chế độ tính số cuối kỳ hữu ích khi bạn muốn thấy việc góp thêm một triệu mỗi tháng đổi được bao nhiêu sau năm năm.",
      },
    ],
  },
} as const;
