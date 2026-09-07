// Copy for /cong-cu/so-sanh-khoan-vay/ — the loan comparison calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// The one editorial decision in here: the tool ranks options on the cost of
// borrowing (lãi + phí), and the copy says so repeatedly and says why. A
// borrower shown three instalments side by side will pick the smallest, which
// on a longer term is the most expensive option on the page. Every label,
// every help line and the FAQ all push back on that instinct.

export const LOAN_COMPARE = {
  slug: "/cong-cu/so-sanh-khoan-vay",

  pageTitle: "So sánh khoản vay: phương án nào rẻ hơn?",
  metaTitle: "So sánh khoản vay — Đặt ba phương án cạnh nhau",
  metaDescription:
    "Nhập lãi suất, kỳ hạn và phí của từng phương án vay để so sánh khoản trả hằng tháng, tổng lãi và tổng chi phí vay. Công cụ miễn phí của FinHome.",

  lede:
    "Ba ngân hàng báo giá ba con số khác nhau, và phương án có khoản trả hằng tháng thấp nhất thường không phải phương án rẻ nhất. Nhập cùng một số tiền vay với lãi suất, kỳ hạn và phí của từng nơi để xem chi phí vay thực sự của mỗi phương án.",

  form: {
    amountGroup: "Số tiền vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp:
      "Dùng chung cho cả ba phương án, vì chỉ khi cùng số tiền vay thì lãi suất và phí mới so sánh được với nhau.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    optionLabels: ["Phương án A", "Phương án B", "Phương án C"],

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",

    termLabel: "Kỳ hạn",
    termUnit: "năm",
    termHelp: "Số năm trả nợ.",
    termInvalid: "Vui lòng nhập kỳ hạn lớn hơn 0.",

    feeLabel: "Phí thu xếp",
    feeUnit: "% số tiền vay",
    feeHelp:
      "Phí trả một lần khi giải ngân, tính theo phần trăm số tiền vay. Để 0 nếu không có.",
    feeInvalid: "Phí không được là số âm.",

    defaults: [
      { rate: "8,5", term: "20", fee: "0" },
      { rate: "9,2", term: "20", fee: "0" },
      { rate: "8,5", term: "25", fee: "1" },
    ],

    resultTitle: "Phương án rẻ nhất",
    bestLabel: "Rẻ nhất theo chi phí vay",
    spreadLabel: "Chênh lệch với phương án đắt nhất",

    tooFewNotice:
      "Cần ít nhất hai phương án có đủ lãi suất và kỳ hạn để so sánh. Hãy điền lại phương án còn thiếu, hoặc dùng công cụ tính khoản vay nếu bạn chỉ có một phương án.",
  },

  table: {
    caption: "So sánh từng chỉ tiêu",
    metricColumn: "Chỉ tiêu",
    rows: {
      monthly: "Trả hằng tháng",
      months: "Số tháng trả nợ",
      totalInterest: "Tổng lãi",
      fee: "Phí thu xếp",
      costOfBorrowing: "Chi phí vay (lãi + phí)",
      totalOutlay: "Tổng số tiền bỏ ra",
      extraVsBest: "Đắt hơn phương án rẻ nhất",
    },
    intro:
      "Dòng cần xem trước tiên là chi phí vay: lãi cộng phí, tức toàn bộ số tiền bạn trả thêm ngoài số đã vay. Dòng trả hằng tháng cho biết mỗi tháng bạn cần thu xếp bao nhiêu, nhưng con số đó nhỏ đi khi kỳ hạn dài ra, nên nó không nói lên phương án nào rẻ hơn.",
  },

  rankingNotice:
    "Công cụ xếp hạng theo chi phí vay, không theo khoản trả hằng tháng. Kéo dài kỳ hạn luôn làm khoản trả hằng tháng nhỏ đi trong khi tổng lãi tăng lên, nên nếu xếp hạng theo khoản trả hằng tháng thì phương án đắt nhất sẽ luôn thắng.",

  formula: {
    title: "Cách tính",
    body: [
      "Mỗi phương án được tính như một khoản vay trả góp đều theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), với P là số tiền vay, r là lãi suất mỗi tháng và n là số tháng vay. Tổng lãi bằng tổng số tiền trả trong suốt kỳ hạn trừ số tiền vay.",
      "Phí thu xếp được tính trên số tiền vay tại thời điểm giải ngân, không tính trên tổng số tiền trả. Chi phí vay của một phương án bằng tổng lãi cộng phí thu xếp — đây là con số dùng để xếp hạng.",
      "Tổng số tiền bỏ ra bằng số tiền vay cộng chi phí vay. Vì cả ba phương án dùng chung một số tiền vay, thứ tự xếp hạng theo tổng số tiền bỏ ra và theo chi phí vay luôn giống nhau.",
      "Khi hai phương án có chi phí vay bằng nhau, công cụ giữ phương án đứng trước làm phương án rẻ nhất, để không tạo ra một chênh lệch không tồn tại.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao phương án trả hằng tháng ít nhất lại không phải phương án rẻ nhất?",
        a: "Vì khoản trả hằng tháng phụ thuộc vào kỳ hạn nhiều hơn là vào lãi suất. Kéo kỳ hạn từ 20 năm lên 25 năm làm mỗi tháng nhẹ đi đáng kể, nhưng bạn trả lãi thêm 5 năm trên một dư nợ giảm chậm hơn, nên tổng lãi tăng. Hãy nhập cùng một lãi suất với hai kỳ hạn khác nhau trong công cụ để thấy rõ.",
      },
      {
        q: "Phí thu xếp nhỏ như vậy có đáng đưa vào so sánh không?",
        a: "Có, vì nó thường đủ để đảo ngược thứ tự. Với khoản vay 2 tỷ trong 20 năm, mỗi 0,1 điểm phần trăm lãi suất tương đương khoảng 30 triệu tiền lãi — cùng cỡ với một khoản phí 1,5%. Một ngân hàng báo lãi suất thấp hơn 0,1 điểm nhưng thu phí 2% thực chất đang bán phương án đắt hơn.",
      },
      {
        q: "Nếu ngân hàng chỉ ưu đãi lãi suất trong hai năm đầu thì so sánh thế nào?",
        a: "Công cụ này giả định lãi suất không đổi trong suốt kỳ hạn, nên đừng nhập mức lãi ưu đãi. Hãy hỏi ngân hàng mức lãi sau ưu đãi — thường là lãi cơ sở cộng biên độ — và nhập mức đó, vì đó là mức bạn trả trong phần lớn thời gian vay. Nếu muốn thấy khoảng dao động, hãy chạy công cụ hai lần: một lần với mức lãi ưu đãi, một lần với mức sau ưu đãi.",
      },
      {
        q: "Còn phí trả nợ trước hạn thì sao?",
        a: "Công cụ chưa tính, vì nó chỉ phát sinh nếu bạn tất toán sớm và mỗi ngân hàng quy định một biểu phí khác nhau, thường giảm dần theo số năm đã vay. Nếu bạn dự định trả trước hạn, hãy hỏi rõ mức phí và số năm bị áp phí, rồi cộng thủ công vào chi phí vay của phương án đó.",
      },
      {
        q: "Tôi chỉ muốn so sánh hai phương án, phải làm gì với phương án C?",
        a: "Xóa trống lãi suất hoặc kỳ hạn của phương án C. Cột đó sẽ hiển thị dấu gạch ngang và không tham gia xếp hạng, còn hai phương án còn lại vẫn được so sánh bình thường.",
      },
    ],
  },
} as const;
