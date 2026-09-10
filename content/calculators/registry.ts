// The single source of truth for the calculator suite.
//
// The hub page (`app/cong-cu/page.tsx`), the placeholder route
// (`app/cong-cu/[slug]/page.tsx`) and the sitemap (`app/sitemap.ts`) all
// derive from this array, so a calculator is registered once rather than in
// three places that then drift.
//
// `status` distinguishes what works from what is only listed:
//
//   "live"    — a real calculator at app/cong-cu/<slug>/page.tsx. Indexed,
//               in the sitemap, linked from the hub.
//   "planned" — listed on the hub so the menu is complete, and served by the
//               shared placeholder route. Deliberately `noindex` and NOT in
//               the sitemap: 70-odd near-empty pages in a search index is the
//               textbook thin-content pattern, and it would drag down the
//               pages that do work.
//
// Names are Vietnamese translations of what each tool does; summaries are
// original FinHome copy. Nothing here is taken from a third-party tool.
//
// Two tools from the reference set are deliberately absent — a currency
// converter and a commodities/futures tool — because both need live market
// data, which a static export cannot fetch without either shipping an API key
// in the client bundle or serving rates that are stale between deploys. See
// docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md.

export type CalculatorCategory =
  | "tai-chinh-dau-tu"
  | "vay-the-chap"
  | "huu-tri"
  | "the-tin-dung"
  | "vay-mua-xe"
  | "chung-khoan"
  | "khac";

export type CalculatorStatus = "live" | "planned";

export type CalculatorEntry = {
  /** Route segment: "quy-tac-72" -> /cong-cu/quy-tac-72/ */
  slug: string;
  /** Vietnamese name, shown on the hub. */
  title: string;
  /** One line under the title on the hub. */
  summary: string;
  category: CalculatorCategory;
  status: CalculatorStatus;
  /**
   * Set on tools that model United States tax or retirement law. Drives the
   * `us-rules` notice and a lower sitemap priority, so we don't actively
   * drive Vietnamese users into rules that don't apply to them.
   */
  usRules?: true;
};

export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  "tai-chinh-dau-tu": "Tài chính & Đầu tư",
  "vay-the-chap": "Vay & Thế chấp",
  "huu-tri": "Hưu trí",
  "the-tin-dung": "Thẻ tín dụng",
  "vay-mua-xe": "Vay & Thuê mua xe",
  "chung-khoan": "Chứng khoán",
  khac: "Khác",
};

/** Display order of categories on the hub. */
export const CATEGORY_ORDER: CalculatorCategory[] = [
  "vay-the-chap",
  "tai-chinh-dau-tu",
  "the-tin-dung",
  "vay-mua-xe",
  "chung-khoan",
  "huu-tri",
  "khac",
];

// Build-time guard. The hub iterates CATEGORY_ORDER rather than CALCULATORS,
// so a category missing from the array would silently drop every calculator in
// it from the page — with no type error (the array type-checks at any length)
// and no test. CATEGORY_LABELS is a Record<CalculatorCategory, string>, so the
// compiler already forces IT to stay complete; checking the array against its
// keys is therefore equivalent to checking against the union itself. This
// throws during `next build` instead of shipping a page with a missing section.
for (const category of Object.keys(CATEGORY_LABELS) as CalculatorCategory[]) {
  if (!CATEGORY_ORDER.includes(category)) {
    throw new Error(
      `content/calculators/registry.ts: CATEGORY_ORDER is missing "${category}". ` +
        "Add it, or the hub page will silently omit that category.",
    );
  }
}

export const CALCULATORS: CalculatorEntry[] = [
  // ---------------------------------------------------------------- Vay & Thế chấp
  {
    slug: "vay-mua-nha",
    title: "Tính khoản vay mua nhà",
    summary: "Số tiền trả hằng tháng, tổng lãi và bảng trả nợ theo từng năm.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "so-sanh-khoan-vay",
    title: "So sánh khoản vay",
    summary: "Đặt hai hoặc ba phương án vay cạnh nhau để chọn phương án rẻ hơn.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "tai-cap-von",
    title: "Tính tái cấp vốn",
    summary: "So sánh khoản vay hiện tại với khoản vay mới và tìm điểm hoàn vốn.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "apr",
    title: "Tính lãi suất thực tế (APR)",
    summary: "Quy các loại phí về một mức lãi suất duy nhất để so sánh công bằng.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "apr-nang-cao",
    title: "Tính APR nâng cao",
    summary: "APR với nhiều loại phí, điểm chiết khấu và chi phí trả trước.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "vay-thuong-mai",
    title: "Tính vay thương mại",
    summary: "Khoản vay kinh doanh có kỳ trả gốc cuối kỳ hoặc kỳ ân hạn.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "phan-tich-khoan-vay",
    title: "Phân tích khoản vay",
    summary: "Bóc tách cơ cấu gốc, lãi và chi phí trong suốt kỳ hạn.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "kha-nang-mua-nha",
    title: "Khả năng mua nhà",
    summary: "Từ thu nhập và chi phí hằng tháng, tính mức giá nhà bạn nên nhắm tới.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "thue-hay-mua",
    title: "Thuê hay mua nhà",
    summary: "So sánh tổng chi phí thuê và mua trong cùng một khoảng thời gian.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "tiet-kiem-thue-vay-mua-nha",
    title: "Tiết kiệm thuế từ lãi vay",
    summary: "Phần thuế được giảm nhờ khấu trừ lãi vay, theo quy định Hoa Kỳ.",
    category: "vay-the-chap",
    status: "live",
    usRules: true,
  },
  {
    slug: "diem-chiet-khau",
    title: "Điểm chiết khấu",
    summary: "Trả trước một khoản để hạ lãi suất có đáng hay không.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "lai-suat-tha-noi",
    title: "Khoản vay lãi thả nổi",
    summary: "Số tiền trả thay đổi thế nào khi lãi suất điều chỉnh theo kỳ.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "lai-co-dinh-hay-tha-noi",
    title: "Lãi cố định hay thả nổi",
    summary: "So sánh hai cấu trúc lãi suất trên cùng một khoản vay.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "tra-no-hai-tuan",
    title: "Trả nợ hai tuần một lần",
    summary: "Trả nửa kỳ mỗi hai tuần rút ngắn kỳ hạn và giảm lãi bao nhiêu.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "chi-tra-lai",
    title: "Khoản vay chỉ trả lãi",
    summary: "Giai đoạn chỉ trả lãi rồi chuyển sang trả cả gốc, và mức tăng khi đó.",
    category: "vay-the-chap",
    status: "live",
  },
  {
    slug: "bat-dong-san-cho-thue",
    title: "Bất động sản cho thuê",
    summary: "Dòng tiền, tỷ suất sinh lời và điểm hòa vốn của một căn cho thuê.",
    category: "vay-the-chap",
    status: "live",
  },

  // ------------------------------------------------------------ Tài chính & Đầu tư
  {
    slug: "lai-kep",
    title: "Tính lãi kép",
    summary:
      "Số tiền cuối kỳ, tổng lãi và mức tăng qua từng năm, kèm khoản gửi thêm định kỳ.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "quy-tac-72",
    title: "Quy tắc 72",
    summary: "Tính số năm để số tiền gốc nhân đôi nhờ lãi kép.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "gia-tri-tien-te-theo-thoi-gian",
    title: "Giá trị tiền tệ theo thời gian",
    summary: "Giải một trong năm biến: giá trị hiện tại, tương lai, kỳ hạn, lãi suất, khoản trả.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "muc-tieu-tiet-kiem",
    title: "Mục tiêu tiết kiệm",
    summary: "Cần gửi bao nhiêu mỗi tháng để đạt số tiền mong muốn.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "tien-gui-co-ky-han",
    title: "Tiền gửi có kỳ hạn",
    summary: "Số tiền nhận được khi đáo hạn sổ tiết kiệm, theo từng kỳ ghép lãi.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "ty-suat-loi-nhuan-roi",
    title: "Tỷ suất lợi nhuận (ROI)",
    summary: "Lợi nhuận trên vốn đầu tư, tính cả theo năm.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "irr-npv",
    title: "IRR và NPV",
    summary: "Tỷ suất hoàn vốn nội bộ và giá trị hiện tại thuần của một dòng tiền.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "trai-phieu",
    title: "Tính trái phiếu",
    summary: "Giá, lợi suất đáo hạn và tiền lãi coupon của một trái phiếu.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "loi-suat-tuong-duong-thue",
    title: "Lợi suất tương đương thuế",
    summary: "Quy lợi suất miễn thuế về mức trước thuế để so sánh.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "tiet-kiem-hoc-phi",
    title: "Tiết kiệm học phí",
    summary: "Cần dành bao nhiêu mỗi tháng cho học phí của con trong tương lai.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "thu-nhap-dau-tu",
    title: "Thu nhập từ đầu tư",
    summary: "Dòng thu nhập một khoản đầu tư tạo ra mỗi năm.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "phi-quy-dau-tu",
    title: "Phí quỹ đầu tư",
    summary: "Phí quản lý ăn vào lợi nhuận dài hạn bao nhiêu.",
    category: "tai-chinh-dau-tu",
    status: "live",
  },
  {
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    title: "Tài khoản tiết kiệm y tế (HSA)",
    summary: "Tài khoản tiết kiệm y tế theo quy định Hoa Kỳ.",
    category: "tai-chinh-dau-tu",
    status: "live",
    usRules: true,
  },

  // --------------------------------------------------------------- Thẻ tín dụng
  {
    slug: "tra-het-the-tin-dung",
    title: "Trả hết nợ thẻ tín dụng",
    summary: "Bao lâu và bao nhiêu tiền lãi để trả hết dư nợ thẻ.",
    category: "the-tin-dung",
    status: "live",
  },
  {
    slug: "tra-toi-thieu-the-tin-dung",
    title: "Trả mức tối thiểu thẻ tín dụng",
    summary: "Chỉ trả mức tối thiểu thì mất bao lâu và tốn thêm bao nhiêu.",
    category: "the-tin-dung",
    status: "live",
  },

  // ------------------------------------------------------------ Vay & Thuê mua xe
  {
    slug: "vay-mua-xe",
    title: "Tính khoản vay mua xe",
    summary: "Số tiền trả hằng tháng và tổng chi phí của một khoản vay mua xe.",
    category: "vay-mua-xe",
    status: "live",
  },
  {
    slug: "thue-mua-xe",
    title: "Tính thuê mua xe",
    summary: "Chi phí thuê mua xe và so sánh với phương án vay để mua.",
    category: "vay-mua-xe",
    status: "live",
  },

  // ----------------------------------------------------------------- Chứng khoán
  {
    slug: "loi-nhuan-co-phieu",
    title: "Lợi nhuận cổ phiếu",
    summary: "Tổng lợi nhuận gồm chênh lệch giá và cổ tức.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "co-phieu-tang-truong-deu",
    title: "Cổ phiếu tăng trưởng đều",
    summary: "Định giá cổ phiếu theo mô hình cổ tức tăng trưởng đều.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "co-phieu-tang-truong-khong-deu",
    title: "Cổ phiếu tăng trưởng không đều",
    summary: "Định giá khi tốc độ tăng cổ tức thay đổi theo từng giai đoạn.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "capm",
    title: "Mô hình CAPM",
    summary: "Lợi nhuận yêu cầu của một tài sản theo hệ số beta và phần bù rủi ro.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "loi-nhuan-ky-vong",
    title: "Lợi nhuận kỳ vọng",
    summary: "Lợi nhuận kỳ vọng của một danh mục theo xác suất từng tình huống.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "loi-nhuan-ky-nam-giu",
    title: "Lợi nhuận kỳ nắm giữ",
    summary: "Lợi nhuận thực tế trong khoảng thời gian bạn nắm giữ tài sản.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "wacc",
    title: "Chi phí vốn bình quân (WACC)",
    summary: "Chi phí vốn bình quân gia quyền của một doanh nghiệp.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "quyen-chon-black-scholes",
    title: "Định giá quyền chọn Black-Scholes",
    summary: "Giá quyền chọn mua và bán theo mô hình Black-Scholes.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "diem-pivot",
    title: "Điểm pivot",
    summary: "Các mức hỗ trợ và kháng cự tính từ giá cao, thấp và đóng cửa.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "fibonacci",
    title: "Mức Fibonacci",
    summary: "Các mức điều chỉnh Fibonacci giữa một vùng giá.",
    category: "chung-khoan",
    status: "live",
  },
  {
    slug: "thue-co-tuc",
    title: "Thuế cổ tức",
    summary: "Thuế phải nộp trên cổ tức, theo quy định Hoa Kỳ.",
    category: "chung-khoan",
    status: "live",
    usRules: true,
  },

  // --------------------------------------------------------------------- Hưu trí
  {
    slug: "ke-hoach-huu-tri",
    title: "Kế hoạch hưu trí",
    summary: "Lập kế hoạch tích lũy và rút tiền cho tuổi nghỉ hưu, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "tinh-huu-tri",
    title: "Tính hưu trí",
    summary: "Số tiền cần có khi nghỉ hưu và mức tích lũy mỗi tháng, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "gop-401k",
    title: "Góp quỹ 401(k)",
    summary: "Mức đóng góp và phần đối ứng của công ty, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "toi-da-401k",
    title: "Đóng tối đa quỹ 401(k)",
    summary: "Cách chia đều để đạt mức đóng tối đa trong năm, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "phan-tich-tiet-kiem-huu-tri",
    title: "Phân tích tiết kiệm hưu trí",
    summary: "Khoản tiết kiệm hiện tại có đủ cho tuổi nghỉ hưu hay không, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "phan-tich-thu-nhap-huu-tri",
    title: "Phân tích thu nhập hưu trí",
    summary: "Các nguồn thu nhập sau khi nghỉ hưu, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "thu-nhap-huu-tri",
    title: "Thu nhập hưu trí",
    summary: "Mức rút hằng tháng mà khoản tích lũy có thể duy trì, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "ira-truyen-thong-hay-roth",
    title: "IRA truyền thống hay Roth",
    summary: "So sánh hai loại tài khoản hưu trí cá nhân, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "rut-toi-thieu-bat-buoc",
    title: "Mức rút tối thiểu bắt buộc",
    summary: "Số tiền bắt buộc phải rút mỗi năm sau một độ tuổi, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "uoc-tinh-an-sinh-xa-hoi",
    title: "Ước tính an sinh xã hội",
    summary: "Ước tính khoản trợ cấp an sinh xã hội Hoa Kỳ.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "phan-tich-an-sinh-xa-hoi",
    title: "Phân tích an sinh xã hội",
    summary: "Ảnh hưởng của tuổi bắt đầu nhận tới tổng trợ cấp, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "planned",
    usRules: true,
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    title: "Chi trả an sinh xã hội",
    summary:
      "Số tiền hộ gia đình thực nhận mỗi tháng theo tuổi bắt đầu nhận, gồm trợ cấp vợ/chồng.",
    category: "huu-tri",
    status: "live",
    usRules: true,
  },
  {
    slug: "phan-bo-tai-san",
    title: "Phân bổ tài sản",
    summary: "Tỷ lệ phân bổ giữa các nhóm tài sản theo mức chấp nhận rủi ro.",
    category: "huu-tri",
    status: "planned",
    usRules: true,
  },
  {
    slug: "nien-kim",
    title: "Tính niên kim",
    summary: "Dòng tiền nhận được từ một hợp đồng niên kim, theo quy định Hoa Kỳ.",
    category: "huu-tri",
    status: "planned",
    usRules: true,
  },

    // ------------------------------------------------------------------------ Khác
  {
    slug: "lai-suat-thuc-te",
    title: "Lãi suất thực tế",
    summary: "Quy lãi suất danh nghĩa về lãi suất thực tế theo kỳ ghép lãi.",
    category: "khac",
    status: "live",
  },
  {
    slug: "tinh-phan-tram",
    title: "Tính phần trăm",
    summary: "Phần trăm của một số, mức tăng giảm và tỷ lệ giữa hai số.",
    category: "khac",
    status: "live",
  },
  {
    slug: "giam-gia-va-thue",
    title: "Giảm giá và thuế",
    summary: "Giá sau khi giảm và sau khi cộng thuế.",
    category: "khac",
    status: "live",
  },
  {
    slug: "margin-va-markup",
    title: "Margin và markup",
    summary: "Chuyển đổi giữa tỷ lệ lợi nhuận trên giá bán và trên giá vốn.",
    category: "khac",
    status: "live",
  },
  {
    slug: "luong-gio-sang-luong-thang",
    title: "Lương giờ sang lương tháng",
    summary: "Quy đổi giữa lương theo giờ, theo tuần và theo năm.",
    category: "khac",
    status: "live",
  },
  {
    slug: "tang-luong",
    title: "Tính tăng lương",
    summary: "Mức lương mới sau khi tăng theo phần trăm hoặc theo số tiền.",
    category: "khac",
    status: "live",
  },
  {
    slug: "du-bao-kinh-doanh",
    title: "Dự báo kinh doanh",
    summary: "Dự báo doanh thu và chi phí theo tốc độ tăng trưởng.",
    category: "khac",
    status: "live",
  },
  {
    slug: "cac-chi-so-tai-chinh",
    title: "Các chỉ số tài chính",
    summary: "Các tỷ số thanh khoản, đòn bẩy và hiệu quả từ báo cáo tài chính.",
    category: "khac",
    status: "live",
  },
  {
    slug: "phan-tich-bao-cao-tai-chinh",
    title: "Phân tích báo cáo tài chính",
    summary: "Đọc bảng cân đối kế toán và báo cáo kết quả kinh doanh theo tỷ trọng.",
    category: "khac",
    status: "live",
  },
  {
    slug: "phan-phoi-rong",
    title: "Số tiền nhận ròng",
    summary: "Số tiền còn lại sau thuế và phí khi rút một khoản.",
    category: "khac",
    status: "live",
  },
  {
    slug: "chi-phi-nhien-lieu",
    title: "Chi phí nhiên liệu",
    summary: "Chi phí nhiên liệu cho một chuyến đi hoặc mỗi tháng.",
    category: "khac",
    status: "live",
  },
  {
    slug: "tinh-tien-tip",
    title: "Tính tiền tip",
    summary: "Tiền tip và cách chia hóa đơn cho nhiều người.",
    category: "khac",
    status: "live",
  },
  {
    slug: "tinh-ngay",
    title: "Tính ngày",
    summary: "Khoảng thời gian giữa hai ngày, hoặc ngày sau khi cộng thêm.",
    category: "khac",
    status: "live",
  },
  {
    slug: "doi-don-vi",
    title: "Đổi đơn vị",
    summary: "Quy đổi giữa các đơn vị đo lường thường dùng.",
    category: "khac",
    status: "live",
  },
  {
    slug: "lam-phat-hoa-ky",
    title: "Lạm phát Hoa Kỳ",
    summary: "Sức mua của một số tiền theo chỉ số giá tiêu dùng Hoa Kỳ.",
    category: "khac",
    status: "live",
    usRules: true,
  },
  {
    slug: "tin-phieu-kho-bac-hoa-ky",
    title: "Tín phiếu kho bạc Hoa Kỳ",
    summary: "Giá và lợi suất tín phiếu kho bạc Hoa Kỳ.",
    category: "khac",
    status: "live",
    usRules: true,
  },
  {
    slug: "thue-luong-hoa-ky",
    title: "Thuế lương Hoa Kỳ",
    summary: "Thuế và các khoản trừ trên phiếu lương, theo quy định Hoa Kỳ.",
    category: "khac",
    status: "live",
    usRules: true,
  },
];

/** Site-relative path for a calculator, without the trailing slash. */
export function calculatorPath(slug: string): string {
  return `/cong-cu/${slug}`;
}

/** The calculators that actually work: indexed, in the sitemap. */
export function liveCalculators(): CalculatorEntry[] {
  return CALCULATORS.filter((calc) => calc.status === "live");
}

/** The calculators that are listed but not built: `noindex`, not in the sitemap. */
export function plannedCalculators(): CalculatorEntry[] {
  return CALCULATORS.filter((calc) => calc.status === "planned");
}

/** Look a calculator up by slug. */
export function getCalculator(slug: string): CalculatorEntry | undefined {
  return CALCULATORS.find((calc) => calc.slug === slug);
}
