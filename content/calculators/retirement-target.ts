// Copy for /cong-cu/tinh-huu-tri/ — the CONTRIBUTION view of the merged
// long-term plan (original plan row 45).
//
// Original FinHome copy. Denominated in đồng, and it models NO country's law:
// `lib/calc/retirement.ts` is arithmetic on a balance, a contribution, two
// returns and an inflation rate. The registry's `usRules: true` flag was
// removed from this row in the foundation slice — the notice it rendered ("mô
// phỏng quy định về thuế và hưu trí của Hoa Kỳ") described a model that does
// not exist here. That left this route in a broken interim state, which this
// unit closes: the flag was gone while the component still read
// `RETIREMENT_DEFAULTS`, so the live page showed dollar amounts with nothing
// on it explaining them, and the copy named 401(k), IRA and Roth as though
// the engine knew what they were.
//
// The scenario, the eleven field labels, the four-view control's copy and the
// shared scope live in `content/calculators/long-term-plan.ts`, because four
// sibling routes must agree with them. This file holds only what is this
// page's own: its title, its notice, its result labels, its table copy, its
// method prose and its FAQ. It deliberately carries NO field copy — four
// copies of eleven labels is four places to edit and three to forget, which
// is how the four routes came to disagree in the first place.
//
// ── EVERY FIGURE QUOTED BELOW IS THE MODEL'S OUTPUT ────────────────────────
//
// Verified by running `resolveLongTermPlan` on `LONG_TERM_PLAN.defaults` with
// the contribution zeroed — the field this page solves for and does not ask
// (35 tuổi → nghỉ 60 → đến 85; 500.000.000 ₫ đang có; khoản dành thêm tăng
// 5%/năm; lợi suất 8% trước / 5% sau; lạm phát 4%; chi tiêu mong muốn
// 240.000.000 ₫ và thu nhập khác 36.000.000 ₫, cả hai theo giá hôm nay):
//
//   Cần dành mỗi năm, năm đầu:        70.007.403 ₫   (chia 12: 5.833.950 ₫)
//   Năm cuối còn dành, tuổi 59:      225.780.872 ₫   (chia 12: 18.815.073 ₫)
//                                     — gấp 3,2 lần khoản năm đầu
//   Tổng sẽ dành cả kỳ:            3.341.250.252 ₫
//     25 lần khoản năm đầu chỉ là  1.750.185.081 ₫
//   Tổng tăng trưởng:             18.807.069.523 ₫ — 562,9% tổng đã dành
//   Vốn khi nghỉ:                 12.149.703.354 ₫ danh nghĩa
//                                  4.557.557.871 ₫ theo giá hôm nay
//   Vốn cần có:                    4.557.557.871 ₫ — cùng một con số, và đó
//     là phép kiểm chứng: một đường đi từ phép dò trên bản dự phóng, một
//     đường đi từ hệ số niên kim đầu kỳ theo lợi suất thực
//   Tỷ lệ rút năm đầu:                      4,48%
//   Chi giữ được đến hết:            240.000.000 ₫ — đúng mức đã nhập
//   Số dư cuối kỳ:                             0 ₫
//   Nếu khoản dành thêm không tăng:  110.512.702 ₫/năm (9.209.392 ₫/tháng),
//     cao hơn 57,9% ngay năm đầu, nhưng tổng cả kỳ 2.762.817.551 ₫ — ít hơn
//     578.432.701 ₫, vì tiền vào sớm hơn thì có thêm nhiều năm sinh lợi
//   Bắt đầu ở tuổi 45:               168.251.508 ₫/năm (14.020.959 ₫/tháng),
//     đắt hơn 140,3%; tổng 3.630.625.864 ₫ trong 15 năm thay vì 25
//
// `content/calculators/retirement-target.test.ts` re-derives every one of
// these from the shipped default STRINGS with the same parsers the component
// uses and pins them against the sentences below, so a moved default is a red
// test naming the sentences that have to move with it.
//
// NOT ONE OF THESE WAS CONVERTED FROM THE USD FIGURES, and none could have
// been: every ratio moves under a realistic Vietnamese scenario. The level
// contribution cost 22,8% more than the growing plan's first year and now
// costs 57,9% more; starting ten years late cost 119,3% more and now costs
// 140,3%; lifetime growth was 776,9% of what went in and is now 562,9%; the
// first-year withdrawal rate was 4,63% and is now 4,48%. The accumulation is
// 25 years here, not 30, so "30 lần con số đầu tiên" is 25. The old copy also
// quoted a 2.493.773,11 / 1.188.888,09 pair for the capital, which was a
// 47,7% real share against 37,5% here.
//
// A REVERSAL THE USD COPY GOT WRONG, not just rescaled. It said the growing
// and the level plan "mô tả cùng một kế hoạch; điều khác nhau là bạn trả phần
// khó ở đầu kỳ hay ở cuối kỳ". They are not the same plan and their lifetime
// totals differ: on these defaults the level plan puts in 578.432.701 ₫ LESS
// in total while costing more in year one, because the money arrives earlier
// and compounds for longer. The test asserts both directions of that
// inequality on the shipped scenario rather than the copy asserting it in
// general, and the sentence says "trên các giả định mặc định" for the same
// reason.
//
// ── ALL-CAPS WAS REPLACED BY DECLARED EMPHASIS ─────────────────────────────
//
// The previous copy shouted "GIÁ HÔM NAY" and "NĂM ĐẦU" inside sentences.
// Capitals were the only emphasis available before `ProseText` existed; they
// are now sentence case, and `formula.emphasis` declares the few phrases that
// carry the distinction each paragraph is about — through
// `lib/prose-emphasis.ts`, so the paragraph stays one plain string, joining
// the rendered spans reproduces it exactly, and nothing goes near
// `dangerouslySetInnerHTML`. The tests check every declared phrase occurs,
// that each occurs in exactly ONE paragraph, that the emphasised share stays
// under the ratchet, and that no capitalised run survives anywhere in the
// page's strings.

export const RETIREMENT_TARGET = {
  slug: "/cong-cu/tinh-huu-tri",

  pageTitle: "Kế hoạch dài hạn: cần dành bao nhiêu",
  metaTitle:
    "Cần dành bao nhiêu mỗi năm — Khoản một kế hoạch dài hạn đòi hỏi",
  metaDescription:
    "Từ mức chi tiêu bạn muốn có khi nghỉ, công cụ giải ngược ra khoản phải dành thêm mỗi năm, tính bằng đồng. Có tính lạm phát, và nói rõ khoản đó sẽ tăng đến đâu. Công cụ miễn phí của FinHome.",

  lede:
    "Trang này đi ngược chiều với một bản dự phóng thông thường: bạn nhập mức sống mong muốn khi nghỉ, công cụ giải ra khoản phải dành thêm mỗi năm để đạt được mức đó — và nói rõ con số ấy sẽ tăng đến đâu trong những năm cuối.",

  form: {
    resultTitle: "Khoản cần dành thêm",
    annualLabel: "Cần dành mỗi năm, năm đầu",
    /**
     * Named as a division, not as a monthly plan.
     *
     * `monthlyEquivalent` is exactly `annual / 12` and `long-term-plan.ts`
     * insists a consumer say which of the two it is: the engine adds the whole
     * year's amount once, at the start, so twelve month-end deposits of a
     * twelfth each land BEHIND it. The old label read "Cần góp mỗi tháng",
     * which is a funded monthly instruction this model never computed.
     */
    monthlyLabel: "Cùng khoản đó chia cho 12",
    lastAnnualLabel: "Cần dành mỗi năm, năm cuối",
    realBalanceLabel: "Vốn khi nghỉ, theo giá hôm nay",

    checkTitle: "Kiểm chứng kế hoạch",
    nominalBalanceLabel: "Vốn khi nghỉ, danh nghĩa",
    requiredBalanceLabel: "Vốn cần có, theo giá hôm nay",
    totalContributedLabel: "Tổng sẽ dành cả kỳ",
    totalGrowthLabel: "Tổng tăng trưởng",
    initialRateLabel: "Tỷ lệ rút năm đầu",
    sustainableLabel: "Mức chi giữ được đến hết, theo giá hôm nay",
    finalBalanceLabel: "Số dư cuối kỳ, danh nghĩa",

    /**
     * The headings are terse on purpose, and the caption carries what they
     * cannot.
     *
     * Below `md` each heading is the `<dt>` of a two-track grid whose value
     * track never shrinks, so a heading over about a dozen characters starves
     * beside an exact đồng figure at 390 px — measured on a sibling route,
     * where a 23-character label collapsed to a 55 px track across four lines.
     * So "số vốn theo giá hôm nay" is stated once in the caption and once in
     * the paragraph above the table, where there is room for it, rather than
     * truncated into a column heading. It is the distinction this whole family
     * of routes teaches and it is not droppable — only movable.
     */
    table: {
      caption:
        "Khoản dành thêm mỗi năm và số vốn theo giá hôm nay, tại các mốc của kế hoạch",
      intro:
        "Bảng lấy các mốc bắt buộc — năm đầu, năm cuối còn dành thêm, năm đầu rút tiền và cuối kỳ — rồi thêm vài năm xen giữa cho dễ đọc. Mỗi dòng là một năm: cột “dành thêm” là khoản của riêng năm đó, và nó tăng dần chính là điều con số đầu tiên ở trên không tự nói ra. Cột “số vốn” đã quy về giá hôm nay.",
      ageColumn: "Tuổi",
      contributionColumn: "Dành thêm",
      withdrawalColumn: "Rút",
      realBalanceColumn: "Số vốn",
    },

    fundedNotice:
      "Số tiền hiện có đã đủ để nuôi mức chi tiêu này đến hết kỳ mà không cần dành thêm đồng nào, nên kết quả là 0 — không phải một con số nhỏ mà phép dò tình cờ dừng lại ở đó. Nếu bạn vẫn tiếp tục dành thêm, phần dư sẽ nằm lại cuối kỳ; hãy thử nâng mức chi tiêu mong muốn để xem kế hoạch chịu được đến đâu.",
    /**
     * A pension is not a portfolio, and the page must not merge them.
     *
     * `contributionAnswer` tests `fundedByOtherIncome` before it asks the
     * solver anything, precisely so a reader's savings are not credited for
     * what their pension is doing. This sentence is the consumer side of that.
     */
    otherIncomeNotice:
      "Ở mức chi tiêu này, thu nhập khác đã phủ hết nhu cầu của mọi năm nghỉ hưu, nên danh mục không bị rút đến đồng nào và mức cần dành thêm là 0. Đó là lương hưu hay tiền cho thuê của bạn đang làm việc đó, không phải số vốn bạn đã tích — hai điều khác nhau, và công cụ không gộp chúng lại. Hãy thử nâng mức chi tiêu mong muốn lên trên mức thu nhập khác để xem phần vốn phải tự lo là bao nhiêu.",
    noTimeNotice:
      "Tuổi dự định nghỉ bằng tuổi hiện tại, nên không còn năm nào để dành thêm: câu hỏi của trang này không có nghiệm, và đó là câu trả lời thật thà hơn một con số. Số vốn hiện có vẫn đo được — trang “Thiếu bao nhiêu” nói nó thiếu bao nhiêu so với mức cần, và trang “Tiêu được bao nhiêu” nói nó nuôi được mức chi nào.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden. `fundedAtBoundary` returns the residue precisely so a page can
     * say it; a verdict that silently forgives a shortfall is a verdict the
     * reader cannot check.
     */
    boundaryNotice:
      "Năm cuối kỳ còn thiếu một phần cực nhỏ của một đồng ({residue} ₫). Đó là sai số làm tròn của số thực, không phải một năm không được chi trả, nên kế hoạch vẫn được tính là đủ — và phần dư đó được ghi ra đây thay vì bỏ qua trong im lặng.",
    unsolvableNotice:
      "Không có mức dành thêm nào trong khoảng công cụ tìm kiếm nuôi được mức chi tiêu này đến hết kỳ. Đó là câu trả lời thật thà hơn một con số: khi phép tìm không chặn được nghiệm, bất kỳ số hữu hạn nào trả về cũng chỉ là phỏng đoán. Hãy giảm mức chi tiêu mong muốn, lùi tuổi dự định nghỉ, hoặc kiểm tra lại các mốc tuổi.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc, và toàn kỳ không quá 100 năm. Các số tiền phải từ 0 trở lên và các mức lợi suất, lạm phát trong khoảng −100 đến 100.",
  },

  /**
   * The notice above the calculator: the headline figure GROWS.
   *
   * Two sentences, because a long notice pushes the form off the first screens
   * on a phone — the browser finding `CalculatorPage`'s `notice` prop records.
   * The level-contribution comparison is the `noticeDetail` behind it.
   *
   * The growth RATE is not quoted here on purpose: it is a field the reader
   * owns, and naming today's 5% would rot the sentence the day the shared
   * scenario moves. The figures either side of it are pinned by the test.
   */
  growingNotice:
    "Con số đầu tiên ở trên là khoản của năm đầu, không phải mức dành đều suốt kỳ. Với các giả định mặc định, 70.007.403 ₫ ở tuổi 35 — chia 12 là 5.833.950 ₫ — đã thành 225.780.872 ₫ ở tuổi 59, tức 18.815.073 ₫ một tháng: gấp 3,2 lần, vì kế hoạch giả định khoản dành thêm tăng cùng thu nhập của bạn theo đúng tỷ lệ bạn nhập.",
  growingNoticeDetailTitle: "Nếu bạn muốn một con số cố định",
  growingNoticeDetail:
    "Đặt “khoản dành thêm tăng mỗi năm” về 0 và công cụ giải ra một con số không đổi suốt kỳ: với các giả định mặc định là 110.512.702 ₫ mỗi năm, tức 9.209.392 ₫ một tháng. Con số đó cao hơn 57,9% so với khoản năm đầu của kế hoạch tăng dần, và tổng cả kỳ lại ít hơn 578.432.701 ₫ — tiền vào sớm hơn thì có thêm nhiều năm sinh lợi. Nên đây không phải hai cách viết của cùng một kế hoạch: bạn chọn trả phần khó ở đầu kỳ hay ở cuối kỳ, và trên các giả định này hai lựa chọn có hai tổng khác nhau.",

  formula: {
    title: "Cách tính",
    body: [
      "Công cụ không dùng công thức niên kim để giải ra khoản dành thêm. Nó chạy đúng bản dự phóng mà ba trang còn lại của kế hoạch chạy — tích lũy đến tuổi bạn dự định nghỉ, rồi rút tiền đến hết kỳ — và dò khoản dành thêm trên chính bản dự phóng đó cho tới khi tiền vừa đủ không cạn.",
      "Lý do phải làm vòng vo như vậy: bản dự phóng có một cái sàn mà công thức niên kim không có — khoản rút của một năm không bao giờ vượt số dư còn lại. Giải theo công thức rồi hiển thị bản dự phóng chính là cách một trang tuyên bố kế hoạch đủ trong khi bảng số của chính nó cho thấy tiền cạn giữa kỳ.",
      "Mức chi tiêu mong muốn được nhập theo giá hôm nay và được quy đổi sang từng năm tương lai theo lạm phát. Thu nhập khác cũng vậy, nên mỗi đồng lương hưu hay tiền cho thuê bạn nhập vào sẽ giảm trực tiếp phần phải rút từ danh mục — và giảm theo đúng tỷ lệ đó khoản bạn phải dành thêm hôm nay.",
      "Khoản được giải là khoản của năm đầu. Từ năm sau nó tăng theo tỷ lệ ở ô “khoản dành thêm tăng mỗi năm”, nên tổng số tiền bạn thực sự bỏ ra lớn hơn 25 lần con số đầu tiên: 3.341.250.252 ₫ so với 1.750.185.081 ₫, theo các giả định mặc định.",
      "Dòng “cùng khoản đó chia cho 12” đúng như tên gọi của nó: một phép quy đổi để dễ hình dung chứ không phải một kế hoạch góp hằng tháng. Mô hình cộng cả khoản của năm vào một lần, ở đầu năm, nên nếu thực tế bạn nộp mỗi tháng một ít thì mười một khoản trong số đó đến muộn và bạn sẽ về sau kế hoạch này một chút — không bao giờ vượt lên.",
      "Nếu số tiền hiện có đã tự nuôi được cả kỳ, kết quả là 0 chứ không phải một con số nhỏ mà phép dò tình cờ dừng lại ở đó. Nếu ngay cả mức tối đa công cụ dò cũng không đủ, kết quả là “không có nghiệm” chứ không phải một con số trông có vẻ hợp lý.",
      "Hai phép kiểm chứng nằm sẵn trong phần kết quả. Dòng “mức chi giữ được đến hết” phải trùng với mức chi tiêu bạn đã nhập, và dòng “vốn khi nghỉ, theo giá hôm nay” phải trùng với dòng “vốn cần có” — 4.557.557.871 ₫ trên các giả định mặc định. Hai con số ấy đi hai đường khác nhau, một từ phép dò trên bản dự phóng và một từ hệ số niên kim đầu kỳ theo lợi suất thực, nên chúng trùng nhau là bằng chứng cả hai đều đúng.",
    ],
    /**
     * Editor-selected, and deliberately few.
     *
     * Each phrase occurs in exactly ONE paragraph, because `CalculatorPage`
     * applies the whole list to every paragraph: a phrase appearing in five of
     * them would be emphasised five times, which is the "bold everything"
     * failure the mechanism exists to avoid. Each marks the DISTINCTION its
     * paragraph is about rather than a figure — the figures are in the result
     * rows and the notice above, where they are already the loudest thing on
     * the page.
     */
    emphasis: [
      "dò khoản dành thêm trên chính bản dự phóng",
      "một cái sàn mà công thức niên kim không có",
      "giảm trực tiếp phần phải rút từ danh mục",
      "khoản của năm đầu",
      "một phép quy đổi để dễ hình dung chứ không phải một kế hoạch góp hằng tháng",
      "là 0 chứ không phải một con số nhỏ",
      "đi hai đường khác nhau",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Bắt đầu muộn 10 năm thì đắt hơn bao nhiêu?",
        a: "Hơn gấp đôi. Với đúng các giả định mặc định, bắt đầu ở tuổi 35 cần 70.007.403 ₫ mỗi năm, tức 5.833.950 ₫ một tháng; bắt đầu ở tuổi 45 cho cùng mục tiêu cần 168.251.508 ₫ mỗi năm, tức 14.020.959 ₫ một tháng. Tổng số tiền bỏ ra cũng tăng, từ 3.341.250.252 ₫ lên 3.630.625.864 ₫ — vừa dành nhiều hơn mỗi năm, vừa chỉ còn 15 năm thay vì 25 nên phần lợi nhuận kép làm hộ bạn ít hơn. Đây là con số đáng nhìn nhất trên trang này: mười năm chờ đợi không làm mục tiêu đắt thêm một phần ba, nó làm mục tiêu đắt thêm 140,3%.",
      },
      {
        q: "Nên đặt “khoản dành thêm tăng mỗi năm” bằng bao nhiêu?",
        a: "Bằng tốc độ tăng thu nhập bạn thực sự tin mình sẽ đạt được, vì kế hoạch giả định bạn nâng khoản dành thêm đúng như vậy mỗi năm — và nếu bạn không nâng thì khoản năm đầu là quá thấp, còn phần thiếu hụt chỉ lộ ra sau vài chục năm, khi không còn thời gian sửa. Đặt 0 là lựa chọn dễ thực hiện nhất: công cụ khi đó giải ra một con số không đổi, 110.512.702 ₫ mỗi năm trên các giả định mặc định, cao hơn 57,9% ngay từ năm đầu. Điều đáng chú ý là tổng cả kỳ của phương án cố định lại thấp hơn 578.432.701 ₫ — trên đúng các giả định này, dành muộn hơn không phải là dành ít hơn.",
      },
      {
        q: "Con số “chia cho 12” có phải là kế hoạch góp hằng tháng không?",
        a: "Không, và đó là lý do dòng đó được đặt tên như vậy chứ không gọi là khoản góp mỗi tháng. Mô hình cộng cả khoản của năm vào một lần ở đầu năm, nên nó mô tả một khoản nộp vào tháng Một và khoản đó được hưởng đủ một năm lợi suất. Mười hai khoản nộp vào cuối mỗi tháng, mỗi khoản một phần mười hai, thì mười một khoản đến muộn: kết quả là bạn về sau kế hoạch này một chút, không bao giờ vượt lên. Con số mỗi tháng ở đây là để bạn so với ngân sách của mình, không phải một chỉ dẫn nộp tiền mà công cụ đã kiểm chứng.",
      },
      {
        q: "Vì sao tổng tăng trưởng lớn hơn tổng đã dành nhiều lần?",
        a: "Vì kỳ này dài 50 năm, không phải 25. Tiền dành ở tuổi 35 vẫn nằm trong danh mục và sinh lợi đến tuổi 85. Với các giả định mặc định, tổng tăng trưởng là 18.807.069.523 ₫ trên tổng đã dành 3.341.250.252 ₫ — tức 562,9%. Điều đó không có nghĩa là bạn “được” khoản đó: phần lớn nó bị lạm phát và chính việc rút tiền tiêu hết. Nó chỉ nói rằng ở kỳ hạn này, thời gian đóng góp nhiều hơn số tiền, nên năm bạn bắt đầu quan trọng hơn mức bạn dành mỗi năm.",
      },
      {
        q: "Tỷ lệ rút năm đầu 4,48% có an toàn không?",
        a: "Đây là một chỉ dấu, không phải một kết luận, và công cụ không so nó với bất kỳ ngưỡng nào — làm vậy sẽ là một khẳng định về thị trường mà trang này không có cơ sở để đưa ra. Con số đáng dùng nằm ngay bên dưới: “mức chi giữ được đến hết” được giải từ chính số vốn và chính các giả định bạn nhập, nên nó trả lời cùng câu hỏi bằng tiền thay vì bằng tỷ lệ. Ở mức dành thêm đã giải, nó bằng đúng 240.000.000 ₫ bạn đã nhập, và đó chính là định nghĩa của khoản vừa đủ.",
      },
      {
        q: "Vì sao tiền vừa hết đúng tuổi kết thúc, không dư đồng nào?",
        a: "Vì đó là định nghĩa của khoản dành thêm tối thiểu: mức thấp nhất còn nuôi được cả kỳ. Số dư cuối kỳ bằng 0 là dấu hiệu phép dò đã hội tụ, không phải dấu hiệu kế hoạch nguy hiểm — nhưng nó cũng có nghĩa là kế hoạch này không còn biên an toàn nào. Sống thêm 5 năm ngoài dự phóng, hoặc một đợt giảm mạnh của thị trường ngay đầu giai đoạn rút, đều không có gì để bù. Cách xử lý đúng là dự phóng đến tuổi cao hơn kỳ vọng sống rồi mới lấy con số này, thay vì cộng một biên an toàn tùy ý sau đó; trang “Tiêu được bao nhiêu” còn vẽ sẵn một nhánh sống lâu hơn 5 năm so với mốc bạn nhập, ở cùng mức chi tiêu.",
      },
      {
        q: "Kết quả có tính thuế và phí không?",
        a: "Không. Phép tính không trừ thuế và không trừ phí quản lý danh mục, nên khoản rút ở đây là số gộp và khoản dành thêm là số bạn thực sự chuyển vào. Nếu những khoản bạn đang đầu tư có chịu thuế hay phí khi bán hoặc khi nhận lãi, chi tiêu thực nhận của bạn sẽ thấp hơn con số hiển thị: cách xử lý đơn giản là nhập mức chi tiêu mong muốn cao hơn tương ứng, hoặc hạ mức lợi suất bạn giả định. Công cụ không mô phỏng quy định thuế của bất kỳ nước nào.",
      },
      {
        q: "Bốn trang kế hoạch dài hạn khác nhau ở đâu?",
        a: "Chúng dùng chung một bộ giả định và một phép dự phóng, rồi mỗi trang mở đầu bằng một câu hỏi khác: trang này giải ra khoản phải dành thêm mỗi năm; “Kế hoạch chạy ra sao” vẽ diễn biến từng năm một; “Thiếu bao nhiêu” đo khoảng cách vốn và định giá ba cách bù; “Tiêu được bao nhiêu” tính mức chi mà số vốn duy trì được. Vì cả bốn đọc từ cùng một kết quả, chúng không thể đưa ra những con số trái nhau về số vốn khi nghỉ hay về năm tiền cạn.",
      },
    ],
  },
} as const;
