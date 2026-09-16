// Copy for /cong-cu/phan-tich-tiet-kiem-huu-tri/ — the GAP view of the merged
// long-term plan (original plan row 48): what the plan is short by, and what
// closes it.
//
// Original FinHome copy. Denominated in đồng, and it models NO country's law:
// `lib/calc/retirement.ts` is arithmetic on a balance, a contribution, two
// returns and an inflation rate. The registry's `usRules: true` flag was
// removed from this row in the foundation slice — the notice it rendered ("mô
// phỏng quy định về thuế và hưu trí của Hoa Kỳ") described a model that does
// not exist here. That left this page in a broken interim state, which this
// unit closes: the flag was gone while the copy and the defaults were still in
// dollars, so the page showed dollar amounts with nothing explaining them.
//
// The scenario, the eleven field labels, the four-view control's copy and the
// shared scope live in `content/calculators/long-term-plan.ts`, because three
// sibling routes must agree with them. This file holds only what is this
// page's own: its title, its notice, its result labels, its remedy copy, its
// method prose and its FAQ. It deliberately ships NO defaults of its own —
// all four routes answer from one scenario or the merge is a lie.
//
// ── EVERY FIGURE QUOTED BELOW IS THE MODEL'S OUTPUT ────────────────────────
//
// Recomputed by running `resolveLongTermPlan` on `LONG_TERM_PLAN.defaults`
// (35 tuổi → nghỉ 60 → đến 85; 500.000.000 ₫ đang có; dành thêm
// 60.000.000 ₫/năm tăng 5%/năm; lợi suất 8% trước / 5% sau; lạm phát 4%; chi
// tiêu mong muốn 240.000.000 ₫ và thu nhập khác 36.000.000 ₫, cả hai theo giá
// hôm nay). NONE of these was scaled from the superseded USD figures:
//
//   Vốn sẽ có, giá hôm nay:   4.089.679.933 ₫ (10.902.417.350 ₫ danh nghĩa)
//   Vốn cần có, giá hôm nay:  4.557.557.871 ₫ (12.149.703.354 ₫ danh nghĩa)
//   Còn thiếu:                  467.877.938 ₫ — đáp ứng 89,7%, thiếu 10,3%
//   Cạn ở tuổi 82: thiếu 3 trong 25 năm nghỉ hưu, tức 12,0% số năm
//     (năm cạn cần 1.288.834.386 ₫, trả được 181.159.463 ₫,
//      còn thiếu 1.107.674.923 ₫)
//   Lợi suất thực sau khi nghỉ: 1,05/1,04 − 1 = 0,96%/năm
//   Ba cách bù:
//     dành thêm — cần 70.007.403 ₫/năm (5.833.950 ₫/tháng theo phép chia 12),
//       tức thêm 10.007.403 ₫/năm = 833.950 ₫/tháng, tăng 16,7%
//     nghỉ muộn hơn — tuổi 62, muộn 2 năm
//     chi tiêu ít hơn — 219.057.403 ₫/năm, giảm 20.942.597 ₫/năm
//       (1.745.216 ₫/tháng), còn 91,3% mức mong muốn
//   Lùi một năm (nghỉ 61):  đáp ứng 98,4% và VẪN cạn, ở tuổi 84
//   Lùi hai năm (nghỉ 62):  vốn sẽ có 4.572.421.979 ₫, vốn cần có
//     4.231.721.110 ₫, đáp ứng 108,1%, không cạn — và mức dành thêm mà kế
//     hoạch cần khi đó chỉ còn 53.586.256 ₫/năm, thấp hơn 60.000.000 ₫ đang dành
//   Nâng lợi suất sau khi nghỉ 5% → 7%: vốn cần có xuống 3.702.187.770 ₫,
//     đáp ứng 110,5%, kế hoạch thành đủ — vốn sẽ có không đổi
//
// `retirement-savings-analysis.test.ts` re-derives every one of these from the
// SHARED default strings with the same parsers the component uses and pins
// them against the sentences below, so a moved default is a red test naming
// the sentences that have to move with it.
//
// ── WHAT THE OLD COPY CLAIMED AND THIS ONE DOES NOT ────────────────────────
//
// The USD copy's headline claim was that a small capital shortfall costs a
// disproportionate number of retirement years: "thiếu 11,1% vốn ... làm 5 năm
// cuối không còn đồng nào", 5 of 30 years for 11,1% of the capital. That was a
// property of ITS scenario, not a law, and at đồng magnitudes it does not
// hold: 10,3% of the capital missing costs 12,0% of the years. Restating it
// here would be asserting an inequality that happened to hold on a fixture —
// docs §7's rule. What IS measurable and is what this page now teaches is the
// remedy set: three answers with three different units, one of which moves
// both sides of the comparison at once.
//
// ── ALL-CAPS WAS REPLACED BY DECLARED EMPHASIS ─────────────────────────────
//
// The previous copy shouted "HƠN", "GIÁ HÔM NAY", "HAI" and "CẢ HAI"
// mid-sentence. They are sentence case now, and `formula.emphasis` declares
// the few phrases carrying the distinction each paragraph is about — through
// `lib/prose-emphasis.ts`, so the paragraph stays one plain string and joining
// the rendered spans reproduces it exactly. Never `dangerouslySetInnerHTML`.

export const RETIREMENT_SAVINGS_ANALYSIS = {
  slug: "/cong-cu/phan-tich-tiet-kiem-huu-tri",

  pageTitle: "Kế hoạch dài hạn: thiếu bao nhiêu, bù bằng gì",
  metaTitle: "Kế hoạch dài hạn còn thiếu bao nhiêu — Và ba cách bù khoảng thiếu",
  metaDescription:
    "Đặt số vốn kế hoạch dài hạn của bạn sẽ đạt được cạnh số vốn nó thực sự cần, tính bằng đồng, rồi định lượng ba cách bù khoảng thiếu: dành thêm, nghỉ muộn hơn, hoặc chi tiêu ít hơn. Công cụ miễn phí của FinHome.",

  lede:
    "Trang này không lập kế hoạch mới. Nó lấy kế hoạch bạn đang chạy, đặt số vốn kế hoạch đó sẽ đạt được cạnh số vốn nó thực sự cần, rồi định lượng ba cách bù khoảng thiếu: dành thêm mỗi năm, nghỉ muộn hơn, hoặc chi tiêu ít hơn. Ba cách đó không cùng đơn vị, nên trang định lượng chúng chứ không xếp hạng chúng.",

  form: {
    resultTitle: "Khoảng thiếu của kế hoạch",
    verdictLabel: "Kế hoạch hiện tại",
    verdictYes: "Đủ",
    verdictNo: "Thiếu",
    coverageLabel: "Tỷ lệ đáp ứng vốn",
    gapRealLabel: "Còn thiếu, theo giá hôm nay",
    depletionLabel: "Tiền cạn ở tuổi",

    capitalTitle: "Vốn khi nghỉ: sẽ có và cần có",
    reachedRealLabel: "Sẽ có, theo giá hôm nay",
    requiredRealLabel: "Cần có, theo giá hôm nay",
    reachedNominalLabel: "Sẽ có, danh nghĩa",
    requiredNominalLabel: "Cần có, danh nghĩa",
    yearsShortLabel: "Số năm nghỉ hưu chưa được cấp vốn",
    yearsUnit: "năm",

    /**
     * The contribution remedy gets its own block because it is the only one of
     * the three a reader will want per month — and a yearly figure divided by
     * twelve is a BUDGETING equivalence, not a payment schedule that reaches
     * the same balance. `monthlyEquivalent` is named that way in the model for
     * this reason, and the label here has to say which of the two it is.
     */
    contributeTitle: "Nếu bạn chọn cách dành thêm",
    contributeAnnualLabel: "Mức dành thêm cần thiết mỗi năm",
    contributeMonthlyLabel: "Quy ra mỗi tháng, chỉ để so sánh",

    /**
     * The remedy set, which is this page's teaching.
     *
     * Three columns, not the six the age-sweep table had. That table ran its
     * own `projectRetirement` and `solveRequiredContribution` calls inside
     * JSX — the defect `lib/calc/long-term-plan.ts` names this route for — and
     * at 390 px six columns of nine-digit đồng figures do not read. Every cell
     * below is a field of one `GapAnswer`.
     */
    remedies: {
      caption: "Ba cách bù cùng một khoảng thiếu",
      intro:
        "Ba cách bù được giải riêng, mỗi cách một phép giải, nên đây không phải ba phần của khoảng thiếu mà là ba câu trả lời đầy đủ cho nó. Chúng cũng không cùng đơn vị — tiền mỗi năm, năm làm việc, mức sống — nên bảng chỉ nói mỗi cách phải đạt tới đâu và chênh lệch so với kế hoạch hiện tại.",
      wayColumn: "Cách bù",
      targetColumn: "Phải đạt tới",
      /**
       * Short on purpose, with the referent in `intro` rather than in the
       * heading.
       *
       * "So với kế hoạch hiện tại" is 24 characters, and a browser review at
       * 390 px measured it starving to a 55 px track beside a 233 px money
       * value — four ragged lines on two of the three remedy blocks. The
       * label track is the one that wraps in `ResultTable`'s `mobileCards`
       * grid, by design, because a money figure must never break across
       * lines. So the heading gets shorter and the sentence above the table
       * carries "so với kế hoạch hiện tại", where 390 px is not a constraint.
       */
      changeColumn: "Chênh lệch",
      contributeLabel: "Dành thêm mỗi năm",
      retireLabel: "Nghỉ muộn hơn",
      spendLabel: "Chi tiêu ít hơn",
      contributeChange: "Thêm {amount}",
      retireTarget: "{age} tuổi",
      retireChange: "Muộn {years} năm",
      spendChange: "Giảm {amount}",
      /** A funded plan needs no remedy; that is not the same as one failing. */
      noChange: "Không cần",
      /**
       * Why a remedy is missing, said per remedy AND per cause.
       *
       * The contribution remedy goes unavailable for two different reasons and
       * they are two different sentences: the solver found nothing in its
       * bracket (`unreachable`), or retirement is today and there is no year
       * left to contribute in (`noTimeToContribute`). Both arrive as
       * `available: false`, so the page reads `plan.contribution.state` to say
       * which — docs §7's rule that a null has as many meanings as it has
       * causes.
       *
       * `{years}` is filled from `MAX_EXTRA_WORKING_YEARS`, so the sentence
       * cannot drift from the bound the model actually searches. "No
       * retirement age works" and "no retirement age within seven years works"
       * are different claims, and only the second one is true.
       */
      contributeUnavailable: "Không có mức nào trong khoảng tìm kiếm",
      contributeNoTime: "Không còn năm nào để dành thêm",
      retireUnavailable: "Không có tuổi nào trong {years} năm tới",
      spendUnavailable: "Không có mức chi để hạ",
      changeUnavailable: "—",
    },

    gapNotice:
      "Kế hoạch này không cấp vốn đủ cho mức chi tiêu đã nhập đến hết kỳ dự phóng. Tỷ lệ đáp ứng vốn ở trên là một khoảng cách, không phải một mức độ thoải mái: hãy đọc nó cùng với tuổi cạn tiền ngay bên cạnh. Bảng bên dưới định lượng ba cách bù, và một trong ba cách tác động lên cả hai vế của phép so sánh cùng lúc.",
    fundedNotice:
      "Kế hoạch hiện tại đủ cho mức chi tiêu này đến hết kỳ dự phóng, nên trang này không có khoảng thiếu nào để bù. Trang “Cần dành bao nhiêu” cho biết mức dành thêm tối thiểu mà kế hoạch đòi hỏi, tức bạn có thể hạ xuống bao nhiêu mà vẫn đủ — nhưng toàn bộ phép tính này dùng một lợi suất đều, không có biến động, nên phần dư chính là biên an toàn duy nhất bạn có.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden. `fundedAtBoundary` returns the residue precisely so a page can
     * say it; a verdict that silently forgives a shortfall is a verdict the
     * reader cannot check.
     */
    boundaryNotice:
      "Năm cuối kỳ còn thiếu một phần cực nhỏ của một đồng ({residue} ₫). Đó là sai số làm tròn của số thực, không phải một năm không được chi trả, nên kế hoạch vẫn được tính là đủ — và phần dư đó được ghi ra đây thay vì bỏ qua trong im lặng.",
    /**
     * Short, and neither of the two remedies that PRESERVE the spend reaches
     * it.
     *
     * Not "no remedy available": the third remedy is the level spend the
     * capital already supports, and that one exists whenever there is capital
     * and a spend to reduce — so a blanket "không cách nào" was copy that could
     * never render. What is reachable, and what this scenario actually is, is
     * a gap that no contribution the solver brackets and no retirement age
     * inside the search bound closes, leaving the spend as the only lever.
     */
    onlySpendLessNotice:
      "Ở mức chi tiêu này, cả hai cách bù giữ nguyên mức chi đều không khả dụng: không có mức dành thêm nào trong khoảng công cụ tìm kiếm, và không có tuổi nghỉ nào trong khoảng tìm kiếm làm kế hoạch đủ. Cách còn lại là hạ mức chi tiêu mong muốn — dòng “chi tiêu ít hơn” trong bảng cho biết số vốn này giữ được mức chi nào đến hết kỳ dự phóng.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc, và toàn kỳ không quá 100 năm. Các số tiền phải từ 0 trở lên và các mức lợi suất, lạm phát trong khoảng −100 đến 100.",
  },

  coverageNotice:
    "Tỷ lệ đáp ứng vốn là một khoảng cách, không phải một mức độ thoải mái: với các giả định mặc định, kế hoạch đạt 89,7% số vốn cần có và vẫn cạn tiền ở tuổi 82 — thiếu 3 trong 25 năm nghỉ hưu. Ba cách bù bên dưới được giải riêng và không cùng đơn vị, nên trang này định lượng chúng chứ không xếp hạng chúng.",

  formula: {
    title: "Cách tính",
    body: [
      "Phép so sánh có hai vế và cả hai đều theo giá hôm nay. Vế “sẽ có” là số vốn mà phần tích lũy đạt được đúng ngày bạn dự định nghỉ. Vế “cần có” là số vốn mà mức chi tiêu mong muốn đòi hỏi: phần chi tiêu vượt trên thu nhập khác, nhân với hệ số niên kim đầu kỳ theo lợi suất thực. Khoảng thiếu là hiệu của hai vế, tính bằng tiền, còn tỷ lệ đáp ứng chỉ là cùng khoảng thiếu đó viết lại thành phần trăm.",
      "Tỷ lệ đáp ứng vốn là một thước đo khoảng cách, không phải một mức độ thoải mái. Với các giả định mặc định, kế hoạch đạt 89,7% số vốn cần có và vẫn cạn tiền ở tuổi 82 — thiếu 3 trong 25 năm nghỉ hưu. Lùi tuổi nghỉ một năm đưa tỷ lệ lên 98,4% mà tiền vẫn cạn, chỉ là ở tuổi 84. Gần đủ vốn không mua được gần đủ số năm, nên công cụ luôn đặt tuổi cạn tiền ngay cạnh tỷ lệ thay vì để bạn tự suy ra.",
      "Thu nhập khác không cần vốn, nên nó được trừ khỏi chi tiêu trước khi nhân hệ số niên kim. Nếu thu nhập khác đã bằng hoặc vượt mức chi tiêu mong muốn thì vốn cần có bằng 0 và tỷ lệ đáp ứng không tồn tại: ô đó để trống chứ không ghi 100%, vì “đã đủ 100%” và “không có gì phải đủ” là hai câu khác nhau.",
      "Ba cách bù được giải riêng, không phải chia khoảng thiếu ra làm ba phần. Mức dành thêm cần thiết là nghiệm của một phép dò trên chính bản dự phóng. Tuổi nghỉ cần thiết là tuổi thấp nhất mà kế hoạch không còn cạn tiền, tìm trong tối đa 7 năm kể từ tuổi bạn nhập. Mức chi giữ được đến hết kỳ là con số niên kim của chính số vốn bạn sẽ có. Ba phép giải, và mỗi phép giải trả lời đầy đủ cho cùng một khoảng thiếu.",
      "Ba cách bù không có cùng đơn vị, nên trang này định lượng chúng mà không xếp hạng chúng. Với các giả định mặc định: dành thêm 10.007.403 ₫ mỗi năm, tức 833.950 ₫ mỗi tháng và tăng 16,7% so với mức đang dành; hoặc nghỉ ở tuổi 62 thay vì 60; hoặc hạ chi tiêu xuống 219.057.403 ₫ mỗi năm, còn 91,3% mức mong muốn. Giá của cách thứ hai là hai năm cuộc đời, và không con số nào trên trang này định giá được nó.",
      "Lùi tuổi nghỉ tác động lên cả hai vế cùng lúc, còn dành thêm chỉ tác động lên một vế. Nghỉ ở 62 thay vì 60 đưa vốn sẽ có từ 4.089.679.933 lên 4.572.421.979 ₫, và đồng thời hạ vốn cần có từ 4.557.557.871 xuống 4.231.721.110 ₫, vì kỳ nghỉ hưu ngắn đi hai năm. Đó là lý do mức dành thêm mà kế hoạch cần khi nghỉ ở 62 chỉ còn 53.586.256 ₫ mỗi năm, thấp hơn mức bạn đang dành hôm nay.",
      "Lợi suất sau khi nghỉ chỉ xuất hiện ở vế “cần có”, không phải vế “sẽ có”: lợi suất càng cao thì cùng một mức chi tiêu cần ít vốn hơn. Nâng nó từ 5% lên 7% hạ vốn cần có từ 4.557.557.871 xuống 3.702.187.770 ₫, đưa tỷ lệ đáp ứng lên 110,5% và biến kế hoạch thành đủ, trong khi vốn sẽ có không nhúc nhích một đồng. Đây là cách duy nhất làm khoảng thiếu biến mất trên màn hình mà không thay đổi gì trong tài khoản của bạn.",
      "Mức chi giữ được đến hết kỳ được giải bằng công thức rồi đưa trở lại phép dự phóng, nên năm cuối có thể thiếu vài phần triệu của một đồng. Đó là sai số làm tròn của số thực, không phải một năm không được chi trả: công cụ chỉ bỏ qua khoản đó ở đúng năm cuối kỳ, chỉ khi nó không đáng kể so với nhu cầu của năm đó, và luôn ghi ra phần dư đã bỏ qua.",
      "Toàn bộ trang dùng một lợi suất đều mỗi năm và không mô phỏng biến động, nên nó không nói được gì về rủi ro thứ tự lợi suất — rủi ro mà chính người vừa nghỉ hưu chịu nặng nhất. Một kế hoạch đủ ở đây vẫn có thể hụt trong thực tế nếu một đợt giảm mạnh xảy ra ngay đầu giai đoạn rút tiền.",
    ],
    /**
     * Editor-selected, and deliberately few.
     *
     * Each phrase occurs in exactly ONE paragraph, because `CalculatorPage`
     * applies the whole list to every paragraph: a phrase appearing in five of
     * them would be emphasised five times, which is the "bold everything"
     * failure the mechanism exists to avoid.
     *
     * Each marks the DISTINCTION its paragraph is about, and on this page that
     * distinction is the remedy set — what closes a gap, and what each remedy
     * costs — rather than the arithmetic. The figures are in the result rows
     * and the table above, so no phrase here is a number.
     */
    emphasis: [
      "Khoảng thiếu là hiệu của hai vế, tính bằng tiền",
      "một thước đo khoảng cách, không phải một mức độ thoải mái",
      "Gần đủ vốn không mua được gần đủ số năm",
      "“không có gì phải đủ” là hai câu khác nhau",
      "Ba cách bù được giải riêng",
      "Ba cách bù không có cùng đơn vị",
      "hai năm cuộc đời",
      "tác động lên cả hai vế cùng lúc",
      "thấp hơn mức bạn đang dành hôm nay",
      "không thay đổi gì trong tài khoản của bạn",
      "sai số làm tròn của số thực, không phải một năm không được chi trả",
      "rủi ro thứ tự lợi suất",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao đạt 89,7% số vốn mà vẫn cạn tiền ba năm trước hạn?",
        a: "Vì tiền của những năm cuối được cấp vốn bởi phần thặng dư của những năm đầu. Khoản rút mỗi năm gần như cố định theo giá thực, còn số dư thì vừa bị rút vừa sinh lãi, nên thiếu vốn ngay đầu kỳ làm phần lãi kém đi suốt cả kỳ. Với lợi suất sau khi nghỉ 5% và lạm phát 4%, lợi suất thực chỉ khoảng 0,96%/năm — gần như không có lãi để bù, nên số năm mà vốn chống đỡ được gần như tỷ lệ thuận với vốn: thiếu 10,3% vốn thì thiếu 12,0% số năm nghỉ hưu. Đó là quan hệ trên kịch bản này, không phải một quy luật, và cũng là lý do công cụ hiển thị tuổi cạn tiền thay vì để bạn suy ra từ tỷ lệ.",
      },
      {
        q: "Cách bù nào rẻ nhất?",
        a: "Trang này không trả lời câu đó, vì ba cách bù không có cùng đơn vị: một cách tính bằng tiền mỗi năm, một cách tính bằng năm làm việc, một cách tính bằng mức sống. Điều trang làm được là nói mỗi cách phải đạt tới con số nào. Điều đáng biết là lùi tuổi nghỉ tác động lên cả hai vế: với các giả định mặc định, nghỉ ở 62 thay vì 60 đưa vốn sẽ có lên 4.572.421.979 ₫ và đồng thời hạ vốn cần có xuống 4.231.721.110 ₫, nên tỷ lệ đáp ứng thành 108,1%. Dành thêm chỉ tác động lên vế thứ nhất. Đòn bẩy mạnh nhất không có nghĩa là rẻ nhất: hai năm đó là hai năm của bạn, và không con số nào ở đây định giá được chúng.",
      },
      {
        q: "Mức dành thêm quy ra mỗi tháng có phải lịch nộp không?",
        a: "Không. Mô hình cộng khoản dành thêm một lần mỗi năm, vào đầu năm, nên con số mỗi tháng chỉ là mức năm chia cho 12 để bạn so với thu nhập của mình. Mười hai khoản nộp cuối tháng sẽ về sau kế hoạch này một chút, chứ không bao giờ vượt lên, vì mười một trong số đó đến muộn hơn một khoản nộp vào tháng Một. Với các giả định mặc định, mức cần thiết là 70.007.403 ₫ mỗi năm, tức 5.833.950 ₫ mỗi tháng theo phép chia đó, và phần tăng thêm so với mức đang dành là 10.007.403 ₫ mỗi năm.",
      },
      {
        q: "Tỷ lệ đáp ứng trên 100% thì có nên hạ mức dành thêm không?",
        a: "Hãy cẩn thận. Phép tính dùng một lợi suất đều mỗi năm: không có năm nào lỗ, không có rủi ro thứ tự lợi suất, không có khoản chi bất thường. Thặng dư mà công cụ hiển thị chính là biên an toàn duy nhất trong mô hình. Cách dùng đúng hơn là giữ mức dành thêm và đọc thặng dư như một vùng đệm, hoặc hạ lợi suất giả định xuống một đến hai điểm phần trăm rồi xem kế hoạch còn đủ hay không — nếu còn, khi đó thặng dư mới là thật.",
      },
      {
        q: "Vì sao nâng lợi suất sau khi nghỉ lại làm khoảng thiếu biến mất?",
        a: "Vì lợi suất sau khi nghỉ chỉ nằm ở vế “cần có”: lợi suất càng cao thì cùng một mức chi tiêu cần ít vốn hơn. Nâng từ 5% lên 7% hạ vốn cần có từ 4.557.557.871 xuống 3.702.187.770 ₫, đưa tỷ lệ đáp ứng lên 110,5% và biến kế hoạch thành đủ — trong khi vốn sẽ có vẫn đúng 4.089.679.933 ₫ như trước. Đây là ô dễ tự lừa mình nhất trên trang, vì nó thay đổi câu trả lời mà không thay đổi gì trong tài khoản của bạn.",
      },
      {
        q: "Công cụ có trừ thuế và phí không?",
        a: "Không. Mọi con số là số gộp: phép tính không trừ thuế và không trừ phí quản lý danh mục. Nếu những khoản bạn đang đầu tư chịu thuế hay phí khi bán hoặc khi nhận lãi, vốn cần có thực tế sẽ cao hơn con số ở đây — cách xử lý đơn giản là nhập mức chi tiêu mong muốn cao hơn tương ứng, hoặc hạ mức lợi suất bạn giả định. Trang phí quỹ đầu tư trong bộ công cụ này định lượng riêng phần phí. Công cụ không mô phỏng quy định thuế hay hưu trí của bất kỳ nước nào.",
      },
      {
        q: "Bốn trang kế hoạch dài hạn khác nhau ở đâu?",
        a: "Chúng dùng chung một bộ giả định và một phép dự phóng, rồi mỗi trang mở đầu bằng một câu hỏi khác: “Kế hoạch chạy ra sao” vẽ kế hoạch từng năm một; “Cần dành bao nhiêu” giải ra khoản phải dành thêm mỗi năm; trang này đo khoảng cách vốn và định lượng ba cách bù; “Tiêu được bao nhiêu” tính mức chi mà số vốn duy trì được, và vẽ thêm một nhánh sống lâu hơn 5 năm so với mốc bạn nhập. Vì cả bốn đọc từ cùng một kết quả, chúng không thể đưa ra những con số trái nhau về số vốn khi nghỉ hay về năm tiền cạn.",
      },
    ],
  },
} as const;
