// Copy for /cong-cu/thu-nhap-huu-tri/.
//
// Original FinHome copy. Models UNITED STATES retirement practice —
// registry sets usRules: true.
//
// Shares lib/calc/retirement.ts and components/calc/retirement-fields.tsx
// with the other retirement projection pages. This one SOLVES for the
// spending, so the "chi tiêu mong muốn" field is omitted from the form.
//
// Figures quoted are projectRetirement's output, verified by running it on
// this page's own defaults (35 tuổi, nghỉ 65, đến 95; dư 100.000; góp
// 20.000/năm +2%/năm; lợi suất 7% trước / 5% sau; lạm phát 2,5%; thu nhập
// khác 25.000/năm theo giá hôm nay):
//   Thu nhập bền vững 96.546,38 USD/năm = 8.045,53 USD/tháng, giá hôm nay
//   Trong đó rút từ danh mục 71.546,38 USD/năm = 5.962,20 USD/tháng
//   Tỷ lệ rút năm đầu 4,63%
//   Số dư khi nghỉ hưu 3.244.007,90 danh nghĩa / 1.546.557,04 giá hôm nay
//   Khoản rút DANH NGHĨA: 150.073,36 USD ở tuổi 65 -> 307.111,24 ở tuổi 94,
//     trong khi khoản rút theo GIÁ HÔM NAY đứng yên ở 71.546,38 cả 30 năm
//   Tổng rút cả kỳ 6.588.626 USD danh nghĩa, từ 811.362 USD đã góp
//   Quy tắc 4% trên cùng số dư: 61.862,28 USD/năm = 5.155,19 USD/tháng —
//     công cụ này cho cao hơn 15,7% vì nó cố ý tiêu hết tiền ở tuổi 95
//   Dự phóng đến 105 thay vì 95: rút từ danh mục còn 59.526 USD/năm
//     = 4.961 USD/tháng, thấp hơn 16,8%
//   Không có thu nhập khác: tổng thu nhập bằng 71.546 USD/năm
//   Đưa đúng con số bền vững trở lại phép dự phóng: không cạn tiền, số dư
//     cuối kỳ 0. Cộng thêm 1.000 USD/năm: cạn ở tuổi 94.

export const RETIREMENT_INCOME = {
  slug: "/cong-cu/thu-nhap-huu-tri",

  pageTitle: "Thu nhập hưu trí",
  metaTitle: "Thu nhập hưu trí — Mức rút hằng tháng khoản tích lũy duy trì được",
  metaDescription:
    "Từ kế hoạch tích lũy của bạn, công cụ tính mức rút hằng tháng mà số dư có thể duy trì suốt kỳ nghỉ hưu, tính theo giá hôm nay. Công cụ miễn phí của FinHome.",

  lede:
    "Câu hỏi ngược của một kế hoạch hưu trí: với những gì bạn đang tích lũy, mỗi tháng bạn sẽ rút được bao nhiêu? Con số chính được tính theo GIÁ HÔM NAY, vì đó là đơn vị duy nhất bạn có thể so sánh với chi phí sinh hoạt hiện tại của mình.",

  fields: {
    ageGroup: "Các mốc tuổi",
    balanceGroup: "Tích lũy",
    spendingGroup: "Thu nhập khác khi nghỉ hưu",
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
        label: "Rút tiền đến tuổi",
        unit: "tuổi",
        help: "Mức rút được tính sao cho tiền vừa hết đúng tuổi này — nên tuổi này càng cao thì mức rút càng thấp.",
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
      // Solved, not asked — omitted from the form. The copy stays so the
      // shared RetirementCopy type is satisfied without a second shape.
      desiredAnnualSpending: {
        label: "Chi tiêu mong muốn mỗi năm",
        unit: "USD",
        help: "Trang này giải ra con số này, nên không hỏi.",
      },
      otherAnnualIncome: {
        label: "Thu nhập khác mỗi năm khi nghỉ hưu",
        unit: "USD",
        help: "An sinh xã hội, lương hưu, tiền cho thuê — theo giá hôm nay. Phần này cộng thẳng vào kết quả và không phụ thuộc số dư.",
      },
      returnBeforePercent: {
        label: "Lợi suất trước khi nghỉ hưu",
        unit: "%/năm",
        help: "Danh nghĩa, chưa trừ lạm phát.",
      },
      returnAfterPercent: {
        label: "Lợi suất sau khi nghỉ hưu",
        unit: "%/năm",
        help: "Quyết định mức rút bền vững, cùng với lạm phát: chỉ phần CHÊNH giữa hai con số này mới sinh ra tiền để rút.",
      },
      inflationPercent: {
        label: "Lạm phát",
        unit: "%/năm",
        help: "Dùng để quy mọi con số về giá hôm nay và để tăng khoản rút danh nghĩa theo từng năm.",
      },
    },
  },

  form: {
    resultTitle: "Mức rút bền vững",
    monthlyLabel: "Thu nhập mỗi tháng, giá hôm nay",
    portfolioMonthlyLabel: "Trong đó rút từ danh mục",
    firstNominalLabel: "Khoản rút năm đầu, danh nghĩa",
    initialRateLabel: "Tỷ lệ rút năm đầu",

    detailTitle: "Chi tiết cả kỳ",
    annualLabel: "Thu nhập mỗi năm, giá hôm nay",
    portfolioAnnualLabel: "Rút từ danh mục mỗi năm, giá hôm nay",
    lastNominalLabel: "Khoản rút năm cuối, danh nghĩa",
    realBalanceLabel: "Số dư khi nghỉ hưu, giá hôm nay",
    nominalBalanceLabel: "Số dư khi nghỉ hưu, danh nghĩa",
    totalWithdrawnLabel: "Tổng rút cả kỳ, danh nghĩa",

    table: {
      caption: "Giai đoạn rút tiền theo từng năm",
      ageColumn: "Tuổi",
      nominalColumn: "Rút danh nghĩa",
      realColumn: "Rút giá hôm nay",
      balanceColumn: "Số dư danh nghĩa",
      realBalanceColumn: "Số dư giá hôm nay",
      intro:
        "Hai cột giữa là toàn bộ nội dung của trang này. Cột “rút danh nghĩa” hơn gấp đôi trong 30 năm; cột “rút giá hôm nay” đứng yên. Cùng một khoản rút, và chỉ cột thứ hai nói cho bạn biết mình mua được gì.",
    },

    invalidNotice:
      "Các mốc tuổi phải theo thứ tự: tuổi hiện tại ≤ tuổi nghỉ hưu < tuổi kết thúc, và toàn kỳ không quá 100 năm.",
    noBalanceNotice:
      "Không có số dư nào khi nghỉ hưu, nên toàn bộ thu nhập ở trên là phần “thu nhập khác” bạn đã nhập. Đó là con số đúng, không phải 0: an sinh xã hội hay lương hưu vẫn được trả khi danh mục đã hết.",
  },

  zeroNotice:
    "Con số này KHÔNG phải một tỷ lệ rút an toàn vĩnh viễn. Nó được tính sao cho tiền vừa hết đúng ở tuổi bạn nhập vào ô “rút tiền đến tuổi” — với giá trị mặc định là 95. Sống đến 105 thì cùng số dư đó chỉ rút được 4.961 USD/tháng từ danh mục thay vì 5.962, tức thấp hơn 16,8%. Vì kỳ vọng sống là số trung vị, một nửa số người sống lâu hơn nó, nên hãy nhập tuổi cao hơn kỳ vọng sống rồi đọc kết quả, thay vì đọc kết quả ở tuổi kỳ vọng rồi tự trừ đi một biên an toàn.",

  formula: {
    title: "Cách tính",
    body: [
      "Số dư khi nghỉ hưu được lấy từ đúng phép dự phóng tích lũy của trang kế hoạch hưu trí, rồi quy về giá hôm nay. Mức rút bền vững là mức rút đều theo giá hôm nay làm cạn đúng số dư đó ở tuổi kết thúc — cộng thêm phần thu nhập khác, thứ không phụ thuộc vào số dư.",
      "Phép giải là một niên kim ĐẦU KỲ tính trên lợi suất THỰC, tức (1 + lợi suất sau nghỉ hưu) / (1 + lạm phát) − 1. Với 5% và 2,5%, lợi suất thực là 2,44%/năm, không phải 2,5%: hiệu của hai tỷ lệ là một phép tính gần đúng, và ở kỳ 30 năm nó đủ sai để lệch kết quả.",
      "Đầu kỳ chứ không phải cuối kỳ, vì phép dự phóng rút tiền vào đầu năm rồi mới tính lợi nhuận trên phần còn lại. Dùng hệ số cuối kỳ sẽ phóng đại mức rút an toàn theo tỷ lệ (1 + lợi suất thực) — đủ để một kế hoạch báo “đủ” nhưng cạn sớm hai năm.",
      "Khoản rút hiển thị theo hai đơn vị vì chúng khác nhau rất xa. Với các giả định mặc định, khoản rút danh nghĩa là 150.073 USD ở tuổi 65 và 307.111 USD ở tuổi 94; khoản rút theo giá hôm nay là 71.546 USD ở cả hai năm. Bảng bên dưới đặt hai cột cạnh nhau, và module tính sẵn cả hai bằng hai hệ số lạm phát khác nhau — dòng tiền chuyển vào đầu năm, số dư là con số cuối năm — để không trang nào phải tự chia.",
      "Phần “thu nhập khác” được cộng vào sau cùng và không nhân với hệ số niên kim nào, vì nó không rút từ số dư: an sinh xã hội hay lương hưu được trả đều bất kể danh mục còn hay hết. Đó cũng là lý do khi số dư bằng 0 thì kết quả bằng đúng phần thu nhập khác, chứ không bằng 0.",
      "Một phép kiểm chứng: đưa con số bền vững này trở lại phép dự phóng dưới dạng chi tiêu mong muốn thì kế hoạch không cạn tiền và số dư cuối kỳ bằng 0. Cộng thêm 1.000 USD/năm thì nó cạn ở tuổi 94. Đó là bằng chứng con số này đúng là mức tối đa, chứ không phải một mức an toàn chọn bừa.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Sao lại là 4,63% mà không phải quy tắc 4%?",
        a: "Vì hai con số trả lời hai câu hỏi khác nhau. Quy tắc 4% ra đời từ các nghiên cứu về kỳ 30 năm với danh mục cổ phiếu–trái phiếu và mục tiêu là KHÔNG hết tiền trong phần lớn các chuỗi lợi suất lịch sử — kể cả các chuỗi xấu nhất. Công cụ này thì cố ý tiêu hết tiền đúng ở tuổi bạn nhập, với một lợi suất đều không có biến động. Trên cùng số dư mặc định, quy tắc 4% cho 61.862 USD/năm còn công cụ này cho 71.546 USD/năm, cao hơn 15,7% — và toàn bộ khoảng cách đó là phần bạn đánh đổi bằng việc không còn biên an toàn nào.",
      },
      {
        q: "Vì sao lợi suất sau nghỉ hưu quan trọng hơn lợi suất trước?",
        a: "Không hẳn quan trọng hơn, nhưng nó tác động theo một cách khác. Lợi suất trước nghỉ hưu quyết định số dư bạn có. Lợi suất sau nghỉ hưu quyết định số dư đó chia được thành bao nhiêu — và nó chỉ có tác dụng qua phần CHÊNH với lạm phát. Nếu lợi suất sau nghỉ hưu bằng đúng lạm phát, mức rút chỉ còn là số dư chia cho số năm, không hơn. Đây cũng là lý do đừng đặt lợi suất sau nghỉ hưu quá cao để có một con số dễ chịu: mỗi điểm phần trăm bạn thêm vào là một điểm phần trăm rủi ro bạn phải thực sự gánh trong đúng 30 năm mình không còn thu nhập.",
      },
      {
        q: "Rủi ro thứ tự lợi suất có được tính không?",
        a: "Không, và đây là hạn chế lớn nhất của công cụ. Nó dùng một lợi suất đều mỗi năm. Người đang rút tiền chịu thêm rủi ro về THỨ TỰ lợi suất: một đợt giảm 30% trong hai năm đầu giai đoạn rút gây thiệt hại lớn hơn nhiều so với đúng đợt giảm đó xảy ra ở năm thứ 20, vì tài sản bị bán ra đúng lúc giá thấp và phần bị bán ấy không còn ở đó để hồi phục. Với cùng một lợi suất bình quân, hai thứ tự khác nhau cho hai kết cục khác nhau. Hãy đọc con số này như mức rút trong một kịch bản thuận lợi, và giữ vài năm chi tiêu ở dạng tiền mặt để không phải bán tài sản trong một đợt giảm.",
      },
      {
        q: "Thu nhập khác có tự tăng theo lạm phát không?",
        a: "Trong công cụ này thì có: bạn nhập theo giá hôm nay và nó được quy đổi sang từng năm tương lai đúng bằng lạm phát. Điều đó đúng với an sinh xã hội Hoa Kỳ, vốn có điều chỉnh theo giá sinh hoạt hằng năm. Nhưng nó KHÔNG đúng với phần lớn lương hưu doanh nghiệp và niên kim cố định, những khoản trả một số tiền danh nghĩa không đổi — và sau 30 năm lạm phát 2,5%, số tiền đó chỉ còn mua được khoảng 48% lượng hàng hóa ban đầu. Nếu thu nhập khác của bạn là loại không điều chỉnh, hãy nhập một con số thấp hơn đáng kể so với mức được hứa trả, hoặc dùng trang phân tích thu nhập hưu trí để tách riêng từng nguồn.",
      },
      {
        q: "Con số này đã trừ thuế chưa?",
        a: "Chưa. Đây là khoản rút gộp. Với 401(k) và IRA truyền thống, toàn bộ khoản rút chịu thuế thu nhập thông thường, nên số tiền bạn thực sự tiêu được thấp hơn — ở thuế suất biên 22% thì 5.962 USD/tháng rút từ danh mục chỉ còn 4.651 USD để tiêu. Với Roth thì khoản rút đúng điều kiện không chịu thuế. Với một danh mục có cả hai loại, thứ tự rút giữa các tài khoản tự nó là một quyết định về thuế, và không có công cụ nào trong bộ này mô hình hóa việc đó.",
      },
    ],
  },
} as const;
