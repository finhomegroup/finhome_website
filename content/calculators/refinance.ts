// Copy for /cong-cu/tai-cap-von/ — the refinancing calculator.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Figures quoted below are the tool's own output for its defaults (1,5 tỷ dư
// nợ, 11%/năm, còn 216 tháng, chuyển sang 8,5%/năm, 30 triệu phí), read off
// the module: trả hằng tháng 15.975.745 → 13.581.862 ₫, giảm 2.393.883 ₫/tháng,
// tiết kiệm lãi 517.078.691 ₫, sau phí 487.078.691 ₫, hoàn phí sau 13 tháng.
// Kéo kỳ hạn lên 300 tháng: trả hằng tháng còn 12.078.406 ₫ (giảm 3.897.338 ₫)
// nhưng tổng lãi TĂNG 172.761.032 ₫, tức lỗ 202.761.032 ₫ sau phí — trong khi
// điểm hoàn phí lại chỉ có 8 tháng.
//
// The shortened-term case quoted in FAQ item 4 of 5 — `faq.items[3]`,
// "Chuyển đổi mà giữ nguyên khoản trả hằng tháng thì sao?" — is also the
// module's own output: 9,75%/năm over 180 tháng with 60 triệu of fees gives
// giảm mỗi tháng 85.305 ₫, điểm hoàn phí 183 tháng, tiết kiệm thực
// 530.481.652 ₫. That break-even is solved month by month, not by chi phí ÷
// giảm mỗi tháng, which used to report 704 tháng there. (The last FAQ answer,
// `faq.items[4]`, is the loan-insurance one and quotes no figures.)
//
// FAQ item 1, `faq.items[0]`, quotes two more break-evens off the same
// defaults at 8,5%/năm with the default 30 triệu phí: kỳ hạn mới 180 tháng →
// 25 tháng, and shortening until the instalment barely falls → 157 tháng at
// kỳ hạn 155 (giảm 1.694 ₫/tháng), peaking at 159 tháng at kỳ hạn 158 (giảm
// 168.435 ₫/tháng). Swept over every new term 1–216 at 8,5%/30 triệu, those
// 157–159 tháng ARE the far end: 159 is the latest break-even that exists at
// all, and every term below 155 has none, because there the instalment rises
// instead of falling. That line used to claim 181 tháng, which the module does
// not produce at 8,5% — 181 is what 9,7%/năm over 180 tháng with 30 triệu phí
// gives.
//
// Re-read the module if the defaults move.

export const REFINANCE = {
  slug: "/cong-cu/tai-cap-von",

  pageTitle: "Tính tái cấp vốn: đảo nợ có lợi không?",
  metaTitle: "Tính tái cấp vốn — Điểm hoàn phí và tiết kiệm thực",
  metaDescription:
    "So sánh khoản vay hiện tại với khoản vay mới: mức giảm hằng tháng, tổng lãi tiết kiệm sau phí và sau bao nhiêu tháng thì hoàn được phí. Công cụ miễn phí của FinHome.",

  lede:
    "Lãi suất mới gần như luôn thấp hơn, nếu không thì bạn đã không hỏi. Câu hỏi thật là mức tiết kiệm có sống lâu hơn khoản phí phải trả để có nó, và có còn là tiết kiệm không khi kỳ hạn được đặt lại từ đầu.",

  form: {
    currentGroup: "Khoản vay hiện tại",
    balanceLabel: "Dư nợ còn lại",
    balanceUnit: "₫",
    balanceHelp: "Số dư nợ gốc hiện tại, đọc trên sao kê hoặc hỏi ngân hàng.",
    balanceInvalid: "Vui lòng nhập dư nợ lớn hơn 0.",
    defaultBalance: "1.500.000.000",

    currentRateLabel: "Lãi suất hiện tại",
    currentRateUnit: "%/năm",
    currentRateHelp:
      "Mức lãi bạn đang thực trả, không phải mức ưu đãi đã hết hạn.",
    currentRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultCurrentRate: "11",

    remainingLabel: "Số tháng còn lại",
    remainingHelp:
      "Số tháng còn phải trả theo hợp đồng hiện tại. 18 năm là 216 tháng.",
    remainingInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultRemaining: "216",

    newGroup: "Khoản vay mới",
    newRateLabel: "Lãi suất mới",
    newRateUnit: "%/năm",
    newRateHelp: "Mức lãi sau ưu đãi của khoản vay mới, không phải mức ưu đãi.",
    newRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultNewRate: "8,5",

    newTermLabel: "Kỳ hạn mới",
    newTermHelp:
      "Số tháng của khoản vay mới. Để bằng số tháng còn lại nếu bạn không muốn kéo dài kỳ hạn.",
    newTermInvalid: "Vui lòng nhập số nguyên tháng lớn hơn 0.",
    defaultNewTerm: "216",

    costsLabel: "Chi phí chuyển đổi",
    costsUnit: "₫",
    costsHelp:
      "Gồm phí trả nợ trước hạn cho ngân hàng cũ, phí thẩm định, công chứng, đăng ký giao dịch bảo đảm và bảo hiểm bắt buộc.",
    costsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultCosts: "30.000.000",

    resultTitle: "Kết luận",
    lifetimeLabel: "Tiết kiệm thực sau phí",
    breakEvenLabel: "Hoàn được phí sau",
    monthlySavingLabel: "Giảm mỗi tháng",
    monthsUnit: "tháng",

    detailTitle: "Chi tiết",
    currentPaymentLabel: "Trả hằng tháng hiện tại",
    newPaymentLabel: "Trả hằng tháng mới",
    currentInterestLabel: "Lãi còn phải trả nếu giữ nguyên",
    newInterestLabel: "Lãi phải trả nếu chuyển",
    interestSavingLabel: "Tiết kiệm lãi trước phí",
    costsResultLabel: "Chi phí chuyển đổi",
    termChangeLabel: "Kỳ hạn thay đổi",

    noBreakEvenNotice:
      "Khoản trả hằng tháng không giảm, nên không có điểm hoàn phí. Điều đó không có nghĩa là phương án tệ: rút ngắn kỳ hạn làm mỗi tháng nặng hơn nhưng tổng lãi giảm. Hãy xem dòng tiết kiệm thực sau phí để quyết định.",
    neverRecoveredNotice:
      "Khoản trả hằng tháng có giảm, nhưng phần tiết kiệm cộng dồn không bao giờ bù đủ chi phí chuyển đổi trong suốt cả hai khoản vay, nên không có điểm hoàn phí. Hãy xem dòng tiết kiệm thực sau phí — nó đang âm.",
    extendedNotice:
      "Kỳ hạn mới dài hơn số tháng còn lại của khoản vay hiện tại. Hãy đọc dòng tiết kiệm thực sau phí trước khi mừng vì khoản trả hằng tháng giảm.",
    shortenedNotice:
      "Kỳ hạn mới ngắn hơn số tháng còn lại, nên khoản trả hằng tháng giảm ít hơn so với khi giữ nguyên kỳ hạn — càng rút ngắn nhiều thì càng giảm ít và điểm hoàn phí càng muộn; rút ngắn đủ nhiều thì khoản trả còn TĂNG và không có điểm hoàn phí nào để đọc. Bù lại, từ tháng khoản vay mới trả xong, bạn không còn phải trả gì trong khi khoản vay cũ thì vẫn còn chạy, nên phần tiết kiệm cộng dồn nhảy vọt từ đó. Vì vậy ở đây con số nên đọc là tiết kiệm thực sau phí.",
  },

  trapNotice:
    "Hai con số trong bảng có thể mâu thuẫn nhau, và đó là điểm quan trọng nhất của trang này. Với khoản vay mặc định, chuyển từ 11% sang 8,5% mà giữ nguyên 216 tháng: mỗi tháng nhẹ đi 2.393.883 ₫ và tiết kiệm thực 487.078.691 ₫ — rõ ràng nên làm. Nhưng nếu đặt kỳ hạn mới thành 300 tháng, mỗi tháng nhẹ đi tới 3.897.338 ₫, điểm hoàn phí còn 8 tháng, mà tổng lãi lại TĂNG 172.761.032 ₫ — lỗ 202.761.032 ₫. Điểm hoàn phí ngắn không đủ để kết luận; nó chỉ trả lời câu hỏi “nếu tôi trả hết sớm thì có lỗ phí không”.",

  formula: {
    title: "Cách tính",
    body: [
      "Khoản vay hiện tại được tính như một khoản vay mới bằng đúng dư nợ còn lại, trong đúng số tháng còn lại — vì từ hôm nay trở đi nó chính là như vậy. Cả hai bên đều dùng công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)).",
      "Giảm mỗi tháng = khoản trả hiện tại − khoản trả mới. Tiết kiệm lãi trước phí = lãi còn phải trả nếu giữ nguyên − lãi phải trả nếu chuyển. Tiết kiệm thực sau phí là con số thứ hai trừ chi phí chuyển đổi.",
      "Điểm hoàn phí được tính lần lượt theo từng tháng: cộng dồn phần khoản trả tiết kiệm được, rồi lấy tháng đầu tiên mà phần cộng dồn đó bù đủ chi phí chuyển đổi. Công cụ không dùng phép chia chi phí ÷ giảm mỗi tháng, vì mức tiết kiệm không phải một con số cố định: khi kỳ hạn mới NGẮN hơn số tháng còn lại thì từ lúc khoản vay mới trả xong, phần tiết kiệm nhảy lên bằng TOÀN BỘ khoản trả cũ. Phép chia đơn giản từng cho ra 704 tháng trên một khoản vay chỉ dài 180 tháng. Con số báo ra là tháng đã trả xong, vì bạn chỉ thực sự có lãi khi tháng đó đã hoàn tất.",
      "Công cụ để trống điểm hoàn phí trong hai trường hợp, thay vì ghi 0 hay một số âm. Một là khoản trả hằng tháng không giảm — không có gì để hoàn khi không có khoản tiết kiệm hằng tháng nào. Hai là khoản trả có giảm nhưng phần tiết kiệm cộng dồn không bao giờ bù đủ chi phí chuyển đổi trong suốt cả hai khoản vay.",
      "Cả hai bên đều giả định lãi suất không đổi. Với khoản vay mua nhà tại Việt Nam, đây là giả định mạnh nhất trong toàn bộ phép tính: hãy nhập mức lãi SAU ưu đãi ở cả hai bên, vì so mức ưu đãi mới với mức thả nổi cũ luôn cho kết quả đẹp một cách sai lệch.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên tin điểm hoàn phí hay tiết kiệm thực sau phí?",
        a: "Tùy bạn định giữ khoản vay bao lâu. Nếu có khả năng bán nhà hoặc tất toán trong vài năm tới, điểm hoàn phí là con số quyết định — chuyển đổi rồi trả hết trước khi hoàn được phí là lỗ. Nếu bạn sẽ trả đến hết kỳ hạn, tiết kiệm thực sau phí mới là con số đúng. Hai con số có thể mâu thuẫn theo cả hai chiều, nên đừng chỉ nhìn một chiều: kỳ hạn mới DÀI hơn số tháng còn lại thì điểm hoàn phí rất ngắn mà tiết kiệm thực lại âm. Kỳ hạn mới NGẮN hơn thì tiết kiệm thực rất lớn, còn điểm hoàn phí tùy bạn rút ngắn bao nhiêu: với dư nợ mặc định chuyển sang 8,5%, rút từ 216 xuống 180 tháng vẫn hoàn phí sau 25 tháng, nhưng rút tới mức khoản trả hằng tháng gần như không giảm — kỳ hạn mới quanh 155–158 tháng — thì điểm hoàn phí bị đẩy ra 157–159 tháng, và rút ngắn hơn nữa thì khoản trả tăng lên nên không còn điểm hoàn phí nào.",
      },
      {
        q: "Phí trả nợ trước hạn tính thế nào?",
        a: "Ngân hàng thường thu theo phần trăm dư nợ trả trước và giảm dần theo số năm đã vay — ví dụ 3% trong 2 năm đầu, 2% năm thứ ba, rồi 1% hoặc miễn. Hãy đọc lại hợp đồng và cộng khoản này vào ô chi phí chuyển đổi, vì với dư nợ 1,5 tỷ thì 2% đã là 30 triệu, đủ để đổi kết luận.",
      },
      {
        q: "Vì sao phải nhập lãi suất sau ưu đãi cho khoản vay mới?",
        a: "Vì so mức ưu đãi 12 tháng đầu của khoản vay mới với mức thả nổi hiện tại của khoản vay cũ là so hai thứ khác nhau, và luôn cho ra kết quả tốt giả tạo. Hãy hỏi ngân hàng mới về lãi cơ sở cộng biên độ, nhập mức đó, rồi chạy thêm một lần với mức ưu đãi để thấy khoảng dao động.",
      },
      {
        q: "Chuyển đổi mà giữ nguyên khoản trả hằng tháng thì sao?",
        a: "Đây thường là phương án tốt nhất và công cụ hỗ trợ được: hãy giảm kỳ hạn mới xuống cho tới khi khoản trả hằng tháng mới xấp xỉ khoản trả hiện tại. Bạn không nhẹ hơn mỗi tháng, nhưng rút ngắn kỳ hạn và tiết kiệm lãi nhiều nhất. Nhập kỳ hạn 180 tháng vào ví dụ mặc định để thấy hiệu ứng. Đổi lại, mức giảm hằng tháng gần như bằng 0, nên điểm hoàn phí sẽ rất muộn — đó là bình thường chứ không phải dấu hiệu xấu, và trong trường hợp này con số phải đọc là tiết kiệm thực sau phí. Ví dụ với dư nợ mặc định, chuyển sang 9,75%/năm trong 180 tháng và chịu 60 triệu phí: mỗi tháng chỉ nhẹ đi 85.305 ₫ nên điểm hoàn phí là 183 tháng, nhưng tiết kiệm thực sau phí vẫn là 530.481.652 ₫.",
      },
      {
        q: "Công cụ có tính phí bảo hiểm khoản vay không?",
        a: "Chỉ khi bạn cộng vào ô chi phí chuyển đổi. Nhiều ngân hàng yêu cầu mua bảo hiểm nhân thọ hoặc bảo hiểm tài sản khi giải ngân, và phí năm đầu thường được thu một lần. Nếu bảo hiểm phải đóng hằng năm suốt kỳ hạn thì nó không phải chi phí một lần — khi đó hãy trừ phần chênh lệch phí bảo hiểm hằng năm ra khỏi dòng giảm mỗi tháng để có con số thật.",
      },
    ],
  },
} as const;
