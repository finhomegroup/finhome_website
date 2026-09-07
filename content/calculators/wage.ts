// Copy for /cong-cu/luong-gio-sang-luong-thang/ — the wage converter.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The schedule is an input, not a constant, and the copy explains why in the
// help text rather than hiding it: Vietnam's Labour Code caps normal working
// hours at 48 a week, an office contract is usually 40, and "lương tháng" for
// an hourly worker depends entirely on how many weeks a year you count.

export const WAGE = {
  slug: "/cong-cu/luong-gio-sang-luong-thang",

  pageTitle: "Quy đổi lương theo giờ, ngày, tuần, tháng và năm",
  metaTitle: "Quy đổi lương giờ sang lương tháng — Và ngược lại",
  metaDescription:
    "Nhập lương theo giờ, ngày, tuần, tháng hoặc năm để quy đổi sang bốn đơn vị còn lại theo đúng số giờ làm việc của bạn. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập mức lương bạn đang có và cho biết nó tính theo đơn vị nào. Công cụ quy đổi sang bốn đơn vị còn lại dựa trên số giờ và số tuần làm việc thực tế mà bạn khai báo.",

  form: {
    payGroup: "Mức lương",
    amountLabel: "Mức lương",
    amountUnit: "₫",
    amountHelp: "Lương gộp, trước thuế và bảo hiểm.",
    amountInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultAmount: "100.000",

    unitLabel: "Tính theo",
    unitHelp: "Đơn vị của con số bạn vừa nhập.",
    unitHourly: "Giờ",
    unitDaily: "Ngày",
    unitWeekly: "Tuần",
    unitMonthly: "Tháng",
    unitYearly: "Năm",
    defaultUnit: "hourly",

    scheduleGroup: "Thời gian làm việc",
    hoursLabel: "Số giờ mỗi tuần",
    hoursHelp:
      "Bộ luật Lao động quy định thời giờ làm việc bình thường không quá 48 giờ một tuần. Hợp đồng văn phòng thường là 40.",
    hoursInvalid: "Vui lòng nhập số giờ lớn hơn 0.",
    defaultHours: "40",

    daysLabel: "Số ngày mỗi tuần",
    daysHelp: "Chỉ dùng để tính lương theo ngày. Tối đa 7.",
    daysInvalid: "Vui lòng nhập số ngày từ 1 đến 7.",
    defaultDays: "5",

    weeksLabel: "Số tuần được trả lương mỗi năm",
    weeksHelp:
      "Để 52 nếu bạn được trả cả năm, kể cả tuần nghỉ phép. Giảm xuống nếu có thời gian không được trả lương.",
    weeksInvalid: "Vui lòng nhập số tuần lớn hơn 0.",
    defaultWeeks: "52",

    resultTitle: "Quy đổi",
    hourlyLabel: "Theo giờ",
    dailyLabel: "Theo ngày",
    weeklyLabel: "Theo tuần",
    monthlyLabel: "Theo tháng",
    yearlyLabel: "Theo năm",
    hoursPerYearLabel: "Số giờ làm việc mỗi năm",
    hoursUnit: "giờ",
  },

  monthNotice:
    "Một tháng ở đây là một phần mười hai của năm, không phải bốn tuần. Với 40 giờ mỗi tuần và 52 tuần mỗi năm, một tháng là 4,33 tuần chứ không phải 4 — lấy lương tuần nhân 4 sẽ thiếu khoảng một tuần lương mỗi năm. Đây là chỗ sai phổ biến nhất khi tự quy đổi.",

  formula: {
    title: "Cách tính",
    body: [
      "Mọi phép quy đổi đều đi qua một mức lương giờ duy nhất, nên năm con số kết quả luôn nhất quán với nhau: quy từ giờ lên năm rồi quy ngược lại sẽ về đúng con số ban đầu.",
      "Số giờ mỗi năm = số giờ mỗi tuần × số tuần mỗi năm. Với 40 giờ và 52 tuần, đó là 2.080 giờ. Lương năm = lương giờ × số giờ mỗi năm; lương tháng = lương năm ÷ 12.",
      "Số giờ mỗi ngày = số giờ mỗi tuần ÷ số ngày mỗi tuần, nên lương ngày phụ thuộc vào số ngày bạn khai báo chứ không phải vào 7. Với 40 giờ và 5 ngày, một ngày là 8 giờ.",
      "Đổi chiều cũng cùng một cách: 20 triệu mỗi tháng với lịch 40 giờ là 240 triệu mỗi năm trên 2.080 giờ, tức 115.385 ₫ mỗi giờ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên nhập 40 hay 48 giờ mỗi tuần?",
        a: "Nhập đúng số giờ trong hợp đồng của bạn. Bộ luật Lao động quy định thời giờ làm việc bình thường không quá 8 giờ một ngày và không quá 48 giờ một tuần; phần lớn hợp đồng văn phòng ghi 40 giờ với tuần làm việc 5 ngày, còn nhiều nơi sản xuất và dịch vụ áp dụng 48 giờ với 6 ngày. Con số này ảnh hưởng trực tiếp đến mức lương giờ, nên nhập sai sẽ lệch đáng kể.",
      },
      {
        q: "Số tuần mỗi năm nên là bao nhiêu?",
        a: "52 nếu bạn nhận lương liên tục cả năm, kể cả trong thời gian nghỉ phép có lương — đây là trường hợp của gần như mọi hợp đồng lao động ở Việt Nam. Giảm con số này khi có thời gian không được trả lương, ví dụ công việc theo mùa hoặc hợp đồng chỉ 10 tháng một năm.",
      },
      {
        q: "Vì sao lương tháng không phải lương tuần nhân 4?",
        a: "Vì một năm có 52 tuần chứ không phải 48. Nhân lương tuần với 4 rồi nhân 12 chỉ được 48 tuần, thiếu 4 tuần lương. Cách đúng là quy về lương năm rồi chia 12, tức lương tuần nhân 4,333… Với lương 4 triệu một tuần, chênh lệch là hơn 16 triệu mỗi năm.",
      },
      {
        q: "Kết quả đã trừ thuế và bảo hiểm chưa?",
        a: "Chưa. Toàn bộ con số ở đây là lương gộp. Thuế thu nhập cá nhân và các khoản bảo hiểm bắt buộc được tính theo tháng và theo bậc, nên chúng không quy đổi tuyến tính giữa các đơn vị thời gian như lương gộp.",
      },
      {
        q: "Tôi làm thêm giờ thì nhập thế nào?",
        a: "Nếu bạn muốn biết mức lương giờ cơ bản, hãy nhập số giờ trong hợp đồng và bỏ giờ làm thêm ra ngoài — làm thêm giờ ở Việt Nam được trả cao hơn giờ bình thường, nên gộp vào sẽ làm sai mức cơ bản. Nếu bạn muốn biết thu nhập thực tế mỗi giờ đã bỏ ra, hãy nhập tổng số giờ thực làm; con số nhận về khi đó thấp hơn và cho thấy giá thật của thời gian.",
      },
    ],
  },
} as const;
