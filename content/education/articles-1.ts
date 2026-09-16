// "Mua nhà bằng con số", articles C01–C06.
//
// Original AI-assisted draft. Visuals use the declared inputs; prose requires
// separate semantic review and selected numerical regression fixtures.
// Tests do not establish professional sign-off or every narrative claim.
//
// Nothing here quotes a current bank rate, fee schedule or regulation.

import type { EducationArticle } from "@/content/education/types";

const SRC_CFPB_DOWN_PAYMENT = {
  label: "CFPB — How to decide how much to spend on your down payment",
  url: "https://www.consumerfinance.gov/archive/blog/how-decide-how-much-spend-your-down-payment/",
  note:
    "Khái niệm dùng ở đây: tiền đã đưa vào nhà thì không còn dùng được cho việc khẩn cấp, nên cần giữ lại một phần. Đây là tài liệu giáo dục đã lưu trữ của cơ quan bảo vệ người tiêu dùng Hoa Kỳ, không phải quy định hay tỷ lệ áp dụng tại Việt Nam.",
};

const SRC_CFPB_LOAN_ESTIMATE = {
  label: "CFPB — Loan Estimate Explainer",
  url: "https://www.consumerfinance.gov/owning-a-home/loan-estimate/",
  note:
    "Khái niệm dùng ở đây: phân biệt khoản trả gốc và lãi với tổng chi phí nhà ở hằng tháng và các khoản trả một lần khi mua. Đây là mẫu giấy tờ của Hoa Kỳ, không phải biểu mẫu bắt buộc tại Việt Nam.",
};

const SRC_CFPB_COMPARE = {
  label: "CFPB — Compare and negotiate your loan offers",
  url: "https://www.consumerfinance.gov/owning-a-home/compare/compare-loan-estimates/",
  note:
    "Khái niệm dùng ở đây: so các báo giá trên cùng số tiền vay, cùng khoảng thời gian và cùng phạm vi chi phí; lãi suất thấp hơn hay khoản trả tháng nhỏ hơn chưa phải là toàn bộ quyết định. Số liệu thống kê trong trang đó là của Hoa Kỳ và không được dùng ở đây.",
};

const SRC_TCB_TRA_GOP = {
  label: "Techcombank — Vay mua nhà trả góp (nội dung giáo dục của ngân hàng)",
  url: "https://techcombank.com/thong-tin/blog/vay-mua-nha-tra-gop",
  note:
    "Khái niệm dùng ở đây: khi tính khả năng trả nợ thì thu nhập, chi phí sinh hoạt và các khoản nợ đang có đều được xét, và có nhiều cấu trúc trả nợ khác nhau. Đây là nội dung do một ngân hàng viết, không phải ngưỡng an toàn áp dụng cho mọi hộ.",
};

const SRC_TCB_DAILY = {
  label: "Techcombank — Vay mua bất động sản đã có giấy chứng nhận",
  url: "https://techcombank.com/khach-hang-ca-nhan/vay/vay-mua-nha/vay-mua-nha-o",
  note:
    "Khái niệm dùng ở đây: có hợp đồng tính lãi theo số ngày thực tế trong kỳ chia 365, khác với cách chia lãi năm cho 12 mà công cụ của FinHome dùng để minh họa. Vì vậy con số trong bài là ví dụ, không phải lịch trả nợ của hợp đồng nào.",
};

export const ARTICLES_1: EducationArticle[] = [
  // ------------------------------------------------------------------ C01
  {
    slug: "co-600-trieu-nen-tim-nha-tam-gia-nao",
    group: "BUDGET",
    planId: "C01",
    question: "Có 600 triệu, nên tìm nhà trong tầm giá nào?",
    shortAnswer: [
      "Không có một con số đúng cho mọi hộ, nhưng có một phép tính bạn tự làm được trong hai phút: lấy khoản tiền bạn trả được mỗi tháng, quy nó thành số tiền vay, rồi cộng phần tiền tự có thực sự đưa vào nhà.",
      "Điểm quan trọng hơn kết quả: “có 600 triệu” không có nghĩa là 600 triệu đều đi vào giá nhà. Quỹ dự phòng và chi phí mua ngoài giá lấy từ cùng số tiền đó, và tầm giá phải tính sau khi trừ chúng.",
    ],
    // The distinction the reader should leave with, and the condition that
    // travels with it: the reserve and the purchase costs come out of the SAME
    // pot, under this household's stated assumptions.
    shortAnswerEmphasis: [
      "“có 600 triệu” không có nghĩa là 600 triệu đều đi vào giá nhà",
      "lấy từ cùng số tiền đó",
    ],
    household: {
      title: "Hộ giả lập trong bài",
      items: [
        { label: "Thu nhập gộp cả hộ", value: "50.000.000 ₫/tháng" },
        { label: "Thu nhập thực nhận", value: "44.000.000 ₫/tháng" },
        { label: "Chi phí sinh hoạt thiết yếu", value: "18.000.000 ₫/tháng" },
        { label: "Nợ đang trả", value: "5.000.000 ₫/tháng" },
        { label: "Muốn tiếp tục để dành", value: "3.000.000 ₫/tháng" },
        { label: "Tiền tích lũy đang có", value: "600.000.000 ₫" },
        { label: "Giữ lại làm quỹ dự phòng", value: "100.000.000 ₫" },
        { label: "Chi phí mua ngoài giá (giả định)", value: "3% giá nhà" },
        { label: "Lãi suất dùng để tính", value: "8,5%/năm, cố định 240 tháng" },
      ],
      note:
        "Đây là một hộ giả lập để minh họa phép tính, không phải số liệu của gia đình thật và không phải báo giá của ngân hàng nào. Lãi suất 8,5% là con số tròn để tính; hãy dùng mức lãi mà ngân hàng của bạn nói.",
    },
    sections: [
      {
        heading: "Ba con số khác nhau, và chỉ một trong ba là tầm giá",
        paragraphs: [
          "Khi hỏi “tôi mua được nhà bao nhiêu”, thực ra có ba câu trả lời và chúng không bằng nhau. Thứ nhất là khoản tiền bạn trả được mỗi tháng — cái này quyết định số tiền vay. Thứ hai là số tiền vay mà khoản trả đó gánh được. Thứ ba mới là tầm giá: số tiền vay cộng với phần tiền tự có thực sự đưa vào căn nhà.",
          "Hộ trong bài còn lại 18 triệu mỗi tháng sau khi trừ sinh hoạt, nợ đang trả và phần muốn để dành: 44 − 18 − 5 − 3. Mười tám triệu đó, trả trong 240 tháng ở mức 8,5%/năm, tương đương một khoản vay khoảng 2,07 tỷ. Đó là con số thứ hai, chưa phải tầm giá.",
          "Từ 600 triệu tích lũy, hộ này giữ lại 100 triệu làm quỹ dự phòng, nên chỉ còn 500 triệu dùng được. Trong 500 triệu đó, một phần phải trả chi phí mua ngoài giá — thuế, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm, tiền hoàn thiện tối thiểu. Phần còn lại mới là tiền trả trước thật.",
        ],
        emphasis: [
          "có ba câu trả lời và chúng không bằng nhau",
          "Đó là con số thứ hai, chưa phải tầm giá",
          "Phần còn lại mới là tiền trả trước thật",
        ],
      },
      {
        heading: "Vì sao quỹ dự phòng làm tầm giá thấp đi, và vì sao vẫn nên giữ",
        paragraphs: [
          "Giữ lại 100 triệu làm quỹ dự phòng làm phần tiền có thể đưa vào giao dịch giảm 100 triệu, nhưng tầm giá không nhất thiết giảm đúng bằng số đó. Với chi phí mua 3% và giới hạn khoản trả đang chặn, mức giảm tầm giá là 100 triệu chia 1,03, khoảng 97,1 triệu. Nếu tỷ lệ vay giả định 80% đang chặn, mức giảm có thể là 100 triệu chia 0,23, khoảng 434,8 triệu; cần xem công cụ đang báo giới hạn nào.",
          "Nhưng tiền đã đưa vào căn nhà thì không còn dùng được cho việc khác. Nếu thu nhập gián đoạn vài tháng sau khi mua, khoản trả nợ vẫn đến đúng hạn, và lúc đó vay lại khoản tiền vừa đưa vào nhà là việc khó và đắt. Đây là lý do một quỹ dự phòng riêng biệt tồn tại — không phải để tối ưu tầm giá, mà để tầm giá đó còn đứng được khi có chuyện.",
          "Bao nhiêu là đủ thì tùy hộ: tùy thu nhập có ổn định hay không, tùy có ai khác gánh đỡ được không, tùy bạn ngủ được với mức nào. Bài này không đưa ra một con số chung, và bạn nên tự nhập con số của mình vào công cụ.",
        ],
        emphasis: [
          "tầm giá không nhất thiết giảm đúng bằng số đó",
          "cần xem công cụ đang báo giới hạn nào",
          "tiền đã đưa vào căn nhà thì không còn dùng được cho việc khác",
          "Bài này không đưa ra một con số chung",
        ],
      },
      {
        heading: "Phần vay được cũng là một giả định của bạn",
        paragraphs: [
          "Phép tính trên giả định bạn vay được toàn bộ phần thiếu. Thực tế ngân hàng chỉ cho vay một tỷ lệ nhất định trên giá trị tài sản bảo đảm, và giá trị đó do ngân hàng thẩm định chứ không phải giá bạn mua.",
          "Công cụ của FinHome để bạn nhập tỷ lệ đó vào ô “Giả định vay được tối đa”, mặc định 100% — nghĩa là chưa đặt yêu cầu trả trước nào. Nếu ngân hàng nói bạn phải tự có 20% hoặc 30%, hãy nhập 80 hoặc 70 và xem tầm giá đổi bao nhiêu. Thường là đổi rất nhiều, và biết trước thì đỡ mất thời gian đi xem nhà sai tầm.",
        ],
        emphasis: [
          "Phép tính trên giả định bạn vay được toàn bộ phần thiếu",
          "giá trị đó do ngân hàng thẩm định chứ không phải giá bạn mua",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá của hộ giả lập gồm những gì",
      input: {
        mode: "household",
        monthlyIncome: 50_000_000,
        monthlyNetIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
        downPayment: 600_000_000,
        cashReserve: 100_000_000,
        purchaseCostPercent: 3,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
    },
    // CORRECTED against the rendered figure. An earlier draft of this
    // sentence said the middle bar contained the reserve PLUS the purchase
    // costs and told the reader to compare TWO bars. The figure has THREE,
    // and the middle one is 74.975.392 ₫ — the 3% purchase cost alone. The
    // 100 triệu reserve is taken out BEFORE the usable cash and is not
    // plotted at all. Written from the resolved model, not from the price
    // arithmetic.
    visualReading:
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá 2.499.179.725 ₫, chia thành phần tiền của bạn thật sự vào giá nhà và phần tiền vay. Thanh giữa, 74.975.392 ₫, là chi phí mua ngoài giá 3% — tiền bạn bỏ ra nhưng KHÔNG thành giá nhà; quỹ dự phòng 100 triệu đã được tách ra trước đó nên không có trong thanh này và không xuất hiện trong hình. Thanh dưới là khoản vay mà ngân sách hằng tháng gánh được, đặt ở đó để bạn thấy giới hạn nào đang chặn — không phải một khoản tiền cộng thêm vào giá. Cả ba đều dựng trên giả định của hộ giả lập và không cho biết ngân hàng duyệt mức nào.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khả năng mua nhà và thay tình huống giả lập bằng số của bạn. Các bước dưới đây dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?” ở phần “Bạn muốn biết điều gì?”.",
        "Nhập “Thu nhập cả hộ mỗi tháng” (thu nhập gộp) và “Nợ đang trả mỗi tháng”.",
        "Trong nhóm “Dòng tiền thật của hộ”, nhập “Thu nhập thực nhận mỗi tháng”, “Chi phí sinh hoạt thiết yếu mỗi tháng” và “Muốn để dành mỗi tháng”.",
        "Trong nhóm “Điều kiện mua”, nhập “Tiền tích lũy đang có” và “Giữ lại làm quỹ dự phòng” — đừng tự trừ trước, công cụ trừ đúng một lần.",
        "Mở “Giả định của bạn” và nhập “Chi phí mua nhà ngoài giá” cùng “Giả định vay được tối đa”.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Đổi “Giữ lại làm quỹ dự phòng” từ 0 lên mức bạn muốn giữ. Ghi mức giảm tầm giá và đọc giới hạn đang chặn; mức giảm phụ thuộc cả chi phí mua ngoài giá và tỷ lệ vay giả định, không phải luôn bằng số tiền giữ lại.",
      check:
        "Nếu tầm giá của bạn bị chặn bởi tiền tự có chứ không phải khoản trả hằng tháng, công cụ sẽ nói ra. Khi đó tăng thu nhập không giúp gì; tích lũy thêm mới giúp. Bạn đang bị chặn bởi cái nào?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Ngân hàng có duyệt cho bạn vay hay không, và duyệt bao nhiêu. Đó là kết quả thẩm định hồ sơ, không phải kết quả của một phép tính.",
        "Giá nhà ở khu vực bạn muốn ở. Tầm giá là ngân sách, không phải thị trường.",
        "Lãi suất trong 20 năm tới. Phép tính giả định một mức lãi không đổi; bài C03 nói về việc lãi đổi.",
        "Chi phí mua ngoài giá thật của bạn, vốn phụ thuộc loại giao dịch và địa phương.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Các nguồn dưới đây được dùng cho KHÁI NIỆM, không phải cho một con số, một tỷ lệ hay một quy định áp dụng tại Việt Nam.",
      items: [SRC_CFPB_DOWN_PAYMENT, SRC_TCB_TRA_GOP],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "duoc-vay-khong-co-nghia-nen-vay-het",
      "vay-2-ty-moi-thang-tra-bao-nhieu",
    ],
  },

  // ------------------------------------------------------------------ C02
  {
    slug: "vay-2-ty-moi-thang-tra-bao-nhieu",
    group: "PAYMENT",
    planId: "C02",
    question: "Vay 2 tỷ mua nhà, mỗi tháng thực sự phải chuẩn bị bao nhiêu?",
    shortAnswer: [
      "Với 2 tỷ, lãi 8,5%/năm, trả góp đều trong 240 tháng, khoản ngân hàng thu là 17.356.465 ₫ mỗi tháng.",
      "Nhưng “khoản ngân hàng thu” và “tiền ra khỏi ví” là hai con số khác nhau. Nếu bạn trả thêm gốc, hoặc có phí quản lý và bảo hiểm, số thứ hai lớn hơn. Và tháng cuối cùng thì nhỏ hơn cả hai.",
    ],
    // The instalment is not the month's cash out. The example's own terms are
    // emphasised with it, so the figure never travels without them.
    shortAnswerEmphasis: [
      "“khoản ngân hàng thu” và “tiền ra khỏi ví” là hai con số khác nhau",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Lãi suất", value: "8,5%/năm, giữ nguyên suốt kỳ hạn" },
        { label: "Kỳ hạn", value: "240 tháng (20 năm)" },
        { label: "Cách trả", value: "Trả góp đều (niên kim)" },
        { label: "Trả thêm gốc mỗi tháng", value: "2.000.000 ₫" },
      ],
      note:
        "Khoản vay giả lập để minh họa. Lãi suất giữ nguyên 240 tháng là giả định của mô hình, không phải khẳng định hợp đồng của bạn áp dụng như vậy. Bài C03 trình bày trường hợp mức lãi thay đổi.",
    },
    sections: [
      {
        // A heading is a claim, not a label: a reader who scans only the
        // headings should still learn that the instalment is one of three
        // numbers rather than the number.
        heading: "Mỗi tháng có ba con số, và “khoản ngân hàng thu” chỉ là một trong ba",
        paragraphs: [
          "Câu hỏi “mỗi tháng trả bao nhiêu” có ba câu trả lời và bạn cần cả ba.",
          "Khoản ngân hàng thu theo lịch là 17.356.465 ₫. Đây là khoản trả tính theo mô hình của bài, không phải số trên một hợp đồng thật; hãy đối chiếu lịch ngân hàng cấp khi lập kế hoạch trả nợ.",
          "Tiền ra khỏi ví là 19.356.465 ₫, vì hộ trong bài chọn trả thêm 2 triệu gốc mỗi tháng. Trả thêm là quyền chọn của bạn, không phải nghĩa vụ — nhưng khi đã chọn thì đây mới là con số cần chuẩn bị.",
          "Tháng cuối cùng là tháng 187, và tháng đó chỉ còn 9.549.208 ₫: vừa đúng phần dư nợ còn lại cộng tiền lãi của nó, không phải một kỳ trả đủ. Nhờ trả thêm, khoản vay xong sớm 53 tháng và tiết kiệm được 555.699.884 ₫ tiền lãi — trước phí trả nợ trước hạn, khoản mà công cụ chưa tính và hợp đồng của bạn mới quyết định.",
        ],
        emphasis: [
          "có ba câu trả lời và bạn cần cả ba",
          "Trả thêm là quyền chọn của bạn, không phải nghĩa vụ",
          "trước phí trả nợ trước hạn",
        ],
      },
      {
        heading: "Vì sao những năm đầu gần như chỉ trả lãi",
        paragraphs: [
          "Tháng đầu tiên, trong 17.356.465 ₫ có 14.166.667 ₫ là lãi và chỉ 3.189.798 ₫ là gốc. Lãi được tính trên dư nợ, và tháng đầu dư nợ còn nguyên 2 tỷ.",
          "Tỷ trọng gốc và lãi phụ thuộc cả lãi suất lẫn kỳ hạn. Trong ví dụ 8,5% và 240 tháng này, khoản trả đầu kỳ chủ yếu là lãi. Khi giữ nguyên số tiền vay, kỳ hạn và cách trả góp đều, lãi thấp hơn cho phần gốc tháng đầu LỚN hơn. Ở mức lãi 0%, toàn bộ khoản trả là gốc.",
          "Hệ quả thực tế: nếu bạn định bán nhà sau vài năm, hãy nhìn cột dư nợ trong biểu đồ chứ không nhìn tổng số tiền đã trả. Đã trả nhiều không có nghĩa là đã trả được nhiều gốc.",
        ],
        emphasis: [
          "Lãi được tính trên dư nợ",
          "lãi thấp hơn cho phần gốc tháng đầu LỚN hơn",
          "Đã trả nhiều không có nghĩa là đã trả được nhiều gốc",
        ],
      },
      {
        heading: "Trả góp đều hay trả gốc đều: đánh đổi giữa tháng đầu và tổng lãi",
        paragraphs: [
          "Công cụ có hai cách trả và chúng cho ra hai con số rất khác nhau ở tháng đầu. Nếu không trả thêm và không đổi lãi suất, trả góp đều giữ khoản trả theo lịch ở khoảng 17.356.465 ₫ mỗi tháng, ngoại trừ làm tròn hoặc kỳ cuối. Trả gốc đều chia gốc thành 240 phần bằng nhau rồi cộng lãi trên dư nợ còn lại, nên tháng đầu là 22.500.000 ₫ và giảm dần về sau.",
          "Khi cùng số tiền vay, lãi suất, kỳ hạn và đều không trả thêm, trả gốc đều tốn ít lãi hơn — trên khoản vay này là 1.707.083.333 ₫ so với 2.165.551.520 ₫ — nhưng đòi hỏi tháng đầu nặng hơn gần 30%. Đây là một đánh đổi giữa tổng chi phí và dòng tiền những năm đầu, không phải một phương án tốt hơn phương án kia.",
          "Hãy hỏi ngân hàng hợp đồng của bạn dùng cách nào, rồi chọn đúng cách đó trong công cụ. Hai cách cho hai con số và không có cách nào là mặc định đúng.",
        ],
        emphasis: [
          "trả gốc đều tốn ít lãi hơn",
          "đòi hỏi tháng đầu nặng hơn gần 30%",
          "không có cách nào là mặc định đúng",
        ],
      },
    ],
    visual: {
      kind: "loanColumns",
      title: "Mỗi năm bao nhiêu lãi, bao nhiêu gốc, và dư nợ còn lại",
      loan: {
        amount: 2_000_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
        extraPerMonth: 2_000_000,
      },
      granularity: "year",
    },
    // CORRECTED: "gần như toàn lãi" overstates it. Year 1 is 167.515.560 ₫
    // interest against 64.762.016 ₫ principal — about 72%, which is "phần
    // lớn", not "gần như toàn bộ". The debt curve is named too, because the
    // figure plots it on its own axis.
    visualReading:
      "Mỗi cột là một năm, chia thành phần lãi và phần gốc trả trong năm đó. Cột đầu PHẦN LỚN là lãi — khoảng 72% của năm đầu — và tỷ trọng gốc lớn dần về sau vì lãi được tính trên dư nợ đang giảm, không phải vì khoản trả thay đổi. Đường dư nợ vẽ trên cùng hình, cùng với cột dư nợ trong bảng, là con số cần nhìn nếu bạn định bán nhà sớm: nó cho biết bạn CÒN NỢ bao nhiêu, chứ không phải đã trả bao nhiêu. Biểu đồ đã tính cả khoản trả thêm 2 triệu của ví dụ, nên nó dừng ở năm thứ 16 thay vì năm thứ 20.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Tính khoản vay mua nhà. Các bước dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Nhập “Số tiền vay”, “Lãi suất” và “Kỳ hạn” — ba ô đầu là đủ để có kết quả.",
        "Chọn “Cách trả nợ”: trả góp đều hay trả gốc đều, theo hợp đồng của bạn.",
        "Nhập “Trả thêm mỗi tháng” nếu bạn định trả thêm gốc; để 0 nếu không.",
        "Đọc ba dòng trong phần “Mỗi tháng bạn cần chuẩn bị”, rồi mở “Xem chi tiết khoản vay” để thấy tháng cuối và bảng từng năm.",
      ],
      toolSlug: "vay-mua-nha",
      change:
        "Đổi “Cách trả nợ” sang “Trả gốc đều” và xem tháng đầu tăng bao nhiêu, tổng lãi giảm bao nhiêu. Bạn chịu được tháng đầu đó không?",
      check:
        "Sau khi nhập số của bạn: dòng “Ngân hàng thu hằng tháng” và dòng “Tổng tiền ra khỏi ví mỗi tháng” có bằng nhau không? Nếu khác, bạn biết vì sao chúng khác chứ?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Phí trả nợ trước hạn. Công cụ chưa tính, và mức phí do hợp đồng của bạn quy định — có hợp đồng không thu.",
        "Lãi suất sau thời gian ưu đãi, nếu hợp đồng của bạn có ưu đãi. Xem bài C03.",
        "Cách hợp đồng của bạn tính lãi. Công cụ chia lãi năm cho 12; có hợp đồng tính theo số ngày thực tế chia 365, cho ra con số hơi khác.",
        "Bảo hiểm khoản vay, phí thẩm định và phí giải ngân, trừ khi bạn tự nhập vào phần chi phí kèm theo.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Dùng cho KHÁI NIỆM. Không có con số, tỷ lệ hay quy định nào trong bài lấy từ các nguồn này.",
      items: [SRC_CFPB_LOAN_ESTIMATE, SRC_TCB_DAILY],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "vay-20-nam-hay-25-nam",
    ],
  },

  // ------------------------------------------------------------------ C03
  {
    slug: "het-uu-dai-khoan-tra-tang-bao-nhieu",
    group: "RESILIENCE",
    planId: "C03",
    question: "Hết lãi suất ưu đãi, tiền trả hằng tháng có thể tăng bao nhiêu?",
    shortAnswer: [
      "Trong ví dụ của bài — 2 tỷ, 240 tháng, 12 tháng đầu ở 7,5%/năm rồi chuyển sang 11%/năm — khoản trả đi từ 16.111.864 ₫ lên 20.479.346 ₫ từ tháng thứ 13. Thêm 4.367.482 ₫ mỗi tháng.",
      "Con số này là KỊCH BẢN, không phải dự báo: mức lãi sau ưu đãi do bạn nhập. Việc đáng làm không phải đoán đúng, mà là thử vài mức và xem mức nào bạn vẫn trả được.",
    ],
    // The scenario status is the thing that must not be lost, so it is
    // emphasised together with the figure it qualifies.
    shortAnswerEmphasis: [
      "Thêm 4.367.482 ₫ mỗi tháng",
      "Con số này là KỊCH BẢN, không phải dự báo",
      "mức lãi sau ưu đãi do bạn nhập",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Kỳ hạn", value: "240 tháng" },
        { label: "Ưu đãi", value: "7,5%/năm trong 12 tháng đầu" },
        { label: "Sau ưu đãi (giả định)", value: "11%/năm" },
      ],
      note:
        "Cả hai mức lãi là giả định để minh họa, không phải báo giá của ngân hàng nào và không phải dự báo lãi suất. Trang này không biết lãi suất cơ sở sang năm ở đâu.",
    },
    sections: [
      {
        // REPAIRED. This heading used to read "“Lãi tăng 3,5%”", which is the
        // exact unit confusion the section below exists to correct — 3,5 is
        // POINTS, and the same rise is 46,67% in relative terms. A reader who
        // scans headings must not learn the wrong unit from the heading of the
        // paragraph that fixes it.
        heading: "“Lãi tăng 3,5 điểm phần trăm” và “khoản trả tăng 27%” là hai con số khác nhau",
        paragraphs: [
          "Lãi đi từ 7,5%/năm lên 11%/năm. Cách nói thứ nhất: tăng 3,5 ĐIỂM PHẦN TRĂM. Cách nói thứ hai: tăng 46,67% so với mức cũ, vì 3,5 chia 7,5 bằng 0,4667. Hai cách nói đúng như nhau nhưng là hai con số, và trộn chúng vào một câu là cách nhanh nhất để hiểu sai.",
          "Khoản trả hằng tháng tăng 27,11%, không phải 46,67%. Công thức niên kim tính lại cả khoản trả từ lãi suất, dư nợ — phần gốc còn nợ — và số tháng còn lại; phần gốc mỗi tháng cũng thay đổi. Vì vậy không thể nhân khoản trả cũ với mức tăng tương đối của lãi suất.",
          "Nếu chỉ đổi lãi mà giữ nguyên 2 tỷ trong 240 tháng, khoản trả sẽ là 20.643.768 ₫ — tăng 28,13%. Con số thực tế 27,11% thấp hơn một chút, vì đến lúc tính lại thì dư nợ đã giảm còn 1.955.136.259 ₫, và phần giảm đó bù được nhiều hơn tác động của việc chỉ còn 228 tháng thay vì 240.",
        ],
        emphasis: [
          "tăng 3,5 ĐIỂM PHẦN TRĂM",
          "tăng 46,67% so với mức cũ",
          "Khoản trả hằng tháng tăng 27,11%, không phải 46,67%",
        ],
      },
      {
        heading: "Năm ưu đãi trả được rất ít gốc — và không phải vì lãi thấp",
        paragraphs: [
          "Sau 12 tháng, dư nợ vẫn còn 1.955.136.259 ₫. Cả năm chỉ trả được 44.863.741 ₫ gốc, tức 2,24% khoản vay.",
          "Rất dễ kết luận “vì lãi ưu đãi thấp nên chưa trả được gốc”. Điều đó ngược. Ở cùng số tiền và cùng kỳ hạn, lãi thấp hơn trả được NHIỀU gốc hơn: tháng đầu ở 7,5% trả 3.611.864 ₫ gốc, còn nếu là 11% thì chỉ 2.310.435 ₫.",
          "Nói cho gọn: Lãi cao hơn trả được ÍT gốc hơn, không phải nhiều hơn. Lãi suất không quyết định tốc độ trả gốc theo chiều người ta hay nghĩ.",
          "Cả kỳ hạn và lãi suất quyết định tốc độ trả gốc. Trong ví dụ 7,5% và 240 tháng này, dư nợ sau năm đầu còn cao nên số tiền được tính lại ở 11% vẫn lớn. Không thể nói mọi khoản vay 20 năm đều như vậy: nếu lãi 0%, mỗi tháng trả 1/240 tiền gốc và năm đầu trả được 5%.",
        ],
        emphasis: [
          "Điều đó ngược",
          "lãi thấp hơn trả được NHIỀU gốc hơn",
          "Lãi cao hơn trả được ÍT gốc hơn, không phải nhiều hơn",
        ],
      },
      {
        heading: "Trước khi ký: hỏi công thức tính lãi, rồi thử ba mức sau ưu đãi",
        paragraphs: [
          "Đừng hỏi “khoản trả trong năm ưu đãi là bao nhiêu”. Hãy hỏi “sau ưu đãi thì tính theo công thức nào, và nếu lãi cơ sở lên mức X thì khoản trả là bao nhiêu”. Hợp đồng thường ghi lãi sau ưu đãi bằng lãi cơ sở cộng một biên độ; biên độ là con số cố định, lãi cơ sở thì không.",
          "Trong công cụ, hãy nhập ô “Ngân sách bạn chịu được mỗi tháng” bằng con số thật của bạn. Biểu đồ sẽ kẻ một đường ngang ở mức đó, và bạn thấy ngay kịch bản nào vượt qua. Công cụ không tự đoán con số này — để trống thì không có đường nào.",
          "Rồi thử ba mức lãi sau ưu đãi: mức ngân hàng nói, mức cao hơn 2 điểm phần trăm, và mức cao hơn 4 điểm. Nếu mức thứ ba vẫn nằm dưới ngân sách, bạn còn dư trong BA kịch bản đã thử, chưa phải chứng nhận an toàn. Mất thu nhập, chi phí bất ngờ hoặc mức lãi cao hơn vẫn có thể làm kết quả thay đổi. Nếu mức thứ nhất đã vượt, hãy đổi tầm giá chứ đừng đổi kỳ vọng.",
        ],
        emphasis: [
          "Đừng hỏi “khoản trả trong năm ưu đãi là bao nhiêu”",
          "biên độ là con số cố định, lãi cơ sở thì không",
          "bạn còn dư trong BA kịch bản đã thử, chưa phải chứng nhận an toàn",
        ],
      },
    ],
    visual: {
      kind: "floatingTimeline",
      title: "Khoản trả trước và sau khi hết ưu đãi",
      amount: 2_000_000_000,
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      monthlyBudget: 20_000_000,
    },
    visualReading:
      "Chỉ có một đường: khoản trả mỗi tháng. Nó đi ngang ở 16,1 triệu suốt 12 tháng ưu đãi rồi GẤP KHÚC lên 20,5 triệu ở tháng 13 — đổi trong đúng một tháng, không dốc dần, nên đừng đọc nó như một mức tăng từ từ. Đường ngang thứ hai là ngân sách 20 triệu của ví dụ, và điều đáng chú ý là chỗ khoản trả vượt lên trên nó. Mức 11%/năm sau ưu đãi là kịch bản bài này tự đặt, không phải báo giá và không phải dự báo.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khoản vay lãi thả nổi. Các bước dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Nhập “Số tiền vay” và “Kỳ hạn”.",
        "Trong nhóm ưu đãi, nhập “Số tháng ưu đãi” và “Lãi suất ưu đãi” theo báo giá bạn có.",
        "Nhập “Lãi suất sau ưu đãi” — hỏi ngân hàng công thức, đừng đoán.",
        "Nhập “Ngân sách bạn chịu được mỗi tháng” để biểu đồ kẻ đường ngang ở mức đó.",
      ],
      toolSlug: "lai-suat-tha-noi",
      change:
        "Tăng “Lãi suất sau ưu đãi” thêm 2 điểm phần trăm rồi thêm 4 điểm. Xem mốc nào khoản trả vượt đường ngân sách của bạn.",
      check:
        "Trong kịch bản của bạn, khoản trả tăng bao nhiêu ĐIỂM PHẦN TRĂM lãi và bao nhiêu PHẦN TRĂM khoản trả? Hai con số đó có khác nhau không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất sau ưu đãi thật của bạn. Đó là kịch bản bạn nhập, không phải dự báo của FinHome.",
        "Cách hợp đồng của bạn tính lại khoản trả. Công cụ tính lại trên dư nợ còn lại trong số tháng còn lại; hợp đồng có thể quy định khác, ví dụ trả gốc đều hoặc tính lãi theo số ngày thực tế.",
        "Có trần lãi suất hay không, và chu kỳ xem lại là bao lâu. Đây là điều khoản hợp đồng, hãy đọc.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một mức lãi hay một dự báo.",
      items: [SRC_TCB_DAILY, SRC_CFPB_LOAN_ESTIMATE],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "lai-co-dinh-hay-tha-noi",
      "hai-goi-vay-thang-thap-co-re-hon",
    ],
  },

  // ------------------------------------------------------------------ C04
  {
    slug: "du-tien-tra-truoc-sau-3-nam",
    group: "SAVING",
    planId: "C04",
    question: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
    shortAnswer: [
      "Với 100 triệu đang có, mục tiêu 500 triệu sau 36 tháng và lãi giả định 6%/năm, mức góp cần thiết là 9.668.775 ₫ mỗi tháng.",
      "Ở lãi 0% thì cần 11.111.111 ₫. Khoảng cách giữa hai con số là phần lãi làm hộ bạn — và nó là giả định, không phải cam kết. Phần bạn kiểm soát được là mức góp.",
    ],
    // The controllable lever against the uncertain one, with the 0% reading
    // that shows how much of the plan rests on an assumption.
    shortAnswerEmphasis: [
      "nó là giả định, không phải cam kết",
      "Phần bạn kiểm soát được là mức góp",
    ],
    household: {
      title: "Mục tiêu giả lập trong bài",
      items: [
        { label: "Đang có", value: "100.000.000 ₫" },
        { label: "Mục tiêu", value: "500.000.000 ₫" },
        { label: "Thời hạn", value: "36 tháng" },
        { label: "Lãi suất giả định", value: "6%/năm danh nghĩa; mỗi tháng 0,5%" },
        { label: "Thời điểm góp", value: "Cuối mỗi tháng" },
      ],
      note:
        "Mục tiêu 500 triệu là giả định minh họa. Bài dùng lãi năm danh nghĩa 6% chia 12, góp cuối tháng, không phải lợi suất hiệu dụng năm 6%. Không có sản phẩm nào được bảo đảm mức này; đổi quy ước lãi hoặc thời điểm góp thì kết quả khác.",
    },
    sections: [
      {
        heading: "Ba biến, biết hai thì ra biến thứ ba",
        paragraphs: [
          "Mục tiêu, thời hạn và mức góp luôn đi cùng nhau. Cố định hai cái thì cái thứ ba không còn là lựa chọn nữa — nó là kết quả.",
          "Nếu bạn cố định mục tiêu 500 triệu và thời hạn 36 tháng, mức góp 9.668.775 ₫/tháng là con số bắt buộc, không phải mục tiêu phấn đấu. Nếu con số đó không khả thi với thu nhập của bạn, thì phải đổi một trong hai cái còn lại: kéo dài thời hạn, hoặc hạ mục tiêu — tức là nhắm căn nhà rẻ hơn, hoặc vay nhiều hơn.",
          "Đây là lý do công cụ có ba chế độ. Đừng chỉ chạy một chế độ: chạy “Mỗi tháng cần góp bao nhiêu” để thấy con số bắt buộc, rồi chạy “Mất bao lâu để đạt mục tiêu” với mức góp bạn thực sự làm được. Hai câu trả lời đó nói cho bạn khoảng cách giữa kế hoạch và thực tế.",
        ],
        emphasis: [
          "Cố định hai cái thì cái thứ ba không còn là lựa chọn nữa",
          "là con số bắt buộc, không phải mục tiêu phấn đấu",
          "Đừng chỉ chạy một chế độ",
        ],
      },
      {
        heading: "Lãi giúp được ít hơn bạn tưởng trong 3 năm",
        paragraphs: [
          "Trong ví dụ này, tổng tiền bạn tự bỏ vào là 448.075.899 ₫ và phần do lãi là 51.924.101 ₫ — khoảng 10,4% số tiền cuối kỳ. Trong biểu đồ, đó là khoảng cách giữa hai đường.",
          "Ba năm là quãng ngắn, nên lãi kép chưa có thời gian làm nhiều. Với mục tiêu ngắn hạn, phần quyết định gần như toàn bộ là mức góp — không phải việc chọn được sản phẩm lãi cao hơn 1%.",
          "Điều đó cũng có nghĩa: với tiền sắp dùng để mua nhà, đừng đánh đổi thanh khoản để lấy thêm chút lãi. Nếu đến lúc cần mà tiền đang bị khóa, hoặc đang lỗ vì thị trường, thì cái mất lớn hơn cái được rất nhiều.",
        ],
        emphasis: [
          "khoảng 10,4% số tiền cuối kỳ",
          "Ba năm là quãng ngắn, nên lãi kép chưa có thời gian làm nhiều",
          "đừng đánh đổi thanh khoản để lấy thêm chút lãi",
        ],
      },
      {
        heading: "Mục tiêu có thể chạy, và bạn nên tính đến điều đó",
        paragraphs: [
          "Biểu đồ giữ mục tiêu cố định ở 500 triệu suốt 36 tháng. Thực tế giá nhà có thể đổi trong ba năm, và nếu giá lên thì mức trả trước cần có cũng lên theo.",
          "Công cụ không dự báo giá nhà và bài này cũng không. Cách làm thực dụng: nhập mục tiêu theo mức giá bạn dự kiến vào THỜI ĐIỂM MUA, không phải giá hôm nay; rồi xem lại con số đó mỗi sáu tháng và cập nhật.",
          "Nếu bạn không biết dự kiến bao nhiêu, hãy chạy hai lần với hai mục tiêu khác nhau và xem mức góp chênh bao nhiêu. Biết độ nhạy còn hữu ích hơn là đoán một con số.",
        ],
        emphasis: [
          "Biểu đồ giữ mục tiêu cố định ở 500 triệu suốt 36 tháng",
          "Công cụ không dự báo giá nhà và bài này cũng không",
          "Biết độ nhạy còn hữu ích hơn là đoán một con số",
        ],
      },
    ],
    visual: {
      kind: "savingsCurve",
      title: "Tích lũy tới mục tiêu trong 36 tháng",
      goal: {
        mode: "contribution",
        initial: 100_000_000,
        target: 500_000_000,
        months: 36,
        annualRatePercent: 6,
      },
    },
    // CORRECTED. An earlier draft told the reader to set the rate to 0 and
    // watch the balance line fall. This visual solves for the CONTRIBUTION
    // against a fixed 500 triệu target, so at 0% the endpoint does not move —
    // the required contribution rises to 11.111.111 ₫ and the gap between
    // the two lines disappears. The exercise already said that correctly;
    // this sentence now agrees with it.
    // CORRECTED TWICE. The first draft told the reader to set the rate to 0
    // and watch the balance line fall; this visual solves for the
    // CONTRIBUTION against a fixed target, so the endpoint does not move. The
    // second draft over-corrected and said BOTH lines end at the target — at
    // 6% only the balance does. The dashed contribution line ends at
    // 448.075.899 ₫, and the two coincide only at a 0% rate.
    visualReading:
      "Hai đường: đường liền là số dư, đường gạch là phần tiền bạn tự góp. Chỉ ĐƯỜNG LIỀN kết thúc ở mục tiêu 500 triệu; đường gạch dừng ở 448.075.899 ₫, và khoảng cách 51,9 triệu giữa hai đầu mút chính là phần do lãi — khoảng một phần mười số tiền cuối kỳ. Biểu đồ này GIẢI RA MỨC GÓP cần thiết chứ không dự báo số dư, nên đặt lãi về 0 không hạ cái đích xuống: mức góp cần thiết tăng lên 11.111.111 ₫, đường gạch dâng lên trùng với đường liền, và cả hai cùng kết thúc ở 500 triệu. Đường gạch là phần bạn kiểm soát được; khoảng cách phía trên nó phụ thuộc mức lãi giả định 6%/năm.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mục tiêu tiết kiệm. Các bước dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Ở “Bạn cần tính gì?”, chọn “Mỗi tháng cần góp bao nhiêu”.",
        "Ở “Mục tiêu đến từ đâu?”, giữ “Tôi tự nhập số tiền mục tiêu” để làm đúng ví dụ trong bài; nếu bạn đã nhắm một căn cụ thể, chọn “Tính từ giá nhà” và nhập giá nhà, tỷ lệ trả trước, chi phí mua và quỹ dự phòng.",
        "Nhập “Số tiền đã có”, “Mục tiêu” và “Số tháng” theo kế hoạch của bạn.",
        "Nhập “Lãi suất” — dùng mức bạn thực sự nhận được, và thử cả 0 để thấy kế hoạch còn đứng được không.",
        "Ở nhóm “Mốc thời gian và thử góp thêm”, nhập ngày bắt đầu để đọc dòng “Ngày đủ mục tiêu (dự kiến)”, rồi đổi sang chế độ “Mất bao lâu để đạt mục tiêu” và nhập mức góp bạn thực sự làm được.",
      ],
      toolSlug: "muc-tieu-tiet-kiem",
      change:
        "Đặt “Lãi suất” về 0 và xem mức góp cần thiết tăng bao nhiêu. Đó là phần kế hoạch của bạn đang phụ thuộc vào một giả định.",
      check:
        "Mức góp công cụ trả ra có nằm trong khoản tiền còn lại sau chi phí sinh hoạt của bạn không? Nếu không, bạn sẽ đổi thời hạn hay đổi mục tiêu?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất bạn sẽ thực sự nhận được. Đó là ô nhập, và không có mức nào được bảo đảm.",
        "Giá nhà và mức trả trước cần có vào thời điểm bạn mua.",
        "Thuế và phí của sản phẩm gửi tiền bạn chọn.",
        "Việc thu nhập của bạn có giữ được mức góp đó trong suốt thời hạn hay không.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một mức lãi hay một sản phẩm.",
      items: [
        {
          label: "SEC Investor.gov — Savings Goal Calculator",
          url: "https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator",
          note:
            "Khái niệm dùng ở đây: mục tiêu, số tiền đang có, thời hạn, lãi suất và kỳ ghép lãi đều là ĐẦU VÀO của việc lập kế hoạch góp tiền, chứ không phải kết quả được bảo đảm. Đây là công cụ giáo dục của cơ quan quản lý chứng khoán Hoa Kỳ.",
        },
        SRC_CFPB_DOWN_PAYMENT,
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "gop-them-2-trieu-dat-muc-tieu-som-bao-lau",
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
    ],
  },

  // ------------------------------------------------------------------ C05
  {
    slug: "hai-goi-vay-thang-thap-co-re-hon",
    group: "CHOICE",
    planId: "C05",
    question: "Hai gói vay: trả ít mỗi tháng có thật sự rẻ hơn?",
    shortAnswer: [
      "Không nhất thiết. Trong ví dụ của bài, gói có khoản trả hằng tháng thấp nhất lại là gói tốn nhiều lãi nhất, vì nó kéo dài kỳ hạn thêm 5 năm.",
      "Muốn so được, hai gói phải cùng số tiền vay và bạn phải so trên chi phí vay — lãi cộng phí — chứ không phải trên khoản trả hằng tháng.",
    ],
    // "Smaller instalment" is not "cheaper loan". The three conditions that
    // make a comparison mean anything are emphasised with it.
    shortAnswerEmphasis: [
      "gói có khoản trả hằng tháng thấp nhất lại là gói tốn nhiều lãi nhất",
    ],
    household: {
      title: "Hai báo giá giả lập trong bài",
      items: [
        { label: "Số tiền vay (dùng chung)", value: "2.000.000.000 ₫" },
        { label: "Phương án A", value: "8,5%/năm, 20 năm, phí thu xếp 0%" },
        { label: "Phương án B", value: "8,5%/năm, 25 năm, phí thu xếp 1%" },
        { label: "Cách trả ở cả hai", value: "Trả góp đều, lãi giữ nguyên" },
        { label: "Phí 1% của phương án B", value: "20.000.000 ₫, trả khi giải ngân" },
      ],
      note:
        "Hai báo giá giả lập, chọn sao cho chỉ khác nhau ở kỳ hạn và phí — để thấy rõ hai yếu tố đó làm gì. Không phải báo giá của ngân hàng nào.",
    },
    sections: [
      {
        heading: "Cùng một số tiền vay, hoặc không so được gì",
        paragraphs: [
          "Điều kiện đầu tiên và dễ bị bỏ qua nhất: hai gói phải được tính trên cùng số tiền vay. Nếu một bên báo giá cho 2 tỷ và bên kia cho 1,8 tỷ, mọi con số sau đó đều không so được — bạn đang so hai khoản nợ khác nhau.",
          "Công cụ So sánh khoản vay vì vậy chỉ có một ô số tiền vay dùng chung cho mọi phương án. Nếu ngân hàng cho bạn vay ít hơn mức bạn cần, đó là một thông tin riêng và quan trọng, nhưng nó không thuộc phép so sánh này.",
          "Điều kiện thứ hai: nói rõ khoảng thời gian đánh giá. Biểu đồ của bài cộng lãi và phí DANH NGHĨA đến cuối kỳ hạn riêng của từng gói, tức 20 năm so với 25 năm. Nó chưa so chi phí đến cùng một ngày thoát khoản vay và chưa chiết khấu; muốn bán nhà sau 5 năm, cần so lãi, phí đã trả và dư nợ — phần gốc còn nợ — tại đúng mốc đó.",
        ],
        emphasis: [
          "hai gói phải được tính trên cùng số tiền vay",
          "nói rõ khoảng thời gian đánh giá",
        ],
      },
      {
        heading: "Hai biểu đồ, hai câu trả lời trái ngược",
        paragraphs: [
          "Biểu đồ cột trong bài xếp hạng theo chi phí vay: lãi cộng phí thu một lần. Theo thước đo này, phương án A rẻ hơn.",
          "Nếu đổi sang xem khoản trả hằng tháng, phương án B nhẹ hơn — vì trả trong 300 tháng thay vì 240. Cùng một cặp báo giá, hai thước đo, hai người thắng khác nhau.",
          "Không có thước đo nào sai. Nhưng chúng trả lời hai câu hỏi khác nhau: “gói nào tốn ít tiền hơn” và “gói nào tôi thu xếp được mỗi tháng”. Trong ví dụ cùng số tiền, cùng lãi dương và cùng cách trả này, kéo dài kỳ hạn làm khoản trả nhỏ hơn nhưng tổng lãi cao hơn. Nếu lãi suất hoặc phí khác nhau, không thể dùng kỳ hạn để kết luận gói nào rẻ hơn.",
          "Cách dùng thực dụng: lấy chi phí vay để biết cái giá, lấy khoản trả hằng tháng để biết mình có sống được với nó không. Nếu gói rẻ hơn có khoản trả bạn không gánh được thì nó không phải lựa chọn, dù nó rẻ.",
        ],
        emphasis: [
          "hai thước đo, hai người thắng khác nhau",
          "Không có thước đo nào sai",
          "kéo dài kỳ hạn làm khoản trả nhỏ hơn nhưng tổng lãi cao hơn",
        ],
      },
      {
        heading: "Phí thu một lần là tiền thật, và nó không nằm trong lãi suất",
        paragraphs: [
          "Phương án B thu phí 1% số tiền vay, tức 20.000.000 ₫ trả ngay khi giải ngân. Con số đó không xuất hiện trong lãi suất niêm yết và không xuất hiện trong khoản trả hằng tháng.",
          "Đây là lý do một gói lãi suất thấp hơn vẫn có thể đắt hơn: phần chênh nằm ở phí. Công cụ cộng phí vào chi phí vay nên nó không trốn được.",
          // CORRECTED. This used to say the tool could not model a promotional
          // rate, a one-off fee or an early-settlement fee. It now models all
          // three — the promo pair per offer, the origination fee, and the
          // settlement fee at the horizon you choose.
          "Công cụ nhận cả lãi ưu đãi và lãi sau ưu đãi của từng phương án, phí trả khi giải ngân, và phí trả nợ trước hạn tính tại mốc bạn chọn. Những khoản còn lại — bảo hiểm khoản vay, và bất kỳ phí nào bạn chưa nhập — thì không có trong kết quả: khi so báo giá thật, hãy hỏi từng khoản, ghi ra, rồi nhập vào đúng ô của nó.",
        ],
        emphasis: [
          "Con số đó không xuất hiện trong lãi suất niêm yết",
          "một gói lãi suất thấp hơn vẫn có thể đắt hơn",
        ],
      },
      {
        heading: "Mốc so sánh quyết định gói nào rẻ hơn",
        paragraphs: [
          "Biểu đồ của bài đặt mốc so sánh ở tháng thứ 300 — tức cả hai gói đã tất toán xong, đã trả hết phần còn nợ và đóng khoản vay — nên nó cộng lãi và phí DANH NGHĨA của trọn kỳ hạn mỗi gói. Đó là câu trả lời cho “giữ đến hết thì gói nào tốn ít hơn”.",
          "Phần lớn người mua không giữ khoản vay đến hết. Nếu bạn đặt mốc ở tháng thứ 60, công cụ cộng lãi và phí đã trả đến tháng đó rồi cộng thêm phần dư nợ còn lại — và thứ tự có thể đổi, vì một gói kỳ hạn dài trả được ít gốc hơn nên còn nợ nhiều hơn tại cùng thời điểm.",
          "Hãy chạy cả hai mốc: mốc bạn thật sự dự kiến giữ, và cả kỳ hạn. Nếu hai mốc cho hai người thắng khác nhau, công cụ sẽ nói ra — và lựa chọn của bạn nên theo mốc gần với kế hoạch thật của bạn.",
        ],
        emphasis: [
          "Phần lớn người mua không giữ khoản vay đến hết",
          "thứ tự có thể đổi",
        ],
      },
    ],
    visual: {
      kind: "compareCost",
      title: "Chi phí hai phương án tại tháng thứ 300",
      amount: 2_000_000_000,
      options: [
        { annualRatePercent: 8.5, termMonths: 240, feePercent: 0 },
        { annualRatePercent: 8.5, termMonths: 300, feePercent: 1 },
      ],
      optionLabels: ["Phương án A", "Phương án B", "Phương án C"],
      // Stated explicitly so the exercise below reproduces these exact
      // figures: both offers have matured by month 300, which is what makes
      // this the whole-term comparison the prose describes.
      horizonMonths: 300,
    },
    visualReading:
      "Hai cột, mỗi cột một phương án tại tháng thứ 300, xếp từ gốc đã trả, lãi đã trả, phí trả một lần, rồi phần dư nợ còn lại. Cột được dựng như vậy để một gói chỉ trả chậm gốc không trông rẻ hơn; ở mốc này cả hai gói đã tất toán nên phần dư nợ bằng 0. Phương án A thấp hơn 685,8 triệu — nhưng đó là xếp hạng theo LÃI CỘNG PHÍ, không phải theo khoản trả hằng tháng, thước đo mà phương án B lại nhẹ hơn.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ So sánh khoản vay. Các bước dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Nhập “Số tiền vay” một lần — ô này dùng chung cho mọi phương án.",
        "Đặt “So sánh tại tháng thứ” bằng 300 để ra đúng con số của bài: ở mốc đó cả hai gói đã tất toán, nên đây là so sánh trọn kỳ hạn.",
        "Với “Phương án A”, nhập “Lãi suất” và “Kỳ hạn” theo báo giá thứ nhất.",
        "Mở “Phí và lãi ưu đãi của báo giá này” để nhập “Phí thu xếp”, “Phí khác trả khi giải ngân”, và — nếu báo giá có ưu đãi — cả “Số tháng ưu đãi” với “Lãi ưu đãi”. Ô “Lãi suất” ở trên là mức SAU ưu đãi.",
        "Làm tương tự cho “Phương án B”. Nếu bạn có báo giá thứ ba, mở “Thêm phương án thứ ba”.",
        "Đọc hai biểu đồ: cột chi phí tại mốc đã chọn, rồi đường khoản trả hằng tháng. Mở “Xem bảng so sánh từng chỉ tiêu” khi cần số chính xác.",
      ],
      toolSlug: "so-sanh-khoan-vay",
      change:
        "Đổi “So sánh tại tháng thứ” từ 300 xuống 60 — mốc gần với thời gian nhiều người thật sự giữ khoản vay. Chi phí của cả hai gói giảm đi, nhưng phần dư nợ còn lại xuất hiện, và thứ tự có thể đảo. Nếu nó đảo, công cụ sẽ nói rõ mốc nào cho gói nào rẻ hơn.",
      check:
        "Trong hai báo giá của bạn, gói có khoản trả hằng tháng thấp hơn có phải gói có chi phí thấp hơn tại mốc bạn chọn không? Nếu không, bạn chọn theo thước đo nào?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất sau ưu đãi sẽ thật sự là bao nhiêu. Công cụ nhận cả hai giai đoạn, nhưng mức sau ưu đãi là kịch bản bạn nhập — hợp đồng thường gắn nó với lãi cơ sở, và lãi cơ sở thì thay đổi.",
        "Bảo hiểm khoản vay, và bất kỳ khoản phí nào bạn không nhập vào ô của nó.",
        "Ngân hàng nào duyệt cho bạn, và duyệt bao nhiêu.",
        "Chất lượng dịch vụ, thời gian giải ngân và các điều khoản phi lãi suất — những thứ này không phải con số nhưng có thể quan trọng hơn vài triệu đồng.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho số liệu thị trường.",
      items: [SRC_CFPB_COMPARE],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: ["vay-20-nam-hay-25-nam", "lai-co-dinh-hay-tha-noi"],
  },

  // ------------------------------------------------------------------ C06
  {
    slug: "duoc-vay-khong-co-nghia-nen-vay-het",
    group: "BUDGET",
    planId: "C06",
    question: "Được vay tới mức đó có nghĩa là nên vay hết không?",
    shortAnswer: [
      "Không. Hai phép tính khác nhau cho hai con số khác nhau: áp tỷ lệ lên thu nhập gộp cho ra một trần, còn lấy thu nhập thực nhận trừ chi phí sinh hoạt cho ra ngân sách thật. Trong ví dụ của bài, trần là 20 triệu/tháng nhưng hộ chỉ còn 18 triệu.",
      "Trong ví dụ giữ nguyên các giả định khác, khoảng cách đó tương ứng khoảng 230 triệu tầm giá. Đây là chênh lệch giữa hai phép tính minh họa, không phải số ngân hàng đã duyệt hoặc bằng chứng rằng hộ sẽ sống thoải mái với khoản nợ.",
    ],
    // A ratio ceiling is not a spendable budget. The emphasis keeps the two
    // phrases that say where each number comes from, plus the limit on what
    // the gap proves.
    shortAnswerEmphasis: [
      "áp tỷ lệ lên thu nhập gộp cho ra một trần, còn lấy thu nhập thực nhận trừ chi phí sinh hoạt cho ra ngân sách thật",
    ],
    household: {
      title: "Hộ giả lập trong bài",
      items: [
        { label: "Thu nhập gộp cả hộ", value: "50.000.000 ₫/tháng" },
        { label: "Thu nhập thực nhận", value: "44.000.000 ₫/tháng" },
        { label: "Chi phí sinh hoạt thiết yếu", value: "18.000.000 ₫/tháng" },
        { label: "Nợ đang trả", value: "5.000.000 ₫/tháng" },
        { label: "Muốn tiếp tục để dành", value: "3.000.000 ₫/tháng" },
        { label: "Tỷ lệ giả định", value: "40% trả nợ nhà, 50% tổng nợ" },
      ],
      note:
        "Hai tỷ lệ 40% và 50% là GIẢ ĐỊNH của bài để minh họa phép tính. Đây không phải quy định, không phải mức ngân hàng công bố, và bài này không đưa ra một tỷ lệ an toàn chung — tỷ lệ ngân hàng dùng, nếu có, vẫn không thay thế phép tính dòng tiền và dự phòng của riêng hộ.",
    },
    sections: [
      {
        heading: "Trần và ngân sách được tính từ hai thứ khác nhau",
        paragraphs: [
          "Trần tính trên thu nhập GỘP: 40% của 50 triệu là 20 triệu, và giới hạn tổng nợ 50% trừ 5 triệu nợ hiện có cũng ra 20 triệu. Phép tính này không biết gia đình bạn tiêu bao nhiêu.",
          "Ngân sách tính trên thu nhập THỰC NHẬN: 44 triệu trừ 18 triệu sinh hoạt, trừ 5 triệu nợ đang trả, trừ 3 triệu muốn để dành, còn 18 triệu. Mỗi khoản được trừ đúng một lần, nên bốn khoản đó cộng với khoản trả nhà luôn đúng bằng thu nhập thực nhận — bạn thấy điều này trong biểu đồ.",
          "Mười tám nhỏ hơn hai mươi, nên trong ví dụ này chính hộ là giới hạn đang chặn. Đó chỉ là kết quả của hộ giả lập với các tỷ lệ đã nhập. Không suy ra ngân hàng sẵn sàng cho vay mức đó hay đây là tình trạng phổ biến của người mua nhà.",
        ],
        emphasis: [
          "Phép tính này không biết gia đình bạn tiêu bao nhiêu",
          "Mỗi khoản được trừ đúng một lần",
          "chính hộ là giới hạn đang chặn",
        ],
      },
      {
        heading: "Nếu bỏ trống chi phí sinh hoạt thì kết quả không còn là ngân sách",
        paragraphs: [
          "Công cụ cho phép để trống ô chi phí sinh hoạt, nhưng khi đó nó nói rõ: kết quả là GIỚI HẠN TRÊN, không phải ngân sách. Lý do là số học — không nhập chi phí thì phép tính chạy như thể chi phí bằng 0, và với hầu hết mọi hộ điều đó không đúng.",
          "Trong ví dụ này, nếu bỏ trống chi phí sinh hoạt và phần để dành, ngân sách còn lại vượt trần, nên kết quả trở về đúng bằng con số của trần. Trong trạng thái thiếu chi phí, công cụ đánh dấu kết luận bị giới hạn: con số chưa phải ngân sách hộ hoàn chỉnh. Chỉ nhập 0 khi bạn xác nhận khoản chi thực sự bằng 0; chưa biết và bằng 0 là hai trạng thái khác nhau.",
          "Ước lượng một con số vẫn tốt hơn để trống. Nhìn lại ba tháng chi tiêu gần nhất, lấy phần không cắt được, rồi nhập vào. Sai vài triệu vẫn hữu ích hơn là giả định bằng 0.",
        ],
        emphasis: [
          "kết quả là GIỚI HẠN TRÊN, không phải ngân sách",
          "chưa biết và bằng 0 là hai trạng thái khác nhau",
          "Ước lượng một con số vẫn tốt hơn để trống",
        ],
      },
      {
        heading: "Phần “muốn để dành” không phải là xa xỉ",
        paragraphs: [
          "Dễ bị coi là khoản có thể bỏ để nhắm nhà đắt hơn. Nhưng sau khi mua nhà, vẫn còn sửa chữa, vẫn còn việc bất ngờ, và quỹ dự phòng thì vừa bị dùng một phần cho tiền trả trước.",
          "Nếu bạn đặt phần để dành về 0 để tầm giá lên, hãy biết rằng bạn đang đánh đổi đúng cái đó: khả năng chịu một cú sốc trong vài năm đầu — giai đoạn dư nợ, tức phần gốc còn nợ, còn cao nhất và ít gốc nhất đã được trả.",
          "Cách dùng thực dụng: chạy hai lần, một lần với phần để dành bạn mong muốn và một lần với 0. Chênh lệch tầm giá là cái giá của biên an toàn, và bạn quyết định có muốn trả cái giá đó hay không.",
        ],
        emphasis: [
          "quỹ dự phòng thì vừa bị dùng một phần cho tiền trả trước",
          "bạn đang đánh đổi đúng cái đó",
          "Chênh lệch tầm giá là cái giá của biên an toàn",
        ],
      },
    ],
    visual: {
      kind: "affordabilityMonthly",
      title: "Mỗi tháng tiền đi đâu, và trần của tỷ lệ nằm ở đâu",
      input: {
        mode: "household",
        monthlyIncome: 50_000_000,
        monthlyNetIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
        downPayment: 600_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
    },
    visualReading:
      "Hai thanh cạnh nhau, và chúng được tính từ hai thứ khác nhau. Thanh “Thu nhập thực nhận” chia hết 44 triệu thành sinh hoạt, nợ đang trả, phần để dành và khoản trả nhà, nên tổng luôn khớp thu nhập và không khoản nào bị trừ hai lần. Thanh “Trần theo giả định của bạn” suy ra từ hai tỷ lệ áp lên thu nhập GỘP, và nó không biết hộ tiêu bao nhiêu. Ở ví dụ này ngân sách hộ 18 triệu thấp hơn trần 20 triệu, nên chính hộ là giới hạn đang chặn — và không thanh nào là mức ngân hàng đã đồng ý.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khả năng mua nhà và chạy nó HAI lần, một lần cho mỗi câu hỏi.",
      steps: [
        "Lần một: chọn “Theo tỷ lệ tôi giả định thì tối đa bao nhiêu?” và nhập thu nhập gộp cùng nợ đang trả. Ghi lại tầm giá.",
        "Lần hai: chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?” và nhập thêm thu nhập thực nhận, chi phí sinh hoạt thiết yếu, phần muốn để dành. Ghi lại tầm giá.",
        "So hai con số. Mở “Xem con số này đến từ đâu” để thấy dòng “Giới hạn đang chặn”.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Hạ “Trả nợ nhà tối đa” từ 40% xuống mức bạn thực sự thoải mái. Trần đi theo, vì nó là giả định của bạn chứ không phải một hằng số.",
      check:
        "Hai lần chạy cho bạn hai tầm giá. Cái nào lớn hơn, và bạn sẽ đi xem nhà theo cái nào?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Một tỷ lệ an toàn chung. Không có con số nào đúng cho mọi hộ, và bài này không đề xuất con số nào.",
        "Ngân hàng của bạn dùng tỷ lệ nào. Hãy hỏi và nhập đúng con số đó.",
        "Chi phí sinh hoạt thật của gia đình bạn — chỉ bạn biết, và ước lượng vẫn tốt hơn để trống.",
        "Thu nhập của bạn có ổn định trong 20 năm hay không.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một ngưỡng hay tỷ lệ.",
      items: [SRC_TCB_TRA_GOP, SRC_CFPB_DOWN_PAYMENT],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "tiep-tuc-thue-hay-mua-nha",
    ],
  },
];
