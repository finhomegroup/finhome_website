// Copy for /cong-cu/thu-nhap-huu-tri/ — the WITHDRAWAL view of the merged
// long-term plan (original plan row 50).
//
// Original FinHome copy. Denominated in đồng, and it models NO country's law:
// `lib/calc/retirement.ts` is arithmetic on a balance, a contribution, two
// returns and an inflation rate. The registry's `usRules: true` flag was
// removed from this row in the foundation slice — the notice it rendered
// ("mô phỏng quy định về thuế và hưu trí của Hoa Kỳ") described a model that
// does not exist here — which left this page showing dollar figures with
// nothing explaining them. This file closes that interim state.
//
// The scenario, the eleven field labels, the four-view control's copy and the
// shared scope live in `content/calculators/long-term-plan.ts`, because three
// sibling routes must agree with them. This file holds only what is this
// page's own: its title, its notice, its result labels, its chart labels, its
// method prose and its FAQ.
//
// THE QUESTION THIS ROUTE OPENS ON is "với số vốn này tôi tiêu được bao
// nhiêu?", and the answer is a CHOICE rather than a single figure — which is
// why the page leads on the sustainable draw and then draws it beside the two
// alternatives `resolveLongTermPlan` resolves: the spend that was asked for,
// and that same spend against a horizon five years longer
// (`LONGEVITY_STRESS_YEARS`).
//
// ── EVERY FIGURE QUOTED BELOW IS THE MODEL'S OUTPUT ────────────────────────
//
// Verified by running `resolveLongTermPlan` on `LONG_TERM_PLAN.defaults`
// (35 tuổi → nghỉ 60 → đến 85; 500.000.000 ₫ đang có; dành thêm
// 60.000.000 ₫/năm tăng 5%/năm; lợi suất 8% trước / 5% sau; lạm phát 4%;
// chi tiêu mong muốn 240.000.000 ₫ và thu nhập khác 36.000.000 ₫, cả hai theo
// giá hôm nay). None of these was scaled from the superseded USD figures:
//
//   Vốn tại ngày nghỉ:      10.902.417.350 ₫ danh nghĩa
//                            4.089.679.933 ₫ theo giá hôm nay — 37,5% của nó
//   Mức chi giữ được:          219.057.403 ₫/năm = 18.254.784 ₫/tháng
//     trong đó từ danh mục:    183.057.403 ₫/năm = 15.254.784 ₫/tháng
//     phần thu nhập khác:       36.000.000 ₫/năm
//   Mức mong muốn:             240.000.000 ₫/năm = 20.000.000 ₫/tháng
//     thiếu:                    20.942.597 ₫/năm — đạt 91,3% mức mong muốn
//   Tỷ lệ rút năm đầu:        4,48% ở mức giữ được; 4,99% ở mức mong muốn
//   Rút danh nghĩa ở mức giữ được: 488.001.075 ₫ ở tuổi 60 →
//     1.250.895.188 ₫ ở tuổi 84 (×2,5633 = 1,04^24), trong khi khoản rút
//     theo giá hôm nay đứng yên ở 183.057.403 ₫ cả 25 năm
//   Tổng rút cả kỳ ở mức giữ được: 20.323.248.005 ₫ danh nghĩa
//   Ba nhánh: mức mong muốn cạn ở tuổi 82 (thiếu 3 năm; năm cạn cần
//     1.288.834.386 ₫, trả được 181.159.463 ₫, thiếu 1.107.674.923 ₫);
//     mức giữ được không cạn, vốn cuối kỳ 0; mức mong muốn với kỳ dài thêm
//     5 năm (đến 90) thiếu 8 năm
//   Dự phóng đến 90 thay vì 85: mức giữ được còn 192.077.672 ₫/năm, trong đó
//     156.077.672 ₫ từ danh mục — thấp hơn 14,7% phần danh mục
//   Lợi suất thực: 0,96%/năm — không phải hiệu 1,00%
//   Niên kim cuối kỳ thay vì đầu kỳ: 221.163.724 ₫/năm, cao hơn 2.106.321 ₫;
//     đưa lại vào dự phóng thì cạn ở tuổi 84, năm cuối thiếu 404.578.947 ₫
//     (cần 1.265.288.416 ₫, trả được 860.709.469 ₫)
//   4% của vốn thực: 163.587.197 ₫/năm = 13.632.266 ₫/tháng — phần rút từ
//     danh mục ở đây cao hơn 11,9%
//   Lợi suất sau khi nghỉ đúng bằng lạm phát: 199.587.197 ₫/năm, tức
//     163.587.197 ₫ (vốn thực ÷ 25) + 36.000.000 ₫
//   Cộng thêm 1.000.000 ₫/năm vào mức giữ được: cạn ở tuổi 84
//
// `content/calculators/retirement-income.test.ts` re-derives every one of
// these from the shipped default STRINGS with the same parsers the component
// uses and pins them against the sentences below, so a moved default is a red
// test naming the sentences that have to move with it.
//
// ── ALL-CAPS WAS REPLACED BY DECLARED EMPHASIS ─────────────────────────────
//
// The previous copy shouted mid-sentence: "GIÁ HÔM NAY", "KHÔNG", "ĐẦU KỲ",
// "THỰC", "CHÊNH", "DANH NGHĨA", "THỨ TỰ". Capitals were doing the work
// typography should. They are now sentence case, and `formula.emphasis`
// declares the few phrases that carry the distinction each paragraph is about
// — through `lib/prose-emphasis.ts`, so the paragraph stays one plain string
// and joining the rendered spans reproduces it exactly. Its own test checks
// every declared phrase occurs, that each occurs in exactly ONE paragraph, and
// that the emphasised share stays under the 0,2 ratchet.
//
// BOOKKEEPING LEFT FOR THE INTEGRATOR: this row is still filed `reference` in
// `content/calculators/plan-disposition.ts` and still listed in
// `READING_WORK_PENDING`. That file is not this unit's to edit; the phrases
// below are the artefact it would need.

import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";

export const RETIREMENT_INCOME = {
  slug: "/cong-cu/thu-nhap-huu-tri",

  pageTitle: "Vốn hưu trí tiêu được bao nhiêu mỗi năm",
  metaTitle: "Vốn hưu trí tiêu được bao nhiêu — Mức chi giữ được đến hết kỳ",
  metaDescription:
    "Từ số vốn kế hoạch dài hạn của bạn tích lũy được, công cụ tính mức chi mỗi năm giữ được đến hết kỳ dự phóng — bằng đồng, theo giá hôm nay — rồi đặt nó cạnh mức bạn mong muốn. Công cụ miễn phí của FinHome.",

  lede:
    "Câu hỏi ngược của một kế hoạch dài hạn: với số vốn bạn sẽ có, mỗi năm tiêu được bao nhiêu? Con số chính được tính theo giá hôm nay, vì đó là đơn vị duy nhất bạn so được với chi phí sinh hoạt hiện tại. Và nó là một lựa chọn chứ không phải một con số duy nhất, nên trang này vẽ nó cạnh hai nhánh khác: mức bạn mong muốn, và cùng mức đó nếu bạn sống lâu hơn dự tính.",

  form: {
    resultTitle: "Mức chi giữ được đến hết kỳ",
    annualLabel: "Chi được mỗi năm, theo giá hôm nay",
    monthlyLabel: "Cùng mức đó tính theo tháng",
    portfolioAnnualLabel: "Trong đó lấy từ danh mục, mỗi năm",
    shortfallLabel: "Thiếu so với mức mong muốn, mỗi năm",

    detailTitle: "Mức chi đó gồm những gì",
    otherIncomeLabel: "Thu nhập khác đã cộng vào, mỗi năm",
    desiredLabel: "Mức chi mong muốn của kế hoạch, mỗi năm",
    shareLabel: "Đạt được bao nhiêu phần mức mong muốn",
    /**
     * The benchmark is a SHARED assumption this page does not ask for.
     *
     * `RetirementFields`' `omit` hides the desired-spend box because this page
     * answers that question — but `readRetirement` still reads the value, so
     * the shared scenario's 240.000.000 ₫ is what the two alternative paths
     * and the shortfall row are measured against. A figure that drives the
     * answer and is not visible anywhere would be the "invisible input" mirror
     * of the defect `omit` exists to prevent, so the page states it and says
     * where it comes from.
     */
    desiredNote:
      "Mức chi mong muốn ở trên là giả định dùng chung của kế hoạch dài hạn, không phải một ô trên trang này: trang này giải ra mức chi giữ được, nên nó hỏi mọi thứ khác và không hỏi con số đó. Ba trang còn lại của kế hoạch đều có ô đó, và cả bốn trang dùng chung một bộ giả định.",

    pathsTitle: "Ba nhánh của cùng một số vốn",
    /**
     * The verdict is the DATE; the years unfunded is in the row's own label.
     *
     * Each row's label already names the path's horizon and what it leaves
     * unfunded, because that is what a depletion marker needs and there is one
     * set of path names for the whole page. Repeating "thiếu 3 năm" in the
     * value would say the same thing twice in one row.
     */
    pathLasts: "Vốn không cạn trong kỳ dự phóng.",
    /** `{age}` substituted. */
    pathRunsOut: "Vốn cạn ở tuổi {age}.",

    capitalTitle: "Số vốn và tỷ lệ rút",
    realBalanceLabel: "Vốn tại ngày nghỉ, theo giá hôm nay",
    nominalBalanceLabel: "Vốn tại ngày nghỉ, danh nghĩa",
    initialRateLabel: "Tỷ lệ rút năm đầu của mức giữ được",
    firstDrawLabel: "Rút năm đầu ở mức giữ được, danh nghĩa",
    totalWithdrawnLabel: "Tổng rút cả kỳ ở mức giữ được, danh nghĩa",

    shortNotice:
      "Mức chi giữ được thấp hơn mức mong muốn của kế hoạch, nên ở mức mong muốn vốn sẽ cạn trước khi hết kỳ dự phóng. Đó là khoảng cách trang “Thiếu bao nhiêu” định giá bằng ba cách bù: dành thêm mỗi năm, nghỉ muộn hơn, hoặc hạ mức chi xuống đúng con số hiển thị ở trên.",
    fundedNotice:
      "Mức mong muốn của kế hoạch nằm trong mức vốn này giữ được, nên kế hoạch đi hết kỳ dự phóng ngay ở mức chi bạn đặt ra. Khoảng cách giữa hai con số là phần dư bạn có thể dùng để chi nhiều hơn, nghỉ sớm hơn, hoặc kéo kỳ dự phóng dài thêm.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden — same judgement route 44 makes. `fundedAtBoundary` returns the
     * residue precisely so a page can say it; a verdict that silently forgives
     * a shortfall is a verdict the reader cannot check.
     */
    boundaryNotice:
      "Năm cuối kỳ còn thiếu một phần cực nhỏ của một đồng ({residue} ₫). Đó là sai số làm tròn của số thực, không phải một năm không được chi trả, nên nhánh đó vẫn được tính là giữ được đến hết — và phần dư được ghi ra đây thay vì bỏ qua trong im lặng.",
    noBalanceNotice:
      "Không còn vốn nào tại ngày nghỉ, nên toàn bộ mức chi ở trên là phần thu nhập khác bạn đã nhập. Đó là con số đúng, không phải 0: lương hưu hay tiền cho thuê vẫn được trả khi danh mục đã hết.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc, và toàn kỳ không quá 100 năm. Các số tiền phải từ 0 trở lên và các mức lợi suất, lạm phát trong khoảng −100 đến 100.",
  },

  /**
   * Row 50's figure: the same capital, spent three ways.
   *
   * `longTermWithdrawalModel` in `lib/calc/charts/long-term-chart.ts` was
   * built and tested with the model slice and rendered NOWHERE until this
   * unit. Every path is drawn in today's money — a nominal axis would make the
   * longest-lived path look richest simply for ending later — and period 0 is
   * the retirement DATE carrying the capital that arrives there, not the end
   * of the first retirement year.
   *
   * The exact reading is this figure's own table: one row per path, with the
   * age that path runs out and what is left at its own horizon. Three columns,
   * so no `mobileCards` — and it replaces the five-column every-five-years
   * drawdown table this page used to render below its results, which is the
   * same measurement route 44 acted on (762 px inside a 300 px scroll frame at
   * 390 px).
   */
  chart: {
    // The currency words come from the shared module, not a fourth copy of
    // them: `lib/` holds no user-facing Vietnamese, so every chart adapter
    // takes them as arguments, and two pages of one plan must not disagree
    // about what a billion is called.
    ...LONG_TERM_PLAN.money,
    title: "Ba nhánh của cùng một số vốn",
    series: "{label}",
    xAxis: "Năm kể từ ngày nghỉ",
    yAxis: "Vốn còn lại ({unit})",
    assumptions: [
      "Trục ngang tính từ ngày nghỉ, không phải từ hôm nay: năm thứ 0 là số vốn vừa đến ngày nghỉ, trước khi rút đồng nào.",
      "Cả ba nhánh dùng chung giai đoạn tích lũy, nên chúng bắt đầu từ đúng một số vốn; chỉ mức chi và độ dài kỳ là khác.",
      "Mọi đường vẽ theo giá hôm nay. Vẽ theo số danh nghĩa sẽ làm nhánh kéo dài hơn trông giàu hơn chỉ vì nó kết thúc muộn hơn.",
      "Phép tính không trừ thuế và không trừ phí quản lý danh mục, và coi lợi suất là đều đặn mỗi năm.",
    ],
    tableCaption: "Ba nhánh và điểm kết của mỗi nhánh",
    /**
     * The hint carries what the headings cannot.
     *
     * A browser review measured the third heading at 390 px: this figure has
     * three columns, so it correctly gets no `mobileCards` fallback and renders
     * as a real table, where the auto-layout left that heading about 60 px. At
     * 32 characters ("Vốn còn lại cuối kỳ, giá hôm nay") it wrapped to six
     * lines, and because table cells stretch to the tallest that made the whole
     * `<thead>` 129 px for a three-row table.
     *
     * So the deflator and the per-path horizon moved here — full-width prose
     * above the table, where 390 px is not a constraint — and the heading is
     * now "Vốn còn lại". The same move rows 45 and 48 made for their card
     * labels. Its own test holds the character bound AND that this hint still
     * names the column and still states both qualifications, because a shorter
     * heading that silently dropped "theo giá hôm nay" would be a worse defect
     * than a tall one.
     */
    tableHint:
      "Mỗi dòng là một nhánh, và mỗi nhánh có kỳ dự phóng riêng. Cột “Vốn còn lại” là phần vốn ở cuối kỳ của chính nhánh đó, theo giá hôm nay; nhánh đi hết kỳ thì cột “Cạn ở tuổi” ghi “không cạn” thay vì ghi một tuổi.",
    periodColumn: "Năm thứ",
    unavailableReason:
      "Chưa vẽ được: kế hoạch cần các mốc tuổi hợp lệ và ít nhất một năm sau khi nghỉ.",
    unavailableRecovery:
      "Hãy kiểm tra lại ba mốc tuổi — tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc — và các ô số tiền.",
    /**
     * A path's name states its own horizon AND what it leaves unfunded.
     *
     * NOT decoration, and not a name carrying a result for the sake of it —
     * this is the only per-path channel into a depletion marker.
     * `longTermWithdrawalModel` builds the markers and fills `{path}` from
     * these labels, so anything not in here cannot reach a marker line.
     *
     * A browser review found why that matters. Both unfunded paths spend the
     * same amount from the same capital, so they run out at the SAME age —
     * living longer does not make the money run out sooner. With plain
     * scenario names the figure printed two marker lines whose facts were
     * identical ("cạn ở tuổi 82 — năm thứ 22", twice) and never showed the one
     * thing that separates them: three years unfunded against a horizon of
     * 85, eight against 90. Now the depletion age is shared context and the
     * years unfunded is the point, so the two lines differ by construction.
     *
     * `{endAge}` is read from the path's own `endAge`, not derived from
     * `LONGEVITY_STRESS_YEARS` in the page — the engine already decided that
     * horizon and a second copy of the rule would be a second place to get it
     * wrong. `{outcome}` is one of the two strings below, chosen by the path's
     * own funded verdict.
     */
    asEnteredPath: "Mức mong muốn, kỳ đến tuổi {endAge} — {outcome}",
    sustainablePath: "Mức giữ được, kỳ đến tuổi {endAge} — {outcome}",
    longerLifePath: "Mức mong muốn nếu sống đến tuổi {endAge} — {outcome}",
    /** `{short}` substituted: the years that path leaves unfunded. */
    outcomeShort: "thiếu {short} năm",
    outcomeFunded: "đủ cả kỳ",
    depletionMarker: "{path}: vốn cạn ở tuổi {age}, năm thứ {year}",
    summary:
      "Kế hoạch mong muốn chi {spending} mỗi năm; số vốn này giữ được {sustainable} mỗi năm cho đến hết kỳ dự phóng.",
    lastsNote: "Mức mong muốn nằm trong mức giữ được, nên nhánh đó đi hết kỳ.",
    runsOutNote: "Ở mức mong muốn, vốn cạn ở tuổi {age}.",
    sameCapitalNote:
      "Ba nhánh là ba lựa chọn trên cùng một số vốn và cùng một bộ giả định, không phải ba dự báo về tương lai.",
    ageColumn: "Nhánh",
    yearColumn: "Cạn ở tuổi",
    // 11 characters. See `tableHint` above for the measurement, and
    // `MAX_COLUMN_HEADING_CHARS` in this route's test for the bound.
    realColumn: "Vốn còn lại",
    lastsCell: "Không cạn",
  },

  /**
   * Split, because `CalculatorPage`'s `notice` docstring says to: a long
   * notice pushed the form off the first screens on a phone, and 390 px is
   * the width this route's figure was designed against. The sentence that
   * must stay visible is the one a reader would otherwise misread the
   * headline by; the arithmetic behind it goes in the disclosure.
   */
  notice:
    "Mức chi này không phải một tỷ lệ rút an toàn vĩnh viễn: nó được tính sao cho vốn vừa hết đúng ở tuổi bạn nhập vào ô “dự phóng đến tuổi”, mặc định là 85.",
  noticeDetailTitle: "Sống lâu hơn mốc đó thì con số đổi bao nhiêu?",
  noticeDetail:
    "Nếu bạn dự phóng đến 90, cùng số vốn đó chỉ nuôi được 156.077.672 ₫/năm lấy từ danh mục thay vì 183.057.403 ₫, tức thấp hơn 14,7%. Kỳ vọng sống là một số trung vị và một nửa số người sống lâu hơn nó, nên hãy nhập tuổi cao hơn mốc bạn nghĩ là vừa đủ rồi đọc kết quả, thay vì đọc kết quả ở mốc vừa đủ rồi tự trừ đi một biên an toàn.",

  formula: {
    title: "Cách tính",
    body: [
      "Số vốn tại ngày nghỉ được lấy từ đúng phép dự phóng mà cả bốn trang của kế hoạch dài hạn dùng chung, rồi quy về giá hôm nay. Mức chi giữ được đến hết kỳ là mức chi đều theo giá hôm nay làm cạn đúng số vốn đó ở tuổi kết thúc — cộng thêm phần thu nhập khác, thứ không phụ thuộc vào số vốn.",
      "Phép giải chạy trên lợi suất thực, tức (1 + lợi suất sau khi nghỉ) / (1 + lạm phát) − 1. Với 5% và 4%, lợi suất thực là 0,96%/năm chứ không phải 1%: hiệu của hai tỷ lệ chỉ là một phép gần đúng, và trên một kỳ hai mươi lăm năm nó đủ sai để lệch câu trả lời.",
      "Hệ số dùng ở đây là một niên kim đầu kỳ, vì phép dự phóng lấy tiền ra vào đầu năm rồi mới tính lợi nhuận trên phần còn lại. Dùng công thức niên kim cuối kỳ sẽ phóng đại mức chi an toàn theo đúng tỷ lệ (1 + lợi suất thực): trên các giả định mặc định là 221.163.724 ₫/năm thay cho 219.057.403 ₫/năm, cao hơn 2.106.321 ₫. Đưa con số cao hơn đó trở lại phép dự phóng thì vốn cạn ở tuổi 84 và năm cuối còn 404.578.947 ₫ không được chi trả — một mức chi được báo là giữ được đến hết kỳ nhưng không giữ được.",
      "Khoản rút được báo theo hai cách đếm cùng một khoản tiền. Ở mức chi giữ được, khoản rút danh nghĩa là 488.001.075 ₫ ở tuổi 60 và 1.250.895.188 ₫ ở tuổi 84, trong khi khoản rút theo giá hôm nay đứng yên ở 183.057.403 ₫ suốt cả kỳ. Đó không phải hai khoản tiền khác nhau, và chỉ con số thứ hai nói cho bạn biết mình mua được gì.",
      "Phần thu nhập khác được cộng vào sau cùng và không nhân với hệ số niên kim nào, vì nó không lấy ra từ danh mục: lương hưu hay tiền cho thuê vẫn được trả bất kể danh mục còn hay đã hết. Đó cũng là lý do khi vốn bằng 0 thì kết quả bằng đúng phần thu nhập khác, chứ không bằng 0.",
      "Con số theo tháng là mức chi cả năm chia cho 12, một cách nói lại cùng con số cho dễ so với chi phí sinh hoạt hôm nay — không phải một lệnh rút mỗi tháng. Mô hình lấy toàn bộ khoản chi của một năm vào đầu năm đó, nên rút dần trong năm sẽ để lại nhiều vốn hơn một chút chứ không ít hơn.",
      "Ba nhánh trên hình là ba lựa chọn trên cùng một số vốn, không phải ba dự báo. Ở mức mong muốn 240.000.000 ₫/năm, vốn cạn ở tuổi 82 — thiếu ba năm so với kỳ đến tuổi 85. Ở mức giữ được, mỗi năm chi ít hơn 20.942.597 ₫ và kế hoạch đi hết kỳ. Nhánh thứ ba giữ nguyên mức mong muốn nhưng kéo kỳ dự phóng thêm năm năm, và vốn vẫn cạn ở đúng tuổi 82: sống lâu hơn không làm tiền hết sớm hơn, nó chỉ làm số năm không được cấp vốn tăng từ ba lên tám. Vì thế hai mốc trên hình trùng tuổi nhau mà vẫn nói hai điều khác nhau, và mỗi mốc ghi rõ số năm nhánh đó để trống.",
      "Một phép kiểm chứng: đưa chính mức chi giữ được trở lại phép dự phóng thì kế hoạch không cạn tiền và vốn cuối kỳ bằng 0; cộng thêm 1.000.000 ₫/năm thì nó cạn ở tuổi 84. Phép quay vòng đó cũng là lý do năm cuối kỳ đôi khi còn thiếu vài phần triệu của một đồng: một con số giải bằng công thức rồi đưa lại vào vòng lặp không rơi đúng lên gốc. Đó là sai số làm tròn của số thực, không phải một năm bị mất, nên công cụ chỉ bỏ qua phần thiếu ấy ở đúng năm cuối kỳ, chỉ khi nó không đáng kể so với nhu cầu của năm đó, và luôn ghi ra phần dư đã bỏ qua.",
    ],
    /**
     * Editor-selected, and deliberately few.
     *
     * Each phrase occurs in exactly ONE paragraph, because `CalculatorPage`
     * applies the whole list to every paragraph: a phrase appearing in five of
     * them would be emphasised five times, which is the "bold everything"
     * failure the mechanism exists to avoid. Each marks the DISTINCTION its
     * paragraph is about.
     *
     * "niên kim đầu kỳ" is the one this page exists to teach, and route 44
     * emphasises the same phrase for the same reason: the end-of-period factor
     * overstates the safe draw by (1 + lợi suất thực), which is enough to make
     * a plan report a draw it cannot actually pay to the horizon.
     */
    emphasis: [
      "cạn đúng số vốn đó ở tuổi kết thúc",
      "0,96%/năm chứ không phải 1%",
      "niên kim đầu kỳ",
      "được báo là giữ được đến hết kỳ nhưng không giữ được",
      "chỉ con số thứ hai nói cho bạn biết mình mua được gì",
      "bằng đúng phần thu nhập khác, chứ không bằng 0",
      "không phải một lệnh rút mỗi tháng",
      "ba lựa chọn trên cùng một số vốn, không phải ba dự báo",
      "sống lâu hơn không làm tiền hết sớm hơn",
      "sai số làm tròn của số thực, không phải một năm bị mất",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Có một tỷ lệ rút an toàn cố định không?",
        a: "Công cụ này không so kết quả với bất kỳ ngưỡng nào — làm vậy sẽ là một khẳng định về thị trường mà trang này không có cơ sở để đưa ra. Để bạn tự đối chiếu: 4% của số vốn thực tại ngày nghỉ là 163.587.197 ₫/năm, còn phần rút từ danh mục ở đây là 183.057.403 ₫/năm, cao hơn 11,9%. Khoảng cách đó không phải một phát hiện; nó là hệ quả trực tiếp của việc công cụ cố ý tiêu hết vốn đúng ở tuổi bạn nhập, trên một lợi suất đều không có biến động. Một quy tắc ngón tay cố định thì nhắm vào việc không hết tiền, nên nó luôn để lại một phần vốn — và phần vốn đó chính là biên an toàn bạn đánh đổi khi đọc con số cao hơn.",
      },
      {
        q: "Vì sao lợi suất sau khi nghỉ lại quyết định nhiều thế?",
        a: "Vì nó chỉ có tác dụng qua phần chênh với lạm phát. Lợi suất trước khi nghỉ quyết định bạn có bao nhiêu vốn; lợi suất sau khi nghỉ quyết định số vốn đó chia được thành bao nhiêu. Nếu bạn đặt lợi suất sau khi nghỉ đúng bằng lạm phát, lợi suất thực bằng 0 và mức chi giữ được rút về đúng “vốn chia cho số năm” cộng thu nhập khác — 199.587.197 ₫/năm trên các giả định mặc định. Đây cũng là lý do đừng nâng lợi suất sau khi nghỉ lên để có một con số dễ chịu: mỗi điểm phần trăm bạn thêm vào là một điểm phần trăm rủi ro bạn phải thực sự gánh trong đúng những năm mình không còn thu nhập.",
      },
      {
        q: "Rủi ro thứ tự các năm được và mất có được tính không?",
        a: "Không, và đây là hạn chế lớn nhất của công cụ. Nó dùng một lợi suất đều mỗi năm. Người đang rút tiền chịu thêm rủi ro về thứ tự: một đợt giảm mạnh trong hai năm đầu giai đoạn rút gây thiệt hại lớn hơn nhiều so với đúng đợt giảm đó ở năm thứ hai mươi, vì tài sản bị bán ra đúng lúc giá thấp và phần bị bán ấy không còn ở đó để hồi phục. Với cùng một lợi suất bình quân, hai thứ tự khác nhau cho hai kết cục khác nhau. Hãy đọc con số này như mức chi trong một kịch bản thuận lợi.",
      },
      {
        q: "Sống lâu hơn dự tính thì con số đổi bao nhiêu?",
        a: "Hai cách đọc, và trang này vẽ cả hai. Nếu bạn giữ nguyên mức chi mong muốn mà sống thêm năm năm, kế hoạch không thiếu ba năm nữa mà thiếu tám năm — vẫn cạn ở tuổi 82, chỉ là kỳ cần được bảo đảm dài hơn. Nếu bạn muốn một mức chi giữ được đến tuổi 90, mức đó là 192.077.672 ₫/năm, trong đó 156.077.672 ₫ từ danh mục, tức thấp hơn 14,7% so với mức tính đến 85. Cách dùng đúng là nhập luôn tuổi cao hơn vào ô “dự phóng đến tuổi” rồi đọc kết quả ở đó.",
      },
      {
        q: "Thu nhập khác có tự tăng theo lạm phát không?",
        a: "Trong công cụ này thì có: bạn nhập theo giá hôm nay và nó được quy đổi sang từng năm tương lai đúng bằng lạm phát. Điều đó hợp với một khoản được điều chỉnh theo giá sinh hoạt. Nhưng nó không hợp với một khoản trả cố định bằng số danh nghĩa — sau 25 năm lạm phát 4%, cùng số tiền đó chỉ còn mua được khoảng 37,5% lượng hàng hóa ban đầu. Nếu thu nhập khác của bạn thuộc loại không điều chỉnh, hãy nhập một con số thấp hơn đáng kể mức được hứa trả, hoặc dùng trang phân tích thu nhập hưu trí để tách riêng từng nguồn với tốc độ tăng của chính nó.",
      },
      {
        q: "Con số này đã trừ thuế và phí chưa?",
        a: "Chưa. Phép tính không trừ thuế và không trừ phí quản lý danh mục, nên mức chi ở đây là số gộp, và công cụ không mô phỏng quy định thuế của bất kỳ nước nào. Nếu những khoản bạn đang đầu tư có chịu thuế hay phí khi bán hoặc khi nhận lãi, mức chi thực tế của bạn sẽ thấp hơn con số hiển thị. Cách xử lý đơn giản là hạ mức lợi suất sau khi nghỉ mà bạn giả định, hoặc coi con số ở trên là mức trước thuế và tự trừ đi phần bạn biết mình phải nộp.",
      },
      {
        q: "Bốn trang kế hoạch dài hạn khác nhau ở đâu?",
        a: "Chúng dùng chung một bộ giả định và một phép dự phóng, rồi mỗi trang mở đầu bằng một câu hỏi khác: “Kế hoạch chạy ra sao” vẽ kế hoạch từng năm một; “Cần dành bao nhiêu” giải ra khoản phải dành thêm mỗi năm; “Thiếu bao nhiêu” đo khoảng cách vốn và định giá ba cách bù; còn trang này tính mức chi mà số vốn duy trì được và đặt nó cạnh mức bạn mong muốn. Vì cả bốn đọc từ cùng một kết quả, chúng không thể đưa ra những con số trái nhau về số vốn khi nghỉ hay về năm tiền cạn.",
      },
    ],
  },
} as const;
