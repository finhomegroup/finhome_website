// "Mua nhà bằng con số", articles C07–C12.
//
// AI-assisted draft; selected numerical fixtures and prose claims are checked
// separately. A generated visual alone does not validate the narrative.
// No current bank rate, fee schedule or regulation is claimed.
//
// C08, C09, C11 and C12 deliberately keep their computed figures in the TABLE
// rather than in the paragraphs. Their engines take many inputs, and a
// sentence that quotes one output of a ten-input model ages badly; the table
// is generated from the declared hypothetical and cannot disagree with itself.

import type { EducationArticle } from "@/content/education/types";

const SRC_CFPB_COMPARE = {
  label: "CFPB — Compare and negotiate your loan offers",
  url: "https://www.consumerfinance.gov/owning-a-home/compare/compare-loan-estimates/",
  note:
    "Khái niệm dùng ở đây: so các báo giá trên cùng số tiền vay và cùng một khoảng thời gian đã nêu rõ; khoản trả hằng tháng thấp hơn không phải toàn bộ quyết định. Số liệu thống kê trong trang đó là của Hoa Kỳ và không được dùng ở đây.",
};

const SRC_CFPB_DOWN_PAYMENT = {
  label: "CFPB — How to decide how much to spend on your down payment",
  url: "https://www.consumerfinance.gov/archive/blog/how-decide-how-much-spend-your-down-payment/",
  note:
    "Khái niệm dùng ở đây: tiền đã đưa vào nhà thì không còn dùng được cho việc khẩn cấp. Tài liệu giáo dục đã lưu trữ của cơ quan bảo vệ người tiêu dùng Hoa Kỳ, không phải quy định tại Việt Nam.",
};

const SRC_BIDV_FEE = {
  label: "BIDV — Chương trình cho vay mua nhà (tài liệu năm 2024)",
  url: "https://bidv.com.vn/wps/wcm/connect/BIDV/ca-nhan/khuyen-mai/san-pham-vay/co-bidv-la-co-nha-giai-phap-an-cu-cua-hang-trieu-gia-dinh-viet",
  note:
    "Dùng cho MỘT khái niệm duy nhất: tài liệu sản phẩm có nêu khả năng thu phí trả nợ trước hạn theo chính sách. Đây là chương trình đã hết hiệu lực; bài không lấy lãi suất, không lấy mức phí và không giới thiệu sản phẩm — chỉ để chỉ ra rằng phí này phải được kiểm tra trong hợp đồng của chính bạn.",
};

const SRC_TCB_TRA_GOP = {
  label: "Techcombank — Vay mua nhà trả góp (nội dung giáo dục của ngân hàng)",
  url: "https://techcombank.com/thong-tin/blog/vay-mua-nha-tra-gop",
  note:
    "Khái niệm dùng ở đây: có nhiều cấu trúc trả nợ khác nhau, và khả năng trả nợ được xét trên thu nhập, chi phí và các khoản nợ đang có. Nội dung do một ngân hàng viết, không phải ngưỡng áp dụng chung.",
};

export const ARTICLES_2: EducationArticle[] = [
  // ------------------------------------------------------------------ C07
  {
    slug: "vay-20-nam-hay-25-nam",
    group: "PAYMENT",
    planId: "C07",
    question: "Vay 20 năm hay 25 năm: vì sao tháng nhẹ hơn mà tổng lãi cao hơn?",
    shortAnswer: [
      "Trên cùng 2 tỷ ở 8,5%/năm: 240 tháng trả 17.356.465 ₫ mỗi tháng và tốn 2.165.551.520 ₫ lãi; 300 tháng trả 16.104.542 ₫ mỗi tháng và tốn 2.831.362.501 ₫ lãi.",
      "Nhẹ hơn 1.251.923 ₫ mỗi tháng, đắt hơn 665.810.981 ₫ tiền lãi. Đó là một đánh đổi, không phải một sai lầm — và bài này để bạn thấy rõ hai đầu của nó.",
    ],
    // Both ends of the trade-off, on the article's own fixture. The two
    // figures are emphasised together so neither can be quoted alone.
    shortAnswerEmphasis: [
      "Nhẹ hơn 1.251.923 ₫ mỗi tháng, đắt hơn 665.810.981 ₫ tiền lãi",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Lãi suất", value: "8,5%/năm ở cả hai phương án" },
        { label: "Phương án A", value: "240 tháng (20 năm)" },
        { label: "Phương án B", value: "300 tháng (25 năm)" },
        { label: "Phí thu xếp", value: "0 ở cả hai, để chỉ còn kỳ hạn khác nhau" },
      ],
      note:
        "Khoản vay giả lập, và hai phương án được chọn sao cho CHỈ khác nhau ở kỳ hạn. Đây là cách tách riêng tác động của kỳ hạn; báo giá thật thường khác cả lãi suất và phí, và bài về hai gói vay nói riêng trường hợp đó. Mức lãi 8,5% là con số tròn để tính, không phải mức đang áp dụng ở đâu.",
    },
    sections: [
      {
        heading: "Cùng một khoản nợ, trả trong nhiều năm hơn thì tốn nhiều lãi hơn",
        paragraphs: [
          "Lãi được tính trên dư nợ, từng tháng. Kéo kỳ hạn dài ra không làm dư nợ nhỏ đi — nó làm dư nợ tồn tại lâu hơn, nên tổng số tháng bị tính lãi tăng lên.",
          "Trong ví dụ, thêm 60 tháng làm tổng lãi tăng 665.810.981 ₫, tức khoảng một phần ba số tiền vay ban đầu. Con số đó không hiện ra ở bất kỳ đâu trong khoản trả hằng tháng, và đó chính là lý do chỉ so khoản trả hằng tháng thì chưa đủ để đánh giá tổng chi phí.",
          "Chiều ngược lại cũng thật: khoản trả nhẹ hơn 1.251.923 ₫ mỗi tháng là tiền bạn có thể dùng cho việc khác, hoặc là phần dư để ứng phó với một tháng thu nhập thấp; bài không mô hình hóa điều kiện duyệt vay.",
          "Biểu đồ dưới đây vẽ đúng chỗ khác biệt phát sinh: hai đường dư nợ cùng bắt đầu từ 2 tỷ, nhưng đường 25 năm nằm cao hơn ở mọi tháng. Ở tháng 120, phương án 20 năm còn nợ 1.399.876.455 ₫ còn phương án 25 năm còn 1.635.411.266 ₫ — chính phần dư nợ cao hơn, tồn tại lâu hơn đó là nơi tiền lãi tăng thêm. Đường ngắn về 0 ở tháng 240; đường dài còn 784.954.406 ₫ ở đúng tháng đó và chỉ hết ở tháng 300.",
        ],
        emphasis: [
          "nó làm dư nợ tồn tại lâu hơn",
          "chỉ so khoản trả hằng tháng thì chưa đủ để đánh giá tổng chi phí",
          "hai đường dư nợ cùng bắt đầu từ 2 tỷ, nhưng đường 25 năm nằm cao hơn ở mọi tháng",
        ],
      },
      {
        heading: "Khoản trả không giảm tỷ lệ với kỳ hạn",
        paragraphs: [
          "Kỳ hạn dài hơn 25% (từ 240 lên 300 tháng) nhưng khoản trả chỉ giảm 7,2%. Đây là điều gây bất ngờ nhất khi người ta hy vọng kéo dài kỳ hạn sẽ giải quyết vấn đề dòng tiền.",
          "Ở THÁNG ĐẦU, cùng số tiền vay và cùng lãi suất cho số tiền lãi như nhau; kỳ hạn dài làm phần gốc trả tháng đầu nhỏ hơn. Từ các tháng sau, dư nợ hai lịch khác nhau nên tiền lãi cũng khác. Không thể coi phần lãi bằng nhau suốt kỳ hạn.",
          "Hãy tính thay vì đoán tác động của 5 năm tiếp theo. Cùng 2 tỷ ở 8,5%, 25 năm trả khoảng 16.104.542 ₫ còn 30 năm khoảng 15.378.270 ₫: ngân sách 16 triệu không đủ cho phương án đầu nhưng đủ cho phương án sau trong mô hình này. Đổi lại là thêm lãi và thời gian mang nợ; khả năng vay 30 năm phải kiểm tra trong báo giá thật.",
        ],
        emphasis: [
          "Kỳ hạn dài hơn 25% (từ 240 lên 300 tháng) nhưng khoản trả chỉ giảm 7,2%",
          "Hãy tính thay vì đoán",
        ],
      },
      {
        heading: "Một cách dùng cả hai đầu của đánh đổi",
        paragraphs: [
          "Nhiều người chọn kỳ hạn dài để khoản trả theo lịch nhẹ, rồi trả thêm gốc hằng tháng như thể kỳ hạn ngắn. Khi thu nhập tốt thì trả thêm; khi có tháng khó thì chỉ trả theo lịch.",
          "Cách này đổi một nghĩa vụ cố định thành một lựa chọn linh hoạt, và bài C10 tính cụ thể phần lãi tiết kiệm được khi làm vậy.",
          "Trước khi dựa vào nó, hãy kiểm tra hai điều trong hợp đồng: có được trả thêm gốc hay không, và phí trả nợ trước hạn là bao nhiêu. Mức phí do hợp đồng quy định, và nếu cao thì phần lợi có thể mất hết.",
          "Một điểm nữa ít được nói: tổng lãi trong bài là số danh nghĩa, chưa chiết khấu dòng tiền. Một đồng bạn trả ở năm thứ 25 không nặng bằng một đồng trả năm nay, nên khoảng cách 665 triệu ở trên trông lớn hơn cảm giác thật khi so cùng một thời điểm. Điều đó không làm kỳ hạn dài trở nên rẻ, nhưng nó là lý do không nên chọn kỳ hạn ngắn đến mức khoản trả sát ngân sách chỉ để cắt tổng lãi trên giấy.",
          "Cách cân nhắc thực dụng: chọn kỳ hạn sao cho khoản trả theo lịch còn để lại biên an toàn, rồi dùng phần biên đó để trả thêm gốc khi có thể. Khả năng linh hoạt và phần lãi tiết kiệm phụ thuộc lịch trả thêm thực tế, phí và điều khoản; hãy thử con số cụ thể thay vì mặc định sẽ tiết kiệm phần lớn tiền lãi.",
        ],
        emphasis: [
          "có được trả thêm gốc hay không, và phí trả nợ trước hạn là bao nhiêu",
          "tổng lãi trong bài là số danh nghĩa, chưa chiết khấu dòng tiền",
          "Điều đó không làm kỳ hạn dài trở nên rẻ",
        ],
      },
    ],
    visual: {
      // The plan's own words: "hai đường dư nợ và tổng lãi theo kỳ hạn". A
      // payment timeline showed the lighter instalment but not the debt that
      // stays outstanding for five more years, which is where the extra
      // 665.810.981 ₫ of interest comes from.
      kind: "loanTermDebtPaths",
      title: "Dư nợ theo thời gian: 20 năm so với 25 năm",
      amount: 2_000_000_000,
      annualRatePercent: 8.5,
      terms: [240, 300],
      termLabels: ["20 năm (240 tháng)", "25 năm (300 tháng)"],
      checkpoints: [60, 120, 240, 300],
    },
    // "mọi tháng" is scoped AFTER the shared starting point, per the review:
    // at month 0 both paths are the same 2 tỷ.
    visualReading:
      "Hai đường dư nợ, cùng xuất phát từ 2 tỷ ở tháng 0. Đường liền là 20 năm, đường gạch là 25 năm, và sau điểm xuất phát chung đó đường gạch nằm CAO HƠN ở mọi tháng — chính phần dư nợ cao hơn, tồn tại lâu hơn đó là nơi 665,8 triệu tiền lãi tăng thêm phát sinh. Đường liền về 0 ở tháng 240; ở đúng tháng đó đường gạch vẫn còn nợ và chỉ hết ở tháng 300. Tổng lãi trong bảng là số danh nghĩa: chưa chiết khấu dòng tiền và chưa trừ phí trả nợ trước hạn.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ So sánh khoản vay và dùng nó để tách riêng tác động của kỳ hạn.",
      steps: [
        "Nhập “Số tiền vay” của bạn.",
        "Với “Phương án A”: nhập lãi suất của bạn, “Kỳ hạn” là số năm ngắn hơn, “Phí thu xếp” là 0.",
        "Với “Phương án B”: nhập CÙNG lãi suất, kỳ hạn dài hơn, phí 0.",
        // The cost bars are measured to the SELECTED month, not to maturity:
        // at the tool's default month 60 this loan shows 803,9 và 822,0 triệu,
        // which is neither article figure. The full-term comparison is a row
        // in the detail table.
        "Đọc biểu đồ cột trước, nhưng đọc đúng phạm vi của nó: đó là chi phí tính ĐẾN MỐC “So sánh tại tháng thứ” bạn đang chọn, không phải cả kỳ hạn. Biểu đồ đường bên dưới là khoản trả mỗi tháng và kỳ hạn của từng phương án.",
        "Để lặp lại đúng phép so tổng lãi của bài, mở “Xem bảng so sánh từng chỉ tiêu” rồi đọc dòng “Tổng lãi cả kỳ hạn” của hai phương án. Hai thước đo này có thể chọn ra hai phương án khác nhau, và công cụ nói rõ khi điều đó xảy ra.",
      ],
      toolSlug: "so-sanh-khoan-vay",
      change:
        "Thêm 5 năm nữa vào phương án B. Khoản trả giảm thêm bao nhiêu, và tổng lãi tăng thêm bao nhiêu? So cả dòng tiền hằng tháng lẫn tổng lãi danh nghĩa trong các giả định bạn đang dùng.",
      check:
        "Với số của bạn: khoản trả giảm bao nhiêu phần trăm khi kỳ hạn dài thêm 25%? Con số đó nhỏ hơn 25% chứ?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Kỳ hạn tối đa ngân hàng cho bạn, vốn phụ thuộc tuổi và hồ sơ.",
        "Tổng lãi trong bài là số danh nghĩa, chưa chiết khấu dòng tiền — một đồng trả ở năm thứ 25 không nặng bằng một đồng trả năm nay.",
        "Việc lãi suất có giữ nguyên suốt kỳ hạn hay không. Xem bài C03.",
        "Phí trả nợ trước hạn, nếu bạn định dùng cách kỳ-hạn-dài-trả-thêm-gốc.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho số liệu thị trường.",
      items: [SRC_CFPB_COMPARE, SRC_TCB_TRA_GOP],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-tien-du-tra-them-no-giam-bao-nhieu-lai",
      "hai-goi-vay-thang-thap-co-re-hon",
    ],
  },

  // ------------------------------------------------------------------ C08
  {
    slug: "tiep-tuc-thue-hay-mua-nha",
    group: "CHOICE",
    planId: "C08",
    question: "Tiếp tục thuê hay mua nhà: cần so những chi phí nào?",
    shortAnswer: [
      "So tiền thuê với khoản trả nợ có ích để xem dòng tiền tháng nhưng chưa đủ để chọn thuê hay mua, vì còn ba thứ: tiền tự có của bạn nếu không mua thì làm gì, chi phí sở hữu ngoài khoản vay, và giá nhà thay đổi thế nào.",
      "Kết luận của phép tính này rất nhạy với thời gian bạn ở và với giả định giá nhà. Đổi hai thứ đó là kết luận có thể đảo chiều — nên điều đáng làm là thử, không phải tin một con số.",
    ],
    // The distinction: a month's cash flow is not the net cost. The two
    // conditions that can reverse the answer are emphasised with it, so the
    // conclusion never travels without them.
    shortAnswerEmphasis: [
      "So tiền thuê với khoản trả nợ có ích để xem dòng tiền tháng nhưng chưa đủ để chọn thuê hay mua",
    ],
    household: {
      title: "Tình huống giả lập trong bài",
      items: [
        { label: "Giá nhà", value: "2.500.000.000 ₫" },
        { label: "Tiền tự có", value: "600.000.000 ₫" },
        { label: "Chi phí mua ngoài giá", value: "75.000.000 ₫" },
        { label: "Lãi suất vay", value: "8,5%/năm, 240 tháng" },
        { label: "Chi phí sở hữu hằng tháng", value: "2.500.000 ₫" },
        {
          label: "Giá nhà tăng (ba kịch bản)",
          value: "0%, 3% và 5%/năm",
        },
        { label: "Phí bán khi thoát", value: "2% giá trị" },
        { label: "Tiền thuê hiện tại", value: "12.000.000 ₫/tháng" },
        { label: "Tiền thuê tăng (giả định)", value: "4%/năm" },
        { label: "Tiền tự có nếu không mua sinh lời", value: "6%/năm" },
        { label: "Khoảng thời gian so sánh", value: "120 tháng (10 năm)" },
      ],
      note:
        "Toàn bộ là giả định để minh họa cách so sánh, không phải dự báo giá nhà, tiền thuê hay lợi suất đầu tư. Không có con số nào trong đây là khuyến nghị.",
    },
    sections: [
      {
        heading: "Hai phương án phải bắt đầu từ cùng một số tiền",
        paragraphs: [
          "Sai sót phổ biến nhất khi tự so thuê với mua: chỉ tính tiền của người mua. Người mua bỏ ra 600 triệu tiền tự có cộng 75 triệu chi phí mua; người thuê không bỏ ra khoản đó, nên khoản đó vẫn là của họ và đang làm việc gì.",
          "Nếu hai bên không bắt đầu từ cùng 675 triệu, hoặc bỏ sót tài sản và dòng tiền của một bên, so sánh bị lệch. Mức lệch còn phụ thuộc cách ghi nhận vốn, lợi suất và thời gian; không thể nói luôn bằng đúng tiền trả trước.",
          "Bảng dưới vì vậy tính phần tiền tự có của người mua như là số tiền người thuê đem đi đầu tư ở mức bạn nhập. Mức đó là giả định của bạn: đặt 0 nếu bạn biết mình sẽ không đầu tư gì.",
        ],
        emphasis: [
          "chỉ tính tiền của người mua",
          "Nếu hai bên không bắt đầu từ cùng 675 triệu",
          "Mức đó là giả định của bạn",
        ],
      },
      {
        heading: "Sở hữu có chi phí không nằm trong khoản trả nợ",
        paragraphs: [
          "Phí quản lý, bảo hiểm tài sản, sửa chữa, và thuế phí liên quan đến tài sản đều là tiền ra khỏi ví hằng tháng hoặc hằng năm, và không có khoản nào trong số đó nằm trong con số ngân hàng thu.",
          "Hợp đồng thuê quyết định ai trả phí quản lý, bảo trì và các khoản liên quan; một phần có thể đã nằm trong tiền thuê. Chỉ tính phần mỗi bên thực sự chịu, không cộng trùng. Chi phí người thuê trả riêng cần được đưa vào tổng chi phí thuê.",
          "Chiều ngược lại: người mua trả nợ thì một phần là gốc, tức là tiền chuyển thành tài sản của chính mình. Bảng dưới tính cả phần này, nên nó không coi khoản trả nợ là chi phí toàn bộ.",
        ],
        emphasis: [
          "không có khoản nào trong số đó nằm trong con số ngân hàng thu",
          "Chỉ tính phần mỗi bên thực sự chịu, không cộng trùng",
          "một phần là gốc, tức là tiền chuyển thành tài sản của chính mình",
        ],
      },
      {
        // The heading carries the CONDITION as well as the claim, because the
        // section's whole point is that the crossing month is scoped.
        heading: "Thời gian ở là biến quan trọng nhất, và mốc “có lợi” chỉ đúng trong khoảng bạn chọn",
        paragraphs: [
          "Chi phí mua ngoài giá và phí bán khi thoát là hai khoản trả một lần. Ở càng ngắn thì hai khoản đó càng khó được bù lại; ở càng dài thì chúng càng bị dàn mỏng.",
          // SPLIT. This was ONE paragraph carrying three separate facts — the
          // definition of the crossing month, its scope, and what a blank
          // horizon field means. At 390 px it filled more than a phone screen
          // on its own, which an independent reading review measured. Nothing
          // is removed: each fact now has its own short paragraph, in the same
          // order, with the same words.
          "Dòng “tháng mua bắt đầu có lợi hơn” có một nghĩa rất cụ thể trong công cụ: đó là tháng đầu tiên mà mua rẻ hơn VÀ giữ được lợi thế đó đến hết đúng khoảng thời gian bạn đã chọn. Công cụ dò từ cuối kỳ về đầu, nên nó không báo một mốc sớm rồi sau đó bị đảo lại trong kỳ.",
          "Nhưng mốc đó chỉ nói về khoảng thời gian bạn đã chọn. Đổi “So sánh trong” hoặc đổi giả định giá nhà thì nó có thể dịch chuyển, có thể biến mất, và không có gì bảo đảm lợi thế còn giữ được ở những tháng ngoài khoảng đó.",
          // CORRECTED while splitting this paragraph. The old sentence said
          // "nếu ô So sánh trong để trống" — but that box is the REQUIRED
          // horizon input, and clearing it withholds every result and both
          // charts. The nullable thing is the RESULT row, so that is what
          // this now names.
          "Còn nếu dòng kết quả “Mua bắt đầu có lợi từ tháng” để trống trong khi bạn đã nhập khoảng thời gian hợp lệ mà biểu đồ vẫn có chỗ hai đường giao nhau, nghĩa là mua có rẻ hơn trong một quãng giữa kỳ rồi bị đảo lại trước cuối kỳ. Khi đó hãy đọc chênh lệch tại đúng thời điểm bạn dự định ở hoặc bán, chứ không đọc mốc giao.",
          "Hãy thử đổi khoảng thời gian so sánh và giả định giá nhà. Nếu kết luận đảo chiều chỉ vì đổi giá nhà từ 3% lên 5%/năm, thì bạn biết kết luận đó đang dựa vào một con số không ai biết chắc.",
          "Biểu đồ dưới đây vẽ đúng điều đó: mỗi đường là một giả định tăng giá — 0%, 3% và 5%/năm — và giá trị trên trục dọc là “mua lợi hơn thuê bao nhiêu” ở từng tháng. Dưới đường 0 là những tháng thuê đang rẻ hơn; đường nào cắt lên trên đường 0 thì tháng cắt đó là tháng mua bắt đầu có lợi trong kịch bản ấy. Ba đường tách nhau ra theo thời gian, và khoảng cách giữa chúng ở tháng cuối chính là phần kết luận phụ thuộc vào một con số không ai biết trước.",
          "Có một biến thứ hai cũng đủ sức đảo kết luận: mức sinh lời bạn giả định cho tiền tự có nếu không mua. Đặt 0% thì phương án mua trông tốt hơn nhiều, vì khi đó tiền của người thuê không làm gì cả. Đặt 8% thì ngược lại. Con số trung thực là con số bạn thực sự làm được với tiền đó — không phải mức cao nhất bạn từng nghe.",
        ],
        emphasis: [
          "giữ được lợi thế đó đến hết đúng khoảng thời gian bạn đã chọn",
          "mốc đó chỉ nói về khoảng thời gian bạn đã chọn",
          "kết luận đó đang dựa vào một con số không ai biết chắc",
          "Con số trung thực là con số bạn thực sự làm được với tiền đó",
        ],
      },
      {
        heading: "Những thứ phép tính này không đo được",
        paragraphs: [
          "Bảng chỉ đo tiền. Nó không đo việc con bạn không phải chuyển trường, việc bạn được sửa nhà theo ý mình, hay việc chủ nhà có thể không gia hạn hợp đồng thuê vào lúc bất tiện nhất.",
          "Chiều ngược lại cũng có: thuê cho bạn khả năng đổi chỗ khi đổi việc, và không buộc bạn gánh một khoản nợ 20 năm trong giai đoạn thu nhập còn chưa ổn định.",
          "Cách dùng phép tính này cho đúng: để nó cho bạn biết cái giá tài chính của mỗi lựa chọn, rồi tự quyết định những thứ không đo được có đáng cái giá đó hay không. Một con số không thay bạn ra quyết định, nhưng nó cho bạn biết mình đang trả bao nhiêu cho điều mình muốn.",
        ],
        emphasis: [
          "Bảng chỉ đo tiền",
          "Một con số không thay bạn ra quyết định",
        ],
      },
    ],
    visual: {
      // The plan's own words: "so dòng tiền/tài sản theo thời gian, ít nhất
      // hai kịch bản giá". Three named rates over 120 months, with the exact
      // endpoint figures as the figure's accessible table.
      kind: "rentBuyScenarios",
      title: "Mua lợi hơn thuê bao nhiêu, theo thời gian và theo giả định giá",
      growthPercents: [0, 3, 5],
      input: {
        price: 2_500_000_000,
        downPayment: 600_000_000,
        purchaseCosts: 75_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
        monthlyOwnerCosts: 2_500_000,
        // Overridden once per scenario; kept here as the middle assumption so
        // the declared hypothetical is complete on its own.
        priceGrowthPercent: 3,
        sellingCostPercent: 2,
        monthlyRent: 12_000_000,
        rentGrowthPercent: 4,
        investmentReturnPercent: 6,
        horizonMonths: 120,
      },
    },
    visualReading:
      "Mỗi đường là một giả định tăng giá nhà — 0%, 3% và 5%/năm — và trục dọc là “mua lợi hơn thuê bao nhiêu” ở từng tháng. Số dương nghĩa là mua có chi phí ròng thấp hơn, số âm nghĩa là thuê thấp hơn, nên chỗ một đường cắt lên trên mức 0 chính là tháng mua bắt đầu có lợi TRONG kịch bản đó; ở giả định 0%/năm, mua không rẻ hơn ở tháng nào trong khoảng này. Đến tháng 120 ba đường cách nhau khoảng 1,5 tỷ, và khoảng cách đó là phần kết luận phụ thuộc vào một con số không ai biết trước. Ba đường là KỊCH BẢN, không phải khoảng tin cậy: không đường nào được gán xác suất.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Thuê hay mua nhà. Các bước dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Trong nhóm “Những con số bạn đã biết”, nhập “Giá nhà”, “Tiền trả trước” và “Tiền thuê mỗi tháng” theo tình huống của bạn.",
        "Vẫn trong nhóm đó, nhập “Lãi suất vay”, “Kỳ hạn vay”, rồi “So sánh trong” bằng số tháng bạn thực sự dự định ở; 10 năm là 120 tháng.",
        "Mở nhóm “Giả định và chi phí kèm theo”. Trong “Giả định phía mua” nhập “Giá nhà tăng”, “Phí mua một lần”, “Chi phí sở hữu mỗi tháng” và “Phí khi bán”.",
        "Trong “Giả định phía thuê” nhập “Tiền thuê tăng”, “Tiền cọc thuê” và “Lợi nhuận đầu tư” — mức sinh lời bạn thực sự đạt được với số tiền đó.",
        "Đọc biểu đồ “Chi phí ròng của hai phương án theo thời gian” để thấy hai đường cắt nhau ở tháng nào, rồi đọc biểu đồ “Kết luận đổi thế nào theo giả định tăng giá nhà” ngay dưới đó.",
      ],
      toolSlug: "thue-hay-mua",
      change:
        "Đổi “So sánh trong” từ 60 lên 120 rồi 180 tháng. Xem dòng “Mua bắt đầu có lợi từ tháng” và hai biểu đồ đổi thế nào — kết luận có đảo chiều không, và ở mốc nào.",
      check:
        "Với số của bạn: trên biểu đồ kịch bản, đường ứng với giả định 0% có cắt lên trên đường 0 trong khoảng thời gian bạn chọn không? Nếu chỉ những đường tăng giá cao mới cắt, thì kết luận của bạn đang dựa vào một dự báo.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Giá nhà, tiền thuê hay lợi suất đầu tư trong tương lai. Cả ba là ô nhập, không phải dự báo.",
        "Giá trị phi tài chính: ổn định chỗ ở cho con đi học, được sửa nhà theo ý mình, hay sự linh hoạt khi đổi việc. Không có con số nào ở đây đo được những thứ đó.",
        "Thuế và phí khi bán, ngoài phần bạn nhập.",
        "Việc bạn có được duyệt vay hay không.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một dự báo hay một tỷ lệ.",
      items: [SRC_CFPB_DOWN_PAYMENT, SRC_CFPB_COMPARE],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "duoc-vay-khong-co-nghia-nen-vay-het",
      "hai-goi-vay-thang-thap-co-re-hon",
    ],
  },

  // ------------------------------------------------------------------ C09
  {
    slug: "gop-them-2-trieu-dat-muc-tieu-som-bao-lau",
    group: "SAVING",
    planId: "C09",
    question: "Nếu để dành thêm 2 triệu mỗi tháng, tôi đạt mục tiêu sớm hơn bao lâu?",
    shortAnswer: [
      "Biểu đồ dưới vẽ hai đường tích lũy cho cùng một mục tiêu, chỉ khác mức góp, và đánh dấu kỳ góp đầu tiên đủ mục tiêu của từng đường — kỳ thứ 43 và kỳ thứ 35, sớm 8 tháng. Bảng số liệu ngay dưới biểu đồ giữ nguyên các con số chính xác. Phần rút ngắn được là kết quả của phép tính, không phải một con số chung — nó phụ thuộc bạn đang góp bao nhiêu so với mục tiêu.",
      "Điều đáng nhớ: mức góp là thứ bạn kiểm soát được, lãi suất thì không. Nên khi muốn đạt mục tiêu sớm hơn, chỗ để tác động là mức góp.",
    ],
    // A higher contribution moves the first FUNDED period, and not in
    // proportion. The emphasis keeps "not a general number" attached.
    shortAnswerEmphasis: [
      "kỳ thứ 43 và kỳ thứ 35, sớm 8 tháng",
      "không phải một con số chung",
      "mức góp là thứ bạn kiểm soát được, lãi suất thì không",
    ],
    household: {
      title: "Mục tiêu giả lập trong bài",
      items: [
        { label: "Đang có", value: "100.000.000 ₫" },
        { label: "Mục tiêu", value: "500.000.000 ₫" },
        { label: "Mức góp hiện tại", value: "8.000.000 ₫/tháng" },
        { label: "Mức góp sau khi thêm", value: "10.000.000 ₫/tháng" },
        { label: "Lãi suất giả định", value: "6%/năm danh nghĩa; mỗi tháng 0,5%" },
      ],
      note:
        "Tình huống giả lập. Lãi 6%/năm là giả định, không phải mức được bảo đảm. Bài không đề nghị bạn cắt chi tiêu thiết yếu để tăng mức góp.",
    },
    sections: [
      {
        heading: "Thêm 25% mức góp không rút ngắn 25% thời gian",
        paragraphs: [
          "Trong ví dụ góp cuối tháng, lãi năm danh nghĩa 6% chia 12, từ 8 triệu lên 10 triệu là tăng 25% mức góp. Tiền chỉ vào cuối mỗi tháng, nên câu trả lời của công cụ là KỲ GÓP TRỌN VẸN đầu tiên có số dư đủ mục tiêu: kỳ thứ 43 so với kỳ thứ 35, sớm 8 tháng. Công cụ vẫn giữ nghiệm đại số có phần lẻ ở phần chi tiết và gọi đúng tên nó là ước lượng liên tục; đừng coi phần lẻ đó là một khoản góp đã đến sớm.",
          "Ngay cả ở lãi 0% và tính thời gian liên tục, tăng mức góp 25% chỉ làm thời gian còn 1/1,25 = 80%, tức ngắn hơn 20%. Có lãi, vốn ban đầu và làm tròn kỳ tháng thì mức giảm thay đổi; kết quả 8 tháng ở đây không phải quy luật cho mọi mục tiêu.",
          "Khi gần mục tiêu, việc tính theo kỳ góp trọn vẹn có thể khiến tăng mức góp chưa đổi số kỳ hiển thị, hoặc vừa đủ bớt một kỳ. Hãy so hai kết quả cụ thể và giữ đủ tiền cho nhu cầu thiết yếu trước khi tăng mức góp.",
        ],
        emphasis: [
          "KỲ GÓP TRỌN VẸN đầu tiên có số dư đủ mục tiêu",
          "tăng mức góp 25% chỉ làm thời gian còn 1/1,25 = 80%, tức ngắn hơn 20%",
          "kết quả 8 tháng ở đây không phải quy luật cho mọi mục tiêu",
        ],
      },
      {
        heading: "Tăng mức góp và trông đợi lãi cao hơn không phải hai lựa chọn tương đương",
        paragraphs: [
          "Hai cách để đạt mục tiêu sớm: góp nhiều hơn, hoặc kiếm lợi suất cao hơn. Chúng nghe như hai lựa chọn nhưng không cùng loại.",
          "Mức góp là quyết định của bạn và có hiệu lực ngay. Lợi suất cao hơn là kỳ vọng — và với tiền sắp dùng để mua nhà trong vài năm, đi tìm lợi suất cao hơn thường đi kèm rủi ro mất thanh khoản đúng lúc cần tiền.",
          "Cách kiểm tra: chạy lại kế hoạch của bạn với lãi 0%. Nếu kế hoạch vẫn đứng được thì bạn đang dựa vào mức góp. Nếu nó sụp, bạn đang dựa vào một giả định.",
        ],
        emphasis: [
          "Chúng nghe như hai lựa chọn nhưng không cùng loại",
          "Mức góp là quyết định của bạn và có hiệu lực ngay",
          "Lợi suất cao hơn là kỳ vọng",
        ],
      },
      {
        heading: "Trước khi tăng mức góp, hãy xem khoản nợ đang trả",
        paragraphs: [
          "Nếu bạn đang có nợ tiêu dùng hoặc dư nợ thẻ — phần gốc còn nợ trên thẻ — với lãi cao hơn nhiều mức lãi tiền gửi, thì 2 triệu đó dùng để trả nợ có thể hiệu quả hơn là để dành.",
          "Nếu khoản trả nợ đang là giới hạn chặn dòng tiền, tất toán nó — trả hết phần còn nợ và đóng khoản vay — có thể tăng ngân sách trả nợ nhà. Tuy nhiên tiền dùng tất toán cũng làm giảm tiền tự có; phí, dự phòng và tỷ lệ vay có thể làm tầm giá không tăng. Cần tính lại cả hai phía.",
          "Công cụ Trả hết nợ thẻ tín dụng và Khả năng mua nhà cho bạn so hai hướng này bằng con số của mình.",
        ],
        emphasis: [
          "dùng để trả nợ có thể hiệu quả hơn là để dành",
          "tiền dùng tất toán cũng làm giảm tiền tự có",
          "Cần tính lại cả hai phía",
        ],
      },
      {
        heading: "Giữ mức góp mới bền hơn là giữ nó cao",
        paragraphs: [
          "Một mức góp bạn duy trì được 30 tháng liền tốt hơn một mức cao hơn mà bạn bỏ giữa đường. Khi kế hoạch đổ, thứ thường mất không chỉ là tiền mà cả niềm tin rằng mình làm được — và việc lập lại kế hoạch có thể khó hơn.",
          "Cách kiểm tra trước khi cam kết: lấy mức góp mới, trừ khỏi thu nhập thực nhận, rồi xem phần còn lại có đủ cho sinh hoạt và một khoản dự phòng nhỏ không. Nếu phải cắt vào chi phí thiết yếu để đạt mức góp, đó là dấu hiệu nên chọn thời hạn dài hơn thay vì mức góp cao hơn.",
          "Bạn cũng không cần một mức duy nhất cho cả kỳ. Đặt mức cơ bản ở con số bạn chắc chắn làm được, rồi góp thêm vào những tháng có thưởng hoặc thu nhập ngoài. Biểu đồ dưới cho bạn thấy mỗi mức góp đưa mục tiêu về gần bao nhiêu, nên bạn chọn được điểm cân bằng của mình.",
        ],
        emphasis: [
          "Một mức góp bạn duy trì được 30 tháng liền tốt hơn một mức cao hơn mà bạn bỏ giữa đường",
          "đó là dấu hiệu nên chọn thời hạn dài hơn thay vì mức góp cao hơn",
        ],
      },
    ],
    visual: {
      kind: "savingsComparePaths",
      title: "Cùng mục tiêu, hai mức góp",
      base: {
        mode: "months",
        initial: 100_000_000,
        target: 500_000_000,
        contribution: 8_000_000,
        annualRatePercent: 6,
      },
      increased: {
        mode: "months",
        initial: 100_000_000,
        target: 500_000_000,
        contribution: 10_000_000,
        annualRatePercent: 6,
      },
      baseLabel: "mức hiện tại",
      increasedLabel: "sau khi thêm 2 triệu",
    },
    visualReading:
      "Hai đường tích lũy cho CÙNG một mục tiêu 500 triệu, chỉ khác mức góp, và mỗi đường có dấu ở kỳ góp đầu tiên số dư đủ mục tiêu: kỳ thứ 43 với mức hiện tại, kỳ thứ 35 sau khi thêm 2 triệu. Đường trên đi nhanh hơn vì mỗi tháng có thêm tiền góp, và phần góp thêm đó cũng sinh lãi — hai tác động này đi cùng nhau chứ không tách rời được trên hình. Khoảng cách 8 kỳ là kết quả của cặp con số này, không phải một tỷ lệ chung: tăng mức góp 25% không rút ngắn thời gian 25%. Cả hai đường dùng cùng một mức lãi giả định.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mục tiêu tiết kiệm. Ví dụ trong bài là một mục tiêu bằng tiền, nên hãy giữ chế độ nhập mục tiêu; công cụ so hai mức góp trong một lần chạy.",
      steps: [
        "Ở “Bạn cần tính gì?”, chọn “Mất bao lâu để đạt mục tiêu”.",
        "Ở “Mục tiêu đến từ đâu?”, giữ “Tôi tự nhập số tiền mục tiêu”. (Chọn “Tính từ giá nhà” nếu bạn muốn công cụ tự cộng tiền trả trước, chi phí mua và quỹ dự phòng.)",
        "Nhập “Số tiền đã có”, “Mục tiêu” và “Góp mỗi tháng” ở mức hiện tại của bạn. Ghi lại kỳ góp đầu tiên đủ mục tiêu.",
        "Ở nhóm “Mốc thời gian và thử góp thêm”, nhập ngày bắt đầu rồi điền “Thử góp mỗi tháng” bằng mức cao hơn bạn đang cân nhắc. Đọc dòng “Sớm hơn” và hai ngày đạt mục tiêu.",
      ],
      toolSlug: "muc-tieu-tiet-kiem",
      change:
        "Đặt “Lãi suất” về 0 rồi đọc lại dòng “Sớm hơn”. Phần rút ngắn được thay đổi bao nhiêu? Đó là phần kết quả đang phụ thuộc vào giả định lãi.",
      check:
        "Số tháng rút ngắn được của bạn có xứng với việc phải bớt 2 triệu mỗi tháng trong suốt thời gian đó không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Bạn có nên bớt 2 triệu ở đâu. Bài không đề nghị cắt chi phí thiết yếu hay quỹ dự phòng.",
        "Lãi suất bạn sẽ nhận được. Đó là ô nhập.",
        "Mục tiêu có giữ nguyên hay không: nếu giá nhà đổi thì mục tiêu phải cập nhật.",
        "So sánh giữa để dành và trả nợ trước — cần con số nợ cụ thể của bạn.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một mức lợi suất.",
      items: [
        {
          label: "SEC Investor.gov — Savings Goal Calculator",
          url: "https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator",
          note:
            "Khái niệm dùng ở đây: mục tiêu, số tiền đang có, thời hạn, lãi suất và kỳ ghép lãi là ĐẦU VÀO của kế hoạch góp tiền. Công cụ giáo dục của cơ quan quản lý chứng khoán Hoa Kỳ, không phải cam kết lợi suất.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "du-tien-tra-truoc-sau-3-nam",
      "co-tien-du-tra-them-no-giam-bao-nhieu-lai",
    ],
  },

  // ------------------------------------------------------------------ C10
  {
    slug: "co-tien-du-tra-them-no-giam-bao-nhieu-lai",
    group: "RESILIENCE",
    planId: "C10",
    question: "Có tiền dư, trả thêm nợ mua nhà giúp giảm bao nhiêu lãi?",
    shortAnswer: [
      "Trên khoản vay 2 tỷ, 8,5%/năm, 240 tháng: trả thêm 2 triệu gốc mỗi tháng giảm 555.699.884 ₫ tiền lãi và rút ngắn 53 tháng. Khoản vay xong ở tháng 187.",
      "Đó là con số TRƯỚC phí trả nợ trước hạn. Mức phí do hợp đồng của bạn quy định, và nó có thể làm phần lợi nhỏ đi đáng kể — hoặc mất hết.",
    ],
    // The saving is a BEFORE-fee figure, and the fee is unknown here. That
    // qualification is emphasised in the same breath as the saving.
    shortAnswerEmphasis: [
      "Đó là con số TRƯỚC phí trả nợ trước hạn",
      "Mức phí do hợp đồng của bạn quy định",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Lãi suất", value: "8,5%/năm, giữ nguyên suốt kỳ hạn" },
        { label: "Kỳ hạn theo lịch", value: "240 tháng" },
        { label: "Trả thêm gốc", value: "2.000.000 ₫ mỗi tháng" },
      ],
      note:
        "Khoản vay giả lập. Phí trả nợ trước hạn KHÔNG được tính trong phép tính này, vì mức phí do từng hợp đồng quy định.",
    },
    sections: [
      {
        heading: "Vì sao 2 triệu mỗi tháng lại cắt được hơn 555 triệu tiền lãi",
        paragraphs: [
          "Mỗi đồng trả thêm đi thẳng vào gốc, và gốc là thứ lãi được tính trên. Đồng gốc trả sớm hơn thì được miễn lãi cho toàn bộ số tháng còn lại của nó.",
          "Tổng số tiền trả thêm trong ví dụ này là khoảng 372 triệu, trải trong 186 tháng. Phần lãi cắt được là 555.699.884 ₫ — lớn hơn số tiền đã bỏ thêm, vì mỗi đồng gốc trả sớm tiết kiệm nhiều năm tiền lãi.",
          "Đây cũng là lý do trả thêm sớm hiệu quả hơn trả thêm muộn. Cùng 2 triệu, bỏ vào năm đầu tiết kiệm được nhiều hơn bỏ vào năm thứ mười lăm.",
          "Biểu đồ dưới đây đặt hai đường dư nợ — phần gốc còn nợ — cạnh nhau: cùng khoản vay, chỉ khác việc có trả thêm hay không. Khoảng cách giữa hai đường mở rộng dần — ở tháng 60 là 1.762.543.662 ₫ so với 1.613.658.788 ₫, đến tháng 120 là 1.399.876.455 ₫ so với 1.023.599.623 ₫ — và đường trả thêm về 0 ở tháng 187, lúc đường theo lịch vẫn còn nợ 764.715.088 ₫.",
        ],
        emphasis: [
          "Mỗi đồng trả thêm đi thẳng vào gốc, và gốc là thứ lãi được tính trên",
          "lớn hơn số tiền đã bỏ thêm",
          "trả thêm sớm hiệu quả hơn trả thêm muộn",
        ],
      },
      {
        heading: "Ba câu hỏi phải trả lời trước khi trả thêm",
        paragraphs: [
          "Thứ nhất: phí trả nợ trước hạn của hợp đồng là bao nhiêu và áp dụng trong bao lâu? Con số này không nằm trong công cụ và không có mức chung — có hợp đồng không thu, có hợp đồng thu theo bậc giảm dần. Hãy đọc điều khoản, hoặc hỏi và yêu cầu chỉ ra trong hợp đồng.",
          "Thứ hai: sau khi trả thêm, quỹ dự phòng của bạn còn đủ không? Tiền đã trả vào gốc thì không rút lại được. Nếu ba tháng sau bạn cần tiền và phải vay tiêu dùng với lãi cao hơn, việc trả thêm đã làm bạn thiệt.",
          "Thứ ba: bạn có khoản nợ nào với chi phí cao hơn không? So phần lãi có thể tránh, phí tất toán (phí khi trả hết phần còn nợ và đóng khoản vay trước hạn), nghĩa vụ trả tối thiểu và nhu cầu tiền mặt. Lãi suất cao là thông tin quan trọng nhưng không đủ để quyết định thứ tự trả mọi khoản nợ.",
        ],
        emphasis: [
          "Con số này không nằm trong công cụ và không có mức chung",
          "Tiền đã trả vào gốc thì không rút lại được",
          "không đủ để quyết định thứ tự trả mọi khoản nợ",
        ],
      },
      {
        heading: "Trả thêm đều hay trả một lần",
        paragraphs: [
          "Công cụ chỉ mô hình hóa khoản trả thêm cố định MỖI THÁNG. Không chia thưởng cuối năm cho 12 rồi coi là lịch tương đương: tiền chưa nhận không thể trả nợ trước, và thời điểm giảm dư nợ làm tiền lãi khác đi. Khoản thưởng một lần cần lịch trả theo ngày hoặc kỳ nhận tiền; công cụ hiện chưa hỗ trợ lịch đó.",
          "Điểm cần kiểm tra trong hợp đồng: nhiều hợp đồng chỉ cho trả thêm vào những mốc nhất định, hoặc yêu cầu số tiền tối thiểu. Trả thêm mỗi tháng chỉ khả thi nếu hợp đồng cho phép.",
          "Nếu hợp đồng không cho trả thêm linh hoạt, phần lợi trong bài này không áp dụng cho bạn — và đó là một tiêu chí đáng đưa vào khi so hai báo giá.",
        ],
        emphasis: [
          "Công cụ chỉ mô hình hóa khoản trả thêm cố định MỖI THÁNG",
          "tiền chưa nhận không thể trả nợ trước",
          "Trả thêm mỗi tháng chỉ khả thi nếu hợp đồng cho phép",
        ],
      },
      {
        heading: "Trả thêm gốc hay để dành: không có đáp án chung",
        paragraphs: [
          "Trả thêm gốc có thể giảm lãi tính trên dư nợ về sau; con số ròng còn phụ thuộc phí và cách ngân hàng xử lý khoản trả thêm. Giữ tiền có lợi ích thanh khoản, còn mức sinh lời phụ thuộc sản phẩm và giả định của bạn.",
          "Để so bằng tiền, cần lãi tránh được sau phí trả trước và lợi suất giữ tiền sau thuế, phí trên cùng khoảng thời gian. Sau đó xét khả năng xoay tiền nếu thu nhập gián đoạn; phép so hai lãi suất riêng lẻ chưa đủ.",
          "Một phương án để cân nhắc là giữ quỹ dự phòng trước rồi mới trả thêm phần dư. Trì hoãn trả gốc có thể làm tổng lãi tăng đáng kể hoặc ít, tùy số tiền, thời gian và lãi suất; cần tính phần đánh đổi, không mặc định chi phí rất nhỏ.",
        ],
        emphasis: [
          "con số ròng còn phụ thuộc phí và cách ngân hàng xử lý khoản trả thêm",
          "phép so hai lãi suất riêng lẻ chưa đủ",
        ],
      },
    ],
    visual: {
      // The plan's own words: "dư nợ cơ bản/trả thêm; tổng chi và số tháng
      // giảm". The previous figure drew only the extra-payment schedule, so
      // the 53 months and the 555.699.884 ₫ had nothing to be compared with.
      kind: "extraPaymentDebtPaths",
      title: "Dư nợ theo lịch so với trả thêm 2 triệu mỗi tháng",
      loan: {
        amount: 2_000_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
      extraPerMonth: 2_000_000,
      baselineLabel: "Theo lịch",
      extraLabel: "Trả thêm 2 triệu",
      checkpoints: [60, 120, 187],
    },
    // CORRECTED. An earlier draft called the vertical gap "phần lãi không
    // phải trả" and said both figures could be read off the endpoints. The
    // counterexample the review gave is decisive: at month 1 both paths
    // charge interest on the same 2 tỷ opening principal, so the interest
    // difference is zero while the gap is already 2 triệu. The gap is a
    // PRINCIPAL difference; the interest saving is a separate accumulated
    // figure in the summary and the table.
    visualReading:
      "Hai đường dư nợ của CÙNG một khoản vay, chỉ khác việc có trả thêm 2 triệu mỗi tháng hay không. Khoảng cách dọc giữa hai đường là phần GỐC đã trả sớm hơn, không phải tiền lãi đã tiết kiệm: ở tháng 1 hai đường đã cách nhau 2 triệu trong khi tiền lãi của tháng đó vẫn bằng nhau, vì cả hai cùng tính lãi trên 2 tỷ đầu kỳ. Chính việc gốc về sớm đó làm lãi các tháng sau nhỏ hơn. Hai con số của bài đến từ hai chỗ khác nhau: 53 tháng đọc ở hai dấu tất toán (tháng 187 so với tháng 240), còn 555,7 triệu là chênh lệch tiền lãi tích lũy, nằm ở câu tóm tắt và trong bảng. Hình này chưa trừ phí trả nợ trước hạn, khoản mà chỉ hợp đồng của bạn mới trả lời được.",
    exercise: {
      title: "Thử với số của bạn",
      intro: "Mở công cụ Tính khoản vay mua nhà.",
      steps: [
        "Nhập “Số tiền vay”, “Lãi suất” và “Kỳ hạn” của khoản vay bạn đang có hoặc dự kiến.",
        // The extra-payment field lives behind a collapsed disclosure, so a
        // reader told to "nhập Trả thêm mỗi tháng" could not find it.
        "Mở phần “Trả thêm để rút ngắn khoản vay (tùy chọn)” — ô trả thêm nằm trong đó, không hiện sẵn trên biểu mẫu.",
        "Nhập “Trả thêm mỗi tháng” bằng số tiền bạn thực sự có thể duy trì.",
        "Đọc phần “Nếu trả thêm mỗi tháng” để thấy tiền lãi tiết kiệm được và số tháng rút ngắn.",
        "Đọc ghi chú ngay dưới đó về phí trả nợ trước hạn, rồi trừ phần phí của hợp đồng bạn ra bằng tay.",
      ],
      toolSlug: "vay-mua-nha",
      change:
        "Giảm “Trả thêm mỗi tháng” xuống một nửa. Phần lãi tiết kiệm được có giảm đúng một nửa không? Xem câu trả lời trên công cụ của bạn.",
      check:
        "Nếu có phí trả nợ trước hạn, tính phí theo từng kỳ trả thêm và đúng căn cứ trong hợp đồng, rồi cộng lại; không áp một tỷ lệ cho toàn kỳ nếu mức phí thay đổi. Lợi ích còn lại có đáng phần tiền mặt bạn phải dùng không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Phí trả nợ trước hạn của bạn. Công cụ không tính, và không có mức chung — chỉ hợp đồng của bạn mới trả lời được.",
        "Hợp đồng có cho trả thêm gốc hay không, và theo lịch nào.",
        "Liệu tiền dư đó nên dùng để trả nợ nhà, trả nợ khác, hay giữ làm dự phòng.",
        "Lãi suất có giữ nguyên hay không. Nếu hợp đồng thả nổi thì phần tiết kiệm được sẽ khác. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Dùng cho MỘT khái niệm: phí trả nợ trước hạn là điều khoản có thật cần kiểm tra. Không lấy lãi suất, mức phí hay sản phẩm nào.",
      items: [SRC_BIDV_FEE],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: ["vay-2-ty-moi-thang-tra-bao-nhieu", "vay-20-nam-hay-25-nam"],
  },

  // ------------------------------------------------------------------ C11
  {
    slug: "lai-co-dinh-hay-tha-noi",
    group: "CHOICE",
    planId: "C11",
    question: "Lãi cố định hay thả nổi: tôi đang đánh đổi điều gì?",
    shortAnswer: [
      "Bạn đang so mức độ biết trước khoản trả với rủi ro lãi thay đổi. Trong ví dụ này, mức ưu đãi thả nổi thấp hơn mức cố định; đó là giả định để so, không phải quy luật giá của thị trường. Lãi thả nổi là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới; lãi cố định giữ một mức trong suốt thời gian đã thỏa thuận.",
      "Bảng dưới cho một cách so cụ thể: mức lãi cố định mà tại đó hai phương án tốn tổng lãi bằng nhau. Nếu mức cố định bạn được báo thấp hơn con số đó, cố định đang có lợi trong kịch bản này.",
    ],
    // The trade-off itself, and the fact that the example's price ordering is
    // an assumption rather than a market rule.
    shortAnswerEmphasis: [
      "Bạn đang so mức độ biết trước khoản trả với rủi ro lãi thay đổi",
      "không phải quy luật giá của thị trường",
    ],
    household: {
      title: "Hai cấu trúc lãi giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Kỳ hạn", value: "240 tháng" },
        { label: "Phương án cố định (giả định)", value: "10,5%/năm suốt kỳ hạn" },
        { label: "Phương án thả nổi — ưu đãi", value: "7,5%/năm trong 12 tháng" },
        {
          label: "Phương án thả nổi — sau ưu đãi (giả định của bài)",
          value: "11%/năm",
        },
        {
          label: "Các kịch bản sau ưu đãi khác được nêu",
          value: "9%/năm và 13%/năm",
        },
      ],
      note:
        "Mọi mức lãi ở đây là giả định để minh họa phép so, không phải báo giá của ngân hàng nào, không phải dự báo và không mang xác suất. Cùng số tiền vay và cùng kỳ hạn ở cả hai phương án. Biểu đồ vẽ phương án cố định cùng hai kịch bản 11% và 13%; bảng số liệu liệt kê đủ cả ba kịch bản sau ưu đãi.",
    },
    sections: [
      {
        heading: "Đây là lựa chọn ở thời điểm ký, không phải phản ứng với cú sốc",
        paragraphs: [
          "Bài C03 nói về việc lãi đổi khi bạn đã vay rồi: đó là một cú sốc phải chịu và phải chuẩn bị. Bài này nói về lúc bạn còn được chọn cấu trúc — một quyết định khác, với thông tin khác.",
          "Ở thời điểm ký, bạn biết mức cố định được báo và biết mức ưu đãi được báo. Bạn không biết lãi thả nổi sẽ ở đâu. Phép so trong bảng giữ kịch bản thả nổi đã nhập rồi tìm mức lãi CỐ ĐỊNH có tổng lãi bằng nó; bảng không tự tìm ngưỡng lãi thả nổi tương lai.",
          // SPLIT. One paragraph used to carry the picture, the break-even
          // rate, its scenario dependence AND the difference between two
          // measures. Four facts, four short paragraphs, same words.
          "Biểu đồ trên cho thấy cùng một điều bằng hình: đường cố định nằm ngang suốt kỳ hạn, còn hai đường thả nổi giữ mức ưu đãi trong 12 tháng rồi nhảy lên — 20.479.346 ₫ nếu sau ưu đãi là 11%/năm, 23.166.370 ₫ nếu là 13%/năm.",
          "Cả hai mức nhảy đều cao hơn khoản trả cố định 19.967.598 ₫, nên phần “được” của ưu đãi nằm hết ở 12 tháng đầu.",
          "Dòng cuối bảng trả lời đúng câu đó: mức lãi cố định làm hai phương án tốn tổng lãi bằng nhau, xét đúng kịch bản sau ưu đãi 11%/năm mà bài nêu; đổi kịch bản thì con số đó cũng đổi.",
          "Lưu ý phạm vi: con số này so TỔNG LÃI CẢ KỲ HẠN. Công cụ ở phần bài tập so hai phương án tại một mốc giữ khoản vay do bạn chọn, và hai thước đo đó có thể chọn ra hai phương án khác nhau — công cụ nói rõ khi điều đó xảy ra.",
        ],
        emphasis: [
          "Bạn không biết lãi thả nổi sẽ ở đâu",
          "phần “được” của ưu đãi nằm hết ở 12 tháng đầu",
          "đổi kịch bản thì con số đó cũng đổi",
          "con số này so TỔNG LÃI CẢ KỲ HẠN",
        ],
      },
      {
        heading: "Sự chắc chắn có giá, và giá đó không phải luôn đáng trả",
        paragraphs: [
          "Trong ví dụ, cố định 10,5% cao hơn ưu đãi 7,5%; không suy ra mọi báo giá đều như vậy. Với sản phẩm thật, cần so mức lãi, thời gian cố định, phí và điều kiện đi kèm.",
          "Với hộ có thu nhập ổn định và biên an toàn rộng, cái giá đó có thể không cần thiết — họ chịu được một cú tăng và tiết kiệm được phần chênh. Với hộ mà khoản trả đã sát ngân sách, biết trước con số lại là thứ quan trọng nhất, vì một cú tăng 27% có thể là điều họ không xoay kịp.",
          "Không có đáp án chung. Nhưng có một cách tự trả lời: lấy khoản trả của phương án cố định, đặt nó cạnh ngân sách của bạn, rồi lấy khoản trả cao nhất trong kịch bản thả nổi và làm điều tương tự. Nếu con số thứ hai vượt ngân sách, phần chênh của lãi cố định đang mua cho bạn một thứ có giá trị.",
        ],
        emphasis: [
          "không suy ra mọi báo giá đều như vậy",
          "Không có đáp án chung",
          "phần chênh của lãi cố định đang mua cho bạn một thứ có giá trị",
        ],
      },
      {
        heading: "Đọc kỹ “cố định” nghĩa là cố định bao lâu",
        paragraphs: [
          "Trước hết hỏi ngân hàng thời gian cố định thực tế. Bảng giả lập cố định suốt 240 tháng để làm đối chứng, không xác nhận có sản phẩm 20 năm như vậy tại Việt Nam. Cố định vài năm rồi đổi lãi là cấu trúc khác.",
          "Nếu hợp đồng của bạn thuộc loại thứ hai, thì nó thực chất là một phương án thả nổi với giai đoạn ưu đãi dài hơn — hãy mô hình hóa nó bằng công cụ Khoản vay lãi thả nổi, với số tháng ưu đãi bằng thời gian cố định.",
          "Câu hỏi cần đặt cho ngân hàng: cố định trong bao nhiêu tháng, sau đó tính theo công thức nào, và có trần hay không.",
        ],
        emphasis: [
          "Bảng giả lập cố định suốt 240 tháng để làm đối chứng",
          "nó thực chất là một phương án thả nổi với giai đoạn ưu đãi dài hơn",
        ],
      },
    ],
    visual: {
      // The plan's own words: "khoản trả theo hai cấu trúc và nhiều kịch
      // bản". The picture draws the fixed level and two named
      // post-promotional scenarios — three lines, three stroke patterns, so
      // no line is told apart by colour alone — and the exact table lists
      // all three named scenarios plus the break-even fixed rate the prose
      // refers to.
      kind: "fixedFloatingPaths",
      title: "Khoản trả theo hai cấu trúc lãi, dưới các kịch bản sau ưu đãi",
      amount: 2_000_000_000,
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      fixedRatePercent: 10.5,
      postRatePercents: [9, 11, 13],
      drawnPostRatePercents: [11, 13],
      // The article's own declared hypothetical, and therefore the scenario
      // the break-even fixed rate is measured against.
      declaredPostRatePercent: 11,
    },
    visualReading:
      "Ba đường KHOẢN TRẢ MỖI THÁNG, phân biệt bằng nét liền, nét gạch và nét chấm chứ không chỉ bằng màu: phương án cố định đi ngang suốt kỳ hạn, hai đường thả nổi giữ mức ưu đãi 12 tháng rồi nhảy lên mức sau ưu đãi 11% và 13%. Cả hai mức nhảy đều cao hơn đường cố định, nên phần “được” của ưu đãi nằm hết ở 12 tháng đầu. Mỗi điểm trên hình là tiền của MỘT tháng, còn các dòng tổng lãi trong bảng mới là số cộng dồn của cả 240 tháng — đừng đọc lẫn hai thứ. Bảng còn có kịch bản 9% không được vẽ, và kịch bản đó rẻ hơn cả hai đường trên hình, nên biểu đồ không phải một xếp hạng đầy đủ.",
    // UPDATED with the consolidated tool's actual labels. The route is now a
    // perspective of the loan comparison, so the reader fills in two named
    // alternatives and reads the answer at a COMMON horizon — the old steps
    // named fields ("Lãi suất cố định", "Lãi cố định hòa vốn") that the page
    // no longer has. The break-even figure in this article's own table is a
    // full-term measure and is described as such above.
    //
    // CORRECTED 2026-09-15 against the rendered page a second time. The steps
    // quoted block headings "Lãi cố định cả kỳ hạn" and "Ưu đãi rồi thả nổi"
    // that the tool does not print: it composes a STABLE side name with a
    // descriptor read off what the reader typed — "Bên A — một mức lãi suốt
    // kỳ hạn", "Bên B — giữ một mức lãi 12 tháng rồi đổi" — precisely so a
    // heading cannot go on claiming "fixed for the whole term" after someone
    // enters a phased quote. The steps now name the stable side plus the
    // current descriptor, and the promotional rate field is "Lãi ưu đãi",
    // not "Lãi suất ưu đãi".
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Lãi cố định hay thả nổi — đó là công cụ so sánh khoản vay ở góc nhìn hai cấu trúc lãi — và nhập hai báo giá bạn thực sự có.",
      steps: [
        "Nhập “Số tiền vay”, dùng chung cho cả hai bên.",
        "Nhập “So sánh tại tháng thứ” bằng số tháng bạn dự kiến thực sự giữ khoản vay, ví dụ 60.",
        "Ở khối “Bên A” — công cụ gọi nó là “Bên A — một mức lãi suốt kỳ hạn” khi bạn để trống hai ô ưu đãi: nhập “Lãi suất” là mức cố định được báo và “Kỳ hạn” theo năm.",
        "Ở khối “Bên B”: nhập “Lãi suất” là mức sau ưu đãi, rồi mở “Phí và lãi ưu đãi của báo giá này” để điền “Số tháng ưu đãi” và “Lãi ưu đãi”. Sau khi điền, tiêu đề khối đổi thành “Bên B — giữ một mức lãi 12 tháng rồi đổi” theo đúng số tháng bạn nhập.",
        "Đọc “Rẻ nhất tại mốc bạn chọn” và “Chênh lệch với phương án đắt nhất”, rồi mở bảng chi tiết để xem cả chi phí đến mốc đó và chi phí cả kỳ hạn.",
      ],
      toolSlug: "lai-co-dinh-hay-tha-noi",
      change:
        "Tăng “Lãi suất” của Bên B thêm 2 điểm phần trăm rồi đọc lại. Nếu kết luận đổi chiều, quyết định của bạn đang phụ thuộc vào một mức lãi không ai biết trước — và khi đó nên chọn theo mức chịu đựng rủi ro.",
      check:
        "Đổi “So sánh tại tháng thứ” từ 60 sang 240: phương án rẻ nhất có đổi không? Nếu có, công cụ sẽ nói rõ là hai mốc cho hai câu trả lời khác nhau, và mốc đúng là mốc bạn thực sự giữ khoản vay.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất thả nổi sẽ ở đâu. Kịch bản là của bạn, không phải dự báo của FinHome.",
        "“Cố định” trong hợp đồng của bạn là bao lâu — đây là điều khoản, không phải phép tính.",
        "Phí thu xếp, bảo hiểm khoản vay và phí trả nợ trước hạn, có thể khác nhau giữa hai phương án.",
        "Việc chuyển từ thả nổi sang cố định giữa kỳ hạn có được phép hay không.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro: "Dùng cho KHÁI NIỆM, không phải cho một mức lãi.",
      items: [SRC_CFPB_COMPARE, SRC_TCB_TRA_GOP],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "doi-sang-khoan-vay-lai-thap-hon-khi-nao-bu-duoc-chi-phi",
    ],
  },

  // ------------------------------------------------------------------ C12
  {
    slug: "doi-sang-khoan-vay-lai-thap-hon-khi-nao-bu-duoc-chi-phi",
    group: "RESILIENCE",
    planId: "C12",
    question: "Đổi sang khoản vay lãi thấp hơn: khi nào mới bù được chi phí?",
    shortAnswer: [
      "Phép tính đặt lãi, phí và dư nợ (phần gốc còn nợ) hai khoản vay cạnh nhau tại tháng 60. Bảng dưới còn tách riêng chênh lệch tiền đã chi, để bạn không nhầm trả nhẹ hơn với chi phí thấp hơn.",
      "Mốc bù phí bằng khoản trả giảm chỉ đo DÒNG TIỀN, chưa chứng minh lợi ích kinh tế. Khi dự định bán hoặc tất toán sớm — trả hết phần còn nợ và đóng khoản vay trước hạn — cần so cả phí, lãi đã trả và dư nợ còn lại tại cùng một tháng.",
    ],
    // Cash-flow recovery is not economic saving, and the comparison only
    // means anything at ONE month. Both halves are emphasised together.
    shortAnswerEmphasis: [
      "chỉ đo DÒNG TIỀN, chưa chứng minh lợi ích kinh tế",
      "tại cùng một tháng",
    ],
    household: {
      title: "Tình huống giả lập trong bài",
      items: [
        { label: "Dư nợ hiện tại", value: "1.800.000.000 ₫" },
        { label: "Lãi suất đang trả", value: "11%/năm" },
        { label: "Số tháng còn lại", value: "216 tháng" },
        { label: "Lãi suất khoản vay mới (giả định)", value: "9%/năm" },
        { label: "Kỳ hạn khoản vay mới", value: "216 tháng, giữ nguyên" },
        { label: "Phí tất toán cũ (giả định)", value: "20.000.000 ₫" },
        { label: "Phí một lần khoản mới (giả định)", value: "20.000.000 ₫" },
        { label: "Tháng muốn so sánh", value: "60 tháng" },
      ],
      note:
        "Tình huống giả lập. Hai mức lãi không đổi và 40 triệu tổng phí trả ngay đều là giả định, không phải báo giá. Phí cũ đã gồm trong tổng; không cộng lần nữa. So cả hai khoản vay sau 60 tháng, chưa tính phí thoát ở tháng này.",
    },
    sections: [
      {
        heading: "Tính trên dư nợ hiện tại, không phải số tiền vay ban đầu",
        paragraphs: [
          "Sai sót đầu tiên khi tự tính: dùng số tiền vay ban đầu. Bạn đang chuyển đổi phần nợ CÒN LẠI, nên mọi con số phải bắt đầu từ dư nợ hiện tại.",
          "Nếu trả được ít gốc trong những năm đầu, dư nợ còn lại vẫn cao dù tổng tiền đã trả lớn. Lấy dư nợ từ sao kê hoặc ngân hàng; không suy ra nó từ tổng khoản trả và không đoán theo cảm nhận.",
          "Sai sót thứ hai: chỉ nhìn khoản trả tháng mà bỏ qua chênh lệch kỳ hạn. Nếu khoản vay mới kéo dài hơn số tháng còn lại, khoản trả có thể nhỏ đi do thời gian dài hơn, không chỉ do lãi suất. Bảng dưới giữ nguyên 216 tháng ở cả hai phương án để tách riêng tác động của lãi suất; hai kỳ hạn khác nhau vẫn so được nếu cùng mốc và tính đủ dư nợ.",
        ],
        emphasis: [
          "Bạn đang chuyển đổi phần nợ CÒN LẠI",
          "khoản trả có thể nhỏ đi do thời gian dài hơn, không chỉ do lãi suất",
        ],
      },
      {
        heading: "Tách mốc bù phí dòng tiền khỏi lợi ích kinh tế",
        paragraphs: [
          "Trong bảng, phí chuyển đổi trả ngay ở tháng 0. Mốc bù phí chi phí là khi lãi tiết kiệm TÍCH LŨY bù đủ tổng phí. Mốc này khác việc khoản trả giảm bù phí vì khoản trả gồm cả gốc. Công cụ hiện so tại tháng bạn chọn và ghi dư nợ hai phương án; bảng giả lập chọn tháng 60.",
          "Biểu đồ dưới đây vẽ cả hai thước đo theo thời gian, và chúng cắt đường 0 ở hai tháng khác nhau: chi phí bù đủ phí ở tháng 14, còn tiền đã chi phải tới tháng 18. Lý do là khoản trả nhẹ hơn mỗi tháng gồm cả phần gốc trả chậm hơn, nên dòng tiền dễ chịu hơn không có nghĩa là đã lời. Ở tháng 12 cả hai đường còn âm — chi phí −3.962.835 ₫ và tiền đã chi −12.221.362 ₫ — rồi đến tháng 24 lần lượt là 32.110.231 ₫ và 15.557.277 ₫.",
          "Một gói kéo dài kỳ hạn có thể hoàn phí dòng tiền nhanh nhưng để lại dư nợ cao hơn nhiều. Để đánh giá tại tháng H, so tổng khoản đã trả + phí + dư nợ cần tất toán của mỗi phương án; với cùng dư nợ ban đầu, chênh lệch này tương đương chênh lệch lãi và phí đã phát sinh, trước các chi phí thoát khoản vay chưa nhập.",
          "Bảng đã tính 20 triệu phí tất toán cũ giả định. Với hồ sơ thật, thay số này bằng phí đúng hợp đồng và nhập chi phí một lần của khoản vay mới riêng. Đừng cộng trùng. Một lần vượt đường 0 không bảo đảm các tháng sau vẫn có lợi; hãy đổi tháng so sánh để kiểm tra.",
        ],
        emphasis: [
          "chi phí bù đủ phí ở tháng 14, còn tiền đã chi phải tới tháng 18",
          "dòng tiền dễ chịu hơn không có nghĩa là đã lời",
          "Một lần vượt đường 0 không bảo đảm các tháng sau vẫn có lợi",
        ],
      },
      {
        heading: "Giảm khoản trả hằng tháng và giảm tổng chi phí là hai chuyện",
        paragraphs: [
          "Lãi thấp hơn hoặc kỳ hạn dài hơn đều có thể giảm khoản trả tháng. Nhưng lãi thấp hơn chưa bảo đảm giảm tổng chi phí nếu phí cao, thời gian dài hơn hoặc cấu trúc lãi thay đổi.",
          "Nếu bên cho vay mới đề nghị khoản trả nhẹ hơn nhờ kéo dài kỳ hạn, hãy thử lại với kỳ hạn bằng số tháng còn lại của khoản vay cũ. Phép thử này tách riêng ảnh hưởng của lãi suất; khi so phương án khác kỳ hạn, vẫn giữ cùng tháng đánh giá và tính cả dư nợ.",
          "Đây là chỗ hai mốc đổi thứ tự. Nếu kỳ hạn mới là 300 tháng thay vì 216, khoản trả xuống 15.105.535 ₫ và mốc tiền đã chi đến sớm hơn — tháng 10 thay vì 18 — trong khi mốc chi phí vẫn ở tháng 14. Đổi lại, ở tháng 60 khoản vay mới còn nợ 1.678.903.943 ₫, cao hơn cả dư nợ 1.587.615.672 ₫ của khoản cũ. Dòng tiền nhẹ hơn không làm phần nợ giữ lại đó biến mất.",
          "Bảng có cả dòng chênh lệch tổng chi phí cả kỳ hạn, bên cạnh dòng giảm được mỗi tháng. Hai dòng đó có thể nói hai điều khác nhau, và bạn cần cả hai.",
        ],
        emphasis: [
          "lãi thấp hơn chưa bảo đảm giảm tổng chi phí",
          "Dòng tiền nhẹ hơn không làm phần nợ giữ lại đó biến mất",
          "Hai dòng đó có thể nói hai điều khác nhau, và bạn cần cả hai",
        ],
      },
      {
        heading: "Ba câu hỏi nên hỏi trước khi làm hồ sơ",
        paragraphs: [
          "Thứ nhất, khoản vay mới là lãi cố định hay có ưu đãi rồi thả nổi? Nếu là loại thứ hai, tổng chi phí cả kỳ trong bảng không đại diện cho báo giá đó. Công cụ lãi thả nổi giúp mô phỏng khoản trả từng giai đoạn, nhưng chưa tự tổng hợp đủ phí và so dư nợ hai gói tại cùng mốc thoát. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
          "Thứ hai, chi phí chuyển đổi gồm những gì? Thường có thẩm định lại tài sản, công chứng lại hợp đồng bảo đảm, phí đăng ký giao dịch bảo đảm và bảo hiểm mới. Hãy yêu cầu liệt kê từng khoản chứ đừng nhận một con số tổng.",
          "Thứ ba, ngày giải ngân mới — ngày tiền vay đã cam kết được chuyển ra thực tế — và ngày tất toán cũ khớp ra sao? Chỉ cộng chi phí chồng lấn nếu lịch thực tế phát sinh, không mặc định phải trả đồng thời hai khoản vay. Công cụ hiện chưa mô hình hóa lịch chuyển đổi theo ngày.",
        ],
        emphasis: [
          "tổng chi phí cả kỳ trong bảng không đại diện cho báo giá đó",
          "Hãy yêu cầu liệt kê từng khoản chứ đừng nhận một con số tổng",
        ],
      },
    ],
    visual: {
      // The plan's own words: "chi phí chuyển đổi và mốc hòa vốn". Two
      // signed lines over time with a marker each, because the cost measure
      // and the cash-flow measure cross zero in different months — 14 and 18
      // on this fixture — and an endpoint table could not show that.
      kind: "refinanceCostPath",
      title: "Chuyển từ 11% sang 9% trên dư nợ 1,8 tỷ: hai thước đo",
      checkpoints: [0, 12, 24, 60],
      input: {
        balance: 1_800_000_000,
        currentRatePercent: 11,
        remainingMonths: 216,
        newRatePercent: 9,
        newTermMonths: 216,
        closingCosts: 20_000_000,
        earlySettlementFee: 20_000_000,
        horizonMonths: 60,
      },
    },
    visualReading:
      "Hai đường, hai thước đo khác nhau, và đó là toàn bộ bài học. Đường liền là TIẾT KIỆM CHI PHÍ — đã tính cả dư nợ còn lại — còn đường gạch là CHÊNH LỆCH TIỀN ĐÃ CHI, chỉ đếm tiền đã ra khỏi ví. Cả hai bắt đầu âm vì 40 triệu phí trả ngay ở tháng 0, rồi cắt lên trên mức 0 ở HAI tháng khác nhau: chi phí ở tháng 14, tiền đã chi ở tháng 18. Đừng đọc mốc này thay cho mốc kia — đường gạch vượt 0 chỉ nghĩa là bạn đã chi ra ít hơn, chưa nói gì về lợi ích kinh tế.",
    exercise: {
      title: "Thử với số của bạn",
      intro: "Mở công cụ Chuyển khoản vay và dùng số từ sao kê của bạn.",
      steps: [
        "Nhập “Dư nợ hiện tại” — lấy từ sao kê, không ước lượng.",
        "Nhập “Lãi suất hiện tại” và “Số tháng còn lại”.",
        "Nhập “Lãi suất mới” và “Kỳ hạn mới”. Để tách riêng tác động của lãi suất, thử đặt kỳ hạn mới bằng số tháng còn lại; khi khác kỳ hạn vẫn so tại cùng một tháng và tính cả dư nợ.",
        "Nhập “Phí tất toán khoản vay cũ” và “Phí một lần của khoản vay mới” riêng, không cộng trùng. Đặt “Tháng muốn so sánh” bằng 60 cho ví dụ này.",
      ],
      toolSlug: "tai-cap-von",
      change:
        "Đổi “Kỳ hạn mới” từ 216 lên 300, giữ “Tháng muốn so sánh” bằng 60. So cả tiết kiệm chi phí và dư nợ; khoản trả tháng thấp hơn có làm bạn bớt tốn không?",
      check:
        "Đổi “Tháng muốn so sánh” thành mốc dự định còn giữ khoản vay. Đọc tiết kiệm chi phí có tính dư nợ, không thay bằng dòng tiền. Kết quả chưa chiết khấu hoặc cộng phí tất toán có thể phát sinh tại chính mốc đó.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Mức phí thật trong hợp đồng hiện tại. Bài chỉ dùng phí giả định; bạn cần thay bằng số đã xác nhận.",
        "Bạn có đủ điều kiện để được khoản vay mới hay không. Đó là thẩm định, không phải phép tính.",
        "Lãi suất khoản vay mới có cố định hay không. Nếu nó cũng thả nổi thì phải thử lại bằng công cụ lãi thả nổi.",
        "Chi phí thời gian và giấy tờ của việc chuyển đổi.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Dùng cho MỘT khái niệm: phí trả nợ trước hạn là điều khoản có thật cần kiểm tra trong hợp đồng. Không lấy lãi suất, mức phí hay sản phẩm nào.",
      items: [SRC_BIDV_FEE, SRC_CFPB_COMPARE],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: ["lai-co-dinh-hay-tha-noi", "co-tien-du-tra-them-no-giam-bao-nhieu-lai"],
  },
];
