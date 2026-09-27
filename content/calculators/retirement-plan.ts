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
// The scenario, the eleven field labels, the four-view control's copy and the
// shared scope live in `content/calculators/long-term-plan.ts`, because three
// sibling routes must agree with them. This file holds only what is this
// page's own: its title, its notice, its result copy, its chart labels, its
// method prose and its FAQ.
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
// Verified by running `resolveLongTermPlan` on `LONG_TERM_PLAN.defaults`
// (35 tuổi → nghỉ 60 → đến 85; 500.000.000 ₫ đang có; dành thêm
// 60.000.000 ₫/năm tăng 5%/năm; lợi suất 8% trước / 5% sau; lạm phát 4%;
// chi tiêu mong muốn 240.000.000 ₫ và thu nhập khác 36.000.000 ₫, cả hai theo
// giá hôm nay):
//
//   Năm để dành đầu tiên:   500 + 60 = 560 triệu, sinh lời 8% = 44,8 triệu,
//                           cuối năm 604.800.000 ₫; năm sau để dành 63.000.000 ₫
//   Số dư khi nghỉ:        10.902.417.350 ₫ danh nghĩa (khoảng 10,9 tỷ)
//                           4.089.679.933 ₫ theo giá hôm nay (khoảng 4,1 tỷ) — 37,5% của nó
//   Vốn cần có:             4.557.557.871 ₫ theo giá hôm nay
//   Còn thiếu:                467.877.938 ₫; đạt 89,7% mức cần
//   Năm rút đầu tiên:         543.830.612 ₫ danh nghĩa (khoảng 543,8 triệu)
//                           cho 204.000.000 ₫ giá hôm nay
//                           (204 triệu = 240 triệu mong muốn − 36 triệu thu nhập khác)
//   Tỷ lệ rút năm đầu:      4,99%
//   Chi giữ được đến hết:     219.057.403 ₫/năm — thiếu 20.942.597 ₫ so với mong muốn
//   Cạn ở tuổi 82, thiếu 3 năm; năm cạn cần 1.288.834.386 ₫ và chỉ trả được
//     181.159.463 ₫, thiếu 1.107.674.923 ₫
//   Tổng đã dành:           2.863.625.929 ₫; tổng tăng trưởng 15.442.627.890 ₫
//   Ba cách bù: dành 70.007.403 ₫/năm (thêm 10.007.403 ₫), nghỉ ở 62 (muộn
//     2 năm), hoặc chi 219.057.403 ₫/năm (91,3% mức mong muốn)
//
// `content/calculators/long-term-plan.test.ts` re-derives every one of these
// from the shipped default STRINGS with the same parsers the component uses
// and pins them against the sentences below — the exact figures in the FAQ,
// the rounded ones in the method prose — so a moved default is a red test
// naming the sentences that have to move with it.
//
// The nominal number is 2,67x the real one because prices rise 1,04^25 = 2,6658
// over the 25-year accumulation. Cross-checked against a closed form:
// 500e6 x 1,08^25 + 60e6 x 1,08^25 x sum((1,05/1,08)^k, k=0..24) =
// 10.902.417.349,60, which agrees with the engine to 0,4 ₫ in 1,09e10.
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

export const RETIREMENT_PLAN = {
  slug: "/cong-cu/ke-hoach-huu-tri",

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
    "Bạn cho biết mình đang có bao nhiêu tiền, dự định để dành thêm bao nhiêu và muốn chi tiêu thế nào khi nghỉ hưu. FinHome sẽ ước tính số tiền đó có thể đáp ứng nhu cầu của bạn đến tuổi nào. Nếu chưa đủ đến tuổi bạn chọn, bạn có thể thử để dành thêm, nghỉ hưu muộn hơn hoặc điều chỉnh chi tiêu để xem kế hoạch thay đổi ra sao.",
  ledeDetailTitle: "Công cụ này cho bạn những gì",
  ledeDetail:
    "Một kết luận đủ hay không đủ đến tuổi bạn chọn; nếu không đủ, tuổi tiền bắt đầu thiếu và mức chi mỗi năm cao hơn khả năng của kế hoạch bao nhiêu; số tiền qua từng tuổi trên biểu đồ và bảng, đếm theo giá của từng năm và theo giá hôm nay. Mọi con số đều tính từ những gì bạn nhập, chưa trừ thuế và phí, và là ước tính để so sánh các lựa chọn, không phải dự báo.",

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
    "Các con số chính trên trang này tính theo giá hôm nay, để bạn so được với mức chi hiện tại của mình. Khi giá cả tăng, con số “theo giá của năm đó” trông lớn hơn nhưng mua được ít hơn; công cụ tính cả hai cách đếm và giải thích ngay dưới kết quả.",

  form: {
    resultTitle: "Kết quả theo các con số bạn nhập",
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
    shortfallLabel: "Chi tiêu còn thiếu mỗi năm, theo giá hôm nay",

    /**
     * The conclusion in context. Filled by the component with the ages the
     * reader typed and the ages the engine found; nothing here quotes the
     * default scenario.
     */
    depletedHeadline:
      "Theo các con số bạn nhập, tiền dành cho hưu trí có thể không đáp ứng đủ nhu cầu chi tiêu từ tuổi {depletionAge}.",
    depletedBody:
      "Bạn muốn kế hoạch kéo dài đến tuổi {endAge}. Với cách để dành và mức chi hiện tại, tiền bắt đầu không đủ trong năm bạn {depletionAge} tuổi, sớm hơn mục tiêu {yearsShort} năm.",
    /**
     * Appended when the depletion year still paid something. Both figures are
     * the PORTFOLIO's — the draw needed from the savings after other income,
     * and what the savings could pay — not the household's total spending.
     */
    depletedPartial:
      "Trong năm đó khoản dành dụm vẫn trả được một phần: phần cần rút từ khoản dành dụm, sau khi đã trừ thu nhập khác, là khoảng {planned}; khoản dành dụm trả được khoảng {paid}.",
    /**
     * Appended instead when the savings could pay nothing that year. Other
     * income, if any, is untouched by this — the sentence says so.
     */
    depletedNothingLeft:
      "Đến năm đó khoản dành dụm đã hết, nên phần chi tiêu cần rút từ nó không còn nguồn; thu nhập khác sau khi nghỉ, nếu có, vẫn còn.",
    depletedTry:
      "Bạn có thể thử tăng khoản để dành mỗi năm, dời tuổi nghỉ hưu muộn hơn hoặc giảm mức chi mong muốn. Kết quả tự cập nhật theo những con số bạn điều chỉnh.",
    /**
     * "đến tuổi {endAge}", not "đến hết tuổi": the engine runs the years from
     * `currentAge` up to `endAge − 1`, so a horizon of 85 covers spending
     * until the reader turns 85 — the age-85 year itself is outside the plan.
     * `{lastAge}` is `endAge − 1`, filled by the component, so the body can
     * say which year is the last one counted.
     */
    fundedHeadline:
      "Theo các con số bạn nhập, tiền dành cho hưu trí đủ đáp ứng mức chi mong muốn từ tuổi {retirementAge} đến tuổi {endAge}.",
    fundedBody:
      "Số tiền khi nghỉ hưu có thể duy trì mức chi khoảng {sustainable} mỗi năm theo giá hôm nay đến tuổi {endAge}, tức năm cuối được tính là năm bạn {lastAge} tuổi; bạn đang muốn chi {desired}.",
    fundedTry:
      "Hãy thử tăng tuổi kết thúc thêm 5 hoặc 10 năm, hoặc hạ mức sinh lời giả định, để xem kế hoạch còn đủ không. Nếu vẫn đủ, kế hoạch của bạn có sức chịu đựng tốt hơn.",
    /** When other income covers the whole spend, so the savings are never drawn. */
    otherIncomeNote:
      "Ở mức chi này, thu nhập khác sau khi nghỉ đã đủ trang trải, nên khoản dành dụm không bị rút đến.",

    /**
     * What the promoted shortfall figure means — and does not mean. Filled
     * with the rounded figure; the exact one is the row directly above.
     */
    shortfallMeaning:
      "Mức chi bạn mong muốn cao hơn mức kế hoạch hiện tại hỗ trợ được khoảng {shortfall} mỗi năm, tính theo giá hôm nay. Đây không phải số tiền cần để dành thêm mỗi năm từ bây giờ, và không phải tổng số vốn còn thiếu. Nếu muốn biết cần để dành thêm bao nhiêu, hãy dùng trang “Cần dành bao nhiêu” bên dưới.",
    shortfallNone:
      "Mức chi bạn mong muốn nằm trong mức kế hoạch hỗ trợ được, nên chi tiêu không còn thiếu so với khả năng của kế hoạch.",

    /**
     * The two conditions that can change the conclusion, kept beside it.
     * `assumptionsUsed` is filled with the reader's own rates.
     */
    estimateNote:
      "Đây là ước tính theo mức sinh lời và lạm phát bạn đã nhập, không phải dự báo chắc chắn. “Tiền bắt đầu thiếu” nói về phần tiền dành cho hưu trí trong mô hình này, không có nghĩa toàn bộ tài sản của bạn bằng không.",
    assumptionsUsed:
      "Giả định đang dùng: sinh lời {before}%/năm trước khi nghỉ và {after}%/năm sau khi nghỉ, lạm phát {inflation}%/năm, khoản để dành tăng {growth}%/năm. Chưa trừ thuế và phí; mức sinh lời được coi là đều đặn mỗi năm.",

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
      "Với lạm phát {inflation}%/năm bạn nhập, cùng một khoản tiền sẽ mua được ít đồ hơn theo thời gian. Đến tuổi {retirementAge} kế hoạch có khoảng {capital} — gọi là số danh nghĩa, tức đồng của năm đó — nhưng chỉ mua được lượng hàng mà khoảng {realCapital} mua được hôm nay.",
    purchasingPowerDraw:
      "Năm đầu nghỉ hưu, kế hoạch rút khoảng {nominalDraw} để chi tiêu tương đương khoảng {realDraw} theo giá hôm nay.",
    purchasingPowerClose:
      "Vì vậy các con số chính trên trang này đều tính theo giá hôm nay, để bạn so được với mức chi hiện tại của mình; con số danh nghĩa nằm trong phần chi tiết và trên biểu đồ.",
    purchasingPowerFlat:
      "Bạn nhập lạm phát {inflation}%/năm, nên số theo giá hôm nay không nhỏ hơn số danh nghĩa: đến tuổi {retirementAge} kế hoạch có khoảng {capital}, tương đương khoảng {realCapital} theo giá hôm nay. Hãy thử nhập lạm phát dương, ví dụ 4%, để thấy giá cả tăng làm sức mua giảm thế nào.",
    purchasingPowerToday:
      "Bạn nghỉ hưu ngay từ tuổi hiện tại, nên số tiền khi nghỉ và số theo giá hôm nay là một: khoảng {capital}. Từ đây, mỗi khoản rút được tính tăng theo lạm phát {inflation}%/năm để giữ cùng sức mua, và hai đường trên biểu đồ tách nhau dần vì cùng một số tiền còn lại sẽ mua được ít hơn theo thời gian.",

    verdictDetailTitle: "Kết luận này được tính thế nào",
    verdictDetail:
      "Công cụ chạy kế hoạch từng năm: trước tuổi nghỉ, cộng khoản để dành rồi tính sinh lời; sau tuổi nghỉ, rút phần chi tiêu cần thiết — đã tính giá cả tăng và trừ thu nhập khác — rồi tính sinh lời trên phần còn lại. Nếu có năm nào khoản dành dụm không đủ trả phần cần rút, năm đó là năm tiền bắt đầu thiếu và kế hoạch được kết luận là không đủ. Nếu đi hết đến tuổi bạn chọn mà không có năm nào như vậy, kế hoạch là đủ. Từng bước và công thức nằm ở phần “Cách tính” cuối trang.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden. `fundedAtBoundary` returns the residue precisely so a page can
     * say it; a verdict that silently forgives a shortfall is a verdict the
     * reader cannot check.
     */
    boundaryNotice:
      "Năm cuối kỳ còn thiếu một phần cực nhỏ của một đồng ({residue} ₫). Đó là sai số làm tròn khi máy tính với số lẻ, không phải một năm không được chi trả, nên kế hoạch vẫn được tính là đủ. Phần dư đó được ghi ra đây để bạn kiểm tra được.",
    invalidNotice:
      "Chưa tính được vì có ô nhập chưa hợp lệ. Ba mốc tuổi cần theo thứ tự: tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc, và cả kỳ không quá 100 năm. Các số tiền phải từ 0 trở lên; mức sinh lời và lạm phát trong khoảng −100 đến 100.",

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
      "Trục ngang là tuổi của bạn. Điểm đầu là hôm nay, với số tiền bạn đang có; mỗi mốc tuổi sau là số tiền vào lúc bạn vừa tròn tuổi đó, tức sau khi đã tính xong năm trước.",
      "Hai đường là cùng một khoản tiền đếm theo hai cách: theo giá của từng năm và theo giá hôm nay. Khi giá cả tăng, đường theo giá hôm nay nằm thấp hơn vì cùng số tiền mua được ít đồ hơn; đường theo giá hôm nay là đường để so với chi tiêu của bạn.",
      "Mốc nghỉ hưu là lúc bạn ngừng để dành và bắt đầu rút tiền; từ đó mức sinh lời chuyển sang mức bạn nhập cho giai đoạn sau khi nghỉ.",
    ],
    tableCaption: "Số tiền tại các mốc tuổi của kế hoạch",
    tableHint:
      "Hai cột cuối là cùng một khoản tiền, đếm theo hai cách. Các mốc quan trọng — hôm nay, tuổi nghỉ hưu, tuổi tiền bắt đầu thiếu và tuổi kết thúc — luôn có mặt; các dòng còn lại là mốc xen giữa cho dễ đọc.",
    periodColumn: "Năm thứ",
    unavailableReason:
      "Chưa vẽ được: kế hoạch cần các mốc tuổi hợp lệ và ít nhất hai năm.",
    unavailableRecovery:
      "Hãy kiểm tra lại ba mốc tuổi — tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc — và các ô số tiền.",
    realPath: "Giá trị tương đương theo sức mua hôm nay",
    nominalPath: "Số tiền dự kiến có lúc đó, theo giá của năm đó",
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
      "Năm đó khoản dành dụm vẫn trả được một phần: phần cần rút từ khoản dành dụm, sau thu nhập khác, là {planned}; trả được {paid}; còn thiếu {short}.",
    otherIncomeNote:
      "Ở mức chi tiêu này, thu nhập khác đã đủ nên khoản dành dụm không bị rút đến.",
    readingNote:
      "Hai đường là cùng một khoản tiền đếm theo hai cách; khoảng cách giữa chúng là tác động của mức lạm phát bạn nhập, và với lạm phát 0% hai đường trùng nhau.",
    ageColumn: "Tuổi",
    yearColumn: "Năm thứ",
    realColumn: "Theo giá hôm nay",
    nominalColumn: "Theo giá của năm đó",
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
   * through `compactMoney` (604,8 triệu; 543,8 triệu; 10,9 tỷ; 4,1 tỷ) and
   * pinned by `long-term-plan.test.ts`.
   */
  formula: {
    title: "Cách tính",
    body: [
      "Hiểu ngay: trước khi nghỉ hưu, mỗi năm bạn để dành thêm một khoản, và cả số tiền đã có được giả định sinh lời theo mức bạn nhập. Sau khi nghỉ, bạn không để dành nữa mà rút dần để trang trải chi tiêu; phần chưa rút vẫn tiếp tục sinh lời. Công cụ lặp lại phép tính đó cho từng năm, từ tuổi hiện tại đến tuổi bạn chọn, và xem tiền còn hay hết.",
      "Ví dụ một năm để dành, với các con số mặc định: đầu năm bạn có 500 triệu và để dành thêm 60 triệu, thành 560 triệu. Sinh lời 8% trên 560 triệu là 44,8 triệu, nên cuối năm có 604,8 triệu. Năm sau, khoản để dành tăng 5% thành 63 triệu và phép tính lặp lại trên số tiền mới.",
      "Ví dụ một năm rút tiền: bạn muốn chi 240 triệu mỗi năm theo giá hôm nay và có 36 triệu thu nhập khác, nên khoản dành dụm cần bù 204 triệu theo giá hôm nay. Nhưng ở tuổi 60, sau 25 năm giá tăng 4% mỗi năm, cùng lượng hàng đó tốn khoảng 543,8 triệu — đó là số tiền thật phải rút trong năm đầu nghỉ hưu. Phần còn lại trong quỹ tiếp tục sinh lời 5%, rồi năm sau lại rút một khoản lớn hơn vì giá tiếp tục tăng.",
      "Khi giá cả tăng, cùng một số tiền mua được ít hơn, nên công cụ đếm mọi khoản tiền theo hai cách: số tiền của năm đó — gọi là số danh nghĩa — và số tiền tương đương theo giá hôm nay, tức sức mua. Với các con số mặc định, khoảng 10,9 tỷ khi nghỉ hưu chỉ mua được như khoảng 4,1 tỷ hôm nay. Con số theo giá hôm nay là con số nên dùng để so với chi tiêu của bạn; con số danh nghĩa là cách đếm theo đồng của năm đó, giống cách một bảng kê tài khoản sẽ ghi, nếu các giả định đúng.",
      "Kết luận đủ hay không đủ đến từ chính phép tính từng năm ấy. Nếu có năm nào khoản dành dụm không đủ trả phần cần rút, năm đó là năm tiền bắt đầu thiếu, và công cụ báo cả phần trả được lẫn phần còn thiếu thay vì chỉ một cái tuổi. Nếu kế hoạch đủ, dòng “mức chi giữ được đến hết kỳ” cho biết mức chi mỗi năm, theo giá hôm nay, mà số tiền khi nghỉ hưu duy trì được đến tuổi kết thúc — cao hơn mức bạn nhập bao nhiêu thì đó là khoảng an toàn của bạn.",
      "Công cụ chưa trừ thuế và phí, coi mức sinh lời là đều đặn mỗi năm và không dự báo thị trường; một năm giảm mạnh ngay đầu giai đoạn rút tiền gây thiệt hại lớn hơn nhiều so với cùng mức giảm xảy ra muộn hơn, và mô hình không mô phỏng điều đó. Vì vậy kết quả thật có thể cao hơn hoặc thấp hơn con số ở đây, và kỳ càng dài thì càng dễ lệch nhiều: hãy dùng nó để so sánh các lựa chọn, không phải làm một lời hứa.",
    ],
    /**
     * Editor-selected, and deliberately few. Each phrase occurs in exactly
     * ONE paragraph of `body` and marks that paragraph's point, not a figure.
     */
    emphasis: [
      "rút dần để trang trải chi tiêu",
      "cuối năm có 604,8 triệu",
      "số tiền thật phải rút trong năm đầu nghỉ hưu",
      "Con số theo giá hôm nay là con số nên dùng",
      "năm tiền bắt đầu thiếu",
      "không phải làm một lời hứa",
    ],
    detail: {
      title: "Xem cách tính chi tiết",
      body: [
        "Giai đoạn để dành: mỗi năm cộng khoản để dành vào số tiền rồi mới tính sinh lời, nên khoản đó được hưởng đủ một năm sinh lời — giống một khoản nộp vào tháng Một. Nếu thực tế bạn nộp mỗi tháng một ít, mười một khoản trong số đó đến muộn hơn và sinh lời ít tháng hơn: với mức sinh lời dương, kết quả thật sẽ thấp hơn kế hoạch này một chút; ở mức 0% hai cách bằng nhau; ở mức âm thì ngược lại. Ô “dành thêm mỗi năm” vì thế là tổng cả năm; mô hình không tính riêng mười hai khoản góp hằng tháng.",
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
        a: "Vì giá cả tăng suốt 25 năm để dành. Với lạm phát 4%/năm, giá sau 25 năm bằng 1,04^25 = 2,67 lần hôm nay, nên 10.902.417.350 ₫ ở tuổi 60 chỉ mua được lượng hàng mà 4.089.679.933 ₫ mua hôm nay — khoảng 37,5%. Con số lớn không sai, nó chỉ là đồng của năm bạn 60 tuổi; con số theo giá hôm nay mới là con số để so với chi tiêu hiện tại của bạn, nên trang này đặt nó làm kết quả chính.",
      },
      {
        q: "Nên chọn tuổi kết thúc là bao nhiêu?",
        a: "Cao hơn mốc bạn nghĩ là vừa đủ. Công cụ không dùng bảng tuổi thọ nào và không chọn thay bạn: tuổi kết thúc là câu hỏi “nếu tôi sống đến tuổi này thì tiền còn không”. Kế hoạch tính chi tiêu cho đến khi bạn tròn tuổi đó — chọn 85 nghĩa là các năm từ lúc nghỉ hưu đến hết năm 84 tuổi được tính, còn năm 85 tuổi thì không. Chuẩn bị cho một cuộc sống dài hơn dự tính là cách để những năm cuối không phải lo tiền. Hãy thử nhập thêm 5 hoặc 10 năm rồi xem kết quả đổi thế nào — nếu kế hoạch chuyển từ đủ sang không đủ trong khoảng đó, bạn vừa biết được điều đáng biết nhất về nó. Trang “Tiêu được bao nhiêu” còn vẽ sẵn một nhánh sống lâu hơn 5 năm so với mốc bạn nhập.",
      },
      {
        q: "Vì sao mức sinh lời sau khi nghỉ thường được đặt thấp hơn?",
        a: "Vì nhiều người chuyển dần sang các khoản ít biến động hơn khi gần và sau lúc nghỉ hưu, và vì người đang rút tiền chịu thêm một rủi ro: một đợt giảm mạnh ngay đầu giai đoạn rút gây thiệt hại lớn hơn nhiều so với cùng đợt giảm đó xảy ra muộn hơn, vì tiền bị bán ra đúng lúc giá thấp. Cả hai mức sinh lời ở đây đều do bạn nhập, và công cụ coi chúng là đều đặn mỗi năm, nên nó không mô phỏng rủi ro đó. Hãy xem kết quả là một kịch bản với mức sinh lời đều mỗi năm, không phải dự báo.",
      },
      {
        q: "Tỷ lệ rút năm đầu 4,99% có an toàn không?",
        a: "Tỷ lệ này cho biết năm đầu nghỉ hưu bạn rút bao nhiêu phần trăm số tiền có lúc nghỉ. Một mình nó chưa nói được kế hoạch có an toàn hay không, vì kết quả còn tùy mức sinh lời từng năm, lạm phát và bạn sống bao lâu; công cụ vì thế không so nó với một ngưỡng nào. Con số dễ dùng hơn nằm trong phần chi tiết: “mức chi giữ được đến hết kỳ” được tính từ chính số tiền và giả định bạn nhập, nên nó trả lời cùng câu hỏi bằng tiền thay vì bằng tỷ lệ. Với các con số mặc định, mức đó là 219.057.403 ₫ mỗi năm theo giá hôm nay, so với 240.000.000 ₫ bạn muốn — thấp hơn 20.942.597 ₫ mỗi năm.",
      },
      {
        q: "Dòng “chi tiêu còn thiếu mỗi năm” có phải là số tôi cần để dành thêm không?",
        a: "Không. Đó là chênh lệch giữa mức chi bạn mong muốn và mức chi mà kế hoạch hiện tại duy trì được đến tuổi kết thúc, tính mỗi năm theo giá hôm nay — với các con số mặc định là 20.942.597 ₫. Nó không phải số tiền phải nộp thêm mỗi năm từ bây giờ, và không phải tổng số vốn còn thiếu. Muốn biết cần để dành thêm bao nhiêu, hãy dùng trang “Cần dành bao nhiêu”; muốn biết còn thiếu bao nhiêu vốn, dùng trang “Thiếu bao nhiêu”.",
      },
      {
        q: "Công cụ có trừ thuế và phí không?",
        a: "Không. Phép tính không trừ thuế và không trừ phí quản lý, nên số tiền rút ở đây là số gộp. Nếu những khoản bạn đang đầu tư chịu thuế hay phí khi bán hoặc khi nhận lãi, chi tiêu thực tế của bạn sẽ thấp hơn con số hiển thị. Cách xử lý đơn giản là nhập mức chi tiêu mong muốn cao hơn tương ứng, hoặc hạ mức sinh lời bạn giả định. Công cụ không mô phỏng quy định thuế của bất kỳ nước nào.",
      },
      {
        q: "Bốn trang kế hoạch hưu trí khác nhau ở đâu, và số tôi nhập có được giữ khi chuyển trang không?",
        a: "Bốn trang dùng chung một cách tính, mỗi trang mở đầu bằng một câu hỏi: trang này vẽ kế hoạch qua từng tuổi; “Cần dành bao nhiêu” giải ra khoản phải để dành thêm mỗi năm; “Thiếu bao nhiêu” đo khoảng cách vốn và định giá ba cách bù; “Tiêu được bao nhiêu” tính mức chi mà số tiền duy trì được. Cùng một bộ số sẽ cho cùng kết quả về số tiền khi nghỉ và tuổi tiền bắt đầu thiếu. Số bạn nhập không được lưu và không tự chuyển giữa các trang — khi đổi trang, bạn cần nhập lại.",
      },
    ],
  },
} as const;
