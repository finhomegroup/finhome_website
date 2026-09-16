// Copy for /cong-cu/loi-nhuan-co-phieu/ — stock trade return.
//
// Original FinHome copy. The Vietnamese tax treatment is the point.
//
// A generic gain/loss calculator gets this wrong in one important way, and
// the page is built around it: from 01/07/2026, under Điều 13 khoản 2 Luật
// Thuế thu nhập cá nhân số 109/2025/QH15, personal income tax on transferring
// securities is 0,1% of the SALE VALUE per transaction with no cost deduction,
// not 0,1% of the profit. It is charged on a
// losing trade too. So a 20% price fall on a share paying no dividend is a
// 20,320% loss, and the tool shows both numbers. With the shipped 1.500 ₫/cp
// dividend the same 20% fall is only a 15,577% loss — the dividend outruns
// the friction — so any copy quoting 20,320% must say "không có cổ tức".
//
// Figures quoted are for the defaults (10.000 cp, mua 30.000 ₫, bán 36.000 ₫,
// cổ tức 1.500 ₫/cp, phí 0,15% mỗi chiều, thuế cổ tức 5%, thuế chuyển nhượng
// 0,1%, giữ 2 năm): lãi ròng 72.900.000 ₫, lợi nhuận 24,264% so với 25,000%
// nếu không có phí thuế — mất 0,736 điểm phần trăm; theo năm 11,474%; phí
// 990.000 ₫, thuế 1.110.000 ₫; giá hòa vốn 28.692 ₫. Nếu bán ở 24.000 ₫ và
// không có cổ tức: lỗ 61.050.000 ₫, tức −20,320%, mà vẫn nộp 240.000 ₫ thuế
// chuyển nhượng; giá hòa vốn khi đó là 30.120 ₫.
//
// Giá hòa vốn được chặn ở 0 ₫ khi cổ tức thực nhận đã vượt tổng tiền bỏ ra
// (cổ tức mỗi cp trên 1,0542 × giá mua với các tỷ lệ mặc định): 10.000 cp mua
// 10.000 ₫, bán 15.000 ₫, cổ tức 12.000 ₫/cp cho ra −1.388 ₫ trước khi chặn,
// và ở giá bán 0 ₫ giao dịch vẫn lãi 13.850.000 ₫.
//
// BOTH PREFILLED RATES ARE STATUTORY AND BOTH ARE CORRECT. Neither number
// changed in this pass; what changed is that they used to be asserted in the
// present tense ("hiện là 0,1%", "hiện là 5%") with no instrument, no date and
// no `sources` block — the same defect `tip.ts` carried on its VAT default,
// and a reader cannot decide whether to override a default whose basis they
// cannot see. The transfer rate is Điều 13 khoản 2 Luật Thuế thu nhập cá nhân
// số 109/2025/QH15, in force 01/07/2026 (Điều 29 khoản 1; khoản 3 of the same
// article repeals Luật 04/2007/QH12), detailed at Điều 54 Nghị định
// 253/2026/NĐ-CP. The dividend rate is Điều 12 khoản 1 và khoản 2 of the same
// law, detailed at Điều 52 and withheld at source under Điều 55 khoản 1.
//
// PROVENANCE LIMIT, and it is why no decree text is quoted verbatim anywhere
// in the copy below: the law was read from its Công báo typeset copy, while
// the only signed copy of the decree that could be located is an image scan
// with no text layer, so its article contents were established by character
// recognition. Cite the decree by number and article; do not put its wording
// on the page. `sources.intro` says this to the reader.
//
// THREE QUALIFIERS THE PAGE USED TO IGNORE, now disclosed where a reader meets
// them rather than in one lump:
//
//  - Open-ended fund certificates held two years or more are EXEMPT (Điều 5
//    khoản 4 of the law; Điều 43 of the decree — holding period first in,
//    first out, and units bought before 01/07/2026 count). So the 0,1% does
//    not apply to them at all, and the transfer-tax field belongs at 0. That
//    bears on the number being typed, so it is in the field help.
//  - A stock dividend or bonus share is NOT taxed at receipt, and on disposal
//    the tax falls TWICE — 5% investment-income tax on the dividend value in
//    the accounts PLUS 0,1% transfer tax on the sale value (Điều 52 khoản 4 of
//    the decree; declared by the securities company under Điều 55 khoản 2 và
//    khoản 4). A single flat 5% dividend field cannot express that, and the
//    FAQ now says so. The answer it replaced said the stock-dividend tax
//    "nằm trong phần thuế chuyển nhượng", which is wrong: it is a second,
//    additional charge. `stock-return.test.ts` pins that it stays gone.
//  - Several lợi tức cổ phần are exempt outright with no equivalent in the
//    repealed 2007 regime (Điều 4 khoản 19, khoản 16, khoản 4), so 5% is not
//    mechanical. Its own FAQ entry.
//
// DERIVATIVES ARE OUT OF SCOPE AND THE PAGE NOW SAYS SO. The rate stays 0,1%
// per transaction but the base is a formula rather than the sale value, and
// Điều 54 khoản 5 of the decree delegates that formula to a Bộ Tài chính
// circular this project did not read. Better to decline the instrument than to
// let a page about `giá trị bán` imply it prices one.
//
// NOT CITED HERE, DELIBERATELY: Điều 19 khoản 2 of the same law also carries a
// 0,1% rate, on điểm d and điểm đ khoản 10 Điều 3 (other income). That is a
// different instrument for different property and has nothing to do with a
// share sale — conflating the two would put a wrong citation under a right
// number.

export const STOCK_RETURN = {
  slug: "/cong-cu/loi-nhuan-co-phieu",

  pageTitle: "Lợi nhuận cổ phiếu sau phí và thuế",
  metaTitle: "Tính lợi nhuận cổ phiếu — Sau phí giao dịch và thuế Việt Nam",
  metaDescription:
    "Tính lãi lỗ thực của một giao dịch cổ phiếu sau phí môi giới, thuế chuyển nhượng 0,1% và thuế cổ tức 5% theo Luật 109/2025/QH15 áp dụng từ 01/07/2026, kèm giá hòa vốn. Công cụ miễn phí của FinHome.",

  lede:
    "Từ 01/07/2026, thuế thu nhập cá nhân khi chuyển nhượng chứng khoán theo Luật Thuế thu nhập cá nhân số 109/2025/QH15 là 0,1% giá trị bán của từng lần bán và không được trừ giá vốn, chứ không phải 0,1% lợi nhuận — nên bạn vẫn nộp thuế khi bán lỗ. Công cụ tính lãi lỗ thực sau toàn bộ phí và thuế, và cho biết giá cần đạt để hòa vốn.",

  form: {
    tradeGroup: "Giao dịch",
    sharesLabel: "Số lượng cổ phiếu",
    sharesHelp: "Số cổ phiếu đã mua và bán.",
    sharesInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultShares: "10.000",

    buyLabel: "Giá mua",
    buyUnit: "₫/cp",
    buyHelp: "Giá khớp lệnh mua, chưa gồm phí.",
    buyInvalid: "Vui lòng nhập giá mua lớn hơn 0.",
    defaultBuy: "30.000",

    sellLabel: "Giá bán",
    sellUnit: "₫/cp",
    sellHelp: "Giá khớp lệnh bán, hoặc giá hiện tại nếu bạn vẫn đang giữ.",
    sellInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultSell: "36.000",

    dividendLabel: "Cổ tức tiền mặt đã nhận",
    dividendUnit: "₫/cp",
    dividendHelp:
      "Tổng cổ tức mỗi cổ phiếu trong toàn bộ thời gian nắm giữ, trước thuế. Để 0 nếu không có.",
    dividendInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDividend: "1.500",

    yearsLabel: "Thời gian nắm giữ",
    yearsUnit: "năm",
    yearsHelp:
      "Có thể là số thập phân. Để trống nếu bạn không cần con số theo năm.",
    yearsInvalid: "Thời gian nắm giữ không được là số âm.",
    defaultYears: "2",

    costGroup: "Phí và thuế",
    feeLabel: "Phí môi giới",
    feeUnit: "% mỗi chiều",
    feeHelp:
      "Tính trên giá trị giao dịch, thu cả khi mua và khi bán. Các công ty chứng khoán thường ở mức 0,1–0,35%.",
    feeInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultFee: "0,15",

    transferTaxLabel: "Thuế chuyển nhượng",
    transferTaxUnit: "% giá trị bán",
    // "hiện là 0,1% giá trị bán" NAMED NOTHING. The rate was right and the
    // basis was invisible, so a reader had no way to judge the default or to
    // know the two cases where it does not apply. `giá chuyển nhượng` is the
    // law's own term for what this page calls `giá trị bán`; both are stated
    // once so the field label and the citation cannot read as two rules.
    transferTaxHelp:
      "Thuế thu nhập cá nhân khi bán chứng khoán: tính trên giá chuyển nhượng của từng lần bán — trên trang này là giá trị bán — và không được trừ giá vốn, nên một giao dịch lỗ vẫn phải nộp. Mức 0,1% điền sẵn là mức tại Điều 13 khoản 2 Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, chi tiết ở Điều 54 Nghị định 253/2026/NĐ-CP; với chứng khoán niêm yết và đăng ký giao dịch, giá chuyển nhượng là giá khớp lệnh hoặc giá thỏa thuận do Sở giao dịch chứng khoán công bố. Hai trường hợp phải sửa ô này: chứng chỉ quỹ mở nắm giữ từ đủ 2 năm trở lên được miễn thuế, hãy nhập 0; chứng khoán phái sinh vẫn ở mức 0,1% nhưng tính trên một công thức riêng chứ không trên giá bán, nên đừng dùng công cụ này cho phái sinh. Cả hai trường hợp được nói rõ ở phần câu hỏi thường gặp; nguồn ở cuối trang.",
    transferTaxInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultTransferTax: "0,1",

    dividendTaxLabel: "Thuế cổ tức",
    dividendTaxUnit: "%",
    // "hiện là 5%" had the same problem, plus one this page owns: a single
    // flat rate on one cash field is simply the wrong shape for a holder paid
    // in shares, and the old copy did not say so anywhere the reader typing
    // the number would see it.
    dividendTaxHelp:
      "Thuế thu nhập cá nhân trên cổ tức tiền mặt: tính trên số tiền trước thuế của từng lần chi trả và do bên chi trả khấu trừ tại nguồn. Mức 5% điền sẵn là mức tại Điều 12 khoản 1 và khoản 2 Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, chi tiết ở Điều 52 và Điều 55 khoản 1 Nghị định 253/2026/NĐ-CP. Ô này chỉ dành cho cổ tức tiền mặt: cổ tức bằng cổ phiếu và cổ phiếu thưởng không bị tính thuế lúc nhận, nên nếu bạn được trả bằng cổ phiếu thì một ô 5% duy nhất không mô tả được nghĩa vụ thuế của bạn. Mức 5% cũng không áp cho mọi khoản lợi tức cổ phần — luật có thêm những diện được miễn, ví dụ thành viên hợp tác xã nông nghiệp hoặc cá nhân đầu tư vào dự án khởi nghiệp sáng tạo; nếu bạn thuộc diện đó hãy nhập 0. Cả hai trường hợp được nói rõ ở phần câu hỏi thường gặp; nguồn ở cuối trang.",
    dividendTaxInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultDividendTax: "5",

    resultTitle: "Kết quả",
    netProfitLabel: "Lãi hoặc lỗ thực",
    returnLabel: "Lợi nhuận sau phí và thuế",
    annualisedLabel: "Lợi nhuận theo năm",
    breakEvenLabel: "Giá bán để hòa vốn",

    detailTitle: "Chi tiết",
    grossReturnLabel: "Lợi nhuận nếu không có phí và thuế",
    dragLabel: "Phí và thuế làm mất",
    pointsUnit: "điểm %",
    totalCostLabel: "Tổng tiền bỏ ra, gồm phí mua",
    grossProceedsLabel: "Tiền bán trước khấu trừ",
    sellFeeLabel: "Phí bán",
    transferTaxResultLabel: "Thuế chuyển nhượng",
    netProceedsLabel: "Tiền bán thực nhận",
    grossDividendsLabel: "Cổ tức trước thuế",
    dividendTaxResultLabel: "Thuế cổ tức",
    netDividendsLabel: "Cổ tức thực nhận",
    totalFeesLabel: "Tổng phí môi giới",
    totalTaxesLabel: "Tổng thuế",

    taxedOnLossNotice:
      "Giao dịch này lỗ, và bạn vẫn phải nộp thuế chuyển nhượng vì thuế tính trên giá trị bán chứ không tính trên lợi nhuận. Đây là lý do khoản lỗ thực luôn sâu hơn khoản lỗ trước phí và thuế — hãy so hai dòng “Lợi nhuận sau phí và thuế” và “Lợi nhuận nếu không có phí và thuế” ở trên.",
    noBreakEvenNotice:
      "Tổng phí và thuế bên bán đã bằng hoặc vượt 100% giá trị bán, nên không có mức giá nào giúp hòa vốn. Hãy kiểm tra lại các tỷ lệ đã nhập.",
    alreadyBreakEvenNotice:
      "Cổ tức bạn đã nhận đã vượt toàn bộ số tiền bỏ ra, nên giao dịch này không thể lỗ: dù giá cổ phiếu về 0 bạn vẫn hòa vốn. Con số 0 ₫ ở dòng “Giá bán để hòa vốn” là mức giá thấp nhất, không phải mức giá cần đạt.",
  },

  taxOnLossNotice:
    "Điểm mà một công cụ tính lãi lỗ thông thường bỏ qua: theo Điều 13 khoản 2 Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, thuế chuyển nhượng chứng khoán là 0,1% giá trị bán của từng lần bán và không được trừ giá vốn, chứ không phải 0,1% lợi nhuận. Nó được thu ngay khi bạn bán, kể cả khi bán lỗ. Với ví dụ mặc định đổi giá bán thành 24.000 ₫ và đặt ô cổ tức về 0: giá giảm 20% nhưng bạn lỗ 20,320%, và trong khoản lỗ đó có 240.000 ₫ tiền thuế trên một giao dịch không có đồng lãi nào. Cùng lý do, giá hòa vốn của bạn không phải giá mua: với phí 0,15% mỗi chiều và thuế 0,1%, cổ phiếu mua ở 30.000 ₫ và không có cổ tức phải lên 30.120 ₫ mới về vốn.",

  formula: {
    title: "Cách tính",
    body: [
      "Bên mua: tổng tiền bỏ ra = số lượng × giá mua + phí môi giới. Với mặc định là 300.000.000 + 450.000 = 300.450.000 ₫.",
      "Bên bán: tiền thực nhận = số lượng × giá bán − phí môi giới − thuế chuyển nhượng. Thuế chuyển nhượng tính trên giá trị bán: 360.000.000 × 0,1% = 360.000 ₫. Tiền thực nhận là 359.100.000 ₫.",
      "Cổ tức: thực nhận = cổ tức trước thuế − 5% thuế. Với 1.500 ₫/cp trên 10.000 cp là 15.000.000 ₫ trước thuế và 14.250.000 ₫ sau thuế.",
      "Lãi thực = tiền bán thực nhận + cổ tức thực nhận − tổng tiền bỏ ra = 72.900.000 ₫, tức 24,264%. Nếu không có phí và thuế thì con số là 25,000% — phí và thuế lấy đi 0,736 điểm phần trăm.",
      "Giá hòa vốn được giải từ điều kiện lãi thực bằng 0. Vì mọi khoản khấu trừ bên bán đều tỷ lệ với giá bán, đây là một phép chia chứ không phải dò tìm: giá hòa vốn = (tổng tiền bỏ ra − cổ tức thực nhận) ÷ (số lượng × (1 − tỷ lệ phí − tỷ lệ thuế)). Với mặc định là 28.692 ₫ — thấp hơn giá mua vì cổ tức đã bù phần phí thuế. Không có cổ tức thì con số là 30.120 ₫.",
      "Lợi nhuận theo năm dùng lãi kép trên tổng tiền thu về, không phải lợi nhuận chia số năm.",
    ],
    // Editor-selected phrases, rendered as <strong> by `ProseText`.
    // Never markup inside the string: the paragraph stays one plain
    // string so the search index, the JSON-LD and what a reader copies
    // cannot drift from what they see. These mark the tax base that is not profit, and the break-even that is not the purchase price.
    //
    // Each phrase occurs in exactly ONE paragraph of `body`, so
    // `missingPhrases` is empty and no phrase is marked twice. They are
    // in sentence case on purpose: they REPLACE the mid-sentence capitals
    // this file used to carry, rather than wrapping <strong> around them.
    emphasis: [
      "giá trị bán",
      "giá hòa vốn",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Thuế 0,1% có áp cho mọi giao dịch không?",
        a: "Không. Với cá nhân chuyển nhượng chứng khoán, thuế thu nhập cá nhân là 0,1% giá chuyển nhượng của từng lần, không được trừ giá vốn và không có cơ chế bù lỗ của giao dịch này cho giao dịch khác như ở một số nước — theo Điều 13 khoản 2 Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, chi tiết ở Điều 54 Nghị định 253/2026/NĐ-CP. Công ty chứng khoán hoặc ngân hàng lưu ký khai và nộp thay bạn khi thanh toán (Điều 56 của nghị định). Phạm vi “chứng khoán” ở đây gồm cổ phiếu, quyền mua cổ phiếu, trái phiếu, tín phiếu, chứng chỉ quỹ, các loại chứng khoán khác và cả phần vốn góp dạng cổ phần trong công ty cổ phần (Điều 10 khoản 2 của nghị định). Hai ngoại lệ đáng biết. Thứ nhất, chứng chỉ quỹ mở nắm giữ từ đủ 2 năm trở lên được miễn thuế thu nhập cá nhân (Điều 5 khoản 4 của luật, chi tiết Điều 43 của nghị định: thời gian nắm giữ tính theo nguyên tắc vào trước ra trước, và phần mua trước 01/07/2026 vẫn được tính) — với chúng hãy đặt ô thuế chuyển nhượng về 0. Thứ hai, chứng khoán phái sinh vẫn ở mức 0,1% nhưng tính trên một công thức riêng chứ không trên giá bán, và Điều 54 khoản 5 của nghị định giao công thức đó cho một thông tư của Bộ Tài chính mà trang này không đọc — nên đừng dùng công cụ này cho phái sinh.",
      },
      {
        q: "Cổ tức bằng cổ phiếu thì nhập thế nào?",
        a: "Không nhập vào ô cổ tức tiền mặt, và hãy biết trước rằng một ô thuế cổ tức 5% duy nhất không mô tả được trường hợp này. Cổ tức bằng cổ phiếu và cổ phiếu thưởng không bị tính thuế lúc nhận: chúng làm số lượng cổ phiếu của bạn tăng lên và giá tham chiếu bị điều chỉnh giảm tương ứng, nên cách xử lý trong công cụ là tăng ô số lượng và giảm ô giá mua theo tỷ lệ điều chỉnh. Nghĩa vụ thuế dồn sang lúc bạn bán, và khi đó nó rơi hai lần chứ không phải một: 5% thuế thu nhập từ đầu tư vốn trên giá trị cổ tức ghi trên sổ sách kế toán, hoặc trên số cổ phiếu nhận được nhân mệnh giá — nếu giá bán thấp hơn mệnh giá thì tính theo giá thị trường tại thời điểm chuyển nhượng — cộng thêm 0,1% thuế chuyển nhượng trên giá trị bán. Cơ sở là Điều 52 khoản 4 Nghị định 253/2026/NĐ-CP, và công ty chứng khoán hoặc ngân hàng lưu ký là bên khai và nộp phần thuế đầu tư vốn dồn lại đó (Điều 55 khoản 2 và khoản 4). Vì vậy với người được trả bằng cổ phiếu, con số trên trang này chỉ đúng cho phần tiền mặt và phần chuyển nhượng; khoản 5% dồn lại nằm ngoài phép tính.",
      },
      {
        q: "Có khoản cổ tức nào không chịu 5% không?",
        a: "Có, và đây là điểm khác so với quy định đã được thay thế. Luật Thuế thu nhập cá nhân số 109/2025/QH15 miễn thuế cho thu nhập từ đầu tư vốn của cá nhân đầu tư vào dự án khởi nghiệp sáng tạo, của người sáng lập doanh nghiệp khởi nghiệp sáng tạo và của cá nhân góp vốn vào quỹ đầu tư khởi nghiệp sáng tạo (Điều 4 khoản 19, chi tiết Điều 37 khoản 1 Nghị định 253/2026/NĐ-CP); miễn thuế cho lãi trái phiếu xanh (Điều 4 khoản 16); và miễn thuế cho lợi tức cổ phần của thành viên hợp tác xã nông nghiệp cũng như của cá nhân ký hợp đồng với doanh nghiệp theo mô hình “Cánh đồng lớn” (Điều 4 khoản 4, chi tiết Điều 22 của nghị định). Nên 5% không áp dụng một cách máy móc cho mọi khoản lợi tức cổ phần: nếu khoản của bạn thuộc một trong các diện trên, hãy đặt ô thuế cổ tức về 0. Trang này không xác định trường hợp của bạn thuộc diện nào — hãy đối chiếu bản công bố chính thức ở phần nguồn.",
      },
      {
        q: "Vì sao giá hòa vốn lại thấp hơn giá mua?",
        a: "Vì cổ tức bạn đã nhận được trừ vào phần cần thu hồi. Với mặc định, 14.250.000 ₫ cổ tức thực nhận nhiều hơn tổng phí và thuế, nên bạn có thể bán dưới giá mua mà vẫn hòa vốn. Đặt ô cổ tức về 0 và giá hòa vốn lập tức lên trên giá mua — đó là trường hợp thường gặp hơn.",
      },
      {
        q: "Công cụ có tính phí lưu ký và phí ứng tiền không?",
        a: "Không. Phí lưu ký tính theo số lượng cổ phiếu mỗi tháng và rất nhỏ, còn phí ứng trước tiền bán chỉ phát sinh nếu bạn dùng. Nếu chúng đáng kể với bạn, hãy cộng vào ô phí môi giới dưới dạng một tỷ lệ tương đương. Phí giao dịch ký quỹ thì hoàn toàn nằm ngoài phép tính này.",
      },
      {
        q: "Tôi giao dịch nhiều lần thì tính thế nào?",
        a: "Công cụ tính một lần mua và một lần bán. Nếu bạn mua nhiều lần, hãy dùng giá mua bình quân gia quyền và tổng số lượng. Nếu bán nhiều lần thì chạy công cụ riêng cho từng lần bán, vì thuế chuyển nhượng được tính theo từng lần và không bù trừ giữa các lần.",
      },
    ],
  },

  // THE REFERENCES, AS LINKS, because this page prefills two legal parameters
  // and `components/calc/calculator-page.tsx` says in as many words that
  // naming a decree in prose is not a citation a reader can check. The route
  // has to pass this through — a declared block that no route wires renders
  // nothing, which `sources-wiring.test.ts` exists to catch.
  //
  // `intro` carries the provenance limit, and here it carries a SECOND one
  // the other sourced rows do not have: the law's Công báo typeset copy was
  // read directly, while the decree's only locatable signed copy is an image
  // scan. That asymmetry is why every decree reference below is a number and
  // an article rather than a quotation.
  sources: {
    title: "Nguồn cho hai mức thuế điền sẵn",
    intro:
      "Hai mức điền sẵn — 0,1% thuế chuyển nhượng và 5% thuế cổ tức — đều lấy từ Luật Thuế thu nhập cá nhân số 109/2025/QH15, áp dụng từ 01/07/2026, cùng các điều tương ứng của Nghị định 253/2026/NĐ-CP. Chúng được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Hai bản không cùng mức độ chắc chắn: bản Công báo của luật là bản chữ và được đọc trực tiếp, còn bản ký số của nghị định là bản chụp không có lớp văn bản nên nội dung các điều được xác lập bằng nhận dạng ký tự — vì vậy trang chỉ dẫn số điều của nghị định chứ không trích nguyên văn. Cách xác định cơ sở tính thuế của chứng khoán phái sinh được Điều 54 khoản 5 của nghị định giao cho một thông tư của Bộ Tài chính mà dự án không đọc, nên công cụ này không dùng cho phái sinh. Đây không phải danh sách đầy đủ và không phải tư vấn thuế.",
    items: [
      {
        url: "https://congbaocdn.chinhphu.vn/180507251028987904/2026/1/24/109signed-17692403594311667615452.pdf",
        label:
          "Luật Thuế thu nhập cá nhân số 109/2025/QH15 — bản Công báo dạng chữ",
        note: "Nguồn của cả hai mức điền sẵn: Điều 13 khoản 2 (0,1% trên giá chuyển nhượng từng lần, không trừ giá vốn) và Điều 12 khoản 1 và khoản 2 (5% với lợi tức cổ phần). Cũng là nguồn của các diện miễn nêu trên trang: Điều 5 khoản 4 cho chứng chỉ quỹ mở nắm giữ từ đủ 2 năm, và Điều 4 khoản 19, khoản 16, khoản 4. Hiệu lực từ 01/07/2026 theo Điều 29 khoản 1; Điều 29 khoản 3 bãi bỏ Luật Thuế thu nhập cá nhân số 04/2007/QH12. Cá nhân không cư trú áp cùng hai mức này tại Điều 23 khoản 2 và Điều 22.",
      },
      {
        url: "https://congbao.chinhphu.vn/van-ban/luat-so-109-2025-qh15-468671.htm",
        label: "Luật số 109/2025/QH15 — trang văn bản trên Công báo",
        note: "Trang tra cứu của cùng văn bản, để bạn đối chiếu số hiệu và ngày ban hành nếu đường dẫn bản Công báo ở trên thay đổi.",
      },
      {
        url: "https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/7/253m-ndcp.signed.pdf",
        label: "Nghị định số 253/2026/NĐ-CP — bản ký số, dạng bản chụp",
        note: "Nguồn của phần chi tiết: Điều 54 và Điều 56 (cách tính thuế chuyển nhượng, và việc công ty chứng khoán hoặc ngân hàng lưu ký khai nộp thay); Điều 9 khoản 2 với Điều 52 khoản 1 đến khoản 3 cho cổ tức, khấu trừ tại nguồn theo Điều 55 khoản 1; Điều 52 khoản 4 cùng Điều 55 khoản 2 và khoản 4 cho cổ tức bằng cổ phiếu; Điều 43 cho thời gian nắm giữ chứng chỉ quỹ mở; Điều 10 khoản 2 cho phạm vi chứng khoán; Điều 37 khoản 1 và Điều 22 cho các diện miễn. Bản này không có lớp văn bản nên phải đọc bằng nhận dạng ký tự, và không tìm được bản Công báo dạng chữ của nghị định.",
      },
    ],
  },
} as const;
