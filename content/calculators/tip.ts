// Copy for /cong-cu/tinh-tien-tip/ — the bill splitter.
//
// Original FinHome copy. The arithmetic is elementary.
//
// Two honest notes shape this page. First, tipping is not customary in
// Vietnam, and a tool that presented an 18% default the way American
// calculators do would be teaching a foreign norm as if it were local. The
// tip default is therefore 0. Second, what Vietnamese bills DO carry is a
// service charge and VAT, which are not tips and do not go to the server —
// so they are separate inputs with their own result rows.

export const TIP = {
  slug: "/cong-cu/tinh-tien-tip",

  pageTitle: "Tính tiền tip và chia hóa đơn",
  metaTitle: "Tính tiền tip và chia hóa đơn — Kèm phí phục vụ và VAT",
  metaDescription:
    "Nhập hóa đơn, phí phục vụ, VAT và tiền tip rồi chia cho số người, làm tròn về mệnh giá dễ trả. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập tiền món ăn rồi thêm phí phục vụ, VAT và tiền tip nếu có. Công cụ chia đều cho số người và làm tròn phần của mỗi người lên mệnh giá bạn chọn, để không ai phải trả 142.333 ₫.",

  form: {
    billGroup: "Hóa đơn",
    billLabel: "Tiền món ăn",
    billUnit: "₫",
    billHelp: "Tổng tiền đồ ăn và uống, trước phí phục vụ và VAT.",
    billInvalid: "Vui lòng nhập số tiền lớn hơn 0.",
    defaultBill: "1.000.000",

    serviceLabel: "Phí phục vụ",
    serviceUnit: "%",
    serviceHelp:
      "Nhiều nhà hàng thu 5% phí phục vụ. Đây là tiền của nhà hàng, không phải tiền tip.",
    serviceInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultService: "5",

    taxLabel: "VAT",
    taxUnit: "%",
    // THE OLD TEXT WAS "Thường là 8% hoặc 10%" AND THAT IS NOT A BASIS.
    // Prefilling 8 rather than 10 is an implicit claim that the reduced rate
    // is in force, and nothing on the page dated it. A reader can only decide
    // whether to override a default if they know what the default assumed —
    // which is the whole reason `sources` exists; see the docstring at
    // `components/calc/calculator-page.tsx`.
    //
    // The reduction has an END DATE and it is inside the horizon of anyone
    // reading this page, so the date is stated rather than left for the reader
    // to discover when their bill stops matching.
    taxHelp:
      "Tính trên tiền món ăn cộng phí phục vụ: khoản phụ thu mà nhà hàng được hưởng nằm trong giá tính thuế theo Điều 7 khoản 2 Luật Thuế giá trị gia tăng số 48/2024/QH15. Mức 8% điền sẵn là mức giảm 2 điểm phần trăm, áp dụng từ 01/07/2025 đến hết 31/12/2026 theo Nghị quyết 204/2025/QH15 và Nghị định 174/2025/NĐ-CP; sau thời hạn đó mức phổ thông trở lại là 10%. Hàng hóa và dịch vụ chịu thuế tiêu thụ đặc biệt không thuộc diện được giảm và vẫn ở 10% — trên hóa đơn nhà hàng, đồ uống có cồn là trường hợp thường gặp nhất. Công cụ chỉ nhận một mức, nên một hóa đơn vừa có món ăn vừa có bia sẽ không khớp tuyệt đối; hãy nhập mức ghi trên hóa đơn của bạn. Xem phần nguồn ở cuối trang.",
    // 0–100, not "0 trở lên". A VAT rate above 100% is not a number anyone
    // can be invoiced, and the field used to accept 500. The tip and service
    // fields below stay unbounded on purpose: those are the payer's own
    // discretionary choices, not a rate set by statute.
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTax: "8",

    tipLabel: "Tiền tip",
    tipUnit: "% tiền món ăn",
    tipHelp:
      "Việt Nam không có tập quán tip bắt buộc, nên mặc định là 0. Nhập mức bạn muốn nếu có.",
    tipInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTip: "0",

    splitGroup: "Chia tiền",
    peopleLabel: "Số người",
    peopleHelp: "Số người chia đều hóa đơn. Phải là số nguyên từ 1 trở lên.",
    peopleInvalid: "Vui lòng nhập số người là số nguyên từ 1 trở lên.",
    defaultPeople: "4",

    roundLabel: "Làm tròn phần mỗi người lên",
    roundHelp:
      "Làm tròn lên mệnh giá dễ trả. Chọn “không làm tròn” nếu bạn chuyển khoản; phần mỗi người vẫn được làm tròn lên đồng nguyên, vì đồng không có đơn vị nhỏ hơn.",
    roundNone: "Không làm tròn",
    round1k: "1.000 ₫",
    round5k: "5.000 ₫",
    round10k: "10.000 ₫",
    round50k: "50.000 ₫",
    defaultRound: "10000",

    resultTitle: "Kết quả",
    perPersonRoundedLabel: "Mỗi người trả",
    totalPaidLabel: "Cả bàn trả",

    breakdownTitle: "Chi tiết hóa đơn",
    totalLabel: "Tổng hóa đơn",
    perPersonLabel: "Mỗi người trước làm tròn",
    serviceResultLabel: "Phí phục vụ",
    taxResultLabel: "VAT",
    tipResultLabel: "Tiền tip",
    roundingExtraLabel: "Phần dư do làm tròn",
    extraPercentLabel: "Tổng phần trả thêm ngoài tiền món",
  },

  tippingNotice:
    "Việt Nam không có tập quán tip như Hoa Kỳ, nên công cụ này mặc định tiền tip là 0 thay vì gợi ý 15–20%. Thứ hóa đơn Việt Nam thường có là phí phục vụ 5% và VAT — cả hai đều thuộc về nhà hàng, không phải người phục vụ, nên chúng được để riêng thành hai dòng. Nếu bạn muốn tip, hãy nhập mức của mình; nếu hóa đơn đã có phí phục vụ, bạn hoàn toàn có thể để tip bằng 0.",

  formula: {
    title: "Cách tính",
    body: [
      "Thứ tự cộng dồn đúng như trên một hóa đơn thật: phí phục vụ tính trên tiền món ăn, VAT tính trên tiền món ăn cộng phí phục vụ, còn tiền tip tính trên tiền món ăn và không bị đánh thuế. Với 1.000.000 ₫ tiền món, phí phục vụ 5% và VAT 8%, tổng là 1.134.000 ₫.",
      "Phần mỗi người = tổng hóa đơn ÷ số người, rồi làm tròn lên mệnh giá bạn chọn. Công cụ làm tròn phần CỦA MỖI NGƯỜI, không làm tròn tổng — làm tròn tổng rồi chia lại vẫn cho ra những con số không ai trả được.",
      "Phần dư do làm tròn là chênh lệch giữa số cả bàn thực trả và tổng hóa đơn. Nó ở lại nhà hàng và trên thực tế là một khoản tip. Chia 427.000 ₫ cho ba người, làm tròn lên 10.000 ₫ cho ra 150.000 ₫ mỗi người, tức cả bàn trả 450.000 ₫ và dư 23.000 ₫.",
      "Dòng cuối cho biết tất cả những gì bạn trả thêm ngoài tiền món ăn, tính theo phần trăm tiền món — gồm phí phục vụ, VAT, tip và cả phần dư làm tròn. Đây là con số cho thấy hóa đơn thực đắt hơn thực đơn bao nhiêu.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ở Việt Nam có cần tip không?",
        a: "Không bắt buộc và không phải tập quán chung. Nhân viên phục vụ tại Việt Nam nhận lương chứ không phụ thuộc vào tiền tip như ở Hoa Kỳ. Tip là tùy tâm, thường thấy ở nhà hàng cao cấp, khách sạn và với hướng dẫn viên du lịch. Nhiều nơi đã thu phí phục vụ 5%, và khi đó để tip bằng 0 là hoàn toàn bình thường.",
      },
      {
        q: "Phí phục vụ có phải là tiền tip đã trả trước không?",
        a: "Không hẳn. Phí phục vụ là doanh thu của nhà hàng và cách phân phối lại cho nhân viên tùy từng nơi; một số nơi chia cho nhân viên, một số nơi không. Vì vậy công cụ để nó thành một dòng riêng thay vì gộp vào tiền tip. Nếu bạn muốn chắc chắn tiền đến tay người phục vụ, tip trực tiếp là cách rõ ràng hơn.",
      },
      {
        q: "Vì sao VAT lại tính trên cả phí phục vụ?",
        a: "Vì phí phục vụ là một phần doanh thu chịu thuế của nhà hàng, nên hóa đơn tính VAT trên tổng tiền món cộng phí phục vụ. Đây là lý do một hóa đơn có phí phục vụ 5% và VAT 8% đắt hơn tiền món 13,4% chứ không phải 13%.",
      },
      {
        q: "Vì sao làm tròn phần mỗi người thay vì làm tròn tổng?",
        a: "Vì mục đích của việc làm tròn là để mỗi người đưa được một số tờ tiền chẵn. Làm tròn tổng rồi chia lại sẽ lại ra số lẻ, đúng vấn đề ban đầu. Cách này luôn cho ra con số chia hết cho mệnh giá bạn chọn, và phần dư ở lại nhà hàng — công cụ nói rõ phần dư đó là bao nhiêu để bạn quyết định có muốn giảm mệnh giá làm tròn không.",
      },
      {
        q: "Chia không đều thì tính thế nào?",
        a: "Công cụ này chia đều. Khi cần chia theo món ăn của từng người, hãy cộng tiền món của mỗi người rồi áp cùng một tỷ lệ phí phục vụ, VAT và tip lên từng phần — dùng công cụ với số người là 1 và tiền món là phần của người đó. Cách này công bằng hơn khi trong bàn có người chỉ uống nước.",
      },
      {
        q: "Hóa đơn của tôi ghi 10% chứ không phải 8% thì sao?",
        a: "Hãy sửa ô VAT thành 10. Mức giảm 2 điểm phần trăm không áp cho mọi thứ: hàng hóa và dịch vụ chịu thuế tiêu thụ đặc biệt bị loại khỏi diện được giảm, nên một hóa đơn có bia hoặc rượu có thể mang hai mức thuế cùng lúc — phần món ăn 8% và phần đồ uống có cồn 10%. Công cụ chỉ nhận một mức, nên với hóa đơn như vậy con số ở đây là xấp xỉ; nếu cần chính xác, hãy chạy hai lần và cộng lại. Mức giảm cũng chỉ áp dụng đến hết 31/12/2026.",
      },
    ],
  },

  // The page prefills a legal parameter, which is the case `sources` exists
  // for — `components/calc/calculator-page.tsx` says so in as many words:
  // "Naming a decree and a date in prose is not a citation a reader can
  // check". Both links are the official Công báo typeset PDFs rather than an
  // aggregator: the signed copies on datafiles.chinhphu.vn are image scans
  // with no text layer, and thuvienphapluat.vn refuses automated fetching, so
  // neither can be checked by whoever maintains this next.
  sources: {
    title: "Nguồn cho mức VAT điền sẵn",
    intro:
      "Hai văn bản dưới đây là nguồn của mức 8% điền sẵn và của mốc hết hiệu lực 31/12/2026. Chúng được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Đây không phải danh sách đầy đủ và không phải tư vấn thuế. Công cụ cũng chỉ nhận một mức VAT cho cả hóa đơn, trong khi một hóa đơn thật có thể mang hai mức. Hóa đơn của bạn là căn cứ đúng hơn con số điền sẵn ở đây.",
    items: [
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2025/6/45374/57334-1-2025895-896174-2025-nd-cp.pdf",
        label:
          "Nghị định số 174/2025/NĐ-CP — quy định giảm thuế giá trị gia tăng theo Nghị quyết số 204/2025/QH15",
        note: "Nguồn của mức 8% và của thời hạn: Điều 2 khoản 1 ghi hiệu lực từ 01/07/2025 đến hết 31/12/2026. Điều 1 và hai phụ lục kèm theo là nơi xác định những nhóm không được giảm, trong đó có hàng hóa và dịch vụ chịu thuế tiêu thụ đặc biệt.",
      },
      {
        url: "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2024/11/43576/53720-1-20241527-152848-2024-qh15.pdf",
        label:
          "Luật Thuế giá trị gia tăng số 48/2024/QH15 — trang Công báo",
        note: "Nguồn của mức phổ thông 10% tại khoản 3 Điều 9, và của việc phí phục vụ nằm trong giá tính thuế tại khoản 2 Điều 7. Luật có hiệu lực từ 01/07/2025 và đã được sửa đổi bởi các văn bản ban hành sau, nên hãy đối chiếu bản hợp nhất nếu bạn cần dùng cho việc lập hóa đơn.",
      },
    ],
  },
} as const;
