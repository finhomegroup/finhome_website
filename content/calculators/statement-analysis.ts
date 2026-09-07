// Copy for /cong-cu/phan-tich-bao-cao-tai-chinh/ — two-period analysis.
//
// Original FinHome copy. Shares lib/calc/financials.ts and the statement
// field component with /cong-cu/cac-chi-so-tai-chinh/.
//
// What justifies a second page rather than more rows on the first: a single
// year of ratios cannot say whether anything CHANGED, or why. This page does
// horizontal analysis (year-on-year), vertical analysis (common-size against
// each period's own revenue), and the DuPont decomposition that attributes a
// move in return on equity to margin, turnover or leverage.
//
// The DuPont product is cross-checked against ROE computed the direct way in
// the module's tests. That is what makes the attribution trustworthy rather
// than decorative.
//
// Figures quoted are the module's output for the prefilled two periods,
// verified by running computeAnalysis rather than worked out by hand:
// This year: doanh thu 1.000 tỷ, lợi nhuận thuần 96 tỷ, ROE 19,20%.
// Last year: doanh thu 900 tỷ, lợi nhuận thuần 64 tỷ, ROE 13,06%.
// So revenue +11,11% while net profit +50,00%, and ROE up 6,14 điểm.
// Biên gộp 37,78% → 40,00%; biên thuần 7,11% → 9,60%;
// vòng quay tài sản 1,06 → 1,11; hệ số nhân vốn chủ 1,73 → 1,80.
// Counterfactuals, same source: holding turnover and leverage at last
// year's values and moving ONLY the margin gives 17,63%; moving only
// leverage gives 13,55%. That is what licenses the claim that margin does
// most of the work here and leverage does little.

export const STATEMENT_ANALYSIS = {
  slug: "/cong-cu/phan-tich-bao-cao-tai-chinh",

  pageTitle: "Phân tích báo cáo tài chính hai kỳ",
  metaTitle: "Phân tích báo cáo tài chính — Tăng trưởng, tỷ trọng và DuPont",
  metaDescription:
    "So hai kỳ báo cáo: tăng trưởng từng dòng, tỷ trọng trên doanh thu, và tách ROE thành biên lợi nhuận, vòng quay tài sản và đòn bẩy. Công cụ miễn phí của FinHome.",

  lede:
    "Một kỳ báo cáo cho bạn các chỉ số. Hai kỳ cho bạn biết điều gì đã thay đổi — và phép tách DuPont cho biết TẠI SAO lợi nhuận trên vốn chủ thay đổi: do biên lợi nhuận, do vòng quay tài sản, hay chỉ do vay thêm.",

  statement: {
    unit: "₫",
    invalid: "Vui lòng nhập một số từ 0 trở lên.",
    incomeGroup: "Kết quả kinh doanh",
    assetGroup: "Tài sản",
    liabilityGroup: "Nợ phải trả",
    lines: {
      revenue: { label: "Doanh thu thuần", help: "Doanh thu sau giảm trừ." },
      costOfGoodsSold: {
        label: "Giá vốn hàng bán",
        help: "Chi phí trực tiếp tạo ra doanh thu.",
      },
      operatingExpenses: {
        label: "Chi phí hoạt động",
        help: "Chi phí bán hàng và quản lý. Không gồm lãi vay.",
      },
      interestExpense: {
        label: "Chi phí lãi vay",
        help: "Tách riêng khỏi chi phí hoạt động.",
      },
      taxExpense: {
        label: "Chi phí thuế thu nhập",
        help: "Thuế thu nhập doanh nghiệp của kỳ.",
      },
      cash: {
        label: "Tiền và tương đương tiền",
        help: "Số dư cuối kỳ.",
      },
      receivables: { label: "Phải thu khách hàng", help: "Số dư cuối kỳ." },
      inventory: { label: "Hàng tồn kho", help: "Số dư cuối kỳ." },
      otherCurrentAssets: {
        label: "Tài sản ngắn hạn khác",
        help: "Phần còn lại của tài sản ngắn hạn.",
      },
      nonCurrentAssets: {
        label: "Tài sản dài hạn",
        help: "Tài sản cố định, đầu tư dài hạn, tài sản vô hình.",
      },
      currentLiabilities: {
        label: "Nợ ngắn hạn",
        help: "Nợ phải trả trong vòng một năm.",
      },
      longTermDebt: {
        label: "Nợ dài hạn có lãi",
        help: "Vay và trái phiếu dài hạn.",
      },
      otherNonCurrentLiabilities: {
        label: "Nợ dài hạn khác",
        help: "Nợ dài hạn không chịu lãi.",
      },
    },
  },

  form: {
    currentSuffix: " — kỳ này",
    priorSuffix: " — kỳ trước",

    currentDefaults: {
      revenue: "1.000.000.000.000",
      costOfGoodsSold: "600.000.000.000",
      operatingExpenses: "250.000.000.000",
      interestExpense: "30.000.000.000",
      taxExpense: "24.000.000.000",
      cash: "100.000.000.000",
      receivables: "150.000.000.000",
      inventory: "200.000.000.000",
      otherCurrentAssets: "50.000.000.000",
      nonCurrentAssets: "400.000.000.000",
      currentLiabilities: "250.000.000.000",
      longTermDebt: "100.000.000.000",
      otherNonCurrentLiabilities: "50.000.000.000",
    },
    priorDefaults: {
      revenue: "900.000.000.000",
      costOfGoodsSold: "560.000.000.000",
      operatingExpenses: "240.000.000.000",
      interestExpense: "20.000.000.000",
      taxExpense: "16.000.000.000",
      cash: "100.000.000.000",
      receivables: "150.000.000.000",
      inventory: "200.000.000.000",
      otherCurrentAssets: "50.000.000.000",
      nonCurrentAssets: "350.000.000.000",
      currentLiabilities: "250.000.000.000",
      longTermDebt: "60.000.000.000",
      otherNonCurrentLiabilities: "50.000.000.000",
    },

    resultTitle: "ROE thay đổi thế nào",
    roeChangeLabel: "ROE thay đổi",
    roeCurrentLabel: "ROE kỳ này",
    roePriorLabel: "ROE kỳ trước",
    pointsUnit: "điểm %",

    duPontTitle: "Tách ROE theo DuPont",
    duPontIntro:
      "ROE bằng biên lợi nhuận thuần nhân vòng quay tài sản nhân hệ số nhân vốn chủ. Ba con số này nói ba câu khác nhau: bán có lãi hơn, dùng tài sản hiệu quả hơn, hay chỉ đơn giản là vay thêm. Chỉ hai câu đầu là cải thiện thật.",
    duPontTable: {
      caption: "Ba thành phần của ROE",
      driverColumn: "Thành phần",
      currentColumn: "Kỳ này",
      priorColumn: "Kỳ trước",
      changeColumn: "Thay đổi",
      drivers: {
        netMargin: "Biên lợi nhuận thuần",
        assetTurnover: "Vòng quay tổng tài sản",
        equityMultiplier: "Hệ số nhân vốn chủ (đòn bẩy)",
        product: "Nhân lại thành ROE",
      },
    },

    linesTitle: "Từng dòng qua hai kỳ",
    linesTable: {
      caption: "Tăng trưởng và tỷ trọng từng dòng",
      lineColumn: "Chỉ tiêu",
      currentColumn: "Kỳ này",
      priorColumn: "Kỳ trước",
      changeColumn: "Thay đổi",
      changePercentColumn: "Tăng trưởng",
      currentShareColumn: "% doanh thu kỳ này",
      priorShareColumn: "% doanh thu kỳ trước",
      intro:
        "Hai cột cuối là phân tích theo tỷ trọng: mỗi dòng tính trên doanh thu CỦA CHÍNH KỲ ĐÓ. Đây là cách thấy được biên lợi nhuận thay đổi mà cột tăng trưởng không cho thấy — doanh thu và chi phí có thể cùng tăng, nhưng nếu chi phí tăng chậm hơn thì tỷ trọng của nó giảm và biên lợi nhuận nở ra.",
      names: {
        revenue: "Doanh thu thuần",
        costOfGoodsSold: "Giá vốn hàng bán",
        grossProfit: "Lợi nhuận gộp",
        operatingExpenses: "Chi phí hoạt động",
        operatingProfit: "Lợi nhuận hoạt động",
        interestExpense: "Chi phí lãi vay",
        profitBeforeTax: "Lợi nhuận trước thuế",
        taxExpense: "Chi phí thuế",
        netProfit: "Lợi nhuận thuần",
        totalAssets: "Tổng tài sản",
        equity: "Vốn chủ sở hữu",
        totalDebt: "Tổng nợ",
      },
    },

    negativeEquityNotice:
      "Một trong hai kỳ có vốn chủ sở hữu âm, nên ROE và phép tách DuPont của kỳ đó không đọc được. Hãy xem các dòng tuyệt đối và phần tỷ trọng thay vì các chỉ số có vốn chủ ở mẫu số.",
    invalidNotice:
      "Một dòng trong một trong hai kỳ không hợp lệ. Mọi dòng đều là số dương hoặc 0 — phần lỗ sinh ra từ phép trừ, không phải từ một chi phí âm.",
  },

  duPontNotice:
    "Với hai kỳ mặc định, ROE tăng từ 13,06% lên 19,20% — thêm 6,14 điểm phần trăm. Cách kiểm tra xem mức tăng đến từ đâu là giữ hai thành phần ở giá trị kỳ trước và cho một thành phần thay đổi: nếu chỉ biên lợi nhuận thuần đổi, ROE đã là 17,63%; nếu chỉ đòn bẩy đổi, ROE chỉ là 13,55%. Nghĩa là phần lớn mức tăng đến từ việc bán hàng có lãi hơn, còn việc vay thêm gần như không đóng góp. Nếu kết quả ngược lại — ROE tăng nhưng gần hết mức tăng nằm ở hệ số nhân vốn chủ — thì đó không phải tin tốt, chỉ là cổ đông gánh thêm rủi ro tài chính để có một con số đẹp hơn. Đó là lý do trang này tồn tại thay vì chỉ hiển thị ROE của hai kỳ cạnh nhau.",

  formula: {
    title: "Ba cách đọc",
    body: [
      "Phân tích theo chiều ngang so từng dòng giữa hai kỳ, cả bằng số tiền và bằng phần trăm. Với mặc định, doanh thu tăng 11,11% trong khi lợi nhuận thuần tăng 50,00% — chênh lệch đó là dấu hiệu biên lợi nhuận đã nở ra, và nó không hiện ra nếu chỉ nhìn doanh thu.",
      "Phân tích theo tỷ trọng tính mỗi dòng trên doanh thu CỦA CHÍNH KỲ ĐÓ, không phải trên doanh thu kỳ này cho cả hai. Đó là điểm quan trọng: chỉ khi mỗi kỳ được chuẩn hóa theo doanh thu của nó thì hai tỷ trọng mới so được với nhau. Với mặc định, giá vốn giảm tỷ trọng từ 62,22% xuống 60,00% doanh thu, nên biên gộp đi từ 37,78% lên 40,00%.",
      "Phép tách DuPont viết ROE thành ba thừa số: biên lợi nhuận thuần × vòng quay tổng tài sản × hệ số nhân vốn chủ. Ba con số trả lời ba câu khác nhau — bán có lãi hơn, dùng tài sản hiệu quả hơn, hay vay thêm. Với mặc định, cả ba đều tăng: 7,11% lên 9,60%, 1,06 lên 1,11 và 1,73 lên 1,80.",
      "Công cụ tính ROE theo hai đường độc lập: trực tiếp bằng lợi nhuận thuần chia vốn chủ, và bằng cách nhân ba thừa số DuPont. Bộ kiểm thử của module assert hai đường phải khớp nhau. Đó là điều làm cho phép tách đáng tin cậy như một cách quy trách nhiệm, thay vì chỉ là một cách trình bày.",
      "Cột tăng trưởng để trống khi con số kỳ trước bằng 0 — không có phần trăm nào diễn tả được mức tăng từ 0. Số tiền thay đổi vẫn được hiển thị bình thường.",
      "Cả hai kỳ dùng số dư CUỐI KỲ cho các chỉ số bảng cân đối, giống công cụ chỉ số tài chính. Với hai kỳ liền nhau, bạn có thể tự lấy bình quân nếu muốn khớp với cách một báo cáo phân tích trình bày.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao phải tách ROE ra ba phần?",
        a: "Vì ba nguyên nhân rất khác nhau đều làm ROE tăng, và chỉ hai trong ba là tin tốt. Biên lợi nhuận tăng nghĩa là bán hàng có lãi hơn. Vòng quay tài sản tăng nghĩa là cùng số tài sản tạo ra nhiều doanh thu hơn. Hệ số nhân vốn chủ tăng chỉ nghĩa là vay thêm — ROE cao hơn nhưng rủi ro cũng cao hơn, và trong một năm khó khăn chính đòn bẩy đó sẽ khuếch đại khoản lỗ.",
      },
      {
        q: "Tăng trưởng doanh thu và tăng trưởng lợi nhuận khác nhau nhiều thì sao?",
        a: "Đó là thông tin quan trọng nhất trong bảng. Lợi nhuận tăng nhanh hơn doanh thu nghĩa là biên lợi nhuận nở ra — có thể do giá bán tốt hơn, chi phí được kiểm soát, hoặc lợi thế quy mô. Lợi nhuận tăng chậm hơn doanh thu nghĩa là biên đang co lại, và tăng trưởng doanh thu đang được mua bằng chiết khấu hoặc bằng chi phí bán hàng. Cột tỷ trọng cho biết dòng chi phí nào là nguyên nhân.",
      },
      {
        q: "Vì sao tỷ trọng của mỗi kỳ tính trên doanh thu của chính kỳ đó?",
        a: "Vì mục đích của phân tích tỷ trọng là loại bỏ ảnh hưởng của quy mô để so cấu trúc. Nếu chia cả hai kỳ cho doanh thu kỳ này, cột kỳ trước sẽ chỉ phản ánh việc doanh thu đã tăng, chứ không nói gì về cấu trúc chi phí. Chuẩn hóa từng kỳ theo doanh thu của nó là cách duy nhất khiến hai cột so sánh được.",
      },
      {
        q: "Hai kỳ có nhất thiết là hai năm không?",
        a: "Không, chỉ cần hai kỳ có cùng độ dài. Hai năm, hai quý cùng kỳ, hoặc hai kỳ sáu tháng đều dùng được. Đừng so một quý với một năm — các dòng kết quả kinh doanh sẽ lệch bốn lần trong khi các dòng bảng cân đối thì không, và mọi chỉ số vòng quay sẽ vô nghĩa.",
      },
      {
        q: "Công cụ có tính lưu chuyển tiền tệ không?",
        a: "Không. Chỉ có kết quả kinh doanh và bảng cân đối. Báo cáo lưu chuyển tiền tệ là báo cáo quan trọng nhất trong ba báo cáo với nhiều mục đích — lợi nhuận có thể được ghi nhận mà tiền chưa về — nhưng nó có cấu trúc riêng và cần một công cụ riêng. Một dấu hiệu bạn có thể đọc từ đây: phải thu khách hàng tăng nhanh hơn doanh thu nghĩa là lợi nhuận đang chuyển thành tiền chậm hơn.",
      },
    ],
  },
} as const;
