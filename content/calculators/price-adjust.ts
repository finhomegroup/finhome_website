// Copy for /cong-cu/giam-gia-va-thue/ — the discount and tax calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The whole editorial point of this page is the tax-included default. Most
// discount-and-tax calculators are written for the United States, where sales
// tax is added at the till, and they add VAT on top of a Vietnamese shelf
// price — which overstates the answer by the tax rate. Here the default is
// "giá đã gồm thuế", because that is what Vietnamese law requires a displayed
// price to be, and the copy explains the switch rather than burying it.

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

    taxLabel: "Thuế VAT",
    taxUnit: "%",
    taxHelp: "Mức phổ thông tại Việt Nam là 10%; một số nhóm hàng đang là 8%.",
    taxInvalid: "Thuế không được là số âm.",
    defaultTax: "10",

    taxIncludedLegend: "Giá niêm yết đã gồm thuế chưa?",
    taxIncludedHelp:
      "Tại Việt Nam giá bán lẻ phải được niêm yết là số tiền thực phải trả, nên gần như luôn là “đã gồm thuế”. Chỉ chọn “chưa gồm thuế” với báo giá doanh nghiệp hoặc hóa đơn ghi giá trước thuế.",
    taxIncludedYes: "Đã gồm thuế",
    taxIncludedNo: "Chưa gồm thuế",
    defaultTaxIncluded: "yes",

    discountGroup: "Giảm giá",
    discountPercentLabel: "Giảm theo phần trăm",
    discountPercentUnit: "%",
    discountPercentHelp: "Áp dụng trước, ví dụ 20 cho chương trình giảm 20%.",
    discountPercentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultDiscountPercent: "20",

    discountAmountLabel: "Giảm thêm theo số tiền",
    discountAmountUnit: "₫",
    discountAmountHelp:
      "Voucher hoặc phiếu giảm giá, áp dụng sau phần trăm. Để 0 nếu không có.",
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

    tooMuchNotice:
      "Tổng mức giảm đang lớn hơn giá niêm yết, nên phép tính không có kết quả — không cửa hàng nào trả lại tiền cho bạn khi mua hàng. Hãy giảm phần trăm hoặc giảm số tiền voucher.",
  },

  taxIncludedNotice:
    "Điểm khác biệt của công cụ này: mặc định giá niêm yết đã gồm thuế. Với lựa chọn đó, mức giảm được trừ trên giá đã gồm thuế và dòng “tiền thuế” cho biết phần thuế đang nằm sẵn trong số bạn trả, chứ không cộng thêm gì. Nhiều công cụ nước ngoài luôn cộng thuế lên trên, và trên một giá niêm yết Việt Nam thì kết quả bị đội lên đúng bằng thuế suất — 800.000 ₫ thành 880.000 ₫.",

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
        a: "Khi bạn đang đọc một báo giá doanh nghiệp, một hợp đồng hoặc một hóa đơn ghi rõ giá trước thuế, thường kèm dòng “chưa bao gồm VAT”. Với hàng bán lẻ cho người tiêu dùng thì hầu như luôn là đã gồm thuế, vì pháp luật bảo vệ người tiêu dùng yêu cầu giá niêm yết phải là số tiền thực phải trả.",
      },
      {
        q: "Giảm 20% rồi giảm thêm 10% có phải là giảm 30% không?",
        a: "Không, đó là giảm 28%. Mức giảm thứ hai được tính trên giá đã giảm, tức 0,8 × 0,9 = 0,72 giá gốc. Công cụ này áp một mức phần trăm cộng một mức tiền cố định; nếu chương trình có hai mức phần trăm chồng nhau, hãy chạy công cụ hai lần và lấy giá cuối của lần trước làm giá niêm yết của lần sau.",
      },
      {
        q: "Vì sao tỷ lệ tiết kiệm không đổi khi tôi bật tắt “đã gồm thuế”?",
        a: "Vì thuế nhân cùng một hệ số vào cả giá gốc và giá đã giảm, nên tỷ lệ giữa hai con số không thay đổi. Điều thay đổi là số tiền tuyệt đối: cùng mức giảm 20%, bạn tiết kiệm 200.000 khi giá đã gồm thuế và 220.000 khi thuế được cộng thêm, vì bản thân giá gốc trong trường hợp sau đã cao hơn.",
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
} as const;
