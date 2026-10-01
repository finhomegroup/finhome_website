// Home page section content. Verbatim Vietnamese copy from the Framer mirror.
// Image values are Framer base filenames; resolve with img() from "@/lib/images".

/**
 * The hero — HOMEPAGE PHOTO PREVIEW (docs/homepage-photo-preview-brief.md),
 * proposed and not approved for release.
 *
 * The copy is the brief's, verbatim. It says what the reader can DO (start a
 * tool, enter their numbers, read an explained result) and promises no price,
 * payment or bank approval. The QR / store-badge panel (a non-interactive
 * image) and the green marquee band are gone from the hero, and the phone
 * artwork moved to the app-download preview section (`APP_DOWNLOAD_PREVIEW`).
 *
 * `photo` (2026-10-01, user-approved): an AI-GENERATED illustration of
 * fictional people, made by Codex's built-in image generation as an edit of
 * Pexels photo 7593053 (Miriam Alonso). It keeps that photo's composition —
 * wall, sofa, light, head and body positions — and its aspect (1595×986 vs
 * 3805×2352, both ≈1,618), so every framing ratio in hero.tsx holds. The
 * stock photo is recorded as a COMPOSITION REFERENCE only: its photographer
 * did not make this image and the people are not the photo's subjects.
 * Decorative (`alt=""`), labelled by the small `photoLabel`; not a customer
 * and not an endorsement. Files: plain WebP resizes, no upscale (source and
 * prompt summary: artifacts/homepage-ai-hero-2026-10-01/, docs/homepage-photo-preview.md).
 * The stock JPEG stays in public/ — the released car social package uses it.
 */
export const HERO = {
  /**
   * 2026-09-27: a shorter, plain-language hook (user request). The supporting
   * line offers a CHOICE of tools rather than implying one tool does it all.
   */
  headline: "Nhà bao nhiêu tiền thì vừa sức bạn?",
  subhead:
    "Bắt đầu với điều bạn muốn biết: nhà tầm giá nào, mỗi tháng trả góp bao nhiêu hay cần để dành thêm bao nhiêu. Chọn một công cụ và thử với số của bạn.",
  primaryCta: { label: "Khám phá công cụ", href: "/cong-cu/" },
  secondaryCta: { label: "Xem ví dụ dễ hiểu", href: "/blog/mua-nha-bang-con-so/" },
  reassurance: "Miễn phí trên web · Không cần đăng nhập",
  photo: "/images/home/ai-hero-couple-1200.webp",
  /** 800 / 1200 / 1595 WebP, ascending; 1595 is the source width. */
  photoSources: [
    { src: "/images/home/ai-hero-couple-800.webp", width: 800 },
    { src: "/images/home/ai-hero-couple-1200.webp", width: 1200 },
    { src: "/images/home/ai-hero-couple-1595.webp", width: 1595 },
  ],
  photoLabel: "Ảnh minh họa AI",
  photoSource: {
    kind: "ai-generated",
    width: 1595,
    height: 986,
    generatedSha256: "4eec3eb89ee4a4ad2d05c4c476b3ae43c25707ef0f7fd502af82ba4d82455ceb",
    approvedOn: "2026-10-01",
    compositionReference: {
      pexelsId: "7593053",
      author: "Miriam Alonso",
      page: "https://www.pexels.com/photo/man-and-woman-sitting-on-a-sofa-7593053/",
    },
  },
};

/**
 * The app-download PREVIEW section (2026-09-28), proposed. It owns the phone
 * artwork (moved from `HERO.images.phone`) and the OLD QR / store-badge panel.
 *
 * THE PANEL IS ILLUSTRATIVE. The user allowed it for this preview only: the
 * repository has no real app download URL, so the image is shown without any
 * link, its alt text says it is illustrative, and `caption` sits directly
 * under it. Before publishing, a real download URL (and a QR generated from
 * it) must replace it — see docs/homepage-photo-preview.md.
 *
 * The copy says what a buyer can DO in the app, in plain terms; it does not
 * claim synced data, saved plans or availability in any store.
 */
export const APP_DOWNLOAD_PREVIEW = {
  eyebrow: "Ứng dụng FinHome",
  title: "Chuẩn bị mua nhà từng bước cùng FinHome",
  body: "Trong ứng dụng FinHome, bạn xem lại tình hình tài chính của mình, thử các phương án trả góp với số của bạn và chuẩn bị từng bước cho việc mua nhà.",
  /** Base filenames, resolved with `img()` from "@/lib/images". */
  phone: "Z8KIqP7hqZvzaK06QSJARSULQQw.png",
  panel: "o8jJXgRiX6LN7LOGgMXmaxsupVs.png",
  phoneAlt: "Giao diện ứng dụng FinHome trên điện thoại",
  panelAlt:
    "Hình minh họa mã QR và biểu tượng cửa hàng ứng dụng — bản xem trước, không dùng để tải ứng dụng",
  caption: "QR minh họa — bản xem trước",
};

/**
 * Three parallel questions under the hero, each opening the tool that
 * answers it. Not steps: a reader starts from whichever they have.
 */
export const BUYER_QUESTIONS = {
  title: "Bắt đầu từ câu hỏi bạn đang có",
  items: [
    {
      question: "Tôi nên tìm nhà tầm giá nào?",
      explanation:
        "Nhập thu nhập, chi tiêu và số tiền bạn đang có để thấy tầm giá nhà tham khảo.",
      href: "/cong-cu/kha-nang-mua-nha/",
    },
    {
      question: "Mỗi tháng tôi phải trả bao nhiêu?",
      explanation:
        "Nhập số tiền vay, lãi suất và thời hạn để xem khoản trả mỗi tháng và tổng lãi.",
      href: "/cong-cu/vay-mua-nha/",
    },
    {
      question: "Tôi cần để dành thêm bao nhiêu?",
      explanation:
        "Đặt số tiền muốn có, xem cần để dành bao nhiêu mỗi tháng hoặc trong bao lâu.",
      href: "/cong-cu/muc-tieu-tiet-kiem/",
    },
  ],
};

export const STEPS_SECTION = {
  title: "Các bước đơn giản để hiểu khả năng mua nhà của bạn",
  titleMobileLines: [
    "Các bước đơn giản để hiểu",
    "khả năng mua nhà của bạn",
  ],
  leadTitle: "Khởi động bằng dữ liệu",
  leadBody:
    "Nhập thông tin cơ bản, FinHome sẽ xác định vùng mua nhà an toàn, mô phỏng khả năng chi trả và mở khóa la bàn định hướng tài chính cho bạn",
  /** Shorter copy on narrow viewports — matches Framer mobile breakpoint. */
  leadBodyMobile:
    "Nhập thông tin cơ bản, FinHome sẽ định hướng tài chính cho bạn",
  /** Intentional line breaks @375px — avoids orphan words when flowing as one paragraph. */
  leadBodyMobileLines: [
    "Nhập thông tin cơ bản, FinHome",
    "sẽ định hướng tài chính cho bạn",
  ],
  leadBodyLines: [
    "Nhập thông tin cơ bản, FinHome sẽ xác định",
    "vùng mua nhà an toàn, mô phỏng khả năng chi trả",
    "và mở khóa la bàn định hướng tài chính cho bạn",
  ],
  steps: [
    {
      title: "Xác định vùng mua nhà an toàn",
      desc: "Biết mức giá căn nhà phù hợp với tài chính hiện tại của bạn",
      icon: "9DWQzTIfFOk6ZkCVfnfpg9Fnz5Q.svg",
    },
    {
      title: "Mô phỏng kế hoạch chi trả",
      desc: "Xem áp lực trả nợ theo các giả định do bạn tự nhập",
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
        "FinHome không giúp tôi mua nhanh hơn, mà giúp tôi mua chắc hơn. Tôi hiểu rõ ngân sách, kế hoạch chi trả và các rủi ro cần cân nhắc trước khi bước tiếp.",
      name: "Thùy Như",
      role: "Người mua nhà lần đầu",
      avatar: "dTeZrxbqIYr4yq8uPXe5gxdbM.jpg",
    },
    {
      quote:
        "Trước đây tôi tìm nhà khá cảm tính. Dùng FinHome rồi, tôi mới biết mình phù hợp với mức giá nào, mức chi trả nào hợp lý và cần tránh những rủi ro gì.",
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
      a: "FinHome là ứng dụng tự phục vụ giúp bạn hiểu rõ tài chính cá nhân khi mua nhà, từ mức giá phù hợp, kế hoạch chi trả đến các gợi ý giúp ra quyết định tự tin hơn.",
    },
    {
      q: "FinHome đánh giá khả năng tài chính như thế nào?",
      a: "FinHome dùng các thông tin và giả định bạn tự nhập để ước tính vùng giá mua nhà phù hợp và mô phỏng áp lực chi trả. Kết quả chỉ mang tính tham khảo, không phải tư vấn hay quyết định tín dụng.",
    },
    {
      q: "FinHome có cung cấp hoặc môi giới khoản vay không?",
      a: "Không. FinHome không phải ngân hàng hay đơn vị cho vay, không nhận hồ sơ, không kết nối bạn với bên cho vay và không đưa ra đề nghị hoặc cam kết phê duyệt tín dụng. Các con số chỉ là mô phỏng từ giả định do bạn nhập.",
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

/**
 * Under the FAQ (`#hotro`), in place of the early-access signup (map H08,
 * 2026-09-28). The signup form only called `preventDefault()` — nothing was
 * received anywhere — and its copy claimed an iOS release and "1,000+" sign-ups
 * that nothing in scope verifies. Removed rather than hidden, so the claims
 * cannot be re-mounted by accident. What remains is true: the support email
 * and phone already shown in the footer.
 */
export const SUPPORT_CONTACT = {
  title: "Cần hỏi thêm?",
  body: "Gửi câu hỏi cho FinHome qua email hoặc gọi số hỗ trợ người dùng.",
};

export const NEWS_SECTION = {
  title: "Tin tức bất động sản",
  subtitle: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở",
  cta: "Xem thêm",
};
