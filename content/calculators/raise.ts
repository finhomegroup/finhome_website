// Copy for /cong-cu/tang-luong/ — the pay-rise calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The copy is careful about one thing throughout: these are GROSS figures.
// A rise in gross pay is not the same rise in take-home pay, because social
// insurance is capped and personal income tax is progressive, and a tool that
// let a user read a net figure off it would be misleading about their money.

export const RAISE = {
  slug: "/cong-cu/tang-luong",

  pageTitle: "Tính tăng lương",
  metaTitle: "Tính tăng lương — Lương mới, mức tăng và chênh lệch cả năm",
  metaDescription:
    "Nhập lương hiện tại rồi chọn tăng theo phần trăm, theo số tiền, hoặc nhập mức lương mong muốn. Công cụ miễn phí của FinHome.",

  lede:
    "Ba cách vào cùng một phép tính: bạn biết phần trăm, bạn biết số tiền, hoặc bạn biết mức lương mình muốn. Cách nào cũng cho ra cả hai con số còn lại, kèm chênh lệch tính cho cả năm.",

  form: {
    modeLegend: "Bạn biết con số nào?",
    modeHelp:
      "Kết quả luôn hiển thị cả phần trăm và số tiền, bất kể bạn nhập theo cách nào.",
    modePercent: "Tăng theo phần trăm",
    modeAmount: "Tăng theo số tiền",
    modeTarget: "Biết mức lương mong muốn",

    group: "Lương",
    currentLabel: "Lương hiện tại",
    currentUnit: "₫/tháng",
    currentHelp: "Lương gộp mỗi tháng, trước thuế và bảo hiểm.",
    currentInvalid: "Vui lòng nhập lương hiện tại lớn hơn 0.",
    defaultCurrent: "20.000.000",

    percentLabel: "Mức tăng",
    percentUnit: "%",
    percentHelp: "Ví dụ 15. Nhập số âm nếu muốn tính mức giảm.",
    percentInvalid: "Vui lòng nhập một số, và mức giảm không quá 100%.",
    // 18%, not 15%: at 15% the gross increase is exactly 3.000.000 ₫, the
    // same figure the separate NET field is prefilled with, and a review
    // found that equality reading as though one were computed from the other.
    // At 18% the gross rise is 3.600.000 ₫ and the two are visibly distinct.
    defaultPercent: "18",

    amountLabel: "Số tiền tăng",
    amountUnit: "₫/tháng",
    amountHelp: "Số tiền tăng thêm mỗi tháng. Nhập số âm nếu là mức giảm.",
    amountInvalid:
      "Vui lòng nhập một số, và mức giảm không vượt quá lương hiện tại.",
    defaultAmount: "3.000.000",

    targetLabel: "Lương mong muốn",
    targetUnit: "₫/tháng",
    targetHelp: "Mức lương gộp bạn muốn đạt được mỗi tháng.",
    targetInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTarget: "23.000.000",

    perYearLabel: "Số tháng lương mỗi năm",
    perYearHelp:
      "Để 12 nếu hợp đồng trả 12 tháng. Nhập 13 nếu có tháng lương thứ 13, vì khi đó mỗi đồng tăng lương được nhân 13 lần chứ không phải 12.",
    perYearInvalid: "Vui lòng nhập số tháng lớn hơn 0.",
    defaultPerYear: "12",

    resultTitle: "Kết quả",
    nextLabel: "Lương mới",
    increaseLabel: "Tăng thêm mỗi tháng",
    increasePercentLabel: "Mức tăng",
    increasePerYearLabel: "Tăng thêm cả năm",
    nextPerYearLabel: "Tổng lương cả năm sau khi tăng",

    // ---------------------------------- original row 63: the goal, and the date
    goalGroup: "Tăng lương giúp đạt mục tiêu sớm bao lâu?",
    // No claim that a net rise is always smaller, and no description of how
    // deductions work: this tool models neither. It states the two facts it
    // can stand behind — the figures above are before deductions, and the net
    // figure has to come from the reader.
    goalIntro:
      "Các con số ở trên là lương GỘP, tức trước các khoản trừ trên bảng lương. Phần dưới cần số tiền THỰC NHẬN tăng thêm, và đó là con số bạn phải tự lấy từ bảng lương — công cụ không tính các khoản trừ và không suy ra nó. Bạn cũng tự chọn để dành bao nhiêu phần trong đó.",

    netIncreaseLabel: "Thực nhận tăng thêm mỗi tháng",
    netIncreaseUnit: "₫/tháng",
    // Was: "sau thuế và bảo hiểm" plus an assertion that it is lower than the
    // gross rise. The tool has no tax or insurance model, so it asks for the
    // figure and says where to find it instead of describing the rules.
    netIncreaseHelp:
      "Chênh lệch tiền THỰC VỀ tài khoản mỗi tháng, đọc trên hai bảng lương trước và sau khi tăng. Đây là một ô RIÊNG, không được tính từ mức tăng gộp ở trên. Để trống nếu bạn chưa biết; công cụ sẽ nói là chưa biết chứ không tự suy ra.",
    netIncreaseInvalid: "Vui lòng nhập một số, hoặc để trống.",
    // Deliberately NOT equal to the gross increase the salary defaults
    // produce (20.000.000 + 18% = 3.600.000). A review found both at
    // 3.000.000 and noted the equality makes the net figure look derived
    // from the gross one, which no part of this tool does.
    defaultNetIncrease: "3.000.000",

    shareLabel: "Phần dành để tiết kiệm",
    shareUnit: "%",
    shareHelp:
      "Bao nhiêu phần trăm của mức tăng thực nhận bạn thực sự để dành. Để 0 nếu chưa để dành thêm — kế hoạch hiện tại vẫn được giữ nguyên.",
    shareInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultShare: "50",

    baselineLabel: "Hiện tại mỗi tháng đang để dành",
    baselineUnit: "₫/tháng",
    baselineHelp: "Mức góp bạn đang duy trì trước khi tăng lương.",
    baselineInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultBaseline: "8.000.000",

    initialLabel: "Đã tích lũy được",
    initialUnit: "₫",
    initialHelp: "Số tiền hiện có, tính trọn vào mục tiêu.",
    initialInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultInitial: "100.000.000",

    // `goalTarget*`, not `target*`: the salary section already owns `target`
    // for the DESIRED SALARY, and two different meanings under one key is how
    // a form ends up showing the wrong label beside the wrong box.
    goalTargetLabel: "Mục tiêu cần đạt",
    goalTargetUnit: "₫",
    goalTargetHelp: "Ví dụ số tiền trả trước cho căn nhà bạn đang nhắm tới.",
    goalTargetInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultGoalTarget: "500.000.000",

    goalRateLabel: "Lãi suất giả định",
    goalRateUnit: "%/năm",
    goalRateHelp:
      "Mức sinh lời bạn TỰ giả định cho khoản tích lũy, ghép lãi hằng tháng. Đây là giả định của bạn, không phải mức lãi được cam kết.",
    goalRateInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultGoalRate: "6",

    startGroup: "Bắt đầu từ ngày",
    startDayLabel: "Ngày",
    startMonthLabel: "Tháng",
    startYearLabel: "Năm",
    // Real guidance for the VALID state. These three fields used to pass the
    // error string as their `help` too, so a perfectly valid 15/9/2026
    // displayed "Ngày không tồn tại." under every box with no aria-invalid
    // anywhere — a review found it. `NumberField` swaps in the error only
    // while the field is flagged, so the two strings must be different.
    startDayHelp: "Ngày trong tháng, ví dụ 15.",
    startMonthHelp: "Tháng từ 1 đến 12.",
    startYearHelp: "Năm, ví dụ 2026. Mốc này chỉ dùng để tính ra ngày đạt mục tiêu.",
    startInvalid: "Ngày không tồn tại.",
    defaultStartDay: "15",
    defaultStartMonth: "9",
    defaultStartYear: "2026",
    todayLabel: "Điền ngày hôm nay",
    todayHelp:
      "Lấy ngày từ máy bạn. Trang được dựng sẵn nên không tự điền ngày hôm nay.",

    goalResultTitle: "Khi nào đạt mục tiêu",
    extraLabel: "Để dành thêm mỗi tháng",
    raisedLabel: "Tổng để dành mỗi tháng sau khi tăng",
    currentMonthsLabel: "Kế hoạch hiện tại: số tháng",
    currentDateLabel: "Kế hoạch hiện tại: đạt vào ngày",
    raisedMonthsLabel: "Sau khi tăng lương: số tháng",
    raisedDateLabel: "Sau khi tăng lương: đạt vào ngày",
    earlierLabel: "Sớm hơn",
    monthsUnit: "tháng",

    unknownNetNotice:
      "Bạn chưa nhập mức thực nhận tăng thêm, nên công cụ chưa biết mỗi tháng có thêm bao nhiêu để dành. Công cụ KHÔNG dùng mức tăng gộp ở trên để thay thế: nó không tính các khoản trừ trên bảng lương và không suy ra con số thực nhận. Kế hoạch hiện tại vẫn hiển thị bên trên. Hãy so hai bảng lương trước và sau khi tăng rồi nhập chênh lệch vào.",
    payCutNotice:
      "Mức thực nhận đang giảm, nên không có khoản nào được giải phóng để để dành thêm. Công cụ giữ nguyên kế hoạch hiện tại chứ không tự giảm mức góp — chỉ bạn biết sẽ cắt khoản nào.",
    zeroShareNotice:
      "Bạn đang để dành 0% mức tăng, nên kế hoạch giữ nguyên đúng như trước. Thử nâng phần trăm lên để xem mục tiêu đến sớm hơn bao nhiêu.",
    unreachableNotice:
      "Với mức góp và lãi suất giả định hiện tại, mục tiêu không đạt được trong khoảng thời gian công cụ hỗ trợ. Hãy tăng mức góp, giảm mục tiêu, hoặc kiểm tra lại lãi suất giả định.",
    goalInvalidNotice:
      "Một trong các ô của phần mục tiêu chưa hợp lệ, nên chưa có mốc thời gian. Phần lương ở trên vẫn tính bình thường.",
  },

  // WAS a description of Vietnamese progressive-tax brackets and the social
  // insurance cap, plus a categorical claim that a net rise is always smaller
  // than a gross one. This tool models none of that, nobody here has verified
  // those rules against a dated instrument, and a review flagged the whole
  // passage. What is left is what the page can stand behind: which figures
  // these are, and where the net one has to come from.
  grossNotice:
    "Mọi con số ở đây là lương GỘP — số trên hợp đồng, trước các khoản trừ trên bảng lương. Công cụ không tính thuế và không tính bảo hiểm, nên nó không cho biết tiền thực nhận của bạn thay đổi bao nhiêu. Nếu cần con số đó, hãy so bảng lương trước và sau khi tăng.",

  formula: {
    title: "Cách tính",
    body: [
      "Tăng theo phần trăm: lương mới = lương hiện tại × (1 + mức tăng ÷ 100). Tăng 18% từ 20 triệu cho ra 23,6 triệu, tức tăng thêm 3,6 triệu mỗi tháng.",
      "Tăng theo số tiền: lương mới = lương hiện tại + số tiền tăng, và mức tăng phần trăm = số tiền tăng ÷ lương hiện tại × 100.",
      "Biết mức lương mong muốn: mức tăng phần trăm = (lương mong muốn − lương hiện tại) ÷ lương hiện tại × 100. Đây là cách dùng khi bạn đã có một con số trong đầu và cần biết nó tương đương bao nhiêu phần trăm để nói trong buổi thương lượng.",
      "Chênh lệch cả năm = số tiền tăng × số tháng lương mỗi năm. Con số này thường thuyết phục hơn con số hằng tháng: 2 triệu mỗi tháng nghe nhỏ, 26 triệu một năm thì không.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        // No description of tax rules and no categorical claim about the
        // direction: this tool has no tax or insurance model, and asserting
        // how deductions behave would be research nobody here has done.
        q: "Lương thực nhận của tôi tăng bao nhiêu?",
        a: "Công cụ này không tính được. Nó làm việc với lương GỘP và không mô hình hóa thuế hay bảo hiểm, nên nó không biết bảng lương của bạn thay đổi thế nào — điều đó phụ thuộc vào hoàn cảnh của riêng bạn và vào quy định đang áp dụng. Cách chắc chắn là lấy bảng lương của tháng trước và tháng sau khi tăng rồi trừ hai con số thực nhận. Con số đó chính là thứ bạn nhập vào ô “thực nhận tăng thêm mỗi tháng” ở phần mục tiêu.",
      },
      {
        q: "Tăng lương bao nhiêu thì mới thực sự khá hơn?",
        a: "Phần vượt trên lạm phát. Nếu lạm phát trong một năm là 4% mà bạn được tăng 4% thì sức mua của bạn đứng yên. Với mức tăng 18% và lạm phát 4%, sức mua tăng khoảng 13,5% — tính bằng (1,18 ÷ 1,04 − 1). Cả hai con số trong ví dụ này là giả định để minh họa phép tính, không phải mức lạm phát hiện hành.",
      },
      {
        q: "Vì sao phải nhập số tháng lương mỗi năm?",
        a: "Vì tháng lương thứ 13 rất phổ biến ở Việt Nam, và nó nhân lên cùng với mức tăng. Một mức tăng 2 triệu mỗi tháng đáng 24 triệu một năm với hợp đồng 12 tháng, nhưng đáng 26 triệu với hợp đồng 13 tháng. Khi so sánh hai lời mời làm việc có số tháng lương khác nhau, đây là chỗ dễ bỏ sót.",
      },
      {
        q: "Tôi nên nói phần trăm hay số tiền khi thương lượng?",
        a: "Hãy nắm cả hai và chọn tùy người nghe. Bộ phận nhân sự thường làm việc theo ngân sách phần trăm; người quản lý trực tiếp thường nghĩ theo số tiền. Con số cả năm hữu ích khi bạn cần cho thấy quy mô, còn con số hằng tháng hữu ích khi cần cho thấy nó nhỏ so với ngân sách của bộ phận.",
      },
      {
        q: "Công cụ có tính được mức giảm lương không?",
        a: "Có. Nhập số âm ở mức tăng hoặc ở số tiền, hoặc nhập một mức lương mong muốn thấp hơn lương hiện tại. Kết quả khi đó là số âm ở mọi dòng, và dòng chênh lệch cả năm cho thấy quy mô thật của việc bị giảm lương. Mức giảm dừng lại ở lương mới 0 ₫, tức −100%: lương gộp không thể là số âm, nên con số thấp hơn mức đó bị từ chối thay vì cho ra một kết quả vô nghĩa.",
      },
    ],
  },
} as const;
