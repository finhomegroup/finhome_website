// Which P2 calculator rows have NO "Mua nhà bằng con số" article, and why.
//
// WHY THIS FILE EXISTS. Every P1 row is exercised by an article. Nine P2 rows
// were not, and "does this row belong in a HOME-BUYING collection?" is a real
// editorial question with a different answer per row — a unit converter is not
// a financial decision, while the true cost of a loan plainly is. A decision
// like that, taken in a chat message and nowhere else, gets re-litigated by
// the next agent. So it is taken HERE, one entry per row, with a reason a
// reader can act on.
//
// WHAT THE TWO VERDICTS MEAN, precisely, because the difference is the whole
// value of the list:
//
// - `belongs` — this row's question IS a home-buying decision and an article
//   for it is wanted. The row is queued, not rejected: `group` says which of
//   the five decision groups would own it, so whoever writes it does not have
//   to re-derive the filing. An entry here is a DEBT, in the sense
//   `components/calc/wide-table-pending.mjs` uses the word — it is expected to
//   be deleted by the person who writes the article.
// - `excluded` — an article for this row does not belong in THIS collection,
//   and the reason says what a reader who wanted one should read or open
//   instead. An entry here is not a debt and is not expected to disappear.
//
// THE LIST IS CHECKED IN BOTH DIRECTIONS by `coverage.test.ts`, which is the
// house pattern from `components/calc/wide-table-pending.mjs` and
// `content/calculators/statutory-parameters.ts`: assert the PROPERTY across
// every P2 row, list the exceptions with a reason each, and fail on a stale
// entry as loudly as on a new gap. Concretely, a row must be EITHER exercised
// by an article OR listed here — never both and never neither. So:
//
//   · write an article for a listed row and forget to delete its entry → red;
//   · add a new P2 row to `plan-disposition.ts` without triaging it → red;
//   · file a row `excluded` and then write an article for it → red.
//
// "EXERCISED BY AN ARTICLE" MEANS `exercise.toolSlug`, not the engine behind
// the figure. That is the narrower and more useful definition: the exercise is
// the only place an article sends the reader to a tool and names its field
// labels, so it is the link a reader actually follows. Several articles draw a
// figure from an engine they do not send anyone to — C07 draws the mortgage
// engine and opens the comparison tool — and counting those would mark rows
// covered by an article that never mentions them.
//
// NOT A COMPLETION CLAIM, for the same reason `READING_DISPOSITIONS` is not:
// `belongs` records a decision about where an article WOULD sit, not that one
// exists or that this row's own calculator work is finished.

import type { EducationGroupId } from "@/content/education/groups";

export type CoverageVerdict = "belongs" | "excluded";

export type CoverageEntry = {
  /** Registry slug, and a P2 row in `plan-disposition.ts`. */
  slug: string;
  verdict: CoverageVerdict;
  /**
   * The decision group that would own the article.
   *
   * Required for `belongs`; `null` for an `excluded` row only when no group
   * could own it at all, which is a stronger statement than "we did not pick
   * one" and the reason has to support it.
   */
  group: EducationGroupId | null;
  /** What to do about it, or what to read instead. Not a label. */
  reason: string;
};

export const P2_COVERAGE: readonly CoverageEntry[] = [
  // ------------------------------------------------- belongs, still to write
  {
    slug: "tra-het-the-tin-dung",
    verdict: "belongs",
    group: "RESILIENCE",
    reason:
      "Nợ thẻ là một nghĩa vụ hằng tháng của hộ, nên nó vừa hạ tầm giá nhà vừa quyết định ngày hộ đó sẵn sàng vay — hai thứ bộ bài đã có công cụ để tính. Xếp vào RESILIENCE vì ranh giới của nhóm SAVING nói rõ nó KHÔNG quản lý khoản nợ đang có, còn RESILIENCE là nơi của việc dùng tiền dư để trả thêm. Bài chưa viết: tình huống giả lập cần cả dư nợ thẻ, lãi thẻ và ngân sách trả nợ, và nó phải nối được sang tầm giá mà không đếm khoản trả thẻ hai lần — đúng chỗ dễ sai mà `lib/calc/vehicle-budget.ts` đã phải xử lý cho khoản trả xe.",
  },
  {
    slug: "tien-gui-co-ky-han",
    verdict: "belongs",
    group: "SAVING",
    reason:
      "Câu hỏi của hàng này — gửi tiền chờ mua nhà thì khi nào cần rút — là một câu hỏi về NGÀY, không phải về lãi suất, và bộ bài chưa có bài nào nói về việc kỳ hạn gửi đáo hạn sau ngày bạn cần tiền thì phần lãi mất đi thế nào. Thuộc SAVING vì nó nằm trọn trong giai đoạn trước khi mua. Chưa viết vì nó cần một tình huống có hai mốc thời gian lệch nhau và một quy tắc rút trước hạn đặt làm giả định, trong khi C04 và C09 đang trả lời phần mức góp của cùng nhóm — nên bài này phải nói rõ nó không lặp lại hai bài đó.",
  },

  // ------------------------------------------------------------- excluded
  {
    slug: "apr-nang-cao",
    verdict: "excluded",
    group: "CHOICE",
    reason:
      "Không phải một công cụ thứ hai: `components/apr-advanced-calculator.tsx` render đúng `AprCalculator` với `initialMode=\"advanced\"`, nên hai đường dẫn là một công cụ ở hai chế độ. Bài C13 (`lai-suat-quang-cao-va-chi-phi-vay-that`) đã dùng chính chế độ đó — hình của bài có cột APR khi tất toán ở tháng 60, và phần bài tập hướng dẫn chuyển “Mức chi tiết của phí” sang “Chi tiết” rồi đổi tháng tất toán. Một bài riêng cho hàng này sẽ là cùng bài tập với một ô đã được đổi sẵn. Ai muốn đọc về tất toán sớm thì đọc C13.",
  },
  {
    slug: "tra-toi-thieu-the-tin-dung",
    verdict: "excluded",
    group: "RESILIENCE",
    reason:
      "Hàng 29 và hàng 30 dùng cùng một `CardPayoffCalculator`, chỉ khác giá trị `strategy` truyền vào (`fixed` so với `minimum`), và `content/calculators/next-steps.ts` đã cho hai đường dẫn đúng cùng một khối bước tiếp theo. Bài được nhận cho `tra-het-the-tin-dung` sẽ dùng lối chỉ trả mức tối thiểu làm phần “thử đổi một thứ”, nên một bài riêng ở đây là cùng phép tính với một điều khiển bị đổi. Đây là lựa chọn biên tập, không phải kết luận rằng trả mức tối thiểu là chuyện nhỏ.",
  },
  {
    slug: "lai-kep",
    verdict: "excluded",
    group: "SAVING",
    reason:
      "Mối nối giáo dục của hàng này đã được đấu sẵn: trong `content/calculators/next-steps.ts`, `lai-kep` trỏ về bài C04 (`du-tien-tra-truoc-sau-3-nam`) kèm lý do “với mục tiêu vài năm, phần quyết định gần như toàn bộ là mức góp chứ không phải lãi suất”. Đó đúng là kết luận mà một bài lãi kép cho quỹ mua nhà buộc phải đi tới, vì chân trời của người mua nhà là vài năm chứ không phải vài chục năm — nên bài mới sẽ nói lại C04 dưới một cái tên khác. Ranh giới nhóm SAVING cũng đã do C04 và C09 nắm. Ai muốn tự nhập số thì mở công cụ; ai muốn đọc thì đọc C04.",
  },
  {
    slug: "doi-don-vi",
    verdict: "excluded",
    group: null,
    // The one row where no group could own it, hence `group: null`.
    reason:
      "Quy đổi sào, mẫu và mét vuông là một phép đổi đơn vị, không phải một quyết định tài chính — nên không nhóm nào trong năm nhóm quyết định nhận được nó, và `content/education/groups.ts` đã tuyên bố ngoài phạm vi “mọi quyết định tài chính không phải về việc mua nhà”. Không có công cụ nào trong hàng này tạo ra một con số tiền để bài tập chạy trên đó. Đây cũng là thất bại mà `content/calculators/next-steps.ts` được viết ra để chặn: gắn một phễu mua nhà lên trang không nói về việc mua nhà. LƯU Ý cho người đọc mục này: hàng `doi-don-vi` VẪN có khối bước tiếp theo trong `next-steps.ts`, vì nó không bị xếp lên kệ (`library`) và một phép đổi diện tích là một bước bên trong việc xem một thửa đất. Cấm của tệp đó là với hàng đã lên kệ; kết luận “không” ở đây dựa vào ranh giới của bộ bài, không dựa vào cấm đó.",
  },
];

const BY_SLUG = new Map(P2_COVERAGE.map((entry) => [entry.slug, entry]));

/** The triage entry for a slug, or undefined when the row is not listed. */
export function coverageFor(slug: string): CoverageEntry | undefined {
  return BY_SLUG.get(slug);
}

/** Rows whose article is wanted but not written yet, in list order. */
export function coverageBacklog(): readonly CoverageEntry[] {
  return P2_COVERAGE.filter((entry) => entry.verdict === "belongs");
}
