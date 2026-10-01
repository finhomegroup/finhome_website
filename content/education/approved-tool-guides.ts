// Full founder-approved editorial replacements (2026-09-23), on existing URLs.
// Screenshot evidence supplements, never replaces, the computed accessible visual.
import type { EducationArticle } from "@/content/education/types";

const MEDIA = "/images/education/tool-guides-20260923/";
const provenance = "Bài giáo dục FinHome có hỗ trợ AI, được founder duyệt nội dung trước xuất bản. Ví dụ giả lập; ảnh công cụ ngày 23/09/2026 minh họa các giả định đã nêu. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.";

export const APPROVED_C01: EducationArticle = {
  slug: "co-600-trieu-nen-tim-nha-tam-gia-nao", group: "BUDGET", planId: "C01",
  question: "Trước khi đi xem nhà, hãy tính xem mỗi tháng mình còn bao nhiêu",
  shortAnswer: [
    "Một căn nhà có thể vừa với số tiền ngân hàng cho vay, nhưng chưa chắc vừa với cuộc sống của gia đình bạn. Hãy bắt đầu từ ngân sách thực tế, trước khi bắt đầu đi xem nhà.",
    "Trước khi hỏi ngân hàng, có một câu nên hỏi chính mình: sau khi trả tiền nhà, gia đình còn đủ tiền để sống và tiếp tục để dành không?",
  ],
  shortAnswerEmphasis: ["chưa chắc vừa với cuộc sống của gia đình bạn", "đủ tiền để sống và tiếp tục để dành"],
  household: {
    title: "Gia đình trong ví dụ có những khoản nào?",
    items: [
      { label: "Thu nhập trước khấu trừ / tiền thực nhận", value: "45 / 40 triệu đồng mỗi tháng" },
      { label: "Sinh hoạt, chưa gồm nhà ở và nợ", value: "17 triệu đồng/tháng" },
      { label: "Nợ khác đang trả", value: "3 triệu đồng/tháng" },
      { label: "Muốn tiếp tục để dành", value: "5 triệu đồng/tháng" },
      { label: "Chi phí nhà ở khác, ngoài khoản vay", value: "2 triệu đồng/tháng" },
      { label: "Tích lũy / giữ lại dự phòng", value: "600 / 100 triệu đồng" },
      { label: "Lãi vay giả lập và kỳ hạn", value: "8,5%/năm không đổi trong 240 tháng" },
      { label: "Chi phí mua ngoài giá / tỷ lệ vay tối đa", value: "3% / 80% giá nhà (giả định)" },
      { label: "Giới hạn nợ nhà / tổng nợ trên thu nhập gộp", value: "40% / 50% (giả định)" },
    ],
    note: "Đây là một gia đình được đặt ra để minh họa, không phải mức chi tiêu ai cũng nên theo. Công cụ lấy tiền thực nhận trừ những khoản gia đình cần dùng. Các tỷ lệ 40%, 50% và 80% cũng chỉ là giả định để thử, không phải lời hứa cho vay hay mức an toàn của ngân hàng.",
  },
  sections: [
    {
      heading: "Cùng thu nhập, chưa chắc cùng ngân sách",
      paragraphs: [
        "Bạn thấy một căn hộ khá ưng. Đi làm thuận tiện, phòng khách nhiều ánh sáng, giá cũng có vẻ không quá xa khả năng. Câu hỏi tiếp theo thường là: “Mình vay có nổi không?”",
        "Hai gia đình cùng thực nhận 40 triệu đồng mỗi tháng có thể tìm nhà trong những tầm giá khác nhau. Một bên không có nợ, bên còn lại đang trả góp xe hoặc hỗ trợ người thân. Thu nhập chỉ là điểm bắt đầu.",
        "Hãy hình dung 40 triệu tiền về tài khoản được chia vào từng ngăn: ăn ở, nợ cũ, tiền để dành và tiền cho căn nhà. Đã bỏ vào ngăn này thì không thể dùng lại cho ngăn khác.",
        "Phép tính rất ngắn: 40 − 17 − 3 − 5 − 2 = 13 triệu. Đó là số còn lại để trả ngân hàng mỗi tháng, gồm tiền vay trả lại (gốc) và tiền lãi.",
      ],
      emphasis: ["Thu nhập chỉ là điểm bắt đầu"],
      results: { caption: "Ngân sách giả lập mỗi tháng", rows: [
        { label: "Thu nhập thực nhận", value: "40 triệu" },
        { label: "Sinh hoạt, chưa gồm nhà ở và nợ", value: "−17 triệu" },
        { label: "Nợ khác đang trả", value: "−3 triệu" },
        { label: "Muốn tiếp tục để dành", value: "−5 triệu" },
        { label: "Chi phí nhà ở khác, ngoài khoản vay", value: "−2 triệu" },
        { label: "Còn lại để trả gốc và lãi", value: "13 triệu" },
      ] },
      media: { src: `${MEDIA}01-budget-chart.jpg`, width: 753, height: 1004,
        alt: "Biểu đồ phân bổ 40 triệu: sinh hoạt 17 triệu, nợ khác 3 triệu, để dành 5 triệu, trả nợ nhà 13 triệu và chi phí nhà ở khác 2 triệu.",
        caption: "Hình 1. Công cụ thể hiện mỗi khoản tiền đi đâu. Các tỷ lệ là giả định của ví dụ, không phải mức ngân hàng đã phê duyệt. Số liệu đầy đủ nằm trong bảng phía trên." },
    },
    {
      heading: "15 triệu cho nhà ở không phải 15 triệu trả ngân hàng",
      paragraphs: [
        "15 triệu dành cho nhà ở không đồng nghĩa với 15 triệu dành riêng để trả ngân hàng.",
        "Gia đình có 15 triệu cho chuyện nhà ở. Nhưng vẫn cần 2 triệu trả các chi phí khác, nên chỉ còn 13 triệu đưa cho ngân hàng.",
        "Khi điền số của mình, đừng cộng phí quản lý, gửi xe hay điện nước hai lần nếu chúng đã nằm trong chi tiêu sinh hoạt. Mỗi khoản tiền chỉ được tính vào một ngăn.",
      ],
      emphasis: ["đừng cộng phí quản lý, gửi xe hay điện nước hai lần"],
    },
    {
      heading: "Có 600 triệu, không có nghĩa dùng cả 600 triệu trả trước",
      paragraphs: [
        "Hộ này có 600 triệu tích lũy và quyết định giữ riêng 100 triệu dự phòng. Còn 500 triệu cho giao dịch mua nhà, nhưng một phần vẫn phải dành cho chi phí mua ngoài giá.",
        "Với các con số trong ví dụ, công cụ cho tầm giá khoảng 1,94 tỷ đồng. Nghĩa là bạn có một mốc để bắt đầu tìm nhà, không phải lời khuyên phải mua nhà giá đó.",
        "Khoản vay khoảng 1,498 tỷ. Trong 500 triệu đưa vào giao dịch, khoảng 58,2 triệu dành cho chi phí mua; 441,8 triệu còn lại trả vào giá căn nhà. Khoản dự phòng 100 triệu vẫn được giữ riêng.",
        "Đó không phải lời khuyên vay hết mức. Nó là điểm bắt đầu để bạn loại bớt những căn quá xa khả năng, rồi kiểm tra thêm lãi suất, chi phí thực tế và điều kiện khoản vay.",
      ],
      emphasis: ["Khoản dự phòng 100 triệu vẫn được giữ riêng", "không phải lời khuyên vay hết mức"],
      media: { src: `${MEDIA}01-budget-result.jpg`, width: 753, height: 1004,
        alt: "Kết quả công cụ: tầm giá 1.939.806.716 đồng, số tiền vay 1.498.000.918 đồng, trả gốc và lãi 13 triệu mỗi tháng.",
        caption: "Hình 2. Kết quả chạy trên công cụ FinHome với đúng bộ giả định vừa nêu." },
    },
    {
      heading: "Dừng một chút: đối chiếu với gia đình bạn",
      paragraphs: [
        "Bạn đã tính đủ các khoản vẫn phải chi sau khi chuyển nhà chưa? Sau khi mua, bạn có muốn tiếp tục để dành mỗi tháng không? Nếu chi tiêu thiết yếu tăng thêm 2 triệu, tầm giá sẽ đổi ra sao?",
        "Hãy chạy một lần với số của mình, sau đó chỉ tăng ô chi tiêu thiết yếu thêm 2 triệu. Ghi lại hai tầm giá và xem công cụ báo giới hạn nào đang chặn. Thay một giả định mỗi lần sẽ giúp bạn hiểu nguyên nhân.",
      ],
      emphasis: ["Thay một giả định mỗi lần"],
    },
  ],
  visual: { kind: "affordabilityPrice", title: "Tầm giá của hộ giả lập gồm những gì", input: {
    mode: "household", monthlyIncome: 45_000_000, monthlyNetIncome: 40_000_000,
    essentialExpenses: 17_000_000, monthlyBuffer: 5_000_000, monthlyDebts: 3_000_000,
    monthlyHousingCosts: 2_000_000, downPayment: 600_000_000, cashReserve: 100_000_000,
    purchaseCostPercent: 3, assumedMaxLtvPercent: 80, housingRatioPercent: 40,
    totalDebtRatioPercent: 50, annualRatePercent: 8.5, termMonths: 240,
  } },
  visualReading: "Hai thanh nói về hai khoản khác nhau. Thanh trên là giá nhà khoảng 1,94 tỷ: một phần dùng tiền của bạn, phần còn lại đi vay. Thanh dưới là khoảng 58,2 triệu chi phí mua ngoài giá nhà. Tiền dự phòng 100 triệu được giữ riêng, không nằm trong hai thanh. Đây là kết quả từ các số trong ví dụ, không phải mức ngân hàng đã duyệt.",
  // Concept B, approved 2026-09-28; resized WebP of the generated source, no
  // edits. Since 2026-10-01 the AI web hero opens the article, so this figure
  // sits full-width in the section whose text keeps the reserve separate.
  illustration: {
    src: "/images/education/c01-home-cash-balance-720.webp",
    srcSet: "/images/education/c01-home-cash-balance-720.webp 720w, /images/education/c01-home-cash-balance-1200.webp 1200w",
    width: 1536, height: 1024,
    alt: "Hình minh họa 3D: một căn hộ thu nhỏ và một chiếc ví xanh cùng tiền xu đặt ở hai đầu tấm ván thăng bằng. Một hộp tiết kiệm có hình chiếc khiên đặt riêng dưới đất, bên ngoài tấm ván.",
    badge: "Hình minh họa",
    caption: "Căn nhà ở một đầu cân, tiền gia đình dành để mua ở đầu kia. Hộp nhỏ đứng ngoài cân là khoản dự phòng: giữ riêng cho lúc cần, không dùng để mua nhà. Hình chỉ gợi ý cách nghĩ, không thể hiện giá nhà hay mức vay.",
    layout: "full",
    inSection: "Có 600 triệu, không có nghĩa dùng cả 600 triệu trả trước",
  },
  exercise: {
    title: "Tự tính ngân sách và tầm giá nhà",
    intro: "Công cụ miễn phí trên website. Bài viết không mang sẵn dữ liệu sang công cụ; bạn cần nhập các giả định của mình.",
    steps: ["Chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?”.", "Nhập thu nhập gộp, thực nhận, nợ đang trả, chi phí thiết yếu, phần muốn để dành và chi phí nhà ở khác; không cộng trùng.", "Nhập tiền tích lũy và khoản giữ lại dự phòng riêng; kiểm tra lãi vay, kỳ hạn, chi phí mua và tỷ lệ vay giả định."],
    toolSlug: "kha-nang-mua-nha",
    change: "Chỉ tăng chi phí sinh hoạt thiết yếu thêm 2 triệu mỗi tháng, giữ nguyên các đầu vào còn lại và ghi lại hai tầm giá.",
    check: "Công cụ báo giới hạn nào đang chặn? Mức trả nợ còn để bạn sống và tiếp tục để dành như mong muốn không?",
  },
  limits: { title: "Trước khi dùng kết quả để quyết định", items: [
    "Mô phỏng không phải cam kết cho vay hoặc bảo đảm an toàn tài chính.",
    "Lãi suất trong ví dụ giữ nguyên suốt kỳ hạn; chưa phản ánh mọi khoản phí, thuế thu nhập, lạm phát hoặc thay đổi thu nhập.",
    "Kiểm tra điều khoản thực tế trước khi quyết định. Tầm giá là ngân sách theo giả định, không phải giá thị trường hay kết quả thẩm định.",
  ] },
  sources: { title: "Nguồn tham khảo cho khái niệm", intro: "Chỉ dùng nguyên tắc phân bổ tiền, không áp dụng tỷ lệ, chương trình hay quy định Hoa Kỳ cho Việt Nam.", items: [{
    label: "CFPB — lập ngân sách mua nhà và giữ lại khoản dự phòng",
    url: "https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/",
    note: "Nguồn giáo dục cho khái niệm lập ngân sách mua nhà và giữ khoản dự phòng. Không dùng như tiêu chuẩn tín dụng, mức chi tiêu hay quy định áp dụng tại Việt Nam.",
  }] }, provenance,
  nextSlugs: ["duoc-vay-khong-co-nghia-nen-vay-het", "vay-2-ty-moi-thang-tra-bao-nhieu", "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi"],
};

export const APPROVED_C03: EducationArticle = {
  slug: "het-uu-dai-khoan-tra-tang-bao-nhieu", group: "RESILIENCE", planId: "C03",
  question: "Vay mua nhà: đừng chỉ tính tháng đầu, hãy tính tháng hết ưu đãi",
  shortAnswer: [
    "Khoản trả năm đầu có thể vừa sức. Điều cần kiểm tra tiếp là khoản trả sau ưu đãi — và phần ngân sách còn lại của gia đình khi đó.",
    "Với khoản vay giả lập trong bài, khoản trả tăng từ 16,11 lên 20,48 triệu/tháng từ tháng 13, vượt ngân sách giả lập 18 triệu khoảng 2,48 triệu. Đây là kịch bản, không phải dự báo lãi suất.",
  ], shortAnswerEmphasis: ["khoản trả sau ưu đãi", "kịch bản, không phải dự báo lãi suất"],
  household: { title: "Tình huống giả lập", items: [
    { label: "Số tiền vay / kỳ hạn", value: "2 tỷ / 240 tháng" },
    { label: "12 tháng đầu", value: "7,5%/năm" },
    { label: "Từ tháng 13", value: "11%/năm, giữ nguyên phần còn lại" },
    { label: "Ngân sách trả gốc và lãi", value: "18 triệu đồng/tháng" },
    { label: "Cách tính", value: "Mỗi tháng trả cùng số tiền khi mức lãi chưa đổi" },
  ], note: "Các mức lãi là giả định để minh họa. Trong mỗi giai đoạn, tổng tiền gốc và lãi trả mỗi tháng bằng nhau. Khi lãi đổi, công cụ tính lại số tiền này. Đây không phải cách trả cùng một số tiền gốc mỗi tháng; chưa gồm thuế, phí, bảo hiểm và lạm phát." },
  sections: [
    { heading: "Cùng khoản vay, hai giai đoạn rất khác", paragraphs: [
      "Bạn xem một phương án vay, thấy khoản trả ban đầu thấp hơn mức mình có thể dành ra mỗi tháng. Cảm giác nhẹ nhõm ấy dễ khiến phần “lãi suất sau ưu đãi” trở thành dòng chữ đọc lướt.",
      "Nhưng nếu khoản vay kéo dài nhiều năm, con số của năm đầu chưa kể hết câu chuyện. Một phương án vừa ngân sách trong năm đầu có thể vượt ngân sách ở năm sau.",
    ], emphasis: ["con số của năm đầu chưa kể hết câu chuyện"], results: { caption: "Kết quả từ công cụ Khoản vay lãi thả nổi", rows: [
      { label: "Khoản trả trong 12 tháng đầu", value: "16,11 triệu/tháng" },
      { label: "Khoản trả từ tháng 13", value: "20,48 triệu/tháng" },
      { label: "Tăng so với thời gian ưu đãi", value: "4,37 triệu/tháng · 27,11%" },
      { label: "Vượt ngân sách 18 triệu từ tháng 13", value: "2,48 triệu/tháng" },
    ] }, media: { src: `${MEDIA}02-loan-chart.jpg`, width: 753, height: 1004,
      alt: "Đường khoản trả đi từ 16,1 lên 20,5 triệu ở tháng 13; đường ngân sách 18 triệu nằm giữa hai mức.",
      caption: "Hình 3. Đường liền là khoản trả; đường ngang nét đứt là ngân sách giả lập 18 triệu. Từ tháng 13, khoản trả vượt ngân sách. Đây là kết quả của kịch bản, không phải dự báo lãi suất." } },
    { heading: "Lãi tăng 3,5 điểm phần trăm không phải khoản trả tăng 3,5%", paragraphs: [
      "Trong ví dụ, mức lãi tăng từ 7,5% lên 11% là tăng 3,5 điểm phần trăm. Còn khoản trả tăng khoảng 27,11%. Hai con số đo hai việc khác nhau; không thể lấy khoản trả cũ cộng đơn giản 3,5% để ra khoản trả mới.",
      "Hãy nhìn tiền thật cần chuẩn bị: trước đây là 16,11 triệu, sau đó là 20,48 triệu mỗi tháng. Khoảng chênh 4,37 triệu mới là số gia đình cần tìm cách bù.",
      "Dư nợ là phần tiền vay bạn chưa trả hết — số tiền đã vay mà chưa được trả lại. Khi lãi đổi, công cụ nhìn phần nợ này và số tháng còn lại để tính lại khoản trả, không nhân khoản trả cũ với mức tăng của lãi suất.",
    ], emphasis: ["3,5 điểm phần trăm", "27,11%"] },
    { heading: "Đọc đường ngân sách trước khi đọc tổng tiền lãi", paragraphs: [
      "Biểu đồ không chỉ cho thấy khoản vay đắt hơn. Nó cho thấy thời điểm dòng tiền cần chuẩn bị thay đổi.",
      "Nếu mỗi tháng chỉ dành được 18 triệu, từ tháng 13 gia đình thiếu khoảng 2,48 triệu. Hãy coi đường ngân sách như vạch trên ví tiền: đường khoản trả vượt vạch thì cần tiền từ chỗ khác.",
      "Bạn có thể thử vay ít hơn, giảm khoản chi khác hoặc tính thêm nguồn thu. Nhưng chưa khả năng nào tự xảy ra chỉ vì được ghi trong kế hoạch. Nguồn bù phải thật sự có.",
      "Thử lãi cao hơn giúp bạn chuẩn bị, không có nghĩa đó là trường hợp xấu nhất. Ví dụ này không đoán lãi suất tương lai; nó chỉ trả lời “nếu như vậy thì sao?”.",
    ], emphasis: ["chưa khả năng nào tự xảy ra chỉ vì được ghi trong kế hoạch"] },
    { heading: "Bốn điều cần hỏi rõ trước khi chọn khoản vay", paragraphs: [
      "Thời gian ưu đãi kết thúc vào lúc nào? Sau đó lãi được xác định theo công thức nào và điều chỉnh bao lâu một lần?",
      "Gốc được trả theo lịch nào, có được hoãn trả gốc một thời gian không? Nếu có, đó là thời gian ân hạn; hãy hỏi rõ khi nào phải bắt đầu trả. Ngoài gốc và lãi, bạn còn phải chuẩn bị những khoản phí nào?",
    ], emphasis: ["điều chỉnh bao lâu một lần"] },
    { heading: "Thử với số của mình trước khi ký", paragraphs: [
      "Nhập khoản vay đang cân nhắc và ngân sách hằng tháng vào công cụ. Đọc khoản trả sau ưu đãi, rồi thử tăng riêng mức lãi sau ưu đãi thêm 1 điểm phần trăm.",
      "Khoản trả còn nằm dưới ngân sách không? Nếu không, phần thiếu sẽ lấy từ đâu? Bạn cần đổi điều gì trước khi ký, thay vì chờ tới lúc khoản trả tăng?",
    ], emphasis: ["tăng riêng mức lãi sau ưu đãi thêm 1 điểm phần trăm"] },
  ],
  visual: { kind: "floatingTimeline", title: "Khoản trả trước và sau khi hết ưu đãi", amount: 2_000_000_000, termMonths: 240, promoMonths: 12, promoRatePercent: 7.5, postRatePercent: 11, monthlyBudget: 18_000_000 },
  visualReading: "Đường liền là khoản trả: 16,11 triệu trong 12 tháng đầu, rồi lên 20,48 triệu từ tháng 13. Đường ngang nét đứt là ngân sách giả lập 18 triệu; khoảng vượt khoảng 2,48 triệu/tháng cần một nguồn bù thực tế. Biểu đồ thể hiện kịch bản bạn nhập, không phải dự báo hoặc chứng nhận an toàn.",
  exercise: { title: "Thử khoản trả khi hết ưu đãi", intro: "Dùng miễn phí trên web. Kết quả đầy đủ vẫn ở công cụ, không cần tải app để xem.", steps: ["Nhập số tiền vay và kỳ hạn đang cân nhắc.", "Nhập số tháng ưu đãi, lãi ưu đãi và lãi sau ưu đãi theo kịch bản muốn thử; hỏi ngân hàng về công thức thực tế.", "Nhập “Ngân sách bạn chịu được mỗi tháng”, rồi đọc khoản trả sau ưu đãi trên biểu đồ."], toolSlug: "lai-suat-tha-noi", change: "Tăng riêng mức lãi sau ưu đãi thêm 1 điểm phần trăm; giữ nguyên khoản vay, kỳ hạn và ngân sách để so sánh.", check: "Khoản trả còn dưới ngân sách không? Nếu vượt, nguồn bù thực tế là gì và bạn cần đổi điều gì trước khi ký?" },
  limits: { title: "Đối chiếu với hợp đồng thực tế", items: [
    "Hợp đồng có thể dùng lịch trả gốc đều, cách tính lãi theo ngày hoặc điều kiện khác với mô hình này.",
    "Hãy đối chiếu lịch trả thực tế do ngân hàng cung cấp; bài viết không khuyến nghị một khoản vay hay mức lãi cụ thể.",
    "Kịch bản chưa gồm thuế, phí, bảo hiểm và lạm phát; một mức lãi cao hơn không tự trở thành trường hợp xấu nhất.",
  ] }, sources: { title: "Nguồn tham khảo cho khái niệm", intro: "Đây là nguồn giáo dục của Hoa Kỳ; bài không áp dụng biểu mẫu hoặc quy định của Hoa Kỳ cho hợp đồng Việt Nam.", items: [{ label: "CFPB — hiểu khoản vay có lãi suất điều chỉnh", url: "https://www.consumerfinance.gov/owning-a-home/explore/adjustable-rate-mortgages/", note: "Nguồn cho khái niệm mức lãi và khoản trả có thể thay đổi sau giai đoạn ban đầu. Không phải nguồn cho mức lãi minh họa, dự báo hoặc điều kiện của một hợp đồng tại Việt Nam." }] }, provenance,
  nextSlugs: ["lai-co-dinh-hay-tha-noi", "hai-goi-vay-thang-thap-co-re-hon", "ho-30-trieu-het-uu-dai-co-con-tra-duoc"],
};

export const APPROVED_C08: EducationArticle = {
  slug: "tiep-tuc-thue-hay-mua-nha", group: "CHOICE", planId: "C08",
  question: "Thuê 15 triệu, trả góp khoảng 18 triệu: có nên mua luôn?",
  shortAnswer: [
    "“Thêm vài triệu mỗi tháng là có nhà của mình.” Phép so nghe đơn giản, nhưng còn bỏ qua tiền trả trước, chi phí sở hữu và một điều không ai biết chắc: giá nhà sau này.",
    "Nếu bạn đang phân vân giữa thuê và mua, không nhất thiết phải tìm một câu trả lời đúng cho mọi người. Điều hữu ích hơn là biết: với kế hoạch của mình, yếu tố nào khiến một phương án phù hợp hơn?",
  ], shortAnswerEmphasis: ["không ai biết chắc: giá nhà sau này", "với kế hoạch của mình"],
  household: { title: "Cùng một tình huống, chỉ đổi giả định giá nhà", items: [
    { label: "Giá nhà / trả trước / chi phí mua", value: "3 tỷ / 900 triệu / 100 triệu" },
    { label: "Lãi vay giả lập / kỳ hạn", value: "8,5%/năm không đổi / 240 tháng" },
    { label: "Chi phí sở hữu thêm so với thuê", value: "2,5 triệu/tháng" },
    { label: "Phí bán cuối kỳ", value: "3% giá bán (giả định)" },
    { label: "Tiền thuê lúc đầu / tăng tiền thuê", value: "15 triệu/tháng / 4%/năm" },
    { label: "Cọc thuê / vốn người thuê đầu tư", value: "30 triệu / 970 triệu" },
    { label: "Lợi suất giả lập / thời gian so sánh", value: "6%/năm / 120 tháng" },
    { label: "Các giả định tăng giá nhà", value: "0%, 5%, 8%/năm" },
  ], note: "Tất cả mức giá, lãi, phí và lợi suất đều là giả định minh họa. Mô hình không đem chênh lệch dòng tiền hằng tháng của bên nào đi đầu tư; không bảo đảm khả năng bán nhà hoặc mức sinh lời. Cọc thuê được giả định hoàn lại đầy đủ cuối kỳ." },
  sections: [
    { heading: "So khoản trả hằng tháng là cần, nhưng chưa đủ", paragraphs: [
      "Người mua cần tiền trả trước và tiền chăm sóc căn nhà. Người thuê chưa dùng số tiền đó mua nhà nên vẫn có thể giữ hoặc đầu tư. Tiền có thể sinh lời, nhưng lợi suất không được bảo đảm — nghĩa là không chắc sẽ lãi bao nhiêu.",
      "Ở chiều ngược lại, khoản trả ngân hàng có cả gốc và lãi. Trả gốc làm giảm khoản nợ, nên không thể xem toàn bộ tiền trả ngân hàng là khoản mất đi giống tiền lãi.",
      "Để so công bằng, hãy chọn cùng một mốc, chẳng hạn 10 năm. Hỏi hai câu: đã bỏ vào bao nhiêu tiền, và lúc đó còn lại bao nhiêu? Lấy số đã bỏ vào trừ phần còn lại là cách hiểu đơn giản của “chi phí ròng”.",
      "Với người mua, phần còn lại là tiền bán nhà, trừ khoản nợ chưa trả hết và phí bán. Vì vậy, không thể coi toàn bộ giá bán là tiền mình giữ được.",
      "Với người thuê, công cụ tính cùng số tiền ban đầu, cộng tiền thuê đã trả, rồi trừ khoản đầu tư còn lại và tiền cọc được hoàn. Khoản đầu tư gồm cả vốn ban đầu lẫn phần lãi giả định; không chỉ có tiền lãi.",
      "Vì vậy, công cụ so chi phí ròng trong cùng một khoảng thời gian, thay vì chỉ so hai khoản tiền tháng. Mỗi bên đều được tính khoản đã bỏ vào và khoản còn giữ lại, không bỏ quên tiền ban đầu của bên nào.",
    ], emphasis: ["chi phí ròng trong cùng một khoảng thời gian"] },
    { heading: "Cùng một tình huống, chỉ đổi giả định giá nhà", paragraphs: [
      "Hai bên cùng bắt đầu với 1 tỷ tiền mặt. Người mua dùng 900 triệu trả trước và 100 triệu cho chi phí mua căn nhà giá 3 tỷ. Phần thiếu thì vay, với lãi giả định 8,5%/năm không đổi trong 20 năm.",
      "Khoản trả ngân hàng khoảng 18,22 triệu/tháng. Người mua còn trả thêm 2,5 triệu/tháng cho căn nhà so với người thuê. Nếu bán ở cuối khoảng so sánh, giả sử phí bán bằng 3% giá bán.",
      "Người thuê trả 15 triệu/tháng lúc đầu; giả sử tiền thuê tăng 4% mỗi năm. Trong cùng 1 tỷ ban đầu, người thuê còn 970 triệu sau khi đặt cọc 30 triệu.",
      "Công cụ giả sử 970 triệu này sinh lời 6%/năm và tiền cọc được trả lại đầy đủ cuối kỳ. So sánh trong 10 năm. Cả mức sinh lời lẫn việc hoàn cọc đều cần kiểm tra với tình huống thực tế, không phải tiền chắc chắn nhận được.",
    ], emphasis: ["người thuê còn 970 triệu sau khi đặt cọc"] },
    { heading: "Chỉ đổi một ô, kết luận đã khác", paragraphs: [
      "Công cụ không “đổi ý”. Kết luận đổi vì giả định đã đổi.",
      "Điều đáng mang theo sau phép tính không phải “mua chắc chắn tốt hơn” hay “thuê luôn rẻ hơn”, mà là: quyết định này đang phụ thuộc bao nhiêu vào kỳ vọng tăng giá?",
      "Thời gian cũng quan trọng. Nếu bạn dự định ở năm năm nhưng lại tính trên mười năm, bạn đang trả lời một câu hỏi khác. Những khoản phí mua, bán và chuyển chỗ ở cần được xét đúng với kế hoạch của mình.",
    ], emphasis: ["Kết luận đổi vì giả định đã đổi"], results: { caption: "Kết quả sau 10 năm; mọi đầu vào khác giữ nguyên", rows: [
      { label: "Giá nhà tăng giả lập 5%/năm", value: "Mua thấp hơn thuê khoảng 1,177 tỷ" },
      { label: "Giá nhà không tăng", value: "Thuê thấp hơn mua khoảng 652,8 triệu" },
    ] }, media: { src: `${MEDIA}03-rent-buy-chart.jpg`, width: 753, height: 1004,
      alt: "Ba đường tăng giá 0%, 5%, 8% mỗi năm. Ở tháng 120, đường 0% nằm dưới mức hòa vốn, còn đường 5% và 8% nằm trên. Số dương là mua có chi phí ròng thấp hơn; số âm là thuê thấp hơn.",
      caption: "Hình 4. Mỗi đường là một giả định tăng giá nhà. Không đường nào được gán xác suất cao hơn. Đường 8% mở rộng phép thử, không phải mức tăng được kỳ vọng. Bảng phía trên nêu hai kết quả chính để đọc nhanh." } },
    { heading: "Có những điều biểu đồ không quyết định thay bạn", paragraphs: [
      "Biểu đồ không biết con bạn học ở đâu, bạn đi làm bao xa hay có thể sắp đổi việc. Bạn có thể chấp nhận tốn hơn để có nơi ở ổn định — miễn là nhìn rõ phần đánh đổi.",
      "Trước khi chọn, thử hỏi: Nếu giá nhà không tăng, tôi có vẫn muốn mua căn này để ở không? Tôi có thật sự ở lâu như số năm đã nhập không?",
      "Nếu tiếp tục thuê, tôi sẽ làm gì với tiền đang giữ? Mức lời giả định có phù hợp với rủi ro tôi chấp nhận không? Đây là tiền của mình, không nên chọn số đẹp chỉ để phép tính dễ chịu hơn.",
      "Hãy chạy công cụ với giả định của bạn, rồi đổi riêng tăng giá nhà về 0%. Tiếp đó mới thay thời gian so sánh. Ghi lại ô nào làm kết luận đảo chiều — đó là điều cần tìm hiểu kỹ hơn.",
    ], emphasis: ["miễn là nhìn rõ phần đánh đổi", "đổi riêng tăng giá nhà về 0%"] },
  ],
  visual: { kind: "rentBuyScenarios", title: "Mua lợi hơn thuê bao nhiêu, theo thời gian và theo giả định giá", growthPercents: [0, 5, 8], input: {
    price: 3_000_000_000, downPayment: 900_000_000, purchaseCosts: 100_000_000,
    annualRatePercent: 8.5, termMonths: 240, monthlyOwnerCosts: 2_500_000,
    priceGrowthPercent: 5, sellingCostPercent: 3, monthlyRent: 15_000_000,
    rentGrowthPercent: 4, rentDeposit: 30_000_000, investmentReturnPercent: 6, horizonMonths: 120,
  } },
  visualReading: "Mỗi đường thử một mức tăng giá nhà: 0%, 5%, 8%/năm. Nằm trên vạch 0 nghĩa là mua tốn ít hơn; dưới vạch 0 nghĩa là thuê tốn ít hơn, sau khi đã tính phần tiền còn lại của mỗi bên. Ở tháng 120, tức hết 10 năm, giá không tăng thì thuê ít tốn hơn khoảng 652,8 triệu; giá tăng 5%/năm thì mua ít tốn hơn khoảng 1,177 tỷ. Ba đường là KỊCH BẢN để thử, không phải khoảng tin cậy hay dự báo; 8% không phải mức tăng được hứa hẹn.",
  exercise: {
    title: "So sánh thuê và mua theo giả định của bạn",
    intro: "Công cụ miễn phí. Xem đủ giả định và giới hạn trước khi dùng kết quả để cân nhắc.",
    steps: [
      "Nhập “Giá nhà”, “Tiền trả trước”, “Phí mua một lần”, “Lãi suất vay” và “Kỳ hạn vay”. Kỳ hạn tính bằng tháng: 20 năm là 240 tháng.",
      "Nhập “Tiền thuê mỗi tháng”, tiền cọc và chi phí sở hữu thêm. Kiểm tra “Giá nhà tăng”, “Tiền thuê tăng” và “Lợi nhuận đầu tư” — đây đều là số bạn giả định, không phải dự báo.",
      "Ở ô “So sánh trong”, nhập số tháng bạn định ở hoặc so sánh: 5 năm là 60 tháng, 10 năm là 120 tháng. Đọc kết quả cùng các giả định.",
    ],
    toolSlug: "thue-hay-mua",
    change: "Đổi riêng “Giá nhà tăng” về 0%, rồi mới thay “So sánh trong”. Bạn có thể thử từ 60 lên 120 rồi 180 tháng để thấy khác biệt giữa ở 5, 10 và 15 năm. Ghi lại ô nào làm kết luận đảo chiều.",
    check: "Nếu giá nhà không tăng, bạn còn muốn mua căn này để ở không? Lợi suất giả định có phù hợp rủi ro bạn chấp nhận không?",
  },
  limits: { title: "Thử lại giả định trước khi chọn thuê hay mua", items: [
    "Đây là phép so chi phí ròng theo mô hình, không phải dự báo tài sản hay khuyến nghị đầu tư.",
    "Chưa tính lạm phát, thuế thu nhập và chi phí chuyển nhà ngoài các khoản đã nhập.",
    "Thay giả định lợi suất, lãi vay, giá nhà hoặc thời gian đều có thể thay đổi kết quả. Không bảo đảm khả năng bán nhà, lợi suất hay việc hoàn đủ tiền cọc theo hợp đồng thực tế.",
  ] }, sources: { title: "Nguồn số liệu", intro: "Không sử dụng số liệu thị trường hay dự báo bên ngoài.", items: [{ label: "Công cụ Thuê hay mua của FinHome", url: "https://www.finhome.group/cong-cu/thue-hay-mua/", note: "Chạy trực tiếp công cụ với bộ giả định trong bài, rồi đổi tăng giá nhà từ 5% về 0%. Công thức và giới hạn được trình bày trên trang công cụ; số liệu là kết quả mô phỏng, không phải quan sát thị trường." }] }, provenance,
  nextSlugs: ["duoc-vay-khong-co-nghia-nen-vay-het", "hai-goi-vay-thang-thap-co-re-hon"],
};
