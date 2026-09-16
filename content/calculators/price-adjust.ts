// Copy for /cong-cu/giam-gia-va-thue/ — the discount and tax calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The whole editorial point of this page is the tax-included default. Most
// discount-and-tax calculators are written for the United States, where sales
// tax is added at the till, and they add VAT on top of a Vietnamese shelf
// price — which overstates the answer by the tax rate. Here the default is
// "giá đã gồm thuế", because that is how a Vietnamese retail price is
// normally quoted, and the copy explains the switch rather than burying it.
//
// TWO UNDATED CLAIMS WERE SOFTENED (original row 60 / the P3 scope audit):
// the help text asserted a current standard VAT rate and a reduced rate for
// some goods, and the FAQ asserted what consumer-protection law requires a
// displayed price to be. The stated reason was: "Nobody here has read either
// instrument, both change by dated decree, and the rate is the reader's own
// input regardless." Both were reworded to describe the common convention and
// point the reader at their own invoice.
//
// THAT PREMISE HAS SINCE CHANGED FOR THE VAT CLAIM AND NOT FOR THE OTHER ONE.
// They are kept apart deliberately:
//
// - THE VAT RATE IS NOW RE-STATED ON EVIDENCE, NOT REVERTED BY OPINION. The
//   instrument has been read: the official Công báo typeset text of Nghị định
//   174/2025/NĐ-CP including both appendices, by two agents independently, the
//   second briefed to refute the first (2026-09-16 source review, the same one
//   behind `content/calculators/tip.ts`). So the "nobody has read it" reason no
//   longer holds here, and the softening is lifted: `defaultTax` is 8 because
//   that is the rate on an ordinary Vietnamese retail invoice on today's date
//   (Điều 1 khoản 2 điểm a, in force to the end of 31/12/2026 per Điều 2
//   khoản 1), the `taxHelp` carries the instrument, the article, the expiry,
//   the categories that stay at 10% and the seller's-method caveat, and
//   `sources` gives the reader the two Công báo PDFs to check. 10 was never a
//   neutral placeholder — prefilling it is an implicit claim that no reduction
//   is in force, which is the mirror image of the defect the tip page had.
//   `defaultTax` STAYS EDITABLE and the copy says when the reader's own number
//   differs; that is the design, not a concession.
//
// - THE CONSUMER-PROTECTION SOFTENING STANDS, UNTOUCHED. Nobody has read that
//   instrument. The FAQ and `taxIncludedHelp` still describe the retail
//   convention and send the reader to their own invoice, and they must keep
//   doing so. Do not restore, strengthen or cite that claim on the strength of
//   the VAT review above: it read a VAT decree and a VAT law, and neither says
//   anything about what a displayed price must be.
//
// AND THE SCOPE IS STATED: this is a single transaction, not the tax and fee
// budget of a property purchase. `scopeNotice` says so above the tool, because
// a reader who takes "giá cuối phải trả" as the cost of buying a house has
// been misled by the page rather than by their own reading.

export const PRICE_ADJUST = {
  slug: "/cong-cu/giam-gia-va-thue",

  pageTitle: "Giảm giá và thuế: bạn thực trả bao nhiêu?",
  metaTitle: "Tính giảm giá và thuế VAT — Giá cuối phải trả",
  metaDescription:
    "Nhập giá niêm yết, phần trăm giảm, voucher và thuế VAT để biết giá cuối phải trả và số tiền tiết kiệm được. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập giá niêm yết cùng các mức giảm để biết bạn thực trả bao nhiêu và tiết kiệm được bao nhiêu. Mặc định công cụ hiểu giá niêm yết đã gồm thuế — đúng như cách giá được ghi tại Việt Nam.",

  form: {
    priceGroup: "Giá và thuế",
    priceLabel: "Giá niêm yết",
    priceUnit: "₫",
    priceHelp: "Giá ghi trên nhãn hoặc trên trang bán hàng.",
    priceInvalid: "Vui lòng nhập giá lớn hơn 0.",
    defaultPrice: "1.000.000",

    taxLabel: "Thuế hoặc phụ phí",
    taxUnit: "%",
    // THE PREFILLED RATE IS 8, AND IT IS A DATED LEGAL PARAMETER, NOT AN
    // EXAMPLE. See the header note: this is the one of the page's two softened
    // claims whose premise has changed, because the decree has now been read.
    // The help text has to carry what a reader needs in order to judge whether
    // to override the default: the rate's instrument and article, its expiry,
    // the categories that never got the reduction, and the fact that the rate
    // depends on the SELLER's VAT method. That last one is why 8 cannot be
    // presented as a universal retail rate.
    taxHelp:
      "Ô này điền sẵn 8, là thuế suất trên một hóa đơn bán lẻ thông thường ở thời điểm này. Đó là mức giảm 2 điểm phần trăm so với mức phổ thông 10% tại khoản 3 Điều 9 Luật Thuế giá trị gia tăng số 48/2024/QH15; con số 8% nằm tại Điều 1 khoản 2 điểm a Nghị định 174/2025/NĐ-CP ban hành theo Nghị quyết 204/2025/QH15, và Điều 2 khoản 1 của nghị định đó ghi hiệu lực từ 01/07/2025 đến hết 31/12/2026 — từ 01/01/2027 mức phổ thông trở lại là 10% nếu Quốc hội không quyết định khác. Số của bạn sẽ khác 8 trong những trường hợp sau. Thứ nhất, những nhóm bị loại khỏi diện được giảm vẫn ở 10%: đó là hàng hóa và dịch vụ chịu thuế tiêu thụ đặc biệt — thuốc lá, rượu, bia, nước giải khát có hàm lượng đường trên 5 g/100 ml, điều hòa trên 24.000 BTU đến 90.000 BTU, xe dưới 24 chỗ, mô tô trên 125 cm³, vàng mã, bài lá, cùng dịch vụ karaoke, massage, vũ trường, golf, casino, đặt cược và xổ số — cùng các nhóm tại Phụ lục I như sản phẩm kim loại, viễn thông, tài chính - ngân hàng - bảo hiểm và bất động sản; riêng xăng thì vẫn được giảm, vì Điều 1 khoản 1 điểm b loại xăng ra khỏi nhóm chịu thuế tiêu thụ đặc biệt bị trừ này. Thứ hai, mức 8% là dành cho người bán nộp thuế theo phương pháp khấu trừ: người bán nộp theo tỷ lệ phần trăm trên doanh thu được giảm 20% mức tỷ lệ của họ (Điều 1 khoản 2 điểm b) chứ không về 8%, và nhiều người bán nhỏ không xuất hóa đơn giá trị gia tăng nào. Vì vậy 8% không phải một mức bán lẻ đúng cho mọi trường hợp — hãy nhập đúng thuế suất hoặc phụ phí ghi trên hóa đơn/báo giá của bạn, vì hóa đơn của bạn là căn cứ, không phải con số điền sẵn ở đây. Xem phần nguồn ở cuối trang.",
    // 0–100, not "không được là số âm". The field accepted 500, which is not a
    // rate anyone can be invoiced, while the two discount percentage fields in
    // the same component have enforced 0–100 all along — an inconsistency
    // inside one file rather than a considered asymmetry.
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTax: "8",

    taxIncludedLegend: "Giá niêm yết đã gồm thuế chưa?",
    taxIncludedHelp:
      "Giá bán lẻ cho người tiêu dùng tại Việt Nam thường được niêm yết là số tiền thực phải trả, nên “đã gồm thuế” là lựa chọn phù hợp trong phần lớn trường hợp. Chọn “chưa gồm thuế” khi báo giá hoặc hóa đơn ghi rõ giá trước thuế. Nếu không chắc, hãy xem chính hóa đơn của bạn.",
    taxIncludedYes: "Đã gồm thuế",
    taxIncludedNo: "Chưa gồm thuế",
    defaultTaxIncluded: "yes",

    discountGroup: "Giảm giá",
    discountPercentLabel: "Giảm lần 1 theo phần trăm",
    discountPercentUnit: "%",
    discountPercentHelp: "Tính trên giá niêm yết, ví dụ 20 cho chương trình giảm 20%.",
    discountPercentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultDiscountPercent: "20",

    // The second percentage is what makes the non-additivity demonstrable on
    // the page instead of asserted in a FAQ answer.
    secondDiscountPercentLabel: "Giảm lần 2 theo phần trăm",
    secondDiscountPercentHelp:
      "Tính trên giá SAU khi đã giảm lần 1, đúng như cách các chương trình chồng nhau hoạt động. Để 0 nếu chỉ có một mức giảm.",
    defaultSecondDiscountPercent: "10",

    discountAmountLabel: "Giảm thêm theo số tiền",
    discountAmountUnit: "₫",
    discountAmountHelp:
      "Voucher hoặc phiếu giảm giá, áp dụng sau cả hai mức phần trăm. Để 0 nếu không có.",
    discountAmountInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDiscountAmount: "0",

    resultTitle: "Kết quả",
    finalLabel: "Giá cuối phải trả",
    savingLabel: "Tiết kiệm được",
    savingPercentLabel: "Tỷ lệ tiết kiệm",
    discountLabel: "Tổng mức giảm",
    netLabel: "Giá trước thuế",
    taxAmountLabel: "Tiền thuế",
    withoutDiscountLabel: "Giá nếu không giảm",

    // The lesson as two figures side by side, rather than a sentence.
    combinedLabel: "Hai mức giảm cộng lại thực tế là",
    naiveLabel: "Nếu cộng thẳng hai số thì tưởng là",
    combinedNote:
      "Hai mức giảm liên tiếp KHÔNG cộng thẳng: mức thứ hai được tính trên giá đã giảm, nên 20% rồi 10% là giảm 28%, không phải 30%. Trên giá 100 triệu, khoảng cách đó là 2 triệu đồng.",

    ledgerTitle: "Cộng trừ từng bước",
    ledgerStepColumn: "Bước",
    ledgerDeltaColumn: "Cộng / trừ",
    ledgerBalanceColumn: "Còn lại",
    ledgerSteps: {
      list: "Giá niêm yết",
      firstPercent: "Giảm lần 1",
      secondPercent: "Giảm lần 2 (trên giá đã giảm)",
      fixed: "Voucher",
      taxAdded: "Cộng thuế",
      taxInside: "Thuế đã nằm trong giá (không cộng thêm)",
    },

    tooMuchNotice:
      "Tổng mức giảm đang lớn hơn giá niêm yết, nên phép tính không có kết quả — không cửa hàng nào trả lại tiền cho bạn khi mua hàng. Hãy giảm phần trăm hoặc giảm số tiền voucher.",
  },

  // Original row 60: "tránh ám chỉ đã tính đủ thuế phí mua nhà".
  scopeNotice:
    "Đây là phép tính cho MỘT giao dịch mua bán thông thường. Nó KHÔNG phải bảng thuế và phí của một giao dịch nhà đất: mua nhà còn có thuế thu nhập cá nhân của người bán, lệ phí trước bạ, phí công chứng, phí thẩm định, phí đăng ký biến động và thường cả phí môi giới — mỗi khoản có cơ sở tính riêng và không khoản nào nằm trong con số ở đây.",
  scopeNoticeDetailTitle: "Vậy tính chi phí mua nhà ở đâu?",
  scopeNoticeDetail:
    "Công cụ “Khả năng mua nhà” có một ô cho chi phí giao dịch tính theo phần trăm giá nhà, và bạn tự nhập tỷ lệ theo báo giá hoặc tư vấn mà bạn có. FinHome không công bố một tỷ lệ chuẩn cho các khoản đó: chúng phụ thuộc loại giao dịch, địa phương và thời điểm, và chúng tôi không xác nhận mức nào là đúng cho trường hợp của bạn.",

  // The illustration here runs at the 8% THE FIELD PREFILLS, not at the 10%
  // standard rate, so a reader who types 800.000 into the form and switches to
  // “chưa gồm thuế” sees this exact figure instead of one they cannot
  // reproduce. Derived by running `adjustPrice` at that input; see
  // `price-adjust.test.ts`.
  taxIncludedNotice:
    "Điểm khác biệt của công cụ này: mặc định giá niêm yết đã gồm thuế. Với lựa chọn đó, mức giảm được trừ trên giá đã gồm thuế và dòng “tiền thuế” cho biết phần thuế đang nằm sẵn trong số bạn trả, chứ không cộng thêm gì. Nhiều công cụ nước ngoài luôn cộng thuế lên trên, và trên một giá niêm yết Việt Nam thì kết quả bị đội lên đúng bằng thuế suất — với mức 8% đang điền sẵn ở ô thuế, 800.000 ₫ thành 864.000 ₫.",

  formula: {
    title: "Cách tính",
    body: [
      "Mức giảm được áp dụng theo thứ tự: phần trăm trước, số tiền voucher sau. Đây là thứ tự các cửa hàng dùng, và nó cho kết quả khác thứ tự ngược lại — giảm 20% rồi trừ voucher 50.000 từ giá 1.000.000 còn 750.000, còn trừ voucher trước rồi giảm 20% lại còn 760.000.",
      "Khi giá đã gồm thuế: giá cuối = giá niêm yết − tổng mức giảm. Giá trước thuế = giá cuối ÷ (1 + thuế suất), và tiền thuế là phần chênh lệch giữa hai con số đó. Không có gì được cộng thêm vào số bạn trả.",
      "Khi giá chưa gồm thuế: giá trước thuế = giá niêm yết − tổng mức giảm, tiền thuế = giá trước thuế × thuế suất, và giá cuối là tổng của hai con số. Số tiền tiết kiệm khi đó được so với giá chưa giảm đã cộng thuế, nên tỷ lệ tiết kiệm vẫn giữ nguyên như trường hợp trên.",
      "Tỷ lệ tiết kiệm luôn được tính trên giá chưa giảm, không trên giá cuối. Tiết kiệm 200.000 trên giá 1.000.000 là 20%; nếu chia cho giá cuối 800.000 thì ra 25% — con số đẹp hơn nhưng không đúng nghĩa.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Khi nào tôi phải chọn “chưa gồm thuế”?",
        a: "Khi bạn đang đọc một báo giá doanh nghiệp, một hợp đồng hoặc một hóa đơn ghi rõ giá trước thuế, thường kèm dòng “chưa bao gồm VAT”. Với hàng bán lẻ cho người tiêu dùng thì thông lệ là giá niêm yết đã là số tiền thực phải trả, nên “đã gồm thuế” thường đúng. Cách chắc chắn nhất là xem chính hóa đơn hoặc báo giá của bạn ghi gì — công cụ không suy ra điều đó thay bạn.",
      },
      {
        q: "Hóa đơn của tôi ghi 10% chứ không phải 8% thì sao?",
        a: "Hãy sửa ô thuế thành 10. Mức giảm 2 điểm phần trăm không áp cho mọi thứ: những nhóm chịu thuế tiêu thụ đặc biệt bị loại khỏi diện được giảm và vẫn ở 10% — rượu, bia, thuốc lá, nước giải khát có đường trên 5 g/100 ml, điều hòa trên 24.000 BTU, xe dưới 24 chỗ — và Phụ lục I còn loại thêm sản phẩm kim loại, viễn thông, tài chính - ngân hàng - bảo hiểm và bất động sản. Hai trường hợp dễ bị bỏ qua: xăng thì VẪN được giảm dù chịu thuế tiêu thụ đặc biệt, còn điều hòa và nước giải khát có đường là mục mới của danh sách năm 2026, nên một hóa đơn năm 2025 không phải căn cứ để suy ra mức của hôm nay. Ngoài ra mức 8% là dành cho người bán nộp thuế theo phương pháp khấu trừ; người bán nộp theo tỷ lệ phần trăm trên doanh thu chỉ được giảm 20% mức tỷ lệ đó, và nhiều người bán nhỏ không xuất hóa đơn giá trị gia tăng nào. Mức giảm cũng chỉ áp dụng đến hết 31/12/2026.",
      },
      {
        q: "Giảm 20% rồi giảm thêm 10% có phải là giảm 30% không?",
        a: "Không, đó là giảm 28%. Mức giảm thứ hai được tính trên giá đã giảm, tức 0,8 × 0,9 = 0,72 giá gốc. Công cụ có sẵn hai ô phần trăm để bạn thấy trực tiếp: nhập 20 và 10 rồi đọc dòng “hai mức giảm cộng lại thực tế là”. Trên giá 100 triệu, chênh lệch giữa 28% và 30% là 2 triệu đồng — và đây cũng là lý do một chương trình quảng cáo “giảm tới 30%” có thể hoàn toàn trung thực mà vẫn không giảm 30%.",
      },
      {
        q: "Con số “giá cuối phải trả” có gồm thuế phí mua nhà không?",
        a: "Không. Đây là phép tính cho một giao dịch mua bán thông thường. Một giao dịch nhà đất còn có lệ phí trước bạ, phí công chứng, phí thẩm định, phí đăng ký biến động, thuế thu nhập cá nhân của người bán và thường cả phí môi giới; mỗi khoản có cơ sở tính riêng và không khoản nào được cộng vào đây. Nếu bạn cần ước lượng tổng chi phí giao dịch nhà, công cụ “Khả năng mua nhà” có một ô cho chi phí đó tính theo phần trăm giá nhà — và tỷ lệ bạn nhập vào đó phải là tỷ lệ của chính bạn, vì FinHome không công bố một mức chuẩn.",
      },
      {
        q: "Vì sao tỷ lệ tiết kiệm không đổi khi tôi bật tắt “đã gồm thuế”?",
        a: "Vì thuế nhân cùng một hệ số vào cả giá gốc và giá đã giảm, nên tỷ lệ giữa hai con số không thay đổi. Điều thay đổi là số tiền tuyệt đối: trên giá 1.000.000 với mức 8% đang điền sẵn, cùng mức giảm 20%, bạn tiết kiệm 200.000 khi giá đã gồm thuế và 216.000 khi thuế được cộng thêm, vì bản thân giá gốc trong trường hợp sau đã là 1.080.000 chứ không phải 1.000.000.",
      },
      {
        q: "Vì sao công cụ báo lỗi khi voucher lớn hơn giá?",
        a: "Vì kết quả khi đó là một số tiền âm, tức cửa hàng phải trả tiền cho bạn, và đó không phải điều bạn muốn tính. Công cụ trả về trạng thái không có kết quả thay vì tự cắt xuống 0 — cắt xuống 0 sẽ che mất việc bạn đã nhập sai một con số. Voucher đúng bằng giá thì vẫn được, đó là trường hợp mua miễn phí.",
      },
      {
        q: "Kết quả có gồm phí vận chuyển không?",
        a: "Không. Phí vận chuyển thường được tính sau khi đã áp mã giảm giá và có thể có thuế suất riêng, nên nó nằm ngoài phép tính này. Nếu bạn muốn tổng chi thực tế, hãy cộng phí vận chuyển vào giá cuối mà công cụ đưa ra.",
      },
    ],
  },

  // The page prefills a legal parameter, which is the case `sources` exists
  // for — `components/calc/calculator-page.tsx` says so in as many words:
  // "Naming a decree and a date in prose is not a citation a reader can
  // check". Same two Công báo typeset PDFs, same provenance wording and same
  // reason as `content/calculators/tip.ts`: the signed copies on
  // datafiles.chinhphu.vn are image scans with no text layer and
  // thuvienphapluat.vn refuses automated fetching, so neither can be checked
  // by whoever maintains this next. Wired through the route's `sources` prop —
  // `content/calculators/sources-wiring.test.ts` fails if it is not.
  sources: {
    title: "Nguồn cho mức thuế điền sẵn",
    intro:
      "Hai văn bản dưới đây là nguồn của mức 8% điền sẵn và của mốc hết hiệu lực 31/12/2026. Chúng được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Đây không phải danh sách đầy đủ và không phải tư vấn thuế. Công cụ cũng chỉ nhận một thuế suất cho cả giao dịch, trong khi một hóa đơn thật có thể mang hai mức, và mức thực tế còn phụ thuộc phương pháp tính thuế của người bán. Hóa đơn của bạn là căn cứ đúng hơn con số điền sẵn ở đây.",
    items: [
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2025/6/45374/57334-1-2025895-896174-2025-nd-cp.pdf",
        label:
          "Nghị định số 174/2025/NĐ-CP — quy định giảm thuế giá trị gia tăng theo Nghị quyết số 204/2025/QH15",
        note: "Nguồn của mức 8%: Điều 1 khoản 2 điểm a. Điều 1 khoản 1 chỉ xác định phạm vi được giảm, và điểm b của khoản đó loại hàng hóa, dịch vụ chịu thuế tiêu thụ đặc biệt — trừ xăng — ra khỏi diện giảm; hai phụ lục kèm theo liệt kê những nhóm vẫn ở 10%. Điều 1 khoản 2 điểm b là mức giảm 20% tỷ lệ phần trăm dành cho người bán nộp thuế theo doanh thu, và khoản 3 điểm a là chỉ dẫn ghi “8%” trên dòng thuế suất của hóa đơn. Điều 2 khoản 1 ghi hiệu lực từ 01/07/2025 đến hết 31/12/2026.",
      },
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2024/11/43576/53720-1-20241527-152848-2024-qh15.pdf",
        label:
          "Luật Thuế giá trị gia tăng số 48/2024/QH15 — trang Công báo",
        note: "Nguồn của mức phổ thông 10% tại khoản 3 Điều 9 — mức mà 8% là phần giảm 2 điểm phần trăm so với nó, và là mức trở lại từ 01/01/2027 nếu không có văn bản mới. Luật có hiệu lực từ 01/07/2025 và đã được sửa đổi bởi các văn bản ban hành sau, nên hãy đối chiếu bản hợp nhất nếu bạn cần dùng cho việc lập hóa đơn.",
      },
    ],
  },
} as const;
