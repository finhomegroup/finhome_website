// Copy for /cong-cu/thu-nhap-dau-tu/ — drawing an income from a portfolio.
//
// Original FinHome copy.
//
// The page's argument, and the reason the perpetual figure is computed on the
// REAL return: a withdrawal that must rise with inflation is funded by the
// real return, not the nominal one. A portfolio earning 8% with 4% inflation
// can pay 3,85%/năm forever, not 8%.
//
// The defaults are chosen to make one specific point, and a test pins it:
// 30 triệu is INSIDE the first month's 32.170.151 ₫ of return, so nothing is
// being drawn from principal in month one — and the portfolio still empties
// after 245 months, because the withdrawal climbs 4% a year while the return
// does not. The month-one comparison is not the test of sustainability.
//
// Other figures from the module for 5 tỷ, rút 30 triệu/tháng, lợi nhuận
// 8%/năm, lạm phát 4%/năm: cạn sau 245 tháng (20,4 năm), tổng rút
// 10.997.292.511 ₫, khoản rút năm cuối 65.733.694 ₫/tháng, lợi nhuận thực
// 3,8462%/năm, mức rút vĩnh viễn 15.749.891 ₫/tháng, tỷ lệ rút 7,20%/năm.

export const WITHDRAWAL = {
  slug: "/cong-cu/thu-nhap-dau-tu",

  pageTitle: "Thu nhập từ đầu tư: rút bao nhiêu thì bền?",
  metaTitle: "Tính thu nhập từ đầu tư — Rút được bao lâu và mức rút bền vững",
  metaDescription:
    "Tính danh mục đầu tư của bạn trả được thu nhập trong bao nhiêu năm, và mức rút hằng tháng có thể duy trì mãi sau khi tính lạm phát. Công cụ miễn phí của FinHome.",

  lede:
    "Một khoản rút phải TĂNG theo lạm phát, nếu không thu nhập thực của bạn teo lại mỗi năm. Vì vậy mức rút bền vững được cấp bởi lợi nhuận THỰC, không phải lợi nhuận danh nghĩa — và khoảng cách giữa hai con số đó lớn hơn nhiều so với cảm nhận.",

  form: {
    portfolioGroup: "Danh mục",
    balanceLabel: "Giá trị danh mục",
    balanceUnit: "₫",
    balanceHelp: "Tổng số tiền bạn có để tạo thu nhập.",
    balanceInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultBalance: "5.000.000.000",

    withdrawalLabel: "Rút mỗi tháng, năm đầu",
    withdrawalUnit: "₫",
    withdrawalHelp:
      "Số tiền rút vào cuối mỗi tháng trong năm đầu. Các năm sau sẽ tăng theo lạm phát.",
    withdrawalInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultWithdrawal: "30.000.000",

    assumptionGroup: "Giả định",
    returnLabel: "Lợi nhuận danh mục",
    returnUnit: "%/năm",
    returnHelp:
      "Lợi nhuận danh nghĩa bình quân bạn kỳ vọng, sau phí quản lý. Nếu bạn đang trả phí quỹ, hãy trừ ra trước khi nhập.",
    returnInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultReturn: "8",

    inflationLabel: "Lạm phát",
    inflationUnit: "%/năm",
    inflationHelp:
      "Mức khoản rút của bạn phải tăng mỗi năm để giữ nguyên sức mua. Để 0 chỉ khi bạn thực sự chấp nhận thu nhập giảm dần theo giá cả.",
    inflationInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultInflation: "4",

    resultTitle: "Kết quả",
    lastsLabel: "Danh mục cạn sau",
    perpetualLabel: "Mức rút duy trì được mãi",
    realReturnLabel: "Lợi nhuận thực",
    monthsUnit: "tháng",
    yearsUnit: "năm",
    neverRunsOut: "Không cạn trong 100 năm",

    detailTitle: "Chi tiết",
    rateLabel: "Tỷ lệ rút so với danh mục",
    firstReturnLabel: "Lợi nhuận tháng đầu",
    lastWithdrawalLabel: "Khoản rút của năm cuối",
    totalWithdrawnLabel: "Tổng số tiền đã rút",
    finalBalanceLabel: "Số dư còn lại",

    drawingDownNotice:
      "Khoản rút của bạn đã lớn hơn lợi nhuận của tháng đầu tiên, nghĩa là bạn bắt đầu tiêu vào gốc ngay từ tháng đầu. Danh mục sẽ cạn, và cạn nhanh hơn nhiều so với trường hợp khoản rút nằm trong phần lợi nhuận.",
    noPerpetualNotice:
      "Lợi nhuận thực bằng 0 hoặc âm — lạm phát ăn hết phần sinh lời — nên không có mức rút nào duy trì được mãi. Mọi khoản rút, dù nhỏ đến đâu, cũng sẽ làm danh mục cạn dần theo sức mua.",
    survivesNotice:
      "Với các giả định này danh mục không cạn trong 100 năm mô phỏng. Đây là dấu hiệu tốt, nhưng hãy nhớ nó dựa trên một mức lợi nhuận bình quân đều đặn — thực tế thị trường không đi đều, và một chuỗi năm xấu ở đầu giai đoạn rút tiền gây thiệt hại lớn hơn nhiều so với cùng chuỗi đó ở cuối.",
  },

  realReturnNotice:
    "Con số cần đọc là mức rút duy trì được mãi, và nó nhỏ hơn nhiều so với dự đoán. Danh mục 5 tỷ sinh lời 8%/năm nghe như có thể trả 33 triệu mỗi tháng — nhưng nếu khoản rút phải tăng 4% mỗi năm theo lạm phát thì nó được cấp bởi lợi nhuận THỰC 3,8462%/năm, và mức duy trì được mãi chỉ là 15.749.891 ₫/tháng. Ví dụ mặc định minh họa điều này theo cách đáng chú ý: 30 triệu vẫn NHỎ HƠN lợi nhuận tháng đầu (32.170.151 ₫), nên tháng đầu bạn chưa tiêu vào gốc đồng nào — mà danh mục vẫn cạn sau 245 tháng, tức 20,4 năm. Phép so “khoản rút với lợi nhuận tháng này” không phải là phép kiểm tra tính bền vững.",

  formula: {
    title: "Cách tính",
    body: [
      "Công cụ mô phỏng theo từng tháng chứ không dùng công thức đóng, vì khoản rút tăng mỗi NĂM trong khi lợi nhuận ghép mỗi THÁNG — hai nhịp không khớp nhau. Mỗi tháng: số dư sinh lời, rồi trừ khoản rút của năm đó.",
      "Lợi nhuận mỗi tháng = (1 + lợi nhuận năm)^(1/12) − 1, không phải lợi nhuận năm chia 12, để đủ 12 tháng cộng lại đúng bằng mức năm.",
      "Khoản rút tăng một bậc vào mỗi năm và giữ nguyên trong năm đó. Với mặc định, khoản rút của năm cuối lên tới 65.733.694 ₫/tháng — gấp hơn hai lần con số ban đầu, và đó là lý do danh mục cạn.",
      "Lợi nhuận thực = (1 + lợi nhuận danh nghĩa) ÷ (1 + lạm phát) − 1, tức 3,8462% với mặc định. Không phải 8% − 4% = 4%; phép trừ là xấp xỉ và luôn cho ra số cao hơn thực tế.",
      "Mức rút duy trì được mãi = danh mục × lợi nhuận thực quy về tháng. Nó được cấp bởi lợi nhuận thực vì khoản rút cũng phải tăng theo lạm phát — nếu dùng lợi nhuận danh nghĩa, số dư sẽ teo dần theo sức mua. Khi lợi nhuận thực bằng 0 hoặc âm, không có mức rút nào là vĩnh viễn và công cụ để trống ô đó.",
      "Mô phỏng dừng ở 100 năm và báo “không cạn” thay vì một con số rất lớn. Khoản rút cuối cùng được cắt bằng đúng số dư còn lại, nên số dư kết thúc ở đúng 0.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao không dùng quy tắc rút 4%?",
        a: "Quy tắc 4% xuất phát từ nghiên cứu trên dữ liệu thị trường Hoa Kỳ với một danh mục cổ phiếu và trái phiếu cụ thể trong 30 năm, và nó vốn đã là một quy tắc thô. Công cụ này cho bạn tính bằng chính giả định của mình, và điều đáng chú ý là mức rút vĩnh viễn ở đây — 3,78%/năm với mặc định — nằm rất gần con số 4% đó. Đây là một sự trùng khớp có ý nghĩa: cả hai đều bị chi phối bởi lợi nhuận thực.",
      },
      {
        q: "Lợi nhuận thực sao không phải 8% − 4% = 4%?",
        a: "Phép trừ là xấp xỉ. Con số đúng là (1,08 ÷ 1,04) − 1 = 3,8462%, vì cả lợi nhuận và lạm phát đều là tỷ lệ nhân chứ không phải số cộng. Chênh lệch nhỏ ở mức này nhưng rộng ra khi cả hai con số lớn — và nó là chênh lệch theo chiều bất lợi cho bạn.",
      },
      {
        q: "Vì sao tháng đầu chưa tiêu vào gốc mà danh mục vẫn cạn?",
        a: "Vì khoản rút tăng còn tỷ lệ lợi nhuận thì không. Năm đầu 30 triệu nằm dưới lợi nhuận 32,17 triệu nên số dư còn tăng nhẹ. Nhưng đến năm thứ mười khoản rút đã là 42.699.354 ₫, trong khi lợi nhuận vẫn là 8% của một số dư không còn tăng nữa. Từ lúc hai đường cắt nhau, số dư bắt đầu giảm và giảm nhanh dần.",
      },
      {
        q: "Rủi ro lớn nhất mà công cụ không tính là gì?",
        a: "Thứ tự các năm lời lỗ. Công cụ dùng một mức lợi nhuận bình quân đều đặn, còn thị trường thật thì không đều — và một chuỗi năm xấu ngay đầu giai đoạn rút tiền gây thiệt hại lớn hơn nhiều so với cùng chuỗi đó ở cuối, vì bạn phải bán tài sản đang giảm giá để lấy tiền sống. Đây là lý do nhiều người giữ 2–3 năm chi phí bằng tiền gửi để không phải bán khi thị trường giảm.",
      },
      {
        q: "Kết quả có trừ thuế không?",
        a: "Không. Lãi tiền gửi của cá nhân tại Việt Nam không chịu thuế thu nhập cá nhân, nhưng nếu danh mục của bạn gồm trái phiếu hoặc chứng chỉ quỹ thì có thuế trên lãi coupon và trên giá trị bán. Cách dùng thận trọng là trừ thuế ra khỏi ô lợi nhuận trước khi nhập — công cụ lợi suất tương đương thuế của FinHome giúp quy đổi phần đó.",
      },
    ],
  },
} as const;
