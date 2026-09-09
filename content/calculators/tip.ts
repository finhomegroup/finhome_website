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
    taxHelp: "Tính trên tiền món ăn cộng phí phục vụ. Thường là 8% hoặc 10%.",
    taxInvalid: "Vui lòng nhập một số từ 0 trở lên.",
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
    ],
  },
} as const;
