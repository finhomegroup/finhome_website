// Copy for /cong-cu/loi-nhuan-ky-vong/ — the expected return calculator.
//
// Original FinHome copy. Population statistics over a stated distribution.
//
// The page's job is to stop the reader at the expected return. That number is
// a weighted average and almost nobody's actual outcome; the spread around it
// is the information. So the tool reports standard deviation, the coefficient
// of variation (risk PER UNIT of return — the figure people skip, and the
// only one that compares investments of different sizes), semi-deviation, and
// the plain probability of a loss.
//
// Figures quoted are for the defaults (25% khả năng lãi 25%, 50% lãi 10%,
// 25% lỗ 15%): kỳ vọng 7,5%, phương sai 206,25, độ lệch chuẩn 14,3614%,
// hệ số biến thiên 1,9149, rủi ro xuống 11,25%, xác suất lỗ 25%.

export const EXPECTED_RETURN = {
  slug: "/cong-cu/loi-nhuan-ky-vong",

  pageTitle: "Lợi nhuận kỳ vọng: và mức dao động quanh nó",
  metaTitle: "Tính lợi nhuận kỳ vọng — Độ lệch chuẩn và hệ số biến thiên",
  metaDescription:
    "Tính lợi nhuận kỳ vọng từ các tình huống có xác suất, kèm độ lệch chuẩn, hệ số biến thiên, rủi ro xuống và xác suất lỗ. Công cụ miễn phí của FinHome.",

  lede:
    "Lợi nhuận kỳ vọng là bình quân gia quyền của các tình huống — và gần như không ai nhận được đúng con số đó. Phần thông tin nằm ở mức dao động quanh nó, nên công cụ tính bốn thước đo rủi ro khác nhau bên cạnh.",

  form: {
    setupGroup: "Thiết lập",
    countLabel: "Số tình huống",
    countHelp:
      "Từ 2 đến 8. Ba tình huống — tốt, trung bình, xấu — là cách dùng phổ biến nhất.",
    countInvalid: "Vui lòng nhập số nguyên từ 2 đến 8.",
    defaultCount: "3",

    scenarioGroup: "Các tình huống",
    probabilityLabel: "Tình huống {n} — xác suất",
    probabilityUnit: "%",
    probabilityHelp:
      "Tổng xác suất của tất cả tình huống phải bằng đúng 100%.",
    probabilityInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    returnLabel: "Tình huống {n} — lợi nhuận",
    returnUnit: "%",
    returnHelp: "Mức sinh lời nếu tình huống này xảy ra. Nhập số âm cho lỗ.",
    returnInvalid: "Vui lòng nhập một số.",

    defaultProbabilities: ["25", "50", "25", "0", "0", "0", "0", "0"],
    defaultReturns: ["25", "10", "-15", "0", "0", "0", "0", "0"],

    resultTitle: "Kết quả",
    expectedLabel: "Lợi nhuận kỳ vọng",
    stdDevLabel: "Độ lệch chuẩn",
    coefficientLabel: "Hệ số biến thiên (rủi ro trên mỗi đơn vị lợi nhuận)",

    detailTitle: "Chi tiết",
    downsideLabel: "Rủi ro xuống (chỉ tính các tình huống dưới kỳ vọng)",
    lossProbabilityLabel: "Xác suất lỗ",
    bestLabel: "Tình huống tốt nhất",
    worstLabel: "Tình huống xấu nhất",
    varianceLabel: "Phương sai",

    probabilitySumLabel: "Tổng xác suất đã nhập",
    badSumNotice:
      "Tổng xác suất không bằng 100%, nên đây chưa phải một phân phối và công cụ không tính. Công cụ CỐ Ý không tự chuẩn hóa về 100%: một tổng bằng 90% thường nghĩa là bạn còn thiếu một tình huống, và việc tự chia lại tỷ lệ sẽ trả lời một câu hỏi khác câu bạn đang hỏi.",
    noCoefficientNotice:
      "Hệ số biến thiên chỉ có ý nghĩa khi lợi nhuận kỳ vọng dương. Với kỳ vọng bằng 0 hoặc âm, phép chia cho ra một con số vô nghĩa chứ không phải một con số lớn, nên ô đó để trống.",
  },

  spreadNotice:
    "Đừng dừng ở dòng đầu tiên. Với các tình huống mặc định, lợi nhuận kỳ vọng là 7,5% — nhưng không tình huống nào cho ra 7,5%: bạn được 25%, được 10%, hoặc mất 15%. Độ lệch chuẩn 14,3614% nói rằng mức dao động lớn gần gấp đôi chính con số kỳ vọng. Và hệ số biến thiên 1,9149 là con số duy nhất so sánh được giữa hai khoản đầu tư có kỳ vọng khác nhau: một phương án kỳ vọng 20% với độ lệch 30% (hệ số 1,5) rủi ro ÍT hơn trên mỗi đơn vị lợi nhuận so với một phương án kỳ vọng 10% với độ lệch 20% (hệ số 2,0), dù nghe thì ngược lại.",

  formula: {
    title: "Cách tính",
    body: [
      "Lợi nhuận kỳ vọng = tổng của (xác suất × lợi nhuận) qua tất cả tình huống. Với mặc định: 0,25 × 25% + 0,5 × 10% + 0,25 × (−15%) = 6,25% + 5% − 3,75% = 7,5%.",
      "Phương sai = tổng của xác suất × (lợi nhuận − kỳ vọng)². Độ lệch chuẩn là căn bậc hai của phương sai, nên nó cùng đơn vị với lợi nhuận và đọc được cạnh nó. Với mặc định, phương sai là 206,25 và độ lệch chuẩn là 14,3614%.",
      "Đây là thống kê TOÀN BỘ phân phối, không phải thống kê mẫu, nên không có hiệu chỉnh chia cho n − 1. Xác suất đã được bạn khai báo đầy đủ, không phải suy ra từ một mẫu quan sát. Kiểm chứng nhanh: một phân phối 50/50 của +10% và −10% cho độ lệch chuẩn đúng 10%.",
      "Hệ số biến thiên = độ lệch chuẩn ÷ lợi nhuận kỳ vọng. Nó chuẩn hóa rủi ro theo quy mô lợi nhuận, nên đây là thước đo để so hai khoản đầu tư khác nhau. Số càng nhỏ càng tốt. Nó không xác định khi kỳ vọng bằng 0 hoặc âm.",
      "Rủi ro xuống, hay bán độ lệch, chỉ tính các tình huống có lợi nhuận DƯỚI mức kỳ vọng: 11,25% với mặc định, thấp hơn độ lệch chuẩn 14,3614%. Lý do có thước đo này: độ lệch chuẩn coi một bất ngờ tăng giá là rủi ro y như một bất ngờ giảm giá, điều không ai thực sự cảm nhận như vậy.",
      "Xác suất lỗ là tổng xác suất của các tình huống có lợi nhuận âm — 25% với mặc định. Lợi nhuận bằng 0 không được tính là lỗ. Đây là con số dễ hiểu nhất trong cả trang và thường là con số hữu ích nhất cho một quyết định thực tế.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy xác suất ở đâu ra?",
        a: "Bạn tự đặt, và đó vừa là điểm mạnh vừa là điểm yếu của phương pháp này. Không có nguồn dữ liệu nào cho biết xác suất thị trường tăng 25% năm tới. Giá trị của công cụ nằm ở chỗ nó buộc bạn viết ra giả định của mình thành số, để rồi có thể tranh luận về chúng — thay vì để chúng ẩn trong một cảm giác. Hãy thử vài bộ xác suất khác nhau và xem kết luận có đổi.",
      },
      {
        q: "Vì sao không tự chuẩn hóa tổng về 100%?",
        a: "Vì một tổng bằng 90% hầu như luôn nghĩa là bạn còn thiếu một tình huống, không phải là các con số cần chia lại tỷ lệ. Nếu công cụ tự chuẩn hóa, nó sẽ âm thầm giả định rằng 10% xác suất còn lại phân bổ giống hệt 90% đã biết — một giả định bạn không đưa ra. Từ chối tính là cách nói rằng phân phối chưa hoàn chỉnh.",
      },
      {
        q: "Độ lệch chuẩn và rủi ro xuống, nên dùng cái nào?",
        a: "Dùng cả hai và để ý khoảng cách giữa chúng. Nếu hai con số gần nhau, phân phối khá cân đối. Nếu rủi ro xuống nhỏ hơn nhiều, phần lớn dao động đến từ khả năng thắng lớn — đó là loại rủi ro dễ chịu hơn nhiều. Với các khoản đầu tư có khả năng mất nhiều nhưng thắng nhỏ, rủi ro xuống sẽ gần bằng độ lệch chuẩn và đó là dấu hiệu cần cẩn thận.",
      },
      {
        q: "Ba tình huống có đủ không?",
        a: "Đủ cho phần lớn quyết định thực tế, và tốt hơn nhiều so với một con số duy nhất. Nếu bạn muốn mô tả một phân phối liên tục thì ba điểm là thô, nhưng độ chính xác thêm được từ tám tình huống thường nhỏ hơn sai số trong chính các xác suất bạn ước lượng. Ba tình huống có trọng số 25/50/25 là điểm khởi đầu hợp lý.",
      },
      {
        q: "Kết quả có so sánh được với lãi tiền gửi không?",
        a: "So được, và đó là cách dùng tốt. Lãi tiền gửi có kỳ hạn là một phân phối một tình huống với xác suất gần 100% — độ lệch chuẩn bằng 0 và xác suất lỗ bằng 0. Khi bạn đặt một phương án kỳ vọng 7,5% với xác suất lỗ 25% cạnh một khoản gửi 5,5% với xác suất lỗ 0%, câu hỏi trở nên rõ ràng: 2 điểm phần trăm kỳ vọng có đáng đổi lấy một phần tư khả năng mất tiền hay không.",
      },
    ],
  },
} as const;
