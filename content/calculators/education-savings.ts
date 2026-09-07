// Copy for /cong-cu/tiet-kiem-hoc-phi/ — saving for tuition.
//
// Original FinHome copy.
//
// Two compounding rates run against each other: tuition inflates while
// savings grow. Ignoring the first understates the target badly, because
// education costs have historically risen faster than general inflation.
//
// The second thing the page gets right and a naive version does not: the
// target is a STREAM, not one number at one date. Tuition is paid once per
// year of study at a rising price, and money not yet spent keeps earning — so
// the balance needed on day one is the stream discounted back to that day,
// not the inflated years added up.
//
// Figures quoted are the module's own output for 80 triệu/năm hôm nay, bắt
// đầu sau 10 năm, học 4 năm, học phí tăng 8%/năm, đã có 200 triệu, đầu tư
// 7%/năm: học phí năm đầu 172.714.000 ₫, năm cuối 217.569.898 ₫, tổng danh
// nghĩa 778.268.627 ₫, nhưng số cần có vào ngày nhập học chỉ 700.601.379 ₫.
// 200 triệu hiện có lớn thành 393.430.271 ₫, còn thiếu 307.171.108 ₫ → cần
// góp 1.795.779 ₫/tháng. Phần do lãi đóng góp: 285.107.899 ₫.

export const EDUCATION_SAVINGS = {
  slug: "/cong-cu/tiet-kiem-hoc-phi",

  pageTitle: "Tiết kiệm học phí: cần góp bao nhiêu mỗi tháng?",
  metaTitle: "Tính tiết kiệm học phí — Học phí tương lai và mức góp mỗi tháng",
  metaDescription:
    "Tính học phí sẽ là bao nhiêu khi con bạn nhập học, số tiền cần có vào ngày đó, và mức góp mỗi tháng để đạt được. Công cụ miễn phí của FinHome.",

  lede:
    "Hai tốc độ tăng chạy ngược nhau: học phí tăng theo năm trong khi tiền tiết kiệm sinh lãi. Bỏ qua tốc độ thứ nhất sẽ tính thiếu rất nhiều, vì học phí ở Việt Nam nhiều năm tăng nhanh hơn lạm phát chung.",

  form: {
    tuitionGroup: "Học phí",
    tuitionLabel: "Học phí một năm, theo giá hôm nay",
    tuitionUnit: "₫",
    tuitionHelp:
      "Học phí của trường bạn nhắm tới, ở mức hiện tại. Nên gồm cả chi phí bắt buộc khác như sách và bảo hiểm.",
    tuitionInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultTuition: "80.000.000",

    inflationLabel: "Học phí tăng",
    inflationUnit: "%/năm",
    inflationHelp:
      "Đây là ô hay bị để 0 nhất, và cũng là ô ảnh hưởng nhiều nhất. Học phí đại học thường tăng nhanh hơn lạm phát chung.",
    inflationInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultInflation: "8",

    timeGroup: "Thời gian",
    yearsUntilLabel: "Số năm nữa mới nhập học",
    yearsUntilHelp:
      "Số năm từ nay đến khi bắt đầu học. Nhập 0 nếu nhập học ngay — khi đó không còn thời gian tích lũy.",
    yearsUntilInvalid: "Vui lòng nhập số nguyên năm từ 0 trở lên.",
    defaultYearsUntil: "10",

    yearsOfStudyLabel: "Số năm học",
    yearsOfStudyHelp: "Độ dài khóa học. Đại học ở Việt Nam thường 4 năm.",
    yearsOfStudyInvalid: "Vui lòng nhập số nguyên năm lớn hơn 0.",
    defaultYearsOfStudy: "4",

    savingsGroup: "Tiết kiệm",
    currentSavingsLabel: "Đã tiết kiệm được",
    currentSavingsUnit: "₫",
    currentSavingsHelp: "Số tiền hiện có dành riêng cho việc học. Có thể để 0.",
    currentSavingsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultCurrentSavings: "200.000.000",

    returnLabel: "Lợi nhuận đầu tư",
    returnUnit: "%/năm",
    returnHelp:
      "Mức sinh lời bạn thực sự đạt được. Với mốc dưới 5 năm, đừng nhập lợi nhuận của quỹ cổ phiếu.",
    returnInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultReturn: "7",

    resultTitle: "Kết quả",
    monthlyLabel: "Cần góp mỗi tháng",
    targetLabel: "Cần có vào ngày nhập học",
    shortfallLabel: "Còn thiếu",

    detailTitle: "Chi tiết",
    nominalLabel: "Tổng học phí phải trả",
    savingsAtStartLabel: "Tiền hiện có sẽ lớn thành",
    interestLabel: "Phần do lãi đóng góp",
    totalContributionsLabel: "Tổng số tiền bạn góp thêm",
    monthsToSaveLabel: "Số tháng để tích lũy",
    monthsUnit: "tháng",

    table: {
      caption: "Học phí từng năm học",
      yearColumn: "Năm học",
      fromNowColumn: "Cách hôm nay",
      tuitionColumn: "Học phí",
      pvColumn: "Quy về ngày nhập học",
      intro:
        "Cột cuối cho thấy vì sao số cần có vào ngày nhập học nhỏ hơn tổng học phí: năm thứ tư đến sau ba năm nữa, và số tiền chờ trả năm đó vẫn đang sinh lãi. Cộng thẳng các năm đã lạm phát lại — 778.268.627 ₫ — sẽ tính thừa hơn 77 triệu.",
    },

    alreadyFundedNotice:
      "Số tiền bạn đã có, sau khi sinh lãi đến ngày nhập học, đã đủ cho toàn bộ khóa học. Không cần góp thêm — nhưng hãy nhớ con số này dựa trên mức tăng học phí và lợi nhuận đầu tư mà bạn đã nhập.",
    noTimeNotice:
      "Nhập học ngay nên không có thời gian tích lũy, và công cụ không tính được mức góp mỗi tháng. Số tiền cần có và phần còn thiếu vẫn đúng — đó là khoản bạn phải thu xếp ngay.",
  },

  streamNotice:
    "Học phí không phải một con số ở một thời điểm. Với ví dụ mặc định, tổng học phí bốn năm là 778.268.627 ₫, nhưng số bạn cần có vào ngày nhập học chỉ là 700.601.379 ₫ — vì tiền dành cho năm thứ hai, thứ ba, thứ tư vẫn tiếp tục sinh lãi trong lúc chờ được dùng. Cộng thẳng các năm đã lạm phát là cách tính thừa hơn 77 triệu đồng, và nó khiến mục tiêu trông nặng hơn thực tế. Ngược lại, để ô “học phí tăng” bằng 0 là cách tính THIẾU nghiêm trọng hơn nhiều: học phí năm đầu ở mức 8%/năm là 172.714.000 ₫, gấp hơn hai lần con số 80 triệu hôm nay.",

  formula: {
    title: "Cách tính",
    body: [
      "Học phí của năm học thứ k = học phí hôm nay × (1 + mức tăng)^(số năm từ nay đến khi trả). Năm học đầu được trả sau 10 năm nên là 80.000.000 × 1,08¹⁰ = 172.714.000 ₫; năm thứ tư trả sau 13 năm nên là 217.569.898 ₫.",
      "Số tiền cần có vào NGÀY NHẬP HỌC là các khoản học phí đó quy về ngày đó theo lợi nhuận đầu tư: năm đầu không chiết khấu, năm thứ tư chiết khấu ba năm. Tổng là 700.601.379 ₫, thấp hơn tổng danh nghĩa 778.268.627 ₫.",
      "Số tiền hiện có được nhân lên đến ngày nhập học: 200.000.000 × 1,07¹⁰ = 393.430.271 ₫. Phần còn thiếu là 307.171.108 ₫.",
      "Mức góp mỗi tháng là khoản niên kim đưa phần còn thiếu về 0 đúng vào ngày nhập học, với 120 tháng và lợi nhuận 7%/năm ghép theo tháng: 1.795.779 ₫. Khoản góp được tính vào cuối mỗi tháng, giống công cụ mục tiêu tiết kiệm.",
      "Phần do lãi đóng góp là số cần có trừ đi mọi thứ bạn bỏ vào — cả tiền có sẵn và tổng các khoản góp. Với mặc định là 285.107.899 ₫, tức hơn 40% mục tiêu do lợi nhuận đầu tư tạo ra chứ không phải do bạn nộp.",
      "Khi nhập học ngay, không có tháng nào để tích lũy nên công cụ để trống mức góp thay vì chia cho 0. Số cần có và phần còn thiếu vẫn được tính bình thường.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Mức tăng học phí nên nhập bao nhiêu?",
        a: "Hãy tra lịch sử học phí của chính trường bạn nhắm tới trong 5–10 năm gần nhất và tính mức tăng bình quân — đó là con số tốt nhất bạn có. Trường công ở Việt Nam có lộ trình tăng học phí theo quy định, trong khi trường tư và trường quốc tế thì tự quyết. Nếu không có dữ liệu, hãy chạy công cụ ở 5%, 8% và 12% rồi lập kế hoạch theo mức giữa hoặc mức cao.",
      },
      {
        q: "Lợi nhuận đầu tư nên nhập bao nhiêu?",
        a: "Tùy mốc thời gian. Với hơn 10 năm, một danh mục cân bằng có thể hợp lý. Với dưới 5 năm, đừng nhập lợi nhuận của quỹ cổ phiếu — bạn không có thời gian để hồi phục nếu thị trường giảm đúng năm nhập học. Nhiều người chuyển dần sang tiền gửi và trái phiếu khi mốc đến gần, và khi đó lợi nhuận nên nhập là mức thấp hơn của giai đoạn cuối.",
      },
      {
        q: "Có nên tính cả chi phí sinh hoạt không?",
        a: "Nên, nếu con bạn sẽ học xa nhà — tiền ở, ăn và đi lại thường lớn hơn học phí, nhất là khi học ở thành phố lớn hoặc ở nước ngoài. Cách đơn giản là cộng chi phí sinh hoạt một năm vào ô học phí, và dùng mức tăng bình quân của cả hai. Nếu hai khoản tăng khác nhau nhiều, hãy chạy công cụ hai lần rồi cộng hai mức góp.",
      },
      {
        q: "Vì sao phần do lãi lớn đến vậy?",
        a: "Vì thời gian dài. Với 10 năm chờ cộng 4 năm học, số tiền của bạn có tới 14 năm để sinh lãi, và 285.107.899 ₫ trong mục tiêu 700.601.379 ₫ đến từ đó. Đây là lý do bắt đầu sớm quan trọng hơn góp nhiều: hãy thử giảm số năm chờ từ 10 xuống 5 và xem mức góp mỗi tháng tăng bao nhiêu.",
      },
      {
        q: "Kết quả có tính học bổng hay hỗ trợ không?",
        a: "Không. Công cụ giả định bạn trả toàn bộ. Nếu bạn có cơ sở để kỳ vọng học bổng, cách thận trọng là lập kế hoạch cho toàn bộ học phí rồi coi học bổng là phần thưởng, chứ không phải trừ trước vào mục tiêu — vì học bổng không chắc chắn còn học phí thì chắc chắn.",
      },
    ],
  },
} as const;
