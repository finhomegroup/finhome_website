// "Mua nhà bằng con số", articles C01–C06.
//
// Original AI-assisted draft. Visuals use the declared inputs; prose requires
// separate semantic review and selected numerical regression fixtures.
// Tests do not establish professional sign-off or every narrative claim.
//
// Nothing here quotes a current bank rate, fee schedule or regulation.

import type { EducationArticle } from "@/content/education/types";
import { APPROVED_C01, APPROVED_C03 } from "@/content/education/approved-tool-guides";

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
  APPROVED_C01,

  // ------------------------------------------------------------------ C02
  {
    slug: "vay-2-ty-moi-thang-tra-bao-nhieu",
    group: "PAYMENT",
    planId: "C02",
    question: "Vay 2 tỷ mua nhà, mỗi tháng thực sự phải chuẩn bị bao nhiêu?",
    shortAnswer: [
      "Trong ví dụ vay 2 tỷ, lãi giữ nguyên 8,5%/năm và trả góp đều trong 20 năm, khoản trả theo lịch khoảng 17,4 triệu mỗi tháng.",
      "“Khoản trả theo lịch” và “tiền ra khỏi ví” là hai con số khác nhau. Nếu chọn trả thêm 2 triệu gốc, bạn cần khoảng 19,4 triệu mỗi tháng, chưa kể chi phí nhà ở như quản lý và bảo hiểm. Tháng cuối chỉ trả phần nợ và lãi còn lại.",
    ],
    // The instalment is not the month's cash out. The example's own terms are
    // emphasised with it, so the figure never travels without them.
    shortAnswerEmphasis: [
      "“Khoản trả theo lịch” và “tiền ra khỏi ví” là hai con số khác nhau",
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
        "Khoản vay giả lập để minh họa. Lãi suất giữ nguyên 240 tháng là giả định của mô hình, không phải khẳng định hợp đồng của bạn áp dụng như vậy. Bài về khoản trả khi hết ưu đãi trình bày trường hợp mức lãi thay đổi.",
    },
    sections: [
      {
        // A heading is a claim, not a label: a reader who scans only the
        // headings should still learn that the instalment is one of three
        // numbers rather than the number.
        heading: "Tách khoản trả theo lịch, trả thêm và chi phí nhà ở",
        paragraphs: [
          "Khoản trả theo lịch khoảng 17,4 triệu gồm tiền gốc và tiền lãi. Khi lập kế hoạch thật, hãy lấy lịch ngân hàng cấp để đối chiếu với kết quả mô phỏng.",
          "Gia đình trong bài chọn trả thêm 2 triệu gốc, nên cần khoảng 19,4 triệu mỗi tháng cho khoản vay. Trả thêm là quyền chọn của bạn, không phải nghĩa vụ; hãy kiểm tra hợp đồng có cho phép và có thu phí hay không.",
          "Ngoài khoản vay, bạn vẫn cần tiền cho quản lý, bảo hiểm và các chi phí nhà ở khác. Cộng các khoản này riêng để biết tổng tiền cần chuẩn bị.",
          "Trong lịch trả thêm này, khoản vay kết thúc ở tháng 187, sớm 53 tháng. Tháng cuối còn khoảng 9,5 triệu; tổng lãi giảm khoảng 555,7 triệu — trước phí trả nợ trước hạn mà công cụ chưa tính.",
        ],
        results: { caption: "Chi tiết lịch trả góp đều, có trả thêm 2 triệu mỗi tháng", rows: [
          { label: "Khoản trả theo lịch mỗi tháng", value: "17.356.465 ₫" },
          { label: "Khoản vay và phần trả thêm mỗi tháng", value: "19.356.465 ₫" },
          { label: "Khoản trả cuối, tháng 187", value: "9.549.208 ₫" },
          { label: "Lãi giảm trước phí trả nợ trước hạn", value: "555.699.884 ₫" },
        ] },
        emphasis: [
          "Trả thêm là quyền chọn của bạn, không phải nghĩa vụ",
          "Cộng các khoản này riêng",
          "trước phí trả nợ trước hạn",
        ],
      },
      {
        heading: "Vì sao phần lãi lớn hơn phần gốc trong những năm đầu",
        paragraphs: [
          "Trong khoản trả theo lịch tháng đầu, khoảng 14,2 triệu là lãi và 3,2 triệu là gốc, chưa kể 2 triệu gốc tự trả thêm. Lãi được tính trên dư nợ, tức phần gốc còn nợ; lúc bắt đầu, con số đó là 2 tỷ.",
          "Tỷ trọng gốc và lãi phụ thuộc cả lãi suất lẫn kỳ hạn. Trong ví dụ 8,5% và 240 tháng này, khoản trả đầu kỳ chủ yếu là lãi. Khi giữ nguyên số tiền vay, kỳ hạn và cách trả góp đều, lãi thấp hơn cho phần gốc tháng đầu LỚN hơn. Ở mức lãi 0%, toàn bộ khoản trả là gốc.",
          "Hệ quả thực tế: nếu bạn định bán nhà sau vài năm, hãy nhìn cột dư nợ trong biểu đồ chứ không nhìn tổng số tiền đã trả. Đã trả nhiều không có nghĩa là đã trả được nhiều gốc.",
        ],
        results: { caption: "Khoản trả theo lịch tháng đầu, chưa gồm trả thêm", rows: [
          { label: "Lãi tháng đầu", value: "14.166.667 ₫" },
          { label: "Gốc trong khoản trả theo lịch", value: "3.189.798 ₫" },
        ] },
        emphasis: [
          "Lãi được tính trên dư nợ",
          "lãi thấp hơn cho phần gốc tháng đầu LỚN hơn",
          "Đã trả nhiều không có nghĩa là đã trả được nhiều gốc",
        ],
      },
      {
        heading: "Trả góp đều hay trả gốc đều: đánh đổi giữa tháng đầu và tổng lãi",
        paragraphs: [
          "Để so hai cách trả, tạm đặt khoản trả thêm về 0 và giữ nguyên mức lãi. Trả góp đều giữ khoản trả theo lịch khoảng 17,4 triệu mỗi tháng, ngoại trừ làm tròn hoặc kỳ cuối. Trả gốc đều chia gốc thành 240 phần bằng nhau rồi cộng lãi trên dư nợ còn lại, nên tháng đầu khoảng 22,5 triệu và giảm dần về sau.",
          "Với cùng khoản vay và đều không trả thêm, trả gốc đều tốn ít lãi hơn: khoảng 1,71 tỷ so với 2,17 tỷ. Đổi lại, phương án này đòi hỏi tháng đầu nặng hơn gần 30%. Hãy cân nhắc cả tổng lãi lẫn khả năng trả trong những năm đầu.",
          "Hãy hỏi ngân hàng hợp đồng của bạn dùng cách nào, rồi chọn đúng cách đó trong công cụ. Hai cách cho hai con số và không có cách nào là mặc định đúng.",
        ],
        results: { caption: "So hai cách trả khi không trả thêm gốc, cùng kỳ hạn và mức lãi", rows: [
          { label: "Tháng đầu — trả gốc đều", value: "22.500.000 ₫" },
          { label: "Tổng lãi — trả gốc đều", value: "1.707.083.333 ₫" },
          { label: "Tổng lãi — trả góp đều", value: "2.165.551.520 ₫" },
        ] },
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
        "Mở công cụ Tính khoản vay mua nhà và thử với khoản vay bạn đang cân nhắc.",
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
      title: "Đối chiếu trước khi quyết định",
      items: [
        "Phí trả nợ trước hạn. Công cụ chưa tính, và mức phí do hợp đồng của bạn quy định — có hợp đồng không thu.",
        "Lãi suất sau thời gian ưu đãi, nếu hợp đồng của bạn có ưu đãi. Xem bài về khoản trả khi hết ưu đãi ở phần đọc tiếp.",
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
      "Bài giáo dục FinHome được soạn với hỗ trợ AI, dùng ví dụ giả lập và biểu đồ tính từ công cụ. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "vay-20-nam-hay-25-nam",
      "o-chung-cu-ton-them-bao-nhieu-moi-thang",
    ],
  },

  // ------------------------------------------------------------------ C03
  APPROVED_C03,

  // ------------------------------------------------------------------ C04
  {
    slug: "du-tien-tra-truoc-sau-3-nam",
    group: "SAVING",
    planId: "C04",
    question: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
    shortAnswer: [
      "Với 100 triệu đang có, để đạt 500 triệu sau 3 năm, bạn cần góp khoảng 9,7 triệu mỗi tháng nếu lãi giữ ở mức giả định 6%/năm và góp cuối tháng.",
      "Nếu lãi là 0%, mức góp cần tăng lên khoảng 11,1 triệu. Phần chênh lệch nhờ lãi là giả định, không phải cam kết. Phần bạn kiểm soát được là mức góp.",
    ],
    // The controllable lever against the uncertain one, with the 0% reading
    // that shows how much of the plan rests on an assumption.
    shortAnswerEmphasis: [
      "giả định, không phải cam kết",
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
        heading: "Mức góp có vừa với khoản tiền còn lại mỗi tháng?",
        paragraphs: [
          "Sau chi phí sinh hoạt, trả nợ và dự phòng, bạn có đều đặn để dành được khoảng 9,7 triệu mỗi tháng không? Đây là mức góp cần thiết trong giả định của bài để đạt 500 triệu sau 36 tháng.",
          "Nếu mức đó quá cao, hãy thử kéo dài thời gian hoặc giảm mục tiêu tiền mặt. Giảm mục tiêu cần đi cùng một kế hoạch mua nhà khác; nếu bù bằng vay thêm, bạn phải kiểm tra lại khoản trả nợ mỗi tháng.",
          "Chạy “Mỗi tháng cần góp bao nhiêu”, rồi chạy “Mất bao lâu để đạt mục tiêu” với mức góp bạn thực sự làm được. Hai kết quả giúp bạn chọn giữa đổi mức góp, thời hạn và mục tiêu.",
          "Các số triệu trong lời giải đã làm tròn cho dễ đọc. Khi đặt lịch chuyển tiền, dùng mức chi tiết trong bảng để tránh góp thiếu so với kế hoạch.",
        ],
        results: { caption: "Mức góp cuối tháng để đạt 500 triệu sau 36 tháng", rows: [
          { label: "Lãi giả định 6%/năm danh nghĩa", value: "9.668.775 ₫/tháng" },
          { label: "Lãi 0%/năm", value: "11.111.111 ₫/tháng" },
        ] },
        emphasis: [
          "mức góp cần thiết trong giả định của bài",
          "mức góp bạn thực sự làm được",
        ],
      },
      {
        heading: "Lãi giúp được ít hơn bạn tưởng trong 3 năm",
        paragraphs: [
          "Trong ví dụ này, tổng tiền bạn tự bỏ vào khoảng 448,1 triệu và phần do lãi khoảng 51,9 triệu — khoảng 10,4% số tiền cuối kỳ. Trong biểu đồ, đó là khoảng cách giữa hai đường.",
          "Ba năm là quãng ngắn, nên lãi kép chưa có thời gian làm nhiều. Với mục tiêu ngắn hạn, phần quyết định gần như toàn bộ là mức góp — không phải việc chọn được sản phẩm lãi cao hơn 1%.",
          "Điều đó cũng có nghĩa: với tiền sắp dùng để mua nhà, đừng đánh đổi thanh khoản để lấy thêm chút lãi. Nếu đến lúc cần mà tiền đang bị khóa, hoặc đang lỗ vì thị trường, thì cái mất lớn hơn cái được rất nhiều.",
        ],
        results: { caption: "Số tiền ở cuối tháng 36, với lãi giả định 6%/năm", rows: [
          { label: "Vốn ban đầu và tiền tự góp", value: "448.075.899 ₫" },
          { label: "Phần lãi tích lũy", value: "51.924.101 ₫" },
        ] },
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
      "Hai đường: đường liền là số dư, đường gạch là phần tiền bạn tự góp. Chỉ ĐƯỜNG LIỀN kết thúc ở mục tiêu 500 triệu; đường gạch dừng ở khoảng 448,1 triệu. Khoảng cách 51,9 triệu là phần do lãi giả định. Biểu đồ này GIẢI RA MỨC GÓP cần thiết chứ không dự báo số dư: đặt lãi về 0 thì mức góp tăng lên khoảng 11,1 triệu mỗi tháng, đường gạch trùng với đường liền và cả hai cùng kết thúc ở 500 triệu.",
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
      title: "Đối chiếu trước khi quyết định",
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
      "Bài giáo dục FinHome được soạn với hỗ trợ AI, dùng ví dụ giả lập và biểu đồ tính từ công cụ. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "gop-them-2-trieu-dat-muc-tieu-som-bao-lau",
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
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
      "Hãy đặt hai báo giá cạnh nhau với cùng số tiền vay và cùng thời điểm đánh giá. Xem cả chi phí vay — lãi cộng phí — lẫn khoản trả hằng tháng: một con số cho biết tốn bao nhiêu, con số kia cho biết ngân sách có chịu được không.",
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
        heading: "Cùng số tiền vay và mốc thời gian giúp so báo giá rõ hơn",
        paragraphs: [
          "Để tách riêng tác động của lãi, phí và kỳ hạn, hai gói phải được tính trên cùng số tiền vay. Báo giá 1,8 tỷ có thể trả ít hơn báo giá 2 tỷ đơn giản vì bạn vay ít hơn; nếu muốn so hai kế hoạch đó, cần tính thêm phần tiền tự có phải bù.",
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
          "Nếu bạn dự định bán nhà hoặc đổi khoản vay sau 5 năm, hãy đặt mốc ở tháng thứ 60. Công cụ so tổng khoản đã trả, phí và dư nợ còn lại tại mốc đó — thứ tự có thể đổi khi lãi, phí hoặc kỳ hạn khác nhau. Phần dư nợ giúp bạn thấy một khoản trả nhẹ hơn có đi kèm nhiều nợ còn lại hơn hay không.",
          "Hãy chạy cả hai mốc: mốc bạn thật sự dự kiến giữ, và cả kỳ hạn. Nếu hai mốc cho hai người thắng khác nhau, công cụ sẽ nói ra — và lựa chọn của bạn nên theo mốc gần với kế hoạch thật của bạn.",
        ],
        emphasis: [
          "Nếu bạn dự định bán nhà hoặc đổi khoản vay sau 5 năm",
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
      title: "Đối chiếu trước khi quyết định",
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
      "Bài giáo dục FinHome được soạn với hỗ trợ AI, dùng ví dụ giả lập và biểu đồ tính từ công cụ. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: ["vay-20-nam-hay-25-nam", "lai-co-dinh-hay-tha-noi", "lai-suat-quang-cao-va-chi-phi-vay-that"],
  },

  // ------------------------------------------------------------------ C06
  {
    slug: "duoc-vay-khong-co-nghia-nen-vay-het",
    group: "BUDGET",
    planId: "C06",
    question: "Được vay tới mức đó có nghĩa là nên vay hết không?",
    shortAnswer: [
      "Không. Hãy bắt đầu từ tiền thực nhận, trừ sinh hoạt, nợ đang trả và phần muốn để dành. Trong ví dụ này, gia đình còn 18 triệu mỗi tháng cho khoản vay mua nhà, dù phép tính theo tỷ lệ giả định cho trần 20 triệu.",
      "Trần theo tỷ lệ không thay thế ngân sách của gia đình. Cả hai con số trong bài đều là minh họa, không phải mức ngân hàng đã duyệt hay bảo đảm rằng khoản vay phù hợp với bạn.",
    ],
    // A ratio ceiling is not a spendable budget. The emphasis keeps the two
    // phrases that say where each number comes from, plus the limit on what
    // the gap proves.
    shortAnswerEmphasis: [
      "Trần theo tỷ lệ không thay thế ngân sách của gia đình",
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
          "Ngân sách tính trên thu nhập THỰC NHẬN: 44 triệu trừ 18 triệu sinh hoạt, 5 triệu nợ đang trả và 3 triệu muốn để dành, còn 18 triệu cho khoản vay nhà. Mỗi khoản được trừ đúng một lần; bốn phần trên biểu đồ cộng lại bằng 44 triệu.",
          "Vì 18 triệu thấp hơn 20 triệu, chính hộ là giới hạn đang chặn trong ví dụ này. Không suy ra ngân hàng sẵn sàng cho vay mức đó; khi lập kế hoạch, còn cần thử trường hợp thu nhập giảm hoặc chi phí tăng.",
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
          "Nếu để trống chi phí sinh hoạt, kết quả là GIỚI HẠN TRÊN, không phải ngân sách. Trong ví dụ này, bỏ cả sinh hoạt và phần để dành khiến kết quả quay về trần 20 triệu, dù gia đình vẫn cần tiền để sống.",
          "Chỉ nhập 0 khi khoản chi thực sự bằng 0: chưa biết và bằng 0 là hai trạng thái khác nhau. Ước lượng một con số vẫn tốt hơn để trống; hãy xem lại ba tháng chi tiêu gần nhất, nhập phần thiết yếu rồi thử thêm một mức cao hơn.",
          "Nhớ chia các khoản chắc chắn phải chi hằng năm, như học phí, thành phần để dành mỗi tháng nếu chúng chưa nằm trong số chi tiêu bạn nhập.",
        ],
        emphasis: [
          "kết quả là GIỚI HẠN TRÊN, không phải ngân sách",
          "chưa biết và bằng 0 là hai trạng thái khác nhau",
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
      "Hai thanh cạnh nhau, và chúng được tính từ hai thứ khác nhau. Thanh “Thu nhập thực nhận” chia hết 44 triệu thành sinh hoạt, nợ đang trả, phần để dành và khoản trả nhà, nên tổng luôn khớp thu nhập và không khoản nào bị trừ hai lần. Thanh “Trần theo giả định của bạn” suy ra từ hai tỷ lệ áp lên thu nhập GỘP, và nó không biết hộ tiêu bao nhiêu. Ở ví dụ này ngân sách hộ 18 triệu thấp hơn trần 20 triệu, nên chính hộ là giới hạn đang chặn — và không thanh nào là mức ngân hàng đã đồng ý. Lưu ý khi đọc: sáu mục trong ký hiệu chỉ có bốn màu, nên hai cặp mục dùng chung màu; bảng số liệu dưới hình là chỗ đọc chắc chắn.",
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
      title: "Đối chiếu trước khi quyết định",
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
      "Bài giáo dục FinHome được soạn với hỗ trợ AI, dùng ví dụ giả lập và biểu đồ tính từ công cụ. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "tiep-tuc-thue-hay-mua-nha",
      "o-chung-cu-ton-them-bao-nhieu-moi-thang",
    ],
  },
];
