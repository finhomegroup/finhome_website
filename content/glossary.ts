// The blog's legal and financial vocabulary, as a rule rather than a rewrite.
//
// WHY THIS FILE EXISTS
//
// The project owner read "thuê mua" on this site and objected twice. First to
// "tính thuê mua xe" — "làm gì có chuyện đã thuê rồi còn mua?" — where the
// product was renamed to `thuê tài chính`, because "thuê mua" asserted an
// eventual purchase that product does not guarantee. Then, after being told
// the term is correct in housing law, to "thuê mua nhà ở xã hội" as well. The
// second objection was the sharper one: the question was never "is this term
// legally correct", it was "will a reader understand it".
//
// THE DOCTRINE, from those two repairs:
//
//   RENAME when the term is wrong for the thing.
//   GLOSS ON FIRST USE when the term is right but opaque.
//   NEVER rewrite a news post's facts.
//
// A news body is a summary of a dated third-party report. Adding an
// explanation of a word is inside that contract; changing a figure, a date, a
// source link or an attribution is not.
//
// THE FIRST-USE CONVENTION
//
// A term's FIRST occurrence in a given body gets a short parenthetical or a
// following clause. Later occurrences in the same body get nothing. One gloss
// per body per term, because every post and every article is read standalone:
// a reader who arrives from search at the fourth post that says "thả nổi" has
// not read the first three.
//
// One sentence or one parenthetical. State the MECHANISM — what actually
// happens to the reader's money or paperwork — not a dictionary synonym and
// not a legal citation in place of an explanation. The model is the Côn Đảo
// gloss in `content/posts/gia-thue-mua-nha-o-xa-hoi-con-dao-133-000-dong.md`:
// it says what "thuê mua" does to the money and deliberately states NO
// percentage, because the up-front share is set by housing law and moved
// between the 2014 and 2023 laws, so a number in a news post goes stale.
// Do not add a percentage or a date you cannot source.
//
// HOW THE GUARD DETECTS A GLOSS — and why it is not a marker
//
// `glossary.test.ts` requires, near a term's first occurrence, at least
// `minCues` of that term's declared `cues`. The alternatives were considered
// and rejected:
//
//   - An exact canonical sentence. Forces identical wording into bodies about
//     different subjects, and `biên lãi suất` proves the wording cannot be
//     identical: in four news bodies it is the borrower's margin over a
//     reference rate, and in a fifth it is the bank's own net interest
//     margin. One sentence cannot be right in both.
//   - An invisible marker (an HTML comment; react-markdown drops raw HTML, so
//     it would not render). A marker records a CLAIM that a gloss exists. It
//     stays green when the gloss is deleted and the marker is not, which is
//     exactly the failure a guard is for.
//
// Cues are the mechanism in words. That makes the check fail in both of the
// ways that matter: when the gloss is absent, and when it is vacuous ("thuê
// mua là một hình thức nhà ở xã hội" contains no cue). The cost is that cues
// constrain phrasing a little; that is the trade taken on purpose.
//
// WHAT IS NOT SWEPT, ON PURPOSE
//
// Titles and excerpts in `content/posts.ts`. The Côn Đảo entry's title and
// excerpt both say "thuê mua" and neither is glossed: a card title on the blog
// index or in a search result has no room for a parenthetical, and the gloss
// belongs in the body the card links to — which is where the guard requires
// it. An engine-generated chart summary, assumption list or table is not swept
// either: those come from the calculator model, so no editor can put a gloss
// in them.
//
// TIERS
//
// `enforcement: "first-use"` is checked by the guard in every body where the
// term occurs. `enforcement: "reference"` is documented for whoever writes the
// next post and deliberately NOT enforced — each such entry says why, and the
// guard still requires it to carry a real gloss. The non-vacuity floors in the
// test are set on the ENFORCED tier, so the file cannot be quietly emptied by
// demoting everything to reference.

/** A body the guard sweeps: a news markdown file, or an education article. */
export type GlossBodyId = `news:${string}` | `edu:${string}`;

export type GlossExemption = {
  /** `news:<slug>` or `edu:<planId>`. */
  body: GlossBodyId;
  /** Why a gloss here would be padding rather than help. */
  reason: string;
};

export type GlossaryTerm = {
  /** The term exactly as it appears in the corpus. Matched case-insensitively. */
  term: string;
  /** Short plain-Vietnamese gloss, stating the mechanism. */
  gloss: string;
  /**
   * The instrument that genuinely governs the term, when one does.
   *
   * Omitted far more often than filled. Most of these are banking or
   * accounting vocabulary with no instrument behind them, and naming a decree
   * that merely mentions a word is worse than naming none. Nothing here cites
   * an article or a clause number: this file was written from the corpus, not
   * from the gazette.
   */
  instrument?: string;
  /** Where it must be glossed, and why. */
  where: string;
  enforcement: "first-use" | "reference";
  /**
   * Phrases a real gloss contains. Matched case-insensitively anywhere in the
   * gloss window. Empty only for the reference tier.
   */
  cues: readonly string[];
  /**
   * How many distinct cues the window must contain. Default 1.
   *
   * Raised to 2 where the mechanism has two halves a reader needs both of —
   * `thuê mua` is the case that started this: "pay now" without "own only at
   * the end" is the half that misled the owner.
   */
  minCues?: number;
  exemptions?: readonly GlossExemption[];
};

export const GLOSSARY: readonly GlossaryTerm[] = [
  {
    term: "thuê mua",
    gloss:
      "Người thuê mua trả trước một phần giá trị căn nhà, phần còn lại trả dần hằng tháng như tiền thuê, và chỉ được chuyển quyền sở hữu sau khi hết hạn hợp đồng và trả hết phần còn lại.",
    instrument: "Luật Nhà ở 27/2023/QH15",
    where:
      "Mọi bài có nhắc thuê mua như một phương án của người đọc. Miễn khi cụm từ chỉ xuất hiện trong tên một loại hợp đồng giữa danh sách giấy tờ.",
    enforcement: "first-use",
    // Two cues: "trả trước một phần" alone is the half that misled the owner.
    // The gloss has to carry "and you own it only at the end" as well.
    minCues: 2,
    cues: [
      "trả trước một phần giá trị",
      "trả dần hằng tháng",
      "sau khi hết hạn hợp đồng",
      "chưa sang tên ngay",
    ],
    exemptions: [
      {
        body: "news:dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026",
        reason:
          "Cụm từ chỉ nằm trong tên hợp đồng giữa danh sách hồ sơ vay (“hợp đồng mua hoặc thuê mua đã ký với chủ đầu tư”). Đó đúng là dòng chữ trên giấy tờ người đọc mang đi nộp; chèn một lời giải thích vào giữa danh sách giấy tờ làm đứt mạch đọc của danh sách.",
      },
      {
        body: "news:vay-von-mua-nha-o-xa-hoi-dieu-kien",
        reason:
          "Cùng lý do: “hợp đồng mua/thuê mua nhà ở xã hội hợp lệ” là tên một điều kiện hồ sơ, không phải một phương án bài đang gợi cho người đọc.",
      },
      {
        body: "news:uu-tien-mua-nha-gia-phu-hop-tren-20-trieu",
        reason:
          "“người mua, thuê mua” ở đây là cách liệt kê nhóm đối tượng của một đề xuất chính sách, và điều đáng đọc trong gạch đầu dòng đó là giới hạn một căn cùng thời hạn không được bán lại. Giải nghĩa một nhóm đối tượng không giúp người đọc hiểu giới hạn đó.",
      },
    ],
  },
  {
    term: "thả nổi",
    gloss:
      "Sau kỳ ưu đãi, lãi suất không giữ nguyên: ngân hàng đặt lại theo chu kỳ đã ghi trong hợp đồng, bằng một lãi suất tham chiếu cộng biên, nên khoản trả hằng tháng được tính lại theo mức mới.",
    where:
      "Mọi bài nói về lãi sau ưu đãi. Đây là từ có hậu quả trực tiếp lớn nhất với người vay trong toàn bộ blog.",
    enforcement: "first-use",
    cues: [
      "đặt lại theo chu kỳ",
      "điều chỉnh lại theo chu kỳ",
      "tham chiếu cộng biên",
      "tính lại theo mức mới",
    ],
    exemptions: [
      {
        body: "edu:C03",
        reason:
          "Lần xuất hiện duy nhất là trong tên công cụ ở bước thực hành (“Mở công cụ Khoản vay lãi thả nổi”). Bước thực hành phải gọi đúng tên người đọc sẽ thấy trên màn hình; bài này dạy chuyện khác và trang công cụ đó tự giải thích cơ chế.",
      },
    ],
  },
  {
    term: "biên lãi suất",
    gloss:
      "Phần ngân hàng cộng thêm vào lãi suất tham chiếu để ra lãi suất bạn phải trả. Ngân hàng đổi phần cộng thêm này thì lãi của bạn đổi theo, dù lãi suất tham chiếu không đổi.",
    where:
      "Mọi bài dùng cụm này theo nghĩa phần cộng thêm trên khoản vay của người đọc. Nghĩa thứ hai — biên lãi suất netto của chính ngân hàng — là một mục riêng bên dưới.",
    enforcement: "first-use",
    cues: ["cộng thêm vào lãi suất tham chiếu", "cộng vào lãi suất tham chiếu"],
  },
  {
    term: "biên lãi suất netto",
    gloss:
      "Thước đo của chính ngân hàng: khoảng cách giữa lãi thu từ cho vay và lãi trả cho tiền gửi, tính trên tài sản sinh lời. Đây không phải phần cộng thêm vào khoản vay của người đọc.",
    where:
      "Bài dẫn lời lãnh đạo ngân hàng về NIM. Cụm này dài hơn và chứa “biên lãi suất”, nên nó chiếm lần xuất hiện đó theo luật khớp dài nhất — hai nghĩa không thể dùng chung một lời giải thích.",
    enforcement: "first-use",
    cues: ["lãi thu từ cho vay và lãi trả cho tiền gửi"],
  },
  {
    term: "dư nợ",
    gloss:
      "Phần gốc còn nợ, tức số tiền đã vay mà chưa được trả lại. Lãi mỗi kỳ được tính trên số đó, nên đã trả nhiều không có nghĩa là còn nợ ít.",
    where:
      "Mọi bài và mọi bài học có dùng cụm này, cả khi nó chỉ tổng dư nợ của cả hệ thống ngân hàng — cơ chế vẫn là một: tiền đã cho vay mà chưa được trả.",
    enforcement: "first-use",
    cues: [
      "phần gốc còn nợ",
      "đã cho vay mà chưa được trả",
      "lãi được tính trên dư nợ",
      "số tiền đã vay mà chưa",
    ],
  },
  {
    term: "giải ngân",
    gloss:
      "Tiền đã cam kết được chuyển ra thực tế, thường theo từng đợt gắn với tiến độ, chứ không phải được duyệt là đã có tiền.",
    where:
      "Mọi bài dùng cụm này, cả nghĩa ngân hàng chuyển tiền vay và nghĩa doanh nghiệp rót vốn vào dự án: cùng một cơ chế, tiền đã hứa được chuyển ra theo đợt. MỘT KHUÔN MẪU ĐÁNG GHI LẠI: trong các bài học, cụm này gần như chỉ xuất hiện bên trong TÊN một khoản phí — “phí trả ngay khi giải ngân” — nằm ở nhãn bảng, ô giả định hoặc ghi chú nguồn. Đó là lý do phần lớn miễn trừ của mục này thuộc bài học, còn C12 là chỗ duy nhất cụm từ nằm trong một câu văn thật (ngày giải ngân mới so với ngày tất toán cũ) và được giải nghĩa tại đó.",
    enforcement: "first-use",
    cues: [
      "tiền đã cam kết được chuyển ra",
      "được chuyển ra thực tế",
      "chuyển ra theo từng đợt",
    ],
    exemptions: [
      {
        body: "edu:C02",
        reason:
          "Chỉ xuất hiện trong tên một khoản phí giữa danh sách chi phí công cụ chưa tính (“bảo hiểm khoản vay, phí thẩm định và phí giải ngân”). Tên phí là thứ người đọc phải đối chiếu với báo giá của ngân hàng, và danh sách đó cần ngắn để đọc được.",
      },
      {
        body: "edu:C05",
        reason:
          "Lần đầu nằm trong một ô của bảng giả định (“20.000.000 ₫, trả khi giải ngân”). Ô bảng không phải chỗ đặt câu giải nghĩa; bài đã nói rõ đó là khoản trả một lần ngay đầu khoản vay.",
      },
      {
        body: "edu:C13",
        reason:
          "Lần đầu nằm trong NHÃN của một dòng bảng giả định (“Báo giá A — phí trả ngay khi giải ngân”), và mọi lần xuất hiện khác trong bài cũng là tên đúng của ô nhập trên công cụ. Nhãn bảng phải khớp chữ với báo giá và với màn hình người đọc đang nhìn; kéo dài nhãn bằng một câu giải nghĩa làm lệch bảng hai cột, và đó là thay đổi hình thức không kiểm chứng được bằng test nào ở đây.",
      },
      {
        body: "edu:C15",
        reason:
          "Lần duy nhất cụm từ xuất hiện trong bài này là bên trong ghi chú của một nguồn tham khảo, nơi ghi chú có nhiệm vụ nói nguồn đó chống lưng cho KHÁI NIỆM nào. Chèn lời giải nghĩa vào một trích dẫn làm trích dẫn nói nhiều hơn thứ nó nói; cụm từ không nằm trong câu văn nào của bài.",
      },
    ],
  },
  {
    term: "tất toán",
    gloss:
      "Trả hết phần còn nợ và đóng khoản vay, có thể trước hạn. Trả trước hạn thường kèm một khoản phí do hợp đồng quy định.",
    where:
      "Mọi bài học có dùng cụm này. Không xuất hiện trong bài tin nào.",
    enforcement: "first-use",
    cues: [
      "trả hết phần còn nợ và đóng khoản vay",
      "trả hết phần còn nợ để đóng khoản vay",
    ],
  },
  {
    term: "sổ hồng",
    gloss:
      "Cách gọi quen dùng của Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất — tờ giấy xác nhận ai là chủ. Không có nó thì người mua chưa được đứng tên.",
    instrument:
      "Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất",
    where:
      "Mọi bài nhắc sổ hồng. Cần nói rõ đây là tên dân gian của một giấy tờ có tên pháp lý khác, vì đó chính là tên người đọc sẽ thấy trên văn bản.",
    enforcement: "first-use",
    cues: [
      "cách gọi quen dùng của Giấy chứng nhận",
      "tên pháp lý là Giấy chứng nhận",
    ],
  },
  {
    term: "sổ đỏ",
    gloss:
      "Cùng một giấy tờ với sổ hồng: cách gọi quen dùng của Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất. Màu bìa từng khác nhau, tên pháp lý thì nay là một.",
    instrument:
      "Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất",
    where:
      "Mọi bài nhắc sổ đỏ. Khai báo riêng khỏi sổ hồng vì hai cụm là hai chuỗi chữ khác nhau và người đọc gặp cụm nào thì cần lời giải thích tại chỗ đó.",
    enforcement: "first-use",
    cues: [
      "cách gọi quen dùng của Giấy chứng nhận",
      "tên pháp lý là Giấy chứng nhận",
    ],
  },
  {
    term: "định danh điện tử",
    gloss:
      "Một mã số riêng, không trùng lặp, gắn với từng thửa đất hoặc từng căn nhà, để tra cứu hồ sơ của chính bất động sản đó trong một cơ sở dữ liệu chung.",
    where:
      "Mọi bài về mã định danh bất động sản hoặc đất đai. Bản thân các bài đã nói mã là duy nhất nhưng chưa nói mã dùng để làm gì.",
    enforcement: "first-use",
    minCues: 2,
    cues: ["mã số riêng", "không trùng lặp", "tra cứu hồ sơ", "tra cứu thông tin pháp lý"],
  },
  {
    term: "room tín dụng",
    gloss:
      "Phần hạn mức cho vay mà ngân hàng còn được dùng trong năm. Hết hạn mức thì hồ sơ đủ điều kiện vẫn phải chờ.",
    where: "Bài duy nhất dùng cụm này. Từ nghề thuần, người đọc phổ thông không suy ra được.",
    enforcement: "first-use",
    cues: ["hạn mức cho vay", "còn được phép cho vay"],
  },
  {
    term: "trích lập dự phòng",
    gloss:
      "Ngân hàng tự trừ trước vào lợi nhuận một khoản để bù cho các khoản vay có nguy cơ không thu hồi được. Trừ nhiều hơn thường đi kèm điều kiện cho vay chặt hơn.",
    where:
      "Mọi bài nhắc việc ngân hàng trích lập dự phòng. Người đọc cần hiểu đây là tiền trừ trước vào lợi nhuận, không phải tiền đã mất.",
    enforcement: "first-use",
    cues: ["trừ trước vào lợi nhuận", "trừ trước một khoản vào lợi nhuận"],
  },

  // --- reference tier: documented, deliberately not enforced ---------------
  {
    term: "nhà ở xã hội",
    gloss:
      "Nhà được Nhà nước hỗ trợ (đất, thuế, vốn) để bán, cho thuê hoặc cho thuê mua cho những nhóm được hưởng chính sách. Giá do cơ quan có thẩm quyền duyệt, và điều kiện được mua cũng do cơ quan đó xét, không do chủ đầu tư quyết.",
    instrument: "Luật Nhà ở 27/2023/QH15",
    where:
      "KHÔNG bắt buộc giải nghĩa. Cụm này xuất hiện trong nhiều bài nhất của cả blog, thường ngay trên tiêu đề, và là chủ đề của bài chứ không phải một từ nghề chen vào. Nó cũng là cụm quen mặt trên báo và truyền hình tiếng Việt. Thứ người đọc thực sự thiếu là cơ chế xét duyệt và giá — và bài nào xoay quanh chuyện đó thì đã nói rõ. Ghi ở đây để người viết bài sau có sẵn câu giải thích khi cần, không để làm hàng rào.",
    enforcement: "reference",
    cues: [],
  },
  {
    term: "thanh khoản",
    gloss:
      "Khả năng bán được trong thời gian hợp lý mà không phải hạ giá mạnh. Thanh khoản kém nghĩa là muốn bán thì phải chờ lâu hoặc giảm giá, chứ không nghĩa là tài sản mất giá.",
    where:
      "Chưa bắt buộc. Cụm này xuất hiện trong hàng chục bài tin và vài bài học, đủ nhiều để việc giải nghĩa từng bài là một đơn vị công việc riêng chứ không phải phần phụ của đơn vị này. Nghĩa thì đơn nhất và ổn định, nên đây là ứng viên sạch nhất cho lần sau: đổi `enforcement` sang `first-use` rồi để hàng rào liệt kê các bài còn thiếu.",
    enforcement: "reference",
    cues: [],
  },
  {
    term: "niêm yết",
    gloss:
      "Không giải nghĩa được bằng một câu, vì trong blog này cụm từ mang ba nghĩa khác nhau: doanh nghiệp niêm yết (có cổ phiếu giao dịch trên sàn), niêm yết công khai hồ sơ (dán thông báo tại trụ sở cơ quan để ai có ý kiến thì nêu), và lãi suất niêm yết (mức ngân hàng công bố, chưa gồm phí). Bài nào dùng nghĩa nào thì giải nghĩa theo nghĩa đó.",
    where:
      "KHÔNG bắt buộc, và cố tình không khai báo thành một mục có hàng rào: một lời giải thích chung cho ba nghĩa này sẽ sai ở hai nghĩa. Đáng chú ý là “giá niêm yết” — ứng viên trong đề bài — không xuất hiện ở đâu trong blog.",
    enforcement: "reference",
    cues: [],
  },
];

/** Terms the guard enforces, in declaration order. */
export function enforcedTerms(): readonly GlossaryTerm[] {
  return GLOSSARY.filter((entry) => entry.enforcement === "first-use");
}

/** Terms documented for writers but not enforced. */
export function referenceTerms(): readonly GlossaryTerm[] {
  return GLOSSARY.filter((entry) => entry.enforcement === "reference");
}

export function findTerm(term: string): GlossaryTerm | undefined {
  return GLOSSARY.find((entry) => entry.term === term);
}
