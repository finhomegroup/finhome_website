// Copy for /cong-cu/wacc/ — the WACC calculator.
//
// Original FinHome copy. The arithmetic is a weighted average with one twist.
//
// The twist IS the page: interest is deductible, dividends are not, so only
// debt gets the (1 − tax) shield. Applying it to all three components, or to
// none, is the standard error and moves the answer by percentage points. The
// tool therefore shows each component's contribution separately, and reports
// the un-shielded WACC beside the real one so the size of the shield is
// visible rather than implied.
//
// Second editorial point: weights are on MARKET values. For a listed company
// equity is market capitalisation, not the equity line of the balance sheet.
// The module cannot enforce that — a number is a number — so the copy does.
//
// Figures quoted are for the defaults (700 tỷ vốn chủ ở 14%, 300 tỷ nợ ở 9%,
// thuế 20%): tỷ trọng 70/30, chi phí nợ sau thuế 7,2%, WACC 11,96%, WACC nếu
// không có khấu trừ 12,5%, tấm chắn thuế 0,54 điểm phần trăm.

export const WACC = {
  slug: "/cong-cu/wacc",

  pageTitle: "WACC: chi phí vốn bình quân của doanh nghiệp",
  metaTitle: "Tính WACC — Chi phí vốn bình quân gia quyền",
  metaDescription:
    "Tính WACC từ giá trị và chi phí của vốn chủ sở hữu, nợ và cổ phiếu ưu đãi, với tấm chắn thuế áp đúng cho phần nợ. Công cụ miễn phí của FinHome.",

  lede:
    "WACC là mức sinh lời tối thiểu một dự án phải đạt để không làm giảm giá trị doanh nghiệp. Nó là bình quân gia quyền của chi phí từng nguồn vốn — với một điểm khác biệt quan trọng: chỉ lãi vay được trừ thuế.",

  form: {
    equityGroup: "Vốn chủ sở hữu",
    equityValueLabel: "Giá trị vốn chủ sở hữu",
    equityValueUnit: "₫",
    equityValueHelp:
      "Giá trị THỊ TRƯỜNG, tức vốn hóa với doanh nghiệp niêm yết — không phải dòng vốn chủ trên bảng cân đối kế toán.",
    equityValueInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultEquityValue: "700.000.000.000",

    costOfEquityLabel: "Chi phí vốn chủ sở hữu",
    costOfEquityUnit: "%/năm",
    costOfEquityHelp:
      "Mức sinh lời cổ đông đòi hỏi. Thường lấy từ mô hình CAPM — FinHome có công cụ riêng cho việc đó.",
    costOfEquityInvalid: "Vui lòng nhập một số.",
    defaultCostOfEquity: "14",

    debtGroup: "Nợ",
    debtValueLabel: "Giá trị nợ",
    debtValueUnit: "₫",
    debtValueHelp:
      "Tổng nợ có lãi: vay ngắn hạn, vay dài hạn, trái phiếu. Không tính nợ phải trả người bán.",
    debtValueInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultDebtValue: "300.000.000.000",

    costOfDebtLabel: "Chi phí nợ trước thuế",
    costOfDebtUnit: "%/năm",
    costOfDebtHelp:
      "Lãi suất thực trả trên nợ. Một cách ước lượng: chi phí lãi vay trong năm chia dư nợ bình quân.",
    costOfDebtInvalid: "Vui lòng nhập một số.",
    defaultCostOfDebt: "9",

    taxLabel: "Thuế thu nhập doanh nghiệp",
    taxUnit: "%",
    taxHelp:
      "Mức phổ thông tại Việt Nam là 20%. Một số ngành và địa bàn có thuế suất ưu đãi.",
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    defaultTax: "20",

    preferredGroup: "Cổ phiếu ưu đãi",
    preferredValueLabel: "Giá trị cổ phiếu ưu đãi",
    preferredValueUnit: "₫",
    preferredValueHelp:
      "Hiếm gặp ở Việt Nam. Để 0 nếu doanh nghiệp không có.",
    preferredValueInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPreferredValue: "0",

    costOfPreferredLabel: "Chi phí cổ phiếu ưu đãi",
    costOfPreferredUnit: "%/năm",
    costOfPreferredHelp:
      "Cổ tức ưu đãi chia giá trị. Không được trừ thuế, giống vốn chủ.",
    costOfPreferredInvalid: "Vui lòng nhập một số.",
    defaultCostOfPreferred: "0",

    resultTitle: "Kết quả",
    waccLabel: "WACC",
    afterTaxDebtLabel: "Chi phí nợ sau thuế",
    shieldLabel: "Tấm chắn thuế tiết kiệm được",
    pointsUnit: "điểm %",

    detailTitle: "Chi tiết",
    totalCapitalLabel: "Tổng vốn",
    equityWeightLabel: "Tỷ trọng vốn chủ",
    debtWeightLabel: "Tỷ trọng nợ",
    preferredWeightLabel: "Tỷ trọng ưu đãi",
    equityContributionLabel: "Vốn chủ góp vào WACC",
    debtContributionLabel: "Nợ góp vào WACC",
    preferredContributionLabel: "Ưu đãi góp vào WACC",
    beforeShieldLabel: "WACC nếu lãi vay không được trừ thuế",
    debtToEquityLabel: "Nợ trên vốn chủ",

    noCapitalNotice:
      "Tổng vốn bằng 0 nên không có cơ cấu vốn nào để tính bình quân. Hãy nhập giá trị vốn chủ, nợ, hoặc cả hai.",
  },

  shieldNotice:
    "Điểm dễ sai nhất: tấm chắn thuế CHỈ áp cho nợ. Lãi vay là chi phí được trừ khi tính thuế thu nhập doanh nghiệp, nên nợ 9%/năm thực chất chỉ tốn 7,2% sau thuế 20%. Cổ tức thì không được trừ, nên vốn chủ và cổ phiếu ưu đãi giữ nguyên chi phí. Với cơ cấu mặc định, áp đúng cho ra WACC 11,96%; nếu bỏ tấm chắn đi thì thành 12,5%, còn nếu áp cho cả ba nguồn thì con số còn thấp hơn nữa — cả hai đều sai, và sai tới nửa điểm phần trăm trên một chỉ tiêu dùng để chiết khấu dòng tiền nhiều năm.",

  formula: {
    title: "Cách tính",
    body: [
      "WACC = tỷ trọng vốn chủ × chi phí vốn chủ + tỷ trọng ưu đãi × chi phí ưu đãi + tỷ trọng nợ × chi phí nợ × (1 − thuế suất). Tỷ trọng tính trên tổng giá trị thị trường của cả ba nguồn.",
      "Với mặc định: tổng vốn 1.000 tỷ, tỷ trọng 70% vốn chủ và 30% nợ. Chi phí nợ sau thuế là 9% × (1 − 0,20) = 7,2%. WACC = 0,7 × 14% + 0,3 × 7,2% = 9,8% + 2,16% = 11,96%.",
      "Công cụ hiển thị phần góp của từng nguồn theo điểm phần trăm, vì đó là cách nhanh nhất để thấy nguồn nào đang chi phối con số. Ở ví dụ trên, vốn chủ góp 9,8 điểm và nợ chỉ góp 2,16 điểm dù chiếm 30% cơ cấu.",
      "Dòng “WACC nếu lãi vay không được trừ thuế” cho biết tấm chắn thuế đáng bao nhiêu: 12,5% so với 11,96%, tức 0,54 điểm phần trăm. Tấm chắn lớn dần theo tỷ trọng nợ, nên doanh nghiệp vay nhiều được lợi nhiều hơn — cho đến khi rủi ro tài chính đẩy cả chi phí nợ và chi phí vốn chủ lên.",
      "Hai trường hợp biên đáng kiểm tra: không có nợ thì WACC bằng đúng chi phí vốn chủ 14%; không có vốn chủ thì WACC bằng đúng chi phí nợ sau thuế 7,2%.",
      "Giá trị dùng để tính tỷ trọng phải là giá trị THỊ TRƯỜNG. Với doanh nghiệp niêm yết, vốn chủ là vốn hóa thị trường; dùng số liệu kế toán sẽ cho tỷ trọng sai, thường là quá thấp cho vốn chủ, và vì vốn chủ là nguồn đắt nhất thì WACC bị tính thấp hơn thực tế.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "WACC dùng để làm gì?",
        a: "Làm lãi suất chiết khấu khi tính NPV của một dự án, và làm ngưỡng tối thiểu để quyết định có làm dự án hay không: dự án sinh lời dưới WACC sẽ làm giảm giá trị doanh nghiệp dù nó vẫn “có lãi” trên báo cáo. Công cụ IRR và NPV của FinHome nhận trực tiếp con số này ở ô lãi suất chiết khấu.",
      },
      {
        q: "Vay nhiều để hạ WACC có phải là ý hay?",
        a: "Chỉ tới một mức. Công thức cho thấy thay vốn chủ đắt bằng nợ rẻ luôn hạ WACC, nhưng nó giả định chi phí nợ và chi phí vốn chủ không đổi — điều không đúng trong thực tế. Khi tỷ lệ nợ tăng, ngân hàng đòi lãi cao hơn và cổ đông đòi sinh lời cao hơn vì rủi ro tài chính lớn hơn, nên WACC chạm đáy rồi đi lên. Công cụ này không mô hình hóa hiệu ứng đó, nên đừng đọc kết quả như một khuyến nghị vay thêm.",
      },
      {
        q: "Ước lượng chi phí nợ thế nào cho đúng?",
        a: "Cách nhanh: lấy chi phí lãi vay trong báo cáo kết quả kinh doanh chia cho dư nợ có lãi bình quân trong năm. Cách tốt hơn nếu có: lấy lãi suất mà doanh nghiệp đang thực sự vay được hôm nay, vì WACC là chi phí vốn cho các quyết định TƯƠNG LAI, không phải chi phí của khoản nợ cũ. Với doanh nghiệp có trái phiếu đang giao dịch, lợi suất đáo hạn của trái phiếu đó là con số tốt nhất.",
      },
      {
        q: "Nợ nào được tính vào?",
        a: "Nợ có lãi: vay ngắn hạn, vay dài hạn, trái phiếu phát hành, nợ thuê tài chính. Không tính nợ phải trả người bán và các khoản phải trả không lãi — chúng không có chi phí vốn theo nghĩa này, và gộp vào sẽ làm tỷ trọng nợ phồng lên với một chi phí bằng 0, kéo WACC xuống một cách giả tạo.",
      },
      {
        q: "Doanh nghiệp có thuế suất ưu đãi thì nhập gì?",
        a: "Nhập thuế suất thực tế mà doanh nghiệp đang chịu, không phải 20%. Một số dự án ở địa bàn ưu đãi hoặc trong lĩnh vực khuyến khích có thuế suất thấp hơn, hoặc được miễn giảm có thời hạn. Thuế suất càng thấp thì tấm chắn thuế càng nhỏ và WACC càng cao — hãy thử nhập 0% để thấy toàn bộ tác dụng của tấm chắn biến mất.",
      },
    ],
  },
} as const;
