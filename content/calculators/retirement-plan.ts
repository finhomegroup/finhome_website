// Copy for /cong-cu/ke-hoach-huu-tri/ — the TRAJECTORY view of the merged
// long-term plan (original plan row 44).
//
// Original FinHome copy. Denominated in đồng, and it models NO country's law:
// `lib/calc/retirement.ts` is arithmetic on a balance, a contribution, two
// returns and an inflation rate. The registry's `usRules: true` flag was
// therefore removed from this row — the notice it rendered ("mô phỏng quy định
// về thuế và hưu trí của Hoa Kỳ") described a model that does not exist here,
// and over đồng figures it was actively misleading. The same correction
// `phan-bo-tai-san` already carries in the registry.
//
// The shared field labels, the four-view control's copy and the shared scope
// live in `content/calculators/long-term-plan.ts`, because three sibling
// routes use them. Since 2026-09-27 this page also holds its OWN scenario
// (`DEFAULTS` below — the latest Vietnamese figures, the two retirement
// incomes per month), its sources and its disclaimer; the siblings keep the
// shared scenario. The rest here is this page's own: its title, its notice,
// its result copy, its chart labels, its method prose and its FAQ.
//
// ── REWRITTEN READER-FIRST, 2026-09-26 ─────────────────────────────────────
//
// The approved review (`artifacts/finhome-retirement-content-review-2026-09-26.md`)
// read the live page as a beginner and asked for four things, all of which
// are copy and presentation and NONE of which touch the engine, a default or
// a formula:
//
// 1. Open with the reader's question and what to enter, not with "dự phóng"
//    and a warning carrying two eleven-digit amounts. The purchasing-power
//    explanation moves to AFTER the result, filled with the reader's own
//    figures and rounded through `compactMoney`; the exact đồng values stay in
//    the detail rows and the figure's table.
// 2. Turn "Không đủ" into a conclusion with a context: the ages the reader
//    typed, the age the money starts to fall short, how many years early, and
//    what to try. Every `{placeholder}` below is filled by the component from
//    `resolveLongTermPlan`, never from a memory of the default scenario.
// 3. Say plainly what the annual shortfall IS — the gap between the spend the
//    reader wants and the spend the plan supports, per year, in today's money
//    — and what it is NOT: an extra contribution, or a total capital shortage.
// 4. Layer the method: understand-at-once, then a worked year each way, then
//    the full formulas behind a labelled disclosure. Nothing material was
//    deleted; the annuity-due convention, the two deflators, the start-of-year
//    timing and the float residue are all still stated, one click down.
//
// The old arbitrary length caps on this route's copy (lede < 110, notices
// < 180, notice ≤ 300) were retired by the same decision: the goal is that a
// reader understands at every step, not that the text is short. The tests
// that remain are the ones that pin quoted figures to the engine and the
// ones that check the conclusion names the right ages.
//
// ── EVERY FIGURE QUOTED BELOW IS THE MODEL'S OUTPUT ────────────────────────
//
// Verified by running `resolveLongTermPlan` on THIS ROUTE'S scenario,
// `DEFAULTS` below (2026-09-27: 35 tuổi → nghỉ 60 → đến 85; 100.000.000 ₫
// đang có; dành thêm 15.000.000 ₫/năm tăng 6%/năm; lợi suất 6,5% trước /
// 4,5% sau; lạm phát 4,5%; lương hưu mong muốn 8.000.000 ₫/tháng và thu nhập
// khác 4.000.000 ₫/tháng, cả hai theo giá hôm nay):
//
//   Năm để dành đầu tiên:   100 + 15 = 115 triệu, sinh lời 6,5% = 7,5 triệu,
//                           cuối năm 122.475.000 ₫; năm sau để dành 15,9 triệu
//   Số dư khi nghỉ:         2.194.741.612 ₫ danh nghĩa (khoảng 2,2 tỷ)
//                           730.257.686 ₫ theo giá hôm nay (khoảng 730,3 triệu) — 33,3% của nó
//   Vốn cần có:             1.200.000.000 ₫ theo giá hôm nay
//   Năm rút đầu tiên:       144.260.854 ₫ danh nghĩa (khoảng 144,3 triệu)
//                           cho 48.000.000 ₫ giá hôm nay
//                           (48 triệu = (8 − 4) triệu/tháng × 12)
//   Tỷ lệ rút năm đầu:      6,57%
//   Chi giữ được đến hết:   77.210.307 ₫/năm — thiếu 18.789.693 ₫ so với mong muốn
//   Cạn ở tuổi 75, thiếu 10 năm; năm cạn cần 279.185.498 ₫ và chỉ trả được
//     59.662.441 ₫
//   Ba cách bù: dành 27.369.770 ₫/năm (thêm 12.369.770 ₫), nghỉ ở 66 (muộn
//     6 năm), hoặc chi 77.210.307 ₫/năm (80,4% mức mong muốn)
//
// `content/calculators/long-term-plan.test.ts` re-derives every one of these
// from the route's default STRINGS with the same parsers the page uses and
// pins them against the sentences below — the exact figures in the FAQ, the
// rounded ones in the method prose — so a moved default is a red test naming
// the sentences that have to move with it.
//
// The nominal number is 3,01x the real one because prices rise 1,045^25 =
// 3,0054 over the 25-year accumulation.
//
// ── DECLARED EMPHASIS, NOT CAPITALS ────────────────────────────────────────
//
// `formula.emphasis` declares the few phrases that carry each paragraph's
// point, through `lib/prose-emphasis.ts`, so the paragraph stays one plain
// string. `plan-disposition.test.ts` checks every declared phrase occurs in
// `formula.body` and holds the emphasised share under its ratchet;
// `check:markup` checks the built page actually ships `<strong>`. The
// disclosed `formula.detail` paragraphs are rendered plain on purpose: a
// phrase bolded twice on one page is the "bold everything" failure.

import type { RouteFieldKey } from "@/components/retirement-plan-read";

/**
 * THIS ROUTE'S OWN SCENARIO — 2026-09-27, the owner's decision: macro
 * assumptions from the latest Vietnamese figures, a conservative set, and
 * personal example amounts scaled to the 2025 average worker income; the two
 * retirement incomes per month. It applies to /cong-cu/ke-hoach-huu-tri/
 * ONLY; the three sibling routes keep `LONG_TERM_PLAN.defaults`.
 *
 *   Lạm phát 4,5%/năm — NQ 244/2025/QH15 targets CPI ≈ 4,5% for 2026; the
 *     8-month 2026 average was 4,45% (Cục Thống kê, 3/9/2026).
 *   Sinh lời 6,5% trước / 4,5% sau khi nghỉ — just under the 12-month
 *     deposit rate at the four state-owned banks (6,8%/năm, 12/9/2026), and
 *     more cautious after retirement.
 *   Khoản để dành tăng 6%/năm — below 2025 average income growth (8,9%) and
 *     the 2026 regional minimum wage rise (7,2%, NĐ 293/2025/NĐ-CP).
 *   Thu nhập bình quân 8,4 triệu/tháng (2025, Cục Thống kê) scales the
 *     EXAMPLE amounts: 100 triệu đang có (≈ a year's income), 15 triệu/năm để
 *     dành (≈ 15%), 8 triệu/tháng mong muốn, 4 triệu/tháng lương hưu BHXH
 *     (≈ half the income). Examples, not statistics — the card says so.
 *
 * Every figure this route's prose quotes is this scenario's output, and
 * `content/calculators/long-term-plan.test.ts` re-derives them from these
 * strings. The sources are listed on the page (`sources` below).
 */
const DEFAULTS = {
  currentAge: "35",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "100.000.000",
  annualContribution: "15.000.000",
  contributionGrowthPercent: "6",
  returnBeforePercent: "6,5",
  returnAfterPercent: "4,5",
  inflationPercent: "4,5",
  desiredMonthlySpending: "8.000.000",
  otherMonthlyIncome: "4.000.000",
} as const satisfies Record<RouteFieldKey, string>;

export const RETIREMENT_PLAN = {
  slug: "/cong-cu/ke-hoach-huu-tri",

  /** This route's scenario, as form strings. See the note on `DEFAULTS`. */
  defaults: DEFAULTS as Record<RouteFieldKey, string>,

  /**
   * Where the defaults come from, as links the reader can open — the shell's
   * `sources` section. Checked 2026-09-27; the figures move, so the date is
   * part of the claim.
   */
  sources: {
    title: "Số mẫu được chọn từ đâu?",
    intro:
      "Bộ số mẫu cập nhật ngày 27/9/2026. Các nguồn dưới đây là căn cứ để chọn giả định, không phải dự báo cho các năm sau; tiền đang có, tiền để dành và tiền BHXH trong ví dụ không phải số của bạn — hãy thay bằng số của mình.",
    items: [
      {
        url: "https://vanban.chinhphu.vn/?pageid=27160&docid=216077&classid=1",
        label: "Văn bản Chính phủ — Nghị quyết số 244/2025/QH15 của Quốc hội về Kế hoạch phát triển kinh tế - xã hội năm 2026",
        note: "Văn bản gốc của nghị quyết.",
      },
      {
        url: "https://baochinhphu.vn/quoc-hoi-thong-qua-nghi-quyet-ve-ke-hoach-phat-trien-kinh-te-xa-hoi-nam-2026-102251113085124372.htm",
        label: "Báo Chính phủ — Quốc hội thông qua Nghị quyết về kế hoạch phát triển kinh tế - xã hội năm 2026",
        note: "Mục tiêu năm 2026: CPI bình quân tăng khoảng 4,5% — mục tiêu cho một năm, không phải dự báo cả kế hoạch.",
      },
      {
        url: "https://thitruongtaichinhtiente.vn/8-thang-dau-nam-2026-cpi-tang-4-45-lam-phat-co-ban-tang-4-24-85287.html",
        label: "Thị trường Tài chính Tiền tệ — 8 tháng đầu năm 2026, CPI tăng 4,45%",
        note: "Theo Cục Thống kê (Bộ Tài chính), ngày 3/9/2026: CPI bình quân 8 tháng tăng 4,45% so với cùng kỳ.",
      },
      {
        url: "https://cafef.vn/lai-suat-ngan-hang-12-9-tai-agribank-vietcombank-bidv-vietinbank-mb-sacombank-hdbank-188260912203635256.chn",
        label: "CafeF — Lãi suất ngân hàng 12/9 tại Agribank, Vietcombank, BIDV, VietinBank…",
        note: "Lãi gửi trực tuyến kỳ hạn 12 tháng ở bốn ngân hàng: 6,8%/năm (12/9/2026). Số mẫu 6,5% và 4,5% chỉ để tính thử, không phải lãi được bảo đảm.",
      },
      {
        url: "https://www.nso.gov.vn/tin-tuc-thong-ke/2026/01/thong-cao-bao-chi-ve-tinh-hinh-dan-so-lao-dong-viec-lam-quy-iv-va-nam-2025/",
        label: "Cục Thống kê — Thông cáo báo chí về tình hình dân số, lao động, việc làm quý IV và năm 2025",
        note: "Thu nhập bình quân của người lao động năm 2025: 8,4 triệu đồng/tháng, tăng 8,9%.",
      },
      {
        url: "https://en.vietnamplus.vn/regional-minimum-wage-up-72-from-2026-post335372.vnp",
        label: "VietnamPlus — Lương tối thiểu vùng tăng 7,2% từ năm 2026",
        note: "Nghị định 293/2025/NĐ-CP, từ 1/1/2026.",
      },
      {
        url: "https://xaydungchinhsach.chinhphu.vn/tra-cuu-tuoi-nghi-huu-thoi-diem-nghi-huu-cua-nguoi-lao-dong-theo-nam-sinh-119241029170451525.htm",
        label: "Cổng Thông tin điện tử Chính phủ — Tra cứu tuổi nghỉ hưu và thời điểm nghỉ hưu theo năm sinh",
        note: "Điều 169 Bộ luật Lao động 2019: tuổi nghỉ hưu tăng dần đến 62 với nam (năm 2028) và 60 với nữ (năm 2035).",
      },
    ],
  },

  /**
   * This page's disclaimer. The shared one (`LONG_TERM_PLAN.scope`) says the
   * four pages "dùng chung một bộ giả định"; since 2026-09-27 this page opens
   * on its own and asks the two incomes per month, so it states that instead.
   * It KEEPS the opening clause `scripts/check-built-markup.mjs` counts.
   */
  disclaimer:
    "Công cụ này chỉ mang tính minh họa: kết quả phụ thuộc các số và giả định đang dùng; số mẫu được chọn tháng 9/2026 và có ghi nguồn trên trang. Mọi số tiền tính bằng đồng Việt Nam, chưa trừ thuế và phí. Sinh lời được tính đều mỗi năm, riêng cho giai đoạn trước và sau khi nghỉ hưu; công cụ chưa tính những năm lãi, lỗ khác nhau. Các gợi ý giúp bạn thử cách điều chỉnh — không bảo đảm đủ tiền trong thực tế, không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Hãy cân nhắc kỹ hoặc hỏi chuyên gia trước khi ra quyết định tài chính.",

  /**
   * The other three views, after the tool, in this route's words: they open
   * on other defaults and ask two incomes per year, and nothing is carried
   * over — so they are named, not promoted.
   */
  otherTools: {
    title: "Các công cụ hưu trí khác",
    intro:
      "Mỗi trang trả lời một câu hỏi khác về cùng cách tính. Số bạn nhập ở đây không được mang sang; các trang đó dùng số mẫu khác và hỏi chi tiêu, thu nhập khác theo năm — lấy số tháng nhân 12.",
  },

  /** Tool → explanation (2026-09-30 series), through `EducationLink`. */
  guideLink: {
    href: "/blog/de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi/",
    label: "Đọc ví dụ: tiền dành dụm đủ chi đến năm bao nhiêu tuổi?",
    why: "bài viết đi qua đúng số mẫu đang điền sẵn, cách đọc hình bát và các nút thử trên trang này.",
  },

  pageTitle: "Tiền dành dụm có đủ sống khi nghỉ hưu không?",
  metaTitle: "Kế hoạch hưu trí — Tiền dành dụm có đủ sống khi nghỉ hưu không?",
  metaDescription:
    "Nhập số tiền đang có, khoản để dành thêm và mức chi mong muốn; FinHome ước tính tiền đủ đến tuổi nào, tính cả giá cả tăng, và gợi ý điều nên thử. Công cụ miễn phí, bằng đồng.",

  /**
   * The opening, in the reader's terms: what to enter, what comes back, what
   * to try. Three sentences on purpose — the review found the one-line
   * "Dự phóng cả hai giai đoạn" told a beginner nothing they could act on.
   */
  lede:
    "Nhập ba thông tin — tuổi của bạn, tuổi muốn nghỉ hưu, chi tiêu mỗi tháng khi nghỉ — để biết số tiền đang có và sẽ để dành đủ đến tuổi nào. Chưa đủ thì thử để dành thêm, nghỉ hưu muộn hơn hoặc điều chỉnh chi tiêu.",
  ledeDetailTitle: "Công cụ này cho bạn những gì",
  ledeDetail:
    "Số tiền cần có khi nghỉ hưu và kế hoạch hiện tại đạt bao nhiêu; tiền có đủ đến tuổi bạn chọn không, nếu chưa thì thiếu từ tuổi nào; một gợi ý cụ thể để đủ; và số tiền qua từng tuổi trên biểu đồ. Mọi con số tính từ những gì bạn nhập, chưa trừ thuế và phí — là ước tính để so sánh các lựa chọn, không phải dự báo.",

  /**
   * The one thing to know before reading a figure off this tool, in words.
   *
   * The limitation — a big nominal number is not purchasing power — stays
   * visible above the form, as the UX contract requires. What moved is the
   * demonstration: the two eleven-digit amounts that used to sit here now
   * appear under the result, filled from the reader's own inputs and rounded,
   * where a reader who has just seen their verdict can make sense of them.
   */
  realNotice:
    "Mọi số tiền ở đây nhập và đọc theo giá hôm nay. Khi giá cả tăng, cùng số tiền sẽ mua được ít hơn, nên số “theo giá của năm đó” trông lớn hơn; công cụ tự tính phần đó.",

  form: {
    resultTitle: "Kết quả theo các số đang dùng",
    verdictLabel: "Tiền có đủ đến tuổi bạn chọn không?",
    verdictYes: "Đủ",
    verdictNo: "Không đủ",
    depletionLabel: "Tiền bắt đầu thiếu ở tuổi",
    // Named against the reader's own horizon, because it sits beside a money
    // shortfall in the same group: a bare "Thiếu" next to "Chi tiêu còn thiếu
    // mỗi năm" reads as two versions of one figure.
    yearsShortLabel: "Sớm hơn tuổi bạn chọn",
    yearsUnit: "năm",
    realBalanceAtRetirementLabel: "Số tiền khi nghỉ hưu, theo giá hôm nay",
    /**
     * `spendingShortfall` — an ANNUAL spending gap in today's money, not a
     * capital shortage and not a contribution. The label carries the period
     * and the price basis; `shortfallMeaning` below says what it is not.
     */
    shortfallLabel: "Chi tiêu cần giảm mỗi tháng, theo giá hôm nay",

    /**
     * The conclusion in context. Filled by the component with the ages the
     * reader typed and the ages the engine found; nothing here quotes the
     * default scenario.
     *
     * 2026-09-27: these are now the TITLE and the ONE FACT of the semantic
     * result card, in the plan's own words — "Kế hoạch chưa đủ đến tuổi 85",
     * then "Tiền bắt đầu thiếu ở tuổi 82, sớm hơn mục tiêu 3 năm." The
     * horizon leads because it is what the reader asked about; the age and
     * the years short are the answer to "thiếu so với điều gì, bao nhiêu".
     */
    depletedHeadline: "Kế hoạch chưa đủ đến tuổi {endAge}",
    depletedBody:
      "Tiền bắt đầu thiếu từ tuổi {depletionAge}, tức thiếu {yearsShort} năm.",
    /**
     * Appended when the depletion year still paid something. Both figures are
     * the PORTFOLIO's — the draw needed from the savings after other income,
     * and what the savings could pay — not the household's total spending.
     *
     * 2026-09-27, tool-first hero: the card now sits in the hero, above the
     * page's price-basis notice, so the sentence names its own basis and its
     * own year instead of leaning on "năm đó" and the notice below it. Both
     * figures are nominal — the money of the depletion year — and the engine
     * exposes no today's-money reading of the planned draw.
     */
    depletedPartial:
      "Ở tuổi {depletionAge}, sau khi đã trừ thu nhập khác, cần rút khoảng {planned} từ khoản dành dụm nhưng khoản dành dụm chỉ trả được khoảng {paid}. Các số này tính theo giá năm bạn {depletionAge} tuổi.",
    /**
     * Appended instead when the savings could pay nothing that year. Other
     * income, if any, is untouched by this — the sentence says so.
     */
    depletedNothingLeft:
      "Năm đó khoản dành dụm đã hết để rút; thu nhập khác, nếu có, vẫn được tính.",
    depletedTry:
      "Thử để dành thêm, nghỉ hưu muộn hơn hoặc giảm chi tiêu khi nghỉ hưu — kết quả đổi ngay. Chọn mức vừa với ngân sách hằng tháng của gia đình.",
    /**
     * "đến tuổi {endAge}", not "đến hết tuổi": the engine runs the years from
     * `currentAge` up to `endAge − 1`, so a horizon of 85 covers spending
     * until the reader turns 85 — the age-85 year itself is outside the plan.
     * `{lastAge}` is `endAge − 1`, filled by the component, so the body can
     * say which year is the last one counted.
     *
     * Scoped to "các giả định hiện tại" on purpose: a funded verdict is a
     * statement about the reader's own rates, not a promise of a safe
     * retirement, and the assumptions stay visible under it.
     */
    fundedHeadline:
      "Ước tính đủ chi tiêu đến tuổi {endAge}.",
    // Per month, as the pension is asked on this route; both amounts are the
    // engine's yearly figures ÷ 12, rounded.
    fundedBody:
      "Mỗi tháng có thể chi khoảng {sustainable}, kể cả thu nhập khác, đến khi bạn tròn {endAge} tuổi (năm cuối là năm {lastAge} tuổi); bạn muốn chi {desired} mỗi tháng — đều theo giá hôm nay.",
    fundedTry:
      "Thử tính thêm 5 hoặc 10 năm, hoặc giảm mức sinh lời giả định, để xem kế hoạch còn đủ không khi điều kiện kém đi.",
    /**
     * Funded because other income covers the spend — NOT a funded portfolio,
     * and the title says whose money it is. `otherIncomeNote` is its reason.
     */
    otherIncomeHeadline:
      "Ước tính thu nhập khác đủ chi tiêu đến tuổi {endAge}.",
    /**
     * Funded with NOTHING to spare: the engine forgave a sub-đồng residue in
     * the final year, or the savings end the horizon at zero. A defined
     * condition — "mức chi vừa chạm khả năng duy trì" — not a ratio the page
     * invented, and never a shortfall.
     */
    boundaryHeadline:
      "Ước tính vừa đủ đến tuổi {endAge}, không còn dư.",
    boundaryBody:
      "Ở mức chi này, khoản dành dụm về 0 khi bạn tròn {endAge} tuổi. Sinh lời thấp hơn hoặc giá cả tăng nhanh hơn một chút là có thể thiếu.",
    /** No verdict at all while a field is unusable — never a stale colour. */
    invalidHeadline: "Chưa tính được: hãy sửa ô có lỗi.",
    /**
     * The card's tone words on this route. Its own words rather than the
     * shared ones because "đủ" is the question this page answers.
     */
    statusLabels: {
      shortfall: "Chưa đủ",
      met: "Đủ theo giả định",
      caution: "Vừa đủ — cần lưu ý",
      unknown: "Chưa kết luận",
    },
    /**
     * The levers, as jumps to the fields on THIS page. They move focus; they
     * change no value and carry nothing to another page.
     */
    statusActions: {
      // The first year's amount: it grows by the growth rate after that.
      annualContribution: "Để dành năm đầu",
      retirementAge: "Tuổi muốn nghỉ hưu",
      // Not "lương hưu": in Vietnamese that is the BHXH pension, which is
      // entered separately as other income. This is the whole monthly spend.
      desiredMonthlySpending: "Chi tiêu khi nghỉ hưu",
      endAge: "Tuổi kết thúc kế hoạch",
      returnAfterPercent: "Sinh lời sau khi nghỉ",
    },
    /** When other income covers the whole spend, so the savings are never drawn. */
    otherIncomeNote:
      "Với mức chi này, thu nhập khác đã đủ, nên kế hoạch không cần rút khoản dành dụm.",

    /**
     * What the promoted shortfall figure means — and does not mean. Filled
     * with the rounded figure; the exact one is the row directly above.
     */
    shortfallMeaning:
      "Nếu chỉ giảm chi tiêu, mỗi tháng cần chi ít hơn khoảng {monthly} — khoảng {shortfall} mỗi năm — theo giá hôm nay, để tiền đủ đến tuổi bạn chọn. Đây không phải số tiền cần để dành thêm, và không phải tổng số vốn còn thiếu: hai con số đó nằm ở phần “Mục tiêu hưu trí” đầu trang.",
    /**
     * The hero's "Mục tiêu hưu trí", exact: the capital the plan needs at
     * retirement in both readings, what is still missing, and the smallest
     * first-year contribution that funds the plan — the engine's own figures
     * behind the rounded ones in the hero.
     */
    targetTitle: "Mức cần có khi nghỉ hưu",
    requiredRealLabel: "Cần có khi nghỉ hưu, theo giá hôm nay",
    requiredNominalLabel: "Cần có khi nghỉ hưu, theo giá của năm đó",
    requiredShortLabel: "Tiền còn thiếu lúc nghỉ hưu, theo giá hôm nay",
    requiredContributionLabel: "Để dành năm đầu tối thiểu để đủ",
    shortfallNone:
      "Theo các giả định này, mức chi bạn muốn giữ được đến tuổi bạn chọn.",

    /**
     * The two conditions that can change the conclusion, kept beside it.
     * `assumptionsUsed` is filled with the reader's own rates.
     */
    estimateNote:
      "Kết quả phụ thuộc các số và giả định đang dùng, không phải dự báo chắc chắn. “Tiền bắt đầu thiếu” nghĩa là khoản dành cho hưu trí không đủ phần cần rút, không phải toàn bộ tài sản của bạn đã hết.",
    assumptionsUsed:
      "Giả định đang dùng: sinh lời {before}%/năm trước khi nghỉ và {after}%/năm sau khi nghỉ, lạm phát {inflation}%/năm, khoản để dành {growthPhrase}. Chưa trừ thuế và phí; sinh lời được tính đều mỗi năm.",

    /**
     * Purchasing power, explained AFTER the result with the reader's own
     * figures. `purchasingPowerDraw` is appended only when the first
     * retirement year actually draws on the savings; `purchasingPowerFlat`
     * replaces the whole thing when inflation is zero or negative, where
     * "mua được ít đồ hơn" would be false; `purchasingPowerToday` replaces it
     * when retirement is today, where the two readings of the capital
     * coincide and comparing them would compare a figure with itself.
     */
    purchasingPowerTitle: "Vì sao có hai con số cho cùng một khoản tiền",
    purchasingPower:
      "Với lạm phát {inflation}%/năm, đến tuổi {retirementAge} kế hoạch có khoảng {capital} theo giá của năm đó, nhưng chỉ mua được lượng hàng mà khoảng {realCapital} mua được hôm nay.",
    purchasingPowerDraw:
      "Năm đầu nghỉ hưu, kế hoạch rút khoảng {nominalDraw} theo giá của năm đó — bằng khoảng {realDraw} theo giá hôm nay.",
    purchasingPowerClose:
      "Vì vậy trang này dùng số theo giá hôm nay để bạn so với chi tiêu hiện tại; số theo giá của năm đó nằm trên biểu đồ và trong phần chi tiết.",
    purchasingPowerFlat:
      "Bạn nhập lạm phát {inflation}%/năm. Đến tuổi {retirementAge}, khoản {capital} theo giá của năm đó tương đương khoảng {realCapital} theo giá hôm nay: giá không đổi thì hai số bằng nhau, giá giảm thì số theo giá hôm nay lớn hơn.",
    purchasingPowerToday:
      "Bạn nghỉ hưu ngay, nên tiền khi nghỉ cũng là tiền hôm nay: khoảng {capital}. Các năm sau, công cụ điều chỉnh chi tiêu và thu nhập khác theo mức lạm phát {inflation}%/năm bạn nhập.",

    verdictDetailTitle: "Kết luận này được tính thế nào",
    verdictDetail:
      "Trước khi nghỉ hưu, công cụ cộng tiền để dành vào đầu năm rồi tính sinh lời. Sau khi nghỉ, mỗi năm công cụ rút phần chi tiêu còn thiếu sau thu nhập khác — đã tính giá cả tăng — rồi tính sinh lời trên phần còn lại. Năm nào khoản dành dụm không đủ trả phần cần rút là năm tiền bắt đầu thiếu; không có năm nào như vậy trước tuổi bạn chọn thì kết quả là đủ. Từng bước nằm ở phần “Cách tính” cuối trang.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden. `fundedAtBoundary` returns the residue precisely so a page can
     * say it; a verdict that silently forgives a shortfall is a verdict the
     * reader cannot check.
     */
    boundaryNotice:
      "Năm cuối còn thiếu một phần nhỏ hơn một đồng ({residue} ₫) do máy tính làm tròn số lẻ — không phải một năm không được chi trả, nên kế hoạch vẫn được tính là đủ.",
    invalidNotice:
      "Kiểm tra ô đang báo lỗi: tuổi nghỉ hưu không nhỏ hơn tuổi hiện tại và phải nhỏ hơn tuổi kết thúc, cả kỳ không quá 100 năm; số tiền từ 0 trở lên; các tỷ lệ lớn hơn −100% và không quá 100%.",

    /**
     * The full-width detail region below the two columns: the nominal
     * readings, the whole-period cash flow, and the depletion year's partial
     * payment. Every exact figure lives here, so the rounded prose above it
     * always has an exact counterpart on the same page.
     */
    detailTitle: "Xem chi tiết kế hoạch",
    detailHint:
      "Số tiền theo giá của từng năm, dòng tiền cả kỳ, và — nếu kế hoạch không đủ — năm tiền bắt đầu thiếu trả được bao nhiêu.",

    nominalTitle: "Cùng một khoản tiền, hai cách đếm",
    balanceAtRetirementLabel: "Số tiền khi nghỉ hưu, theo giá của năm đó",
    finalBalanceLabel: "Số tiền còn lại ở tuổi kết thúc, theo giá của năm đó",
    realFinalBalanceLabel: "Số tiền còn lại ở tuổi kết thúc, theo giá hôm nay",

    flowTitle: "Dòng tiền cả kỳ",
    totalContributedLabel: "Tổng đã để dành thêm",
    totalGrowthLabel: "Tổng tiền sinh lời",
    totalWithdrawnLabel: "Tổng đã rút",
    firstWithdrawalLabel: "Rút năm đầu nghỉ hưu, theo giá của năm đó",
    firstWithdrawalRealLabel: "Cùng khoản đó theo giá hôm nay",
    initialRateLabel: "Tỷ lệ rút năm đầu so với số tiền khi nghỉ",
    sustainableLabel: "Mức chi giữ được đến hết kỳ, mỗi năm theo giá hôm nay",

    /**
     * The depletion year is usually a PARTIAL payment, so all three figures —
     * and all three are the PORTFOLIO's: the draw the savings had to cover
     * after other income, what they paid, and the rest. Labelled as such, so
     * "Năm đó cần" cannot be read as the household's whole spend.
     */
    partialTitle: "Năm tiền bắt đầu thiếu: khoản dành dụm trả được bao nhiêu",
    partialPlannedLabel: "Năm đó cần rút từ khoản dành dụm",
    partialPaidLabel: "Khoản dành dụm thực trả được",
    partialShortLabel: "Phần rút còn thiếu",
  },

  /**
   * Row 44's figure: the whole plan, in both readings of one balance, on an
   * axis of AGES.
   *
   * The drawn coordinate is still years elapsed — `valuePathsModel` positions
   * a period at `period / xMax` — but every tick, marker and table row is
   * labelled with the age it falls at, so a reader is not asked to add their
   * own age to 0, 13, 26, 39 and 50. The summary uses rounded figures through
   * `compactMoney`; the figure's own table keeps the exact đồng values, chosen
   * by `checkpoints()` in `lib/calc/charts/long-term-chart.ts` so the
   * mandatory dates — today, retirement, the year the money falls short, the
   * horizon — are never dropped.
   */
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Tiền dành cho hưu trí của bạn qua từng tuổi",
    series: "{label}",
    xAxis: "Tuổi của bạn",
    yAxis: "Số tiền ({unit})",
    assumptions: [
      "Trục ngang là tuổi của bạn. Mỗi mốc là số tiền lúc bạn vừa tròn tuổi đó, tức sau khi đã tính xong năm trước.",
      "Hai đường là cùng một khoản tiền, tính theo giá của từng năm và theo giá hôm nay. Khi giá cả tăng, đường theo giá hôm nay nằm thấp hơn — đó là đường để so với chi tiêu của bạn.",
      "Từ mốc nghỉ hưu, bạn ngừng để dành, bắt đầu rút tiền, và sinh lời chuyển sang mức sau khi nghỉ.",
    ],
    tableCaption: "Số tiền tại các mốc tuổi của kế hoạch",
    tableHint:
      "Hai cột số tiền là cùng một khoản, tính theo giá hôm nay và theo giá của năm đó. Bảng luôn giữ các mốc chính — hôm nay, nghỉ hưu, bắt đầu thiếu và tuổi kết thúc — cùng vài mốc xen giữa cho dễ đọc.",
    periodColumn: "Năm thứ",
    unavailableReason:
      "Chưa vẽ được: kế hoạch cần các mốc tuổi hợp lệ và ít nhất hai năm.",
    unavailableRecovery:
      "Hãy kiểm tra lại ba mốc tuổi — tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc — và các ô số tiền.",
    realPath: "Số tiền tính theo giá hôm nay",
    nominalPath: "Số tiền tính theo giá của năm đó",
    retirementMarker: "Bắt đầu nghỉ hưu ở tuổi {age}",
    depletionMarker: "Tiền bắt đầu thiếu ở tuổi {age}",
    horizonMarker: "Hết kỳ bạn chọn: tuổi {age}",
    summaryFunded:
      "Bắt đầu ở tuổi {startAge} với {startCapital}. Đến tuổi {retirementAge} kế hoạch có khoảng {capital}, tương đương khoảng {realCapital} theo giá hôm nay, và đủ chi đến tuổi {endAge}.",
    summaryDepleted:
      "Bắt đầu ở tuổi {startAge} với {startCapital}. Đến tuổi {retirementAge} kế hoạch có khoảng {capital}, tương đương khoảng {realCapital} theo giá hôm nay, rồi bắt đầu thiếu ở tuổi {depletionAge}.",
    // Behind the figure's own disclosure, exact: three formatted amounts in a
    // paragraph above a plot is the caption doing the table's job.
    partialTitle: "Năm tiền bắt đầu thiếu: khoản dành dụm trả được bao nhiêu",
    partialNote:
      "Năm đó khoản dành dụm vẫn trả được một phần: sau thu nhập khác, cần rút {planned}; trả được {paid}; còn thiếu {short} — theo giá của năm đó.",
    otherIncomeNote:
      "Ở mức chi tiêu này, thu nhập khác đã đủ nên khoản dành dụm không bị rút đến.",
    readingNote:
      "Hai đường là cùng một khoản tiền đếm theo hai cách; khoảng cách giữa chúng là tác động của mức lạm phát bạn nhập, và với lạm phát 0% hai đường trùng nhau.",
    ageColumn: "Tuổi",
    yearColumn: "Năm thứ",
    realColumn: "Theo giá hôm nay",
    nominalColumn: "Theo giá của năm đó",
    /**
     * The unmet years, as the figure's band and its words — 2026-09-27. The
     * balance itself stops at zero; nothing is drawn below the axis.
     */
    unmetBand:
      "Từ tuổi {depletionAge} đến trước tuổi {endAge}: khoản dành dụm không đủ phần cần rút ({yearsShort} năm)",
    statusColumn: "Tình trạng",
    statusSaving: "Đang để dành",
    statusCovered: "Đủ chi tiêu",
    statusDepletes: "Bắt đầu thiếu",
    statusUnmet: "Chưa đủ chi tiêu",
  },

  /**
   * The tool-first hero, 2026-09-27 — the verdict card, the granary of bowls,
   * the three levers and the reading of the picture, rendered right under
   * the `h1` (`components/retirement-granary-hero.tsx`).
   *
   * ONE BOWL IS ONE YEAR OF RETIREMENT, and its rice is the share of that
   * year's draw the savings actually paid — the engine's own ledger, drawn by
   * `lib/calc/charts/retirement-granary-chart.ts`. The draw is the spend
   * AFTER other income, so the unit line says so whenever other income
   * exists. Nothing here is a verdict image: an unpaid year is an empty bowl,
   * never a broken or red one.
   *
   * THE LEVERS ARE IN THE ENGINE'S UNIT. The contribution is credited once at
   * the start of each year and grows every year, so a step is "12 triệu/năm"
   * and its total by retirement is stated from two engine projections
   * (`stepTotal`), never implied by "1 triệu/tháng". Every accessible name
   * starts with the button's visible text.
   */
  hero: {
    /**
     * The card's two closing lines, inside the first screen: the realNotice's
     * point in one sentence, because the hero now sits above that notice; and
     * which hidden inputs are still the example, so a few lever presses on a
     * mostly-sample plan never read as "số của bạn".
     */
    limitation: "Ước tính, không phải dự báo.",
    sampleLine: "Đang dùng số mẫu cho {list}.",
    sampleItems: {
      currentAge: "tuổi hiện tại",
      currentBalance: "số tiền đang có",
      otherMonthlyIncome: "thu nhập khác",
      endAge: "tuổi kết thúc",
      rates: "các tỷ lệ giả định",
    },
    listSeparator: ", ",
    listLast: " và ",

    figure: {
      /**
       * The label laid in the house's gable — short enough for one line at
       * 390 px. The whole definition is `unit`, under the levers.
       */
      label: "1 bát = 1 năm nghỉ hưu",
      unavailableLabel: "Chưa vẽ được: có ô chưa hợp lệ",
      /**
       * Short on purpose — it sits above the levers. "phần chi … phải rút từ
       * khoản dành dụm" is the other-income qualifier: a bowl is the draw on
       * the savings, not the household's whole spend. The legend and the
       * sentences under the levers say the rest.
       */
      unit: {
        withOtherIncome:
          "Mỗi bát là chi tiêu một năm nghỉ hưu: lớp xanh là phần thu nhập khác trả, lớp vàng là phần rút từ khoản dành dụm.",
        withoutOtherIncome:
          "Mỗi bát là chi tiêu một năm nghỉ hưu, rút từ khoản dành dụm.",
      },
      legend: {
        // Named by the look, the way one says it: "bát đầy, bát vơi".
        full: "Bát đầy: đủ chi tiêu năm đó",
        partial: "Bát vơi: khoản dành dụm trả được một phần",
        otherOnly: "Còn lớp xanh: hết khoản dành dụm, còn thu nhập khác",
        empty: "Bát rỗng: không còn nguồn nào",
        coveredOtherIncome: "Bát xanh đầy: thu nhập khác đủ chi",
        coveredNoSpending: "Bát kẻ sọc: không cần rút",
      },
      range: { one: "ở tuổi {age}", span: "từ tuổi {from} đến {to}" },
      summary: {
        fullRun: "Đủ chi tiêu {count} năm, {range}.",
        zeroFull:
          "Ngay năm đầu nghỉ hưu, ở tuổi {age}, khoản dành dụm đã không trả đủ.",
        partial: "Năm {age} tuổi, khoản dành dụm trả được {share} phần cần rút.",
        otherOnlyRun:
          "{count} năm cuối, {range}, hết khoản dành dụm; thu nhập khác vẫn trả {share} chi tiêu mỗi năm.",
        allOtherOnly:
          "Cả {count} năm, {range}, khoản dành dụm không trả được; thu nhập khác trả {share} chi tiêu mỗi năm.",
        emptyRun: "{count} năm cuối, {range}, không còn nguồn nào để chi tiêu.",
        allEmpty: "Cả {count} năm, {range}, không có nguồn nào để chi tiêu.",
        funded: "Cả {count} năm, {range}, đều đủ chi tiêu.",
        otherIncome:
          "Cả {count} năm, thu nhập khác đã đủ cho mức chi này, nên khoản dành dụm không bị rút đến.",
        noSpending:
          "Bạn nhập mức chi 0 ₫, nên không năm nào cần rút khoản dành dụm.",
      },
      share: { percent: "{value}%", below: "dưới 1%", above: "hơn 99%" },
    },
    /**
     * The echo of the last lever press, on the picture: what it did, in the
     * years the card counts. Visual only — the ONE live region announces the
     * settled conclusion — and gone as soon as any value changes again.
     */
    change: {
      nowMet: "Giờ đủ cả {count} năm",
      stillMet: "Vẫn đủ cả {count} năm",
      fewerShort: "Bớt {count} năm thiếu",
      moreShort: "Thêm {count} năm thiếu",
      sameShort: "Số năm thiếu không đổi",
    },

    /** The key under the levers — every state, always, so its height holds. */
    legendTitle: "Chú giải hình bát",
    /** What the two layers of a bowl are, said once above the key. */
    legendLayers:
      "Lớp xanh là thu nhập khác (như lương hưu BHXH), lớp vàng là phần rút từ khoản dành dụm.",
    /** The disclosure holding the sentences whose length follows the answer. */
    readingTitle: "Giải thích hình bát và kết luận",

    levers: {
      annualContribution: {
        down: "−12 triệu/năm",
        up: "+12 triệu/năm",
        downName:
          "−12 triệu/năm: giảm khoản để dành năm đầu 12 triệu; sau đó vẫn {growthEach}",
        upName:
          "+12 triệu/năm: tăng khoản để dành năm đầu thêm 12 triệu; sau đó {growthEach}",
        hint: "≈ {monthly}/tháng, rồi {growthPhrase}",
      },
      retirementAge: {
        down: "−1 tuổi",
        up: "+1 tuổi",
        downName: "−1 tuổi: nghỉ hưu sớm hơn 1 năm",
        upName: "+1 tuổi: nghỉ hưu muộn hơn 1 năm",
        hint: "Để dành {saving} năm · chi tiêu {span} năm",
      },
      desiredMonthlySpending: {
        down: "−1 triệu/tháng",
        up: "+1 triệu/tháng",
        downName:
          "−1 triệu/tháng: giảm chi tiêu khi nghỉ hưu 1 triệu mỗi tháng, theo giá hôm nay",
        upName:
          "+1 triệu/tháng: tăng chi tiêu khi nghỉ hưu 1 triệu mỗi tháng, theo giá hôm nay",
        // "≈", not "=": the year is rounded to 0,1 triệu, the month is exact.
        hint: "≈ {annual}/năm · theo giá hôm nay",
      },
      perMonth: "{amount}/tháng",
      age: "{age} tuổi",
      /** The contribution's growth, said the way it moves. */
      growthUp: "tăng {growth}%/năm",
      growthDown: "giảm {growth}%/năm",
      growthEachUp: "tăng dần {growth}% mỗi năm",
      growthEachDown: "giảm dần {growth}% mỗi năm",
      /**
       * A "−" press below one step lands on 0 ₫, so the button says so — its
       * text and its accessible name both, never a 12 triệu it cannot take.
       */
      toZero: "Về 0 ₫",
      toZeroName: "Về 0 ₫: đặt {label} về 0 đồng",
      blocks: {
        unreadable: "Sửa ô chưa hợp lệ ở phần nhập số.",
        atMinimum: "Đã ở mức 0 ₫.",
        atEarliestAge: "Không sớm hơn tuổi hiện tại.",
        atLatestAge: "Phải trước tuổi kết thúc.",
        noAccumulationYears: "Nghỉ ngay nên không còn năm để góp.",
        tooLarge: "Số đã quá lớn để tăng thêm.",
        beforeCurrentAge: "Tuổi nghỉ đang trước tuổi hiện tại.",
        afterEndAge: "Tuổi nghỉ đang từ tuổi kết thúc trở đi.",
        noValidAge: "Tuổi hiện tại cần nhỏ hơn tuổi kết thúc.",
      },
    },
    /**
     * What one saving step is worth by retirement — the difference of two
     * engine projections' contributions IN TODAY'S MONEY (`realContribution`),
     * the page's own basis, and said so: the hero sits above the notice that
     * states it. The growth the button's "/năm" hides is in the total.
     */
    stepTotal:
      "Mỗi lần bấm +12 triệu/năm (≈ +1 triệu/tháng): đến lúc nghỉ hưu, bạn góp thêm tổng cộng khoảng {total}, tính theo giá hôm nay.",
    /**
     * What a lever press says to a screen reader, ahead of the settled
     * conclusion in the ONE live region: the lever, its new value, and what
     * the press did — so a press that leaves the verdict unchanged is still
     * heard.
     */
    pressSaid: "{label}: {value}. {change}.",
    /**
     * "Mục tiêu hưu trí" — the answer to "nên có bao nhiêu để đủ mục tiêu"
     * (the owner's request, 2026-09-27). Every figure is the engine's own,
     * in today's money: the capital required at retirement, the capital the
     * plan reaches, the gap between them, the share reached, and the first
     * available remedy — save more, retire later, spend less — rounded to
     * 100.000 ₫ toward the funded side. The exact figures, and the required
     * capital in that year's prices, are the detail region's "Mức cần có khi
     * nghỉ hưu" rows.
     */
    target: {
      title: "Mục tiêu hưu trí",
      /** Every figure in the panel is in today's money — said once, at its top. */
      basisTag: "theo giá hôm nay",
      /**
       * What the capital pays for, leading into the rows that price it: the
       * reader's own month, split between other income and the savings.
       */
      basis: "Để mỗi tháng có {spend} đến tuổi {endAge}, toàn bộ rút từ khoản dành dụm:",
      basisWithOther:
        "Để mỗi tháng có {spend} đến tuổi {endAge} ({other} từ thu nhập khác, {fromSavings} rút từ khoản dành dụm):",
      /**
       * The same three rows in every state — what is needed, what the plan
       * reaches, what is missing or spare — in the order the result region
       * can share. Labels stay short: label and figure hold one line at 320 px.
       */
      rows: {
        required: "Cần có lúc {age} tuổi",
        requiredUnknown: "Cần có khi nghỉ hưu",
        reached: "Dự kiến có",
        short: "Còn thiếu",
        surplus: "Dư ra",
      },
      /** What the plan reaches, and what it misses, are estimates, said so. */
      about: "khoảng {amount}",
      // The engine's own figure when nothing is required or nothing is missing.
      zero: "0 ₫",
      /**
       * "Theo giá hôm nay", by one bowl of phở: its price today, and the same
       * bowl at retirement — the engine's own deflator, so it follows the
       * inflation field, which may be zero or below it. An example price,
       * not a statistic.
       */
      phoPrice: 50_000,
      pho: "Với giá cả tăng như giả định, tô phở {today} hôm nay tương đương khoảng {then} khi bạn {age} tuổi.",
      phoSame:
        "Theo giả định giá cả không đổi, tô phở {today} hôm nay vẫn là {then} khi bạn {age} tuổi.",
      phoFlat:
        "Theo giả định giá cả gần như không đổi, tô phở {today} hôm nay vẫn khoảng {then} khi bạn {age} tuổi.",
      phoDown:
        "Theo giả định giá cả giảm, tô phở {today} hôm nay chỉ còn khoảng {then} khi bạn {age} tuổi.",
      phoToday: "Bạn nghỉ hưu ngay, nên giá lúc nghỉ cũng là giá hôm nay: tô phở vẫn khoảng {today}.",
      noNeedOther:
        "Thu nhập khác {other} mỗi tháng đã đủ cho mức chi {spend} mỗi tháng, nên không cần rút khoản dành dụm.",
      noNeedSpend:
        "Bạn nhập mức chi 0 ₫, nên kế hoạch không cần rút khoản dành dụm.",
      // The share is of the capital the plan REACHES at retirement — the rows
      // above say when — not of the savings today.
      progress: "Kế hoạch hiện tại đạt khoảng {percent}% số cần có.",
      /** Above 999%: a percent that long says nothing more, and outgrows the line. */
      progressMany: "Kế hoạch hiện tại đạt hơn 10 lần số cần có.",
      progressBoundary: "Kế hoạch hiện tại đạt vừa đúng số cần có.",
      suggest: {
        // Monthly first: a salaried couple budgets by the month.
        // Yearly first — the engine credits the year's saving at its start;
        // the month is a budget equivalence, said as "≈" (`timing` below).
        contribute:
          "Gợi ý: để dành {amount} năm đầu (≈ {monthly}/tháng), rồi {growthEach} — ước tính là đủ.",
        contributeFlat:
          "Gợi ý: để dành {amount} mỗi năm (≈ {monthly}/tháng) — ước tính là đủ.",
        // "Những năm làm thêm": retiring today, there is no saving year yet —
        // the later age adds them, at the saving already entered.
        retireLater:
          "Gợi ý: nghỉ hưu ở tuổi {age}, những năm làm thêm vẫn để dành như mức đang nhập — ước tính là đủ.",
        spendLess:
          "Gợi ý: chi tiêu khoảng {amount} mỗi tháng khi nghỉ hưu — ước tính là đủ với số tiền dự kiến có.",
        none:
          "Một thay đổi riêng lẻ chưa đủ. Hãy thử kết hợp: để dành thêm, nghỉ hưu muộn hơn và giảm chi tiêu.",
      },
      fundedNote: "Kế hoạch đã đủ theo các giả định đang dùng.",
      boundaryNote: "Vừa đủ: sinh lời thấp hơn một chút là có thể thiếu.",
      /** A try, not a commitment: the same button takes it back (`undo`). */
      apply: "Thử mức này",
      undo: "Hoàn tác lần thử",
      /** In place of the suggestion while the try can still be taken back. */
      tried:
        "Đã thử mức gợi ý. Nếu không vừa ngân sách gia đình, hãy hoàn tác hoặc chỉnh bằng các nút ở trên.",
      /** How a saving is counted — always said, beside the suggestion. */
      timing:
        "Công cụ tính như góp cả năm vào đầu năm; góp dần mỗi tháng thì kết quả thấp hơn một chút.",
      /** Each MUST start with `apply` (WCAG 2.5.3, label in name). */
      applyName: {
        contribute: "Thử mức này: để dành {amount} năm đầu",
        retireLater: "Thử mức này: nghỉ hưu ở tuổi {age}",
        spendLess: "Thử mức này: chi tiêu {amount} mỗi tháng khi nghỉ hưu",
      },
      settled: { funded: "Đủ theo giả định", none: "Chưa có gợi ý" },
      unavailable: "Chưa tính được: hãy sửa ô chưa hợp lệ ở phần nhập số.",
    },
    /**
     * The collapsed form: its title — also the hero's last button, which
     * opens it — and every hidden value that moves the result, on the summary
     * line itself, so collapsing it hides no active assumption. The count is
     * the form's own: a render test pins it to the inputs.
     */
    disclosure: {
      title: "Tiền đã có và các giả định khác",
      rates:
        "Sinh lời {before}%/năm trước khi nghỉ và {after}%/năm sau khi nghỉ · lạm phát {inflation}%/năm · khoản để dành {growthPhrase}",
      values:
        "Tiền hưu trí đang có {balance} · để dành {contribution}/năm · thu nhập khác {otherIncome}/tháng · tính đến tuổi {endAge}",
    },
    /** The hero's last button: to the three fields at the top of the form. */
    openForm: "Nhập số của bạn",
    /**
     * The form in two tiers, 2026-09-27: three fields a reader answers from
     * memory, then the other eight, optional, with defaults. Only the fields
     * this route words differently are here; the rest are the shared copy.
     */
    fieldGroups: {
      essential: "Ba thông tin chính",
      /**
       * One plan, one age axis: a couple either plans one person at a time or
       * adds both up against ONE person's ages. Said before the first field,
       * because it decides what every field holds.
       */
      essentialIntro:
        "Tính cho riêng bạn hoặc cả hai vợ chồng: tính chung thì cộng tiền, chi tiêu và thu nhập khi nghỉ hưu của cả hai, lấy tuổi người trẻ hơn làm mốc. Nghỉ hưu cách nhau nhiều năm thì tính riêng từng người sẽ sát hơn.",
      balance: "Tiền đã có và sẽ để dành",
      incomeAndHorizon: "Thu nhập khi nghỉ hưu và mốc cuối",
      rates: "Sinh lời và lạm phát",
    },
    fields: {
      currentAge: {
        label: "Tuổi hiện tại",
        unit: "tuổi",
        help: "Tuổi của bạn bây giờ — hoặc của người được chọn làm mốc, nếu tính cho cả hai vợ chồng.",
      },
      retirementAge: {
        label: "Tuổi muốn nghỉ hưu",
        unit: "tuổi",
        help: "Từ tuổi này, công cụ ngừng cộng tiền để dành và bắt đầu rút ra chi tiêu. Tuổi nghỉ hưu theo luật với người đang đi làm hiện nay: nam 62, nữ 60 — thường là lúc bắt đầu nhận lương hưu BHXH.",
      },
      desiredMonthlySpending: {
        label: "Chi tiêu mỗi tháng khi nghỉ hưu",
        unit: "₫/tháng",
        help: "Với giá cả như hôm nay, mỗi tháng khi nghỉ hưu bạn muốn chi tổng cộng bao nhiêu — kể cả phần lương hưu BHXH sẽ trả (BHXH nhập riêng ở “Thu nhập khác”, công cụ tự trừ). Mẹo: lấy chi tiêu một tháng hiện nay, bớt trả góp nhà hay học phí của con.",
      },
      otherMonthlyIncome: {
        label: "Thu nhập khác mỗi tháng sau khi nghỉ",
        unit: "₫/tháng",
        help: "Tiền nhận đều mỗi tháng khi nghỉ hưu mà không phải rút từ khoản dành dụm: lương hưu BHXH, tiền cho thuê, làm thêm — theo giá hôm nay. Số mẫu 4 triệu chỉ là ví dụ; lương hưu thật tùy số năm và mức đóng BHXH. Công cụ tính khoản này ngay từ tuổi bạn nghỉ hưu; chưa rõ hoặc không có thì thử nhập 0.",
      },
      currentBalance: {
        label: "Số tiền dành cho hưu trí hiện có",
        unit: "₫",
        help: "Chỉ cộng tiền gửi và khoản đầu tư bạn đã để riêng cho hưu trí. Không cộng tiền dành cho mua nhà, nuôi con, giúp bố mẹ hay việc khẩn cấp, và không cộng tiền đã đóng BHXH. Ví dụ 100 triệu.",
      },
      annualContribution: {
        label: "Để dành mỗi năm",
        unit: "₫/năm",
        help: "Tổng tiền bạn để riêng cho hưu trí trong năm đầu. Nghĩ theo tháng thì lấy số mỗi tháng nhân 12 — ví dụ 1,25 triệu mỗi tháng là 15 triệu mỗi năm. Công cụ tính như nộp cả năm vào đầu năm.",
      },
      contributionGrowthPercent: {
        label: "Khoản để dành tăng mỗi năm",
        unit: "%/năm",
        help: "Mỗi năm bạn tăng khoản để dành bao nhiêu %? Ví dụ tăng 6% thì 15 triệu năm đầu thành 15,9 triệu năm sau. Số mẫu 6% thấp hơn mức tăng thu nhập bình quân năm 2025 (8,9%). Nhập 0 nếu giữ nguyên, số âm nếu định giảm.",
      },
      endAge: {
        label: "Muốn tiền đủ đến tuổi",
        unit: "tuổi",
        help: "Nhập 85 nghĩa là tính đến khi bạn tròn 85 tuổi: năm 84 tuổi là năm cuối, từ 85 tuổi trở đi không nằm trong kế hoạch. Thử tăng thêm 5 hoặc 10 năm để xem nếu sống lâu hơn thì tiền có còn đủ không.",
      },
      returnBeforePercent: {
        label: "Sinh lời mỗi năm trước khi nghỉ hưu",
        unit: "%/năm",
        help: "Tiền dành dụm tăng bao nhiêu % mỗi năm nhờ lãi hoặc đầu tư, trước thuế và phí? Ví dụ 6,5%: 100 triệu thành 106,5 triệu sau một năm. Số mẫu 6,5% thấp hơn một chút so với lãi tiết kiệm 12 tháng ở bốn ngân hàng lớn (6,8%/năm, tháng 9/2026). Đây là giả định để tính thử, không phải mức được bảo đảm.",
      },
      returnAfterPercent: {
        label: "Sinh lời mỗi năm sau khi nghỉ hưu",
        unit: "%/năm",
        help: "Mức sinh lời bạn giả định khi đã nghỉ hưu, tính trên tiền còn lại sau mỗi lần rút. Số mẫu 4,5%/năm, thấp hơn giai đoạn trước để thận trọng; trước thuế và phí, không phải dự báo.",
      },
      inflationPercent: {
        label: "Lạm phát (giá cả tăng mỗi năm)",
        unit: "%/năm",
        help: "Giá cả tăng thì cùng số tiền mua được ít hơn. Ví dụ 4,5%: món đồ 100.000 đồng hôm nay sẽ là 104.500 đồng sau một năm. Số mẫu 4,5% theo mục tiêu năm 2026; chỉ số giá tiêu dùng (CPI) bình quân 8 tháng năm 2026 tăng 4,45%. Công cụ dùng mức này cho cả chi tiêu và thu nhập khác.",
      },
    },
  },

  /**
   * The method, in three layers.
   *
   * `body` is what every reader sees: how the plan works in plain words, one
   * worked year each way on the default scenario, what the two readings of a
   * balance mean, how the verdict is decided, and what is not counted.
   * `detail` is the full method — timing, the two orderings, the two
   * deflators, the annuity-due formula, the float residue, the input bounds —
   * behind a labelled disclosure. Nothing from the previous method text was
   * deleted; it moved one click down so a beginner is not asked to read it
   * before understanding their result.
   *
   * The worked figures are the engine's own for the shipped defaults, rounded
   * through `compactMoney` (122,5 triệu; 144,3 triệu; 2,2 tỷ; 730,3 triệu) and
   * pinned by `long-term-plan.test.ts`.
   */
  formula: {
    title: "Cách tính",
    /*
     * Visible: what the tool does, what "theo giá hôm nay" means, and the
     * limits that can change a result. The worked years and how the verdict
     * is read open behind the disclosure, first — the page's last screens
     * get little of a reader's attention, and few need the arithmetic.
     */
    body: [
      "Hiểu ngay: trước khi nghỉ hưu, mỗi năm bạn để dành thêm một khoản và cả số tiền đã có được tính sinh lời theo mức bạn nhập. Sau khi nghỉ, bạn thôi để dành mà rút dần để trang trải chi tiêu — phần còn lại vẫn tiếp tục sinh lời. Công cụ làm phép tính đó cho từng năm, đến tuổi bạn chọn, để xem tiền có đủ không.",
      "Vì giá cả tăng, công cụ ghi mỗi khoản tiền theo hai cách: theo giá của năm đó và theo giá hôm nay. Với số mẫu, khoảng 2,2 tỷ khi nghỉ hưu chỉ mua được lượng hàng như khoảng 730,3 triệu hôm nay. Con số theo giá hôm nay là con số nên dùng để so với chi tiêu hiện tại của bạn.",
      "Công cụ chưa trừ thuế và phí, và tính sinh lời đều mỗi năm; thực tế có năm lãi, năm lỗ, và một năm lỗ mạnh ngay khi bắt đầu rút tiền gây thiệt hại nhiều hơn — công cụ chưa tính điều đó. Vì vậy kết quả thật có thể cao hơn hoặc thấp hơn, nhất là khi tính cho thời gian dài: hãy dùng nó để so sánh các lựa chọn, không phải làm một lời hứa.",
    ],
    /**
     * Editor-selected, and deliberately few. Each phrase occurs in exactly
     * ONE paragraph of `body` and marks that paragraph's point, not a figure.
     */
    emphasis: [
      "rút dần để trang trải chi tiêu",
      "Con số theo giá hôm nay là con số nên dùng",
      "không phải làm một lời hứa",
    ],
    detail: {
      title: "Xem ví dụ và cách tính chi tiết",
      body: [
        "Ví dụ một năm để dành, với số mẫu: đầu năm có 100 triệu, để dành thêm 15 triệu, thành 115 triệu. Sinh lời 6,5% trên 115 triệu là 7,5 triệu, nên cuối năm có 122,5 triệu. Năm sau, khoản để dành tăng 6% thành 15,9 triệu, rồi phép tính lặp lại.",
        "Ví dụ một năm rút tiền: bạn muốn chi 8 triệu mỗi tháng — 96 triệu mỗi năm — theo giá hôm nay, và có 4 triệu mỗi tháng thu nhập khác, nên khoản dành dụm cần bù 48 triệu mỗi năm theo giá hôm nay. Nhưng đến tuổi 60, sau 25 năm giá tăng 4,5% mỗi năm, cùng lượng hàng đó tốn khoảng 144,3 triệu — đó là số tiền thật phải rút trong năm đầu nghỉ hưu. Phần còn lại tiếp tục sinh lời 4,5%, và năm sau lại rút nhiều hơn vì giá tiếp tục tăng.",
        "Kết luận đủ hay chưa đến từ chính phép tính từng năm ấy. Năm đầu tiên khoản dành dụm không đủ trả phần cần rút là năm tiền bắt đầu thiếu; công cụ cho biết cả phần trả được và phần còn thiếu. Dòng “mức chi giữ được đến hết kỳ” cho biết tổng mức chi mỗi năm, kể cả thu nhập khác, mà số tiền khi nghỉ hưu duy trì được đến tuổi kết thúc — thấp hơn mức bạn muốn là phần cần giảm, cao hơn là phần còn dư.",
        "Giai đoạn để dành: mỗi năm, công cụ cộng cả khoản để dành vào đầu năm rồi mới tính sinh lời, như góp vào tháng Một. Nếu bạn chia thành mười hai khoản góp hằng tháng, mười một khoản đến muộn hơn nên được tính sinh lời ít tháng hơn: với mức sinh lời dương, kết quả khi góp hằng tháng thấp hơn cách tính này; ở mức 0% hai cách bằng nhau; ở mức âm thì ngược lại. Ô “để dành mỗi năm” vì thế là tổng cả năm.",
        "Giai đoạn rút tiền: mỗi năm trừ khoản rút trước, rồi mới tính sinh lời trên phần còn lại — chỉ số tiền còn nằm trong quỹ mới được hưởng mức sinh lời giả định, số đã rút ra chi thì không. Hai giai đoạn vì thế có thứ tự khác nhau: để dành thì cộng vào trước rồi sinh lời, rút thì trừ ra trước rồi sinh lời.",
        "Mọi số tiền được báo theo hai cách đếm cùng một khoản: số danh nghĩa là đồng của chính năm đó, còn số theo giá hôm nay là chính nó chia cho lạm phát tích lũy đến năm đó. Khoản rút và khoản để dành diễn ra đầu năm nên được chia cho lạm phát tích lũy đến đầu năm; số dư là con số cuối năm nên chia cho lạm phát tích lũy đến cuối năm. Dùng lẫn hai hệ số này sẽ lệch đúng một năm lạm phát.",
        "Mức chi tiêu mong muốn và thu nhập khác được nhập theo giá hôm nay, rồi công cụ nhân với lạm phát tích lũy để ra số tiền của từng năm. Phép quy đổi này làm cho khoản rút mỗi năm giữ được cùng sức mua với mức bạn nhập, và làm cho khoản rút danh nghĩa thay đổi theo mức lạm phát bạn giả định: tăng khi lạm phát dương, đứng yên ở 0% và giảm khi lạm phát âm.",
        "Khoản rút của một năm không bao giờ vượt số tiền còn lại. Nếu nhu cầu của một năm không được đáp ứng đủ thì năm đó được ghi là năm tiền bắt đầu thiếu — và năm đó thường vẫn trả được một phần, nên công cụ báo cả phần đã trả và phần còn thiếu thay vì chỉ một cái tuổi.",
        "Mức chi giữ được đến hết kỳ được giải bằng công thức niên kim đầu kỳ theo lợi suất thực — lợi suất thực là (1 + lợi suất sau khi nghỉ) ÷ (1 + lạm phát) − 1. Đầu kỳ vì phép tính rút tiền đầu năm rồi mới tính sinh lời, nên công thức phải theo đúng thời điểm đó. Thu nhập khác được cộng thêm vào mức này vì nó không phụ thuộc số vốn.",
        "Một mức chi được giải bằng công thức rồi đưa trở lại phép tính từng năm có thể làm năm cuối cùng thiếu vài phần triệu của một đồng. Đó là sai số làm tròn của số thực trong máy tính, không phải một năm bị mất: công cụ chỉ bỏ qua khoản đó ở đúng năm cuối kỳ, chỉ khi nó không đáng kể so với nhu cầu của năm đó, và luôn ghi ra phần dư đã bỏ qua ngay dưới kết quả.",
        "Các mốc tuổi phải là số nguyên từ 0 đến 120, theo thứ tự tuổi hiện tại ≤ tuổi nghỉ < tuổi kết thúc, và cả kỳ không quá 100 năm. Năm cuối được tính là năm trước tuổi kết thúc: chọn kết thúc ở 85 nghĩa là kế hoạch tính chi tiêu cho đến khi bạn tròn 85 tuổi, và năm 85 tuổi không nằm trong kế hoạch. Mức sinh lời, lạm phát và tốc độ tăng khoản để dành nằm trong khoảng lớn hơn −100% đến 100%. Ngoài các khoảng đó công cụ không tính, thay vì đoán.",
      ],
    },
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao số tiền theo giá hôm nay lại thấp hơn nhiều thế?",
        a: "Vì giá cả tăng suốt 25 năm để dành. Với lạm phát 4,5%/năm, sau 25 năm giá bằng 1,045^25 = 3,01 lần hôm nay, nên 2.194.741.612 ₫ ở tuổi 60 chỉ mua được lượng hàng mà 730.257.686 ₫ mua hôm nay — khoảng 33,3%. Số lớn là tiền của năm bạn 60 tuổi; số theo giá hôm nay mới là số để so với chi tiêu hiện tại của bạn.",
      },
      {
        q: "Nên chọn tuổi kết thúc là bao nhiêu?",
        a: "Cao hơn mức bạn nghĩ là vừa đủ. Công cụ không dự đoán tuổi thọ và không chọn thay bạn: tuổi kết thúc trả lời câu hỏi “nếu sống đến tuổi này thì tiền còn không”. Kế hoạch tính chi tiêu cho đến khi bạn tròn tuổi đó — chọn 85 nghĩa là tính đến hết năm 84 tuổi. Hãy thử thêm 5 hoặc 10 năm để xem kết quả đổi thế nào. Trang “Tiêu được bao nhiêu” có sẵn trường hợp sống lâu hơn 5 năm so với mốc bạn nhập.",
      },
      {
        q: "Vì sao mức sinh lời sau khi nghỉ thường được đặt thấp hơn?",
        a: "Để bạn thử trường hợp tiền tăng chậm hơn khi đã nghỉ hưu: lúc đang rút tiền, một đợt giảm mạnh gây thiệt hại nhiều hơn vì phải bán ra đúng lúc giá thấp. Cả hai mức sinh lời đều do bạn nhập và được tính đều mỗi năm, nên công cụ chưa mô phỏng những đợt giảm như vậy. Hãy xem kết quả là một cách tính thử, không phải dự báo.",
      },
      {
        q: "Tỷ lệ rút năm đầu 6,57% có an toàn không?",
        a: "Tỷ lệ này cho biết năm đầu nghỉ hưu bạn rút bao nhiêu phần trăm số tiền có lúc nghỉ. Một mình nó chưa nói được kế hoạch có an toàn hay không, vì còn tùy sinh lời, giá cả và bạn sống bao lâu. Con số dễ dùng hơn là “mức chi giữ được đến hết kỳ” trong phần chi tiết: với số mẫu, mức đó là 77.210.307 ₫ mỗi năm theo giá hôm nay, so với 96.000.000 ₫ bạn muốn — thấp hơn 18.789.693 ₫ mỗi năm.",
      },
      {
        q: "Dòng “chi tiêu cần giảm mỗi tháng” có phải là số tôi cần để dành thêm không?",
        a: "Không. Đó là khoảng chênh giữa mức chi bạn muốn và mức kế hoạch hiện tại giữ được đến tuổi kết thúc, theo giá hôm nay — với số mẫu là 18.789.693 ₫ mỗi năm, khoảng 1,6 triệu mỗi tháng. Nó không phải số tiền phải nộp thêm mỗi năm từ bây giờ, và không phải tổng số vốn còn thiếu. Số tiền cần có khi nghỉ hưu, phần còn thiếu và một khoản để dành đủ cho kế hoạch nằm ở phần “Mục tiêu hưu trí” đầu trang.",
      },
      {
        q: "Công cụ có trừ thuế và phí không?",
        a: "Chưa. Số tiền hiển thị chưa trừ thuế và phí; nếu các khoản này phát sinh, tiền thực còn để chi sẽ ít hơn. Công cụ không tự tính thuế hay phí cho từng khoản đầu tư và không mô phỏng quy định thuế của nước nào.",
      },
      {
        q: "Chuyển sang trang hưu trí khác có giữ số đã nhập không?",
        a: "Không — khi chuyển trang, bạn cần nhập lại. Trang này xem tiền qua từng tuổi; “Cần dành bao nhiêu” tính khoản để dành; “Thiếu bao nhiêu” xem tiền còn thiếu và cách bù; “Tiêu được bao nhiêu” tính mức chi giữ được. Các trang dùng chung cách tính nhưng khác số mẫu: trang này dùng giả định tháng 9/2026 và hỏi chi tiêu, thu nhập khác theo tháng, còn ba trang kia hỏi theo năm — lấy số tiền tháng nhân 12.",
      },
    ],
  },
} as const;
