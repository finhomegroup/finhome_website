// Copy for /cong-cu/lai-kep/ — the compound interest calculator.
//
// Original FinHome copy. The arithmetic is standard finance; none of the
// wording is copied from any third-party reference tool.
//
// ORIGINAL ROW 16 turned the example into a HOME-FUND example and added the
// three-band visual. Figures quoted below are the module's own output for the
// shipped defaults — 100 triệu ban đầu, gửi thêm 8 triệu mỗi tháng, 6%/năm
// ghép lãi hằng tháng, 10 năm (120 kỳ):
//
//   số cuối kỳ    1.492.974.448 ₫
//   tự bỏ vào     1.060.000.000 ₫  (100 triệu + 120 × 8 triệu)
//   phần do lãi     432.974.448 ₫  — 29% số cuối kỳ
//   cuối năm 5      693.045.259 ₫, trong đó lãi 113.045.259 ₫
//   không gửi thêm  181.939.673 ₫, lãi 81.939.673 ₫
//
// Re-read the module if any default moves. The rate is the reader's
// assumption, and the copy says so everywhere it is used.

export const COMPOUND = {
  slug: "/cong-cu/lai-kep",

  pageTitle: "Tính lãi kép: quỹ mua nhà của bạn lớn lên bao nhiêu?",
  metaTitle: "Tính lãi kép — Số tiền tương lai và lãi nhận được",
  metaDescription:
    "Nhập số tiền ban đầu, lãi suất, kỳ hạn và khoản gửi thêm định kỳ để biết số tiền tương lai, tổng lãi và bảng tăng trưởng theo từng năm. Công cụ miễn phí của FinHome.",

  lede:
    "Lãi kép là khi tiền lãi được nhập vào gốc và tiếp tục sinh lãi. Ví dụ điền sẵn là một quỹ mua nhà: 100 triệu đang có, gửi thêm 8 triệu mỗi tháng. Biểu đồ tách ba phần — số tiền ban đầu, tiền bạn gửi thêm về sau, và phần do lãi — vì hai phần đầu là thứ bạn quyết định, còn phần thứ ba chỉ là giả định.",

  form: {
    depositGroup: "Khoản gửi",
    principalLabel: "Số tiền ban đầu",
    principalUnit: "₫",
    principalHelp: "Số tiền bạn có ngay bây giờ. Nhập 0 nếu bắt đầu từ đầu.",
    principalInvalid: "Số tiền ban đầu không được là số âm.",
    defaultPrincipal: "100.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất danh nghĩa hằng năm, ví dụ 6. Đây là GIẢ ĐỊNH của bạn, không phải mức được bảo đảm — hãy thử cả mức 0 để xem kế hoạch còn đứng được không.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "6",

    yearsLabel: "Số năm gửi",
    yearsUnit: "năm",
    yearsHelp:
      "Thời gian bạn để tiền tiếp tục sinh lãi. Chỉ những kỳ ghép lãi đã hoàn thành mới được tính lãi. Công cụ hỗ trợ tối đa 100 năm.",
    yearsInvalid: "Vui lòng nhập số năm lớn hơn 0 và không quá 100.",
    defaultYears: "10",

    compoundingLabel: "Kỳ ghép lãi",
    compoundingHelp:
      "Lãi được nhập vào gốc bao nhiêu lần mỗi năm. Ghép lãi càng thường xuyên thì lãi suất thực tế càng cao.",
    defaultCompounding: "monthly",
    compoundingOptions: [
      { value: "annually", label: "Hằng năm" },
      { value: "semiannually", label: "Nửa năm" },
      { value: "quarterly", label: "Hằng quý" },
      { value: "monthly", label: "Hằng tháng" },
      { value: "daily", label: "Hằng ngày" },
    ],

    contributionLabel: "Gửi thêm mỗi kỳ",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền bạn gửi thêm vào CUỐI mỗi kỳ ghép lãi — với kỳ ghép hằng tháng thì đây là mức góp mỗi tháng. Để 0 nếu chỉ gửi một lần.",
    contributionInvalid: "Số tiền gửi thêm không được là số âm.",
    defaultContribution: "8.000.000",

    resultTitle: "Kết quả",
    futureValueLabel: "Số tiền cuối kỳ",
    contributedLabel: "Tổng số tiền bạn đã gửi",
    interestLabel: "Tổng lãi nhận được",
    effectiveRateLabel: "Lãi suất thực tế mỗi năm",
    periodsLabel: "Số kỳ ghép lãi",
    periodsUnit: "kỳ",

    emptyNotice:
      "Nhập số tiền ban đầu hoặc khoản gửi thêm lớn hơn 0, và số năm ít nhất bằng một kỳ ghép lãi, để xem kết quả.",
  },

  // ORIGINAL ROW 16's visual: the balance split into the money that was there
  // at the start, the money added afterwards, and the part the assumed rate
  // produced. Figures in `summary` come from `compound-chart.ts`, which reads
  // the same yearly snapshots the table below renders.
  chart: {
    title: "Vốn gốc, tiền gửi thêm và lãi theo thời gian",
    initial: "Số tiền ban đầu",
    contributions: "Tiền gửi thêm về sau",
    interest: "Phần do lãi",
    yearTick: "Năm {n}",
    // A checkpoint that is not a whole year is named by its real elapsed
    // time, in whichever unit the horizon needs. A fixed "{n} năm" with one
    // decimal turned three days of daily compounding into "0,0 năm".
    partialTick: "{n} năm",
    monthsTick: "{n} tháng",
    daysTick: "{n} ngày",
    endMarker: "Kết thúc ở {time} — kỳ ghép lãi cuối đã hoàn thành",
    xAxis: "Số năm đã tính lãi",
    xAxisMonths: "Số tháng đã tính lãi",
    xAxisDays: "Số ngày đã tính lãi",
    yAxis: "Số dư ({unit})",
    summary:
      "Sau {time} ({periods} kỳ ghép lãi đã hoàn thành), số dư là {balance}: {initial} là số tiền ban đầu, {contributions} là tiền bạn gửi thêm về sau, và {interest} là phần do lãi — khoảng {interestShare}% số cuối kỳ. Ba dải trong biểu đồ cộng lại đúng bằng số dư; hai dải dưới là tiền của bạn, chỉ dải trên phụ thuộc vào lãi suất.",
    rateNote:
      "Lãi suất là giả định bạn nhập và được coi là không đổi suốt kỳ hạn, không phải mức được bảo đảm.",
    noContributionNote:
      "Ví dụ này không gửi thêm, nên chỉ có hai dải: số tiền ban đầu và phần do lãi.",
    // CORRECTED. This said the term was not a whole number of compounding
    // periods, which is a different claim — and false for 1,5 năm ghép nửa
    // năm, exactly 3 periods with nothing left over. A non-whole YEAR is all
    // this note may assert; `uncreditedNote` covers the other case.
    partialNote:
      "Mốc cuối của biểu đồ không nằm ở cuối một năm tròn mà ở thời điểm kỳ ghép lãi cuối cùng hoàn thành, nên nó được ghi theo thời gian thực tế thay vì theo số năm.",
    uncreditedNote:
      "Kỳ hạn bạn nhập còn dư {periods} kỳ ghép lãi chưa hoàn thành; phần dư đó không được tính lãi, nên biểu đồ dừng ở kỳ cuối đã hoàn thành.",
    assumptions: [
      "Khoản gửi thêm vào CUỐI mỗi kỳ ghép lãi, nên khoản của kỳ nào chỉ sinh lãi từ kỳ sau.",
      "Lãi suất giữ nguyên suốt kỳ hạn. Trên thực tế lãi suất tiền gửi thay đổi theo từng kỳ gửi.",
      "Trục ngang là thời gian ĐÃ tính lãi: chỉ những kỳ ghép lãi đã hoàn thành mới được tính, nên một kỳ hạn lẻ dừng ở mốc lẻ chứ không làm tròn lên.",
      "Số tiền ban đầu là một dải riêng suốt kỳ hạn; nó không được cộng lại một lần nữa vào phần gửi thêm.",
      "Chưa trừ thuế, phí và lạm phát. Đây là số tiền danh nghĩa.",
    ],
    tableCaption: "Ba phần của số dư, theo từng mốc thời gian",
    periodColumn: "Mốc",
    balanceColumn: "Số dư",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì chưa có kết quả để vẽ.",
    unavailableRecovery:
      "Hãy nhập số tiền ban đầu hoặc khoản gửi thêm lớn hơn 0, và số năm ít nhất bằng một kỳ ghép lãi.",
  },

  table: {
    // The dense always-expanded table of pre-formatted đồng strings that used
    // to sit here is gone: the chart's own table is the same snapshots with
    // typed cells, so it reads in one stated unit with the exact figures
    // behind a checkbox, inside a disclosure. One reading path, not two.
    intro:
      "Biểu đồ trên tách số dư thành ba dải: số tiền ban đầu, tiền bạn gửi thêm về sau, và phần do lãi. Bảng số liệu của từng mốc nằm ngay dưới biểu đồ, trong phần “Xem số liệu”. Phần lãi tăng nhanh dần về sau, vì lãi của những kỳ trước cũng bắt đầu sinh lãi.",
  },

  formula: {
    title: "Công thức tính",
    body: [
      "Với một khoản gửi duy nhất: Số tiền cuối kỳ = P × (1 + r/m)^(m×t), trong đó P là số tiền ban đầu, r là lãi suất năm, m là số kỳ ghép lãi trong một năm và t là số năm. Trong đó m×t được lấy TRÒN XUỐNG số kỳ đã hoàn thành — gửi 2,5 năm ghép lãi hằng năm chỉ được tính 2 kỳ. Dòng Số kỳ ghép lãi cho biết con số thực sự được dùng.",
      "Nếu bạn gửi thêm một khoản đều đặn mỗi kỳ, phần đó được tính theo công thức niên kim: Số tiền cuối kỳ = A × ((1 + i)^n − 1) ÷ i, với A là khoản gửi mỗi kỳ, i là lãi suất mỗi kỳ và n là tổng số kỳ. Công cụ cộng hai phần này lại.",
      "Lãi suất thực tế mỗi năm cao hơn lãi suất danh nghĩa khi ghép lãi nhiều lần trong năm: (1 + r/m)^m − 1. Ví dụ 6%/năm ghép lãi hằng tháng cho lãi suất thực tế khoảng 6,17%/năm.",
      // ORIGINAL ROW 16: the house-fund example, with its own figures.
      "Ví dụ quỹ mua nhà điền sẵn: 100 triệu đang có, gửi thêm 8 triệu mỗi tháng, giả định 6%/năm ghép lãi hằng tháng trong 10 năm. Số cuối kỳ là 1.492.974.448 ₫, trong đó bạn tự bỏ vào 1.060.000.000 ₫ và phần do lãi là 432.974.448 ₫ — khoảng 29% số cuối kỳ. Nếu không gửi thêm đồng nào, cùng 100 triệu đó chỉ thành 181.939.673 ₫. Khoản gửi thêm đều đặn làm nhiều hơn lãi suất, và nó là phần bạn quyết định được.",
      // CORRECTED. This asserted that starting early matters MORE than
      // contributing more, which is an ordering one scenario cannot
      // establish: which lever dominates depends on the rate, the horizon and
      // how much the contribution can actually move.
      "Phần do lãi tăng dần chứ không đều: đến cuối năm 5, số dư là 693.045.259 ₫ và lãi mới chỉ 113.045.259 ₫; năm năm còn lại mới là nơi phần lãi lớn lên. Thời gian và mức góp là hai cần đẩy khác nhau — thời gian làm phần lãi lớn lên, mức góp làm phần tiền của bạn lớn lên — và cái nào quan trọng hơn thì tùy lãi suất, tùy thời hạn còn lại và tùy bạn nâng được mức góp bao nhiêu. Với một mục tiêu chỉ còn hai ba năm, phần lãi chưa có thời gian để đóng góp đáng kể, nên kết quả gần như hoàn toàn nằm ở mức góp; hãy thử đổi cả hai ô để thấy số của bạn phản ứng thế nào thay vì tin vào một quy luật chung.",
      "Công cụ hỗ trợ tối đa 100 năm. Kỳ hạn dài hơn bị TỪ CHỐI chứ không bị tự cắt về 100 năm, vì tính 100 năm khi bạn nhập 1.000 năm là trả lời một câu hỏi khác.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lãi kép khác lãi đơn ở đâu?",
        a: "Lãi đơn chỉ tính trên số tiền gốc ban đầu, nên tiền lãi mỗi năm bằng nhau. Lãi kép tính trên cả gốc và phần lãi đã nhận, nên tiền lãi mỗi năm một tăng. Càng gửi lâu thì khoảng cách giữa hai cách tính càng lớn.",
      },
      {
        q: "Ghép lãi hằng tháng có lợi hơn hằng năm nhiều không?",
        a: "Có lợi hơn nhưng không nhiều như nhiều người nghĩ. Ở mức 6%/năm, ghép lãi hằng tháng cho lãi suất thực tế khoảng 6,17%/năm so với 6% khi ghép hằng năm. Kỳ hạn và lãi suất ảnh hưởng lớn hơn tần suất ghép lãi.",
      },
      {
        q: "Vì sao nên gửi thêm đều đặn thay vì chờ có nhiều tiền?",
        a: "Vì mỗi khoản gửi sớm đều có thêm thời gian sinh lãi. Trong công cụ này, bạn có thể để số tiền ban đầu bằng 0 và chỉ nhập khoản gửi thêm mỗi kỳ để thấy một khoản nhỏ đều đặn tích lũy thành bao nhiêu.",
      },
      {
        q: "Tôi đang để dành mua nhà — nên dùng công cụ nào?",
        a: "Trang này cho bạn thấy tiền lớn lên thế nào và phần nào do lãi. Nếu bạn đã có một mục tiêu cụ thể — tiền trả trước cho một căn nhà, kèm chi phí mua và quỹ dự phòng — thì công cụ Mục tiêu tiết kiệm trả lời trực tiếp hơn: mỗi tháng cần góp bao nhiêu, bao lâu thì đủ, và ngày dự kiến đạt mục tiêu. Hai công cụ dùng cùng một quan hệ niên kim nên các con số khớp nhau; bạn phải tự nhập lại số liệu, vì trang này không lưu và không chuyển gì sang trang khác.",
      },
      {
        q: "Kết quả có trừ thuế và lạm phát chưa?",
        a: "Chưa. Công cụ tính theo lãi suất bạn nhập và giả định lãi suất không đổi suốt kỳ hạn. Trên thực tế lãi suất tiết kiệm thay đổi theo từng kỳ gửi, và lạm phát làm giảm sức mua của số tiền cuối kỳ, nên hãy xem kết quả là con số trước lạm phát.",
      },
    ],
  },
} as const;
