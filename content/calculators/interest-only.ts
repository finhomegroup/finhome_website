// Copy for /cong-cu/chi-tra-lai/ — ÂN HẠN GỐC, combined with a rate reset.
//
// Original FinHome copy. The arithmetic is standard finance, in
// `lib/calc/grace-loan.ts`.
//
// FRAMING CHANGED (original row 14: "Đổi tên theo ân hạn gốc; ghép với thay
// đổi lãi để tránh người dùng phải tính hai lần"). The page used to be called
// "khoản vay chỉ trả lãi … sau ưu đãi", which conflated two different things:
// ân hạn gốc is a period in which no PRINCIPAL is repaid, and the promotional
// rate is a period at a lower RATE. They can be 24 and 12 months, or 24 and 36
// — they are not synonyms, and a reader with both previously had to run two
// tools and stitch the answer together. One schedule now carries both.
//
// Figures quoted below are the module's own output, pinned by
// `grace-loan.test.ts` against an independent recurrence. Defaults: 2 tỷ, 240
// tháng, ân hạn gốc 24 tháng, ưu đãi 7,5%/năm trong 12 tháng rồi 11%/năm.
//
//   tháng 1–12   12.500.000 ₫  (lãi trên 2 tỷ ở 7,5%)
//   tháng 13–24  18.333.333 ₫  (vẫn chỉ lãi, nhưng ở 11%)
//   tháng 25–240 21.300.993 ₫  (bắt đầu trả gốc, 2 tỷ chia 216 tháng)
//   dư nợ cuối tháng 24: 2.000.000.000 ₫ — không giảm một đồng
//   tổng lãi 2.971.014.458 ₫, cao hơn 108.381.135 ₫ so với không ân hạn
//
// NO PRODUCT CLAIM ANYWHERE IN THIS FILE. Grace periods, their lengths and the
// rates are the reader's own entries from their own offer, or a hypothesis they
// are testing. Nothing here says a bank offers, allows or approves any of it.

export const INTEREST_ONLY = {
  slug: "/cong-cu/chi-tra-lai",

  pageTitle: "Ân hạn gốc: hết ân hạn thì khoản trả tăng bao nhiêu?",
  metaTitle: "Tính ân hạn gốc — Khoản trả trước và sau khi bắt đầu trả gốc",
  metaDescription:
    "Tính khoản trả trong thời gian ân hạn gốc, khoản trả khi bắt đầu trả gốc, và cả trường hợp lãi suất đổi ở một mốc khác. Một lịch trả nợ cho cả hai thay đổi. Công cụ miễn phí của FinHome.",

  lede:
    "Trong thời gian ân hạn gốc bạn chỉ trả lãi, nên dư nợ không giảm một đồng.",
  ledeDetailTitle: "Vì sao cần tính cả hai mốc cùng lúc",
  ledeDetail:
    "Ân hạn gốc và ưu đãi lãi suất là HAI thứ khác nhau và thường hết ở hai thời điểm khác nhau: ví dụ ân hạn 24 tháng nhưng ưu đãi chỉ 12 tháng. Khoản trả của bạn vì thế đổi hai lần — một lần khi hết ưu đãi, một lần nữa khi bắt đầu trả gốc — và mỗi lần đổi đều tính lại trên dư nợ còn lại trong số tháng còn lại. Công cụ này dựng đúng một lịch trả nợ cho cả hai mốc, để bạn không phải tính hai lần rồi tự ghép lại.",

  // MODEL-SPECIFIC. The shared notice says the rate is assumed constant; this
  // page models a reset. The mandatory opening sentence is kept verbatim so
  // `check:markup`'s one-disclaimer contract is unchanged.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa, không phải lời khuyên tài chính và không phải mô tả sản phẩm của bất kỳ ngân hàng nào. Thời gian ân hạn gốc, thời gian ưu đãi và hai mức lãi suất đều là số BẠN nhập từ hợp đồng của mình hoặc từ một giả định bạn muốn thử — không phải dự báo và không phải báo giá. Lãi suất ở đây KHÔNG được giả định không đổi: nó đổi đúng ở mốc bạn nhập. Kết quả chưa trừ thuế, phí, bảo hiểm và lạm phát; mô hình tính lại khoản trả trên dư nợ còn lại trong số tháng còn lại, còn hợp đồng của bạn có thể quy định khác. Hãy đối chiếu điều khoản hợp đồng trước khi quyết định.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Nhập số tiền vay, ví dụ 2.000.000.000.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    termLabel: "Tổng kỳ hạn",
    termHelp:
      "Toàn bộ kỳ hạn vay tính theo tháng, gồm cả thời gian ân hạn gốc. 20 năm là 240 tháng.",
    termInvalid: "Vui lòng nhập số nguyên tháng từ 1 đến 1.200.",
    defaultTerm: "240",

    graceGroup: "Ân hạn gốc",
    graceLabel: "Ân hạn gốc",
    graceUnit: "tháng",
    graceHelp:
      "Số tháng đầu bạn chỉ trả lãi, chưa trả gốc. Nhập 0 nếu khoản vay trả gốc ngay từ tháng đầu. Phải nhỏ hơn tổng kỳ hạn.",
    graceInvalid:
      "Ân hạn gốc phải là số nguyên tháng từ 0 trở lên và nhỏ hơn tổng kỳ hạn.",
    defaultGrace: "24",

    rateGroup: "Lãi suất",
    promoMonthsLabel: "Ưu đãi lãi suất trong",
    promoMonthsUnit: "tháng",
    promoMonthsHelp:
      "Số tháng áp mức lãi ưu đãi. ĐỘC LẬP với ân hạn gốc — hai mốc này thường không trùng nhau. Nhập 0 nếu không có ưu đãi.",
    promoMonthsInvalid:
      "Thời gian ưu đãi phải là số nguyên tháng từ 0 trở lên và nhỏ hơn tổng kỳ hạn.",
    defaultPromoMonths: "12",

    promoRateLabel: "Lãi suất ưu đãi",
    promoRateUnit: "%/năm",
    promoRateHelp: "Mức lãi trong thời gian ưu đãi — con số trên tờ báo giá.",
    promoRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPromoRate: "7,5",

    postRateLabel: "Lãi suất sau ưu đãi",
    postRateUnit: "%/năm",
    postRateHelp:
      "Lãi cơ sở cộng biên độ. Nếu không có ưu đãi thì đây là mức lãi áp cho cả kỳ hạn. Hãy hỏi ngân hàng con số này bằng văn bản.",
    postRateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultPostRate: "11",

    resultTitle: "Khoản trả hằng tháng",
    firstPaymentLabel: "Tháng đầu tiên",
    lastGracePaymentLabel: "Tháng cuối còn ân hạn gốc",
    firstAmortizingLabel: "Tháng đầu tiên phải trả gốc",
    graceJumpLabel: "Mức tăng khi hết ân hạn gốc",

    datesTitle: "Hai mốc của khoản vay này",
    graceEndLabel: "Hết ân hạn gốc ở tháng",
    promoEndLabel: "Hết ưu đãi lãi suất ở tháng",
    balanceAtGraceEndLabel: "Dư nợ khi hết ân hạn gốc",
    balanceAtPromoEndLabel: "Dư nợ khi hết ưu đãi",
    postResetLabel: "Khoản trả sau khi lãi đổi",
    monthsUnit: "tháng",
    // Mounted only when the reset falls inside the grace period, because then
    // there is no third amortizing level and a reader needs to know why.
    resetInGraceNotice:
      "Lãi suất đổi TRONG thời gian ân hạn gốc, nên ở mốc đó khoản trả vẫn là tiền lãi — chỉ là lãi ở mức mới trên nguyên dư nợ. Khoản trả chỉ có phần gốc từ tháng đầu tiên hết ân hạn.",
    resetAfterGraceNotice:
      "Khoản vay này đổi khoản trả HAI lần: một lần khi hết ân hạn gốc và bắt đầu trả gốc, một lần nữa khi hết ưu đãi lãi suất. Cả hai lần đều tính lại trên dư nợ còn lại trong số tháng còn lại.",
    noGraceNotice:
      "Đang để ân hạn gốc bằng 0, nên khoản vay trả gốc ngay từ tháng đầu. Kết quả ở đây trùng khớp với công cụ lãi thả nổi cho cùng bộ số.",

    detailTitle: "Xem chi tiết và từng giai đoạn",
    detailHint:
      "Tổng lãi, phần lãi phát sinh thêm do ân hạn, và bảng khoản trả theo từng giai đoạn.",
    figuresTitle: "Chi tiết",
    totalInterestLabel: "Tổng lãi cả kỳ hạn",
    totalPaidLabel: "Tổng số tiền trả",
    comparableLabel: "Tổng lãi nếu không ân hạn (cùng lộ trình lãi suất)",
    extraInterestLabel: "Phần lãi phát sinh thêm do ân hạn gốc",
    highestPaymentLabel: "Khoản trả cao nhất",
    // Shown when the no-grace comparison cannot be computed for these inputs.
    // "Không so được" and "ân hạn không tốn thêm gì" are hai câu khác nhau.
    comparableUnavailableNotice:
      "Với bộ số này không dựng được khoản vay đối chiếu (cùng lộ trình lãi suất nhưng không ân hạn), nên hai dòng trên để trống. Đó là “chưa so được”, KHÔNG phải “ân hạn không tốn thêm đồng nào”. Thường là do kỳ hạn quá dài đi kèm lãi suất quá cao — hãy thử lại với mức lãi thực tế hơn.",

    table: {
      caption: "Từng giai đoạn của khoản vay",
      phaseColumn: "Tháng",
      rateColumn: "Lãi suất",
      paymentColumn: "Trả hằng tháng",
      interestColumn: "Lãi trong giai đoạn",
      principalColumn: "Gốc trong giai đoạn",
      balanceColumn: "Dư nợ cuối giai đoạn",
      intro:
        "Cột dư nợ là cột đáng xem nhất. Với bộ số mặc định, suốt 24 tháng ân hạn dư nợ vẫn đúng 2.000.000.000 ₫ — không giảm một đồng, dù bạn đã trả 370.000.000 ₫ tiền lãi trong hai năm đó. Toàn bộ số gốc vẫn phải trả, chỉ là trong 216 tháng còn lại thay vì 240, nên khoản trả từ tháng 25 là 21.300.993 ₫ chứ không phải 20.479.346 ₫ như khi không ân hạn.",
    },
  },

  jumpNotice:
    "Ân hạn gốc không xóa nghĩa vụ nào: nó dồn nguyên số gốc vào khoảng thời gian còn lại ngắn hơn. Với bộ số mặc định, khoản trả đi từ 18.333.333 ₫ lên 21.300.993 ₫ ở tháng 25 — và tổng lãi cao hơn 108.381.135 ₫ so với cùng khoản vay, cùng lộ trình lãi suất, nhưng trả gốc ngay từ đầu.",
  jumpDetailTitle: "Con số nào đáng hỏi trước khi ký",
  jumpDetail:
    "Hãy hỏi ba con số, không phải một: khoản trả trong thời gian ân hạn, khoản trả ngay sau khi hết ân hạn, và khoản trả sau khi hết ưu đãi lãi suất — vì hai mốc đó có thể không trùng nhau. Ân hạn gốc hợp lý khi bạn có lý do cụ thể cần dòng tiền thấp trong giai đoạn đầu: đang trả tiền thuê nhà song song, đang hoàn thiện nội thất, hoặc dự định bán tài sản trước khi hết ân hạn. Nếu chọn chỉ vì con số đầu tiên trông dễ chịu, đó thường là quyết định đắt — và con số đắt thêm chính là dòng “Phần lãi phát sinh thêm do ân hạn gốc”.",

  paymentChart: {
    title: "Khoản trả trước và sau ân hạn gốc",
    phaseBar: "Tháng {from}–{to}",
    graceSuffix: "(ân hạn gốc)",
    interestSegment: "Lãi",
    principalSegment: "Gốc",
    axis: "Khoản trả mỗi tháng ({unit})",
    summary:
      "Tháng cuối còn ân hạn trả {grace}; từ tháng {month} trả {after} — tăng {jump} mỗi tháng. Cột ân hạn không có phần gốc: toàn bộ khoản trả là tiền lãi.",
    summaryNoGrace:
      "Không có ân hạn gốc, nên khoản trả bắt đầu ngay ở {first} và đã gồm cả phần gốc.",
    scenarioNote:
      "Các mốc và mức lãi ở đây là số bạn nhập, không phải sản phẩm của một ngân hàng cụ thể và không phải dự báo.",
    assumptions: [
      // Exactly what is drawn: the FIRST month of each stretch. Saying "một
      // tháng trong giai đoạn" would be wrong for a later amortizing month —
      // the total payment holds but the gốc/lãi split keeps moving inside it.
      "Mỗi cột là khoản trả của THÁNG ĐẦU trong giai đoạn đó, tách thành lãi và gốc. Trong giai đoạn trả gốc, tổng khoản trả giữ nguyên nhưng tỷ lệ lãi–gốc bên trong đổi dần từng tháng, nên cột này là ảnh của tháng đầu chứ không phải của cả giai đoạn.",
      "Trong thời gian ân hạn gốc, phần gốc bằng 0 nên cột chỉ có một mảng.",
      "Ở mỗi mốc đổi, khoản trả được tính lại trên dư nợ còn lại trong số tháng còn lại. Đây là cách công cụ mô hình hóa và là cách phổ biến với khoản vay trả góp đều; hợp đồng của bạn có thể quy định khác.",
    ],
    tableCaption: "Khoản trả theo từng giai đoạn",
    phaseColumn: "Tháng",
    rateColumn: "Lãi suất",
    paymentColumn: "Trả hằng tháng",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì các số đã nhập chưa tạo thành một khoản vay.",
    unavailableRecovery:
      "Ô đang có lỗi được tô đỏ kèm lời giải thích riêng. Thường là một trong năm ô: số tiền vay, tổng kỳ hạn, ân hạn gốc (phải nhỏ hơn kỳ hạn), thời gian ưu đãi (phải nhỏ hơn kỳ hạn), hoặc một trong hai mức lãi suất.",
  },

  balanceChart: {
    title: "Dư nợ theo thời gian",
    balanceSeries: "Dư nợ còn lại",
    graceMarker: "Tháng {n}: hết ân hạn gốc",
    resetMarker: "Tháng {n}: hết ưu đãi lãi suất",
    xAxis: "Tháng thứ",
    yAxis: "Dư nợ còn lại ({unit})",
    summary:
      "Đường dư nợ nằm ngang suốt thời gian ân hạn: đến hết tháng {month} vẫn còn {balance}, đúng bằng số tiền vay ban đầu. Nó chỉ bắt đầu đi xuống từ tháng sau đó.",
    summaryNoGrace:
      "Dư nợ bắt đầu ở {first} và giảm dần ngay từ tháng đầu, vì không có ân hạn gốc.",
    scenarioNote:
      "Hai mốc trên trục là số bạn nhập; chúng độc lập với nhau và có thể không trùng nhau.",
    assumptions: [
      "Dư nợ được lấy ở cuối mỗi tháng. Đường được lấy mẫu ở các mốc giai đoạn và các tháng cách đều, nên đoạn nằm ngang trong thời gian ân hạn là thật, không phải do lấy mẫu.",
      "Không có lãi nhập gốc trong mô hình này: dư nợ không bao giờ tăng.",
      "Dư nợ kết thúc ở đúng 0 vào tháng cuối của kỳ hạn.",
    ],
    tableCaption: "Dư nợ ở cuối mỗi giai đoạn",
    monthColumn: "Đến hết tháng",
    balanceColumn: "Dư nợ còn lại",
    unavailableReason:
      "Chưa vẽ được đường dư nợ vì các số đã nhập chưa tạo thành một khoản vay.",
    unavailableRecovery:
      "Hãy sửa ô đang báo lỗi ở trên: số tiền vay, tổng kỳ hạn, ân hạn gốc, thời gian ưu đãi hoặc một trong hai mức lãi suất.",
  },

  formula: {
    title: "Cách tính",
    body: [
      "Trong thời gian ân hạn gốc, khoản trả mỗi tháng bằng dư nợ nhân lãi suất tháng đang áp dụng. Vì không trả gốc nên dư nợ giữ nguyên suốt giai đoạn này — và nếu lãi suất đổi trong thời gian ân hạn, khoản trả đổi theo, vẫn trên nguyên số dư nợ đó.",
      "Tháng đầu tiên hết ân hạn, TOÀN BỘ dư nợ còn lại được trả dần trong số tháng còn lại của kỳ hạn theo công thức niên kim thông thường. Với bộ số mặc định: 2 tỷ ở 11% trong 216 tháng cho khoản trả 21.300.993 ₫, trong đó 18.333.333 ₫ là lãi và chỉ 2.967.660 ₫ là gốc.",
      "Ở mỗi mốc lãi suất đổi, khoản trả được tính lại trên dư nợ ĐANG CÓ trong số tháng còn lại. Nếu mốc đó nằm sau khi hết ân hạn thì dư nợ đã giảm phần nào, nên đây là hai phép tính khác nhau chứ không phải một. Ví dụ ân hạn 24 tháng nhưng ưu đãi 36 tháng: tháng 25 tính 2 tỷ ở 7,5% trong 216 tháng ra 16.899.467 ₫; đến tháng 37, dư nợ còn 1.945.353.275 ₫ và được tính ở 11% trong 204 tháng, ra 21.114.488 ₫.",
      "Tổng lãi là tổng phần lãi của mọi tháng trong lịch. Để trả lời “ân hạn đắt thêm bao nhiêu”, công cụ chạy lại CÙNG lộ trình lãi suất với ân hạn bằng 0 rồi lấy phần chênh — chứ không so với một khoản vay lãi cố định mà bạn chưa từng được báo giá.",
      "Tổng số tháng của các giai đoạn luôn đúng bằng kỳ hạn, và dư nợ kết thúc ở đúng 0. Nếu để ân hạn bằng 0, kết quả trùng khớp đến từng đồng với mô hình lãi thả nổi mà công cụ “Khoản vay lãi thả nổi” dùng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Ân hạn gốc và ưu đãi lãi suất có phải một không?",
        a: "Không, và đây là chỗ hay nhầm nhất. Ân hạn gốc là thời gian bạn chưa phải trả GỐC; ưu đãi lãi suất là thời gian bạn được áp mức LÃI thấp hơn. Hai thời hạn này do hợp đồng quy định riêng và thường lệch nhau — ví dụ ân hạn 24 tháng nhưng ưu đãi chỉ 12 tháng, nghĩa là từ tháng 13 bạn vẫn chỉ trả lãi nhưng ở mức lãi mới. Hãy nhập đúng hai con số trong hợp đồng vào hai ô riêng ở trên.",
      },
      {
        q: "Vì sao khoản trả tăng mạnh sau khi hết ân hạn gốc?",
        a: "Vì số gốc không hề giảm trong thời gian ân hạn, nhưng thời gian còn lại để trả gốc đã ngắn đi. Cùng một số tiền gốc chia cho ít tháng hơn thì mỗi tháng phải trả nhiều hơn. Với khoản vay 240 tháng có 24 tháng ân hạn, toàn bộ gốc phải dồn vào 216 tháng còn lại — và nếu đúng lúc đó lãi suất cũng đã hết ưu đãi thì hai tác động cộng lại.",
      },
      {
        q: "Trả lãi trong hai năm ân hạn có làm giảm nợ không?",
        a: "Không một đồng nào. Với bộ số mặc định bạn trả 370.000.000 ₫ trong 24 tháng ân hạn, và dư nợ cuối tháng 24 vẫn đúng 2.000.000.000 ₫. Tiền đó là chi phí sử dụng vốn, không phải phần trả nợ. Đó là lý do đường dư nợ trong biểu đồ nằm ngang suốt giai đoạn đầu.",
      },
      {
        q: "Ân hạn gốc đắt thêm bao nhiêu?",
        a: "Công cụ cho con số ở dòng “Phần lãi phát sinh thêm do ân hạn gốc”. Với bộ số mặc định là 108.381.135 ₫. Phép so sánh giữ nguyên lộ trình lãi suất và chỉ bỏ phần ân hạn, nên phần chênh đó đúng là giá của việc hoãn trả gốc — không lẫn với tác động của việc lãi suất đổi.",
      },
      {
        q: "Khi nào ân hạn gốc là lựa chọn hợp lý?",
        a: "Khi bạn có lý do cụ thể để cần dòng tiền thấp trong giai đoạn đầu và đã kiểm tra được khoản trả sau ân hạn: đang trả tiền thuê nhà song song trong lúc chờ nhận nhà, đang phải chi cho hoàn thiện, hoặc dự định bán tài sản trước khi hết ân hạn. Điều kiện chung cho mọi trường hợp: bạn trả được con số của tháng đầu tiên hết ân hạn, chứ không chỉ con số của tháng đầu tiên.",
      },
    ],
  },
} as const;
