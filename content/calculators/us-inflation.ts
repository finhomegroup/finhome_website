// Copy for /cong-cu/lam-phat-hoa-ky/.
//
// Original FinHome copy. Models UNITED STATES data — registry sets
// usRules: true.
//
// Figures quoted are computeUsInflation's output, verified by running it.
// CPI mode defaults (1.000 USD, CPI 172,2 -> 320, 25 năm):
//   Tương đương 1.858,30 USD; lạm phát tích lũy 85,83%
//   Bình quân 2,5096%/năm; sức mua còn 0,5381; mất 46,19%
//   Thời gian sức mua giảm một nửa: 27,97 năm
// Rate mode (1.000 USD, 3%/năm, 25 năm): 2.093,78 USD, halving 23,4498 năm
//
// The CPI series is an INPUT, not shipped data. See the module docstring:
// a mistyped CPI reading is undetectable by the reader, because not knowing
// the number is the reason they came.

export const US_INFLATION = {
  slug: "/cong-cu/lam-phat-hoa-ky",

  pageTitle: "Lạm phát và sức mua Hoa Kỳ",
  metaTitle: "Lạm phát Hoa Kỳ — Sức mua của một số tiền theo chỉ số CPI",
  metaDescription:
    "Quy đổi sức mua một số tiền giữa hai thời điểm theo chỉ số giá tiêu dùng Hoa Kỳ, hoặc theo một tỷ lệ lạm phát giả định. Công cụ miễn phí của FinHome.",

  lede:
    "Hai câu hỏi khác nhau, và công cụ giữ chúng riêng: quy đổi theo hai số đọc CPI là một PHÉP ĐO chính xác cho hai thời điểm đó, còn quy đổi theo một tỷ lệ giả định là một PHÉP DỰ BÁO. Trang này không trộn hai thứ lại.",

  form: {
    modeGroup: "Cách quy đổi",
    modeLabel: "Chọn cách tính",
    modeHelp:
      "Chế độ CPI cho kết quả chính xác cho hai thời điểm bạn tra được. Chế độ tỷ lệ là một giả định.",
    modeOptions: {
      cpi: "Theo hai số đọc CPI (phép đo)",
      rate: "Theo tỷ lệ lạm phát giả định (dự báo)",
    },

    amountGroup: "Số tiền",
    amountLabel: "Số tiền cần quy đổi",
    amountUnit: "USD",
    amountHelp: "Số tiền tại thời điểm đầu.",
    amountInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    cpiGroup: "Chỉ số CPI",
    startCpiLabel: "CPI thời điểm đầu",
    startCpiHelp: "Tra từ Cục Thống kê Lao động Hoa Kỳ (BLS), chuỗi CPI-U.",
    startCpiInvalid: "Vui lòng nhập một số lớn hơn 0.",

    endCpiLabel: "CPI thời điểm sau",
    endCpiHelp: "Cùng chuỗi CPI-U, cùng loại (bình quân năm hoặc theo tháng).",
    endCpiInvalid: "Vui lòng nhập một số lớn hơn 0.",

    rateGroup: "Tỷ lệ lạm phát",
    rateLabel: "Lạm phát bình quân",
    rateUnit: "%/năm",
    rateHelp: "Có thể âm để mô phỏng giảm phát. Không nhận −100% hoặc thấp hơn.",
    rateInvalid: "Vui lòng nhập một số lớn hơn −100.",

    yearsLabel: "Số năm giữa hai thời điểm",
    yearsUnit: "năm",
    yearsHelp:
      "Ở chế độ CPI, con số này chỉ dùng để quy tỷ lệ bình quân mỗi năm — bản thân phép quy đổi không cần nó. Nhận cả số thập phân.",
    yearsInvalid: "Vui lòng nhập một số lớn hơn 0.",

    defaults: {
      mode: "cpi",
      amount: "1.000",
      startCpi: "172,2",
      endCpi: "320",
      rate: "3",
      years: "25",
    },

    resultTitle: "Kết quả quy đổi",
    equivalentLabel: "Tương đương tại thời điểm sau",
    cumulativeLabel: "Lạm phát tích lũy",
    annualLabel: "Bình quân mỗi năm",

    powerTitle: "Sức mua",
    powerOfOneLabel: "1 USD ban đầu giờ mua được",
    powerLostLabel: "Sức mua đã mất",
    halvingLabel: "Sức mua giảm một nửa sau",
    halvingUnit: "năm",
    neverHalves: "Không bao giờ (giá không tăng)",

    cpiSourceNotice:
      "Công cụ cố ý KHÔNG kèm sẵn chuỗi CPI lịch sử mà để bạn tự nhập hai số đọc. Lý do: một số CPI bị chép sai sẽ cho ra kết quả sai mà người đọc không có cách nào phát hiện — vì chính việc không biết con số đó mới là lý do họ dùng công cụ. Chuỗi CPI cũng được điều chỉnh và đổi gốc theo thời gian, nên một bảng kèm sẵn sẽ cũ đi một cách vô hình. Tra hai số đọc tại Cục Thống kê Lao động Hoa Kỳ (bls.gov, chuỗi CPI-U) rồi nhập vào đây, kết quả sẽ chính xác cho đúng hai thời điểm đó và chính xác mãi về sau. Lưu ý dùng cùng một loại số đọc cho cả hai — hoặc cùng là bình quân năm, hoặc cùng là số theo tháng.",
    deflationNotice:
      "Hai số đọc cho thấy giá GIẢM trong kỳ. Sức mua tăng, nên dòng “sức mua đã mất” hiện số âm — đó là phần sức mua có thêm. Giảm phát không bao giờ làm sức mua giảm một nửa, nên dòng đó để trống.",
    rateModeNotice:
      "Đang ở chế độ tỷ lệ giả định. Đây là một phép dự báo: kết quả nói về tỷ lệ bạn đã chọn nhiều hơn là về lạm phát thực tế. Hai ô CPI không ảnh hưởng gì ở chế độ này.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. CPI phải lớn hơn 0 và số năm phải lớn hơn 0.",
  },

  conflationNotice:
    "Một điểm hay bị lẫn: lạm phát tích lũy và sức mua đã mất KHÔNG phải cùng một con số, và con số thứ hai luôn nhỏ hơn. Giá tăng gấp đôi là lạm phát 100%, nhưng sức mua chỉ mất 50% — vì 1 USD giờ mua được nửa số hàng, không phải không mua được gì. Giá tăng gấp ba là lạm phát 200% và sức mua mất 66,67%. Sức mua đã mất không bao giờ đạt 100% dù lạm phát cao đến đâu, vì tiền luôn còn một phần giá trị. Công cụ hiển thị cả hai dòng riêng biệt, và bộ kiểm thử quét một dải rộng để bảo đảm dòng thứ hai luôn nhỏ hơn dòng thứ nhất.",

  formula: {
    title: "Cách tính",
    body: [
      "Ở chế độ CPI, số tiền quy đổi bằng số tiền ban đầu nhân tỷ lệ CPI cuối trên CPI đầu. Đây đúng là phép tính mà Cục Thống kê Lao động Hoa Kỳ dùng, và nó chính xác cho hai thời điểm bạn nhập.",
      "Tỷ lệ bình quân mỗi năm được SUY RA từ hai số đọc và khoảng cách năm, chứ không phải một con số bạn nhập. Bộ kiểm thử ghép ngược lại: lấy tỷ lệ bình quân đó nhân dồn qua đúng số năm phải cho ra chính xác tỷ lệ CPI ban đầu, tới 12 chữ số thập phân.",
      "Ở chế độ tỷ lệ, số tiền được nhân dồn theo (1 + tỷ lệ) lũy thừa số năm. Đây là dự báo, và trang nói rõ như vậy — nó phản ánh tỷ lệ bạn chọn, không phản ánh một dữ liệu nào.",
      "Sức mua của 1 USD là nghịch đảo của mức tăng giá. Nếu giá tăng 85,83% thì 1 USD ban đầu chỉ còn mua được 0,5381 phần hàng hóa so với trước, tức sức mua mất 46,19%.",
      "Thời gian để sức mua giảm một nửa tính bằng logarit: ln2 chia ln(1 + tỷ lệ). Bộ kiểm thử không kiểm công thức mà kiểm định nghĩa — đưa đúng số năm đó trở lại công cụ thì sức mua phải bằng chính xác 0,5.",
      "Không có chỗ nào làm tròn trung gian. Câu hỏi về sức mua là một tỷ lệ, và làm tròn một tỷ lệ ở giữa là cách một phép quy đổi 40 năm lệch đi vài đô la.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao tôi phải tự tra chỉ số CPI?",
        a: "Vì đây là loại sai sót không thể tự phát hiện. Nếu công cụ kèm sẵn một bảng CPI và một số trong đó bị chép sai, bạn sẽ nhận một kết quả sai mà không có cách nào biết — chính vì bạn không biết con số CPI mới cần đến công cụ. Trong quá trình xây bộ công cụ này chúng tôi từng chép sai một bộ hệ số toán học và chỉ phát hiện nhờ kiểm tra ngược. Với CPI thì không có phép kiểm tra ngược nào cứu được. Ngoài ra chuỗi CPI còn được điều chỉnh và đổi gốc, nên bảng kèm sẵn sẽ cũ đi mà không ai thấy. Cách này khiến kết quả chính xác cho đúng hai số đọc bạn tra, và chính xác mãi mãi.",
      },
      {
        q: "Lạm phát 100% và mất 50% sức mua có phải một chuyện?",
        a: "Không, và đó là chỗ hay bị lẫn nhất. Giá tăng gấp đôi nghĩa là lạm phát 100%, nhưng 1 USD vẫn mua được một nửa lượng hàng cũ — nên sức mua mất 50%, không phải 100%. Sức mua đã mất luôn nhỏ hơn lạm phát tích lũy, và không bao giờ đạt tới 100%: dù giá tăng gấp trăm lần, tiền vẫn còn 1% giá trị chứ không thành vô giá trị.",
      },
      {
        q: "Nên dùng chế độ nào?",
        a: "Dùng chế độ CPI khi hỏi về quá khứ — hai thời điểm đã xảy ra thì có số đọc thật và câu trả lời là một phép đo. Dùng chế độ tỷ lệ khi hỏi về tương lai, và hiểu rằng kết quả phản ánh tỷ lệ bạn chọn. Với kỳ dài, hãy thử hai ba tỷ lệ khác nhau: khoảng cách giữa các kết quả cho biết câu trả lời phụ thuộc vào giả định đến mức nào.",
      },
      {
        q: "CPI có phản ánh đúng lạm phát của riêng tôi không?",
        a: "Không hẳn. CPI là giá của một giỏ hàng hóa bình quân cho một hộ gia đình thành thị điển hình. Nếu chi tiêu của bạn lệch nhiều so với giỏ đó — thuê nhà chiếm phần rất lớn, hoặc chi phí y tế, hoặc học phí — thì lạm phát bạn cảm nhận có thể cao hơn hoặc thấp hơn CPI đáng kể. Các nhóm chi phí đó đã tăng nhanh hơn CPI tổng thể trong nhiều thập kỷ.",
      },
      {
        q: "Chế độ CPI có cần đúng số năm không?",
        a: "Phép quy đổi số tiền thì không cần: nó chỉ dùng tỷ lệ hai số đọc. Số năm chỉ dùng để quy ra tỷ lệ bình quân mỗi năm và thời gian sức mua giảm một nửa. Nếu bạn nhập sai số năm, số tiền tương đương vẫn đúng còn hai dòng kia sẽ sai. Với hai số đọc theo tháng, hãy nhập số năm dạng thập phân — ví dụ 18 tháng là 1,5.",
      },
    ],
  },
} as const;
