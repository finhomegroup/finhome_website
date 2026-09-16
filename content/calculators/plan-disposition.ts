// The 75-row disposition from the tools audit, carried into the codebase.
//
// WHY THIS IS A SEPARATE FILE FROM registry.ts
//
// `registry.ts` answers "what routes exist and what are they called". This
// file answers "what did the audit decide about each one, and where does it
// belong". Keeping them apart means the registry entry shape — which
// `scripts/check-built-markup.mjs` parses by regex, anchored on
// `category:`/`status:` being adjacent — is not disturbed by product
// decisions that will keep moving.
//
// `planIndex` is the row number in the audit's `plan-data.mjs`
// (`artifacts/finhome-tools-audit-2026-09-14/`), which is ordered exactly as
// `CALCULATORS` is. It is recorded so a completion audit can walk the original
// 75 rows and find the disposition for each, rather than re-deriving the
// mapping from titles. A test asserts the two orders still agree, so the
// mapping cannot rot silently.
//
// `question` is the user question the audit assigned to that row, in the
// buyer's own words. It is NOT decoration: the hub's search matches it, so a
// visitor who types "hết ưu đãi" finds the floating-rate tool even though
// neither its title nor its summary contains that phrase.
//
// PRIORITY IS AN INVESTMENT ORDER, NOT A QUALITY RANKING, and not a route
// hierarchy. Every one of the 75 keeps its own URL. The plan intentionally
// splits into 5 / 12 / 22 / 36:
//
//   P1  the five first-home-buyer questions the plan invests in first
//   P2  the next buying decision — supporting work, context and links
//   P3  education utilities that stay useful without an acquisition push
//   P4  maintain or move to a library until audience evidence justifies more
//
// `library` says which shelf a tool belongs on when it is NOT on the
// first-home-buyer path. It drives a visible badge, so a Vietnamese buyer can
// see at a glance that a tool models United States law or belongs to a
// corporate-finance shelf BEFORE opening it. It is deliberately not the same
// flag as the registry's `usRules`: `usRules` is a legal notice on the tool's
// own page, `library` is where the tool is filed. Every `hoa-ky` entry must
// carry `usRules` too, and a test enforces that direction.

export type ToolPriority = "P1" | "P2" | "P3" | "P4";

export type ToolLibrary =
  /** Models United States tax or retirement law. */
  | "hoa-ky"
  /** Investment and securities study material. */
  | "dau-tu"
  /** Business and corporate finance. */
  | "doanh-nghiep"
  /** Long-horizon household planning, beyond the home purchase. */
  | "dai-han"
  /** General-purpose utility with no home-buying claim. */
  | "tien-ich";

export type ToolDisposition = {
  /** Row index in the audit's 75-row plan-data.mjs. */
  planIndex: number;
  /** Registry slug. */
  slug: string;
  priority: ToolPriority;
  /** The audit's user question for this row, in the buyer's words. */
  question: string;
  library?: ToolLibrary;
};

/** Display and iteration order for priorities. */
export const PRIORITY_ORDER: ToolPriority[] = ["P1", "P2", "P3", "P4"];

/**
 * The counts the plan committed to. Asserted by
 * `plan-disposition.test.ts` — a tool that quietly changes tier would
 * otherwise move the boundary of a whole work package.
 */
export const PRIORITY_COUNTS: Record<ToolPriority, number> = {
  P1: 5,
  P2: 12,
  P3: 22,
  P4: 36,
};

export const TOOL_DISPOSITIONS: ToolDisposition[] = [
  // ---------------------------------------------------------- Vay & Thế chấp
  {
    planIndex: 0,
    slug: "vay-mua-nha",
    priority: "P1",
    question: "Mỗi tháng tôi phải trả bao nhiêu?",
  },
  {
    planIndex: 1,
    slug: "so-sanh-khoan-vay",
    priority: "P1",
    question: "Hai gói vay, gói nào hợp với tôi?",
  },
  {
    planIndex: 2,
    slug: "tai-cap-von",
    priority: "P2",
    question: "Chuyển khoản vay sang ngân hàng khác có tiết kiệm thật?",
  },
  {
    planIndex: 3,
    slug: "apr",
    priority: "P2",
    question: "Lãi suất quảng cáo khác chi phí vay thật thế nào?",
  },
  {
    planIndex: 4,
    slug: "apr-nang-cao",
    priority: "P2",
    question: "Tất toán sớm khiến chi phí vay thay đổi thế nào?",
  },
  {
    planIndex: 5,
    slug: "vay-thuong-mai",
    priority: "P4",
    question: "Ân hạn và khoản gốc cuối kỳ ảnh hưởng dòng tiền kinh doanh ra sao?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 6,
    slug: "phan-tich-khoan-vay",
    priority: "P2",
    question: "Vì sao tôi trả nhiều mà nợ giảm ít?",
  },
  {
    planIndex: 7,
    slug: "kha-nang-mua-nha",
    priority: "P1",
    question: "Với thu nhập hiện tại, tôi nên tìm nhà tầm giá nào?",
  },
  {
    planIndex: 8,
    slug: "thue-hay-mua",
    priority: "P2",
    question: "Nên tiếp tục thuê hay chuẩn bị mua?",
  },
  {
    planIndex: 9,
    slug: "tiet-kiem-thue-vay-mua-nha",
    priority: "P4",
    question: "Khấu trừ lãi vay ở Hoa Kỳ hoạt động thế nào?",
    library: "hoa-ky",
  },
  {
    planIndex: 10,
    slug: "diem-chiet-khau",
    priority: "P4",
    question: "Trả phí trước để hạ lãi suất có đáng không?",
  },
  {
    planIndex: 11,
    slug: "lai-suat-tha-noi",
    priority: "P1",
    question: "Hết ưu đãi, tôi có chịu nổi khoản trả mới?",
  },
  {
    planIndex: 12,
    slug: "lai-co-dinh-hay-tha-noi",
    priority: "P2",
    question: "Tôi trả thêm bao nhiêu để có lãi suất ổn định?",
  },
  {
    planIndex: 13,
    slug: "tra-no-hai-tuan",
    priority: "P4",
    question: "Trả nợ thường xuyên hơn có giảm lãi không?",
  },
  {
    planIndex: 14,
    slug: "chi-tra-lai",
    priority: "P2",
    question: "Hết kỳ ân hạn gốc thì khoản trả tăng bao nhiêu?",
  },
  {
    planIndex: 15,
    slug: "bat-dong-san-cho-thue",
    priority: "P3",
    question: "Mua căn này cho thuê thì tôi có phải bù tiền mỗi tháng?",
  },

  // ------------------------------------------------------ Tài chính & Đầu tư
  {
    planIndex: 16,
    slug: "lai-kep",
    priority: "P2",
    question: "Tiền tích lũy của tôi tăng thế nào theo thời gian?",
  },
  {
    planIndex: 17,
    slug: "quy-tac-72",
    priority: "P3",
    question: "Bao lâu thì số tiền của tôi nhân đôi?",
  },
  {
    planIndex: 18,
    slug: "gia-tri-tien-te-theo-thoi-gian",
    priority: "P3",
    question: "Một khoản tiền hôm nay tương đương bao nhiêu về sau?",
  },
  {
    planIndex: 19,
    slug: "muc-tieu-tiet-kiem",
    priority: "P1",
    question: "Mỗi tháng cần để dành bao nhiêu để đủ tiền mua nhà?",
  },
  {
    planIndex: 20,
    slug: "tien-gui-co-ky-han",
    priority: "P2",
    question: "Gửi tiền chờ mua nhà, khi nào tôi cần rút?",
  },
  {
    planIndex: 21,
    slug: "ty-suat-loi-nhuan-roi",
    priority: "P3",
    question: "Khoản đầu tư lời bao nhiêu sau thời gian nắm giữ?",
  },
  {
    planIndex: 22,
    slug: "irr-npv",
    priority: "P4",
    question: "Dòng tiền của dự án có tạo ra giá trị không?",
    library: "dau-tu",
  },
  {
    planIndex: 23,
    slug: "trai-phieu",
    priority: "P4",
    question: "Giá trái phiếu và lợi suất liên hệ với nhau thế nào?",
    library: "dau-tu",
  },
  {
    planIndex: 24,
    slug: "loi-suat-tuong-duong-thue",
    priority: "P3",
    question: "Sau thuế thì phương án tiết kiệm nào còn nhiều hơn?",
  },
  {
    planIndex: 25,
    slug: "tiet-kiem-hoc-phi",
    priority: "P3",
    question: "Dành tiền học cho con có ảnh hưởng ngân sách mua nhà?",
  },
  {
    planIndex: 26,
    slug: "thu-nhap-dau-tu",
    priority: "P3",
    question: "Thu nhập từ đầu tư hỗ trợ chi phí sống được bao lâu?",
  },
  {
    planIndex: 27,
    slug: "phi-quy-dau-tu",
    priority: "P3",
    question: "Phí đầu tư làm quỹ mua nhà nhỏ đi bao nhiêu?",
  },
  {
    planIndex: 28,
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    priority: "P4",
    question: "Tài khoản tiết kiệm y tế HSA của Hoa Kỳ có lợi ích gì?",
    library: "hoa-ky",
  },

  // --------------------------------------------------------- Thẻ tín dụng
  {
    planIndex: 29,
    slug: "tra-het-the-tin-dung",
    priority: "P2",
    question: "Bao lâu tôi hết nợ thẻ để chuẩn bị mua nhà?",
  },
  {
    planIndex: 30,
    slug: "tra-toi-thieu-the-tin-dung",
    priority: "P2",
    question: "Chỉ trả mức tối thiểu khiến tôi chậm mua nhà bao lâu?",
  },

  // ----------------------------------------------------- Vay & thuê tài chính xe
  {
    planIndex: 31,
    slug: "vay-mua-xe",
    priority: "P3",
    question: "Mua xe ảnh hưởng tới tiền mua nhà ra sao?",
  },
  {
    planIndex: 32,
    slug: "thue-mua-xe",
    priority: "P4",
    question: "Thuê tài chính ô tô khác vay mua xe thế nào?",
    library: "tien-ich",
  },

  // --------------------------------------------------------- Chứng khoán
  {
    planIndex: 33,
    slug: "loi-nhuan-co-phieu",
    priority: "P4",
    question: "Bán cổ phiếu thì còn lãi bao nhiêu?",
    library: "dau-tu",
  },
  {
    planIndex: 34,
    slug: "co-phieu-tang-truong-deu",
    priority: "P4",
    question: "Giá trị cổ phiếu nhạy với tăng trưởng thế nào?",
    library: "dau-tu",
  },
  {
    planIndex: 35,
    slug: "co-phieu-tang-truong-khong-deu",
    priority: "P4",
    question: "Hai giai đoạn tăng trưởng thay đổi định giá ra sao?",
    library: "dau-tu",
  },
  {
    planIndex: 36,
    slug: "capm",
    priority: "P4",
    question: "Rủi ro thị trường liên hệ lợi nhuận kỳ vọng thế nào?",
    library: "dau-tu",
  },
  {
    planIndex: 37,
    slug: "loi-nhuan-ky-vong",
    priority: "P4",
    question: "Các kịch bản đầu tư có mức dao động ra sao?",
    library: "dau-tu",
  },
  {
    planIndex: 38,
    slug: "loi-nhuan-ky-nam-giu",
    priority: "P4",
    question: "Lãi của tôi đến từ tăng giá hay từ dòng tiền?",
    library: "dau-tu",
  },
  {
    planIndex: 39,
    slug: "wacc",
    priority: "P4",
    question: "Doanh nghiệp cần mức sinh lời bao nhiêu?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 40,
    slug: "quyen-chon-black-scholes",
    priority: "P4",
    question: "Quyền chọn thay đổi theo giá và biến động thế nào?",
    library: "dau-tu",
  },
  {
    planIndex: 41,
    slug: "diem-pivot",
    priority: "P4",
    question: "Các cách tính điểm pivot khác nhau thế nào?",
    library: "dau-tu",
  },
  {
    planIndex: 42,
    slug: "fibonacci",
    priority: "P4",
    question: "Mức Fibonacci được đo từ đâu?",
    library: "dau-tu",
  },
  {
    planIndex: 43,
    slug: "thue-co-tuc",
    priority: "P4",
    question: "Thuế cổ tức ở Hoa Kỳ tính ra sao?",
    library: "hoa-ky",
  },

  // -------------------------------------------------------------- Hưu trí
  {
    planIndex: 44,
    slug: "ke-hoach-huu-tri",
    priority: "P3",
    question: "Mua nhà có làm tôi thiếu tiền hưu trí không?",
    library: "dai-han",
  },
  {
    planIndex: 45,
    slug: "tinh-huu-tri",
    priority: "P3",
    question: "Cần dành bao nhiêu cho hưu trí?",
    library: "dai-han",
  },
  {
    planIndex: 46,
    slug: "gop-401k",
    priority: "P4",
    question: "Quỹ 401(k) của Hoa Kỳ có đối ứng thế nào?",
    library: "hoa-ky",
  },
  {
    planIndex: 47,
    slug: "toi-da-401k",
    priority: "P4",
    question: "Góp 401(k) theo kỳ lương bao nhiêu là tối đa?",
    library: "hoa-ky",
  },
  {
    planIndex: 48,
    slug: "phan-tich-tiet-kiem-huu-tri",
    priority: "P3",
    question: "Kế hoạch hưu trí của tôi thiếu bao nhiêu và bù thế nào?",
    library: "dai-han",
  },
  {
    planIndex: 49,
    slug: "phan-tich-thu-nhap-huu-tri",
    priority: "P4",
    question: "Các nguồn thu nhập hưu trí bù chi tiêu thế nào?",
    library: "hoa-ky",
  },
  {
    planIndex: 50,
    slug: "thu-nhap-huu-tri",
    priority: "P3",
    question: "Vốn tích lũy đủ cho mức sống nào?",
    library: "dai-han",
  },
  {
    planIndex: 51,
    slug: "ira-truyen-thong-hay-roth",
    priority: "P4",
    question: "IRA truyền thống hay Roth phù hợp hơn?",
    library: "hoa-ky",
  },
  {
    planIndex: 52,
    slug: "rut-toi-thieu-bat-buoc",
    priority: "P4",
    question: "Phải rút tối thiểu bao nhiêu mỗi năm ở Hoa Kỳ?",
    library: "hoa-ky",
  },
  {
    planIndex: 53,
    slug: "uoc-tinh-an-sinh-xa-hoi",
    priority: "P4",
    question: "Trợ cấp an sinh xã hội Hoa Kỳ ước tính bao nhiêu?",
    library: "hoa-ky",
  },
  {
    planIndex: 54,
    slug: "phan-tich-an-sinh-xa-hoi",
    priority: "P4",
    question: "Nhận trợ cấp Hoa Kỳ sớm hay muộn thì hơn?",
    library: "hoa-ky",
  },
  {
    planIndex: 55,
    slug: "chi-tra-an-sinh-xa-hoi",
    priority: "P4",
    question: "Hộ gia đình nhận an sinh xã hội Hoa Kỳ bao nhiêu?",
    library: "hoa-ky",
  },
  {
    planIndex: 56,
    slug: "phan-bo-tai-san",
    priority: "P3",
    question: "Tiền sắp dùng để mua nhà nên được tách ra thế nào?",
  },
  {
    planIndex: 57,
    slug: "nien-kim",
    priority: "P4",
    question: "Khoản nhận niên kim gồm gốc và lãi thế nào?",
    // Moved off the long-term shelf: the tool carries `usRules: true`, a
    // summary ending "theo quy định Hoa Kỳ" and 35 USD figures in
    // `content/calculators/annuity.ts`, so the badge was telling hub readers
    // the opposite of what the page tells them. Resolved in favour of the
    // FLAG here, unlike the four long-horizon rows, which were genuinely
    // Vietnamese and had the flag removed instead.
    library: "hoa-ky",
  },

  // ------------------------------------------------------------------ Khác
  {
    planIndex: 58,
    slug: "lai-suat-thuc-te",
    priority: "P3",
    question: "Hai cách ghi lãi suất có so sánh được với nhau không?",
  },
  {
    planIndex: 59,
    slug: "tinh-phan-tram",
    priority: "P3",
    question: "Phần trăm, điểm phần trăm và số tiền khác nhau thế nào?",
  },
  {
    planIndex: 60,
    slug: "giam-gia-va-thue",
    priority: "P3",
    question: "Giá sau khi giảm và cộng thuế là bao nhiêu?",
  },
  {
    planIndex: 61,
    slug: "margin-va-markup",
    priority: "P4",
    question: "Margin và markup khác nhau thế nào?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 62,
    slug: "luong-gio-sang-luong-thang",
    priority: "P3",
    question: "Thu nhập theo giờ tương đương bao nhiêu mỗi tháng?",
  },
  {
    planIndex: 63,
    slug: "tang-luong",
    priority: "P3",
    question: "Tăng lương giúp tôi đạt mục tiêu sớm bao lâu?",
  },
  {
    planIndex: 64,
    slug: "du-bao-kinh-doanh",
    priority: "P4",
    question: "Doanh thu và lợi nhuận tương lai ra sao?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 65,
    slug: "cac-chi-so-tai-chinh",
    priority: "P4",
    question: "Đọc báo cáo tài chính doanh nghiệp thế nào?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 66,
    slug: "phan-tich-bao-cao-tai-chinh",
    priority: "P4",
    question: "Điều gì khiến kết quả doanh nghiệp thay đổi?",
    library: "doanh-nghiep",
  },
  {
    planIndex: 67,
    slug: "phan-phoi-rong",
    priority: "P3",
    question: "Số tiền báo giá khác số thực nhận bao nhiêu?",
  },
  {
    planIndex: 68,
    slug: "chi-phi-nhien-lieu",
    priority: "P3",
    question: "Ở xa hơn thì tốn thêm chi phí đi lại bao nhiêu?",
  },
  {
    planIndex: 69,
    slug: "tinh-tien-tip",
    priority: "P4",
    question: "Chia hóa đơn thì mỗi người bao nhiêu?",
    library: "tien-ich",
  },
  {
    planIndex: 70,
    slug: "tinh-ngay",
    priority: "P3",
    question: "Còn bao lâu đến mốc chuẩn bị mua nhà?",
  },
  {
    planIndex: 71,
    slug: "doi-don-vi",
    priority: "P2",
    question: "Sào, mẫu và mét vuông khác nhau theo vùng thế nào?",
  },
  {
    planIndex: 72,
    slug: "lam-phat-hoa-ky",
    priority: "P4",
    question: "Giá trị tiền theo CPI Hoa Kỳ thay đổi thế nào?",
    library: "hoa-ky",
  },
  {
    planIndex: 73,
    slug: "tin-phieu-kho-bac-hoa-ky",
    priority: "P4",
    question: "Lợi suất tín phiếu kho bạc Hoa Kỳ được ghi thế nào?",
    library: "hoa-ky",
  },
  {
    planIndex: 74,
    slug: "thue-luong-hoa-ky",
    priority: "P4",
    question: "Thuế lương FICA ở Hoa Kỳ gồm những gì?",
    library: "hoa-ky",
  },
];

/**
 * What the reading-comprehension pass decided about each tool's explanation.
 *
 * The founder's 2026-09-15 addition asks for selective emphasis and suitable
 * reading technique "across all twelve articles and the tool explanation
 * template". The twelve articles all got the full treatment. The 75 TOOLS did
 * not, and that is a decision rather than an omission — so it is recorded per
 * row here, in a separate map from `TOOL_DISPOSITIONS` for the same reason the
 * whole file is separate from the registry: the audit's own words say "no
 * forced chart or irrelevant acquisition CTA", and the same applies to a
 * reading funnel. Forcing a decision-first lede and bolded distinctions onto a
 * tip splitter would make it worse, not better.
 *
 * A DISPOSITION IS A PLANNED TREATMENT, NOT A COMPLETION CLAIM. This
 * distinction is the whole reason the paragraph exists, and an independent
 * review was right to demand it: an earlier version of this comment said
 * `context` meant the explanation "was already rewritten decision-first in an
 * earlier unit", which is FALSE for the capital rows still queued — the
 * time-value tool is still variable-first and the withdrawal tool is still on
 * its old standalone form, and their original unit is unimplemented. A
 * `reference` label cannot close the long-horizon rows either. So the four
 * values below say what treatment each row is PLANNED to get, and
 * `READING_WORK_PENDING` lists the rows whose own unit has not run yet.
 * Neither this map nor its tests establish that all 75 explanations are done.
 *
 * FOUR TREATMENTS:
 *
 * - `emphasis` — the tool's own "Cách tính" carries editor-selected semantic
 *   emphasis on the distinction a reader most often inverts, through the same
 *   `lib/prose-emphasis.ts` mechanism as the articles. Applied to the five P1
 *   tools plus the four P2 rows whose distinction an education article also
 *   teaches, so the tool and the article emphasise the same thing. This one
 *   IS verified: a test below reads each content file and fails if the
 *   phrases are absent or do not occur in the prose.
 * - `context` — the right treatment for this row is its own decision-first
 *   copy with visible assumptions rather than emphasis. Rows NOT listed in
 *   `READING_WORK_PENDING` have had their unit; rows listed there have not.
 *   "Had its unit" is not "has nothing left": what each row still owes is
 *   recorded per unit in the execution record, not here.
 * - `direct` — a short utility where a direct answer plus a compact table IS
 *   the right output. Deliberately no reading funnel and no emphasis.
 * - `reference` — library material: United States tax and retirement law,
 *   corporate finance, and investing study tools. This pass adds nothing to
 *   them. It does NOT waive their original content, source, consolidation or
 *   table requirements, which their own rows still owe.
 *
 * A test asserts this map covers every registry slug exactly once, so a new
 * calculator cannot ship without a stated reading disposition.
 */
export type ReadingDisposition =
  | "emphasis"
  | "context"
  | "direct"
  | "reference";

export const READING_DISPOSITIONS: Record<string, ReadingDisposition> = {
  // ---- emphasis: the five P1 tools, plus the four P2 rows an article teaches
  "vay-mua-nha": "emphasis",
  "so-sanh-khoan-vay": "emphasis",
  "kha-nang-mua-nha": "emphasis",
  "lai-suat-tha-noi": "emphasis",
  "muc-tieu-tiet-kiem": "emphasis",
  apr: "emphasis",
  "apr-nang-cao": "emphasis",
  "thue-hay-mua": "emphasis",
  "tai-cap-von": "emphasis",
  // Plan row 44, moved off `reference` when its own unit ran: the row is
  // consolidated behind `lib/calc/long-term-plan.ts`, localised to đồng by
  // `content/calculators/long-term-plan.ts`, and its method prose now carries
  // editor-selected phrases instead of the ALL-CAPS a rendered-page check
  // found it shouting in. It is correspondingly OFF `READING_WORK_PENDING`
  // below — the two have to move together, and `plan-disposition.test.ts`
  // asserts that in both directions.
  "ke-hoach-huu-tri": "emphasis",

  // ---- context: the planned treatment is this row's own decision-first copy
  // with visible assumptions, NOT emphasis. Rows listed in
  // READING_WORK_PENDING have not had that pass yet — see the type's
  // docstring, which this comment used to contradict by saying the work was
  // already done.
  "phan-tich-khoan-vay": "context",
  "lai-co-dinh-hay-tha-noi": "context",
  "chi-tra-lai": "context",
  "lai-kep": "context",
  "tien-gui-co-ky-han": "context",
  "tra-het-the-tin-dung": "context",
  "tra-toi-thieu-the-tin-dung": "context",
  "bat-dong-san-cho-thue": "context",
  "vay-mua-xe": "context",
  "phan-bo-tai-san": "context",
  "phan-phoi-rong": "context",
  "chi-phi-nhien-lieu": "context",
  "tang-luong": "context",
  "tinh-ngay": "context",
  "quy-tac-72": "context",
  "lai-suat-thuc-te": "context",
  "tinh-phan-tram": "context",
  "giam-gia-va-thue": "context",
  "luong-gio-sang-luong-thang": "context",
  "tiet-kiem-hoc-phi": "context",
  "thu-nhap-dau-tu": "context",
  "phi-quy-dau-tu": "context",
  "diem-chiet-khau": "context",
  "loi-suat-tuong-duong-thue": "context",
  "gia-tri-tien-te-theo-thoi-gian": "context",
  "ty-suat-loi-nhuan-roi": "context",
  "doi-don-vi": "context",

  // ---- direct: a short utility. A reading funnel here is noise.
  "tinh-tien-tip": "direct",
  "margin-va-markup": "direct",
  "tra-no-hai-tuan": "emphasis",
  "thue-mua-xe": "direct",

  // ---- emphasis: the eleven `dau-tu` investing rows
  // These were filed `reference` — "this pass added nothing" — until the
  // investing unit ran. They are the shelf where the mid-sentence capitals
  // lived, and replacing those with declared phrases IS a reading
  // treatment, so the filing had to move with the copy. Shares are 2,1-7,5%,
  // below the 6,2-13,6% the acquisition rows carry: these pages are mostly
  // formula derivations rather than argument, so there is less to mark, and
  // a lower share is the honest number rather than a gap to pad.
  //
  // THIS FILING AND THE PHRASE ARRAYS ARE ONE CHANGE, not two. Arrays
  // without the filing fails `check:markup` ("ships <strong> but is not
  // filed as `emphasis`"); the filing without the arrays fails it the other
  // way ("filed as `emphasis` but the page ships no <strong>"). There is no
  // safe order, only a safe atomic commit.
  "irr-npv": "emphasis",
  "trai-phieu": "emphasis",
  "loi-nhuan-co-phieu": "emphasis",
  "co-phieu-tang-truong-deu": "emphasis",
  "co-phieu-tang-truong-khong-deu": "emphasis",
  capm: "emphasis",
  "loi-nhuan-ky-vong": "emphasis",
  "loi-nhuan-ky-nam-giu": "emphasis",
  "quyen-chon-black-scholes": "emphasis",
  "diem-pivot": "emphasis",
  fibonacci: "emphasis",

  // ---- reference: library material, intentionally unchanged by this pass
  "vay-thuong-mai": "emphasis",
  "tiet-kiem-thue-vay-mua-nha": "reference",
  "tai-khoan-tiet-kiem-y-te-hoa-ky": "reference",
  wacc: "emphasis",
  "thue-co-tuc": "reference",
  // `ke-hoach-huu-tri` was here and is now filed `emphasis` above.
  "tinh-huu-tri": "emphasis",
  "gop-401k": "reference",
  "toi-da-401k": "reference",
  "phan-tich-tiet-kiem-huu-tri": "emphasis",
  "phan-tich-thu-nhap-huu-tri": "reference",
  "thu-nhap-huu-tri": "emphasis",
  "ira-truyen-thong-hay-roth": "reference",
  "rut-toi-thieu-bat-buoc": "reference",
  "uoc-tinh-an-sinh-xa-hoi": "reference",
  "phan-tich-an-sinh-xa-hoi": "reference",
  "chi-tra-an-sinh-xa-hoi": "reference",
  "nien-kim": "reference",
  "du-bao-kinh-doanh": "emphasis",
  "cac-chi-so-tai-chinh": "emphasis",
  "phan-tich-bao-cao-tai-chinh": "emphasis",
  "lam-phat-hoa-ky": "reference",
  "tin-phieu-kho-bac-hoa-ky": "reference",
  "thue-luong-hoa-ky": "reference",
};

/**
 * Rows whose own P3/P4 unit has NOT run, listed so no reading label can be
 * mistaken for finished work.
 *
 * An independent review checked the live pages and found the capital rows
 * still on their pre-plan form — the time-value tool variable-first rather
 * than question-first, the withdrawal tool still a standalone form — and the
 * long-horizon retirement rows likewise untouched by their own row's
 * requirements. Their reading treatment above is a PLAN. The content,
 * consolidation, source and table work those rows owe is still open, and this
 * set is what a completion audit should walk.
 *
 * **The seven capital rows came off this list in the eighteenth unit** (plan
 * indexes 15, 18, 21, 24, 25, 26, 27): the time-value tool opens on three
 * everyday questions with the solver preserved as a mode, the withdrawal tool
 * carries its balance/purchasing-power series and a scenario-qualified
 * caveat, the rental tool has its scenario comparison and rent→cost→debt
 * waterfall, and the tax-equivalent row cites its sources as links. Removing
 * them is a statement that their UNIT has run — see the eighteenth unit in
 * `docs/finhome-tools-execution-2026-09-14.md` for what is still open inside
 * them, including row 15's outstanding tax sign-off, which is recorded there
 * and in docs §6 rather than here.
 *
 * **Plan row 44 came off this list when the long-term foundation slice ran.**
 * `ke-hoach-huu-tri` is consolidated onto `resolveLongTermPlan`, denominated
 * in đồng from `content/calculators/long-term-plan.ts`, renders the trajectory
 * figure its row asked for, and carries declared emphasis instead of capitals
 * — so it is filed `emphasis` above and verified there. Removing it is a
 * statement that its unit has run.
 *
 * **Plan indexes 45, 48 and 50 then came off it too, and the list is now
 * EMPTY.** All four long-horizon routes render from one `resolveLongTermPlan`
 * call, in đồng from `content/calculators/long-term-plan.ts`, behind the
 * shared four-view control, with declared emphasis instead of capitals — 37
 * `<strong>` phrases across the four, each under the 0,2 share ratchet. Rows
 * 44 and 50 render the two chart models that had been built, tested and used
 * nowhere. Every P3 row has now had its unit.
 *
 * An empty list is the correct terminal state, not a missing one: there is no
 * row whose reading label overstates what shipped. If a future row needs a
 * pass, add it back and file it `reference` until its unit runs.
 *
 * THIS LIST LEGITIMATELY REACHED EMPTY. It used to be guarded by
 * `expect(READING_WORK_PENDING.length).toBeGreaterThan(0)`, which is the
 * "never pin the suite's own size" mistake docs §8 records: a correct repo
 * would fail that assertion the day the last unit ran. The guard is now
 * bidirectional against the treatment each row actually ships — see
 * `plan-disposition.test.ts`.
 */
export const READING_WORK_PENDING: readonly string[] = [];

/** The reading disposition for a slug, or undefined for an unknown one. */
export function readingDispositionFor(
  slug: string,
): ReadingDisposition | undefined {
  return READING_DISPOSITIONS[slug];
}

/**
 * Whether this row's own unit is still outstanding.
 *
 * `false` is NOT a claim that the row is finished — only that its reading
 * treatment is not blocked on a unit that has not run. Per-row completion
 * lives in the execution record, not here.
 */
export function readingWorkPending(slug: string): boolean {
  return READING_WORK_PENDING.includes(slug);
}

const BY_SLUG = new Map(TOOL_DISPOSITIONS.map((d) => [d.slug, d]));

/** The audit's disposition for a slug, or undefined for an unknown one. */
export function dispositionFor(slug: string): ToolDisposition | undefined {
  return BY_SLUG.get(slug);
}

/** Every tool in one tier, in plan order. */
export function dispositionsByPriority(
  priority: ToolPriority,
): ToolDisposition[] {
  return TOOL_DISPOSITIONS.filter((d) => d.priority === priority);
}
