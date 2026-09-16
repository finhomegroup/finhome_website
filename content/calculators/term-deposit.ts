// Copy for /cong-cu/tien-gui-co-ky-han/ — the term deposit calculator.
//
// Original FinHome copy. The arithmetic follows Vietnamese bank practice.
//
// Two things this page gets right that a generic compound-interest calculator
// gets wrong, and the copy explains both:
//
// 1. Interest WITHIN a term is simple and pro-rated. A 6-month deposit at
//    5,5%/năm earns 2,75% of the principal, not (1 + 0,055/12)^6 − 1.
//    Compounding only happens at rollover, if the interest is rolled in.
// 2. Breaking a term deposit early does not give a reduced term rate; it
//    gives the DEMAND rate on the whole of the UNFINISHED term. On the
//    defaults that is 750.000 ₫ instead of 20.625.000 ₫ — a loss of
//    19.875.000 ₫. Terms that already matured and rolled over are settled
//    money and keep their term interest, so breaking exactly on a maturity
//    date loses nothing.
//
// Figures below are the tool's own output for 500 triệu, 5,5%/năm, 12 tháng:
// lãi 27.500.000 ₫, cuối kỳ 527.500.000 ₫. Ba kỳ tái tục có nhập lãi vào gốc:
// 587.120.687,50 ₫; rút lãi mỗi kỳ: 582.500.000 ₫. Gốc ở kỳ cuối của ba kỳ
// tái tục có nhập lãi: 556.512.500 ₫ (= 500.000.000 × 1,055²).
//
// Rate levels quoted in the FAQ are ranges, deliberately, and the copy says
// they move — the site is a static export and cannot know today's board rate.
//
// ORIGINAL ROW 20 added the DATE view: deposit date, term, the date the money
// is needed, the reader's rates and a renewal choice, computed by
// `deposit-plan.ts` on ACTUAL DAYS ÷ 365. The month view above is the
// months/12 approximation and stays, labelled as such. Every figure on the
// page says which view it came from, because 6 tháng is 181 days from 31/1
// and 182 in a leap year.
//
// Date-view figures quoted below are `deposit-plan.ts`'s own output for 500
// triệu, 6%/năm kỳ hạn, 0,2%/năm cho kỳ đang dở, gửi 31/1/2026, kỳ hạn 6
// tháng:
//
//   đáo hạn 31/7/2026, 181 ngày, lãi đúng hạn 14.876.712 ₫
//   cần tiền 30/4/2026 (89 ngày): thực nhận 243.836 ₫;
//     cùng 89 ngày đó theo lãi kỳ hạn là 7.315.068 ₫ — chênh 7.071.233 ₫;
//     92 ngày còn lại tới đáo hạn là 7.561.644 ₫, KHÔNG phải tiền phạt
//   tái tục: kỳ 2 mở với 514.876.712 ₫; cần tiền 31/10/2026 (92 ngày vào kỳ 2)
//     cho 259.554 ₫ lãi mới, tổng lãi qua mốc đó 15.136.267 ₫
//
// SOURCE LIMITS, recorded rather than papered over. The day-count basis is
// taken from Thông tư 14/2017/TT-NHNN's daily method (balance × annual rate
// ÷ 365, summed over the days of the period) as set out in the SBV's own
// explanatory note; the fulltext fetch of the circular itself returned 403 in
// the research pass, so the consumer copy states the basis as THIS TOOL'S
// assumption and does not claim a contract computes it identically.
//
// RE-ATTEMPTED 2026-09-16, AND THIS ROW STILL HAS NO `sources` BLOCK ON
// PURPOSE. Two things were established. The circular is CURRENT: the national
// legal database (vbpl.vn, Bộ Tư pháp) records 14/2017/TT-NHNN as còn hiệu
// lực with effect from 01/01/2018, superseding Quyết định 652/2001/QĐ-NHNN,
// and the shortened daily formula it sets out is the one this module uses. And
// the fulltext is STILL unobtainable by automated fetch — this time for a
// different reason than the 403: vbpl.vn's document page renders its content
// with client-side script, so a fetch returns the database's loading shell and
// no articles at all.
//
// So the only link that could be offered is one nobody has read. The shell's
// own `sources` docstring says a "Nguồn" heading over a link to nothing is
// worse than no heading, and unlike the United States payroll row — where an
// unread SSA link sits among IRS documents that DID verify every figure — an
// unread link would be the whole block here. The honest state is what the copy
// already does: name the circular, call the day count the tool's own
// assumption, and claim no contract computes it identically.
//
// `scripts/check-done.mjs` therefore reports this row as citing nothing a
// reader can open, which is true and should stay visible. What would close it
// is a human opening vbpl.vn in a browser and reading Điều 5 — not another
// automated attempt, which now has two independent failure modes on record. The
// early-withdrawal rule cited in the FAQ comes from the consolidated document
// 34/VBHN-NHNN (2024), Art. 4–5, read from the indexed official text after
// the linked PDF failed to render — and 47/2024/TT-NHNN amended Art. 3(3) of
// the 2022 circular from 2024-11-20, so the 2022 text is never cited as
// unchanged. No tax, deposit-insurance or holiday-adjustment rule is asserted
// as current law anywhere on this page.

export const TERM_DEPOSIT = {
  slug: "/cong-cu/tien-gui-co-ky-han",

  pageTitle: "Tiền gửi có kỳ hạn: nhận được bao nhiêu?",
  metaTitle: "Tính tiền gửi có kỳ hạn — Lãi cuối kỳ và tái tục",
  metaDescription:
    "Tính lãi tiền gửi có kỳ hạn theo đúng cách ngân hàng Việt Nam tính, kèm phương án tái tục và mức thiệt hại nếu rút trước hạn. Công cụ miễn phí của FinHome.",

  lede:
    "Lãi trong một kỳ hạn là lãi đơn và chỉ ghép lãi khi bạn tái tục cả gốc lẫn lãi. Chọn một trong hai cách tính: theo số tháng của kỳ hạn, hoặc theo NGÀY — ngày gửi, ngày đáo hạn và ngày bạn cần tiền, để biết tiền có sẵn đúng lúc hay phải rút trước hạn.",

  form: {
    modeLegend: "Bạn cần tính gì?",
    modeHelp:
      "Chế độ theo kỳ hạn tính lãi theo số tháng chia 12 — gọn để so sản phẩm. Chế độ theo ngày đếm số ngày thực tế chia 365 và đặt ngày cần tiền cạnh ngày đáo hạn; hai cách cho con số hơi khác nhau, và trang luôn ghi rõ con số nào thuộc cách nào.",
    modeTerm: "Lãi theo kỳ hạn (tính theo tháng)",
    modeDates: "Ngày cần tiền so với ngày đáo hạn",
    defaultMode: "term",

    depositGroup: "Khoản gửi",
    principalLabel: "Số tiền gửi",
    principalUnit: "₫",
    principalHelp: "Số tiền gốc bạn gửi vào.",
    principalInvalid: "Vui lòng nhập số tiền lớn hơn 0.",
    defaultPrincipal: "500.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất niêm yết cho kỳ hạn bạn chọn. Lãi suất trả lãi hằng tháng thường thấp hơn lãi cuối kỳ — hãy nhập đúng mức của sản phẩm bạn chọn.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "5,5",

    termLabel: "Kỳ hạn một lần gửi",
    termHelp: "Số tháng của một kỳ hạn: 1, 3, 6, 12, 24 là các mức phổ biến.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "12",

    payoutLabel: "Cách nhận lãi",
    payoutHelp:
      "Chọn thời điểm ngân hàng trả lãi. Cùng một kỳ hạn thì tổng lãi như nhau; chỉ khác lúc bạn nhận được tiền.",
    payoutMaturity: "Cuối kỳ",
    payoutMonthly: "Hằng tháng",
    payoutQuarterly: "Hằng quý",
    defaultPayout: "maturity",

    rolloverGroup: "Tái tục",
    cyclesLabel: "Số kỳ hạn liên tiếp",
    cyclesHelp:
      "Để 1 nếu chỉ gửi một kỳ rồi rút. Nhập 3 nếu bạn định tái tục ba lần kỳ hạn 12 tháng.",
    cyclesInvalid: "Vui lòng nhập số nguyên từ 1 trở lên.",
    defaultCycles: "1",

    compoundLegend: "Khi tái tục thì làm gì với lãi?",
    compoundHelp:
      "Chỉ có ý nghĩa khi nhận lãi cuối kỳ. Nếu bạn đã nhận lãi hằng tháng thì không còn lãi nào để nhập vào gốc.",
    compoundYes: "Nhập lãi vào gốc",
    compoundNo: "Rút lãi ra, chỉ tái tục gốc",
    defaultCompound: "yes",

    earlyGroup: "Nếu phải rút trước hạn",
    demandRateLabel: "Lãi suất cho kỳ hạn đang dở",
    demandRateUnit: "%/năm",
    demandRateHelp:
      "Mức lãi hợp đồng của bạn áp cho phần rút trước hạn. Mức 0,2 điền sẵn chỉ là ví dụ để bạn thay — con số thật phụ thuộc biểu lãi suất của ngân hàng bạn gửi tại thời điểm rút, nên hãy tra và nhập đúng mức đó.",
    demandRateInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDemandRate: "0,2",

    breakLabel: "Rút sau bao nhiêu tháng",
    breakHelp:
      "Để trống nếu bạn không cần xem phần này. Phải nhỏ hơn hoặc bằng tổng số tháng gửi. Rút đúng ngày đến hạn của một kỳ thì không bị áp lãi không kỳ hạn.",
    breakInvalid:
      "Vui lòng nhập số tháng lớn hơn 0 và không vượt tổng số tháng gửi.",
    defaultBreak: "9",

    resultTitle: "Kết quả",
    totalValueLabel: "Nhận được cuối kỳ",
    totalInterestLabel: "Tổng lãi",
    effectiveLabel: "Lãi suất thực theo năm",

    detailTitle: "Chi tiết",
    perPayoutLabel: "Lãi mỗi lần nhận, kỳ đầu",
    payoutCountLabel: "Số lần nhận lãi",
    totalMonthsLabel: "Tổng số tháng gửi",
    finalPrincipalLabel: "Gốc ở kỳ cuối",
    compoundedLabel: "Có nhập lãi vào gốc",
    yes: "Có",
    no: "Không",
    timesUnit: "lần",
    monthsUnit: "tháng",

    earlyTitle: "Nếu rút trước hạn",
    earlyInterestLabel: "Lãi thực nhận",
    earlyForegoneLabel: "Lãi đáng ra được nếu tính theo kỳ hạn",
    earlyLossLabel: "Thiệt hại do rút trước hạn",

    // ------------------------------------------- ORIGINAL ROW 20: the dates
    dateGroup: "Ngày gửi và ngày cần tiền",
    startDayLabel: "Ngày gửi",
    startMonthLabel: "Tháng gửi",
    startYearLabel: "Năm gửi",
    startDayHelp: "Ngày trong tháng bạn gửi tiền.",
    startMonthHelp: "Tháng gửi, từ 1 đến 12.",
    startYearHelp: "Năm gửi, viết liền bốn chữ số — ví dụ 2026.",
    startDayInvalid: "Ngày không tồn tại trong tháng đã chọn.",
    startMonthInvalid: "Vui lòng nhập tháng từ 1 đến 12.",
    startYearInvalid: "Vui lòng nhập năm là số nguyên, ví dụ 2026.",
    defaultStartDay: "31",
    defaultStartMonth: "1",
    defaultStartYear: "2026",

    needDayLabel: "Ngày cần tiền",
    needMonthLabel: "Tháng cần tiền",
    needYearLabel: "Năm cần tiền",
    needDayHelp:
      "Ngày bạn thực sự cần dùng đến khoản tiền này — ví dụ ngày đặt cọc hoặc ngày công chứng.",
    needMonthHelp: "Tháng cần tiền, từ 1 đến 12.",
    needYearHelp: "Năm cần tiền, viết liền bốn chữ số.",
    needDayInvalid: "Ngày không tồn tại trong tháng đã chọn.",
    needMonthInvalid: "Vui lòng nhập tháng từ 1 đến 12.",
    needYearInvalid: "Vui lòng nhập năm là số nguyên, ví dụ 2026.",
    defaultNeedDay: "30",
    defaultNeedMonth: "4",
    defaultNeedYear: "2026",

    todayLabel: "Dùng ngày hôm nay làm ngày gửi",
    todayHelp:
      "Ngày điền sẵn chỉ là ví dụ. Trang này là trang tĩnh nên không tự biết hôm nay là ngày nào; bấm nút trên để lấy ngày từ thiết bị của bạn.",

    renewLegend: "Đến hạn thì làm gì?",
    renewHelp:
      "Tái tục ở đây nghĩa là cả gốc và lãi vào kỳ hạn mới, và kỳ mới tính từ ngày đáo hạn thực tế của kỳ trước. Nếu không tái tục, mô hình coi tiền đã nhận về và KHÔNG sinh lãi thêm sau ngày đáo hạn.",
    renewYes: "Tái tục cả gốc và lãi",
    renewNo: "Nhận tiền về, không gửi tiếp",
    defaultRenew: "no",

    dateResultTitle: "Tiền có sẵn đúng lúc không?",
    maturityDateLabel: "Ngày đáo hạn kỳ đang xét",
    firstMaturityLabel: "Đáo hạn kỳ đầu tiên",
    needDateLabel: "Ngày bạn cần tiền",
    availabilityLabel: "Tình trạng",
    interestAtExitLabel: "Tổng lãi tới ngày cần tiền",
    // CORRECTED. "Tiền nhận được" implied a payout on the needed date even
    // when the deposit had matured months earlier and the proceeds were
    // simply being held. Availability and payment are now two rows.
    availableLabel: "Tiền bạn có ở ngày cần tiền",
    newPaymentLabel: "Ngân hàng trả vào ngày cần tiền",

    cashTitle: "Tiền về từ đâu",
    // The two secondary panels are collapsed behind this, AFTER the timeline
    // and the bars: always-expanded they pushed the timeline to 5.371 px on a
    // phone, ahead of the visual a reader came for.
    dateLedgerTitle: "Xem chi tiết từng ngày và từng khoản tiền",
    dateLedgerHint:
      "Số ngày của từng kỳ, lãi các kỳ đã đến hạn, tiền ngân hàng trả vào ngày cần tiền, và cách tách chênh lệch lãi suất khỏi phần ngày chưa chạy. Mở khi bạn cần đối chiếu con số.",
    dateDetailTitle: "Chi tiết theo ngày",
    currentTermDaysLabel: "Số ngày của kỳ đang xét",
    termsElapsedLabel: "Số kỳ hạn đã tính tới mốc này",
    daysHeldLabel: "Tổng số ngày kể từ ngày gửi",
    daysIntoTermLabel: "Số ngày đã chạy trong kỳ đang xét",
    daysToMaturityLabel: "Số ngày còn lại tới đáo hạn kỳ đang xét",
    maturedInterestLabel: "Lãi của các kỳ đã đến hạn",
    // CORRECTED. This read as though the figure were the current term's days
    // alone. On the renewal fixture it is 22.663.341 ₫ = 14.876.712 ₫ of
    // already-matured interest + 7.786.629 ₫ for the current term's 92 days at
    // the term rate — a TOTAL through the needed date.
    sameHorizonLabel:
      "Tổng lãi tới ngày cần tiền nếu kỳ đang xét tính theo lãi kỳ hạn (gồm cả lãi các kỳ đã đến hạn)",
    rateDifferenceLabel: "Chênh lệch do lãi suất, cùng số ngày",
    foregoneLabel: "Lãi của số ngày chưa chạy tới đáo hạn",
    heldToMaturityLabel: "Tổng lãi nếu giữ tới đáo hạn kỳ đang xét",
    cashPrincipalLabel: "Trong đó gốc nhận lại",
    cashInterestLabel: "Trong đó lãi trả ngày cần tiền",
    alreadyPaidLabel: "Lãi đã nhận ở ngày đáo hạn trước đó",
    daysUnit: "ngày",
    termsUnit: "kỳ",

    heldSinceMaturityNotice:
      "Khoản gửi đã đáo hạn trước ngày bạn cần tiền, nên vào hôm đó ngân hàng KHÔNG trả thêm gì: cả gốc và lãi đã về ở ngày đáo hạn. Dòng “Tiền bạn có ở ngày cần tiền” là số tiền đó, với giả định bạn giữ nguyên và không gửi tiếp — nếu bạn định gửi tiếp, hãy chọn tái tục để mô hình tính kỳ hạn mới.",
    renewedPrincipalNotice:
      "Vì bạn chọn tái tục, lãi của các kỳ đã đến hạn đã được nhập vào gốc. Nó nằm trong phần gốc nhận lại ở trên, không phải một khoản lãi mới — công cụ không tính nó hai lần.",
    dateModeScopeNotice:
      "Phạm vi chế độ theo ngày: giả định lãi trả vào cuối mỗi kỳ hạn, và tái tục nghĩa là cả gốc lẫn lãi vào kỳ mới. Các lựa chọn nhận lãi hằng tháng/hằng quý và tái tục chỉ gốc vẫn còn ở chế độ theo kỳ hạn; chúng KHÔNG được đưa vào phần tính theo ngày, vì mô hình này chưa mô phỏng dòng lãi trả trong kỳ.",

    availabilityBefore: "Phải rút trước hạn",
    availabilityAt: "Đúng ngày đáo hạn",
    availabilityAfter: "Sau khi đã đáo hạn",

    beforeMaturityNotice:
      "Ngày bạn cần tiền nằm TRƯỚC ngày đáo hạn, nên để có tiền bạn phải tất toán khoản gửi khi kỳ hạn còn dở. Công cụ mô phỏng rút TOÀN BỘ khoản gửi: phần đang dở chỉ được tính theo mức lãi bạn nhập cho trường hợp rút trước hạn. Một số hợp đồng cho phép rút một phần, nhưng đó là điều khoản riêng của từng sản phẩm và công cụ không giả định bạn có nó.",
    atMaturityNotice:
      "Ngày bạn cần tiền đúng bằng ngày đáo hạn, nên bạn nhận đủ lãi kỳ hạn và không phải rút trước hạn. Đây là trường hợp đáng nhắm tới khi chọn kỳ hạn.",
    afterMaturityNotice:
      "Ngày bạn cần tiền nằm SAU ngày đáo hạn. Mô hình giả định bạn nhận tiền về ở ngày đáo hạn và khoản đó KHÔNG sinh lãi thêm trong thời gian chờ — nếu bạn định gửi tiếp, hãy chọn tái tục để mô hình tính kỳ hạn mới. Công cụ không cộng thêm lãi kỳ hạn sau đáo hạn rồi vẫn nói tiền luôn sẵn sàng.",
    beyondLimitNotice:
      "Ngày cần tiền quá xa so với kỳ hạn: chuỗi tái tục cần nhiều hơn số kỳ công cụ hỗ trợ ({limit} kỳ, tối đa 1.200 tháng). Hãy chọn kỳ hạn dài hơn hoặc một ngày cần tiền gần hơn.",
    needBeforeStartNotice:
      "Ngày cần tiền đang trước ngày gửi. Công cụ không đoán bạn nhập sai ngày nào — hãy kiểm tra lại cả hai ngày.",
    dateInvalidNotice:
      "Chưa đọc được một trong hai ngày, nên chưa tính được phần theo ngày. Hãy sửa ô đang báo lỗi phía trên.",
    dayCountNotice:
      "Phần theo ngày tính lãi = số dư × lãi suất năm × SỐ NGÀY THỰC TẾ ÷ 365, cộng dồn theo từng kỳ hạn. Đây là giả định của công cụ, dựa trên phương pháp tính lãi theo ngày của Thông tư 14/2017/TT-NHNN. Hợp đồng thật có thể làm tròn khác, tính khác ngày đầu hoặc ngày cuối kỳ, và có thể dịch ngày đáo hạn khi trùng ngày nghỉ — công cụ không mô phỏng những điều đó.",
    monthEndNotice:
      // The leap year is named, for the same reason it is named on
      // /cong-cu/phan-bo-tai-san/ and in the savings-goal convention: an
      // unqualified "28/2" is wrong one year in four, and a reader checking
      // the tool against a real February would find it disagreeing.
      "Quy ước ngày: đáo hạn là ngày cùng số của tháng sau đó, co lại ở tháng ngắn — gửi 31/1 thì kỳ 1 tháng đáo hạn 28/2, hoặc 29/2 nếu là năm nhuận. Khi tái tục, kỳ sau tính từ ngày đáo hạn thực tế của kỳ trước. Đây là quy ước của công cụ; hợp đồng của bạn có thể ghi khác.",
    approximationNotice:
      "Chế độ theo kỳ hạn dùng số tháng chia 12 nên nhanh và gọn, nhưng nó là số gần đúng: cùng “6 tháng”, gửi từ 31/1/2026 là 181 ngày còn năm nhuận 2028 là 182 ngày. Khi cần đối chiếu với một ngày cụ thể, hãy dùng chế độ theo ngày.",

    compoundIgnoredNotice:
      "Bạn đang nhận lãi hằng tháng hoặc hằng quý, nên lựa chọn nhập lãi vào gốc không có tác dụng: lãi đã được trả cho bạn rồi. Nếu muốn ghép lãi, hãy chọn nhận lãi cuối kỳ.",
    // The months view's early-exit block reports the interest EARNED over the
    // period, which with a monthly or quarterly payout is not the cash paid at
    // the exit: part of it has already been received. The tool does not model
    // that reconciliation, so it says so rather than implying a single payout.
    earlyPayoutScopeNotice:
      "Bạn đang nhận lãi hằng tháng hoặc hằng quý, nên các con số ở phần rút trước hạn là tổng lãi ĐƯỢC HƯỞNG cho thời gian đã gửi, không phải số tiền trả một lần khi tất toán: một phần trong đó bạn đã nhận trước rồi. Khi tất toán, ngân hàng còn tính lại phần lãi đã trả cho kỳ đang dở theo điều khoản hợp đồng — công cụ không mô phỏng việc đối trừ đó. Nếu cần con số chính xác cho một ngày cụ thể, hãy hỏi ngân hàng.",
    payoutMismatchNotice:
      "Kỳ hạn không chia hết cho chu kỳ trả lãi bạn chọn, nên không có sản phẩm nào như vậy. Ví dụ kỳ hạn 5 tháng không thể trả lãi hằng quý. Hãy đổi kỳ hạn hoặc đổi cách nhận lãi.",
  },

  // ORIGINAL ROW 20's figure: three bars over the same deposit, so the gap
  // between taking the money early and waiting is split into its two real
  // causes instead of being drawn as one penalty.
  dateChart: {
    title: "Lãi tới ngày cần tiền, so với giữ đến đáo hạn",
    // Every bar is a TOTAL through a date, not one term's slice: after a
    // renewal each stack starts with the interest already matured.
    barAtExit: "Tổng lãi thực nhận tới ngày cần tiền",
    barSameHorizon:
      "Tổng lãi tới ngày đó nếu kỳ đang xét theo lãi kỳ hạn",
    barHeldToMaturity: "Tổng lãi nếu giữ tới đáo hạn kỳ đang xét",
    segmentMatured: "Lãi các kỳ đã đến hạn",
    segmentEarly: "Lãi kỳ đang dở, theo mức rút trước hạn",
    segmentTermRate: "Lãi kỳ đang dở, theo lãi kỳ hạn",
    segmentFuture: "Lãi của số ngày chưa chạy",
    axis: "Lãi ({unit})",
    // CORRECTED. These used to mix horizons: the first term's day count beside
    // interest earned across every term. Each sentence now names both spans.
    summaryBefore:
      "Bạn cần tiền ngày {need}, trước ngày đáo hạn {maturity} của kỳ đang chạy: kỳ đó đã chạy {days} ngày, tính từ ngày gửi là {totalDays} ngày, và tổng lãi bạn nhận qua mốc này là {interest} — gồm cả lãi của những kỳ đã đến hạn trước đó nếu có. CẢ BA cột đều là TỔNG lãi tới một mốc, không phải phần riêng của kỳ đang chạy: cột nào cũng bắt đầu bằng dải “lãi các kỳ đã đến hạn”. Cột thứ hai là tổng đó nếu kỳ đang chạy được tính theo lãi kỳ hạn — chênh lệch với cột đầu là giá của việc rút sớm. Cột thứ ba cộng thêm lãi của những ngày CHƯA chạy; phần đó là thời gian bạn chưa gửi, không phải tiền phạt.",
    summaryAt:
      "Bạn cần tiền đúng ngày đáo hạn {maturity}: kỳ hạn đó chạy đủ {days} ngày, tính từ ngày gửi là {totalDays} ngày qua {terms} kỳ hạn, và tổng lãi bạn nhận là {interest}. Không phải rút trước hạn nên không có gì để so.",
    summaryAfter:
      "Khoản gửi đáo hạn ngày {maturity} còn bạn cần tiền ngày {need}, nên tổng lãi bạn nhận là {interest} của (các) kỳ đã đủ hạn. Sau ngày đáo hạn, mô hình không cộng thêm lãi nào.",
    earlyNote:
      "Mức lãi cho kỳ đang dở là con số bạn nhập, không phải mức công cụ giả định.",
    noBreakNote: "Trường hợp này không cần rút trước hạn.",
    assumptions: [
      "Lãi tính theo số ngày thực tế chia 365, cộng dồn theo từng kỳ hạn; đây là giả định của công cụ, không phải cách tính của một hợp đồng cụ thể.",
      "Mô phỏng rút TOÀN BỘ khoản gửi khi kỳ hạn còn dở. Rút một phần là điều khoản riêng của từng sản phẩm và không được giả định ở đây.",
      "Lãi của các kỳ đã đến hạn là tiền đã chốt: nếu tái tục thì nó nằm trong gốc của kỳ sau, nếu không thì nó đã được trả cho bạn.",
      "Sau ngày đáo hạn cuối cùng được mô hình hóa, khoản tiền không sinh lãi thêm trong công cụ này.",
      "Không mô phỏng dịch ngày đáo hạn khi trùng ngày nghỉ, cũng không mô phỏng thuế hay phí.",
    ],
    tableCaption: "Các mốc ngày và từng khoản lãi",
    itemColumn: "Chỉ tiêu",
    valueColumn: "Giá trị",
    rowDepositDate: "Ngày gửi ban đầu",
    rowFirstMaturity: "Đáo hạn kỳ đầu tiên",
    rowCurrentStart: "Ngày bắt đầu kỳ đang xét",
    rowCurrentMaturity: "Đáo hạn kỳ đang xét",
    rowNeedDate: "Ngày cần tiền",
    rowTerms: "Số kỳ hạn đã tính tới mốc này",
    rowTotalDays: "Tổng số ngày kể từ ngày gửi",
    rowCurrentTermDays: "Số ngày của kỳ đang xét",
    rowDaysIntoTerm: "Số ngày đã chạy trong kỳ đang xét",
    rowDaysToMaturity: "Số ngày còn lại tới đáo hạn kỳ đang xét",
    rowMaturedInterest: "Lãi các kỳ đã đến hạn",
    rowInterestAtExit: "Tổng lãi tới ngày cần tiền",
    rowSameHorizon:
      "Tổng lãi tới ngày cần tiền nếu kỳ đang xét theo lãi kỳ hạn",
    rowRateDifference: "Chênh lệch do lãi suất, cùng số ngày",
    rowFuture: "Lãi của số ngày chưa chạy",
    rowAvailable: "Tiền bạn có ở ngày cần tiền",
    rowNewPayment: "Trong đó ngân hàng trả vào ngày cần tiền",
    rowAlreadyPaid: "Lãi đã nhận ở ngày đáo hạn trước đó",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì chưa tính được phần theo ngày.",
    unavailableRecovery:
      "Hãy kiểm tra ngày gửi, ngày cần tiền và kỳ hạn ở phía trên.",
  },

  // ORIGINAL ROW 20's other half: the timeline. The bars answer "bao nhiêu";
  // this answers "đã tới chưa".
  dateTimeline: {
    title: "Mốc thời gian: ngày gửi, đáo hạn và ngày cần tiền",
    deposit: "Ngày gửi",
    firstMaturity: "Đáo hạn kỳ đầu tiên",
    currentStart: "Bắt đầu kỳ đang xét",
    currentMaturity: "Đáo hạn kỳ đang xét",
    needDate: "Ngày bạn cần tiền",
    dayOffset: "sau {days} ngày",
    summaryBefore:
      "Ngày cần tiền ({need}) đến TRƯỚC ngày đáo hạn {maturity}, còn thiếu {days} ngày. Muốn có tiền đúng hôm đó thì phải tất toán khi kỳ hạn còn dở.",
    summaryAt:
      "Ngày cần tiền trùng đúng ngày đáo hạn {maturity}, nên tiền về đúng lúc mà không phải rút trước hạn.",
    summaryAfter:
      "Khoản gửi đã đáo hạn ngày {maturity}, tức {days} ngày trước ngày bạn cần tiền ({need}). Mô hình giả định bạn giữ số tiền đã nhận trong khoảng chờ đó và nó không sinh lãi thêm.",
    note: "Đây là hình minh họa các mốc bạn nhập, không phải lịch hẹn: công cụ không lưu, không nhắc và không đặt giao dịch nào.",
    unavailableReason:
      "Chưa vẽ được mốc thời gian vì chưa tính được phần theo ngày.",
  },

  earlyWithdrawalNotice:
    "Điều đắt nhất của tiền gửi có kỳ hạn thường không nằm ở lãi suất mà ở điều khoản rút trước hạn: phần kỳ hạn đang dở không được tính theo lãi kỳ hạn mà theo một mức thấp hơn nhiều, áp cho TOÀN BỘ thời gian của kỳ đó. Những kỳ đã đến hạn thì đã chốt lãi theo kỳ hạn nên phần đó không mất. Ví dụ điền sẵn của công cụ: 500 triệu gửi 12 tháng ở 5,5% mà rút ở tháng thứ 9, với mức 0,2%/năm bạn nhập, cho 750.000 ₫ thay vì 20.625.000 ₫ — chênh 19.875.000 ₫. Mức áp cho phần rút trước hạn là con số của hợp đồng bạn ký, nên hãy tra biểu lãi suất và nhập đúng; và nếu chưa chắc ngày cần tiền, hãy dùng chế độ theo ngày ở dưới trước khi chọn kỳ hạn.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi trong một kỳ hạn = gốc × lãi suất năm × số tháng ÷ 12. Đây là lãi ĐƠN, chia theo số tháng, không phải lãi kép. Kỳ hạn 6 tháng ở mức 5,5%/năm cho 2,75% số gốc; kỳ hạn 12 tháng cho đúng 5,5%.",
      "Cách nhận lãi không đổi tổng lãi của một kỳ hạn, chỉ đổi thời điểm nhận. Lãi mỗi lần nhận = gốc × lãi suất năm × số tháng mỗi lần ÷ 12. Ngân hàng thường niêm yết lãi suất trả lãi hằng tháng thấp hơn lãi cuối kỳ một chút — đó là mức lãi suất khác, nên hãy nhập đúng mức của sản phẩm bạn chọn.",
      "Ghép lãi chỉ xảy ra ở thời điểm tái tục, và chỉ khi bạn nhập lãi vào gốc. Ba kỳ hạn 12 tháng liên tiếp có nhập lãi vào gốc cho 500.000.000 × 1,055³ = 587.120.687,50 ₫; rút lãi mỗi kỳ chỉ cho 582.500.000 ₫ — chênh 4.620.687,50 ₫.",
      "Lãi suất thực theo năm là mức lãi kép hằng năm tương đương với kết quả cuối cùng. Nó bằng đúng lãi suất niêm yết với một kỳ hạn 12 tháng, cao hơn khi bạn tái tục có nhập lãi, và THẤP HƠN khi bạn gửi một kỳ hạn dài hơn 12 tháng — vì lãi đơn trong kỳ hạn 24 tháng kém hơn ghép lãi hai lần 12 tháng.",
      "Phần rút trước hạn tính lãi thực nhận = lãi của các kỳ đã đến hạn (theo lãi suất kỳ hạn, có ghép lãi nếu bạn nhập lãi vào gốc) + gốc đang chạy ở kỳ dở × lãi suất bạn nhập cho trường hợp rút trước hạn × số tháng đã gửi trong kỳ đó ÷ 12, rồi đặt cạnh mức lãi mà kỳ hạn đáng ra mang lại trong cùng số tháng đó. Chênh lệch giữa hai con số là phần mất đi vì lãi suất, trên cùng khoảng thời gian. Rút đúng ngày đến hạn của một kỳ thì không mất gì. Ví dụ ba kỳ 12 tháng có nhập lãi mà rút ở tháng thứ 30: nhận 57.069.013 ₫, chênh 14.747.581 ₫ — chỉ là phần của kỳ thứ ba, không phải của cả 30 tháng.",
      // ORIGINAL ROW 20. Figures from `deposit-plan.ts` on the inputs named.
      "Chế độ theo NGÀY tính lãi = số dư × lãi suất năm × số ngày thực tế ÷ 365, cộng dồn theo từng kỳ hạn, và đặt ngày bạn cần tiền cạnh ngày đáo hạn. Gửi 500 triệu ngày 31/1/2026, kỳ hạn 6 tháng ở 6%/năm thì đáo hạn 31/7/2026 — đúng 181 ngày, lãi 14.876.712 ₫. Cùng kỳ hạn đó bắt đầu 31/1/2028 lại là 182 ngày vì năm nhuận, lãi 14.958.904 ₫. Chế độ theo tháng cho 15.000.000 ₫ cho cả hai; đó là chỗ hai cách tính khác nhau.",
      "Khi ngày cần tiền đến trước ngày đáo hạn, công cụ tách khoảng cách thành HAI phần chứ không gộp thành một con số “thiệt hại”. Cần tiền ngày 30/4/2026 là 89 ngày: với mức 0,2%/năm bạn nhập, thực nhận 243.836 ₫; cùng 89 ngày đó theo lãi kỳ hạn là 7.315.068 ₫, nên phần mất vì lãi suất là 7.071.233 ₫. Phần còn lại tới đáo hạn — 7.561.644 ₫ — là lãi của 92 ngày CHƯA gửi, tức thời gian bạn chưa có, không phải tiền bị trừ. Cộng hai phần mới ra 14.632.877 ₫; gọi cả con số đó là tiền phạt là nói quá đúng bằng phần thứ hai.",
      "Nếu tái tục, kỳ sau mở bằng gốc CỘNG lãi kỳ trước và tính từ ngày đáo hạn thực tế của kỳ trước. Với ví dụ trên, kỳ hai mở ngày 31/7/2026 với 514.876.712 ₫; cần tiền ngày 31/10/2026 là 92 ngày vào kỳ hai, cho 259.554 ₫ lãi mới và tổng lãi qua mốc đó là 15.136.267 ₫. Lãi của kỳ đã đến hạn không mất và cũng không được tính hai lần: nó đã nằm trong phần gốc nhận lại. Nếu không tái tục, mô hình coi tiền đã nhận về ở ngày đáo hạn và không sinh lãi thêm — công cụ không vừa cộng lãi kỳ hạn sau đáo hạn vừa nói tiền luôn sẵn sàng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao kỳ hạn 24 tháng lại cho lãi suất thực thấp hơn niêm yết?",
        a: "Vì lãi trong một kỳ hạn là lãi đơn. Gửi 24 tháng ở 5,5%/năm cho 11% số gốc, trong khi gửi hai kỳ 12 tháng và nhập lãi vào gốc cho 11,3025%. Chênh lệch nhỏ nhưng thật, và nó lớn dần theo kỳ hạn. Bù lại, kỳ hạn dài thường được niêm yết lãi suất cao hơn — hãy so bằng dòng lãi suất thực theo năm chứ đừng so lãi suất niêm yết.",
      },
      {
        q: "Nên chọn nhận lãi cuối kỳ hay hằng tháng?",
        a: "Nếu bạn không cần dòng tiền hằng tháng, hãy chọn cuối kỳ và tái tục có nhập lãi vào gốc — cách này cho kết quả cao nhất, vì lãi suất cuối kỳ thường cao hơn và lãi được ghép. Chọn nhận lãi hằng tháng khi bạn cần tiền để chi tiêu; đừng chọn nó rồi để tiền lãi nằm trong tài khoản thanh toán, vì ở đó lãi gần như bằng 0.",
      },
      {
        q: "Chia tiền thành nhiều sổ có lợi gì?",
        a: "Nó giữ cho bạn quyền dùng một phần mà không phá cả khoản. Nếu gửi 500 triệu vào một sổ và cần 100 triệu, bạn có thể phải tất toán toàn bộ và cả 500 triệu bị tính theo mức lãi rút trước hạn. Chia thành năm sổ 100 triệu thì chỉ một sổ bị ảnh hưởng. Một số hợp đồng cho phép rút một phần và giữ nguyên lãi cho phần chưa rút, nhưng đó là điều khoản riêng của từng sản phẩm — công cụ này chỉ mô phỏng rút toàn bộ, nên hãy hỏi rõ điều khoản trước khi gửi.",
      },
      {
        q: "Rút trước hạn thì được tính lãi bao nhiêu?",
        a: "Theo mức hợp đồng của bạn, và công cụ dùng đúng con số bạn nhập. Văn bản hợp nhất 34/VBHN-NHNN (2024) về tiền gửi rút trước hạn đặt ra mức trần: phần rút trước hạn không được tính cao hơn lãi suất tiền gửi không kỳ hạn thấp nhất mà chính tổ chức đó đang áp dụng ở thời điểm rút, còn phần không rút giữ nguyên lãi suất đang áp dụng. Vì mức đó phụ thuộc vào từng ngân hàng ở từng thời điểm, trang này không điền sẵn một mức “thị trường” nào — con số 0,2 chỉ là ví dụ để bạn thay. Lưu ý thêm: Thông tư 47/2024/TT-NHNN đã sửa một phần quy định năm 2022 từ ngày 20/11/2024, nên hãy đối chiếu bản hợp nhất mới nhất và hợp đồng của bạn.",
      },
      {
        q: "Lãi tiền gửi có phải nộp thuế không?",
        a: "Công cụ KHÔNG trừ thuế, nên con số ở đây là lãi trước thuế nếu có. Nghĩa vụ thuế phụ thuộc vào bạn là cá nhân hay tổ chức và vào quy định đang áp dụng, mà quy định thuế thay đổi theo kỳ chính sách — trang này không khẳng định mức thuế hiện hành. Nếu số tiền lớn, hãy hỏi ngân hàng hoặc người làm thuế và tra văn bản đang có hiệu lực tại thời điểm bạn gửi.",
      },
      {
        q: "Tiền gửi có được bảo hiểm không?",
        a: "Việt Nam có chế độ bảo hiểm tiền gửi và nó chi trả theo một HẠN MỨC cho tất cả tiền gửi của một người tại một tổ chức tham gia bảo hiểm tiền gửi. Hạn mức này được quy định riêng và đã được điều chỉnh nhiều lần, nên trang này không ghi một con số cụ thể — hãy tra mức đang có hiệu lực. Nếu số tiền của bạn vượt hạn mức, chia sang nhiều ngân hàng là cách giảm rủi ro.",
      },
      {
        q: "Ngày đáo hạn trùng ngày nghỉ thì sao?",
        a: "Công cụ không mô phỏng việc đó. Mô hình đặt đáo hạn đúng ngày cùng số của tháng tương ứng (co lại ở tháng ngắn) và tính lãi theo số ngày thực tế chia 365. Hợp đồng thật có thể dịch ngày chi trả, có thể làm tròn khác và có thể quy ước ngày đầu/ngày cuối kỳ khác — nếu ngày cần tiền của bạn sát ngày đáo hạn, hãy hỏi ngân hàng chính xác ngày tiền về.",
      },
      {
        q: "Lãi suất công cụ điền sẵn có phải mức hiện tại không?",
        a: "Không. Đó chỉ là một con số để bạn thay. Trang này là trang tĩnh, không kết nối tới biểu lãi suất của ngân hàng nào, nên nó không thể biết mức hôm nay. Lãi suất huy động thay đổi thường xuyên và chênh nhau đáng kể giữa các ngân hàng — hãy tra mức thực tế rồi nhập vào.",
      },
    ],
  },
} as const;
