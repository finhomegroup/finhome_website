// Copy for /cong-cu/diem-pivot/ — pivot point levels.
//
// Original FinHome copy. Four published conventions, computed side by side.
//
// This is the first tool in the suite that is not finance but technical
// analysis, and the copy is explicit about the difference: the levels are a
// CONVENTION, not a measurement, and they predict nothing. Showing all four
// methods together is the honest presentation — they disagree with each
// other, and a page printing one of them would imply a precision that does
// not exist.
//
// Figures quoted are for the defaults (cao 52.000, thấp 48.000, đóng 51.000,
// mở 50.500): biên độ 4.000 ₫, pivot cổ điển 50.333,33 ₫, giá đóng ở 75%
// biên độ, pivot Woodie 50.250 ₫.

export const PIVOT = {
  slug: "/cong-cu/diem-pivot",

  pageTitle: "Điểm pivot: bốn cách tính, bốn kết quả",
  metaTitle: "Tính điểm pivot — Cổ điển, Fibonacci, Camarilla và Woodie",
  metaDescription:
    "Tính các mức hỗ trợ và kháng cự pivot theo bốn phương pháp từ giá cao, thấp và đóng của phiên trước. Công cụ miễn phí của FinHome.",

  lede:
    "Điểm pivot và các mức hỗ trợ, kháng cự quanh nó được tính từ giá cao, thấp và đóng của phiên trước. Có bốn công thức phổ biến và chúng cho ra bốn bộ số khác nhau — công cụ tính cả bốn để bạn thấy khoảng cách giữa chúng.",

  form: {
    sessionGroup: "Phiên trước",
    highLabel: "Giá cao nhất",
    highUnit: "₫",
    highHelp: "Giá cao nhất của phiên trước.",
    highInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultHigh: "52.000",

    lowLabel: "Giá thấp nhất",
    lowUnit: "₫",
    lowHelp: "Giá thấp nhất của phiên trước. Không được lớn hơn giá cao nhất.",
    lowInvalid: "Giá thấp nhất phải lớn hơn 0 và không vượt giá cao nhất.",
    defaultLow: "48.000",

    closeLabel: "Giá đóng cửa",
    closeUnit: "₫",
    closeHelp:
      "Giá đóng cửa của phiên trước. Phải nằm trong khoảng giá thấp nhất đến giá cao nhất.",
    closeInvalid: "Giá đóng cửa phải nằm giữa giá thấp nhất và giá cao nhất.",
    defaultClose: "51.000",

    todayGroup: "Phiên hôm nay",
    openLabel: "Giá mở cửa hôm nay",
    openUnit: "₫",
    openHelp:
      "Chỉ dùng cho phương pháp Woodie. Để trống nếu chưa có — ba phương pháp còn lại vẫn tính được. Giá mở cửa có thể nằm ngoài biên độ phiên trước nếu thị trường mở gap.",
    openInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultOpen: "50.500",

    resultTitle: "Điểm pivot",
    pivotLabel: "Pivot cổ điển",
    rangeLabel: "Biên độ phiên trước",
    closePositionLabel: "Giá đóng nằm ở đâu trong biên độ",

    table: {
      caption: "Các mức theo từng phương pháp",
      methodColumn: "Phương pháp",
      pivotColumn: "Pivot",
      r1Column: "R1",
      r2Column: "R2",
      r3Column: "R3",
      s1Column: "S1",
      s2Column: "S2",
      s3Column: "S3",
      intro:
        "Bốn hàng, bốn bộ số. Với dữ liệu mặc định, mức kháng cự gần nhất của phương pháp cổ điển và của Camarilla lệch nhau đáng kể, vì Camarilla tính từ giá ĐÓNG còn ba phương pháp kia tính từ pivot. Đó không phải lỗi của phương pháp nào — chúng là bốn quy ước khác nhau, và khoảng cách giữa chúng chính là mức độ không chắc chắn của cả cách tiếp cận này.",
    },

    methodNames: {
      classic: "Cổ điển",
      fibonacci: "Fibonacci",
      camarilla: "Camarilla",
      woodie: "Woodie",
    },

    noOpenNotice:
      "Chưa có giá mở cửa nên phương pháp Woodie không tính được. Công cụ không thay giá mở bằng giá đóng rồi gọi đó là Woodie — ba phương pháp còn lại vẫn đầy đủ.",
  },

  notAPredictionNotice:
    "Các mức này không dự đoán gì. Chúng là kết quả của một phép tính số học trên giá phiên trước, và giá trị duy nhất của chúng là ở chỗ nhiều người cùng dùng những công thức này, nên lệnh có xu hướng tụ lại quanh cùng những mức đó. Đó là một tuyên bố về hành vi của người tham gia thị trường, không phải về giá trị của tài sản. Bằng chứng rõ nhất: bốn phương pháp trong bảng dưới đưa ra bốn bộ số khác nhau từ cùng một dữ liệu — nếu chúng đo được điều gì thật, chúng đã trùng nhau.",

  formula: {
    title: "Bốn công thức",
    body: [
      "Cổ điển: pivot = (cao + thấp + đóng) ÷ 3. R1 = 2 × pivot − thấp, S1 = 2 × pivot − cao, R2 = pivot + biên độ, S2 = pivot − biên độ, R3 = cao + 2 × (pivot − thấp), S3 = thấp − 2 × (cao − pivot). Với mặc định, pivot là 50.333,33 ₫ và biên độ là 4.000 ₫.",
      "Fibonacci: cùng pivot cổ điển, nhưng các mức là pivot cộng hoặc trừ 0,382, 0,618 và 1,000 lần biên độ. Khác với cổ điển, các mức này đối xứng hoàn toàn quanh pivot — R1 cách pivot đúng bằng khoảng S1 cách pivot.",
      "Camarilla tính từ giá ĐÓNG, không từ pivot: đóng cộng hoặc trừ 1,1 lần biên độ chia 12, chia 6 và chia 4. Vì thế các mức của nó nằm sát nhau hơn, và nếu giá đóng gần đỉnh phiên thì cả sáu mức có thể đều nằm trên pivot — đó là phương pháp hoạt động đúng, không phải lỗi.",
      "Woodie: pivot = (cao + thấp + 2 × mở hôm nay) ÷ 4, rồi dùng các công thức mức giống cổ điển. Nó là phương pháp duy nhất cần giá mở cửa của phiên hiện tại, và vì giá mở được nhân đôi trọng số, pivot Woodie khác pivot cổ điển kể cả khi giá mở bằng đúng giá đóng — với mặc định là 50.250 ₫ so với 50.333,33 ₫.",
      "Một phiên bị khóa giá, tức giá cao bằng giá thấp, cho biên độ bằng 0 và toàn bộ các mức trùng vào một điểm. Công cụ vẫn tính chứ không báo lỗi, vì đó là một phiên thật.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên dùng phương pháp nào?",
        a: "Không có phương pháp đúng, và việc bốn phương pháp cho bốn kết quả là câu trả lời thẳng thắn nhất cho câu hỏi này. Cổ điển là phổ biến nhất nên có nhiều người cùng nhìn vào nó, và đó là lý do thực dụng duy nhất để chọn nó. Nếu bạn thấy mình đang chọn phương pháp nào cho ra mức gần với kỳ vọng của mình nhất, thì bạn đang dùng con số để biện minh cho một quyết định đã có.",
      },
      {
        q: "Dùng dữ liệu ngày, tuần hay tháng?",
        a: "Tùy khung thời gian bạn giao dịch. Người giao dịch trong ngày dùng dữ liệu phiên trước; người giữ vài tuần dùng dữ liệu tuần; người giữ vài tháng dùng dữ liệu tháng. Đừng trộn: các mức tính từ dữ liệu tháng không có ý nghĩa gì với một quyết định mua bán trong ngày, và ngược lại.",
      },
      {
        q: "Vì sao Camarilla cho các mức sát nhau hơn?",
        a: "Vì hệ số của nó nhỏ hơn — 1,1 chia 12, chia 6 và chia 4 của biên độ, so với cổ điển dùng cả biên độ cho R2 và hơn thế cho R3. Nó được thiết kế cho giao dịch trong ngày, nơi các mức xa không hữu ích. Ngoài ra nó neo vào giá đóng nên nó phản ứng mạnh hơn với việc phiên trước đóng ở đâu trong biên độ.",
      },
      {
        q: "Công cụ có tính được cho chứng khoán Việt Nam không?",
        a: "Có, phép tính không phụ thuộc vào thị trường. Chỉ cần lưu ý một điểm riêng của thị trường Việt Nam: có biên độ dao động giá theo quy định của từng sàn, nên các mức R3 hoặc S3 mà công cụ đưa ra có thể nằm ngoài biên độ được phép trong ngày. Khi đó mức đó không thể đạt tới trong phiên, bất kể công thức nói gì.",
      },
      {
        q: "Các mức này có tự cập nhật không?",
        a: "Không. Trang này là trang tĩnh, không kết nối tới dữ liệu giá của sàn nào, nên bạn phải tự nhập giá cao, thấp và đóng của phiên trước. Đây là lựa chọn có ý thức: một trang tĩnh mà hiển thị giá thì sẽ hiển thị giá cũ, và với dữ liệu thị trường thì giá cũ tệ hơn không có giá.",
      },
    ],
  },
} as const;
