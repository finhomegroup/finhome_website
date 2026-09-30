// Copy for /cong-cu/vay-mua-xe/'s learning panel and debt-balance chart — the
// 2026-09-28 A3 pilot (docs/tools-visual-education-plan-2026-09-28.md). A
// standalone car tool: no home-buying or home-savings framing. Every figure is
// filled in from `autoLoanFormState` before and after one press — never
// predicted — and the payment, the interest and the household month are said
// separately, because they are three different questions.

export const AUTO_LEARNING = {
  title: "Thử một thay đổi",
  intro:
    "Mỗi nút đổi đúng một ô rồi tính lại. Tiền trả trước, khoản trả mỗi tháng và dư nợ là ba phần khác nhau. Đây là mô phỏng, không phải khuyến nghị.",
  basisSample: "Đang thử trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang thử trên các số bạn đã nhập.",

  trials: {
    down: {
      label: "Trả trước thêm 50 triệu",
      field: "Tiền trả trước",
      lesson: "Trả trước nhiều hơn làm số tiền vay nhỏ lại, nhưng bạn cần có sẵn khoản đó lúc mua.",
      question: "Sau khi trả trước thêm, bạn còn giữ được khoản dự phòng cho gia đình không?",
    },
    term: {
      /** `{step}` is "2 năm" or "24 tháng", per the unit selected. */
      label: "Kéo dài kỳ hạn thêm {step}",
      field: "Kỳ hạn",
      lesson: "Kỳ hạn dài làm khoản trả mỗi tháng nhỏ lại nhưng thường làm tổng lãi tăng.",
      question: "Khoản tháng nhẹ hơn có đáng với số tháng trả thêm và phần lãi tăng không?",
    },
    running: {
      label: "Thêm 1 triệu tiền nuôi xe",
      field: "Chi phí vận hành xe",
      lesson: "Chi phí nuôi xe là khoản chi hằng tháng thật, kể cả khi đã trả xong khoản vay.",
      question: "Nếu nuôi xe tốn hơn dự kiến 1 triệu, bạn còn đủ cho các khoản khác không?",
    },
  },
  termStepYears: "2 năm",
  termStepMonths: "24 tháng",
  unitWords: { years: "năm", months: "tháng" },
  undo: "Hoàn tác lần thử",
  undoNone: "Chưa có lần thử nào để hoàn tác.",
  openForm: "Nhập số của bạn",
  /** 2026-09-29 hook order: the form's own heading, below the picture. */
  formHeading: "Nhập số của bạn",
  /** Straight to the running-costs field, which stays in the form. */
  openRunning: "Nhập chi phí vận hành xe",

  blocked: {
    invalid: "Chưa thử được: có ô về xe hoặc khoản vay đang báo lỗi. Sửa ô đó rồi thử lại.",
    downOverPrice:
      "Chưa trả trước thêm 50 triệu được: phần giá xe còn phải vay chỉ còn {left}, nên tiền trả trước sẽ vượt giá xe.",
    noLoan: "Chưa đổi kỳ hạn được: tiền trả trước và xe cũ đã đủ giá xe, không còn khoản vay.",
    budget:
      "Chưa thử được: hãy kiểm tra thu nhập, các khoản chi tháng và các ô về xe để công cụ tính được tháng của bạn.",
    unrepresentable:
      "Chưa thử được với con số đang nhập ở ô này: số quá lớn hoặc có quá nhiều chữ số thập phân.",
    termMax: "Chưa thử được: kỳ hạn mới quy ra tháng sẽ vượt 1.200 tháng (100 năm) — giới hạn công cụ hỗ trợ.",
  },

  impact: {
    heading: "Kết quả lần thử",
    fieldLine: "{field}: {before} → {after}",
    paymentLine: "Khoản trả nợ xe mỗi tháng: khoảng {before} → {after}",
    paymentNone: "Khoản trả nợ xe mỗi tháng: khoảng {before} → không còn khoản vay",
    interestLine: "Tổng lãi cả khoản vay: khoảng {before} → {after}",
    monthsLine: "Trả xong sau: {before} tháng → {after} tháng",
    monthsNone: "Trả xong sau: {before} tháng → không vay",
    budgetLine: "Còn lại mỗi tháng khi có xe: khoảng {before} → {after}",
    /** When the reader has not entered running costs. */
    budgetRunningExcluded: "Chưa gồm chi phí vận hành xe, vì ô đó đang là 0.",
    /** Essentials blank: no remainder is invented. */
    budgetLimited:
      "Chưa nhập chi phí sinh hoạt thiết yếu, nên công cụ chưa tính phần còn lại mỗi tháng.",
    budgetUnknown: "Chưa đủ số về ngân sách tháng để so phần còn lại.",
    statusLine: "Kết luận: {before} → {after}",
    said: "{trial}: {field} từ {before} thành {after}. {change}",
    changeDown: "Khoản trả mỗi tháng giảm khoảng {amount}.",
    changeUp: "Khoản trả mỗi tháng tăng khoảng {amount}.",
    changeNone: "Khoản trả mỗi tháng không đổi.",
    changeNoLoan: "Không còn khoản vay.",
    changeRemainder: "Phần còn lại mỗi tháng giảm khoảng {amount}.",
    changeRemainderUnknown: "Khoản vay không đổi; chưa tính được phần còn lại mỗi tháng.",
    barsTitle: "Khoản trả mỗi tháng trước và sau lần thử",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
    barBefore: "Trước khi thử",
    barAfter: "Sau khi thử",
    exactTitle: "Xem số chính xác (đồng)",
    exactCaption: "Số chính xác trước và sau lần thử",
    exactItem: "Khoản",
    exactBefore: "Trước",
    exactAfter: "Sau",
    exactFinanced: "Số tiền vay",
    exactPayment: "Khoản trả mỗi tháng",
    exactInterest: "Tổng lãi",
    exactMonths: "Số tháng thực tế",
    exactWithCar: "Còn lại mỗi tháng khi có xe",
    noLoanCell: "Không vay",
    monthsUnit: "tháng",
  },

  why: {
    downLess:
      "Trả trước thêm 50 triệu nên số tiền vay giảm 50 triệu: khoản trả mỗi tháng giảm khoảng {payment} và tổng lãi giảm khoảng {interest}. Đổi lại, bạn cần có sẵn thêm 50 triệu lúc mua.",
    downNoInterest:
      "Với lãi suất 0% không có tiền lãi; trả trước thêm 50 triệu chỉ làm khoản trả mỗi tháng giảm khoảng {payment}.",
    downCovers:
      "Trả trước thêm 50 triệu vừa đủ phần giá xe còn lại, nên không còn khoản vay: không có khoản trả nợ xe hằng tháng và không có lãi. Bạn cần có đủ tiền mặt cho toàn bộ phần đó lúc mua.",
    termLonger:
      "Kỳ hạn dài hơn nên khoản trả mỗi tháng giảm khoảng {payment}, nhưng bạn trả lâu hơn {months} tháng và tổng lãi tăng khoảng {interest}.",
    termNoInterest:
      "Với lãi suất 0% không có tiền lãi, nên kéo dài kỳ hạn chỉ làm khoản trả mỗi tháng nhỏ lại và thời gian trả dài thêm; tổng lãi vẫn là 0.",
    unchanged: "Với các số hiện tại, thay đổi này không làm khoản trả, tổng lãi hay thời gian trả dịch chuyển.",
    changedOther: "Các con số đã đổi theo lịch trả nợ mới. Xem số chính xác bên dưới.",
    runningMore:
      "Chi phí nuôi xe tăng {amount} mỗi tháng nên phần còn lại giảm đúng khoản đó. Khoản vay, tiền trả trước và tổng lãi không đổi.",
    runningLimited:
      "Khoản vay không đổi. Chưa nhập chi phí sinh hoạt thiết yếu nên công cụ chưa tính được phần còn lại.",
  },

  limits:
    "Giả định lãi suất không đổi suốt kỳ hạn; chưa tính phí trả nợ trước hạn hoặc phí hợp đồng nếu có.",

  /**
   * Board 04 (approved living infographic, 2026-09-29): the household month,
   * as a readable subtraction from the page's own ledger
   * (`compareVehicleBudget`). Purchase money is shown APART — a deposit is not
   * a monthly expense. No home framing.
   */
  flow: {
    artAlt: "Hình minh họa 3D một chiếc xe hatchback nhỏ màu trắng, một chiếc ví màu xanh và một cuốn lịch để bàn trống.",
    title: "Mua xe rồi, mỗi tháng còn bao nhiêu?",
    income: "Thu nhập thực nhận",
    essentials: "Chi thiết yếu",
    otherDebts: "Nợ khác",
    reserve: "Để dành",
    payment: "Trả góp xe",
    running: "Nuôi xe",
    result: "Còn lại mỗi tháng",
    resultShort: "Thiếu mỗi tháng",
    missingEssentials: "chưa nhập",
    missingPayment: "chưa tính được",
    headlineSurplus: "Còn lại khoảng {amount}/tháng",
    headlineZero: "Vừa đủ: còn lại 0 ₫/tháng",
    headlineShort: "Thiếu khoảng {amount}/tháng",
    headlineLimited: "Chưa tính được phần còn lại",
    headlineUnknown: "Chưa tính được khoản trả góp xe",
    noteSurplus: "Đây là số còn lại trước các khoản chi khác chưa nhập.",
    noteShort: "Theo số đã nhập, các khoản chi đang lớn hơn thu nhập.",
    noteLimited: "Hãy nhập chi phí thiết yếu để công cụ tính phần còn lại.",
    noteUnknown: "Sửa ô về xe hoặc khoản vay đang báo lỗi để có khoản trả góp.",
    runningExcluded: "Chưa gồm chi phí nuôi xe: ô đó đang là 0.",
    editRunning: "Sửa chi phí nuôi xe",
    upfrontTitle: "Lúc mua (không tính vào tháng)",
    roundedNote: "Số đã làm tròn; số chính xác ở phần kết quả.",
    /** The panel's standing condition: the debt chart is not a car value. */
    debtNotValue: "Số nợ còn lại không phải giá trị chiếc xe.",
  },

  /**
   * The integrated scene: the supplied image (a compact hatchback, a wallet,
   * a desk calendar and a car key) with live 2D marks from the page's own
   * state. The car never grows or shrinks; the debt is never its value.
   */
  scene: {
    badge: "Hình minh họa",
    alt: "Hình minh họa 3D một chiếc xe hatchback nhỏ không logo, ví tiền, cuốn lịch để bàn và chìa khóa xe.",
    title: "Tiền trả lúc mua, số vay và khoản trả mỗi tháng là ba phần khác nhau của cùng một chiếc xe.",
    priceTitle: "Giá xe",
    priceNote: "Là mốc 100% của thanh ở mục 2. Số nợ còn lại không phải giá trị chiếc xe.",
    upfrontTitle: "Tiền trả lúc mua và số vay",
    downLegend: "Tiền trả trước",
    tradeLegend: "Giá trị xe cũ",
    financedLegend: "Số tiền vay",
    monthlyTitle: "Mỗi tháng",
    monthlyValue: "{payment} mỗi tháng",
    monthlyMonths: "Trong {months} tháng; tổng lãi {interest}.",
    monthlyScale: "Thanh đo trên khoản trả lớn nhất trước và sau lần thử: {scale}.",
    noLoan: "Không có khoản vay",
    noLoanNote: "Tiền trả trước và xe cũ vừa đủ giá xe: không có khoản trả hằng tháng.",
    chipMonths: "{months} tháng",
    chipNoLoan: "Không vay",
    ghostNote: "Vạch đậm là mức trước lần thử gần nhất, cùng thang đo.",
    /** The one-line reading under the stage. `{trade}` is readingTrade or "". */
    reading: "Giá {price}: trả trước {down}{trade}, vay {financed}; trả {payment} mỗi tháng trong {months} tháng.",
    readingTrade: " và xe cũ {trade}",
    readingCash: "Giá {price}: trả trước {down}{trade}, đủ giá xe; không có khoản vay.",
    details: "Xem từng phần của hình",
    unknown: "Chưa vẽ được: có ô về xe hoặc khoản vay đang báo lỗi. Sửa ô đó để xem lại.",
    excess: "Chưa vẽ được: tiền trả trước và xe cũ đang lớn hơn giá xe. Hãy kiểm tra lại các ô đó.",
    fix: "Tới ô cần sửa",
  },

  /**
   * The debt-balance chart: what is still OWED, month by month, read off the
   * actual schedule. Not the car's value — no depreciation or resale is
   * modelled, and the assumption says so.
   */
  balanceChart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Dư nợ xe còn lại theo tháng",
    series: "Dư nợ — {label}",
    pathLabel: "khoản vay đang tính",
    payoffMarker: "Hết nợ ở tháng {month}",
    xAxis: "Tháng kể từ khi nhận nợ",
    yAxis: "Dư nợ còn lại ({unit})",
    summary:
      "Với {first}, nợ hết ở tháng {firstMonths}; {second} hết ở tháng {secondMonths}.",
    summaryOnePath:
      "Với {first}, dư nợ giảm dần tới 0 ở tháng {firstMonths}; tổng lãi cả kỳ hạn là {firstInterest}.",
    nominalNote: "Tổng lãi là số danh nghĩa, chưa trừ phí trả nợ trước hạn.",
    assumptions: [
      "Đây là số tiền còn nợ, không phải giá trị chiếc xe. Công cụ không dự báo xe mất giá hay giá bán lại.",
      "Lãi suất và kỳ hạn giả định không đổi; mỗi tháng trả cùng một khoản gốc và lãi.",
    ],
    tableCaption: "Dư nợ còn lại ở một số tháng",
    tableHint: "Tháng 0 là số tiền vay lúc nhận nợ.",
    monthColumn: "Tháng",
    unavailableReason: "Chưa có lịch trả nợ để vẽ dư nợ.",
    unavailableRecovery:
      "Hãy kiểm tra giá xe, tiền trả trước, lãi suất và kỳ hạn. Nếu tiền trả trước đã đủ giá xe thì không có khoản vay để vẽ.",
  },
} as const;
