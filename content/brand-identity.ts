// Vietnamese adaptation of docs/finhome-identity.pdf — vision, mission, core
// values and operating principles for the /vision page.

export type CoreValue = {
  readonly title: string;
  readonly description: string;
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
      body: "Đến năm 2030, sở hữu nhà bền vững, minh bạch và có trách nhiệm sẽ là chuẩn mực tại Việt Nam — được thúc đẩy bởi dữ liệu rõ ràng, tài chính có kỷ luật và niềm tin giữa người mua cùng các bên tham gia thị trường.",
    },
    {
      title: "Sứ mệnh",
      body: "Chúng tôi giúp các quyết định bất động sản trở nên đơn giản, minh bạch và an toàn về tài chính cho người mua, nhà đầu tư và chủ đầu tư — qua nền tảng Real Estate Decision Intelligence, vận hành bởi dữ liệu đã kiểm chứng, mô hình đánh giá khả năng chi trả và gợi ý hành động thay thế đầu cơ bằng sự rõ ràng.",
    },
  ] as const,

  valuesTitle: "Giá trị cốt lõi",
  values: [
    {
      title: "Minh bạch",
      description: "Dựa trên dữ liệu, nói đúng sự thật và rõ ràng trong mọi thông tin.",
    },
    {
      title: "An toàn",
      description: "Ưu tiên an toàn và giảm thiểu rủi ro cho người dùng.",
    },
    {
      title: "Thấu hiểu",
      description: "Hiểu đúng nhu cầu để đưa ra điều thực sự phù hợp với người dùng.",
    },
    {
      title: "Chuẩn mực",
      description: "Luôn làm đúng nguyên tắc và nhất quán trong mọi hành động.",
    },
    {
      title: "Cải tiến",
      description: "Luôn học hỏi, thử nghiệm và cải tiến để tạo ra giá trị tốt hơn, lâu dài hơn.",
    },
  ] satisfies readonly CoreValue[],

  principlesTitle: "Nguyên tắc vận hành",
  principlesSubtitle:
    "Nguyên tắc là kim chỉ nam cho cách chúng tôi ra quyết định, hành động và cải tiến mỗi ngày.",
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
