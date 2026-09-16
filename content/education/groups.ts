// The five decision groups of "Mua nhà bằng con số".
//
// WHY FIVE GROUPS AND NOT A FIFTH NEWS TOPIC. The four market topics — Giá &
// Cung, Cầu & Thanh khoản, Khu vực & Hạ tầng, Chính sách & Sự kiện — organise
// what the MARKET did, on a date. These five organise a DECISION the reader is
// making, and they do not go out of date. They are two different axes, so the
// collection is a `kind`, not a topic.
//
// MUTUALLY EXCLUSIVE, AND THE RULE THAT MAKES IT SO. Each article has exactly
// one group. The boundary is not "which tool does it use" — several groups use
// the mortgage calculator — but:
//
//   · varying ONE parameter inside a single plan stays in the group that owns
//     that plan (a 20-vs-25-year term comparison is still PAYMENT);
//   · choosing between DIFFERENT products, quotes or tenures is CHOICE;
//   · reacting to a change in circumstances is RESILIENCE.
//
// That rule is why C07 (term length) is PAYMENT while C05 (two quotes) is
// CHOICE, and why C03 (a rate shock) is RESILIENCE while C11 (picking a rate
// structure at signing) is CHOICE.
//
// OUT OF SCOPE for the whole collection, stated once: legal title and
// paperwork, choosing a project or developer, negotiating a price, and any
// financial decision that is not about buying a home. Nothing here is advice
// about a specific product, and no article quotes a current bank rate.

export type EducationGroupId =
  | "BUDGET"
  | "SAVING"
  | "PAYMENT"
  | "CHOICE"
  | "RESILIENCE";

export type EducationGroup = {
  id: EducationGroupId;
  /** Short name, used as the section heading in the collection. */
  name: string;
  /** The decision this group owns, in the reader's words. */
  question: string;
  /** What is inside and, explicitly, what is not. */
  boundary: string;
};

export const EDUCATION_GROUPS: EducationGroup[] = [
  {
    id: "BUDGET",
    name: "Xác định ngân sách mua nhà",
    question: "Tôi nên tìm nhà trong tầm giá nào?",
    boundary:
      "Phân bổ số tiền đang có và khoản trả hằng tháng chịu được, để ra một tầm giá đi xem nhà. Không bao gồm kế hoạch tích lũy theo thời gian và không xếp hạng gói vay.",
  },
  {
    id: "SAVING",
    name: "Tích lũy vốn ban đầu",
    question: "Cần góp bao nhiêu và bao lâu để đủ vốn?",
    boundary:
      "Mức góp và thời điểm đạt vốn TRƯỚC khi mua. Không xác định lại tầm giá nhà và không quản lý khoản nợ đã có.",
  },
  {
    id: "PAYMENT",
    name: "Hiểu dòng tiền khoản vay",
    question: "Theo phương án này, tôi trả tiền như thế nào?",
    boundary:
      "Giải thích MỘT phương án theo giả định đã chọn: gốc và lãi, kỳ hạn, lịch trả. Thay đổi một tham số trong cùng phương án vẫn thuộc nhóm này; xếp hạng nhiều gói thì không.",
  },
  {
    id: "CHOICE",
    name: "Chọn phương án tài chính",
    question: "Giữa các lựa chọn ban đầu, phương án nào phù hợp?",
    boundary:
      "So sánh giữa các lựa chọn KHÁC NHAU trước khi cam kết: thuê hay mua, hai báo giá, lãi cố định hay thả nổi. Không bao gồm việc điều chỉnh khoản vay đang có.",
  },
  {
    id: "RESILIENCE",
    name: "Chủ động trước thay đổi",
    question: "Nếu hoàn cảnh đổi, tôi chịu được và điều chỉnh ra sao?",
    boundary:
      "Phản ứng khi hoàn cảnh thay đổi: lãi suất điều chỉnh, có tiền dư để trả thêm, đổi sang khoản vay khác. Dùng lại phép tính của các nhóm trên chứ không viết lại bài nền tảng.",
  },
];

const BY_ID = new Map(EDUCATION_GROUPS.map((group) => [group.id, group]));

export function educationGroup(id: EducationGroupId): EducationGroup {
  const group = BY_ID.get(id);
  if (!group) throw new Error(`Unknown education group: ${id}`);
  return group;
}
