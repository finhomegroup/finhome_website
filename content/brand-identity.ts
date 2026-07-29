// Vietnamese adaptation of docs/finhome-identity.pdf — vision, mission, core
// values and operating principles for the /tam-nhin-su-menh page.

export type CoreValue = {
  readonly title: string;
  readonly tagline: string;
  readonly behaviors: readonly string[];
};

export type OperatingPrinciple = {
  readonly title: string;
  readonly detail: string;
};

export const BRAND_IDENTITY = {
  backLabel: "Quay lại trang chủ",
  eyebrow: "Tầm nhìn & Sứ mệnh",
  northStarLabel: "Kim chỉ nam",
  northStarHeadline: "Mua nhà an toàn, minh bạch, đúng thời điểm.",
  northStar:
    "Trao quyền cho mọi người mua nhà xây dựng tài sản một cách an toàn — mỗi quyết định đều dựa trên giá trị thực, tài chính bền vững, đúng thời điểm và pháp lý minh bạch.",

  pillars: [
    {
      title: "Mục đích",
      body: "Biến việc mua nhà từ một canh bạc tài chính thành một quyết định tự tin, dựa trên dữ liệu — trao cho mọi người Việt sự rõ ràng để tránh bẫy nợ và xây dựng sự an tâm tài chính lâu dài.",
    },
    {
      title: "Tầm nhìn",
      body: "Đến năm 2030, sở hữu nhà bền vững, minh bạch và có trách nhiệm sẽ là chuẩn mực tại Việt Nam — được thúc đẩy bởi dữ liệu rõ ràng, tài chính có kỷ luật và niềm tin giữa người mua, ngân hàng và chủ đầu tư.",
    },
    {
      title: "Sứ mệnh",
      body: "Chúng tôi giúp các quyết định bất động sản trở nên đơn giản, minh bạch và an toàn về tài chính cho tất cả mọi người — người mua, nhà đầu tư, ngân hàng và chủ đầu tư — qua nền tảng Real Estate Decision Intelligence, vận hành bởi dữ liệu đã kiểm chứng, mô hình đánh giá khả năng chi trả và gợi ý hành động thay thế đầu cơ bằng sự rõ ràng.",
    },
  ] as const,

  valuesTitle: "Giá trị cốt lõi & Hành động",
  valuesSubtitle: "Giá trị là điều chúng tôi tin. Hành động là cách chúng tôi làm khi không ai nhìn thấy.",
  values: [
    {
      title: "Minh bạch trên hết",
      tagline: "Truth Beats Polish",
      behaviors: [
        "Dùng dữ liệu đã kiểm chứng trước khi đưa ra ý kiến.",
        "Nói sự thật, dù điều đó không dễ nghe.",
        "Chia sẻ cả tiến bộ và sai sót.",
      ],
    },
    {
      title: "An toàn là sức mạnh",
      tagline: "Protect Before You Scale",
      behaviors: [
        "Kiểm chứng trước khi mở rộng quy mô.",
        "Đo thành công bằng sự bảo vệ mang lại cho người dùng.",
        "Thiết kế cho sự bền vững, không phải đầu cơ.",
      ],
    },
    {
      title: "Trao quyền qua thấu hiểu",
      tagline: "Simplicity Builds Confidence",
      behaviors: [
        "Lắng nghe trước khi tư vấn.",
        "Biến điều phức tạp thành rõ ràng.",
        "Thiết kế công cụ để hướng dẫn, không chỉ để bán hàng.",
      ],
    },
    {
      title: "Chính trực mọi lúc",
      tagline: "Trust Is Our Currency",
      behaviors: [
        "Chịu trách nhiệm với kết quả.",
        "Nhận sai nhanh và sửa còn nhanh hơn.",
        "Đối xử với dữ liệu cẩn trọng như với niềm tin cá nhân.",
      ],
    },
    {
      title: "Bền vững",
      tagline: "Build for Decades, Not Quarters",
      behaviors: [
        "Chọn sự bền vững hơn là lối tắt.",
        "Cân bằng giữa tăng trưởng và trách nhiệm.",
        "Xem mỗi khách hàng là một mối quan hệ lâu dài, không phải một lượt chuyển đổi.",
      ],
    },
    {
      title: "Tiến hoá",
      tagline: "Learn Faster Than We Fail",
      behaviors: [
        "Hành động, thử nghiệm và điều chỉnh.",
        "Tôn vinh việc học hỏi, không phải sự may rủi.",
        "Mặc định đưa ra các quyết định có thể đảo ngược.",
      ],
    },
  ] satisfies readonly CoreValue[],

  principlesTitle: "Nguyên tắc vận hành",
  principles: [
    {
      title: "Đi nhanh — nhưng không bao giờ mù mờ",
      detail:
        "Học nhanh hơn tốc độ thất bại, và thất bại đủ nhanh để học hỏi. Ghi lại quyết định, thử thách các giả định, lan tỏa sự rõ ràng.",
    },
    {
      title: "Quan tâm người dùng, không chỉ chỉ số",
      detail:
        "Đo thành công bằng sự an tâm mang lại cho đời sống tài chính của mọi người — không phải tăng trưởng hình thức.",
    },
    {
      title: "Hành động như người chủ",
      detail:
        "Ai cũng nắm bối cảnh, không chỉ nhiệm vụ. Khi có gì hỏng, chúng tôi sửa. Khi có gì hiệu quả, chúng tôi mở rộng có trách nhiệm.",
    },
  ] satisfies readonly OperatingPrinciple[],

  journeyIntro: {
    title: "Giá trị này thể hiện thế nào trong sản phẩm",
    body: "Từ khám phá đến sở hữu và gắn kết lâu dài — mỗi giai đoạn trong hành trình mua nhà đều được FinHome đồng hành bằng dữ liệu rõ ràng và công cụ đúng lúc.",
  },
} as const;
