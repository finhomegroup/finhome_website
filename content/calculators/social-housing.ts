/**
 * Vietnamese copy for `/cong-cu/nha-o-xa-hoi/`.
 *
 * NO FORM STRINGS. This route renders the SAME `AffordabilityCalculator` the
 * commercial route does, so every field label, unit and error message comes
 * from `content/calculators/affordability.ts` and cannot drift between the two
 * routes. What lives here is this route's own framing — title, lede, the
 * statutory notice, the three overridden help strings, the method prose, the
 * FAQ, and the decrees as citable sources.
 *
 * WHY THE THREE HELP STRINGS ARE HERE AND NOT THERE. They are the only field
 * copy this route overrides, and each one exists because the same input means
 * something different under this programme: 80% and 300 months are statutory
 * ceilings rather than the reader's assumptions, and 5,4% is a national
 * default that a provincial resolution may undercut. See the prop's docstring
 * in `components/affordability-calculator.tsx`.
 *
 * EVERY FIGURE QUOTED IN THIS FILE CARRIES ITS INSTRUMENT, and the figures
 * themselves live in `lib/calc/social-housing.ts` rather than being retyped
 * here. Nothing in this file is legal advice or an eligibility decision.
 */
import {
  NOXH_FLOOR_AREA,
  NOXH_INCOME_CEILINGS,
  NOXH_LOAN,
} from "@/lib/calc/social-housing";

const current = NOXH_INCOME_CEILINGS[NOXH_INCOME_CEILINGS.length - 1];

/** "25", "50", "35" — in triệu, for prose. */
const trieu = (dong: number) => String(dong / 1_000_000);

export const SOCIAL_HOUSING = {
  metaTitle: "Mua nhà ở xã hội — Tính tầm giá theo lãi suất ưu đãi",
  metaDescription:
    "Kiểm tra mức thu nhập so với trần quy định và tính tầm giá nhà ở xã hội theo lãi suất ưu đãi, mức vay tối đa và thời hạn tối đa mà pháp luật cho phép.",

  pageTitle: "Mua nhà ở xã hội",
  lede: "Cùng phép tính của công cụ Khả năng mua nhà, nhưng mở ở các tham số của chương trình nhà ở xã hội: lãi suất ưu đãi, mức cho vay tối đa và thời hạn tối đa theo quy định. Kèm phép so thu nhập của bạn với trần thu nhập đang áp dụng.",

  /**
   * Above the calculator, because it changes how every figure below it should
   * be read: three conditions govern eligibility and this page can only
   * compute one of them.
   */
  notice:
    "Trang này tính được MỘT trong ba điều kiện: thu nhập so với trần quy định. Hai điều kiện còn lại — về nhà ở đang có và về việc đã từng hưởng chính sách nhà ở — là điều kiện giấy tờ, do cơ quan có thẩm quyền xác nhận, và trang này không biết. Đủ trần thu nhập KHÔNG có nghĩa là đủ điều kiện mua.",

  /** The three overridden field help strings. */
  rateHelp: `Mặc định ${String(NOXH_LOAN.annualRatePercent).replace(".", ",")}%/năm theo ${NOXH_LOAN.rateInstrument}, áp dụng từ 01/12/2025 theo ${NOXH_LOAN.rateAppliedBy}. Đây là mức của kênh Ngân hàng Chính sách xã hội trên cả nước, không phải mức của tỉnh bạn: một số địa phương có nghị quyết HĐND hạ thấp hơn — Hà Nội áp dụng 4,8%/năm theo Nghị quyết 56/2025/NQ-HĐND. Hãy hỏi mức của nơi bạn mua rồi nhập lại.`,

  termHelp: `Tối đa ${NOXH_LOAN.maxTermMonths} tháng (25 năm) kể từ ngày giải ngân khoản vay đầu tiên, theo ${NOXH_LOAN.termsInstrument}. Đây là trần của quy định, không phải thời hạn bạn buộc phải chọn — nhập ngắn hơn nếu bạn muốn trả nhanh hơn.`,

  ltvHelp: `${NOXH_LOAN.maxLtvPercent}% là mức cho vay TỐI ĐA theo ${NOXH_LOAN.termsInstrument} đối với mua và thuê mua nhà ở xã hội — đây là quy định, không phải giả định của bạn như ở công cụ vay thương mại. Nghĩa là bạn cần tự có ít nhất ${100 - NOXH_LOAN.maxLtvPercent}% giá trị hợp đồng, chưa kể chi phí mua ngoài giá.`,

  /** The documentary conditions, as a checklist the reader confirms. */
  conditions: {
    title: "Ba điều kiện, và trang này chỉ tính được một",
    intro:
      "Điều kiện mua nhà ở xã hội gồm ba nhóm. Chỉ nhóm thu nhập là một phép tính; hai nhóm còn lại là giấy tờ bạn phải tự đối chiếu và do cơ quan có thẩm quyền xác nhận.",
    items: [
      {
        label: "Thu nhập — TÍNH ĐƯỢC ở đây",
        body: `Thu nhập bình quân hàng tháng THỰC NHẬN, tính trên 12 tháng liền kề trước thời điểm cơ quan có thẩm quyền xác nhận. Trần hiện hành theo ${current.instrument} (hiệu lực ${"07/04/2026"}): người độc thân không quá ${trieu(current.ceilings.single)} triệu đồng/tháng; vợ chồng đã kết hôn tổng không quá ${trieu(current.ceilings.couple)} triệu đồng/tháng; người độc thân đang nuôi con chưa thành niên không quá ${trieu(current.ceilings.singleParentMinorChildren)} triệu đồng/tháng.`,
      },
      {
        label: "Nhà ở đang có — KHÔNG tính được ở đây",
        body: `Chưa có nhà ở thuộc sở hữu của mình tại tỉnh, thành phố nơi có dự án; hoặc nếu đã có thì diện tích bình quân phải thấp hơn ${NOXH_FLOOR_AREA.perPersonSqm} m² sàn/người, tính trên người đứng đơn, vợ hoặc chồng, cha mẹ (nếu có) và các con đăng ký thường trú tại căn nhà đó. Theo ${NOXH_FLOOR_AREA.instrument}.`,
      },
      {
        label: "Chính sách đã hưởng — KHÔNG tính được ở đây",
        body: "Chưa được mua, thuê hoặc thuê mua nhà ở xã hội và chưa được hưởng chính sách hỗ trợ nhà ở dưới mọi hình thức tại tỉnh, thành phố nơi có dự án.",
      },
    ],
    note: "Nghị quyết 201/2025/QH15 còn quy định trường hợp người đã có nhà ở thuộc sở hữu của mình nhưng cách xa địa điểm làm việc vẫn có thể được hưởng chính sách. Nếu bạn thuộc trường hợp đó, đừng tự loại mình khỏi chương trình dựa trên điều kiện thứ hai ở trên.",
  },

  /** The "Cách tính" block. Named `formula` like the other 75. */
  formula: {
    title: "Con số nào đổi so với vay thương mại",
    body: [
      `Phép tính ở đây là đúng phép tính của công cụ Khả năng mua nhà — cùng một mô hình, cùng các ô nhập. Chỉ ba tham số mở ở giá trị khác: lãi suất ${String(NOXH_LOAN.annualRatePercent).replace(".", ",")}%/năm thay cho mức thương mại bạn tự nhập, mức cho vay tối đa ${NOXH_LOAN.maxLtvPercent}% thay cho giả định của bạn, và thời hạn tối đa ${NOXH_LOAN.maxTermMonths} tháng.`,
      "Khác biệt lớn nhất là lãi suất, và nó không nhỏ. Các bài trong bộ Mua nhà bằng con số dùng mức giả lập 8,5%/năm cho khoản vay thương mại; chênh lệch hơn ba điểm phần trăm trên một khoản vay 20 năm đổi hẳn câu trả lời về tầm giá, chứ không chỉ làm nó dịch đi một ít.",
      `Khác biệt thứ hai đi ngược chiều: mức cho vay tối đa ${NOXH_LOAN.maxLtvPercent}% là một trần cứng, nên bạn phải tự có ít nhất ${100 - NOXH_LOAN.maxLtvPercent}% giá trị hợp đồng cộng với chi phí mua ngoài giá. Ở công cụ vay thương mại, ô đó mặc định 100% — nghĩa là chưa đặt yêu cầu trả trước nào. Vì vậy với cùng số tiền tích lũy, chương trình này có thể cho tầm giá thấp hơn dù lãi suất thấp hơn, và công cụ sẽ nói giới hạn nào đang chặn.`,
      "Một điểm ít người biết: các khoản vay đã ký hợp đồng tín dụng với Ngân hàng Chính sách xã hội TRƯỚC ngày Nghị định 261/2025/NĐ-CP có hiệu lực (10/10/2025) được điều chỉnh hợp đồng để áp mức lãi suất mới cho dư nợ gốc thực tế. Nếu bạn đang trả một khoản vay nhà ở xã hội cũ với lãi suất cao hơn, đây là việc nên hỏi lại ngân hàng.",
    ],
    emphasis: [
      "chênh lệch hơn ba điểm phần trăm trên một khoản vay 20 năm đổi hẳn câu trả lời về tầm giá",
      "là một trần cứng",
      "được điều chỉnh hợp đồng để áp mức lãi suất mới cho dư nợ gốc thực tế",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
    {
      q: "Thu nhập của tôi vượt trần thì trang này còn dùng được không?",
      a: "Còn. Công cụ vẫn tính và vẫn nói rõ bạn đang trên trần bao nhiêu, vì hai lý do. Thứ nhất, trần đã được nâng hai lần trong hai năm — từ 20 lên 25 triệu với người độc thân và từ 40 lên 50 triệu với vợ chồng — nên “trên trần hôm nay” không phải “không đủ điều kiện”. Thứ hai, thành phần hộ và thu nhập có thể đổi, và bạn có thể đang tính giúp người khác.",
    },
    {
      q: "Trần thu nhập tính trên thu nhập gộp hay thực nhận?",
      a: "Thực nhận, và tính bình quân 12 tháng liền kề trước thời điểm cơ quan có thẩm quyền xác nhận hồ sơ. Đây là điểm dễ nhầm nhất: nhiều người tự loại mình dựa trên thu nhập gộp, trong khi quy định nói về mức thực nhận.",
    },
    {
      q: "Tôi làm nghề tự do, không có hợp đồng lao động thì xác nhận thu nhập thế nào?",
      a: "Với người thu nhập thấp tại đô thị không có hợp đồng lao động, việc xác nhận do Công an cấp xã nơi thường trú hoặc tạm trú thực hiện, căn cứ cơ sở dữ liệu dân cư, thời hạn giải quyết 07 ngày kể từ ngày nhận đơn. Trang này không làm thay thủ tục đó và không biết hồ sơ của bạn sẽ được xác nhận thế nào.",
    },
    {
      q: "Lãi suất 5,4%/năm có cố định suốt kỳ hạn không?",
      a: "Trang này không khẳng định điều đó. Mức 5,4%/năm là mức đang áp dụng theo quy định hiện hành, và quy định có thể thay đổi: chính mức này là kết quả của một lần điều chỉnh. Hợp đồng tín dụng của bạn mới là nơi nói lãi suất được đặt lại thế nào. Hãy nhập mức bạn được báo, và nếu hợp đồng có cơ chế đặt lại thì xem thêm công cụ Khoản vay lãi thả nổi.",
    },
    {
      q: "Công cụ này có cho biết ở gần tôi có dự án nào không?",
      a: "Không. Trang này là một phép tính về ngân sách, không phải danh mục dự án. Nguồn cung nhà ở xã hội, việc dự án có đủ điều kiện mở bán hay còn suất hay không đều nằm ngoài phạm vi, và trên thực tế đó thường là giới hạn thật sự chứ không phải con số tầm giá.",
    },
    ],
  },

  /**
   * The `sources` slot exists for exactly this case — a tool that PREFILLS a
   * legal parameter. `intro` carries the provenance limit, because a list of
   * official links implies a completeness no page here has earned.
   */
  sources: {
    title: "Văn bản dẫn chiếu",
    intro:
      "Các văn bản dưới đây là căn cứ của những con số trang này điền trước. Danh sách này không đầy đủ, không phải bản hợp nhất, và không thay thế việc đối chiếu với cơ quan có thẩm quyền hoặc ngân hàng nơi bạn vay. Quy định trong lĩnh vực này đã thay đổi nhiều lần; hãy kiểm tra ngày hiệu lực.",
    items: [
      {
        url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
        label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
        note: "Căn cứ của lãi suất 5,4%/năm, lãi nợ quá hạn 130%, mức cho vay tối đa 80% và thời hạn tối đa 25 năm; hiệu lực 10/10/2025. Điều 2 và khoản 2 Điều 3 có hiệu lực đến hết 31/5/2030.",
      },
      {
        url: "https://baochinhphu.vn/chinh-thuc-nang-muc-tran-thu-nhap-duoc-mua-nha-o-xa-hoi-len-25-trieu-dong-thang-tu-7-4-2026-102260408114223058.htm",
        label: "Nghị định 136/2026/NĐ-CP — nâng trần thu nhập (Báo Chính phủ)",
        note: "Căn cứ của trần thu nhập 25 / 50 / 35 triệu đồng mỗi tháng, hiệu lực 07/04/2026, sửa khoản 1 Điều 30 Nghị định 100/2024/NĐ-CP.",
      },
    ],
  },

  /** What this route cannot answer. Same register as the article's own block. */
  limits: {
    title: "Trang này không trả lời được gì",
    items: [
      "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Hai trong ba nhóm điều kiện là giấy tờ, do cơ quan có thẩm quyền xác nhận.",
      "Ngân hàng Chính sách xã hội có duyệt cho bạn vay hay không, và duyệt bao nhiêu.",
      "Ở khu vực bạn muốn ở có dự án nào, dự án có đủ điều kiện mở bán hay còn suất hay không.",
      "Lãi suất áp dụng tại tỉnh, thành phố của bạn. Mức điền trước là mức toàn quốc; địa phương có thể thấp hơn.",
      "Quy định sau thời điểm bạn đọc trang này. Các mức ở đây đã thay đổi ba lần trong hai năm.",
    ],
  },
} as const;
