// Copy for /cong-cu/tinh-ngay/ — calendar arithmetic.
//
// Original FinHome copy.
//
// The engineering constraint shapes this page: lib/calc/dates.ts uses NO
// `Date`, because prerendered output must hydrate byte-identically and a
// module that read the clock would differ between server and browser. So the
// defaults are fixed dates, not today, and the "hôm nay" button fills the
// fields from the client after mount. That is a visible design choice and
// the copy explains it rather than letting it look like an oversight.
//
// Avoiding `Date` also removes timezones, which calendar questions do not
// have: "how many days until 30 tháng 4" has one answer regardless of where
// the browser thinks it is.

export const DATES = {
  slug: "/cong-cu/tinh-ngay",

  pageTitle: "Tính ngày: khoảng cách và cộng trừ ngày",
  metaTitle: "Tính ngày — Khoảng cách giữa hai ngày và cộng trừ ngày làm việc",
  metaDescription:
    "Tính số ngày giữa hai mốc, số ngày làm việc, và ngày sau khi cộng hoặc trừ một số ngày — có tùy chọn chỉ tính ngày làm việc. Công cụ miễn phí của FinHome.",

  lede:
    "Hai phép tính lịch thường cần nhất: khoảng cách giữa hai ngày, và ngày rơi vào đâu sau khi cộng hoặc trừ một số ngày. Cả hai đều có tùy chọn chỉ tính ngày làm việc, loại thứ Bảy và Chủ nhật.",

  form: {
    modeLegend: "Bạn muốn tính gì?",
    modeHelp: "Chọn phép tính rồi nhập các mốc ngày bên dưới.",
    modeDifference: "Khoảng cách giữa hai ngày",
    modeOffset: "Cộng hoặc trừ số ngày",
    defaultMode: "difference",

    fromGroup: "Ngày bắt đầu",
    fromYearLabel: "Năm",
    fromMonthLabel: "Tháng",
    fromDayLabel: "Ngày",
    defaultFromYear: "2026",
    defaultFromMonth: "1",
    defaultFromDay: "1",

    toGroup: "Ngày kết thúc",
    toYearLabel: "Năm",
    toMonthLabel: "Tháng",
    toDayLabel: "Ngày",
    defaultToYear: "2026",
    defaultToMonth: "12",
    defaultToDay: "31",

    offsetGroup: "Số ngày cộng thêm",
    offsetLabel: "Số ngày",
    offsetHelp:
      "Nhập số âm để trừ. Ví dụ 90 là 90 ngày sau, −30 là 30 ngày trước.",
    offsetInvalid: "Vui lòng nhập một số nguyên.",
    defaultOffset: "90",

    skipWeekendsLegend: "Chỉ tính ngày làm việc?",
    skipWeekendsHelp:
      "Khi bật, thứ Bảy và Chủ nhật không được tính, và kết quả không bao giờ rơi vào cuối tuần. Không tính ngày lễ — xem phần câu hỏi thường gặp.",
    skipWeekendsYes: "Chỉ ngày làm việc",
    skipWeekendsNo: "Tính mọi ngày",
    defaultSkipWeekends: "no",

    yearInvalid: "Vui lòng nhập một năm nguyên.",
    monthInvalid: "Vui lòng nhập tháng từ 1 đến 12.",
    dayInvalid: "Ngày không tồn tại trong tháng đã chọn.",

    todayLabel: "Điền ngày hôm nay",
    todayHelp:
      "Điền ngày hôm nay vào ô ngày bắt đầu. Nút này lấy ngày từ máy bạn — đó là lý do các ô không được điền sẵn ngày hôm nay.",

    resultTitle: "Kết quả",
    daysLabel: "Số ngày",
    workdaysLabel: "Số ngày làm việc",
    componentsLabel: "Tương đương",
    resultDateLabel: "Ngày kết quả",
    resultWeekdayLabel: "Thứ",

    detailTitle: "Chi tiết",
    weeksLabel: "Số tuần và ngày lẻ",
    totalMonthsLabel: "Tổng số tháng trọn",
    weekendDaysLabel: "Số ngày cuối tuần",
    fromWeekdayLabel: "Ngày bắt đầu là thứ",
    toWeekdayLabel: "Ngày kết thúc là thứ",

    weekdayNames: [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ nhật",
    ],

    daysUnit: "ngày",
    weeksUnit: "tuần",
    monthsUnit: "tháng",
    yearsUnit: "năm",

    invalidNotice:
      "Một trong hai mốc ngày không tồn tại. Thường là ngày 29 tháng 2 của một năm không nhuận, hoặc ngày 31 của một tháng chỉ có 30 ngày.",
  },

  noClockNotice:
    "Các ô ngày không được điền sẵn ngày hôm nay, và đó là chủ ý. Trang này được tạo sẵn ở thời điểm build rồi phục vụ tĩnh, nên nếu nó tự điền ngày thì con số sẽ là ngày build chứ không phải ngày bạn xem — và trong nhiều trường hợp là ngày của nhiều tháng trước. Hãy bấm “Điền ngày hôm nay” để lấy ngày từ chính máy bạn. Cách này cũng loại bỏ vấn đề múi giờ: câu hỏi “còn bao nhiêu ngày đến 30 tháng 4” chỉ có một đáp án, không phụ thuộc trình duyệt đang ở đâu.",

  formula: {
    title: "Cách tính",
    body: [
      "Mọi phép tính đi qua một SỐ THỨ TỰ NGÀY — số ngày trôi qua kể từ một mốc cố định — bằng thuật toán Fliegel–Van Flandern. Hai ngày trở thành hai số nguyên, và mọi câu hỏi trở thành phép tính trên hai số đó. Thuật toán chính xác tuyệt đối trong số nguyên với mọi ngày dương lịch, nên không có sai số làm tròn.",
      "Số ngày là KHOẢNG CÁCH, nên cùng một ngày nhập hai lần cho 0 chứ không phải 1. Nếu bạn cần đếm cả hai đầu — ví dụ số ngày nghỉ phép — hãy cộng thêm 1.",
      "Ngày làm việc đếm các ngày trong khoảng nửa mở, tức tính ngày bắt đầu và không tính ngày kết thúc. Đây là quy ước làm cho “thứ Hai đến thứ Sáu” đúng bằng năm ngày làm việc.",
      "Phần “tương đương” tách khoảng cách thành năm, tháng và ngày bằng cách CỘNG TỪNG THÁNG TRỌN có kẹp ngày, chứ không trừ từng thành phần rồi mượn. Cộng tháng có kẹp là cách duy nhất không có ngoại lệ: 31 tháng 1 cộng một tháng là ngày cuối tháng 2, nên từ 31 tháng 1 đến 1 tháng 3 là 1 tháng 1 ngày ở cả năm nhuận và năm thường. Cách trừ rồi mượn cho ra số ngày âm trong năm thường.",
      "Chế độ chỉ tính ngày làm việc đi từng ngày một và bỏ qua thứ Bảy, Chủ nhật, nên kết quả không bao giờ là cuối tuần. Vòng lặp này có chặn trên: yêu cầu vượt 100.000 ngày làm việc sẽ trả về không có kết quả thay vì treo.",
      "Không có `Date` trong phần tính toán. Điều đó loại bỏ múi giờ khỏi một bài toán vốn không có múi giờ, và giữ cho trang tĩnh dựng ở thời điểm build khớp byte-với-byte với những gì trình duyệt dựng lại.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ngày làm việc có trừ ngày lễ không?",
        a: "Không. Công cụ chỉ loại thứ Bảy và Chủ nhật. Việt Nam có khoảng 11 ngày nghỉ lễ theo luật, trong đó Tết Nguyên đán theo âm lịch nên rơi vào ngày dương lịch khác nhau mỗi năm, và một số năm có ngày nghỉ bù do Thủ tướng quyết định. Một trang tĩnh không thể biết trước những ngày đó cho mọi năm, nên công cụ không giả vờ biết — hãy tự trừ số ngày lễ nằm trong khoảng.",
      },
      {
        q: "Vì sao cùng một ngày lại cho 0 ngày?",
        a: "Vì đây là khoảng cách, không phải số lượng ngày. Từ mùng 1 đến mùng 1 không có khoảng nào. Nếu bạn đang đếm số ngày của một kỳ nghỉ hay một hợp đồng thuê tính cả ngày đầu và ngày cuối, hãy cộng thêm 1 vào kết quả.",
      },
      {
        q: "Vì sao “tương đương” không khớp với cách tôi tự tính?",
        a: "Khả năng cao là do cách xử lý ngày cuối tháng. Công cụ dùng quy ước cộng tháng có kẹp ngày: một tháng sau ngày 31 tháng 1 là ngày cuối tháng 2, vì không có ngày 31 tháng 2. Mọi thư viện lịch đều làm vậy, nhưng nó khiến “một tháng” không phải một số ngày cố định — và đó là bản chất của lịch, không phải lỗi.",
      },
      {
        q: "Công cụ tính được ngày âm lịch không?",
        a: "Không. Toàn bộ phép tính là dương lịch. Chuyển đổi âm lịch cần bảng dữ liệu thiên văn cho từng năm và quy tắc tháng nhuận riêng, và nó nằm ngoài phạm vi công cụ này. Nếu bạn cần tính đến Tết, hãy tra ngày dương lịch của Tết năm đó rồi nhập vào ô ngày kết thúc.",
      },
      {
        q: "Vì sao nút “điền ngày hôm nay” lại cần thiết?",
        a: "Vì trang được dựng sẵn ở thời điểm build và phục vụ tĩnh, nên nó không thể biết hôm nay là ngày nào khi bạn mở. Nếu nó điền sẵn, con số sẽ là ngày build. Nút này đọc ngày từ máy bạn sau khi trang đã tải, và đó là cách duy nhất vừa cho ra ngày đúng vừa giữ trang tĩnh.",
      },
    ],
  },
} as const;
