// Copy for /cong-cu/vay-mua-nha/ — the loan / mortgage calculator.
//
// Original FinHome copy. The arithmetic is standard finance; none of the
// wording is copied from any third-party reference tool.
//
// Two honesty notes are load-bearing here and must not be trimmed:
//
// 1. `floatingRateNotice` — the tool models a FIXED rate for the whole term.
//    Vietnamese home loans almost always carry a promotional rate for the
//    first 6–24 months and then float, so a real borrower's instalment RISES
//    after the promotional period. Showing a flat 20-year payment without
//    saying so would understate what somebody actually pays.
// 2. `pmiNotice` — PMI is a United States mortgage construct. The fields exist
//    for parity with the reference tool; Vietnamese lenders do not charge it.

export const LOAN = {
  slug: "/cong-cu/vay-mua-nha",

  pageTitle: "Tính khoản vay mua nhà: trả bao nhiêu mỗi tháng?",
  metaTitle: "Tính khoản vay mua nhà — Trả hằng tháng & bảng trả nợ",
  metaDescription:
    "Nhập số tiền vay, lãi suất và kỳ hạn để biết số tiền phải trả mỗi tháng, tổng lãi và bảng trả nợ từng năm. Công cụ miễn phí của FinHome.",

  // One line. The longer explanation is `ledeDetail`, behind a disclosure —
  // the browser check found the first input 1067 px down a 390 px viewport,
  // most of it heading and intro prose.
  lede: "Nhập ba con số để biết mỗi tháng bạn cần chuẩn bị bao nhiêu.",
  ledeDetailTitle: "Công cụ này cho bạn những gì",
  ledeDetail:
    "Khoản trả hằng tháng theo lịch, tổng tiền thực sự rời khỏi ví nếu bạn trả thêm gốc, tổng lãi cả kỳ hạn, biểu đồ gốc và lãi theo từng kỳ, và bảng trả nợ từng năm. Bạn chọn được cách trả góp đều hoặc trả gốc đều, và thêm các chi phí kèm theo nếu muốn.",

  form: {
    loanGroup: "Khoản vay",
    amountLabel: "Số tiền vay",
    amountUnit: "₫",
    amountHelp: "Nhập số tiền vay, ví dụ 2.000.000.000.",
    amountInvalid: "Vui lòng nhập số tiền vay lớn hơn 0.",
    defaultAmount: "2.000.000.000",

    rateLabel: "Lãi suất",
    rateUnit: "%/năm",
    rateHelp: "Lãi suất danh nghĩa hằng năm, ví dụ 8,5.",
    rateInvalid: "Vui lòng nhập lãi suất từ 0 trở lên.",
    defaultRate: "8,5",

    termLabel: "Kỳ hạn",
    termHelp: "Thời gian vay. Kỳ hạn phổ biến ở Việt Nam là 15–25 năm.",
    termInvalid: "Vui lòng nhập kỳ hạn là số nguyên lớn hơn 0.",
    defaultTerm: "20",
    termUnitLabel: "Đơn vị kỳ hạn",
    termUnitYears: "Năm",
    termUnitMonths: "Tháng",
    defaultTermUnit: "years",

    extraLabel: "Trả thêm mỗi tháng",
    extraUnit: "₫",
    extraHelp: "Số tiền trả thêm vào gốc mỗi tháng. Để trống nếu không có.",
    extraInvalid: "Số tiền trả thêm không được là số âm.",
    defaultExtra: "0",

    // Original row 0 asks the first screen to be số tiền vay / lãi suất / kỳ
    // hạn plus cách trả nợ. Paying extra is a real question but it is the
    // SECOND one, so it moved behind its own disclosure — which names the
    // active amount on its own summary line, so a collapsed panel can never
    // be the silent reason the schedule is shorter than the kỳ hạn typed
    // above it.
    extraPanelTitle: "Trả thêm để rút ngắn khoản vay (tùy chọn)",
    extraPanelSummary:
      "Chưa có khoản trả thêm nào. Mở ra nếu mỗi tháng bạn định trả thêm vào gốc.",

    methodLegend: "Cách trả nợ",
    methodHelp:
      "Trả góp đều giữ số tiền mỗi tháng không đổi. Trả gốc đều trả cùng một phần gốc mỗi tháng, nên tháng đầu nặng nhất rồi nhẹ dần — tổng lãi thấp hơn nhưng tháng đầu cao hơn. Hãy hỏi ngân hàng bạn đang được áp dụng cách nào.",
    methodAnnuity: "Trả góp đều (số tiền mỗi tháng không đổi)",
    methodFlatPrincipal: "Trả gốc đều (gốc chia đều, lãi trên dư nợ)",
    defaultMethod: "annuity",

    advancedTitle: "Chi phí kèm theo và thiết lập nâng cao",
    costGroup: "Chi phí kèm theo",
    taxLabel: "Thuế nhà đất mỗi năm",
    taxUnit: "₫",
    taxHelp: "Để 0 nếu không áp dụng.",
    insuranceLabel: "Bảo hiểm mỗi năm",
    insuranceUnit: "₫",
    insuranceHelp: "Bảo hiểm khoản vay hoặc bảo hiểm tài sản, mỗi năm.",
    otherFeeLabel: "Phí khác mỗi năm",
    otherFeeUnit: "₫",
    otherFeeHelp: "Ví dụ phí quản lý chung cư, mỗi năm.",
    costInvalid: "Chi phí không được là số âm.",

    pmiGroup: "Bảo hiểm khoản vay (PMI)",
    pmiLabel: "Tỷ lệ PMI",
    pmiUnit: "%/năm",
    pmiHelp: "Tính theo phần trăm số tiền vay mỗi năm. Để 0 nếu không áp dụng.",
    pmiInvalid: "Tỷ lệ PMI không được là số âm.",
    priceLabel: "Giá bất động sản",
    priceUnit: "₫",
    priceHelp: "Chỉ cần khi bạn chọn dừng PMI ở mốc 80%.",
    pmiModeLegend: "Thời gian thu PMI",
    pmiModeUntil80: "Dừng khi dư nợ còn 80% giá bất động sản",
    pmiModeLife: "Thu suốt kỳ hạn vay",
    defaultPmiMode: "until80",

    resultTitle: "Mỗi tháng bạn cần chuẩn bị",
    // Renamed from "Tổng trả hằng tháng", which was wrong whenever the
    // borrower was also paying extra: the page reported 17.356.465 ₫ as the
    // monthly total while the schedule had already been shortened by a
    // 2.000.000 ₫ monthly extra that the borrower was, in fact, paying.
    // Three separate lines now, and the sum is the one labelled as the sum.
    monthlyPaymentLabel: "Ngân hàng thu hằng tháng",
    extraRowLabel: "Bạn trả thêm vào gốc",
    plannedOutflowLabel: "Tổng tiền ra khỏi ví mỗi tháng",
    finalMonthLabel: "Tháng cuối (tháng {n}) chỉ còn",
    finalMonthHelp:
      "Tháng cuối thường nhỏ hơn các tháng trước, vì chỉ còn đúng phần dư nợ còn lại chứ không phải một kỳ trả đủ.",
    // The headline label when the loan clears before any full month is paid.
    // The browser check's requirement: headline the actual capped outflow,
    // never a full month that does not happen.
    singlePayoffLabel: "Tổng tiền ra khỏi ví (trả một lần)",
    singleMonthNotice:
      "Với số tiền trả thêm này, khoản vay tất toán ngay trong tháng đầu. Con số ở trên là số thực tế phải chuẩn bị cho lần trả duy nhất đó, không phải một kỳ trả đủ.",

    // Two groups, not one. The browser check found "Tháng cuối … 9.549.208"
    // sitting directly above "Trong đó gốc và lãi 17.356.465", which read as a
    // component larger than its total. They are not the same scope: one is a
    // month of the schedule, the other a slice of the monthly bill. Separate
    // headings, and every label now says which schedule it belongs to.
    detailTitle: "Xem chi tiết khoản vay",
    detailHint:
      "Cấu phần của khoản trả, lịch trả nợ và bảng từng năm. Không cần xem để có câu trả lời ở trên.",

    breakdownTitle: "Khoản trả hằng tháng gồm những gì",
    principalInterestLabel: "Gốc và lãi",
    escrowLabel: "Thuế, bảo hiểm và phí",
    pmiMonthlyLabel: "PMI",

    scheduleTitle: "Lịch trả nợ",
    termResultLabel: "Số tháng thực tế",
    firstYearLabel: "Tiền ra trong {n} tháng đầu",
    firstYearHelp:
      "Cộng từ đúng các tháng có thật trong lịch, không phải lấy một tháng nhân 12 — với cách trả gốc đều hoặc khi trả xong sớm, hai con số đó khác nhau.",
    annualisedLabel: "Một tháng đủ nhân 12",
    referenceFinalLabel: "Kỳ trả cuối theo lịch gốc (chưa tính trả thêm)",
    actualFinalLabel: "Gốc và lãi ở tháng cuối thực tế",
    totalInterestLabel: "Tổng lãi phải trả",
    totalPaymentLabel: "Tổng số tiền phải trả",
    mortgageConstantLabel: "Hệ số khoản vay",

    // No fee range: this task verified none, and a made-up "1–3%" reads as a
    // fact about Vietnamese contracts. What is true is that the tool does not
    // model the fee and that the contract decides it.
    prepaymentFeeNotice:
      "Công cụ chưa tính phí trả nợ trước hạn, nên khoản lãi tiết kiệm được ở trên là con số TRƯỚC phí. Mức phí và thời gian áp dụng do hợp đồng của bạn quy định, và có hợp đồng không thu. Hãy đọc điều khoản hoặc hỏi ngân hàng rồi tự trừ đi.",

    extraResultTitle: "Nếu trả thêm mỗi tháng",
    interestSavingLabel: "Tiền lãi tiết kiệm được",
    monthsSavedLabel: "Trả xong sớm hơn",
    monthsUnit: "tháng",

    invalidSummary:
      "Vui lòng kiểm tra lại các số đã nhập — chưa thể tính được khoản vay.",
  },

  table: {
    caption: "Bảng trả nợ theo từng năm",
    intro:
      "Mỗi dòng là một năm. Ở những năm đầu, phần lớn số tiền bạn trả là lãi; càng về sau tỷ lệ trả gốc càng tăng.",
    yearColumn: "Năm",
    interestColumn: "Lãi trả trong năm",
    principalColumn: "Gốc trả trong năm",
    balanceColumn: "Dư nợ cuối năm",
  },

  // Concise and above the form, because a borrower needs it before reading a
  // 20-year instalment. Two words changed on purpose: the payment MAY change,
  // not WILL rise — nothing here knows the reader's contract or where a base
  // rate goes. The longer explanation sits behind a disclosure.
  floatingRateNotice:
    "Công cụ giả định lãi suất không đổi suốt kỳ hạn. Nếu hợp đồng của bạn có lãi ưu đãi rồi thả nổi, khoản trả có thể thay đổi khi hết ưu đãi — hãy hỏi ngân hàng mức lãi sau ưu đãi và tính lại với mức đó.",

  // ORIGINAL ROW 11 asks for the after-promotion view to be a PROMINENT
  // connected mode of the mortgage tool. The notice already said the payment
  // may change; a reader then had to find the other tool themselves. The route
  // is now in the notice, named for what it does — and it says plainly that
  // opening it is a new page with nothing carried over, because it is.
  floatingRateLinkLabel:
    "Mở công cụ sau ưu đãi: nhập mức lãi mới, hoặc thử kịch bản +1/+2/+3 điểm %",
  floatingRateLinkNote:
    "Đó là một trang khác. Số bạn đang nhập ở đây KHÔNG được chuyển sang — trang này không lưu và không gửi gì đi, nên hãy nhập lại số tiền vay, kỳ hạn và lãi suất.",

  floatingRateDetailTitle: "Vì sao điều này quan trọng",
  floatingRateDetail:
    "Nhiều hợp đồng vay mua nhà áp dụng một mức lãi ưu đãi trong giai đoạn đầu, sau đó chuyển sang lãi thả nổi theo lãi suất cơ sở của ngân hàng cộng biên độ. Khi đó khoản trả được tính lại và có thể cao hơn, thấp hơn hoặc gần như không đổi, tùy lãi suất cơ sở lúc ấy và tùy cách hợp đồng quy định. Công cụ này không dự báo được điều đó. Cách dùng thực tế: chạy một lần với mức ưu đãi, một lần với mức lãi cao hơn mà bạn vẫn trả được, và lấy mức giá thấp hơn trong hai lần. Công cụ “Khoản vay lãi thả nổi” cho bạn thử từng mốc đổi lãi.",

  pmiNotice:
    "PMI (private mortgage insurance) là loại bảo hiểm khoản vay theo quy định của Hoa Kỳ. Các trường này có để đối chiếu với công cụ tham khảo; ngân hàng tại Việt Nam không thu PMI. Nếu bạn vay trong nước, hãy để tỷ lệ PMI bằng 0.",

  // PMI is out of the Vietnamese first-form flow now — it sits inside its own
  // clearly-marked international panel, behind the advanced disclosure. The
  // fields are kept rather than deleted because the tool is also used for
  // United States loans, and because deleting an input silently changes a
  // result somebody may have bookmarked. The audit's objection was to PMI
  // being FOUR default-visible fields on a page whose own copy says PMI does
  // not apply here, not to it existing.
  pmiGroupTitle: "Bảo hiểm khoản vay theo quy định Hoa Kỳ (PMI)",

  chart: {
    title: "Mỗi kỳ bạn trả bao nhiêu lãi, bao nhiêu gốc",
    interest: "Lãi",
    principal: "Gốc",
    balance: "Dư nợ còn lại",
    yearTick: "Năm {n}",
    monthTick: "Tháng {n}",
    xAxisYear: "Năm thứ",
    xAxisMonth: "Tháng thứ",
    yAxis: "Gốc và lãi mỗi kỳ ({unit})",
    overlayAxis: "Dư nợ còn lại ({unit})",
    summaryYear:
      "Trong {periods} năm, bạn trả {interest} tiền lãi và {principal} tiền gốc. Cột càng về sau càng nhiều gốc, vì lãi tính trên dư nợ đang giảm.",
    summaryMonths:
      "Trong {window} tháng đầu, bạn trả {interest} tiền lãi và chỉ {principal} tiền gốc — đây là lý do dư nợ gần như không giảm trong giai đoạn này.",
    extraNote: "Biểu đồ đã tính cả khoản trả thêm của bạn.",
    methodAnnuity: "Cách trả: trả góp đều.",
    methodFlatPrincipal: "Cách trả: trả gốc đều.",
    assumptions: [
      "Lãi suất giữ nguyên suốt kỳ hạn. Khoản vay mua nhà tại Việt Nam thường chỉ ưu đãi 6–24 tháng đầu rồi thả nổi.",
      "Chưa tính phí trả nợ trước hạn, phí giải ngân và bảo hiểm khoản vay.",
      "Số liệu trên biểu đồ và trong bảng là cùng một phép tính, chỉ khác độ chính xác hiển thị.",
    ],
    tableCaption: "Gốc, lãi và dư nợ theo từng kỳ",
    periodColumn: "Kỳ",
    unavailableReason:
      "Chưa vẽ được biểu đồ vì các số đã nhập chưa tạo thành một khoản vay.",
    unavailableRecovery:
      "Hãy kiểm tra số tiền vay, lãi suất và kỳ hạn — mỗi ô đều có hướng dẫn riêng ngay bên dưới.",
    granularityLegend: "Xem biểu đồ theo",
    granularityYear: "Từng năm",
    granularityMonths: "24 tháng đầu",
    granularityHelp:
      "Xem theo năm để thấy toàn bộ kỳ hạn; xem 24 tháng đầu để thấy rõ vì sao giai đoạn đầu gần như chỉ trả lãi.",
  },

  formula: {
    title: "Công thức tính",
    body: [
      "Khoản trả gốc và lãi hằng tháng được tính theo công thức niên kim: A = P × r ÷ (1 − (1 + r)^(−n)), trong đó P là số tiền vay, r là lãi suất mỗi tháng (lãi suất năm chia 12 rồi chia 100) và n là số tháng vay.",
      "Mỗi tháng, tiền lãi bằng dư nợ đầu kỳ nhân lãi suất tháng; phần còn lại của khoản trả được dùng để giảm gốc. Vì dư nợ giảm dần nên tiền lãi giảm dần và phần trả gốc tăng dần, dù tổng số tiền trả mỗi tháng không đổi.",
      "Khi bạn trả thêm vào gốc, dư nợ giảm nhanh hơn nên tổng tiền lãi giảm và kỳ hạn được rút ngắn. Công cụ tính cả hai trường hợp rồi lấy phần chênh lệch.",
    ],
    // The one relationship this page's readers most often invert: the
    // instalment is level, the split inside it is not. Editor-selected, not
    // an algorithm — see `lib/prose-emphasis.ts`.
    emphasis: [
      "tiền lãi giảm dần và phần trả gốc tăng dần, dù tổng số tiền trả mỗi tháng không đổi",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao số tiền trả hằng tháng không đổi nhưng tiền lãi lại giảm?",
        a: "Vì cách tính theo niên kim: tổng khoản trả mỗi tháng được giữ cố định, nhưng bên trong đó tỷ lệ giữa gốc và lãi thay đổi. Tiền lãi luôn tính trên dư nợ còn lại, nên khi dư nợ giảm thì tiền lãi giảm và phần trả gốc tăng tương ứng.",
      },
      {
        q: "Trả thêm mỗi tháng có thực sự tiết kiệm nhiều không?",
        a: "Thường nhiều hơn dự đoán, vì mỗi đồng trả thêm đều làm giảm dư nợ mà lãi được tính trên đó. Hãy thử nhập một khoản trả thêm vào công cụ để thấy phần lãi tiết kiệm được và số tháng rút ngắn. Một điều công cụ chưa tính: phí trả nợ trước hạn. Mức phí và thời gian áp dụng do hợp đồng quy định, nên hãy đọc điều khoản hoặc hỏi ngân hàng trước khi coi khoản tiết kiệm là chắc chắn.",
      },
      {
        q: "Kết quả này có đúng với khoản vay thật của tôi không?",
        a: "Đúng về mặt công thức, nhưng công cụ giả định lãi suất không đổi. Nếu hợp đồng của bạn có lãi ưu đãi rồi thả nổi thì khoản trả sẽ được tính lại khi hết ưu đãi, và con số mới phụ thuộc lãi suất cơ sở lúc đó — công cụ không dự báo được. Hãy tính thử với cả mức ưu đãi và một mức cao hơn mà bạn vẫn trả được, rồi dùng con số thận trọng hơn.",
      },
      {
        q: "Hệ số khoản vay dùng để làm gì?",
        a: "Hệ số khoản vay là tổng số tiền gốc và lãi phải trả trong một năm chia cho số tiền vay ban đầu. Nó cho biết mỗi đồng vay tiêu tốn bao nhiêu đồng mỗi năm, nên tiện để so sánh nhanh giữa các phương án vay có số tiền và kỳ hạn khác nhau.",
      },
    ],
  },
} as const;
