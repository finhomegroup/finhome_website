// Copy for /cong-cu/tin-phieu-kho-bac-hoa-ky/.
//
// Original FinHome copy. Models UNITED STATES instruments — registry sets
// usRules: true.
//
// Figures quoted are computeUsTbill's output, verified by running it
// (10.000 USD mệnh giá, chiết khấu 5,00%, 91 ngày, liên bang 24%, bang 5%):
//   Giá mua 9.873,61 USD, chiết khấu 126,39 USD
//   Lợi suất kỳ 1,2801%; quy năm đơn 5,1343%; nửa năm ghép 5,1674%;
//     ghép năm 5,2341%
//   Quote 5,00% thấp hơn lợi suất thật 0,1343 điểm
//   Lợi suất tương đương chịu thuế bang: 5,4046% (bang 5%),
//     5,9220% (bang 13,3%)
// Second worked example — the 52-week bill daysHelp advertises
// (10.000 USD mệnh giá, chiết khấu 5,00%, 364 ngày):
//   quy năm đơn 5,3394%; nửa năm ghép 5,2703%; ghép năm 5,3398%
//     — thứ tự đảo so với tín phiếu ngắn, vì 365/364 < 2
//
// The Treasury's published investment rate (its "coupon equivalent") for
// bills of 182 days or less is SIMPLE interest with no compounding —
// 31 CFR 356 App B §VI.D.1, i = [(100 − P)/P] × (y/r). So it is the
// "Lợi suất quy năm (đơn, 365 ngày)" row (5,1343% at the defaults) that
// carries that name, NOT the "Lợi suất ghép nửa năm" row (5,1674%).
//
// One hedge the copy has to carry, because §VI.D.1 defines y as "the number
// of days in year following the issue date; normally 365, but if the period
// from the issue date to the same date 1 year ahead contains February 29,
// then y is 366" (quoted verbatim from eCFR, fetched 2026-09). computeUsTbill
// takes no dates at all, so it can only ever use y = 365. In a leap window
// the Treasury's figure is therefore HIGHER than the row this copy points at,
// by exactly 366/365 — exactly, at every term, because (100 − P)/P is common
// to both routes. Measured at the defaults: 5,1343368 × 366/365 = 5,1484034,
// i.e. 5,1484% against 5,1343%, a gap of 0,0141 điểm %. The copy states the
// RATIO, not a points bound: the gap is i/365 and so grows with the yield
// level (0,0142 điểm at 182 ngày / 5,00% chiết khấu, more at higher rates).
//
// Above 182 days the Treasury switches to a quadratic this module
// deliberately does not transcribe, and this copy says so plainly. See the
// module docstring.

export const US_TBILL = {
  slug: "/cong-cu/tin-phieu-kho-bac-hoa-ky",

  pageTitle: "Tín phiếu kho bạc Hoa Kỳ",
  metaTitle: "Tín phiếu kho bạc Hoa Kỳ — Giá mua và lợi suất thực",
  metaDescription:
    "Tính giá mua tín phiếu kho bạc từ lãi suất chiết khấu, và ba cách quy đổi lợi suất thực. Kèm giá trị của việc miễn thuế thu nhập bang. Công cụ miễn phí của FinHome.",

  lede:
    "Tín phiếu kho bạc không trả lãi định kỳ: nó được bán dưới mệnh giá và hoàn trả đúng mệnh giá, phần chênh lệch chính là toàn bộ lợi nhuận. Điều đáng chú ý là lãi suất được NIÊM YẾT luôn thấp hơn lợi suất thực nhận, vì hai lý do cộng dồn lên nhau.",

  form: {
    billGroup: "Tín phiếu",
    faceLabel: "Mệnh giá",
    faceUnit: "USD",
    faceHelp: "Số tiền nhận lại khi đáo hạn. Mua tối thiểu 100 USD.",
    faceInvalid: "Vui lòng nhập một số lớn hơn 0.",

    discountLabel: "Lãi suất chiết khấu niêm yết",
    discountUnit: "%/năm",
    discountHelp: "Con số công bố trong kết quả đấu giá, tính trên cơ sở 360 ngày.",
    discountInvalid: "Lãi suất này quá cao — giá mua sẽ bằng 0 hoặc âm.",

    daysLabel: "Số ngày đến đáo hạn",
    daysUnit: "ngày",
    daysHelp: "Tín phiếu có kỳ hạn 4, 8, 13, 17, 26 hoặc 52 tuần.",
    daysInvalid: "Vui lòng nhập một số nguyên từ 1 đến 366.",

    taxGroup: "Thuế",
    federalLabel: "Thuế suất liên bang biên",
    federalUnit: "%",
    federalHelp: "Lãi tín phiếu chịu thuế thu nhập liên bang.",
    federalInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    stateLabel: "Thuế suất thu nhập bang",
    stateUnit: "%",
    stateHelp:
      "Lãi tín phiếu được MIỄN thuế bang. Con số này chỉ dùng để định giá phần miễn đó, không bị trừ vào lợi nhuận.",
    stateInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    defaults: {
      face: "10.000",
      discount: "5",
      days: "91",
      federal: "24",
      state: "5",
    },

    resultTitle: "Giá mua và lợi suất",
    priceLabel: "Giá mua",
    discountAmountLabel: "Chiết khấu nhận được",
    investmentYieldLabel: "Lợi suất quy năm (đơn, 365 ngày)",
    understatementLabel: "Niêm yết thấp hơn lợi suất thật",
    pointsUnit: "điểm %",

    yieldsTitle: "Ba cách quy đổi lợi suất",
    periodReturnLabel: "Lợi suất trong kỳ (chưa quy năm)",
    bondEquivalentLabel: "Lợi suất ghép nửa năm",
    effectiveAnnualLabel: "Lợi suất ghép năm (so được với APY)",

    taxTitle: "Sau thuế",
    federalTaxLabel: "Thuế liên bang",
    afterTaxProfitLabel: "Lợi nhuận sau thuế",
    afterTaxYieldLabel: "Lợi suất sau thuế",
    taxableEquivalentLabel: "Sản phẩm chịu thuế bang phải trả tối thiểu",

    beyondShortBillNotice:
      "Kỳ hạn trên 182 ngày. Với các kỳ hạn này, Kho bạc Hoa Kỳ công bố một chỉ số “coupon equivalent” tính theo một công thức bậc hai riêng, và con số “lợi suất ghép nửa năm” ở đây có thể lệch nhẹ so với chỉ số đó. Chúng tôi cố ý không sao chép công thức của Kho bạc mà tính lợi suất ghép nửa năm từ nguyên lý — mức tăng của chính tín phiếu — nên con số này kiểm chứng được nhưng không mang tên gọi của Kho bạc. Với kỳ hạn từ 182 ngày trở xuống, Kho bạc không ghép lãi: chỉ số của Kho bạc là lãi ĐƠN và trùng với dòng “Lợi suất quy năm (đơn, 365 ngày)” ở trên — trừ một trường hợp về cơ số ngày, khi một năm kể từ ngày phát hành có ngày 29/02 thì quy định cho Kho bạc dùng 366 ngày, và con số của Kho bạc cao hơn dòng đó đúng 366/365 lần. Công cụ không nhận ngày phát hành nên luôn tính trên 365 ngày.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Kiểm tra lại số ngày (số nguyên, 1–366) và lãi suất chiết khấu.",
  },

  quoteNotice:
    "Với tín phiếu mặc định, lãi suất niêm yết là 5,00% nhưng lợi suất quy năm thực nhận là 5,1343% — cao hơn 0,1343 điểm phần trăm. Chênh lệch đến từ hai quy ước cộng dồn. Thứ nhất, mức chiết khấu được tính trên MỆNH GIÁ, còn nhà đầu tư chỉ bỏ ra giá mua thấp hơn: 126,39 USD lãi trên 9.873,61 USD bỏ ra, không phải trên 10.000 USD. Thứ hai, lãi suất niêm yết quy năm theo 360 ngày trong khi khoản đầu tư chạy trên lịch 365 ngày. Riêng lý do thứ nhất đưa con số lên 5,0640%, riêng lý do thứ hai lên 5,0694%; cả hai cùng lúc cho 5,1343%. Vì vậy, so lãi suất niêm yết 5,00% của tín phiếu với APY 5,00% của một khoản tiền gửi là đang so hai đại lượng khác nhau.",

  formula: {
    title: "Cách tính",
    body: [
      "Giá mua bằng mệnh giá nhân với (1 − lãi suất chiết khấu × số ngày / 360). Đây đúng là công thức định giá của Kho bạc Hoa Kỳ, và cơ sở 360 ngày là một quy ước chứ không phải một cuốn lịch.",
      "Lợi suất trong kỳ bằng chiết khấu chia GIÁ MUA. Chia cho mệnh giá là lỗi phổ biến nhất khi tự tính, vì mệnh giá không phải số tiền bạn bỏ ra.",
      "Lợi suất quy năm đơn nhân lợi suất trong kỳ với 365 / số ngày. Đây là con số so sánh được với lãi suất niêm yết của các sản phẩm khác trên cơ sở đơn giản nhất.",
      "Lợi suất ghép nửa năm là mức lãi suất mà nếu ghép hai lần một năm sẽ tạo ra đúng mức tăng của tín phiếu. Đây KHÔNG phải chỉ số “coupon equivalent” của Kho bạc: với kỳ hạn từ 182 ngày trở xuống, Kho bạc tính lãi ĐƠN và không ghép lãi, nên chỉ số Kho bạc công bố ứng với dòng “Lợi suất quy năm (đơn, 365 ngày)” ở trên chứ không phải dòng này — với tín phiếu mặc định là 5,1343% so với 5,1674%. Một lưu ý về cơ số ngày: quy định (31 CFR 356 App B §VI.D.1) dùng 365 ngày, nhưng nếu một năm kể từ ngày phát hành có ngày 29/02 thì dùng 366 ngày, và khi đó con số Kho bạc công bố cao hơn dòng trên đúng 366/365 lần — với tín phiếu mặc định là 5,1484% thay vì 5,1343%. Công cụ không nhận ngày phát hành nên luôn tính trên 365 ngày. Với kỳ hạn dài hơn, Kho bạc dùng một công thức bậc hai riêng; chúng tôi tính từ nguyên lý thay vì sao chép công thức đó, và bộ kiểm thử kiểm chứng bằng cách ghép ngược con số trở lại để phải ra đúng tỷ lệ mệnh giá trên giá mua.",
      "Lợi suất ghép năm là con số so được trực tiếp với APY của một khoản tiền gửi ngân hàng. Ba con số là ba cách quy năm CÙNG một mức tăng, chỉ khác số lần ghép lãi trong một năm: 365/số ngày lần, 2 lần, và 1 lần. Với cùng một mức tăng, càng ghép nhiều lần thì lãi suất công bố càng THẤP — nên thứ tự tăng dần đơn < ghép nửa năm < ghép năm chỉ đúng khi 365/số ngày lớn hơn 2, tức kỳ hạn dưới 182,5 ngày. Tín phiếu 4, 8, 13, 17 và 26 tuần đều nằm trong khoảng đó. Từ 183 ngày trở lên thứ tự đảo chiều: tín phiếu 52 tuần (364 ngày) ở chiết khấu 5,00% cho đơn 5,3394%, ghép nửa năm 5,2703% và ghép năm 5,3398%. Riêng ghép nửa năm thì luôn thấp hơn ghép năm ở mọi kỳ hạn.",
      "Lãi tín phiếu chịu thuế thu nhập liên bang nhưng được MIỄN thuế thu nhập bang. Vì vậy thuế suất bang không bị trừ vào lợi nhuận ở đây; nó chỉ dùng để tính xem một sản phẩm chịu thuế bang phải trả lãi suất bao nhiêu mới để lại cùng số tiền sau thuế. Thuế liên bang áp cho cả hai bên nên triệt tiêu khỏi phép so đó.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao lãi suất niêm yết lại thấp hơn lợi suất thực?",
        a: "Vì hai quy ước, và cả hai đều làm con số niêm yết thấp đi. Mức chiết khấu tính trên mệnh giá nhưng nhà đầu tư chỉ bỏ ra giá mua thấp hơn, nên tỷ suất thực trên số tiền bỏ ra phải cao hơn. Và việc quy năm trên 360 ngày thay vì 365 làm con số nhỏ thêm một nhịp nữa. Đây là quy ước có từ thời tính lãi bằng tay, không phải cách trình bày gây nhầm lẫn có chủ ý — nhưng hệ quả là con số niêm yết không so trực tiếp được với APY của tiền gửi.",
      },
      {
        q: "Nên dùng con số nào để so với lãi tiền gửi ngân hàng?",
        a: "Dùng lợi suất ghép năm, vì APY mà ngân hàng công bố cũng là lãi suất ghép năm. So lãi suất chiết khấu niêm yết với APY là so sai đại lượng, và luôn sai theo hướng làm tín phiếu trông kém hơn thực tế. Với tín phiếu mặc định, khoảng cách là 5,00% so với 5,2341% — hơn 0,23 điểm phần trăm.",
      },
      {
        q: "Miễn thuế bang đáng bao nhiêu?",
        a: "Tùy bang. Với thuế suất bang 5%, tín phiếu lợi suất 5,1343% tương đương một sản phẩm chịu thuế bang trả 5,4046%. Ở một bang thuế suất cao như California ở bậc trên cùng, mức tương đương lên 5,9220%. Ở các bang không có thuế thu nhập, phần miễn này không đáng gì và hai con số bằng nhau. Thuế liên bang không ảnh hưởng đến phép so này vì nó áp cho cả hai bên như nhau.",
      },
      {
        q: "Vì sao công cụ không dùng đúng công thức coupon equivalent của Kho bạc?",
        a: "Vì với kỳ hạn trên 182 ngày, công thức đó là một biểu thức bậc hai mà chúng tôi sẽ phải sao chép lại. Trong quá trình xây bộ công cụ này, chúng tôi từng sao chép sai một bộ hệ số toán học và chỉ phát hiện nhờ kiểm tra ngược — nên các hằng số và công thức sao chép được xem là một loại lỗi riêng cần tránh. Thay vào đó công cụ tính lợi suất ghép nửa năm từ nguyên lý, kiểm chứng được bằng cách ghép ngược lại phải ra đúng mức tăng của tín phiếu. Với kỳ hạn từ 182 ngày trở xuống thì không cần đến công thức đó: chỉ số của Kho bạc là lãi đơn, tức dòng “Lợi suất quy năm (đơn, 365 ngày)”. Có một ngoại lệ nhỏ về cơ số ngày: nếu một năm kể từ ngày phát hành có ngày 29/02 thì quy định cho Kho bạc dùng 366 ngày thay vì 365, và con số của Kho bạc cao hơn dòng đó đúng 366/365 lần — với tín phiếu mặc định là 5,1484% thay vì 5,1343%, tức lệch 0,0141 điểm phần trăm. Công cụ cố ý không nhận ngày phát hành nên luôn tính trên 365 ngày; nếu bạn đang đối chiếu với một kết quả đấu giá rơi vào năm nhuận, hãy nhân con số ở đây với 366/365. Chỉ từ 183 ngày trở lên Kho bạc mới dùng biểu thức bậc hai, và ở đó trang này nói rõ điều đó thay vì gán tên gọi của Kho bạc cho con số của mình.",
      },
      {
        q: "Nếu bán trước khi đáo hạn thì sao?",
        a: "Công cụ này giả định giữ đến đáo hạn, khi đó lợi nhuận đã biết chắc từ lúc mua. Bán trước đáo hạn phải bán theo giá thị trường, phụ thuộc lãi suất tại thời điểm bán: lãi suất tăng thì tín phiếu đang giữ mất giá, và bạn có thể lỗ. Kỳ hạn ngắn khiến mức lỗ đó nhỏ, nhưng không phải bằng 0 — đó là lý do người ta nói tín phiếu kho bạc không có rủi ro tín dụng, chứ không nói là không có rủi ro.",
      },
    ],
  },
} as const;
