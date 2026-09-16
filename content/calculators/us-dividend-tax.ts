// Copy for /cong-cu/thue-co-tuc/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Figures quoted are computeUsDividendTax's output, verified by running it:
//   10.000 đủ điều kiện @15% + 2.000 thường @24%, MAGI 120.000, độc thân:
//     1.500 + 480 = 1.980 USD, thuế suất thực tế 16,50%
//     Nếu toàn bộ là cổ tức thường: 2.880 → phân loại tiết kiệm 900 USD
//   Ở đỉnh: 20% + 3,8% = 23,80% so với 37% + 3,8% = 40,80%
//
// The 0/15/20% income thresholds are NOT hardcoded — see the module
// docstring. They appear only as guidance prose, clearly labelled as a
// guide, because they are indexed annually and a stale table would be
// confidently wrong at exactly the incomes near a boundary.
//
// YEAR VINTAGE, resolved 2026-09-16. The row asked for "the applicable
// year". `thresholdGuide` said "theo mức năm 2025" on a page with no year
// control, which is a vintage without a base — the shape docs §8 defect 8
// names ("effective date AND base recorded"). Both halves are now recorded:
// the guide states the TAX YEAR the figures belong to and the date they were
// checked, and `sources` carries the page they were checked against.
//
// THE FIGURES WERE NOT ROLLED FORWARD TO 2026, deliberately. IRS Topic
// no. 409, fetched 2026-09-16, still publishes the 2025 breakpoints
// (48.350 / 96.700 / 64.750; 15% to 533.400 single), and the 2026 newsroom
// release for Rev. Proc. 2025-32 gives the standard deduction but NOT the
// capital-gains breakpoints. So a 2026 table here would have been typed
// from memory against no verifiable page — the exact defect class this
// module was built to avoid. The approximations in the old copy were also
// tightened to the published figures (48.000 -> 48.350, 97.000 -> 96.700,
// 533.000 -> 533.400, 600.000 -> 600.050) now that they are sourced.
//
// SOURCES. All three hrefs fetched 2026-09-16 and their content read. The
// NIIT page confirms all three thresholds and the lesser-of rule verbatim.
// Note what it does NOT say: it makes no statement about the thresholds
// being unindexed, so the claim in formula.body[3] that they are fixed in
// law since 2013 rests on the statute rather than on that page, and the
// source note does not pretend otherwise.

export const US_DIVIDEND_TAX = {
  slug: "/cong-cu/thue-co-tuc",

  pageTitle: "Thuế cổ tức Hoa Kỳ",
  metaTitle: "Thuế cổ tức Hoa Kỳ — Cổ tức đủ điều kiện và cổ tức thường",
  metaDescription:
    "Tính thuế cổ tức theo quy định Hoa Kỳ: cổ tức đủ điều kiện chịu 0/15/20%, cổ tức thường chịu thuế suất thu nhập, cộng phụ thu đầu tư ròng 3,8%. Công cụ miễn phí của FinHome.",

  lede:
    "Cùng một đồng cổ tức có thể chịu 0% hoặc 37% tùy vào một tiêu chí về thời gian nắm giữ mà phần lớn người nhận cổ tức chưa từng đọc. Công cụ này tính cả hai loại và cho biết việc phân loại đó đáng bao nhiêu tiền.",

  form: {
    incomeGroup: "Cổ tức nhận được",
    qualifiedLabel: "Cổ tức đủ điều kiện",
    qualifiedUnit: "USD",
    qualifiedHelp:
      "Cổ tức đáp ứng điều kiện thời gian nắm giữ. Trên mẫu 1099-DIV, đây là ô 1b.",
    qualifiedInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    ordinaryLabel: "Cổ tức thường",
    ordinaryUnit: "USD",
    ordinaryHelp:
      "Phần không đủ điều kiện: cổ tức REIT, phần lớn thu nhập từ quỹ trái phiếu, cổ tức từ một số công ty nước ngoài. Bằng ô 1a trừ ô 1b.",
    ordinaryInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    rateGroup: "Thuế suất áp dụng",
    qualifiedRateLabel: "Thuế suất cổ tức đủ điều kiện",
    qualifiedRateHelp:
      "Luật chỉ có ba mức: 0%, 15% và 20%. Mức áp dụng phụ thuộc thu nhập chịu thuế của bạn — xem phần hướng dẫn ngưỡng bên dưới.",
    qualifiedRateOptions: {
      zero: "0%",
      fifteen: "15%",
      twenty: "20%",
    },

    ordinaryRateLabel: "Thuế suất thu nhập biên của bạn",
    ordinaryRateUnit: "%",
    ordinaryRateHelp:
      "Thuế suất áp lên đồng thu nhập kế tiếp: 10, 12, 22, 24, 32, 35 hoặc 37%.",
    ordinaryRateInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    niitGroup: "Phụ thu đầu tư ròng",
    magiLabel: "Thu nhập gộp điều chỉnh (MAGI)",
    magiUnit: "USD",
    magiHelp: "Tính cả phần cổ tức ở trên.",
    magiInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    statusLabel: "Tình trạng khai thuế",
    statusHelp: "Quyết định ngưỡng chịu phụ thu 3,8%.",
    statusOptions: {
      single: "Độc thân",
      married: "Vợ chồng khai chung",
      marriedSeparate: "Vợ chồng khai riêng",
      head: "Chủ hộ",
    },

    niitLabel: "Áp phụ thu 3,8%",
    niitHelp:
      "Tắt để thấy phụ thu này chiếm bao nhiêu trong tổng số thuế.",
    niitOptions: {
      yes: "Có",
      no: "Không",
    },

    defaults: {
      qualified: "10.000",
      ordinary: "2.000",
      qualifiedRate: "15",
      ordinaryRate: "24",
      magi: "120.000",
      status: "single",
      niit: "yes",
    },

    resultTitle: "Tổng thuế cổ tức",
    totalTaxLabel: "Tổng thuế",
    effectiveRateLabel: "Thuế suất thực tế trên cổ tức",
    afterTaxLabel: "Còn lại sau thuế",

    breakdownTitle: "Bóc tách",
    qualifiedTaxLabel: "Thuế trên cổ tức đủ điều kiện",
    ordinaryTaxLabel: "Thuế trên cổ tức thường",
    niitBaseLabel: "Cơ sở tính phụ thu 3,8%",
    niitTaxLabel: "Phụ thu đầu tư ròng",
    magiExcessLabel: "MAGI vượt ngưỡng",
    thresholdLabel: "Ngưỡng phụ thu",
    allOrdinaryLabel: "Thuế nếu toàn bộ là cổ tức thường",
    savingLabel: "Phân loại đủ điều kiện tiết kiệm được",

    thresholdGuide:
      "Hướng dẫn ngưỡng, áp cho năm thuế 2025: mức 0% áp cho người có thu nhập chịu thuế tới 48.350 USD với người độc thân và 96.700 USD với vợ chồng khai chung (64.750 USD với chủ hộ); mức 15% áp từ đó tới 533.400 USD độc thân và 600.050 USD khai chung; trên các mốc đó là mức 20%. Phần lớn người nộp thuế nằm ở mức 15%. Các con số này là mức năm thuế 2025 do IRS công bố tại Topic no. 409, đối chiếu ngày 16/09/2026, và chúng được điều chỉnh theo lạm phát mỗi năm — nên nếu bạn đang khai một năm thuế khác thì hãy tra mức của đúng năm đó trong phần nguồn bên dưới rồi chọn thuế suất tương ứng. Công cụ cố ý không tự suy ra thuế suất từ thu nhập của bạn, vì một bảng ngưỡng cũ một năm sẽ cho kết quả sai chắc nịch ở đúng những mức thu nhập nằm sát ranh giới.",

    aboveThresholdNotice:
      "MAGI đã vượt ngưỡng phụ thu, nên phần cổ tức chịu thêm 3,8%. Cơ sở tính phụ thu là số nhỏ hơn giữa tổng thu nhập đầu tư và phần MAGI vượt ngưỡng — không phải toàn bộ một trong hai.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Thuế suất cổ tức đủ điều kiện chỉ nhận 0, 15 hoặc 20 — luật không có mức nào khác.",
  },

  classificationNotice:
    "Với các số mặc định, 10.000 USD cổ tức đủ điều kiện và 2.000 USD cổ tức thường chịu tổng 1.980 USD thuế, tương đương 16,50%. Nếu toàn bộ 12.000 USD đó là cổ tức thường, số thuế sẽ là 2.880 USD — nên riêng việc phân loại đáng 900 USD. Khoảng cách rộng nhất ở nhóm thu nhập cao nhất: 20% cộng phụ thu 3,8% là 23,80%, so với 37% cộng 3,8% là 40,80%. Cùng một số tiền, gần gấp đôi số thuế, và điều duy nhất khác biệt là cổ phiếu đã được nắm giữ bao lâu.",

  formula: {
    title: "Cách tính",
    body: [
      "Cổ tức đủ điều kiện chịu một trong ba thuế suất theo luật: 0%, 15% hoặc 20%. Đây cũng chính là các mức áp cho lãi vốn dài hạn. Cổ tức thường chịu thuế suất thu nhập thông thường, tối đa 37%.",
      "Điều kiện để cổ tức được xếp loại “đủ điều kiện”: cổ phiếu phải được nắm giữ hơn 60 ngày trong khoảng 121 ngày bắt đầu từ 60 ngày trước ngày giao dịch không hưởng quyền, và bên chi trả phải là công ty Hoa Kỳ hoặc công ty nước ngoài đủ điều kiện. Bán quá sớm là mất phân loại — với cùng một đồng cổ tức.",
      "Một số loại thu nhập không bao giờ đủ điều kiện, bất kể nắm giữ bao lâu: cổ tức từ quỹ tín thác bất động sản (REIT), thu nhập lãi từ quỹ trái phiếu bị chia dưới dạng cổ tức, và cổ tức từ tài khoản thị trường tiền tệ. Mẫu 1099-DIV đã tách sẵn: ô 1a là tổng, ô 1b là phần đủ điều kiện.",
      "Phụ thu Thuế Thu nhập Đầu tư Ròng 3,8% áp thêm khi MAGI vượt ngưỡng: 200.000 USD với người độc thân và chủ hộ, 250.000 USD với vợ chồng khai chung, 125.000 USD với vợ chồng khai riêng. Các ngưỡng này ấn định trong luật từ 2013 và không điều chỉnh theo lạm phát.",
      "Cơ sở tính phụ thu là số nhỏ hơn giữa thu nhập đầu tư ròng và phần MAGI vượt ngưỡng. Lấy một trong hai mà không so là lỗi thường gặp: người vừa vượt ngưỡng mà có nhiều cổ tức sẽ bị tính quá cao nếu lấy cổ tức, còn người vượt ngưỡng rất xa mà có ít cổ tức sẽ bị tính quá cao nếu lấy phần vượt.",
      "Phụ thu 3,8% không phụ thuộc vào việc cổ tức có đủ điều kiện hay không, nên nó triệt tiêu khỏi phép so sánh “tiết kiệm được bao nhiêu” — nếu không, việc phân loại sẽ trông như làm thay đổi một loại thuế mà nó không hề ảnh hưởng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao công cụ không tự tính thuế suất từ thu nhập của tôi?",
        a: "Vì ba ngưỡng 0/15/20% được điều chỉnh theo lạm phát mỗi năm, và phần hướng dẫn ngưỡng trên trang này ghi rõ nó đang nói về năm thuế nào. Một bảng ngưỡng chậm một năm sẽ cho kết quả sai ở đúng nhóm thu nhập nằm sát ranh giới — tức là những người cần một câu trả lời đúng nhất. Chúng tôi chọn để bạn tự chọn mức, kèm hướng dẫn nói rõ đó chỉ là tham khảo, thay vì đưa ra một con số trông chính xác mà thực chất phụ thuộc vào việc bảng có được cập nhật hay không. Các ngưỡng phụ thu 3,8% thì được ấn định cứng trong luật và không đổi, nên chúng có trong công cụ.",
      },
      {
        q: "Làm sao biết cổ tức của tôi có đủ điều kiện không?",
        a: "Không cần tự xác định: mẫu 1099-DIV do công ty chứng khoán gửi đã tách sẵn. Ô 1a là tổng cổ tức thường, ô 1b là phần đủ điều kiện trong đó. Phần cổ tức thường mà công cụ hỏi bằng ô 1a trừ ô 1b. Nếu bạn bán cổ phiếu ngay sau khi nhận cổ tức, rất có thể phần đó đã bị chuyển sang loại không đủ điều kiện.",
      },
      {
        q: "Cổ tức từ REIT có được hưởng thuế suất thấp không?",
        a: "Phần lớn thì không — cổ tức REIT thường chịu thuế suất thu nhập thông thường bất kể nắm giữ bao lâu, vì bản thân REIT không nộp thuế doanh nghiệp trên phần thu nhập đã phân phối nên không có lý do để hưởng mức ưu đãi. Một phần cổ tức REIT có thể đủ điều kiện được khấu trừ theo quy định về thu nhập kinh doanh chuyển tiếp, đó là một cơ chế riêng không có trong công cụ này.",
      },
      {
        q: "Nắm giữ trong tài khoản hưu trí thì sao?",
        a: "Cổ tức phát sinh trong tài khoản 401(k) hoặc IRA không bị đánh thuế trong năm nhận, nên toàn bộ công cụ này không áp dụng. Với IRA truyền thống, tiền rút sau này chịu thuế suất thu nhập thông thường — nghĩa là phân loại “đủ điều kiện” mất tác dụng. Với Roth, tiền rút đúng điều kiện không chịu thuế. Đó là lý do người ta thường khuyên đặt tài sản sinh thu nhập chịu thuế cao vào tài khoản được ưu đãi thuế và giữ cổ phiếu trả cổ tức đủ điều kiện ở tài khoản thường.",
      },
      {
        q: "Cổ tức có bị tính thuế lương FICA không?",
        a: "Không. Cổ tức là thu nhập đầu tư, không phải tiền lương, nên không chịu Social Security hay Medicare. Nhưng nó có thể chịu phụ thu đầu tư ròng 3,8% với đúng các ngưỡng 200.000/250.000 USD như phụ thu Medicare — hai loại thuế khác nhau, cùng mức ngưỡng, và một khoản thu nhập chỉ chịu một trong hai.",
      },
    ],
  },

  sources: {
    title: "Nguồn",
    intro:
      "Ba trang dưới đây là căn cứ cho những gì công cụ ấn định sẵn: ba thuế suất 0/15/20% và các ngưỡng thu nhập của năm thuế tương ứng, các ngưỡng phụ thu đầu tư ròng 3,8% cùng quy tắc lấy số nhỏ hơn, và điều kiện thời gian nắm giữ quyết định cổ tức có “đủ điều kiện” hay không. Các ngưỡng 0/15/20% được điều chỉnh theo lạm phát mỗi năm, nên hãy đối chiếu đúng năm thuế bạn đang khai. Danh sách chỉ gồm nguồn cho các quy tắc trang này dùng, không phải toàn bộ quy định về thuế cổ tức.",
    items: [
      {
        url: "https://www.irs.gov/taxtopics/tc409",
        label: "IRS Topic no. 409 — Ba thuế suất và ngưỡng thu nhập theo năm",
        note: "Nguồn của phần hướng dẫn ngưỡng trên trang này. Bản đối chiếu ngày 16/09/2026 công bố mức của năm thuế 2025: 0% tới 48.350 USD (độc thân và vợ chồng khai riêng), 96.700 USD (khai chung) và 64.750 USD (chủ hộ); 15% tới 533.400 USD độc thân; trên đó là 20%. Cổ tức đủ điều kiện chịu đúng ba mức này. IRS công bố mức của năm sau vào mùa thu, nên hãy mở lại trang để lấy năm thuế của bạn.",
      },
      {
        url: "https://www.irs.gov/individuals/net-investment-income-tax",
        label: "IRS — Phụ thu Thuế Thu nhập Đầu tư Ròng 3,8%",
        note: "Nguồn của cả ba ngưỡng công cụ ấn định cứng — 250.000 USD khai chung, 125.000 USD khai riêng, 200.000 USD độc thân hoặc chủ hộ — và của quy tắc cơ sở tính: phụ thu áp trên “the lesser of their net investment income, or the amount by which their modified adjusted gross income exceeds the statutory threshold amount”.",
      },
      {
        url: "https://www.irs.gov/publications/p550",
        label: "IRS Publication 550 — Định nghĩa cổ tức đủ điều kiện",
        note: "Nơi đặt điều kiện thời gian nắm giữ mà cả trang này dựa vào, cùng các trường hợp không bao giờ đủ điều kiện. Đây là tài liệu Topic no. 404 dẫn tới khi cần định nghĩa đầy đủ.",
      },
    ],
  },
} as const;
