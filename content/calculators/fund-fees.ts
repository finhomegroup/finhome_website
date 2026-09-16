// Copy for /cong-cu/phi-quy-dau-tu/ — the cost of fund fees.
//
// Original FinHome copy.
//
// The page has one job: turn "2% một năm" from a rounding error into a
// number. It does that by running the same plan twice — once at the gross
// return, once net of every charge — and reporting the gap. A single
// "value after fees" figure hides the loss because the reader has nothing to
// compare it against.
//
// Figures quoted are the module's own output for 100 triệu ban đầu, góp
// 5 triệu/tháng trong 240 tháng, lợi nhuận gộp 10%/năm, phí mua 1%, phí quản
// lý 2%/năm: bỏ vào 1.300.000.000 ₫; cuối kỳ 3.197.188.632 ₫ so với
// 4.264.046.135 ₫ nếu không phí → mất 1.066.857.503 ₫, tức 35,99% toàn bộ
// lợi nhuận. Phí quản lý 515.853.900 ₫, phí mua 13.000.000 ₫. Lợi nhuận
// thực tế mỗi năm 7,719% so với 10,000% nếu không phí — thấp hơn 2,281 điểm
// phần trăm.

export const FUND_FEES = {
  slug: "/cong-cu/phi-quy-dau-tu",

  pageTitle: "Phí quỹ đầu tư: 2% một năm lấy đi bao nhiêu?",
  metaTitle: "Tính phí quỹ đầu tư — Phần lợi nhuận bị phí ăn mất",
  metaDescription:
    "Tính số tiền phí quản lý, phí mua và phí bán lấy đi khỏi khoản đầu tư của bạn sau nhiều năm, và bao nhiêu phần trăm lợi nhuận bị mất. Công cụ miễn phí của FinHome.",

  lede:
    "Phí quản lý nghe như một khoản làm tròn và hoạt động như một người góp vốn thứ ba. Lý do là nó tính trên TÀI SẢN, nên nó lấy không chỉ phần lãi năm nay mà cả toàn bộ phần lãi mà số tiền đó lẽ ra còn sinh ra trong những năm sau.",

  form: {
    planGroup: "Kế hoạch đầu tư",
    initialLabel: "Số tiền ban đầu",
    initialUnit: "₫",
    initialHelp: "Khoản đầu tư một lần lúc bắt đầu. Có thể để 0.",
    initialInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultInitial: "100.000.000",

    contributionLabel: "Góp thêm mỗi tháng",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền nộp vào cuối mỗi tháng. Có thể để 0 nếu bạn chỉ đầu tư một lần.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultContribution: "5.000.000",

    // ORIGINAL ROW 27: "dùng mốc cần mua nhà". The horizon is the date the
    // money is needed, not an abstract investing period — that is what makes
    // the exit fee land on a specific day and what the next-step link uses.
    monthsLabel: "Đến khi cần tiền là bao nhiêu tháng nữa",
    monthsHelp:
      "Tính đến mốc bạn thực sự cần dùng khoản này — ví dụ ngày dự kiến trả tiền mua nhà. 3 năm là 36 tháng, 20 năm là 240 tháng. Phí bán được trừ đúng tại mốc này, nên mốc bạn chọn làm đổi con số nhận về. Tối đa 1.200 tháng.",
    monthsInvalid:
      "Vui lòng nhập số nguyên tháng từ 1 đến 1.200.",
    defaultMonths: "240",

    grossReturnLabel: "Lợi nhuận trước phí",
    grossReturnUnit: "%/năm",
    grossReturnHelp:
      "Lợi nhuận quỹ đạt được TRƯỚC khi trừ phí. Nếu quỹ công bố lợi nhuận đã trừ phí quản lý thì đừng nhập thêm phí quản lý bên dưới.",
    grossReturnInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultGrossReturn: "10",

    feeGroup: "Biểu phí",
    entryFeeLabel: "Phí mua",
    entryFeeUnit: "% mỗi lần nộp",
    entryFeeHelp:
      "Trừ ngay trên mỗi số tiền bạn nộp vào, gồm cả khoản ban đầu và từng khoản góp thêm.",
    entryFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultEntryFee: "1",

    managementFeeLabel: "Phí quản lý",
    managementFeeUnit: "%/năm tài sản",
    managementFeeHelp:
      "Tính trên giá trị tài sản mỗi năm. Đây là khoản đắt nhất, và cũng là khoản dễ bị coi nhẹ nhất.",
    managementFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultManagementFee: "2",

    exitFeeLabel: "Phí bán",
    exitFeeUnit: "% giá trị cuối kỳ",
    exitFeeHelp:
      "Thu một lần khi bạn rút. Nhiều quỹ giảm dần theo thời gian nắm giữ và miễn sau một thời hạn — nhập 0 nếu bạn giữ đủ lâu để được miễn.",
    exitFeeInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultExitFee: "0",

    resultTitle: "Phí lấy đi bao nhiêu",
    profitLostLabel: "Phần lợi nhuận bị phí ăn mất",
    valueLostLabel: "Số tiền bị mất",
    netValueLabel: "Giá trị cuối kỳ sau phí",

    compareTitle: "So với không có phí",
    grossValueLabel: "Giá trị cuối kỳ nếu không phí",
    contributedLabel: "Tổng số tiền bạn bỏ vào",
    netProfitLabel: "Lợi nhuận sau phí",
    grossProfitLabel: "Lợi nhuận nếu không phí",
    valueLostPercentLabel: "Số tiền mất so với giá trị không phí",

    detailTitle: "Chi tiết phí",
    managementFeesLabel: "Tổng phí quản lý",
    entryFeesLabel: "Tổng phí mua",
    exitFeeResultLabel: "Phí bán",
    totalFeesLabel: "Tổng phí đã trả",
    netAnnualLabel: "Lợi nhuận thực tế mỗi năm",
    grossAnnualLabel: "Lợi nhuận mỗi năm nếu không phí",
    dragLabel: "Chênh lệch",
    pointsUnit: "điểm %",

    noProfitNotice:
      "Không có lợi nhuận trước phí nên không tính được tỷ lệ lợi nhuận bị mất. Các con số phí vẫn đúng — và đây là trường hợp đáng chú ý: phí quản lý vẫn bị thu đầy đủ dù quỹ không sinh lời.",
    nothingInvestedNotice:
      "Cả số tiền ban đầu và khoản góp thêm đều bằng 0, nên không có gì để tính phí trên đó. Hãy nhập một trong hai ô.",
  },

  // ORIGINAL ROW 27's visual: "hai đường giá trị có/không phí", on the
  // horizon the reader needs the money. The summary leads with MONEY, per the
  // row's "đặt chênh lệch sau phí trước thuật ngữ".
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Hai đường giá trị: có phí và không phí, đến mốc bạn cần tiền",
    series: "{label}",
    xAxis: "Tháng kể từ khi bắt đầu",
    yAxis: "Giá trị khoản đầu tư ({unit})",
    assumptions: [
      "Mọi con số do bạn nhập: số tiền, mức góp, mốc cần tiền và cả ba loại phí.",
      "Lợi nhuận là mức HIỆU DỤNG mỗi năm bạn giả định, quy về tháng theo lũy thừa. Đây là giả định, không phải cam kết, và thị trường không đi theo một đường thẳng như hình vẽ.",
      "Phí mua trừ trên từng khoản nộp, phí quản lý cộng dồn theo tháng trên số dư, phí bán trừ ĐÚNG MỘT LẦN tại mốc bạn chọn.",
      "Đường vẽ đến hết mốc đã chọn và dừng ở số dư TRƯỚC khi trừ phí bán. Số tiền thực nhận nằm ở bảng bên dưới.",
      "Chưa tính thuế và chưa tính lạm phát.",
    ],
    tableCaption: "Tại mốc bạn cần tiền",
    // NEUTRAL ON PURPOSE, twice over. This hint used to say the two endpoint
    // rows "là hai con số khác nhau" — false when the exit fee is 0, where
    // they are the same figure — and that the value gap is larger than the
    // fees charged, which is false whenever the return is negative. Both are
    // now stated as what to compare rather than as a ranking; the figure's
    // own summary names the direction from the reader's actual numbers.
    tableHint:
      "Hai dòng “giá trị trước khi bán” và “tiền nhận về” chênh nhau đúng bằng phí bán, nên chúng chỉ trùng nhau khi bạn để phí bán bằng 0. Dòng “khoảng cách giá trị” và dòng “tổng phí đã thu” cũng là hai câu hỏi khác nhau: một là bạn mất bao nhiêu TÀI SẢN, một là bạn đã trả bao nhiêu PHÍ — phần tiền bị lấy đi còn kéo theo phần lãi hoặc phần lỗ mà nó lẽ ra sinh ra. Phần tóm tắt ngay trên hình cho biết ở kịch bản của bạn con số nào lớn hơn.",
    periodColumn: "Tháng",
    unavailableReason:
      "Chưa vẽ được: cần số tiền lớn hơn 0 ở một trong hai ô đầu và số tháng hợp lệ.",
    unavailableRecovery:
      "Hãy nhập số tiền ban đầu hoặc mức góp mỗi tháng, và số tháng từ 1 đến 1.200.",
    grossPath: "Nếu không có phí nào",
    netPath: "Sau khi trừ phí",
    exitMarker: "Mốc cần tiền: trừ phí bán {fee}",
    exitMarkerNone: "Mốc cần tiền",
    summary:
      "Đến tháng {months}: nếu không phí bạn có {gross}, sau phí bạn nhận về {net} — chênh nhau {gap}.",
    // THREE SENTENCES, ONE PICKED FROM THE FIGURES. The old single sentence
    // asserted the gap was always the larger number "và phần dư ra là số
    // lãi". With a negative return it is the smaller one — 50 triệu of gap
    // against 100 triệu of fees on the reviewed fixture — because the money
    // taken as a fee would have fallen too. See `fund-fees-chart.ts`.
    gapNote:
      "Tổng phí đã thu là {fees}; khoảng cách giá trị cuối kỳ là {gap}.",
    gapAboveFees:
      "Ở kịch bản này khoảng cách LỚN HƠN số phí đã trả: phần dư ra là phần lãi mà số tiền phí lẽ ra còn sinh thêm nếu nó ở lại trong quỹ.",
    gapBelowFees:
      "Ở kịch bản này khoảng cách NHỎ HƠN số phí đã trả, vì lợi nhuận bạn giả định đang âm: số tiền bị lấy làm phí nếu ở lại trong quỹ cũng sẽ lỗ theo. Phí vẫn bị thu đủ — đó mới là điều đáng chú ý ở một năm giảm giá.",
    gapEqualsFees:
      "Ở kịch bản này hai con số bằng nhau: với mức lợi nhuận bạn giả định, số tiền bị lấy làm phí không sinh thêm cũng không lỗ thêm.",
    exitNote:
      "Đường trong hình dừng ở {beforeExit} — đó là số dư trước khi bán. Sau khi trừ phí bán, số tiền về tay là {afterExit}.",
    noFeeNote:
      "Bạn đang nhập cả ba loại phí bằng 0, nên hai đường trùng nhau — đó cũng là cách kiểm tra công cụ.",
    itemColumn: "Khoản",
    amountColumn: "Số tiền",
    paidRow: "Tổng tiền bạn bỏ vào",
    grossRow: "Giá trị nếu không có phí",
    beforeExitRow: "Giá trị trước khi bán",
    exitFeeRow: "Phí bán tại mốc này",
    afterExitRow: "Tiền thực nhận về tay",
    gapRow: "Khoảng cách giá trị",
    feesRow: "Tổng phí đã thu",
  },

  compoundNotice:
    "Với kế hoạch mặc định — 100 triệu ban đầu, 5 triệu mỗi tháng trong 20 năm, lợi nhuận gộp 10%/năm — phí quản lý 2%/năm cộng phí mua 1% CÙNG NHAU lấy đi 1.066.857.503 ₫. Đó là 35,99% toàn bộ lợi nhuận bạn lẽ ra có được. Không phải 2%, không phải 20%: gần 36%. Lý do là phí tính trên tài sản, nên mỗi đồng phí bị lấy hôm nay cũng lấy theo toàn bộ phần lãi mà nó còn sinh ra trong những năm còn lại. Đây là lý do chênh lệch phí giữa hai quỹ đáng quan tâm hơn chênh lệch lợi nhuận một năm.",

  formula: {
    title: "Cách tính",
    body: [
      "Công cụ chạy đúng một kế hoạch HAI lần: một lần ở lợi nhuận gộp không phí, một lần trừ đủ ba loại phí. Con số đáng đọc là khoảng cách giữa hai kết quả, vì một mình con số “giá trị sau phí” không cho bạn cái gì để so.",
      "Phí mua trừ ngay trên mỗi khoản nộp vào: 1% của 1.300.000.000 ₫ tổng nộp là 13.000.000 ₫. Nhỏ, và nó không phải vấn đề.",
      "Phí quản lý được tính dồn theo tháng lên số dư, với hệ số (1 − phí)^(1/12) mỗi tháng để đủ 12 tháng đúng bằng mức phí năm. Với mặc định, tổng phí quản lý trong 20 năm là 515.853.900 ₫ — gấp gần 40 lần phí mua.",
      // CORRECTED ATTRIBUTION. This said 515.853.900 ₫ of MANAGEMENT fee
      // "làm mất 1.066.857.503 ₫", but the default plan also pays
      // 13.000.000 ₫ of entry fee, so the gap is the effect of BOTH — plus
      // the exit fee wherever one is entered. The arithmetic is unchanged;
      // what was wrong was assigning the whole gap to one of the fees.
      "Nhưng tổng phí thực trả của kế hoạch mặc định — 515.853.900 ₫ phí quản lý CỘNG 13.000.000 ₫ phí mua, tức 528.853.900 ₫ — lại làm mất 1.066.857.503 ₫ giá trị. Phần chênh là lãi kép trên số phí đã bị lấy: mỗi đồng phí trả năm thứ nhất còn mất thêm 19 năm sinh lãi. Khoảng cách này là tác động CHUNG của các loại phí bạn nhập (mua, quản lý và phí bán nếu có), không phải của riêng phí quản lý — muốn biết riêng phí quản lý lấy đi bao nhiêu, hãy đặt hai ô phí còn lại về 0 rồi đọc lại. Đây là toàn bộ nội dung của trang này.",
      "Lợi nhuận thực tế mỗi năm là lãi suất nội tại của đúng dòng tiền của bạn: mức lãi mà tại đó giá trị hiện tại của khoản ban đầu cộng toàn bộ khoản góp hằng tháng vừa bằng giá trị cuối kỳ. Định nghĩa này quan trọng vì tiền được nộp rải ra suốt 240 tháng chứ không phải một lần lúc đầu. Với mặc định: 7,719%/năm sau phí so với 10,000%/năm nếu không phí — thấp hơn 2,281 điểm phần trăm, tức HƠN mức phí quản lý 2%/năm, vì còn cộng thêm phí mua 1% trên mỗi lần nộp.",
      "Tách riêng từng loại phí: phí quản lý 2%/năm một mình lấy 2,200 điểm (còn 7,800%/năm), phí mua 1% một mình lấy 0,079 điểm (còn 9,921%/năm); đi cùng nhau thì thành 2,281 điểm — nhiều hơn tổng của hai phần một chút, vì hai loại phí chồng lên nhau. Nhập cả ba ô phí bằng 0 thì con số này trả về đúng 10%/năm bạn đã nhập, và đó là cách kiểm tra công cụ.",
      // CORRECTED. This said the two tools agree in the fee-free case. They
      // do not at the same displayed percentage: this page reads the return
      // as an EFFECTIVE annual rate and converts it geometrically, while the
      // savings tool reads a NOMINAL rate and divides by 12. An independent
      // audit computed the equivalence — at an effective 6% here, the
      // matching savings input is 5,841060678411658% — and both conventions
      // are kept, because forcing one engine to match the other would break a
      // documented contract on the other page.
      "Khoản góp của mỗi tháng được nộp vào CUỐI tháng và chưa chịu phí quản lý trong tháng đó, vì nó chưa được đầu tư. Thời điểm nộp này giống công cụ mục tiêu tiết kiệm, nhưng CÁCH ĐỌC LÃI SUẤT thì khác: trang này hiểu con số bạn nhập là lợi nhuận HIỆU DỤNG mỗi năm và quy về tháng theo lũy thừa (1 + r)^(1/12) − 1, còn công cụ mục tiêu tiết kiệm hiểu đó là lãi DANH NGHĨA và chia 12. Vì vậy cùng một con số phần trăm không cho cùng kết quả ở hai trang, kể cả khi không có phí nào: để khớp mức hiệu dụng 6% ở đây, ô lãi của công cụ tiết kiệm phải nhập 5,841061%. Cả hai quy ước đều được ghi rõ tại chỗ và không trang nào bị đổi để trông giống trang kia.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lợi nhuận quỹ công bố là trước hay sau phí?",
        // CORRECTED. This offered "cộng lại phí quản lý vào lợi nhuận công
        // bố" as a second route, and that does not invert this engine's
        // retention: 10% gross with a 2% annual retention gives
        // 1,10 × 0,98 − 1 = 7,8% net, and 7,8 + 2 is 9,8 — not the 10 you
        // started from. Addition understates the gross whenever both rates
        // are non-trivial, so the shortcut is gone and only the exact route
        // and the safe route remain.
        a: "Hầu hết quỹ mở tại Việt Nam công bố lợi nhuận theo giá trị tài sản ròng, tức ĐÃ trừ phí quản lý nhưng CHƯA trừ phí mua và phí bán. Nếu bạn nhập con số đó vào ô lợi nhuận trước phí rồi lại nhập phí quản lý, bạn đang trừ hai lần. CÁCH DÙNG AN TOÀN: nhập đúng con số quỹ công bố và để ô phí quản lý bằng 0 — khi đó trang vẫn tính đủ phí mua và phí bán, chỉ không tính lại phí quản lý. Đừng quy ngược bằng cách CỘNG phí quản lý vào lợi nhuận công bố: phí ở đây được trừ theo tỷ lệ nhân, không phải theo phép trừ, nên 10% gộp với phí 2%/năm cho ra (1,10 × 0,98 − 1) = 7,8% sau phí — mà 7,8 + 2 là 9,8%, không phải 10%. Nếu bạn cần đúng con số gộp, hãy lấy từ chính bản công bố của quỹ (hoặc phương pháp tính của họ) rồi nhập vào ô lợi nhuận trước phí cùng với mức phí quản lý.",
      },
      {
        // REWRITTEN. This used to quote three fee ranges for Vietnamese
        // funds as current fact — 1,5–2,5% active equity, 0,5–1,2% bond,
        // under 0,8% index. Nobody here has verified any of them against a
        // dated fee schedule, and a static export cannot check one. The
        // usable part of the answer never depended on the ranges: it is that
        // the fee is the input the reader can compare and change.
        q: "Phí bao nhiêu là hợp lý?",
        a: "Trang này không đưa ra mức nào là hợp lý, và không có con số phí nào ở đây được lấy từ biểu phí của quỹ nào — mọi mức phí là do bạn nhập. Cách dùng có ích hơn một khoảng tham chiếu: lấy biểu phí của đúng những quỹ bạn đang cân nhắc, chạy công cụ một lần cho mỗi quỹ với CÙNG kế hoạch góp và cùng lợi nhuận giả định, rồi so hai con số cuối kỳ. Khi đó phần chênh lệch bạn thấy là do phí chứ không do giả định. Biểu phí là thứ ghi trong bản cáo bạch và bạn đọc được trước khi xuống tiền; lợi nhuận thì không ai biết trước.",
      },
      {
        q: "Vì sao 529 triệu phí lại làm mất hơn 1 tỷ?",
        a: "Vì mỗi đồng phí bị lấy đi không chỉ mất đồng đó mà mất cả phần lãi nó còn sinh ra trong những năm còn lại. Một đồng phí trả ở năm thứ nhất, nếu được giữ lại và sinh lãi 10%/năm trong 19 năm, sẽ thành hơn 6 đồng. Cộng dồn qua 240 tháng thì tổng thiệt hại gấp khoảng đôi số phí đã nộp. Lưu ý con số nào là con số nào: trong ví dụ mặc định, 529 triệu là TỔNG phí thực trả — 515.853.900 ₫ phí quản lý cộng 13.000.000 ₫ phí mua — và hơn 1 tỷ là khoảng cách giá trị do cả hai loại phí đó gây ra cùng nhau, chứ không phải của riêng phí quản lý. Nếu bạn nhập thêm phí bán thì nó cũng nằm trong khoảng cách đó.",
      },
      {
        q: "Phí bán có tránh được không?",
        // The "miễn sau 12–24 tháng" claim went for the same reason as the
        // fee ranges: it is a statement about contracts nobody here has read.
        // The mechanism — a taper the prospectus defines — is kept.
        a: "Tùy điều khoản của quỹ, và đó là chỗ phải đọc bản cáo bạch chứ không đoán. Một số quỹ áp phí bán giảm dần theo thời gian nắm giữ rồi miễn sau một thời hạn; thời hạn đó do từng quỹ quy định và trang này không biết của bạn là bao lâu. Cách dùng: nếu bạn chắc chắn giữ qua mốc miễn phí thì để ô phí bán bằng 0; nếu có khả năng phải rút sớm, hãy nhập mức phí áp cho đúng thời điểm đó để thấy nó lấy đi bao nhiêu tại mốc bạn cần tiền.",
      },
      {
        q: "Còn phí giao dịch và thuế thì sao?",
        a: "Không nằm trong phép tính này. Với quỹ mở, phí giao dịch bên trong quỹ đã nằm trong lợi nhuận công bố. Với thuế, cá nhân bán chứng chỉ quỹ chịu thuế thu nhập cá nhân theo tỷ lệ trên giá trị bán tương tự cổ phiếu — hãy dùng công cụ lợi nhuận cổ phiếu của FinHome cho phần đó.",
      },
    ],
  },
} as const;
