// Copy for /cong-cu/loi-nhuan-co-phieu/ — stock trade return.
//
// Original FinHome copy. The Vietnamese tax treatment is the point.
//
// A generic gain/loss calculator gets this wrong in one important way, and
// the page is built around it: personal income tax on transferring
// securities is 0,1% of the SALE VALUE, not of the profit. It is charged on a
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

export const STOCK_RETURN = {
  slug: "/cong-cu/loi-nhuan-co-phieu",

  pageTitle: "Lợi nhuận cổ phiếu sau phí và thuế",
  metaTitle: "Tính lợi nhuận cổ phiếu — Sau phí giao dịch và thuế Việt Nam",
  metaDescription:
    "Tính lãi lỗ thực của một giao dịch cổ phiếu sau phí môi giới, thuế chuyển nhượng 0,1% và thuế cổ tức 5%, kèm giá hòa vốn. Công cụ miễn phí của FinHome.",

  lede:
    "Thuế thu nhập cá nhân khi chuyển nhượng chứng khoán ở Việt Nam là 0,1% GIÁ TRỊ BÁN, không phải 0,1% lợi nhuận — nên bạn vẫn nộp thuế khi bán lỗ. Công cụ tính lãi lỗ thực sau toàn bộ phí và thuế, và cho biết giá cần đạt để hòa vốn.",

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
      "TỔNG cổ tức mỗi cổ phiếu trong toàn bộ thời gian nắm giữ, trước thuế. Để 0 nếu không có.",
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
    transferTaxHelp:
      "Thuế thu nhập cá nhân khi bán chứng khoán, hiện là 0,1% giá trị bán — thu bất kể lãi hay lỗ.",
    transferTaxInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultTransferTax: "0,1",

    dividendTaxLabel: "Thuế cổ tức",
    dividendTaxUnit: "%",
    dividendTaxHelp:
      "Thuế thu nhập cá nhân trên cổ tức tiền mặt, hiện là 5% và thường được khấu trừ tại nguồn.",
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
    "Điểm mà một công cụ tính lãi lỗ thông thường bỏ qua: thuế chuyển nhượng chứng khoán ở Việt Nam là 0,1% GIÁ TRỊ BÁN, không phải 0,1% lợi nhuận. Nó được thu ngay khi bạn bán, kể cả khi bán lỗ. Với ví dụ mặc định đổi giá bán thành 24.000 ₫ VÀ đặt ô cổ tức về 0: giá giảm 20% nhưng bạn lỗ 20,320%, và trong khoản lỗ đó có 240.000 ₫ tiền thuế trên một giao dịch không có đồng lãi nào. Cùng lý do, giá hòa vốn của bạn không phải giá mua: với phí 0,15% mỗi chiều và thuế 0,1%, cổ phiếu mua ở 30.000 ₫ và không có cổ tức phải lên 30.120 ₫ mới về vốn.",

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
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Thuế 0,1% có áp cho mọi giao dịch không?",
        a: "Với cá nhân chuyển nhượng chứng khoán, thuế thu nhập cá nhân được tính theo tỷ lệ trên giá trị chuyển nhượng từng lần, hiện là 0,1%, và công ty chứng khoán khấu trừ khi thanh toán. Không có cơ chế trừ lỗ của giao dịch này cho giao dịch khác như ở một số nước. Quy định có thể thay đổi, nên hãy kiểm tra mức hiện hành và nhập lại nếu khác.",
      },
      {
        q: "Cổ tức bằng cổ phiếu thì nhập thế nào?",
        a: "Không nhập vào ô cổ tức tiền mặt. Cổ tức bằng cổ phiếu làm số lượng cổ phiếu của bạn tăng lên và giá tham chiếu bị điều chỉnh giảm tương ứng, nên cách xử lý đúng là tăng ô số lượng và giảm ô giá mua theo tỷ lệ điều chỉnh. Phần thuế của cổ tức cổ phiếu phát sinh khi bạn bán, và nó nằm trong phần thuế chuyển nhượng.",
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
} as const;
