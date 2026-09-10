// Copy for /cong-cu/muc-tieu-tiet-kiem/ — the savings goal calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Figures quoted below are the tool's own output, read off the module for
// 100 triệu ban đầu, mục tiêu 500 triệu, 60 tháng, 6%/năm ghép hằng tháng:
// cần góp 5.233.121 ₫/tháng, tổng bỏ vào 413.987.237 ₫, lãi 86.012.763 ₫
// (17,2% số cuối). Ở 0%/năm mức góp là 6.666.667 ₫ — chênh gần 1,43 triệu mỗi
// tháng. Góp 6 triệu/tháng thì đạt mục tiêu sau 53,8 tháng, hoặc sau 60 tháng
// được 553.505.198 ₫. Re-read the module if the defaults move.

export const SAVINGS_GOAL = {
  slug: "/cong-cu/muc-tieu-tiet-kiem",

  pageTitle: "Mục tiêu tiết kiệm: mỗi tháng cần góp bao nhiêu?",
  metaTitle: "Tính mục tiêu tiết kiệm — Mức góp, thời gian hoặc số cuối kỳ",
  metaDescription:
    "Tính số tiền cần góp mỗi tháng để đạt mục tiêu, thời gian cần thiết, hoặc số tiền có được sau một số tháng. Công cụ miễn phí của FinHome.",

  lede:
    "Ba ẩn số, biết hai thì tính được cái còn lại: mỗi tháng cần góp bao nhiêu, mất bao lâu, hoặc cuối kỳ có bao nhiêu. Chọn ẩn số bạn cần rồi nhập hai con số kia.",

  form: {
    modeLegend: "Bạn cần tính gì?",
    modeHelp:
      "Ba chế độ dùng cùng một công thức nên chúng luôn khớp nhau: giải ra mức góp rồi nhập lại mức đó vào chế độ thứ ba sẽ về đúng mục tiêu ban đầu.",
    modeContribution: "Mỗi tháng cần góp bao nhiêu",
    modeMonths: "Mất bao lâu để đạt mục tiêu",
    modeTarget: "Cuối kỳ có bao nhiêu",

    group: "Số liệu",
    initialLabel: "Số tiền đã có",
    initialUnit: "₫",
    initialHelp: "Số dư hiện tại của khoản tiết kiệm. Để 0 nếu bắt đầu từ đầu.",
    initialInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultInitial: "100.000.000",

    targetLabel: "Mục tiêu",
    targetUnit: "₫",
    targetHelp: "Số tiền bạn muốn có được.",
    targetInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultTarget: "500.000.000",

    contributionLabel: "Góp mỗi tháng",
    contributionUnit: "₫",
    contributionHelp:
      "Số tiền bỏ vào cuối mỗi tháng. Để 0 nếu bạn chỉ để tiền tự sinh lãi.",
    contributionInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultContribution: "6.000.000",

    monthsLabel: "Số tháng",
    monthsHelp: "Thời gian tiết kiệm. 5 năm là 60 tháng.",
    monthsInvalid: "Vui lòng nhập số tháng lớn hơn 0.",
    defaultMonths: "60",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp:
      "Lãi suất danh nghĩa hằng năm, giả định ghép lãi hằng tháng. Để 0 nếu bạn chỉ gom tiền mà không sinh lãi.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "6",

    resultTitle: "Kết quả",
    contributionResultLabel: "Cần góp mỗi tháng",
    monthsResultLabel: "Thời gian cần thiết",
    targetResultLabel: "Số tiền cuối kỳ",
    monthsUnit: "tháng",
    yearsSuffix: "năm",

    detailTitle: "Chi tiết",
    totalContributedLabel: "Tổng số tiền bạn bỏ vào",
    interestLabel: "Phần do lãi",
    interestShareLabel: "Lãi chiếm",

    noResultNotice:
      "Không có đáp án cho tổ hợp số liệu này. Thường là vì một trong ba trường hợp: mục tiêu đã nhỏ hơn hoặc bằng số tiền bạn đang có, nên không có “thời gian cần thiết”; số tiền đang có tự sinh lãi đã vượt mục tiêu trong khoảng thời gian đó, nên mức góp cần thiết là số âm; hoặc bạn không góp gì và lãi suất bằng 0, nên số dư không bao giờ thay đổi.",
  },

  endOfMonthNotice:
    "Công cụ giả định bạn góp vào CUỐI mỗi tháng, tức mỗi khoản góp được tính lãi từ tháng sau. Đây là cách một lệnh chuyển tiền định kỳ hoạt động và là giả định thận trọng hơn. Nếu bạn góp vào đầu tháng, số cuối kỳ thực tế nhỉnh hơn một chút — với 12 khoản góp 1 triệu ở mức 12%/năm thì chênh lệch khoảng 127 nghìn đồng.",

  formula: {
    title: "Cách tính",
    body: [
      "Cả ba chế độ đều dựa trên cùng một quan hệ niên kim: số cuối kỳ = số đã có × (1 + r)^n + góp mỗi tháng × ((1 + r)^n − 1) ÷ r, với r là lãi suất mỗi tháng và n là số tháng. Mỗi chế độ chỉ là giải phương trình đó cho một ẩn khác.",
      "Với mặc định — 100 triệu ban đầu, mục tiêu 500 triệu, 60 tháng, 6%/năm — bạn cần góp 5.233.121 ₫ mỗi tháng. Tổng bạn bỏ vào là 413.987.237 ₫, phần còn lại 86.012.763 ₫ là do lãi, tức 17,2% số tiền cuối kỳ.",
      "Lãi suất làm được nhiều hơn cảm nhận. Cùng mục tiêu đó ở mức 0%/năm cần góp 6.666.667 ₫ mỗi tháng — nhiều hơn gần 1,43 triệu mỗi tháng chỉ vì không có lãi.",
      "Chế độ tính thời gian KHÔNG làm tròn kết quả: 53,8 tháng là 53,8 tháng. Làm tròn xuống 53 sẽ nói rằng bạn đạt mục tiêu trước khi thực sự đạt, nên trang này hiển thị cả phần thập phân và bạn nên tính theo tháng thứ 54.",
      "Khi tổ hợp số liệu không có đáp án — mục tiêu đã đạt, mức góp cần thiết ra số âm, hoặc số dư không bao giờ đổi — công cụ để trống kết quả kèm ghi chú, thay vì hiển thị số 0 hay một con số âm trông như thật.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên nhập lãi suất bao nhiêu?",
        a: "Nhập mức bạn thực sự nhận được, không phải mức bạn hy vọng. Tiền gửi có kỳ hạn tại Việt Nam thường ở mức 4,5–6%/năm tùy kỳ hạn và ngân hàng; nếu bạn gửi tiết kiệm không kỳ hạn thì con số thấp hơn nhiều. Với mục tiêu dưới ba năm, đừng nhập lãi suất của quỹ cổ phiếu — thời gian quá ngắn để chịu được một năm giảm giá.",
      },
      {
        q: "Kết quả có tính lạm phát không?",
        a: "Không. Cả mục tiêu và số cuối kỳ đều là số tiền danh nghĩa. Nếu mục tiêu của bạn là mua một thứ mà giá sẽ tăng — một căn nhà, tiền học — thì hãy nhập mục tiêu theo giá dự kiến vào thời điểm mua, không phải giá hôm nay. Một cách nhanh: cộng thêm 4–5% mỗi năm vào giá hiện tại.",
      },
      {
        q: "Vì sao lãi chỉ chiếm 17% dù lãi suất tới 6%/năm?",
        a: "Vì phần lớn số tiền cuối kỳ mới được bỏ vào gần đây, nên nó chưa có thời gian sinh lãi. Khoản góp của tháng cuối cùng gần như không sinh lãi gì. Tỷ lệ này tăng nhanh theo thời gian: cùng mức góp đó trong 240 tháng thì phần lãi chiếm hơn một nửa. Đây là lý do bắt đầu sớm quan trọng hơn góp nhiều.",
      },
      {
        q: "Tôi muốn tăng mức góp dần theo lương thì tính thế nào?",
        a: "Công cụ này giả định mức góp không đổi. Cách gần đúng đơn giản là chia mục tiêu thành từng chặng: chạy công cụ cho hai năm đầu với mức góp hiện tại để biết số dư cuối chặng, rồi lấy số đó làm “số tiền đã có” cho chặng tiếp theo với mức góp mới. Cách này chính xác hơn là lấy mức góp trung bình.",
      },
      {
        q: "Nên chọn chế độ nào?",
        a: "Nếu bạn có một mốc thời gian cố định — đóng tiền nhà vào tháng 6 năm sau, học phí đầu năm học — hãy dùng chế độ tính mức góp. Nếu mức góp của bạn đã bị giới hạn bởi thu nhập, hãy dùng chế độ tính thời gian để biết thực tế bao lâu. Chế độ tính số cuối kỳ hữu ích khi bạn muốn thấy việc góp thêm một triệu mỗi tháng đổi được bao nhiêu sau năm năm.",
      },
    ],
  },
} as const;
