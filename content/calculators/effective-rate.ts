// Copy for /cong-cu/lai-suat-thuc-te/ — the effective rate converter.
//
// Original FinHome copy. The arithmetic is standard finance.
//
// Every figure quoted below is for the prefilled default (8%/năm, ghép lãi
// hằng tháng) and is pinned by effective-rate.test.ts: hiệu dụng 8,2999…%,
// ghép hằng ngày 8,3278%, và chiều nghịch 10% hiệu dụng là 9,569% danh nghĩa.
// If the defaults move, re-read the module — do not adjust these by hand.

export const EFFECTIVE_RATE = {
  slug: "/cong-cu/lai-suat-thuc-te",

  pageTitle: "Lãi suất thực tế: 8%/năm là bao nhiêu?",
  metaTitle: "Tính lãi suất thực tế — Quy đổi lãi danh nghĩa và hiệu dụng",
  metaDescription:
    "Quy lãi suất danh nghĩa về lãi suất hiệu dụng theo kỳ ghép lãi, và ngược lại, kèm bảng so sánh mọi tần suất ghép lãi. Công cụ miễn phí của FinHome.",

  lede:
    "Một mức “8%/năm” không phải một con số duy nhất. Ghép lãi một lần một năm thì đúng là 8%; ghép hằng tháng thành 8,30%; ghép hằng ngày thành 8,33%. Lãi suất danh nghĩa là con số được niêm yết, lãi suất hiệu dụng là con số bạn thực nhận — và chỉ con số thứ hai so sánh được giữa các sản phẩm.",

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
    effectiveLabel: "Lãi suất hiệu dụng",
    nominalLabel: "Lãi suất danh nghĩa",
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
      "Từ danh nghĩa sang hiệu dụng: lãi hiệu dụng = (1 + lãi danh nghĩa ÷ số kỳ)^số kỳ − 1. Với 8%/năm ghép hằng tháng: (1 + 0,08 ÷ 12)^12 − 1 = 8,2999%.",
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
        a: "Chỉ khi mức lãi suất bù được. Gửi hai kỳ 6 tháng ở cùng một mức lãi suất danh nghĩa tương đương ghép lãi nửa năm một lần, nên bạn được thêm một chút nhờ ghép lãi. Nhưng lãi suất kỳ hạn 6 tháng thường thấp hơn kỳ hạn 12 tháng, và mức chênh đó lớn hơn nhiều so với phần lợi từ ghép lãi. Hãy quy cả hai về lãi hiệu dụng rồi so.",
      },
      {
        q: "Vì sao “ghép lãi hằng ngày” lại không hơn nhiều “ghép lãi hằng tháng”?",
        a: "Vì phần lợi từ ghép lãi tiến rất nhanh tới một giới hạn. Với 8%/năm, ghép hằng tháng cho 8,2999% còn ghép hằng ngày cho 8,3278% — chênh 0,03 điểm phần trăm, tức 30.000 ₫ trên mỗi 100 triệu. Ghép lãi liên tục, tức tần suất tiến tới vô cùng, chỉ đạt 8,3287%. Nên đây thường là một chi tiết quảng cáo hơn là một lợi thế thật.",
      },
      {
        q: "Với khoản vay thì nên xem con số nào?",
        a: "Lãi hiệu dụng, và cùng chiều lo lắng thay vì chiều vui: ghép lãi dày làm bạn trả nhiều hơn. Nhưng với khoản vay, lãi suất chỉ là một phần — phí thu xếp, phí bảo hiểm và phí trả nợ trước hạn thường lớn hơn cả phần chênh do ghép lãi. Công cụ so sánh khoản vay của FinHome tính cả phí vào chi phí vay.",
      },
      {
        q: "Con số này có trừ thuế và lạm phát không?",
        a: "Không. Đây là lãi suất danh nghĩa và hiệu dụng, đều trước thuế và trước lạm phát. Lãi tiền gửi của cá nhân tại Việt Nam hiện không chịu thuế thu nhập cá nhân, nhưng lạm phát thì luôn ăn vào sức mua: lãi hiệu dụng 8,3% với lạm phát 4% tương đương lợi nhuận thực khoảng 4,1%.",
      },
    ],
  },
} as const;
