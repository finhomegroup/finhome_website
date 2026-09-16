// Copy for /cong-cu/thue-mua-xe/ — the vehicle lease calculator.
//
// Original FinHome copy. The arithmetic is the standard lease formula.
//
// The honesty notes that drive this page are all in the copy above the tool,
// or in the tax field's own help text — never only in this comment:
//
// - Consumer car leasing barely exists in Vietnam. Cho thuê tài chính under
//   Nghị định 39/2014/NĐ-CP is a licensed activity aimed at businesses, not
//   a retail product an individual walks into a dealership and signs. So the
//   page says who it is for rather than implying a Vietnamese consumer can
//   just choose this — and it now names the decree where a reader can see
//   it, which for a whole unit it did not.
// - Two end-of-contract fees are NOT modelled: per-km overage and excess
//   damage. Both land at the end, both can be large, and `totalCost` is
//   short by them.
// - What you own at the end depends on the contract. A foreign-style
//   operating lease leaves you with nothing; many Vietnamese finance-lease
//   contracts transfer ownership at the residual or a token price. The copy
//   used to assert the first flatly in the notice while its own FAQ stated
//   the second, so the claim is now qualified by product.
// - THE VAT RATE ON THE RENTAL IS 0, AND THE SENTENCE THAT SAID 10% WAS
//   FALSE LAW. This page says it models cho thuê tài chính. A genuine finance
//   lease by a licensed finance-leasing company is dịch vụ cấp tín dụng and
//   therefore a non-taxable object — không chịu thuế GTGT — under Điều 5
//   khoản 9 điểm a Luật Thuế giá trị gia tăng số 48/2024/QH15 (in force
//   01/07/2025), repeated verbatim at Nghị định 181/2025/NĐ-CP Điều 4 khoản 4
//   điểm a. There is no rate on the rental at all: not on the depreciation
//   half and not on the finance charge. The field prefilled 10% and
//   `formula.body` asserted "VAT được tính trên khoản trả này … 10% là
//   1.149.722 ₫", which is wrong under every branch below.
//
//   THE INVOICE IS STILL NOT VAT-FREE, and the tool does not model why: the
//   lessor passes the leased asset's INPUT VAT through to the lessee, the
//   tax-rate field on the invoice carries the symbol CTTC rather than a
//   percentage, and the total VAT across the lessor's output invoices must
//   equal the asset's input VAT — Nghị định 254/2026/NĐ-CP Điều 6 khoản 3
//   điểm g (in force 01/07/2026, replacing Nghị định 123/2020; the identical
//   rule was previously at Thông tư 32/2025/TT-BTC Điều 6 khoản 2). The
//   lessee pays that amount and deducts it. A CTTC mode is NOT in
//   `lib/calc/auto-lease.ts` and adding one was out of scope, so the limit is
//   disclosed in `taxHelp`, in `formula.body` and in `sources.intro` instead
//   of being quietly absent.
//
//   THE FIELD STAYS EDITABLE, because the other branch is real: an ordinary
//   taxable asset lease is taxed on the WHOLE contractual rent for the period
//   (Điều 7 khoản 1 điểm d Luật 48/2024/QH15, Nghị định 181/2025/NĐ-CP Điều 7
//   khoản 1) plus any phụ thu and phí thu thêm under Điều 7 khoản 2, and an
//   embedded funding component cannot be stripped out of that base. Điều 7
//   khoản 1 điểm đ, which excludes lãi trả góp and lãi trả chậm, applies only
//   to installment or deferred SALES OF GOODS — do not cite it for a lease.
//   The rate on such a lease today is 8%, not 10%: Nghị quyết 204/2025/QH15
//   and Nghị định 174/2025/NĐ-CP Điều 2 khoản 1 run the 2-point reduction
//   from 01/07/2025 to 31/12/2026, vehicle rental is not in the Phụ lục I
//   carve-out and is not a special-consumption-taxed service. No instrument
//   covers rates after 31/12/2026, so the copy says the reduction expires and
//   predicts no extension.
//
// Figures quoted are the tool's own output for 800 triệu, trả trước 100
// triệu, giá trị còn lại 440 triệu (55%), 36 tháng, 9%/năm at the SHIPPED
// tax rate of 0: khấu hao 7.222.222 ₫ + phí tài chính 4.275.000 ₫ =
// 11.497.222 ₫ trước thuế, thuế 0 ₫, tổng 11.497.222 ₫/tháng; tổng trả
// 413.900.000 ₫, tổng chi phí 513.900.000 ₫. The same inputs at the 8% a
// taxable lease carries today: thuế 919.778 ₫, tổng 12.417.000 ₫/tháng. Vay
// mua cùng xe: 22.259.813 ₫/tháng, lãi 101.353.263 ₫, tổng trả cho khoản vay
// 801.353.263 ₫ và bạn sở hữu chiếc xe. Every one of those is pinned in
// `auto-lease.test.ts` against the module's own output.

export const AUTO_LEASE = {
  slug: "/cong-cu/thue-mua-xe",

  // "THUÊ MUA" WAS THE WRONG NAME FOR THIS PRODUCT, and it was wrong in a way
  // that mattered rather than merely reading oddly.
  //
  // The word asserts the thing this page's own disclosure denies. `contextDetail`
  // says "quyền sở hữu tùy hợp đồng" and that the lessee "chỉ có xe nếu hợp đồng
  // cho mua lại và họ trả thêm khoản đó" — so the "mua" half is a contract
  // option, not part of the product. In Luật Nhà ở, "thuê mua nhà ở xã hội" is a
  // real term and does mean rent-then-own; that is where the phrase belongs, and
  // the blog posts using it for social housing are correct and untouched. For a
  // vehicle, Nghị định 39/2014/NĐ-CP calls the activity `cho thuê tài chính`,
  // which is also the term Điều 5 khoản 9 điểm a of Luật Thuế GTGT 48/2024/QH15
  // uses — the article the VAT copy on this page now rests on. The title was
  // naming the product one way while the legal basis named it another.
  //
  // THE SLUG IS DELIBERATELY UNCHANGED. `/cong-cu/thue-mua-xe/` is a published
  // URL and this is a static export with no redirect layer, so renaming the
  // route would break every existing link to it for a copy improvement. The slug
  // is part of the search haystack (`lib/calc/tool-search.ts`), so a reader who
  // types "thuê mua" still finds this tool — `auto-lease.test.ts` pins that.
  pageTitle: "Thuê tài chính ô tô: trả bao nhiêu mỗi tháng?",
  metaTitle:
    "Tính thuê tài chính ô tô — Khấu hao, phí tài chính và tổng chi phí",
  metaDescription:
    "Tính khoản trả hằng tháng của hợp đồng cho thuê tài chính ô tô: phần khấu hao, phần phí tài chính và tổng chi phí. Công cụ miễn phí của FinHome.",

  // The lede now DEFINES the product before using it, because "thuê tài chính"
  // is accurate but is still industry vocabulary, and the sentence that follows
  // only makes sense once the reader knows what is being paid for.
  lede:
    "Thuê tài chính — nhiều nơi vẫn gọi là thuê mua — là việc công ty cho thuê tài chính mua chiếc xe rồi cho bạn thuê trong một thời hạn; hết hạn, quyền sở hữu tùy hợp đồng chứ không tự động thuộc về bạn. Khoản trả hằng tháng cũng không phải khoản trả vay trên một số tiền nhỏ hơn: nó là hai khoản cộng lại — phần khấu hao trả cho giá trị chiếc xe mất đi trong thời gian bạn dùng, và phần phí tài chính là tiền thuê vốn của công ty cho thuê.",

  form: {
    vehicleGroup: "Xe và tiền trả trước",
    priceLabel: "Giá xe thương lượng",
    priceUnit: "₫",
    priceHelp:
      "Giá đã thỏa thuận, không phải giá niêm yết. Đây là con số quyết định phần khấu hao.",
    priceInvalid: "Vui lòng nhập giá xe lớn hơn 0.",
    defaultPrice: "800.000.000",

    downLabel: "Tiền trả trước",
    downUnit: "₫",
    downHelp: "Tiền mặt trả ngay, làm giảm số tiền được vốn hóa vào hợp đồng.",
    downInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDown: "100.000.000",

    tradeInLabel: "Giá trị xe cũ thu lại",
    tradeInUnit: "₫",
    tradeInHelp: "Số tiền được trừ khi đổi xe cũ. Để 0 nếu không có.",
    tradeInInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTradeIn: "0",

    feesLabel: "Phí gộp vào hợp đồng",
    feesUnit: "₫",
    feesHelp:
      "Phí hồ sơ, phí thu xếp và các khoản được cộng vào số tiền vốn hóa thay vì trả ngay. Để 0 nếu bạn trả riêng.",
    feesInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFees: "0",

    leaseGroup: "Điều kiện hợp đồng",
    residualLabel: "Giá trị còn lại cuối kỳ",
    residualUnit: "₫",
    residualHelp:
      "Giá trị chiếc xe được ấn định khi hết hạn hợp đồng. Không được lớn hơn số tiền vốn hóa. Với xe 3 năm, mức 50–60% giá xe là phổ biến.",
    residualInvalid:
      "Giá trị còn lại phải từ 0 trở lên và không vượt số tiền vốn hóa.",
    defaultResidual: "440.000.000",

    termLabel: "Thời hạn thuê",
    termHelp: "Số tháng của hợp đồng. Thường 24, 36 hoặc 48 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultTerm: "36",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất hằng năm của hợp đồng. Công cụ tự quy về hệ số tiền tệ bằng cách chia 2400.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "9",

    taxLabel: "Thuế suất GTGT trên tiền thuê",
    taxUnit: "%",
    taxHelp:
      "Mặc định là 0. Cho thuê tài chính đúng nghĩa là dịch vụ cấp tín dụng, thuộc đối tượng không chịu thuế GTGT theo Điều 5 khoản 9 điểm a Luật Thuế giá trị gia tăng số 48/2024/QH15, nên tiền thuê không có thuế suất — không trên phần khấu hao và cũng không trên phần phí tài chính. Nhưng hóa đơn thì không bằng 0: bên cho thuê chuyển tiếp thuế GTGT đầu vào của chính chiếc xe sang bên thuê, ô thuế suất trên hóa đơn ghi ký hiệu CTTC thay cho một tỷ lệ phần trăm, và tổng thuế trên các hóa đơn đầu ra phải bằng thuế đầu vào của tài sản — Nghị định 254/2026/NĐ-CP Điều 6 khoản 3 điểm g; bên thuê trả khoản đó rồi khấu trừ. Công cụ này không mô phỏng khoản chuyển tiếp đó. Nếu hợp đồng của bạn là cho thuê tài sản thông thường thì giá tính thuế là toàn bộ tiền thuê của kỳ theo Điều 7 khoản 1 điểm d cùng luật, không tách được phần phí tài chính ra khỏi giá tính thuế, và thuế suất hiện nay là 8% cho đến hết 31/12/2026 theo Nghị quyết 204/2025/QH15 — từ 01/01/2027 mức giảm hết hiệu lực và trở lại 10% nếu Quốc hội không ban hành văn bản mới. Khi đó hãy nhập 8. Xem phần nguồn ở cuối trang.",
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTax: "0",

    resultTitle: "Khoản trả hằng tháng",
    monthlyLabel: "Trả hằng tháng, theo thuế suất đã nhập",
    depreciationLabel: "Trong đó phần khấu hao",
    financeLabel: "Trong đó phí tài chính",

    detailTitle: "Chi tiết",
    beforeTaxLabel: "Khoản trả trước thuế",
    taxResultLabel: "Thuế GTGT theo thuế suất đã nhập",
    capitalisedLabel: "Số tiền vốn hóa",
    moneyFactorLabel: "Hệ số tiền tệ",
    residualPercentLabel: "Giá trị còn lại so với giá xe",
    totalDepreciationLabel: "Tổng khấu hao cả kỳ",
    totalFinanceLabel: "Tổng phí tài chính cả kỳ",
    totalPaymentsLabel: "Tổng các khoản trả",
    totalCostLabel: "Tổng chi phí, gồm tiền trả trước",

    residualTooHighNotice:
      "Giá trị còn lại đang lớn hơn số tiền vốn hóa, nghĩa là chiếc xe phải TĂNG giá trong thời gian thuê. Phần khấu hao khi đó là số âm, nên phép tính không có kết quả. Hãy giảm giá trị còn lại hoặc giảm tiền trả trước.",
  },

  // WHAT IS IN THE VISIBLE NOTICE, AND WHY IT CHANGED.
  //
  // Three defects in the old one, all of them about placement rather than
  // accuracy:
  //
  // 1. **The two fees that actually bite were not in it.** Per-km overage and
  //    excess-damage charges appear at the END of a lease, can be large, and
  //    the tool models neither — an admission that sat in FAQ item 4, inside
  //    the collapsed accordion, while the notice was spent on the loan
  //    comparison. A reader who takes `totalCost` at face value has a figure
  //    short by an unknown amount, so that belongs before the figure.
  // 2. **Nghị định 39/2014 was named only in this file's docstring**, where
  //    no reader can see it, while the notice made the claim the decree is
  //    the basis for.
  // 3. **The ownership claim was flat and its own FAQ contradicted it.** The
  //    notice said "hết hạn hợp đồng bạn KHÔNG sở hữu chiếc xe", full stop;
  //    FAQ item 5 says many Vietnamese finance-lease contracts transfer
  //    ownership at the end. Both cannot be unqualified. They reconcile as
  //    generic-versus-contract-specific, so the qualification is now written
  //    rather than left for the reader to spot.
  //
  // The loan comparison and the ownership question moved to `contextDetail`,
  // one click away and still above the calculator — the same `noticeDetail`
  // slot row 10 uses. Nothing was deleted. `auto-lease.test.ts` asserts each
  // of the three, and that the visible notice stays short enough to leave the
  // form on the first screens at 390 px (docs §3); the old one was 622
  // characters.
  contextNotice:
    "Hai điều cần biết trước khi đọc con số. Thứ nhất, thuê tài chính ô tô cho cá nhân gần như không tồn tại ở Việt Nam: đây là hoạt động có giấy phép theo Nghị định 39/2014/NĐ-CP, chủ yếu dành cho doanh nghiệp và tài sản phục vụ kinh doanh. Thứ hai, công cụ không tính hai khoản phí thường phát sinh khi trả xe — phí vượt số km và phí hư hỏng quá mức — nên tổng chi phí ở dưới là con số còn thiếu hai khoản đó.",

  contextDetailTitle: "Hết hạn hợp đồng thì xe thuộc về ai, và so với vay mua thì sao",

  contextDetail:
    "Quyền sở hữu tùy hợp đồng, nên đây là điều phải đọc trong hợp đồng của bạn chứ không phải một quy tắc chung. Hợp đồng thuê hoạt động kiểu nước ngoài kết thúc là bạn trả xe và không có gì. Nhiều hợp đồng cho thuê tài chính tại Việt Nam lại có điều khoản chuyển quyền sở hữu khi kết thúc, ở mức giá trị còn lại hoặc một giá tượng trưng; khi đó tổng chi phí để cuối cùng sở hữu xe là con số công cụ tính cộng thêm khoản mua lại đó. Với ví dụ mặc định, thuê tài chính trả 11.497.222 ₫ mỗi tháng còn vay mua cùng chiếc xe đó trả 22.259.813 ₫ — sau 36 tháng người vay có một chiếc xe trị giá khoảng 440 triệu, còn người thuê chỉ có xe nếu hợp đồng cho mua lại và họ trả thêm khoản đó. Con số thuê tài chính ở đây chưa gồm phần thuế GTGT đầu vào của chiếc xe mà bên cho thuê chuyển tiếp sang bên thuê trên hóa đơn ghi ký hiệu CTTC, nên đừng đọc nó như một khoản đã trả đủ; xem phần trợ giúp của ô thuế suất.",

  // The row's own next step is a VEHICLE comparison, not the home-buying
  // journey. It cannot go through `TOOL_NEXT_STEPS`: that file's test forbids
  // an entry on any library-shelved row and this one is `tien-ich`, and it
  // also requires every destination to be P1 or P2 while `vay-mua-xe` is P3.
  // Both guards are the mechanism that keeps a mortgage funnel off pages like
  // this one, so the answer is an in-content link rather than a weaker guard.
  //
  // `slug` rather than a written-out href, resolved through the registry in
  // the route: a slug that stops being a live route then fails the build
  // instead of shipping a dead link this page told the reader to follow. Same
  // shape rows 46/47 use, deliberately — one pattern for this, not two.
  relatedTool: {
    slug: "vay-mua-xe",
    title: "So với vay mua cùng chiếc xe",
    why: "Trang này đã đặt khoản trả thuê tài chính cạnh khoản trả vay mua, nhưng con số vay mua ở trên là của ví dụ mặc định. Nhập xe và điều kiện của bạn vào công cụ vay mua xe để so hai phương án trên cùng một chiếc xe — và nhớ rằng hết hạn thuê bạn có thể không sở hữu gì.",
  },

  // The tax field prefills a legal parameter — 0, which is a legal CONCLUSION
  // and not an arithmetic default — so this is exactly the case
  // `components/calc/calculator-page.tsx` describes: "naming a decree and a
  // date in prose is not a citation a reader can check". The two Công báo PDFs
  // are the same typeset official copies `content/calculators/tip.ts` cites,
  // for the reason recorded there: the signed copies on datafiles.chinhphu.vn
  // are image scans with no text layer and thuvienphapluat.vn refuses
  // automated fetching, so neither can be checked by whoever maintains this
  // next. Nghị định 254/2026/NĐ-CP has no typeset PDF on that host, so the
  // link is its Công báo document page and the note says the full text is an
  // attachment. `intro` carries the provenance limit, because a list of
  // official links implies a completeness this page has not earned — and the
  // specific limit here is the CTTC pass-through, which is real money the tool
  // does not compute on any row.
  sources: {
    title: "Nguồn cho thuế suất điền sẵn",
    intro:
      "Các văn bản dưới đây là nguồn của mức 0 điền sẵn trong ô thuế suất và của mức 8% nói trong phần trợ giúp của ô đó. Chúng được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Đây không phải danh sách đầy đủ và không phải tư vấn thuế. Giới hạn quan trọng nhất: công cụ không mô phỏng phần thuế GTGT đầu vào của chiếc xe mà bên cho thuê chuyển tiếp sang bên thuê — khoản đó là tiền thật, nằm trên hóa đơn với ký hiệu CTTC, và không xuất hiện ở bất kỳ dòng kết quả nào của trang này. Công cụ cũng không biết hợp đồng của bạn là cho thuê tài chính hay cho thuê tài sản thông thường, và không tự đổi thuế suất khi mức giảm 2 điểm phần trăm hết hiệu lực sau 31/12/2026. Hãy đối chiếu bản công bố chính thức và hỏi cơ quan thuế cho hợp đồng cụ thể của bạn.",
    items: [
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2024/11/43576/53720-1-20241527-152848-2024-qh15.pdf",
        label: "Luật Thuế giá trị gia tăng số 48/2024/QH15 — trang Công báo",
        note: "Nguồn của mức 0 điền sẵn: Điều 5 khoản 9 điểm a xếp dịch vụ cấp tín dụng — trong đó có hoạt động cho thuê tài chính của công ty cho thuê tài chính được cấp phép — vào đối tượng không chịu thuế GTGT, nên tiền thuê của một hợp đồng cho thuê tài chính đúng nghĩa không có thuế suất. Nghị định 181/2025/NĐ-CP Điều 4 khoản 4 điểm a nhắc lại nguyên văn quy định này. Cùng luật cũng là nguồn cho nhánh còn lại: Điều 7 khoản 1 điểm d lấy toàn bộ tiền thuê của kỳ làm giá tính thuế của hợp đồng cho thuê tài sản thông thường, cộng các khoản phụ thu và phí thu thêm theo Điều 7 khoản 2, nên không tách được phần phí tài chính ra khỏi giá tính thuế. Điểm đ của cùng khoản — loại lãi trả góp và lãi trả chậm ra khỏi giá tính thuế — chỉ áp cho bán hàng hóa trả góp hoặc trả chậm, không áp cho hợp đồng thuê. Luật có hiệu lực từ 01/07/2025.",
      },
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2025/6/45374/57334-1-2025895-896174-2025-nd-cp.pdf",
        label:
          "Nghị định số 174/2025/NĐ-CP — quy định giảm thuế giá trị gia tăng theo Nghị quyết số 204/2025/QH15",
        note: "Nguồn của mức 8% cho hợp đồng cho thuê tài sản thông thường: Điều 2 khoản 1 ghi mức giảm 2 điểm phần trăm áp dụng từ 01/07/2025 đến hết 31/12/2026. Cho thuê xe và thiết bị không nằm trong nhóm bị loại khỏi diện được giảm ở Phụ lục I (viễn thông, tài chính — ngân hàng — chứng khoán — bảo hiểm, bất động sản, sản phẩm kim loại, khai khoáng trừ than) và cũng không phải dịch vụ chịu thuế tiêu thụ đặc biệt, nên được giảm. Không có văn bản nào quy định thuế suất sau 31/12/2026: từ 01/01/2027 mức 8% hết hiệu lực và trở lại 10% nếu Quốc hội không ban hành văn bản mới. Riêng hoạt động cho thuê tài chính thì có tên trong Phụ lục I, và dù sao vẫn thuộc đối tượng không chịu thuế theo nguồn phía trên.",
      },
      {
        url: "https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-254-2026-nd-cp-469957.htm",
        label:
          "Nghị định số 254/2026/NĐ-CP về hóa đơn, chứng từ — trang văn bản Công báo",
        note: "Nguồn của khoản mà công cụ không mô phỏng: Điều 6 khoản 3 điểm g quy định hóa đơn cho thuê tài chính ghi ký hiệu CTTC ở ô thuế suất thay cho một tỷ lệ phần trăm, và tổng thuế GTGT trên các hóa đơn đầu ra của bên cho thuê phải bằng thuế GTGT đầu vào của tài sản cho thuê; bên thuê trả khoản đó và được khấu trừ. Thuế bằng 0 chỉ xuất hiện khi bản thân tài sản cho thuê không chịu thuế, hoặc khi không có hóa đơn đầu vào và chứng từ thuế GTGT nhập khẩu hợp lệ. Nghị định ban hành 30/06/2026, hiệu lực 01/07/2026, thay Nghị định 123/2020/NĐ-CP; quy định giống nguyên văn trước đó nằm ở Thông tư 32/2025/TT-BTC Điều 6 khoản 2. Đây là trang văn bản, toàn văn ở tệp đính kèm.",
      },
    ],
  },

  formula: {
    title: "Cách tính",
    body: [
      "Số tiền vốn hóa = giá xe − tiền trả trước − giá trị xe cũ + phí gộp vào hợp đồng. Với mặc định là 700.000.000 ₫.",
      "Phần khấu hao mỗi tháng = (số tiền vốn hóa − giá trị còn lại) ÷ số tháng. Đây là tiền bạn trả cho phần giá trị chiếc xe mất đi: (700 − 440) triệu chia 36 tháng bằng 7.222.222 ₫.",
      "Phần phí tài chính mỗi tháng = (số tiền vốn hóa + giá trị còn lại) × hệ số tiền tệ, với hệ số tiền tệ = lãi suất năm ÷ 2400. Chú ý phép CỘNG: phí được tính trên tổng giá trị đầu kỳ và cuối kỳ, không phải trên một dư nợ giảm dần, vì trung bình trong cả kỳ hạn thì đó mới là số vốn đang nằm ở chiếc xe. Với mặc định: (700 + 440) triệu × 0,00375 = 4.275.000 ₫.",
      "Con số 2400 là 12 tháng × 200, trong đó 200 đến từ việc lấy tổng hai giá trị thay cho hai lần số dư bình quân. Đây là lý do phí tài chính của hợp đồng thuê KHÔNG giảm dần theo thời gian như tiền lãi của khoản vay.",
      "Khoản trả trước thuế = khấu hao + phí tài chính = 11.497.222 ₫. Ô thuế suất mặc định là 0 nên đó cũng là khoản trả hằng tháng: cho thuê tài chính là dịch vụ cấp tín dụng, thuộc đối tượng không chịu thuế GTGT theo Điều 5 khoản 9 điểm a Luật Thuế giá trị gia tăng số 48/2024/QH15, nên tiền thuê không có thuế suất nào để nhân vào — cả phần khấu hao lẫn phần phí tài chính. Điều đó không có nghĩa hóa đơn bằng 0: thuế GTGT đầu vào của chiếc xe vẫn được bên cho thuê chuyển tiếp sang bên thuê, ghi bằng ký hiệu CTTC ở ô thuế suất, và công cụ không tính khoản đó. Nếu hợp đồng của bạn là cho thuê tài sản thông thường thì giá tính thuế là toàn bộ tiền thuê của kỳ và thuế suất hiện nay là 8%: nhập 8 vào ô thuế suất thì thuế là 919.778 ₫ và khoản trả hằng tháng là 12.417.000 ₫.",
      "Giá trị còn lại càng cao thì khoản trả càng thấp nhưng phí tài chính càng CAO — vì có nhiều vốn hơn nằm ở chiếc xe suốt kỳ hạn. Hãy thử tăng giảm ô giá trị còn lại để thấy hai dòng kết quả đi ngược chiều nhau.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Thuê tài chính và vay mua, cái nào rẻ hơn?",
        a: "Không so được trực tiếp, vì hai bên cho ra hai thứ khác nhau. Với ví dụ mặc định và ô thuế suất để ở 0, thuê tài chính tốn 513.900.000 ₫ trong 36 tháng và bạn không có gì; vay mua tốn 901.353.263 ₫ gồm tiền trả trước nhưng bạn có một chiếc xe. Cách so công bằng là lấy tổng chi phí vay mua trừ giá trị chiếc xe khi hết 36 tháng, rồi đặt cạnh tổng chi phí thuê tài chính. Với các con số mặc định thì hai bên khá gần nhau, và lựa chọn phụ thuộc vào việc bạn có muốn giữ xe hay không. Con số thuê tài chính còn thiếu ba khoản: thuế GTGT đầu vào của chiếc xe mà bên cho thuê chuyển tiếp sang bên thuê, phí vượt số km và phí hư hỏng quá mức.",
      },
      {
        q: "Giá trị còn lại nên là bao nhiêu?",
        a: "Con số này do bên cho thuê ấn định, không phải bạn chọn, và nó phản ánh dự đoán về giá xe khi hết hợp đồng. Xe giữ giá tốt có giá trị còn lại cao và vì thế khoản trả thấp hơn. Nếu bên cho thuê đưa ra một mức bạn thấy quá cao so với thực tế thị trường xe cũ, hãy để ý điều khoản mua lại cuối kỳ — mua lại theo một giá trị còn lại được thổi lên là một lựa chọn tồi.",
      },
      {
        q: "Vì sao giá trị còn lại cao lại làm phí tài chính tăng?",
        a: "Vì phí tài chính được tính trên tổng giá trị đầu kỳ và cuối kỳ. Giá trị còn lại cao nghĩa là bên cho thuê vẫn còn nhiều vốn nằm ở chiếc xe cho đến ngày cuối cùng, nên họ thu tiền thuê vốn trên số đó. Tổng khoản trả vẫn giảm, vì phần khấu hao giảm nhiều hơn mức phí tài chính tăng — nhưng tỷ trọng phí tài chính trong khoản trả thì tăng lên.",
      },
      {
        q: "Công cụ có tính phí vượt số km và phí hư hỏng không?",
        a: "Không. Hợp đồng thuê tài chính thường giới hạn số km mỗi năm và thu phí cho mỗi km vượt, cùng với phí cho hư hỏng vượt mức bình thường khi trả xe. Đây là hai khoản chi phí xuất hiện ở cuối hợp đồng và có thể lớn. Hãy đọc kỹ hai điều khoản đó và cộng ước tính vào tổng chi phí mà công cụ đưa ra.",
      },
      {
        q: "Hết hạn hợp đồng thì có mua lại được xe không?",
        a: "Tùy hợp đồng. Nhiều hợp đồng cho thuê tài chính tại Việt Nam có điều khoản chuyển quyền sở hữu khi kết thúc, thường ở mức giá trị còn lại hoặc một giá tượng trưng — đây chính là điểm khác biệt so với hình thức thuê hoạt động ở nước ngoài. Nếu hợp đồng của bạn có điều khoản này ở mức giá trị còn lại, thì tổng chi phí để cuối cùng sở hữu xe là tổng chi phí mà công cụ tính cộng thêm giá trị còn lại.",
      },
    ],
  },
} as const;
