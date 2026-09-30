// Copy for /cong-cu/vay-mua-nha/'s learning panel — the 2026-09-28 A2 pilot
// (docs/tools-visual-education-plan-2026-09-28.md). Every figure these
// sentences carry is filled in from real `computeLoan` results — the month
// read off `result.schedule`, or the result before and after one press —
// never predicted. Sentences round to triệu/tỷ ("khoảng"); the exact đồng sit
// in a disclosure. Nothing here calls a loan affordable, safe or approved.

export const MORTGAGE_LEARNING = {
  title: "Hiểu khoản vay qua từng tháng",
  intro:
    "Mỗi khoản trả gồm tiền gốc làm dư nợ giảm và tiền lãi là chi phí của việc vay. Chọn một tháng để xem, rồi thử đổi một điều kiện.",
  basisSample: "Đang xem trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang xem trên các số bạn đã nhập.",

  month: {
    heading: "Một tháng trong lịch trả nợ",
    /** The range's visible label. */
    label: "Chọn tháng",
    /** "Tháng 1 trên 240" — the range's value, said and shown. */
    position: "Tháng {month} trên {months}",
    single: "Khoản vay này tất toán trong đúng một tháng, nên chỉ có một kỳ để xem.",
    payment: "Gốc và lãi tháng này",
    principal: "Tiền gốc (làm dư nợ giảm)",
    principalWithExtra: "Tiền gốc, đã gồm phần trả thêm",
    interest: "Tiền lãi (chi phí vay)",
    balance: "Dư nợ còn lại sau tháng này",
    /** Beside the split: what it is not. */
    excludes: "Chỉ gồm gốc và lãi; chưa gồm thuế, bảo hiểm, phí và PMI nếu có.",
    splitLabel: "Tỷ lệ gốc và lãi trong tháng {month}",
    /** One sentence from the month's own figures. */
    reading:
      "Trong tháng {month}, khoảng {principalShare}% số tiền trả vào gốc, phần còn lại là lãi.",
    readingNoInterest: "Tháng {month} không có tiền lãi: toàn bộ số tiền trả vào gốc.",
    none: "Chưa có lịch trả nợ để xem. Hãy sửa các ô đang báo lỗi.",
  },

  trialsHeading: "Thử một thay đổi",
  trials: {
    term: {
      /** The button's whole name. `{step}` is "5 năm" or "60 tháng", per unit. */
      label: "Kéo dài kỳ hạn thêm {step}",
      field: "Kỳ hạn",
      lesson: "Kỳ hạn dài làm khoản trả mỗi tháng nhỏ lại nhưng có thể làm tổng lãi tăng.",
      question: "Với số của bạn, khoản tháng nhẹ hơn có đáng với phần lãi tăng thêm không?",
    },
    extra: {
      label: "Trả thêm 1 triệu mỗi tháng",
      field: "Trả thêm mỗi tháng",
      lesson: "Chỉ tiền gốc làm dư nợ giảm; trả thêm vào gốc giúp trả xong sớm hơn.",
      question: "Mỗi tháng bạn có để ra được thêm khoản này mà vẫn giữ quỹ dự phòng không?",
    },
  },
  termStepYears: "5 năm",
  termStepMonths: "60 tháng",
  /** The term's unit in a sentence: "20 năm → 25 năm". */
  unitWords: { years: "năm", months: "tháng" },
  undo: "Hoàn tác lần thử",
  undoNone: "Chưa có lần thử nào để hoàn tác.",
  openForm: "Nhập số của bạn",

  blocked: {
    invalid: "Chưa thử được: có ô nhập đang báo lỗi. Sửa ô đó rồi thử lại.",
    unrepresentable:
      "Chưa thử được với con số đang nhập ở ô này: số quá lớn hoặc có quá nhiều chữ số thập phân.",
    termMax: "Chưa thử được: kỳ hạn mới quy ra tháng sẽ vượt 1.200 tháng (100 năm) — giới hạn công cụ hỗ trợ.",
  },

  impact: {
    heading: "Kết quả lần thử",
    fieldLine: "{field}: {before} → {after}",
    paymentLine: "Gốc và lãi tháng đầu (theo lịch thực tế): khoảng {before} → {after}",
    interestLine: "Tổng lãi cả khoản vay: khoảng {before} → {after}",
    monthsLine: "Trả xong sau: {before} tháng → {after} tháng",
    barsTitle: "Tổng lãi trước và sau lần thử",
    /** Board 03: payoff length on one time axis, and the named difference. */
    timelineTitle: "Thời gian trả nợ",
    deltaSooner: "Trả xong sớm hơn {months} tháng",
    deltaLater: "Trả lâu thêm {months} tháng",
    deltaSame: "Thời gian trả không đổi",
    compareTitle: "So với trước lần thử",
    compareFirst: "Khoản trả tháng đầu",
    compareInterest: "Tổng lãi cả khoản vay",
    compareBefore: "Trước",
    compareAfter: "Sau",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
    barBefore: "Trước khi thử",
    barAfter: "Sau khi thử",
    exactTitle: "Xem số chính xác (đồng)",
    exactCaption: "Số chính xác trước và sau lần thử",
    exactItem: "Khoản",
    exactBefore: "Trước",
    exactAfter: "Sau",
    exactPayment: "Gốc và lãi tháng đầu",
    exactInterest: "Tổng lãi",
    exactMonths: "Số tháng thực tế",
    monthsUnit: "tháng",
  },

  why: {
    termLonger:
      "Kỳ hạn dài hơn chia tiền gốc cho nhiều tháng hơn, nên gốc và lãi tháng đầu giảm khoảng {payment}. Nợ được trả chậm hơn nên lãi tính trên dư nợ lâu hơn: tổng lãi tăng khoảng {interest}.",
    termNoInterest:
      "Với lãi suất 0% không có tiền lãi, nên kéo dài kỳ hạn chỉ làm khoản trả mỗi tháng nhỏ lại và thời gian trả dài thêm; tổng lãi vẫn là 0.",
    extraSooner:
      "Mỗi tháng trả thêm vào gốc nên dư nợ giảm nhanh hơn: trả xong sớm hơn {months} tháng và tổng lãi giảm khoảng {interest}. Đổi lại, tiền gốc và lãi tháng đầu tăng khoảng {payment}.",
    extraNoInterest:
      "Với lãi suất 0% không có tiền lãi để tiết kiệm; trả thêm chỉ làm nợ hết sớm hơn {months} tháng.",
    unchanged: "Với các số hiện tại, thay đổi này không làm khoản trả, tổng lãi hay thời gian trả dịch chuyển.",
    changedOther:
      "Các con số đã đổi theo lịch trả nợ mới. Xem số chính xác bên dưới.",
  },

  /** Always visible in the panel: the conditions every figure above rests on. */
  limits:
    "Giả định lãi suất không đổi suốt kỳ hạn. Phần lãi giảm nhờ trả thêm là con số trước phí trả nợ trước hạn, nếu hợp đồng có thu.",

  /**
   * "Thước tháng" — the monthly payment ruler. One month's loop, from one row
   * of the schedule: debt before → interest measured on it → payment minus
   * interest is principal → debt after → next month's interest. Scrubbing the
   * month is LOOKING at another row, never making a payment. Figures in the
   * sentences are rounded ("khoảng"); the exact đồng are in the disclosure.
   */
  scene: {
    title: "Tháng {month}: khoản trả đi đâu",
    // --- board 02 (approved living infographic, 2026-09-29) -----------------
    /** The text-free 3D miniature is context only; nothing is written on it. */
    artAlt: "Hình minh họa 3D một ngôi nhà phố nhỏ mái ngói, một chiếc ví màu xanh và một tờ giấy trống.",
    headline: "Khoảng {payment} / tháng",
    headlineAnnuity: "Chỉ gồm gốc và lãi, trả đều theo lịch.",
    headlineFlat: "Chỉ gồm gốc và lãi; trả gốc đều nên khoản trả giảm dần.",
    headlineFinal: "Kỳ cuối: chỉ trả nốt số nợ còn lại, có thể nhỏ hơn.",
    principalMeaning: "Gốc làm số nợ giảm",
    interestMeaning: "Lãi là chi phí vay",
    extraMeaning: "Trả thêm vào gốc",
    debtAfterLine: "Còn nợ sau tháng {month}: khoảng {after}",
    // --- the compact core, visible before any interaction ------------------
    debtLabel: "Dư nợ",
    /** "2.000,0 triệu → 1.996,8 triệu": before and after this month. */
    debtChange: "{before} → {after}",
    measureShort: "Lãi tính trên dư nợ đầu tháng, khoảng {rate} mỗi tháng",
    paymentShortAnnuity: "Khoản trả khoảng {payment} (trả đều)",
    paymentShortFlat: "Khoản trả khoảng {payment} (gốc đều, giảm dần)",
    paymentShortFinal: "Khoản trả khoảng {payment} (kỳ cuối, có thể nhỏ hơn)",
    effectShort: "Chỉ phần gốc làm dư nợ giảm. Lãi là chi phí vay.",
    nextShort: "Tháng {nextMonth}: lãi tính trên dư nợ mới, khoảng {nextInterest}.",
    finalShort: "Kỳ cuối: sau kỳ này hết nợ, không còn lãi.",
    roundedNote: "Số đã làm tròn; số chính xác ở phần Hiểu thêm.",
    moreTitle: "Hiểu thêm về hình này",
    // --- the optional explanation, collapsed below the try buttons ----------
    /** The debt stock, at a point in time. Its own axis: the original loan. */
    debtBefore: "Dư nợ trước kỳ trả tháng {month}",
    debtAfter: "Còn nợ sau kỳ",
    debtCut: "Giảm đúng bằng phần gốc",
    debtScale: "Thanh đầy là số vay ban đầu {opening}. Đây là số tiền còn nợ tại một thời điểm.",
    /** Only when the true-scale cut is too thin to see; nothing is magnified. */
    debtTiny: "Phần giảm tháng này rất nhỏ so với cả khoản nợ nên gần như không thấy trên thanh; hình không phóng to.",
    /** The measuring step between the debt and the payment. */
    measure: "Lãi của một tháng tính trên dư nợ đầu tháng, theo lãi suất năm chia 12 (khoảng {rate} mỗi tháng); tháng này khoảng {interest}. Việc tính lãi không làm dư nợ đổi.",
    /** The payment flow, this month only. */
    paymentAnnuity: "Khoản trả tháng {month}: {payment} (khoản trả đều theo lịch)",
    paymentFlat: "Khoản trả tháng {month}: {payment} (trả gốc đều; lãi giảm dần nên khoản trả giảm dần)",
    paymentFinal: "Khoản trả tháng {month}: {payment} (kỳ cuối: chỉ trả nốt số nợ còn lại, có thể nhỏ hơn các tháng trước)",
    interestLabel: "Lãi",
    principalLabel: "Gốc",
    extraLabel: "Trả thêm gốc",
    paymentScale:
      "Cả thanh khoản trả là 100% số tiền trả trong tháng {month} ({payment}); mỗi phần là tỷ lệ của số đó.",
    /** The debt strip's two fills, named right under it. */
    debtLegendAfter: "Còn nợ",
    debtLegendCut: "Gốc vừa trả",
    debtEarlier: "Phần trống còn lại cuối thanh (nếu có) là tiền gốc đã trả ở các tháng trước.",
    /** The effect, and the cost. */
    effect: "Chỉ phần gốc {principal} được trừ vào dư nợ. Phần lãi {interest} là chi phí của việc vay, không làm nợ giảm.",
    effectExtra: "Phần gốc {principal} gồm {extra} trả thêm, được trừ vào dư nợ một lần.",
    /** Next month, measured on the new debt. */
    /** While a press holds, against the same month before it. */
    compareNowSame: "So với trước lần thử: lãi tháng này không đổi.",
    compareNowLower: "So với trước lần thử: lãi tháng này thấp hơn khoảng {amount}.",
    compareNowHigher: "So với trước lần thử: lãi tháng này cao hơn khoảng {amount}.",
    compareNextSame: "Lãi tháng sau không đổi.",
    compareNextLower: "Lãi tháng sau thấp hơn khoảng {amount}.",
    compareNextHigher: "Lãi tháng sau cao hơn khoảng {amount}.",
    ghostNote: "Vạch đậm trên thanh nợ là số còn nợ sau cùng tháng này trước lần thử gần nhất.",
    /** Past the earlier schedule's payoff: nothing to compare, and it says so. */
    referencePaidOff: "Trước lần thử, khoản vay đã trả xong ở tháng {month}; tháng này không có khoản trả để so.",
    /** The optional step-through: highlight, nothing moves by itself. */
    stepsLegend: "Xem từng bước",
    walk: {
      debt: "1. Dư nợ",
      measure: "2. Đo lãi",
      principal: "3. Gốc trừ nợ",
      next: "4. Tháng sau",
    },
    /** Exact đồng, collapsed; the equation holds here, to the đồng. */
    exactTitle: "Xem số chính xác tháng này (đồng)",
    exactDebtBefore: "Dư nợ trước kỳ",
    exactInterest: "Lãi",
    exactPayment: "Khoản trả",
    exactPrincipal: "Gốc (khoản trả trừ lãi)",
    exactExtra: "Trong đó trả thêm",
    exactDebtAfter: "Dư nợ sau kỳ (trước kỳ trừ gốc)",
    exactRounding: "Mỗi số làm tròn đến đồng, nên phép trừ có thể lệch 1 đồng.",
    /** Short visible step labels; each button's full name is its aria-label. */
    steps: {
      first: { short: "« Đầu", name: "Xem tháng đầu" },
      prev: { short: "‹ Trước", name: "Xem tháng trước" },
      next: { short: "Sau ›", name: "Xem tháng sau" },
      last: { short: "Cuối »", name: "Xem tháng cuối" },
    },
    monthLabel: "Xem tháng",
    unknown: "Chưa vẽ được: có ô nhập đang báo lỗi. Sửa ô đó để xem lại lịch trả nợ.",
    fix: "Tới ô cần sửa",
  },
} as const;
