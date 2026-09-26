// The shared Vietnamese layer behind the merged long-term plan.
//
// Original plan rows 44, 45, 48 and 50 are four URLs asking four questions
// about ONE household plan:
//
//   44 /cong-cu/ke-hoach-huu-tri/            — the trajectory, year by year
//   45 /cong-cu/tinh-huu-tri/                — the contribution the plan needs
//   48 /cong-cu/phan-tich-tiet-kiem-huu-tri/ — the capital gap, and what closes it
//   50 /cong-cu/thu-nhap-huu-tri/            — the draw the capital supports
//
// `lib/calc/long-term-plan.ts` merged the ANSWERS: one `RetirementInput`
// resolved into all four views by one engine, so the four routes cannot
// disagree about the capital at retirement or the year the money runs out.
// That module deliberately localises nothing — "every amount is in whatever
// currency the inputs are, and nothing here formats". THIS file is the other
// half of that split: one set of Vietnamese strings and ONE default scenario,
// in đồng, so the four routes cannot disagree about the assumptions either.
//
// WHY A SHARED CONTENT MODULE RATHER THAN FOUR. The four pages previously each
// owned a full copy of the same eleven field labels, the same rate helps and
// the same USD scenario. Four copies of one scenario is four places to edit
// and three places to forget: the registry said all four modelled United
// States law while `lib/calc/retirement.ts` models no law at all — it is
// arithmetic on a balance, a contribution, a return and an inflation rate.
// Nothing in the engine is American. What was American was the denomination.
//
// Each route still owns its own title, lede, notice, result labels, method
// prose and FAQ, because each answers a different question. Only the things
// that MUST agree live here: the scenario, the field copy, the currency words,
// the shared scope, and the four-view control's labels.
//
// ── THE DEFAULT SCENARIO IS ILLUSTRATIVE AND NEEDS FOUNDER REVIEW ───────────
//
// Flagged deliberately. These eleven figures are what an unedited page
// computes, so they are the numbers a reader sees first and the numbers this
// suite's own tests pin. They are a PLAUSIBLE Vietnamese household, not a
// measurement of one, and nothing here is a market, statutory or population
// claim — the copy says so, and `docs/calculator-suite-status.md` §7 records
// "no unverified population claim in copy" as a standing rule.
//
//   Tuổi 35 → nghỉ 60 → dự phóng đến 85.
//     A 25-year accumulation and a 25-year drawdown: long enough that
//     inflation visibly separates the two readings of the balance, which is
//     row 44's whole lesson. 60 is a household TARGET the reader is expected
//     to move, not a statutory age — the copy never quotes one.
//   Số dư hiện có 500.000.000 ₫; góp 60.000.000 ₫/năm tăng 5%/năm.
//     60 triệu/năm is 5 triệu/tháng, which is a legible monthly figure for a
//     reader to compare against their own. The 5% growth stands in for wage
//     growth and is the reader's own assumption.
//   Lợi suất 8%/năm trước khi nghỉ, 5%/năm sau; lạm phát 4%/năm.
//     Two different returns on purpose: the engine models a portfolio that
//     moves to lower-volatility assets around retirement, and this is exactly
//     why the shared disclaimer's old "lãi suất không đổi" claim was false on
//     this page (see `shared.ts`). Illustrative, nominal, and the reader's to
//     replace — no range is quoted anywhere, because none has been verified.
//   Chi tiêu mong muốn 240.000.000 ₫/năm (20 triệu/tháng, giá hôm nay);
//   thu nhập khác 36.000.000 ₫/năm (3 triệu/tháng).
//     Both in today's money, which is the engine's contract.
//
// WHAT THIS SCENARIO DOES, and why it was chosen over a funded one: it opens
// SHORT. The capital reaches 4.089.679.933 ₫ in today's money against
// 4.557.557.871 ₫ needed, the money runs out at 82 against a horizon of 85,
// and all three remedies are available. A planning tool whose default state
// reports "đủ" demonstrates nothing — the same judgement
// `retirement-savings-analysis.test.ts` already records for row 48.
//
// Every figure quoted in any of the four routes' prose is this scenario's
// output, verified by running the module; `long-term-plan.test.ts` pins them
// and re-derives them from the strings below with the same parsers the
// components use. Change a default and that test tells you which sentences
// moved.
//
// ── NUMBER GRAMMAR ─────────────────────────────────────────────────────────
//
// The defaults below are FORM STRINGS in Vietnamese grammar, read by
// `readRetirement` in `components/calc/retirement-fields.tsx`: money through
// `parseMoney`, ages through `parseCount`, rates through `parseDecimal`. Those
// three are not interchangeable — `parseDecimal("500.000")` is 500, a 1000x
// error, and `parseCount` exists because `parseMoney("3.0")` is 30. See §4 of
// `docs/calculator-suite-status.md`. Nothing here formats: no `Intl`, no
// `toLocaleString`, ever.

import type { RetirementFieldKey } from "@/components/calc/retirement-fields";
import type { LongTermView } from "@/lib/calc/long-term-plan";

/**
 * The one scenario all four routes open on, as form strings.
 *
 * Typed to the field keys so a renamed field is a type error rather than a
 * silently missing default that renders an empty input.
 */
const DEFAULTS: Record<RetirementFieldKey, string> = {
  currentAge: "35",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "500.000.000",
  annualContribution: "60.000.000",
  contributionGrowthPercent: "5",
  returnBeforePercent: "8",
  returnAfterPercent: "5",
  inflationPercent: "4",
  desiredAnnualSpending: "240.000.000",
  otherAnnualIncome: "36.000.000",
};

export const LONG_TERM_PLAN = {
  defaults: DEFAULTS,

  /**
   * The currency, once.
   *
   * `lib/` holds no user-facing Vietnamese, so the chart adapters take these
   * as arguments and the components suffix amounts with `currency`. One copy
   * shared by four routes, so two pages of the same plan cannot disagree about
   * what a billion is called.
   */
  money: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
  },

  /**
   * The eleven inputs, shared by all four routes.
   *
   * Two of the four hide a field they SOLVE for instead of asking — row 45
   * solves the contribution, row 50 solves the spending — which
   * `RetirementFields`' `omit` handles. The labels are identical either way,
   * because it is the same input.
   *
   * EVERY HELP LINE TEACHES BY EXAMPLE, 2026-09-26. The reader-first review
   * (`artifacts/finhome-retirement-content-review-2026-09-26.md`, P2) found
   * the helps defined terms without showing what to type. Each now answers
   * "what do I put here" with a worked figure the reader can scale — 5 triệu
   * a month is 60 triệu a year — while keeping the model's own qualification
   * where it changes the answer: the contribution is added ONCE a year, so a
   * monthly example is a way to arrive at the annual total, not a monthly
   * engine. The sentence that called living longer "không phải một điều may"
   * is gone; the advice to plan for a longer life is not.
   */
  fields: {
    ageGroup: "Các mốc tuổi",
    balanceGroup: "Tích lũy",
    spendingGroup: "Chi tiêu khi nghỉ hưu",
    rateGroup: "Giả định lợi suất và lạm phát",
    ageInvalid: "Vui lòng nhập một tuổi là số nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số tiền từ 0 trở lên, đơn vị đồng.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    fields: {
      currentAge: {
        label: "Tuổi hiện tại",
        unit: "tuổi",
        help: "Tuổi của bạn bây giờ. Kế hoạch được tính từ tuổi này.",
      },
      retirementAge: {
        label: "Tuổi dự định nghỉ",
        unit: "tuổi",
        help: "Tuổi bạn dự định ngừng để dành và bắt đầu rút tiền ra chi tiêu. Đây là mốc do bạn chọn, không phải tuổi nghỉ hưu theo luật. Năm cuối còn để dành là năm trước tuổi này.",
      },
      endAge: {
        label: "Dự phóng đến tuổi",
        unit: "tuổi",
        help: "Bạn muốn tiền đủ chi tiêu đến bao nhiêu tuổi? Ví dụ, chọn 85 nghĩa là kế hoạch tính chi tiêu cho các năm từ lúc nghỉ hưu đến khi bạn tròn 85 tuổi; năm 85 tuổi trở đi không nằm trong kế hoạch. Nên chọn cao hơn mức bạn nghĩ là vừa đủ, để kế hoạch vẫn vững nếu bạn sống lâu hơn dự tính.",
      },
      currentBalance: {
        label: "Số tiền dành cho hưu trí hiện có",
        unit: "₫",
        help: "Tổng những khoản bạn đã để riêng cho hưu trí — tiền gửi, quỹ, chứng khoán. Ví dụ, 300 triệu tiền gửi và 200 triệu chứng khoán là 500 triệu. Không tính tiền dự phòng cho việc gấp.",
      },
      annualContribution: {
        label: "Dành thêm mỗi năm",
        unit: "₫/năm",
        help: "Cộng tất cả số tiền bạn dự định để dành cho hưu trí trong một năm. Ví dụ, để dành 5 triệu mỗi tháng tương đương 60 triệu mỗi năm. Mô hình cộng khoản này một lần vào đầu mỗi năm.",
      },
      contributionGrowthPercent: {
        label: "Khoản dành thêm tăng mỗi năm",
        unit: "%/năm",
        help: "Bạn dự định tăng số tiền để dành bao nhiêu mỗi năm? Ví dụ, năm nay để dành 60 triệu, tăng 5% thì năm sau là 63 triệu. Nếu muốn giữ nguyên khoản để dành mỗi năm, nhập 0.",
      },
      desiredAnnualSpending: {
        label: "Chi tiêu mong muốn mỗi năm",
        unit: "₫/năm",
        help: "Nếu nghỉ hưu với mức giá hiện nay, mỗi năm bạn muốn chi bao nhiêu? Ví dụ, 20 triệu mỗi tháng là 240 triệu mỗi năm. Bạn nhập theo giá hôm nay; công cụ tự tính thêm phần giá cả tăng trong tương lai.",
      },
      otherAnnualIncome: {
        label: "Thu nhập khác mỗi năm sau khi nghỉ",
        unit: "₫/năm",
        help: "Tiền bạn dự kiến nhận đều mỗi năm sau khi nghỉ mà không phải rút từ khoản dành dụm: lương hưu, tiền cho thuê, việc làm thêm. Ví dụ, lương hưu 3 triệu mỗi tháng là 36 triệu mỗi năm. Cũng nhập theo giá hôm nay.",
      },
      returnBeforePercent: {
        label: "Lợi suất trước khi nghỉ",
        unit: "%/năm",
        help: "Mức sinh lời bạn giả định cho khoản tiền dành dụm, tính theo năm và chưa trừ lạm phát. Ví dụ 8% nghĩa là 100 triệu có thể thành 108 triệu sau một năm, trước thuế và phí, và chỉ khi giả định đó đạt được. Đây là ví dụ cách nhập, không phải mức sinh lời được bảo đảm.",
      },
      returnAfterPercent: {
        label: "Lợi suất sau khi nghỉ",
        unit: "%/năm",
        help: "Mức sinh lời bạn giả định sau khi nghỉ. Nhiều người đặt thấp hơn mức trước khi nghỉ, vì lúc đó thường chuyển sang các khoản ít biến động hơn. Ví dụ 5%. Cũng là con số bạn tự giả định.",
      },
      inflationPercent: {
        label: "Lạm phát",
        unit: "%/năm",
        help: "Giá cả tăng bao nhiêu mỗi năm theo giả định của bạn. Ví dụ 4% nghĩa là món hàng 100.000 đồng hôm nay sẽ khoảng 104.000 đồng sau một năm. Công cụ dùng con số này để tính chi tiêu của từng năm và quy mọi số dư về giá hôm nay.",
      },
    },
  },

  /**
   * The four-view control.
   *
   * One plan, four questions. `slug` is here beside the label because the
   * pairing between a question and a URL is content, not layout, and
   * `next-steps.ts` already keeps slugs in a content file. `question` is what
   * the reader wants to know; `label` is the short form for the control.
   *
   * THE INTRO PROMISES ONLY WHAT THE PAGES DO, 2026-09-26. It used to say the
   * four pages "không thể đưa ra những con số trái nhau", which a reader took
   * as "my numbers travel with me" — the review changed the balance to
   * 600.000.000 ₫, followed a link, and met 500.000.000 ₫ again. The shared
   * formula is still true and still stated; what is added is the fact that
   * nothing is stored or carried over, so the reader re-enters their figures.
   * No persistence, no URL state and no handoff is implied or built.
   *
   * The text is INDEPENDENT of which view is current: it renders on all four
   * routes, so it names no sibling and counts no "trang còn lại". The current
   * page is marked by the control itself (`currentLabel`, `aria-current`).
   */
  views: {
    title: "Bốn câu hỏi về cùng một kế hoạch",
    intro:
      "Bốn trang dưới đây nhìn cùng một kế hoạch từ bốn câu hỏi; trang bạn đang xem được đánh dấu, và bạn có thể mở trang khác để tìm cách điều chỉnh. Bốn trang dùng chung một cách tính, nên cùng một bộ số sẽ cho cùng kết quả. Hiện tại, số bạn vừa nhập không được mang sang: khi chuyển trang, bạn cần nhập lại.",
    currentLabel: "Bạn đang xem",
    items: [
      {
        view: "trajectory",
        slug: "ke-hoach-huu-tri",
        label: "Kế hoạch chạy ra sao",
        question: "Từng năm một, kế hoạch của tôi diễn biến thế nào?",
      },
      {
        view: "contribution",
        slug: "tinh-huu-tri",
        label: "Cần dành bao nhiêu",
        question: "Mỗi năm tôi cần dành ra bao nhiêu để kế hoạch đủ?",
      },
      {
        view: "gap",
        slug: "phan-tich-tiet-kiem-huu-tri",
        label: "Thiếu bao nhiêu",
        question: "Kế hoạch còn thiếu bao nhiêu vốn, và bù bằng cách nào?",
      },
      {
        view: "withdrawal",
        slug: "thu-nhap-huu-tri",
        label: "Tiêu được bao nhiêu",
        question: "Với số vốn này, tôi tiêu được bao nhiêu mỗi năm?",
      },
    ] as const satisfies readonly {
      view: LongTermView;
      slug: string;
      label: string;
      question: string;
    }[],
  },

  /**
   * The scope every one of the four pages shares.
   *
   * `disclaimer` overrides the shared default from `shared.ts`, which this
   * page is one of the two reasons was rewritten twice: it has rate fields and
   * uses a different return before and after retirement, so "giả định mức lãi
   * đó giữ nguyên trong suốt thời gian được tính" was false here. It KEEPS the
   * opening clause `scripts/check-built-markup.mjs` counts and replaces only
   * what follows it.
   *
   * There was an `assumptions` array here, commented "appended to each chart's
   * own list", which nothing ever read. It was removed rather than wired in,
   * and should not come back: three of its four lines were already in the
   * `disclaimer` above VERBATIM — the input-owned figures, the even-return
   * caveat with sequence risk, and the no-tax-no-fees line — and the fourth,
   * the start-of-year timing of a contribution and a withdrawal, is carried by
   * each page's own method prose where it changes that page's answer (row 44
   * emphasises "được hưởng đủ một năm lợi suất", row 50 "niên kim đầu kỳ").
   *
   * Appending it would have put four plan-level restatements under every
   * figure, next to a disclaimer already saying three of them, and diluted the
   * figure's own reading notes — which are about how to read THAT drawing
   * (what the axis counts, what the two lines are), not about the plan. Same
   * failure mode as over-emphasis: assumptions stated everywhere are
   * assumptions read nowhere. One shared disclaimer, plus per-figure reading
   * notes, is the split that works.
   */
  scope: {
    disclaimer:
      "Công cụ này chỉ mang tính minh họa: bốn trang của kế hoạch hưu trí dùng chung một bộ giả định do chính bạn nhập, và mô hình dùng hai mức lợi suất khác nhau — một trước khi nghỉ, một sau khi nghỉ — nên ở đây không có giả định nào về một mức lãi suất giữ nguyên suốt kỳ. Mọi số tiền tính bằng đồng Việt Nam. Phép tính không trừ thuế, không trừ phí quản lý danh mục, và coi lợi suất là đều đặn mỗi năm — điều mà thị trường không làm, nên rủi ro về thứ tự các năm được và mất không được mô phỏng. Kết quả không phải cam kết lợi nhuận và không phải lời khuyên đầu tư. Vui lòng cân nhắc kỹ hoặc tham khảo chuyên gia trước khi ra quyết định tài chính.",
  },
} as const;
