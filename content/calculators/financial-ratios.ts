// Copy for /cong-cu/cac-chi-so-tai-chinh/ — the ratio set.
//
// Original FinHome copy. Shares lib/calc/financials.ts and the statement
// field component with /cong-cu/phan-tich-bao-cao-tai-chinh/.
//
// Two things the copy insists on:
//
// 1. A ratio with a zero denominator is NOT APPLICABLE, not infinite. A
//    company with no debt has no interest-coverage ratio, and printing ∞
//    would claim infinite safety. The module returns null and the page shows
//    a dash.
// 2. Turnover and return ratios divide by the CLOSING balance, not an average
//    of opening and closing. Averages need two balance sheets; with one, the
//    closing figure is the honest choice — and the page says which it used,
//    because a reader comparing against a published figure needs to know.
//
// Figures quoted are the module's own output for the prefilled statements
// (doanh thu 1.000 tỷ, giá vốn 600, chi phí hoạt động 250, lãi vay 30, thuế
// 24; tài sản 900 tỷ, nợ 400 tỷ): lợi nhuận gộp 400 tỷ, lợi nhuận thuần
// 96 tỷ, biên gộp 40%, biên thuần 9,6%, ROE 19,2%, ROA 10,67%, thanh toán
// hiện hành 2,0, thanh toán nhanh 1,2, nợ trên vốn chủ 0,7, hệ số nhân vốn
// chủ 1,8, khả năng trả lãi 5,0 lần, EPS 960 ₫, P/E 20,83, P/B 4,0.

export const FINANCIAL_RATIOS = {
  slug: "/cong-cu/cac-chi-so-tai-chinh",

  pageTitle: "Các chỉ số tài chính từ báo cáo",
  metaTitle: "Tính các chỉ số tài chính — Sinh lời, thanh khoản, đòn bẩy",
  metaDescription:
    "Nhập báo cáo kết quả kinh doanh và bảng cân đối để tính các chỉ số sinh lời, thanh khoản, đòn bẩy, hiệu quả và định giá. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập mười ba dòng từ báo cáo kết quả kinh doanh và bảng cân đối kế toán để có toàn bộ bộ chỉ số. Những chỉ số có mẫu số bằng 0 sẽ hiện dấu gạch ngang chứ không hiện một con số vô cùng — vì không áp dụng được thì đó là câu trả lời đúng.",

  statement: {
    unit: "₫",
    invalid: "Vui lòng nhập một số từ 0 trở lên.",
    incomeGroup: "Báo cáo kết quả kinh doanh",
    assetGroup: "Tài sản",
    liabilityGroup: "Nợ phải trả",
    lines: {
      revenue: {
        label: "Doanh thu thuần",
        help: "Doanh thu sau các khoản giảm trừ.",
      },
      costOfGoodsSold: {
        label: "Giá vốn hàng bán",
        help: "Chi phí trực tiếp tạo ra doanh thu.",
      },
      operatingExpenses: {
        label: "Chi phí hoạt động",
        help: "Chi phí bán hàng và chi phí quản lý doanh nghiệp. Không gồm lãi vay.",
      },
      interestExpense: {
        label: "Chi phí lãi vay",
        help: "Tách riêng, vì khả năng trả lãi được tính trên lợi nhuận hoạt động.",
      },
      taxExpense: {
        label: "Chi phí thuế thu nhập",
        help: "Thuế thu nhập doanh nghiệp của kỳ.",
      },
      cash: {
        label: "Tiền và tương đương tiền",
        help: "Tiền, tiền gửi ngắn hạn và các khoản tương đương.",
      },
      receivables: {
        label: "Phải thu khách hàng",
        help: "Các khoản phải thu ngắn hạn.",
      },
      inventory: {
        label: "Hàng tồn kho",
        help: "Bị loại khỏi chỉ số thanh toán nhanh, vì đây là tài sản ngắn hạn kém thanh khoản nhất.",
      },
      otherCurrentAssets: {
        label: "Tài sản ngắn hạn khác",
        help: "Phần còn lại của tài sản ngắn hạn.",
      },
      nonCurrentAssets: {
        label: "Tài sản dài hạn",
        help: "Tài sản cố định, đầu tư dài hạn và tài sản vô hình.",
      },
      currentLiabilities: {
        label: "Nợ ngắn hạn",
        help: "Toàn bộ nợ phải trả trong vòng một năm.",
      },
      longTermDebt: {
        label: "Nợ dài hạn có lãi",
        help: "Vay và trái phiếu dài hạn.",
      },
      otherNonCurrentLiabilities: {
        label: "Nợ dài hạn khác",
        help: "Nợ dài hạn không chịu lãi, ví dụ thuế hoãn lại.",
      },
    },
  },

  form: {
    defaults: {
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

    shareGroup: "Cổ phiếu",
    sharesLabel: "Số lượng cổ phiếu đang lưu hành",
    sharesHelp: "Để trống nếu bạn không cần các chỉ số trên mỗi cổ phiếu.",
    sharesInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultShares: "100.000.000",

    priceLabel: "Giá một cổ phiếu",
    priceUnit: "₫",
    priceHelp: "Giá thị trường hiện tại. Để trống nếu không cần P/E và P/B.",
    priceInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultPrice: "20.000",

    resultTitle: "Ba chỉ số quan trọng nhất",
    roeLabel: "Lợi nhuận trên vốn chủ (ROE)",
    netMarginLabel: "Biên lợi nhuận thuần",
    currentRatioLabel: "Chỉ số thanh toán hiện hành",

    statementTitle: "Báo cáo đã suy ra",
    grossProfitLabel: "Lợi nhuận gộp",
    operatingProfitLabel: "Lợi nhuận hoạt động",
    profitBeforeTaxLabel: "Lợi nhuận trước thuế",
    netProfitLabel: "Lợi nhuận thuần",
    currentAssetsLabel: "Tài sản ngắn hạn",
    totalAssetsLabel: "Tổng tài sản",
    totalLiabilitiesLabel: "Tổng nợ phải trả",
    equityLabel: "Vốn chủ sở hữu",
    totalDebtLabel: "Tổng nợ có lãi và nợ ngắn hạn",
    netDebtLabel: "Nợ ròng, đã trừ tiền",

    ratioTable: {
      caption: "Toàn bộ bộ chỉ số",
      groupColumn: "Nhóm",
      nameColumn: "Chỉ số",
      valueColumn: "Giá trị",
      intro:
        "Dấu gạch ngang trong bảng nghĩa là KHÔNG ÁP DỤNG ĐƯỢC, không phải bằng 0. Chỉ số khả năng trả lãi của một doanh nghiệp không có chi phí lãi vay là một ví dụ: mẫu số bằng 0 nên không có tỷ lệ nào, và in ra một con số vô cùng sẽ là tuyên bố doanh nghiệp an toàn vô hạn.",
      groups: {
        profitability: "Sinh lời",
        liquidity: "Thanh khoản",
        leverage: "Đòn bẩy",
        efficiency: "Hiệu quả",
        valuation: "Định giá",
      },
      names: {
        grossMargin: "Biên lợi nhuận gộp",
        operatingMargin: "Biên lợi nhuận hoạt động",
        netMargin: "Biên lợi nhuận thuần",
        returnOnAssets: "Lợi nhuận trên tổng tài sản (ROA)",
        returnOnEquity: "Lợi nhuận trên vốn chủ (ROE)",
        currentRatio: "Thanh toán hiện hành",
        quickRatio: "Thanh toán nhanh",
        cashRatio: "Thanh toán bằng tiền",
        debtToEquity: "Nợ trên vốn chủ",
        debtToAssets: "Nợ trên tổng tài sản",
        equityMultiplier: "Hệ số nhân vốn chủ",
        interestCoverage: "Khả năng trả lãi",
        assetTurnover: "Vòng quay tổng tài sản",
        inventoryTurnover: "Vòng quay hàng tồn kho",
        daysSalesOutstanding: "Số ngày thu tiền bình quân",
        daysInventory: "Số ngày tồn kho bình quân",
        earningsPerShare: "Lợi nhuận trên mỗi cổ phiếu (EPS)",
        bookValuePerShare: "Giá trị sổ sách mỗi cổ phiếu",
        priceToEarnings: "P/E",
        priceToBook: "P/B",
      },
      units: {
        times: "lần",
        days: "ngày",
      },
    },

    negativeEquityNotice:
      "Vốn chủ sở hữu đang ÂM — tổng nợ phải trả lớn hơn tổng tài sản. Khi đó mọi chỉ số có vốn chủ ở mẫu số đều mất ý nghĩa: ROE âm không có nghĩa là kém hơn ROE dương thấp, và nợ trên vốn chủ âm không đọc được. Hãy bỏ qua nhóm chỉ số đó và xem thẳng các con số tuyệt đối.",
    invalidNotice:
      "Một dòng trong báo cáo không hợp lệ. Mọi dòng đều là số dương hoặc 0 — kể cả với doanh nghiệp đang lỗ, vì phần lỗ sinh ra từ phép trừ chứ không phải từ một chi phí âm.",
  },

  closingBalanceNotice:
    "Các chỉ số vòng quay và lợi nhuận trên tài sản, trên vốn chủ ở đây chia cho SỐ DƯ CUỐI KỲ, không phải số dư bình quân giữa đầu và cuối kỳ. Cách bình quân chính xác hơn nhưng cần hai bảng cân đối; với một bảng thì số dư cuối kỳ là lựa chọn trung thực. Điều này có nghĩa là con số ở đây có thể khác con số bạn đọc trên một báo cáo phân tích — nếu doanh nghiệp vừa tăng vốn hoặc vừa vay lớn trong kỳ, khoảng cách sẽ đáng kể. Muốn dùng số bình quân, hãy tự tính trung bình hai kỳ rồi nhập vào.",

  formula: {
    title: "Cách tính và cách đọc",
    body: [
      "Báo cáo được suy ra theo thứ tự: lợi nhuận gộp = doanh thu − giá vốn; lợi nhuận hoạt động = lợi nhuận gộp − chi phí hoạt động; lợi nhuận trước thuế = trừ tiếp lãi vay; lợi nhuận thuần = trừ tiếp thuế. Vốn chủ sở hữu = tổng tài sản − tổng nợ phải trả, đúng theo đẳng thức kế toán.",
      "Nhóm sinh lời chia cho doanh thu (các biên) hoặc cho số dư cuối kỳ (ROA, ROE). Với báo cáo mặc định: biên gộp 40%, biên thuần 9,6%, ROA 10,67%, ROE 19,2%. ROE cao hơn ROA là dấu hiệu của đòn bẩy, không phải của hiệu quả.",
      "Nhóm thanh khoản chia cho nợ ngắn hạn và giảm dần theo độ chặt: thanh toán hiện hành 2,0 tính cả hàng tồn kho, thanh toán nhanh 1,2 bỏ hàng tồn kho ra, thanh toán bằng tiền 0,4 chỉ tính tiền. Ba con số luôn theo thứ tự giảm dần, và khoảng cách giữa chúng cho biết bao nhiêu phần thanh khoản đang nằm ở hàng tồn kho.",
      "Nhóm đòn bẩy: nợ trên vốn chủ 0,7, hệ số nhân vốn chủ 1,8, khả năng trả lãi 5,0 lần. Khả năng trả lãi tính trên lợi nhuận HOẠT ĐỘNG, tức trước lãi vay, vì đó mới là nguồn để trả lãi.",
      "Nhóm hiệu quả có hai cách nhìn cùng một thứ: vòng quay là số lần mỗi năm, số ngày là 365 chia cho vòng quay. Vòng quay hàng tồn kho 3,0 lần tương đương 121,7 ngày tồn kho — con số theo ngày thường dễ hình dung hơn.",
      "Nhóm định giá cần thêm số lượng cổ phiếu và giá. EPS 960 ₫, giá trị sổ sách 5.000 ₫ mỗi cổ phiếu, P/E 20,83 và P/B 4,0. P/E và P/B được tính từ vốn hóa chia lợi nhuận và vốn chủ, nên chúng khớp với giá chia EPS và giá chia giá trị sổ sách.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao có chỉ số hiện dấu gạch ngang?",
        a: "Vì mẫu số của nó bằng 0, nên chỉ số đó không áp dụng được. Ví dụ rõ nhất là khả năng trả lãi của một doanh nghiệp không có chi phí lãi vay: không có tỷ lệ nào cả. Công cụ cố ý không in ra một con số vô cùng hay một con số rất lớn, vì cả hai đều là tuyên bố sai — và một trang tài chính in ra “vô cùng an toàn” thì tệ hơn là không in gì.",
      },
      {
        q: "Chỉ số của tôi khác chỉ số trong báo cáo phân tích, vì sao?",
        a: "Nguyên nhân phổ biến nhất là số dư bình quân so với số dư cuối kỳ. Công cụ này dùng số dư cuối kỳ vì bạn chỉ nhập một bảng cân đối; nhiều báo cáo phân tích dùng bình quân đầu và cuối kỳ. Với doanh nghiệp vừa tăng vốn hoặc vay lớn, hai cách cho ra con số khác nhau đáng kể. Nguyên nhân thứ hai là cách phân loại: “nợ” có thể chỉ tính nợ có lãi, hoặc tính cả nợ ngắn hạn không lãi.",
      },
      {
        q: "Vì sao ROE cao hơn ROA?",
        a: "Vì doanh nghiệp dùng nợ. Cùng một lợi nhuận nhưng chia cho vốn chủ nhỏ hơn tổng tài sản, nên tỷ lệ cao hơn — hệ số nhân vốn chủ 1,8 nói chính xác gấp bao nhiêu. Điều đó không có nghĩa là doanh nghiệp hiệu quả hơn; nó có nghĩa là cổ đông đang gánh rủi ro tài chính để có tỷ lệ đó. Công cụ phân tích báo cáo tài chính của FinHome tách ROE thành ba phần để thấy rõ phần nào đến từ đòn bẩy.",
      },
      {
        q: "Chỉ số thanh toán hiện hành bao nhiêu là tốt?",
        a: "Không có ngưỡng chung, và con số 2,0 thường được nhắc chỉ là quy ước. Doanh nghiệp bán lẻ vòng quay nhanh sống tốt với 1,0; doanh nghiệp có hàng tồn kho lâu cần cao hơn. Điều đáng xem hơn là khoảng cách giữa thanh toán hiện hành và thanh toán nhanh: khoảng cách rộng nghĩa là phần lớn tài sản ngắn hạn đang nằm ở hàng tồn kho, và hàng tồn kho không bán được đúng giá khi doanh nghiệp cần tiền.",
      },
      {
        q: "Nhập số liệu của doanh nghiệp đang lỗ được không?",
        a: "Được. Mọi dòng nhập vào là số dương hoặc 0 vì chúng là độ lớn — chi phí là chi phí, không phải chi phí âm. Phần lỗ sinh ra từ phép trừ: chi phí hoạt động lớn hơn lợi nhuận gộp thì lợi nhuận hoạt động ra số âm, và các biên lợi nhuận cũng âm theo. Công cụ hiển thị đúng như vậy.",
      },
    ],
  },
} as const;
