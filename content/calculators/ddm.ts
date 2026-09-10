// Copy for /cong-cu/co-phieu-tang-truong-deu/ — the Gordon growth model.
//
// Original FinHome copy.
//
// Two editorial jobs:
//
// 1. The denominator is the model. As growth approaches the required return
//    the value goes to infinity, so the tool REFUSES g >= r rather than
//    printing the negative number the formula produces. The copy explains
//    that this is the model's known limit, not a bug in the tool.
// 2. The inversions are more useful than the valuation. Arguing about whether
//    a share is worth 30.000 ₫ goes nowhere; asking whether 3,704% perpetual
//    growth is plausible is a question with an answer. So the page pushes the
//    implied-growth and implied-return rows.
//
// Figures quoted are for the defaults (D0 = 2.000 ₫, tăng trưởng 5%/năm,
// lợi nhuận yêu cầu 12%/năm, giá thị trường 25.000 ₫): D1 = 2.100 ₫, giá trị
// 30.000 ₫, giá đang thấp hơn 16,667%, tăng trưởng ngụ ý 3,704%, lợi nhuận
// ngụ ý 13,400%.

export const DDM = {
  slug: "/cong-cu/co-phieu-tang-truong-deu",

  pageTitle: "Cổ phiếu tăng trưởng đều: định giá theo cổ tức",
  metaTitle: "Mô hình Gordon — Định giá cổ phiếu tăng trưởng cổ tức đều",
  metaDescription:
    "Định giá cổ phiếu theo mô hình tăng trưởng cổ tức đều Gordon, kèm mức tăng trưởng và lợi nhuận mà giá thị trường đang ngụ ý. Công cụ miễn phí của FinHome.",

  lede:
    "Mô hình Gordon định giá cổ phiếu bằng cổ tức năm tới chia cho hiệu giữa lợi nhuận yêu cầu và tốc độ tăng trưởng. Toàn bộ mô hình nằm ở cái hiệu đó — và cách dùng hữu ích nhất không phải đọc giá trị, mà là hỏi giá thị trường đang ngụ ý điều gì.",

  form: {
    dividendGroup: "Cổ tức",
    dividendLabel: "Cổ tức",
    dividendUnit: "₫/cp",
    dividendHelp: "Cổ tức tiền mặt mỗi cổ phiếu.",
    dividendInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultDividend: "2.000",

    modeLegend: "Con số cổ tức bạn nhập là gì?",
    modeHelp:
      "Hai quy ước này lệch nhau đúng một lần tăng trưởng, nên chọn sai sẽ làm giá trị lệch theo.",
    modeCurrent: "Cổ tức vừa trả (D0) — công cụ sẽ nhân thêm một lần tăng trưởng",
    modeNext: "Cổ tức năm tới (D1) — dùng đúng như đã nhập",
    defaultMode: "current",

    assumptionGroup: "Giả định",
    growthLabel: "Tăng trưởng cổ tức",
    growthUnit: "%/năm",
    growthHelp:
      "Tốc độ tăng trưởng VĨNH VIỄN. Phải nhỏ hơn lợi nhuận yêu cầu, và trên thực tế không thể vượt tốc độ tăng trưởng của cả nền kinh tế trong dài hạn.",
    growthInvalid: "Tăng trưởng phải nhỏ hơn lợi nhuận yêu cầu.",
    defaultGrowth: "5",

    requiredLabel: "Lợi nhuận yêu cầu",
    requiredUnit: "%/năm",
    requiredHelp:
      "Mức sinh lời bạn đòi hỏi. Thường lấy từ mô hình CAPM — FinHome có công cụ riêng.",
    requiredInvalid: "Vui lòng nhập một số.",
    defaultRequired: "12",

    priceLabel: "Giá thị trường",
    priceUnit: "₫/cp",
    priceHelp:
      "Để trống nếu bạn chỉ cần giá trị theo mô hình. Nhập vào để có phần ngụ ý — phần hữu ích nhất của trang này.",
    priceInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultPrice: "25.000",

    resultTitle: "Kết quả",
    valueLabel: "Giá trị theo mô hình",
    verdictLabel: "So với giá thị trường",
    verdictUnder: "Giá thấp hơn giá trị mô hình",
    verdictOver: "Giá cao hơn giá trị mô hình",
    verdictFair: "Giá xấp xỉ giá trị mô hình",
    premiumLabel: "Chênh lệch so với giá trị mô hình",

    impliedTitle: "Giá thị trường đang ngụ ý điều gì",
    impliedGrowthLabel: "Tăng trưởng ngụ ý, nếu giữ lợi nhuận yêu cầu",
    impliedReturnLabel: "Lợi nhuận ngụ ý, nếu giữ giả định tăng trưởng",

    detailTitle: "Chi tiết",
    nextDividendLabel: "Cổ tức năm tới (D1)",
    dividendYieldLabel: "Tỷ suất cổ tức tại giá trị mô hình",
    capitalGainsLabel: "Tỷ suất tăng giá (bằng tốc độ tăng trưởng)",
    totalReturnLabel: "Tổng lợi nhuận (hai phần cộng lại)",

    unpriceableNotice:
      "Tốc độ tăng trưởng bằng hoặc lớn hơn lợi nhuận yêu cầu, nên mô hình không định giá được: giá trị sẽ tiến ra vô cùng, và công thức cho ra một số âm không phải là giá. Đây là giới hạn đã biết của mô hình Gordon, không phải lỗi của công cụ — với doanh nghiệp đang tăng trưởng nhanh hơn chi phí vốn, hãy dùng công cụ cổ phiếu tăng trưởng không đều.",
  },

  denominatorNotice:
    "Cả mô hình nằm ở mẫu số. Tăng trưởng 5% với lợi nhuận yêu cầu 12% cho mẫu số 7% và giá trị 30.000 ₫; nâng tăng trưởng lên 11% thì mẫu số còn 1% và giá trị nhảy lên hơn 220.000 ₫. Vì thế đừng đọc con số giá trị như một kết luận — hãy dùng chiều ngược lại. Với giá thị trường 25.000 ₫, mô hình cho biết thị trường đang ngụ ý tăng trưởng vĩnh viễn 3,704%, hoặc ngụ ý lợi nhuận 13,400% nếu giữ giả định tăng trưởng 5%. Hai câu hỏi đó trả lời được; câu “cổ phiếu này đáng 30.000 ₫ không” thì không.",

  formula: {
    title: "Cách tính",
    body: [
      "Giá trị = D1 ÷ (lợi nhuận yêu cầu − tăng trưởng), với D1 là cổ tức năm tới. Nếu bạn nhập cổ tức vừa trả (D0) thì D1 = D0 × (1 + tăng trưởng). Với mặc định: D1 = 2.000 × 1,05 = 2.100 ₫, và giá trị = 2.100 ÷ 0,07 = 30.000 ₫.",
      "Hai quy ước D0 và D1 lệch nhau đúng một lần (1 + tăng trưởng). Nhập 2.000 ₫ dưới dạng D1 cho giá trị 28.571 ₫ thay vì 30.000 ₫ — chênh 5%, đúng bằng tốc độ tăng trưởng.",
      "Mô hình ngầm chia lợi nhuận yêu cầu thành hai phần: tỷ suất cổ tức D1 ÷ giá trị, bằng 7%, và tỷ suất tăng giá, bằng đúng tốc độ tăng trưởng 5%. Hai phần cộng lại đúng bằng lợi nhuận yêu cầu 12% — đây là một cách kiểm tra mô hình đã hiểu đúng.",
      "Tăng trưởng ngụ ý được giải từ giá thị trường. Ở quy ước D0, vì D1 phụ thuộc vào chính tăng trưởng: g = (giá × lợi nhuận yêu cầu − D0) ÷ (giá + D0). Với giá 25.000 ₫ cho 3,704%. Đây là công thức đóng, không phải dò tìm.",
      "Lợi nhuận ngụ ý = D1 ÷ giá + tăng trưởng = 2.100 ÷ 25.000 + 5% = 13,400%. Nếu con số này cao hơn mức bạn đòi hỏi thì ở giá hiện tại cổ phiếu đang hấp dẫn theo mô hình.",
      "Công cụ từ chối khi tăng trưởng bằng hoặc vượt lợi nhuận yêu cầu. Không có giá trị hữu hạn cho một dòng cổ tức tăng nhanh hơn tỷ lệ chiết khấu mãi mãi, và công thức khi đó cho ra số âm — trả về “không định giá được” là câu trả lời trung thực.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Mô hình này dùng được cho cổ phiếu nào?",
        a: "Doanh nghiệp trả cổ tức đều đặn, đã trưởng thành, và có tốc độ tăng trưởng ổn định thấp hơn chi phí vốn — điện, nước, hàng tiêu dùng thiết yếu, một số ngân hàng. Nó không dùng được cho doanh nghiệp không trả cổ tức, cho doanh nghiệp đang tăng trưởng nhanh, hay cho doanh nghiệp có cổ tức thất thường. Với hai trường hợp đầu, mô hình hai giai đoạn phù hợp hơn.",
      },
      {
        q: "Tăng trưởng vĩnh viễn bao nhiêu là hợp lý?",
        a: "Không thể vượt tốc độ tăng trưởng dài hạn của nền kinh tế, vì một doanh nghiệp tăng nhanh hơn GDP mãi mãi sẽ lớn hơn cả nền kinh tế. Trong thực tế người ta thường dùng mức bằng hoặc thấp hơn tăng trưởng GDP danh nghĩa dài hạn. Nếu bạn phải nhập một con số cao để mô hình khớp với giá thị trường, thì đó chính là thông tin: thị trường đang định giá một kịch bản khó duy trì.",
      },
      {
        q: "Vì sao nên đọc phần ngụ ý thay vì phần giá trị?",
        a: "Vì giá trị cực kỳ nhạy với mẫu số và không ai kiểm chứng được nó. Đảo lại thì bạn có một phát biểu kiểm chứng được: ở giá 25.000 ₫, thị trường đang ngụ ý cổ tức tăng 3,704% mỗi năm mãi mãi. Bạn có thể so con số đó với tăng trưởng cổ tức lịch sử của doanh nghiệp, với lạm phát, với tăng trưởng ngành — và rút ra kết luận có cơ sở.",
      },
      {
        q: "Lợi nhuận yêu cầu nên lấy từ đâu?",
        a: "Thông thường từ CAPM: lãi suất phi rủi ro cộng beta nhân phần bù thị trường. Công cụ CAPM của FinHome cho ra con số đó. Nếu bạn không muốn qua CAPM, hãy dùng mức sinh lời tối thiểu bạn thực sự đòi hỏi để chấp nhận rủi ro cổ phiếu — con số đó phải cao hơn lãi tiền gửi một khoảng đáng kể, nếu không thì gửi tiết kiệm hợp lý hơn.",
      },
      {
        q: "Cổ tức bằng cổ phiếu có tính vào không?",
        a: "Không. Mô hình này định giá dòng tiền mặt bạn nhận được. Cổ tức bằng cổ phiếu không đưa tiền vào tay bạn mà chia nhỏ quyền sở hữu, và giá tham chiếu được điều chỉnh tương ứng. Chỉ nhập cổ tức tiền mặt.",
      },
    ],
  },
} as const;
