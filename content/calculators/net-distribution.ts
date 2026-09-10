// Copy for /cong-cu/phan-phoi-rong/ — gross to net and back.
//
// Original FinHome copy.
//
// The page exists for the REVERSE direction. "What must be quoted for me to
// receive 100 triệu" is the question people cannot do in their heads, and the
// intuitive answer — add the deduction rate back — is wrong. Recovering a 10%
// deduction needs 11,11% more gross, not 10%, and at 50% the gross doubles.
//
// The other correctness point, stated in the prose: several percentage
// deductions apply to the SAME base rather than compounding. Two 5% lines
// take 10%, not 9,75%. That is how tax and levy schedules are written, and
// compounding them would quietly reduce the total.

export const NET_DISTRIBUTION = {
  slug: "/cong-cu/phan-phoi-rong",

  pageTitle: "Số tiền nhận ròng: từ tổng ra thực nhận và ngược lại",
  metaTitle: "Tính số tiền nhận ròng — Gộp thành thực nhận và ngược lại",
  metaDescription:
    "Tính số tiền thực nhận sau các khoản trừ theo phần trăm và theo số tiền, hoặc ngược lại: cần báo giá bao nhiêu để nhận đủ số bạn muốn. Công cụ miễn phí của FinHome.",

  lede:
    "Một khoản tiền về ít hơn con số được báo vì có một chuỗi khoản trừ nằm giữa. Công cụ chạy chuỗi đó theo cả hai chiều — và chiều nghịch mới là lý do trang này tồn tại, vì cách tính trong đầu cho ra con số sai.",

  form: {
    directionLegend: "Bạn có con số nào?",
    directionHelp:
      "Chiều thứ hai trả lời câu hỏi khó hơn: cần báo giá bao nhiêu để nhận đủ số tiền bạn cần.",
    directionToNet: "Có số tổng, tính số thực nhận",
    directionToGross: "Có số cần nhận, tính số phải báo",
    defaultDirection: "toNet",

    amountGroup: "Số tiền",
    amountLabel: "Số tiền",
    amountUnit: "₫",
    amountHelp: "Con số bạn đang có, theo chiều đã chọn ở trên.",
    amountInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultAmount: "100.000.000",

    percentGroup: "Khoản trừ theo phần trăm",
    percentHelp:
      "Các dòng này được tính trên CÙNG số tổng, không cộng dồn lên nhau. Tổng phải nhỏ hơn 100%.",
    percent1Label: "Khoản trừ 1",
    percent2Label: "Khoản trừ 2",
    percent3Label: "Khoản trừ 3",
    percentUnit: "%",
    percentInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPercent1: "5",
    defaultPercent2: "5",
    defaultPercent3: "0",

    fixedGroup: "Khoản trừ theo số tiền",
    fixedHelp: "Các khoản cố định, trừ sau phần trăm. Ví dụ phí chuyển tiền.",
    fixed1Label: "Khoản trừ cố định 1",
    fixed2Label: "Khoản trừ cố định 2",
    fixedUnit: "₫",
    fixedInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultFixed1: "200.000",
    defaultFixed2: "0",

    resultTitle: "Kết quả",
    grossLabel: "Số tổng",
    netLabel: "Số thực nhận",
    grossUpLabel: "Phải báo thêm bao nhiêu so với số cần nhận",

    detailTitle: "Chi tiết",
    percentAmountLabel: "Trừ theo phần trăm",
    fixedAmountLabel: "Trừ theo số tiền",
    totalDeductedLabel: "Tổng trừ",
    totalRateLabel: "Tổng tỷ lệ trừ",
    effectiveRateLabel: "Tỷ lệ trừ thực tế trên số tổng",
    retentionLabel: "Còn lại",

    negativeNetNotice:
      "Số thực nhận là số ÂM: các khoản trừ cố định lớn hơn cả số còn lại sau khi trừ phần trăm. Công cụ không làm tròn về 0 vì đây là kết quả thật — một khoản tiền nhỏ có thể bị một khoản phí cố định ăn hết và còn thiếu.",
    tooMuchNotice:
      "Tổng các khoản trừ theo phần trăm bằng hoặc vượt 100%, nên không còn gì lại và chiều nghịch cũng không có đáp án. Hãy kiểm tra lại các tỷ lệ đã nhập.",
  },

  reverseNotice:
    "Chiều nghịch là chỗ cách tính trong đầu sai. Nếu bị trừ 10% mà bạn cần nhận 90 triệu, số phải báo là 100 triệu — không phải 99 triệu. Nói cách khác, để bù một khoản trừ 10% bạn cần thêm 11,11% số tổng, không phải 10%. Khoảng cách này rộng rất nhanh: ở mức trừ 50% thì số phải báo tăng gấp đôi, ở mức 75% thì gấp bốn. Đây là lý do những người làm nghề tự do và nhà thầu thường báo giá thiếu — họ cộng thuế vào thay vì chia cho phần còn lại.",

  formula: {
    title: "Cách tính",
    body: [
      "Chiều thuận: số thực nhận = số tổng × (1 − tổng tỷ lệ trừ) − tổng khoản trừ cố định. Với mặc định: 100.000.000 × 0,9 − 200.000 = 89.800.000 ₫.",
      "Các khoản trừ theo phần trăm được tính trên CÙNG số tổng, không cộng dồn. Hai dòng 5% lấy đúng 10%, không phải 1 − 0,95² = 9,75%. Đây là cách các biểu thuế và biểu phí được viết, và cộng dồn sẽ âm thầm làm giảm tổng khoản trừ.",
      "Chiều nghịch là phép đảo: số tổng = (số cần nhận + tổng khoản trừ cố định) ÷ (1 − tổng tỷ lệ trừ). Phép CHIA đó là bước mà cách tính trong đầu bỏ qua.",
      "Dòng “phải báo thêm bao nhiêu” được tính so với SỐ CẦN NHẬN, vì đó là con số bạn đang muốn bảo vệ. Ở mức trừ 10% nó là 11,11%; ở mức 50% là 100%; ở mức 75% là 300%.",
      "Khi các khoản trừ cố định lớn hơn phần còn lại sau phần trăm, số thực nhận là số âm và công cụ hiển thị đúng như vậy chứ không làm tròn về 0 — một khoản chuyển tiền nhỏ bị phí cố định ăn hết là trường hợp thật, và che nó lại là che mất vấn đề.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Dùng công cụ này cho những trường hợp nào?",
        a: "Bất cứ khi nào có một chuỗi khoản trừ giữa con số được báo và con số về tay. Ví dụ thường gặp: báo giá dịch vụ có thuế khấu trừ tại nguồn, nhận tiền từ nước ngoài với phí chuyển và phí trung gian, hoa hồng môi giới trừ trên giá bán, hoặc rút tiền từ một sản phẩm đầu tư có phí bán. Công cụ không gắn với một loại thuế cụ thể — bạn nhập tỷ lệ và phí thực tế của mình.",
      },
      {
        q: "Vì sao 10% lại cần bù 11,11%?",
        a: "Vì khoản trừ được tính trên con số LỚN HƠN. Để còn lại 90 sau khi mất 10%, bạn phải bắt đầu từ 100 — và 10 chia cho 90 là 11,11%. Cùng logic với việc một khoản lỗ 50% cần lãi 100% mới hồi vốn: phần trăm của hai mốc khác nhau thì không bù trừ nhau.",
      },
      {
        q: "Vì sao không cộng dồn các khoản trừ phần trăm?",
        a: "Vì các biểu thuế và biểu phí không được viết như vậy. Khi văn bản nói “5% thuế giá trị gia tăng và 5% thuế thu nhập cá nhân trên doanh thu”, cả hai đều tính trên doanh thu, nên tổng là 10%. Cộng dồn — trừ 5% rồi trừ 5% của phần còn lại — cho 9,75% và làm bạn tính thiếu. Nếu biểu phí của bạn thực sự cộng dồn, hãy nhập chúng ở hai lần chạy riêng.",
      },
      {
        q: "Có tính thuế thu nhập cá nhân lũy tiến không?",
        a: "Không. Công cụ chỉ làm việc với tỷ lệ cố định, nên nó đúng cho thuế khấu trừ theo tỷ lệ — như 10% khấu trừ với hợp đồng dịch vụ, 5% với cổ tức, 0,1% với chuyển nhượng chứng khoán. Thuế thu nhập từ tiền lương thì lũy tiến theo bậc và cần một bảng bậc thuế, nằm ngoài phạm vi này.",
      },
    ],
  },
} as const;
