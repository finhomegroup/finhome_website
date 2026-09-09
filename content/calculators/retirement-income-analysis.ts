// Copy for /cong-cu/phan-tich-thu-nhap-huu-tri/.
//
// Original FinHome copy. Models UNITED STATES retirement practice —
// registry sets usRules: true.
//
// The one retirement page that does NOT use lib/calc/retirement.ts, because
// that module inflates all non-portfolio income at one rate. This page's
// whole subject is that the sources index differently, so it runs
// lib/calc/retirement-income-sources.ts instead. See that module's docstring.
//
// Figures quoted are projectIncomeSources' output, verified by running it on
// this page's own defaults (nhận từ 67 đến 95; chi 80.000/năm theo giá năm
// 67; lạm phát 2,5%; danh mục 600.000 sinh lời 5%; an sinh xã hội
// 30.000 có COLA; lương hưu 18.000 KHÔNG điều chỉnh; làm thêm 12.000 đến
// tuổi 72; thu nhập khác 6.000 có điều chỉnh):
//   Năm đầu: nguồn cố định 66.000,00 USD lo được 82,5% nhu cầu;
//     rút từ danh mục 14.000,00 USD, bằng 2,33% số dư
//   Năm cuối (94): nguồn cố định 88.120,80 danh nghĩa nhưng chỉ bằng
//     45.241,20 theo giá năm 67 — lo được 56,6%
//     Nhu cầu năm đó là 155.824,00 danh nghĩa cho 80.000 giá năm 67
//     Rút từ danh mục 67.703,20 danh nghĩa = 34.758,80 theo giá năm 67,
//     tức gấp 2,48 lần khoản rút thực năm đầu
//   Tuổi 72 vẫn 79,9%; sang 73 (hết làm thêm) rơi xuống 64,4%
//   Lương hưu 18.000 giữ được 51,3% sức mua: bằng 9.241 USD giá năm 67
//   Danh mục không cạn; số dư cuối kỳ 166.983 danh nghĩa = 83.638 giá năm 67
//   Ai trả cho 28 năm nghỉ hưu, theo giá năm 67: an sinh xã hội 840.000
//     (37,5%), lương hưu 368.352 (16,4%), làm thêm 72.000 (3,2%), khác
//     168.000 (7,5%), danh mục 791.648 (35,3%); tổng nhu cầu 2.240.000
//   Nếu lương hưu CÓ điều chỉnh theo lạm phát: danh mục chỉ phải trả
//     656.000 thay vì 791.648 — điều khoản điều chỉnh đáng 135.648 USD
//     theo giá năm 67, và số dư cuối kỳ là 517.442 thay vì 166.983

export const RETIREMENT_INCOME_ANALYSIS = {
  slug: "/cong-cu/phan-tich-thu-nhap-huu-tri",

  pageTitle: "Phân tích thu nhập hưu trí",
  metaTitle: "Phân tích thu nhập hưu trí — Từng nguồn thu và sức mua của nó",
  metaDescription:
    "Ghép an sinh xã hội, lương hưu, làm thêm và danh mục đầu tư thành một dòng thu nhập, rồi cho thấy sức mua của từng nguồn thay đổi thế nào qua ba mươi năm. Công cụ miễn phí của FinHome.",

  lede:
    "Các nguồn thu nhập khi nghỉ hưu không già đi cùng một tốc độ. An sinh xã hội Hoa Kỳ được điều chỉnh theo giá sinh hoạt; phần lớn lương hưu doanh nghiệp và mọi hợp đồng niên kim cố định thì trả một số tiền không đổi; công việc làm thêm thì dừng hẳn. Trang này tính từng nguồn theo tốc độ của riêng nó, và cho biết phần thiếu rơi vào danh mục đầu tư của bạn nặng dần đến đâu.",

  form: {
    needGroup: "Thời gian và nhu cầu",
    startAgeLabel: "Tuổi bắt đầu nhận",
    startAgeUnit: "tuổi",
    startAgeHelp:
      "Dự phóng bắt đầu ở tuổi này, và MỌI số tiền bạn nhập bên dưới là số tiền theo giá của năm đó.",
    endAgeLabel: "Dự phóng đến tuổi",
    endAgeUnit: "tuổi",
    endAgeHelp:
      "Không tính năm này. Từ 67 đến 95 là 28 năm nhận thu nhập.",
    needLabel: "Chi tiêu mỗi năm",
    needUnit: "USD",
    needHelp:
      "Theo giá năm bắt đầu. Nhu cầu được coi là tăng đúng bằng lạm phát, nên sức mua của nó không đổi.",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",

    fixedGroup: "An sinh xã hội và lương hưu",
    socialLabel: "An sinh xã hội mỗi năm",
    socialUnit: "USD",
    socialHelp:
      "Trang này không hỏi mức điều chỉnh của khoản này: an sinh xã hội Hoa Kỳ có điều chỉnh theo giá sinh hoạt theo luật, nên công cụ cho nó tăng đúng bằng lạm phát bạn nhập. Trả suốt đời.",
    pensionLabel: "Lương hưu doanh nghiệp mỗi năm",
    pensionUnit: "USD",
    pensionHelp:
      "Trả suốt đời. Nếu bạn không biết mức điều chỉnh, hãy để 0 — đó là trường hợp phổ biến nhất và cũng là trường hợp tốn kém nhất.",
    pensionIndexLabel: "Lương hưu được điều chỉnh",
    pensionIndexUnit: "%/năm",
    pensionIndexHelp:
      "0 là số tiền cố định suốt đời. Một số quỹ có điều khoản 1–2%/năm; rất ít quỹ điều chỉnh đủ bằng lạm phát.",

    flexGroup: "Làm thêm và thu nhập khác",
    workLabel: "Làm thêm mỗi năm",
    workUnit: "USD",
    workHelp:
      "Tư vấn, làm bán thời gian. Được coi là tăng theo lạm phát vì tiền công đi theo giá cả.",
    workThroughLabel: "Làm thêm đến hết tuổi",
    workThroughUnit: "tuổi",
    workThroughHelp:
      "Tính cả tuổi này. Nếu nhỏ hơn tuổi bắt đầu nhận thì coi như bạn không làm thêm.",
    otherLabel: "Thu nhập khác mỗi năm",
    otherUnit: "USD",
    otherHelp: "Cho thuê, niên kim, cổ tức ngoài danh mục hưu trí. Trả suốt đời.",
    otherIndexLabel: "Thu nhập khác được điều chỉnh",
    otherIndexUnit: "%/năm",
    otherIndexHelp:
      "Tiền cho thuê thường đi gần với lạm phát; niên kim cố định thì bằng 0. Đây là hai thứ rất khác nhau nên công cụ để bạn tự chọn.",

    portfolioGroup: "Danh mục và giả định",
    balanceLabel: "Số dư danh mục khi bắt đầu",
    balanceUnit: "USD",
    balanceHelp:
      "Toàn bộ tài khoản hưu trí. Danh mục là nguồn bù phần các khoản trên không lo được.",
    returnLabel: "Lợi suất danh mục",
    returnUnit: "%/năm",
    returnHelp: "Danh nghĩa, chưa trừ lạm phát.",
    inflationLabel: "Lạm phát",
    inflationUnit: "%/năm",
    inflationHelp:
      "Quyết định ba thứ cùng lúc: nhu cầu tăng bao nhiêu, an sinh xã hội và làm thêm tăng bao nhiêu, và sức mua của lương hưu cố định mất bao nhiêu.",

    defaults: {
      startAge: "67",
      endAge: "95",
      need: "80.000",
      social: "30.000",
      pension: "18.000",
      pensionIndex: "0",
      work: "12.000",
      workThrough: "72",
      other: "6.000",
      otherIndex: "2,5",
      balance: "600.000",
      returnPercent: "5",
      inflation: "2,5",
    },

    resultTitle: "Nguồn cố định lo được bao nhiêu",
    firstCoverageLabel: "Năm đầu",
    lastCoverageLabel: "Năm cuối",
    firstDrawLabel: "Rút từ danh mục năm đầu, giá năm đầu",
    lastDrawLabel: "Rút từ danh mục năm cuối, giá năm đầu",

    portfolioTitle: "Danh mục đầu tư",
    initialRateLabel: "Tỷ lệ rút năm đầu",
    depletionLabel: "Danh mục cạn ở tuổi",
    unmetLabel: "Bắt đầu thiếu hụt ở tuổi",
    finalRealLabel: "Số dư cuối kỳ, giá năm đầu",

    sourceTable: {
      caption: "Từng nguồn ở hai đầu của kỳ nghỉ hưu",
      sourceColumn: "Nguồn",
      firstColumn: "Năm đầu",
      lastNominalColumn: "Năm cuối, danh nghĩa",
      lastRealColumn: "Năm cuối, giá năm đầu",
      keptColumn: "Sức mua giữ được",
      shareColumn: "Tỷ trọng cả kỳ",
      names: {
        social: "An sinh xã hội",
        pension: "Lương hưu doanh nghiệp",
        work: "Làm thêm",
        other: "Thu nhập khác",
      },
      portfolioName: "Danh mục đầu tư",
      needName: "Tổng nhu cầu",
      intro:
        "Cột “năm cuối, danh nghĩa” và cột “năm cuối, giá năm đầu” là cùng một số tiền viết theo hai đơn vị. Khoảng cách giữa chúng chính là thứ mà một bảng kế hoạch chỉ ghi số danh nghĩa đã giấu đi.",
    },

    yearTable: {
      caption: "Từng năm nghỉ hưu",
      ageColumn: "Tuổi",
      needColumn: "Nhu cầu danh nghĩa",
      fixedColumn: "Nguồn cố định",
      coverageColumn: "Lo được",
      drawColumn: "Rút danh mục",
      realDrawColumn: "Rút, giá năm đầu",
      balanceColumn: "Số dư, giá năm đầu",
      intro:
        "Bảng hiển thị mỗi 4 năm cùng năm cuối cùng của phần làm thêm và năm cuối kỳ. Cột “lo được” là con số cần theo dõi: nó đi xuống ngay cả khi mọi con số danh nghĩa trong bảng đều đi lên.",
    },

    unmetNotice:
      "Danh mục cạn trước khi hết kỳ, nên từ tuổi đó trở đi tổng thu nhập không còn đủ cho mức chi tiêu đã nhập. Phần thiếu hiện ở bảng theo từng năm. Điều đáng lưu ý là nó đến vào cuối kỳ, đúng lúc bạn còn ít lựa chọn nhất: khi đó việc quay lại làm việc hay đợi thị trường hồi phục đều không còn khả thi.",
    coveredNotice:
      "Danh mục trụ được đến hết kỳ dự phóng. Nhưng hãy so hai dòng đầu: phần các nguồn cố định lo được giảm dần suốt kỳ, nên gánh nặng dịch sang danh mục theo thời gian. Một kế hoạch chỉ kiểm tra năm đầu tiên sẽ không thấy điều đó.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Tuổi bắt đầu nhận phải nhỏ hơn tuổi kết thúc, và toàn kỳ không quá 100 năm.",
  },

  decayNotice:
    "Với các giả định mặc định, các nguồn cố định lo được 82,5% chi tiêu trong năm đầu và chỉ 56,6% trong năm cuối — dù mọi con số danh nghĩa đều tăng. Hai nguyên nhân cộng lại: khoản làm thêm dừng ở tuổi 72, và khoản lương hưu 18.000 USD không đổi chỉ còn mua được bằng 9.241 USD giá năm 67, tức giữ lại 51,3% sức mua. Hệ quả rơi vào danh mục: nó phải cấp 14.000 USD trong năm đầu và 34.759 USD trong năm cuối, tính theo cùng một đơn vị tiền. Đó là 2,48 lần, và không đồng nào trong phần tăng đó đến từ việc bạn tiêu nhiều hơn.",

  formula: {
    title: "Cách tính",
    body: [
      "Mỗi nguồn tăng theo tốc độ danh nghĩa của riêng nó, tính từ năm đầu tiên. An sinh xã hội và làm thêm tăng đúng bằng lạm phát bạn nhập; lương hưu và thu nhập khác tăng theo tỷ lệ bạn tự nhập, mặc định lương hưu là 0. Nhu cầu chi tiêu cũng tăng bằng lạm phát, nên sức mua của nó không đổi và mọi thay đổi trong dòng “lo được” đều đến từ phía thu nhập.",
      "Mỗi năm, phần nhu cầu mà các nguồn cố định không lo được sẽ rút từ danh mục, nhưng không bao giờ rút quá số dư. Lợi nhuận được tính trên phần CÒN LẠI sau khi rút — tính lợi nhuận trước sẽ cấp vốn cho kế hoạch bằng lợi nhuận trên số tiền đã tiêu. Nếu số dư không đủ, phần còn thiếu được ghi lại thành thiếu hụt chứ không bị làm tròn đi.",
      "Mọi con số đều có hai phiên bản: danh nghĩa và theo giá năm đầu. Module dùng hai hệ số lạm phát khác nhau cho hai loại — dòng tiền chuyển vào đầu năm, số dư là con số cuối năm — nên chúng cách nhau đúng một năm lạm phát. Đây là chi tiết dễ sai và sai thì không ai thấy, nên nó nằm trong module chứ không nằm ở trang.",
      "Cột “sức mua giữ được” là giá trị thực của khoản chi trả năm cuối so với giá trị thực của khoản chi trả năm đầu. Nguồn được điều chỉnh đủ bằng lạm phát cho 100%; nguồn cố định cho 51,3% ở kỳ 28 năm với lạm phát 2,5%. Một nguồn đã dừng chi trả thì để trống, không ghi 0% — “đã hết” và “mất hết giá trị” là hai chuyện khác nhau.",
      "Cột “tỷ trọng cả kỳ” cộng tất cả các khoản chi trả của một nguồn sau khi đã quy về giá năm đầu, rồi chia cho tổng nhu cầu cả kỳ tính cùng đơn vị. Tổng các tỷ trọng cộng phần danh mục và phần thiếu hụt luôn bằng 100%, và bộ kiểm thử chốt đúng đẳng thức đó — một sổ sách không tự khớp thì không cần số liệu tham chiếu nào để chứng minh là sai.",
      "Trang này không mô hình hóa thuế, không mô hình hóa trợ cấp cho người còn sống khi một trong hai vợ chồng qua đời, và dùng một lợi suất đều nên không nói gì về rủi ro thứ tự lợi suất. Nó chỉ trả lời đúng một câu hỏi: các nguồn thu nhập của bạn già đi thế nào.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Điều khoản điều chỉnh theo lạm phát của lương hưu đáng bao nhiêu tiền?",
        a: "Với các giả định mặc định, đúng 135.648 USD theo giá năm bắt đầu. Nếu khoản lương hưu 18.000 USD được điều chỉnh đủ bằng lạm phát, danh mục chỉ phải cấp 656.000 USD trong cả kỳ thay vì 791.648 USD, và số dư cuối kỳ là 517.442 USD thay vì 166.983 USD. Đây là con số nên mang ra khi so hai phương án nhận lương hưu, hoặc khi cân nhắc giữa nhận một lần và nhận theo tháng: một khoản trả cố định suốt đời là một khoản trái phiếu không chống lạm phát, và ở kỳ ba mươi năm thì điều đó tốn kém hơn phần lớn người nhận hình dung.",
      },
      {
        q: "Vì sao tỷ lệ rút năm đầu 2,33% trông rất an toàn mà kế hoạch vẫn chật vật?",
        a: "Vì tỷ lệ rút năm đầu không phải là tỷ lệ rút của những năm sau. Quy tắc 4% giả định khoản rút giữ nguyên sức mua suốt kỳ; ở đây khoản rút thực TĂNG, vì nó phải bù cho phần các nguồn cố định mất dần. Khoản rút thực năm cuối là 34.759 USD, gấp 2,48 lần năm đầu. Đó là lý do một tỷ lệ rút năm đầu thấp không phải bằng chứng kế hoạch an toàn, khi trong danh mục thu nhập của bạn có một khoản trả cố định lớn.",
      },
      {
        q: "Vì sao công cụ không cho tôi nhập mức điều chỉnh của an sinh xã hội?",
        a: "Vì nó không phải một biến bạn chọn. An sinh xã hội Hoa Kỳ có cơ chế điều chỉnh theo giá sinh hoạt được ấn định trong luật, gắn với một chỉ số giá tiêu dùng, nên trong dài hạn nó giữ được sức mua. Công cụ cho khoản này tăng đúng bằng lạm phát bạn nhập, và như vậy mức lạm phát bạn chọn cũng chính là mức điều chỉnh bạn giả định — hai thứ đó không nên lệch nhau. Nếu bạn muốn thử tình huống điều chỉnh chậm hơn lạm phát, hãy nhập khoản an sinh xã hội vào ô “thu nhập khác” và chọn mức điều chỉnh thấp hơn.",
      },
      {
        q: "Tôi nghỉ hưu sau hai mươi năm nữa thì nhập số tiền nào?",
        a: "Số tiền theo giá của năm bạn bắt đầu nhận, không phải theo giá hôm nay. Đây là điểm khác biệt quan trọng nhất giữa trang này và các trang hưu trí khác trong bộ công cụ: ở đây không có giai đoạn tích lũy, nên “năm đầu” là mốc so sánh cho mọi con số. Bản ước tính của cơ quan an sinh xã hội thường ghi theo giá hôm nay, nên nếu còn hai mươi năm nữa, hãy nhân nó với hệ số lạm phát trước khi nhập — hoặc dùng trang kế hoạch hưu trí, nơi cả hai giai đoạn được chạy liền một mạch.",
      },
      {
        q: "Có nên đặt lợi suất danh mục cao hơn để bù phần lương hưu mất giá?",
        a: "Đó là cách sửa con số trên màn hình chứ không phải sửa kế hoạch. Nhưng có một cách đọc đúng hướng: khoản lương hưu cố định của bạn đã hoạt động giống một trái phiếu danh nghĩa dài hạn, nên nếu tính nó là một phần của tổng tài sản thì danh mục còn lại của bạn đang thiên về trái phiếu hơn mức bảng phân bổ tài sản hiển thị. Nhiều người trong tình huống đó chọn nắm giữ nhiều cổ phiếu hơn ở phần danh mục tự quản — không phải để bù mất giá, mà vì phần thu nhập cố định của họ đã lớn hơn họ tưởng.",
      },
    ],
  },
} as const;
