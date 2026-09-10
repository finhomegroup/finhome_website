// Copy for /cong-cu/phan-tich-tiet-kiem-huu-tri/.
//
// Original FinHome copy. Models UNITED STATES retirement practice —
// registry sets usRules: true.
//
// Shares lib/calc/retirement.ts and components/calc/retirement-fields.tsx
// with the other retirement projection pages, and asks for every field:
// this page diagnoses a plan rather than solving one variable of it.
//
// This is the one retirement page that does NOT start from
// RETIREMENT_DEFAULTS unchanged — see `form.defaults` below for why.
//
// Figures quoted are projectRetirement's and solveRequiredContribution's
// output, verified by running them on this page's own defaults (45 tuổi,
// nghỉ 65, đến 95; dư 250.000; góp 15.000/năm +2%/năm; lợi suất 7% trước /
// 5% sau; lạm phát 2,5%; chi 80.000 và thu khác 25.000 theo giá hôm nay):
//   Vốn sẽ có khi nghỉ hưu 1.057.355,87 USD theo giá hôm nay
//     (1.732.600,71 danh nghĩa)
//   Vốn cần có 1.188.888,08 theo giá hôm nay (1.948.131,56 danh nghĩa)
//   Thiếu 131.532,21 USD — tỷ lệ đáp ứng 88,9%
//   Nhưng tiền cạn ở tuổi 90: thiếu 5 trong 30 năm nghỉ hưu
//   Chi tiêu duy trì được 73.915,09 USD/năm, thiếu 6.084,91 so với 80.000
//     (507,08 USD/tháng), tức phải giảm 7,6%
//   Cần góp 19.225,10 USD/năm = 1.602,09 USD/tháng, tức góp thêm
//     4.225,10 USD/năm = 352,09 USD/tháng, tăng 28,2%
//   Bảng theo tuổi nghỉ hưu, cùng mức góp 15.000:
//     60 -> 60,0% đáp ứng, cạn ở 77   62 -> 70,2%, cạn ở 82
//     65 -> 88,9% đáp ứng, cạn ở 90   67 -> 104,2%, không cạn
//     70 -> 132,7%, không cạn         72 -> 156,7%, không cạn
//   Nghỉ hưu ở 67 cần góp 13.670,88 USD/năm — THẤP HƠN mức 15.000 đang góp

export const RETIREMENT_SAVINGS_ANALYSIS = {
  slug: "/cong-cu/phan-tich-tiet-kiem-huu-tri",

  pageTitle: "Phân tích tiết kiệm hưu trí",
  metaTitle: "Phân tích tiết kiệm hưu trí — Khoản đang tiết kiệm có đủ hay không",
  metaDescription:
    "So sánh số vốn kế hoạch hiện tại sẽ đạt được với số vốn thực sự cần có khi nghỉ hưu, rồi định lượng ba cách bù khoảng thiếu. Công cụ miễn phí của FinHome.",

  lede:
    "Trang này không lập kế hoạch mới. Nó lấy kế hoạch bạn đang chạy, đặt cạnh số vốn kế hoạch đó thực sự cần, và định lượng ba cách bù khoảng thiếu: góp thêm, nghỉ muộn hơn, hoặc chi tiêu ít hơn.",

  fields: {
    ageGroup: "Các mốc tuổi",
    balanceGroup: "Kế hoạch hiện tại",
    spendingGroup: "Chi tiêu khi nghỉ hưu",
    rateGroup: "Giả định lợi suất và lạm phát",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    fields: {
      currentAge: { label: "Tuổi hiện tại", unit: "tuổi", help: "Tuổi bắt đầu dự phóng." },
      retirementAge: {
        label: "Tuổi nghỉ hưu dự kiến",
        unit: "tuổi",
        help: "Bảng bên dưới cho thấy kết quả thay đổi thế nào nếu bạn lùi hoặc tiến tuổi này.",
      },
      endAge: {
        label: "Dự phóng đến tuổi",
        unit: "tuổi",
        help: "Tuổi này quyết định số vốn cần có: mỗi năm thêm vào là một năm phải cấp vốn.",
      },
      currentBalance: {
        label: "Số dư hưu trí hiện có",
        unit: "USD",
        help: "Tổng tất cả tài khoản hưu trí đang có.",
      },
      annualContribution: {
        label: "Đang góp mỗi năm",
        unit: "USD",
        help: "Mức bạn thực sự đang góp, gồm cả phần chủ lao động. Đây là con số được đem ra chẩn đoán.",
      },
      contributionGrowthPercent: {
        label: "Khoản góp tăng mỗi năm",
        unit: "%/năm",
        help: "Thường bằng tốc độ tăng lương của bạn.",
      },
      desiredAnnualSpending: {
        label: "Chi tiêu mong muốn mỗi năm",
        unit: "USD",
        help: "Theo GIÁ HÔM NAY. Đây là thước đo “đủ” của cả trang.",
      },
      otherAnnualIncome: {
        label: "Thu nhập khác mỗi năm khi nghỉ hưu",
        unit: "USD",
        help: "An sinh xã hội, lương hưu, tiền cho thuê — theo giá hôm nay. Phần này không cần vốn, nên nó giảm trực tiếp số vốn cần có.",
      },
      returnBeforePercent: {
        label: "Lợi suất trước khi nghỉ hưu",
        unit: "%/năm",
        help: "Quyết định số vốn bạn SẼ có.",
      },
      returnAfterPercent: {
        label: "Lợi suất sau khi nghỉ hưu",
        unit: "%/năm",
        help: "Quyết định số vốn bạn CẦN có: lợi suất càng cao thì cùng mức chi tiêu cần ít vốn hơn.",
      },
      inflationPercent: {
        label: "Lạm phát",
        unit: "%/năm",
        help: "Dùng để quy mọi con số về giá hôm nay. Cả hai vế của phép so sánh đều theo giá hôm nay.",
      },
    },

    // This page ships its own defaults instead of RETIREMENT_DEFAULTS,
    // because a diagnosis tool whose default state reports "đủ" has nothing
    // to demonstrate. A 45-year-old 88,9% of the way there is the case the
    // page exists for, and it is also the case that makes its central point:
    // 88,9% of the capital does not buy 88,9% of the retirement.
    defaults: {
      currentAge: "45",
      retirementAge: "65",
      endAge: "95",
      currentBalance: "250.000",
      annualContribution: "15.000",
      contributionGrowthPercent: "2",
      returnBeforePercent: "7",
      returnAfterPercent: "5",
      inflationPercent: "2,5",
      desiredAnnualSpending: "80.000",
      otherAnnualIncome: "25.000",
    },
  },

  form: {
    resultTitle: "Kết quả chẩn đoán",
    verdictLabel: "Kế hoạch hiện tại",
    verdictYes: "Đủ",
    verdictNo: "Thiếu",
    coverageLabel: "Tỷ lệ đáp ứng vốn",
    depletionLabel: "Tiền cạn ở tuổi",
    extraMonthlyLabel: "Cần góp thêm mỗi tháng",

    capitalTitle: "Vốn khi nghỉ hưu",
    reachedRealLabel: "Sẽ có, giá hôm nay",
    requiredRealLabel: "Cần có, giá hôm nay",
    gapRealLabel: "Thiếu, giá hôm nay",
    reachedNominalLabel: "Sẽ có, danh nghĩa",
    requiredNominalLabel: "Cần có, danh nghĩa",

    fixesTitle: "Ba cách bù cùng khoảng thiếu này",
    fixContributeLabel: "Góp mỗi năm, thay vì mức hiện tại",
    fixRetireLabel: "Hoặc nghỉ hưu ở tuổi",
    fixSpendLabel: "Hoặc chi tiêu mỗi năm, giá hôm nay",
    yearsShortLabel: "Số năm nghỉ hưu chưa được cấp vốn",
    yearsUnit: "năm",

    table: {
      caption: "Cùng mức góp, thay đổi tuổi nghỉ hưu",
      ageColumn: "Nghỉ hưu ở tuổi",
      reachedColumn: "Vốn sẽ có",
      requiredColumn: "Vốn cần có",
      coverageColumn: "Đáp ứng",
      depletionColumn: "Cạn ở tuổi",
      neededColumn: "Mức góp cần thiết",
      never: "Không cạn",
      intro:
        "Bảng này là công cụ mạnh nhất trên trang, vì lùi tuổi nghỉ hưu tác động lên CẢ HAI vế: vốn sẽ có tăng lên, và vốn cần có giảm đi vì kỳ nghỉ hưu ngắn hơn. Hai lưỡi cùng cắt vào một khoảng thiếu.",
    },

    fundedNotice:
      "Kế hoạch hiện tại đủ cho mức chi tiêu này đến hết kỳ dự phóng. Dòng “mức góp cần thiết” trong bảng cho biết bạn có thể giảm khoản góp xuống bao nhiêu mà vẫn đủ — nhưng hãy nhớ toàn bộ phép tính này dùng một lợi suất đều, không có biến động, nên phần dư chính là biên an toàn duy nhất bạn có.",
    gapNotice:
      "Tỷ lệ đáp ứng vốn 88,9% nghe như gần tới đích, nhưng kế hoạch này cạn tiền ở tuổi 90 — thiếu 5 trong 30 năm nghỉ hưu. Hai con số đó không mâu thuẫn: thiếu 11,1% vốn không làm mỗi năm nghỉ hưu thiếu 11,1% tiền, nó làm 5 năm cuối không còn đồng nào. Hãy đọc “tỷ lệ đáp ứng” như một thước đo khoảng cách, không phải như mức độ thoải mái.",
    unsolvableNotice:
      "Không có mức góp nào trong khoảng công cụ tìm kiếm bù được khoảng thiếu này. Hãy xem bảng theo tuổi nghỉ hưu, hoặc hạ mức chi tiêu mong muốn — hai cách bù còn lại vẫn còn tác dụng ở đây.",
    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi nghỉ hưu < tuổi kết thúc, và toàn kỳ không quá 100 năm.",
  },

  coverageNotice:
    "Với các giả định mặc định, kế hoạch đạt 88,9% số vốn cần có — và cạn tiền ở tuổi 90, tức thiếu 5 trong 30 năm nghỉ hưu. Đó là lý do trang này không dừng lại ở một tỷ lệ phần trăm: 11,1% vốn còn thiếu tương đương 131.532 USD theo giá hôm nay, và bù nó cần góp thêm 352,09 USD/tháng — tăng 28,2% so với mức đang góp. Nhưng cách rẻ nhất lại không nằm ở cột góp: nghỉ hưu ở tuổi 67 thay vì 65 biến khoảng thiếu thành thặng dư, và mức góp cần thiết khi đó chỉ còn 13.670,88 USD/năm, THẤP HƠN cả mức 15.000 bạn đang góp.",

  formula: {
    title: "Cách tính",
    body: [
      "Phép so sánh có hai vế, cả hai đều tính theo giá hôm nay. Vế “sẽ có” là số dư mà phép dự phóng tích lũy đạt được ở tuổi nghỉ hưu. Vế “cần có” là số vốn mà mức chi tiêu mong muốn đòi hỏi — phần chi tiêu vượt trên thu nhập khác, nhân với hệ số niên kim đầu kỳ theo lợi suất thực.",
      "Hai vế đó là nghịch đảo chính xác của nhau trong module: cùng một hệ số niên kim sinh ra “chi tiêu duy trì được” khi chia và “vốn cần có” khi nhân. Đây không phải chi tiết kỹ thuật vụn vặt — nếu trang tự tính hệ số này thì nó rất dễ lệch đúng một lần (1 + lợi suất thực), và bộ kiểm thử quét qua bốn tham số để chốt rằng hai chiều luôn khớp.",
      "Thu nhập khác không cần vốn, nên nó bị trừ khỏi chi tiêu TRƯỚC khi nhân hệ số. Nếu thu nhập khác đã bằng hoặc vượt chi tiêu mong muốn, vốn cần có bằng 0 và tỷ lệ đáp ứng không tồn tại — công cụ để trống ô đó chứ không ghi 100%, vì hai điều đó khác nhau.",
      "Lợi suất sau khi nghỉ hưu xuất hiện ở vế “cần có”, không phải vế “sẽ có”: lợi suất càng cao thì cùng một mức chi tiêu cần ít vốn hơn. Đây là chỗ dễ tự lừa mình nhất trên trang — nâng lợi suất sau nghỉ hưu lên 7% làm khoảng thiếu biến mất trên màn hình mà không thay đổi gì trong tài khoản của bạn.",
      "Ba cách bù được tính bằng ba phép giải riêng, không phải bằng cách chia khoảng thiếu ra. Mức góp cần thiết là nghiệm của phép dò trên chính bản dự phóng. Tuổi nghỉ hưu cần thiết là tuổi thấp nhất mà kế hoạch hiện tại không còn cạn tiền. Mức chi tiêu duy trì được là con số niên kim ở trên.",
      "Toàn bộ trang dùng một lợi suất đều mỗi năm và không mô phỏng biến động, nên nó không nói được gì về rủi ro thứ tự lợi suất — rủi ro mà chính người vừa nghỉ hưu chịu nặng nhất. Một kế hoạch “đủ” ở đây vẫn có thể hụt trong thực tế nếu một đợt giảm mạnh xảy ra ngay đầu giai đoạn rút tiền.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao thiếu 11% vốn lại mất tới 5 năm nghỉ hưu?",
        a: "Vì tiền trong những năm cuối được cấp vốn bởi phần thặng dư của những năm đầu. Khoản rút mỗi năm là một con số gần như cố định theo giá thực, còn số dư thì vừa bị rút vừa sinh lãi. Khi vốn ban đầu ít hơn 11%, phần lãi kém đi cũng theo tỷ lệ đó, và tổng số năm mà vốn cộng lãi còn chống đỡ được giảm nhanh hơn nhiều so với 11%. Ở kỳ 30 năm với lợi suất thực khoảng 2,4%, quan hệ giữa vốn và số năm không phải đường thẳng — đó là lý do công cụ luôn hiển thị tuổi cạn tiền bên cạnh tỷ lệ đáp ứng, chứ không để bạn tự suy ra.",
      },
      {
        q: "Vì sao lùi tuổi nghỉ hưu hiệu quả hơn góp thêm nhiều thế?",
        a: "Vì nó tác động lên cả hai vế cùng lúc. Với các giả định mặc định, lùi từ 65 lên 67 làm vốn sẽ có tăng từ 1.057.356 lên 1.181.188 USD — hai năm góp thêm cộng hai năm lãi kép trên toàn bộ số dư — và đồng thời làm vốn cần có giảm từ 1.188.888 xuống 1.133.533 USD, vì kỳ nghỉ hưu ngắn đi hai năm. Góp thêm chỉ tác động lên vế thứ nhất. Đây cũng là lý do nên xem bảng trước khi quyết định tăng khoản góp: hai năm làm việc thêm có thể rẻ hơn mười năm góp thêm 28%.",
      },
      {
        q: "Tỷ lệ đáp ứng trên 100% thì có nên giảm khoản góp không?",
        a: "Hãy cẩn thận. Toàn bộ phép tính này dùng một lợi suất đều và không có biến động, không có năm nào lỗ, không có rủi ro thứ tự lợi suất và không có chi phí y tế bất thường. Thặng dư mà công cụ hiển thị chính là biên an toàn duy nhất trong mô hình. Cách dùng đúng hơn là giữ mức góp và đọc thặng dư như một vùng đệm, hoặc thử hạ lợi suất giả định xuống 1–2 điểm phần trăm rồi xem kế hoạch còn “đủ” hay không — nếu còn, khi đó thặng dư mới là thật.",
      },
      {
        q: "Công cụ có tính thuế và phí không?",
        a: "Không. Mọi con số là số gộp. Với 401(k) và IRA truyền thống, khoản rút chịu thuế thu nhập thông thường, nên vốn cần có thực tế cao hơn con số này — nếu thuế suất dự kiến của bạn là 22%, hãy nhập mức chi tiêu mong muốn chia cho 0,78. Phí quản lý quỹ cũng không có trong đây: 1%/năm phí không làm giảm 1% kết quả mà làm giảm khoảng một phần tư tổng lợi nhuận sau ba mươi năm, và trang phí quỹ đầu tư trong bộ công cụ này định lượng riêng phần đó.",
      },
      {
        q: "Nên tin vế “sẽ có” hay vế “cần có” hơn?",
        a: "Vế “cần có” chắc chắn hơn, vì nó phụ thuộc vào ít giả định hơn: chi tiêu bạn muốn, thu nhập khác, số năm nghỉ hưu và một lợi suất thực. Vế “sẽ có” phụ thuộc thêm vào lợi suất trong hai ba mươi năm tới và vào việc bạn có thực sự góp đúng như đã nhập — cả hai đều là điều không ai biết. Nếu phải nhìn một con số duy nhất, hãy nhìn “vốn cần có, giá hôm nay”: đó là mục tiêu, và nó không đổi theo tâm trạng thị trường.",
      },
    ],
  },
} as const;
