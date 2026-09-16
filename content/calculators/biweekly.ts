// Copy for /cong-cu/tra-no-hai-tuan/ — the bi-weekly repayment calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// `prepaymentNotice` is load-bearing for Vietnam: most domestic lenders charge
// a prepayment penalty, and paying fortnightly is a form of prepaying. Showing
// a saving without mentioning that fee would overstate the benefit.
//
// THE REFRAME, AND WHERE ITS FIGURES CAME FROM.
//
// This page used to end its explanation with "hai yếu tố này cộng lại tạo ra
// khoản tiết kiệm" — paying MORE and paying MORE OFTEN presented as two
// comparable contributors. True as arithmetic, misleading as a proportion.
// `computeBiweekly().split` now separates them, and at the shipped defaults
// (2.000.000.000 ₫, 8,5%/năm, 240 tháng) the module reports:
//   tổng tiết kiệm            442.837.513 ₫
//   do trả thêm mỗi năm       434.935.373 ₫   (98,2%)
//   do trả thường xuyên hơn     7.902.140 ₫   ( 1,8%)
// Measured the other way round — the extra instalment first, at monthly
// frequency — it is 98,4% / 1,6%, so the conclusion is order-robust even
// though the two figures are not. Every figure quoted in the copy below is
// read off the module at those defaults; re-read it if a default moves.
//
// The consequence is the row's whole point: the fortnightly SCHEDULE is
// almost incidental, and a borrower whose bank has no fortnightly schedule —
// most banks here — gets nearly all of the saving by paying extra principal
// on the ordinary monthly one. That route is `/cong-cu/vay-mua-nha/`'s
// extra-payment mode, linked through `TOOL_NEXT_STEPS`.

export const BIWEEKLY = {
  slug: "/cong-cu/tra-no-hai-tuan",

  pageTitle: "Trả nợ hai tuần một lần tiết kiệm bao nhiêu?",
  metaTitle: "Trả nợ hai tuần một lần — Tiết kiệm lãi và rút ngắn kỳ hạn",
  metaDescription:
    "So sánh trả nợ hằng tháng với trả nửa kỳ mỗi hai tuần: số tiền lãi tiết kiệm được và số năm rút ngắn. Công cụ miễn phí của FinHome.",

  lede:
    "Thay vì trả một lần mỗi tháng, bạn trả một nửa số đó mỗi hai tuần — một năm có 26 kỳ, tương đương 13 kỳ hằng tháng thay vì 12. Công cụ tách khoản lãi tiết kiệm được thành hai phần, và câu trả lời nằm ở phần lớn hơn: gần như toàn bộ đến từ số tiền trả thêm mỗi năm, không phải từ việc trả thường xuyên hơn.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Nhập số tiền vay, ví dụ 2.000.000.000.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",
    termHelp: "Kỳ hạn theo hợp đồng, tính theo cách trả hằng tháng.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",

    resultTitle: "So sánh hai cách trả",
    monthlyPaymentLabel: "Trả hằng tháng",
    biweeklyPaymentLabel: "Trả mỗi hai tuần",
    monthlyInterestLabel: "Tổng lãi khi trả hằng tháng",
    biweeklyInterestLabel: "Tổng lãi khi trả hai tuần",
    savingLabel: "Tiền lãi tiết kiệm được",
    payoffLabel: "Trả xong sau",
    payoffUnit: "năm",
    monthsSavedLabel: "Rút ngắn được",
    monthsUnit: "tháng",
    periodsLabel: "Số kỳ trả",
    periodsUnit: "kỳ",

    // The decomposition, in its own non-live group. Labels are full phrases
    // rather than ≤12-character stubs on purpose: `ResultRow` stacks the label
    // ABOVE the value below `md`, each with the full panel width, so a phone
    // label wraps as prose and does not compete with a nine-digit figure. The
    // ≤12-character budget applies to a `mobileCards` card and a `<th>`, which
    // this group is neither.
    // Distinct from `formula.title`, which is "Khoản tiết kiệm đến từ đâu".
    // They were the same string, which put two `h2`s with identical text on
    // one page — a duplicate landmark for anyone navigating by heading, and
    // an ambiguous `indexOf` marker for any markup assertion that wants to
    // bound one of the two regions. The figures and the explanation of the
    // figures are different sections and now say so.
    splitTitle: "Tách hai nguyên nhân",
    extraPaymentSavingLabel: "Do trả thêm mỗi năm",
    frequencySavingLabel: "Do trả thường xuyên hơn",
    samePaymentLabel: "Lịch trung gian: mỗi hai tuần trả",
    sameInterestLabel: "Lịch trung gian: tổng lãi",
    splitUnavailable:
      "Với kỳ hạn này, công cụ không dựng được lịch trung gian giữ nguyên tổng tiền trả mỗi năm, nên không tách được khoản tiết kiệm. Khoản trả mỗi kỳ của lịch đó sẽ không đủ bù tiền lãi. Đây là “không tính được”, không phải “bằng 0”.",

    detailTitle: "Chi tiết",
  },

  // No fee range and no "phần lớn ngân hàng". This sentence used to read
  // "Phần lớn ngân hàng tại Việt Nam thu phí trả nợ trước hạn, thường khoảng
  // 1–3% số tiền trả trước" — the same invented universal a browser check
  // already had removed from `loan.ts:149`, where `loan.test.ts:225-232`
  // now sweeps for both tokens. It was still here. What is true is that the
  // tool does not model the fee, the contract decides it, and not every bank
  // offers a fortnightly schedule at all.
  prepaymentNotice:
    "Trả hai tuần một lần thực chất là trả nợ trước hạn, và công cụ chưa tính phí trả nợ trước hạn — khoản tiết kiệm ở dưới là con số trước phí. Mức phí và thời gian áp dụng do hợp đồng của bạn quy định, và có hợp đồng không thu. Không phải ngân hàng nào cũng cho phép lịch trả hai tuần. Hãy hỏi ngân hàng cả hai điều này trước khi coi khoản tiết kiệm là chắc chắn.",

  formula: {
    title: "Khoản tiết kiệm đến từ đâu",
    body: [
      "Một năm có 52 tuần, tức 26 kỳ hai tuần. Nếu mỗi kỳ bạn trả một nửa khoản trả hằng tháng, tổng số tiền trả trong năm bằng 13 khoản trả hằng tháng, trong khi trả theo tháng chỉ là 12 khoản. Phần chênh lệch đó đi thẳng vào gốc. Ngoài ra dư nợ được giảm sớm hơn, hai tuần một lần thay vì mỗi tháng một lần, nên tiền lãi tính trên dư nợ cũng thấp hơn.",
      "Hai yếu tố đó không ngang nhau, và trang này từng nói như thể chúng ngang nhau. Với khoản vay mặc định 2 tỷ, lãi 8,5%/năm, kỳ hạn 20 năm, công cụ tách 442.837.513 ₫ tiền lãi tiết kiệm được thành 434.935.373 ₫ do trả thêm mỗi năm và 7.902.140 ₫ do trả thường xuyên hơn. Tỷ lệ là 98,2% và 1,8%: khoản tiết kiệm gần như hoàn toàn là chuyện số tiền, không phải chuyện lịch trả.",
      "Cách tách: công cụ dựng thêm một lịch trả trung gian, vẫn trả mỗi hai tuần nhưng mỗi kỳ chỉ trả 12/26 khoản trả hằng tháng, nên tổng tiền trả trong một năm bằng đúng lịch hằng tháng. Chênh lệch lãi từ lịch hằng tháng sang lịch trung gian là phần do tần suất, vì chỉ có thời điểm trả thay đổi; chênh lệch từ lịch trung gian sang lịch hai tuần đầy đủ là phần do trả thêm, vì chỉ có số tiền thay đổi. Hai phần cộng lại đúng bằng khoản tiết kiệm tổng, nên đây là một phép tách chứ không phải hai lần ước lượng.",
      "Mọi phép tách hai yếu tố đều phụ thuộc thứ tự đo, và trang này chọn thứ tự bất lợi cho chính lập luận của nó: phần tần suất được đo riêng, còn phần tương tác giữa hai yếu tố dồn vào phần trả thêm. Nếu đo ngược lại, tỷ lệ là 98,4% và 1,6%. Kết luận không đổi, nhưng hai con số thì đổi, nên đừng đọc chúng như số đo chính xác. Phần tần suất cũng mang theo kỳ tính lãi: lịch hai tuần tính lãi bằng lãi suất năm chia cho 26, ghép 26 lần một năm thay vì 12, và điều đó không tách được khỏi việc trả hai tuần một lần.",
      "Điều này đổi việc cần làm. Nếu ngân hàng của bạn không có lịch trả hai tuần — phần lớn ngân hàng tại Việt Nam không có — bạn vẫn lấy được gần như toàn bộ khoản tiết kiệm bằng cách giữ lịch trả hằng tháng và trả thêm vào gốc mỗi tháng một khoản bằng khoảng một phần mười hai kỳ trả. Công cụ tính khoản vay mua nhà có chế độ trả thêm gốc để thử đúng phép tính đó, và nó nằm ở phần bước tiếp theo bên dưới.",
      "Công cụ tính lãi mỗi kỳ hai tuần bằng lãi suất năm chia cho 26, rồi chạy bảng trả nợ đến khi dư nợ về 0, và đem so với bảng trả nợ hằng tháng thông thường.",
    ],
    // Editor-selected phrases, as DATA beside the paragraph — never markup
    // inside it. One phrase per paragraph except the two in paragraph 1,
    // which carry the finding itself. Measured with `lib/prose-emphasis.ts`:
    // `missingPhrases` empty, `emphasisShare` 6,2% against the 0,2 cap, and
    // below the landed rows' 12,6–13,6% because five phrases across six
    // paragraphs is as much as this argument needs.
    //
    // THIS ONLY RENDERS BECAUSE THE ROUTE THREADS IT. `tra-no-hai-tuan` is
    // one of the three pre-shell routes that render their own body, so it
    // does not inherit `CalculatorPage`'s `ProseText`. Threading it through
    // `app/cong-cu/tra-no-hai-tuan/page.tsx`'s local `Prose` helper is half
    // of this change and `biweekly.test.ts` asserts the rendered `<strong>`,
    // because a declared phrase that never reaches a reader is a claim about
    // markup rather than a reading treatment.
    emphasis: [
      "không ngang nhau",
      "gần như hoàn toàn là chuyện số tiền",
      "một phép tách chứ không phải hai lần ước lượng",
      "phụ thuộc thứ tự đo",
      "trả thêm vào gốc mỗi tháng",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ngân hàng ở Việt Nam có cho trả hai tuần một lần không?",
        a: "Không phải ngân hàng nào cũng có lịch trả hai tuần. Nếu ngân hàng của bạn không hỗ trợ, bạn có thể đạt hiệu quả tương tự bằng cách giữ lịch trả hằng tháng nhưng trả thêm vào gốc mỗi tháng một khoản bằng khoảng một phần mười hai kỳ trả. Hãy hỏi ngân hàng về phí trả nợ trước hạn trước khi làm.",
      },
      {
        // The row's own question, answered with the number instead of a
        // reassurance. Kept second so it sits next to the "bank may not
        // support it" answer, which is the practical consequence.
        q: "Trả thường xuyên hơn mà không trả thêm tiền thì có lợi không?",
        a: "Gần như không. Nếu giữ nguyên tổng số tiền trả trong một năm và chỉ chia nhỏ ra trả mỗi hai tuần, với khoản vay mặc định bạn tiết kiệm 7.902.140 ₫ trên tổng 442.837.513 ₫ — khoảng 1,8%. Phần còn lại đến từ việc mỗi năm bạn trả thêm khoảng một kỳ. Hai lý do khiến phần tần suất nhỏ như vậy: dư nợ chỉ giảm sớm hơn trung bình khoảng nửa tháng, và lịch hai tuần lại tính lãi 26 lần một năm thay vì 12, nên hai chiều gần như triệt tiêu nhau. Nói cách khác, lịch trả không phải là điều đáng theo đuổi — số tiền mới là.",
      },
      {
        q: "Vì sao tiết kiệm được nhiều hơn tôi tưởng?",
        a: "Vì khoản trả thêm mỗi năm đi trực tiếp vào gốc, mà tiền lãi luôn tính trên dư nợ còn lại. Mỗi đồng gốc trả sớm đều tiết kiệm toàn bộ phần lãi mà đồng đó sẽ phát sinh trong những năm còn lại của khoản vay.",
      },
      {
        q: "Có rủi ro gì khi chọn cách này?",
        a: "Rủi ro chính là phí trả nợ trước hạn và áp lực dòng tiền: bạn thực tế trả nhiều hơn khoảng một kỳ mỗi năm. Nếu quỹ dự phòng của bạn còn mỏng, việc giữ tiền mặt có thể quan trọng hơn khoản lãi tiết kiệm được.",
      },
    ],
  },
} as const;
