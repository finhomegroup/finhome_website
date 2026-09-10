// Copy for /cong-cu/tinh-huu-tri/.
//
// Original FinHome copy. Models UNITED STATES retirement practice —
// registry sets usRules: true.
//
// Shares lib/calc/retirement.ts and components/calc/retirement-fields.tsx
// with the other retirement projection pages. This one SOLVES for the
// contribution, so the "góp mỗi năm" field is omitted from the form.
//
// Figures quoted are solveRequiredContribution's output, verified by running
// it on this page's own defaults (35 tuổi, nghỉ 65, đến 95; dư 100.000;
// khoản góp tăng 2%/năm; lợi suất 7% trước / 5% sau; lạm phát 2,5%;
// chi 80.000 và thu khác 25.000 — cả hai theo giá hôm nay):
//   Cần góp 13.956,50 USD/năm, tức 1.163,04 USD/tháng — nhưng đó là NĂM ĐẦU
//   Năm cuối (tuổi 64) khoản góp đã là 24.784,58 USD/năm = 2.065,38 USD/tháng
//   Tổng góp cả kỳ 566.188,39 USD; 30 lần khoản năm đầu chỉ là 418.694,99
//   Nếu KHÔNG tăng khoản góp: 17.141,54 USD/năm = 1.428,46 USD/tháng,
//     cao hơn khoản năm đầu ở trên 22,8%
//   Bắt đầu ở tuổi 45 thay vì 35: 30.603,86 USD/năm = 2.550,32 USD/tháng,
//     đắt hơn 119,3%; tổng góp 743.593,22 USD
//   Tổng tăng trưởng 4.398.700,43 USD — bằng 776,9% tổng số đã góp
//   Số dư khi nghỉ hưu 2.493.773,11 danh nghĩa / 1.188.888,09 giá hôm nay
//   Tỷ lệ rút năm đầu 4,63%; chi tiêu bền vững đúng bằng 80.000 đã nhập
//   Với số dư sẵn có 3.000.000 USD: cần góp 0 (đã đủ)

export const RETIREMENT_TARGET = {
  slug: "/cong-cu/tinh-huu-tri",

  pageTitle: "Tính hưu trí",
  metaTitle: "Tính hưu trí — Cần góp bao nhiêu mỗi tháng để nghỉ hưu như mong muốn",
  metaDescription:
    "Từ mức chi tiêu bạn muốn có khi nghỉ hưu, công cụ giải ngược ra số tiền cần góp mỗi tháng. Có tính lạm phát và nói rõ khoản góp đó sẽ tăng đến đâu. Công cụ miễn phí của FinHome.",

  lede:
    "Trang này đi ngược chiều với một bản dự phóng thông thường: bạn nhập mức sống mong muốn khi nghỉ hưu, công cụ giải ra số tiền phải góp mỗi tháng để đạt được mức đó — và nói rõ con số ấy sẽ tăng đến đâu trong những năm cuối.",

  fields: {
    ageGroup: "Các mốc tuổi",
    balanceGroup: "Tích lũy",
    spendingGroup: "Chi tiêu khi nghỉ hưu",
    rateGroup: "Giả định lợi suất và lạm phát",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    fields: {
      currentAge: { label: "Tuổi hiện tại", unit: "tuổi", help: "Tuổi bắt đầu góp." },
      retirementAge: {
        label: "Tuổi nghỉ hưu",
        unit: "tuổi",
        help: "Năm cuối còn góp là năm trước tuổi này.",
      },
      endAge: {
        label: "Dự phóng đến tuổi",
        unit: "tuổi",
        help: "Khoản góp được giải sao cho tiền vừa đủ đến đúng tuổi này.",
      },
      currentBalance: {
        label: "Số dư hưu trí hiện có",
        unit: "USD",
        help: "Càng nhiều thì mức góp cần thiết càng thấp. Nếu đã đủ, công cụ trả về 0 chứ không trả về một con số nhỏ.",
      },
      // Solved, not asked — omitted from the form. The copy stays so the
      // shared RetirementCopy type is satisfied without a second shape.
      annualContribution: {
        label: "Góp mỗi năm",
        unit: "USD",
        help: "Trang này giải ra con số này, nên không hỏi.",
      },
      contributionGrowthPercent: {
        label: "Khoản góp tăng mỗi năm",
        unit: "%/năm",
        help: "Thường bằng tốc độ tăng lương. Đặt 0 nếu bạn muốn một con số cố định suốt kỳ.",
      },
      desiredAnnualSpending: {
        label: "Chi tiêu mong muốn mỗi năm",
        unit: "USD",
        help: "Theo GIÁ HÔM NAY. Đây là đầu vào quyết định kết quả.",
      },
      otherAnnualIncome: {
        label: "Thu nhập khác mỗi năm khi nghỉ hưu",
        unit: "USD",
        help: "An sinh xã hội, lương hưu, tiền cho thuê. Cũng theo giá hôm nay. Mỗi đồng ở đây giảm trực tiếp mức bạn phải góp.",
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
    resultTitle: "Mức góp cần thiết",
    monthlyLabel: "Cần góp mỗi tháng, năm đầu",
    annualLabel: "Cần góp mỗi năm, năm đầu",
    lastMonthlyLabel: "Cần góp mỗi tháng, năm cuối",
    realBalanceLabel: "Số dư khi nghỉ hưu, theo giá hôm nay",

    checkTitle: "Kiểm chứng kế hoạch",
    nominalBalanceLabel: "Số dư khi nghỉ hưu, danh nghĩa",
    totalContributedLabel: "Tổng sẽ góp cả kỳ",
    totalGrowthLabel: "Tổng tăng trưởng",
    initialRateLabel: "Tỷ lệ rút năm đầu",
    sustainableLabel: "Chi tiêu kế hoạch duy trì được",
    finalBalanceLabel: "Số dư cuối kỳ, danh nghĩa",

    table: {
      caption: "Dự phóng theo từng năm ở mức góp đã giải",
      ageColumn: "Tuổi",
      phaseColumn: "Giai đoạn",
      accumulating: "Tích lũy",
      drawing: "Rút tiền",
      contributionColumn: "Góp",
      withdrawalColumn: "Rút",
      balanceColumn: "Số dư danh nghĩa",
      realBalanceColumn: "Số dư giá hôm nay",
      intro:
        "Bảng hiển thị mỗi 5 năm cùng hai năm bắc qua tuổi nghỉ hưu. Cột “Góp” tăng dần chính là điều con số đầu tiên ở trên không tự nói ra.",
    },

    fundedNotice:
      "Số dư hiện có đã đủ để nuôi mức chi tiêu này đến hết kỳ mà không cần góp thêm đồng nào, nên kết quả là 0 — không phải một con số nhỏ mà phép giải tình cờ dừng lại ở đó. Nếu bạn vẫn tiếp tục góp, phần dư sẽ nằm lại cuối kỳ; hãy thử nâng mức chi tiêu mong muốn để xem kế hoạch chịu được đến đâu.",
    unsolvableNotice:
      "Không có mức góp nào trong khoảng công cụ tìm kiếm nuôi được mức chi tiêu này đến hết kỳ. Đó là câu trả lời thật thà hơn một con số: khi phép tìm không chặn được nghiệm, bất kỳ số hữu hạn nào trả về cũng chỉ là phỏng đoán. Hãy giảm mức chi tiêu mong muốn, lùi tuổi nghỉ hưu, hoặc kiểm tra lại các mốc tuổi.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi nghỉ hưu < tuổi kết thúc, và toàn kỳ không quá 100 năm.",
  },

  growingNotice:
    "Con số đầu tiên ở trên là khoản góp của NĂM ĐẦU, không phải mức góp đều suốt kỳ. Với giả định mặc định, 1.163,04 USD/tháng ở tuổi 35 đã thành 2.065,38 USD/tháng ở tuổi 64 — vì kế hoạch giả định khoản góp tăng 2%/năm cùng với lương. Nếu bạn muốn một con số cố định để đặt lệnh chuyển tiền tự động và không bao giờ phải nghĩ lại, hãy đặt “khoản góp tăng mỗi năm” về 0: mức cần thiết khi đó là 1.428,46 USD/tháng, cao hơn 22,8% ngay từ đầu nhưng không đổi trong suốt 30 năm. Hai con số này mô tả cùng một kế hoạch; điều khác nhau là bạn trả phần khó ở đầu kỳ hay ở cuối kỳ.",

  formula: {
    title: "Cách tính",
    body: [
      "Công cụ không dùng công thức niên kim để giải ra khoản góp. Nó chạy đúng bản dự phóng mà trang kế hoạch hưu trí chạy — tích lũy đến tuổi nghỉ hưu rồi rút tiền đến hết kỳ — và dò khoản góp cho tới khi bản dự phóng vừa đủ không cạn tiền.",
      "Lý do phải làm vòng vo như vậy: bản dự phóng có một sàn mà công thức niên kim không có — khoản rút mỗi năm không bao giờ vượt số dư còn lại. Giải theo công thức rồi hiển thị bản dự phóng chính là cách một trang tuyên bố “kế hoạch đủ” trong khi bảng số của chính nó cho thấy tiền cạn giữa kỳ.",
      "Mức chi tiêu mong muốn được nhập theo giá hôm nay và được quy đổi sang từng năm tương lai theo lạm phát. Thu nhập khác cũng vậy, nên mỗi đồng an sinh xã hội hay lương hưu bạn nhập vào sẽ giảm trực tiếp phần phải rút từ danh mục — và giảm mức phải góp.",
      "Khoản góp được giải là khoản của năm đầu. Từ năm sau nó tăng theo tỷ lệ “khoản góp tăng mỗi năm”, nên tổng số tiền bạn thực sự bỏ ra lớn hơn 30 lần con số đầu tiên: 566.188 USD so với 418.695 USD, theo các giả định mặc định.",
      "Nếu số dư hiện có đã tự nuôi được cả kỳ, kết quả là 0 chứ không phải một con số nhỏ. Nếu ngay cả mức góp tối đa mà công cụ dò cũng không đủ, kết quả là “không có nghiệm” chứ không phải một con số trông có vẻ hợp lý.",
      "Một phép kiểm chứng nằm sẵn trong phần kết quả: dòng “chi tiêu kế hoạch duy trì được” phải trùng với mức chi tiêu bạn đã nhập. Hai con số này đi hai đường khác nhau — một từ phép dò trên bản dự phóng, một từ công thức niên kim đầu kỳ theo lợi suất thực — nên chúng trùng nhau là bằng chứng cả hai đều đúng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Bắt đầu muộn 10 năm thì đắt hơn bao nhiêu?",
        a: "Hơn gấp đôi. Với đúng các giả định mặc định, bắt đầu ở tuổi 35 cần 1.163,04 USD/tháng; bắt đầu ở tuổi 45 cho cùng mục tiêu cần 2.550,32 USD/tháng. Tổng số tiền bỏ ra cũng tăng từ 566.188 USD lên 743.593 USD — vừa góp nhiều hơn mỗi tháng, vừa góp trong ít năm hơn nên phần lợi nhuận kép làm hộ bạn ít hơn. Đây là con số đáng nhìn nhất trên trang này: mười năm chờ đợi không làm mục tiêu đắt thêm một phần ba, nó làm mục tiêu đắt thêm 119,3%.",
      },
      {
        q: "Vì sao tổng tăng trưởng lại lớn hơn tổng số góp nhiều lần?",
        a: "Vì kỳ này dài 60 năm, không phải 30. Tiền góp ở tuổi 35 vẫn còn nằm trong danh mục và sinh lợi đến tuổi 95. Với các giả định mặc định, tổng tăng trưởng là 4.398.700 USD trên tổng góp 566.188 USD — tức 776,9%. Điều đó không có nghĩa là bạn “được” khoản đó: phần lớn nó bị lạm phát và chính việc rút tiền tiêu hết. Nó chỉ nói rằng ở kỳ hạn này, thời gian đóng góp nhiều hơn số tiền, nên năm bắt đầu quan trọng hơn mức góp.",
      },
      {
        q: "Nên đặt “khoản góp tăng mỗi năm” bằng bao nhiêu?",
        a: "Bằng tốc độ tăng lương thực tế của bạn, thường là 2–4%/năm với người làm công ăn lương. Nhưng hãy chọn con số bạn thực sự sẽ làm được: kế hoạch giả định bạn nâng khoản góp đúng như vậy mỗi năm, và nếu bạn không nâng thì mức góp năm đầu là quá thấp — thiếu hụt chỉ lộ ra sau vài chục năm, khi không còn thời gian sửa. Đặt 0 là lựa chọn thận trọng và dễ thực hiện nhất.",
      },
      {
        q: "Kết quả có tính thuế không?",
        a: "Không. Đây là số tiền gộp vào tài khoản và số tiền gộp rút ra. Với 401(k) hoặc IRA truyền thống, khoản góp được trừ thuế ngay — nên chi phí thực tế mỗi tháng của bạn thấp hơn con số hiển thị, đúng bằng thuế suất biên — còn tiền rút sau này chịu thuế thu nhập, nên mức chi tiêu thực nhận thấp hơn khoản rút. Với Roth thì ngược lại: góp bằng tiền sau thuế, rút đúng điều kiện không chịu thuế. Nếu tài khoản của bạn là loại chịu thuế khi rút, hãy nhập mức chi tiêu mong muốn đã chia cho (1 − thuế suất dự kiến).",
      },
      {
        q: "Vì sao tiền vừa hết đúng tuổi kết thúc, không dư đồng nào?",
        a: "Vì đó là định nghĩa của khoản góp tối thiểu: mức thấp nhất còn nuôi được cả kỳ. Số dư cuối kỳ bằng 0 là dấu hiệu phép giải đã hội tụ, không phải dấu hiệu kế hoạch nguy hiểm — nhưng nó cũng có nghĩa là kế hoạch này không còn biên an toàn nào. Sống thêm 5 năm ngoài dự phóng, hoặc một đợt giảm mạnh của thị trường ngay đầu giai đoạn rút, đều không có gì để bù. Thực tế nên dự phóng đến tuổi cao hơn kỳ vọng sống rồi mới lấy con số này, thay vì cộng thêm một biên an toàn tùy ý sau đó.",
      },
    ],
  },
} as const;
