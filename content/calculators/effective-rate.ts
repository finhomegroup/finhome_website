// Copy for /cong-cu/lai-suat-thuc-te/ — the effective rate converter.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Every figure quoted below is for the prefilled default (8%/năm, ghép lãi
// hằng tháng) and is pinned by effective-rate.test.ts: hiệu dụng 8,29995% —
// trang hiển thị bốn chữ số thập phân, nên nó hiện 8,3000% — ghép hằng ngày
// 8,3278%, và chiều nghịch 10% hiệu dụng là 9,569% danh nghĩa.
// If the defaults move, re-read the module — do not adjust these by hand.
// Quote the RENDERED value in user-facing copy. An elided form of the raw
// figure used to sit here, and it invited a truncation (rather than a
// rounding) into two prose strings that then contradicted the page.

export const EFFECTIVE_RATE = {
  slug: "/cong-cu/lai-suat-thuc-te",

  // ORIGINAL ROW 58 RENAMED THIS PAGE, and the URL deliberately did not move.
  // "Lãi suất thực tế" is the phrase Vietnamese readers also use for an APR
  // that folds in arrangement fees and insurance, so the old title invited
  // exactly the confusion this page exists to remove. Everything visible now
  // says HIỆU DỤNG — the effect of the compounding frequency alone — and
  // `aprNotice` states what is NOT in it. `/cong-cu/lai-suat-thuc-te/` stays
  // as the route.
  pageTitle: "Lãi suất hiệu dụng: 8%/năm thực nhận là bao nhiêu?",
  metaTitle: "Tính lãi suất hiệu dụng — Quy đổi lãi danh nghĩa và hiệu dụng",
  metaDescription:
    "Quy lãi suất danh nghĩa về lãi suất hiệu dụng theo kỳ ghép lãi, và ngược lại, kèm bảng so sánh mọi tần suất ghép lãi. Đây là tác động của kỳ ghép lãi, không phải APR có phí. Công cụ miễn phí của FinHome.",

  lede:
    "Một mức “8%/năm” không phải một con số duy nhất. Ghép lãi một lần một năm thì đúng là 8%; ghép hằng tháng thành 8,30%; ghép hằng ngày thành 8,33%. Lãi suất danh nghĩa là con số được niêm yết, lãi suất hiệu dụng là con số bạn thực nhận sau khi tính kỳ ghép lãi — và chỉ con số thứ hai so sánh được giữa các sản phẩm có kỳ ghép lãi khác nhau.",

  // The distinction original row 58 asks for, above the tool rather than in a
  // collapsed FAQ: a reader must not read a number off this page and take it
  // to a loan quote as though it included the fees.
  aprNotice:
    "Trang này chỉ tính tác động của KỲ GHÉP LÃI. Nó không cộng phí thu xếp, phí bảo hiểm, phí thẩm định hay phí trả nợ trước hạn — nên con số “hiệu dụng” ở đây KHÔNG phải APR. Với một khoản vay, phí thường ảnh hưởng nhiều hơn cả kỳ ghép lãi; hãy dùng công cụ APR cho phần đó.",
  aprNoticeDetailTitle: "Hiệu dụng và APR khác nhau ở chỗ nào?",
  aprNoticeDetail:
    "Lãi hiệu dụng trả lời: cùng một mức niêm yết, ghép lãi dày hơn thì thành bao nhiêu? Đó là câu hỏi về CÁCH TÍNH LÃI. APR trả lời: quy mọi khoản phải trả — gồm cả phí — về một mức lãi suất tương đương để so hai báo giá. Đó là câu hỏi về TỔNG CHI PHÍ. Hai con số có thể chênh nhau nhiều điểm phần trăm, và chúng không thay thế nhau được: một sản phẩm ghép lãi hằng năm nhưng thu 2% phí thu xếp có APR cao hơn hẳn mức niêm yết, trong khi lãi hiệu dụng của nó đúng bằng mức niêm yết.",

  form: {
    directionLegend: "Bạn có con số nào?",
    directionHelp:
      "Chiều thứ nhất trả lời “lãi niêm yết này thực nhận bao nhiêu”. Chiều thứ hai trả lời “muốn thực nhận mức này thì lãi niêm yết phải là bao nhiêu”.",
    directionToEffective: "Có lãi danh nghĩa, tìm lãi hiệu dụng",
    directionToNominal: "Có lãi hiệu dụng, tìm lãi danh nghĩa",

    group: "Lãi suất",
    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Mức lãi hằng năm, ví dụ 8,5. Phải lớn hơn −100.",
    rateInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultRate: "8",

    compoundingLabel: "Kỳ ghép lãi",
    compoundingHelp:
      "Tần suất lãi được nhập vào gốc. Tiền gửi tại Việt Nam thường trả lãi cuối kỳ; thẻ tín dụng và một số khoản vay tính theo ngày.",
    defaultCompounding: "monthly",

    resultTitle: "Kết quả",
    effectiveLabel: "Lãi hiệu dụng (chưa gồm phí)",
    nominalLabel: "Lãi danh nghĩa niêm yết",
    periodicLabel: "Lãi suất mỗi kỳ",
    periodsLabel: "Số kỳ ghép lãi mỗi năm",
    gainLabel: "Phần tăng do ghép lãi",
    pointsUnit: "điểm %",
    periodsUnit: "kỳ",
  },

  compounding: {
    annually: "Một lần mỗi năm",
    semiannually: "Nửa năm một lần",
    quarterly: "Mỗi quý",
    monthly: "Hằng tháng",
    semimonthly: "Nửa tháng một lần",
    biweekly: "Hai tuần một lần",
    weekly: "Hằng tuần",
    daily: "Hằng ngày",
  },

  table: {
    caption: "Cùng một lãi suất danh nghĩa, ở mọi tần suất ghép lãi",
    compoundingColumn: "Kỳ ghép lãi",
    periodsColumn: "Số kỳ/năm",
    effectiveColumn: "Lãi hiệu dụng",
    extraColumn: "Hơn ghép năm",
    intro:
      "Bảng dưới luôn tính trên lãi suất danh nghĩa, kể cả khi bạn đang dùng chiều nghịch. Điều đáng chú ý là phần tăng chững lại rất nhanh: từ ghép năm sang ghép tháng, mức 8% được thêm 0,30 điểm phần trăm; từ ghép tháng sang ghép ngày chỉ thêm được 0,03 điểm nữa. Ghép lãi liên tục có một giới hạn toán học, nên “ghép lãi hằng ngày” trong quảng cáo gần như không đáng kể so với “ghép lãi hằng tháng”.",
  },

  whichNotice:
    "Khi so sánh hai sản phẩm, hãy so lãi suất hiệu dụng. Một sổ tiết kiệm 8,2%/năm trả lãi cuối kỳ thực nhận đúng 8,2%, còn một sản phẩm 8,0%/năm ghép lãi hằng tháng thực nhận 8,30% — con số niêm yết thấp hơn nhưng thực nhận cao hơn. Ở phía đi vay thì ngược chiều lợi ích: cùng một mức niêm yết, ghép lãi càng dày thì bạn trả càng nhiều.",

  formula: {
    title: "Cách tính",
    body: [
      "Từ danh nghĩa sang hiệu dụng: lãi hiệu dụng = (1 + lãi danh nghĩa ÷ số kỳ)^số kỳ − 1. Với 8%/năm ghép hằng tháng: (1 + 0,08 ÷ 12)^12 − 1 = 8,3000% (chính xác là 8,29995%).",
      "Từ hiệu dụng sang danh nghĩa là phép nghịch: lãi danh nghĩa = số kỳ × ((1 + lãi hiệu dụng)^(1 ÷ số kỳ) − 1). Muốn thực nhận 10%/năm với kỳ ghép lãi hằng tháng, mức niêm yết cần là 9,569%/năm.",
      "Lãi suất mỗi kỳ = lãi danh nghĩa ÷ số kỳ. Đây là con số dùng trong mọi công thức trả góp — lãi 12%/năm ghép hằng tháng là 1% mỗi tháng, không phải 12% mỗi tháng.",
      "Phần tăng do ghép lãi là hiệu giữa hiệu dụng và danh nghĩa, tính theo điểm phần trăm. Nó bằng 0 khi ghép lãi một lần mỗi năm, và lớn dần theo cả tần suất ghép lãi lẫn độ lớn của lãi suất — với lãi suất cao, chênh lệch này rất đáng kể.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ngân hàng niêm yết lãi suất nào?",
        a: "Với tiền gửi có kỳ hạn tại Việt Nam, mức niêm yết thường là lãi suất danh nghĩa theo năm và lãi được trả một lần vào cuối kỳ, nên với kỳ hạn 12 tháng thì danh nghĩa và hiệu dụng trùng nhau. Chênh lệch phát sinh khi lãi được nhập gốc trong kỳ, hoặc khi bạn tái tục nhiều kỳ hạn ngắn liên tiếp trong một năm — khi đó hãy nhập kỳ ghép lãi tương ứng.",
      },
      {
        q: "Gửi 6 tháng rồi tái tục có lợi hơn gửi 12 tháng không?",
        a: "Chỉ khi mức lãi suất bù được, và đó là con số bạn phải tra từ biểu lãi suất đang áp dụng. Về mặt phép tính: gửi hai kỳ 6 tháng ở CÙNG một mức lãi suất danh nghĩa tương đương ghép lãi nửa năm một lần, nên bạn được thêm một chút nhờ ghép lãi. Nhưng nếu mức lãi kỳ hạn 6 tháng thấp hơn kỳ hạn 12 tháng, phần thiếu đó có thể lớn hơn hẳn phần lợi từ ghép lãi. Cách so đúng là quy CẢ HAI mức lãi thực tế của bạn về lãi hiệu dụng rồi đặt cạnh nhau — công cụ không biết biểu lãi suất của nơi bạn gửi.",
      },
      {
        q: "Vì sao “ghép lãi hằng ngày” lại không hơn nhiều “ghép lãi hằng tháng”?",
        a: "Vì phần lợi từ ghép lãi tiến rất nhanh tới một giới hạn. Ở mức 8%/năm — con số giả định của ví dụ trên trang này — ghép hằng tháng cho 8,3000% còn ghép hằng ngày cho 8,3278%, chênh 0,03 điểm phần trăm, tức 30.000 ₫ trên mỗi 100 triệu. Ghép lãi liên tục, tức tần suất tiến tới vô cùng, chỉ đạt 8,3287%. Ở mức lãi cao hơn thì khoảng cách rộng hơn, nên hãy nhập chính mức lãi của bạn để thấy con số của mình.",
      },
      {
        q: "Với khoản vay thì nên xem con số nào?",
        a: "Lãi hiệu dụng, và cùng chiều lo lắng thay vì chiều vui: ghép lãi dày làm bạn trả nhiều hơn. Nhưng với khoản vay, lãi suất chỉ là một phần — còn phí thu xếp, phí bảo hiểm và phí trả nợ trước hạn, mỗi khoản theo hợp đồng của bạn. Con số nào lớn hơn thì tùy hợp đồng, và trang này không biết hợp đồng của bạn: hãy đưa các khoản phí thực tế vào công cụ APR để so trên một mức lãi tương đương.",
      },
      {
        q: "Con số này có trừ thuế và lạm phát không?",
        a: "Không. Đây là lãi suất danh nghĩa và hiệu dụng, cả hai đều trước thuế và trước lạm phát, và công cụ này KHÔNG tính thuế — nó không cho biết khoản lãi của bạn có chịu thuế hay không, ở mức nào; điều đó theo quy định đang áp dụng cho trường hợp của bạn. Về lạm phát thì phép tính đơn giản: lãi hiệu dụng 8,3% với lạm phát 4% tương đương lợi nhuận thực khoảng 4,1%, tính bằng (1,083 ÷ 1,04 − 1). Cả hai con số trong ví dụ là giả định.",
      },
    ],
  },
} as const;
