// Copy for /cong-cu/ke-hoach-huu-tri/.
//
// Original FinHome copy. Models UNITED STATES retirement practice —
// registry sets usRules: true.
//
// Shares lib/calc/retirement.ts and components/calc/retirement-fields.tsx
// with four other pages. This is the flagship: the full projection.
//
// Figures quoted are projectRetirement's output, verified by running it
// (35 tuổi, nghỉ 65, đến 95; dư 100.000; góp 20.000/năm +2%/năm;
//  lợi suất 7% trước / 5% sau; lạm phát 2,5%; chi 80.000 và thu khác
//  25.000 — cả hai theo giá hôm nay):
//   Số dư khi nghỉ hưu: 3.244.007,90 USD — nhưng theo giá hôm nay chỉ
//     1.546.557,04 USD, tức CHƯA TỚI MỘT NỬA
//   Năm rút đầu tiên: 115.366,22 USD danh nghĩa cho 55.000 USD giá hôm nay
//   Tỷ lệ rút năm đầu 3,56%; chi tiêu bền vững 96.546,38 USD/năm
//   Không cạn tiền; còn lại 3.242.471,61 USD (736.960,58 theo giá hôm nay)
//   Tổng góp 811.361,58 — tổng tăng trưởng 7.395.998,80 USD

export const RETIREMENT_PLAN = {
  slug: "/cong-cu/ke-hoach-huu-tri",

  pageTitle: "Kế hoạch hưu trí",
  metaTitle: "Kế hoạch hưu trí — Tích lũy, rút tiền và năm cạn tiền",
  metaDescription:
    "Dự phóng toàn bộ vòng đời tài chính: tích lũy đến tuổi nghỉ hưu rồi rút tiền, có tính lạm phát. Nói rõ năm nào tiền cạn. Công cụ miễn phí của FinHome.",

  lede:
    "Một bản dự phóng chạy cả hai giai đoạn: tích lũy đến tuổi nghỉ hưu, rồi rút tiền cho đến khi hết hoặc hết kỳ. Hai điều công cụ này không làm: không đưa số danh nghĩa lên làm câu trả lời, và không im lặng khi tiền cạn.",

  fields: {
    ageGroup: "Các mốc tuổi",
    balanceGroup: "Tích lũy",
    spendingGroup: "Chi tiêu khi nghỉ hưu",
    rateGroup: "Giả định lợi suất và lạm phát",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    fields: {
      currentAge: { label: "Tuổi hiện tại", unit: "tuổi", help: "Tuổi bắt đầu dự phóng." },
      retirementAge: {
        label: "Tuổi nghỉ hưu",
        unit: "tuổi",
        help: "Năm cuối còn góp là năm trước tuổi này.",
      },
      endAge: {
        label: "Dự phóng đến tuổi",
        unit: "tuổi",
        help: "Nên chọn cao hơn kỳ vọng sống — sống lâu hơn dự tính là rủi ro tài chính, không phải may mắn.",
      },
      currentBalance: {
        label: "Số dư hưu trí hiện có",
        unit: "USD",
        help: "Tổng tất cả tài khoản hưu trí đang có.",
      },
      annualContribution: {
        label: "Góp mỗi năm",
        unit: "USD",
        help: "Tổng cả phần bạn góp và phần chủ lao động góp.",
      },
      contributionGrowthPercent: {
        label: "Khoản góp tăng mỗi năm",
        unit: "%/năm",
        help: "Thường bằng tốc độ tăng lương của bạn.",
      },
      desiredAnnualSpending: {
        label: "Chi tiêu mong muốn mỗi năm",
        unit: "USD",
        help: "Theo GIÁ HÔM NAY. Công cụ tự quy đổi sang từng năm tương lai.",
      },
      otherAnnualIncome: {
        label: "Thu nhập khác mỗi năm khi nghỉ hưu",
        unit: "USD",
        help: "An sinh xã hội, lương hưu, tiền cho thuê. Cũng theo giá hôm nay.",
      },
      returnBeforePercent: {
        label: "Lợi suất trước khi nghỉ hưu",
        unit: "%/năm",
        help: "Danh nghĩa, chưa trừ lạm phát.",
      },
      returnAfterPercent: {
        label: "Lợi suất sau khi nghỉ hưu",
        unit: "%/năm",
        help: "Thường thấp hơn, vì danh mục dịch sang tài sản ít rủi ro hơn.",
      },
      inflationPercent: {
        label: "Lạm phát",
        unit: "%/năm",
        help: "Dùng để quy đổi chi tiêu sang từng năm và quy mọi số dư về giá hôm nay.",
      },
    },
  },

  form: {
    resultTitle: "Kết quả kế hoạch",
    verdictLabel: "Kế hoạch có đủ đến hết kỳ",
    verdictYes: "Đủ",
    verdictNo: "Không đủ",
    depletionLabel: "Tiền cạn ở tuổi",
    yearsShortLabel: "Thiếu",
    yearsUnit: "năm",
    realBalanceAtRetirementLabel: "Số dư khi nghỉ hưu, theo giá hôm nay",

    nominalTitle: "Số dư danh nghĩa và thực",
    balanceAtRetirementLabel: "Số dư khi nghỉ hưu, danh nghĩa",
    finalBalanceLabel: "Số dư cuối kỳ, danh nghĩa",
    realFinalBalanceLabel: "Số dư cuối kỳ, theo giá hôm nay",

    flowTitle: "Dòng tiền cả kỳ",
    totalContributedLabel: "Tổng đã góp",
    totalGrowthLabel: "Tổng tăng trưởng",
    totalWithdrawnLabel: "Tổng đã rút",
    firstWithdrawalLabel: "Rút năm đầu tiên, danh nghĩa",
    initialRateLabel: "Tỷ lệ rút năm đầu",
    sustainableLabel: "Chi tiêu bền vững, theo giá hôm nay",
    shortfallLabel: "Thiếu so với mong muốn",

    table: {
      caption: "Dự phóng theo từng năm",
      ageColumn: "Tuổi",
      phaseColumn: "Giai đoạn",
      accumulating: "Tích lũy",
      drawing: "Rút tiền",
      contributionColumn: "Góp",
      withdrawalColumn: "Rút",
      returnColumn: "Lợi nhuận",
      balanceColumn: "Số dư danh nghĩa",
      realBalanceColumn: "Số dư giá hôm nay",
      intro:
        "Bảng hiển thị mỗi 5 năm để đọc được. Cột cuối là con số đáng nhìn nhất: cùng một số dư, quy về giá hôm nay.",
    },

    depletionNotice:
      "Kế hoạch này CẠN TIỀN trước khi hết kỳ dự phóng. Công cụ nói rõ năm nào thay vì chỉ hiển thị số dư cuối bằng 0 — vì một bản dự phóng kết thúc ở 0 mà không nói tại sao đã che đi đúng thông tin duy nhất có ý nghĩa. Hãy thử tăng khoản góp, lùi tuổi nghỉ hưu, hoặc giảm mức chi tiêu mong muốn và xem con số này dịch chuyển thế nào.",
    fundedNotice:
      "Kế hoạch đủ đến hết kỳ dự phóng, và còn dư. Nhưng hãy nhìn dòng “chi tiêu bền vững”: đó là mức chi tối đa mà số dư khi nghỉ hưu có thể duy trì suốt kỳ. Nếu nó cao hơn mức bạn nhập nhiều, bạn đang tích lũy quá mức so với mục tiêu đã đặt.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi nghỉ hưu < tuổi kết thúc, và toàn kỳ không quá 100 năm.",
  },

  realNotice:
    "Với các giả định mặc định, số dư khi nghỉ hưu là 3.244.008 USD — nhưng theo giá hôm nay nó chỉ tương đương 1.546.557 USD, tức CHƯA TỚI MỘT NỬA. Đó là lý do công cụ luôn tính song song hai con số và đặt con số theo giá hôm nay lên làm kết quả chính. Nhìn theo chiều rút tiền thì cũng vậy: năm rút đầu tiên là 115.366 USD danh nghĩa, nhưng nó chỉ mua được đúng lượng hàng hóa mà 55.000 USD mua hôm nay. Một người lập kế hoạch dựa trên con số danh nghĩa sẽ lập kế hoạch để mình nghèo — và đó là sai sót phổ biến nhất trong các bản dự phóng hưu trí dài hạn.",

  formula: {
    title: "Cách tính",
    body: [
      "Giai đoạn tích lũy: mỗi năm cộng khoản góp vào số dư TRƯỚC rồi mới tính lợi nhuận, nên khoản góp được hưởng đủ một năm lợi suất — giống một khoản nộp vào tháng Một.",
      "Giai đoạn rút tiền: mỗi năm trừ khoản rút TRƯỚC rồi mới tính lợi nhuận trên phần còn lại. Hai thứ tự này ngược nhau có chủ ý, và mỗi thứ tự là lựa chọn thận trọng cho giai đoạn của nó — nếu tính lợi nhuận trước khi trừ khoản rút, kế hoạch sẽ được cấp vốn bằng lợi nhuận trên số tiền đã tiêu.",
      "Chi tiêu mong muốn được nhập theo GIÁ HÔM NAY và công cụ tự quy đổi sang từng năm tương lai. Không quy đổi chính là cách một kế hoạch trông như đủ 30 năm rồi cạn ở năm thứ 20.",
      "Mọi số dư đều được quy về giá hôm nay bằng một hệ số duy nhất, tính trong module chứ không để trang tự tính — để không có chỗ nào áp hệ số lạm phát hai lần.",
      "Khoản rút mỗi năm không bao giờ vượt số dư còn lại. Nếu nhu cầu của một năm không được đáp ứng đủ, năm đó được ghi lại là năm cạn tiền và hiển thị ở phần kết quả chính.",
      "Mức chi tiêu bền vững được giải như một niên kim ĐẦU KỲ theo lợi suất thực, đúng theo cách phép dự phóng rút tiền — rút đầu năm rồi mới tính lợi nhuận. Dùng công thức niên kim cuối kỳ sẽ phóng đại mức chi an toàn theo tỷ lệ (1 + lợi suất thực), đủ để một kế hoạch báo “đủ” nhưng thực tế cạn sớm hai năm. Bộ kiểm thử đưa con số bền vững này trở lại phép dự phóng để bắt đúng loại lỗi đó.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao số dư theo giá hôm nay lại thấp hơn nhiều thế?",
        a: "Vì lạm phát tác động suốt 30 năm tích lũy. Với lạm phát 2,5%, giá cả tăng gấp 2,1 lần trong 30 năm, nên 3,24 triệu USD ở tuổi 65 chỉ mua được lượng hàng hóa mà 1,55 triệu USD mua hôm nay. Con số danh nghĩa không sai, nhưng nó không phải con số để lập kế hoạch. Công cụ hiển thị cả hai và đặt con số theo giá hôm nay làm kết quả chính.",
      },
      {
        q: "Nên dự phóng đến tuổi bao nhiêu?",
        a: "Cao hơn kỳ vọng sống, không phải bằng. Kỳ vọng sống là số trung vị: một nửa số người sống lâu hơn thế. Nếu bạn lập kế hoạch đến đúng tuổi kỳ vọng, bạn đang chấp nhận 50% khả năng hết tiền khi còn sống. Tuổi 95 là mốc thường dùng cho người nghỉ hưu ở tuổi 65, và nếu sức khỏe gia đình bạn tốt thì 100 không phải quá thận trọng. Sống lâu hơn dự tính là một rủi ro tài chính, không phải một điều may.",
      },
      {
        q: "Vì sao lợi suất sau khi nghỉ hưu lại thấp hơn?",
        a: "Vì phần lớn danh mục dịch dần sang trái phiếu và tài sản ít biến động khi gần và sau tuổi nghỉ hưu. Lý do không chỉ là khẩu vị rủi ro: người đang rút tiền chịu thêm rủi ro về THỨ TỰ lợi suất — một đợt giảm mạnh ngay đầu giai đoạn rút gây thiệt hại lớn hơn nhiều so với cùng đợt giảm đó xảy ra muộn hơn, vì tài sản bị bán ra ở đúng lúc giá thấp. Công cụ này dùng lợi suất bình quân đều nên KHÔNG mô phỏng rủi ro đó; hãy xem nó là một dự phóng thuận lợi.",
      },
      {
        q: "Tỷ lệ rút năm đầu 3,56% có an toàn không?",
        a: "Với kỳ 30 năm thì đây là mức thận trọng. Các nghiên cứu thường lấy 4% làm mốc tham chiếu cho kỳ 30 năm, và mốc đó đã được tranh luận nhiều theo cả hai hướng. Nhưng tỷ lệ rút chỉ là một chỉ dấu, không phải một kết luận: nó không phản ánh rủi ro thứ tự lợi suất, cũng không phản ánh việc chi tiêu thực tế của người nghỉ hưu thường không đều — cao ở những năm đầu còn khỏe, giảm ở giữa, rồi tăng lại vì chi phí y tế.",
      },
      {
        q: "Công cụ có tính thuế khi rút tiền không?",
        a: "Không. Số tiền rút ở đây là số gộp, chưa trừ thuế. Với tài khoản 401(k) hoặc IRA truyền thống, khoản rút chịu thuế thu nhập thông thường, nên chi tiêu thực tế của bạn sẽ thấp hơn con số rút. Với Roth thì khoản rút đúng điều kiện không chịu thuế. Nếu phần lớn tài khoản của bạn là loại chịu thuế khi rút, hãy nhập mức chi tiêu mong muốn cao hơn tương ứng với thuế suất dự kiến của mình.",
      },
    ],
  },
} as const;
