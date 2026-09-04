// Home page section content. Verbatim Vietnamese copy from the Framer mirror.
// Image values are Framer base filenames; resolve with img() from "@/lib/images".

export const HERO = {
  headline: "FinHome giúp bạn chọn đúng nhà, hiểu rõ sức chi trả",
  subhead:
    "Công cụ lập kế hoạch mua nhà với các phép tính minh bạch và dữ liệu do bạn kiểm soát",
  cta: "Thử ngay",
  images: {
    marquee: "hInhX9UgJBuGaSywFBNNbocS2t0.png",
    badge: "x8UhU3ZT5q88N36ilFB6B0Tu7kE.svg",
    panel: "o8jJXgRiX6LN7LOGgMXmaxsupVs.png",
    phone: "Z8KIqP7hqZvzaK06QSJARSULQQw.png",
  },
};

export const STEPS_SECTION = {
  title: "Các bước đơn giản để hiểu khả năng mua nhà của bạn",
  titleMobileLines: [
    "Các bước đơn giản để hiểu",
    "khả năng mua nhà của bạn",
  ],
  leadTitle: "Khởi động bằng dữ liệu",
  leadBody:
    "Nhập các giả định cơ bản để ước tính tầm giá, mô phỏng chi trả và mở La bàn mua nhà",
  /** Shorter copy on narrow viewports — matches Framer mobile breakpoint. */
  leadBodyMobile:
    "Nhập thông tin cơ bản, FinHome sẽ định hướng tài chính cho bạn",
  /** Intentional line breaks @375px — avoids orphan words when flowing as one paragraph. */
  leadBodyMobileLines: [
    "Nhập thông tin cơ bản, FinHome",
    "sẽ định hướng tài chính cho bạn",
  ],
  leadBodyLines: [
    "Nhập các giả định cơ bản để ước tính tầm giá,",
    "mô phỏng chi trả và mở La bàn mua nhà",
  ],
  cta: "Thử ngay",
  steps: [
    {
      title: "Xác định vùng mua nhà an toàn",
      desc: "Biết mức giá căn nhà phù hợp với tài chính hiện tại của bạn",
      icon: "9DWQzTIfFOk6ZkCVfnfpg9Fnz5Q.svg",
    },
    {
      title: "Mô phỏng phương án chi trả",
      desc: "Thử lãi suất và kỳ hạn giả định để xem áp lực dòng tiền",
      icon: "5Q3gFip1lY8vWKmRLAHPnkJqAis.svg",
    },
    {
      title: "Mở khóa La bàn tài chính",
      desc: "Nhận điểm số và định hướng tổng quan tài chính của bạn",
      icon: "wucS1gLE60ECBgA4gyzkB26d4.svg",
    },
  ],
};

export const PLATFORM_SECTION = {
  title: "Một nền tảng đồng hành cùng bạn cả hành trình mua nhà",
  features: [
    {
      title: "Cá nhân hóa trải nghiệm với AI",
      desc: "AI phân tích để gợi ý dự án phù hợp hơn với bạn",
      image: "VnhOAfra6cWAj4k6aWSHjctp59o.png",
    },
    {
      title: "Luôn cập nhật xu hướng",
      desc: "Cập nhật tín hiệu mới để bạn chủ động hơn",
      image: "J4egHxMXt0WzHvMHScZmhl6Dkc.png",
    },
    {
      title: "Tính toán thông minh từ dữ liệu",
      desc: "Kết nối dữ liệu cơ bản thành tính toán rõ ràng và gợi ý thực tế",
      image: "FdTECw5LUUzz9aOkP0KsSvHD0Y.png",
    },
    {
      title: "Giao diện thân thiện",
      desc: "Thiết kế trực quan, dễ dùng, dễ theo dõi",
      image: "4RetLJhrrvKYh3oS3lO0wfJLayM.png",
    },
    {
      title: "Nền tảng đa tính năng",
      desc: "Đủ tính năng để đánh giá, theo dõi và ra quyết định tốt hơn",
      image: "qxo9XhPCBEGMBRbIAxUtPmW8bw.png",
    },
    {
      title: "Diễn giải kết quả rõ ràng",
      desc: "Biến kết quả tính toán thành nhận định dễ hiểu và dễ hành động",
      image: "1fbxcHz89ad5POZ78mpq622pwyI.png",
    },
  ],
};

export const TESTIMONIALS_SECTION = {
  title: "Trải nghiệm từ người dùng",
  subtitle:
    "Góc nhìn từ người dùng sau khi hiểu rõ hơn về khả năng tài chính và quyết định mua nhà với FinHome",
  items: [
    {
      quote:
        "Điều tôi thích ở FinHome là mọi thứ dễ hiểu và sát thực tế. Tôi biết mình đang ở đâu về tài chính, nên chọn mức giá nào và cần cẩn trọng điều gì trước khi xuống tiền.",
      name: "Anh Phạm",
      role: "Nhân viên văn phòng",
      avatar: "sS56Q5YGS57bP8Vlbh3A6HHVHDQ.jpg",
    },
    {
      quote:
        "FinHome không giúp tôi mua nhanh hơn, mà giúp tôi mua chắc hơn. Tôi hiểu rõ ngân sách, sức chi trả và các rủi ro cần cân nhắc trước khi bước tiếp.",
      name: "Thùy Như",
      role: "Người mua nhà lần đầu",
      avatar: "dTeZrxbqIYr4yq8uPXe5gxdbM.jpg",
    },
    {
      quote:
        "Trước đây tôi tìm nhà khá cảm tính. Dùng FinHome rồi, tôi mới biết mình phù hợp với mức giá nào, nên vay bao nhiêu và cần tránh những rủi ro gì.",
      name: "Thái Vin",
      role: "Nhà đầu tư bất động sản",
      avatar: "4F8Fzhd4rrU9Yv83jWxZjg6pqLc.jpg",
    },
  ],
  arrows: {
    left: "6tTbkXggWgQCAJ4DO2QEdXXmgM.svg",
    right: "11KSGbIZoRSg4pjdnUoif6MKHI.svg",
  },
};

export const FAQ_SECTION = {
  title: "Những câu hỏi thường gặp",
  subtitle:
    "Những thông tin cần thiết giúp bạn hiểu rõ FinHome trước khi trải nghiệm",
  items: [
    {
      q: "FinHome là gì và giúp tôi điều gì?",
      a: "FinHome là ứng dụng lập kế hoạch mua nhà, giúp bạn ước tính tầm giá, mô phỏng chi trả và xem các yếu tố cần cân nhắc. FinHome không cung cấp hoặc môi giới khoản vay.",
    },
    {
      q: "FinHome đánh giá khả năng tài chính như thế nào?",
      a: "FinHome dùng các thông tin và giả định bạn nhập để ước tính tầm giá và áp lực dòng tiền. Kết quả là mô phỏng tham khảo, không phải đánh giá đủ điều kiện tín dụng.",
    },
    {
      q: "FinHome có cung cấp hoặc giới thiệu gói vay không?",
      a: "Không. FinHome không hiển thị sản phẩm hoặc lãi suất hiện hành của ngân hàng, không nhận hồ sơ và không kết nối bạn với bên cho vay. Bạn chỉ mô phỏng với số tiền, lãi suất và kỳ hạn giả định do mình lựa chọn.",
    },
    {
      q: "La bàn trong FinHome là gì và mở khóa như thế nào?",
      a: "La bàn tài chính là điểm số và định hướng tổng quan về tài chính của bạn. Bạn mở khóa la bàn sau khi nhập đủ thông tin cơ bản để FinHome phân tích.",
    },
    {
      q: "Dữ liệu tài chính của tôi trên FinHome có an toàn không?",
      a: "Chính sách bảo mật mô tả dữ liệu được thu thập, mục đích sử dụng, nhà cung cấp xử lý và cách yêu cầu xóa. Tính năng AI yêu cầu đồng ý riêng trước khi gửi dữ liệu tới MiniMax AI.",
    },
  ],
};

export const SIGNUP_SECTION = {
  title: "Đăng ký trải nghiệm sớm",
  subtitleLines: [
    "FinHome đã có trên iOS. Nhập email",
    "để sớm trải nghiệm bản Android",
  ],
  placeholder: "Nhập email của bạn",
  cta: "Đăng ký",
  socialProof: "Đã có 1,000+ người đăng ký",
  avatars: [
    "6hJrSISXOuw6XHbmBRCGFMIE78.png",
    "Ym3IuKDBwg0U6P3YdFiwaa2xKE.png",
    "zU4hhLtCQQrRV7D1ZZ3IKzyve2g.png",
  ],
};

export const NEWS_SECTION = {
  title: "Tin tức bất động sản",
  subtitle: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở",
  cta: "Xem thêm",
};
