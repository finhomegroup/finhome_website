// Copy for /cong-cu/loi-suat-tuong-duong-thue/ — tax-equivalent yield.
//
// Original FinHome copy.
//
// The Vietnamese case this page exists for is specific and routinely missed:
// interest on a personal savings deposit carries NO personal income tax,
// while a corporate bond coupon and a cash dividend carry 5%. So a 5,5%
// deposit and a 5,8% bond are not 0,3 points apart — the bond nets 5,51%,
// which is a dead heat. The whole page is about stopping that comparison
// being made on the quoted numbers.
//
// Figures quoted are the module's own output. Grossing up 5,5% at a 5% tax
// rate: 5,789474%, tức phải chênh 0,289474 điểm, và mức chênh tương đối là
// 5,263158% — không phải 5%. Chiều nghịch: 5,8% chịu thuế 5% còn 5,51%.

export const TAX_EQUIVALENT = {
  slug: "/cong-cu/loi-suat-tuong-duong-thue",

  pageTitle: "Lợi suất tương đương thuế",
  metaTitle: "Tính lợi suất tương đương thuế — So sản phẩm chịu thuế và miễn thuế",
  metaDescription:
    "Quy lợi suất của sản phẩm chịu thuế và miễn thuế về cùng một thước đo, để so sánh công bằng giữa tiền gửi, trái phiếu và cổ tức. Công cụ miễn phí của FinHome.",

  lede:
    "Hai mức lợi suất niêm yết trước thuế không so được với nhau nếu một trong hai bị đánh thuế. Ở Việt Nam, lãi tiền gửi tiết kiệm của cá nhân không chịu thuế thu nhập cá nhân, còn lãi trái phiếu doanh nghiệp và cổ tức tiền mặt thì chịu 5%.",

  form: {
    directionLegend: "Bạn đang có con số nào?",
    directionHelp:
      "Chiều thứ nhất trả lời “sản phẩm chịu thuế phải trả bao nhiêu mới bằng”. Chiều thứ hai trả lời “sản phẩm chịu thuế này thực nhận bao nhiêu”.",
    directionToTaxable: "Có lợi suất miễn thuế, tìm mức chịu thuế tương đương",
    directionToAfterTax: "Có lợi suất chịu thuế, tìm mức thực nhận",
    defaultDirection: "toTaxable",

    group: "Số liệu",
    yieldLabel: "Lợi suất",
    yieldUnit: "%/năm",
    yieldHelp:
      "Con số bạn đang có, theo chiều đã chọn ở trên. Ví dụ lãi tiền gửi 5,5%/năm.",
    yieldInvalid: "Vui lòng nhập một số.",
    defaultYield: "5,5",

    taxRateLabel: "Thuế suất trên sản phẩm chịu thuế",
    taxRateUnit: "%",
    taxRateHelp:
      "Lãi trái phiếu doanh nghiệp và cổ tức tiền mặt của cá nhân tại Việt Nam hiện là 5%. Phải nhỏ hơn 100%.",
    taxRateInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultTaxRate: "5",

    resultTitle: "Kết quả",
    taxableLabel: "Lợi suất chịu thuế cần có",
    afterTaxLabel: "Lợi suất thực nhận sau thuế",
    taxCostLabel: "Thuế lấy đi",
    pointsUnit: "điểm %",

    detailTitle: "Chi tiết",
    taxFreeLabel: "Lợi suất miễn thuế",
    grossUpLabel: "Mức chênh tương đối cần có",

    impossibleNotice:
      "Thuế suất 100% nghĩa là không có mức lợi suất chịu thuế nào bằng được một mức miễn thuế dương, nên phép quy đổi không có kết quả. Hãy nhập thuế suất nhỏ hơn 100%.",
  },

  vietnamNotice:
    "Đây là phép so mà rất nhiều người làm sai ở Việt Nam. Lãi tiền gửi tiết kiệm của cá nhân hiện KHÔNG chịu thuế thu nhập cá nhân; lãi trái phiếu doanh nghiệp và cổ tức tiền mặt thì chịu 5%, thường bị khấu trừ tại nguồn. Vì vậy một sổ tiết kiệm 5,5%/năm và một trái phiếu 5,8%/năm không cách nhau 0,3 điểm phần trăm: trái phiếu thực nhận 5,51%, tức gần như ngang nhau — trong khi bạn đang gánh rủi ro tín dụng của doanh nghiệp phát hành thay vì rủi ro của một khoản tiền gửi có bảo hiểm. Để bằng đúng 5,5% sau thuế, trái phiếu phải trả 5,789474%.",

  formula: {
    title: "Cách tính",
    body: [
      "Từ miễn thuế sang chịu thuế: lợi suất chịu thuế cần có = lợi suất miễn thuế ÷ (1 − thuế suất). Với 5,5% và thuế 5%: 5,5 ÷ 0,95 = 5,789474%.",
      "Từ chịu thuế sang thực nhận: lợi suất thực nhận = lợi suất chịu thuế × (1 − thuế suất). Với 5,8% và thuế 5%: 5,8 × 0,95 = 5,51%.",
      "Hai chiều không đối xứng theo cách người ta thường nghĩ. Chia cho (1 − t) dịch xa hơn nhân với (1 − t), nên mức phải cộng thêm luôn lớn hơn mức bị trừ đi. Ở thuế suất 5%, mức chênh tương đối cần có là 5,263158% chứ không phải 5% — và khoảng cách này rộng nhanh theo thuế suất: ở thuế 50% thì sản phẩm chịu thuế phải trả gấp đôi.",
      "Dòng “thuế lấy đi” là chênh lệch tính theo điểm phần trăm giữa hai con số. Với mặc định là 0,289474 điểm — nhỏ về mặt số học nhưng đủ để đảo ngược một quyết định giữa hai sản phẩm chỉ chênh nhau 0,3 điểm.",
      "Công cụ nhận lợi suất âm, vì lợi suất thực sau lạm phát có thể âm và phép quy đổi vẫn đúng. Nó từ chối thuế suất bằng hoặc trên 100%, vì khi đó không có mức lợi suất nào bù lại được.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lãi tiền gửi của cá nhân thật sự không chịu thuế?",
        a: "Đúng, theo quy định hiện hành lãi tiền gửi tại tổ chức tín dụng của cá nhân không thuộc thu nhập chịu thuế thu nhập cá nhân. Với tổ chức thì khác — lãi tiền gửi là thu nhập chịu thuế thu nhập doanh nghiệp. Quy định có thể thay đổi, nên nếu số tiền lớn hãy kiểm tra lại mức hiện hành và nhập vào ô thuế suất.",
      },
      {
        q: "Ngoài thuế thì còn gì cần tính khi so hai sản phẩm này?",
        a: "Rủi ro và thanh khoản, và cả hai đều quan trọng hơn 0,3 điểm phần trăm. Tiền gửi tại tổ chức tín dụng được bảo hiểm tiền gửi tới một hạn mức; trái phiếu doanh nghiệp thì không có gì bảo đảm ngoài khả năng trả nợ của tổ chức phát hành. Trái phiếu cũng khó bán lại hơn và chênh lệch giá mua bán rộng hơn. Lợi suất cao hơn của trái phiếu chính là giá của những khác biệt đó, không phải một ưu đãi.",
      },
      {
        q: "Cổ tức thì áp dụng thế nào?",
        a: "Cổ tức tiền mặt của cá nhân chịu 5% thuế thu nhập cá nhân, thường khấu trừ tại nguồn, nên cách dùng giống trái phiếu: nhập lợi suất cổ tức trước thuế theo chiều thứ hai để biết mức thực nhận. Lưu ý cổ tức bằng cổ phiếu thì khác — thuế phát sinh khi bạn bán, và nó thuộc phần thuế chuyển nhượng chứng khoán 0,1% giá trị bán.",
      },
      {
        q: "Vì sao mức chênh cần có là 5,263% mà không phải 5%?",
        a: "Vì thuế được tính trên con số LỚN HƠN. Để còn lại 5,5 sau khi mất 5%, bạn phải bắt đầu từ 5,789474 — và 0,289474 chia cho 5,5 bằng 5,263%. Đây cũng chính là lý do một khoản lỗ 50% cần lãi 100% mới hồi vốn: phần trăm của hai mốc khác nhau thì không bù trừ nhau.",
      },
    ],
  },
} as const;
