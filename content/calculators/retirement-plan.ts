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
// page's own: its title, its notice, its result labels, its chart labels, its
// method prose and its FAQ.
//
// ── EVERY FIGURE QUOTED BELOW IS THE MODEL'S OUTPUT ────────────────────────
//
// Verified by running `resolveLongTermPlan` on `LONG_TERM_PLAN.defaults`
// (35 tuổi → nghỉ 60 → đến 85; 500.000.000 ₫ đang có; dành thêm
// 60.000.000 ₫/năm tăng 5%/năm; lợi suất 8% trước / 5% sau; lạm phát 4%;
// chi tiêu mong muốn 240.000.000 ₫ và thu nhập khác 36.000.000 ₫, cả hai theo
// giá hôm nay):
//
//   Số dư khi nghỉ:        10.902.417.350 ₫ danh nghĩa
//                           4.089.679.933 ₫ theo giá hôm nay — 37,5% của nó
//   Vốn cần có:             4.557.557.871 ₫ theo giá hôm nay
//   Còn thiếu:                467.877.938 ₫; đạt 89,7% mức cần
//   Năm rút đầu tiên:         543.830.612 ₫ danh nghĩa cho 204.000.000 ₫ giá hôm nay
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
// and pins them against the sentences below, so a moved default is a red test
// naming the sentences that have to move with it. That guard is new: this
// page's prose has quoted computed figures since it shipped with nothing
// checking them.
//
// The nominal number is 2,67x the real one because prices rise 1,04^25 = 2,6658
// over the 25-year accumulation. Cross-checked against a closed form:
// 500e6 x 1,08^25 + 60e6 x 1,08^25 x sum((1,05/1,08)^k, k=0..24) =
// 10.902.417.349,60, which agrees with the engine to 0,4 ₫ in 1,09e10.
//
// ── ALL-CAPS WAS REPLACED BY DECLARED EMPHASIS ─────────────────────────────
//
// The previous copy shouted: "GIÁ HÔM NAY", "CHƯA TỚI MỘT NỬA", "TRƯỚC",
// "HAI", "ĐẦU KỲ". A rendered-page check found this route shipping zero
// `<strong>` elements, so capitals were doing the work typography should. They
// are now sentence case, and `formula.emphasis` declares the few phrases that
// carry the distinction the paragraph is about — through
// `lib/prose-emphasis.ts`, so the paragraph stays one plain string and joining
// the rendered spans reproduces it exactly. `plan-disposition.test.ts` checks
// every declared phrase occurs and holds the emphasised share under its
// ratchet; `check:markup` checks the built page actually ships `<strong>`.

export const RETIREMENT_PLAN = {
  slug: "/cong-cu/ke-hoach-huu-tri",

  pageTitle: "Kế hoạch hưu trí: từng năm một",
  metaTitle: "Kế hoạch hưu trí — Tích lũy, rút tiền và năm tiền cạn",
  metaDescription:
    "Dự phóng cả hai giai đoạn của một kế hoạch dài hạn bằng đồng: tích lũy đến tuổi bạn dự định nghỉ, rồi rút tiền — có tính lạm phát, và nói rõ năm nào tiền cạn. Công cụ miễn phí của FinHome.",

  lede:
    "Một bản dự phóng chạy cả hai giai đoạn: tích lũy đến tuổi bạn dự định nghỉ, rồi rút tiền cho đến khi hết tiền hoặc hết kỳ. Hai điều công cụ này không làm: không đưa số danh nghĩa lên làm câu trả lời, và không im lặng khi tiền cạn.",

  form: {
    resultTitle: "Kết quả kế hoạch",
    verdictLabel: "Kế hoạch đủ đến hết kỳ dự phóng",
    verdictYes: "Đủ",
    verdictNo: "Không đủ",
    depletionLabel: "Tiền cạn ở tuổi",
    yearsShortLabel: "Thiếu",
    yearsUnit: "năm",
    realBalanceAtRetirementLabel: "Số dư khi nghỉ, theo giá hôm nay",

    nominalTitle: "Cùng một số dư, hai cách đếm",
    balanceAtRetirementLabel: "Số dư khi nghỉ, danh nghĩa",
    finalBalanceLabel: "Số dư cuối kỳ, danh nghĩa",
    realFinalBalanceLabel: "Số dư cuối kỳ, theo giá hôm nay",

    flowTitle: "Dòng tiền cả kỳ",
    totalContributedLabel: "Tổng đã dành thêm",
    totalGrowthLabel: "Tổng tăng trưởng",
    totalWithdrawnLabel: "Tổng đã rút",
    firstWithdrawalLabel: "Rút năm đầu tiên, danh nghĩa",
    firstWithdrawalRealLabel: "Cùng khoản đó theo giá hôm nay",
    initialRateLabel: "Tỷ lệ rút năm đầu",
    sustainableLabel: "Mức chi giữ được đến hết, theo giá hôm nay",
    shortfallLabel: "Thiếu so với mức mong muốn",

    /** The depletion year is usually a PARTIAL payment, so all three figures. */
    partialTitle: "Năm cạn tiền trả được bao nhiêu",
    partialPlannedLabel: "Năm đó cần",
    partialPaidLabel: "Thực trả được",
    partialShortLabel: "Còn thiếu",

    depletionNotice:
      "Kế hoạch này cạn tiền trước khi hết kỳ dự phóng. Công cụ nói rõ năm nào thay vì chỉ hiển thị số dư cuối bằng 0 — một bản dự phóng kết thúc ở 0 mà không nói tại sao đã che đi đúng thông tin duy nhất có ý nghĩa. Ba trang còn lại của kế hoạch này định giá ba cách bù: dành thêm mỗi năm, nghỉ muộn hơn, hoặc hạ mức chi tiêu.",
    fundedNotice:
      "Kế hoạch đủ đến hết kỳ dự phóng. Hãy nhìn dòng “mức chi giữ được đến hết”: đó là mức chi tối đa mà số vốn khi nghỉ duy trì được suốt kỳ. Nếu nó cao hơn mức bạn nhập nhiều, bạn đang dành nhiều hơn mức mục tiêu của chính mình đòi hỏi.",
    /**
     * The forgiven float residue at the funded boundary, stated rather than
     * hidden. `fundedAtBoundary` returns the residue precisely so a page can
     * say it; a verdict that silently forgives a shortfall is a verdict the
     * reader cannot check.
     */
    boundaryNotice:
      "Năm cuối kỳ còn thiếu một phần cực nhỏ của một đồng ({residue} ₫). Đó là sai số làm tròn của số thực, không phải một năm không được chi trả, nên kế hoạch vẫn được tính là đủ — và phần dư đó được ghi ra đây thay vì bỏ qua trong im lặng.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc, và toàn kỳ không quá 100 năm. Các số tiền phải từ 0 trở lên và các mức lợi suất, lạm phát trong khoảng −100 đến 100.",
  },

  /**
   * Row 44's figure: the whole plan, in both readings of one balance.
   *
   * The exact reading is this chart's own `<details>` table, chosen by
   * `checkpoints()` in `lib/calc/charts/long-term-chart.ts` — mandatory dates
   * first (today, the retirement date, the depletion year, the horizon) and a
   * bounded fill after, so the end of the plan can never be dropped to hit a
   * row count. It replaces the seven-column every-five-years table this page
   * used to render, which measured 762 px inside a 300 px scroll frame at
   * 390 px: reading one row cost about two and a half screens of sideways
   * scrolling. Four columns with `mobileCards` is the same information a
   * reader can actually reach.
   */
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Kế hoạch hưu trí, từng năm một",
    series: "{label}",
    xAxis: "Năm kể từ hôm nay",
    yAxis: "Số dư ({unit})",
    assumptions: [
      "Trục ngang là số năm kể từ hôm nay, không phải tuổi: năm thứ 0 là số tiền bạn đang có, trước khi kế hoạch chạy.",
      "Hai đường là hai cách đếm cùng một số dư, không phải hai khoản tiền khác nhau.",
      "Mốc “nghỉ” là thời điểm đổi từ dành thêm sang rút tiền, và cũng là chỗ lợi suất chuyển từ mức trước sang mức sau.",
    ],
    tableCaption: "Số dư tại các mốc của kế hoạch",
    tableHint:
      "Hai cột cuối là hai cách đếm cùng một số dư. Các mốc bắt buộc — hôm nay, ngày nghỉ, năm cạn tiền và cuối kỳ — luôn có mặt; các dòng còn lại là mốc xen giữa cho dễ đọc.",
    periodColumn: "Năm thứ",
    unavailableReason:
      "Chưa vẽ được: kế hoạch cần các mốc tuổi hợp lệ và ít nhất hai năm dự phóng.",
    unavailableRecovery:
      "Hãy kiểm tra lại ba mốc tuổi — tuổi hiện tại ≤ tuổi dự định nghỉ < tuổi kết thúc — và các ô số tiền.",
    realPath: "Số dư theo giá hôm nay",
    nominalPath: "Số dư danh nghĩa, đồng của từng năm",
    retirementMarker: "Nghỉ ở tuổi {age} — năm thứ {year}",
    depletionMarker: "Cạn tiền ở tuổi {age} — năm thứ {year}",
    horizonMarker: "Hết kỳ dự phóng: tuổi {age} — năm thứ {year}",
    summaryFunded:
      "Đến tuổi {retirementAge} kế hoạch có {capital}, tương đương {realCapital} theo giá hôm nay, và giữ được đến hết tuổi {endAge}.",
    summaryDepleted:
      "Đến tuổi {retirementAge} kế hoạch có {capital}, tương đương {realCapital} theo giá hôm nay — nhưng cạn ở tuổi {depletionAge}, tức thiếu {yearsShort} năm so với kỳ dự phóng.",
    partialNote:
      "Năm cạn tiền vẫn trả được một phần: cần {planned}, trả được {paid}, còn thiếu {short}.",
    otherIncomeNote:
      "Ở mức chi tiêu này, thu nhập khác đã đủ nên danh mục không bị rút đến.",
    readingNote:
      "Hai đường là hai cách đếm cùng một số dư: khoảng cách giữa chúng là phần lạm phát đã lấy đi.",
    ageColumn: "Tuổi",
    yearColumn: "Năm thứ",
    realColumn: "Theo giá hôm nay",
    nominalColumn: "Danh nghĩa",
  },

  realNotice:
    "Với các giả định mặc định, số dư khi nghỉ là 10.902.417.350 ₫ — nhưng theo giá hôm nay nó chỉ tương đương 4.089.679.933 ₫, tức khoảng 37,5% của con số đó. Nhìn theo chiều rút tiền cũng vậy: năm rút đầu tiên là 543.830.612 ₫, nhưng nó chỉ mua được đúng lượng hàng hóa mà 204.000.000 ₫ mua hôm nay. Một người lập kế hoạch dựa trên con số danh nghĩa sẽ lập kế hoạch để mình nghèo, và đó là lý do công cụ luôn tính song song hai con số rồi đặt con số theo giá hôm nay lên làm kết quả chính.",

  formula: {
    title: "Cách tính",
    body: [
      "Giai đoạn tích lũy: mỗi năm cộng khoản dành thêm vào số dư rồi mới tính lợi nhuận, nên khoản đó được hưởng đủ một năm lợi suất — giống một khoản nộp vào tháng Một. Nếu thực tế bạn nộp mỗi tháng một ít, bạn sẽ về sau kế hoạch này một chút chứ không bao giờ vượt lên, vì mười một khoản trong số đó đến muộn.",
      "Giai đoạn rút tiền thì ngược lại: mỗi năm trừ khoản rút rồi mới tính lợi nhuận trên phần còn lại. Hai thứ tự ngược nhau là có chủ ý, và chỉ thứ tự thứ hai là lựa chọn thận trọng — tính lợi nhuận trước khi trừ khoản rút sẽ cấp vốn cho kế hoạch bằng lợi nhuận trên số tiền đã tiêu.",
      "Mọi số dư được báo theo hai cách đếm cùng một khoản tiền: con số danh nghĩa là đồng của chính năm đó, còn con số theo giá hôm nay là chính nó đã chia cho lạm phát tích lũy. Đó không phải hai khoản tiền, và khoảng cách giữa hai đường trên biểu đồ chính là phần lạm phát đã lấy đi.",
      "Mức chi tiêu mong muốn được nhập theo giá hôm nay, rồi công cụ tự quy đổi sang từng năm tương lai. Không quy đổi chính là cách một kế hoạch trông như đủ 30 năm rồi cạn ở năm thứ 20.",
      "Khoản rút của một năm không bao giờ vượt số dư còn lại. Nếu nhu cầu của một năm không được đáp ứng đủ thì năm đó được ghi là năm cạn tiền — và năm đó thường vẫn trả được một phần, nên công cụ báo cả phần đã trả và phần còn thiếu thay vì chỉ báo một cái tuổi.",
      "Mức chi giữ được đến hết kỳ được giải như một niên kim đầu kỳ theo lợi suất thực, đúng theo cách phép dự phóng lấy tiền ra: rút đầu năm rồi mới tính lợi nhuận. Dùng công thức niên kim cuối kỳ sẽ phóng đại mức chi an toàn theo tỷ lệ (1 + lợi suất thực) — đủ để một kế hoạch báo là đủ nhưng thực tế cạn sớm hai năm.",
      "Một mức chi được giải bằng công thức rồi đưa trở lại phép dự phóng có thể làm năm cuối cùng thiếu vài phần triệu của một đồng. Đó là sai số làm tròn của số thực, không phải một năm bị mất: công cụ chỉ bỏ qua khoản đó ở đúng năm cuối kỳ, chỉ khi nó không đáng kể so với nhu cầu của năm đó, và luôn ghi ra phần dư đã bỏ qua.",
    ],
    /**
     * Editor-selected, and deliberately few.
     *
     * Each phrase occurs in exactly ONE paragraph, because `CalculatorPage`
     * applies the whole list to every paragraph: a phrase appearing in five of
     * them would be emphasised five times, which is the "bold everything"
     * failure the mechanism exists to avoid. Each marks the DISTINCTION its
     * paragraph is about, not the figures — there are no figures in this block
     * on purpose, since the figures are in the result rows above it.
     */
    emphasis: [
      "được hưởng đủ một năm lợi suất",
      "chỉ thứ tự thứ hai là lựa chọn thận trọng",
      "hai cách đếm cùng một khoản tiền",
      "Đó không phải hai khoản tiền",
      "cạn ở năm thứ 20",
      "thường vẫn trả được một phần",
      "niên kim đầu kỳ",
      "sai số làm tròn của số thực, không phải một năm bị mất",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao số dư theo giá hôm nay lại thấp hơn nhiều thế?",
        a: "Vì lạm phát tác động suốt 25 năm tích lũy. Với lạm phát 4%/năm, giá cả sau 25 năm bằng 1,04^25 = 2,67 lần hôm nay, nên 10.902.417.350 ₫ ở tuổi 60 chỉ mua được lượng hàng hóa mà 4.089.679.933 ₫ mua hôm nay — khoảng 37,5%. Con số danh nghĩa không sai, nhưng nó không phải con số để lập kế hoạch. Công cụ hiển thị cả hai và đặt con số theo giá hôm nay làm kết quả chính.",
      },
      {
        q: "Nên dự phóng đến tuổi bao nhiêu?",
        a: "Cao hơn mốc bạn nghĩ là vừa đủ. Công cụ này không dùng bảng tuổi thọ nào và không đưa ra con số nào cho bạn: tuổi kết thúc là một ô để bạn nhập, và ý nghĩa của nó là “nếu tôi sống đến tuổi này thì tiền còn không”. Hãy thử nhập thêm 5 hoặc 10 năm rồi xem kết quả dịch chuyển thế nào — nếu kế hoạch đổi từ đủ sang không đủ trong khoảng đó, bạn vừa biết được điều đáng biết nhất về nó. Trang “Tiêu được bao nhiêu” còn vẽ sẵn một nhánh sống lâu hơn 5 năm so với mốc bạn nhập, ở cùng mức chi tiêu.",
      },
      {
        q: "Vì sao lợi suất sau khi nghỉ thường được đặt thấp hơn?",
        a: "Vì phần lớn danh mục thường dịch dần sang tài sản ít biến động khi gần và sau thời điểm nghỉ. Lý do không chỉ là khẩu vị rủi ro: người đang rút tiền chịu thêm rủi ro về thứ tự các năm được và mất — một đợt giảm mạnh ngay đầu giai đoạn rút gây thiệt hại lớn hơn nhiều so với cùng đợt giảm đó xảy ra muộn hơn, vì tài sản bị bán ra đúng lúc giá thấp. Cả hai mức lợi suất ở đây đều do bạn nhập, và công cụ coi chúng là đều đặn mỗi năm, nên nó không mô phỏng rủi ro đó. Hãy xem đây là một dự phóng thuận lợi.",
      },
      {
        q: "Tỷ lệ rút năm đầu 4,99% có an toàn không?",
        a: "Đây là một chỉ dấu, không phải một kết luận, và công cụ không so nó với bất kỳ ngưỡng nào — làm vậy sẽ là một khẳng định về thị trường mà trang này không có cơ sở để đưa ra. Con số đáng dùng nằm ngay bên dưới: “mức chi giữ được đến hết” được giải từ chính số vốn và chính các giả định bạn nhập, nên nó trả lời cùng câu hỏi bằng tiền thay vì bằng tỷ lệ. Trên các giả định mặc định, mức đó là 219.057.403 ₫/năm so với 240.000.000 ₫ bạn muốn — thiếu 20.942.597 ₫ mỗi năm.",
      },
      {
        q: "Công cụ có trừ thuế và phí không?",
        a: "Không. Phép tính không trừ thuế và không trừ phí quản lý danh mục, nên số tiền rút ở đây là số gộp. Nếu những khoản bạn đang đầu tư có chịu thuế hay phí khi bán hoặc khi nhận lãi, chi tiêu thực tế của bạn sẽ thấp hơn con số hiển thị: cách xử lý đơn giản là nhập mức chi tiêu mong muốn cao hơn tương ứng, hoặc hạ mức lợi suất bạn giả định. Công cụ không mô phỏng quy định thuế của bất kỳ nước nào.",
      },
      {
        q: "Bốn trang kế hoạch dài hạn khác nhau ở đâu?",
        a: "Chúng dùng chung một bộ giả định và một phép dự phóng, rồi mỗi trang mở đầu bằng một câu hỏi khác: trang này vẽ kế hoạch chạy ra sao từng năm một; “Cần dành bao nhiêu” giải ra khoản phải dành thêm mỗi năm; “Thiếu bao nhiêu” đo khoảng cách vốn và định giá ba cách bù; “Tiêu được bao nhiêu” tính mức chi mà số vốn duy trì được. Vì cả bốn đọc từ cùng một kết quả, chúng không thể đưa ra những con số trái nhau về số vốn khi nghỉ hay về năm tiền cạn.",
      },
    ],
  },
} as const;
