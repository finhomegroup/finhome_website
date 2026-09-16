// Copy for /cong-cu/tra-toi-thieu-the-tin-dung/ — the minimum-payment route.
//
// Original FinHome copy. THE ROUTE IS NOW A STRATEGY of the card-payoff
// workspace (original row 30: "gộp thành chế độ so sánh của công cụ trả hết
// nợ"), so this file holds only this page's own framing: its title, its lede,
// the notice that IS the page, its formula section and its FAQ. The form
// labels, the results, the chart and the dates come from
// `content/calculators/card-payoff.ts`, because the tool is the same tool.
// The URL is unchanged.
//
// WHAT THE CONSOLIDATION ADDED HERE. The old page was a second form with its
// own balance and rate fields, no dates, no chart and no household budget. It
// now opens on the minimum strategy of one workspace, so a reader who typed
// their balance to ask "bao lâu tôi hết nợ" can ask "còn nếu chỉ trả tối
// thiểu" without retyping anything — and gets both debt paths, both payoff
// dates and the monthly allocation that frees up.
//
// Figures quoted below are the workspace's own output for 50 triệu at 30%/năm
// với mức tối thiểu 5% và sàn 500.000 ₫, bound to the module by
// `card-payoff.test.ts`: 90 tháng (7,5 năm), tổng lãi 43.091.470 ₫ tức 86,2%
// dư nợ, khoản trả đầu 2.563.261 ₫ — tức 5% của dư nợ cuối kỳ đầu tiên,
// 51.265.229,61 ₫. Bắt đầu 15/9/2026 thì hết nợ 15/3/2034. Trả ĐÚNG con số
// 2.563.261 ₫ đó mỗi tháng nhưng CỐ ĐỊNH: chỉ 28 tháng, hết nợ 15/1/2029 và
// lãi 19.799.257 ₫.

export const CARD_MINIMUM = {
  slug: "/cong-cu/tra-toi-thieu-the-tin-dung",

  pageTitle: "Trả mức tối thiểu thẻ tín dụng: mất bao nhiêu năm?",
  metaTitle: "Tính trả mức tối thiểu thẻ tín dụng — Bẫy trả tối thiểu",
  metaDescription:
    "Tính số năm, ngày hết nợ và tổng lãi nếu bạn chỉ trả mức tối thiểu của thẻ tín dụng, và so với việc trả cùng số tiền đó nhưng cố định. Công cụ miễn phí của FinHome.",

  lede:
    "Mức trả tối thiểu là một tỷ lệ phần trăm của dư nợ, nên nó nhỏ dần đúng theo tốc độ dư nợ giảm. Đó là lý do trả tối thiểu mất nhiều năm — và là lý do trả CỐ ĐỊNH đúng số tiền tối thiểu của tháng đầu lại nhanh hơn nhiều lần. Trang này mở sẵn chế độ trả tối thiểu của công cụ trả hết nợ thẻ, nên bạn thấy cả hai đường dư nợ và hai ngày hết nợ cạnh nhau.",

  trapNotice:
    "Đây là con số đáng nhớ nhất của trang này. Dư nợ 50 triệu trên thẻ 30%/năm, trả tối thiểu 5% với sàn 500.000 ₫: mất 90 tháng — bảy năm rưỡi, tức tới ngày 15/3/2034 nếu bắt đầu ngày 15/9/2026 — và tổng lãi 43.091.470 ₫, gần bằng số đã nợ. Mức tối thiểu tháng đầu là 2.563.261 ₫. Nếu bạn trả ĐÚNG 2.563.261 ₫ đó mỗi tháng nhưng giữ nguyên không giảm: hết nợ sau 28 tháng và tổng lãi 19.799.257 ₫. Cùng một số tiền ở tháng đầu, chênh nhau 62 tháng và hơn 23 triệu tiền lãi. Khác biệt duy nhất là bạn không hạ mức trả xuống khi dư nợ giảm. Cả tỷ lệ tối thiểu và mức sàn ở đây là ví dụ minh họa; hãy nhập theo biểu phí của thẻ bạn dùng.",

  formula: {
    title: "Vì sao trả tối thiểu lại lâu như vậy",
    body: [
      "Mức tối thiểu = phần trăm × dư nợ CUỐI KỲ, tức dư nợ đã cộng lãi của tháng đó, và không thấp hơn mức sàn. Với 50 triệu ở 30%/năm, dư nợ cuối kỳ đầu tiên là 51.265.229,61 ₫ nên mức tối thiểu 5% là 2.563.261 ₫, không phải 5% × 50 triệu. Đây là dạng công thức nhiều sao kê dùng, nhưng cả tỷ lệ và mức sàn đều là ô nhập vì chúng do biểu phí của từng thẻ quy định.",
      "Vì mức tối thiểu là một tỷ lệ của dư nợ, nó co lại cùng dư nợ. Phần trả vào gốc mỗi tháng do đó cũng co lại, và tốc độ giảm nợ chậm dần theo thời gian — đây là lý do toán học của việc trả tối thiểu mất nhiều năm, và nó thấy rõ nhất trên biểu đồ: đường dư nợ gần như nằm ngang trong những năm đầu.",
      "Chính MỨC SÀN mới dứt điểm được món nợ. Khi dư nợ đã nhỏ, 5% của nó thấp hơn mức sàn, nên khoản trả dừng co lại và phần trả vào gốc bắt đầu tăng trở lại. Nếu thẻ không có mức sàn và tỷ lệ tối thiểu thấp hơn lãi suất tháng, món nợ không bao giờ hết — công cụ trả về trạng thái không có kết quả trong trường hợp đó thay vì một con số rất lớn.",
      "Đường so sánh lấy đúng mức tối thiểu của tháng đầu và mô phỏng lại như một khoản trả cố định. Hai bên khởi đầu bằng cùng một số tiền và cùng một dư nợ, nên chênh lệch kết quả hoàn toàn đến từ việc một bên hạ mức trả theo dư nợ và bên kia thì không.",
      "Một điều mức tối thiểu KHÔNG làm: nó không giải phóng khoản tiền của tháng đầu cho những tháng sau. Khoản trả đã tự giảm rồi, nên không có gì được giải phóng. Số tiền mỗi tháng được giải phóng sau khi hết nợ là số tiền bạn CHỦ Ý dành riêng cho nợ thẻ — ô ngân sách của hộ — và đó là lý do nó là một ô nhập chứ không phải một con số công cụ tự suy ra.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Trả mức tối thiểu có ảnh hưởng điểm tín dụng không?",
        a: "Trả đủ mức tối thiểu và đúng hạn thì không bị ghi nhận là chậm trả, nên nó vẫn tốt hơn nhiều so với trả trễ. Nhưng dư nợ cao duy trì lâu làm tỷ lệ sử dụng hạn mức luôn ở mức cao, và thông tin dư nợ thẻ của bạn nằm trong hồ sơ tín dụng tại CIC mà ngân hàng xem khi xét khoản vay khác. Trả tối thiểu là cách tránh vi phạm hợp đồng, không phải cách quản lý nợ. Công cụ này không đánh giá hồ sơ tín dụng của bạn.",
      },
      {
        q: "Nên trả bao nhiêu là hợp lý?",
        a: "Nhiều nhất mức bạn chịu được, và tốt nhất là trả hết toàn bộ dư nợ đúng hạn mỗi kỳ để không phát sinh lãi. Nếu chưa làm được, hãy đặt một mức cố định và giữ nguyên: chọn chế độ “Trả một mức cố định mỗi tháng” ở trên và thử vài mức để xem ngày hết nợ đổi thế nào. Chế độ “Muốn hết nợ trong một số tháng nhất định” giải ngược ra mức trả cần thiết cho mốc bạn chọn.",
      },
      {
        q: "Ngày hết nợ trên trang được tính thế nào?",
        a: "Công cụ lấy đúng số tháng của lịch trả rồi cộng vào ngày bắt đầu bạn nhập, với quy ước khoản trả đầu tiên rơi vào một tháng sau ngày bắt đầu. Ngày hết nợ neo theo ngày bắt đầu nên không bị lệch dần qua các tháng ngắn; nếu ngày đó không tồn tại trong tháng đích thì nó lùi về ngày cuối tháng. Đây là ngày theo mô hình, không phải ngày tất toán do ngân hàng xác nhận.",
      },
      {
        q: "Vì sao trang này và trang trả hết nợ thẻ cho cùng một kết quả?",
        a: "Vì đó là cùng một công cụ. Hai đường dẫn được giữ nguyên để bạn tìm theo câu hỏi mình đang có — “bao lâu thì hết nợ” hoặc “chỉ trả tối thiểu thì sao” — nhưng cả hai mở cùng một phép tính, chỉ khác chế độ mở sẵn. Nhờ vậy bạn không phải nhập lại dư nợ khi muốn đổi câu hỏi.",
      },
      {
        q: "Kết quả có tính giao dịch mới phát sinh trên thẻ không?",
        a: "Không. Mô hình giả định bạn không dùng thêm hạn mức trong suốt thời gian trả nợ. Nếu bạn vẫn quẹt thẻ thì dư nợ đầu mỗi tháng cao hơn mô hình và thời gian hết nợ dài hơn — đó là cách phổ biến nhất khiến kế hoạch trả nợ thẻ không về đích. Phí thường niên, phí trễ hạn và phí chuyển đổi trả góp cũng không nằm trong mô hình.",
      },
    ],
  },
} as const;
