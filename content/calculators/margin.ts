// Copy for /cong-cu/margin-va-markup/ — the margin and markup calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The page exists for one specific mistake, and every part of the copy points
// at it: wanting a 40% margin and marking cost up by 40% instead. That lands
// on a 28,57% margin — 11,43 điểm short — and a small shop can run that way
// for a year without working out where the money went. All figures quoted
// below are for the default 600.000 ₫ cost and are checked by the test suite.

export const MARGIN = {
  slug: "/cong-cu/margin-va-markup",

  pageTitle: "Margin và markup: cùng một lợi nhuận, hai con số",
  metaTitle: "Tính margin và markup — Chuyển đổi giữa hai tỷ lệ",
  metaDescription:
    "Nhập giá vốn cùng giá bán, tỷ lệ margin hoặc tỷ lệ markup để có đủ cả bốn con số. Công cụ miễn phí của FinHome.",

  lede:
    "Margin chia lợi nhuận cho giá bán, markup chia lợi nhuận cho giá vốn. Cùng một đồng lãi, hai con số khác nhau — và markup 50% chỉ là margin 33,33%. Nhập giá vốn cùng một trong ba con số còn lại để có đủ cả bốn.",

  form: {
    modeLegend: "Bạn biết con số nào?",
    modeHelp:
      "Cách nào cũng cho ra đủ giá bán, lợi nhuận, margin và markup, nên bạn có thể dùng công cụ để chuyển đổi giữa hai tỷ lệ.",
    modePrice: "Giá vốn và giá bán",
    modeMargin: "Giá vốn và margin mong muốn",
    modeMarkup: "Giá vốn và markup mong muốn",

    group: "Số liệu",
    costLabel: "Giá vốn",
    costUnit: "₫",
    costHelp: "Toàn bộ chi phí để có được hàng, gồm cả vận chuyển và nhập khẩu.",
    costInvalid: "Vui lòng nhập giá vốn lớn hơn 0.",
    defaultCost: "600.000",

    priceLabel: "Giá bán",
    priceUnit: "₫",
    priceHelp: "Giá bán ra cho khách. Không được bằng 0.",
    priceInvalid: "Vui lòng nhập giá bán khác 0.",
    defaultPrice: "1.000.000",

    marginLabel: "Margin mong muốn",
    marginUnit: "%",
    marginHelp:
      "Lợi nhuận trên giá bán. Phải nhỏ hơn 100 — margin 100% nghĩa là hàng miễn phí.",
    marginInvalid: "Vui lòng nhập một số nhỏ hơn 100.",
    defaultMargin: "40",

    markupLabel: "Markup mong muốn",
    markupUnit: "%",
    markupHelp: "Lợi nhuận trên giá vốn. Không có giới hạn trên.",
    markupInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultMarkup: "50",

    resultTitle: "Kết quả",
    priceResultLabel: "Giá bán",
    profitLabel: "Lợi nhuận trên mỗi đơn vị",
    marginResultLabel: "Margin",
    markupResultLabel: "Markup",
  },

  trapNotice:
    "Cái bẫy: muốn margin 40% nhưng lại cộng 40% lên giá vốn. Với giá vốn 600.000 ₫, margin 40% cần giá bán 1.000.000 ₫; cộng 40% lên giá vốn chỉ ra 840.000 ₫, tức margin 28,57% — thiếu 11,43 điểm phần trăm. Một cửa hàng có thể bán suốt một năm theo cách đó rồi không hiểu tiền lãi đã đi đâu. Hãy dùng đúng chế độ “giá vốn và margin mong muốn” khi bạn nghĩ theo margin.",

  formula: {
    title: "Cách tính",
    body: [
      "Lợi nhuận = giá bán − giá vốn. Margin = lợi nhuận ÷ giá bán × 100. Markup = lợi nhuận ÷ giá vốn × 100. Vì giá bán luôn lớn hơn giá vốn khi có lãi, margin luôn nhỏ hơn markup.",
      "Từ margin ra giá bán: giá bán = giá vốn ÷ (1 − margin ÷ 100). Đây là công thức nhiều người bỏ qua, và cũng là lý do margin không thể đạt 100%: khi đó phép chia là chia cho 0, còn trên 100% thì giá bán ra số âm.",
      "Từ markup ra giá bán: giá bán = giá vốn × (1 + markup ÷ 100). Markup không có giới hạn trên — markup 400% là giá bán gấp 5 lần giá vốn, tương đương margin 80%.",
      "Chuyển đổi trực tiếp giữa hai tỷ lệ: margin = markup ÷ (100 + markup) × 100, và markup = margin ÷ (100 − margin) × 100. Vài cặp đáng nhớ: markup 25% là margin 20%, markup 50% là margin 33,33%, markup 100% là margin 50%.",
      "Bán dưới giá vốn cho ra cả hai tỷ lệ âm, và công cụ vẫn hiển thị thay vì báo lỗi — bán lỗ là một tình huống thật, và biết mức lỗ là bao nhiêu phần trăm mới quyết định được.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên quản lý theo margin hay theo markup?",
        a: "Theo margin, vì margin nói trực tiếp bao nhiêu phần trăm doanh thu ở lại với bạn, nên nó ghép được với báo cáo kết quả kinh doanh và so sánh được giữa các ngành. Markup hữu ích khi định giá tại quầy, vì nó là phép nhân đơn giản trên giá vốn. Cách làm an toàn là chọn margin mục tiêu trước, rồi dùng công cụ này quy ra markup để dùng khi nhập hàng.",
      },
      {
        q: "Vì sao margin không thể bằng hoặc vượt 100%?",
        a: "Vì margin 100% có nghĩa toàn bộ giá bán là lợi nhuận, tức giá vốn bằng 0 — hàng được cho không. Trên 100% thì công thức giá bán = giá vốn ÷ (1 − margin) cho ra số âm, không còn là một mức giá. Markup thì khác: markup 900% chỉ là bán gấp 10 lần giá vốn, hoàn toàn có thật với một số ngành.",
      },
      {
        q: "Giá vốn nên gồm những gì?",
        a: "Toàn bộ chi phí biến đổi để có được một đơn vị hàng: giá nhập, vận chuyển, thuế nhập khẩu, đóng gói và phần hao hụt dự kiến. Không nên gộp tiền thuê mặt bằng, lương cố định hay chi phí quảng cáo — đó là chi phí cố định, không đổi theo từng đơn vị bán ra, và gộp vào sẽ làm margin trên mỗi đơn vị mất ý nghĩa. Margin tính trên giá vốn biến đổi là con số dùng để định giá; sau đó mới lấy tổng lợi nhuận gộp trừ chi phí cố định.",
      },
      {
        q: "Margin bao nhiêu là đủ?",
        a: "Tùy ngành, và con số duy nhất có ý nghĩa là con số phủ được chi phí cố định của bạn. Bán lẻ thực phẩm thường sống với margin rất mỏng nhưng vòng quay hàng nhanh; thời trang và mỹ phẩm cần margin dày hơn nhiều vì hàng tồn lâu và có mùa. Hãy lấy chi phí cố định hằng tháng chia cho margin để biết cần bán bao nhiêu doanh thu mới hòa vốn.",
      },
      {
        q: "Giảm giá ăn vào margin thế nào?",
        a: "Nhanh hơn cảm nhận, vì mức giảm được trừ trực tiếp khỏi lợi nhuận. Với giá vốn 600.000 và giá bán 1.000.000 — margin 40% — giảm giá 10% làm giá bán còn 900.000 và lợi nhuận còn 300.000, tức margin tụt xuống 33,33% và lợi nhuận mất một phần tư. Hãy nhập lại giá bán sau giảm vào chế độ “giá vốn và giá bán” để thấy con số thật trước khi chạy một chương trình khuyến mãi.",
      },
    ],
  },
} as const;
