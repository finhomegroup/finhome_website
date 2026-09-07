// Copy for /cong-cu/fibonacci/ — Fibonacci retracement and extension levels.
//
// Original FinHome copy.
//
// Two honesty points the copy makes rather than glossing over:
//
// 1. Two of the ratios everyone uses are not Fibonacci ratios. 50% is just
//    half the range and 78,6% is the square root of 61,8%. The module flags
//    them and the table shows the flag.
// 2. Direction is a required input, not something inferred, because getting
//    it backwards produces levels that look plausible and sit on the wrong
//    side of the market.
//
// Figures quoted are for the defaults (đáy 40.000, đỉnh 60.000, xu hướng
// tăng): biên độ 20.000 ₫, các mức điều chỉnh 38,2% = 52.360 ₫, 50% = 50.000 ₫,
// 61,8% = 47.640 ₫, 78,6% = 44.280 ₫; mức mở rộng 161,8% = 72.360 ₫ và
// 200% = 80.000 ₫.

export const FIBONACCI = {
  slug: "/cong-cu/fibonacci",

  pageTitle: "Mức Fibonacci: điều chỉnh và mở rộng",
  metaTitle: "Tính mức Fibonacci — Điều chỉnh và mở rộng theo hai chiều",
  metaDescription:
    "Tính các mức điều chỉnh và mở rộng Fibonacci từ đỉnh và đáy của một đợt biến động, theo cả xu hướng tăng và giảm. Công cụ miễn phí của FinHome.",

  lede:
    "Mức điều chỉnh Fibonacci là giá mà tại đó một đợt biến động đã trả lại một tỷ lệ nhất định của chính nó. Chiều của xu hướng quyết định đo từ đâu — nhập sai chiều sẽ cho ra các mức nằm sai phía thị trường.",

  form: {
    group: "Đợt biến động",
    highLabel: "Đỉnh",
    highUnit: "₫",
    highHelp: "Giá cao nhất của đợt biến động bạn đang đo.",
    highInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultHigh: "60.000",

    lowLabel: "Đáy",
    lowUnit: "₫",
    lowHelp: "Giá thấp nhất của đợt biến động. Không được lớn hơn đỉnh.",
    lowInvalid: "Đáy phải lớn hơn 0 và không vượt đỉnh.",
    defaultLow: "40.000",

    directionLegend: "Chiều của đợt biến động",
    directionHelp:
      "Xu hướng tăng: giá đi từ đáy lên đỉnh, nên điều chỉnh là đi XUỐNG từ đỉnh. Xu hướng giảm: giá đi từ đỉnh xuống đáy, nên hồi phục là đi LÊN từ đáy.",
    directionUp: "Xu hướng tăng — đo điều chỉnh xuống từ đỉnh",
    directionDown: "Xu hướng giảm — đo hồi phục lên từ đáy",
    defaultDirection: "uptrend",

    resultTitle: "Các mức chính",
    level382Label: "Điều chỉnh 38,2%",
    level500Label: "Điều chỉnh 50%",
    level618Label: "Điều chỉnh 61,8%",
    rangeLabel: "Biên độ đợt biến động",

    retracementTable: {
      caption: "Các mức điều chỉnh",
      ratioColumn: "Tỷ lệ",
      priceColumn: "Giá",
      kindColumn: "Loại",
      fibonacci: "Fibonacci",
      conventional: "Theo thông lệ",
      intro:
        "Bảng dưới có cột cho biết tỷ lệ nào thực sự là tỷ lệ Fibonacci. Mức 50% chỉ đơn giản là một nửa biên độ, và mức 78,6% là căn bậc hai của 61,8% — cả hai đều nằm trong mọi phần mềm biểu đồ vì thông lệ, không vì dãy Fibonacci. Chúng vẫn được nhiều người dùng, nên chúng có ở đây, nhưng gọi đúng tên thì tốt hơn.",
    },

    extensionTable: {
      caption: "Các mức mở rộng",
      ratioColumn: "Tỷ lệ",
      priceColumn: "Giá",
    },
  },

  directionNotice:
    "Chiều là ô quan trọng nhất và cũng là ô dễ nhập sai nhất. Với đợt biến động từ 40.000 lên 60.000, mức điều chỉnh 61,8% ở xu hướng TĂNG là 47.640 ₫ — thấp hơn giá hiện tại, đúng nghĩa một nhịp điều chỉnh. Nếu nhập là xu hướng giảm, cùng tỷ lệ đó cho 52.360 ₫ — một con số trông hoàn toàn hợp lý và nằm sai phía. Hãy tự hỏi: giá đã đi từ đâu đến đâu, và bạn đang chờ nó quay lại theo hướng nào.",

  formula: {
    title: "Cách tính",
    body: [
      "Biên độ = đỉnh − đáy, tức 20.000 ₫ với mặc định. Mọi mức đều là biên độ nhân một tỷ lệ, cộng hoặc trừ vào một trong hai đầu.",
      "Xu hướng tăng: mức điều chỉnh = đỉnh − biên độ × tỷ lệ. Mức 0% là đỉnh, mức 100% là đáy. Với mặc định: 38,2% cho 52.360 ₫, 50% cho 50.000 ₫, 61,8% cho 47.640 ₫, 78,6% cho 44.280 ₫.",
      "Xu hướng giảm: mức điều chỉnh = đáy + biên độ × tỷ lệ. Mức 0% là đáy, mức 100% là đỉnh. Cùng tỷ lệ, neo ngược lại — nên hai chiều đối xứng nhau qua điểm giữa, và mức 50% trùng nhau ở cả hai chiều.",
      "Mức mở rộng đi VƯỢT QUA điểm cuối của đợt biến động, theo chiều xu hướng. Xu hướng tăng: đáy + biên độ × tỷ lệ, nên 161,8% cho 72.360 ₫ và 200% cho 80.000 ₫ — cả hai đều cao hơn đỉnh. Xu hướng giảm thì các mức này nằm dưới đáy.",
      "Chỉ 23,6%, 38,2% và 61,8% xuất phát từ dãy Fibonacci. Mức 50% là một nửa biên độ, mức 78,6% là căn bậc hai của 0,618. Bảng kết quả ghi rõ mức nào thuộc loại nào.",
      "Khi đỉnh bằng đáy, biên độ bằng 0 và mọi mức trùng vào một giá. Công cụ vẫn tính chứ không báo lỗi — kết quả suy biến nhưng không sai.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Mức Fibonacci có thật sự hoạt động không?",
        a: "Không có bằng chứng thống kê thuyết phục nào cho thấy các tỷ lệ này có tính chất đặc biệt. Điều có thể nói là nhiều người cùng đặt lệnh quanh cùng những mức đó, nên giá thường phản ứng ở đó — một hiện tượng về hành vi người tham gia thị trường, không phải về giá trị tài sản. Hãy dùng chúng như những vùng cần chú ý, đừng dùng như những mức tất yếu.",
      },
      {
        q: "Chọn đỉnh và đáy nào?",
        a: "Đây là phần chủ quan nhất và cũng là phần quyết định kết quả. Thông thường người ta lấy một đợt biến động rõ ràng gần nhất: từ đáy quan trọng lên đỉnh quan trọng. Nhưng hai người xem cùng một biểu đồ thường chọn hai cặp đỉnh đáy khác nhau, và vì thế nhận hai bộ mức khác nhau. Nếu bạn thấy mình đang thử vài cặp cho đến khi các mức trùng với kỳ vọng của mình, thì công cụ không còn cho bạn thông tin nào.",
      },
      {
        q: "Mức 61,8% có quan trọng hơn các mức khác không?",
        a: "Nó được nhắc đến nhiều nhất, cùng với 38,2%, và trong thực tế người ta theo dõi 38,2% cho một nhịp điều chỉnh nhẹ và 61,8% cho một nhịp sâu. Một cách hiểu thực dụng: giá điều chỉnh quá 61,8% thì nhiều người xem đợt biến động ban đầu là đã kết thúc thay vì chỉ tạm nghỉ. Nhưng đó là quy ước diễn giải, không phải một ngưỡng có tính chất vật lý.",
      },
      {
        q: "Dùng mức mở rộng để làm gì?",
        a: "Để đặt mục tiêu chốt lời khi giá đã vượt qua đỉnh cũ và không còn mức kháng cự lịch sử nào ở phía trên. Mức 161,8% là mục tiêu được dùng nhiều nhất. Cũng như phần điều chỉnh, đây là quy ước — giá trị của nó là cho bạn một điểm để quyết định trước khi vào lệnh, thay vì quyết định trong lúc đang lãi.",
      },
      {
        q: "Áp dụng được cho chứng khoán Việt Nam không?",
        a: "Phép tính không phụ thuộc thị trường. Một lưu ý riêng: thị trường Việt Nam có biên độ dao động giá trong ngày theo quy định của sàn, nên các mức mở rộng ở xa có thể cần nhiều phiên mới đạt tới, và một mức mở rộng 200% thường nằm ngoài phạm vi giá có thể chạm tới trong một phiên.",
      },
    ],
  },
} as const;
